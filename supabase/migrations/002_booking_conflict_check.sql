-- ============================================================
-- Migration 002: فحص تعارض الحجوزات + حجب الوحدة تلقائياً
-- ============================================================
-- يمنع إدخال حجزين متداخلين على نفس الوحدة، ويمنع الحجز
-- في فترة محجوبة (unit_blocks)، على مستوى قاعدة البيانات نفسها
-- (بالإضافة لأي فحص يصير في الواجهة لإظهار تنبيه فوري للمستخدم)
-- ============================================================

create or replace function check_booking_conflict()
returns trigger as $$
declare
  conflict_count int;
  block_count int;
begin
  -- تجاهل الحجوزات الملغاة عند الفحص
  if new.booking_status = 'cancelled' then
    return new;
  end if;

  -- فحص التداخل مع حجوزات أخرى على نفس الوحدة
  select count(*) into conflict_count
  from bookings
  where unit_id = new.unit_id
    and id != new.id
    and booking_status != 'cancelled'
    and new.check_in < check_out
    and new.check_out > check_in;

  if conflict_count > 0 then
    raise exception 'تعارض: يوجد حجز آخر على هذه الوحدة يتداخل مع هذه التواريخ';
  end if;

  -- فحص التداخل مع فترات الحجب (صيانة، استخدام شخصي...)
  select count(*) into block_count
  from unit_blocks
  where unit_id = new.unit_id
    and new.check_in < end_date
    and new.check_out > start_date;

  if block_count > 0 then
    raise exception 'تعارض: الوحدة محجوبة في هذه الفترة (صيانة أو استخدام آخر)';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_check_booking_conflict
before insert or update on bookings
for each row execute function check_booking_conflict();

-- نفس الفحص لو حاولنا نضيف حجب على وحدة فيها حجز مؤكد بالفعل
create or replace function check_block_conflict()
returns trigger as $$
declare
  conflict_count int;
begin
  select count(*) into conflict_count
  from bookings
  where unit_id = new.unit_id
    and booking_status != 'cancelled'
    and new.start_date < check_out
    and new.end_date > check_in;

  if conflict_count > 0 then
    raise exception 'تعارض: يوجد حجز مؤكد على هذه الوحدة في هذه الفترة، لا يمكن حجبها';
  end if;

  return new;
end;
$$ language plpgsql;

create trigger trg_check_block_conflict
before insert or update on unit_blocks
for each row execute function check_block_conflict();
