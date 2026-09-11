# Visual Territories

**Status:** Phase 2 exploration. Three genuinely different directions, evaluated, then one
selected. No implementation.

**Method note:** each territory was judged against the review page first, per the Phase 2 brief.
A territory that works on a homepage and fails on a review page is rejected regardless of how
well it photographs.

---

## Territory A — Obsidian Editorial

*A cinematic luxury magazine that happens to be a website.*

| | |
|---|---|
| **Emotional goal** | Awe, then stillness. The feeling of opening an expensive quarterly |
| **Visual personality** | Severe, confident, distant, cinematic |
| **Typography** | Very high-contrast display serif at extreme sizes (96–160px desktop). Sparse. Wide margins. Body at a narrow measure |
| **Colour** | Near-black ground, ivory text, no accent at all. Colour enters only through photography |
| **Composition** | Asymmetric, hugely generous negative space. One idea per screen. Full-bleed imagery alternating with narrow text columns |
| **Imagery** | Dominant. Editorial portraiture and macro texture, film-graded, dark-key |
| **Texture** | Minimal. Perhaps a faint grain on hero imagery |
| **Borders** | Almost none. Space does the separating |
| **Cards** | None. Content sits directly on the ground |
| **Spacing** | Very large. 120–200px section rhythm on desktop |
| **Navigation** | Minimal, near-invisible until needed |
| **Editorial hierarchy** | Extreme size jumps. Two or three levels only |
| **Data / evidence** | **The weak point.** No native language for conditions, timestamps or measurements. Data would have to be forced into editorial prose or into an incongruous table |
| **Motion** | Slow fades, long page transitions, cinematic |
| **Photography** | Carries the entire design. Without exceptional imagery it collapses to a plain dark page |

**Strengths.** Immediate premium perception. Ages extremely well. Cheapest direction to make fast — it is mostly type, space and one image. Best-in-class for long-form reading. Works naturally in RTL, because print editorial traditions exist in both scripts.

**Weaknesses.** It is the default premium move, so it risks reading as generic-tasteful. It says *magazine*; it does not say *tests products rigorously*. Most seriously, **it has no answer for the evidence layer** — the six observations, four conditions, three plate captions and disclosure band that every review page must carry.

**Accessibility risks.** Extreme type contrast tempts hairline weights at large sizes. Very low-contrast secondary text is a common companion to this look. Both are fixable but the aesthetic pulls against them.

**Performance risks.** Low. Large hero imagery is the only real cost, and it is manageable.

| Suitability | Score |
|---|---|
| Arabic | **High** — print editorial tradition transfers well; no reliance on case or italics |
| English | High |
| **Review pages** | **Low** — the disqualifying weakness |
| Homepage | Very high |
| Brand pages | Medium |
| Professional clients | High |

**Verdict: rejected as a whole, retained as a foundation.** Its typography, spatial generosity and photographic confidence are correct. Its lack of an evidence language is fatal on the page that matters most.

---

## Territory B — The Testing Room

*An editorial publication with an archival evidence layer.*

| | |
|---|---|
| **Emotional goal** | Trust through visible care. The feeling of being shown the working, not just the conclusion |
| **Visual personality** | Precise, tactile, observational, quietly authoritative |
| **Typography** | Two voices. An editorial serif for prose and verdict; a monospace for timestamps, conditions and measurements. The tension between them is the identity |
| **Colour** | Warm near-black ground. Ivory text. Two functional accents: a cool mineral tone that marks *observed*, a warm clay that marks *editorial* and interactive |
| **Composition** | Editorial column with a persistent narrow **margin index** carrying hour markers, stage names and plate numbers. Marginalia, not a sidebar |
| **Imagery** | Evidence photography treated as numbered **plates** with captions, as in an art book or a conservator's report |
| **Texture** | Restrained. Paper-grain at very low opacity on the disclosure band and the method strip only |
| **Borders** | Hairline rules as the primary structural device. 1px, warm, load-bearing |
| **Cards** | Almost none. Grouping by rule and space, not by container |
| **Spacing** | Editorially generous but tighter than A, because there is more to carry |
| **Navigation** | Quiet, typographic, five items |
| **Editorial hierarchy** | Four levels, clearly separated by role rather than only by size |
| **Data / evidence** | **The strength.** Timestamps, conditions, stage markers and plate numbers all have a native home |
| **Motion** | Functional and slow. Evidence reveals in sequence; nothing bounces |
| **Photography** | Documentary and comparative, consistently lit, timestamped in caption not in frame |

**Strengths.** Genuinely differentiated — very little in the category looks like this. It puts the actual competitive advantage on screen instead of describing it in copy. Its components map one-to-one onto the Phase 1 content model, so design and data reinforce each other. It solves the review page, which is the hardest page. It degrades gracefully: if the photography is weaker than hoped, the evidence layer still carries the page.

**Weaknesses.** The clinical risk is real. Pushed 20% too far it becomes a dashboard, and a dashboard aesthetic would imply the scientific authority the content deliberately does not claim — an editorial integrity problem, not only an aesthetic one. Denser layouts are harder in RTL and on small screens.

**Accessibility risks.** Monospace at small sizes is the main hazard; the mono tier must never drop below 13px. Dense information needs disciplined focus states.

**Performance risks.** Three type families instead of two. Mitigated by subsetting and by using one open-source superfamily across UI and mono.

| Suitability | Score |
|---|---|
| Arabic | **Medium-high** — needs care: no letter-spacing, larger line-height, and a mono strategy for a script with no mono tradition |
| English | High |
| **Review pages** | **Very high** |
| Homepage | Medium-high — needs Territory A's spatial confidence to avoid feeling busy |
| Brand pages | High |
| Professional clients | **Very high** — the evidence layer *is* the pitch |

**Verdict: selected, with Territory A's foundation.**

---

## Territory C — Contemporary Maison

*A warm, human, art-directed house.*

| | |
|---|---|
| **Emotional goal** | Intimacy and warmth. Being let into someone's practice |
| **Visual personality** | Soft, tactile, personal, confident without severity |
| **Typography** | Humanist serif with lower contrast. Larger body sizes. Softer hierarchy |
| **Colour** | **Light ground** — warm ivory and mineral beige, with deep ink text and clay accents. The inverse of A and B |
| **Composition** | Gentler rhythm, more overlap, more collage, more hand |
| **Imagery** | Warm, natural light, close and personal. Hands, skin, product texture |
| **Texture** | Present and deliberate: paper, pigment, powder. The most material of the three |
| **Borders** | Soft, occasional |
| **Cards** | Some, with generous padding and very small radii |
| **Spacing** | Comfortable rather than dramatic |
| **Navigation** | Warm, more visible, more approachable |
| **Editorial hierarchy** | Three levels, gently separated |
| **Data / evidence** | Medium. A light ground handles tables well, but the warmth fights the precision the content needs |
| **Motion** | Soft, organic, slower easing |
| **Photography** | Natural light, warm grade, human presence throughout |

**Strengths.** The warmest and most human. Best for audience A on a first visit. Light grounds are marginally better for long-form reading and materially safer for accessibility. Skin tones render more truthfully against ivory than against near-black. Lowest risk of the clinical failure mode.

**Weaknesses.** Roughly three in four beauty websites already use a pale foundation
(`docs/COMPETITIVE_RESEARCH.md` §3), so this is the least differentiated territory — it looks like the category. It reads *lifestyle*, which undercuts the testing positioning. Warmth and precision pull against each other, and the evidence layer would fight the surface.

**Accessibility risks.** Lowest of the three. Light grounds fail AA less often than dark ones.

**Performance risks.** Texture is the cost. Paper and pigment overlays are easy to overspend on.

| Suitability | Score |
|---|---|
| Arabic | High — warm humanist Arabic faces are plentiful and beautiful |
| English | High |
| **Review pages** | Medium — workable, but the evidence layer is a guest rather than a native |
| Homepage | High |
| Brand pages | High |
| Professional clients | Medium — reads creative rather than rigorous |

**Verdict: rejected as the primary direction. Its warmth is borrowed.**

---

## Comparison

| | A — Obsidian | **B — Testing Room** | C — Maison |
|---|---|---|---|
| Differentiation | Low | **High** | Low |
| Luxury perception | Very high | High | High |
| Expresses the method | **None** | **High** | Low |
| Review-page fit | **Low** | **Very high** | Medium |
| Homepage fit | Very high | Medium-high | High |
| Warmth | Low | Medium | **High** |
| Arabic fit | High | Medium-high | High |
| Accessibility risk | Medium | Medium | **Low** |
| Performance risk | **Low** | Medium | Medium |
| Dependence on photography | **Very high** | Medium | Very high |
| Clinical-drift risk | None | **Real** | None |

---

## Selection

**Territory B, "The Testing Room", built on Territory A's spatial and typographic foundation, and
borrowing Territory C's warmth in the ground rather than in the layout.**

Three specific inheritances, so the synthesis is a decision and not a blend:

- **From A:** the spatial confidence, the display typography, the discipline of one idea per
  screen. These govern the homepage, `/about/`, journal and work — the *reading* surfaces.
- **From B:** the margin index, the hairline structure, the plate system, the mono data tier, the
  three-voice evidence language. These govern the *review* page and the evidence blocks wherever
  they appear.
- **From C:** warmth, but placed in the **colour temperature of the dark ground** rather than in
  the layout. The ground is a warm ink, never a blue-black and never pure black. That single
  decision is what keeps the direction from reading as a technology product.

**Why this and not A.** A is the more immediately impressive direction and the safer one to
execute. It is rejected because it cannot carry the review page, and the review page is the
product. A site that looks like an expensive magazine but has nowhere to put four testing
conditions has optimised for the wrong screenshot.

**Why this and not C.** C is warmer, safer and easier to like. It is rejected because it looks
like the category. The documented convention is a pale ground; dark is the documented signal for
editorial seriousness. Choosing C would mean spending the entire design budget arriving at what
three quarters of beauty sites already are.

**The risk being accepted.** B's clinical-drift failure mode is real and is the single thing most
likely to go wrong in Phase 3 and 4. The mitigation is a specific creative decision rather than a
warning: **the evidence layer borrows from archival annotation, not from instrumentation** — the
contact sheet, the plate caption, the conservator's condition report. Precision that reads as
*documentation*, never as *diagnosis*. This is developed in `docs/ART_DIRECTION.md` and
`docs/EVIDENCE_LANGUAGE.md`, and it is the reason the Method's `doesNotProve` fields exist in the
content model.
