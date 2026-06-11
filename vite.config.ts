// Lovable dev preview koristi default (Cloudflare/Workers) konfiguraciju.
// Za VPS (Node.js + PM2 + Nginx) build koristi:  NITRO_PRESET=node-server bun run build
// Output: .output/server/index.mjs  (pokreće se s `node .output/server/index.mjs`)
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const preset = process.env.NITRO_PRESET;
const isStaticBuild = preset === "static";
const isNodeBuild = preset === "node-server" || preset === "node";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    ...(isStaticBuild ? { spa: { enabled: true } } : {}),
  },
  ...(isStaticBuild || isNodeBuild ? { nitro: { preset: preset! } } : {}),
});
