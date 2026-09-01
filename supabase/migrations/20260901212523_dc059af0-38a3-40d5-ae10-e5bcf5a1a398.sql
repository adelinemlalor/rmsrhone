ALTER TABLE public.agenda_items ADD COLUMN IF NOT EXISTS personal_for uuid;

CREATE TABLE public.agenda_item_optouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  agenda_item_id uuid NOT NULL REFERENCES public.agenda_items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agenda_item_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_item_optouts TO authenticated;
GRANT ALL ON public.agenda_item_optouts TO service_role;

ALTER TABLE public.agenda_item_optouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read optouts" ON public.agenda_item_optouts
  FOR SELECT TO authenticated USING (public.is_trip_member(trip_id));

CREATE POLICY "own optouts insert" ON public.agenda_item_optouts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND public.is_trip_member(trip_id));

CREATE POLICY "own optouts update" ON public.agenda_item_optouts
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "own optouts delete" ON public.agenda_item_optouts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_optouts_trip ON public.agenda_item_optouts (trip_id);
CREATE INDEX idx_agenda_personal ON public.agenda_items (trip_id, personal_for);