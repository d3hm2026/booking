import { requireRole } from "@/lib/require-role";
import { LogoutButton } from "@/components/logout-button";
import { getCalendarData } from "@/app/actions/bookings";
import { addDays, todayString } from "@/lib/date-utils";
import { BookingCalendar } from "./booking-calendar";
import { AdminNav } from "./admin-nav";

const DAYS_SHOWN = 14;

interface AdminPageProps {
  searchParams: Promise<{ start?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await requireRole(["admin"]);
  const params = await searchParams;

  const startDate = params.start || todayString();
  const endDate = addDays(startDate, DAYS_SHOWN);

  const { units, bookings } = await getCalendarData(startDate, endDate);

  const prevStart = addDays(startDate, -DAYS_SHOWN);
  const nextStart = addDays(startDate, DAYS_SHOWN);

  return (
    <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">أهلاً، {session.fullName}</h1>
        <LogoutButton />
      </div>

      <AdminNav active="/admin" />

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-medium text-gray-700">
          التقويم — كل الوحدات
        </h2>
        <div className="flex gap-2 text-sm">
          <a
            href={`/admin?start=${prevStart}`}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            السابق
          </a>
          <a
            href={`/admin?start=${todayString()}`}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            اليوم
          </a>
          <a
            href={`/admin?start=${nextStart}`}
            className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            التالي
          </a>
        </div>
      </div>

      <BookingCalendar
        units={units}
        bookings={bookings}
        startDate={startDate}
        daysCount={DAYS_SHOWN}
      />

      <p className="text-xs text-gray-400 mt-3">
        اضغط على أي خلية فاضية بالتقويم لإضافة حجز جديد لتلك الوحدة والتاريخ
      </p>
    </main>
  );
}
