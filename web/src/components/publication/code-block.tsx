import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { CopyButton } from "./copy-button";

const LANG_ALIASES: Record<string, string> = {
  bash: "shellscript",
  sh: "shellscript",
  shell: "shellscript",
  console: "shellscript",
  py: "python",
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  md: "markdown",
  yml: "yaml",
};

const LANG_LABELS: Record<string, string> = {
  http: "HTTP",
  json: "JSON",
  shellscript: "Shell",
  python: "Python",
  typescript: "TypeScript",
  tsx: "TSX",
  javascript: "JavaScript",
  sql: "SQL",
  markdown: "Markdown",
  yaml: "YAML",
  text: "Text",
};

const LOADED = ["http", "json", "shellscript", "python", "typescript", "tsx", "javascript", "sql", "markdown", "yaml"];

let highlighter: Promise<HighlighterCore> | null = null;

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [
      import("@shikijs/themes/github-dark-default"),
      import("@shikijs/themes/github-light-default"),
    ],
    langs: [
      import("@shikijs/langs/http"),
      import("@shikijs/langs/json"),
      import("@shikijs/langs/shellscript"),
      import("@shikijs/langs/python"),
      import("@shikijs/langs/typescript"),
      import("@shikijs/langs/tsx"),
      import("@shikijs/langs/javascript"),
      import("@shikijs/langs/sql"),
      import("@shikijs/langs/markdown"),
      import("@shikijs/langs/yaml"),
    ],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  });
  return highlighter;
}

export async function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const requested = (lang ?? "text").toLowerCase();
  const resolved = LANG_ALIASES[requested] ?? requested;
  const supported = LOADED.includes(resolved);
  const label = LANG_LABELS[supported ? resolved : "text"] ?? requested;
  const source = code.replace(/\n$/, "");

  let html: string | null = null;
  if (supported) {
    const hl = await getHighlighter();
    html = hl.codeToHtml(source, {
      lang: resolved,
      themes: { dark: "github-dark-default", light: "github-light-default" },
      defaultColor: false,
    });
  }

  return (
    <div className="pub-code" data-lang={resolved}>
      <div className="pub-code-bar">
        <span className="pub-code-lang">{label}</span>
        <CopyButton text={source} />
      </div>
      {html ? (
        <div className="pub-code-body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="pub-code-body">
          <pre className="shiki">
            <code>{source}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
