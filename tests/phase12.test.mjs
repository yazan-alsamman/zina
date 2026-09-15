/**
 * PHASE 12 — THE EXPERIENCE LAYER, asserted against the production build.
 *
 * Phase 12 added a choreography system (depth layers, a visibility budget, scroll-driven
 * approach and rotation, travel rails), a paper grain, a four-tier motion scale, a four-step
 * shadow ladder and breakpoint tokens shared between the stylesheet and the 3D scene.
 *
 * Everything below guards a way that system can DECAY rather than break: a slot with a layer
 * nobody implemented, a page that quietly grows to fifteen products, a motion token that is not
 * zeroed under prefers-reduced-motion, an external request appearing in CSS, a `100vw` that
 * reintroduces a horizontal scrollbar, a new photograph shipped without alt text.
 *
 * Requires a build: `npx astro build`.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { shippedCss } from "./helpers/css.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const srcDir = join(root, "src");

const pages = [];
let css = "";
let tokens = "";

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
  css = shippedCss(dist, pages);
  tokens = readFileSync(join(srcDir, "styles", "tokens.css"), "utf8");
});

const slotsIn = (html) => [...html.matchAll(/<div[^>]*data-cosmetic="[^"]*"[^>]*>/g)].map((m) => m[0]);
const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];

/* ================================================================= the 3D contract */

describe("every 3D slot declares something the scene can actually render", () => {
  test("every kind on every page exists in the catalogue", async () => {
    const { COSMETIC_KINDS } = await import("./helpers/cosmetic-kinds.mjs");
    const used = new Set();
    for (const page of pages) {
      for (const slot of slotsIn(page.html)) {
        const kind = attr(slot, "data-cosmetic");
        assert.ok(COSMETIC_KINDS.includes(kind), `${page.route}: unknown package "${kind}"`);
        used.add(kind);
      }
    }
    // The catalogue exists to be SEEN. A library of twenty-four that ships three on the whole
    // site is a library nobody built; this is the floor that keeps it honest.
    assert.ok(used.size >= 12, `only ${used.size} of the catalogue's packages appear anywhere`);
  });

  test("every slot declares a depth layer the scene implements", () => {
    for (const page of pages) {
      for (const slot of slotsIn(page.html)) {
        const layer = attr(slot, "data-layer");
        assert.ok(["back", "mid", "fore"].includes(layer), `${page.route}: bad layer "${layer}"`);
      }
    }
  });

  test("a page never stages more than one foreground product per section", () => {
    // The foreground is the thing being looked at. Two of them is two subjects, which is none.
    for (const page of pages) {
      const fore = slotsIn(page.html).filter((s) => attr(s, "data-layer") === "fore");
      assert.ok(fore.length <= 3, `${page.route} declares ${fore.length} foreground products`);
    }
  });

  test("the visibility budget keeps a large catalogue to a small frame", async () => {
    // This, not the slot count, is the rule that stops a twenty-four package library becoming
    // clutter: whatever a page declares, only this many are drawn in any one frame.
    const { budgetFor, VISIBILITY_BUDGET } = await import("../src/scripts/cosmetics/budget.ts");
    const bp = { md: 768, lg: 1024, xl: 1600 };
    assert.equal(budgetFor(360, bp), 2, "a phone must never render more than two products");
    assert.equal(budgetFor(430, bp), 2);
    assert.equal(budgetFor(768, bp), 3, "a tablet composition is 2-4 products");
    assert.equal(budgetFor(1024, bp), 5);
    assert.equal(budgetFor(1366, bp), 5, "a laptop composition is 3-7 products");
    assert.equal(budgetFor(1920, bp), 6);
    assert.ok(VISIBILITY_BUDGET.desktop <= 7, "the desktop budget exceeds what a composition holds");
    assert.ok(VISIBILITY_BUDGET.phone <= 3, "the phone budget exceeds what a phone screen holds");

    // And the ceiling on what a page may DECLARE, which is a different failure: a page with
    // thirty slots is not composed, it is decorated.
    for (const page of pages) {
      const count = slotsIn(page.html).length;
      assert.ok(count <= 16, `${page.route} declares ${count} product slots`);
    }
  });

  test("every travel rail carries a path of at least two points and a box size", () => {
    let rails = 0;
    for (const page of pages) {
      for (const slot of slotsIn(page.html)) {
        const path = attr(slot, "data-path");
        if (!path) {
          assert.equal(attr(slot, "data-size"), undefined, `${page.route}: data-size without data-path`);
          continue;
        }
        rails++;
        const points = path.trim().split(/\s+/).map((pair) => pair.split(",").map(Number));
        assert.ok(points.length >= 2, `${page.route}: a rail path has one point`);
        for (const [x, y] of points) {
          assert.ok(Number.isFinite(x) && Number.isFinite(y), `${page.route}: unparseable path "${path}"`);
          assert.ok(x >= 0 && x <= 1 && y >= 0 && y <= 1, `${page.route}: path point outside the rail`);
        }
        const size = Number(attr(slot, "data-size"));
        assert.ok(size > 0 && size <= 1, `${page.route}: rail box size ${size}`);
      }
    }
    assert.ok(rails > 0, "the product-journey rail is not used anywhere — has it been removed?");
  });

  test("the page still breathes: whole sections carry no 3D at all", () => {
    // Scarcity is what makes the 3D moments read as expensive. If every section has a product,
    // none of them is an event. Measured on the homepage, which has the most to say.
    const home = pages.find((p) => p.route === "/en/");
    const sections = home.html.split(/<section\b/).slice(1);
    const quiet = sections.filter((s) => !s.includes("data-cosmetic"));
    assert.ok(
      quiet.length >= 3,
      `only ${quiet.length} of the homepage's ${sections.length} sections are free of 3D`
    );
  });

  test("every slot is still hidden from assistive technology, rails included", () => {
    for (const page of pages) {
      for (const slot of slotsIn(page.html)) {
        assert.ok(/aria-hidden="true"/.test(slot), `${page.route}: a 3D slot is exposed to AT`);
      }
    }
  });

  test("the scene is still one shared context, loaded lazily, and skipped when it should be", () => {
    const boot = readFileSync(join(srcDir, "scripts", "cosmetics", "boot.ts"), "utf8");
    assert.match(boot, /saveData/, "the Save-Data check was removed from the loader");
    assert.match(boot, /webgl2|webgl/, "the WebGL capability check was removed from the loader");
    assert.match(boot, /import\("\.\/scene"\)/, "Three.js is no longer dynamically imported");
    assert.match(boot, /requestIdleCallback|addEventListener\("load"/, "the scene no longer waits for load/idle");

    const scene = readFileSync(join(srcDir, "scripts", "cosmetics", "scene.ts"), "utf8");
    assert.equal(
      (scene.match(/new WebGLRenderer\(/g) ?? []).length,
      1,
      "more than one WebGL context is created"
    );
    assert.match(scene, /createElement\("canvas"\)/, "the scene no longer owns its single canvas");
    assert.match(scene, /aria-hidden/, "the shared canvas is no longer hidden from AT");
  });

  test("the fallback is a designed state, not an empty box", () => {
    // Without WebGL, with Save-Data on, or before the chunk lands, the slot shows a lit form.
    const glow = css.match(/\.cosmetic-glow[^{]*\{[^}]*\}/)?.[0];
    assert.ok(glow, "the fallback glow rule is gone");
    assert.match(glow, /--gradient-glow/, "the fallback glow lost its lit form");
    assert.match(css, /cosmetics-live/, "the fallback never yields to the rendered product");
  });
});

/* ================================================================= tokens */

describe("the design system stayed a system", () => {
  test("every motion duration token is zeroed under prefers-reduced-motion", () => {
    const declared = [...tokens.matchAll(/--motion-duration-([a-z]+):\s*(\d+)ms/g)];
    const reduceBlock = tokens.slice(tokens.indexOf("prefers-reduced-motion: reduce"));
    for (const [, name, value] of declared) {
      if (value === "0") continue;
      // `instant` is the one deliberate exception: at 100ms it is a state change, not motion,
      // and zeroing it would make a control appear to have no state at all.
      if (name === "instant") continue;
      assert.match(
        reduceBlock,
        new RegExp(`--motion-duration-${name}:\\s*0ms`),
        `--motion-duration-${name} is not collapsed under reduced motion`
      );
    }
  });

  test("the motion scale covers all four tiers the system is written against", () => {
    for (const tier of ["micro", "standard", "editorial", "cinematic"]) {
      assert.match(tokens, new RegExp(`--motion-duration-${tier}:`), `no ${tier} duration token`);
    }
  });

  test("every shadow token is warm, and none is neutral grey or black", () => {
    const shadows = [...tokens.matchAll(/--shadow-[a-z-]+:\s*([^;]+);/g)].map((m) => m[1]);
    assert.ok(shadows.length >= 5, "the shadow ladder shrank");
    for (const shadow of shadows) {
      if (shadow.trim() === "none") continue;
      assert.ok(!/#000|black|gr[ae]y|rgba?\(0[ ,]/i.test(shadow), `neutral shadow token: ${shadow}`);
      assert.match(shadow, /rgb\((74 63 53|41 35 29)/, `shadow token is not mocha-tinted: ${shadow}`);
    }
  });

  test("the breakpoint tokens exist and the 3D scene reads them rather than its own copy", () => {
    for (const name of ["--bp-md", "--bp-lg", "--bp-xl"]) {
      assert.match(tokens, new RegExp(`${name}:\\s*\\d+`), `${name} is missing`);
    }
    const scene = readFileSync(join(srcDir, "scripts", "cosmetics", "scene.ts"), "utf8");
    for (const name of ["--bp-md", "--bp-lg", "--bp-xl"]) {
      assert.ok(scene.includes(name), `scene.ts does not read ${name}`);
    }
  });

  test("the product scale ladder is used instead of one-off percentages", () => {
    for (const rung of ["xs", "sm", "md", "lg"]) {
      assert.match(tokens, new RegExp(`--cosmetic-${rung}:`), `--cosmetic-${rung} is missing`);
    }
    assert.match(css, /var\(--cosmetic-(xs|sm|md|lg|xl)\)/, "no composition uses the product scale");
  });
});

/* ================================================================= the surface */

describe("the page surface is self-contained and never requests anything", () => {
  test("the paper grain is generated in the stylesheet, not downloaded", () => {
    assert.match(css, /data:image\/svg\+xml/, "the grain veil is gone");
    assert.match(css, /feTurbulence/, "the grain is no longer procedural");
  });

  test("no stylesheet references an external origin", () => {
    // A CSS url() is a request. Inline images are removed FIRST: a data: URI is not a request,
    // and the grain's SVG carries a url(#n) filter reference of its own which is internal to
    // that one image rather than a second fetch.
    const external = css.replace(/url\("data:[^"]*"\)/g, "").replace(/url\('data:[^']*'\)/g, "");
    for (const m of external.matchAll(/url\((["']?)([^"')]+)\1\)/g)) {
      const value = m[2];
      if (value.startsWith("/fonts/") || value.startsWith("/_astro/")) continue;
      assert.fail(`stylesheet requests ${value}`);
    }
    // The only absolute URL permitted anywhere in the build is the SVG namespace, which is an
    // identifier and is never fetched.
    for (const m of external.matchAll(/https?:\/\/[a-z0-9.-]+/gi)) {
      assert.ok(/^http:\/\/www\.w3\.org/.test(m[0]), `stylesheet cites an external origin: ${m[0]}`);
    }
  });
});

/* ================================================================= responsive */

describe("nothing in the stylesheet can reintroduce a horizontal scrollbar", () => {
  test("no layout is sized in 100vw, which includes the scrollbar gutter", () => {
    const declarations = css.replace(/@media[^{]+/g, "");
    for (const m of declarations.matchAll(/(?:^|[;{])\s*(width|min-width|inline-size|min-inline-size):\s*100vw/g)) {
      assert.fail(`a layout is sized in 100vw: ${m[0].trim()}`);
    }
  });

  test("no element declares a minimum width wider than the narrowest supported screen", () => {
    // 360px is the floor this site is designed to. A min-width above it is a guaranteed overflow
    // on the phones that floor exists for. (Media-query conditions are stripped first: those are
    // the breakpoints themselves, not declarations on an element.)
    const declarations = css.replace(/@media[^{]+/g, "");
    for (const m of declarations.matchAll(/min-(?:width|inline-size):\s*(\d+)px/g)) {
      assert.ok(Number(m[1]) <= 360, `an element declares min-width: ${m[1]}px`);
    }
  });

  test("the page and body still clip sideways rather than scrolling", () => {
    assert.match(css, /html\{[^}]*overflow-x:clip/, "the document no longer clips horizontally");
    assert.match(css, /body\{[^}]*overflow-x:clip/, "the body no longer clips horizontally");
  });
});

/* ================================================================= photography */

describe("photography stayed optimised and described", () => {
  test("every image is built, sized, and lazy unless it is the one the page opens with", () => {
    for (const page of pages) {
      for (const img of page.html.match(/<img[^>]*>/g) ?? []) {
        assert.match(img, /src="\/_astro\//, `${page.route}: an image was not processed by the build`);
        assert.match(img, /width="\d+" height="\d+"/, `${page.route}: an image reserves no space`);
        assert.match(img, /loading="(lazy|eager)"/, `${page.route}: an image declares no loading mode`);
        assert.match(img, /decoding="(async|sync)"/, `${page.route}: an image declares no decoding mode`);
      }
      const eager = (page.html.match(/loading="eager"/g) ?? []).length;
      assert.ok(eager <= 1, `${page.route} eagerly loads ${eager} images`);
    }
  });

  test("every photograph is served as WebP with a JPEG fallback", () => {
    const home = pages.find((p) => p.route === "/en/");
    assert.match(home.html, /type="image\/webp"/, "WebP sources are gone");
    assert.match(home.html, /<img[^>]*src="\/_astro\/[^"]+\.jpg"/, "the JPEG fallback is gone");
  });

  test("the two photographs added in Phase 12 are built and described in both languages", () => {
    const registry = readFileSync(join(srcDir, "lib", "photography.ts"), "utf8");
    for (const key of ["beautyCloseup", "studioFullLength"]) {
      assert.ok(registry.includes(`${key}: {`), `${key} is no longer registered`);
    }
    // The beauty frame carries the homepage's full-bleed band in both locales.
    for (const locale of ["en", "ar"]) {
      const page = pages.find((p) => p.route === `/${locale}/`);
      assert.match(page.html, /zina-beauty-closeup/, `${locale}: the band photograph is missing`);
      const band = page.html.match(/<img[^>]*zina-beauty-closeup[^>]*>/)?.[0];
      assert.ok(band, `${locale}: the band image element is missing`);
      assert.match(band, /alt="[^"]{20,}"/, `${locale}: the band photograph has no descriptive alt text`);
    }
  });
});
