/**
 * JOURNAL RSS FEED TESTS.
 *
 * Same two-kind pattern as tests/sitemap.test.mjs: lib-level tests against the real corpus with
 * the `indexableBuild` override forced `true` (proving the item-building logic, since the corpus
 * can never exercise it through the real endpoint), and built-output tests against `dist/` as
 * `npm run build` actually produces it (proving the current, honest, empty state).
 */

import { test, describe, before } from "node:test";
import { SITE_URL } from "../src/config/site.ts";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { journalFeed, renderJournalFeedXml } from "../src/lib/feed.ts";
import { journalArticles, person } from "../src/lib/content.ts";
import { categoryLabel } from "../src/lib/journal-labels.ts";
import { absoluteUrl, machinePath, path } from "../src/lib/routing.ts";
import { assertWellFormedXml } from "./helpers/xml.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

let en, ar;
before(() => {
  assert.ok(existsSync(dist), "dist/ not found — run `npx astro build` first");
  en = readFileSync(join(dist, "en", "journal", "rss.xml"), "utf8");
  ar = readFileSync(join(dist, "ar", "journal", "rss.xml"), "utf8");
});

/* ================================================================= current (mock) build */

describe("the current build's feeds are honestly empty", () => {
  test("journalFeed() with no override returns a channel with zero items", () => {
    const channel = journalFeed("en");
    assert.equal(channel.items.length, 0);
  });

  test("the built en and ar feeds are valid RSS with zero <item> elements", () => {
    for (const [label, xml] of [["en", en], ["ar", ar]]) {
      assertWellFormedXml(xml, `${label} rss.xml`);
      assert.match(xml, /<rss version="2\.0"/);
      assert.ok(!xml.includes("<item>"), `${label} feed carries an item while the build is mock`);
    }
  });

  test("no __MOCK_DATA__ marker in the built feed — there is nothing mock in it to mark", () => {
    assert.ok(!en.includes("__MOCK_DATA__"));
    assert.ok(!ar.includes("__MOCK_DATA__"));
  });

  test("channel metadata is real (siteName + journal intro), not fabricated", () => {
    assert.match(en, /<title>Zina Almokri — Journal<\/title>/);
    assert.match(ar, /<title>زينا المقري — المجلة<\/title>/);
  });

  test("the channel link and atom:link use the single canonical origin", () => {
    assert.ok(en.includes(absoluteUrl(path.journalIndex("en"))));
    assert.ok(en.includes(absoluteUrl(machinePath.journalRss("en"))));
  });

  test("no contact email or author address appears anywhere in either feed", () => {
    // RSS's native <author> element requires an email per spec; none has been confirmed (Phase 7
    // D7-6), so this feed must never emit one, in either locale, ever.
    for (const xml of [en, ar]) {
      assert.ok(!/<author>/.test(xml), "an <author> element was emitted");
      assert.ok(!/[\w.+-]+@[\w-]+\.[\w.]+/.test(xml), "an email-shaped string appears in the feed");
    }
  });
});

/* ================================================================= forced open, real corpus */

describe("item building — proven against the REAL corpus, override forced true", () => {
  test("English feed carries exactly the 5 renderable English articles", () => {
    const channel = journalFeed("en", true);
    assert.equal(channel.items.length, journalArticles("en").length);
    assert.equal(channel.items.length, 5);
  });

  test("Arabic feed carries exactly the 5 renderable Arabic articles", () => {
    const channel = journalFeed("ar", true);
    assert.equal(channel.items.length, 5);
  });

  test("every item's link and guid match the real article route, and agree with each other", () => {
    const channel = journalFeed("en", true);
    for (const item of channel.items) {
      assert.equal(item.guid, item.link);
      assert.ok(item.link.startsWith(`${SITE_URL}/en/journal/`));
    }
  });

  test("every item's pubDate is valid RFC-822/1123, derived from the record's real publishedAt", () => {
    const channel = journalFeed("en", true);
    const article = journalArticles("en")[0];
    const matching = channel.items.find((i) => i.link === absoluteUrl(path.journal("en", article.locales.en.slug)));
    assert.equal(matching.pubDate, new Date(`${article.dates.publishedAt}T00:00:00Z`).toUTCString());
    // RFC-1123 shape: "Mon, 22 Feb 2026 00:00:00 GMT"
    assert.match(matching.pubDate, /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/);
  });

  test("every item's category is the real, content-derived editorial format label", () => {
    const channel = journalFeed("en", true);
    for (const article of journalArticles("en")) {
      const item = channel.items.find((i) => i.link === absoluteUrl(path.journal("en", article.locales.en.slug)));
      assert.equal(item.category, categoryLabel("en", article.category));
    }
  });

  test("every item's description is the article's own excerpt, verbatim — not a rendered body", () => {
    const channel = journalFeed("en", true);
    for (const article of journalArticles("en")) {
      const item = channel.items.find((i) => i.link === absoluteUrl(path.journal("en", article.locales.en.slug)));
      assert.equal(item.description, article.locales.en.excerpt);
    }
  });

  test("dc:creator is the CONFIRMED display name, identical for every item", () => {
    const channel = journalFeed("en", true);
    for (const item of channel.items) assert.equal(item.creator, person().name.display);
  });

  test("an English-only article appears in the English feed and not the Arabic one", () => {
    const article = journalArticles("en").find((a) => !a.locales.ar);
    assert.ok(article, "expected an English-only article in the corpus");
    const enChannel = journalFeed("en", true);
    const arChannel = journalFeed("ar", true);
    assert.ok(enChannel.items.some((i) => i.link === absoluteUrl(path.journal("en", article.locales.en.slug))));
    assert.ok(!arChannel.items.some((i) => i.guid.includes(article.locales.en.slug)));
  });
});

/* ================================================================= rendering + mock guard */

describe("rendering — real corpus data, parsed and cross-checked", () => {
  test("a forced-populated feed is well-formed RSS 2.0 XML", () => {
    const xml = renderJournalFeedXml(journalFeed("en", true));
    assertWellFormedXml(xml, "forced en rss.xml");
    assert.match(xml, /<rss version="2\.0" xmlns:atom="[^"]+" xmlns:dc="[^"]+">/);
    assert.equal((xml.match(/<item>/g) ?? []).length, 5);
  });

  test("the __MOCK_DATA__ marker IS present once the feed carries real mock items", () => {
    // The one place this feed's behaviour deliberately differs from the sitemap's: the sitemap
    // never carries mock content (empty while unindexable), but a forced-open feed DOES carry
    // real article titles/excerpts, so the mock guard must be able to catch it exactly like it
    // catches every HTML page.
    const xml = renderJournalFeedXml(journalFeed("en", true));
    assert.ok(xml.includes("__MOCK_DATA__"), "forced feed with items carries no mock marker");
  });

  test("an empty (unforced) feed carries no mock marker — nothing to mark", () => {
    const xml = renderJournalFeedXml(journalFeed("en"));
    assert.ok(!xml.includes("__MOCK_DATA__"));
  });

  test("titles containing XML-special characters would be escaped, not break the document", () => {
    // Defensive: nothing in the current corpus needs this, but the render function must not
    // assume it never will. Exercises escapeXml() through the real rendering path.
    const channel = journalFeed("en", true);
    const spiked = {
      ...channel,
      items: [
        { ...channel.items[0], title: 'Ben & Jerry\'s <review> "test"' },
      ],
    };
    const xml = renderJournalFeedXml(spiked);
    assertWellFormedXml(xml, "escaped title");
    assert.ok(xml.includes("Ben &amp; Jerry"));
    assert.ok(!xml.includes("<review>"));
  });
});
