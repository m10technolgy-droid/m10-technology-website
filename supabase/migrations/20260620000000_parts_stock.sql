-- Backs the /admin/parts stock dashboard: tracks repair parts (screens,
-- batteries, cameras, other) as a ledger. Staff log "received" and "sold"
-- entries, stock_quantity on parts is kept in sync by triggers, never
-- written directly. Fully staff-only, no public/anon use case.

create table public.parts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  stock_quantity integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.part_stock_entries (
  id uuid primary key default gen_random_uuid(),
  part_id uuid not null references public.parts (id) on delete cascade,
  entry_type text not null,
  quantity integer not null,
  note text,
  created_at timestamptz not null default now()
);

create or replace function public.apply_part_stock_entry()
returns trigger
language plpgsql
as $$
begin
  if new.entry_type = 'received' then
    update public.parts set stock_quantity = stock_quantity + new.quantity where id = new.part_id;
  elsif new.entry_type = 'sold' then
    update public.parts set stock_quantity = stock_quantity - new.quantity where id = new.part_id;
  end if;
  return new;
end;
$$;

create trigger trg_apply_part_stock_entry
after insert on public.part_stock_entries
for each row execute function public.apply_part_stock_entry();

create or replace function public.revert_part_stock_entry()
returns trigger
language plpgsql
as $$
begin
  if old.entry_type = 'received' then
    update public.parts set stock_quantity = stock_quantity - old.quantity where id = old.part_id;
  elsif old.entry_type = 'sold' then
    update public.parts set stock_quantity = stock_quantity + old.quantity where id = old.part_id;
  end if;
  return old;
end;
$$;

create trigger trg_revert_part_stock_entry
after delete on public.part_stock_entries
for each row execute function public.revert_part_stock_entry();

alter table public.parts enable row level security;
alter table public.part_stock_entries enable row level security;

create policy "staff full access to parts" on public.parts
  for all to authenticated using (true) with check (true);

create policy "staff full access to part_stock_entries" on public.part_stock_entries
  for all to authenticated using (true) with check (true);
