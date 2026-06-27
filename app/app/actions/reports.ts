"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireRole } from "@/lib/require-role";

export interface UnitProfitRow {
  unitId: string;
  unitName: string;
  revenue: number;
  expenses: number;
  net: number;
}

export interface ProfitReport {
  rows: UnitProfitRow[];
  totalRevenue: number;
  totalExpenses: number;
  totalNet: number;
}

export async function getProfitReport(
  startDate: string,
  endDate: string,
  unitId?: string
): Promise<ProfitReport> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  let unitsQuery = supabase.from("units").select("id, name").order("name");
  if (unitId) {
    unitsQuery = unitsQuery.eq("id", unitId);
  }
  const { data: units, error: unitsError } = await unitsQuery;

  if (unitsError) {
    throw new Error("فشل تحميل الوحدات: " + unitsError.message);
  }

  const unitIds = (units ?? []).map((u) => u.id);

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("amount, paid_date, booking_id, bookings!inner(unit_id)")
    .eq("payment_type", "booking")
    .gte("paid_date", startDate)
    .lte("paid_date", endDate);

  if (paymentsError) {
    throw new Error("فشل تحميل الدفعات: " + paymentsError.message);
  }

  const { data: expenses, error: expensesError } = await supabase
    .from("expenses")
    .select("amount, unit_id")
    .in("unit_id", unitIds.length > 0 ? unitIds : [""])
    .gte("expense_date", startDate)
    .lte("expense_date", endDate);

  if (expensesError) {
    throw new Error("فشل تحميل المصروفات: " + expensesError.message);
  }

  const revenueByUnit = new Map<string, number>();
  for (const p of payments ?? []) {
    const unit = p as unknown as { amount: number; bookings: { unit_id: string } };
    const uid = unit.bookings.unit_id;
    revenueByUnit.set(uid, (revenueByUnit.get(uid) ?? 0) + Number(unit.amount));
  }

  const expensesByUnit = new Map<string, number>();
  for (const e of expenses ?? []) {
    expensesByUnit.set(
      e.unit_id,
      (expensesByUnit.get(e.unit_id) ?? 0) + Number(e.amount)
    );
  }

  const rows: UnitProfitRow[] = (units ?? []).map((u) => {
    const revenue = revenueByUnit.get(u.id) ?? 0;
    const expensesTotal = expensesByUnit.get(u.id) ?? 0;
    return {
      unitId: u.id,
      unitName: u.name,
      revenue,
      expenses: expensesTotal,
      net: revenue - expensesTotal,
    };
  });

  const totalRevenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const totalExpenses = rows.reduce((sum, r) => sum + r.expenses, 0);

  return {
    rows,
    totalRevenue,
    totalExpenses,
    totalNet: totalRevenue - totalExpenses,
  };
}
