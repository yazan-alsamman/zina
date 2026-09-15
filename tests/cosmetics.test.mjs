/**
 * THE COSMETIC CATALOGUE — Phase 12.
 *
 * The 3D library grew from nine packages to twenty-four, and a procedural model is the kind of
 * code that breaks silently: a mistyped profile point produces NaN vertices, an empty group or a
 * package a hundred times the size of its neighbours, and nothing throws. Nobody notices until a
 * page renders a smear. So every package is BUILT here, in Node, and measured.
 *
 * The models need a 2D canvas for their printed labels and the pressed-powder bump map. Node has
 * none, so a minimal recording stub stands in — the test is about geometry, and a label texture
 * only has to exist for the mesh that carries it to be valid.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

/* The application source imports `./materials`, the way a bundler resolves it. Node needs a hook
   to do the same; see tests/helpers/ts-resolve.mjs. */
register("./helpers/ts-resolve.mjs", import.meta.url);

/** The smallest 2D context the models actually call into. */
function stubCanvas() {
  const noop = () => {};
  const ctx = {
    canvas: null,
    fillStyle: "",
    font: "",
    textAlign: "",
    textBaseline: "",
    createRadialGradient: () => ({ addColorStop: noop }),
    fillRect: noop,
    clearRect: noop,
    fillText: noop,
    translate: noop,
    rotate: noop,
    save: noop,
    restore: noop,
    beginPath: noop,
    ellipse: noop,
    fill: noop,
    measureText: () => ({ width: 10 }),
  };
  return { width: 0, height: 0, getContext: () => ctx, style: {} };
}

let models;
let three;

before(async () => {
  globalThis.document = { createElement: (tag) => (tag === "canvas" ? stubCanvas() : { style: {} }) };
  models = await import("../src/scripts/cosmetics/models.ts");
  three = await import("three");
});

describe("every package in the catalogue is a real, finite, well-proportioned object", () => {
  test("the catalogue is substantially larger than Phase 11's nine packages", () => {
    // Phase 12 brief: roughly 18-25 original forms. The floor is asserted, not the exact number,
    // so a package may be retired without breaking the suite — but not silently down to nine.
    assert.ok(
      models.COSMETIC_KINDS.length >= 18,
      `the catalogue has only ${models.COSMETIC_KINDS.length} packages`
    );
    assert.ok(models.COSMETIC_KINDS.length <= 30, "the catalogue has grown past what is composed");
    assert.equal(new Set(models.COSMETIC_KINDS).size, models.COSMETIC_KINDS.length, "duplicate kind");
  });

  test("each package builds geometry with no NaN vertex and a sane triangle count", () => {
    for (const kind of models.COSMETIC_KINDS) {
      const group = models.buildCosmetic(kind, "blush");
      let vertices = 0;
      let meshes = 0;
      group.traverse((node) => {
        if (!node.isMesh) return;
        meshes++;
        const position = node.geometry.attributes.position;
        assert.ok(position, `${kind}: a mesh has no position attribute`);
        for (let i = 0; i < position.count; i++) {
          assert.ok(
            Number.isFinite(position.getX(i)) && Number.isFinite(position.getY(i)) && Number.isFinite(position.getZ(i)),
            `${kind}: NaN vertex at ${i}`
          );
        }
        vertices += position.count;
      });
      assert.ok(meshes >= 1, `${kind}: built nothing`);
      // A package that needs more than a quarter of a million vertices is a modelling mistake:
      // the whole library shares one lazily loaded chunk and one WebGL context.
      assert.ok(vertices < 260_000, `${kind}: ${vertices} vertices is far past the rest of the set`);
    }
  });

  test("every package is normalised to the same unit bounding sphere", () => {
    // The scene frames every slot identically and relies on this. A package that escapes it is
    // drawn either microscopic or sliced off by its own scissor rectangle.
    for (const kind of models.COSMETIC_KINDS) {
      const group = models.buildCosmetic(kind, "rose");
      const sphere = new three.Box3().setFromObject(group).getBoundingSphere(new three.Sphere());
      assert.ok(
        Math.abs(sphere.radius - 1) < 0.02,
        `${kind}: bounding radius ${sphere.radius.toFixed(3)}, expected 1`
      );
    }
  });

  test("packages are genuinely different silhouettes, not one shape in five colours", () => {
    /*
     * A SILHOUETTE PROFILE. Bounding-box proportions are not enough: every axially symmetric
     * bottle has the same width and depth, so that measure collapses to one number and two
     * unrelated packages collide by coincidence. What actually distinguishes a dropper from a
     * vial from a cleanser is WHERE THE MASS SITS — a dropper is narrow at the top and wide at
     * the base, a vial is a uniform column, a cleanser tapers at the shoulder.
     *
     * So each package is reduced to its widest radius in each of eight horizontal bands, scaled
     * against its own widest point. Two packages are the same object if that eight-number
     * outline matches within a tenth everywhere. This is the assertion the brief's "do NOT simply
     * duplicate the same geometry with different colors" translates into.
     */
    const profileOf = (kind) => {
      const group = models.buildCosmetic(kind, "blush");
      const box = new three.Box3().setFromObject(group);
      const bands = new Array(8).fill(0);
      const height = box.max.y - box.min.y;
      const aspect = (box.max.x - box.min.x) / height;
      group.updateMatrixWorld(true);
      const point = new three.Vector3();
      group.traverse((node) => {
        if (!node.isMesh) return;
        const position = node.geometry.attributes.position;
        for (let i = 0; i < position.count; i++) {
          point.fromBufferAttribute(position, i).applyMatrix4(node.matrixWorld);
          const band = Math.min(7, Math.max(0, Math.floor(((point.y - box.min.y) / height) * 8)));
          bands[band] = Math.max(bands[band], Math.hypot(point.x, point.z));
        }
      });
      const widest = Math.max(...bands) || 1;
      return { bands: bands.map((r) => r / widest), aspect };
    };

    const profiles = models.COSMETIC_KINDS.map((kind) => [kind, profileOf(kind)]);
    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        const [a, pa] = profiles[i];
        const [b, pb] = profiles[j];
        // Two packages are the same object only if BOTH their outline and their overall
        // proportion match: an open jar and a tall bottle can trace a similar radius curve while
        // being obviously different things, and the aspect ratio is what says so.
        const outline = Math.max(...pa.bands.map((value, band) => Math.abs(value - pb.bands[band])));
        const proportion = Math.abs(pa.aspect - pb.aspect);
        assert.ok(
          outline > 0.1 || proportion > 0.08,
          `${a} and ${b} are the same package: outline differs by ${outline.toFixed(3)}, proportion by ${proportion.toFixed(3)}`
        );
      }
    }
  });

  test("every framing factor pushes the camera BACK, never inside the safe distance", () => {
    // scene.ts clamps this, but the clamp exists to catch a mistake — this names the rule.
    // Below 1 the camera crosses the distance at which a normalised model exactly fills its
    // slot, and tall packages are sliced off by their own scissor rectangle.
    for (const [kind, factor] of Object.entries(models.COSMETIC_FRAMING)) {
      assert.ok(factor >= 1, `${kind} framing ${factor} would clip the package`);
      assert.ok(factor <= 1.4, `${kind} framing ${factor} shrinks the package out of the composition`);
    }
  });

  test("every tint builds, and tints share geometry rather than duplicating it", () => {
    for (const tint of ["blush", "rose", "nude", "champagne", "wine"]) {
      const group = models.buildCosmetic("serum", tint);
      assert.ok(group.children.length > 0, `serum/${tint} built nothing`);
    }
    // The same (kind, tint) is cloned from one prototype: the clone shares geometry instances.
    const a = models.buildCosmetic("jar", "blush");
    const b = models.buildCosmetic("jar", "blush");
    const geometryOf = (g) => {
      const list = [];
      g.traverse((n) => n.isMesh && list.push(n.geometry));
      return list;
    };
    const [ga, gb] = [geometryOf(a), geometryOf(b)];
    assert.equal(ga.length, gb.length);
    assert.ok(ga.length > 0);
    for (let i = 0; i < ga.length; i++) {
      assert.equal(ga[i], gb[i], "a repeated package rebuilt its geometry instead of sharing it");
    }
  });

  test("no package label carries a brand, a logo or a fictional product line", () => {
    // The packaging is original and its lettering is GENERIC CATEGORY VOCABULARY. A real brand
    // name would reproduce trade dress; an invented one would read as a product line of Zina's.
    const source = readModelSource();
    const printed = [...source.matchAll(/text:\s*"([^"]+)"/g)].map((m) => m[1]);
    assert.ok(printed.length > 0, "no printed labels found — has labelling moved?");
    const allowed =
      /^(SÉRUM|CRÈME|EAU DE PARFUM|FOND DE TEINT|MASCARA|BAUME|BRUME|LAIT|TONIQUE|HUILE|NETTOYANT|ESSENCE|POUDRE|VERNIS|\d+(\.\d+)?\s?ml([^"]*)?)$/i;
    for (const text of printed) {
      assert.ok(allowed.test(text), `non-generic packaging text: "${text}"`);
    }
  });
});

import { readFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

function readModelSource() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  return readFileSync(join(root, "src", "scripts", "cosmetics", "models.ts"), "utf8");
}
