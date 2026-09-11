# Content Models

**Status:** Phase 1. Production-ready field specifications.
**Types:** `content/schema/types.ts` (zero dependencies, framework-agnostic)
**Data:** `content/mock/*.json`
**Validator:** `node tools/validate-content.mjs`

Supersedes the Phase 0 draft in `docs/CONTENT_MODEL.md`.

---

## 0. Conventions

**Localisation.** Locale-independent *facts* live on the record. Locale-dependent *words* live in
`locales[code]`. An absent locale key means the record does not exist in that language — it never
means "translate later".

```jsonc
{
  "id": "mock-review-…",
  "status": "mock",
  "entity": { … },                 // facts, shared
  "locales": {
    "en": { "slug": "…", "translationStatus": "original", … },
    "ar": { "slug": "…", "translationStatus": "adapted",  … }
  }
}
```

**Every record carries:** `id`, `_mock`, `status`, `_verification`.

**Loc.** column: ● localised, ○ shared.

**Alternative considered.** Per-locale directories (`content/en/reviews.json`,
`content/ar/reviews.json`) joined by a shared id. Better isolation for editors, worse for
relationship integrity, and it doubles the file count. The single-file `locales` map gives the same
semantics — independent authoring, explicit absence, per-locale slugs and SEO — with one place to
look. Revisit at CMS migration, where per-locale documents are the CMS-native shape anyway.

---

## 1. Shared field types

| Field | Type | Purpose | Validation |
|---|---|---|---|
| `id` | string | Stable identity across locales | Unique site-wide; `mock-` prefix while mock |
| `_mock` | true | Record-level mock marker | Required in mock layer |
| `status` | ContentStatus | Lifecycle state | See `docs/CONTENT_LIFECYCLE.md`; must be `mock` in mock layer |
| `_verification` | `CONFIRMED` \| `NEEDS_VERIFICATION` \| `MOCK` | Provenance | Enum |
| `locales[].slug` | string | URL segment | `^[a-z0-9]+(-[a-z0-9]+)*$`, unique per collection+locale, not a reserved word |
| `locales[].translationStatus` | `original` \| `adapted` | Authoring provenance | Exactly one `original` per record |
| `locales[].seo` | SeoFields | Per-locale metadata | `title` ≤60 warn, `description` ≤165 warn |

**SeoFields:** `title` (req), `description` (req), `focusKeyword`, `secondaryKeywords[]`,
`canonicalPath` (validated against the route pattern), `noindex`.

**ImageAsset:** `src`, `alt`, `width`, `height` all required — width and height are what make CLS
from images structurally impossible. Plus `caption`, `priority`, `_mock`.

**MediaAsset:** ImageAsset + `type: "image" | "video"`, `poster`, `durationSeconds`.

**EvidenceAsset:** MediaAsset + `stageKey` (required) + `observationIndex` — binds a photograph to
a method stage and to the observation it evidences.

**VerifiableValue&lt;T&gt;:** `{ value: T | null, _verification, _source?, _note? }`. Renders as
nothing when unverified. Never falls back to a guess.

---

## 2. Method

The core differentiator. One record. Required in **both** locales — validator fails otherwise.

| Field | Type | Req | Loc | Purpose | Validation | Mock example |
|---|---|---|---|---|---|---|
| `stageOrder` | MethodStageKey[] | ✓ | ○ | Canonical stage order | ≥3; locale stages must match exactly | `["baseline","application","wear-window","conditions","comparison","revisit"]` |
| `name` | string | ✓ | ● | Protocol name | — | "The Six-Stage Test" |
| `tagline` | string | ✓ | ● | One-line summary | — | "Same six stages, every product…" |
| `introduction` | string | ✓ | ● | Why a fixed method | — | "Most beauty reviews are written from memory…" |
| `boundaryStatement` | string | ✓ | ● | **Denies clinical authority** | Must contain an explicit denial of clinical testing | "This is structured personal testing, not clinical testing…" |
| `stages[]` | MethodStage[] | ✓ | ● | The protocol | Keys match `stageOrder` | 6 stages |
| `whatThisCannotTell[]` | string[] | ✓ | ● | Global limits | ≥3 entries | "Whether a product will suit your skin…" |

### MethodStage

| Field | Type | Req | Purpose | Mock example |
|---|---|---|---|---|
| `key` | MethodStageKey | ✓ | Stable identity, used by reviews and articles | `wear-window` |
| `name` | string | ✓ | Display name | "Wear window" |
| `purpose` | string | ✓ | Why the stage exists | "Observe the product across a fixed period…" |
| `observes[]` | string[] | ✓ | What is watched | "Complexion: eight hours, check-ins at 0, 3, 6, 8" |
| `evidence[]` | string[] | ✓ | What is captured | "Photographs at each timed check-in" |
| `doesNotProve` | string | ✓ | **The boundary** | "Eight hours of wear says nothing about months…" |

`doesNotProve` is required on every stage and is the mechanism that keeps the Method a description
of structured personal testing rather than an implied claim of scientific validation. It is not a
disclaimer bolted on at the end; it is a field per stage.

---

## 3. Person

One record. Required in both locales.

| Field | Type | Req | Loc | Purpose | Validation | Mock example |
|---|---|---|---|---|---|---|
| `name.latin` / `.arabic` / `.display` | string | ✓ | ○ | Canonical name | `_verification: CONFIRMED` | "Zina Almokri" / "زينا المقري" |
| `pronouns` | string | ✓ | ○ | Correct reference | — | "she/her" |
| `methodId` | ref | ✓ | ○ | Link to the protocol | Resolves to `method` | `mock-method-six-stage` |
| `location` | VerifiableValue | ✓ | ○ | Affects dialect and climate claims | Nullable | MOCK: "Dubai, UAE" |
| `images` | Record\<ImageAsset\> | ✓ | ○ | Portraits, OG | alt/width/height | 4 placeholders |
| `professionalTitle` | string | ✓ | ● | Positioning | — | "Beauty Creator and Product Testing Specialist" |
| `tagline` | string | ✓ | ● | Brand line | — | "I test it on my own skin…" |
| `bios.homepageIntro` | string | ✓ | ● | ~20 words | — | — |
| `bios.short` | string | ✓ | ● | ~35 words, cards and meta | — | — |
| `bios.long` | string | ✓ | ● | ~200 words, `/about/` | — | — |
| `bios.editorialByline` | string | ✓ | ● | ~40 words, every article | — | — |
| `bios.collaboration` | string | ✓ | ● | ~90 words, `/contact/` | — | — |
| `expertise[]` | {label, detail} | ✓ | ● | Specific competencies | — | 5 entries |
| `philosophy` | {statement, principles[]} | ✓ | ● | Editorial position | — | 7 principles |

**Five bios, not one.** A homepage line, a card summary, a page bio, a byline and a pitch are
different jobs. Storing one and truncating produces the generic voice that makes creator sites feel
templated.

---

## 4. Review

The core entity. See `docs/REVIEW_PAGE_ARCHITECTURE.md` for how it renders.

### Shared (facts)

| Field | Type | Req | Purpose | Validation | Mock example |
|---|---|---|---|---|---|
| `featured` | boolean | ✓ | Homepage and index promotion | — | `true` |
| `entity.productId` | ref | ✓ | The product | Resolves to `products` | `mock-product-voile-lumiere-skin-tint` |
| `entity.brandId` | ref | ✓ | Denormalised for filtering and gating | Resolves to `brands` | `mock-brand-maison-eclat` |
| `entity.category` | ProductCategory | ✓ | Review taxonomy | Enum | `Foundation` |
| `entity.productType` | string | ✓ | Finer than category | — | "Skin tint" |
| `disclosure.primary` | DisclosureType | ✓ | Commercial status | Enum of 6 | `paid-collaboration` |
| `disclosure.additional[]` | AdditionalDisclosure[] | ✓ | Modifiers | Enum | `["existing-paid-relationship"]` |
| `disclosure.position` | `"above-content"` | ✓ | **Not configurable** | Must equal `above-content` | — |
| `testing.wearWindow` | string | ✓ | Observation period | — | "8 hours" |
| `testing.durationKnown` | boolean | ✓ | Distinguishes unknown from unstated | — | `true` |
| `testing.timesTested` | number | ✓ | Repetitions | — | `4` |
| `testing.shadeUsed` | string \| null | ✓ | Shade tested | Nullable | "22W Amber Warm" |
| `testing.baselinePhotographed` | boolean | ✓ | Method stage 1 evidence | — | `true` |
| `testing.methodStageKeys[]` | MethodStageKey[] | ✓ | **Drives the Method link** | Non-empty; keys must exist | all six |
| `testing.comparedAgainstProductIds[]` | ref[] | ✓ | Comparison | Resolve to `products` | 1 entry |
| `dates.testedFrom/To` | ISO date | ✓ | Testing window | — | `2026-06-14` |
| `dates.publishedAt` | ISO date | ✓ | Publication | ≥ `testedTo` | `2026-07-09` |
| `dates.updatedAt` | ISO date | ✓ | Freshness | ≥ `publishedAt` | `2026-08-21` |
| `updateLog[]` | {date, note} | ✓ | Revision history | May be empty | 1 entry |
| `media.hero` | MediaAsset | ✓ | LCP element | alt/width/height | — |
| `media.gallery[]` | MediaAsset[] | ✓ | Supporting | — | 2 |
| `media.video` | MediaAsset \| null | ✓ | Optional | Nullable | `null` |
| `media.evidence[]` | EvidenceAsset[] | — | Stage-bound proof | `stageKey` must exist | 3 |
| `related.reviewIds/journalIds/workIds` | ref[] | ✓ | Link graph | Resolve; no self-reference | 2/2/1 |

### Localised (words)

| Field | Type | Req | Purpose | Validation |
|---|---|---|---|---|
| `title` | string | ✓ | `h1`. Product name, no marketing | — |
| `subtitle` | string | ✓ | The test in one line | — |
| `excerpt` | string | ✓ | Cards and index | — |
| `introduction` | string | ✓ | Why this test, what was at stake | — |
| `disclosureLabel` | string | ✓ | Badge text | — |
| `disclosureStatement` | string | ✓ | What it means for the reader | — |
| `testingContext` | string | ✓ | The test design | — |
| `applicationContext` | string | ✓ | How it was applied | — |
| `conditions[]` | {label, value}[] | ✓ | **Published, not implied** | Non-empty |
| `observations[]` | ReviewObservation[] | ✓ | The evidence | ≥3 |
| `evidenceNotes` | string | ✓ | What the photographs show | — |
| `strengths[]` | string[] | ✓ | — | Non-empty |
| `limitations[]` | string[] | ✓ | **Never optional** | Non-empty |
| `suitability.suitsWell[]` | string[] | ✓ | Who it suits | Non-empty |
| `suitability.mayNotSuit[]` | string[] | ✓ | **Who it does not** | Non-empty |
| `verdict.summary` | string | ✓ | The judgement | — |
| `verdict.bestFor` | string | ✓ | One-line placement | — |
| `verdict.wouldRepurchase` | string | ✓ | Prose, not boolean | — |
| `conclusion` | string | ✓ | Editorial close | — |
| `seo` | SeoFields | ✓ | Metadata | `canonicalPath` = `/{loc}/reviews/{slug}/` |

**`ReviewObservation`:** `at` ("Hour 6", "Week 2", "Coat 3", "Shade range"), `aspect`
("Wear", "Shade", "Removal"), `note`.

### There is no rating field

Removed by Phase 1 decision. The validator fails the build on any `rating`, `ratingValue`, `score`
or `stars` field in a review. Cost and reversal path documented in
`docs/ENTITY_ARCHITECTURE.md` section 5.

*If ever reintroduced:* it would live at `verdict.rating` as `number | null` on a declared scale
with `bestRating`/`worstRating`, and it would be an editorial decision revisited deliberately, not
a field someone adds to get stars.

### Content-integrity validation

Non-empty `limitations` and both `suitability` arrays; ≥3 observations; non-empty `conditions`;
disclosure above content; date ordering; no medical or clinical language; no absolute suitability
claim; no self-referential related links; `unknown-pending-verification` may never be `published`.

---

## 5. ReviewDisclosure

| Value | Meaning |
|---|---|
| `independently-purchased` | Bought at full price. No relationship |
| `gifted` | Sent free, unpaid, no coverage agreed |
| `sponsored` | Paid to cover this product |
| `paid-collaboration` | Paid campaign relationship exists |
| `editorial` | Independent editorial, no relationship |
| `unknown-pending-verification` | **Default on import.** Cannot reach `published` |

`additional[]`: `existing-paid-relationship`, `affiliate-link`, `event-hosted`.

The default matters: content migrated from real sources starts as unverified and must be actively
confirmed before it can publish. Fabrication risk is highest exactly at migration.

---

## 6. Product

No route. See `docs/PRODUCT_ENTITY_STRATEGY.md`.

**Shared:** `name`, `nameStylised`, `slug`, `brandId`, `category`, `shadeCount`, `shadeTested`,
`priceTier`, `priceIndicative`, `sizeMl`, `testingStatus`, `reviewStatus`, `reviewId`,
`officialUrl`, `images.hero`, `images.gallery[]`.

**Localised:** `productType`, `subtype`, `finish`, `coverage`, `description`, `keyFeatures[]`,
**`brandClaims[]`**.

`brandClaims[]` holds the brand's marketing language and **only** that. It is the structural half
of the claims/observations separation, and it must render visually distinct from observations. The
mock data deliberately includes unfalsifiable claims ("5x volume", "72 hours of hydration") that the
reviews explicitly decline to verify.

**Validation:** a product must carry locale content in every locale where its review exists.

---

## 7. Brand

**Shared:** `slug`, `foundedYear`, `originCountry`, `categoryKey`, `indexPolicy`, `logo`,
`identity`, `officialUrl`, `relationship{type,status,since}`, `productIds[]`, `reviewIds[]`,
`workIds[]`.

**Localised:** `name`, `nameStylised`, `category`, `positioning`, `description`,
`relationshipSummary`, `seo`.

| Field | Rule |
|---|---|
| `relationship.status` | Must be `CONFIRMED` before any relationship label renders. Mock + `CONFIRMED` fails the build |
| `indexPolicy` | `auto` \| `force-index` \| `force-noindex`. Overrides need a written reason |
| `description` | ≥120 chars, original writing, participates in the index gate |

Gate rules: `docs/BRAND_ARCHITECTURE.md` section 2.

---

## 8. Work

**Shared:** `brandId`, `category`, `year`, `month`, `featured`, `media`, `results`,
`relatedReviewIds[]`.

**Localised:** `title`, `client`, `campaign`, `summary`, `description`, `deliverables[]`, `role`,
`disclosure`, `seo`.

**`results.figures[]`** — `{label, value, source, _verification}`. A figure renders only when
`source` names a written client-supplied origin **and** `_verification` is `CONFIRMED`. A figure
with no source fails the build. **An empty array is a valid, complete state** and the template must
look intentional — one mock project has one deliberately.

---

## 9. JournalArticle

**Shared:** `category` (editorial format, never a product category), `type` (`Pillar`/`Supporting`),
`featured`, `authorId`, `dates`, `readingTimeMinutes`, `heroImage`,
`related{reviewIds,journalIds,brandIds,methodStageKeys}`.

**Localised:** `title`, `subtitle`, `excerpt`, `openingParagraph`, `sections[]`, `seo`.

`sections[]` is `{heading, summary, body?}`. **In production, bodies should be MDX**, not JSON
outlines — editorial prose needs inline images, pull quotes and embedded review cards. Reviews stay
structured JSON because their value is being the same shape every time.

---

## 10. SocialProfile, PressItem, Testimonial

**SocialProfile** — `platform`, `handle`, `url`, `primary`, `sameAsEligible`, `role`, `followers`.

- `sameAsEligible`: **hard gate** on schema.org `sameAs`. `false` until an account is confirmed
  official in writing. Mock records setting it `true` fail the build.
- `followers.asOf`: **required**. A follower count without a date is not a fact.

**PressItem** — `type`, `outlet`, `headline`, `excerpt`, `url`, `date`, `logo`. Route deferred.

**Testimonial** — `quote`, `attributionName`, `attributionRole`, `attributionCompany`, `brandId`,
`workId`, `date`, **`approvalOnFile`**. Hard render gate: nothing renders without a signed
approval. Mock attribution is the literal string `MOCK NAME`, never an invented human name.

---

## 11. SiteConfig

Single source of truth for URL construction, hreflang, sitemap and navigation.

| Field | Purpose |
|---|---|
| `domain` | VerifiableValue. Blocking (U-01) |
| `i18n.locales[]` | code, label, `labelNative`, `dir`, `hreflang`, `default` |
| `i18n.xDefault` | `en` |
| `i18n.rootBehaviour` | `redirect-302-by-accept-language` |
| `i18n.pathSegmentsLocalised` | `false` — see `docs/SEO_URL_ARCHITECTURE.md` §3 |
| `i18n.trailingSlash` | `always` |
| `i18n.missingTranslationBehaviour` | No route, no hreflang, switcher falls back to index |
| `routes[]` | Route table: pattern, collection, indexable, priority, changefreq, gate |
| `reservedSlugs` | Category segments that a detail slug may not collide with |
| `navigation` | Primary, CTA, footer groups, per-locale labels |
| `seoDefaults` | Title template (**not** applied to detail pages), defaults, OG |
| `contact`, `legal`, `editorialStandards` | Per-locale where prose |

---

## 12. Coverage against the Phase 1 brief

| Required model | Status |
|---|---|
| Profile | `Person`, bilingual, 5 bios |
| SocialProfile | 5 records, `sameAs` gated |
| Brand | 5 records, bilingual, index gate |
| Product | 6 records, no route, claims separated |
| Review | 6 records, no ratings, 6 disclosure states |
| ReviewDisclosure | 6 primary + 3 additional values |
| ReviewObservation | `at`/`aspect`/`note`, min 3 enforced |
| MethodStage | 6 stages, `doesNotProve` required |
| Work | 4 records, results rule enforced |
| JournalArticle | 6 records, 4 editorial categories |
| MediaAsset | Image, Media, Evidence variants |
| SEO metadata | Per record, per locale |
| Localized content | `locales` map on every content entity |
