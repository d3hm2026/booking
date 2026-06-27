import { getProfitReport } from "@/app/actions/reports";
import { getUnits } from "@/app/actions/units";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";

interface ReportsPageProps {
  searchParams: Promise<{
    unit_id?: string;
    start_date?: string;
    end_date?: string;
  }>;
}

function firstDayOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function lastDayOfMonth(): string {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return last.toISOString().slice(0, 10);
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const startDate = params.start_date || firstDayOfMonth();
  const endDate = params.end_date || lastDayOfMonth();

  const [units, report] = await Promise.all([
    getUnits(),
    getProfitReport(startDate, endDate, params.unit_id),
  ]);

  return (
    <div>
      <PageHeader
        title="التقرير المالي"
        description="إيرادات ومصروفات وصافي الربح لكل وحدة خلال فترة محددة"
      />

      <Card className="p-4 mb-6">
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
              defaultValue={startDate}
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
              defaultValue={endDate}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            تصفية
          </button>
        </form>
      </Card>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          icon={TrendingUp}
          label="إجمالي الإيراد"
          value={`${report.totalRevenue.toLocaleString("ar")} ريال`}
          tone="emerald"
        />
        <StatCard
          icon={TrendingDown}
          label="إجمالي المصروف"
          value={`${report.totalExpenses.toLocaleString("ar")} ريال`}
          tone="red"
        />
        <StatCard
          icon={Scale}
          label="صافي الربح"
          value={`${report.totalNet.toLocaleString("ar")} ريال`}
          tone={report.totalNet >= 0 ? "indigo" : "red"}
        />
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="text-right px-4 py-3 font-medium">الوحدة</th>
              <th className="text-right px-4 py-3 font-medium">الإيراد</th>
              <th className="text-right px-4 py-3 font-medium">المصروف</th>
              <th className="text-right px-4 py-3 font-medium">الصافي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {report.rows.map((row) => (
              <tr key={row.unitId} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {row.unitName}
                </td>
                <td className="px-4 py-3 text-emerald-600 font-medium" dir="ltr">
                  <span className="flex justify-end">
                    {row.revenue.toLocaleString("ar")} ريال
                  </span>
                </td>
                <td className="px-4 py-3 text-red-600 font-medium" dir="ltr">
                  <span className="flex justify-end">
                    {row.expenses.toLocaleString("ar")} ريال
                  </span>
                </td>
                <td
                  className={`px-4 py-3 font-semibold ${
                    row.net >= 0 ? "text-gray-900" : "text-red-700"
                  }`}
                  dir="ltr"
                >
                  <span className="flex justify-end">
                    {row.net.toLocaleString("ar")} ريال
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          {report.rows.length > 0 && (
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td className="px-4 py-3 font-semibold text-gray-900">الإجمالي</td>
                <td className="px-4 py-3 font-semibold text-emerald-700" dir="ltr">
                  <span className="flex justify-end">
                    {report.totalRevenue.toLocaleString("ar")} ريال
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-red-700" dir="ltr">
                  <span className="flex justify-end">
                    {report.totalExpenses.toLocaleString("ar")} ريال
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-gray-900" dir="ltr">
                  <span className="flex justify-end">
                    {report.totalNet.toLocaleString("ar")} ريال
                  </span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>

        {report.rows.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">
            لا توجد بيانات لهذه الفترة
          </div>
        )}
      </Card>
    </div>
  );
}
