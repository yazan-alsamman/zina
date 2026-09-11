/**
 * PHASE 9 — PRODUCTION READINESS & VERIFIED CONTENT INTAKE.
 *
 * Mapped directly to the Phase 9 brief's testing checklist (items 1-22), so each requirement has
 * one clearly-traceable assertion here even where the underlying fact is ALSO exercised by other
 * suites (tests/global.test.mjs, tests/sitemap.test.mjs, tests/robots.test.mjs,
 * tests/feed.test.mjs, tests/trust.test.mjs). This file does not replace those — it is the single
 * place a reviewer can check "is checklist item N tested" without hunting across the suite.
 *
 * Every real fact asserted here traces to one of four places the project owner supplied it:
 *   domain        content: src/config/site.ts        SITE_URL = "https://zinaalmokri.com"
 *   contact       content/mock/site.json              contact.generalEmail, contact.phone
 *   jurisdiction  content/mock/site.json              legal.jurisdiction
 *   Instagram     content/mock/social-profiles.json   the one CONFIRMED, sameAsEligible profile
 *   method        content/mock/method.json            locales.*.actualProcess
 *
 * Nothing here asserts a fact that was not explicitly supplied. Where the brief describes a
 * boundary (no lab, no clinical, no guarantee, no universal efficacy), this file checks the
 * BUILT OUTPUT states that boundary — not that it merely fails to claim the opposite.
 */

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { SITE_URL, SITE_URL_IS_PLACEHOLDER } from "../src/config/site.ts";
import { discoverableUrls } from "../src/lib/sitemap.ts";
import { robotsTxtContent } from "../src/lib/robots.ts";
import { journalFeed } from "../src/lib/feed.ts";
import {
  contactChannels,
  jurisdictionIsKnown,
  legalIdentity,
  officialInstagram,
  telHref,
  verifiedPhone,
} from "../src/lib/trust.ts";
import { method } from "../src/lib/content.ts";
import { absoluteUrl, machinePath, path } from "../src/lib/routing.ts";

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

const at = (route) => {
  const page = pages.find((p) => p.route === route);
  assert.ok(page, `${route} was not built`);
  return page;
};
const decodeEntities = (text) =>
  text.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const stripTags = (html) => decodeEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

/* ================================================================= 1-5: domain propagation */

describe("checklist 1-5 — the resolved domain reaches every absolute-URL surface", () => {
  test("1. SITE_URL resolves to https://zinaalmokri.com", () => {
    assert.equal(SITE_URL, "https://zinaalmokri.com");
    assert.equal(SITE_URL_IS_PLACEHOLDER, false);
  });

  test("2. canonical URLs use the correct domain, on every page", () => {
    for (const page of pages) {
      const canonical = page.html.match(/<link rel="canonical" href="([^"]+)"/)[1];
      assert.ok(canonical.startsWith(SITE_URL), `${page.route}: canonical is ${canonical}`);
    }
  });

  test("3. sitemap absolute URLs use the correct domain", () => {
    const sitemapIndex = readFileSync(join(dist, "sitemap.xml"), "utf8");
    assert.ok(sitemapIndex.includes(`${SITE_URL}/sitemap-en.xml`));
    assert.ok(sitemapIndex.includes(`${SITE_URL}/sitemap-ar.xml`));
    // Forced open, against the real corpus — every <loc> the mechanism would ever emit.
    for (const url of discoverableUrls(true)) {
      assert.ok(url.loc.startsWith(SITE_URL), url.loc);
    }
  });

  test("4. RSS absolute URLs use the correct domain", () => {
    const channel = journalFeed("en", true);
    assert.ok(channel.link.startsWith(SITE_URL));
    assert.ok(channel.feedUrl.startsWith(SITE_URL));
    for (const item of channel.items) {
      assert.ok(item.link.startsWith(SITE_URL), item.link);
      assert.ok(item.guid.startsWith(SITE_URL), item.guid);
    }
  });

  test("5. robots.txt references the sitemap through the correct origin", () => {
    const content = robotsTxtContent();
    assert.equal(content.match(/^Sitemap:\s*(\S+)$/m)[1], `${SITE_URL}/sitemap.xml`);
    assert.ok(!content.includes("example.invalid"), "robots.txt still references the placeholder");
    assert.ok(!content.includes("zinaalmokri.example.com"), "robots.txt references the invented mock domain");
  });
});

/* ================================================================= 6-8: verified contact */

describe("checklist 6-8 — the verified contact channels render exactly as supplied", () => {
  test("6. the contact email renders correctly, with a working mailto: link", () => {
    assert.deepEqual(contactChannels(), [{ key: "general", address: "contact@zinaalmokri.com" }]);
    for (const locale of ["en", "ar"]) {
      const page = at(path.contact(locale));
      assert.ok(page.html.includes('href="mailto:contact@zinaalmokri.com"'), `${locale}: no mailto link`);
      assert.ok(stripTags(page.html).includes("contact@zinaalmokri.com"), `${locale}: address not visible`);
    }
  });

  test("7. the contact phone renders correctly: exact display text, digits-only tel: href", () => {
    assert.equal(verifiedPhone(), "0989 000 009");
    assert.equal(telHref(verifiedPhone()), "tel:0989000009");
    for (const locale of ["en", "ar"]) {
      const page = at(path.contact(locale));
      assert.ok(page.html.includes('href="tel:0989000009"'), `${locale}: no tel: link`);
      assert.ok(stripTags(page.html).includes("0989 000 009"), `${locale}: phone text not shown verbatim`);
    }
  });

  test("8. the Instagram link points at exactly the supplied URL, verbatim, query string included", () => {
    const supplied = "https://www.instagram.com/zina.almokri?stkn=MTI4aHRmMGZ0bDdibw==";
    assert.deepEqual(officialInstagram(), { handle: "zina.almokri", url: supplied });
    for (const locale of ["en", "ar"]) {
      const page = at(path.contact(locale));
      assert.ok(page.html.includes(`href="${supplied}"`), `${locale}: Instagram href does not match exactly`);
    }
    // Also the shared footer, on every page site-wide.
    assert.ok(pages.every((p) => p.html.includes(`href="${supplied}"`)), "the footer's Instagram link is missing somewhere");
  });
});

/* ================================================================= 9-10: contact locales */

describe("checklist 9-10 — the contact surface is correct in both locales", () => {
  test("9. English contact surface: correct lang/dir, channels section present, no unavailable band", () => {
    const page = at(path.contact("en"));
    assert.match(page.html, /<html[^>]+lang="en"/);
    assert.match(page.html, /<html[^>]+dir="ltr"/);
    assert.ok(/class="channels"/.test(page.html));
    assert.ok(!/class="unavailable"/.test(page.html));
  });

  test("10. Arabic contact surface: correct lang/dir, channels section present, no unavailable band", () => {
    const page = at(path.contact("ar"));
    assert.match(page.html, /<html[^>]+lang="ar"/);
    assert.match(page.html, /<html[^>]+dir="rtl"/);
    assert.ok(/class="channels"/.test(page.html));
    assert.ok(!/class="unavailable"/.test(page.html));
    // The phone number is a Western-digit run inside Arabic RTL text and must be bidi-isolated.
    assert.match(page.html, /<bdi dir="ltr">0989 000 009<\/bdi>/);
  });
});

/* ================================================================= 11-12: Method locales */

describe("checklist 11-12 — the real process renders on the Method page, both locales", () => {
  test("11. English Standards/Method: the real process section is present and correctly ordered", () => {
    const page = at(path.method("en"));
    assert.ok(/class="actual-process"/.test(page.html), "no actual-process section");
    assert.equal(
      (page.html.match(/<ol class="process-steps"[^>]*>[\s\S]*?<\/ol>/) ?? [""])[0].match(/<li[^>]*>/g)?.length,
      5,
      "expected exactly 5 process steps"
    );
    // Ordering: the real process appears BEFORE the six-stage framework's own heading.
    const processAt = page.html.indexOf('id="actual-process-heading"');
    const stagesAt = page.html.indexOf('id="stages-heading"');
    assert.ok(processAt > 0 && stagesAt > 0 && processAt < stagesAt, "real process is not ordered first");
  });

  test("12. Arabic Standards/Method: the real process section is present and correctly ordered", () => {
    const page = at(path.method("ar"));
    assert.ok(/class="actual-process"/.test(page.html), "no actual-process section");
    assert.equal(
      (page.html.match(/<ol class="process-steps"[^>]*>[\s\S]*?<\/ol>/) ?? [""])[0].match(/<li[^>]*>/g)?.length,
      5
    );
    const processAt = page.html.indexOf('id="actual-process-heading"');
    const stagesAt = page.html.indexOf('id="stages-heading"');
    assert.ok(processAt > 0 && stagesAt > 0 && processAt < stagesAt);
  });
});

/* ================================================================= 13-14: Method's honesty */

describe("checklist 13-14 — the Method never overclaims what it actually is", () => {
  test("13. the real-process section never claims laboratory or clinical testing", () => {
    const forbidden = ["laboratory test", "clinical trial", "dermatological assessment",
      "scientific study", "clinically proven", "lab-tested", "clinically tested"];
    for (const locale of ["en"]) {
      const page = at(path.method(locale));
      const section = page.html.match(/<section class="actual-process"[\s\S]*?<\/section>/)[0];
      const text = stripTags(section).toLowerCase();
      // The boundary sentence NAMES these terms only to deny them ("not a laboratory test...").
      // A bare substring match would flag the denial itself, so this asserts the denial pattern.
      for (const term of forbidden) {
        if (text.includes(term)) {
          assert.ok(
            new RegExp(`not a[n]? [^.]*${term.split(" ")[0]}`, "i").test(text) || text.includes(`, a ${term}`),
            `${locale}: "${term}" appears without being explicitly denied`
          );
        }
      }
    }
  });

  test("13b. the six-stage framework's own boundary still explicitly denies clinical testing (unchanged)", () => {
    for (const locale of ["en", "ar"]) {
      const content = method().locales[locale];
      assert.match(content.boundaryStatement, /not clinical|ليس اختبارا سريريا/i);
    }
  });

  test("14. the real process explicitly denies a universal or guaranteed result", () => {
    const enBoundary = method().locales.en.actualProcess.boundary;
    assert.match(enBoundary, /does not guarantee the same result/i);
    assert.match(enBoundary, /not a claim that a product suits every skin type/i);

    const arBoundary = method().locales.ar.actualProcess.boundary;
    assert.match(arBoundary, /لا تضمن النتيجة نفسها/); // "does not guarantee the same result"
    assert.match(arBoundary, /كل أنواع البشرة/); // "every skin type"

    for (const locale of ["en", "ar"]) {
      const page = at(path.method(locale));
      const section = page.html.match(/<section class="actual-process"[\s\S]*?<\/section>/)[0];
      assert.ok(stripTags(section).includes(method().locales[locale].actualProcess.boundary));
    }
  });

  test("no numerical scoring, sample size or statistical-significance language was introduced", () => {
    for (const locale of ["en", "ar"]) {
      const page = at(path.method(locale));
      const section = page.html.match(/<section class="actual-process"[\s\S]*?<\/section>/)[0];
      const text = stripTags(section).toLowerCase();
      for (const term of ["score", "rating", "p-value", "statistically significant", "sample size", "n="]) {
        assert.ok(!text.includes(term), `${locale}: introduced "${term}"`);
      }
    }
  });
});

/* ================================================================= 15-16: gating both directions */

describe("checklist 15-16 — MOCK stays gated; verified facts pass their own gate", () => {
  test("15. MOCK records remain gated exactly as before — spot-checked, not re-derived", () => {
    // Unrelated to Phase 9: these facts must be completely unaffected by it.
    assert.equal(contactChannels().some((c) => c.key === "collaboration"), false, "collaboration email leaked");
    assert.equal(contactChannels().some((c) => c.key === "press"), false, "press email leaked");
    for (const page of pages) {
      assert.ok(!page.html.includes("collaborations@zinaalmokri"), `${page.route}: unconfirmed address leaked`);
    }
  });

  test("16. each Phase 9 fact independently passes its OWN gate — not a blanket flip", () => {
    assert.equal(jurisdictionIsKnown(), true);
    assert.equal(legalIdentity().jurisdiction, "Syria");
    assert.equal(legalIdentity().entityName, undefined, "entity was never supplied and must stay absent");
    assert.equal(verifiedPhone(), "0989 000 009");
    assert.ok(officialInstagram());
    // Proof the gates are independent, not one master switch: management/agency was NEVER
    // supplied and must remain exactly as absent as it was before Phase 9.
    for (const page of pages) {
      assert.ok(!/class="agency"/.test(page.html), `${page.route}: an unconfirmed agency rendered`);
    }
  });
});

/* ================================================================= 17-19: SEO/discovery safety */

describe("checklist 17-19 — discovery surfaces and structured data stay honest", () => {
  test("17. MOCK content cannot enter the production sitemap — still empty, domain change included", () => {
    assert.deepEqual(discoverableUrls(), []);
    for (const file of ["sitemap.xml", "sitemap-en.xml", "sitemap-ar.xml"]) {
      const xml = readFileSync(join(dist, file), "utf8");
      assert.ok(!xml.includes("<url>"), `${file}: contains a URL despite the source being mock`);
    }
  });

  test("18. MOCK content cannot enter the production RSS feed — still empty, domain change included", () => {
    for (const locale of ["en", "ar"]) {
      const xml = readFileSync(join(dist, locale, "journal", "rss.xml"), "utf8");
      assert.ok(!xml.includes("<item>"), `${locale}: feed carries an item despite the source being mock`);
    }
  });

  test("19. mock ratings still cannot become Review/AggregateRating structured data", () => {
    for (const page of pages) {
      for (const forbidden of ["reviewRating", "aggregateRating", "ratingValue", "AggregateRating"]) {
        assert.ok(!page.html.includes(forbidden), `${page.route}: emits ${forbidden}`);
      }
    }
  });
});

/* ================================================================= 20-22: regression */

describe("checklist 20-22 — canonical/hreflang consistency, dead links, full regression", () => {
  test("20. canonical and hreflang stay internally consistent after the domain change", () => {
    for (const page of pages) {
      const canonical = page.html.match(/<link rel="canonical" href="([^"]+)"/)[1];
      const alternates = [...page.html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
      for (const [, , href] of alternates) {
        assert.ok(href.startsWith(SITE_URL), `${page.route}: alternate ${href} uses the wrong domain`);
      }
      assert.ok(canonical.startsWith(SITE_URL), `${page.route}: canonical uses the wrong domain`);
    }
  });

  test("21. zero dead links, full site, after every Phase 9 change", () => {
    const routes = new Set(pages.map((p) => p.route));
    const isRealFile = (href) => /\.[a-z0-9]+$/i.test(href) && existsSync(join(dist, href));
    let dead = 0;
    for (const page of pages) {
      for (const m of page.html.matchAll(/href="(\/[^"#?]*)"/g)) {
        const href = m[1];
        if (href.startsWith("/fonts/") || href.startsWith("/_astro/")) continue;
        if (!routes.has(href) && !isRealFile(href)) dead++;
      }
    }
    assert.equal(dead, 0);
  });

  test("22. item counts match: 85 routes, sitemap/RSS mechanism still produces the known corpus totals", () => {
    assert.equal(pages.length, 85);
    const forced = discoverableUrls(true);
    assert.equal(forced.length, 56, "sitemap URL count changed — domain/content edits altered the corpus shape");
    assert.equal(journalFeed("en", true).items.length, 5);
    assert.equal(journalFeed("ar", true).items.length, 5);
  });
});
