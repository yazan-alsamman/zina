/**
 * BRAND ENTITY — relationships, gates and the disclosure rules that govern them.
 *
 * ============================================================================
 * WHAT A BRAND PAGE IS, AND WHAT IT MUST NEVER BECOME
 * ============================================================================
 * A brand page here is an EDITORIAL ENTITY PAGE. It answers one question:
 *
 *     what documented records involve this entity, and on what terms?
 *
 * It is not an advertisement, a storefront, a sponsorship page or a company profile. Nothing on
 * it may read as endorsement, and nothing may originate from the brand's own marketing.
 *
 * ============================================================================
 * THE RELATIONSHIP GATE — the trust-critical rule in this file
 * ============================================================================
 * `content/schema/types.ts` states it plainly:
 *
 *     "status must be CONFIRMED before any relationship label renders."
 *
 * Every brand in the mock corpus carries `relationship.status: "MOCK"`. Therefore NO relationship
 * label renders anywhere in this build — not "Campaign", not "Editorial", not "Product Testing",
 * and above all not a softened synonym like "partner" or "collaborator".
 *
 * This is deliberate and must stay deliberate. Describing an unverified commercial relationship
 * is the single most damaging thing this site could do: it would assert a business arrangement
 * with a company on that company's behalf. `relationshipLabel()` is the only way to read the
 * relationship type, and it returns `undefined` until someone confirms it in writing.
 */

import type { Brand, JournalArticle, Locale, Review, Work } from "../../content/schema/types.ts";
import {
  brandPassesGate,
  brands as brandCollection,
  journalArticles,
  reviews as reviewsIn,
  workProjects,
} from "./content.ts";
import { isImplemented } from "./routing.ts";

/* ------------------------------------------------------------------ the relationship gate */

/**
 * The brand relationship label, or `undefined` when it is not confirmed.
 *
 * Returns `undefined` for every brand in the current corpus, by design. A caller that wants to
 * show something in its place must show the ABSENCE honestly — never a guess, never a generic
 * "editorial relationship", never a blank that implies independence.
 */
export const relationshipLabel = (brand: Brand): string | undefined =>
  brand.relationship?.status === "CONFIRMED" && brand.relationship?._verification === "CONFIRMED"
    ? brand.relationship.type
    : undefined;

/** Whether ANY relationship claim may be made about this brand. */
export const relationshipIsConfirmed = (brand: Brand): boolean =>
  relationshipLabel(brand) !== undefined;

/* ------------------------------------------------------------------ entity existence */

/**
 * Whether a brand has a PAGE in this locale.
 *
 * Two conditions, both required — the same pair `brandDestination()` resolves, expressed once so
 * the page and the links that point at it can never disagree:
 *
 *   1. the per-locale index gate passes (brands.json `indexGate`)
 *   2. the brand template is implemented
 *
 * The gate is per-locale because review coverage differs by language: `veloura-beauty` earns a
 * page in English and not in Arabic, and that asymmetry is correct rather than a bug.
 */
export const brandEntityExists = (brand: Brand, locale: Locale): boolean =>
  brandPassesGate(brand, locale) && isImplemented("brand");

/** Brands with a page in this locale, ordered by their name in that locale. */
export const entityBrands = (locale: Locale): Brand[] =>
  brandsIn(locale)
    .filter((b) => brandPassesGate(b, locale))
    .sort((a, b) => localeName(a, locale).localeCompare(localeName(b, locale)));

/**
 * Every brand available in this locale, gated or not. `brands()` already applies the lifecycle
 * and locale filters, so this is a rename for readability at the call site rather than new logic.
 */
export const brandsIn = (locale: Locale): Brand[] => brandCollection(locale);

export const localeName = (brand: Brand, locale: Locale): string =>
  brand.locales?.[locale]?.name ?? brand.slug;

/* ------------------------------------------------------------------ relationships */

/**
 * BRAND -> REVIEWS, derived from `review.entity.brandId`.
 *
 * The brand page states NO review fact of its own: no product name, title, date, observation or
 * disclosure is copied here. Every one of those is read from the review record at render time, so
 * there is exactly one source of truth and the brand page cannot drift from the archive.
 */
export const brandReviews = (brand: Brand, locale: Locale): Review[] =>
  reviewsIn(locale)
    .filter((r) => r.entity.brandId === brand.id)
    .sort((a, b) => b.dates.publishedAt.localeCompare(a.dates.publishedAt));

/** BRAND -> WORK, locale-filtered. Only surfaced once the work template exists. */
export const brandWork = (brand: Brand, locale: Locale): Work[] =>
  isImplemented("work") ? workProjects(locale).filter((w) => w.brandId === brand.id) : [];

/**
 * BRAND -> JOURNAL. Articles that name this brand AND exist in this locale.
 *
 * Derived from `article.related.brandIds` — the same field `articleBrands()` reads in the other
 * direction, so the two can never disagree.
 */
export const brandJournal = (brand: Brand, locale: Locale): JournalArticle[] =>
  isImplemented("journal")
    ? journalArticles(locale).filter((a) => (a.related?.brandIds ?? []).includes(brand.id))
    : [];

/* ------------------------------------------------------------------ disclosure summary */

export interface DisclosureTally {
  /** The canonical disclosure label exactly as the review record states it. Never paraphrased. */
  label: string;
  count: number;
}

/**
 * How the records involving this brand were obtained, counted from the REVIEWS THEMSELVES.
 *
 * This is the honest answer to "what kind of relationship exists": not a claim about the
 * commercial arrangement (which is unconfirmed — see `relationshipLabel`), but a tally of how each
 * documented product actually came to be tested.
 *
 * Labels are taken verbatim from the review's own `disclosureLabel`. They are never merged,
 * softened or re-bucketed: "Paid partnership" and "Gifted, not paid" are different facts and a
 * combined "Partnership" count would erase the difference.
 */
export const disclosureTally = (brand: Brand, locale: Locale): DisclosureTally[] => {
  const counts = new Map<string, number>();
  for (const review of brandReviews(brand, locale)) {
    const label = review.locales[locale]?.disclosureLabel;
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};

/* ------------------------------------------------------------------ indexability */

/**
 * INDEXABILITY IS NOT ROUTE EXISTENCE.
 *
 * A brand page is generated when the gate passes; whether it may be INDEXED is a separate
 * question composed with the build-level gate, exactly as reviews, facets and journal archives
 * already do. `indexPolicy: "force-noindex"` on a record suppresses indexation without removing
 * the page.
 */
export const brandIsIndexable = (brand: Brand, locale: Locale): boolean =>
  brand.indexPolicy !== "force-noindex" && brandPassesGate(brand, locale);
