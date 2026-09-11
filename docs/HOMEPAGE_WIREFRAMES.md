# Homepage Wireframes

**Status:** Phase 3 decision. Written **after** the review page, per the brief.

**Input:** `docs/HOMEPAGE_ART_DIRECTION.md` (Phase 2, seven sections, **scored 7/10 — the weakest
surface in the direction**).

**The brief's instruction:** do not fix 7/10 with visual decoration. Fix it through information
architecture and proof hierarchy.

---

## 1. The diagnosis

Phase 2 scored the homepage 7/10 and named the reason: *"the evidence language is rationed to one
block here, so what remains is a well-executed dark editorial homepage in a category with a lot of
good work in it. It also depends almost entirely on a portrait that does not exist."*

Two distinct problems, and only one of them is about photography.

| Problem | Phase 2 framing | Phase 3 reading |
|---|---|---|
| **P1 — the proof is one screen too late** | "Proof arrives on screen two" — presented as a strength | It is a strength *relative to the category*. But at 88vh plus 128px of section spacing, on a 375px phone the featured review begins around 1.6 viewport heights down. The proof arrives on **swipe two**, and a large share of social traffic never takes it |
| **P2 — the page is portrait-dependent** | "Depends almost entirely on a portrait that does not exist" | The *atmosphere* depends on the portrait. The *argument* does not. Phase 2 did not separate the two, so the whole page inherits the dependency |

**The Phase 3 fix is proximity and independence, not addition.** Nothing is added to the homepage.
Two things move, and one dependency is severed.

---

## 2. The three architectural changes

### Change 1 — the opening section is shortened, not redesigned

`88vh → 72vh` at desktop, and **content-driven with a hard cap of `78vh` on mobile**.

Phase 2 chose 88vh *"so a sliver of the next section is visible and the page reads as a document
rather than a slide deck."* That reasoning is right and Phase 3 keeps it — it simply asks for **more
than a sliver**. At 72vh the featured review's disclosure label and its first condition line are
above the fold at 1440, and the block begins within **one swipe** at 375.

**Measured requirement, not a preference:** at 375 × 667 (the smallest common phone viewport), the
featured review block must begin **before 1.0 viewport heights**. Phase 2's own rule was 1.5. This
is the single highest-value change on the page.

### Change 2 — the Method line moves into section 1

One line, directly beneath the name and title, as a **text link**:

> `Six stages, the same six every time. How I test →`

Not a section. Not a badge. Not an icon row. One sentence and a link, at `ui.md` in
`text.secondary`, with the clay underline.

**Why this is not "adding decoration".** The homepage must answer *why her testing is different*
within two screens. Phase 2 answered it in section 3 — the third screen. A single line in section 1
answers it in the first, costs 40px of vertical space, adds no image, no record density and no new
device, and gives the differentiator a link a full screen earlier than it had one. Section 3 still
exists and still carries the six stages properly; this line is the promise it fulfils.

**It does not import record density into section 1.** No mono, no mineral rule, no numerals set as
data. The word "six" is prose.

### Change 3 — the portrait becomes optional, structurally

The argument of the homepage is: *claim → proof → method → corpus*. The portrait supports the
claim's **tone**; it carries none of its **content**.

Phase 3 makes that explicit by defining two states (§4 and §5) in which the *same seven sections* in
the *same order* remain credible. State B is not a degraded State A — it is a different composition
of the same architecture, chosen by what exists.

**Consequence for the LCP:** in State A the LCP element is the portrait; in State B it is the
statement text, and the display font is preloaded instead of an image. Both are budgeted.

---

## 3. What the first two screens must answer

| Question | Answered by | Screen |
|---|---|---|
| **What is this?** | The opening statement — the thesis, not a greeting | 1 |
| **Who is she?** | Name + professional title, small, beneath the statement | 1 |
| **Why is her testing different?** | **The Method line** — *"Six stages, the same six every time"* | **1** (was 3) |
| **Where is the proof?** | The featured review: disclosure label, three conditions in mono, one observation | **1–2** (top edge visible at 1440; within one swipe at 375) |

All four, within two screens, with **no new component and no new device**.

---

## 4. STATE A — full photography available

The composition Phase 2 designed, with the two changes applied.

### Desktop 1440

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [HEADER]  Zina Almokri     Reviews Method Journal Work About  [Collaborate] EN/ع│
├──────────────────────────────────────────────────────────────────────────────┤
│                                                              ┌──────────────┐│
│  ┌── cols 1–7 ─────────────────────────────┐                 │              ││
│                                                              │              ││
│   Beauty creator. Every product on                           │  [PORTRAIT]  ││
│   this site was worn, timed,                                 │   4:5        ││
│   photographed and documented on                             │   bleeds to  ││
│   my own skin.                                               │   the right  ││
│                        ↑ display.xl 76px, 3 lines, inline-start│   edge      ││
│                                                              │              ││
│   Zina Almokri                          ← ui.md              │  NO TEXT     ││
│   Beauty Creator and Product Testing Specialist  ← label.sm  │  OVER IT     ││
│                                                              │              ││
│   Six stages, the same six every time. How I test →  ← NEW   │  LCP: eager, ││
│                                                              │  preloaded,  ││
│                                                              │  no animation││
│  └──────────────────────────────────────────┘                └──────────────┘│
│                                                            ~72vh             │
├──────────────────────────────────────────────────────────────────────────────┤ ← fold at 1440
│  ─────────────────────────────────────────────────────────────────────────   │
│  ┌── image cols 1–6 ──────────────┐  ┌── content cols 7–12 ───────────────┐  │
│  │                                │  │  PAID PARTNERSHIP     ← disclosure │  │
│  │   [FEATURED REVIEW IMAGE]      │  │                                    │  │
│  │   full-bleed to the left edge  │  │  Maison Eclat Voile Lumiere        │  │
│  │                                │  │  Skin Tint        ← display.md     │  │
│  │   lazy — below the fold at     │  │  Eight hours in 38 degree heat,    │  │
│  │   every breakpoint             │  │  tested four times                 │  │
│  │                                │  │                                    │  │
│  │                                │  │  34–38 °C   58–71 %   4 tests      │  │
│  │                                │  │      ↑ THE ONLY RECORD DENSITY     │  │
│  │                                │  │        ABOVE SECTION 3             │  │
│  │                                │  │                                    │  │
│  │                                │  │  ┃ Hour 6. Product began to lift   │  │
│  │                                │  │  ┃ around the nose on all four     │  │
│  │                                │  │  ┃ tests.        ← ONE observation │  │
│  │                                │  │                                    │  │
│  │                                │  │  Read the review →                 │  │
│  └────────────────────────────────┘  └────────────────────────────────────┘  │
│                                                                              │
│  ┌─[THE METHOD]── ground.inset — the only inset well on the homepage ──────┐ │
│  │  01 Baseline   02 Application   03 Wear window                          │ │
│  │  04 Conditions 05 Comparison    06 Revisit                              │ │
│  │  one line each · numbers in mono mineral · names in Plex Sans           │ │
│  │  NOT six icons. NOT a circular diagram. NOT an infographic.             │ │
│  │  "This is how I test. It is not clinical testing." → /method/           │ │
│  └──────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  [RECENT REVIEWS]  three across — image, hairline, type. NOT CARDS           │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐                              │
│  │  4:5      │   │  4:5      │   │  4:5      │                              │
│  └───────────┘   └───────────┘   └───────────┘                              │
│  ───────────     ───────────     ───────────     ← hairline does the         │
│  GIFTED          INDEPENDENT     PAID              separating a card's       │
│  Sitara          Cils Infini     Velvet Hour       edge would have done      │
│  Luminous…       Volumising…     Lip Cream                                   │
│                                                                              │
│  [SELECTED WORK]  two projects, alternating image side                       │
│  ┌──────────────────┐  Atelier Noor                                          │
│  │   16:10          │  Layers of Light Campaign                              │
│  └──────────────────┘  Creative direction · 6 deliverables                   │
│                                                                              │
│                        Veloura Beauty            ┌──────────────────┐        │
│                        Velvet Hour Wear Series   │   16:10          │        │
│                        Editorial series · 5 eps  └──────────────────┘        │
│                                                                              │
│  ────────────────────────────────────────────                                │
│  [FROM THE JOURNAL]  two articles, TEXT-LED, no images                       │
│  GUIDES                          ESSAYS                                      │
│  How to evaluate foundation      What makes a beauty review useful           │
│  performance                                                                 │
│  Four different failures,        The difference between an opinion and       │
│  distinguished.                  a record.                                   │
│                                                                              │
│  ┌─[COLLABORATION CLOSE]── ground.raised · centred 640px ──────────────────┐ │
│  │        Partnerships are accepted only where independence is             │ │
│  │        preserved.                          ← display.sm                 │ │
│  │        No pre-approved verdicts. Every paid or gifted placement         │ │
│  │        disclosed prominently.                                           │ │
│  │                    [ Collaborate ]   ← THE ONE BUTTON ON THE PAGE       │ │
│  └──────────────────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────────────────┤
│ [FOOTER]                                                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Mobile 375 — State A

```
┌──────────────────────────────┐
│ Zina Almokri            [☰] │
├──────────────────────────────┤
│                              │
│ Beauty creator.              │  ← display.xl floors at 34px
│ Every product on this        │
│ site was worn, timed,        │
│ photographed and             │
│ documented on my own         │
│ skin.                        │
│                              │
│ Zina Almokri                 │
│ BEAUTY CREATOR AND PRODUCT   │
│ TESTING SPECIALIST           │
│                              │
│ Six stages, the same six     │  ← the Method line
│ every time. How I test →     │
│                              │
│ ┌──────────────────────────┐ │
│ │   [PORTRAIT] 4:5         │ │  ← full-bleed, LCP
│ │   full-bleed to both     │ │
│ │   edges                  │ │
│ └──────────────────────────┘ │
│                        ~78vh │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤ ← ONE SWIPE. The proof starts here.
│ ────────────────────────     │
│ PAID PARTNERSHIP             │
│ ┌──────────────────────────┐ │
│ │  [FEATURED IMAGE] 4:5    │ │
│ └──────────────────────────┘ │
│ Maison Eclat Voile           │
│ Lumiere Skin Tint            │
│ Eight hours in 38 degree     │
│ heat, tested four times      │
│                              │
│ 34–38 °C                     │
│ 58–71 %                      │
│ 4 tests                      │
│                              │
│ ┃ Hour 6. Product began to   │
│ ┃ lift around the nose.      │
│                              │
│ Read the review →            │
├──────────────────────────────┤
│ [THE METHOD]                 │
│ 01 Baseline                  │  ← vertical list with the
│ 02 Application               │    continuous mineral rule,
│ 03 Wear window               │    as on the review page
│ 04 Conditions                │
│ 05 Comparison                │
│ 06 Revisit                   │
├──────────────────────────────┤
│ [RECENT REVIEWS] stacked     │
│ [SELECTED WORK]  stacked     │
│ [JOURNAL]        stacked     │
│ [CLOSE]          full width  │
│ [FOOTER]                     │
└──────────────────────────────┘
```

**Mobile section-2 requirement, restated as a check:** at 375 × 667 the disclosure label of the
featured review must be reachable in **one swipe**. If it is not, section 1 is too tall — reduce the
portrait, never the statement.

---

## 5. STATE B — partial or no photography

**The current state, and the state the site will launch in unless commissioning starts now.** No
portrait exists. No evidence photography exists.

State B is **not State A with grey boxes in it.** A page with three empty tone fields where images
should be reads as unfinished; the same page composed without them reads as austere. The difference
is a composition decision, not a placeholder style.

### The governing rule

> **An image placeholder is only rendered where the caption or plate treatment carries information
> without it. Everywhere else, the image is not rendered and the layout is re-composed at a width
> the remaining content deserves.**

Applied to the seven sections:

| Section | State A | **State B** | Why |
|---|---|---|---|
| 1 Opening | Statement cols 1–7 + portrait cols 8–12 | **Statement spans cols 1–9, no portrait.** display.xl at the top of its range, very generous space. LCP = the statement text | A tone field where a face should be is the single most unfinished-looking element possible. Removing it makes the section a title page, which is a real editorial form |
| 2 Featured review | Image left, content right | **Content full width, cols 1–8.** The conditions and the observation are given more room, not less. A **plate placeholder with its caption intact** may appear if evidence captions exist | The plate's caption carries the evidence. *"Hour six, product lifting around the nose"* still does most of its job with no photograph. A portrait's caption carries nothing |
| 3 Method | Inset well, six stages | **Unchanged** | Typographic already |
| 4 Recent reviews | Three 4:5 images + hairline + type | **Three text-led entries: disclosure marker, brand, title, subtitle, hairline.** No image, no tone field | Three grey rectangles in a row is the most recognisable "unfinished site" signal in existence |
| 5 Selected work | Two projects, alternating images | **One project, full-width, text-led** — deliverables and terms carry it | Layout by count (`docs/EMPTY_PARTIAL_UX.md` §3). Two text-only projects side by side look like a gap; one at full width looks chosen |
| 6 Journal | Two articles, text-led | **Unchanged** | Already text-led in State A — Phase 2 designed it as the eye-reset |
| 7 Close | Raised, centred, one CTA | **Unchanged** | |

### Desktop 1440 — State B

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [HEADER]                                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                                                              │
│   Beauty creator. Every product on this site was                             │
│   worn, timed, photographed and documented on                                │
│   my own skin.                                                               │
│                     ↑ display.xl, cols 1–9, more air above and below         │
│                       LCP = TEXT. Display font preloaded instead of an image │
│                                                                              │
│   Zina Almokri · Beauty Creator and Product Testing Specialist               │
│   Six stages, the same six every time. How I test →                          │
│                                                                       ~62vh  │
├──────────────────────────────────────────────────────────────────────────────┤ ← the proof is
│  ──────────────────────────────────────────────────────────────────          │   HIGHER in
│  PAID PARTNERSHIP                                                            │   State B than
│                                                                              │   in State A
│  Maison Eclat Voile Lumiere Skin Tint                                        │
│  Eight hours in 38 degree heat, tested four times                            │
│                                                                              │
│  TEMPERATURE      HUMIDITY        TIMES TESTED      WEAR WINDOW              │
│  34–38 °C         58–71 %         4                 8 hours                  │
│      ↑ four conditions, not three — the block has the room now               │
│                                                                              │
│  ┃ Hour 6. Product began to lift around the nose and the chin on all four    │
│  ┃ tests, primer or not.                                                     │
│                                                                              │
│  Read the review →                                                           │
│                                                                              │
│  ┌─[THE METHOD]──── unchanged ────────────────────────────────────────────┐  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  [RECENT REVIEWS]  text-led, three across, hairline above each               │
│  ─────────────────    ─────────────────    ─────────────────                 │
│  GIFTED               INDEPENDENT          PAID PARTNERSHIP                   │
│  Atelier Noor         Lune Skin            Veloura Beauty                    │
│  Sitara Luminous      Cils Infini          Velvet Hour Lip Cream             │
│  Concealer            Volumising Mascara                                     │
│  Six wear tests,      Three coats, four    Twelve hours, three               │
│  shade 14             days                 finishes                          │
│                                                                              │
│  [SELECTED WORK]  ONE project, full width, text-led                          │
│  ────────────────────────────────────────────────────                        │
│  ATELIER NOOR · 2026                                                         │
│  Layers of Light Campaign                                                    │
│  Creative direction, six deliverables, usage licensed for twelve months.     │
│  The editorial rule agreed at the outset was that no post would claim an     │
│  outcome.                                            Read the case study →   │
│                                                                              │
│  [FROM THE JOURNAL]  unchanged                                               │
│  [CLOSE]             unchanged                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### What State B proves

**The homepage's argument survives the total absence of photography.** The claim is type, the proof
is a published set of conditions and one observation, the method is a list of six names, and the
corpus is a set of titles and disclosures. None of it needed a picture.

That is the answer to Phase 2's *"depends almost entirely on a portrait that does not exist"*: it
depended on one because nobody had asked what the page would be without it.

**What State B genuinely loses:** warmth, and the sense that a specific person is behind the work.
That loss is real and is not being talked away. It is the argument for commissioning photography,
and it is a **quality** argument rather than a **credibility** argument — which is the right way
round.

### Transitional state (partial photography)

Most likely the real launch state: a portrait exists, evidence photography does not.

Run **State A for sections 1–2** and **State B for sections 4–5**. The states are per-section, not
per-page, and each section chooses independently on whether its images exist. No section ever
renders half its images.

---

## 6. Section specifications

Twelve fields each, as in `docs/REVIEW_WIREFRAMES.md` §4. Only the fields that differ from the
review page's equivalents are expanded.

### 1 · Opening statement

| | |
|---|---|
| **Purpose** | State the thesis. Not greet, not introduce |
| **Content** | `person.bios.homepageIntro` · name · `professionalTitle` · **the Method line** |
| **Hierarchy** | Highest on the page. **The claim is the headline; the name is small** |
| **Width** | State A: statement cols 1–7, portrait 8–12. State B: statement cols 1–9 |
| **Alignment** | Inline-start. Never centred |
| **Reading order** | Statement → name → title → Method line → (portrait, `alt` describing the subject) |
| **Interaction** | The Method line is the section's only link. **No scroll indicator, no arrow, no "explore" chevron** — the visible top of section 2 does that job |
| **Desktop** | ~72vh State A, ~62vh State B |
| **Tablet** | Statement over, portrait under, ~80vh |
| **Mobile** | Statement, then Method line, then portrait 4:5 full-bleed. Cap 78vh |
| **Arabic** | Mirrors — statement inline-start, portrait bleeds to the left edge. ×1.12 |
| **Accessibility** | The statement is the `h1`. The name is **not** an `h1` — the page's subject is the practice, not the person. Portrait has descriptive `alt`; if it is decorative in State B it does not exist at all rather than carrying `alt=""` |
| **Empty/partial** | **State B**: no portrait rendered, statement widens. Never a tone field where a face should be |

**Why the name is not the headline.** A homepage whose largest element is the person's name is a
business card. The claim is what is being argued; the name is attribution.

### 2 · Featured review — the proof block

| | |
|---|---|
| **Purpose** | Demonstrate the differentiator rather than describe it |
| **Content** | Disclosure label · title · subtitle · **3–4 conditions in mono** · **one observation** · link |
| **Hierarchy** | High. **The most important block on the homepage** |
| **Width** | State A: image cols 1–6, content 7–12. State B: content cols 1–8 |
| **Alignment** | Conditions as a mono row; observation with the mineral rule at inline start |
| **Reading order** | Disclosure → title → subtitle → conditions → observation → link |
| **Interaction** | Conditions fade in with a 60ms stagger, once. Nothing else |
| **Desktop** | 128px above and below |
| **Tablet** | Stacked, wider |
| **Mobile** | Image → title → conditions → observation → link |
| **Arabic** | Mirrors fully; numerals isolated `dir="ltr"`, Arabic units outside the isolate |
| **Accessibility** | The whole block is not one link — the title link and the "read the review" link are the same destination and one of them is redundant, so **only the explicit link is focusable**, and the observation and conditions are plain text |
| **Empty/partial** | No `featured: true` review → falls back to the most recent review **with record density intact**. If a review has fewer than three conditions, show what exists — never pad to three |

**Kept to one evidence moment.** A second record-density block on the homepage would make it a
dashboard. Sections 2 and 3 are the ration; sections 1 and 4–7 carry none.

### 3 · The Method

| | |
|---|---|
| **Purpose** | Name the six stages, and state their limit in the same breath |
| **Content** | Six numbered stage names, one line each, plus **the boundary sentence** and a link |
| **Hierarchy** | High |
| **Width** | Inset well spanning the content width |
| **Alignment** | Numbers mono mineral; names Plex Sans; descriptions `body.sm` secondary |
| **Reading order** | Stages in `stageOrder`, then the boundary line, then the link |
| **Interaction** | Stages fade in with a 60ms stagger, once. Each name links to `/method/#{stage}` |
| **Desktop** | Six across |
| **Tablet** | 3 + 3 |
| **Mobile** | Vertical list with the continuous mineral rule |
| **Arabic** | Sequence runs right to left. Numerals isolated |
| **Accessibility** | An **ordered list** — the stages have an order. Numbers are content, not CSS counters, so they are announced |
| **Empty/partial** | The Method is required in both locales; the build fails otherwise. **No empty state exists** |

**The mock-method constraint is most visible here.** No seal, no crest, no badge, no
"certified"/"validated"/"proven". One line of boundary text sits inside the well, not beneath it:

> *"This is how I test. It is structured personal testing, not clinical testing."*

**Not six icons. Not a circular diagram. Not a numbered infographic.** A sequence of names and
numbers, set like an index.

### 4 · Recent reviews

| | |
|---|---|
| **Purpose** | Show the corpus, and that its commercial status is never hidden |
| **Content** | Three reviews: image (State A) · disclosure marker · brand · title · subtitle |
| **Hierarchy** | Medium |
| **Width** | Three across ≥1024 |
| **Alignment** | Image, hairline, type — **the index treatment** |
| **Reading order** | Disclosure marker **first**, before the title |
| **Interaction** | Whole block is one link. Image scales 1.02 inside a clipped frame. **No hover lift, no shadow, no border appearing on hover** |
| **Desktop** | Three across, 32px between |
| **Tablet** | Two-up |
| **Mobile** | Stacked, full-width images |
| **Arabic** | Grid mirrors |
| **Accessibility** | One focusable link per item with a complete accessible name including the disclosure state; ring surrounds the whole block |
| **Empty/partial** | **Layout by count**: 1 → full-width editorial; 2 → side by side; 3 → three-up. **Never a three-up grid with one item in it.** State B → text-led, no tone fields |

**The most likely place for the design to drift into a generic card grid**, and it is prevented by
rule: no container, no border, no radius, no shadow, no hover lift.

### 5 · Selected work

| | |
|---|---|
| **Purpose** | Prove capability exists and route to `/work/`. **Not** to be the portfolio |
| **Content** | Two projects (State A) or one (State B): client · title · deliverables · role |
| **Hierarchy** | Medium |
| **Width** | Alternating full-width halves |
| **Alignment** | Alternating image side |
| **Reading order** | Client → title → deliverables |
| **Interaction** | Whole block is a link |
| **Desktop** | Two, alternating |
| **Tablet** | Stacked, larger |
| **Mobile** | Stacked |
| **Arabic** | Alternation mirrors |
| **Accessibility** | As §4 |
| **Empty/partial** | Locale-filtered — Arabic has 3 work projects, English 4. **No client logo wall**, in any state |

### 6 · From the journal

| | |
|---|---|
| **Purpose** | Reset the eye after five image-heavy sections, and show topical range |
| **Content** | Two articles: category label · title · excerpt |
| **Hierarchy** | Low-medium |
| **Width** | Two side by side |
| **Alignment** | Text-led. Images optional and usually absent |
| **Reading order** | Category → title → excerpt |
| **Interaction** | Whole block is a link |
| **Desktop/Tablet** | Two-up |
| **Mobile** | Stacked |
| **Arabic** | Mirrors. May surface an Arabic-original article with no English sibling — correct, not a gap |
| **Accessibility** | Category is a text label, not a pill |
| **Empty/partial** | Fewer than two in this locale → one, full-width |

### 7 · Collaboration close

| | |
|---|---|
| **Purpose** | Address the reader directly and convert audience B |
| **Content** | Two lines from `person.bios.collaboration` + one button |
| **Hierarchy** | Medium |
| **Width** | Centred ~640px — **the one centred block on the site** |
| **Alignment** | Centred, because it is an address rather than a page of content |
| **Reading order** | Statement → supporting → button |
| **Interaction** | The primary button. **One CTA on the homepage, not one per section** |
| **Desktop** | `ground.raised`, hairline top, 128px above |
| **Tablet/Mobile** | Full width, 24px padding |
| **Arabic** | Mirrors; button width accommodates both labels |
| **Accessibility** | A real `<a>` styled as a button; focus ring switches to `text.primary` against the clay fill |
| **Empty/partial** | Always present |

---

## 7. Information priority

| Zone | 1440 State A | 1440 State B | 375 |
|---|---|---|---|
| **Above the fold** | Statement, name, title, Method line, portrait, **top edge of the featured review** | Statement, name, title, Method line, **disclosure label + conditions of the featured review** | Statement, name, title, Method line |
| **First scroll** | Featured review complete | Featured review complete + Method well | Portrait, then featured review complete |
| **Second scroll** | Method well | Recent reviews | Method well |
| **Deep** | Recent reviews, work, journal | work, journal | reviews, work, journal |
| **End** | Close, footer | Close, footer | Close, footer |

**State B reaches the proof higher up the page than State A does.** That is worth stating plainly:
the photography adds atmosphere and costs vertical space. It is not a straight upgrade.

---

## 8. What the homepage must not become

Inherited from `docs/HOMEPAGE_ART_DIRECTION.md` §6, with the Phase 3 additions marked.

- A poster with nothing to do. Every section exits somewhere specific.
- A media kit. **No follower counts, no logo walls, no awards** — in either state.
- A card grid. Sections 4 and 5 are the risk; the rule is image, hairline, type.
- A slide deck. 72vh, not 100vh, and no scroll-jacking.
- An animation showcase. One fade-up, two staggered reveals, one hover scale.
- A page where the person is larger than the work.
- **NEW — a page whose State B is State A with grey rectangles in it.** Absence is composed, not filled.
- **NEW — a page that reaches the proof after one full swipe on mobile.** The measured requirement is
  *before* 1.0 viewport heights at 375 × 667.
- **NEW — a second record-density block.** The ration is sections 2 and 3. A third would make the
  homepage a dashboard, and dashboard drift is R-17.

---

## 9. Reconsidered exclusions

The brief asks that nothing cut in Phase 2 be reintroduced **unless there is a documented UX reason**.
Each was re-examined in Phase 3 and each exclusion is **confirmed**:

| Excluded | Re-examined because | Verdict |
|---|---|---|
| Follower counts / social statistics | "Proof of the work" is a stated homepage requirement | **Confirmed excluded.** Every statistic in the project is mock, unverified and undated. Proof of the work is the work: conditions, observations, disclosures. A follower count is proof of an audience, which is a different claim |
| Brand / client logo strip | Audience B lands here | **Confirmed excluded.** Two of five brands fail their index gate; a strip would advertise the emptiest part of the site, and unverified relationships in logo form is a credibility risk, not just a taste one |
| Separate About block | "Who Zina is" is a stated requirement | **Confirmed excluded.** It is answered by the name, the title and the statement in section 1, in three lines. A block would duplicate `/about/` and delay the proof |
| Decorative carousel | Recent reviews could hold more than three | **Confirmed excluded.** Layout by count handles more than three; a carousel hides items behind interaction and needs JavaScript to read |
| Testimonials | Trust surface | **Confirmed excluded.** Hard render gate: nothing renders without `approvalOnFile`. None has one. Mock attribution is the literal string `MOCK NAME` |

**One thing was reconsidered and changed:** the Method's position. Phase 2 put its first mention in
section 3. Phase 3 puts a one-line reference in section 1 (§2, Change 2) because *"why her testing is
different"* is a first-two-screens requirement and section 3 is the third screen. This is a change of
**placement**, not a reintroduction of anything cut.

---

## 10. Performance

| Element | State A | State B |
|---|---|---|
| **LCP** | Portrait — eager, `fetchpriority="high"`, preloaded, AVIF/WebP, art-directed, ≤200KB | **The statement text** — display font preloaded, no image above the fold |
| Featured review image | Lazy, below the fold at every breakpoint | Not rendered |
| Sections 4–6 images | Lazy, `content-visibility: auto` | Not rendered |
| Mono tier | Needed in sections 2–3, not above the fold. Numerals-and-punctuation-only subset, ~8KB (Phase 2 Q-6, resolve in Phase 5) | Same |
| Total | ≤1MB mobile, ~8 images | **≈300KB mobile, 0 images** |
| JS | Menu toggle + switcher only, <15KB | Same |

**State B is roughly a third of the page weight.** That is not an argument against photography; it
is an argument for making the launch state genuinely good, because it will be fast and it will be
what most early visitors see.
