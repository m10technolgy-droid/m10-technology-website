-- Adds buy/sell pricing to the parts stock ledger. A part's current
-- selling price is set (or updated) whenever staff add stock, and each
-- sale entry records the actual price it went for, which can differ
-- from the list selling price.

alter table public.parts add column selling_price_rwf integer;

alter table public.part_stock_entries add column buy_price_rwf integer;
alter table public.part_stock_entries add column sale_price_rwf integer;

create or replace function public.apply_part_stock_entry()
returns trigger
language plpgsql
as $$
begin
  if new.entry_type = 'received' then
    update public.parts
    set stock_quantity = stock_quantity + new.quantity,
        selling_price_rwf = coalesce(new.selling_price_rwf, selling_price_rwf)
    where id = new.part_id;
  elsif new.entry_type = 'sold' then
    update public.parts set stock_quantity = stock_quantity - new.quantity where id = new.part_id;
  end if;
  return new;
end;
$$;
