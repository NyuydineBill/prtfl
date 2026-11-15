-- Run this in the Supabase SQL editor for your project.

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text not null,
  cover_image text,
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  ai_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table posts enable row level security;

-- Anyone (anon key) can read published posts whose publish time has arrived.
-- Schedule by setting status='published' with a future published_at.
create policy "public can read published posts"
  on posts for select
  to anon
  using (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  );

-- A signed-in admin (there's only one) can read, create, edit, and delete
-- every post, published or draft.
create policy "authenticated can manage posts"
  on posts for all
  to authenticated
  using (true)
  with check (true);
