
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- PARKING SETTINGS (single row)
CREATE TABLE public.parking_settings (
  id integer PRIMARY KEY DEFAULT 1,
  total_spots integer NOT NULL DEFAULT 30,
  price_per_day numeric(10,2) NOT NULL DEFAULT 15.00,
  currency text NOT NULL DEFAULT 'BAM',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

GRANT SELECT ON public.parking_settings TO anon, authenticated;
GRANT ALL ON public.parking_settings TO service_role;
ALTER TABLE public.parking_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings readable by everyone"
  ON public.parking_settings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage settings"
  ON public.parking_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.parking_settings (id, total_spots, price_per_day, currency)
VALUES (1, 30, 15.00, 'BAM');

-- BLOCKED PERIODS
CREATE TABLE public.blocked_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

GRANT SELECT ON public.blocked_periods TO anon, authenticated;
GRANT ALL ON public.blocked_periods TO service_role;
ALTER TABLE public.blocked_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blocked periods readable by everyone"
  ON public.blocked_periods FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage blocked periods"
  ON public.blocked_periods FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RESERVATIONS
CREATE TYPE public.reservation_status AS ENUM ('active', 'cancelled', 'no_show');

CREATE TABLE public.reservations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name text NOT NULL,
  vehicle_plate text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  arrival_at timestamptz NOT NULL,
  departure_at timestamptz NOT NULL,
  destination text,
  needs_airport_transfer boolean NOT NULL DEFAULT true,
  note text,
  status public.reservation_status NOT NULL DEFAULT 'active',
  estimated_price numeric(10,2) NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'online',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (departure_at > arrival_at)
);

CREATE INDEX reservations_arrival_idx ON public.reservations (arrival_at);
CREATE INDEX reservations_departure_idx ON public.reservations (departure_at);
CREATE INDEX reservations_status_idx ON public.reservations (status);

GRANT INSERT ON public.reservations TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Anyone can create a reservation (online form). Validation/limits enforced server-side.
CREATE POLICY "Anyone can create reservation"
  ON public.reservations FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read / update / delete
CREATE POLICY "Admins read reservations"
  ON public.reservations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update reservations"
  ON public.reservations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete reservations"
  ON public.reservations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER reservations_set_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER parking_settings_set_updated_at
BEFORE UPDATE ON public.parking_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- AVAILABILITY CHECK FUNCTION
-- Returns minimum number of free spots across the requested interval.
-- Uses 15-minute buckets across the [arrival, departure) window to find peak load.
CREATE OR REPLACE FUNCTION public.check_availability(
  _arrival timestamptz,
  _departure timestamptz,
  _exclude_id bigint DEFAULT NULL
)
RETURNS TABLE (available_spots integer, total_spots integer, is_blocked boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_total integer;
  v_max_overlap integer;
  v_blocked boolean;
BEGIN
  SELECT ps.total_spots INTO v_total FROM public.parking_settings ps WHERE ps.id = 1;

  SELECT EXISTS (
    SELECT 1 FROM public.blocked_periods bp
    WHERE daterange(bp.start_date, bp.end_date, '[]') && daterange(_arrival::date, _departure::date, '[]')
  ) INTO v_blocked;

  -- Max concurrent active reservations whose interval overlaps [_arrival, _departure)
  SELECT COALESCE(MAX(cnt), 0) INTO v_max_overlap FROM (
    SELECT COUNT(*) AS cnt
    FROM public.reservations r
    CROSS JOIN LATERAL (
      SELECT generate_series(_arrival, _departure - interval '1 minute', interval '15 minutes') AS t
    ) ticks
    WHERE r.status = 'active'
      AND (_exclude_id IS NULL OR r.id <> _exclude_id)
      AND r.arrival_at < _departure
      AND r.departure_at > _arrival
      AND ticks.t >= r.arrival_at
      AND ticks.t < r.departure_at
    GROUP BY ticks.t
  ) sub;

  RETURN QUERY SELECT (v_total - v_max_overlap)::integer, v_total, v_blocked;
END $$;

GRANT EXECUTE ON FUNCTION public.check_availability(timestamptz, timestamptz, bigint) TO anon, authenticated;
