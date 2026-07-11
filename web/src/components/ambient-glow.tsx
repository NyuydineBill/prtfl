"use client";

import { motion } from "framer-motion";

export function AmbientGlow({ className }: { className?: string }) {
  return (
    <motion.div
      aria-hidden="true"
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
    />
  );
}
