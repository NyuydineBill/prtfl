"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

// Splits "500+", "1,000+", "6+", "3" into a numeric part to animate and a
// suffix/format to preserve, so real résumé numbers can count up on mount.
export function AnimatedNumber({ value }: { value: string }) {
  const match = value.match(/^([\d,]+)(.*)$/);
  const numeric = match ? Number(match[1].replace(/,/g, "")) : null;
  const suffix = match ? match[2] : "";
  const hasCommas = match ? match[1].includes(",") : false;

  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1200, bounce: 0 });

  useEffect(() => {
    if (numeric !== null) {
      motionValue.set(numeric);
    }
  }, [numeric, motionValue]);

  useEffect(() => {
    if (numeric === null) return;
    return spring.on("change", (latest) => {
      if (!ref.current) return;
      const rounded = Math.round(latest);
      ref.current.textContent =
        (hasCommas ? rounded.toLocaleString("en-US") : String(rounded)) + suffix;
    });
  }, [spring, numeric, suffix, hasCommas]);

  if (numeric === null) {
    return <span ref={ref}>{value}</span>;
  }

  return <span ref={ref}>0{suffix}</span>;
}
