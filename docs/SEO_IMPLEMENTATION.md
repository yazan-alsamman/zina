# SEO Implementation

**Status:** Phase 4 — the structural foundation. Sitemaps, robots.txt and the full schema surface
belong to Phase 8.

**The rule that constrains every line of this:** nothing is fabricated, and everything marked up is
visible on the page.

---

## 1. What is implemented

| Element | Status | Source |
|---|---|---|
| `<title>` | Done — **verbatim**, no site-name template on detail pages | `seo.title` |
| Meta description | Done | `seo.description` |
| Canonical | Done, absolute, self-referencing | `routing.absoluteUrl()` |
| hreflang | Done, reciprocal-or-nothing, with `x-default` | `routing.alternatesFor()` |
| Robots | Done — `noindex, follow` on preview builds and the 404 | `routing.robotsContent()` |
| Open Graph | Done — type, title, description, url, locale | `seo.detailMeta()` |
| Twitter/X card | Done — degrades to `summary` with no image | `BaseLayout` |
| `Review` JSON-LD | Done — **no rating** | `seo.reviewSchema()` |
| `Person` JSON-LD | Done — **no `sameAs`**, no unverified location | `seo.personSchema()` |
| `BreadcrumbList` JSON-LD | Done, derived from the visible breadcrumb | `seo.breadcrumbSchema()` |
| Semantic headings | Done — one `h1`, no level skips | verified in-browser |
| Internal links | Done — contextual, not modular-only | review page |
| Sitemap | **Phase 8** | route architecture is sitemap-ready |
| robots.txt | **Phase 8** | |

---

## 2. Titles are used verbatim

Detail pages use `seo.title` **exactly as authored**. No `%s | Zina Almokri` suffix.

`site.json` says so itself: *"NOT applied to review, journal or work detail pages, whose seo.title
fields are already length-optimised and are used verbatim."* The validator warns above 60
characters, and appending a 16-character suffix would push every review title past the SERP
truncation point.

Index and utility pages **do** use the template — `templatedMeta()` — because their titles are
short and generic.

Asserted in `tests/output.test.mjs`: the review title contains no suffix and is ≤65 characters.

---

## 3. hreflang: reciprocal or nothing

Generated from the `locales` keys, so it **cannot be one-directional by construction**.

```html
<!-- bilingual record -->
<link rel="alternate" hreflang="en"        href="…/en/reviews/…/">
<link rel="alternate" hreflang="ar"        href="…/ar/reviews/…/">
<link rel="alternate" hreflang="x-default" href="…/en/reviews/…/">

<!-- English-only record: NO ar alternate is emitted -->
<link rel="alternate" hreflang="en"        href="…/en/reviews/veloura-velvet-hour-lip-cream/">
<link rel="alternate" hreflang="x-default" href="…/en/reviews/veloura-velvet-hour-lip-cream/">
```

**Pointing `hreflang="ar"` at `/ar/reviews/` would be a false claim.** hreflang asserts
*equivalence*, and a section index is not an equivalent of an article. The switcher may send a
reader there; the markup may not claim it is the same page.

Rules implemented:

1. Self-referencing hreflang on every page.
2. Reciprocal or nothing.
3. `x-default` → English where it exists, otherwise the only version that does.
4. **Language codes only** — `en`, `ar`, no region subtags. Audience geography is unknown (U-04),
   and `ar-AE` without evidence would narrow reach for no gain.

**Note for the test suite:** the language switcher's `<a>` also carries `hreflang`, correctly — it
describes the link target's language. Only `<link rel="alternate">` counts as an equivalence
claim, and the test distinguishes them.

---

## 4. Canonicals

- Every page self-canonicalises to its absolute URL.
- **Locale variants never canonicalise to each other.** They are alternates, not duplicates.
  Cross-locale canonicalisation would tell Google the Arabic page is a duplicate and remove it
  from the index — deleting half the site's reach. Asserted in `tests/output.test.mjs`.
- Trailing slash always, matching `site.json` and the router.

**The domain is a placeholder.** `astro.config.mjs` declares `https://example.invalid` — a
deliberately invalid TLD, so a placeholder canonical can never be mistaken for a real one. This is
unknown **U-01**, blocking since Phase 0, and it is the single thing standing between this
implementation and correct production URLs.

---

## 5. Structured data — and its deliberate absences

### `Review`

```jsonc
{
  "@type": "Review",
  "url": "…", "name": "…", "reviewBody": "…",
  "datePublished": "2026-07-09", "dateModified": "2026-08-21",
  "inLanguage": "en",
  "author": { "@type": "Person", "@id": "…/about/#person" },
  "itemReviewed": { "@type": "Product", "name": "…", "brand": { "@type": "Brand", … } }
}
```

**The absences are the decisions:**

| Absent | Why |
|---|---|
| `reviewRating` | **There are no scores on this site.** Removing them forfeits star rich results — a deliberate, documented Phase 1 trade. Reintroducing a rating to recover the snippet would reverse a decision three phases old |
| `aggregateRating` | Aggregating across her own reviews would be misleading structured data even if scores existed |
| `offers` | Zina is not the seller and has no price authority |
| Standalone `Product` | The product is `itemReviewed` **only**. A page-level Product entity would compete with the review for its own query |

`tests/output.test.mjs` asserts all four absences on all ten review pages.

### `Person`

`sameAs` is emitted **only** from profiles with `sameAsEligible: true`. That is currently none, so
**the key is omitted entirely** rather than emitted empty or filled with plausible guesses.
`address` likewise: `person.location` is `_verification: MOCK`, so it does not render on the page
and does not appear in the schema.

### `BreadcrumbList`

Derived from the **visible** breadcrumb, so the markup and the page cannot disagree — and a crumb
naming a page that does not exist is impossible by construction.

### Nothing else

No `Organization`, no `WebSite`, no `SearchAction`, no `FAQPage`, no `HowTo` on the Method. Each
would be a claim about content that does not exist yet or a schema type added because it exists
rather than because it describes the page.

---

## 6. Breadcrumbs

`Home / Reviews / {title}` — mirrors the URL path exactly.

**A breadcrumb never names a page that does not exist.** No product-category segment, because
`/reviews/{category}/` is gated at 5 reviews per locale and none qualifies. No journal category,
for the same reason at 3 articles.

---

## 7. Internal linking

Implemented on the review page, per `docs/SEO_UX_INTEGRATION.md`:

| From | To | Count | Mechanism |
|---|---|---|---|
| Review | **Method** | 6 stage links + 1 prose link | `MethodRelationship` + the contextual link beneath it |
| Review | Brand | 1 | **Gate-dependent** — page or filtered index |
| Review | Related reviews | 0–2 | Locale-filtered |
| Review | Related journal | 0–2 | Locale-filtered |
| Review | Related work | 0–1 | Locale-filtered |
| Review | Comparison product's review | 0–n | **Contextual, in prose** |
| Review | Brand official site | 0–1 | `rel="nofollow"`, plus `sponsored` where paid |

**The most-repeated internal link on the site is review → Method**, and it exists because a human
reads the stage markers as *"which parts of the protocol did this test run"*, not because a crawler
likes it.

`rel` on outbound brand links is a **function of the review's disclosure**, not of anyone
remembering: `paid-collaboration` and `sponsored` add `sponsored` automatically.

**No link exists purely for SEO.** No tag cloud, no keyword footer, no "related searches", no
cross-locale "read this in English" link.

---

## 8. Indexability

| Build | Robots |
|---|---|
| Production, published content | `index, follow` |
| **Any preview build** | **`noindex, follow` site-wide, without exception** |
| 404 | `noindex, follow` |
| A record with `seo.noindex` | `noindex, follow` |

Preview is currently on, because the content source is the mock layer. An indexed preview
containing mock press mentions or an unverified brand relationship is a real problem and an easy
one to cause.

---

## 9. Nothing was fabricated

Checked explicitly, because this is where fabrication would be easiest:

- No aggregate rating, review count, or score.
- No award, credential, certification or accreditation.
- No follower count, in markup or in copy.
- No `Organization` claim.
- No testimonial (none has an approval on file).
- No press mention (route deferred; `press.json` is the highest-risk file in the project).
- No `sameAs` (no profile is verified).
- No location (unverified).
- No `datePublished` that is not in the content model.

---

## 10. What Phase 8 still owes

- `sitemap.xml` + `sitemap-en.xml` + `sitemap-ar.xml`, with `xhtml:link` alternates matching the
  head-level hreflang exactly — a mismatch is a reliable way to have both ignored.
- `robots.txt`.
- The `/` 302 negotiation as host configuration.
- Redirect map, including `/how-i-test` → `/{loc}/method/`.
- `Article` schema for journal, `Person` on `/about/` as the canonical entity anchor.
- **The real domain (U-01)** — which unblocks all of the above.
