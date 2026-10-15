-- Sayure TV: harden cross-device library synchronization.
-- Safe to run more than once in Supabase SQL Editor.

-- Remove accidental duplicate rows first, keeping the most recently updated row.
with ranked as (
  select ctid,
         row_number() over (
           partition by user_id, tmdb_id, media_type
           order by updated_at desc nulls last, ctid desc
         ) as rn
  from public.library
)
delete from public.library l
using ranked r
where l.ctid = r.ctid
  and r.rn > 1;

-- Required by the web app's UPSERT operation.
create unique index if not exists library_user_tmdb_media_unique
on public.library (user_id, tmdb_id, media_type);

-- Keep access private to the signed-in, approved owner of each row.
alter table public.library enable row level security;

drop policy if exists "approved users read own library" on public.library;
create policy "approved users read own library" on public.library
for select to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.access_profiles p
    where p.user_id = auth.uid() and p.status = 'approved'
  )
);

drop policy if exists "approved users insert own library" on public.library;
create policy "approved users insert own library" on public.library
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.access_profiles p
    where p.user_id = auth.uid() and p.status = 'approved'
  )
);

drop policy if exists "approved users update own library" on public.library;
create policy "approved users update own library" on public.library
for update to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.access_profiles p
    where p.user_id = auth.uid() and p.status = 'approved'
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.access_profiles p
    where p.user_id = auth.uid() and p.status = 'approved'
  )
);

drop policy if exists "approved users delete own library" on public.library;
create policy "approved users delete own library" on public.library
for delete to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.access_profiles p
    where p.user_id = auth.uid() and p.status = 'approved'
  )
);