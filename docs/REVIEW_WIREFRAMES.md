# Review Page Wireframes

**Status:** Phase 3 decision. **Designed first, before the homepage, per the brief.**

**Inputs:** `docs/REVIEW_PAGE_ARCHITECTURE.md` (Phase 1 — *what* is on the page),
`docs/REVIEW_ART_DIRECTION.md` (Phase 2 — *how it looks*).
**This document:** *how it works* — structure, reading order, behaviour, degradation.

**Implementation-neutral.** No CSS, no component code, no framework assumptions. Widths and
alignments are stated because they are architectural, not because they are styles.

---

## 0. How to read these wireframes

```
[SECTION NAME]                     a block
  ├ content item                   what is in it
  │                                
  ═══════════                      full-bleed (breaks the grid)
  ─────────                        hairline rule
  ▪                                mineral square marker
  ┊                                dotted rule (claim)
  ┃                                solid mineral rule (observation sequence)
  ━━                               2px clay rule (verdict, once per page)
```

Each section below carries the same twelve fields, in the same order, so two sections can be
compared without hunting: **purpose · content · hierarchy · width · alignment · reading order ·
interaction · desktop · tablet · mobile · Arabic · accessibility · empty/partial**.

---

## 1. DESKTOP 1440 — full page

Content capped at 1180px. Three zones: margin index 160px · text column 620px · air.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [SKIP LINK]  (visible on focus, first in tab order)                          │
╞══════════════════════════════════════════════════════════════════════════════╡
│ [GLOBAL HEADER]  Zina Almokri    Reviews Method Journal Work About  [Collab] EN/ع │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│         [BREADCRUMB]  Home / Reviews / Voile Lumiere Skin Tint               │
│                                                                              │
│         [PRODUCT IDENTITY]  Maison Eclat · Foundation · Skin tint            │
│                                                                              │
│         [TITLE]                                                              │
│         Maison Eclat Voile Lumiere Skin Tint          ← display.lg 56px      │
│         Eight hours in 38 degree heat, tested four times   ← display.sm      │
│                                                                              │
╞══════════════════════════════════════════════════════════════════════════════╡
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2px clay (severity) ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ [DISCLOSURE BAND]  full-bleed · ground.raised · paper grain 3%               │
│   PAID PARTNERSHIP                                                           │
│   Maison Eclat paid for a launch campaign that included this product. The    │
│   brand had no approval over this review, did not see it before publication, │
│   and the verdict was not agreed in advance.                                 │
╞══════════════════════════════════════════════════════════════════════════════╡
│ [HERO]  full-bleed · 16:10 · NO TEXT OVER IT · LCP · eager · no animation    │
│                                                                              │
│         caption below, body.sm secondary                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  ──────────────────────────────────────────────────────────────────────      │
│  [TESTING SUMMARY STRIP]   index + text column · record density              │
│   WEAR WINDOW    TIMES TESTED    SHADE            BASELINE                    │
│   8 hours        4               22W Amber Warm   Photographed                │
│  ──────────────────────────────────────────────────────────────────────      │
│                                                                              │
│  ┌─index──┐ ┌──────── text column 620px ────────┐ ┌──── air ────┐            │
│  │        │ │ [INTRODUCTION]  body.lg 21px      │ │             │            │
│  │        │ │ Maison Eclat paid for the launch  │ │             │            │
│  │        │ │ campaign this product appeared…   │ │             │            │
│  │        │ └───────────────────────────────────┘ │             │            │
│  │        │                                                                  │
│  │        │ [TESTING CONTEXT]  prose, body.md                                │
│  │        │                                                                  │
│  │ ┌────── [CONDITIONS WELL] ── index + text column · ground.inset ───────┐  │
│  │ │  Temperature                                         34–38 °C        │  │
│  │ │  ────────────────────────────────────────────────────────────────    │  │
│  │ │  Humidity                                            58–71 %         │  │
│  │ │  ────────────────────────────────────────────────────────────────    │  │
│  │ │  Environment                    Mixed outdoor and air-conditioned    │  │
│  │ │  ────────────────────────────────────────────────────────────────    │  │
│  │ │  Activity              Moderate, 40 min walking outdoors             │  │
│  │ └──────────────────────────────────────────────────────────────────────┘  │
│  │        │                                                                  │
│  │        │ ──────────────────────────────────────────                       │
│  │        │ [METHOD STAGES APPLIED]                                          │
│  │        │ ▪ Baseline  ▪ Application  ▪ Wear window                         │
│  │        │ ▪ Conditions  ▪ Comparison  ▫ Revisit ← hollow = not applied     │
│  │        │ each links to /method/#{stage}                                   │
│  │        │                                                                  │
│  │ Hour 0 │ ┃ [OBSERVATIONS]  ordered list                                   │
│  │ Applic.│ ┃ Very thin consistency. Two pumps covered the full face…        │
│  │      ▪ │ ┃                                                                │
│  │ Hour 0 │ ┃ 22W ran roughly half a shade light on first application…       │
│  │ Shade  │ ┃                                                                │
│  │      ▪ │ ┃                                                                │
│  │ Hour 3 │ ┃ No visible separation. Slight shine through the centre…        │
│  │ Wear ▪ │ ┃                                                                │
│  │ Hour 6 │ ┃ First visible change. Product began to lift around the nose…   │
│  │ Wear ▪ │ ┃                                                                │
│  │ Hour 8 │ ┃ Noticeable patchiness across the centre of the face…           │
│  │ Wear ▪ │ ┃                                                                │
│  │ Hour 8 │ ┃ Removed completely with a single cleanse…                      │
│  │ Remov▪ │ ┃                                                                │
│  └────────┘ └──────────────────────────────────────────────────────────────┘ │
╞══════════════════════════════════════════════════════════════════════════════╡
│ [EVIDENCE PLATES]  full-bleed single 3:2, or paired 1:1 edge to edge          │
│  ┌───────────────────────────┐ ┌───────────────────────────┐                 │
│  │      Plate 02             │ │      Plate 03             │  2px gap         │
│  └───────────────────────────┘ └───────────────────────────┘                 │
│  Plate 02                        Plate 03                                    │
│  Hour six, lifting at the nose.   Hour eight, patchiness through the centre.  │
│  ─────────────────────────────    ─────────────────────────────────────      │
├──────────────────────────────────────────────────────────────────────────────┤
│  ────────────────────────          ────────────────────────                  │
│  [STRENGTHS]                       [LIMITATIONS]     ← IDENTICAL treatment    │
│  ▪ Colour stayed stable…           ▪ Breaks down between hours six and eight │
│  ▪ Genuinely undetectable finish   ▪ 90 second blending window is unforgiving│
│  ▪ Undertone-family shade system   ▪ Coverage will not satisfy medium/full   │
│  ▪ One cleanse removes it          ▪ Price hard to justify against wear      │
│                                                                              │
│  ┌─[SUITABILITY]── ground.raised · 40px padding · hairline border ─────────┐ │
│  │  SUITS WELL                      MAY NOT SUIT                           │ │
│  │  ▪ Anyone who wants their own…   ▪ Full days outdoors in heat…          │ │
│  │  ▪ Air-conditioned days…         ▪ Anyone who needs medium/full…        │ │
│  └──────────────────────────────────────────────────────────────────────────┘│
╞══════════════════════════════════════════════════════════════════════════════╡
│ ━━━━━━━━━━━━━━━━━━━━━━ 2px clay — the only one on the page ━━━━━━━━━━━━━━━━━ │
│ [VERDICT]  full-bleed band · ground.raised · 96px above, 64px below          │
│   THE VERDICT                                                                │
│   A beautiful six-hour product being sold as a twelve-hour one.  ← 40px serif│
│   Best for: sheer, skin-like coverage in controlled conditions               │
│   Would repurchase: yes, for short days only                                 │
╞══════════════════════════════════════════════════════════════════════════════╡
│  [CONCLUSION]  text column, editorial density                                │
│                                                                              │
│  ──────────────────────────                                                  │
│  [UPDATE LOG]   2026-08-21  Re-tested after the shade range expanded…        │
│                                                                              │
│  ──────────────────────────                                                  │
│  [PRODUCT DETAILS]     Shades 34 · 30ml · Price tier ·  Official site ↗      │
│    ┊ CLAIMED BY THE BRAND                                                    │
│    ┊ "Up to 12 hours of comfortable, transfer-resistant wear."               │
│    ┊ ← dotted rule, recessed, indented 24px, quietest text on the page       │
│                                                                              │
│         ↕ 128px — the largest gap on the page                                │
│  ┌─[RELATED]── ground.raised · hairline top · 3-up ────────────────────────┐ │
│  │  RELATED REVIEWS        FROM THE JOURNAL        RELATED WORK            │ │
│  │  Sitara Concealer       How to evaluate…        Voile Lumiere launch    │ │
│  │  Verdure Cloud Balm     Understanding finish…                           │ │
│  └──────────────────────────────────────────────────────────────────────────┘│
│  [CTA]  Read how these products are tested →   (text link, not a button)     │
├──────────────────────────────────────────────────────────────────────────────┤
│ [FOOTER]  Content · Professional · Standards · social · switcher              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. TABLET 768 — what actually changes

Not a narrower desktop. Two structural changes and one composition change.

```
┌────────────────────────────────────────────────┐
│ [HEADER — CONDENSED]  Zina Almokri   [☰]      │  ← desktop header needs 753px
│                                                │    intrinsic (measured); it does
├────────────────────────────────────────────────┤    not exist below 1024
│   [BREADCRUMB]                                 │
│   [PRODUCT IDENTITY]                           │
│   [TITLE]  display.lg 40px                     │
╞════════════════════════════════════════════════╡
│ [DISCLOSURE BAND]  full-bleed, 32px padding    │
╞════════════════════════════════════════════════╡
│ [HERO]  3:2 crop (not 16:10, not 4:5)          │
├────────────────────────────────────────────────┤
│ ────────────────────────────────────────       │
│ [SUMMARY STRIP]  2×2 grid                      │
│  WEAR WINDOW      TIMES TESTED                 │
│  8 hours          4                            │
│  SHADE            BASELINE                     │
│  22W Amber Warm   Photographed                 │
│ ────────────────────────────────────────       │
│                                                │
│ [INTRODUCTION]  single column, 48px margins    │
│                                                │
│ [CONDITIONS WELL]  two columns, aligned        │
│                                                │
│ [METHOD STAGES]  wraps to two rows             │
│                                                │
│ ── MARGIN INDEX IS INLINE HERE ──              │
│ Hour 6 · Wear                    ← marker row  │
│ ┃ First visible change. Product began to lift  │
│ ┃ around the nose and the chin…                │
│                                                │
│ Hour 8 · Wear                                  │
│ ┃ Noticeable patchiness across the centre…     │
╞════════════════════════════════════════════════╡
│ [PLATES]  single column, stacked, still 3:2    │
╞════════════════════════════════════════════════╡
│ [STRENGTHS]        [LIMITATIONS]  ← TWO COLUMNS│
│ ▪ …                ▪ …             appear here │
│                                                │
│ [SUITABILITY]  two columns                     │
╞════════════════════════════════════════════════╡
│ [VERDICT]  full-bleed, 34px                    │
╞════════════════════════════════════════════════╡
│ [CONCLUSION] [UPDATE LOG] [DETAILS + CLAIM]    │
│ [RELATED]  two-up                              │
└────────────────────────────────────────────────┘
```

**The three changes at 768:**

1. **The margin index is inline**, not present as a column. Marker rows sit above each observation.
   It has not been hidden — the hour markers are part of the record.
2. **Strengths / limitations and suitability become two columns.** This is the *only* breakpoint
   where two-column blocks appear without the margin index; it is why 768 is a real threshold rather
   than an interpolation.
3. **Hero re-crops to 3:2** via `<picture>` — a genuine art-directed crop, not a scaled 16:10.

Section rhythm compresses 96px → 72px.

---

## 3. MOBILE 375 — the design origin

Designed here first, expanded upward. Full-bleed elements stay full-bleed; text keeps 20px margins.

```
┌──────────────────────────────┐
│ Zina Almokri            [☰] │  ← 44px targets, CTA affordance, switcher in menu
├──────────────────────────────┤
│ Home / … / Voile Lumiere     │  ← middle segment truncates, never wraps to 2 lines
│                              │
│ Maison Eclat · Foundation    │
│                              │
│ Maison Eclat Voile           │  ← display.lg floors at 34px
│ Lumiere Skin Tint            │
│ Eight hours in 38 degree     │  ← subtitle 22px
│ heat, tested four times      │
╞══════════════════════════════╡
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ PAID PARTNERSHIP             │
│ Maison Eclat paid for a      │  ← STATEMENT ALWAYS FULLY VISIBLE
│ launch campaign that         │    never truncated, never "read more",
│ included this product. The   │    never collapsed. At any width.
│ brand had no approval over   │
│ this review, did not see it  │
│ before publication, and the  │
│ verdict was not agreed in    │
│ advance.                     │
╞══════════════════════════════╡
│ [HERO]  4:5 crop             │  ← taller crop, smaller file than desktop
│                              │
│ caption                      │
├──────────────────────────────┤
│ ──────────────────────────   │
│ WEAR WINDOW    TIMES TESTED  │  ← 2×2; stacks to 1 column below 375
│ 8 hours        4             │
│ SHADE          BASELINE      │
│ 22W Amber…     Photographed  │
│ ──────────────────────────   │
│                              │
│ [INTRODUCTION]  19px         │
│                              │
│ [CONDITIONS WELL]            │
│  Temperature      34–38 °C   │  ← label/value rows, values to inline end
│  ────────────────────────    │    prose values WRAP (measured fix, see
│  Humidity         58–71 %    │    PHASE_3_BILINGUAL_TYPE_PROOF §6)
│  ────────────────────────    │
│  Environment                 │
│           Mixed outdoor and  │
│           air-conditioned    │
│                              │
│ [METHOD STAGES]              │
│ ▪ Baseline                   │
│ ▪ Application                │
│ ▪ Wear window …              │
│                              │
│ Hour 6 · Wear                │  ← INLINE MARKER ROW — the index, collapsed
│ ┃ First visible change.      │
│ ┃ Product began to lift      │
│ ┃ around the nose and the    │
│ ┃ chin on all four tests.    │
│                              │
│ Hour 8 · Wear                │
│ ┃ Noticeable patchiness…     │
╞══════════════════════════════╡
│ [PLATE 02]  3:2 — UNCHANGED  │  ← evidence never re-crops
│ Plate 02                     │
│ Hour six, lifting at nose    │
│ ─────────────────────────    │
│ [PLATE 03]  3:2              │
╞══════════════════════════════╡
│ STRENGTHS   ← strengths FIRST│
│ ▪ Colour stayed stable…      │
│ LIMITATIONS ← identical type │
│ ▪ Breaks down between…       │
│                              │
│ [SUITABILITY]  stacked       │
╞══════════════════════════════╡
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ THE VERDICT                  │
│ A beautiful six-hour         │  ← 28px
│ product being sold as a      │
│ twelve-hour one.             │
╞══════════════════════════════╡
│ [CONCLUSION]                 │
│ [UPDATE LOG]                 │
│ [DETAILS]  label/value rows  │
│  ┊ CLAIMED BY THE BRAND      │
│  ┊ "Up to 12 hours…"         │
│                              │
│ [RELATED]  stacked, large    │
│            tap areas         │
│ [CTA]                        │
├──────────────────────────────┤
│ [FOOTER]                     │
└──────────────────────────────┘
```

**Mobile is not a compressed desktop.** Section rhythm 56px. Display floors 34px, body 17px, mono
13px. Touch targets ≥44px. **DOM order is identical to desktop** — no section is reordered by
breakpoint, because a shared URL must show the same thing to everyone and because reordering breaks
the correspondence between the visual order and the screen-reader order.

---

## 4. Section specifications

Every section, twelve fields each. Sections 8–11 are **the report**; if a design pass ever compresses
the page, those four survive intact.

---

### 1 · Global header

| | |
|---|---|
| **Purpose** | Persistent wayfinding and locale control. Not part of the review |
| **Content** | Wordmark · 5 primary items · Collaborate CTA · language switcher |
| **Hierarchy** | Lowest on the page. The wordmark is subordinate to the review title |
| **Width** | Full width, content to 1180px |
| **Alignment** | Wordmark inline-start; nav and controls inline-end |
| **Reading order** | Skip link → wordmark → nav → CTA → switcher → main |
| **Interaction** | Reveal on scroll up, hide on scroll down. Never permanently sticky |
| **Desktop** | Full set visible; needs **753px intrinsic in English, 686px in Arabic** (measured) |
| **Tablet** | Condensed: wordmark, CTA affordance, menu trigger |
| **Mobile** | Same as tablet. Full-screen overlay on open |
| **Arabic** | Whole header mirrors. Height reserved for the Arabic line box (**88px**, vs 82px English) in *both* locales so the header does not change height on language switch |
| **Accessibility** | `<nav>` with an accessible name; `aria-current="page"`; menu trigger is a real `<button>` with `aria-expanded`/`aria-controls`; focus returns to trigger on close; sticky header must not obscure a focused element (`scroll-margin-top` on anchors) |
| **Empty/partial** | If a section index has no content in this locale, its nav item is removed — not disabled |

---

### 2 · Breadcrumb

| | |
|---|---|
| **Purpose** | Position in the hierarchy, and the second exit upward |
| **Content** | `Home / Reviews / {title}` — mirrors the URL exactly |
| **Hierarchy** | Lowest text weight on the page |
| **Width** | Text column |
| **Alignment** | Inline-start |
| **Reading order** | First element in `<main>` |
| **Interaction** | Links only |
| **Desktop** | Full path |
| **Tablet** | Full path |
| **Mobile** | Middle segment truncates with an ellipsis. **Never wraps to two lines** |
| **Arabic** | Mirrors. Chevron separators mirror; a middle-dot separator does not |
| **Accessibility** | `<nav aria-label="Breadcrumb">` + ordered list; current page is the last item and is not a link; drives `BreadcrumbList` |
| **Empty/partial** | **A breadcrumb never names a page that does not exist.** No category segment until category routes are built |

---

### 3 · Product identity

| | |
|---|---|
| **Purpose** | Name the thing being reviewed before naming the review |
| **Content** | Brand · category · product type. Shade tested appears in the summary strip, not here |
| **Hierarchy** | Low — a label, not a headline |
| **Width** | Text column |
| **Alignment** | Inline-start, ` · ` separated |
| **Reading order** | Before the `h1`, so a screen reader announces the subject before the title |
| **Interaction** | Brand links **only if the gate passes in this locale**; otherwise plain text or a link to `/reviews/?brand={slug}` |
| **Desktop** | One line |
| **Tablet** | One line |
| **Mobile** | Wraps to two lines |
| **Arabic** | Brand name stays Latin, `<bdi lang="en">`-isolated |
| **Accessibility** | Not a heading. Latin runs carry `lang` so they are pronounced correctly |
| **Empty/partial** | Gated brand → no link, and **no indication that a page was withheld** |

---

### 4 · Title and subtitle

| | |
|---|---|
| **Purpose** | Name the review and state the test in one line |
| **Content** | `title` (product name, no marketing) + `subtitle` (the test: *"Eight hours in 38 degree heat, tested four times"*) |
| **Hierarchy** | **Highest text weight on the page** |
| **Width** | Text column; may extend into the air column |
| **Alignment** | Inline-start. **Never centred** — centred display type reads as a poster, not a publication |
| **Reading order** | The single `h1` |
| **Interaction** | None |
| **Desktop** | 56px / 30px |
| **Tablet** | 40px / 25px |
| **Mobile** | 34px floor / 22px |
| **Arabic** | ×1.12 size, ×1.18 leading. Long Arabic titles wrap to 4 lines at 1440 in the measured proof and do not overflow at 320 |
| **Accessibility** | Exactly one `h1`. The subtitle is a `<p>`, not an `h2` — heading level follows structure, never visual size |
| **Empty/partial** | Both required by the content model. No empty state exists |

---

### 5 · Disclosure band

| | |
|---|---|
| **Purpose** | State the commercial relationship **before** the reader sees anything persuasive |
| **Content** | `disclosureLabel` + **full `disclosureStatement`** + `additional[]` modifiers as a second line |
| **Hierarchy** | **High — deliberately interrupts.** Prominence scales with commercial entanglement |
| **Width** | **Full-bleed** |
| **Alignment** | Label and rule at inline start |
| **Reading order** | **Above the hero.** Position is `above-content` and is not configurable |
| **Interaction** | **None.** Not expandable, not dismissible, not a toggle, not a tooltip |
| **Desktop** | 40px padding; top rule 1px → 2px by severity |
| **Tablet** | 32px padding |
| **Mobile** | 20px padding. **Statement always fully visible** — never truncated, never "read more", at any width down to 320 |
| **Arabic** | Rule and label at inline start; mirrors |
| **Accessibility** | `<section>` with an accessible name (e.g. "Disclosure"), not a heading. Present at **first paint** — never revealed by script. Six states distinguished by an explicit **text label**, never by rule colour alone |
| **Empty/partial** | **No empty state exists.** Every review has a disclosure; `unknown-pending-verification` is a *state* with a warning treatment, and cannot reach published status |

Six states, from `DisclosureType`:

```
independently-purchased  hairline rule, muted label      quietest
editorial                hairline rule, muted label      quietest
gifted                   mineral rule, mineral label
sponsored                clay rule, clay label, +8px padding
paid-collaboration       2px CLAY rule, clay label, +16px padding    loudest
unknown-pending-verif.   warning rule + label            cannot publish
```

---

### 6 · Hero

| | |
|---|---|
| **Purpose** | One image, held large and still. Establishes register |
| **Content** | `media.hero` + caption |
| **Hierarchy** | Highest *visual* weight |
| **Width** | Full-bleed |
| **Alignment** | Caption inline-start, below |
| **Reading order** | After the disclosure |
| **Interaction** | **None.** No lightbox, no zoom, no parallax |
| **Desktop** | 16:10 |
| **Tablet** | 3:2 |
| **Mobile** | 4:5 — a real art-directed crop via `<picture>`, a genuinely smaller file |
| **Arabic** | Identical; caption inline-start |
| **Accessibility** | Meaningful `alt` describing the subject. `width`/`height` required by the type system → CLS structurally prevented. **No text over the hero** — which removes the need for a scrim and a guessed contrast ratio |
| **Empty/partial** | Missing image → aspect-ratio box reserves the space, filled flat `ground.raised`. No icon, no "image unavailable" glyph. **Caption still renders.** No photography at all → neutral tone field at the correct ratio, plate treatment intact |

---

### 7 · Testing summary strip

| | |
|---|---|
| **Purpose** | Prove in two seconds that this is a record, not an opinion |
| **Content** | Four values: wear window · times tested · shade · baseline photographed |
| **Hierarchy** | Medium — **the first record-density block** |
| **Width** | Index + text column |
| **Alignment** | Labels above values; values tabular |
| **Reading order** | After the hero, before the introduction |
| **Interaction** | None |
| **Desktop** | Four across, hairline above and below |
| **Tablet** | 2×2 |
| **Mobile** | 2×2, stacking to one column below 375 |
| **Arabic** | Labels in Plex Sans Arabic; numerals mono and isolated with `dir="ltr"` on the numeric run only |
| **Accessibility** | A definition list (`<dl>`), not a table — four labelled values are not tabular data |
| **Empty/partial** | `shadeUsed: null` → the shade cell is **removed**, and the strip becomes three values. `durationKnown: false` → wear window reads the recorded value, never "unknown" as a fabricated string |

---

### 8 · Introduction

| | |
|---|---|
| **Purpose** | Why this test, and what was at stake |
| **Content** | `introduction` |
| **Hierarchy** | High — the first sustained reading moment |
| **Width** | Text column, 62–68 characters |
| **Alignment** | Inline-start |
| **Reading order** | After the summary strip |
| **Interaction** | Inline links only |
| **Desktop** | `body.lg` 21px — one step larger than the body that follows, which signals *start here* without a drop cap |
| **Tablet** | 20px |
| **Mobile** | 19px |
| **Arabic** | 23.5px / 1.91 effective |
| **Accessibility** | Plain prose. The measure is a maximum, not a fixed width, so text reflows rather than truncates at 200% zoom |
| **Empty/partial** | Required |

---

### 9 · Testing context and conditions well

**The section no competitor has.** It is the differentiator, made visible.

| | |
|---|---|
| **Purpose** | Publish the environment the test happened in, so a long-wear claim can be checked |
| **Content** | `testingContext` + `applicationContext` prose, then `conditions[]` as a printed table |
| **Hierarchy** | Medium-high. **Record density** |
| **Width** | Well spans index + text column |
| **Alignment** | Label column inline-start; values to inline end so numerals form a column |
| **Reading order** | Prose, then table |
| **Interaction** | **None.** Not sortable, not filterable, not collapsible |
| **Desktop** | Two columns, hairline row rules, **no outer border, no cell borders, no zebra striping** |
| **Tablet** | Two columns |
| **Mobile** | Label/value rows, values to inline end. **Prose values wrap; only the numeric run is `nowrap`** — measured fix, see `docs/PHASE_3_BILINGUAL_TYPE_PROOF.md` §6 |
| **Arabic** | The highest-risk component in the system: Arabic labels, Latin numerals, aligned columns, mirrored layout, all at once. **Measured: numeral column alignment holds at all five widths in both directions** |
| **Accessibility** | A real `<table>` with `<th scope="row">`, not a grid of divs. Caption or `aria-label` naming it "Testing conditions" |
| **Empty/partial** | `conditions[]` is required and non-empty — validator-enforced. **No empty state exists** |

---

### 10 · Method stages applied

| | |
|---|---|
| **Purpose** | Show which of the six stages this test ran — including the ones it did not |
| **Content** | Six stage names from `stageOrder`, marked applied / not applied from `testing.methodStageKeys` |
| **Hierarchy** | Medium |
| **Width** | Full text column |
| **Alignment** | Inline-start, wrapping |
| **Reading order** | Between the conditions and the observations — the reader learns the protocol before the evidence |
| **Interaction** | Each stage links to `/method/#{stage}`. **This is the most-repeated internal link on the site** |
| **Desktop** | One or two rows, 32px internal |
| **Tablet** | Two rows |
| **Mobile** | Vertical list |
| **Arabic** | Mirrors; stage names in Arabic, keys internal |
| **Accessibility** | Applied = **filled** mineral square; not applied = **hollow** square at `text.muted`. The distinction is **shape, not colour**. Each item's accessible name states the status in words — "Comparison: not applied in this test" |
| **Empty/partial** | A review that ran four of six stages **says so**. Hiding the difference is forbidden; showing it is more credible |

---

### 11 · Observations

**The core of the page.** The site exists to present this.

| | |
|---|---|
| **Purpose** | The evidence: what happened, when, recorded at the time |
| **Content** | `observations[]` — `at` / `aspect` / `note`. Minimum 3, enforced |
| **Hierarchy** | **Highest weight at body level.** Primary emphasis of the three voices |
| **Width** | Timestamp + aspect in the margin index; note in the text column |
| **Alignment** | Solid mineral rule at the inline-start edge of the note, running the full height of the sequence |
| **Reading order** | Sequential, top to bottom. They happened in order |
| **Interaction** | **None.** Never inside an accordion, never behind a tab, never in a tooltip |
| **Desktop** | Index column carries `Hour 6 / Wear`; note in the text column; 40px between entries |
| **Tablet** | Marker row above each note; mineral rule stays at inline start |
| **Mobile** | Same as tablet |
| **Arabic** | Index and rule move to the **right**. `الساعة` in Plex Sans Arabic, `6` in mono, isolated `dir="ltr"` |
| **Accessibility** | An **ordered list** — sequence is meaning. The whole sequence is static content requiring no JavaScript, which makes the densest part of the page the most robust part |
| **Empty/partial** | Minimum three, enforced by the validator. **No empty state exists.** A long list (6+) stays scannable because the index gives it structure |

---

### 12 · Evidence plates

| | |
|---|---|
| **Purpose** | The photographic record, numbered so prose can refer to it |
| **Content** | `media.evidence[]` (each bound to a `stageKey`, optionally to an `observationIndex`) + `evidenceNotes` |
| **Hierarchy** | High |
| **Width** | Full-bleed for a single plate; index + text column for a pair |
| **Alignment** | Plate number above caption; hairline beneath the caption, full image width |
| **Reading order** | After the observations they evidence |
| **Interaction** | **None.** No lightbox in v1, no slider, no zoom. **Never a before/after slider** — it hides half the evidence at any moment and is unusable by keyboard |
| **Desktop** | Single 3:2 full-bleed, or a 1:1 pair edge to edge with a 2px gap |
| **Tablet** | Single column |
| **Mobile** | Single column. **Ratio unchanged at 3:2** — evidence never re-crops, because comparability is its function |
| **Arabic** | Caption inline-start; plate numbers zero-padded (`لوحة 03`) with the numeral isolated |
| **Accessibility** | `alt` describes **what the frame shows** — *"Hour six, product lifting around the nose"*, never *"review photo"*. The caption is public annotation; the alt is description; **they must not duplicate each other**. A blind reader should be able to follow the sequence from alt and caption alone |
| **Empty/partial** | No plates → **section removed**, `evidenceNotes` prose retained if present. The observation sequence carries the page, which it can |

---

### 13 · Strengths and limitations

| | |
|---|---|
| **Purpose** | The balanced assessment. Both halves, always |
| **Content** | `strengths[]` and `limitations[]`, both required non-empty |
| **Hierarchy** | Medium-high. **Identical between the two** |
| **Width** | Text column; two columns side by side ≥1024 |
| **Alignment** | Inline-start, mineral square markers on both lists |
| **Reading order** | Strengths first, limitations second — in both the DOM and the visual order |
| **Interaction** | None |
| **Desktop** | Two columns, hairline above each |
| **Tablet** | **Two columns** — the change that makes 768 a real threshold |
| **Mobile** | Stacked, strengths first |
| **Arabic** | Mirrors; strengths at inline start |
| **Accessibility** | Two lists with `h2`/`h3` headings. **No ticks, no crosses, no green, no red** — colour-only meaning, and it codes limitations as failures |
| **Empty/partial** | **No empty state exists.** A review missing either cannot publish. *"A review with no limitations has not finished testing"* |

**The non-negotiable:** same type, same size, same colour, same column width. The moment limitations
are quieter than strengths, the page becomes marketing.

---

### 14 · Suitability

| | |
|---|---|
| **Purpose** | Who it suits, and who it does not |
| **Content** | `suitability.suitsWell[]` and `mayNotSuit[]`, both required |
| **Hierarchy** | Medium |
| **Width** | Two columns ≥1024; inside a raised surface |
| **Alignment** | Two equal columns |
| **Reading order** | Suits well, then may not suit |
| **Interaction** | None |
| **Desktop** | `ground.raised`, 40px padding, hairline border |
| **Tablet** | Two columns |
| **Mobile** | Stacked |
| **Arabic** | Mirrors |
| **Accessibility** | Two labelled lists. Entries are **specific situations**, never skin classifications — the content model's own rule |
| **Empty/partial** | **No empty state exists.** Both arrays required |

**The one place a contained surface groups two lists**, because "suits" and "may not suit" belong to
each other. This is one of only three permitted card-like surfaces on the site
(`docs/COMPONENT_INVENTORY.md` §0).

---

### 15 · Verdict

| | |
|---|---|
| **Purpose** | The judgement, owned and marked as opinion |
| **Content** | `verdict.summary` + `bestFor` + `wouldRepurchase` |
| **Hierarchy** | **Loudest block on the page** |
| **Width** | Full-bleed band; text at text-column width |
| **Alignment** | Inline-start |
| **Reading order** | After the assessment, before the conclusion |
| **Interaction** | None |
| **Desktop** | Display **serif** 40px; **solid 2px clay rule above — the only one on the page**; 96px above, 64px below |
| **Tablet** | 34px |
| **Mobile** | 28px, full-bleed retained |
| **Arabic** | ×1.12; rule full width in both directions |
| **Accessibility** | An `h2` despite its size. The label `THE VERDICT` / `الحكم` names it in words, so the distinction from an observation does not depend on the rule or the colour |
| **Empty/partial** | Required. **No score, no stars, no badge, no number** — enforced by the validator |

---

### 16 · Conclusion

| | |
|---|---|
| **Purpose** | Editorial close. May state what the test could not determine |
| **Content** | `conclusion` |
| **Hierarchy** | Medium |
| **Width** | Text column |
| **Alignment** | Inline-start |
| **Reading order** | After the verdict |
| **Interaction** | Inline links |
| **Desktop/Tablet/Mobile** | Editorial density throughout |
| **Arabic** | ×1.12 |
| **Accessibility** | Prose |
| **Empty/partial** | Required. Content stating what a test *could not* determine renders as **content, not as small print** |

---

### 17 · Update log

| | |
|---|---|
| **Purpose** | A dated correction is a trust signal |
| **Content** | `updateLog[]` — `{date, note}` |
| **Hierarchy** | Low but present |
| **Width** | Text column |
| **Alignment** | Date in mono mineral; note in body secondary |
| **Reading order** | After the conclusion |
| **Interaction** | **None. Never behind a toggle** |
| **Desktop/Tablet** | Date and note on one row |
| **Mobile** | Stacked |
| **Arabic** | Dates formatted per locale; numerals isolated |
| **Accessibility** | `<time datetime>` on each date |
| **Empty/partial** | Empty array → **section removed.** No "never updated" line |

---

### 18 · Product details and brand claims

| | |
|---|---|
| **Purpose** | The specification, and the brand's own language — placed last, deliberately |
| **Content** | Shade count · size · price tier · official link · `brandClaims[]` |
| **Hierarchy** | Low. Claims are the **quietest text on the page** |
| **Width** | Text column |
| **Alignment** | Specs as label/value; claims indented 24px with a **dotted** rule at the inline start |
| **Reading order** | **After the verdict.** The brand's language is the last thing on the page, not the first |
| **Interaction** | Official link only, `rel="nofollow"` (+ `sponsored` where a paid relationship exists) |
| **Desktop/Tablet** | Specs in record density |
| **Mobile** | Specs become label/value rows |
| **Arabic** | Product name Latin, isolated; claim label `تدّعي العلامة`, **never tracked** |
| **Accessibility** | The claim is a `<blockquote>` with visible attribution — `CLAIMED BY THE BRAND`. **The label carries the meaning; the dotted rule and the recession are reinforcement.** Survives greyscale and forced-colors, because rule *style* rather than rule *colour* does the work |
| **Empty/partial** | No claims → the claim block is **removed**, specs remain. No official URL → no link, no placeholder |

---

### 19 · Related content and CTA

| | |
|---|---|
| **Purpose** | The exits. Article ends; navigation begins |
| **Content** | 2 related reviews · 2 related journal · 0–1 related work · brand if gated-in · CTA to `/method/` |
| **Hierarchy** | Low-medium |
| **Width** | Full width, 3-up ≥1024 |
| **Alignment** | Index treatment — image, hairline, type |
| **Reading order** | Last, after **128px** — the largest gap on the page, separating article from navigation |
| **Interaction** | Whole block is the link. Image scales 1.02 on hover inside a clipped frame; nothing else moves |
| **Desktop** | Three-up on `ground.raised` with a hairline top |
| **Tablet** | Two-up |
| **Mobile** | Stacked, or horizontal edge-scroll with visible overflow. **Never a carousel with dots** |
| **Arabic** | Mirrors; edge-scroll starts at the right |
| **Accessibility** | Each item is one link with a complete accessible name; the focus ring surrounds the whole block, not the image. Related lists are `<ul>` |
| **Empty/partial** | **Locale-filtered first, then laid out by count** — 0 removes the group, 1 gets full-width treatment, 2 side by side, 3 a grid. A related link never crosses languages silently |

**The CTA is a text link with a clay underline, not a button.** A reading page should not end in a
sales control.

---

### 20 · Footer

| | |
|---|---|
| **Purpose** | Site-wide reachability, and the trust surface |
| **Content** | Three groups — Content · Professional · **Standards** — plus wordmark, one-line bio, verified social links, copyright, switcher |
| **Hierarchy** | Lowest |
| **Width** | Full width, content to 1180px |
| **Alignment** | Groups inline-start |
| **Reading order** | Last |
| **Interaction** | Links only |
| **Desktop** | Three columns |
| **Tablet** | Two columns |
| **Mobile** | Stacked |
| **Arabic** | Mirrors |
| **Accessibility** | `<footer>` landmark; `<nav>` with a distinct accessible name from the primary nav |
| **Empty/partial** | Social row renders **only** verified profiles (`sameAsEligible: true`). Currently none qualify, so the row does not exist — no greyed icons, no placeholder handles |

---

## 5. Information priority

What a reader must have understood by each point, and what they can safely miss.

| Zone | Desktop 1440 | Mobile 375 | The reader must now know |
|---|---|---|---|
| **Above the fold** | Breadcrumb, identity, title, subtitle, **disclosure band**, top of hero | Breadcrumb, identity, title, subtitle, **disclosure band** | What product · what test · **whether money was involved** |
| **First scroll** | Hero, summary strip, introduction | Hero, summary strip | That it was actually tested — four values, two seconds |
| **Second scroll** | Conditions well, method stages, first observations | Introduction, conditions well | **The differentiator: the conditions were published** |
| **Deep reading** | Observations, plates, strengths, limitations, suitability | Same | What happened, and the balanced assessment |
| **End of page** | Verdict, conclusion, update log, details + claims, related | Same | The judgement, and where to go next |

**The test:** a reader who stops after the second scroll should be able to say what was tested, under
what conditions, and whether it was paid for. If they cannot, the page has failed regardless of how
good the prose below is.

---

## 6. What would make this page fail

Inherited from `docs/REVIEW_ART_DIRECTION.md` §6, extended with the UX failures Phase 3 can now name:

| Failure | Detectable by |
|---|---|
| A rating, score, star or badge anywhere | Validator (data), review (design) |
| Limitations smaller or quieter than strengths | Visual diff |
| Disclosure below the hero, collapsed, or truncated at any width | 320px check |
| Observations inside an accordion or tabs | DOM inspection |
| Conditions well styled as a data grid with borders and zebra striping | Visual review |
| A before/after slider replacing side-by-side plates | Code review |
| Any chart | Code review |
| Rounded cards wrapping the sections | Diff — `border-radius` above 2px |
| Margin index hidden on mobile | Responsive check |
| Text set over the hero | Visual review |
| **The Arabic page reading as a translation** | Native-reader review — **still UNVERIFIED** |
| **A `<bdi>` wrapped around a numeral-plus-Arabic-unit run** | Type-proof re-run (`__proof()` token ordering) |
| **A conditions value cell set `white-space: nowrap`** | 320px overflow check |
| The page requiring JavaScript to read | JS disabled |
| A related block rendering an empty cell where a locale filtered an item out | Count-based layout check |

The last four are new in Phase 3 and each was found by measurement rather than by opinion.
