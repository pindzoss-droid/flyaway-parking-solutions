import { supabase } from "@/integrations/supabase/client";

// ============ Public types ============
export type Availability = { available_spots: number; total_spots: number; is_blocked: boolean };
export type Settings = { total_spots: number; price_per_day: number; currency: string };
export type PricingTier = { tier_index: number; day_to: number | null; price_per_day: number };
export type Reservation = {
  id: number;
  full_name: string;
  vehicle_plate: string;
  contact_email: string;
  contact_phone: string;
  arrival_at: string;
  departure_at: string;
  destination: string | null;
  note: string | null;
  status: "active" | "cancelled" | "no_show" | "completed";
  estimated_price: number;
  source: string;
  needs_airport_transfer: boolean;
  created_at: string;
};
export type BlockedPeriod = { id: string; start_date: string; end_date: string; reason: string | null };

// ============ Public reads ============
export async function getPublicSettings(): Promise<Settings> {
  const { data, error } = await supabase
    .from("parking_settings")
    .select("total_spots, price_per_day, currency")
    .eq("id", 1)
    .single();
  if (error) throw new Error(error.message);
  return { ...data, price_per_day: Number(data.price_per_day) } as Settings;
}

export async function checkAvailability(arrival_at: string, departure_at: string): Promise<Availability> {
  const { data, error } = await supabase.rpc("check_availability", {
    _arrival: arrival_at,
    _departure: departure_at,
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return row as Availability;
}

// ============ Public insert (RLS allows anon INSERT; trigger validates + prices) ============
export type NewReservationInput = {
  full_name: string;
  vehicle_plate: string;
  contact_email: string;
  contact_phone: string;
  arrival_at: string;
  departure_at: string;
  destination?: string | null;
  needs_airport_transfer: boolean;
  note?: string | null;
};

export async function createReservation(input: NewReservationInput): Promise<void> {
  const { error } = await supabase.from("reservations").insert({
    full_name: input.full_name.trim(),
    vehicle_plate: input.vehicle_plate.trim(),
    contact_email: input.contact_email.trim(),
    contact_phone: input.contact_phone.trim(),
    arrival_at: input.arrival_at,
    departure_at: input.departure_at,
    destination: input.destination ?? null,
    needs_airport_transfer: input.needs_airport_transfer,
    note: input.note ?? null,
    source: "online",
  });
  if (error) throw new Error(error.message);
}

// ============ Admin (RLS enforces admin role) ============
export async function listReservations(): Promise<Reservation[]> {
  // Auto-complete: any active reservation whose departure has passed becomes "completed"
  await supabase
    .from("reservations")
    .update({ status: "completed" })
    .eq("status", "active")
    .lt("departure_at", new Date().toISOString());

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("arrival_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []) as Reservation[];
}

export async function adminCreateReservation(input: NewReservationInput): Promise<void> {
  const { error } = await supabase.from("reservations").insert({
    full_name: input.full_name.trim(),
    vehicle_plate: input.vehicle_plate.trim(),
    contact_email: input.contact_email.trim(),
    contact_phone: input.contact_phone.trim(),
    arrival_at: input.arrival_at,
    departure_at: input.departure_at,
    destination: input.destination ?? null,
    needs_airport_transfer: input.needs_airport_transfer,
    note: input.note ?? null,
    source: "admin",
  });
  if (error) throw new Error(error.message);
}

export async function updateReservationStatus(id: number, status: Reservation["status"]): Promise<void> {
  const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteReservation(id: number): Promise<void> {
  const { error } = await supabase.from("reservations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getAdminSettings() {
  const [{ data: settings, error: e1 }, { data: blocked, error: e2 }] = await Promise.all([
    supabase.from("parking_settings").select("*").eq("id", 1).single(),
    supabase.from("blocked_periods").select("*").order("start_date", { ascending: true }),
  ]);
  if (e1) throw new Error(e1.message);
  if (e2) throw new Error(e2.message);
  return { settings, blocked: (blocked ?? []) as BlockedPeriod[] };
}

export async function updateSettings(input: { total_spots: number }) {
  const { error } = await supabase
    .from("parking_settings")
    .update({ total_spots: input.total_spots })
    .eq("id", 1);
  if (error) throw new Error(error.message);
}

export async function addBlockedPeriod(input: { start_date: string; end_date: string; reason: string | null }) {
  const { error } = await supabase.from("blocked_periods").insert(input);
  if (error) throw new Error(error.message);
}

export async function removeBlockedPeriod(id: string) {
  const { error } = await supabase.from("blocked_periods").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ============ Pricing tiers ============
export async function getPricingTiers(): Promise<PricingTier[]> {
  const { data, error } = await supabase
    .from("pricing_tiers")
    .select("tier_index, day_to, price_per_day")
    .order("tier_index", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((t) => ({ ...t, price_per_day: Number(t.price_per_day) })) as PricingTier[];
}

export async function updatePricingTiers(tiers: { tier_index: number; day_to: number | null; price_per_day: number }[]) {
  // Update each tier individually
  for (const t of tiers) {
    const { error } = await supabase
      .from("pricing_tiers")
      .update({ day_to: t.day_to, price_per_day: t.price_per_day })
      .eq("tier_index", t.tier_index);
    if (error) throw new Error(error.message);
  }
}

/** Tier descriptor for a given total day count. */
export function tierForDays(days: number, tiers: PricingTier[]): PricingTier | null {
  if (tiers.length === 0) return null;
  const t1 = tiers.find((t) => t.tier_index === 1);
  const t2 = tiers.find((t) => t.tier_index === 2);
  const t3 = tiers.find((t) => t.tier_index === 3);
  if (!t1 || !t2 || !t3) return null;
  if (days <= (t1.day_to ?? 10)) return t1;
  if (days <= (t2.day_to ?? 20)) return t2;
  return t3;
}

/** Compute total price + per-day rate + savings vs tier 1 rate. */
export function computeQuote(days: number, tiers: PricingTier[]): { days: number; rate: number; total: number; baseRate: number; saved: number; tier: PricingTier | null } {
  const d = Math.max(1, days);
  const tier = tierForDays(d, tiers);
  const rate = tier ? Number(tier.price_per_day) : 0;
  const baseRate = Number(tiers.find((t) => t.tier_index === 1)?.price_per_day ?? rate);
  const total = +(d * rate).toFixed(2);
  const baseTotal = +(d * baseRate).toFixed(2);
  const saved = Math.max(0, +(baseTotal - total).toFixed(2));
  return { days: d, rate, total, baseRate, saved, tier };
}
