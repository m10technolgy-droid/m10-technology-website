-- Adds storage capacity and battery health disclosure to second-hand
-- inventory listings.

alter table public.inventory add column storage_gb integer check (storage_gb > 0);
alter table public.inventory add column battery_health_percent integer check (battery_health_percent between 0 and 100);
