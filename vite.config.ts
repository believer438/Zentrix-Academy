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
      "/ai/": {
        target: BACKEND,
        changeOrigin: true,
        configure: (proxy, opts) => {
          // selfHandleResponse lets us control SSE piping manually, bypassing
          // Vite's compression middleware which would otherwise buffer the stream.
          (opts as Record<string, unknown>).selfHandleResponse = true;

          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("Accept-Encoding", "identity");
          });

          proxy.on("proxyRes", (proxyRes, _req, res) => {
            const ct = (proxyRes.headers["content-type"] as string) ?? "";

            if (ct.includes("text/event-stream")) {
              // ── SSE: bypass all buffering, write each chunk straight to socket ──
              res.writeHead(proxyRes.statusCode ?? 200, {
                "Content-Type":      "text/event-stream; charset=utf-8",
                "Cache-Control":     "no-cache, no-store",
                "X-Accel-Buffering": "no",
                "Connection":        "keep-alive",
              });
              // Disable Nagle's algorithm: no TCP batching of small SSE packets
              (res as unknown as { socket?: { setNoDelay?(v: boolean): void } })
                .socket?.setNoDelay?.(true);
              proxyRes.on("data",  (chunk: Buffer) => { try { res.write(chunk); } catch {} });
              proxyRes.on("end",   ()              => { try { res.end();        } catch {} });
              proxyRes.on("error", ()              => { try { res.end();        } catch {} });
            } else {
              // ── Non-SSE: copy headers and pipe normally ───────────────────────
              const headers: Record<string, string | string[]> = {};
              for (const [k, v] of Object.entries(proxyRes.headers)) {
                if (v != null) headers[k] = v as string | string[];
              }
              res.writeHead(proxyRes.statusCode ?? 200, headers);
              proxyRes.pipe(res);
            }
          });
        },
      },
      "/notifications/": { target: BACKEND, changeOrigin: true },
      "/dashboard/stats": { target: BACKEND, changeOrigin: true },
      "/analytics/":     { target: BACKEND, changeOrigin: true },
      "/admin/":         { target: BACKEND, changeOrigin: true },
      "/quizzes/":       { target: BACKEND, changeOrigin: true },
      "/library/":        { target: BACKEND, changeOrigin: true },
      "/ai-course-gen/":  { target: BACKEND, changeOrigin: true },
      "/health":          { target: BACKEND, changeOrigin: true },
    },
  },
  preview: { host: "0.0.0.0", port: 4173 },
});
