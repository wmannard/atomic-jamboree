import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import { generateToken } from "./server/token.js";

// Closure variable for the token plugin — shared between configResolved and configureServer
let tokenEnv = {};

// Shared middleware used by both dev and preview servers
async function tokenMiddleware(req, res, next) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname !== "/api/token") return next();

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const result = await generateToken(tokenEnv);

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (result.ok) {
    res.statusCode = 200;
    res.end(JSON.stringify({ token: result.token }));
  } else {
    res.statusCode = result.status;
    res.end(JSON.stringify({ error: result.error }));
  }
}

export default defineConfig({
  base: "/",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        app: resolve(__dirname, "app.html"),
        index: resolve(__dirname, "index.html"),
      },
    },
  },
  plugins: [
    {
      name: "app-rewrite",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const accept = req.headers.accept || "";
          const isHtmlRequest = accept.includes("text/html");

          if (!isHtmlRequest) return next();

          const url = req.url || "";
          const pathname = url.split("?")[0];

          // Rewrite app routes to app.html
          if (/^\/(search|listing\d*|pdp|recs\d*)(\/|$)/.test(pathname)) {
            req.url = "/app.html";
          }

          // Backwards compat: rewrite old /jamboree_X/locale/... paths to app.html
          if (/^\/jamboree_\d+\/[a-z]{2}-[a-z]{2}-[a-z]{3}(\/|$)/i.test(pathname)) {
            req.url = "/app.html";
          }

          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const accept = req.headers.accept || "";
          const isHtmlRequest = accept.includes("text/html");

          if (!isHtmlRequest) return next();

          const url = req.url || "";
          const pathname = url.split("?")[0];

          // Rewrite app routes to app.html
          if (/^\/(search|listing\d*|pdp|recs\d*)(\/|$)/.test(pathname)) {
            req.url = "/app.html";
          }

          // Backwards compat: rewrite old /jamboree_X/locale/... paths to app.html
          if (/^\/jamboree_\d+\/[a-z]{2}-[a-z]{2}-[a-z]{3}(\/|$)/i.test(pathname)) {
            req.url = "/app.html";
          }

          next();
        });
      },
    },
    // Token service plugin — exposes GET /api/token during dev
    {
      name: "coveo-token",
      configResolved(config) {
        // Load ALL env vars (empty prefix) so COVEO_API_KEY is accessible
        tokenEnv = loadEnv(config.mode, config.root, "");
      },
      configureServer(server) {
        const plugin = this;
        server.middlewares.use(tokenMiddleware);
      },
      configurePreviewServer(server) {
        server.middlewares.use(tokenMiddleware);
      },
    },
  ],
});
