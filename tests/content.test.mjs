/**
 * CONTENT AND ROUTING TESTS
 *
 * Locale availability, lifecycle enforcement, the per-locale brand gate, the four hard render
 * gates, and the rule that shapes the whole architecture:
 *
 *   A MISSING TRANSLATION PRODUCES NO ROUTE, NO HREFLANG AND NO STUB.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  brandById,
  brandPassesGate,
  canRenderFigure,
  canRenderRelationship,
  canRenderTestimonial,
  eligibleSocialProfiles,
  existsInLocale,
  isDisclosurePublishable,
  isPublishable,
  isRenderable,
  journalCategoryPassesGate,
  localesOf,
  navigation,
  relatedReviews,
  reviews,
  reviewBySlug,
  seoDefaults,
  site,
  verified,
  verifiedPress,
} from "../src/lib/content.ts";

import { alternatesFor, localeSlugPaths, path, switcherTarget } from "../src/lib/routing.ts";

describe("locale availability — derived from actual content, never assumed", () => {
  test("each locale lists five of the six reviews", () => {
    // Deliberately uneven coverage: one review is English-only, one is Arabic-original.
    // This is what makes missing-translation behaviour a TESTED state rather than a theory.
    assert.equal(reviews("en").length, 5);
    assert.equal(reviews("ar").length, 5);
  });

  test("the English-only review has no Arabic content", () => {
    const record = reviewBySlug("en", "veloura-velvet-hour-lip-cream");
    assert.ok(record, "expected the English-only review to exist in English");
    assert.equal(existsInLocale(record, "en"), true);
    assert.equal(existsInLocale(record, "ar"), false);
    assert.deepEqual(localesOf(record), ["en"]);
  });

  test("the Arabic-original review has no English content", () => {
    const record = reviewBySlug("ar", "terra-sana-verdure-cloud-balm");
    assert.ok(record, "expected the Arabic-original review to exist in Arabic");
    assert.equal(existsInLocale(record, "en"), false);
    assert.deepEqual(localesOf(record), ["ar"]);
  });
});

describe("route generation — no route for a missing translation", () => {
  const all = [...reviews("en"), ...reviews("ar")];
  const unique = Array.from(new Map(all.map((r) => [r.id, r])).values());
  const paths = localeSlugPaths(unique);

  test("six review records generate TEN routes, not twelve", () => {
    assert.equal(paths.length, 10);
  });

  test("no /ar/ route exists for the English-only review", () => {
    const arabic = paths.filter((p) => p.params.locale === "ar").map((p) => p.params.slug);
    assert.ok(!arabic.includes("veloura-velvet-hour-lip-cream"));
  });

  test("no /en/ route exists for the Arabic-original review", () => {
    const english = paths.filter((p) => p.params.locale === "en").map((p) => p.params.slug);
    assert.ok(!english.includes("terra-sana-verdure-cloud-balm"));
  });

  test("every generated route has content in its own locale", () => {
    for (const entry of paths) {
      const block = entry.props.record.locales[entry.params.locale];
      assert.ok(block, `route ${entry.params.locale}/${entry.params.slug} has no locale content`);
      assert.equal(block.slug, entry.params.slug);
    }
  });
});

describe("hreflang — reciprocal or nothing", () => {
  test("a bilingual record emits en, ar and x-default", () => {
    const record = reviewBySlug("en", "maison-eclat-voile-lumiere-skin-tint");
    const alts = alternatesFor(record, (l, s) => path.review(l, s));
    const langs = alts.map((a) => a.hreflang).sort();
    assert.deepEqual(langs, ["ar", "en", "x-default"]);
  });

  test("a single-locale record emits NO alternate for the missing locale", () => {
    const record = reviewBySlug("en", "veloura-velvet-hour-lip-cream");
    const alts = alternatesFor(record, (l, s) => path.review(l, s));
    const langs = alts.map((a) => a.hreflang).sort();
    assert.deepEqual(langs, ["en", "x-default"]);
    assert.ok(!alts.some((a) => a.hreflang === "ar"), "must not claim an Arabic equivalent");
  });

  test("x-default points at English where English exists", () => {
    const record = reviewBySlug("en", "maison-eclat-voile-lumiere-skin-tint");
    const alts = alternatesFor(record, (l, s) => path.review(l, s));
    const xd = alts.find((a) => a.hreflang === "x-default");
    assert.ok(xd.href.includes("/en/"));
  });

  test("x-default points at the only version that exists when English does not", () => {
    const record = reviewBySlug("ar", "terra-sana-verdure-cloud-balm");
    const alts = alternatesFor(record, (l, s) => path.review(l, s));
    const xd = alts.find((a) => a.hreflang === "x-default");
    assert.ok(xd.href.includes("/ar/"));
  });

  test("every alternate is an absolute URL", () => {
    const record = reviewBySlug("en", "maison-eclat-voile-lumiere-skin-tint");
    for (const alt of alternatesFor(record, (l, s) => path.review(l, s))) {
      assert.ok(alt.href.startsWith("https://"), alt.href);
    }
  });
});

describe("the language switcher — it never links to a 404", () => {
  test("links directly to the counterpart when one exists", () => {
    const record = reviewBySlug("en", "maison-eclat-voile-lumiere-skin-tint");
    const target = switcherTarget("ar", record, (l, s) => path.review(l, s), path.reviewsIndex, true);
    assert.equal(target.state, "counterpart");
    assert.equal(target.href, "/ar/reviews/maison-eclat-voile-lumiere-skin-tint/");
  });

  test("falls back to the SECTION INDEX when there is no counterpart", () => {
    const record = reviewBySlug("en", "veloura-velvet-hour-lip-cream");
    const target = switcherTarget("ar", record, (l, s) => path.review(l, s), path.reviewsIndex, true);
    assert.equal(target.state, "section-fallback");
    assert.equal(target.href, "/ar/reviews/");
    assert.equal(target.explanationKey, "no-counterpart");
  });

  test("falls back to the locale home when the section is empty in the target locale", () => {
    const record = reviewBySlug("en", "veloura-velvet-hour-lip-cream");
    const target = switcherTarget("ar", record, (l, s) => path.review(l, s), path.reviewsIndex, false);
    assert.equal(target.state, "home-fallback");
    assert.equal(target.href, "/ar/");
  });
});

describe("lifecycle", () => {
  test("only published and archived are publishable", () => {
    assert.equal(isPublishable({ status: "published" }), true);
    assert.equal(isPublishable({ status: "archived" }), true);
    for (const status of ["mock", "draft", "review", "needs-verification", "approved"]) {
      assert.equal(isPublishable({ status }), false, `${status} must not be publishable`);
    }
  });

  test("draft never renders, in any build", () => {
    assert.equal(isRenderable({ status: "draft" }), false);
  });

  test("a disclosure pending verification is not publishable", () => {
    assert.equal(
      isDisclosurePublishable({ disclosure: { primary: "unknown-pending-verification" } }),
      false
    );
    assert.equal(isDisclosurePublishable({ disclosure: { primary: "gifted" } }), true);
  });
});

describe("the brand index gate — computed PER LOCALE", () => {
  test("Veloura passes in English and is GATED in Arabic", () => {
    // 2 English reviews; 1 Arabic review and 0 localised work. A real consequence propagating
    // correctly: the English-only case study is what gates the Arabic brand page.
    const veloura = brandById("mock-brand-veloura-beauty");
    assert.ok(veloura);
    assert.equal(brandPassesGate(veloura, "en"), true);
    assert.equal(brandPassesGate(veloura, "ar"), false);
  });

  test("Terra Sana is gated in BOTH locales", () => {
    const terra = brandById("mock-brand-terra-sana");
    assert.ok(terra);
    assert.equal(brandPassesGate(terra, "en"), false);
    assert.equal(brandPassesGate(terra, "ar"), false);
  });

  test("Maison Eclat passes in both locales", () => {
    const maison = brandById("mock-brand-maison-eclat");
    assert.ok(maison);
    assert.equal(brandPassesGate(maison, "en"), true);
    assert.equal(brandPassesGate(maison, "ar"), true);
  });
});

describe("journal category gate — 3 per locale, none qualifies today", () => {
  for (const category of ["testing-notes", "guides", "comparisons", "essays"]) {
    test(`${category} is gated in both locales`, () => {
      assert.equal(journalCategoryPassesGate(category, "en"), false);
      assert.equal(journalCategoryPassesGate(category, "ar"), false);
    });
  }
});

describe("the four hard render gates", () => {
  test("no social profile is sameAs-eligible, so the footer row does not exist", () => {
    assert.equal(eligibleSocialProfiles().length, 0);
  });

  test("no testimonial has an approval on file", () => {
    assert.equal(canRenderTestimonial({ approvalOnFile: false }), false);
    assert.equal(canRenderTestimonial({}), false);
  });

  test("no press item is verified, so press renders nothing", () => {
    assert.equal(verifiedPress().length, 0);
  });

  test("a brand relationship renders only when CONFIRMED", () => {
    assert.equal(canRenderRelationship({ relationship: { _verification: "MOCK" } }), false);
    assert.equal(canRenderRelationship({ relationship: { _verification: "CONFIRMED" } }), true);
  });

  test("a results figure needs a named written source AND confirmation", () => {
    assert.equal(canRenderFigure({ _verification: "CONFIRMED" }), false, "no source");
    assert.equal(canRenderFigure({ source: "client report", _verification: "MOCK" }), false);
    assert.equal(canRenderFigure({ source: "client report", _verification: "CONFIRMED" }), true);
  });

  test("an unverified VerifiableValue renders as nothing, never as a guess", () => {
    assert.equal(verified({ value: "Dubai, UAE", _verification: "MOCK" }), null);
    assert.equal(verified({ value: "Dubai, UAE", _verification: "CONFIRMED" }), "Dubai, UAE");
    assert.equal(verified(undefined), null);
  });
});

describe("related content — locale-filtered BEFORE the count is taken", () => {
  test("related reviews never cross locales", () => {
    for (const locale of ["en", "ar"]) {
      for (const review of reviews(locale)) {
        for (const related of relatedReviews(review, locale)) {
          assert.ok(
            related.locales[locale],
            `${review.id} links to ${related.id}, which has no ${locale} content`
          );
        }
      }
    }
  });
});

describe("site config shape — narrowed types must match the data", () => {
  test("navigation has five primary items, one CTA and three footer groups", () => {
    const nav = navigation();
    assert.equal(nav.primary.length, 5);
    assert.ok(nav.cta.label.en && nav.cta.label.ar);
    assert.equal(nav.footer.length, 3);
    for (const item of nav.primary) {
      assert.ok(item.label.en, `${item.key} missing English label`);
      assert.ok(item.label.ar, `${item.key} missing Arabic label`);
    }
  });

  test("seoDefaults carries both locales", () => {
    const seo = seoDefaults();
    for (const key of ["titleTemplate", "defaultTitle", "defaultDescription"]) {
      assert.ok(seo[key].en, `${key} missing en`);
      assert.ok(seo[key].ar, `${key} missing ar`);
    }
  });

  test("trailing slash policy is 'always', matching the router", () => {
    assert.equal(site().i18n.trailingSlash, "always");
    assert.equal(path.review("en", "x"), "/en/reviews/x/");
  });

  test("the root is a 302 negotiation, never a 301", () => {
    assert.equal(site().i18n.rootBehaviour, "redirect-302-by-accept-language");
  });
});

describe("no numeric ratings anywhere in the review corpus", () => {
  test("no review carries a rating, score or stars field", () => {
    const forbidden = ["rating", "ratingValue", "score", "stars"];
    for (const locale of ["en", "ar"]) {
      for (const review of reviews(locale)) {
        const json = JSON.stringify(review);
        for (const field of forbidden) {
          assert.ok(
            !new RegExp(`"${field}"\\s*:`).test(json),
            `${review.id} contains a "${field}" field`
          );
        }
      }
    }
  });
});
