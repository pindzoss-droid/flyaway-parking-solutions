import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { addBlockedPeriod, getAdminSettings, removeBlockedPeriod, updateSettings } from "@/lib/reservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-settings"], queryFn: getAdminSettings });

  const [totalSpots, setTotalSpots] = useState(30);
  const [price, setPrice] = useState(15);
  const [currency, setCurrency] = useState("BAM");
  const [bStart, setBStart] = useState("");
  const [bEnd, setBEnd] = useState("");
  const [bReason, setBReason] = useState("");

  useEffect(() => {
    if (data?.settings) {
      setTotalSpots(Number(data.settings.total_spots));
      setPrice(Number(data.settings.price_per_day));
      setCurrency(data.settings.currency);
    }
  }, [data]);

  const saveMut = useMutation({
    mutationFn: () => updateSettings({ total_spots: totalSpots, price_per_day: price, currency }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-settings"] }); toast.success("Postavke sačuvane"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Greška"),
  });

  const addBlockMut = useMutation({
    mutationFn: () => addBlockedPeriod({ start_date: bStart, end_date: bEnd, reason: bReason || null }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-settings"] }); setBStart(""); setBEnd(""); setBReason(""); toast.success("Blokirani period dodat"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Greška"),
  });

  const rmBlockMut = useMutation({
    mutationFn: (id: string) => removeBlockedPeriod(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-settings"] }); toast.success("Obrisano"); },
  });

  if (isLoading) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Parametri parkinga</CardTitle>
          <CardDescription>Broj parking mjesta i cijena po danu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Ukupno mjesta</Label>
              <Input type="number" min={1} value={totalSpots} onChange={(e) => setTotalSpots(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Cijena / dan</Label>
              <Input type="number" min={0} step="0.5" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Valuta</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAM">BAM</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="bg-primary text-primary-foreground hover:bg-primary-hover">
            {saveMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sačuvaj postavke"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blokirani periodi</CardTitle>
          <CardDescription>Datumi kada parking ne radi (praznici i sl.).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <DateInput label="Od" value={bStart} onChange={setBStart} />
            <DateInput label="Do" value={bEnd} onChange={setBEnd} min={bStart} />
            <div className="space-y-1.5"><Label>Razlog</Label><Input value={bReason} onChange={(e) => setBReason(e.target.value)} placeholder="Praznik…" /></div>
          </div>
          <Button onClick={() => addBlockMut.mutate()} disabled={!bStart || !bEnd || addBlockMut.isPending} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Dodaj
          </Button>

          <div className="divide-y rounded-md border">
            {data?.blocked?.length === 0 && <div className="p-4 text-sm text-muted-foreground">Nema blokiranih perioda.</div>}
            {data?.blocked?.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <div className="font-medium">{format(new Date(b.start_date), "dd.MM.yyyy")} — {format(new Date(b.end_date), "dd.MM.yyyy")}</div>
                  {b.reason && <div className="text-xs text-muted-foreground">{b.reason}</div>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => rmBlockMut.mutate(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DateInput({ label, value, onChange, min }: { label: string; value: string; onChange: (v: string) => void; min?: string }) {
  const date = value ? new Date(value) : undefined;
  const minDate = min ? new Date(min) : undefined;
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className={cn("w-full justify-between text-left font-normal", !date && "text-muted-foreground")}>
            <span>{date ? format(date, "dd.MM.yyyy") : "—"}</span>
            <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
            disabled={minDate ? (d) => d < minDate : undefined}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
