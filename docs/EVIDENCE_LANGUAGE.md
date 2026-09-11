# Evidence Language

**Status:** Phase 2 decision. Mandatory design requirement from the Phase 2 brief.

Three kinds of statement appear on a review page, and a reader must be able to tell them apart
**without reading them**:

| | What it is | Whose voice |
|---|---|---|
| **CLAIM** | What the brand says about its product | The brand's |
| **OBSERVATION** | What Zina recorded during testing | Recorded at the time |
| **VERDICT** | What Zina concluded | Opinion, owned |

The content model already keeps these in separate fields on separate entities
(`product.brandClaims[]`, `review.observations[]`, `review.verdict`), so blurring them is impossible
in the data. This document makes the distinction visible.

---

## 1. The governing constraint

The distinction must be **editorial, not instrumental**. It borrows from archival annotation — the
plate caption, the condition report, the contact sheet — and never from a dashboard
(`docs/ART_DIRECTION.md` §4).

**The test:** if a treatment could appear in an analytics product, it is wrong. If it could appear
in the back matter of a well-made art book, it is right.

This is not only taste. The content makes no clinical claim, and the Method's `doesNotProve` fields
exist to hold that line. An instrumental interface would imply scientific validation the content
explicitly disclaims — an integrity failure in a visual costume.

---

## 2. The three voices

### CLAIM — recessed, quoted, attributed

| Property | Specification |
|---|---|
| Typeface | Zarid Text, **regular 400** |
| Size | `body.sm` (16px) — one step below the surrounding prose |
| Colour | `color.evidence.claim` `#9A9184` — 5.74:1 on raised. The quietest text on the page |
| Surface | `color.ground.raised` |
| Rule | **Dotted**, 1px, `line.hairline`, on the inline-start edge, inset 16px |
| Label | `CLAIMED BY THE BRAND` / `تدّعي العلامة` — `label.sm`, muted |
| Spacing | Indented from the text column by 24px |
| Attribution | Always present. Never presented in the reviewer's voice |

**The dotted rule is the signature.** A dotted line reads as provisional, as *someone else said
this* — the typographic equivalent of a raised eyebrow. Solid rules mark things that were observed.

**Never:** a quotation mark glyph as decoration, an "info" icon, a coloured badge, or any treatment
that makes the claim look endorsed.

### OBSERVATION — recorded, timestamped, primary

| Property | Specification |
|---|---|
| Timestamp | Plex Mono `record.md` (15px), `color.accent.mineral`, tabular figures |
| Aspect label | Plex Sans `label.sm`, `text.muted` |
| Note | Zarid Text `body.md` (18px), `text.primary` |
| Surface | `ground.base` — the page itself. Observations are not "in" anything |
| Rule | **Solid** 1px `color.accent.mineral` at the inline-start edge, full height of the entry |
| Layout | Timestamp and aspect in the margin index; note in the text column |
| Marker | A 6px solid mineral square on the rule at each entry — a tick on a scale, not a bullet |

```
│ Hour 6    Wear
│           First visible change. Product began to lift around the
■           nose and the chin on all four tests, primer or not.
│
│ Hour 8    Wear
│           Noticeable patchiness across the centre of the face.
■           Colour itself stayed stable across all four tests…
```

Observations get the **most** typographic weight of the three at body level. They are the evidence,
and the page exists to present them.

### VERDICT — largest, warm, owned

| Property | Specification |
|---|---|
| Typeface | Zarid **Serif** (display, not text) |
| Size | `display.md` (40px) for the summary line |
| Colour | `color.evidence.verdict` `#F2EDE3` — 15.30:1 |
| Surface | `ground.raised`, full-bleed band |
| Rule | **Solid 2px `color.accent.clay`** above the block — the only 2px rule in the system |
| Label | `THE VERDICT` / `الحكم` — `label.sm`, clay |
| Spacing | 96px above, 64px below. The most space around any block on the page |
| Supporting | `bestFor` and `wouldRepurchase` beneath in `body.md`, `text.secondary` |

The verdict is the only place the display serif appears in the body of the page, and the only place
the 2px clay rule appears. Both are reserved so the block reads as *conclusion* the moment it enters
view.

**No score. No stars. No badge. No number.** Phase 1 decision, enforced by the validator.

---

## 3. Side by side

| | CLAIM | OBSERVATION | VERDICT |
|---|---|---|---|
| Typeface | Zarid Text 400 | Zarid Text 400 + Plex Mono | Zarid **Serif** |
| Size | 16px | 18px + 15px mono | 40px |
| Colour | `#9A9184` muted | `#F2EDE3` + `#A3BCAF` mineral | `#F2EDE3` |
| Surface | raised | base | raised, full-bleed |
| Rule | **dotted**, hairline | **solid**, mineral | **solid 2px**, clay |
| Indent | 24px in | flush to column | full-bleed |
| Marker | none | mineral square | clay rule above |
| Volume | quietest | primary | loudest |

Three axes vary together — **typeface, rule style and volume** — so the distinction survives
greyscale, colour-vision deficiency and a 5% zoom-out glance. Colour is the fastest cue and never
the only one.

---

## 4. Supporting elements

### The margin index

The signature device. A narrow column beside the review body, `record.sm` (13px) Plex Mono, carrying:

- hour and week markers (`Hour 6`, `Week 2`, `Coat 3`)
- method stage names at the point the stage's evidence begins
- plate numbers (`Plate 03`)

Left in LTR, **right in RTL**. Below 768px it collapses to inline markers above each entry rather
than being hidden — the information is part of the record, not decoration.

It reads as **marginalia in a notebook**, not as a sidebar or a table of contents.

### The conditions well

Testing conditions set into `ground.inset`, laid out as a printed table:

- hairline rules between rows, **no outer border, no cell borders, no zebra striping**
- label column in Plex Sans `ui.sm`, `text.muted`
- value column in Plex Mono `record.md`, `text.primary`, tabular figures
- values right-aligned in LTR, left-aligned in RTL, so numerals form a column

```
Temperature      34–38 °C
Humidity         58–71 %
Environment      Mixed outdoor and air-conditioned
Activity         Moderate, 40 min walking outdoors
```

This is the most record-like element on the site and the one that most directly expresses the
differentiator. It must look like a printed table in a report, not like a data grid.

### Plates

Evidence images numbered and captioned, referenced from the prose by number.

- `Plate 03` in Plex Mono `record.sm`, mineral, above the caption
- caption in Zarid Text `body.sm`, `text.secondary`
- hairline rule beneath the caption, full image width
- images flush to the grid, **no frame, no border, no radius**
- bound to a method stage via `media.evidence[].stageKey` and optionally to an observation index

A plate is a *record*, not a gallery item. It is numbered because it is referred to.

### The disclosure band

Full-width, above the hero, `ground.raised`, with the paper grain at 3% — the only place texture
appears in quantity.

| Disclosure | Treatment |
|---|---|
| `independently-purchased` | Hairline top rule, muted label. Quietest |
| `editorial` | Same as above |
| `gifted` | Mineral top rule, mineral label |
| `sponsored` | Clay top rule, clay label, +8px vertical padding |
| `paid-collaboration` | **Clay 2px top rule**, clay label, +16px padding. Most prominent |
| `unknown-pending-verification` | **Warning rule and label.** Cannot reach published status |

Prominence scales with commercial entanglement — the more money involved, the louder the band.
`additional[]` modifiers render as a **second line** in the band, never as a second badge.

Every band carries the full statement, not just a label. A badge says "gifted"; a statement says
what that means for the reader.

### Method stage markers

Where a review names the stages applied, each is a mineral square marker plus the stage name in
Plex Sans `ui.sm`, linked to the corresponding anchor on `/method/`.

Stages not applied are shown at `text.muted` with a hollow square — **present but visibly not
claimed**. A review that ran four of six stages says so, which is more credible than one that hides
the difference.

---

## 5. Arabic behaviour

| Element | Arabic rule |
|---|---|
| Margin index | Moves to the **right**. Never stays left |
| Rules and indents | Inline-start, via logical properties |
| Timestamps | Mono numeral, Arabic label in Plex Sans Arabic, bidi-isolated: `الساعة 6` |
| Conditions well | Label column at inline start; numerals stay LTR inside their isolate |
| Plate numbers | `لوحة 03`, zero-padded, numeral isolated |
| Claim label | `تدّعي العلامة` — weight-differentiated, **never tracked** |
| Verdict label | `الحكم` |
| Volume parity | Arabic labels one weight lighter, per `docs/BILINGUAL_TYPE_TEST.md` §5 |

The evidence layer is the densest part of the site and therefore the part most likely to break in
RTL. It should be built RTL-first and checked LTR, not the reverse.

---

## 6. Forbidden in the evidence layer

| Forbidden | Why |
|---|---|
| Charts, graphs, sparklines, gauges, meters, progress rings | Dashboard language. There are no scores to plot |
| Percentage bars or "confidence" indicators | Implies a precision the testing does not have |
| Score badges, stars, numeric ratings | Removed by Phase 1 decision |
| Green-to-red scales | Encodes a rating that does not exist |
| Medical or scientific iconography — flasks, microscopes, molecules, beakers | The exact clinical implication the content disclaims |
| Monospace for prose | Mono is for numerals and identifiers only |
| Coloured "pass/fail" markers on observations | An observation is not a test result |
| Tooltips carrying evidence | Evidence must be visible; hidden content cannot be marked up or read aloud |
| Accordions collapsing observations | The observations are the article |
| Any animation that gates evidence | It must be readable with JavaScript disabled |

---

## 7. Where the evidence language appears

| Surface | Extent |
|---|---|
| `/reviews/{slug}/` | Full: index, conditions, observations, plates, disclosure, verdict |
| `/method/` | Stage markers and `doesNotProve` treatment. No conditions or plates |
| `/work/{slug}/` | Deliverables and licence terms in record density. Disclosure band. No observations |
| `/journal/{slug}/` | Only where an article cites a review — a single plate or observation quote |
| `/reviews/` index | Disclosure marker on cards only |
| Homepage | **One** evidence moment, in the featured review block |
| `/about/`, `/brands/`, `/contact/` | None |

**The discipline:** the evidence language is powerful because it is rationed. A site where every
page carries mineral rules and mono timestamps has turned a signature into wallpaper, and has become
the dashboard it was designed to avoid.
