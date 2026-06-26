-- Adds an optional description per repair showcase, shown when a visitor
-- clicks a slide on the homepage to see more detail.

alter table public.repair_showcases add column description text;
