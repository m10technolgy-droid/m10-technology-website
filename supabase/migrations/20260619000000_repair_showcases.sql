-- Backs the homepage "recent repairs" slideshow: staff upload a before
-- photo + after photo for a repair from /admin/showcases, the homepage
-- shows the latest published ones in an auto-rotating carousel.

insert into storage.buckets (id, name, public)
values ('repair-photos', 'repair-photos', true)
on conflict (id) do nothing;

create policy "public read repair-photos" on storage.objects
  for select to public
  using (bucket_id = 'repair-photos');

create policy "staff upload repair-photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'repair-photos');

create policy "staff delete repair-photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'repair-photos');

create table public.repair_showcases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  before_image_path text not null,
  after_image_path text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.repair_showcases enable row level security;

create policy "anon can view published showcases" on public.repair_showcases
  for select to anon
  using (is_published = true);

create policy "staff full access to repair_showcases" on public.repair_showcases
  for all to authenticated using (true) with check (true);
