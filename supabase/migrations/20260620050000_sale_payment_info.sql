-- Adds payment method (cash/momo/crypto) and payment status (paid now vs
-- pay later) to sale entries. Only meaningful on 'sold' entries.

alter table public.part_stock_entries add column payment_method text;
alter table public.part_stock_entries add column payment_status text;
