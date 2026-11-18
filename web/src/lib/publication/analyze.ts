import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { VFile } from "vfile";
import { remarkPublication, type PublicationData } from "./remark-publication";

export type PublicationAnalysis = PublicationData & {
  words: number;
  readingMinutes: number;
};

/** Prose reads at ~230 wpm; code and tables are slower, so they count a little extra. */
const WORDS_PER_MINUTE = 230;
const FIGURE_MINUTES = 0.5;

export function analyzePublication(markdown: string): PublicationAnalysis {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkPublication);
  const file = new VFile(markdown);
  processor.runSync(processor.parse(file), file);
  const data = file.data.publication ?? { toc: [], figures: [] };

  const prose = markdown.replace(/```[\s\S]*?```/g, " ");
  const codeLines = (markdown.match(/```[\s\S]*?```/g) ?? []).join("\n").split("\n").length;
  const words = prose.split(/\s+/).filter(Boolean).length;
  const minutes = words / WORDS_PER_MINUTE + codeLines / 40 + data.figures.length * FIGURE_MINUTES;

  return { ...data, words, readingMinutes: Math.max(1, Math.round(minutes)) };
}
