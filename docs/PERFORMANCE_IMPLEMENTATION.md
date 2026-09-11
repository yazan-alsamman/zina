# Performance Implementation

**Status:** Phase 4. Measured payloads; **no field or lab metrics yet** — that is Phase 9.

---

## 1. Measured page weight

An English review page, built:

| Asset | Size | Budget |
|---|---|---|
| HTML | **28.1 KB** | — |
| CSS | **19.9 KB** (one file, page-scoped) | — |
| **JavaScript** | **0 bytes** | ≤10 KB for this template |
| Fonts | **79.2 KB** (4 woff2, locale-split) | 180 KB per locale |
| Images | **0 bytes** — no photography exists | LCP ≤200 KB |
| **Total** | **≈127 KB** | **≤1 MB** |

Arabic: 31.5 KB HTML + 19.9 KB CSS + **151.9 KB** fonts ≈ **203 KB**.

The whole `dist/` directory, 12 pages plus all fonts and licences, is **644 KB**.

**Zero JavaScript is the headline number.** The review-page budget was ≤10 KB; the actual is zero,
because nothing on the page has client state. The mobile menu is a checkbox disclosure, the
evidence layer is static HTML, and there is no scroll-triggered animation.

---

## 2. Fonts — the largest controllable cost

`scripts/build-fonts.mjs` copies the needed subsets into `public/fonts/` and generates one
stylesheet per locale.

### Why a script rather than a bundler import

The locale is a **runtime value**; the import graph is **static**. Importing the font CSS in the
layout would attach *both* locales' faces to *every* page. Emitting real assets gives true locale
splitting, explicit preload control, stable cacheable URLs, and a payload measurable with `ls -l` —
which is how a budget is actually enforced.

An earlier attempt used `Astro.resolve()`, which was removed in Astro 3. The build failed loudly,
which is the correct outcome for a dead API.

### The budget check caught a real problem

The first run shipped weights 400 and 600 in both scripts:

```
en total:  99.2 KB / 180 KB   within budget
ar total: 207.2 KB / 180 KB   OVER BUDGET       ← the script exits non-zero
```

Over budget, on the locale most likely to be read on a mid-range Android.

**The fix came from the type system, not from compromise.** Auditing actual usage showed the 600
weights are referenced **nowhere**: display type is set at 400 throughout, and the only 500 in the
system is the Latin label tier and the active navigation item. Arabic labels are specified at 400
*precisely because* Arabic at ×1.12 already carries more visual mass
(`docs/BILINGUAL_TYPE_TEST.md` §5). "No weights below 400" is a floor, not an instruction to use
the ceiling.

Dropping the unused faces:

```
en total:  79.2 KB / 180 KB   within budget
ar total: 151.9 KB / 180 KB   within budget
```

**A face now ships only when something uses it**, and the script fails the build if a locale
exceeds 180 KB. Recorded as D4-3.

### What ships

| Locale | Faces |
|---|---|
| **en** | Plex Serif 400 *(preload)* · Plex Sans 400 *(preload)* · Plex Sans 500 · Plex Mono 400 |
| **ar** | Noto Naskh Arabic 400 *(preload)* · Plex Sans Arabic 400 *(preload)* · Plex Sans Arabic 500 · Plex Mono 400 |

Plex Mono ships in **both** locales because the record tier carries numerals, units and Latin
identifiers only — including inside Arabic prose. There is no Arabic monospace tradition, and
forcing one would read as a technical artefact rather than as a record.

**Two faces preloaded per locale**, not four: the display face and the UI face the first paint
needs. Preloading more would compete with the LCP image for bandwidth once photography exists.

`font-display: swap` throughout. **Metric-matched fallbacks are declared in the token stack**
(`Georgia` for the serif, `system-ui` for the sans) — an unmatched swap can consume the entire
0.05 CLS budget in one reflow, and font swap remains the largest named CLS risk in the system.

**Licensing:** all five families are SIL OFL 1.1, self-hosted, with their licence files copied
alongside. **29LT Zarid is commercially licensed and is NOT included** — no Zarid file is
downloaded, bundled or referenced anywhere in this repository. When a licence is obtained, add the
files to the script and swap two lines in `tokens.css`. **No component changes.**

**No third-party request.** No Google Fonts, no CDN, no tracking. Asserted in
`tests/output.test.mjs`.

---

## 3. CLS is prevented structurally

| Cause | Prevention |
|---|---|
| Images without dimensions | `width`/`height` **required** by `ImageAsset`. A missing dimension is a build error, not a runtime shift |
| Missing or slow images | `Frame` reserves space by `aspect-ratio` before anything loads |
| Font swap reflow | Metric-matched fallbacks + preload of the two first-paint faces |
| Late-injected banners | **There are none.** No cookie banner in the design |
| Entrance animation moving layout | The only animations are opacity fades on elements already in their final position |
| Lazy content pushing layout | Aspect-ratio boxes reserve space |

`tests/output.test.mjs` asserts every frame on every review page has a ratio reservation.

---

## 4. LCP strategy

| Template | LCP element | Treatment |
|---|---|---|
| Review, with photography | The hero | `loading="eager"`, `decoding="sync"`, `fetchpriority="high"`, no animation, no scrim, **no text over it** |
| Review, **current state** | The `h1` | Display font preloaded; there is no image above the fold |

`Frame` takes a `priority` prop; the hero is the only element on the page that passes `true`.
Everything else is `loading="lazy"` with `decoding="async"`.

---

## 5. Where the JavaScript went

| Feature | Conventional cost | Here |
|---|---|---|
| Mobile menu | 5–15 KB island + hydration | **0** — checkbox disclosure |
| Scroll-triggered entrance | 3 KB observer | **0** — not implemented (D4-7) |
| Image lazy-load | library | **0** — native `loading="lazy"` |
| Language switcher | client router | **0** — two links |
| Evidence layer | — | **0 by construction** |
| Animation | 30–100 KB library | **0** — two CSS keyframes |
| Icons | 30–60 KB library | **0** — no icon ships yet |

`tests/output.test.mjs` asserts **zero `<script>` tags** other than JSON-LD on every page.

---

## 6. CSS

19.9 KB for a page carrying twenty components, and Astro emits one page-scoped file rather than a
site-wide stylesheet.

Kept small by construction rather than by minification: no framework, no utility classes, four
layout primitives, four type helpers, and component styles scoped to the component that uses them.
`inlineStylesheets: "auto"` lets Astro inline small sheets and link larger ones.

**No `box-shadow` for elevation, no gradients, no blur, no `backdrop-filter`** — the three most
common causes of paint jank on mid-range Android are all absent by design rather than by
optimisation. `tests/output.test.mjs` asserts the only `box-shadow` in the output is the `inset`
one drawing the hollow stage marker, which is a border rather than elevation.

---

## 7. Images — the architecture, without the photography

No photography exists. `Frame` implements the architecture and renders the documented
no-photography state:

- Space reserved by aspect ratio → **no layout shift when real images arrive**
- A `/mock-media/` path is treated as **absent**, so no broken `<img>` and no console 404
- A neutral tone field at the correct ratio, on `ground.raised`
- **No icon, no "image unavailable" glyph, no broken-image symbol**
- Alt text retained via `role="img"` + `aria-label`
- Plate numbers, captions and hairlines retained, **so the composition is real**
- Art-directed ratios per breakpoint: hero 4:5 → 3:2 → 16:10; **evidence plates never re-crop**,
  because comparability is their function

**`astro:assets` was deliberately not wired up.** There is nothing to optimise, and adding `sharp`
plus an image pipeline for zero images is cost without benefit. When photography arrives, swapping
`<img>` for `<Image>` is a change to **one file**.

---

## 8. Budgets: specified vs measured

| Metric | Budget | Now |
|---|---|---|
| Review-page JS | ≤10 KB | **0 KB** |
| Fonts per locale | ≤180 KB | **79.2 / 151.9 KB** |
| Total mobile page | ≤1 MB | **≈127 / 203 KB** |
| LCP image | ≤200 KB | n/a — no image |
| LCP | <2.0 s | **not measured** |
| INP | <200 ms | **not measured** — there is no interaction to measure |
| CLS | <0.05 | **not measured** — structurally prevented |
| Paper grain | ≤4 KB | **0 KB** — generated in CSS, no asset (D4-5) |

**The three Core Web Vitals are not measured.** Lighthouse CI on a throttled mid-range Android
profile is Phase 9, and field data comes after launch. Nothing here claims a measured score.

---

## 9. Where this would first go wrong

Ranked, so Phase 5 knows where to look:

1. **Photography weight.** An image-led design with an unbriefed photographer produces 4 MB heroes.
   The budget is 200 KB for the LCP image.
2. **Font payload creeping back.** Someone adds a weight for one heading. The script's budget check
   is the defence, and it must stay in CI.
3. **An island added for something CSS can do.** The mobile menu is the precedent to point at.
4. **The paper grain re-implemented as a full-page overlay** rather than on the disclosure band.
5. **Review filters built client-side** when the index template lands — the crawlability cost is
   worse than the performance one.
