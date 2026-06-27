"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UnitDailyPrice } from "@/lib/types";
import { upsertDailyPricesAction, getUnitPrices } from "@/app/actions/units";
import { addDays, todayString } from "@/lib/date-utils";

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
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("unit_id", unitId);

    startTransition(async () => {
      const result = await upsertDailyPricesAction(formData);
      if (result.success) {
        const today = todayString();
        const updated = await getUnitPrices(unitId, today, addDays(today, 60));
        setPrices(updated);
        router.refresh();
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
          <h2 className="text-lg font-semibold">تسعير — {unitName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">من</label>
              <input
                name="start_date"
                type="date"
                required
                defaultValue={todayString()}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">إلى</label>
              <input
                name="end_date"
                type="date"
                required
                defaultValue={todayString()}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              السعر لكل يوم (ريال)
            </label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              dir="ltr"
              className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {isPending ? "جارٍ الحفظ..." : "حفظ السعر للنطاق"}
          </button>
        </form>

        <div className="border-t border-gray-200 pt-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            الأسعار القادمة (٦٠ يوم)
          </h3>
          {loading ? (
            <p className="text-sm text-gray-400">جارٍ التحميل...</p>
          ) : prices.length === 0 ? (
            <p className="text-sm text-gray-400">لا توجد أسعار مضبوطة</p>
          ) : (
            <div className="max-h-48 overflow-y-auto text-sm divide-y divide-gray-100">
              {prices.map((p) => (
                <div key={p.id} className="flex justify-between py-1.5">
                  <span className="text-gray-600">{p.price_date}</span>
                  <span className="font-medium" dir="ltr">
                    {p.price} ريال
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
