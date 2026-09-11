# Phase 2 Creative Direction — Single Source of Truth

**Status:** Phase 2 decision. The document Phases 3–14 build from.
Where a detail document and this one disagree, the detail document is authoritative for detail; this
one is authoritative for intent.

---

## 1. Creative North Star

**Luxury Editorial × Beauty Laboratory — resolved as *The Testing Room*.**

A dark editorial publication whose evidence layer borrows from **archival annotation** — the contact
sheet, the plate caption, the conservator's condition report — and never from laboratory
instrumentation.

**The feeling in the first five seconds: *someone kept records.***

Not "this is expensive", not "this person is famous". The specific respect that comes from being
shown the working rather than only the conclusion.

**The test that governs every decision:** if a component could ship in an analytics product, it is
wrong. If it could appear in the back matter of a well-made art book, it is right.

## 2. Selected visual territory

Three territories explored (`docs/VISUAL_TERRITORIES.md`): **Obsidian Editorial**, **The Testing
Room**, **Contemporary Maison**.

**Selected: The Testing Room**, on Obsidian's spatial foundation, with Maison's warmth placed in the
colour temperature of the ground rather than in the layout.

- **Obsidian rejected alone** — beautiful, but it has no home for four testing conditions, six
  timed observations and three numbered plates. It fails on the page that matters most.
- **Maison rejected** — warmer and safer, but roughly three in four beauty sites already use a pale
  ground. It looks like the category.

**The risk accepted:** clinical drift. Mitigated by the archival device above, not by a warning.

## 3. Typography

`docs/TYPOGRAPHY_SYSTEM.md` — five pairings evaluated, both scripts as one system.

| Role | Latin | Arabic |
|---|---|---|
| Display | **29LT Zarid Serif** | **29LT Zarid Serif (Arabic)** |
| Body | 29LT Zarid Text | 29LT Zarid Text |
| UI | IBM Plex Sans | IBM Plex Sans Arabic |
| Record | IBM Plex Mono | *numerals and Latin identifiers only* |
| Label | IBM Plex Sans | IBM Plex Sans Arabic, never tracked |

**Two families, two jobs: Zarid is the voice, Plex is the instrument.** That maps exactly onto the
editorial-density / record-density split.

Zarid is a genuinely bi-scriptual superfamily — Arabic Naskh Mastari by Pascal Zoghbi, Latin wedge
serif by Khajag Apelian, drawn to match. Plex uniquely supplies Sans, Sans Arabic **and** Mono from
one open-source design system, which is what the evidence layer needs.

Three weights only (400/500/600). Nothing below 400.

**Open-source fallback if the type budget is zero:** Plex Serif + Noto Naskh Arabic for display,
Plex Sans/Sans Arabic for UI, Plex Mono for record. Shippable; not distinctive. This is a client
decision (Q-2).

## 4. Arabic typography

Arabic is co-equal by construction, not accommodated. Five structural constraints drive the system
(`docs/BILINGUAL_TYPE_TEST.md`):

| Constraint | Consequence |
|---|---|
| **No italic** | Emphasis via weight, size, colour, position — in both scripts. No italic pull quotes anywhere |
| **No case** | The tracked-uppercase metadata device is Latin-only. Arabic labels achieve equal volume through size and weight |
| **Tracking breaks Arabic** | `type.tracking.arabic` is a token fixed at 0 and not overridable |
| **Runs optically smaller** | `sizeFactor 1.12`, `leadingFactor 1.18`, applied at the locale root |
| **No mono tradition** | The record tier carries numerals and Latin identifiers only; Arabic labels beside them use Plex Sans Arabic, bidi-isolated |

Every Latin run inside Arabic is `<bdi>`-isolated. The margin index moves to the right. The header
is laid out to **Arabic** width. Numerals are Western and tabular.

**Unproven.** No Arabic type has been set. A visual proof with licensed fonts, judged by a native
reader, is the Phase 3 gate (Q-1).

## 5. Colour

`docs/COLOR_SYSTEM.md` — **ink and pigment.** Verified by `tools/check-contrast.mjs`.

| | |
|---|---|
| Ground | `#12100D` warm ink — **not black.** The brown in it is what separates *editorial* from *app* |
| Text | `#F2EDE3` ivory — **not white.** 16.28:1, above AAA, deliberately below 21:1 |
| Accent — editorial | `#D9906A` clay. Links, focus, verdict rule, CTA |
| Accent — observed | `#A3BCAF` mineral. Timestamps, evidence rules, method markers |

Two accents, two jobs, no third. **No gold, no metal, no pink, no saturated interface colour.**
Saturation belongs to photography.

**24 contrast pairs measured, all passing.** Lowest text pair 5.74:1; nine pairs clear AAA. One
failure was found during specification — `line.strong` at 1.92:1 — and corrected to 3.56:1.

## 6. Composition

- **12 columns, 1180px cap.** Three zones on a review page: **margin index** (160px), **text
  column** (620px, 62–68 characters), **air**.
- **Two densities on one page.** Editorial for reading, record for scanning. The alternation is the
  rhythm.
- **Hairlines, not cards.** Structure is 1px rules and space.
- **Four full-bleed breaks** per review page: hero, disclosure, plates, verdict.
- **8px baseline**, 96px desktop section rhythm.
- Radius 0 everywhere; 2px on controls only.

## 7. Photography

`docs/PHOTOGRAPHY_ART_DIRECTION.md` — **two languages, never blended.**

**Editorial** persuades: 85mm portraits, one soft key at 45°, deep shadow, warm filmic grade, skin
texture **retained**.

**Evidence** testifies: one named repeatable lighting setup, fixed camera position, manual white
balance, grey card in the first frame, **exposure and white balance only — no grade**. Swatches are
never colour-corrected toward the palette.

**No photography exists.** This document doubles as the shoot brief. R-04 — the client supplying
compressed social exports instead of masters — remains the largest threat to the direction.

## 8. Material language

**Texture appears in three places on the entire site**: the disclosure band, the method well (paper
grain at 3%, one asset ≤4KB), and inside editorial photography (film grade, baked in).

Everywhere else is flat. No glass, no blur, no gradients, no shadows, no bevels. The material world
is **ink, paper and pigment** — a printed document that has been handled.

Cosmetic textures are the *subject* of the photography and never an interface treatment.

## 9. Evidence language

`docs/EVIDENCE_LANGUAGE.md` — the mandatory requirement, and the heart of the direction.

| | CLAIM | OBSERVATION | VERDICT |
|---|---|---|---|
| Typeface | Zarid Text 400 | Zarid Text + Plex Mono | Zarid **Serif** |
| Size | 16px | 18px + 15px | 40px |
| Colour | muted `#9A9184` | ivory + mineral | ivory |
| Rule | **dotted** hairline | **solid** mineral | **solid 2px clay** |
| Volume | quietest | primary | loudest |

Three axes vary together — typeface, rule style, volume — so the distinction survives greyscale,
colour-vision deficiency and forced-colors. **Colour is the fastest cue, never the only one.**

**The hierarchy is inverted from convention on purpose:** marketing copy is the quietest text on the
page; the reviewer's conclusion is the loudest. That inversion is the site's argument expressed in
type.

Supporting devices: the **margin index**, the **plate**, the **conditions well**, the **disclosure
band**. Five signature devices in total, and no more.

## 10. Review page

`docs/REVIEW_ART_DIRECTION.md` — **designed first, per the brief.**

17 sections, each specified for weight, width, alignment, type, ratio, spacing, surface, motion,
mobile and Arabic behaviour. Page rhythm:

```
hero ██ · disclosure ██ · intro ░░ · conditions ▓▓ · method ▓▓ ·
observations ░▓░▓ · plate ██ · strengths ░░ ░░ · suitability ▒▒ ·
verdict ██ · details ▓░ · related ▒▒
```

Reading, then scanning, then reading. Non-negotiables: disclosure above the hero; limitations at
identical weight to strengths; no text over the hero; margin index collapses inline on mobile rather
than hiding; no score anywhere.

## 11. Homepage

`docs/HOMEPAGE_ART_DIRECTION.md` — written **after** the review page. Seven sections.

**The decision that matters: proof arrives on screen two.** Most creator homepages spend three
screens on the person. Here the featured review — with its disclosure label, three conditions in
mono and one observation — is the second thing you see.

The claim is the headline; the name is small. Cut from the master spec: brand strip (gated brands),
social ecosystem (mock statistics), a separate about block (duplicates `/about/`).

**Weakest surface in the direction** (scored 7/10) and the one most dependent on photography that
does not exist.

## 12. Navigation

Five primary items — Reviews, Method, Journal, Work, About — plus a Collaborate CTA and a language
switcher. **Content first, commerce last.**

Method is in primary navigation because it is the differentiator. Brands is not, because two of five
brands fail their index gate in at least one locale.

Mobile: full-screen overlay, items in the thumb-reachable lower two-thirds, works without
JavaScript. Language switcher shows `English / العربية`, each in its own script — **never a flag**.

## 13. Motion

`docs/MOTION_ART_DIRECTION.md` — **five patterns for the whole site**: settle, sequence, decode,
attend, reveal.

Slow, decelerating, once. No spring, no bounce, no overshoot, nothing above 600ms. **No parallax, no
scroll hijacking, no page transitions in v1, no animation library** (3KB budget, CSS plus an
observer).

Nothing above the fold animates. **Evidence images never move** — a record that animates is a record
you cannot trust. Nothing counts up.

Reduced motion is a **token-level** override, and nothing is lost under it.

## 14. 3D

**None. Not in v1.**

All five plausible placements were evaluated and rejected (`docs/3D_ART_DIRECTION.md`). It
communicates nothing the argument needs, contradicts the paper-and-ink material language, costs
100–500KB against a 1MB budget on the weakest devices, endangers the LCP, and requires maintaining
two implementations so that the better-resourced half of the audience sees a rotating object.

The rendered-cosmetic-texture idea is the worst of them: a *simulation* of product texture on a site
whose premise is photographed reality is close to fabricating evidence.

**The budget goes to photography instead.** Revisit conditions are specified.

## 15. Responsive

`docs/RESPONSIVE_ART_DIRECTION.md` — **designed at 375px first**, expanded to 1440px, capped at
1180px.

Two thresholds carry real change: **768px** (two-column blocks) and **1024px** (margin index and
full header appear).

The margin index **collapses inline on mobile, never hides** — hour markers are part of the record.
Crops are art-directed via `<picture>`, except evidence plates, which never re-crop because
comparability is their function.

**Highest-risk breakpoint: 1024px in Arabic**, where the longest labels and the margin index arrive
together.

## 16. Accessibility

`docs/ACCESSIBILITY_ART_DIRECTION.md` — **WCAG 2.2 AA**, specified in the visual system because
almost every accessibility failure on a premium site originates in an art-direction decision.

24 pairs measured. Lowest text ratio 5.74:1. Focus is 2px clay at 7.37:1, instant, never removed.
No weight below 400. Colour is never the only signal. `prefers-reduced-motion` loses nothing.
`forced-colors` loses nothing, because no information lives in surface value or texture.

Ten art-direction decisions were taken *for* accessibility and are listed so they are not later
"improved" away.

## 17. Performance

`docs/PERFORMANCE_ART_DIRECTION.md` — the direction is **cheap by construction**.

Depth from hairlines and space (0 bytes). Atmosphere from one photograph. Sophistication from five
CSS patterns (3KB). Distinctiveness from the evidence language (0 bytes, zero JavaScript).

Refusing 3D, video, glass, parallax, animation and icon libraries, carousels and charts avoids
roughly **200KB–5MB** in exchange for nothing the design needed.

**The one genuinely expensive decision is typography:** four families across two scripts, held to
180KB per locale by subsetting, locale splitting and three files per page.

The review page — most complex, most visited — has the **second-lowest JS budget on the site**,
because its complexity is typographic rather than interactive.

## 18. Design tokens

`docs/DESIGN_TOKENS_SPEC.md` — semantic names throughout (`color.ground.base`, never `black-900`),
ready for direct conversion to custom properties in Phase 4.

Twelve groups: colour, typography, spacing, layout, radius, borders, shadows, motion, z-index,
breakpoints, media, script adaptation.

Three tokens encode a refusal so it cannot be quietly reversed: `shadow.none` (the only shadow
token), `radius.none` (with no third radius), and `type.tracking.arabic` (fixed at 0).

## 19. Anti-patterns

`docs/DESIGN_ANTI_PATTERNS.md` — 31 entries, binding on Phases 3–14.

**The five most likely to actually happen:**

1. **Rounded cards** — the default failure mode. Radius 0; use the index treatment.
2. **Dashboard drift** — charts, gauges, badges. The evidence layer is one step away.
3. **Arabic treated as secondary** — invisible to a non-Arabic-reading team.
4. **Follower counts as decoration** — mock, undated, and not a design element.
5. **Hero animation** — nothing above the fold animates.

## 20. Rationale

**Why this direction rather than a safer one.**

The brief asked for a property worth $50,000+, and the honest way to earn that is not more visual
effect — it is *a design that argues*. Three quarters of beauty sites use a pale ground and a card
grid. A fourth well-executed version of that is a competent $5,000 site with a bigger budget spent
on it.

The Testing Room earns its value by putting the actual competitive advantage on screen. Zina's
differentiator is that she keeps records; the design's job is to make that legible *before* it is
read. The margin index, the numbered plates, the published conditions and the three-voice type
system do that, and none of them exists elsewhere in the category.

**Why it is defensible under pressure.** The direction is cheap to run, measurably accessible, and
built from decisions that have reasons rather than references. Each refusal — no gold, no glass, no
3D, no parallax, no scores, no charts — protects either the argument or the budget, usually both.

**Where it is weakest, stated plainly.** The homepage is good rather than exceptional (7/10), and
the Arabic is well-specified but unproven (8/10). Both have named owners and named gates. The
Arabic score is the one that can still move materially, and it moves the moment the type is
licensed and set in front of a native reader.

**What must survive into implementation.** If everything else is compromised, these five carry the
brand:

1. The **three voices** — claim recessed, observation primary, verdict loudest.
2. The **margin index** — including its inline collapse on mobile.
3. **Disclosure above the hero**, never truncated, prominence scaling with money.
4. **Limitations at identical weight to strengths.**
5. **Arabic as an authoring language**, not a translation layer.

Lose any one and the site becomes a well-designed beauty blog. Keep all five and it is the thing the
brief asked for.

---

## Method caveat — carries into every phase

The six-stage Method is a **PROJECT MOCK METHOD**, created in Phase 0 and adopted in Phase 1 as the
information-architecture spine. It has **not** been verified as Zina's actual practice, and it must
never be presented as an established or credentialed methodology.

Concretely, in design terms: no seal, badge, crest or monogram implying accreditation; the Method
page styled as *an author's stated approach*; every stage's `doesNotProve` rendered at the same
visual weight as its purpose, never as small print; and the words *clinical*, *validated*,
*certified*, *proven* and *scientific* refused in copy and in visual metaphor.

The visual system is designed around **having a documented method**, not around these six particular
stages. If Zina's own method replaces it, the direction survives unchanged.
