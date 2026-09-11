# Component Implementation

**Status:** Phase 4. **18 components built** — the five signature devices, the global shell, and
the review-page composition. Nothing speculative.

**The rule:** a component earns its existence through a real use case. Nothing was abstracted
before a second use case existed.

---

## 1. What was built, and what was not

| Phase 3 inventory (31) | Phase 4 | Why |
|---|---|---|
| Margin Index | **Built** — inside `ObservationTimeline` | It has exactly one use case; a standalone component would be an abstraction with one caller |
| Plate | **Built** | |
| Three Voices | **Built** — `ClaimBlock`, `ObservationTimeline`, `VerdictBlock` | Three files, because they are three different shapes |
| Disclosure Band | **Built** | |
| Conditions Well | **Built** | |
| Global Header, Footer, Locale Switcher, Skip Link, Breadcrumb | **Built** | |
| Review Metadata, Testing Summary, Method Stage Markers, Product Context, Related Content | **Built** | |
| Assessment (strengths/limitations/suitability) | **Built** | |
| Frame (media primitive) | **Built** | Not in the Phase 3 inventory. Earned its place: every image on the site needs ratio reservation and the no-photography state |
| Index Entry | **Not built as a component** | Its only caller is `RelatedContent`. It becomes one when the reviews index lands |
| Language Availability Indicator | **Not built** | Needs the reviews index to display on |
| Method Stage (full) , Method Boundary | **Not built** | Needs the Method page |
| Facet Group, Contact Form, Journal Entry, Work Project, Person Block, Review Navigation, Empty State, Partial State, Update Log, Search Result | **Not built** | No template needs them yet. Update Log is inline on the review page — one caller |

**18 built, 13 deferred.** Every deferral is "no caller yet", not "ran out of time".

---

## 2. The five signature devices

### DisclosureBand

```astro
<DisclosureBand locale type={DisclosureType} label statement additional[] />
```

| | |
|---|---|
| Semantics | `<section aria-label="Disclosure">` — a standing statement, not an alert, not a heading |
| Position | **Above the hero**, enforced by the page, asserted in tests |
| States | All six, prominence scaling with commercial entanglement: hairline → mineral → clay → **2px clay** → warning |
| Never | Truncated, collapsed, behind a toggle, revealed by script, animated |
| RTL | Rule and label at inline start |
| Texture | Paper grain at ~1.5% via two repeating gradients — **generated, no asset** (D4-5) |
| Forced colors | Grain removed, rule widened to 2px |
| Modifiers | `additional[]` renders as a **second line**, never a second badge |

**Six states are distinguished by an explicit text label**, never by rule colour alone.

### ConditionsWell

```astro
<ConditionsWell locale caption conditions={[{label, value}]} />
```

| | |
|---|---|
| Semantics | A real `<table>` with `<th scope="row">` and a caption |
| **320px fix (D3-2)** | `white-space: normal` on the value cell; `nowrap` on the **numeric isolate only** |
| **Bidi fix (D3-1)** | Values pass through `isolateValue()` — numeric run isolated `dir="ltr"`, Arabic unit outside |
| Alignment | Values at inline end so numerals form a column. **Measured aligned in both directions at all five widths** |
| Never | Outer border, cell borders, zebra striping, sorting, filtering, thermometer or droplet icons, any chart |

### ObservationTimeline (with the margin index)

```astro
<ObservationTimeline locale observations={ReviewObservation[]} headingId />
```

| | |
|---|---|
| Semantics | `<ol>` — they happened in sequence, and the sequence is meaning |
| **Margin index** | ≥1024 a 160px grid column; <1024 an inline marker row. **One element that changes position**, not two that show and hide — so it is announced once and keeps its relationship to its note at every width |
| Rule | Solid mineral at the inline start, running the full height of each entry |
| RTL | **Measured on the right** at 1024 and 1440, from logical properties alone |
| Markers | `recordMarker()` splits `الساعة 6` into an Arabic word in the UI face and a numeral in mono |
| Never | Accordion, tabs, tooltip, "show more", coloured pass/fail markers, motion that gates content |

### ClaimBlock

| | |
|---|---|
| Semantics | `<blockquote>` + `<cite>` with a visible label |
| **The dotted rule** | The signature. Reads as provisional — *someone else said this* |
| Colour | The quietest text on the page, measured 5.74:1 |
| Never | Quotation-mark decoration, an info icon, a coloured badge, any treatment that looks endorsed |

### Plate

| | |
|---|---|
| Semantics | `<figure>` + `<figcaption>` |
| Number | `Plate 03` / `لوحة 03`, zero-padded, numeral isolated |
| Caption rule | Hairline **beneath the caption** — the rule closes the caption rather than boxing the image |
| **Ratio** | **3:2, unchanged at every breakpoint.** Every other image is art-directed; evidence is not, because comparability is its function |
| Never | Before/after slider, lightbox, carousel, zoom, parallax, **any motion on the image** |

---

## 3. There is no Card

**Three contained surfaces exist on the whole site**, each recorded in Phase 3 with why editorial
structure could not do the job:

| # | Where | Implementation |
|---|---|---|
| C-1 | Suitability | `.suitability` — raised background, hairline border. The pairing is the meaning |
| C-2 | Related content | `.related` — raised band after the largest gap on the page |
| C-3 | Mobile menu | Full-screen overlay, opaque |

**Everywhere else uses the index treatment**: image, hairline, type. No container, no border, no
padding box, no shadow, no hover lift. `RelatedContent` is the component most likely to drift into
a card grid, and the rule is what prevents it.

`tests/output.test.mjs` asserts **no `border-radius` in the output other than 0 or 2px**, and no
`box-shadow` that is not the `inset` hollow-marker border.

---

## 4. CSS architecture

```
tokens.css     values only. :root and the locale root. No component selectors
global.css     reset, document, 4 layout primitives, 4 type helpers
*.astro        everything else, scoped by Astro
```

**Four layout primitives**, each justified by appearing on every template:

| Primitive | Purpose |
|---|---|
| `.container` | 1180px cap, auto margins, locale-aware inline padding |
| `.text-column` | `66ch` **maximum**, not a fixed width — so text reflows rather than truncates at 200% zoom |
| `.full-bleed` | Spans the page. See §5 |
| `.section` | Rhythm via `--space-section`, stepping 56 → 72 → 96 at the two real thresholds |

**Four type helpers:** `.display-lg`, `.display-md`, `.label`, `.record`.

**No magic numbers.** The only literals in component styles are `6px` (the mineral square — a mark,
not a measure) and `2px` (the plate-pair gap, deliberately hairline-sized).

### The label tier is the hardest piece

```css
.label            { text-transform: uppercase; letter-spacing: 0.08em; font-weight: 500; }
html[lang="ar"] .label { text-transform: none;      /* no case in Arabic */
                         font-weight: 400; }        /* one step lighter */
```

Latin gets uppercase and tracking. Arabic can use neither — no case, and tracking severs
letterforms. It reaches equivalent **volume** by different **means**: size up (×1.12 from the
locale root), weight down. Measured: **0 letter-spacing violations** in Arabic at all five widths.

---

## 5. `.full-bleed` — a bug the browser pass caught

The conventional recipe is:

```css
width: 100vw; margin-inline-start: 50%; transform: translateX(-50%);
```

**It is wrong here, and browser verification caught it.** `100vw` includes the scrollbar gutter, so
on Windows every full-bleed element overflowed the document by ~15px — at **every** width, in
**both** directions. Six offending elements per page, and the page scrolled horizontally.

The fix was to delete the breakout rather than patch it:

```css
.full-bleed { width: 100%; max-width: 100%; margin-inline: 0; }
```

These elements are already direct children of `<article>` inside `<main>`, which spans the body's
content box — the full width **minus** the scrollbar. The breakout was never needed. The class
stays as a semantic marker meaning *"this block spans the page and is not constrained to the
reading column"*.

It also removed the one direction-aware rule in the codebase (an RTL `translateX` override), so
there is now **no `[dir="rtl"]` block anywhere**.

Recorded as D4-4. `tests/output.test.mjs` asserts no page scrolls horizontally.

---

## 6. RTL

**Logical properties throughout**, and no second stylesheet:

`margin-inline` · `padding-inline-start` · `border-inline-start` · `inset-inline` ·
`text-align: start | end`

The entire Arabic layout comes from `dir="rtl"` plus two custom properties re-declared at the
locale root. Verified in-browser: the margin index sits on the correct side in both directions with
no direction-specific rule.

---

## 7. Props are content-shaped

Every component's props come from the content model, not from a design abstraction:

```astro
<DisclosureBand type={review.disclosure.primary} label={content.disclosureLabel} … />
<ConditionsWell conditions={content.conditions} />
<ObservationTimeline observations={content.observations} />
<MethodRelationship appliedKeys={review.testing.methodStageKeys} />
<Plate asset={EvidenceAsset} number={index + 1} />
```

There is no `variant="primary"`, no `size="lg"`, no `theme` prop. A component that needed one
would be a component doing two jobs.

---

## 8. Components not built, and what unblocks them

| Component | Unblocked by |
|---|---|
| Index Entry | The reviews index — it needs a second caller before it is a component |
| Language Availability Indicator | The reviews index, which is where it displays |
| Method Stage (full), Method Boundary | The Method page |
| Facet Group | The reviews index. **Crawlable URLs, not client state** (R-15) |
| Contact Form | The contact page |
| Journal Entry, Work Project, Person Block | Their templates |
| Search Result | ~200 reviews. Architecture in `docs/SEARCH_UX.md` |
| Empty State, Partial State | They are behaviours, not components — layout by count, implemented inline where each listing lands |

---

## 9. Forbidden variants, enforced

Each component's file header lists what it must never become. Three are machine-checked:

| Rule | Check |
|---|---|
| No radius above 2px | `tests/output.test.mjs` scans the built CSS |
| No elevation shadow | Same |
| No `<details>` in content | Same |
| No client-side JS | Same — zero `<script>` tags |
| No bare `<bdi>` | Same |
| Disclosure above the hero | Same — DOM index comparison |
| No link to a gated brand page | Same |
| All six method stages render | Same |
