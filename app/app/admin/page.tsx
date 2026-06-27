import { getDashboardSummary } from "@/app/actions/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  LogIn,
  LogOut as LogOutIcon,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div>
      <PageHeader title="الرئيسية" description="نظرة سريعة على اليوم" />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <StatCard icon={Building2} label="وحدات نشطة" value={summary.activeUnits} />
        <StatCard
          icon={LogIn}
          label="دخول اليوم"
          value={summary.checkInsToday}
          tone="emerald"
        />
        <StatCard
          icon={LogOutIcon}
          label="خروج اليوم"
          value={summary.checkOutsToday}
          tone="amber"
        />
        <StatCard
          icon={AlertCircle}
          label="حجوزات غير مدفوعة"
          value={summary.unpaidCount}
          tone="red"
        />
        <StatCard
          icon={Sparkles}
          label="تنظيف معلّق"
          value={summary.pendingCleaningCount}
          tone="gray"
        />
      </div>

      <h2 className="text-base font-semibold text-gray-800 mb-3">حجوزات اليوم</h2>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="text-right px-4 py-3 font-medium">الوحدة</th>
                <th className="text-right px-4 py-3 font-medium">الحركة</th>
                <th className="text-right px-4 py-3 font-medium">العميل</th>
                <th className="text-right px-4 py-3 font-medium">الجوال</th>
                <th className="text-right px-4 py-3 font-medium">حالة الدفع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summary.todayBookings.map((b) => (
                <tr key={`${b.id}-${b.type}`} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-gray-900">{b.unitName}</td>
                  <td className="px-4 py-3">
                    <Badge tone={b.type === "check_in" ? "green" : "amber"}>
                      {b.type === "check_in" ? "دخول" : "خروج"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.guest_name}</td>
                  <td className="px-4 py-3 text-gray-600" dir="ltr">
                    <span className="flex justify-end">{b.guest_phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        b.payment_status === "paid"
                          ? "green"
                          : b.payment_status === "partial"
                          ? "amber"
                          : "gray"
                      }
                    >
                      {b.payment_status === "paid"
                        ? "مدفوع"
                        : b.payment_status === "partial"
                        ? "دفعة جزئية"
                        : "غير مدفوع"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {summary.todayBookings.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">
            لا توجد حركات دخول أو خروج اليوم
          </div>
        )}
      </Card>
    </div>
  );
}
