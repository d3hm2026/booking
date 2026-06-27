"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSession, destroySession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { AppUser } from "@/lib/types";

export interface LoginResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * يتحقق من رقم الجوال + الرمز السري، وينشئ جلسة، ويحدد الصفحة
 * المناسبة للدور تلقائياً (admin / owner / cleaner).
 */
export async function loginAction(formData: FormData): Promise<LoginResult> {
  const phone = (formData.get("phone") as string)?.trim();
  const code = (formData.get("code") as string)?.trim();

  if (!phone || !code) {
    return { success: false, error: "أدخل رقم الجوال والرمز السري" };
  }

  const supabase = supabaseAdmin();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .eq("is_active", true)
    .maybeSingle<AppUser>();

  if (error) {
    return { success: false, error: "حدث خطأ في الاتصال بقاعدة البيانات" };
  }

  if (!user || user.password_code !== code) {
    return { success: false, error: "رقم الجوال أو الرمز السري غير صحيح" };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    fullName: user.full_name,
    ownerId: user.owner_id,
  });

  const redirectTo =
    user.role === "admin"
      ? "/admin"
      : user.role === "owner"
      ? "/owner"
      : "/cleaner";

  return { success: true, redirectTo };
}

/**
 * يحذف جلسة المستخدم الحالي ويعيده لصفحة تسجيل الدخول
 */
export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
