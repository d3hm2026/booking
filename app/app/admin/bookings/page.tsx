import { getBookingsList } from "@/app/actions/bookings";
import { getUnits } from "@/app/actions/units";
import { BookingsTable } from "./bookings-table";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import type { BookingStatus } from "@/lib/types";

interface BookingsPageProps {
  searchParams: Promise<{ unit_id?: string; status?: string }>;
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const params = await searchParams;
  const status = params.status as BookingStatus | undefined;

  const [units, bookings] = await Promise.all([
    getUnits(),
    getBookingsList({ unitId: params.unit_id, status }),
  ]);

  return (
    <div>
      <PageHeader
        title="الحجوزات"
        description="كل الحجوزات — أنشئ حجزاً جديداً واختر الوحدة مباشرة"
      />

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
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              الحالة
            </label>
            <select
              name="status"
              defaultValue={params.status ?? ""}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">كل الحالات</option>
              <option value="confirmed">مؤكد</option>
              <option value="completed">منتهي</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            تصفية
          </button>
          {(params.unit_id || params.status) && (
            <a
              href="/admin/bookings"
              className="px-3.5 py-2 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              إعادة تعيين
            </a>
          )}
        </form>
      </Card>

      <BookingsTable bookings={bookings} units={units} />
    </div>
  );
}
