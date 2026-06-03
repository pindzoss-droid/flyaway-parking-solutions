// Lovable dev preview zahtijeva default (SSR/nitro) konfiguraciju.
// Za cPanel build koristi:  NITRO_PRESET=static bun run build
// Tada output ide u .output/public/ kao statički SPA.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isStaticBuild = process.env.NITRO_PRESET === "static";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    ...(isStaticBuild ? { spa: { enabled: true } } : {}),
  },
  ...(isStaticBuild ? { nitro: { preset: "static" } } : {}),
});
