# Accessibility UX Specification

**Status:** Phase 3 decision. Target: **WCAG 2.2 AA**.

Extends `docs/ACCESSIBILITY_ART_DIRECTION.md` (Phase 2 — colour, focus, motion, contrast, measured)
into **structure**: landmarks, headings, reading order, keyboard paths, semantics per component, and
the specific mechanisms that keep claim, observation and verdict distinguishable without colour.

**Accessibility is designed here, not tested later.** Almost every accessibility failure on a
premium site originates in an architecture or art-direction decision, and fixing those in
engineering means undoing the design.

---

## 1. What is already verified, and what is not

| | Status |
|---|---|
| **Contrast** | **VERIFIED.** 24 pairs measured by `node tools/check-contrast.mjs`, exit 0. Lowest text pair 5.74:1; nine clear AAA. One failure was found during Phase 2 specification and corrected |
| **Arabic letter-spacing** | **VERIFIED.** 0 violations at 320/375/768/1024/1440 (type proof) |
| **Type size floors** | **VERIFIED.** 0 violations at all five widths, both scripts |
| **Disclosure statement never clipped** | **VERIFIED** at 320 in both scripts |
| **Bidi isolation** | **PARTIALLY VERIFIED.** Latin identifiers correct; a numeral-isolation defect was found and corrected |
| Everything else in this document | **SPECIFIED, NOT TESTED.** No application exists |
| **Arabic screen-reader pass** | **NOT DONE.** The check most likely to be skipped and most likely to find real defects |

Nothing below is claimed as a tested result.

---

## 2. Landmarks and document structure

Every page, every template:

```
<header>                      role=banner
  <nav aria-label="Primary">
<main id="main">              role=main — the skip-link target, exactly one
  <nav aria-label="Breadcrumb">
  …template content…
  <aside>                     the margin index (review page)
<footer>                      role=contentinfo
  <nav aria-label="Footer">
```

| Rule | |
|---|---|
| One `<main>` per page | The skip target |
| Two `<nav>` landmarks minimum, **with distinct accessible names** | An unnamed second nav is announced identically to the first |
| The **margin index is an `<aside>`** | And **keeps its role when it moves inline** below 1024 — the information is the same, only the position changed |
| The disclosure band is a `<section>` with an accessible name | **Not a heading**, not an `alert`, not a `region` with an aria-live |
| The Method boundary is a `<section>` with an accessible name | **Never a `<details>`** |
| No `role` attribute where a native element exists | |

---

## 3. Heading hierarchy

Heading level follows **document structure, never visual size**. The verdict is the largest text on
a review page and is an `h2`.

### Review page

```
h1   Review title                                       exactly one
h2   Testing conditions
h2   Method stages applied
h2   Observations
h2   Visual evidence
h2   Strengths          h2   Limitations                 siblings, equal level
h2   Suitability
h2   The verdict                                         largest text, still h2
h2   Update log
h2   Product details
h3     Claimed by the brand
h2   Related
```

### Homepage

```
h1   The opening statement          ← the CLAIM is the h1, not the name
h2   Featured review
h2   The method
h2   Recent reviews
h2   Selected work
h2   From the journal
h2   Collaborate
```

**On the homepage the statement is the `h1` and the name is not a heading.** On `/about/` the name
*is* the `h1`, because there the person is the subject. This is deliberate and is the heading-level
expression of *"the claim is the headline; the name is small."*

### Method page

```
h1   The Six-Stage Test
h2   What this is and is not          ← the boundary, before the stages
h2   Baseline
h3     What is observed
h3     What is recorded
h3     What this stage does not prove
h2   Application … (×6)
h2   What this cannot tell you
h2   The method applied
```

### Other templates

| Template | `h1` |
|---|---|
| Review index | "Reviews" |
| Journal article | The article title |
| Work case study | The project title |
| Brand | The brand name |
| Contact | "Collaborate" or equivalent |
| 404 | A statement of what happened — **not "404"** |

**No level is skipped.** No heading exists purely to produce a size.

---

## 4. Reading order and focus order

**DOM order equals visual order equals reading order, at every breakpoint, in both directions.**

| Rule | Consequence |
|---|---|
| No section is re-ordered by breakpoint | A shared URL shows the same thing to everyone, and screen-reader order never diverges from visual order |
| The margin index is in the DOM **beside** its observation, not in a separate block | A screen-reader user hears "Hour 6, Wear" immediately before the note it labels |
| The disclosure band precedes the hero in the DOM | It precedes it visually, and it is the first thing announced after the title |
| **RTL tab order follows visual order** | An RTL page must not tab left-to-right. This is a defect, not a preference |
| No positive `tabindex` anywhere | |
| Skip link is first in tab order and **visible on focus** | |

### The review page's tab path

```
skip link → wordmark → 5 nav items → CTA → switcher →
breadcrumb links → brand link (if the gate passes) →
[disclosure band: NOT focusable — it is not interactive] →
[hero: not focusable] →
[summary strip: not focusable] →
introduction inline links →
[conditions well: NOT focusable — it is a table, not a control] →
6 method stage links →
[observations: NOT focusable — static content] →
[plates: not focusable, no lightbox in v1] →
official product link → 2 related reviews → 2 related journal →
1 related work → CTA → footer links
```

**The evidence layer contains no interactive elements at all.** That is a genuine accessibility
advantage, not an omission: the densest, most valuable content on the site is entirely static,
readable with JavaScript disabled, and requires no interaction to reach.

---

## 5. Zoom, reflow and text spacing

| Requirement | Response |
|---|---|
| **200% browser zoom** (1.4.4) | Fully usable. Fluid type uses `clamp()` with a **`rem`-based** preferred value — a `vw`-only formula breaks user text scaling and is an AA failure |
| **Reflow at 320px / 200%** (1.4.10) | ≈640px reflow, no horizontal scroll. **Two-column blocks stack; the conditions well becomes label/value rows** |
| **Text spacing override** (1.4.12) | Line-height 1.5×, paragraph 2×, letter 0.12em, word 0.16em applied by the user with no loss of content. **Nothing may rely on a fixed line-height for layout** |
| Long-word overflow | Arabic and Latin product names wrap or scroll **within their container, never the page** |
| Measure | 62–68 characters is a **maximum, not a fixed width** — text reflows rather than truncates |

> **The letter-spacing override and Arabic.** A user text-spacing bookmarklet applies
> `letter-spacing: 0.12em` globally, which severs Arabic letterforms. This is a **user-initiated
> override and must be honoured** — WCAG 1.4.12 requires no loss of content, and the content is not
> lost, only less beautiful. The site must not defend against it with `!important`. Recorded as
> **D3-8**.

---

## 6. Keyboard

| Requirement | |
|---|---|
| All functionality reachable | Facets, menu, switcher, form, all links |
| Skip link | To `<main>`, first in tab order, visible on focus |
| Focus visible | **2px clay ring at 7.37:1, 2px offset, appears instantly (100ms), never eased in.** A focus indicator that fades is one you lose |
| `outline: none` without a replacement | **Forbidden project-wide.** If a focus style is called ugly, design a better one — do not remove it |
| Focus on the clay button | Ring switches to `text.primary` so it is visible against the fill |
| Focus on a linked block | Ring surrounds **the whole clickable block**, not the image inside it |
| Mobile menu | Focus trapped while open; `Escape` closes; focus returns to the trigger; body scroll locked and position restored |
| Sticky header | Must not obscure a focused element — `scroll-margin-top` on every anchor target |
| Facet chips | Real links, arrow-key navigable within the group |
| No keyboard traps | Anywhere |

---

## 7. Touch

| Requirement | |
|---|---|
| Minimum target | **44 × 44px**, achieved with padding, not type size — WCAG 2.2 §2.5.8 requires 24px; 44px is the design floor |
| Spacing between targets | ≥8px |
| Primary actions in thumb reach | Menu items in the lower two-thirds |
| No hover-only affordance | Everything reachable by tap. The 1.02 image scale is decoration, and nothing depends on it |
| Facet chips | 44px tall, comfortably spaced |

---

## 8. Images and alt strategy

| Image class | Alt strategy |
|---|---|
| **Evidence plate** | Describes **what the frame shows**: *"Hour six, product lifting around the nose and the chin."* **Not** "review photo". The plate is evidence; its alt carries the evidence |
| **Review hero** | Describes the subject of the photograph |
| **Homepage portrait** | Descriptive — subject, framing, what is visible |
| **Work gallery** | Describes the deliverable shown |
| **Brand logo** | The brand name, nothing more |
| **Decorative** | `alt=""` — **never omitted**. But: in State B a decorative image is **not rendered at all**, so this case is rare |
| **Every image** | `width` and `height` required by `ImageAsset` → **CLS structurally prevented**. A missing dimension is a build error |

**Evidence alt text is an editorial task, not an engineering one.** A blind reader of a review should
be able to follow the observation sequence from alt text and caption alone. **The caption and the
alt must not duplicate each other** — the caption is public annotation, the alt is description.

**Alt is a required field on `ImageAsset` in the type system**, so an image without one cannot exist
in the content layer. That is the strongest available guarantee and it is worth more than any audit.

---

## 9. Table, list and disclosure semantics

| Content | Semantics | Why |
|---|---|---|
| **Conditions well** | A real `<table>` with `<th scope="row">` and an accessible name | Two-dimensional labelled data. A grid of divs loses the label-value association entirely |
| **Testing summary strip** | A `<dl>` | Four labelled values, not tabular data |
| **Observations** | An **ordered list** | They happened in sequence, and the sequence is meaning |
| **Method stages** | An **ordered list** | The protocol has an order |
| Strengths / limitations / suitability | Unordered lists | No inherent order |
| Deliverables | A list, or a table where each has a quantity | |
| **Disclosure band** | A `<section>` with an accessible name | Not a heading, not an alert. It is a standing statement, not an event |
| **Method boundary** | A `<section>` with an accessible name | **Never `<details>`** |
| Update log | A list of `<time datetime>` + note | |
| Brand claim | `<blockquote>` with **visible** attribution | |
| Breadcrumb | `<nav>` + ordered list; current item not a link | |
| **Nothing on the site** | `<details>` / `<summary>` for content | The one permitted use is the no-JS mobile menu mechanism, which is a control, not content |

**There are no ARIA live regions on the site except two:** the contact form's error summary and the
search results count (deferred). Everything else is static content, which is announced when it is
reached.

---

## 10. Colour independence — the three voices

**The most important accessibility case on the site**, because the site's whole argument depends on a
reader being able to tell a brand claim from an observation from a verdict.

| Signal | CLAIM | OBSERVATION | VERDICT |
|---|---|---|---|
| **1. Text label** | `CLAIMED BY THE BRAND` | aspect label + timestamp | `THE VERDICT` |
| **2. Semantics** | `<blockquote>` + attribution | ordered list item | `h2` + prose |
| **3. Typeface** | Text 400 | Text + Mono | **Serif** |
| **4. Rule style** | **dotted** | **solid** mineral | **solid 2px** clay |
| **5. Size / volume** | 16px, quietest | 18px, primary | 40px, loudest |
| 6. Colour | muted | ivory + mineral | ivory |

**Six signals. Colour is the sixth, and it is the only one that disappears in greyscale, under
colour-vision deficiency, or in forced-colors mode.**

| Condition | What survives |
|---|---|
| Greyscale | Label, semantics, typeface, rule style, size — **five of six** |
| Deuteranopia / protanopia | All six (the palette is not red/green dependent) |
| **`forced-colors: active`** | Label, semantics, typeface, **rule style**, size. Surface values and the paper grain collapse and **nothing is lost, because no information lives in surface value or texture** |
| Screen reader | Label and semantics — **and they are sufficient on their own** |
| 5% zoom-out glance | Rule style and volume |

**This is why rule *style* rather than rule *colour* carries the meaning.** A dotted line survives a
forced palette; a mineral-coloured line does not. That was not a coincidence in Phase 2 and it must
not be "simplified" in Phase 4.

### Other colour-independent distinctions

| Distinction | Colour | Second signal | Third |
|---|---|---|---|
| Method stage applied / not | mineral | **filled vs hollow square** | accessible name states it in words |
| Disclosure severity | rule colour | **explicit text label** | band padding, statement text |
| Link in prose | clay | **underline, always present** | |
| Active nav item | clay | weight change | rule beneath |
| Active facet chip | clay | **filled mineral square** | `aria-current` |
| Form error | error red | **icon + text** | border change, `aria-describedby` |
| Focus | clay | 2px ring + 2px offset | |

---

## 11. Language and direction

Materially important on a bilingual site, and frequently missed.

| Requirement | |
|---|---|
| `lang` and `dir` on `<html>` | `en`/`ltr`, `ar`/`rtl` |
| **Language switcher links carry `hreflang` AND `lang`** | So a screen reader announces "العربية" in Arabic rather than mispronouncing it in English |
| **Every Latin run inside Arabic carries `lang` as well as isolation** | `<bdi lang="en">Voile Lumière Skin Tint</bdi>` — so it is announced in the right voice rather than spelled out |
| **Numeric runs use `<bdi dir="ltr">` around the numerals only** | Measured: a bare `<bdi>` around a numeral-plus-Arabic-unit run reverses the range |
| Mirroring | **CSS logical properties only.** No second stylesheet, no hard-coded `left`/`right` |
| RTL tab order | Follows visual order |
| Directional icons mirror | Chevron, arrow, external, play. **Menu, close and the mineral square do not** |
| Dates and numbers | Formatted per locale, not translated |

### The Arabic screen-reader pass

**Not optional, and not yet done.** It is the check most likely to be skipped and most likely to find
real defects, because bidi isolation and `lang` attributes are invisible until something reads them
aloud.

What to test, in priority order:

1. A review page's observation sequence — does `الساعة 6` read as "hour six"?
2. A product name inside Arabic prose — is it announced as a name or spelled letter by letter?
3. The conditions well — are label and value associated?
4. The disclosure band — is it reached before the hero?
5. The margin index at mobile — is the marker announced with its observation?
6. The language switcher — is "العربية" announced in Arabic?

---

## 12. Motion and reduced motion

`prefers-reduced-motion: reduce` is honoured at the **token level**, so it cannot be forgotten per
component.

```
durations                 → 0ms   (focus stays instant at 100ms)
transforms                → removed
staggers                  → removed
scroll-triggered entrance → content simply present
smooth anchor scroll      → instant jump
hover image scale         → removed
observation rule draw     → removed
sticky header             → RETAINED (position, not animation)
```

**Nothing is lost.** No information, affordance or wayfinding depends on movement — which is why the
reduced-motion site is *stiller*, not degraded.

Also: no element flashes more than three times per second; no auto-playing motion; no carousel that
advances on its own; `prefers-reduced-data` drops the paper grain and non-essential decode fades.

---

## 13. Forced colors / Windows High Contrast

Used by a real population, and it breaks "premium" designs routinely.

| Requirement | |
|---|---|
| Colour overridden by the user's palette | Expected; must remain usable |
| **No information carried by surface value or texture** | The four ground levels and the paper grain all collapse — **and nothing is lost**, because meaning lives in type, rules and labels |
| Icons | `currentColor` stroke construction survives. Filled or multi-tone would not |
| Focus | Uses the system highlight colour |
| Hairlines | Become system-coloured; **the dotted-vs-solid distinction survives** |
| Testing | `forced-colors: active` explicitly tested per template, not assumed |

---

## 14. Per-component accessibility summary

| Component | The one thing that must not be got wrong |
|---|---|
| Margin index | `<aside>` role retained when it moves inline; markers are real text |
| Plate | `alt` carries the evidence, and does not duplicate the caption |
| Claim | Visible attribution; `<blockquote>`; label not colour |
| Observation | Ordered list; static; timestamp announced with its note |
| Verdict | `h2` despite being the largest text |
| Disclosure band | Present at first paint; text label per state; never collapsible |
| Conditions well | Real `<table>` with `<th scope="row">` |
| Global header | Trigger is a `<button>` with `aria-expanded`; focus returns on close |
| Locale switcher | `lang` + `hreflang` on both links |
| Language availability | Plain text in the flow, **not a live region** |
| Breadcrumb | Current item is not a link; never names a nonexistent page |
| Method stage | `doesNotProve` in reading order right after the evidence |
| Method boundary | Never `<details>` |
| Stage markers | Applied/not-applied stated in the accessible name |
| Related content | One focusable link per item with a complete accessible name |
| Index entry | Ring surrounds the whole block |
| Facet group | Links with `aria-current`, not a listbox |
| Contact form | Labels always visible; error summary focused on submit |
| Empty state | Not a live region unless it results from an action on the same page |
| Footer | `<nav>` name distinct from the primary nav |
| Skip link | First in tab order, visible on focus |

---

## 15. Verification plan for Phases 4–5

| Check | When | How | Status |
|---|---|---|---|
| Contrast | **Done** | `tools/check-contrast.mjs` — 24 pairs | **PASS** |
| Arabic tracking, size floors, overflow | **Done** | `docs/proofs/type-proof.html` → `__proof()` | **PASS** |
| Automated audit | Every PR | axe-core in component tests, Lighthouse a11y in CI | Not started |
| Keyboard walkthrough | Per template | Manual, **LTR and RTL** | Not started |
| Screen reader | Review page, contact form | NVDA + Firefox, VoiceOver + Safari | Not started |
| **Arabic screen reader** | Review page | An Arabic-speaking tester. **Not optional** | **Not started** |
| 200% zoom + reflow | Per template | Manual at 320 and 1280 | Not started |
| Text-spacing override | Per template | Bookmarklet | Not started |
| Forced colors | Per template | Windows High Contrast | Not started |
| Reduced motion | Site-wide | OS setting | Not started |

---

## 16. Accessibility decisions taken deliberately

Listed so nobody later "improves" them away. The first ten are inherited from Phase 2; the last five
are new in Phase 3.

1. Text is ivory `#F2EDE3`, not pure white — 16.28:1 rather than 21:1, above AAA and materially more
   comfortable over 1,500 words.
2. No weights below 400.
3. Muted text is `#9A9184` at 6.11:1, not the ~3.5:1 grey most premium sites use.
4. Underlines are never removed from links in prose.
5. No glassmorphism — a contrast ratio over a shifting backdrop **cannot be measured**.
6. No text over the hero, which removes the need for a scrim and a guessed ratio.
7. The margin index collapses inline on mobile rather than hiding.
8. The disclosure statement is never truncated or collapsed at any width.
9. No before/after slider; side-by-side plates instead.
10. The evidence layer is fully static.
11. **NEW — heading level never follows visual size.** The verdict is the largest text on the page
    and is an `h2`; the homepage statement is an `h1` while the name is not a heading.
12. **NEW — the margin index keeps its `<aside>` role when it moves inline**, so its relationship to
    the observations survives the breakpoint.
13. **NEW — no `<details>` anywhere in content.** The Method's limits, the observations and the
    disclosure are the three things most likely to be "tidied" into a disclosure widget, and each is
    the thing the page exists to show.
14. **NEW — the user's text-spacing override is honoured even though it damages Arabic
    letterforms.** WCAG 1.4.12 is not negotiable against typography.
15. **NEW — the facet group is navigation, not a form control.** Links with `aria-current` rather
    than a listbox, so it works without JavaScript and is crawlable.
