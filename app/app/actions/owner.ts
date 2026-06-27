"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireRole } from "@/lib/require-role";
import type { Booking, CleaningTask, Unit } from "@/lib/types";

export interface OwnerDashboardData {
  units: Unit[];
  bookings: Booking[];
  cleaningTasks: CleaningTask[];
}

/**
 * يجلب وحدات المالك فقط، وحجوزاتها ضمن نطاق تاريخ، ومهام التنظيف المرتبطة بها.
 */
export async function getOwnerDashboardData(
  startDate: string,
  endDate: string
): Promise<OwnerDashboardData> {
  const session = await requireRole(["owner"]);
  const supabase = supabaseAdmin();

  if (!session.ownerId) {
    return { units: [], bookings: [], cleaningTasks: [] };
  }

  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("*")
    .eq("owner_id", session.ownerId)
    .order("name", { ascending: true });

  if (unitsError) {
    throw new Error("فشل تحميل الوحدات: " + unitsError.message);
  }

  const unitIds = (units ?? []).map((u) => u.id);

  if (unitIds.length === 0) {
    return { units: [], bookings: [], cleaningTasks: [] };
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("*")
    .in("unit_id", unitIds)
    .neq("booking_status", "cancelled")
    .lt("check_in", endDate)
    .gt("check_out", startDate);

  if (bookingsError) {
    throw new Error("فشل تحميل الحجوزات: " + bookingsError.message);
  }

  const { data: cleaningTasks, error: cleaningError } = await supabase
    .from("cleaning_tasks")
    .select("*")
    .in("unit_id", unitIds)
    .order("created_at", { ascending: false });

  if (cleaningError) {
    throw new Error("فشل تحميل مهام التنظيف: " + cleaningError.message);
  }

  return {
    units: (units ?? []) as Unit[],
    bookings: (bookings ?? []) as Booking[],
    cleaningTasks: (cleaningTasks ?? []) as CleaningTask[],
  };
}
