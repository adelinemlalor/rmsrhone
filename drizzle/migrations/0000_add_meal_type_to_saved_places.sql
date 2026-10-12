ALTER TABLE public.saved_places ADD COLUMN meal text;
COMMENT ON COLUMN public.saved_places.meal IS 'For restaurant places: Breakfast, Lunch, or Dinner (null for other categories).';