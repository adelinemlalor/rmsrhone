
REVOKE EXECUTE ON FUNCTION public.is_trip_member(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.can_edit_trip(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.clone_sample_trip() FROM anon, authenticated, public;
