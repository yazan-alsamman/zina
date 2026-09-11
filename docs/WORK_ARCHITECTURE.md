# Work Architecture

**Status:** Phase 1 decision.

`/work/` is the commercial argument. It is read almost entirely by audience B (brands, PR,
agencies) and C (media), it has near-zero search intent, and it is the last page before
`/contact/`. It carries the project's business case.

---

## 1. The core decision: work is the smaller half of the argument

The instinct is to build `/work/` as the persuasive section and `/reviews/` as the content
section. That is backwards.

A brand evaluating Zina is most persuaded by **the quality of her independent reviews**, because
that is what her audience actually trusts and therefore what a campaign would borrow. A campaign
gallery shows what she was paid to make; a review shows why anyone believes her.

So the architecture treats `/work/` as **evidence of capability, cross-linked to evidence of
credibility**. Every case study links to the independent review of the same brand where one
exists. That is unusual, mildly counter-intuitive, and the strongest thing on the page: it shows
the disclosure policy working rather than describing it.

`docs/USER_JOURNEYS.md` Journey B identifies that cross-link as the decision moment.

---

## 2. Structure

### `/{loc}/work/` — index

| # | Section | Notes |
|---|---|---|
| 1 | Positioning statement | `person.bios.collaboration`. What she does and the terms she does it on |
| 2 | Capability summary | Derived from `category` across projects: launches, editorial series, social campaigns, beauty campaigns |
| 3 | Featured projects | `featured: true`, locale-filtered |
| 4 | All projects | Reverse chronological. No pagination needed below ~30 |
| 5 | What she does not do | Optional but valuable: pre-approved verdicts, undisclosed placements. Filters bad enquiries before they arrive |
| 6 | CTA | To `/contact/` with `inquiryType=collaboration` preselected |

### `/{loc}/work/{slug}/` — case study

| # | Section | Source | Required |
|---|---|---|---|
| 1 | Breadcrumb | route | Yes |
| 2 | Client and campaign | `client`, `campaign`, `year` | Yes |
| 3 | Title and summary | `title`, `summary` | Yes |
| 4 | Hero media | `media.hero` | Yes. LCP element |
| 5 | **Disclosure** | `disclosure` | **Yes.** Same discipline as reviews: stated, not buried |
| 6 | The brief and the approach | `description` | Yes. Where the thinking shows |
| 7 | Role | `role` | Yes |
| 8 | Deliverables | `deliverables[]` | Yes. The section a producer actually reads |
| 9 | Media gallery | `media.gallery[]` | Yes |
| 10 | Results | `results.figures[]` | **Conditional.** See section 3 |
| 11 | Related independent review | `relatedReviewIds` | If one exists. The credibility cross-link |
| 12 | Brand | `brandId` | If the brand gate passes in this locale |
| 13 | CTA | — | To `/contact/` |

---

## 3. The results rule

The rule that matters most, because it is where fabrication would be easiest and most tempting.

```
A figure renders ONLY when:
  results.figures[].source names a written, client-supplied origin
  AND _verification is CONFIRMED
Otherwise the figure is omitted entirely.
Never rounded. Never estimated. Never inferred from a screenshot.
```

Enforced by `tools/validate-content.mjs`: a figure with no `source` fails the build, and a mock
figure marked `CONFIRMED` fails the build.

**An empty `results.figures` array is a valid, complete state**, and the template must look
intentional when it occurs. This is not an edge case: clients frequently supply nothing, and a case
study that looks broken without numbers will create pressure to invent them. The mock set includes
one project (`barrier-season-campaign`) with a deliberately empty figures array for exactly this
reason.

When there are no figures, the case study is not weaker — it simply argues from the work rather
than from a number, which for audience B is often more persuasive anyway.

**What replaces numbers when they are absent:** the brief, the constraint, the decision, and the
deliverables. "The editorial rule agreed at the outset was that no post would claim an outcome"
tells a prospective client more about working with her than a view count does.

---

## 4. Disclosure on work pages

Work is paid by definition, so disclosure here is not about whether money changed hands. It is
about **the terms**.

The valuable disclosure on a case study is the one that describes editorial independence:
whether findings were guaranteed publishable, whether verdicts were pre-agreed, whether the brand
had approval. The Velvet Hour series in the mock set states that two of five episodes contradicted
a brand claim and were published unchanged. That single sentence is the portfolio's strongest
asset, because it defines the terms under which a review-led creator can be commissioned at all.

---

## 5. Relationship to reviews

| | `/reviews/` | `/work/` |
|---|---|---|
| Commissioned | No | Yes |
| Editorial control | Zina's | Zina's, contractually |
| Primary audience | A | B, C |
| Search value | High | Near zero |
| Conversion role | Session depth | The conversion |
| Cross-links | To related work | To the independent review |

The boundary must be visible rather than blurred. A paid campaign is never presented as a review,
and a review of a brand she has worked with says so above the content. The two sections referencing
each other is what makes the boundary legible.

---

## 6. Locale behaviour

Work is the collection most likely to be single-locale, because a regional campaign may only have
existed in one language. `velvet-hour-wear-series` in the mock set is English-only, and that is
what gates the Arabic Veloura brand page — a real consequence propagating correctly through the
system.

A case study that exists in one locale produces no route in the other, no hreflang alternate, and a
language switcher that falls back to `/{loc}/work/`.

---

## 7. Scaling

| Corpus | Work layer |
|---|---|
| 4 projects (today) | Flat index, featured first |
| ~15 | Filter by category. Year grouping becomes useful |
| ~40 | Category routes may be justified (`/work/campaigns/`). Consider retiring older work rather than accumulating it |

Work is the one section where **more is not better**. A portfolio of forty projects reads as a
stock library; twelve well-chosen ones read as a career. Plan to curate rather than archive, and
use `featured` and status `archived` to retire projects gracefully rather than deleting them.
