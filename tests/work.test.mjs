/**
 * WORK TESTS — routing, relationships, and above all the RESULTS FIGURE GATE.
 *
 * The gate has three states and the production corpus only exercises two of them: every figure in
 * `work.json` is MOCK, so `blocked` and `absent` occur and `allowed` never does.
 *
 * A gate that has only ever been observed REFUSING is not a verified gate — the same argument that
 * made the Phase 6 TOC threshold a named predicate. So the `allowed` branch is exercised with
 * SYNTHETIC FIXTURES built inside this file. They are passed directly to the pure gate functions,
 * never written to the content layer and never rendered, and a test at the end asserts that no
 * fixture value reached `dist/`.
 */

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  blockedFigures,
  figureIsPublishable,
  hasWrittenSource,
  publishableFigures,
  resultsState,
  workBrand,
  workIn,
  workJournal,
  workReviews,
} from "../src/lib/work.ts";
import { eligibleSocialProfiles, workById } from "../src/lib/content.ts";
import { path } from "../src/lib/routing.ts";

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

const workPages = () => pages.filter((p) => /^\/(en|ar)\/work\/[^/]+\/$/.test(p.route));
const routes = () => new Set(pages.map((p) => p.route));
const stripTags = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/* ================================================================= synthetic fixtures
 *
 * TEST-ONLY. These never touch content/, are never rendered, and exist solely to drive the gate
 * branch the corpus cannot reach. The sentinel value is deliberately distinctive so the leak test
 * below can prove it never escaped.
 */

const FIXTURE_VALUE = "__SYNTHETIC_FIXTURE_VALUE_42__";

const confirmedFigure = {
  label: "Fixture figure",
  value: FIXTURE_VALUE,
  source: "Client-supplied campaign report, 12 March 2026",
  _verification: "CONFIRMED",
};

const workWith = (status, figures) => ({
  id: "fixture-work",
  results: { status, figures },
});

/* ================================================================= the gate, all three states */

describe("the results figure gate — ALLOWED", () => {
  test("a confirmed figure with a written source is publishable", () => {
    assert.equal(figureIsPublishable(confirmedFigure), true);
  });

  test("a record whose set is confirmed publishes its confirmed figures", () => {
    const record = workWith("CONFIRMED", [confirmedFigure]);
    assert.equal(resultsState(record), "allowed");
    assert.deepEqual(publishableFigures(record), [confirmedFigure]);
    assert.deepEqual(blockedFigures(record), []);
  });

  test("only the confirmed figures in a confirmed set pass", () => {
    const mixed = workWith("CONFIRMED", [
      confirmedFigure,
      { label: "Unverified", value: "99%", source: "MOCK", _verification: "MOCK" },
    ]);
    assert.equal(resultsState(mixed), "allowed");
    assert.equal(publishableFigures(mixed).length, 1);
    assert.equal(blockedFigures(mixed).length, 1);
  });
});

describe("the results figure gate — BLOCKED", () => {
  test("CONFIRMED verification is not enough without a written source", () => {
    // The reason the gate has two conditions: a verification flag is something anyone can set. A
    // figure that cannot say where it came from is asserted, not verified.
    for (const source of ["", "   ", "MOCK", "CONFIRMED", "NEEDS_VERIFICATION", "TBD", "unknown"]) {
      const figure = { ...confirmedFigure, source };
      assert.equal(hasWrittenSource(figure), false, `"${source}" was treated as a source`);
      assert.equal(figureIsPublishable(figure), false, `"${source}" published a figure`);
    }
  });

  test("a written source is not enough without CONFIRMED verification", () => {
    for (const verification of ["MOCK", "NEEDS_VERIFICATION", "", undefined]) {
      const figure = { ...confirmedFigure, _verification: verification };
      assert.equal(figureIsPublishable(figure), false, `${verification} published a figure`);
    }
  });

  test("a confirmed figure inside an UNCONFIRMED set is still blocked", () => {
    // The set is the unit someone signs off. A confirmed row in an unsigned set is not signed.
    for (const status of ["MOCK", "NEEDS_VERIFICATION"]) {
      const record = workWith(status, [confirmedFigure]);
      assert.equal(resultsState(record), "blocked");
      assert.deepEqual(publishableFigures(record), []);
      assert.equal(blockedFigures(record).length, 1);
    }
  });

  test("EVERY figure in the production corpus is blocked", () => {
    let total = 0;
    for (const locale of ["en", "ar"]) {
      for (const record of workIn(locale)) {
        total += blockedFigures(record).length;
        assert.deepEqual(
          publishableFigures(record),
          [],
          `${record.id}: a mock figure became publishable`
        );
      }
    }
    assert.ok(total > 0, "no blocked figures found — the gate is not being exercised at all");
  });
});

describe("the results figure gate — ABSENT", () => {
  test("a record with no figures is a valid, complete state", () => {
    const record = workWith("MOCK", []);
    assert.equal(resultsState(record), "absent");
    assert.deepEqual(publishableFigures(record), []);
    assert.deepEqual(blockedFigures(record), []);
  });

  test("the corpus contains a real absent record, not just blocked ones", () => {
    const barrier = workById("mock-work-barrier-season-campaign");
    assert.equal(resultsState(barrier), "absent");
  });

  test("absent and blocked render identically — nothing", () => {
    // Both must leave NO trace. An outline where a number would go still tells the reader a number
    // exists, and invites them to imagine it.
    for (const page of workPages()) {
      assert.ok(!/class="results"/.test(page.html), `${page.route}: rendered a results section`);
      assert.ok(!/class="figure/.test(page.html), `${page.route}: rendered a figure`);
      const text = stripTags(page.html).toLowerCase();
      for (const placeholder of ["results pending", "coming soon", "data unavailable", "tbc", "—%"]) {
        assert.ok(!text.includes(placeholder), `${page.route}: placeholder "${placeholder}"`);
      }
    }
  });
});

describe("synthetic fixtures never leak into production", () => {
  test("no fixture value appears anywhere in the build", () => {
    for (const page of pages) {
      assert.ok(!page.html.includes(FIXTURE_VALUE), `${page.route}: a test fixture reached dist/`);
      assert.ok(!page.html.includes("Fixture figure"), `${page.route}: a test fixture label leaked`);
    }
  });

  test("no blocked corpus figure value or label appears anywhere in the build", () => {
    const values = ["1.2M", "38K", "61%", "54%", "112K"];
    const labels = [
      "Explainer film views",
      "Saves on the shade-matching post",
      "Series completion rate",
      "Arabic film completion rate",
      "sessions attributed to campaign",
    ];
    for (const page of pages) {
      for (const value of values) {
        assert.ok(!page.html.includes(value), `${page.route}: leaked blocked figure "${value}"`);
      }
      for (const label of labels) {
        assert.ok(!page.html.includes(label), `${page.route}: leaked blocked label "${label}"`);
      }
    }
  });
});

/* ================================================================= routing */

describe("work routing follows locale availability", () => {
  test("four records produce SEVEN routes, not eight", () => {
    // `velvet-hour-wear-series` is English-only.
    assert.equal(workPages().length, 7);
    assert.equal(workIn("en").length, 4);
    assert.equal(workIn("ar").length, 3);
  });

  test("no route exists for a missing translation", () => {
    const built = routes();
    assert.ok(built.has("/en/work/veloura-velvet-hour-wear-series/"));
    assert.ok(!built.has("/ar/work/veloura-velvet-hour-wear-series/"));
  });

  test("the English-only record emits no Arabic alternate", () => {
    const page = pages.find((p) => p.route === "/en/work/veloura-velvet-hour-wear-series/");
    assert.ok(!/<link rel="alternate" hreflang="ar"/.test(page.html));
  });

  test("every work page self-canonicalises and is noindex in a mock build", () => {
    for (const page of workPages()) {
      const canonical = page.html.match(/<link rel="canonical" href="([^"]+)"/)[1];
      assert.ok(canonical.endsWith(page.route), `${page.route}: canonical is ${canonical}`);
      assert.ok(/<meta name="robots" content="[^"]*noindex/.test(page.html), page.route);
    }
  });
});

/* ================================================================= relationships */

describe("work relationships are real, locale-correct and never dead", () => {
  test("every related review exists in this locale and was built", () => {
    const built = routes();
    for (const locale of ["en", "ar"]) {
      for (const record of workIn(locale)) {
        for (const review of workReviews(record, locale)) {
          assert.ok(review.locales[locale], `${record.id} -> ${review.id} missing in ${locale}`);
          assert.ok(built.has(path.review(locale, review.locales[locale].slug)));
        }
      }
    }
  });

  test("the client links to a brand page ONLY where the gate opened one", () => {
    const built = routes();
    for (const locale of ["en", "ar"]) {
      for (const record of workIn(locale)) {
        const brand = workBrand(record, locale);
        if (!brand) continue;
        assert.ok(built.has(path.brand(locale, brand.slug)), `${record.id}: dead brand link`);
      }
    }
  });

  test("a gated brand is named but never linked", () => {
    // Veloura has no Arabic page; its English work page may link, the Arabic corpus has no such
    // record. What must never happen is a link to a page the gate suppressed.
    const built = routes();
    for (const page of workPages()) {
      for (const href of [...page.html.matchAll(/href="(\/(?:en|ar)\/brands\/[^"]*)"/g)].map((m) => m[1])) {
        assert.ok(built.has(href), `${page.route}: links to unbuilt ${href}`);
      }
    }
  });

  test("related journal articles exist in this locale", () => {
    for (const locale of ["en", "ar"]) {
      for (const record of workIn(locale)) {
        for (const article of workJournal(record, locale)) {
          assert.ok(article.locales[locale], `${record.id} -> ${article.id} missing in ${locale}`);
        }
      }
    }
  });
});

/* ================================================================= no fabrication */

describe("a work page claims no outcome it cannot evidence", () => {
  test("no performance, growth or revenue vocabulary", () => {
    const forbidden = ["impressions", "reach", "engagement rate", "conversion", "roi",
      "revenue", "sales lift", "followers gained", "went viral", "audience growth", "ctr"];
    for (const page of workPages()) {
      const text = stripTags(page.html).toLowerCase();
      for (const word of forbidden) {
        assert.ok(!text.includes(word), `${page.route}: claims "${word}"`);
      }
    }
  });

  test("no testimonial, award or press claim", () => {
    for (const page of workPages()) {
      const text = stripTags(page.html).toLowerCase();
      for (const word of ["testimonial", "award", "as seen in", "featured in", "winner"]) {
        assert.ok(!text.includes(word), `${page.route}: claims "${word}"`);
      }
      assert.ok(!/<blockquote/.test(page.html), `${page.route}: rendered a quote as endorsement`);
    }
  });

  test("the engagement terms are stated on every work page", () => {
    // The commercial basis comes BEFORE the description, the same rule as a review's disclosure.
    for (const page of workPages()) {
      assert.ok(/<section class="terms"/.test(page.html), `${page.route}: no engagement terms`);
      const termsAt = page.html.indexOf('class="terms"');
      const descriptionAt = page.html.indexOf('class="description');
      if (descriptionAt !== -1) {
        assert.ok(termsAt < descriptionAt, `${page.route}: terms appear after the description`);
      }
    }
  });

  test("JSON-LD asserts no client entity and no creative work", () => {
    const eligible = eligibleSocialProfiles().map((p) => p.url);
    for (const page of workPages()) {
      const blocks = [...page.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map((m) => JSON.parse(m[1]));
      const types = blocks.map((b) => b["@type"]).sort();
      assert.deepEqual(types, ["BreadcrumbList", "Person"], `${page.route}: ${types}`);

      // sameAs is legitimate (Phase 9: Instagram) and checked precisely below; everything else
      // here must never appear.
      const json = JSON.stringify(blocks);
      for (const forbidden of ["CreativeWork", "Organization", "ProfessionalService",
        "aggregateRating", "offers", "interactionStatistic"]) {
        assert.ok(!json.includes(forbidden), `${page.route}: emitted ${forbidden}`);
      }

      const person = blocks.find((b) => b["@type"] === "Person");
      if ("sameAs" in person) {
        assert.deepEqual(person.sameAs, eligible, `${page.route}: sameAs disagrees with the confirmed set`);
      }
    }
  });

  test("no work page ships client JavaScript", () => {
    for (const page of workPages()) {
      assert.ok(
        !/<script(?![^>]*type="application\/ld\+json")/.test(page.html),
        `${page.route}: a script tag reached the page`
      );
    }
  });
});
