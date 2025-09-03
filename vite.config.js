import { defineConfig } from "vite";
// KORREKTUR: Wir importieren das offizielle Tailwind CSS Vite Plugin.
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  // KORREKTUR: Das Plugin wird hier korrekt initialisiert.
  // Es kümmert sich automatisch um alles Weitere (wie PostCSS).
  plugins: [tailwindcss()],
  server: {
    port: 5173,
    hmr: {
      host: "localhost",
      protocol: "ws",
    },
  },
});
