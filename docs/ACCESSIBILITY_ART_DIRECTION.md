# Accessibility Art Direction

**Status:** Phase 2 decision. Target: **WCAG 2.2 AA**.

Accessibility is specified here, in the visual system, because almost every accessibility failure on
a premium site originates in an art-direction decision — thin type at display size, low-contrast
"elegant" grey, colour-only distinctions, motion as the mechanism for revealing content. Fixing
those in engineering means undoing the design.

---

## 1. Contrast — already measured

Every value verified by `node tools/check-contrast.mjs`. Full table in `docs/COLOR_SYSTEM.md` §4.

| Requirement | Threshold | System result |
|---|---|---|
| Normal text | 4.5:1 | **Lowest is 5.74:1** (claim text, deliberately recessed) |
| Large text | 3:1 | All display pairs ≥9.89:1 |
| Non-text (UI, focus, meaningful borders) | 3:1 | Lowest is 3.56:1 (`line.strong`) |
| AAA aspiration | 7:1 | Body 16.28:1, secondary 9.89:1 — **both clear AAA** |

The single failure found during specification — `line.strong` at 1.92:1 — was caught by measurement,
not by eye, and corrected. That is the argument for the tool existing.

`line.hairline` at 1.30:1 is the only element below 3:1. It is decorative by definition and carries
no information; removing it would change nothing a user needs to know.

---

## 2. Colour is never the only signal

| Distinction | Colour | Second signal | Third |
|---|---|---|---|
| Claim / observation / verdict | muted / mineral / ivory | **Typeface** (text vs serif) | **Rule style** (dotted / solid / 2px) + indentation + label |
| Link in prose | clay | **Underline, always present** | |
| Focus | clay ring | 2px ring + 2px offset | |
| Disclosure type | rule colour | **Explicit text label** | Band padding, statement text |
| Method stage applied | mineral | **Filled vs hollow square** | Text |
| Form error | error red | **Icon + text** | Border change |
| Active nav item | clay | Weight change | Rule beneath |

The three-voice evidence system is the most important case. It survives greyscale entirely, because
typeface and rule style do the work that colour merely accelerates.

---

## 3. Focus

The most-neglected state in premium design, and the one most often removed for aesthetics.

| Property | Specification |
|---|---|
| Indicator | 2px solid `accent.clay`, 2px offset from the element |
| Contrast | **7.37:1** against ground — far above the 3:1 requirement |
| Timing | **Appears instantly, 100ms.** Never eased in |
| Scope | Every interactive element, without exception |
| Method | `:focus-visible`, so mouse users are not shown rings unnecessarily |
| On images / cards | Ring around the whole clickable block, not the image alone |
| On the clay button | Ring switches to `text.primary` so it is visible against the clay fill |

**`outline: none` without a replacement is forbidden anywhere in this project.** If a focus style is
ever described as "ugly", the fix is to design a better one, not to remove it.

---

## 4. Text scaling and reflow

| Requirement | Response |
|---|---|
| 200% browser zoom | Fully usable. Fluid type uses `clamp()` with a **`rem`-based** preferred value — a `vw`-only formula breaks user text scaling and is an AA failure |
| Text-only 200% resize | Layouts reflow; no clipping, no overlap |
| WCAG 1.4.10 reflow | 320px at 200% zoom (≈640px reflow) with no horizontal scroll |
| WCAG 1.4.12 text spacing | Line-height 1.5×, paragraph 2×, letter 0.12em, word 0.16em applied by the user — no loss of content. Nothing may rely on a fixed line-height for layout |
| Long-word overflow | Arabic and Latin product names must wrap or scroll within their container, never the page |

The measure of 62–68 characters is a maximum, not a fixed width, so text reflows rather than
truncates.

---

## 5. Motion

Full specification in `docs/MOTION_ART_DIRECTION.md` §10.

`prefers-reduced-motion: reduce` is honoured **at the token level**, so it cannot be forgotten per
component:

```
durations → 0ms (focus stays instant)
transforms → removed
staggers → removed
scroll-triggered entrance → content simply present
smooth anchor scroll → instant
```

**Nothing is lost under reduced motion.** No information, affordance or wayfinding depends on
movement, which is why the reduced-motion site is stiller rather than degraded.

No element flashes more than three times per second. No auto-playing motion. No carousels that
advance on their own.

---

## 6. Keyboard

| Requirement | |
|---|---|
| All functionality reachable | Filters, menu, language switcher, form, all links |
| Skip link | To main content, first in tab order, **visible on focus** |
| Tab order follows visual order | In both LTR and RTL — an RTL page must not tab left-to-right |
| No keyboard traps | Mobile menu traps focus **while open**, returns it to the trigger on close |
| `Escape` | Closes the menu and any dialog |
| Focus never hidden | Sticky header must not obscure a focused element; `scroll-margin-top` on anchors |
| Filter chips | Real controls, arrow-key navigable within the group |
| No positive `tabindex` | |

The evidence layer contains no interactive elements at all, which is a genuine accessibility
advantage: the densest part of the page is entirely static, readable content.

---

## 7. Touch

| Requirement | |
|---|---|
| Minimum target | **44 × 44px**, achieved with padding, not type size |
| Spacing between targets | ≥8px |
| Primary actions in thumb reach | Mobile menu items in the lower two-thirds |
| No hover-only affordance | Everything reachable by tap |
| Filter chips | 44px tall, comfortably spaced |
| WCAG 2.2 target size (2.5.8) | Met at 44px, above the 24px minimum |

---

## 8. Images

| Image type | Treatment |
|---|---|
| **Editorial and hero** | Meaningful alt describing the subject. `alt` is a required field on `ImageAsset` — the content model enforces it |
| **Evidence plates** | Alt describes **what the frame shows**: "Hour six, product lifting around the nose". Not "review photo". The plate is evidence; its alt text carries the evidence |
| **Portraits** | Descriptive alt |
| **Brand logos** | Alt is the brand name |
| **Decorative** | `alt=""`, never omitted |
| Every image | `width` and `height` required by the type system → CLS structurally prevented |

**Evidence alt text is an editorial task, not an engineering one.** A blind reader of a review
should be able to follow the observation sequence from alt text and caption alone. The caption and
the alt should not duplicate each other — the caption is public annotation, the alt is description.

---

## 9. Semantic and heading structure

Determined by the design, so it is specified here:

```
h1   Review title                          exactly one
h2   Testing context / Method stages / Observations / Evidence /
     Strengths / Limitations / Suitability / Verdict / Related
h3   Individual observation aspects, plate captions where needed
```

- Heading level follows document structure, never visual size. The verdict is large but is an `h2`.
- The disclosure band is not a heading; it is a `<section>` with an accessible name.
- Landmarks: `header`, `nav`, `main`, `aside` for the margin index, `footer`.
- The margin index is `<aside>` and, on mobile, moves inline while keeping its role.
- Conditions well is a real `<table>` with `<th>` scope, not a grid of divs.
- Observations are an ordered list — they happened in sequence.

---

## 10. Language and direction

Materially important on a bilingual site, and frequently missed.

| Requirement | |
|---|---|
| `lang` and `dir` on `<html>` | `en`/`ltr`, `ar`/`rtl` |
| Language switcher links | Carry `hreflang` **and** `lang`, so a screen reader announces "العربية" in Arabic rather than mispronouncing it in English |
| Mixed-script runs | `<bdi>` with `lang` on Latin product names inside Arabic prose, so they are announced in the right voice |
| Mirroring | CSS logical properties only |
| RTL tab order | Follows visual order |
| Directional icons | Mirror; non-directional do not |

---

## 11. Forced colors / High Contrast

Windows High Contrast is used by a real population and breaks "premium" designs routinely.

| Requirement | |
|---|---|
| Colour overridden by the user's palette | Expected; must remain usable |
| **No information carried by surface value or texture** | The four ground levels and the paper grain all collapse — and nothing is lost, because meaning lives in type, rules and labels |
| Icons | `currentColor` stroke construction survives; filled and multi-tone would not |
| Focus | Uses system highlight colour |
| Hairlines | Become system-coloured; the dotted-vs-solid rule distinction **survives**, which is why rule *style* rather than rule *colour* carries the claim/observation meaning |
| `forced-colors: active` | Explicitly tested, not assumed |

The evidence language was designed so that it degrades correctly here. That is not a coincidence —
it is the reason the distinction uses three axes rather than colour alone.

---

## 12. Art-direction decisions taken for accessibility

Choices made *because* of accessibility, listed so nobody later "improves" them:

1. **Text is ivory `#F2EDE3`, not pure white.** 16.28:1 instead of 21:1 — above AAA, and materially
   more comfortable for long reading. Maximum contrast was rejected deliberately.
2. **No weights below 400.** Hairline serif at 76px looks expensive and fails at 320px, at 200% zoom
   and for low-vision readers.
3. **Muted text is `#9A9184` at 6.11:1.** The "elegant" grey most premium sites use sits near
   3.5:1 and fails.
4. **Underlines are never removed from links in prose.**
5. **No glassmorphism**, partly because a contrast ratio over a shifting backdrop cannot be
   measured, and every ratio here is measured.
6. **No text over the hero**, which removes the need for a scrim and a guessed contrast ratio.
7. **The margin index collapses inline on mobile rather than being hidden** — the record stays
   available to everyone.
8. **The disclosure statement is never truncated or collapsed** at any width.
9. **No before/after slider**; side-by-side plates instead, which are keyboard-accessible and show
   both frames at once.
10. **The evidence layer is fully static**, so the densest content on the site needs no JavaScript
    and no interaction to read.

---

## 13. Verification plan

Phase 2 produces no code, so nothing here is yet tested. For Phases 3–5:

| Check | When | How |
|---|---|---|
| Contrast | **Done** | `tools/check-contrast.mjs` — 24 pairs passing |
| Automated audit | Every PR | axe-core in component tests, Lighthouse a11y in CI |
| Keyboard walkthrough | Per template | Manual, LTR and RTL |
| Screen reader | Review page, contact form | NVDA + Firefox, VoiceOver + Safari |
| **Arabic screen reader** | Review page | An Arabic-speaking tester. Not optional |
| 200% zoom + reflow | Per template | Manual at 320px and 1280px |
| Text-spacing override | Per template | Bookmarklet |
| Forced colors | Per template | Windows High Contrast |
| Reduced motion | Site-wide | OS setting |

The Arabic screen-reader pass is the one most likely to be skipped and the one most likely to find
real defects, because bidi isolation and `lang` attributes are invisible until something reads them
aloud.
