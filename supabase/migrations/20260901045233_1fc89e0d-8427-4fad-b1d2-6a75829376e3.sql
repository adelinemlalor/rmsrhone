DROP TRIGGER IF EXISTS profiles_clone_sample_trip ON public.profiles;
DROP FUNCTION IF EXISTS public.clone_sample_trip();

-- remove the template trip entirely
DELETE FROM public.agenda_items WHERE trip_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM public.saved_places WHERE trip_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM public.checklist_items WHERE trip_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM public.trip_travelers WHERE trip_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM public.documents WHERE trip_id = '11111111-1111-1111-1111-111111111111';
DELETE FROM public.trips WHERE id = '11111111-1111-1111-1111-111111111111';

-- remove seeded demo rows from the real trip, keeping user-added plan items
DELETE FROM public.agenda_items WHERE trip_id = 'ec6abad9-39f2-4daa-84d4-27d77b7421e8' AND created_at < '2026-09-01';
DELETE FROM public.saved_places WHERE trip_id = 'ec6abad9-39f2-4daa-84d4-27d77b7421e8' AND created_at < '2026-09-01';
DELETE FROM public.checklist_items WHERE trip_id = 'ec6abad9-39f2-4daa-84d4-27d77b7421e8' AND created_at < '2026-09-01';
DELETE FROM public.documents WHERE trip_id = 'ec6abad9-39f2-4daa-84d4-27d77b7421e8' AND created_at < '2026-09-01';

-- drop any other template trips
DELETE FROM public.trips WHERE is_template = true;