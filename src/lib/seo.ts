/**
 * SEO — metadata and structured data.
 *
 * Phase 4 implements the STRUCTURE. Sitemaps, robots.txt and the full schema surface belong to
 * Phase 8; what is here is what the review page needs to be correct on the day it ships.
 *
 * ============================================================================
 * THE RULES THAT CONSTRAIN THIS FILE
 * ============================================================================
 *
 * 1. NOTHING IS FABRICATED. No aggregate rating, no review count, no award, no credential, no
 *    follower number, no organisation claim. If a fact is not in the content layer and
 *    confirmed, it does not appear in the markup.
 *
 * 2. NO `reviewRating`. Removing numeric scores forfeits star rich results. That is a
 *    deliberate, documented trade (Phase 1). The `Review` type stays valid and useful for entity
 *    understanding without one, and reintroducing a rating to recover the snippet would reverse
 *    a decision three phases old.
 *
 * 3. NEVER a standalone `Product`, never `offers`, never `AggregateRating`. The product is
 *    marked up ONLY as `itemReviewed` nested inside `Review`. Zina is not the seller and has no
 *    price authority.
 *
 * 4. EVERYTHING MARKED UP IS VISIBLE ON THE PAGE. Nothing is emitted for crawlers alone.
 *
 * 5. `sameAs` is gated on `sameAsEligible`, which is false for every profile today. So no
 *    `sameAs` is emitted at all, rather than a plausible-looking guess.
 */

import type { JournalArticle, Locale, Person, Product, Review, SeoFields } from "../../content/schema/types.ts";
import { eligibleSocialProfiles, seoDefaults, verified } from "./content.ts";
import { absoluteUrl, type Crumb } from "./routing.ts";

/* ------------------------------------------------------------------ document metadata */

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogType: "website" | "article";
  ogImage?: string;
  locale: Locale;
}

/**
 * Detail pages use `seo.title` VERBATIM — no site-name template. The field is already
 * length-optimised (the validator warns over 60 characters) and appending a suffix would push
 * every review title past the truncation point.
 * site.json seoDefaults._titleTemplateNote says exactly this.
 */
export function detailMeta(
  seo: SeoFields | undefined,
  fallbackTitle: string,
  opts: { canonical: string; robots: string; locale: Locale; ogImage?: string }
): PageMeta {
  return {
    title: seo?.title ?? fallbackTitle,
    description: seo?.description ?? seoDefaults().defaultDescription[opts.locale] ?? "",
    canonical: opts.canonical,
    robots: opts.robots,
    ogType: "article",
    ...(opts.ogImage ? { ogImage: opts.ogImage } : {}),
    locale: opts.locale,
  };
}

/** Index and utility pages DO use the title template. */
export function templatedMeta(
  title: string,
  description: string,
  opts: { canonical: string; robots: string; locale: Locale }
): PageMeta {
  const template = seoDefaults().titleTemplate[opts.locale] ?? "%s";
  return {
    title: template.replace("%s", title),
    description,
    canonical: opts.canonical,
    robots: opts.robots,
    ogType: "website",
    locale: opts.locale,
  };
}

/* ------------------------------------------------------------------ structured data */

type JsonLd = Record<string, unknown>;

/**
 * BreadcrumbList, derived from the visible breadcrumb — so the markup and the page cannot
 * disagree, and a crumb naming a page that does not exist is impossible by construction.
 */
export function breadcrumbSchema(crumbs: Crumb[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      ...(crumb.href ? { item: absoluteUrl(crumb.href) } : {}),
    })),
  };
}

/**
 * The Person entity. `sameAs` is emitted ONLY from profiles confirmed official in writing.
 * Today that is none, so the key is omitted entirely rather than emitted empty.
 */
export function personSchema(personRecord: Person, locale: Locale): JsonLd {
  const localeBlock = personRecord.locales[locale];
  const profiles = eligibleSocialProfiles();
  const location = verified(personRecord.location);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl(`/${locale}/about/#person`),
    name: locale === "ar" ? personRecord.name.arabic : personRecord.name.latin,
    ...(localeBlock?.professionalTitle ? { jobTitle: localeBlock.professionalTitle } : {}),
    ...(localeBlock?.bios?.short ? { description: localeBlock.bios.short } : {}),
    ...(location ? { address: location } : {}),
    ...(profiles.length > 0 ? { sameAs: profiles.map((p) => p.url) } : {}),
  };
}

/**
 * Review schema.
 *
 * NOTE THE ABSENCES, each of which is a decision rather than an omission:
 *   - no `reviewRating`      there are no scores on this site
 *   - no `aggregateRating`   aggregating across her own reviews would be misleading even if
 *                            scores existed
 *   - no `offers`            Zina does not sell anything
 *   - no standalone Product  it is nested as `itemReviewed` only
 */
export function reviewSchema(args: {
  review: Review;
  product: Product | undefined;
  brandName: string | undefined;
  locale: Locale;
  canonical: string;
  personId: string;
}): JsonLd {
  const { review, product, brandName, locale, canonical, personId } = args;
  const localeBlock = review.locales[locale];
  const productLocale = product?.locales?.[locale];

  const itemReviewed: JsonLd = {
    "@type": "Product",
    name: product?.name ?? localeBlock?.title ?? "",
    ...(brandName ? { brand: { "@type": "Brand", name: brandName } } : {}),
    ...(productLocale?.productType ? { category: productLocale.productType } : {}),
  };

  return {
    "@context": "https://schema.org",
    "@type": "Review",
    url: canonical,
    ...(localeBlock?.title ? { name: localeBlock.title } : {}),
    ...(localeBlock?.excerpt ? { reviewBody: localeBlock.excerpt } : {}),
    datePublished: review.dates.publishedAt,
    dateModified: review.dates.updatedAt,
    inLanguage: locale,
    author: { "@type": "Person", "@id": personId },
    itemReviewed,
  };
}

/** Serialise for a <script type="application/ld+json"> block, XSS-safe. */
export const jsonLd = (data: JsonLd): string =>
  JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");


/**
 * Article schema — minimal, and honest about what it does not know.
 *
 * Every property is either derived from the canonical record or OMITTED. Nothing is invented to
 * make the schema look complete:
 *
 *   headline        the article title
 *   description     the article's own SEO description, or its excerpt
 *   datePublished   real, from the record
 *   dateModified    real, and only when it differs from datePublished
 *   author          the Person @id — the only entity this site can assert
 *   inLanguage      the locale
 *
 * DELIBERATELY ABSENT:
 *   image           no approved photography exists. An `image` property pointing at nothing, or
 *                   at a placeholder, would be a fabricated field
 *   publisher       there is no verified organisation. Zina is not an Organization
 *   isAccessibleForFree, wordCount, articleSection as a product category — none is supported
 *   any credential, award, or `sameAs` on the author
 */
export function articleSchema(args: {
  article: JournalArticle;
  locale: Locale;
  canonical: string;
  personId: string;
}): JsonLd {
  const { article, locale, canonical, personId } = args;
  const content = article.locales[locale];
  const modified =
    article.dates.updatedAt && article.dates.updatedAt !== article.dates.publishedAt
      ? article.dates.updatedAt
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": canonical,
    url: canonical,
    ...(content?.title ? { headline: content.title } : {}),
    ...(content?.seo?.description ?? content?.excerpt
      ? { description: content.seo?.description ?? content.excerpt }
      : {}),
    datePublished: article.dates.publishedAt,
    ...(modified ? { dateModified: modified } : {}),
    inLanguage: locale,
    author: { "@type": "Person", "@id": personId },
  };
}
