# Phase 6 — Completion Report

**Editorial publishing system: Journal, MDX, long-form reading and editorial linking**

| | |
|---|---|
| **Status** | Complete |
| **Phase** | 6 — editorial publishing system |
| **Date** | 2026-09-11 |
| **Overall confidence** | **High** on MDX architecture, routing, gates, the link graph, content safety and the test suite. **Medium** on Arabic copy quality (measured correct, unreviewed by a native reader) and performance (payloads measured, field data not). **Blocked** on the production domain (U-01). **Unverified** on screen-reader behaviour (§15) |
| **Routes** | **37 → 57** |
| **Client JavaScript** | **0 bytes**, unchanged, now across all 57 routes |
| **Tests** | **186 → 244**, all passing |
| **Next phase begun** | **No.** Stopped at the Phase 7 gate |

---

## 1. Executive summary

Phase 6 added the third surface of one editorial system. The claim under test was that the Journal
is a publishing system rather than a blog, and the difference is structural: **every article points
at the records that evidence it, and every record points back.**

**MDX was introduced as a rendering mechanism and nothing else.** Bodies carry no frontmatter, bind
to canonical records by filename, and are validated in both directions by a dedicated tool. There
is no second entity schema and no Astro Content Collection. The JSON record owns every fact; the
MDX file owns only the words.

**Two real defects were found by tooling rather than by reading**, and both were structural rather
than cosmetic:

1. **`import.meta.glob` had silently made the entire journal layer untestable.** It is a Vite
   compile-time transform, not a function, so `src/lib/journal.ts` could not be imported by
   `node --test` — taking routing, taxonomy, gates and the link graph down with it, for a reason
   unrelated to any of them. The loader now lives alone in `journal-bodies.ts`, and the rule is
   recorded: a build-tool API may not share a module with testable domain logic.

2. **The review↔journal relationship disagreed with itself in four places.** Two fields stored the
   edge — the article's citation and the review's curation — and in the Arabic corpus an article
   cited the Voile Lumiere record while that record linked back to nothing. A hole in exactly the
   evidence graph this phase exists to build. Citation is now the floor: curation may add to what a
   review surfaces, never subtract.

**A third finding was about the tests themselves.** An assertion that the table-of-contents gate
"excludes something" failed — every article in the corpus has 4–6 sections, so build output can
only ever show the gate saying *yes*. Rather than weaken the assertion, the threshold was extracted
into a named predicate so its **refusal** path is tested directly. A rule never observed to refuse
is not a verified rule.

**Long-form typography was measured, not asserted.** 30 in-browser probes across 5 widths × 2
locales × 3 route types: zero overflow anywhere, measure capping at exactly 66ch, and the Arabic
script factors measuring 1.1200 and 1.1798 against tokens of 1.12 and 1.18.

**Screen-reader behaviour is reported as UNVERIFIED — HUMAN REVIEW REQUIRED.** A structural
accessibility audit was performed and is clean; it is not a screen-reader pass and is not presented
as one.

---

## 2. Routes implemented

**57 routes**, up from 37.

| Surface | Route | en | ar |
|---|---|---|---|
| Journal index | `/{locale}/journal/` | 1 | 1 |
| Article | `/{locale}/journal/{slug}/` | 5 | 5 |
| Format archive | `/{locale}/journal/{format}/` | 4 | 4 |

**20 new routes.** Six records produce ten article routes, not twelve — no route is generated for a
translation that does not exist.

---

## 3. Components added

| Component | Kind | Why it exists |
|---|---|---|
| `Prose.astro` | Layout | The **only** place bare elements are styled by tag, scoped so editorial typography cannot leak site-wide |
| `EditorialNote.astro` | Editorial | Makes the medical/scope boundary **structural** rather than a deletable heading |
| `ReviewReference.astro` | Editorial | In-prose citation: resolves route from canonical id, locale-safe, carries the disclosure |
| `JournalEntry.astro` | Index treatment | Image, hairline, type — no Card |

`Figure` was specified in the brief and **deliberately not built**: no body contains an image, so it
would have been a component with no caller and no rendered output to verify. Recorded as deferred.

**No Card exists anywhere in this codebase.** `BlogCard`, `ArticleCard`, `ContentCard`, `InfoCard`
were explicitly refused, and a test asserts the absence.

---

## 4. Content-model usage

No new entity type. No schema change. The journal record was already defined in Phase 1.

MDX bodies bind by filename — `{recordId}.{locale}.mdx` — and carry **no frontmatter**, so nothing
in a body can contradict its record. Ten bodies, 340 lines of prose total.

The content remains **MOCK**. The six-stage Method remains **PROJECT MOCK METHOD** and is nowhere
described as verified, proprietary, clinical or proven.

---

## 5. MDX architecture

Full detail: `docs/MDX_ARCHITECTURE.md`.

| Decision | Choice |
|---|---|
| Integration | `@astrojs/mdx@4.3.14` (v8 requires astro ^7; v4 peers astro ^5) |
| Frontmatter | None |
| Content Collections | Not used — would fork schema, lifecycle, locale contract and link graph |
| Syntax highlighting | Off — a beauty publication ships no code |
| GFM | On |
| Component scope | Allowlist of two, enforced by validator |
| Client JS | 0 bytes |

The module split (`journal.ts` pure / `journal-bodies.ts` bundler-coupled) is described in §1 and
D6-4.

---

## 6. Journal taxonomy

**Editorial format, never product category.** `testing-notes`, `guides`, `comparisons`, `essays`.

A test asserts the journal format keys and the review product-category values are **disjoint**.
This is the journal decision most likely to be reversed by someone optimising a keyword in
isolation, so it is asserted in code rather than only documented.

Keys are derived from content; labels are authored per locale and fall back to the key rather than
inventing one.

---

## 7. Thin-page gates

Two independent gates, neither of which hides content from a reader.

**Category gate — `JOURNAL_CATEGORY_GATE = 3`** (Phase 1's, unchanged). No format qualifies in
either locale: `guides` holds 2, the rest hold 1. Every archive is reachable and `noindex`,
canonicalising to the journal index. Promotion is a robots flip, not a URL migration.

**TOC gate — `TOC_SECTION_GATE = 4`.** Extracted into a named predicate so its refusal path is
testable; verified at 0, 1, 3, 4 and 9 sections. The corpus ranges 4–6 sections, so all ten
articles currently earn a TOC — recorded as a fact, not claimed as a virtue.

---

## 8. Long-form reading

- Measure: `max-width: var(--type-measure-editorial)` = **66ch**, a maximum and never a fixed width
- Opening paragraph sits outside `.prose`, larger — the entry into the piece, not a body paragraph
- Emphasis is **weight, never italic**: `font-style: italic` appears zero times in the shipped CSS
- Logical properties throughout — no `margin-left/right`, `padding-left/right` in the build
- No `[dir="rtl"]` override block anywhere

---

## 9. Editorial linking

Full detail: `docs/JOURNAL_LINKING.md`.

**Zero edges are stored as URLs.** Every relationship is a canonical record id resolved at build
time, so a slug change cannot orphan a link — including links inside prose.

| Property | Result |
|---|---|
| Articles citing ≥1 locale-available review | 10 / 10 |
| Cited review missing in citing locale | 0 |
| Forward/reverse citation disagreement | 0 |
| Citing article hidden from its review | **0** (was 1 — §10) |
| Gated brand exposed by an article | 0 |
| Self-referential siblings | 0 |
| Dead internal links, all 57 routes | **0** |

---

## 10. The review↔journal defect

Two stored fields expressed the same edge and disagreed in four places:

```
article.related.reviewIds   the CITATION  — "this piece rests on that record"
review.related.journalIds   the CURATION  — "further reading about this product"
```

Three disagreements were harmless — curation naming a non-citing article is honest under "From the
Journal". **The fourth was not.** `mufradat-darajat-albashara` cites the Arabic Voile Lumiere
record, and that record surfaced no link back.

**Resolution:** `journalForReview()` returns the union, citations first, deduplicated. Citation is
the floor; curation can add but never subtract. Two tests enforce it in both locales.

The mock data was **not** edited to make the fields agree — that would have hidden a structural
problem behind data that happens to line up.

---

## 11. Navigation changes

`/journal/` moved from the unimplemented list into `IMPLEMENTED_ROUTES`. The two Phase 5 tests that
hardcoded it as unbuilt were **updated and strengthened** — they now positively assert that the
journal index, an article route and an archive route are all emitted in both locales, rather than
simply dropping the old assertion.

---

## 12. Internal-link graph

The journal is not an island: articles → cited reviews (in prose *and* a footer list), reviews →
every citing article, articles → siblings, index ↔ archives. All locale-filtered, all gate-aware.

`articlesForStage()` is implemented and tested but **not yet consumed** — the Method page links only
to the journal index. Deferred, recorded as such.

---

## 13. SEO changes

Full detail: `docs/JOURNAL_SEO.md`.

- Articles self-canonicalise; archives canonicalise to the journal index and are `noindex`
- Reciprocal `hreflang` only where a translation exists; `x-default` follows the original locale
- Structured data per article: `BreadcrumbList`, `Person` (`@id` reference), `Article`
- **`Article`, never `BlogPosting`** — asserted by test
- Every schema field is conditional on a real value; `dateModified` additionally requires that it
  differ from `datePublished`
- **Refused:** `aggregateRating`, `reviewRating`, `ratingValue`, `offers`, `sameAs`, `image`,
  `publisher`, `wordCount`
- Indexability is **composed** — `IS_INDEXABLE_BUILD && pageIsIndexable` — so no page can opt itself
  into indexation while the source is mock

The gated-facet canonical rule was **generalised** rather than duplicated: one assertion now covers
review facets and journal archives alike.

---

## 14. Arabic / RTL verification

Measured in-browser, 30 probes.

| Property | Result |
|---|---|
| `lang` / `dir` on every journal page | correct |
| Arabic size factor | token 1.12 → **measured 1.1200** |
| Arabic leading factor | token 1.18 → **measured 1.1798** |
| Arabic body leading | 1.982 (English 1.68) |
| Arabic measure at 768–1440 | 66ch |
| Horizontal overflow, any width | **none** |
| Bare `<bdi>` | **0** — every isolate declares `dir` or `lang` |
| `[dir="rtl"]` override block | none in the codebase |
| Arabic labelled as English | none |
| Arabic letter-spacing | 0 |

Arabic landmark names are authored Arabic (`التنقل الرئيسي`, `مسار التنقل`, `المحتويات`), not
English structure with translated labels attached.

The Arabic citation renders `موثق في` and resolves to `/ar/reviews/…` with the Arabic disclosure
`مُهدى، غير مدفوع`.

> **Arabic copy quality: UNVERIFIED by a native reader.** Direction, isolation, factors and
> structure are measured correct. Editorial quality is a human judgment and has not been made.

---

## 15. Accessibility verification

Structural audit across four representative routes:

| Property | Result |
|---|---|
| `h1` per page | exactly 1 |
| Heading outline | no skipped level |
| Landmarks | header, nav ×3–4, main, section ×2, footer |
| Nav accessible names | all present, unique, in the page's own locale |
| Links without discernible name | 0 |
| Images without `alt` | 0 |
| Positive `tabindex` | **0** — tab order follows DOM order |
| Skip link | present, first, → `#main` |
| TOC | named `<nav>`, every anchor resolves to a heading in the same document |
| `EditorialNote` | `<aside>` with an accessible name, both locales |

> ### Screen-reader verification: **UNVERIFIED — HUMAN REVIEW REQUIRED**
>
> No NVDA, JAWS or VoiceOver pass was performed. What is reported above is an accessibility-*tree*
> and markup audit, which is **not a substitute** for hearing the page announced. In particular the
> following remain unverified: the announcement of the `EditorialNote` boundary aside, the citation
> with its trailing disclosure label, RTL reading order in a screen reader's virtual buffer, and
> the TOC's usefulness as a navigation landmark in practice.
>
> **This is not a pass.** It must be performed by a person before launch.

---

## 16. Performance

| Metric | Value |
|---|---|
| Client JavaScript | **0 bytes**, all 57 routes |
| Journal index HTML | 17.9 KB |
| Article HTML | 23.1 KB |
| Archive HTML | 14.1 KB |
| CSS | shared, cached across routes |
| Fonts | self-hosted, per-locale, within the 180 KB/locale budget |
| Third-party requests | 0 |

Core Web Vitals **not measured** — payloads are known, field data is not.

---

## 17. Browser verification

Method: same-origin iframes sized exactly, because window resizing is unreliable under Windows
display scaling (the Phase 3 technique).

**Matrix:** 5 widths (320, 375, 768, 1024, 1440) × 2 locales × 3 route types = **30 probes**.

| Criterion | Result |
|---|---|
| Horizontal document scroll | **none, anywhere** |
| Elements exceeding viewport width | **0** |
| Measure (en) | 26 / 31 / 63 / 66 / 66 ch |
| Measure (ar) | 28 / 33 / 66 / 66 / 66 ch |
| h1 wrapping | 1 line at every width, never overflows |
| Breadcrumb wrapping | 1 line, never overflows |
| Arabic leading | 1.982 at every width |
| Bidi isolates | 0 bare `<bdi>` |
| Focus order | DOM order (0 positive `tabindex`) |

**Table and figure overflow: NOT EXERCISED.** No body in the corpus contains a table, figure or
caption. The overflow strategy exists in CSS but no rendered instance was measured — reported as
untested rather than as passing.

Visual confirmation: the Arabic boundary note renders with its clay rules and RTL alignment at
375px; the English citation renders as `│ DOCUMENTED IN  Maison Eclat Voile Lumiere Skin Tint  PAID
PARTNERSHIP` with the mineral rule.

---

## 18. Test results

**244 tests, 57 suites, 0 failures** (up from 186).

| Suite | Tests | Covers |
|---|---|---|
| `journal.test.mjs` | 30 | Locale availability, routing, hreflang, all three switcher states, taxonomy disjointness, reserved slugs, both gates, the link graph both directions, gated brands, method stages, fabrication checks |
| `longform.test.mjs` | 28 | MDX rendering, leakage, component output, citation resolution, TOC gate + anchors, measure, italic absence, logical properties, Article schema |
| existing suites | 186 | Unchanged, all still passing |

**Six assertions I wrote were wrong and were corrected — the code was not.** Chief among them an
Arabic slug I guessed (`kayfa-tuqayyimin-ada-kream-al-asas`) that does not exist; the actual Arabic
block reuses the Latin slug. The corrected test derives the expected href from the record rather
than hardcoding it, so it tests the switcher instead of the mock data.

---

## 19. Validation results

| Gate | Exit | Result |
|---|---|---|
| `validate:content` | 0 | PASS |
| `validate:journal` | 0 | PASS — every body maps to a record, carries no schema, cites only what exists |
| `validate:contrast` | 0 | PASS — 24/24 pairs, including AAA for long-form reading (16.28:1) |
| `validate:ux` | 0 | PASS — 0 anti-patterns |
| `astro check` | 0 | **0 errors, 0 warnings, 0 hints** |
| `build` | 0 | 57 pages |
| `test` | 0 | 244/244 |
| `guard:mock` | **1** | **Correctly BLOCKING** |

`npm run verify` exits 1 — because the mock guard blocks, which is the intended behaviour.
`validate:journal` was added to the `verify` chain so the MDX safety layer cannot be forgotten.

---

## 20. Mock-guard result

**The guard still blocks the build, and that is correct.**

```
This build contains fabricated content and must not be deployed.
Replace the mock content layer with verified client content before release.
See docs/REAL_CONTENT_MIGRATION.md
```

It fires on two markers: the `__MOCK_DATA__` envelope present on every page, and reserved
`*.example.com` brand hosts. The guard was **not weakened** to accommodate the journal; journal
pages carry the same marker as every other page.

---

## 21. Known limitations

| # | Limitation | Severity |
|---|---|---|
| 1 | **Screen-reader behaviour unverified** (§15) | **Must resolve before launch** |
| 2 | Production origin is `https://example.invalid` (U-01) | **Blocking** |
| 3 | Arabic copy unreviewed by a native reader | High |
| 4 | No table, figure or image in any body — those long-form behaviours are unexercised | Medium |
| 5 | `Figure` component not built (no caller) | Low — deferred by design |
| 6 | No format reaches the indexation gate; all archives `noindex` | Expected |
| 7 | `articlesForStage()` implemented but unconsumed by the Method page | Low |
| 8 | Core Web Vitals not measured | Medium |
| 9 | No sitemap, RSS or `robots.txt` | Deferred to Phase 8 |

---

## 22. Deferred work and Phase 7 recommendation

**Deferred:** `Figure`; per-stage journal links on the Method page; sitemap/RSS/`robots.txt`;
Core Web Vitals measurement.

**Requiring a human (see `docs/PHASE_6_DECISION_LOG.md` H-1…H-5):** Arabic editorial review, a real
screen-reader pass, the four taxonomy values, whether curation may surface non-citing articles, and
the production domain.

**Recommendation for Phase 7.** The three editorial surfaces are complete and consistent. The
remaining surfaces — Brands, Work, Contact, About, Editorial Standards, Legal — are mostly *entity*
and *trust* pages rather than new reading experiences, and About / Editorial Standards are where the
project's honesty claims become first-person statements about a real person. That makes them the
surfaces where the mock-content boundary matters most, and I would want the real-content decision
(U-01 and the migration in `docs/REAL_CONTENT_MIGRATION.md`) settled before, not during, that work.

**Phase 6 is complete. No Phase 7 work has begun.**
