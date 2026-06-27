"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addBookingAction } from "@/app/actions/bookings";
import { addDays } from "@/lib/date-utils";

interface AddBookingDialogProps {
  unitId: string;
  unitName: string;
  defaultDate: string;
  onClose: () => void;
}

export function AddBookingDialog({
  unitId,
  unitName,
  defaultDate,
  onClose,
}: AddBookingDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("unit_id", unitId);

    startTransition(async () => {
      const result = await addBookingAction(formData);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">حجز جديد — {unitName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                تاريخ الدخول
              </label>
              <input
                name="check_in"
                type="date"
                required
                defaultValue={defaultDate}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                تاريخ الخروج
              </label>
              <input
                name="check_out"
                type="date"
                required
                defaultValue={addDays(defaultDate, 1)}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              اسم العميل
            </label>
            <input
              name="guest_name"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              رقم جوال العميل
            </label>
            <input
              name="guest_phone"
              type="tel"
              inputMode="numeric"
              required
              dir="ltr"
              className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                مبلغ الحجز (ريال)
              </label>
              <input
                name="total_price"
                type="number"
                min="0"
                step="0.01"
                required
                dir="ltr"
                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                مبلغ التأمين (اختياري)
              </label>
              <input
                name="deposit_amount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={0}
                dir="ltr"
                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              ملاحظات (اختياري)
            </label>
            <textarea
              name="notes"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {isPending ? "جارٍ الحفظ..." : "حفظ الحجز"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 rounded-lg border border-gray-300 text-sm font-medium"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
