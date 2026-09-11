# Real Content Migration

**How mock content is replaced with verified client content, and how it is prevented from
reaching production in the meantime.**

This is the most operationally important document in Phase 0. The mock layer exists because it
lets the whole site be built before the client supplies anything. That is only safe if removal is
mechanical and verifiable.

---

## 1. The four detection mechanisms

Every mock record is detectable four independent ways. Any one of them alone is enough to block a
build; together they make an accidental ship implausible.

| # | Mechanism | Example | Scope |
|---|---|---|---|
| 1 | File-level marker | `"__MOCK_DATA__": true` | Top of every mock JSON file |
| 2 | Record-level marker | `"_mock": true` | Every record |
| 3 | Id prefix | `mock-review-...` | Every id, and therefore every reference |
| 4 | Placeholder URLs | `*.example.com`, `*.mock` | Every URL field |

Plus two content-level markers: `"_verification": "MOCK"` on every record, and the literal string
`MOCK NAME` in place of any invented human name.

`tools/check-mock-guard.mjs` scans for all of them.

---

## 2. Where everything lives

| Content | File | Route it feeds |
|---|---|---|
| Biography (5 variants), expertise, philosophy, testing protocol, portraits | `content/mock/person.json` | `/about`, `/`, every byline |
| Social URLs, handles, follower counts | `content/mock/social-profiles.json` | Footer, `/about`, `sameAs` |
| Brands, relationships, logos | `content/mock/brands.json` | `/brands`, `/brands/[slug]` |
| Products, brand claims, product imagery | `content/mock/products.json` | Inside `/reviews/[slug]` |
| Reviews, testing data, verdicts, disclosures | `content/mock/reviews.json` | `/reviews`, `/reviews/[slug]` |
| Work, deliverables, campaign results | `content/mock/work.json` | `/work`, `/work/[slug]` |
| Journal articles | `content/mock/journal.json` | `/journal`, `/journal/[slug]` |
| Press mentions, awards | `content/mock/press.json` | `/press` (deferred route) |
| Testimonials | `content/mock/testimonials.json` | `/work`, homepage |
| Domain, nav, contact, legal, locales, SEO defaults, editorial standards | `content/mock/site.json` | Site-wide |
| Media | `/mock-media/**` (paths only; no files exist) | Everywhere |
| Per-record SEO metadata | `seo` object on each record | `<head>` per route |
| Type definitions | `content/schema/types.ts` | Build-time only |

**Nothing else contains content.** No biography string, follower count, brand name or social URL
may appear in a component, a page file, a config, or a translation file. That rule is what makes
this document short.

---

## 3. The migration procedure

### Step 1 — Collect (client)

Use `docs/CONTENT_VERIFICATION_MATRIX.md` as the intake checklist. Nothing enters `content/real/`
without a source recorded in that matrix.

### Step 2 — Create `content/real/`

Copy the mock structure, keeping filenames and the collection envelope. The application reads from
a single configured content directory, so switching sources is a one-line change and never a code
change.

```
content/
├── mock/     kept, for local development, tests and visual regression fixtures
├── real/     production content
└── schema/   unchanged
```

### Step 3 — Replace collection by collection

Recommended order, lowest risk first:

1. `person.json` — needed by everything
2. `site.json` — domain unblocks canonicals, sitemap, hreflang, Search Console
3. `social-profiles.json` — flip `sameAsEligible` only on written confirmation
4. `brands.json` — set `relationship.status` to `CONFIRMED` only with written evidence
5. `products.json`
6. `reviews.json`
7. `journal.json`
8. `work.json` — results figures need a named written source or the figure is dropped
9. `testimonials.json` — only with signed approval, otherwise delete the collection and the component
10. `press.json` — only with verified mentions, otherwise delete the collection and the `/press` route

For each record: remove `__MOCK_DATA__`, remove `_mock`, re-slug the id from `mock-` to `real-`
(or to a stable content id), and set `_verification` to `CONFIRMED` or `NEEDS_VERIFICATION` —
never leave it `MOCK`.

### Step 4 — Replace media

Every `/mock-media/**` path becomes a real asset. No path may remain unresolved: a broken hero
image is a Core Web Vitals failure and a credibility failure at the same time.

### Step 5 — Validate

```
node tools/validate-content.mjs content/real
```

The validator's mock-hygiene rules invert here: ids must no longer start with `mock-`, and
`_verification: "MOCK"` becomes a failure rather than a requirement. Update the two relevant
checks when `content/real/` is created; the rest of the rules (required fields, referential
integrity, pros/cons, suitability, disclosure position, date ordering, medical language, absolute
claims) apply unchanged and are the real value of the tool long-term.

### Step 6 — Guard the build

```
node tools/check-mock-guard.mjs dist      # or .next, or the framework's output dir
```

Exit 1 blocks the deploy.

### Step 7 — Partial content is normal

The client will not supply everything at once. Three rules:

- A record with `_verification: "NEEDS_VERIFICATION"` renders **nothing** for that field. It never
  falls back to a mock value.
- A collection that is empty removes its route from the sitemap and its link from navigation. It
  does not render an empty page.
- A missing figure, testimonial or press item is simply absent. `content/mock/work.json` includes
  one project with a deliberately empty `results.figures` array so that this state is designed and
  tested rather than discovered at launch.

---

## 4. Preventing mock data reaching production

Four gates, in order of when they fire:

**Gate 1 — Local.** `npm run validate` before commit.

**Gate 2 — CI.** On every pull request touching `content/**`:
```
node tools/validate-content.mjs
node tools/check-mock-guard.mjs <build-output>
```
The guard is advisory on preview branches (previews legitimately run on mock content) and blocking
on the production branch.

**Gate 3 — Build.** The production build script runs the guard as its final step. A build
containing mock traces fails and produces no artefact.

**Gate 4 — Human.** `docs/LAUNCH_CHECKLIST.md`, plus a `noindex` on every preview deployment so
mock content cannot be indexed even if a preview URL leaks. This last point is easy to forget and
expensive: an indexed preview containing fabricated press mentions is a real problem.

### Verified behaviour

Both directions of the guard were executed during Phase 0:

| Test | Target | Result |
|---|---|---|
| Detects mock content | `content/mock` | **BLOCKED**, 54 traces across 10 files, exit 1 |
| Passes clean content | Mock-free HTML fixture | **CLEAN**, exit 0 |

---

## 5. Content that must never be migrated, only replaced or deleted

| Content | Rule |
|---|---|
| Follower counts | Only with a source and an `asOf` date. Never rounded up, never undated |
| Brand relationships | Only with written confirmation from the brand or the client |
| Testimonials | Only with signed approval. `approvalOnFile: true` is a hard render gate |
| Press mentions | Only with a live, verifiable URL |
| Awards | Only with a verifiable source. **A shortlisting is never an award** |
| Campaign results | Only with a client-supplied written figure and a named source |
| Testing observations | Only from tests that actually happened. These cannot be reconstructed, only re-run |
| Product claims | Quoted from the brand, never asserted |
| Location, legal entity, contact details | Client-supplied only |

---

## 6. Client handover

When the site launches, the client owns the content layer. They need to know:

- Content lives in `content/real/*.json`. Editing it changes the site.
- The verification field is not decoration. `NEEDS_VERIFICATION` hides a value on purpose.
- Adding a review means adding a record and running the validator. It will refuse a review with
  no cons, no `mayNotSuit` entries, a disclosure in the wrong position, or a publish date before
  testing finished.
- If the content set grows past roughly 50 reviews or the client wants to edit without a
  developer, migrate to a headless CMS. See `docs/TECHNICAL_RECOMMENDATION.md` section 4. The
  entity model is designed to port directly to one, which is why this is a later decision and not
  a rebuild.
