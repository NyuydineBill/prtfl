-- Run this in the Supabase SQL editor for your project.
-- Powers both article reactions and project upvotes.

create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'project')),
  target_id text not null,
  emoji text not null default '👍',
  created_at timestamptz not null default now()
);

create index if not exists reactions_target_idx on reactions (target_type, target_id, emoji);

alter table reactions enable row level security;

-- Counts are public (rendered on articles and project cards); anyone can
-- add a reaction. There's no per-visitor dedup at the database level — the
-- UI soft-guards with localStorage. Low-stakes signal, not a vote system.
create policy "public can read reactions"
  on reactions for select
  to public
  using (true);

create policy "public can add reactions"
  on reactions for insert
  to public
  with check (true);
