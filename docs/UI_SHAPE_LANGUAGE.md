# UI Shape Language

**Status:** Phase 2 decision.

**The governing rule: editorial layouts are built from type, rules and space. A card is a last
resort.**

Most sites reach for a card whenever content needs grouping. That instinct is what turns a
publication into a dashboard, and it is the single most likely way this direction degrades in
Phases 3–5.

---

## 1. Border radius

```
radius.none      0px    everything
radius.control   2px    buttons, inputs, filter chips — ONLY these
```

**Two values. There is no third.**

Images: 0. Cards: 0. Surfaces: 0. Bands: 0. Plates: 0. Avatars: 0.

2px on controls exists solely so they read as touchable. It is small enough to be felt rather than
seen — which is the point.

**Never:** 8px, 12px, 16px, "rounded-lg", or a pill radius on anything that is not a filter chip.
A rounded rectangle is the most template-like shape in digital design, and the direction refuses it
everywhere content lives.

---

## 2. When a card is allowed

A **card** — a bounded surface containing grouped content — is permitted only when *all* three hold:

1. The items are genuinely peer objects in a set.
2. Each is individually actionable as a whole.
3. Rules and space cannot express the grouping.

By that test, the entire site uses cards in **three** places:

| Allowed | Why |
|---|---|
| Suitability block (suits / may not suit) | Two lists that belong to each other; the pairing is the meaning |
| Related content at the foot of a page | Peer objects, individually actionable, and the block must separate from the article |
| Mobile menu panel | A surface, not a card, but bounded |

**Everywhere else uses the editorial index treatment instead:**

```
CARD (rejected)                    INDEX TREATMENT (used)

┌──────────────────┐               ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │               ────────────────   hairline
│                  │               Foundation · Gifted
│ Foundation       │               Voile Lumière Skin Tint
│ Voile Lumière    │               Eight hours in 38° heat
│ [ Read → ]       │
└──────────────────┘               (whole block is the link)
```

Image, hairline, type. No container, no border, no padding box, no shadow, no hover lift. The
hairline does the separating that a card's edge would have done, at a fraction of the visual weight.

This applies to: review listings, journal listings, work listings, brand listings, homepage sections
4–6, and search results if search ever ships.

---

## 3. Buttons

Three variants. No more.

| Variant | Appearance | Use |
|---|---|---|
| **Primary** | `accent.clay` fill, `text.onAccent` label, 2px radius, 14px × 28px padding | One per page maximum. `/contact/` submit, homepage close CTA |
| **Secondary** | 1px `line.strong` border, transparent fill, `text.primary` label | Form cancel, filter reset |
| **Text link** | `accent.clay`, **underline always present** | Everything else, including "read the review" |

**The default is a text link.** A reading page should not be punctuated with buttons; a link inside
prose is the correct editorial gesture. Buttons appear at conversion points only.

- No shadows, no lift on hover, no scale, no gradient fills.
- Hover changes colour only, 150ms.
- Minimum 44px touch target, achieved with padding, not with a larger font.
- Button width accommodates the **Arabic** label; English is allowed to be roomy
  (`docs/BILINGUAL_TYPE_TEST.md` §7).

---

## 4. Pills and chips

One use only: **filter chips** on the reviews index.

- 2px radius, 1px `line.strong` border, transparent fill.
- Active state: `accent.clay` border and text, plus a filled mineral square marker.
- No count badges, no close ×, no removal animation.

**No pills anywhere else.** Not for categories, not for tags, not for disclosure. Disclosure is a
band with a statement, not a pill (`docs/EVIDENCE_LANGUAGE.md` §4) — a pill would trivialise it into
a badge.

---

## 5. Labels

Not pills. Not chips. Not badges. Labels are **type**:

- `label.sm`, `text.muted`, tracked uppercase in Latin, weight-differentiated in Arabic.
- Separated with ` · `.
- No background, no border, no container.

`FOUNDATION · TESTED JUNE 2026 · PAID PARTNERSHIP`

The one exception is the disclosure label inside the disclosure band, which sits on `ground.raised`
because the band itself is a surface.

---

## 6. Dividers and rules

The primary structural device. Three weights, three jobs.

| Rule | Weight | Colour | Job |
|---|---|---|---|
| Hairline | 1px | `line.hairline` (1.30:1) | Decorative separation. Carries no information |
| Strong | 1px | `line.strong` (3.56:1) | Meaningful boundaries: inputs, active states, claim/observation separation |
| Accent | 2px | `accent.clay` | **The verdict, and nothing else** |

Plus two specialised rules from the evidence language: the **dotted** hairline marking a brand
claim, and the **solid mineral** rule running the observation sequence.

The 2px clay rule is reserved absolutely. It appears once per review page. Using it anywhere else
would spend the strongest signal in the system on something that does not need it.

---

## 7. Frames and image containers

**Images have no frames.**

- No border, no radius, no padding, no inner shadow, no caption box.
- Images sit flush to the grid.
- Captions sit **below** the image with 24px gap and a hairline beneath the caption text — the art
  book treatment, where the rule closes the caption rather than boxing the image.
- Aspect ratios are enforced by the container so nothing shifts on load (CLS 0.05 budget).
- The only overflow container is the review-card hover frame, which clips the 1.02 scale so no
  layout moves.

---

## 8. Forms

The contact form is the only substantial form on the site, and it should feel calm.

| Element | Treatment |
|---|---|
| Input | 1px `line.strong` bottom border only — **no box**. Transparent fill. 2px radius on the focus ring, not the field |
| Focus | 2px `accent.clay` ring, 2px offset, appears instantly |
| Label | Above the field, `ui.sm`, `text.secondary`. **Always visible** — never a placeholder-as-label |
| Placeholder | Rarely used; `text.muted` when present |
| Error | `status.error` text beneath, plus a border change. Icon plus text |
| Select | Same underline treatment, native control |
| Submit | Primary button, one per form |

Underline-only inputs suit an editorial register and reduce visual noise, and the bottom border is
already at 3.56:1 so the field boundary is perceivable — which a fully borderless input would not
be.

---

## 9. What the shape language refuses

| Refused | Why |
|---|---|
| Rounded cards | Turns editorial content into components |
| Shadows and elevation | Software register; illegible on a dark ground |
| Everything-is-a-card layouts | The default failure mode of this project |
| Pills for categories and tags | Labels are type |
| Badges for disclosure | Trivialises the most important element on the page |
| Icon buttons in circles | |
| Bordered image frames | |
| Gradient fills and borders | |
| Hover lift, hover shadow, hover scale on containers | Only the image scales, 1.02, inside a clipped frame |
| Zebra striping and cell borders in tables | Hairline row rules only |
| Container queries producing a different visual language per width | One language, adapted |
| Any component that could ship in a SaaS UI kit | The register test |

---

## 10. RTL

Every shape rule is direction-agnostic, with three specifics:

- Rules and indents use **logical properties** (`border-inline-start`, `padding-inline-start`).
- The claim indent, observation rule and plate caption rule all flip.
- The filter-chip row starts at the inline start and scrolls in the correct direction.
- Radius is symmetric everywhere, so nothing needs mirroring.
