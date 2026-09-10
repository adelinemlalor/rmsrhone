ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS loyalty_programs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS passport_number text,
  ADD COLUMN IF NOT EXISTS passport_expiry date;

UPDATE public.profiles p
SET loyalty_programs = (
  SELECT coalesce(jsonb_agg(e), '[]'::jsonb) FROM (
    SELECT jsonb_build_object('id', gen_random_uuid(), 'kind', k, 'program', v, 'number', '') AS e
    FROM (VALUES ('air', p.frequent_flyer), ('hotel', p.hotel_loyalty), ('car', p.rental_car_programs)) AS t(k, v)
    WHERE v IS NOT NULL AND btrim(v) <> ''
  ) s
)
WHERE p.loyalty_programs = '[]'::jsonb;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS emergency_contact;