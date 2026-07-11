-- Run this in the Supabase SQL editor for your project.
-- Server-side rate limiting for the public /api/chat endpoint. The
-- underlying table has NO public policies at all — it's only reachable
-- through the security-definer function below, so anon keys can never
-- read or write it directly (no IP-hash scraping, no forging counts).

create table if not exists chat_requests (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_requests_ip_idx on chat_requests (ip_hash, created_at);

alter table chat_requests enable row level security;
-- Intentionally no policies — access only via check_chat_rate_limit().

create or replace function check_chat_rate_limit(
  p_ip_hash text,
  p_max_requests int default 20,
  p_window_minutes int default 60
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
  from chat_requests
  where ip_hash = p_ip_hash
    and created_at > now() - (p_window_minutes || ' minutes')::interval;

  if recent_count >= p_max_requests then
    return false;
  end if;

  insert into chat_requests (ip_hash) values (p_ip_hash);
  return true;
end;
$$;

grant execute on function check_chat_rate_limit(text, int, int) to anon, authenticated;
