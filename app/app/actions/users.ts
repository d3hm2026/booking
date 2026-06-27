"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireRole } from "@/lib/require-role";
import { revalidatePath } from "next/cache";
import type { AppUser, Owner, UserRole } from "@/lib/types";

export interface UserWithOwner extends AppUser {
  owner: Owner | null;
}

export async function getUsers(): Promise<UserWithOwner[]> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from("users")
    .select("*, owner:owners(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("فشل تحميل المستخدمين: " + error.message);
  }

  return (data ?? []) as unknown as UserWithOwner[];
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createUserAction(
  formData: FormData
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const fullName = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const role = formData.get("role") as UserRole;
  const passwordCode = (formData.get("password_code") as string)?.trim();
  const ownerId = role === "owner" ? (formData.get("owner_id") as string) || null : null;

  if (!fullName || !phone || !role || !passwordCode) {
    return { success: false, error: "تأكد من تعبئة كل الحقول المطلوبة" };
  }

  if (role === "owner" && !ownerId) {
    return { success: false, error: "اختر المالك المرتبط بهذا الحساب" };
  }

  const { error } = await supabase.from("users").insert({
    full_name: fullName,
    phone,
    role,
    password_code: passwordCode,
    owner_id: ownerId,
    is_active: true,
  });

  if (error) {
    if (error.message.includes("duplicate key") || error.message.includes("unique")) {
      return { success: false, error: "رقم الجوال مستخدم مسبقاً" };
    }
    return { success: false, error: "فشل إضافة المستخدم" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserAction(
  userId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const fullName = (formData.get("full_name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const role = formData.get("role") as UserRole;
  const passwordCode = (formData.get("password_code") as string)?.trim();
  const ownerId = role === "owner" ? (formData.get("owner_id") as string) || null : null;

  if (!fullName || !phone || !role || !passwordCode) {
    return { success: false, error: "تأكد من تعبئة كل الحقول المطلوبة" };
  }

  if (role === "owner" && !ownerId) {
    return { success: false, error: "اختر المالك المرتبط بهذا الحساب" };
  }

  const { error } = await supabase
    .from("users")
    .update({
      full_name: fullName,
      phone,
      role,
      password_code: passwordCode,
      owner_id: ownerId,
    })
    .eq("id", userId);

  if (error) {
    if (error.message.includes("duplicate key") || error.message.includes("unique")) {
      return { success: false, error: "رقم الجوال مستخدم مسبقاً" };
    }
    return { success: false, error: "فشل تعديل المستخدم" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserActiveAction(
  userId: string,
  newValue: boolean
): Promise<ActionResult> {
  await requireRole(["admin"]);
  const supabase = supabaseAdmin();

  const { error } = await supabase
    .from("users")
    .update({ is_active: newValue })
    .eq("id", userId);

  if (error) {
    return { success: false, error: "فشل تعديل حالة الحساب" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
