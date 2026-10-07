-- Run this once in the Supabase SQL Editor to enable order recording.
-- Public visitors can create pending orders. Only admins can read, update, or delete them.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text,
  customer_name text not null check (length(trim(customer_name)) > 0),
  customer_phone text not null check (length(trim(customer_phone)) > 0),
  fulfillment text not null check (fulfillment in ('delivery', 'pickup')),
  address text not null default '',
  order_note text,
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  total bigint not null check (total > 0),
  status text not null default 'pending' check (status in ('pending', 'successful', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists order_code text;

update public.orders
set order_code = 'HMP-' || upper(substr(replace(id::text, '-', ''), 1, 12))
where order_code is null;

alter table public.orders alter column order_code set not null;
create unique index if not exists orders_order_code_key on public.orders (order_code);

alter table public.orders enable row level security;

drop policy if exists "Visitors can create pending orders" on public.orders;
create policy "Visitors can create pending orders"
on public.orders for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
on public.orders for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update order status" on public.orders;
create policy "Admins can update order status"
on public.orders for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
on public.orders for delete
to authenticated
using (public.is_admin());

revoke all on public.orders from public, anon, authenticated;
grant insert (id, order_code, customer_name, customer_phone, fulfillment, address, order_note, items, total)
on public.orders to anon, authenticated;
grant select on public.orders to authenticated;
grant update (status) on public.orders to authenticated;
grant delete on public.orders to authenticated;

notify pgrst, 'reload schema';
