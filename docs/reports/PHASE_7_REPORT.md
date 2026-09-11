# Phase 7 — Completion Report

**Trust & Entity Surfaces: Brands, Work, Contact, About, Editorial Standards, Legal**

| | |
|---|---|
| **Status** | Complete |
| **Phase** | 7 — trust & entity surfaces |
| **Date** | 2026-09-11 |
| **Overall confidence** | **High** on the gates, the relationship rules, routing, the link graph, content safety and the test suite. **Medium** on Arabic copy quality (measured correct, unreviewed by a native reader) and performance (payloads measured, field data not). **Blocked** on the production domain (U-01), jurisdiction (U-03) and a verified contact channel. **Unverified** on screen-reader behaviour (§17) |
| **Routes** | **57 → 85** |
| **Client JavaScript** | **0 bytes**, unchanged, across all 85 routes |
| **Tests** | **244 → 345**, all passing |
| **Next phase begun** | **No.** Stopped at the Phase 8 gate |

---

## Executive Summary

Phase 7 added the six surfaces that explain *who is behind the archive and on what terms*. One rule
governs all of them:

> **An unverified value is not a value. It is an absence, and it renders as one.**

That rule is why this phase's most significant output is what the site **refuses** to say. No brand
relationship is described, because none is confirmed. No contact address is published, because none
is verified. No result figure appears, because all five are unsourced. No jurisdiction is named,
because none is known. In each case the absence is stated in the reader's own language rather than
left silent — an omitted relationship line reads as independence, and an omitted contact section
reads as an oversight.

**The Phase 5 abstraction proved correct without modification.** `brandDestination()` was written in
Phase 5 as `gatePasses && isImplemented("brand")`. Registering the brand route in Phase 7 flipped
the second condition and moved every brand link across the site in one step — no helper logic
changed. The Phase 5 tests that asserted the opposite were inverted into both-branch assertions
rather than deleted.

**The Results Figure gate is the phase's hardest problem, and it is the one the corpus cannot fully
exercise.** Every figure in `work.json` is MOCK, so production can only ever show the gate
refusing. A gate never observed to open is half-verified, so the `allowed` branch is driven by
synthetic fixtures built inside the test file — with a dedicated test proving their distinctive
sentinel value never reached `dist/`. A test may construct a confirmed figure to prove the gate
opens; production content may not invent one to make a page look richer.

**One real defect was found and fixed across three phases' surfaces.** "1 records" was rendering on
the Phase 5 brand facets and "1 articles" on three Phase 6 journal archives; the new Phase 7
indexes inherited the same strings. `countedNoun()` corrects English and **deliberately leaves
Arabic unchanged** — Arabic has six counted-noun forms selected by the number, and inventing five
of them would be authoring unreviewed Arabic grammar.

---

## Git / Repository Verification

Performed non-destructively before any production file was touched.

| Check | Result |
|---|---|
| `git rev-parse --show-toplevel` | The Zina project root ✓ |
| `git remote -v` | `origin → https://github.com/yazan-alsamman/zina.git` (fetch + push) ✓ |
| `git branch --show-current` | `main`, tracking `origin/main` ✓ |
| `git status --short` | Clean ✓ |
| Tracked files | 208, none escaping the project ✓ |
| `node_modules/`, `dist/` tracked | No ✓ |
| Secret-shaped filenames tracked | None ✓ |

**R-07 is closed.** The repository root is no longer `C:/Users/Lenovo`. No `git init`, no global
config change, and the parent/home repository was not touched.

| | |
|---|---|
| **Phase 6 baseline commit** | `48300c5d9586ecd30ebbc37998c8ba9a951da907` — *"Initial commit: publish the Zina Almokri premium website source."* |
| **Phase 7 implementation** | `333ba21` — *"Phase 7: trust and entity surfaces"* |
| **Phase 7 documentation** | see the final line of this report |

The condition is now an executable check: `tests/repository.test.mjs` (9 tests) asserts the root is
the project, no tracked path escapes it, no credential-shaped file is tracked, build output is
untracked, and the remote is a real URL with no embedded credential. It asserts **properties, not
machine-specific paths**, so it holds on any clone.

---

## Phase 6 Baseline — preserved

Verified against the committed state before any change. Every invariant holds.

| Invariant | State |
|---|---|
| Astro 5.18.2, TypeScript strict | ✓ |
| Canonical JSON content architecture | ✓ |
| MDX as rendering mechanism only | ✓ |
| No Astro Content Collections | ✓ — no `getCollection`/`defineCollection` anywhere |
| Zero client JavaScript | ✓ — 0 `.js` files emitted |
| No React/Vue/Svelte/Solid/Tailwind/GSAP/Three.js | ✓ — none in `node_modules` |
| No generic Card, radius 0, no decorative shadow | ✓ |
| No numeric ratings | ✓ |
| No `[dir="rtl"]` override stylesheet | ✓ |
| No bare `<bdi>` | ✓ |
| Locale availability governs route existence | ✓ |
| Mock guard blocking | ✓ exit 1 |
| `SITE_URL` single-sourced | ✓ |

**No regression was found.** Nothing needed repair.

---

## Routes Added

**28 new routes, 57 → 85.**

| Surface | Route | en | ar |
|---|---|---|---|
| Brands index | `/{locale}/brands/` | 1 | 1 |
| Brand entity | `/{locale}/brands/{slug}/` | 4 | 3 |
| Work index | `/{locale}/work/` | 1 | 1 |
| Work detail | `/{locale}/work/{slug}/` | 4 | 3 |
| About | `/{locale}/about/` | 1 | 1 |
| Contact | `/{locale}/contact/` | 1 | 1 |
| Editorial Standards | `/{locale}/editorial-standards/` | 1 | 1 |
| Privacy | `/{locale}/privacy/` | 1 | 1 |
| Terms | `/{locale}/terms/` | 1 | 1 |

Every route shape comes from `site.json → routes`. No alternative URL shape was invented.

**Still unbuilt and unregistered:** `/press/` (needs 3 verified mentions — 0 exist) and
`/brands/{brand}/{product}/` (`status: not-built`). A test asserts they stay unregistered.

---

## Data Architecture

**No schema change. No new entity type. No second store.** Every surface reads the existing
canonical records through three new pure modules:

| Module | Responsibility |
|---|---|
| `src/lib/brand.ts` | entity existence, the relationship gate, disclosure tally, relationships |
| `src/lib/work.ts` | the Results Figure gate, relationships |
| `src/lib/trust.ts` | contact channels, editorial standards, legal identity, `USES_TRACKING` |

All three are Node-testable — the Phase 6 rule that a build-tool API may not share a module with
testable domain logic still holds.

---

## Brand Entity Architecture

Full detail: `docs/BRAND_IMPLEMENTATION.md`.

**The gate is Phase 1's, per locale, unchanged:** `(reviews ≥ 2) OR (reviews ≥ 1 AND work ≥ 1)`,
AND a ≥120-character original description, AND a logo.

| Brand | en | ar |
|---|---|---|
| `maison-eclat`, `lune-skin`, `atelier-noor` | page | page |
| `veloura-beauty` | **page** | **gated** |
| `terra-sana` | gated | gated |

The Veloura asymmetry is the point: same company, two English reviews and one Arabic, so the gate
answers differently per language. A gated brand's reviews stay fully reachable via the facet —
**gating the entity page never hides evidence.**

`foundedYear` and `originCountry` are on the record and are **not rendered**: invented values,
corporate-profile furniture, and rendering them would make the page a company profile.

### The facet transition

| Branch | Condition | Destination | Verified in build |
|---|---|---|---|
| A | gate passes + template exists | `/{locale}/brands/{slug}/` | en Maison Eclat review → `/en/brands/maison-eclat/` |
| B | either fails | `/{locale}/reviews/brand/{slug}/` | ar Veloura review → `/ar/reviews/brand/veloura-beauty/` |
| C | no records in locale | `undefined` | Terra Sana en — nothing rendered |

Exactly **one destination per brand per locale**, asserted mutually exclusive. No competing
destinations remain.

---

## Brand / Review Relationship

Derived from `review.entity.brandId`. The brand page states **no review fact of its own** — title,
date and disclosure are read from the review record at render time, so there is one source of truth
and the brand page cannot drift from the archive. A test asserts no verdict, observation, condition
or plate device appears on a brand page.

**Disclosure tally, verbatim per record:**

| Brand (en) | Tally |
|---|---|
| `maison-eclat` | 1 × Paid partnership |
| `veloura-beauty` | 2 × Bought independently |
| `lune-skin`, `atelier-noor` | 1 × Gifted, unpaid |

Never merged, softened or re-bucketed — "Paid partnership" and "Gifted, unpaid" are different
facts.

**No relationship label renders anywhere.** All five brands are `relationship.status: "MOCK"`, and
the schema requires CONFIRMED. Tests assert no canonical type (`Campaign`, `Editorial`,
`Product Testing`, `UGC`, `Beauty Feature`) appears in the relationship band, and no softened
synonym ("our partner", "ambassador", "partnered with", …) appears anywhere on the page.

---

## Brand / Journal Relationship

Derived from `article.related.brandIds` — the same field `articleBrands()` reads in the other
direction, so the two cannot disagree. Locale-filtered; a gated brand is never exposed.

---

## Work Architecture

Full detail: `docs/WORK_IMPLEMENTATION.md`.

Four records → **7 detail routes** (`velvet-hour-wear-series` is English-only). Engagement terms —
client, role, disclosure — render **above** the description, the same placement rule as a review's
disclosure band. A test asserts the DOM order.

Work records carry `year` + `month`, not a publication date, so the page states a **period**
("June 2026") rather than synthesising a day that was never recorded.

---

## Results Figure Gate

```ts
figureIsPublishable = (f) => f._verification === "CONFIRMED" && hasWrittenSource(f);
publishableFigures = (w) => w.results.status === "CONFIRMED" ? w.results.figures.filter(...) : [];
```

Two conditions because a verification flag is something anyone can set; a figure that cannot say
where it came from is asserted, not verified. The set-level guard exists because **the set is the
unit someone signs off**.

| Record | Figures | State |
|---|---|---|
| `voile-lumiere-launch` | 2 | blocked |
| `velvet-hour-wear-series` | 1 | blocked |
| `layers-of-light-campaign` | 2 | blocked |
| `barrier-season-campaign` | 0 | absent |

**All 5 blocked.** Verified in the built output: none of `1.2M`, `38K`, `61%`, `54%`, `112K`
appears on any of the 85 pages, nor any figure label, nor the results section.

`blocked` and `absent` render **identically — nothing**. No placeholder, no empty chart, no
"results pending". The template has no `else` branch.

**The `allowed` branch** is exercised by synthetic fixtures inside `tests/work.test.mjs`, passed
directly to the pure gate functions and never written to the content layer. A dedicated test proves
`__SYNTHETIC_FIXTURE_VALUE_42__` appears nowhere in `dist/`.

---

## Contact Architecture

Full detail: `docs/CONTACT_IMPLEMENTATION.md`.

**No form.** A form with no destination looks functional, accepts a message someone took time to
write, and silently discards it. No `<form>`, no inputs, no submit control, no fake success state.

**No address.** All three in `site.json` are MOCK. The obvious guess is the dangerous one: an
unverified address may belong to nobody — or to somebody else, in which case this site directs
strangers' mail to them. Tests assert no address of any shape, no `mailto:`, and none of five
guessable addresses appears anywhere in the build.

**The single `<input>` in the entire build** is the site header's CSS-only `menu-toggle` checkbox,
which drives the mobile menu with no JavaScript and collects nothing a reader types. A test asserts
this positively, which is a stronger guarantee than "the contact page has no form".

The page is not a dead end: it links to Editorial Standards and the Method.

---

## About Architecture

Full detail: `docs/ABOUT_IMPLEMENTATION.md`.

**Only the name is CONFIRMED.** Bios, expertise and philosophy render under a visible mock notice;
`location` ("Dubai, United Arab Emirates") is on the record and is **not rendered** — a wrong city
would quietly justify climate-based testing claims nobody made.

Asserted absent: degrees, licences, certifications, dermatologist status, years of experience,
awards, press, follower counts, client lists, "as seen in", testimonials. **No social profile is
linked** — every one is `sameAsEligible: false`, and a test asserts no social host appears on any
page.

The page's two outbound links are the **Method** and the **Editorial Standards**. Authority comes
from the protocol being visible and the limits being stated — both checkable. About does not
restate the Method; a test asserts the six stage ids exist on the Method page alone.

The Testing Room language is used **lightly**: no Plate, no Conditions Well, no Disclosure Band. A
narrower column and more air. Not a resume, not a media kit, not a credential wall.

---

## Editorial Standards

Full detail: `docs/EDITORIAL_STANDARDS_IMPLEMENTATION.md`.

Distinct from the Method, and **the page says so first**, in a band above everything else. Five
statements render **verbatim** from `site.json` — nothing is composed in the template, because a
standards page that invents its own standards is the failure it exists to prevent.

The record is `_verification: "MOCK"` ("Proposed standards, not Zina's stated positions"), so a
notice above the statements says they are proposed and unapproved.

**"What this publication does not do"** carries the same visual weight as the commitments and is
never inside a `<details>` — the same move the Method page makes with `doesNotProve`. It states
plainly that there is no laboratory testing, no peer review, no medical review, and that every
observation is one person's experience of one unit of a product.

No institutional or regulatory claim is asserted anywhere outside that limits section.

---

## Legal Foundation

Full detail: `docs/LEGAL_ARCHITECTURE.md`.

**U-03 is unresolved**, so `jurisdictionIsKnown()` is `false` and both documents state, first, that
they are not operative — then list exactly what the owner must supply.

Asserted absent: GDPR, CCPA, PDPL, LGPD, PIPEDA, "European Union", California, "governed by the
laws", "courts of", registered office, company number, VAT, LLC/Ltd, DPO, and every compliance
claim.

**No cookie banner, because there are no cookies.** A banner would ask permission for something
that does not happen — it trains readers to dismiss consent UI and implies tracking that is not
occurring. `USES_TRACKING` is the single constant both pages read.

What the pages *do* assert are statements about the software, each **verified against `dist/`** by
test rather than taken on trust: no scripts, no cookies, no third-party requests, no accounts or
forms, self-hosted fonts.

---

## Navigation Changes

| | |
|---|---|
| **Primary** | Reviews · Method · Journal · Work · About · **Collaborate** (CTA) |
| **Footer** | Reviews · Method · Journal · Brands · Work · Collaborate · Editorial standards · Privacy · Terms |

**Brands stays out of the primary navigation** — Phase 1's IA decision, unchanged and now
re-verifiable: brands are reachable from every review and the reviews index, and two of five do not
qualify in at least one locale.

The Collaborate CTA appeared automatically once `/contact/` was registered; it had been hidden
because a call to action leading nowhere is worse than none.

The contact page reuses the existing label **"Collaborate"** rather than introducing "Contact" as a
second word for the same destination. The route stays `/{locale}/contact/`.

---

## Internal Link Audit

**85 pages, 0 dead links.** Audited over every internal `href` in the build.

| Property | Result |
|---|---|
| Dead internal links | **0** |
| Links to unimplemented routes | **0** |
| Links to a gated brand entity | **0** |
| Cross-locale links | **0** |
| Links to unbuilt work/brand pages | **0** |

The graph now closes: Home → all sections; Review → Brand/Method/Journal; Journal → Review/Brand;
Brand → Reviews/Journal/Work; Work → Reviews/Brand/Journal; About → Method/Standards; Standards →
Method/Reviews; Contact → Standards/Method; Legal → Standards/Contact.

---

## SEO / Entity Audit

Every new page: unique title, unique description, self-canonical, reciprocal hreflang where a
counterpart exists, `x-default`, `noindex, follow` while the source is mock.

**hreflang follows the gate, not the record.** `veloura-beauty` in English emits no `ar` alternate
because no Arabic page exists. The language *switcher* still offers Arabic, landing on
`/ar/brands/` with `data-switcher-state="section-fallback"` — a switcher link is navigation the
reader chose; an alternate is a claim to a search engine that a counterpart exists.

| Surface | Structured data |
|---|---|
| Brands (index + entity) | `BreadcrumbList` |
| Work | `BreadcrumbList` + `Person` (`@id` reference) |
| About | `BreadcrumbList` + `Person` (canonical definition) |
| Contact, Editorial Standards, Privacy, Terms | `BreadcrumbList` |

**Refused everywhere:** `Organization`, `Brand`, `Product`, `offers`, `aggregateRating`,
`reviewRating`, `sameAs`, `CreativeWork`, `ProfessionalService`, `ContactPoint`,
`publishingPrinciples`, `ethicsPolicy`, `interactionStatistic`, `hasCredential`, `alumniOf`,
`award`, `address`, `worksFor`.

`SITE_URL` remains `https://example.invalid` and is still single-sourced — no domain literal exists
in any template or library.

---

## Localization / RTL Audit

Measured in-browser across **80 probes** (8 surfaces × 2 locales × 5 widths), using same-origin
iframes sized exactly.

| Property | Result |
|---|---|
| `lang`/`dir` correct | 40/40 Arabic probes `dir="rtl"` |
| Horizontal overflow | **none** |
| Overflowing elements | **0** |
| Clipped text elements | **0** |
| Bare `<bdi>` | **0** |
| `[dir="rtl"]` override block | none in the codebase |
| Arabic landmark names | authored Arabic — `التنقل الرئيسي`, `مسار التنقل`, `روابط التذييل` |
| Reciprocal hreflang | ✓ on all always-both-locale surfaces |

No translation stub, no machine translation, no route for a missing translation.

> **Arabic editorial quality: UNVERIFIED — HUMAN REVIEW REQUIRED.** Direction, isolation, factors,
> landmarks and layout are measured correct. Editorial quality is a human judgment that has not
> been made. This now also gates Arabic pluralisation (see Defects, below).

---

## Accessibility Audit

Structural audit across 10 representative routes, both locales.

| Property | Result |
|---|---|
| `h1` per page | exactly 1 |
| Heading outline | no skipped level on any surface |
| Landmarks | header, nav ×3, main, section ×2–4, footer |
| Unnamed `<section>` | **0** — every section has an accessible name |
| Nav accessible names | present, unique, in the page's own locale |
| Links without a discernible name | 0 |
| Images without `alt` | 0 |
| Positive `tabindex` | **0** |
| Skip link | present, first, → `#main` |
| `<dl>` structure | every `dl` has `dt` + `dd` |
| Contrast | 24/24 pairs pass, incl. AAA for long-form (16.28:1) |

### Target size (WCAG 2.2 SC 2.5.8) — measured, and it passes via the spacing exception

The probe flagged interactive elements under 24 px tall. Investigated rather than dismissed:

- Breadcrumb links: **24 px** — at the threshold.
- Footer navigation links: **18 px tall**, but **36.8 px centre-to-centre**.

SC 2.5.8 is satisfied when a 24 px circle centred on each target does not intersect another's.
Measured violations: **0**. So the criterion passes **by spacing, not by target size** — worth
recording precisely, because a future layout change that tightens footer spacing would break it.

---

## Screen-Reader Status

> ### **UNVERIFIED — HUMAN REVIEW REQUIRED**
>
> No NVDA, JAWS or VoiceOver pass was performed. What is reported above is an accessibility-tree
> and markup audit, which is **not a substitute** for hearing the pages announced.
>
> Specifically unverified: how the brand relationship band announces its tally followed by the
> unconfirmed-relationship sentence; whether the contact page's stated absence is understood as a
> deliberate state rather than an error; the reading order of the work engagement-terms `<dl>` in
> RTL; and whether the legal "what is missing" list is announced as a list of requirements.
>
> **This is not a pass.** It must be performed by a person before launch.

---

## Responsive Audit

**80 probes: 5 widths (320, 375, 768, 1024, 1440) × 2 locales × 8 surfaces.**

| Criterion | Result |
|---|---|
| Horizontal document scroll | **none at any width** |
| Elements exceeding viewport | **0** |
| Clipped text | **0** |
| h1 wrapping | 1–3 lines, never overflows |
| Breadcrumb wrapping/overflow | 0 overflow |
| Navigation overflow | 0 |
| Forms rendered | 0 |
| Inputs | exactly 1 per page (the CSS menu toggle) |
| RTL order | correct on all 40 Arabic probes |

---

## Performance Audit

| Metric | Value |
|---|---|
| Client JavaScript | **0 bytes**, all 85 routes |
| Third-party requests | **0** |
| Brand entity HTML | 12.9 KB |
| Work index HTML | 13.3 KB |
| About HTML | 14.6 KB |
| CSS | shared, cached across routes |
| Fonts | latin 79.2 KB / arabic 137.5 KB, both within the 180 KB budget |
| Animation libraries | none |
| Hydration | none |

Core Web Vitals **not measured** — payloads are known, field data is not.

---

## Test Results

**345 tests, 78 suites, 0 failures** (up from 244).

| Suite | Tests | Covers |
|---|---|---|
| `brands.test.mjs` | 29 | gate per locale, both `brandDestination` branches, relationship gate, disclosure tally, no fabricated claims, SEO |
| `work.test.mjs` | 25 | figure gate — allowed/blocked/absent, synthetic-fixture leak check, routing, relationships, no fabricated metrics |
| `trust.test.mjs` | 36 | contact absence, no form/endpoint, About credentials, social absence, Standards vs Method, legal blocked state |
| `repository.test.mjs` | 9 | git root, tracked-file safety, remote sanity |
| existing suites | 246 | Phases 4–6, all still passing (2 updated — see Defects) |

---

## Astro Check

```
Result (79 files):
- 0 errors
- 0 warnings
- 0 hints
```

## Production Build

```
85 page(s) built
```

## Mock Guard

```
node tools/check-mock-guard.mjs dist  →  exit 1
This build contains fabricated content and must not be deployed.
```

**Expected and correct.** The guard was not weakened; the new surfaces carry the same
`__MOCK_DATA__` marker as every other page. `npm run verify` therefore exits 1 by design.

## Client JavaScript Audit

```
dist/_astro/*.js          0 files
<script> outside JSON-LD  0 pages
```

---

## Defects Found and Fixed

**1. "1 records" / "1 articles" pluralisation.** Pre-existing on the Phase 5 brand facets and three
Phase 6 journal archives; the new Phase 7 indexes inherited the same strings. Fixed with
`countedNoun()`, which corrects English and **deliberately leaves Arabic unchanged**: Arabic has six
counted-noun forms selected by the number (1; 2 dual; 3–10 plural; 11–99 singular accusative; 100+
singular genitive; 0 its own construction), and choosing between them is an editorial judgement no
native reader has made. The function is the single place those forms will attach.

**2. Two stale Phase 5 assertions.** `brandDestination` "never points at an unbuilt brand page" and
the unimplemented-routes list both asserted a reality Phase 7 changed. **Updated and strengthened,
not deleted** — both `brandDestination` branches are now asserted explicitly plus their mutual
exclusivity, and the registry test gained positive assertions that each newly registered route was
actually emitted in both locales.

**3. Eight of my own test assertions were wrong and were corrected — the code was not.** Worth
recording because several were the same class of error:

- `"Campaign"` flagged inside an SEO title's legitimate phrase "campaign work" → scoped the
  relationship-type scan to the relationship band.
- `"best"` flagged inside "best known for", `"shop"` inside "harder to shop online" → commerce is a
  link or a control, not a word.
- `hreflang="ar"` flagged on the language **switcher** → the check now targets
  `<link rel="alternate">`, since a switcher link is navigation and an alternate is a claim.
- `<input>` flagged on the CSS-only menu toggle (twice) → scoped to `<main>`, plus a positive
  whole-build assertion that the only input is that toggle.
- `"message sent"` flagged inside the honest explanation "a message sent to it would simply
  disappear" → a success *state* is a confirmation, not a phrase.
- `"views"` flagged inside "**Re**views" in the nav → word boundaries. **This is the second time
  this exact substring bug has occurred** (first in Phase 5).
- A third-party-request check flagged `<link rel="canonical">` → canonical and alternate carry
  absolute URLs and fetch nothing; only stylesheets, scripts, images and frames make requests.

---

## Known Limitations

| # | Limitation | Severity |
|---|---|---|
| 1 | **Screen-reader behaviour unverified** | **Must resolve before launch** |
| 2 | Production origin is `https://example.invalid` (U-01) | **Blocking** |
| 3 | Jurisdiction unknown (U-03) — no legal content possible | **Blocking** |
| 4 | **No verified contact channel** — the site offers no way to reach its author | **Blocking** |
| 5 | Arabic copy unreviewed by a native reader; now also gates pluralisation | High |
| 6 | No brand relationship is confirmed, so all seven bands are structurally identical | Expected |
| 7 | All five result figures blocked; the `allowed` branch has no production fixture | Expected |
| 8 | Entire About biography, portrait and location are placeholders | High |
| 9 | Editorial standards are unapproved drafts | High |
| 10 | No work media renders — every asset path is a placeholder | Medium |
| 11 | WCAG 2.2 target size passes by **spacing**, not size — tightening footer spacing would break it | Medium |
| 12 | Core Web Vitals not measured | Medium |
| 13 | `terra-sana` has no page; `veloura-beauty` none in Arabic | Correct, per gate |
| 14 | No sitemap, robots.txt or RSS | Deferred to Phase 8 |

---

## Human Review Required

Explicitly **not verified** by this phase:

- **Arabic native editorial review** — H-1, standing since Phase 3
- **Real screen-reader testing** — H-2
- **Core Web Vitals** — measured payloads only
- **Production domain** — U-01, blocking
- **Legal jurisdiction** — U-03, blocking; and the legal text itself must be written or reviewed by
  a qualified professional
- **Real contact details** — blocking
- **Verified social accounts** — all `sameAsEligible: false`; none linked
- **Real methodology** — the six stages remain **PROJECT MOCK METHOD**
- **Real photography** — every image path is a placeholder with no asset on disk
- **Real result figures** — all five blocked; none invented

---

## Decisions Required From Owner

See `docs/PHASE_7_DECISION_LOG.md` H-1…H-10.

| # | Decision |
|---|---|
| H-3 | Production domain (U-01) |
| H-4 | Jurisdiction (U-03) and legal entity |
| H-5 | A verified contact channel |
| H-6 | Written confirmation of each brand relationship, before any label renders |
| H-7 | Approval of each of the five editorial standards |
| H-8 | Real biography, portrait and location |
| H-9 | Whether any result figure can be sourced — permanently showing none is an acceptable end state |
| H-10 | Confirm or replace the six-stage Method |
| — | Whether curation may surface non-citing articles under "From the Journal" (carried from Phase 6) |

---

## Recommended Phase 8

The site is now structurally complete: every surface the Phase 1 IA declares is built, and the
internal link graph closes with zero dead links.

**Recommendation: Phase 8 should be discovery and syndication — sitemap, `robots.txt`, RSS — and
nothing that touches content.**

The reason is the gating logic already written for it. `indexableJournalCategories()`,
`brandIsIndexable()` and `IS_INDEXABLE_BUILD` exist and are tested; a sitemap consumes them rather
than re-deriving the rules. That work is self-contained, adds no client JavaScript, and cannot
introduce a content claim.

**It should not begin with real-content migration.** Four blocking unknowns (U-01 domain, U-03
jurisdiction, contact channel, Method confirmation) are owner decisions, and three of the four
change what the pages say rather than how they are built. Migrating content before those are
settled would mean doing it twice.

One caution for whoever writes Phase 8: a sitemap is the first artefact that *asserts* which pages
should be indexed. While `SITE_URL` is `example.invalid` and the mock guard blocks, a sitemap is
architecture only — it must not be treated as launch readiness.

**Phase 7 is complete. No Phase 8 work has begun.**
