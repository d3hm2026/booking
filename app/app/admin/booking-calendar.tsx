"use client";

import { useState, useMemo } from "react";
import type { Unit, Booking } from "@/lib/types";
import {
  dateRange,
  addDays,
  formatDayLabel,
  formatMonthYear,
  isWeekend,
  todayString,
} from "@/lib/date-utils";
import { AddBookingDialog } from "./add-booking-dialog";

interface BookingCalendarProps {
  units: Unit[];
  bookings: Booking[];
  startDate: string;
  daysCount: number;
}

const ROW_HEIGHT = 44;
const DAY_WIDTH = 56;
const UNIT_COL_WIDTH = 160;

export function BookingCalendar({
  units,
  bookings,
  startDate,
  daysCount,
}: BookingCalendarProps) {
  const [selection, setSelection] = useState<{
    unitId: string;
    date: string;
  } | null>(null);

  const days = useMemo(
    () => dateRange(startDate, addDays(startDate, daysCount)),
    [startDate, daysCount]
  );

  const today = todayString();

  const bookingsByUnit = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const booking of bookings) {
      const list = map.get(booking.unit_id) ?? [];
      list.push(booking);
      map.set(booking.unit_id, list);
    }
    return map;
  }, [bookings]);

  function dayIndex(dateStr: string): number {
    return days.indexOf(dateStr);
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div style={{ minWidth: UNIT_COL_WIDTH + days.length * DAY_WIDTH }}>
          {/* رأس الأعمدة: التواريخ */}
          <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
            <div
              className="flex items-center px-3 text-sm font-medium text-gray-500 shrink-0 border-l border-gray-200"
              style={{ width: UNIT_COL_WIDTH, height: 40 }}
            >
              {formatMonthYear(startDate)}
            </div>
            {days.map((d) => {
              const { weekday, day } = formatDayLabel(d);
              const weekend = isWeekend(d);
              const isToday = d === today;
              return (
                <div
                  key={d}
                  className={`flex flex-col items-center justify-center text-xs shrink-0 border-l border-gray-200 ${
                    weekend ? "bg-amber-50" : ""
                  } ${isToday ? "bg-blue-50" : ""}`}
                  style={{ width: DAY_WIDTH, height: 40 }}
                >
                  <span className="text-gray-400">{weekday}</span>
                  <span
                    className={`font-medium ${
                      isToday ? "text-blue-600" : "text-gray-700"
                    }`}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* صفوف الوحدات */}
          {units.map((unit) => {
            const unitBookings = bookingsByUnit.get(unit.id) ?? [];
            return (
              <div
                key={unit.id}
                className="flex border-b border-gray-100 relative"
                style={{ height: ROW_HEIGHT }}
              >
                <div
                  className="flex items-center px-3 text-sm font-medium shrink-0 border-l border-gray-200 bg-white sticky right-0 z-[5] truncate"
                  style={{ width: UNIT_COL_WIDTH }}
                  title={unit.name}
                >
                  {unit.name}
                </div>

                {/* خلايا الأيام (قابلة للنقر لإضافة حجز) */}
                <div className="flex relative" style={{ width: days.length * DAY_WIDTH }}>
                  {days.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelection({ unitId: unit.id, date: d })}
                      className={`shrink-0 border-l border-gray-100 hover:bg-gray-50 ${
                        isWeekend(d) ? "bg-amber-50/40" : ""
                      }`}
                      style={{ width: DAY_WIDTH, height: ROW_HEIGHT }}
                      aria-label={`إضافة حجز في ${unit.name} يوم ${d}`}
                    />
                  ))}

                  {/* أشرطة الحجوزات فوق الخلايا */}
                  {unitBookings.map((booking) => {
                    const startIdx = Math.max(0, dayIndex(booking.check_in));
                    const endIdx = Math.min(
                      days.length,
                      dayIndex(booking.check_out) === -1
                        ? days.length
                        : dayIndex(booking.check_out)
                    );
                    if (endIdx <= startIdx) return null;

                    const width = (endIdx - startIdx) * DAY_WIDTH;
                    const left = startIdx * DAY_WIDTH;

                    const colorClass =
                      booking.payment_status === "paid"
                        ? "bg-emerald-600"
                        : booking.payment_status === "partial"
                        ? "bg-amber-500"
                        : "bg-gray-400";

                    return (
                      <div
                        key={booking.id}
                        className={`absolute rounded-md px-2 flex items-center text-white text-xs font-medium overflow-hidden whitespace-nowrap shadow-sm hover:brightness-95 transition-all cursor-default ${colorClass}`}
                        style={{
                          right: left,
                          width: width - 4,
                          top: 5,
                          height: ROW_HEIGHT - 10,
                        }}
                        title={`${booking.guest_name} — ${booking.guest_phone}`}
                      >
                        {booking.guest_name}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {units.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              لا توجد وحدات مضافة بعد
            </div>
          )}
        </div>
      </div>

      {/* مفتاح الألوان */}
      <div className="flex items-center gap-4 px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
          مدفوع
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
          دفعة جزئية
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-gray-400 inline-block" />
          غير مدفوع
        </span>
      </div>

      {selection && (
        <AddBookingDialog
          unitId={selection.unitId}
          unitName={units.find((u) => u.id === selection.unitId)?.name ?? ""}
          defaultDate={selection.date}
          onClose={() => setSelection(null)}
        />
      )}
    </div>
  );
}
