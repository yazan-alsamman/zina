/**
 * BRAND ENTITY TESTS — the gate, the relationship rule, and what must never appear.
 *
 * The brand page is the surface where this project is most likely to do real-world harm. It names
 * a company, describes a relationship with it, and links that to paid content. Most of these tests
 * assert ABSENCES, because on this page the dangerous failure is rendering something, not omitting
 * it.
 */

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  brandEntityExists,
  brandIsIndexable,
  brandJournal,
  brandReviews,
  brandsIn,
  disclosureTally,
  entityBrands,
  localeName,
  relationshipIsConfirmed,
  relationshipLabel,
} from "../src/lib/brand.ts";
import { brandById, brandPassesGate, reviews } from "../src/lib/content.ts";
import { brandDestination } from "../src/lib/facets.ts";
import { path } from "../src/lib/routing.ts";

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

const brandPages = () => pages.filter((p) => /^\/(en|ar)\/brands\/[^/]+\/$/.test(p.route));
const routes = () => new Set(pages.map((p) => p.route));
const stripTags = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/* ================================================================= the gate */

describe("the brand gate decides route existence, per locale", () => {
  test("the gate is the content's own rule, not a new threshold", () => {
    // brands.json indexGate: (reviews >= 2) OR (reviews >= 1 AND work >= 1), AND a 120-char
    // original description, AND a logo.
    for (const locale of ["en", "ar"]) {
      for (const brand of brandsIn(locale)) {
        const reviewCount = brandReviews(brand, locale).length;
        const described = (brand.locales[locale]?.description ?? "").length >= 120;
        if (!described || !brand.logo?.src) {
          assert.equal(brandPassesGate(brand, locale), false, `${brand.slug}/${locale}`);
        }
        if (brandPassesGate(brand, locale)) {
          assert.ok(reviewCount >= 1, `${brand.slug}/${locale} passed with no records`);
        }
      }
    }
  });

  test("four brands earn a page in English, three in Arabic", () => {
    assert.equal(entityBrands("en").length, 4);
    assert.equal(entityBrands("ar").length, 3);
  });

  test("the SAME record can earn a page in one locale and not the other", () => {
    // The single most important property of this gate. Veloura has two English reviews and one
    // Arabic one: same company, different evidence, different answer.
    const veloura = brandById("mock-brand-veloura-beauty");
    assert.equal(brandEntityExists(veloura, "en"), true);
    assert.equal(brandEntityExists(veloura, "ar"), false);
  });

  test("a brand gated in BOTH locales has no page anywhere", () => {
    const terra = brandById("mock-brand-terra-sana");
    assert.equal(brandEntityExists(terra, "en"), false);
    assert.equal(brandEntityExists(terra, "ar"), false);
    for (const page of pages) {
      assert.ok(!page.route.includes("/brands/terra-sana/"), "a gated brand was built");
    }
  });

  test("exactly the gated set is built — seven entity pages, no more", () => {
    const built = brandPages().map((p) => p.route).sort();
    assert.deepEqual(built, [
      "/ar/brands/atelier-noor/",
      "/ar/brands/lune-skin/",
      "/ar/brands/maison-eclat/",
      "/en/brands/atelier-noor/",
      "/en/brands/lune-skin/",
      "/en/brands/maison-eclat/",
      "/en/brands/veloura-beauty/",
    ]);
  });

  test("route existence is not indexability — they are separate functions", () => {
    for (const locale of ["en", "ar"]) {
      for (const brand of entityBrands(locale)) {
        assert.equal(brandIsIndexable(brand, locale), true);
      }
    }
    // And in a mock build nothing is indexable regardless, which the output asserts.
    for (const page of brandPages()) {
      assert.ok(/<meta name="robots" content="[^"]*noindex/.test(page.html), page.route);
    }
  });
});

/* ================================================================= the facet transition */

describe("brandDestination — both branches, after the Phase 7 transition", () => {
  test("Case A — the brand entity exists: links resolve to it", () => {
    const maison = brandById("mock-brand-maison-eclat");
    for (const locale of ["en", "ar"]) {
      assert.equal(brandDestination(maison, locale), path.brand(locale, "maison-eclat"));
    }
  });

  test("Case B — the brand entity does NOT exist: links fall back to the facet, never 404", () => {
    const veloura = brandById("mock-brand-veloura-beauty");
    assert.equal(brandDestination(veloura, "ar"), path.reviewsByBrand("ar", "veloura-beauty"));

    const terra = brandById("mock-brand-terra-sana");
    assert.equal(brandDestination(terra, "ar"), path.reviewsByBrand("ar", "terra-sana"));
  });

  test("there is exactly ONE destination per brand per locale — no competing answers", () => {
    for (const locale of ["en", "ar"]) {
      for (const brand of brandsIn(locale)) {
        const destination = brandDestination(brand, locale);
        if (!destination) continue;
        const isEntity = destination === path.brand(locale, brand.slug);
        const isFacet = destination === path.reviewsByBrand(locale, brand.slug);
        assert.ok(isEntity !== isFacet, `${brand.slug}/${locale}: ambiguous destination`);
        assert.equal(isEntity, brandEntityExists(brand, locale));
      }
    }
  });

  test("every brand destination in the BUILD resolves to a real page", () => {
    const built = routes();
    for (const page of pages) {
      for (const href of [...page.html.matchAll(/href="(\/(?:en|ar)\/brands\/[^"]*)"/g)].map((m) => m[1])) {
        assert.ok(built.has(href), `${page.route} links to ${href}, which was not built`);
      }
    }
  });
});

/* ================================================================= the relationship gate */

describe("no unconfirmed relationship is ever described", () => {
  test("every brand in the corpus is UNCONFIRMED, so no label may render", () => {
    for (const locale of ["en", "ar"]) {
      for (const brand of brandsIn(locale)) {
        assert.equal(brand.relationship.status, "MOCK");
        assert.equal(relationshipLabel(brand), undefined, `${brand.slug} exposed a relationship`);
        assert.equal(relationshipIsConfirmed(brand), false);
      }
    }
  });

  test("no relationship TYPE is rendered where a relationship label would go", () => {
    // Scoped to the relationship band, which is the only place a label could legitimately appear.
    // A whole-page prose scan is the wrong check: the editorial description is ORIGINAL WRITING and
    // may use a word like "campaign" to describe documented work, which is a fact about the
    // archive rather than a claim about a commercial arrangement.
    const types = ["Campaign", "Editorial", "Product Testing", "UGC", "Beauty Feature"];
    for (const page of brandPages()) {
      const band = page.html.match(/<section class="terms"[\s\S]*?<\/section>/);
      assert.ok(band, `${page.route}: no relationship band`);
      const text = stripTags(band[0]);
      for (const type of types) {
        assert.ok(!text.includes(type), `${page.route}: rendered the unconfirmed type "${type}"`);
      }
    }
  });

  test("no softened relationship synonym appears anywhere on a brand page", () => {
    // These are worse than the raw type words: each asserts a commercial arrangement in friendlier
    // language, which is precisely the substitution the content model forbids.
    const synonyms = ["our partner", "brand partner", "partnered with", "in partnership with",
      "ambassador", "sponsored by us", "works with us", "our client", "proud to work"];
    for (const page of brandPages().filter((x) => x.route.startsWith("/en/"))) {
      const text = stripTags(page.html).toLowerCase();
      for (const phrase of synonyms) {
        assert.ok(!text.includes(phrase), `${page.route}: claims a relationship — "${phrase}"`);
      }
    }
  });

  test("the absence is STATED, not left as silence", () => {
    // A brand page with no relationship line reads as independence. Every page must say it.
    for (const page of brandPages()) {
      assert.ok(
        /class="relationship-unconfirmed"/.test(page.html),
        `${page.route}: does not state that the relationship is unconfirmed`
      );
    }
  });

  test("the DISCLOSURE tally is verbatim from each review, never merged or softened", () => {
    for (const locale of ["en", "ar"]) {
      for (const brand of entityBrands(locale)) {
        const tally = disclosureTally(brand, locale);
        const labels = brandReviews(brand, locale)
          .map((r) => r.locales[locale]?.disclosureLabel)
          .filter(Boolean);
        assert.equal(
          tally.reduce((sum, t) => sum + t.count, 0),
          labels.length,
          `${brand.slug}/${locale}: the tally lost a record`
        );
        for (const entry of tally) {
          assert.ok(labels.includes(entry.label), `${brand.slug}: invented label "${entry.label}"`);
        }
      }
    }
  });

  test("a paid relationship is never generalised into a neutral word", () => {
    const maison = pages.find((p) => p.route === "/en/brands/maison-eclat/");
    // Maison Eclat's one English record is a paid partnership. The page must say so.
    assert.ok(stripTags(maison.html).includes("Paid partnership"));
  });
});

/* ================================================================= no fabrication */

describe("a brand page states nothing the record cannot support", () => {
  test("no corporate-profile facts appear, even the ones on the record", () => {
    // foundedYear and originCountry ARE on the record and are deliberately not rendered.
    const forbidden = ["2011", "2019", "2020", "2017", "2015", "France", "United States",
      "United Kingdom", "Italy", "founded", "headquarters", "established in"];
    for (const page of brandPages().filter((p) => p.route.startsWith("/en/"))) {
      const text = stripTags(page.html);
      for (const word of forbidden) {
        assert.ok(!text.includes(word), `${page.route}: rendered "${word}"`);
      }
    }
  });

  test("no ethics, sustainability, clinical or dermatological claim", () => {
    const forbidden = ["cruelty-free", "vegan", "clinically", "dermatologist", "dermatologically",
      "hypoallergenic", "sustainable", "organic", "certified", "award", "clean beauty"];
    for (const page of brandPages()) {
      const text = stripTags(page.html).toLowerCase();
      for (const word of forbidden) {
        assert.ok(!text.includes(word), `${page.route}: made a "${word}" claim`);
      }
    }
  });

  test("no rating, score or ranking of any kind", () => {
    // Scoring vocabulary and scoring markup. Ordinary English such as "best known for" inside the
    // editorial description is prose, not a ranking, so the check targets the scored forms.
    for (const page of brandPages()) {
      const text = stripTags(page.html).toLowerCase();
      for (const phrase of ["rating", "score", "out of 10", "out of 5", "stars",
        "ranked", "our top", "the best brand", "#1"]) {
        assert.ok(!text.includes(phrase), `${page.route}: contains "${phrase}"`);
      }
      assert.ok(
        !/class="[^"]*(rating|score|stars|badge)/.test(page.html),
        `${page.route}: scoring markup`
      );
    }
  });

  test("no logo, no commerce control, no outbound brand URL", () => {
    // Scoped to the page's OWN content, excluding the shared site footer. Since Phase 9 the
    // footer carries one legitimate outbound link — Zina's own confirmed Instagram — on every
    // page site-wide; that is sitewide chrome, not brand-page content, and is asserted correct
    // elsewhere (tests/global.test.mjs, tests/trust.test.mjs). This test's job is the BRAND
    // PAGE'S OWN markup: it must never itself add a second outbound link, a logo, or a buy button.
    const ownContent = (html) => html.replace(/<footer[\s\S]*?<\/footer>/, "");

    for (const page of brandPages()) {
      const body = ownContent(page.html);
      assert.ok(!/<img[^>]+logo/i.test(body), `${page.route}: rendered a logo`);
      assert.ok(!/example\.com/.test(body), `${page.route}: linked the brand's own site`);

      // Commerce is a LINK or a CONTROL, not a word. "harder to shop online" is editorial prose in
      // the description, and is exactly the kind of observation this site exists to publish.
      assert.ok(!/<a[^>]+href="https?:\/\//.test(body), `${page.route}: outbound link`);
      assert.ok(!/<(button|form)\b/.test(body), `${page.route}: interactive commerce control`);
      assert.ok(
        !/add to (cart|bag)|buy now|shop now/i.test(stripTags(body)),
        `${page.route}: commerce call to action`
      );
    }
  });

  test("the brand's own marketing copy never appears — descriptions are original writing", () => {
    // The content model states it: `description` is "Original writing. Never the brand's own copy."
    // A CLAIM device on this page would mean a brand assertion was reproduced; there is none.
    for (const page of brandPages()) {
      assert.ok(!/class="[^"]*claim/.test(page.html), `${page.route}: rendered a brand claim device`);
    }
  });
});

/* ================================================================= relationships */

describe("brand relationships are derived, locale-correct and never dead", () => {
  test("every linked review exists, is published, and is in THIS locale", () => {
    const built = routes();
    for (const locale of ["en", "ar"]) {
      for (const brand of entityBrands(locale)) {
        for (const review of brandReviews(brand, locale)) {
          assert.ok(review.locales[locale], `${brand.slug}: ${review.id} missing in ${locale}`);
          assert.ok(built.has(path.review(locale, review.locales[locale].slug)));
        }
      }
    }
  });

  test("every linked article exists in this locale", () => {
    for (const locale of ["en", "ar"]) {
      for (const brand of entityBrands(locale)) {
        for (const article of brandJournal(brand, locale)) {
          assert.ok(article.locales[locale], `${brand.slug}: ${article.id} missing in ${locale}`);
        }
      }
    }
  });

  test("the brand page repeats no review fact of its own", () => {
    // It states only the title, date and disclosure — each read from the review record. If a
    // verdict, observation or condition ever appears here, there are two sources of truth.
    for (const page of brandPages()) {
      for (const device of ["verdict", "observation", "conditions", "plate"]) {
        assert.ok(
          !new RegExp(`class="[^"]*${device}`).test(page.html),
          `${page.route}: duplicated the review's ${device} device`
        );
      }
    }
  });

  test("a brand with records in one locale only lists that locale's records", () => {
    const veloura = brandById("mock-brand-veloura-beauty");
    assert.equal(brandReviews(veloura, "en").length, 2);
    assert.equal(brandReviews(veloura, "ar").length, 1);
  });
});

/* ================================================================= seo */

describe("brand SEO is minimal and honest", () => {
  test("BreadcrumbList only — no Organization, Brand, Product or rating schema", () => {
    for (const page of brandPages()) {
      const blocks = [...page.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map((m) => JSON.parse(m[1]));
      assert.equal(blocks.length, 1, `${page.route}: expected exactly one JSON-LD block`);
      assert.equal(blocks[0]["@type"], "BreadcrumbList");

      const json = JSON.stringify(blocks);
      for (const forbidden of ["Organization", '"Brand"', "Product", "aggregateRating",
        "reviewRating", "offers", "sameAs", "logo"]) {
        assert.ok(!json.includes(forbidden), `${page.route}: emitted ${forbidden}`);
      }
    }
  });

  test("every brand page has a unique title and description", () => {
    const titles = new Set();
    const descriptions = new Set();
    for (const page of brandPages()) {
      const title = page.html.match(/<title>([^<]*)<\/title>/)[1];
      const description = page.html.match(/<meta name="description" content="([^"]*)"/)[1];
      assert.ok(title.length > 0 && description.length > 0, page.route);
      titles.add(`${page.route.slice(1, 3)}:${title}`);
      descriptions.add(`${page.route.slice(1, 3)}:${description}`);
    }
    assert.equal(titles.size, brandPages().length, "two brand pages share a title");
    assert.equal(descriptions.size, brandPages().length, "two brand pages share a description");
  });

  test("hreflang follows the GATE, so it never advertises a suppressed page", () => {
    const alternateFor = (html, lang) =>
      new RegExp(`<link rel="alternate" hreflang="${lang}"`).test(html);

    const enVeloura = pages.find((p) => p.route === "/en/brands/veloura-beauty/");

    // Veloura has no Arabic page, so there must be no ar ALTERNATE pointing at one.
    //
    // The page does still carry hreflang="ar" on the language SWITCHER anchor, and that is
    // correct: the switcher sends the reader to the Arabic brands index with
    // data-switcher-state="section-fallback". A switcher link is navigation a reader chose; an
    // alternate is a claim to a search engine that a counterpart document exists. Only the second
    // would be false, which is why this asserts the link element rather than the attribute.
    assert.ok(!alternateFor(enVeloura.html, "ar"), "advertised an Arabic page the gate suppressed");
    assert.ok(
      /data-switcher-state="section-fallback"/.test(enVeloura.html),
      "the switcher did not fall back to the Arabic brands index"
    );

    const enMaison = pages.find((p) => p.route === "/en/brands/maison-eclat/");
    assert.ok(/hreflang="ar"[^>]+\/ar\/brands\/maison-eclat\//.test(enMaison.html));
  });

  test("each brand page self-canonicalises", () => {
    for (const page of brandPages()) {
      const canonical = page.html.match(/<link rel="canonical" href="([^"]+)"/)[1];
      assert.ok(canonical.endsWith(page.route), `${page.route}: canonical is ${canonical}`);
    }
  });
});
