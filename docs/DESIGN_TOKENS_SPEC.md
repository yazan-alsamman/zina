# Design Tokens Specification

**Status:** Phase 2 conceptual specification. **No CSS.** Phase 4 converts this to custom
properties.

Every token is **semantically named** — `color.surface.primary`, never `black-900` — so that a theme
change, a locale change or a light variant is a value swap rather than a redesign.

Naming: `category.group.variant.state`, lowercase, dot-separated.

---

## 1. Colour

Values verified by `node tools/check-contrast.mjs`. Rationale in `docs/COLOR_SYSTEM.md`.

### Ground

| Token | Value | Use |
|---|---|---|
| `color.ground.inset` | `#0B0A08` | Conditions well, evidence strip |
| `color.ground.base` | `#12100D` | The page |
| `color.ground.raised` | `#1A1714` | Disclosure band, claim block, related content |
| `color.ground.overlay` | `#211D18` | Mobile menu, dialogs |

### Text

| Token | Value | On base |
|---|---|---|
| `color.text.primary` | `#F2EDE3` | 16.28:1 |
| `color.text.secondary` | `#C3BAAC` | 9.89:1 |
| `color.text.muted` | `#9A9184` | 6.11:1 |
| `color.text.onAccent` | `#12100D` | 7.37:1 on clay |

### Line

| Token | Value | Ratio | Use |
|---|---|---|---|
| `color.line.hairline` | `#2C2823` | 1.30:1 | Decorative only |
| `color.line.strong` | `#75695C` | 3.56:1 | Meaningful boundaries |

### Accent

| Token | Value | Ratio |
|---|---|---|
| `color.accent.clay` | `#D9906A` | 7.37:1 |
| `color.accent.clay.hover` | `#E9A47E` | 9.11:1 |
| `color.accent.mineral` | `#A3BCAF` | 9.38:1 |

### Status

| Token | Value | Ratio |
|---|---|---|
| `color.status.success` | `#93B189` | 8.04:1 |
| `color.status.warning` | `#DCA95E` | 8.94:1 |
| `color.status.error` | `#E08A80` | 7.34:1 |

### Evidence semantics

| Token | Maps to | Meaning |
|---|---|---|
| `color.evidence.claim` | `#9A9184` | What the brand says. Quietest |
| `color.evidence.observation` | `#A3BCAF` | What Zina saw |
| `color.evidence.verdict` | `#F2EDE3` | What Zina concluded. Loudest |

### Disclosure

| Token | Maps to |
|---|---|
| `color.disclosure.independent` | `color.text.muted` |
| `color.disclosure.editorial` | `color.text.muted` |
| `color.disclosure.gifted` | `color.accent.mineral` |
| `color.disclosure.sponsored` | `color.accent.clay` |
| `color.disclosure.paid` | `color.accent.clay` |
| `color.disclosure.pending` | `color.status.warning` |

Semantic aliases, not new values — so a palette change propagates correctly and a disclosure state
can never drift away from the system.

### Focus

| Token | Value |
|---|---|
| `color.focus.ring` | `color.accent.clay` |
| `color.focus.ringOnAccent` | `color.text.primary` |

---

## 2. Typography

Families per `docs/TYPOGRAPHY_SYSTEM.md`. Fallback stack in §6 there.

| Token | Value |
|---|---|
| `type.family.display` | Zarid Serif (Latin + Arabic) |
| `type.family.body` | Zarid Text (Latin + Arabic) |
| `type.family.ui` | IBM Plex Sans / Plex Sans Arabic |
| `type.family.record` | IBM Plex Mono (numerals and Latin identifiers only) |

| Token | Value |
|---|---|
| `type.weight.regular` | 400 |
| `type.weight.medium` | 500 |
| `type.weight.semibold` | 600 |

No weights below 400 or above 600 exist in the system.

### Scale

Latin size / line-height at 1440px. Fluid values in `docs/RESPONSIVE_ART_DIRECTION.md` §3.

| Token | Size / LH | Family |
|---|---|---|
| `type.display.xl` | 76 / 1.04 | display |
| `type.display.lg` | 56 / 1.08 | display |
| `type.display.md` | 40 / 1.14 | display |
| `type.display.sm` | 30 / 1.20 | display |
| `type.body.lg` | 21 / 1.62 | body |
| `type.body.md` | 18 / 1.68 | body |
| `type.body.sm` | 16 / 1.60 | body |
| `type.ui.md` | 16 / 1.40 | ui |
| `type.ui.sm` | 14 / 1.45 | ui |
| `type.record.md` | 15 / 1.50 | record |
| `type.record.sm` | 13 / 1.50 | record |
| `type.label.sm` | 12 / 1.35 | ui |

### Script adaptation

| Token | Value | Applies |
|---|---|---|
| `type.arabic.sizeFactor` | 1.12 | Every size token, Arabic locale |
| `type.arabic.leadingFactor` | 1.18 | Every line-height, Arabic locale |
| `type.tracking.label` | 0.08em | **Latin only** |
| `type.tracking.display` | -0.01em | **Latin only** |
| `type.tracking.arabic` | **0, always** | Arabic. Never overridable |

`type.tracking.arabic` is a token specifically so that it is visible in the system and cannot be
casually overridden. Letter-spacing breaks Arabic letterforms.

### Measure and figures

| Token | Value |
|---|---|
| `type.measure.editorial` | 62–68ch |
| `type.measure.narrow` | 48ch |
| `type.figures.tabular` | on — all record and conditions values |
| `type.numerals` | Western 0–9, both locales |

---

## 3. Spacing

8px baseline. `space.1` = 8px.

| Token | Value | Use |
|---|---|---|
| `space.0-5` | 4 | Icon gaps |
| `space.1` | 8 | Tight |
| `space.2` | 16 | Related lines |
| `space.3` | 24 | Image to caption, claim indent |
| `space.4` | 32 | Component internal |
| `space.5` | 40 | Block internal |
| `space.6` | 48 | Sub-block separation |
| `space.7` | 56 | Mobile section rhythm |
| `space.8` | 64 | Section internal |
| `space.9` | 72 | Tablet section rhythm |
| `space.10` | 96 | **Desktop section rhythm** |
| `space.12` | 128 | Major separation, homepage sections |

| Semantic | Maps to |
|---|---|
| `space.section.mobile` | `space.7` (56) |
| `space.section.tablet` | `space.9` (72) |
| `space.section.desktop` | `space.10` (96) |
| `space.verdict.above` | `space.10` (96) |
| `space.related.above` | `space.12` (128) |

---

## 4. Layout

| Token | Value |
|---|---|
| `layout.maxWidth.content` | 1180px |
| `layout.maxWidth.text` | 620px |
| `layout.maxWidth.narrow` | 640px |
| `layout.columns` | 12 |
| `layout.gutter` | 24px |
| `layout.margin.mobile` | 20px |
| `layout.margin.tablet` | 48px |
| `layout.margin.desktop` | auto (centred to 1180) |
| `layout.index.width` | 160px |
| `layout.index.gap` | 32px |

`layout.index.*` describes the margin index, the signature device.

---

## 5. Radius

| Token | Value | Use |
|---|---|---|
| `radius.none` | 0 | **Everything** |
| `radius.control` | 2px | Buttons, inputs, filter chips only |

There is no third radius token, deliberately.

---

## 6. Borders

| Token | Value |
|---|---|
| `border.width.hairline` | 1px |
| `border.width.accent` | 2px |
| `border.style.solid` | solid |
| `border.style.claim` | **dotted** |
| `border.rule.hairline` | 1px solid `color.line.hairline` |
| `border.rule.strong` | 1px solid `color.line.strong` |
| `border.rule.observation` | 1px solid `color.accent.mineral` |
| `border.rule.claim` | 1px dotted `color.line.hairline` |
| `border.rule.verdict` | **2px solid `color.accent.clay`** |

`border.rule.verdict` appears once per review page and nowhere else.

---

## 7. Shadows

| Token | Value |
|---|---|
| `shadow.none` | none |

**The system has one shadow token and its value is `none`.** Elevation is expressed by ground level,
hairline and space. Shadows on a dark ground read as cheap or as software.

Recorded as a token so the absence is explicit rather than an omission someone later "fixes".

---

## 8. Motion

| Token | Value |
|---|---|
| `motion.duration.instant` | 100ms |
| `motion.duration.quick` | 150ms |
| `motion.duration.base` | 250ms |
| `motion.duration.settle` | 400ms |
| `motion.duration.slow` | 600ms (reserved, unused) |
| `motion.easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `motion.easing.exit` | `cubic-bezier(0.4, 0, 1, 1)` |
| `motion.easing.attend` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `motion.stagger.sequence` | 80ms |
| `motion.stagger.compact` | 60ms |
| `motion.stagger.maxItems` | 8 |
| `motion.distance.settle` | 12px |
| `motion.distance.subtle` | 8px |
| `motion.scale.image` | 1.02 |

No spring, no bounce, no overshoot tokens exist.

**Reduced motion is a token-level override:** all durations → 0, all transforms → none, all staggers
→ 0, except focus which stays instant.

---

## 9. Z-index

Named layers only. No arbitrary integers anywhere.

| Token | Value | Layer |
|---|---|---|
| `z.base` | 0 | Page content |
| `z.raised` | 10 | Sticky section headers |
| `z.header` | 100 | Site header |
| `z.overlay` | 200 | Mobile menu |
| `z.dialog` | 300 | Dialogs |
| `z.toast` | 400 | Reserved |
| `z.skipLink` | 500 | **Always on top** |

`z.skipLink` is highest because a skip link that renders beneath the header is a skip link that does
not work.

---

## 10. Breakpoints

| Token | Value |
|---|---|
| `bp.xs` | 320px |
| `bp.sm` | 600px |
| `bp.md` | 768px |
| `bp.lg` | 1024px |
| `bp.xl` | 1280px |
| `bp.2xl` | 1440px |

`bp.md` (two-column blocks) and `bp.lg` (margin index and full header) are the two that carry real
compositional change.

---

## 11. Media

| Token | Value |
|---|---|
| `media.ratio.portrait` | 4/5 |
| `media.ratio.hero.desktop` | 16/10 |
| `media.ratio.hero.mobile` | 4/5 |
| `media.ratio.plate` | 3/2 |
| `media.ratio.platePair` | 1/1 |
| `media.ratio.work` | 16/10 |
| `media.ratio.journal` | 16/9 |
| `media.grain.opacity` | 0.03 |

---

## 12. Implementation notes for Phase 4

- Tokens become CSS custom properties on `:root`, one-to-one with these names.
- **Arabic factors apply at the locale root** (`[lang="ar"]`), computed once, not per component.
- **Logical properties everywhere.** `border-inline-start`, never `border-left`. No token encodes a
  physical direction.
- Reduced motion overrides the motion tokens in a single media query, not per component.
- `forced-colors` overrides colour tokens; because no information lives in surface value or texture,
  nothing is lost.
- Fluid type uses `clamp()` with **`rem`-based** preferred values so user text scaling continues to
  work.
- A light theme, if ever built, redefines only the `color.*` tokens. Nothing else changes — which is
  the entire reason for semantic naming.
