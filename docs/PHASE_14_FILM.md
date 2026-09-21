# Phase 14 — The Film

`/{locale}/film/` is a scroll-driven cinematic presentation of Zina's six-stage testing method:
seven frames, five of her photographs, one original 3D package, one continuous camera. Scroll is
the transport, not navigation.

It is a new page. Nothing on the other 85 routes changed except two links into it and one shared
material fix (see §7).

---

## 1. What it is a film ABOUT

This is the decision everything else follows from.

A film about a *product* would have been dishonest: what a product does belongs to an individual
review, where the conditions it was tested in are published beside it. A film about *Zina* would
have had nothing to say after the first frame.

So the film is about **her method** — baseline, application, wear window, conditions, comparison,
revisit. That is a real record in `content/mock/method.json`, it already has a page at `/method/`,
and it has the one property a film needs: it is a sequence. Seven beats, seven scroll positions.

Every line of type in the film is existing content:

| Frame | Label | Line |
|---|---|---|
| 0 Awakening | her professional title | her tagline (the page's `h1`) |
| 1 Reveal | Chapter 01 | Baseline |
| 2 Hero product | Chapter 02 | Application |
| 3 Together | Chapter 03 | Wear window |
| 4 Beauty moment | Chapter 04 | Conditions |
| 5 Transformation | Chapter 05 | Comparison |
| 6 Final | Chapter 06 | Revisit |

The 3D package is the site's own original generic packaging (`SÉRUM`, `30 ml`). It depicts no real
product and is never captioned as one. The boundary statement — *"structured personal testing, not
clinical testing"* — travels with the method everywhere the method appears, so it appears here, in
the coda, at a size where it can be read.

---

## 2. The DOM is the page; the film is an enhancement

`FilmStage.astro` emits a **storyboard**: seven full-height frames, five full-bleed photographs,
one line of type each. That is a finished editorial piece. With no JavaScript, no WebGL, Save-Data
on, or reduced motion requested, it is what a reader gets — not a degraded state, not an empty box.

When conditions allow, `stage.ts` lifts that same markup into a film: the photographs become lit
planes in a 3D scene, and the captions — **the same DOM nodes** — move to a fixed overlay and
cross-dissolve. Nothing is duplicated, so there is one copy of every sentence for a search engine
and for a screen reader.

Verified in a browser, on the film page:

| Mode | Canvas | Storyboard photographs visible | Captions readable | `h1` | Hidden text |
|---|---|---|---|---|---|
| Baseline | 1 | 0 (the film replaced them) | 7 | ✓ | 0 |
| Reduced motion | 0 | 5 | 7 | ✓ | 0 |
| Save-Data | 0 | 5 | 7 | ✓ | 0 |
| No WebGL | 0 | 5 | 7 | ✓ | 0 |
| No JavaScript | 0 | 5 | 7 | ✓ | 0 |

**Reduced motion refuses the film outright.** A scroll-driven camera cannot be made still without
ceasing to be the thing it is, and there is no honest "reduced" version of a dolly. The storyboard
is already a complete page, so the refusal costs nothing.

---

## 3. One script per page, still

The site's hardest invariant is **at most one client script per page, same-origin, `/_astro/`
module only** (`tests/helpers/client-js.mjs`). The film does not add a second.

`boot.ts` — already included on every page by `BaseLayout` — became the single branch point:

```
[data-cinema]    → import("../cinema/stage")     the film
[data-cosmetic]  → import("./scene")             the ambient product layer
```

Never both. Both branches keep the existing guards: loaded after `load` + idle, skipped without
WebGL, skipped under Save-Data, and the film additionally skipped under reduced motion.

Rollup split the shared dependency automatically:

| Chunk | gzipped | Contents |
|---|---|---|
| loader | 1,305 B | the branch, on every page |
| `models.js` | 148,612 B | Three.js + the 24-package catalogue, shared by both layers |
| `scene.js` | 3,024 B | the ambient layer |
| `stage.js` | 9,705 B | **the entire film** |

The film costs **9.7 KB gzipped** on top of a Three.js chunk the site already shipped.

---

## 4. How a photograph becomes a place

There is no 3D scan of Zina and there never will be. The whole problem of the piece is putting a
flat rectangle into a moving camera without it reading as a flat rectangle in a moving camera. Four
things in one fragment shader (`portrait.ts`) do the work:

1. **Pseudo-depth from luminance.** Every one of her photographs is lit the same way — a bright
   subject against a darker ground — so brightness is a usable stand-in for nearness. Nine blurred
   taps give a smooth field with no shimmer, biased toward frame centre so a bright corner of wall
   is not treated as nearer than a cheekbone. It is not a depth map and does not need to be.
2. **Parallax against that depth.** The CPU passes the camera's offset each frame; the shader
   shifts the sample by depth. Dolly the camera and her face slides against the background. This
   single effect is most of what makes the frame read as having air in it.
3. **A depth-ordered reveal.** She does not fade in. The dissolve is ordered *by depth*, so the
   nearest, brightest part arrives first and the ground follows — the light finding her — with a
   luminous edge travelling along the dissolve front.
4. **Edge dissolution.** The plane's own border feathers to nothing, so there is never a rectangle
   in frame. This is the difference between a 3D page and a film.

Plus **cover framing**: `portraitCover` is not a size, it is *how much of the frame the photograph
fills at its own distance*, resolved against the lens and viewport every frame. That is the only
way one number can mean the same thing on a 21:9 monitor and a 9:19 phone.

---

## 5. Camera, light, air, lens

- **One continuous take.** Seven keyframes on a Catmull-Rom curve for position and another for the
  look-at. The camera never cuts, never teleports; every move between beats is a dolly, push or
  orbit. A long lens (26°) opens to a wide one (38°) as the world becomes legible.
- **Scrubbed, not triggered.** Scroll sets a target; the loop eases toward it at 8.5 % a frame.
  Scrolling violently cannot break it into a different state; scrolling slowly is frame-accurate.
- **A travelling light rig.** The key swings from behind the subject at the opening (rim only — she
  is a silhouette) around to the front by the beauty moment, while environment intensity triples.
  The lighting tells the story.
- **Night into morning.** A single haze plane interpolates from `#1d0c15` to blush across the last
  40 % of the scroll, and every per-plane grade (exposure, lift, tint, saturation, grain) moves
  with it. It is one continuous transformation, not a section change.
- **Air.** 700 dust motes (260 on a phone), size-capped and individually almost invisible; three
  additive light shafts that turn at a fraction of a radian per second.
- **The lens.** A compact post chain — quarter-res bright pass with a soft knee, separable blur,
  then one composite doing bloom, **halation** (the scatter runs warm, which is why a beauty
  campaign glows rose-gold around a lit cheek and a render does not), radial chromatic aberration,
  vignette, shadow-weighted grain and the ACES curve. Three.js `EffectComposer` was not used: it
  would pull a dozen modules in for what is four draw calls written directly.

On phones the two blur passes are dropped; the composite still runs, so the grade, vignette, grain
and tone map survive.

---

## 6. Defects found by looking at renders

Every one of these was invisible to the test suite and visible in a screenshot.

| Defect | Cause | Fix |
|---|---|---|
| The whole film rendered as flat grey fog | Linear values written into an sRGB buffer — a raw `ShaderMaterial` drawing to the default framebuffer never gets the renderer's output conversion | Decode textures to linear in the shader; encode to sRGB at the end of the composite |
| A featureless soft blur at any scroll position | The canvas drawing buffer stayed at its 300×150 default: `resize()` measured the sticky stage, which is zero-tall until `cinema-live` is set, which only happens after a frame renders | Size from the viewport, which is what the stage becomes and is known before the first frame |
| The frame washed white | 1,500 additive dust motes with uncapped size attenuation — fog, not air | Capped point size, 700 motes, alpha 0.5 → 0.11 |
| A saturated magenta wall behind everything | The haze plane was 34 units wide at z −7.5, so the camera only ever saw the middle of the gradient and got the centre colour, flat | Sized to just cover the widest shot; glow strength 0.85 → 0.3 |
| The photograph showed as a hard-edged rectangle | The feather multiplied `d.x` by the aspect (0.75), so the horizontal falloff never reached zero | Both axes already reach 1 at their own edge; the aspect moved to the oval term where it belongs |
| **"SÉRUM" rendered mirrored** during the product hero | Printed labels were `DoubleSide`, so past 90° the label was drawn again from behind | `FrontSide` — printing is opaque. Fixed site-wide, in `models.ts` |
| The product cropped its own base | Normalised models are two units across; at that distance the frame was 1.7 units tall | Camera back, scale 0.94 → 0.72 |
| Her face stayed sharp behind the product hero | Depth-of-field is depth-weighted, and her face is the *near* part of her own photograph | Added `uSoften`: whole-plane defocus for a subject behind the plane of focus |
| **On tall viewports every plane rendered blank** | The storyboard images live in a `<picture>` with `srcset`/`sizes`, and the browser re-runs candidate selection when the layout `sizes` depends on settles — after the element had been uploaded. Re-flagging `needsUpdate` on `load` did not help: the element's resource is not stable at any nameable point | Read `currentSrc` once and load *that URL* into an image of our own. Already cached, so still no extra request, and the resource is now stable |
| The last caption sat pinned over the coda's prose | Captions are `position: fixed` while live and progress clamps at 1 | A `presence` factor from the track's own rect, fading to zero before the coda has anything to collide with |
| A hard dark edge under the film's brightest frame | The coda opened on the wine ground | The coda now begins in the blush the film ends in |

---

## 7. What changed outside the film

- `models.ts` — printed labels are `FrontSide` (see above). This is a correctness fix for the whole
  site; the ambient layer benefits too.
- `routing.ts`, `sitemap.ts` — the `film` route registered and added to the sitemap as its own
  static family, with its own canonical and hreflang pair.
- `ui-strings.ts` — eight new interface strings, both locales. **The Arabic ones need native review
  (open question Q3-2), like every Arabic string added since Phase 11.**
- The homepage's ritual section and the method page's opening each gained one quiet link in. The
  film is not in the primary navigation: it is an experience entered deliberately, from the pages
  that describe what it presents.

---

## 8. Verification

```
tests 493   suites 114   pass 493   fail 0
astro check  0 errors, 0 warnings, 0 hints
build        87 pages, exit 0
```

- **Responsive sweep**: 17 viewports × 29 routes — no horizontal overflow, no clipped text, no tap
  target under 24 px.
- **Production audit**: 87 routes — no console errors, no failed requests, no external requests,
  valid JSON-LD, unique titles and descriptions.
- **Film page**: 10 initial requests / 231 KB; CLS 0; one same-origin module script; nothing left
  invisible after a full scroll in any mode.
- `guard:mock` **still fails by design**, untouched.

Two corpus tripwires fired as designed and were re-derived, not relaxed: 85 → 87 pages and
56 → 58 sitemap URLs, which is exactly two locales of one new route family.

---

## 9. Limitations

1. ~~**Reduced motion does not get the film.**~~ **Superseded by Phase 16**, which ships a reduced
   cut — one locked-off camera, no parallax, no rotation, no drift — keeping every photograph,
   caption, the lighting arc and the night-to-morning transformation. See docs/PHASE_16_CINEMA.md §7.
   The reasoning recorded here was sound about the *camera* and wrong about the *film*.
2. **Browser testing was Chromium-only.** Safari and Firefox were not available in this
   environment. The film uses no feature that needs a polyfill, but it has not been seen there.
3. **The header stays.** An ivory bar over a dark film is not ideal for immersion, but the page
   ends on a light ground, so light header text would fail there — and removing navigation from one
   page breaks the site shell and the skip link. Consistency and a way out won.
4. **Arabic interface strings need native review** (Q3-2).
5. **LCP was not captured** by the measurement harness; CLS of 0 and the eager, high-priority,
   intrinsically-sized title-card image are the evidence offered instead.
