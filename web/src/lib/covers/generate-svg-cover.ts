/** Local editorial cover art. Abstract only: no titles, labels, or readable text. */

type Palette = { bg: string; a: string; b: string; c: string };

const CLUSTER_PALETTES: Record<string, Palette> = {
  "Software Architecture": { bg: "#0b1220", a: "#3d8bfd", b: "#16324f", c: "#7eb6ff" },
  "AI Systems": { bg: "#100e1a", a: "#8b7cf7", b: "#2a2148", c: "#c4b5fd" },
  "Full-Stack": { bg: "#0a1412", a: "#2dd4a8", b: "#14352d", c: "#99f6e0" },
  "Full-Stack Development": { bg: "#0a1412", a: "#2dd4a8", b: "#14352d", c: "#99f6e0" },
  "DevOps & Reliability": { bg: "#0a1218", a: "#38bdf8", b: "#163041", c: "#bae6fd" },
  Mentoring: { bg: "#16110c", a: "#f0a468", b: "#3b2a1a", c: "#ffd7a8" },
  "Mentoring & Career": { bg: "#16110c", a: "#f0a468", b: "#3b2a1a", c: "#ffd7a8" },
  "Product Building": { bg: "#140f16", a: "#f472b6", b: "#3a1f32", c: "#fbcfe8" },
  "Django & Python": { bg: "#0c1612", a: "#34d399", b: "#1a3d2e", c: "#a7f3d0" },
  "Next.js & Frontend": { bg: "#0e0e12", a: "#a1a1aa", b: "#27272a", c: "#e4e4e7" },
  Databases: { bg: "#0c121a", a: "#60a5fa", b: "#1e2f45", c: "#bfdbfe" },
};

const FALLBACK: Palette = { bg: "#0d1218", a: "#5b9fd4", b: "#1e2f3d", c: "#c8dbe8" };

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(seed: number, salt: number, mod: number) {
  return (Math.imul(seed ^ salt, 2654435761) >>> 0) % mod;
}

function architectureMotif(p: Palette, seed: number) {
  const blocks = Array.from({ length: 9 }, (_, i) => {
    const x = 180 + pick(seed, i * 17, 8) * 150;
    const y = 140 + pick(seed, i * 29, 5) * 120;
    const w = 110 + pick(seed, i * 41, 160);
    const h = 70 + pick(seed, i * 53, 110);
    const op = (18 + pick(seed, i * 7, 28)) / 100;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${p.a}" opacity="${op}" stroke="${p.c}" stroke-opacity="0.25" stroke-width="1.5"/>`;
  }).join("\n");
  const links = Array.from({ length: 6 }, (_, i) => {
    const x1 = 220 + pick(seed, i * 13, 1200);
    const y1 = 180 + pick(seed, i * 19, 600);
    const x2 = 220 + pick(seed, i * 23, 1200);
    const y2 = 180 + pick(seed, i * 31, 600);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${p.c}" stroke-opacity="0.2" stroke-width="2"/>`;
  }).join("\n");
  return `${links}\n${blocks}`;
}

function aiMotif(p: Palette, seed: number) {
  const cx = 980 + pick(seed, 3, 200);
  const cy = 480 + pick(seed, 5, 120);
  const rings = [120, 220, 340, 480]
    .map(
      (r, i) =>
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.a}" stroke-opacity="${0.12 + i * 0.05}" stroke-width="2"/>`,
    )
    .join("\n");
  const nodes = Array.from({ length: 18 }, (_, i) => {
    const angle = ((pick(seed, i * 11, 360) + i * 20) % 360) * (Math.PI / 180);
    const radius = 140 + pick(seed, i * 17, 320);
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const r = 5 + pick(seed, i * 7, 10);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${p.c}" opacity="${0.35 + pick(seed, i, 40) / 100}"/>`;
  }).join("\n");
  return `${rings}\n${nodes}\n<circle cx="${cx}" cy="${cy}" r="46" fill="${p.a}" opacity="0.35"/>`;
}

function wavesMotif(p: Palette, seed: number) {
  const paths = Array.from({ length: 7 }, (_, i) => {
    const y = 180 + i * 100;
    const amp = 40 + pick(seed, i * 9, 70);
    const phase = pick(seed, i * 13, 400);
    const d = `M -40 ${y} C ${300 + phase} ${y - amp}, ${900 - phase} ${y + amp}, 1840 ${y + pick(seed, i, 40) - 20}`;
    return `<path d="${d}" fill="none" stroke="${i % 2 ? p.a : p.c}" stroke-opacity="${0.14 + i * 0.04}" stroke-width="${3 + (i % 3)}"/>`;
  }).join("\n");
  return paths;
}

function gridMotif(p: Palette, seed: number) {
  const cols = Array.from({ length: 14 }, (_, i) => {
    const x = 80 + i * 120;
    return `<line x1="${x}" y1="40" x2="${x}" y2="984" stroke="${p.a}" stroke-opacity="0.08" stroke-width="1"/>`;
  }).join("\n");
  const rows = Array.from({ length: 8 }, (_, i) => {
    const y = 60 + i * 120;
    return `<line x1="40" y1="${y}" x2="1752" y2="${y}" stroke="${p.a}" stroke-opacity="0.08" stroke-width="1"/>`;
  }).join("\n");
  const hot = Array.from({ length: 5 }, (_, i) => {
    const x = 160 + pick(seed, i * 21, 1400);
    const y = 120 + pick(seed, i * 27, 700);
    return `<rect x="${x}" y="${y}" width="${180 + pick(seed, i, 220)}" height="${100 + pick(seed, i * 3, 140)}" rx="18" fill="${p.a}" opacity="${0.1 + pick(seed, i, 18) / 100}" />`;
  }).join("\n");
  return `${cols}\n${rows}\n${hot}`;
}

function isometricMotif(p: Palette, seed: number) {
  const tiles = Array.from({ length: 12 }, (_, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 520 + col * 180 + row * 40;
    const y = 220 + row * 140 - col * 20;
    const h = 50 + pick(seed, i * 7, 90);
    return `
      <g opacity="${0.45 + pick(seed, i, 30) / 100}">
        <polygon points="${x},${y} ${x + 90},${y + 50} ${x},${y + 100} ${x - 90},${y + 50}" fill="${p.b}" stroke="${p.c}" stroke-opacity="0.35"/>
        <polygon points="${x - 90},${y + 50} ${x},${y + 100} ${x},${y + 100 + h} ${x - 90},${y + 50 + h}" fill="${p.a}" opacity="0.35"/>
        <polygon points="${x},${y + 100} ${x + 90},${y + 50} ${x + 90},${y + 50 + h} ${x},${y + 100 + h}" fill="${p.c}" opacity="0.2"/>
      </g>`;
  }).join("\n");
  return tiles;
}

export function generateSvgCover(opts: {
  title: string;
  cluster: string;
  seed?: string;
}) {
  const palette = CLUSTER_PALETTES[opts.cluster] ?? FALLBACK;
  const seed = hash(opts.seed ?? opts.title);
  const motifId = pick(seed, 99, 5);
  const motif =
    motifId === 0
      ? architectureMotif(palette, seed)
      : motifId === 1
        ? aiMotif(palette, seed)
        : motifId === 2
          ? wavesMotif(palette, seed)
          : motifId === 3
            ? gridMotif(palette, seed)
            : isometricMotif(palette, seed);

  const orbX = 1280 + pick(seed, 2, 280);
  const orbY = 220 + pick(seed, 4, 220);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1792" height="1024" viewBox="0 0 1792 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.bg}"/>
      <stop offset="55%" stop-color="${palette.b}"/>
      <stop offset="100%" stop-color="${palette.bg}"/>
    </linearGradient>
    <radialGradient id="orb" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${palette.a}" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="${palette.a}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${palette.a}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="wash" cx="20%" cy="80%" r="60%">
      <stop offset="0%" stop-color="${palette.c}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${palette.c}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="1792" height="1024" fill="url(#bg)"/>
  <rect width="1792" height="1024" fill="url(#wash)"/>
  <circle cx="${orbX}" cy="${orbY}" r="320" fill="url(#orb)" filter="url(#soft)"/>
  <circle cx="260" cy="780" r="220" fill="${palette.a}" opacity="0.08" filter="url(#soft)"/>
  ${motif}
  <rect x="0" y="0" width="1792" height="1024" fill="none" stroke="${palette.c}" stroke-opacity="0.08" stroke-width="2"/>
</svg>`;
}
