import { getCalendarData } from "@/app/actions/bookings";
import { addDays, todayString } from "@/lib/date-utils";
import { BookingCalendar } from "./booking-calendar";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, ChevronLeft, CalendarDays } from "lucide-react";

const DAYS_SHOWN = 14;

interface AdminPageProps {
  searchParams: Promise<{ start?: string }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;

  const startDate = params.start || todayString();
  const endDate = addDays(startDate, DAYS_SHOWN);

  const { units, bookings } = await getCalendarData(startDate, endDate);

  const prevStart = addDays(startDate, -DAYS_SHOWN);
  const nextStart = addDays(startDate, DAYS_SHOWN);

  return (
    <div>
      <PageHeader
        title="التقويم"
        description="عرض كل الوحدات والحجوزات — اضغط على أي خلية فاضية لإضافة حجز جديد"
        action={
          <div className="flex gap-2">
            <Link href={`/admin?start=${prevStart}`}>
              <Button variant="secondary" size="sm">
                <ChevronRight className="size-4" />
                السابق
              </Button>
            </Link>
            <Link href={`/admin?start=${todayString()}`}>
              <Button variant="secondary" size="sm">
                <CalendarDays className="size-4" />
                اليوم
              </Button>
            </Link>
            <Link href={`/admin?start=${nextStart}`}>
              <Button variant="secondary" size="sm">
                التالي
                <ChevronLeft className="size-4" />
              </Button>
            </Link>
          </div>
        }
      />

      <BookingCalendar
        units={units}
        bookings={bookings}
        startDate={startDate}
        daysCount={DAYS_SHOWN}
      />
    </div>
  );
}
