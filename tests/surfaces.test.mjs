/**
 * PHASE 5 SURFACE TESTS — reviews index, facets, method, homepage.
 *
 * Asserted against the ACTUAL GENERATED HTML in dist/. A component can be correct and still be
 * wired up wrongly; these catch the wiring.
 *
 * Requires a build: `npx astro build`.
 */

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const pages = new Map();

function collect(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collect(full);
    else if (entry === "index.html") {
      const route = full.replace(dist, "").replace(/\\/g, "/").replace("/index.html", "/");
      pages.set(route || "/", readFileSync(full, "utf8"));
    }
  }
}

before(() => {
  assert.ok(existsSync(dist), "dist/ not found — run `npx astro build` first");
  collect(dist);
});

const page = (route) => {
  const html = pages.get(route);
  assert.ok(html, `route not emitted: ${route}`);
  return html;
};

const textOf = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ");

import { reservedReviewSegments } from "../src/lib/facets.ts";

const hrefsIn = (html) => [...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]);

/* ================================================================= routes */

describe("Phase 5 routes exist in both locales", () => {
  for (const route of [
    "/en/",
    "/ar/",
    "/en/reviews/",
    "/ar/reviews/",
    "/en/method/",
    "/ar/method/",
  ]) {
    test(`${route} is emitted`, () => {
      assert.ok(pages.has(route), `${route} was not built`);
    });
  }

  test("Phase 4 routes still exist — no regression", () => {
    assert.ok(pages.has("/en/reviews/maison-eclat-voile-lumiere-skin-tint/"));
    assert.ok(pages.has("/ar/reviews/maison-eclat-voile-lumiere-skin-tint/"));
    assert.ok(pages.has("/en/404/"));
  });
});

/* ================================================================= reviews index */

describe("reviews index", () => {
  test("lists exactly the reviews available in its own locale", () => {
    const en = page("/en/reviews/");
    const ar = page("/ar/reviews/");

    // The English-only review appears in English and NOT in Arabic.
    assert.ok(en.includes("/en/reviews/veloura-velvet-hour-lip-cream/"));
    assert.ok(!ar.includes("veloura-velvet-hour-lip-cream"));

    // The Arabic-original appears in Arabic and NOT in English.
    assert.ok(ar.includes("/ar/reviews/terra-sana-verdure-cloud-balm/"));
    assert.ok(!en.includes("terra-sana-verdure-cloud-balm"));
  });

  test("links to every review in its locale — five each", () => {
    // Category facets share the path level with review slugs, so counting segments is not
    // enough: the reserved category segments must be excluded explicitly. That the two sets are
    // disjoint is itself asserted in tests/facets.test.mjs.
    const reserved = reservedReviewSegments();
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/reviews/`);
      const detail = [...new Set(hrefsIn(html))].filter((h) => {
        const parts = h.split("/").filter(Boolean);
        return (
          parts.length === 3 &&
          parts[0] === locale &&
          parts[1] === "reviews" &&
          !reserved.includes(parts[2])
        );
      });
      assert.equal(detail.length, 5, `${locale}: expected 5 review links, got ${detail.length}`);
    }
  });

  test("exposes crawlable facet URLs, not client-side filter state", () => {
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/reviews/`);
      assert.ok(html.includes(`/${locale}/reviews/foundation/`), "category facet link missing");
      assert.ok(html.includes(`/${locale}/reviews/brand/`), "brand facet link missing");
      // No query-string filters: a query string is not a route in a static build.
      assert.ok(!/href="[^"]*\?(category|brand|disclosure)=/.test(html), "query-string filter found");
    }
  });

  test("ships no JavaScript — discovery works with scripting disabled", () => {
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/reviews/`);
      const scripts = [...html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>/g)];
      assert.equal(scripts.length, 0);
    }
  });

  test("shows the disclosure of every listed review", () => {
    const html = page("/en/reviews/");
    for (const label of ["Paid partnership", "Gifted", "Bought independently"]) {
      assert.ok(html.includes(label), `missing disclosure label: ${label}`);
    }
  });

  test("no score, star, rank, award or social proof anywhere", () => {
    for (const locale of ["en", "ar"]) {
      const text = textOf(page(`/${locale}/reviews/`));
      // Word boundaries matter: "Reviews" legitimately contains "views".
      for (const forbidden of [
        /\u2605/, /\u2606/,
        /\b\d\/10\b/, /\b\d\/5\b/,
        /\bbest\b/i, /\btop \d/i, /\branked\b/i,
        /\bfollowers\b/i, /\blikes\b/i, /\bpage views\b/i,
      ]) {
        assert.ok(!forbidden.test(text), `${locale} index matches ${forbidden}`);
      }
    }
  });

  test("has exactly one h1 and links to the Method in prose", () => {
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/reviews/`);
      assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
      assert.ok(html.includes(`/${locale}/method/`), "no Method link");
    }
  });
});

/* ================================================================= facets */

describe("facet pages", () => {
  test("every category facet is noindex and canonicalises to the index today", () => {
    for (const [route, html] of pages) {
      const m = route.match(/^\/(en|ar)\/reviews\/([a-z]+)\/$/);
      if (!m || m[2] === "brand") continue;
      assert.ok(html.includes('content="noindex'), `${route} is indexable but holds one review`);
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)[1];
      assert.ok(canonical.endsWith(`/${m[1]}/reviews/`), `${route} canonical is ${canonical}`);
    }
  });

  test("a gated facet emits no hreflang — it claims no cross-language equivalence", () => {
    // Scoped to FACET routes deliberately. EVERY page is noindex in a preview build, and a
    // review page being noindex-for-preview says nothing about whether it has a counterpart.
    const reserved = reservedReviewSegments();
    for (const [route, html] of pages) {
      const parts = route.split("/").filter(Boolean);
      const isCategoryFacet =
        parts.length === 3 && parts[1] === "reviews" && reserved.includes(parts[2]);
      const isBrandFacet = parts.length === 4 && parts[1] === "reviews" && parts[2] === "brand";
      if (!isCategoryFacet && !isBrandFacet) continue;
      assert.ok(
        !html.includes('rel="alternate" hreflang'),
        `${route} is a gated facet yet emits hreflang alternates`
      );
    }
  });

  test("brand facets exist for every brand with records in that locale", () => {
    assert.ok(pages.has("/en/reviews/brand/veloura-beauty/"));
    assert.ok(pages.has("/ar/reviews/brand/terra-sana/"));
    // Terra Sana has no English reviews, so no English facet.
    assert.ok(!pages.has("/en/reviews/brand/terra-sana/"));
  });

  test("facet pages state plainly that they are navigation views", () => {
    const html = page("/en/reviews/foundation/");
    assert.ok(textOf(html).includes("This is a navigation view"));
  });

  test("every facet page offers a route back to the full index", () => {
    for (const [route, html] of pages) {
      if (!/\/reviews\/(brand\/)?[a-z-]+\/$/.test(route)) continue;
      if (route.match(/\/reviews\/[a-z-]+-[a-z-]+/)) continue; // review details
      const locale = route.split("/")[1];
      assert.ok(hrefsIn(html).includes(`/${locale}/reviews/`), `${route} has no way back`);
    }
  });
});

/* ================================================================= method */

describe("method", () => {
  test("renders all six stages in canonical order, in both locales", () => {
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/method/`);
      for (const key of ["baseline", "application", "wear-window", "conditions", "comparison", "revisit"]) {
        assert.ok(html.includes(`id="${key}"`), `${locale}: stage ${key} missing`);
      }
      const stages = (html.match(/<li class="stage"/g) ?? []).length;
      assert.equal(stages, 6, `${locale}: expected 6 stages, got ${stages}`);
    }
  });

  test("every stage carries what it does NOT prove", () => {
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/method/`);
      const blocks = (html.match(/class="does-not-prove"/g) ?? []).length;
      assert.equal(blocks, 6, `${locale}: ${blocks} doesNotProve blocks for 6 stages`);
    }
  });

  test("doesNotProve renders at IDENTICAL weight to purpose", () => {
    // Both use .stage-purpose. If a separate, quieter class ever appears, the page's argument
    // has been inverted and this fails.
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/method/`);
      const inside = [...html.matchAll(/class="does-not-prove"[\s\S]{0,400}?<p class="([^"]+)"/g)].map(
        (m) => m[1]
      );
      assert.equal(inside.length, 6);
      for (const cls of inside) {
        assert.ok(cls.includes("stage-purpose"), `doesNotProve uses a different class: ${cls}`);
      }
    }
  });

  test("the boundary statement appears BEFORE the stages", () => {
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/method/`);
      const boundary = html.indexOf('class="boundary"');
      const stages = html.indexOf('class="stages-section"');
      assert.ok(boundary > -1 && stages > -1);
      assert.ok(boundary < stages, `${locale}: the boundary must precede the stages`);
    }
  });

  test("carries the PROJECT MOCK METHOD notice, in both locales", () => {
    assert.ok(textOf(page("/en/method/")).includes("PROJECT MOCK METHOD"));
    assert.ok(textOf(page("/ar/method/")).includes("طريقة مبدئية للمشروع"));
  });

  test("makes NO clinical, medical, laboratory or certification claim", () => {
    const forbidden = [
      "clinically proven",
      "clinically validated",
      "medically validated",
      "scientifically validated",
      "lab-tested",
      "laboratory tested",
      "certified",
      "accredited",
      "proprietary",
      "dermatologist approved",
    ];
    for (const locale of ["en", "ar"]) {
      const text = textOf(page(`/${locale}/method/`)).toLowerCase();
      for (const phrase of forbidden) {
        assert.ok(!text.includes(phrase), `${locale} method claims "${phrase}"`);
      }
    }
  });

  test("emits no HowTo, MedicalEntity or Organization schema", () => {
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/method/`);
      for (const type of ["HowTo", "MedicalEntity", "MedicalProcedure", "Organization", "Course"]) {
        assert.ok(!html.includes(`"${type}"`), `${locale} method emits ${type} schema`);
      }
    }
  });

  test("stages link to the reviews that used them", () => {
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/method/`);
      assert.ok(/class="[^"]*review-links/.test(html), `${locale}: no stage-to-review links`);
    }
  });

  test("no progress bars, gauges, counters or scroll animation", () => {
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/method/`);
      for (const f of ["<progress", "<meter", 'role="progressbar"', "IntersectionObserver"]) {
        assert.ok(!html.includes(f), `${locale} method contains ${f}`);
      }
    }
  });
});

/* ================================================================= homepage */

describe("homepage", () => {
  test("has exactly one h1, and it is the CLAIM rather than the name", () => {
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/`);
      assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
      const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1];
      assert.ok(h1.length > 40, `the h1 looks like a name, not a claim: ${h1}`);
    }
  });

  test("links to the Method and to the reviews index", () => {
    for (const locale of ["en", "ar"]) {
      const hrefs = hrefsIn(page(`/${locale}/`));
      assert.ok(hrefs.includes(`/${locale}/method/`), "no Method link");
      assert.ok(hrefs.includes(`/${locale}/reviews/`), "no reviews index link");
    }
  });

  test("carries exactly one evidence moment — conditions and one observation", () => {
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/`);
      assert.equal((html.match(/class="conditions"/g) ?? []).length, 1, "expected one conditions block");
      assert.ok((html.match(/class="observation"/g) ?? []).length <= 1, "more than one observation");
    }
  });

  test("the method boundary travels with the method, on the homepage too", () => {
    for (const locale of ["en", "ar"]) {
      assert.ok(page(`/${locale}/`).includes("boundary-line"), `${locale}: no boundary on the homepage`);
    }
  });

  test("STATE B — no photography exists, so no image and no placeholder is rendered", () => {
    for (const locale of ["en", "ar"]) {
      const html = page(`/${locale}/`);
      // Astro bundles a component's CSS whenever the page IMPORTS it, even if the component
      // never renders. The assertion must therefore be about MARKUP, not about the stylesheet.
      const markup = html.replace(/<style[\s\S]*?<\/style>/g, " ");
      assert.ok(!markup.includes("opening--portrait"), "State A rendered without a real portrait");
      assert.ok(markup.includes("opening--typographic"), "expected the State B composition");
      assert.ok(!markup.includes("frame--placeholder"), "a grey placeholder was rendered");
      assert.ok(!markup.includes("/mock-media/"), "referenced an asset that does not exist");
      assert.ok(!/<img[\s>]/.test(markup), "an image was rendered with no photography available");
      assert.ok(!/role="img"/.test(markup), "a placeholder image role was rendered");
    }
  });

  test("promises nothing that does not exist", () => {
    for (const locale of ["en", "ar"]) {
      const text = textOf(page(`/${locale}/`)).toLowerCase();
      for (const phrase of ["coming soon", "under construction", "stay tuned", "launching", "sign up", "newsletter"]) {
        assert.ok(!text.includes(phrase), `${locale} homepage says "${phrase}"`);
      }
    }
  });

  test("no fabricated proof of any kind", () => {
    for (const locale of ["en", "ar"]) {
      const text = textOf(page(`/${locale}/`)).toLowerCase();
      for (const phrase of ["followers", "as seen in", "award", "testimonial", "trusted by", "clients say", "5-star"]) {
        assert.ok(!text.includes(phrase), `${locale} homepage contains "${phrase}"`);
      }
      const html = page(`/${locale}/`);
      for (const type of ["Organization", "AggregateRating", "Review\"", "sameAs"]) {
        assert.ok(!html.includes(`"${type}`), `${locale} homepage emits ${type}`);
      }
    }
  });

  test("ships no JavaScript", () => {
    for (const locale of ["en", "ar"]) {
      const scripts = [...page(`/${locale}/`).matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>/g)];
      assert.equal(scripts.length, 0);
    }
  });
});
