# RSS Feed Implementation

**The Journal feed, built from the exact same source of truth as the Journal archive — and gated
more strictly than the page it mirrors.**

| | |
|---|---|
| **Status** | Implemented (Phase 8) |
| **Routes** | `/{locale}/journal/rss.xml` — 2, one per locale |
| **Items today** | **0** — gated by `IS_INDEXABLE_BUILD`, like the sitemap |
| **Items the mechanism produces when forced open** | 5 per locale, matching `journalArticles(locale)` exactly |
| **Email addresses emitted** | **0** |

---

## 1. Deferred explicitly in Phase 6, built now

`docs/JOURNAL_SEO.md`, written when the Journal shipped:

> "RSS/Atom. Not built. It would be a second content surface with its own escaping and locale
> rules, and nothing in Phase 6 requires it."

Phase 8 is that surface. The two risks the deferral named — a second escaping system, a second set
of locale rules — are both addressed directly: escaping goes through the one shared `escapeXml()`
every XML output in this project uses (`src/lib/xml.ts`), and the locale rule is not new at all —
`journalFeed(locale)` calls the exact `journalArticles(locale)` the archive page already renders,
so there is no second definition of "what is published in this locale."

---

## 2. Why the feed is gated MORE strictly than the page it mirrors

The Journal index page already renders mock articles for browsing — visible, marked `noindex`, and
carrying the `__MOCK_DATA__` envelope marker in an HTML comment so the mock guard catches it. A
human who deliberately navigates to that URL sees real (if fabricated) content, by design.

An RSS feed is a different kind of surface. **Its entire purpose is external syndication**: a feed
reader or aggregator ingests it and may republish or surface it elsewhere, without a person
choosing to visit the site first. That is a stronger claim than a webpage makes, and it gets the
stronger gate:

```ts
export function journalFeed(locale: Locale, indexableBuild: boolean = IS_INDEXABLE_BUILD): FeedChannel {
  const items = indexableBuild ? journalArticles(locale).map(...) : [];
  ...
}
```

Feed items populate **only when `IS_INDEXABLE_BUILD` is true** — exactly like the sitemap, and
unlike the HTML archive page. While the source is mock, the feed is a structurally valid, correctly
addressed, honestly empty channel:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Zina Almokri — Journal</title>
    <link>https://example.invalid/en/journal/</link>
    <atom:link href="https://example.invalid/en/journal/rss.xml" rel="self" type="application/rss+xml" />
    <description>Writing about how testing works, and what it can and cannot establish. Every article points at the records that evidence it.</description>
    <language>en-GB</language>

  </channel>
</rss>
```

---

## 3. The mock marker — present here, absent from the sitemap, and that asymmetry is deliberate

The sitemap never carries mock content in its current state (empty while ungated), so it never
needs a marker. The RSS feed is different: **once forced open, it genuinely does carry real mock
article titles and excerpts** — that is the entire point of the mechanism existing. So when the
feed has at least one item, it emits the identical `__MOCK_DATA__` marker every HTML page already
carries, as an XML comment:

```xml
<rss ...>
  <!-- __MOCK_DATA__ -->
  <channel>
    ...
```

A build that would syndicate fabricated "Zina Almokri" articles to an external feed reader fails
the exact same mock guard that blocks every other surface — `tools/check-mock-guard.mjs` already
scans `.xml` files (it has since before Phase 8; the extension was in its scan list waiting for
this). `tests/feed.test.mjs` asserts the marker's presence when forced open and its absence when
not, so the asymmetry with the sitemap is verified rather than incidental.

---

## 4. What an item contains, and what it deliberately does not

| Field | Source | Why |
|---|---|---|
| `title`, `link`, `guid` | The article's own locale slug, resolved through `path.journal()` | Same route the archive page links to; `guid isPermaLink="true"` because it IS the permalink |
| `pubDate` | `dates.publishedAt`, converted to RFC-822 | The record's own real date, reformatted — never a build timestamp |
| `category` | `categoryLabel(locale, article.category)` | The same content-derived editorial format label the archive page renders |
| `description` | The article's own `excerpt` | Authored, already-reviewed copy |
| `dc:creator` | `person().name.display` — the one **CONFIRMED** field on the Person record | See §5 |

**Deliberately not the full MDX body.** Rendering MDX outside the page it belongs to would need a
second rendering path with its own escaping rules — the exact risk `docs/JOURNAL_SEO.md` named
when it deferred this feature. An excerpt is real, authored, reviewed text; a truncated render of
the compiled body would not be.

---

## 5. No email address is ever emitted — `dc:creator`, never `<author>`

RSS 2.0's native `<author>` element requires an email address per spec. **No email address has
been confirmed for this project** — Phase 7 established that all three contact addresses in
`site.json` are `MOCK`, and none is published anywhere on the site. Inventing one to satisfy a feed
reader's convention would be exactly the fabrication this entire architecture refuses.

Dublin Core's `dc:creator` needs only a name, so it is used instead — and the name it carries,
`person().name.display`, is the **one field on the Person record marked `_verification:
"CONFIRMED"`** rather than `MOCK` (Phase 7, `ABOUT_IMPLEMENTATION.md` §1).

`tests/feed.test.mjs` asserts no `<author>` element and no email-shaped string appears in either
built feed, in either state.

---

## 6. Locale semantics

- Two independent feeds, `/en/journal/rss.xml` and `/ar/journal/rss.xml`, mirroring the two-file
  sitemap shape.
- `<language>` uses `localeTag()` — the exact `en-GB` / `ar` mapping `format.ts` already uses for
  `Intl.DateTimeFormat`, exported rather than duplicated as a second locale-tag table.
- An English-only article appears only in the English feed; an Arabic-only article only in the
  Arabic one — proven directly against the real corpus with the override forced open.
- No translation stub, no machine translation: exactly the rule every other surface in this
  project already follows.

---

## 7. Autodiscovery

```html
<link rel="alternate" type="application/rss+xml" title="Journal" href="https://example.invalid/en/journal/rss.xml">
```

Added as an optional `feedHref` / `feedTitle` prop on `BaseLayout`, passed only by the three
journal-family templates (index, article, format archive) — most pages have nothing to syndicate,
and a feed link on every page would be noise rather than discovery.
`tests/discovery-audit.test.mjs` asserts the link appears on every journal-family page and no
other, and that it never points cross-locale.

---

## 8. XML correctness

Every text field passes through `escapeXml()` (`src/lib/xml.ts`) — the same function the sitemap
uses. `tests/feed.test.mjs` includes a deliberately hostile title (`Ben & Jerry's <review> "test"`)
through the real rendering path and asserts the output stays well-formed and the raw markup does
not survive.

---

## 9. Testing

| File | What it proves |
|---|---|
| `tests/feed.test.mjs` (18 tests) | Current build is empty in both locales; item count, dates, categories, descriptions and creator match the real corpus exactly when forced open; no email ever appears; the mock marker appears exactly when — and only when — the feed carries content; XML stays well-formed under hostile input |
| `tests/discovery-audit.test.mjs` | Feed autodiscovery scope and locale-correctness against the full built site |

---

## 10. Known limits

| Limit | Status |
|---|---|
| Zero items in the current build | By design, while the source is mock. |
| Descriptions are excerpts, not full content | Deliberate — see §4. |
| No `<enclosure>` (podcast/media) support | Nothing on the site is audio or video. |
| Production origin (U-01) | Every feed URL is `https://example.invalid/...` until a real domain exists. |
