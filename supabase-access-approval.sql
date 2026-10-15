-- Sayure TV private access approval
-- Run once in Supabase SQL Editor before enabling the approval UI.

create table if not exists public.access_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('owner','admin','user')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id)
);

alter table public.access_profiles enable row level security;

create or replace function public.is_sayure_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.access_profiles p
    where p.user_id = auth.uid()
      and p.status = 'approved'
      and p.role in ('owner','admin')
  );
$$;

create or replace function public.handle_sayure_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.access_profiles (user_id,email,role,status,approved_at)
  values (
    new.id,
    lower(coalesce(new.email,'')),
    case
      when lower(coalesce(new.email,'')) = 'alissonbueno2012@gmail.com' then 'owner'
      when lower(coalesce(new.email,'')) = 'sayuremiranda@gmail.com' then 'admin'
      else 'user'
    end,
    case
      when lower(coalesce(new.email,'')) in ('alissonbueno2012@gmail.com','sayuremiranda@gmail.com') then 'approved'
      else 'pending'
    end,
    case
      when lower(coalesce(new.email,'')) in ('alissonbueno2012@gmail.com','sayuremiranda@gmail.com') then now()
      else null
    end
  ) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_sayure_user_created on auth.users;
create trigger on_sayure_user_created
after insert on auth.users
for each row execute procedure public.handle_sayure_signup();

-- Backfill existing accounts, including the two administrators.
insert into public.access_profiles (user_id,email,role,status,approved_at)
select id, lower(coalesce(email,'')),
  case
    when lower(coalesce(email,'')) = 'alissonbueno2012@gmail.com' then 'owner'
    when lower(coalesce(email,'')) = 'sayuremiranda@gmail.com' then 'admin'
    else 'user'
  end,
  case
    when lower(coalesce(email,'')) in ('alissonbueno2012@gmail.com','sayuremiranda@gmail.com') then 'approved'
    else 'pending'
  end,
  case
    when lower(coalesce(email,'')) in ('alissonbueno2012@gmail.com','sayuremiranda@gmail.com') then now()
    else null
  end
from auth.users
on conflict (user_id) do update set
  email=excluded.email,
  role=excluded.role,
  status=case when excluded.role in ('owner','admin') then 'approved' else access_profiles.status end,
  approved_at=case when excluded.role in ('owner','admin') then coalesce(access_profiles.approved_at,now()) else access_profiles.approved_at end;

drop policy if exists "read own access profile" on public.access_profiles;
create policy "read own access profile" on public.access_profiles
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "admins read access profiles" on public.access_profiles;
create policy "admins read access profiles" on public.access_profiles
for select to authenticated
using (public.is_sayure_admin());

drop policy if exists "admins update access profiles" on public.access_profiles;
create policy "admins update access profiles" on public.access_profiles
for update to authenticated
using (public.is_sayure_admin())
with check (
  public.is_sayure_admin()
  and role <> 'owner'
);

-- Protect the library itself: only approved users may read/write rows.
-- These policies assume public.library already has RLS enabled and user_id ownership.
alter table public.library enable row level security;

drop policy if exists "approved users read own library" on public.library;
create policy "approved users read own library" on public.library
for select to authenticated
using (
  user_id = auth.uid()
  and exists (select 1 from public.access_profiles p where p.user_id=auth.uid() and p.status='approved')
);

drop policy if exists "approved users insert own library" on public.library;
create policy "approved users insert own library" on public.library
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (select 1 from public.access_profiles p where p.user_id=auth.uid() and p.status='approved')
);

drop policy if exists "approved users update own library" on public.library;
create policy "approved users update own library" on public.library
for update to authenticated
using (
  user_id = auth.uid()
  and exists (select 1 from public.access_profiles p where p.user_id=auth.uid() and p.status='approved')
)
with check (user_id = auth.uid());

drop policy if exists "approved users delete own library" on public.library;
create policy "approved users delete own library" on public.library
for delete to authenticated
using (
  user_id = auth.uid()
  and exists (select 1 from public.access_profiles p where p.user_id=auth.uid() and p.status='approved')
);