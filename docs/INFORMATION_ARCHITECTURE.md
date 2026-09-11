# Information Architecture

**Status:** Phase 1 decision. This supersedes `docs/SITEMAP_PROPOSAL.md`, which was a Phase 0
proposal. Where the two differ, this document wins.

**Machine-readable source of truth:** the `routes` array in `content/mock/site.json`. That array
generates the sitemap, the hreflang map and the navigation. This document explains it.

---

## 1. The sitemap

`{loc}` is `en` or `ar`. Every content route exists in both locales, subject to the locale rules
in section 4.

```
/                                       302 -> /{loc}/   never indexed

/{loc}/                                 Home
/{loc}/about/                           About
/{loc}/method/                          Method pillar
/{loc}/reviews/                         Review index, faceted
/{loc}/reviews/{slug}/                  Review
/{loc}/brands/                          Brand index
/{loc}/brands/{slug}/                   Brand              GATED
/{loc}/work/                            Work index
/{loc}/work/{slug}/                     Case study
/{loc}/journal/                         Journal index
/{loc}/journal/{category}/              Journal category   GATED
/{loc}/journal/{slug}/                  Article
/{loc}/editorial-standards/             Editorial standards
/{loc}/contact/                         Contact
/{loc}/privacy/   /{loc}/terms/         Legal
/{loc}/404/                             Not found          noindex

/sitemap.xml                            Index of the two locale sitemaps
/sitemap-en.xml  /sitemap-ar.xml
/robots.txt
```

**Deferred — architecture exists, route not built:**
`/{loc}/press/`, `/{loc}/reviews/{category}/`, `/{loc}/brands/{brand}/{product}/`,
`/{loc}/method/{stage}/`, `/{loc}/search/`.

**Rejected:** a top-level `/products/` tree. See `docs/PRODUCT_ENTITY_STRATEGY.md`.

### What changed from Phase 0

| Change | Reason |
|---|---|
| **Method promoted** from a journal article to a top-level route | It is the core differentiator. A pillar that lives inside a category page cannot anchor the site |
| **Brands removed from primary navigation** | Two of five mock brands fail the index gate in at least one locale. Promoting a partially populated section advertises the emptiest part of the site |
| **Journal categories added** as a gated route layer | Needed once the corpus grows; costs nothing to define now and is expensive to retrofit |
| **Every route localised** under `/{loc}/` | Bilingual is now a decision, not an option |
| **Numeric ratings removed** from the review model | Explicit Phase 1 decision |

---

## 2. Route specifications

Legend — **Aud**: A = beauty readers, B = brands/PR/agencies, C = media/industry.
**Idx**: indexable. **Pri**: internal priority, 1.0 highest.

### Tier 1 — authority routes

| Route | Purpose | Aud | Search intent | Conversion intent | Content type | Parent | Children | Idx | Pri |
|---|---|---|---|---|---|---|---|---|---|
| `/{loc}/` | Establish identity in three seconds, then route to a review or to contact | A B C | Brand navigational only | Split: to `/reviews/` and to `/contact/` | Composed | — | all top-level | Yes | 1.0 |
| `/{loc}/about/` | Who she is and why to believe her | A B C | Brand + entity. Anchor for `Person` schema | Trust, then hand off | Person | `/` | — | Yes | 0.9 |
| `/{loc}/method/` | The six-stage protocol, and its explicit limits | A C | Informational: "how are beauty products tested" | Trust. The page that converts a sceptic | Method | `/` | stage anchors | Yes | 0.9 |
| `/{loc}/reviews/` | The library. The reason the site is a destination | A | Category level: "makeup reviews", "أفضل كريم أساس" | Session depth | Index | `/` | categories, reviews | Yes | 0.9 |
| `/{loc}/journal/` | Topical authority above product level | A C | Informational, mid-funnel | Route to reviews | Index | `/` | categories, articles | Yes | 0.8 |

### Tier 2 — content detail routes

| Route | Purpose | Aud | Search intent | Conversion intent | Content type | Parent | Children | Idx | Pri |
|---|---|---|---|---|---|---|---|---|---|
| `/{loc}/reviews/{slug}/` | The atomic unit of value and the primary organic landing page | A | Highest value on the site: `[product] review`, `[product] تجربة` | Read, then read another | Review | `/reviews/` | — | Yes | 0.8 |
| `/{loc}/journal/{slug}/` | Answer a problem, route to the review that evidences it | A | "why does my foundation break down" | To reviews | Article | `/journal/` or its category | — | Yes | 0.7 |
| `/{loc}/work/{slug}/` | The commercial argument, one project at a time | B C | Very low, correctly | **Highest.** Last page before contact | Work | `/work/` | — | Yes | 0.6 |
| `/{loc}/brands/{slug}/` | Serve brand-led shoppers; show a brand its category is covered | A B | `[brand] review` | Often precedes a contact | Brand | `/brands/` | — | **Gated** | 0.6 |
| `/{loc}/journal/{category}/` | Cluster hub once a format has depth | A | Format-level informational | To articles | Index | `/journal/` | articles | **Gated** | 0.6 |

### Tier 3 — index, conversion and utility routes

| Route | Purpose | Aud | Search intent | Conversion intent | Content type | Parent | Idx | Pri |
|---|---|---|---|---|---|---|---|---|
| `/{loc}/work/` | Capability at a glance | B C | Low | High, routes to contact | Index | `/` | Yes | 0.7 |
| `/{loc}/brands/` | Entry for brand-led browsing | A B | Low | Medium | Index | `/` | Yes | 0.6 |
| `/{loc}/contact/` | The primary conversion | B C | Brand navigational | **The conversion** | Form | `/` | Yes | 0.8 |
| `/{loc}/editorial-standards/` | Disclosure, corrections, medical boundary, AI and ratings policy | A B C | Not a traffic page. An E-E-A-T and legal artefact | Trust | Static | `/` | Yes | 0.5 |
| `/{loc}/privacy/` `/{loc}/terms/` | Legal | — | None | None | Static | `/` | Yes | 0.2 |
| `/{loc}/404/` | Recover a dead link into a live one | A | None | Recovery | Utility | — | **No** | — |

### Notes on individual routes

**`/{loc}/`** — the homepage narrative in the master spec has nine sections, which is one or two
too many. Seven: hero, method in one line, featured review, recent reviews, selected work, short
about, collaboration CTA. Every section must exit somewhere specific; a section with no exit is
decoration.

**`/{loc}/method/`** — six stage anchors on one page, not six routes. Six stage pages at current
depth would be six thin pages. Promote a stage to `/{loc}/method/{stage}/` only if it accumulates
substantial standalone content, which is most plausible for `conditions`.

**`/{loc}/reviews/`** — the facets (category, brand, disclosure type) must be crawlable
server-rendered URLs, not client-only state. This is the single architectural decision on this
page and it is easy to get wrong. See `docs/SEO_URL_ARCHITECTURE.md` section 5.

**`/{loc}/brands/`** — the index lists only brands that pass the gate in that locale. It is not a
directory of every brand ever mentioned.

**`/{loc}/404/`** — not a formality. A review site accumulates dead links from social posts and
from reformulated products. Offer the most recent reviews and a route into `/reviews/`.

---

## 3. Gating rules

Two routes are conditional. Both are computed per locale, and both are enforced by
`tools/validate-content.mjs`, which prints the current state on every run.

### Brand pages

Generated in locale `L` when, **in that locale**:

```
(reviews >= 2)  OR  (reviews >= 1 AND work >= 1)
AND description length >= 120 characters
AND a logo asset exists
```

`indexPolicy` on the brand record can override with `force-index` or `force-noindex`, which is an
editorial decision that should be rare and reasoned. Full rationale:
`docs/BRAND_ARCHITECTURE.md`.

Current state of the mock set:

| Brand | en | ar |
|---|---|---|
| Maison Eclat | indexable | indexable |
| Veloura Beauty | indexable | **gated** (1 review, 0 localised work) |
| Lune Skin | indexable | indexable |
| Atelier Noor | indexable | indexable |
| Terra Sana | **gated** (0 reviews) | **gated** (1 review, 0 work) |

A brand that is gated still exists as an entity and as a filter value on `/reviews/`. Its name on
a review links to the review index filtered by that brand, never to a page that does not exist.

### Journal category pages

Generated when a category holds **3 or more published articles in that locale**. At the current
corpus of six articles, **no category qualifies in either locale**, and that is the correct
behaviour: the category layer activates when the corpus justifies it. `guides` (2 in each locale)
is the first that will activate.

---

## 4. Locale rules

Full treatment in `docs/MULTILINGUAL_SEO_ARCHITECTURE.md`. The three rules that shape the IA:

1. **A route exists in a locale only if content exists in that locale.** A missing translation
   produces no route, no hreflang alternate and no stub. It never produces a machine translation.
2. **Index pages list only what exists in their locale.** `/ar/reviews/` lists the five reviews
   with Arabic content, not six with one broken.
3. **The language switcher never links to a 404.** With no counterpart it links to the section
   index in the other locale, labelled so the user knows why.

Current locale coverage in the mock set:

| Collection | en | ar | Total |
|---|---|---|---|
| Reviews | 5 | 5 | 6 (4 both, 1 en-only, 1 ar-original) |
| Journal | 5 | 5 | 6 (4 both, 1 en-only, 1 ar-original) |
| Work | 4 | 3 | 4 |
| Brands | 5 | 5 | 5 (gating differs by locale) |
| Method, Person | 1 | 1 | 1 each — required in both |

The uneven coverage is deliberate. It makes missing-translation behaviour a tested state.

---

## 5. Depth and hierarchy

Maximum depth is three segments after the locale (`/ar/journal/guides/` or
`/en/reviews/some-review/`). Every content page is reachable from the home page in **at most three
clicks**:

```
Home -> Reviews -> Review
Home -> Journal -> Article
Home -> Work -> Case study
Home -> Method
Home -> About
```

Breadcrumbs mirror the URL exactly, so `BreadcrumbList` markup can be generated from the path
without a separate hierarchy definition. A review's breadcrumb is
`Home / Reviews / {title}`, not `Home / Reviews / Foundation / {title}`, until category routes are
built, because a breadcrumb must not name a page that does not exist.

---

## 6. Scaling

| Corpus | What changes |
|---|---|
| **10 reviews** (today, ×2 locales) | Nothing. Category and brand pages stay gated. Index pages are single-page |
| **50 reviews** | Category routes activate as each reaches 5. Index pagination begins. Most brands pass the gate. Consider CMS migration |
| **200 reviews** | Category pages become the main entry points. Comparison content becomes a distinct format. Product hubs may qualify for promotion. On-site search becomes worthwhile |
| **500 reviews** | Sitemap splits by type. Facet combinations need explicit index rules to avoid crawl waste. Archive strategy needed for superseded reviews |

**Nothing above requires an IA change.** The gates already anticipate growth, the URL patterns are
stable at every size, and the content model already carries what the larger states need. What
changes is which routes are switched on — a data threshold, not a restructure.

The one thing that would force a redesign is introducing a second author, because `authorId` is
modelled but no author route exists. That is deliberate: an author page for a single-author site
is a duplicate of `/about/`.
