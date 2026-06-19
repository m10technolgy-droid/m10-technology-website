-- Backs the /admin/sales report (total selling + profit, daily/weekly/
-- monthly). Profit needs a cost basis per sale that doesn't drift when a
-- later restock changes the buy price, so the cost is snapshotted onto
-- the sold entry itself (cost_price_rwf), pre-filled from the part's last
-- known buy price (last_buy_price_rwf, kept up to date by the existing
-- trigger, same way it already maintains selling_price_rwf).

alter table public.parts add column last_buy_price_rwf integer;

alter table public.part_stock_entries add column cost_price_rwf integer;

create or replace function public.apply_part_stock_entry()
returns trigger
language plpgsql
as $$
begin
  if new.entry_type = 'received' then
    update public.parts
    set stock_quantity = stock_quantity + new.quantity,
        selling_price_rwf = coalesce(new.selling_price_rwf, selling_price_rwf),
        last_buy_price_rwf = coalesce(new.buy_price_rwf, last_buy_price_rwf)
    where id = new.part_id;
  elsif new.entry_type = 'sold' then
    update public.parts set stock_quantity = stock_quantity - new.quantity where id = new.part_id;
  end if;
  return new;
end;
$$;
