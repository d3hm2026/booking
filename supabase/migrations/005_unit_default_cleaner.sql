-- ============================================================
-- Migration 005: ربط عامل تنظيف افتراضي بكل وحدة
-- ============================================================
-- كل وحدة قد يكون لها عامل تنظيف مختلف (وليس عاملاً واحداً للكل).
-- عند إنشاء مهمة تنظيف تلقائياً عند checkout، تُسنَد فوراً لعامل
-- التنظيف المسؤول عن تلك الوحدة (إن وُجد).
-- ============================================================

alter table units add column default_cleaner_id uuid references users(id) on delete set null;

create index idx_units_default_cleaner_id on units(default_cleaner_id) where default_cleaner_id is not null;

comment on column units.default_cleaner_id is 'عامل التنظيف المسؤول عن هذه الوحدة (role=cleaner في users)';

-- تحديث الدالة لتسند المهمة لعامل التنظيف المسؤول عن الوحدة تلقائياً
create or replace function create_cleaning_task_on_checkout()
returns trigger as $$
begin
  if new.booking_status = 'completed' and old.booking_status != 'completed' then
    insert into cleaning_tasks (unit_id, booking_id, status, assigned_user_id)
    select new.unit_id, new.id, 'pending', units.default_cleaner_id
    from units
    where units.id = new.unit_id;
  end if;
  return new;
end;
$$ language plpgsql;
