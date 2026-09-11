# Typography System

**Status:** Phase 2 decision. Specification only.
**Risk register:** this addresses R-13, the highest-risk unresolved item carried out of Phase 1.

Arabic and Latin were evaluated **as one system**. No Latin face was chosen before an Arabic
companion was considered. Two of the five pairings below are single superfamilies designed across
both scripts, which is the strongest available answer to that requirement.

---

## 1. The constraints that actually decide this

Most bilingual sites fail not on font choice but on the structural differences between the scripts.
These come first because they eliminate several otherwise-attractive options.

### Arabic has no italic

There is no historical italic in Arabic. Some modern families ship "slanted" Arabic styles; these
are a recent invention, contested among Arabic type designers, and frequently look like a mechanical
oblique.

**Consequence:** the emphasis system must not depend on italic. Emphasis comes from **weight, size,
colour and position**. This removes the standard editorial pull-quote-in-italic device from the
entire design, in both scripts — because using it in Latin and substituting something else in Arabic
is precisely what makes an Arabic experience feel secondary.

### Arabic has no case

No capitals, no small caps, no title case. The all-caps tracked label — the default metadata device
in editorial design — **cannot be the shared system**.

**Consequence:** labels get a two-part specification. Latin labels may use small caps or tracked
uppercase; Arabic labels achieve equivalent quietness through **weight down, size down, and the
muted colour token**. Both must land at the same visual volume. This is designed as one component
with two script rules, not as a Latin component with an Arabic fallback.

### Letter-spacing breaks Arabic

Arabic letterforms connect. Positive tracking severs the joins and produces text that is not merely
ugly but harder to read.

**Consequence:** `tracking` is a **Latin-only token**. Arabic display type achieves presence through
size and weight instead. Any component that relies on wide tracking for its effect must be
re-thought rather than translated.

### Arabic runs optically smaller and needs more vertical room

At the same nominal size Arabic reads smaller than Latin, and its diacritics and deep descenders
need more leading.

**Consequence:** two system-wide factors, applied automatically per locale:

```
type.arabic.sizeFactor      1.12    Arabic renders at 112% of the Latin step
type.arabic.leadingFactor   1.18    Arabic line-height at 118% of the Latin value
```

These are tokens, not per-component overrides. Getting them wrong is the single most common reason
Arabic pages feel cramped beside their English counterparts.

### Arabic has no monospace tradition

The evidence layer depends on a monospace voice for timestamps and conditions. There is no
equivalent convention in Arabic typesetting, and forcing a mono Arabic would read as a technical
artefact rather than as a record.

**Consequence — an important one:** the mono tier carries **numerals, units and Latin identifiers
only**. In Arabic, the *labels* beside those numerals are set in the Arabic UI face at the label
weight. So `الساعة 6` renders the Arabic word in Plex Sans Arabic and the numeral in Plex Mono,
inside a bidi isolate. This is specified in `docs/BILINGUAL_TYPE_TEST.md` §5 and is the fiddliest
detail in the system.

### Numerals

Western digits (0–9) are standard in Gulf Arabic web content and are what the audience will expect.
Eastern Arabic-Indic numerals (٠–٩) are **not** used, pending evidence of audience preference (U-04).
All numerals in the evidence layer must be **tabular** so that columns of hours and percentages
align.

---

## 2. Roles the system must fill

| Role | Used for |
|---|---|
| **Display** | Review titles, section openers, verdict, homepage statement |
| **Editorial body** | Introduction, observations prose, conclusion, journal articles |
| **UI** | Navigation, buttons, form labels, filters, breadcrumbs |
| **Record / mono** | Timestamps, conditions, plate numbers, shade codes, dates |
| **Label** | Metadata, eyebrows, category tags, disclosure badges |

Each must exist in both scripts, or have a specified script-appropriate equivalent.

---

## 3. Pairings evaluated

### Pairing 1 — 29LT Zarid Serif + Zarid Text, with IBM Plex Sans / Plex Sans Arabic / Plex Mono ★ RECOMMENDED

**Zarid** is a bi-scriptual superfamily: the Arabic (Naskh Mastari) was designed by Pascal Zoghbi in
2014, with the Latin wedge serif added by Khajag Apelian in 2015, the two scripts drawn to match
each other rather than one being fitted to the other afterwards. 16 styles across 8 weights.
`Zarid Text` is the text-optimised sibling of `Zarid Serif`. Commercial licence via 29LT.

**IBM Plex** is an open-source superfamily (SIL OFL 1.1) developed by Mike Abbink at IBM with Bold
Monday; **Plex Sans Arabic** was drawn by Bold Monday with Wael Morcos. Critically, Plex provides
**Sans, Sans Arabic and Mono under one design system**, which is exactly what the UI and record
tiers need.

| | |
|---|---|
| Display | Zarid Serif (Latin + Arabic) |
| Editorial body | Zarid Text (Latin + Arabic) |
| UI | IBM Plex Sans / IBM Plex Sans Arabic |
| Record | IBM Plex Mono (numerals and Latin identifiers only) |
| Label | IBM Plex Sans / Plex Sans Arabic, small, muted |

**Why it wins.** It answers the brief's hardest requirement literally: the display and body voice is
one family designed across both scripts by designers of both scripts, so Arabic is structurally
co-equal rather than accommodated. Naskh Mastari has genuine editorial gravity without the
religious-manuscript register that a classical Naskh revival would bring. And the second family
solves the evidence layer completely — Plex Sans, Plex Sans Arabic and Plex Mono share proportions
and a design logic, so the record tier looks intentional in both languages.

Two families, two jobs: **Zarid is the voice, Plex is the instrument.** That maps exactly onto the
editorial-density / record-density split in `docs/ART_DIRECTION.md` §3.

**Costs and cautions.** Zarid is commercial — a web licence must be budgeted (open question Q-2).
Zarid ships "Slanted" styles; **do not build an emphasis system on the Arabic slant** without
reviewing it in person, per §1. Plex Sans Arabic ships as static weights; Latin Plex has variable
builds but **Arabic variable availability must be verified before it is assumed**. Four files to
load — mitigated by subsetting and by restricting to three weights.

**Verdict: recommended.**

---

### Pairing 2 — TPTQ Arabic Greta Arabic + Greta Sans / Greta Text

Another genuinely matched bi-scriptual system, from a foundry whose entire practice is Arabic-Latin
co-design.

**Strengths.** Arguably the most refined Arabic-Latin system available. Enormous range. Excellent
at both display and text sizes. Would produce a beautiful, extremely credible result.

**Weaknesses.** Greta is a *sans*-led system; the direction wants a serif editorial voice, and the
serif options here are a weaker fit for the "printed publication" register. Commercial, and at the
upper end of licensing cost. It is also a widely recognised choice in regional editorial design,
which slightly reduces distinctiveness.

**Verdict: strong runner-up.** The correct choice if the direction were sans-led editorial rather
than serif-led. Recommend as the first alternative if Zarid cannot be licensed.

---

### Pairing 3 — IBM Plex alone: Plex Serif + Plex Sans Arabic + Plex Sans + Plex Mono

The zero-cost option. Entire system from one open-source superfamily.

**Strengths.** Free (OFL 1.1). One design system across every role. Excellent mono. Genuinely good
Arabic. Trivial licensing and self-hosting. Best performance profile of any option — one family,
shared metrics.

**Weaknesses.** **Plex Serif has no Arabic companion.** The display tier would be Latin serif paired
with an Arabic *sans*, which breaks the co-equal principle at exactly the most visible level: the
English review title would be a serif and the Arabic review title a sans. That asymmetry is
precisely the "Arabic feels secondary" failure the brief warns against.

Plex also carries a strong association with IBM and with technology products, which pulls toward
the dashboard failure mode.

**Verdict: rejected as primary, adopted as the fallback tier.** See §6.

---

### Pairing 4 — A Latin editorial serif (Newsreader / Instrument Serif / Bodoni Moda) + Amiri

Amiri is a scholarly revival of the classical Naskh of 19th-century Bulaq Press in Cairo, free
under OFL, and genuinely beautiful.

**Strengths.** Amiri is one of the most refined free Arabic faces in existence. Real presence at
display size. Zero cost.

**Weaknesses.** **Register mismatch.** Amiri reads as book, manuscript and scholarship — its
associations are literary and, for many readers, religious. For contemporary beauty editorial it is
too formal and too historical. Pairing it with a contemporary Latin serif produces two typefaces
from different centuries sitting on the same line. Amiri is also poorly matched for small UI sizes,
so a second Arabic family would be required anyway.

**Verdict: rejected.** The right choice for a literary publication, the wrong register here.

---

### Pairing 5 — Readex Pro + a Latin display serif

Readex Pro is a free Arabic-and-Latin variable family built with legibility research behind it.

**Strengths.** Free. Variable, so one file covers a weight range — a real performance advantage.
Contemporary. Designed for both scripts. Good at UI sizes.

**Weaknesses.** It is a *functional* face rather than an editorial one. Little display personality,
and at 120px it has nothing to say. It would serve the UI and record tiers well but cannot carry
the brand voice, which means a display family is still needed and the pairing problem is unsolved.

**Verdict: rejected as a system.** A viable UI-tier substitute if Plex is dropped.

---

### Pairing 6 — Cairo / Tajawal / Almarai + a geometric Latin sans

Included because it is what the project would default to without deliberation.

**Strengths.** Free, ubiquitous, reliable, excellent language coverage, well-hinted at small sizes.
Cairo in particular is close to a default for Arabic digital text.

**Weaknesses.** **That ubiquity is the disqualifier.** These are the Arabic equivalents of
Montserrat and Poppins — used across a very large share of regional websites and marketing. An
Arabic-speaking visitor will have seen this exact typographic voice on a hundred other sites, and it
will read as a template, which is the specific perception the entire project exists to avoid. Little
display character.

**Verdict: rejected.** The single easiest way to make a $50,000 property look like a $500 one.

---

## 4. Recommendation

| Role | Latin | Arabic |
|---|---|---|
| **Display** | 29LT Zarid Serif | 29LT Zarid Serif (Arabic) |
| **Editorial body** | 29LT Zarid Text | 29LT Zarid Text (Arabic) |
| **UI** | IBM Plex Sans | IBM Plex Sans Arabic |
| **Record / mono** | IBM Plex Mono | *Numerals and Latin identifiers only.* Arabic labels use Plex Sans Arabic |
| **Label** | IBM Plex Sans, small, tracked | IBM Plex Sans Arabic, small, weight-differentiated, **never tracked** |

**Two families performing five roles.**

Zarid covers display and body because a single editorial voice across both scripts is the whole
point of the pairing — a serif in English and a serif in Arabic, drawn to match. Plex covers UI,
record and label because those three tiers need to feel like a different, quieter instrument, and
because Plex uniquely supplies Sans, Sans Arabic and Mono from one design system.

**Weights: three only.** Regular 400, Medium 500, Semibold 600. No thin weights at display size — a
100-weight serif at 120px looks expensive on a designer's monitor and fails at 320px, at 200% zoom,
and for anyone with low vision. No black weights; the direction achieves emphasis with size and
space.

---

## 5. Type scale

Latin values. Arabic is derived by the factors in §1 and applied automatically per locale.

| Token | Latin size / line-height | Arabic (×1.12 / ×1.18) | Family | Use |
|---|---|---|---|---|
| `display.xl` | 76 / 1.04 | 85 / 1.23 | Zarid Serif | Homepage statement |
| `display.lg` | 56 / 1.08 | 63 / 1.27 | Zarid Serif | Review title, page openers |
| `display.md` | 40 / 1.14 | 45 / 1.35 | Zarid Serif | Section openers, verdict |
| `display.sm` | 30 / 1.2 | 34 / 1.42 | Zarid Serif | Subsection, pull statement |
| `body.lg` | 21 / 1.62 | 24 / 1.91 | Zarid Text | Introduction, conclusion |
| `body.md` | 18 / 1.68 | 20 / 1.98 | Zarid Text | Editorial prose, observations |
| `body.sm` | 16 / 1.6 | 18 / 1.89 | Zarid Text | Secondary prose, captions |
| `ui.md` | 16 / 1.4 | 18 / 1.65 | Plex Sans | Navigation, buttons |
| `ui.sm` | 14 / 1.45 | 16 / 1.71 | Plex Sans | Filters, form labels |
| `record.md` | 15 / 1.5 | — | Plex Mono | Conditions, observation timestamps |
| `record.sm` | 13 / 1.5 | — | Plex Mono | Plate numbers, margin index |
| `label.sm` | 12 / 1.35 | 14 / 1.6 | Plex Sans | Eyebrows, metadata, badges |

**Floors, non-negotiable:** no text below 12px anywhere; no monospace below 13px; no body text
below 16px. `record.sm` at 13px is the smallest type in the system and appears only in the margin
index, where it is supporting rather than primary information.

Display sizes are fluid between the 375px and 1440px breakpoints; `display.xl` at 76px is the
1440px value and floors at 34px on mobile. See `docs/RESPONSIVE_ART_DIRECTION.md`.

**Measure:** 62–68 characters for Latin editorial body. Arabic measure is set by the same *column
width*, which naturally yields a slightly different character count — matching character counts
across scripts is the wrong target.

---

## 6. Fallback tier — if the type budget is zero

A complete open-source system, adopted as a whole rather than piecemeal:

| Role | Latin | Arabic |
|---|---|---|
| Display | IBM Plex Serif | **Noto Naskh Arabic** |
| Body | IBM Plex Serif | Noto Naskh Arabic |
| UI | IBM Plex Sans | IBM Plex Sans Arabic |
| Record | IBM Plex Mono | numerals only |
| Label | IBM Plex Sans | IBM Plex Sans Arabic |

**What is lost, stated plainly:** the display tier is no longer one matched family — Plex Serif and
Noto Naskh are drawn by different hands to different logics, and a discerning Arabic reader will
see it. The result is competent and entirely shippable; it is not distinctive, and distinctiveness
is a stated project goal. Noto Naskh is chosen over Amiri here because its register is neutral
rather than scholarly.

**This is a real fork in the road and belongs to the client**, not to the design. It is open
question Q-2 in the Phase 2 report.

---

## 7. Loading and performance

- **Self-host everything.** No third-party font CDN — a performance dependency and, for an Arabic
  subset served to a regional audience, a privacy consideration.
- **Subset aggressively.** Latin + Latin-1 for the Latin faces; Arabic + Arabic Presentation Forms
  for the Arabic faces. Arabic subsets are large; this is where the budget is won or lost.
- **`font-display: swap`**, with metric-compatible fallbacks declared via `size-adjust` and
  `ascent-override` so the swap does not shift layout. CLS budget is 0.05 and an unmatched font
  swap will spend all of it.
- **Load per locale.** An English page must never download the Arabic subsets, and vice versa. This
  roughly halves the font payload on every page.
- **Preload two files only:** the display weight used by the LCP element, and the body regular, for
  the active locale. Everything else loads normally.
- **Budget: 180KB total font payload per locale**, within the 1MB mobile page budget.

Four families in the specification, but only ever **three files per page per locale** in practice:
display, body, UI. Mono loads only on pages that carry an evidence layer — which is reviews, the
method page and parts of work, and not the homepage, journal or contact.
