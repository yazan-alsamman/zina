# Journal Architecture

**Status:** Phase 1 decision.

The Journal is the scalable SEO engine. Reviews capture people who already know a product name;
the Journal captures everyone earlier than that. It is also where topical authority above the
product level is built.

---

## 1. The category decision

**Journal categories are editorial formats. They are never product categories.**

| Journal category | Purpose | Answers |
|---|---|---|
| `testing-notes` | How testing works, and what testing can and cannot establish | "How would I even test this?" |
| `guides` | Practical how-to answering a specific reader problem | "How do I fix this?" |
| `comparisons` | Method and results for placing products against each other | "Which of these two?" |
| `essays` | Editorial positions on the industry and on review culture | "What should I think about this?" |

**Rejected: Makeup, Skincare, Foundation, Serum as journal categories.** These already exist as
review facets. Running the same taxonomy twice over the same subject creates two competing URL
sets for the same queries, splits internal-link equity between them, and forces a reader to guess
whether "foundation" means articles or reviews. One taxonomy per axis:

- **Reviews are organised by product category** — what the thing is.
- **Journal is organised by editorial format** — what the piece does.

This is the single most consequential decision in this document, and it is the one most likely to
be reversed by someone optimising a keyword in isolation. It should not be.

### Category gate

A category route is generated when it holds **3 or more published articles in that locale**.
Enforced and reported by `tools/validate-content.mjs`.

Current state — **no category qualifies in either locale**:

| Category | en | ar |
|---|---|---|
| testing-notes | 1 | 1 |
| guides | 2 | 2 |
| comparisons | 1 | 1 |
| essays | 1 | 1 |

That is correct behaviour at six articles, not a gap. The category layer activates when the corpus
justifies it; `guides` will be first. Until then, `/journal/` is a single flat index and categories
are labels on cards, not destinations.

---

## 2. Pillar and supporting structure

```
/method/   ← THE pillar. Not in the journal. Every review links to it.
     ▲
     │ supported by
     │
testing-notes ──> how-to-evaluate-foundation-performance   [Pillar]
                        ▲
                        │ supported by
                  understanding-finish-and-texture          [Supporting]
                  how-to-compare-beauty-products            [Supporting]

essays        ──> what-makes-a-beauty-review-useful         [Pillar]
                        ▲
                  building-a-practical-routine              [Supporting]
                  mufradat-darajat-albashara (ar-original)  [Supporting]
```

Two journal pillars, plus the Method pillar which sits outside the journal because it is the site's
core asset and deserves a top-level route.

`type: "Pillar" | "Supporting"` is a field on every article, so the cluster structure is data
rather than a diagram someone maintains by hand. Supporting articles link up to a pillar; pillars
link down to their supporters and out to the reviews that evidence them.

---

## 3. Article relationships

Every article carries four relationship arrays:

| Field | Purpose | Rule |
|---|---|---|
| `related.reviewIds` | The reviews that evidence the claims | **The most valuable link on the page.** A guide that says "most bases end the day one step shinier" must point at the review where that was photographed |
| `related.journalIds` | Sibling and pillar articles | 2 per article |
| `related.brandIds` | Brands discussed | Rendered only if the brand gate passes in this locale |
| `related.methodStageKeys` | Which method stages the article explains | Generates a link to the relevant `/method/` anchor |

The `methodStageKeys` link is what keeps the Journal tied to the Method rather than drifting into
generic beauty content. An article about testing conditions links to the `conditions` stage; the
stage is where the authority lives.

---

## 4. Page structure

### `/{loc}/journal/` — index

Featured articles, then reverse chronological. Category shown as a label. Pillars visually
distinguished from supporting pieces. Locale-filtered: `/ar/journal/` lists the five articles with
Arabic content, including the Arabic-original one that has no English version.

### `/{loc}/journal/{slug}/` — article

| # | Section | Source |
|---|---|---|
| 1 | Breadcrumb | `Home / Journal / {title}` (category inserted only once category routes exist) |
| 2 | Category + type label | `category`, `type` |
| 3 | Title, subtitle | `title`, `subtitle` |
| 4 | Byline and dates | `authorId` → `bios.editorialByline`, `dates` |
| 5 | Reading time | `readingTimeMinutes` |
| 6 | Hero image | `heroImage` — LCP element |
| 7 | Opening paragraph | `openingParagraph` |
| 8 | Table of contents | derived from `sections[]` — only when 4+ sections |
| 9 | Body sections | `sections[]` (MDX in production; outlines in mock) |
| 10 | Method link | `related.methodStageKeys` |
| 11 | Referenced reviews | `related.reviewIds` — inline where cited, plus a block |
| 12 | Related articles | `related.journalIds` |
| 13 | CTA | To `/reviews/` or `/method/`, contextual |

**Medical boundary:** any article touching routines or skin must carry an explicit boundary
section. `building-a-practical-routine` ends with "When to stop and see a professional" for exactly
this reason. This is an editorial standard and a YMYL risk control, and the validator's
medical-language scan is the backstop, not the primary control.

---

## 5. Body format

Mock articles carry `sections[]` as heading + summary outlines, which is enough to build and test
the template, the table of contents, reading-time and the link graph.

**In production, journal bodies should be MDX**, not JSON outlines. Editorial prose needs inline
images, pull quotes, and the ability to embed a review card mid-paragraph. Reviews stay structured
JSON because their value is that they are the same shape every time; articles are the opposite.

This is the one place where the two content types diverge in storage format, and the divergence is
principled: a review is a report, an article is prose.

---

## 6. Locale behaviour

The Journal is where the "Arabic is not a translation" principle is most visible.

`mufradat-darajat-albashara` — Arabic shade vocabulary — exists **only in Arabic**, and could not
sensibly exist in English, because the subject is precisely that Arabic shade terminology does not
map onto English shade terminology. An English version would be a different article, not a
translation.

This is the model for Arabic content generally: the highest-value Arabic articles will be the ones
that answer questions an English-language site would never think to ask. Translating the English
journal into Arabic would produce a weaker Arabic section than authoring for it directly.

`translationStatus` distinguishes `original` from `adapted`. `adapted` means independently written
from the same brief, not machine-translated and not a literal rendering.

---

## 7. Content gaps

From `docs/SEO_KEYWORD_MAP.md` section 4, now assignable to categories:

| Gap | Category | Priority |
|---|---|---|
| Head-to-head comparison content (`[A] vs [B]`) | `comparisons` | High — the category currently has one method piece and no actual comparison |
| A glossary of finish and texture terms | `guides` | Medium — a natural internal-link hub |
| More Arabic-original articles | `guides`, `testing-notes` | High if Arabic is a primary audience |
| FAQ blocks on reviews | not journal | Medium |

`comparisons` holding a method article about comparison but no actual comparison is the clearest
content gap in the corpus.

---

## 8. Scaling

| Corpus | Journal layer |
|---|---|
| 6 articles (today) | Flat index. No category routes |
| ~20 | Two or three categories activate. Index pagination begins |
| ~60 | Category pages become primary entry points. Pillars need explicit hub layouts |
| ~150 | Sub-categories or tags may be justified, but only with the same discipline: one taxonomy per axis, and no tag that duplicates a review facet |
