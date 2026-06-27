"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BookingWithUnit } from "@/app/actions/bookings";
import { updateBookingAction, cancelBookingAction } from "@/app/actions/bookings";
import { getPaymentsForBooking, addPaymentAction } from "@/app/actions/payments";
import type { Payment, PaymentStatus } from "@/lib/types";
import { Dialog } from "@/components/ui/dialog";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { todayString } from "@/lib/date-utils";
import { Wallet } from "lucide-react";

interface BookingDetailDialogProps {
  booking: BookingWithUnit;
  onClose: () => void;
}

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, { label: string; tone: "green" | "amber" | "gray" }> = {
  paid: { label: "مدفوع بالكامل", tone: "green" },
  partial: { label: "دفعة جزئية", tone: "amber" },
  unpaid: { label: "غير مدفوع", tone: "gray" },
};

export function BookingDetailDialog({ booking, onClose }: BookingDetailDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCancelling, startCancelling] = useTransition();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(booking.payment_status);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [isAddingPayment, startAddingPayment] = useTransition();

  useEffect(() => {
    getPaymentsForBooking(booking.id)
      .then(setPayments)
      .finally(() => setLoadingPayments(false));
  }, [booking.id]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateBookingAction(booking.id, formData);
      if (result.success) {
        toast.success("تم حفظ التعديلات");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  function handleCancel() {
    startCancelling(async () => {
      const result = await cancelBookingAction(booking.id);
      if (result.success) {
        toast.success("تم إلغاء الحجز");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  function handleAddPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("booking_id", booking.id);
    formData.set("payment_type", "booking");

    startAddingPayment(async () => {
      const result = await addPaymentAction(formData);
      if (result.success) {
        toast.success("تم تسجيل الدفعة");
        const updated = await getPaymentsForBooking(booking.id);
        setPayments(updated);
        const totalPaid = updated
          .filter((p) => p.payment_type === "booking")
          .reduce((sum, p) => sum + Number(p.amount), 0);
        setPaymentStatus(
          totalPaid >= Number(booking.total_price)
            ? "paid"
            : totalPaid > 0
            ? "partial"
            : "unpaid"
        );
        setShowAddPayment(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  const isConfirmed = booking.booking_status === "confirmed";
  const totalPaid = payments
    .filter((p) => p.payment_type === "booking")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Number(booking.total_price) - totalPaid;
  const statusInfo = PAYMENT_STATUS_LABELS[paymentStatus];

  return (
    <Dialog
      title={`تفاصيل الحجز — ${booking.unit?.name ?? ""}`}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="تاريخ الدخول">
            <input
              name="check_in"
              type="date"
              required
              defaultValue={booking.check_in}
              disabled={!isConfirmed}
              className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
            />
          </Field>
          <Field label="تاريخ الخروج">
            <input
              name="check_out"
              type="date"
              required
              defaultValue={booking.check_out}
              disabled={!isConfirmed}
              className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
            />
          </Field>
        </div>

        <Field label="اسم العميل">
          <input
            name="guest_name"
            type="text"
            required
            defaultValue={booking.guest_name}
            disabled={!isConfirmed}
            className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
          />
        </Field>

        <Field label="رقم جوال العميل">
          <input
            name="guest_phone"
            type="tel"
            inputMode="numeric"
            required
            dir="ltr"
            defaultValue={booking.guest_phone}
            disabled={!isConfirmed}
            className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
          />
        </Field>

        <Field label="مبلغ الحجز (ريال)">
          <input
            name="total_price"
            type="number"
            min="0"
            step="0.01"
            required
            dir="ltr"
            defaultValue={booking.total_price}
            disabled={!isConfirmed}
            className={`${inputClass} disabled:bg-gray-50 disabled:text-gray-400`}
          />
        </Field>

        <Field label="ملاحظات (اختياري)">
          <textarea
            name="notes"
            rows={2}
            defaultValue={booking.notes ?? ""}
            disabled={!isConfirmed}
            className={`${inputClass} resize-none disabled:bg-gray-50 disabled:text-gray-400`}
          />
        </Field>

        {!isConfirmed && (
          <p className="text-xs text-gray-400">
            هذا الحجز{" "}
            <Badge tone={booking.booking_status === "cancelled" ? "red" : "green"}>
              {booking.booking_status === "cancelled" ? "ملغي" : "منتهي"}
            </Badge>{" "}
            ولا يمكن تعديله
          </p>
        )}

        {isConfirmed && (
          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={isPending} className="flex-1">
              {isPending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        )}
      </form>

      <div className="border-t border-gray-200 mt-4 pt-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Wallet className="size-4 text-gray-400" />
            الدفعات
          </h3>
          <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
        </div>

        <p className="text-xs text-gray-500 mb-2" dir="ltr">
          <span className="flex justify-end gap-3">
            <span>مدفوع: {totalPaid.toLocaleString("ar")} ريال</span>
            <span>المتبقي: {Math.max(remaining, 0).toLocaleString("ar")} ريال</span>
          </span>
        </p>

        {loadingPayments ? (
          <p className="text-sm text-gray-400">جارٍ التحميل...</p>
        ) : payments.length > 0 ? (
          <div className="max-h-32 overflow-y-auto text-sm divide-y divide-gray-100 rounded-lg border border-gray-100 mb-2">
            {payments.map((p) => (
              <div key={p.id} className="flex justify-between px-3 py-1.5">
                <span className="text-gray-500" dir="ltr">
                  {p.paid_date} {p.bank_name ? `— ${p.bank_name}` : ""}
                </span>
                <span className="font-medium text-gray-900" dir="ltr">
                  {Number(p.amount).toLocaleString("ar")} ريال
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-2">لا توجد دفعات مسجلة</p>
        )}

        {isConfirmed && remaining > 0 && (
          <>
            {!showAddPayment ? (
              <button
                type="button"
                onClick={() => setShowAddPayment(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + تسجيل دفعة
              </button>
            ) : (
              <form
                onSubmit={handleAddPayment}
                className="border border-indigo-100 rounded-lg p-3 space-y-2 bg-indigo-50/40"
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    dir="ltr"
                    placeholder="المبلغ"
                    className={`${inputClass} bg-white`}
                  />
                  <input
                    name="paid_date"
                    type="date"
                    required
                    defaultValue={todayString()}
                    className={`${inputClass} bg-white`}
                  />
                </div>
                <input
                  name="bank_name"
                  type="text"
                  placeholder="البنك (اختياري)"
                  className={`${inputClass} bg-white`}
                />
                <input
                  name="transfer_reference"
                  type="text"
                  dir="ltr"
                  placeholder="رقم التحويل (اختياري)"
                  className={`${inputClass} bg-white`}
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" loading={isAddingPayment} className="flex-1">
                    حفظ الدفعة
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddPayment(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            )}
          </>
        )}
      </div>

      {isConfirmed && (
        <div className="border-t border-gray-200 mt-4 pt-3">
          {!showCancelConfirm ? (
            <button
              type="button"
              onClick={() => setShowCancelConfirm(true)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              إلغاء الحجز
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 flex-1">
                هل تريد تأكيد إلغاء هذا الحجز؟
              </p>
              <Button variant="danger" size="sm" loading={isCancelling} onClick={handleCancel}>
                نعم، إلغاء
              </Button>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setShowCancelConfirm(false)}
              >
                تراجع
              </Button>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
}
