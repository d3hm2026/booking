import { getExpenses } from "@/app/actions/expenses";
import { getUnits } from "@/app/actions/units";
import { ExpensesTable } from "./expenses-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Wallet, Receipt } from "lucide-react";

interface ExpensesPageProps {
  searchParams: Promise<{
    unit_id?: string;
    start_date?: string;
    end_date?: string;
  }>;
}

export default async function ExpensesPage({
  searchParams,
}: ExpensesPageProps) {
  const params = await searchParams;
  const [units, expenses] = await Promise.all([
    getUnits(),
    getExpenses({
      unitId: params.unit_id,
      startDate: params.start_date,
      endDate: params.end_date,
    }),
  ]);

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div>
      <PageHeader
        title="المصروفات"
        description="تسجيل مصروفات كل وحدة (صيانة، فواتير، إلخ) لحساب الربحية"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard icon={Receipt} label="عدد المصروفات" value={expenses.length} />
        <StatCard
          icon={Wallet}
          label="إجمالي المصروفات"
          value={`${totalAmount.toLocaleString("ar")} ريال`}
          tone="red"
        />
      </div>

      <Card className="p-4 mb-4">
        <form method="GET" className="flex flex-wrap items-end gap-3">
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              الوحدة
            </label>
            <select
              name="unit_id"
              defaultValue={params.unit_id ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">كل الوحدات</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              من
            </label>
            <input
              type="date"
              name="start_date"
              defaultValue={params.start_date ?? ""}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              إلى
            </label>
            <input
              type="date"
              name="end_date"
              defaultValue={params.end_date ?? ""}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            تصفية
          </button>
          {(params.unit_id || params.start_date || params.end_date) && (
            <a
              href="/admin/expenses"
              className="px-3.5 py-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              إعادة تعيين
            </a>
          )}
        </form>
      </Card>

      <ExpensesTable expenses={expenses} units={units} />
    </div>
  );
}
