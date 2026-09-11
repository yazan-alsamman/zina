# Work Implementation

**Documented professional engagements — and the Results Figure gate, which is the reason this
surface is difficult.**

| | |
|---|---|
| **Status** | Implemented (Phase 7) |
| **Routes** | 9 — 2 indexes + 7 detail pages |
| **Figures in the corpus** | 5 |
| **Figures published** | **0** — all blocked |
| **Structured data** | `BreadcrumbList` + `Person` reference |

---

## 1. What this surface is

A record of a professional engagement, written the way a testing record is written: what the work
was, what the role was, what was delivered, and **on what terms**.

**Not an agency case study.** The case-study form has a fixed rhetorical shape — challenge,
insight, solution, spectacular result — and every part of it is an argument for hiring the author.
This page has no result section unless a result has been verified, which is the entire point.

Not a portfolio grid, a client logo wall, a showreel or a media kit either. Each of those is a
device for making quantity look like authority, and this corpus is four projects.

---

## 2. The Results Figure gate

`content/schema/types.ts` defines it exactly:

> "A figure renders only when `source` names a written client-supplied origin AND `_verification`
> is CONFIRMED. An empty figures array is a valid, complete state."

### Why a figure is the most dangerous content on this site

"1.2M views" is a claim about a **third party's commercial outcome**, attributed to Zina's work,
published under her name. If it is wrong it damages a client, misrepresents her results, and cannot
be walked back. Numbers also *look* authoritative in a way prose does not — a reader scanning a page
absorbs "61%" as a fact without reading the sentence around it.

### The gate is two-part, deliberately

```ts
export const figureIsPublishable = (figure) =>
  figure._verification === "CONFIRMED" && hasWrittenSource(figure);
```

Condition 2 exists because condition 1 is **a flag anyone can set**. A figure claiming to be
confirmed that cannot say where it came from is asserted, not verified. `SOURCE_SENTINELS`
(`""`, `MOCK`, `CONFIRMED`, `NEEDS_VERIFICATION`, `TBD`, `UNKNOWN`) are the values that mean "the
provenance field was never filled in" — including the case where someone wrote the *status* where
the *source* belongs.

### The record-level guard

```ts
publishableFigures = (work) =>
  work.results.status === "CONFIRMED" ? work.results.figures.filter(figureIsPublishable) : [];
```

**The set is the unit someone signs off.** A confirmed row inside an unsigned set is not signed.

### The three states

| State | Meaning | Renders |
|---|---|---|
| `allowed` | at least one figure passes | the results section |
| `blocked` | figures exist, none may be published | **nothing** |
| `absent` | no figures on the record | **nothing** |

`blocked` and `absent` render **identically — nothing at all**. No placeholder, no empty chart, no
"results pending", no greyed-out number. An outline where a number would go still tells the reader
a number exists, and invites them to imagine it. The template has deliberately no `else` branch.

---

## 3. What the gate does in this build

| Record | Figures | State |
|---|---|---|
| `voile-lumiere-launch` | 2 | **blocked** |
| `velvet-hour-wear-series` | 1 | **blocked** |
| `layers-of-light-campaign` | 2 | **blocked** |
| `barrier-season-campaign` | 0 | **absent** |

**All 5 figures are blocked.** Every one carries `_verification: "MOCK"` and `source: "MOCK"`.

Verified in the built output: none of `1.2M`, `38K`, `61%`, `54%`, `112K` appears on any of the 85
pages, nor does any figure label, nor the results section itself.

---

## 4. Testing the `allowed` branch without inventing content

The production corpus can only ever show the gate **refusing**. A gate never observed to open is
half-verified — the same argument that made the Phase 6 TOC threshold a named predicate.

So `tests/work.test.mjs` builds **synthetic fixtures**:

```js
const FIXTURE_VALUE = "__SYNTHETIC_FIXTURE_VALUE_42__";
const confirmedFigure = {
  label: "Fixture figure",
  value: FIXTURE_VALUE,
  source: "Client-supplied campaign report, 12 March 2026",
  _verification: "CONFIRMED",
};
```

They are passed **directly to the pure gate functions**, never written to the content layer and
never rendered. The sentinel value is deliberately distinctive so a dedicated test can prove it
never escaped: *"no fixture value appears anywhere in the build."*

That is the correct division of responsibility:

> A **test** may construct a confirmed figure to prove the gate opens.
> **Production content** may not invent one to make the page look richer.

The fixtures cover: allowed, mixed sets, every blocking source sentinel, every non-CONFIRMED
verification, a confirmed figure inside an unconfirmed set, and the absent case.

---

## 5. Provenance travels with the number

When the gate does open, the template renders the figure's `source` **beside the value**, always.
A figure without a visible source is exactly what the gate refuses, so the rendered form cannot
separate them.

The **work index never renders a figure**, even where the gate would allow one: an index row has no
room for provenance, and a number without its source is not honest.

---

## 6. Routing and locale

Four records → **7 detail routes**. `velvet-hour-wear-series` is English-only, so no Arabic route is
generated and no Arabic alternate is emitted.

Work records carry `year` + `month`, **not a publication date**. The page therefore states a period
("June 2026") rather than synthesising a day that was never recorded.

---

## 7. Relationships

| Edge | Source | Filter |
|---|---|---|
| Work → Reviews | `relatedReviewIds` | renderable + locale |
| Work → Brand | `brandId` | **+ the brand gate** — links only where a brand page exists |
| Work → Journal | derived through `brandId` | renderable + locale |

Work → Journal is **derived, not stored**. There is no direct field in the schema, and inventing one
would create a second relationship store. `workJournal()` finds articles discussing the same brand.

The client name always renders; it becomes a **link only when the brand gate opened a page**. A
gated brand is named, never linked.

---

## 8. Engagement terms, above the description

Same placement logic as the review's disclosure band: a reader should know the commercial basis of
what they are reading **before** they read it. A test asserts the terms block precedes the
description in DOM order.

The terms are Client, Role and Disclosure — each straight from the record's locale block.

---

## 9. SEO

`BreadcrumbList` + a `Person` `@id` reference. Nothing else.

| Refused | Reason |
|---|---|
| `CreativeWork` | Asserts a published creative artefact with a verifiable identity |
| `Organization` for the client | The client is a fictional mock company; marking it up asserts that a company engaged her |
| `ProfessionalService`, `Offer` | Not a service listing |
| `interactionStatistic`, `aggregateRating` | Marking up a figure the page itself refuses to display would be the gate's failure moved somewhere readers do not look |

---

## 10. Content safety

Asserted absent from every work page: impressions, reach, engagement rate, conversion, ROI,
revenue, sales lift, followers gained, "went viral", audience growth, CTR, testimonials, awards,
"as seen in", "featured in", and any `<blockquote>` used as endorsement.

---

## 11. Known limits

- **The `allowed` branch has no production fixture.** It is proven by synthetic test fixtures only.
  No real figure exists, and none was invented.
- **No work media renders.** `media.hero` and `media.gallery` point at placeholder paths with no
  asset on disk.
- Arabic work copy is **unreviewed by a native reader** (H-1).
- `velvet-hour-wear-series` exists only in English.
