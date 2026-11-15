-- Flexible resources library. Kind is freeform so you can add any type
-- (book, cheatsheet, hack, guide, video, tool, template, etc.).
-- Run in the Supabase SQL editor.

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  kind text not null,
  summary text not null default '',
  body text,
  level text not null default 'intermediate'
    check (level in ('beginner', 'intermediate', 'advanced', 'all')),
  topics text[] not null default '{}',
  href text,
  cover_image text,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resources_status_kind_idx
  on resources (status, kind, sort_order, title);

alter table resources enable row level security;

drop policy if exists "public can read published resources" on resources;
create policy "public can read published resources"
  on resources for select
  to anon
  using (status = 'published');

drop policy if exists "authenticated can manage resources" on resources;
create policy "authenticated can manage resources"
  on resources for all
  to authenticated
  using (true)
  with check (true);
