# Phase 3 Creative Compliance

**Status:** Phase 3 verification. Checks the Phase 3 UX architecture against the Phase 2 creative
direction, item by item.

**How to read a result:**

| Mark | Meaning |
|---|---|
| **PASS** | Verified — either mechanically, or by a specific documented rule that can be checked in a diff |
| **PASS (specified)** | The rule is written and binding, but nothing is built, so it cannot be observed |
| **UNVERIFIED** | Cannot be judged without a human or without code. **Not claimed as a pass** |

---

## 1. The brief's checklist

| # | Requirement | Result | Where it is enforced |
|---|---|---|---|
| 1 | **The Testing Room remains recognisable** | **PASS (specified)** | All five devices survive into the UX with their behaviour specified: `COMPONENT_INVENTORY.md` CMP-01…05. The review page was designed first, again |
| 2 | **Dark warm-ink direction preserved** | **PASS** | No Phase 3 document proposes a palette change. The type proof renders on `#12100D` / `#F2EDE3`, the measured values |
| 3 | **No generic influencer UX** | **PASS** | No follower counts, no logo wall, no testimonials, no "as seen in", no awards — confirmed excluded in `HOMEPAGE_WIREFRAMES.md` §9 and enforced by render gates (`sameAsEligible`, `approvalOnFile`) |
| 4 | **No ecommerce drift** | **PASS** | No product route, no `offers`, no price with purchase intent, no buy button, no affiliate widget, no cart, no "Shop" nav item. `COMPONENT_INVENTORY.md` CMP-19 forbidden variants |
| 5 | **No dashboard drift** | **PASS** | No chart, gauge, meter, sparkline, progress ring, KPI tile or stat grid in any component. A homepage "corpus stat line" was proposed in Phase 3 and **rejected** for this reason (`PHASE_3_DECISION_LOG.md` §4) |
| 6 | **No laboratory instrumentation** | **PASS** | No flask, beaker, microscope, molecule, test tube or clipboard iconography. No percentage or confidence indicator. The words *clinical / validated / certified / proven / scientific* are refused in copy and in visual metaphor — `METHOD_UX.md` §2 |
| 7 | **No generic card system** | **PASS** | Three contained surfaces on the entire site, each recorded with WHY / WHERE / WHY NOT editorial structure (`PHASE_3_DECISION_LOG.md` §3). Everything else uses the index treatment. There is no `Card` component in the inventory |
| 8 | **Radius 0 preserved** | **PASS (specified)** | Two values only: `radius.none` 0 and `radius.control` 2px. The coverage checker flags `border-radius:` values other than 0 or 2px in any Phase 3 document — **0 hits** |
| 9 | **No shadows** | **PASS (specified)** | `shadow.none` is the only shadow token. No component specifies elevation, hover lift or shadow bloom. Checker scans for `box-shadow` — **0 hits outside refusals** |
| 10 | **Five signature devices preserved** | **PASS** | Margin index, plate, three voices, disclosure band, conditions well — all five carried into components with states, responsive behaviour, RTL rules and accessibility. **No sixth device proposed**; three candidates were considered and each was solved with the existing system |
| 11 | **Evidence language remains rationed** | **PASS (specified)** | Full on reviews · stage markers and boundary on Method · deliverables and terms on work · one moment on the homepage (sections 2 and 3) · one plate or quote where a journal article cites a review · **absent** on about, brands, contact, legal. `UX_ARCHITECTURE.md` §2.3 |
| 12 | **Claim / Observation / Verdict remain distinguishable** | **PASS** | **Six signals, of which colour is the sixth**: text label, semantics, typeface, rule style, size, colour. Survives greyscale (5 of 6), forced-colors (5 of 6) and a screen reader (2 of 6, and sufficient alone). `ACCESSIBILITY_UX_SPEC.md` §10 |
| 13 | **No numeric rating** | **PASS** | No rating field exists in the model; the validator fails the build on `rating`, `score` or `stars`. No component renders one; CMP-03 lists it as a forbidden variant |
| 14 | **No star rating** | **PASS** | As above. The star is on the forbidden-icon list |
| 15 | **No follower-count decoration** | **PASS** | `sameAsEligible` is `false` on all five profiles, so the footer social row **does not exist**. No component accepts a follower count. `COMPONENT_INVENTORY.md` CMP-11, CMP-24 forbidden variants |
| 16 | **No hero animation** | **PASS (specified)** | Hero: *"Motion — None. This is the LCP element."* Disclosure band: *"None. Must be present at first paint."* `INTERACTION_UX.md` §2 |
| 17 | **No 3D** | **PASS** | Not proposed anywhere in Phase 3 |
| 18 | **No WebGL** | **PASS** | Not proposed anywhere in Phase 3 |
| 19 | **No video** | **PASS** | `media.video` exists in the model and is `null` in every mock record. No component renders it; the play icon is listed as conditional and does not ship |
| 20 | **Arabic is first-class** | **PASS, with one measured correction** | Every component carries an RTL rule; every Phase 3 document addresses Arabic (checker-verified). The type proof set **real Arabic type** at five widths. Two Arabic-affecting defects were found and fixed, and one Phase 2 assumption about Arabic was corrected by measurement |
| 21 | **RTL is designed, not mirrored** | **PASS (specified)** | Logical properties only; margin index moves right; Arabic-original journal content with no English sibling; header laid out to the wider measured set; Arabic labels reach volume by weight and size rather than case or tracking; **tracking fixed at 0 — measured, 0 violations at five widths** |
| 22 | **Missing translations create no stub routes** | **PASS** | Flow H specifies all five sub-cases. No route, no hreflang, no stub, no machine translation, no cross-locale offer on the 404 (D3-7). The switcher falls back to the section index with a real localised sentence |
| 23 | **Empty states are designed** | **PASS** | Five state types × fifteen templates in `EMPTY_PARTIAL_UX.md` §4, plus a launch-state audit naming eleven of twelve surfaces as partial, gated or absent |
| 24 | **Partial states are designed** | **PASS** | Layout by count (0/1/2/3/4–6/7+), locale filtering **before** the count is taken, and homepage State B as a full alternative composition rather than State A with holes |
| 25 | **Accessibility is structural** | **PASS (specified)**, one part **UNVERIFIED** | Landmarks, heading hierarchy per template, reading order, tab paths, semantics per component, six-signal colour independence, reduced motion at token level, forced-colors. **Contrast, tracking, size floors and disclosure clipping are measured.** The **Arabic screen-reader pass is not done** |
| 26 | **Performance budgets are respected** | **PASS (specified)** | No component introduces a library. Sixteen of nineteen components are non-interactive. The evidence layer remains zero-JS. Motion stays within 3KB. Every interaction with a CWV implication is listed with its mitigation in `INTERACTION_UX.md` §6 |

**26 of 26 items pass or pass-as-specified. One item (25) carries a named unverified component.**

---

## 2. The register test

Phase 2's governing test: *"If a component could ship in an analytics product, it is wrong. If it
could appear in the back matter of a well-made art book, it is right."*

Applied to all 31 components:

| Component | Analytics product? | Art-book back matter? |
|---|---|---|
| Margin index | No | **Yes** — marginalia |
| Plate | No | **Yes** — numbered plate with caption |
| Claim / Observation / Verdict | No | **Yes** — quoted source, dated note, editorial conclusion |
| Disclosure band | No | **Yes** — a stamp on a document |
| Conditions well | *Closest call in the system* | **Yes**, because it is a printed table with hairline rules and no borders, zebra, sorting or icons |
| Testing summary strip | *Second-closest call* | **Yes** — a `<dl>` of four labelled values, not a KPI row. It has no tiles, no borders, no icons and no colour coding |
| Method stage markers | No | **Yes** — filled and hollow marks in an index |
| Index entry | No | **Yes** — a catalogue entry |
| Facet group | *Third call* | Acceptable — it is a row of links, and it is the only genuinely software-shaped element on the site |
| Everything else | No | Yes |

**Three components sit near the line and each is held on the right side of it by a specific
prohibition** — no borders or zebra on the well, no tiles or icons on the strip, no count badges or
dropdowns on the facets. Those prohibitions are the compliance mechanism and should be checked in
every design review.

---

## 3. The five things that must survive into implementation

Phase 2 §20 named five. Status after Phase 3:

| # | Must survive | Status |
|---|---|---|
| 1 | **The three voices** — claim recessed, observation primary, verdict loudest | **Strengthened.** Now six independent signals, with the colour-independence path documented for greyscale, forced-colors and screen readers |
| 2 | **The margin index**, including its inline collapse on mobile | **Strengthened.** Collapse verified in both scripts at 768/375/320; the `<aside>` role is retained inline (D3-10) |
| 3 | **Disclosure above the hero**, never truncated, prominence scaling with money | **Verified unclipped at 320px in both scripts.** Present at first paint; no interaction of any kind |
| 4 | **Limitations at identical weight to strengths** | **Preserved**, and made checkable: same family, size, colour and column width; a diff introducing a smaller size token or a muted colour should be rejected |
| 5 | **Arabic as an authoring language**, not a translation layer | **Preserved and tested.** Two defects found and fixed; one Phase 2 assumption corrected. Criterion 10 remains **UNVERIFIED** |

---

## 4. Anti-pattern scan

`docs/DESIGN_ANTI_PATTERNS.md` holds 31 entries binding on Phases 3–14.
`tools/check-ux-coverage.mjs` scans every Phase 3 document for thirteen of them appearing as
recommendations rather than refusals.

```
anti-pattern scan   0 line(s) flagged for review
```

The five Phase 2 named as most likely to actually happen:

| # | Anti-pattern | Phase 3 status |
|---|---|---|
| 1 | **Rounded cards** | **Not present.** No `Card` component; three documented contained surfaces; radius 0 |
| 2 | **Dashboard drift** | **Not present**, and actively defended: a stat line was proposed and rejected |
| 3 | **Arabic treated as secondary** | **Not present.** Arabic was measured before any wireframe was drawn, and it corrected the English-derived assumptions rather than the reverse |
| 4 | **Follower counts as decoration** | **Not present.** The render gate makes it impossible today |
| 5 | **Hero animation** | **Not present.** Explicitly "None" on hero and disclosure |

**No anti-pattern entry was overturned in Phase 3.** None is marked superseded.

---

## 5. Where Phase 3 changed a Phase 2 decision

Five conflicts, all documented in `docs/PHASE_3_DECISION_LOG.md` §1. None is a silent overwrite; all
five are recorded with evidence, and three were found by measurement.

| # | What changed | Direction of travel |
|---|---|---|
| C3-1 | The `<bdi>` rule for numeral-plus-Arabic-unit runs | **Corrected a defect** Phase 2's rule would have produced |
| C3-2 | Conditions well `nowrap` behaviour | **Corrected an overflow** at 320px |
| C3-3 | "Lay the header out to the Arabic width" | **Corrected an assumption**; the rule is now measured rather than assumed |
| C3-4 | Homepage opening 88vh → 72vh | **Resolved an internal contradiction** in the Phase 2 homepage document |
| C3-5 | Placeholder tone fields narrowed to where a caption carries information | **Narrowed a rule** that was written for plates and stated generally |

**Every change makes the earlier decision more correct rather than more convenient.** That is the
test worth applying to any future amendment.

---

## 6. What compliance cannot tell you

Stated plainly, because a checklist that reads 26/26 invites over-confidence:

- **Nothing is built.** Every "PASS (specified)" is a rule on paper.
- **Criterion 10 is unverified.** The most important question about the Arabic experience — does it
  read as Arabic — has not been answered by anyone qualified to answer it.
- **No screen reader has run over any of this**, in either language.
- **No performance measurement exists**, because there is nothing to measure.
- **The Method is still a PROJECT MOCK METHOD.** Compliance with the visual direction does not make
  the content true, and the single most consequential open question in the project — does Zina
  actually test this way — is unanswered since Phase 0.
- **The homepage is better than it was and is still the weakest surface.** Moving the proof up and
  severing the photography dependency addresses the diagnosis; it does not make the page
  extraordinary. It will be judged on photography that does not yet exist.
