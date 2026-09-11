# SEO Keyword and Topic Map

**Status:** Phase 0. Strategic hypotheses, not validated demand.

---

## 0. What this document is, and what it is not

> **No search volume data was obtained for this project.** No keyword tool, Search Console
> property, or clickstream source was available during Phase 0. Every query below is a
> **hypothesis about search intent**, derived from the content model and from how the category
> behaves, not a measured term.

The `Priority` column therefore ranks **strategic value** — the combination of how well the query
matches content Zina can genuinely produce, how defensible the position is, and how close the
query sits to a conversion — and explicitly **not** estimated volume.

Section 7 is the validation plan that converts these hypotheses into measured terms. Do not treat
this map as validated until that work is done, and do not let anyone quote a number from it.

Two things below *are* grounded in verified sources rather than reasoning: Google's current
treatment of first-hand experience in reviews, and the documented behaviour of Arabic-language
search in Gulf markets. Both are cited in section 8.

---

## 1. Cluster map

| Cluster | Search Intent | Example Query | Target Page | Priority |
|---|---|---|---|---|
| **Brand — Latin** | Navigational | `zina almokri` | `/` | P1 |
| Brand — Latin | Navigational | `zina almokri reviews` | `/reviews` | P1 |
| Brand — Latin | Navigational | `zina almokri collaborations` | `/work` | P2 |
| **Brand — Arabic** | Navigational | `زينا المقري` | `/` (ar) | P1 |
| Brand — Arabic | Navigational | `زينا المقري تجميل` | `/` (ar) | P1 |
| Brand — Arabic | Navigational | `زينا المقري مراجعات` | `/reviews` (ar) | P2 |
| **Product review — EN** | Commercial investigation | `[product name] review` | `/reviews/[slug]` | **P1** |
| Product review — EN | Commercial investigation | `is [product] worth it` | `/reviews/[slug]` | P2 |
| Product review — EN | Commercial investigation | `[product] long wear test` | `/reviews/[slug]` | P2 |
| Product review — EN | Commercial investigation | `[product] pros and cons` | `/reviews/[slug]` | P3 |
| **Product review — AR** | Commercial investigation | `[product] تجربة` | `/reviews/[slug]` (ar) | **P1** |
| Product review — AR | Commercial investigation | `[product] تقييم` | `/reviews/[slug]` (ar) | P1 |
| Product review — AR | Commercial investigation | `[product] مناسب لمن` | `/reviews/[slug]` (ar) | P2 |
| Product review — AR | Commercial investigation | `[product] يستاهل` (dialect) | `/reviews/[slug]` (ar) | P2 |
| **Brand entity** | Commercial investigation | `[brand] review` | `/brands/[slug]` | P2 |
| Brand entity | Commercial investigation | `is [brand] any good` | `/brands/[slug]` | P3 |
| **Category** | Commercial investigation | `foundation reviews` | `/reviews` (category facet) | P3 |
| Category | Commercial investigation | `concealer reviews` | `/reviews` (category facet) | P3 |
| Category | Commercial investigation | `mascara reviews` | `/reviews` (category facet) | P3 |
| Category | Commercial investigation | `serum reviews` | `/reviews` (category facet) | P3 |
| Category — AR | Commercial investigation | `أفضل كريم أساس` | `/reviews` (ar) | P3 |
| **Method / trust** | Informational | `how are beauty products tested` | `/journal/how-i-test-beauty-products` | **P1** |
| Method / trust | Informational | `how to tell if a beauty review is honest` | `/journal/what-makes-a-beauty-review-useful` | P2 |
| **Problem-led** | Informational | `why does my foundation break down` | `/journal/how-to-evaluate-foundation-performance` | **P1** |
| Problem-led | Informational | `why does my skincare pill` | `/journal/building-a-practical-routine` | **P1** |
| Problem-led | Informational | `difference between satin and natural finish` | `/journal/understanding-finish-and-texture` | P2 |
| Problem-led | Informational | `how long to test a new skincare product` | `/journal/building-a-practical-routine` | P2 |
| Problem-led — AR | Informational | `ليش يطلع الميكب من وجهي` (dialect) | `/journal/...` (ar) | P2 |
| **Climate-specific** | Commercial investigation | `foundation for hot humid weather` | `/journal` + `/reviews` facet | **P1** |
| Climate-specific | Commercial investigation | `makeup that lasts in heat` | `/reviews` facet | P1 |
| Climate-specific — AR | Commercial investigation | `مكياج يثبت بالحر` | `/reviews` (ar) | P1 |
| **Shade-range** | Commercial investigation | `concealer for deep warm skin tones` | `/reviews/[slug]` | **P1** |
| Shade-range | Commercial investigation | `foundation that does not pull pink` | `/reviews/[slug]` | P2 |
| **Comparison** | Commercial investigation | `[product A] vs [product B]` | Comparison review (future) | P2 |
| **Commercial / B2B** | Transactional | `beauty creator for product launch [region]` | `/work` | P3 |
| Commercial / B2B | Transactional | `arabic beauty content creator collaboration` | `/contact` | P3 |

---

## 2. Pillar and supporting architecture

**Pillar 1 — Testing method** `/journal/how-i-test-beauty-products`
Anchors everything. Supported by: what makes a review useful, how to compare products fairly.
Linked from every single review. This is both the strongest E-E-A-T asset and, because "how are
these tested" is a real informational query, a plausible traffic page in its own right.

**Pillar 2 — Complexion performance** `/journal/how-to-evaluate-foundation-performance`
Supported by: understanding finish and texture, plus every foundation and concealer review.
This is the cluster where Zina's stated expertise is deepest and the competition is weakest,
because most complexion content is impressionistic.

**Pillar 3 — The review library** `/reviews`
Supported by every review. Category facets promote to pillar-status pages at 5+ reviews each
(see `docs/SITEMAP_PROPOSAL.md` 3.2).

**Pillar 4 — Brands** `/brands`
Gated behind two reviews per brand. Currently a weak pillar and should not be forced.

---

## 3. Long-tail opportunities

The realistic organic strategy for a new site is not "foundation reviews". It is the specific
question nobody else answers. Four seams, ranked by defensibility:

1. **Climate-conditioned performance.** Nearly all long-wear testing is done in temperate or
   air-conditioned conditions. "Does X survive 38 degrees and 70% humidity" is a real question
   with almost no credible content behind it, and it is a question Zina is positioned to own.
2. **Shade accuracy for medium-deep warm and olive undertones.** Structurally under-served,
   high emotional stakes, high purchase intent, and it produces naturally long queries.
3. **Claim verification.** "Is the 16-hour claim true" as a repeatable content format. Every
   product ships with a testable claim, which makes this an infinitely renewable seam that also
   differentiates the brand.
4. **Failure diagnosis.** "Why does my X do Y" queries route naturally into product reviews and
   are far less competitive than the product terms themselves.

---

## 4. Content gaps in the current mock corpus

| Gap | Why it matters | Priority |
|---|---|---|
| No comparison content | `[A] vs [B]` is a distinct, high-intent format the model supports but the corpus lacks | High |
| No category landing copy | Facets have no unique introductory content to rank with | Medium |
| No FAQ blocks on reviews | Recurring questions per category; also a `FAQPage` opportunity | Medium |
| No glossary | Finish and texture vocabulary is genuinely non-standard; a glossary is a natural internal-link hub | Medium |
| No "currently testing" surface | The model supports `testingStatus: Tested` + `reviewStatus: Draft`; nothing renders it | Low |
| No Arabic-first article | Every Arabic field is currently a parallel of an English one, which is the wrong model for Arabic-first intent | High, if D-04 goes bilingual |

---

## 5. Internal-link opportunities

- Every review links to the method pillar. Non-negotiable, and it is the highest-value repeated
  internal link on the site.
- Every review links to exactly 2 related reviews and 2 journal articles. Enough to build the
  graph, few enough not to dilute.
- Journal articles link down to the reviews that evidence them. A guide that says "most bases
  end the day one step shinier" should point at the review where that was photographed.
- Brand pages aggregate reviews. This is their only real SEO justification and the reason for the
  two-review gate.
- Work case studies link to the related independent review, which is unusual and is itself a
  trust signal: it shows the paid and unpaid work side by side.

---

## 6. Possible SERP features

| Feature | Eligibility | Assessment |
|---|---|---|
| Review snippet (stars) | `Review` + `itemReviewed` | Plausible. Third-party review of a product is permitted; the self-serving restriction does not apply here. Constraints in `docs/SEO_ENTITY_STRATEGY.md` 5. |
| Sitelinks | Site-level | Likely for brand queries once the site has authority |
| Knowledge panel | `Person` entity | Long-term. Depends on consistent `sameAs` and third-party corroboration |
| Image pack | Image SEO | **High opportunity.** Swatch, texture and eight-hour comparison imagery is exactly what image search surfaces for beauty queries, and original photography is a genuine advantage |
| Video | If video is published | Depends on whether video lives on-site or stays on social |
| FAQ rich result | `FAQPage` | Heavily reduced by Google in recent years. Do not architect around it |
| Discover | Freshness + engagement | Plausible for Arabic-language beauty content; not something to plan for |

---

## 7. Validation plan (the work this document cannot do)

Nothing above is validated. Before Phase 8, in this order:

1. **Confirm the domain** (Unknown U-01). Everything downstream needs it.
2. **Stand up Search Console** on the real property, plus Bing Webmaster Tools. This is the only
   free source of query data that is actually about this site.
3. **Run one keyword tool with Arabic support** against the map. Most Western tools have poor
   Arabic coverage; budget for one that does not.
4. **Separate Gulf from Levantine and North African query patterns.** Dialect materially changes
   the terms, and the correct target set depends on where Zina's audience actually is — which is
   currently unknown, since her location is mock data.
5. **Pull the real product names** she has tested. Half of the P1 rows are `[product name]`
   templates that cannot be validated in the abstract.
6. **Check SERP composition** for 10 representative queries. If a query returns only retailer and
   marketplace pages, an editorial review will not win it regardless of quality, and it should be
   demoted in this map.
7. **Re-rank this table** against measured data and record what changed.

---

## 8. Arabic search intent (grounded findings)

Arabic keywords must be researched, not translated. Four documented behaviours change the
approach materially:

- **Gulf, Levantine and North African users search differently.** Ignoring dialect leads to
  targeting zero-volume terms. The correct dialect depends on where Zina's audience is, which is
  currently unverified.
- **Bilingual and code-switched querying is normal.** The same person may keep a brand or product
  name in Latin script while writing the rest of the query in Arabic. Product review pages must
  therefore carry the Latin product name inside Arabic content, not a transliteration of it.
- **Arabic queries tend to be longer and more conversational**, which favours the problem-led and
  question-shaped content in Pillar 2 over short category terms.
- **Modern Standard Arabic suits formal pages; dialect suits conversational search.** A plausible
  split is MSA for `/about`, `/work` and `/editorial-standards`, and dialect-aware phrasing in
  review and journal headings.

Two further constraints worth stating:

- **Never machine-translate review content.** Beyond the quality problem, a translated review
  implicitly claims a test that was described in another language, and the nuance in observation
  language is the product.
- **Google's reviews system rewards demonstrable first-hand experience**: original photography,
  specific measurable observations, real testing, and honest acknowledgement of limitations,
  rather than restated specifications. The content model in `docs/CONTENT_MODEL.md` was built
  around this, which means the SEO strategy and the editorial strategy are the same strategy.

### Sources

- [Google Search Central: Review snippet structured data](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Amsive: Google's newest reviews update elevates real-life experience](https://www.amsive.com/insights/seo/googles-newest-reviews-update-elevates-real-life-experience/)
- [Contentech: Arabic SEO in 2025, why most brands are still getting it wrong](https://contentech.com/arabic-seo-in-2025-why-most-brands-are-still-getting-it-wrong/)
- [Shahan Digital: What is Arabic SEO, the complete 2026 guide](https://shahandigital.com/arabic-seo/)
- [Maps of Arabia: Arabic keyword research for SEO](https://mapsofarabia.com/arabic-keyword-research-for-seo/)
