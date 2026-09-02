REVOKE ALL ON FUNCTION public.claim_traveler_invites() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.is_trip_member(uuid) FROM anon;