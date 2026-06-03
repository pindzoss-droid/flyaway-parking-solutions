// Static SPA build za cPanel (Apache shared hosting).
// - spa.enabled = true → TanStack Start radi kao klijentska SPA, bez SSR-a
// - nitro.preset = "static" → output je čisti static folder (HTML + JS + assets)
//   koji možeš direktno zipovati i uploadovati u public_html.
// SPA fallback rute rješava public/.htaccess (RewriteRule → index.html).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    spa: { enabled: true },
    server: { entry: "server" },
  },
  nitro: {
    preset: "static",
  },
});
