# Journal Implementation

**The editorial publishing system: routes, taxonomy, gates, templates and long-form reading.**

| | |
|---|---|
| **Status** | Implemented (Phase 6) |
| **Routes added** | **20** (37 → 57) |
| **Articles** | 6 records → 10 locale routes |
| **Client JavaScript** | 0 bytes |
| **Prose bodies** | MDX — see `docs/MDX_ARCHITECTURE.md` |

---

## 1. What was built

| Surface | Route | Count |
|---|---|---|
| Journal index | `/{locale}/journal/` | 2 |
| Article | `/{locale}/journal/{slug}/` | 10 |
| Format archive | `/{locale}/journal/{format}/` | 8 |

**20 routes.** No route exists for a translation that does not exist.

---

## 2. The taxonomy is an editorial-format taxonomy

This is the single most consequential journal decision (Phase 1, D-3), and the one most likely to
be reversed by someone optimising a keyword in isolation.

> **Reviews are organised by PRODUCT CATEGORY** — what the thing is
> **Journal is organised by EDITORIAL FORMAT** — what the piece does

| Journal formats | Review product categories |
|---|---|
| `testing-notes`, `guides`, `comparisons`, `essays` | `foundation`, `concealer`, `lip`, … |

**The two sets share no value, and a test asserts it.** Running one taxonomy twice over one
subject would create two competing URL sets for the same queries, split internal-link equity
between them, and force a reader to guess whether "foundation" means articles or reviews.

Category values are **read from the content**, never hardcoded in a template:

```ts
export function journalCategories(locale: Locale): JournalCategoryFacet[]
```

A new format appears the moment an article declares it. Labels come from
`src/lib/journal-labels.ts`, which maps a content-derived key to a UI string in each locale and
falls back to the key rather than inventing one. A test asserts every live key has a real label in
both locales.

### Segments are reserved

`site.json → reservedSlugs.journal` holds every format segment, so an article slug can never
collide with an archive route. `reservedJournalSegments()` exposes it — mirroring
`reservedReviewSegments()` — and the test suite asserts both that every live format is reserved and
that no article slug is.

---

## 3. Gates: existence is not indexability

Two independent gates. Neither hides content from a reader.

### 3.1 The category gate — `JOURNAL_CATEGORY_GATE = 3`

Phase 1's threshold, unchanged. A format archive is **generated and reachable** regardless, but is
**indexable** only at 3+ articles in that locale.

| Format | en | ar | Indexable |
|---|---|---|---|
| `guides` | 2 | 2 | No |
| `testing-notes` | 1 | 1 | No |
| `comparisons` | 1 | 1 | No |
| `essays` | 1 | 1 | No |

**No format currently qualifies, in either locale.** Every archive is `noindex` and canonicalises
to `/{locale}/journal/`. Promotion is a robots flip, not a URL migration — which is the same
resolution Phase 5 applied to review facets, and it is deliberately the *same* rule rather than a
parallel one: `tests/output.test.mjs` now expresses "a gated facet canonicalises to its section
index" once, for all sections.

### 3.2 The table-of-contents gate — `TOC_SECTION_GATE = 4`

> A table of contents is not automatic.

Below four sections a TOC is furniture: it repeats the article's own headings above the article,
pushes the opening line down the page, and hands the reader a decision where they should simply be
reading.

**This gate lives in `src/lib/journal.ts` as a named predicate, not as a `>= 4` in the template** —
for one specific reason. Every article in the current corpus has 4–6 sections, so a corpus-driven
test can only ever observe the gate *saying yes*. A rule never seen to refuse is not a verified
rule. `earnsTableOfContents()` is therefore tested directly at 0, 1, 3, 4 and 9 sections.

---

## 4. Locale behaviour

The authoring contract is unchanged and absolute:

> **No translation ⇒ no route, no hreflang, no stub, no machine translation.**

Six records, ten routes — not twelve:

| Record | en | ar |
|---|---|---|
| `how-to-evaluate-foundation-performance` | ✓ | ✓ |
| `what-makes-a-beauty-review-useful` | ✓ | ✓ |
| `building-a-practical-routine` | ✓ | ✓ |
| `how-to-compare-beauty-products` | ✓ | ✓ |
| `understanding-finish-and-texture` | ✓ | — |
| `arabic-shade-vocabulary` | — | ✓ |

`arabic-shade-vocabulary` is an **Arabic original**, not a missing translation. Its subject is the
gap between Arabic and English shade vocabulary; an English version would be a different article,
not a translation — which is the point. Its slug is transliterated Arabic
(`mufradat-darajat-albashara`), while the bilingual records share one slug across both locales.

**Both are legal.** The slug is a property of the locale block, so the route layer never derives an
Arabic path from an English slug — asserted per-article in `tests/journal.test.mjs`.

### The language switcher, all three states

| State | When | Behaviour |
|---|---|---|
| `counterpart` | The article exists in the other locale | Links to that article |
| `section-fallback` | It does not, but the journal index does | Links to `/{locale}/journal/` + explains why |
| `home-fallback` | Neither | Links to `/{locale}/` |

The switcher never drops the reader somewhere unexplained, and never links across a translation
that does not exist.

---

## 5. Templates

### 5.1 Journal index — `/{locale}/journal/`

Ordered by editorial weight (`featured`, then type, then date). Carries the format browse strip
with per-format counts, and an honest availability line: *"5 articles · available in this
language"* — the count is of what exists **in this locale**, never of the whole corpus.

Entries use the **index treatment**: image, hairline, type. No Card.

### 5.2 Article — `/{locale}/journal/{slug}/`

DOM order:

```
breadcrumb → format + type labels → h1 → deck → byline (author · date · reading time)
→ opening paragraph → [gated TOC] → prose body → referenced records → related reading
```

Notes:

- **Reading time is reported only when the record carries one.** Nothing is estimated from word
  count — an invented number is a fabricated fact.
- The opening paragraph is outside `.prose` and set at a larger size; it is the entry into the
  piece, not a body paragraph.
- "Records referenced in this article" and "Related reading" are `<section>` landmarks with
  accessible names in the page's own locale.

### 5.3 Format archive — `/{locale}/journal/{format}/`

A filtered view of the index. `noindex`, canonical to the journal index, no TOC. It states its own
count and links back to the full index.

---

## 6. Long-form typography — measured

Measured in-browser at **5 widths × 2 locales × 3 route types** (30 probes), inside same-origin
iframes sized exactly (window resizing is unreliable under Windows display scaling — the Phase 3
technique).

| Width | en measure | ar measure |
|---|---|---|
| 320 | 26 ch | 28 ch |
| 375 | 31 ch | 33 ch |
| 768 | 63 ch | 66 ch |
| 1024 | 66 ch | 66 ch |
| 1440 | **66 ch** | **66 ch** |

The measure caps at exactly `--type-measure-editorial: 66ch` and is applied as `max-width`, never
a fixed width — so below 768 the column is viewport-bound, not artificially narrowed.

### Script adaptation, measured against the tokens

| Factor | Token | Measured |
|---|---|---|
| Arabic size | 1.12 | **1.1200** |
| Arabic leading | 1.18 | **1.1798** |

English body leading 1.68; Arabic 1.982. The adaptation is applied **at the locale root only** —
there is no `[dir="rtl"]` override block anywhere in the codebase, and a test asserts it.

### Emphasis is weight, never italic

Arabic has no italic form; a synthesised oblique is a rendering defect, not emphasis. `<em>`
renders as weight and colour in **both** scripts, so the mechanism is one mechanism. Asserted:
`font-style: italic` appears **zero times** in the shipped CSS.

### Overflow

**Zero.** Across all 30 probes: no horizontal document scroll, and no element wider than its
viewport. h1 never overflows and wraps to a single line at every width. Breadcrumbs never wrap or
overflow.

---

## 7. Accessibility

Structural audit over four representative routes (index, article ×2 locales, archive):

| Property | Result |
|---|---|
| `h1` per page | exactly 1 |
| Heading outline | no skipped level (`1,2,2,…,3,3,2`) |
| Landmarks | header, nav ×3–4, main, section ×2, footer |
| Nav accessible names | all present, all unique, **in the page's own locale** |
| Links without a discernible name | 0 |
| Images without `alt` | 0 |
| Positive `tabindex` | 0 — tab order follows DOM order |
| Skip link | present, first, → `#main` |
| Bare `<bdi>` | 0 — every isolate declares `dir` or `lang` |

Arabic landmark names are Arabic (`التنقل الرئيسي`, `مسار التنقل`, `المحتويات`), not translated
English labels attached to an English structure.

> **Screen-reader verification: UNVERIFIED — HUMAN REVIEW REQUIRED.**
> The above is an accessibility-*tree* audit. No NVDA, JAWS or VoiceOver pass was performed, and a
> structural audit is not a substitute for one. See the Phase 6 report, §15.

---

## 8. Linking

Covered fully in `docs/JOURNAL_LINKING.md`. In summary: every article cites at least one review
available **in its own locale**, the reverse direction is derived from the same relationship rather
than stored twice, and no article can expose a gated brand.

---

## 9. Files

| File | Role |
|---|---|
| `src/lib/journal.ts` | taxonomy, both gates, relationships, reserved segments — **pure, Node-testable** |
| `src/lib/journal-bodies.ts` | MDX glob, body index, headings — the only bundler-coupled module |
| `src/lib/journal-labels.ts` | content key → UI label, per locale |
| `src/pages/[locale]/journal/index.astro` | index |
| `src/pages/[locale]/journal/[slug].astro` | article |
| `src/pages/[locale]/journal/[category].astro` | format archive |
| `src/components/editorial/Prose.astro` | the only tag-scoped typography in the codebase |
| `src/components/editorial/EditorialNote.astro` | boundary / note aside |
| `src/components/editorial/ReviewReference.astro` | in-prose citation |
| `src/components/editorial/JournalEntry.astro` | index treatment |
| `tools/check-journal-bodies.mjs` | the MDX safety layer |
| `tests/journal.test.mjs` | 28 tests — routing, taxonomy, gates, links |
| `tests/longform.test.mjs` | 28 tests — MDX output, TOC gate, typography |

---

## 10. Known limits

- **No format reaches the indexation gate.** Every archive is `noindex` today.
- **No body contains a table, figure or image**, so those long-form behaviours are implemented but
  unexercised by content.
- **Arabic copy is measured correct, not reviewed by a native reader.**
- **Screen-reader behaviour is unverified** (§7).
