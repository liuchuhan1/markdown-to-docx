import { convertMarkdownTextToDocx } from "../dist/converter.js";

await convertMarkdownTextToDocx({
  markdown: String.raw`# Paste Test

Inline math $E=mc^2$.

$$
\int_0^1 x^2 dx = \frac{1}{3}
$$

| A | B |
| - | - |
| 1 | 2 |`,
  output: "examples/paste-tab-test.docx",
  title: "Paste Test",
});

console.log("paste ok");
