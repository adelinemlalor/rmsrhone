
drop function if exists public.can_edit_trip(uuid);
drop function if exists public.can_edit_trip(uuid, uuid);
drop function if exists public.is_trip_member(uuid);
drop function if exists public.is_trip_member(uuid, uuid);
revoke execute on function public.clone_sample_trip() from anon, authenticated, public;
