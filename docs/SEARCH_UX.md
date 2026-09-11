# Search UX

**Status:** Phase 3 architecture. **Not built in v1.**

Search is specified now because retrofitting it into the navigation, the content model and the URL
architecture is expensive, and because a decision *not* to build it should be a decision rather than
an omission.

---

## 1. The decision: not in v1

| | |
|---|---|
| **Activation threshold** | **~200 reviews**, per `docs/NAVIGATION_ARCHITECTURE.md` §9 |
| **Current corpus** | 6 reviews, 6 articles, 4 work projects, 5 brands — **21 content records, 10–11 per locale** |
| **Why not now** | A visitor can see the entire corpus by scrolling one index page. A search field on a 5-item library is an admission that the library is hard to navigate, and it is not |
| **What replaces it** | The reviews-index **facets** — category, brand, disclosure — as crawlable URLs. That is the correct navigation for a small corpus, and it is also the SEO-correct one |
| **Reversal cost** | Low. The route `/{loc}/search/` is defined and deferred; adding it later changes the header and adds one template |

**The honest position:** most sites of this size add search because search is a feature, not because
anyone was lost. This one adds it when the corpus makes browsing genuinely impractical.

---

## 2. Entry point, when it ships

| Property | Decision |
|---|---|
| **Location** | A **sixth header affordance**, not a sixth navigation item. An icon-and-label control at the inline end of the primary nav, before the CTA |
| **The icon exception** | The search glyph is one of the nine icons in `docs/ICONOGRAPHY.md`, listed as **conditional** precisely for this. It ships only with search |
| **Behaviour** | Opens `/{loc}/search/` — **a real page, not an overlay**. A search that lives in a modal cannot be linked, bookmarked, shared, or reached with JavaScript disabled |
| **Mobile** | Inside the menu overlay, above the primary items |
| **Not** | An always-open omnibox in the header · a slide-down search drawer · a command palette · type-ahead in the header |

**Why a page rather than an overlay.** Every other decision in this architecture treats a state as a
URL — facets are URLs, locale is a URL, pagination is a URL. Search is the same kind of state.

---

## 3. Query behaviour

| Property | Decision |
|---|---|
| **URL** | `/{loc}/search/?q={query}` |
| **Indexability** | **`noindex, follow`.** Search-results pages are the classic thin-content and crawl-waste surface |
| **Scope** | The **current locale only.** A search on `/ar/search/` never returns English records — a locale is an authoring language, and a mixed-language result list would break that principle in the most visible way possible |
| **Submission** | A real `<form method="get">`. Works without JavaScript |
| **Live results** | **No type-ahead in v1 of search.** Results render on submit. Type-ahead requires a client index, debouncing, an ARIA combobox pattern and a live region, and it saves one keystroke |
| **Empty query** | Renders the search page with no results block and a short line describing what is searchable |
| **Query normalisation** | Case-insensitive; Arabic diacritics stripped for matching; `أ إ آ ا` normalised to `ا`, and `ة`/`ه`, `ى`/`ي` treated as equivalent — **standard Arabic search normalisation, and the single most impactful search decision for this audience** |
| **Latin inside Arabic queries** | Matched against Latin fields. Gulf users routinely type product and brand names in Latin inside otherwise-Arabic queries (Phase 0 research), so `فوال لوميير` and `voile lumiere` must both find the review |

---

## 4. What is searchable

| Entity | Fields indexed | Weight |
|---|---|---|
| **Review** | title, subtitle, excerpt, product name, brand name, category, product type, shade | **Highest** |
| Review (body) | introduction, conditions labels and values, observation notes, verdict summary | Medium |
| **Journal article** | title, subtitle, excerpt, section headings | High |
| Journal (body) | section summaries | Medium |
| **Method stage** | name, purpose | High — a query like *"conditions"* should reach the stage |
| **Brand** | name, positioning — **only where the brand passes the gate in this locale** | Medium |
| **Work** | title, client, campaign, deliverables | Low |
| Product | name, product type — **surfaced as its review**, never as its own result | Medium |
| Person / About | name, professional title | Low |
| **Not indexed** | Testimonials, press items, mock records, unpublished records, legal pages | — |

**A product match returns its review.** Products have no route, so a product result would be a link
to a page that does not exist.

---

## 5. Result structure

**A search result is an Index Entry with an entity-type label.** It is not a new component family
(CMP-31).

```
REVIEW                                      ← entity type, label.sm muted
Maison Eclat Voile Lumiere Skin Tint        ← title
Eight hours in 38 degree heat, tested four times
PAID PARTNERSHIP · Foundation · June 2026   ← disclosure marker retained
──────────────────────────────────────────  ← hairline
```

| Property | Decision |
|---|---|
| **Grouping** | **By entity type, in a fixed order**: Reviews → Journal → Method → Work → Brands. Not by relevance score across types |
| **Why fixed order** | Relevance ranking across heterogeneous types produces incoherent lists, and the site has a clear value hierarchy. A reader searching a product name wants the review, always |
| **Within a group** | By relevance, then recency |
| **Disclosure marker** | **Retained on every review result.** A review's commercial status is part of its identity, even in a result list |
| **Snippets** | One line of matched context, plain text. **No bolded query highlighting inside the title** — it makes the type ragged and adds markup for little gain. Highlighting in the snippet line only |
| **Count** | Stated plainly: *"14 results"* / *"14 نتيجة"* |
| **Pagination** | At 20+ results, `?q=…&page=2`. No infinite scroll |
| **Layout** | The index treatment. **No cards, no result thumbnails in v1** — a text list scans faster and is what an index looks like |

---

## 6. Filtering within results

| Filter | Decision |
|---|---|
| **Entity type** | The **only** filter. A chip row: All · Reviews · Journal · Work · Brands, styled exactly as the reviews-index facets |
| Category / brand / disclosure | **Not in search.** Those live on `/reviews/`, where they are crawlable URLs and where they belong |
| Locale | **Not a filter.** It is the page's context, not an option |
| Sort | **None.** Relevance within a fixed group order is the only ordering |

**One filter axis.** A search page with four facet rows is a SaaS search interface, which is exactly
the register this must not have.

---

## 7. States

| State | UX |
|---|---|
| **No query** | The form, plus one line naming what is searchable. **No trending searches, no suggestions, no recent-search history** |
| **Results** | Count, type filter, grouped results |
| **Partial** (some groups empty) | **Empty groups are removed, not shown with a zero.** Layout by count applies within each group |
| **No results** | See §8 |
| **Locale has no content of a matched type** | That group simply does not appear |
| **Query too short** (<2 characters) | The form is not submitted; a quiet line explains why. Not an error state |
| **Server/index error** | A plain line and a link to `/reviews/`. **Never a stack trace, never an illustration** |

---

## 8. The no-result state

The state most sites get wrong, and the one where this site's principles are most visible.

```
No results for "hyaluronic serum".

Everything on this site is a product that has been tested. If it is not
here, it has not been tested yet.

RECENT REVIEWS
─────────────────────────────────
Atelier Noor Sitara Luminous Concealer
Lune Skin Cils Infini Volumising Mascara
Maison Eclat Voile Lumiere Skin Tint

How I test →
```

| Rule | |
|---|---|
| **Explain the absence honestly** | *"If it is not here, it has not been tested yet"* is the truthful and the most persuasive answer. It reframes a gap as the direct consequence of the site's own standard |
| **Never apologise** | No "sorry", no "oops", no "we couldn't find anything" |
| **Never an illustration** | No empty-state graphic, no magnifying-glass icon, no mascot |
| **Offer the nearest real thing** | Three most recent reviews, and the Method |
| **Never suggest a query** | "Did you mean…" requires a corpus large enough for the suggestion to be right more often than wrong |
| **Never fabricate** | No "coming soon", no waitlist, no "request a review" form — that would create an expectation the publishing schedule cannot meet |

---

## 9. Arabic search behaviour

The half of search most likely to be built badly, and the half this audience is most likely to use.

| Requirement | |
|---|---|
| **Normalisation** | Diacritics (tashkeel) stripped; `أ إ آ ا` → `ا`; `ة` ≈ `ه`; `ى` ≈ `ي`; tatweel removed. **Without this, Arabic search fails on most real queries** |
| **Mixed-script queries** | `فوال لوميير` and `voile lumiere` both find the same review. Latin fields are searched in both locales because product and brand names stay Latin |
| **Input direction** | The field is `dir="auto"` so an Arabic query renders RTL and a Latin one LTR, in the same field |
| **Query echo** | The query is echoed back in the results heading inside a `<bdi>` — a Latin query echoed into Arabic prose without isolation is the exact defect measured in the type proof |
| **Result count** | Numerals isolated: `<bdi dir="ltr">14</bdi> نتيجة` |
| **Layout** | Mirrors; the type-filter chip row scrolls from the right |
| **Stemming** | **Not attempted in v1 of search.** Arabic morphology is genuinely hard, and a bad stemmer is worse than none. Normalisation plus substring matching is honest and predictable |

**English search behaviour** is the same architecture with none of the normalisation complexity:
case-insensitive substring matching over the same fields, same grouping, same states.

---

## 10. Implementation posture

Specified so the decision is not made by default at build time.

| Option | Verdict |
|---|---|
| **Server-rendered search over a build-time JSON index** | **Recommended.** At 200 reviews the index is small; results are a real URL; works without JavaScript; nothing to hydrate |
| Client-side index (e.g. a lunr/fuse-style library) | **Rejected** unless measured under 15KB with the Arabic index included. A search library plus a bilingual index is the largest JS payload the site would carry, on a page that is not the primary journey |
| A hosted search service | **Rejected in v1.** A third-party script, a privacy obligation and a monthly cost, for a 200-item corpus |

**Budget when it ships:** JS ≤15KB, index ≤60KB per locale, no third-party script.

---

## 11. What search must never become

- A modal or overlay that cannot be linked to.
- An always-open omnibox in the header.
- A command palette.
- A generic SaaS search interface with four facet rows and a relevance slider.
- Result cards with thumbnails and hover elevation.
- Type-ahead that fires a request per keystroke.
- A results page that mixes locales.
- A results page that returns a product as its own entity.
- A no-result state with an illustration, an apology, or a "request a review" form.
- An indexable results URL.
- A search that ignores Arabic normalisation and therefore fails for half the audience.
