# Sitemap Proposal

**Status:** Phase 0 proposal, and the primary input to Phase 1. Routes are argued for or against
individually. Nothing here is settled.

The master spec (section 4) lists candidate routes and instructs that they not be implemented
blindly. This document does that evaluation.

---

## 1. Recommended sitemap

```
/                                   Home
/about                              About + method + editorial standards entry
/reviews                            Review index, faceted
/reviews/[slug]                     Review                                 (6 mock)
/brands                             Brand index
/brands/[slug]                      Brand                                  (5 mock)
/work                               Selected work index
/work/[slug]                        Case study                             (4 mock)
/journal                            Journal index
/journal/[slug]                     Article                                (6 mock)
/journal/how-i-test-beauty-products Pillar. Also surfaced as /how-i-test    (see 3.2)
/editorial-standards                Disclosure, corrections, medical boundary, AI policy
/contact                            Collaboration and press inquiries
/privacy                            Legal
/terms                              Legal
/404                                Not found
/sitemap.xml  /robots.txt           Technical
```

**Deferred, not rejected:** `/press`, category routes under `/reviews`, `/ar` locale tree.
**Rejected:** a separate `/products` tree.

---

## 2. Route rationale

### `/`

- **Purpose** Establish identity in under three seconds, then route to the two things that matter: a review, or a collaboration inquiry.
- **Audience** All three. This is the only page that must serve a beauty reader and a brand marketing lead simultaneously.
- **SEO intent** Brand queries ("Zina Almokri", "زينا المقري"). Almost certainly not a ranking asset for anything else, and should not be optimised as though it were.
- **Conversion role** Split. Primary path to `/reviews`, secondary to `/contact`.
- **Primary content** Hero identity, the testing method stated in one line, one featured review, selected brands, an editorial cut of the journal, short about, social ecosystem, collaboration CTA.
- **Internal links** Featured review, 3 recent reviews, `/about`, `/work`, `/journal`, `/contact`, the how-I-test pillar.
- **Risk** The master spec warns against an overloaded portfolio grid. The homepage narrative in spec section 5 has nine sections, which is at the limit. Phase 3 should cut to seven.

### `/about`

- **Purpose** Answer "who is this person and why should I believe her".
- **Audience** All three, but it is the page brands read most carefully.
- **SEO intent** Brand + entity. This is the anchor for `Person` structured data.
- **Conversion role** Trust, then hand off to `/work` or `/contact`.
- **Primary content** Long bio, expertise, philosophy, the six-stage protocol, a link to editorial standards, portraits.
- **Internal links** How-I-test pillar, `/editorial-standards`, `/work`, `/contact`, 2 recent reviews.

### `/reviews`

- **Purpose** The library. The reason the site exists as a destination rather than a business card.
- **Audience** A (beauty readers), heavily.
- **SEO intent** Category-level: "makeup reviews", "foundation reviews", "skincare reviews", Arabic equivalents. Genuinely competitive; expect this to be a slow-earning page.
- **Conversion role** Depth of session. Multiple review views is the leading indicator that the site is working.
- **Primary content** Faceted index (category, brand, disclosure type, verdict), the method stated once, most recent and most useful reviews.
- **Internal links** Every review, every brand, the how-I-test pillar.
- **Design constraint** Filters must be crawlable navigation, not a client-only widget, or the review corpus becomes discoverable only through the sitemap. See `docs/TECHNICAL_RECOMMENDATION.md` section 6.

### `/reviews/[slug]`

- **Purpose** The atomic unit of value and the primary organic landing page.
- **Audience** A, arriving from search on a specific product name.
- **SEO intent** Highest-value on the site. Long-tail, high-intent, product-specific: `[product] review`, `[product] تجربة`, `[product] تقييم`.
- **Conversion role** Read, then read another. Contact conversion here is incidental.
- **Primary content** Disclosure above the fold, testing conditions, observations, results, pros/cons, suitability, verdict, update log, related.
- **Internal links** Product, brand, 2 related reviews, 2 journal articles, the how-I-test pillar, related work where one exists.
- **Structured data** `Review` with `itemReviewed: Product`. See `docs/SEO_ENTITY_STRATEGY.md` section 5 for the eligibility constraints, which are stricter than they look.

### `/brands` and `/brands/[slug]`

- **Purpose** Two jobs: help a reader who shops by brand, and show a brand that its category is covered seriously.
- **Audience** A and B.
- **SEO intent** `[brand] review` is a real and reachable query pattern, and brand pages aggregate topical relevance across multiple reviews.
- **Conversion role** For audience B this is often the page that precedes a contact.
- **Primary content** Brand description, relationship status where confirmed, reviews of that brand, related work, official link.
- **Internal links** All reviews of the brand, related work, `/reviews`.
- **The argument against** With 5 brands these pages are thin, and a thin page that exists only to be an SEO surface is exactly what the master spec forbids. **Recommendation: build the brand entity and the `/brands/[slug]` route, but gate the index and the detail page behind a minimum of two published reviews per brand.** Below that threshold, a brand is a filter value on `/reviews`, not a page. Revisit at 20+ reviews.

### `/work` and `/work/[slug]`

- **Purpose** The commercial argument. This is the page that earns the project its business case.
- **Audience** B and C almost exclusively.
- **SEO intent** Low and that is correct. Nobody searches for these pages; they are arrived at from `/about`, from the homepage, or from a direct link in an email.
- **Conversion role** Highest on the site. This is the last page before `/contact`.
- **Primary content** Brief, approach, deliverables, media, results where a written source exists, disclosure.
- **Internal links** Brand, related review, `/contact`.
- **Note** `/work` must not duplicate `/reviews`. The distinction is commissioned work versus independent editorial, and the two are deliberately cross-linked in the mock data so the boundary is visible rather than blurred.

### `/journal` and `/journal/[slug]`

- **Purpose** Topical authority above the product level, and the home of the method.
- **Audience** A primarily, C secondarily.
- **SEO intent** Informational, mid-funnel: "how to evaluate foundation performance", "why does my skincare pill". Less competitive than category terms and more defensible than product terms.
- **Conversion role** Entry point that routes to reviews.
- **Primary content** Editorial articles, 2 pillars and 4 supporting in the mock set.
- **Internal links** Down to reviews, across to sibling articles, up to the pillar.

### `/editorial-standards`

- **Purpose** Disclosure policy, corrections policy, the medical boundary, and the position on AI-generated content, at a real indexable URL.
- **Audience** All three, plus search-quality evaluation.
- **SEO intent** Not a traffic page. It is an E-E-A-T asset and a trust artefact, and it is the page a brand's legal team will open.
- **Recommendation: add this route.** It is not in the master spec's candidate list, and it is the single highest-value addition available. It costs one page and it substantiates the entire positioning. Linked from the footer and from every review's disclosure block.

### `/contact`

- **Purpose** The primary conversion.
- **Audience** B and C.
- **SEO intent** Brand-navigational only.
- **Primary content** Inquiry-type routing (collaboration, product testing, press, event, other), the collaboration bio, what Zina does and does not accept, response expectation.
- **Note** Requires a form backend, spam protection, and a privacy position. The applicable privacy regime is unknown (see Unknown U-03 in `docs/PROJECT_DISCOVERY.md`) and is blocking for implementation, not for design.

### `/404`

Not a formality. A review site accumulates dead links from social posts and reformulated products. The 404 should offer search and the most recent reviews.

---

## 3. Routes evaluated and deferred

### 3.1 `/press` — defer

The master spec already qualifies it with "only if useful after content discovery". No press
mentions are verified. `content/mock/press.json` exists to prove the template can be built, and
is flagged as the highest-risk file in the project. **Build the route only when at least three
verified mentions exist.** Until then a fabricated or empty press page actively damages
credibility. The footer link in `content/mock/site.json` is conditional on this.

### 3.2 `/reviews/foundation`, `/reviews/skincare` — defer, then add

Category landing pages are the correct way to compete for "foundation reviews". They are also
thin and duplicative below roughly 5 reviews per category. **Recommendation: `/reviews` filters
by category from launch; promote a category to its own indexable route with unique introductory
copy once it holds 5+ reviews.** Design the filter URLs now so the promotion is a routing change,
not a URL migration.

### 3.3 `/how-i-test` as a top-level route

The testing method is the brand. There is an argument for lifting it out of `/journal` to
`/how-i-test`. **Recommendation: keep the canonical URL in `/journal/how-i-test-beauty-products`
and treat `/how-i-test` as a permanent 301 alias**, so a memorable URL exists without splitting
the article out of the cluster it anchors.

### 3.4 Arabic locale tree `/ar/...`

The largest open scope question in the project. See `docs/PROJECT_DISCOVERY.md` decision D-04.
The IA above is locale-agnostic and every route can be duplicated under `/ar/` without
restructuring, so this decision can be deferred without cost. It cannot be deferred past Phase 5.

### 3.5 `/products/[slug]` — reject

Tempting, because `Product` is a separate entity. But a product page whose content is a brand's
own description plus a link to the review is precisely the thin, duplicative page the SEO strategy
forbids (section 14: "copy manufacturer descriptions as the main content"). Product data renders
inside the review. Revisit only if a single product accumulates 3+ reviews across reformulations,
at which point a product hub becomes genuinely useful.

---

## 4. Internal-link graph

```
Home ──> Review ──> Product data (inline)
  │        ├──> Brand ──> other Reviews of that Brand
  │        ├──> 2 related Reviews
  │        ├──> 2 Journal articles
  │        ├──> How-I-Test pillar
  │        └──> Work (where a project relates)
  ├──> Journal ──> Reviews it cites ──> Brands
  ├──> Work ──> Brand ──> Reviews ──> Contact
  └──> About ──> How-I-Test ──> Editorial Standards ──> Contact
```

Enforced by `tools/validate-content.mjs`: every reference resolves, and every review is reachable
from at least one brand or journal article. The current mock graph has zero orphans.

---

## 5. Navigation

Primary: Reviews, Brands, Work, Journal, About, Contact.

Six items is the upper bound for a premium editorial header. If `/brands` is gated behind the
two-review threshold in 2.6, the header drops to five, which is better. Phase 1 should test that
version first.

Footer carries three groups: Content, Professional, Standards. The Standards group is where
editorial standards, disclosure, privacy and terms live, and it exists to be found rather than to
be hidden.
