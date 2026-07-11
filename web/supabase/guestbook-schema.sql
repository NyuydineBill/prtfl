-- Run this in the Supabase SQL editor for your project.

create table if not exists guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);

alter table guestbook enable row level security;

create policy "public can read approved guestbook entries"
  on guestbook for select
  to public
  using (status = 'approved');

create policy "public can submit guestbook entries"
  on guestbook for insert
  to public
  with check (status = 'pending');

create policy "authenticated can manage guestbook"
  on guestbook for all
  to authenticated
  using (true)
  with check (true);
