# Sitemap Implementation

**The discoverable-URL set, computed from the same gates every page already enforces — and
honestly empty until the source stops being mock.**

| | |
|---|---|
| **Status** | Implemented (Phase 8) |
| **Shape** | `/sitemap.xml` → `/sitemap-en.xml`, `/sitemap-ar.xml` |
| **URLs today** | **0** — nothing on the site is indexable while the source is mock |
| **URLs the mechanism produces when forced open** | **56** (29 en / 27 ar), against the real corpus |
| **Second implementation of any gate** | **None** |

---

## 1. The shape was already specified

`docs/MULTILINGUAL_SEO_ARCHITECTURE.md` section 8, written in Phase 0:

```
/sitemap.xml          index
  /sitemap-en.xml     English URLs only
  /sitemap-ar.xml     Arabic URLs only
```

> "Each URL entry carries `xhtml:link` alternates matching the hreflang set **exactly**. Sitemap
> and head-level hreflang must agree; a mismatch is a reliable way to have both ignored."
>
> "Only existing, indexable, publishable-status URLs appear. Gated brand pages, gated category
> pages, filter URLs, `404` and preview builds are all excluded by construction."

Phase 8 implements this specification. Nothing about the shape was decided fresh.

Two more notes were left specifically for this phase, in the modules they concern:

- `src/lib/facets.ts`: *"Facets that may appear in a sitemap. Today: none... Phase 8 consumes this
  rather than re-deriving the rule."*
- `src/lib/journal.ts`: *"Categories eligible for a sitemap. Today: none... Phase 8 consumes this
  rather than re-deriving the rule."*

`src/lib/sitemap.ts` is that consumer.

---

## 2. One rule, reused — not reimplemented

Every URL's inclusion, canonical target and hreflang alternates are computed by calling the
**exact same functions** each page template already calls for its own `<meta name="robots">` and
`<head>`:

| What decides it | Function | Also called by |
|---|---|---|
| Build-wide gate | `IS_INDEXABLE_BUILD` | every page in the site |
| Review category facet | `facetIndexing()` | `reviews/[category].astro` |
| Journal format archive | `facetIndexing()` (same function, `kind: "category"`) | `journal/[category].astro` |
| Brand entity | `brandIsIndexable()`, `entityBrands()` | `brands/[brand].astro` |
| Per-record detail pages | `content.seo?.noindex` | reviews, journal, work, about, method |

Nothing here is a second, parallel implementation of a gate that could silently drift from the
page's own decision. It is the same gate, called from a second place. `facetIndexing()` in
particular is the function `reviews/[category].astro` and `journal/[category].astro` **already
share** — Phase 8 adds a third caller rather than inventing a fourth rule.

---

## 3. Why the current output is empty, and why that is correct

`IS_INDEXABLE_BUILD` is `false` while the content source is mock. Composed into every branch of
`discoverableUrls()` exactly as every page composes it into its own robots meta tag, this means
the function returns `[]` today.

That is not a placeholder. **Listing a URL in a sitemap while that same page's own meta tag says
`noindex` is a direct, well-documented contradiction** — search engines warn against it
explicitly, because it tells a crawler two opposite things about the same page. An empty,
structurally valid sitemap is the only honest output while nothing on the site is indexable — the
same "an unverified value is an absence, and it renders as one" rule that has governed every
surface since Phase 6.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

</urlset>
```

---

## 4. Proving the mechanism without a real build

The corpus can never exercise the "populated" branch through the real endpoint — that would
require `IS_INDEXABLE_BUILD` to be `true`, which only happens once the content source stops being
mock. The same problem Phase 7 solved for the Results Figure gate (synthetic fixtures, never
reaching production) applies here, with one difference: there is nothing sensitive about a review
or a brand *existing* — only about presenting one as *verified*. So instead of synthetic fixtures,
`discoverableUrls()` takes a plain boolean override:

```ts
export function discoverableUrls(indexableBuild: boolean = IS_INDEXABLE_BUILD): SitemapUrl[]
```

The production endpoint never passes an argument — it always gets the real, current
`IS_INDEXABLE_BUILD`. Tests call `discoverableUrls(true)` against the **real mock corpus** to
prove every gate opens correctly, with the override never reaching a shipped file.

Forced open, the mechanism produces exactly **56 URLs**:

| Family | en | ar |
|---|---|---|
| Static pages (home, indexes, about, method, contact, standards, legal) | 11 | 11 |
| Reviews | 5 | 5 |
| Journal articles | 5 | 5 |
| Work | 4 | 3 |
| Brand entities | 4 | 3 |
| **Total** | **29** | **27** |

This matches the corpus exactly — the same asymmetries Phase 6 and Phase 7 already established
(one English-only review, one English-only journal article, one English-only work record, and
`veloura-beauty` gated in Arabic) produce the same 2-URL gap here.

**Zero category or journal-format facets appear**, forced open or not — the corpus holds at most
two articles per format and no category with five reviews in either locale, so none reaches its
own thin-page gate regardless of `IS_INDEXABLE_BUILD`.

---

## 5. What is permanently excluded, regardless of build state

| Excluded | Why |
|---|---|
| The brand facet (`/reviews/brand/{slug}/`) | Permanently `noindex` and canonicalises to `/reviews/` (`src/lib/facets.ts` module header). Navigation only, never a sitemap candidate — not even forced open. |
| `/404/` | Hardcoded `noindex` regardless of build state. |
| `/press/` | Declared in `site.json → routes` with `status: "deferred"` (needs 3 verified mentions). Not built. |
| `/brands/{brand}/{product}/` | Declared with `status: "not-built"`. Not built. |

Both deferred/not-built routes are excluded structurally — there is no `getStaticPaths` output for
them, so there is nothing for `discoverableUrls()` to find, not a rule that filters them out.

---

## 6. `lastmod` — only where a real date exists

| Route family | `lastmod` |
|---|---|
| Review, journal article | `dates.updatedAt`, the record's own field, verbatim |
| Work | `month` (`"2026-06"`) — the sitemap protocol's W3C-datetime format explicitly permits year-month precision, so this is the real, finest-grained date the record states, with **no day invented** |
| Brand | **omitted** — `Brand` carries no `dates` field at all |
| Every static/index page | **omitted** — no single record represents "this page changed"; inventing a build timestamp would be a fabricated freshness signal |

This is the same discipline `docs/JOURNAL_SEO.md` already applied to `dateModified` in JSON-LD:
never synthesise a date, state the real one or say nothing.

---

## 7. `priority` and `changefreq` — read live, never copied

```ts
const routeMeta = (key: string) => {
  const def = site().routes.find((r) => r.key === key);
  return { priority: def?.priority, changefreq: def?.changefreq };
};
```

`site.json → routes[]` already declares these per route key (`home: priority 1, weekly`;
`privacy: priority 0.2, yearly`; …) — authored in Phase 0 specifically for this purpose. Reading
them live rather than hardcoding a second copy in `sitemap.ts` means an editorial change to
`site.json` updates the sitemap automatically, with nothing to keep in sync.

---

## 8. Hreflang alternates — proven to match the page, not just constructed to

Per the Phase 0 spec, sitemap alternates must match head-level hreflang **exactly**. Three
different computations feed this, one per route shape, each mirroring its page's own logic:

- **Static pages** (home, indexes, …): both locales always present when indexable at all.
- **Detail records** (review, journal, work): mirrors `alternatesFor()` in `routing.ts` — an
  alternate for every locale that has a slug, matching the page's actual `<head>` behaviour.
- **Brand entities**: mirrors `brands/[brand].astro`'s own computation — a counterpart alternate
  only where `entityBrands(counterpartLocale)` also contains the same brand id ("hreflang follows
  the gate, not the record").
- **Facets**: mirrors the `robots.startsWith("index") ? [...] : []` pattern the category and
  format archive pages already use.

Construction alone is not proof. `tests/sitemap.test.mjs` additionally **parses every listed
page's actual rendered `<head>`** and asserts the sitemap's declared alternates equal the page's
rendered alternates, set-for-set, for all 56 forced-open URLs. Agreement is asserted against the
built site, not assumed from shared code.

---

## 9. Testing

| File | What it proves |
|---|---|
| `tests/sitemap.test.mjs` (28 tests) | Current build is empty; every gate opens correctly forced-open against the real corpus; alternates match head-level hreflang for every listed page; every listed URL self-canonicalises; XML is well-formed |
| `tests/discovery-audit.test.mjs` (13 tests) | Bidirectional: every indexable page has a sitemap entry and vice versa, in the real build |

---

## 10. Known limits

| Limit | Status |
|---|---|
| Production origin (U-01) | Every `<loc>` is `https://example.invalid/...`. Sitemap architecture is complete; submitting it to Search Console is blocked until a real domain exists. |
| Zero URLs in the current build | By design, while the source is mock. |
| No `<image:image>` extension | No photography exists yet (every asset path is a placeholder — Phase 7). Adding it now would reference files that do not exist. |
