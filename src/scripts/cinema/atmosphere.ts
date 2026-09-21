/**
 * AIR AND LIGHT — the things between the camera and the subject.
 *
 * A cinematic frame is rarely clean. What separates a rendered scene from a photographed one is
 * everything in the air: dust catching a key light, a shaft of light across the lens, a haze that
 * makes distance visible. None of it is the subject; all of it is why the subject looks real.
 *
 * The rule here is restraint. Each element is individually almost invisible. Together they are
 * the reason the frame has depth.
 */
import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  SRGBColorSpace,
  Float32BufferAttribute,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  MeshBasicMaterial,
} from "three";

/* ------------------------------------------------------------------ dust */

const DUST_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uDensity;
  attribute float aSeed;
  attribute float aScale;
  varying float vFade;

  void main() {
    vec3 p = position;

    /* Each mote drifts on its own slow, prime-ish cycle so the field never pulses in unison.
       Amplitudes are centimetres, not metres: this is air moving, not snow falling. */
    float t = uTime * 0.06 + aSeed * 6.283;
    p.x += sin(t * 0.9) * 0.16;
    p.y += cos(t * 0.7) * 0.13 + sin(uTime * 0.02 + aSeed) * 0.05;
    p.z += sin(t * 0.5) * 0.12;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    /* Size attenuation by distance, CAPPED. Uncapped, a mote that drifts near the lens covers a
       large part of the frame, and a few hundred of those blended additively is not atmosphere,
       it is fog. The cap is what keeps dust reading as dust. */
    gl_PointSize = min(uSize * aScale * (9.0 / max(-mv.z, 1.4)), 5.0);

    /* Fade out very close and very far — nothing pops into frame at the near plane. */
    float d = -mv.z;
    vFade = smoothstep(1.2, 3.0, d) * (1.0 - smoothstep(7.0, 13.0, d)) * uDensity;
  }
`;

const DUST_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vFade;

  void main() {
    /* A soft round mote. No texture: a radial falloff is cheaper and has no edge. */
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    float a = (1.0 - smoothstep(0.0, 0.5, r)) * vFade;
    if (a < 0.003) discard;
    /* Individually almost invisible. Hundreds of these are meant to add up to a suggestion of
       air, not to a luminous haze over the subject. */
    gl_FragColor = vec4(uColor, a * 0.11);
  }
`;

export function makeDust(count: number): { points: Points; material: ShaderMaterial } {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const scales = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // A slab of air in front of the subject, wider than it is tall — the shape of the frame.
    positions[i * 3] = (Math.random() - 0.5) * 11;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6.5;
    positions[i * 3 + 2] = Math.random() * 7 - 2.2;
    seeds[i] = Math.random();
    // A few large motes among many small ones. An even size reads as noise, not as dust.
    scales[i] = Math.random() < 0.08 ? 1.6 + Math.random() : 0.35 + Math.random() * 0.5;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
  geometry.setAttribute("aScale", new Float32BufferAttribute(scales, 1));

  const material = new ShaderMaterial({
    vertexShader: DUST_VERTEX,
    fragmentShader: DUST_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 1 },
      uDensity: { value: 1 },
      uColor: { value: new Color("#f6f4f2") },
    },
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 3;
  return { points, material };
}

/* ------------------------------------------------------------------ powder */

const MOTE_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uDensity;
  attribute float aSeed;
  attribute float aScale;
  varying float vFade;
  varying float vSpark;

  void main() {
    vec3 p = position;

    /* POWDER RISES. Dust hangs and drifts sideways; powder that has just been disturbed off a
       brush goes UP, slowly, and turns over as it goes. The vertical term is therefore a ramp
       rather than a sine, wrapped so the field never empties. */
    float t = uTime * 0.035 + aSeed;
    p.y += fract(t) * 3.4 - 1.7;
    p.x += sin(t * 5.4 + aSeed * 12.0) * 0.28;
    p.z += cos(t * 4.1 + aSeed * 9.0) * 0.22;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    gl_PointSize = min(uSize * aScale * (11.0 / max(-mv.z, 1.4)), 7.0);

    float d = -mv.z;
    /* Fades at both ends of its life as well as by distance, so nothing ever pops in or out at
       the wrap point — which is the one artefact that would give the whole trick away. */
    float life = sin(fract(t) * 3.14159);
    vFade = smoothstep(1.0, 2.6, d) * (1.0 - smoothstep(6.0, 11.0, d)) * uDensity * life;

    /* Each grain catches the light at its own moment. A field of powder in a beam is not
       uniformly bright — it GLINTS, because each particle is a flat flake turning over. */
    vSpark = pow(abs(sin(uTime * 1.6 + aSeed * 30.0)), 6.0);
  }
`;

const MOTE_FRAGMENT = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vFade;
  varying float vSpark;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    /* A soft disc with a bright core, not a gaussian blob. Out-of-focus highlights on a real lens
       are discs with a defined edge, and that edge is what makes a mote read as a point of light
       rather than as a smudge on the glass. */
    float disc = 1.0 - smoothstep(0.34, 0.5, r);
    float core = 1.0 - smoothstep(0.0, 0.2, r);
    float a = (disc * 0.5 + core * 0.9) * vFade * (0.35 + vSpark * 0.65);
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, a * 0.3);
  }
`;

/**
 * FINE POWDER, catching a large source.
 *
 * Deliberately a SECOND system rather than a channel on the dust. The two are different things
 * and share no behaviour: dust hangs in a room and drifts on air currents, powder has just been
 * knocked off a brush and is going up while it turns over and glints. Folding them together would
 * have meant one compromise motion that is neither, and one density control for two effects that
 * the timeline wants to run at different times — the air is thickest when the frame is darkest,
 * and the powder only exists at the beauty moment.
 *
 * It is one draw call and a few hundred points, and it is off for most of the film.
 */
export function makeMotes(count: number): { points: Points; material: ShaderMaterial } {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const scales = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    /* A column, not a slab. Powder is disturbed in one place and rises from it, so the field is
       tall and narrow and sits where the subject is rather than across the whole frame. */
    positions[i * 3] = (Math.random() - 0.5) * 5.5;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2.2;
    positions[i * 3 + 2] = Math.random() * 4.5 - 1.6;
    seeds[i] = Math.random();
    scales[i] = 0.3 + Math.random() * Math.random() * 1.5;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
  geometry.setAttribute("aScale", new Float32BufferAttribute(scales, 1));

  const material = new ShaderMaterial({
    vertexShader: MOTE_VERTEX,
    fragmentShader: MOTE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 1 },
      uDensity: { value: 0 },
      /* Warmer than the dust. Powder in a warm key is warm; the same colour as the air would make
         it read as more dust, which is exactly what it must not read as. */
      uColor: { value: new Color("#ffeedd") },
    },
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 4;
  return { points, material };
}

/* ------------------------------------------------------------------ light shafts */

/** A soft elliptical gradient — the cross-section of a light shaft, drawn once and shared. */
function shaftTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "rgba(246,244,242,0)");
  gradient.addColorStop(0.35, "rgba(246,244,242,0.5)");
  gradient.addColorStop(0.62, "rgba(217,210,202,0.34)");
  gradient.addColorStop(1, "rgba(217,210,202,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 256);

  // Feather the long edges so the shaft has no sides.
  const sides = ctx.createLinearGradient(0, 0, 64, 0);
  sides.addColorStop(0, "rgba(0,0,0,1)");
  sides.addColorStop(0.5, "rgba(0,0,0,0)");
  sides.addColorStop(1, "rgba(0,0,0,1)");
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = sides;
  ctx.fillRect(0, 0, 64, 256);

  const texture = new CanvasTexture(canvas);
  // Painted in sRGB by the 2D context; say so, or Three samples it as linear and it blows out.
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export interface Shaft {
  mesh: Mesh;
  material: MeshBasicMaterial;
  /** Radians per second — each shaft turns at its own rate, none of them quickly. */
  drift: number;
  base: number;
}

/**
 * Two or three shafts, angled like a window's light. They are additive planes, always roughly
 * facing the lens; they never cast and never occlude, they only sit in the air.
 */
export function makeShafts(): Shaft[] {
  const texture = shaftTexture();
  const geometry = new PlaneGeometry(1, 1);

  return [
    /* Held down from 0.5/0.34/0.22. At those figures the opening frame was dominated by two pale
       diagonal bars crossing an empty backdrop — the shafts were the subject, which is the one
       thing atmosphere must never be. */
    { x: -2.4, y: 0.9, z: -1.6, w: 1.5, h: 9, tilt: 0.42, drift: 0.008, base: 0.3 },
    { x: 2.7, y: 1.3, z: -2.4, w: 2.1, h: 10, tilt: -0.34, drift: -0.006, base: 0.2 },
    { x: 0.4, y: -1.4, z: -3.2, w: 3.4, h: 7, tilt: 0.16, drift: 0.004, base: 0.14 },
  ].map((spec) => {
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      opacity: 0,
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(spec.x, spec.y, spec.z);
    mesh.scale.set(spec.w, spec.h, 1);
    mesh.rotation.z = spec.tilt;
    mesh.renderOrder = 2;
    return { mesh, material, drift: spec.drift, base: spec.base };
  });
}

/* ------------------------------------------------------------------ the ground haze */

/**
 * A single wide plane far behind everything, holding the darkness the film opens in and the warm
 * morning it closes in. Without it the background is pure black, and pure black has no depth.
 */
export function makeHaze(): { mesh: Mesh; material: ShaderMaterial } {
  const material = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTop: { value: new Color("#4a3f35") },
      uBottom: { value: new Color("#14110e") },
      uGlow: { value: new Color("#b8a48f") },
      uGlowAt: { value: 0.5 },
      uGlowSize: { value: 0.55 },
      uOpacity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      uniform vec3 uTop; uniform vec3 uBottom; uniform vec3 uGlow;
      uniform float uGlowAt; uniform float uGlowSize; uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        vec3 c = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y));
        /* One soft pool of light, placed behind the subject. It is the only reason the dark has
           a direction. */
        float d = length((vUv - vec2(uGlowAt, 0.52)) * vec2(1.35, 1.0));
        /* A POOL, not a wash. At 0.85 this filled the frame with saturated plum and the film read
           as a magenta screen with a photograph on it. A backdrop's job is to give the dark a
           direction, and it does that at a fraction of the strength. */
        c += uGlow * pow(1.0 - smoothstep(0.0, uGlowSize, d), 1.8) * 0.3;
        gl_FragColor = vec4(c, uOpacity);
      }
    `,
  });
  const mesh = new Mesh(new PlaneGeometry(1, 1), material);
  mesh.position.z = -7.5;
  mesh.scale.set(34, 20, 1);
  mesh.renderOrder = 0;
  return { mesh, material };
}
