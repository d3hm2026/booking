"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireRole } from "@/lib/require-role";
import { todayString } from "@/lib/date-utils";
import type { Booking } from "@/lib/types";

export interface TodayBookingRow extends Booking {
  unitName: string;
  type: "check_in" | "check_out";
}

export interface DashboardSummary {
  activeUnits: number;
  checkInsToday: number;
  checkOutsToday: number;
  unpaidCount: number;
  pendingCleaningCount: number;
  todayBookings: TodayBookingRow[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();
  const today = todayString();

  const { count: activeUnits } = await supabase
    .from("units")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  const { data: todayRows, error: todayError } = await supabase
    .from("bookings")
    .select("*, unit:units(name)")
    .neq("booking_status", "cancelled")
    .or(`check_in.eq.${today},check_out.eq.${today}`);

  if (todayError) {
    throw new Error("فشل تحميل حجوزات اليوم: " + todayError.message);
  }

  const todayBookings: TodayBookingRow[] = [];
  for (const row of todayRows ?? []) {
    const r = row as unknown as Booking & { unit: { name: string } | null };
    if (r.check_in === today) {
      todayBookings.push({ ...r, unitName: r.unit?.name ?? "—", type: "check_in" });
    }
    if (r.check_out === today) {
      todayBookings.push({ ...r, unitName: r.unit?.name ?? "—", type: "check_out" });
    }
  }
  todayBookings.sort((a, b) => (a.type === "check_in" ? -1 : 1));

  const { count: unpaidCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("booking_status", "confirmed")
    .in("payment_status", ["unpaid", "partial"]);

  const { count: pendingCleaningCount } = await supabase
    .from("cleaning_tasks")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return {
    activeUnits: activeUnits ?? 0,
    checkInsToday: todayBookings.filter((b) => b.type === "check_in").length,
    checkOutsToday: todayBookings.filter((b) => b.type === "check_out").length,
    unpaidCount: unpaidCount ?? 0,
    pendingCleaningCount: pendingCleaningCount ?? 0,
    todayBookings,
  };
}
