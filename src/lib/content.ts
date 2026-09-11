/**
 * CONTENT ACCESS LAYER
 *
 * The single place the application reads content. Everything else consumes typed accessors.
 *
 * Design decisions (docs/CONTENT_IMPLEMENTATION.md):
 *
 * 1. THE PHASE 1 SCHEMA IS THE SCHEMA. `content/schema/types.ts` is framework-agnostic, was
 *    validated across three phases, and is enforced by `tools/validate-content.mjs`. This layer
 *    re-exports it rather than restating it in a second dialect. Two definitions of `Review`
 *    would drift, and the one this file owns would win by accident.
 *
 * 2. THE SOURCE DIRECTORY IS SWAPPABLE. Today it is `content/mock/`. A production source becomes
 *    `content/real/` by changing ONE constant. The lifecycle, not the directory, decides what
 *    renders.
 *
 * 3. LIFECYCLE IS ENFORCED HERE, NOT IN TEMPLATES. `published` and `archived` are the only
 *    publishable states. A template cannot accidentally render a draft, because a draft never
 *    reaches it.
 *
 * 4. LOCALE ABSENCE IS ABSENCE. `locales.ar` missing means the record has no Arabic version.
 *    It never means "translate later", and it never produces a route.
 *
 * 5. MOCK MARKERS SURVIVE. A record's `_mock`, `status` and `_verification` are carried through
 *    untouched. Nothing in this layer strips them, so `tools/check-mock-guard.mjs` can find them
 *    in build output — which is what makes shipping mock content a build failure rather than a
 *    review finding.
 */

import type { SeoDefaults, SiteNavigation } from "../types/site.ts";
import type {
  Brand,
  ContentStatus,
  JournalArticle,
  Locale,
  Method,
  Person,
  PressItem,
  Product,
  Review,
  SiteConfig,
  SocialProfile,
  Testimonial,
  Work,
} from "../../content/schema/types.ts";

export type * from "../../content/schema/types.ts";

/* ------------------------------------------------------------------ source */

import brandsFile from "../../content/mock/brands.json" with { type: "json" };
import journalFile from "../../content/mock/journal.json" with { type: "json" };
import methodFile from "../../content/mock/method.json" with { type: "json" };
import personFile from "../../content/mock/person.json" with { type: "json" };
import pressFile from "../../content/mock/press.json" with { type: "json" };
import productsFile from "../../content/mock/products.json" with { type: "json" };
import reviewsFile from "../../content/mock/reviews.json" with { type: "json" };
import siteFile from "../../content/mock/site.json" with { type: "json" };
import socialFile from "../../content/mock/social-profiles.json" with { type: "json" };
import testimonialsFile from "../../content/mock/testimonials.json" with { type: "json" };
import workFile from "../../content/mock/work.json" with { type: "json" };

/**
 * DEVELOPMENT MOCK vs VERIFIED CONTENT.
 *
 * `mock` is a TERMINAL lifecycle state (docs/CONTENT_LIFECYCLE.md section 3): a mock record is
 * never promoted in place. Real content is authored as new records and the mock layer is deleted
 * wholesale. Editing a mock record and flipping its status is exactly how a fabricated field
 * survives review, so the pipeline makes it impossible rather than discouraged.
 */
export const CONTENT_SOURCE = "mock" as const;

/** True while the mock layer is the content source. Surfaced in the build banner, never in the UI. */
export const IS_MOCK_SOURCE = CONTENT_SOURCE === "mock";

const items = <T>(file: { items?: unknown[] }): T[] => (file.items ?? []) as T[];

/* ------------------------------------------------------------------ raw collections */

const allReviews = items<Review>(reviewsFile);
const allBrands = items<Brand>(brandsFile);
const allProducts = items<Product>(productsFile);
const allJournal = items<JournalArticle>(journalFile);
const allWork = items<Work>(workFile);
const allMethods = items<Method>(methodFile);
const allPersons = items<Person>(personFile);
const allSocial = items<SocialProfile>(socialFile);
const allTestimonials = items<Testimonial>(testimonialsFile);
const allPress = items<PressItem>(pressFile);
const allSites = items<SiteConfig>(siteFile);

/* ------------------------------------------------------------------ lifecycle */

/** docs/CONTENT_LIFECYCLE.md section 1. Nothing else reaches a production route. */
export const PUBLISHABLE_STATES: readonly ContentStatus[] = ["published", "archived"] as const;

/**
 * Preview builds additionally render `review`, `needs-verification` and `approved` under a
 * site-wide noindex, with NO visual difference — a preview shows what the page will look like,
 * not a decorated draft.
 *
 * While the source is the mock layer, `mock` is treated as previewable so the foundation can be
 * built and verified at all. It is never publishable, and `tools/check-mock-guard.mjs` fails the
 * build if a mock marker reaches `dist/`.
 */
const PREVIEW_STATES: readonly ContentStatus[] = [
  ...PUBLISHABLE_STATES,
  "review",
  "needs-verification",
  "approved",
  ...(IS_MOCK_SOURCE ? (["mock"] as const) : []),
];

/** Preview mode is opt-in and defaults ON only while the source is the mock layer. */
export const IS_PREVIEW = IS_MOCK_SOURCE || import.meta.env["PUBLIC_PREVIEW"] === "true";

/** A preview build is noindex site-wide, without exception. */
export const IS_INDEXABLE_BUILD = !IS_PREVIEW;

const renderableStates = (): readonly ContentStatus[] =>
  IS_PREVIEW ? PREVIEW_STATES : PUBLISHABLE_STATES;

export const isRenderable = (record: { status: ContentStatus }): boolean =>
  renderableStates().includes(record.status);

export const isPublishable = (record: { status: ContentStatus }): boolean =>
  PUBLISHABLE_STATES.includes(record.status);

/* ------------------------------------------------------------------ locale */

/** A record exists in a locale only when someone authored it there. */
export const existsInLocale = <T extends { locales: Record<string, unknown> }>(
  record: T,
  locale: Locale
): boolean => Boolean(record.locales?.[locale]);

/** Locales a record actually has, in a stable order. Drives hreflang and the switcher. */
export const localesOf = <T extends { locales: Record<string, unknown> }>(
  record: T
): Locale[] => (["en", "ar"] as const).filter((l) => existsInLocale(record, l));

/** Renderable AND present in this locale. The only filter a route generator should need. */
const available = <T extends { status: ContentStatus; locales: Record<string, unknown> }>(
  records: T[],
  locale: Locale
): T[] => records.filter((r) => isRenderable(r) && existsInLocale(r, locale));

/* ------------------------------------------------------------------ site config */

export const site = (): SiteConfig => {
  const config = allSites[0];
  if (!config) throw new Error("content: site.json contains no configuration record");
  return config;
};

export const LOCALES: readonly Locale[] = ["en", "ar"] as const;

/**
 * The Phase 1 schema declares these as `unknown` (see src/types/site.ts). They are narrowed
 * here, once, so no template carries a cast.
 */
export const navigation = (): SiteNavigation => site().navigation as SiteNavigation;
export const seoDefaults = (): SeoDefaults => site().seoDefaults as SeoDefaults;

export const localeConfig = (locale: Locale) => {
  const found = site().i18n.locales.find((l) => l.code === locale);
  if (!found) throw new Error(`content: locale "${locale}" is not declared in site.json`);
  return found;
};

/* ------------------------------------------------------------------ reviews */

export const reviews = (locale: Locale): Review[] =>
  available(allReviews, locale).sort((a, b) =>
    b.dates.publishedAt.localeCompare(a.dates.publishedAt)
  );

export const reviewBySlug = (locale: Locale, slug: string): Review | undefined =>
  reviews(locale).find((r) => r.locales[locale]?.slug === slug);

export const reviewById = (id: string): Review | undefined => allReviews.find((r) => r.id === id);

export const featuredReviews = (locale: Locale): Review[] =>
  reviews(locale).filter((r) => r.featured);

/* ------------------------------------------------------------------ products, brands */

export const productById = (id: string): Product | undefined =>
  allProducts.find((p) => p.id === id);

export const brandById = (id: string): Brand | undefined => allBrands.find((b) => b.id === id);

export const brands = (locale: Locale): Brand[] => available(allBrands, locale);

/* ------------------------------------------------------------------ journal, work */

export const journalArticles = (locale: Locale): JournalArticle[] =>
  available(allJournal, locale).sort((a, b) =>
    b.dates.publishedAt.localeCompare(a.dates.publishedAt)
  );

export const journalById = (id: string): JournalArticle | undefined =>
  allJournal.find((a) => a.id === id);

export const workProjects = (locale: Locale): Work[] => available(allWork, locale);

export const workById = (id: string): Work | undefined => allWork.find((w) => w.id === id);

/* ------------------------------------------------------------------ method, person */

export const method = (): Method => {
  const record = allMethods[0];
  if (!record) throw new Error("content: method.json contains no record");
  return record;
};

export const person = (): Person => {
  const record = allPersons[0];
  if (!record) throw new Error("content: person.json contains no record");
  return record;
};

/* ------------------------------------------------------------------ hard render gates
 *
 * Four gates override lifecycle status entirely, because each guards a specific fabrication
 * risk. These are RENDER-TIME gates, not just publish-time gates: a published review whose
 * disclosure is later downgraded stops showing the old badge immediately.
 * docs/CONTENT_LIFECYCLE.md section 5.
 */

/** A disclosure pending verification can never be published. */
export const isDisclosurePublishable = (review: Review): boolean =>
  review.disclosure.primary !== "unknown-pending-verification";

/** A brand relationship label renders only on written confirmation. */
export const canRenderRelationship = (brand: Brand): boolean =>
  brand.relationship?._verification === "CONFIRMED";

/** A testimonial renders only with a signed approval on file. Currently: none qualify. */
export const canRenderTestimonial = (t: Testimonial): boolean => t.approvalOnFile === true;

/** Testimonials cleared to render. The hard gate makes this an empty list today, by design. */
export const renderableTestimonials = (): Testimonial[] =>
  allTestimonials.filter(canRenderTestimonial);

/** A results figure renders only with a named written source AND confirmation. */
export const canRenderFigure = (figure: {
  source?: string;
  _verification?: string;
}): boolean => Boolean(figure.source) && figure._verification === "CONFIRMED";

/** A social profile reaches `sameAs` and the footer only when confirmed official in writing. */
export const eligibleSocialProfiles = (): SocialProfile[] =>
  allSocial.filter((p) => p.sameAsEligible === true);

/** Press has no route and no component: every record needs individual verification first. */
export const verifiedPress = (): PressItem[] => allPress.filter(() => false);

/** A VerifiableValue renders only when confirmed. It never falls back to a guess. */
export const verified = <T>(v: { value: T | null; _verification: string } | undefined): T | null =>
  v && v._verification === "CONFIRMED" ? v.value : null;

/* ------------------------------------------------------------------ brand index gate
 *
 * docs/BRAND_ARCHITECTURE.md section 2. Computed PER LOCALE, because review coverage differs by
 * language and a single global gate would either publish a thin Arabic page or suppress a
 * substantial English one.
 *
 * THE SINGLE IMPLEMENTATION RULE: every brand link is a function of this gate, evaluated at
 * build time in the current locale. No template may assume a brand page exists. (Risk R-14.)
 */
export const brandPassesGate = (brand: Brand, locale: Locale): boolean => {
  if (brand.indexPolicy === "force-noindex") return false;
  if (brand.indexPolicy === "force-index") return true;

  const localeBlock = brand.locales[locale];
  if (!localeBlock) return false;

  const reviewCount = allReviews.filter(
    (r) => r.entity.brandId === brand.id && isRenderable(r) && existsInLocale(r, locale)
  ).length;

  const workCount = allWork.filter(
    (w) => w.brandId === brand.id && isRenderable(w) && existsInLocale(w, locale)
  ).length;

  const hasDescription = (localeBlock.description ?? "").length >= 120;
  const hasLogo = Boolean(brand.logo?.src);

  return (reviewCount >= 2 || (reviewCount >= 1 && workCount >= 1)) && hasDescription && hasLogo;
};

/* ------------------------------------------------------------------ journal category gate */

/** A category route generates at 3+ published articles in that locale. None qualifies today. */
export const journalCategoryPassesGate = (category: string, locale: Locale): boolean =>
  journalArticles(locale).filter((a) => a.category === category).length >= 3;

/* ------------------------------------------------------------------ related content
 *
 * LOCALE FILTERING HAPPENS BEFORE THE COUNT IS TAKEN, so a related block never renders a hole
 * where an item was filtered out. The layout is then chosen by count.
 * docs/EMPTY_PARTIAL_UX.md section 3.
 */

export const relatedReviews = (review: Review, locale: Locale): Review[] =>
  (review.related?.reviewIds ?? [])
    .map(reviewById)
    .filter((r): r is Review => Boolean(r) && isRenderable(r!) && existsInLocale(r!, locale));

export const relatedJournal = (review: Review, locale: Locale): JournalArticle[] =>
  (review.related?.journalIds ?? [])
    .map(journalById)
    .filter((a): a is JournalArticle => Boolean(a) && isRenderable(a!) && existsInLocale(a!, locale));

export const relatedWork = (review: Review, locale: Locale): Work[] =>
  (review.related?.workIds ?? [])
    .map(workById)
    .filter((w): w is Work => Boolean(w) && isRenderable(w!) && existsInLocale(w!, locale));

/** Reviews of the products this one was tested against, where they exist in this locale. */
export const comparisonReviews = (review: Review, locale: Locale): Review[] =>
  (review.testing.comparedAgainstProductIds ?? [])
    .map((productId) => allReviews.find((r) => r.entity.productId === productId))
    .filter((r): r is Review => Boolean(r) && isRenderable(r!) && existsInLocale(r!, locale));
