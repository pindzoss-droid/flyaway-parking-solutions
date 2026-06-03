import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

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

export function Navbar({ onBook }: { onBook: () => void }) {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#why", label: t("nav.why") },
    { href: "#location", label: t("nav.location") },
    { href: "#faq", label: t("nav.faq") },
    { href: "#contact", label: t("nav.contact") },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-navy/90 backdrop-blur supports-[backdrop-filter]:bg-navy/70"
          : "bg-transparent"
      }`}
    >
      <div className="container-park flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-navy-foreground">
          <span className="text-xl font-bold tracking-tight">PARK</span>
          <span className="text-xl font-bold text-primary">&</span>
          <span className="text-xl font-bold tracking-tight">FLY</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-navy-foreground/80 hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition hover:scale-105"
          >
            <WhatsAppIcon className="h-4.5 w-4.5" />
          </a>
          <a
            href="viber://chat?number=%2B387"
            aria-label="Viber"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#7360F2] text-white shadow-sm transition hover:scale-105"
          >
            <ViberIcon className="h-4.5 w-4.5" />
          </a>
          <div className="ml-1 flex items-center rounded-full border border-white/15 p-0.5">
            {(["bs", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${lang === l ? "bg-primary text-primary-foreground" : "text-navy-foreground/70 hover:text-navy-foreground"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <Button onClick={onBook} size="sm" className="bg-primary text-primary-foreground hover:bg-primary-hover shadow-cta">
            {t("nav.book")}
          </Button>
        </div>

        <button onClick={() => setOpen(!open)} className="rounded-md p-2 text-navy-foreground lg:hidden" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy md:hidden">
          <div className="container-park flex flex-col gap-3 py-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-navy-foreground/80">
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon className="h-4 w-4" /></a>
              <a href="viber://chat?number=%2B387" aria-label="Viber" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#7360F2] text-white"><ViberIcon className="h-4 w-4" /></a>
              {(["bs", "en"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${lang === l ? "bg-primary text-primary-foreground" : "bg-white/10 text-navy-foreground/70"}`}>{l}</button>
              ))}
            </div>
            <Button onClick={() => { setOpen(false); onBook(); }} className="bg-primary text-primary-foreground hover:bg-primary-hover">
              {t("nav.book")}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
