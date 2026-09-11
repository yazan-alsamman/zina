# Project Discovery — Zina Almokri

**Phase 0 master document.** Everything else produced in Phase 0 hangs off this.

| | |
|---|---|
| Date | 2026-09-07 |
| Phase | 0 — Project intelligence, content foundation |
| Repository state at start | Documentation only, no code, no commits |
| Deliverables | Mock content layer, content model, IA proposal, SEO map, entity strategy, competitive research, migration strategy, design proposal, technical recommendation, two validation tools |
| Website built | **None.** Correct for this phase |

---

## 1. Executive summary

The repository contained a well-specified brief and no implementation. Phase 0 built the layer
underneath a website rather than a website: a validated content model, a complete fictional
dataset that exercises every template the site will need, an information architecture argued
route by route, an SEO and entity strategy, and two executable tools that make shipping fabricated
content a build failure rather than a matter of vigilance.

**The central strategic finding** is that this project has an unusually favourable property: the
editorial integrity requirements and the SEO requirements are the same requirements. Google's
review system rewards demonstrable first-hand experience — original photography, specific
measurable observations, real testing, honest acknowledgement of limitations. Those are exactly
the things that make a review worth reading. There is no trade-off to manage between "credible"
and "ranks", which is rare, and it means one decision drives both.

**The differentiator is the method, not the person.** Most beauty creator sites are media kits or
neglected blogs. The thing Zina can own that a magazine cannot is a named, published, repeatable
testing protocol: fixed conditions, timed observations, a baseline photograph, a revisit. Phase 0
made that protocol a first-class entity in the content model, gave it a pillar page, and designed
the review template around it. Everything else — the design direction, the keyword map, the
internal-link graph — follows from that decision.

**The main risk is not technical.** The architecture can carry hundreds of reviews. The risk is
that content supply never arrives: no verified biography, no confirmed social accounts, no domain,
no real photography, and no confirmed record of what Zina has actually tested. A premium
architecture holding placeholder content is worth nothing. Section 15 is the list that unblocks it.

**Recommended next phase: Phase 1 (Information architecture and content strategy)**, run in
parallel with client content collection. Four decisions in section 16 should be answered first,
because two of them change what Phase 1 produces.

---

## 2. Current repository state

Audited in full. The repository contains 14 Markdown files and nothing else.

```
README.md
START_HERE.md
docs/  ANALYTICS_AND_MEASUREMENT.md      LAUNCH_CHECKLIST.md
       BRAND_AND_ART_DIRECTION.md        PERFORMANCE_AND_ACCESSIBILITY.md
       CLAUDE_CODE_MASTER_INSTRUCTIONS.md PHASE_PLAN.md
       CONTENT_STRATEGY.md               PROJECT_MASTER_SPEC.md
       CONTENT_VERIFICATION_MATRIX.md    REPORT_TEMPLATE.md
                                         SEO_MASTER_STRATEGY.md
                                         TECHNICAL_ARCHITECTURE.md
```

| Checked | Found |
|---|---|
| Framework, language, package manager, build system | None |
| `package.json`, lockfile, `node_modules` | None |
| Routing, styling, components, pages, APIs | None |
| Content or data architecture | None (now created) |
| Images, fonts, `public/`, any binary asset | **None. Zero assets of any kind** |
| Environment config, `.env.example`, `.gitignore` | None |
| Tests, linting, TypeScript config, CI | None |
| Deployment configuration | None |
| CMS integration | None |
| Documentation | Substantial and unusually good |

**No destructive changes were made.** Nothing existed to overwrite; all Phase 0 output is new
files in new directories.

### Two repository findings that need action

**F-01 — This project is not its own git repository.** `git rev-parse --show-toplevel` returns
`C:/Users/Lenovo`. The entire user home directory is the repository, and the project sits inside
it. `git status` consequently reports thousands of untracked files including `.ssh/`,
`.git-credentials`, browser profiles and application data. There are **no commits on the current
branch** (`master`).

This is a real hazard rather than an inconvenience: a `git add -A` from this directory would stage
credentials and private data, and a push would publish them.

*Recommendation, before any Phase 1 work:* run `git init` inside
`zina-almokri-premium-website-md/`, add a proper `.gitignore`, and make an initial commit.
The project then has its own history and its own boundary. **This has not been done, because
initialising a repository and committing are outward-facing actions that should be your call.**

**F-02 — The documentation is the project's strongest existing asset.** The nine specification
documents are coherent, opinionated and internally consistent. Phase 0 treated them as
authoritative, and every recommendation here is traceable to one of them. Where this document
departs from or qualifies a spec, it says so explicitly (see section 5 on `/press` and `/brands`,
and section 12 on the mock-data reconciliation).

---

## 3. Current technology

Nothing is installed or configured in the project. The local environment supports the
recommendation in section 11:

| Tool | Version | Note |
|---|---|---|
| Node.js | v24.11.1 | Current, supports every candidate framework |
| npm | 11.6.2 | |
| git | 2.50.1.windows.1 | See F-01 |
| OS | Windows 11 Pro | Line endings and path handling need attention in CI config |
| Python | available | Used only for a Phase 0 editing script; not a project dependency |

The two Phase 0 tools (`tools/validate-content.mjs`, `tools/check-mock-guard.mjs`) run on plain
Node with **zero dependencies**, deliberately, so they work before any framework is chosen and
survive a change of framework.

---

## 4. Content model

Full specification: **`docs/CONTENT_MODEL.md`**. Types: `content/schema/types.ts`.

Eleven entities: `Person`, `SocialProfile`, `Brand`, `Product`, `Review`, `Work`,
`JournalArticle`, `PressItem`, `Testimonial`, plus `ImageAsset`/`MediaAsset` and site
configuration.

Four decisions define it:

1. **Content never lives in components.** This is what makes mock-to-real a data swap.
2. **Provenance is a field.** Every record carries `_verification`. The verification matrix
   becomes machine-readable, and a build can refuse to ship an unverified value.
3. **Claims, observations and verdict are separate fields on separate entities.** A template
   cannot blur brand marketing into a finding, because they are structurally different things.
   This is the credibility mechanism and the SEO mechanism simultaneously.
4. **Relationships are id references.** The internal-link graph is derivable and provable.

The validator enforces editorial rules that no code review catches reliably: every review needs
at least three observations, both pros and cons, both who it suits and who it does not, disclosure
above the content, dates in a possible order, no medical language, and no absolute suitability
claim.

---

## 5. Proposed sitemap

Full rationale per route: **`docs/SITEMAP_PROPOSAL.md`**.

```
/  /about  /reviews  /reviews/[slug]  /brands  /brands/[slug]
/work  /work/[slug]  /journal  /journal/[slug]
/editorial-standards  /contact  /privacy  /terms  /404
/sitemap.xml  /robots.txt
```

Three departures from the master spec's candidate list, each argued in the proposal:

- **Added `/editorial-standards`.** Disclosure policy, corrections policy, the medical boundary
  and the AI position at a real indexable URL. One page, and it substantiates the entire
  positioning. The highest-value addition available.
- **`/brands` gated behind two published reviews per brand.** Below that a brand page is a thin
  page existing only as an SEO surface, which the SEO strategy explicitly forbids. Until then a
  brand is a filter value on `/reviews`.
- **`/press` deferred**, as the spec itself suggests, until at least three verified mentions
  exist. An empty or fabricated press page is worse than no press page.

`/products/[slug]` was evaluated and **rejected**: it would consist of a manufacturer description
plus a link, which is the thin-content pattern the strategy prohibits.

---

## 6. Audience

Per the master spec, three audiences with genuinely different needs.

| | **A — Beauty readers** | **B — Brands, PR, agencies** | **C — Media, industry** |
|---|---|---|---|
| Volume | Highest | Lowest | Low |
| Value per visit | Low individually, high in aggregate | **Highest** | High, indirect |
| Arrives from | Organic search, social | Direct link, referral, search for her name | Referral, search |
| Enters at | A review | Homepage or `/work` | `/about` or a review |
| Wants | Should I buy this | Can she deliver, and is she safe to work with | Is she credible and quotable |
| Decides on | Specificity and honesty | Portfolio quality, disclosure discipline, professionalism | Method, standards, consistency |
| Converts to | Another review, a follow | An inquiry | A citation or a request |

**The tension, and how it is resolved.** Audience A wants a library. Audience B wants a portfolio.
Building for B produces a media kit nobody visits; building only for A produces a blog that
generates no business. The resolution is that **the library is the portfolio**: a brand assessing
Zina is most persuaded by the quality of her independent reviews, not by a campaign gallery. This
is why `/work` case studies cross-link to the independent review of the same brand — unusual, and
it turns a potential credibility problem into a demonstration that the disclosure policy works.

**Audience A is the growth engine and audience B is the revenue.** Both are served by the same
content, which is why the site can be excellent rather than compromised.

---

## 7. User journeys

**J1 — Search to review to follow (audience A, highest volume)**
Searches a product name → lands on the review → sees the disclosure and the testing conditions
immediately → reads observations → checks the verdict → follows a related review or the method
pillar → follows on social.
*Requirements:* review page is the fastest page on the site; disclosure and conditions above the
fold; two strong related links; social links present but not intrusive.

**J2 — Brand evaluates a collaboration (audience B, highest value)**
Arrives from a link or a name search → homepage establishes seriousness in three seconds →
`/work` for capability → a case study → the independent review of the same brand, which is the
moment that decides it → `/about` and `/editorial-standards` for risk assessment → `/contact`.
*Requirements:* `/work` must not look like a social gallery; empty results states must look
intentional; `/contact` must route by inquiry type; the disclosure position must be visibly
consistent.

**J3 — Reader with a problem (audience A, most defensible SEO)**
Searches "why does my foundation break down" → journal article → article cites the review where
it was photographed → review → related review.
*Requirements:* journal articles link down to the reviews that evidence them; problem-led headings;
this is the seam where the site can win against publications.

**J4 — Journalist or peer (audience C)**
`/about` → the six-stage method → `/editorial-standards` → a review as evidence → `/contact`.
*Requirements:* the method must be a real page, not a homepage section; standards must be
linkable; contact must have a press route.

**Anti-journey to design against:** landing on the homepage and finding a beautiful page with
nothing to do. Every homepage section must exit somewhere specific.

---

## 8. SEO strategy summary

Full map: **`docs/SEO_KEYWORD_MAP.md`**. Entity strategy: **`docs/SEO_ENTITY_STRATEGY.md`**.

> **No search volume data was obtained.** No keyword tool or Search Console property was
> available. Every query in the map is a hypothesis about intent, prioritised by strategic value,
> not by measured demand. Section 7 of the map is the validation plan. Nothing there should be
> quoted to a client as researched volume.

Four points carry the strategy:

**Product reviews are the acquisition engine.** Long-tail, high-intent, product-specific, in both
languages: `[product] review`, `[product] تجربة`, `[product] تقييم`. Every review is a landing page.

**Four defensible seams**, ranked by how little credible competition exists: climate-conditioned
performance (long-wear tested in real heat, not air conditioning); shade accuracy for medium-deep
warm and olive undertones; claim verification as a repeatable format; and failure diagnosis
("why does my X do Y"), which routes naturally into reviews.

**Arabic must be researched, not translated.** Gulf, Levantine and North African users search
differently; code-switching is normal, so product names should stay in Latin script inside Arabic
content; Arabic queries skew longer and more conversational, which favours question-shaped
content. The correct dialect depends on where Zina's audience actually is, which is unknown.

**The entity is the long game.** One `Person` node, one canonical name in two scripts, a
`sameAs` graph containing only confirmed official profiles, and byte-identical bios across every
platform. `sameAsEligible` is `false` on every mock profile and the validator enforces it.

---

## 9. Competitive findings

Full document, including an explicit scope statement: **`docs/COMPETITIVE_RESEARCH.md`**.

**Web search was used for five queries. No competitor site was crawled, audited or measured, and
no Arabic-language creator site was examined.** Findings are marked researched or reasoned
throughout. Section 6 of that document is the research plan for what remains, and until it is done
none of this should be presented to a client as a competitive audit.

What was established:

- **Category structure [reasoned].** Creator sites are almost always a link-in-bio page, a media
  kit, a neglected blog, or — rarely — an owned editorial property. The brief asks for the fourth,
  which requires a repeatable editorial method rather than a personality. Zina has one. That is
  the rarest precondition and it is already met.
- **Visual convention [researched].** Roughly three in four beauty websites use a pale ground, with
  dark reserved for editorial positioning. A dark editorial direction is therefore a *documented
  signal*, not a contrarian gamble. This is the strongest single input to the design proposal.
- **A trap [researched].** The conventional beauty site section list — Services, Pricing,
  Testimonials — is services-business structure. Importing it produces a media kit in editorial
  clothing, which is exactly the failure mode to avoid.
- **Authority [researched, best-evidenced].** Google's review system rewards first-hand
  experience, original photography, measurable observation, and honest acknowledgement of
  limitations. Each maps directly onto a field in the content model.

---

## 10. Design direction

Full proposal with three territories: **`docs/DESIGN_DIRECTION_PROPOSAL.md`**. Nothing implemented.

Territories evaluated: **Luxury Editorial**, **Contemporary Beauty Laboratory**, **Cinematic
Personal Brand**.

**Recommendation: a Luxury Editorial foundation with the Beauty Laboratory system embedded, on a
dark editorial ground, with cinematic treatment rationed to two or three moments.**

Not a compromise but a division of labour by page type. The editorial layer governs reading —
homepage, about, journal, case studies: serif display, generous space, restrained motion. The
laboratory layer governs evidence — inside every review: the conditions block, the observation
timeline, the claim-versus-observation split, the disclosure band, the update log, with monospace
data and one signal colour meaning *observed*. Cinematic treatment appears at the homepage hero
only, static-first with correct LCP handling.

Chosen because it puts the actual differentiator on screen, because it solves the review page
(the page that matters most and that most designs ignore), because it carries the performance and
accessibility constraints instead of fighting them, and because it degrades gracefully if the
photography turns out weaker than hoped — which is a live risk (R-04).

Phase 2 must resolve the Arabic/Latin type pairing at display size, and verify contrast on a dark
ground rather than assuming it.

---

## 11. Technical recommendation

Full document with tradeoffs: **`docs/TECHNICAL_RECOMMENDATION.md`**.

| Decision | Recommendation | Confidence |
|---|---|---|
| Rendering | Static generation; one dynamic endpoint for the contact form | High |
| Framework | **Astro**, with Next.js a legitimate alternative | **Medium — needs client input (Q-02)** |
| Language | TypeScript, strict | High |
| Styling | CSS custom-property tokens + scoped styles, logical properties for RTL | Medium-high |
| Content | Local JSON now; headless CMS at ~50 reviews or a second author | High |
| Journal bodies | MDX; reviews stay structured JSON | High |
| Images | AVIF/WebP, build-time, one priority image per page, budgeted | High |
| SEO | Content-driven metadata, crawlable filter URLs, one `@id` graph | High |
| Analytics | Privacy-first cookieless over GA4 | Medium — depends on U-03 |
| Hosting | Static + CDN + previews, account owned by the client | High |

**The framework choice is genuinely close and is partly a client question.** Astro wins on
performance structurally, which matters because Core Web Vitals are release criteria and the
visual direction needs a media budget. Next.js wins on hiring pool and ecosystem, which matters
for a property the client will own long-term. The content model, types, validator and guard are
framework-agnostic, so the decision is reversible in days rather than weeks.

**One SEO decision has real architectural consequence:** review filters must be crawlable URLs
rendered server-side, not client-only state. Getting this wrong makes the review corpus reachable
only through the sitemap.

---

## 12. Mock content strategy

Full replacement procedure: **`docs/REAL_CONTENT_MIGRATION.md`**. Data: `content/mock/`.

### Reconciling the mock brief with the "no invented facts" rule

The repository documentation forbids inventing biographical facts, statistics, brand
relationships and press mentions. The Phase 0 brief asks for a complete fictional dataset. These
are compatible, and the reconciliation is the governing principle of this layer:

> Fabrication is dangerous when it is **indistinguishable from fact** and can **reach a reader**.
> Mock content that is machine-detectable, quarantined in its own directory, marked at four
> independent levels, and blocked by a build gate is a fixture. It becomes a fabricated fact only
> at the moment it can be published, and the guard exists to make that moment impossible.

Nothing in `content/mock/` is presented as true anywhere, including in this document.

### What was built

| Collection | Records | Notes |
|---|---|---|
| Person | 1 | 5 bios (en + ar), expertise, philosophy, six-stage protocol |
| Social profiles | 5 | Instagram, TikTok, YouTube, Snapchat, Pinterest; all `sameAsEligible: false` |
| Brands | 5 | All fictional. **No real company is named anywhere in the dataset** |
| Products | 6 | Foundation, Serum, Lip, Mascara, Moisturizer, Concealer |
| Reviews | 6 | Full testing data, observations, four different disclosure types |
| Work | 4 | Product Launch, Editorial Series, Social Campaign, Beauty Campaign |
| Journal | 6 | 2 pillar, 4 supporting |
| Press | 4 | Fictional outlets. Flagged as the highest-risk file in the project |
| Testimonials | 3 | Attribution is the literal string `MOCK NAME` |
| Site | 1 | Domain, nav, contact, legal, locales, editorial standards |
| **Total** | **41 records, 10 files** | Validator passing, zero errors, zero warnings |

### Deliberate design in the fixture data

The dataset is built to break templates that would otherwise break in production:

- **Four disclosure types**, including a paid partnership on a critical review and a two-part
  disclosure (PR sample plus a separate paid project with the same brand). If the template can
  carry those honestly, it can carry anything.
- **One work project with an empty `results.figures` array.** Real clients often supply no
  numbers; that state must look intentional.
- **Two reviews that state what the test could not determine.** Counter-intuitive, and
  disproportionately credibility-building.
- **A mock award that is a shortlisting, not a win**, with an explicit warning against upgrading
  it.
- **An Arabic-script press outlet name inside an otherwise Latin list**, to force RTL-in-LTR
  handling early.
- **`brandClaims` containing unfalsifiable marketing language** ("5x volume", "72 hours of
  hydration") that the reviews explicitly decline to verify.

### Four detection mechanisms

`__MOCK_DATA__` file marker, `_mock: true` record marker, `mock-` id prefix, and placeholder URLs
on `example.com` / `.mock` hosts — plus `_verification: "MOCK"` and the `MOCK NAME` string. Any
one blocks a build.

---

## 13. Risks

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| **R-01** | Mock content reaches production | **Severe** — fabricated bio, statistics or press published under Zina's name | Low | Four markers, `check-mock-guard.mjs` verified in both directions, CI gate, `noindex` on previews, launch checklist |
| **R-02** | Real content never arrives; a premium shell holds placeholders | **Severe** — project fails despite being built correctly | **Medium-high** | Section 15 checklist; run collection in parallel with Phase 1, not after it |
| **R-03** | Bilingual scope doubles content cost mid-build | High — schedule and budget | Medium | Decide D-04 before Phase 5; IA is locale-agnostic so deferral is currently free |
| **R-04** | Photography is compressed social exports, not originals | High — the visual direction depends on image quality | Medium | Confirm early; the recommended design degrades gracefully; specify minimum resolutions now |
| **R-05** | A fabricated credential ships (press, award, testimonial, partnership) | **Severe** — reputational and potentially legal | Low | `approvalOnFile` render gate, `relationship.status` gate, `/press` deferred, shortlisting warning in data |
| **R-06** | SEO expectations exceed reality; organic takes 6–12 months | Medium — perceived failure of a successful project | **High** | State the timeline now; measure branded impressions and indexed quality pages early, not rankings |
| **R-07** | Git repository boundary (F-01) leaks credentials from the home directory | High | Medium | `git init` in the project directory before any commit |
| **R-08** | Publishing stops after launch and the site becomes a neglected blog | High — the entire SEO strategy assumes a growing corpus | **Medium-high** | Agree a realistic cadence before launch; design for a small corpus so it never looks empty |
| **R-09** | Structured data misuse (standalone `Product`, `AggregateRating`, unverified `sameAs`) | Medium — manual action or corrupted entity | Low | Rules documented in the entity strategy; validate with Rich Results Test in Phase 8 |
| **R-10** | Editorial drift into medical or clinical claims | High — YMYL exposure and genuine harm | Low-medium | Validator rejects medical language; `/editorial-standards` states the boundary; routine content carries an explicit boundary section |
| **R-11** | Premium visual ambition degrades Core Web Vitals | Medium | Medium | Budgets in the technical recommendation enforced in CI; static-first; motion as enhancement |
| **R-12** | Filters built client-only, leaving the review corpus poorly crawlable | Medium — undermines the acquisition strategy | Medium | Flagged as an architectural requirement, not a Phase 8 fix |

---

## 14. Unknowns

Ordered by how much they block.

| # | Unknown | Blocks | Severity |
|---|---|---|---|
| **U-01** | The domain | Canonical URLs, sitemap, hreflang, Search Console, `sameAs`, OG tags | **Blocking** |
| **U-02** | Official social account URLs | `sameAs`, footer, `/about`, entity strategy | **Blocking for SEO** |
| **U-03** | Legal jurisdiction and applicable privacy regime | Analytics choice, consent behaviour, contact form, privacy page | **Blocking for Phase 11** |
| **U-04** | Where Zina's audience actually is | Arabic dialect targeting, D-04, climate framing, hreflang region | High |
| **U-05** | What she has actually tested, and the archive of it | The entire review corpus. Without this there is no content | **Highest content impact** |
| **U-06** | Whether original photography exists, and at what resolution | Design direction, image pipeline, R-04 | High |
| **U-07** | Whether the positioning is accurate to her | Every bio, the six-stage method, the whole proposition | High |
| **U-08** | Real audience statistics and their as-of dates | Any statistic on the site | Medium |
| **U-09** | Whether she is represented by an agency or management | `/contact` routing, inquiry handling | Medium |
| **U-10** | Real brand relationships and their contractual status | `/brands`, `/work`, every relationship label | Medium |
| **U-11** | Who maintains the site after launch, and their stack | Q-02 framework choice, CMS timing | Medium |
| **U-12** | Publishing cadence she can realistically sustain | R-08, corpus growth assumptions, category-page thresholds | Medium |
| **U-13** | Budget and timeline | Scope of Phases 6 and 7, bilingual feasibility | Medium |
| **U-14** | Whether she wants numeric ratings | Review template, star snippets, card design | Low but decide early |

---

## 15. Client verification requirements

The single most useful thing that can happen next. Ordered so the earliest items unblock the most.

### Blocking

1. **Domain name.** Registered or intended.
2. **Official social account URLs**, confirmed in writing as hers, with a commitment to add a
   reciprocal link back to the site from each profile bio.
3. **Confirmation of the name spelling** in Latin and Arabic, and which variants she does or does
   not use.
4. **Legal jurisdiction** and the entity, if one exists.

### Content — highest impact

5. **Biography, in her words.** One long piece is enough; the five variants are derived from it.
6. **Is "Beauty Creator & Product Testing Specialist" accurate?** If not, what is. Everything in
   Phase 0 assumes it.
7. **The testing archive.** What has she actually tested, when, and is there a record — notes,
   photographs, video, posts. This is the largest single unknown.
8. **Does a repeatable testing method already exist?** The six-stage protocol is invented. If she
   has her own, use hers. If she does not, agreeing one is a genuine business decision and not
   just a content task.
9. **Photography library.** Portraits, product shots, swatches, testing imagery, with resolutions
   and usage rights.
10. **Audience statistics** with the date each was measured.

### Relationships and credentials — verification required, not collection

11. **Brand relationships**, with the contractual status of each: paid, gifted, ambassador,
    one-off. Never inferred.
12. **Campaign results**, only where a client supplied a figure in writing, with the source named.
13. **Press mentions**, with live URLs. `/press` is not built without three.
14. **Testimonials**, only with signed approval to publish, attributed by name and role.
15. **Awards**, with sources. A shortlisting is never an award.

### Operational

16. **Contact email(s)**, and whether a phone number should be public.
17. **Agency or management representation**, if any.
18. **Language decision** (D-04) and the audience geography behind it.
19. **Publishing cadence** she can sustain.
20. **Who maintains the site** after launch.

---

## 16. Recommended next phase

**Phase 1 — Information architecture and content strategy.** Per `docs/PHASE_PLAN.md`.

Phase 1 should deliver: the final sitemap (converting the proposal in section 5 into decisions),
the navigation model, a page purpose matrix, frozen content models, the internal-linking strategy,
and conversion paths. Most of the raw material exists; Phase 1 is where it becomes decided rather
than proposed.

### Four decisions to make before Phase 1 starts

Two of these change what Phase 1 produces, so they are worth answering first.

| | Question | Why it matters now | Recommendation |
|---|---|---|---|
| **Q-01 (D-04)** | Bilingual Arabic + English, or English-only at launch? | Changes the sitemap, roughly doubles content cost, and determines the typography brief for Phase 2 | **Decide now.** If the audience is primarily Arabic-speaking, bilingual is not optional. Consider Arabic-first with English secondary, which is the reverse of the usual default and probably correct here |
| **Q-02** | Astro or Next.js? Who maintains this after launch? | Framework should follow maintenance reality, not preference | Astro if the client is comfortable, or if maintenance stays with whoever builds it. Next.js if a React team inherits it |
| **Q-03** | Publish numeric ratings? | Affects the review template, card design and star-snippet eligibility. Painful to change once 40 reviews exist | Decide in Phase 1. A lean toward yes, for comparability, with the number always subordinate to the written verdict |
| **Q-04** | Is a `/press` page wanted, and do verified mentions exist? | Determines whether the route and the highest-risk content file survive at all | Defer until three verified mentions exist |

### Run in parallel

**Client content collection (section 15) should start immediately and run alongside Phase 1**, not
after it. It is the critical path. The architecture is ready for content that does not yet exist,
and every week of collection that overlaps with design work is a week saved.

### Not started

Phase 1 has not been begun. No design, no framework, no scaffolding beyond the two zero-dependency
validation tools, which exist to prove the content architecture works and to make R-01 mechanically
preventable.
