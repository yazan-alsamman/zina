# Responsive Art Direction

**Status:** Phase 2 decision.

**Mobile is the primary surface**, not a reduction. Audience A arrives from social on mid-range
Android. The review page is designed at 375px first and expanded, not designed at 1440px and
squeezed.

---

## 1. Breakpoints

| Token | Width | Represents | What changes |
|---|---|---|---|
| `bp.xs` | 320 | Small Android, iPhone SE | Survival floor. Nothing may break |
| — | 375 | **The design origin.** iPhone 12/13 mini class | Baseline mobile composition |
| — | 390 | iPhone 14/15 | No change from 375 |
| — | 430 | Pro Max class | Slightly larger type and margins |
| `bp.sm` | 600 | Large phone landscape, small tablet | Margins grow; still single column |
| `bp.md` | 768 | Tablet portrait | **Two-column blocks appear.** Header still condensed |
| `bp.lg` | 1024 | Tablet landscape, small laptop | **Full header. Margin index appears.** Three-up grids |
| `bp.xl` | 1280 | Laptop | Full 12-column grid, air column active |
| `bp.2xl` | 1440 | Desktop | Reference composition. Type at full scale |
| — | 1920+ | Large desktop | **Content capped at 1180px.** Margins absorb the rest |

Two thresholds matter more than the rest: **768px**, where two-column blocks become possible, and
**1024px**, where the margin index appears and the design becomes itself.

---

## 2. Composition changes, not scaling

### Review page

| Element | 320–767 | 768–1023 | 1024+ |
|---|---|---|---|
| **Margin index** | Inline marker rows above each observation | Inline marker rows | **Margin column** at inline start |
| Grid | Single column, 20px margins | Single column, 48px margins | 12 columns, index + text + air |
| Hero | **4:5 crop** | 3:2 | 16:10 |
| Disclosure band | Full-bleed, 20px padding, statement always fully visible | Full-bleed, 32px | Full-bleed, 40px |
| Conditions well | Label/value rows, values to inline end | Two columns | Two columns, aligned numerals |
| Observations | Marker row, then note | Marker row, then note | Timestamp in index, note in column |
| Evidence plates | Single column, stacked | Single column | Full-bleed single, or paired 1:1 |
| Strengths / limitations | Stacked, strengths first | **Two columns** | Two columns |
| Suitability | Stacked | Two columns | Two columns |
| Verdict | Full-bleed, 28px type | Full-bleed, 34px | Full-bleed, 40px |
| Related | Stacked or edge-scroll | Two-up | Three-up |
| Section rhythm | 56px | 72px | 96px |

**The margin index is the one genuinely compositional change.** Below 1024px it does not vanish —
its content moves inline above each observation, because hour markers and stage names are part of
the record, not decoration. Hiding them on mobile would remove evidence from the majority of
readers.

### Homepage

| Element | 320–767 | 768–1023 | 1024+ |
|---|---|---|---|
| Opening | Statement, then portrait 4:5 full-bleed | Statement over, portrait under | **Asymmetric side by side**, portrait bleeding to one edge |
| Height | Content-driven | ~80vh | ~88vh |
| Featured review | Image, title, conditions, link — stacked | Stacked, wider | **Image left, content right** |
| Method | Vertical list with mineral rule | 3 + 3 grid | Six across, horizontal |
| Recent reviews | Stacked, full-width images | Two-up | Three-up |
| Work | Stacked | Stacked, larger | Alternating image side |
| Journal | Stacked | Two-up | Two-up |
| Close | Full width | Centred 640px | Centred 640px |

**The proof block must begin within one swipe on mobile.** If section 2 starts below 1.5 viewport
heights at 375px, section 1 is too tall.

### Navigation

| | 320–1023 | 1024+ |
|---|---|---|
| Header | Wordmark, CTA affordance, menu trigger | Wordmark, 5 items, CTA, language switcher |
| Menu | **Full-screen overlay**, items in lower two-thirds | Not applicable |
| Language switcher | Inside the menu | In the header |
| Sticky | Reveal on scroll up | Reveal on scroll up |

Header layout is sized to the **Arabic** label set. English is allowed to be roomy; the reverse
produces an Arabic header that wraps at 1024px.

---

## 3. Type scaling

Display type is fluid between 375px and 1440px; body and UI type step at breakpoints. Latin values —
Arabic derives at ×1.12.

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

**Floors hold at every width:** body never below 16px, mono never below 13px, nothing below 12px.

Fluid scaling uses `clamp()` with a `rem`-based preferred value so browser text-size settings and
zoom continue to work — a `vw`-only formula breaks user font scaling and is an accessibility
failure.

---

## 4. Arabic at each breakpoint

Arabic is not a variant of the responsive design; it is the same design in the other direction, with
three additions.

| Consideration | Rule |
|---|---|
| Direction | Whole grid mirrors via logical properties. Index right, air left |
| Size | ×1.12 at every breakpoint, so the whole ladder shifts up |
| Leading | ×1.18, so **Arabic pages are visibly longer.** Expected and correct |
| Header | Sized to Arabic width — the binding constraint at 1024px |
| Line length | Same *column width*, not the same character count |
| Mixed runs | Bidi isolation must hold at every width; wrapping is where it breaks |
| Edge-scroll blocks | Related content scrolls from the right |

**The highest-risk Arabic breakpoint is 1024px**, where the full header appears with the longest
labels and the margin index arrives simultaneously. It should be checked first.

---

## 5. 320px

Not a courtesy. It is a real device class in the region, and it is the width at which a dense
review page is most likely to break.

Requirements:

- No horizontal scroll, anywhere, in either direction.
- The conditions well remains readable as label/value rows.
- The disclosure statement is **fully visible** — never truncated, never behind "read more".
- Two-column blocks are stacked, never squeezed.
- Display type at 34px does not overflow on the longest mock review title in either language.
- Touch targets remain 44px; the header does not lose the menu trigger.
- Tables scroll within their own container if they must, never the page.

---

## 6. 1920 and above

Content caps at **1180px**. The design does not expand to fill a 27-inch monitor.

- Margins absorb the extra width.
- Full-bleed elements — hero, disclosure, plates, verdict — bleed to the viewport, which is what
  makes wide screens feel considered rather than empty.
- Type does not grow beyond the 1440px values. A 96px headline on a wide monitor is a poster, not a
  publication.
- The air column grows, which is intentional: at 1920px the review page has a genuinely luxurious
  amount of empty space, and that is the luxury signal.

---

## 7. Art-directed images

Crops change per breakpoint via `<picture>`, not by scaling one file.

| Image | Mobile | Tablet | Desktop |
|---|---|---|---|
| Homepage portrait | 4:5 tight | 4:5 | 4:5 |
| Review hero | **4:5** | 3:2 | 16:10 |
| Work hero | 3:2 | 16:10 | 16:10 |
| Journal hero | 3:2 | 16:9 | 16:9 |
| Review card | 4:5 | 4:5 | 4:5 |
| **Evidence plate** | **3:2 — unchanged** | 3:2 | 3:2 |

Evidence plates never re-crop, because comparability is the point. Everything else may.

---

## 8. Testing matrix

Before Phase 4 sign-off, every combination below:

| Width | LTR | RTL |
|---|---|---|
| 320 | Review, homepage | Review, homepage |
| 375 | All templates | All templates |
| 768 | Review, homepage, journal | Review, homepage |
| **1024** | All templates | **All templates — highest risk** |
| 1440 | All templates | All templates |
| 1920 | Review, homepage | Review |

Plus: 200% browser zoom at 1280px, and 320px at 200% zoom (equivalent to 640px reflow), which is
the WCAG 1.4.10 reflow requirement.
