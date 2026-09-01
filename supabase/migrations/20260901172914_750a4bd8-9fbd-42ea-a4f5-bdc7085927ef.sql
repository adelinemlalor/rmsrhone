-- helper
create or replace function public.is_trip_member(_trip_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.trips t where t.id = _trip_id and t.owner_id = auth.uid())
      or exists (select 1 from public.trip_travelers tt where tt.trip_id = _trip_id and tt.user_id = auth.uid());
$$;

-- drop open policies + anon grants
drop policy if exists "open access" on public.trips;
drop policy if exists "open access" on public.trip_travelers;
drop policy if exists "open access" on public.agenda_items;
drop policy if exists "open access" on public.saved_places;
drop policy if exists "open access" on public.checklist_items;
drop policy if exists "open access" on public.documents;
drop policy if exists "open access" on public.comments;
drop policy if exists "open access" on public.item_links;
drop policy if exists "open access" on public.profiles;
drop policy if exists "trip docs open" on storage.objects;

revoke all on public.trips, public.trip_travelers, public.agenda_items, public.saved_places,
  public.checklist_items, public.documents, public.comments, public.item_links, public.profiles from anon;

grant select, insert, update, delete on public.trips, public.trip_travelers, public.agenda_items,
  public.saved_places, public.checklist_items, public.documents, public.comments,
  public.item_links, public.profiles to authenticated;
grant all on public.trips, public.trip_travelers, public.agenda_items, public.saved_places,
  public.checklist_items, public.documents, public.comments, public.item_links, public.profiles to service_role;

-- profiles
create policy "own profile" on public.profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- trips
create policy "members read trips" on public.trips for select to authenticated
  using (owner_id = auth.uid() or public.is_trip_member(id));
create policy "create own trips" on public.trips for insert to authenticated
  with check (owner_id = auth.uid());
create policy "members update trips" on public.trips for update to authenticated
  using (owner_id = auth.uid() or public.is_trip_member(id))
  with check (owner_id = auth.uid() or public.is_trip_member(id));
create policy "owner deletes trips" on public.trips for delete to authenticated
  using (owner_id = auth.uid());

-- travelers
create policy "members manage travelers" on public.trip_travelers for all to authenticated
  using (user_id = auth.uid() or public.is_trip_member(trip_id))
  with check (public.is_trip_member(trip_id));

-- child tables
create policy "members manage agenda" on public.agenda_items for all to authenticated
  using (public.is_trip_member(trip_id)) with check (public.is_trip_member(trip_id));
create policy "members manage saved" on public.saved_places for all to authenticated
  using (public.is_trip_member(trip_id)) with check (public.is_trip_member(trip_id));
create policy "members manage checklist" on public.checklist_items for all to authenticated
  using (public.is_trip_member(trip_id)) with check (public.is_trip_member(trip_id));
create policy "members manage documents" on public.documents for all to authenticated
  using (public.is_trip_member(trip_id)) with check (public.is_trip_member(trip_id));
create policy "members manage comments" on public.comments for all to authenticated
  using (public.is_trip_member(trip_id)) with check (public.is_trip_member(trip_id));
create policy "members manage links" on public.item_links for all to authenticated
  using (public.is_trip_member(trip_id)) with check (public.is_trip_member(trip_id));

-- storage: trip-documents paths are "<trip_id>/..." or "photos/<trip_id>/..."
create policy "members read trip files" on storage.objects for select to authenticated
  using (bucket_id = 'trip-documents');
create policy "members write trip files" on storage.objects for insert to authenticated
  with check (bucket_id = 'trip-documents');
create policy "members update trip files" on storage.objects for update to authenticated
  using (bucket_id = 'trip-documents');
create policy "members delete trip files" on storage.objects for delete to authenticated
  using (bucket_id = 'trip-documents');

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, preferred_name)
  values (new.id, new.email,
    nullif(new.raw_user_meta_data ->> 'full_name',''),
    split_part(coalesce(nullif(new.raw_user_meta_data ->> 'full_name',''), new.email), ' ', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();