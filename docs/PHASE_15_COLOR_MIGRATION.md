# Phase 15 — The Colour Migration

The Phase 11 "Blush Atelier" palette (ivory, blush, powder, deep rose, burgundy, wine) was replaced
across all 87 routes with a five-colour system:

```
WHITE  →  LIGHT GREY  →  WARM BEIGE  →  MOCHA BROWN  →  BLACK
#FFFFFF    #EAEAEA       #B8A48F        #4A3F35         #000000
```

This was a **colour** migration only. No route, layout, component, interaction, animation,
responsive rule, photograph or piece of content changed. The specification lives in
`docs/COLOR_SYSTEM.md`; this document records how the change was made and what it cost.

---

## 1. Why the token architecture carried it

Phase 11 left a note in `src/styles/tokens.css` saying that semantic names are preserved so that
one file can re-skin the site. Phase 15 is the test of that claim, and it held.

`--color-ground-base`, `--color-accent-clay`, `--color-text-muted` and the rest kept their **roles**
and changed their **values**. `clay` now resolves to mocha brown rather than deep rose; `mineral`
to umber rather than plum. The legacy `--palette-*` spellings (`ivory`, `blush`, `powder`, `petal`,
`champagne`, `wine`) were **aliased into the new ladder** rather than deleted, so not a single
component had to be rewritten to keep compiling.

The work that remained was the colour that had escaped the token layer: literal hex and `rgb()`
values inside component `<style>` blocks, the 3D material definitions, the cinema shaders, and the
two generated brand assets.

---

## 2. The one rule that had to be invented

The brief assigns warm beige to links, active navigation, focus states and hover text. Measured,
`#B8A48F` on white is **2.40:1** — roughly half the AA threshold, and below even the 3:1 non-text
minimum. Applied literally it would have made links, focus rings and hover states unreadable.

The resolution keeps the colour exactly where the brief wants it to be *felt* while never putting
it where it cannot be *read*:

> **Warm beige is a surface on light grounds and a foreground on dark ones.**

- A link is mocha and hovers to black — but its **underline** goes warm beige and thickens.
- A button **fills** with warm beige on hover and its type switches to black (8.74:1).
- The active navigation item is marked by a warm beige **rule**, not warm beige type.
- On mocha, beige lifted 18% towards white reaches **5.08:1** and becomes the accent voice outright.

`tools/check-contrast.mjs` records the two forbidden pairs as deliberate failures, so the
measurement that justifies the rule is printed in the output rather than remembered.

---

## 3. Derived tints

Five colours cannot furnish a layered editorial page. Ten intermediate values were added, each a
straight linear **mix of two of the five**, each carrying its mix in a comment so it can be
rederived. Three grounds between white and beige (porcelain, linen, nude), a decorative sand, a
border taupe, two recessed text tones, two lifted/shaded beiges for dark grounds, and one shadow
tint.

Nothing else was invented. After the migration the entire built site — HTML, CSS and the 3D
bundle — contains **18 distinct hex values and 7 `rgb()` triples**, all from that set.

---

## 4. What changed outside the token file

| Surface | Change |
|---|---|
| `global.css` | Dark section re-mapped to mocha; new `.tone-accent` beige band; new `.tone-nude`; hairlines step down on grey grounds; buttons rebuilt on CTA tokens; `.btn--secondary` added |
| `SiteHeader` | Fullscreen mobile menu on mocha; nav active state is a 2px warm beige rule; CTA takes the primary treatment |
| `FilmStage`, `EditorialImage`, `Frame`, `ReviewEntry`, `VerdictSeal`, `VerdictBlock`, `SiteFooter` | Overlays, vignettes and decorative rules re-tinted at their existing opacities |
| Homepage, review pages | Section washes, card gradients, ghosted numerals, step badges, result rules |
| `cosmetics/materials.ts`, `models.ts` | The rendered products re-toned; tint **keys** unchanged (they are an API the pages and tests address) |
| `cinema/atmosphere.ts`, `stage.ts`, `cosmetics/scene.ts` | Haze, glow and the three-point lighting rigs neutralised to warm white and beige |
| `build-favicon.mjs`, `build-og-image.mjs`, `favicon.svg` | The mark is now the white arch on a mocha tile; both assets regenerated |
| `BaseLayout` | `theme-color` → `#FFFFFF` |

Shadows moved from wine-tinted to **mocha-tinted**, at lower opacities — the identity is flat and
editorial with controlled depth, not lifted. There is still no grey and no pure black in the ladder.

---

## 5. What was deliberately NOT recoloured

- **The photography.** No filter, no duotone. Where a component already carried an overlay for
  caption legibility, that overlay was re-tinted at the opacity it already had.
- **Greyscale bump/roughness canvases** in the pressed-powder material — height data, not colour.
- **The `#000` luminance mask** on the marquee — a mask, not a colour.
- **Historical phase documents.** `PHASE_2`, `PHASE_11`, `PHASE_12`, `PHASE_13` and `PHASE_14`
  describe palettes that were correct when written. They are a record, not a specification.
  `docs/COLOR_SYSTEM.md` is the living spec and was rewritten.

---

## 6. Verification

| Check | Result |
|---|---|
| `node tools/check-contrast.mjs` | **46/46 required pairs pass** |
| Reading ladder on white | primary 10.23 · secondary 8.03 · muted 7.20 · strong 21.00 — all AAA |
| `npm test` | **493/493 pass** |
| `astro check` | 0 errors, 0 warnings, 0 hints |
| `astro build` | 87 pages |
| Token resolution sweep | every `var(--token)` in `src/` resolves to a definition |
| Built-output colour sweep | no hex or `rgb()` outside the system |

Three tests asserted the old wine shadow tint by literal RGB (`tests/output.test.mjs`,
`tests/phase12.test.mjs`); their regexes were updated to the mocha tints. Their **intent** — warm,
never neutral grey or black — is unchanged and still enforced.

`npm run verify` still fails at `guard:mock`, as it did before this phase: the site is on the mock
content layer and the guard exists to stop that shipping. See `docs/REAL_CONTENT_MIGRATION.md`.
