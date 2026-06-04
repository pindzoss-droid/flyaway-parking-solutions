import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2, Plus, MoreHorizontal, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { listReservations, updateReservationStatus, adminCreateReservation, checkAvailability, getPublicSettings, deleteReservation, type Reservation } from "@/lib/reservations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateTimeField } from "@/components/site/DateTimeField";
import { toast } from "sonner";

type SortKey =
  | "arrival_asc"
  | "name_asc"
  | "plate_asc"
  | "departure_asc"
  | "price_asc"
  | "price_desc"
  | "status_asc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "arrival_asc", label: "Vrijeme dolaska" },
  { value: "departure_asc", label: "Vrijeme odlaska" },
  { value: "name_asc", label: "Osoba (A–Ž)" },
  { value: "plate_asc", label: "Registracija (A–Ž)" },
  { value: "price_asc", label: "Cijena (uzlazno)" },
  { value: "price_desc", label: "Cijena (silazno)" },
  { value: "status_asc", label: "Status" },
];

function sortReservations(rows: Reservation[], key: SortKey): Reservation[] {
  const arr = [...rows];
  switch (key) {
    case "arrival_asc":
      return arr.sort((a, b) => +new Date(a.arrival_at) - +new Date(b.arrival_at));
    case "departure_asc":
      return arr.sort((a, b) => +new Date(a.departure_at) - +new Date(b.departure_at));
    case "name_asc":
      return arr.sort((a, b) => a.full_name.localeCompare(b.full_name, "bs"));
    case "plate_asc":
      return arr.sort((a, b) => a.vehicle_plate.localeCompare(b.vehicle_plate, "bs"));
    case "price_asc":
      return arr.sort((a, b) => Number(a.estimated_price) - Number(b.estimated_price));
    case "price_desc":
      return arr.sort((a, b) => Number(b.estimated_price) - Number(a.estimated_price));
    case "status_asc":
      return arr.sort((a, b) => a.status.localeCompare(b.status));
  }
}

export const Route = createFileRoute("/_authenticated/admin/reservations")({
  component: ReservationsPage,
});

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-success/15 text-success border-success/30",
    cancelled: "bg-muted text-muted-foreground border-border",
    no_show: "bg-destructive/15 text-destructive border-destructive/30",
  };
  const label: Record<string, string> = { active: "Aktivna", cancelled: "Otkazana", no_show: "Nije se pojavio" };
  return <Badge variant="outline" className={map[status]}>{label[status] ?? status}</Badge>;
}

function ReservationsPage() {
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("arrival_asc");

  const { data, isLoading } = useQuery({ queryKey: ["admin-reservations"], queryFn: listReservations });

  const sorted = useMemo(() => (data ? sortReservations(data, sortKey) : []), [data, sortKey]);

  const updateMut = useMutation({
    mutationFn: (vars: { id: number; status: Reservation["status"] }) => updateReservationStatus(vars.id, vars.status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reservations"] }); toast.success("Status ažuriran"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Greška"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteReservation(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-reservations"] }); toast.success("Rezervacija obrisana"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Greška"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Rezervacije</h2>
          <p className="text-sm text-muted-foreground">Pregled svih rezervacija i ručno dodavanje.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sortiraj po…" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setAddOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary-hover">
            <Plus className="mr-2 h-4 w-4" /> Nova rezervacija
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-card">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">ID</TableHead>
                  <TableHead>Ime i prezime</TableHead>
                  <TableHead>Registracija</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Dolazak</TableHead>
                  <TableHead>Odlazak</TableHead>
                  <TableHead>Destinacija</TableHead>
                  <TableHead>Cijena</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="pl-6 font-mono text-xs">#{r.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{r.full_name}</div>
                      <div className="text-xs text-muted-foreground">{r.contact_email}</div>
                    </TableCell>
                    <TableCell className="font-mono uppercase">{r.vehicle_plate}</TableCell>
                    <TableCell>{r.contact_phone}</TableCell>
                    <TableCell className="text-xs">{format(new Date(r.arrival_at), "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell className="text-xs">{format(new Date(r.departure_at), "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell>{r.destination ?? "—"}</TableCell>
                    <TableCell>{Number(r.estimated_price).toFixed(2)}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateMut.mutate({ id: r.id, status: "active" })}>Označi kao aktivna</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateMut.mutate({ id: r.id, status: "cancelled" })}>Otkazana</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateMut.mutate({ id: r.id, status: "no_show" })}>Nije se pojavio</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (window.confirm(`Obrisati rezervaciju #${r.id}? Ova akcija je trajna.`)) deleteMut.mutate(r.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Obriši
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data || data.length === 0) && (
                  <TableRow><TableCell colSpan={10} className="h-32 text-center text-sm text-muted-foreground">Nema rezervacija.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AddReservationDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

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

function AddReservationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ["public-settings"], queryFn: getPublicSettings });

  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>(today);
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
        const res = await checkAvailability(arrivalISO, departureISO);
        setAvailability({ ok: !res.is_blocked && res.available_spots > 0, blocked: res.is_blocked, available: res.available_spots, total: res.total_spots });
      } catch { setAvailability(null); }
      finally { setChecking(false); }
    }, 400);
    return () => clearTimeout(id);
  }, [arrivalISO, departureISO]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!arrivalISO || !departureISO) { toast.error("Odaberi datum i vrijeme"); return; }
    if (!availability?.ok) { toast.error("Nedostupno u odabranom periodu"); return; }
    setSubmitting(true);
    try {
      await adminCreateReservation({
        full_name: fullName, vehicle_plate: plate, contact_email: email, contact_phone: phone,
        arrival_at: arrivalISO, departure_at: departureISO,
        destination: destination || null, needs_airport_transfer: transfer, note: note || null,
      });
      toast.success(`Rezervacija dodana (~${price} ${settings?.currency ?? "BAM"})`);
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      onOpenChange(false);
      setFullName(""); setPlate(""); setEmail(""); setPhone(""); setDestination(""); setNote("");
      setArrivalDate(today); setDepartureDate(undefined);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Greška"); }
    finally { setSubmitting(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-2xl font-bold sm:text-3xl">Nova rezervacija</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ime i prezime" required><Input required value={fullName} onChange={(e) => setFullName(e.target.value)} /></Field>
            <Field label="Registracija" required>
              <Input
                required
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="A12-B-345"
                className="font-mono uppercase tracking-wider"
                style={{ textTransform: "uppercase" }}
              />
            </Field>
            <Field label="Email" required><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Telefon" required><Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+387 …" /></Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DateTimeField dateLabel="Datum dolaska" timeLabel="Vrijeme dolaska" required date={arrivalDate} setDate={(d) => { setArrivalDate(d); if (d && departureDate && departureDate < d) setDepartureDate(undefined); }} time={arrivalTime} setTime={setArrivalTime} />
            <DateTimeField dateLabel="Datum odlaska" timeLabel="Vrijeme odlaska" required date={departureDate} setDate={setDepartureDate} time={departureTime} setTime={setDepartureTime} minDate={arrivalDate} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Destinacija"><Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Istanbul, Vienna…" /></Field>
            <Field label="Prevoz do aerodroma">
              <div className="flex h-9 items-center justify-between rounded-md border bg-transparent px-3 shadow-sm">
                <span className="text-sm text-muted-foreground">{transfer ? "Da" : "Ne"}</span>
                <Switch id="transfer" checked={transfer} onCheckedChange={setTransfer} />
              </div>
            </Field>
          </div>

          <Field label="Napomena"><Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></Field>

          {(checking || availability) && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              {checking && (<span className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Provjeravam dostupnost…</span>)}
              {!checking && availability && availability.blocked && (<span className="flex items-center gap-2 text-destructive"><XCircle className="h-4 w-4" />Parking ne radi u ovom periodu</span>)}
              {!checking && availability && !availability.blocked && availability.ok && (
                <span className="flex items-center gap-2 text-success"><CheckCircle2 className="h-4 w-4" />Dostupno ({availability.available}/{availability.total})</span>
              )}
              {!checking && availability && !availability.blocked && !availability.ok && (
                <span className="flex items-center gap-2 text-destructive"><XCircle className="h-4 w-4" />Nedostupno u odabranom periodu</span>
              )}
              {!checking && availability?.ok && arrivalISO && departureISO && settings && (
                <div className="mt-2 flex items-center justify-between border-t pt-2">
                  <span className="text-muted-foreground">Procjena cijene · {days} dana</span>
                  <span className="text-lg font-bold text-primary">{price} {settings.currency}</span>
                </div>
              )}
            </div>
          )}

          <Button type="submit" disabled={submitting || !availability?.ok} className="w-full bg-primary text-primary-foreground hover:bg-primary-hover">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dodaj rezervaciju"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      {children}
    </div>
  );
}
