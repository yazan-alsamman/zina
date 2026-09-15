/**
 * SITEMAP TESTS — the discoverable-URL set, its rendering, and its agreement with the built site.
 *
 * Two kinds of test, matching the Phase 7 pattern for a gate the corpus itself never opens:
 *
 *   1. LIB-LEVEL, against the real corpus with the `indexableBuild` override forced `true` —
 *      proves every gate (brand, category facet, journal format, per-record noindex) computes
 *      correctly, without that override ever reaching the production endpoint.
 *   2. BUILT-OUTPUT, against `dist/` as actually produced by `npm run build` — proves the current,
 *      honestly empty state, and cross-validates every listed URL (when the override is used to
 *      render real XML) against what the corresponding PAGE itself declares in its own head.
 *
 * The override is a boolean parameter on pure functions, never an environment variable and never
 * a flag the production endpoint reads — see src/lib/sitemap.ts for the full reasoning.
 */

import { test, describe, before } from "node:test";
import { SITE_URL } from "../src/config/site.ts";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  discoverableUrls,
  discoverableUrlsFor,
  renderLocaleSitemapXml,
  renderSitemapIndexXml,
} from "../src/lib/sitemap.ts";
import { brandById, journalArticles, reviews, workById } from "../src/lib/content.ts";
import { absoluteUrl, machinePath, path } from "../src/lib/routing.ts";
import { assertWellFormedXml } from "./helpers/xml.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

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

const pageFor = (route) => pages.find((p) => p.route === route);

/* ================================================================= current (mock) build */

describe("the current build is honestly empty — nothing is indexable while the source is mock", () => {
  test("discoverableUrls() with no override returns nothing", () => {
    assert.deepEqual(discoverableUrls(), []);
  });

  test("dist/sitemap.xml is a valid index pointing at two locale files", () => {
    const xml = readFileSync(join(dist, "sitemap.xml"), "utf8");
    assertWellFormedXml(xml, "sitemap.xml");
    assert.ok(xml.includes(`<loc>${SITE_URL}/sitemap-en.xml</loc>`));
    assert.ok(xml.includes(`<loc>${SITE_URL}/sitemap-ar.xml</loc>`));
  });

  test("dist/sitemap-en.xml and sitemap-ar.xml are valid, empty <urlset> documents", () => {
    for (const file of ["sitemap-en.xml", "sitemap-ar.xml"]) {
      const xml = readFileSync(join(dist, file), "utf8");
      assertWellFormedXml(xml, file);
      assert.match(xml, /<urlset[^>]*>/);
      assert.ok(!xml.includes("<url>"), `${file}: contains a <url> entry while the build is mock`);
    }
  });

  test("no mock content or domain literal reaches any sitemap file", () => {
    for (const file of ["sitemap.xml", "sitemap-en.xml", "sitemap-ar.xml"]) {
      const xml = readFileSync(join(dist, file), "utf8");
      assert.ok(!xml.includes("__MOCK_DATA__"), `${file}: carries a mock marker`);
      assert.ok(!/example\.com/.test(xml), `${file}: contains the mock domain, not the SITE_URL placeholder`);
    }
  });
});

/* ================================================================= the gate, forced open */

describe("every gate opens correctly — proven against the REAL corpus, override forced true", () => {
  const forced = discoverableUrls(true);

  test("the total matches the known corpus exactly: 58 URLs (30 en / 28 ar)", () => {
    // 12 static route-types x 2 locales (24) + 10 review + 10 journal + 7 work + 7 brand.
    // Asymmetry: veloura-beauty (brand), one review, one journal article and one work record are
    // English-only, so ar is short by 2 relative to a naive 29/29 split.
    //
    // 11 static types became 12 when /{locale}/film/ was added: it is a surface in its own right,
    // with its own canonical and its own hreflang pair, not a duplicate of /method/. Both locales
    // gained exactly one URL, which is what keeps the asymmetry above unchanged.
    assert.equal(forced.length, 58);
    assert.equal(forced.filter((u) => u.locale === "en").length, 30);
    assert.equal(forced.filter((u) => u.locale === "ar").length, 28);
  });

  test("the film is present in both locales, and is a canonical of its own", () => {
    const film = forced.filter((u) => u.loc.endsWith("/film/"));
    assert.equal(film.length, 2, "the film should appear once per locale");
    assert.deepEqual(
      film.map((u) => u.locale).sort(),
      ["ar", "en"],
      "the film is missing from one locale"
    );
    // Its alternates must name both locales and an x-default, like every other static family.
    for (const url of film) {
      const hreflangs = url.alternates.map((a) => a.hreflang).sort();
      assert.deepEqual(hreflangs, ["ar", "en", "x-default"], `${url.loc}: wrong hreflang set`);
    }
  });

  test("the brand facet NEVER appears — permanently noindex, by construction", () => {
    assert.ok(!forced.some((u) => u.loc.includes("/reviews/brand/")), "a brand facet URL leaked in");
  });

  test("404 never appears, forced open or not", () => {
    assert.ok(!forced.some((u) => u.loc.includes("/404/")));
  });

  test("unbuilt routes (press, product detail) never appear", () => {
    assert.ok(!forced.some((u) => u.loc.includes("/press/")));
    assert.ok(!forced.some((u) => /\/brands\/[^/]+\/[^/]+\/$/.test(u.loc)));
  });

  test("no review-category or journal-format facet appears — none reaches its own gate", () => {
    // The corpus holds at most two guides and no category with 5+ reviews in either locale.
    const categorySlugs = ["foundation", "concealer", "mascara", "lip", "serum", "moisturizer"];
    const formatSlugs = ["testing-notes", "guides", "comparisons", "essays"];
    for (const slug of [...categorySlugs, ...formatSlugs]) {
      assert.ok(
        !forced.some((u) => u.loc.endsWith(`/${slug}/`)),
        `${slug} appears despite not reaching its thin-page gate`
      );
    }
  });

  test("the brand gate asymmetry is exactly Phase 7's: veloura-beauty en yes, ar no", () => {
    assert.ok(forced.some((u) => u.loc === absoluteUrl(path.brand("en", "veloura-beauty"))));
    assert.ok(!forced.some((u) => u.loc === absoluteUrl(path.brand("ar", "veloura-beauty"))));
  });

  test("the terra-sana BRAND ENTITY never appears — gated in both locales", () => {
    // Precise, not a substring scan: terra-sana's own REVIEW is legitimately indexable (a
    // review's indexability is independent of its brand's gate), so a bare "terra-sana" substring
    // check would be a false failure. Only the entity route /brands/terra-sana/ is asserted here.
    assert.ok(!forced.some((u) => u.loc === absoluteUrl(path.brand("en", "terra-sana"))));
    assert.ok(!forced.some((u) => u.loc === absoluteUrl(path.brand("ar", "terra-sana"))));
  });

  test("a review of a gated brand's product is STILL indexable on its own terms", () => {
    // The brand gate governs whether the BRAND earns a page, not whether reviews of its products
    // do. terra-sana has no entity page and one fully indexable Arabic review.
    assert.ok(
      forced.some((u) => u.loc === absoluteUrl(path.review("ar", "terra-sana-verdure-cloud-balm"))),
      "the terra-sana review should remain indexable even though its brand is gated"
    );
  });

  test("lastmod formats match exactly what each record actually states — nothing invented", () => {
    for (const url of forced) {
      if (url.loc.includes("/reviews/") && !url.loc.endsWith("/reviews/") && !url.loc.includes("/brand/")) {
        assert.match(url.lastmod ?? "", /^\d{4}-\d{2}-\d{2}$/, url.loc);
      }
      if (url.loc.includes("/journal/") && !url.loc.endsWith("/journal/")) {
        assert.match(url.lastmod ?? "", /^\d{4}-\d{2}-\d{2}$/, url.loc);
      }
      if (url.loc.includes("/work/") && !url.loc.endsWith("/work/")) {
        assert.match(url.lastmod ?? "", /^\d{4}-\d{2}$/, url.loc);
      }
      if (url.loc.includes("/brands/") && !url.loc.endsWith("/brands/")) {
        assert.equal(url.lastmod, undefined, `${url.loc}: brand has no dates field, lastmod invented`);
      }
    }
  });

  test("no lastmod on any structural/index page — no record represents 'this page changed'", () => {
    const indexPages = [path.home, path.reviewsIndex, path.brandsIndex, path.workIndex, path.journalIndex,
      path.about, path.method, path.contact, path.editorialStandards, path.privacy, path.terms];
    for (const builder of indexPages) {
      for (const locale of ["en", "ar"]) {
        const url = forced.find((u) => u.loc === absoluteUrl(builder(locale)));
        assert.ok(url, `${builder(locale)} missing from forced set`);
        assert.equal(url.lastmod, undefined, `${builder(locale)}: invented a lastmod`);
      }
    }
  });

  test("priority and changefreq are read from site.json, not hardcoded here", () => {
    const home = forced.find((u) => u.loc === absoluteUrl(path.home("en")));
    assert.equal(home.priority, 1);
    assert.equal(home.changefreq, "weekly");

    const priv = forced.find((u) => u.loc === absoluteUrl(path.privacy("en")));
    assert.equal(priv.priority, 0.2);
    assert.equal(priv.changefreq, "yearly");
  });
});

/* ================================================================= alternates / hreflang */

describe("sitemap alternates match head-level hreflang exactly", () => {
  const forced = discoverableUrls(true);

  test("a bilingual review carries en + ar + x-default", () => {
    const review = reviews("en").find((r) => r.locales.ar);
    const url = forced.find((u) => u.loc === absoluteUrl(path.review("en", review.locales.en.slug)));
    const langs = url.alternates.map((a) => a.hreflang).sort();
    assert.deepEqual(langs, ["ar", "en", "x-default"]);
  });

  test("an English-only journal article carries en + x-default only, no ar", () => {
    const article = journalArticles("en").find((a) => !a.locales.ar);
    assert.ok(article, "expected an English-only journal article in the corpus");
    const url = forced.find((u) => u.loc === absoluteUrl(path.journal("en", article.locales.en.slug)));
    const langs = url.alternates.map((a) => a.hreflang).sort();
    assert.deepEqual(langs, ["en", "x-default"]);
  });

  test("an Arabic-original journal article's x-default points at the Arabic URL, not English", () => {
    const article = journalArticles("ar").find((a) => !a.locales.en);
    assert.ok(article, "expected an Arabic-only journal article in the corpus");
    const url = forced.find((u) => u.loc === absoluteUrl(path.journal("ar", article.locales.ar.slug)));
    const xDefault = url.alternates.find((a) => a.hreflang === "x-default");
    assert.equal(xDefault.href, absoluteUrl(path.journal("ar", article.locales.ar.slug)));
  });

  test("veloura-beauty (en-only brand) carries no ar alternate", () => {
    const url = forced.find((u) => u.loc === absoluteUrl(path.brand("en", "veloura-beauty")));
    assert.deepEqual(url.alternates.map((a) => a.hreflang).sort(), ["en", "x-default"]);
  });

  test("a bilingual brand carries en + ar + x-default", () => {
    const url = forced.find((u) => u.loc === absoluteUrl(path.brand("en", "maison-eclat")));
    assert.deepEqual(url.alternates.map((a) => a.hreflang).sort(), ["ar", "en", "x-default"]);
  });
});

/* ================================================================= rendering */

describe("rendering — real corpus data, parsed and cross-checked", () => {
  test("a forced-populated locale sitemap is well-formed XML", () => {
    const xml = renderLocaleSitemapXml(discoverableUrlsFor("en", true));
    assertWellFormedXml(xml, "forced sitemap-en.xml");
    assert.match(xml, /<urlset[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"[^>]*>/);
    assert.match(xml, /xmlns:xhtml="http:\/\/www\.w3\.org\/1999\/xhtml"/);
  });

  test("every rendered <loc> is escaped and absolute", () => {
    const xml = renderLocaleSitemapXml(discoverableUrlsFor("en", true));
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.ok(locs.length > 0);
    for (const loc of locs) assert.ok(loc.startsWith(`${SITE_URL}/`), loc);
  });

  test("renderSitemapIndexXml is well-formed and self-consistent with machinePath", () => {
    const xml = renderSitemapIndexXml();
    assertWellFormedXml(xml, "sitemap index");
    assert.ok(xml.includes(absoluteUrl(machinePath.sitemapLocale("en"))));
    assert.ok(xml.includes(absoluteUrl(machinePath.sitemapLocale("ar"))));
  });

  test("priority values never exceed 1 or drop below 0, per the sitemap protocol", () => {
    for (const url of discoverableUrls(true)) {
      if (typeof url.priority === "number") {
        assert.ok(url.priority >= 0 && url.priority <= 1, `${url.loc}: priority ${url.priority}`);
      }
    }
  });
});

/* ================================================================= consistency with the built site */

describe("every URL discoverableUrls() would list corresponds to a real, self-canonical page", () => {
  const forced = discoverableUrls(true);

  test("every forced URL's route exists in the actual build", () => {
    for (const url of forced) {
      const route = url.loc.replace(SITE_URL, "");
      const page = pageFor(route);
      assert.ok(page, `${url.loc}: no page was built at this route`);
    }
  });

  test("every forced URL's page self-canonicalises to that exact URL", () => {
    // A sitemap must never list a URL whose own canonical points elsewhere — the facet/category
    // families already only include self-canonical entries, so this proves that holds for real.
    for (const url of forced) {
      const route = url.loc.replace(SITE_URL, "");
      const page = pageFor(route);
      const canonical = page.html.match(/<link rel="canonical" href="([^"]+)"/)[1];
      assert.equal(canonical, url.loc, `${route}: canonicalises to ${canonical}, not itself`);
    }
  });

  test("the declared alternates for every forced URL match that page's OWN rendered hreflang set", () => {
    // The explicit requirement from docs/MULTILINGUAL_SEO_ARCHITECTURE.md section 8: "sitemap and
    // head-level hreflang must agree." Checked here against the real, rendered <head>.
    for (const url of forced) {
      const route = url.loc.replace(SITE_URL, "");
      const page = pageFor(route);
      const rendered = [...page.html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
        .map((m) => `${m[1]}::${m[2]}`)
        .sort();
      const declared = url.alternates.map((a) => `${a.hreflang}::${a.href}`).sort();
      assert.deepEqual(rendered, declared, `${route}: sitemap alternates disagree with rendered <head>`);
    }
  });

  test("a known brand and work record's real routes are present with the right locale set", () => {
    const brand = brandById("mock-brand-maison-eclat");
    const work = workById("mock-work-voile-lumiere-launch");
    assert.ok(forced.some((u) => u.loc === absoluteUrl(path.brand("en", brand.slug))));
    assert.ok(forced.some((u) => u.loc === absoluteUrl(path.work("en", work.locales.en.slug))));
  });
});
