import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/reveal";

export function Timeline({ children }: { children: React.ReactNode }) {
  return (
    <ol className="relative flex flex-col gap-10 border-l border-border pl-8">
      {children}
    </ol>
  );
}

export function TimelineItem({
  icon: Icon,
  children,
  delay = 0,
}: {
  icon?: LucideIcon;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <li className="relative">
      <span className="absolute -left-[calc(2rem+9px)] top-0 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-accent bg-background">
        {Icon && <Icon className="h-2.5 w-2.5 text-accent" strokeWidth={2.5} />}
      </span>
      <Reveal delay={delay}>{children}</Reveal>
    </li>
  );
}
