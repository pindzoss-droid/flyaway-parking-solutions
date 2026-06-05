import { useQuery } from "@tanstack/react-query";
import { Check, X, ArrowRight } from "lucide-react";
import { getPricingTiers, type PricingTier } from "@/lib/reservations";
import { Button } from "@/components/ui/button";

type Props = { onBook: () => void };

const COPY: Record<number, { title: (range: string) => string; desc: string; popular?: boolean }> = {
  1: {
    title: (r) => `Parking od ${r} dana`,
    desc: "Idealno rješenje za kraće boravke i brza putovanja. Parkirajte bez stresa i uživajte u sigurnosti.",
  },
  2: {
    title: (r) => `Parking od ${r} dana`,
    desc: "Najpopularniji izbor putnika koji ostaju duže — odličan balans cijene i praktičnosti.",
    popular: true,
  },
  3: {
    title: (r) => `Parking za ${r} dana`,
    desc: "Najpovoljniji paket za dugotrajnije boravke — maksimalna sigurnost po najboljoj cijeni.",
  },
};

function rangeLabel(t1To: number, t2To: number, idx: number): string {
  if (idx === 1) return `1. - ${t1To}.`;
  if (idx === 2) return `${t1To + 1}. - ${t2To}.`;
  return `${t2To + 1}+`;
}

export function PricingPackages({ onBook }: Props) {
  const { data: tiers } = useQuery({ queryKey: ["pricing-tiers-public"], queryFn: getPricingTiers });

  const safeTiers: PricingTier[] = tiers ?? [
    { tier_index: 1, day_to: 10, price_per_day: 10 },
    { tier_index: 2, day_to: 20, price_per_day: 8 },
    { tier_index: 3, day_to: null, price_per_day: 6 },
  ];

  const t1To = safeTiers.find((t) => t.tier_index === 1)?.day_to ?? 10;
  const t2To = safeTiers.find((t) => t.tier_index === 2)?.day_to ?? 20;

  return (
    <section id="cjenovnik" className="bg-muted/40 py-24">
      <div className="container-park">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-5xl">Cjenovnik usluga</h2>
          <p className="mt-4 text-muted-foreground">
            Ovdje ćete pronaći cjenovnik naših uslugama privatnog parkiranja u blizini aerodroma Sarajevo
          </p>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-3">
          {safeTiers.map((tier) => {
            const copy = COPY[tier.tier_index];
            const range = rangeLabel(t1To, t2To, tier.tier_index);
            const hasDiscount = tier.tier_index !== 1;
            const isPopular = !!copy.popular;
            return (
              <div key={tier.tier_index} className="flex flex-col gap-6">
                <div
                  className={
                    "relative flex flex-1 flex-col items-center rounded-2xl border p-8 text-center shadow-card transition " +
                    (isPopular
                      ? "border-primary/30 bg-primary text-primary-foreground"
                      : "bg-card text-foreground")
                  }
                >
                  {isPopular && (
                    <span className="absolute -top-3 rounded-full bg-primary-foreground px-3 py-1 text-xs font-semibold text-primary shadow">
                      Najpopularnije
                    </span>
                  )}
                  <h3 className="text-lg font-semibold">{copy.title(range)}</h3>
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tracking-tight">
                      {Number(tier.price_per_day).toFixed(0)} KM
                    </span>
                    <span className={"text-xs " + (isPopular ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      / cijena po danu
                    </span>
                  </div>
                  <p className={"mt-6 text-sm " + (isPopular ? "text-primary-foreground/85" : "text-muted-foreground")}>
                    {copy.desc}
                  </p>
                </div>

                <ul className="space-y-3 px-1 text-sm">
                  <FeatureRow ok>Besplatan transfer do aerodroma</FeatureRow>
                  <FeatureRow ok>Video nadzor 24/7</FeatureRow>
                  <FeatureRow ok>Fizički nadzor</FeatureRow>
                  <FeatureRow ok>Ograđeni i osvijetljen prostor</FeatureRow>
                  <FeatureRow ok={hasDiscount}>Popust za više dana</FeatureRow>
                </ul>

                <Button
                  onClick={onBook}
                  className={
                    "h-12 w-full text-sm font-bold tracking-wider " +
                    (isPopular
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                      : "border-2 border-primary bg-transparent text-primary hover:bg-primary/5")
                  }
                >
                  REZERVACIJA <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      {ok ? (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </span>
      ) : (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
          <X className="h-3 w-3" />
        </span>
      )}
      <span className={ok ? "" : "text-muted-foreground"}>{children}</span>
    </li>
  );
}
