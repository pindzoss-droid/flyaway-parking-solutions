import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "@/lib/i18n";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { checkAvailability, createReservation, getPublicSettings } from "@/lib/reservations.functions";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

type Props = { open: boolean; onOpenChange: (o: boolean) => void };

function combine(date: Date | undefined, time: string): string | null {
  if (!date) return null;
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

function diffDays(a: string | null, b: string | null) {
  if (!a || !b) return 0;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.ceil(ms / 86400000));
}

export function ReservationModal({ open, onOpenChange }: Props) {
  const { t } = useI18n();
  const checkFn = useServerFn(checkAvailability);
  const createFn = useServerFn(createReservation);
  const settingsFn = useServerFn(getPublicSettings);

  const { data: settings } = useQuery({ queryKey: ["public-settings"], queryFn: () => settingsFn() });

  const [arrivalDate, setArrivalDate] = useState<Date | undefined>();
  const [arrivalTime, setArrivalTime] = useState("08:00");
  const [departureDate, setDepartureDate] = useState<Date | undefined>();
  const [departureTime, setDepartureTime] = useState("20:00");

  const [fullName, setFullName] = useState("");
  const [plate, setPlate] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [transfer, setTransfer] = useState(true);
  const [note, setNote] = useState("");

  const [availability, setAvailability] = useState<null | { ok: boolean; blocked: boolean; available: number; total: number }>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const arrivalISO = useMemo(() => combine(arrivalDate, arrivalTime), [arrivalDate, arrivalTime]);
  const departureISO = useMemo(() => combine(departureDate, departureTime), [departureDate, departureTime]);
  const days = diffDays(arrivalISO, departureISO);
  const price = settings ? +(days * Number(settings.price_per_day)).toFixed(2) : 0;

  useEffect(() => {
    if (!arrivalISO || !departureISO) { setAvailability(null); return; }
    if (new Date(departureISO) <= new Date(arrivalISO)) { setAvailability(null); return; }
    setChecking(true);
    const id = setTimeout(async () => {
      try {
        const res = await checkFn({ data: { arrival_at: arrivalISO, departure_at: departureISO } });
        setAvailability({ ok: !res.is_blocked && res.available_spots > 0, blocked: res.is_blocked, available: res.available_spots, total: res.total_spots });
      } catch { setAvailability(null); }
      finally { setChecking(false); }
    }, 400);
    return () => clearTimeout(id);
  }, [arrivalISO, departureISO, checkFn]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!arrivalISO || !departureISO) { toast.error(t("form.pickdates")); return; }
    if (!availability?.ok) { toast.error(t("form.unavailable")); return; }
    setSubmitting(true);
    try {
      const res = await createFn({
        data: {
          full_name: fullName, vehicle_plate: plate, contact_email: email, contact_phone: phone,
          arrival_at: arrivalISO, departure_at: departureISO,
          destination: destination || null, needs_airport_transfer: transfer, note: note || null,
        },
      });
      toast.success(`${t("form.success")} (${res.estimated_price} ${res.currency})`);
      onOpenChange(false);
      // reset
      setFullName(""); setPlate(""); setEmail(""); setPhone(""); setDestination(""); setNote("");
      setArrivalDate(undefined); setDepartureDate(undefined);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("form.error"));
    } finally { setSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("form.title")}</DialogTitle>
          <DialogDescription>Park&Fly — Sarajevo</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("form.fullname")}><Input required value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
            <Field label={t("form.plate")}><Input required value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="A12-B-345" /></Field>
            <Field label={t("form.email")}><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label={t("form.phone")}><Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+387 …" /></Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DateTimeField label={t("form.arrival")} date={arrivalDate} setDate={setArrivalDate} time={arrivalTime} setTime={setArrivalTime} />
            <DateTimeField label={t("form.departure")} date={departureDate} setDate={setDepartureDate} time={departureTime} setTime={setDepartureTime} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("form.destination")}><Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Istanbul, Vienna…" /></Field>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label htmlFor="transfer">{t("form.transfer")}</Label>
              <Switch id="transfer" checked={transfer} onCheckedChange={setTransfer} />
            </div>
          </div>

          <Field label={t("form.note")}><Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></Field>

          {/* Status */}
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            {checking && (<span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{t("form.checking")}</span>)}
            {!checking && availability && availability.blocked && (<span className="flex items-center gap-2 text-destructive"><XCircle className="h-4 w-4" />{t("form.blocked")}</span>)}
            {!checking && availability && !availability.blocked && availability.ok && (
              <span className="flex items-center gap-2 text-success"><CheckCircle2 className="h-4 w-4" />{t("form.available")} ({availability.available}/{availability.total})</span>
            )}
            {!checking && availability && !availability.blocked && !availability.ok && (
              <span className="flex items-center gap-2 text-destructive"><XCircle className="h-4 w-4" />{t("form.unavailable")}</span>
            )}
            {arrivalISO && departureISO && settings && (
              <div className="mt-2 flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">{t("form.estimate")} · {days} {t("form.days")}</span>
                <span className="text-lg font-bold text-primary">{price} {settings.currency}</span>
              </div>
            )}
          </div>

          <Button type="submit" disabled={submitting || !availability?.ok} className="w-full bg-primary text-primary-foreground hover:bg-primary-hover">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("form.submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}

function DateTimeField({ label, date, setDate, time, setTime }: { label: string; date?: Date; setDate: (d?: Date) => void; time: string; setTime: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className={cn("flex-1 justify-start text-left font-normal", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd.MM.yyyy") : "—"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className={cn("p-3 pointer-events-auto")} disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} />
          </PopoverContent>
        </Popover>
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-28" />
      </div>
    </div>
  );
}
