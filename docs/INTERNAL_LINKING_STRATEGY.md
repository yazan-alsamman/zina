# Internal Linking Strategy

**Status:** Phase 1 decision. Includes the orphan-prevention strategy.

Internal linking is the mechanism by which a search engine understands what this site is about and
which pages matter. It is also how a reader gets from a product query to trusting the person who
answered it.

---

## 1. The graph

```
                          ┌──────────────┐
                          │    METHOD    │  ← the pillar every review links to
                          └──────┬───────┘
                                 │ ▲
              linked from every  │ │ links out to representative reviews
              review + about     │ │
                                 ▼ │
   JOURNAL ──────────────────> REVIEW <────────────── BRAND
      │  ▲   evidences its       │  ▲   aggregates      │ ▲
      │  │   claims with         │  │                   │ │
      │  └───────────────────────┘  │                   │ │
      │                             │                   │ │
      │        related articles     │  product data     │ │
      ▼                             ▼  (inline, no URL) │ │
   JOURNAL                       PRODUCT ───────────────┘ │
                                                          │
                                    WORK ──────────────────┘
                                     │  cross-links to the independent
                                     │  review of the same brand
                                     ▼
                                  CONTACT
```

Two flows, per the brief:

```
Method ──> Reviews ──> Products ──> Brands ──> Work ──> Contact
Journal ──> Reviews ──> Products ──> Brands
```

---

## 2. Link rules by page type

Every rule below is generated from the content model, not written by hand per page. That is what
makes the graph survive 200 reviews.

| From | To | Count | Source | Mandatory |
|---|---|---|---|---|
| **Review** | Method | 1 | `testing.methodStageKeys` | **Yes** |
| Review | Brand | 1 | `entity.brandId` | If gate passes in locale |
| Review | Related reviews | 2 | `related.reviewIds` | Yes |
| Review | Related journal | 2 | `related.journalIds` | Yes |
| Review | Related work | 0–1 | `related.workIds` | If present |
| Review | Comparison product's review | 0–n | `testing.comparedAgainstProductIds` | If present |
| **Journal** | Reviews it evidences | 1–3 | `related.reviewIds` | **Yes** |
| Journal | Method stage anchor | 1 | `related.methodStageKeys` | Yes |
| Journal | Pillar or supporting siblings | 2 | `related.journalIds` | Yes |
| Journal | Brands | 0–n | `related.brandIds` | If gate passes |
| **Brand** | Its reviews | all in locale | `reviewIds` | Yes |
| Brand | Its work | all in locale | `workIds` | If present |
| **Work** | Independent review of same brand | 0–n | `relatedReviewIds` | **Yes if one exists** |
| Work | Brand | 1 | `brandId` | If gate passes |
| Work | Contact | 1 | — | Yes |
| **Method** | Representative reviews | 2–4 | featured reviews | Yes |
| Method | Editorial standards | 1 | — | Yes |
| **About** | Method | 1 | `methodId` | **Yes** |
| About | Editorial standards, Work, Contact | 3 | — | Yes |

### The three highest-value links

1. **Every review → Method.** The most-repeated internal link on the site. It is what turns a
   scattered set of reviews into a body of work with a named approach, and it is the mechanism by
   which the Method page accumulates authority.
2. **Journal article → the review that evidences it.** Converts an informational visitor into a
   reader of high-intent content, and gives the article's claims a citation.
3. **Work case study → the independent review of the same brand.** The credibility cross-link.
   Rare, deliberate, and the decision moment for audience B.

---

## 3. Contextual versus modular links

**Contextual** links sit inside prose. They are the strongest signal and the least automatable.
Rule: when an article states a finding that a review demonstrates, the finding links to the review
in the sentence, not only in a related block at the bottom.

**Modular** links are the related-content blocks generated from the relationship arrays. They
guarantee a floor of connectivity but carry less weight than a contextual link.

Both are needed. A page with only modular links is connected but not explained; a page with only
contextual links is fragile, because prose changes.

---

## 4. Breadcrumbs

Breadcrumbs mirror the URL path exactly, so `BreadcrumbList` markup is derived from the route and
not maintained separately.

```
/en/reviews/{slug}/            Home / Reviews / {title}
/en/journal/{slug}/            Home / Journal / {title}
/en/journal/{category}/        Home / Journal / {category}
/en/work/{slug}/               Home / Work / {title}
/en/brands/{slug}/             Home / Brands / {name}
/en/method/                    Home / Method
```

**A breadcrumb must never name a page that does not exist.** Review breadcrumbs do not include the
product category until category routes are built, and article breadcrumbs do not include the
category until that category passes its gate. This is checked at build time from the same gate
data the router uses.

---

## 5. Navigation and footer links

Navigation is a link surface with real weight, and it is deliberately narrow.

**Primary (5):** Reviews, Method, Journal, Work, About. Plus a Contact CTA and the language
switcher. Brands is not in primary navigation — see `docs/NAVIGATION_ARCHITECTURE.md` section 2.

**Footer (3 groups):** Content, Professional, Standards. The Standards group carries editorial
standards, privacy and terms, and exists to be found rather than hidden.

Footer links are site-wide and therefore low-weight per link, but they guarantee that
`/editorial-standards/`, `/brands/` and the legal pages are never orphans.

---

## 6. Orphan prevention

**Definition:** an indexable page reachable only from the sitemap.

### Structural guarantees

Every indexable page has, by construction:

| Requirement | How it is guaranteed |
|---|---|
| A parent | Every route pattern has a parent index in `site.json` |
| A breadcrumb | Derived from the route path |
| An archive or hub listing it | Reviews → `/reviews/`; articles → `/journal/`; work → `/work/`; brands → `/brands/` |
| Inbound contextual links | Relationship arrays, validated |
| Navigation reachability | Every section index is in primary navigation or the footer |

### Automated detection

`tools/validate-content.mjs` computes, **per locale**, whether each review is referenced by any
journal article, brand, work project or other review. Anything unreferenced is reported as a
warning. The current mock graph has **zero orphans in either locale**.

Journal articles and work projects are inherently non-orphan because their index pages list all of
them, but the same check should be extended to them if pagination is introduced — page 4 of an
index is not a strong link surface.

### Documented exceptions

Three page types are legitimately weakly linked, and none is indexable-and-orphaned:

| Page | Status | Why it is acceptable |
|---|---|---|
| `/{loc}/404/` | `noindex` | Reached only by error. Must itself link out to `/reviews/` and recent content |
| `/{loc}/privacy/`, `/{loc}/terms/` | Indexable, footer-only | Universal convention. Footer link is sufficient |
| Gated brand and category pages | Not generated at all | Cannot be orphaned because they do not exist |

### The gated-link rule

The most likely source of a broken internal link in this architecture is a template linking to a
gated brand page. **Every brand link is a function of the gate, evaluated at build time in the
current locale.** When the gate fails, the brand name renders as text or as a link to the filtered
review index. No template may assume a brand page exists.

---

## 7. External links

| Target | Attributes |
|---|---|
| Brand official site, no commercial relationship | `rel="nofollow"` |
| Brand official site, paid relationship exists | `rel="nofollow sponsored"` |
| Product page on a brand site | Same as above |
| Press mention | `rel="nofollow"` (deferred route) |
| Social profiles | `rel="me"` once accounts are verified — see `docs/SEO_ENTITY_STRATEGY.md` |

`rel="me"` on verified social links is the reciprocal half of the `sameAs` graph and should not be
skipped: a one-directional `sameAs` is materially weaker.

---

## 8. Link-graph health at scale

| Corpus | Risk | Control |
|---|---|---|
| 10 reviews | Too few related items to fill blocks | Fall back to most recent, never render an empty block |
| 50 | Related selection becomes arbitrary | Prefer same category, then same brand, then recency |
| 200 | Hub pages become the only path to older reviews | Category routes activate; consider a "tested this year" archive |
| 500 | Crawl budget spent on facet combinations | Explicit index rules per facet; canonicalise multi-facet URLs to the primary facet |

The relationship arrays are hand-curated in the mock data. Past roughly 50 reviews, `related.*`
should be **generated with a manual override**: automatic selection by category, brand and recency,
with an editor able to pin a specific link. Fully manual curation stops scaling; fully automatic
selection loses the contextual link that carries the most weight.
