-- Grants the new /admin staff panel access to manage bookings, tickets,
-- inventory, and services. Staff log in via Supabase Auth (one shared
-- login), so "authenticated" here means any logged-in staff member.
--
-- services/inventory currently have RLS disabled (anon can already read
-- them with no policy, confirmed by the running app). This enables RLS on
-- both and adds an explicit anon-select policy so the public website's
-- behavior does not change, plus full access for staff.

alter table public.services enable row level security;
alter table public.inventory enable row level security;

create policy "anon can view services" on public.services
  for select to anon using (true);

create policy "anon can view inventory" on public.inventory
  for select to anon using (true);

create policy "staff full access to services" on public.services
  for all to authenticated using (true) with check (true);

create policy "staff full access to inventory" on public.inventory
  for all to authenticated using (true) with check (true);

create policy "staff full access to bookings" on public.bookings
  for all to authenticated using (true) with check (true);

create policy "staff full access to tickets" on public.tickets
  for all to authenticated using (true) with check (true);
