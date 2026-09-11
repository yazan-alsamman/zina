# Method UX

**Status:** Phase 3 decision.

`/{loc}/method/` is the trust moment in **every one of the eight flows** in `docs/USER_FLOWS.md`.
It is the only Tier 1 page that is simultaneously a trust artefact for brands, a conversion moment
for readers, and a plausible ranking page for a real informational query.

Phase 1: *"If one page must be excellent, it is this one."* Phase 3 does not disagree.

---

## 1. The page's job, in one sentence

**Convince a sceptic that the testing is real, by showing its limits.**

Not by listing stages. A sceptic is not persuaded by a process diagram — they are persuaded by
someone volunteering what their process *cannot* establish. That is why `doesNotProve` is a required
field per stage rather than a disclaimer at the bottom, and why the UX gives it the same weight as
`purpose`.

Every layout decision on this page follows from that sentence.

---

## 2. PROJECT MOCK METHOD vs VERIFIED ZINA METHOD

**This is the most important section in this document.**

The six-stage method was **invented during Phase 0**. It is a proposal for how Zina *could* structure
her testing. It has never been confirmed as her practice. Phase 1 adopted it as the
information-architecture spine; Phase 2 adopted it as the visual spine. Neither verified it.

### The two terms, used consistently from here into Phase 4

| Term | Meaning | Current status |
|---|---|---|
| **PROJECT MOCK METHOD** | The six-stage protocol invented in Phase 0 and carried through Phases 1–3 as a structural placeholder | **This is what exists today** |
| **VERIFIED ZINA METHOD** | Whatever Zina confirms she actually does — either an endorsement of these six stages, or her own protocol replacing them | **Does not exist.** Blocked on Q-3 (Phase 2) / Q-2 (Phase 1), unanswered since Phase 0 |

### What the UX must never imply

The page must never read as *"Zina's official testing methodology"* while the method is a project
mock. Concretely, and binding on Phase 4:

| Forbidden | Because |
|---|---|
| Seal, badge, crest, monogram, shield, or any accreditation-shaped mark | Implies certification by a body that does not exist |
| The words *clinical*, *validated*, *certified*, *proven*, *scientific*, *lab-tested* — in copy **or** visual metaphor | The content explicitly disclaims each |
| A version number, an "established 20XX", or any longevity signal | Implies a history the method does not have |
| Flask, beaker, microscope, molecule, test tube, clipboard-with-ticks iconography | The clinical implication the content disclaims |
| `doesNotProve` rendered smaller, lighter, collapsed, or as a footnote | Turns the honesty into small print, which inverts the page's argument |
| A percentage, confidence indicator, or accuracy figure anywhere | Implies a precision one person testing on one face cannot have |
| Presenting the method as a *standard* others could follow | It is an author's stated approach |

### What the UX does instead

The page is framed as **an author's stated approach**, in the first person, throughout. The
`boundaryStatement` is not a disclaimer at the foot of the page — it sits **above the six stages**,
before the reader has invested in them:

> *"This is structured personal testing, not clinical testing. One person, one face, no control
> group, no laboratory."*

### The distinction survives into Phase 4 by these three mechanisms

1. **This document and the decision log**, which name the two terms and are read at Phase 4 kickoff.
2. **`content/mock/method.json` carries a `notice` field** stating the method is fictional, and
   `_verification: "MOCK"`. A record with `_verification: MOCK` **cannot reach `published`** — the
   lifecycle makes shipping it a build failure, not a review finding.
3. **`tools/check-mock-guard.mjs` fails the build** on `"status": "mock"` and on the `mock-` id
   prefix. `mock-method-six-stage` cannot appear in production output.

**So the boundary is enforced by the data layer, not by anyone remembering it.** That is the point.

### If Zina confirms or replaces the method

Nothing in the UX changes. The page is designed around **having a documented method with stated
limits**, not around these six particular stages. A different number of stages changes the
horizontal sequence on the homepage from six to *n* and nothing else. `stageOrder` is data.

**What does change:** the copy may drop the hedging in the introduction, and the method may be named
after her. Neither is a layout change.

---

## 3. Page structure

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  [BREADCRUMB]  Home / Method                                                 │
│                                                                              │
│  [NAME]        The Six-Stage Test              ← display.lg, h1              │
│  [TAGLINE]     Same six stages, every product, so that any two reviews       │
│                can be read against each other.        ← display.sm           │
│                                                                              │
│  [INTRODUCTION]  body.lg, text column                                        │
│  Most beauty reviews are written from memory…                                │
│                                                                              │
│  ┌─[BOUNDARY STATEMENT]── ground.raised · paper grain 3% ──────────────────┐ │
│  │  WHAT THIS IS                                                           │ │
│  │  This is structured personal testing, not clinical testing. One person, │ │
│  │  one face, no control group, no laboratory. It can tell you how a       │ │
│  │  product behaved on my skin under conditions I have written down. It    │ │
│  │  cannot tell you what a product will do to your skin, and nothing on    │ │
│  │  this site is medical, dermatological or scientific advice.             │ │
│  └──────────────────────────────────────────────────────────────────────────┘│
│        ↑ ABOVE the stages. Same surface treatment as the disclosure band,    │
│          which is deliberate: both are statements about limits of authority. │
│                                                                              │
│  ┌── index ──┐ ┌────────────── text column ──────────────┐                   │
│  │           │ │                                                             │
│  │  01       │ │  BASELINE                          ← h2                     │
│  │  ▪        │ │  Establish a fixed reference point before any product       │
│  │           │ │  touches the skin, so that every later observation is a     │
│  │           │ │  comparison rather than a memory.        ← PURPOSE, body.md │
│  │           │ │                                                             │
│  │           │ │  WHAT IS OBSERVED                                           │
│  │           │ │  ▪ Bare skin in named, repeatable lighting                  │
│  │           │ │  ▪ Current skin condition in plain descriptive language     │
│  │           │ │  ▪ Time of day and the products already worn, if any        │
│  │           │ │                                                             │
│  │           │ │  WHAT IS RECORDED                                           │
│  │           │ │  ▪ Reference photograph at a fixed camera distance          │
│  │           │ │  ▪ Written note of lighting setup and time                  │
│  │           │ │                                                             │
│  │           │ │  ────────────────────────────────────────────────           │
│  │           │ │  WHAT THIS STAGE DOES NOT PROVE                             │
│  │           │ │  A baseline photograph does not establish a skin type, a    │
│  │           │ │  skin condition, or anything about anyone else's skin. It   │
│  │           │ │  is a starting frame for one test on one day.               │
│  │           │ │       ↑ SAME SIZE, SAME COLOUR, SAME FAMILY AS PURPOSE      │
│  │           │ │                                                             │
│  │           │ │  Reviews that used this stage:  Voile Lumiere · Sitara      │
│  │           │ │                                                             │
│  │  02       │ │  APPLICATION                                                │
│  │  ▪        │ │  …                                                          │
│  │           │ │                                                             │
│  │  … 03 04 05 06 …                                                          │
│  └───────────┘ └─────────────────────────────────────────────────────────────┘
│                                                                              │
│  ┌─[WHAT THIS CANNOT TELL YOU]── ground.inset ─────────────────────────────┐ │
│  │  ▪ Whether a product will suit your skin. One person cannot answer      │ │
│  │    that, and any review that claims to is selling something.            │ │
│  │  ▪ Anything medical, dermatological or clinical…                        │ │
│  │  ▪ Long-term effects. The longest test on this site is four weeks.      │ │
│  │  ▪ Ingredient safety or efficacy…                                       │ │
│  │  ▪ How a product performs in a climate it was not tested in.            │ │
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  [THE METHOD APPLIED]  2–4 representative reviews, index treatment           │
│                                                                              │
│  [EDITORIAL STANDARDS]  one text link                                        │
│  [FOOTER]                                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Six stage anchors on one page, not six routes.** Six stage pages at the current depth would be six
thin pages. Promotion to `/{loc}/method/{stage}/` happens only if a stage accumulates substantial
standalone content — most plausible for `conditions` (Phase 1 Q-4).

---

## 4. Stage specification

Every stage renders the same five blocks in the same order. **The order is fixed and is not an
editorial choice per stage**, for the same reason the review page's section order is fixed: two
stages must be comparable.

| Block | Source | Treatment | Why it is here |
|---|---|---|---|
| **Number + name** | `stageOrder` index, `name` | Mono numeral in the index, name as `h2` | The number is the position in a sequence, not a rank |
| **Purpose** | `purpose` | `body.md`, `text.primary` | Answers *why does this stage exist* |
| **What is observed** | `observes[]` | List, mineral square markers | Answers *what is watched* |
| **What is recorded** | `evidence[]` | List, mineral square markers | Answers *what would I be shown* |
| **What this stage does not prove** | `doesNotProve` | **`body.md`, `text.primary`, identical to purpose**, preceded by a hairline and a label | Answers *where does this stop* — **the block that converts the sceptic** |
| **Reviews that used this stage** | reviews whose `testing.methodStageKeys` include this key | Index treatment, locale-filtered | Turns a claim into an example, and builds the internal link graph in the other direction |

### The user question each stage answers

| Stage | The reader's actual question | Evidence relationship |
|---|---|---|
| **01 Baseline** | "Compared to what?" | The hour-0 reference photograph every later plate is read against |
| **02 Application** | "Did you use it properly, or is this user error?" | Quantity, tool, wait time — the variables that make a bad result reproducible |
| **03 Wear window** | "How long did you actually watch it for?" | The timed check-ins that become the observation sequence and the margin index |
| **04 Conditions** | "Under what circumstances? A long-wear claim in air conditioning means nothing" | **The conditions well.** The single most differentiating stage |
| **05 Comparison** | "Compared to what else?" | Side-by-side plates; the comparison product named and linked |
| **06 Revisit** | "Is this still true?" | The dated `updateLog` entries on reviews |

**Stage 04 is the one to lead with in any summary.** It is the stage that maps to the content
competitors do not publish, and it is the one the SEO seams (`docs/SEO_CONTENT_HIERARCHY.md` §5)
are built on.

### Equal weight, enforced

`purpose` and `doesNotProve` share **family, size, colour and column width**. The only differences
are a hairline rule above `doesNotProve` and its label.

**This is checkable in a diff.** If `doesNotProve` ever acquires a smaller size token, a muted
colour, a `<details>` wrapper or a smaller column, the page's argument has been inverted and the
change should be rejected in review.

---

## 5. Navigation within the Method

| Mechanism | Behaviour |
|---|---|
| **Stage anchors** | `/{loc}/method/#baseline` … `#revisit`. Stable, English keys in both locales (the keys are internal; the names are localised) |
| **In-page stage list** | A short index at the top of the stage sequence — six names, linked. **Not sticky.** Not a floating table of contents |
| **From reviews** | Every review's method-stage markers link to the corresponding anchor. **The most-repeated internal link on the site** |
| **From journal** | `related.methodStageKeys` links an article to the stage it explains |
| **Back out** | Each stage ends with the reviews that used it — the return path into the corpus |
| **Scroll offset** | `scroll-margin-top` on every anchor so the sticky header never covers a stage heading, and so a keyboard user landing on an anchor sees the focused element |

**No sticky stage navigation.** A sticky rail would be a control, and the margin index in this system
is marginalia, not a control (`docs/MOTION_ART_DIRECTION.md` §4: *"Sticky margin index: No. It
scrolls with content"*).

---

## 6. Responsive behaviour

| Element | 320–767 | 768–1023 | 1024+ |
|---|---|---|---|
| Stage number | Inline marker row above the stage name | Inline marker row | **Margin index column** |
| Stage blocks | Single column, 20px margins | Single column, 48px margins | Index + text column |
| `observes` / `evidence` lists | Stacked | **Two columns side by side** | Two columns |
| `doesNotProve` | Full width, hairline above | Full width | Full width, hairline above |
| Boundary statement | Full-bleed, 20px padding, **never truncated** | Full-bleed, 32px | Contained, 40px |
| `whatThisCannotTell` | Stacked list | Stacked list | Inset well, two columns |
| Reviews that used this stage | Stacked | Two-up | Three-up or index list |
| Section rhythm | 56px | 72px | 96px |

At 320px the boundary statement is the element to check: it is the longest single passage on the
page and it must be **fully visible**, never behind a "read more".

---

## 7. Arabic behaviour

| Element | Rule |
|---|---|
| Stage numbers | Western numerals, tabular, `<bdi dir="ltr">01</bdi>` — the numeral isolated, not the whole run |
| Margin index | Moves to the **right** |
| Stage names | Localised (`الأساس المرجعي`, `التطبيق`, `مدة الثبات` …). **Keys stay English and internal** |
| `doesNotProve` | ×1.12 / ×1.18 like all body text. **Equal weight rule applies identically** |
| Boundary statement | The most important Arabic passage on the site after the disclosure statements. It must read as written Arabic, not as a translated legal notice — flagged for the native-reader review (`docs/PHASE_3_BILINGUAL_TYPE_PROOF.md` §7, question 8) |
| Lists | Markers at inline start |
| Required in both locales | **Validator-enforced.** A bilingual site whose core differentiator exists in only one language is not a bilingual site |

---

## 8. Accessibility

| Requirement | |
|---|---|
| Heading structure | `h1` name → `h2` per stage → `h3` for `WHAT IS OBSERVED` / `WHAT IS RECORDED` / `WHAT THIS STAGE DOES NOT PROVE` |
| Stage sequence | An **ordered list**. The stages have an order, and it is meaning |
| Stage numbers | Real text content, not CSS counters, so they are announced |
| Boundary statement | A `<section>` with an accessible name, e.g. "What this method is and is not". **Never a `<details>`** — the limits must not be collapsible |
| `doesNotProve` | Reachable in reading order immediately after the stage's evidence. A screen-reader user must not have to hunt for the limit |
| Markers | The mineral square is decorative; list semantics carry the structure |
| Anchors | `scroll-margin-top`; focus visible on the heading when an anchor is followed |
| Colour independence | Nothing on this page distinguishes meaning by colour. Stage applied/not-applied does not appear here — that is a review-page distinction |
| Reduced motion | The stage sequence's 60ms stagger disappears; the stages are simply present |

---

## 9. Empty and partial states

| State | Behaviour |
|---|---|
| Method missing in a locale | **Build fails.** Required in both |
| Fewer than three stages | Validator fails (`stageOrder` minimum 3) |
| A stage with no `doesNotProve` | Validator fails — required field |
| No reviews yet use a stage | The "reviews that used this stage" block for that stage is **removed**, not rendered empty. The stage still exists — the protocol is not defined by what has been published |
| Fewer than two representative reviews site-wide | The block shows what exists at the layout that count deserves (`docs/EMPTY_PARTIAL_UX.md` §3) |
| `whatThisCannotTell` under 3 entries | Validator fails — minimum 3 |

**There is no empty state for the boundary statement, the stages, or their limits.** The data layer
guarantees they exist, which is why the design does not need to design around their absence.

---

## 10. Where the Method appears elsewhere

The evidence language is **rationed**, and so is the Method.

| Surface | What appears | What must not |
|---|---|---|
| Homepage §3 | Six names, one line each, boundary sentence, link | Icons, a diagram, a circular graphic |
| Homepage §1 | **One line**: *"Six stages, the same six every time. How I test →"* | Any record density |
| Review page | Stage markers, applied filled / not-applied hollow, linked | The stage descriptions repeated |
| Journal article | A link to the relevant stage anchor | A stage summary block |
| `/about/` | One link, from `person.methodId` | A second telling of the method |
| Work case study | Nothing | The method is editorial; work is commissioned |
| Brand page | Nothing | |
| Footer | "How I test" — the plainer phrasing, because the footer is where a hesitant reader looks | |

**The Method is described in full in exactly one place.** Everywhere else links to it. That is what
accumulates its authority, and it is also what stops the site repeating itself.

---

## 11. What would make this page fail

- `doesNotProve` set smaller, lighter, or inside a `<details>`.
- The boundary statement moved below the stages.
- A seal, badge or crest appearing anywhere on it.
- The word "protocol" upgraded to "standard", or "approach" upgraded to "methodology" in a way that
  implies external validation.
- Six icons replacing six names.
- A circular or infographic treatment of the sequence.
- The page presented as a VERIFIED ZINA METHOD while it remains a PROJECT MOCK METHOD.
- A sticky stage navigation rail turning marginalia into a control.
- The stages surviving into production with `mock-method-six-stage` in the output — a **build
  failure**, by design.
