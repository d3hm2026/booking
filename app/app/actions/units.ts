"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireRole } from "@/lib/require-role";
import { revalidatePath } from "next/cache";
import type { Owner, Unit, UnitDailyPrice, UnitStatus } from "@/lib/types";
import { dateRange } from "@/lib/date-utils";

export interface UnitWithOwner extends Unit {
  owner: Owner | null;
}

export async function getUnits(): Promise<UnitWithOwner[]> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("units")
    .select("*, owner:owners(*)")
    .order("name", { ascending: true });

  if (error) {
    throw new Error("فشل تحميل الوحدات: " + error.message);
  }

  return (data ?? []) as unknown as UnitWithOwner[];
}

export async function getOwners(): Promise<Owner[]> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("owners")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error("فشل تحميل الملاك: " + error.message);
  }

  return (data ?? []) as Owner[];
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createOwnerAction(
  formData: FormData
): Promise<ActionResult & { ownerId?: string }> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const commissionPercent = Number(formData.get("commission_percent") || 0);

  if (!name || !phone) {
    return { success: false, error: "أدخل اسم المالك ورقم جواله" };
  }

  const { data, error } = await supabase
    .from("owners")
    .insert({
      name,
      phone,
      commission_percent: Number.isFinite(commissionPercent)
        ? commissionPercent
        : 0,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: "فشل إضافة المالك" };
  }

  revalidatePath("/admin/units");
  return { success: true, ownerId: data.id as string };
}

export async function createUnitAction(
  formData: FormData
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const name = (formData.get("name") as string)?.trim();
  const ownerId = (formData.get("owner_id") as string) || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const status = (formData.get("status") as UnitStatus) || "active";
  const capacityRaw = formData.get("capacity");
  const capacity = capacityRaw ? Number(capacityRaw) : null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name) {
    return { success: false, error: "أدخل اسم الوحدة" };
  }

  const { error } = await supabase.from("units").insert({
    name,
    owner_id: ownerId,
    location,
    status,
    capacity,
    notes,
  });

  if (error) {
    return { success: false, error: "فشل إضافة الوحدة" };
  }

  revalidatePath("/admin/units");
  return { success: true };
}

export async function updateUnitAction(
  unitId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const name = (formData.get("name") as string)?.trim();
  const ownerId = (formData.get("owner_id") as string) || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const status = (formData.get("status") as UnitStatus) || "active";
  const capacityRaw = formData.get("capacity");
  const capacity = capacityRaw ? Number(capacityRaw) : null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name) {
    return { success: false, error: "أدخل اسم الوحدة" };
  }

  const { error } = await supabase
    .from("units")
    .update({ name, owner_id: ownerId, location, status, capacity, notes })
    .eq("id", unitId);

  if (error) {
    return { success: false, error: "فشل تعديل الوحدة" };
  }

  revalidatePath("/admin/units");
  return { success: true };
}

export async function deleteUnitAction(unitId: string): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const { error } = await supabase.from("units").delete().eq("id", unitId);

  if (error) {
    if (error.message.includes("violates foreign key constraint")) {
      return {
        success: false,
        error: "لا يمكن حذف الوحدة لوجود حجوزات مرتبطة بها",
      };
    }
    return { success: false, error: "فشل حذف الوحدة" };
  }

  revalidatePath("/admin/units");
  return { success: true };
}

export async function getUnitPrices(
  unitId: string,
  startDate: string,
  endDate: string
): Promise<UnitDailyPrice[]> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("unit_daily_prices")
    .select("*")
    .eq("unit_id", unitId)
    .gte("price_date", startDate)
    .lt("price_date", endDate)
    .order("price_date", { ascending: true });

  if (error) {
    throw new Error("فشل تحميل الأسعار: " + error.message);
  }

  return (data ?? []) as UnitDailyPrice[];
}

export async function upsertDailyPricesAction(
  formData: FormData
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const unitId = formData.get("unit_id") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const price = Number(formData.get("price"));

  if (!unitId || !startDate || !endDate) {
    return { success: false, error: "تأكد من تعبئة كل الحقول" };
  }

  if (endDate < startDate) {
    return { success: false, error: "تاريخ النهاية يجب أن يكون بعد البداية" };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { success: false, error: "السعر غير صحيح" };
  }

  const dates = dateRange(startDate, endDate);
  dates.push(endDate); // نطاق شامل للنهاية هنا (على عكس التقويم)

  const rows = dates.map((d) => ({
    unit_id: unitId,
    price_date: d,
    price,
  }));

  const { error } = await supabase
    .from("unit_daily_prices")
    .upsert(rows, { onConflict: "unit_id,price_date" });

  if (error) {
    return { success: false, error: "فشل حفظ الأسعار" };
  }

  revalidatePath("/admin/units");
  return { success: true };
}
