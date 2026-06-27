"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UnitDailyPrice } from "@/lib/types";
import { upsertDailyPricesAction, getUnitPrices } from "@/app/actions/units";
import { addDays, todayString } from "@/lib/date-utils";
import { Dialog } from "@/components/ui/dialog";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CalendarRange } from "lucide-react";

interface PricingDialogProps {
  unitId: string;
  unitName: string;
  onClose: () => void;
}

export function PricingDialog({
  unitId,
  unitName,
  onClose,
}: PricingDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [prices, setPrices] = useState<UnitDailyPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = todayString();
    getUnitPrices(unitId, today, addDays(today, 60))
      .then(setPrices)
      .finally(() => setLoading(false));
  }, [unitId]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("unit_id", unitId);

    startTransition(async () => {
      const result = await upsertDailyPricesAction(formData);
      if (result.success) {
        toast.success("تم حفظ التسعير");
        const today = todayString();
        const updated = await getUnitPrices(unitId, today, addDays(today, 60));
        setPrices(updated);
        router.refresh();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <Dialog title={`تسعير — ${unitName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="من">
            <input
              name="start_date"
              type="date"
              required
              defaultValue={todayString()}
              className={inputClass}
            />
          </Field>
          <Field label="إلى">
            <input
              name="end_date"
              type="date"
              required
              defaultValue={todayString()}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="السعر لكل يوم (ريال)">
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            dir="ltr"
            className={inputClass}
          />
        </Field>

        <Button type="submit" loading={isPending} className="w-full">
          {isPending ? "جارٍ الحفظ..." : "حفظ السعر للنطاق"}
        </Button>
      </form>

      <div className="border-t border-gray-200 pt-3">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
          <CalendarRange className="size-4 text-gray-400" />
          الأسعار القادمة (٦٠ يوم)
        </h3>
        {loading ? (
          <p className="text-sm text-gray-400">جارٍ التحميل...</p>
        ) : prices.length === 0 ? (
          <p className="text-sm text-gray-400">لا توجد أسعار مضبوطة</p>
        ) : (
          <div className="max-h-48 overflow-y-auto text-sm divide-y divide-gray-100 rounded-lg border border-gray-100">
            {prices.map((p) => (
              <div
                key={p.id}
                className="flex justify-between px-3 py-1.5 hover:bg-gray-50"
              >
                <span className="text-gray-600">{p.price_date}</span>
                <span className="font-medium text-gray-900" dir="ltr">
                  {p.price} ريال
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
