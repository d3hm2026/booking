# نظام إدارة الاستراحات والشاليهات

نظام داخلي لإدارة حجوزات الاستراحات والشاليهات: الحجوزات، الدفعات (تحويل بنكي)، التسعير اليومي، الصيانة والتنظيف، وحسابات منفصلة للملاك وعمال التنظيف.

## البنية

```
chalet-booking/
├── app/                  ← مشروع Next.js (الكود الفعلي)
│   ├── app/              ← الصفحات (App Router)
│   ├── lib/              ← أدوات مساعدة (Supabase clients, types)
│   └── .env.local.example
└── supabase/
    ├── migrations/       ← سكربتات SQL لإنشاء قاعدة البيانات
    └── README.md         ← خطوات إعداد Supabase بالتفصيل
```

## خطوات التشغيل المحلي

### 1. قاعدة البيانات
اتبع الخطوات في [`supabase/README.md`](./supabase/README.md) لإنشاء مشروع Supabase وتشغيل ملفات الـ migrations.

### 2. متغيرات البيئة
```bash
cd app
cp .env.local.example .env.local
```
ثم افتح `.env.local` وضع فيه مفاتيحك الفعلية من Supabase (لن يُرفع هذا الملف على GitHub أبداً).

### 3. تشغيل المشروع محلياً
```bash
cd app
npm install
npm run dev
```
افتح [http://localhost:3000](http://localhost:3000)

## النشر على Vercel

1. اربط المستودع (repository) من GitHub بحساب Vercel
2. عند الإعداد، حدد **Root Directory** = `app` (مهم جداً، لأن مشروع Next.js داخل مجلد فرعي)
3. أضف متغيرات البيئة نفسها (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`) من إعدادات المشروع في Vercel → Settings → Environment Variables
4. اضغط Deploy

## حالة المشروع

- [x] قاعدة البيانات (9 جداول + فحص تعارض الحجوزات + RLS)
- [x] إعداد مشروع Next.js + ربطه بـ Supabase
- [ ] شاشة تسجيل الدخول (admin / owner / cleaner)
- [ ] التقويم وإضافة حجز جديد
- [ ] لوحة الوحدات والتسعير اليومي
- [ ] شاشة المالك
- [ ] شاشة عامل التنظيف (رفع صور)
- [ ] النشر النهائي على Vercel
