# Facet URL Architecture

**Status:** Phase 5. The crawlable-discovery gate (risk R-15), resolved.

---

## 1. The contradiction, and how it was resolved

Phase 1 (`docs/SEO_URL_ARCHITECTURE.md` §5) staged the facet architecture:

| Stage | URL | Indexable |
|---|---|---|
| Today | `/{loc}/reviews/?category=foundation` | `noindex, follow`, canonical → `/{loc}/reviews/` |
| At 5+ reviews in a category | `/{loc}/reviews/{category}/` | Indexable, self-canonical |

**That plan cannot be implemented in a static build.** A query string is not a route: static
hosting serves `/{loc}/reviews/index.html` for `?category=foundation`, and the filter does
nothing. The only way to make `?category=` work would be client-side filtering, which the Phase 5
brief forbids and which would leave the corpus reachable only through the sitemap — exactly the
failure R-15 names.

### The resolution (decision D5-1)

**The URL shape Phase 1 reserved is adopted now, and the Phase 1 gate is applied to
INDEXABILITY rather than to EXISTENCE.**

```
/{loc}/reviews/{category}/    generated whenever the category has >= 1 review in that locale
                              indexable ONLY when it passes the Phase 1 gate (>= 5 in locale)
                              otherwise noindex, follow + canonical -> /{loc}/reviews/
```

**No threshold was invented.** The gate is Phase 1's, unchanged: five published reviews in that
category and locale, as declared in `content/mock/site.json`
(`routes[reviews.category].gateRule`).

**This is strictly better on Phase 1's own stated goal** — *"URLs are the most expensive thing on
a website to change… stable from six reviews to five hundred"*. Promotion becomes a robots and
canonical flip rather than a URL migration with a 301 map. Nothing moves when the corpus grows.

---

## 2. The facet inventory

| Facet | Route | Generated when | Indexable | Rationale |
|---|---|---|---|---|
| **Category** | `/{loc}/reviews/{category}/` | ≥1 review in that locale | **Gate-governed** (≥5) | The primary taxonomy. Segments already reserved in `site.json` |
| **Brand** | `/{loc}/reviews/brand/{slug}/` | ≥1 review in that locale | **Never** | Navigation only — see §4 |
| **Disclosure** | **Not built** | — | — | See §5 |
| **Combinations** | **Not built, ever** | — | — | See §6 |

### Current state — measured

**Every category holds exactly one review per locale, so no category qualifies for indexation.**

| Locale | Categories | Each holds | Indexable |
|---|---|---|---|
| en | concealer, foundation, lip, mascara, serum | 1 | **0 of 5** |
| ar | concealer, foundation, mascara, moisturizer, serum | 1 | **0 of 5** |

The two locales genuinely differ: English has `lip` (the English-only review), Arabic has
`moisturizer` (the Arabic-original). **The taxonomy is derived per locale, not mirrored.**

| Locale | Brand facets |
|---|---|
| en | atelier-noor (1), lune-skin (1), maison-eclat (1), veloura-beauty (**2**) |
| ar | atelier-noor (1), lune-skin (1), maison-eclat (1), terra-sana (1), veloura-beauty (1) |

Terra Sana has an Arabic facet and **no English facet**, because it has no English reviews.

---

## 3. Thin-page protection

Existence and indexability are **separate questions**, resolved in one place —
`facetIndexing()` in `src/lib/facets.ts` — which returns the robots directive and the canonical
target **together**, so they cannot disagree.

| Condition | robots | canonical |
|---|---|---|
| Category, ≥5 in locale | `index, follow` | **self** |
| Category, <5 in locale | `noindex, follow` | `/{loc}/reviews/` |
| Brand, any count | `noindex, follow` | `/{loc}/reviews/` |

**Two independent gates compose.** A facet is indexable only when its own thin-page gate passes
**and** the build is an indexable build — a preview build is `noindex` site-wide, without
exception. An earlier revision used the facet's directive alone, which would have let a facet
claim `index, follow` inside a preview build where every other page was correctly `noindex`.

**hreflang follows indexability.** A gated facet emits **no alternates at all**: hreflang on a
page excluded from the index is noise at best and a contradictory signal at worst. When a category
is promoted, alternates are emitted only for locales where that category actually has records.

**The page says so out loud.** A gated facet renders *"This is a navigation view."* in its own
record line. A reader who lands there is told what they are looking at, rather than the status
being hidden in a meta tag.

`tests/facets.test.mjs` asserts robots and canonical can never disagree, for every facet, in
both locales.

---

## 4. Why the brand facet exists, and why it is never indexable

**Why it exists.** A review whose brand fails the per-locale index gate links to "reviews of this
brand" rather than to a brand page that does not exist (risk R-14). In Phase 4 that link pointed
at `?brand=slug`, which in a static build silently returned the unfiltered index — **a link that
looked like it worked and did not.** This route makes it real.

**Why it is never indexable.** The canonical brand surface is `/{loc}/brands/{slug}/` when the
gate passes. Two indexable pages listing the same reviews for the same brand would compete with
each other, which is precisely the self-inflicted cannibalisation the Phase 1 brand gate exists to
prevent.

**One helper resolves every brand link.** `brandDestination()` requires **two** conditions before
it returns a brand page: the per-locale gate passes **and** the brand template is implemented.
Today the second is false, so every brand link resolves to the facet. When `/brands/` ships, every
call site starts pointing at the brand page with no template change.

---

## 5. Disclosure is deliberately not a facet

The reader's real question is *"is this sponsored?"*, and it is answered **on every row of the
index** by the disclosure label, which is the first thing each entry shows.

That is stronger than a filter, because it requires no interaction and no navigation. A disclosure
facet family would add six values × two locales of permanently-`noindex` pages answering a
question already answered in place.

**Recorded as a decision, not an omission** (D5-3). If a future editorial need appears — say, "show
me only the independently purchased reviews" as a trust surface — the route shape is
`/{loc}/reviews/disclosure/{type}/` and it inherits the brand facet's rules.

---

## 6. No combinations

There is no `/{loc}/reviews/{category}/{brand}/` and there will not be.

Multi-facet URLs are the classic crawl-budget sink: five categories × five brands × two locales is
fifty pages of near-duplicate thin content, and the reader need for them is theoretical at any
corpus size this site will reach. Phase 1 called them out explicitly and the position is unchanged.

---

## 7. Slug safety

Category segments share a path level with review slugs — `/en/reviews/foundation/` and
`/en/reviews/maison-eclat-voile-lumiere-skin-tint/` are siblings. Three mechanisms keep them
disjoint:

1. **`site.json` `reservedSlugs.reviews`** declares the category segments.
2. **`tools/validate-content.mjs`** fails the build if a review slug collides with one.
3. **`tests/facets.test.mjs`** asserts that every generated category slug is in the reserved list,
   that no review slug is, and that no category slugifies to `brand` (which would shadow the brand
   facet).

**Astro generates both route families without ambiguity**, because the generated paths never
overlap. This was verified experimentally before the architecture was committed to — it is what
allowed Phase 1's exact URL shape to be preserved rather than falling back to a `/category/`
prefix that Phase 1 had explicitly rejected as *"uglier forever"*.

---

## 8. Verified behaviour

Measured in Chrome against the built output:

| URL | Entries | robots | canonical | hreflang | JS |
|---|---|---|---|---|---|
| `/en/reviews/` | 5 | noindex\* | `/en/reviews/` | 3 | **0** |
| `/en/reviews/foundation/` | **1** | noindex | `/en/reviews/` | **0** | **0** |
| `/en/reviews/brand/veloura-beauty/` | **2** | noindex | `/en/reviews/` | **0** | **0** |
| `/ar/reviews/` | 5 | noindex\* | `/ar/reviews/` | 3 | **0** |
| `/ar/reviews/brand/terra-sana/` | **1** | noindex | `/ar/reviews/` | **0** | **0** |

\* The index is `noindex` **only because this is a preview build from the mock content layer**. It
becomes `index, follow` when the content source is verified.

**The facets genuinely filter, server-side, with zero JavaScript.** That is the R-15 gate closed.

---

## 9. What Phase 8 inherits

- `indexableFacetPaths()` already exists and returns the facets eligible for a sitemap. Today it
  returns an empty array in both locales, which is correct.
- When a category reaches five reviews in a locale, **nothing needs to be built**. The page flips
  to `index, follow`, self-canonicalises, starts emitting hreflang, and becomes sitemap-eligible.
- The promotion needs no redirect, no URL change and no content migration.
