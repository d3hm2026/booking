"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Owner } from "@/lib/types";
import type { UnitWithOwner } from "@/app/actions/units";
import { deleteUnitAction } from "@/app/actions/units";
import { UnitDialog } from "./unit-dialog";
import { PricingDialog } from "./pricing-dialog";

const STATUS_LABELS: Record<string, string> = {
  active: "نشطة",
  inactive: "غير نشطة",
  maintenance: "صيانة",
};

interface UnitsTableProps {
  units: UnitWithOwner[];
  owners: Owner[];
}

export function UnitsTable({ units, owners }: UnitsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingUnit, setEditingUnit] = useState<UnitWithOwner | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [pricingUnit, setPricingUnit] = useState<UnitWithOwner | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleDelete(unitId: string) {
    if (!confirm("هل تريد حذف هذه الوحدة؟")) return;
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteUnitAction(unitId);
      if (result.success) {
        router.refresh();
      } else {
        setDeleteError(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-medium text-gray-700">الوحدات</h2>
        <button
          onClick={() => setShowAddDialog(true)}
          className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium"
        >
          إضافة وحدة
        </button>
      </div>

      {deleteError && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">
          {deleteError}
        </p>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-right px-3 py-2 font-medium">الاسم</th>
              <th className="text-right px-3 py-2 font-medium">المالك</th>
              <th className="text-right px-3 py-2 font-medium">الحالة</th>
              <th className="text-right px-3 py-2 font-medium">السعة</th>
              <th className="text-right px-3 py-2 font-medium">الموقع</th>
              <th className="text-right px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {units.map((unit) => (
              <tr key={unit.id}>
                <td className="px-3 py-2 font-medium">{unit.name}</td>
                <td className="px-3 py-2 text-gray-600">
                  {unit.owner?.name ?? "—"}
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {STATUS_LABELS[unit.status] ?? unit.status}
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {unit.capacity ?? "—"}
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {unit.location ?? "—"}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setPricingUnit(unit)}
                      className="text-blue-600 hover:underline"
                    >
                      التسعير
                    </button>
                    <button
                      onClick={() => setEditingUnit(unit)}
                      className="text-gray-600 hover:underline"
                    >
                      تعديل
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleDelete(unit.id)}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {units.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-sm">
            لا توجد وحدات مضافة بعد
          </div>
        )}
      </div>

      {showAddDialog && (
        <UnitDialog
          owners={owners}
          onClose={() => setShowAddDialog(false)}
        />
      )}

      {editingUnit && (
        <UnitDialog
          owners={owners}
          unit={editingUnit}
          onClose={() => setEditingUnit(null)}
        />
      )}

      {pricingUnit && (
        <PricingDialog
          unitId={pricingUnit.id}
          unitName={pricingUnit.name}
          onClose={() => setPricingUnit(null)}
        />
      )}
    </div>
  );
}
