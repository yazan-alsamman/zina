# Phase 12 Report — The Experience Layer

Design record and rationale: `docs/PHASE_12_EXPERIENCE.md`.
Phase 11 identity record, unchanged and preserved: `docs/PHASE_11_VISUAL_REDESIGN.md`.

---

## 1. Visual improvements

- **The homepage became a sequence with a rhythm** instead of seven equally loud sections. Three
  sections now carry no 3D at all (the marquee, the new discovery ledger, the "meet Zina" collage),
  which is what makes the remaining 3D moments read as events.
- **A new quiet section — "What I test"** — an editorial ledger of Zina's five areas of expertise
  with their details. No photograph, no product, no gradient trick: a number, a name, a line, a
  hairline. This is not new copy; `expertise[].detail` was already on the person record and was the
  one substantial thing the homepage never showed.
- **One full-bleed photographic band**, the site's only one, with the section heading set over its
  lower third on a deepened wash.
- **Editorial furniture**: outlined chapter marks, a vertical spine label (Latin only), section
  seams that fade one tonal ground into the next rather than cutting, a scroll-drawn rule, a lede
  and a pull-quote primitive.
- **Paper grain** over the whole document — a 160 px tile of fractal noise generated in the
  stylesheet, multiplied at a few per cent, above the 3D canvas so products share the page surface.
- **The review page's observation timeline** was raised into the editorial register: the hour is set
  large in the margin with the aspect beneath it as a small tracked caption.
- **Evidence plates** stopped reading as voids (see §17).

## 2. New 3D objects

Nine packages → **twenty-four**. Fifteen additions, each a different silhouette:

`ampoule` · `vial` · `mist` · `pump` (swan-neck lotion) · `toner` · `oil` · `palette` (open
eyeshadow, six pans, mirrored lid) · `brush` · `sponge` · `polish` (faceted) · `balm` ·
`highlighter` (closed dome, engraved rims) · `cleanser` · `powder` (loose-powder sifter jar) ·
`lipcase` (closed capsule)

New finishes: ceramic, brushed metal, satin (acid-etched) glass, translucent loose powder, flocked
foam, lacquered wood, bristle.

**All original.** Printed lettering is generic category vocabulary only — SÉRUM, CRÈME, BRUME,
TONIQUE, HUILE, NETTOYANT, LAIT, 30 ml. A test enumerates the permitted strings and fails on
anything else. No brand, no logo, no trade dress, no fictional product line.

**Material quality.** Clear glass was invisible on an ivory page at Phase 11's 5 %/10 % opacity — a
dropper rendered as a floating label under a floating cap. Raised to 12 %/20 % with a higher
environment intensity; frosted glass was the opposite problem and came *down* from 30 %/40 %; every
liquid fill was pulled well inside its shell on all three axes so the glass walls and shoulder
highlight read. Environment intensity is 1.0 on the page and 1.35 on the wine ground, where there
is no bright page for glass to reflect.

## 3. 3D movement and scroll choreography

A slot now declares **depth layer** (`back`/`mid`/`fore`), **spin** (radians of yaw travelled across
its scroll range), **approach**, **priority**, **light**, and optionally a **travel rail**
(`path` + `size`).

Per frame, for each slot on screen: a normalised progress through the viewport drives the camera
distance, the yaw, the drift, the key light's azimuth, and a presence envelope that scales a product
up as it enters and lets it recede as it leaves — nothing pops at the scissor edge.

**The visibility budget** (`src/scripts/cosmetics/budget.ts`): phone 2, tablet 3, laptop 5, large
desktop 6, chosen by `priority + prominence`. Whatever a page declares, only that many are drawn.
This is the rule that lets the catalogue be large and the frame stay quiet.

**The product journey** is used twice, deliberately: the homepage story section (a rail down the
outer side of the visual column — the package swings in across the photograph, out again, and
settles low beside the verdict, turning through most of a half-turn) and the review page (the same
package opens the review on its still-life stage and lands in the verdict card's empty half).

**A real bug was found and fixed by looking at renders**: the first `approach` implementation pulled
the camera *inside* the distance at which a normalised model exactly fills its slot, slicing tall
packages off at their own scissor rectangle. Approach now starts further out and returns; depth is
expressed by pushing the other layers back; framing factors are all ≥ 1 and clamped; a test names
the rule.

## 4. Which sections received 3D

| Surface | 3D |
|---|---|
| Home — opening | 3: serum (`fore`, the anchor), cream jar (`mid`), lipcase (`mid`) |
| Home — marquee | none |
| Home — discovery ledger | **none, by design** |
| Home — story | 1 travel rail (tablet up), 1 fixed slot (phone only) |
| Home — ritual | 1 `back` brush |
| Home — full-bleed band | none |
| Home — recent | one per review card |
| Home — meet Zina | **none, by design** |
| Home — closing (wine) | perfume (`fore`, `light="wine"`), balm (`back`, wide only) |
| Review detail | category package on the stage; the same package `fore` in the verdict card |
| Index/legal openings | 1 `mid` + 1 `back` (wide only) via `PageHero` |
| Footer | perfume (`mid`), vial (`back`, wide only) |

## 5. Responsive improvements

Breakpoint **tokens** (`--bp-*`) are read by the 3D budget, so CSS and JavaScript cannot drift.

- **Phone**: portrait first, two products maximum, several sections with none, ledger compressed.
- **Tablet (768–1024)**: not a large phone — the ledger opens to three columns, the band flattens
  from a portrait crop to a cinema crop, the travelling product appears.
- **1366×768**: a dedicated short-viewport block. The whole hero — eyebrow, headline, intro, both
  calls to action, attribution, portrait, three products, records card and the scroll cue — fits
  above the fold. Verified in-browser.
- **1600+/1920+**: more margin and larger display type, not more content; `--layout-max-content`
  caps the grid at 1560 px. The hero's height is capped at 54 rem and its grid centred, because on
  a 1440-tall screen `100svh` alone left a third of the section empty below the composition.

## 6. Motion system

Four tiers: `micro` 200 ms · `standard` 420 ms · `editorial` 900 ms · `cinematic` 1600 ms, alongside
the Phase 11 names which remain canonical for the first three. Easings unchanged
(`silk` for anything editorial). Every duration collapses to 0 ms under `prefers-reduced-motion`,
asserted by test; `instant` (100 ms) is the one documented exception, because it is a state change
rather than motion.

## 7. Photography improvements

Two Phase 11 exclusions reversed after re-review, with reasons recorded in `src/lib/photography.ts`:

- **`beautyCloseup`** — the only frame where complexion, brow, lash and highlighter are legible at
  full-bleed width. Now the homepage's one full-bleed band.
- **`studioFullLength`** — the only full-length frame, and the only one with enough empty ground for
  oversized type to cross it. Registered; not yet placed.

The automotive series remains excluded for the original reasons. `EditorialImage` gained a `lens`
mask, a square-cut `none` mask (not every photograph belongs in a card) and a `tone` prop whose
`deep` setting darkens the lower half enough for a heading to sit over it at any crop.

## 8. Typography improvements

`--type-display-mega` for chapter marks; `--type-tracking-mega` (Latin only) so display numerals
close up at extreme sizes; `--type-measure-lede`; the `.lede`, `.pull-quote`, `.vertical-label` and
`.section-mark` primitives. The vertical label lies flat and untracked under `[lang="ar"]`. The
observation timeline's hour is set at 1.6 rem but **stays in the record tier (tabular Jost)** — it
is a measurement, and Phase 11's rule that measurements are never set in the display serif stands.

## 9. Micro-interactions

One sheen crossing a button as the pointer settles (the same gesture the 3D caps make; the only
purely decorative motion on the site, so there is exactly one of it), a press scale, drawn
underlines from the reading edge on footer links, image zoom within its mask, product tilt and light
response to the cursor on fine pointers only, and the existing nav underline. Nothing hover-only
carries information.

## 10. Performance measurements

Measured against the production build over a local server in Chrome.

| | |
|---|---|
| Initial load (homepage) | **11 requests, 243 KB** — HTML, two font faces, stylesheets, the LCP portrait |
| Loader script | **1,728 B raw / 996 B gz** — unchanged from Phase 11 |
| 3D scene chunk | **589,559 B raw / 150,859 B gz**, loaded after `load` + idle |
| Phase 11 scene chunk, for comparison | 578,055 B raw / 147,325 B gz |
| **Cost of 15 new packages + the whole choreography system** | **+3.5 KB gzipped** |
| Homepage HTML | 50,759 B raw / 9,240 B gz |
| Largest page stylesheet | 38,901 B raw / 8,166 B gz |
| Fonts on disk, both locales | 260 KB (one locale is loaded per page) |
| Total after the 3D layer arrives | 17 requests, 1.05 MB |
| **Cumulative Layout Shift** | **0** |
| DOMContentLoaded / load | 655 ms / 801 ms |

LCP was not captured by the harness (the entry did not buffer); the LCP element is the eager,
high-priority, width/height-attributed portrait, and CLS of 0 confirms nothing moves under it.
FCP figures from this run are not meaningful — the browser is rendering WebGL in software.

Preserved: lazy Three.js, one WebGL context, visibility pausing, tab-hidden pausing, reduced pixel
ratio on small screens, geometry and material sharing (a test asserts repeated packages clone rather
than rebuild), per-locale fonts, WebP with JPEG fallback at several widths.

## 11. Accessibility results

Verified in-browser, not inferred:

- **Reduced motion**: 0 running animations, marquee stopped, products hold a still pose, travel
  rails pin to their path midpoint, **0 elements left invisible** (versus 17 mid-reveal in the
  default mode, all of which resolve on scroll).
- **Scroll reveals never strand content**: walking the entire homepage and returning to the top
  leaves **no** element at opacity < 0.05.
- **Save-Data on**: no scene chunk requested, no canvas created, the designed glow fallback stays.
- **WebGL unavailable**: same — no chunk, no canvas, composition preserved.
- **JavaScript disabled**: page complete, all 13 slots showing their fallback, heading intact.
- **Keyboard**: 14 consecutive tab stops, every one visible on screen with a visible focus ring, in
  document order, starting with the skip link.
- **Tap targets**: footer, breadcrumb, language switcher and method links were 19–23 px tall — below
  the 24×24 CSS-pixel minimum (WCAG 2.5.8). All raised to 26–28 px.
- **Contrast**: all 37 required pairs pass (`npm run validate:contrast`).
- **Decorative 3D**: every slot `aria-hidden`, the shared canvas `aria-hidden` + `role="presentation"`,
  both asserted by test.
- `npm run validate:ux`: 30/30 a11y coverage, 0 anti-patterns flagged.

## 12. SEO verification

No change to the SEO architecture, and none needed. Existing assertions all still pass: canonical
and hreflang on every page from the configured origin, `og:*`/`twitter:*` with an emitted same-origin
image and alt, Person JSON-LD only, no rating/offer/Organization/award schema, sitemap and robots
unchanged, exactly one `h1` per page, no skipped heading level, no dead internal link, no link to an
unimplemented route, outbound links `nofollow` except the one confirmed `rel="me"` profile.

The two new photographs are additional `astro:assets` outputs; no metadata changed. The new
interface strings are section labels, not SEO text.

## 13. Tests changed

Three, all in the same direction — **wider coverage, not weaker**:

1. **`tests/global.test.mjs`** and **`tests/output.test.mjs`** — the radius, shadow and gradient
   assertions read `dist/_astro/*.css` and nothing else. `inlineStylesheets: "auto"` means Astro
   inlines most component stylesheets into each page's `<head>`, and component stylesheets are
   exactly where a one-off radius or a grey drop shadow gets typed, so those three rules were
   passing over most of the CSS on the site. They now use `tests/helpers/css.mjs`, which reads both
   external files and every page's inline blocks. Strictly a wider net; nothing violated it.
2. **`tests/output.test.mjs`** — the review page's plate grid changed the plate *ratio* to 1/1 for
   even counts, which contradicted the documented rule that a plate's shape never varies (an hour-0
   frame and an hour-8 frame are only comparable if they are the same rectangle). The layout now
   pairs plates at their unchanged ratio; no assertion was relaxed.

No test was modified to make the build pass.

## 14. Tests added

**`tests/cosmetics.test.mjs`** — builds all 24 packages in Node with a stub canvas: catalogue floor
of 18, no NaN vertices, vertex budgets, unit-sphere normalisation, geometry sharing between clones,
framing factors ≥ 1, generic-labelling only, and a **silhouette comparison** (each package reduced
to its widest radius in eight horizontal bands plus its overall proportion) that fails when two
packages are the same object in different colours. It caught a real duplicate on its first run.

**`tests/phase12.test.mjs`** — against the production build: every declared kind exists, at least 12
of the catalogue actually appear somewhere, every layer is one the scene implements, every travel
path parses and stays inside its rail, the visibility budget returns the intended numbers at each
breakpoint, at least three homepage sections carry no 3D, every slot stays `aria-hidden`, one WebGL
context, the Save-Data and WebGL guards survive in the loader, the fallback glow exists, every
motion token is zeroed under reduced motion, all four motion tiers exist, every shadow token is
wine-tinted, the breakpoint tokens are read by the scene, the product-scale ladder is used, the
grain is inline and no stylesheet requests anything external, no `100vw` sizing and no `min-width`
above 360 px, `overflow-x: clip` survives on both `html` and `body`, every image is built/sized/lazy
with at most one eager image per page, WebP with a JPEG fallback, and the two new photographs carry
descriptive alt text in both locales.

**`tests/helpers/css.mjs`**, **`tests/helpers/cosmetic-kinds.mjs`**, **`tests/helpers/ts-resolve.mjs`**
— supporting helpers; the kinds list is read from `models.ts` rather than copied, so it cannot drift.

## 15. Full test result

```
tests 478   suites 109   pass 478   fail 0   skipped 0   todo 0
```
(Phase 11 baseline: 449 passing. +29.)

`npm run validate:content` PASS · `validate:journal` PASS · `validate:contrast` PASS (37/37) ·
`validate:ux` PASS · `astro check` 0 errors, 0 warnings, 0 hints.

**Browser sweep**: 12 viewports (360×800, 390×844, 430×932, 768×1024, 820×1180, 1024×768, 1280×800,
1366×768, 1440×900, 1600×900, 1920×1080, 2560×1440) × 12 routes in both locales —
**no horizontal overflow, no clipped text, no tap target under 24 px, on any combination.**

## 16. Production build result

`npm run build` — **85 pages, exit 0**, no errors and no warnings other than Vite's standard
chunk-size notice for the (intentionally large, intentionally lazy) Three.js chunk.

`npm run guard:mock` — **still fails, by design.** The mock content layer is unchanged and the guard
was not touched, weakened or bypassed. This build must not be deployed until real content replaces
it; see `docs/REAL_CONTENT_MIGRATION.md`.

## 17. Remaining limitations

- **Review evidence photography still does not exist.** The plates are now clearly *reserved* — a
  hairline inset, four corner registration ticks, and a label naming the gap in both languages —
  rather than empty tonal fields, and the alt text already describes what each frame will show. When
  real frames arrive, `src` starts resolving and the placeholder branch in `Frame.astro` stops
  running: a change to one file.
- The 3D layer needs WebGL. Without it (or with Save-Data) products fall back to a designed glow
  that keeps the composition's balance — verified, not assumed.
- CSS scroll-driven reveals run in Chromium and Safari 26+; elsewhere content shows statically,
  which is the correct degradation.
- Arabic interface strings added in Phase 11 and Phase 12 still need native review (open question
  Q3-2). Six new strings this phase: `expertiseEyebrow`, `expertiseHeading`, `journeyLabel`,
  `recentEyebrow`, `closingEyebrow`, `chapterLabel`, plus `plateReserved`.
- `studioFullLength` is registered and described but not yet placed in a composition.
- LCP was not captured by the measurement harness; CLS (0) and the image's eager/priority/intrinsic-
  size attributes are the evidence offered instead.

## 18. Decisions deliberately not implemented

- **A custom cursor.** The brief invites one and explicitly permits declining it. It would put
  pointer tracking and a rAF loop on every page — including those with no 3D — for an effect that is
  invisible on touch and says nothing a hover state does not already say. Restraint is worth more
  here than the trick.
- **A second WebGL context, or a canvas per product.** One shared, scissored context, unchanged.
- **Transmission-pass glass.** Many small viewports per frame; a transmission render target per
  viewport multiplies GPU cost for a gain barely visible at these sizes.
- **Atmospheric particles.** Listed as an option; on a beauty page they read as snow. The paper
  grain does the tactile work instead, for no request and no per-frame cost.
- **A fourth hero product.** It had no spatial relationship to anything — the shared canvas sits
  above photography by design, so it could not be tucked behind the portrait to read as depth. Three
  grouped objects are the composition; a fourth floating in the margin is the "floating icon"
  cliché the brief names.
- **Setting the timeline's hour in the display serif.** It is a measurement. Scale changed, tier did
  not.
- **Any change to the mock-content guard, the content gates, or the SEO architecture.**
