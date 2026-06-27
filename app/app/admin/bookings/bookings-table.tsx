"use client";

import { useState } from "react";
import type { BookingWithUnit } from "@/app/actions/bookings";
import type { UnitWithOwner } from "@/app/actions/units";
import { NewBookingDialog } from "./new-booking-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";

const BOOKING_STATUS_CONFIG: Record<
  string,
  { label: string; tone: "green" | "red" | "blue" }
> = {
  confirmed: { label: "مؤكد", tone: "blue" },
  completed: { label: "منتهي", tone: "green" },
  cancelled: { label: "ملغي", tone: "red" },
};

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; tone: "green" | "amber" | "gray" }
> = {
  paid: { label: "مدفوع", tone: "green" },
  partial: { label: "دفعة جزئية", tone: "amber" },
  unpaid: { label: "غير مدفوع", tone: "gray" },
};

interface BookingsTableProps {
  bookings: BookingWithUnit[];
  units: UnitWithOwner[];
}

export function BookingsTable({ bookings, units }: BookingsTableProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">قائمة الحجوزات</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="size-4" />
          إنشاء حجز
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="text-right px-4 py-3 font-medium">الوحدة</th>
                <th className="text-right px-4 py-3 font-medium">العميل</th>
                <th className="text-right px-4 py-3 font-medium">الجوال</th>
                <th className="text-right px-4 py-3 font-medium">دخول</th>
                <th className="text-right px-4 py-3 font-medium">خروج</th>
                <th className="text-right px-4 py-3 font-medium">الحالة</th>
                <th className="text-right px-4 py-3 font-medium">الدفع</th>
                <th className="text-right px-4 py-3 font-medium">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => {
                const status = BOOKING_STATUS_CONFIG[booking.booking_status] ?? {
                  label: booking.booking_status,
                  tone: "gray" as const,
                };
                const payment = PAYMENT_STATUS_CONFIG[booking.payment_status] ?? {
                  label: booking.payment_status,
                  tone: "gray" as const,
                };
                return (
                  <tr key={booking.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-gray-400" />
                        {booking.unit?.name ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{booking.guest_name}</td>
                    <td className="px-4 py-3 text-gray-600" dir="ltr">
                      <span className="flex justify-end">{booking.guest_phone}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600" dir="ltr">
                      <span className="flex justify-end">{booking.check_in}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600" dir="ltr">
                      <span className="flex justify-end">{booking.check_out}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={payment.tone}>{payment.label}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900" dir="ltr">
                      <span className="flex justify-end">
                        {Number(booking.total_price).toLocaleString("ar")} ريال
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">
            لا توجد حجوزات مطابقة
          </div>
        )}
      </Card>

      {showAddDialog && (
        <NewBookingDialog units={units} onClose={() => setShowAddDialog(false)} />
      )}
    </div>
  );
}
