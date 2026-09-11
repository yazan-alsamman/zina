# Material Language

**Status:** Phase 2 decision.

Texture is the highest-risk, lowest-cost way to make a dark editorial site feel expensive — and the
fastest way to make it feel noisy and slow. This document is mostly a set of restrictions.

**The rule: texture appears in three places on the entire site. Everywhere else the surface is
flat.**

---

## 1. The material reference

The site's material world is **ink, paper and pigment** — a printed document that has been handled.
Not glass, not metal, not glossy cosmetics packaging.

| Material | Where it lives | How it appears |
|---|---|---|
| **Ink** | The ground | Colour temperature only. Warm `#12100D`, never a texture |
| **Paper** | Disclosure band, method well | A grain at 3% opacity. Barely perceptible |
| **Pigment** | The clay accent | Colour only. Drawn from cosmetic pigment, not from metal |
| **Film** | Editorial photography | A grade, applied in the image, never as a CSS overlay |
| **Cream, powder, liquid** | **Photography only** | Never an interface texture |

The last row is the important one. Cosmetic textures are the subject of the photography. Reproducing
them in the interface — a "powder" gradient, a "cream" blur — would be the site imitating its own
subject matter, which is the definition of decoration.

---

## 2. Where texture is allowed

Three places. No fourth is permitted without a documented decision.

### 1. The disclosure band — paper grain, 3%

A fine grain over `ground.raised`. It is the reason the band feels like a **stamp on a document**
rather than a coloured strip, and it is the strongest single tactile moment on the site.

- Tiling SVG or a single small PNG, ≤4KB, cached across the site.
- Opacity 3%. At 5% it becomes visible as noise; at 2% it disappears. It must be *felt*, not seen.
- Never animated. Never parallaxed.

### 2. The method well — paper grain, 3%

Same grain, same asset, on the `ground.inset` surface of the homepage method block and the
`/method/` page header. Ties the two most "document-like" surfaces together.

### 3. Editorial photography — film grade

Grain lives **inside the image file**, applied at grading time. Never a CSS or canvas overlay on
top of an image.

Why it matters: an overlay is a second paint layer over the LCP element, it cannot be art-directed
per image, and it degrades on low-end devices. Baking it in costs nothing at runtime.

**Evidence photography receives no grain**, per `docs/PHOTOGRAPHY_ART_DIRECTION.md` §3.

---

## 3. Where texture is forbidden

| Surface | Rule |
|---|---|
| Page ground | Flat. The warmth is colour, not grain |
| Body text areas | Flat. Grain behind reading text costs legibility for nothing |
| Cards and related content | Flat |
| Buttons, inputs, controls | Flat |
| Navigation and footer | Flat |
| Evidence plates and conditions well | Flat. **A record must look un-manipulated** |
| Verdict block | Flat. Its weight comes from type and rule |
| Any hover state | No texture change on hover, ever |

---

## 4. Surface treatment without texture

Since texture is nearly absent, surfaces are distinguished by four other means:

1. **Value** — four ground levels, deliberately close together.
2. **Hairlines** — the primary structural device. Structure you notice rather than feel.
3. **Space** — the main signal of grouping and importance.
4. **Type density** — editorial versus record density does more perceptual work than any surface
   effect could.

**Explicitly not used:** shadows, blur, translucency, glass effects, inner shadows, bevels,
gradients on surfaces, borders as decoration, or any elevation cue that is not a hairline plus
space.

---

## 5. Why no glassmorphism

The brief names it, and it deserves a specific refusal.

- It is a dated convention that timestamps the work to roughly 2020–2022.
- `backdrop-filter` is genuinely expensive to paint, especially on mid-range Android — the primary
  device class for audience A.
- It reduces contrast unpredictably, because the backdrop changes as the page scrolls. A contrast
  ratio that cannot be measured cannot be guaranteed, and every ratio in this system is measured.
- It belongs to a software register. This site is a publication.

The mobile menu, the one place a translucent panel would be conventional, uses **opaque
`ground.overlay`** instead.

---

## 6. Performance

| Asset | Budget |
|---|---|
| Paper grain | ≤4KB, one asset, cached, used twice |
| Film grain | 0 bytes at runtime — baked into images |
| Total texture cost | **≤4KB** |

Compared with a typical "premium" treatment — noise overlays, blurs, gradient meshes — this
specification costs essentially nothing, and the visual difference is negligible because the grain
is at 3% either way.

If the grain cannot be delivered under 4KB or causes a paint cost on low-end devices, **drop it
entirely**. The direction survives without it. It is the first thing to cut and the last thing
anyone would miss.

---

## 7. Reduced-motion and reduced-data

- Texture is static, so `prefers-reduced-motion` does not affect it.
- Under `prefers-reduced-data` (where supported), drop the grain asset. It is decorative by
  definition.
- In `forced-colors` mode, the grain and all ground values are overridden by the user's palette.
  Since no information is carried by texture or by surface value, nothing is lost — which is itself
  a reason for keeping information in type and rules rather than in surfaces.
