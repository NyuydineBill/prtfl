-- Run this in the Supabase SQL editor for your project.
-- Creates a public storage bucket for article cover images.

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Anyone can view images in this bucket (it's public content on the site).
create policy "public can read post images"
  on storage.objects for select
  to public
  using (bucket_id = 'post-images');

-- Only a signed-in admin can upload, replace, or remove images.
create policy "authenticated can upload post images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images');

create policy "authenticated can update post images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'post-images')
  with check (bucket_id = 'post-images');

create policy "authenticated can delete post images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images');
