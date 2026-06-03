import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "bs" | "en";

const dict = {
  bs: {
    "nav.why": "Zašto Park&Fly",
    "nav.location": "Lokacija",
    "nav.faq": "FAQ",
    "nav.contact": "Kontakt",
    "nav.book": "Rezerviši online",
    "nav.admin": "Admin",
    "hero.title": "PARK&FLY",
    "hero.subtitle": "privatni parking nadomak aerodroma Sarajevo",
    "hero.desc":
      "Sigurno mjesto za vaše vozilo, samo 2 minute od aerodroma. 24/7 videonadzor, fizičko obezbjeđenje, besplatan transport do aerodroma i opcija rent a car kad god vam zatreba.",
    "hero.cta": "REZERVIŠI ONLINE",
    "hero.badge": "2 min od aerodroma · 24/7 nadzor",
    "why.title": "Zašto Park&Fly",
    "why.subtitle": "Sve što vam treba za miran odlazak na put.",
    "why.cctv.t": "Videonadzor 24/7",
    "why.cctv.d": "Kompletan parking je pokriven kamerama uz fizičko obezbjeđenje cijelo vrijeme.",
    "why.airport.t": "Blizina aerodroma",
    "why.airport.d": "Samo 2 minute vožnje do terminala aerodroma Sarajevo.",
    "why.shuttle.t": "Besplatan transport",
    "why.shuttle.d": "Vozimo vas do aerodroma i čekamo pri povratku — bez dodatnih troškova.",
    "why.rentcar.t": "Rent a car",
    "why.rentcar.d": "Trebate auto na destinaciji ili po povratku? Imamo provjerenu rent a car ponudu.",
    "drone.title": "Pogled iz vazduha",
    "drone.desc": "Parking se nalazi u neposrednoj blizini terminala — pogledajte sami.",
    "faq.title": "Često postavljana pitanja",
    "faq.q1": "Koliko je parking udaljen od aerodroma?",
    "faq.a1": "Parking je oko 2 minute vožnje od terminala aerodroma Sarajevo. Naš shuttle vozi goste besplatno.",
    "faq.q2": "Da li je transport do aerodroma uračunat u cijenu?",
    "faq.a2": "Da, transport do aerodroma i nazad uračunat je u cijenu parkinga.",
    "faq.q3": "Šta ako mi let kasni ili se vraćam ranije?",
    "faq.a3": "Nema problema — javite nam i prilagodićemo vrijeme dolaska i odlaska.",
    "faq.q4": "Mogu li otkazati rezervaciju?",
    "faq.a4": "Da, rezervaciju možete otkazati pozivom ili porukom najkasnije 12 sati prije dolaska.",
    "location.title": "Lokacija",
    "location.desc": "Pronađite nas u blizini aerodroma Sarajevo. Tačna lokacija na mapi.",
    "video.title": "Kako doći do nas",
    "video.desc": "Pogledajte kratak vodič kako stići do našeg parkinga.",
    "reviews.title": "Šta kažu naši gosti",
    "reviews.desc": "Provjereni utisci na Google recenzijama.",
    "footer.rights": "Sva prava zadržana.",
    "footer.tagline": "Parkiraj. Leti. Mirno.",
    "rentcar.title": "RENT A CAR — provjerena ponuda",
    "rentcar.desc": "Rezervišite vozilo uz svoj parking po posebnoj cijeni.",
    "rentcar.cta": "Saznaj više",
    // form
    "form.title": "Online rezervacija parkinga",
    "form.fullname": "Ime i prezime",
    "form.plate": "Registracija vozila",
    "form.email": "Kontakt email",
    "form.phone": "Kontakt telefon",
    "form.range": "Trajanje zakupa",
    "form.arrival": "Vrijeme dolaska",
    "form.departure": "Vrijeme odlaska",
    "form.arrivalDate": "Datum dolaska",
    "form.departureDate": "Datum odlaska",
    "form.arrivalTime": "Vrijeme dolaska",
    "form.departureTime": "Vrijeme odlaska",
    "form.destination": "Destinacija leta",
    "form.transfer": "Potreban prevoz do aerodroma",
    "form.note": "Napomena",
    "form.estimate": "Procjena cijene",
    "form.submit": "Potvrdi rezervaciju",
    "form.checking": "Provjeravam dostupnost…",
    "form.available": "Termin je dostupan",
    "form.unavailable": "Termin nije dostupan — pokušajte drugi datum",
    "form.blocked": "Parking ne radi u odabranom periodu",
    "form.success": "Rezervacija poslana! Potvrda stiže na email.",
    "form.error": "Greška pri slanju rezervacije.",
    "form.pickdates": "Odaberite datume",
    "form.days": "dana",
  },
  en: {
    "nav.why": "Why Park&Fly",
    "nav.location": "Location",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.book": "Book online",
    "nav.admin": "Admin",
    "hero.title": "PARK&FLY",
    "hero.subtitle": "private parking next to Sarajevo Airport",
    "hero.desc":
      "A safe spot for your vehicle, just 2 minutes from the airport. 24/7 CCTV, on-site security, free airport shuttle and rent-a-car on demand.",
    "hero.cta": "BOOK ONLINE",
    "hero.badge": "2 min from airport · 24/7 monitoring",
    "why.title": "Why Park&Fly",
    "why.subtitle": "Everything you need for a worry-free trip.",
    "why.cctv.t": "24/7 CCTV",
    "why.cctv.d": "Full camera coverage with on-site security at all times.",
    "why.airport.t": "Next to the airport",
    "why.airport.d": "Just a 2-minute drive to Sarajevo Airport terminal.",
    "why.shuttle.t": "Free shuttle",
    "why.shuttle.d": "We drive you to the terminal and pick you up on return — at no extra cost.",
    "why.rentcar.t": "Rent a car",
    "why.rentcar.d": "Need a car at your destination or upon return? Vetted rental offer included.",
    "drone.title": "Aerial view",
    "drone.desc": "Our parking is right next to the terminal — see for yourself.",
    "faq.title": "Frequently asked questions",
    "faq.q1": "How far is the parking from the airport?",
    "faq.a1": "About a 2-minute drive. Our shuttle is free for all guests.",
    "faq.q2": "Is the airport transfer included?",
    "faq.a2": "Yes, transfer to and from the airport is included in the parking price.",
    "faq.q3": "What if my flight is delayed or I return early?",
    "faq.a3": "No problem — just let us know and we will adjust pickup time.",
    "faq.q4": "Can I cancel a reservation?",
    "faq.a4": "Yes, you can cancel by phone or message at least 12 hours before arrival.",
    "location.title": "Location",
    "location.desc": "Find us right next to Sarajevo Airport. Exact location on the map.",
    "video.title": "How to find us",
    "video.desc": "A short video guide to our parking.",
    "reviews.title": "What our guests say",
    "reviews.desc": "Verified Google reviews.",
    "footer.rights": "All rights reserved.",
    "footer.tagline": "Park. Fly. Relax.",
    "rentcar.title": "RENT A CAR — vetted offer",
    "rentcar.desc": "Book a car with your parking at a special rate.",
    "rentcar.cta": "Learn more",
    "form.title": "Online parking reservation",
    "form.fullname": "Full name",
    "form.plate": "Vehicle plate",
    "form.email": "Contact email",
    "form.phone": "Contact phone",
    "form.range": "Booking range",
    "form.arrival": "Arrival time",
    "form.departure": "Departure time",
    "form.arrivalDate": "Arrival date",
    "form.departureDate": "Departure date",
    "form.arrivalTime": "Arrival time",
    "form.departureTime": "Departure time",
    "form.destination": "Flight destination",
    "form.transfer": "Airport transfer needed",
    "form.note": "Note",
    "form.estimate": "Estimated price",
    "form.submit": "Confirm reservation",
    "form.checking": "Checking availability…",
    "form.available": "Slot available",
    "form.unavailable": "Slot unavailable — please pick another date",
    "form.blocked": "Parking is closed for the selected period",
    "form.success": "Reservation sent! Confirmation is on its way to your email.",
    "form.error": "Failed to submit the reservation.",
    "form.pickdates": "Pick dates",
    "form.days": "days",
  },
} as const;

type Key = keyof typeof dict["bs"];

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string };

const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bs");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("pf_lang") as Lang | null) : null;
    if (saved === "bs" || saved === "en") setLangState(saved);
  }, []);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("pf_lang", l);
  }, []);
  const t = useCallback((k: Key) => dict[lang][k] ?? k, [lang]);
  return <I18nCtx.Provider value={{ lang, setLang, t }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nCtx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
