-- ============================================================
-- نظام إدارة الاستراحات والشاليهات
-- Migration 001: إنشاء البنية الكاملة لقاعدة البيانات
-- ============================================================

-- تفعيل امتداد UUID
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. جدول الملاك (OWNERS)
-- ============================================================
create table owners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  commission_percent numeric(5,2) default 0 check (commission_percent >= 0 and commission_percent <= 100),
  notes text,
  created_at timestamptz default now()
);

comment on table owners is 'الملاك الذين تملكهم الوحدات (قد يكون مالك واحد لعدة وحدات)';

-- ============================================================
-- 2. جدول المستخدمين (USERS) - أدمن / مالك / عامل تنظيف
-- ============================================================
create table users (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('admin', 'owner', 'cleaner')),
  phone text not null unique,
  password_code text not null, -- رمز سري نصي بسيط يحدده الأدمن (وليس OTP)
  owner_id uuid references owners(id) on delete set null, -- يُعبّى فقط إذا role = owner
  full_name text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

comment on table users is 'حسابات الدخول: admin (أنت) / owner (مالك وحدة) / cleaner (عامل تنظيف)';
comment on column users.password_code is 'رمز سري ثابت يضبطه الأدمن، وليس نظام OTP';

create index idx_users_phone on users(phone);
create index idx_users_owner_id on users(owner_id) where owner_id is not null;

-- ============================================================
-- 3. جدول الوحدات (UNITS)
-- ============================================================
create table units (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references owners(id) on delete set null,
  name text not null,
  location text,
  status text not null default 'active' check (status in ('active', 'inactive', 'maintenance')),
  capacity int,
  notes text,
  created_at timestamptz default now()
);

comment on table units is 'الاستراحات / الشاليهات';

create index idx_units_owner_id on units(owner_id);
create index idx_units_status on units(status);

-- ============================================================
-- 4. جدول التسعير اليومي (UNIT_DAILY_PRICES)
-- ============================================================
create table unit_daily_prices (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  price_date date not null,
  price numeric(10,2) not null check (price >= 0),
  created_at timestamptz default now(),
  unique (unit_id, price_date) -- سعر واحد فقط لكل وحدة في كل تاريخ
);

comment on table unit_daily_prices is 'سعر كل وحدة يختلف يومياً - صف واحد لكل (وحدة + تاريخ)';

create index idx_prices_unit_date on unit_daily_prices(unit_id, price_date);

-- ============================================================
-- 5. جدول حجب الوحدة (UNIT_BLOCKS)
-- ============================================================
create table unit_blocks (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text,
  created_at timestamptz default now(),
  check (end_date >= start_date)
);

comment on table unit_blocks is 'فترات تُحجب فيها الوحدة عن الحجز (صيانة كبرى، استخدام شخصي...) بدون إنشاء حجز وهمي';

create index idx_blocks_unit_dates on unit_blocks(unit_id, start_date, end_date);

-- ============================================================
-- 6. جدول الحجوزات (BOOKINGS) - الجدول المحوري
-- ============================================================
create table bookings (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete restrict,
  guest_name text not null,
  guest_phone text not null,
  check_in date not null,
  check_out date not null,
  total_price numeric(10,2) not null check (total_price >= 0),
  deposit_amount numeric(10,2) default 0 check (deposit_amount >= 0),
  deposit_status text not null default 'none' check (deposit_status in ('none', 'held', 'returned', 'forfeited')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid')),
  booking_status text not null default 'confirmed' check (booking_status in ('confirmed', 'cancelled', 'completed')),
  source text default 'whatsapp',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (check_out > check_in)
);

comment on table bookings is 'الحجوزات - يتم الحجز فعلياً عبر واتساب ويُسجَّل هنا';
comment on column bookings.deposit_status is 'none: لا يوجد تأمين / held: محجوز عند الأدمن / returned: مرجوع للعميل / forfeited: مصادر';

create index idx_bookings_unit_id on bookings(unit_id);
create index idx_bookings_dates on bookings(unit_id, check_in, check_out);
create index idx_bookings_status on bookings(booking_status);
create index idx_bookings_guest_phone on bookings(guest_phone);

-- ============================================================
-- 7. جدول الدفعات (PAYMENTS)
-- ============================================================
create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  payment_type text not null default 'booking' check (payment_type in ('booking', 'deposit', 'refund', 'other')),
  amount numeric(10,2) not null check (amount >= 0),
  paid_date date not null default current_date,
  bank_name text,
  transfer_reference text,
  notes text,
  created_at timestamptz default now()
);

comment on table payments is 'سجل الدفعات عبر التحويل البنكي - مرتبطة بالحجز';

create index idx_payments_booking_id on payments(booking_id);

-- ============================================================
-- 8. جدول مهام التنظيف (CLEANING_TASKS)
-- ============================================================
create table cleaning_tasks (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null, -- المهمة المرتبطة بخروج عميل معين
  assigned_user_id uuid references users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'done')),
  visit_timestamp timestamptz, -- يُسجَّل تلقائياً عند رفع الصورة، وليس يدوياً
  notes text,
  created_at timestamptz default now()
);

comment on table cleaning_tasks is 'مهام التنظيف - تُنشأ عادة تلقائياً بعد خروج العميل (check_out)';
comment on column cleaning_tasks.visit_timestamp is 'وقت الزيارة الفعلي، يُسجَّل تلقائياً من السيستم وقت رفع الصورة';

create index idx_cleaning_unit_id on cleaning_tasks(unit_id);
create index idx_cleaning_booking_id on cleaning_tasks(booking_id);
create index idx_cleaning_status on cleaning_tasks(status);

-- ============================================================
-- 9. جدول صور التنظيف (CLEANING_PHOTOS)
-- ============================================================
create table cleaning_photos (
  id uuid primary key default gen_random_uuid(),
  cleaning_task_id uuid not null references cleaning_tasks(id) on delete cascade,
  photo_url text not null, -- رابط الملف في Supabase Storage
  taken_at timestamptz default now(), -- تلقائي وقت الرفع
  created_at timestamptz default now()
);

comment on table cleaning_photos is 'صور ما بعد التنظيف - يرفعها عامل التنظيف، التاريخ تلقائي';

create index idx_cleaning_photos_task_id on cleaning_photos(cleaning_task_id);

-- ============================================================
-- 10. جدول سجل التغييرات على الحجز (BOOKING_LOGS)
-- ============================================================
create table booking_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  action text not null, -- مثل: created / payment_confirmed / date_changed / cancelled
  note text,
  created_at timestamptz default now()
);

comment on table booking_logs is 'سجل تتبع لكل تعديل يصير على الحجز (تأكيد دفعة، تغيير تاريخ، إلغاء...)';

create index idx_booking_logs_booking_id on booking_logs(booking_id);

-- ============================================================
-- دوال ومحفزات (Triggers) مساعدة
-- ============================================================

-- تحديث updated_at تلقائياً عند أي تعديل على الحجز
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_bookings_updated_at
before update on bookings
for each row execute function set_updated_at();

-- تسجيل تلقائي في booking_logs عند إنشاء حجز جديد
create or replace function log_booking_created()
returns trigger as $$
begin
  insert into booking_logs (booking_id, action, note)
  values (new.id, 'created', 'تم إنشاء الحجز');
  return new;
end;
$$ language plpgsql;

create trigger trg_log_booking_created
after insert on bookings
for each row execute function log_booking_created();

-- إنشاء مهمة تنظيف تلقائياً عند تغيير حالة الحجز إلى "completed"
-- (أو يمكن استدعاؤها يدوياً من تطبيق الإدارة بدلاً من تشغيلها هنا)
create or replace function create_cleaning_task_on_checkout()
returns trigger as $$
begin
  if new.booking_status = 'completed' and old.booking_status != 'completed' then
    insert into cleaning_tasks (unit_id, booking_id, status)
    values (new.unit_id, new.id, 'pending');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_create_cleaning_task
after update on bookings
for each row execute function create_cleaning_task_on_checkout();
