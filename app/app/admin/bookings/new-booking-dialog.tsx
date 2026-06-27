"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UnitWithOwner } from "@/app/actions/units";
import { addBookingAction } from "@/app/actions/bookings";
import { addDays, todayString } from "@/lib/date-utils";
import { Dialog } from "@/components/ui/dialog";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

interface NewBookingDialogProps {
  units: UnitWithOwner[];
  onClose: () => void;
}

export function NewBookingDialog({ units, onClose }: NewBookingDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await addBookingAction(formData);
      if (result.success) {
        toast.success("تم حفظ الحجز بنجاح");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <Dialog title="إنشاء حجز جديد" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="الوحدة">
          <select name="unit_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              اختر الوحدة
            </option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="تاريخ الدخول">
            <input
              name="check_in"
              type="date"
              required
              defaultValue={todayString()}
              className={inputClass}
            />
          </Field>
          <Field label="تاريخ الخروج">
            <input
              name="check_out"
              type="date"
              required
              defaultValue={addDays(todayString(), 1)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="اسم العميل">
          <input name="guest_name" type="text" required className={inputClass} />
        </Field>

        <Field label="رقم جوال العميل">
          <input
            name="guest_phone"
            type="tel"
            inputMode="numeric"
            required
            dir="ltr"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="مبلغ الحجز (ريال)">
            <input
              name="total_price"
              type="number"
              min="0"
              step="0.01"
              required
              dir="ltr"
              className={inputClass}
            />
          </Field>
          <Field label="مبلغ التأمين (اختياري)">
            <input
              name="deposit_amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={0}
              dir="ltr"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="ملاحظات (اختياري)">
          <textarea
            name="notes"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <div className="flex gap-2 pt-1">
          <Button type="submit" loading={isPending} className="flex-1">
            {isPending ? "جارٍ الحفظ..." : "حفظ الحجز"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
