#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { convertMarkdownFileToDocx, defaultOutputPath } from "./converter.js";

type CliOptions = {
  input?: string;
  output?: string;
  title?: string;
  author?: string;
  help: boolean;
  version: boolean;
};

const USAGE = `md2docx - Markdown to DOCX converter

Usage:
  md2docx <input.md> [-o output.docx] [--title "Title"] [--author "Name"]

Examples:
  md2docx notes.md
  md2docx notes.md -o notes.docx
  md2docx paper.md --title "Paper" --author "Author"

Supported Markdown:
  headings, paragraphs, bold/italic, lists, task lists, tables, blockquotes,
  links, inline code, fenced code blocks, footnotes, and LaTeX math:
  inline $E = mc^2$ or block math with $$...$$.
`;

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    help: false,
    version: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") {
      options.help = true;
      continue;
    }

    if (arg === "-v" || arg === "--version") {
      options.version = true;
      continue;
    }

    if (arg === "-o" || arg === "--output") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error(`${arg} requires a file path.`);
      }
      options.output = value;
      i += 1;
      continue;
    }

    if (arg === "--title") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--title requires a value.");
      }
      options.title = value;
      i += 1;
      continue;
    }

    if (arg === "--author") {
      const value = argv[i + 1];
      if (!value) {
        throw new Error("--author requires a value.");
      }
      options.author = value;
      i += 1;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (options.input) {
      throw new Error(`Unexpected extra argument: ${arg}`);
    }

    options.input = arg;
  }

  return options;
}

async function readPackageVersion(): Promise<string> {
  const cliPath = fileURLToPath(import.meta.url);
  const packageJsonPath = path.resolve(path.dirname(cliPath), "..", "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as { version?: string };
  return packageJson.version ?? "unknown";
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(USAGE);
    return;
  }

  if (options.version) {
    process.stdout.write(`${await readPackageVersion()}\n`);
    return;
  }

  if (!options.input) {
    throw new Error(`Missing input file.\n\n${USAGE}`);
  }

  const output = options.output ?? defaultOutputPath(options.input);
  const created = await convertMarkdownFileToDocx({ ...options, input: options.input, output });
  process.stdout.write(`Created ${created}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 1;
});
