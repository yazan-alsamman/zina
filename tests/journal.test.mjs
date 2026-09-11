/**
 * JOURNAL TESTS — routing, taxonomy, gates, MDX bodies and the link graph.
 *
 * The Journal is the third surface of one editorial system. These tests exist mainly to guard the
 * relationship between the three: an article that does not point at the records evidencing it is
 * a blog post, and the whole Phase 6 argument is that this is not a blog.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  JOURNAL_CATEGORY_GATE,
  articleBrands,
  articleReviews,
  articleSiblings,
  articleStages,
  articlesCitingReview,
  articlesForStage,
  featuredArticle,
  indexableJournalCategories,
  journalCategories,
  journalCategory,
  journalForReview,
  readingTime,
} from "../src/lib/journal.ts";
import { categoryLabel, hasCategoryLabel } from "../src/lib/journal-labels.ts";
import { journalArticles, journalById, relatedJournal, reviews, site } from "../src/lib/content.ts";
import { alternatesFor, localeSlugPaths, path, switcherTarget } from "../src/lib/routing.ts";

/* ================================================================= locale */

describe("journal locale availability", () => {
  test("each locale holds five of the six articles", () => {
    assert.equal(journalArticles("en").length, 5);
    assert.equal(journalArticles("ar").length, 5);
  });

  test("the English-only article has no Arabic version", () => {
    const record = journalById("mock-journal-understanding-finish-and-texture");
    assert.ok(record);
    assert.ok(record.locales.en);
    assert.equal(record.locales.ar, undefined);
  });

  test("the Arabic-original article has no English version", () => {
    // Its subject is the gap between Arabic and English shade vocabulary. An English version
    // would be a different article, not a translation — which is the point.
    const record = journalById("mock-journal-arabic-shade-vocabulary");
    assert.ok(record);
    assert.ok(record.locales.ar);
    assert.equal(record.locales.en, undefined);
  });
});

describe("journal route generation", () => {
  const all = [...journalArticles("en"), ...journalArticles("ar")];
  const unique = Array.from(new Map(all.map((a) => [a.id, a])).values());
  const paths = localeSlugPaths(unique);

  test("six records generate TEN routes, not twelve", () => {
    assert.equal(paths.length, 10);
  });

  test("no route is generated for a missing translation", () => {
    const ar = paths.filter((p) => p.params.locale === "ar").map((p) => p.params.slug);
    const en = paths.filter((p) => p.params.locale === "en").map((p) => p.params.slug);
    assert.ok(!ar.includes("understanding-finish-and-texture"));
    assert.ok(!en.includes("mufradat-darajat-albashara"));
  });

  test("a locale block may carry its OWN slug, and the route follows it", () => {
    // The Arabic-original article is the only record whose Arabic slug differs from any English
    // one — it has no English version at all, and its slug is transliterated Arabic. The rest of
    // the corpus reuses one slug across both locales. BOTH are legal: the slug is a property of
    // the locale block, so the route layer must never derive an Arabic path from an English slug.
    const arabicOriginal = journalById("mock-journal-arabic-shade-vocabulary");
    assert.equal(arabicOriginal.locales.ar.slug, "mufradat-darajat-albashara");
    assert.equal(
      path.journal("ar", arabicOriginal.locales.ar.slug),
      "/ar/journal/mufradat-darajat-albashara/"
    );

    for (const article of journalArticles("ar")) {
      const block = article.locales.ar;
      assert.equal(
        path.journal("ar", block.slug),
        `/ar/journal/${block.slug}/`,
        `${article.id}: the Arabic route must be built from the Arabic block's own slug`
      );
    }
  });

  test("every generated route has content in its own locale", () => {
    for (const entry of paths) {
      const block = entry.props.record.locales[entry.params.locale];
      assert.ok(block, `${entry.params.locale}/${entry.params.slug} has no locale content`);
      assert.equal(block.slug, entry.params.slug);
    }
  });
});

describe("journal hreflang and the switcher", () => {
  test("a bilingual article emits en, ar and x-default", () => {
    const record = journalById("mock-journal-how-to-evaluate-foundation-performance");
    const langs = alternatesFor(record, (l, s) => path.journal(l, s)).map((a) => a.hreflang).sort();
    assert.deepEqual(langs, ["ar", "en", "x-default"]);
  });

  test("a single-locale article emits NO alternate for the missing locale", () => {
    const record = journalById("mock-journal-understanding-finish-and-texture");
    const langs = alternatesFor(record, (l, s) => path.journal(l, s)).map((a) => a.hreflang).sort();
    assert.deepEqual(langs, ["en", "x-default"]);
  });

  test("all three switcher states behave", () => {
    const bilingual = journalById("mock-journal-how-to-evaluate-foundation-performance");
    const counterpart = switcherTarget("ar", bilingual, (l, s) => path.journal(l, s), path.journalIndex, true);
    assert.equal(counterpart.state, "counterpart");
    // Derived from the record, not hardcoded: the switcher's job is to route to whatever slug the
    // Arabic block declares. Asserting a literal here would test the mock content instead.
    assert.equal(counterpart.href, path.journal("ar", bilingual.locales.ar.slug));
    assert.ok(counterpart.href.startsWith("/ar/journal/"));

    const englishOnly = journalById("mock-journal-understanding-finish-and-texture");
    const fallback = switcherTarget("ar", englishOnly, (l, s) => path.journal(l, s), path.journalIndex, true);
    assert.equal(fallback.state, "section-fallback");
    assert.equal(fallback.href, "/ar/journal/");
    assert.equal(fallback.explanationKey, "no-counterpart");

    const empty = switcherTarget("ar", englishOnly, (l, s) => path.journal(l, s), path.journalIndex, false);
    assert.equal(empty.state, "home-fallback");
    assert.equal(empty.href, "/ar/");
  });
});

/* ================================================================= taxonomy */

describe("the taxonomy is an EDITORIAL FORMAT taxonomy", () => {
  test("categories are derived from content, never hardcoded", () => {
    const keys = journalCategories("en").map((c) => c.key).sort();
    assert.deepEqual(keys, ["comparisons", "essays", "guides", "testing-notes"]);
  });

  test("journal formats and review product categories share NO value", () => {
    // The single most consequential journal decision (Phase 1 D-3). Two taxonomies over one
    // subject would create competing URL sets for the same queries.
    const formats = new Set(journalCategories("en").map((c) => c.key));
    const productCategories = new Set(
      reviews("en").map((r) => r.entity.category.toLowerCase())
    );
    for (const format of formats) {
      assert.ok(!productCategories.has(format), `"${format}" appears in both taxonomies`);
    }
  });

  test("every category key has a real label in both locales", () => {
    for (const locale of ["en", "ar"]) {
      for (const category of journalCategories(locale)) {
        assert.ok(hasCategoryLabel(category.key), `no label mapping for "${category.key}"`);
        const label = categoryLabel(locale, category.key);
        assert.notEqual(label, category.key, `${locale}: "${category.key}" fell back to its key`);
      }
    }
  });

  test("category segments are reserved, so an article slug can never collide", () => {
    const reserved = site().reservedSlugs["journal"] ?? [];
    for (const locale of ["en", "ar"]) {
      for (const category of journalCategories(locale)) {
        assert.ok(reserved.includes(category.key), `"${category.key}" is not reserved`);
      }
      for (const article of journalArticles(locale)) {
        assert.ok(!reserved.includes(article.locales[locale].slug));
      }
    }
  });
});

describe("thin-page gate — existence is not indexability", () => {
  test("the gate is Phase 1's, unchanged", () => {
    assert.equal(JOURNAL_CATEGORY_GATE, 3);
  });

  test("NO format qualifies for indexation in either locale", () => {
    for (const locale of ["en", "ar"]) {
      for (const category of journalCategories(locale)) {
        assert.ok(category.count < JOURNAL_CATEGORY_GATE, `${category.key}/${locale} has ${category.count}`);
        assert.equal(category.indexable, false);
      }
      assert.deepEqual(indexableJournalCategories(locale), []);
    }
  });

  test("guides holds two — the first format that will activate", () => {
    assert.equal(journalCategory("en", "guides").count, 2);
    assert.equal(journalCategory("ar", "guides").count, 2);
  });

  test("category counts sum to the locale's article count", () => {
    for (const locale of ["en", "ar"]) {
      const total = journalCategories(locale).reduce((sum, c) => sum + c.count, 0);
      assert.equal(total, journalArticles(locale).length);
    }
  });
});

/* ================================================================= relationships */

describe("review <-> journal linking, derived from the content model", () => {
  test("every article cites at least one review available in its own locale", () => {
    // Phase 1 marks this link mandatory: an article that asserts without citing competes with
    // every other beauty blog on the same query and has nothing they do not.
    for (const locale of ["en", "ar"]) {
      for (const article of journalArticles(locale)) {
        const cited = articleReviews(article, locale);
        assert.ok(cited.length > 0, `${article.id}/${locale} cites no available review`);
      }
    }
  });

  test("a cited review always exists in the citing article's locale", () => {
    for (const locale of ["en", "ar"]) {
      for (const article of journalArticles(locale)) {
        for (const review of articleReviews(article, locale)) {
          assert.ok(review.locales[locale], `${article.id} -> ${review.id} missing in ${locale}`);
        }
      }
    }
  });

  test("sibling articles are locale-filtered and never self-referential", () => {
    for (const locale of ["en", "ar"]) {
      for (const article of journalArticles(locale)) {
        for (const sibling of articleSiblings(article, locale)) {
          assert.ok(sibling.locales[locale], `${article.id} -> ${sibling.id} missing in ${locale}`);
          assert.notEqual(sibling.id, article.id, "an article links to itself");
        }
      }
    }
  });

  test("the reverse direction agrees with the forward one", () => {
    for (const locale of ["en", "ar"]) {
      for (const review of reviews(locale)) {
        for (const article of articlesCitingReview(review.id, locale)) {
          const forward = articleReviews(article, locale).map((r) => r.id);
          assert.ok(forward.includes(review.id), "forward and reverse relationships disagree");
        }
      }
    }
  });

  test("the review side surfaces EVERY article that cites it — citation is the floor", () => {
    // Two stored relationships exist: the article's `reviewIds` (a citation) and the review's
    // `journalIds` (an editorial curation). They disagreed in four places. Curation may ADD to
    // what a review page shows; it must never subtract a real citation, or the record hides a
    // piece of the evidence that rests on it.
    for (const locale of ["en", "ar"]) {
      for (const review of reviews(locale)) {
        const shown = journalForReview(review.id, relatedJournal(review, locale), locale).map((a) => a.id);
        for (const citing of articlesCitingReview(review.id, locale)) {
          assert.ok(
            shown.includes(citing.id),
            `${locale}: ${review.id} does not surface ${citing.id}, which cites it`
          );
        }
        assert.equal(new Set(shown).size, shown.length, `${review.id}: an article is listed twice`);
      }
    }
  });

  test("curation can add further reading, but citations come first", () => {
    for (const locale of ["en", "ar"]) {
      for (const review of reviews(locale)) {
        const citing = articlesCitingReview(review.id, locale).map((a) => a.id);
        const shown = journalForReview(review.id, relatedJournal(review, locale), locale).map((a) => a.id);
        assert.deepEqual(
          shown.slice(0, citing.length),
          citing,
          `${locale}/${review.id}: citing articles are not ordered first`
        );
      }
    }
  });

  test("a GATED brand is never exposed by an article", () => {
    // Terra Sana is gated in both locales; Veloura is gated in Arabic.
    for (const locale of ["en", "ar"]) {
      for (const article of journalArticles(locale)) {
        for (const brand of articleBrands(article, locale)) {
          assert.notEqual(brand.slug, "terra-sana", `${article.id} exposes a gated brand`);
          if (locale === "ar") assert.notEqual(brand.slug, "veloura-beauty");
        }
      }
    }
  });

  test("method stage keys resolve, tying the journal to the Method", () => {
    const valid = new Set(["baseline", "application", "wear-window", "conditions", "comparison", "revisit"]);
    for (const locale of ["en", "ar"]) {
      for (const article of journalArticles(locale)) {
        const stages = articleStages(article);
        assert.ok(stages.length > 0, `${article.id} explains no method stage`);
        for (const stage of stages) assert.ok(valid.has(stage), `unknown stage "${stage}"`);
      }
    }
  });

  test("articlesForStage finds articles from the stage side", () => {
    assert.ok(articlesForStage("conditions", "en").length > 0);
  });
});

/* ================================================================= honesty */

describe("nothing is fabricated", () => {
  test("reading time is only reported when the record carries one", () => {
    for (const locale of ["en", "ar"]) {
      for (const article of journalArticles(locale)) {
        const minutes = readingTime(article);
        if (minutes !== undefined) {
          assert.equal(minutes, article.readingTimeMinutes);
          assert.ok(minutes > 0);
        }
      }
    }
  });

  test("no article carries a rating, score, popularity or engagement field", () => {
    const forbidden = ["rating", "score", "stars", "views", "likes", "shares", "popularity", "trending"];
    for (const article of journalArticles("en").concat(journalArticles("ar"))) {
      const json = JSON.stringify(article);
      for (const field of forbidden) {
        assert.ok(!new RegExp(`"${field}"\\s*:`).test(json), `${article.id} has "${field}"`);
      }
    }
  });

  test("emphasis is an editorial flag, not a popularity claim", () => {
    for (const locale of ["en", "ar"]) {
      const featured = featuredArticle(locale);
      if (featured) assert.equal(featured.featured, true);
    }
  });
});
