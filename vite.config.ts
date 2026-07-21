import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// spectroscope-edu — a standalone, backend-free teaching app. Unlike spectro-web
// there is NO dev proxy (no /api, no /ws: the whole UI rides the replay seam,
// compile(dsl) -> RunEvent[] -> stepper.loadReplay) and the build writes to a
// self-owned ./dist that Cloudflare Workers Static Assets serves as an SPA.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
});
