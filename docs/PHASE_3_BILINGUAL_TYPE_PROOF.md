# Phase 3 Bilingual Type Proof

**Status:** Phase 3 gate. **Executed, with real type set and measured.**
**Harness:** `docs/proofs/type-proof.html` — an evaluation artefact, not production code.
**Specification under test:** `docs/BILINGUAL_TYPE_TEST.md` §8, ten pass criteria.

---

## 0. What this proof is, and what it is not

Phase 2 closed with the Arabic typography **specified but unproven** (R-13, Q-1). This document
closes as much of that gap as can honestly be closed today, and states precisely what remains open.

| | |
|---|---|
| **Type set** | **The documented open-source fallback tier**, not the recommendation |
| Display / body | IBM Plex Serif (Latin) + Noto Naskh Arabic (Arabic) |
| UI / label | IBM Plex Sans + IBM Plex Sans Arabic |
| Record | IBM Plex Mono, numerals and Latin identifiers only |
| **Not set** | **29LT Zarid Serif / Zarid Text — no licence has been obtained** |
| Method | Rendered in Chrome, measured programmatically at four viewport widths in both directions |
| Evidence | Computed styles, element and document overflow, bounding-box geometry, `Range` token ordering |

**Why the fallback tier.** Zarid is commercially licensed and no type budget has been confirmed
(Phase 2 Q-2). Waiting for a licence would have blocked the whole phase, and the brief instructs
the proof to proceed on the fallback tier if licensing is not available.

**What that means for the results.** Every result below is a result **about the fallback tier**.
The structural findings — bidi behaviour, letter-spacing, size factors, layout thresholds, column
alignment, overflow — are properties of the *system*, and transfer to Zarid unchanged. The optical
findings — whether Arabic and Latin land at the same volume, whether ×1.12/×1.18 are the right
factors, whether the header's binding constraint is English or Arabic — are properties of the
*faces*, and **must be re-run on Zarid before Phase 4 sign-off**.

This document does not claim Zarid has been proven. It claims the *system* has been proven on a
shippable tier, and that three real defects were found and fixed by doing so.

---

## 1. Test conditions

| | |
|---|---|
| Widths | **1440, 1024, 768, 375, 320** (the spec asks for 1440/768/375; 1024 and 320 added because Phase 2 names them as the two highest-risk widths) |
| Directions | LTR `lang="en"` and RTL `lang="ar"`, rendered side by side in the same document |
| Copy | **Real project copy** from `content/mock/reviews.json`, `method.json` and `person.json`. No Lorem Ipsum, no invented Arabic |
| Specimens | 13 — display heading, long heading, body, header/navigation, record metadata, mixed script, margin index, conditions well, plate caption, disclosure band, three voices, long Arabic paragraph, numeral isolation variants |
| Isolation of viewport | Each width measured in a same-origin iframe sized exactly, so media queries evaluate against the real width rather than a resized OS window |

Measurement was mechanical. Nothing in sections 2–6 was judged by eye except where explicitly
marked as a visual observation.

---

## 2. The ten criteria — results

| # | Criterion | Result | Evidence |
|---|---|---|---|
| 1 | Arabic and English headlines at the same scale step read at the same optical volume | **PARTIAL — measured, not judged** | Geometry matches spec exactly: `display.lg` 56px EN → 62.72px AR (ratio **1.120**), line-height 60.48 → 79.93 (leading ratio **1.180**). Whether they read at equal *optical* volume is a human judgement and is deferred with criterion 10 |
| 2 | Arabic paragraphs have adequate room for diacritics without looking airy | **PARTIAL** | `body.md` 18/30.24 EN → 20.16/39.97 AR. The same 6-sentence paragraph occupies 7 lines / 212px in English and 5 lines / 200px in Arabic at equal column width — Arabic is denser per line and marginally shorter overall, so the ×1.18 leading is not producing an airy page. Visual adequacy of diacritic clearance requires a native reader |
| 3 | Metadata lines land at the same volume in both scripts | **PARTIAL — mechanism verified** | EN `label.sm` 12px / weight 500 / tracking **0.96px** uppercase; AR 13.44px / weight **400** / tracking **normal (0)**. The two-mechanism specification from `BILINGUAL_TYPE_TEST.md` §5 renders as designed. Equality of perceived volume is a human judgement |
| 4 | No Latin run inside Arabic is mispositioned, and no punctuation migrates | **PASS for identifiers · DEFECT FOUND AND FIXED for numerals** | See §5. Product-name isolation verified correct; a real defect was found in numeral-plus-Arabic-unit runs |
| 5 | The margin index sits on the correct side in each direction | **PASS** | At 1024 and 1440 the index is present and on the inline-start side in both directions (LTR index left edge 147 vs note 339; RTL index left edge 1119 vs note 388). At 768, 375 and 320 the index column is hidden and the **inline marker row is present** in both scripts — collapse, not disappearance |
| 6 | Numerals align in columns in the conditions table in both locales | **PASS** | Value-cell edges identical across all four rows in both locales at every width: LTR right edges `[657,657,657,657]`, RTL left edges `[769,769,769,769]` at 1440; still aligned at 320 |
| 7 | No Arabic text is letter-spaced anywhere | **PASS** | Every element inside `[lang="ar"]` walked at every width. **0 violations** at 1440, 1024, 768, 375 and 320. `type.tracking.arabic` holds |
| 8 | The header does not wrap or overflow in Arabic at 1024 | **PASS — and the assumption behind it is wrong** | At 1024 the header has 961px available; it needs 686px in Arabic and **753px in English**. No wrap, no overflow in either script. See §4 — the binding constraint is **English**, not Arabic, on this tier |
| 9 | Nothing in either script falls below the size floors | **PASS** | Every body, record, label and UI element checked against 16px / 13px / 12px floors at all five widths. **0 violations** |
| 10 | The Arabic page does not look like a translation | **UNVERIFIED — HUMAN REVIEW REQUIRED** | No native Arabic reader has reviewed this. Not claimed as a pass. See §7 |

**Summary: 5 measurable criteria PASS, 3 PARTIAL (mechanism verified, optical judgement deferred),
1 defect found and fixed, 1 UNVERIFIED pending human review.**

---

## 3. Overflow and reflow

| Width | Document overflow | Element overflow | Notes |
|---|---|---|---|
| 1440 | **None** | None | |
| 1024 | **None** | None | Including the full header and the margin index together — the Phase 2 "highest-risk breakpoint" |
| 768 | Present | `.page` | **Caused solely by the desktop header specimen being rendered below its threshold.** See §4 |
| 375 | Present | `.page` | Same cause |
| 320 | Present | `.page`, **`.well`** | Same cause, **plus a genuine defect in the conditions well** — see §6 |

The harness renders the desktop header at every width because measuring its intrinsic requirement
was one of the goals. In the real design the desktop header does not exist below 1024px; the mobile
header and full-screen overlay replace it (`docs/NAVIGATION_UX.md`). The 768/375 overflow is
therefore an artefact of the harness, and the number it produces is the useful part.

---

## 4. The header measurement, and a Phase 2 assumption corrected

Intrinsic content widths, measured at `width: max-content`, fallback tier:

| Element | English | Arabic | Δ |
|---|---|---|---|
| **Full header** | **753px** | **686px** | Arabic is **9% narrower** |
| Primary nav (5 items) | 597px | 570px | Arabic 4.5% narrower |
| Wordmark | 125px | 85px | |
| CTA (Collaborate / تعاون) | 115px | 76px | |
| Language switcher | 97px | 102px | Arabic wider |
| **Header height** | **82px** | **88px** | **Arabic is 7% taller** |

**Phase 2 states:** *"The header must be laid out to the Arabic width … Designing the header in
English first and discovering the Arabic overflow at implementation is the predictable failure"*
(`docs/BILINGUAL_TYPE_TEST.md` §7, repeated in `RESPONSIVE_ART_DIRECTION.md` §2).

**Measured, that is not true on this tier.** The Arabic label set is *shorter* — المراجعات,
الطريقة, المجلة, الأعمال, عن زينا and تعاون are compact words, and the ×1.12 size factor does not
close a 9% gap. The English set binds horizontally.

**What is true, and what Phase 2 was reaching for:** Arabic binds **vertically** (88px vs 82px), and
the switcher is the one horizontal element that is wider in Arabic. The underlying instruction was
right in spirit and wrong in the specific.

**Resolution (decision D3-4 in `docs/PHASE_3_DECISION_LOG.md`):** the rule is restated as *lay the
header out to the wider of the two measured label sets, and check both at 1024 — do not assume
which one binds*, plus *reserve header height for the Arabic line box in both locales, so the header
does not change height when the language changes*. The Phase 2 text is not deleted; it is
superseded and the reason recorded.

**This must be re-measured on Zarid.** Zarid's Arabic Naskh has different proportions to Noto Naskh
Arabic, and the inequality could reverse. The rule as restated survives either outcome, which is why
it is stated that way.

---

## 5. Criterion 4 — a real defect, found and fixed

The most valuable result in the proof, and precisely the class of failure §4 of
`docs/BILINGUAL_TYPE_TEST.md` was written to catch.

**Method.** Rather than judging by eye, the visual left-to-right order of individual tokens was
extracted with `Range.getBoundingClientRect()` inside an RTL Arabic paragraph.

| Markup | Visual order, left → right | Verdict |
|---|---|---|
| `استخدمت Voile Lumière Skin Tint.` (no isolation) | `. \| Tint \| استخدمت` | Correct |
| `استخدمت <bdi>Voile Lumière Skin Tint</bdi>.` | `. \| Tint \| استخدمت` | Correct |
| **`<bdi>34–38 °م</bdi>`** | **`°م \| 38 \| 34`** | **WRONG — the range reads 38–34** |
| `<bdi dir="ltr">34–38</bdi> °م` | `°م \| 34 \| 38` | **Correct** |
| `<span dir="ltr" style="unicode-bidi:isolate">34–38 °م</span>` | `34 \| 38 \| °م` | Correct order, but forces the Arabic unit into an LTR island |
| `34–38 °م` (no isolation) | `°م \| 34 \| 38` | Correct here, but unguaranteed at a run boundary |
| **`<bdi>58–71 ٪</bdi>`** | `58 \| 71 \| ٪` | Numerals correct, **Arabic percent sign ends up on the wrong side of the run** |
| `<bdi dir="ltr">58–71</bdi> ٪` | `٪ \| 58 \| 71` | **Correct** |

### The finding

`<bdi>` resolves its direction **automatically from the first strong character in the run**. In
`34–38 °م` the digits are directionally weak and the first strong character is the Arabic **م**, so
the isolate resolves **RTL** and the two numerals swap. The result is a temperature range that reads
**38–34** on every Arabic review page — silently, and invisibly to a non-Arabic-reading team.

**Wrapping the whole run in `<bdi>` is worse than not isolating it at all.**

### The correction

`docs/BILINGUAL_TYPE_TEST.md` §4 Rule 4 currently reads:

> *"Percent, degree and range signs sit with the numeral inside the isolate so they do not migrate."*

**Measured, that rule produces the defect.** It is superseded by:

> **Rule 4 (revised).** Isolate the **numeric run only**, with an explicit direction:
> `<bdi dir="ltr">34–38</bdi> °م`. A Latin unit (`°C`, `%`, `ml`) may sit inside the isolate,
> because it is directionally neutral-to-Latin. An **Arabic** unit (`°م`, `٪`, `ساعات`) must sit
> **outside** it, in the Arabic run, where it belongs.
>
> Never wrap a mixed numeral-plus-Arabic-unit run in a bare `<bdi>`.

**Rule 1 (Latin identifiers) is confirmed unchanged.** `<bdi lang="en">` around product names,
brand names and shade codes is correct. Note that the browser's implicit algorithm already produces
the right result for the common mid-sentence case — the isolate is a *guarantee* for the boundary
cases, not a fix for a visible bug, and it also carries the `lang` attribute a screen reader needs.

This correction is binding on Phase 4 and is recorded as **D3-1**.

---

## 6. A second defect: the conditions well at 320px

| | English | Arabic |
|---|---|---|
| Well inner width at 320px | 265px | 265px |
| Conditions table intrinsic width | **279px** | 225px |
| Result | **Overflow — horizontal scroll inside the well** | Fits |

Cause: value cells were set `white-space: nowrap` so that numeral runs would not break mid-range.
Applied to the whole cell, that also prevents *prose* values — `Mixed outdoor and air-conditioned`,
`Moderate, including 40 minutes walking outdoors` — from wrapping.

**Fix, applied and re-measured in the harness:** `white-space: normal` on the value cell,
`white-space: nowrap` on the numeric isolate only.

| | Before | After |
|---|---|---|
| English table width at 320px | 279px (overflows 265px) | **225px — fits** |
| Arabic table width at 320px | 225px | 225px |
| Numeral column alignment | aligned | **still aligned** |

The English conditions well was the single element in the system that broke at 320px, and it is the
element Phase 2 named as the highest-risk component in Arabic. It broke in **English**.

Recorded as **D3-2**, and written into `docs/RESPONSIVE_UX_SPEC.md` as a component rule.

---

## 7. Criterion 10 — UNVERIFIED, HUMAN REVIEW REQUIRED

> *"The Arabic review page does not look like a translation of the English one — it should look
> like it was set in Arabic."*

**Status: UNVERIFIED — HUMAN REVIEW REQUIRED. This is not a pass.**

No native Arabic reader has seen the specimens. The measurable half of the system is sound, but
criterion 10 is the criterion that matters and it cannot be measured. Phase 2 said so, and nothing
in this proof changes it.

Criteria 1, 2 and 3 are also marked PARTIAL for the same reason: geometry conforms to the
specification exactly, but "same optical volume" is a judgement, not a ratio.

### What a reviewer should be asked

Show `docs/proofs/type-proof.html` at 1440 and 375 and ask, in this order:

1. Does the Arabic headline feel like a headline, or like body text that was enlarged?
2. Does the Arabic paragraph feel comfortable, or cramped, or airy?
3. Do the Arabic metadata lines feel as quiet as the English ones — or louder, or weaker?
4. Does anything read as a mechanical rendering of English?
5. Is `الساعة 6` the natural way to mark a timed observation, or is there a better Arabic idiom?
6. Is Western `0–9` right for this audience, or are Arabic-Indic numerals expected? (Open item U-04)
7. Does `لوحة 03` read as a plate reference, or as something else?
8. Read the disclosure band aloud. Does it sound like a person or like a legal notice?

Questions 5–8 are **editorial**, not typographic, and are likely to produce more valuable findings
than the type questions. They should go to Zina directly.

---

## 8. What remains open

| # | Item | Status | Owner |
|---|---|---|---|
| **Q3-1** | Zarid licence | **Not obtained.** The proof ran on the fallback tier | Client — budget decision (Phase 2 Q-2) |
| **Q3-2** | Criterion 10, native reader review | **UNVERIFIED** | Client / Zina |
| **Q3-3** | Re-run §4 header measurement on Zarid | Blocked on Q3-1 | Phase 4 |
| **Q3-4** | Confirm ×1.12 / ×1.18 on Zarid's Naskh | Blocked on Q3-1 | Phase 4 |
| **Q3-5** | Western vs Arabic-Indic numerals | Unchanged from Phase 1 (U-04) | Audience data |

**R-13 status: partially discharged.** The *system* is proven on a shippable tier — the size
factors apply cleanly, tracking holds at zero, the index mirrors, numerals align, floors hold, and
the header fits at the risk breakpoint in both scripts. The *typeface recommendation* is still
unproven, and the honest score for the Arabic direction moves from Phase 2's 8/10 to **8.5/10**: the
mechanism is verified, the faces are not.

---

## 9. Reproducing this

```
node <a static server of your choice> docs/proofs/type-proof.html   # file:// is blocked in Chrome automation
open http://localhost:8787/
```

In the console:

```js
window.__proof()          // full measurement object for the current viewport
```

To measure a specific width, load the page inside an iframe of that exact width and call
`iframe.contentWindow.__proof()`. Resizing the OS window is not reliable — on a scaled display the
viewport does not match the requested size, which is how the first measurement run in this phase
produced a 1920px reading for a 1440px request.

`docs/proofs/type-proof.html` is an **evaluation artefact**. Its CSS exists to render specimens.
It is not a design system, it is not production code, and nothing in it should be copied into
Phase 4 — the tokens it hard-codes are already specified properly in `docs/DESIGN_TOKENS_SPEC.md`.
