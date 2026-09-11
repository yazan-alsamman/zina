# SEO URL Architecture

**Status:** Phase 1 decision. Machine-readable source: `routes` and `reservedSlugs` in
`content/mock/site.json`.

URLs are the most expensive thing on a website to change. Everything here is chosen to be stable
from six reviews to five hundred.

---

## 1. Patterns

```
/                                       302 -> /{loc}/          never indexed
/{loc}/
/{loc}/about/
/{loc}/method/
/{loc}/reviews/
/{loc}/reviews/{category}/                                      deferred, gated
/{loc}/reviews/{slug}/
/{loc}/brands/
/{loc}/brands/{slug}/                                           gated
/{loc}/brands/{brandSlug}/{productSlug}/                        not built, see product strategy
/{loc}/work/
/{loc}/work/{slug}/
/{loc}/journal/
/{loc}/journal/{category}/                                      gated
/{loc}/journal/{slug}/
/{loc}/editorial-standards/
/{loc}/contact/
/{loc}/privacy/     /{loc}/terms/
/{loc}/press/                                                   deferred
```

Maximum depth after the locale is three segments.

---

## 2. Trailing slash

**Always.** `/en/reviews/` not `/en/reviews`.

One canonical form, enforced by a 301 from the other. Astro's `trailingSlash: "always"` plus a host
redirect rule. Set once, in `site.json` (`i18n.trailingSlash`), and never varied per route — mixed
policies are a reliable source of duplicate-content and analytics-splitting problems.

---

## 3. Script and language of URLs

**Decision: Latin script throughout, in both locales. Path segments in English. Slugs authored per
locale.**

So the Arabic review of the Sitara concealer is:

```
/ar/reviews/atelier-noor-sitara-luminous-concealer/
```

and the Arabic-original shade-vocabulary article is:

```
/ar/journal/mufradat-darajat-albashara/
```

### Why

**Path segments stay English** because they are navigational furniture, not content. Localising
them (`/ar/مراجعات/`) buys a marginal relevance signal and costs a permanent mapping layer between
two segment vocabularies that every redirect, analytics report, hreflang pair and sitemap entry
has to traverse.

**Slugs stay Latin** because Arabic-script URLs percent-encode. `/ar/journal/مفردات-درجات-البشرة/`
becomes `%D9%85%D9%81%D8%B1%D8%AF%D8%A7%D8%AA...` in Search Console, in server logs, in analytics,
and whenever anyone pastes it into a document. Google handles them correctly, but everyone
maintaining the site handles them badly, and bidirectional text in a URL bar produces genuine
display bugs.

**Slugs are authored per locale, not shared**, because Arabic articles that have no English
counterpart need their own descriptive slug. `mufradat-darajat-albashara` is a transliteration of
the Arabic title, which is honest about what the page is.

**Product and brand names stay Latin in both locales**, which is not a compromise but the correct
answer: Phase 0 research established that Gulf users code-switch and routinely keep brand and
product names in Latin script inside otherwise-Arabic queries.

### The trade-off, stated plainly

Arabic-script slugs would likely give a small relevance and click-through benefit on Arabic SERPs,
where a matching Arabic URL is visible in the result. This decision gives that up for
maintainability. **It is reversible** — slugs are per-locale data, so switching Arabic slugs to
Arabic script later is a data change plus a redirect map, not a restructure. Flagged as an open
question (Q-3) worth revisiting once real Arabic search data exists.

---

## 4. Slug rules

- Lowercase, ASCII, hyphen-separated. Validator-enforced regex: `^[a-z0-9]+(-[a-z0-9]+)*$`
- No dates, no IDs, no stop-word padding
- **Reviews:** `{brand}-{product}`, e.g. `atelier-noor-sitara-luminous-concealer`. The word
  "review" is **not** in the slug — the route segment `/reviews/` already says it, and repeating it
  is keyword padding
- **Journal:** descriptive of the question answered, e.g. `how-to-evaluate-foundation-performance`
- **Work:** `{client}-{campaign}`, e.g. `atelier-noor-layers-of-light-campaign`
- **Brands:** the brand name, e.g. `maison-eclat`
- Slugs are **immutable once published**. A changed slug is a 301 and an entry in the redirect map,
  never a silent edit

### Reserved slugs

Category segments share a path level with detail slugs, so `/en/reviews/foundation/` could collide
with a review slugged `foundation`. Reserved words are declared in `site.json` and the validator
fails the build on collision:

```
reviews: foundation, concealer, mascara, lip, serum, moisturizer
journal: testing-notes, guides, comparisons, essays
```

The alternative — a disambiguating segment like `/reviews/c/foundation/` — was rejected. It makes
every category URL uglier forever to solve a problem that a build-time check solves for free.

Slug uniqueness within a collection and locale is also validator-enforced.

---

## 5. Filters, facets and query parameters

**The one URL decision with real architectural consequence.**

Review filters must be **crawlable, server-rendered URLs**, not client-only state. Filters
implemented as JavaScript state produce a review corpus reachable only through the sitemap, which
undermines the entire acquisition strategy.

### Progression

| Stage | URL | Indexable |
|---|---|---|
| Today | `/{loc}/reviews/?category=foundation` | `noindex, follow`, canonical → `/{loc}/reviews/` |
| At 5+ reviews in a category | `/{loc}/reviews/foundation/` | **Indexable**, self-canonical, unique intro copy |
| Brand filter | `/{loc}/reviews/?brand=veloura-beauty` | `noindex, follow`, canonical → `/{loc}/reviews/` |
| Disclosure filter | `/{loc}/reviews/?disclosure=independently-purchased` | `noindex, follow` |
| Any two filters combined | — | `noindex, follow`, canonical → `/{loc}/reviews/` |

**Rules:**

1. Every filter state is a real URL that returns server-rendered HTML. Shareable, crawlable,
   back-button-correct.
2. Only single-facet category URLs are ever promoted to indexable, and only above the threshold.
3. Multi-facet combinations are never indexable. They are the classic crawl-budget sink.
4. Promotion from `?category=` to `/{category}/` is a routing change plus a 301, not a URL
   migration, because the category vocabulary is fixed in `reservedSlugs` now.
5. Sorting is a query parameter, always `noindex`, and never changes which items exist — only their
   order. Sort must never be the only way to reach an item.

### Parameter policy

| Parameter | Purpose | Indexable |
|---|---|---|
| `?category=` | Facet | No |
| `?brand=` | Facet | No |
| `?disclosure=` | Facet | No |
| `?sort=` | Order | No |
| `?page=` | Pagination | Yes, self-canonical |
| `?utm_*` | Campaign | No. Canonical strips them |

No parameter ever carries an opaque ID. `?category=foundation`, never `?category=123`.

---

## 6. Pagination

Not needed today. When an index exceeds ~24 items:

- `/{loc}/reviews/?page=2`, self-canonical, indexable.
- `rel="prev"`/`rel="next"` are no longer used by Google but remain harmless and useful to other
  crawlers.
- **Never** canonicalise page 2 to page 1; that hides everything after the first page.
- No infinite scroll without paginated URLs behind it.
- Page 1 is always the bare index URL, never `?page=1`.

---

## 7. Canonicals

- Every page self-canonicalises to its absolute URL on the single canonical host.
- Canonical is built from `domain` + `seo.canonicalPath`. The validator checks that
  `canonicalPath` equals the route pattern for reviews and journal articles, so a mismatch cannot
  reach a build.
- One canonical host. `www` and non-`www` resolve, one 301s to the other.
- HTTPS only, HSTS enabled.
- Filter and sort URLs canonicalise to their unfiltered parent.
- **Locale variants never canonicalise to each other.** `/ar/` is not a duplicate of `/en/`; they
  are hreflang alternates. Cross-locale canonicalisation would deindex one language.
- Blocked on the real domain (Unknown U-01).

---

## 8. Redirects

Maintained as a data file, not scattered in host config.

| Case | Response |
|---|---|
| `/` | 302 to `/{loc}/` by Accept-Language. **Not 301** — see multilingual doc section 2 |
| Missing trailing slash | 301 |
| `www` ↔ apex | 301 to the canonical host |
| HTTP | 301 to HTTPS |
| Changed slug | 301 to the new slug, permanently retained |
| `/how-i-test` | 301 to `/{loc}/method/` — memorable alias for the pillar |
| Deleted content | 301 to the closest relevant page, or 410 if nothing is relevant |
| Non-existent locale, e.g. `/fr/...` | 404, not a redirect |

Redirect chains are flattened. A → B → C becomes A → C.

---

## 9. Archive and legacy

Reviews are evergreen and are updated in place rather than superseded, which is why `updateLog`
exists. A review is only retired when the product is discontinued and the page has no residual
value; then it moves to `status: "archived"`, stays at its URL with an archived notice, and keeps
its inbound links. Deleting a review URL destroys accumulated authority for no benefit.

If a review is genuinely replaced — a full retest published as a new page — the old URL 301s to
the new one and the new page states what it replaced.
