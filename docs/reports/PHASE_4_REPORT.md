# Phase 4 — Completion Report

**Production foundation and the first implemented experience: the review page**

| | |
|---|---|
| **Status** | Complete |
| **Phase** | 4 — production foundation |
| **Date** | 2026-09-10 |
| **Overall confidence** | **High** on the foundation, the review page, bilingual/RTL correctness, content safety and the test suite. **Medium** on performance (payloads measured, Core Web Vitals not) and accessibility (structure measured, no screen-reader pass). **Blocked** on the domain (U-01) for correct canonical URLs |
| **Application built** | **Yes.** Astro 5.18 + TypeScript. 12 pages, 17 components, 98 tests, **0 bytes of client JavaScript** |
| **Next phase begun** | **No.** Stopped at the Phase 5 gate |

---

## 1. Executive Summary

Phase 4 turned three phases of specification into a running bilingual application and implemented
the canonical review experience. **The foundation reproduces the approved UX faithfully**, and the
review page works in Arabic and English from 320px to 1440px with no horizontal overflow, no
reversed numeric ranges, no clipped Arabic, and no JavaScript.

**Four things define the phase.**

**The Phase 3 bidi correction is implemented and locked in.** `src/lib/bidi.ts` isolates the
numeric run only — `<bdi dir="ltr">34–38</bdi> °م` — and the build output contains **zero bare
`<bdi>` elements**. Twenty tests guard it, because a regression is a factual error in a published
record rather than a cosmetic one.

**Tooling found four real defects that reading the code would not have.** A budget check caught the
Arabic font payload 15% over budget; a browser measurement caught every full-bleed element
overflowing the document by ~15px; inspecting the built HTML caught Arabic text labelled
`lang="en"`; and reading the mock-guard output critically revealed that it was passing only because
the mock data happens to contain `example.com` URLs.

**Mock-content safety is now content-independent.** Every page carries a machine-detectable
`__MOCK_DATA__` marker, so any build from the mock layer fails the guard **regardless of what the
components render**. Verified in both directions: BLOCKED on the real build, CLEAN on the same
template with verified content.

**The implementation is smaller than the specification allowed.** Zero JavaScript against a 10 KB
budget. 79 KB of fonts against 180 KB. Six production dependencies, five of which are font files.

---

## 2. Repository Safety Status

**R-07 remains open. Nothing was initialised, staged or committed.**

```
$ git rev-parse --show-toplevel
C:/Users/Lenovo

$ git log --oneline -1
fatal: your current branch 'master' does not have any commits yet

$ ls -la .git
ls: cannot access '.git': No such file or directory
```

The detected repository root is still the user's **home directory**. There is no project-local
`.git`, and there are no commits.

**Per the brief §3, and unchanged from Phase 3:**

- No `git init`. No `git add`. No `git commit`. No change to the global configuration.
- No file outside the project directory was created, modified or read for modification.
- Implementation was safely restricted to
  `.../zina-almokri-premium-website-md/zina-almokri-premium-website-md/`.
- A `.gitignore` was written **inside the project**, ready for a repository that does not yet exist.

**Why this now matters more than it did in Phase 3.** Phase 3 added documentation. Phase 4 added
**4,691 lines of source across 30 files**, plus a `node_modules` tree and a `dist/` output. None of
it is under version control. There is no diff, no history, no branch, no way to review a change,
and no protection against loss — and *"detectable in a diff"* is the stated enforcement mechanism
for several of this system's strongest rules (radius, shadows, limitations weight).

**Version control must be established before deployment, and should be established before Phase 5
writes another line.** That is the user's decision to make and to execute.

---

## 3. Technology Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | **Astro 5.18.2** | Zero JS by default, file-based routing, scoped CSS, static output |
| Language | **TypeScript strict** | Plus `noUncheckedIndexedAccess` — the content model is a partial locale map, and without it a missing translation is a runtime `undefined` rather than a compile error |
| Output | **Static** | Every page is a document |
| Styling | **Plain CSS + custom properties** | 12 token groups, 17 components. A framework solves a problem this size does not have |
| Fonts | **Self-hosted, script-generated** | True locale splitting; see §7 |
| Testing | **`node --test`, zero deps** | Node 24 strips TypeScript natively, so tests import the same modules the bundler compiles |

**Dependencies: 6 production** (`astro` + 5 `@fontsource` packages, which are OFL font assets, not
code) **and 2 dev** (`@astrojs/check`, `typescript`).

**No prohibited dependency was added:** no React, Vue, Svelte, Solid, Tailwind, Bootstrap, MUI,
component library, animation library, WebGL, Three.js, GSAP, Framer Motion, or state manager.

---

## 4. Project Structure

```
src/
  lib/          content.ts · routing.ts · seo.ts · bidi.ts · ui-strings.ts
  types/        site.ts
  styles/       tokens.css · global.css
  layouts/      BaseLayout.astro
  components/   shell/ (5) · devices/ (5) · review/ (5) · media/ (1)
  pages/        [locale]/reviews/[slug].astro · [locale]/404.astro
public/fonts/   GENERATED — 7 woff2, 2 stylesheets, 5 licences
scripts/        build-fonts.mjs
tests/          bidi · content · output
content/        UNCHANGED from Phase 1
tools/          UNCHANGED — the four Phase 0–3 validators
```

**`src/lib/` is the architecture.** Templates ask questions and render answers; no template
computes a gate, filters a locale, or builds a URL by concatenation. That is what will make the
next five templates cheap.

**Components are grouped by role, not type**, and nothing was abstracted before a second use case
existed. Full rationale in `docs/IMPLEMENTATION_ARCHITECTURE.md`.

---

## 5. Content Architecture

**The Phase 1 schema was not rewritten.** `content/schema/types.ts` is re-exported, not restated.
Astro content collections were **rejected** (D4-2) because zod schemas in `src/content/` would
create a second definition of every entity, validated by a second validator, and the drift would be
silent.

All seven lifecycle states preserved, none flattened. `published` and `archived` are the only
publishable states, enforced in the access layer so a draft never reaches a template.

**Five hard render gates implemented and tested:** disclosure pending verification, testimonial
approval, brand relationship confirmation, results-figure source, and `sameAs` eligibility. Today
that means **no testimonial renders, no press renders, no social row exists, and the unverified
location appears neither on the page nor in the schema**.

Locale coverage is deliberately uneven and every state is exercised — see §6.

---

## 6. Locale Architecture

**Six review records produce TEN routes, not twelve.**

| Record | `/en/` | `/ar/` |
|---|---|---|
| Voile Lumiere, Nuit Barrier, Cils Infini, Sitara | yes | yes |
| **Velvet Hour Lip Cream** | yes | **no route** — English-only |
| **Verdure Cloud Balm** | **no route** — Arabic-original | yes |

The missing-translation rule proves itself in the build log, and is asserted three ways: route
generation, absent directories in `dist/`, and hreflang output.

| Rule | Implementation |
|---|---|
| No route | `getStaticPaths` derives from actual locale content |
| No hreflang | `alternatesFor()` emits from `locales` keys — reciprocal or nothing |
| No stub | No code path exists |
| No machine translation | No code path exists |
| Switcher never 404s | Three states: counterpart → section index → locale home |

**RTL is CSS logic, not a mirrored stylesheet.** There is **no second stylesheet and no
`[dir="rtl"]` block anywhere** — the entire Arabic layout comes from `dir="rtl"` plus two custom
properties re-declared at the locale root. The margin index lands on the correct side in both
directions from logical properties alone.

---

## 7. Typography Implementation

**Zarid is NOT licensed and is NOT included.** No Zarid file is downloaded, bundled or referenced.
The documented open-source fallback tier ships instead: IBM Plex Serif / Sans / Sans Arabic / Mono
and Noto Naskh Arabic — **all SIL OFL 1.1, self-hosted, with licences redistributed**.

Swapping in Zarid later is **two lines in `tokens.css`** plus the font files. No component changes.

| Locale | Faces | Payload | Budget |
|---|---|---|---|
| en | Plex Serif 400*, Plex Sans 400*, Plex Sans 500, Plex Mono 400 | **79.2 KB** | 180 KB |
| ar | Noto Naskh 400*, Plex Sans Arabic 400*, Plex Sans Arabic 500, Plex Mono 400 | **151.9 KB** | 180 KB |

*preloaded.

**The budget check found a real problem** (C4-2): shipping all declared weights put Arabic at
207.2 KB. Auditing usage showed the 600 weights are referenced nowhere — "no weights below 400" is
a floor, not an instruction to use the ceiling. **A face now ships only when something uses it.**

**The bidi correction is implemented, and it is the most important code in the phase.**

| Input | Output |
|---|---|
| `34–38 °م` | `<bdi dir="ltr">34–38</bdi> °م` — Arabic unit **outside** |
| `34–38 °C` | `<bdi dir="ltr">34–38 °C</bdi>` — Latin unit safe inside |
| `34 to 38 degrees Celsius` | unchanged — **prose is left alone** |

**Zero bare `<bdi>` elements in the entire build output.** Twenty tests guard it.

---

## 8. Design Token Implementation

`src/styles/tokens.css` is a 1:1 implementation of `docs/DESIGN_TOKENS_SPEC.md`. Semantic names
throughout; there is no `--black-900` and there must not be.

**Three tokens encode a refusal:** `--shadow-none` (the only shadow token), `--radius-none` (with
no third radius), and `--type-tracking-arabic` fixed at 0 at the locale root.

**Verified:** `tools/check-contrast.mjs` passes all 24 pairs, and `tests/output.test.mjs` asserts
the built CSS contains **no `border-radius` other than 0 or 2px** and **no `box-shadow` that is not
the `inset` hollow-marker border**.

Reduced motion is a **token-level** override, so it cannot be forgotten per component.

---

## 9. Component Implementation

**17 components. There is no `Card`.**

| Group | Components |
|---|---|
| **Devices (5)** | DisclosureBand · ConditionsWell · ObservationTimeline *(with the margin index)* · ClaimBlock · VerdictBlock · Plate |
| **Shell (5)** | SiteHeader · SiteFooter · LocaleSwitcher · SkipLink · Breadcrumbs |
| **Review (5)** | TestingSummary · MethodRelationship · Assessment · ProductContext · RelatedContent |
| **Media (1)** | Frame |

Three contained surfaces exist, each documented in Phase 3: suitability, related content, mobile
menu. Everywhere else uses the index treatment — image, hairline, type.

**Props are content-shaped.** No `variant`, no `size`, no `theme`. Thirteen Phase 3 components were
**not** built because no template needs them yet; each deferral is "no caller", not "no time".

---

## 10. Review Page Implementation

Twenty sections in fixed order, identical in both locales and at every breakpoint.

Breadcrumb → product identity → title/subtitle → **disclosure band** → hero → testing summary →
introduction → testing context → **conditions well** → **method stages** → **observations** →
**evidence plates** → assessment → suitability → **verdict** → conclusion → update log →
product details + **brand claims** → comparison → related.

**Non-negotiables, all implemented and tested:**

- Disclosure band **above the hero**, present at first paint, never truncated — asserted by DOM
  index comparison on all ten pages.
- Limitations at **identical** treatment to strengths — same family, size, colour, column width.
  There is deliberately no per-list override to remove.
- **All six method stages render**, applied filled and unapplied hollow, with the status in the
  accessible name.
- The verdict is an `h2` despite being the largest text.
- Brand claims are last, quietest, dotted-ruled.
- **No score, star, rating or badge** anywhere.
- The brand link is a function of the per-locale gate (R-14) — no page links to a gated brand.

---

## 11. Responsive Verification

Measured in Chrome against the built output, both locales, at five widths.

| Width | en overflow | ar overflow | Margin index | Conditions aligned | Band clipped |
|---|---|---|---|---|---|
| 320 | none | none | inline | yes | no |
| 375 | none | none | inline | yes | no |
| 768 | none | none | inline | yes | no |
| **1024** | none | none | **column, inline-start** | yes | no |
| 1440 | none | none | **column, inline-start** | yes | no |

**No horizontal overflow at any width in either direction**, after the full-bleed fix (C4-3).
Type-size floor violations: **0** at every width in both scripts.

---

## 12. Arabic Verification

| Check | Result |
|---|---|
| `dir="rtl"` / `lang="ar"` | Correct on every Arabic page |
| Letter-spacing violations | **0** at all five widths |
| Margin index side | **Right** at 1024 and 1440, from logical properties alone |
| Numeric ranges reversed | **None** — zero bare `<bdi>` in the output |
| Arabic text labelled English | **None** — fixed during the phase (B4-1) |
| Conditions numerals aligned | Yes, all rows, all widths |
| Disclosure statement clipped | No |
| Header height | **88px in both locales** — reserved for the Arabic line box, so it does not change on language switch |
| Latin identifiers in Arabic prose | Isolated with `lang="en"` |
| Size / leading factors | ×1.12 / ×1.18 applied at the locale root |

Visual inspection at 1400px confirmed the observation timeline renders as designed: margin index on
the right, mineral rule at the inline start, numerals in mono in correct order, `22W` isolated
inside Arabic prose.

---

## 13. SEO Foundation

Implemented: verbatim titles, descriptions, absolute self-referencing canonicals, reciprocal-or-
nothing hreflang with `x-default`, robots directives, Open Graph, Twitter card degrading to
`summary` with no image, and three JSON-LD types.

**The absences are the decisions**, and all are asserted in tests: **no `reviewRating`**, no
`aggregateRating`, no `offers`, no standalone `Product`, no `sameAs`, no unverified location.
Nothing fabricated.

**Blocked on U-01.** `site` is `https://example.invalid` — a deliberately invalid TLD so a
placeholder can never be mistaken for a real domain. Every canonical and hreflang URL is
structurally correct and factually wrong until the domain is known.

---

## 14. Accessibility

**Measured:** 0 positive `tabindex`; exactly one `h1` per page; **0 heading level skips**; the skip
link is first in tab order in both locales; three uniquely named `nav` landmarks; the conditions
table has 4 row headers and a caption; observations are an `<ol>`; **0 `<details>` elements**;
**0 images without alt**; 24/24 contrast pairs pass.

**The three voices carry six signals, of which colour is the sixth** — text label, semantics,
typeface, rule style, size, colour. Five survive greyscale, five survive forced-colors, and the
first two are sufficient for a screen reader.

**Not tested:** no screen reader has run over this in either language; **the Arabic screen-reader
pass has not happened**; no axe-core audit; forced-colors rules are written but unverified on
Windows High Contrast.

---

## 15. Performance

| Metric | Budget | Measured |
|---|---|---|
| Review-page JS | ≤10 KB | **0 bytes** |
| Fonts per locale | ≤180 KB | **79.2 / 151.9 KB** |
| Total page | ≤1 MB | **≈127 KB (en) / 203 KB (ar)** |
| Paper grain | ≤4 KB | **0 KB** — generated in CSS (D4-5) |
| LCP / INP / CLS | targets set | **Not measured — Phase 9** |

CLS is prevented structurally: dimensions are required by the type system, `Frame` reserves space
by aspect ratio, and there are no late-injected banners. Font swap remains the largest named CLS
risk, mitigated by metric-matched fallbacks and preloading the two first-paint faces.

---

## 16. Testing

**98 tests, all passing**, in three files, with **zero dependencies**.

| File | Tests | Covers |
|---|---|---|
| `bidi.test.mjs` | 20 | The Phase 3 correction, identifier script detection, record markers |
| `content.test.mjs` | 40 | Locale availability, route generation, hreflang, the switcher's three states, lifecycle, brand gate per locale, the five render gates, related-content locale filtering, site-config shape, **no numeric ratings** |
| `output.test.mjs` | 38 | The built HTML: routes, lang/dir, headings, fonts, metadata, JSON-LD absences, bidi, evidence layer, gated links, **zero JS**, radius, shadows, mock markers, images |

**No test asserts a constant.** Every one asserts a behaviour or a property of real output.
Three of my own assertions were wrong on first run and were corrected — including one arithmetic
identity that could never have failed.

---

## 17. Browser Verification

Chrome, against the built output served locally. Ten combinations: two locales × five widths, plus
focus-order and heading-structure passes in both locales.

**It found the single worst bug in the phase** — every full-bleed element overflowing the document
by ~15px at every width, invisible in code review because the CSS was the conventional recipe. It
also confirmed the margin-index collapse, the RTL index side, numeral alignment, and the constant
header height across locales.

Screenshots were captured during the session as development verification artefacts;
`verification/screenshots/` is gitignored. The measured JSON tables in §11–12 are the durable
evidence.

---

## 18. Mock Content Safety

**The mock guard correctly BLOCKS the build**: 22 traces, exit 1.

Four independent mechanisms, and the fourth was added because the first three were **not
sufficient**: the guard was passing only because mock brands happen to use `example.com` URLs — a
property of the content, not the build. Every page now carries the literal `__MOCK_DATA__` in an
HTML comment while the source is the mock layer.

**Verified in both directions:**

| Run | Result |
|---|---|
| `check-mock-guard.mjs dist` | **BLOCKED**, exit 1 ✓ |
| Same page, mock marker and example URLs removed | **CLEAN**, exit 0 ✓ |

The second proves the guard detects the content **source**, not the templates.

**No visual treatment for mock content, deliberately.** A badge would imply mock content can ship
if labelled. `npm run verify` fails at the guard today — that is the pipeline working.

**The Method is a PROJECT MOCK METHOD.** No copy describes it as official, proprietary, clinical,
validated, certified or proven, in either language.

---

## 19. Known Limitations

1. **Links to unbuilt routes 404.** Breadcrumb, header, footer and the Method link all point at
   routes Phase 4 did not build. Paths are correct and centralised; they start working as each
   template lands.
2. **No `/` route.** Root locale negotiation is a 302 by `Accept-Language`, which a static build
   cannot do. It is host configuration, deliberately not faked with a meta-refresh or JS redirect.
3. **Placeholder domain** (U-01).
4. **No image optimisation**, because there are no images.
5. **No scroll-triggered animation** (D4-7) — the page is stiller than Phase 3 specified.
6. **~40 Arabic UI strings are unreviewed** by a native reader (Q3-2/Q3-6).
7. **Journal bodies are still JSON outlines**; MDX lands with the journal template.
8. **No screen-reader testing**, in either language.

---

## 20. Open Questions

| # | Question | Status |
|---|---|---|
| **U-01** | The production domain | **Blocking correct canonicals and hreflang since Phase 0** |
| **Q3-3** | Does Zina already have a testing method? | **Unanswered since Phase 0.** Now the spine of four architectures |
| **Q3-1** | Can Zarid be licensed? | Unanswered. The fallback is implemented and legal |
| **Q3-2 / Q3-6** | Native Arabic review of interface strings | Unanswered |
| **U-02** | Verified social URLs | The footer social row does not exist without them |
| **U-03** | Legal jurisdiction | Blocks the privacy page and the analytics decision |
| **New** | Reinstate scroll-triggered animation? | D4-7 |

---

## 21. Decisions Requiring Approval

| # | Decision | Why it needs a human |
|---|---|---|
| **D4-2** | Not using Astro content collections | It is the idiomatic path; a future engineer will ask why. Two schemas would drift silently |
| **D4-7** | No scroll-triggered entrance animation | Phase 3 specified it. Reinstating costs ~3 KB of JS on a zero-JS page |
| **D4-9** | Placeholder domain | U-01 blocks the SEO foundation from being finished |
| **D4-3** | Dropping the 600 font weights | Re-audit if Zarid is licensed |
| — | Arabic UI strings | Ordinary chrome, not claims, but unreviewed |

---

## 22. What Was NOT Implemented

Per the brief's stop conditions:

- **No homepage.** No journal, product, brand, work, contact, about, method, reviews-index or
  editorial-standards page.
- No CMS, backend, authentication, database, analytics or tracking.
- No 3D, WebGL, video, animation library, design-system package or UI kit.
- No sitemap or robots.txt (Phase 8).
- No search (architecture specified in Phase 3; activation at ~200 reviews).
- No image optimisation pipeline (no images exist).
- **Phase 5 not begun.**

Also not done, and worth stating:

- **No repository.** R-07 is open and was not actioned.
- **No screen-reader pass**, in either language.
- **No performance measurement.** No Lighthouse, no field data.
- **No client review** of the implementation.

---

## 23. Phase 5 Recommendation

**Proceed to Phase 5**, but do these four things first, in order:

1. **Establish the project repository.** 4,691 lines are now unversioned, and *"detectable in a
   diff"* is the enforcement mechanism for several of this system's strongest rules. This is the
   highest-value action available and it costs minutes.
2. **Answer U-01.** Every canonical and hreflang URL in the build is currently a placeholder. It is
   one line of config and it unblocks the entire SEO foundation.
3. **Ask Zina about the Method.** Unanswered since Phase 0, and it is now the spine of the IA, the
   visual system, the UX and the implementation.
4. **Get the Arabic interface strings and the type proof in front of a native reader.** Cheap,
   fast, and the only way to close criterion 10.

**Then build the next templates in this order**, because each one exercises something the review
page did not: `/reviews/` index (crawlable facets — R-15, the largest untested architectural
decision), `/method/` (the destination of the most-repeated link on the site), `/{loc}/` homepage
(States A and B), then journal, brand, work, contact.

### Suggested handoff context for Phase 5

> Phase 4 is complete. Read `docs/reports/PHASE_4_REPORT.md`, then
> `docs/IMPLEMENTATION_ARCHITECTURE.md`, `docs/COMPONENT_IMPLEMENTATION.md` and
> `docs/PHASE_4_DECISION_LOG.md`.
>
> An Astro foundation exists with the review page fully implemented, bilingual, RTL-correct,
> zero-JS, and covered by 98 tests. **Three Phase 2/3 assumptions were corrected by tooling** and
> are recorded as C4-1, C4-2 and C4-3.
>
> Run `npm run verify` before and after any change. It fails at the mock guard today, by design.
>
> Build the reviews index next. **Facets must be crawlable server-rendered URLs, not client
> state** (R-15). Do not add a UI framework, an animation library, or a `Card` component.
>
> Report to `docs/reports/PHASE_5_REPORT.md`.

**Phase 5 has not been started.**
