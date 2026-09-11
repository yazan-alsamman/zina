/**
 * FACET ARCHITECTURE TESTS
 *
 * The crawlable-URL gate (R-15) and the thin-page gate. These guard the single largest
 * architectural decision in Phase 5: that discovery works with JavaScript disabled, and that a
 * URL existing is never the same as a URL being indexable.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  BRAND_SEGMENT,
  CATEGORY_INDEX_GATE,
  brandDestination,
  brandFacet,
  brandFacets,
  categoryFacet,
  categoryFacets,
  categorySlug,
  facetIndexing,
  indexableFacetPaths,
  reservedReviewSegments,
} from "../src/lib/facets.ts";
import { brandById, reviews } from "../src/lib/content.ts";
import { path } from "../src/lib/routing.ts";

describe("category facets — derived from real records, per locale", () => {
  test("every category facet contains only reviews from its own locale", () => {
    for (const locale of ["en", "ar"]) {
      for (const facet of categoryFacets(locale)) {
        for (const review of facet.reviews) {
          assert.ok(review.locales[locale], `${facet.slug}/${locale} holds a foreign-locale record`);
          assert.equal(review.entity.category, facet.category);
        }
      }
    }
  });

  test("facet counts sum to the locale's review count", () => {
    for (const locale of ["en", "ar"]) {
      const total = categoryFacets(locale).reduce((sum, f) => sum + f.count, 0);
      assert.equal(total, reviews(locale).length);
    }
  });

  test("the locales genuinely differ — this is not a mirrored taxonomy", () => {
    const en = categoryFacets("en").map((f) => f.slug);
    const ar = categoryFacets("ar").map((f) => f.slug);
    // English has Lip (the English-only review); Arabic has Moisturizer (the Arabic-original).
    assert.ok(en.includes("lip"), "expected a Lip facet in English");
    assert.ok(!ar.includes("lip"), "Arabic must not inherit a category it has no records for");
    assert.ok(ar.includes("moisturizer"), "expected a Moisturizer facet in Arabic");
    assert.ok(!en.includes("moisturizer"), "English must not inherit an Arabic-only category");
  });
});

describe("slug safety — a facet segment can never collide with a review slug", () => {
  test("every category slug is declared in site.json reservedSlugs.reviews", () => {
    const reserved = reservedReviewSegments();
    for (const locale of ["en", "ar"]) {
      for (const facet of categoryFacets(locale)) {
        assert.ok(
          reserved.includes(facet.slug),
          `category "${facet.slug}" is not reserved — a review slug could collide with it`
        );
      }
    }
  });

  test("no review slug collides with a category segment", () => {
    const reserved = reservedReviewSegments();
    for (const locale of ["en", "ar"]) {
      for (const review of reviews(locale)) {
        assert.ok(!reserved.includes(review.locales[locale].slug));
      }
    }
  });

  test("no category slugifies to the brand path segment", () => {
    for (const locale of ["en", "ar"]) {
      for (const facet of categoryFacets(locale)) {
        assert.notEqual(facet.slug, BRAND_SEGMENT, "a category named 'brand' would shadow the brand facet");
      }
    }
  });

  test("no brand slug collides with a category segment", () => {
    const reserved = reservedReviewSegments();
    for (const locale of ["en", "ar"]) {
      for (const facet of brandFacets(locale)) {
        assert.ok(!reserved.includes(facet.slug));
      }
    }
  });
});

describe("thin-page gates — existence is not indexability", () => {
  test("the gate is Phase 1's, unchanged", () => {
    assert.equal(CATEGORY_INDEX_GATE, 5);
  });

  test("NO category qualifies for indexation today — each holds one review per locale", () => {
    for (const locale of ["en", "ar"]) {
      for (const facet of categoryFacets(locale)) {
        assert.equal(facet.count, 1, `${facet.slug}/${locale} unexpectedly holds ${facet.count}`);
        assert.equal(facet.indexable, false);
      }
    }
  });

  test("a gated category is noindex AND canonicalises to the index", () => {
    const facet = categoryFacet("en", "foundation");
    const indexing = facetIndexing(facet, path.reviewsByCategory("en", "foundation"), path.reviewsIndex("en"), "category");
    assert.equal(indexing.robots, "noindex, follow");
    assert.equal(indexing.canonicalPath, "/en/reviews/");
    assert.match(indexing.reason, /below the Phase 1 minimum/);
  });

  test("a category that passed the gate would be indexable AND self-canonical", () => {
    // The rule, exercised against a synthetic facet — the corpus cannot reach it yet.
    const indexing = facetIndexing(
      { indexable: true, count: 7 },
      "/en/reviews/foundation/",
      "/en/reviews/",
      "category"
    );
    assert.equal(indexing.robots, "index, follow");
    assert.equal(indexing.canonicalPath, "/en/reviews/foundation/");
  });

  test("robots and canonical can never disagree", () => {
    for (const locale of ["en", "ar"]) {
      for (const facet of categoryFacets(locale)) {
        const self = path.reviewsByCategory(locale, facet.slug);
        const indexing = facetIndexing(facet, self, path.reviewsIndex(locale), "category");
        const selfCanonical = indexing.canonicalPath === self;
        const indexable = indexing.robots.startsWith("index");
        assert.equal(indexable, selfCanonical, `${facet.slug}/${locale}: incoherent indexing`);
      }
    }
  });

  test("no facet is currently eligible for a sitemap", () => {
    for (const locale of ["en", "ar"]) {
      assert.deepEqual(indexableFacetPaths(locale, path.reviewsByCategory), []);
    }
  });
});

describe("brand facets — permanently navigation-only", () => {
  test("brand facets are never indexable, at any count", () => {
    for (const locale of ["en", "ar"]) {
      for (const facet of brandFacets(locale)) {
        assert.equal(facet.indexable, false);
        const indexing = facetIndexing(facet, path.reviewsByBrand(locale, facet.slug), path.reviewsIndex(locale), "brand");
        assert.equal(indexing.robots, "noindex, follow");
        assert.equal(indexing.canonicalPath, path.reviewsIndex(locale));
      }
    }
  });

  test("Veloura has two English reviews and one Arabic — the facet reflects the corpus", () => {
    assert.equal(brandFacet("en", "veloura-beauty").count, 2);
    assert.equal(brandFacet("ar", "veloura-beauty").count, 1);
  });

  test("Terra Sana has an Arabic facet and NO English facet", () => {
    assert.ok(brandFacet("ar", "terra-sana"), "expected an Arabic Terra Sana facet");
    assert.equal(brandFacet("en", "terra-sana"), undefined);
  });
});

describe("brandDestination — one helper, so no template can get R-14 wrong", () => {
  /*
   * PHASE 7 TRANSITION. The brand entity template now exists, so this helper's first branch is
   * live for the first time. Phase 5 asserted the opposite — that it must NEVER point at
   * /brands/{slug}/ — because the template was unbuilt and doing so produced a 404.
   *
   * The rule itself never changed: link to the entity when the gate passes AND the template
   * exists; otherwise fall back to the facet. Only the second condition flipped. Both branches are
   * asserted below so neither can regress.
   */
  test("BRANCH 1 — gate passes and the template exists: the entity page is the destination", () => {
    const maison = brandById("mock-brand-maison-eclat");
    for (const locale of ["en", "ar"]) {
      assert.equal(brandDestination(maison, locale), path.brand(locale, "maison-eclat"));
    }
  });

  test("BRANCH 2 — the gate fails in this locale: the facet is the destination, never the entity", () => {
    // Veloura earns an English page and NOT an Arabic one: same record, different evidence.
    const veloura = brandById("mock-brand-veloura-beauty");
    assert.equal(brandDestination(veloura, "en"), path.brand("en", "veloura-beauty"));
    assert.equal(brandDestination(veloura, "ar"), path.reviewsByBrand("ar", "veloura-beauty"));
  });

  test("locale-specific existence is decided per locale, not per record", () => {
    // The asymmetry above is the whole reason the gate is evaluated per locale. If this ever
    // collapses to a single answer for both, a thin Arabic page ships or a good English one is
    // suppressed.
    const veloura = brandById("mock-brand-veloura-beauty");
    assert.notEqual(brandDestination(veloura, "en"), brandDestination(veloura, "ar"));
  });

  test("a gated brand resolves to its facet", () => {
    const terra = brandById("mock-brand-terra-sana");
    assert.equal(brandDestination(terra, "ar"), "/ar/reviews/brand/terra-sana/");
  });

  test("a brand with no records in this locale resolves to nothing at all", () => {
    const terra = brandById("mock-brand-terra-sana");
    assert.equal(brandDestination(terra, "en"), undefined);
  });

  test("an absent brand is undefined, not a broken URL", () => {
    assert.equal(brandDestination(undefined, "en"), undefined);
  });
});

describe("categorySlug", () => {
  test("lowercases the display-cased content value", () => {
    assert.equal(categorySlug("Foundation"), "foundation");
    assert.equal(categorySlug("Moisturizer"), "moisturizer");
  });
});
