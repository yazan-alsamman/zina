/**
 * THE HERO OBJECT — the site's own packaging, staged as a campaign still.
 *
 * ============================================================================
 * WHAT THIS MODULE IS FOR
 * ============================================================================
 * The film does not model its own product. It builds one from the site's procedural catalogue
 * (src/scripts/cosmetics/models.ts) — an ORIGINAL package that depicts no real product and is never
 * captioned as one — and then does three things the ambient layer on the other eighty-six pages
 * cannot afford to do, because it has exactly one object in exactly one viewport:
 *
 *   1. REAL REFRACTION. The catalogue's glass is a two-shell transparency trick. Here it becomes
 *      actual `transmission`, with thickness and an index of refraction, so the liquid bends.
 *   2. A PLINTH. A small polished disc under the object that reflects the studio's panels, plus a
 *      contact shadow that gives the object weight. An object with no contact shadow floats, and a
 *      floating bottle is the single most reliable tell that a render is a render.
 *   3. A STAGED REVEAL. The object does not fade in. It is a shape in the dark, then a shape with
 *      an edge, then a shape standing on something, then a lit product.
 *
 * ============================================================================
 * THE COUPLING THIS MODULE HAS, DELIBERATELY
 * ============================================================================
 * `models.ts` documents its glass build as "back shell (order 1), contents (order 2), front shell
 * (order 3)". This module reads those render orders to find the glass. That is a real coupling and
 * it is the right one: the alternative is sniffing material properties, which would silently
 * mis-fire the day someone gives a lacquer a low roughness. If the orders in models.ts change, the
 * film's glass quietly stops being upgraded, and tests/cinema.test.mjs asserts the contract so that
 * "quietly" becomes "loudly".
 */
import {
  AdditiveBlending,
  Box3,
  CanvasTexture,
  CircleGeometry,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  SRGBColorSpace,
} from "three";
import { buildCosmetic, type CosmeticKind, type CosmeticTint } from "../cosmetics/models";
import { clamp01, lerp } from "./motion";
import type { ProductBeat } from "./timeline";

/**
 * models.ts renders a glass package as back shell (1) / contents (2) / front shell (3).
 *
 * Only the FRONT shell is addressed here — it is the one that becomes a transmissive surface. The
 * back shell is deliberately left exactly as the catalogue built it: in a room this dark it is the
 * only thing giving clear glass an edge, and an earlier version of this module hid it and lost the
 * bottle's silhouette entirely. tests/cinema.test.mjs asserts both orders still exist, because the
 * film depends on one of them being upgradeable and the other being there at all.
 */
const GLASS_FRONT_ORDER = 3;

/* ------------------------------------------------------------------ the plinth */

/**
 * A radial fade, drawn once and used as an alpha map.
 *
 * `power` shapes the falloff: a low power is a wide soft pool (the plinth, which should have no
 * findable edge), a high one is a tight core (the contact shadow, which must be densest exactly
 * where the object touches and gone within half its own width).
 */
function radialAlpha(power: number, inner: number): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const a = Math.pow(1 - t, power) * inner;
    gradient.addColorStop(t, `rgba(255,255,255,${a.toFixed(4)})`);
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/* ------------------------------------------------------------------ the mount */

export interface FilmProduct {
  /** Added to the scene by the caller; carries the object, its plinth and its shadow. */
  group: Group;
  /**
   * Half the package's widest horizontal extent, in the group's own units (before `scale`).
   *
   * The caller needs this to keep the object inside a narrow frame: multiplied by the group's
   * scale it is the object's world half-width, which is what has to fit within the visible width
   * at its own distance. Taken from the widest of x and z because the package turns as it goes.
   */
  radius: number;
  /**
   * Stage the object for a blend of two beats.
   *
   * `t` is camera time and stages the object — where it is, how big, how far turned. `light` is
   * light time and drives the REVEAL, because being found by light is not a camera operation and
   * should not be tied to the camera's curve (see span() in timeline.ts).
   *
   * `time` drives the idle life — the fraction of a degree of drift that stops a still object from
   * reading as a frozen one.
   */
  apply(from: ProductBeat, to: ProductBeat, t: number, light: number, time: number, p: number): void;
  dispose(): void;
}

export interface ProductOptions {
  kind: CosmeticKind;
  tint: CosmeticTint;
  /**
   * Whether this machine gets real refraction.
   *
   * Transmission costs an extra render of the scene into a target every frame. On a desktop with
   * one small object that is nothing; on a phone it is the difference between a film and a
   * slideshow, and the two-shell glass it replaces is a perfectly respectable bottle.
   */
  refraction: boolean;
}

export function mountProduct(options: ProductOptions): FilmProduct {
  const group = new Group();
  const object = new Group();
  object.add(buildCosmetic(options.kind, options.tint));
  group.add(object);

  /* Every material the film touches is CLONED before it is touched.
     models.ts caches and shares its materials across the whole catalogue and across every other
     page's ambient layer. Mutating one here — raising an envMapIntensity, switching a shell to
     transmission — would reach out of this page and change eighty-six others. */
  const owned: MeshPhysicalMaterial[] = [];
  const glassFronts: MeshPhysicalMaterial[] = [];
  const bodies: { material: MeshPhysicalMaterial; envBase: number; colour: Color }[] = [];

  object.traverse((node) => {
    if (!(node instanceof Mesh)) return;

    /*
     * THE BACK SHELL STAYS. It was hidden here at first, on the reasoning that real transmission
     * renders the far wall itself and a second shell would be a doubled surface.
     *
     * That reasoning is right in a lit room and wrong in this one. The film's world is a dark
     * warm void, and a transmissive shell in a dark void transmits the dark: the bottle lost its
     * silhouette completely and the packshot became a cream-coloured fill and a cap floating with
     * no vessel around them. The back shell is what gives clear glass an EDGE — the faint doubled
     * wall you actually see looking through a bottle — and without something behind the glass to
     * catch the studio, there is nothing to tell the eye a vessel is there at all.
     */

    const source = node.material;
    if (Array.isArray(source) || !(source instanceof MeshPhysicalMaterial)) return;

    const material = source.clone();
    node.material = material;
    owned.push(material);

    if (options.refraction && node.renderOrder === GLASS_FRONT_ORDER) {
      /*
       * FROM A TRANSPARENCY TRICK TO ACTUAL GLASS.
       *
       * `transparent` has to go off. A transmissive material is not a blended one — it is drawn in
       * the opaque pass and does its own sampling of what is behind it, and leaving it in the
       * transparent queue both sorts it wrongly against the liquid inside it and makes it wash out.
       */
      material.transparent = false;
      material.opacity = 1;
      /*
       * DEPTH WRITING STAYS OFF, AND THIS IS THE WHOLE BOTTLE.
       *
       * Turning it on is the obvious thing — a transmissive material is drawn in the opaque pass,
       * and opaque things write depth. It emptied the bottle. The shell writes depth at its own
       * front surface, so every part of the package that lives BEHIND that surface — the rose
       * liquid, the pipette, the printed band — failed the depth test and was never drawn. What
       * was left was a hollow shell over a dark room, which rendered as a solid black object: a
       * black lacquer bottle where the model says clear glass with a visible fill.
       *
       * With it off, the contents draw, and the refraction has something to bend.
       */
      material.depthWrite = false;
      /*
       * NOT FULLY TRANSMISSIVE. At 1 the shell is a perfect window and vanishes against a dark
       * ground; held a little back from 1 it keeps a thin diffuse component, which is what carries
       * the specular stripe down the shoulder and gives the silhouette its edge.
       */
      material.transmission = 0.92;
      /* Thickness is what makes refraction visible: at zero the ray is not bent at all and the
         whole upgrade produces a slightly cleaner but identical bottle. A normalised model is
         about two units across, so a quarter-unit wall reads as substantial glass. */
      material.thickness = 0.34;
      material.ior = 1.5;
      material.roughness = 0.05;
      /* The environment is the only thing lighting this surface, so it is turned up: the panels'
         reflection IS the glass, and at the catalogue's ambient figure it barely registered in a
         room this dark. */
      material.envMapIntensity = 2.2;
      material.clearcoat = 1;
      material.clearcoatRoughness = 0.02;
      /* A trace of absorption. Perfectly clear glass is a plastic-looking absence; real glass
         takes a little out of what passes through it, and warm glass is what this identity owns. */
      material.attenuationDistance = 1.8;
      material.attenuationColor = new Color("#e8ded3");
      glassFronts.push(material);
    }

    bodies.push({ material, envBase: material.envMapIntensity, colour: material.color.clone() });
  });

  /* ---------------------------------------------------------------- the ground */

  /*
   * A PLINTH, NOT A FLOOR.
   *
   * The film has no room — it is a subject in a lit dark, which is what a beauty campaign is. A
   * full ground plane would give it one, and every wide shot would suddenly be a photograph of a
   * table. A small disc that fades to nothing within a couple of the object's own widths reads
   * instead as the polished surface the object happens to be standing on, and stops existing the
   * moment the camera is not looking at the object.
   */
  const box = new Box3().setFromObject(object);
  const base = box.min.y;
  const footprint = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);

  const plinthMaterial = new MeshPhysicalMaterial({
    color: "#29231d",
    metalness: 0,
    roughness: 0.22,
    /* The plinth's whole job is to REFLECT: it is dark, so almost everything visible in it is an
       image of the studio's panels stretched across it. That streak is the "polished surface" cue. */
    envMapIntensity: 2.4,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    transparent: true,
    alphaMap: radialAlpha(2.2, 0.85),
    depthWrite: false,
  });
  const plinth = new Mesh(new CircleGeometry(footprint * 2.1, 64), plinthMaterial);
  plinth.rotation.x = -Math.PI / 2;
  plinth.position.y = base - 0.002;
  plinth.renderOrder = -1;
  group.add(plinth);

  /*
   * THE CONTACT SHADOW. Tight, dark and cheap.
   *
   * No shadow map is involved and none is wanted: a directional shadow map for one object would
   * need its own render pass and would give a hard-edged shadow from a source that is supposed to
   * be a metre-wide diffusion panel. What an object on a polished surface under a big soft source
   * actually has is a small dense core directly beneath it, and that is a gradient.
   */
  const shadowMaterial = new MeshBasicMaterial({
    color: "#0d0a08",
    transparent: true,
    alphaMap: radialAlpha(3.4, 0.92),
    depthWrite: false,
    opacity: 0,
  });
  const shadow = new Mesh(new CircleGeometry(footprint * 1.15, 48), shadowMaterial);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = base + 0.001;
  shadow.renderOrder = 0;
  group.add(shadow);

  /*
   * THE LIGHT SWEEP. One narrow additive bar, lying in the plinth.
   *
   * The reveal's specular travel is done for real, by turning the whole baked environment (see
   * lighting.ts) — this is the small second half of it: the streak the panel throws ACROSS the
   * surface the object stands on, which is the thing that makes the sweep read as a light moving
   * through a room rather than as a highlight sliding along a bottle.
   */
  const sweepMaterial = new MeshBasicMaterial({
    color: "#fff2e4",
    transparent: true,
    blending: AdditiveBlending,
    alphaMap: radialAlpha(1.5, 0.7),
    depthWrite: false,
    opacity: 0,
  });
  const sweep = new Mesh(new CircleGeometry(footprint * 2.4, 40), sweepMaterial);
  sweep.rotation.x = -Math.PI / 2;
  sweep.scale.set(0.34, 1, 1); // a bar, not a pool
  sweep.position.y = base + 0.002;
  sweep.renderOrder = 1;
  group.add(sweep);

  return {
    group,
    radius: footprint / 2,

    apply(from, to, t, light, time, p) {
      group.position.set(
        lerp(from.at[0], to.at[0], t),
        lerp(from.at[1], to.at[1], t),
        lerp(from.at[2], to.at[2], t)
      );

      const scale = lerp(from.scale, to.scale, t);
      group.scale.setScalar(scale);

      /* The orbit. Almost all of the rotation is spent in the beat where the object has the frame;
         elsewhere it turns slowly enough that you notice it only if you look. */
      object.rotation.y = lerp(from.spin, to.spin, t) + Math.sin(time * 0.12) * 0.05;
      object.rotation.x = Math.sin(time * 0.17) * 0.03;
      object.rotation.z = Math.sin(p * 2.4) * 0.06;

      const reveal = clamp01(lerp(from.reveal, to.reveal, light));

      /*
       * THE STAGED REVEAL, in four overlapping windows.
       *
       * Nothing here is opacity. The object is present in the frame from the first scroll — it is
       * simply not LIT, and every stage of the reveal is a stage of it being found by light, which
       * is how an object is actually revealed on a set.
       */

      /* 1. THE EDGE (0 → 0.35). The environment starts to register in its surfaces: a single bright
            line down one shoulder and nothing else. A shape with an edge is a shape; a shape with
            no edge is a hole in the frame. */
      const edge = clamp01(reveal / 0.35);

      /* 2. THE BODY (0.25 → 0.75). The diffuse surfaces come up out of black. Held back behind the
            edge deliberately: the eye should find the highlight first and the object second. */
      const body = clamp01((reveal - 0.25) / 0.5);

      /* 3. THE WEIGHT (0.45 → 0.85). The contact shadow arrives and the object stops floating. */
      const weight = clamp01((reveal - 0.45) / 0.4);

      /* 4. THE SURFACE (0.6 → 1). The plinth resolves, and with it the reflection that says the
            object is standing somewhere rather than hanging in front of something. */
      const surface = clamp01((reveal - 0.6) / 0.4);

      for (const entry of bodies) {
        /*
         * THE FLOORS ARE WHAT KEEP IT ONE OBJECT.
         *
         * These began at 0.08 and 0.06, which is very nearly "off", and the hint beat rendered the
         * package as TWO SEPARATE FLOATING SHAPES: the cap and the metal collar still caught enough
         * environment to read, while the clear glass body between them — which has almost no albedo
         * of its own and depends entirely on reflection — disappeared completely. An object whose
         * middle is missing does not read as an object waiting in the dark; it reads as a bug.
         *
         * Raised until the silhouette survives being unlit. It is still markedly darker than the
         * lit state, which is all the reveal actually needs.
         */
        entry.material.envMapIntensity = entry.envBase * lerp(0.3, 1, edge);
        /* Multiplying the albedo down rather than fading opacity: an unlit object is dark, not
           transparent. Fading it would show the haze through the middle of a solid bottle. */
        entry.material.color.copy(entry.colour).multiplyScalar(lerp(0.25, 1, body));
      }
      for (const glass of glassFronts) {
        /*
         * THE WALLS BECOME GLASS. This is the reveal's best moment and it took two attempts.
         *
         * Dimming albedo and environment does nothing to a transmissive surface: transmission
         * shows whatever is BEHIND the object, so during the hint beat the clear body was a
         * perfect window onto her hair and simply was not there. The package rendered as a cap and
         * a base ring floating a body's width apart — the exact "unintentionally floating" failure
         * the brief warns about, and no amount of tuning the lit surfaces could reach it, because
         * the missing part was not a lit surface.
         *
         * Transmission itself has to be part of the reveal. Nearly opaque while the object is
         * waiting in the dark, so it holds a continuous silhouette; clear by the packshot, so the
         * liquid and the printed band read through it. Both ends stay above zero, so the material
         * never recompiles mid-scroll.
         */
        glass.transmission = lerp(0.3, 0.92, body);
        /* The body thins as it lights, which reads as walls becoming glass rather than as a dark
           object merely getting brighter. */
        glass.thickness = lerp(0.9, 0.34, body);
      }

      shadowMaterial.opacity = weight * 0.82;
      plinthMaterial.opacity = surface;
      plinth.visible = surface > 0.01;
      shadow.visible = weight > 0.01;

      /*
       * The sweep bar only exists DURING the sweep. It peaks halfway through the reveal and is
       * gone by the time the object is fully lit — it is the event of the light arriving, and an
       * event that is still there afterwards was never an event.
       */
      /*
       * THE STREAK CANNOT EXIST BEFORE THE SURFACE IT LIES ON.
       *
       * Gated on `surface` — the plinth's own presence — and not only on the reveal. Without that
       * gate the bar came up during the early beats, when the plinth is still absent, and an
       * additive ellipse with nothing under it is not a streak of light across a polished surface:
       * it is a pale smudge floating in mid-air next to her face, which is exactly how it read.
       */
      const sweeping = Math.sin(clamp01(reveal / 0.85) * Math.PI) * surface;
      sweepMaterial.opacity = sweeping * 0.34;
      sweep.visible = sweeping > 0.02;
      /* It travels across the plinth as it fades up and out, so the bar is moving even in the
         frames where it is barely visible. */
      sweep.position.x = lerp(-footprint * 1.4, footprint * 1.4, clamp01(reveal / 0.85));

      group.visible = scale > 0.02;
    },

    dispose() {
      for (const material of owned) material.dispose();
      plinthMaterial.alphaMap?.dispose();
      plinthMaterial.dispose();
      shadowMaterial.alphaMap?.dispose();
      shadowMaterial.dispose();
      sweepMaterial.alphaMap?.dispose();
      sweepMaterial.dispose();
      plinth.geometry.dispose();
      shadow.geometry.dispose();
      sweep.geometry.dispose();
    },
  };
}
