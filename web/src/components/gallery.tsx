"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";

export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [openIndex, photos.length]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-background/0 opacity-0 transition-all duration-200 group-hover:bg-background/40 group-hover:opacity-100">
              <Expand className="h-5 w-5 text-foreground" />
            </span>
          </button>
        ))}
      </div>

      {openIndex !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm"
            onClick={() => setOpenIndex(null)}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(null)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-md border border-border bg-surface p-2 text-foreground hover:border-accent hover:text-accent"
            >
              <X className="h-5 w-5" />
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-surface p-2 text-foreground hover:border-accent hover:text-accent sm:left-4"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-surface p-2 text-foreground hover:border-accent hover:text-accent sm:right-4"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div
              className="relative h-full max-h-[80vh] w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photos[openIndex]}
                alt={alt}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {photos.length > 1 && (
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs text-muted">
                {openIndex + 1} / {photos.length}
              </span>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
