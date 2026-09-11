# Phase 0 — Completion Report

**Project discovery, architecture intelligence and mock content foundation**

| | |
|---|---|
| **Status** | Complete |
| **Phase** | 0 — Project intelligence |
| **Date** | 2026-09-07 |
| **Overall confidence** | **High** on repository audit, content architecture, mock data, IA and technical recommendation. **Medium** on SEO priorities (no volume data obtained). **Low-medium** on competitive research (partial — see the scope statement). |
| **Website built** | **None.** Correct for this phase |
| **Next phase begun** | **No.** Stopped at the handoff gate as instructed |

---

## Executive Summary

The repository contained an unusually good specification set and zero implementation. Phase 0
built the layer beneath a website rather than any part of the website: a validated content model,
a complete fictional dataset exercising every template the site will need, an information
architecture argued route by route, an SEO and entity strategy, a design proposal, a technical
recommendation, and two executable tools that turn "do not ship fabricated content" from a policy
into a build failure.

**Three findings matter more than the rest.**

**1. The editorial requirements and the SEO requirements are the same requirements.** Google's
review system rewards first-hand experience: original photography, measurable observations, real
testing, honest acknowledgement of limitations. Those are also the things that make a review worth
reading. There is no trade-off to manage, which is rare, and it means the content model can serve
both with one design.

**2. The differentiator is the method, not the person.** Most creator sites are media kits or
neglected blogs. What Zina can own is a named, published, repeatable testing protocol. Phase 0
made it a first-class entity, gave it a pillar page, designed the review template around it, and
built the validator to enforce it. Everything else follows from that.

**3. The main risk is not technical.** The architecture will carry hundreds of reviews. The risk
is that real content never arrives. There is no verified biography, no confirmed social account,
no domain, no photography, and no record of what Zina has actually tested. A premium architecture
holding placeholders is worth nothing, and the client verification list is the critical path.

**Master document: `docs/PROJECT_DISCOVERY.md`.**

---

## Repository Audit

The repository contained 14 Markdown files and nothing else. No framework, package manager,
build system, routing, styling, components, pages, APIs, CMS, tests, linting, TypeScript config,
CI, deployment configuration, environment files, or assets of any kind — not a single image or
font.

**No destructive changes were made.** Nothing existed to overwrite. All Phase 0 output is new
files in new directories (`content/`, `tools/`, `docs/reports/`).

Two findings require action:

**F-01 — This project is not its own git repository.** `git rev-parse --show-toplevel` returns
`C:/Users/Lenovo`. The entire home directory is the repo; the project sits inside it. There are
**no commits on `master`**, and `git status` reports thousands of untracked files including
`.ssh/` and `.git-credentials`. A `git add -A` from here would stage credentials.
*Recommendation: `git init` inside the project directory with a proper `.gitignore` before any
Phase 1 work.* **Not done — initialising a repository and committing are your call, not mine.**

**F-02 — The existing documentation is the project's strongest asset.** The nine specification
documents are coherent and opinionated and were treated as authoritative. Where this phase departs
from or qualifies a spec, it says so explicitly.

Local environment verified: Node v24.11.1, npm 11.6.2, git 2.50.1.

---

## Content Architecture

Full specification: **`docs/CONTENT_MODEL.md`**. Types: **`content/schema/types.ts`** (352 lines,
zero dependencies, framework-agnostic).

Eleven entities: `Person`, `SocialProfile`, `Brand`, `Product`, `Review`, `Work`,
`JournalArticle`, `PressItem`, `Testimonial`, media assets, site configuration.

Four decisions define it:

1. **Content never lives in components.** This makes mock-to-real a data swap, not a rewrite.
2. **Provenance is a field.** `_verification` on every record makes
   `docs/CONTENT_VERIFICATION_MATRIX.md` machine-readable, so a build can refuse to ship an
   unverified value.
3. **Claims, observations and verdict are separate fields on separate entities.** A template
   cannot blur brand marketing into a finding. This is simultaneously the credibility mechanism
   and the SEO mechanism.
4. **Relationships are id references**, so the internal-link graph is derivable and provable.

The validator enforces editorial rules a code review would not reliably catch: minimum three
observations per review, both pros and cons, both who a product suits and who it does not,
disclosure above content, dates in a possible order, no medical language, no absolute suitability
claims, no orphan reviews, no dangling references.

---

## Mock Data Architecture

**41 records across 10 files in `content/mock/`.** Migration procedure:
**`docs/REAL_CONTENT_MIGRATION.md`**.

### Reconciling the mock brief with the "no invented facts" rule

The repository docs forbid inventing facts; this phase's brief asks for a fictional dataset. The
reconciliation is the governing principle of the layer:

> Fabrication is dangerous when it is indistinguishable from fact and can reach a reader. Mock
> content that is machine-detectable, quarantined, marked at four independent levels and blocked
> by a build gate is a fixture. It becomes a fabricated fact only when it can be published, and
> the guard makes that impossible.

Nothing in `content/mock/` is presented as true, in the data or in any document.

### Contents

| Collection | Records | Notes |
|---|---|---|
| Person | 1 | 5 bios (en + ar), expertise, philosophy, six-stage testing protocol |
| Social profiles | 5 | Instagram, TikTok, YouTube, Snapchat, Pinterest — all `sameAsEligible: false` |
| Brands | 5 | All fictional. **No real company is named anywhere in the dataset** |
| Products | 6 | Foundation, Serum, Lip, Mascara, Moisturizer, Concealer |
| Reviews | 6 | Full testing data, timed observations, 4 distinct disclosure types |
| Work | 4 | Product Launch, Editorial Series, Social Campaign, Beauty Campaign |
| Journal | 6 | 2 pillar, 4 supporting |
| Press | 4 | Fictional outlets. Flagged as the highest-risk file in the project |
| Testimonials | 3 | Attribution is the literal string `MOCK NAME`, never an invented human name |
| Site | 1 | Domain, nav, contact, legal, locales, editorial standards |

Requested minimums were met or exceeded: 6 products (6 required), 6 reviews (6), 5 brands (5),
4 work projects (4), 6 journal articles (6).

### Fixtures designed to break templates early

- **Four disclosure types**, including a paid partnership on a critical review, and a two-part
  disclosure (PR sample plus a separate paid project with the same brand).
- **One work project with an empty `results.figures` array** — real clients often supply no
  numbers, and that state must look intentional rather than broken.
- **Two reviews that state what the test could not determine**, including a "72 hours of
  hydration" claim explicitly marked as untestable by wear testing.
- **A mock award that is a shortlisting, not a win**, carrying a warning against upgrading it.
- **An Arabic-script outlet name inside an otherwise Latin list**, forcing RTL-in-LTR handling.
- **`brandClaims` holding unfalsifiable marketing language** ("5x volume") that the review
  declines to repeat as a measurement.

### Four detection mechanisms

`__MOCK_DATA__` file marker · `_mock: true` record marker · `mock-` id prefix · placeholder URLs
on `example.com` / `.mock` hosts. Plus `_verification: "MOCK"` and the `MOCK NAME` string. Any one
alone blocks a build.

---

## Proposed Sitemap

Full per-route rationale — purpose, audience, SEO intent, conversion role, content, internal
links: **`docs/SITEMAP_PROPOSAL.md`**.

```
/  /about  /reviews  /reviews/[slug]  /brands  /brands/[slug]
/work  /work/[slug]  /journal  /journal/[slug]
/editorial-standards  /contact  /privacy  /terms  /404
/sitemap.xml  /robots.txt
```

Three departures from the master spec's candidate list, each argued:

- **Added `/editorial-standards`** — disclosure, corrections, medical boundary, AI position at a
  real indexable URL. One page; it substantiates the whole positioning. The highest-value addition
  available.
- **`/brands` gated behind two published reviews per brand** — below that it is a thin page
  existing only as an SEO surface, which the SEO strategy forbids. Until then a brand is a filter
  value.
- **`/press` deferred** until three verified mentions exist, as the spec itself suggests.

`/products/[slug]` was evaluated and **rejected**: manufacturer description plus a link is exactly
the thin-content pattern the strategy prohibits.

The mock internal-link graph has **zero orphans**, verified by the validator.

---

## SEO Strategy

Summary in `docs/PROJECT_DISCOVERY.md` §8. Entity work: **`docs/SEO_ENTITY_STRATEGY.md`**.

**Product reviews are the acquisition engine** — long-tail, high-intent, product-specific, in both
languages. Every review is a landing page.

**Four defensible seams**, ranked by absence of credible competition: climate-conditioned
performance; shade accuracy for medium-deep warm and olive undertones; claim verification as a
repeatable format; failure diagnosis.

**The entity is the long game.** One `Person` node, one canonical name in two scripts, a `sameAs`
graph containing only confirmed official profiles. `sameAsEligible` is `false` on every mock
profile and the validator fails the build if that is changed while the data is mock.

**Structured-data constraints verified against Google Search Central**, not assumed. Review
snippets require `author`, `itemReviewed` and `reviewRating`. Zina reviewing third-party products
is permitted — the self-serving restriction applies to entities reviewing themselves. But:
**never emit standalone `Product` schema** (she is not the seller), **never emit
`AggregateRating`** across her own reviews, never aggregate from other sites, and everything
marked up must be visible on the page.

**One architectural SEO requirement:** review filters must be crawlable server-rendered URLs, not
client-only state, or the corpus becomes reachable only through the sitemap.

---

## Keyword / Topic Map

**`docs/SEO_KEYWORD_MAP.md`** — 38 rows in the required
`Cluster | Search Intent | Example Query | Target Page | Priority` format, across brand (Latin and
Arabic), product review (both languages), brand entity, category, method, problem-led,
climate-specific, shade-range, comparison and B2B clusters.

> **No search volume data was obtained.** No keyword tool or Search Console property was available
> in Phase 0. Every query is a **hypothesis about intent**; the priority column ranks **strategic
> value**, not measured demand. Section 7 of that document is the validation plan. Nothing in it
> should be quoted to a client as researched volume.

Also documented: pillar/supporting architecture (4 pillars), long-tail opportunities, six content
gaps, internal-link opportunities, and a SERP-feature assessment identifying **image packs as the
strongest realistic opportunity** given original swatch and comparison photography.

**Arabic intent was researched rather than translated** (sources cited): Gulf, Levantine and North
African users search differently; code-switching is normal, so product names should stay in Latin
script inside Arabic content; Arabic queries skew longer and more conversational; MSA suits formal
pages, dialect suits conversational search. The correct dialect depends on where Zina's audience
is, which is unknown.

---

## Competitive Research

**`docs/COMPETITIVE_RESEARCH.md`**, which opens with an explicit scope statement.

**What was done:** five web searches covering the beauty website landscape, Google's current
treatment of review content, Arabic search behaviour in Gulf markets, and framework selection.
Findings are marked **[researched]** with sources.

**What was not done, and must not be represented as done:** no competitor site was crawled,
audited or measured; no traffic, ranking or backlink data was obtained; **no Arabic-language
beauty creator site was examined** (search results were US-region, a material limitation for this
project); no named individual creator was assessed. Section 6 is the research plan for the rest.

Established findings:

- **Creator sites are almost always** a link-in-bio page, a media kit, a neglected blog, or —
  rarely — an owned editorial property. The brief asks for the fourth, which requires a repeatable
  method rather than a personality. Zina has one; that precondition is already met.
- **Roughly three in four beauty websites use a pale ground**, with dark reserved for editorial
  positioning [researched]. A dark editorial direction is therefore a documented signal, not a
  contrarian gamble.
- **The conventional beauty site section list** — Services, Pricing, Testimonials — is
  services-business structure. Importing it produces a media kit in editorial clothing.
- **Google's authority signals for reviews** map one-to-one onto fields already in the content
  model.

---

## Design Direction

**`docs/DESIGN_DIRECTION_PROPOSAL.md`**. Nothing implemented.

Three territories explored with typography, colour, layout, photography, motion, emotional
perception, strengths and risks: **Luxury Editorial**, **Contemporary Beauty Laboratory**,
**Cinematic Personal Brand**.

**Recommendation: a Luxury Editorial foundation with the Beauty Laboratory system embedded, on a
dark editorial ground, cinematic treatment rationed to two or three moments.**

A division of labour by page type rather than a compromise. The **editorial layer governs
reading** — homepage, about, journal, case studies: serif display, generous space, restrained
motion. The **laboratory layer governs evidence** — inside every review: conditions block,
observation timeline, claim-versus-observation split, disclosure band, update log, with monospace
data and one signal colour meaning *observed*. **Cinematic is rationed** to the homepage hero,
static-first with correct LCP handling.

Chosen because it puts the differentiator on screen, solves the review page (the page that matters
most and that most designs ignore), carries the performance and accessibility constraints rather
than fighting them, and degrades gracefully if the photography is weaker than hoped — a live risk.

Phase 2 must resolve the Arabic/Latin type pairing at display size, and **verify contrast on a
dark ground rather than assuming it**.

---

## Technical Architecture Recommendation

**`docs/TECHNICAL_RECOMMENDATION.md`** — each decision with alternatives and tradeoffs.

| Decision | Recommendation | Confidence |
|---|---|---|
| Rendering | Static generation; one dynamic endpoint for the contact form | High |
| Framework | **Astro**, with Next.js a legitimate alternative | **Medium — client input needed** |
| Language | TypeScript strict | High |
| Styling | CSS custom-property tokens + scoped styles, logical properties for RTL | Medium-high |
| Content | Local JSON now; headless CMS at ~50 reviews or a second author | High |
| Journal bodies | MDX; reviews stay structured JSON | High |
| Images | AVIF/WebP, build-time, one priority image per page, budgeted | High |
| SEO | Content-driven metadata, crawlable filter URLs, single `@id` graph | High |
| Analytics | Privacy-first cookieless over GA4 | Medium — depends on jurisdiction |
| Hosting | Static + CDN + previews, account owned by the client | High |
| Testing | Content validation, types, component, 4 E2E, visual, a11y | High |

**The framework choice is genuinely close and is partly a client question.** Astro wins on
performance structurally, which matters because Core Web Vitals are release criteria. Next.js wins
on hiring pool and ecosystem, which matters for a property the client owns long-term. The content
model, types, validator and guard are all framework-agnostic, so the decision is reversible in
days.

Performance budgets are specified numerically (LCP < 2.0s, INP < 200ms, CLS < 0.05, review-page JS
< 40KB gzipped, LCP image < 200KB, total mobile < 1MB) for CI enforcement, per the instruction not
to make vague performance claims.

---

## Risks

Full register with impact, likelihood and mitigation: `docs/PROJECT_DISCOVERY.md` §13. The five
that matter most:

| # | Risk | Impact | Likelihood |
|---|---|---|---|
| **R-02** | Real content never arrives; a premium shell holds placeholders | **Severe** | **Medium-high** |
| **R-06** | SEO expectations exceed reality; organic takes 6–12 months | Medium (perceived failure of a successful project) | **High** |
| **R-08** | Publishing stops after launch and the site becomes a neglected blog | High — the whole strategy assumes a growing corpus | **Medium-high** |
| **R-05** | A fabricated credential ships (press, award, testimonial, partnership) | **Severe** — reputational and potentially legal | Low (heavily mitigated) |
| **R-01** | Mock content reaches production | **Severe** | Low (four markers + verified build gate) |

Also registered: R-03 bilingual scope, R-04 photography quality, R-07 the git boundary,
R-09 structured-data misuse, R-10 medical-claim drift, R-11 visual ambition versus Core Web
Vitals, R-12 non-crawlable filters.

---

## Unknowns

Full list of 14: `docs/PROJECT_DISCOVERY.md` §14. Blocking ones:

| # | Unknown | Blocks |
|---|---|---|
| **U-01** | The domain | Canonical URLs, sitemap, hreflang, Search Console, `sameAs`, OG tags |
| **U-02** | Official social account URLs | `sameAs`, footer, `/about`, entity strategy |
| **U-03** | Legal jurisdiction and privacy regime | Analytics choice, consent behaviour, contact form |
| **U-05** | What Zina has actually tested, and any archive of it | The entire review corpus |
| **U-06** | Whether original photography exists, and at what resolution | Design direction and image pipeline |
| **U-07** | Whether the positioning is accurate to her | Every bio and the whole proposition |

---

## Client Verification Requirements

Full ordered list of 20: `docs/PROJECT_DISCOVERY.md` §15. **This is the critical path.** The top
ten:

1. Domain name.
2. Official social account URLs, confirmed in writing, with reciprocal links back from each bio.
3. Confirmation of name spelling in both scripts and which variants she uses.
4. Legal jurisdiction and entity.
5. Biography, in her words. One long piece; the five variants derive from it.
6. Is "Beauty Creator & Product Testing Specialist" accurate? Everything here assumes it.
7. **The testing archive** — what she has tested, when, and whether a record exists. Largest
   single unknown.
8. **Does a repeatable testing method already exist?** The six-stage protocol is invented. If she
   has her own, use hers; if not, agreeing one is a business decision, not a content task.
9. Photography library, with resolutions and usage rights.
10. Audience statistics, each with the date it was measured.

Then: brand relationships with contractual status, campaign results with written sources, press
mentions with live URLs, testimonials with signed approval, awards with sources, contact details,
agency representation, the language decision, publishing cadence, and who maintains the site.

---

## Files Created

**Content layer (12 files)**

| File | Lines |
|---|---|
| `content/README.md` | 49 |
| `content/mock/person.json` | 172 |
| `content/mock/social-profiles.json` | 106 |
| `content/mock/brands.json` | 225 |
| `content/mock/products.json` | 261 |
| `content/mock/reviews.json` | 633 |
| `content/mock/work.json` | 190 |
| `content/mock/journal.json` | 237 |
| `content/mock/press.json` | 61 |
| `content/mock/testimonials.json` | 48 |
| `content/mock/site.json` | 97 |
| `content/schema/types.ts` | 352 |

**Tools (2 files)**

| File | Lines | Purpose |
|---|---|---|
| `tools/validate-content.mjs` | 280 | Structure, required fields, referential integrity, editorial rules, mock hygiene |
| `tools/check-mock-guard.mjs` | 98 | Production gate: fails a build containing any mock trace |

**Documentation (9 files)**

| File | Lines |
|---|---|
| `docs/PROJECT_DISCOVERY.md` | 524 |
| `docs/CONTENT_MODEL.md` | 181 |
| `docs/SITEMAP_PROPOSAL.md` | 199 |
| `docs/SEO_KEYWORD_MAP.md` | 205 |
| `docs/SEO_ENTITY_STRATEGY.md` | 174 |
| `docs/COMPETITIVE_RESEARCH.md` | 178 |
| `docs/REAL_CONTENT_MIGRATION.md` | 193 |
| `docs/DESIGN_DIRECTION_PROPOSAL.md` | 197 |
| `docs/TECHNICAL_RECOMMENDATION.md` | 272 |
| `docs/reports/PHASE_0_REPORT.md` | this file |

**Total: 24 files created.**

## Files Modified

**None.** No pre-existing file was edited or deleted. The nine specification documents,
`README.md` and `START_HERE.md` are untouched.

Two files created during Phase 0 were then corrected by Phase 0 itself, in response to validator
failures: `content/mock/social-profiles.json` (unsafe placeholder URL), `content/mock/reviews.json`
(five over-length SEO titles), `tools/validate-content.mjs` (prose scan was reading internal notes).

---

## Tests / Checks

Everything below was executed. Nothing is asserted from inspection.

| Check | Result | Notes |
|---|---|---|
| Install | **N/A** | No dependencies. Both tools run on plain Node |
| Typecheck | **Not run** | No TypeScript toolchain in the repo yet. `content/schema/types.ts` is a Phase 5 input, not compiled here |
| Lint | **Not run** | No linter configured yet (Phase 5) |
| Build | **N/A** | No application exists. Correct for Phase 0 |
| **Content validation** | **PASS** | 10 files, 41 records, all references resolved. **0 errors, 0 warnings** |
| **Mock guard — detects mock** | **PASS** | Run against `content/mock`: **BLOCKED, 54 traces across 10 files, exit 1** |
| **Mock guard — passes clean** | **PASS** | Run against a mock-free HTML fixture: **CLEAN, exit 0** |
| JSON well-formedness | **PASS** | All 10 files parse |
| Referential integrity | **PASS** | 41 ids indexed, no dangling references, no duplicates |
| Orphan check | **PASS** | Every review reachable from a brand or a journal article |
| Editorial rules | **PASS** | Pros/cons, suitability pairs, disclosure position, date ordering, medical-language and absolute-claim scans |
| Accessibility | **Not applicable yet** | No UI. Requirements specified for Phase 3 onward |
| SEO validation | **Partial** | Structured-data rules verified against Google Search Central documentation. No page exists to validate |
| Performance | **Not applicable yet** | No application. Budgets specified for CI enforcement |

### Defects found and fixed during the phase

The validator earned its place immediately by failing on its first run:

1. **Unsafe placeholder URL** — a Pinterest mock URL lacked a `.mock` marker and could have been
   mistaken for a real profile. Fixed.
2. **Five over-length SEO titles** — 61–65 characters, would truncate in SERPs. Rewritten to 48–55.
3. **A false positive worth keeping** — the absolute-claim scan flagged a review, and the offending
   text was an internal note *forbidding* absolute claims. Fixed by excluding underscore-prefixed
   keys from prose scanning, since internal guidance frequently quotes the patterns it prohibits.

---

## What Is NOT Yet Implemented

Deliberately, per the Phase 0 handoff rule:

- No website. No homepage, no pages, no routes, no components, no layouts.
- No framework, no `package.json`, no dependencies, no build.
- No design system, no tokens, no typography, no colour, no CSS.
- No animation, no 3D, no signature visual experience.
- No SEO output — no metadata, sitemap, robots, canonicals or structured data emitted anywhere.
- No images, fonts or media of any kind.
- No analytics, no deployment, no CI, no environment configuration.
- No git initialisation or commit (F-01 — outward-facing, your decision).
- No real content. Everything in `content/mock/` is fictional and marked.

Also intentionally not done:

- **Type checking and linting**, which need a toolchain that Phase 5 will choose.
- **A competitor audit.** Five searches were run; no site was crawled or measured, and no
  Arabic-language creator site was examined. The plan is in `docs/COMPETITIVE_RESEARCH.md` §6.
- **Keyword volume validation.** No tool was available. The plan is in `docs/SEO_KEYWORD_MAP.md` §7.

---

## Assumptions

Every one of these should be confirmed, and several are load-bearing:

1. Zina's positioning is product testing and evaluation, not tutorials or lifestyle content. The
   entire architecture rests on this.
2. Her audience is significantly Arabic-speaking. Drives the bilingual question and the dialect
   work.
3. Original photography exists or can be produced. The design direction assumes it.
4. She will publish new reviews after launch. The SEO strategy assumes a growing corpus.
5. She wants inbound brand collaborations. Drives `/work` and `/contact`.
6. A single author. Drives local-JSON-over-CMS.
7. The corpus will reach tens, not thousands, of reviews within 2–3 years. Drives static
   generation.
8. The `$50,000+` figure is a quality target, not a claim about price or her metrics — as
   `START_HERE.md` states.

---

## Recommendation for Phase 1

**Proceed to Phase 1 — Information architecture and content strategy.**

Deliver: the final sitemap (converting the proposal into decisions), navigation model, page
purpose matrix, frozen content models, internal-linking strategy, conversion paths.

### Four decisions to make first — two of them change what Phase 1 produces

| | Question | Recommendation |
|---|---|---|
| **Q-01** | Bilingual Arabic + English, or English-only at launch? | **Decide before Phase 1.** If the audience is primarily Arabic-speaking this is not optional. Consider Arabic-first with English secondary — the reverse of the usual default, and probably correct here |
| **Q-02** | Astro or Next.js, and who maintains this after launch? | Astro if maintenance stays with whoever builds it; Next.js if a React team inherits it. Follow the maintenance reality, not the preference |
| **Q-03** | Publish numeric ratings? | Decide in Phase 1, before 40 reviews exist. Lean yes for comparability, with the number always subordinate to the written verdict |
| **Q-04** | Is `/press` wanted, and do verified mentions exist? | Defer until three verified mentions exist |

### Run in parallel — this is the critical path

**Client content collection should start immediately and run alongside Phase 1, not after it.**
The architecture is ready for content that does not yet exist. Every week of collection overlapping
with design work is a week saved, and R-02 is the highest-likelihood severe risk on the register.

### Suggested handoff context for Phase 1

> Phase 0 is complete. Read `docs/PROJECT_DISCOVERY.md` first, then `docs/CONTENT_MODEL.md`,
> `docs/SITEMAP_PROPOSAL.md` and `docs/SEO_KEYWORD_MAP.md`.
>
> The content layer is at `content/mock/` (41 records, 10 collections) with portable types at
> `content/schema/types.ts`. Run `node tools/validate-content.mjs` before and after any content
> change; it currently passes with 0 errors and 0 warnings.
>
> Execute **Phase 1 only**: convert the sitemap proposal into a decided sitemap, produce the
> navigation model and page purpose matrix, freeze the content models, and define the
> internal-linking strategy and conversion paths. Answers to Q-01 and Q-03 should be reflected in
> the output; if they are unanswered, produce both variants for the sitemap rather than assuming.
>
> Do not begin design or engineering. Do not modify `content/mock/` except to fix a validator
> failure. Report to `docs/reports/PHASE_1_REPORT.md`.

**Phase 1 has not been started.**
