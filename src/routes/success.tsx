import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [
      { title: "Rezervacija uspješna — Park&Fly" },
      { name: "description", content: "Vaša rezervacija je uspješno zaprimljena." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

const copy = {
  bs: {
    title: "Rezervacija uspješna!",
    desc: "Provjerite svoj email za potvrdu rezervacije. Ako poruka nije stigla u inbox, pogledajte i folder neželjene pošte (spam).",
    cta: "Nazad na početnu",
  },
  en: {
    title: "Reservation successful!",
    desc: "Please check your email for the booking confirmation. If you don't see it in your inbox, check your spam folder.",
    cta: "Back to homepage",
  },
} as const;

function SuccessPage() {
  const { lang } = useI18n();
  const c = copy[lang] ?? copy.bs;
  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-10 w-10 text-success" aria-hidden="true" />
        </div>
        <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">{c.title}</h1>
        <p className="mb-8 text-base text-muted-foreground sm:text-lg">{c.desc}</p>
        <Button asChild size="lg">
          <Link to="/">{c.cta}</Link>
        </Button>
      </div>
    </main>
  );
}
