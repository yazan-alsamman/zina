# Colour System

**Status:** Phase 15 decision — "Quiet Luxury". Supersedes the Phase 11 "Blush Atelier" palette,
which superseded the Phase 2 warm-ink palette.
**Implementation:** `src/styles/tokens.css`
**Verification:** `node tools/check-contrast.mjs` — every ratio below is **measured, not assumed**.

---

## 1. The idea

**Five colours, and nothing else.**

```
WHITE  →  LIGHT GREY  →  WARM BEIGE  →  MOCHA BROWN  →  BLACK
#FFFFFF    #EAEAEA       #B8A48F        #4A3F35         #000000
```

That arrow is three things at once: the visual hierarchy, the section ladder down a page, and the
order in which the eye is meant to travel. A page opens on white, alternates into light grey,
warms into beige for an accent band, and drops into mocha for the cinematic passages. Black is a
**detail** colour — a verdict, an icon, a fine rule — and never a ground or a body tone.

No hue is introduced that this list does not contain. There is no gold, no rose, no blue-grey, no
"brand colour" sitting outside the system. The warmth of the identity comes from one axis — the
beige-to-mocha axis — and everything else is the neutral it sits against.

---

## 2. Two decisions that define the palette

### Warm beige is a surface, never a foreground

This is the single rule that makes a five-colour palette survive contact with real content.

`#B8A48F` measures **2.40:1** on white. It is not a borderline value that could be waved through
for large text — it is roughly half the AA threshold. So warm beige is never type, never a link,
never a focus ring on a light page. It is:

- the fill a button flows into on hover (with **black** type on it — 8.74:1)
- the rule that draws under a navigation item or a link
- the ground of an accent band (again, black type)
- decorative metal on an edge, a glow, a 3D cap

On a **dark** ground the rule inverts. Lifted 18% towards white — `#C5B4A3` — beige reaches
**5.08:1** on mocha and becomes the accent voice of every dark section. The accent is not weaker
in the dark; it simply changes which side of the contrast equation it is on.

The contrast harness records the two forbidden pairs explicitly, so the measurement that justifies
the rule is in the output rather than in someone's memory:

```
Measured and FORBIDDEN. This is why warm beige is a surface and never a foreground
on a light ground; these numbers are the rule, not a regression:
  x Warm beige AS TEXT on white — forbidden: 2.40:1 (threshold 4.5:1)
  x Warm beige AS A FOCUS RING on white — forbidden: 2.40:1 (threshold 3:1)
```

### Body text is mocha, not black

`#4A3F35` on white is **10.23:1** — AAA with room to spare, and warm. Black on white is available
at 21:1 and is deliberately **held back** for the loudest register: a verdict, an icon, a hairline
that has to cut.

Pure black body text on pure white is the default of software. Mocha body text is the reason the
page reads as an editorial object rather than as an interface, and it costs nothing in
accessibility: the whole reading ladder clears AAA.

---

## 3. Derived steps

Five colours cannot furnish a layered editorial page on their own. A reading ladder needs
intermediate text tones; a section ladder needs grounds between white and beige.

Every intermediate value in the system is a **straight linear mix of two of the five**, and each
one carries its mix in a comment in `tokens.css` so it can be rederived rather than guessed at.
This is the only licence taken with the palette, and it is the one the brief grants for "a
controlled tint derived from the approved palette".

| Token | Value | Mix |
|---|---|---|
| `--palette-porcelain` | `#F6F4F2` | white 88% + beige 12% |
| `--palette-linen` | `#E1DDDA` | light grey 82% + beige 18% |
| `--palette-nude` | `#D9D2CA` | light grey 65% + beige 35% |
| `--palette-sand` | `#CCC0B3` | light grey 40% + beige 60% |
| `--palette-taupe` | `#817262` | mocha 50% + beige 50% |
| `--palette-bark` | `#625549` | mocha 78% + beige 22% |
| `--palette-umber` | `#5B4E43` | mocha 85% + beige 15% |
| `--palette-beige-lifted` | `#C5B4A3` | beige 82% + white 18% |
| `--palette-beige-shaded` | `#9D8B79` | beige 75% + mocha 25% |
| `--palette-shadow` | `#29231D` | mocha 55% + black 45% |

---

## 4. The palette

### Ground — the section ladder

| Token | Value | Use |
|---|---|---|
| `--color-ground-base` | `#FFFFFF` | The page |
| `--color-ground-card` | `#FFFFFF` | Review cards, floating captions |
| `--color-ground-champagne` | `#F6F4F2` | The warm-white section |
| `--color-ground-raised` | `#EAEAEA` | Alternating sections, disclosure band |
| `--color-ground-inset` | `#E1DDDA` | Wells: conditions table, evidence strip |
| `--color-ground-nude` | `#D9D2CA` | The warmest light section |
| `--color-ground-accent` | `#B8A48F` | The accent band — **black type only** |
| `--color-ground-overlay` | `#4A3F35` | Dark sections, footer, fullscreen menu |

### Text

| Token | Value | On white | Use |
|---|---|---|---|
| `--color-text-primary` | `#4A3F35` | **10.23:1** | Headings, body, verdict |
| `--color-text-secondary` | `#5B4E43` | **8.03:1** | Supporting prose |
| `--color-text-muted` | `#625549` | **7.20:1** | Metadata, labels, captions |
| `--color-text-strong` | `#000000` | **21.00:1** | The loudest editorial register |
| `--color-text-on-accent` | `#FFFFFF` | 10.23:1 on mocha | Type on a dark or mocha surface |

The ladder is deliberately **compressed**. In a monochrome brown system hierarchy is carried by
size, tracking and space — not by fading text towards the ground. All three reading tones clear
AAA on white, which is the point: nothing here is quiet because it is hard to see.

### Lines

| Token | Value | Use |
|---|---|---|
| `--color-line-hairline` | `#EAEAEA` | Decorative rules. Carries no information, so no minimum |
| `--color-line-strong` | `#817262` | Meaningful boundaries. ≥3:1 on every light ground |

On the light grey, linen and nude grounds `#EAEAEA` would vanish, so those tonal sections re-map
the hairline one rung down the ladder. The token's **role** is unchanged; only its value moves.

### Accents

| Token | Value | Use |
|---|---|---|
| `--color-accent-clay` | `#4A3F35` | Links, CTAs, the verdict rule |
| `--color-accent-clay-hover` | `#000000` | The link hover **text** |
| `--color-accent-mineral` | `#5B4E43` | The observed voice |
| `--color-accent-champagne` | `#B8A48F` | Decorative surface and metal — **never text** |

### Controls

The CTA fill is a **separate token** from the link-hover text, because a button may flow into warm
beige and switch to black type where a run of prose cannot.

| Token | Value | |
|---|---|---|
| `--color-cta-fill` | `#4A3F35` | Primary CTA background |
| `--color-cta-fg` | `#FFFFFF` | 10.23:1 |
| `--color-cta-fill-hover` | `#B8A48F` | The control fills with warm beige |
| `--color-cta-fg-hover` | `#000000` | 8.74:1 |

- **Primary:** mocha ground, white type. Fills to beige with black type.
- **Secondary** (`.btn--secondary`): beige ground, black type. Fills to mocha with white type.
- **Ghost** (`.btn`): transparent, mocha border, mocha type. Fills to beige with black type.

### Status

Deep, almost-neutral tints of the mocha family. They exist because disclosure state is a **legal**
signal rather than decoration — but the label text carries the meaning, and the colour is only
allowed to be a temperature. Nothing here is a saturated UI red or green.

| Token | Value | On white |
|---|---|---|
| `--color-status-success` | `#3F4A38` | **9.34:1** |
| `--color-status-warning` | `#6B5326` | **7.27:1** |
| `--color-status-error` | `#6B3A32` | **9.22:1** |

### Evidence semantics

Quietest to loudest — and the loudest is where black earns its place.

| Token | Resolves to | On light grey |
|---|---|---|
| `--color-evidence-claim` | `#625549` | **5.99:1** — what the brand says |
| `--color-evidence-observation` | `#5B4E43` | 6.67:1 — what Zina saw |
| `--color-evidence-verdict` | `#000000` | **17.46:1** — what Zina concluded |

---

## 5. Measured contrast

`node tools/check-contrast.mjs` verifies **46 required pairs** across the whole ground ladder.
All pass. Selected results:

| Pair | Ratio | Min |
|---|---|---|
| Body text on white | 10.23:1 | 4.5 |
| Body text on light grey | 8.50:1 | 4.5 |
| Body text on nude | 6.83:1 | 4.5 |
| Muted text on nude | 4.81:1 | 4.5 |
| Black text on the warm beige band | 8.74:1 | 4.5 |
| White text on mocha | 10.23:1 | 4.5 |
| Lifted beige text on mocha | 5.08:1 | 4.5 |
| Meaningful border on nude (non-text) | 3.10:1 | 3.0 |
| Meaningful border on mocha (non-text) | 3.12:1 | 3.0 |
| Focus ring on white (non-text) | 10.23:1 | 3.0 |

The reading ladder on white: **primary 10.23 · secondary 8.03 · muted 7.20 · strong 21.00**.

---

## 6. Dark sections

Where the site goes cinematic — the footer, the closing statement, the fullscreen menu, the film
stage — the ground is mocha and the tokens re-map so that components inside stay legible without
knowing where they are:

| Role | Value | On mocha |
|---|---|---|
| Primary text | `#FFFFFF` | 10.23:1 |
| Secondary text | `#EAEAEA` | 8.50:1 |
| Muted text / accent | `#C5B4A3` | 5.08:1 |
| Meaningful border | `#9D8B79` | 3.12:1 |

These sections are used **strategically, not everywhere**. They are the punctuation of a light
page, and they are lit from the top right by their own warm beige rather than by a colour cast.

---

## 7. Colour and photography

The photography is not recoloured. No filter, no duotone, no overlay heavy enough to alter skin.

What changed is the UI **around** the images: white and light grey grounds, mocha captions, beige
rules. Where a component already carried an overlay for legibility — a caption sitting over an
image, a film frame's vignette — that overlay was re-tinted from wine to mocha/`#29231D` at the
same opacity it always had.

The 3D cosmetic products are a different case and **were** re-toned. They are rendered from code,
not photographed, so their colour is part of the brand system rather than part of the imagery. The
tint **keys** (`blush`, `rose`, `nude`, `champagne`, `wine`) are unchanged — they are an API the
models, the pages and the tests all address — while their values now walk the same ladder as the
page.

---

## 8. Shadows

Low, warm, diffuse, and tinted with **mocha** rather than grey. A neutral grey shadow under a warm
beige surface is the fastest way to make this palette look cheap, so there is no grey anywhere in
the ladder — and no pure black either. The deepest tint is `--palette-shadow` (`#29231D`), mocha
carried 45% towards black.

Opacities are deliberately low. The identity is flat and editorial with controlled depth, not
lifted. Enforced by tests in `tests/output.test.mjs` and `tests/phase12.test.mjs`.

---

## 9. Colour is never the only signal

Every place colour carries meaning, something else carries it too:

- **Disclosure state** — the band states its status in words; colour is a secondary cue
- **Evidence tiers** — claim, observation and verdict differ in position, label and type treatment
- **Navigation active state** — a drawn rule *and* `aria-current`
- **Links** — underlined by default, and the underline is never removed on hover
- **Focus** — a 2px ring at ≥3:1, plus offset

This is why the status tints can afford to be nearly neutral: they are reinforcement, not the
message.

---

## 10. What the palette refuses

- **No colour outside the five**, and no derived value that is not a documented mix of two of them
- **No warm beige as type, link or focus ring on a light ground** — 2.40:1, measured
- **No saturated status colours** — no UI red, green or amber
- **No colourful or flashy gradients** — every gradient moves between two *neighbouring* rungs
- **No grey or black shadows** — the ladder is mocha-tinted throughout
- **No recolouring of the photography**
- **No black-dominated interface** — black is a detail, not a ground

---

## 11. Verification

```bash
node tools/check-contrast.mjs   # 46 required pairs, all measured
npm test                        # gradients, shadows and radii must stay on-system
```

`tests/global.test.mjs` asserts that **every colour in every decorative gradient** in the shipped
CSS exists as a literal value in `tokens.css`, which is what stops a one-off hex from drifting
back into a component. After the Phase 15 migration the entire built site — HTML, CSS and the 3D
bundle — contains no hex or `rgb()` value outside this system, with two deliberate exceptions:
the greyscale canvases used as bump/roughness maps for the pressed-powder texture, and the `#000`
luminance mask on the marquee. Neither is colour.
