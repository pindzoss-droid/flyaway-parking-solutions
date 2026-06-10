import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CalendarIcon, Loader2, Minus, Plus, Trash2 } from "lucide-react";
import {
  addBlockedPeriod,
  getAdminSettings,
  getPricingTiers,
  removeBlockedPeriod,
  updatePricingTiers,
  updateSettings,
  type PricingTier,
} from "@/lib/reservations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

type EditableTier = { tier_index: number; day_to: number | null; price_per_day: number };

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-settings"], queryFn: getAdminSettings });
  const { data: tiersData, isLoading: tiersLoading } = useQuery({ queryKey: ["pricing-tiers"], queryFn: getPricingTiers });

  const [totalSpots, setTotalSpots] = useState(30);
  const [tiers, setTiers] = useState<EditableTier[]>([
    { tier_index: 1, day_to: 10, price_per_day: 10 },
    { tier_index: 2, day_to: 20, price_per_day: 8 },
    { tier_index: 3, day_to: null, price_per_day: 6 },
  ]);
  const [bStart, setBStart] = useState("");
  const [bEnd, setBEnd] = useState("");
  const [bReason, setBReason] = useState("");

  useEffect(() => {
    if (data?.settings) setTotalSpots(Number(data.settings.total_spots));
  }, [data]);

  useEffect(() => {
    if (tiersData && tiersData.length === 3) {
      setTiers(tiersData.map((t) => ({ tier_index: t.tier_index, day_to: t.day_to, price_per_day: Number(t.price_per_day) })));
    }
  }, [tiersData]);

  const saveMut = useMutation({
    mutationFn: () => updateSettings({ total_spots: totalSpots }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-settings"] }); toast.success("Postavke sačuvane"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Greška"),
  });

  const tiersMut = useMutation({
    mutationFn: () => updatePricingTiers(tiers),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pricing-tiers"] });
      qc.invalidateQueries({ queryKey: ["pricing-tiers-public"] });
      toast.success("Cjenovnik sačuvan");
    },
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

  /** Update tier1.day_to and cascade tier2 start (which is derived). Also clamp tier2.day_to. */
  function setTier1DayTo(newTo: number) {
    const t1To = Math.max(1, Math.floor(newTo));
    setTiers((prev) => {
      const next = prev.map((t) => ({ ...t }));
      next[0].day_to = t1To;
      // ensure tier2.day_to is strictly greater
      if ((next[1].day_to ?? 0) <= t1To) {
        next[1].day_to = t1To + 1;
      }
      return next;
    });
  }

  function setTier2DayTo(newTo: number) {
    setTiers((prev) => {
      const t1To = prev[0].day_to ?? 10;
      const t2To = Math.max(t1To + 1, Math.floor(newTo));
      const next = prev.map((t) => ({ ...t }));
      next[1].day_to = t2To;
      return next;
    });
  }

  function setTierPrice(idx: number, price: number) {
    setTiers((prev) => prev.map((t, i) => (i === idx ? { ...t, price_per_day: Math.max(0, price) } : t)));
  }

  if (isLoading || tiersLoading) return <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  const t1To = tiers[0].day_to ?? 10;
  const t2To = tiers[1].day_to ?? 20;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Cjenovnik (3 paketa)</CardTitle>
          <CardDescription>Postavi raspon dana i cijenu po danu za svaki paket. Sve cijene su u KM.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <TierEditor
              label="Paket 1"
              fromValue={1}
              fromDisabled
              toValue={t1To}
              onToChange={setTier1DayTo}
              toMin={1}
              price={tiers[0].price_per_day}
              onPriceChange={(p) => setTierPrice(0, p)}
            />
            <TierEditor
              label="Paket 2"
              fromValue={t1To + 1}
              fromDisabled
              toValue={t2To}
              onToChange={setTier2DayTo}
              toMin={t1To + 1}
              price={tiers[1].price_per_day}
              onPriceChange={(p) => setTierPrice(1, p)}
            />
            <TierEditor
              label="Paket 3"
              fromValue={t2To + 1}
              fromDisabled
              toValue={null}
              toLabel={`${t2To + 1}+ (neograničeno)`}
              price={tiers[2].price_per_day}
              onPriceChange={(p) => setTierPrice(2, p)}
            />
          </div>
          <Button onClick={() => tiersMut.mutate()} disabled={tiersMut.isPending} className="bg-primary text-primary-foreground hover:bg-primary-hover">
            {tiersMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sačuvaj cjenovnik"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parametri parkinga</CardTitle>
          <CardDescription>Ukupni kapacitet parking mjesta.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                <span className="text-2xl font-bold">{totalSpots}</span>
              </div>
              <div>
                <div className="text-sm font-semibold">Ukupno mjesta</div>
                <div className="text-xs text-muted-foreground">Broj mjesta dostupnih za rezervaciju</div>
              </div>
            </div>
            <div className="sm:w-40">
              <Stepper value={totalSpots} min={1} onChange={setTotalSpots} />
            </div>
          </div>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending} className="mt-4 bg-primary text-primary-foreground hover:bg-primary-hover">
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

function TierEditor({
  label,
  fromValue,
  fromDisabled,
  toValue,
  toLabel,
  toMin,
  onToChange,
  price,
  onPriceChange,
}: {
  label: string;
  fromValue: number;
  fromDisabled?: boolean;
  toValue: number | null;
  toLabel?: string;
  toMin?: number;
  onToChange?: (v: number) => void;
  price: number;
  onPriceChange: (v: number) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="text-sm font-semibold">{label}</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Od (dan)</Label>
          <Input type="number" value={fromValue} disabled={fromDisabled} readOnly />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Do (dan)</Label>
          {toValue === null ? (
            <Input value={toLabel ?? "—"} disabled readOnly />
          ) : (
            <Stepper value={toValue} min={toMin ?? 1} onChange={(v) => onToChange?.(v)} />
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Cijena po danu (KM)</Label>
        <Stepper value={price} min={0} step={1} onChange={onPriceChange} />
      </div>
    </div>
  );
}

function Stepper({ value, min = 0, step = 1, onChange }: { value: number; min?: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center">
      <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-r-none" onClick={() => onChange(Math.max(min, value - step))}>
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || min))}
        className="no-spin h-9 rounded-none border-x-0 text-center"
      />
      <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-l-none" onClick={() => onChange(value + step)}>
        <Plus className="h-4 w-4" />
      </Button>
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
