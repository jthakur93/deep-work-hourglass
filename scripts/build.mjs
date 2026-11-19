// Bundles three.js into a single self-contained index.html, so the app works offline.
// Usage: npm install && npm run build
import { build } from "esbuild";
import { readFile, writeFile, rm } from "node:fs/promises";

const src = await readFile("src/index.html", "utf8");
const block = src.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!block) throw new Error("No <script type=\"module\"> found in src/index.html");

await writeFile(".entry.js", block[1]);
const result = await build({
  entryPoints: [".entry.js"], bundle: true, format: "esm", minify: true,
  target: "es2020", legalComments: "eof", write: false,
});
await rm(".entry.js");

const js = result.outputFiles[0].text.replace(/<\/script/g, "<\\/script");
const html = src
  .replace(/<script type="importmap">[\s\S]*?<\/script>\s*/, "")
  .replace(block[0], () => `<script type="module">\n${js}\n</script>`);
await writeFile("index.html", html);
console.log(`index.html written (${Math.round(html.length / 1024)} KB)`);
