import { createFileRoute } from "@tanstack/react-router";
import type * as React from "react";
import { useState } from "react";
import { Shield, Plane, Bus, Car, MapPin, Phone, Mail, Star, PlayCircle, Clock, CreditCard, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { ReservationModal } from "@/components/site/ReservationModal";
import { PricingPackages } from "@/components/site/PricingPackages";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n";
import droneAsset from "@/assets/drone-aerial.png.asset.json";
import rentcarBgAsset from "@/assets/rentcar-bg.png.asset.json";
import aerialMapAsset from "@/assets/aerial-map.png.asset.json";
import heroBgAsset from "@/assets/hero-airport.png.asset.json";

const droneImg = droneAsset.url;
const heroBg = heroBgAsset.url;
const aerialMapImg = aerialMapAsset.url;
const rentcarBg = rentcarBgAsset.url;

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
      <PricingPackages onBook={() => setOpen(true)} />
      <RentACarBanner />
      <Faq />
      <Location />
      {/* <VideoSection /> */}
      {/* <Reviews /> */}
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
      style={{ backgroundImage: `linear-gradient(135deg, oklch(0.18 0.04 252 / 0.92), oklch(0.22 0.07 240 / 0.85)), url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="container-park flex min-h-[88vh] flex-col items-center justify-center py-24 text-center text-navy-foreground">
        <span className="mb-8 inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-navy-foreground/90">
          {t("hero.badge")}
        </span>
        <h1 className="max-w-5xl text-5xl font-extrabold leading-[1.05] sm:text-6xl md:text-6xl">
          {t("hero.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-5xl font-extrabold leading-[1.1] text-navy-foreground/95 sm:text-6xl md:text-6xl">
          {t("hero.subtitle")}
        </p>
        <p className="mx-auto mt-8 max-w-2xl text-lg font-light text-navy-foreground/80 sm:text-xl">{t("hero.desc")}</p>
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
    <section id="why" className="bg-background py-28">
      <div className="container-park text-center">
        <div className="mx-auto mb-16 max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("why.title")}</h2>
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
  return (
    <section className="bg-muted/40">
      <img src={aerialMapImg} alt="Park&Fly — pogled iz vazduha s rutom do aerodroma Sarajevo" className="block w-full h-auto" />
    </section>
  );
}

function RentACarBanner() {
  return (
    <section className="py-16">
      <div className="container-park">
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-2xl p-10 text-center text-white sm:p-12"
          style={{
            minHeight: 280,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${rentcarBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-5">
            <h3 className="text-3xl font-bold sm:text-4xl">Rent a Car i usluge prevoza</h3>
            <p className="max-w-xl text-white/85">Rezerviši vozilo ili transfer u 2 jednostavna koraka</p>
            <Button
              className="h-12 px-8 text-base font-semibold text-white shadow-cta"
              style={{ backgroundColor: "#BFA37C" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#AC8E68")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#BFA37C")}
            >
              Saznaj više
            </Button>
          </div>
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
        <h2 className="text-3xl font-bold sm:text-4xl">{t("faq.title")}</h2>
        <Accordion type="single" collapsible className="mt-8 text-left">
          {qs.map((q, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold sm:text-lg">{q.q}</AccordionTrigger>
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
      <div className="container-park grid items-center gap-16 lg:grid-cols-[35fr_65fr]">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("location.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("location.desc")}</p>
          <div className="mt-8 grid gap-3">
            <ContactBox icon={MapPin} label="Adresa" value="Kurta Schorka 24a, Sarajevo" />
            <ContactBox icon={Phone} label="Telefon" value="060/351-3513" />
            <ContactBox icon={Mail} label="Email" value="info@parkandfly.ba" />
          </div>
        </div>
        <div className="aspect-video overflow-hidden rounded-2xl border bg-card shadow-card">
          <iframe
            title="Map"
            src="https://www.google.com/maps?q=43.83096560702807,18.329951888090577&z=17&output=embed"
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
          <h2 className="text-3xl font-bold sm:text-4xl">{t("video.title")}</h2>
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
          <h2 className="text-3xl font-bold sm:text-4xl">{t("reviews.title")}</h2>
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
      <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.776 6.12 20.36h.003l-.004 2.416s-.037.977.61 1.177c.777.242 1.234-.5 1.98-1.302.407-.44.972-1.084 1.397-1.58 3.85.326 6.812-.416 7.15-.525.776-.252 5.176-.816 5.892-6.657.74-6.02-.36-9.83-2.34-11.546-.596-.55-3.006-2.3-8.375-2.323 0 0-.395-.025-1.037-.017zm.058 1.693c.545-.004.88.017.88.017 4.542.02 6.717 1.388 7.222 1.846 1.675 1.435 2.53 4.868 1.906 9.897v.002c-.604 4.878-4.174 5.184-4.832 5.395-.28.09-2.882.737-6.153.524 0 0-2.436 2.94-3.197 3.704-.12.12-.26.167-.352.144-.13-.033-.166-.188-.165-.414l.02-4.018c-4.762-1.32-4.485-6.292-4.43-8.895.054-2.604.543-4.738 1.996-6.173 1.96-1.773 5.474-2.018 7.11-2.03zm.38 2.602c-.167 0-.303.135-.304.302 0 .167.133.303.3.305 1.624.01 2.946.537 4.028 1.592 1.073 1.046 1.62 2.468 1.633 4.334.002.167.14.3.307.3.166-.002.3-.138.3-.304-.014-1.984-.618-3.596-1.816-4.764-1.19-1.16-2.692-1.753-4.447-1.765zm-3.96.695c-.19-.032-.4.005-.616.117l-.01.002c-.43.247-.816.562-1.146.932-.002.004-.006.004-.008.008-.267.323-.42.638-.46.948-.008.046-.01.093-.007.14 0 .136.022.27.065.4l.013.01c.135.48.473 1.276 1.205 2.604.42.768.903 1.5 1.446 2.186.27.344.56.673.87.984l.132.132c.31.308.64.6.984.87.686.543 1.418 1.027 2.186 1.447 1.328.733 2.126 1.07 2.604 1.206l.01.014c.13.042.265.064.402.063.046.002.092 0 .138-.008.31-.036.627-.19.948-.46.004 0 .003-.002.008-.005.37-.33.683-.72.93-1.148l.003-.01c.225-.432.15-.842-.18-1.12-.004 0-.698-.58-1.037-.83-.36-.255-.73-.492-1.113-.71-.51-.285-1.032-.106-1.248.174l-.447.564c-.23.283-.657.246-.657.246-3.12-.796-3.955-3.955-3.955-3.955s-.037-.426.248-.656l.563-.448c.277-.215.456-.737.17-1.248-.217-.383-.454-.756-.71-1.115-.25-.34-.826-1.033-.83-1.035-.137-.165-.31-.265-.502-.297zm4.49.88c-.158.002-.29.124-.3.282-.01.167.115.312.282.324 1.16.085 2.017.466 2.645 1.15.63.688.93 1.524.906 2.57-.002.168.13.306.3.31.166.003.305-.13.31-.297.025-1.175-.334-2.193-1.067-2.994-.74-.81-1.777-1.253-3.05-1.346h-.024zm.463 1.63c-.16.002-.29.127-.3.287-.008.167.12.31.288.32.523.028.875.175 1.113.422.24.245.388.62.416 1.164.01.167.15.295.318.287.167-.008.295-.15.287-.317-.03-.644-.215-1.178-.58-1.557-.367-.378-.893-.574-1.52-.607h-.018z"/>
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

      <div className="container-park py-24">
        {/* CTA strip — full width */}
        <div className="mb-14 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-hero">
          <h3 className="text-3xl font-bold sm:text-4xl">{t("footer.tagline")}</h3>
          <p className="mt-2 text-navy-foreground/70">Rezerviši online — sigurno mjesto za tvoj auto dok ti letiš.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a href="https://wa.me/387603513513" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 text-sm font-semibold text-white">
              <WhatsAppIcon className="h-4 w-4" /> WhatsApp
            </a>
            <a href="viber://chat?number=%2B38760351351" className="inline-flex items-center gap-2 rounded-md bg-[#7360F2] px-4 py-2 text-sm font-semibold text-white">
              <ViberIcon className="h-4 w-4" /> Viber
            </a>
            <a href="tel:+38760351351" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-navy-foreground hover:bg-white/10">
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
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Kurta Schorka 24a, Sarajevo</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> 060/351-3513</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> info@parkandfly.ba</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <a href="https://wa.me/387603513513" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon className="h-4 w-4" /></a>
              <a href="viber://chat?number=%2B38760351351" aria-label="Viber" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#7360F2] text-white"><ViberIcon className="h-4 w-4" /></a>
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
