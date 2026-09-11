/**
 * JOURNAL — categories, gates and content-derived relationships.
 *
 * PURE. No bundler APIs: the MDX body layer is `./journal-bodies.ts` so that everything here
 * stays importable by `node --test`. See that file's header for why the split exists.
 *
 * ============================================================================
 * THE TAXONOMY IS AN EDITORIAL FORMAT TAXONOMY
 * ============================================================================
 * Phase 1's most consequential journal decision (docs/JOURNAL_ARCHITECTURE.md section 1), and the
 * one most likely to be reversed by someone optimising a keyword in isolation:
 *
 *   REVIEWS are organised by PRODUCT CATEGORY   — what the thing is
 *   JOURNAL is organised by EDITORIAL FORMAT    — what the piece does
 *
 * `testing-notes` / `guides` / `comparisons` / `essays` are formats. They are NOT product
 * categories and must never be merged with the review facets. Running the same taxonomy twice
 * over one subject creates two competing URL sets for the same queries, splits internal-link
 * equity between them, and forces a reader to guess whether "foundation" means articles or
 * reviews.
 *
 * The category values are read from the CONTENT, never hardcoded in a template.
 */

import type { JournalArticle, Locale, MethodStageKey } from "../../content/schema/types.ts";
import {
  brandById,
  brandPassesGate,
  existsInLocale,
  isRenderable,
  journalArticles,
  journalById,
  reviewById,
  site,
} from "./content.ts";

/* ------------------------------------------------------------------ categories */

export interface JournalCategoryFacet {
  /** The canonical key from the content, e.g. "testing-notes". */
  key: string;
  locale: Locale;
  articles: JournalArticle[];
  count: number;
  /** Phase 1 gate: 3+ published articles in that category and locale. */
  indexable: boolean;
}

/**
 * THE PHASE 1 GATE, UNCHANGED. Not a new threshold.
 * docs/JOURNAL_ARCHITECTURE.md section 1: "A category route is generated when it holds 3 or more
 * published articles in that locale."
 */
export const JOURNAL_CATEGORY_GATE = 3;

/** Every category present in the content for this locale, derived — never a hardcoded list. */
export function journalCategories(locale: Locale): JournalCategoryFacet[] {
  const grouped = new Map<string, JournalArticle[]>();

  for (const article of journalArticles(locale)) {
    const key = article.category;
    const bucket = grouped.get(key);
    if (bucket) bucket.push(article);
    else grouped.set(key, [article]);
  }

  return [...grouped.entries()]
    .map(([key, articles]) => ({
      key,
      locale,
      articles,
      count: articles.length,
      indexable: articles.length >= JOURNAL_CATEGORY_GATE,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * The format segments reserved under /journal/, so an article slug can never collide with an
 * archive route. Mirrors `reservedReviewSegments()` — the same rule, the same source of truth.
 */
export const reservedJournalSegments = (): string[] => site().reservedSlugs["journal"] ?? [];

export const journalCategory = (locale: Locale, key: string): JournalCategoryFacet | undefined =>
  journalCategories(locale).find((c) => c.key === key);

/**
 * Categories eligible for a sitemap. Today: none, in either locale — the corpus holds at most two
 * articles per format. Phase 8 consumes this rather than re-deriving the rule.
 */
export const indexableJournalCategories = (locale: Locale): JournalCategoryFacet[] =>
  journalCategories(locale).filter((c) => c.indexable);

/* ------------------------------------------------------------------ the TOC gate */

/**
 * A TABLE OF CONTENTS IS NOT AUTOMATIC.
 *
 * docs/JOURNAL_ARCHITECTURE.md: an article earns navigation at 4+ sections. Below that, a TOC is
 * furniture — it repeats the article's own headings above the article, pushes the opening line
 * down the page, and gives a reader a decision to make where they should simply be reading.
 *
 * This lives here, as a named constant and a predicate, rather than as a `>= 4` in the template,
 * for one reason: the refusal path must be testable. Every article in the current corpus has four
 * or more sections, so a corpus-driven test can only ever observe the gate SAYING YES. A rule that
 * has never been seen to refuse is not a verified rule.
 */
export const TOC_SECTION_GATE = 4;

/** Whether an article with this many top-level sections earns a table of contents. */
export const earnsTableOfContents = (sectionCount: number): boolean =>
  sectionCount >= TOC_SECTION_GATE;

/* ------------------------------------------------------------------ bodies
 *
 * The MDX prose layer lives in `./journal-bodies.ts`, NOT here.
 *
 * It depends on `import.meta.glob`, a Vite compile-time transform that does not exist under plain
 * Node. Keeping it in this module would make every rule below it — taxonomy, gates, the link
 * graph — unimportable by `node --test`, for a reason unrelated to any of them.
 */

/* ------------------------------------------------------------------ relationships
 *
 * Every relationship is DERIVED FROM THE CANONICAL RECORD and filtered to what actually exists in
 * this locale. Nothing is invented, and a relationship whose target is unavailable renders as
 * nothing rather than as a dead link.
 */

/** Reviews this article evidences its claims with — the most valuable link on the page. */
export const articleReviews = (article: JournalArticle, locale: Locale) =>
  (article.related?.reviewIds ?? [])
    .map(reviewById)
    .filter((r) => Boolean(r) && isRenderable(r!) && existsInLocale(r!, locale))
    .map((r) => r!);

/** Sibling and pillar articles, locale-filtered, never self-referential. */
export const articleSiblings = (article: JournalArticle, locale: Locale) =>
  (article.related?.journalIds ?? [])
    .filter((id) => id !== article.id)
    .map(journalById)
    .filter((a) => Boolean(a) && isRenderable(a!) && existsInLocale(a!, locale))
    .map((a) => a!);

/**
 * Brands discussed — rendered ONLY where the per-locale brand gate passes.
 * A gated brand entity is never exposed (Phase 6 brief section 16).
 */
export const articleBrands = (article: JournalArticle, locale: Locale) =>
  (article.related?.brandIds ?? [])
    .map(brandById)
    .filter((b) => Boolean(b) && brandPassesGate(b!, locale))
    .map((b) => b!);

/** Method stages this article explains. Keys are internal and stable across locales. */
export const articleStages = (article: JournalArticle): MethodStageKey[] =>
  article.related?.methodStageKeys ?? [];

/**
 * REVIEW -> JOURNAL, the reverse direction.
 *
 * A review's own `related.journalIds` is the curated relationship. This is the derived
 * complement: articles that cite THIS review, in this locale. Both directions come from the same
 * data, so they cannot disagree.
 */
export const articlesCitingReview = (reviewId: string, locale: Locale): JournalArticle[] =>
  journalArticles(locale).filter((a) => (a.related?.reviewIds ?? []).includes(reviewId));

/**
 * EVERY article a review page should surface, in this locale.
 *
 * ============================================================================
 * WHY THIS IS A UNION AND NOT JUST THE CURATED LIST
 * ============================================================================
 * There are two stored relationships between reviews and articles, and they are NOT the same
 * statement:
 *
 *   article.related.reviewIds    the article's CITATION — "this piece rests on that record"
 *   review.related.journalIds    an editorial CURATION  — "further reading about this product"
 *
 * They were found to disagree in four places (see docs/JOURNAL_LINKING.md section 4). Curation
 * adding an article that does not cite the review is harmless under the heading "From the
 * Journal". The reverse is not: a review whose curated list omits an article that DOES cite it
 * hides a real piece of the evidence graph. In the Arabic corpus the Voile Lumiere record was
 * cited by `arabic-shade-vocabulary` and that article appeared nowhere on the record it rested on.
 *
 * So the citation direction is the FLOOR — every citing article is surfaced, always — and curation
 * may add to it but can never subtract from it. Deduplicated, and ordered citations-first because
 * a piece that cites the record is more relevant to a reader of that record than one that does
 * not.
 */
export const journalForReview = (
  reviewId: string,
  curated: JournalArticle[],
  locale: Locale
): JournalArticle[] => {
  const citing = articlesCitingReview(reviewId, locale);
  const seen = new Set(citing.map((a) => a.id));
  return [...citing, ...curated.filter((a) => !seen.has(a.id))];
};

/** Articles that explain a given method stage, in this locale. */
export const articlesForStage = (stage: MethodStageKey, locale: Locale): JournalArticle[] =>
  journalArticles(locale).filter((a) => (a.related?.methodStageKeys ?? []).includes(stage));

/* ------------------------------------------------------------------ reading time
 *
 * `readingTimeMinutes` is a field on the canonical record. It is rendered only when present —
 * never computed from a word count and presented as if it were authored, and never estimated.
 */
export const readingTime = (article: JournalArticle): number | undefined =>
  typeof article.readingTimeMinutes === "number" && article.readingTimeMinutes > 0
    ? article.readingTimeMinutes
    : undefined;

/* ------------------------------------------------------------------ featured
 *
 * `featured` is an editorial flag on the record. It is expressed by LAYOUT WEIGHT — more space —
 * never by a badge, a "trending" label, or any popularity claim.
 */
export const featuredArticle = (locale: Locale): JournalArticle | undefined =>
  journalArticles(locale).find((a) => a.featured);
