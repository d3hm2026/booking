"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireRole } from "@/lib/require-role";
import { revalidatePath } from "next/cache";
import type { Expense, Unit } from "@/lib/types";

export interface ExpenseWithUnit extends Expense {
  unit: Unit | null;
}

export interface ExpenseFilters {
  unitId?: string;
  startDate?: string;
  endDate?: string;
}

export async function getExpenses(
  filters: ExpenseFilters = {}
): Promise<ExpenseWithUnit[]> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  let query = supabase
    .from("expenses")
    .select("*, unit:units(*)")
    .order("expense_date", { ascending: false });

  if (filters.unitId) {
    query = query.eq("unit_id", filters.unitId);
  }
  if (filters.startDate) {
    query = query.gte("expense_date", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("expense_date", filters.endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("فشل تحميل المصروفات: " + error.message);
  }

  return (data ?? []) as unknown as ExpenseWithUnit[];
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function addExpenseAction(
  formData: FormData
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const unitId = formData.get("unit_id") as string;
  const category = (formData.get("category") as string)?.trim();
  const amount = Number(formData.get("amount"));
  const expenseDate = formData.get("expense_date") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!unitId || !category || !expenseDate) {
    return { success: false, error: "تأكد من تعبئة كل الحقول المطلوبة" };
  }

  if (!Number.isFinite(amount) || amount < 0) {
    return { success: false, error: "المبلغ غير صحيح" };
  }

  const { error } = await supabase.from("expenses").insert({
    unit_id: unitId,
    category,
    amount,
    expense_date: expenseDate,
    notes,
  });

  if (error) {
    return { success: false, error: "فشل إضافة المصروف" };
  }

  revalidatePath("/admin/expenses");
  return { success: true };
}

export async function deleteExpenseAction(
  expenseId: string
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);

  if (error) {
    return { success: false, error: "فشل حذف المصروف" };
  }

  revalidatePath("/admin/expenses");
  return { success: true };
}
