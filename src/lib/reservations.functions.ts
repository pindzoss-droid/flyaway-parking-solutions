import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function getAdminClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function getAnonClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

function diffDays(arrival: string, departure: string): number {
  const a = new Date(arrival).getTime();
  const d = new Date(departure).getTime();
  return Math.max(1, Math.ceil((d - a) / (1000 * 60 * 60 * 24)));
}

// =================== PUBLIC: settings (for price display) ===================
export const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const s = getAnonClient();
  const { data, error } = await s
    .from("parking_settings")
    .select("total_spots, price_per_day, currency")
    .eq("id", 1)
    .single();
  if (error) throw new Error(error.message);
  return data as { total_spots: number; price_per_day: number; currency: string };
});

// =================== PUBLIC: check availability ===================
const checkSchema = z.object({
  arrival_at: z.string().min(1),
  departure_at: z.string().min(1),
});

export const checkAvailability = createServerFn({ method: "POST" })
  .inputValidator((d) => checkSchema.parse(d))
  .handler(async ({ data }) => {
    const s = getAnonClient();
    const { data: res, error } = await s.rpc("check_availability", {
      _arrival: data.arrival_at,
      _departure: data.departure_at,
      _exclude_id: null,
    });
    if (error) throw new Error(error.message);
    const row = Array.isArray(res) ? res[0] : res;
    return row as { available_spots: number; total_spots: number; is_blocked: boolean };
  });

// =================== PUBLIC: create reservation ===================
const reservationSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  vehicle_plate: z.string().trim().min(2).max(20),
  contact_email: z.string().trim().email().max(160),
  contact_phone: z.string().trim().min(5).max(40),
  arrival_at: z.string().min(1),
  departure_at: z.string().min(1),
  destination: z.string().trim().max(120).optional().nullable(),
  needs_airport_transfer: z.boolean().default(true),
  note: z.string().trim().max(2000).optional().nullable(),
});

export const createReservation = createServerFn({ method: "POST" })
  .inputValidator((d) => reservationSchema.parse(d))
  .handler(async ({ data }) => {
    const arrival = new Date(data.arrival_at);
    const departure = new Date(data.departure_at);
    if (departure <= arrival) throw new Error("Departure must be after arrival");

    const admin = getAdminClient();

    const { data: avail, error: aerr } = await admin.rpc("check_availability", {
      _arrival: data.arrival_at,
      _departure: data.departure_at,
      _exclude_id: null,
    });
    if (aerr) throw new Error(aerr.message);
    const a = (Array.isArray(avail) ? avail[0] : avail) as {
      available_spots: number;
      total_spots: number;
      is_blocked: boolean;
    };
    if (a.is_blocked) throw new Error("Parking je nedostupan u odabranom periodu.");
    if (a.available_spots <= 0) throw new Error("Parking je popunjen za odabrani period.");

    const { data: settings } = await admin
      .from("parking_settings")
      .select("price_per_day, currency")
      .eq("id", 1)
      .single();
    const pricePerDay = Number(settings?.price_per_day ?? 0);
    const days = diffDays(data.arrival_at, data.departure_at);
    const estimated_price = +(days * pricePerDay).toFixed(2);

    const { data: inserted, error } = await admin
      .from("reservations")
      .insert({
        full_name: data.full_name,
        vehicle_plate: data.vehicle_plate.toUpperCase(),
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        arrival_at: data.arrival_at,
        departure_at: data.departure_at,
        destination: data.destination ?? null,
        needs_airport_transfer: data.needs_airport_transfer,
        note: data.note ?? null,
        estimated_price,
        source: "online",
      })
      .select("id, estimated_price")
      .single();
    if (error) throw new Error(error.message);

    return {
      id: inserted.id,
      estimated_price: inserted.estimated_price,
      currency: settings?.currency ?? "BAM",
      days,
    };
  });

// =================== ADMIN: list reservations ===================
export const listReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("reservations")
      .select("*")
      .order("arrival_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data;
  });

// =================== ADMIN: create reservation manually ===================
export const adminCreateReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => reservationSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const admin = getAdminClient();

    const { data: avail, error: aerr } = await admin.rpc("check_availability", {
      _arrival: data.arrival_at,
      _departure: data.departure_at,
      _exclude_id: null,
    });
    if (aerr) throw new Error(aerr.message);
    const a = (Array.isArray(avail) ? avail[0] : avail) as {
      available_spots: number;
      is_blocked: boolean;
    };
    if (a.is_blocked) throw new Error("Parking je nedostupan u odabranom periodu.");
    if (a.available_spots <= 0) throw new Error("Parking je popunjen za odabrani period.");

    const { data: settings } = await admin
      .from("parking_settings")
      .select("price_per_day")
      .eq("id", 1)
      .single();
    const days = diffDays(data.arrival_at, data.departure_at);
    const estimated_price = +(days * Number(settings?.price_per_day ?? 0)).toFixed(2);

    const { error } = await admin.from("reservations").insert({
      full_name: data.full_name,
      vehicle_plate: data.vehicle_plate.toUpperCase(),
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      arrival_at: data.arrival_at,
      departure_at: data.departure_at,
      destination: data.destination ?? null,
      needs_airport_transfer: data.needs_airport_transfer,
      note: data.note ?? null,
      estimated_price,
      source: "admin",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== ADMIN: update reservation status ===================
const statusSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["active", "cancelled", "no_show"]),
});

export const updateReservationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => statusSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("reservations")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== ADMIN: settings ===================
export const getAdminSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const [{ data: settings }, { data: blocked }] = await Promise.all([
      context.supabase.from("parking_settings").select("*").eq("id", 1).single(),
      context.supabase.from("blocked_periods").select("*").order("start_date", { ascending: true }),
    ]);
    return { settings, blocked: blocked ?? [] };
  });

const settingsSchema = z.object({
  total_spots: z.number().int().min(1).max(10000),
  price_per_day: z.number().min(0).max(100000),
  currency: z.string().min(1).max(8),
});

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => settingsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("parking_settings")
      .update({
        total_spots: data.total_spots,
        price_per_day: data.price_per_day,
        currency: data.currency,
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const blockedSchema = z.object({
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  reason: z.string().max(200).optional().nullable(),
});

export const addBlockedPeriod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => blockedSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("blocked_periods").insert({
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeBlockedPeriod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("blocked_periods").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
