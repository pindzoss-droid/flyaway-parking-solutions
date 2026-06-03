import { createFileRoute } from "@tanstack/react-router";
import type * as React from "react";
import { useState } from "react";
import { Shield, Plane, Bus, Car, MapPin, Phone, Mail, Star, PlayCircle, Clock, CreditCard, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { ReservationModal } from "@/components/site/ReservationModal";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";
import droneAsset from "@/assets/drone-aerial.png.asset.json";

const droneImg = droneAsset.url;

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
      className="relative isolate -mt-16 overflow-hidden pt-16"
      style={{ backgroundImage: `linear-gradient(135deg, oklch(0.18 0.04 252 / 0.88), oklch(0.22 0.07 240 / 0.78)), url(${droneImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="container-park flex min-h-[88vh] flex-col items-center justify-center py-24 text-center text-navy-foreground">
        <span className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-navy-foreground/90">
          {t("hero.badge")}
        </span>
        <h1 className="max-w-5xl text-5xl font-extrabold leading-[1.05] sm:text-6xl md:text-6xl">
          {t("hero.title")}
        </h1>
        <p className="mt-5 max-w-3xl text-5xl font-extrabold leading-[1.05] text-navy-foreground/95 sm:text-6xl md:text-6xl">
          {t("hero.subtitle")}
        </p>
        <p className="mx-auto mt-8 max-w-2xl text-lg text-navy-foreground/80 sm:text-xl">{t("hero.desc")}</p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Button onClick={onBook} size="lg" className="bg-primary text-primary-foreground hover:bg-primary-hover shadow-cta h-14 px-10 text-base font-bold tracking-wide">
            {t("hero.cta")}
          </Button>
          <a href="#why" className="inline-flex h-14 items-center justify-center rounded-md border border-white/25 px-7 text-base font-semibold text-navy-foreground hover:bg-white/10">
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
    <section id="why" className="bg-background py-24">
      <div className="container-park text-center">
        <div className="mx-auto mb-14 max-w-2xl">
          <h2 className="text-4xl font-bold sm:text-5xl">{t("why.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("why.subtitle")}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.t} className="rounded-2xl border bg-card p-6 text-center shadow-card transition hover:-translate-y-1 hover:shadow-hero">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
  const points = [
    { icon: Plane, label: "Direktan vizuelni pristup pisti aerodroma" },
    { icon: ShieldCheck, label: "Ograđen prostor pod kontrolom 24/7" },
    { icon: Bus, label: "Shuttle vozilo uvijek na lokaciji" },
  ];
  return (
    <section className="bg-muted/40 py-24">
      <div className="container-park grid items-center gap-10 lg:grid-cols-[65fr_35fr]">
        <div className="order-2 overflow-hidden rounded-2xl shadow-hero lg:order-1">
          <img src={droneImg} alt="Park&Fly aerial view" className="h-[520px] w-full object-cover sm:h-[620px]" />
        </div>
        <div className="order-1 text-center lg:order-2 lg:text-left">
          <h2 className="text-4xl font-bold sm:text-5xl">{t("drone.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("drone.desc")}</p>
          <ul className="mt-6 space-y-3 text-left">
            {points.map((p) => (
              <li key={p.label} className="flex items-start gap-3 rounded-xl border bg-card/60 p-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><p.icon className="h-4 w-4" /></span>
                <span className="text-sm font-medium">{p.label}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border bg-card p-3"><div className="text-2xl font-extrabold text-primary">2 min</div><div className="text-xs text-muted-foreground">do terminala</div></div>
            <div className="rounded-xl border bg-card p-3"><div className="text-2xl font-extrabold text-primary">24/7</div><div className="text-xs text-muted-foreground">nadzor</div></div>
            <div className="rounded-xl border bg-card p-3"><div className="text-2xl font-extrabold text-primary">100%</div><div className="text-xs text-muted-foreground">sigurno</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RentACarBanner() {
  const { t } = useI18n();
  return (
    <section className="py-16">
      <div className="container-park">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-hero p-10 text-center text-navy-foreground sm:p-12" style={{ minHeight: 240 }}>
          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-5">
            <h3 className="text-3xl font-bold sm:text-4xl">{t("rentcar.title")}</h3>
            <p className="max-w-xl text-navy-foreground/85">{t("rentcar.desc")}</p>
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
    <section id="faq" className="py-24">
      <div className="container-park mx-auto max-w-3xl text-center">
        <h2 className="text-4xl font-bold sm:text-5xl">{t("faq.title")}</h2>
        <Accordion type="single" collapsible className="mt-8 text-left">
          {qs.map((q, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-lg font-bold sm:text-xl">{q.q}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">{q.a}</AccordionContent>
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
    <section id="location" className="bg-muted/40 py-24">
      <div className="container-park grid items-center gap-10 lg:grid-cols-[35fr_65fr]">
        <div className="text-center lg:text-left">
          <h2 className="text-4xl font-bold sm:text-5xl">{t("location.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("location.desc")}</p>
          <div className="mt-8 grid gap-3">
            <ContactBox icon={MapPin} label="Adresa" value="Aerodromska bb, Sarajevo" />
            <ContactBox icon={Phone} label="Telefon" value="+387 — — — —" />
            <ContactBox icon={Mail} label="Email" value="info@parkandfly.ba" />
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
    <section className="py-24">
      <div className="container-park text-center">
        <div className="mx-auto mb-10 max-w-2xl">
          <h2 className="text-4xl font-bold sm:text-5xl">{t("video.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("video.desc")}</p>
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
    <section className="bg-muted/40 py-24">
      <div className="container-park text-center">
        <div className="mx-auto mb-10 max-w-2xl">
          <h2 className="text-4xl font-bold sm:text-5xl">{t("reviews.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("reviews.desc")}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 text-left shadow-card">
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.05 4.91A10 10 0 0 0 4.1 18.34L3 22l3.77-1.08A10 10 0 1 0 19.05 4.91Zm-7.04 15.4a8.31 8.31 0 0 1-4.24-1.16l-.3-.18-2.24.64.65-2.18-.2-.31a8.32 8.32 0 1 1 6.33 3.19Zm4.55-6.22c-.25-.13-1.47-.73-1.7-.81-.23-.08-.4-.13-.56.13-.17.25-.65.81-.79.97-.15.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.66-1.25-1.48-1.4-1.73-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.02 2.56c.13.17 1.76 2.69 4.27 3.77.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z"/>
    </svg>
  );
}

function ViberIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.4c-.36-.18-2.13-1.05-2.46-1.17-.33-.12-.57-.18-.81.18-.24.36-.93 1.17-1.14 1.41-.21.24-.42.27-.78.09-.36-.18-1.52-.56-2.89-1.79-1.07-.95-1.79-2.13-2-2.49-.21-.36-.02-.55.16-.73.16-.16.36-.42.54-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.81-1.95-1.11-2.67-.29-.7-.59-.6-.81-.61h-.69c-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3s1.29 3.48 1.47 3.72c.18.24 2.55 3.9 6.18 5.46.86.37 1.54.59 2.07.76.87.28 1.66.24 2.29.15.7-.1 2.13-.87 2.43-1.71.3-.84.3-1.56.21-1.71-.09-.15-.33-.24-.69-.42ZM12 2C6.48 2 2 6.06 2 11.05c0 1.81.59 3.5 1.61 4.92L2 22l6.27-1.64A10.5 10.5 0 0 0 12 21c5.52 0 10-4.06 10-9.95C22 6.06 17.52 2 12 2Z"/>
    </svg>
  );
}

function Footer() {
  const { t } = useI18n();
  const trust = [
    { icon: ShieldCheck, label: "24/7 nadzor" },
    { icon: Clock, label: "Otvoreno 0–24h" },
    { icon: CreditCard, label: "Kartice & gotovina" },
    { icon: Plane, label: "2 min do aerodroma" },
  ];
  return (
    <footer id="contact" className="relative overflow-hidden bg-navy text-navy-foreground">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container-park py-16">
        {/* CTA strip — full width */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-hero">
          <h3 className="text-3xl font-bold sm:text-4xl">{t("footer.tagline")}</h3>
          <p className="mt-2 text-navy-foreground/70">Rezerviši online — sigurno mjesto za tvoj auto dok ti letiš.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-semibold text-white">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
            <a href="viber://chat?number=%2B387" className="inline-flex items-center gap-2 rounded-md bg-[#7360F2] px-4 py-2 text-sm font-semibold text-white">
              <ViberIcon className="h-4 w-4" /> Viber
            </a>
            <a href="tel:+387" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-navy-foreground hover:bg-white/10">
              <Phone className="h-4 w-4" /> Pozovi
            </a>
          </div>
        </div>

        {/* Trust row */}
        <div className="mb-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((t) => (
            <div key={t.label} className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <t.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-navy-foreground/85">{t.label}</span>
            </div>
          ))}
        </div>

        {/* Columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold">PARK</span>
              <span className="text-2xl font-bold text-primary">&</span>
              <span className="text-2xl font-bold">FLY</span>
            </div>
            <p className="mt-3 text-sm text-navy-foreground/70">Privatni parking 2 min od aerodroma Sarajevo. Sigurno, brzo, povoljno.</p>
            <h4 className="mt-6 text-sm font-semibold uppercase tracking-wider text-navy-foreground/60">Radno vrijeme</h4>
            <ul className="mt-3 space-y-2 text-sm text-navy-foreground/80">
              <li className="flex justify-between"><span>Pon – Ned</span><span>0 – 24h</span></li>
              <li className="flex justify-between"><span>Praznici</span><span>Otvoreno</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-navy-foreground/60">Linkovi</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#why" className="text-navy-foreground/80 hover:text-primary">{t("nav.why")}</a></li>
              <li><a href="#location" className="text-navy-foreground/80 hover:text-primary">{t("nav.location")}</a></li>
              <li><a href="#faq" className="text-navy-foreground/80 hover:text-primary">{t("nav.faq")}</a></li>
              <li><a href="#contact" className="text-navy-foreground/80 hover:text-primary">{t("nav.contact")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-navy-foreground/60">Kontakt</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Aerodromska bb, Sarajevo</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +387 — — — —</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> info@parkandfly.ba</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon className="h-4 w-4" /></a>
              <a href="viber://chat?number=%2B387" aria-label="Viber" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#7360F2] text-white"><ViberIcon className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-park flex flex-col items-center justify-between gap-3 py-5 text-xs text-navy-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Park&Fly Sarajevo. {t("footer.rights")}</p>
          <p>Made with ♥ in Sarajevo</p>
        </div>
      </div>
    </footer>
  );
}

function ContactBox({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="text-left">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}
