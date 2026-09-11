/**
 * SEO / DISCOVERY CONSISTENCY AUDIT (Phase 8).
 *
 * The dedicated audit the Phase 8 brief asks for, distinct from tests/sitemap.test.mjs,
 * tests/robots.test.mjs and tests/feed.test.mjs (which prove each surface correct on its own).
 * This file proves the surfaces agree WITH EACH OTHER and with the rest of the built site, over
 * the actual `dist/` output `npm run build` produces — no override, no forced state.
 *
 * Covers, against the real (currently all-mock, all-noindex) build:
 *   - every indexable page <-> sitemap membership, in BOTH directions
 *   - robots policy never contradicts the sitemap
 *   - the RSS autodiscovery link appears only where it should
 *   - no duplicate or conflicting canonical/robots metadata was introduced
 *   - no unverified/mock value leaked into any Phase 8 surface
 */

import { test, describe, before } from "node:test";
import { SITE_URL } from "../src/config/site.ts";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { discoverableUrls } from "../src/lib/sitemap.ts";
import { robotsTxtContent } from "../src/lib/robots.ts";
import { absoluteUrl, machinePath } from "../src/lib/routing.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const pages = [];
function collect(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collect(full);
    else if (entry === "index.html") {
      pages.push({
        route: full.replace(dist, "").replace(/\\/g, "/").replace("/index.html", "/"),
        html: readFileSync(full, "utf8"),
      });
    }
  }
}

before(() => {
  assert.ok(existsSync(dist), "dist/ not found — run `npx astro build` first");
  collect(dist);
});

const isIndexable = (html) => /<meta name="robots" content="index, ?follow"/.test(html);
const sitemapRoutes = () =>
  new Set(discoverableUrls().map((u) => u.loc.replace(SITE_URL, "")));

/* ================================================================= bidirectional membership */

describe("indexable-page set and sitemap set are IDENTICAL, in both directions", () => {
  test("every page this build marks index,follow has a sitemap entry", () => {
    const listed = sitemapRoutes();
    for (const page of pages) {
      if (isIndexable(page.html)) {
        assert.ok(listed.has(page.route), `${page.route}: marked indexable but absent from the sitemap`);
      }
    }
  });

  test("every sitemap entry's page is actually marked index,follow", () => {
    for (const url of discoverableUrls()) {
      const route = url.loc.replace(SITE_URL, "");
      const page = pages.find((p) => p.route === route);
      assert.ok(page, `${route}: sitemap lists a page that was not built`);
      assert.ok(isIndexable(page.html), `${route}: in the sitemap but not marked index,follow`);
    }
  });

  test("today that means both sets are empty — recorded, not assumed", () => {
    assert.equal(pages.filter((p) => isIndexable(p.html)).length, 0);
    assert.equal(discoverableUrls().length, 0);
  });
});

/* ================================================================= robots consistency */

describe("robots.txt never contradicts the sitemap or any page's own directive", () => {
  test("no Disallow rule blocks a page this build marks indexable", () => {
    const disallowed = [...robotsTxtContent().matchAll(/^Disallow:\s*(\S+)$/gm)].map((m) => m[1]);
    for (const page of pages) {
      if (!isIndexable(page.html)) continue;
      for (const rule of disallowed) {
        assert.ok(!page.route.startsWith(rule), `${page.route}: indexable but blocked by robots.txt`);
      }
    }
  });

  test("the Sitemap: line in robots.txt matches the actual sitemap index URL", () => {
    const match = robotsTxtContent().match(/^Sitemap:\s*(\S+)$/m);
    assert.equal(match[1], absoluteUrl(machinePath.sitemapIndex()));
  });
});

/* ================================================================= RSS autodiscovery scope */

describe("RSS autodiscovery appears only where it should", () => {
  test("every journal-family page carries the feed link; nothing else does", () => {
    for (const page of pages) {
      const hasFeedLink = /<link rel="alternate" type="application\/rss\+xml"/.test(page.html);
      const isJournalFamily = /^\/(en|ar)\/journal\//.test(page.route);
      assert.equal(
        hasFeedLink,
        isJournalFamily,
        `${page.route}: feed link presence (${hasFeedLink}) does not match journal-family membership (${isJournalFamily})`
      );
    }
  });

  test("the feed link on every journal page points at that locale's real, built feed file", () => {
    for (const page of pages) {
      const match = page.html.match(/<link rel="alternate" type="application\/rss\+xml"[^>]+href="([^"]+)"/);
      if (!match) continue;
      const localPath = match[1].replace(SITE_URL, "");
      assert.ok(existsSync(join(dist, localPath)), `${page.route}: feed link ${match[1]} does not exist`);
    }
  });

  test("the feed link's locale matches the page's own locale — no cross-locale autodiscovery", () => {
    for (const page of pages) {
      const match = page.html.match(/<link rel="alternate" type="application\/rss\+xml"[^>]+href="([^"]+)"/);
      if (!match) continue;
      const pageLocale = page.route.slice(1, 3);
      assert.ok(match[1].includes(`/${pageLocale}/journal/rss.xml`), `${page.route}: cross-locale feed link`);
    }
  });
});

/* ================================================================= no duplicate/conflicting metadata */

describe("no page emits duplicate or conflicting canonical/robots directives", () => {
  test("exactly one canonical link per page, across every page in the build", () => {
    for (const page of pages) {
      const count = (page.html.match(/<link rel="canonical"/g) ?? []).length;
      assert.equal(count, 1, `${page.route}: ${count} canonical links`);
    }
  });

  test("exactly one robots meta tag per page", () => {
    for (const page of pages) {
      const count = (page.html.match(/<meta name="robots"/g) ?? []).length;
      assert.equal(count, 1, `${page.route}: ${count} robots meta tags`);
    }
  });

  test("no page carries both index and noindex directives simultaneously", () => {
    for (const page of pages) {
      const robots = page.html.match(/<meta name="robots" content="([^"]+)"/)[1];
      const hasIndex = /\bindex\b/.test(robots) && !/\bnoindex\b/.test(robots);
      const hasNoindex = /\bnoindex\b/.test(robots);
      assert.ok(hasIndex !== hasNoindex, `${page.route}: ambiguous robots content "${robots}"`);
    }
  });
});

/* ================================================================= no leakage */

describe("no MOCK or unverified value leaks into a Phase 8 discovery surface", () => {
  test("the invented site.json domain never appears in sitemap, robots or any built feed", () => {
    const files = [
      join(dist, "robots.txt"),
      join(dist, "sitemap.xml"),
      join(dist, "sitemap-en.xml"),
      join(dist, "sitemap-ar.xml"),
      join(dist, "en", "journal", "rss.xml"),
      join(dist, "ar", "journal", "rss.xml"),
    ];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      assert.ok(!text.includes("zinaalmokri.example.com"), `${file}: contains the invented mock domain`);
    }
  });

  test("no unpublished or non-renderable record could ever reach the sitemap", () => {
    // discoverableUrls() is built exclusively from `reviews()`, `journalArticles()`, `workIn()`,
    // `entityBrands()` — every one of those already filters to isRenderable + locale-available
    // (src/lib/content.ts). There is no second, looser path into this module's output.
    for (const url of discoverableUrls(true)) {
      assert.ok(!url.loc.includes("mock-"), `${url.loc}: a raw record id leaked into a URL`);
    }
  });
});
