-- Run this in the Supabase SQL editor for your project.

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

alter table subscribers enable row level security;

-- Public can subscribe, but never read the list back (protects emails from
-- being scraped through the anon key). Only the signed-in admin can view
-- or remove entries.
create policy "public can subscribe"
  on subscribers for insert
  to public
  with check (true);

create policy "authenticated can manage subscribers"
  on subscribers for all
  to authenticated
  using (true)
  with check (true);

-- Note: this table only captures emails. Actually notifying subscribers
-- when a new article publishes requires wiring up an email provider
-- (e.g. Resend, Postmark) — not included here.
