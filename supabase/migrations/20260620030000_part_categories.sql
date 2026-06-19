-- Lets staff manage the list of part categories from /admin/parts instead
-- of being stuck with the original hardcoded screen/battery/camera/other.
-- Seeded with those same values so existing parts keep matching a real
-- category. Staff-only, no anon use case (same as the rest of /admin/parts).

create table public.part_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.part_categories enable row level security;

create policy "staff full access to part_categories" on public.part_categories
  for all to authenticated using (true) with check (true);

insert into public.part_categories (name)
values ('screen'), ('battery'), ('camera'), ('other')
on conflict (name) do nothing;
