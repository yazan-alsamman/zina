/**
 * SITEMAP — the discoverable-URL set, computed from the same gates every page already enforces.
 *
 * ============================================================================
 * THE EXISTING ARCHITECTURE THIS CONSUMES, RATHER THAN RE-DERIVES
 * ============================================================================
 * Every phase since 5 has left a note that Phase 8 would read from here:
 *
 *   src/lib/facets.ts   "Facets that may appear in a sitemap... Phase 8 consumes this rather
 *                        than re-deriving the rule." (indexableFacetPaths, facetIndexing)
 *   src/lib/journal.ts  "Categories eligible for a sitemap... Phase 8 consumes this rather than
 *                        re-deriving the rule." (indexableJournalCategories)
 *   docs/MULTILINGUAL_SEO_ARCHITECTURE.md section 8:
 *       /sitemap.xml          index
 *         /sitemap-en.xml     English URLs only
 *         /sitemap-ar.xml     Arabic URLs only
 *       "Each URL entry carries xhtml:link alternates matching the hreflang set EXACTLY.
 *        Sitemap and head-level hreflang must agree; a mismatch is a reliable way to have both
 *        ignored."
 *       "Only existing, indexable, publishable-status URLs appear. Gated brand pages, gated
 *        category pages, filter URLs, 404 and preview builds are all excluded by construction."
 *
 * This module is that consumer. It calls the exact same predicate functions each page template
 * calls: robotsContent, facetIndexing, brandIsIndexable, entityBrands, categoryFacets (.indexable),
 * journalCategories (.indexable) — so a page's own decision and the sitemap's decision cannot
 * structurally diverge. Nothing here is a second implementation of a gate; it is the same gate,
 * called from a second place.
 *
 * tests/sitemap.test.mjs additionally cross-validates the BUILT OUTPUT: it parses every page's
 * rendered canonical link and alternate-hreflang links from dist/ and asserts they agree with
 * what this module declares for the same URL — proving the "must agree" rule holds in practice,
 * not just by shared-function construction.
 *
 * ============================================================================
 * WHY THE CURRENT OUTPUT IS EMPTY, AND WHY THAT IS CORRECT
 * ============================================================================
 * IS_INDEXABLE_BUILD is false while the content source is mock. Composed into every branch below
 * exactly as every page composes it into its own robots meta tag, this means discoverableUrls()
 * returns an empty array today. That is not a placeholder or a bug: listing a URL in a sitemap
 * while that same page's own meta tag says noindex is a direct contradiction search engines warn
 * about explicitly. An empty, structurally-valid sitemap is the only honest output while nothing
 * on the site is indexable — the same "absence renders as an absence" rule that governs every
 * other Phase 6/7 surface.
 *
 * The mechanism is still fully exercised: tests/sitemap.test.mjs calls this module with an
 * OVERRIDE flag (indexableBuild: true) to prove every gate opens correctly, using the real mock
 * corpus (never synthetic data — there is nothing sensitive about a review or article existing,
 * only about presenting one as verified). The override never reaches the production endpoint,
 * which always calls this with the real IS_INDEXABLE_BUILD.
 */

import type { Locale } from "../../content/schema/types.ts";
import {
  IS_INDEXABLE_BUILD,
  journalArticles,
  method,
  person,
  reviews,
  site,
} from "./content.ts";
import { entityBrands, brandIsIndexable } from "./brand.ts";
import { workIn } from "./work.ts";
import { journalCategories } from "./journal.ts";
import { categoryFacets, facetIndexing } from "./facets.ts";
import { absoluteUrl, machinePath, path, type Alternate } from "./routing.ts";
import { escapeXml } from "./xml.ts";

const LOCALES: readonly Locale[] = ["en", "ar"] as const;
const otherOf = (l: Locale): Locale => (l === "en" ? "ar" : "en");

export interface SitemapUrl {
  loc: string;
  locale: Locale;
  /** Only present when a route family declares one in site.json -> routes. Never invented. */
  changefreq?: string;
  /** Only present when a route family declares one in site.json -> routes. Never invented. */
  priority?: number;
  /**
   * Only present when the record itself states a real date for THIS page. Omitted for every
   * structural/index page, because there is no single record whose date represents "this page
   * changed" — inventing one (e.g. the build timestamp) would be a fabricated freshness signal.
   */
  lastmod?: string;
  /** The full hreflang set this URL's own page declares in its head, x-default included. */
  alternates: Alternate[];
}

/** site.json -> routes[].priority/.changefreq, read live — never copied into this file. */
const routeMeta = (key: string): { priority?: number; changefreq?: string } => {
  const def = site().routes.find((r) => r.key === key);
  return {
    ...(typeof def?.priority === "number" ? { priority: def.priority } : {}),
    ...(def?.changefreq ? { changefreq: def.changefreq } : {}),
  };
};

const alt = (locale: string, href: string): Alternate => ({ hreflang: locale, href });

/**
 * A "static" route: one page per locale, no per-record gate beyond an optional seo.noindex. Both
 * locales are always structurally present, so when indexable at all, both are indexable — there
 * is no per-locale asymmetry to compute.
 */
function staticFamily(
  routeKey: string,
  buildPath: (l: Locale) => string,
  indexableBuild: boolean,
  noindexFor?: (l: Locale) => boolean | undefined
): SitemapUrl[] {
  const indexable = indexableBuild && LOCALES.every((l) => !noindexFor?.(l));
  if (!indexable) return [];

  const meta = routeMeta(routeKey);
  const alternates: Alternate[] = [
    ...LOCALES.map((l) => alt(l, absoluteUrl(buildPath(l)))),
    alt("x-default", absoluteUrl(buildPath("en"))),
  ];

  return LOCALES.map((locale) => ({
    loc: absoluteUrl(buildPath(locale)),
    locale,
    ...meta,
    alternates,
  }));
}

interface DetailRecord {
  locales: Record<string, { slug?: string; seo?: { noindex?: boolean } } | undefined>;
}

/**
 * A per-record detail family (review, journal article, work). Mirrors alternatesFor() exactly:
 * an alternate is emitted for every locale that has a slug, regardless of that locale's own
 * seo.noindex — because that is what the page's own head already does (routing.ts's
 * alternatesFor() gates on slug PRESENCE only). Sitemap alternates must match head-level
 * alternates exactly, so this does not add a stricter rule the page itself does not enforce.
 */
function detailFamily<T extends DetailRecord>(
  routeKey: string,
  recordsByLocale: (l: Locale) => T[],
  buildPath: (l: Locale, slug: string) => string,
  lastmodOf: (r: T) => string | undefined,
  indexableBuild: boolean
): SitemapUrl[] {
  const meta = routeMeta(routeKey);
  const out: SitemapUrl[] = [];

  for (const locale of LOCALES) {
    for (const record of recordsByLocale(locale)) {
      const content = record.locales[locale];
      if (!content?.slug) continue;
      if (!indexableBuild || content.seo?.noindex) continue;

      const present = LOCALES.filter((l) => Boolean(record.locales[l]?.slug));
      const xDefaultLocale = present.includes("en") ? "en" : present[0]!;
      const alternates: Alternate[] = [
        ...present.map((l) => alt(l, absoluteUrl(buildPath(l, record.locales[l]!.slug!)))),
        alt("x-default", absoluteUrl(buildPath(xDefaultLocale, record.locales[xDefaultLocale]!.slug!))),
      ];

      const lastmod = lastmodOf(record);
      out.push({
        loc: absoluteUrl(buildPath(locale, content.slug)),
        locale,
        ...meta,
        ...(lastmod ? { lastmod } : {}),
        alternates,
      });
    }
  }

  return out;
}

interface FacetLike {
  key: string;
  slug?: string;
  indexable: boolean;
  count: number;
}

/** Review category facets and journal format archives. Brand facets are handled separately. */
function facetFamily(
  routeKey: string,
  facetsByLocale: (l: Locale) => FacetLike[],
  buildPath: (l: Locale, key: string) => string,
  indexPath: (l: Locale) => string,
  indexableBuild: boolean
): SitemapUrl[] {
  const meta = routeMeta(routeKey);
  const out: SitemapUrl[] = [];

  for (const locale of LOCALES) {
    for (const facet of facetsByLocale(locale)) {
      const key = facet.slug ?? facet.key;
      const selfPath = buildPath(locale, key);
      const indexing = facetIndexing(facet, selfPath, indexPath(locale), "category");
      const isIndexable = indexableBuild && indexing.robots.startsWith("index");
      if (!isIndexable) continue;

      const counterpart = otherOf(locale);
      const counterpartFacet = facetsByLocale(counterpart).find((f) => (f.slug ?? f.key) === key);
      const counterpartIndexable = Boolean(
        counterpartFacet &&
          facetIndexing(
            counterpartFacet,
            buildPath(counterpart, key),
            indexPath(counterpart),
            "category"
          ).robots.startsWith("index")
      );

      const alternates: Alternate[] = [
        alt(locale, absoluteUrl(selfPath)),
        ...(counterpartIndexable ? [alt(counterpart, absoluteUrl(buildPath(counterpart, key)))] : []),
        {
          hreflang: "x-default",
          href: absoluteUrl(counterpartIndexable && locale !== "en" ? buildPath("en", key) : selfPath),
        },
      ];

      out.push({ loc: absoluteUrl(selfPath), locale, ...meta, alternates });
    }
  }

  return out;
}

/**
 * Brand entities. Mirrors src/pages/[locale]/brands/[brand].astro exactly: a counterpart
 * alternate is emitted only where entityBrands(counterpartLocale) also contains the SAME brand
 * id — "hreflang follows the gate, not the record" (Phase 7).
 */
function brandFamily(indexableBuild: boolean): SitemapUrl[] {
  const meta = routeMeta("brands.detail");
  const out: SitemapUrl[] = [];

  for (const locale of LOCALES) {
    for (const brand of entityBrands(locale)) {
      const content = brand.locales[locale];
      if (!indexableBuild || !brandIsIndexable(brand, locale) || content?.seo?.noindex) continue;

      const selfPath = path.brand(locale, brand.slug);
      const counterpart = otherOf(locale);
      const counterpartExists = entityBrands(counterpart).some((b) => b.id === brand.id);

      const alternates: Alternate[] = [
        alt(locale, absoluteUrl(selfPath)),
        ...(counterpartExists ? [alt(counterpart, absoluteUrl(path.brand(counterpart, brand.slug)))] : []),
        {
          hreflang: "x-default",
          href: absoluteUrl(counterpartExists && locale !== "en" ? path.brand("en", brand.slug) : selfPath),
        },
      ];

      out.push({ loc: absoluteUrl(selfPath), locale, ...meta, alternates });
    }
  }

  return out;
}

/**
 * THE FULL DISCOVERABLE SET.
 *
 * indexableBuild defaults to the real, production IS_INDEXABLE_BUILD — the endpoint never
 * overrides it. Tests pass true explicitly to prove the gates open, against real (not synthetic)
 * corpus data, without that override ever reaching production output.
 *
 * Deliberately excluded, always, regardless of indexableBuild:
 *   - the brand facet (/reviews/brand/{slug}/) — permanently noindex and canonicalises away
 *     (src/lib/facets.ts module header). It is navigation, never a sitemap candidate.
 *   - /404/ — an error route, hardcoded noindex regardless of build state.
 *   - /press/, /brands/{brand}/{product}/ — declared in site.json but not built
 *     ("status": "deferred" / "not-built"). Nothing to list.
 */
export function discoverableUrls(indexableBuild: boolean = IS_INDEXABLE_BUILD): SitemapUrl[] {
  return [
    ...staticFamily("home", path.home, indexableBuild),
    ...staticFamily("about", path.about, indexableBuild, (l) => person().locales[l]?.seo?.noindex),
    ...staticFamily("method", path.method, indexableBuild, (l) => method().locales[l]?.seo?.noindex),
    /* The film. Its own surface, its own canonical and its own hreflang pair — a presentation of
       the method rather than a duplicate of it, so it belongs in the index in its own right.
       site.json declares no priority for it, and routeMeta simply omits what is not declared
       rather than inventing a number. */
    ...staticFamily("film", path.film, indexableBuild),
    ...staticFamily("reviews.index", path.reviewsIndex, indexableBuild),
    ...staticFamily("brands.index", path.brandsIndex, indexableBuild),
    ...staticFamily("work.index", path.workIndex, indexableBuild),
    ...staticFamily("journal.index", path.journalIndex, indexableBuild),
    ...staticFamily("editorial-standards", path.editorialStandards, indexableBuild),
    ...staticFamily("contact", path.contact, indexableBuild),
    ...staticFamily("privacy", path.privacy, indexableBuild),
    ...staticFamily("terms", path.terms, indexableBuild),

    ...detailFamily("reviews.detail", reviews, path.review, (r) => r.dates.updatedAt, indexableBuild),
    ...detailFamily(
      "journal.detail",
      journalArticles,
      path.journal,
      (a) => a.dates.updatedAt,
      indexableBuild
    ),
    ...detailFamily("work.detail", workIn, path.work, (w) => w.month, indexableBuild),

    ...brandFamily(indexableBuild),

    ...facetFamily(
      "reviews.category",
      (l) => categoryFacets(l).map((f) => ({ key: f.category, slug: f.slug, indexable: f.indexable, count: f.count })),
      path.reviewsByCategory,
      path.reviewsIndex,
      indexableBuild
    ),
    ...facetFamily(
      "journal.category",
      (l) => journalCategories(l).map((f) => ({ key: f.key, indexable: f.indexable, count: f.count })),
      path.journalByCategory,
      path.journalIndex,
      indexableBuild
    ),
  ];
}

/** The subset for one locale sitemap file — /sitemap-en.xml or /sitemap-ar.xml. */
export const discoverableUrlsFor = (
  locale: Locale,
  indexableBuild: boolean = IS_INDEXABLE_BUILD
): SitemapUrl[] => discoverableUrls(indexableBuild).filter((u) => u.locale === locale);

/* ------------------------------------------------------------------ rendering
 *
 * Pure string builders. The endpoints in src/pages are thin wrappers that call these and return
 * a Response — the actual XML shape lives here, where it is directly callable from a test with no
 * build step, and where the "forced indexable" branch (never reached by the real endpoint) can be
 * rendered and parsed exactly like production output would be.
 */

/** /sitemap.xml — the index pointing at the two locale sitemaps. */
export function renderSitemapIndexXml(): string {
  const entries = (["en", "ar"] as const)
    .map(
      (l) => `  <sitemap>\n    <loc>${escapeXml(absoluteUrl(machinePath.sitemapLocale(l)))}</loc>\n  </sitemap>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>\n`;
}

/** /sitemap-en.xml or /sitemap-ar.xml — one locale's <urlset>. */
export function renderLocaleSitemapXml(urls: SitemapUrl[]): string {
  const body = urls
    .map((u) => {
      const alternates = u.alternates
        .map(
          (a) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(a.hreflang)}" href="${escapeXml(a.href)}" />`
        )
        .join("\n");
      const lastmod = u.lastmod ? `\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : "";
      const changefreq = u.changefreq ? `\n    <changefreq>${escapeXml(u.changefreq)}</changefreq>` : "";
      const priority = typeof u.priority === "number" ? `\n    <priority>${u.priority}</priority>` : "";

      return `  <url>\n    <loc>${escapeXml(u.loc)}</loc>${lastmod}${changefreq}${priority}\n${alternates}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`;
}
