import { useQuery } from "@tanstack/react-query";
import { Check, ArrowRight, Plane, ShieldCheck, Eye, Fence, BadgePercent, Sparkles } from "lucide-react";
import { getPricingTiers, type PricingTier } from "@/lib/reservations";
import { Button } from "@/components/ui/button";

type Props = { onBook: () => void };

const COPY: Record<number, { eyebrow: string; title: string; tagline: string; popular?: boolean }> = {
  1: {
    eyebrow: "Kratki boravak",
    title: "Brzi odlazak",
    tagline: "Savršeno za vikend putovanja i poslovne skokove — ostavi auto i kreni bez razmišljanja.",
  },
  2: {
    eyebrow: "Najbolji izbor",
    title: "Odmor bez brige",
    tagline: "Idealan balans cijene i mira — pokrije godišnji odmor uz uštedu na svaki dan.",
    popular: true,
  },
  3: {
    eyebrow: "Dugi put",
    title: "Maraton paket",
    tagline: "Za one koji putuju dugo — najniža dnevna tarifa i potpuna sigurnost vašeg vozila.",
  },
};

function rangeLabel(t1To: number, t2To: number, idx: number): string {
  if (idx === 1) return `1 – ${t1To} dana`;
  if (idx === 2) return `${t1To + 1} – ${t2To} dana`;
  return `${t2To + 1}+ dana`;
}

function savingsPct(price: number, base: number): number {
  if (!base || price >= base) return 0;
  return Math.round(((base - price) / base) * 100);
}

const FEATURES = [
  { icon: Plane, label: "Besplatan transfer do aerodroma" },
  { icon: Eye, label: "Video nadzor 24/7" },
  { icon: ShieldCheck, label: "Fizički nadzor" },
  { icon: Fence, label: "Ograđen i osvijetljen prostor" },
];

export function PricingPackages({ onBook }: Props) {
  const { data: tiers } = useQuery({ queryKey: ["pricing-tiers-public"], queryFn: getPricingTiers });

  const safeTiers: PricingTier[] = tiers ?? [
    { tier_index: 1, day_to: 10, price_per_day: 10 },
    { tier_index: 2, day_to: 20, price_per_day: 8 },
    { tier_index: 3, day_to: null, price_per_day: 6 },
  ];

  const t1To = safeTiers.find((t) => t.tier_index === 1)?.day_to ?? 10;
  const t2To = safeTiers.find((t) => t.tier_index === 2)?.day_to ?? 20;
  const basePrice = Number(safeTiers.find((t) => t.tier_index === 1)?.price_per_day ?? 10);

  return (
    <section id="cjenovnik" className="bg-muted/40 py-24">
      <div className="container-park">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Cjenovnik
          </div>
          <h2 className="text-3xl font-bold sm:text-5xl">Tri paketa, jedna sigurnost</h2>
          <p className="mt-4 text-muted-foreground">
            Što duže ostavite auto kod nas — to je dnevna tarifa povoljnija. Bez skrivenih troškova, sa transferom u cijeni.
          </p>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {safeTiers.map((tier) => {
            const copy = COPY[tier.tier_index];
            const range = rangeLabel(t1To, t2To, tier.tier_index);
            const price = Number(tier.price_per_day);
            const pct = savingsPct(price, basePrice);
            const isPopular = !!copy.popular;

            return (
              <div
                key={tier.tier_index}
                className={
                  "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-hero " +
                  (isPopular ? "border-primary ring-2 ring-primary/40" : "border-border")
                }
              >
                {isPopular && (
                  <div className="absolute right-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow">
                    Najpopularnije
                  </div>
                )}

                <div className={"px-7 pb-6 pt-8 " + (isPopular ? "bg-gradient-primary text-primary-foreground" : "bg-muted/30")}>
                  <div className={"text-[11px] font-semibold uppercase tracking-[0.18em] " + (isPopular ? "text-primary-foreground/80" : "text-primary")}>
                    {copy.eyebrow}
                  </div>
                  <h3 className="mt-1 text-2xl font-bold">{copy.title}</h3>
                  <div className={"mt-1 text-sm " + (isPopular ? "text-primary-foreground/85" : "text-muted-foreground")}>
                    {range}
                  </div>

                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-5xl font-extrabold leading-none tracking-tight">{price.toFixed(0)}</span>
                    <span className="pb-1 text-lg font-semibold">KM</span>
                    <span className={"pb-1.5 ml-1 text-xs " + (isPopular ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      / dan
                    </span>
                  </div>

                  {pct > 0 && (
                    <div className={"mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold " +
                      (isPopular ? "bg-primary-foreground/15 text-primary-foreground" : "bg-success/15 text-success")
                    }>
                      <BadgePercent className="h-3.5 w-3.5" /> Ušteda {pct}%
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-5 p-7">
                  <p className="text-sm text-muted-foreground">{copy.tagline}</p>

                  <ul className="space-y-3 text-sm">
                    {FEATURES.map(({ icon: Icon, label }) => (
                      <li key={label} className="flex items-start gap-2.5">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="h-3 w-3" />
                        </span>
                        <span className="flex-1 text-foreground/85">{label}</span>
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={onBook}
                    className={
                      "mt-auto h-12 w-full text-sm font-bold tracking-wider " +
                      (isPopular
                        ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                        : "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground")
                    }
                  >
                    REZERVIŠI <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
