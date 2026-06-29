const translations = {
  "zh-CN": {
    appTitle: "Markdown to DOCX",
    languageLabel: "语言",
    tabsAria: "转换模式",
    tabFile: "MD 文件",
    tabPaste: "粘贴内容",
    fileInputLabel: "Markdown 文件",
    fileInputPlaceholder: "选择 .md 文件",
    browse: "浏览",
    outputLabel: "DOCX 输出",
    outputPlaceholder: "输出路径",
    saveAs: "另存为",
    titleLabel: "标题",
    titlePlaceholder: "可选文档标题",
    authorLabel: "作者",
    authorPlaceholder: "可选作者",
    convert: "转换",
    openFolder: "打开目录",
    pasteInputLabel: "Markdown 内容",
    pasteInputPlaceholder: "# 标题\n\n在这里粘贴 Markdown...",
    statusTitle: "状态",
    ready: "就绪",
    working: "转换中",
    complete: "完成",
    failed: "失败",
    missingFile: "缺少文件",
    emptyContent: "内容为空",
    chooseMode: "选择一种转换模式。",
    fileMode: "MD 文件转换模式。",
    pasteMode: "粘贴内容转换模式。",
    selected: "已选择：\n{path}",
    missingFileMessage: "请先选择一个 Markdown 文件。",
    emptyContentMessage: "请先粘贴 Markdown 内容。",
    convertingFile: "正在从文件生成 DOCX。",
    convertingPaste: "正在从粘贴内容生成 DOCX。",
    created: "已创建：\n{path}",
    rawMessage: "{message}",
    openMarkdownDialogTitle: "选择 Markdown 文件",
    saveDocxDialogTitle: "保存 DOCX 文件",
    markdownFilter: "Markdown",
    textFilter: "文本",
    allFilesFilter: "所有文件",
    docxFilter: "Word 文档",
    featureFile: "文件",
    featurePaste: "粘贴",
    featureMath: "公式",
    featureTables: "表格",
  },
  "en-US": {
    appTitle: "Markdown to DOCX",
    languageLabel: "Language",
    tabsAria: "Convert mode",
    tabFile: "MD File",
    tabPaste: "Paste Content",
    fileInputLabel: "Markdown file",
    fileInputPlaceholder: "Choose a .md file",
    browse: "Browse",
    outputLabel: "DOCX output",
    outputPlaceholder: "Output path",
    saveAs: "Save As",
    titleLabel: "Title",
    titlePlaceholder: "Optional document title",
    authorLabel: "Author",
    authorPlaceholder: "Optional author",
    convert: "Convert",
    openFolder: "Open Folder",
    pasteInputLabel: "Markdown content",
    pasteInputPlaceholder: "# Title\n\nPaste Markdown here...",
    statusTitle: "Status",
    ready: "Ready",
    working: "Converting",
    complete: "Complete",
    failed: "Failed",
    missingFile: "Missing File",
    emptyContent: "Empty Content",
    chooseMode: "Choose a conversion mode.",
    fileMode: "MD file conversion mode.",
    pasteMode: "Paste content conversion mode.",
    selected: "Selected:\n{path}",
    missingFileMessage: "Please choose a Markdown file first.",
    emptyContentMessage: "Please paste Markdown content first.",
    convertingFile: "Building DOCX from file.",
    convertingPaste: "Building DOCX from pasted content.",
    created: "Created:\n{path}",
    rawMessage: "{message}",
    openMarkdownDialogTitle: "Select Markdown file",
    saveDocxDialogTitle: "Save DOCX file",
    markdownFilter: "Markdown",
    textFilter: "Text",
    allFilesFilter: "All Files",
    docxFilter: "Word Document",
    featureFile: "File",
    featurePaste: "Paste",
    featureMath: "Math",
    featureTables: "Tables",
  },
};

const tabButtons = document.querySelectorAll(".tab-button");
const tabPages = document.querySelectorAll(".tab-page");
const statusBadge = document.querySelector("#statusBadge");
const statusLog = document.querySelector("#statusLog");
const showOutputButtons = document.querySelectorAll(".show-output");
const languageSelect = document.querySelector("#languageSelect");

const fileInputPath = document.querySelector("#fileInputPath");
const fileOutputPath = document.querySelector("#fileOutputPath");
const fileTitle = document.querySelector("#fileTitle");
const fileAuthor = document.querySelector("#fileAuthor");
const chooseFileInput = document.querySelector("#chooseFileInput");
const chooseFileOutput = document.querySelector("#chooseFileOutput");
const convertFile = document.querySelector("#convertFile");

const markdownText = document.querySelector("#markdownText");
const pasteOutputPath = document.querySelector("#pasteOutputPath");
const pasteTitle = document.querySelector("#pasteTitle");
const pasteAuthor = document.querySelector("#pasteAuthor");
const choosePasteOutput = document.querySelector("#choosePasteOutput");
const convertPaste = document.querySelector("#convertPaste");

let activeTab = "file";
let lastOutput = "";
let currentLanguage = detectLanguage();
let lastStatus = { kind: "idle", labelKey: "ready", messageKey: "chooseMode", params: {} };

function detectLanguage() {
  const saved = localStorage.getItem("md2docx.language");
  if (saved && translations[saved]) {
    return saved;
  }

  const browserLanguage = navigator.language || "";
  return browserLanguage.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US";
}

function t(key, params = {}) {
  const template = translations[currentLanguage][key] ?? translations["en-US"][key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_match, name) => String(params[name] ?? ""));
}

function applyI18n() {
  document.documentElement.lang = currentLanguage;
  languageSelect.value = currentLanguage;

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = t(element.dataset.i18n);
  }

  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  }

  for (const element of document.querySelectorAll("[data-i18n-attr]")) {
    const mappings = element.dataset.i18nAttr.split(",");
    for (const mapping of mappings) {
      const [attribute, key] = mapping.split(":").map((part) => part.trim());
      if (attribute && key) {
        element.setAttribute(attribute, t(key));
      }
    }
  }

  renderStatus();
}

function setStatus(kind, labelKey, messageKey, params = {}) {
  lastStatus = { kind, labelKey, messageKey, params };
  renderStatus();
}

function renderStatus() {
  statusBadge.className = `status-badge ${lastStatus.kind}`;
  statusBadge.textContent = t(lastStatus.labelKey, lastStatus.params);
  statusLog.textContent = t(lastStatus.messageKey, lastStatus.params);
}

function setBusy(isBusy) {
  const controls = [
    ...tabButtons,
    languageSelect,
    chooseFileInput,
    chooseFileOutput,
    convertFile,
    choosePasteOutput,
    convertPaste,
  ];

  for (const control of controls) {
    control.disabled = isBusy;
  }
}

function setShowOutputEnabled(enabled) {
  for (const button of showOutputButtons) {
    button.disabled = !enabled;
  }
}

function switchTab(tab) {
  activeTab = tab;

  for (const button of tabButtons) {
    button.classList.toggle("active", button.dataset.tab === tab);
  }

  for (const page of tabPages) {
    page.classList.toggle("active", page.dataset.page === tab);
  }

  setStatus("idle", "ready", tab === "file" ? "fileMode" : "pasteMode");
}

function openDialogLabels() {
  return {
    title: t("openMarkdownDialogTitle"),
    markdownFilter: t("markdownFilter"),
    textFilter: t("textFilter"),
    allFilesFilter: t("allFilesFilter"),
  };
}

function saveDialogLabels() {
  return {
    title: t("saveDocxDialogTitle"),
    docxFilter: t("docxFilter"),
  };
}

async function ensurePasteOutputPath() {
  if (pasteOutputPath.value) {
    return pasteOutputPath.value;
  }

  const selected = await window.md2docx.chooseOutput("pasted-markdown.docx", saveDialogLabels());
  if (selected) {
    pasteOutputPath.value = selected;
  }

  return selected;
}

languageSelect.addEventListener("change", () => {
  currentLanguage = languageSelect.value;
  localStorage.setItem("md2docx.language", currentLanguage);
  applyI18n();
});

for (const button of tabButtons) {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
}

chooseFileInput.addEventListener("click", async () => {
  const selection = await window.md2docx.chooseMarkdown(openDialogLabels());
  if (!selection) {
    return;
  }

  fileInputPath.value = selection.input;
  fileOutputPath.value = selection.output;
  lastOutput = "";
  setShowOutputEnabled(false);
  setStatus("idle", "ready", "selected", { path: selection.input });
});

chooseFileOutput.addEventListener("click", async () => {
  const selected = await window.md2docx.chooseOutput(fileOutputPath.value || undefined, saveDialogLabels());
  if (selected) {
    fileOutputPath.value = selected;
  }
});

choosePasteOutput.addEventListener("click", async () => {
  const selected = await window.md2docx.chooseOutput(pasteOutputPath.value || "pasted-markdown.docx", saveDialogLabels());
  if (selected) {
    pasteOutputPath.value = selected;
  }
});

convertFile.addEventListener("click", async () => {
  if (!fileInputPath.value) {
    setStatus("error", "missingFile", "missingFileMessage");
    return;
  }

  setBusy(true);
  setStatus("working", "working", "convertingFile");

  try {
    const created = await window.md2docx.convertFile({
      input: fileInputPath.value,
      output: fileOutputPath.value || undefined,
      title: fileTitle.value || undefined,
      author: fileAuthor.value || undefined,
    });

    lastOutput = created;
    fileOutputPath.value = created;
    setShowOutputEnabled(true);
    setStatus("success", "complete", "created", { path: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus("error", "failed", "rawMessage", { message });
  } finally {
    setBusy(false);
  }
});

convertPaste.addEventListener("click", async () => {
  if (!markdownText.value.trim()) {
    setStatus("error", "emptyContent", "emptyContentMessage");
    return;
  }

  const output = await ensurePasteOutputPath();
  if (!output) {
    return;
  }

  setBusy(true);
  setStatus("working", "working", "convertingPaste");

  try {
    const created = await window.md2docx.convertText({
      markdown: markdownText.value,
      output,
      title: pasteTitle.value || undefined,
      author: pasteAuthor.value || undefined,
    });

    lastOutput = created;
    pasteOutputPath.value = created;
    setShowOutputEnabled(true);
    setStatus("success", "complete", "created", { path: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus("error", "failed", "rawMessage", { message });
  } finally {
    setBusy(false);
  }
});

for (const button of showOutputButtons) {
  button.addEventListener("click", async () => {
    if (lastOutput) {
      await window.md2docx.showItem(lastOutput);
    }
  });
}

applyI18n();
switchTab(activeTab);
