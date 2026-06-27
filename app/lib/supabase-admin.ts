import { createClient } from "@supabase/supabase-js";

/**
 * عميل Supabase للسيرفر فقط (Server Components / API Routes / Server Actions).
 * يستخدم service_role key الذي يتجاوز RLS بالكامل.
 *
 * ⚠️ لا تستورد هذا الملف أبداً في أي ملف يحمل "use client"
 * هذا الملف يجب أن يُستخدم فقط من جهة السيرفر.
 */
function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "متغيرات البيئة لـ Supabase غير موجودة. تأكد من ملف .env.local"
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// عميل واحد يُعاد استخدامه (singleton) بدل إنشاء عميل جديد كل طلب
let cachedClient: ReturnType<typeof getServiceRoleClient> | null = null;

export function supabaseAdmin() {
  if (!cachedClient) {
    cachedClient = getServiceRoleClient();
  }
  return cachedClient;
}
