-- Fixes the M10T booking + repair-tracking flow: bookings and tickets exist
-- but were empty with no columns matching the app, and create_booking /
-- get_booking_status were never created. This recreates both tables clean
-- (safe: both were empty) and adds the two missing RPC functions the
-- frontend already calls (src/app/booking/booking-form.tsx and
-- src/app/track-status/page.tsx).

drop table if exists public.tickets;
drop table if exists public.bookings;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  service_id uuid not null references public.services (id),
  scheduled_at timestamptz not null,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  status text not null default 'not_started',
  technician_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lock both tables down: no direct anon access. All access goes through
-- the security definer functions below, so customers can only create a
-- booking or read back their own booking (by id + phone), never browse
-- other customers' data or the tickets table directly.
alter table public.bookings enable row level security;
alter table public.tickets enable row level security;

create or replace function public.create_booking(
  p_full_name text,
  p_phone text,
  p_service_id uuid,
  p_scheduled_at timestamptz,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking_id uuid;
begin
  insert into public.bookings (full_name, phone, service_id, scheduled_at, notes)
  values (p_full_name, p_phone, p_service_id, p_scheduled_at, p_notes)
  returning id into v_booking_id;

  return v_booking_id;
end;
$$;

create or replace function public.get_booking_status(
  p_booking_id uuid,
  p_phone text
)
returns table (
  booking_status text,
  scheduled_at timestamptz,
  service_name text,
  ticket_status text,
  technician_notes text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    b.status as booking_status,
    b.scheduled_at,
    s.name as service_name,
    t.status as ticket_status,
    t.technician_notes
  from public.bookings b
  join public.services s on s.id = b.service_id
  left join public.tickets t on t.booking_id = b.id
  where b.id = p_booking_id
    and b.phone = p_phone;
$$;

grant execute on function public.create_booking(text, text, uuid, timestamptz, text) to anon;
grant execute on function public.get_booking_status(uuid, text) to anon;
