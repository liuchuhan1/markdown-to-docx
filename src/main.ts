import electron from "electron";
import type { BrowserWindow as BrowserWindowType } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { convertMarkdownFileToDocx, convertMarkdownTextToDocx, defaultOutputPath } from "./converter.js";

const { app, BrowserWindow, dialog, ipcMain, shell } = electron;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

let mainWindow: BrowserWindowType | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 980,
    height: 680,
    minWidth: 780,
    minHeight: 560,
    title: "Markdown to DOCX",
    backgroundColor: "#f7f8fb",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, "..", "app", "index.html"));

  if (isDev && process.env.MD2DOCX_DEVTOOLS === "1") {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle(
  "dialog:openMarkdown",
  async (
    _event,
    labels?: { title?: string; markdownFilter?: string; textFilter?: string; allFilesFilter?: string },
  ) => {
    const options = {
      title: labels?.title ?? "Select Markdown file",
      properties: ["openFile"],
      filters: [
        { name: labels?.markdownFilter ?? "Markdown", extensions: ["md", "markdown", "mdown"] },
        { name: labels?.textFilter ?? "Text", extensions: ["txt"] },
        { name: labels?.allFilesFilter ?? "All Files", extensions: ["*"] },
      ],
    } satisfies Electron.OpenDialogOptions;
    const result = mainWindow
      ? await dialog.showOpenDialog(mainWindow, options)
      : await dialog.showOpenDialog(options);

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    const input = result.filePaths[0];
    return {
      input,
      output: defaultOutputPath(input),
    };
  },
);

ipcMain.handle(
  "dialog:saveDocx",
  async (_event, payload?: string | { defaultPath?: string; title?: string; docxFilter?: string }) => {
    const defaultPath = typeof payload === "string" ? payload : payload?.defaultPath;
    const options = {
      title: typeof payload === "string" ? "Save DOCX file" : payload?.title ?? "Save DOCX file",
      defaultPath,
      filters: [
        {
          name: typeof payload === "string" ? "Word Document" : payload?.docxFilter ?? "Word Document",
          extensions: ["docx"],
        },
      ],
    } satisfies Electron.SaveDialogOptions;
    const result = mainWindow
      ? await dialog.showSaveDialog(mainWindow, options)
      : await dialog.showSaveDialog(options);

    if (result.canceled || !result.filePath) {
      return null;
    }

    return result.filePath;
  },
);

ipcMain.handle(
  "convert:markdownToDocx",
  async (_event, payload: { input: string; output?: string; title?: string; author?: string }) => {
    if (!payload.input) {
      throw new Error("Please choose a Markdown file.");
    }

    return convertMarkdownFileToDocx({
      input: payload.input,
      output: payload.output,
      title: payload.title || undefined,
      author: payload.author || undefined,
    });
  },
);

ipcMain.handle(
  "convert:markdownTextToDocx",
  async (_event, payload: { markdown: string; output: string; title?: string; author?: string }) => {
    if (!payload.markdown?.trim()) {
      throw new Error("Please paste Markdown content first.");
    }

    if (!payload.output) {
      throw new Error("Please choose a DOCX output path.");
    }

    return convertMarkdownTextToDocx({
      markdown: payload.markdown,
      output: payload.output,
      title: payload.title || undefined,
      author: payload.author || undefined,
    });
  },
);

ipcMain.handle("shell:showItem", async (_event, filePath: string) => {
  if (!filePath) {
    return;
  }

  shell.showItemInFolder(filePath);
});
