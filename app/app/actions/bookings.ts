"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireRole } from "@/lib/require-role";
import { revalidatePath } from "next/cache";
import type { Unit, Booking } from "@/lib/types";

export interface CalendarData {
  units: Unit[];
  bookings: Booking[];
}

/**
 * يجلب كل الوحدات النشطة + كل الحجوزات (غير الملغاة) التي تتقاطع
 * مع نطاق تاريخ معيّن، لعرضها في شاشة التقويم.
 */
export async function getCalendarData(
  startDate: string,
  endDate: string
): Promise<CalendarData> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("*")
    .order("name", { ascending: true });

  if (unitsError) {
    throw new Error("فشل تحميل الوحدات: " + unitsError.message);
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("*")
    .neq("booking_status", "cancelled")
    .lt("check_in", endDate)
    .gt("check_out", startDate);

  if (bookingsError) {
    throw new Error("فشل تحميل الحجوزات: " + bookingsError.message);
  }

  return {
    units: (units ?? []) as Unit[],
    bookings: (bookings ?? []) as Booking[],
  };
}

export interface AddBookingResult {
  success: boolean;
  error?: string;
}

/**
 * يضيف حجزاً جديداً. يعتمد على trigger قاعدة البيانات (check_booking_conflict)
 * لرفض أي تداخل تواريخ تلقائياً، ويترجم رسالة الخطأ لشيء مفهوم للمستخدم.
 */
export async function addBookingAction(
  formData: FormData
): Promise<AddBookingResult> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const unitId = formData.get("unit_id") as string;
  const guestName = (formData.get("guest_name") as string)?.trim();
  const guestPhone = (formData.get("guest_phone") as string)?.trim();
  const checkIn = formData.get("check_in") as string;
  const checkOut = formData.get("check_out") as string;
  const totalPrice = Number(formData.get("total_price"));
  const depositAmount = Number(formData.get("deposit_amount") || 0);
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!unitId || !guestName || !guestPhone || !checkIn || !checkOut) {
    return { success: false, error: "تأكد من تعبئة كل الحقول المطلوبة" };
  }

  if (checkOut <= checkIn) {
    return {
      success: false,
      error: "تاريخ الخروج يجب أن يكون بعد تاريخ الدخول",
    };
  }

  if (!Number.isFinite(totalPrice) || totalPrice < 0) {
    return { success: false, error: "مبلغ الحجز غير صحيح" };
  }

  const { error } = await supabase.from("bookings").insert({
    unit_id: unitId,
    guest_name: guestName,
    guest_phone: guestPhone,
    check_in: checkIn,
    check_out: checkOut,
    total_price: totalPrice,
    deposit_amount: depositAmount > 0 ? depositAmount : 0,
    deposit_status: depositAmount > 0 ? "held" : "none",
    payment_status: "unpaid",
    booking_status: "confirmed",
    source: "whatsapp",
    notes,
  });

  if (error) {
    // رسائل قاعدة البيانات الخاصة بفحص التعارض تأتي بنص عربي واضح أصلاً
    if (error.message.includes("تعارض")) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "حدث خطأ أثناء حفظ الحجز" };
  }

  revalidatePath("/admin");
  return { success: true };
}
