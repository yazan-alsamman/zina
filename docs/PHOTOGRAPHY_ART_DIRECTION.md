# Photography Art Direction

**Status:** Phase 2 specification and production brief.

> **No photography exists.** The repository contains zero image assets; every path in
> `content/mock/` is a placeholder. This document is therefore both an art direction and a **shoot
> brief** to be handed to whoever produces the real library. Risk R-04 (client supplies compressed
> social exports rather than originals) remains open and is the largest threat to the visual
> direction.

---

## 1. The governing principle

**Two photographic languages, deliberately different, and never blended.**

| | **Editorial** | **Evidence** |
|---|---|---|
| Purpose | Identity, atmosphere, desire | Proof |
| Where | Homepage, about, work, journal, review hero | Plates inside reviews |
| Lighting | Directional, shaped, cinematic | Consistent, repeatable, documented |
| Grade | Warm, filmic, unified | **Minimal. Accuracy over beauty** |
| Crop | Art-directed per breakpoint | Fixed, comparable |
| Retouching | Normal editorial | **Almost none** |

This split is the photographic expression of the claim/observation/verdict separation. Editorial
images persuade; evidence images testify. An evidence image that has been graded to look beautiful
has stopped being evidence — which is why the two languages must remain visibly distinct.

---

## 2. Editorial photography

### Portraiture

- **Focal length** 85mm equivalent for portraits, 50mm for environmental. No wide-angle faces.
- **Lighting** One large soft key at 45°, deep shadow retained. Dark-key to sit on the warm ground.
- **Framing** Close and mid. Eyes on the upper third. Generous negative space on one side, so type
  can sit beside rather than over the image.
- **Expression** Direct and unsmiling more often than not. The register is *practitioner*, not
  *influencer*. No hands framing the face, no product held to the cheek.
- **Wardrobe** Neutral, textural, non-seasonal. Nothing that dates the shoot.
- **Skin** Texture retained. **Pores, lines and unevenness are not removed** — a site about honest
  product testing cannot show a retouched face. This is an editorial integrity rule, not a stylistic
  one.

### Product still life

- **Focal length** 100mm macro.
- **Lighting** Single directional source, hard-ish, one deep shadow. Objects sit on a surface and
  cast; they never float.
- **Surface** Warm stone, matte plaster, unfinished paper. Never white acrylic, never a gradient
  sweep, never a mirrored plinth.
- **Composition** Off-centre, tight crops, objects allowed to leave the frame.
- **No product-on-white.** That is ecommerce, and it is the fastest way to make the site look like a
  shop.

### Hand and product interaction

The most valuable and most under-shot category. A finger drawing through a balm, a swatch being
blended, a pump dispensing. It carries texture, scale and human presence at once, and it is the
strongest content for the review hero.

### Environmental and campaign

- Testing bench, window light, notebook, timer, camera. **The working environment is the brand.**
- Campaign imagery follows the client's direction but is graded into this system for the case study.

---

## 3. Evidence photography

The discipline that makes the site credible. Every rule exists to make two frames comparable.

### The fixed setup

| Variable | Rule |
|---|---|
| Lighting | **One named, repeatable setup**, documented and reused for every timed frame. North window at a fixed time, or a single fixed strobe |
| Camera position | Fixed distance and height. Marked on the floor. Ideally tripod-locked |
| Focal length | 50mm equivalent. No compression change between frames |
| Aperture, ISO, shutter | Manual and identical across a series |
| White balance | **Manual, fixed.** Auto white balance across a series destroys comparability |
| Background | Plain, mid-tone, identical |
| Framing | Identical crop across a series |

**A grey card in the first frame of every series.** Unglamorous, and it is what allows a shade
observation to be trusted.

### Series types

| Series | Frames | Use |
|---|---|---|
| **Timed wear** | Hour 0, 3, 6, 8 | The core review sequence |
| **Multi-week** | Baseline, week 1–4 | Skincare |
| **Coat progression** | Coat 1, 2, 3 | Mascara |
| **Shade range** | Full range on one arm, one light | Concealer and foundation |
| **Comparison** | Split-face, single frame | Two products, one face |
| **Texture** | Macro on skin and on a surface | Any product |
| **Transfer** | Napkin test at intervals | Lip |

Each maps to a `stageKey` in `media.evidence[]`, so the photograph and the observation it evidences
are bound in the data.

### Grading rules for evidence

- **Exposure and white balance only.** No curves, no colour grading, no dodging, no skin work.
- **No cropping between frames in a series.**
- Compression tuned for accuracy, not weight. An evidence plate may carry a slightly larger file
  than an editorial image; it is the one place where fidelity beats bytes.
- **Swatch images are never graded toward the palette.** A shade swatch is the thing being reviewed;
  colour-correcting it toward the brand would be falsifying evidence.

### Before/after

Only where the content genuinely supports it, and never for skincare outcomes. A "before and after"
for a moisturiser implies a result the Method explicitly cannot establish
(`content/mock/method.json` — `whatThisCannotTell`). Timed wear sequences are not before/afters;
they are records of the same day.

---

## 4. Grading and colour

- A single warm, low-contrast filmic grade unifies **editorial** photography only.
- Shadows lift very slightly toward warm brown so images meet the `#12100D` ground without a hard
  edge. Deep blacks are never crushed to `#000`.
- Highlights hold detail. No blown whites against the ivory type.
- Saturation slightly reduced overall so **skin and product colour are the only saturated things in
  frame** — the interface is nearly monochrome precisely so photography can carry colour.
- **A grade is never applied to evidence photography.**

---

## 5. Sequencing

How images are ordered across a review, because sequence carries meaning:

1. **Hero** — editorial, atmospheric, art-directed. Seduces.
2. **Plate 01** — the baseline. Plain, documentary. The tonal reset.
3. **Plates 02–04** — timed frames. Comparable, unglamorous.
4. **Texture macro** — editorial again, a pause.
5. **Comparison plate** — if a comparison exists.

Editorial → evidence → editorial → evidence. The same alternation as the page's typographic rhythm.

---

## 6. Crop philosophy

Crops are **art-directed per breakpoint**, not scaled. Delivered via `<picture>`.

| Context | Desktop | Mobile |
|---|---|---|
| Homepage portrait | 4:5 | 4:5, tighter |
| Review hero | 16:10 | **4:5** — a real reframe |
| Evidence plate | 3:2 | 3:2, unchanged (comparability) |
| Paired plates | 1:1 each | 1:1 stacked |
| Work hero | 16:10 | 3:2 |
| Journal hero | 16:9 | 3:2 |
| Review card | 4:5 | 4:5 |

**Evidence plates never re-crop across breakpoints.** Everything else may.

---

## 7. Production brief — what to commission

**Priority 1 — required before launch**

| Shoot | Deliverable |
|---|---|
| Portrait session | 3 usable portraits: primary (4:5), editorial (4:5 tighter), working/environmental (3:2) |
| Testing environment | 5–8 frames of the bench, tools, notebook, lighting setup |
| Evidence setup | The named lighting setup documented and photographed, so it can be reproduced for years |

**Priority 2 — per review, ongoing**

| Per review | Frames |
|---|---|
| Hero | 1 editorial |
| Timed series | 4 |
| Texture macro | 1–2 |
| Product still life | 1–2 |
| Comparison | 1 where applicable |

**Technical delivery**

- RAW retained; **16-bit TIFF or full-resolution JPEG at quality 95+** for masters.
- Minimum 3000px on the long edge for editorial, 2000px for evidence.
- **No social exports as masters.** A 1080px Instagram JPEG cannot serve a 1440px hero, and it is
  the single most likely way the visual direction gets compromised (R-04).
- Colour space sRGB for web delivery, wider gamut retained in masters.
- Filenames carry review slug, series and frame: `voile-lumiere__wear__h06.jpg`.

**Interim policy.** Until real photography exists, the site uses **no stock imagery of a person**.
Placeholder blocks are neutral tone fields at the correct aspect ratio with the plate or caption
treatment intact — an honest gap rather than a borrowed face. Stock still life may be used only in
internal previews, never on a production build.

---

## 8. What photography must never do

- Show a retouched face on a site about honest testing.
- Grade an evidence frame.
- Use a different lighting setup within one timed series.
- Present a stock image as Zina.
- Put type over the hero.
- Use product-on-white ecommerce packshots.
- Show a before/after implying a skincare outcome.
- Use a shade swatch that has been colour-corrected.
- Deliver a social export as a master file.
