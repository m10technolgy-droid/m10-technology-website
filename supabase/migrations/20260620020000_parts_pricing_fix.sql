-- Fixes a bug in 20260620010000: the apply_part_stock_entry trigger reads
-- new.selling_price_rwf off the part_stock_entries row (to push an updated
-- list price onto parts), but that column was only added to parts, not to
-- part_stock_entries itself. Add it here.

alter table public.part_stock_entries add column selling_price_rwf integer;
