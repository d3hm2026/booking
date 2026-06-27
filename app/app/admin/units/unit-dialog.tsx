"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Owner } from "@/lib/types";
import type { UnitWithOwner } from "@/app/actions/units";
import {
  createUnitAction,
  updateUnitAction,
  createOwnerAction,
} from "@/app/actions/units";
import { Dialog } from "@/components/ui/dialog";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { UserPlus2, X } from "lucide-react";

interface UnitDialogProps {
  owners: Owner[];
  unit?: UnitWithOwner;
  onClose: () => void;
}

export function UnitDialog({ owners, unit, onClose }: UnitDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showNewOwner, setShowNewOwner] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);
  const [isCreatingOwner, startCreatingOwner] = useTransition();
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerPhone, setNewOwnerPhone] = useState("");
  const [newOwnerCommission, setNewOwnerCommission] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = unit
        ? await updateUnitAction(unit.id, formData)
        : await createUnitAction(formData);
      if (result.success) {
        toast.success(unit ? "تم تعديل الوحدة" : "تم إضافة الوحدة");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  function handleCreateOwner() {
    if (!newOwnerName.trim() || !newOwnerPhone.trim()) {
      toast.error("أدخل اسم المالك ورقم جواله");
      return;
    }

    const formData = new FormData();
    formData.set("name", newOwnerName.trim());
    formData.set("phone", newOwnerPhone.trim());
    formData.set("commission_percent", newOwnerCommission || "0");

    startCreatingOwner(async () => {
      const result = await createOwnerAction(formData);
      if (result.success && result.ownerId) {
        setNewOwnerId(result.ownerId);
        setShowNewOwner(false);
        toast.success("تم إضافة المالك");
        router.refresh();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <Dialog title={unit ? "تعديل وحدة" : "إضافة وحدة جديدة"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="اسم الوحدة">
          <input
            name="name"
            type="text"
            required
            defaultValue={unit?.name}
            className={inputClass}
          />
        </Field>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              المالك
            </label>
            <button
              type="button"
              onClick={() => setShowNewOwner((v) => !v)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {showNewOwner ? (
                <>
                  <X className="size-3.5" />
                  إلغاء
                </>
              ) : (
                <>
                  <UserPlus2 className="size-3.5" />
                  مالك جديد
                </>
              )}
            </button>
          </div>

          {!showNewOwner && (
            <select
              name="owner_id"
              defaultValue={newOwnerId ?? unit?.owner_id ?? ""}
              className={inputClass}
            >
              <option value="">بدون مالك</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
              {newOwnerId && !owners.some((o) => o.id === newOwnerId) && (
                <option value={newOwnerId}>(مالك جديد)</option>
              )}
            </select>
          )}

          {showNewOwner && (
            <div className="border border-indigo-100 rounded-lg p-3 space-y-2 bg-indigo-50/40">
              <input
                type="text"
                value={newOwnerName}
                onChange={(e) => setNewOwnerName(e.target.value)}
                placeholder="اسم المالك"
                required
                className={`${inputClass} bg-white`}
              />
              <input
                type="tel"
                dir="ltr"
                value={newOwnerPhone}
                onChange={(e) => setNewOwnerPhone(e.target.value)}
                placeholder="رقم الجوال"
                required
                className={`${inputClass} bg-white`}
              />
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                dir="ltr"
                value={newOwnerCommission}
                onChange={(e) => setNewOwnerCommission(e.target.value)}
                placeholder="نسبة العمولة % (اختياري)"
                className={`${inputClass} bg-white`}
              />
              <Button
                type="button"
                size="sm"
                loading={isCreatingOwner}
                onClick={handleCreateOwner}
                className="w-full"
              >
                {isCreatingOwner ? "جارٍ الحفظ..." : "حفظ المالك"}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="الحالة">
            <select
              name="status"
              defaultValue={unit?.status ?? "active"}
              className={inputClass}
            >
              <option value="active">نشطة</option>
              <option value="inactive">غير نشطة</option>
              <option value="maintenance">صيانة</option>
            </select>
          </Field>
          <Field label="السعة (اختياري)">
            <input
              name="capacity"
              type="number"
              min="0"
              dir="ltr"
              defaultValue={unit?.capacity ?? ""}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="الموقع (اختياري)">
          <input
            name="location"
            type="text"
            defaultValue={unit?.location ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="ملاحظات (اختياري)">
          <textarea
            name="notes"
            rows={2}
            defaultValue={unit?.notes ?? ""}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <div className="flex gap-2 pt-1">
          <Button type="submit" loading={isPending} className="flex-1">
            {isPending ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
