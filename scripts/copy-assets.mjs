import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

await mkdir(path.join(root, "dist"), { recursive: true });
await copyFile(path.join(root, "src", "preload.cjs"), path.join(root, "dist", "preload.cjs"));
