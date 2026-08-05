-- Run this in the Supabase SQL editor for your project.

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  parent_id uuid references comments(id) on delete cascade,
  name text not null,
  body text not null,
  status text not null default 'approved' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);

-- Safe upgrade path for projects that created the comments table previously.
alter table comments add column if not exists parent_id uuid references comments(id) on delete cascade;
alter table comments alter column status set default 'approved';
update comments set status = 'approved' where status = 'pending';

create index if not exists comments_post_idx on comments (post_id, status);
create index if not exists comments_parent_idx on comments (parent_id, created_at);

alter table comments enable row level security;

-- Public can read only approved comments.
drop policy if exists "public can read approved comments" on comments;
create policy "public can read approved comments"
  on comments for select
  to public
  using (status = 'approved');

-- Comments are temporarily published immediately. Keep the explicit check so
-- callers cannot invent additional moderation states.
drop policy if exists "public can submit comments" on comments;
create policy "public can submit comments"
  on comments for insert
  to public
  with check (status = 'approved');

-- A signed-in admin moderates: read every comment, approve, or delete.
drop policy if exists "authenticated can manage comments" on comments;
create policy "authenticated can manage comments"
  on comments for all
  to authenticated
  using (true)
  with check (true);
