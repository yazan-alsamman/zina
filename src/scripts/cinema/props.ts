/**
 * THE PROPS — the beauty objects dressed into the film's set.
 *
 * ============================================================================
 * WHY THESE ARE PLACED IN CAMERA SPACE AND NOT IN THE WORLD
 * ============================================================================
 * An earlier attempt at this put objects on world-space orbits around the subject. It failed, and
 * it failed in a way worth writing down, because the fix is the whole design of this file.
 *
 * The camera in this film travels a long way — from nine units back on a long lens to two units
 * from a face on a wide one. An object on a fixed world orbit therefore changes its apparent size
 * by an order of magnitude across the take. Sized to read at the wide shots it swallowed the
 * close-ups; sized for the close-ups it became a speck at the wides. Specks near a photograph of a
 * person do not read as cosmetics. They read as DUST ON THE LENS — and because a portrait fills
 * these frames, they landed on her hair and her skin and looked like sensor dirt.
 *
 * So a prop is not given a position. It is given a PLACE IN THE FRAME:
 *
 *   u, v     where it sits on screen, in normalised device coordinates
 *   depth    how far away, as a MULTIPLE OF THE LENS'S FOCUS DISTANCE
 *   size     how much of the frame's height it fills, at any distance
 *
 * Every frame those three are resolved against the live camera into a world position and a world
 * scale. The consequence is the one that matters: a prop keeps its composition and its apparent
 * size while the camera moves, so "a large bottle drifting through the left foreground" stays
 * exactly that in every beat instead of becoming a mote.
 *
 * ============================================================================
 * WHAT THIS MODULE DOES NOT DO
 * ============================================================================
 * It adds no light, no material family, no texture, no render pass and no second scene. The props
 * are models from the site's own catalogue, lit by the baked studio the hero product uses, graded
 * by the same post chain and defocused by the same depth buffer. It reads the film's state; the
 * film does not read it.
 */
import { Group, Vector3, type PerspectiveCamera } from "three";
import { buildCosmetic, type CosmeticKind, type CosmeticTint } from "../cosmetics/models";
import { clamp01 } from "./motion";

/** Where her face is this frame, and how large, in world units. Supplied by the stage. */
export interface FaceZone {
  x: number;
  y: number;
  z: number;
  radius: number;
}

/**
 * THE FACE GUARD.
 *
 * Measured in screen space against where her face actually is — not against the middle of the
 * frame. The film stages her off-centre in most beats, and an earlier guard that protected frame
 * centre simply pushed objects onto her forehead instead.
 *
 * `pad` widens the protected disc well beyond the face itself, and it is deliberately large. The
 * first pass guarded roughly the head and props still landed on her HAIR and her shoulder, which
 * read exactly as badly as landing on her cheek — in these beats the photograph fills the frame,
 * so anything not pushed to an edge is on top of her somewhere. `soft` is how far outside the disc
 * a prop has recovered its full size.
 *
 * `pad` is a balance, not a maximum. At 2.5 the protected disc covered most of the frame in the
 * closest beats and removed four of the five props — a clean frame, but an empty one. It is now
 * 1.95, and the slack is taken up by the fact that EVERY prop is anchored to an edge and cropped:
 * the staging keeps them off her, and the guard is the backstop for the frames where the camera's
 * travel would otherwise carry one across her.
 */
const FACE_GUARD = { pad: 1.95, soft: 0.6 };

/**
 * The smallest a prop may be and still be drawn, as a fraction of the frame's height.
 *
 * Below about a twelfth of the frame nothing in this catalogue is legible as a cosmetic, so below
 * it a prop is not drawn at all rather than drawn as an unidentifiable mark.
 */
const MIN_APPARENT = 0.085;

/**
 * ONE PROP.
 *
 * Every field is per-object on purpose. Shared speeds and shared phases are what make a group of
 * floating things read as a mechanism; nothing here moves in step with anything else.
 */
interface Prop {
  kind: CosmeticKind;
  tint: CosmeticTint;

  /** Screen anchor in NDC. -1 is the left/bottom edge, +1 the right/top. */
  u: number;
  v: number;
  /**
   * Distance from the lens as a multiple of the focus distance. Below 1 is in front of the plane
   * of focus and will be softened by the existing depth-of-field; above 1 is behind it.
   */
  depth: number;
  /**
   * HOW MUCH OF THE FRAME'S HEIGHT THE OBJECT FILLS, 0-1.
   *
   * The single most important number in this file. It is an apparent size, not a world size, so it
   * means the same thing at every camera distance — which is what stops a prop ever becoming lint.
   */
  size: number;

  /** Slow elliptical drift of the screen anchor, and a vertical bob on its own clock. */
  driftU: number;
  driftV: number;
  driftSpeed: number;
  phase: number;
  bobAmp: number;
  bobSpeed: number;
  /** Slow breathing in and out of the focal plane. */
  depthAmp: number;
  depthSpeed: number;

  /** Local tumble, per axis, radians per second. */
  spin: [number, number, number];

  layer: "fore" | "mid" | "back";
}

/**
 * THE CAST.
 *
 * FIVE props across three depth zones — two foreground, two midground, one deep — and no two on
 * the same edge of the frame. Two of them are LARGE and CLOSE —
 * two thirds of the frame's height, well inside the focal plane, anchored past the frame edge so
 * they are always partially cropped. Those two are what make the set read as a set: a big soft
 * out-of-focus glass shape crossing a corner is the oldest trick in beauty cinematography and it
 * is the opposite of a speck.
 *
 * THE DEEP ZONE IS LARGE, NOT SMALL. An earlier version put two SMALL props behind the focal
 * plane and that was the whole of the dust problem: at that size a cosmetic does not read as a
 * cosmetic, it reads as a mark on the print. The deep prop here is nearly half the frame's height
 * and simply sits mostly outside the viewport, so the camera's travel discovers it rather than the
 * viewer squinting at it. Distance is expressed by DEFOCUS and CROPPING, never by shrinking.
 *
 * EVERY PROP IS CROPPED BY AN EDGE. Not one is a complete object floating in open space, because a
 * complete small object beside a photograph looks pasted on, and a partial large one looks like a
 * room that continues past the frame.
 *
 * Cheap models only. Measured from the catalogue: a vial is four meshes and 2,600 vertices, a jar
 * six and 8,300. `powder` at twenty-nine meshes, `palette` at ten and the twenty-one-thousand
 * vertex bottles are deliberately absent.
 */
const CAST: Prop[] = [
  /* ================= FOREGROUND — large, deliberately cropped, softened by the lens ========== */
  {
    /* Lower right. The biggest thing in the set and the one that most says "the camera is inside a
       room": two fifths of the frame's height, sitting well inside the focal plane so the existing
       depth of field turns it into a soft mass rather than a readable label. */
    kind: "jar",
    tint: "champagne",
    u: 0.74,
    v: -0.86, // cropped by the bottom edge, roughly two thirds visible
    depth: 0.4,
    size: 0.52,
    driftU: 0.07,
    driftV: 0.045,
    driftSpeed: 0.041,
    phase: 0.4,
    bobAmp: 0.028,
    bobSpeed: 0.12,
    depthAmp: 0.045,
    depthSpeed: 0.085,
    spin: [0.012, 0.03, 0.008],
    layer: "fore",
  },
  {
    /* Upper right, entering from the edge. Closer than the jar and smaller, so the two foreground
       shapes never read as a pair. */
    kind: "vial",
    tint: "nude",
    u: 0.96, // about two thirds of it inside the frame
    v: 0.58,
    depth: 0.52,
    size: 0.44,
    driftU: 0.085,
    driftV: 0.06,
    driftSpeed: 0.034,
    phase: 3.3,
    bobAmp: 0.032,
    bobSpeed: 0.1,
    depthAmp: 0.05,
    depthSpeed: 0.065,
    spin: [0.016, 0.024, 0.01],
    layer: "fore",
  },

  /* ================= MIDGROUND — readable silhouettes in the negative space ================== */
  {
    /*
     * Bottom edge, right of the caption's column.
     *
     * A WIDE FORM, not a narrow one. This was an ampoule, and an ampoule cropped by the bottom edge
     * shows only its neck — a thin pale sliver, which is the dust failure wearing a different
     * shape. A balm tin cropped at the same place reads immediately as a container.
     */
    kind: "balm",
    tint: "champagne",
    /* Well right of centre. At u 0.26 it sat underneath the caption, which is centred — on a phone
       and in landscape it crossed the type between two words. The caption owns the middle of the
       lower third; the props stay out of it. */
    u: 0.58,
    v: -0.9,
    depth: 0.82,
    size: 0.36,
    driftU: 0.1,
    driftV: 0.07,
    driftSpeed: 0.056,
    phase: 1.15,
    bobAmp: 0.04,
    bobSpeed: 0.17,
    depthAmp: 0.06,
    depthSpeed: 0.11,
    spin: [0.024, 0.055, 0.016],
    layer: "mid",
  },
  {
    /* Top edge, right of centre — the one object that reads against the bright upper ground. A
       compact is flat and wide, so cropped from above it reads as a disc rather than a stub. */
    kind: "compact",
    tint: "nude",
    u: 0.5,
    v: 0.94,
    depth: 0.9,
    size: 0.34,
    driftU: 0.09,
    driftV: 0.065,
    driftSpeed: 0.048,
    phase: 4.8,
    bobAmp: 0.036,
    bobSpeed: 0.145,
    depthAmp: 0.055,
    depthSpeed: 0.095,
    spin: [0.02, 0.048, 0.022],
    layer: "mid",
  },

  /* ================= DEEP — large but mostly outside the frame, found by the camera =========== */
  {
    /* Far right, behind the focal plane and past the edge. It is NOT small: it is a full-size
       object that the camera's travel swings into and out of view, which is what makes the set feel
       like it continues past the viewport instead of ending at it. */
    kind: "gloss",
    tint: "nude",
    u: 1.06,
    v: -0.16,
    depth: 1.5,
    size: 0.4,
    driftU: 0.13,
    driftV: 0.05,
    driftSpeed: 0.026,
    phase: 5.6,
    bobAmp: 0.03,
    bobSpeed: 0.08,
    depthAmp: 0.09,
    depthSpeed: 0.05,
    spin: [0.014, 0.036, 0.01],
    layer: "back",
  },
];

/**
 * A phone keeps the two foreground shapes and the bottom-edge midground object — one per edge it
 * can afford. At 390 points wide, anything at the deep zone's distance is behind the subject and
 * behind the type, and a fourth object is the difference between a dressed set and a cluttered one.
 */
const PHONE_CAST = new Set([0, 1, 2]);

export interface PropField {
  group: Group;
  /**
   * `density` is the beat's appetite for set dressing, 0-1, on light time. `focus` is the lens's
   * current focus distance, which every prop's depth is measured against. `time` is the prop clock
   * — frozen by the caller under reduced motion, which stops the whole set at once.
   */
  apply(
    density: number,
    time: number,
    camera: PerspectiveCamera,
    focus: number,
    face: FaceZone
  ): void;
  /** Live count, for the suite and for the report. */
  readonly count: number;
  dispose(): void;
}

export function mountProps(options: { small: boolean }): PropField {
  const group = new Group();
  const cast = options.small ? CAST.filter((_, i) => PHONE_CAST.has(i)) : CAST;

  const nodes = cast.map((spec) => {
    const object = new Group();
    /* buildCosmetic caches a prototype per kind+tint and clones it, so geometry and materials are
       shared with the hero product and with every other prop of the same kind. Nothing new is
       allocated on the GPU and nothing is allocated per frame. */
    object.add(buildCosmetic(spec.kind, spec.tint));
    group.add(object);
    return { spec, object };
  });

  /* Scratch vectors, allocated once. The render loop allocates nothing. */
  const forward = new Vector3();
  const right = new Vector3();
  const up = new Vector3();
  const world = new Vector3();
  const projected = new Vector3();
  const faceAt = new Vector3();
  const faceEdge = new Vector3();

  return {
    group,
    get count() {
      return nodes.length;
    },

    apply(density, time, camera, focus, face) {
      const live = clamp01(density);

      /* The camera's own basis, once per frame rather than once per prop. */
      camera.getWorldDirection(forward);
      right.set(camera.matrixWorld.elements[0]!, camera.matrixWorld.elements[1]!, camera.matrixWorld.elements[2]!).normalize();
      up.set(camera.matrixWorld.elements[4]!, camera.matrixWorld.elements[5]!, camera.matrixWorld.elements[6]!).normalize();

      const tanHalfFov = Math.tan((camera.fov * Math.PI) / 360);

      /* The face, resolved into screen space once. */
      faceAt.set(face.x, face.y, face.z).project(camera);
      faceEdge.set(face.x + face.radius, face.y, face.z).project(camera);
      const faceR = Math.max(Math.abs(faceEdge.x - faceAt.x) * FACE_GUARD.pad, 0.06);

      for (const { spec, object } of nodes) {
        /*
         * ---- how strongly this beat wants it, and can it possibly be seen?
         *
         * Three zones, three curves, every one steeper than linear so a quiet beat is genuinely
         * quiet rather than quietly littered. The deep zone is steepest: whatever leaves last is
         * what a near-empty frame is left holding, and it must never be the thing furthest away.
         *
         * The guard can only ever REDUCE a prop's size, so if the beat's own weight has already put
         * it under the readability threshold nothing below can bring it back. Deciding that first
         * skips the position, the rotation and the projection for every prop that is not going to
         * be drawn — which is all five of them at the three beats that are deliberately empty.
         *
         * This changes nothing on screen: these props were invisible either way.
         */
        const weight =
          spec.layer === "fore"
            ? Math.pow(live, 1.3)
            : spec.layer === "mid"
              ? Math.pow(live, 1.15)
              : Math.pow(live, 1.45);

        if (spec.size * weight <= MIN_APPARENT) {
          object.visible = false;
          continue;
        }

        /* ---- where it is, this frame, in the frame */
        const wobble = time * spec.driftSpeed + spec.phase;
        const u = spec.u + Math.cos(wobble) * spec.driftU;
        const v =
          spec.v +
          Math.sin(wobble * 1.31) * spec.driftV +
          Math.sin(time * spec.bobSpeed + spec.phase) * spec.bobAmp;
        const depth = Math.max(
          0.12,
          spec.depth + Math.sin(time * spec.depthSpeed + spec.phase * 1.7) * spec.depthAmp
        );

        /* ---- resolve against the live lens */
        const distance = Math.max(focus * depth, 0.35);
        const halfHeight = tanHalfFov * distance;
        const halfWidth = halfHeight * camera.aspect;

        world
          .copy(camera.position)
          .addScaledVector(forward, distance)
          .addScaledVector(right, u * halfWidth)
          .addScaledVector(up, v * halfHeight);
        object.position.copy(world);

        /* ---- the tumble */
        object.rotation.set(time * spec.spin[0], time * spec.spin[1], time * spec.spin[2]);

        /*
         * ---- how present it is
         *
         * Layers do not answer the beat equally. The two big foreground shapes are the first to go
         * and the last to return, because a large soft form near the lens is what most quickly
         * makes a frame feel crowded — and at the packshot, where density is lowest, they must be
         * gone entirely so the hero has its air.
         */
        /*
         * The exponents were inverted in the first pass: the smallest, furthest props were given
         * the SHALLOWEST curve, so at low density they were the only things left on screen — a
         * frame containing nothing but three specks, which is the dust failure in its purest form.
         *
         * Whatever is smallest must always leave first. Both curves are now steeper than linear so
         * that a quiet beat is genuinely quiet rather than quietly littered.
         */
        /* ---- the face guard, in screen space */
        projected.copy(world).project(camera);
        const dx = (projected.x - faceAt.x) / faceR;
        const dy = ((projected.y - faceAt.y) / faceR) / Math.max(camera.aspect, 0.2);
        const inFace = Math.sqrt(dx * dx + dy * dy);
        const guard =
          projected.z > 1 ? 1 : clamp01((inFace - FACE_GUARD.soft) / (1 - FACE_GUARD.soft));

        /*
         * ---- how big it is
         *
         * `size` is a fraction of the frame's HEIGHT, so the world scale is derived from the
         * frustum at this prop's own distance. That is the whole anti-lint mechanism: apparent
         * size is constant no matter where the camera has travelled to.
         *
         * The model is normalised to a unit bounding sphere, so a world scale of r gives an object
         * roughly 2r across; half the target height is therefore the right radius.
         */
        const apparent = spec.size * weight * guard;
        object.scale.setScalar(Math.max(halfHeight * apparent, 0.0001));
        /*
         * A PROP TOO SMALL TO READ AS A PRODUCT IS NOT DRAWN.
         *
         * The guard shrinks rather than hides, which left a prop passing near her as a small object
         * rather than no object — and a small unidentifiable object beside a face is the dust
         * failure again, arrived at from the other direction. Below a twelfth of the frame's height
         * nothing in this catalogue is legible as a cosmetic, so below that it simply goes.
         */
        object.visible = apparent > MIN_APPARENT;
      }
    },

    dispose() {
      /* Geometry and materials belong to the catalogue's shared cache, which the hero product is
         still drawing from. The groups hold nothing of their own. */
      group.clear();
    },
  };
}

export const PROP_CAST_SIZE = { desktop: CAST.length, phone: PHONE_CAST.size };
export { CAST as PROP_CAST, FACE_GUARD };
export type { Prop };
