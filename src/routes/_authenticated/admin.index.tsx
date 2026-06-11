import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { format, subDays, startOfDay, isSameDay, startOfMonth, subMonths, endOfMonth } from "date-fns";
import { bs } from "date-fns/locale";
import { Car, CircleParking, Coins, CalendarCheck, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from "recharts";
import { listReservations, getPublicSettings, type Reservation } from "@/lib/reservations";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data: settings } = useQuery({ queryKey: ["public-settings"], queryFn: getPublicSettings });
  const { data: reservations, isLoading } = useQuery({ queryKey: ["admin-reservations"], queryFn: listReservations });

  const stats = useMemo(() => computeStats(reservations ?? [], settings?.total_spots ?? 0), [reservations, settings]);

  if (isLoading || !settings) {
    return <div className="flex h-60 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  const currency = "KM";
  const occupancyPct = settings.total_spots > 0 ? Math.round((stats.currentlyOccupied / settings.total_spots) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pregled</h2>
        <p className="text-sm text-muted-foreground">Trenutni status parkinga i statistika rezervacija.</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CircleParking}
          label="Kapacitet parkinga"
          value={`${settings.total_spots}`}
          hint="ukupno mjesta"
          tone="primary"
        />
        <StatCard
          icon={Car}
          label="Trenutno zauzeto"
          value={`${stats.currentlyOccupied} / ${settings.total_spots}`}
          hint={`${occupancyPct}% iskorištenosti`}
          tone={occupancyPct >= 80 ? "warning" : "success"}
        />
        <StatCard
          icon={Coins}
          label="Prihod ovaj mjesec"
          value={`${stats.revenueThisMonth.toFixed(2)} ${currency}`}
          hint={`Ukupno: ${stats.revenueTotal.toFixed(2)} ${currency}`}
          tone="primary"
        />
        <StatCard
          icon={CalendarCheck}
          label="Rezervacija (30 dana)"
          value={`${stats.last30Count}`}
          hint={`Aktivnih sada: ${stats.activeCount}`}
          tone="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Rezervacije po danu</h3>
              <p className="text-xs text-muted-foreground">Zadnjih 30 dana (po datumu dolaska)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailySeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rezGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fill="url(#rezGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="mb-4">
            <h3 className="text-sm font-semibold">Po statusu</h3>
            <p className="text-xs text-muted-foreground">Sve rezervacije</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.statusSeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.statusSeries.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            <StatusPill icon={CheckCircle2} label="Aktivne" value={stats.activeCount} className="text-success" />
            <StatusPill icon={XCircle} label="Otkazane" value={stats.cancelledCount} className="text-muted-foreground" />
            <StatusPill icon={AlertTriangle} label="No-show" value={stats.noShowCount} className="text-destructive" />
          </div>
        </div>
      </div>

      {/* Revenue by month */}
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Prihodi po mjesecima</h3>
            <p className="text-xs text-muted-foreground">Zadnjih 12 mjeseci (aktivne rezervacije)</p>
          </div>
          <span className="text-xs text-muted-foreground">Ukupno: {stats.revenueTotal.toFixed(2)} {currency}</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyRevenue} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v.toFixed(2)} ${currency}`, "Prihod"]}
                labelFormatter={(l, p) => p?.[0]?.payload?.fullLabel ?? l}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="url(#revGrad)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.monthlyRevenue.slice(-4).map((m) => (
            <div key={m.key} className="rounded-lg border bg-muted/30 p-3">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.fullLabel}</div>
              <div className="mt-1 text-sm font-semibold">{m.revenue.toFixed(2)} {currency}</div>
              <div className="text-[11px] text-muted-foreground">{m.count} rez.</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="rounded-xl border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Nadolazeći dolasci</h3>
            <p className="text-xs text-muted-foreground">Sljedećih 7 dana</p>
          </div>
          <span className="text-xs text-muted-foreground">{stats.upcoming.length} rezervacija</span>
        </div>
        {stats.upcoming.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Nema nadolazećih rezervacija.</div>
        ) : (
          <ul className="divide-y">
            {stats.upcoming.slice(0, 8).map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Car className="h-4 w-4" /></span>
                  <div>
                    <div className="font-medium">{r.full_name} · <span className="font-mono uppercase text-xs">{r.vehicle_plate}</span></div>
                    <div className="text-xs text-muted-foreground">{r.destination ?? "—"}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium">{format(new Date(r.arrival_at), "dd.MM.yyyy HH:mm")}</div>
                  <div className="text-xs text-muted-foreground">{Number(r.estimated_price).toFixed(2)} {currency}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint?: string; tone: "primary" | "success" | "warning" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-destructive/15 text-destructive",
  };
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function StatusPill({ icon: Icon, label, value, className }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; className?: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2">
      <div className={`flex items-center justify-center gap-1 ${className ?? ""}`}>
        <Icon className="h-3.5 w-3.5" />
        <span className="font-semibold">{value}</span>
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function computeStats(reservations: Reservation[], totalSpots: number) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const last30Start = startOfDay(subDays(now, 29));

  let currentlyOccupied = 0;
  let revenueTotal = 0;
  let revenueThisMonth = 0;
  let last30Count = 0;
  let activeCount = 0;
  let cancelledCount = 0;
  let noShowCount = 0;
  const upcoming: Reservation[] = [];

  for (const r of reservations) {
    const arr = new Date(r.arrival_at);
    const dep = new Date(r.departure_at);
    const price = Number(r.estimated_price) || 0;

    if (r.status === "active" || r.status === "completed") {
      revenueTotal += price;
      if (arr >= monthStart) revenueThisMonth += price;
    }
    if (r.status === "active") {
      activeCount++;
      if (arr <= now && now < dep) currentlyOccupied++;
      const in7 = new Date(now); in7.setDate(in7.getDate() + 7);
      if (arr > now && arr <= in7) upcoming.push(r);
    } else if (r.status === "cancelled") cancelledCount++;
    else if (r.status === "no_show") noShowCount++;

    if (arr >= last30Start) last30Count++;
  }

  // Daily series — last 30 days, active only
  const dailySeries = Array.from({ length: 30 }, (_, i) => {
    const day = startOfDay(subDays(now, 29 - i));
    const count = reservations.filter((r) => r.status === "active" && isSameDay(new Date(r.arrival_at), day)).length;
    return { label: format(day, "dd.MM"), count };
  });

  const statusSeries = [
    { label: "Aktivne", count: activeCount, color: "var(--success)" },
    { label: "Otkazane", count: cancelledCount, color: "var(--muted-foreground)" },
    { label: "No-show", count: noShowCount, color: "var(--destructive)" },
  ];

  // Monthly revenue — last 12 months (active reservations, by arrival date)
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const monthDate = startOfMonth(subMonths(now, 11 - i));
    const monthEnd = endOfMonth(monthDate);
    let revenue = 0;
    let count = 0;
    for (const r of reservations) {
      if (r.status !== "active" && r.status !== "completed") continue;
      const arr = new Date(r.arrival_at);
      if (arr >= monthDate && arr <= monthEnd) {
        revenue += Number(r.estimated_price) || 0;
        count++;
      }
    }
    return {
      key: format(monthDate, "yyyy-MM"),
      label: format(monthDate, "MMM", { locale: bs }),
      fullLabel: format(monthDate, "LLLL yyyy", { locale: bs }),
      revenue: Math.round(revenue * 100) / 100,
      count,
    };
  });

  upcoming.sort((a, b) => new Date(a.arrival_at).getTime() - new Date(b.arrival_at).getTime());

  return {
    currentlyOccupied: Math.min(currentlyOccupied, totalSpots),
    revenueTotal,
    revenueThisMonth,
    last30Count,
    activeCount,
    cancelledCount,
    noShowCount,
    dailySeries,
    statusSeries,
    monthlyRevenue,
    upcoming,
  };
}
