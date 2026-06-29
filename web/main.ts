import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkDocx from "remark-docx";
import { latexPlugin } from "remark-docx/plugins/latex";

type Language = "zh-CN" | "en-US";

const text = {
  "zh-CN": {
    ready: "就绪",
    converting: "正在生成 DOCX...",
    done: "已生成并开始下载。",
    noFile: "请先选择 Markdown 文件。",
    noContent: "请先粘贴 Markdown 内容。",
    failed: "转换失败：",
    fileTab: "MD 文件",
    pasteTab: "粘贴内容",
    fileNameFallback: "document.docx",
  },
  "en-US": {
    ready: "Ready",
    converting: "Building DOCX...",
    done: "DOCX generated and download started.",
    noFile: "Choose a Markdown file first.",
    noContent: "Paste Markdown content first.",
    failed: "Conversion failed: ",
    fileTab: "MD File",
    pasteTab: "Paste Content",
    fileNameFallback: "document.docx",
  },
} as const;

const tabs = document.querySelectorAll<HTMLButtonElement>(".tab");
const pages = document.querySelectorAll<HTMLElement>(".page");
const languageSelect = document.querySelector<HTMLSelectElement>("#languageSelect")!;
const fileInput = document.querySelector<HTMLInputElement>("#fileInput")!;
const markdownText = document.querySelector<HTMLTextAreaElement>("#markdownText")!;
const fileName = document.querySelector<HTMLInputElement>("#fileName")!;
const title = document.querySelector<HTMLInputElement>("#title")!;
const author = document.querySelector<HTMLInputElement>("#author")!;
const convert = document.querySelector<HTMLButtonElement>("#convert")!;
const status = document.querySelector<HTMLElement>("#status")!;

let activeTab = "file";
let language: Language = (navigator.language || "").toLowerCase().startsWith("zh") ? "zh-CN" : "en-US";

function setStatus(message: string, kind = "idle"): void {
  status.textContent = message;
  status.dataset.kind = kind;
}

function normalizeDocxName(name: string): string {
  const trimmed = name.trim() || text[language].fileNameFallback;
  return trimmed.toLowerCase().endsWith(".docx") ? trimmed : `${trimmed}.docx`;
}

async function markdownToDocx(markdown: string): Promise<ArrayBuffer> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkDocx, {
      title: title.value || fileName.value.replace(/\.docx$/i, ""),
      creator: author.value || undefined,
      plugins: [latexPlugin()],
    });

  const file = await processor.process(markdown);
  const result = await Promise.resolve(file.result);

  if (result instanceof ArrayBuffer) {
    return result;
  }

  if (ArrayBuffer.isView(result)) {
    return result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength);
  }

  throw new Error("DOCX processor did not return binary data.");
}

function downloadDocx(buffer: ArrayBuffer, name: string): void {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = normalizeDocxName(name);
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function switchTab(tab: string): void {
  activeTab = tab;
  for (const button of tabs) {
    button.classList.toggle("active", button.dataset.tab === tab);
  }
  for (const page of pages) {
    page.classList.toggle("active", page.dataset.page === tab);
  }
}

function applyLanguage(): void {
  document.documentElement.lang = language;
  tabs[0].textContent = text[language].fileTab;
  tabs[1].textContent = text[language].pasteTab;
  setStatus(text[language].ready);
}

for (const tab of tabs) {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab || "file"));
}

languageSelect.value = language;
languageSelect.addEventListener("change", () => {
  language = languageSelect.value as Language;
  applyLanguage();
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) {
    return;
  }
  fileName.value = file.name.replace(/\.(md|markdown|mdown|txt)$/i, ".docx");
});

convert.addEventListener("click", async () => {
  convert.disabled = true;
  setStatus(text[language].converting, "working");

  try {
    const markdown =
      activeTab === "file"
        ? await readSelectedFile()
        : markdownText.value;

    if (!markdown.trim()) {
      setStatus(activeTab === "file" ? text[language].noFile : text[language].noContent, "error");
      return;
    }

    const buffer = await markdownToDocx(markdown);
    downloadDocx(buffer, fileName.value);
    setStatus(text[language].done, "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`${text[language].failed}${message}`, "error");
  } finally {
    convert.disabled = false;
  }
});

async function readSelectedFile(): Promise<string> {
  const file = fileInput.files?.[0];
  return file ? file.text() : "";
}

applyLanguage();
