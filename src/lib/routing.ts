/**
 * ROUTING AND LOCALE URLS
 *
 * Route patterns come from `content/mock/site.json` (the machine-readable source of truth
 * declared in docs/INFORMATION_ARCHITECTURE.md). This module builds paths, canonicals and
 * hreflang alternates from that data — never from string literals scattered across templates.
 *
 * THE RULE THAT SHAPES EVERYTHING HERE (Phase 1, docs/MULTILINGUAL_SEO_ARCHITECTURE.md):
 *
 *   A route exists in a locale only if content exists in that locale.
 *   A missing translation produces NO ROUTE, NO HREFLANG ALTERNATE and NO STUB.
 *   It never produces a machine translation.
 */

import type { Locale } from "../../content/schema/types.ts";
import { SITE_URL } from "../config/site.ts";
import { LOCALES, existsInLocale, isRenderable, site } from "./content.ts";

/* ------------------------------------------------------------------ path building */

/** Trailing slash always — one canonical form, per site.json i18n.trailingSlash. */
const withSlashes = (segments: string[]): string =>
  `/${segments.filter(Boolean).join("/")}/`.replace(/\/{2,}/g, "/");

export const localeHome = (locale: Locale): string => withSlashes([locale]);

export const path = {
  home: (locale: Locale) => localeHome(locale),
  about: (locale: Locale) => withSlashes([locale, "about"]),
  method: (locale: Locale) => withSlashes([locale, "method"]),
  /**
   * The film. A scroll-driven cinematic presentation of the same six-stage method the /method/
   * page documents in prose — the experience, not a second copy of the record. The slug is
   * English in both locales, like every other structural segment on this site.
   */
  film: (locale: Locale) => withSlashes([locale, "film"]),
  methodStage: (locale: Locale, stageKey: string) =>
    `${withSlashes([locale, "method"])}#${stageKey}`,
  reviewsIndex: (locale: Locale) => withSlashes([locale, "reviews"]),
  review: (locale: Locale, slug: string) => withSlashes([locale, "reviews", slug]),
  /**
   * Facet routes. PATH-BASED, not query strings — a query string is not a route in a static
   * build, and client-side filtering is forbidden (R-15). See src/lib/facets.ts for the full
   * reasoning and decision D5-1.
   */
  reviewsByCategory: (locale: Locale, categorySlug: string) =>
    withSlashes([locale, "reviews", categorySlug]),
  reviewsByBrand: (locale: Locale, brandSlug: string) =>
    withSlashes([locale, "reviews", "brand", brandSlug]),
  brandsIndex: (locale: Locale) => withSlashes([locale, "brands"]),
  brand: (locale: Locale, slug: string) => withSlashes([locale, "brands", slug]),
  journalIndex: (locale: Locale) => withSlashes([locale, "journal"]),
  journal: (locale: Locale, slug: string) => withSlashes([locale, "journal", slug]),
  /**
   * Journal category route — the editorial FORMAT archive. Gated at 3 articles per locale
   * (Phase 1). Segments are reserved in site.json reservedSlugs.journal, so an article slug can
   * never collide with a format.
   */
  journalByCategory: (locale: Locale, categoryKey: string) =>
    withSlashes([locale, "journal", categoryKey]),
  workIndex: (locale: Locale) => withSlashes([locale, "work"]),
  work: (locale: Locale, slug: string) => withSlashes([locale, "work", slug]),
  editorialStandards: (locale: Locale) => withSlashes([locale, "editorial-standards"]),
  contact: (locale: Locale) => withSlashes([locale, "contact"]),
  privacy: (locale: Locale) => withSlashes([locale, "privacy"]),
  terms: (locale: Locale) => withSlashes([locale, "terms"]),
  notFound: (locale: Locale) => withSlashes([locale, "404"]),
} as const;

/**
 * MACHINE ENDPOINTS — files, not documents. `withSlashes()` always appends a trailing slash,
 * which is correct for every human-navigable route above and wrong for a file with an extension:
 * `/journal/rss.xml/` is not a valid feed URL. These five paths are built without it, matching
 * `trailingSlash: "always"` in astro.config.ts, which — correctly — only governs extensionless
 * page routes; Astro does not append a slash to a route with a file extension either way.
 */
export const machinePath = {
  sitemapIndex: (): string => "/sitemap.xml",
  sitemapLocale: (locale: Locale): string => `/sitemap-${locale}.xml`,
  robotsTxt: (): string => "/robots.txt",
  journalRss: (locale: Locale): string => `/${locale}/journal/rss.xml`,
} as const;

/**
 * Routes that are NOT implemented yet.
 *
 * Phase 5 added home, reviews index, review facets and method. What remains is listed here so
 * navigation can refuse to expose it: the Phase 5 brief forbids linking users into pages that do
 * not exist, so `SiteHeader` and `SiteFooter` filter against this list rather than rendering a
 * link and hoping.
 *
 * `tests/global.test.mjs` asserts that no page in dist/ links to anything on this list, so it
 * cannot silently drift as later phases add templates.
 */
export const NOT_YET_IMPLEMENTED: readonly string[] = [
  "about",
  "brandsIndex",
  "brand",
  "workIndex",
  "work",
  "editorialStandards",
  "contact",
  "privacy",
  "terms",
] as const;

/**
 * Route keys that actually render a page today. The global shell filters its links against this,
 * so navigation cannot advertise a destination that does not exist — the Phase 5 brief forbids
 * linking users into unbuilt pages, and "we will remember to add it later" is not a mechanism.
 *
 * Adding a template means adding its key here; `tests/global.test.mjs` asserts that every link in
 * dist/ resolves to a page that was actually emitted, so the list cannot drift.
 */
export const IMPLEMENTED_ROUTES = new Set<string>([
  "home",
  "reviewsIndex",
  "review",
  "reviewsByCategory",
  "reviewsByBrand",
  "method",
  "film",
  "journalIndex",
  "journal",
  "journalByCategory",
  "brandsIndex",
  "brand",
  "workIndex",
  "work",
  "about",
  "contact",
  "editorialStandards",
  "privacy",
  "terms",
  "notFound",
]);

export const isImplemented = (routeKey: string): boolean => IMPLEMENTED_ROUTES.has(routeKey);

/* ------------------------------------------------------------------ absolute URLs */

/**
 * Absolute URLs derive from THE SINGLE CANONICAL ORIGIN (src/config/site.ts), which
 * astro.config.ts also imports — so `Astro.site` and this can never disagree.
 *
 * No template builds a URL by string concatenation, and no template contains a domain literal.
 * The production domain is unknown (U-01); see src/config/site.ts.
 */
export const absoluteUrl = (pathname: string): string =>
  `${SITE_URL.replace(/\/$/, "")}${pathname}`;

/* ------------------------------------------------------------------ hreflang
 *
 * docs/MULTILINGUAL_SEO_ARCHITECTURE.md section 3:
 *   1. Self-referencing hreflang on every page.
 *   2. Reciprocal or nothing — generated from the `locales` keys, so it cannot be
 *      one-directional by construction.
 *   3. x-default points at English where one exists, otherwise at the only version that does.
 *   4. Language codes only (en, ar) — no region subtags. The audience geography is unknown
 *      (U-04), and adding ar-AE without evidence would narrow reach for no gain.
 *
 * A missing counterpart emits NOTHING. Pointing hreflang at a section index would be a false
 * claim: hreflang asserts EQUIVALENCE, and an index is not an equivalent of an article.
 */

export interface Alternate {
  hreflang: string;
  href: string;
}

export function alternatesFor(
  record: { locales: Record<string, { slug?: string }> } | undefined,
  buildPath: (locale: Locale, slug: string) => string
): Alternate[] {
  if (!record) return [];

  const present = LOCALES.filter((l) => Boolean(record.locales[l]?.slug));
  if (present.length === 0) return [];

  const alternates: Alternate[] = present.map((l) => ({
    hreflang: l,
    href: absoluteUrl(buildPath(l, record.locales[l]!.slug!)),
  }));

  const xDefaultLocale = present.includes("en") ? "en" : present[0]!;
  alternates.push({
    hreflang: "x-default",
    href: absoluteUrl(buildPath(xDefaultLocale, record.locales[xDefaultLocale]!.slug!)),
  });

  return alternates;
}

/* ------------------------------------------------------------------ the language switcher
 *
 * The one navigation element with real logic behind it.
 * docs/NAVIGATION_ARCHITECTURE.md section 3 — three states, and it NEVER links to a 404.
 */

export type SwitcherState = "counterpart" | "section-fallback" | "home-fallback";

export interface SwitcherTarget {
  locale: Locale;
  href: string;
  state: SwitcherState;
  /** Set only when the reader is being sent somewhere other than the counterpart. */
  explanationKey?: "no-counterpart";
}

export function switcherTarget(
  targetLocale: Locale,
  record: { locales: Record<string, { slug?: string }> } | undefined,
  buildPath: (locale: Locale, slug: string) => string,
  sectionIndex: (locale: Locale) => string,
  sectionHasContent: boolean
): SwitcherTarget {
  const counterpartSlug = record?.locales?.[targetLocale]?.slug;

  // 1. Counterpart exists — link directly to it.
  if (counterpartSlug) {
    return { locale: targetLocale, href: buildPath(targetLocale, counterpartSlug), state: "counterpart" };
  }

  // 2. No counterpart — the section index in the target locale, with a visible explanation.
  if (sectionHasContent) {
    return {
      locale: targetLocale,
      href: sectionIndex(targetLocale),
      state: "section-fallback",
      explanationKey: "no-counterpart",
    };
  }

  // 3. Nothing in that section in the target locale — the target locale home.
  return { locale: targetLocale, href: localeHome(targetLocale), state: "home-fallback" };
}

/* ------------------------------------------------------------------ static paths
 *
 * Route generation derives availability from ACTUAL LOCALE CONTENT. Six reviews in the corpus
 * produce TEN routes, not twelve: one review is English-only and one is Arabic-original.
 * `tests/routes.test.mjs` asserts exactly that.
 */

export interface LocaleSlugParams {
  params: { locale: Locale; slug: string };
}

export function localeSlugPaths<
  T extends { status: Parameters<typeof isRenderable>[0]["status"]; locales: Record<string, { slug?: string }> },
>(records: T[]): Array<LocaleSlugParams & { props: { record: T } }> {
  const paths: Array<LocaleSlugParams & { props: { record: T } }> = [];

  for (const locale of LOCALES) {
    for (const record of records) {
      if (!isRenderable(record)) continue;
      if (!existsInLocale(record as never, locale)) continue;

      const slug = record.locales[locale]?.slug;
      if (!slug) continue;

      paths.push({ params: { locale, slug }, props: { record } });
    }
  }

  return paths;
}

/* ------------------------------------------------------------------ breadcrumbs
 *
 * Mirror the URL path exactly, so BreadcrumbList markup is derived from the route rather than
 * maintained separately.
 *
 * THE CONSTRAINT: a breadcrumb must NEVER name a page that does not exist. A review's crumb is
 * "Home / Reviews / {title}", not "Home / Reviews / Foundation / {title}", until category
 * routes are built.
 */

export interface Crumb {
  label: string;
  href?: string;
}

export const reviewBreadcrumb = (
  locale: Locale,
  labels: { home: string; reviews: string },
  title: string
): Crumb[] => [
  { label: labels.home, href: path.home(locale) },
  { label: labels.reviews, href: path.reviewsIndex(locale) },
  { label: title },
];

/** Home / {Section} [ / current ] — for any section index, its facets and its detail pages. */
export const sectionBreadcrumb = (
  locale: Locale,
  labels: { home: string; section: string },
  current?: string,
  sectionHref: (locale: Locale) => string = path.reviewsIndex
): Crumb[] =>
  current
    ? [
        { label: labels.home, href: path.home(locale) },
        { label: labels.section, href: sectionHref(locale) },
        { label: current },
      ]
    : [{ label: labels.home, href: path.home(locale) }, { label: labels.section }];

/* ------------------------------------------------------------------ robots */

/**
 * Every preview deployment is noindex SITE-WIDE, without exception. An indexed preview
 * containing mock press mentions or an unverified brand relationship is a real problem and an
 * easy one to cause.
 */
export const robotsContent = (indexable: boolean, recordNoindex?: boolean): string =>
  indexable && !recordNoindex ? "index, follow" : "noindex, follow";

/** The declared locales, for the header switcher. */
export const otherLocale = (locale: Locale): Locale => (locale === "en" ? "ar" : "en");

export const siteName = (locale: Locale): string =>
  site().siteName?.[locale] ?? "Zina Almokri";
