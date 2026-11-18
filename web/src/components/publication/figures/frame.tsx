import type { ReactNode } from "react";

export function FigureFrame({
  id,
  number,
  title,
  caption,
  wide = false,
  children,
}: {
  id: string;
  number?: number;
  title: string;
  caption?: ReactNode;
  /** Wide figures break out of the text column on large screens. */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <figure className={`pub-figure${wide ? " pub-figure-wide" : ""}`} id={`figure-${id}`}>
      <div className="pub-figure-head">
        {number ? <span className="pub-figure-num">Figure {number}</span> : null}
        <span className="pub-figure-title">{title}</span>
      </div>
      <div className="pub-figure-body">{children}</div>
      {caption ? <figcaption className="pub-figure-caption">{caption}</figcaption> : null}
    </figure>
  );
}

/** Small labelled pill used across figures. */
export function Tag({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "accent" | "gold" | "positive" | "danger" | "violet" | "warn";
  children: ReactNode;
}) {
  return <span className={`pub-tag pub-tone-${tone}`}>{children}</span>;
}
