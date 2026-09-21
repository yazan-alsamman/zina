/**
 * THE LENS AND THE STOCK — a compact post chain.
 *
 * Three.js ships an EffectComposer with a pass for each of these. It is not used here: it would
 * pull a dozen modules into the chunk for effects that, at this quality bar, are a bright pass, a
 * separable blur and one composite. Four draw calls, written once, is both smaller and easier to
 * art-direct than a generic pipeline.
 *
 *   1  BRIGHT PASS   at quarter resolution, with a soft knee — highlights only
 *   2  BLUR H / V    two taps of a 9-wide gaussian on the quarter-res target
 *   3  COMPOSITE     defocus + bloom + halation + aberration + vignette + grain + tone map
 *
 * HALATION is the detail that matters most. On film, bright highlights scatter in the emulsion
 * and bleed WARM — it is why a beauty campaign glows pink-gold around the edge of a lit cheek and
 * a rendered image does not. The composite tints the bloom towards rose before adding it.
 *
 * ============================================================================
 * THE DEPTH OF FIELD, AND WHY IT IS NEW
 * ============================================================================
 * Until now the only defocus in this film lived inside the photograph shader: it blurred a
 * portrait by its own internal pseudo-depth. That gave shallow focus WITHIN a photograph and
 * nothing at all BETWEEN things — the product was pin-sharp in every frame it appeared in,
 * including the ones where the camera is supposed to be focused on her face two units behind it,
 * and a scene where every object at every distance is equally sharp is the readable signature of
 * a render.
 *
 * So the scene target now carries a depth texture, and the composite reads it. Focus is a real
 * distance in world units (see `Lens` in timeline.ts), which means the film can rack focus from
 * the object to her without moving the camera — the one piece of camera language it was missing.
 */
import {
  DepthTexture,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  UnsignedIntType,
  Vector2,
  WebGLRenderTarget,
  WebGLRenderer,
  LinearFilter,
  NearestFilter,
  RGBAFormat,
} from "three";

const QUAD_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const BRIGHT = /* glsl */ `
  precision mediump float;
  uniform sampler2D uScene;
  uniform float uThreshold;
  uniform float uKnee;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(uScene, vUv).rgb;
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    /* A soft knee rather than a hard cut: a hard threshold makes bloom flicker as a highlight
       crosses it, which on a slowly moving camera is the most obvious tell there is. */
    float w = smoothstep(uThreshold - uKnee, uThreshold + uKnee, l);
    gl_FragColor = vec4(c * w, 1.0);
  }
`;

const BLUR = /* glsl */ `
  precision mediump float;
  uniform sampler2D uSource;
  uniform vec2 uDirection;   // texel-sized step, horizontal or vertical
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(uSource, vUv).rgb * 0.2270270270;
    c += texture2D(uSource, vUv + uDirection * 1.3846153846).rgb * 0.3162162162;
    c += texture2D(uSource, vUv - uDirection * 1.3846153846).rgb * 0.3162162162;
    c += texture2D(uSource, vUv + uDirection * 3.2307692308).rgb * 0.0702702703;
    c += texture2D(uSource, vUv - uDirection * 3.2307692308).rgb * 0.0702702703;
    gl_FragColor = vec4(c, 1.0);
  }
`;

const COMPOSITE = /* glsl */ `
  precision highp float;
  uniform sampler2D uScene;
  uniform sampler2D uBloom;
  uniform sampler2D uDepth;
  uniform float uBloom_;      // strength
  uniform float uVignette;
  uniform float uGrain;
  uniform float uAberration;
  uniform float uExposure;
  uniform float uTime;
  uniform float uNear;
  uniform float uFar;
  uniform float uFocus;       // world distance the lens is focused at
  uniform float uAperture;    // how fast sharpness falls away either side of it
  uniform float uVelocity;    // 0-1, how hard the reader is currently scrolling
  uniform float uDof;         // 0 disables the defocus taps entirely
  uniform vec2  uResolution;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  /* ACES, the filmic curve. It is what keeps a bright highlight from going flat white and a
     saturated rose from going orange as it clips. */
  vec3 aces(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
  }

  /* The depth buffer is not linear: almost all of its precision is spent near the camera. This
     turns a stored sample back into a distance in world units, which is the only form a focus
     distance can be compared against. */
  float distanceAt(vec2 uv) {
    float d = texture2D(uDepth, uv).x;
    float viewZ = (uNear * uFar) / ((uFar - uNear) * d - uFar);
    return -viewZ;
  }

  /*
   * CIRCLE OF CONFUSION. How out of focus a pixel is, 0-1.
   *
   * Divided by the distance rather than taken as an absolute difference, because defocus is
   * ANGULAR: a subject half a unit behind the focal plane at two units away is far softer than one
   * half a unit behind it at ten, and an absolute difference gets that exactly backwards in the
   * wide shots — which is where the error would be most visible, because that is where the frame
   * has the most depth in it.
   */
  float coc(vec2 uv) {
    float dist = distanceAt(uv);
    /* The far plane reads as an enormous distance and would otherwise be maximally defocused. The
       backdrop haze IS the far plane, and smearing it achieves nothing except cost. */
    if (dist > uFar * 0.85) return 0.0;
    return clamp(uAperture * abs(dist - uFocus) / max(dist, 0.35), 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    vec2 off = (uv - 0.5);
    float r2 = dot(off, off);

    float blur = uDof > 0.5 ? coc(uv) : 0.0;

    /* Chromatic aberration, radial and only at the edges — the way a fast lens behaves wide open.
       Pulling only the red and blue channels keeps luminance detail intact.
       It opens a little on a fast scroll: a real lens flares as it is whipped, and this is the
       most restrained version of that there is. */
    vec2 ca = off * r2 * (uAberration * (1.0 + uVelocity * 0.6));
    vec3 c;
    c.r = texture2D(uScene, uv + ca).r;
    c.g = texture2D(uScene, uv).g;
    c.b = texture2D(uScene, uv - ca).b;

    /*
     * THE DEFOCUS. A twelve-tap golden-angle spiral.
     *
     * The golden angle is what makes this affordable: twelve samples placed at 137.5 degrees apart
     * on a growing radius are distributed so evenly that they read as a continuous disc, where
     * twelve samples on a ring read as twelve copies of the highlight. A separable gaussian would
     * be cheaper still and is wrong here, because out-of-focus highlights on a real lens are DISCS
     * — the round bokeh behind a lit bottle is most of why a shallow frame looks photographed.
     *
     * The loop bound is constant, as GLSL ES requires, and the whole thing is skipped where the
     * frame is sharp, which is most of the frame in most shots.
     */
    if (blur > 0.004) {
      float radius = blur * 0.022;
      vec3 sum = c;
      float weight = 1.0;
      for (int i = 0; i < 12; i++) {
        float fi = float(i) + 1.0;
        float angle = fi * 2.399963;              // the golden angle, in radians
        float r = sqrt(fi / 12.0) * radius;       // sqrt keeps the disc evenly filled
        vec2 tap = uv + vec2(cos(angle), sin(angle)) * r * vec2(1.0, uResolution.x / uResolution.y);
        /* Weighted by the TAP's own defocus, so a sharp foreground cannot smear itself across a
           soft background. Without it, an in-focus bottle grows a halo into the blurred wall
           behind it, which is the classic gather-DOF artefact and is worse than no defocus. */
        float w = step(0.004, coc(tap));
        sum += texture2D(uScene, tap).rgb * w;
        weight += w;
      }
      c = sum / weight;
    }

    vec3 bloom = texture2D(uBloom, uv).rgb;
    /* Halation: the scatter runs warm. Rose-gold, which is also the identity's metal. */
    bloom *= vec3(1.12, 0.96, 0.95);
    c += bloom * uBloom_;

    c *= uExposure;
    c = aces(c);

    /* Vignette — smooth, generous, never a visible ring. */
    float v = 1.0 - uVignette * smoothstep(0.16, 0.92, r2 * 2.1);
    c *= v;

    /* Grain, scaled by darkness. Film grain lives in the shadows; applying it evenly reads as
       digital noise across the highlights, which is the opposite of the intent.
       It lifts slightly with scroll speed, which is what a film stock does when it is pushed. */
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float g = (hash(uv * uResolution + fract(uTime) * 91.7) - 0.5);
    c += g * uGrain * (1.0 + uVelocity * 0.5) * (1.25 - l);

    /* LINEAR -> sRGB, last. This is a raw ShaderMaterial drawing to the default framebuffer, so
       the renderer's own output conversion never runs on it; without this the whole film is
       delivered as linear values into an sRGB buffer and reads as flat grey. */
    c = pow(max(c, vec3(0.0)), vec3(1.0 / 2.2));

    gl_FragColor = vec4(c, 1.0);
  }
`;

function quad(material: ShaderMaterial): { scene: Scene; camera: OrthographicCamera; mesh: Mesh } {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  return { scene, camera, mesh };
}

const target = (w: number, h: number) =>
  new WebGLRenderTarget(w, h, { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat, depthBuffer: true });

/** The state the composite needs from the timeline each frame. */
export interface Grade {
  bloom: number;
  vignette: number;
  exposure: number;
  /** World-space distance the lens is focused at. */
  focus: number;
  /** How fast sharpness falls away either side of it. 0 is a pinhole. */
  aperture: number;
  /** 0-1, how hard the reader is currently scrolling. Drives grain and aberration only. */
  velocity: number;
}

export interface PostChain {
  scene: WebGLRenderTarget;
  setSize(width: number, height: number, pixelRatio: number): void;
  /** The camera's clipping planes, which the depth linearisation needs. Set once at start-up. */
  setClip(near: number, far: number): void;
  render(renderer: WebGLRenderer, time: number, grade: Grade): void;
  dispose(): void;
}

/**
 * "quality" 1 is the full chain. 0 drops the two blur passes, the quarter-res target and the
 * defocus taps — the composite still runs, so the grade, vignette, grain and tone map survive on a
 * phone that can afford none of the rest.
 */
export function makePost(width: number, height: number, pixelRatio: number, quality: 0 | 1): PostChain {
  const w = Math.max(2, Math.round(width * pixelRatio));
  const h = Math.max(2, Math.round(height * pixelRatio));
  const bw = Math.max(2, Math.round(w / 4));
  const bh = Math.max(2, Math.round(h / 4));

  const sceneTarget = target(w, h);

  /*
   * THE DEPTH TEXTURE.
   *
   * Full integer precision, and NEAREST filtering.
   *
   * Sixteen bits is not enough here. The defocus compares a reconstructed distance against a focus
   * plane, and at sixteen bits the reconstruction quantises into visible SHELLS — concentric bands
   * of differing blur across a smooth wall, which is far more noticeable than no defocus at all.
   * The renderer is WebGL2, where a 24-bit depth attachment is universally available.
   *
   * Filtering a depth buffer is meaningless — the average of two depths is a surface that is not
   * there — and on the silhouette of the product it produces a one-pixel halo of invented
   * mid-distance that the defocus then blurs, which looks exactly like a badly cut-out object.
   */
  const depth = new DepthTexture(w, h, UnsignedIntType);
  depth.minFilter = NearestFilter;
  depth.magFilter = NearestFilter;
  sceneTarget.depthTexture = depth;

  const brightTarget = target(bw, bh);
  const blurTarget = target(bw, bh);

  const brightMaterial = new ShaderMaterial({
    vertexShader: QUAD_VERTEX,
    fragmentShader: BRIGHT,
    uniforms: { uScene: { value: sceneTarget.texture }, uThreshold: { value: 0.62 }, uKnee: { value: 0.28 } },
  });
  const blurMaterial = new ShaderMaterial({
    vertexShader: QUAD_VERTEX,
    fragmentShader: BLUR,
    uniforms: { uSource: { value: null }, uDirection: { value: new Vector2() } },
  });
  const compositeMaterial = new ShaderMaterial({
    vertexShader: QUAD_VERTEX,
    fragmentShader: COMPOSITE,
    uniforms: {
      uScene: { value: sceneTarget.texture },
      uBloom: { value: blurTarget.texture },
      uDepth: { value: depth },
      uBloom_: { value: 0.6 },
      uVignette: { value: 0.8 },
      uGrain: { value: 0.026 },
      uAberration: { value: 0.0042 },
      uExposure: { value: 1 },
      uTime: { value: 0 },
      uNear: { value: 0.1 },
      uFar: { value: 120 },
      uFocus: { value: 6 },
      uAperture: { value: 0 },
      uVelocity: { value: 0 },
      uDof: { value: quality },
      uResolution: { value: new Vector2(w, h) },
    },
  });

  const bright = quad(brightMaterial);
  const blur = quad(blurMaterial);
  const composite = quad(compositeMaterial);

  let size = { w, h, bw, bh };

  return {
    scene: sceneTarget,

    setSize(nextWidth, nextHeight, ratio) {
      const nw = Math.max(2, Math.round(nextWidth * ratio));
      const nh = Math.max(2, Math.round(nextHeight * ratio));
      sceneTarget.setSize(nw, nh);
      brightTarget.setSize(Math.max(2, nw >> 2), Math.max(2, nh >> 2));
      blurTarget.setSize(Math.max(2, nw >> 2), Math.max(2, nh >> 2));
      compositeMaterial.uniforms.uResolution!.value.set(nw, nh);
      size = { w: nw, h: nh, bw: Math.max(2, nw >> 2), bh: Math.max(2, nh >> 2) };
    },

    setClip(near, far) {
      compositeMaterial.uniforms.uNear!.value = near;
      compositeMaterial.uniforms.uFar!.value = far;
    },

    render(renderer, time, grade) {
      if (quality === 1) {
        renderer.setRenderTarget(brightTarget);
        renderer.render(bright.scene, bright.camera);

        blurMaterial.uniforms.uSource!.value = brightTarget.texture;
        blurMaterial.uniforms.uDirection!.value.set(1 / size.bw, 0);
        renderer.setRenderTarget(blurTarget);
        renderer.render(blur.scene, blur.camera);

        blurMaterial.uniforms.uSource!.value = blurTarget.texture;
        blurMaterial.uniforms.uDirection!.value.set(0, 1 / size.bh);
        renderer.setRenderTarget(brightTarget);
        renderer.render(blur.scene, blur.camera);

        compositeMaterial.uniforms.uBloom!.value = brightTarget.texture;
      }

      compositeMaterial.uniforms.uBloom_!.value = quality === 1 ? grade.bloom : 0;
      compositeMaterial.uniforms.uVignette!.value = grade.vignette;
      compositeMaterial.uniforms.uExposure!.value = grade.exposure;
      compositeMaterial.uniforms.uFocus!.value = grade.focus;
      compositeMaterial.uniforms.uAperture!.value = grade.aperture;
      compositeMaterial.uniforms.uVelocity!.value = grade.velocity;
      compositeMaterial.uniforms.uTime!.value = time;

      renderer.setRenderTarget(null);
      renderer.render(composite.scene, composite.camera);
    },

    dispose() {
      sceneTarget.dispose();
      depth.dispose();
      brightTarget.dispose();
      blurTarget.dispose();
      brightMaterial.dispose();
      blurMaterial.dispose();
      compositeMaterial.dispose();
    },
  };
}
