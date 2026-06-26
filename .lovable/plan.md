## Cilj
Implementirati **Google Consent Mode v2** + GDPR cookie banner. GTM se učitava odmah ali u "denied" stanju (šalje samo anonimne pinge); puni tracking se aktivira tek kad korisnik klikne "Prihvati". Banner je dvojezičan (bs/en).

## Šta se mijenja

### 1. `src/routes/__root.tsx` — Consent Mode default state
- **Prije** postojeće GTM `scripts` inicijalizacije dodati novi script koji postavlja default consent stanje na "denied" za sve kategorije:
  ```js
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted',
    'wait_for_update': 500
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);
  ```
- **Ovaj script MORA biti prvi**, prije postojećeg GTM snippeta — redoslijed u `scripts` array.
- Postojeći GTM snippet i `<noscript>` iframe ostaju netaknuti.
- Renderirati `<CookieConsent />` u `RootComponent`-u, pored `<Toaster />`.

### 2. Novi komponent: `src/components/site/CookieConsent.tsx`
- Fixed banner na dnu ekrana (`fixed bottom-4 left-4 right-4` na mobilu, centrirano max-width na desktopu), sa `bg-card`, `border`, `shadow-card`.
- Sadržaj:
  - Naslov: "Vaša privatnost" / "Your privacy"
  - Kratak tekst: koristimo kolačiće za analitiku (Google Tag Manager), korisnik može prihvatiti ili odbiti.
  - Tri dugmeta: **Prihvati sve**, **Samo neophodni**, **Postavke**
  - "Postavke" otvara inline panel sa dva toggle-a (`Switch` iz `@/components/ui/switch`):
    - "Neophodni" — disabled, uvijek on
    - "Analitički" — toggle
- Logika dugmadi:
  - **Prihvati sve** → poziva `gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' })`
  - **Samo neophodni** → poziva `gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })`
  - **Sačuvaj izbor** (iz Postavke panela) → granted/denied prema toggle-u
- Stanje u `localStorage` ključ `parkfly_cookie_consent`: `{ analytics: boolean, ads: boolean, timestamp: number, version: 1 }`.
- Na mountu: ako postoji zapis, pošalji odgovarajući `gtag('consent', 'update', ...)` i sakrij banner. Inače prikaži banner.
- `role="dialog"`, `aria-label`, pristupačnost.

### 3. Prijevodi: `src/lib/i18n.tsx`
Dodati ključeve za `bs` i `en`:
- `cookies.title` — "Vaša privatnost" / "Your privacy"
- `cookies.text` — kratko objašnjenje (GTM, analitika, mogućnost odbijanja)
- `cookies.acceptAll` — "Prihvati sve" / "Accept all"
- `cookies.necessaryOnly` — "Samo neophodni" / "Only necessary"
- `cookies.settings` — "Postavke" / "Settings"
- `cookies.necessary` — "Neophodni" / "Necessary"
- `cookies.necessaryDesc` — "Potrebni za rad sajta. Uvijek aktivni."
- `cookies.analytics` — "Analitički" / "Analytics"
- `cookies.analyticsDesc` — "Google Tag Manager — anonimna statistika korištenja."
- `cookies.save` — "Sačuvaj izbor" / "Save choice"

## Kako ovo radi u praksi
1. Korisnik otvori sajt → GTM se odmah učita ALI u "denied" stanju → šalje samo *cookieless pings* (anonimne, bez identifikatora).
2. Banner se pojavi.
3. Ako korisnik **prihvati** → `gtag consent update` → GTM počne pratiti normalno.
4. Ako korisnik **odbije** → consent ostaje "denied" → Google preko *behavioral modeling*-a popunjava agregatnu statistiku u GA4, ali bez ličnih podataka.
5. Izbor se pamti u `localStorage`; banner se više ne prikazuje dok korisnik ne očisti storage.

## Tehničke napomene
- Nema novih ovisnosti.
- `wait_for_update: 500` daje banneru 500ms da reagira prije nego GTM pošalje prvi event — sprječava "flash" praćenja prije odluke.
- `ads_data_redaction: true` osigurava da Google Ads ne šalje IP/cookije u "denied" stanju.

## Šta se NE mijenja
- GTM ID ostaje `GTM-TVJZTKL7`.
- Postojeća struktura ruta, footer, layout, i18n provider, backend.
