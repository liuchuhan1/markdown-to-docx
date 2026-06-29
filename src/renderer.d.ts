export {};

declare global {
  interface Window {
    md2docx: {
      chooseMarkdown: (labels?: {
        title?: string;
        markdownFilter?: string;
        textFilter?: string;
        allFilesFilter?: string;
      }) => Promise<{ input: string; output: string } | null>;
      chooseOutput: (
        defaultPath?: string,
        labels?: {
          title?: string;
          docxFilter?: string;
        },
      ) => Promise<string | null>;
      convertFile: (payload: {
        input: string;
        output?: string;
        title?: string;
        author?: string;
      }) => Promise<string>;
      convertText: (payload: {
        markdown: string;
        output: string;
        title?: string;
        author?: string;
      }) => Promise<string>;
      showItem: (filePath: string) => Promise<void>;
    };
  }
}
