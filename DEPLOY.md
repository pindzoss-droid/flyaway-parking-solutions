# Deploy na cPanel (shared hosting)

## Build lokalno

```bash
bun install
bun run build
```

Output ide u **`.output/public/`** — to je folder koji uploadaš.

## Upload u cPanel

1. Zazipuj **sadržaj** `.output/public/` (ne sam folder — uđi unutra i zipuj sve).
2. U cPanel → **File Manager** → otvori `public_html/` (ili subdomenu npr. `parkandfly.ba`).
3. Upload zip-a → **Extract** → obriši zip.
4. Provjeri da je `.htaccess` ušao (skriveni fajl — uključi "Show hidden files"). Ako nije, ručno ga prebaci iz `public/.htaccess`.

## Environment varijable

Vite ubacuje `VITE_*` varijable **u build**, tako da `.env` mora biti popunjen **prije** `bun run build`. `.env` se NE uploaduje na server.

Trenutno su potrebne:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## SPA routing

`public/.htaccess` već rješava deep-linkove (`/admin`, `/auth` itd.) preko Apache rewrite-a — ne treba ti Node, samo statički Apache.

## Custom domena

U cPanelu pod **Domains** dodaj `parkandfly.ba`, postavi document root na folder gdje si extractovao build.

## Update sajta

Ponovi `bun run build` lokalno → upload `.output/public/` sadržaja preko postojećeg (overwrite).
