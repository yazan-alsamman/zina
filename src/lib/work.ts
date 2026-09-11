/**
 * WORK — documented professional and editorial engagements, and the Results Figure gate.
 *
 * ============================================================================
 * THE RESULTS FIGURE GATE — the reason this file exists
 * ============================================================================
 * `content/schema/types.ts` defines the rule exactly:
 *
 *     "A figure renders only when `source` names a written client-supplied origin AND
 *      `_verification` is CONFIRMED. An empty figures array is a valid, complete state."
 *
 * A performance figure is the most dangerous content type on this site. "1.2M views" is a claim
 * about a third party's commercial outcome, attributed to Zina's work, published under her name.
 * If it is wrong, it is wrong in a way that damages a client, misrepresents her results and cannot
 * be walked back. Numbers also LOOK authoritative in a way prose does not — a reader scanning a
 * page absorbs "61%" as a fact without reading the sentence around it.
 *
 * So the gate is deliberately two-part and deliberately strict:
 *
 *   1. `_verification === "CONFIRMED"` — someone verified it
 *   2. `source` names a real written origin — and can be pointed at
 *
 * Condition 2 exists because condition 1 is a flag anyone can set. A figure that claims to be
 * confirmed but cannot say WHERE it came from is not confirmed; it is asserted. The sentinels
 * below are the values that mean "no real source was recorded".
 *
 * ============================================================================
 * WHAT THE GATE DOES IN THE CURRENT BUILD
 * ============================================================================
 * Every figure in the mock corpus carries `_verification: "MOCK"` and `source: "MOCK"`, so ALL
 * FIVE ARE BLOCKED. Three of the four work records hold blocked figures; the fourth holds none.
 * Nothing renders a number, and no placeholder, empty chart or "data pending" element appears in
 * their place — an absent figure is a complete state, not a hole to fill.
 *
 * The ALLOWED branch therefore has no production fixture. It is exercised by synthetic fixtures in
 * `tests/work.test.mjs`, which never enter the content layer. That is the correct division: a test
 * may construct a confirmed figure to prove the gate opens; production content may not invent one
 * to make the page look richer.
 */

import type { Brand, JournalArticle, Locale, Review, Work } from "../../content/schema/types.ts";
import {
  brandById,
  journalArticles,
  reviews as reviewsIn,
  reviewById,
  workProjects,
} from "./content.ts";
import { brandEntityExists } from "./brand.ts";
import { isImplemented } from "./routing.ts";

/* ------------------------------------------------------------------ the results figure gate */

export type ResultsFigure = Work["results"]["figures"][number];

/**
 * Values of `source` that do NOT name a written origin.
 *
 * A verification sentinel in the source field means the field was never filled in — someone wrote
 * the status where the provenance belongs. An empty or whitespace string means the same thing.
 */
const SOURCE_SENTINELS = new Set(["", "MOCK", "CONFIRMED", "NEEDS_VERIFICATION", "TBD", "UNKNOWN"]);

/** Whether `source` names something a reader could actually be pointed at. */
export const hasWrittenSource = (figure: ResultsFigure): boolean => {
  const source = (figure.source ?? "").trim();
  return source.length > 0 && !SOURCE_SENTINELS.has(source.toUpperCase());
};

/**
 * THE GATE. Both conditions, in one place, used by every caller.
 *
 * There is no second implementation and no template-level shortcut: a page asks this function or
 * it does not render a figure.
 */
export const figureIsPublishable = (figure: ResultsFigure): boolean =>
  figure._verification === "CONFIRMED" && hasWrittenSource(figure);

/**
 * The figures a work record may actually publish.
 *
 * Note the record-level guard: `results.status` must itself be CONFIRMED. A confirmed figure
 * inside an unconfirmed result set is not publishable — the set is the unit someone signs off.
 */
export const publishableFigures = (work: Work): ResultsFigure[] =>
  work.results?.status === "CONFIRMED"
    ? (work.results.figures ?? []).filter(figureIsPublishable)
    : [];

/** Figures that exist in the record but are withheld. Used by tests and reporting, never rendered. */
export const blockedFigures = (work: Work): ResultsFigure[] => {
  const published = new Set(publishableFigures(work));
  return (work.results?.figures ?? []).filter((f) => !published.has(f));
};

/**
 * Which of the three states this record is in. Named so the report and the tests can speak about
 * them precisely rather than inferring from counts.
 *
 *   `allowed`  at least one figure passes and renders
 *   `blocked`  figures exist but none may be published — render NOTHING, not a placeholder
 *   `absent`   the record carries no figures at all — a valid, complete state
 */
export const resultsState = (work: Work): "allowed" | "blocked" | "absent" => {
  const all = work.results?.figures ?? [];
  if (all.length === 0) return "absent";
  return publishableFigures(work).length > 0 ? "allowed" : "blocked";
};

/* ------------------------------------------------------------------ relationships */

/** WORK -> REVIEWS, locale-filtered, never a dead link. */
export const workReviews = (work: Work, locale: Locale): Review[] =>
  (work.relatedReviewIds ?? [])
    .map(reviewById)
    .filter((r): r is Review => Boolean(r) && reviewsIn(locale).some((x) => x.id === r!.id));

/** WORK -> BRAND, but only where the brand actually has a page in this locale. */
export const workBrand = (work: Work, locale: Locale): Brand | undefined => {
  const brand = brandById(work.brandId);
  return brand && brandEntityExists(brand, locale) ? brand : undefined;
};

/** The brand record regardless of whether it has a page — for naming, never for linking. */
export const workBrandRecord = (work: Work): Brand | undefined => brandById(work.brandId);

/**
 * WORK -> JOURNAL, derived through the brand: articles that discuss the same brand in this locale.
 * There is no direct work→journal field in the schema, and inventing one would be a second
 * relationship store. This derives the edge instead of asserting it.
 */
export const workJournal = (work: Work, locale: Locale): JournalArticle[] =>
  isImplemented("journal")
    ? journalArticles(locale).filter((a) => (a.related?.brandIds ?? []).includes(work.brandId))
    : [];

/* ------------------------------------------------------------------ collection */

/** Work available in this locale, newest first. */
export const workIn = (locale: Locale): Work[] =>
  workProjects(locale).sort(
    (a, b) => b.year - a.year || (b.month ?? "").localeCompare(a.month ?? "")
  );

export const featuredWork = (locale: Locale): Work | undefined =>
  workIn(locale).find((w) => w.featured);
