#!/usr/bin/env npx tsx
/**
 * Build the PDF edition of a resource from its print route.
 *
 *   1. Start the site (to build from local Markdown before seeding, use preview mode):
 *        RESOURCES_LOCAL_PREVIEW=1 npm run dev
 *   2. In another terminal:
 *        npm run resources:pdf -- --slug=practical-rest-api-handbook
 *        npm run resources:pdf -- --all
 *
 * Options:
 *   --base=http://localhost:3000   site to render from
 *   CHROME_PATH=/path/to/chrome    browser to use (defaults to the installed Google Chrome)
 *
 * Output: public/resources/pdf/<slug>.pdf and an entry in src/lib/publication/pdf-manifest.json.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright-core";
import { PDFDocument } from "pdf-lib";
import { localResources } from "./local-resources";

const AUTHOR = "Nyuydine Bill Leynyuy";

function arg(name: string) {
  const hit = process.argv.find((item) => item.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : undefined;
}

type Manifest = Record<string, { file: string; pages: number; bytes: number; generatedAt: string }>;

async function main() {
  const base = (arg("base") ?? "http://localhost:3000").replace(/\/$/, "");
  const all = process.argv.includes("--all");
  const slug = arg("slug");
  const slugs = all ? localResources.map((r) => r.slug) : slug ? [slug] : [];
  if (slugs.length === 0) throw new Error("Pass --slug=<slug> or --all");

  const manifestPath = resolve(process.cwd(), "src/lib/publication/pdf-manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
  const outDir = resolve(process.cwd(), "public/resources/pdf");
  mkdirSync(outDir, { recursive: true });
  const pagedPath = resolve(process.cwd(), "node_modules/pagedjs/dist/paged.js");

  const browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" },
  );

  try {
    for (const current of slugs) {
      // A dev server may recompile mid-render on the first request; one retry covers it.
      for (let attempt = 1; ; attempt += 1) {
        try {
          await renderOne(current);
          break;
        } catch (err) {
          if (attempt >= 2) throw err;
          console.warn(`  retrying after: ${(err as Error).message.split("\n")[0]}`);
        }
      }
    }
  } finally {
    await browser.close();
  }

  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log("Manifest updated.");

  async function renderOne(current: string) {
      const page = await browser.newPage();
      const url = `${base}/resources/${current}/print`;
      console.log(`→ ${url}`);

      page.on("pageerror", (err) => console.error(`  page error: ${err.message}`));
      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
      if (!response || !response.ok()) {
        throw new Error(`${url} returned ${response?.status()}. Is the resource published and the site running?`);
      }

      // Development overlays and anything else outside the print root must not reach the paper.
      await page.evaluate(() => {
        document.querySelectorAll("nextjs-portal, [data-nextjs-toast], next-route-announcer").forEach((el) => el.remove());
      });
      await page.evaluate(() => document.fonts.ready);
      // Let React finish hydrating (and a dev server finish recompiling) before Paged.js takes
      // the DOM apart; a late re-render would otherwise duplicate or drop content.
      await page.waitForTimeout(2000);
      await page.addScriptTag({ path: pagedPath });

      const pages = await page.evaluate(async () => {
        const css = document.getElementById("pub-page-css")?.textContent ?? "";
        const root = document.getElementById("pub-print-root");
        if (!root) throw new Error("print root not found");
        const headings = root.querySelectorAll("h2.pub-h2").length;

        const content = document.createDocumentFragment();
        while (root.firstChild) content.appendChild(root.firstChild);
        const target = document.createElement("div");
        target.className = root.className;
        root.replaceWith(target);

        type PagedGlobal = { Previewer: new () => { preview: (c: DocumentFragment, s: object[], t: HTMLElement) => Promise<{ total: number }> } };
        const { Previewer } = (window as unknown as { Paged: PagedGlobal }).Paged;
        const flow = await new Previewer().preview(content, [{ [`${location.href}#paged`]: css }], target);
        const paged = document.querySelectorAll(".pagedjs_pages h2.pub-h2").length;
        if (paged !== headings) throw new Error(`layout check failed: ${headings} chapter headings in, ${paged} out`);
        return flow.total;
      });

      // Paged.js gives every page a page break after it; on the last one Chrome turns that into
      // an extra blank sheet.
      await page.addStyleTag({
        content: "@media print { .pagedjs_page:last-of-type { break-after: auto !important; page-break-after: auto !important; } }",
      });

      const raw = await page.pdf({
        preferCSSPageSize: true,
        printBackground: true,
        outline: true,
        tagged: true,
      });
      await page.close();

      const meta = localResources.find((r) => r.slug === current);
      const pdf = await PDFDocument.load(raw, { updateMetadata: false });
      pdf.setTitle(meta?.title ?? current, { showInWindowTitleBar: true });
      pdf.setAuthor(AUTHOR);
      pdf.setSubject(meta?.summary ?? "");
      pdf.setKeywords(meta?.topics ?? []);
      pdf.setCreator("nyuydine.online");
      pdf.setProducer("nyuydine.online publication system");
      pdf.setLanguage("en");
      const bytes = await pdf.save();

      const file = `/resources/pdf/${current}.pdf`;
      writeFileSync(resolve(outDir, `${current}.pdf`), bytes);
      manifest[current] = { file, pages, bytes: bytes.length, generatedAt: new Date().toISOString() };
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      console.log(`  ✓ ${pages} pages, ${(bytes.length / 1024).toFixed(0)} KB → public${file}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
