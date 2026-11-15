/**
 * Curated Unsplash covers (no text overlays). Free to use under the Unsplash license.
 * Assigned deterministically from a seed so refreshes stay stable per post.
 */

const ARCHITECTURE = [
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1792&h=1024&q=80",
];

const AI = [
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1655720828018-edd2daec9349?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1535378620166-273708d44e4c?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1792&h=1024&q=80",
];

const FULLSTACK = [
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1792&h=1024&q=80",
];

const DEVOPS = [
  "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1792&h=1024&q=80",
];

const MENTORING = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1792&h=1024&q=80",
];

const PRODUCT = [
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1792&h=1024&q=80",
];

const DATABASES = [
  "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1792&h=1024&q=80",
];

const FRONTEND = [
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1792&h=1024&q=80",
  "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1792&h=1024&q=80",
];

const CLUSTER_POOLS: Record<string, string[]> = {
  "Software Architecture": ARCHITECTURE,
  "AI Systems": AI,
  "Full-Stack": FULLSTACK,
  "Full-Stack Development": FULLSTACK,
  "DevOps & Reliability": DEVOPS,
  Mentoring: MENTORING,
  "Mentoring & Career": MENTORING,
  "Product Building": PRODUCT,
  "Django & Python": FULLSTACK,
  "Next.js & Frontend": FRONTEND,
  Databases: DATABASES,
};

const FALLBACK_POOL = [...ARCHITECTURE, ...FULLSTACK, ...AI];

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function inferClusterFromTags(tags: string[] | null | undefined): string {
  const t = (tags ?? []).map((x) => x.toLowerCase());
  if (t.some((x) => ["ai", "llms", "rag", "prompt-engineering", "chatbots"].includes(x))) {
    return "AI Systems";
  }
  if (t.some((x) => ["architecture", "system-design", "apis", "monolith", "events"].includes(x))) {
    return "Software Architecture";
  }
  if (t.some((x) => ["devops", "ci-cd", "docker", "reliability", "logging", "cloud", "azure", "aws"].includes(x))) {
    return "DevOps & Reliability";
  }
  if (t.some((x) => ["mentoring", "career", "community", "education", "debugging", "code-review"].includes(x))) {
    return "Mentoring & Career";
  }
  if (t.some((x) => ["saas", "product", "startup", "branding", "nonprofit", "ecommerce", "social"].includes(x))) {
    return "Product Building";
  }
  if (t.some((x) => ["django", "python", "packaging", "open-source"].includes(x))) {
    return "Django & Python";
  }
  if (t.some((x) => ["nextjs", "frontend", "react", "seo", "accessibility", "ux", "images"].includes(x))) {
    return "Next.js & Frontend";
  }
  if (t.some((x) => ["postgresql", "databases", "migrations", "security"].includes(x))) {
    return "Databases";
  }
  if (t.some((x) => ["full-stack", "auth", "payments", "mobile", "admin", "delivery"].includes(x))) {
    return "Full-Stack Development";
  }
  return "Software Architecture";
}

export function pickCoverPhotoUrl(opts: {
  seed: string;
  cluster?: string;
  tags?: string[] | null;
}) {
  const cluster = opts.cluster ?? inferClusterFromTags(opts.tags);
  const pool = CLUSTER_POOLS[cluster] ?? FALLBACK_POOL;
  return pool[hash(opts.seed) % pool.length]!;
}
