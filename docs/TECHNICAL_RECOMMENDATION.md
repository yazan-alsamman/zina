# Technical Recommendation

**Status:** Phase 0 recommendation. Phase 5 implements. Every decision below states its
alternatives and its tradeoff, per master instruction 10.

**Starting position:** the repository contains documentation only — no framework, no
`package.json`, no code, no assets, no lockfile, no CI, no deployment configuration. There is
nothing to preserve and nothing to avoid breaking, so this is a genuine greenfield choice rather
than a migration.

**Environment verified locally:** Node v24.11.1, npm 11.6.2, git 2.50.1.

---

## 1. Rendering strategy — decided first, because it constrains everything else

**Decision: static generation for all content routes, with a single dynamic endpoint for the
contact form.**

Every page on this site is content that changes when an editor changes it, not when a user
arrives. Reviews, brands, work, journal, about: all fully knowable at build time. Static output
gives the best possible LCP, the simplest possible caching, no server to secure or scale, and
guaranteed crawlable HTML — which matters more here than usual, because organic discovery of
review pages is the entire acquisition strategy.

**Alternatives considered.** Server-side rendering per request: no benefit, since nothing is
personalised, and it adds infrastructure and latency. Client-side rendering: unacceptable —
review content must be in the initial HTML. Incremental static regeneration: genuinely useful at
thousands of pages with frequent updates; at tens of pages with occasional updates it is
complexity without payoff, and it can be adopted later without changing the content model.

**Tradeoff.** Every content change requires a rebuild. At this corpus size a rebuild is seconds
and is triggered automatically by a commit or a CMS webhook. This becomes a real constraint only
past roughly a thousand pages, which is several years away.

---

## 2. Framework

**Recommendation: Astro. With Next.js as a fully legitimate second choice, and the decision
belongs to whoever will maintain this.**

The case for Astro: it ships zero JavaScript by default and adds interactivity per component
through islands, which is exactly the shape of this site — a large static reading surface with
three or four interactive pieces (review filters, mobile navigation, contact form, maybe an image
comparison). Content collections with schema validation map directly onto
`content/schema/types.ts`. Its pure static path produces smaller, more cacheable output than a
React framework's, and for a content site rebuilt on each change that is the simpler system. It
handles Markdown/MDX natively for journal content.

The case for Next.js: a far larger hiring pool and ecosystem, which is a real maintenance
consideration for a client-owned property. Native ISR if the corpus grows. First-class image
optimisation. If anything server-side ever appears — authentication, a dashboard, personalisation
— Astro would push toward integrating an external system where Next.js handles it natively.

**Why Astro edges it here.** The performance advantage on a content site is structural rather than
incidental, and Core Web Vitals are explicit release criteria in `docs/PERFORMANCE_AND_ACCESSIBILITY.md`.
The premium visual direction wants a motion and media budget; starting from near-zero JavaScript
is what buys that budget. Nothing in the requirements needs a server.

**Tradeoff, stated plainly.** Astro has a smaller talent pool. If the client's long-term
maintenance is an agency or a developer who works in React, that consideration can reasonably
outweigh the performance one. The content model, the type definitions, the validator and the mock
guard are all framework-agnostic and would port to Next.js unchanged, so this decision is
reversible at a cost measured in days rather than weeks. **This is a question for the client, not
a technical fact** — see Question Q-02 in `docs/PROJECT_DISCOVERY.md`.

**Rejected.** WordPress: contradicts the performance and craft bar, and the editorial control this
design needs would fight the platform. A site builder: cannot deliver the design or the structured
content model. Hand-written HTML: unmaintainable at 200 reviews. SvelteKit or Nuxt: fine
technically, worse on ecosystem and hiring than either recommendation.

---

## 3. Language and styling

**TypeScript, strict mode.** The content model is the product. Types catch a missing disclosure
or a dangling brand reference at build time rather than in review. `content/schema/types.ts` is
already written and has no dependencies.

**Styling: CSS with custom properties for tokens, plus scoped component styles.**

The design direction is editorial and typographic — bespoke type scales, asymmetric grids,
optical spacing, and a bidirectional layout system. That work is expressed more directly in CSS
than in utility classes, and CSS logical properties (`margin-inline-start` over `margin-left`)
give RTL support nearly free, which is a significant advantage given D-04.

**Alternative: Tailwind.** Faster for conventional layouts, excellent consistency enforcement,
and the larger hiring pool again. The tradeoff is that a strongly editorial design tends to
accumulate arbitrary values and custom configuration until the utility layer stops paying for
itself, and bidirectional support needs deliberate handling either way. **Either is defensible.
Tokens as CSS custom properties should be the source of truth regardless**, so that a change of
styling approach does not become a redesign.

---

## 4. Content: local files now, CMS later

**Decision: local JSON in `content/`, with the entity model designed to port to a headless CMS.**

Local files mean content is versioned in git, reviewable in pull requests, validated by a script
in CI, and free. For a corpus in the low tens with a single author, that is strictly better than a
CMS: no vendor, no cost, no API failure mode, no editorial UI to build permissions for.

**Migrate to a CMS when one of these becomes true:** the client wants to publish without a
developer; the corpus passes roughly 50 reviews; or a second contributor appears. Sanity or
Storyblok are the natural targets — both model structured content well, both have good image
pipelines. The entities in `docs/CONTENT_MODEL.md` map onto CMS schemas one-to-one, which is why
this is deferrable rather than a rewrite.

**Journal bodies should be MDX** rather than the JSON section outlines used in the mock data. The
mock uses structured outlines because they are validatable and sufficient to build the template;
real editorial prose belongs in MDX where it can carry inline images, pull quotes and comparison
components. Reviews stay structured JSON, because their value is precisely that they are the same
shape every time.

**Tradeoff.** A non-technical client cannot edit local JSON. That is acceptable while the site is
being built and is the trigger condition for the CMS migration above. It should be stated to the
client at handover rather than discovered by them.

---

## 5. Images

Beauty is a visual category and image weight is the most likely source of a performance failure.

- **AVIF with WebP fallback**, responsive `srcset`, explicit `width`/`height` on every image —
  already required by the `ImageAsset` type, so a missing dimension is a build error, and CLS
  from images is structurally prevented.
- **One priority image per page**, the true LCP element, eagerly loaded and preloaded. Everything
  else lazy.
- **Build-time processing** via the framework's image pipeline. Originals live outside the
  deployed output.
- **Art direction via `<picture>`** where the mobile crop should genuinely differ — portraits and
  full-bleed editorial images, where a desktop crop is wrong on a phone rather than just smaller.
- **Alt text is a required field**, not an attribute someone remembers. The validator enforces it.
- **Budget: 200KB for the LCP image, 1MB total initial page weight on mobile.** Measured, not
  asserted (`docs/PERFORMANCE_AND_ACCESSIBILITY.md` forbids vague claims).

**Open risk.** No real photography exists. Image strategy assumes original assets at usable
resolution; if the client supplies compressed social exports, the visual direction is compromised
regardless of the pipeline. Flagged as R-04.

---

## 6. SEO implementation

- **Metadata from the content layer.** Each record carries `seo`; a single head component consumes
  it. No page hard-codes a title.
- **Canonical URLs from one configured host**, single source in `site.json`. Blocked on the domain
  (U-01).
- **Sitemap generated from the content graph**, not hand-maintained, so it cannot drift.
- **Structured data as one typed builder per entity**, emitting a single `@id` graph. Rules in
  `docs/SEO_ENTITY_STRATEGY.md` section 5 — particularly: never standalone `Product`, never
  `AggregateRating`.
- **Filters must be crawlable navigation.** This is the one SEO decision with real architectural
  consequence. Review filters implemented as client-only state produce a corpus reachable only via
  the sitemap. Filters should be real URLs (`/reviews?category=foundation`, promoting to
  `/reviews/foundation` at 5+ reviews) rendered server-side, with the client layer as an
  enhancement.
- **`noindex` on every preview deployment**, without exception, so mock content cannot be indexed.
- **hreflang** if bilingual: reciprocal pairs plus `x-default`, generated from the route table.

---

## 7. Accessibility

Built in, not audited in. WCAG 2.2 AA.

Semantic HTML first, landmarks and one `h1` per page, visible focus designed rather than
defaulted, `prefers-reduced-motion` honoured at the token level so it cannot be forgotten per
component, 44px touch targets, form errors associated programmatically, and `dir`/`lang` correct
per locale.

Tooling: `eslint-plugin-jsx-a11y` (or the Astro equivalent), `axe-core` in component tests,
Lighthouse accessibility in CI. Plus manual keyboard and screen-reader passes on the review
template and the contact form — the two flows automation checks least well.

**Contrast on a dark ground is the specific risk** and must be verified in Phase 2, not assumed.

---

## 8. Performance

Budgets, to be enforced in CI rather than aspired to:

| Metric | Budget |
|---|---|
| LCP (mobile, throttled) | < 2.0s |
| INP | < 200ms |
| CLS | < 0.05 |
| Initial JS (review page) | < 40KB gzipped |
| LCP image | < 200KB |
| Total initial weight (mobile) | < 1MB |
| Fonts | 2 families, 4 weights max, subset, `font-display: swap`, self-hosted |

Self-hosting fonts matters more than usual: an Arabic subset from a third-party CDN is both a
performance and a privacy consideration, and subsetting Arabic correctly requires deliberate work.

Lighthouse CI on pull requests with the budgets above as failing thresholds. Field data via CrUX
after launch.

---

## 9. Testing

Proportionate to a content site — not an application test pyramid.

| Layer | Tool | What it protects |
|---|---|---|
| Content validation | `tools/validate-content.mjs` (**exists, passing**) | Schema, references, editorial rules |
| Mock guard | `tools/check-mock-guard.mjs` (**exists, verified both directions**) | Fabricated content reaching production |
| Types | `tsc --noEmit` | Content/component contract |
| Lint | ESLint + Prettier | Consistency |
| Component | Vitest + Testing Library | Review template states, disclosure variants, empty states |
| E2E | Playwright, 3–4 journeys only | Search-to-review, review-to-contact, filter, form submit |
| Visual | Playwright screenshots on key templates | Editorial layout regressions, which unit tests never catch |
| Accessibility | axe-core + Lighthouse CI | AA compliance |

The two content tools are the highest-value tests in the project and they already exist. They
enforce editorial standards that no code review reliably catches: a review with no cons, a
disclosure in the wrong place, a testimonial without approval, a publish date before testing
finished.

---

## 10. Deployment and analytics

**Hosting: any static host with a global CDN, atomic deploys, preview branches and edge
functions** for the one contact endpoint. Netlify, Cloudflare Pages and Vercel all qualify;
prefer whichever the client can hold the account for, since ownership matters more than features
at this scale.

Requirements: HTTPS, one canonical host with the other 301'd, immutable asset caching, security
headers (CSP, HSTS, `X-Content-Type-Options`, Referrer-Policy), and **`noindex` on all previews**.

**Analytics: a privacy-first, cookieless platform** (Plausible, Fathom or Cloudflare Web
Analytics) rather than GA4. Rationale: the events in `docs/ANALYTICS_AND_MEASUREMENT.md` are all
simple page and click events that these tools handle; they need no consent banner in most
jurisdictions, which removes a CLS and INP liability from every page; and they are far lighter.
Search Console remains the primary SEO instrument regardless.

**Tradeoff.** GA4 offers deeper segmentation and free unlimited scale. If the client already
standardises on GA4 or needs advertising integration, that changes the answer — and then a consent
mechanism becomes mandatory, which is why the applicable privacy jurisdiction (U-03) must be
confirmed before this is finalised.

---

## 11. Environment and secrets

`.env.example` committed with every variable documented; no secrets in git; separate preview and
production configuration. Expected variables are few: site URL, form endpoint or provider key,
analytics domain, and a spam-protection key.

---

## 12. Summary

| Decision | Recommendation | Confidence |
|---|---|---|
| Rendering | Static generation | High |
| Framework | Astro, Next.js a legitimate alternative | **Medium — client input needed (Q-02)** |
| Language | TypeScript strict | High |
| Styling | CSS custom-property tokens + scoped styles | Medium-high |
| Content | Local JSON now, CMS at ~50 reviews | High |
| Journal bodies | MDX | High |
| Images | AVIF/WebP, build-time, budgeted | High |
| SEO | Content-driven metadata, crawlable filters, `@id` graph | High |
| Analytics | Privacy-first, cookieless | Medium — depends on U-03 |
| Hosting | Static + CDN + previews, client-owned account | High |
| Testing | Content validation, types, component, 4 E2E, visual, a11y | High |
