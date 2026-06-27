"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireRole } from "@/lib/require-role";
import { addDays } from "@/lib/date-utils";
import type { Booking, CleaningTask, Expense, Unit } from "@/lib/types";

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

function daysBetween(start: string, end: string): number {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  return Math.round((e.getTime() - s.getTime()) / 86400000);
}

function overlapNights(
  checkIn: string,
  checkOut: string,
  periodStart: string,
  periodEndExclusive: string
): number {
  const start = checkIn > periodStart ? checkIn : periodStart;
  const end = checkOut < periodEndExclusive ? checkOut : periodEndExclusive;
  return Math.max(daysBetween(start, end), 0);
}

export interface ExpenseWithUnitName extends Expense {
  unit: { name: string } | null;
}

export interface OwnerUnitFinance {
  unitId: string;
  unitName: string;
  revenue: number;
  expenses: number;
  occupancyRate: number;
}

export interface OwnerFinancialSummary {
  rows: OwnerUnitFinance[];
  expensesList: ExpenseWithUnitName[];
  totalRevenue: number;
  totalExpenses: number;
  commissionPercent: number;
  commissionAmount: number;
  expensePercentOfIncome: number;
  netIncome: number;
  occupancyRate: number;
}

const EMPTY_SUMMARY: OwnerFinancialSummary = {
  rows: [],
  expensesList: [],
  totalRevenue: 0,
  totalExpenses: 0,
  commissionPercent: 0,
  commissionAmount: 0,
  expensePercentOfIncome: 0,
  netIncome: 0,
  occupancyRate: 0,
};

/**
 * يحسب الملخص المالي للمالك خلال فترة (افتراضياً الشهر الحالي):
 * الدخل = دفعات payment_type='booking' المستلمة بالفترة (نفس منطق تقرير الأدمن)،
 * المصروفات من جدول expenses، نسبة الإشغال = ليالٍ محجوزة ÷ ليالٍ متاحة،
 * صافي الدخل = الدخل − عمولة المنصة − المصروفات.
 */
export async function getOwnerFinancialSummary(
  startDate: string,
  endDate: string
): Promise<OwnerFinancialSummary> {
  const session = await requireRole(["owner"]);
  const supabase = supabaseAdmin();

  if (!session.ownerId) {
    return EMPTY_SUMMARY;
  }

  const { data: ownerRow } = await supabase
    .from("owners")
    .select("commission_percent")
    .eq("id", session.ownerId)
    .single();

  const commissionPercent = Number(ownerRow?.commission_percent ?? 0);

  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id, name")
    .eq("owner_id", session.ownerId)
    .order("name", { ascending: true });

  if (unitsError) {
    throw new Error("فشل تحميل الوحدات: " + unitsError.message);
  }

  const unitIds = (units ?? []).map((u) => u.id);
  if (unitIds.length === 0) {
    return { ...EMPTY_SUMMARY, commissionPercent };
  }

  const periodEndExclusive = addDays(endDate, 1);

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("amount, paid_date, bookings!inner(unit_id)")
    .eq("payment_type", "booking")
    .gte("paid_date", startDate)
    .lte("paid_date", endDate);

  if (paymentsError) {
    throw new Error("فشل تحميل الدفعات: " + paymentsError.message);
  }

  const { data: expensesRaw, error: expensesError } = await supabase
    .from("expenses")
    .select("*, unit:units(name)")
    .in("unit_id", unitIds)
    .gte("expense_date", startDate)
    .lte("expense_date", endDate)
    .order("expense_date", { ascending: false });

  if (expensesError) {
    throw new Error("فشل تحميل المصروفات: " + expensesError.message);
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("unit_id, check_in, check_out")
    .in("unit_id", unitIds)
    .neq("booking_status", "cancelled")
    .lt("check_in", periodEndExclusive)
    .gt("check_out", startDate);

  if (bookingsError) {
    throw new Error("فشل تحميل الحجوزات: " + bookingsError.message);
  }

  const revenueByUnit = new Map<string, number>();
  for (const p of payments ?? []) {
    const row = p as unknown as { amount: number; bookings: { unit_id: string } };
    const uid = row.bookings.unit_id;
    revenueByUnit.set(uid, (revenueByUnit.get(uid) ?? 0) + Number(row.amount));
  }

  const expensesByUnit = new Map<string, number>();
  const expensesList = (expensesRaw ?? []) as unknown as ExpenseWithUnitName[];
  for (const e of expensesList) {
    expensesByUnit.set(
      e.unit_id,
      (expensesByUnit.get(e.unit_id) ?? 0) + Number(e.amount)
    );
  }

  const nightsByUnit = new Map<string, number>();
  for (const b of bookings ?? []) {
    nightsByUnit.set(
      b.unit_id,
      (nightsByUnit.get(b.unit_id) ?? 0) +
        overlapNights(b.check_in, b.check_out, startDate, periodEndExclusive)
    );
  }

  const availableNightsPerUnit = daysBetween(startDate, periodEndExclusive);

  const rows: OwnerUnitFinance[] = (units ?? []).map((u) => ({
    unitId: u.id,
    unitName: u.name,
    revenue: revenueByUnit.get(u.id) ?? 0,
    expenses: expensesByUnit.get(u.id) ?? 0,
    occupancyRate: availableNightsPerUnit
      ? ((nightsByUnit.get(u.id) ?? 0) / availableNightsPerUnit) * 100
      : 0,
  }));

  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const totalExpenses = rows.reduce((sum, r) => sum + r.expenses, 0);
  const commissionAmount = (totalRevenue * commissionPercent) / 100;
  const totalAvailableNights = availableNightsPerUnit * unitIds.length;
  const totalBookedNights = Array.from(nightsByUnit.values()).reduce(
    (sum, n) => sum + n,
    0
  );

  return {
    rows,
    expensesList,
    totalRevenue,
    totalExpenses,
    commissionPercent,
    commissionAmount,
    expensePercentOfIncome:
      totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0,
    netIncome: totalRevenue - commissionAmount - totalExpenses,
    occupancyRate:
      totalAvailableNights > 0
        ? (totalBookedNights / totalAvailableNights) * 100
        : 0,
  };
}
