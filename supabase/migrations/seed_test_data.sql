-- ============================================================
-- Seed Data: بيانات تجريبية للاختبار فقط
-- شغّل هذا الملف بعد الـ migrations الثلاثة، اختياري بالكامل
-- ============================================================

-- مالك تجريبي
insert into owners (id, name, phone, commission_percent, notes)
values ('11111111-1111-1111-1111-111111111111', 'مالك تجريبي', '0500000001', 20, 'بيانات تجربة فقط');

-- مستخدم أدمن (أنت)
insert into users (role, phone, password_code, full_name)
values ('admin', '0500000000', '1234', 'عبدالرحمن');

-- مستخدم مالك مرتبط بالمالك أعلاه
insert into users (role, phone, password_code, owner_id, full_name)
values ('owner', '0500000001', '5678', '11111111-1111-1111-1111-111111111111', 'مالك تجريبي');

-- مستخدم عامل تنظيف
insert into users (role, phone, password_code, full_name)
values ('cleaner', '0500000002', '9999', 'عامل التنظيف');

-- وحدة تجريبية
insert into units (id, owner_id, name, location, status, capacity)
values ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'شاليه الواحة 1', 'الرياض - طريق الخرج', 'active', 8);

-- تسعير يومي لأسبوع تجريبي
insert into unit_daily_prices (unit_id, price_date, price)
select '22222222-2222-2222-2222-222222222222', d, case when extract(dow from d) in (4,5) then 800 else 500 end
from generate_series(current_date, current_date + interval '13 days', interval '1 day') as d;

-- حجز تجريبي
insert into bookings (unit_id, guest_name, guest_phone, check_in, check_out, total_price, deposit_amount, deposit_status, payment_status, source)
values (
  '22222222-2222-2222-2222-222222222222',
  'عميل تجريبي',
  '0511111111',
  current_date + 2,
  current_date + 4,
  1600,
  500,
  'held',
  'paid',
  'whatsapp'
);
