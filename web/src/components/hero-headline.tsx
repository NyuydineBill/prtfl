"use client";

import { motion } from "framer-motion";

export function HeroHeadline({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");

  return (
    <h1 className={className} aria-label={text}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%", opacity: 0, rotate: 4 }}
              animate={{ y: "0%", opacity: 1, rotate: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.15 + i * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </span>
    </h1>
  );
}
