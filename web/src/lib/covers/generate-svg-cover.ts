/** Local editorial cover art. No external image API. */

const CLUSTER_PALETTES: Record<string, { bg: string; a: string; b: string; ink: string }> = {
  "Software Architecture": {
    bg: "#0f1419",
    a: "#3d8bfd",
    b: "#1a3a5c",
    ink: "#c8d6e5",
  },
  "AI Systems": {
    bg: "#121018",
    a: "#7c6af5",
    b: "#2a2450",
    ink: "#d4cfff",
  },
  "Full-Stack": {
    bg: "#0e1614",
    a: "#2dd4a8",
    b: "#1a3d34",
    ink: "#c5ebe0",
  },
  "Full-Stack Development": {
    bg: "#0e1614",
    a: "#2dd4a8",
    b: "#1a3d34",
    ink: "#c5ebe0",
  },
  "DevOps & Reliability": {
    bg: "#0f1218",
    a: "#5ec8e8",
    b: "#1a2a38",
    ink: "#c8e6f0",
  },
  Mentoring: {
    bg: "#16120e",
    a: "#e8a85c",
    b: "#3d2e1a",
    ink: "#f0e0c8",
  },
  "Mentoring & Career": {
    bg: "#16120e",
    a: "#e8a85c",
    b: "#3d2e1a",
    ink: "#f0e0c8",
  },
  "Product Building": {
    bg: "#141018",
    a: "#e07a9a",
    b: "#3a1f2e",
    ink: "#f0d4e0",
  },
  "Django & Python": {
    bg: "#0f1612",
    a: "#44b78b",
    b: "#1a3d2e",
    ink: "#cfeee0",
  },
  "Next.js & Frontend": {
    bg: "#101014",
    a: "#a0a0b8",
    b: "#2a2a38",
    ink: "#e0e0ec",
  },
  Databases: {
    bg: "#10141a",
    a: "#6b9fd4",
    b: "#1e2f45",
    ink: "#d0e0f0",
  },
};

const FALLBACK = {
  bg: "#101418",
  a: "#5b9fd4",
  b: "#1e2f3d",
  ink: "#d0dbe6",
};

function hash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function wrapTitle(title: string, maxChars = 28) {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export function generateSvgCover(opts: {
  title: string;
  cluster: string;
  seed?: string;
}) {
  const palette = CLUSTER_PALETTES[opts.cluster] ?? FALLBACK;
  const seed = hash(opts.seed ?? opts.title);
  const lines = wrapTitle(opts.title);
  const shapes = Array.from({ length: 6 }, (_, i) => {
    const x = 80 + ((seed >> (i * 3)) % 1400);
    const y = 60 + ((seed >> (i * 5)) % 700);
    const w = 120 + ((seed >> (i * 2)) % 280);
    const h = 80 + ((seed >> (i * 4)) % 180);
    const opacity = 0.08 + ((seed >> i) % 12) / 100;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${palette.a}" opacity="${opacity}" />`;
  }).join("\n");

  const titleNodes = lines
    .map(
      (line, i) =>
        `<text x="96" y="${520 + i * 56}" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="600" fill="${palette.ink}">${escapeXml(line)}</text>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1792" height="1024" viewBox="0 0 1792 1024">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.bg}"/>
      <stop offset="100%" stop-color="${palette.b}"/>
    </linearGradient>
    <radialGradient id="glow" cx="75%" cy="25%" r="55%">
      <stop offset="0%" stop-color="${palette.a}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${palette.a}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1792" height="1024" fill="url(#g)"/>
  <rect width="1792" height="1024" fill="url(#glow)"/>
  ${shapes}
  <circle cx="1480" cy="280" r="160" fill="none" stroke="${palette.a}" stroke-opacity="0.25" stroke-width="2"/>
  <circle cx="1480" cy="280" r="95" fill="none" stroke="${palette.a}" stroke-opacity="0.4" stroke-width="2"/>
  <line x1="96" y1="460" x2="420" y2="460" stroke="${palette.a}" stroke-width="3" stroke-opacity="0.7"/>
  <text x="96" y="430" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="22" letter-spacing="3" fill="${palette.a}">${escapeXml(opts.cluster.toUpperCase())}</text>
  ${titleNodes}
</svg>`;
}
