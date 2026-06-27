"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Unit } from "@/lib/types";
import { addExpenseAction } from "@/app/actions/expenses";
import { todayString } from "@/lib/date-utils";
import { Dialog } from "@/components/ui/dialog";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["صيانة", "فواتير", "تنظيف", "أخرى"];

interface ExpenseDialogProps {
  units: Unit[];
  onClose: () => void;
}

export function ExpenseDialog({ units, onClose }: ExpenseDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await addExpenseAction(formData);
      if (result.success) {
        toast.success("تم إضافة المصروف");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <Dialog title="إضافة مصروف" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="الوحدة">
          <select name="unit_id" required className={inputClass}>
            <option value="">اختر الوحدة</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="الفئة">
            <select name="category" required className={inputClass} defaultValue="">
              <option value="" disabled>
                اختر الفئة
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="التاريخ">
            <input
              name="expense_date"
              type="date"
              required
              defaultValue={todayString()}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="المبلغ (ريال)">
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            required
            dir="ltr"
            className={inputClass}
          />
        </Field>

        <Field label="ملاحظات (اختياري)">
          <textarea
            name="notes"
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <div className="flex gap-2 pt-1">
          <Button type="submit" loading={isPending} className="flex-1">
            {isPending ? "جارٍ الحفظ..." : "حفظ المصروف"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
