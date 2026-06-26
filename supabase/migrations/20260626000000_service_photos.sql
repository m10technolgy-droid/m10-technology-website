-- Adds an optional photo per service, shown on the public /services page.
-- Reuses the existing public "repair-photos" storage bucket and its RLS
-- policies (public read, staff upload/delete) rather than adding a new one.

alter table public.services add column image_path text;
