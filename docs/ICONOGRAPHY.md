# Iconography

**Status:** Phase 2 decision.

**The system is typographic. Icons are the exception, not the vocabulary.**

Total icon count for the entire site: **nine**. Every one earns its place because a word would be
worse — either because the meaning is spatial, or because the control appears in a space too small
for a label.

---

## 1. Why so few

An editorial publication labels things. A software product uses icons because its controls repeat
across many contexts and space is scarce; a review page has room for the word "Filter".

Icons also carry a register. A page with fifteen line icons reads as an app, which is the failure
mode the whole direction is built against. And an icon set is a maintenance surface: every icon
needs an accessible name, an RTL rule and a size rule.

**The default is a word. An icon requires a reason.**

---

## 2. The set

| Icon | Where | RTL | Why not a word |
|---|---|---|---|
| **Menu** (three rules) | Mobile header | No mirror | Universal; label would crowd the bar |
| **Close** (×) | Mobile menu, dialogs | No mirror | Universal |
| **Chevron** | Breadcrumb separator, carousel edge | **Mirrors** | Direction is the meaning |
| **Arrow** | "Read the review", inline links | **Mirrors** | Direction is the meaning |
| **External** (diagonal arrow) | Outbound brand links | **Mirrors** | Signals leaving the site in-line |
| **Mineral square** ▪ | Observation marker, method stage applied, list marker | No mirror | A mark, not a picture |
| **Hollow square** ▫ | Method stage not applied | No mirror | Pairs with the above |
| **Play** | Video thumbnails, if video ships | **Mirrors** | Universal |
| **Search** | Only if on-site search ships (~200 reviews) | No mirror | Universal; not built in v1 |

Seven ship in v1. Two are conditional.

**The mineral square is the only "designed" mark on the site.** A 6px filled square in
`color.accent.mineral`. It appears on observations, on applied method stages, and as the list marker
in strengths, limitations and suitability. It is not a bullet, a tick or a check — it is a **tick on
a scale**, borrowed from the printed index language of the direction.

Its hollow counterpart marks a method stage that was *not* applied, which is a small but genuinely
important piece of honesty: a review that ran four of six stages shows it.

---

## 3. Style

| Property | Specification |
|---|---|
| Construction | **Stroke, not fill.** Except the mineral square, which is solid |
| Stroke width | **1.5px at 24px**, scaling proportionally. Matches the hairline system |
| Terminals | Butt caps, no rounding |
| Corners | Sharp, 0 radius — consistent with the shape language |
| Grid | 24px, 2px optical padding |
| Colour | `currentColor` always, so an icon inherits its context |
| Optical size | Two sizes only: **16px** inline, **24px** standalone |

**No filled icons, no duotone, no gradients, no rounded terminals, no icon backgrounds, no circular
containers.** An icon in a circle is a button pretending to be a badge.

---

## 4. What is explicitly forbidden

| Forbidden | Why |
|---|---|
| **Flask, beaker, microscope, molecule, DNA, test tube** | The clinical implication the content disclaims. This is the most important prohibition in the document |
| **Star** | No ratings exist. A star has no meaning here and would imply one |
| **Thumbs up/down, tick/cross on strengths and limitations** | Turns a balanced assessment into a scorecard, and codes limitations as failures |
| **Green tick / red cross** | Same, plus colour-only meaning |
| **Chart, graph, gauge, meter, sparkline** | Dashboard language |
| **Clock icons beside timestamps** | The word "Hour 6" already says it |
| **Thermometer, droplet beside conditions** | The conditions table is a printed table, not a weather widget |
| **Social platform logos in the body** | Footer only, as text links, per `docs/DESIGN_ANTI_PATTERNS.md` |
| **Emoji, anywhere** | |
| **Decorative flourishes, ornaments, dividers-as-glyphs** | The hairline is the divider |
| **Illustrated empty states** | See `docs/EMPTY_STATES.md` — empty states are typographic |
| **Icon-only buttons without an accessible name** | Accessibility failure |

The first row deserves emphasis. Laboratory iconography is the single fastest way to break the
distinction between *structured personal testing* and *clinical testing* that
`content/mock/method.json` exists to hold. A beaker icon beside the conditions table would make a
scientific claim the content explicitly refuses.

---

## 5. RTL behaviour

| Rule | |
|---|---|
| **Mirror** | Anything encoding direction: chevron, arrow, external, play |
| **Do not mirror** | Menu, close, square markers, search |
| Mechanism | CSS logical transform on a `[dir="rtl"]` scope, not a duplicate asset set |
| Test | Every directional icon checked in both directions before Phase 4 sign-off |

An un-mirrored "read more" arrow pointing left-to-right on an Arabic page is a small error that
signals the Arabic experience was an afterthought — exactly the perception the project is trying to
avoid.

---

## 6. Accessibility

- **Decorative icons** (the mineral square, the chevron beside a labelled breadcrumb):
  `aria-hidden="true"`, never announced.
- **Meaningful icons** (menu, close, external): a visible label or an accessible name. No icon-only
  control ships without one.
- **The external-link icon does not replace text.** "Maison Eclat ↗" — the icon supplements.
- Icons never carry meaning alone. The hollow-versus-filled square is always accompanied by text.
- Minimum interactive target 44px, regardless of icon size.
- In `forced-colors` mode, `currentColor` construction means icons inherit the user's palette
  automatically. Stroke icons survive this; filled and multi-tone icons do not, which is a further
  reason for the stroke rule.

---

## 7. Delivery

- **Inline SVG**, not an icon font. Fonts break in `forced-colors`, misrender on failure, and carry
  accessibility baggage.
- Nine icons inlined at build time. **Total cost under 2KB**; no sprite sheet, no HTTP request, no
  library.
- No icon library dependency — `lucide`, `heroicons` and the rest are 300+ icons to obtain nine, and
  they carry a rounded, software register that is wrong for this direction.
- Icons are drawn for this system: 1.5px stroke, butt caps, sharp corners, 24px grid.
