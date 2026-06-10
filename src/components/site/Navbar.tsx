import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

import logoAsset from "@/assets/logo.png.asset.json";

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
        <Link to="/" className="flex items-center text-navy-foreground" aria-label="PARK & FLY">
          <img src={logoAsset.url} alt="PARK & FLY" className="h-8 w-auto max-w-[150px] object-contain" />
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
            href="https://wa.me/387603513513"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition hover:scale-105"
          >
            <WhatsAppIcon className="h-4.5 w-4.5" />
          </a>
          <a
            href="viber://chat?number=%2B38760351351"
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


        </div>

        <button onClick={() => setOpen(!open)} className="rounded-md p-2 text-navy-foreground lg:hidden" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy lg:hidden">
          <div className="container-park flex flex-col gap-3 py-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-navy-foreground/80">
                {l.label}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <a href="https://wa.me/387603513513" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon className="h-4 w-4" /></a>
              <a href="viber://chat?number=%2B38760351351" aria-label="Viber" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#7360F2] text-white"><ViberIcon className="h-4 w-4" /></a>
              {(["bs", "en"] as const).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${lang === l ? "bg-primary text-primary-foreground" : "bg-white/10 text-navy-foreground/70"}`}>{l}</button>
              ))}
            </div>


          </div>
        </div>
      )}
    </header>
  );
}
