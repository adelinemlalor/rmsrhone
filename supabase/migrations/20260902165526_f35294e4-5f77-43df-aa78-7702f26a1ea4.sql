CREATE OR REPLACE FUNCTION public.is_trip_member(_trip_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (select 1 from public.trips t where t.id = _trip_id and t.owner_id = auth.uid())
      or exists (
        select 1 from public.trip_travelers tt
        where tt.trip_id = _trip_id
          and (
            tt.user_id = auth.uid()
            or (tt.email is not null and lower(tt.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
          )
      );
$function$;

CREATE OR REPLACE FUNCTION public.claim_traveler_invites()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if new.email is not null then
    update public.trip_travelers
      set user_id = new.id
      where user_id is null and lower(email) = lower(new.email);
  end if;
  return new;
end;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created_claim_invites ON auth.users;
CREATE TRIGGER on_auth_user_created_claim_invites
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.claim_traveler_invites();

UPDATE public.trip_travelers tt
SET user_id = u.id
FROM auth.users u
WHERE tt.user_id IS NULL AND tt.email IS NOT NULL AND lower(tt.email) = lower(u.email);