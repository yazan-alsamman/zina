# Phase 5 Decision Log

**Status:** Phase 5 record. Every decision, every contradiction found in an earlier phase, and
every defect the verification passes caught.

---

## 1. Contradictions found while implementing

### C5-1 · Phase 1's staged facet plan cannot exist in a static build

| | |
|---|---|
| **Earlier decision** | `docs/SEO_URL_ARCHITECTURE.md` §5 — today `?category=foundation` (noindex, canonical → index); at 5+ reviews, promote to `/{loc}/reviews/{category}/` (indexable) |
| **The contradiction** | **A query string is not a route.** Static hosting serves `/{loc}/reviews/index.html` for `?category=foundation`; the filter does nothing. The only way to honour the plan would be client-side filtering, which the Phase 5 brief forbids and which leaves the corpus reachable only through the sitemap (R-15) |
| **Resolution — D5-1** | Adopt the URL shape Phase 1 reserved **now**, and apply the Phase 1 gate to **indexability** rather than to **existence**. Generated at ≥1 review; indexable only at ≥5 |
| **Why this is better** | Phase 1's own stated goal was URL stability "from six reviews to five hundred". Promotion is now a robots and canonical flip, not a URL migration with a 301 map. Nothing moves as the corpus grows |
| **Threshold invented?** | **No.** The gate is Phase 1's, read from `site.json` |

### C5-2 · Phase 4 shipped dead navigation

| | |
|---|---|
| **What happened** | The review page linked to `/brands/{slug}/`, `/journal/{slug}/` and `/work/{slug}/` — none of which are built. Phase 4 recorded this as a known limitation; Phase 5 §20 forbids it |
| **Scale** | 28 dead link targets across the build, found by an audit script |
| **Resolution — D5-2** | Two mechanisms. `IMPLEMENTED_ROUTES` is an explicit registry the global shell filters against, and `brandDestination()` resolves every brand link through **two** conditions: the per-locale gate passes **and** the template exists. Related journal and work groups render empty and are removed by the existing absence-is-silent rule |
| **Result** | **Zero dead internal links.** `tests/global.test.mjs` asserts every internal href resolves to an emitted page |

### C5-3 · A facet could claim `index, follow` inside a preview build

| | |
|---|---|
| **What happened** | The category facet used `facetIndexing().robots` directly. In a preview build — where every other page is correctly `noindex` — a facet that passed its own gate would have emitted `index, follow` |
| **Resolution** | The two gates compose: `robotsContent(IS_INDEXABLE_BUILD && facetIsIndexable)`. hreflang follows the composed result |
| **Found by** | Reading the test output critically, not by a failing assertion |

---

## 2. Decisions

| # | Decision | Rationale | Reversal cost |
|---|---|---|---|
| **D5-1** | **Path-based facets now; the gate governs indexability** | C5-1 | Medium — URLs would have to move |
| **D5-2** | **`IMPLEMENTED_ROUTES` registry; navigation renders only what exists** | Not greyed out, not disabled, not "soon" — a disabled item advertises a gap; a missing one is simply a smaller navigation | Trivial |
| **D5-3** | **No disclosure facet** | The reader's real question — "is this sponsored?" — is answered on **every row** of the index by the disclosure label. That is stronger than a filter, because it needs no interaction. A route family would add 6 × 2 permanently-noindex pages answering a question already answered in place | Low — route shape defined |
| **D5-4** | **Brand facets are permanently noindex** | The canonical brand surface is `/brands/{slug}/`. Two indexable pages listing the same reviews would cannibalise each other — the exact failure the Phase 1 brand gate exists to prevent | Low |
| **D5-5** | **No multi-facet combinations, ever** | Five categories × five brands × two locales = fifty near-duplicate thin pages, for a reader need that is theoretical at any corpus size this site will reach | n/a |
| **D5-6** | **`SITE_URL` is the single origin; `astro.config.ts` imports it** | So `Astro.site` and the lib layer can never disagree. `absoluteUrl()` no longer threads `Astro.site` through every call site, which removed a class of mistake | Trivial |
| **D5-7** | **Heading level is a prop on `ReviewEntry`** | It is a property of the **document outline**, not of the component: `h2` under a page `h1`, `h3` under a section `h2`. Hard-coding `h3` produced a real `h1 → h3` skip on facet pages | Trivial |
| **D5-8** | **Homepage State A/B is detected, not configured** | A `/mock-media/` path is a file that was never created. Deriving the state from the asset removes a flag someone could set wrongly | Trivial |
| **D5-9** | **The facet count is rendered beside each facet** | It is how many records exist — the one number an archive can state without implying anything. Not a ranking, not social proof | Trivial |
| **D5-10** | **`.astro` files use extensionless imports; the `.ts` lib layer keeps explicit `.ts`** | Node's test runner needs explicit extensions; the Astro TS plugin does not resolve them inside `.astro`, and silently degraded `Locale` and `Review` to `any`. Two conventions, each required by its consumer | Trivial |

---

## 3. Defects found and fixed

Every one was found by tooling, not by reading.

| # | Defect | Found by | Fix |
|---|---|---|---|
| **B5-1** | **28 dead internal link targets** across the build | A link-audit script written for this phase | C5-2 / D5-2 |
| **B5-2** | **`h1 → h3` heading skip** on every facet page | `tests/global.test.mjs` | D5-7 |
| **B5-3** | **`Astro.props` silently typed `any`** in `ReviewEntry`, which made `locale` and `review` untyped | `astro check` — after two errors were briefly masked by a `tail -3` in my own command | The template-literal tag construction (`` `h${n}` as "h2" \| "h3" ``) broke the plugin's inference. Replaced with an explicit union |
| **B5-4** | Duplicate keys `methodStages` and `recentReviews` in `ui-strings.ts` — a later definition silently overwrote an earlier one | A Vite build warning | Renamed one, removed the other |
| **B5-5** | A facet could claim `index, follow` in a preview build | Reading test output | C5-3 |

**Six of my own test assertions were wrong** and were corrected rather than the code:

- `reviewPages()` matched any path containing `/reviews/`, which after Phase 5 includes the index
  and every facet. Narrowed to review **detail** pages — narrowed, not weakened: all ten still run.
- "12 pages" hard-coded a Phase 4 page count. Replaced with the number that must not drift: ten
  review routes, five per locale.
- "canonical matches own URL" was wrong for gated facets, which deliberately canonicalise to their
  index. Split into two assertions that also check robots and canonical agree.
- "noindex ⇒ no hreflang" was wrong site-wide, because a **preview** build makes every page
  noindex. Scoped to facet routes.
- A forbidden-token scan flagged "views" inside "**Review**s". Replaced with word-boundary regexes.
- The State B test checked bundled **CSS** rather than markup; Astro includes a component's styles
  whenever a page imports it, even if it never renders.

---

## 4. Decisions requiring approval

| # | Decision | Why a human should confirm |
|---|---|---|
| **D5-1** | Facet URLs exist now, gated for indexation | It changes Phase 1's staged plan. The URL shape is Phase 1's own, but the timing is not |
| **D5-3** | No disclosure facet | A reasonable person could want "show me only the independently purchased reviews" as a trust surface |
| **D5-4** | Brand facets permanently noindex | Revisit if `/brands/` is never built |
| — | **Arabic interface strings** | ~25 more were added this phase (facet, method and homepage vocabulary). Still unreviewed by a native reader — Q3-2 |

---

## 5. Carried forward unchanged

- Zero client JavaScript. Still **0 bytes**, now across 37 routes.
- No Card, radius 0, no elevation shadow, no gradient beyond the paper grain.
- Missing translation → no route, no hreflang, no stub, no machine translation.
- Disclosure above the content; limitations at equal weight to strengths.
- No rating, in content, markup or schema.
- `doesNotProve` at equal weight to `purpose`.
- The Method is a **PROJECT MOCK METHOD**.
- Logical properties only; no second RTL stylesheet, no `[dir="rtl"]` block anywhere.
- The mock guard blocks the build.

---

## 6. Open questions carried into Phase 6

| # | Question | Status |
|---|---|---|
| **U-01** | The production domain | **Still blocking** correct canonical and hreflang. Now single-sourced, so it is one line to change |
| **Q3-3** | Does Zina have a testing method? | **Unanswered since Phase 0.** Now the spine of five architectures |
| **Q3-1** | Can Zarid be licensed? | Unanswered. The fallback tier is implemented and legal |
| **Q3-2** | Native Arabic review of interface strings | Unanswered, and the string count grew this phase |
| **U-02** | Verified social URLs | The footer social row still does not exist |
| **U-03** | Legal jurisdiction | Blocks `/privacy/`, and with it the footer Standards group |
| **New** | Is a stage → specific-evidence link wanted on the Method? | The model supports it; rendering it would imply a representativeness the data does not support |
| **R-07** | Repository boundary | **Still open.** No git operation was run in this phase |
