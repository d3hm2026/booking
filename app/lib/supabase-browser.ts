import { createClient } from "@supabase/supabase-js";

/**
 * عميل Supabase للمتصفح (client-side) - يستخدم anon key فقط.
 * بسبب أن RLS مفعّلة بدون أي سياسات سماح، هذا العميل لن يقدر
 * يقرأ أو يكتب أي شيء في قاعدة البيانات مباشرة - وهذا مقصود.
 * كل القراءة والكتابة الفعلية تتم عبر API Routes في السيرفر.
 *
 * هذا الملف موجود فقط لو احتجنا مستقبلاً ميزات Supabase الأخرى
 * من المتصفح (مثل Realtime)، وليس للوصول المباشر لقاعدة البيانات.
 */
export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, anonKey);
}
