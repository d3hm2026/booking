"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Owner } from "@/lib/types";
import type { UnitWithOwner } from "@/app/actions/units";
import {
  createUnitAction,
  updateUnitAction,
  createOwnerAction,
} from "@/app/actions/units";

interface UnitDialogProps {
  owners: Owner[];
  unit?: UnitWithOwner;
  onClose: () => void;
}

export function UnitDialog({ owners, unit, onClose }: UnitDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showNewOwner, setShowNewOwner] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [isCreatingOwner, startCreatingOwner] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = unit
        ? await updateUnitAction(unit.id, formData)
        : await createUnitAction(formData);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  function handleCreateOwner(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOwnerError(null);
    const formData = new FormData(e.currentTarget);

    startCreatingOwner(async () => {
      const result = await createOwnerAction(formData);
      if (result.success && result.ownerId) {
        setNewOwnerId(result.ownerId);
        setShowNewOwner(false);
        router.refresh();
      } else {
        setOwnerError(result.error ?? "حدث خطأ غير متوقع");
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
          <h2 className="text-lg font-semibold">
            {unit ? "تعديل وحدة" : "إضافة وحدة جديدة"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              اسم الوحدة
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={unit?.name}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">المالك</label>
              <button
                type="button"
                onClick={() => setShowNewOwner((v) => !v)}
                className="text-xs text-blue-600 hover:underline"
              >
                {showNewOwner ? "إلغاء" : "+ مالك جديد"}
              </button>
            </div>

            {!showNewOwner && (
              <select
                name="owner_id"
                defaultValue={newOwnerId ?? unit?.owner_id ?? ""}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
              >
                <option value="">بدون مالك</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
                {newOwnerId &&
                  !owners.some((o) => o.id === newOwnerId) && (
                    <option value={newOwnerId}>(مالك جديد)</option>
                  )}
              </select>
            )}

            {showNewOwner && (
              <form
                onSubmit={handleCreateOwner}
                className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50"
              >
                <input
                  name="name"
                  type="text"
                  placeholder="اسم المالك"
                  required
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm"
                />
                <input
                  name="phone"
                  type="tel"
                  dir="ltr"
                  placeholder="رقم الجوال"
                  required
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm"
                />
                <input
                  name="commission_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  dir="ltr"
                  placeholder="نسبة العمولة % (اختياري)"
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm"
                />
                {ownerError && (
                  <p className="text-xs text-red-600">{ownerError}</p>
                )}
                <button
                  type="submit"
                  disabled={isCreatingOwner}
                  className="w-full bg-gray-900 text-white rounded-lg py-1.5 text-sm font-medium disabled:opacity-50"
                >
                  {isCreatingOwner ? "جارٍ الحفظ..." : "حفظ المالك"}
                </button>
              </form>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                الحالة
              </label>
              <select
                name="status"
                defaultValue={unit?.status ?? "active"}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
              >
                <option value="active">نشطة</option>
                <option value="inactive">غير نشطة</option>
                <option value="maintenance">صيانة</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                السعة (اختياري)
              </label>
              <input
                name="capacity"
                type="number"
                min="0"
                dir="ltr"
                defaultValue={unit?.capacity ?? ""}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              الموقع (اختياري)
            </label>
            <input
              name="location"
              type="text"
              defaultValue={unit?.location ?? ""}
              className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              ملاحظات (اختياري)
            </label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={unit?.notes ?? ""}
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
              {isPending ? "جارٍ الحفظ..." : "حفظ"}
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
