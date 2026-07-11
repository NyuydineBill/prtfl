-- Run this in the Supabase SQL editor for your project.

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  name text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_idx on comments (post_id, status);

alter table comments enable row level security;

-- Public can read only approved comments.
create policy "public can read approved comments"
  on comments for select
  to public
  using (status = 'approved');

-- Public can submit a comment, but only as 'pending' — the check blocks a
-- client from inserting itself directly as 'approved'.
create policy "public can submit comments"
  on comments for insert
  to public
  with check (status = 'pending');

-- A signed-in admin moderates: read every comment, approve, or delete.
create policy "authenticated can manage comments"
  on comments for all
  to authenticated
  using (true)
  with check (true);
