import { requireRole } from "@/lib/require-role";
import { getOwnerDashboardData } from "@/app/actions/owner";
import { addDays, todayString } from "@/lib/date-utils";
import { BookingCalendar } from "@/app/admin/booking-calendar";
import { Topbar } from "@/components/ui/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, CalendarCheck, Sparkles, ChevronRight, ChevronLeft, CalendarDays } from "lucide-react";
import Link from "next/link";

const DAYS_SHOWN = 14;

interface OwnerPageProps {
  searchParams: Promise<{ start?: string }>;
}

export default async function OwnerPage({ searchParams }: OwnerPageProps) {
  const session = await requireRole(["owner"]);
  const params = await searchParams;

  const startDate = params.start || todayString();
  const endDate = addDays(startDate, DAYS_SHOWN);

  const { units, bookings, cleaningTasks } = await getOwnerDashboardData(
    startDate,
    endDate
  );

  const prevStart = addDays(startDate, -DAYS_SHOWN);
  const nextStart = addDays(startDate, DAYS_SHOWN);
  const pendingTasks = cleaningTasks.filter((t) => t.status === "pending");

  const unitNameById = new Map(units.map((u) => [u.id, u.name]));

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="لوحة المالك" fullName={session.fullName} />

      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <PageHeader title="نظرة عامة" description="وحداتك، حجوزاتها، ومهام التنظيف" />

        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard icon={Building2} label="وحداتي" value={units.length} />
          <StatCard
            icon={CalendarCheck}
            label="حجوزات الفترة"
            value={bookings.length}
            tone="emerald"
          />
          <StatCard
            icon={Sparkles}
            label="تنظيف معلّق"
            value={pendingTasks.length}
            tone="amber"
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">التقويم</h2>
          <div className="flex gap-2">
            <Link href={`/owner?start=${prevStart}`}>
              <Button variant="secondary" size="sm">
                <ChevronRight className="size-4" />
                السابق
              </Button>
            </Link>
            <Link href={`/owner?start=${todayString()}`}>
              <Button variant="secondary" size="sm">
                <CalendarDays className="size-4" />
                اليوم
              </Button>
            </Link>
            <Link href={`/owner?start=${nextStart}`}>
              <Button variant="secondary" size="sm">
                التالي
                <ChevronLeft className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        <BookingCalendar
          units={units}
          bookings={bookings}
          startDate={startDate}
          daysCount={DAYS_SHOWN}
          readOnly
        />

        <h2 className="text-base font-semibold text-gray-800 mt-8 mb-3">
          مهام التنظيف
        </h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="text-right px-4 py-3 font-medium">الوحدة</th>
                <th className="text-right px-4 py-3 font-medium">الحالة</th>
                <th className="text-right px-4 py-3 font-medium">وقت الزيارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cleaningTasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {unitNameById.get(task.unit_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={task.status === "done" ? "green" : "amber"}>
                      {task.status === "done" ? "تم" : "معلّق"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500" dir="ltr">
                    <span className="flex justify-end">
                      {task.visit_timestamp
                        ? new Date(task.visit_timestamp).toLocaleString("ar")
                        : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {cleaningTasks.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              لا توجد مهام تنظيف مسجلة لوحداتك
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
