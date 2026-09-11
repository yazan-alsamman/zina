/**
 * ROBOTS.TXT TESTS.
 *
 * The policy is small and constant (see src/lib/robots.ts for why), so these tests are small too:
 * prove the content is minimal and explicit, prove it never blocks a real public route, and prove
 * it does not contradict the sitemap's own indexability decisions.
 */

import { test, describe, before } from "node:test";
import { SITE_URL } from "../src/config/site.ts";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { robotsTxtContent } from "../src/lib/robots.ts";
import { discoverableUrls } from "../src/lib/sitemap.ts";
import { absoluteUrl, machinePath, path } from "../src/lib/routing.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

let builtContent;
before(() => {
  assert.ok(existsSync(dist), "dist/ not found — run `npx astro build` first");
  builtContent = readFileSync(join(dist, "robots.txt"), "utf8");
});

describe("the built robots.txt", () => {
  test("matches what src/lib/robots.ts produces, exactly — the endpoint is a thin wrapper", () => {
    assert.equal(builtContent, robotsTxtContent());
  });

  test("is plain text, not HTML or XML", () => {
    assert.ok(!/<[a-z][\s\S]*>/i.test(builtContent), "robots.txt contains markup");
  });
});

describe("the policy is minimal and explicit", () => {
  test("declares exactly one User-agent block", () => {
    const matches = robotsTxtContent().match(/^User-agent:/gm) ?? [];
    assert.equal(matches.length, 1);
  });

  test("User-agent is a wildcard", () => {
    assert.match(robotsTxtContent(), /^User-agent:\s*\*$/m);
  });

  test("nothing is Disallowed — no legitimate public route is blocked as a shortcut", () => {
    assert.ok(!/^Disallow:/m.test(robotsTxtContent()));
  });

  test("Allow: / is present, explicitly permitting crawl of the whole site", () => {
    assert.match(robotsTxtContent(), /^Allow:\s*\/$/m);
  });

  test("the gated facet family is NOT blocked here — noindex meta does that job, not robots.txt", () => {
    // Blocking crawl access would hide the noindex meta tag and the canonical link from a
    // crawler entirely (the well-known "indexed, though blocked by robots.txt" failure), so the
    // facet paths must remain fetchable even though they are never in the sitemap.
    const content = robotsTxtContent();
    assert.ok(!content.includes("/reviews/brand/"));
    assert.ok(!content.includes("reviews/foundation") && !content.includes("reviews/concealer"));
  });
});

describe("the sitemap reference", () => {
  test("references exactly one sitemap, via the single canonical origin", () => {
    const content = robotsTxtContent();
    const matches = content.match(/^Sitemap:.*$/gm) ?? [];
    assert.equal(matches.length, 1);
    assert.equal(matches[0], `Sitemap: ${absoluteUrl(machinePath.sitemapIndex())}`);
  });

  test("the referenced URL is not the mock/invented site.json domain", () => {
    // site.json -> domain.value is "https://zinaalmokri.example.com", explicitly marked MOCK and
    // invented — robots.txt must use the real SITE_URL constant, never that field. U-01 is
    // resolved (Phase 9): SITE_URL is now the real production domain, not a placeholder.
    assert.ok(!robotsTxtContent().includes("zinaalmokri.example.com"));
    assert.ok(robotsTxtContent().includes(SITE_URL));
    assert.ok(!SITE_URL.endsWith(".invalid"), "SITE_URL still looks like the Phase 8 placeholder");
  });

  test("the sitemap URL in the BUILT file resolves to a file that was actually emitted", () => {
    const match = builtContent.match(/^Sitemap:\s*(\S+)$/m);
    assert.ok(match, "no Sitemap: line in the built robots.txt");
    const localPath = match[1].replace(SITE_URL, "");
    assert.ok(existsSync(join(dist, localPath)), `${match[1]} does not correspond to a real file`);
  });
});

describe("consistency with the sitemap's own indexability decisions", () => {
  test("robots.txt allows crawling every URL the sitemap (forced open) would ever list", () => {
    // Allow: / covers everything, so this is trivially true today; asserted anyway so a FUTURE
    // Disallow rule cannot silently orphan a page the sitemap still lists — the exact
    // contradiction the Phase 8 brief calls out.
    const forced = discoverableUrls(true);
    const content = robotsTxtContent();
    const disallowed = [...content.matchAll(/^Disallow:\s*(\S+)$/gm)].map((m) => m[1]);
    for (const url of forced) {
      const localPath = url.loc.replace(SITE_URL, "");
      for (const rule of disallowed) {
        assert.ok(
          !localPath.startsWith(rule),
          `${localPath} is listed in the sitemap but blocked by "Disallow: ${rule}"`
        );
      }
    }
  });

  test("the 404 route is not referenced or specially handled here — its noindex is meta-level only", () => {
    assert.ok(!robotsTxtContent().includes(path.notFound("en").slice(0, -1)));
  });
});
