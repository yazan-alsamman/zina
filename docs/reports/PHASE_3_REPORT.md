# Phase 3 — Completion Report

**UX architecture, flows, wireframes and component inventory**

| | |
|---|---|
| **Status** | Complete |
| **Phase** | 3 — UX architecture |
| **Date** | 2026-09-08 |
| **Overall confidence** | **High** on the review page, component boundaries, empty/partial states, navigation, accessibility architecture and content mapping. **Medium-high** on the homepage (improved, still the weakest surface, still photography-dependent). **Medium** on Arabic — the *system* is now measured and two real defects were fixed, but the *typeface* recommendation is still unproven and criterion 10 is unverified |
| **Anything implemented** | **No application.** No Astro, no components, no production CSS, no routes, no CMS. One evaluation harness (`docs/proofs/type-proof.html`) and one additive validator (`tools/check-ux-coverage.mjs`) |
| **Next phase begun** | **No.** Stopped at the Phase 4 gate |

---

## 1. Executive Summary

Phase 3 produced the complete UX architecture across **17 documents, ~6,300 lines**, one measured
type proof, and one new coverage validator. **No application was built.**

**Four things define the phase.**

**The Arabic typography gate was executed, not deferred.** Phase 2 closed with the Arabic
"specified but unproven" and instructed Phase 3 to prove it before wireframing. Zarid could not be
licensed, so the documented open-source fallback tier was set in real type and **measured
programmatically** at 320/375/768/1024/1440 in both directions. Five criteria pass, three are
partial (mechanism verified, optical judgement deferred), one is unverified pending a native reader
— and **two real defects were found and fixed**, plus one Phase 2 assumption corrected.

**The most valuable finding is a bidi defect that would have shipped invisibly.** `<bdi>34–38 °م</bdi>`
— the markup Phase 2's own rule prescribes — renders the range **reversed as 38–34**, because `<bdi>`
resolves direction from the first strong character and that character is the Arabic **م**. It would
have appeared in every conditions well, every observation timestamp and every record line on every
Arabic review page, and it is invisible to a non-Arabic-reading team. The corrected rule is
`<bdi dir="ltr">34–38</bdi> °م`.

**The review page was designed first, again**, and the homepage's 7/10 was addressed through
information architecture rather than decoration: the opening section shrinks from 88vh to 72vh, one
line moves the Method into screen one, and the page's dependency on a portrait that does not exist
was **severed** by defining State B as a genuine alternative composition rather than State A with
grey rectangles in it.

**The component inventory contains no `Card`.** Three contained surfaces exist on the entire site,
each recorded with why it is contained and why editorial structure could not do the job. Everything
else uses the index treatment.

---

## 2. Phase Status

| Deliverable | Status | Lines |
|---|---|---|
| `docs/PHASE_3_BILINGUAL_TYPE_PROOF.md` | Complete — **executed and measured** | 279 |
| `docs/USER_FLOWS.md` | Complete — flows A–H | 424 |
| `docs/UX_ARCHITECTURE.md` | Complete — 15 templates | 481 |
| `docs/REVIEW_WIREFRAMES.md` | Complete — 1440 / 768 / 375, 20 sections | 802 |
| `docs/HOMEPAGE_WIREFRAMES.md` | Complete — States A and B | 577 |
| `docs/METHOD_UX.md` | Complete | 320 |
| `docs/CONTENT_UX_MAPPING.md` | Complete — 13 entities | 360 |
| `docs/COMPONENT_INVENTORY.md` | Complete — 31 components | 727 |
| `docs/RESPONSIVE_UX_SPEC.md` | Complete | 329 |
| `docs/ACCESSIBILITY_UX_SPEC.md` | Complete | 436 |
| `docs/NAVIGATION_UX.md` | Complete | 272 |
| `docs/SEARCH_UX.md` | Complete — architecture, deferred build | 205 |
| `docs/EMPTY_PARTIAL_UX.md` | Complete — 5 states × 15 templates | 268 |
| `docs/INTERACTION_UX.md` | Complete | 206 |
| `docs/SEO_UX_INTEGRATION.md` | Complete | 293 |
| `docs/PHASE_3_DECISION_LOG.md` | Complete | 200 |
| `docs/PHASE_3_CREATIVE_COMPLIANCE.md` | Complete | 148 |
| `docs/reports/PHASE_3_REPORT.md` | This file | — |
| `docs/proofs/type-proof.html` | **Evaluation artefact**, not production code | 561 |
| `tools/check-ux-coverage.mjs` | New validator, additive | 287 |

**All 18 required deliverables produced.**

---

## 3. Bilingual Type Proof Result

**Executed on the documented open-source fallback tier** (IBM Plex Serif + Noto Naskh Arabic + Plex
Sans Arabic + Plex Mono). **Zarid was not licensed and was not set.**

| # | Criterion | Result |
|---|---|---|
| 1 | Same optical volume at the same scale step | **PARTIAL** — geometry exact (size ratio **1.120**, leading ratio **1.180**); optical judgement deferred |
| 2 | Adequate Arabic leading without airiness | **PARTIAL** — same paragraph occupies 7 lines/212px English, 5 lines/200px Arabic at equal column width |
| 3 | Metadata at equal volume in both scripts | **PARTIAL** — mechanism verified: EN 12px/500/tracking 0.96px uppercase, AR 13.44px/400/tracking **normal** |
| 4 | No Latin run mispositioned, no punctuation migration | **DEFECT FOUND AND FIXED** — see §3.1 |
| 5 | Margin index on the correct side | **PASS** — column at 1024/1440 on the inline-start side in both directions; inline marker rows at 768/375/320 in both |
| 6 | Numerals align in columns in both locales | **PASS** — value edges identical across all rows at every width, LTR and RTL |
| 7 | No Arabic letter-spacing anywhere | **PASS** — every element under `[lang="ar"]` walked at five widths: **0 violations** |
| 8 | Header does not wrap or overflow in Arabic at 1024 | **PASS** — 961px available, 686px needed in Arabic, 753px in English |
| 9 | Nothing below the size floors | **PASS** — **0 violations** at five widths, both scripts |
| 10 | **The Arabic page does not look like a translation** | **UNVERIFIED — HUMAN REVIEW REQUIRED** |

**5 PASS · 3 PARTIAL · 1 defect found and fixed · 1 UNVERIFIED.**

### 3.1 The defect

Token ordering extracted with `Range.getBoundingClientRect()` inside an RTL paragraph:

| Markup | Visual order, left → right | Verdict |
|---|---|---|
| `<bdi>34–38 °م</bdi>` | `°م \| 38 \| 34` | **WRONG — reads 38–34** |
| `<bdi dir="ltr">34–38</bdi> °م` | `°م \| 34 \| 38` | **Correct** |
| `<bdi>58–71 ٪</bdi>` | `58 \| 71 \| ٪` | Percent sign on the wrong side |
| `<bdi dir="ltr">58–71</bdi> ٪` | `٪ \| 58 \| 71` | **Correct** |

`docs/BILINGUAL_TYPE_TEST.md` §4 Rule 4 is **superseded** (decision D3-1). Rule 1 — `<bdi lang="en">`
around Latin identifiers — is **confirmed unchanged**.

### 3.2 The second defect

At 320px the **English** conditions table needs 279px inside a 265px well and **overflows**, because
`white-space: nowrap` on the value cell prevents prose values from wrapping. Fix applied and
re-measured: **225px, fits, numeral alignment preserved** (D3-2).

Phase 2 named the conditions well as the highest-risk component *in Arabic*. It broke in English.

### 3.3 The corrected assumption

Phase 2: *"the header must be laid out to the Arabic width."* **Measured, English is 9% wider**
(753px vs 686px); Arabic binds **vertically** (88px vs 82px). The rule is restated as *lay out to
the wider of the two measured sets, and reserve height for the Arabic line box in both locales*
(D3-3). Must be re-measured on Zarid.

### 3.4 R-13 status

**Partially discharged.** The *system* is proven on a shippable tier. The *typeface recommendation*
is not. Honest score for the Arabic direction: **8/10 → 8.5/10**.

---

## 4. User Flow Summary

Eight flows, each with entry, decision point, UX mechanism, failure mode and missing-content
behaviour.

| Flow | Entry | Decision point | Success signal |
|---|---|---|---|
| **A** Discover → Review | Homepage | Section 2's conditions registering as unusual | 2+ reviews, or a Method entrance |
| **B** Search → Review | A review, cold | **The conditions well, on the second scroll** | **Review → Method click rate — the most diagnostic number on the site** |
| **C** Method-first | `/method/` | **The `doesNotProve` fields.** A sceptic converts on the limits | Review entrance from a stage |
| **D** Product/brand-first | Brand page, or a review if the gate fails | Whether the brand page aggregates something a review cannot | Brand → review click |
| **E** Journal-first | An article | **The contextual in-prose link** | Journal → review click |
| **F** Arabic visitor | Any `/ar/` route | Whether the page reads as Arabic (**unverified**) | Session depth |
| **G** English visitor | Any `/en/` route | Same architecture, three real differences | Session depth |
| **H** Missing translation | Switcher, or a direct URL | **Never a 404, never a stub, never a machine translation** | Fallback-message entrances tell you what to translate next |

Every flow but H passes through `/method/`. **It is the trust moment in all of them.**

---

## 5. Review UX Summary

Designed first. Three wireframes (1440 / 768 / 375) and **20 section specifications**, each carrying
twelve fields: purpose, content, hierarchy, width, alignment, reading order, interaction, desktop,
tablet, mobile, Arabic, accessibility, empty/partial.

**Sections 9–12 are the report** — conditions, method stages, observations, plates. If a design pass
ever compresses the page, those four survive intact.

**Three structural changes across breakpoints, not "stacking":**

1. The margin index becomes inline marker rows below 1024 — **collapse, not disappearance**.
2. Two-column blocks appear at 768 — the only threshold where they arrive without the index.
3. The hero re-crops 16:10 → 3:2 → 4:5 via `<picture>` — a real art-directed crop.

**Information priority, verified against the flows:** a reader who stops after the second scroll must
be able to say what was tested, under what conditions, and whether it was paid for.

**Fifteen failure conditions enumerated**, four of them new in Phase 3 and each found by measurement.

---

## 6. Homepage UX Summary

Phase 2 scored it 7/10 with two named reasons. Phase 3 separated them.

| Problem | Fix | Cost |
|---|---|---|
| **P1 — proof one screen too late** | Opening 88vh → **72vh**; requirement restated as *before 1.0 viewport heights at 375 × 667* (Phase 2's own rule said 1.5, which is not one swipe) | Nothing added |
| **P1b — "why different" answered on screen three** | **One line** in section 1: *"Six stages, the same six every time. How I test →"* | 40px, one text link, no record density |
| **P2 — portrait dependency** | **State B**: a full alternative composition where the statement widens, the featured review goes full width with four conditions, and reviews and work become text-led. **No tone fields where a caption carries nothing** | The page reaches the proof **higher** in State B than in State A |

**States are chosen per section, not per page.** The likely launch state is A for sections 1–2 and B
for 4–5.

**All five Phase 2 exclusions were re-examined and confirmed:** follower counts, logo strip, separate
About block, carousel, testimonials. One thing changed **placement** — the Method — and nothing cut
was reintroduced.

**Honest assessment:** the homepage is better than 7/10 and is still the weakest surface. It will be
judged on photography that does not exist.

---

## 7. Method UX Summary

The trust moment in every flow, and the page carrying the project's largest content risk.

- Five blocks per stage in fixed order, with **`doesNotProve` at identical family, size, colour and
  column width to `purpose`**. Checkable in a diff.
- The `boundaryStatement` sits **above** the stages, on the same surface treatment as the disclosure
  band — both are statements about the limits of authority.
- Each stage names **the user question it answers** and the reviews that used it.
- Six anchors on one page, not six routes. No sticky rail — marginalia, not a control.

**PROJECT MOCK METHOD vs VERIFIED ZINA METHOD** is defined as project vocabulary and carried into
Phase 4 by three mechanisms, none of which depends on anyone remembering: this document plus the
decision log; `_verification: MOCK` making publication impossible; and `check-mock-guard.mjs` making
`mock-method-six-stage` in build output a **build failure**.

**Seven forbidden implications enumerated** — seal, badge, version number, clinical vocabulary,
laboratory iconography, small-print limits, accuracy percentages.

---

## 8. Component Architecture Summary

**31 components. No `Card`, no `Badge`, no `Modal`, no `Tooltip`, no `Accordion`, no `Chart`.**

| Tier | Count | Contents |
|---|---|---|
| 0 — Signature devices | 5 | Margin Index · Plate · Three Voices · Disclosure Band · Conditions Well |
| 1 — Global structure | 7 | Header · Primary Nav · Locale Switcher · **Language Availability Indicator** · Breadcrumb · Footer · Skip Link |
| 2 — Content entities | 13 | Review Metadata · Summary Strip · Method Stage · Method Boundary · Stage Markers · Review Navigation · Product Context · Brand Context · Related Content · Journal Entry · Work Project · Person Block · Index Entry |
| 3 — Interaction & state | 6 | Facet Group · Contact Form · Empty State · Partial State · Update Log · Search Result *(deferred)* |

Each carries eleven fields including **forbidden variants**, which is the field that will do the most
work in Phase 4 code review.

**The card decisions are recorded as the brief requires** — three contained surfaces, each with WHY,
WHERE and WHY NOT editorial structure.

**No sixth signature device is proposed.** Three candidates were considered — a corpus marker, a
locale marker, a state marker — and each was solved with the existing system. The corpus marker was
rejected specifically because it sits one step from a KPI row.

**Sixteen of nineteen rendered components are non-interactive.** The entire evidence layer costs zero
JavaScript.

**Two entities are modelled and deliberately have no component:** `Testimonial` (none has
`approvalOnFile`) and `PressItem` (route deferred). Building components for them would create
pressure to use them.

---

## 9. Responsive Summary

Two thresholds carry real compositional change: **768** and **1024**. Everything else is easing.

**1024 is now evidence-backed rather than conventional**: the desktop header has a measured intrinsic
requirement of 753px, which with 48px tablet margins needs 849px before it fits — and needs headroom
above that to look composed.

- Every component specified across three ranges with **what changes structurally**.
- Type scale specified at four widths; **floors measured and holding at all five widths in both
  scripts**.
- Arabic at every breakpoint: four rules, two of them corrected by measurement in this phase.
- 320px treated as a real device class — and it is where the one genuine responsive defect was found.
- 1920+ caps content at 1180px; type does not grow.
- Evidence plates never re-crop; everything else may.

**Coverage matrix: 30 components × 6 widths**, with measured entries marked as such and everything
else honestly marked *specified*.

---

## 10. Accessibility Summary

WCAG 2.2 AA, designed into the architecture.

**Verified (measured):**

- Contrast — 24 pairs, `check-contrast.mjs`, exit 0. Lowest text pair 5.74:1; nine clear AAA.
- Arabic letter-spacing — 0 violations at five widths.
- Type size floors — 0 violations at five widths, both scripts.
- Disclosure statement unclipped at 320px in both scripts.

**Specified, not tested:** landmarks, heading hierarchy per template, reading and tab order, semantics
per component, focus behaviour, touch targets, alt strategy, reduced motion, forced colors.

**The central case — claim / observation / verdict — carries six independent signals:** text label,
semantics, typeface, rule style, size, colour. **Colour is the sixth.** Five survive greyscale, five
survive forced-colors, and the first two are sufficient on their own for a screen reader.

**Five new accessibility decisions** in Phase 3: heading level never follows visual size; the margin
index keeps its `<aside>` role inline; no `<details>` anywhere in content; the user's text-spacing
override is honoured even though it damages Arabic letterforms; the facet group is navigation rather
than a form control.

**Not done: the Arabic screen-reader pass.** It remains the check most likely to be skipped and most
likely to find real defects.

---

## 11. SEO / UX Summary

UX supports the Phase 1 SEO architecture without a single link existing for a crawler alone.

- **Breadcrumbs mirror the URL exactly** and never name a page that does not exist — no category
  segment until category routes are built.
- **Contextual links sit in the sentence that makes the claim**, not only in a related block.
- **The three highest-value links** each have a UX carrier that a human reads for their own reasons:
  the stage markers, the in-prose citation, the paid-work → independent-review cross-link.
- **Orphan analysis: zero orphans in either locale**, with three documented exceptions (legal pages,
  brands index, 404), none indexable-and-orphaned.
- **Nothing meaningful is behind an interaction** — no accordions, tabs, tooltips or lightboxes,
  which is simultaneously the SEO requirement and the accessibility requirement.
- **Nine link types were considered and NOT added**, including product pages, tag clouds and
  cross-locale "read this in English" links.

---

## 12. Empty / Partial State Summary

**Five state types — FULL, PARTIAL, EMPTY, GATED, MISSING TRANSLATION — across fifteen templates.**

Governing rules: absence is silent · never an illustration · never apologise · never fabricate to
fill · redirect rather than dead-end · **layout is chosen by count, never a scaled grid**.

**Locale filtering happens before the count is taken**, so a related block never renders a hole where
an item was filtered out.

**The launch-state audit is the most useful table in the document**: eleven of twelve surfaces are
partial, gated or absent today. That is why the partial states are designed first-class.

---

## 13. Interaction Summary

**The Phase 2 vocabulary is closed and no sixth pattern was introduced**: settle, sequence, decode,
attend, reveal.

- Every interaction specified with trigger, purpose, motion, duration and reduced-motion alternative.
- **Sixteen of nineteen components are non-interactive.**
- **Thirteen proposals rejected**, including a plate lightbox, a sticky margin index, a
  reading-progress indicator, collapsible observations and type-ahead search.
- Reduced motion is a **token-level** override and **nothing is lost** under it.
- Every interaction with a Core Web Vitals implication is listed with its mitigation. The largest
  named CLS risk remains **font swap**, mitigated by metric-matched fallbacks.

---

## 14. Creative Compliance Result

`docs/PHASE_3_CREATIVE_COMPLIANCE.md` — **26 of 26 checklist items pass or pass-as-specified**, with
one item (accessibility) carrying a named unverified component.

**The register test applied to all 31 components.** Three sit near the line — the conditions well,
the summary strip and the facet group — and each is held on the right side by a specific prohibition
(no borders or zebra; no tiles or icons; no count badges or dropdowns). Those prohibitions are the
compliance mechanism.

**No anti-pattern entry was overturned. None is marked superseded.** The five Phase 2 named as most
likely to happen are all absent, and two of them were actively defended against during the phase.

---

## 15. Validation Results

| Check | Result | Evidence |
|---|---|---|
| **Content validation** | **PASS**, exit 0 | 42 records, 11 collections, zero orphans, gates printed |
| **Contrast verification** | **PASS**, exit 0 | 24 required pairs |
| **Mock guard vs mock content** | **BLOCKED**, exit 1 | Correct — fabricated content must fail the build |
| **Mock guard vs clean output** | **CLEAN**, exit 0 | Verified in both directions |
| **UX coverage** *(new)* | **PASS**, exit 0 | 17/17 deliverables · 20/20 routes mapped · 10/10 collections · 31 components × 7 required fields · 30/30 responsive · 30/30 accessibility · **0 anti-pattern lines flagged** |
| **Bilingual type proof** | **EXECUTED** | 5 PASS, 3 PARTIAL, 1 defect fixed, 1 UNVERIFIED |
| **Route / entity orphan analysis** | **PASS** | Zero orphans per locale; three documented exceptions |
| **Component-to-content-model coverage** | **PASS** | Every component maps to an entity or a named UX requirement; two entities deliberately have none |
| **Bilingual coverage analysis** | **PASS** | Every Phase 3 document addresses Arabic / RTL — checker-verified |
| **Responsive coverage analysis** | **PASS** | 30/30 components in the matrix |
| **Accessibility requirement coverage** | **PASS** | 30/30 components in the per-component summary |
| **Anti-pattern compliance review** | **PASS** | 13 patterns scanned across 18 documents, 0 flagged |
| Typecheck / lint / build | **N/A** | No application exists |
| Screen-reader testing | **NOT RUN** | No code |
| Performance measurement | **NOT RUN** | No application |

**No existing validator was modified.** `check-ux-coverage.mjs` is additive; it found nine real gaps
on its first run (two missing deliverables, one unmapped route, three components missing required
fields, three components absent from the responsive matrix) and all nine were fixed rather than
excused.

**Deliberately not claimed:** no Lighthouse score, no screen-reader result, no rendering test of the
production design, and no proof of the Zarid recommendation.

---

## 16. Open Questions

| # | Question | Why it matters | Recommendation |
|---|---|---|---|
| **Q3-1** | Can 29LT Zarid be licensed? | The proof ran on the fallback tier. The type recommendation is still unproven | Client budget decision. Both paths fully specified |
| **Q3-2** | Criterion 10 — does the Arabic read as Arabic? | The most important question about half the site | **Show `docs/proofs/type-proof.html` to a native reader.** Eight questions drafted, four of them editorial |
| **Q3-3** | **Does Zina already have a testing method?** | **Unanswered since Phase 0.** The Method is the IA spine, the visual spine and now the UX spine | Ask before Phase 4 writes copy |
| **Q3-4** | Re-measure the header and size factors on Zarid | The measured inequality may reverse | Blocked on Q3-1 |
| **Q3-5** | Western vs Arabic-Indic numerals | Affects every record line | Needs audience data (U-04) |
| **Q3-6** | Is `الساعة 6` the natural Arabic idiom for a timed observation? | New. Editorial, not typographic — and likely more valuable than the type questions | Ask Zina |
| **Q3-7** | A "currently testing" module on the homepage? | The model supports it; publishing it creates an expectation | Deferred, revisit post-launch |
| **Q3-8** | Light theme | Deferred from Phase 2 | Phase 4; semantic tokens make it a value swap |

---

## 17. Decisions Requiring Approval

| # | Decision | Rationale | Reversal cost |
|---|---|---|---|
| **D3-1** | **The bidi rule for numerals is corrected**; `BILINGUAL_TYPE_TEST.md` §4 Rule 4 superseded | Measured. The old rule produces a reversed range on every Arabic review page | Low now, high after Phase 4 |
| **D3-2** | Conditions value cells wrap; only the numeric isolate is `nowrap` | Measured overflow at 320px in English | Trivial |
| **D3-3** | Header laid out to the **wider measured** label set; height reserved for the Arabic line box in both locales | Measured. The Phase 2 instruction was wrong on this tier | Trivial |
| **D3-4** | **Homepage opening 88vh → 72vh**; proof must begin before 1.0 viewport heights at 375 | Resolves a contradiction inside the Phase 2 homepage document | Trivial |
| **D3-5** | Placeholder tone fields **only where a caption carries information** | Prevents a homepage of grey rectangles | Low |
| **D3-6** | One Method line in homepage section 1 | *Why different* is a first-two-screens requirement | Trivial |
| **D3-7** | The 404 does **not** offer the other locale's version | Would reintroduce "Arabic is a subset" | Trivial |
| **D3-14** | **Search deferred**, architecture fully specified | A search field on a five-item library is an admission the library is hard to navigate | Low |

**D3-1 is the one that must not be lost.** It is invisible to anyone who does not read Arabic, and it
would ship silently.

---

## 18. Risks

| # | Risk | Impact | Likelihood | Change |
|---|---|---|---|---|
| **R-04** | Client supplies compressed social exports, not photography masters | **Severe** | Medium-high | **Partly mitigated.** Homepage State B proves the argument survives with no photography — but the quality gap is real and is now measured at roughly a third of the page weight |
| **R-13** | Arabic/Latin pairing fails at display size | High | Medium | **Lowered.** The system is measured; the faces are not. **Partially discharged** |
| **R-17** | Clinical drift — the evidence layer becomes a dashboard | High | Medium | **Lowered.** Register test applied to all 31 components; three near the line each held by a specific prohibition; a stat line was proposed and rejected |
| **R-18** | Type licensing unbudgeted | Medium | Medium | **Unchanged**, and now the binding constraint on closing R-13 |
| **R-19** | Rounded-card drift in Phases 3–5 | Medium | **High** | **Lowered.** No `Card` exists; three contained surfaces documented; radius 0 with no third token; detectable in a diff |
| **R-21** | Homepage under-delivers | Medium | Medium | **Lowered.** Proof moved up, photography dependency severed, exclusions re-confirmed |
| **R-22** | **Bidi defects ship invisibly** | **High** — factual errors in published records | **Medium-high** | **NEW.** One found and fixed. Mitigated by the type proof being re-runnable, but there is no automated bidi test in CI yet |
| **R-23** | **Phase 4 implements from the wireframes and loses a "forbidden variant"** | Medium | Medium | **NEW.** Mitigated by every component carrying an explicit forbidden-variants field, and by `check-ux-coverage.mjs` scanning for reintroduced anti-patterns |
| **R-24** | **The mock Method is implemented as though verified** | **High** — an integrity failure, not a design one | Medium | **NEW.** Mitigated by three independent mechanisms including a build failure |
| R-02, R-03, R-06, R-08 | Content supply, bilingual cost, SEO timeline, publishing cadence | — | — | Unchanged |
| **R-07** | **Git boundary** | High | Medium | **Still open.** See §20 |

---

## 19. Photography Dependencies

Photography was **not** allowed to block Phase 3, and commissioning should proceed in parallel.

### Required image classes

| Class | Purpose | Components |
|---|---|---|
| **Editorial portrait** | Homepage §1, `/about/` | Person Block, homepage opening |
| **Review hero** | The LCP on every review | Hero |
| **Evidence plate** | The record. Bound to a `stageKey` | Plate |
| **Comparison pair** | Hour 0 / hour 8, identical setup | Plate (pair variant) |
| **Work hero + gallery** | Case studies | Work Project |
| **Journal hero** | Articles | Journal Entry |
| **Index entry image** | All listings | Index Entry |
| **Brand logo** | Brand pages only | Brand Context |

### Ratios and crops

| Image | Mobile | Tablet | Desktop | Min. long edge |
|---|---|---|---|---|
| Homepage portrait | 4:5 | 4:5 | 4:5 | **2400px** |
| Review hero | **4:5** | 3:2 | **16:10** | **2800px** (widest crop) |
| **Evidence plate** | **3:2 — never re-cropped** | 3:2 | 3:2 | **2000px** |
| Comparison pair | 1:1 | 1:1 | 1:1 | 1600px |
| Work hero | 3:2 | 16:10 | 16:10 | 2800px |
| Journal hero | 3:2 | 16:9 | 16:9 | 2800px |
| Index entry | 4:5 | 4:5 | 4:5 | 1200px |

Three art-directed crops per hero via `<picture>`, so mobile downloads a **smaller file**, not a
resized large one. Evidence plates ship **one** crop, because comparability is their function.

### Placeholder behaviour

- A tone field is rendered **only where a caption or plate treatment carries information without the
  image** (D3-5).
- Everywhere else the image is **not rendered** and the layout re-composes — homepage State B.
- **No stock imagery of a person, ever.**
- Aspect-ratio boxes reserve space in all cases, so a missing image costs no layout shift.

### Components that depend on photography

**Hard dependency:** Plate, Hero, Person Block portrait.
**Soft dependency (degrade to text-led):** Index Entry, Journal Entry, Work Project, Brand Context.
**No dependency:** everything in Tier 0 except the Plate, all of Tier 1, and all of Tier 3.

**Every credibility-carrying component — disclosure, conditions, observations, verdict, limitations,
method — works with no photography at all.** That is the finding worth carrying into the shoot brief:
photography raises the quality ceiling; it does not carry the argument.

---

## 20. Git Risk

**R-07 remains open and was not actioned.**

```
$ git rev-parse --show-toplevel
C:/Users/Lenovo

$ git log --oneline -1
fatal: your current branch 'master' does not have any commits yet
```

**The detected repository root is the user's home directory.** The project has no repository of its
own, and there are no commits.

**Per the brief, nothing was done:** no `git init`, no `git add`, no `git commit`, no change to the
repository boundary, and no file outside the project directory was touched.

**Why this matters more now than it did in Phase 2.** Phase 3 produced ~6,300 lines across 18 files
and corrected three earlier decisions. **None of that is under version control.** There is no history
of the corrections, no way to review a change to a "forbidden variant" in a diff, and no protection
against accidental loss — and *"detectable in a diff"* is the stated enforcement mechanism for
several of the strongest rules in the system.

**Recommendation, unchanged and now more urgent:** establish a project-specific repository at
`.../zina-almokri-premium-website-md/` **before Phase 4 begins**, with an appropriate `.gitignore`.
That is the user's decision to make and to execute.

---

## 21. What Was NOT Implemented

Per the brief's stop conditions:

- **No Astro application.** No pages, no routes, no layouts, no islands.
- **No components.** The inventory specifies boundaries and behaviour, not code.
- **No production CSS.** No tokens converted, no stylesheet, no utility classes.
- **No homepage, no review page, no template of any kind.**
- No routing, no CMS, no backend, no database.
- No UI library, animation library, component library or icon library installed.
- No fonts licensed, installed or self-hosted.
- No images, no photography, no icon SVGs drawn.
- No design system as code.
- No build, no bundler, no dependencies added — the project still has **no `package.json`**.
- **Phase 4 not begun.**

**Two files were produced that execute:**

1. `docs/proofs/type-proof.html` — an **evaluation harness** that renders type specimens so the ten
   criteria could be measured. It loads fonts from a public CDN, contains no product UI, and its CSS
   **must not be copied into Phase 4** (D3-15). It is deletable without loss once Zarid is proven.
2. `tools/check-ux-coverage.mjs` — a **validator**, in the same directory and the same
   zero-dependency style as the three existing tools. It is additive and modifies nothing.

Also not done, and worth stating:

- **No native Arabic reader has reviewed anything.** Criterion 10 is unverified.
- **No screen reader has run over any of this**, in either language.
- **No client review of the UX architecture**, and D3-4 (homepage) plus Q3-3 (the Method) both want
  Zina's own view.

---

## 22. Recommendation for Phase 4

**Proceed to Phase 4 — design system**, per `docs/PHASE_PLAN.md`: tokens, typography scale, spacing,
grids, controls, editorial modules, media rules, motion tokens.

**Four things Phase 4 should do first, in order:**

1. **Establish the project repository** (§20). Several of this system's strongest rules are enforced
   by being *"detectable in a diff"*, and there is currently no diff.
2. **Resolve the type licence, then re-run the proof.** `docs/proofs/type-proof.html` and
   `window.__proof()` exist for exactly this. Q3-1 → Q3-4 all unblock together, and the Arabic score
   moves the moment they do.
3. **Get criterion 10 in front of a native Arabic reader.** Eight questions are drafted; four of them
   are editorial and should go to Zina. This is the cheapest high-value action available in the
   project right now.
4. **Convert the tokens with the forbidden-variants field open beside you.** `radius.none`,
   `shadow.none` and `type.tracking.arabic` encode refusals; the component inventory's forbidden
   variants encode the rest.

**In parallel, and independently of Phase 4:**

- **Commission the photography.** The brief is written (`docs/PHOTOGRAPHY_ART_DIRECTION.md` §7), the
  classes and minimum dimensions are specified above, and R-04 remains the largest threat to the
  visual direction.
- **Ask Zina about the Method.** Unanswered since Phase 0, and it is now the spine of three
  architectures.

### Suggested handoff context for Phase 4

> Phase 3 is complete. Read `docs/reports/PHASE_3_REPORT.md`, then
> `docs/COMPONENT_INVENTORY.md`, `docs/REVIEW_WIREFRAMES.md`,
> `docs/PHASE_3_BILINGUAL_TYPE_PROOF.md` and `docs/PHASE_3_DECISION_LOG.md`.
>
> The UX architecture is complete for 15 templates and 31 components. **Three Phase 2 decisions were
> corrected by measurement** and are recorded as C3-1, C3-2 and C3-3 — the bidi rule for numerals is
> the one that must not be lost.
>
> Run `node tools/check-ux-coverage.mjs`, `node tools/validate-content.mjs` and
> `node tools/check-contrast.mjs` before and after any change.
>
> Execute **Phase 4 only**: tokens, scale, spacing, grids, controls, editorial modules, media rules,
> motion tokens. Do not build the Astro application. Do not implement pages. The Method is a
> **PROJECT MOCK METHOD** until Zina says otherwise.
>
> Report to `docs/reports/PHASE_4_REPORT.md`.

**Phase 4 has not been started.**
