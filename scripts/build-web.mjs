import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

const root = process.cwd();
const outDir = path.join(root, "web-dist");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

await build({
  entryPoints: [path.join(root, "web", "main.ts")],
  bundle: true,
  format: "esm",
  target: ["es2022"],
  outfile: path.join(outDir, "main.js"),
  sourcemap: true,
  minify: true,
});

await cp(path.join(root, "web", "index.html"), path.join(outDir, "index.html"));
await cp(path.join(root, "web", "styles.css"), path.join(outDir, "styles.css"));
