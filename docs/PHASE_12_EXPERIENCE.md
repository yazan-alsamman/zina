# Phase 12 — The Experience Layer

Phase 11 built the "Blush Atelier" identity: the palette, the type system, Zina's photography and
a nine-package 3D cosmetics layer on one shared WebGL context. Phase 12 did not replace any of it.
It took the same identity and made it *directed*: a page that has a rhythm rather than seven equally
loud sections, a 3D layer that behaves like a set rather than a scatter of objects, a shadow and
motion system with tiers rather than one setting, and responsive compositions at every width from
360 to 2560 instead of one composition that scales.

Content, routes, SEO, the bilingual system, the MOCK/VERIFIED gates and the mock-content guard are
unchanged. No factual claim was added anywhere; the only new strings are interface vocabulary.

---

## 1. The choreography system

The Phase 11 slot model survives intact and is the reason this phase was cheap: a `FloatingCosmetic`
is still **only a rectangle in the layout**, and the shared scene draws into it. Layout, art
direction and responsiveness stay in CSS. What changed is what a slot may *declare*.

| Attribute | What it controls |
|---|---|
| `layer` | `back` / `mid` / `fore`. Camera distance, cursor and scroll response, contact-shadow weight, and rank in the visibility budget. |
| `spin` | Radians of yaw travelled across the slot's scroll range — the product arrives at one angle and leaves at another. |
| `approach` | How far back the product starts and returns, settling at the neutral distance mid-range. |
| `priority` | Art-direction weight when the budget has to choose. |
| `path` + `size` | A **travel rail**: the slot becomes a tall corridor and the product is drawn into a small box moving along the path as the section scrolls. |
| `light` | `wine` raises environment intensity and the rim light, because glass on a dark ground has nothing to reflect. |
| `desktopOnly` / `wideOnly` | Removes the slot below 768 / 1024. |

### The visibility budget

`src/scripts/cosmetics/budget.ts` — **phone 2, tablet 3, laptop 5, large desktop 6.** Whatever a
page declares, only that many are drawn per frame, chosen by `priority + prominence`, where
prominence peaks as a slot reaches the middle of its range. This is the rule that lets the
catalogue be large and the composition stay quiet: the system is big, the *frame* is not, and the
composition hands off from one product to the next as you scroll rather than showing all of them.

It lives in its own module, free of any Three.js import, so it is unit-tested directly
(`tests/phase12.test.mjs`) rather than inferred from a screenshot.

### The product journey

Used **twice on the whole site**, deliberately:

- **Homepage, the story section.** A rail down the outer side of the visual column. The review's
  category package enters far out at the top, swings in across the photograph, moves back out, and
  settles low beside the verdict, turning through most of a half-turn on the way. It never reaches
  the middle of the frame, because the middle of the frame is Zina.
- **Review pages.** The same package opens the review on its still-life stage and lands in the
  verdict card's empty half on the wine ground — the last stop of the journey.

### The camera rule (and the bug it fixed)

Every model is normalised to a unit bounding **sphere**, so at the neutral camera distance each one
exactly fills its slot with a small margin. The first implementation of `approach` pulled the camera
*inside* that distance at the middle of the range, which sliced tall packages off at their own
scissor rectangle — visible as a flat cut across a mist bottle on the About hero.

The rule now is: **nothing may ever move the camera closer than neutral.** Approach starts further
out and returns; depth between layers is expressed by pushing `back` and `mid` away rather than
pulling `fore` in; `COSMETIC_FRAMING` factors are all ≥ 1 and clamped. A test names the rule.

---

## 2. The catalogue: nine packages → twenty-four

`src/scripts/cosmetics/models.ts`. Every addition is a different silhouette, not a recolour.

| Phase 11 | Phase 12 additions |
|---|---|
| serum (dropper), jar (open cream jar), lipstick (open, cap beside), perfume, compact (open), foundation, mascara, gloss, tube | ampoule, vial, mist, pump, toner, oil, palette (open eyeshadow), brush, sponge, polish, balm, highlighter (closed dome), cleanser, powder (loose-powder sifter jar), lipcase (closed) |

New finishes in `materials.ts`: ceramic, brushed metal, satin (acid-etched) glass, translucent loose
powder, flocked foam, lacquered wood, bristle — alongside Phase 11's metal, gloss, matte, pearl,
glass, liquid, satin, pressed powder and mirror.

**All packaging remains original.** Printed lettering is generic category vocabulary only — SÉRUM,
CRÈME, BRUME, TONIQUE, HUILE, NETTOYANT, LAIT, 30 ml — never a real brand, never a logo, never a
fictional line that could read as a product of Zina's. A test enumerates the permitted strings.

### Glass, and why it was invisible

Clear glass shipped at 5 % / 10 % opacity in Phase 11. On an **ivory page** that is no glass at all:
a dropper bottle rendered as a floating label under a floating cap, because the only things with
any opacity were the liquid and the printed band. Phase 12 raised the clear pair to 12 % / 20 % with
a higher environment intensity, lowered the *frosted* pair (which was the opposite problem — a
frosted bottle read as a milky brick), and pulled every liquid fill well inside its shell on all
three axes so the glass walls and shoulder highlight can be seen.

### The silhouette test

`tests/cosmetics.test.mjs` builds all twenty-four packages in Node (with a stub canvas) and checks
for NaN vertices, vertex budgets, unit normalisation, geometry sharing between clones, and — the
one that matters for this phase — that no two packages are the same object. Bounding-box proportions
are not enough: every axially symmetric bottle has the same width and depth, so that measure
collapses to one number and unrelated packages collide by coincidence. Each package is reduced to
its **widest radius in eight horizontal bands**, and two packages are the same only if both that
outline and their overall proportion match. It caught a real duplicate on its first run: `toner` and
`pump` had been built at identical slenderness. The toner was rebuilt broader and squatter, which is
also the honest form for the category.

---

## 3. Rhythm: the page as a sequence of scenes

Phase 11's homepage had seven strong sections and every one of them was loud — photography plus
products plus a headline, seven times. A page that never rests has no peaks.

```
VISUAL   opening    portrait, three products, one of them the anchor
texture  marquee    the categories, moving
QUIET    discovery  WHAT she tests — type and rules only.  No photograph, no product.
VISUAL   story      the proof, with ONE product travelling the section
VISUAL   ritual     the six stages, one background product
         band       a full-bleed beauty frame carrying the section's own heading.  No product.
VISUAL   recent     three review cards
QUIET    meet       the collage — two photographs of her, and no packaging at all
QUIET    closing    her sentence, on the wine ground
```

**The discovery section is new and is not new copy.** `expertise[].label` and `.detail` were already
on the person record and were the one substantial thing the homepage never showed. It answers the
question the page previously skipped between "here she is" and "here is a review", and it does it
with a ledger — a number, a name, a line of detail, a hairline. Nothing boxed, nothing shadowed,
nothing rounded. That restraint is the section.

**The "meet Zina" collage lost its nail polish.** The section is two photographs of her; a product
beside them was competing for the one thing that section is about. Three sections now carry no 3D at
all, and a test asserts it — scarcity is what makes the remaining 3D moments read as expensive.

---

## 4. Photography: two exclusions reversed

Phase 11 selected eleven of twenty-two supplied photographs. Two exclusions were re-reviewed and
reversed, because the Phase 12 compositions ask for two things the eleven could not supply:

- **`beautyCloseup`** (photo 16) was filed as a duplicate of the red editorial. It is not: the red
  editorial is a wide, full-length fashion frame; this is a tight **beauty** frame where complexion,
  brow, lash and highlighter are legible at full-bleed width. For a publication whose whole subject
  is how a formula behaves on skin, it is the most on-brief photograph in the set — and nothing else
  in the eleven can carry a full-bleed band. It is now the homepage's one full-bleed moment, with
  the "Recent reviews" heading set over its lower third.
- **`studioFullLength`** (photo 6) was filed as a duplicate of the monochrome studio series. The
  series is waist-up; this is the only full-length frame and the only one with enough empty ground
  for oversized type to cross it without covering her. Registered and available; not yet placed.

The automotive series remains excluded, unchanged and for the original reasons.

`EditorialImage` gained two masks — `lens` (a shallow bowed band) and `none` (square-cut full-bleed,
because not every photograph belongs in a card) — and a `tone` prop, where `deep` darkens the lower
half enough for a heading to sit over it at every crop.

---

## 5. Surface, motion, shadow, type

- **Paper grain.** A 160 px tile of monochrome fractal noise, generated in the stylesheet as an
  inline SVG filter — no request, no asset, no third party — multiplied over the document at a few
  per cent. It sits *above* the 3D canvas so rendered products share the page's surface rather than
  floating on it, and below the header. Suppressed under 768 px and in forced-colors.
- **Motion, four tiers.** `micro` 200 ms · `standard` 420 ms · `editorial` 900 ms · `cinematic`
  1600 ms, alongside the Phase 11 names which remain the canonical spelling of the first three. Every
  one collapses to 0 ms under `prefers-reduced-motion`, asserted by test.
- **Shadow, four steps.** `subtle` → `soft` → `float` → `hero`, every one wine-tinted. A test reads
  the token definitions and rejects any neutral grey or black.
- **Editorial furniture.** Section marks (outlined numerals behind a section), vertical spine labels
  (Latin only — they lie flat and untracked in Arabic), a lede, a pull quote, a scroll-drawn rule,
  and section seams that fade one tonal ground into the next instead of cutting.
- **One sheen.** A single pale band crosses a button as the pointer settles on it — the same gesture
  the 3D caps make. It is the only thing on the site that moves purely for pleasure, so there is
  exactly one of it.

---

## 6. Responsive

Breakpoint **tokens** (`--bp-sm/md/lg/laptop/xl/xxl`) are numbers, not media queries — a custom
property cannot appear in an `@media` condition. They exist so the one place that genuinely needs the
values at runtime, the 3D visibility budget, reads the same numbers the stylesheet is written
against instead of keeping its own copy. A test asserts the scene reads them.

- **Phone (360–480).** Portrait first, then the headline. Two products at most, and several sections
  have none. The ledger compresses to number-over-name-over-detail.
- **Tablet (768–1024).** Not a large phone: the ledger opens into three columns, the band flattens
  from a portrait crop to a cinema crop, and the travelling product appears because there is now
  margin for it to cross.
- **Laptop, and 1366×768 specifically.** A short viewport, not a narrow one. A dedicated
  `(min-width: 1280px) and (max-height: 820px)` block tightens vertical rhythm while horizontal
  rhythm keeps growing: the portrait loses height rather than the headline losing size, so the hero
  and both calls to action still fit above the fold.
- **1600+ / 1920+.** More **silence**, not more content. `--layout-max-content` caps the grid; what
  grows is the margin around it and the scale of the two things that carry the page — the portrait
  and the display type. The band goes to 2.6:1, then 3:1.

---

## 7. Fixes this phase made to things that were already wrong

Found by the browser sweep across twelve viewports × twelve routes, not by inspection:

| Problem | Fix |
|---|---|
| At 360 px the tracked Latin wordmark pushed the menu trigger off the screen (clipped, so it never showed as a scrollbar) | The wordmark gives way: fluid size and tracking down to a floor where it is still the same mark |
| At exactly 1024 px the desktop nav row was 2 px too wide and the language switcher was pushed past the edge | Nav gaps and the CTA's padding close up first |
| Footer, breadcrumb, switcher and method links were 19–23 px tall — below the 24×24 CSS-pixel minimum (WCAG 2.5.8) | All raised to 26–28 px as padding, so baselines are unchanged |
| The About collage's inset photograph overhung further than the page gutter, and in **RTL** that overhang was on the scrollbar side | The collage narrows and the overhang halves below 1024 |
| A set of three evidence plates stacked full-bleed: at 1366×768 that is one screen of empty tonal field per plate | Plates pair up from two onward at their own unchanged ratio — the shape must not vary, because comparability is what a plate is for |
| Reserved plates read as voids | A hairline inset, four corner registration ticks, and an interface label naming the gap. The alt text already described the frame for screen-reader users; now everyone can see the plate is reserved rather than broken |

### The test audit finding

The Phase 11 design-system tests — every radius is a token, no neutral shadow, every gradient colour
is in the palette — read `dist/_astro/*.css` **and nothing else**. But `inlineStylesheets: "auto"`
means Astro inlines most component stylesheets into each page's `<head>`, and component stylesheets
are exactly where a one-off radius or a grey drop shadow gets typed. Those three tests were passing
over most of the CSS on the site.

`tests/helpers/css.mjs` now collects both halves and all three assertions run against everything a
browser receives. This is a strictly wider net than the one it replaces; nothing in the existing
design system violated it, which was worth proving rather than assuming.

---

## 8. Decisions deliberately not taken

- **No custom cursor.** The brief invites one and permits declining it. It would put pointer
  tracking and a rAF loop on every page including those with no 3D, for an effect that is invisible
  on touch and adds nothing a hover state does not already say. The site's restraint is worth more
  than the trick.
- **No second WebGL context, ever.** One canvas, scissored per slot, unchanged from Phase 11.
- **No transmission pass on glass.** The scene renders many small viewports per frame; a
  transmission render target per viewport would multiply GPU cost for a gain that is barely visible
  at these sizes. Glass is still a two-shell build with clearcoat.
- **No evidence photography invented.** The plates stay reserved and honest. When real frames
  arrive, `src` starts resolving and the placeholder branch in `Frame.astro` stops running — a
  change to one file.
- **The record tier stayed Jost.** The observation timeline's hour is set much larger, but it is
  still tabular Jost, not the display serif: it is a measurement, and Phase 11's rule that
  measurements are never set in the serif stands. Scale changed; voice did not.
- **The mock-content guard was not touched.** `npm run guard:mock` still fails by design.
