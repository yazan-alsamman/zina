/**
 * THE TIMELINE — the film's script, as data.
 *
 * Scroll position is the only input this experience has. Everything the viewer sees — where the
 * camera is, what it is looking at, how wide the lens is, how bright the world is, which
 * photograph is present, where the product sits — is a function of one number between 0 and 1.
 *
 * Keeping that function DECLARATIVE is what makes the piece directable. A cut can be re-timed by
 * moving a number in this file; nothing in the renderer knows the story.
 *
 * ============================================================================
 * THE SEVEN SCENES
 * ============================================================================
 * The narrative is not invented for the occasion. It is Zina's own six-stage testing method —
 * baseline, application, wear window, conditions, comparison, revisit — which is a real record in
 * `content/` and is already a page on this site. A film about a testing method is honest; a film
 * about a product's results would not be, because those results belong to individual reviews.
 *
 *   0  AWAKENING       darkness, a long lens, the camera far away
 *   1  REVEAL          she emerges out of the dark, depth-first
 *   2  HERO PRODUCT    the object, alone, lit like a campaign still
 *   3  ZINA x PRODUCT  the two in one frame for the first time
 *   4  BEAUTY MOMENT   the closest the camera ever gets
 *   5  TRANSFORMATION  the world turns from night to morning
 *   6  FINAL HERO      the closing frame, and room to breathe
 */

/** Smooth, symmetric ease. Every transition in the film uses it — nothing here is linear. */
export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * A camera position, in the same units the scene is built in. `at` is where the lens sits, `to`
 * is what it is pointed at, `fov` is the lens itself — a long lens early (mystery, compression)
 * opening to a wider one as the world becomes legible.
 */
export interface Shot {
  at: [number, number, number];
  to: [number, number, number];
  fov: number;
}

/** What the world looks like at a moment: the grade, not the geometry. */
export interface Grade {
  /** Overall exposure. The film opens more than two stops under and recovers across the scroll. */
  exposure: number;
  /** Lifted blacks — a matte, filmic shadow rather than a crushed digital one. */
  lift: number;
  /** Colour cast, as a multiplier. Night is cool and plum; morning is warm and blush. */
  tint: [number, number, number];
  /** How much the highlights bloom. Beauty lighting halates; a product still does not. */
  bloom: number;
  /** Corner falloff. Heaviest in the dark, almost gone by the final frame. */
  vignette: number;
}

export interface Scene {
  /** Scroll position where this scene is fully "on", 0-1. */
  at: number;
  key: string;
  shot: Shot;
  grade: Grade;
  /**
   * Which storyboard figure is present, by index, and how it is framed. -1 is no photograph,
   * which is how the product hero gets the frame to itself.
   */
  portrait: number;
  /** Where the portrait plane sits. */
  portraitAt: [number, number, number];
  /**
   * HOW MUCH OF THE FRAME THE PHOTOGRAPH COVERS, not a size in world units.
   *
   * 1 means it exactly fills the frame at its own distance; 1.25 crops into it; 0.8 leaves it
   * sitting in the frame with the world visible around it. The renderer resolves this against the
   * lens and the viewport every frame, which is the only way one number can mean the same thing on
   * a 21:9 monitor and a 9:19 phone. Hand-tuned world sizes could not: the same 4.25 that filled a
   * laptop frame left a third of a phone frame as bare backdrop.
   */
  portraitCover: number;
  /** The hero product's position and how far through its rotation it is. */
  productAt: [number, number, number];
  productScale: number;
  productSpin: number;
  /** Dust density multiplier — the air thickens in the dark and clears as the world brightens. */
  air: number;
}

/**
 * THE SHOOTING SCRIPT.
 *
 * The camera travels a single continuous path from far away, in, around the product, back to her,
 * and out to a wide closing frame. It never cuts. Every position is chosen so the move between it
 * and the next one is a dolly, a push or an orbit — never a teleport.
 */
export const SCENES: Scene[] = [
  {
    at: 0,
    key: "awakening",
    // Far back, long lens, looking into darkness. The subject is there; you cannot see it yet.
    shot: { at: [0, 0.1, 9.2], to: [0, 0, 0], fov: 26 },
    grade: { exposure: 0.18, lift: 0.015, tint: [0.72, 0.68, 0.86], bloom: 0.5, vignette: 1 },
    portrait: 0,
    portraitAt: [0, 0, -1.2],
    portraitCover: 1.16,
    productAt: [1.9, -1.5, -0.6],
    productScale: 0.22,
    productSpin: 0,
    air: 1,
  },
  {
    at: 0.17,
    key: "reveal",
    // The push-in. She resolves out of the dark nearest-first, as if the light found her face.
    shot: { at: [0.5, 0.05, 5.4], to: [0.05, 0, -0.6], fov: 30 },
    grade: { exposure: 0.62, lift: 0.03, tint: [0.88, 0.83, 0.94], bloom: 0.72, vignette: 0.86 },
    portrait: 0,
    portraitAt: [0, 0, -1.2],
    portraitCover: 1.16,
    productAt: [1.75, -1.15, 0.3],
    productScale: 0.5,
    productSpin: 0.18,
    air: 0.9,
  },
  {
    at: 0.35,
    key: "product",
    // The camera leaves her and settles on the object. She is still behind it, out of focus.
    // Further back and a touch wider: the product had been filling the frame edge to edge with
    // its base cropped, which is a close-up, not a campaign still. A hero shot needs air.
    shot: { at: [1.42, -0.36, 3.45], to: [1.62, -0.5, 0.1], fov: 31 },
    grade: { exposure: 0.92, lift: 0.028, tint: [0.97, 0.9, 0.95], bloom: 0.62, vignette: 0.7 },
    portrait: 0,
    portraitAt: [-0.5, 0.05, -2.6],
    portraitCover: 0.78,
    productAt: [1.62, -0.5, 0.1],
    /* Normalised models are two units across, and at this distance the frame is about 1.7 units
       tall — so anything near 1 crops its own base. A packshot is a product with air around it. */
    productScale: 0.72,
    /* THE LABEL MUST FACE THE LENS IN THE ONE SHOT THE OBJECT HAS TO ITSELF. Printed faces are
       front-only (a label seen from behind would be mirrored type), so a big rotation here simply
       turned the lettering out of frame. A fifth of a radian is the classic packshot three-quarter
       angle: enough to show the bottle has depth, not enough to hide what it says. */
    productSpin: 0.34,
    air: 0.62,
  },
  {
    at: 0.52,
    key: "together",
    // The first frame that holds both. The product comes forward; she comes back into the light.
    // A two-shot needs room for two. Closer in than this, the object filled the middle of the
    // frame and she was pushed off the left edge, which is a product shot with a person in it.
    shot: { at: [0.3, -0.05, 4.3], to: [0.0, -0.08, -0.4], fov: 33 },
    grade: { exposure: 1.02, lift: 0.024, tint: [1.0, 0.94, 0.96], bloom: 0.66, vignette: 0.58 },
    portrait: 1,
    portraitAt: [-0.55, 0.02, -1.5],
    portraitCover: 0.92,
    productAt: [1.4, -0.55, 0.5],
    productScale: 0.55,
    productSpin: 1.5,
    air: 0.5,
  },
  {
    at: 0.68,
    key: "beauty",
    // The closest the lens ever gets. Wide open, shallow, all skin and light.
    // Centred and tight. Off to one side this left half the frame as flat empty backdrop; the
    // closest shot in the film should be filled by its subject.
    shot: { at: [-0.06, 0.05, 2.0], to: [-0.12, 0.0, -0.9], fov: 38 },
    grade: { exposure: 1.16, lift: 0.02, tint: [1.02, 0.96, 0.96], bloom: 0.95, vignette: 0.44 },
    portrait: 2,
    portraitAt: [-0.12, 0.0, -1.0],
    portraitCover: 1.3,
    productAt: [1.95, -1.0, 0.6],
    productScale: 0.26,
    productSpin: 2.5,
    air: 0.42,
  },
  {
    at: 0.84,
    key: "transformation",
    // Night becomes morning. The camera pulls back and the world opens out.
    shot: { at: [-0.62, 0.16, 4.3], to: [-0.1, 0.0, -0.8], fov: 35 },
    grade: { exposure: 1.34, lift: 0.012, tint: [1.05, 1.0, 0.98], bloom: 0.72, vignette: 0.3 },
    portrait: 3,
    portraitAt: [-0.22, 0.0, -1.35],
    portraitCover: 1.12,
    productAt: [1.35, -0.72, 0.5],
    productScale: 0.62,
    productSpin: 3.3,
    air: 0.34,
  },
  {
    at: 1,
    key: "final",
    // The closing frame: both subjects, composed, still, with air around them.
    shot: { at: [0.16, 0.02, 5.6], to: [0.1, -0.04, -0.7], fov: 32 },
    grade: { exposure: 1.42, lift: 0.008, tint: [1.06, 1.01, 0.99], bloom: 0.6, vignette: 0.26 },
    portrait: 4,
    portraitAt: [-0.55, 0.0, -1.5],
    portraitCover: 0.96,
    productAt: [1.32, -0.72, 0.35],
    productScale: 0.78,
    /* It ends where it began, a full turn later: the last frame shows the same face as the
       first, which is what makes the film feel closed rather than merely stopped. */
    productSpin: 2 * Math.PI,
    air: 0.3,
  },
];

/**
 * A phone is not a small cinema screen; it is a different aspect ratio, which means a different
 * FRAME. Rather than shrink the desktop compositions, the camera comes closer and the lens opens.
 *
 * The photographs need no adjustment here at all: `portraitCover` is resolved against the lens and
 * the viewport every frame, so a beat that fills the frame on a monitor fills it on a phone too.
 * Only the camera and the product, which have real positions in the world, are re-staged.
 */
export function forPortraitViewport(scene: Scene): Scene {
  /*
   * ONE FACTOR, APPLIED TO EVERY X.
   *
   * The compositions are staged across a wide frame — she holds one side, the object the other.
   * A phone held upright has roughly a third of that width, so the first attempt scaled each
   * element's x by a different amount and the staging fell apart: the camera ended up pointed at
   * where the product used to be, the product hung half off the right edge, and she was outside
   * the frame entirely.
   *
   * Squeezing the whole set — lens, look-at, photograph and object — toward the centre line by the
   * SAME factor keeps every relative position intact. The composition narrows; it does not break.
   * `portraitCover` needs no adjustment at all: the renderer resolves it against the lens.
   */
  const x = 0.34;
  return {
    ...scene,
    shot: {
      at: [scene.shot.at[0] * x, scene.shot.at[1], scene.shot.at[2] * 0.92],
      to: [scene.shot.to[0] * x, scene.shot.to[1], scene.shot.to[2]],
      // A wider lens, because a tall frame sees less of a scene at the same focal length.
      fov: Math.min(scene.shot.fov * 1.4, 58),
    },
    portraitAt: [scene.portraitAt[0] * x, scene.portraitAt[1], scene.portraitAt[2]],
    // Nudged down as well as in: the caption sits at the foot of a tall frame, and the object
    // should not be behind it.
    productAt: [scene.productAt[0] * x, scene.productAt[1] - 0.12, scene.productAt[2]],
    productScale: scene.productScale * 0.78,
  };
}

/** Where we are between two scenes: the pair either side of `p`, and how far across. */
export function span(scenes: Scene[], p: number): { from: Scene; to: Scene; t: number; index: number } {
  let index = 0;
  while (index < scenes.length - 2 && p >= scenes[index + 1]!.at) index++;
  const from = scenes[index]!;
  const to = scenes[index + 1]!;
  const range = to.at - from.at;
  const t = range <= 0 ? 0 : clamp01((p - from.at) / range);
  return { from, to, t: smoothstep(0, 1, t), index };
}

/** How present a given scene's caption is at progress `p` — a cross-dissolve, never a cut. */
export function captionOpacity(scenes: Scene[], index: number, p: number): number {
  const scene = scenes[index]!;
  const previous = scenes[index - 1];
  const next = scenes[index + 1];
  const inAt = previous ? lerp(previous.at, scene.at, 0.55) : -1;
  const outAt = next ? lerp(scene.at, next.at, 0.45) : 2;
  const rising = previous ? smoothstep(inAt, lerp(inAt, scene.at, 0.85), p) : 1;
  const falling = next ? 1 - smoothstep(lerp(scene.at, outAt, 0.2), outAt, p) : 1;
  return clamp01(rising * falling);
}
