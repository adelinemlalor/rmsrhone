create table public.stars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agenda_item_id uuid not null references public.agenda_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, agenda_item_id)
);

create index stars_user_id_idx on public.stars (user_id);

alter table public.stars enable row level security;

grant select, insert, delete on public.stars to authenticated;
grant all on public.stars to service_role;

create policy "own stars select"
on public.stars
for select
to authenticated
using (user_id = auth.uid());

create policy "own stars insert"
on public.stars
for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_trip_member(
    (select a.trip_id from public.agenda_items a where a.id = agenda_item_id)
  )
);

create policy "own stars delete"
on public.stars
for delete
to authenticated
using (user_id = auth.uid());
