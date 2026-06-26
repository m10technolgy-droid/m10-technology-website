-- Adds parts-replacement transparency to second-hand inventory listings:
-- which of screen/battery/camera were swapped, whether each replacement
-- part is genuine or aftermarket, and whether Face ID still works
-- (null = not applicable, e.g. non-Face ID device).

alter table public.inventory add column screen_changed boolean not null default false;
alter table public.inventory add column screen_genuine boolean;
alter table public.inventory add column battery_changed boolean not null default false;
alter table public.inventory add column battery_genuine boolean;
alter table public.inventory add column camera_changed boolean not null default false;
alter table public.inventory add column camera_genuine boolean;
alter table public.inventory add column faceid_working boolean;
