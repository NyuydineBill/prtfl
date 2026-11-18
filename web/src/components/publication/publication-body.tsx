import type { ReactElement, ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Info, Lightbulb, BookMarked, TriangleAlert } from "lucide-react";
import { remarkPublication } from "@/lib/publication/remark-publication";
import { CodeBlock } from "./code-block";
import { figureRegistry, unnumberedFigures } from "./figures";

const CALLOUTS = {
  note: { label: "Note", Icon: Info },
  tip: { label: "Tip", Icon: Lightbulb },
  warning: { label: "Watch out", Icon: TriangleAlert },
  standard: { label: "Standard", Icon: BookMarked },
} as const;

type AnyProps = Record<string, unknown> & { children?: ReactNode };

function figureNumbers(figures: string[]) {
  const numbers = new Map<string, number>();
  let n = 0;
  for (const id of figures) {
    if (unnumberedFigures.has(id) || numbers.has(id)) continue;
    numbers.set(id, ++n);
  }
  return numbers;
}

export function PublicationBody({
  markdown,
  figures,
}: {
  markdown: string;
  /** Figure ids in document order, from analyzePublication(). */
  figures: string[];
}) {
  const numbers = figureNumbers(figures);

  const components: Components = {
    section(props) {
      const { children, className, ...rest } = props as AnyProps & { className?: string };
      return (
        <section className={className} data-chapter-id={rest["data-chapter-id"] as string | undefined}>
          {children}
        </section>
      );
    },

    h2(props) {
      const { children, id, ...rest } = props as AnyProps & { id?: string };
      const chapter = rest["data-chapter"] as string | undefined;
      return (
        <header className={chapter ? "pub-chapter-head" : "pub-backmatter-head"}>
          {chapter ? <span className="pub-chapter-num" aria-hidden>{chapter}</span> : null}
          <h2 id={id} className="pub-h2" data-chapter={chapter}>
            {children}
          </h2>
        </header>
      );
    },

    h3(props) {
      const { children, id } = props as AnyProps & { id?: string };
      return (
        <h3 id={id} className="pub-h3">
          <a href={`#${id}`} className="pub-anchor" aria-hidden tabIndex={-1}>#</a>
          {children}
        </h3>
      );
    },

    figure(props) {
      const id = (props as AnyProps)["data-figure"] as string;
      const Figure = figureRegistry[id];
      if (!Figure) {
        return process.env.NODE_ENV === "production" ? null : (
          <div className="pub-callout" data-callout="warning">Unknown figure “{id}”</div>
        );
      }
      return <Figure number={numbers.get(id)} />;
    },

    aside(props) {
      const { children } = props as AnyProps;
      const kind = ((props as AnyProps)["data-callout"] as keyof typeof CALLOUTS) ?? "note";
      const { label, Icon } = CALLOUTS[kind] ?? CALLOUTS.note;
      return (
        <aside className="pub-callout" data-callout={kind}>
          <p className="pub-callout-label">
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </p>
          <div className="pub-callout-body">{children}</div>
        </aside>
      );
    },

    pre(props) {
      const child = (props as AnyProps).children as ReactElement<{ className?: string; children?: ReactNode }>;
      const className = child?.props?.className ?? "";
      const lang = /language-([\w-]+)/.exec(className)?.[1];
      const code = String(child?.props?.children ?? "");
      return <CodeBlock code={code} lang={lang} />;
    },

    table(props) {
      return (
        <div className="pub-table-wrap">
          <table>{(props as AnyProps).children}</table>
        </div>
      );
    },

    a(props) {
      const { href = "", children } = props as AnyProps & { href?: string };
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div className="pub-body">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkPublication]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
