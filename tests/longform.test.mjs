/**
 * LONG-FORM & MDX OUTPUT — asserted against the built HTML, not the source.
 *
 * The Phase 6 claim is that MDX is a RENDERING mechanism, not a second entity schema, and that
 * long-form reading is a designed surface rather than a `<div>` with paragraphs in it. Both claims
 * are only true if the shipped HTML says so, which is why these run over `dist/`.
 *
 * Global rules (one h1, no skipped headings, zero client JS, no bare <bdi>, no radius, no shadow)
 * are asserted for EVERY page in global.test.mjs. Nothing here repeats them. This file covers only
 * what is specific to the editorial publishing system:
 *
 *   - the MDX body actually rendered, and rendered CLEANLY (no component or expression leakage)
 *   - the custom components produced real, locale-correct, evidence-carrying HTML
 *   - the table of contents is GATED, and every anchor it offers exists
 *   - the measure, the prose scope and the Arabic emphasis rule survived the build
 */

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { TOC_SECTION_GATE, earnsTableOfContents } from "../src/lib/journal.ts";
import { assertOnlyCosmeticsLoader } from "./helpers/client-js.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const bodiesDir = join(root, "content", "mock", "journal-bodies");

const pages = [];

function collect(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collect(full);
    else if (entry === "index.html") {
      pages.push({
        route: full.replace(dist, "").replace(/\\/g, "/").replace("/index.html", "/"),
        html: readFileSync(full, "utf8"),
      });
    }
  }
}

before(() => {
  assert.ok(existsSync(dist), "dist/ not found — run `npx astro build` first");
  collect(dist);
});

/** Category archives are journal children too; their segment is a reserved format key. */
const FORMATS = ["testing-notes", "guides", "comparisons", "essays"];
const isCategory = (route) => FORMATS.some((f) => route.endsWith(`/journal/${f}/`));

/** Article detail pages only — not the index, not the gated category archives. */
const articles = () =>
  pages.filter((p) => /^\/(en|ar)\/journal\/[^/]+\/$/.test(p.route) && !isCategory(p.route));

const categories = () => pages.filter((p) => isCategory(p.route));
const routes = () => new Set(pages.map((p) => p.route));

/** The rendered MDX body, which is the only region these tests are entitled to inspect. */
const proseOf = (html) => {
  const open = html.indexOf('<div class="prose"');
  if (open === -1) return "";
  const close = html.indexOf("</div>", open);
  return html.slice(open, close);
};

const stripTags = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/* ================================================================= the body rendered */

describe("the MDX body reached the page", () => {
  test("one article route per body file", () => {
    // Ten bodies, ten routes: `understanding-finish-and-texture` is English-only and
    // `arabic-shade-vocabulary` is Arabic-only, so six records produce ten of each.
    const bodies = readdirSync(bodiesDir).filter((f) => f.endsWith(".mdx"));
    assert.equal(articles().length, bodies.length, "one route per body file");
    assert.equal(articles().length, 10);
  });

  test("every article renders a non-empty prose region", () => {
    for (const page of articles()) {
      const prose = proseOf(page.html);
      assert.ok(prose, `${page.route} has no .prose region — the MDX body did not render`);
      assert.ok(
        stripTags(prose).length > 200,
        `${page.route} rendered a suspiciously short body (${stripTags(prose).length} chars)`
      );
    }
  });

  test("the body rendered as REAL HTML, not escaped markdown", () => {
    for (const page of articles()) {
      const prose = proseOf(page.html);
      assert.ok(/<h2\b/.test(prose), `${page.route}: no <h2> — headings did not compile`);
      assert.ok(/<p\b/.test(prose), `${page.route}: no <p> — paragraphs did not compile`);
      assert.ok(!/^\s*##\s/m.test(stripTags(prose)), `${page.route}: raw "##" survived into the text`);
    }
  });
});

describe("nothing leaked out of the MDX pipeline", () => {
  test("no component name survives as literal text", () => {
    // If a component were unregistered, MDX would emit its name as text rather than fail.
    for (const page of articles()) {
      const text = stripTags(page.html);
      for (const name of ["EditorialNote", "ReviewReference", "Figure", "Prose"]) {
        assert.ok(!text.includes(name), `${page.route}: component name "${name}" leaked into the text`);
      }
    }
  });

  test("no unresolved JSX expression and no frontmatter fence", () => {
    for (const page of articles()) {
      const text = stripTags(proseOf(page.html));
      assert.ok(!/\{[^}]*\}/.test(text), `${page.route}: an unevaluated {expression} reached the page`);
      assert.ok(!/^---$/m.test(text), `${page.route}: a frontmatter fence rendered as content`);
      assert.ok(!text.includes("[object Object]"), `${page.route}: [object Object] in the body`);
      assert.ok(!text.includes("undefined"), `${page.route}: "undefined" in the body`);
    }
  });

  test("the authoring comments in the body files never ship", () => {
    // Every seeded body carries a provenance comment. It is authoring metadata, not content.
    for (const page of articles()) {
      assert.ok(
        !page.html.includes("Seeded by scripts/seed-journal-mdx.mjs"),
        `${page.route}: the seed provenance comment shipped to the reader`
      );
      assert.ok(!page.html.includes("HAND-EDITED after seeding"), `${page.route}: editing note shipped`);
    }
  });
});

/* ================================================================= the components */

describe("ReviewReference produced a real citation", () => {
  const citing = () => articles().filter((p) => p.html.includes('class="review-reference"'));

  test("both hand-placed citations survived the build", () => {
    const routesWith = citing().map((p) => p.route).sort();
    assert.deepEqual(routesWith, [
      "/ar/journal/mufradat-darajat-albashara/",
      "/en/journal/how-to-evaluate-foundation-performance/",
    ]);
  });

  test("a citation links to a review route THAT EXISTS, in its own locale", () => {
    const built = routes();
    for (const page of citing()) {
      const locale = page.route.slice(1, 3);
      const hrefs = [...page.html.matchAll(/<a class="review-reference" href="([^"]+)"/g)].map((m) => m[1]);
      assert.ok(hrefs.length > 0, `${page.route}: the reference rendered without a link`);
      for (const href of hrefs) {
        assert.ok(built.has(href), `${page.route}: citation points at "${href}", which was not built`);
        assert.ok(
          href.startsWith(`/${locale}/reviews/`),
          `${page.route}: citation crosses locale into "${href}"`
        );
      }
    }
  });

  test("the citation carries the record's DISCLOSURE, before the reader clicks", () => {
    // The reason this is a component and not a markdown link: commercial status travels with the
    // citation, so a reader following evidence learns who paid for it without leaving the sentence.
    for (const page of citing()) {
      assert.ok(
        /class="reference-disclosure label"/.test(page.html),
        `${page.route}: a citation shipped with no disclosure`
      );
    }
  });

  test("the citation names the record, so it reads as evidence and not as a bare link", () => {
    const en = pages.find((p) => p.route === "/en/journal/how-to-evaluate-foundation-performance/");
    assert.ok(en.html.includes("Documented in"));
    assert.ok(en.html.includes("Maison Eclat Voile Lumiere Skin Tint"));
    assert.ok(en.html.includes("Paid partnership"));

    const ar = pages.find((p) => p.route === "/ar/journal/mufradat-darajat-albashara/");
    assert.ok(/href="\/ar\/reviews\/[^"]+"/.test(ar.html), "the Arabic citation produced no link");
    assert.ok(/class="citation-label label"/.test(ar.html), "the Arabic citation has no label");
  });
});

describe("EditorialNote marks the medical boundary structurally", () => {
  const boundaryRoutes = [
    "/en/journal/building-a-practical-routine/",
    "/ar/journal/building-a-practical-routine/",
  ];

  test("the routine article carries a boundary note in BOTH locales", () => {
    for (const route of boundaryRoutes) {
      const page = pages.find((p) => p.route === route);
      assert.ok(page, `${route} was not built`);
      assert.ok(
        page.html.includes("editorial-note--boundary"),
        `${route}: the medical boundary is not marked as a boundary note`
      );
    }
  });

  test("the note is an <aside> with an accessible name", () => {
    for (const route of boundaryRoutes) {
      const page = pages.find((p) => p.route === route);
      const m = page.html.match(/<aside class="editorial-note[^"]*"([^>]*)>/);
      assert.ok(m, `${route}: the note is not an <aside>`);
      assert.ok(
        /aria-label="[^"]+"|aria-labelledby="[^"]+"/.test(m[1]),
        `${route}: the boundary aside has no accessible name`
      );
    }
  });

  test("the boundary still SAYS the thing — the markup did not swallow the words", () => {
    const en = pages.find((p) => p.route === boundaryRoutes[0]);
    assert.ok(
      stripTags(en.html).includes("Nothing here is medical advice"),
      "the English boundary text is missing from the page"
    );

    const ar = pages.find((p) => p.route === boundaryRoutes[1]);
    const arNote = ar.html.match(/<aside class="editorial-note[\s\S]*?<\/aside>/);
    assert.ok(arNote, "the Arabic boundary aside is missing");
    assert.ok(stripTags(arNote[0]).length > 40, "the Arabic boundary rendered empty");
  });
});

/* ================================================================= the table of contents */

const tocOf = (html) => {
  const m = html.match(/<nav class="toc"[\s\S]*?<\/nav>/);
  return m ? m[0] : "";
};
const h2Ids = (prose) => [...prose.matchAll(/<h2[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);

describe("the table of contents is GATED, never automatic", () => {
  test("a TOC appears only where the body has four or more sections", () => {
    const GATE = 4;
    for (const page of articles()) {
      const sections = h2Ids(proseOf(page.html)).length;
      const hasToc = Boolean(tocOf(page.html));
      assert.equal(
        hasToc,
        sections >= GATE,
        `${page.route}: ${sections} sections but TOC ${hasToc ? "present" : "absent"}`
      );
    }
  });

  test("the gate REFUSES below the threshold — verified directly, not via the corpus", () => {
    // Every article in the present corpus has 4+ sections, so the built output can only ever show
    // the gate saying yes. Observing agreement is not the same as verifying a rule: the refusal
    // path is tested here against the predicate itself, which is why it is a named export rather
    // than a `>= 4` buried in the template.
    assert.equal(TOC_SECTION_GATE, 4);
    assert.equal(earnsTableOfContents(0), false);
    assert.equal(earnsTableOfContents(1), false);
    assert.equal(earnsTableOfContents(3), false, "three sections must NOT earn navigation");
    assert.equal(earnsTableOfContents(4), true, "four sections is the threshold, inclusive");
    assert.equal(earnsTableOfContents(9), true);
  });

  test("the corpus sits at or above the threshold, and the build agrees", () => {
    // Recorded, not asserted as a virtue: the shallowest article has exactly four sections, so the
    // gate currently admits everything. If content later drops below four, the agreement test
    // above this one is what will catch a TOC that should not be there.
    const counts = articles().map((p) => h2Ids(proseOf(p.html)).length);
    assert.equal(Math.min(...counts), 4, "the shallowest article no longer sits at the threshold");
    assert.equal(
      articles().filter((p) => tocOf(p.html)).length,
      articles().length,
      "every article currently earns a TOC"
    );
  });

  test("every TOC anchor resolves to a heading in the SAME document", () => {
    for (const page of articles()) {
      const toc = tocOf(page.html);
      if (!toc) continue;
      const ids = new Set(h2Ids(proseOf(page.html)));
      const anchors = [...toc.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
      assert.ok(anchors.length > 0, `${page.route}: an empty TOC was rendered`);
      for (const anchor of anchors) {
        assert.ok(ids.has(anchor), `${page.route}: TOC points at #${anchor}, which no heading owns`);
      }
      assert.equal(anchors.length, ids.size, `${page.route}: the TOC and the body disagree on sections`);
    }
  });

  test("every body heading is anchorable, whether or not a TOC exists", () => {
    for (const page of articles()) {
      const prose = proseOf(page.html);
      for (const [, level, attrs] of prose.matchAll(/<h([23])([^>]*)>/g)) {
        assert.ok(/\bid="/.test(attrs), `${page.route}: an h${level} in the body has no id`);
      }
    }
  });

  test("the TOC is a named landmark, so it is skippable", () => {
    for (const page of articles()) {
      const toc = tocOf(page.html);
      if (!toc) continue;
      assert.ok(
        /aria-labelledby="[^"]+"|aria-label="[^"]+"/.test(toc),
        `${page.route}: the TOC nav has no accessible name`
      );
    }
  });

  test("category archives get NO table of contents", () => {
    for (const page of categories()) {
      assert.ok(!/<nav class="toc"/.test(page.html), `${page.route}: an archive rendered a TOC`);
    }
  });
});

/* ================================================================= long-form typography */

let styles = "";

describe("long-form typography survived the build", () => {
  before(() => {
    const dir = join(dist, "_astro");
    styles = readdirSync(dir)
      .filter((f) => f.endsWith(".css"))
      .map((f) => readFileSync(join(dir, f), "utf8"))
      .join("\n");
  });

  test("the measure is applied as a MAXIMUM, in ch", () => {
    assert.ok(/--type-measure-editorial:\s*66ch/.test(styles), "the editorial measure token is missing");
    assert.ok(
      /max-width:\s*var\(--type-measure-editorial\)/.test(styles),
      "the prose region does not constrain its measure"
    );
    assert.ok(!/width:\s*66ch/.test(styles), "the measure is fixed rather than capped");
  });

  test("emphasis is weight, never italic — Arabic has no italic form", () => {
    const italics = [...styles.matchAll(/font-style:\s*italic/g)];
    assert.equal(italics.length, 0, "font-style: italic is declared somewhere in the shipped CSS");
  });

  test("the Arabic article inherits the script adaptation from the locale root", () => {
    const ar = pages.find((p) => p.route === "/ar/journal/building-a-practical-routine/");
    assert.ok(/<html[^>]+lang="ar"/.test(ar.html));
    assert.ok(/<html[^>]+dir="rtl"/.test(ar.html));
    assert.ok(/--type-arabic-size-factor/.test(styles), "the Arabic size factor is not in the build");
    assert.ok(/--type-arabic-leading-factor/.test(styles), "the Arabic leading factor is not in the build");
  });

  test("no physical-direction property is used to lay out the reading column", () => {
    // Logical properties throughout: the Arabic page is not a mirrored special case.
    for (const physical of ["margin-left:", "margin-right:", "padding-left:", "padding-right:"]) {
      assert.ok(!styles.includes(physical), `${physical} appears in the shipped CSS`);
    }
  });

  test("a body table can scroll rather than overflow the measure", () => {
    const withTable = articles().filter((p) => /<table\b/.test(proseOf(p.html)));
    if (withTable.length === 0) return;
    assert.ok(/overflow-x/.test(styles), "a body table ships with no horizontal scroll strategy");
  });
});

/* ================================================================= journal metadata */

describe("journal pages claim nothing they cannot support", () => {
  test("an article emits Article JSON-LD with a real author and NO rating", () => {
    for (const page of articles()) {
      const blocks = [
        ...page.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
      ].map((m) => JSON.parse(m[1]));

      const article = blocks.find((b) => b["@type"] === "Article" || b["@type"] === "BlogPosting");
      assert.ok(article, `${page.route}: no Article schema`);
      assert.equal(article["@type"], "Article", `${page.route}: emitted BlogPosting, not Article`);
      assert.ok(article.headline, `${page.route}: Article without a headline`);
      assert.ok(article.author, `${page.route}: Article without an author`);

      const json = JSON.stringify(article);
      for (const forbidden of ["aggregateRating", "reviewRating", "ratingValue", "offers", "sameAs"]) {
        assert.ok(!json.includes(forbidden), `${page.route}: Article carries "${forbidden}"`);
      }
    }
  });

  test("a gated category archive is noindex but still reachable", () => {
    for (const page of categories()) {
      assert.ok(
        /<meta name="robots" content="[^"]*noindex/.test(page.html),
        `${page.route}: a thin archive claims indexability`
      );
      assert.ok(/<h1\b/.test(page.html), `${page.route}: the archive has no heading`);
    }
  });

  test("no journal page ships a script beyond the decorative 3D loader", () => {
    // Asserted globally too. Repeated here because the MDX pipeline is the one part of the build
    // that can introduce a runtime without anyone asking for it. Phase 11: the single permitted
    // script is the same-origin cosmetics module loader (tests/helpers/client-js.mjs).
    for (const page of [...articles(), ...categories()]) {
      assertOnlyCosmeticsLoader(assert, page.html, page.route);
    }
  });
});
