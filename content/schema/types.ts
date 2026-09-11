/**
 * Zina Almokri: portable content types (Phase 1 schema, bilingual).
 *
 * Framework-agnostic on purpose. No imports, no dependencies, so Astro can adopt it unchanged.
 *
 * Rules encoded here:
 *  - Every record carries provenance (_verification) and a lifecycle state (status).
 *  - Locale-independent FACTS live on the record. Locale-dependent WORDS live in locales[code].
 *    A missing locale key means the record does not exist in that language. It never means
 *    "translate this later at build time".
 *  - Brand marketing language lives in brandClaims, structurally separated from observations.
 *  - Relationships are id references, never embedded copies.
 *  - There is no rating field anywhere. That is a Phase 1 decision, enforced by the validator.
 *
 * Companion documentation: docs/CONTENT_MODELS.md
 */

export type Locale = "en" | "ar";
export type Verification = "CONFIRMED" | "NEEDS_VERIFICATION" | "MOCK";

/** See docs/CONTENT_LIFECYCLE.md. Only `published` and `archived` are publishable. */
export type ContentStatus =
  | "mock"
  | "draft"
  | "review"
  | "needs-verification"
  | "approved"
  | "published"
  | "archived";

/**
 * `original` = authored first in this locale.
 * `adapted`  = independently written from the same brief and testing data. NOT a translation.
 * A locale that should exist but does not is represented by an ABSENT KEY, never by a stub.
 */
export type TranslationStatus = "original" | "adapted";

export interface BaseRecord {
  id: string;
  _mock?: boolean;
  status: ContentStatus;
  _verification: Verification;
}

export interface LocaleBlock {
  /** Absent on collections with no route of their own (products). */
  slug?: string;
  translationStatus: TranslationStatus;
  seo?: SeoFields;
}

/** locales.en / locales.ar. An absent key means the record has no version in that language. */
export type Localised<T extends LocaleBlock> = Partial<Record<Locale, T>>;

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  priority?: boolean;
  _mock?: boolean;
}

export interface MediaAsset extends Omit<ImageAsset, "priority"> {
  type: "image" | "video";
  poster?: string;
  durationSeconds?: number;
  priority?: boolean;
}

/** Evidence media is bound to a method stage and, optionally, to a specific observation. */
export interface EvidenceAsset extends MediaAsset {
  stageKey: MethodStageKey;
  observationIndex?: number;
}

/** A value the client has not supplied. Renders as nothing, never as a guess. */
export interface VerifiableValue<T> {
  value: T | null;
  _verification: Verification;
  _source?: string;
  _note?: string;
}

export interface SeoFields {
  title: string;
  description: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  canonicalPath?: string;
  noindex?: boolean;
}

/* ------------------------------------------------------------------ Method */

export type MethodStageKey =
  | "baseline"
  | "application"
  | "wear-window"
  | "conditions"
  | "comparison"
  | "revisit";

export interface MethodStage {
  key: MethodStageKey;
  name: string;
  purpose: string;
  observes: string[];
  evidence: string[];
  /**
   * REQUIRED. The explicit boundary of what this stage does not establish.
   * This field is what keeps the Method a description of structured personal testing
   * rather than an implied claim of clinical authority.
   */
  doesNotProve: string;
}

export interface MethodLocale extends LocaleBlock {
  name: string;
  tagline: string;
  introduction: string;
  /** Must explicitly deny clinical testing. Validator-enforced. */
  boundaryStatement: string;
  stages: MethodStage[];
  whatThisCannotTell: string[];
  seo: SeoFields;
}

export interface Method extends BaseRecord {
  stageOrder: MethodStageKey[];
  locales: Localised<MethodLocale>;
}

/* ------------------------------------------------------------------ Person */

export interface PersonLocale extends LocaleBlock {
  professionalTitle: string;
  tagline: string;
  bios: {
    homepageIntro: string;
    short: string;
    long: string;
    editorialByline: string;
    collaboration: string;
  };
  expertise: Array<{ label: string; detail: string }>;
  philosophy: { statement: string; principles: string[] };
  seo: SeoFields;
}

export interface Person extends BaseRecord {
  name: { latin: string; arabic: string; display: string; _verification: Verification };
  pronouns: string;
  methodId: string;
  location: VerifiableValue<string>;
  images: Record<string, ImageAsset>;
  locales: Localised<PersonLocale>;
}

/* ----------------------------------------------------------- SocialProfile */

export interface SocialProfile extends BaseRecord {
  platform: string;
  handle: string;
  url: string;
  primary: boolean;
  /** Hard gate on schema.org sameAs. False until the client confirms the account is official. */
  sameAsEligible: boolean;
  role: string;
  followers: {
    value: number;
    display: string;
    /** Required. A follower count without a date is not a fact. */
    asOf: string;
    _verification: Verification;
  };
}

/* ------------------------------------------------------------------- Brand */

export type RelationshipType =
  | "Product Testing"
  | "Campaign"
  | "Editorial"
  | "UGC"
  | "Beauty Feature";

/** `auto` applies the threshold in brands.json indexGate. Overrides are editorial decisions. */
export type IndexPolicy = "auto" | "force-index" | "force-noindex";

export interface BrandLocale extends LocaleBlock {
  name: string;
  nameStylised?: string;
  category: string;
  positioning: string;
  /** Original writing. Never the brand's own copy. Length participates in the index gate. */
  description: string;
  relationshipSummary: string;
  seo: SeoFields;
}

export interface Brand extends BaseRecord {
  slug: string;
  foundedYear?: number;
  originCountry?: string;
  categoryKey: string;
  indexPolicy: IndexPolicy;
  logo: ImageAsset;
  identity?: { accentColor: string; wordmarkStyle: string };
  officialUrl: string;
  /** status must be CONFIRMED before any relationship label renders. */
  relationship: {
    type: RelationshipType;
    status: Verification;
    since?: string;
    _verification: Verification;
  };
  productIds: string[];
  reviewIds: string[];
  workIds: string[];
  locales: Localised<BrandLocale>;
}

/* ----------------------------------------------------------------- Product */

export type ProductCategory =
  | "Foundation"
  | "Concealer"
  | "Mascara"
  | "Lip"
  | "Serum"
  | "Moisturizer"
  | "Other";

export interface ProductLocale extends LocaleBlock {
  productType: string;
  subtype?: string;
  finish?: string;
  coverage?: string | null;
  description: string;
  keyFeatures: string[];
  /** Brand marketing language ONLY. Must render visually distinct from observations. */
  brandClaims: string[];
}

/**
 * Products have NO standalone route. They render inside reviews, on brand pages and in
 * journal context. See docs/PRODUCT_ENTITY_STRATEGY.md for the promotion trigger.
 */
export interface Product extends BaseRecord {
  name: string;
  nameStylised?: string;
  slug: string;
  brandId: string;
  category: ProductCategory;
  shadeCount: number | null;
  shadeTested: string | null;
  priceTier: "Accessible" | "Mid" | "Premium" | "Luxury";
  priceIndicative?: { value: number; currency: string };
  sizeMl?: number;
  testingStatus: "Not tested" | "Testing" | "Tested";
  reviewStatus: "None" | "Draft" | "Published";
  reviewId: string | null;
  officialUrl: string;
  images: { hero: ImageAsset; gallery: ImageAsset[] };
  locales: Localised<ProductLocale>;
}

/* ------------------------------------------------------------------ Review */

export type DisclosureType =
  | "gifted"
  | "sponsored"
  | "paid-collaboration"
  | "editorial"
  | "independently-purchased"
  /** Default for imported content. A review in this state may NEVER reach published. */
  | "unknown-pending-verification";

export type AdditionalDisclosure = "existing-paid-relationship" | "affiliate-link" | "event-hosted";

export interface ReviewDisclosure {
  primary: DisclosureType;
  additional: AdditionalDisclosure[];
  /** Always above the content. Not configurable downward. */
  position: "above-content";
  _verification: Verification;
}

export interface ReviewObservation {
  /** "Hour 6", "Week 2", "Coat 3", "Shade range". Consistent within a review. */
  at: string;
  aspect: string;
  note: string;
}

export interface ReviewLocale extends LocaleBlock {
  title: string;
  subtitle: string;
  excerpt: string;
  introduction: string;
  disclosureLabel: string;
  disclosureStatement: string;
  testingContext: string;
  applicationContext: string;
  conditions: Array<{ label: string; value: string }>;
  observations: ReviewObservation[];
  evidenceNotes: string;
  strengths: string[];
  limitations: string[];
  suitability: { suitsWell: string[]; mayNotSuit: string[] };
  /** The only field where opinion belongs. Note: no numeric score. */
  verdict: { summary: string; bestFor: string; wouldRepurchase: string };
  conclusion: string;
  seo: SeoFields;
}

export interface Review extends BaseRecord {
  featured: boolean;
  entity: {
    productId: string;
    brandId: string;
    category: ProductCategory;
    productType: string;
  };
  disclosure: ReviewDisclosure;
  testing: {
    wearWindow: string;
    durationKnown: boolean;
    timesTested: number;
    shadeUsed: string | null;
    baselinePhotographed: boolean;
    /** Drives the internal link from every review to the Method pillar. Required, non-empty. */
    methodStageKeys: MethodStageKey[];
    comparedAgainstProductIds: string[];
  };
  dates: { testedFrom: string; testedTo: string; publishedAt: string; updatedAt: string };
  updateLog: Array<{ date: string; note: string }>;
  media: {
    hero: MediaAsset;
    gallery: MediaAsset[];
    video: MediaAsset | null;
    evidence: EvidenceAsset[];
  };
  related: { reviewIds: string[]; journalIds: string[]; workIds: string[] };
  locales: Localised<ReviewLocale>;
}

/* -------------------------------------------------------------------- Work */

export interface WorkLocale extends LocaleBlock {
  title: string;
  client: string;
  campaign: string;
  summary: string;
  description: string;
  deliverables: string[];
  role: string;
  disclosure: string;
  seo: SeoFields;
}

export interface Work extends BaseRecord {
  brandId: string;
  category:
    | "Product Launch"
    | "Beauty Campaign"
    | "Editorial Review Series"
    | "Social Content Campaign";
  year: number;
  month: string;
  featured: boolean;
  media: { hero: ImageAsset; gallery: ImageAsset[] };
  /**
   * A figure renders only when `source` names a written client-supplied origin AND
   * `_verification` is CONFIRMED. An empty figures array is a valid, complete state.
   */
  results: {
    status: Verification;
    figures: Array<{ label: string; value: string; source: string; _verification: Verification }>;
  };
  relatedReviewIds: string[];
  locales: Localised<WorkLocale>;
}

/* ----------------------------------------------------------------- Journal */

/** Journal categories are EDITORIAL FORMATS, never product categories. */
export type JournalCategory = "testing-notes" | "guides" | "comparisons" | "essays";

export interface JournalLocale extends LocaleBlock {
  title: string;
  subtitle: string;
  excerpt: string;
  openingParagraph: string;
  sections: Array<{ heading: string; summary: string; body?: string }>;
  seo: SeoFields;
}

export interface JournalArticle extends BaseRecord {
  category: JournalCategory;
  /** Pillars anchor a cluster; supporting articles link up to one. */
  type: "Pillar" | "Supporting";
  featured: boolean;
  authorId: string;
  dates: { publishedAt: string; updatedAt: string };
  readingTimeMinutes: number;
  heroImage: ImageAsset;
  related: {
    reviewIds: string[];
    journalIds: string[];
    brandIds: string[];
    methodStageKeys: MethodStageKey[];
  };
  locales: Localised<JournalLocale>;
}

/* --------------------------------------------------------- Press, quotes */

export interface PressItem extends BaseRecord {
  type: "MENTION" | "INTERVIEW" | "AWARD";
  outlet: string;
  headline: string;
  excerpt: string;
  url: string;
  date: string;
  logo: ImageAsset;
}

export interface Testimonial extends BaseRecord {
  quote: string;
  attributionName: string;
  attributionRole: string;
  attributionCompany: string;
  brandId: string | null;
  workId: string | null;
  date: string;
  /** Hard gate. No testimonial renders unless a signed approval exists. */
  approvalOnFile: boolean;
}

/* ------------------------------------------------------------------- Site */

export interface RouteDefinition {
  key: string;
  /** e.g. "/{locale}/reviews/{slug}/" */
  pattern: string;
  collection: string | null;
  indexable: boolean;
  priority: number | null;
  changefreq: string | null;
  gated?: boolean;
  gateRule?: string;
  status?: "deferred" | "not-built";
}

export interface SiteConfig extends BaseRecord {
  siteName: Record<Locale, string>;
  domain: VerifiableValue<string>;
  i18n: {
    locales: Array<{
      code: Locale;
      label: string;
      labelNative: string;
      dir: "ltr" | "rtl";
      hreflang: string;
      default: boolean;
    }>;
    xDefault: Locale;
    rootBehaviour: "redirect-302-by-accept-language";
    pathSegmentsLocalised: boolean;
    trailingSlash: "always" | "never";
    missingTranslationBehaviour: string;
  };
  routes: RouteDefinition[];
  reservedSlugs: Record<string, string[]>;
  navigation: unknown;
  seoDefaults: unknown;
  contact: unknown;
  legal: unknown;
  editorialStandards: unknown;
}

/* ------------------------------------------------------------- Collections */

export interface CollectionFile<T> {
  __MOCK_DATA__?: true;
  collection: string;
  schemaVersion: string;
  notice: string;
  items: T[];
}
