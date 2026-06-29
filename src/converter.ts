import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDocx from "remark-docx";
import { latexPlugin } from "remark-docx/plugins/latex";

type MetadataOptions = {
  title?: string;
  author?: string;
};

export type ConvertFileOptions = MetadataOptions & {
  input: string;
  output?: string;
};

export type ConvertTextOptions = MetadataOptions & {
  markdown: string;
  output: string;
};

export function defaultOutputPath(inputPath: string): string {
  const parsed = path.parse(inputPath);
  return path.join(parsed.dir, `${parsed.name}.docx`);
}

export async function convertMarkdownFileToDocx(options: ConvertFileOptions): Promise<string> {
  const inputPath = path.resolve(options.input);
  const outputPath = path.resolve(options.output ?? defaultOutputPath(inputPath));
  const markdown = await readFile(inputPath, "utf8");
  const title = options.title ?? path.parse(inputPath).name;
  await writeMarkdownDocx(markdown, outputPath, { ...options, title });
  return outputPath;
}

export async function convertMarkdownTextToDocx(options: ConvertTextOptions): Promise<string> {
  const outputPath = path.resolve(options.output);
  const title = options.title ?? path.parse(outputPath).name;
  await writeMarkdownDocx(options.markdown, outputPath, { ...options, title });
  return outputPath;
}

async function writeMarkdownDocx(markdown: string, outputPath: string, metadata: MetadataOptions): Promise<void> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkDocx, {
      title: metadata.title,
      creator: metadata.author,
      plugins: [latexPlugin()],
    });

  const file = await processor.process(markdown);
  const result = await Promise.resolve(file.result);
  const buffer = toBuffer(result);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);
}

function toBuffer(result: unknown): Buffer {
  if (result instanceof ArrayBuffer) {
    return Buffer.from(result);
  }

  if (ArrayBuffer.isView(result)) {
    return Buffer.from(result.buffer, result.byteOffset, result.byteLength);
  }

  throw new Error("DOCX processor did not return binary data.");
}
