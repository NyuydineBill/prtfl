/**
 * Paged-media rules for the PDF. They are handed to Paged.js by scripts/build-resource-pdf.ts
 * (not applied by the browser directly), because they rely on features Paged.js polyfills:
 * running strings, target-counter() page references and named pages.
 */
export const PRINT_PAGE_CSS = `
@page {
  size: A4;
  margin: 21mm 18mm 20mm 18mm;
  background: #ffffff;

  @top-left {
    content: string(doctitle);
    font-family: var(--font-hanken), sans-serif;
    font-size: 7.5pt;
    color: #5b677c;
    vertical-align: bottom;
    padding-bottom: 5mm;
  }
  @top-right {
    content: string(chapter);
    font-family: var(--font-hanken), sans-serif;
    font-size: 7.5pt;
    color: #0b7f99;
    vertical-align: bottom;
    padding-bottom: 5mm;
  }
  @bottom-left {
    content: "nyuydine.online";
    font-family: var(--font-jetbrains), monospace;
    font-size: 7pt;
    color: #5b677c;
    vertical-align: top;
    padding-top: 5mm;
  }
  @bottom-right {
    content: counter(page);
    font-family: var(--font-jetbrains), monospace;
    font-size: 8pt;
    font-weight: 600;
    color: #0d1424;
    vertical-align: top;
    padding-top: 5mm;
  }
}

@page cover {
  margin: 0;
  background: #0b1220;
  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-left { content: none; }
  @bottom-right { content: none; }
}

@page front {
  @top-left { content: none; }
  @top-right { content: none; }
}

@page reference {
  margin: 14mm 12mm 14mm 12mm;
  @top-left { content: none; }
  @top-right { content: none; }
}

.pdf-cover { page: cover; break-after: page; }
.pdf-front { page: front; break-after: page; }
.pdf-doctitle { string-set: doctitle content(text); }
.pub-h2 { string-set: chapter content(text); }

.pub-chapter, .pub-backmatter { break-before: page; }
.pub-backmatter[data-chapter-id="quick-reference"] { page: reference; }

/* Figures are kept whole: Paged.js duplicates content when it fragments nested boxes. */
.pub-figure, .pub-callout, .pub-panel, .pub-class, .pub-qr section, .pub-anatomy { break-inside: avoid; }
.pub-code { break-inside: avoid; }
.pub-table-wrap tr { break-inside: avoid; }
.pub-chapter-head, .pub-backmatter-head, .pub-h3 { break-after: avoid; }
.pub-body p { orphans: 3; widows: 3; }

.pdf-toc a::after {
  content: target-counter(attr(href), page);
  margin-left: auto;
  padding-left: 0.6em;
  font-family: var(--font-jetbrains), monospace;
  color: #0d1424;
}
`;
