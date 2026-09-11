# Design Anti-Patterns

**Status:** Phase 2 decision. Binding on Phases 3–14.

Things that must **not** be introduced. Each entry says what is forbidden, why, and what to do
instead. If a future proposal contradicts an entry here, it needs an explicit written decision that
overturns it — not a pull request that quietly reintroduces it.

The entries in **bold** are the ones most likely to actually happen.

---

## Visual clichés

### 1. Black and gold

**Forbidden.** Gold, brass, bronze, copper — any metallic accent.

The luxury cliché the brief names. It is the most-used and least-considered premium signal in the
category, and it says nothing about beauty testing.

**Instead:** `color.accent.clay` `#D9906A`, drawn from pigment and skin.

### 2. Pure black and pure white

**Forbidden.** `#000000` grounds, `#FFFFFF` text.

Pure black reads as technology or as absence; pure white on black is harsh and fatiguing over a
1,500-word review. Maximum contrast is not the goal.

**Instead:** `#12100D` warm ink, `#F2EDE3` ivory — measured at 16.28:1, above AAA.

### 3. Glassmorphism

**Forbidden.** Frosted panels, `backdrop-filter`, translucent overlays.

Dates the work to 2020–2022; expensive to paint on mid-range Android; and a contrast ratio over a
shifting backdrop **cannot be measured**, while every ratio in this system is.

**Instead:** opaque `ground.overlay` for the menu. Hairlines and space for elevation.

### 4. Neon and saturated gradients

**Forbidden.** Neon accents, gradient meshes, colour-shift backgrounds, gradient text and borders.

**Instead:** flat warm surfaces. The only gradient permitted anywhere is a near-invisible scrim
behind text over photography — and the design avoids text over photography entirely.

### 5. **Rounded cards**

**Forbidden.** Radii above 2px. Cards wrapping editorial content. `border-radius: 12px` on anything.

**The single most likely way this direction degrades.** A rounded container turns editorial content
into a component and a publication into a product.

**Instead:** the index treatment — image, hairline, type, no container
(`docs/UI_SHAPE_LANGUAGE.md` §2). Radius is 0 everywhere except 2px on controls.

### 6. Drop shadows and elevation

**Forbidden.** Any `box-shadow` for depth. Hover lift. Shadow bloom.

On a dark ground they read as cheap or as software.

**Instead:** four ground values, hairlines, and space. `shadow.none` is the only shadow token.

---

## Register failures

### 7. **Dashboard aesthetics**

**Forbidden.** Charts, graphs, gauges, meters, progress rings, sparklines, percentage bars, score
badges, dials, KPI tiles, stat grids.

**The most dangerous failure mode of this specific direction.** The evidence layer is one step away
from becoming a dashboard, and a dashboard would imply the scientific authority the content
explicitly disclaims — an editorial integrity failure, not merely an aesthetic one.

**Instead:** archival annotation. Contact sheet, plate caption, condition report
(`docs/ART_DIRECTION.md` §4). *If it could ship in an analytics product, it is wrong.*

### 8. Any data visualisation of results

**Forbidden.** Any chart of testing results, any visual encoding of a verdict.

**There are no scores.** Visualising a measurement that does not exist is a fabrication with a chart
on it.

### 9. **Medical and laboratory iconography**

**Forbidden.** Flasks, beakers, microscopes, molecules, DNA helices, test tubes, lab coats, petri
dishes, clipboards with ticks.

The content makes no clinical claim and the Method's `doesNotProve` fields exist to hold that line.
A beaker icon beside the conditions table makes a scientific claim the content refuses.

**Instead:** the mineral square, mono numerals, printed-table treatment.

### 10. Scientific language as decoration

**Forbidden in copy and in visual metaphor.** "Clinically proven", "lab-tested", "validated",
"certified", "scientifically formulated", accuracy percentages, confidence indicators, seals,
crests, badges, monograms implying accreditation.

Applies to the Method page especially: it is presented as **an author's stated approach**, never as
a standard. See §22.

---

## Content integrity

### 11. Star ratings and scores

**Forbidden.** Stars, X/10, X/5, letter grades, score badges, "editor's choice" seals.

Removed by explicit Phase 1 decision. The validator fails the build on any `rating`, `score` or
`stars` field in a review.

**Instead:** the verdict block — display serif, 2px clay rule, prose.

### 12. **Follower counts as decoration**

**Forbidden.** Follower counts in the header, hero, footer, or as animated counters. "428K"
anywhere in the interface.

Every statistic in the project is mock, unverified and undated. A follower count is not a design
element, and a *fabricated* follower count rendered at 76px is the worst thing this site could
publish.

**Instead:** social links as text in the footer. Credibility comes from the work.

### 13. Fabricated credentials

**Forbidden.** Award badges, "as seen in" logo strips, press walls, testimonials — until each is
individually verified.

`content/mock/press.json` is flagged as the highest-risk file in the project. A shortlisting is
never rendered as a win.

### 14. Client logo walls

**Forbidden** on the homepage and on `/work/`.

The most template-like device in creator design, and with unverified relationships it is also a
credibility risk. Two of five mock brands fail their index gate.

**Instead:** two case studies with real deliverables and stated terms.

### 15. Limitations de-emphasised

**Forbidden.** Limitations set smaller, quieter, lower-contrast, collapsed, or after related
content. Green ticks on strengths and red crosses on limitations.

The moment limitations look like failures rather than findings, the page becomes marketing.

**Instead:** identical type, size, colour and column width. Mineral square markers on both.

### 16. Disclosure de-emphasised

**Forbidden.** Disclosure below the content, in the footer, behind a toggle, truncated, as a small
pill, or in a lighter weight than body text.

**Instead:** full-width band above the hero, statement always fully visible, prominence scaling with
commercial entanglement.

---

## Motion and interaction

### 17. Excessive parallax

**Forbidden.** Parallax on heroes, plates or sections. Scroll-linked scale, rotation or opacity
sequences.

Implies depth in a deliberately flat design; costs continuous compositing on scroll — an INP and
battery cost on the target device class.

### 18. Scroll hijacking

**Forbidden.** Scroll-jacked sections, forced snap between sections, custom scroll physics,
full-page slide decks.

### 19. Animation before content

**Forbidden.** Preloaders, splash screens, entrance animations that gate the LCP, content invisible
until scrolled into view, staged reveals of the hero.

The first paint is the finished page.

### 20. Motion as the only signal

**Forbidden.** Content that only exists after an animation, hover-only affordances, evidence
revealed by interaction, animated counters.

Under `prefers-reduced-motion` nothing may be lost.

### 21. Excessive 3D

**Forbidden in v1.** WebGL, canvas heroes, rendered product environments, shader backgrounds.

Full reasoning and revisit conditions in `docs/3D_ART_DIRECTION.md`.

---

## Bilingual failures

### 22. **Arabic treated as secondary**

**Forbidden.** Choosing a Latin face and finding an Arabic companion afterwards. An Arabic page that
is the English layout with substituted strings. Arabic at the same size and leading as Latin.
Letter-spacing on Arabic. An emphasis system built on italics, which Arabic does not have. A
metadata system built on uppercase, which Arabic does not have. A margin index that stays on the
left in RTL. Un-mirrored directional icons. A header laid out to English widths that wraps in
Arabic. Machine-translated content.

**The failure this project is most exposed to**, because it is invisible to a non-Arabic-reading
team.

**Instead:** a matched bi-scriptual family, `type.arabic.sizeFactor` and `leadingFactor` as system
tokens, `type.tracking.arabic` fixed at 0, logical properties throughout, and a native-reader
review as a release gate.

### 23. Language switcher as a flag

**Forbidden.** Flag icons for languages.

Flags represent countries; Arabic is spoken across dozens of them.

**Instead:** `English` / `العربية`, each in its own script, with `lang` and `hreflang`.

---

## Typography

### 24. Unreadable thin text

**Forbidden.** Weights below 400 anywhere. Hairline serifs at display size. "Elegant" grey below
4.5:1. Body text below 16px, mono below 13px, anything below 12px.

A 100-weight serif at 76px looks expensive on a designer's monitor and fails at 320px, at 200% zoom,
and for low-vision readers.

### 25. Type that breaks user scaling

**Forbidden.** `vw`-only fluid type. Fixed `px` line-heights that break the text-spacing override.
Layouts that clip at 200% zoom.

**Instead:** `clamp()` with `rem`-based preferred values.

### 26. Monospace for prose

**Forbidden.** Mono for body text, headings or captions.

Mono is the record voice: numerals, units, identifiers, plate numbers. Used for prose it becomes a
costume.

---

## Structure and performance

### 27. Everything-is-a-card

See §5. Listed twice because it is the most likely single failure.

### 28. Carousels

**Forbidden.** Auto-advancing carousels, dot indicators, slider galleries, before/after sliders.

A before/after slider hides half the evidence at any moment and is unusable by keyboard.

**Instead:** side-by-side plates; horizontal edge-scroll with visible overflow for related content.

### 29. Stock photography as identity

**Forbidden.** Stock imagery of a person presented as Zina. Product-on-white packshots. Generic
"beauty flatlay" stock.

**Instead:** until real photography exists, neutral tone fields at the correct ratio with the plate
treatment intact — an honest gap rather than a borrowed face.

### 30. Icon inflation

**Forbidden.** Icon libraries, icon fonts, decorative icons, icons where a word fits, icons in
circles, emoji.

Nine icons ship, inline, under 2KB.

### 31. Visual complexity that harms Core Web Vitals

**Forbidden.** Any decision that breaches the budgets without an explicit trade recorded in a phase
report: LCP < 2.0s, INP < 200ms, CLS < 0.05, review-page JS < 40KB, LCP image < 200KB, total mobile
< 1MB.

**The rule:** a visual decision that costs budget must name what it buys and what it replaces.

---

## How to use this document

1. **In design review** — check a proposal against this list before aesthetics.
2. **In code review** — §5, §6, §7, §22 and §30 are detectable in a diff.
3. **When overturning an entry** — record the decision, the reason and the date in the phase report.
   Do not remove the entry; mark it superseded.
4. **When adding an entry** — new anti-patterns are expected as Phases 3–5 discover them.

The five worth checking most often: **rounded cards, dashboard drift, Arabic-as-secondary, follower
counts, and hero animation.**
