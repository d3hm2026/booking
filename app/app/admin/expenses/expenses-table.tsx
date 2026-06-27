"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Unit } from "@/lib/types";
import type { ExpenseWithUnit } from "@/app/actions/expenses";
import { deleteExpenseAction } from "@/app/actions/expenses";
import { ExpenseDialog } from "./expense-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Building2 } from "lucide-react";

interface ExpensesTableProps {
  expenses: ExpenseWithUnit[];
  units: Unit[];
}

export function ExpensesTable({ expenses, units }: ExpensesTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAddDialog, setShowAddDialog] = useState(false);

  function handleDelete(expenseId: string) {
    if (!confirm("هل تريد حذف هذا المصروف؟")) return;
    startTransition(async () => {
      const result = await deleteExpenseAction(expenseId);
      if (result.success) {
        toast.success("تم حذف المصروف");
        router.refresh();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">سجل المصروفات</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="size-4" />
          إضافة مصروف
        </Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="text-right px-4 py-3 font-medium">التاريخ</th>
              <th className="text-right px-4 py-3 font-medium">الوحدة</th>
              <th className="text-right px-4 py-3 font-medium">الفئة</th>
              <th className="text-right px-4 py-3 font-medium">المبلغ</th>
              <th className="text-right px-4 py-3 font-medium">ملاحظات</th>
              <th className="text-right px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 text-gray-600" dir="ltr">
                  <span className="flex justify-end">{expense.expense_date}</span>
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-gray-400" />
                    {expense.unit?.name ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{expense.category}</td>
                <td className="px-4 py-3 font-medium text-red-600" dir="ltr">
                  <span className="flex justify-end">
                    {Number(expense.amount).toLocaleString("ar")} ريال
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                  {expense.notes ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <button
                      disabled={isPending}
                      onClick={() => handleDelete(expense.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      title="حذف"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {expenses.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">
            لا توجد مصروفات مسجلة
          </div>
        )}
      </Card>

      {showAddDialog && (
        <ExpenseDialog units={units} onClose={() => setShowAddDialog(false)} />
      )}
    </div>
  );
}
