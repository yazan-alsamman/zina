# Phase 5 — Completion Report

**Core editorial experience: reviews index, Method, homepage and editorial navigation**

| | |
|---|---|
| **Status** | Complete |
| **Phase** | 5 — core editorial experience |
| **Date** | 2026-09-11 |
| **Overall confidence** | **High** on the facet architecture, locale correctness, content safety, navigation integrity and the test suite. **Medium** on Arabic copy quality (measured correct, unreviewed by a native reader) and on performance (payloads measured, Core Web Vitals not). **Blocked** on the production domain (U-01) |
| **Routes** | **12 → 37** |
| **Client JavaScript** | **0 bytes**, unchanged, now across all 37 routes |
| **Next phase begun** | **No.** Stopped at the Phase 6 gate |

---

## 1. Executive summary

Phase 5 turned a foundation with one template into a working editorial system: the archive, the
Method that gives it meaning, and a homepage that introduces both.

**The architectural gate of the phase was R-15 — crawlable discovery — and it is closed.** Facets
are real, statically generated, server-rendered routes that filter correctly with JavaScript
disabled. Verified in a browser: `/en/reviews/foundation/` renders one entry, `/en/reviews/brand/
veloura-beauty/` renders two, both with zero script tags.

**Reaching that required resolving a genuine contradiction.** Phase 1 staged facets as query
strings today and paths later. A query string is not a route in a static build, so the plan was
unimplementable without client-side filtering. The resolution adopts Phase 1's own reserved URL
shape now and applies Phase 1's own gate to *indexability* rather than *existence* — which is
strictly better on Phase 1's stated goal of URL stability, because promotion becomes a robots flip
rather than a 301 migration.

**Phase 5 also fixed a defect Phase 4 had documented and left standing.** The review page linked
to 28 targets that do not exist. Navigation now filters against an explicit registry of
implemented routes, and a single helper resolves every brand link through both the per-locale gate
and template existence. **Zero dead internal links**, asserted across the whole build.

**Tooling found five defects that reading would not have**, including an `h1 → h3` heading skip on
every facet page and — the worst — `Astro.props` silently typing as `any` in `ReviewEntry`, which
had quietly removed type safety from `locale` and `review`.

---

## 2. Routes implemented

**37 routes**, up from 12.

| Family | en | ar | Indexable |
|---|---|---|---|
| Home | `/en/` | `/ar/` | Yes\* |
| Reviews index | `/en/reviews/` | `/ar/reviews/` | Yes\* |
| Review detail | 5 | 5 | Yes\* |
| **Category facet** | 5 (`concealer`, `foundation`, `lip`, `mascara`, `serum`) | 5 (`concealer`, `foundation`, `mascara`, `moisturizer`, `serum`) | **No — thin** |
| **Brand facet** | 4 | 5 | **No — navigation only** |
| Method | `/en/method/` | `/ar/method/` | Yes\* |
| 404 | 1 | 1 | No |

\* `noindex` today because the content source is the mock layer and every preview build is
`noindex` site-wide. They become indexable when the source is verified content.

The locale sets genuinely differ: English has `lip` (English-only review), Arabic has
`moisturizer` (Arabic-original) and a `terra-sana` brand facet English does not have.

---

## 3. Components added

**7 new, 19 total.** Nothing speculative.

| Component | Purpose |
|---|---|
| `ReviewEntry` | The index treatment — image, hairline, type. Used by the index, both facet families and the homepage |
| `FacetNav` | A `<nav>` of real links with `aria-current`. Not a listbox, not chips backed by a control |
| `reviews/index.astro` | The archive |
| `reviews/[category].astro` | Category facet |
| `reviews/brand/[brand].astro` | Brand facet |
| `method/index.astro` | The Method |
| `index.astro` | The homepage |

New library modules: `config/site.ts` (the single origin), `lib/facets.ts` (facet derivation and
gates), `lib/format.ts` (locale dates and counts).

---

## 4. Content-model usage

**The Phase 1 schema was not touched.** No Astro Content Collections, no second schema, no new
lifecycle state.

Everything new derives from existing fields:

| Surface | Fields |
|---|---|
| Index entries | `disclosureLabel`, `entity.category`, `entity.brandId`, `title`, `subtitle`, `conditions[]`, `dates` |
| Category facets | `entity.category` grouped per locale |
| Brand facets | `entity.brandId` grouped per locale |
| Method | `stageOrder`, `stages[]` with `purpose`/`observes`/`evidence`/`doesNotProve`, `boundaryStatement`, `whatThisCannotTell[]` |
| Method → reviews | `testing.methodStageKeys` — the relationship already in the model |
| Homepage | `bios.homepageIntro`, `professionalTitle`, `featured`, plus the featured review's conditions and first observation |

**No relationship was invented.** The finer stage → specific-evidence link the brief mentions is
supported by `EvidenceAsset.stageKey` but is **not rendered**, because pointing the Method at one
plate in one review would imply a representativeness the data does not support. Recorded as a
limitation rather than fabricated.

---

## 5. Reviews index architecture

An **editorial index of testing records**. The disclosure label is the first thing on every row —
which is also why no disclosure filter is needed: the answer is already there.

Each entry: disclosure → brand · category → title → **the test, as subtitle** → up to two
published conditions in record density → tested/updated dates.

**Never**: score, star, rank, "best", award, popularity, engagement, social proof. Asserted with
word-boundary matching, after a naive scan flagged "views" inside "**Review**s".

Layout by count: the most recent record is `featured` — **more space, same component.**

Full detail: `docs/REVIEWS_INDEX_IMPLEMENTATION.md`.

---

## 6. Crawlable facet architecture

**The R-15 gate, closed.** Full detail: `docs/FACET_URL_ARCHITECTURE.md`.

| | |
|---|---|
| Category | `/{loc}/reviews/{category}/` — Phase 1's exact reserved shape |
| Brand | `/{loc}/reviews/brand/{slug}/` — permanently noindex, navigation only |
| Disclosure | **Not built.** Answered on every row instead (D5-3) |
| Combinations | **Not built, ever.** Fifty near-duplicate pages for a theoretical need |

Astro generates the category family alongside the review-slug family without ambiguity because the
generated paths never overlap — verified experimentally before the architecture was committed, and
that is what allowed Phase 1's URL shape to be preserved rather than falling back to a `/category/`
prefix Phase 1 had explicitly rejected.

**Measured behaviour** (Chrome, built output):

| URL | Entries | robots | canonical | hreflang | JS |
|---|---|---|---|---|---|
| `/en/reviews/` | 5 | noindex\* | self | 3 | 0 |
| `/en/reviews/foundation/` | **1** | noindex | `/en/reviews/` | 0 | 0 |
| `/en/reviews/brand/veloura-beauty/` | **2** | noindex | `/en/reviews/` | 0 | 0 |
| `/ar/reviews/brand/terra-sana/` | **1** | noindex | `/ar/reviews/` | 0 | 0 |

---

## 7. Thin-page gates

**Existence and indexability are separate questions**, resolved together in `facetIndexing()` so
robots and canonical cannot disagree.

**Measured: no category qualifies for indexation.** Every category holds exactly one review per
locale.

| Condition | robots | canonical | hreflang |
|---|---|---|---|
| Category ≥5 in locale | `index, follow` | self | emitted where the counterpart has records |
| Category <5 | `noindex, follow` | `/{loc}/reviews/` | **none** |
| Brand, any count | `noindex, follow` | `/{loc}/reviews/` | **none** |

**Two gates compose**: a facet is indexable only if its own gate passes **and** the build is
indexable. Without that a facet could have claimed `index, follow` inside a preview build where
every other page was `noindex` (C5-3).

The gated page **says so on itself** — *"This is a navigation view."* — rather than hiding the
status in a meta tag.

`indexableFacetPaths()` already exists for Phase 8's sitemap and correctly returns empty today.

---

## 8. Method implementation

All six stages, in canonical order, in both locales, with every field the model carries.

**PROJECT MOCK METHOD is enforced by five mechanisms, only one of which is copy**: the explicit
notice, the record's own `boundaryStatement`, `_verification: "MOCK"` blocking publication, the
`__MOCK_DATA__` build-failure marker, and a test scanning for ten clinical-claim phrases in both
locales.

**The boundary sits above the stages**, not after them — a reader meets the limit before investing
in the protocol.

**`doesNotProve` renders at identical weight to `purpose`** — same class, deliberately, so there
is no second class anyone could quietly shrink. Asserted for all six stages in both locales.

**JSON-LD: BreadcrumbList only.** No `HowTo` (it would assert a repeatable procedure yielding a
result — exactly the claim an unverified method must not make), no `MedicalEntity`, no
`Organization`, no credential.

Not instrumentation: no `<progress>`, no `<meter>`, no `role="progressbar"`, no counters, no
scroll animation. An ordered list with a strong reading rhythm and the stage number in the margin
index at 1024+.

Full detail: `docs/METHOD_IMPLEMENTATION.md`.

---

## 9. Homepage implementation

Built last, so it introduces a system that already exists.

First viewport, in order: the claim as `h1` → the name, small → the Method line → the proof block
within one screen.

Proof hierarchy: **claim → proof → method → corpus**. One evidence moment (three conditions and
one observation); a second would make it a dashboard.

**No section exists for content that does not.** No Journal, Work, Brands, Contact or About
teasers. No "coming soon". No fabricated proof of any kind — no follower count, no "as seen in",
no award, no testimonial, and in markup no `Organization`, no `AggregateRating`, no `sameAs`.

Full detail: `docs/HOMEPAGE_IMPLEMENTATION.md`.

---

## 10. Homepage State A / State B

**The photography dependency is severed, not papered over.**

| | State A | State B |
|---|---|---|
| Trigger | A portrait asset resolves | It does not |
| Composition | Asymmetric, statement beside portrait | **Statement widens to a longer measure** |
| LCP | The portrait | The statement text |
| Placeholder | n/a | **None** |

**The state is detected, not configured** — a `/mock-media/` path is a file that was never
created, so it is treated as absent. No flag to set wrongly.

**The site is in State B**, and it is composed for it: a title page is a real editorial form; a
grey rectangle where a face should be is not. Asserted in tests on both locales: no `<img>`, no
`role="img"`, no `frame--placeholder`, no `/mock-media/`.

Worth stating: **in State B the proof sits higher on the page.** Photography adds warmth and costs
vertical space. It is not a straight upgrade.

---

## 11. Navigation changes

**Navigation exposes only what exists.** Not greyed out, not disabled, not "soon" — a disabled item
advertises a gap; a missing one is simply a smaller navigation.

| | Rendered today | Hidden until built |
|---|---|---|
| Header | Reviews, Method | Journal, Work, About, **and the Collaborate CTA** |
| Footer | Content group (All reviews, How I test) | Professional and Standards groups — **removed entirely**, because a heading over nothing is worse than a missing heading |

`IMPLEMENTED_ROUTES` is an explicit registry; adding a template means adding its key, and
`tests/global.test.mjs` asserts the registry matches what the build emits so it cannot drift.

`aria-current` was also corrected: it used `startsWith`, which marked the Reviews nav item as the
current page on every review and facet page.

---

## 12. Internal-link graph

```
homepage  -> method (x2), method#stage (x6), featured review, 3 recent reviews, reviews index
reviews   -> 5 reviews, 5 category facets, N brand facets, method
category  -> its reviews, sibling facets, index
brand     -> its reviews, index
method    -> reviews that used each stage, reviews index
review    -> method (6 stage anchors + prose), 2 related reviews, brand facet, comparison review
```

**Zero dead links**, verified by an audit over every internal href in all 37 pages. Journal and
work relationships remain in the data and light up when those templates land.

No string-concatenated URLs: every path comes from `lib/routing.ts`.

---

## 13. SEO changes

**The origin is now single-sourced.** `src/config/site.ts` exports `SITE_URL`; `astro.config.ts`
imports it, so `Astro.site` and the lib layer cannot disagree. `absoluteUrl()` no longer threads
`Astro.site` through call sites. **No template contains a domain literal**, asserted by scanning
every source file.

Canonical, hreflang, x-default, OG url and JSON-LD urls all derive from it.

Per surface: unique title and description, canonical, robots, OG, Twitter, semantic headings,
breadcrumbs, `BreadcrumbList` on every new page, `Person` on the homepage.

**Nothing fabricated**: no `reviewRating`, `aggregateRating`, `offers`, standalone `Product`,
`sameAs`, `Organization`, award or testimonial — asserted across all 37 pages.

**Still blocked on U-01.** `SITE_URL` is `https://example.invalid`, a reserved TLD that can never
resolve, chosen so a placeholder canonical can never be mistaken for a real one. **SEO URLs remain
blocked from production use.** It is one line to change.

---

## 14. Arabic / RTL verification

Measured in Chrome, five widths × two locales × five route types — **50 checks, all clean**.

| Check | Result |
|---|---|
| Horizontal overflow | **None**, any width, either direction |
| Clipped text | **None** |
| **Reversed numeric ranges** | **None** — checked by comparing logical digit order against visual `getBoundingClientRect` order inside every `<bdi dir="ltr">` |
| Arabic letter-spacing | **0 violations** |
| Type-size floors | **0 violations** |
| Bare `<bdi>` | **0** across the build |
| Arabic text labelled `lang="en"` | **0** |
| `[dir="rtl"]` override blocks | **0 in the codebase** |
| Second RTL stylesheet | **None** |
| Locale font isolation | Each locale loads only its own faces |

The Method's boundary statement and the new facet vocabulary render correctly in RTL with the
margin index on the right, from logical properties alone.

**No new font weight was added.** Payload unchanged: 79.2 KB (en) / 151.9 KB (ar).

---

## 15. Accessibility verification

Measured across all 37 pages:

| Check | Result |
|---|---|
| Exactly one `h1` | ✓ every page |
| Heading level skips | **0** — after fixing a real `h1 → h3` skip on facet pages |
| Skip link present and first | ✓ both locales |
| Named `nav` landmarks, all unique | ✓ no unnamed nav anywhere |
| Positive `tabindex` | **0** |
| Images without `alt` | **0** |
| `role="img"` without a label | **0** |
| Empty links | **0** |
| Facet active state | Border **plus** a filled mineral marker plus `aria-current` — never colour alone |
| Touch targets | 44px on facet links |
| Contrast | 24/24 pairs pass |

**Not done: no screen-reader pass, in either language.** The Arabic screen-reader pass remains the
check most likely to find real defects and has still not happened.

---

## 16. Performance

| Page | HTML | JS | Images |
|---|---|---|---|
| Homepage en | **17.2 KB** | **0** | none |
| Homepage ar | 19.0 KB | **0** | none |
| Reviews index en | 20.5 KB | **0** | none |
| Method en | 24.3 KB | **0** | none |
| Method ar | 27.6 KB | **0** | none |

CSS 52 KB total across all page types. Fonts unchanged. **Zero client JavaScript across 37
routes** — no exception was needed, so none is documented.

**Not measured**: LCP, INP, CLS. Phase 9.

---

## 17. Browser verification

Chrome, against the production build served locally. **50 measured checks** across two locales,
five widths (320/375/768/1024/1440) and five route types, each checking nine properties.

It also confirmed the facets genuinely filter server-side with zero script tags, and a visual pass
on the Arabic Method confirmed the editorial rhythm, the RTL margin index, and the boundary block.

---

## 18. Test results

**186 tests, all passing** — up from 98.

| File | Covers |
|---|---|
| `bidi.test.mjs` | The Phase 3 numeral-isolation correction |
| `content.test.mjs` | Locale availability, routing, hreflang, switcher, lifecycle, gates |
| `output.test.mjs` | Phase 4 review-page output |
| **`facets.test.mjs`** | **New** — facet derivation, slug safety, thin-page gates, `brandDestination` |
| **`surfaces.test.mjs`** | **New** — reviews index, facets, Method, homepage |
| **`global.test.mjs`** | **New** — invariants across every page: dead links, origin, bilingual, accessibility, design system, content safety |

**No existing test was weakened.** One helper was *narrowed* (`reviewPages()` now matches review
detail pages rather than any path containing `/reviews/`) and all ten detail pages still run
through every assertion.

---

## 19. Mock-guard result

```
node tools/check-mock-guard.mjs dist   →   BLOCKED, exit 1   ✓ correct
```

Unchanged and un-weakened. Every one of the 37 pages carries the `__MOCK_DATA__` marker in an HTML
comment, so the guarantee is content-independent — it does not depend on mock data happening to
contain an `example.com` URL. `tests/global.test.mjs` asserts the marker is present on every page
and is always a comment, never a visible badge.

The clean-output direction was verified in Phase 4 and the mechanism is unchanged.

---

## 20. Known limitations

1. **`SITE_URL` is a placeholder.** All absolute URLs are structurally correct and factually wrong
   (U-01).
2. **Every page is `noindex`**, because the content source is the mock layer.
3. **No category facet is indexable** — each holds one review per locale. Correct, and it means
   the indexable-facet path has been *tested against a synthetic facet* rather than a real one.
4. **No screen-reader testing**, in either language.
5. **~25 more Arabic interface strings** added, still unreviewed by a native reader.
6. **No stage → specific-evidence link** on the Method; the model supports it but rendering it
   would imply representativeness the data does not support.
7. **Journal, work, brand, contact, about routes remain unbuilt**, so their relationships are
   carried in data but not rendered.
8. **Core Web Vitals unmeasured.**

---

## 21. Decisions requiring human approval

| # | Decision | Why |
|---|---|---|
| **D5-1** | Facet URLs exist now, gated for indexation | Changes Phase 1's staged plan — the URL shape is Phase 1's, the timing is not |
| **D5-3** | No disclosure facet | A reasonable person could want "independently purchased only" as a trust surface |
| **D5-4** | Brand facets permanently noindex | Revisit if `/brands/` is never built |
| **U-01** | The production domain | Blocks the SEO foundation from being finishable |
| — | Arabic interface strings | Unreviewed by a native reader |

---

## 22. Deferred work

Untouched, per the stop condition: Journal, Brand, Work, Contact, About, Editorial Standards,
CMS, backend, database, authentication, analytics, search, image CDN, 3D, WebGL, video, advanced
animation, production content migration, social integrations.

Also deferred: sitemap and robots.txt (Phase 8), the `/` locale-negotiation 302 (host
configuration), MDX journal bodies, and image optimisation (no photography exists).

---

## 23. Phase 6 recommendation

**Four things first, in order:**

1. **Establish the project repository.** 7,008 lines of source are now unversioned. `git
   rev-parse --show-toplevel` still returns `C:/Users/Lenovo`, there is no project-local `.git`,
   and **no git operation was run in this phase**. Several of this system's strongest rules are
   enforced by being "detectable in a diff", and there is still no diff.
2. **Answer U-01.** One line, and the SEO foundation becomes finishable.
3. **Ask Zina about the Method.** Unanswered since Phase 0; it is now the spine of five
   architectures and the subject of a dedicated page.
4. **Get the Arabic interface strings in front of a native reader.** The count grew again.

**Then the next surfaces, in this order**, because each exercises something untested:

- **`/journal/`** — the first MDX bodies, and the contextual in-prose review link that Flow E
  depends on.
- **`/brands/{slug}/`** — flips `brandDestination()` to its other branch and exercises the
  per-locale gate as a *route* rather than as a link decision.
- **`/work/{slug}/`** — the results-figure render gate, still untested against a template.
- **`/contact/`** — the only form on the site, and the first page that might justify JavaScript.
- **`/about/`, `/editorial-standards/`, legal** — completing the footer.

### Suggested handoff context

> Phase 5 is complete. Read `docs/reports/PHASE_5_REPORT.md`, then
> `docs/FACET_URL_ARCHITECTURE.md` and `docs/PHASE_5_DECISION_LOG.md`.
>
> 37 routes, 186 tests, zero client JavaScript, zero dead internal links. **R-15 is closed**:
> facets are crawlable server-rendered routes that work with JavaScript disabled.
>
> Run `npm run verify` before and after any change. It fails at the mock guard by design.
>
> Build the journal next. Bodies become MDX (Phase 1 D-8). Register each new route in
> `IMPLEMENTED_ROUTES` or navigation will keep hiding it. Do not add a UI framework, an animation
> library, or a `Card`.
>
> Report to `docs/reports/PHASE_6_REPORT.md`.

**Phase 6 has not been started.**
