# Phase 11 — Visual Redesign: "Blush Atelier"

Phase 11 replaced the Phase 2 warm-ink editorial art direction with a luxury beauty identity at the
project owner's explicit request. Content, routes, SEO architecture, the MOCK/VERIFIED content gates
and the bilingual system are unchanged. This document records what changed in the visual layer and
which earlier refusals were deliberately reversed.

## 1. Decisions reversed (and what replaced them)

| Phase 2–10 rule | Phase 11 rule | Guarded by |
|---|---|---|
| Dark warm-ink palette | Layered ivory / blush / powder / champagne grounds, plum near-black text, deep-rose + burgundy accents, wine surface for peaks | `tools/check-contrast.mjs` (37 required pairs, all pass) |
| Radius 0 or 2px only | Radius tokens: pill controls, 14px soft, 28px card, the **arch**, organic pebble | `tests/global.test.mjs`, `tests/output.test.mjs` — every radius is a token, 0 or a percentage |
| No shadow | Warm wine-tinted shadow tokens | tests reject neutral grey/black shadows |
| No gradient | Tonal gradients between neighbouring grounds | every gradient colour must exist in `tokens.css` |
| Zero client JavaScript | One same-origin module (`CosmeticScene.astro` → `boot.ts`) that lazily loads Three.js | `tests/helpers/client-js.mjs` — ≤1 script per page, `/_astro/` module only, no fetch/XHR/beacon/WebSocket/cookie/storage API in any chunk |
| State B homepage (no photography) | State A with Zina's supplied portraits | `tests/surfaces.test.mjs` — one high-priority, optimised, alt-texted portrait; no placeholder |
| IBM Plex type system | Cormorant Garamond (display + true italic registered as its own family) and Jost; Arabic keeps Noto Naskh Arabic + IBM Plex Sans Arabic | `scripts/build-fonts.mjs` budget: en 65.5 KB, ar 146.7 KB (≤180 KB) |

The privacy page sentence about JavaScript (`legalFactNoScripts`, both locales) was rewritten to stay
true, and `tests/trust.test.mjs` verifies every half of the new sentence against `dist/`.

## 2. Refusals that survive

- Arabic is never letter-spaced; tracking tokens resolve to 0 under `[lang="ar"]`.
- No italic synthesis: `font-style: italic` never appears; the accent is a real italic face selected by family, mapped to the upright Arabic display face in Arabic.
- No `[dir=rtl]` override stylesheet: logical properties throughout; icon mirroring uses `:dir(rtl)`.
- No score, star, rank or rating. The new `VerdictSeal` renders only `verdict.wouldRepurchase`, Zina's own words.
- No invented content. Every string on redesigned sections comes from existing records; new UI strings are interface vocabulary (Arabic ones flagged for native review, Q3-2).
- Motion collapses under `prefers-reduced-motion`; nothing is hidden waiting for a script.

## 3. Photography

Eleven of the 22 supplied photographs were selected (`src/lib/photography.ts` documents why the
others were excluded: the night-time automotive series reads as lifestyle and one frame shows a
licence plate; several are near-duplicates). All are processed by `astro:assets` into WebP at
multiple widths with JPEG fallback. AVIF was measured and rejected (larger than WebP for this set).

| Photograph | Used on |
|---|---|
| `zina-portrait-glow` | Home hero (LCP), review "tested by" chip, social preview image |
| `zina-closeup-complexion` | Home "how a product earns a verdict" story |
| `zina-studio-monochrome` | Home ritual section, About gallery |
| `zina-editorial-red` + `zina-portrait-radiant` | Home "Meet Zina" collage; About gallery |
| `zina-studio-warm-profile` | About hero |
| `zina-studio-blazer` | Reviews index hero |
| `zina-studio-seated` | Method hero |
| `zina-portrait-golden-hour` | Contact hero |
| `zina-studio-monochrome-profile` | Journal index hero, mobile menu |
| `zina-studio-warm-seated` | Work index hero |

## 4. 3D cosmetics system

- `src/scripts/cosmetics/models.ts` — nine procedurally modelled, ORIGINAL packages (dropper serum,
  open cream jar with swirl, bullet lipstick with cap, eau de parfum, open compact with mirror and
  embossed powder, foundation, mascara, lip gloss, squeeze tube). Labels are generic category words
  only ("SÉRUM", "30 ml"); no brand, logo or trade dress is reproduced, and no fictional brand name
  is used that could read as a product line of Zina's.
- `materials.ts` — physically based finishes (rose-gold/champagne metal, lacquer, pearl iridescence,
  frosted and clear glass as back-shell/contents/front-shell, satin, pressed powder bump map).
- `scene.ts` — ONE WebGL context for the whole page: a fixed, transparent, pointer-events:none
  canvas; each visible DOM slot (`FloatingCosmetic`) is rendered into its own scissored viewport.
  Slow float, gentle yaw, cursor-reactive rotation and key light, scroll parallax, contact shadow.
  Rendering pauses when no slot is visible or the tab is hidden; reduced motion renders still
  frames on scroll only; mobile uses a lower pixel ratio and fewer slots (`desktopOnly`).
- `boot.ts` (~0.9 KB gz) loads the scene only after `load` + idle, only if slots exist, WebGL is
  available and Save-Data is off. The scene chunk is ~145 KB gzipped and never blocks first paint.

## 5. Components

New: `BeautyButton`, `FloatingCosmetic`, `EditorialImage`, `VerdictSeal`, `PageHero`,
`CosmeticScene`. Redesigned: `SiteHeader` (fullscreen wine menu, still CSS-only), `SiteFooter`,
`ReviewEntry` (editorial card with 3D product stage), `VerdictBlock` (wine card), `Frame`
placeholders, `Breadcrumbs`, homepage, and the openings of every index, detail and legal page.

Shared components spread the caller's forwarded `data-astro-cid-*` attribute onto their root and
declare their own base rules at zero specificity (`:where()`), so a page's scoped CSS can always
position them.

## 6. Known limitations

- Review evidence photographs still do not exist; those frames remain honest tonal placeholders and
  the review hero shows a category still-life, not the reviewed product.
- The 3D layer requires WebGL; without it (or with Save-Data) products fall back to a soft glow.
- CSS scroll-driven reveals run in Chromium and Safari 26+; other browsers show content statically.
- Arabic interface strings added in this phase need native review.
- `tools/check-mock-guard.mjs` still fails by design until the mock content layer is replaced.
