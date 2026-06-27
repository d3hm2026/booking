import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "./types";

const COOKIE_NAME = "session";
const SESSION_DURATION_DAYS = 30;

export interface SessionPayload {
  userId: string;
  role: UserRole;
  fullName: string;
  ownerId: string | null;
}

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET غير موجود في متغيرات البيئة");
  }
  return new TextEncoder().encode(secret);
}

/**
 * يبني توكن JWT موقّع يحمل بيانات المستخدم، ويخزّنه في كوكي HttpOnly.
 * هذا يُستخدم فقط من Server Actions / Route Handlers (وليس من الواجهة).
 */
export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/**
 * يقرأ الجلسة الحالية من الكوكي ويتحقق من صحتها وتوقيعها.
 * يرجع null لو ما فيه جلسة أو كانت غير صالحة/منتهية.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: payload.userId as string,
      role: payload.role as UserRole,
      fullName: payload.fullName as string,
      ownerId: (payload.ownerId as string | null) ?? null,
    };
  } catch {
    // توكن غير صالح أو منتهي أو موقّع بمفتاح مختلف
    return null;
  }
}

/**
 * يحذف الجلسة الحالية (تسجيل خروج)
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
