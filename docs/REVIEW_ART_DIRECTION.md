# Review Page Art Direction

**Status:** Phase 2 decision. The most important document in the phase.
**Structure:** `docs/REVIEW_PAGE_ARCHITECTURE.md` (Phase 1) defines *what* is on the page. This
defines *how it looks*.

**The page must feel like an editorial investigation, not a product card.**

---

## 1. The grid

Desktop (≥1280px), 12 columns, 1180px max content width, 24px gutters.

```
│◀─ index ─▶│◀──────── text column ────────▶│◀── air ──▶│
│  cols 1–2 │          cols 3–9             │ cols 10–12│
│           │                               │           │
│  Hour 6   │  First visible change.        │           │
│  Wear     │  Product began to lift…       │           │
```

Three zones:

- **Margin index** (cols 1–2, ~160px) — hour markers, stage names, plate numbers. The signature.
- **Text column** (cols 3–9, ~620px) — 62–68 character measure. Everything readable lives here.
- **Air** (cols 10–12) — mostly empty. Occasionally holds a pull statement or a plate caption.

**Full-bleed exceptions**, which break the grid deliberately: hero, disclosure band, evidence
plates, verdict. Four breaks on a long page — enough for rhythm, few enough that each one registers.

In RTL the whole grid mirrors: index right, air left.

---

## 2. Section-by-section

Vertical rhythm baseline: **8px**. Section spacing in multiples of 8, with 96px the standard gap
between major sections and 64px between subsections.

### 1. Breadcrumb

| | |
|---|---|
| Weight | Lowest on the page |
| Width | Text column |
| Type | Plex Sans `ui.sm` 14px, `text.muted` |
| Spacing | 32px from header, 24px below |
| Surface | `ground.base` |
| Motion | None |
| Mobile | Retained, truncates middle segment, never wraps to two lines |
| Arabic | Mirrors; chevron separators mirror, middle-dot separators do not |

### 2. Product identity

| | |
|---|---|
| Weight | Low — it is a label, not a headline |
| Width | Text column |
| Type | Brand in Plex Sans `ui.sm` 500; category and product type in `label.sm` muted, ` · ` separated |
| Spacing | 8px above the title |
| Surface | `ground.base` |
| Motion | None |
| Mobile | Stacks to two lines |
| Arabic | Brand name stays Latin, bidi-isolated |

Brand links to the brand page **only if the gate passes in this locale**; otherwise it is plain text
or links to the filtered index (`docs/BRAND_ARCHITECTURE.md` §3).

### 3. Title and subtitle

| | |
|---|---|
| Weight | **Highest text weight on the page** |
| Width | Text column, may extend into the air column at `display.lg` |
| Type | Title Zarid Serif `display.lg` 56px, `text.primary`. Subtitle Zarid Serif `display.sm` 30px, `text.secondary` |
| Spacing | 16px between; 48px below |
| Alignment | Inline-start. **Never centred** — centred display type reads as a poster, not a publication |
| Motion | Fade-up 12px, 400ms, once. Never gates the LCP |
| Mobile | `display.lg` floors at 34px, subtitle at 22px |
| Arabic | ×1.12 size, ×1.18 leading. Header must be laid out to Arabic width |

### 4. Disclosure band

| | |
|---|---|
| Weight | **High — deliberately interrupts** |
| Width | **Full-bleed** |
| Type | Label `label.sm`; statement Zarid Text `body.sm` 16px |
| Spacing | 24–40px internal padding, scaling with disclosure severity |
| Surface | `ground.raised`, paper grain 3%. Top rule 1px→2px by severity |
| Motion | **None.** Must be present at first paint |
| Mobile | Full-bleed, 20px padding, statement always fully visible — never truncated or collapsed |
| Arabic | Rule and label at inline start |

Placed **above the hero**, so it is read before the image seduces. It is the one element permitted
to interrupt the editorial flow, and it should feel like a stamp on a document.

### 5. Hero

| | |
|---|---|
| Weight | Highest visual weight |
| Width | Full-bleed |
| Ratio | **16:10 desktop, 4:5 mobile** — a real art-direction crop via `<picture>`, not a scale |
| Type | None over the image. Caption below, `body.sm` `text.secondary` |
| Spacing | 64px below |
| Surface | Image sits directly on ground; no frame, no radius |
| Motion | **None.** This is the LCP element — eager, preloaded, `fetchpriority="high"` |
| Mobile | Taller crop; subject must survive the reframe |
| Arabic | Identical; caption inline-start |

**No text over the hero.** Text over imagery requires a scrim, a scrim requires a gradient, and the
palette refuses decorative gradients. It also makes the LCP element harder to optimise and the
headline harder to read at 320px.

### 6. Testing summary strip

| | |
|---|---|
| Weight | Medium — first record-density block |
| Width | Full text column plus index |
| Type | Labels Plex Sans `label.sm` muted; values Plex Mono `record.md` 15px, tabular |
| Spacing | 24px internal, 64px below |
| Surface | `ground.base` with hairline above and below |
| Motion | None |
| Mobile | 2×2 grid, then stacked below 375px |
| Arabic | Labels in Plex Sans Arabic; numerals mono and isolated |

Four values: wear window, times tested, shade, baseline photographed. Scannable in two seconds. This
is the first moment the page announces it is a record.

### 7. Editorial introduction

| | |
|---|---|
| Weight | High |
| Width | Text column, 62–68 characters |
| Type | Zarid Text `body.lg` 21px / 1.62, `text.primary` |
| Spacing | 64px above and below |
| Surface | `ground.base` |
| Motion | None |
| Mobile | 19px, generous margins |
| Arabic | 24px / 1.91 |

The first sustained reading moment. Set one step larger than the body that follows, which signals
"start here" without a drop cap or any other ornament.

### 8. Testing context and conditions

| | |
|---|---|
| Weight | Medium-high |
| Width | Conditions well spans index + text column |
| Type | Prose Zarid Text `body.md`; well as specified in `docs/EVIDENCE_LANGUAGE.md` §4 |
| Spacing | 40px between prose and well; 96px below |
| Surface | Well on `ground.inset`, hairline row rules, **no outer border, no zebra** |
| Motion | None |
| Mobile | Well becomes label/value rows, full width, values right-aligned |
| Arabic | Label column at inline start; numerals form an aligned column |

**The section no competitor has.** It should look like a printed table in a report.

### 9. Method stages applied

| | |
|---|---|
| Weight | Medium |
| Width | Full text column |
| Type | Plex Sans `ui.sm`; stage names with mineral square markers |
| Spacing | 32px internal, 96px below |
| Surface | `ground.base`, hairline above |
| Motion | Markers may fade in sequentially, 60ms stagger, once |
| Mobile | Wraps to two rows |
| Arabic | Mirrors |

Stages applied get a solid mineral square; stages **not** applied get a hollow one at `text.muted`.
Each links to its anchor on `/method/`. This is the repeated internal link that builds the pillar.

### 10. Observations

| | |
|---|---|
| Weight | **The core of the page** |
| Width | Timestamp and aspect in index; note in text column |
| Type | Per `docs/EVIDENCE_LANGUAGE.md` §2 |
| Spacing | 40px between entries; continuous mineral rule down the index |
| Surface | `ground.base` |
| Motion | Entries fade-up 8px on scroll with 80ms stagger, once, reduced-motion off |
| Mobile | Timestamp and aspect move **above** the note as an inline marker row; mineral rule stays at inline start |
| Arabic | Index and rule move to the right |

The continuous mineral rule running the height of the observation sequence is the single most
recognisable element on the page. It is a timeline without being a chart.

### 11. Evidence plates

| | |
|---|---|
| Weight | High |
| Width | **Full-bleed** for a single plate; index + text column for a pair |
| Ratio | 3:2 single, 1:1 in a pair |
| Type | `Plate 03` Plex Mono `record.sm` mineral; caption Zarid Text `body.sm` secondary |
| Spacing | 96px above, 64px below; 24px between image and caption |
| Surface | Image on ground, hairline beneath caption. No frame, no radius |
| Motion | Lazy-loaded; fade-in on decode only, 200ms. No parallax |
| Mobile | Single column always; pairs stack |
| Arabic | Caption inline-start; plate numbers zero-padded |

Comparison pairs (hour 0 / hour 8) sit edge to edge with a 2px gap, **never** with a slider. A
before/after slider requires JavaScript, hides half the evidence at any moment, and is unusable by
keyboard.

### 12. Strengths and limitations

| | |
|---|---|
| Weight | Medium-high |
| Width | Text column; **two columns side by side ≥1024px** |
| Type | Headings Plex Sans `label.sm` tracked; items Zarid Text `body.md` |
| Spacing | 12px between items; 96px below |
| Surface | `ground.base`, hairline above each column |
| Motion | None |
| Mobile | Stacks, strengths first |
| Arabic | Mirrors; strengths at inline start |

**Equal visual weight, always.** Same type, same size, same colour, same column width. The moment
limitations are made smaller or quieter than strengths, the page becomes marketing. No ticks, no
crosses, no green, no red — a small mineral square marker on both lists.

### 13. Suitability

| | |
|---|---|
| Weight | Medium |
| Width | Two columns ≥1024px |
| Type | Headings `label.sm`; items `body.md` |
| Spacing | 96px below |
| Surface | `ground.raised`, 40px padding, hairline border |
| Motion | None |
| Mobile | Stacks |
| Arabic | Mirrors |

The one place a raised surface groups two lists, because "suits" and "may not suit" belong to each
other. Both columns identical in treatment, for the same reason as §12.

### 14. Verdict

| | |
|---|---|
| Weight | **Loudest block on the page** |
| Width | Full-bleed band, text at text-column width |
| Type | Zarid **Serif** `display.md` 40px; supporting `body.md` secondary |
| Spacing | **96px above, 64px below** — the most air anywhere |
| Surface | `ground.raised`, solid **2px clay** rule above |
| Motion | Fade-up 12px once on scroll |
| Mobile | 28px, full-bleed retained |
| Arabic | ×1.12; rule full width in both directions |

The only place the display serif appears mid-page, and the only 2px clay rule. Both reserved so the
block reads as *conclusion* on sight. **No score, no stars, no badge.**

### 15. Update log

| | |
|---|---|
| Weight | Low but present |
| Width | Text column |
| Type | Date Plex Mono `record.sm` mineral; note Zarid Text `body.sm` secondary |
| Spacing | 64px above, 96px below |
| Surface | `ground.base`, hairline above |
| Motion | None |
| Mobile | Stacks |
| Arabic | Dates localised, numerals isolated |

Small, but never hidden behind a toggle. A dated correction is a trust signal and belongs in the
document.

### 16. Product details and brand claims

| | |
|---|---|
| Weight | Low |
| Width | Text column |
| Type | Specs in record density; claims per `docs/EVIDENCE_LANGUAGE.md` §2 |
| Spacing | 96px above |
| Surface | Claims on `ground.raised` with the **dotted** rule |
| Motion | None |
| Mobile | Specs become label/value rows |
| Arabic | Product name Latin, isolated |

Placed **after** the verdict, deliberately. The brand's own language is the last thing on the page,
not the first. Official link carries `rel="nofollow"`, plus `sponsored` where a paid relationship
exists.

### 17. Related content and CTA

| | |
|---|---|
| Weight | Low-medium |
| Width | Full width; 3-up ≥1024px |
| Type | Titles Zarid Text `body.md`; metadata `label.sm` muted |
| Spacing | 128px above — the largest gap on the page, separating article from navigation |
| Surface | `ground.raised`, hairline top |
| Motion | None |
| Mobile | Horizontal scroll with visible edge, or stacked. Never a carousel with dots |
| Arabic | Mirrors; horizontal scroll starts at the right |

Related reviews, related journal, related work, and a quiet CTA to `/method/` for a first-time
reader. The CTA is a text link with a clay underline, not a button — a reading page should not end
in a sales control.

---

## 3. The page's rhythm

```
hero          ████████████████  full-bleed, image
disclosure    ████████████████  full-bleed, raised, interrupts
intro         ░░░░░░            text column, editorial density
conditions    ▓▓▓▓▓▓▓▓          inset well, RECORD density
method        ▓▓▓▓              record density
observations  ░▓░▓░▓░▓          ALTERNATING — mono index, serif prose
plate         ████████████████  full-bleed, image
strengths     ░░░░  ░░░░        two columns, editorial
suitability   ▒▒▒▒▒▒▒▒          raised surface
verdict       ████████████████  full-bleed, DISPLAY serif
details       ▓▓░░              record + recessed claim
related       ▒▒▒▒▒▒▒▒          raised
```

Reading, then scanning, then reading. Four full-bleed breaks. The alternation is what makes a
1,500-word page with six observations and three plates feel navigable rather than heavy — and it is
the first thing lost if someone flattens the design into a single column of cards.

---

## 4. Mobile

Not a compressed desktop.

- **Margin index collapses to inline marker rows** above each observation. It is never hidden — it
  is part of the record.
- Hero re-crops to 4:5 via `<picture>`. A real crop, not a scale.
- Full-bleed elements stay full-bleed; text keeps 20px margins.
- Two-column blocks stack, strengths first.
- Conditions well becomes label/value rows with values aligned to the inline end.
- Display sizes floor at 34px, body at 17px, mono at 13px.
- Section rhythm compresses from 96px to 56px.
- Touch targets ≥44px. Related-content cards are large tap areas, not small links.

---

## 5. Arabic

The review page is the densest surface on the site and therefore the most likely to break in RTL.
**Build it RTL-first and check LTR.**

- Index moves to the right; observation rules, claim indents and plate captions all follow
  inline-start.
- Sizes ×1.12, leading ×1.18. The page will be visibly longer in Arabic; that is correct.
- Every Latin run — product names, shade codes, brand names — bidi-isolated.
- The conditions well is the highest-risk element: Arabic labels, Latin numerals, aligned columns,
  mirrored layout, all in one component.
- No tracking anywhere.

---

## 6. What would make this page fail

- A rating, score, star or badge appearing anywhere.
- Limitations set smaller or quieter than strengths.
- The disclosure band moved below the hero, or collapsed behind a toggle.
- Observations placed inside an accordion.
- The conditions well styled as a data grid with borders and zebra striping.
- A before/after slider replacing the side-by-side plates.
- Any chart.
- Rounded cards wrapping the sections.
- The margin index hidden on mobile.
- Text set over the hero.
- The Arabic page reading as a translation of the English one rather than as Arabic typography.
