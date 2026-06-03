import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { listReservations, updateReservationStatus, adminCreateReservation, checkAvailability, deleteReservation, type Reservation } from "@/lib/reservations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

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

  const { data, isLoading } = useQuery({ queryKey: ["admin-reservations"], queryFn: listReservations });

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rezervacije</h2>
          <p className="text-sm text-muted-foreground">Pregled svih rezervacija i ručno dodavanje.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary-hover">
          <Plus className="mr-2 h-4 w-4" /> Nova rezervacija
        </Button>
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
                {data?.map((r) => (
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

function AddReservationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    full_name: "", vehicle_plate: "", contact_email: "", contact_phone: "",
    arrival_at: "", departure_at: "", destination: "", needs_airport_transfer: true, note: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [avail, setAvail] = useState<string | null>(null);

  async function check() {
    if (!form.arrival_at || !form.departure_at) return;
    try {
      const res = await checkAvailability(new Date(form.arrival_at).toISOString(), new Date(form.departure_at).toISOString());
      if (res.is_blocked) setAvail("⚠ Parking ne radi u ovom periodu");
      else if (res.available_spots <= 0) setAvail(`Nedostupno (${res.available_spots}/${res.total_spots})`);
      else setAvail(`Dostupno: ${res.available_spots}/${res.total_spots}`);
    } catch (e) { setAvail(e instanceof Error ? e.message : "Greška"); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminCreateReservation({
        ...form,
        arrival_at: new Date(form.arrival_at).toISOString(),
        departure_at: new Date(form.departure_at).toISOString(),
        destination: form.destination || null, note: form.note || null,
      });
      toast.success("Rezervacija dodana");
      qc.invalidateQueries({ queryKey: ["admin-reservations"] });
      onOpenChange(false);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Greška"); }
    finally { setSubmitting(false); }
  }

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader><DialogTitle>Nova rezervacija</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Ime i prezime"><Input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
            <Field label="Registracija" required><Input required value={form.vehicle_plate} onChange={(e) => set("vehicle_plate", e.target.value.toUpperCase())} className="font-mono uppercase tracking-wider" style={{ textTransform: "uppercase" }} /></Field>
            <Field label="Email"><Input required type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} /></Field>
            <Field label="Telefon"><Input required value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} /></Field>
            <Field label="Dolazak"><Input required type="datetime-local" value={form.arrival_at} onChange={(e) => { set("arrival_at", e.target.value); if (form.departure_at && form.departure_at < e.target.value) set("departure_at", ""); }} onBlur={check} /></Field>
            <Field label="Odlazak"><Input required type="datetime-local" min={form.arrival_at || undefined} value={form.departure_at} onChange={(e) => set("departure_at", e.target.value)} onBlur={check} /></Field>
            <Field label="Destinacija"><Input value={form.destination} onChange={(e) => set("destination", e.target.value)} /></Field>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label>Prevoz do aerodroma</Label>
              <Switch checked={form.needs_airport_transfer} onCheckedChange={(v) => set("needs_airport_transfer", v)} />
            </div>
          </div>
          <Field label="Napomena"><Textarea rows={2} value={form.note} onChange={(e) => set("note", e.target.value)} /></Field>
          {avail && <div className="rounded-md bg-muted/40 p-2 text-sm">{avail}</div>}
          <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary-hover">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dodaj rezervaciju"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
