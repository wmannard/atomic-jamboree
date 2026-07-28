import { resolve } from "path";
import { defineConfig } from "vite";

const jamborees = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const locales = ["en", "fr", "nl"];

function generateLandingPage() {
  const links = jamborees
    .map((j) => {
      const localeLinks = locales
        .map((l) => `<a href="/jamboree_${j}_${l}/" class="locale-link">${l.toUpperCase()}</a>`)
        .join(" ");
      return `<li>📁 <strong>jamboree_${j}</strong> — ${localeLinks}</li>`;
    })
    .join("\n      ");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Jamboree Builds</title>
    <style>
      body { font-family: sans-serif; max-width: 600px; margin: 2em auto; }
      ul { list-style: none; padding: 0; }
      li { margin: 0.75em 0; font-size: 1.1em; }
      .locale-link { margin-left: 0.5em; padding: 0.2em 0.6em; background: #e8f0fe; border-radius: 4px; text-decoration: none; color: #1a73e8; font-size: 0.85em; }
      .locale-link:hover { background: #d2e3fc; }
    </style>
  </head>
  <body>
    <h1>Jamboree Builds</h1>
    <ul>
      ${links}
    </ul>
  </body>
</html>`;
}

export default defineConfig({
  base: "/",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        app: resolve(__dirname, "app.html"),
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

          // Serve a navigation index at the root
          if (req.url === "/" || req.url === "/index.html") {
            res.setHeader("Content-Type", "text/html");
            res.end(generateLandingPage());
            return;
          }

          // Rewrite /jamboree_X_locale/ paths to serve the app's app.html
          if (/^\/jamboree_\d+_(en|fr|nl)(\/|$)/i.test(req.url)) {
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

          // Rewrite /jamboree_X_locale/ paths to serve app.html (mirrors netlify.toml)
          if (/^\/jamboree_\d+_(en|fr|nl)(\/|$)/i.test(req.url)) {
            req.url = "/app.html";
          }

          next();
        });
      },
    },
  ],
});
