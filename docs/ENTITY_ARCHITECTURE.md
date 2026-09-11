# Entity Architecture

**Status:** Phase 1 decision. Defines relationships only. **Schema is not implemented in this
phase** — implementation is Phase 8. Entity strategy for the person is in
`docs/SEO_ENTITY_STRATEGY.md`.

---

## 1. The entity graph

```
                          ┌────────────┐
                          │   PERSON   │  Zina Almokri — the root entity
                          │   (Zina)   │
                          └─────┬──────┘
             author of          │  practitioner of
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
        ▼                       ▼                        ▼
   ┌─────────┐            ┌──────────┐            ┌──────────┐
   │ REVIEW  │            │  METHOD  │            │ JOURNAL  │
   └────┬────┘            └────┬─────┘            └────┬─────┘
        │                      │  applied in           │
        │  itemReviewed        └───────────────────────┤ explains
        ▼                                              │
   ┌─────────┐   madeBy    ┌─────────┐                 │
   │ PRODUCT ├────────────>│  BRAND  │<────────────────┘ mentions
   └─────────┘             └────┬────┘
                                │  client of
                                ▼
                           ┌─────────┐
                           │  WORK   │──> PERSON (creator)
                           └─────────┘
```

---

## 2. Relationships, precisely

| From | Relation | To | Cardinality | Field |
|---|---|---|---|---|
| Person | authored | Review | 1→n | implicit; single-author site |
| Person | authored | JournalArticle | 1→n | `journal.authorId` |
| Person | practises | Method | 1→1 | `person.methodId` |
| Method | applied in | Review | 1→n | `review.testing.methodStageKeys` |
| Method | explained by | JournalArticle | 1→n | `journal.related.methodStageKeys` |
| Review | reviews | Product | 1→1 | `review.entity.productId` |
| Review | concerns | Brand | 1→1 | `review.entity.brandId` (denormalised from product) |
| Review | compares against | Product | 1→n | `review.testing.comparedAgainstProductIds` |
| Review | relates to | Review, Journal, Work | 1→n each | `review.related.*` |
| Product | made by | Brand | 1→1 | `product.brandId` |
| Product | reviewed in | Review | 1→n (1 today) | `product.reviewId` |
| Brand | produces | Product | 1→n | `brand.productIds` |
| Brand | reviewed in | Review | 1→n | `brand.reviewIds` |
| Brand | client of | Work | 1→n | `brand.workIds` |
| Work | for | Brand | 1→1 | `work.brandId` |
| Work | cross-references | Review | 1→n | `work.relatedReviewIds` |
| JournalArticle | evidences with | Review | 1→n | `journal.related.reviewIds` |

**`review.entity.brandId` is deliberately denormalised** from `product.brandId`. It makes brand
filtering, brand gating and breadcrumb generation single-lookup operations, and the validator
should be extended in Phase 5 to assert the two agree.

---

## 3. Cardinality decisions worth noting

**Review → Product is 1:1, Product → Review is 1:n.** A product accumulates reviews over time
(original, reformulation, revisit). A review is always about one product. This asymmetry is the
basis of the product-page promotion trigger.

**Person → everything is 1:n.** Single author. `authorId` exists on journal articles so a second
contributor is a data change rather than a schema change, but no author route exists, because an
author page on a single-author site duplicates `/about/`.

**Method → Review is n:n through stage keys.** A review declares which stages it applied. Not every
review applies all six — `velvet-hour-lip-cream` applies four, with no comparison and no revisit.
This is what lets the Method page show real coverage rather than a claim.

---

## 4. Locale and the entity graph

**Entities are locale-independent. Their descriptions are not.**

There is one Zina, one Method, one Maison Eclat — described in two languages. The Arabic and
English review of the same product are *the same review* in two languages, not two reviews.

Consequences:

- One `Person` node with one `@id`, referenced from both locales. Never two person entities.
- `name` in the page language, the other script in `alternateName`.
- Relationships live on the shared record, so the graph is identical in both locales; only which
  *pages* exist differs.
- A gated brand still exists as an entity in that locale. It has no page, so it has no `@id` URL
  and is not emitted as a linked entity there.

---

## 5. Schema mapping (Phase 8 specification, not implemented)

| Entity | schema.org type | Where | Notes |
|---|---|---|---|
| Person | `Person` | `/about/` canonical, referenced by `@id` site-wide | The entity anchor |
| Site | `WebSite` | Site-wide | `inLanguage` per locale |
| Any page | `WebPage` + `BreadcrumbList` | All | Breadcrumb derived from path |
| Review | `Review` | `/reviews/{slug}/` | `author` → Person `@id`, `itemReviewed` → nested Product |
| Product | `Product` | **Nested inside `Review` only** | Never standalone, never `offers` |
| JournalArticle | `Article` | `/journal/{slug}/` | `author` → Person `@id`, `datePublished`, `dateModified` |
| Method | `Article` or `HowTo` | `/method/` | See below |
| Brand | `Brand` | `/brands/{slug}/`, gated | Never `Organization` implying a relationship |
| Work | `CreativeWork` | `/work/{slug}/` | Conservative; the page is a case study |
| Media | `ImageObject` | Hero and evidence | Supports image search, a real opportunity here |

### Use one `@id` graph

A single `Person` node referenced by `@id` from every Review and Article is materially stronger
than repeating an inline author object per page, and it is what makes cross-page corroboration
work.

### The rating decision and its schema cost

**`Review` will be emitted without `reviewRating`.**

Google's review-snippet documentation lists `reviewRating` with `ratingValue` as *required* for a
review snippet. Removing numeric scores therefore **forfeits star rich results.** That is a real,
quantifiable cost and it was accepted deliberately: a number makes comparison easy and hides the
reason, and the reason is the product this site sells.

The `Review` type remains valid and useful without a rating — it still tells a search engine what
the page is, who wrote it and what it is about, which is the larger part of the value. But nobody
should later be surprised that stars do not appear, and nobody should add a rating field to get
them without revisiting the editorial decision that removed it.

If the decision is ever reversed, `verdict` is where a rating would live, and
`docs/CONTENT_MODELS.md` notes the shape it would take.

### Never

- Standalone page-level `Product` schema — Zina is not the seller.
- `offers` — no price authority.
- `AggregateRating` — no numeric scores exist, and aggregating her own reviews would be misleading
  markup even if they did.
- Ratings or reviews aggregated from other sites — explicitly prohibited.
- `Organization` for a legal entity that has not been confirmed to exist (U-03).
- `sameAs` containing any unverified profile — gated by `sociaProfile.sameAsEligible`, which is
  `false` on every mock record and validator-enforced.
- Markup describing anything not visible on the page.

### Method: `Article` or `HowTo`?

`HowTo` is tempting and probably wrong. `HowTo` describes instructions a reader follows to achieve
a result; `/method/` describes how *Zina* tests, which a reader is not being told to replicate.
Marking it as `HowTo` would also sit awkwardly beside the `doesNotProve` and `whatThisCannotTell`
sections, whose entire purpose is to limit the claim. **Recommend `Article`**, and revisit only if
the page is ever rewritten as reader instructions.

---

## 6. Entity integrity gates

Each is enforced in data and by `tools/validate-content.mjs`:

| Gate | Rule |
|---|---|
| `sameAsEligible` | `false` until an account is confirmed official in writing. Mock profiles setting it `true` fail the build |
| `relationship.status` | Must be `CONFIRMED` before a brand renders as client, partner or collaborator. A mock relationship marked `CONFIRMED` fails the build |
| `approvalOnFile` | No testimonial renders without a signed approval |
| `results.figures[].source` | A figure with no named written source fails the build |
| `disclosure.primary` | `unknown-pending-verification` may never reach `published` |
| Numeric ratings | Any `rating`, `ratingValue`, `score` or `stars` field in a review fails the build |
| Method boundary | `boundaryStatement` must explicitly deny clinical testing, in both locales |
| Stage keys | Every `methodStageKey` on a review or article must exist in `stageOrder` |

---

## 7. What the graph must let a search engine understand

The Phase 0 quality bar, restated as a checklist against this architecture:

| Question | Answered by |
|---|---|
| Who is Zina? | `Person` at `/about/`, one `@id`, consistent name in two scripts |
| What does she do? | `/method/`, linked from every review |
| What has she tested? | `Review` → `Product`, six products across six categories |
| Which brands? | `Product` → `Brand`, and `Brand` → `Review` aggregation |
| What does she publish? | `Article` on `/journal/`, `CreativeWork` on `/work/` |
| Is she credible? | `/method/`, `/editorial-standards/`, disclosure on every review, dated update logs |
| Which language is this? | `inLanguage`, `hreflang`, `lang`/`dir` per locale |

Every one is answerable from server-rendered HTML with no JavaScript execution.
