
do $$
declare r record;
begin
  for r in select tablename, policyname from pg_policies where schemaname='public' loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
  for r in select policyname from pg_policies where schemaname='storage' and tablename='objects' and policyname in ('trip docs read','trip docs write','trip docs delete') loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
  for r in select unnest(array['agenda_items','checklist_items','comments','documents','item_links','profiles','saved_places','trip_travelers','trips']) as t loop
    execute format('grant select, insert, update, delete on public.%I to anon, authenticated', r.t);
    execute format('grant all on public.%I to service_role', r.t);
    execute format('create policy "open access" on public.%I for all to anon, authenticated using (true) with check (true)', r.t);
  end loop;
end $$;

create policy "trip docs open" on storage.objects for all to anon, authenticated
  using (bucket_id = 'trip-documents') with check (bucket_id = 'trip-documents');
