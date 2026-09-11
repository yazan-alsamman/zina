# Phase 8 — Decision Log

**Sitemap, robots.txt, RSS feed, discovery consistency.**

Every decision that constrains future work, with the alternative rejected and why. Decisions are
numbered `D8-n`.

---

## D8-1 — The sitemap consumes existing gates; it does not re-derive them

**Decision.** `discoverableUrls()` calls `facetIndexing()`, `brandIsIndexable()`,
`entityBrands()`, `categoryFacets(...).indexable` and `journalCategories(...).indexable` — the
exact functions each page template already calls for its own robots meta and hreflang.

**Rejected.** Writing a second, sitemap-specific indexability computation.

**Why.** Two implementations of one rule diverge eventually. `facetIndexing()` in particular is
already shared between the review-category and journal-format-archive pages; Phase 8 adds a third
caller rather than a fourth rule. `docs/MULTILINGUAL_SEO_ARCHITECTURE.md` section 8 makes this a
hard requirement, not a style preference: "Sitemap and head-level hreflang must agree; a mismatch
is a reliable way to have both ignored."

**Verified, not just constructed.** `tests/sitemap.test.mjs` parses every listed page's actual
rendered `<head>` and asserts the sitemap's declared alternates match it exactly, for all 56
forced-open URLs.

---

## D8-2 — The current sitemap is empty, and that is correct

**Decision.** `IS_INDEXABLE_BUILD` composes into every branch of `discoverableUrls()`. Today it is
`false`, so the function returns `[]`.

**Rejected.** Populating the sitemap regardless of build state, on the theory that "the sitemap
should show what the site would look like."

**Why.** A sitemap listing a URL whose own page says `noindex` is a direct, well-documented
contradiction. The mock guard's entire purpose is to prevent the fabricated content layer from
reaching production in any form; a populated sitemap of mock URLs would be exactly that, in a file
the guard would need a new signature to catch. An empty, structurally valid sitemap needs no
special case — it is simply what "no page here is indexable" looks like.

---

## D8-3 — The gate is proven with a boolean override, not synthetic fixtures

**Decision.** `discoverableUrls(indexableBuild: boolean = IS_INDEXABLE_BUILD)` and
`journalFeed(locale, indexableBuild: boolean = IS_INDEXABLE_BUILD)` both take a plain override
parameter. Tests pass `true`; the production endpoint never does.

**Rejected.** Phase 7's exact pattern — synthetic fixtures that never touch content.

**Why the pattern changed.** Phase 7's Results Figure gate protected against fabricated
*evidence* (a number attributed to a real commercial outcome); a synthetic fixture was necessary
because even a test-only confirmed figure would be indistinguishable from a real claim if it leaked.
Here, the gate protects against fabricated *verification status* — there is nothing sensitive
about a review or a brand *existing* in the sitemap, only about presenting one as production-ready
before it is. Testing with the real corpus and a boolean override proves the actual gate logic
against actual data, which a synthetic fixture cannot do as thoroughly (it would only prove the
override works, not that all 20-odd real records compute the same set the pages themselves would).

**The override never ships.** It is a parameter with a production-safe default, not an environment
variable or a build flag — there is no way to reach it from the built site.

---

## D8-4 — robots.txt is constant; it never reads `IS_INDEXABLE_BUILD`

**Decision.** The same four lines, every build, mock or real.

**Rejected.** Making robots.txt `Disallow: /` while the build is mock, mirroring the site-wide
`noindex` behaviour.

**Why.** robots.txt controls **crawling**; `<meta name="robots">` controls **indexing**. These are
different mechanisms answering different questions, and the existing architecture already commits
to indexing being governed entirely by the per-page meta tag. Making robots.txt ALSO gate on build
state would create a second place the same "is this ready" decision is made, and — more
concretely — blocking crawl access to a `noindex` page would hide that very `noindex` tag from the
crawler, producing the well-documented "indexed, though blocked by robots.txt" failure the
opposite of what a preview-safety mechanism should do.

---

## D8-5 — Nothing is Disallowed, including the gated facet pages

**Decision.** `Allow: /`. No `Disallow` rule of any kind.

**Rejected.** Blocking `/reviews/brand/` and the gated category/format archive paths, on the
theory that thin or permanently-noindex pages shouldn't be crawled at all.

**Why.** A crawler that cannot fetch a page cannot see its `noindex` meta tag or its canonical
link either — it can only see that robots.txt refused the request. Letting the fetch happen and
the meta tag do its job is not just what the Phase 8 brief asks for ("do not disallow legitimate
public routes merely as a shortcut"); it is the only configuration under which the existing
architecture's per-page directives actually reach a crawler.

---

## D8-6 — The RSS feed is gated more strictly than the HTML page it mirrors

**Decision.** `journalFeed()` populates items only when `IS_INDEXABLE_BUILD` is true. The Journal
HTML index page, by contrast, always renders its mock articles for browsing (marked `noindex`,
carrying the `__MOCK_DATA__` marker).

**Why the two surfaces are gated differently.** A webpage a human deliberately navigates to is one
kind of exposure. An RSS feed's entire purpose is **external syndication** — a feed reader or
aggregator ingests it and may republish it without anyone choosing to visit the site first. That is
a stronger claim than a webpage makes on its own, so it gets the stronger gate: the same one the
sitemap uses, not the browsable-but-marked one the HTML archive uses.

**Consequence.** When the override forces the feed open in a test, the feed genuinely carries mock
titles and excerpts — so, unlike the sitemap, it needs (and gets) the `__MOCK_DATA__` marker. The
sitemap and the feed are gated by the identical boolean and differ only in what they emit once
open, because only one of them ever contains content.

---

## D8-7 — `dc:creator`, never RSS's native `<author>`

**Decision.** Every feed item carries `<dc:creator>{name}</dc:creator>`. No `<author>` element is
ever emitted.

**Why.** RSS 2.0's spec requires an email address inside `<author>`. Phase 7 established that no
contact email has been confirmed for this project — every address in `site.json` is `MOCK`, and
none is published anywhere on the site (`docs/CONTACT_IMPLEMENTATION.md`). Emitting one to satisfy
a feed reader's formatting convention would be exactly the fabrication this project's architecture
exists to refuse. Dublin Core's `dc:creator` needs only a name, and the name it carries is the one
field on the Person record marked `CONFIRMED` rather than `MOCK`.

---

## D8-8 — Descriptions are excerpts, never rendered MDX bodies

**Decision.** Each item's `<description>` is the article's own `excerpt` field.

**Rejected.** Rendering the full MDX body into the feed (either as plain text or `content:encoded`
HTML).

**Why.** `docs/JOURNAL_SEO.md` deferred RSS specifically because it "would be a second content
surface with its own escaping and locale rules." Rendering MDX outside the page component it
belongs to would require a second rendering path with its own escaping guarantees — exactly that
risk. An excerpt is real, authored, already-reviewed prose; a truncated render of compiled MDX
would not carry the same editorial confidence.

---

## D8-9 — `lastmod` only where a real date exists; `YYYY-MM` is honest, not sloppy

**Decision.** Reviews and journal articles carry `lastmod` from `dates.updatedAt`. Work records
carry `lastmod` as `month` verbatim (`"2026-06"`). Brand entities and every static/index page carry
no `lastmod` at all.

**Rejected.** Defaulting a missing date to the build timestamp, or padding `month` to a fake
`"2026-06-01"`.

**Why.** The sitemap protocol's W3C-datetime format explicitly permits year-month precision, so
`month` verbatim is not an approximation — it is the real, finest-grained date the record states,
with no day invented. A build timestamp on a page nothing changed would be a fabricated freshness
signal, the same class of dishonesty `docs/JOURNAL_SEO.md` already refused for `dateModified`
("only emitted when it actually differs from `datePublished`"). Brand has no `dates` field on the
schema at all — there is no real value to report, so none is reported.

---

## D8-10 — `priority`/`changefreq` are read live from `site.json`, never copied into code

**Decision.** `routeMeta(key)` looks up `site().routes.find(r => r.key === key)` at call time.

**Why.** `site.json → routes[]` already declares these values per route key, authored in Phase 0
specifically for this purpose. Copying them into `sitemap.ts` as a second literal table would be
two places stating one fact — an editorial change to `site.json`'s priorities would silently stop
reaching the sitemap until someone remembered to update both.

---

## D8-11 — The domain-literal test gained a namespace-URI exemption, not a weaker rule

**Decision.** `tests/global.test.mjs`'s "no template contains a domain literal" test now also
excludes `sitemaps.org`, `w3.org` and `purl.org`, alongside the pre-existing `schema.org`
exemption.

**Trigger.** The new `.ts` endpoint files contain the XML/RDF namespace URIs the sitemap and RSS
specs require verbatim (`http://www.sitemaps.org/schemas/sitemap/0.9`,
`http://www.w3.org/1999/xhtml`, `http://www.w3.org/2005/Atom`, `http://purl.org/dc/elements/1.1/`)
— none of which is a fact about this site's own origin.

**Why this is not weakening the guard.** A namespace URI identifies a *vocabulary*
(schema.org already established the precedent for JSON-LD), not a *site*. It is identical in every
sitemap or RSS document that has ever existed, cannot be confused with a real canonical URL by a
reviewer or a script, and is required by the format itself — omitting it would make the XML
invalid, not more honest. The test's actual purpose — catching an accidentally hardcoded site
origin instead of `SITE_URL` — is undiminished; if anything it is more precise now, since it no
longer has to rely on `sitemaps.org`/`w3.org` happening to never appear in source.

---

## D8-12 — The dead-link test now checks real files, not only `index.html` routes

**Decision.** `tests/global.test.mjs`'s dead-navigation check now treats an extension-bearing href
(`.xml`, `.txt`) as resolved when a real file exists at that path in `dist/`, in addition to its
existing `index.html`-route check.

**Trigger.** The new RSS autodiscovery `<link href="/en/journal/rss.xml">` is a real file, not an
`index.html`-based page route, so the existing dead-link scanner (built only from `index.html`
files) would have flagged it as dead.

**Why this generalises correctness rather than special-casing one file.** The fix checks
`existsSync` against the actual build output for any recognisably-a-file href, so it would equally
catch a genuinely broken link to any future non-page asset — a strictly more complete dead-link
check, not an exception carved out for this feature.

---

## Decisions carried forward, unchanged

| # | From | Still true |
|---|---|---|
| — | Phase 7 | An unverified value is an absence, and it renders as one — governs every gate in this phase |
| — | Phase 4 | `SITE_URL` is the single canonical origin; nothing in this phase reads `site.json → domain.value` |
| — | Phase 6 | No second content surface without its own escaping/locale discipline — RSS finally built, on those terms |
| — | Phase 7 | Mock guard scans must extend to every new distributable surface, not just HTML — `.xml`/`.txt` were already in its scan list, and the RSS feed now actually exercises that coverage |

---

## Decisions requiring the owner

Unchanged from Phase 7 (`docs/PHASE_7_DECISION_LOG.md` H-1…H-10), plus:

| # | Decision | Why it needs a person |
|---|---|---|
| **H-11** | Submitting the sitemap to Search Console | Blocked until U-01 (production domain) is resolved — the mechanism is complete, the submission is not possible yet. |
