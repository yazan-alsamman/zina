/**
 * THE LIGHTING RIG — a beauty studio, and a light that tells the story.
 *
 * ============================================================================
 * WHY THERE IS NO RectAreaLight HERE
 * ============================================================================
 * The obvious way to light a beauty campaign in Three.js is `RectAreaLight`: it is the one light
 * that models a softbox, and a softbox is the entire visual signature of the genre — a large
 * source close to the subject, which wraps shadow edges instead of cutting them and lays a long
 * soft STRIPE down the shoulder of a bottle instead of a hard specular dot.
 *
 * It was measured and rejected. `RectAreaLight` needs `RectAreaLightUniformsLib`, which carries
 * the linearly-transformed-cosine lookup tables: 315 KB of float literals. The entire film chunk
 * is under 10 KB gzipped, on a site whose hardest budget rule is one small script per page. Paying
 * thirty times the film's weight for one light is not a trade this project makes.
 *
 * ============================================================================
 * WHAT IT DOES INSTEAD, AND WHY THAT IS BETTER ANYWAY
 * ============================================================================
 * A polished bottle does not look expensive because of what LIGHTS it. It looks expensive because
 * of what it REFLECTS. On a real set the stripe down the glass is not the softbox's illumination —
 * it is an image of the softbox itself, mirrored in the shoulder of the bottle.
 *
 * So the softboxes live in the ENVIRONMENT. `makeStudio()` builds a small scene of emissive panels
 * arranged the way a beauty set actually is — a tall key panel to camera right, a narrow vertical
 * strip that reads as a hard edge in glass, a broad overhead, a warm bounce card low and opposite
 * — and PMREM turns it into the image-based lighting every material in the film reflects. That is
 * a real area-light look, at zero runtime cost and zero bundle cost.
 *
 * And it buys the thing a RectAreaLight could not have given at any price: because the panels are
 * an environment, `scene.environmentRotation` SWINGS THEM. Rotating the studio as the scroll
 * advances travels the specular stripe across the bottle — which is the light sweep the product
 * reveal is built around, done as a real reflection of a real source rather than as a fake
 * gradient slid over a material.
 *
 * Three directional lights remain for the DIFFUSE shaping — key, rim and fill. Nothing in the film
 * casts a shadow map, so the only thing a true area light would add over a directional here is the
 * shape of its specular highlight, and that is exactly what the environment is now supplying.
 */
import {
  BackSide,
  BoxGeometry,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PMREMGenerator,
  Scene,
  type Texture,
  type WebGLRenderer,
} from "three";
import { lerp } from "./motion";
import type { LightMood } from "./timeline";

/* ------------------------------------------------------------------ the studio */

/**
 * One emissive panel. `intensity` is emissive strength, which is what PMREM integrates — a panel's
 * colour barely matters next to how bright it is and how big it is.
 */
function panel(
  parent: Scene,
  x: number,
  y: number,
  z: number,
  width: number,
  height: number,
  depth: number,
  intensity: number,
  colour: string
): void {
  const material = new MeshStandardMaterial({ color: "#000000" });
  material.emissive = new Color(colour);
  material.emissiveIntensity = intensity;
  const mesh = new Mesh(new BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
}

/**
 * THE BEAUTY STUDIO, as a scene to be PMREM'd.
 *
 * Every dimension here is a real decision about what the glass will show:
 *
 *  - THE KEY PANEL is tall and narrow rather than square. A square source reflects as a blob; a
 *    tall one reflects as the vertical stripe that reads, instantly and unmistakably, as a lit
 *    bottle. It is to camera right because that is where the timeline's softbox is staged.
 *  - THE EDGE STRIP is small, very bright and close. It produces the single hard highlight that
 *    sits inside the soft stripe — the detail that stops polished glass reading as plastic.
 *  - THE OVERHEAD is broad and dim, and it is what puts a top light on a cap and a shoulder.
 *  - THE BOUNCE CARD is warm, low and opposite the key: the fill side of a beauty set, and the
 *    reason the shadow side of the bottle is warm rather than merely dark.
 *  - THE ROOM is a dark box. A neutral grey room — which is what the stock RoomEnvironment is —
 *    puts a flat grey wash into every reflective surface, and flat grey is the one thing that
 *    cannot appear in an identity built from warm beige and mocha.
 */
export function makeStudio(): Scene {
  const studio = new Scene();

  /* The room. Dark, warm, and enclosing: everything the materials reflect that is not a panel is
     this, and it needs to be a colour the identity owns rather than black. */
  const room = new Mesh(
    new BoxGeometry(14, 14, 14),
    new MeshStandardMaterial({ color: "#29231d", side: BackSide })
  );
  studio.add(room);

  // Key: tall, narrow, camera right. The long stripe down the glass.
  panel(studio, 5.2, 0.6, 3.4, 0.4, 8.5, 4.5, 3.4, "#fffaf4");
  // Edge strip: small, very bright, close. The hard highlight inside the soft one.
  panel(studio, 3.4, 1.4, 5.0, 0.16, 3.6, 0.6, 9, "#ffffff");
  // Overhead: broad and dim. Top light on caps and shoulders.
  panel(studio, 0, 6.2, 0.5, 9, 0.4, 7, 1.7, "#f6f4f2");
  // Bounce card: warm, low, opposite the key. The fill side of the set.
  panel(studio, -5.4, -0.8, 2.2, 0.4, 6.5, 5.5, 1.15, "#c5b4a3");
  /* A second, weaker rear panel. Without something behind the subject a bottle's back edge has
     nothing to pick it out and the silhouette dies into the room. */
  panel(studio, -2.2, 1.2, -5.4, 4.5, 4.5, 0.3, 0.9, "#b8a48f");

  return studio;
}

/**
 * Build the studio, bake it, and throw the scene away.
 *
 * PMREM is generated ONCE, at start-up, and the texture it produces is what every material in the
 * film reflects for the rest of the take. Regenerating it per frame — which is the obvious way to
 * animate lighting — costs a full convolution chain every frame for an effect that
 * `environmentRotation` and `environmentIntensity` deliver for nothing.
 */
export function bakeStudio(renderer: WebGLRenderer): Texture {
  const pmrem = new PMREMGenerator(renderer);
  const studio = makeStudio();
  /* A little blur at bake time. A perfectly sharp environment puts a legible rectangle in every
     polished surface, which reads as a mirror in a room rather than as a lit set. */
  const texture = pmrem.fromScene(studio, 0.035).texture;
  pmrem.dispose();
  /* The scene was only ever scaffolding for the bake. Its geometry and materials are not used
     again and would otherwise sit on the GPU for the life of the page. */
  studio.traverse((object) => {
    if (object instanceof Mesh) {
      object.geometry.dispose();
      const material = object.material;
      if (Array.isArray(material)) for (const m of material) m.dispose();
      else material.dispose();
    }
  });
  return texture;
}

/* ------------------------------------------------------------------ the rig */

export interface Rig {
  /** Added to the scene by the caller. */
  group: Group;
  /**
   * Put the rig into the state described by a blend of two beats.
   *
   * `dawn` is the night-to-morning ramp, kept separate from the beat blend because the colour of
   * the light is a property of the WORLD's time of day rather than of the shot.
   */
  apply(from: LightMood, to: LightMood, t: number, dawn: number): void;
  /** Where the environment's reflection currently sits, in radians. The caller applies it. */
  sweepAt(from: LightMood, to: LightMood, t: number): number;
  dispose(): void;
}

/** Night is cool and plum; morning is warm and blush. The lights change colour, not only level. */
const KEY_NIGHT = new Color("#cdbfe0");
const KEY_DAY = new Color("#fff6ec");
const FILL_NIGHT = new Color("#8d8299");
const FILL_DAY = new Color("#e1ddda");

export function makeRig(): Rig {
  const group = new Group();

  /* Directional, not point or spot. The subjects are a handful of units across and the sources
     are meant to read as being metres away through diffusion — which is a parallel light. A point
     light close enough to show falloff would also show its own inverse-square across her face. */
  const key = new DirectionalLight("#ffffff", 1.2);
  const rim = new DirectionalLight("#c5b4a3", 2.2);
  const fill = new DirectionalLight("#e1ddda", 0.25);
  /* The softbox's DIFFUSE contribution. Its specular — the part that matters — is the environment
     panel it is staged to agree with; this is only the wrap it puts on the shadow side. */
  const box = new DirectionalLight("#fffaf4", 0);

  fill.position.set(-3, -0.6, 2);
  group.add(key, rim, fill, box);

  return {
    group,

    apply(from, to, t, dawn) {
      key.position.set(
        lerp(from.key.at[0], to.key.at[0], t),
        lerp(from.key.at[1], to.key.at[1], t),
        lerp(from.key.at[2], to.key.at[2], t)
      );
      key.intensity = lerp(from.key.intensity, to.key.intensity, t);
      key.color.lerpColors(KEY_NIGHT, KEY_DAY, dawn);

      rim.position.set(
        lerp(from.rim.at[0], to.rim.at[0], t),
        lerp(from.rim.at[1], to.rim.at[1], t),
        lerp(from.rim.at[2], to.rim.at[2], t)
      );
      rim.intensity = lerp(from.rim.intensity, to.rim.intensity, t);

      fill.intensity = lerp(from.fill, to.fill, t);
      fill.color.lerpColors(FILL_NIGHT, FILL_DAY, dawn);

      box.position.set(
        lerp(from.softbox.at[0], to.softbox.at[0], t),
        lerp(from.softbox.at[1], to.softbox.at[1], t),
        lerp(from.softbox.at[2], to.softbox.at[2], t)
      );
      /* Scaled well down from the value in the script. The number in the timeline describes the
         SOURCE — how bright that panel is on the set — and most of a large source's effect in this
         film arrives through the environment. Doubling it here instead would blow out her skin,
         because a directional light has none of a real softbox's falloff. */
      box.intensity = lerp(from.softbox.intensity, to.softbox.intensity, t) * 0.22;
    },

    sweepAt(from, to, t) {
      return lerp(from.sweep, to.sweep, t);
    },

    dispose() {
      key.dispose();
      rim.dispose();
      fill.dispose();
      box.dispose();
    },
  };
}

/** Exported so the stage's night-to-morning ramp and the rig's cannot drift apart. */
export { KEY_DAY, KEY_NIGHT };
