/**
 * THE LIVING PHOTOGRAPH.
 *
 * The film has no 3D scan of Zina and never will. What it has is her photographs, and the whole
 * problem of this piece is how to put a flat rectangle into a moving 3D camera without it reading
 * as a flat rectangle in a moving 3D camera.
 *
 * Four things do the work, all in one fragment shader:
 *
 *  1. PSEUDO-DEPTH FROM LUMINANCE. Every one of her photographs is lit the same way — a bright
 *     subject against a darker ground — so brightness is a usable stand-in for nearness. A few
 *     blurred taps give a smooth depth field with no shimmer. It is not a real depth map and it
 *     does not need to be: it only has to be monotonic enough that her face moves slightly more
 *     than the wall behind her.
 *
 *  2. PARALLAX AGAINST THAT DEPTH. The CPU passes the camera's offset from the plane each frame;
 *     the shader shifts the sample by depth. Dolly the camera and the face slides against the
 *     background. That single effect is most of what makes it read as a photograph with air in it.
 *
 *  3. A DEPTH-ORDERED REVEAL. She does not fade in. The dissolve is ordered BY DEPTH, so the
 *     nearest, brightest part of her arrives first and the ground follows — the light finding her
 *     rather than an opacity ramp. A luminous edge travels along the dissolve front.
 *
 *  4. EDGE DISSOLUTION. The plane's own border is feathered to nothing, so there is never a
 *     rectangle in frame — the photograph becomes part of the dark instead of sitting on top of
 *     it. This is the difference between a 3D page and a film.
 *
 * Grading (exposure, lifted blacks, colour cast, saturation) is per-plane rather than only in the
 * post pass, so the night-to-morning transformation can reach the photographs themselves.
 */
import {
  AdditiveBlending,
  DoubleSide,
  NoColorSpace,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Texture,
  Vector2,
  Vector3,
} from "three";

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;
  uniform vec2  uTexel;        // one texel, for the depth blur taps
  uniform vec2  uParallax;     // camera offset, in uv units
  uniform float uDepthScale;   // how much the depth field displaces
  uniform float uReveal;       // 0 = absent, 1 = fully present
  uniform float uExposure;
  uniform float uLift;
  uniform vec3  uTint;
  uniform float uSaturation;
  uniform float uFeather;      // edge dissolution
  uniform float uAspect;       // plane aspect, so the feather is even on both axes
  uniform float uGrain;
  uniform float uTime;
  uniform float uFocus;        // depth-weighted softness: the far plane of the depth field
  uniform float uSoften;       // softness applied to the WHOLE plane, however near it is
  uniform float uDissolve;     // how organic the reveal front is: 0 a clean ramp, 1 a torn edge
  uniform float uVelocity;     // signed scroll speed, -1 to 1

  varying vec2 vUv;

  float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

  /* The photographs are sRGB-encoded. Everything downstream of this shader — the product's
     physically based lighting, the bloom, the ACES curve — is LINEAR, so the sample has to be
     decoded before it can be graded alongside them. Skipping this is what makes a rendered frame
     look washed out and grey: linear values written into an sRGB buffer. */
  vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }

  /* A smooth depth field. Nine taps at a wide radius: enough to kill the texture's own detail so
     the parallax moves masses, not pixels. */
  float depthAt(vec2 uv) {
    vec2 r = uTexel * 6.0;
    float d = 0.0;
    d += luma(texture2D(uMap, uv).rgb) * 0.28;
    d += luma(texture2D(uMap, uv + vec2( r.x, 0.0)).rgb) * 0.09;
    d += luma(texture2D(uMap, uv + vec2(-r.x, 0.0)).rgb) * 0.09;
    d += luma(texture2D(uMap, uv + vec2(0.0,  r.y)).rgb) * 0.09;
    d += luma(texture2D(uMap, uv + vec2(0.0, -r.y)).rgb) * 0.09;
    d += luma(texture2D(uMap, uv + r).rgb) * 0.09;
    d += luma(texture2D(uMap, uv - r).rgb) * 0.09;
    d += luma(texture2D(uMap, uv + vec2( r.x, -r.y)).rgb) * 0.09;
    d += luma(texture2D(uMap, uv + vec2(-r.x,  r.y)).rgb) * 0.09;

    /* Bias towards the middle of the frame. Every one of these photographs is a centred portrait,
       and without this a bright corner of wall would be treated as nearer than her cheekbone. */
    vec2 c = (uv - 0.5) * vec2(1.0, 1.0);
    float radial = 1.0 - smoothstep(0.1, 0.72, length(c));
    return clamp(d * 0.62 + radial * 0.38, 0.0, 1.0);
  }

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  /* Value noise, and two octaves of it. Two, not five: this is shaping the EDGE of a dissolve,
     not drawing a cloud, and the fine octaves of an fbm are invisible once the result has been
     smoothstepped across a third of the depth range. Octaves you cannot see are octaves you are
     paying for. */
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm2(vec2 p) {
    return noise(p) * 0.65 + noise(p * 2.17) * 0.35;
  }

  void main() {
    float depth = depthAt(vUv);

    /* Parallax. Nearer (brighter) parts of the image displace against the camera; the far ground
       barely moves. The 0.5 pivot keeps the mid-depth stationary so nothing swims. */
    vec2 uv = vUv + uParallax * (depth - 0.5) * uDepthScale;

    /* A VERY SMALL SHEAR WITH SCROLL SPEED, weighted by depth.
       A real camera whipped through a move drags its subject a little against its background, and
       the eye reads that lag as weight. The amplitude is a third of a percent of the frame at full
       speed, which is well under the threshold at which it could be named as an effect — and it is
       driven by the transport's SMOOTHED, CLAMPED velocity (motion.ts), so there is no scroll
       violent enough to turn it into a smear. */
    uv.y -= uVelocity * (depth - 0.5) * 0.034;

    /* The lens. A three-tap smear along the parallax axis at the far end of the depth field —
       cheap, directional, and it reads as depth of field rather than as blur. */
    vec3 rgb;
    /* Two kinds of softness, and the film needs both. uFocus blurs BY DEPTH, which is depth of
       field within one photograph. uSoften blurs the plane uniformly, which is what happens to a
       subject that is not the one being focused on — during the product hero she is behind the
       lens's plane of focus entirely, and depth-weighted blur would have left her face sharp. */
    float soft = uFocus * (1.0 - depth) * 0.9 + uSoften;
    if (soft > 0.002) {
      vec2 o = uTexel * soft * 26.0;
      rgb  = toLinear(texture2D(uMap, uv).rgb) * 0.5;
      rgb += toLinear(texture2D(uMap, uv + o).rgb) * 0.25;
      rgb += toLinear(texture2D(uMap, uv - o).rgb) * 0.25;
    } else {
      rgb = toLinear(texture2D(uMap, uv).rgb);
    }

    /* Grade. Lift first (matte shadows), then exposure, then cast, then saturation. */
    rgb = rgb + uLift * (1.0 - rgb);
    rgb *= uExposure;
    rgb *= uTint;
    float l = luma(rgb);
    rgb = mix(vec3(l), rgb, uSaturation);

    /* THE REVEAL, ordered by depth. The front is where the dissolve currently is; anything nearer
       than it is already present. A narrow band at the front glows, so the edge of the reveal is
       a light travelling over her rather than a hard threshold. */
    float front = 1.0 - uReveal * 1.35;
    /*
     * THE FRONT IS TORN, NOT STRAIGHT.
     *
     * Ordering the dissolve purely by depth gives a front that sweeps as a smooth contour, and a
     * smooth contour moving across a face reads as a wipe — a transition effect sitting on top of
     * a photograph. Displacing the front by two octaves of value noise breaks it into something
     * closer to how an emulsion actually comes up: in patches, unevenly, fastest where the light
     * already was. The noise is in the PLANE's own uv, so it is fixed to the photograph and does
     * not crawl when the camera moves.
     */
    float shaped = depth + (fbm2(vUv * 3.4) - 0.5) * uDissolve;
    float present = smoothstep(front, front + 0.34, shaped);
    float edge = exp(-pow((shaped - front) * 9.0, 2.0)) * uReveal * (1.0 - uReveal) * 2.4;
    rgb += edge * vec3(1.0, 0.92, 0.9) * 0.34;

    /* The plane stops being a plane.
       The aspect used to scale d.x here, which was exactly wrong: on a 3:4 photograph it shrank
       the horizontal axis to 0.75, so the falloff never reached zero at the left and right sides
       and the photograph kept a hard vertical edge — a rectangle sitting on the scene, which is
       the one thing this shader exists to prevent. Both axes already reach 1 at their own edge. */
    vec2 d = abs(vUv - 0.5) * 2.0;
    float m = max(d.x, d.y);
    float frame = 1.0 - smoothstep(1.0 - uFeather, 1.0, m);
    /* Corners are pulled in harder than edges — an oval falloff, not a rounded rectangle. The
       aspect belongs HERE: it makes the oval follow the photograph's own proportion. */
    frame *= 1.0 - smoothstep(0.72, 1.3, length(vec2(d.x * uAspect, d.y)));

    float alpha = present * frame * uReveal;

    /* Grain lives on the photograph as well as in the post pass, so it survives the bloom. */
    float g = (hash(vUv * 900.0 + uTime) - 0.5) * uGrain;
    rgb += g;

    if (alpha < 0.004) discard;
    gl_FragColor = vec4(rgb, alpha);
  }
`;

export interface PortraitPlane {
  mesh: Mesh;
  material: ShaderMaterial;
  /**
   * WHERE THE FACE IS, as a fraction from the top of the photograph.
   *
   * Every one of these photographs is a 3:4 portrait with the subject's head in the upper third.
   * A plane scaled to COVER a wide cinema frame therefore shows its vertical MIDDLE — which is her
   * collarbone. The film shipped with her eyes cropped off the top of the frame in every single
   * beat, and in the closest one there was no face in shot at all, only a shoulder and a hand.
   *
   * The site already knows the answer: `photography.ts` carries a focal point per photograph and
   * `EditorialImage.astro` publishes it as the `object-position` every cropped `<img>` on the site
   * already honours. This reads that same value, so the film crops to the same point as the
   * storyboard beneath it and there is exactly one place where a face's position is recorded.
   */
  readonly focusY: number;
  /** The loaded resource's aspect, which is not known until it arrives. */
  readonly aspect: number;
  /** False until the photograph is on the GPU. A plane that is not ready is never drawn. */
  readonly ready: boolean;
  /** Point the parallax at a camera position, in the plane's own local terms. */
  track(cameraPosition: Vector3, strength: number): void;
}

/**
 * Build a plane for one already-loaded <img>.
 *
 * The texture is created FROM THE DOM ELEMENT. The storyboard beneath the film has already
 * downloaded these photographs — they are its visible content when the film cannot run — so the
 * film costs no additional image request at all.
 */
export function makePortrait(image: HTMLImageElement, geometry: PlaneGeometry): PortraitPlane {
  /*
   * THE TEXTURE IS LOADED FROM A FIXED URL, NOT FROM THE <img> ELEMENT.
   *
   * The obvious thing is to hand Three the storyboard's own element — it is already decoded, so
   * it costs nothing. It does not work reliably. The storyboard images live in a <picture> with
   * srcset and sizes, and a browser re-runs candidate selection whenever the layout that `sizes`
   * depends on settles. On a tall viewport that happened AFTER the element had been uploaded, and
   * every plane ended up textured with Three's blank default: correctly placed, correctly scaled,
   * and completely empty. Re-flagging `needsUpdate` on the element's `load` event did not fix it,
   * because the element's resource is not stable at any point we can name.
   *
   * Reading `currentSrc` once and loading THAT URL into an image of our own removes the moving
   * part. The URL is already in the cache — the storyboard fetched it — so this still costs no
   * network request, and the film now gets a resource whose dimensions it can rely on.
   */
  const material = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    uniforms: {
      uMap: { value: null },
      uTexel: { value: new Vector2(1 / 1000, 1 / 1333) },
      uParallax: { value: new Vector2(0, 0) },
      uDepthScale: { value: 0.06 },
      uReveal: { value: 0 },
      uExposure: { value: 1 },
      uLift: { value: 0.02 },
      uTint: { value: new Vector3(1, 1, 1) },
      uSaturation: { value: 1 },
      uFeather: { value: 0.42 },
      uAspect: { value: 1 },
      uGrain: { value: 0.03 },
      uTime: { value: 0 },
      uFocus: { value: 0 },
      uSoften: { value: 0 },
      uDissolve: { value: 0.42 },
      uVelocity: { value: 0 },
    },
  });

  /** Until the texture is ready the plane draws nothing at all, rather than drawing blank. */
  let ready = false;

  const source = new Image();
  const texture = new Texture(source);
  texture.colorSpace = NoColorSpace; // decoded to linear in the shader, not by the renderer
  texture.anisotropy = 4;

  const aspectFromElement = (image.naturalWidth || 3) / (image.naturalHeight || 4);
  let aspect = aspectFromElement;

  source.addEventListener("load", () => {
    const w = source.naturalWidth || 1000;
    const h = source.naturalHeight || 1333;
    aspect = w / h;
    material.uniforms.uTexel!.value.set(1 / w, 1 / h);
    material.uniforms.uMap!.value = texture;
    texture.needsUpdate = true;
    ready = true;
  });
  source.decoding = "async";
  source.src = image.currentSrc || image.src;

  /*
   * Read once, from the element the film is lifting. `object-position` resolves to a pair of
   * percentages; the vertical one is the only part the film needs, because the horizontal staging
   * of each beat is a deliberate composition in timeline.ts rather than a crop.
   */
  let focusY = 0.32;
  try {
    const parsed = getComputedStyle(image).objectPosition.split(/\s+/)[1];
    if (parsed && parsed.endsWith("%")) {
      const value = Number.parseFloat(parsed) / 100;
      if (Number.isFinite(value)) focusY = Math.min(1, Math.max(0, value));
    }
  } catch {
    /* A detached or unstyled element keeps the default, which is the middle of the upper third. */
  }

  const mesh = new Mesh(geometry, material);
  mesh.scale.set(aspect, 1, 1);
  mesh.renderOrder = 1;

  const offset = new Vector3();
  return {
    mesh,
    material,
    get aspect() {
      return aspect;
    },
    get focusY() {
      return focusY;
    },
    get ready() {
      return ready;
    },
    track(cameraPosition, strength) {
      offset.copy(cameraPosition).sub(mesh.position);
      // Normalised against distance so the parallax does not explode as the camera closes in.
      const z = Math.max(Math.abs(offset.z), 0.6);
      material.uniforms.uParallax!.value.set((offset.x / z) * strength, (offset.y / z) * strength);
      material.uniforms.uAspect!.value = aspect;
    },
  };
}

export { AdditiveBlending };
