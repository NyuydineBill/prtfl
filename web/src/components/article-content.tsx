"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Expand, X } from "lucide-react";

function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Full-size image"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-[101] rounded-md border border-border bg-surface p-2 text-foreground hover:border-accent hover:text-accent"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="relative flex max-h-[92vh] w-full max-w-[min(1200px,100%)] items-center justify-center overflow-auto"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Native img so the original asset is never cropped by next/image fill. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || "Article image"}
          className="h-auto max-h-[92vh] w-auto max-w-full object-contain"
        />
      </div>
    </div>,
    document.body,
  );
}

function ClickableImage({
  src,
  alt,
  className = "",
  imageClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-lg border border-border text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        aria-label={alt ? `View full image: ${alt}` : "View full image"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={imageClassName} />
        <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-background/90 px-2.5 py-1.5 text-xs text-foreground opacity-90 shadow-sm">
          <Expand className="h-3.5 w-3.5" />
          View full
        </span>
      </button>
      {open && <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
}

export function ArticleCoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    <ClickableImage
      src={src}
      alt={alt}
      className="mt-8 max-w-2xl"
      imageClassName="h-auto w-full object-contain bg-surface"
    />
  );
}

export function ArticleContent({ content }: { content: string }) {
  return (
    <div className="prose-article mt-10 max-w-2xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Avoid invalid <p><button/></p> nesting that breaks click handlers.
          p: ({ node, children }) => {
            const hasImage = node?.children?.some(
              (child) => child.type === "element" && child.tagName === "img",
            );
            if (hasImage) return <div className="my-4">{children}</div>;
            return <p>{children}</p>;
          },
          img: ({ src, alt }) => {
            if (typeof src !== "string" || !src) return null;
            return (
              <ClickableImage
                src={src}
                alt={alt ?? ""}
                imageClassName="h-auto w-full object-contain"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
