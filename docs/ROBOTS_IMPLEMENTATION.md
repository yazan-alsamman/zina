# Robots.txt Implementation

**Minimal, explicit, and constant regardless of build state — crawl policy, not index policy.**

| | |
|---|---|
| **Status** | Implemented (Phase 8) |
| **Route** | `/robots.txt` |
| **Rules** | `Allow: /` — nothing else |
| **Changes between a mock and a real build** | **None** |

---

## 1. The whole file

```
User-agent: *
Allow: /

Sitemap: https://example.invalid/sitemap.xml
```

That is the complete, permanent content. Four lines.

---

## 2. Crawling and indexing are different questions, answered by different mechanisms

Every indexability decision on this site is already made with `<meta name="robots">`, per page,
composed with `IS_INDEXABLE_BUILD` (`robotsContent()` in `src/lib/routing.ts`). That mechanism
already makes every page `noindex` while the source is mock. robots.txt does not need to duplicate
that decision — duplicating it would create a **second, competing place** the same fact is stated,
and two places stating one fact is how one of them goes stale.

robots.txt answers a narrower, different question: not *"should this be indexed"* but *"may this
be fetched at all."* There is nothing on this site a crawler should be blocked from fetching — no
admin surface, no search results, no API, no account area (there are no accounts — Phase 7). So
the file allows everything, and lets the per-page meta tag do the actual work.

---

## 3. Why nothing is Disallowed — including the gated facet pages

The gated review-category facets and journal-format archives are real, linked, `noindex` pages.
The Phase 8 brief is explicit: *"Do not disallow legitimate public routes merely as a shortcut."*

There is a concrete reason beyond following instructions: **blocking crawl access to a page hides
its own `noindex` meta tag from the crawler that would otherwise read it.** A crawler that cannot
fetch a page cannot see the tag telling it not to index that page — it can only see that a link to
the page exists elsewhere and that robots.txt refuses it, which is precisely the well-documented
*"indexed, though blocked by robots.txt"* failure mode search engines warn about. Allowing the
fetch and letting the meta tag do its job is not just permitted by the brief, it is the only
configuration that actually works.

`tests/robots.test.mjs` asserts this directly: no `Disallow` rule exists that would block
`/reviews/brand/` or any review-category segment.

---

## 4. The sitemap reference uses the same origin as everything else

```ts
Sitemap: ${absoluteUrl(machinePath.sitemapIndex())}
```

`absoluteUrl()` is the single canonical-origin function every canonical tag, every hreflang
alternate and every JSON-LD block on the site already uses (`src/config/site.ts` → `SITE_URL`).
Referencing the sitemap through it is consistency, not a new fact: U-01 remains unresolved, and
`SITE_URL` remains the reserved `.invalid` placeholder — exactly as it does everywhere else in this
build — until a real domain is supplied.

**This is explicitly not the same as `site.json → domain.value`**, which is
`"https://zinaalmokri.example.com"` — an invented mock value, marked `_verification: "MOCK"`, with
its own note: *"INVENTED. The real domain is unknown and remains blocking for canonical URLs,
hreflang, sitemap generation and Search Console. Unknown U-01."* robots.txt never reads that field.
`tests/robots.test.mjs` asserts the invented domain never appears in the built file.

---

## 5. Testing

| File | What it proves |
|---|---|
| `tests/robots.test.mjs` (12 tests) | Content matches `src/lib/robots.ts` exactly (thin wrapper); exactly one `User-agent` and one `Sitemap:` line; nothing is `Disallow`ed; the sitemap URL uses `SITE_URL`, never the invented mock domain; the referenced sitemap file actually exists in the build |
| `tests/discovery-audit.test.mjs` | No `Disallow` rule ever blocks a page the sitemap (forced open) lists — a regression guard against a future rule silently orphaning an indexable page |

---

## 6. Known limits

| Limit | Status |
|---|---|
| Production origin (U-01) | The `Sitemap:` line points at `https://example.invalid/sitemap.xml` until a real domain exists. |
| No crawl-delay or bot-specific rules | Not needed at this traffic scale; would be premature optimisation for a site with no production content yet. |
