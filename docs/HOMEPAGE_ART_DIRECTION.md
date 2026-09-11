# Homepage Art Direction

**Status:** Phase 2 decision. Written **after** the review page, per the brief.

The homepage inherits the visual language established by the review page. It does not invent one.
Its job is different: the review page *is* the product, the homepage *argues for* it.

---

## 1. What the homepage must answer

Within roughly eight seconds of arriving, and in this order:

| Question | Answered by | Where |
|---|---|---|
| **What is this?** | The opening statement | Screen 1 |
| **Who is she?** | Name, portrait, one line of positioning | Screen 1 |
| **Why should I trust her?** | A real review with real conditions visible | Screen 2 |
| **What makes her different?** | The Method, stated as six named stages | Screen 3 |
| **What can I explore?** | Recent reviews, journal, work | Screens 4–6 |

**The critical design decision:** proof arrives on the second screen, not the fifth. Most creator
homepages spend three screens on the person and reach the work near the footer. Here the featured
review is the second thing you see, because the argument of the entire site is *look at the work,
not the follower count*.

---

## 2. Narrative structure

Seven sections. The Phase 1 IA warns that the master spec's nine-section narrative is one or two too
many, and this is the cut.

```
1  Opening statement + portrait          full viewport, editorial density
2  Featured review, with evidence        the proof — RECORD density
3  The Method                            six stages, named
4  Recent reviews                        three, editorial cards
5  Selected work                         two projects, for audience B
6  From the journal                      two articles
7  Collaboration close                   quiet CTA
```

**Cut from the master spec's list, with reasons:**

- **Brands / relationships** — two of five mock brands fail the index gate in at least one locale
  (`docs/BRAND_ARCHITECTURE.md`). A homepage brand strip would advertise the emptiest part of the
  site, and a logo wall is the single most template-like device in creator design.
- **Social ecosystem** — follower counts are mock, unverified and undated. They are not a design
  element (`docs/DESIGN_ANTI_PATTERNS.md`). Social links live in the footer.
- **About** — compressed into section 1 and a link. A separate about block on the homepage
  duplicates `/about/` and delays the proof.

---

## 3. Section direction

### 1 — Opening statement

| | |
|---|---|
| Weight | Highest on the page |
| Height | ~88vh. Not 100vh — a sliver of the next section must be visible, so the page reads as a document rather than as a slide deck |
| Layout | Asymmetric. Statement in cols 1–7, portrait in cols 8–12, bleeding to the right edge (mirrored in RTL) |
| Type | Zarid Serif `display.xl` 76px, `text.primary`, 2–3 lines, inline-start |
| Portrait | 4:5, full-bleed to one edge, **no text over it** |
| Surface | `ground.base` |
| Spacing | Very generous. This is Territory A's spatial confidence |
| Motion | Statement fade-up 16px / 500ms once. **Portrait is the LCP — no animation on it** |
| Mobile | Statement above, portrait below at 4:5 full-bleed. `display.xl` floors at 34px |
| Arabic | Mirrors; ×1.12 |

The statement is the site's thesis in one sentence, from `person.bios.homepageIntro`:

> *Beauty creator. Every product on this site was worn, timed, photographed and documented on my own
> skin.*

Beneath it, small: name in Plex Sans `ui.md`, professional title in `label.sm` muted. **The name is
not the headline** — the claim is. A homepage whose largest element is the person's name is a
business card.

No scroll indicator, no arrow, no "explore" chevron. The visible sliver of section 2 does that job.

### 2 — Featured review, with evidence

| | |
|---|---|
| Weight | High. **The proof block** |
| Layout | Full-bleed image left (cols 1–6), review content right (cols 7–12), mirrored in RTL |
| Type | Title Zarid Serif `display.md`; conditions in Plex Mono `record.md` mineral |
| Surface | `ground.base`, hairline above |
| Spacing | 128px above, 128px below |
| Motion | Conditions fade in with 60ms stagger, once |
| Mobile | Image, then title, then conditions, then link |
| Arabic | Mirrors fully |

**This is the most important block on the homepage.** It carries the site's only homepage instance
of record density: the disclosure label, three testing conditions in mono, and one observation line.

A visitor who reads nothing else learns that this site publishes *what the conditions were* — which
is the whole differentiator, demonstrated rather than described.

Kept to **one** evidence moment. The homepage is a reading surface; a second record-density block
would make it a dashboard.

### 3 — The Method

| | |
|---|---|
| Weight | High |
| Layout | Six stages in a horizontal sequence ≥1024px; three-plus-three at 768px; vertical below |
| Type | Stage numbers Plex Mono `record.sm` mineral; names Plex Sans `ui.md`; one line each in `body.sm` secondary |
| Surface | `ground.inset` — the only inset well on the homepage. It reads as *set into* the page |
| Spacing | 128px above, 96px below |
| Motion | Stages fade in with 60ms stagger on scroll, once |
| Mobile | Vertical list with the continuous mineral rule, as on the review page |
| Arabic | Sequence runs right to left |

Six named stages with a single line each, and a link to `/method/`. **Not six icons.** Not a
circular diagram. Not a numbered infographic. A sequence of names and numbers, set like an index.

**The mock-method caveat applies here most visibly.** No seal, no badge, no crest, no
"certified"/"validated"/"proven" language. It is presented as *her stated approach*, because that is
what it is — and because the Method is currently a project mock concept
(`docs/ART_DIRECTION.md` §8).

### 4 — Recent reviews

| | |
|---|---|
| Weight | Medium |
| Layout | Three across ≥1024px, two at 768px, stacked below |
| Type | Title Zarid Text `body.lg`; brand and category `label.sm` muted; disclosure marker |
| Image | 4:5 |
| Surface | `ground.base`. **Not cards** — image, hairline, text. No container, no border, no radius |
| Spacing | 96px above and below; 32px between items |
| Motion | Image scales 1.0→1.02 over 400ms on hover. Nothing else |
| Mobile | Stacked, full-width images |
| Arabic | Grid mirrors |

The most likely place for the design to drift into a generic card grid. It is prevented by rule: no
container, no border, no radius, no shadow, no hover lift. An image, a hairline, and type — the
editorial index treatment.

Each carries its disclosure marker, because a review's commercial status is part of its identity
even in a listing.

### 5 — Selected work

| | |
|---|---|
| Weight | Medium |
| Layout | Two projects, alternating image side |
| Type | Client Plex Sans `ui.sm`; title Zarid Serif `display.sm`; deliverables `label.sm` muted |
| Image | 16:10 |
| Surface | `ground.base` |
| Spacing | 96px between |
| Motion | None |
| Mobile | Stacked |
| Arabic | Alternation mirrors |

Two, not six. The section for audience B, and its job is to prove capability exists and route to
`/work/`, not to be the portfolio.

**No client logo wall.** Logos are the most template-like device available and, with unverified
relationships, a credibility risk (`docs/BRAND_ARCHITECTURE.md` §5).

### 6 — From the journal

| | |
|---|---|
| Weight | Low-medium |
| Layout | Two articles side by side, text-led |
| Type | Title Zarid Text `body.lg`; category `label.sm`; excerpt `body.sm` secondary |
| Image | Optional, 3:2, or none |
| Surface | `ground.base`, hairline above |
| Spacing | 96px above, 96px below |
| Motion | None |
| Mobile | Stacked |
| Arabic | Mirrors |

Deliberately text-led. After five image-heavy sections, a quieter typographic block resets the eye
before the close.

### 7 — Collaboration close

| | |
|---|---|
| Weight | Medium |
| Layout | Single centred column, ~640px |
| Type | Statement Zarid Serif `display.sm`; supporting `body.md` secondary |
| Surface | `ground.raised`, hairline top |
| Spacing | 128px above, 96px internal |
| Motion | None |
| Mobile | Full width, 24px padding |
| Arabic | Mirrors |

The one centred block on the site, because it is an address to the reader rather than a page of
content. Two lines from `person.bios.collaboration` and a single clay button to `/contact/`.

**One CTA on the homepage.** Not one per section.

---

## 4. Homepage rhythm

```
1 statement    ████░░░░░░░░  asymmetric, huge type, portrait, EDITORIAL
2 featured     ████▓▓▓▓      image + RECORD density — the proof
3 method       ▓▓▓▓▓▓▓▓      inset well, record density
4 reviews      ███ ███ ███   three images, editorial
5 work         ██████░░      two projects, alternating
6 journal      ░░░░  ░░░░    text-led, quiet
7 close        ▒▒▒▒▒▒▒▒      raised, centred, one CTA
```

Editorial → proof → method → browse → browse → quiet → address. The record density appears twice,
in sections 2 and 3, and nowhere else.

---

## 5. Performance

The homepage is the most likely page to be entered from social and the most image-heavy.

| Element | Treatment |
|---|---|
| Portrait (section 1) | **The LCP.** Eager, `fetchpriority="high"`, preloaded, AVIF with WebP fallback, ≤200KB, art-directed crop per breakpoint |
| Featured review image | Lazy, below the fold at every breakpoint |
| Sections 4–6 images | Lazy, `content-visibility: auto` |
| Fonts | Display + body for the active locale only. **Mono is not loaded on the homepage** — the two record-density blocks use it, so it is loaded but deprioritised, or the block accepts a swap |
| Total | ≤1MB mobile, ~8 images |
| JS | Menu toggle and language switcher only. Under 15KB |

**No hero video, no WebGL, no canvas, no 3D.** See `docs/3D_ART_DIRECTION.md` — the recommendation
is none, and the homepage hero is where it would be most tempting and most costly.

> **Open question.** The mono tier is needed by sections 2 and 3 but by nothing above the fold. The
> options are to accept a font swap in those blocks, to subset a numerals-only mono face, or to set
> those values in Plex Sans with tabular figures. **Recommendation: a numerals-and-punctuation-only
> mono subset**, likely under 8KB. To be resolved in Phase 5.

---

## 6. What the homepage must not become

- A poster with nothing to do. Every section exits somewhere specific — this is the anti-journey
  named in `docs/USER_JOURNEYS.md`.
- A media kit. Follower counts, logo walls and awards are absent by design.
- A card grid. Sections 4 and 5 are the risk; the rule is image, hairline, type.
- A slide deck. 88vh, not 100vh, and no scroll-jacking between sections.
- An animation showcase. One fade-up on the statement, two staggered reveals, one hover scale.
- A page where the person is larger than the work. The claim is the headline; the name is small.
- A page that reaches the proof below the fold on mobile. Section 2 must begin within one swipe.
