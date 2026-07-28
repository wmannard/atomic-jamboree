import { writeFile } from "fs/promises";
import { join } from "path";

const distDir = "./dist";

const jamborees = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const locales = ["en", "fr", "nl"];

const links = jamborees
  .map((j) => {
    const localeLinks = locales
      .map(
        (l) =>
          `<a href="/jamboree_${j}_${l}/" class="locale-link">${l.toUpperCase()}</a>`
      )
      .join(" ");
    return `<li>📁 <strong>jamboree_${j}</strong> — ${localeLinks}</li>`;
  })
  .join("\n");

const html = `<!DOCTYPE html>
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
</html>
`;

// Write the landing/navigation page as dist/index.html.
// Vite already outputs the SPA entry as dist/app.html (from the source app.html).
const indexHtml = join(distDir, "index.html");
await writeFile(indexHtml, html);

console.log("Generated dist/index.html (landing page). SPA entry is dist/app.html.");
