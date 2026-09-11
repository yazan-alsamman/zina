# Content → UX Mapping

**Status:** Phase 3 decision.

Every content entity from Phase 1, mapped to the UX surface that renders it. Ten fields per entity:
**primary route · discovery surfaces · inbound links · outbound links · related entities · indexable
UX · gated UX · locale availability · empty state · lifecycle state.**

**Sources of truth:** `content/schema/types.ts`, `content/mock/*.json`,
`docs/CONTENT_MODELS.md`, `content/mock/site.json` (`routes`).

**Current counts, from `node tools/validate-content.mjs`:** 42 records across 11 collections —
brands 5, journal 6, method 1, person 1, press 4, products 6, reviews 6, site 1, socialProfiles 5,
testimonials 3, work 4.

---

## 0. The three rules that govern every mapping

1. **An entity and a page are separate questions.** `Product`, `Testimonial` and `PressItem` are
   modelled entities with no route, and that is a decision, not a gap.
2. **A route exists in a locale only if content exists in that locale.** No stub, no hreflang, no
   machine translation.
3. **A link to an entity is a function of that entity's gate, evaluated at build time in the current
   locale.** No template may assume a page exists.

---

## 1. Person / Profile

| | |
|---|---|
| **Primary route** | `/{loc}/about/` |
| **Discovery surfaces** | Homepage §1 (name, title, statement) · every journal byline · footer bio · Method (author framing) · contact page |
| **Inbound links** | Primary nav (About) · footer · homepage · every journal article byline · Method · contact |
| **Outbound links** | **`/method/` (mandatory, from `methodId`)** · `/editorial-standards/` · `/work/` · `/contact/` |
| **Related entities** | `Method` (1:1, required) · `SocialProfile` (1:n, gated) · `JournalArticle` (as `authorId`) |
| **Indexable UX** | Yes. The `Person` entity anchor for the knowledge graph. Priority 0.9 |
| **Gated UX** | `location` renders **only** when `_verification: CONFIRMED` — it is `MOCK`, so it does not render. `sameAs` gated on `sameAsEligible` |
| **Locale availability** | **Required in both. Validator fails otherwise** |
| **Empty state** | **State B (no portrait)**: the page runs typographically, no tone field. Five bios exist; none is truncated to serve another surface |
| **Lifecycle** | `mock` today → `needs-verification` on migration. Name is `CONFIRMED`; everything else needs Zina |
| **Components** | CMP-24 Person Block · CMP-11 Footer |

**Five bios, five surfaces.** `homepageIntro` (~20 words) · `short` (~35, cards and meta) ·
`long` (~200, `/about/`) · `editorialByline` (~40, every article) · `collaboration` (~90,
`/contact/` and `/work/`). Storing one and truncating produces the generic voice that makes creator
sites feel templated.

---

## 2. Method

| | |
|---|---|
| **Primary route** | `/{loc}/method/` |
| **Discovery surfaces** | Primary nav · homepage §1 line + §3 well · **every review's stage markers** · every journal article's stage link · `/about/` · footer ("How I test") |
| **Inbound links** | **The most-linked page on the site.** Every review (mandatory), every article, about, homepage ×2, nav, footer |
| **Outbound links** | 2–4 representative reviews · `/editorial-standards/` · per-stage, the reviews that used that stage |
| **Related entities** | `MethodStage` (1:6) · `Review` (via `testing.methodStageKeys`) · `JournalArticle` (via `related.methodStageKeys`) · `Person` (via `methodId`) |
| **Indexable UX** | Yes, priority 0.9. **The only Tier 1 page that is also a traffic page** |
| **Gated UX** | None — but see the mock-method boundary below |
| **Locale availability** | **Required in both. Build fails otherwise.** A bilingual site whose core differentiator exists in one language is not bilingual |
| **Empty state** | None possible; all fields required |
| **Lifecycle** | `mock` → `draft` on migration. **PROJECT MOCK METHOD until Zina confirms or replaces it** |
| **Components** | CMP-15, CMP-16, CMP-17, CMP-01 |

> **Boundary that must survive into Phase 4:** the six stages are a **PROJECT MOCK METHOD**, not a
> **VERIFIED ZINA METHOD**. Enforced by `_verification: MOCK` (cannot publish) and by
> `tools/check-mock-guard.mjs` (build failure on `mock-` ids). See `docs/METHOD_UX.md` §2.

---

## 3. Method Stage

| | |
|---|---|
| **Primary route** | **None.** Six anchors on one page: `/{loc}/method/#{key}` |
| **Discovery surfaces** | Method page · review stage markers · journal stage links · homepage §3 |
| **Inbound links** | Every review that ran the stage · every article that explains it |
| **Outbound links** | The reviews that used this stage (locale-filtered) |
| **Related entities** | `Method` (parent) · `Review` · `JournalArticle` · `EvidenceAsset` (via `stageKey`) |
| **Indexable UX** | As part of `/method/`. **Not separately indexable** — six stage pages at current depth would be six thin pages |
| **Gated UX** | Promotion to `/{loc}/method/{stage}/` only on substantial standalone content. Most plausible for `conditions`. **Phase 1 Q-4, unchanged** |
| **Locale availability** | Names localised; **`key` stays English and internal**, so anchors are stable across locales |
| **Empty state** | A stage with no reviews yet → its "reviews that used this stage" block is removed. **The stage still exists** — a protocol is not defined by what has been published |
| **Lifecycle** | Inherits the Method's |
| **Components** | CMP-15, CMP-17 |

**`doesNotProve` is a required field per stage**, rendered at the same visual weight as `purpose`.
That is the mechanism keeping the Method a description of structured personal testing rather than an
implied claim of validation.

---

## 4. Review

**The core entity, the primary organic landing page, and the atomic unit of value.**

| | |
|---|---|
| **Primary route** | `/{loc}/reviews/{slug}/` |
| **Discovery surfaces** | Reviews index (+ facets) · homepage §2 featured and §4 recent · brand pages · journal articles (contextual **and** modular) · Method (representative + per stage) · related blocks on other reviews · work case studies · 404 recovery · sitemap |
| **Inbound links** | The most heavily linked entity type. From every surface above |
| **Outbound links** | **`/method/` (mandatory)** · brand (if gate passes) · 2 related reviews · 2 related journal · 0–1 related work · comparison product's review · brand official site (`nofollow`, + `sponsored` where paid) |
| **Related entities** | `Product` (1:1 primary) · `Brand` (denormalised for filtering and gating) · `MethodStage` (n:m) · `JournalArticle` · `Work` · other `Review`s |
| **Indexable UX** | Yes, priority 0.8. **Highest-value organic target on the site** |
| **Gated UX** | None on the review itself. Its **brand link** is gated per locale |
| **Locale availability** | 6 records — 4 in both, 1 English-only (`velvet-hour-lip-cream`), 1 Arabic-original (`verdure-cloud-balm`). `/en/reviews/` and `/ar/reviews/` each list **five** |
| **Empty state** | **None for the report itself** — conditions, observations (≥3), strengths, limitations and both suitability arrays are validator-required. Optional sections are removed when absent: plates, update log, comparison, related work |
| **Lifecycle** | `mock` → `needs-verification`. **Disclosure must be actively confirmed per review before publication**; `unknown-pending-verification` can never reach `published` |
| **Components** | CMP-01 through CMP-05, CMP-13, CMP-14, CMP-17, CMP-18, CMP-19, CMP-20, CMP-21, CMP-25, CMP-30 |

### Field → surface map

| Field | Surface |
|---|---|
| `title`, `subtitle` | `h1` + subtitle; index entry; related items |
| `disclosure.*` | **Disclosure band, above the hero** + marker on every index entry |
| `testing.{wearWindow, timesTested, shadeUsed, baselinePhotographed}` | Testing summary strip |
| `testing.methodStageKeys` | Method stage markers → `/method/#{stage}` |
| `conditions[]` | **Conditions well** |
| `observations[]` | Observation sequence + margin index |
| `media.evidence[]` | Plates, bound to `stageKey` and optionally `observationIndex` |
| `strengths[]` / `limitations[]` | Two columns, **identical weight** |
| `suitability.*` | The one contained surface (C-1) |
| `verdict.*` | Verdict band, 2px clay rule |
| `updateLog[]` | Update log, or section removed |
| `related.*` | Related content, locale-filtered then laid out by count |
| `seo.*` | `<title>`, meta description, canonical — **used verbatim, no site-name template** |
| **No `rating` field exists** | Validator fails the build on `rating`, `score` or `stars` |

---

## 5. Product

| | |
|---|---|
| **Primary route** | **None.** `routingPolicy.hasStandaloneRoute: false` |
| **Discovery surfaces** | Review identity block · review product-details block · **review brand-claims block** · brand page ("products tested") · journal mentions · index entry metadata |
| **Inbound links** | None directly — a product has no URL. Product-name queries land on the review |
| **Outbound links** | The brand's official product page (`nofollow`, + `sponsored` where paid) |
| **Related entities** | `Brand` (parent) · `Review` (1:1 today, 1:n over time) · other products via `comparedAgainstProductIds` |
| **Indexable UX** | **Only as `itemReviewed` nested inside `Review` schema.** Never a standalone `Product` entity, never `offers`, never `AggregateRating` |
| **Gated UX** | **Promotion trigger defined:** 2+ published reviews in a locale, or 1 review + 1 published comparison feature. URL would be `/{loc}/brands/{brandSlug}/{productSlug}/`. **No product qualifies** — all six have exactly one review |
| **Locale availability** | Carries locale content only where a review or brand page in that locale needs it. **Validator-enforced dependency:** if a review exists in a locale, its product must have content there |
| **Empty state** | Missing spec fields simply do not render. No official URL → no link, **no placeholder** |
| **Lifecycle** | `mock` → `needs-verification` |
| **Components** | CMP-19, CMP-03 (claims) |

**Why the entity exists but the page does not.** One product can accumulate several reviews
(original, reformulation, revisit); a product can be tested but not yet written up; and
`brandClaims[]` needs an owner that is structurally separate from `observations[]`. A page today
would be a manufacturer description plus a link, and would **compete with its own review** for the
exact query the review is built to win.

---

## 6. Brand

| | |
|---|---|
| **Primary route** | `/{loc}/brands/{slug}/` — **gated** |
| **Discovery surfaces** | Brand index (passing brands only) · review identity · review product details · work case studies · reviews-index brand facet · footer link to `/brands/` |
| **Inbound links** | From reviews and work **only when the gate passes in that locale**; otherwise the brand name is plain text or links to `/{loc}/reviews/?brand={slug}` |
| **Outbound links** | Its reviews (locale-filtered) · its work · its official site (`nofollow`, + `sponsored`) · CTA to `/reviews/` |
| **Related entities** | `Product` (1:n) · `Review` (1:n) · `Work` (1:n) |
| **Indexable UX** | **Gated**, priority 0.6 |
| **Gated UX** | `(reviews ≥ 2) OR (reviews ≥ 1 AND work ≥ 1)` **AND** description ≥120 chars **AND** a logo exists — **per locale**. `indexPolicy` may override with `force-index` / `force-noindex`, which needs a written reason |
| **Locale availability** | Measured today: Maison Eclat ✓/✓ · Veloura ✓/**gated** · Lune Skin ✓/✓ · Atelier Noor ✓/✓ · Terra Sana **gated**/**gated**. Three states exercised: indexable in both, indexable in one, gated in both |
| **Empty state** | **Gated → the page does not exist.** Not listed, not greyed out, no "coming soon", no tooltip. **The reader never learns a page was withheld.** One review → single-column editorial, **more** space not less |
| **Lifecycle** | `mock` → `needs-verification`. **`relationship.status` must be `CONFIRMED` before any relationship label renders**; a mock relationship marked `CONFIRMED` fails the build |
| **Components** | CMP-20, CMP-25 |

**Not in primary navigation.** Promoting a section advertises whichever part of it is emptiest.
Revisit at roughly 50 reviews.

---

## 7. Journal Entry

| | |
|---|---|
| **Primary route** | `/{loc}/journal/{slug}/` |
| **Discovery surfaces** | Journal index · homepage §6 · related blocks on reviews · related blocks on sibling articles · Method (indirectly, via stage links) |
| **Inbound links** | Journal index · homepage · 2 related from every review · sibling and pillar articles |
| **Outbound links** | **1–3 reviews it evidences (mandatory)** · 1 Method stage anchor · 2 sibling/pillar articles · brands (if gate passes) |
| **Related entities** | `Review` · `MethodStage` · other `JournalArticle` (pillar/supporting) · `Brand` · `Person` (as `authorId`) |
| **Indexable UX** | Yes, priority 0.7 |
| **Gated UX** | None at article level |
| **Locale availability** | 6 records — 4 in both, 1 English-only, 1 **Arabic-original** (`mufradat-darajat-albashara`, which could not sensibly exist in English because its subject is the gap between the two shade vocabularies) |
| **Empty state** | Fewer than 4 sections → no table of contents. No hero → text-led entry, **no tone field** |
| **Lifecycle** | `mock` → `draft`. Authored fresh on migration |
| **Components** | CMP-22, CMP-25 |

**The contextual link is the load-bearing element.** When an article states a finding a review
demonstrates, the finding links to the review **in the sentence**, not only in a block at the
bottom.

**Production storage note:** journal bodies should be **MDX**, not JSON outlines — prose needs
inline images, pull quotes and embedded review references. Reviews stay structured JSON because
their value is being the same shape every time.

---

## 8. Journal Category

| | |
|---|---|
| **Primary route** | `/{loc}/journal/{category}/` — **gated at 3 articles per locale** |
| **Discovery surfaces** | A **label** on every article and index entry. Not a destination today |
| **Inbound links** | None today (no route). When activated: journal index and every article in the category |
| **Outbound links** | Its articles |
| **Related entities** | `JournalArticle` (1:n) |
| **Indexable UX** | Gated, priority 0.6 |
| **Gated UX** | **No category qualifies in either locale** — testing-notes 1, guides 2, comparisons 1, essays 1. `guides` activates first |
| **Locale availability** | Computed per locale |
| **Empty state** | The label renders as **text, not a link**, until the gate passes. Nothing signals that a page is pending |
| **Lifecycle** | Derived, not authored |
| **Components** | CMP-22 (label) |

**Categories are editorial formats, never product categories.** Running the same taxonomy twice over
one subject creates two competing URL sets for the same queries. One taxonomy per axis: reviews by
product category, journal by editorial format.

---

## 9. Work

| | |
|---|---|
| **Primary route** | `/{loc}/work/{slug}/` |
| **Discovery surfaces** | Work index · homepage §5 · brand pages · related blocks on reviews |
| **Inbound links** | Work index · homepage · brand pages · reviews with `related.workIds` |
| **Outbound links** | **The independent review of the same brand (mandatory where one exists)** · brand (if gate passes) · `/contact/` |
| **Related entities** | `Brand` (1:1) · `Review` (n:m via `relatedReviewIds`) · `Testimonial` (gated, none renders) |
| **Indexable UX** | Yes, priority 0.6. **Near-zero search intent, correctly** |
| **Gated UX** | **Results figures**: a figure renders only when `source` names a written client-supplied origin **and** `_verification: CONFIRMED`. Otherwise the whole results section is removed |
| **Locale availability** | 4 records — 3 in both, 1 English-only (`velvet-hour-wear-series`), **which is what gates the Arabic Veloura brand page**. A real consequence propagating correctly through the system |
| **Empty state** | **No results figures is a valid, complete state** — one mock project has a deliberately empty array. 0 projects → route not generated and Work removed from nav · 1 → index and detail effectively merge · 2–3 → alternating full-width, not a grid |
| **Lifecycle** | `mock` → `needs-verification`. Figures need named written sources or are dropped |
| **Components** | CMP-23, CMP-25, CMP-04 (disclosure of terms) |

**The cross-link is the decision moment for audience B.** Showing the paid work and the independent
review of the same brand side by side demonstrates the disclosure policy working rather than
describing it.

---

## 10. Editorial Standards

| | |
|---|---|
| **Primary route** | `/{loc}/editorial-standards/` |
| **Discovery surfaces** | Footer **Standards** group · Method · About |
| **Inbound links** | Footer (site-wide, so it can never be orphaned) · Method · About |
| **Outbound links** | `/method/` · `/contact/` |
| **Related entities** | `Method` · `ReviewDisclosure` (it documents the policy) |
| **Indexable UX** | Yes, priority 0.5. **An E-E-A-T and legal artefact, not a traffic page** |
| **Gated UX** | None |
| **Locale availability** | Both, required |
| **Empty state** | None. Static content |
| **Lifecycle** | Static; content decided with the client |
| **Components** | Prose template |

**A real indexable page, never a modal.** Its presence in a persistent footer is itself a trust
signal.

---

## 11. About

Rendered from the `Person` entity — see §1. Listed separately because it is a **route**, and a
reader thinks of it as a page rather than as an entity.

| | |
|---|---|
| **Primary route** | `/{loc}/about/` |
| **Distinct UX obligation** | It is the **only page where the person is the subject**, so the name is the `h1`. Everywhere else the work is the subject |
| **Must not become** | A second telling of the Method. It links to `/method/`; it does not re-explain it |

---

## 12. Contact

| | |
|---|---|
| **Primary route** | `/{loc}/contact/` |
| **Discovery surfaces** | Header CTA (Collaborate) · footer · homepage §7 · every work page · about |
| **Inbound links** | Site-wide CTA, footer, work index and every case study |
| **Outbound links** | Success state → `/reviews/` |
| **Related entities** | `Person` (`bios.collaboration`) · `Work` (via `inquiryType` preselection) |
| **Indexable UX** | Yes, priority 0.8 — brand navigational |
| **Gated UX** | Direct email renders only when verified (**blocked on U-02**) |
| **Locale availability** | Both |
| **Empty state** | No email → the form is the only channel, and the page does not mention a missing one |
| **Lifecycle** | Static; blocked on U-01 (domain) and U-03 (jurisdiction) for the privacy notice |
| **Components** | CMP-27 |

---

## 13. Entities with no UX surface, deliberately

| Entity | Records | Why nothing renders |
|---|---|---|
| **SocialProfile** | 5 | `sameAsEligible` is a **hard gate** and is `false` on all five. The footer social row **does not exist** — no greyed icons, no placeholder handles, no follower counts. `followers.asOf` is required because a follower count without a date is not a fact |
| **Testimonial** | 3 | **Hard render gate on `approvalOnFile`.** None has one. Mock attribution is the literal string `MOCK NAME`, never an invented human name |
| **PressItem** | 4 | Route deferred; gate is 3 verified mentions with live URLs. `press.json` is flagged as **the highest-risk file in the project** — a shortlisting must never render as a win |
| **SiteConfig** | 1 | Not content. Drives routes, hreflang, sitemap and navigation |

**Three entities are modelled and render nothing.** That is the content model doing its job: the
data exists so the shape is known, and the gates exist so nothing unverified reaches a reader.

---

## 14. Route → template → entity coverage

| Route | Template | Entity | Indexable | Gated | en | ar |
|---|---|---|---|---|---|---|
| `/{loc}/` | T-02 Home | composed | Yes | No | ✓ | ✓ |
| `/{loc}/about/` | T-11 About | Person | Yes | No | ✓ | ✓ |
| `/{loc}/method/` | T-03 Method | Method | Yes | No | ✓ | ✓ |
| `/{loc}/reviews/` | T-04 Review index | Review | Yes | No | 5 | 5 |
| `/{loc}/reviews/{slug}/` | T-01 Review | Review | Yes | No | 5 | 5 |
| `/{loc}/reviews/{category}/` | — | Review | Yes | **Gated ≥5** | 0 | 0 |
| `/{loc}/brands/` | T-09 Brand index | Brand | Yes | No | ✓ | ✓ |
| `/{loc}/brands/{slug}/` | T-10 Brand | Brand | Yes | **Gated** | 4 | 3 |
| `/{loc}/work/` | T-07 Work index | Work | Yes | No | ✓ | ✓ |
| `/{loc}/work/{slug}/` | T-08 Case study | Work | Yes | No | 4 | 3 |
| `/{loc}/journal/` | T-05 Journal index | JournalArticle | Yes | No | 5 | 5 |
| `/{loc}/journal/{category}/` | — | JournalCategory | Yes | **Gated ≥3** | 0 | 0 |
| `/{loc}/journal/{slug}/` | T-06 Article | JournalArticle | Yes | No | 5 | 5 |
| `/{loc}/editorial-standards/` | T-13 | static | Yes | No | ✓ | ✓ |
| `/{loc}/contact/` | T-12 Contact | static | Yes | No | ✓ | ✓ |
| `/{loc}/privacy/` and `/{loc}/terms/` | T-14 Legal | static | Yes | No | ✓ | ✓ |
| `/{loc}/404/` | T-15 404 | — | **No** | No | ✓ | ✓ |
| `/{loc}/press/` | — | PressItem | Yes | **Deferred** | 0 | 0 |
| `/{loc}/brands/{b}/{p}/` | — | Product | Yes | **Deferred** | 0 | 0 |
| `/{loc}/search/` | — | — | No | **Deferred** | 0 | 0 |

**Every route has a template. Every template has an entity or is explicitly static. Every gated
route has a numeric gate and a current count.**

---

## 15. Lifecycle → UX behaviour

| Status | Built | Indexable | UX |
|---|---|---|---|
| `mock` | **Never in production** | No | No visual treatment specified, **deliberately** — a "mock" badge would imply mock content can ship, and it cannot |
| `draft` | No | No | No route |
| `review` | Preview only | No | Renders normally under a site-wide `noindex`, with **no visual difference** — a preview should show what the page will look like, not a decorated draft |
| `needs-verification` | Preview only | No | As above |
| `approved` | Preview only | No | As above |
| `published` | **Yes** | **Yes** | Normal |
| `archived` | Yes | Yes, with a **visible dated notice** | De-emphasised in indexes, excluded from related-content selection, URL and inbound links retained. **Never deleted** |

**Four render-time gates override status entirely**, because each guards a specific fabrication
risk: disclosure `unknown-pending-verification` · testimonial `approvalOnFile` · brand
`relationship.status` · work `results.figures[].source`.
