# Review Page Architecture

**Status:** Phase 1 decision. Structure and content contract only. No visual design.

The review page is the most-visited page type, the primary organic landing page, and the most
structurally complex thing on the site. It is also the page that carries the differentiator. If
this page is right, the rest of the site follows; if it reads as a blog post, the whole positioning
fails.

**Design principle: this is a testing report, not an article.** An article is prose with pictures.
A report has a fixed structure you can scan, compare against another report, and check. Two reviews
on this site must be readable side by side, which means the section order is fixed and not an
editorial choice per post.

---

## 1. Section order

Numbered as delivered in the DOM. Mobile order is identical — no reordering by breakpoint, because
a shared URL must show the same thing to everyone.

| # | Section | Source field | Required | Notes |
|---|---|---|---|---|
| 1 | Breadcrumb | route | Yes | `Home / Reviews / {title}`. Drives `BreadcrumbList` |
| 2 | Product identity | `entity` + product record | Yes | Brand, product, category, product type, shade tested. Brand links to brand page **only if the gate passes in this locale**, else to the filtered index |
| 3 | Title and subtitle | `title`, `subtitle` | Yes | Single `h1`. Subtitle carries the test, e.g. "Eight hours in 38 degree heat, tested four times" |
| 4 | **Disclosure band** | `disclosure` | **Yes** | **Above the hero.** See section 3 |
| 5 | Hero media | `media.hero` | Yes | The LCP element. One per page, eager, preloaded |
| 6 | Testing summary strip | `testing` | Yes | Wear window, times tested, shade, baseline photographed. Scannable in two seconds |
| 7 | Introduction | `introduction` | Yes | Why this test, and what was at stake |
| 8 | Testing context | `testingContext`, `applicationContext`, `conditions[]` | Yes | The conditions table. This is the section competitors do not have |
| 9 | Method stages applied | `testing.methodStageKeys` | Yes | Named stages with a link to `/method/`. The repeated internal link that builds the pillar |
| 10 | Observations | `observations[]` | Yes, min 3 | Timeline: `at` / `aspect` / `note`. The core evidence |
| 11 | Visual evidence | `media.evidence[]`, `evidenceNotes` | Recommended | Bound to a stage and optionally to an observation index |
| 12 | Strengths | `strengths[]` | Yes | |
| 13 | Limitations | `limitations[]` | **Yes** | Never optional. A review with no limitations has not finished testing |
| 14 | Suitability | `suitability.suitsWell[]` / `mayNotSuit[]` | **Yes, both** | Both sides required |
| 15 | Verdict | `verdict` | Yes | Summary, best for, would repurchase. **No numeric score** |
| 16 | Conclusion | `conclusion` | Yes | Editorial close. May state what the test could not determine |
| 17 | Update log | `updateLog[]` | If present | Dated entries. A freshness signal and an honesty signal |
| 18 | Product details | product record | Yes | Shade count, size, price tier, official link (`rel="nofollow sponsored"` where a paid relationship exists), and **brand claims, visually separated** |
| 19 | Related reviews | `related.reviewIds` | Yes, 2 | |
| 20 | Related journal | `related.journalIds` | Yes, 2 | |
| 21 | Related brand | `entity.brandId` | If gate passes | |
| 22 | Related work | `related.workIds` | If present | The cross-link that shows paid and independent work side by side |
| 23 | CTA | — | Yes | Contextual: to `/method/` for a first-time reader, to `/contact/` in the footer. Not a hard sell on a reading page |

**Sections 8, 9, 10 and 11 are the report.** Everything before them is orientation and everything
after is navigation. If a design pass compresses the page, those four survive intact.

---

## 2. The claims/observations/verdict separation

The most important rule on the page, and the reason the content model is shaped as it is.

Three kinds of statement appear on a review page and **must be visually distinguishable without
reading them**:

| Kind | Source | Voice | Treatment |
|---|---|---|---|
| **Brand claim** | `product.locales[].brandClaims[]` | The brand's | Quoted, attributed, visually recessed. Never in the reviewer's voice |
| **Observation** | `observations[]` | Recorded at the time | Timestamped, factual, primary emphasis |
| **Verdict** | `verdict`, `conclusion` | Opinion, owned | Marked as judgement |

A reader must be able to tell, at a glance, that "up to 12 hours of comfortable wear" is something
the brand said and "product began to lift around the nose at hour six" is something Zina saw. The
data model makes blurring them impossible; the design must make the distinction visible.

---

## 3. Disclosure

**Position is `above-content` and is not configurable.** It sits above the hero image, not below
the fold, not in a footer, not behind a toggle.

Six states, from `DisclosureType`:

| Type | Label pattern | Band treatment |
|---|---|---|
| `independently-purchased` | "Bought independently" | Neutral |
| `gifted` | "Gifted, unpaid" | Neutral, stated |
| `sponsored` | "Sponsored" | Prominent |
| `paid-collaboration` | "Paid partnership" | **Most prominent** |
| `editorial` | "Editorial" | Neutral |
| `unknown-pending-verification` | "Disclosure pending verification" | Prominent warning. **Cannot reach published status** |

Plus `additional[]` modifiers, which render as a second line rather than a second badge:
`existing-paid-relationship`, `affiliate-link`, `event-hosted`.

**Every disclosure carries a statement, not just a badge.** A badge says "gifted"; a statement says
what that means for the reader's trust. The two-part case in the mock set — a gifted product from
a brand with a separate paid project — exists to prove the template can carry nuance without
either hiding it or over-dramatising it.

---

## 4. States the template must handle

Each is present in the mock data, so none is theoretical.

| State | Fixture | Required behaviour |
|---|---|---|
| Paid disclosure on a critical review | Voile Lumiere | Page must not read as advertising |
| Two-part disclosure | Verdure Cloud Balm | Second line, not a second badge |
| No comparison product | Velvet Hour, Cils Infini | Comparison block omitted, not shown empty |
| Brand gated in this locale | Verdure (ar), Velvet Hour brand in ar | Brand name is not a link to a missing page |
| No related work | Verdure | Section omitted |
| Update log present / absent | Voile Lumiere, Sitara / others | Section omitted when empty |
| Test that could not determine something | Verdure, Cils Infini | Rendered as content, not as a caveat in small print |
| No Arabic version | Velvet Hour | No `/ar/` route, switcher falls back to `/ar/reviews/` |
| No English version | Verdure | No `/en/` route, switcher falls back to `/en/reviews/` |
| Long observation list | Voile Lumiere, 6 | Timeline must stay scannable |
| RTL rendering | All Arabic reviews | Conditions table, timeline and evidence captions must all work in RTL |

---

## 5. SEO contract

| Element | Source | Rule |
|---|---|---|
| `<title>` | `seo.title` | Used **verbatim**, no site-name template. Validator warns over 60 chars |
| Meta description | `seo.description` | Validator warns over 165 chars |
| Canonical | `seo.canonicalPath` | Validated to equal `/{loc}/reviews/{slug}/` |
| hreflang | locale keys | Reciprocal pairs for existing locales only, plus self-reference |
| `h1` | `title` | Exactly one |
| `h2` | Section headings | Fixed order, so heading structure is consistent across every review |
| Open Graph | `media.hero`, `seo` | Hero doubles as OG image |
| Images | `media.*` | Alt, width and height required by type. One priority image |
| Dates | `dates` | `publishedAt` and `updatedAt` both visible and in markup |

**Structured data** (implemented in Phase 8, specified here):

- `Review` with `itemReviewed` → nested `Product`, `author` → `Person` `@id`.
- **No `reviewRating`.** Removing numeric scores forfeits star snippets. That is a deliberate,
  documented trade: see `docs/ENTITY_ARCHITECTURE.md` section 5. The `Review` type remains valid
  and useful for entity understanding without a rating.
- **Never** standalone `Product` schema, never `offers`, never `AggregateRating`.
- `BreadcrumbList` from the path.
- Everything marked up must be visible on the page.

---

## 6. Performance contract

The review page is the page whose Core Web Vitals matter most.

- One priority image, the hero. Everything else lazy.
- Evidence images are below the fold by construction and lazy by default.
- Observations, conditions, strengths, limitations and suitability are static server-rendered HTML.
  Nothing in the report requires JavaScript to read.
- Any interactivity — an image comparison slider, a lightbox — is an Astro island, loaded on
  interaction, and never wraps the text.
- Budget for this page type: JS under 40KB gzipped, LCP image under 200KB, LCP under 2.0s on a
  throttled mobile connection.

---

## 7. What this page must never become

- A blog post with a rating out of five at the bottom.
- A page where the disclosure is beneath the content.
- A page where brand claims and observations use the same typography.
- A page that lists only strengths.
- A page whose testing conditions are implied rather than published.
- A page that requires JavaScript to read the review.
- A page that says a product suits everyone.
