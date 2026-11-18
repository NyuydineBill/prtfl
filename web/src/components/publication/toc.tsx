"use client";

import { useEffect, useMemo, useState } from "react";
import type { TocEntry } from "@/lib/publication/remark-publication";

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const onScroll = () => {
      const line = window.innerHeight * 0.3;
      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return active;
}

export function ContentsBar({ entries }: { entries: TocEntry[] }) {
  const chapters = useMemo(() => entries.filter((entry) => entry.depth === 2), [entries]);
  const ids = useMemo(() => chapters.map((c) => c.id), [chapters]);
  const active = useActiveHeading(ids);
  const current = chapters.find((c) => c.id === active);
  const [open, setOpen] = useState(false);

  return (
    <details
      className="pub-toc-mobile"
      open={open}
      onToggle={(event) => setOpen((event.target as HTMLDetailsElement).open)}
    >
      <summary>
        <span>Contents</span>
        <span className="pub-toc-mobile-count">
          {current ? (
            <>
              {current.number ? <b>{current.number}</b> : null}
              {current.title}
            </>
          ) : (
            `${chapters.length} sections`
          )}
        </span>
      </summary>
      <ol>
        {chapters.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className={entry.id === active ? "is-active" : undefined}
              onClick={() => setOpen(false)}
            >
              <span className="pub-toc-num">{entry.number ?? "·"}</span>
              <span>{entry.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const article = document.querySelector<HTMLElement>("[data-publication]");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const value = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      setProgress(value);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pub-progress" aria-hidden>
      <span style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
