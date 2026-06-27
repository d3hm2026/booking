"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireRole } from "@/lib/require-role";
import { revalidatePath } from "next/cache";
import type { Payment, PaymentType, DepositStatus } from "@/lib/types";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function getPaymentsForBooking(
  bookingId: string
): Promise<Payment[]> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", bookingId)
    .order("paid_date", { ascending: false });

  if (error) {
    throw new Error("فشل تحميل الدفعات: " + error.message);
  }

  return (data ?? []) as Payment[];
}

/**
 * يسجّل دفعة جديدة، ثم يعيد حساب payment_status للحجز تلقائياً
 * بمقارنة مجموع دفعات payment_type='booking' مع total_price.
 */
export async function addPaymentAction(
  formData: FormData
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const bookingId = formData.get("booking_id") as string;
  const paymentType = (formData.get("payment_type") as PaymentType) || "booking";
  const amount = Number(formData.get("amount"));
  const paidDate = formData.get("paid_date") as string;
  const bankName = (formData.get("bank_name") as string)?.trim() || null;
  const transferReference =
    (formData.get("transfer_reference") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!bookingId || !paidDate) {
    return { success: false, error: "تأكد من تعبئة كل الحقول المطلوبة" };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: "المبلغ غير صحيح" };
  }

  const { error: insertError } = await supabase.from("payments").insert({
    booking_id: bookingId,
    payment_type: paymentType,
    amount,
    paid_date: paidDate,
    bank_name: bankName,
    transfer_reference: transferReference,
    notes,
  });

  if (insertError) {
    return { success: false, error: "فشل تسجيل الدفعة" };
  }

  await supabase.from("booking_logs").insert({
    booking_id: bookingId,
    action: "payment_recorded",
    note: `تم تسجيل دفعة بمبلغ ${amount} ريال`,
  });

  if (paymentType === "booking") {
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("total_price")
      .eq("id", bookingId)
      .single();

    const { data: bookingPayments } = await supabase
      .from("payments")
      .select("amount")
      .eq("booking_id", bookingId)
      .eq("payment_type", "booking");

    if (!bookingError && booking) {
      const totalPaid = (bookingPayments ?? []).reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      const newStatus =
        totalPaid >= Number(booking.total_price)
          ? "paid"
          : totalPaid > 0
          ? "partial"
          : "unpaid";

      await supabase
        .from("bookings")
        .update({ payment_status: newStatus })
        .eq("id", bookingId);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  return { success: true };
}

/**
 * يحدّث حالة التأمين (إرجاع أو مصادرة) — يُسمح فقط إذا كانت الحالة الحالية held.
 */
export async function updateDepositStatusAction(
  bookingId: string,
  newStatus: DepositStatus
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("deposit_status")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: "لم يتم العثور على الحجز" };
  }

  if (booking.deposit_status !== "held") {
    return { success: false, error: "لا يوجد تأمين محجوز لهذا الحجز" };
  }

  const { error } = await supabase
    .from("bookings")
    .update({ deposit_status: newStatus })
    .eq("id", bookingId);

  if (error) {
    return { success: false, error: "فشل تحديث حالة التأمين" };
  }

  await supabase.from("booking_logs").insert({
    booking_id: bookingId,
    action: "deposit_" + newStatus,
    note: newStatus === "returned" ? "تم إرجاع التأمين للعميل" : "تم مصادرة التأمين",
  });

  revalidatePath("/admin/bookings");
  return { success: true };
}
