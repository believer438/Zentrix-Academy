import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const BACKEND = "http://localhost:8000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(rootDir, "src") },
    dedupe: ["react", "react-dom"],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
    proxy: {
      "/auth/":          { target: BACKEND, changeOrigin: true },
      "/cours/":         { target: BACKEND, changeOrigin: true },
      "/courses/":       { target: BACKEND, changeOrigin: true },
      "/notes/":         { target: BACKEND, changeOrigin: true },
      "/ai/":            { target: BACKEND, changeOrigin: true },
      "/notifications/": { target: BACKEND, changeOrigin: true },
      "/dashboard/":     { target: BACKEND, changeOrigin: true },
      "/health":         { target: BACKEND, changeOrigin: true },
    },
  },
  preview: { host: "0.0.0.0", port: 4173 },
});
