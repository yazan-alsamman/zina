# Phase 1 — Completion Report

**Information architecture, content architecture and SEO architecture**

| | |
|---|---|
| **Status** | Complete |
| **Phase** | 1 — Information architecture and content strategy |
| **Date** | 2026-09-07 |
| **Overall confidence** | **High** on IA, content models, routing, multilingual architecture and internal linking. **Medium** on SEO priorities (still no volume data). **Medium** on Arabic dialect targeting (audience geography still unknown) |
| **Website built** | **None.** Correct for this phase |
| **Next phase begun** | **No.** Stopped at the handoff gate |

---

## 1. Executive Summary

Phase 1 converted Phase 0's intelligence into a decided architecture, and applied four decisions
handed down with the brief: bilingual Arabic and English as first-class languages, Astro, no
numeric ratings, and press deferred.

**Four structural decisions define the phase.**

**The Method was promoted to a top-level route.** In Phase 0 the six-stage testing protocol was a
journal article. It is now a first-class entity (`content/mock/method.json`) with its own route in
both locales, its own place in primary navigation, and a mandatory link from every review. This is
the clearest structural expression of the positioning: a site whose differentiator is a method
should not bury that method inside a category. Every one of the four user journeys passes through
it, and each stage now carries a required `doesNotProve` field — the mechanism that keeps it
*structured personal testing* rather than an implied claim of clinical authority.

**Locale is an authoring language, not a rendering option.** A record exists in a locale because
someone wrote it in that locale. Missing translations produce no route, no hreflang alternate and
no stub — never a machine translation. The mock dataset was rebuilt with deliberately uneven
coverage, including one Arabic-original review and one Arabic-original article that could not
sensibly exist in English, so that every missing-translation state is a tested state rather than a
surprise.

**Thin pages are prevented by computed gates, not by discipline.** Brand pages and journal category
pages are generated only when they earn it, evaluated **per locale**. The fixture data deliberately
produces all three states — indexable in both locales, indexable in one, gated in both — and the
validator computes and prints the matrix on every run.

**Numeric ratings were removed entirely**, and the validator now fails the build if any
`rating`, `score` or `stars` field reappears in a review. The cost is stated honestly rather than
glossed: `reviewRating` is required for Google review snippets, so this **forfeits star rich
results**. That trade was made deliberately and is documented where someone will find it before
undoing it.

The mock dataset was rebuilt rather than patched: 42 records across 11 collections, bilingual,
ratings removed, method extracted, lifecycle states added. The validator was rewritten for the new
schema and now enforces routing, gating, locale and editorial rules that no code review would
reliably catch.

---

## 2. Final Sitemap

`{loc}` is `en` or `ar`.

```
/                                       302 -> /{loc}/          never indexed, x-default -> /en/

/{loc}/                                 Home
/{loc}/about/                           About
/{loc}/method/                          Method pillar            ★ promoted in Phase 1
/{loc}/reviews/                         Review index, faceted
/{loc}/reviews/{slug}/                  Review
/{loc}/brands/                          Brand index
/{loc}/brands/{slug}/                   Brand                    GATED per locale
/{loc}/work/                            Work index
/{loc}/work/{slug}/                     Case study
/{loc}/journal/                         Journal index
/{loc}/journal/{category}/              Journal category         GATED per locale
/{loc}/journal/{slug}/                  Article
/{loc}/editorial-standards/             Editorial standards
/{loc}/contact/                         Contact
/{loc}/privacy/   /{loc}/terms/         Legal
/{loc}/404/                             Not found                noindex

/sitemap.xml  /sitemap-en.xml  /sitemap-ar.xml  /robots.txt
```

**Deferred — architecture exists, route not built:** `/{loc}/press/`,
`/{loc}/reviews/{category}/`, `/{loc}/brands/{brand}/{product}/`, `/{loc}/method/{stage}/`,
`/{loc}/search/`.

**Rejected:** a top-level `/products/` tree.

Machine-readable source: the `routes` array in `content/mock/site.json`, which generates the
sitemap, hreflang map and navigation.

---

## 3. Information Architecture

Full per-route specification — purpose, audience, search intent, conversion intent, content type,
parent, children, indexability, priority — in **`docs/INFORMATION_ARCHITECTURE.md`**.

Changes from the Phase 0 proposal:

| Change | Reason |
|---|---|
| Method promoted to a top-level route | The core differentiator cannot live inside a category |
| **Brands removed from primary navigation** | Two of five mock brands fail the gate in at least one locale. Promoting a partially populated section advertises the emptiest part of the site |
| Journal category route layer added | Needed as the corpus grows; cheap now, expensive to retrofit |
| Every route localised under `/{loc}/` | Bilingual is now a decision |
| Numeric ratings removed from the review model | Explicit decision |

Depth is capped at three segments after the locale. Every content page is reachable from the home
page in at most three clicks. Breadcrumbs mirror the URL exactly, so `BreadcrumbList` is derived
from the path rather than maintained separately — and a breadcrumb never names a page that does not
exist.

**Scaling.** The IA is unchanged at 10, 50, 200 and 500 reviews. What changes is which gated routes
switch on, which is a data threshold rather than a restructure. The only change that would force a
redesign is a second author, which is deliberately unmodelled: an author page on a single-author
site duplicates `/about/`.

---

## 4. Content Models

Full field-level specification — type, required, purpose, validation, mock example, localised — in
**`docs/CONTENT_MODELS.md`**. Types in `content/schema/types.ts` (493 lines, zero dependencies).

**The localisation shape:** locale-independent *facts* on the record; locale-dependent *words* in
`locales[code]`. An absent key means the record does not exist in that language.

```jsonc
{ "id": "…", "status": "mock", "entity": { … },
  "locales": { "en": { "slug": "…", "translationStatus": "original", … },
               "ar": { "slug": "…", "translationStatus": "adapted",  … } } }
```

`translationStatus` distinguishes `original` (authored first here) from `adapted` (independently
written from the same brief and testing data — not a translation). Exactly one `original` per
record, validator-enforced.

Twelve models specified: Profile, SocialProfile, Brand, Product, Review, ReviewDisclosure,
ReviewObservation, MethodStage, Work, JournalArticle, MediaAsset (three variants), SEO metadata,
localised content.

**The alternative considered** — per-locale directories joined by shared id — is noted with its
trade-offs and flagged as the natural shape at CMS migration.

---

## 5. Review Architecture

Full specification in **`docs/REVIEW_PAGE_ARCHITECTURE.md`**. 23 sections in fixed DOM order,
identical on mobile.

**Design principle: this is a testing report, not an article.** The section order is fixed and is
not an editorial choice per post, because two reviews must be readable side by side.

Sections 8–11 — testing context, method stages applied, observations, visual evidence — are the
report. Everything before is orientation, everything after is navigation. If a design pass
compresses the page, those four survive intact.

**The claims/observations/verdict separation** is the central rule. Three kinds of statement must be
visually distinguishable *without reading them*: a brand claim (`product.brandClaims[]`, quoted and
recessed), an observation (`observations[]`, timestamped and primary), and a verdict (opinion,
marked as judgement). The data model makes blurring them impossible; the design must make the
distinction visible.

**Disclosure** is `above-content` and not configurable downward. Six primary states plus three
modifiers. Every disclosure carries a statement, not just a badge.

**Eleven template states** are present in the mock data and enumerated in the doc — paid disclosure
on a critical review, two-part disclosure, no comparison product, brand gated in this locale, no
related work, empty update log, a test that could not determine something, missing English version,
missing Arabic version, long observation list, RTL rendering. None is theoretical.

---

## 6. Method Architecture

New in Phase 1. Entity: `content/mock/method.json`. Route: `/{loc}/method/`, required in both
locales — the validator fails the build if either is missing, because a bilingual site whose core
differentiator exists in one language is not bilingual.

**Six stages**, each with five required fields:

| Stage | Purpose | What it does not prove |
|---|---|---|
| **Baseline** | Fixed reference before any product | Does not establish a skin type or say anything about anyone else's skin |
| **Application** | Quantity, tool, preparation, set time | A good or bad result does not establish the formula is good or bad |
| **Wear window** | Fixed period with timed check-ins | Eight hours says nothing about months; four weeks cannot isolate a product from the season |
| **Conditions** | Temperature, humidity, activity, environment | Describes one test. Failure at 38°C is not failure at 22°C |
| **Comparison** | Against a previously tested product | Ranks two products in one condition on one face. Never establishes which suits you |
| **Revisit** | Re-test, update, re-date | Confirms nothing about other production batches |

**`doesNotProve` is a required field on every stage**, not a disclaimer at the end. Plus a
`boundaryStatement` that must explicitly deny clinical testing — validator-enforced in both
locales — and a `whatThisCannotTell` list of at least three global limits.

This is what keeps the language at *structured personal testing* rather than *clinical testing*.
The Method is also the reason the design proposal reserves its "laboratory" treatment for evidence
blocks: precision that reads as documentation, not as a medical claim.

Every review declares `testing.methodStageKeys` — which stages it applied. Not every review applies
all six (the Velvet Hour review applies four, with no comparison and no revisit), so the Method page
can show real coverage rather than a claim.

---

## 7. Brand Architecture

Full specification in **`docs/BRAND_ARCHITECTURE.md`**.

**The index gate**, evaluated per locale:

```
(reviews >= 2) OR (reviews >= 1 AND work >= 1)
AND description >= 120 characters
AND a logo asset exists
```

Per locale because review coverage differs by language: a global gate would either publish a thin
Arabic page or suppress a substantial English one. `indexPolicy` allows `force-index` /
`force-noindex` overrides, which are editorial decisions requiring a written reason.

Computed and printed by the validator on every run:

| Brand | en | ar |
|---|---|---|
| Maison Eclat | indexable | indexable |
| Veloura Beauty | indexable | **gated** — 1 review, 0 localised work |
| Lune Skin | indexable | indexable |
| Atelier Noor | indexable | indexable |
| Terra Sana | **gated** — 0 reviews | **gated** — 1 review, 0 work |

A gated brand is not hidden — it is not a page. It remains an entity and a filter value on
`/reviews/`. **Every brand link is a function of the gate, evaluated at build time in the current
locale**, and no template may assume a brand page exists. This is the most likely source of a broken
internal link in the architecture, so it is stated as an implementation rule rather than a
convention.

`relationship.status` must be `CONFIRMED` before any relationship label renders. A mock relationship
marked `CONFIRMED` fails the build.

---

## 8. Work Architecture

Full specification in **`docs/WORK_ARCHITECTURE.md`**.

**The core decision: work is the smaller half of the commercial argument.** A brand evaluating Zina
is most persuaded by the quality of her independent reviews, because that is what her audience
trusts and therefore what a campaign would borrow. So every case study links to the independent
review of the same brand where one exists — unusual, and identified in Journey B as the decision
moment. It demonstrates the disclosure policy working rather than describing it.

**The results rule**, enforced by the validator:

```
A figure renders ONLY when source names a written client-supplied origin
AND _verification is CONFIRMED. Otherwise omitted entirely.
Never rounded, never estimated, never inferred.
```

**An empty `results.figures` array is a valid, complete state.** Clients frequently supply nothing,
and a case study that looks broken without numbers creates pressure to invent them. One mock project
has a deliberately empty array for exactly this reason. What replaces numbers is the brief, the
constraint, the decision and the deliverables — which for audience B is often more persuasive anyway.

Work is also the collection most likely to be single-locale: `velvet-hour-wear-series` is
English-only, and that is what gates the Arabic Veloura brand page. A real consequence propagating
correctly through the system.

---

## 9. Journal Architecture

Full specification in **`docs/JOURNAL_ARCHITECTURE.md`**.

**Journal categories are editorial formats, never product categories:** `testing-notes`, `guides`,
`comparisons`, `essays`.

Makeup, skincare and foundation were **rejected** as journal categories. They already exist as
review facets, and running the same taxonomy twice over the same subject creates two competing URL
sets for the same queries, splits internal-link equity, and forces a reader to guess whether
"foundation" means articles or reviews. One taxonomy per axis: **reviews by product category, journal
by editorial format.** This is the decision in this document most likely to be reversed by someone
optimising a keyword in isolation, and it should not be.

**Category gate:** 3+ published articles in that locale. At six articles, **no category qualifies in
either locale** — correct behaviour, not a gap. `guides` (2 per locale) will activate first.

Two journal pillars plus the Method pillar outside the journal. `type: Pillar | Supporting` is a
field, so cluster structure is data rather than a hand-maintained diagram.

**Production bodies should be MDX**, not the JSON outlines used in mock. Reviews stay structured
JSON because their value is being the same shape every time; articles are the opposite. This is the
one principled divergence in storage format.

---

## 10. Product Entity Decision

Full analysis in **`docs/PRODUCT_ENTITY_STRATEGY.md`**. Phase 0's rejection was re-evaluated and
**confirmed**.

**Product remains a first-class entity with no route of its own.** Entity and page are separate
questions; conflating them is what produces thin product pages across the web.

*The entity must exist* — a product accumulates reviews over time, can be tested but not yet
written up, owns the brand's claims separately from observations, and is referenced by brand pages
and comparisons.

*The page must not exist today* — its entire content would be a manufacturer description plus a
link to the one review that has all the value. It would also **compete with its own review** for
`[product] review`, splitting signals between two URLs where one has all the original content.

**Promotion trigger:** 2+ published reviews in a locale, or 1 review plus a published comparison
feature. URL when promoted: `/{loc}/brands/{brandSlug}/{productSlug}/` — nested under the brand to
reinforce the hierarchy and avoid a fourth top-level section. The promoted page would be a *testing
history*, not a product page. No product currently qualifies.

Even when promoted: never standalone `Product` schema, never `offers`.

---

## 11. Internal Linking

Full specification, including orphan prevention, in **`docs/INTERNAL_LINKING_STRATEGY.md`**.

```
Method ──> Reviews ──> Products ──> Brands ──> Work ──> Contact
Journal ──> Reviews ──> Products ──> Brands
```

**The three highest-value links:**

1. **Every review → Method.** The most-repeated internal link on the site. It is what turns a set of
   reviews into a body of work with a named approach.
2. **Journal article → the review that evidences it.** Converts an informational visitor into a
   high-intent reader, and gives the claim a citation.
3. **Work case study → the independent review of the same brand.** The credibility cross-link.

Link counts per page type are generated from the relationship arrays, not written by hand, which is
what makes the graph survive 200 reviews. Both contextual (in-prose) and modular (related blocks)
links are required: modular alone is connected but unexplained, contextual alone is fragile.

**Orphan prevention:** every indexable page has a parent, a breadcrumb, an archive listing it,
inbound contextual links and navigation reachability — all structural. The validator computes
orphans **per locale**; the current graph has **zero orphans in either locale**. Three documented
exceptions (`404` noindex, legal pages footer-only, gated pages not generated at all), none of which
is indexable-and-orphaned.

Past ~50 reviews, `related.*` should become generated-with-manual-override rather than fully
hand-curated.

---

## 12. Multilingual Architecture

Full specification in **`docs/MULTILINGUAL_SEO_ARCHITECTURE.md`**.

**Root:** `/` issues a **302** (not 301) by `Accept-Language`, with cookie override. A 301 would
permanently cache one locale in shared proxies and prevent discovery of the other. `x-default` →
`/en/`. Language is never inferred from IP.

**URLs:** Latin script throughout, English path segments in both locales, per-locale slugs. The
trade-off is stated plainly — Arabic-script slugs would likely give a small SERP benefit but
percent-encode into unreadable strings in Search Console, logs, analytics and shared links. The
decision is reversible (slugs are per-locale data plus a redirect map) and is flagged as open
question Q-3.

**hreflang:** reciprocal pairs for existing locales only, plus self-reference and `x-default`.
Generated from the `locales` keys, so one-directional hreflang is impossible by construction. No
region subtags, because audience geography is unknown.

**The critical rule:** locale variants **never canonicalise to each other**. Canonicalising `/ar/`
to `/en/` would deindex the Arabic site — the most common and most damaging multilingual error.

**Missing translations:** no route, no hreflang alternate, absent from that locale's sitemap and
index pages, related blocks filtered to locale, and a language switcher that **never links to a
404** — it falls back to the section index with a visible explanation, as a real string in both
locales.

**RTL** is specified as a layout concern, not a stylesheet flip: CSS logical properties throughout,
bidirectional isolation (`<bdi>`) for Latin product names inside Arabic text — which will appear on
almost every Arabic review — Western numerals, mirrored directional icons only. **Arabic/Latin type
pairing at display size remains the highest-risk unresolved Phase 2 item.**

**The strategic point:** the highest-value Arabic content will be content with no English
equivalent. `mufradat-darajat-albashara` — why Arabic shade vocabulary does not map onto English
shade vocabulary — could not be translated, because the subject *is* the gap between the two
systems.

---

## 13. SEO Architecture

**`docs/SEO_URL_ARCHITECTURE.md`** and **`docs/SEO_CONTENT_HIERARCHY.md`**.

> Still no search volume data. Priorities rank strategic value, not measured demand. Validation plan
> unchanged: `docs/SEO_KEYWORD_MAP.md` section 7.

**URLs:** trailing slash always; lowercase ASCII hyphenated slugs; no dates or IDs; the word
"review" is *not* in review slugs because the route segment already says it; slugs immutable once
published; reserved category words validator-enforced against slug collision.

**The one architecturally consequential decision: review filters must be crawlable, server-rendered
URLs.** Filters as client-only state leave the corpus reachable only through the sitemap.
Single-facet category URLs promote to indexable at 5+ reviews; multi-facet combinations are never
indexable.

**Content hierarchy:** Tier 1 authority (6 pages), Tier 2 supporting (the evidence), Tier 3
long-tail (demand, *not* pages). The most common SEO error is building Tier 3 pages; every long-tail
row maps onto a content type that would exist anyway.

**`/method/` is the strategic centre** — the only Tier 1 page that is simultaneously a trust artefact
for brands, a conversion moment for readers, and a plausible ranking page for a real query.

**One real content gap:** comparison content. The `comparisons` category holds a *method* article
about comparing products but no actual comparison.

---

## 14. Entity Relationships

Full graph in **`docs/ENTITY_ARCHITECTURE.md`**. Relationships only — **schema is not implemented in
this phase.**

```
Person ──authored──> Review ──itemReviewed──> Product ──madeBy──> Brand ──client of──> Work
   │                    ▲                                            ▲                  │
   └──practises──> Method                                            └──────────────────┘
                        ▲                                     Work ──cross-links──> Review
   Person ──authored──> Journal ──evidences──> Review
```

**Entities are locale-independent; their descriptions are not.** One Zina, one Method, one Maison
Eclat, described in two languages. One `Person` `@id` referenced from both locales — never two
person entities.

**The rating decision and its schema cost, stated plainly:** `Review` will be emitted without
`reviewRating`. Google's documentation lists it as *required* for a review snippet, so this
**forfeits star rich results**. Accepted deliberately — a number makes comparison easy and hides the
reason, and the reason is the product. Nobody should later be surprised that stars do not appear,
and nobody should add a rating field to get them without revisiting the editorial decision.

**Never:** standalone `Product` schema, `offers`, `AggregateRating`, cross-site aggregation,
`Organization` for an unconfirmed entity, unverified `sameAs`, or markup for anything not visible.

`/method/` should be `Article`, not `HowTo` — `HowTo` describes instructions a reader follows, and
would sit awkwardly beside the `doesNotProve` sections whose purpose is to limit the claim.

Eight entity-integrity gates are enforced in data and by the validator.

---

## 15. Mock Data Changes

The dataset was **rebuilt, not patched**. 42 records across 11 collections.

| Change | Detail |
|---|---|
| **Method extracted** | New `method.json` collection. `person.testingProtocol` removed; `person.methodId` references it. The `how-i-test` journal article was promoted out of the journal (6 references updated) |
| **Numeric ratings removed** | All 6 `verdict.rating` values deleted. Validator now fails on reintroduction |
| **Bilingual restructure** | Every content entity gained a `locales` map with per-locale slug, prose and SEO |
| **Lifecycle added** | `status: "mock"` on all 42 records |
| **Review model expanded** | Added `subtitle`, `introduction`, `conclusion`, `evidenceNotes`, `media.evidence[]` (stage-bound), `testing.methodStageKeys`, `testing.durationKnown`. Renamed pros/cons → `strengths`/`limitations` |
| **Disclosure model expanded** | 4 types → 6 primary + 3 modifiers, including `unknown-pending-verification` as the import default |
| **Brand gating** | `indexPolicy` + `indexGate` thresholds, computed per locale |
| **Journal categories** | 4 editorial-format categories added |
| **New Arabic-original article** | `mufradat-darajat-albashara`, no English equivalent |
| **Site config expanded** | Route table, `reservedSlugs`, i18n config, per-locale navigation, ratings policy |
| **Schema version** | 0.1.0 → 1.0.0 across all collections |

**Deliberate locale coverage**, so every missing-translation state is tested:

| Collection | en | ar | Both | en-only | ar-original |
|---|---|---|---|---|---|
| Reviews | 5 | 5 | 4 | 1 | 1 |
| Journal | 5 | 5 | 4 | 1 | 1 |
| Work | 4 | 3 | 3 | 1 | 0 |
| Brands | 5 | 5 | 5 | 0 | 0 |
| Method, Person | 1 | 1 | 1 | 0 | 0 |

---

## 16. Files Created

**Documentation (15)**

| File | Lines |
|---|---|
| `docs/INFORMATION_ARCHITECTURE.md` | 220 |
| `docs/REVIEW_PAGE_ARCHITECTURE.md` | 167 |
| `docs/BRAND_ARCHITECTURE.md` | 142 |
| `docs/WORK_ARCHITECTURE.md` | 144 |
| `docs/JOURNAL_ARCHITECTURE.md` | 186 |
| `docs/PRODUCT_ENTITY_STRATEGY.md` | 136 |
| `docs/INTERNAL_LINKING_STRATEGY.md` | 207 |
| `docs/SEO_URL_ARCHITECTURE.md` | 227 |
| `docs/MULTILINGUAL_SEO_ARCHITECTURE.md` | 221 |
| `docs/SEO_CONTENT_HIERARCHY.md` | 152 |
| `docs/ENTITY_ARCHITECTURE.md` | 191 |
| `docs/CONTENT_MODELS.md` | 346 |
| `docs/CONTENT_LIFECYCLE.md` | 171 |
| `docs/NAVIGATION_ARCHITECTURE.md` | 198 |
| `docs/USER_JOURNEYS.md` | 200 |
| `docs/reports/PHASE_1_REPORT.md` | this file |

**Content (1)** — `content/mock/method.json` (264 lines)

**Total created: 17 files.**

## 17. Files Modified

| File | Change |
|---|---|
| `content/mock/reviews.json` | Rebuilt bilingual, ratings removed, model expanded (1031 lines) |
| `content/mock/journal.json` | Rebuilt bilingual, method article removed, Arabic-original added (369) |
| `content/mock/brands.json` | Rebuilt bilingual, index gate added (284) |
| `content/mock/products.json` | Rebuilt bilingual, routing policy declared (471) |
| `content/mock/work.json` | Rebuilt bilingual, results rule documented (243) |
| `content/mock/person.json` | Rebuilt bilingual, protocol extracted (114) |
| `content/mock/site.json` | Rebuilt: route table, i18n, reserved slugs, navigation (146) |
| `content/mock/social-profiles.json` | `status` added |
| `content/mock/press.json` | `status` added |
| `content/mock/testimonials.json` | `status` added |
| `content/schema/types.ts` | Rewritten for the Phase 1 schema (493) |
| `tools/validate-content.mjs` | Rewritten: locales, gates, routing, no-ratings (484) |
| `tools/check-mock-guard.mjs` | Added the `"status": "mock"` signature |

**Not modified:** every Phase 0 strategy document, the Phase 0 report, `README.md`,
`START_HERE.md`. `docs/SITEMAP_PROPOSAL.md` and `docs/CONTENT_MODEL.md` are superseded by
`docs/INFORMATION_ARCHITECTURE.md` and `docs/CONTENT_MODELS.md`; both new documents say so, and the
Phase 0 originals are retained as the record of what was proposed.

---

## 18. Validation / Tests

All executed. Nothing asserted from inspection.

| Check | Result | Notes |
|---|---|---|
| **Content validation** | **PASS**, exit 0 | 11 files, 42 records. **0 errors, 0 warnings** |
| **Guard vs mock content** | **BLOCKED**, exit 1 | 68 traces across 11 files |
| **Guard vs clean output** | **CLEAN**, exit 0 | Mock-free HTML fixture |
| **No-ratings regression test** | **PASS**, exit 1 | Injected `verdict.rating: 4.5` into a review; validator failed with the expected message |
| Referential integrity | PASS | 42 ids, no dangling references, no duplicates |
| Locale integrity | PASS | Every record has ≥1 locale and exactly one `original` |
| Slug shape and uniqueness | PASS | Per collection and locale |
| Reserved-slug collision | PASS | No review or article slug collides with a category segment |
| Canonical path match | PASS | Every review and article canonical matches its route pattern |
| Method stage keys | PASS | Every key on a review or article resolves to `stageOrder` |
| Method boundary statement | PASS | Explicit clinical denial present in both locales |
| Orphan check (per locale) | PASS | Zero orphans in en and ar |
| Editorial rules | PASS | Limitations, suitability pairs, ≥3 observations, disclosure position, date ordering, no medical language, no absolute claims |
| Brand gate computation | PASS | 3 of 5 indexable in en, 3 of 5 in ar — all three states exercised |
| Journal category gate | PASS | 0 of 4 qualify in either locale — correct at 6 articles |
| Typecheck | **Not run** | No TypeScript toolchain yet (Phase 5) |
| Lint / Build / a11y / performance | **N/A** | No application exists. Correct for this phase |

**Defects found and fixed during the phase.** The rewritten validator failed on its first run with
26 errors, all in `products`: the new locale contract required a per-locale slug and
`translationStatus`, and products legitimately have neither a route nor an authored slug. Fixed on
both sides — `translationStatus` added to product locales (it is meaningful: which language the
description was authored in), and `localesOf()` given a `requireSlug` flag for collections with no
route of their own.

---

## 19. Risks

Carried forward from Phase 0, with Phase 1 additions.

| # | Risk | Impact | Likelihood | Change |
|---|---|---|---|---|
| **R-02** | Real content never arrives | **Severe** | **Medium-high** | Unchanged, still the top risk |
| **R-03** | Bilingual doubles content cost | High | **High** | **Raised.** Now committed, not optional. Mitigated by independent authoring rather than translation, but the cost is real |
| **R-06** | Organic takes 6–12 months | Medium | **High** | Unchanged |
| **R-08** | Publishing stops after launch | High | Medium-high | Unchanged |
| **R-13** | **Arabic/Latin type pairing fails at display size** | High | Medium | **New.** Cannot be solved by picking a Latin face and finding an Arabic companion later. Phase 2 must choose both together |
| **R-14** | **A template links to a gated brand page** | Medium | Medium | **New.** The most likely broken-link source. Stated as an implementation rule; needs a build-time assertion in Phase 5 |
| **R-15** | **Filters built client-only** | Medium | Medium | **Raised from R-12.** Would leave the corpus reachable only via sitemap |
| **R-16** | **Ratings reintroduced without revisiting the decision** | Low | Low | **New.** Mitigated: validator fails the build, and the schema cost is documented |
| R-01, R-04, R-05, R-07, R-09, R-10, R-11 | Mock leakage, photography, fabricated credentials, git boundary, schema misuse, medical drift, CWV | — | — | Unchanged from Phase 0 |

**R-07 (git boundary) is still open.** `git rev-parse --show-toplevel` still returns
`C:/Users/Lenovo`; this project has no repository of its own and no commits. Not actioned, because
initialising a repository and committing are your decision.

---

## 20. Open Questions

| # | Question | Why it matters | Recommendation |
|---|---|---|---|
| **Q-1** | Where is the audience, geographically? | Determines Arabic dialect targeting, hreflang region subtags, and whether climate-based positioning is meaningful. Unknown U-04 | Blocking for Arabic keyword validation, not for Phase 2 |
| **Q-2** | Does Zina already have a testing method? | The six-stage protocol is invented. If she has her own, hers replaces it entirely | Ask before Phase 2. The Method is now the site's spine |
| **Q-3** | Arabic-script slugs? | Small SERP benefit versus permanent operational cost | Keep Latin. Revisit with real Arabic search data. Reversible |
| **Q-4** | Should `/method/` stages ever get sub-routes? | Six thin pages today; `conditions` could justify one later | Anchors only for now |
| **Q-5** | Comparison content — journal article, or a review subtype? | Affects the model, the URL and the product-promotion trigger | Phase 2 or 3. Currently modelled as a journal category |
| **Q-6** | Numeric ratings — confirmed final? | Forfeits star rich results | Treating as final per your decision. Flagged so the cost is visible |
| **Q-7** | Newsletter? | Named as a secondary conversion in the master spec, no platform decided | Not modelled. Would add an entity and a consent obligation |

---

## 21. Decisions Requiring Approval

Made in this phase on my own judgement. Each is reversible now and expensive later.

| # | Decision | Rationale | Reversal cost |
|---|---|---|---|
| **D-1** | **Brands removed from primary navigation** | Two of five brands fail the gate in at least one locale | Trivial — config change |
| **D-2** | **Brand gate: 2 reviews, or 1 review + 1 work, per locale** | Prevents thin pages while allowing a genuinely substantial single-review-plus-case-study page | Trivial — threshold change |
| **D-3** | **Journal categories are editorial formats, not product categories** | Two taxonomies over one subject compete for the same queries and split link equity | **High** once URLs are published |
| **D-4** | **Latin-script URLs in both locales, English path segments** | Maintainability over a marginal relevance signal | Medium — data change plus redirect map |
| **D-5** | **`/` is a 302, never indexed** | A 301 caches one locale and prevents discovery of the other | Trivial |
| **D-6** | **Product entity kept, product route rejected** | Entity and page are separate questions | Low — promotion path defined |
| **D-7** | **Five primary nav items; Contact as a CTA** | Six-plus items fails in RTL and at 360px | Trivial |
| **D-8** | **Journal bodies in MDX, reviews in structured JSON** | A review is a report; an article is prose | Medium |
| **D-9** | **`unknown-pending-verification` is the import default disclosure** | Fabrication risk is highest at migration | Trivial |
| **D-10** | **`mock` is a terminal lifecycle state** | Editing a mock record in place is how fabricated fields survive review | Trivial |

**D-3 is the one to look at hardest.** It is the least intuitive and the most expensive to reverse.

---

## 22. Recommendation for Phase 2

**Proceed to Phase 2 — Brand and visual direction**, per `docs/PHASE_PLAN.md`.

Phase 0 recommended a **Luxury Editorial foundation with an embedded Beauty Laboratory system on a
dark editorial ground**, with cinematic treatment rationed. Phase 1 has strengthened rather than
changed that: the Method is now a route, evidence blocks are now a specified component set, and the
review page has a fixed 23-section structure to design against.

**Phase 2 should deliver** visual territory, typography direction, colour system, imagery direction,
motion principles and art-direction rationale.

**Four constraints Phase 2 must treat as inputs, not suggestions:**

1. **Design the review page first, the homepage second.** It is the most-visited, most complex, and
   most structurally demanding page, and it carries the differentiator. A direction that works on a
   homepage and fails on a review page is the wrong direction.
2. **Choose the Arabic and Latin typefaces together.** Picking a Latin face and finding an Arabic
   companion afterwards is how bilingual sites end up with a second-class Arabic experience. This is
   R-13 and the highest-risk unresolved item in the project.
3. **The claims/observations/verdict separation must be visible without reading.** Three kinds of
   statement, three treatments. This is a design requirement derived from an editorial one.
4. **Verify contrast on a dark ground rather than assuming it.** Dark grounds fail AA more often
   than light ones, particularly for the muted secondary text this direction wants.

**Also design the empty and partial states**, because they are common rather than exceptional: a
work project with no results figures, a brand with one review, a review with no comparison product,
a language switcher with no counterpart, a journal with no category pages.

### Answer Q-2 before Phase 2 starts

**Does Zina already have a testing method?** The six-stage protocol is invented, it is now the
site's spine, and every route, link and template decision reinforces it. If she has her own method,
hers replaces it and some of this architecture shifts. If she does not, adopting one is a genuine
business decision rather than a content task.

### Client content collection remains the critical path

Unchanged from Phase 0 and still the highest-likelihood severe risk (R-02). The architecture is now
ready for content that does not yet exist. `docs/PROJECT_DISCOVERY.md` section 15 lists the 20
items; the first four are still blocking.

### Suggested handoff context for Phase 2

> Phase 1 is complete. Read `docs/reports/PHASE_1_REPORT.md`, then
> `docs/INFORMATION_ARCHITECTURE.md`, `docs/REVIEW_PAGE_ARCHITECTURE.md`,
> `docs/MULTILINGUAL_SEO_ARCHITECTURE.md` and `docs/DESIGN_DIRECTION_PROPOSAL.md` (Phase 0).
>
> The content layer is at `content/mock/` — 42 records, 11 collections, bilingual, validating with
> 0 errors and 0 warnings. Run `node tools/validate-content.mjs` before and after any content
> change.
>
> Execute **Phase 2 only**: visual territory, typography, colour system, imagery direction, motion
> principles, art-direction rationale. Design the review page first. Choose Arabic and Latin
> typefaces together. Do not build components, do not write CSS, do not implement the homepage.
>
> Report to `docs/reports/PHASE_2_REPORT.md`.

**Phase 2 has not been started.**
