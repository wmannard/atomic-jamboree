import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  plugins: [
    {
      name: "jamboree-rewrite",
      configureServer(server) {
        // In dev mode, rewrite /jamboree_X_locale/ navigation requests to serve
        // the root index.html. Only rewrite requests that accept HTML (browser
        // navigation), not JS/CSS/asset fetches.
        server.middlewares.use((req, res, next) => {
          const accept = req.headers.accept || "";
          const isHtmlRequest = accept.includes("text/html");
          if (
            isHtmlRequest &&
            req.url &&
            /^\/jamboree_\d+_(en|fr|nl)(\/|$)/i.test(req.url)
          ) {
            req.url = "/index.html";
          }
          next();
        });
      },
    },
  ],
});
