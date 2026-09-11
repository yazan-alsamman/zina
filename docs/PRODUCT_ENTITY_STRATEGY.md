# Product Entity Strategy

**Status:** Phase 1 decision. Phase 0 recommended rejecting `/products/[slug]`. This document
re-evaluates that recommendation, confirms it, and defines the conditions under which it is
reversed.

---

## 1. The decision

**Product remains a first-class entity in the content model and has no route of its own.**

Product data renders inside:

- **Reviews** — identity block, product details block, brand claims block (primary surface)
- **Brand pages** — the products tested from that brand
- **Journal articles** — contextually, where a product is discussed
- **Review index cards** — name, brand, category

Encoded in `content/mock/products.json` as `routingPolicy.hasStandaloneRoute: false`.

---

## 2. Why the entity exists but the page does not

These are separate questions, and conflating them is what produces thin product pages across the
web.

**The entity must exist** because:

- One product can accumulate several reviews over time — original, reformulation, long-term revisit.
- A product can be tested but not yet written up (`testingStatus: "Tested"`,
  `reviewStatus: "Draft"`), which is a genuinely useful state for a "currently testing" module.
- Brand claims must live somewhere that is structurally separate from observations, and the
  product is the correct owner of the brand's own language.
- Brand pages need to list products independently of reviews.
- Comparison content references products, not reviews.

**The page must not exist** because, today, its entire content would be:

```
name + brand + category + specs (from the brand)
+ the brand's own description
+ a link to the one review that has all the actual value
```

That is a manufacturer description plus a link. `docs/SEO_MASTER_STRATEGY.md` section 14 names
"copy manufacturer descriptions as the main content" as an anti-pattern, and section 10 forbids
thin pages created for keywords. A product page here would be both.

It would also **compete with its own review** for the exact query the review is built to win
(`[product] review`), splitting internal links and external signals between two URLs where one has
all the original content. That is a self-inflicted cannibalisation problem, and it is the most
common way review sites damage their own best pages.

---

## 3. The promotion trigger

A product page becomes justified when the site holds original, *aggregated* content about that
product that no single review contains.

**Promote a product to a route when, in a given locale, it has:**

```
  2 or more published reviews
  OR 1 published review AND 1 published comparison feature that includes it
```

**URL when promoted:** `/{loc}/brands/{brandSlug}/{productSlug}/`

Nested under the brand rather than at a top-level `/products/`, because it reinforces the
Brand → Product → Review hierarchy, inherits the brand's breadcrumb, and avoids creating a fourth
top-level section for a page type that will always be rare.

**What the promoted page would be:** a *testing history*, not a product page. Original review
versus reformulation revisit, what changed, what the verdict was each time, and how it placed in
any comparison. That is content the individual reviews genuinely do not contain, and it is a page
type almost nobody publishes.

**Even when promoted, it never emits standalone `Product` schema and never emits `offers`.** Zina
is not the seller. See section 5.

No product currently qualifies. All six mock products have exactly one review.

---

## 4. Alternatives considered

| Option | Verdict |
|---|---|
| **Product page for every product** | Rejected. Thin, duplicative, cannibalises reviews, and directly contradicts the SEO strategy |
| **Product page gated by review count** (chosen) | Accepted. Same discipline as brands: a page is earned by content, not created by the existence of a database row |
| **Product page as a redirect to the review** | Rejected. A redirect that exists only to occupy a URL is a doorway page |
| **Product data only inside reviews, no entity** | Rejected. Loses reformulation history, the "currently testing" state, and the structural separation of brand claims |
| **Top-level `/products/`** | Rejected even for the promoted case. Creates a fourth top-level section for a rare page type and breaks the brand hierarchy |

---

## 5. Structured data

The product is marked up **only as `itemReviewed` nested inside `Review`**, on the review page.

Never:

- a standalone page-level `Product` entity,
- `offers` — Zina does not sell anything and has no price authority,
- `AggregateRating` — this site publishes no numeric scores at all, and aggregating across her own
  reviews would be misleading structured data even if it did.

Full rules in `docs/ENTITY_ARCHITECTURE.md` section 5.

---

## 6. Locale behaviour

A product carries locale content only where a review or brand page in that locale needs it. The
validator enforces the dependency: **if a review exists in a locale, its product must have content
in that locale**, or the review page has nothing to render in its product block.

Current state: `velvet-hour-lip-cream` is English-only (its review is), `verdure-cloud-balm` is
Arabic-only (its review is). Neither has, or needs, a counterpart.

---

## 7. Where product data appears — summary

| Surface | Fields used |
|---|---|
| Review — identity | `name`, `brandId`, `category`, `productType`, `shadeTested` |
| Review — details block | `shadeCount`, `sizeMl`, `priceTier`, `officialUrl`, `images` |
| Review — claims block | `brandClaims[]`, visually separated from observations |
| Brand page | `name`, `category`, `images.hero`, link to its review |
| Journal | `name`, `brandId`, link to its review |
| Review index card | `name`, `brandId`, `category` |
| Sitemap | Never. Products have no URL |
