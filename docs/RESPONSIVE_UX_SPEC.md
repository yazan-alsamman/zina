# Responsive UX Specification

**Status:** Phase 3 decision. Extends `docs/RESPONSIVE_ART_DIRECTION.md` (Phase 2) from visual rules
to **component behaviour**, and incorporates three findings measured in
`docs/PHASE_3_BILINGUAL_TYPE_PROOF.md`.

**The rule this document exists to enforce:** *"stack on mobile"* is not a specification. Every entry
below says what changes **structurally**.

---

## 1. Thresholds

| Token | Width | Represents | What actually changes |
|---|---|---|---|
| `bp.xs` | **320** | Small Android, iPhone SE | Survival floor. Nothing may break. **Measured: this is where the English conditions well failed** |
| — | **375** | **The design origin** | Baseline mobile composition |
| — | 390 / 430 | iPhone 14/15, Pro Max | No structural change; margins and type ease |
| `bp.sm` | 600 | Large phone landscape | Margins grow. Still single column |
| `bp.md` | **768** | Tablet portrait | **Two-column blocks appear.** Header still condensed |
| `bp.lg` | **1024** | Tablet landscape, small laptop | **Full header. Margin index becomes a column.** Three-up grids |
| `bp.xl` | 1280 | Laptop | Full 12-column grid, air column active |
| `bp.2xl` | 1440 | Desktop | Reference composition |
| — | 1920+ | Large desktop | **Content capped at 1180px.** Margins absorb the rest |

**Two thresholds carry real compositional change: 768 and 1024.** Everything else is easing.

### Why 1024 and not 960 — now measured

The full desktop header has a measured intrinsic width of **753px in English and 686px in Arabic**
(`docs/PHASE_3_BILINGUAL_TYPE_PROOF.md` §4). With the 48px tablet margins that requires **849px**
of viewport before it fits without wrapping, and it needs headroom above that to look composed
rather than jammed. **1024 is the first standard breakpoint that clears it comfortably** — the
choice is now evidence-backed rather than conventional.

---

## 2. Component-by-component behaviour

Each row states what changes **structurally**, not that it gets smaller.

### Global structure

| Component | 320–767 | 768–1023 | 1024+ |
|---|---|---|---|
| **Global header** | Wordmark, CTA affordance, menu trigger. Switcher inside the menu | Same as mobile — the condensed header runs to 1023 | **Full: wordmark, 5 items, CTA, switcher.** Reveal on scroll up |
| **Primary nav** | **Full-screen overlay**, items in the lower two-thirds, ≥44px targets, focus trapped, body scroll locked | Same overlay, wider | Inline row |
| **Locale switcher** | Inside the overlay | Inside the overlay | In the header, inline-end |
| **Breadcrumb** | Middle segment truncates; **never two lines** | Full path | Full path |
| **Footer** | Groups stacked | Two columns | Three columns |
| **Skip link** | Present at every width | | |

### Signature devices

| Component | 320–767 | 768–1023 | 1024+ |
|---|---|---|---|
| **Margin index** | **Inline marker row above each entry.** Not hidden | Inline marker row | **160px column at the inline start**, 32px gap |
| **Plate** | Single column, **3:2 unchanged** | Single column, 3:2 | Full-bleed single 3:2, or a 1:1 pair edge to edge with a 2px gap |
| **Claim** | Indent reduces to 16px; dotted rule retained | 24px indent | 24px indent |
| **Observation** | Marker row, then note. Mineral rule stays at inline start | Marker row, then note | Timestamp and aspect in the index; note in the text column |
| **Verdict** | Full-bleed, 28px | Full-bleed, 34px | Full-bleed, 40px, 2px clay rule |
| **Disclosure band** | Full-bleed, 20px padding. **Statement fully visible — measured unclipped at 320 in both scripts** | Full-bleed, 32px | Full-bleed, 40px |
| **Conditions well** | **Label/value rows. Prose values wrap; only the numeric run is `nowrap`** | Two columns | Two columns, numerals aligned |

> **Measured rule — the conditions well.** At 320px with `white-space: nowrap` on the value cell, the
> English table needs 279px inside a 265px well and **overflows**. Wrapping prose values while
> keeping the numeric isolate `nowrap` brings it to 225px and **numeral alignment is preserved**.
> This is the only element in the system that broke at 320, and it broke in **English**, not Arabic.

### Content components

| Component | 320–767 | 768–1023 | 1024+ |
|---|---|---|---|
| **Testing summary strip** | 2×2; **1 column below 375** | 2×2 | Four across |
| **Method stage** | Number as an inline marker row; `observes`/`evidence` stacked | Number inline; **`observes`/`evidence` two columns** | Number in the margin index |
| **Method boundary** | Full-bleed, 20px, never truncated | Full-bleed, 32px | Contained, 40px |
| **Strengths / limitations** | Stacked, **strengths first** | **Two columns** | Two columns |
| **Suitability** | Stacked inside the contained surface | Two columns | Two columns, 40px padding |
| **Product details** | Label/value rows | Two columns | Two columns |
| **Related content** | Stacked, or horizontal edge-scroll **with visible overflow** | Two-up | Three-up |
| **Index entry** | Full-width image, large tap area | Two-up | Three-up |
| **Brand context** | Inline on a review: brand name wraps to its own line. On a brand page: identity stacked above the description | Identity and description side by side | Identity, positioning and description in the text column; reviews three-up |
| **Person block** | Portrait 4:5 full-bleed **above** the bio; bio at `body.lg` full width | Portrait above, bio at 560px | Portrait beside the bio, or above it at full editorial scale; bio in the text column |
| **Partial state** | The count-chosen layout, always single column | The count-chosen layout: 1 → full width, 2 → side by side | The count-chosen layout: 1 → full width, 2 → side by side, 3 → three-up. **A count never scales a grid down** |
| **Facet group** | Horizontal edge-scroll from the inline start, 44px tall | Wraps to two rows | One row |
| **Contact form** | Full width, 44px targets | ~560px | ~640px |
| **Update log** | Date above note | Date and note on one row | Date and note on one row |

### Section rhythm

| | 320–767 | 768–1023 | 1024+ |
|---|---|---|---|
| Between major sections | **56px** | **72px** | **96px** |
| Verdict above | 56px | 72px | 96px |
| Related above | 72px | 96px | **128px** |
| Page margins | 20px | 48px | auto, centred to 1180 |

---

## 3. Template-level composition

### Review page

The single genuinely compositional change is the margin index. Everything else is width.

| | 320–767 | 768–1023 | 1024+ |
|---|---|---|---|
| Grid | Single column, 20px margins | Single column, 48px margins | 12 columns: index + text + air |
| Hero | **4:5** | **3:2** | **16:10** |
| Two-column blocks | Stacked | **Appear** | Two columns |
| Margin index | Inline | Inline | **Column** |

### Homepage

| | 320–767 | 768–1023 | 1024+ |
|---|---|---|---|
| Opening | Statement, Method line, portrait 4:5 full-bleed. **Cap 78vh** | Statement over, portrait under, ~80vh | **Asymmetric side by side**, portrait bleeding to one edge, **~72vh** |
| Featured review | Image, title, conditions, observation, link — stacked | Stacked, wider | Image left, content right |
| Method well | Vertical list with the mineral rule | **3 + 3** | Six across |
| Recent reviews | Stacked | Two-up | Three-up |
| Work | Stacked | Stacked, larger | Alternating image side |
| Journal | Stacked | Two-up | Two-up |
| Close | Full width | Centred 640px | Centred 640px |

> **The mobile requirement, restated as a check:** at 375 × 667 the featured review's disclosure
> label must be reachable **within one swipe** — before 1.0 viewport heights. Phase 2's rule was 1.5.
> If it is not met, reduce the portrait, never the statement.

### Method page

| | 320–767 | 768–1023 | 1024+ |
|---|---|---|---|
| Stage number | Inline marker row | Inline marker row | Margin index column |
| `observes` / `evidence` | Stacked | **Two columns** | Two columns |
| `whatThisCannotTell` | Stacked list | Stacked list | Inset well, two columns |
| Representative reviews | Stacked | Two-up | Three-up |

### Review index

| | 320–767 | 768–1023 | 1024+ |
|---|---|---|---|
| Facets | Edge-scroll row per axis | Wrapped rows | One row per axis |
| Listing | Stacked | Two-up | Three-up |

---

## 4. Type scaling

Display type is fluid between 375 and 1440; body and UI step at breakpoints. **Latin values —
Arabic derives at ×1.12.**

| Token | 375 | 768 | 1024 | 1440 |
|---|---|---|---|---|
| `display.xl` | 34 | 48 | 62 | 76 |
| `display.lg` | 30 | 40 | 48 | 56 |
| `display.md` | 26 | 32 | 36 | 40 |
| `display.sm` | 22 | 25 | 28 | 30 |
| `body.lg` | 19 | 20 | 21 | 21 |
| `body.md` | 17 | 18 | 18 | 18 |
| `body.sm` | 16 | 16 | 16 | 16 |
| `ui.md` | 16 | 16 | 16 | 16 |
| `record.md` | 14 | 15 | 15 | 15 |
| `record.sm` | 13 | 13 | 13 | 13 |
| `label.sm` | 12 | 12 | 12 | 12 |

**Floors hold at every width: body never below 16px, mono never below 13px, nothing below 12px.**
Verified in the type proof at 320, 375, 768, 1024 and 1440 in both scripts — **0 violations**.

**Fluid scaling must use `clamp()` with a `rem`-based preferred value.** A `vw`-only formula breaks
user font-size settings and is an accessibility failure (WCAG 1.4.4).

---

## 5. Arabic at each breakpoint

Arabic is not a variant of the responsive design. It is the same design in the other direction, with
four additions.

| Consideration | Rule | Measured status |
|---|---|---|
| Direction | Whole grid mirrors via **logical properties only**. Index right, air left | ✓ Verified at 1024 and 1440 |
| Size | ×1.12 at every breakpoint | ✓ Ratio measured at exactly 1.120 |
| Leading | ×1.18 — **Arabic pages are visibly longer. Expected and correct** | ✓ Ratio measured at exactly 1.180 |
| Tracking | **0, always, everywhere** | ✓ 0 violations at all five widths |
| Header | Laid out to the **wider of the two measured label sets**, and **height reserved for the Arabic line box in both locales** | ⚠ **Corrected in Phase 3** — see below |
| Line length | Same *column width*, not the same character count | — |
| Mixed runs | Bidi isolation must hold at every width; **wrapping is where it breaks** | ✓ Latin identifiers · ⚠ numeral runs corrected |
| Edge-scroll blocks | Scroll from the right | — |

### The header rule, corrected

Phase 2 instructed: *"the header must be laid out to the Arabic width."* **Measured on the fallback
tier, the English set is wider** — 753px vs 686px — and the Arabic set binds **vertically** (88px
vs 82px), not horizontally.

**Restated rule:** lay the header out to the **wider of the two measured label sets** and check both
at 1024; **reserve header height for the Arabic line box in both locales** so the header does not
change height when the language changes. Re-measure when Zarid is licensed — the inequality may
reverse, and the rule survives either outcome.

### The numeral-isolation rule, corrected

`<bdi>34–38 °م</bdi>` renders the range **reversed** (38–34), because `<bdi>` resolves direction
from the first strong character and that character is the Arabic **م**. Isolate the numeric run
only, with an explicit direction: `<bdi dir="ltr">34–38</bdi> °م`.

**This affects every conditions well, every observation timestamp and every record line in Arabic** —
which is why it is a responsive concern as well as a typographic one: the defect appears wherever a
mixed run wraps.

### The highest-risk Arabic breakpoint

**1024px** — the full header appears with the margin index simultaneously. **Measured: no overflow,
no wrap, index on the correct side, numerals aligned.** It should still be checked first on Zarid.

---

## 6. 320px

Not a courtesy. A real device class in the region, and the width at which a dense review page is
most likely to break.

| Requirement | Status |
|---|---|
| No horizontal scroll, either direction | ✓ once the desktop header is absent below 1024 and the conditions fix is applied |
| Conditions well readable as label/value rows | ✓ **after the measured fix** |
| **Disclosure statement fully visible** — never truncated, never "read more" | ✓ measured unclipped in both scripts |
| Two-column blocks stacked, never squeezed | ✓ |
| Display type at 34px does not overflow the longest mock title in either language | ✓ |
| Touch targets remain 44px; the header keeps its menu trigger | ✓ |
| Tables scroll within their own container if they must, never the page | ✓ |
| Summary strip drops to one column | ✓ |

**320px at 200% zoom (≈640px reflow) is the WCAG 1.4.10 requirement** and is a separate check —
`docs/ACCESSIBILITY_UX_SPEC.md` §5.

---

## 7. 1920 and above

Content caps at **1180px**. The design does not expand to fill a 27-inch monitor.

- Margins absorb the extra width.
- Full-bleed elements — hero, disclosure, plates, verdict — bleed to the **viewport**, which is what
  makes wide screens feel considered rather than empty.
- **Type does not grow beyond the 1440 values.** A 96px headline on a wide monitor is a poster, not
  a publication.
- The air column grows. At 1920 the review page has a genuinely luxurious amount of empty space, and
  that is the luxury signal.

---

## 8. Art-directed images

Crops change per breakpoint via `<picture>`, not by scaling one file — so mobile downloads a
**smaller file**, not a resized large one.

| Image | Mobile | Tablet | Desktop |
|---|---|---|---|
| Homepage portrait | 4:5 tight | 4:5 | 4:5 |
| Review hero | **4:5** | 3:2 | 16:10 |
| Work hero | 3:2 | 16:10 | 16:10 |
| Journal hero | 3:2 | 16:9 | 16:9 |
| Index entry image | 4:5 | 4:5 | 4:5 |
| **Evidence plate** | **3:2 — unchanged** | 3:2 | 3:2 |

**Evidence plates never re-crop, because comparability is the point.** Everything else may.

---

## 9. Responsive coverage matrix

Every component × every threshold, with the status of each after Phase 3.

| Component | 320 | 375 | 768 | 1024 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| Global header | ✓ | ✓ | ✓ | **✓ measured** | **✓ measured** | ✓ |
| Primary nav | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Locale switcher | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Breadcrumb | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Margin index | ✓ inline | ✓ inline | ✓ inline | **✓ column, measured** | **✓ column, measured** | ✓ |
| Plate | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Three voices | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Disclosure band | **✓ measured unclipped** | **✓ measured** | ✓ | ✓ | ✓ | ✓ |
| Conditions well | **✓ after fix** | ✓ | ✓ | **✓ measured** | **✓ measured** | ✓ |
| Summary strip | ✓ 1 col | ✓ 2×2 | ✓ | ✓ | ✓ | ✓ |
| Method stage | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Strengths/limitations | ✓ | ✓ | ✓ 2 col | ✓ | ✓ | ✓ |
| Suitability | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Related content | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Index entry | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Facet group | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Contact form | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Footer | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**✓ measured** = verified in `docs/proofs/type-proof.html` with real type in both directions.
Everything else is **specified**, not yet rendered — no application exists.

---

## 10. Testing matrix for Phase 4

Every combination below before Phase 4 sign-off:

| Width | LTR | RTL |
|---|---|---|
| 320 | Review, homepage | Review, homepage |
| 375 | All templates | All templates |
| 768 | Review, homepage, journal | Review, homepage |
| **1024** | All templates | **All templates — highest risk, check first** |
| 1440 | All templates | All templates |
| 1920 | Review, homepage | Review |

Plus: **200% browser zoom at 1280**, and **320px at 200% zoom** (≈640px reflow, WCAG 1.4.10).

---

## 11. What would make the responsive design fail

- The margin index hidden below 1024 instead of collapsing inline.
- A `vw`-only `clamp()` breaking user text scaling.
- The desktop header rendered below 1024 (measured: it overflows).
- A conditions value cell set `white-space: nowrap` (measured: overflows at 320 in English).
- A `<bdi>` wrapped around a numeral-plus-Arabic-unit run (measured: reverses the range).
- An evidence plate re-cropped for mobile.
- The disclosure statement truncated or collapsed at any width.
- Two-column blocks squeezed rather than stacked at 320.
- A section re-ordered by breakpoint.
- Container queries producing a different visual language per width — one language, adapted.
