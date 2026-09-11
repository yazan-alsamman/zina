# Phase 8 — Completion Report

**Sitemap, robots.txt, RSS Feed, Discovery Consistency**

| | |
|---|---|
| **Status** | Complete |
| **Phase** | 8 — discovery & syndication |
| **Date** | 2026-09-11 |
| **Overall confidence** | **High** on the gates, the shared-function reuse, the cross-validation against built output, and the test suite. **Blocked** on Search Console submission (U-01 — no production domain exists yet to submit) |
| **Routes (index.html)** | **85 → 85**, unchanged |
| **New machine surfaces** | `/sitemap.xml`, `/sitemap-en.xml`, `/sitemap-ar.xml`, `/robots.txt`, `/{locale}/journal/rss.xml` |
| **Client JavaScript** | **0 bytes**, unchanged |
| **Tests** | **345 → 416**, all passing |
| **Next phase begun** | **No.** Stopped at the Phase 9 gate |

---

## Executive Summary

Phase 8 implements the three discoverability surfaces every prior phase deliberately deferred to
it — `src/lib/facets.ts` and `src/lib/journal.ts` each carry a comment naming this exact phase as
the intended consumer of their indexability data. The phase adds no new content surface and no new
visual page: it is entirely a discovery layer over what Phases 4–7 already built.

**The governing rule is unchanged from Phase 7 and was extended, not reinterpreted:** an
unverified value is an absence, and it renders as one. Applied here, that means the sitemap and
RSS feed are **currently empty** — not as a placeholder, but because `IS_INDEXABLE_BUILD` is
`false` while the content source is mock, and listing a URL whose own page says `noindex` is a
direct, well-documented contradiction. The mechanism itself is fully built and fully proven: a
boolean override (never reachable from the production endpoint) forces every gate open against the
**real mock corpus** and produces exactly 56 sitemap URLs and 10 feed items, matching the known
corpus counts precisely.

**Nothing here is a second implementation of an existing gate.** The sitemap calls the identical
functions — `facetIndexing()`, `brandIsIndexable()`, `entityBrands()`, the category/format
`.indexable` flags — that each page template already calls for its own robots meta and hreflang
set. `docs/MULTILINGUAL_SEO_ARCHITECTURE.md` section 8 makes agreement between the sitemap and
head-level hreflang a hard requirement, and this is verified directly: the test suite parses every
listed page's actual rendered `<head>` and asserts the sitemap's declared alternates match it
exactly, for all 56 forced-open URLs — not assumed from shared code, checked against the built
site.

**One real, if narrow, finding:** the RSS feed and the sitemap are deliberately gated by the same
boolean but for different reasons. A webpage a human navigates to is one kind of exposure; an RSS
feed's purpose is external syndication to readers and aggregators that may republish it without a
human ever visiting the site. That is a stronger claim, so the feed is gated exactly like the
sitemap rather than like the browsable-but-marked HTML Journal index — and, forced open, it
genuinely carries mock content, so it (correctly) carries the `__MOCK_DATA__` marker the sitemap
never needs.

**Two existing tests needed real fixes, not weakening.** The domain-literal scanner flagged the
XML/RDF namespace URIs the sitemap and RSS specs require verbatim; it was extended with the same
kind of exemption `schema.org` already had, for the same reason (a namespace identifies a
vocabulary, not a site origin). The dead-link scanner, built only from `index.html` routes, would
have flagged the new RSS autodiscovery `<link>` as dead; it now also recognises real on-disk files,
which is a strictly more complete check, not a special case.

---

## Git / Repository Verification

Performed non-destructively before any file was touched, per the brief.

| Check | Result |
|---|---|
| `git rev-parse --show-toplevel` | The Zina project root ✓ |
| `git remote -v` | `origin → github.com/yazan-alsamman/zina.git` (fetch + push) ✓ |
| `git branch --show-current` | `main`, synchronized with `origin/main` ✓ |
| `git status --short` | Clean, matched the stated baseline exactly ✓ |

| | |
|---|---|
| **Phase 7 baseline** | `333ba21` (implementation), `dd27ed7` (documentation) |
| **Phase 8 implementation** | `a1c5c3f` — *"Phase 8: sitemap, robots.txt, RSS feed, discovery consistency"* |
| **Phase 8 documentation** | see the final line of this report |

`tests/repository.test.mjs` (Phase 7) re-verified alongside every other suite: git root, tracked-
file safety, remote sanity — all still pass with zero code changes needed.

---

## Phase 7 Baseline — preserved

Verified against the stated baseline before any change; re-verified after.

| Invariant | Before | After |
|---|---|---|
| Routes (`index.html`) | 85 | **85** |
| Tests | 345/345 | **416/416** |
| Dead links | 0 | **0** |
| `astro check` | 0/0/0 | **0/0/0** |
| Client JavaScript | 0 bytes | **0 bytes** |
| Mock guard | exit 1 | **exit 1** |
| Working tree | clean | **clean** |

No regression was found in the existing surfaces. Two existing tests were **corrected** (§ Defects
Found and Fixed) — both false positives triggered by legitimate new content, not behavioural
weakenings.

---

## Sitemap

Full detail: `docs/SITEMAP_IMPLEMENTATION.md`.

**Shape**, per `docs/MULTILINGUAL_SEO_ARCHITECTURE.md` section 8, written in Phase 0 and
implemented here for the first time:

```
/sitemap.xml          index
  /sitemap-en.xml     English URLs only
  /sitemap-ar.xml     Arabic URLs only
```

**Current build: 0 URLs**, both files. `IS_INDEXABLE_BUILD` is `false` while the source is mock;
composed into every branch of `discoverableUrls()` exactly as every page composes it into its own
robots meta tag, this means the function returns nothing. An empty, structurally valid sitemap is
the only honest output while no page on the site is indexable.

**Mechanism, proven forced-open against the real corpus:**

| Family | en | ar |
|---|---|---|
| Static pages | 11 | 11 |
| Reviews | 5 | 5 |
| Journal articles | 5 | 5 |
| Work | 4 | 3 |
| Brand entities | 4 | 3 |
| **Total** | **29** | **27** — **56 overall** |

Matches the known corpus exactly, including every established asymmetry (one English-only review,
journal article and work record; `veloura-beauty` gated in Arabic). **Zero category or
journal-format facets appear**, forced open or not — none reaches its own thin-page gate.

**Permanently excluded, regardless of build state:** the brand facet (`/reviews/brand/{slug}/` —
permanently `noindex`, canonicalises away), `/404/` (hardcoded `noindex`), `/press/` and
`/brands/{brand}/{product}/` (both declared but not built).

`lastmod` is emitted only where a real record date exists (reviews/journal: `dates.updatedAt`;
work: `month`, verbatim, no day invented) and omitted everywhere else — no build timestamp, no
synthesised freshness signal. `priority`/`changefreq` are read live from `site.json → routes[]`,
never copied into code.

---

## robots.txt

Full detail: `docs/ROBOTS_IMPLEMENTATION.md`.

```
User-agent: *
Allow: /

Sitemap: https://example.invalid/sitemap.xml
```

Four lines, **constant regardless of build state** — it does not read `IS_INDEXABLE_BUILD`.
Indexing is already governed entirely by the per-page `<meta name="robots">`; robots.txt answers
the separate question of whether a crawler may fetch a page at all, and there is nothing on this
site it should be blocked from fetching.

**Nothing is `Disallow`ed**, including the gated facet pages. Blocking crawl access to a page hides
its own `noindex` meta tag from the crawler that would otherwise read it — the well-documented
"indexed, though blocked by robots.txt" failure. Allowing the fetch and letting the meta tag do its
job is the only configuration under which the existing per-page architecture reaches a crawler at
all.

The `Sitemap:` line uses `absoluteUrl()` — the same `SITE_URL` constant every canonical,
hreflang and JSON-LD block already uses — **never** `site.json → domain.value`, which is an
invented mock value (`"https://zinaalmokri.example.com"`, explicitly marked `_verification:
"MOCK"`) that Phase 8 does not touch.

---

## RSS / Journal Feed

Full detail: `docs/RSS_IMPLEMENTATION.md`.

`/{locale}/journal/rss.xml` — two feeds, built from the exact `journalArticles(locale)` the
archive page renders. **Deferred explicitly in Phase 6** ("a second content surface with its own
escaping and locale rules"); both named risks are addressed by reuse rather than a second system —
the shared `escapeXml()` and the archive page's own article set.

**Gated more strictly than the page it mirrors.** The Journal HTML index always renders its mock
articles for browsing (marked `noindex`, carrying `__MOCK_DATA__`). The feed's purpose — external
syndication to readers that may republish without a human visiting first — is a stronger claim, so
it is gated by `IS_INDEXABLE_BUILD` exactly like the sitemap. **Current build: 0 items, both
locales.**

**Forced open, against the real corpus:** 5 items per locale, matching `journalArticles(locale)`
exactly. Verified: link/guid agree and are real routes; `pubDate` is real RFC-822 derived from the
record's own `publishedAt`; `category` is the real content-derived format label; `description` is
the article's own `excerpt`, never a rendered MDX body; `dc:creator` is the Person record's one
**CONFIRMED** field, `name.display`.

**No email address is ever emitted.** RSS's native `<author>` requires one by spec; none has been
confirmed for this project (Phase 7). `dc:creator` (Dublin Core, name only) is used instead —
verified absent, in both build states, by direct assertion against the built XML.

**The mock marker asymmetry with the sitemap is deliberate and tested.** A forced-open feed
genuinely carries mock titles/excerpts, so it carries `__MOCK_DATA__` exactly like every HTML page;
an empty feed carries no marker, because there is nothing mock in it to mark. Both states are
asserted directly.

---

## SEO / Discovery Consistency Audit

`tests/discovery-audit.test.mjs` — the dedicated cross-surface audit, run against `dist/` as
actually built, no override.

| Audit item | Method | Result |
|---|---|---|
| Canonical URLs | Exactly one `<link rel="canonical">` per page, every page | ✓ |
| hreflang | Sitemap alternates parsed against every listed page's rendered `<head>` | ✓ agree |
| Language switcher behaviour | Unchanged from Phase 7 — full suite re-run | ✓ |
| Sitemap inclusion/exclusion | Bidirectional: every indexable page ↔ every sitemap entry | ✓ **both directions hold, both sets empty today** |
| Robots policy | No `Disallow` rule ever blocks a sitemap-listed (forced-open) URL | ✓ |
| RSS links | Feed autodiscovery present on every journal-family page, no other page, never cross-locale | ✓ |
| Route status | Every sitemap/feed URL resolves to a page/file actually emitted | ✓ |
| Dead links | Full-site scan, extension-aware | ✓ **0** |
| Locale consistency | Feed `<language>`, alternates, x-default rules all locale-correct | ✓ |
| Duplicate/conflicting metadata | Exactly one canonical + one robots meta per page; no page claims both index and noindex | ✓ |
| Accidental indexable/non-indexable | Same bidirectional check as sitemap inclusion | ✓ |
| MOCK values leaking into SEO metadata | Invented `zinaalmokri.example.com` domain absent from every new surface; no raw record id in any URL | ✓ |

---

## Testing

**416 tests, 95 suites, 0 failures** (up from 345).

| Suite | Tests | Covers |
|---|---|---|
| `sitemap.test.mjs` | 28 | Current-build emptiness; every gate forced-open against the real corpus (56 URLs, exact count); brand-facet/404/press permanent exclusion; lastmod format discipline per family; priority/changefreq sourced live; alternates parsed against real rendered `<head>` for every listed URL; XML well-formedness |
| `robots.test.mjs` | 12 | Content matches the lib function exactly; minimal explicit policy; nothing disallowed; sitemap reference uses `SITE_URL`, never the invented mock domain; referenced file exists |
| `feed.test.mjs` | 18 | Current-build emptiness in both locales; item fields forced-open against the real corpus; no email ever emitted; mock-marker presence exactly matches content presence; XML stays well-formed under a hostile title |
| `discovery-audit.test.mjs` | 13 | Bidirectional indexable↔sitemap membership; robots/sitemap non-contradiction; RSS autodiscovery scope; no duplicate metadata; no mock leakage |
| existing suites | 345 | Phases 4–7, all still passing (2 tests corrected — see Defects) |

`tests/helpers/xml.mjs` — a small, dependency-free well-formedness checker (tag balance, entity
escaping) written for these tests specifically, matching the project's existing convention of
regex-based validation against built output rather than adding a parsing dependency.

---

## Astro Check

```
Result (87 files):
- 0 errors
- 0 warnings
- 0 hints
```

## Production Build

```
85 page(s) built
```

Plus five machine files: `sitemap.xml`, `sitemap-en.xml`, `sitemap-ar.xml`, `robots.txt`, and two
`rss.xml` (one per locale) — none of which is an `index.html` page, so the 85-route count is
unaffected by design.

## Mock Guard

```
node tools/check-mock-guard.mjs dist  →  exit 1
This build contains fabricated content and must not be deployed.
```

**Expected and correct, unchanged.** `.xml` and `.txt` were already in the guard's scan-extension
list before this phase — it was already prepared for these files, and no guard code changed. The
new RSS/sitemap files carry no mock trace in the current build (they are honestly empty), which is
itself verified by test rather than assumed.

## Client JavaScript Audit

```
dist/_astro/*.js          0 files
<script> outside JSON-LD  0 pages
```

Unchanged. No new dependency was added to the site's runtime — the XML/RSS generation is entirely
build-time string construction with zero client-side component.

---

## Browser Verification

**Not performed, and not applicable.** Phase 8 added no new visual page and no new rendered
content — every change to an existing template is confined to `<head>` (the optional RSS
autodiscovery `<link>`, invisible in the rendered body), and the three new machine surfaces
(sitemap, robots.txt, RSS) are not HTML documents a browser renders as a page at all. The
established 320/375/768/1024/1440 × en/ar workflow exists to catch visual regressions in rendered
content; there is no rendered surface here for it to check. Verification instead took the form
appropriate to the actual surface: XML well-formedness parsing and direct comparison against every
affected page's rendered `<head>`, both described above.

---

## Defects Found and Fixed

**1. The domain-literal scanner flagged required XML/RDF namespace URIs.** The new `.ts` endpoint
files contain `http://www.sitemaps.org/...`, `http://www.w3.org/1999/xhtml`,
`http://www.w3.org/2005/Atom` and `http://purl.org/dc/elements/1.1/` — spec-required, universal
across every sitemap/RSS document, and not a fact about this site's own origin. **Fixed by
extending the existing exemption** that already covered `schema.org` for the identical reason (a
namespace identifies a vocabulary, not a site), rather than weakening the check's actual purpose —
catching an accidentally hardcoded site origin — which remains fully intact.

**2. The dead-link scanner did not recognise real, non-`index.html` files.** Built only from
`index.html`-derived routes, it would have flagged the new RSS autodiscovery `<link
href="/en/journal/rss.xml">` as dead. **Fixed by adding a direct on-disk existence check** for any
extension-bearing href, which strictly generalises the check (it would now equally catch a broken
link to any future non-page asset) rather than special-casing this one feature.

Neither fix reduced what either test catches. Both were re-verified to still fail on their original
failure modes before being accepted.

---

## Known Limitations

| # | Limitation | Severity |
|---|---|---|
| 1 | Sitemap and RSS feed are empty in the current build | **By design**, while the source is mock |
| 2 | Sitemap cannot be submitted to Search Console | **Blocked by U-01** — no production domain exists |
| 3 | No `<image:image>` sitemap extension | No photography exists yet (Phase 7 — every asset path is a placeholder) |
| 4 | No podcast/media `<enclosure>` in RSS | Nothing on the site is audio or video |
| 5 | No crawl-delay or bot-specific robots rules | Premature at this traffic scale |

---

## Human Review Required

Carried forward from Phase 7, unchanged (`docs/PHASE_7_DECISION_LOG.md` H-1…H-10) — Phase 8 touched
none of them. No new human-verification item was introduced beyond:

- **Search Console submission** — mechanically ready; blocked purely on U-01 (production domain).

Explicitly **not claimed**: no screen-reader pass was performed for Phase 8 because Phase 8
introduced no new screen-reader-relevant surface (no new visible page, no new interactive element —
the one addition, an RSS autodiscovery `<link>` in `<head>`, is not exposed to assistive
technology by design). The Phase 7 screen-reader status (**UNVERIFIED — HUMAN REVIEW REQUIRED**)
stands unchanged and unaffected.

---

## Decisions Required From Owner

See `docs/PHASE_8_DECISION_LOG.md`. All of Phase 7's H-1…H-10 remain open. One addition:

| # | Decision |
|---|---|
| H-11 | Submit the sitemap to Search Console once U-01 (production domain) is resolved — no action possible before then |

---

## Recommended Phase 9

Discovery and syndication are now complete: every surface the Phase 1 architecture specified for
this phase is built, tested, and proven against the real corpus with zero dead links and zero
metadata contradictions.

**Recommendation: Phase 9 should not begin without an owner decision on at least one of the four
blocking unknowns (U-01 production domain, U-03 jurisdiction, a verified contact channel, Method
confirmation).** The site is now structurally and technically complete to the point where further
engineering work has diminishing returns relative to unblocking real content. Analytics, search,
and any further content-facing feature all either depend on one of these decisions or risk
duplicating work once they land.

If engineering work is preferred regardless, the safest next unit is **structured-data
completeness on the surfaces Phase 5–7 left minimal by design** (Product/Offer schema remains
correctly absent everywhere, and should stay absent until real commerce facts exist) — but this is
explicitly a lower-priority suggestion than resolving the blocking unknowns.

**Phase 8 is complete. No Phase 9 work has begun.**
