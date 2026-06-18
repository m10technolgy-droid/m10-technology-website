-- Lets staff manage a fixed list of service categories from /admin/services
-- instead of free-typing the category on every service (source of typos
-- like "sceeen replacement"). Seeded from whatever distinct category values
-- already exist in services so nothing currently shown breaks.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "staff full access to categories" on public.categories
  for all to authenticated using (true) with check (true);

insert into public.categories (name)
select distinct category from public.services
on conflict (name) do nothing;
