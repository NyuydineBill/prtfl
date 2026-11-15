-- Scheduling: published posts only become public once published_at has arrived.
-- Run in the Supabase SQL editor.

drop policy if exists "public can read published posts" on posts;

create policy "public can read published posts"
  on posts for select
  to anon
  using (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  );
