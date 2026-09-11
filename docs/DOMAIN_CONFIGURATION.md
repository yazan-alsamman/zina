# Domain Configuration

**U-01 resolved. One constant changed; every absolute URL in the build followed.**

| | |
|---|---|
| **Status** | Resolved (Phase 9) |
| **Production domain** | `https://zinaalmokri.com` |
| **Registrar** | Hostinger |
| **Planned hosting** | Hostinger VPS (deployment itself is out of scope for this phase) |
| **Single source of truth** | `src/config/site.ts → SITE_URL` |
| **Places updated to change this** | **1** — the constant itself |

---

## 1. The change

```diff
- export const SITE_URL = "https://example.invalid";
+ export const SITE_URL = "https://zinaalmokri.com";
```

That is the entire code change this decision required. Every phase since 4 built absolute-URL
generation around this one constant specifically so that resolving U-01 would be exactly this —
`src/config/site.ts`'s own Phase 0 comment said so directly: *"When it is, change this one line.
Nothing else needs to move."* It didn't.

---

## 2. What was audited, and what was found

Per the brief's instruction to "audit every existing place where SITE_URL, canonical URLs, RSS
URLs, sitemap URLs, Open Graph URLs, structured data URLs, or absolute links are generated" before
assuming the single-line change was sufficient:

| Surface | Mechanism | Result |
|---|---|---|
| Canonical tags | `absoluteUrl()` (`src/lib/routing.ts`) | ✓ follows `SITE_URL` |
| hreflang alternates | `absoluteUrl()` via `alternatesFor()` | ✓ |
| Open Graph `og:url` | `meta.canonical`, same source | ✓ |
| JSON-LD `@id`/`url` | `absoluteUrl()` throughout `src/lib/seo.ts` | ✓ |
| Sitemap (`/sitemap.xml`, `/sitemap-en.xml`, `/sitemap-ar.xml`) | `absoluteUrl()` throughout `src/lib/sitemap.ts` | ✓ |
| robots.txt `Sitemap:` line | `absoluteUrl(machinePath.sitemapIndex())` | ✓ |
| RSS feed `<link>`/`<guid>`/`atom:link` | `absoluteUrl()` throughout `src/lib/feed.ts` | ✓ |
| `astro.config.ts` `site` | Imports `SITE_URL` directly | ✓ — cannot disagree by construction |

**No second, competing source was found.** `tests/global.test.mjs`'s "no template contains a
domain literal" test (unchanged since Phase 4) independently confirms this by scanning every
`.astro`/`.ts`/`.css` source file for a hardcoded origin outside `site.ts` itself.

### The one adjacent field that was deliberately NOT touched

`content/mock/site.json → domain.value` is `"https://zinaalmokri.example.com"` — an **invented**
mock value, explicitly marked `_verification: "MOCK"` since Phase 0, with its own note stating it
"remains blocking for canonical URLs, hreflang, sitemap generation and Search Console." Nothing in
the codebase has ever read this field; `SITE_URL` was deliberately built as the sole source of
truth specifically to avoid depending on it. It was left exactly as it was — updating it would add
a second URL fact to keep in sync with zero functional benefit, and `tests/robots.test.mjs` /
`tests/phase9.test.mjs` explicitly assert it never leaks into any build output.

---

## 3. Verified in the build, not assumed from the diff

Every one of the following was checked against the actual rendered output, not inferred from the
source change:

| Check | Result |
|---|---|
| Every page's `<link rel="canonical">` starts with `https://zinaalmokri.com` | ✓ 85/85 |
| Every `hreflang` alternate uses the same origin | ✓ |
| `sitemap.xml` points at `https://zinaalmokri.com/sitemap-{en,ar}.xml` | ✓ |
| Every forced-open sitemap `<loc>` (56 URLs) uses the new origin | ✓ |
| `robots.txt`'s `Sitemap:` line uses the new origin | ✓ |
| Every forced-open RSS item's `<link>`/`<guid>` uses the new origin | ✓ |
| No page anywhere still contains `example.invalid` | ✓ |
| No page anywhere contains the invented `zinaalmokri.example.com` | ✓ |

---

## 4. Trailing slash, HTTPS, www

| Decision | State | Source |
|---|---|---|
| Trailing slash | Always (`/path/`, never `/path`) | `astro.config.ts → trailingSlash: "always"`, unchanged since Phase 4 |
| HTTPS | Canonical, the only scheme `SITE_URL` ever specifies | `src/config/site.ts` |
| www vs. non-www | **Non-www** — `SITE_URL` has none, and nothing in the codebase ever adds one | `src/config/site.ts` |

All three were already fixed, consistent decisions from earlier phases; the domain resolution did
not require revisiting any of them, and nothing about them changed.

---

## 5. What resolving the domain does NOT do

Resolving WHERE the site will live is independent of WHETHER its content is ready to be found.

`IS_INDEXABLE_BUILD` (`src/lib/content.ts`) is driven entirely by `CONTENT_SOURCE === "mock"`, a
constant this phase did not touch. Every page in this build is still `noindex`, the sitemap and RSS
feed are still empty, and the mock guard still fails the build — a real domain publishing a mock
corpus is exactly the scenario the guard exists to catch, and it still does. See
`docs/reports/PHASE_9_REPORT.md` for the full MOCK/VERIFIED boundary this phase drew.

---

## 6. Deployment — explicitly out of scope

The project owner named Hostinger as the registrar and a future Hostinger VPS as the hosting
target. Per the brief, "the actual VPS deployment can be handled separately," and this phase made
no server/DNS/TLS change. The repository contains **no deployment configuration of any kind** —
checked: no `.htaccess`, `nginx.conf`, `vercel.json`, `netlify.toml`, or `Dockerfile` exists — so
there was nothing to update even under the brief's own exception for repositories that already
carry deployment config.

**Deployment dependency, recorded honestly:** when the VPS is provisioned, the build output
(`npm run build` → `dist/`) needs to be served as static files with HTTPS terminating at
`zinaalmokri.com`. Nothing about that step is decided or implemented here.
