# Art Direction — The Testing Room

**Status:** Phase 2 decision. The selected creative direction. No implementation.
**Territory analysis:** `docs/VISUAL_TERRITORIES.md`

---

## 1. Emotional statement

**The first five seconds.**

The visitor arrives on a warm, deep, quiet page. It is dark, but not cold — the black has brown in
it, the way ink does. There is more space than they expect. One image, held large and still. One
line of type, set in a serif with real weight to it, that says something specific rather than
something flattering.

Then they notice the small things: a hairline rule, a number set in monospace beside a photograph,
a time marker in the margin. Nothing is decorated. Everything is *labelled*.

The feeling is: **someone kept records.**

Not "this is expensive". Not "this person is famous". The feeling of being handed a file rather
than a brochure — and the specific, slightly surprising respect that comes from being shown the
working instead of only the conclusion.

---

## 2. Brand statement

The design says four things about Zina, in order of how quickly they land:

1. **She is serious.** The restraint, the space, the absence of decoration. Nothing here is trying
   to be liked.
2. **She keeps records.** The margin index, the timestamps, the numbered plates, the published
   conditions. The evidence layer is the identity.
3. **She is a person, not a publication.** The warmth of the ground, the photography, the first
   person in the copy. This is one woman's practice, not a masthead.
4. **She will tell you when she does not know.** The `doesNotProve` fields, the disclosure band
   above the content, the reviews that say what a test could not determine. Visible limits are the
   most persuasive thing on the site.

The design's job is to make the fourth one legible *before* it is read. That is why the evidence
language exists.

---

## 3. Visual language

### Shapes

**Rectangular, unrounded, unapologetic.** Images are rectangles. Blocks are rectangles. The only
radius in the system is 2px, and it appears on interactive controls solely so they read as
touchable. Everything else is 0.

This is a deliberate rejection of the rounded-card convention. Editorial layouts are built from
type, rules and space; the moment content goes into a rounded container it becomes a *component*
and stops being a *page*.

### Lines

**The hairline is the primary structural device.** One pixel, warm, at `line.hairline` for
decorative separation and `line.strong` where the boundary carries meaning.

Rules do three jobs:

- **Separate** — between sections, replacing the margin a card would have used.
- **Mark** — a rule inset from the text edge marks a passage as claim, observation or verdict.
- **Measure** — short rules in the margin index register hours, stages and plates.

The third is the distinctive one. A rule that indicates *where you are in a test* is doing
something no other beauty site's rules are doing.

### Surfaces

Four ground levels, and they are barely different from each other:

```
ground.inset      #0B0A08   wells: conditions table, evidence strip
ground.base       #12100D   the page
ground.raised     #1A1714   disclosure band, quoted claim, related content
ground.overlay    #211D18   menu, modal
```

The differences are small on purpose. Elevation is communicated by a hairline and a shift in
spacing far more than by a change in value, and **never by a shadow**. Drop shadows on a dark
ground read as either cheap or as software.

### Density

**Two densities, deliberately different, on the same page.**

- **Editorial density** — introduction, verdict, conclusion, journal prose. Wide leading, narrow
  measure (62–68 characters), generous space above and below. This is a reading surface.
- **Record density** — conditions, observations, plate captions, metadata. Tighter, aligned to a
  visible grid, monospace, small. This is a scanning surface.

The shift between them, twice on a review page, is the page's rhythm. A design that flattens the
two into one density has lost the idea.

### Whitespace

Space is the luxury signal, and it is spent unevenly on purpose. Around display type and hero
imagery it is extravagant. Inside the evidence layer it is tight and regular. **Uneven spacing is
the point** — even spacing reads as a template.

### Image treatment

- Photography is presented at full editorial scale or not at all. There are no thumbnails.
- Evidence images are **plates**: numbered, captioned, referenced from the prose.
- Images sit flush to the grid with a hairline beneath the caption, not inside a frame with a
  border.
- No rounded corners on any image, ever.
- A very slight cool-to-warm grade unifies photography from different sources — see
  `docs/PHOTOGRAPHY_ART_DIRECTION.md`.

### Editorial rhythm

A review page moves: **hero → prose → record → plate → prose → record → verdict.** The alternation
between reading and scanning is what makes a long, dense page feel navigable rather than heavy.

### Visual hierarchy

Four levels, separated by **role** rather than only by size:

| Level | Role | Treatment |
|---|---|---|
| 1 | Display | Serif, very large, ivory. Titles and the verdict |
| 2 | Editorial | Serif, reading size, ivory. Prose |
| 3 | Record | Mono, small, mineral or muted. Timestamps, conditions, plate numbers |
| 4 | Label | Sans, very small, wide-tracked (Latin) / weighted (Arabic), muted | 

Level 3 is the one that does not exist on other beauty sites, and it is the level that carries the
brand.

---

## 4. The central creative device: archival annotation, not instrumentation

This is the single decision that makes the direction work, and the one most likely to be lost in
implementation.

The evidence layer borrows its language from **the archive, not the laboratory**:

| Borrowed from | Not borrowed from |
|---|---|
| A photographer's contact sheet — frame numbers, grease-pencil marks | A dashboard |
| A conservator's condition report — dated observations, plate references | A medical chart |
| An art book plate caption — "Plate 3. Hour six, lifting at the nose" | A biotech readout |
| A field notebook — margin timestamps, a hand that recorded things | A HUD or data-viz panel |
| A printed index — hairline rules, small caps, aligned numerals | Charts, gauges, progress rings |

**Why this matters beyond aesthetics.** The content makes no clinical claim, and the Method's
`doesNotProve` fields exist specifically to hold that line. A laboratory interface would imply
scientific validation that the content explicitly disclaims — an editorial integrity failure
wearing a visual costume. Archival language communicates *care and record-keeping*, which is
exactly and only what is being claimed.

**Practical test.** If a component could appear in an analytics product, it is wrong. If it could
appear in the back matter of a well-made art book, it is right.

**Forbidden outright:** charts, graphs, gauges, progress rings, sparklines, percentage bars, score
badges, dials, meters, and any data visualisation of testing results. There are no numbers to
visualise — the site publishes no scores — and inventing a visual for a measurement that does not
exist would be the worst thing this design could do.

---

## 5. The signature devices

Five, and no more. A direction with five recognisable devices is coherent; one with fifteen is
decorated.

**1. The margin index.** A narrow column running beside the review body carrying hour markers,
stage names and plate numbers in small mono. Left in LTR, right in RTL. Collapses to inline markers
below 768px. It is the thing a reader will remember.

**2. The plate.** Evidence photography numbered and captioned, referenced from the prose by number.
Turns a gallery into a record.

**3. The three voices.** Claim, observation and verdict, distinguishable without reading. Fully
specified in `docs/EVIDENCE_LANGUAGE.md`.

**4. The disclosure band.** A full-width band above the hero at `ground.raised`, carrying a paper
grain at 3% opacity. The only place texture appears in quantity. Its prominence scales with the
commercial relationship.

**5. The conditions well.** Testing conditions set into an inset surface with tabular figures,
laid out as a printed table with hairline rules and no borders. The most "record-like" element on
the page.

---

## 6. What the design intentionally refuses

Mandatory section. These are refusals, not preferences.

| Refused | Why |
|---|---|
| **Black and gold** | The luxury cliché the brief names. Gold on black is the most-used and least-considered signal of premium in the category. The accent is a warm **clay**, drawn from skin and pigment, not from metal |
| **Pure black `#000`** | Reads as technology or as absence. The ground is warm ink `#12100D`. The brown in the black is the entire difference between "editorial" and "app" |
| **Pure white text `#FFF`** | Harsh on a dark ground and clinically cold. Text is warm ivory `#F2EDE3`, measured at 16.28:1 |
| **Glassmorphism** | Blur, translucency and frosted panels. A 2020 convention that already dates the work and costs paint performance |
| **Neon, and any saturated gradient** | Wrong register entirely |
| **Rounded cards** | Turns editorial content into components. Radius is 0 everywhere except 2px on controls |
| **Drop shadows** | On a dark ground they read as cheap or as software. Elevation comes from hairlines and space |
| **Dashboard aesthetics** | Charts, gauges, meters, progress rings, score badges. See section 4 |
| **Any data visualisation of results** | There are no scores. Visualising a measurement that does not exist is a fabrication with a chart on it |
| **Follower counts as decoration** | Statistics are mock, unverified and undated. They are not a design element |
| **Star ratings** | Removed by Phase 1 decision. No stars, no score badges, no "8.5/10" anywhere |
| **Decorative 3D** | See `docs/3D_ART_DIRECTION.md` — the recommendation is none |
| **Parallax as a default** | Constant parallax is motion without meaning and a reliable INP cost |
| **Scroll hijacking** | Takes control from the reader on a reading site |
| **Animation before content** | No preloader, no entrance animation gating the LCP element |
| **Hairline type at display size** | Thin weights at 100px look expensive and fail at 320px and at 200% zoom |
| **Letter-spacing on Arabic** | Breaks connected letterforms. Tracking is a Latin-only token |
| **Italics as an emphasis system** | Arabic has no italic. An emphasis device that only works in one script makes the other script secondary |
| **All-caps as a shared device** | Arabic has no case. Caps is a Latin-only accent, and Arabic labels get a different, equivalent treatment |
| **Stock photography as identity** | Placeholder only, never as the visual voice |
| **Icons where a word will do** | The system is typographic. See `docs/ICONOGRAPHY.md` |

---

## 7. How the direction behaves across the site

| Surface | Which territory dominates | Why |
|---|---|---|
| Homepage | **A (Obsidian)** with one evidence moment | Space and stillness sell the positioning; one record-density block proves it is not just a poster |
| Review page | **B (Testing Room)** fully | The evidence layer is native here |
| Method | **B**, most expressive | Six stages, each with its limits stated. The clearest expression of the idea |
| Journal | **A**, reading-first | Long prose. The evidence layer appears only where an article cites a review |
| Work | **A** with record accents | Deliverables and licence terms use record density; the rest is editorial |
| Brands | **A**, restrained | Aggregation pages. Sparse by nature |
| About | **A** with a portrait at full scale | The most human page |
| Contact | **A**, quietest | A form should be calm |

**The rule:** editorial density governs reading; record density governs evidence. A page that is
all record density is a dashboard. A page that is all editorial density has no proof.

---

## 8. The method caveat

The six-stage Method is a **project mock concept**, created in Phase 0 and adopted in Phase 1 as
the information-architecture spine. It has not been verified as Zina's actual practice.

The visual system is designed around it because it is currently the spine. But the design must not
present it as an established, credentialed methodology. Concretely:

- The Method page is styled as **an author's stated approach**, not as a standard or a
  certification.
- No seal, badge, crest, monogram or trademark treatment. Nothing that implies accreditation.
- Every stage renders its `doesNotProve` field **at the same visual weight as its purpose**, never
  as small print. The limits are part of the claim, not a caveat to it.
- The word "protocol" is acceptable; "clinical", "validated", "certified", "proven" and
  "scientific" are not, in copy or in visual metaphor.

If the Method is later replaced by Zina's own, the visual system survives unchanged — it is
designed around *having a documented method*, not around these six particular stages.
