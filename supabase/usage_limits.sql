-- Supabase setup for the Gemini AI daily usage limit.
-- Run this in Supabase Dashboard -> SQL Editor for your project.

create table if not exists public.usage_limits (
  user_id uuid not null,
  date date not null,
  count integer not null default 0,
  primary key (user_id, date)
);

alter table public.usage_limits enable row level security;

grant select, insert, update on public.usage_limits to authenticated;
grant select, insert, update, delete on public.usage_limits to service_role;

drop policy if exists "Users can read their own usage" on public.usage_limits;
create policy "Users can read their own usage"
on public.usage_limits
for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can insert their own usage" on public.usage_limits;
create policy "Users can insert their own usage"
on public.usage_limits
for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can update their own usage" on public.usage_limits;
create policy "Users can update their own usage"
on public.usage_limits
for update
to authenticated
using (auth.uid() is not null and auth.uid() = user_id)
with check (auth.uid() is not null and auth.uid() = user_id);

create or replace function public.increment_usage_limit(p_user_id uuid, p_date date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into usage_limits (user_id, date, count)
  values (p_user_id, p_date, 1)
  on conflict (user_id, date)
  do update
    set count = usage_limits.count + 1
    where usage_limits.count < 5
  returning count into new_count;

  if new_count is null then
    select count
    into new_count
    from usage_limits
    where user_id = p_user_id
      and date = p_date;
  end if;

  return new_count;
end;
$$;

revoke all on function public.increment_usage_limit(uuid, date) from public;
grant execute on function public.increment_usage_limit(uuid, date) to service_role;
