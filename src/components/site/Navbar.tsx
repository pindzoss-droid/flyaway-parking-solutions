import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Phone, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function Navbar({ onBook }: { onBook: () => void }) {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#why", label: t("nav.why") },
    { href: "#location", label: t("nav.location") },
    { href: "#faq", label: t("nav.faq") },
    { href: "#contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-navy/90 backdrop-blur supports-[backdrop-filter]:bg-navy/70">
      <div className="container-park flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-navy-foreground">
          <span className="text-xl font-bold tracking-tight">PARK</span>
          <span className="text-xl font-bold text-primary">&</span>
          <span className="text-xl font-bold tracking-tight">FLY</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-navy-foreground/80 hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-full p-2 text-navy-foreground/80 hover:bg-white/10 hover:text-primary">
            <MessageCircle className="h-4 w-4" />
          </a>
          <a href="tel:+387" aria-label="Phone" className="rounded-full p-2 text-navy-foreground/80 hover:bg-white/10 hover:text-primary">
            <Phone className="h-4 w-4" />
          </a>
          <div className="flex items-center rounded-full border border-white/15 p-0.5">
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

        <button onClick={() => setOpen(!open)} className="rounded-md p-2 text-navy-foreground md:hidden" aria-label="Menu">
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
