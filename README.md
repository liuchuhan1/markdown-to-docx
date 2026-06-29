# Markdown to DOCX

Portable Markdown to DOCX converter with both GUI and CLI entry points. It is
based on Electron, `unified`, `remark-docx`, and MathJax.

It supports common Markdown structure such as headings, paragraphs, lists, task lists,
tables, blockquotes, links, code, footnotes, and LaTeX math.

## Install

```bash
npm install
npm run build
```

## GUI

Start the desktop app during development:

```bash
npm run dev:gui
```

Build a Windows x64 portable executable:

```bash
npm run package:win
```

The generated executable is written to:

```text
release/Markdown-to-DOCX-1.0.0-x64.exe
```

This `.exe` bundles Electron and the converter runtime, so the target machine
does not need Node.js or npm installed.

The GUI has two tabs:

- `MD 文件` / `Markdown file`: choose an existing `.md` file and convert it to `.docx`.
- `粘贴内容` / `Paste content`: paste Markdown directly, choose a `.docx` output path, and convert.

The GUI supports Simplified Chinese and English. It detects the system/browser
language on first launch and remembers manual language selection locally.

## GitHub Release

Push a tag such as `v1.0.0` and GitHub Actions will build the Windows portable
exe and attach it to the GitHub Release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Usage

```bash
npm run dev -- examples/sample.md -o examples/sample.docx
```

After building:

```bash
node dist/cli.js examples/sample.md -o examples/sample.docx
```

On Windows, you can also use the included command script:

```powershell
.\md2docx.cmd examples\sample.md -o examples\sample.docx
```

Or install/link locally:

```bash
npm link
md2docx examples/sample.md -o examples/sample.docx
```

If `-o` is omitted, output is written beside the input file with the `.docx`
extension.

## Math Syntax

Inline math:

```md
$E = mc^2$
```

Block math:

```md
$$
\int_0^1 x^2 dx = \frac{1}{3}
$$
```

## CLI Portable Notes

The CLI still requires Node.js unless packaged separately. The simplest CLI
distribution is:

1. Run `npm ci --omit=dev` after building.
2. Copy `dist/`, `md2docx.cmd`, `package.json`, `package-lock.json`, and `node_modules/`.
3. Run with a portable Node.js runtime: `.\md2docx.cmd input.md`.

For a single `.exe`, use a Node packager after validating the runtime behavior
with the target Windows version.
