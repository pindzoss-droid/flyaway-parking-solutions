
-- Trigger: na svaki insert u reservations server prebriše estimated_price prema parking_settings,
-- i blokira ako parking nije dostupan / blokiran je za taj period. Tako anon klijent ne može varati.
CREATE OR REPLACE FUNCTION public.before_insert_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_price NUMERIC;
  v_currency TEXT;
  v_days INT;
  v_avail RECORD;
BEGIN
  IF NEW.departure_at <= NEW.arrival_at THEN
    RAISE EXCEPTION 'Departure must be after arrival';
  END IF;

  -- availability + blocked
  SELECT available_spots, total_spots, is_blocked INTO v_avail
  FROM public.check_availability(NEW.arrival_at, NEW.departure_at, NULL);

  IF v_avail.is_blocked THEN
    RAISE EXCEPTION 'Parking je nedostupan u odabranom periodu.';
  END IF;
  IF v_avail.available_spots <= 0 THEN
    RAISE EXCEPTION 'Parking je popunjen za odabrani period.';
  END IF;

  -- compute price authoritatively
  SELECT price_per_day, currency INTO v_price, v_currency
  FROM public.parking_settings WHERE id = 1;

  v_days := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (NEW.departure_at - NEW.arrival_at)) / 86400.0)::INT);
  NEW.estimated_price := ROUND(v_days * COALESCE(v_price, 0), 2);
  NEW.vehicle_plate := UPPER(NEW.vehicle_plate);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_before_insert_reservation ON public.reservations;
CREATE TRIGGER trg_before_insert_reservation
BEFORE INSERT ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.before_insert_reservation();
