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
      uColor: { value: new Color("#ffe6dc") },
    },
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 3;
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
  gradient.addColorStop(0, "rgba(255,240,232,0)");
  gradient.addColorStop(0.35, "rgba(255,236,226,0.5)");
  gradient.addColorStop(0.62, "rgba(255,228,220,0.34)");
  gradient.addColorStop(1, "rgba(255,226,216,0)");
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
    { x: -2.4, y: 0.9, z: -1.6, w: 1.5, h: 9, tilt: 0.42, drift: 0.008, base: 0.5 },
    { x: 2.7, y: 1.3, z: -2.4, w: 2.1, h: 10, tilt: -0.34, drift: -0.006, base: 0.34 },
    { x: 0.4, y: -1.4, z: -3.2, w: 3.4, h: 7, tilt: 0.16, drift: 0.004, base: 0.22 },
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
      uTop: { value: new Color("#2a1220") },
      uBottom: { value: new Color("#0b0508") },
      uGlow: { value: new Color("#7d3550") },
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
