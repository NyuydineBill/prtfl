-- Run this in the Supabase SQL editor for your project.

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

-- Allow anyone (the public anon key, used by the browser contact form)
-- to insert a message, but never read, update, or delete them back.
create policy "public can insert messages"
  on messages for insert
  to anon
  with check (true);
