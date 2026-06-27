-- ============================================================
-- Migration 003: سياسات الأمان (Row Level Security)
-- ============================================================
-- القرار المعماري النهائي لهذا المشروع:
--   كل الوصول لقاعدة البيانات يتم فقط من كود Next.js على السيرفر
--   (Server Components / API Routes) باستخدام SUPABASE_SERVICE_ROLE_KEY،
--   وهذا المفتاح لا يصل إطلاقاً إلى المتصفح أو كود العميل (client-side).
--
--   منطق الصلاحيات (من يشوف ماذا) يُنفَّذ بالكامل داخل كود التطبيق:
--   - يتحقق من session المستخدم (admin / owner / cleaner)
--   - يبني الاستعلام المناسب لدوره (owner_id الخاص به مثلاً)
--
--   RLS هنا تُفعَّل كـ "شبكة أمان ثانية" فقط: لو حصل خطأ برمجي يوماً
--   واستُخدم anon key بالخطأ من المتصفح، RLS تمنع أي قراءة أو كتابة
--   تماماً (لا توجد أي سياسة تسمح بالوصول عبر anon) - فقط service_role
--   (الذي يتجاوز RLS تلقائياً بطبيعته في Supabase) يقدر يعمل.
--
--   النتيجة: أمان كامل + بدون أي تعقيد إضافي عند الرفع على Vercel
--   (فقط متغير بيئة واحد سري على السيرفر).
-- ============================================================

alter table owners enable row level security;
alter table users enable row level security;
alter table units enable row level security;
alter table unit_daily_prices enable row level security;
alter table unit_blocks enable row level security;
alter table bookings enable row level security;
alter table payments enable row level security;
alter table cleaning_tasks enable row level security;
alter table cleaning_photos enable row level security;
alter table booking_logs enable row level security;

-- لا توجد أي سياسة (policy) معرّفة هنا عمداً.
-- بدون سياسات، RLS تمنع تلقائياً كل وصول عبر anon/authenticated key.
-- service_role يتجاوز RLS دوماً بطبيعته في Supabase، فيستمر العمل بشكل طبيعي
-- من كود السيرفر في Next.js فقط.
