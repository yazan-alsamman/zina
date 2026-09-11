# Phase 2 — Completion Report

**Creative direction, visual identity, typography and art direction**

| | |
|---|---|
| **Status** | Complete |
| **Phase** | 2 — Brand and visual direction |
| **Date** | 2026-09-07 |
| **Overall confidence** | **High** on direction, colour, evidence language, review-page art direction, accessibility and performance. **Medium** on Arabic typography (specified thoroughly, **unproven** — no type set). **Medium** on homepage (the weakest surface, and dependent on photography that does not exist) |
| **Anything implemented** | **No.** No Astro, no components, no production CSS, no homepage, no animations, no 3D, no frameworks, no build |
| **Next phase begun** | **No.** Stopped at the handoff gate |
| **Visual specimen** | https://claude.ai/code/artifact/56ff92a9-659a-48cf-b913-50cd4b7203be |

---

## Executive Summary

Phase 2 produced the complete visual direction for the site, across 21 specification documents and
one measured verification tool. Nothing was built.

**The selected direction is "The Testing Room"** — a dark editorial publication whose evidence layer
borrows from **archival annotation** rather than laboratory instrumentation: the contact sheet, the
plate caption, the conservator's condition report. The feeling in the first five seconds is intended
to be *someone kept records* — not "this is expensive", not "this person is famous", but the
specific respect that comes from being shown the working rather than only the conclusion.

**Four decisions define the phase.**

**The review page was designed first**, as instructed, and the direction was selected on that basis.
Territory A (Obsidian Editorial) was the more immediately impressive option and was **rejected
because it has nowhere to put four testing conditions, six timed observations and three numbered
plates**. A design that photographs beautifully and cannot carry the product is the wrong design.

**The clinical-drift risk was solved by a creative decision, not a warning.** The evidence layer's
reference is archival, never instrumental — because the content makes no clinical claim and the
Method's `doesNotProve` fields exist to hold that line. A dashboard aesthetic would imply scientific
validation the content explicitly disclaims: an editorial integrity failure wearing a visual
costume. The working test is *if it could ship in an analytics product it is wrong; if it could
appear in the back matter of a well-made art book it is right.*

**Arabic and Latin were evaluated as one system.** The recommendation is 29LT Zarid Serif/Text — a
genuinely bi-scriptual superfamily whose Arabic Naskh and Latin wedge serif were drawn to match —
paired with IBM Plex Sans / Sans Arabic / Mono, which uniquely supplies UI and record tiers across
both scripts from one open-source design system. Five structural Arabic constraints drove the whole
system, including two that eliminate standard editorial devices: **no italic** and **no case**, so
neither italic pull quotes nor tracked-uppercase metadata can be the shared mechanism.

**Contrast was measured, not assumed.** `tools/check-contrast.mjs` verifies 24 required pairs. It
**found a real failure** — `line.strong` specified at 1.92:1 against a 3:1 non-text requirement —
which was corrected before the palette was documented.

---

## Visual Territories Considered

`docs/VISUAL_TERRITORIES.md` — three genuinely different directions, each judged against the review
page first.

| | Differentiation | Review page | Homepage | Verdict |
|---|---|---|---|---|
| **A — Obsidian Editorial** | Low | **Low** | Very high | Rejected as a whole, **retained as foundation** |
| **B — The Testing Room** | **High** | **Very high** | Medium-high | **Selected** |
| **C — Contemporary Maison** | Low | Medium | High | Rejected |

**A rejected** because it has no native language for the evidence layer. It says *magazine*; it does
not say *tests products rigorously*.

**C rejected** because roughly three in four beauty websites already use a pale ground
(`docs/COMPETITIVE_RESEARCH.md` §3). Choosing it would mean spending the design budget arriving at
what the category already is.

**B selected**, with three explicit inheritances so the synthesis is a decision rather than a blend:
A's spatial and typographic confidence governs the reading surfaces; B's index, plates, mono tier
and three voices govern the evidence surfaces; C's warmth enters through the **colour temperature of
the dark ground** rather than through the layout.

---

## Selected Direction

`docs/ART_DIRECTION.md`. **Five signature devices, and no more** — a direction with five recognisable
devices is coherent; one with fifteen is decorated.

1. **The margin index** — hour markers, stage names and plate numbers in a narrow column beside the
   review body. Left in LTR, right in RTL. Marginalia, not a sidebar.
2. **The plate** — evidence photography numbered and captioned, referenced from the prose by number.
3. **The three voices** — claim, observation, verdict, distinguishable without reading.
4. **The disclosure band** — full-width above the hero, prominence scaling with commercial
   entanglement.
5. **The conditions well** — testing conditions set as a printed table, hairline rules, no borders.

Shapes are rectangular and unrounded (radius 0; 2px on controls only). Structure is carried by
hairlines and space, never by cards or shadows. Two densities run on one page — editorial for
reading, record for scanning — and the alternation between them is the page's rhythm.

---

## Typography Decision

`docs/TYPOGRAPHY_SYSTEM.md` — six pairings evaluated. This addresses R-13, the highest-risk item
carried out of Phase 1.

| Role | Latin | Arabic |
|---|---|---|
| Display | **29LT Zarid Serif** | **29LT Zarid Serif (Arabic)** |
| Body | 29LT Zarid Text | 29LT Zarid Text |
| UI | IBM Plex Sans | IBM Plex Sans Arabic |
| Record | IBM Plex Mono | *numerals and Latin identifiers only* |
| Label | IBM Plex Sans | IBM Plex Sans Arabic, never tracked |

**Zarid is the voice; Plex is the instrument.** Verified facts: Zarid's Arabic (Naskh Mastari) was
drawn by Pascal Zoghbi in 2014 with the Latin wedge serif added by Khajag Apelian in 2015, the two
co-designed to match; commercial licence via 29LT. IBM Plex is SIL OFL 1.1, with Plex Sans Arabic
drawn by Bold Monday with Wael Morcos.

**Rejected, with reasons:** TPTQ Greta (strong runner-up, but sans-led where the direction wants a
serif voice); Plex alone (Plex Serif has **no Arabic companion**, so English titles would be serif
and Arabic titles sans — the exact asymmetry the brief warns against); Amiri (scholarly and
historical register, wrong for contemporary beauty editorial); Readex Pro (functional, no display
personality); **Cairo/Tajawal** (the Arabic equivalents of Montserrat — ubiquity is the
disqualifier, and the fastest way to make a $50,000 property look like a $500 one).

Three weights only, nothing below 400. **Open-source fallback tier documented** (Plex Serif + Noto
Naskh Arabic), with the cost stated plainly: shippable and competent, not distinctive.

---

## Arabic / Latin Pairing

`docs/BILINGUAL_TYPE_TEST.md`. Five structural constraints drove the system, and three eliminate
otherwise-standard devices:

| Constraint | Consequence |
|---|---|
| **No italic in Arabic** | The emphasis system cannot use italic **in either script** — using it in Latin and substituting elsewhere is what makes Arabic feel secondary |
| **No case in Arabic** | The tracked-uppercase metadata device is Latin-only. Arabic reaches equal volume through size up, weight down |
| **Tracking breaks Arabic** | `type.tracking.arabic` is a token fixed at 0, made visible precisely so it cannot be casually overridden |
| **Optically smaller** | `sizeFactor 1.12` / `leadingFactor 1.18`, applied at the locale root |
| **No mono tradition** | Record tier carries numerals and Latin identifiers only; Arabic labels beside them use Plex Sans Arabic, bidi-isolated |

Every Latin run inside Arabic is `<bdi>`-isolated — the failure that would otherwise appear on
almost every Arabic review page. The header is laid out to **Arabic** width, since designing in
English and discovering the Arabic overflow at implementation is the predictable failure.

**This is specified, not proven.** Ten pass criteria are defined for a Phase 3 visual proof with
licensed fonts, and criterion 10 — *the Arabic page should not look like a translation* — must be
judged by a native Arabic reader, not by the design team.

---

## Colour Decision

`docs/COLOR_SYSTEM.md`. **Ink and pigment**, no metal of any kind.

| | | Measured |
|---|---|---|
| Ground | `#12100D` warm ink — **not black** | — |
| Text | `#F2EDE3` ivory — **not white** | **16.28:1** (AAA) |
| Accent, editorial | `#D9906A` clay | 7.37:1 |
| Accent, observed | `#A3BCAF` mineral | 9.38:1 |

Two decisions carry it. The ground has brown in it, which is the entire difference between
*editorial* and *app*, and it lets warm and deep skin tones render truthfully — material on a site
whose expertise is shade accuracy. The text is ivory rather than white at 16.28:1 instead of 21:1,
because maximum contrast is fatiguing over a 1,500-word review; that was rejected deliberately.

**Every text pair clears AA; nine clear AAA. Lowest text ratio 5.74:1**, on deliberately recessed
claim text. The only sub-3:1 element is `line.hairline`, which is decorative and carries no
information.

The evidence hierarchy is **inverted from convention on purpose**: marketing copy is the quietest
text on the page, the reviewer's conclusion the loudest. That inversion is the site's argument
expressed in colour, and it is the first thing to protect if anyone proposes making product claims
stand out more.

---

## Review Page Direction

`docs/REVIEW_ART_DIRECTION.md` — designed first, and the strongest artefact of the phase.

Three-zone grid: margin index (160px), text column (620px, 62–68 characters), air. Four deliberate
full-bleed breaks. All 17 sections specified for visual weight, width, alignment, typography, image
ratio, spacing, surface treatment, motion potential, mobile behaviour and Arabic behaviour.

```
hero ██ · disclosure ██ · intro ░░ · conditions ▓▓ · method ▓▓ ·
observations ░▓░▓ · plate ██ · strengths ░░ ░░ · suitability ▒▒ ·
verdict ██ · details ▓░ · related ▒▒
```

**Non-negotiables:** disclosure above the hero; limitations at identical weight to strengths (the
moment they are quieter, the page becomes marketing); no text over the hero; the margin index
collapses inline on mobile rather than hiding, because hour markers are part of the record; no
score, badge or star anywhere.

Ten specific failure conditions are enumerated so the page can be checked against them.

---

## Homepage Direction

`docs/HOMEPAGE_ART_DIRECTION.md` — written after the review page. Seven sections.

**The decision that matters: proof arrives on screen two.** Most creator homepages spend three
screens on the person and reach the work near the footer. Here the featured review — with its
disclosure label, three testing conditions in mono and one observation — is the second thing seen,
because the site's argument is *look at the work, not the follower count*. The claim is the
headline; the name is small.

**Cut from the master spec's nine-section narrative:** the brand strip (two of five brands fail
their index gate, and a logo wall is the most template-like device in creator design), the social
ecosystem (statistics are mock and undated), and a separate about block (duplicates `/about/` and
delays the proof).

**Scored 7/10 — the weakest surface in the direction**, and the honest assessment. The evidence
language is rationed to one block here, so what remains is a well-executed dark editorial homepage
in a category with a lot of good work in it. It also depends almost entirely on a portrait that does
not exist.

---

## Photography Direction

`docs/PHOTOGRAPHY_ART_DIRECTION.md` — also the **production brief**, since no photography exists.

**Two languages, never blended.** *Editorial* persuades: 85mm portraits, one soft key at 45°, warm
filmic grade, and **skin texture retained** — a site about honest product testing cannot show a
retouched face. *Evidence* testifies: one named repeatable lighting setup, fixed camera position,
manual white balance, a grey card in the first frame, and **exposure and white balance only, never a
grade**. Swatches are never colour-corrected toward the palette, because a swatch is the thing being
reviewed.

Seven evidence series types are defined, each mapping to a `stageKey` in the content model. Full
technical delivery spec included, with the explicit rule that **social exports are not masters** —
R-04, still the largest threat to the visual direction.

**Interim policy:** no stock imagery of a person. Placeholder blocks are neutral tone fields at the
correct ratio with plate and caption treatment intact — an honest gap rather than a borrowed face.

---

## Material Language

`docs/MATERIAL_LANGUAGE.md` — **texture appears in three places on the entire site.**

Paper grain at 3% on the disclosure band and the method well (one asset, ≤4KB); film grain baked
into editorial photography at grading time, never as a CSS overlay. Everywhere else is flat.

The material world is ink, paper and pigment — a printed document that has been handled. Cosmetic
textures are the *subject* of the photography and never an interface treatment; reproducing them in
the UI would be the site imitating its own subject matter.

Total texture cost: **≤4KB**, and it is the first thing to cut if the budget is exceeded.

---

## Evidence Language

`docs/EVIDENCE_LANGUAGE.md` — the mandatory requirement, and the heart of the direction.

| | CLAIM | OBSERVATION | VERDICT |
|---|---|---|---|
| Typeface | Zarid Text 400 | Zarid Text + Plex Mono | Zarid **Serif** |
| Colour | muted `#9A9184` | ivory + mineral | ivory |
| Rule | **dotted** hairline | **solid** mineral | **solid 2px clay** |
| Volume | quietest | primary | loudest |

**Three axes vary together** — typeface, rule style, volume — so the distinction survives greyscale,
colour-vision deficiency and forced-colors mode. Colour is the fastest cue and never the only one.

The dotted rule is the signature: it reads as provisional, as *someone else said this*. The 2px clay
rule appears once per page, on the verdict, and nowhere else.

**Forbidden in the evidence layer:** charts, gauges, meters, progress rings, sparklines, percentage
bars, score badges, green-to-red scales, and all medical or scientific iconography. There are no
scores to plot, and a beaker icon beside the conditions table would make a claim the content
refuses.

The evidence language is **rationed** — full on reviews, partial on method and work, one moment on
the homepage, absent elsewhere. A site where every page carries mineral rules has turned a signature
into wallpaper.

---

## Motion Direction

`docs/MOTION_ART_DIRECTION.md` — **five patterns for the entire site**: settle, sequence, decode,
attend, reveal.

Slow, decelerating, once. No spring, no bounce, no overshoot, nothing above 600ms. **No parallax, no
scroll hijacking, no page transitions in v1, no animation library** — three patterns of CSS plus an
`IntersectionObserver`, budgeted at 3KB.

Nothing above the fold animates; the first paint is the finished page. **Evidence images never
move** — a record that animates is a record you cannot trust. Nothing counts up.

Reduced motion is a **token-level** override, and nothing is lost under it: no information,
affordance or wayfinding depends on movement.

---

## 3D Decision

`docs/3D_ART_DIRECTION.md` — **none, and not "later" or "lite".**

All five plausible placements evaluated and rejected: homepage hero, cosmetic material
visualisation, product environment, method visualisation, transitions.

The reasoning: it communicates nothing the argument needs; it contradicts the paper-and-ink material
language; it costs 100–500KB against a 1MB budget on the weakest devices in the audience; every
placement is above the fold and endangers the LCP; and it requires maintaining two implementations
so the better-resourced half of the audience sees a rotating object.

The rendered-cosmetic-texture proposal is the worst of them — a *simulation* of product texture on a
site whose premise is photographed reality is close to fabricating evidence.

**The honest test:** if the static fallback is good enough for mobile, it is good enough for desktop
— and the 3D is then decoration by the site's own definition. Revisit conditions are specified; the
budget goes to photography instead.

---

## Responsive Direction

`docs/RESPONSIVE_ART_DIRECTION.md` — designed at **375px first**, expanded to 1440, capped at 1180.

Two thresholds carry real compositional change: **768px** (two-column blocks) and **1024px** (margin
index and full header appear). Nine widths specified from 320 to 1920+.

The margin index **collapses inline on mobile, never hides**. Crops are art-directed via `<picture>`
except evidence plates, which never re-crop because comparability is their function. 320px is
treated as a real device class, not a courtesy.

**Highest-risk breakpoint: 1024px in Arabic**, where the longest labels and the margin index arrive
together. It should be checked first.

---

## Accessibility

`docs/ACCESSIBILITY_ART_DIRECTION.md` — WCAG 2.2 AA, specified in the visual system because almost
every accessibility failure on a premium site originates in an art-direction decision.

24 pairs measured. Focus is 2px clay at 7.37:1, instant, never removed — `outline: none` without a
replacement is forbidden project-wide. No weight below 400. Colour is never the only signal.
`prefers-reduced-motion` and `forced-colors` both lose nothing, because no information lives in
motion, surface value or texture.

**Ten art-direction decisions were taken *for* accessibility** and are listed so they are not later
"improved" away — including ivory rather than white text, muted grey at 6.11:1 rather than the
"elegant" ~3.5:1 most premium sites use, no text over the hero, and side-by-side plates rather than
a before/after slider.

**Nothing is tested**, because no code exists. The verification plan includes an **Arabic
screen-reader pass**, which is the check most likely to be skipped and most likely to find real
defects.

---

## Performance Considerations

`docs/PERFORMANCE_ART_DIRECTION.md` — the direction is **cheap by construction, not by compromise**.

| Premium signal | Conventional cost | This design |
|---|---|---|
| Depth | Shadows, blur | Hairlines and space — **0 bytes** |
| Atmosphere | Video or WebGL | One still photograph |
| Sophistication | Animation library | Five CSS patterns — **3KB** |
| Distinctiveness | 3D, parallax | The evidence language — **0 bytes, 0 JS** |

Refusing 3D, video, glass, parallax, animation and icon libraries, carousels and charts avoids
roughly **200KB–5MB** in exchange for nothing the design needed.

**The one genuinely expensive decision is typography** — four families across two scripts, held to
180KB per locale by subsetting, locale splitting and three files per page. The review page, the most
complex and most-visited, has the **second-lowest JS budget on the site**, because its complexity is
typographic rather than interactive.

Per-page budgets, LCP strategy per template, and the seven places the design would first go wrong
are all specified.

---

## Design Tokens

`docs/DESIGN_TOKENS_SPEC.md` — conceptual only, no CSS. Semantic names throughout
(`color.ground.base`, never `black-900`), ready for direct conversion in Phase 4.

Twelve groups: colour, typography, spacing, layout, radius, borders, shadows, motion, z-index,
breakpoints, media, script adaptation.

**Three tokens encode a refusal so it cannot be quietly reversed:** `shadow.none` (the only shadow
token in the system), `radius.none` (with no third radius value), and `type.tracking.arabic` (fixed
at 0).

---

## Anti-Patterns

`docs/DESIGN_ANTI_PATTERNS.md` — 31 entries, binding on Phases 3–14, each with what is forbidden,
why, and what to do instead.

**The five most likely to actually happen:**

1. **Rounded cards** — the default failure mode. Radius 0; use the index treatment.
2. **Dashboard drift** — the evidence layer is one step from becoming one.
3. **Arabic treated as secondary** — invisible to a non-Arabic-reading team.
4. **Follower counts as decoration** — mock, undated, and not a design element.
5. **Hero animation** — nothing above the fold animates.

The document specifies how to overturn an entry: a written decision in a phase report, with the
entry marked superseded rather than deleted.

---

## Empty States

`docs/EMPTY_STATES.md` — **the partial state is the normal state for the first year.**

Governing principles: absence is silent (a section with nothing to show is removed, not rendered
empty); never an illustration; never apologise; never fabricate to fill; the layout is chosen by
item count rather than scaled.

Twelve states specified, including the brand with one review (given *more* space, not less, and
laid out single-column rather than as a three-up grid missing two cells), the work project with no
results figures, the gated brand, the missing translation, and the current no-photography state.

**A one-item grid is the most common way a young site looks unfinished**, and the count-based layout
rule removes it.

---

## Risks

| # | Risk | Impact | Likelihood | Change |
|---|---|---|---|---|
| **R-04** | Client supplies compressed social exports, not photography masters | **Severe** — the direction is image-led | **Medium-high** | **Raised.** Now the single largest threat to the visual direction |
| **R-13** | Arabic/Latin pairing fails at display size | High | Medium | **Partly mitigated** by choosing a bi-scriptual superfamily. **Still unproven** |
| **R-17** | **Clinical drift** — evidence layer becomes a dashboard | High — editorial integrity, not only aesthetics | Medium | **New.** Mitigated by the archival device, 31 anti-patterns, and the *analytics-product test* |
| **R-18** | **Type licensing unbudgeted**, forcing the fallback tier | Medium — loses distinctiveness | Medium | **New.** Fallback fully documented so the outcome is graceful |
| **R-19** | **Rounded-card drift** in Phases 3–5 | Medium | **High** | **New.** The most likely single degradation. Detectable in a diff |
| **R-20** | Font payload exceeds budget | Medium | Medium | **New.** Mitigated by locale splitting and subsetting |
| **R-21** | Homepage under-delivers against the $50k expectation | Medium | Medium | **New.** Scored 7/10 honestly. Fix is more evidence, not more decoration |
| R-02, R-03, R-06, R-08 | Content supply, bilingual cost, SEO timeline, publishing cadence | — | — | Unchanged |
| **R-07** | Git boundary — project still has no repository of its own | High | Medium | **Still open.** `git rev-parse --show-toplevel` returns `C:/Users/Lenovo`; no commits. Not actioned — yours to decide |

---

## Open Questions

| # | Question | Why it matters | Recommendation |
|---|---|---|---|
| **Q-1** | Can the type be licensed and a visual proof produced? | The Arabic recommendation is unproven until real type is set and read by a native speaker | **Blocking for Phase 3 sign-off**, not for starting it |
| **Q-2** | Is there a typography budget? | Zarid is commercial. The open-source fallback is shippable but not distinctive | Client decision. Both paths fully specified |
| **Q-3** | Does Zina already have a testing method? | Carried from Phase 1, still unanswered. The Method is now the visual spine as well as the IA spine | Ask before Phase 3 |
| **Q-4** | Light theme? | Dark is the brand; some readers need light for long reading | Deferred to Phase 4. Semantic tokens make it a value swap |
| **Q-5** | When does photography production start? | R-04. The direction is image-led and nothing exists | **Start commissioning now.** The brief is written |
| **Q-6** | Homepage mono loading | Needed in sections 2–3, not above the fold | Numerals-only mono subset, ~8KB. Resolve in Phase 5 |

---

## Decisions Requiring Approval

| # | Decision | Rationale | Reversal cost |
|---|---|---|---|
| **D-1** | **Dark warm-ink ground as the brand** | Documented editorial signal in a category that is three-quarters pale | High once built |
| **D-2** | **Zarid + Plex** over the free-only stack | Bi-scriptual co-design is the answer to the brief's hardest requirement | Medium — fallback documented |
| **D-3** | **No 3D, no WebGL, no video** | Communicates nothing the argument needs; costs the entire mobile budget | Low |
| **D-4** | **No light theme in v1** | Dark is a committed direction, not a toggle | Low — semantic tokens |
| **D-5** | **Clay accent, no metallics** | Refuses the black-and-gold cliché at the root | Low |
| **D-6** | **Radius 0 everywhere; no cards** | Editorial layouts are type, rules and space | Medium |
| **D-7** | **Five motion patterns, no library** | Motion serves comprehension or is cut | Low |
| **D-8** | **Brands absent from the homepage** | Two of five fail their gate; logo walls are template signals | Low |
| **D-9** | **Skin texture retained in portraits** | A site about honest testing cannot show a retouched face | Low, but it is a conversation to have with the client |

**D-1 and D-9 are the two most worth confirming with Zina directly** — the first because it commits
the brand, the second because it is a personal decision about how she is photographed.

---

## Files Created

**Documentation (21)**

| File | Lines |
|---|---|
| `docs/VISUAL_TERRITORIES.md` | 174 |
| `docs/ART_DIRECTION.md` | 214 |
| `docs/TYPOGRAPHY_SYSTEM.md` | 236 |
| `docs/BILINGUAL_TYPE_TEST.md` | 196 |
| `docs/COLOR_SYSTEM.md` | 196 |
| `docs/EVIDENCE_LANGUAGE.md` | 213 |
| `docs/REVIEW_ART_DIRECTION.md` | 233 |
| `docs/HOMEPAGE_ART_DIRECTION.md` | 187 |
| `docs/PHOTOGRAPHY_ART_DIRECTION.md` | 178 |
| `docs/MATERIAL_LANGUAGE.md` | 118 |
| `docs/MOTION_ART_DIRECTION.md` | 213 |
| `docs/3D_ART_DIRECTION.md` | 118 |
| `docs/ICONOGRAPHY.md` | 133 |
| `docs/UI_SHAPE_LANGUAGE.md` | 175 |
| `docs/RESPONSIVE_ART_DIRECTION.md` | 178 |
| `docs/ACCESSIBILITY_ART_DIRECTION.md` | 195 |
| `docs/PERFORMANCE_ART_DIRECTION.md` | 168 |
| `docs/DESIGN_TOKENS_SPEC.md` | 268 |
| `docs/ART_DIRECTION_DECISION_MATRIX.md` | 158 |
| `docs/DESIGN_ANTI_PATTERNS.md` | 253 |
| `docs/EMPTY_STATES.md` | 175 |
| `docs/PHASE_2_CREATIVE_DIRECTION.md` | 218 |
| `docs/reports/PHASE_2_REPORT.md` | this file |

**Tools (1)** — `tools/check-contrast.mjs`, 168 lines, zero dependencies

**Visual specimen (1)** — published artifact, palette with measured ratios, bilingual type scale,
the three voices rendered, conditions well, disclosure bands, page rhythm

## Files Modified

**None.** No Phase 0 or Phase 1 file was edited or deleted. `docs/DESIGN_DIRECTION_PROPOSAL.md`
(Phase 0) is superseded by `docs/ART_DIRECTION.md`, which says so; the original is retained as the
record of what was proposed.

The content layer, the validator and the mock guard are untouched and still passing.

---

## Validation / Checks

| Check | Result | Notes |
|---|---|---|
| **Contrast verification** | **PASS**, exit 0 | 24 required pairs. One failure found and fixed |
| **Contrast — failure detection** | **Verified** | `line.strong` at `#4A4238` measured 1.92:1 against a 3:1 requirement; corrected to `#75695C` (3.56:1) |
| Content validation | **PASS**, exit 0 | 42 records, 11 collections. Unchanged from Phase 1 |
| Mock guard vs mock content | **BLOCKED**, exit 1 | Unchanged |
| Mock guard vs clean output | **CLEAN**, exit 0 | Unchanged |
| Font facts | **Verified via research** | Zarid authorship, styles and licensing; IBM Plex OFL 1.1 and Plex Sans Arabic authorship |
| Typecheck / lint / build | **N/A** | No application exists |
| Accessibility testing | **Not run** | No code. Contrast is the only testable surface, and it was tested |
| Performance measurement | **Not run** | No application. Budgets specified, nothing claimed as measured |

**Deliberately not claimed:** no Lighthouse score, no rendering test, no screen-reader result, and
no visual proof of the Arabic typography. Those require code and licensed fonts.

---

## What Is NOT Yet Implemented

Per the brief's stop conditions:

- No Astro application, no pages, no routes, no components, no layouts.
- **No production CSS.** Tokens are conceptual specifications only.
- No homepage, no review page, no template of any kind.
- No animations, no 3D, no WebGL.
- No UI framework, animation library, component library or icon library.
- No frontend build, no production assets.
- No fonts licensed, installed or loaded into the project.
- No images, no photography, no icon SVGs drawn.
- No design system as code.

Also not done, and worth stating:

- **No visual proof of the bilingual typography** — the single most important outstanding item
  (Q-1). The published specimen uses the documented open-source fallback tier and says so.
- **No native Arabic reader review.** A Phase 3 gate.
- **No client review of the direction.** D-1 and D-9 in particular need Zina's own view.

---

## Recommendation for Phase 3

**Proceed to Phase 3 — UX architecture**, per `docs/PHASE_PLAN.md`: desktop and mobile flows,
wireframes, component inventory, responsive behaviour and accessibility considerations.

**Four things Phase 3 must do first, in order:**

1. **Produce the bilingual type proof.** License Zarid, or commit to the fallback tier, and set the
   ten specimens from `docs/BILINGUAL_TYPE_TEST.md` at 1440, 768 and 375 in both directions. Have a
   **native Arabic reader** judge criterion 10. This is the gate on R-13 and it should happen before
   any wireframing.
2. **Wireframe the review page first**, again. Every subsequent template inherits from it.
3. **Build the component inventory from the five signature devices**, not from a generic UI kit:
   margin index, plate, three voices, disclosure band, conditions well.
4. **Design the empty and partial states alongside the full ones**, not afterwards — they are the
   normal state for the first year.

**Start photography commissioning now, in parallel.** The brief is written
(`docs/PHOTOGRAPHY_ART_DIRECTION.md` §7), the direction is image-led, and R-04 is the largest threat
to it. Every week of overlap with Phase 3 is a week saved.

### Suggested handoff context for Phase 3

> Phase 2 is complete. Read `docs/reports/PHASE_2_REPORT.md`, then
> `docs/PHASE_2_CREATIVE_DIRECTION.md` (single source of truth),
> `docs/REVIEW_ART_DIRECTION.md`, `docs/EVIDENCE_LANGUAGE.md`, `docs/BILINGUAL_TYPE_TEST.md` and
> `docs/DESIGN_ANTI_PATTERNS.md`.
>
> The direction is **The Testing Room**: dark warm-ink editorial, with an evidence layer borrowing
> from archival annotation rather than laboratory instrumentation. Five signature devices carry it.
> Colour is verified — run `node tools/check-contrast.mjs` before and after any palette change.
>
> Execute **Phase 3 only**: desktop and mobile flows, wireframes, component inventory, responsive
> behaviour, accessibility considerations. Produce the bilingual type proof first. Wireframe the
> review page before the homepage. Do not write production CSS, do not build components, do not
> create the Astro application.
>
> Report to `docs/reports/PHASE_3_REPORT.md`.

**Phase 3 has not been started.**
