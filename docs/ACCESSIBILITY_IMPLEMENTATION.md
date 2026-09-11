# Accessibility Implementation

**Status:** Phase 4. Target **WCAG 2.2 AA**.

What is implemented, what is measured, and what is still untested. Nothing below is claimed as a
tested result unless it says **measured**.

---

## 1. Measured in a real browser

Chrome, against the built output, both locales, at 320/375/768/1024/1440.

| Check | Result |
|---|---|
| Horizontal overflow, any width, either direction | **None** |
| Type-size floor violations (body ≥16, mono ≥13, nothing <12) | **0** |
| Arabic letter-spacing violations | **0** |
| Positive `tabindex` anywhere | **0** |
| `h1` per page | **exactly 1** |
| Heading level skips | **0** |
| First focusable element | **the skip link**, both locales |
| Landmarks | `header`, `main`, `footer` + 3 uniquely named `nav` |
| Conditions table row headers | **4**, plus a caption |
| Observations as an ordered list | **yes** |
| `<details>` elements | **0** |
| Images without alt | **0** |
| Placeholder `role="img"` without a label | **0** |
| Contrast pairs | **24/24 pass** (`tools/check-contrast.mjs`, exit 0) |

---

## 2. Landmarks and document structure

```html
<a class="skip-link" href="#main">        <!-- first in tab order, visible on focus -->
<header>
  <nav aria-label="Primary">
<main id="main" tabindex="-1">
  <nav aria-label="Breadcrumb">
  <article>…</article>
<footer>
  <nav aria-label="Footer">
```

Three `nav` landmarks, each with a **distinct accessible name** — an unnamed second nav is
announced identically to the first.

`main` carries `tabindex="-1"` so the skip link can move focus to it, with `outline: none` on
`main:focus` only: the focus ring belongs to elements a user moved to deliberately.

---

## 3. Heading hierarchy — level follows structure, never visual size

Measured outline of an English review page:

```
h1  Maison Eclat Voile Lumiere Skin Tint
h2  Testing summary          (visually hidden)
h2  Introduction             (visually hidden)
h2  Testing conditions
h2  Method stages applied
h2  Observations
h2  Visual evidence
h2  Assessment
h3    Strengths
h3    Limitations
h2  Suitability              (visually hidden)
h3    Suits well
h3    May not suit
h2  The verdict
h2  Update log
h2  Product details
h3    Claimed by the brand
h2  Related                  (visually hidden)
```

**The verdict is the largest text on the page and is an `h2`.** That is decision D3-9 implemented:
heading level is document structure, not typography.

Some `h2`s are visually hidden because the section's visual identity is carried by its content
rather than a rendered label — the summary strip and the introduction do not want a heading above
them. **The heading still exists** so the document outline is complete for a screen-reader user.

---

## 4. The three voices without colour

The most important accessibility case on the site: a reader must be able to tell a brand claim
from an observation from a verdict.

| Signal | CLAIM | OBSERVATION | VERDICT |
|---|---|---|---|
| **1 Text label** | "Claimed by the brand" | aspect + timestamp | "The verdict" |
| **2 Semantics** | `<blockquote>` + `<cite>` | `<ol>` list item | `<h2>` + prose |
| **3 Typeface** | body | body + mono | **display serif** |
| **4 Rule style** | **dotted** | **solid** mineral | **solid 2px** clay |
| **5 Size** | 16px, quietest | 18px, primary | 40px, loudest |
| 6 Colour | muted | ivory + mineral | ivory |

**Six signals. Colour is the sixth.**

| Condition | What survives |
|---|---|
| Greyscale | 1–5 — five of six |
| Colour-vision deficiency | all six (the palette is not red/green dependent) |
| **`forced-colors: active`** | 1, 2, 3, **4**, 5 — surface values and the paper grain collapse, and **nothing is lost** |
| Screen reader | 1 and 2 — **sufficient on their own** |

Rule *style* rather than rule *colour* carries the meaning precisely because a dotted line
survives a forced palette and a mineral-coloured line does not.

### Other colour-independent distinctions

| Distinction | Colour | Second signal | Third |
|---|---|---|---|
| Method stage applied / not | mineral | **filled vs hollow square** | accessible name says it in words: *"Comparison: not applied in this test"* |
| Disclosure severity | rule colour | **explicit text label** | band padding |
| Link in prose | clay | **underline, always present** | |
| Active nav item | clay | weight | rule beneath |

---

## 5. Semantics per component

| Content | Element | Why |
|---|---|---|
| Testing conditions | `<table>` + `<th scope="row">` + `<caption>` | Two-dimensional labelled data. A div grid loses the label/value association entirely |
| Testing summary | `<dl>` | Four labelled values are **not** tabular data |
| Observations | `<ol>` | They happened in sequence, and the sequence is meaning |
| Method stages | `<ul>` of links, status in the accessible name | |
| Strengths / limitations / suitability | `<ul>` | No inherent order |
| Brand claim | `<blockquote>` + visible attribution | |
| Plate | `<figure>` + `<figcaption>` | |
| Disclosure band | `<section aria-label>` | A standing statement, not an event — **not** an alert, not a heading |
| Update log | `<time datetime>` per entry | |
| Breadcrumb | `<nav>` + `<ol>`, current item not a link | |

**No ARIA where native semantics suffice.** The only ARIA in the codebase is `aria-label` on
landmarks and the placeholder `role="img"`, `aria-labelledby` binding sections to their headings,
`aria-current="page"` on navigation, and `aria-hidden` on decorative separators.

**No `<details>` anywhere in content.** The Method's limits, the observations and the disclosure
are the three things most likely to be tidied into a disclosure widget, and each is the thing the
page exists to show. Asserted in `tests/output.test.mjs`.

---

## 6. Keyboard

| Requirement | Implementation |
|---|---|
| Skip link | First in tab order, `translateY(-120%)` until focused — moved out of view rather than `display: none`, so it stays focusable |
| Focus indicator | **2px clay at 7.37:1, 2px offset, 100ms, never eased in.** A focus indicator that fades is one you lose |
| `outline: none` without a replacement | **Does not appear in the codebase**, except on `main:focus`, which is a script-focus target rather than an interactive element |
| Tab order | Follows visual order in both directions. 0 positive `tabindex` |
| Mobile menu | A checkbox disclosure. The `<label>` receives a focus ring via `:focus-visible + .menu-trigger` |
| Anchor targets | `scroll-margin-top: 6rem` on every `[id]`, so the header never covers a focused heading |
| Keyboard traps | None — there is no JavaScript to create one |

**35 focusable elements** on a review page, in both locales, and the evidence layer contributes
**zero** of them: the conditions table, the observation sequence and the plates are entirely
static. The densest content on the site needs no interaction and no JavaScript to read.

---

## 7. Touch

| Requirement | Implementation |
|---|---|
| Minimum target | 44×44px via `min-block-size` on nav links, the CTA, the menu trigger and stage links — achieved with padding, not type size |
| Hover-only affordances | None. The 1.02 image scale is decoration and nothing depends on it |

---

## 8. Images

| Class | Treatment |
|---|---|
| Evidence plate | Alt describes **what the frame shows** — "Hour six, product lifting around the nose", never "review photo" |
| Hero | Alt describes the subject; falls back to the review title only if the asset has none |
| Placeholder (current state) | `role="img"` + `aria-label` carrying the alt text. **No icon, no "image unavailable" glyph** |
| Every image | `width`/`height` required by `ImageAsset` → **CLS structurally prevented** |

Alt and caption **must not duplicate**: the caption is public annotation, the alt is description.
A blind reader should be able to follow the observation sequence from alt and caption alone.

---

## 9. Zoom, reflow and text spacing

| Requirement | Implementation |
|---|---|
| 200% zoom (1.4.4) | Fluid type uses `clamp()` with a **`rem`-based** preferred value. A `vw`-only formula breaks user text scaling and is an AA failure |
| Reflow at 320px (1.4.10) | **Measured: no horizontal overflow at 320 in either direction.** Two-column blocks stack; the conditions well becomes label/value rows |
| Text spacing (1.4.12) | No fixed `px` line-heights — every one is a unitless ratio, so a user override cannot clip content |
| Long-word overflow | `overflow-wrap: break-word` on every text element. Product names wrap inside their container, never the page |
| Measure | `66ch` is a **maximum**, not a fixed width, so text reflows rather than truncates |

**A note recorded as decision D4-8:** a user text-spacing override applies `letter-spacing` globally,
which severs Arabic letterforms. That override is **honoured** — WCAG 1.4.12 requires no loss of
content, and content is not lost, only beauty. The site does not defend against it with
`!important`.

---

## 10. Motion

`prefers-reduced-motion: reduce` is honoured at the **token level**, in `tokens.css`, so it cannot
be forgotten per component:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration-quick: 0ms;  --motion-duration-base: 0ms;
    --motion-duration-settle: 0ms; --motion-stagger-sequence: 0ms;
    --motion-distance-settle: 0px; --motion-scale-image: 1;
    /* --motion-duration-instant is NOT zeroed: focus must still appear immediately */
  }
}
```

**Nothing is lost.** The only two animations that exist are the mobile-menu fade and the lazy-image
decode fade. No information, affordance or wayfinding depends on movement.

There is **no scroll-triggered animation at all** — the Phase 3 "sequence" pattern for observations
was not implemented, because it would require JavaScript on a page whose entire value is being
readable without it. The observations are simply present. Recorded as D4-7.

---

## 11. Forced colors

```css
@media (forced-colors: active) {
  :focus-visible { outline-color: Highlight; }
  .disclosure { background-image: none; border-block-start-width: 2px; }
  .note { border-inline-start-color: CanvasText; }
  .claim { border-inline-start-color: CanvasText; }
  .items li::before { background: CanvasText; }
  .stage--applied .marker { background: CanvasText; }
  .stage--absent .marker { box-shadow: inset 0 0 0 1px CanvasText; }
  .frame--placeholder { border: 1px solid CanvasText; }
}
```

The four ground levels and the paper grain collapse, **and nothing is lost**, because no
information lives in surface value or texture. The dotted-versus-solid rule distinction survives,
and the filled-versus-hollow stage marker survives, because both are shape rather than colour.

**Not yet tested on Windows High Contrast.** The rules are written; the verification is outstanding.

---

## 12. What is NOT tested

Stated plainly:

- **No screen reader has run over this**, in either language.
- **The Arabic screen-reader pass has not happened.** It remains the check most likely to be
  skipped and most likely to find real defects, because bidi isolation and `lang` attributes are
  invisible until something reads them aloud.
- **No automated axe-core audit.** It belongs in CI in Phase 5.
- **Forced colors is written but not verified** on a real Windows High Contrast profile.
- **Text-spacing override not exercised** with the bookmarklet.
- **No user testing of any kind.**

The measured results in §1 are real. Everything else in this document is implemented and reasoned,
not proven.
