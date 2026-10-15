-- Sayure TV: safely revoke access from an approved user.
-- Run once in Supabase SQL Editor before using the admin-panel button.
create or replace function public.revoke_user_access(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
  target_role text;
begin
  select role into actor_role
  from public.access_profiles
  where user_id = auth.uid()
    and status = 'approved'
    and role in ('owner','admin');

  if actor_role is null then
    raise exception 'Not authorized';
  end if;

  select role into target_role
  from public.access_profiles
  where user_id = target_user_id
  for update;

  if target_role is null then
    raise exception 'User not found';
  end if;

  if target_role = 'owner' or target_user_id = auth.uid() then
    raise exception 'Cannot revoke owner or own access';
  end if;

  if target_role = 'admin' and actor_role <> 'owner' then
    raise exception 'Only the owner may revoke an admin';
  end if;

  update public.access_profiles
  set status = 'rejected', approved_at = null, approved_by = auth.uid()
  where user_id = target_user_id;
end;
$$;

revoke all on function public.revoke_user_access(uuid) from public;
grant execute on function public.revoke_user_access(uuid) to authenticated;
