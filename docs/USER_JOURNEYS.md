# User Journeys

**Status:** Phase 1 decision. Four primary journeys, each with its entry point, intent,
trust-building moment, next action and conversion opportunity.

The trust-building moment is the field that matters most. It is the point at which a visitor
decides whether this is a person worth believing, and in every journey below it is the same asset:
**the Method, or a page that visibly applies it.**

---

## Journey A — Beauty reader from search

**The highest-volume journey and the one the site is built for.**

```
Google: "sitara concealer review"
   └─> /en/reviews/atelier-noor-sitara-luminous-concealer/
         ├─ disclosure band, above the hero
         ├─ testing summary: 6 tests, 8 hours, shade 14
         ├─ conditions: 29–37°C, 55–70% humidity
         ├─ observations at hours 0, 4, 8
         └─> /en/method/                    ← TRUST MOMENT
               └─> /en/reviews/…voile-lumiere…/   (related review)
                     └─> follow / return
```

| | |
|---|---|
| **Entry** | A review page, from a product-name query |
| **Intent** | "Should I buy this, and can I trust the person telling me?" |
| **Trust moment** | The conditions block, then `/method/`. Published temperature and humidity are the thing no competitor has |
| **Next action** | A second review, or the Method page |
| **Conversion** | Session depth and a follow. Contact is incidental here |

**Architectural requirements:** review page is the fastest page on the site; disclosure and
conditions above the fold; every review links to `/method/`; exactly two related reviews and two
related articles; social links present but not intrusive.

**Failure mode to design against:** a review that reads as an opinion post. If a reader cannot see
what was measured within one screen, the journey ends at the first page.

---

## Journey B — Brand, PR or agency evaluating a collaboration

**The lowest-volume, highest-value journey. It carries the business case.**

```
Direct link or "zina almokri" search
   └─> /en/
         └─> /en/work/
               └─> /en/work/veloura-velvet-hour-wear-series/
                     ├─ deliverables, role, licence terms
                     ├─ "two of five episodes contradicted a brand claim,
                     │   both published unchanged"
                     └─> /en/reviews/veloura-velvet-hour-lip-cream/   ← TRUST MOMENT
                           (the independent review of the same brand)
                             └─> /en/about/ ─> /en/editorial-standards/
                                   └─> /en/contact/   ← CONVERSION
```

| | |
|---|---|
| **Entry** | Homepage or `/work/`, from a link or a name search |
| **Intent** | "Can she deliver, and is she safe to work with?" |
| **Trust moment** | The cross-link from a paid case study to the independent review of the same brand. This is the decision point |
| **Next action** | `/about/` and `/editorial-standards/` for risk assessment |
| **Conversion** | A contact form submission, routed by inquiry type |

**Why the cross-link is the decision point:** a brand is not persuaded by a campaign gallery, which
every creator has. It is persuaded by evidence that her audience trusts her, and by clear terms.
Showing the paid work and the independent review side by side demonstrates the disclosure policy
working rather than describing it. It also pre-answers the question a brand's legal team will ask.

**Architectural requirements:** `/work/` must not read as a social gallery; empty results states
must look intentional (`docs/WORK_ARCHITECTURE.md` §3); every case study links to the related
independent review where one exists; `/contact/` routes by inquiry type;
`/editorial-standards/` is a real indexable page, not a modal.

**Failure mode:** a portfolio that shows outputs without terms. A brand that cannot tell what it
would be buying, or on what conditions, does not enquire.

---

## Journey C — Returning follower from social

```
Instagram / TikTok bio link
   └─> /ar/                     (or /en/, by preference)
         ├─ latest review, prominent
         └─> /ar/reviews/terra-sana-verdure-cloud-balm/
               └─> /ar/method/         ← TRUST MOMENT (first-time deepening)
                     └─> /ar/journal/  ─> more content
```

| | |
|---|---|
| **Entry** | Homepage, from a social profile link |
| **Intent** | "What is new, and what else is here that is not on my feed?" |
| **Trust moment** | `/method/` — this audience already likes her; the Method is what converts liking into trusting |
| **Next action** | Latest review, then journal |
| **Conversion** | Habit. Returning directly rather than via a platform |

**The strategic point of this journey:** it is the only one that reduces platform dependency, which
`docs/PROJECT_MASTER_SPEC.md` names as a primary objective. The site must offer something the feed
does not — depth, structure, searchable history — or a follower never returns.

**Architectural requirements:** the homepage must surface the newest review immediately; the
locale most of this audience uses is likely Arabic, which is the strongest argument for treating
Arabic as first-class rather than as a translation; every homepage section must exit somewhere
specific.

**Failure mode:** a homepage that is a beautiful poster with nothing to do. This is the journey
most damaged by an over-designed hero.

---

## Journey D — Organic informational visitor

**The most defensible SEO journey, and the one that scales.**

```
Google: "ليش يطلع الميكب من وجهي" / "why does my foundation break down"
   └─> /ar/journal/how-to-evaluate-foundation-performance/
         ├─ four different failures, distinguished
         └─> /ar/reviews/…voile-lumiere…/          ← the review that evidences it
               ├─ product and brand context inline
               └─> /ar/method/                      ← TRUST MOMENT
                     └─> /ar/about/
```

| | |
|---|---|
| **Entry** | A journal article, from a problem-shaped query |
| **Intent** | "Why is this happening, and how do I fix it?" |
| **Trust moment** | The article citing a specific review with photographs, rather than asserting |
| **Next action** | The review that evidences the claim |
| **Conversion** | Becomes Journey A. A follow, or a return |

**Architectural requirements:** journal articles link *down* to the reviews that evidence them,
contextually and not only in a related block; problem-shaped headings; `related.methodStageKeys`
links the article to the relevant method stage.

**Why this journey matters most for growth:** product queries are winnable but finite — one review,
one product, one query family. Problem queries are the seam where a small site can beat a large
publication, because the answer requires having actually tested something.

---

## Cross-journey observations

### Every journey passes through `/method/`

Not by coincidence. It is the trust moment in all four, which is why it was promoted to a top-level
route and to primary navigation, and why every review links to it. If one page must be excellent,
it is this one.

### The two audiences share one asset

Audience A is convinced by reviews. Audience B is convinced by *the same reviews*, because what a
brand is buying is the audience's trust. This is why the library is the portfolio, and why `/work/`
is architecturally the smaller half of the commercial argument.

### Locale shapes the journey, not just the language

Journey C and Journey D are likely to be predominantly Arabic; Journey B is likely to be
predominantly English, since brand and agency correspondence in the region is often conducted in
English. That asymmetry argues for Arabic depth in reviews and journal, and English completeness in
work and contact — which is close to the current mock coverage, and worth confirming against real
audience data (U-04).

---

## Anti-journeys

Three paths the architecture deliberately prevents:

| Anti-journey | Prevented by |
|---|---|
| Land on homepage, find nothing to do | Every homepage section exits somewhere specific; latest review surfaced immediately |
| Reach a review, cannot tell if it is sponsored | Disclosure above content, not configurable downward |
| Follow a brand link to a page that does not exist | Brand links are a function of the per-locale index gate, evaluated at build time |
| Switch language and land on a 404 | Switcher falls back to the section index with an explanation |

---

## Instrumentation

Per `docs/ANALYTICS_AND_MEASUREMENT.md`, measure the journey, not the pageview:

| Journey | Leading indicator |
|---|---|
| A | Reviews per session; `/method/` entrances from a review |
| B | `/work/` → related review click rate; `/work/` → `/contact/` rate; form submissions by inquiry type |
| C | Direct and social entrances; returning-visitor rate |
| D | Journal → review click rate; organic entrances to journal |

The single most diagnostic number is **the review → Method click rate**. If it is low, either the
positioning is not landing or the link is not visible enough, and both are fixable.
