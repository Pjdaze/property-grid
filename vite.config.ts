import { defineConfig, loadEnv } from "vite";
import type { ViteDevServer } from 'vite';
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const RENTCAST_KEY = env.VITE_RENTCAST_KEY;

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'rentcast-proxy',
        configureServer(server: ViteDevServer) {
          server.middlewares.use(async (req: any, res: any, next: any) => {
            if (!req.url || !req.url.startsWith("/api/rentcast")) return next();

            try {
              const target = `https://api.rentcast.io/v1${req.url.replace(/^\/api\/rentcast/, "")}`;
              console.log(`[rentcast-proxy] Forwarding to: ${target}`);

              const headers: Record<string, string> = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Api-Key": RENTCAST_KEY || ''
              };

              const upstreamRes = await fetch(target, {
                method: req.method,
                headers,
              });

              console.log(`[rentcast-proxy] Status: ${upstreamRes.status}`);
              
              const body = await upstreamRes.arrayBuffer();
              res.statusCode = upstreamRes.status;
              
              upstreamRes.headers.forEach((v: string, k: string) => {
                if (!k.toLowerCase().startsWith("access-control-")) {
                  res.setHeader(k, v);
                }
              });
              
              res.setHeader("content-type", upstreamRes.headers.get("content-type") || "application/json");
              res.end(Buffer.from(body));
            } catch (err: any) {
              console.error("[rentcast-proxy] Error:", err.message);
              res.statusCode = 500;
              res.setHeader("content-type", "application/json");
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        }
      }
    ]
  };
});