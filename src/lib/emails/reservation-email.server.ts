// Server-only helper that sends reservation confirmation emails via Resend HTTP API.
// No SDK dependency — uses fetch so it works in any Node/edge runtime.

type ReservationEmailPayload = {
  full_name: string;
  vehicle_plate: string;
  contact_email: string;
  contact_phone: string;
  arrival_at: string; // ISO
  departure_at: string; // ISO
  destination?: string | null;
  needs_airport_transfer: boolean;
  note?: string | null;
  estimated_price?: number | null;
};

function fmt(iso: string) {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
}

function esc(s: string | null | undefined) {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function row(label: string, value: string) {
  return `<tr><td style="padding:8px 12px;color:#6b7280;font-size:14px;border-bottom:1px solid #f0f0f0;">${esc(label)}</td><td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600;border-bottom:1px solid #f0f0f0;">${value}</td></tr>`;
}

function buildCustomerHtml(r: ReservationEmailPayload) {
  const price = r.estimated_price != null ? `${r.estimated_price} BAM` : "—";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#0f172a;color:#ffffff;padding:24px;">
      <h1 style="margin:0;font-size:22px;">Park&amp;Fly — Potvrda rezervacije</h1>
    </div>
    <div style="padding:24px;color:#111827;">
      <p style="margin:0 0 12px;">Poštovani/a <strong>${esc(r.full_name)}</strong>,</p>
      <p style="margin:0 0 16px;">Vaša rezervacija parking mjesta je uspješno zaprimljena. Detalji ispod:</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #f0f0f0;border-radius:8px;overflow:hidden;">
        ${row("Ime i prezime", esc(r.full_name))}
        ${row("Registracija vozila", esc(r.vehicle_plate))}
        ${row("Telefon", esc(r.contact_phone))}
        ${row("Email", esc(r.contact_email))}
        ${row("Dolazak", esc(fmt(r.arrival_at)))}
        ${row("Odlazak", esc(fmt(r.departure_at)))}
        ${row("Destinacija", esc(r.destination ?? "—"))}
        ${row("Transfer do aerodroma", r.needs_airport_transfer ? "Da" : "Ne")}
        ${row("Napomena", esc(r.note ?? "—"))}
        ${row("Procijenjena cijena", esc(price))}
      </table>
      <p style="margin:20px 0 0;color:#374151;font-size:14px;">Hvala što ste odabrali Park&amp;Fly. Za sva pitanja kontaktirajte nas odgovorom na ovaj email.</p>
    </div>
    <div style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px;text-align:center;">
      Park&amp;Fly · parkandfly.ba
    </div>
  </div></body></html>`;
}

function buildAdminHtml(r: ReservationEmailPayload) {
  const price = r.estimated_price != null ? `${r.estimated_price} BAM` : "—";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#b45309;color:#ffffff;padding:20px;">
      <h1 style="margin:0;font-size:20px;">Nova rezervacija — Park&amp;Fly</h1>
    </div>
    <div style="padding:20px;">
      <table style="width:100%;border-collapse:collapse;border:1px solid #f0f0f0;">
        ${row("Ime i prezime", esc(r.full_name))}
        ${row("Registracija", esc(r.vehicle_plate))}
        ${row("Telefon", esc(r.contact_phone))}
        ${row("Email", esc(r.contact_email))}
        ${row("Dolazak", esc(fmt(r.arrival_at)))}
        ${row("Odlazak", esc(fmt(r.departure_at)))}
        ${row("Destinacija", esc(r.destination ?? "—"))}
        ${row("Transfer", r.needs_airport_transfer ? "Da" : "Ne")}
        ${row("Napomena", esc(r.note ?? "—"))}
        ${row("Procijenjena cijena", esc(price))}
      </table>
    </div>
  </div></body></html>`;
}

async function resendSend(payload: { from: string; to: string[]; subject: string; html: string; reply_to?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${text}`);
  }
  return res.json().catch(() => ({}));
}

export async function sendReservationEmails(r: ReservationEmailPayload): Promise<void> {
  const from = process.env.EMAIL_FROM
    ? `Park&Fly <${process.env.EMAIL_FROM}>`
    : "Park&Fly <noreply@notify.parkandfly.ba>";
  const adminEmail = process.env.ADMIN_EMAIL || "parkandflyba@gmail.com";

  const tasks: Promise<unknown>[] = [];

  if (r.contact_email) {
    tasks.push(
      resendSend({
        from,
        to: [r.contact_email],
        subject: "Park&Fly — Potvrda rezervacije",
        html: buildCustomerHtml(r),
        reply_to: adminEmail,
      }).catch((err) => {
        console.error("[email] customer send failed:", err);
      }),
    );
  }

  tasks.push(
    resendSend({
      from,
      to: [adminEmail],
      subject: `Nova rezervacija — ${r.full_name} (${r.vehicle_plate})`,
      html: buildAdminHtml(r),
      reply_to: r.contact_email || undefined,
    }).catch((err) => {
      console.error("[email] admin send failed:", err);
    }),
  );

  await Promise.all(tasks);
}
