# Journal SEO

**Canonicals, hreflang, robots, structured data and thin-page handling for the journal — and the
claims this site refuses to make.**

| | |
|---|---|
| **Status** | Implemented (Phase 6) |
| **Journal routes** | 20 |
| **Indexable today** | **0** — the build is a preview build (§4) |
| **Fabricated schema** | **None** |

---

## 1. The governing rule

> **Route existence is not indexability.**

A page can be reachable, linked, crawlable and useful to a reader while telling a search engine not
to index it. The journal uses that separation in two independent ways — the preview gate (§4) and
the thin-archive gate (§5).

---

## 2. URL architecture

```
/{locale}/journal/                 index
/{locale}/journal/{slug}/          article
/{locale}/journal/{format}/        format archive
```

`trailingSlash: "always"`. Every absolute URL derives from the single canonical origin in
`src/config/site.ts`, which `astro.config.ts` also imports — so `Astro.site` and the SEO layer
cannot disagree. **No template or library contains a domain literal**, asserted site-wide.

Format segments are reserved in `site.json`, so an article slug can never collide with an archive
route.

---

## 3. Canonicals and hreflang

### Articles

Self-canonical. Reciprocal `hreflang` **only where the translation exists**:

| Article | `en` | `ar` | `x-default` |
|---|---|---|---|
| Bilingual (4 records) | ✓ | ✓ | → en |
| `understanding-finish-and-texture` (en only) | ✓ | — | → en |
| `mufradat-darajat-albashara` (ar only) | — | ✓ | → ar |

A missing translation produces **no alternate, no stub and no route**. Locale variants never
canonicalise to each other — asserted.

### Format archives

A thin archive is a **view of the index it filters**, so it canonicalises to
`/{locale}/journal/` and is `noindex`.

This is deliberately the **same rule** Phase 5 applied to review facets, not a parallel one. The
test now expresses it once for every section:

> a gated facet canonicalises to its section index and must not claim indexability

---

## 4. The preview gate — why everything is `noindex` today

```ts
export const IS_PREVIEW = IS_MOCK_SOURCE || import.meta.env["PUBLIC_PREVIEW"] === "true";
export const IS_INDEXABLE_BUILD = !IS_PREVIEW;
```

The content layer is mock, so **every page in this build is `noindex, follow`** — including
articles that would otherwise qualify.

Indexability is **composed**, never asserted locally:

```
robotsContent(IS_INDEXABLE_BUILD && pageIsIndexable)
```

This ordering matters and was a Phase 5 defect: a facet could previously claim `index, follow` in a
preview build. A page cannot opt itself into indexation while the source is fabricated.

`follow` is retained so internal-link discovery still works in preview.

---

## 5. The thin-archive gate

`JOURNAL_CATEGORY_GATE = 3` — Phase 1's threshold, unchanged.

| Format | en | ar | Indexable |
|---|---|---|---|
| `guides` | 2 | 2 | No |
| `testing-notes` | 1 | 1 | No |
| `comparisons` | 1 | 1 | No |
| `essays` | 1 | 1 | No |

**No format qualifies in either locale.** Archives remain reachable and linked — the gate governs
indexation only.

`indexableJournalCategories(locale)` returns `[]` today and is what the Phase 8 sitemap will
consume, rather than re-deriving the rule.

**Promotion is a robots flip, not a URL migration.** The URL shape is already Phase 1's reserved
shape, so a format crossing the threshold changes one boolean. No 301s.

---

## 6. Structured data

### What is emitted

Every article emits exactly three blocks:

| Type | Purpose |
|---|---|
| `BreadcrumbList` | Home → Journal → article |
| `Person` | `@id` reference only — the full Person entity is defined once |
| `Article` | The piece itself |

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": "…/en/journal/how-to-evaluate-foundation-performance/",
  "url":  "…/en/journal/how-to-evaluate-foundation-performance/",
  "headline": "How to evaluate foundation performance",
  "description": "…",
  "datePublished": "2026-02-22",
  "inLanguage": "en",
  "author": { "@type": "Person", "@id": "…/en/about/#person" }
}
```

### Every field is conditional on a real value

`headline`, `description` and `dateModified` are emitted **only when the record carries them**.
`dateModified` additionally requires that it actually differ from `datePublished` — repeating the
publication date as a modification date is a small lie that inflates freshness signals.

### What is refused, and why

| Refused | Reason |
|---|---|
| `aggregateRating`, `reviewRating`, `ratingValue` | Nothing here is scored. There is no rating to report. |
| `offers` | This is not a storefront. |
| `sameAs` | No social profile has been verified. An unverified profile URL is a fabricated identity claim. |
| `image` | No article carries photography. Emitting a placeholder would claim an asset that does not exist. |
| `publisher` / `Organization` | No organisation entity has been established. |
| `wordCount`, `timeRequired` | Reading time is rendered only where the record carries it; it is never computed and presented as authored. |
| `BlogPosting` | The `Article` type is asserted deliberately — a test fails if `BlogPosting` is emitted. Phase 6 is an editorial publishing system, not a blog. |

Asserted across every article page, and again site-wide in `tests/global.test.mjs`.

---

## 7. Titles and descriptions

Article titles are used **verbatim**, with no site-name suffix — the same rule as reviews. A title
is editorial copy, not a keyword slot.

Descriptions come from `seo.description`, falling back to the record's `excerpt`. Nothing is
generated from body text.

---

## 8. Crawlability without JavaScript

**0 bytes of client JavaScript** across all 57 routes.

Every journal surface — the index, the format browse strip, every archive, every article, the
gated table of contents and every citation — is server-rendered HTML with real `href`s. Format
filtering is a set of static routes, not a client-side filter. With JavaScript disabled the journal
is fully navigable.

The table of contents uses real fragment anchors against real heading ids; every anchor is asserted
to resolve to a heading in the same document.

---

## 9. Internal-link equity

The journal is not an island:

- Every article links to the reviews it cites (in prose and in a footer list).
- Every review surfaces every article that cites it (see `docs/JOURNAL_LINKING.md` §4).
- Articles link to sibling articles, locale-filtered.
- The journal index and format archives cross-link.

**Zero dead internal links**, asserted across the whole build. No link points at an unimplemented
route, and no link exposes a gated brand.

---

## 10. Deferred to Phase 8

- **Sitemap.** `indexableJournalCategories()` and the article set are the inputs; no sitemap is
  emitted yet.
- **RSS/Atom.** Not built. It would be a second content surface with its own escaping and locale
  rules, and nothing in Phase 6 requires it.
- **`robots.txt`.** Not yet emitted.

---

## 11. Known limits

| Limit | Status |
|---|---|
| Production origin | **BLOCKING (U-01)** — `SITE_URL` is `https://example.invalid`. Every absolute URL in this build is a placeholder. |
| Indexability | 0 pages, by design, while the source is mock |
| Format archives | 0 of 4 qualify for indexation |
| Core Web Vitals | Not measured. Payloads are known (§below), field data is not. |

Article page weight, uncompressed: index 17.9 KB, article 23.1 KB, archive 14.1 KB of HTML; CSS is
shared and cached across routes; 0 KB JavaScript.
