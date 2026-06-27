"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UnitBlock } from "@/lib/types";
import {
  getUnitBlocks,
  createUnitBlockAction,
  deleteUnitBlockAction,
} from "@/app/actions/units";
import { todayString } from "@/lib/date-utils";
import { Dialog } from "@/components/ui/dialog";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Trash2, Ban } from "lucide-react";

interface BlockDialogProps {
  unitId: string;
  unitName: string;
  onClose: () => void;
}

export function BlockDialog({ unitId, unitName, onClose }: BlockDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [blocks, setBlocks] = useState<UnitBlock[]>([]);
  const [loading, setLoading] = useState(true);

  function loadBlocks() {
    getUnitBlocks(unitId)
      .then(setBlocks)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("unit_id", unitId);

    startTransition(async () => {
      const result = await createUnitBlockAction(formData);
      if (result.success) {
        toast.success("تم حجب الوحدة لهذه الفترة");
        loadBlocks();
        router.refresh();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  function handleDelete(blockId: string) {
    if (!confirm("هل تريد إلغاء هذا الحجب؟")) return;
    startDeleting(async () => {
      const result = await deleteUnitBlockAction(blockId);
      if (result.success) {
        toast.success("تم إلغاء الحجب");
        loadBlocks();
        router.refresh();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <Dialog title={`حجب الوحدة — ${unitName}`} onClose={onClose}>
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
        <Field label="السبب (اختياري)">
          <input
            name="reason"
            type="text"
            placeholder="صيانة، استخدام شخصي..."
            className={inputClass}
          />
        </Field>

        <Button type="submit" loading={isPending} className="w-full">
          {isPending ? "جارٍ الحفظ..." : "حجب هذه الفترة"}
        </Button>
      </form>

      <div className="border-t border-gray-200 pt-3">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
          <Ban className="size-4 text-gray-400" />
          فترات الحجب الحالية
        </h3>
        {loading ? (
          <p className="text-sm text-gray-400">جارٍ التحميل...</p>
        ) : blocks.length === 0 ? (
          <p className="text-sm text-gray-400">لا توجد فترات محجوبة</p>
        ) : (
          <div className="max-h-48 overflow-y-auto text-sm divide-y divide-gray-100 rounded-lg border border-gray-100">
            {blocks.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-3 py-1.5">
                <div>
                  <span className="text-gray-700" dir="ltr">
                    {b.start_date} → {b.end_date}
                  </span>
                  {b.reason && (
                    <span className="text-gray-400"> — {b.reason}</span>
                  )}
                </div>
                <button
                  disabled={isDeleting}
                  onClick={() => handleDelete(b.id)}
                  className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  title="إلغاء الحجب"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
