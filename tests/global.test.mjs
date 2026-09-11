/**
 * GLOBAL INVARIANTS — asserted across EVERY page in the build.
 *
 * These are the rules that must not decay as surfaces are added. Each one has already been
 * violated at least once during development and caught here or in the browser pass.
 */

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { SITE_URL, SITE_URL_IS_PLACEHOLDER } from "../src/config/site.ts";
import { IMPLEMENTED_ROUTES } from "../src/lib/routing.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const srcDir = join(root, "src");

const pages = [];

function collectPages(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectPages(full);
    else if (entry === "index.html") {
      pages.push({
        route: full.replace(dist, "").replace(/\\/g, "/").replace("/index.html", "/"),
        html: readFileSync(full, "utf8"),
      });
    }
  }
}

function collectSource(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collectSource(full, out);
    else if (/\.(astro|ts|css)$/.test(entry)) out.push({ file: full.replace(root, ""), text: readFileSync(full, "utf8") });
  }
  return out;
}

let sources = [];

before(() => {
  assert.ok(existsSync(dist), "dist/ not found — run `npx astro build` first");
  collectPages(dist);
  sources = collectSource(srcDir);
});

const routes = () => new Set(pages.map((p) => p.route));
const internalHrefs = (html) =>
  [...html.matchAll(/href="(\/[^"#?]*)"/g)]
    .map((m) => m[1])
    .filter((h) => !h.startsWith("/fonts/") && !h.startsWith("/_astro/"));

/* ================================================================= dead navigation */

describe("no dead navigation — Phase 5 brief section 20", () => {
  test("every internal link resolves to a page that was actually emitted", () => {
    const emitted = routes();
    const dead = new Map();

    for (const page of pages) {
      for (const href of internalHrefs(page.html)) {
        if (!emitted.has(href)) {
          if (!dead.has(href)) dead.set(href, []);
          dead.get(href).push(page.route);
        }
      }
    }

    assert.equal(
      dead.size,
      0,
      `dead links:\n${[...dead].map(([h, from]) => `  ${h}  <- ${from[0]}`).join("\n")}`
    );
  });

  test("navigation exposes no route that is not implemented", () => {
    // `/journal/` left this list in Phase 6 — it is now a built surface. Everything still here is
    // a route no template emits, so linking to it would strand a reader.
    const unimplemented = ["/about/", "/work/", "/contact/", "/brands/", "/privacy/", "/terms/", "/editorial-standards/"];
    for (const page of pages) {
      for (const href of internalHrefs(page.html)) {
        for (const fragment of unimplemented) {
          assert.ok(
            !href.endsWith(fragment),
            `${page.route} links to unimplemented ${href}`
          );
        }
      }
    }
  });

  test("the implemented-routes registry matches what the build emits", () => {
    // If a template is added without registering it, navigation silently keeps hiding it.
    const emitted = routes();
    if (IMPLEMENTED_ROUTES.has("method")) assert.ok(emitted.has("/en/method/"));
    if (IMPLEMENTED_ROUTES.has("reviewsIndex")) assert.ok(emitted.has("/en/reviews/"));
    if (IMPLEMENTED_ROUTES.has("home")) assert.ok(emitted.has("/en/"));

    // Phase 6 surfaces. Registered AND built, in both locales.
    if (IMPLEMENTED_ROUTES.has("journalIndex")) {
      assert.ok(emitted.has("/en/journal/"));
      assert.ok(emitted.has("/ar/journal/"));
    }
    if (IMPLEMENTED_ROUTES.has("journal")) {
      assert.ok(
        [...emitted].some((r) => /^\/en\/journal\/[^/]+\/$/.test(r)),
        "the journal article template is registered but emitted no page"
      );
    }
    if (IMPLEMENTED_ROUTES.has("journalByCategory")) {
      assert.ok(emitted.has("/en/journal/guides/"), "no journal category archive was emitted");
    }

    for (const key of ["about", "work", "contact", "brand", "brandsIndex"]) {
      assert.ok(!IMPLEMENTED_ROUTES.has(key), `${key} is registered but its template is not built`);
    }
  });
});

/* ================================================================= origin */

describe("the site origin is configuration-driven", () => {
  test("no template or library contains a domain literal", () => {
    for (const { file, text } of sources) {
      if (file.replace(/\\/g, "/").endsWith("src/config/site.ts")) continue;
      assert.ok(
        !/https?:\/\/(?!schema\.org)[a-z0-9.-]+\.[a-z]{2,}/i.test(text.replace(/https:\/\/schema\.org/g, "")),
        `${file} contains a hard-coded origin`
      );
    }
  });

  test("every SELF-REFERENTIAL absolute URL uses the configured origin", () => {
    // Outbound links to a brand's own site are content, not site URLs, and must NOT be rewritten
    // to our origin. Only the URLs the site asserts about ITSELF are checked here.
    for (const page of pages) {
      const selfReferential = [
        ...page.html.matchAll(/<link rel="canonical" href="([^"]+)"/g),
        ...page.html.matchAll(/<link rel="alternate" hreflang="[^"]+" href="([^"]+)"/g),
        ...page.html.matchAll(/<meta property="og:url" content="([^"]+)"/g),
      ].map((m) => m[1]);

      assert.ok(selfReferential.length > 0, `${page.route} asserts no URL about itself`);
      for (const url of selfReferential) {
        assert.ok(url.startsWith(SITE_URL), `${page.route}: foreign origin ${url}`);
      }

      // JSON-LD url/@id fields likewise.
      for (const block of page.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        const data = block[1];
        for (const m of data.matchAll(/"(?:url|@id|item)":"(https?:\/\/[^"]+)"/g)) {
          assert.ok(m[1].startsWith(SITE_URL), `${page.route}: JSON-LD foreign origin ${m[1]}`);
        }
      }
    }
  });

  test("outbound brand links are marked nofollow and are never our origin", () => {
    for (const page of pages) {
      for (const m of page.html.matchAll(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>/g)) {
        const [tag, url] = [m[0], m[1]];
        if (url.startsWith(SITE_URL)) continue;
        assert.ok(/rel="[^"]*nofollow/.test(tag), `${page.route}: outbound link without nofollow: ${url}`);
      }
    }
  });

  test("the placeholder origin is still flagged as blocking", () => {
    // When a real domain is supplied this flips, and the Phase 5 report's blocker clears.
    assert.equal(SITE_URL_IS_PLACEHOLDER, true, "SITE_URL changed — update the report");
  });
});

/* ================================================================= bilingual */

describe("bilingual invariants", () => {
  test("every page declares lang and dir", () => {
    for (const page of pages) {
      const expected = page.route.startsWith("/ar/") ? ['lang="ar"', 'dir="rtl"'] : ['lang="en"', 'dir="ltr"'];
      for (const attr of expected) {
        assert.ok(page.html.includes(attr), `${page.route} missing ${attr}`);
      }
    }
  });

  test("NO bare <bdi> anywhere in the build", () => {
    for (const page of pages) {
      const bare = (page.html.match(/<bdi>/g) ?? []).length;
      assert.equal(bare, 0, `${page.route} emits ${bare} bare <bdi>`);
    }
  });

  test("no Arabic text is ever labelled as English", () => {
    for (const page of pages.filter((p) => p.route.startsWith("/ar/"))) {
      const mislabelled = [...page.html.matchAll(/<bdi lang="en">([^<]*)<\/bdi>/g)]
        .map((m) => m[1])
        .filter((text) => /[؀-ۿ]/.test(text));
      assert.equal(mislabelled.length, 0, `${page.route}: "${mislabelled[0]}" marked English`);
    }
  });

  test("Latin identifiers inside Arabic prose keep their lang isolation", () => {
    const arabicReview = pages.find((p) =>
      p.route === "/ar/reviews/maison-eclat-voile-lumiere-skin-tint/"
    );
    assert.ok(arabicReview.html.includes('<bdi lang="en">'), "no isolated Latin identifier found");
  });

  test("no second RTL stylesheet and no [dir=rtl] override system", () => {
    const overrides = sources.filter(({ text }) => /\[dir\s*=\s*["']?rtl/.test(text));
    assert.equal(
      overrides.length,
      0,
      `direction override found in: ${overrides.map((o) => o.file).join(", ")}`
    );
  });

  test("Arabic is never letter-spaced", () => {
    for (const { file, text } of sources) {
      if (!file.endsWith(".css") && !file.endsWith(".astro")) continue;
      const arabicTracking = /lang="ar"[\s\S]{0,200}letter-spacing:\s*(?!0|var\(--type-tracking)/.test(text);
      assert.ok(!arabicTracking, `${file} letter-spaces Arabic`);
    }
  });

  test("every locale loads only its own fonts", () => {
    for (const page of pages) {
      if (page.route.startsWith("/ar/")) {
        assert.ok(page.html.includes("/fonts/ar.css"), page.route);
        assert.ok(!page.html.includes("/fonts/en.css"), `${page.route} loaded English fonts`);
      } else {
        assert.ok(page.html.includes("/fonts/en.css"), page.route);
        assert.ok(!page.html.includes("noto-naskh"), `${page.route} preloaded an Arabic face`);
      }
    }
  });
});

/* ================================================================= accessibility */

describe("accessibility invariants", () => {
  test("exactly one h1 per page", () => {
    for (const page of pages) {
      const count = (page.html.match(/<h1[\s>]/g) ?? []).length;
      assert.equal(count, 1, `${page.route} has ${count} h1 elements`);
    }
  });

  test("no heading level is skipped", () => {
    for (const page of pages) {
      const levels = [...page.html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
      for (let i = 1; i < levels.length; i++) {
        assert.ok(
          levels[i] - levels[i - 1] <= 1,
          `${page.route}: h${levels[i - 1]} -> h${levels[i]}`
        );
      }
    }
  });

  test("the skip link is present and precedes the header", () => {
    for (const page of pages) {
      assert.ok(page.html.includes('class="skip-link" href="#main"'), page.route);
      assert.ok(page.html.indexOf("skip-link") < page.html.indexOf("<header"), page.route);
    }
  });

  test("every nav landmark is uniquely named", () => {
    for (const page of pages) {
      const names = [...page.html.matchAll(/<nav[^>]*aria-label="([^"]+)"/g)].map((m) => m[1]);
      const unnamed = (page.html.match(/<nav(?![^>]*aria-label)/g) ?? []).length;
      assert.equal(unnamed, 0, `${page.route} has an unnamed nav landmark`);
      assert.equal(new Set(names).size, names.length, `${page.route} has duplicate nav names: ${names}`);
    }
  });

  test("no positive tabindex", () => {
    for (const page of pages) {
      assert.ok(!/tabindex="[1-9]/.test(page.html), `${page.route} uses a positive tabindex`);
    }
  });

  test("no image lacks alt, and no placeholder lacks an accessible name", () => {
    for (const page of pages) {
      const imgs = [...page.html.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
      for (const img of imgs) assert.ok(/\salt="/.test(img), `${page.route}: img without alt`);
      const roleImgs = [...page.html.matchAll(/role="img"[^>]*>/g)].map((m) => m[0]);
      for (const el of roleImgs) {
        assert.ok(/aria-label="/.test(el), `${page.route}: role=img without a label`);
      }
    }
  });

  test("every link has a discernible name", () => {
    for (const page of pages) {
      const empty = [...page.html.matchAll(/<a\b[^>]*>\s*<\/a>/g)];
      assert.equal(empty.length, 0, `${page.route} has an empty link`);
    }
  });
});

/* ================================================================= design system */

describe("design-system invariants", () => {
  const css = () =>
    readdirSync(join(dist, "_astro"))
      .filter((f) => f.endsWith(".css"))
      .map((f) => readFileSync(join(dist, "_astro", f), "utf8"))
      .join("\n");

  test("no border-radius other than 0 or the 2px control radius", () => {
    const radii = [...css().matchAll(/border-radius:\s*([^;}]+)/g)].map((m) => m[1].trim());
    for (const radius of radii) {
      assert.ok(
        /^(0|2px|var\(--radius-(none|control)\))$/.test(radius),
        `forbidden border-radius: ${radius}`
      );
    }
  });

  test("no elevation shadow", () => {
    const shadows = [...css().matchAll(/box-shadow:\s*([^;}]+)/g)].map((m) => m[1].trim());
    for (const shadow of shadows) {
      // `inset 0 0 0 1px` draws the HOLLOW stage marker — a border, not elevation.
      assert.ok(shadow.startsWith("inset"), `elevation shadow: ${shadow}`);
    }
  });

  test("no generic Card component exists", () => {
    const cards = sources.filter(({ file }) => /\/Card\.astro$/.test(file.replace(/\\/g, "/")));
    assert.equal(cards.length, 0, "a Card component appeared");
  });

  test("no gradient beyond the paper grain", () => {
    const gradients = [...css().matchAll(/(linear|radial|conic)-gradient\([^)]*\)/g)].map((m) => m[0]);
    for (const gradient of gradients) {
      assert.ok(
        gradient.startsWith("repeating-linear-gradient") || gradient.includes("255 255 255 / 1.5%"),
        `decorative gradient: ${gradient.slice(0, 60)}`
      );
    }
  });
});

/* ================================================================= content safety */

describe("content safety across every page", () => {
  test("zero client JavaScript", () => {
    for (const page of pages) {
      const scripts = [...page.html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>/g)];
      assert.equal(scripts.length, 0, `${page.route} ships ${scripts.length} script tag(s)`);
    }
  });

  test("no rating, aggregate rating or offer schema anywhere", () => {
    for (const page of pages) {
      for (const forbidden of ["reviewRating", "aggregateRating", "ratingValue", "AggregateRating", '"offers"']) {
        assert.ok(!page.html.includes(forbidden), `${page.route} emits ${forbidden}`);
      }
    }
  });

  test("no fabricated entity: no sameAs, no Organization, no award", () => {
    for (const page of pages) {
      for (const forbidden of ['"sameAs"', '"Organization"', '"award"', '"MedicalEntity"']) {
        assert.ok(!page.html.includes(forbidden), `${page.route} emits ${forbidden}`);
      }
    }
  });

  test("every page carries the machine-detectable mock marker while the source is mock", () => {
    for (const page of pages) {
      assert.ok(page.html.includes("__MOCK_DATA__"), `${page.route} has no build-provenance marker`);
      assert.ok(/<!--[^>]*__MOCK_DATA__/.test(page.html), `${page.route}: marker must be a comment`);
    }
  });

  test("no internal lifecycle marker leaks into rendered text", () => {
    for (const page of pages) {
      const body = page.html.replace(/<!--[\s\S]*?-->/g, "");
      for (const leak of ["_verification", "NEEDS_VERIFICATION", '"status":', "needs-verification"]) {
        assert.ok(!body.includes(leak), `${page.route} renders ${leak}`);
      }
    }
  });

  test("no page references an asset that does not exist", () => {
    for (const page of pages) {
      assert.ok(!page.html.includes("/mock-media/"), `${page.route} references a missing asset`);
    }
  });
});
