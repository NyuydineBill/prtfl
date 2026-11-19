import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { analyzePublication } from "@/lib/publication/analyze";
import { getPublishedResource } from "@/lib/publication/get-resource";
import { PRINT_PAGE_CSS } from "@/lib/publication/print-css";
import { PublicationBody } from "@/components/publication/publication-body";
import { CoverArt } from "@/components/publication/cover-art";
import { formatKindLabel } from "@/lib/resources";
import { profile } from "@/lib/data/profile";
import { siteUrl } from "@/lib/site";
import "@/styles/publication.css";

/**
 * Print source for the PDF edition. Rendered by scripts/build-resource-pdf.ts through
 * Paged.js in headless Chrome; not meant to be read in a browser on its own.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getPublishedResource(slug);
  return {
    title: resource?.title ?? "Print edition",
    robots: { index: false, follow: false },
  };
}

const LEVEL_LABEL = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all: "All levels",
} as const;

export default async function ResourcePrintPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = await getPublishedResource(slug);
  if (!resource?.body) notFound();

  const analysis = analyzePublication(resource.body);
  const series = String(resource.sort_order || 1).padStart(2, "0");
  const edition = new Date(resource.updated_at).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const year = new Date(resource.updated_at).getUTCFullYear();
  const site = siteUrl.replace(/^https?:\/\//, "");
  const webUrl = `${site}/resources/${slug}`;
  const chapters = analysis.toc.filter((entry) => entry.depth === 2);

  return (
    <>
      <style>{`
        html, body { background: #ffffff !important; }
        body::before { display: none !important; }
      `}</style>
      <script
        type="text/plain"
        id="pub-page-css"
        dangerouslySetInnerHTML={{ __html: PRINT_PAGE_CSS }}
      />

      <div id="pub-print-root" className="pub pub-print">
        <section className="pdf-cover">
          <div className="pdf-cover-top">
            <span>The Engineering Resource Series by Nyuydine Bill</span>
            <span>No. {series}</span>
          </div>

          <CoverArt slug={slug} series={series} />

          <div className="pdf-cover-main">
            <p className="pdf-cover-kind">{formatKindLabel(resource.kind)} · {LEVEL_LABEL[resource.level]}</p>
            <h1 className="pdf-cover-title">{resource.title}</h1>
            <p className="pdf-cover-summary">{resource.summary}</p>
          </div>

          <div className="pdf-cover-foot">
            <div>
              <p className="pdf-cover-author">{profile.name}</p>
              <p>{site}</p>
            </div>
            <div className="pdf-cover-edition">
              <p>{edition} edition</p>
              <p>{analysis.readingMinutes} min read</p>
            </div>
          </div>
        </section>

        <section className="pdf-front">
          <p className="pdf-doctitle">{resource.title}</p>
          <h2 className="pdf-front-title">Contents</h2>
          <ol className="pdf-toc">
            {chapters.map((entry) => (
              <li key={entry.id} className={entry.number ? undefined : "is-back"}>
                <a href={`#${entry.id}`}>
                  <span className="pdf-toc-num">{entry.number ?? ""}</span>
                  <span className="pdf-toc-title">{entry.title}</span>
                  <span className="pdf-toc-leader" />
                </a>
              </li>
            ))}
          </ol>

          <div className="pdf-about">
            <div>
              <p className="pdf-about-label">About this edition</p>
              <p>
                This PDF is the print edition of the guide published at <strong>{webUrl}</strong>,
                where it is kept up to date. Figures are original diagrams drawn for this guide.
                Standards and official documentation are listed under References.
              </p>
            </div>
            <div>
              <p className="pdf-about-label">Author</p>
              <p>
                <strong>{profile.name}</strong>
                <br />
                {site}
              </p>
              <p className="pdf-about-copy">© {year} {profile.name}. {edition} edition.</p>
            </div>
          </div>
        </section>

        <PublicationBody markdown={resource.body} figures={analysis.figures} />
      </div>
    </>
  );
}
