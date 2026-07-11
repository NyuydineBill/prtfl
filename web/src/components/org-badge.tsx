import Image from "next/image";

function initialsOf(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function OrgBadge({
  name,
  logoSrc,
  size = 44,
}: {
  name: string;
  logoSrc?: string;
  size?: number;
}) {
  if (logoSrc) {
    return (
      <span
        className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-high"
        style={{ width: size, height: size }}
      >
        <Image src={logoSrc} alt={name} width={size} height={size} className="object-contain p-1.5" />
      </span>
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg border border-border bg-surface-high font-mono text-xs font-semibold text-muted"
      style={{ width: size, height: size }}
    >
      {initialsOf(name)}
    </span>
  );
}
