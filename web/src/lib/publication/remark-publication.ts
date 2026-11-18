import type { Blockquote, Code, Heading, Nodes, Paragraph, Root, RootContent, Text } from "mdast";
import type { VFile } from "vfile";

/**
 * Markdown conventions for publications (all of them still read fine as plain Markdown):
 *
 *   ## 3. Status codes        numbered H2 = chapter. The "3." is lifted into a chapter number.
 *   ## References             un-numbered H2 = back matter (references, appendices).
 *   ```figure                 a diagram from the figure registry, by id.
 *   http-lifecycle
 *   ```
 *   > [!NOTE] / [!TIP] / [!WARNING] / [!STANDARD]   callout boxes.
 *
 * Every chapter (H2 plus everything until the next H2) is wrapped in a <section>, which gives
 * the web layout its chapter styling and the PDF its page breaks.
 */

export type TocEntry = {
  id: string;
  title: string;
  /** "01", "02"... for numbered chapters, null for back matter. */
  number: string | null;
  depth: 2 | 3;
};

export type PublicationData = {
  toc: TocEntry[];
  figures: string[];
};

const CALLOUT_KINDS = ["note", "tip", "warning", "standard"] as const;
export type CalloutKind = (typeof CALLOUT_KINDS)[number];

function textOf(node: Nodes): string {
  if ("value" in node && typeof node.value === "string") return node.value;
  if ("children" in node) return (node.children as Nodes[]).map(textOf).join("");
  return "";
}

export function slugifyHeading(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[`'"’]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

function stripLeadingNumber(heading: Heading): string | null {
  const first = heading.children[0];
  if (!first || first.type !== "text") return null;
  const match = /^(\d{1,2})\.\s+/.exec(first.value);
  if (!match) return null;
  first.value = first.value.slice(match[0].length);
  return match[1].padStart(2, "0");
}

function toCallout(node: Blockquote): CalloutKind | null {
  const para = node.children[0];
  if (!para || para.type !== "paragraph") return null;
  const first = (para as Paragraph).children[0];
  if (!first || first.type !== "text") return null;
  const match = /^\[!(\w+)\]\s*/.exec((first as Text).value);
  if (!match) return null;
  const kind = match[1].toLowerCase() as CalloutKind;
  if (!CALLOUT_KINDS.includes(kind)) return null;
  (first as Text).value = (first as Text).value.slice(match[0].length);
  if (!(first as Text).value) para.children.shift();
  return kind;
}

function transformBlock(node: RootContent, data: PublicationData): RootContent {
  if (node.type === "code" && (node as Code).lang === "figure") {
    const id = (node as Code).value.trim();
    data.figures.push(id);
    return {
      type: "paragraph",
      children: [],
      data: { hName: "figure", hProperties: { dataFigure: id } },
    } satisfies Paragraph;
  }

  if (node.type === "blockquote") {
    const kind = toCallout(node);
    if (kind) {
      node.data = { hName: "aside", hProperties: { dataCallout: kind } };
    }
  }

  return node;
}

export function remarkPublication() {
  return (tree: Root, file: VFile) => {
    const data: PublicationData = { toc: [], figures: [] };
    const used = new Map<string, number>();
    const uniqueId = (text: string) => {
      const base = slugifyHeading(text);
      const count = used.get(base) ?? 0;
      used.set(base, count + 1);
      return count === 0 ? base : `${base}-${count + 1}`;
    };

    const intro: RootContent[] = [];
    const chapters: { heading: Heading; number: string | null; body: RootContent[] }[] = [];

    for (const raw of tree.children) {
      const node = transformBlock(raw, data);

      if (node.type === "heading" && node.depth === 2) {
        const number = stripLeadingNumber(node);
        const title = textOf(node).trim();
        const id = uniqueId(title);
        node.data = {
          hProperties: { id, ...(number ? { dataChapter: number } : {}) },
        };
        data.toc.push({ id, title, number, depth: 2 });
        chapters.push({ heading: node, number, body: [] });
        continue;
      }

      if (node.type === "heading" && node.depth === 3) {
        const title = textOf(node).trim();
        const id = uniqueId(title);
        node.data = { hProperties: { id } };
        data.toc.push({ id, title, number: null, depth: 3 });
      }

      (chapters.length ? chapters[chapters.length - 1].body : intro).push(node);
    }

    const introSection: RootContent[] = intro.length
      ? [
          {
            type: "blockquote",
            children: intro as Blockquote["children"],
            data: { hName: "section", hProperties: { className: ["pub-intro"] } },
          },
        ]
      : [];

    const chapterSections: RootContent[] = chapters.map(({ heading, number, body }) => ({
      type: "blockquote",
      children: [heading, ...body] as Blockquote["children"],
      data: {
        hName: "section",
        hProperties: {
          className: [number ? "pub-chapter" : "pub-backmatter"],
          dataChapterId: (heading.data?.hProperties as { id: string }).id,
        },
      },
    }));

    tree.children = [...introSection, ...chapterSections];
    file.data.publication = data;
  };
}

declare module "vfile" {
  interface DataMap {
    publication: PublicationData;
  }
}
