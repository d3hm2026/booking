import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";
import type { UserRole } from "./types";

/**
 * يُستخدم في أعلى أي Server Component محمي.
 * يتحقق من وجود جلسة صالحة وأن دور المستخدم من ضمن الأدوار المسموحة،
 * وإلا يعيد توجيهه لصفحة تسجيل الدخول تلقائياً.
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<SessionPayload> {
  const session = await getSession();

  if (!session || !allowedRoles.includes(session.role)) {
    redirect("/login");
  }

  return session;
}
