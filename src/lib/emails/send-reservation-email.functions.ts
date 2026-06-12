import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().min(1),
  vehicle_plate: z.string().min(1),
  contact_email: z.string().email(),
  contact_phone: z.string().min(1),
  arrival_at: z.string().min(1),
  departure_at: z.string().min(1),
  destination: z.string().nullable().optional(),
  needs_airport_transfer: z.boolean(),
  note: z.string().nullable().optional(),
  estimated_price: z.number().nullable().optional(),
});

export const sendReservationEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { sendReservationEmails } = await import("./reservation-email.server");
      await sendReservationEmails(data);
      return { ok: true as const };
    } catch (err) {
      console.error("[email] sendReservationEmail failed:", err);
      // Never throw — reservation must remain saved even if email fails.
      return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
    }
  });
