# Deploy na cPanel (shared hosting)

## Build lokalno (statički SPA)

```bash
bun install
NITRO_PRESET=static bun run build
```

> Bitno: bez `NITRO_PRESET=static` build pravi SSR (Cloudflare) output. Za cPanel **moraš** postaviti tu env varijablu.

Output ide u **`.output/public/`** — to je folder koji uploadaš.

Na Windowsu (PowerShell):
```powershell
$env:NITRO_PRESET="static"; bun run build
```

## Upload u cPanel

1. Zazipuj **sadržaj** `.output/public/` (uđi unutra i zipuj sve, ne sam folder).
2. cPanel → **File Manager** → otvori `public_html/` (ili folder subdomene `parkandfly.ba`).
3. Upload zip-a → **Extract** → obriši zip.
4. Provjeri da je `.htaccess` ušao (uključi "Show hidden files"). Ako nije, ručno prebaci `public/.htaccess`.

## Environment varijable

Vite ubacuje `VITE_*` varijable **u build**, pa `.env` mora biti popunjen **prije** builda. `.env` se NE uploaduje.

Potrebne:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## SPA routing

`public/.htaccess` rješava deep-linkove (`/admin`, `/auth`) preko Apache rewrite-a — nije ti potreban Node.

## Update sajta

Ponovi build s `NITRO_PRESET=static` → upload `.output/public/` preko postojećeg.
