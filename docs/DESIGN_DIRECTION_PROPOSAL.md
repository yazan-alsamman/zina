# Design Direction Proposal

**Status:** Phase 0 proposal. No design implemented. Phase 2 owns the decision.

Three territories, evaluated honestly including their failure modes, then one recommendation.

---

## Constraints that apply to all three

From `docs/BRAND_AND_ART_DIRECTION.md` and `docs/PERFORMANCE_AND_ACCESSIBILITY.md`:

- No generic pink beauty template, no glassmorphism, no random gradients, no gratuitous 3D
- Mobile is designed for touch and one-handed use, not compressed from desktop
- WCAG 2.2 AA is a design benchmark, not a remediation phase
- Motion respects `prefers-reduced-motion`; no core information depends on animation
- Core Web Vitals are release criteria

Two constraints the brief does not state but that the content demands:

- **The layout must carry a bilingual, bidirectional system.** If D-04 goes bilingual, RTL is not
  a mirrored stylesheet — it changes typographic pairing, optical alignment, and the reading path
  of every editorial layout. Choosing a direction that only works in LTR would be a costly error.
- **The review template is the design system.** It is the most-visited page type, the most
  structurally complex, and the one carrying disclosure, observations, conditions and verdict.
  Any direction that looks good on a homepage and falls apart on a review page is the wrong
  direction. Phase 2 should design the review page first and the homepage second.

**One researched finding informs all three.** As of 2026, roughly three in four beauty websites
use a pale foundation, with dark reserved for editorial or moody positioning
(`docs/COMPETITIVE_RESEARCH.md` section 3). Dark is therefore not a contrarian risk here; it is
the documented signal for editorial seriousness in this specific category.

---

## Direction 1 — Luxury Editorial

*A print fashion quarterly that happens to be a website.*

**Typography** High-contrast display serif for headlines at genuinely large sizes. A quiet
neutral sans for body and UI. Arabic paired with a modern Naskh with comparable contrast — the
pairing is the hard part and must be tested at headline size before committing.

**Colour** Warm off-white ground, near-black ink, one restrained accent drawn from photography
rather than chosen abstractly. Colour comes from the images, not the interface.

**Layout** Asymmetric editorial grid. Generous, uneven margins. Full-bleed imagery alternating
with narrow measure text. Deliberate empty space.

**Photography** Portraiture and macro texture, controlled studio lighting, film-like grade.
Requires genuinely good photography and is unforgiving without it.

**Motion** Minimal. Slow fades, considered page transitions, no scroll-jacking.

**Emotion** Considered, expensive, authoritative, slightly distant.

**Strengths** Reads premium immediately. Ages well. Cheapest to make fast — it is mostly type,
space and images. Excellent for long-form reading. Works in RTL more naturally than any other
direction, because print editorial traditions exist in both scripts.

**Risks** It is the default premium move, so it can read as generic-tasteful. Depends entirely on
photography quality — with weak imagery it collapses to a plain white page. Says "magazine",
which does not by itself say "tests products rigorously".

---

## Direction 2 — Contemporary Beauty Laboratory

*The method is the visual identity.*

**Typography** Precise grotesque throughout. A monospace accent for data: timestamps, conditions,
shade codes, wear windows. Tabular figures everywhere numbers appear.

**Colour** Cool neutral ground, high-contrast ink, one signal colour used strictly to mark
observed data versus brand claims. Colour carries meaning rather than mood.

**Layout** Visible grid. Data tables and comparison modules as first-class design objects. The
eight-hour timeline, the conditions block, the claim-versus-observation split all become signature
components rather than afterthoughts.

**Photography** Documentary and comparative. Consistent lighting setups, before/after pairs,
swatch grids, timestamps in frame. Systematic rather than beautiful.

**Motion** Functional. Timeline scrubbing, comparison reveals, filter transitions. Motion explains
rather than decorates.

**Emotion** Rigorous, trustworthy, modern, a little clinical.

**Strengths** It is genuinely differentiated — nothing in the category looks like this. It makes
the actual competitive advantage visible on the surface. It is the direction most aligned with
what Google rewards, because it foregrounds first-hand testing data. Its components map directly
onto the content model, so design and data reinforce each other.

**Risks** Cold. Beauty is sensory and emotional, and an over-clinical treatment can feel joyless.
It also risks implying scientific authority the content deliberately does not claim — the site
makes no clinical or dermatological claims, and a laboratory aesthetic could imply otherwise,
which is an editorial integrity problem, not just an aesthetic one. Densest layouts are hardest to
make work on mobile and in RTL.

---

## Direction 3 — Cinematic Personal Brand

*Zina, at scale, in motion.*

**Typography** Large humanist sans, tight tracking. Type sits over imagery more often than beside
it. Fewer levels in the hierarchy, bigger jumps between them.

**Colour** Dark ground throughout. Skin tones and product colour as the only saturation. Deep,
warm, low-key.

**Layout** Full-viewport sections. Sequential, scroll-driven narrative. Fewer, larger moments.

**Photography** Cinematic portraiture and video. Motion-first: video hero, moving product texture,
atmospheric grade.

**Motion** Central. Parallax, scroll-linked reveals, video transitions.

**Emotion** Magnetic, intimate, aspirational, star-forward.

**Strengths** Highest immediate impact. Strongest for audience B on a first visit. Best expression
of a personality-led brand. The dark ground is the researched editorial signal.

**Risks** The most serious of the three. Video-first heroes are the most common LCP failure mode
on the web and directly conflict with the Core Web Vitals release criteria. Scroll-driven
narrative is hostile to the review template, which is a reading page, not an experience. Motion
dependence creates a large `prefers-reduced-motion` surface. It also centres the person over the
work, which is precisely the Type B media-kit trap identified in `docs/COMPETITIVE_RESEARCH.md`
section 1. It does not scale to two hundred reviews.

---

## Comparison

| | Luxury Editorial | Beauty Laboratory | Cinematic |
|---|---|---|---|
| Differentiation | Low | **High** | Medium |
| Premium perception | **High** | Medium-high | **High** |
| Supports 200 reviews | High | **High** | Low |
| Review-page fit | High | **High** | Low |
| Performance risk | **Low** | Low-medium | High |
| Accessibility risk | **Low** | Medium | High |
| RTL / bilingual fit | **High** | Medium | Medium |
| Dependence on photography | **Very high** | Medium | **Very high** |
| Expresses the method | Low | **High** | Low |
| Warmth | Medium | Low | **High** |

---

## Recommendation

**A Luxury Editorial foundation with the Beauty Laboratory system embedded in it, on a dark
editorial ground. Cinematic treatment reserved for two or three specific moments, never as the
site's operating mode.**

Not a compromise — a division of labour by page type:

**The editorial layer governs reading.** Homepage, `/about`, journal, work case studies. Serif
display, generous space, photography-led, restrained motion, dark ground. This is what makes the
site feel like a $50,000 property in the first three seconds and what makes long articles
pleasant to read.

**The laboratory layer governs evidence.** Inside every review: the conditions block, the
observation timeline, the claim-versus-observation split, pros/cons, the suitability pair, the
disclosure band, the update log. Monospace for data, tabular figures, one signal colour that
means *observed*. These are the components that carry the differentiation, and they are the only
place the clinical treatment appears — which also contains the risk of implying scientific
authority, because the precision reads as *documentation*, not as *clinical claim*.

**The cinematic layer is rationed.** The homepage hero and, at most, one work case study moment.
Static-first with a poster image and correct LCP handling; motion is an enhancement that arrives
after paint, never a dependency.

**Why this one:**

1. It puts the actual differentiator on screen. A site that says "I test rigorously" in words
   and looks like every other beauty site has not made its argument.
2. It solves the review page, which is the page that matters most and the one most designs ignore.
3. It carries the performance and accessibility constraints without fighting them. The reading
   layer is type and space; the evidence layer is structured markup, which is also the most
   accessible thing on the page.
4. Dark editorial is the documented signal for seriousness in this category rather than a
   contrarian gamble.
5. It degrades gracefully. If the photography is weaker than hoped, the evidence layer still
   carries the pages — which is not true of Directions 1 or 3.

**What Phase 2 must resolve:**

- The Arabic/Latin type pairing, tested at display size in both scripts before either family is
  committed. This is the highest-risk unresolved item.
- Contrast ratios on a dark ground, verified rather than assumed. Dark grounds fail AA more often
  than light ones, particularly for the muted secondary text this direction wants.
- The signal colour, which must be legible against skin tones in photography without competing
  with them.
- The review page, designed first.
- The empty and partial states: a work project with no results figures, a brand with one review,
  a review with no comparison product. These must look intentional, because they will be common.
