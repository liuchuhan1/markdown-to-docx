const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("md2docx", {
  chooseMarkdown: (labels) => ipcRenderer.invoke("dialog:openMarkdown", labels),
  chooseOutput: (defaultPath, labels) => ipcRenderer.invoke("dialog:saveDocx", { defaultPath, ...labels }),
  convertFile: (payload) => ipcRenderer.invoke("convert:markdownToDocx", payload),
  convertText: (payload) => ipcRenderer.invoke("convert:markdownTextToDocx", payload),
  showItem: (filePath) => ipcRenderer.invoke("shell:showItem", filePath),
});
