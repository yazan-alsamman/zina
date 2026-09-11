# Phase 3 Decision Log

**Status:** Phase 3 record. Every decision taken, every conflict with an earlier phase found and
resolved, and every proposal rejected.

**The rule this document exists to honour:** *do not quietly overwrite an earlier decision.* Where
Phase 3 contradicts Phase 0, 1 or 2, the conflict is identified, documented, resolved explicitly,
and the superseded text is marked rather than deleted.

---

## 1. Conflicts with earlier phases

Five genuine conflicts were found. **Three were found by measurement, not by opinion.**

---

### C3-1 · The bidi isolation rule for numerals — Phase 2 is wrong

| | |
|---|---|
| **Earlier decision** | `docs/BILINGUAL_TYPE_TEST.md` §4 Rule 4: *"Percent, degree and range signs sit with the numeral inside the isolate so they do not migrate."* |
| **The conflict** | Measured, that markup produces the defect it was written to prevent |
| **Evidence** | `<bdi>34–38 °م</bdi>` renders visually left-to-right as `°م \| 38 \| 34` — **the range reads 38–34**. `<bdi>` resolves direction from the first strong character, and in that run the first strong character is the Arabic **م**, so the isolate resolves RTL and the numerals swap. Verified by `Range.getBoundingClientRect()` token ordering, not by eye (`docs/PHASE_3_BILINGUAL_TYPE_PROOF.md` §5) |
| **Resolution — D3-1** | **Rule 4 is superseded.** Isolate the **numeric run only**, with an explicit direction: `<bdi dir="ltr">34–38</bdi> °م`. A Latin unit (`°C`, `%`, `ml`) may sit inside the isolate; an **Arabic** unit (`°م`, `٪`, `ساعات`) must sit outside it. **Never wrap a mixed numeral-plus-Arabic-unit run in a bare `<bdi>`** |
| **Rule 1 status** | **Confirmed unchanged.** `<bdi lang="en">` around Latin product names is correct |
| **Scope** | Every conditions well, every observation timestamp, every record line, every plate number in Arabic |
| **Severity** | **High.** Silent, on every Arabic review page, and invisible to a non-Arabic-reading team |
| **Reversal cost** | Low now; high after Phase 4 |

---

### C3-2 · The conditions well overflows at 320px — in English

| | |
|---|---|
| **Earlier decision** | `docs/EVIDENCE_LANGUAGE.md` §4: conditions values in tabular mono, right-aligned so numerals form a column. `docs/RESPONSIVE_ART_DIRECTION.md` §5: at 320px *"the conditions well remains readable as label/value rows"* |
| **The conflict** | With `white-space: nowrap` on the value cell — required so numeric ranges do not break mid-range — prose values cannot wrap either. At 320px the **English** table needs 279px inside a 265px well and overflows |
| **Evidence** | Measured in the harness. Arabic fit at 225px; English did not |
| **Resolution — D3-2** | `white-space: normal` on the value cell; `white-space: nowrap` on the **numeric isolate only**. Re-measured: English drops to 225px, fits, **and numeral column alignment is preserved**. If a row still cannot fit at 320, the row stacks — label above value, value to the inline end |
| **Note worth keeping** | Phase 2 named the conditions well as the highest-risk component *in Arabic*. **It broke in English.** The lesson is to measure both, not to assume which script is fragile |
| **Reversal cost** | Trivial |

---

### C3-3 · "Lay the header out to the Arabic width" — measured, the English set is wider

| | |
|---|---|
| **Earlier decision** | `docs/BILINGUAL_TYPE_TEST.md` §7: *"The header must be laid out to the Arabic width … Designing the header in English first and discovering the Arabic overflow at implementation is the predictable failure."* Repeated in `RESPONSIVE_ART_DIRECTION.md` §2 |
| **The conflict** | On the fallback tier the Arabic header measures **686px** and the English header **753px** — English is 9% *wider*. The Arabic labels (المراجعات، الطريقة، المجلة، الأعمال، عن زينا، تعاون) are compact, and ×1.12 does not close the gap |
| **What Phase 2 was right about** | Arabic **does** bind — **vertically**. Header height measures 88px in Arabic against 82px in English, and the language switcher is the one element wider in Arabic (102px vs 97px) |
| **Resolution — D3-3** | The rule is restated, not deleted: **lay the header out to the wider of the two measured label sets, and check both at 1024 — do not assume which one binds.** Additionally: **reserve header height for the Arabic line box in both locales**, so the header does not change height when the language changes |
| **Caveat** | Measured on the **fallback tier**. Zarid's Naskh has different proportions and the inequality may reverse. The restated rule survives either outcome, which is why it is phrased that way |
| **Reversal cost** | Trivial — it is a check, not a layout |

---

### C3-4 · Homepage opening height: 88vh → 72vh

| | |
|---|---|
| **Earlier decision** | `docs/HOMEPAGE_ART_DIRECTION.md` §3: opening section ~88vh, *"so a sliver of the next section must be visible"*; §5: *"the proof block must begin within one swipe"* with the stated threshold at **1.5 viewport heights** at 375px |
| **The conflict** | 1.5 viewport heights **is not one swipe.** The two statements in the Phase 2 document contradict each other, and the homepage's own diagnosis was that the proof arrives too late |
| **Resolution — D3-4** | Opening section **72vh at desktop, content-driven with a 78vh cap on mobile**. The requirement is restated as a measurable check: **at 375 × 667 the featured review's disclosure label must be reachable before 1.0 viewport heights** |
| **Why this is not decoration** | The brief instructs that the homepage's 7/10 be fixed through information architecture, not visual addition. This adds nothing; it moves the proof closer |
| **Reversal cost** | Trivial |

---

### C3-5 · Placeholder tone fields — Phase 2 is too permissive

| | |
|---|---|
| **Earlier decision** | `docs/EMPTY_STATES.md`: *"Until real photography exists: neutral tone fields at the correct aspect ratio, on `ground.raised`. Plate numbers, captions and hairlines retained, so the composition is real."* |
| **The conflict** | Applied uniformly, that produces a homepage with a full-height grey rectangle where a face should be, and three grey rectangles in a row in the recent-reviews section. Phase 2 designed the rule for **evidence plates**, where a caption carries the information, and then stated it generally |
| **Resolution — D3-5** | The rule is **narrowed**: a tone field is rendered **only where a caption or plate treatment carries information without the image**. Everywhere else the image is **not rendered** and the layout re-composes at a width the remaining content deserves — homepage State B (`docs/HOMEPAGE_WIREFRAMES.md` §5) |
| **What survives unchanged** | Evidence plates, review heroes with captions, and any image whose caption stands alone still use the tone field. **No stock imagery of a person, ever** |
| **Reversal cost** | Low |

---

## 2. Decisions taken in Phase 3

Beyond the five conflict resolutions above.

| # | Decision | Rationale | Reversal cost |
|---|---|---|---|
| **D3-6** | **The Method gets one line in homepage section 1** — *"Six stages, the same six every time. How I test →"* | *Why her testing is different* is a first-two-screens requirement and Phase 2 answered it in section 3, the third screen. One sentence and a link, no new component, no record density, 40px of vertical space | Trivial |
| **D3-7** | **The 404 does not offer the other locale's version of a missing page** | It would reintroduce the "the real site is English, Arabic is a subset" framing the multilingual architecture rejects, and a reader who wanted the other language would already be there | Trivial |
| **D3-8** | **The user's text-spacing override is honoured even though `letter-spacing` damages Arabic letterforms** | WCAG 1.4.12 requires no loss of content, and content is not lost — only beauty. The site must not defend against it with `!important` | Trivial, but should not be reversed |
| **D3-9** | **Heading level never follows visual size.** The verdict is the largest text on a review page and is an `h2`; the homepage statement is the `h1` and the name is not a heading | Structure is not typography. It is also the heading-level expression of *"the claim is the headline; the name is small"* | Trivial |
| **D3-10** | **The margin index keeps its `<aside>` role when it collapses inline** below 1024 | The information is the same; only the position changed. Dropping the role would make the relationship to the observations invisible to assistive technology at exactly the width where most readers are | Trivial |
| **D3-11** | **No `<details>` anywhere in content.** The one permitted use is the no-JS mobile-menu mechanism, which is a control | The Method's limits, the observations and the disclosure are the three things most likely to be "tidied" into a disclosure widget, and each is the thing the page exists to show | Trivial |
| **D3-12** | **The facet group is navigation, not a form control** — links with `aria-current` in a named `<nav>`, not a listbox or combobox | It works without JavaScript, it is crawlable, and it is honest about what it is: a set of links to filtered URLs | Low |
| **D3-13** | **No next/previous review navigation** | "Next" implies a sequence that reviews do not have, and a sticky bar is a control on a reading page. Related reviews chosen by relationship serve the actual intent | Low |
| **D3-14** | **Search is deferred, with its architecture fully specified** (`docs/SEARCH_UX.md`) | A search field on a five-item library is an admission the library is hard to navigate, and it is not. Activation at ~200 reviews | Low — the route is defined |
| **D3-15** | **The type-proof harness is an evaluation artefact, not application code** | It renders specimens so the ten criteria could be measured. Its CSS must not be copied into Phase 4 — the tokens are already specified properly in `docs/DESIGN_TOKENS_SPEC.md`. It is not an Astro app, not a component, and not a build | Trivial — delete it |
| **D3-16** | **Homepage State A and State B are chosen per section, not per page** | The likely launch state is State A for sections 1–2 and State B for 4–5. A page-level switch would either waste an existing portrait or render three grey rectangles | Trivial |

---

## 3. The card decisions, recorded as the brief requires

Three contained surfaces exist on the entire site. Each is recorded with **WHY**, **WHERE** and
**WHY NOT editorial structure**.

| # | Where | Why | Why not editorial structure |
|---|---|---|---|
| **C-1** | Suitability block (suits well / may not suit) | The two lists *belong to each other* — the pairing is the meaning, and a reader must see them as one assessment with two halves | Rules and space alone would read as two unrelated lists. The surface is what says *these are the same judgement seen from two sides* |
| **C-2** | Related content at the foot of a page | Peer objects, individually actionable, and the block must separate cleanly from the article | A hairline alone does not create enough distance even after 128px of space; the reader needs to know the article has ended |
| **C-3** | Mobile menu panel | An overlay surface that must occlude the page beneath it | There is no editorial equivalent of an overlay |

**Everywhere else uses the index treatment** — image, hairline, type, no container. That includes
every listing, every related item, every homepage section, and search results if search ever ships.

---

## 4. The sixth signature device — not proposed

The brief permits proposing a sixth device if a real UX problem cannot be solved with the existing
five, and requires that any such proposal be documented and **not implemented**.

**No sixth device is proposed.** Three candidates were considered during the phase and each was
solved with the existing system:

| Candidate | Problem it would have solved | Solved instead by |
|---|---|---|
| A "corpus marker" for the homepage — a standing typographic line stating the size and shape of the review library | The homepage's *"proof of the work"* requirement, without waiting for photography | **The featured review block**, moved closer (D3-4) plus the Method line (D3-6). A corpus marker would also sit one step from a stat grid, which is the dashboard drift named in R-17 |
| A "locale marker" showing which languages a record exists in | Making translation coverage legible | **The Language Availability Indicator** (CMP-09), which is a sentence, not a device — and which only appears where a reader actually needs it |
| A "state marker" distinguishing full from partial sections | Making the launch state legible | **Layout by count.** A partial section that is composed for its count needs no marker, and a marker would advertise incompleteness — which is precisely what the empty-state principles forbid |

**Five devices remain: margin index, plate, three voices, disclosure band, conditions well.**

---

## 5. Proposals rejected in Phase 3

| Proposed | Rejected because |
|---|---|
| Lightbox on evidence plates | The plate is already at full editorial scale; a lightbox adds JS, a focus trap and a keyboard contract to a static record |
| Sticky margin index | It is marginalia, not a control |
| Reading-progress indicator | The scrollbar already does this |
| A stat line on the homepage ("6 reviews · 24 wear tests") | One step from a KPI row, and R-17 (dashboard drift) is the named risk of this direction |
| Cross-locale link on a missing-translation 404 | D3-7 |
| Type-ahead search | Search is not in v1; when it ships, results are a URL |
| A "currently testing" module on the homepage | The content model supports the state (`testingStatus: Tested`, `reviewStatus: Draft`), but publishing what is being tested before a verdict exists creates an expectation the schedule cannot meet, and it would advertise unfinished work on the site's most important page. **Revisit when the publishing cadence is proven** |
| Author archive pages | `authorId` is modelled, but a single-author archive duplicates `/about/` |
| An HTML sitemap page | Link plumbing on a 21-record site |
| Page transitions | Deferred to Phase 6 with measurement, per Phase 2 |
| A brand-coloured takeover on brand pages | This is Zina's site; a brand takeover would blur the independence the site argues for |

---

## 6. Decisions carried forward unchanged

Confirmed in Phase 3 and **not** re-litigated:

- The Testing Room as the direction; dark warm-ink ground.
- Five signature devices; no sixth.
- Radius 0 (2px on controls only); no shadows; hairlines and space carry structure.
- Five motion patterns; no animation library; nothing above the fold animates.
- No 3D, no WebGL, no video.
- No numeric rating, no stars, no score, no badge.
- Disclosure above the hero, never truncated, prominence scaling with money.
- Limitations at identical weight to strengths.
- `doesNotProve` at identical weight to purpose.
- Arabic as an authoring language, not a translation layer.
- Missing translation → no route, no hreflang, no stub, no machine translation.
- Brands out of primary navigation; five primary items.
- Products have no route.
- Facets as crawlable URLs.
- The evidence language is rationed: full on reviews, partial on Method and work, one moment on the
  homepage, absent elsewhere.

---

## 7. Open questions raised or carried by Phase 3

| # | Question | Status | Owner |
|---|---|---|---|
| **Q3-1** | Can 29LT Zarid be licensed? | **Unanswered since Phase 2 (Q-2).** The proof ran on the fallback tier | Client — budget |
| **Q3-2** | Criterion 10 — does the Arabic page read as Arabic? | **UNVERIFIED — HUMAN REVIEW REQUIRED** | Native Arabic reader |
| **Q3-3** | Does Zina already have a testing method? | **Unanswered since Phase 0.** The Method is the IA spine, the visual spine and now the UX spine | Zina |
| **Q3-4** | Re-measure the header and the size factors on Zarid | Blocked on Q3-1 | Phase 4 |
| **Q3-5** | Western vs Arabic-Indic numerals | Carried from Phase 1 (U-04) | Audience data |
| **Q3-6** | Is `الساعة 6` the natural Arabic idiom for a timed observation marker? | New. An editorial question, not a typographic one, and likely to produce more value than the type questions | Zina / native reader |
| **Q3-7** | Should the homepage carry a "currently testing" module once cadence is proven? | New, deferred | Revisit post-launch |
| **Q3-8** | Light theme | Deferred from Phase 2 (Q-4) to Phase 4. Semantic tokens make it a value swap | Phase 4 |

---

## 8. How to overturn anything in this document

Same procedure as `docs/DESIGN_ANTI_PATTERNS.md`:

1. Record the decision, the reason and the date in a phase report.
2. **Mark the entry superseded — do not delete it.**
3. If the decision was made by measurement (C3-1, C3-2, C3-3), overturn it by **re-measuring**, not
   by argument. `docs/proofs/type-proof.html` and `window.__proof()` exist for exactly that.
