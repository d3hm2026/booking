"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BookingWithUnit } from "@/app/actions/bookings";
import { updateBookingAction, cancelBookingAction } from "@/app/actions/bookings";
import { Dialog } from "@/components/ui/dialog";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BookingDetailDialogProps {
  booking: BookingWithUnit;
  onClose: () => void;
}

export function BookingDetailDialog({ booking, onClose }: BookingDetailDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCancelling, startCancelling] = useTransition();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  const isConfirmed = booking.booking_status === "confirmed";

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
