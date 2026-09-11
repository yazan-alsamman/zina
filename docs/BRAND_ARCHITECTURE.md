# Brand Architecture

**Status:** Phase 1 decision.

Brand pages are the easiest way for a review site to accumulate thin pages, and the SEO strategy
explicitly forbids that (`docs/SEO_MASTER_STRATEGY.md` section 14). This document defines when a
brand earns a page and what happens when it does not.

---

## 1. The relationship chain

```
Brand ──> Products ──> Reviews
  │                      │
  └──> Work ─────────────┘   (work cross-links to the independent review of the same brand)
```

A brand aggregates. It is the only page that answers "has she tested anything from this house, and
what did she conclude across all of it" — a question a single review cannot answer. That
aggregation is the **only** legitimate justification for the page. A brand page that is a
description plus one link is a redirect wearing a layout.

---

## 2. The index gate

A brand page is generated in locale `L` when, **in that locale**:

```
  (reviews >= 2)
  OR (reviews >= 1 AND work >= 1)
AND description length >= 120 characters
AND a logo asset exists
```

Encoded in `content/mock/brands.json` under `indexGate`, computed and printed by
`tools/validate-content.mjs` on every run.

**Why per locale.** Review coverage differs by language, and a brand with two English reviews and
one Arabic review has genuinely different content depth in each. Applying a single global gate
would either publish a thin Arabic page or suppress a substantial English one.

**Why the work clause.** One review plus a case study is enough material for a real page, because
the two together tell a story a single review cannot: what the independent verdict was, and what
the commissioned work looked like. That juxtaposition is the most persuasive thing on the site for
audience B.

**Why 120 characters of description.** Not a quality measure, a presence check. It forces someone
to write something original rather than pasting the brand's own copy, which is the specific
anti-pattern the SEO strategy names.

### Overrides

`indexPolicy` on the brand record: `auto` (default), `force-index`, `force-noindex`. Overrides are
editorial decisions and should be rare. `force-index` is legitimate for a brand with one
exceptional review and a lot of context; `force-noindex` for a brand relationship that has ended.
Every override should carry a written reason in the record.

### Current state of the mock set

| Brand | en reviews | en work | en | ar reviews | ar work | ar |
|---|---|---|---|---|---|---|
| Maison Eclat | 1 | 1 | **indexable** | 1 | 1 | **indexable** |
| Veloura Beauty | 2 | 1 | **indexable** | 1 | 0 | **gated** |
| Lune Skin | 1 | 1 | **indexable** | 1 | 1 | **indexable** |
| Atelier Noor | 1 | 1 | **indexable** | 1 | 1 | **indexable** |
| Terra Sana | 0 | 0 | **gated** | 1 | 0 | **gated** |

Three states are exercised: indexable in both, indexable in one, gated in both. All three must
render correctly before Phase 5 is complete.

---

## 3. What a gated brand does

A gated brand is **not** hidden. It is not a page.

| Surface | Gated behaviour |
|---|---|
| `/{loc}/brands/` index | Not listed |
| Review page, brand name | Plain text, or a link to `/{loc}/reviews/?brand={slug}` — never to a missing page |
| `/{loc}/reviews/` filter | Present as a filter value |
| Sitemap | Absent |
| hreflang | No alternate emitted for the gated locale |
| Internal links | None point at the non-existent URL. The validator's dangling-reference check covers the data; the route generator must not emit the link |

**The single implementation rule:** the brand-name link is a function of the gate, evaluated at
build time in the current locale. Nothing in a template may assume a brand page exists.

---

## 4. Brand page structure

When the gate passes:

| # | Section | Source | Notes |
|---|---|---|---|
| 1 | Breadcrumb | route | `Home / Brands / {name}` |
| 2 | Brand identity | `name`, `logo`, `identity.accentColor` | Restrained brand tint, not a takeover |
| 3 | Positioning | `positioning` | One line |
| 4 | Description | `description` | Original writing, never the brand's copy |
| 5 | Relationship | `relationship` | **Only if `status` is `CONFIRMED`.** Otherwise omitted entirely |
| 6 | Reviews of this brand | `reviewIds`, filtered to locale | The reason the page exists |
| 7 | Products tested | `productIds` | Rendered inline; products have no page |
| 8 | Related work | `workIds`, filtered to locale | With disclosure |
| 9 | Official link | `officialUrl` | `rel="nofollow"`, plus `sponsored` where a paid relationship exists |
| 10 | CTA | — | To `/reviews/`, not to the brand |

Sections 5 and 8 are the ones that carry risk. Both are gated on verification.

---

## 5. Relationship integrity

The rule from the master spec, made structural:

> A brand must not be described as a client, partner, sponsor or collaborator unless verified.

`relationship.status` must be `CONFIRMED` before any relationship label renders. In the mock data
every value is `MOCK`, and the validator **fails the build** if a mock relationship is marked
`CONFIRMED`. A brand whose relationship is unverified still appears as a brand whose products were
reviewed. The distinction between "she reviewed their product" and "she works with them" is
preserved in the data, not left to a copywriter.

Relationship types: `Product Testing`, `Campaign`, `Editorial`, `UGC`, `Beauty Feature`. `Editorial`
means no commercial relationship exists — it is the correct value for a brand she reviews
independently, and it must never render as a partnership badge.

---

## 6. Scaling

| Corpus | Brand layer |
|---|---|
| Today (6 reviews) | 3 of 5 brands qualify in English, 3 of 5 in Arabic. Brands stays out of primary navigation |
| ~50 reviews | Most brands qualify. Brands earns a place in primary navigation. Brand pages become real aggregation pages |
| ~200 reviews | A brand may hold 10+ reviews. Sort and filter within a brand page. Individual products may qualify for promotion under `/{loc}/brands/{brand}/{product}/` |
| ~500 reviews | Brand pages become category-like hubs and may need their own sub-navigation by product category |

The gate does not change as the corpus grows. It simply stops excluding anything, which is the
point: it is a quality floor, not a growth limiter.
