-- ============================================================
-- Migration 004: جدول المصروفات (EXPENSES)
-- ============================================================

create table expenses (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references units(id) on delete cascade,
  category text not null,
  amount numeric(10,2) not null check (amount >= 0),
  expense_date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

comment on table expenses is 'مصروفات كل وحدة (صيانة، فواتير، إلخ) لحساب الربحية';

create index idx_expenses_unit_date on expenses(unit_id, expense_date);

alter table expenses enable row level security;
-- بدون سياسات، بنفس منطق migration 003: الوصول فقط عبر service_role من السيرفر
