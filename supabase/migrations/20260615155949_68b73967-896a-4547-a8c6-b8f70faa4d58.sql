
-- reservations: anon + authenticated need INSERT (policy allows it); admin reads/updates via authenticated
GRANT INSERT ON public.reservations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;

-- parking_settings: public read, admin write
GRANT SELECT ON public.parking_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parking_settings TO authenticated;
GRANT ALL ON public.parking_settings TO service_role;

-- pricing_tiers: public read, admin write
GRANT SELECT ON public.pricing_tiers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_tiers TO authenticated;
GRANT ALL ON public.pricing_tiers TO service_role;

-- blocked_periods: public read, admin write
GRANT SELECT ON public.blocked_periods TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocked_periods TO authenticated;
GRANT ALL ON public.blocked_periods TO service_role;

-- user_roles: auth-only read (has_role uses SECURITY DEFINER)
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
