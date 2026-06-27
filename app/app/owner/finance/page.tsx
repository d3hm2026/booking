import { requireRole } from "@/lib/require-role";
import { getOwnerFinancialSummary } from "@/app/actions/owner";
import { Topbar } from "@/components/ui/topbar";
import { OwnerNav } from "../owner-nav";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Percent,
  Scale,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface FinancePageProps {
  searchParams: Promise<{ month?: string }>;
}

function firstDayOfMonth(monthStr?: string): string {
  if (monthStr) return `${monthStr}-01`;
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function lastDayOfMonth(startDate: string): string {
  const [y, m] = startDate.split("-").map(Number);
  const last = new Date(y, m, 0);
  return last.toISOString().slice(0, 10);
}

function shiftMonth(monthStr: string, delta: number): string {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function OwnerFinancePage({ searchParams }: FinancePageProps) {
  const session = await requireRole(["owner"]);
  const params = await searchParams;

  const currentMonth =
    params.month ?? firstDayOfMonth().slice(0, 7);
  const startDate = `${currentMonth}-01`;
  const endDate = lastDayOfMonth(startDate);

  const summary = await getOwnerFinancialSummary(startDate, endDate);

  const prevMonth = shiftMonth(currentMonth, -1);
  const nextMonth = shiftMonth(currentMonth, 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="لوحة المالك" fullName={session.fullName} />

      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <OwnerNav active="/owner/finance" />

        <PageHeader
          title="التقارير المالية"
          description={`ملخص الشهر: ${currentMonth}`}
          action={
            <div className="flex gap-2">
              <Link href={`/owner/finance?month=${prevMonth}`}>
                <Button variant="secondary" size="sm">
                  <ChevronRight className="size-4" />
                  الشهر السابق
                </Button>
              </Link>
              <Link href={`/owner/finance?month=${nextMonth}`}>
                <Button variant="secondary" size="sm">
                  الشهر التالي
                  <ChevronLeft className="size-4" />
                </Button>
              </Link>
            </div>
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <StatCard
            icon={PieChart}
            label="نسبة الإشغال"
            value={`${summary.occupancyRate.toFixed(0)}%`}
            tone="indigo"
          />
          <StatCard
            icon={TrendingUp}
            label="إجمالي الدخل"
            value={`${summary.totalRevenue.toLocaleString("ar")} ريال`}
            tone="emerald"
          />
          <StatCard
            icon={Percent}
            label={`عمولة المنصة (${summary.commissionPercent}%)`}
            value={`${summary.commissionAmount.toLocaleString("ar")} ريال`}
            tone="amber"
          />
          <StatCard
            icon={TrendingDown}
            label={`المصروفات (${summary.expensePercentOfIncome.toFixed(0)}% من الدخل)`}
            value={`${summary.totalExpenses.toLocaleString("ar")} ريال`}
            tone="red"
          />
          <StatCard
            icon={Scale}
            label="صافي الدخل"
            value={`${summary.netIncome.toLocaleString("ar")} ريال`}
            tone={summary.netIncome >= 0 ? "emerald" : "red"}
          />
        </div>

        <h2 className="text-base font-semibold text-gray-800 mb-3">
          تفاصيل كل وحدة
        </h2>
        <Card className="overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium">الوحدة</th>
                  <th className="text-right px-4 py-3 font-medium">الإشغال</th>
                  <th className="text-right px-4 py-3 font-medium">الدخل</th>
                  <th className="text-right px-4 py-3 font-medium">المصروفات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summary.rows.map((row) => (
                  <tr key={row.unitId}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.unitName}
                    </td>
                    <td className="px-4 py-3 text-gray-600" dir="ltr">
                      <span className="flex justify-end">
                        {row.occupancyRate.toFixed(0)}%
                      </span>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {summary.rows.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              لا توجد بيانات لهذا الشهر
            </div>
          )}
        </Card>

        <h2 className="text-base font-semibold text-gray-800 mb-3">المصروفات</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="text-right px-4 py-3 font-medium">التاريخ</th>
                  <th className="text-right px-4 py-3 font-medium">الوحدة</th>
                  <th className="text-right px-4 py-3 font-medium">الفئة</th>
                  <th className="text-right px-4 py-3 font-medium">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {summary.expensesList.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 text-gray-600" dir="ltr">
                      <span className="flex justify-end">{e.expense_date}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {e.unit?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{e.category}</td>
                    <td className="px-4 py-3 text-red-600 font-medium" dir="ltr">
                      <span className="flex justify-end">
                        {Number(e.amount).toLocaleString("ar")} ريال
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {summary.expensesList.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              لا توجد مصروفات هذا الشهر
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
