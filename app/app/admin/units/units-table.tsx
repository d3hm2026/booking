"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AppUser, Owner } from "@/lib/types";
import type { UnitWithOwner } from "@/app/actions/units";
import { deleteUnitAction } from "@/app/actions/units";
import { UnitDialog } from "./unit-dialog";
import { PricingDialog } from "./pricing-dialog";
import { BlockDialog } from "./block-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Ban,
  Building2,
  MapPin,
  Users as UsersIcon,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; tone: "green" | "gray" | "amber" }> = {
  active: { label: "نشطة", tone: "green" },
  inactive: { label: "غير نشطة", tone: "gray" },
  maintenance: { label: "صيانة", tone: "amber" },
};

interface UnitsTableProps {
  units: UnitWithOwner[];
  owners: Owner[];
  cleaners: AppUser[];
}

export function UnitsTable({ units, owners, cleaners }: UnitsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingUnit, setEditingUnit] = useState<UnitWithOwner | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [pricingUnit, setPricingUnit] = useState<UnitWithOwner | null>(null);
  const [blockingUnit, setBlockingUnit] = useState<UnitWithOwner | null>(null);

  function handleDelete(unitId: string) {
    if (!confirm("هل تريد حذف هذه الوحدة؟")) return;
    startTransition(async () => {
      const result = await deleteUnitAction(unitId);
      if (result.success) {
        toast.success("تم حذف الوحدة");
        router.refresh();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">قائمة الوحدات</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="size-4" />
          إضافة وحدة
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="text-right px-4 py-3 font-medium">الاسم</th>
              <th className="text-right px-4 py-3 font-medium">المالك</th>
              <th className="text-right px-4 py-3 font-medium">الحالة</th>
              <th className="text-right px-4 py-3 font-medium">السعة</th>
              <th className="text-right px-4 py-3 font-medium">الموقع</th>
              <th className="text-right px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {units.map((unit) => {
              const status = STATUS_CONFIG[unit.status] ?? {
                label: unit.status,
                tone: "gray" as const,
              };
              return (
                <tr key={unit.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-gray-400" />
                      {unit.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {unit.owner?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {unit.capacity ? (
                      <span className="flex items-center gap-1">
                        <UsersIcon className="size-3.5 text-gray-400" />
                        {unit.capacity}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {unit.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5 text-gray-400" />
                        {unit.location}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => setPricingUnit(unit)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="التسعير"
                      >
                        <Tag className="size-4" />
                      </button>
                      <button
                        onClick={() => setBlockingUnit(unit)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        title="حجب"
                      >
                        <Ban className="size-4" />
                      </button>
                      <button
                        onClick={() => setEditingUnit(unit)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title="تعديل"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        disabled={isPending}
                        onClick={() => handleDelete(unit.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        title="حذف"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>

        {units.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">
            لا توجد وحدات مضافة بعد
          </div>
        )}
      </Card>

      {showAddDialog && (
        <UnitDialog
          owners={owners}
          cleaners={cleaners}
          onClose={() => setShowAddDialog(false)}
        />
      )}

      {editingUnit && (
        <UnitDialog
          owners={owners}
          cleaners={cleaners}
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

      {blockingUnit && (
        <BlockDialog
          unitId={blockingUnit.id}
          unitName={blockingUnit.name}
          onClose={() => setBlockingUnit(null)}
        />
      )}
    </div>
  );
}
