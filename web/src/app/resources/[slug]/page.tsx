import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Download, FileText, ListChecks } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatKindLabel } from "@/lib/resources";
import { analyzePublication } from "@/lib/publication/analyze";
import { getPdfInfo, getPublishedResource, getPublishedSiblings } from "@/lib/publication/get-resource";
import { PublicationBody } from "@/components/publication/publication-body";
import { ContentsBar, ReadingProgress } from "@/components/publication/toc";
import { JsonLd } from "@/components/json-ld";
import { profile } from "@/lib/data/profile";
import { absoluteUrl, defaultDescription, pageMetadata } from "@/lib/site";
import "@/styles/publication.css";

export const dynamic = "force-dynamic";

const LEVELS = { beginner: 1, intermediate: 2, advanced: 3, all: 3 } as const;

function formatBytes(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getPublishedResource(slug);
  if (!resource) return {};
  return pageMetadata({
    title: resource.title,
    description: resource.summary || defaultDescription,
    path: `/resources/${slug}`,
    type: "article",
  });
}

export default async function ResourceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getPublishedResource(slug);
  if (!resource?.body) notFound();

  const analysis = analyzePublication(resource.body);
  const pdf = getPdfInfo(slug);
  const siblings = await getPublishedSiblings(slug);
  const chapters = analysis.toc.filter((entry) => entry.depth === 2);
  const numberedFigures = analysis.figures.filter((id) => id !== "rest-quick-reference").length;
  const quickRef = chapters.find((entry) => /quick reference/i.test(entry.title));
  const series = String(resource.sort_order || 1).padStart(2, "0");
  const levelBars = LEVELS[resource.level] ?? 2;

  return (
    <div className="pub" data-publication>
      <ReadingProgress />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: resource.title,
          description: resource.summary,
          author: { "@type": "Person", name: profile.name, url: absoluteUrl("/") },
          dateModified: resource.updated_at,
          datePublished: resource.created_at,
          url: absoluteUrl(`/resources/${slug}`),
          ...(pdf ? { encoding: { "@type": "MediaObject", contentUrl: absoluteUrl(pdf.file), encodingFormat: "application/pdf" } } : {}),
        }}
      />

      <Link href="/resources" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Resources
      </Link>

      <header className="pub-hero mt-8">
        <div>
          <p className="pub-series">
            {formatKindLabel(resource.kind)} {series} · Engineering Handbook Series
          </p>
          <h1 className="pub-title">{resource.title}</h1>
          {resource.summary ? (
            <div className="pub-lede">
              <ReactMarkdown remarkPlugins={[remarkGfm]} allowedElements={["p", "code", "em", "strong"]}>
                {resource.summary}
              </ReactMarkdown>
            </div>
          ) : null}

          <dl className="pub-meta">
            <div>
              <dt>Level</dt>
              <dd>
                <span className="pub-level-bars" aria-hidden>
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={n <= levelBars ? "on" : undefined} />
                  ))}
                </span>
                <span className="capitalize">{resource.level === "all" ? "All levels" : resource.level}</span>
              </dd>
            </div>
            <div>
              <dt>Reading time</dt>
              <dd>{analysis.readingMinutes} min</dd>
            </div>
            <div>
              <dt>Inside</dt>
              <dd>
                {chapters.filter((c) => c.number).length} chapters · {numberedFigures} figures
              </dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatMonth(resource.updated_at)}</dd>
            </div>
          </dl>

          {resource.topics.length > 0 ? (
            <div className="pub-topics">
              {resource.topics.map((topic) => (
                <span key={topic}>{topic}</span>
              ))}
            </div>
          ) : null}

          <div className="pub-actions">
            {pdf ? (
              <a href={pdf.file} download className="pub-btn pub-btn-primary">
                <Download className="h-4 w-4" />
                Download PDF <small>{pdf.pages} pages · {formatBytes(pdf.bytes)}</small>
              </a>
            ) : null}
            {quickRef ? (
              <a href={`#${quickRef.id}`} className="pub-btn pub-btn-ghost">
                <ListChecks className="h-4 w-4" /> Quick reference
              </a>
            ) : null}
          </div>
        </div>

        {pdf ? (
          <a href={pdf.file} download className="pub-cover-card" aria-label={`Download ${resource.title} as PDF`}>
            <span className="pub-cover-card-badge">
              <FileText className="h-3 w-3" /> PDF
            </span>
            <span className="pub-cover-card-inner">
              <span className="pub-cover-card-series">Handbook {series}</span>
              <span className="pub-cover-card-num">{series}</span>
              <span className="pub-cover-card-title">{resource.title}</span>
              <span className="pub-cover-card-foot">
                <span>{profile.name}</span>
                <span>{pdf.pages} pp</span>
              </span>
            </span>
          </a>
        ) : null}
      </header>

      <div className="pub-main">
        <div>
          <ContentsBar entries={analysis.toc} />
          <PublicationBody markdown={resource.body} figures={analysis.figures} />

          <div className="pub-endcard">
            <div>
              <p className="pub-series">Written by</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{profile.name}</p>
              <p className="mt-1 text-sm text-muted">
                Software engineer. Questions or corrections are welcome through the{" "}
                <Link href="/contact" className="text-accent hover:underline">contact page</Link>.
              </p>
            </div>
            {pdf ? (
              <a href={pdf.file} download className="pub-btn pub-btn-primary justify-self-start">
                <Download className="h-4 w-4" /> Keep the PDF
              </a>
            ) : null}
          </div>

          {siblings.length > 0 ? (
            <section className="mt-12">
              <p className="pub-series">More in the series</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {siblings.slice(0, 4).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/resources/${item.slug}`}
                    className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/60"
                  >
                    <p className="font-mono text-xs text-muted">
                      {String(item.sort_order).padStart(2, "0")} · {item.level}
                    </p>
                    <p className="mt-1.5 font-medium text-foreground">{item.title}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm text-accent">
                      Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
