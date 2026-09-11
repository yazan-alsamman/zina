# Colour System

**Status:** Phase 2 decision. Specification only.
**Verification:** `node tools/check-contrast.mjs` — every ratio below is **measured, not assumed**.

---

## 1. The idea

**Ink and pigment.** A warm dark ground the colour of printing ink, ivory text the colour of good
paper, and two functional accents drawn from cosmetics rather than from metal: a **clay** taken
from pigment and skin, and a **mineral** taken from stone and glass.

No gold. No metal of any kind. The brief names black-and-gold as the cliché to avoid, and it is
avoided at the root — by taking the accent from what the site is actually about.

---

## 2. Two decisions that define the palette

### The ground is warm, and it is not black

`#12100D`, not `#000000`. There is brown in it. At a glance it reads simply as dark; side by side
with pure black it reads as ink rather than as absence.

This single decision does more work than any other in the system. Pure black plus pure white is the
default of software, of dashboards and of every dark-mode toggle — the exact registers the direction
refuses. A warm ground makes photography of skin sit naturally instead of floating on a void, and it
is the mechanism by which Territory C's warmth enters a dark design (`docs/VISUAL_TERRITORIES.md`).

### The text is ivory, and it is not white

`#F2EDE3`, not `#FFFFFF`. Measured at **16.28:1** against the ground — comfortably above the 7:1
AAA threshold, and deliberately below the 21:1 that pure white on pure black would give.

Maximum contrast is not the goal. 21:1 on a large area of body text produces halation for many
readers and is genuinely fatiguing at length, and this site expects people to read 1,500-word
reviews. 16.28:1 is far above requirement and materially more comfortable.

---

## 3. The palette

### Ground

| Token | Value | Use |
|---|---|---|
| `color.ground.inset` | `#0B0A08` | Wells: conditions table, evidence strip. Recessed |
| `color.ground.base` | `#12100D` | The page |
| `color.ground.raised` | `#1A1714` | Disclosure band, quoted claim, related content |
| `color.ground.overlay` | `#211D18` | Mobile menu, dialogs |

The four levels are close together on purpose. Elevation is signalled by a hairline and by spacing,
**never by a shadow** — shadows on a dark ground read as cheap or as software.

### Text

| Token | Value | On `ground.base` | Use |
|---|---|---|---|
| `color.text.primary` | `#F2EDE3` | **16.28:1** | Body, headlines, verdict |
| `color.text.secondary` | `#C3BAAC` | **9.89:1** | Subheads, secondary prose, captions |
| `color.text.muted` | `#9A9184` | **6.11:1** | Metadata, labels, claim text |
| `color.text.onAccent` | `#12100D` | — | Text on a clay surface: **7.37:1** |

Even the muted tier clears AA for normal text at 6.11:1. Metadata is quiet by *tone*, never by being
too faint to read.

### Lines

| Token | Value | Ratio | Use |
|---|---|---|---|
| `color.line.hairline` | `#2C2823` | 1.30:1 | Decorative separation only. Carries no information |
| `color.line.strong` | `#75695C` | **3.56:1** | Meaningful boundaries: input borders, active states, claim/observation separation |

**The distinction is a rule, not a nuance.** A line that separates two paragraphs is decorative and
may be faint. A line that tells you a passage is a brand claim rather than an observation is
carrying information and must clear 3:1 as a non-text element.

> This is where the specification was wrong first time. `line.strong` was originally `#4A4238` and
> `tools/check-contrast.mjs` measured it at **1.92:1** — well under the 3:1 non-text minimum. It was
> lightened to `#75695C` (3.56:1). That failure is exactly why contrast is calculated rather than
> eyeballed.

### Accents

| Token | Value | Ratio | Use |
|---|---|---|---|
| `color.accent.clay` | `#D9906A` | **7.37:1** | Links, focus ring, verdict rule, CTA |
| `color.accent.clay.hover` | `#E9A47E` | **9.11:1** | Hover and active |
| `color.accent.mineral` | `#A3BCAF` | **9.38:1** | Observation marker, evidence rule, method stages |

**Clay** is warm, human, adjacent to skin and pigment. It is the *editorial* accent: interaction and
judgement.

**Mineral** is cool, quiet and slightly green — stone rather than sky. It is the *observed* accent:
timestamps, evidence rules, method markers. Cool against a warm ground is what makes it read as
instrument rather than as decoration, and its desaturation is what keeps it from reading as
clinical.

Two accents, two jobs. Nothing else in the system is coloured.

### Status

| Token | Value | Ratio | Use |
|---|---|---|---|
| `color.status.success` | `#93B189` | **8.04:1** | Form success |
| `color.status.warning` | `#DCA95E` | **8.94:1** | Disclosure pending verification |
| `color.status.error` | `#E08A80` | **7.34:1** | Form errors |

Muted and desaturated so they belong to the palette rather than arriving from a component library.
`warning` carries real semantic weight here: it is the colour of a review whose disclosure is
`unknown-pending-verification`.

### Evidence semantics

The colour half of `docs/EVIDENCE_LANGUAGE.md`.

| Token | Value | Ratio | Meaning |
|---|---|---|---|
| `color.evidence.claim` | `#9A9184` | **5.74:1** on raised | What the brand says. Deliberately the quietest voice |
| `color.evidence.observation` | `#A3BCAF` | **9.38:1** | What Zina saw |
| `color.evidence.verdict` | `#F2EDE3` | **15.30:1** on raised | What Zina concluded |

**The hierarchy is inverted from convention on purpose.** Marketing copy is the *least* emphasised
text on the page; the reviewer's own conclusion is the most. That inversion is the argument of the
site expressed in colour, and it is the first thing to protect if anyone proposes "making the
product claims stand out more".

---

## 4. Measured contrast

Full output: `node tools/check-contrast.mjs`. **24 required pairs, all passing.**

| Pair | Ratio | Min | Result |
|---|---|---|---|
| Body text on ground | 16.28:1 | 4.5 | PASS (AAA) |
| Body text on raised | 15.30:1 | 4.5 | PASS (AAA) |
| Body text on inset | 16.96:1 | 4.5 | PASS (AAA) |
| Secondary on ground | 9.89:1 | 4.5 | PASS (AAA) |
| Secondary on raised | 9.30:1 | 4.5 | PASS (AAA) |
| Muted on ground | 6.11:1 | 4.5 | PASS |
| Muted on raised | 5.74:1 | 4.5 | PASS |
| Clay as link on ground | 7.37:1 | 4.5 | PASS (AAA) |
| Clay as link on raised | 6.92:1 | 4.5 | PASS |
| Mineral as text on ground | 9.38:1 | 4.5 | PASS (AAA) |
| Mineral as text on raised | 8.81:1 | 4.5 | PASS (AAA) |
| Dark text on clay button | 7.37:1 | 4.5 | PASS (AAA) |
| Dark text on clay hover | 9.11:1 | 4.5 | PASS (AAA) |
| Claim text on raised | 5.74:1 | 4.5 | PASS |
| Observation text | 9.38:1 | 4.5 | PASS (AAA) |
| Verdict text on raised | 15.30:1 | 4.5 | PASS (AAA) |
| Success / Warning / Error | 8.04 / 8.94 / 7.34 | 4.5 | PASS |
| **Meaningful border (non-text)** | **3.56:1** | 3.0 | PASS |
| Focus ring (non-text) | 7.37:1 | 3.0 | PASS |
| Observation rule (non-text) | 9.38:1 | 3.0 | PASS |
| Disclosure band edge (non-text) | 8.40:1 | 3.0 | PASS |

**Every text pair in the system clears AA. Nine clear AAA.** The lowest text ratio anywhere is
5.74:1, on deliberately recessed claim text.

`line.hairline` at 1.30:1 is the only element below 3:1, and it is explicitly decorative — it never
carries information, and removing it would change nothing a user needs to know. Documented and
intentional.

---

## 5. Colour and photography

The ground was chosen partly so that skin renders truthfully against it.

- A warm ground flatters warm and deep skin tones. A blue-black ground pushes them toward grey — a
  real problem for a site whose stated expertise is shade accuracy for medium-deep warm undertones.
- Photography carries the saturation. The interface is almost monochrome so that images are the only
  colourful thing on the page.
- **Swatch and shade imagery is never colour-corrected toward the palette.** A shade swatch is
  evidence, and grading it to match the brand would be falsifying the thing being reviewed. Swatch
  images are graded for accuracy and sit visually apart from graded editorial photography.

---

## 6. Colour is never the only signal

Required for accessibility, and honest anyway.

| Distinction | Colour | Plus |
|---|---|---|
| Claim / observation / verdict | muted / mineral / ivory | Typeface, rule style, indentation, label |
| Link in prose | clay | Underline, always |
| Focus | clay ring | 2px ring plus 2px offset |
| Disclosure type | warning / neutral | Explicit text label |
| Form error | error | Icon plus text |
| Active nav item | clay | Weight change plus rule |

A reader with a colour-vision deficiency must be able to tell a brand claim from an observation.
Colour is the fastest cue; it is never the only one.

---

## 7. Light mode

**Not designed in Phase 2. Dark is the brand.**

The rationale: this is a committed art direction, not a theme, and the dark ground is the documented
editorial signal in a category that is three-quarters pale
(`docs/COMPETITIVE_RESEARCH.md` §3). A light variant built now would halve the attention available
for getting the dark one right.

The counter-argument is real and should be recorded: some readers genuinely prefer or need light
backgrounds for long-form reading, and there is no `prefers-color-scheme` response in this
specification.

**Mitigation.** Every token is semantic (`color.ground.base`, not `ink-900`), so a light theme is a
token-set swap rather than a redesign. The decision is deferred to Phase 4 with the cost already
paid. Flagged as open question Q-4.

**Not deferred:** Windows High Contrast / `forced-colors` mode must work correctly from the start.
That is not a theme, it is an accessibility requirement, and it is specified in
`docs/ACCESSIBILITY_ART_DIRECTION.md`.

---

## 8. What the palette refuses

- **Gold, brass, bronze, copper — any metal.** The cliché named in the brief.
- **Pure `#000` and pure `#FFF`.** Section 2.
- **Gradients**, except a single near-invisible vertical scrim behind text over photography, and
  never as decoration.
- **A third accent.** Two accents with two jobs. A third would have no job.
- **Saturated colour anywhere in the interface.** Saturation belongs to photography.
- **Pink as a brand colour.** The generic beauty signal the brand direction rejects. Pink may appear
  in a product photograph; it is never interface.
- **Colour-coded product categories.** Foundation is not blue and mascara is not purple. Categories
  are distinguished typographically.
- **Any colour that encodes a rating.** There are no ratings. No green-to-red scale, ever.
