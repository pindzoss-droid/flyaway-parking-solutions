import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Plane, Bus, Car, MapPin, Phone, Mail, MessageCircle, Star, PlayCircle } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { ReservationModal } from "@/components/site/ReservationModal";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";
import droneImg from "@/assets/drone-aerial.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Park&Fly — privatni parking nadomak aerodroma Sarajevo" },
      { name: "description", content: "Sigurno parkiranje 2 minute od aerodroma Sarajevo. 24/7 nadzor, besplatan transport, rent a car. Rezerviši online." },
      { property: "og:title", content: "Park&Fly — Sarajevo" },
      { property: "og:description", content: "Parkiraj. Leti. Mirno." },
    ],
  }),
  component: Index,
});

function Index() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Navbar onBook={() => setOpen(true)} />
      <Hero onBook={() => setOpen(true)} />
      <Why />
      <DroneShowcase />
      <RentACarBanner />
      <Faq />
      <Location />
      <VideoSection />
      <Reviews />
      <Footer />
      <ReservationModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

function Hero({ onBook }: { onBook: () => void }) {
  const { t } = useI18n();
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{ backgroundImage: `linear-gradient(135deg, oklch(0.18 0.04 252 / 0.92), oklch(0.22 0.07 240 / 0.85)), url(${droneImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="container-park flex min-h-[78vh] flex-col items-start justify-center py-20 text-navy-foreground">
        <span className="mb-4 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-navy-foreground/90">
          {t("hero.badge")}
        </span>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          {t("hero.title")}
        </h1>
        <p className="mt-5 max-w-2xl text-base text-navy-foreground/80 sm:text-lg">{t("hero.desc")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={onBook} size="lg" className="bg-primary text-primary-foreground hover:bg-primary-hover shadow-cta">
            {t("hero.cta")}
          </Button>
          <a href="#why" className="inline-flex items-center justify-center rounded-md border border-white/25 px-5 py-2.5 text-sm font-medium text-navy-foreground hover:bg-white/10">
            {t("nav.why")}
          </a>
        </div>
      </div>
    </section>
  );
}

function Why() {
  const { t } = useI18n();
  const items = [
    { icon: Shield, t: t("why.cctv.t"), d: t("why.cctv.d") },
    { icon: Plane, t: t("why.airport.t"), d: t("why.airport.d") },
    { icon: Bus, t: t("why.shuttle.t"), d: t("why.shuttle.d") },
    { icon: Car, t: t("why.rentcar.t"), d: t("why.rentcar.d") },
  ];
  return (
    <section id="why" className="bg-background py-20">
      <div className="container-park">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("why.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("why.subtitle")}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.t} className="rounded-2xl border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-hero">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{it.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DroneShowcase() {
  const { t } = useI18n();
  return (
    <section className="bg-muted/40 py-20">
      <div className="container-park grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">{t("drone.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("drone.desc")}</p>
        </div>
        <div className="overflow-hidden rounded-2xl shadow-hero">
          <img src={droneImg} alt="Park&Fly aerial view" className="h-full w-full object-cover" />
        </div>
      </div>
    </section>
  );
}

function RentACarBanner() {
  const { t } = useI18n();
  return (
    <section className="py-12">
      <div className="container-park">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-8 text-navy-foreground sm:p-10" style={{ minHeight: 220 }}>
          <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-2xl font-bold sm:text-3xl">{t("rentcar.title")}</h3>
              <p className="mt-2 max-w-xl text-navy-foreground/80">{t("rentcar.desc")}</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary-hover shadow-cta">{t("rentcar.cta")}</Button>
          </div>
          <Car className="absolute -right-6 -bottom-6 h-48 w-48 text-white/5" />
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const { t } = useI18n();
  const qs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
  ];
  return (
    <section id="faq" className="py-20">
      <div className="container-park max-w-3xl">
        <h2 className="text-3xl font-bold sm:text-4xl">{t("faq.title")}</h2>
        <Accordion type="single" collapsible className="mt-6">
          {qs.map((q, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left">{q.q}</AccordionTrigger>
              <AccordionContent>{q.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function Location() {
  const { t } = useI18n();
  return (
    <section id="location" className="bg-muted/40 py-20">
      <div className="container-park grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">{t("location.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("location.desc")}</p>
          <div className="mt-6 space-y-2 text-sm">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Aerodromska bb, Sarajevo</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +387 — — — —</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> info@parkandfly.ba</p>
          </div>
        </div>
        <div className="aspect-video overflow-hidden rounded-2xl border bg-card shadow-card">
          <iframe
            title="Map"
            src="https://www.google.com/maps?q=Sarajevo+Airport&output=embed"
            className="h-full w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

function VideoSection() {
  const { t } = useI18n();
  return (
    <section className="py-20">
      <div className="container-park">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("video.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("video.desc")}</p>
        </div>
        <div className="mx-auto flex aspect-video max-w-4xl items-center justify-center rounded-2xl border bg-muted text-muted-foreground shadow-card">
          <div className="text-center">
            <PlayCircle className="mx-auto h-16 w-16 text-primary/70" />
            <p className="mt-2 text-sm">YouTube video — placeholder</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const { t } = useI18n();
  return (
    <section className="bg-muted/40 py-20">
      <div className="container-park">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("reviews.title")}</h2>
          <p className="mt-2 text-muted-foreground">{t("reviews.desc")}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex text-warning">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-3 text-sm text-muted-foreground">"Odlična usluga i besprijekoran transport — placeholder."</p>
              <p className="mt-3 text-sm font-semibold">Gost {i}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer id="contact" className="bg-navy py-12 text-navy-foreground">
      <div className="container-park grid gap-8 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold">PARK</span>
            <span className="text-xl font-bold text-primary">&</span>
            <span className="text-xl font-bold">FLY</span>
          </div>
          <p className="mt-2 text-sm text-navy-foreground/70">{t("footer.tagline")}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Aerodromska bb, Sarajevo</p>
          <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +387 — — — —</p>
          <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@parkandfly.ba</p>
        </div>
        <div className="flex items-start gap-3">
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="rounded-full bg-white/10 p-2 hover:bg-primary"><MessageCircle className="h-4 w-4" /></a>
          <a href="tel:+387" className="rounded-full bg-white/10 p-2 hover:bg-primary"><Phone className="h-4 w-4" /></a>
        </div>
      </div>
      <div className="container-park mt-8 border-t border-white/10 pt-4 text-xs text-navy-foreground/60">
        © {new Date().getFullYear()} Park&Fly. {t("footer.rights")}
      </div>
    </footer>
  );
}
