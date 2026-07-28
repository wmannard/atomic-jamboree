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
      name: "jamboree-rewrite",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const accept = req.headers.accept || "";
          const isHtmlRequest = accept.includes("text/html");

          if (!isHtmlRequest) return next();

          // Rewrite /jamboree_X/locale/... paths (including sub-routes) to app.html
          if (/^\/jamboree_\d+\/[a-z]{2}-[a-z]{2}-[a-z]{3}(\/|$)/i.test(req.url)) {
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

          // Rewrite /jamboree_X/locale/... paths (including sub-routes) to app.html
          if (/^\/jamboree_\d+\/[a-z]{2}-[a-z]{2}-[a-z]{3}(\/|$)/i.test(req.url)) {
            req.url = "/app.html";
          }

          next();
        });
      },
    },
  ],
});
