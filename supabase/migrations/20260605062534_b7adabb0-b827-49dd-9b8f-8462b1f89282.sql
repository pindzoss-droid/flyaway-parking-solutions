
-- Pricing tiers table: 3 fixed tiers (1, 2, 3). Tier 3 has no day_to (open-ended).
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
  tier_index int PRIMARY KEY CHECK (tier_index BETWEEN 1 AND 3),
  day_to int,
  price_per_day numeric NOT NULL CHECK (price_per_day >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pricing_tiers TO anon, authenticated;
GRANT ALL ON public.pricing_tiers TO service_role;

ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pricing tiers readable by everyone"
ON public.pricing_tiers FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage pricing tiers"
ON public.pricing_tiers FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_pricing_tiers_updated_at
BEFORE UPDATE ON public.pricing_tiers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed defaults: tier1 1-10 @10, tier2 11-20 @8, tier3 21+ @6
INSERT INTO public.pricing_tiers (tier_index, day_to, price_per_day) VALUES
  (1, 10, 10),
  (2, 20, 8),
  (3, NULL, 6)
ON CONFLICT (tier_index) DO NOTHING;

-- Helper: calculate total price for a given number of days using the tiers.
-- Whole booking is billed at the tier rate matching total days.
CREATE OR REPLACE FUNCTION public.calculate_price_for_days(_days int)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t1_to int; t1_price numeric;
  t2_to int; t2_price numeric;
  t3_price numeric;
  rate numeric;
BEGIN
  SELECT day_to, price_per_day INTO t1_to, t1_price FROM public.pricing_tiers WHERE tier_index = 1;
  SELECT day_to, price_per_day INTO t2_to, t2_price FROM public.pricing_tiers WHERE tier_index = 2;
  SELECT price_per_day INTO t3_price FROM public.pricing_tiers WHERE tier_index = 3;

  IF _days <= COALESCE(t1_to, 10) THEN
    rate := t1_price;
  ELSIF _days <= COALESCE(t2_to, 20) THEN
    rate := t2_price;
  ELSE
    rate := t3_price;
  END IF;

  RETURN ROUND(GREATEST(1, _days) * COALESCE(rate, 0), 2);
END;
$$;

-- Update before-insert trigger to use tiered pricing instead of flat price_per_day
CREATE OR REPLACE FUNCTION public.before_insert_reservation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_days INT;
  v_avail RECORD;
BEGIN
  IF NEW.departure_at <= NEW.arrival_at THEN
    RAISE EXCEPTION 'Departure must be after arrival';
  END IF;

  SELECT available_spots, total_spots, is_blocked INTO v_avail
  FROM public.check_availability(NEW.arrival_at, NEW.departure_at, NULL);

  IF v_avail.is_blocked THEN
    RAISE EXCEPTION 'Parking je nedostupan u odabranom periodu.';
  END IF;
  IF v_avail.available_spots <= 0 THEN
    RAISE EXCEPTION 'Parking je popunjen za odabrani period.';
  END IF;

  v_days := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (NEW.departure_at - NEW.arrival_at)) / 86400.0)::INT);
  NEW.estimated_price := public.calculate_price_for_days(v_days);
  NEW.vehicle_plate := UPPER(NEW.vehicle_plate);

  RETURN NEW;
END;
$function$;
