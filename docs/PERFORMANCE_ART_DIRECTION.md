# Performance Art Direction

**Status:** Phase 2 decision.

Every visually expensive decision, with its cost, mitigation, mobile strategy and fallback. The
budgets are the Phase 0 targets and are treated as design constraints, not engineering aspirations.

| Metric | Target |
|---|---|
| LCP | < 2.0s (throttled mobile) |
| INP | < 200ms |
| CLS | < 0.05 |
| Review-page JS | < 40KB gzipped |
| LCP image | < 200KB |
| Total mobile page | < 1MB |

---

## 1. The cheapest expensive-looking design

The direction is unusually inexpensive for how it looks, and that is by construction rather than by
luck:

| Premium signal | Conventional cost | This design's cost |
|---|---|---|
| Depth and hierarchy | Shadows, blur, layers | **Hairlines and space — 0 bytes** |
| Luxury surface | Gradients, glass, texture | **Warm flat colour — 0 bytes** |
| Atmosphere | Video or WebGL hero | **One still photograph** |
| Sophistication | Animation library | **Five CSS patterns, ~3KB** |
| Editorial feel | Icon set, decorative assets | **Type and rules — 9 icons, <2KB** |
| Distinctiveness | 3D, shaders, parallax | **The evidence language — 0 bytes** |

**The three things that cost real money are typography, photography and the paper grain.** Two of
them are the brand.

---

## 2. Cost register

### Typography — the largest controllable cost

| | |
|---|---|
| **Cost** | Four families specified; Arabic subsets are large |
| **Mitigation** | Only **three files per page per locale**: display, body, UI. Mono loads only on pages with an evidence layer. Aggressive subsetting. Three weights only (400/500/600) |
| **Locale split** | An English page never downloads Arabic subsets, and vice versa — roughly halves the payload |
| **Budget** | **180KB per locale** |
| **Mobile** | Same. `font-display: swap` with metric-compatible fallbacks via `size-adjust` and `ascent-override`, so the swap does not move layout |
| **Fallback** | System serif and sans. The page is fully readable before webfonts arrive |
| **Preload** | Two files only — the display weight used by the LCP text and body regular, for the active locale |

**The CLS risk lives here.** An unmatched font swap can consume the entire 0.05 budget in one
reflow. Metric-matched fallbacks are mandatory, not a nicety.

> **Open item.** The homepage needs mono in sections 2–3 but not above the fold. Recommendation: a
> **numerals-and-punctuation-only mono subset**, likely under 8KB. Resolve in Phase 5.

### Photography — the largest total cost

| | |
|---|---|
| **Cost** | Image-led design; the review page carries a hero, gallery and 2–4 evidence plates |
| **Mitigation** | AVIF with WebP fallback, responsive `srcset`, art-directed crops via `<picture>`, `width`/`height` required by the type system |
| **Budget** | LCP image ≤200KB. Total page ≤1MB |
| **Mobile** | Smaller art-directed crops, not scaled desktop files. The 4:5 review hero is a genuinely smaller file than the 16:10 |
| **Loading** | **One** eager, preloaded, `fetchpriority="high"` image per page. Everything else lazy with `content-visibility: auto` |
| **Fallback** | Aspect-ratio boxes reserve space, so a failed image costs no layout shift |

**Evidence plates are the exception to compression discipline.** They may carry a slightly larger
file because fidelity is their function. They are always below the fold and always lazy, so the
cost lands after LCP.

### Paper grain

| | |
|---|---|
| **Cost** | One tiling asset, used twice |
| **Budget** | **≤4KB**, cached site-wide |
| **Mobile** | Identical |
| **Fallback** | **Drop it entirely.** The direction survives; at 3% opacity nobody would miss it |

First thing to cut if the budget is exceeded.

### Motion

| | |
|---|---|
| **Cost** | Five patterns; `IntersectionObserver` only |
| **Mitigation** | `opacity` and `transform` only — compositor-only, no layout, no paint. Observers unobserve after firing |
| **Budget** | **3KB gzipped** |
| **Mobile** | Identical. No continuous animation anywhere, so no sustained GPU or battery cost |
| **Fallback** | Reduced motion removes all of it with no loss |

**No animation library.** If a proposed animation needs one, the animation is wrong.

### Evidence layer

| | |
|---|---|
| **Cost** | **Zero JavaScript.** Entirely static server-rendered HTML |
| **Why it matters** | The densest, most valuable content on the site is free, readable without JS, and indexable |

The most distinctive part of the design is also the cheapest. That is the strongest single argument
for the direction.

### Review filters

| | |
|---|---|
| **Cost** | The only genuinely interactive component |
| **Mitigation** | Crawlable server-rendered URLs (`docs/SEO_URL_ARCHITECTURE.md` §5). The client layer is an enhancement that avoids a full navigation, not the mechanism |
| **Budget** | ≤10KB |
| **Fallback** | Works entirely without JS as links |

### What was refused, and what it saved

| Refused | Saved |
|---|---|
| WebGL / 3D hero | 100–500KB + shader compile + continuous GPU |
| Video hero | 1–5MB + the most common LCP failure mode |
| Glassmorphism | Expensive `backdrop-filter` paint on mid-range Android |
| Parallax | Continuous scroll-linked compositing — a primary INP risk |
| Animation library | 30–100KB |
| Icon library | 30–60KB for nine icons |
| Page transitions | Client-side routing and its hydration cost |
| Carousels | Library plus layout complexity |
| Charts | A charting library, for data that does not exist |

**Roughly 200KB–5MB avoided, in exchange for nothing the design needed.**

---

## 3. Per-page budgets

| Page | JS | Images | Fonts | Total | LCP element |
|---|---|---|---|---|---|
| Homepage | ≤15KB | ~8, lazy after hero | 3 files | ≤1MB | Portrait |
| **Review** | **≤10KB** | 1 hero + 2–4 plates, lazy | 4 files (incl. mono) | ≤1MB | Hero |
| Reviews index | ≤20KB (filters) | 6–12 cards, lazy | 3 files | ≤900KB | First card |
| Method | ≤5KB | 1–2 | 4 files | ≤600KB | Header image or text |
| Journal article | ≤5KB | 1 hero | 3 files | ≤700KB | Hero |
| Work case study | ≤5KB | 1 hero + gallery | 3 files | ≤1MB | Hero |
| Contact | ≤15KB (form) | 0 | 3 files | ≤400KB | Heading text |

The review page — the most structurally complex and most-visited — has the **second-lowest** JS
budget on the site, because its complexity is typographic rather than interactive.

---

## 4. LCP strategy per template

| Template | LCP element | Treatment |
|---|---|---|
| Homepage | Portrait | Eager, preloaded, `fetchpriority="high"`, AVIF, art-directed |
| Review | Hero | Same. **No animation, no scrim, no text over it** |
| Method | Header text or image | If text: preload the display font. If image: as above |
| Journal | Hero | As above |
| Reviews index | First card image | Eager; the rest lazy |
| Contact | Heading text | Preload display font |

**Nothing above the fold animates in**, on any template. The disclosure band in particular must be
present at first paint — it is the most important element on a review page and must never be
revealed by script.

---

## 5. CLS

Target 0.05, and the design removes most of the usual causes structurally:

| Cause | Prevention |
|---|---|
| Images without dimensions | `width`/`height` **required** by `ImageAsset`. A missing dimension is a build error |
| Font swap reflow | Metric-matched fallbacks with `size-adjust` / `ascent-override` |
| Late-injected banners | No cookie banner in the design (privacy-first, cookieless analytics) |
| Entrance animation moving layout | Settle animates `opacity` and `translateY` on elements already occupying their final space |
| Lazy content pushing layout | Aspect-ratio boxes reserve space before load |
| Web font FOUT on display type | Preloaded for the LCP text |

---

## 6. Mobile strategy

Mid-range Android is the target device, not a high-end iPhone.

- Art-directed crops mean mobile downloads **smaller files**, not resized large ones.
- No `backdrop-filter`, no continuous animation, no WebGL — the three most common causes of jank on
  this device class are all absent by design.
- The evidence layer, the densest content, costs zero JavaScript.
- Fonts split by locale, so an Arabic reader never pays for Latin subsets.
- 88vh hero, not 100vh, so the second section is partly visible without a full swipe.

**Measurement, when there is something to measure:** Lighthouse CI on a throttled mid-range Android
profile in Phase 9, and CrUX field data after launch. Nothing in this document claims a measured
result — no application exists yet.

---

## 7. Where the design would first go wrong

Ranked by likelihood, so Phase 5 knows where to look:

1. **Font payload.** Four families, two scripts. Easily doubles the budget without disciplined
   subsetting and locale splitting.
2. **Photography weight.** An image-led design with an unbriefed photographer produces 4MB heroes.
3. **Someone adds an animation library** for one effect.
4. **Filters built client-side**, costing both JS and crawlability.
5. **The paper grain implemented as a full-page overlay** rather than on two elements.
6. **Hover scale applied to containers rather than clipped images**, causing layout work on hover.
7. **A carousel** appearing in related content.

Each has a named prevention in this document. The first two are the ones that will actually happen.
