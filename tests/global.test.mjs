/**
 * GLOBAL INVARIANTS — asserted across EVERY page in the build.
 *
 * These are the rules that must not decay as surfaces are added. Each one has already been
 * violated at least once during development and caught here or in the browser pass.
 */

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { assertOnlyCosmeticsLoader, assertChunksCollectNothing } from "./helpers/client-js.mjs";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { SITE_URL, SITE_URL_IS_PLACEHOLDER } from "../src/config/site.ts";
import { IMPLEMENTED_ROUTES } from "../src/lib/routing.ts";
import { eligibleSocialProfiles } from "../src/lib/content.ts";

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

/**
 * A link to a real FILE (Phase 8: RSS autodiscovery, /sitemap.xml, /robots.txt) is not an
 * `index.html`-based route, so it is never a member of `routes()`. It is dead by exactly the same
 * definition as a broken page link, though: no file exists at that path. Checked directly against
 * disk rather than added to `routes()`, so `routes()` keeps its existing meaning everywhere else
 * in this file — the set of human-navigable pages.
 */
const isRealFile = (href) => /\.[a-z0-9]+$/i.test(href) && existsSync(join(dist, href));

describe("no dead navigation — Phase 5 brief section 20", () => {
  test("every internal link resolves to a page or a file that was actually emitted", () => {
    const emitted = routes();
    const dead = new Map();

    for (const page of pages) {
      for (const href of internalHrefs(page.html)) {
        if (!emitted.has(href) && !isRealFile(href)) {
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
    // Phase 7 emptied this list: every surface the Phase 1 IA declares is now built. It is kept
    // rather than deleted because it is the mechanism that catches the NEXT speculative link —
    // `/press/` and `/brands/{brand}/{product}/` are both declared in site.json routes and both
    // remain unbuilt (press needs 3 verified mentions; product pages are `status: not-built`).
    const unimplemented = ["/press/", "/search/", "/shop/", "/newsletter/"];
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

    // Phase 7 surfaces. Registered AND built, in both locales.
    if (IMPLEMENTED_ROUTES.has("brandsIndex")) {
      assert.ok(emitted.has("/en/brands/"));
      assert.ok(emitted.has("/ar/brands/"));
    }
    if (IMPLEMENTED_ROUTES.has("brand")) {
      // Gated per locale, so this asserts a specific brand that earns a page in BOTH.
      assert.ok(emitted.has("/en/brands/maison-eclat/"));
      assert.ok(emitted.has("/ar/brands/maison-eclat/"));
    }
    if (IMPLEMENTED_ROUTES.has("workIndex")) {
      assert.ok(emitted.has("/en/work/"));
      assert.ok(emitted.has("/ar/work/"));
    }
    if (IMPLEMENTED_ROUTES.has("work")) {
      assert.ok(
        [...emitted].some((r) => /^\/en\/work\/[^/]+\/$/.test(r)),
        "the work template is registered but emitted no page"
      );
    }
    for (const key of ["about", "contact", "editorialStandards", "privacy", "terms"]) {
      if (!IMPLEMENTED_ROUTES.has(key)) continue;
      const segment = key === "editorialStandards" ? "editorial-standards" : key;
      assert.ok(emitted.has(`/en/${segment}/`), `${key} is registered but /en/${segment}/ was not built`);
      assert.ok(emitted.has(`/ar/${segment}/`), `${key} is registered but /ar/${segment}/ was not built`);
    }

    // Still unbuilt, and must stay unregistered until they are.
    for (const key of ["press", "product", "productsIndex"]) {
      assert.ok(!IMPLEMENTED_ROUTES.has(key), `${key} is registered but its template is not built`);
    }
  });
});

/* ================================================================= origin */

describe("the site origin is configuration-driven", () => {
  test("no template or library contains a domain literal", () => {
    // Excluded hosts are XML/RDF NAMESPACE URIs, not site origins — sitemaps.org, w3.org and
    // purl.org identify a vocabulary (sitemap protocol, XHTML, Atom, Dublin Core), the same role
    // schema.org already played here for JSON-LD. Every one is required verbatim by its spec and
    // is identical in every sitemap/RSS file that has ever existed; none of them is a fact about
    // THIS site, so none of them is a Phase 8 domain literal.
    const NAMESPACE_HOSTS = /https:\/\/schema\.org|http:\/\/www\.sitemaps\.org|http:\/\/www\.w3\.org|http:\/\/purl\.org/g;
    for (const { file, text } of sources) {
      if (file.replace(/\\/g, "/").endsWith("src/config/site.ts")) continue;
      assert.ok(
        !/https?:\/\/(?!schema\.org)[a-z0-9.-]+\.[a-z]{2,}/i.test(text.replace(NAMESPACE_HOSTS, "")),
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

  test("every page has a same-origin social preview image that was actually emitted", () => {
    // Phase 11: real photography made a summary_large_image card honest for the first time.
    for (const page of pages) {
      const image = page.html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      assert.ok(image, `${page.route}: no og:image`);
      assert.ok(image.startsWith(SITE_URL), `${page.route}: og:image on a foreign origin: ${image}`);
      assert.ok(existsSync(join(dist, image.slice(SITE_URL.length))), `${page.route}: og:image file missing: ${image}`);
      assert.ok(/<meta property="og:image:alt" content="[^"]{10,}"/.test(page.html), `${page.route}: og:image has no alt`);
      assert.ok(page.html.includes('<meta name="twitter:card" content="summary_large_image"'), page.route);
    }
  });

  test("outbound brand links are marked nofollow and are never our origin", () => {
    // ONE precise exception (Phase 9): a link to a CONFIRMED, sameAsEligible social profile —
    // Zina's own official Instagram — carries rel="me" instead of nofollow. That is the correct
    // relation for a verified self-identity link (it asserts "this is the same entity", the
    // opposite of nofollow's "I do not vouch for this"), and the exception is scoped to the exact
    // eligible profile URLs, not to rel="me" appearing anywhere — a brand's own site could not
    // satisfy this check by adding rel="me" to itself.
    const eligibleUrls = new Set(eligibleSocialProfiles().map((p) => p.url));
    for (const page of pages) {
      for (const m of page.html.matchAll(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>/g)) {
        const [tag, url] = [m[0], m[1]];
        if (url.startsWith(SITE_URL)) continue;
        if (eligibleUrls.has(url)) {
          // "me" as its own token in the rel value — the footer's row carries rel="me noopener".
          assert.ok(/rel="[^"]*\bme\b[^"]*"/.test(tag), `${page.route}: verified profile link without rel="me": ${url}`);
          continue;
        }
        assert.ok(/rel="[^"]*nofollow/.test(tag), `${page.route}: outbound link without nofollow: ${url}`);
      }
    }
  });

  test("U-01 is resolved — the origin is the real production domain, not the placeholder", () => {
    // Phase 9: the project owner supplied the real domain. This is the tripwire's other side —
    // it fired exactly as designed when src/config/site.ts changed, which is what sent this test
    // to docs/reports/PHASE_9_REPORT.md to get updated rather than silently going stale.
    assert.equal(SITE_URL_IS_PLACEHOLDER, false, "SITE_URL still looks like a placeholder");
    assert.equal(SITE_URL, "https://zinaalmokri.com");
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

  /*
   * PHASE 11 — the "Blush Atelier" identity (docs/PHASE_11_VISUAL_REDESIGN.md) deliberately
   * replaced the Phase 2 refusals of radius, shadow and gradient. These tests now guard the NEW
   * system against the ways a luxury palette decays: one-off radii, grey drop shadows, and
   * off-palette or neon gradients.
   */
  const tokenHexes = () => {
    const tokens = readFileSync(join(srcDir, "styles", "tokens.css"), "utf8");
    const hexes = new Set([...tokens.matchAll(/#([0-9a-f]{6})\b/gi)].map((m) => m[1].toLowerCase()));
    for (const m of tokens.matchAll(/rgb\((\d+) (\d+) (\d+)/g)) {
      hexes.add([m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join(""));
    }
    return hexes;
  };

  test("every border-radius resolves to a radius token, 0 or an organic percentage", () => {
    const radii = [...css().matchAll(/border-radius:\s*([^;}]+)/g)].map((m) => m[1].trim());
    for (const radius of radii) {
      for (const part of radius.split(/[\s/]+/).filter(Boolean)) {
        assert.ok(/^(0|\d+(\.\d+)?%|var\(--radius-[a-z]+\))$/.test(part), `off-system border-radius: ${radius}`);
      }
    }
  });

  test("no neutral grey or black elevation shadow", () => {
    const shadows = [...css().matchAll(/box-shadow:\s*([^;}]+)/g)].map((m) => m[1].trim());
    for (const shadow of shadows) {
      assert.ok(!/#000|rgba?\(0[ ,]+0[ ,]+0|black|gr[ae]y/i.test(shadow), `neutral shadow: ${shadow}`);
    }
  });

  test("no generic Card component exists", () => {
    const cards = sources.filter(({ file }) => /\/Card\.astro$/.test(file.replace(/\\/g, "/")));
    assert.equal(cards.length, 0, "a Card component appeared");
  });

  test("every colour in every decorative gradient belongs to the token palette", () => {
    // Mask gradients are luminance masks, not colour, so they are excluded.
    const stylesheet = css().replace(/(-webkit-)?mask-image:[^;}]+/g, "");
    const palette = tokenHexes();
    const gradients = [...stylesheet.matchAll(/(?:repeating-)?(?:linear|radial|conic)-gradient\((?:[^()]|\([^()]*\))*\)/g)].map((m) => m[0]);
    assert.ok(gradients.length > 0, "the identity's tonal gradients are missing from the build");
    for (const gradient of gradients) {
      for (const m of gradient.matchAll(/#([0-9a-f]{3,8})\b/gi)) {
        let hex = m[1].toLowerCase();
        if (hex.length <= 4) hex = hex.slice(0, 3).split("").map((c) => c + c).join("");
        assert.ok(palette.has(hex.slice(0, 6)), `off-palette colour #${m[1]} in ${gradient.slice(0, 80)}`);
      }
    }
  });
});

/* ================================================================= content safety */

describe("content safety across every page", () => {
  test("client JavaScript is limited to the same-origin 3D loader, which collects nothing", () => {
    for (const page of pages) {
      assertOnlyCosmeticsLoader(assert, page.html, page.route);
    }
    assertChunksCollectNothing(assert, dist);
  });

  test("every decorative 3D slot is hidden from assistive technology", () => {
    for (const page of pages) {
      for (const slot of page.html.matchAll(/<div[^>]*data-cosmetic="[^"]*"[^>]*>/g)) {
        assert.ok(/aria-hidden="true"/.test(slot[0]), `${page.route}: a 3D slot is exposed to AT`);
      }
    }
  });

  test("no rating, aggregate rating or offer schema anywhere", () => {
    for (const page of pages) {
      for (const forbidden of ["reviewRating", "aggregateRating", "ratingValue", "AggregateRating", '"offers"']) {
        assert.ok(!page.html.includes(forbidden), `${page.route} emits ${forbidden}`);
      }
    }
  });

  test("no fabricated entity: Organization, award and MedicalEntity never appear", () => {
    for (const page of pages) {
      for (const forbidden of ['"Organization"', '"award"', '"MedicalEntity"']) {
        assert.ok(!page.html.includes(forbidden), `${page.route} emits ${forbidden}`);
      }
    }
  });

  test("sameAs, where it appears, is EXACTLY the one confirmed profile — never a fabricated one", () => {
    // Phase 9 confirmed Instagram. sameAs now legitimately appears wherever personSchema() is
    // called. This asserts what it may never become: a second, invented profile URL.
    const eligible = eligibleSocialProfiles().map((p) => p.url);
    assert.deepEqual(eligible, ["https://www.instagram.com/zina.almokri?stkn=MTI4aHRmMGZ0bDdibw=="]);
    for (const page of pages) {
      for (const m of page.html.matchAll(/"sameAs"\s*:\s*\[([^\]]*)\]/g)) {
        const urls = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
        for (const url of urls) {
          assert.ok(eligible.includes(url), `${page.route}: sameAs carries an unconfirmed URL: ${url}`);
        }
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
