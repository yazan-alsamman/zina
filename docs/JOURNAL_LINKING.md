# Journal Linking

**The editorial link graph: how articles, reviews and the Method reference each other, and why
every edge is derived rather than written.**

| | |
|---|---|
| **Status** | Implemented (Phase 6) |
| **Dead internal links** | **0**, across all 57 routes |
| **Edges stored as URLs** | **0** — every edge is a canonical record id |
| **Defect found and fixed** | Divergent review↔journal relationships (§4) |

---

## 1. The argument this graph exists to support

> An article that asserts a finding without pointing at the record that demonstrates it competes
> with every other beauty blog on the same query and has nothing they do not.

The link graph is the difference between a publication and a blog. It is not "related posts."

---

## 2. The five edges

| Edge | Source of truth | Direction |
|---|---|---|
| Article → Review | `article.related.reviewIds` | The article's **citation** |
| Review → Article | derived + `review.related.journalIds` | Evidence floor + curation (§4) |
| Article → Article | `article.related.journalIds` | Sibling reading |
| Article → Method stage | `article.related.methodStageKeys` | What the piece explains |
| Article → Brand | derived via cited reviews | Never stored directly |

**No edge is stored as a URL.** Every one is a canonical record id resolved to a route at build
time, so a slug change in the content layer cannot orphan a link — including links written inside
prose (see §5).

Every edge is **locale-filtered**. A relationship whose target does not exist in the current locale
renders as nothing, never as a dead link and never as a cross-locale link.

---

## 3. Article → Review: the citation

Every article cites at least one review **available in its own locale** — asserted for all ten
locale-routes.

| Article (en) | Cites | Explains stage(s) |
|---|---|---|
| `how-to-evaluate-foundation-performance` | 2 | wear-window, conditions |
| `what-makes-a-beauty-review-useful` | 2 | conditions, revisit |
| `how-to-compare-beauty-products` | 2 | comparison |
| `building-a-practical-routine` | 1 | wear-window |
| `understanding-finish-and-texture` | 1 | application |

Citations appear in two places, and the difference matters:

- **In prose**, as `<ReviewReference>` — the finding links to the evidence *in the sentence*.
- **At the foot**, as "Records referenced in this article" — a complete list, derived from the same
  `reviewIds`, so the two can never disagree.

---

## 4. Review → Article: the defect, and the rule that replaced it

### What was found

Two stored relationships existed, and they are **not the same statement**:

```
article.related.reviewIds   the article's CITATION  — "this piece rests on that record"
review.related.journalIds   an editorial CURATION   — "further reading about this product"
```

Comparing them across both locales found **four disagreements**:

| Locale | Record | Stored curation | Derived citations |
|---|---|---|---|
| en | `cils-infini-mascara` | compare-products, review-useful | compare-products |
| ar | `verdure-cloud-balm` | shade-vocabulary, practical-routine | practical-routine |
| ar | `cils-infini-mascara` | compare-products, review-useful | compare-products |
| ar | **`voile-lumiere-skin-tint`** | foundation-performance | **shade-vocabulary**, foundation-performance |

The first three are harmless: curation adding an article that does not cite the review is honest
under the heading "From the Journal."

**The fourth was a real defect.** `mufradat-darajat-albashara` cites the Arabic Voile Lumiere
record, and that record's page surfaced no link back. A reader of the record could not discover the
piece that rested on it — a hole in exactly the evidence graph this phase exists to build.

### The rule

> **Citation is the floor. Curation may add to what a review surfaces; it can never subtract.**

```ts
export const journalForReview = (reviewId, curated, locale) => {
  const citing = articlesCitingReview(reviewId, locale);
  const seen = new Set(citing.map((a) => a.id));
  return [...citing, ...curated.filter((a) => !seen.has(a.id))];
};
```

Citing articles are ordered first — a piece that cites the record is more relevant to a reader of
that record than one that does not.

Two tests enforce it: every citing article appears on the review it cites, in both locales, with no
duplicates, and citations come first.

**This was not a content fix.** The mock data still holds both fields, with their original values.
The rendering rule changed so that a divergence cannot hide evidence.

---

## 5. `<ReviewReference>`: why the in-prose citation is a component

A markdown link would be shorter. It would also be wrong, for four reasons — each of which is a
failure this component makes impossible:

| # | Property | Failure prevented |
|---|---|---|
| 1 | Resolves the route from a **canonical id** | A slug change orphaning a link inside prose, where nothing type-checks |
| 2 | **Locale-safe** | An Arabic article linking into an English route because the translation does not exist |
| 3 | Refuses **unpublished** targets | A citation of a record that is not renderable |
| 4 | Carries the record's **disclosure** | A reader following evidence without knowing who paid for it |

Point 4 is the one that makes it editorial rather than technical. The rendered citation:

```
│ DOCUMENTED IN   Maison Eclat Voile Lumiere Skin Tint   PAID PARTNERSHIP
```

The commercial status travels with the citation, **before the click**. This is the same evidence
language as the review page's disclosure band, applied at the sentence level.

**It fails loudly.** An unknown id throws at build time — a typo in an article body must break the
build, not ship a silent nothing.

**When the target is unavailable in the locale**, it renders the record's name as plain text, not a
link. The reference stays editorially meaningful; no stub route, no cross-locale link, no machine
translation.

The component also carries its own label (`Documented in` / `موثق في`), which is why citing a
record required **no hand-written lead-in prose** in any body file.

---

## 6. Article → Article and Article → Method

**Siblings** are locale-filtered and never self-referential — asserted.

**Method stages** tie the journal to the testing method: every article declares at least one stage
key, and every key resolves to a real stage (`baseline`, `application`, `wear-window`,
`conditions`, `comparison`, `revisit`).

`articlesForStage()` exists and is tested, but **is not yet consumed by the Method page**, which
links only to the journal index. Surfacing per-stage articles on the Method page is deferred work,
recorded as such rather than described as done.

---

## 7. Gated brands are never exposed

A brand below its per-locale gate must not be linked from anywhere. Articles derive brands through
their cited reviews, so an article could otherwise leak one.

Asserted in both locales: no article exposes `terra-sana` (gated in both), and no Arabic article
exposes `veloura-beauty` (gated in Arabic).

---

## 8. Raw links in prose

A body *may* contain a markdown link, and the validator constrains it: it must start with a locale
segment, match the body's own locale, and end with a trailing slash. It also emits a **note**
recommending a component instead, because a raw link embeds a slug that nothing will update.

**No body currently contains one.** Every in-prose link is a component.

---

## 9. Verification

| Property | Result |
|---|---|
| Dead internal links, all 57 routes | **0** |
| Articles citing ≥1 locale-available review | 10 / 10 |
| Cited review missing in citing locale | 0 |
| Self-referential siblings | 0 |
| Forward/reverse citation disagreement | 0 |
| Citing article hidden from its review | **0** (was 1 — §4) |
| Gated brand exposed by an article | 0 |
| Unresolved method stage key | 0 |
| URLs stored in prose | 0 |
