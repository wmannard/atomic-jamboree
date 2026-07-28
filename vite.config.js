import { resolve } from "path";
import { defineConfig } from "vite";

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
  ],
});
