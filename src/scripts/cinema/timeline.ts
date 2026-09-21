/**
 * THE TIMELINE — the film's script, as data.
 *
 * Scroll position is the only input this experience has. Everything the viewer sees — where the
 * camera is, what it is looking at, how wide the lens is, where it is focused, how the world is
 * lit, which photograph is present, how far through its reveal the product is — is a function of
 * one number between 0 and 1.
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
 *
 * SEVEN, AND NOT EIGHT. The brief this film answers sketches an eight-stage arc. There are seven
 * beats because there are seven things to SAY: her tagline and the six stages of the method. Every
 * line of type in this film is an existing record. An eighth beat would need an eighth line, and
 * inventing one — a stage of a testing method that Zina does not perform — is the one thing this
 * project does not do. The arc's missing stage is served instead by giving the product reveal its
 * own anticipation curve INSIDE beat 2 (see `anticipate` in motion.ts), which is what that stage
 * was asking for in the first place.
 */
import { clamp01, lerp, smooth, EASINGS, type EaseName } from "./motion";

export { clamp01, lerp };

/** Retained for callers that still want the raw curve; the film itself eases per transition. */
export const smoothstep = (edge0: number, edge1: number, x: number): number =>
  smooth(clamp01((x - edge0) / (edge1 - edge0)));

/**
 * A camera position, in the same units the scene is built in. `at` is where the lens sits, `to`
 * is what it is pointed at, `fov` is the lens itself — a long lens early (mystery, compression)
 * opening to a wider one as the world becomes legible.
 */
export interface Shot {
  at: [number, number, number];
  to: [number, number, number];
  fov: number;
  /**
   * CAMERA ROLL, in radians. Tiny — hundredths.
   *
   * A camera that is perfectly level in every frame of a seven-minute move is a camera on a
   * motion-control rig, and it reads as one: mechanically correct and lifeless. A fraction of a
   * degree of roll, changing slowly across the film, is the single cheapest thing that makes a
   * move read as operated. It is far below the threshold at which anyone would name it as a tilt;
   * it is only ever felt.
   */
  roll: number;
}

/**
 * THE LENS, as distinct from the camera.
 *
 * Focus is a world-space DISTANCE from the lens, not a scroll-space number, because that is what
 * a focus pull actually is: the plane of sharpness moving through the scene while the camera may
 * or may not be moving at all. Expressing it this way is what lets the film rack focus from the
 * product to her without moving the camera a millimetre.
 */
export interface Lens {
  /** Distance from the camera at which the world is sharp, in world units. */
  focus: number;
  /**
   * How fast sharpness falls away either side of that plane — the aperture, in effect.
   *
   * 0 is a pinhole: everything sharp, which is right for the opening, where the subject is a
   * silhouette and defocus would read as fog rather than as shallow depth. Higher numbers open
   * the iris; the beauty moment runs the widest in the film.
   */
  aperture: number;
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

/**
 * THE LIGHTING STATE AT A BEAT.
 *
 * The film used to derive its whole lighting rig from two scalars computed in the render loop —
 * one ramp for "how far round has the key swung" and one for "how close is dawn". That worked, and
 * it meant the lighting could not be DIRECTED: there was no way to say "this beat is lit softer
 * than the ones either side of it" without changing the shape of a ramp that every other beat also
 * read. Lighting is part of the story, so it belongs in the script beside the camera.
 *
 * Positions are normalised direction-ish offsets from the subject, not absolute world points, so
 * a beat can be re-staged without re-lighting it.
 */
export interface LightMood {
  /** The key: where it is, and how hard. Swings from behind the subject to in front of her. */
  key: { at: [number, number, number]; intensity: number };
  /** The rim, which is the whole of the lighting in the opening and almost nothing by the end. */
  rim: { at: [number, number, number]; intensity: number };
  /** Ambient-ish fill. Rises with the morning. */
  fill: number;
  /**
   * THE SOFTBOX — the reason the product looks photographed rather than rendered.
   *
   * A bare directional light gives a hard specular dot; a beauty campaign is lit through a large
   * diffusion panel, which lays a long soft specular STRIPE down the shoulder of a bottle, and
   * that stripe is most of what the eye reads as "expensive".
   *
   * Only its DIFFUSE wrap is a light in the rig. The stripe itself is a reflection of a real
   * panel in the baked studio environment — see lighting.ts for why that is both cheaper and
   * more convincing than the area light Three.js ships.
   */
  softbox: { at: [number, number, number]; intensity: number };
  /**
   * WHERE THE STUDIO'S REFLECTION SITS, in radians.
   *
   * The whole baked environment turns by this much, which travels every specular highlight in the
   * film across every polished surface at once. It is the light sweep the product reveal is built
   * around, and it is a real reflection of a real panel moving — not a gradient slid over a
   * material, which is what that effect usually is and always looks like.
   */
  sweep: number;
  /** Image-based lighting strength — the studio environment the materials actually reflect. */
  environment: number;
}

/**
 * HOW THE PRODUCT IS STAGED AT A BEAT.
 *
 * `reveal` is the new one and the reason the object earns its entrance. It is not opacity: it runs
 * the staged reveal described in the brief — an environmental hint, then a contact shadow, then a
 * light sweep across an unlit silhouette, then the lit object. See product.ts.
 */
export interface ProductBeat {
  at: [number, number, number];
  scale: number;
  /** How far through its rotation, in radians. */
  spin: number;
  /** 0 = a shape in the dark. 1 = fully present, fully lit, standing on its own reflection. */
  reveal: number;
}

export interface Scene {
  /** Scroll position where this scene is fully "on", 0-1. */
  at: number;
  key: string;
  /**
   * The curve used to travel INTO this beat from the one before it. Named for what the move is,
   * not for its polynomial — see motion.ts. This is the single change that most separates the
   * current cut from the old one, which ran every transition through the same symmetric ramp.
   */
  ease: EaseName;
  shot: Shot;
  lens: Lens;
  grade: Grade;
  light: LightMood;
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
  product: ProductBeat;
  /** Dust density multiplier — the air thickens in the dark and clears as the world brightens. */
  air: number;
  /**
   * HOW DRESSED THE SET IS, 0-1.
   *
   * The density of the beauty props (props.ts). It is EDITED, not ramped. The packshot is the
   * emptiest beat in the film after the opening, because that shot is about one object and a
   * dressed frame is precisely what would take it away; the beat where she and the product first
   * share a frame is the fullest; and the closing frame clears again so the film ends composed
   * rather than populated.
   */
  props: number;
  /**
   * FINE LUMINOUS MOTES — powder in a beam, not dust in a room.
   *
   * Zero for most of the film. It lifts only around the beauty moment and the transformation,
   * where a beauty campaign would actually have something in the air, and falls away again. A
   * constant sparkle would be a screensaver.
   */
  motes: number;
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
    ease: "smooth", // Nothing precedes it; the curve is never used.
    // Far back, long lens, looking into darkness. The subject is there; you cannot see it yet.
    shot: { at: [0, 0.1, 9.2], to: [0, 0, 0], fov: 26, roll: -0.014 },
    /* A PINHOLE, deliberately. The opening is a silhouette against a dark ground, and defocusing
       a silhouette does not read as shallow depth of field — it reads as the projector being out
       of focus. The iris opens once there is something sharp to be shallow ABOUT. */
    lens: { focus: 9.2, aperture: 0 },
    /* Under-exposed, but not to the point of being unrenderable. At 0.18 the opening frame was
       black: a photograph at a sixth of a stop, behind a reveal that is deliberately only part
       open, has nothing left to show. 0.36 is still more than a stop and a half under the beat
       that follows it, which is the contrast the opening is for. */
    grade: { exposure: 0.36, lift: 0.015, tint: [0.72, 0.68, 0.86], bloom: 0.5, vignette: 1 },
    light: {
      // Behind her, low, and almost off: the only thing lit in the frame is her edge.
      key: { at: [-2.4, 1.6, -2.2], intensity: 0.35 },
      rim: { at: [2.8, 1.2, -3.4], intensity: 2.6 },
      fill: 0.12,
      // The softbox is present but dark. It has not been switched on yet.
      softbox: { at: [2.6, 0.6, 2.2], intensity: 0 },
      /* Turned away. Its panels are behind the subject, so the only reflection in the frame is the
         thin bright edge that makes her a silhouette rather than an absence. */
      sweep: -0.9,
      environment: 0.35,
    },
    portrait: 0,
    portraitAt: [0, 0, -1.2],
    portraitCover: 1.16,
    product: { at: [1.9, -1.5, -0.6], scale: 0.22, spin: 0, reveal: 0 },
    air: 1,
    motes: 0,
    /* One shape, barely there. The set is not dressed yet. */
    props: 0.12,
  },
  {
    at: 0.17,
    key: "reveal",
    /* A PUSH. The camera commits to going in. The acceleration is what makes the move read as a
       decision rather than as a drift — this is the beat where the film starts. */
    ease: "push",
    // The push-in. She resolves out of the dark nearest-first, as if the light found her face.
    shot: { at: [0.5, 0.05, 5.4], to: [0.05, 0, -0.6], fov: 30, roll: -0.009 },
    /* Focused ON HER, and the iris cracks open. She is at z -1.2 and the lens at z 5.4, so the
       plane of sharpness sits at 6.6 — her face, with the ground behind it beginning to go. */
    lens: { focus: 6.6, aperture: 0.35 },
    grade: { exposure: 0.62, lift: 0.03, tint: [0.88, 0.83, 0.94], bloom: 0.72, vignette: 0.86 },
    light: {
      // The key begins its swing round to the front. This is the light finding her.
      key: { at: [-1.2, 1.8, 0.4], intensity: 1.1 },
      rim: { at: [2.2, 1.0, -3.2], intensity: 2.2 },
      fill: 0.18,
      /* The softbox comes up to a quarter. It is not lighting her — it is the first sign that
         there is something else in this room, and it is the product's own light. */
      softbox: { at: [2.4, 0.2, 1.8], intensity: 1.4 },
      /* Coming round. The first glint on the object's shoulder — the environmental hint the whole
         reveal is built on, and it is a real panel arriving, not a highlight faded up. */
      sweep: -0.55,
      environment: 0.5,
    },
    portrait: 0,
    portraitAt: [0, 0, -1.2],
    portraitCover: 1.16,
    /* Still barely there. The specular edge the softbox puts on its shoulder is the only thing
       that says an object exists — the environmental hint the reveal is built on. */
    /* REVEAL 0.45, NOT 0.22. At the lower figure the package had not yet crossed the threshold
       where its glass stops being a window, and the beat rendered a cap and a base ring floating a
       body's width apart with nothing between them. The hint is supposed to be an object you can
       see the shape of and not yet the detail of; 0.45 is the point at which it is one object. */
    product: { at: [1.75, -1.15, 0.3], scale: 0.5, spin: 0.18, reveal: 0.45 },
    air: 0.9,
    motes: 0,
    /* Glass begins to register at the edges of the frame as the key swings round. */
    props: 0.66,
  },
  {
    at: 0.35,
    key: "product",
    /* ANTICIPATION. The camera holds almost still for the first third of this transition while
       the light sweeps across the object, and only then commits to the packshot. Withholding the
       move is what buys the entrance; see `anticipate` in motion.ts. */
    ease: "anticipate",
    // The camera leaves her and settles on the object. She is still behind it, out of focus.
    // Further back and a touch wider: the product had been filling the frame edge to edge with
    // its base cropped, which is a close-up, not a campaign still. A hero shot needs air.
    shot: { at: [1.42, -0.36, 3.45], to: [1.62, -0.5, 0.1], fov: 31, roll: 0.006 },
    /* RACKED ONTO THE OBJECT. The product sits at z 0.1 and the lens at 3.45: focus 3.35. She is
       two and a half units further back and goes properly soft, which is the entire reason this
       shot reads as a product photograph and not as a person holding something. */
    lens: { focus: 3.35, aperture: 0.85 },
    grade: { exposure: 0.92, lift: 0.028, tint: [0.97, 0.9, 0.95], bloom: 0.62, vignette: 0.7 },
    light: {
      /* THE PACKSHOT RIG. Key round to the front and high; rim dropped to a trace; and the
         softbox at full, large, and close on the right — the long soft stripe down the bottle's
         shoulder that the whole shot is built to show. */
      key: { at: [1.6, 2.2, 2.4], intensity: 2.0 },
      rim: { at: [-1.8, 0.8, -2.4], intensity: 1.2 },
      fill: 0.3,
      softbox: { at: [2.9, 0.6, 2.0], intensity: 4.6 },
      /* THE SWEEP LANDS. The tall key panel is now square on the bottle's shoulder, which is the
         long vertical stripe a packshot exists to show. */
      sweep: 0.18,
      environment: 0.95,
    },
    portrait: 0,
    portraitAt: [-0.5, 0.05, -2.6],
    portraitCover: 0.78,
    /* Normalised models are two units across, and at this distance the frame is about 1.7 units
       tall — so anything near 1 crops its own base. A packshot is a product with air around it. */
    product: {
      at: [1.62, -0.5, 0.1],
      scale: 0.72,
      /* THE LABEL MUST FACE THE LENS IN THE ONE SHOT THE OBJECT HAS TO ITSELF. Printed faces are
         front-only (a label seen from behind would be mirrored type), so a big rotation here
         simply turned the lettering out of frame. A fifth of a radian is the classic packshot
         three-quarter angle: enough to show the bottle has depth, not enough to hide what it says. */
      spin: 0.34,
      reveal: 1,
    },
    air: 0.62,
    motes: 0.1,
    /* THE QUIETEST BEAT. The set clears so the hero packshot has the frame to itself. */
    props: 0.08,
  },
  {
    at: 0.52,
    key: "together",
    /* A DOLLY. After the packshot's decisive push, the two-shot is arrived at gently — the camera
       is no longer hunting for anything, it is composing. */
    ease: "dolly",
    // The first frame that holds both. The product comes forward; she comes back into the light.
    // A two-shot needs room for two. Closer in than this, the object filled the middle of the
    // frame and she was pushed off the left edge, which is a product shot with a person in it.
    shot: { at: [0.3, -0.05, 4.3], to: [0.0, -0.08, -0.4], fov: 33, roll: 0.004 },
    /* Split the difference and stop down. A two-shot in which one subject is soft is not a
       two-shot, so the iris closes to hold both the object at z 0.5 and her at z -1.5. */
    lens: { focus: 4.4, aperture: 0.4 },
    grade: { exposure: 1.02, lift: 0.024, tint: [1.0, 0.94, 0.96], bloom: 0.66, vignette: 0.58 },
    light: {
      // One rig now lights both of them, which is what puts them in the same room.
      key: { at: [1.0, 2.0, 2.8], intensity: 2.2 },
      rim: { at: [-2.4, 0.8, -2.6], intensity: 1.1 },
      fill: 0.4,
      softbox: { at: [2.4, 0.8, 2.2], intensity: 3.4 },
      /* Continuing past. The stripe narrows as the panel turns away from square, which is what
         separates this two-shot from the packshot without moving a single light. */
      sweep: 0.42,
      environment: 1.0,
    },
    portrait: 1,
    portraitAt: [-0.55, 0.02, -1.5],
    portraitCover: 0.92,
    product: { at: [1.4, -0.55, 0.5], scale: 0.55, spin: 1.5, reveal: 1 },
    air: 0.5,
    motes: 0.25,
    /* THE FULLEST. She and the object share a frame, and the set is dressed around them. */
    props: 1,
  },
  {
    at: 0.68,
    key: "beauty",
    /* A SETTLE. Covers the distance early and then holds, so the closest shot in the film is
       genuinely STILL for most of the scroll it occupies. A held close-up is the only kind worth
       having; a close-up that is still travelling is a mistake. */
    ease: "settle",
    // The closest the lens ever gets. Wide open, shallow, all skin and light.
    // Centred and tight. Off to one side this left half the frame as flat empty backdrop; the
    // closest shot in the film should be filled by its subject.
    shot: { at: [-0.06, 0.05, 2.0], to: [-0.12, 0.0, -0.9], fov: 38, roll: 0.0 },
    /* THE WIDEST IRIS IN THE FILM. She is at z -1.0, so focus 3.0 puts the plane exactly on her
       and everything else — air, motes, the object away at the edge — dissolves. This is what a
       beauty lens does wide open, and it is why the beat reads as skin and light and nothing else. */
    lens: { focus: 3.0, aperture: 1.25 },
    grade: { exposure: 1.05, lift: 0.02, tint: [1.02, 0.96, 0.96], bloom: 0.78, vignette: 0.44 },
    light: {
      /* BEAUTY LIGHTING. The softbox comes round to the front and gets BIG — a large source close
         to the subject is the whole of beauty lighting, because it is what wraps shadow edges
         instead of cutting them. The rim is nearly out; there is nothing left to separate her
         from, because at this distance she is the frame. */
      key: { at: [0.2, 1.4, 2.6], intensity: 2.4 },
      rim: { at: [-2.0, 0.6, -2.0], intensity: 0.9 },
      fill: 0.55,
      softbox: { at: [0.6, 0.9, 2.4], intensity: 5.2 },
      /* Round to the front. A source facing the subject wraps rather than models, and wrapping is
         what beauty lighting is. */
      sweep: 0.78,
      environment: 1.05,
    },
    portrait: 2,
    portraitAt: [-0.12, 0.0, -1.0],
    portraitCover: 1.3,
    product: { at: [1.95, -1.0, 0.6], scale: 0.26, spin: 2.5, reveal: 1 },
    air: 0.42,
    /* The one beat that really has something in the air. Fine powder catching a large source is
       a thing that happens on a beauty set, and it is the visual rhyme for what the page is about. */
    motes: 1,
    /* Pulled back for the closest shot in the film. Skin and light, and only the soft foreground. */
    props: 0.68,
  },
  {
    at: 0.84,
    key: "transformation",
    /* A LIFT. The largest travel in the film — out, up and round while the world changes colour.
       Held at both ends with the whole move in the middle, which is how a crane is actually
       operated and the only way this distance does not read as being dragged. */
    ease: "lift",
    // Night becomes morning. The camera pulls back and the world opens out.
    shot: { at: [-0.62, 0.16, 4.3], to: [-0.1, 0.0, -0.8], fov: 35, roll: -0.007 },
    lens: { focus: 5.5, aperture: 0.55 },
    grade: { exposure: 1.12, lift: 0.012, tint: [1.05, 1.0, 0.98], bloom: 0.6, vignette: 0.3 },
    light: {
      // Morning. The fill is now doing most of the work, which is what daylight looks like.
      key: { at: [2.2, 2.4, 3.0], intensity: 2.2 },
      rim: { at: [-3.0, 0.8, -2.2], intensity: 0.8 },
      fill: 0.75,
      softbox: { at: [1.8, 1.2, 2.6], intensity: 3.0 },
      /* Still travelling. By now the reflection is where the morning is coming from. */
      sweep: 1.15,
      environment: 1.1,
    },
    portrait: 3,
    portraitAt: [-0.22, 0.0, -1.35],
    portraitCover: 1.12,
    product: { at: [1.35, -0.72, 0.5], scale: 0.62, spin: 3.3, reveal: 1 },
    air: 0.34,
    motes: 0.5,
    /* Dispersing as the world opens into morning. */
    props: 0.56,
  },
  {
    at: 1,
    key: "final",
    /* A DOLLY out to the closing frame. The film ends the way it is meant to be remembered:
       composed, unhurried, and moving just enough that the last frame is not a photograph. */
    ease: "dolly",
    // The closing frame: both subjects, composed, still, with air around them.
    shot: { at: [0.16, 0.02, 5.6], to: [0.1, -0.04, -0.7], fov: 32, roll: 0.0 },
    /* Stopped well down. The last frame is the only one in the film where everything — her, the
       object, the air between them — is sharp at once, which is what makes it read as a
       resolution rather than as another shot. */
    lens: { focus: 6.0, aperture: 0.28 },
    grade: { exposure: 1.16, lift: 0.008, tint: [1.06, 1.01, 0.99], bloom: 0.52, vignette: 0.26 },
    light: {
      key: { at: [1.4, 2.2, 3.2], intensity: 2.1 },
      rim: { at: [-2.6, 0.9, -2.4], intensity: 0.9 },
      fill: 0.8,
      softbox: { at: [2.2, 1.0, 2.4], intensity: 3.2 },
      /* A slow quarter-turn and more across the whole film: the closing frame's highlight sits on
         the opposite shoulder from the opening's. One continuous lighting move, like the camera. */
      sweep: 1.45,
      environment: 1.1,
    },
    portrait: 4,
    portraitAt: [-0.55, 0.0, -1.5],
    portraitCover: 0.96,
    product: {
      at: [1.32, -0.72, 0.35],
      scale: 0.78,
      /* It ends where it began, a full turn later: the last frame shows the same face as the
         first, which is what makes the film feel closed rather than merely stopped. */
      spin: 2 * Math.PI,
      reveal: 1,
    },
    air: 0.3,
    motes: 0.2,
    /* Gone but for a trace. The last frame is composed and still. */
    props: 0.1,
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
   * Squeezing the whole set — lens, look-at, photograph, object AND THE LIGHTS — toward the centre
   * line by the SAME factor keeps every relative position intact. The composition narrows; it does
   * not break. `portraitCover` needs no adjustment at all: the renderer resolves it against the lens.
   */
  const x = 0.34;
  const at = scene.shot.at;
  const to = scene.shot.to;
  return {
    ...scene,
    shot: {
      at: [at[0] * x, at[1], at[2] * 0.92],
      to: [to[0] * x, to[1], to[2]],
      // A wider lens, because a tall frame sees less of a scene at the same focal length.
      fov: Math.min(scene.shot.fov * 1.4, 58),
      roll: scene.shot.roll,
    },
    /*
     * FOCUS FOLLOWS THE CAMERA IN. The lens moved 8 % closer, so a focus distance measured for the
     * desktop staging would now sit BEHIND the subject — the one defect that would make the phone
     * cut read as permanently slightly soft, which is indistinguishable from a bad screen.
     */
    lens: { focus: scene.lens.focus * 0.92, aperture: scene.lens.aperture },
    /* The lights narrow with the set. A key staged 2.6 units to the right of a composition that
       is now a third as wide would be lighting the wall beside the frame. */
    light: {
      ...scene.light,
      key: { ...scene.light.key, at: [scene.light.key.at[0] * x, scene.light.key.at[1], scene.light.key.at[2]] },
      rim: { ...scene.light.rim, at: [scene.light.rim.at[0] * x, scene.light.rim.at[1], scene.light.rim.at[2]] },
      softbox: {
        ...scene.light.softbox,
        at: [scene.light.softbox.at[0] * x, scene.light.softbox.at[1], scene.light.softbox.at[2]],
      },
    },
    portraitAt: [scene.portraitAt[0] * x, scene.portraitAt[1], scene.portraitAt[2]],
    product: {
      ...scene.product,
      // Nudged down as well as in: the caption sits at the foot of a tall frame, and the object
      // should not be behind it.
      at: [scene.product.at[0] * x, scene.product.at[1] - 0.12, scene.product.at[2]],
      scale: scene.product.scale * 0.78,
    },
  };
}

/**
 * Where we are between two scenes: the pair either side of `p`, and how far across.
 *
 * ============================================================================
 * TWO PROGRESS VALUES, AND THE DIFFERENCE BETWEEN THEM IS THE POINT
 * ============================================================================
 * `t` is CAMERA TIME. It runs through the destination beat's own curve, because the shape of a move
 * belongs to the move — a push onto a face and a crane out to a wide are not the same gesture, and
 * running every transition through one symmetric ramp is why the old cut read as even-handed to the
 * point of being characterless.
 *
 * `light` is LIGHT TIME. It runs through the neutral curve, always.
 *
 * They are separate because on a real set they are separate: a gaffer's cue and a dolly grip's push
 * are timed independently, and the moments where they disagree are most of what makes a sequence
 * feel directed rather than keyframed.
 *
 * It is also the only way the product reveal works at all. That beat uses `anticipate`, which holds
 * the camera almost still for its first third — and if the lighting shared that curve, the hold
 * would be a third of a beat in which NOTHING changes, which does not read as anticipation. It
 * reads as a stuck page. Giving light its own clock means the hold is a third of a beat in which the
 * light finds the object and the camera has not moved yet, which is exactly the shot that was
 * wanted: the entrance is bought by withholding the camera, not by withholding everything.
 */
export function span(
  scenes: Scene[],
  p: number
): { from: Scene; to: Scene; t: number; light: number; index: number } {
  let index = 0;
  while (index < scenes.length - 2 && p >= scenes[index + 1]!.at) index++;
  const from = scenes[index]!;
  const to = scenes[index + 1]!;
  const range = to.at - from.at;
  const raw = range <= 0 ? 0 : clamp01((p - from.at) / range);
  return { from, to, t: EASINGS[to.ease](raw), light: smooth(raw), index };
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
