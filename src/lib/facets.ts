/**
 * REVIEW FACETS — crawlable, server-rendered, statically generated.
 *
 * ============================================================================
 * THE CONTRADICTION THIS MODULE RESOLVES (decision D5-1)
 * ============================================================================
 *
 * Phase 1 (docs/SEO_URL_ARCHITECTURE.md section 5) staged the facet architecture:
 *
 *   today          /{loc}/reviews/?category=foundation   noindex, canonical -> /reviews/
 *   at 5+ reviews  /{loc}/reviews/{category}/            indexable, self-canonical
 *
 * That plan cannot be implemented in a static build. A query string is not a route: static
 * hosting serves `/{loc}/reviews/index.html` for `?category=foundation` and the filter does
 * nothing. The only way to make `?category=` work would be client-side filtering — which the
 * Phase 5 brief forbids, and which would leave the corpus reachable only through the sitemap
 * (risk R-15, the largest untested architectural decision carried out of Phase 3).
 *
 * RESOLUTION: the URL SHAPE Phase 1 reserved is adopted NOW, and the Phase 1 GATE is applied to
 * INDEXABILITY rather than to EXISTENCE.
 *
 *   /{loc}/reviews/{category}/   generated whenever the category has >=1 review in that locale
 *                                indexable ONLY when it passes the Phase 1 gate (>=5 in locale)
 *                                otherwise noindex, follow + canonical -> /{loc}/reviews/
 *
 * This is strictly better than the staged plan on Phase 1's own stated goal — "stable from six
 * reviews to five hundred". Promotion becomes a robots and canonical flip rather than a URL
 * migration with a 301 map. Nothing moves when the corpus grows.
 *
 * No threshold was invented. The gate is Phase 1's, unchanged: five published reviews in that
 * category and locale (`content/mock/site.json` routes[reviews.category].gateRule).
 *
 * ============================================================================
 * WHAT IS AND IS NOT A FACET
 * ============================================================================
 *
 *   CATEGORY   route, gate-governed indexability.  The primary taxonomy. Segments are already
 *              reserved in site.json reservedSlugs.reviews, so a review slug can never collide.
 *
 *   BRAND      route, PERMANENTLY noindex + canonical -> /{loc}/reviews/.
 *              It exists to make one existing link functional: a review whose brand fails the
 *              per-locale index gate links to "reviews of this brand", and before Phase 5 that
 *              link pointed at a query string that did nothing. The canonical brand surface is
 *              /{loc}/brands/{slug}/ when the gate passes; this is never a competitor for it.
 *
 *   DISCLOSURE NOT BUILT. Deliberately. The reader's actual need — "is this sponsored?" — is
 *              answered by the disclosure label on every entry in the index, which is stronger
 *              than a filter because it requires no interaction. A route family would add 6
 *              values x 2 locales of permanently-noindex pages that answer a question already
 *              answered in place. Documented in docs/FACET_URL_ARCHITECTURE.md.
 *
 * NO COMBINATIONS. There is no /reviews/{category}/{brand}/ and there will not be. Multi-facet
 * URLs are the classic crawl-budget sink and there is no reader need for them at any corpus size
 * this site will reach.
 */

import type { Brand, Locale, ProductCategory, Review } from "../../content/schema/types.ts";
import { brandById, brandPassesGate, reviews as reviewsIn, site } from "./content.ts";
import { isImplemented, path } from "./routing.ts";

/* ------------------------------------------------------------------ category slugs */

/**
 * ProductCategory values are display-cased in the content model ("Foundation"). The URL segment
 * is the lowercase form, and those segments are ALREADY RESERVED in site.json so a review slug
 * can never collide with a category. `assertNoSlugCollisions()` proves it at test time rather
 * than trusting it.
 */
export const categorySlug = (category: ProductCategory): string => category.toLowerCase();

/** The reserved segments, from the single source of truth. */
export const reservedReviewSegments = (): string[] => site().reservedSlugs["reviews"] ?? [];

/**
 * `brand` is a path segment in the brand facet, so no product category may slugify to it.
 * Asserted in tests/facets.test.mjs.
 */
export const BRAND_SEGMENT = "brand";

/* ------------------------------------------------------------------ category facets */

export interface CategoryFacet {
  category: ProductCategory;
  slug: string;
  locale: Locale;
  reviews: Review[];
  count: number;
  /** Phase 1 gate: >=5 published reviews in this category and locale. */
  indexable: boolean;
}

/** The Phase 1 gate, unchanged. Not a new threshold. */
export const CATEGORY_INDEX_GATE = 5;

export function categoryFacets(locale: Locale): CategoryFacet[] {
  const grouped = new Map<ProductCategory, Review[]>();

  for (const review of reviewsIn(locale)) {
    const category = review.entity.category;
    const bucket = grouped.get(category);
    if (bucket) bucket.push(review);
    else grouped.set(category, [review]);
  }

  return [...grouped.entries()]
    .map(([category, list]) => ({
      category,
      slug: categorySlug(category),
      locale,
      reviews: list,
      count: list.length,
      indexable: list.length >= CATEGORY_INDEX_GATE,
    }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export const categoryFacet = (
  locale: Locale,
  slug: string
): CategoryFacet | undefined => categoryFacets(locale).find((f) => f.slug === slug);

/* ------------------------------------------------------------------ brand facets */

export interface BrandFacet {
  brandId: string;
  slug: string;
  name: string;
  locale: Locale;
  reviews: Review[];
  count: number;
  /** Always false. See the module header. */
  indexable: false;
}

export function brandFacets(locale: Locale): BrandFacet[] {
  const grouped = new Map<string, Review[]>();

  for (const review of reviewsIn(locale)) {
    const id = review.entity.brandId;
    const bucket = grouped.get(id);
    if (bucket) bucket.push(review);
    else grouped.set(id, [review]);
  }

  return [...grouped.entries()]
    .map(([brandId, list]) => {
      const brand = brandById(brandId);
      return {
        brandId,
        slug: brand?.slug ?? brandId,
        name: brand?.locales?.[locale]?.name ?? brand?.slug ?? brandId,
        locale,
        reviews: list,
        count: list.length,
        indexable: false as const,
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export const brandFacet = (locale: Locale, slug: string): BrandFacet | undefined =>
  brandFacets(locale).find((f) => f.slug === slug);

/* ------------------------------------------------------------------ thin-page protection */

/**
 * A facet page is never indexable merely because a URL exists.
 *
 * Returns the robots directive and the canonical target for a facet, so the two can never
 * disagree — an indexable page that canonicalises elsewhere, or a noindex page that
 * self-canonicalises, are both incoherent and both easy to write by accident.
 */
export interface FacetIndexing {
  robots: string;
  /** Absolute-path canonical target. Self for indexable facets, the index for gated ones. */
  canonicalPath: string;
  reason: string;
}

export function facetIndexing(
  facet: { indexable: boolean; count: number },
  selfPath: string,
  indexPath: string,
  kind: "category" | "brand"
): FacetIndexing {
  if (kind === "brand") {
    return {
      robots: "noindex, follow",
      canonicalPath: indexPath,
      reason:
        "Brand facets are navigation only. The canonical brand surface is /brands/{slug}/ where the per-locale gate passes.",
    };
  }

  if (facet.indexable) {
    return {
      robots: "index, follow",
      canonicalPath: selfPath,
      reason: `Passes the Phase 1 gate: ${facet.count} reviews in this category and locale (minimum ${CATEGORY_INDEX_GATE}).`,
    };
  }

  return {
    robots: "noindex, follow",
    canonicalPath: indexPath,
    reason: `Thin: ${facet.count} review(s) in this category and locale, below the Phase 1 minimum of ${CATEGORY_INDEX_GATE}. Navigation only.`,
  };
}

/**
 * Facets that may appear in a sitemap. Today: none, because no category reaches five in either
 * locale. Phase 8 consumes this rather than re-deriving the rule.
 */
export const indexableFacetPaths = (
  locale: Locale,
  buildPath: (locale: Locale, slug: string) => string
): string[] =>
  categoryFacets(locale)
    .filter((f) => f.indexable)
    .map((f) => buildPath(locale, f.slug));


/* ------------------------------------------------------------------ brand destination */

/**
 * WHERE A BRAND NAME SHOULD LINK — resolved in ONE place, so no template can get it wrong.
 *
 * Two independent conditions, and both must hold before the brand page is the destination:
 *
 *   1. the per-locale index gate passes (risk R-14 — a gated brand has no page)
 *   2. the brand TEMPLATE is actually implemented (Phase 5 brief section 20 — do not link
 *      users into pages that do not exist yet)
 *
 * Condition 2 is new in Phase 5. Phase 4 linked to /brands/{slug}/ whenever the gate passed,
 * which produced a 404 because the brand template is not built. Falling back to the brand facet
 * keeps the link meaningful — it goes to that brand's reviews, which is what the reader wanted.
 */
export function brandDestination(brand: Brand | undefined, locale: Locale): string | undefined {
  if (!brand) return undefined;

  const gatePasses = brandPassesGate(brand, locale);
  const brandPageExists = gatePasses && isImplemented("brand");

  if (brandPageExists) {
    return path.brand(locale, brand.locales?.[locale]?.slug ?? brand.slug);
  }

  // The facet exists whenever the brand has at least one review in this locale.
  return brandFacet(locale, brand.slug) ? path.reviewsByBrand(locale, brand.slug) : undefined;
}
