/**
 * PHASE 13 — LAUNCH HARDENING, asserted against the production build.
 *
 * Every test here exists because the Phase 13 audit found the defect it guards, in the emitted
 * output, on a build whose 478 tests were all green. That is the point: each one closes a gap
 * the suite genuinely had, rather than restating something already covered.
 *
 *   - no favicon at all, on all 85 routes, and /favicon.ico 404ing on every page load
 *   - six meta descriptions shared across twenty-seven facet routes
 *   - the homepage description 199 characters long, truncated in every search result
 *   - a travel rail switched on at a width where the layout it needs does not exist yet
 *   - link lists with 20-23px tap targets on four route types
 *
 * Requires a build: `npx astro build`.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { shippedCss } from "./helpers/css.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const pages = [];
let css = "";

before(() => {
  assert.ok(existsSync(dist), "dist/ not found — run `npx astro build` first");
  (function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry === "index.html") {
        pages.push({
          route: "/" + relative(dist, full).split("\\").join("/").replace(/index\.html$/, ""),
          html: readFileSync(full, "utf8"),
        });
      }
    }
  })(dist);
  css = shippedCss(dist, pages);
});

const meta = (html, name) => html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`))?.[1] ?? null;

/* ================================================================= the site mark */

describe("the site has a mark, and the browser can find it", () => {
  test("every page declares an icon, and every declared icon was emitted", () => {
    for (const page of pages) {
      const links = [...page.html.matchAll(/<link rel="(?:icon|apple-touch-icon)"[^>]*href="([^"]+)"[^>]*>/g)];
      assert.ok(links.length >= 2, `${page.route} declares ${links.length} icon links`);
      for (const [, href] of links) {
        assert.ok(href.startsWith("/"), `${page.route}: icon on a foreign origin: ${href}`);
        assert.ok(existsSync(join(dist, href)), `${page.route}: icon file missing: ${href}`);
      }
    }
  });

  test("/favicon.ico exists, because every browser asks for it whether or not it is declared", () => {
    // Before Phase 13 it did not, so every page load logged a 404 in the console. A declared
    // <link> does not stop the implicit request in every browser; the file has to be there.
    const ico = join(dist, "favicon.ico");
    assert.ok(existsSync(ico), "/favicon.ico was not emitted");
    const bytes = readFileSync(ico);
    // ICONDIR: reserved 0, type 1 (icon), count >= 1.
    assert.equal(bytes.readUInt16LE(0), 0, "favicon.ico is not an ICO (reserved field)");
    assert.equal(bytes.readUInt16LE(2), 1, "favicon.ico is not an ICO (type field)");
    assert.ok(bytes.readUInt16LE(4) >= 1, "favicon.ico contains no images");
  });

  test("the mark is built from the brand palette, not from an arbitrary colour", () => {
    const svg = readFileSync(join(dist, "favicon.svg"), "utf8");
    const tokens = readFileSync(join(root, "src", "styles", "tokens.css"), "utf8").toLowerCase();
    const hexes = [...svg.matchAll(/#([0-9a-f]{6})/gi)].map((m) => m[1].toLowerCase());
    assert.ok(hexes.length >= 2, "the mark declares no colours");
    for (const hex of hexes) {
      assert.ok(tokens.includes(`#${hex}`), `the mark uses #${hex}, which is not in the palette`);
    }
  });
});

/* ================================================================= search-result quality */

describe("every route describes itself, once, at a length that survives a search result", () => {
  test("no two routes share a meta description", () => {
    /*
     * The Phase 13 audit found SIX descriptions shared across twenty-seven routes: every review
     * category said "Testing records in this category.", every brand facet "Testing records for
     * this brand.", every journal format "Articles in this editorial format." A search engine
     * treats duplicate descriptions as a quality signal and rewrites the snippet, so the site was
     * writing its own snippets and then throwing them away. Each one now names its own facet.
     */
    const byDescription = new Map();
    for (const page of pages) {
      const description = meta(page.html, "description");
      assert.ok(description, `${page.route} has no meta description`);
      if (!byDescription.has(description)) byDescription.set(description, []);
      byDescription.get(description).push(page.route);
    }
    const shared = [...byDescription].filter(([, routes]) => routes.length > 1);
    assert.equal(
      shared.length,
      0,
      `duplicate descriptions:\n${shared.map(([d, r]) => `  ${r.length}x ${JSON.stringify(d.slice(0, 50))} — ${r.slice(0, 3).join(" ")}`).join("\n")}`
    );
  });

  test("no two routes share a title", () => {
    const byTitle = new Map();
    for (const page of pages) {
      const title = page.html.match(/<title>([^<]*)<\/title>/)?.[1];
      assert.ok(title, `${page.route} has no title`);
      if (!byTitle.has(title)) byTitle.set(title, []);
      byTitle.get(title).push(page.route);
    }
    const shared = [...byTitle].filter(([, routes]) => routes.length > 1);
    assert.equal(shared.length, 0, `duplicate titles: ${shared.map(([t, r]) => `${JSON.stringify(t)} — ${r.join(" ")}`).join("; ")}`);
  });

  test("no description is long enough to be truncated in a search result", () => {
    // The homepage shipped 199 characters. Roughly 155-160 are shown; the rest is a sentence
    // nobody reads, on the most important page on the site.
    for (const page of pages) {
      const description = meta(page.html, "description");
      assert.ok(description.length <= 160, `${page.route}: description is ${description.length} characters`);
    }
  });

  test("no English description is too thin to say anything", () => {
    // Deliberately English-only: the same sentence in Arabic occupies far fewer code points, so
    // a character floor applied to both scripts measures the script, not the sentence.
    for (const page of pages.filter((p) => p.route.startsWith("/en/") && !p.route.endsWith("/404/"))) {
      const description = meta(page.html, "description");
      assert.ok(description.length >= 50, `${page.route}: description is only ${description.length} characters`);
    }
  });

  test("every structured-data block is valid JSON", () => {
    for (const page of pages) {
      for (const block of page.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
        assert.doesNotThrow(() => JSON.parse(block[1]), `${page.route}: invalid JSON-LD`);
      }
    }
  });
});

/* ================================================================= choreography bounds */

describe("a travelling product only runs where it has room to run", () => {
  test("every travel rail is gated to the width at which its layout exists", () => {
    /*
     * The homepage rail was switched on at 768. The story section it runs down only becomes TWO
     * COLUMNS at 1024 — between those widths it is a single stack, so "the visual column" was the
     * prose, and the choreography audit measured the product covering a heading. A corridor needs
     * a column of its own. `cosmetic--wide` is the class that removes a slot below 1024.
     */
    let rails = 0;
    for (const page of pages) {
      for (const slot of page.html.match(/<div[^>]*data-cosmetic="[^"]*"[^>]*>/g) ?? []) {
        if (!/data-path="/.test(slot)) continue;
        rails++;
        assert.match(
          slot,
          /class="[^"]*cosmetic--wide/,
          `${page.route}: a travel rail is not gated to the wide breakpoint: ${slot.slice(0, 110)}`
        );
      }
    }
    assert.ok(rails > 0, "no travel rail found — has the product journey been removed?");
  });

  test("the rail's own corridor keeps the product inside the page", () => {
    // Its furthest-out position is a NEGATIVE inset, so the product sits in the margin. Too far
    // negative and it is cropped by the viewport edge, which reads as an accident.
    const rule = css.match(/\.story-journey[^{]*\{[^}]*\}/)?.[0];
    assert.ok(rule, "the story rail's positioning rule is gone");
    const start = rule.match(/inset-inline-start:\s*(-?[\d.]+)%/)?.[1];
    assert.ok(start, "the rail declares no inline start");
    assert.ok(Number(start) > -5, `the rail starts at ${start}%, far enough out to crop the product`);
  });
});

/* ================================================================= the shaders */

describe("the GLSL sources are well formed", () => {
  test("no shader literal is terminated early by a stray backtick", () => {
    /*
     * The shaders are tagged template literals, so a backtick anywhere inside one CLOSES IT. It is
     * an easy mistake to make, because the natural way to name a uniform in a comment is to put it
     * in backticks — and it broke the build twice while the film was being written, each time with
     * an error pointing at a line of GLSL rather than at the quote that caused it.
     *
     * Scoped to the LITERALS. Backticks in ordinary JavaScript comments around them are fine, and
     * an earlier version of this test that simply counted them in the file failed on those — a
     * test that fires on correct code is worse than no test, because it teaches you to ignore it.
     */
    const shaderFiles = ["portrait.ts", "atmosphere.ts", "post.ts"];
    for (const file of shaderFiles) {
      const source = readFileSync(join(root, "src", "scripts", "cinema", file), "utf8");
      const lines = source.split(String.fromCharCode(10));
      let inside = false;
      let literals = 0;
      lines.forEach((line, index) => {
        if (!inside && line.includes("/* glsl */ `")) {
          inside = true;
          literals++;
          return;
        }
        if (!inside) return;
        // The closing delimiter on its own line. A shader assigned to a const ends "`;", one
        // passed inline as an object property ends "`," — both are used in this codebase.
        if (["`;", "`,", "`"].includes(line.trim())) {
          inside = false;
          return;
        }
        assert.ok(
          !line.includes("`"),
          `${file}:${index + 1} has a backtick inside a shader literal, which ends it early: ${line.trim().slice(0, 70)}`
        );
      });
      assert.ok(literals > 0, `${file}: no shader literal found — has the tag changed?`);
      assert.equal(inside, false, `${file}: a shader literal is never closed on its own line`);
    }
  });

  test("every uniform a shader declares is actually supplied", () => {
    // A misspelt uniform name is silently undefined at runtime: the effect simply does not happen,
    // with no error anywhere. This catches the typo at build time instead.
    for (const file of ["portrait.ts", "atmosphere.ts", "post.ts"]) {
      const source = readFileSync(join(root, "src", "scripts", "cinema", file), "utf8");
      const declared = new Set([...source.matchAll(/uniform\s+\w+\s+(u\w+)\s*;/g)].map((m) => m[1]));
      // Not anchored to a line start: a small uniform block is often written on one line.
      const supplied = new Set([...source.matchAll(/\b(u\w+):\s*\{\s*value:/g)].map((m) => m[1]));
      for (const name of declared) {
        assert.ok(supplied.has(name), `${file}: shader declares ${name} but nothing supplies it`);
      }
    }
  });
});

/* ================================================================= tap targets */

describe("a list of destinations is a menu, not a sentence", () => {
  test("the shared link-list primitive exists and clears the 24px minimum", () => {
    /*
     * WCAG 2.5.8 asks for 24x24 CSS pixels. A bare <a> in an <li> is as tall as its line box —
     * 20 to 23px. Phase 12 fixed four surfaces by copying three declarations into four component
     * stylesheets; the Phase 13 sweep, covering more routes, found four MORE with the identical
     * defect. It is one class now, and this is what stops it being weakened back.
     */
    const rule = css.match(/\.link-list a\{[^}]*\}/)?.[0];
    assert.ok(rule, "the .link-list primitive is gone");
    const min = rule.match(/min-block-size:\s*(\d+)px/)?.[1];
    assert.ok(min, ".link-list sets no minimum target height");
    assert.ok(Number(min) >= 24, `.link-list targets are ${min}px, below the 24px minimum`);
  });

  test("the surfaces the audit caught still use it", () => {
    // Scoped deliberately to the routes where the defect was MEASURED in a browser. The 24px
    // guarantee across every surface is verified by the browser sweep (17 viewports x 27 routes),
    // which is recorded in docs/reports/PHASE_13_REPORT.md — a layout property cannot honestly be
    // asserted from HTML alone, and a site-wide structural rule would fail on lists that are
    // already compliant through their own styling.
    const surfaces = [
      ["/en/journal/building-a-practical-routine/", "the journal table of contents"],
      ["/en/404/", "the 404 onward list"],
      ["/en/work/maison-eclat-voile-lumiere-launch/", "the work page's related links"],
      ["/en/brands/maison-eclat/", "the brand page's related links"],
    ];
    for (const [route, what] of surfaces) {
      const page = pages.find((p) => p.route === route);
      assert.ok(page, `${route} was not built — has it moved?`);
      assert.match(page.html, /class="[^"]*link-list/, `${what} lost its tap-target class`);
    }
  });
});
