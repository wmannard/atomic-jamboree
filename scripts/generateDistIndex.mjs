import { readdir, writeFile } from "fs/promises";
import { join } from "path";

const distDir = "./dist";

const entries = await readdir(distDir, { withFileTypes: true });
const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

const links = dirs
  .map((dir) => `<li>📁 <a href="./${dir}/">${dir}/</a></li>`)
  .join("\n");

const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Jamboree Builds</title>
    <style>
      body { font-family: sans-serif; }
      ul { list-style: none; padding: 0; }
      li { margin: 0.5em 0; font-size: 1.2em; }
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

await writeFile(join(distDir, "index.html"), html);

console.log("Generated dist/index.html with folder icons");
