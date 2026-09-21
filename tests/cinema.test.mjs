/**
 * THE FILM'S ARITHMETIC — Phase 16.
 *
 * The film is the one part of this site whose defects are mostly invisible to a test and obvious
 * in a screenshot. That is exactly why the parts of it that AREN'T need covering here: a camera
 * eased at the wrong rate, a transition curve that overshoots, a velocity signal that can be
 * driven past its clamp, a shooting script whose beats are out of order — all of those look
 * perfectly fine in a still frame and are wrong in the hand, which is the one place a screenshot
 * cannot reach.
 *
 * `motion.ts` was deliberately written with no Three.js import so that it could be run here.
 */
import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register("./helpers/ts-resolve.mjs", import.meta.url);

/** The smallest 2D context the cosmetic models call into; see tests/cosmetics.test.mjs. */
function stubCanvas() {
  const noop = () => {};
  const ctx = {
    canvas: null,
    fillStyle: "",
    font: "",
    textAlign: "",
    textBaseline: "",
    createRadialGradient: () => ({ addColorStop: noop }),
    createLinearGradient: () => ({ addColorStop: noop }),
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

let motion;
let timeline;
let models;

before(async () => {
  globalThis.document = { createElement: (tag) => (tag === "canvas" ? stubCanvas() : { style: {} }) };
  motion = await import("../src/scripts/cinema/motion.ts");
  timeline = await import("../src/scripts/cinema/timeline.ts");
  models = await import("../src/scripts/cosmetics/models.ts");
});

/* ================================================================= the transport */

describe("the camera is eased in seconds, not in frames", () => {
  test("a half-life is a half-life: half the gap is gone after exactly that long", () => {
    const after = motion.damp(0, 1, 0.13, 0.13);
    assert.ok(Math.abs(after - 0.5) < 1e-9, `expected 0.5 after one half-life, got ${after}`);
  });

  test("THE BUG THIS REPLACED: the same wall-clock time gives the same result at any frame rate", () => {
    /*
     * This is the whole reason motion.ts exists. The old filter was `current += gap * 0.085` once
     * per animation frame, so a 120 Hz machine ran it twice as often over the same second and the
     * film settled in half the time — a different edit on better hardware.
     *
     * Integrating one second at 30, 60 and 144 Hz must land in the same place.
     */
    const run = (hz) => {
      const dt = 1 / hz;
      let value = 0;
      for (let i = 0; i < hz; i++) value = motion.damp(value, 1, motion.FILM_HALF_LIFE, dt);
      return value;
    };
    const slow = run(30);
    const normal = run(60);
    const fast = run(144);
    assert.ok(Math.abs(slow - normal) < 1e-6, `30 Hz ${slow} vs 60 Hz ${normal}`);
    assert.ok(Math.abs(normal - fast) < 1e-6, `60 Hz ${normal} vs 144 Hz ${fast}`);

    /* And for contrast, the filter it replaced genuinely does diverge — so this is a real fix and
       not a refactor dressed as one.

       Measured over a TENTH of a second, which is where a scrub actually lives. Over a full second
       both frame rates have converged to within a rounding error of the target, which is why the
       defect survived review for as long as it did: it is invisible in any test that lets the
       filter settle, and plainly visible in the hand. */
    const old = (hz) => {
      let value = 0;
      for (let i = 0; i < Math.round(hz / 10); i++) value += (1 - value) * 0.085;
      return value;
    };
    assert.ok(
      Math.abs(old(30) - old(144)) > 0.2,
      `the old filter is being mischaracterised: 30 Hz reached ${old(30)}, 144 Hz reached ${old(144)}`
    );
  });

  test("the new half-life reproduces the timing the film was directed at", () => {
    /* 0.915 survival per frame at 60 Hz. If someone re-tunes FILM_HALF_LIFE this fails, which is
       the point: re-timing the film should be a deliberate act, not a side effect. */
    let old = 0;
    for (let i = 0; i < 60; i++) old += (1 - old) * 0.085;
    let now = 0;
    for (let i = 0; i < 60; i++) now = motion.damp(now, 1, motion.FILM_HALF_LIFE, 1 / 60);
    assert.ok(Math.abs(old - now) < 0.01, `old settled to ${old}, new to ${now}`);
  });

  test("a half-life of zero snaps, which is what the reduced cut needs", () => {
    assert.equal(motion.damp(0, 1, 0, 1 / 60), 1);
  });

  test("velocity cannot be driven outside its clamp by any scroll, however violent", () => {
    const transport = motion.makeTransport();
    /* The worst case a browser can actually deliver: the whole film in one event — a Home/End
       keypress, an anchor jump, or a restored scroll position. */
    for (let i = 0; i < 200; i++) {
      transport.seek(i % 2 === 0 ? 1 : 0);
      transport.advance(1 / 60);
      assert.ok(transport.velocity >= -1 && transport.velocity <= 1, `velocity escaped: ${transport.velocity}`);
      assert.ok(transport.speed >= 0 && transport.speed <= 1, `speed escaped: ${transport.speed}`);
      assert.ok(transport.position >= 0 && transport.position <= 1, `position escaped: ${transport.position}`);
    }
  });

  test("an enormous frame step cannot turn the take into a jump cut", () => {
    const transport = motion.makeTransport();
    transport.seek(1);
    // A tab that was backgrounded for ten seconds hands the loop a delta of ten seconds.
    transport.advance(10);
    assert.ok(
      transport.position < 1,
      "a ten-second step arrived instantly; MAX_STEP is not clamping and the film will snap"
    );
  });

  test("the position is a monotonic approach, never an overshoot", () => {
    const transport = motion.makeTransport();
    transport.seek(1);
    let previous = -1;
    for (let i = 0; i < 400; i++) {
      transport.advance(1 / 60);
      assert.ok(transport.position >= previous, "the camera went backwards approaching a forward target");
      assert.ok(transport.position <= 1.0000001, `overshoot to ${transport.position}`);
      previous = transport.position;
    }
    assert.ok(transport.position > 0.999, "the camera never arrived");
  });

  test("the chase can be re-tuned live, which is what a preference toggle needs", () => {
    const transport = motion.makeTransport();
    transport.setHalfLife(0);
    transport.seek(1);
    transport.advance(1 / 60);
    assert.equal(transport.position, 1, "setHalfLife(0) did not make the transport snap");
    assert.equal(transport.velocity, 0, "a snapped transport still reported velocity");
  });

  test("snapping leaves nothing in flight", () => {
    const transport = motion.makeTransport();
    transport.seek(1);
    transport.advance(1 / 60);
    transport.snap();
    assert.equal(transport.position, transport.target);
    assert.equal(transport.velocity, 0);
  });

  test("a resting film reports exactly zero speed, so the loop can be trusted to stop", () => {
    const transport = motion.makeTransport();
    transport.seek(0.5);
    for (let i = 0; i < 600; i++) transport.advance(1 / 60);
    assert.equal(transport.speed, 0, "an idle transport never parks its velocity at zero");
  });
});

/* ================================================================= the curves */

describe("every transition curve is a usable shape for a camera move", () => {
  test("each one starts at rest and arrives, without leaving the unit range", () => {
    for (const [name, ease] of Object.entries(motion.EASINGS)) {
      assert.ok(Math.abs(ease(0)) < 1e-6, `${name} does not start at 0`);
      assert.ok(Math.abs(ease(1) - 1) < 1e-6, `${name} does not arrive at 1`);
      for (let i = 0; i <= 100; i++) {
        const v = ease(i / 100);
        assert.ok(
          v >= -1e-6 && v <= 1 + 1e-6,
          `${name} leaves the unit range at t=${i / 100}: ${v}`
        );
      }
    }
  });

  test("none of them ever goes backwards", () => {
    /* A non-monotonic curve means the camera reverses in the middle of a move while the reader is
       still scrolling forwards, which reads as a mistake rather than as a flourish. */
    for (const [name, ease] of Object.entries(motion.EASINGS)) {
      let previous = -1;
      for (let i = 0; i <= 200; i++) {
        const v = ease(i / 200);
        assert.ok(v >= previous - 1e-9, `${name} reverses at t=${i / 200}`);
        previous = v;
      }
    }
  });

  test("clamped outside the unit interval rather than extrapolating", () => {
    for (const [name, ease] of Object.entries(motion.EASINGS)) {
      if (name === "smooth") continue; // the bare smoothstep is documented as taking a clamped input
      assert.ok(ease(-1) <= 1e-6, `${name} extrapolates below 0`);
      assert.ok(ease(2) >= 1 - 1e-6, `${name} extrapolates above 1`);
    }
  });

  test("ANTICIPATE actually withholds the move, which is the only reason it exists", () => {
    /* The product reveal's curve. If this stops holding, the object stops earning its entrance and
       the beat becomes an ordinary push with a light on it. */
    assert.ok(motion.anticipate(0.2) < 0.05, `anticipate moved ${motion.anticipate(0.2)} in its first fifth`);
    assert.ok(motion.anticipate(0.33) < 0.07, "anticipate has stopped holding through its first third");
    assert.ok(motion.anticipate(0.75) > 0.6, "anticipate holds so long it never commits");
  });

  test("SETTLE arrives early and holds, which is what makes a hero shot read as held", () => {
    assert.ok(motion.settle(0.5) > 0.9, `settle had only reached ${motion.settle(0.5)} at the halfway point`);
  });

  test("the curves are genuinely different from one another", () => {
    // Otherwise the per-transition easing is decoration and the old single smoothstep was fine.
    const sample = (ease) => [0.25, 0.5, 0.75].map(ease);
    const seen = new Map();
    for (const [name, ease] of Object.entries(motion.EASINGS)) {
      const key = sample(ease).map((v) => v.toFixed(3)).join(",");
      assert.ok(!seen.has(key), `${name} is indistinguishable from ${seen.get(key)}`);
      seen.set(key, name);
    }
  });
});

/* ================================================================= the governor */

describe("the performance governor degrades and never hunts", () => {
  test("a comfortable machine is never stepped down", () => {
    const governor = motion.makeGovernor();
    for (let i = 0; i < 2000; i++) governor.sample(1 / 120);
    assert.equal(governor.scale, 1, "a machine hitting 120 Hz had its resolution reduced");
  });

  test("a struggling machine is stepped down, and only downwards", () => {
    const governor = motion.makeGovernor();
    for (let i = 0; i < 2000; i++) governor.sample(1 / 20);
    assert.ok(governor.scale < 1, "a machine at 20 fps was never stepped down");
    assert.ok(governor.scale >= motion.MIN_SCALE, `stepped below the floor: ${governor.scale}`);

    /* Now give it an easy time. It must NOT climb back: a governor that also raises the resolution
       hunts, and every change reallocates every render target. */
    const low = governor.scale;
    for (let i = 0; i < 2000; i++) governor.sample(1 / 144);
    assert.equal(governor.scale, low, "the governor raised the resolution again and will hunt");
  });

  test("a backgrounded tab is not mistaken for a slow GPU", () => {
    const governor = motion.makeGovernor();
    // Multi-second frames: the main thread was blocked, which says nothing about rendering cost.
    for (let i = 0; i < 2000; i++) governor.sample(4);
    assert.equal(governor.scale, 1, "a blocked main thread stepped the resolution down");
  });

  test("it reports a change exactly on the frame the caller must resize", () => {
    const governor = motion.makeGovernor();
    let changes = 0;
    let last = governor.scale;
    for (let i = 0; i < 4000; i++) {
      const changed = governor.sample(1 / 15);
      if (changed) changes++;
      assert.equal(changed, governor.scale !== last, "sample() lied about whether the scale moved");
      last = governor.scale;
    }
    assert.ok(changes >= 1 && changes <= 4, `${changes} resizes is either none or churn`);
  });
});

/* ================================================================= the shooting script */

describe("the shooting script is a film, not a list of positions", () => {
  test("the beats run from the first frame to the last, in order", () => {
    const scenes = timeline.SCENES;
    assert.equal(scenes[0].at, 0, "the film does not start at the start");
    assert.equal(scenes[scenes.length - 1].at, 1, "the film does not end at the end");
    for (let i = 1; i < scenes.length; i++) {
      assert.ok(scenes[i].at > scenes[i - 1].at, `beat ${i} (${scenes[i].key}) is out of order`);
    }
  });

  test("seven beats, matching the seven lines of real content the page has to say", () => {
    /* Tied to the content, not to the composition: her tagline plus the six stages of the method.
       An eighth beat would need an eighth line, and there isn't one that is true. */
    assert.equal(timeline.SCENES.length, 7, "the beat count no longer matches the page's beats");
  });

  test("every beat names a curve that exists", () => {
    // A misspelt ease name would be `undefined` at runtime and throw inside the render loop.
    for (const scene of timeline.SCENES) {
      assert.ok(
        typeof motion.EASINGS[scene.ease] === "function",
        `${scene.key} asks for an ease called "${scene.ease}", which is not a curve`
      );
    }
  });

  test("the transitions are not all the same move", () => {
    const used = new Set(timeline.SCENES.slice(1).map((s) => s.ease));
    assert.ok(used.size >= 4, `only ${used.size} distinct curves across six transitions`);
  });

  test("the product reveal is the beat that gets the anticipation", () => {
    const product = timeline.SCENES.find((s) => s.key === "product");
    assert.ok(product, "the product hero beat is gone");
    assert.equal(product.ease, "anticipate", "the product reveal no longer withholds its move");
  });

  test("the lens is a real lens: focus is positive and in front of the camera", () => {
    for (const scene of timeline.SCENES) {
      assert.ok(scene.lens.focus > 0, `${scene.key}: focus ${scene.lens.focus} is behind the lens`);
      assert.ok(scene.lens.aperture >= 0, `${scene.key}: negative aperture`);
      /* Everything in the film sits between roughly 2 and 17 units from the lens. A focus distance
         outside that is focused on nothing, which is a permanently soft frame. */
      assert.ok(scene.lens.focus < 20, `${scene.key}: focused past the whole world`);
    }
  });

  test("the opening is a pinhole and the beauty moment is wide open", () => {
    const byKey = Object.fromEntries(timeline.SCENES.map((s) => [s.key, s]));
    assert.equal(byKey.awakening.lens.aperture, 0, "the opening silhouette is being defocused");
    const widest = Math.max(...timeline.SCENES.map((s) => s.lens.aperture));
    assert.equal(byKey.beauty.lens.aperture, widest, "the closest shot is not the shallowest");
  });

  test("the light sweeps continuously in one direction across the whole film", () => {
    /* One lighting move, like the camera. A sweep that reverses would read as a light being
       fiddled with mid-take. */
    const sweeps = timeline.SCENES.map((s) => s.light.sweep);
    for (let i = 1; i < sweeps.length; i++) {
      assert.ok(sweeps[i] > sweeps[i - 1], `the sweep reverses at beat ${i}`);
    }
    assert.ok(sweeps[sweeps.length - 1] - sweeps[0] > 1.5, "the sweep barely travels at all");
  });

  test("the world gets brighter, never darker, once it has started to", () => {
    const exposures = timeline.SCENES.map((s) => s.grade.exposure);
    for (let i = 1; i < exposures.length; i++) {
      assert.ok(exposures[i] > exposures[i - 1], `exposure falls at beat ${i}`);
    }
  });

  test("the vignette opens out as the world does", () => {
    const vignettes = timeline.SCENES.map((s) => s.grade.vignette);
    for (let i = 1; i < vignettes.length; i++) {
      assert.ok(vignettes[i] < vignettes[i - 1], `the vignette closes again at beat ${i}`);
    }
  });

  test("the product completes exactly one turn, ending where it began", () => {
    const spins = timeline.SCENES.map((s) => s.product.spin);
    for (let i = 1; i < spins.length; i++) {
      assert.ok(spins[i] >= spins[i - 1], `the product reverses at beat ${i}`);
    }
    assert.ok(
      Math.abs(spins[spins.length - 1] - Math.PI * 2) < 1e-9,
      "the last frame no longer shows the same face as the first"
    );
  });

  test("the product is fully revealed by the beat that is about the product", () => {
    const byKey = Object.fromEntries(timeline.SCENES.map((s) => [s.key, s]));
    assert.ok(byKey.awakening.product.reveal < 0.1, "the object is already lit in the dark");
    assert.equal(byKey.product.product.reveal, 1, "the hero packshot shows a half-lit object");
  });

  test("the powder only exists where a beauty set would have any", () => {
    const byKey = Object.fromEntries(timeline.SCENES.map((s) => [s.key, s]));
    assert.equal(byKey.awakening.motes, 0, "there is powder in the air before the film has started");
    const most = Math.max(...timeline.SCENES.map((s) => s.motes));
    assert.equal(byKey.beauty.motes, most, "the beauty moment is not where the powder peaks");
  });

  test("the camera roll stays below the threshold at which it would be a tilt", () => {
    for (const scene of timeline.SCENES) {
      assert.ok(
        Math.abs(scene.shot.roll) < 0.03,
        `${scene.key}: a roll of ${scene.shot.roll} rad is a visible dutch angle, not a breath`
      );
    }
  });
});

describe("span and captionOpacity behave across the entire scroll", () => {
  test("the blend never leaves 0-1 and never names a beat that is not there", () => {
    for (let i = 0; i <= 1000; i++) {
      const p = i / 1000;
      const { from, to, t, light, index } = timeline.span(timeline.SCENES, p);
      assert.ok(t >= 0 && t <= 1, `t escaped at p=${p}: ${t}`);
      assert.ok(light >= 0 && light <= 1, `light time escaped at p=${p}: ${light}`);
      assert.ok(from && to, `span returned no pair at p=${p}`);
      assert.ok(index >= 0 && index < timeline.SCENES.length - 1, `index ${index} at p=${p}`);
    }
  });

  test("LIGHT RUNS ON ITS OWN CLOCK, and the product beat is where that matters", () => {
    /*
     * The defect this guards is one the implementation originally had. The product hero uses
     * `anticipate`, which holds the camera almost still for the first third of the transition. If
     * lighting shared that curve, the hold would be a third of a beat in which NOTHING changes —
     * which does not read as anticipation, it reads as a stuck page.
     *
     * Light time must have moved appreciably while camera time is still holding.
     */
    const index = timeline.SCENES.findIndex((s) => s.key === "product");
    const from = timeline.SCENES[index - 1];
    const to = timeline.SCENES[index];
    const p = from.at + (to.at - from.at) * 0.25;
    const { t, light } = timeline.span(timeline.SCENES, p);
    assert.ok(t < 0.06, `the camera is not holding through the anticipation: t=${t}`);
    assert.ok(light > 0.1, `the light is holding too, so the beat is a dead third: light=${light}`);
    assert.ok(light > t * 3, "light time is not meaningfully ahead of camera time during the hold");
  });

  test("light time is neutral everywhere, never a beat's own curve", () => {
    /* If light time ever picked up the destination's easing it would silently re-couple to the
       camera and the anticipation beat would quietly go dead again. */
    for (let i = 0; i <= 500; i++) {
      const p = i / 500;
      const { from, to, light } = timeline.span(timeline.SCENES, p);
      const range = to.at - from.at;
      const raw = range <= 0 ? 0 : Math.min(1, Math.max(0, (p - from.at) / range));
      assert.ok(
        Math.abs(light - motion.smooth(raw)) < 1e-9,
        `light time is not the neutral curve at p=${p}`
      );
    }
  });

  test("scrubbing past the ends does not throw or produce a broken pair", () => {
    for (const p of [-5, -0.001, 1.001, 5]) {
      const { from, to, t, light } = timeline.span(timeline.SCENES, p);
      assert.ok(from && to && Number.isFinite(t) && Number.isFinite(light), `span broke at p=${p}`);
    }
  });

  test("every caption is legible somewhere, and never all at once", () => {
    const peaks = timeline.SCENES.map(() => 0);
    for (let i = 0; i <= 1000; i++) {
      const p = i / 1000;
      let lit = 0;
      timeline.SCENES.forEach((_, index) => {
        const o = timeline.captionOpacity(timeline.SCENES, index, p);
        assert.ok(o >= 0 && o <= 1, `caption ${index} opacity ${o} at p=${p}`);
        peaks[index] = Math.max(peaks[index], o);
        if (o > 0.5) lit++;
      });
      assert.ok(lit <= 2, `${lit} captions are more than half visible at p=${p}`);
    }
    peaks.forEach((peak, index) => {
      assert.ok(peak > 0.95, `caption ${index} (${timeline.SCENES[index].key}) is never fully readable`);
    });
  });
});

describe("the phone is re-staged, not shrunk", () => {
  test("the whole composition narrows by one factor, so relative staging survives", () => {
    /* The defect this guards: scaling each element's x by a DIFFERENT amount, which put the camera
       where the product used to be and pushed her out of frame entirely. */
    for (const scene of timeline.SCENES) {
      const phone = timeline.forPortraitViewport(scene);
      const ratios = [];
      const pairs = [
        [scene.shot.at[0], phone.shot.at[0]],
        [scene.shot.to[0], phone.shot.to[0]],
        [scene.portraitAt[0], phone.portraitAt[0]],
        [scene.product.at[0], phone.product.at[0]],
        [scene.light.key.at[0], phone.light.key.at[0]],
        [scene.light.softbox.at[0], phone.light.softbox.at[0]],
      ];
      for (const [desktop, small] of pairs) {
        if (Math.abs(desktop) < 1e-9) continue;
        ratios.push(small / desktop);
      }
      for (const ratio of ratios) {
        assert.ok(
          Math.abs(ratio - ratios[0]) < 1e-9,
          `${scene.key}: the phone staging uses more than one horizontal factor`
        );
      }
    }
  });

  test("a tall frame gets a wider lens, and never an absurd one", () => {
    for (const scene of timeline.SCENES) {
      const phone = timeline.forPortraitViewport(scene);
      assert.ok(phone.shot.fov > scene.shot.fov, `${scene.key}: the phone lens is not wider`);
      assert.ok(phone.shot.fov <= 58, `${scene.key}: ${phone.shot.fov} degrees is a fisheye`);
    }
  });

  test("focus follows the camera in, or the phone cut is permanently soft", () => {
    /* The phone moves the lens 8 % closer. A focus distance left at the desktop figure would sit
       BEHIND the subject in every single beat — indistinguishable from a bad screen. */
    for (const scene of timeline.SCENES) {
      const phone = timeline.forPortraitViewport(scene);
      assert.ok(
        phone.lens.focus < scene.lens.focus,
        `${scene.key}: the phone camera came closer but the focus plane did not`
      );
    }
  });

  test("the product is never nudged out of the frame it was staged in", () => {
    for (const scene of timeline.SCENES) {
      const phone = timeline.forPortraitViewport(scene);
      assert.ok(Math.abs(phone.product.at[0]) <= Math.abs(scene.product.at[0]) + 1e-9);
      assert.ok(phone.product.scale < scene.product.scale, `${scene.key}: the product did not shrink`);
    }
  });
});

/* ================================================================= the coupling */

describe("the film's product staging still matches the catalogue it reads", () => {
  test("a glass package really does render as back shell 1 and front shell 3", () => {
    /*
     * src/scripts/cinema/product.ts finds the glass to upgrade to real refraction by RENDER ORDER,
     * which models.ts documents as "back shell (order 1), contents (order 2), front shell (order 3)".
     *
     * That coupling is deliberate — sniffing material properties instead would mis-fire the day a
     * lacquer is given a low roughness — but it is exactly the kind of contract that gets broken
     * silently: the film would simply stop upgrading its glass, with no error anywhere, and the
     * hero shot would quietly go back to being a transparency trick.
     */
    const serum = models.buildCosmetic("serum", "rose");
    const orders = new Set();
    serum.traverse((node) => {
      if (node.isMesh) orders.add(node.renderOrder);
    });
    assert.ok(orders.has(1), "no mesh at render order 1: the back shell that gives clear glass its edge is gone");
    assert.ok(orders.has(3), "no mesh at render order 3: the film can no longer find the front shell to upgrade");
  });

  test("the film's package is the site's own original packaging, not a fetched model", () => {
    // The whole 3D library is procedural and ships inside one chunk; nothing is downloaded.
    const serum = models.buildCosmetic("serum", "rose");
    let meshes = 0;
    serum.traverse((node) => {
      if (node.isMesh) meshes++;
    });
    assert.ok(meshes >= 4, "the serum built almost nothing");
  });
});
