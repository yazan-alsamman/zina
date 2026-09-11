# SEO Content Hierarchy

**Status:** Phase 1 decision. Maps `docs/SEO_KEYWORD_MAP.md` onto the information architecture.

> **Reminder from Phase 0:** no search volume data has been obtained. Priorities here rank
> *strategic value* — how well a query matches content Zina can genuinely produce, how defensible
> the position is, and how close it sits to a conversion — not measured demand. The validation plan
> is `docs/SEO_KEYWORD_MAP.md` section 7.

---

## 1. The three tiers

```
TIER 1  AUTHORITY          Who she is, how she works, what she has
        /  /about  /method  /reviews  /journal  /brands

TIER 2  SUPPORTING          The evidence
        /reviews/{slug}  /journal/{slug}  /work/{slug}  /brands/{slug}

TIER 3  LONG-TAIL           The queries the evidence answers
        specific products, comparisons, categories, Arabic long-tail
```

Tier 1 pages are few, deeply linked and rarely changed. Tier 2 pages are many, each narrow, and
carry the actual organic acquisition. Tier 3 is not a set of pages — it is the demand that Tier 2
pages capture. **The single most common architectural error in SEO is building Tier 3 pages.**

---

## 2. Tier 1 — authority

| Page | Role | Target intent | Realistic expectation |
|---|---|---|---|
| `/{loc}/` | Entity anchor | Brand navigational: `zina almokri`, `زينا المقري` | Will rank for the name. Should not be optimised for anything else |
| `/{loc}/about/` | `Person` entity anchor | Brand + entity | Supports the knowledge-graph picture more than it earns clicks |
| `/{loc}/method/` | **The differentiator** | `how are beauty products tested`, `كيف تختبر منتجات التجميل` | Genuine informational traffic *and* the strongest E-E-A-T asset. The one Tier 1 page that is also a traffic page |
| `/{loc}/reviews/` | Category hub | `makeup reviews`, `أفضل كريم أساس` | Competitive. Slow. Do not expect early wins |
| `/{loc}/journal/` | Cluster hub | Format-level | Low direct traffic, high distribution value |
| `/{loc}/brands/` | Brand hub | Low | Navigational, gated |

**`/method/` is the strategic centre.** It is the only page that is simultaneously a trust artefact
for audience B, a conversion moment for audience A, and a plausible ranking page for a real
informational query. Every review links to it, which is what accumulates its authority.

`/editorial-standards/` sits alongside Tier 1 in function — it is a trust artefact — but is not a
traffic page and is not optimised as one.

---

## 3. Tier 2 — supporting content

| Type | Count now | Intent | Value | Notes |
|---|---|---|---|---|
| **Review pages** | 6 (10 locale-pages) | Commercial investigation, product-specific | **Highest** | The acquisition engine. Every review is a landing page |
| **Journal articles** | 6 (10 locale-pages) | Informational, problem-led | High | Less competitive than product terms and more defensible than category terms |
| **Brand pages** | 3–4 per locale after gating | Commercial investigation, brand-led | Medium | Aggregate. Gated to prevent thin pages |
| **Work pages** | 4 (7 locale-pages) | Near zero | Low search, **highest conversion** | Correctly not optimised for search |

### Query patterns per type

**Reviews** — `[product] review`, `[product] تجربة`, `[product] تقييم`, `is [product] worth it`,
`[product] مناسب لمن`, `[product] long wear test`.

**Journal** — `why does my foundation break down`, `why does my skincare pill`,
`how to compare foundations`, `difference between satin and natural finish`,
`ليش يطلع الميكب من وجهي`, `درجات البشرة بالعربي`.

**Brands** — `[brand] review`, `is [brand] any good`.

**Work** — arrived at from a link or a name search, not from a query.

---

## 4. Tier 3 — long-tail, mapped to content types

**No page is created because a keyword exists.** Every row maps a demand pattern onto a content
type that would exist anyway.

| Long-tail pattern | Captured by | Exists? | Priority |
|---|---|---|---|
| `[product] review` | Review page | Yes, 6 | **P1** |
| `[product] تجربة` / `تقييم` | Review page, ar | Yes, 5 | **P1** |
| `[product] in hot weather` / `مكياج يثبت بالحر` | Review page — the conditions block | Yes | **P1** |
| `concealer for deep warm skin tones` | Review page — shade-range observations | Yes | **P1** |
| `درجات البشرة بالعربي` | Journal, ar-original | Yes | **P1** |
| `why does my foundation break down` | Journal guide | Yes | **P1** |
| `how are beauty products tested` | Method | Yes | **P1** |
| `[A] vs [B]` | Comparison article | **No — gap** | **P1** |
| `foundation reviews` (category) | `/reviews/foundation/` | **No — gated** | P3 until 5 reviews |
| `[brand] review` | Brand page | Partly — gated | P2 |
| `is [product] worth it` | Review page | Covered by existing reviews | P2 |
| `beauty creator for product launch` | Work index | Yes | P3 |

### The one real gap

**Comparison content.** `[A] vs [B]` is a distinct high-intent format the model supports and the
corpus lacks: the `comparisons` journal category currently holds a *method* article about comparing
products but no actual comparison. It is also the trigger that could promote a product to its own
route (`docs/PRODUCT_ENTITY_STRATEGY.md` section 3).

Recommended first comparison: the two complexion products already tested against each other in the
mock data, which is why `comparedAgainstProductIds` exists on the review model.

---

## 5. The four defensible seams

From `docs/SEO_KEYWORD_MAP.md` section 3, now mapped to structure:

| Seam | Where it lives | Structural support |
|---|---|---|
| **Climate-conditioned performance** | Review `conditions[]` + `/method/` `conditions` stage | Published temperature and humidity on every review. Almost nobody does this |
| **Shade accuracy for medium-deep warm and olive** | Review shade-range observations + the Arabic vocabulary article | `shadeTested`, `shadeCount`, and a dedicated Arabic-original article |
| **Claim verification** | Product `brandClaims[]` versus review `observations[]` | The claims/observations separation is a repeatable content format, not just an integrity control |
| **Failure diagnosis** | Journal `guides` and `testing-notes` | Articles link down to the reviews that evidence them |

Each seam is a *structural* property of the content model rather than an editorial intention, which
is why it will survive a change of writer or a change of pace.

---

## 6. Priority of build and of publication

If effort must be sequenced:

1. **`/method/` in both locales.** Nothing else works without it. It is the pillar every review
   links to and the page that makes the positioning legible.
2. **Review pages.** The acquisition engine and the primary template.
3. **`/reviews/` index with crawlable facets.** Without crawlable facets the corpus is reachable
   only from the sitemap.
4. **Journal articles.** Distribution and topical authority.
5. **`/about/` and `/editorial-standards/`.** Entity and trust.
6. **`/work/` and `/contact/`.** Conversion — low traffic, high value.
7. **Brand pages.** Gated; several do not qualify yet.
8. Deferred: category routes, press, product hubs.

---

## 7. Measurement

Do not measure rankings first. Measure, in order:

1. **Indexed quality pages** per locale — the precondition for everything.
2. **Branded impressions** in both scripts — is the entity resolving?
3. **Non-branded impressions** on review pages — is the acquisition engine working?
4. **`/method/` entrances** — is the differentiator being found?
5. **Review-to-review depth** — is the internal-link graph doing its job?
6. **`/work/` → `/contact/` rate** — is the commercial path working?

Expect 6 to 12 months before organic acquisition is meaningful (Risk R-06). Saying so now is part
of the architecture, because a correct build judged against a wrong timeline gets called a failure.
