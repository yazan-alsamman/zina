/**
 * BUILD OUTPUT TESTS
 *
 * These assert against the ACTUAL GENERATED HTML in dist/, not against the source. A component
 * can be correct and still be wired up wrongly; these catch the wiring.
 *
 * Requires a build first: `npx astro build`.
 */

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { reservedReviewSegments } from "../src/lib/facets.ts";
import { reservedJournalSegments } from "../src/lib/journal.ts";
import { eligibleSocialProfiles } from "../src/lib/content.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const pages = [];

function collect(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collect(full);
    else if (entry === "index.html") {
      pages.push({ path: full.replace(dist, "").replace(/\\/g, "/"), html: readFileSync(full, "utf8") });
    }
  }
}

before(() => {
  assert.ok(existsSync(dist), "dist/ not found — run `npx astro build` before the tests");
  collect(dist);
});

/**
 * REVIEW DETAIL pages only.
 *
 * Phase 5 added /{locale}/reviews/ and the facet routes beneath it, so "the path contains
 * /reviews/" is no longer the same question as "this is a review". A detail page is
 * /{locale}/reviews/{slug}/ where {slug} is NOT one of the reserved category segments and not
 * the brand facet prefix. That the two sets are disjoint is asserted in tests/facets.test.mjs.
 *
 * Narrowed, not weakened: every assertion below still runs against all ten detail pages.
 */
const RESERVED_CATEGORY_SEGMENTS = reservedReviewSegments();
const RESERVED_JOURNAL_SEGMENTS = reservedJournalSegments();

const isReviewDetail = (route) => {
  const parts = route.split("/").filter(Boolean);
  return (
    parts.length === 4 &&
    parts[1] === "reviews" &&
    parts[3] === "index.html" &&
    !RESERVED_CATEGORY_SEGMENTS.includes(parts[2])
  );
};

const reviewPages = () => pages.filter((p) => isReviewDetail(p.path));
const arabicPages = () => pages.filter((p) => p.path.startsWith("/ar/"));
const englishPages = () => pages.filter((p) => p.path.startsWith("/en/"));

describe("route output", () => {
  test("ten review detail pages — five per locale", () => {
    // The total page count grows every phase; the number that must NOT drift is how many review
    // records became routes, because that is the missing-translation rule in action.
    assert.equal(reviewPages().length, 10);
    assert.equal(reviewPages().filter((p) => p.path.startsWith("/en/")).length, 5);
    assert.equal(reviewPages().filter((p) => p.path.startsWith("/ar/")).length, 5);
  });

  test("no route was generated for a missing translation", () => {
    assert.ok(!existsSync(join(dist, "ar", "reviews", "veloura-velvet-hour-lip-cream")));
    assert.ok(!existsSync(join(dist, "en", "reviews", "terra-sana-verdure-cloud-balm")));
  });
});

describe("document shell", () => {
  test("every page declares lang and dir", () => {
    for (const page of englishPages()) {
      assert.ok(/<html[^>]*lang="en"[^>]*dir="ltr"/.test(page.html), page.path);
    }
    for (const page of arabicPages()) {
      assert.ok(/<html[^>]*lang="ar"[^>]*dir="rtl"/.test(page.html), page.path);
    }
  });

  test("every page has exactly one h1", () => {
    for (const page of pages) {
      const count = (page.html.match(/<h1[\s>]/g) ?? []).length;
      assert.equal(count, 1, `${page.path} has ${count} h1 elements`);
    }
  });

  test("every page has a skip link first, and a main landmark", () => {
    for (const page of pages) {
      assert.ok(page.html.includes('class="skip-link" href="#main"'), page.path);
      assert.ok(page.html.includes('id="main"'), page.path);
      const skipIndex = page.html.indexOf("skip-link");
      const headerIndex = page.html.indexOf("<header");
      assert.ok(skipIndex < headerIndex, `${page.path}: skip link must precede the header`);
    }
  });

  test("every page loads only its own locale's fonts", () => {
    for (const page of englishPages()) {
      assert.ok(page.html.includes("/fonts/en.css"), page.path);
      assert.ok(!page.html.includes("/fonts/ar.css"), `${page.path} loaded the Arabic stylesheet`);
      assert.ok(!page.html.includes("noto-naskh"), `${page.path} preloaded an Arabic face`);
    }
    for (const page of arabicPages()) {
      assert.ok(page.html.includes("/fonts/ar.css"), page.path);
      assert.ok(!page.html.includes("/fonts/en.css"), `${page.path} loaded the English stylesheet`);
    }
  });

  test("no third-party request: fonts are self-hosted", () => {
    for (const page of pages) {
      assert.ok(!/https?:\/\/fonts\.(googleapis|gstatic)/.test(page.html), page.path);
      assert.ok(!/cdn\.|unpkg|jsdelivr/.test(page.html), page.path);
    }
  });
});

describe("metadata", () => {
  test("every page has a canonical, a description and a robots directive", () => {
    for (const page of pages) {
      assert.ok(/<link rel="canonical" href="https:\/\//.test(page.html), page.path);
      assert.ok(/<meta name="description" content=".+?"/.test(page.html), page.path);
      assert.ok(/<meta name="robots"/.test(page.html), page.path);
    }
  });

  test("every page self-canonicalises, except gated facets which point at their index", () => {
    for (const page of pages) {
      const canonical = page.html.match(/<link rel="canonical" href="([^"]+)"/)[1];
      const own = page.path.replace("/index.html", "/");
      const parts = own.split("/").filter(Boolean);

      // A gated facet is a VIEW of a section index, in any section — `/reviews/{category}/`,
      // `/reviews/brand/{brand}/` and, since Phase 6, `/journal/{format}/`. The rule is one rule,
      // so it is expressed once rather than re-hardcoded per section.
      const section = parts[1];
      const isCategoryFacet =
        parts.length === 3 && section === "reviews" && RESERVED_CATEGORY_SEGMENTS.includes(parts[2]);
      const isBrandFacet = parts.length === 4 && section === "reviews" && parts[2] === "brand";
      const isJournalFacet =
        parts.length === 3 && section === "journal" && RESERVED_JOURNAL_SEGMENTS.includes(parts[2]);

      if (isCategoryFacet || isBrandFacet || isJournalFacet) {
        // A thin facet points at the index it is a view of. Deliberate: see src/lib/facets.ts.
        assert.ok(
          canonical.endsWith(`/${parts[0]}/${section}/`),
          `${page.path}: gated facet canonical is ${canonical}`
        );
        assert.ok(page.html.includes('content="noindex'), `${page.path}: canonicalises away but is indexable`);
      } else {
        assert.ok(canonical.endsWith(own), `${page.path}: canonical is ${canonical}`);
      }
    }
  });

  test("locale variants never canonicalise to each other", () => {
    for (const page of arabicPages()) {
      const canonical = page.html.match(/<link rel="canonical" href="([^"]+)"/)[1];
      assert.ok(canonical.includes("/ar/"), `${page.path} canonicalises outside its locale`);
    }
  });

  test("a bilingual review emits reciprocal hreflang; a single-locale review does not", () => {
    // Only <link rel="alternate"> counts. The language switcher's <a> also carries hreflang,
    // correctly — it points at the Arabic section index, which IS an Arabic document. That is a
    // hint about the link target, not a claim of equivalence.
    const alternates = (html) =>
      [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map((m) => m[1]).sort();

    const bilingual = pages.find(
      (p) => p.path === "/en/reviews/maison-eclat-voile-lumiere-skin-tint/index.html"
    );
    assert.deepEqual(alternates(bilingual.html), ["ar", "en", "x-default"]);

    const englishOnly = pages.find(
      (p) => p.path === "/en/reviews/veloura-velvet-hour-lip-cream/index.html"
    );
    assert.deepEqual(
      alternates(englishOnly.html),
      ["en", "x-default"],
      "must not claim an Arabic equivalent that does not exist"
    );
  });

  test("the 404 is noindex", () => {
    for (const page of pages.filter((p) => p.path.includes("/404/"))) {
      assert.ok(page.html.includes('content="noindex'), page.path);
    }
  });

  test("review titles are used verbatim, with no site-name suffix", () => {
    const page = pages.find((p) =>
      p.path === "/en/reviews/maison-eclat-voile-lumiere-skin-tint/index.html"
    );
    const title = page.html.match(/<title>([^<]+)<\/title>/)[1];
    assert.ok(!title.includes("| Zina Almokri"), `title was templated: ${title}`);
    assert.ok(title.length <= 65, `title too long for a SERP: ${title.length} chars`);
  });
});

describe("structured data — nothing fabricated", () => {
  const schemasOf = (html) =>
    [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) =>
      JSON.parse(m[1].replace(/\\u003c/g, "<").replace(/\\u003e/g, ">"))
    );

  test("every review emits Review, Person and BreadcrumbList", () => {
    for (const page of reviewPages()) {
      const types = schemasOf(page.html).map((s) => s["@type"]);
      assert.ok(types.includes("Review"), page.path);
      assert.ok(types.includes("Person"), page.path);
      assert.ok(types.includes("BreadcrumbList"), page.path);
    }
  });

  test("NO reviewRating, aggregateRating, offers or standalone Product", () => {
    for (const page of reviewPages()) {
      const json = JSON.stringify(schemasOf(page.html));
      for (const forbidden of ["reviewRating", "aggregateRating", "offers", "ratingValue", "bestRating"]) {
        assert.ok(!json.includes(forbidden), `${page.path} emits ${forbidden}`);
      }
    }
  });

  test("the Product appears only nested as itemReviewed", () => {
    for (const page of reviewPages()) {
      for (const schema of schemasOf(page.html)) {
        if (schema["@type"] === "Product") assert.fail(`${page.path}: standalone Product schema`);
      }
    }
  });

  test("sameAs, where emitted, is exactly the one confirmed profile — never a guess", () => {
    // Phase 9 confirmed Instagram. Every other profile is still unconfirmed and must never appear.
    const eligible = eligibleSocialProfiles().map((p) => p.url);
    for (const page of reviewPages()) {
      const person = schemasOf(page.html).find((s) => s["@type"] === "Person");
      if (!("sameAs" in person)) continue;
      assert.deepEqual(person.sameAs, eligible, `${page.path}: sameAs disagrees with the confirmed set`);
    }
  });

  test("the unverified location is not emitted", () => {
    for (const page of reviewPages()) {
      const person = schemasOf(page.html).find((s) => s["@type"] === "Person");
      assert.ok(!("address" in person), `${page.path} emits an unverified location`);
    }
  });
});

describe("the bidi correction, in the shipped HTML", () => {
  test("NO bare <bdi> containing Arabic text on any page", () => {
    for (const page of pages) {
      const bare = [...page.html.matchAll(/<bdi>([^<]*)<\/bdi>/g)]
        .map((m) => m[1])
        .filter((text) => /[؀-ۿ]/.test(text));
      assert.equal(bare.length, 0, `${page.path} has a bare <bdi> around Arabic: ${bare[0]}`);
    }
  });

  test("no bare <bdi> is emitted anywhere — every isolate declares dir or lang", () => {
    for (const page of pages) {
      // `<bdi>` with no attribute is the failure mode: it auto-resolves direction from the
      // first strong character, which is what reverses a numeric range next to an Arabic unit.
      const bare = (page.html.match(/<bdi>/g) ?? []).length;
      assert.equal(bare, 0, `${page.path}: found ${bare} bare <bdi> element(s)`);
    }
  });

  test("Arabic pages never label Arabic text as English", () => {
    for (const page of arabicPages()) {
      const mislabelled = [...page.html.matchAll(/<bdi lang="en">([^<]*)<\/bdi>/g)]
        .map((m) => m[1])
        .filter((text) => /[؀-ۿ]/.test(text));
      assert.equal(mislabelled.length, 0, `${page.path}: ${mislabelled[0]} marked as English`);
    }
  });
});

describe("the evidence layer", () => {
  test("the disclosure band precedes the hero in DOM order, on every review", () => {
    for (const page of reviewPages()) {
      const disclosure = page.html.indexOf('class="disclosure');
      const hero = page.html.indexOf('class="hero');
      assert.ok(disclosure > -1, `${page.path} has no disclosure band`);
      assert.ok(hero > -1, `${page.path} has no hero`);
      assert.ok(disclosure < hero, `${page.path}: disclosure must be ABOVE the hero`);
    }
  });

  test("the disclosure statement is never truncated or collapsed", () => {
    for (const page of reviewPages()) {
      assert.ok(!/<details[\s>]/.test(page.html), `${page.path} uses <details> — forbidden`);
      assert.ok(!/line-clamp/.test(page.html), `${page.path} clamps text`);
    }
  });

  test("conditions render as a real table with row headers", () => {
    for (const page of reviewPages()) {
      assert.ok(page.html.includes('<table class="conditions"'), page.path);
      assert.ok(page.html.includes('<th scope="row"'), page.path);
    }
  });

  test("observations render as an ordered list", () => {
    for (const page of reviewPages()) {
      assert.ok(/<ol class="timeline/.test(page.html), page.path);
    }
  });

  test("the verdict is an h2 despite being the largest text", () => {
    for (const page of reviewPages()) {
      assert.ok(/<h2[^>]*id="verdict"/.test(page.html), page.path);
    }
  });

  test("no score, star, rating or badge markup anywhere", () => {
    for (const page of pages) {
      for (const forbidden of ["star-rating", "rating-value", "score-badge", "★", "☆"]) {
        assert.ok(!page.html.includes(forbidden), `${page.path} contains ${forbidden}`);
      }
    }
  });

  test("unapplied method stages are shown, not hidden", () => {
    // The Velvet Hour review runs FOUR of six stages; the other two must still render, hollow.
    const page = pages.find((p) =>
      p.path === "/en/reviews/veloura-velvet-hour-lip-cream/index.html"
    );
    const applied = (page.html.match(/stage--applied/g) ?? []).length;
    const absent = (page.html.match(/stage--absent/g) ?? []).length;
    assert.equal(applied + absent, 6, "all six stages must render");
    assert.equal(absent, 2, "the two unapplied stages must be visible, not omitted");
  });
});

describe("the gated-link rule (risk R-14)", () => {
  test("no page links to a brand whose gate fails in that locale", () => {
    // Veloura is gated in Arabic; Terra Sana in both. Neither may be linked as a brand page.
    for (const page of arabicPages()) {
      assert.ok(
        !page.html.includes('href="/ar/brands/veloura-beauty/'),
        `${page.path} links to a gated Arabic brand page`
      );
    }
    for (const page of pages) {
      assert.ok(!/href="\/(en|ar)\/brands\/terra-sana\//.test(page.html), page.path);
    }
  });

  test("a gated brand resolves to its facet route, never to nothing", () => {
    // Phase 4 pointed this at `?brand=terra-sana`, which a static build silently ignored — a
    // link that looked like it worked and did not. Phase 5 gives it a real route.
    const page = pages.find((p) => p.path === "/ar/reviews/terra-sana-verdure-cloud-balm/index.html");
    assert.ok(page.html.includes("/ar/reviews/brand/terra-sana/"), "expected a brand facet link");
    assert.ok(!page.html.includes("?brand="), "a query-string filter survived");
  });
});

describe("no prohibited dependencies or techniques", () => {
  test("no client-side JavaScript is shipped", () => {
    for (const page of pages) {
      const scripts = [...page.html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>/g)];
      assert.equal(scripts.length, 0, `${page.path} ships ${scripts.length} script tag(s)`);
    }
  });

  test("no rounded corners above the 2px control radius", () => {
    const css = readdirSync(join(dist, "_astro"))
      .filter((f) => f.endsWith(".css"))
      .map((f) => readFileSync(join(dist, "_astro", f), "utf8"))
      .join("\n");
    const radii = [...css.matchAll(/border-radius:\s*([^;}]+)/g)].map((m) => m[1].trim());
    for (const radius of radii) {
      assert.ok(
        /^(0|2px|var\(--radius-(none|control)\))$/.test(radius),
        `forbidden border-radius in output: ${radius}`
      );
    }
  });

  test("no box-shadow is used for elevation", () => {
    const css = readdirSync(join(dist, "_astro"))
      .filter((f) => f.endsWith(".css"))
      .map((f) => readFileSync(join(dist, "_astro", f), "utf8"))
      .join("\n");
    const shadows = [...css.matchAll(/box-shadow:\s*([^;}]+)/g)].map((m) => m[1].trim());
    for (const shadow of shadows) {
      // `inset 0 0 0 1px` draws the HOLLOW method-stage marker — a border, not elevation.
      assert.ok(shadow.startsWith("inset"), `elevation shadow in output: ${shadow}`);
    }
  });

  test("no video, canvas, WebGL or iframe", () => {
    for (const page of pages) {
      for (const tag of ["<video", "<canvas", "<iframe", "webgl", "THREE."]) {
        assert.ok(!page.html.includes(tag), `${page.path} contains ${tag}`);
      }
    }
  });
});

describe("mock content safety", () => {
  test("every page carries a machine-detectable mock marker while the source is mock", () => {
    // The marker is content-independent: it survives even if every mock field is given a
    // realistic value. Without it the guarantee would rest on an example.com URL happening
    // to be present.
    for (const page of pages) {
      assert.ok(page.html.includes("__MOCK_DATA__"), `${page.path} has no build-provenance marker`);
    }
  });

  test("the marker is a comment, never a visible badge", () => {
    for (const page of pages) {
      assert.ok(
        /<!--[^>]*__MOCK_DATA__/.test(page.html),
        `${page.path}: the mock marker must be an HTML comment`
      );
    }
  });

  test("no lifecycle state leaks into the rendered text", () => {
    for (const page of pages) {
      const body = page.html.replace(/<!--[\s\S]*?-->/g, "");
      for (const leak of ["needs-verification", "_verification", "NEEDS_VERIFICATION"]) {
        assert.ok(!body.includes(leak), `${page.path} renders the internal marker ${leak}`);
      }
    }
  });
});

describe("images", () => {
  test("no broken <img> is emitted for photography that does not exist", () => {
    for (const page of pages) {
      assert.ok(!page.html.includes("/mock-media/"), `${page.path} references a nonexistent asset`);
    }
  });

  test("every placeholder still carries its alt text for assistive technology", () => {
    for (const page of reviewPages()) {
      assert.ok(/role="img" aria-label="[^"]+"/.test(page.html), `${page.path} lost its alt text`);
    }
  });

  test("every image reserves space by aspect ratio, preventing layout shift", () => {
    for (const page of reviewPages()) {
      const frames = (page.html.match(/class="frame[^"]*"/g) ?? []).length;
      const ratios = (page.html.match(/aspect-ratio:/g) ?? []).length;
      assert.ok(ratios >= frames, `${page.path}: ${frames} frames but ${ratios} ratio reservations`);
    }
  });
});
