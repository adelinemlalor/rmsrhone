
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  preferred_name text,
  avatar_url text,
  home_airport text,
  phone text,
  emergency_contact text,
  known_traveler_number text,
  frequent_flyer text,
  hotel_loyalty text,
  rental_car_programs text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  primary_destination text,
  additional_destinations text[] NOT NULL DEFAULT '{}',
  start_date date,
  end_date date,
  origin_city text,
  trip_type text NOT NULL DEFAULT 'Vacation',
  cover_image_url text,
  currency text NOT NULL DEFAULT 'USD',
  notes text,
  status text NOT NULL DEFAULT 'Planning',
  budget_total numeric,
  archived boolean NOT NULL DEFAULT false,
  is_template boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.trip_travelers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid,
  name text NOT NULL,
  email text,
  role text NOT NULL DEFAULT 'editor',
  color text NOT NULL DEFAULT 'brand',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trip_travelers TO authenticated;
GRANT ALL ON public.trip_travelers TO service_role;
ALTER TABLE public.trip_travelers ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_trip_member(_trip uuid, _uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.trips t WHERE t.id = _trip AND t.owner_id = _uid)
      OR EXISTS (SELECT 1 FROM public.trip_travelers tt WHERE tt.trip_id = _trip AND tt.user_id = _uid);
$$;

CREATE OR REPLACE FUNCTION public.can_edit_trip(_trip uuid, _uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.trips t WHERE t.id = _trip AND t.owner_id = _uid)
      OR EXISTS (SELECT 1 FROM public.trip_travelers tt WHERE tt.trip_id = _trip AND tt.user_id = _uid AND tt.role IN ('owner','editor'));
$$;

CREATE POLICY "read trips" ON public.trips FOR SELECT TO authenticated USING (public.is_trip_member(id, auth.uid()));
CREATE POLICY "create trips" ON public.trips FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND is_template = false);
CREATE POLICY "update trips" ON public.trips FOR UPDATE TO authenticated USING (public.can_edit_trip(id, auth.uid())) WITH CHECK (public.can_edit_trip(id, auth.uid()));
CREATE POLICY "delete trips" ON public.trips FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "read travelers" ON public.trip_travelers FOR SELECT TO authenticated USING (public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "write travelers" ON public.trip_travelers FOR ALL TO authenticated USING (public.can_edit_trip(trip_id, auth.uid())) WITH CHECK (public.can_edit_trip(trip_id, auth.uid()));

CREATE TABLE public.agenda_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  day_date date,
  start_time time,
  end_time time,
  time_zone text,
  category text NOT NULL DEFAULT 'Activity',
  title text NOT NULL,
  description text,
  location_name text,
  address text,
  city text,
  country text,
  latitude numeric,
  longitude numeric,
  map_url text,
  status text NOT NULL DEFAULT 'Planned',
  completed boolean NOT NULL DEFAULT false,
  confirmation_number text,
  booking_provider text,
  booking_url text,
  reservation_name text,
  reservation_email text,
  reservation_phone text,
  cost_estimated numeric,
  cost_actual numeric,
  currency text,
  paid boolean NOT NULL DEFAULT false,
  paid_by text,
  split_between text[] NOT NULL DEFAULT '{}',
  shared_expense boolean NOT NULL DEFAULT true,
  participants text[] NOT NULL DEFAULT '{}',
  contact_company text,
  contact_name text,
  contact_phone text,
  contact_email text,
  contact_website text,
  notes text,
  cancellation_deadline date,
  cancellation_policy text,
  refundable boolean,
  cancellation_notes text,
  transport_from text,
  transport_to text,
  transport_mode text,
  transport_departure_time time,
  transport_duration_minutes integer,
  transport_cost numeric,
  travel_next_mode text,
  travel_next_minutes integer,
  travel_next_note text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  saved_place_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX agenda_items_trip_idx ON public.agenda_items(trip_id, day_date, start_time);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agenda_items TO authenticated;
GRANT ALL ON public.agenda_items TO service_role;
ALTER TABLE public.agenda_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read agenda" ON public.agenda_items FOR SELECT TO authenticated USING (public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "write agenda" ON public.agenda_items FOR ALL TO authenticated USING (public.can_edit_trip(trip_id, auth.uid())) WITH CHECK (public.can_edit_trip(trip_id, auth.uid()));

CREATE TABLE public.saved_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Activity',
  location_name text,
  address text,
  city text,
  destination text,
  url text,
  image_url text,
  notes text,
  estimated_cost numeric,
  priority text NOT NULL DEFAULT 'Want to Do',
  tags text[] NOT NULL DEFAULT '{}',
  scheduled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_places TO authenticated;
GRANT ALL ON public.saved_places TO service_role;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read places" ON public.saved_places FOR SELECT TO authenticated USING (public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "write places" ON public.saved_places FOR ALL TO authenticated USING (public.can_edit_trip(trip_id, auth.uid())) WITH CHECK (public.can_edit_trip(trip_id, auth.uid()));

CREATE TABLE public.item_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  agenda_item_id uuid REFERENCES public.agenda_items(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Link',
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.item_links TO authenticated;
GRANT ALL ON public.item_links TO service_role;
ALTER TABLE public.item_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read links" ON public.item_links FOR SELECT TO authenticated USING (public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "write links" ON public.item_links FOR ALL TO authenticated USING (public.can_edit_trip(trip_id, auth.uid())) WITH CHECK (public.can_edit_trip(trip_id, auth.uid()));

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  agenda_item_id uuid REFERENCES public.agenda_items(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  file_path text,
  external_url text,
  mime_type text,
  uploaded_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read docs" ON public.documents FOR SELECT TO authenticated USING (public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "write docs" ON public.documents FOR ALL TO authenticated USING (public.can_edit_trip(trip_id, auth.uid())) WITH CHECK (public.can_edit_trip(trip_id, auth.uid()));

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  agenda_item_id uuid REFERENCES public.agenda_items(id) ON DELETE CASCADE,
  author_id uuid,
  author_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read comments" ON public.comments FOR SELECT TO authenticated USING (public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "write comments" ON public.comments FOR ALL TO authenticated USING (public.is_trip_member(trip_id, auth.uid())) WITH CHECK (public.is_trip_member(trip_id, auth.uid()));

CREATE TABLE public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  section text NOT NULL DEFAULT 'Before Departure',
  title text NOT NULL,
  notes text,
  due_date date,
  assigned_to text,
  completed boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_items TO authenticated;
GRANT ALL ON public.checklist_items TO service_role;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read checklist" ON public.checklist_items FOR SELECT TO authenticated USING (public.is_trip_member(trip_id, auth.uid()));
CREATE POLICY "write checklist" ON public.checklist_items FOR ALL TO authenticated USING (public.can_edit_trip(trip_id, auth.uid())) WITH CHECK (public.can_edit_trip(trip_id, auth.uid()));

CREATE POLICY "trip docs read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'trip-documents' AND public.is_trip_member(((storage.foldername(name))[1])::uuid, auth.uid()));
CREATE POLICY "trip docs write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'trip-documents' AND public.can_edit_trip(((storage.foldername(name))[1])::uuid, auth.uid()));
CREATE POLICY "trip docs delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'trip-documents' AND public.can_edit_trip(((storage.foldername(name))[1])::uuid, auth.uid()));

INSERT INTO public.trips (id, owner_id, name, primary_destination, additional_destinations, start_date, end_date, origin_city, trip_type, cover_image_url, currency, notes, status, budget_total, is_template)
VALUES ('11111111-1111-1111-1111-111111111111','00000000-0000-0000-0000-000000000000','Brazil Adventure','Rio de Janeiro', ARRAY['Ilha Grande','Búzios'],'2027-01-02','2027-01-14','San Francisco','Adventure',null,'USD','Summer in Brazil — beaches, hikes, and a lot of açaí.','Planning',15000,true);

INSERT INTO public.trip_travelers (trip_id, name, email, role, color) VALUES
 ('11111111-1111-1111-1111-111111111111','Adeline','adeline@example.com','owner','brand'),
 ('11111111-1111-1111-1111-111111111111','Sarah','sarah@example.com','editor','accent'),
 ('11111111-1111-1111-1111-111111111111','Emily','emily@example.com','editor','sun'),
 ('11111111-1111-1111-1111-111111111111','Megan','megan@example.com','viewer','clay');

INSERT INTO public.agenda_items (trip_id, day_date, start_time, end_time, category, title, location_name, address, city, country, status, confirmation_number, booking_provider, cost_estimated, cost_actual, currency, paid, paid_by, split_between, participants, notes, details, travel_next_mode, travel_next_minutes, sort_order) VALUES
('11111111-1111-1111-1111-111111111111','2027-01-02','06:30','07:15','Transportation','Leave for SFO','Home',null,'San Francisco','USA','Planned',null,null,45,null,'USD',false,null,'{}','{Adeline,Sarah,Emily,Megan}','Uber XL booked the night before.','{}','Drive',45,1),
('11111111-1111-1111-1111-111111111111','2027-01-02','10:15','21:40','Flight','Flight SFO → GIG','San Francisco International','780 S Airport Blvd','San Francisco','USA','Confirmed','LX-8F3K2Q','LATAM',1240,1240,'USD',true,'Adeline','{Adeline,Sarah,Emily,Megan}','{Adeline,Sarah,Emily,Megan}','Overnight flight, one stop in São Paulo. Check bags 3h before.','{"airline":"LATAM","flight_number":"LA 8181","departure_airport":"SFO","departure_terminal":"I","departure_gate":"A6","arrival_airport":"GIG","arrival_terminal":"2","seat":"14A","cabin":"Premium Economy","aircraft":"Boeing 787-9","baggage":"2 checked bags included","ticket_number":"045-2201883910"}',null,null,2),
('11111111-1111-1111-1111-111111111111','2027-01-03','22:30','23:15','Transportation','Private transfer GIG → Botafogo','Galeão Airport','Av. Vinte de Janeiro','Rio de Janeiro','Brazil','Reserved','TRF-99120','Rio Transfers',68,null,'USD',false,'Adeline','{Adeline,Sarah,Emily,Megan}','{Adeline,Sarah,Emily,Megan}','Driver meets us at arrivals with a sign.','{"vehicle":"Van (up to 6)","pickup":"Arrivals Hall B","dropoff":"Casa Botafogo"}',null,null,1),
('11111111-1111-1111-1111-111111111111','2027-01-03','23:30',null,'Hotel','Check-in · Casa Botafogo','Casa Botafogo','R. Sorocaba 200','Rio de Janeiro','Brazil','Confirmed','BRZ-8842','Booking.com',1860,930,'USD',false,'Adeline','{Adeline,Sarah,Emily,Megan}','{Adeline,Sarah,Emily,Megan}','Late check-in arranged. Breakfast until 10am.','{"check_in":"2027-01-03 23:30","check_out":"2027-01-08 11:00","room":"2 double rooms, ocean side","guests":4,"wifi":"casa-botafogo / praia2027","amenities":"Pool, breakfast, laundry","host":"Marina Duarte","host_phone":"+55 21 99812-4410","amount_remaining":930,"cancellation":"Free cancellation until Dec 20"}',null,null,2),
('11111111-1111-1111-1111-111111111111','2027-01-04','08:00','09:00','Restaurant','Breakfast at Casa Botafogo','Casa Botafogo','R. Sorocaba 200','Rio de Janeiro','Brazil','Planned',null,null,0,null,'USD',false,null,'{}','{Adeline,Sarah,Emily,Megan}','Included with the stay.','{}','Taxi',25,1),
('11111111-1111-1111-1111-111111111111','2027-01-04','09:30','13:00','Hiking','Hike Pedra da Gávea','Parque Nacional da Tijuca','Estr. Sargento Boulhosa','Rio de Janeiro','Brazil','Confirmed','GAV-55210','Rio Hiking Co.',45,45,'USD',true,'Sarah','{Adeline,Sarah,Emily}','{Adeline,Sarah,Emily}','Bring 2L water, grippy shoes. Guide meets at trailhead 9:15.','{"difficulty":"Hard","distance":"6.5 km round trip"}','Taxi',30,2),
('11111111-1111-1111-1111-111111111111','2027-01-04','14:00','16:00','Restaurant','Lunch at Aprazível','Aprazível','R. Aprazível 62, Santa Teresa','Rio de Janeiro','Brazil','Reserved','APZ-88213','Direct',120,null,'USD',false,'Adeline','{Adeline,Sarah,Emily,Megan}','{Adeline,Sarah,Emily,Megan}','Ask for a garden table with the bay view.','{}',null,null,3),
('11111111-1111-1111-1111-111111111111','2027-01-04','16:30','19:00','Free Time','Free time in Santa Teresa',null,null,'Rio de Janeiro','Brazil','Planned',null,null,null,null,'USD',false,null,'{}','{Adeline,Sarah,Emily,Megan}','Wander, coffee, souvenir shopping.','{}',null,null,4),
('11111111-1111-1111-1111-111111111111','2027-01-04','20:30','23:00','Nightlife','Samba at Rio Scenarium','Rio Scenarium','R. do Lavradio 20','Rio de Janeiro','Brazil','Need to Book',null,null,35,null,'USD',false,null,'{}','{Adeline,Sarah,Emily}','Live samba from 9. Cover charge at the door.','{}',null,null,5),
('11111111-1111-1111-1111-111111111111','2027-01-05','09:00','12:30','Activity','Christ the Redeemer + Tijuca Forest','Cristo Redentor','Parque Nacional da Tijuca','Rio de Janeiro','Brazil','Reserved','CR-40218','GetYourGuide',62,null,'USD',false,'Emily','{Adeline,Sarah,Emily,Megan}','{Adeline,Sarah,Emily,Megan}','Van picks us up at the hotel at 8:45.','{}',null,null,1),
('11111111-1111-1111-1111-111111111111','2027-01-05','15:00','18:00','Beach','Afternoon at Ipanema','Praia de Ipanema','Av. Vieira Souto','Rio de Janeiro','Brazil','Planned',null,null,20,null,'USD',false,null,'{}','{Adeline,Sarah,Emily,Megan}','Chair + umbrella rental at Posto 9.','{}',null,null,2),
('11111111-1111-1111-1111-111111111111','2027-01-08','13:00','15:00','Ferry','Ferry Conceição de Jacareí → Ilha Grande','Terminal de Barcas','Estr. Rio-Santos','Angra dos Reis','Brazil','Reserved','FER-2201','CCR Barcas',22,null,'USD',false,'Adeline','{Adeline,Sarah,Emily,Megan}','{Adeline,Sarah,Emily,Megan}','No cars on the island — pack light for the crossing.','{}',null,null,1),
('11111111-1111-1111-1111-111111111111','2027-01-08','15:30',null,'Hotel','Check-in · Pousada Naturalia','Pousada Naturalia','R. da Praia 100, Abraão','Ilha Grande','Brazil','Confirmed','NAT-7712','Pousada direct',940,940,'USD',true,'Emily','{Adeline,Sarah,Emily,Megan}','{Adeline,Sarah,Emily,Megan}','Bungalows 4 and 5, up the hill.','{"check_in":"2027-01-08 15:30","check_out":"2027-01-11 10:00","guests":4,"wifi":"naturalia / ilhagrande","amenities":"Breakfast, hammocks, kayaks"}',null,null,2),
('11111111-1111-1111-1111-111111111111','2027-01-09','08:30','15:00','Diving','Scuba at Lagoa Azul','Ilha Grande Dive Center','Rua Getúlio Vargas 13, Abraão','Ilha Grande','Brazil','Reserved','DIVE-3391','Ilha Grande Dive Center',120,null,'USD',false,'Sarah','{Adeline,Sarah,Emily}','{Adeline,Sarah,Emily}','Two tanks, boat leaves 8:45 sharp. Certification card required.','{}',null,null,1),
('11111111-1111-1111-1111-111111111111','2027-01-10','09:00','14:00','Activity','Waterfall trek to Cachoeira da Feiticeira','Cachoeira da Feiticeira',null,'Ilha Grande','Brazil','Planned',null,null,30,null,'USD',false,null,'{}','{Adeline,Sarah,Emily,Megan}','Boat one way, hike back through the forest.','{}',null,null,1),
('11111111-1111-1111-1111-111111111111','2027-01-11','11:00','16:00','Transportation','Transfer to Búzios','Ilha Grande','Abraão pier','Búzios','Brazil','Need to Book',null,null,95,null,'USD',false,null,'{}','{Adeline,Sarah,Emily,Megan}','Ferry + shared van. Roughly 5 hours door to door.','{}',null,null,1),
('11111111-1111-1111-1111-111111111111','2027-01-12','12:00','16:00','Beach','Praia da Ferradurinha',null,null,'Búzios','Brazil','Planned',null,null,null,null,'USD',false,null,'{}','{Adeline,Sarah,Emily,Megan}','Quiet cove, great snorkelling on the right side.','{}',null,null,1),
('11111111-1111-1111-1111-111111111111','2027-01-12','20:00','22:30','Restaurant','Dinner at Rocka Beach Lounge','Rocka Beach Lounge','Praia Brava','Búzios','Brazil','Confirmed','RCK-1180','Direct',240,240,'USD',true,'Adeline','{Adeline,Sarah,Emily,Megan}','{Adeline,Sarah,Emily,Megan}','Sunset table reserved for 8pm.','{}',null,null,2),
('11111111-1111-1111-1111-111111111111','2027-01-14','14:00','23:55','Flight','Flight GIG → SFO','Galeão Airport',null,'Rio de Janeiro','Brazil','Confirmed','LX-8F3K2Q','LATAM',0,null,'USD',true,'Adeline','{Adeline,Sarah,Emily,Megan}','{Adeline,Sarah,Emily,Megan}','Return leg of the same ticket.','{"airline":"LATAM","flight_number":"LA 8180","departure_airport":"GIG","arrival_airport":"SFO","seat":"14A","cabin":"Premium Economy"}',null,null,1),
('11111111-1111-1111-1111-111111111111',null,null,null,'Activity','Sugarloaf cable car at sunset','Pão de Açúcar',null,'Rio de Janeiro','Brazil','Idea',null,null,28,null,'USD',false,null,'{}','{}','Go 90 minutes before sunset.','{}',null,null,1),
('11111111-1111-1111-1111-111111111111',null,null,null,'Shopping','Feira de São Cristóvão',null,null,'Rio de Janeiro','Brazil','Idea',null,null,null,null,'USD',false,null,'{}','{}','Northeastern food and crafts market.','{}',null,null,2);

INSERT INTO public.saved_places (trip_id, name, category, location_name, city, destination, url, notes, estimated_cost, priority, tags) VALUES
('11111111-1111-1111-1111-111111111111','Confeitaria Colombo','Restaurant','Centro','Rio de Janeiro','Rio de Janeiro','https://confeitariacolombo.com.br','Belle-époque café. Go for the pastel de nata.',25,'Must Do','{cafe,historic}'),
('11111111-1111-1111-1111-111111111111','Praia Lopes Mendes','Beach','Ilha Grande','Ilha Grande','Ilha Grande',null,'2 hour hike or boat. Bring cash, no kiosks.',0,'Must Do','{beach,hike}'),
('11111111-1111-1111-1111-111111111111','Trilha do Pico do Papagaio','Hiking','Ilha Grande','Ilha Grande','Ilha Grande','https://www.alltrails.com','Sunrise hike, starts 2am with a guide.',60,'Maybe','{hike,sunrise}'),
('11111111-1111-1111-1111-111111111111','Bar Astor','Bar','Ipanema','Rio de Janeiro','Rio de Janeiro',null,'Caipirinhas on the beachfront.',30,'Want to Do','{drinks}'),
('11111111-1111-1111-1111-111111111111','Búzios boat tour','Tour','Armação dos Búzios','Búzios','Búzios','https://www.getyourguide.com','Full-day, 12 beaches, lunch included.',75,'Want to Do','{boat}');

INSERT INTO public.checklist_items (trip_id, section, title, notes, due_date, assigned_to, completed, sort_order) VALUES
('11111111-1111-1111-1111-111111111111','Before Booking','Compare flight prices SFO → GIG',null,'2026-10-01','Adeline',true,1),
('11111111-1111-1111-1111-111111111111','Before Booking','Decide Ilha Grande vs Paraty',null,'2026-10-10','Sarah',true,2),
('11111111-1111-1111-1111-111111111111','Before Departure','Yellow fever vaccination','Needs to be 10 days before arrival.','2026-12-20','Everyone',false,1),
('11111111-1111-1111-1111-111111111111','Before Departure','Notify banks of travel',null,'2026-12-28','Everyone',false,2),
('11111111-1111-1111-1111-111111111111','Documents','Check passport expiry (6 months)',null,'2026-09-15','Everyone',true,1),
('11111111-1111-1111-1111-111111111111','Documents','Travel insurance policy',null,'2026-12-01','Adeline',false,2),
('11111111-1111-1111-1111-111111111111','Packing','Reef-safe sunscreen',null,null,'Emily',false,1),
('11111111-1111-1111-1111-111111111111','Packing','Dive certification card',null,null,'Sarah',false,2),
('11111111-1111-1111-1111-111111111111','Reservations','Book Rio Scenarium tickets','Opens 30 days out.','2026-12-05','Megan',false,1);

CREATE OR REPLACE FUNCTION public.clone_sample_trip()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_trip uuid := gen_random_uuid();
  tpl uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  INSERT INTO public.trips (id, owner_id, name, primary_destination, additional_destinations, start_date, end_date, origin_city, trip_type, cover_image_url, currency, notes, status, budget_total, is_template)
  SELECT new_trip, NEW.id, name, primary_destination, additional_destinations, start_date, end_date, origin_city, trip_type, cover_image_url, currency, notes, status, budget_total, false
  FROM public.trips WHERE id = tpl;

  INSERT INTO public.trip_travelers (trip_id, user_id, name, email, role, color)
  SELECT new_trip, CASE WHEN role = 'owner' THEN NEW.id ELSE NULL END,
         CASE WHEN role = 'owner' THEN COALESCE(NEW.preferred_name, NEW.full_name, name) ELSE name END,
         CASE WHEN role = 'owner' THEN NEW.email ELSE email END, role, color
  FROM public.trip_travelers WHERE trip_id = tpl;

  INSERT INTO public.agenda_items (trip_id, day_date, start_time, end_time, category, title, description, location_name, address, city, country, status, confirmation_number, booking_provider, booking_url, cost_estimated, cost_actual, currency, paid, paid_by, split_between, participants, notes, details, travel_next_mode, travel_next_minutes, sort_order)
  SELECT new_trip, day_date, start_time, end_time, category, title, description, location_name, address, city, country, status, confirmation_number, booking_provider, booking_url, cost_estimated, cost_actual, currency, paid, paid_by, split_between, participants, notes, details, travel_next_mode, travel_next_minutes, sort_order
  FROM public.agenda_items WHERE trip_id = tpl;

  INSERT INTO public.saved_places (trip_id, name, category, location_name, address, city, destination, url, image_url, notes, estimated_cost, priority, tags)
  SELECT new_trip, name, category, location_name, address, city, destination, url, image_url, notes, estimated_cost, priority, tags
  FROM public.saved_places WHERE trip_id = tpl;

  INSERT INTO public.checklist_items (trip_id, section, title, notes, due_date, assigned_to, completed, sort_order)
  SELECT new_trip, section, title, notes, due_date, assigned_to, completed, sort_order
  FROM public.checklist_items WHERE trip_id = tpl;

  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_clone_sample_trip
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.clone_sample_trip();
