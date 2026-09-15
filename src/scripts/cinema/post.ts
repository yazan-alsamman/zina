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
 *   3  COMPOSITE     bloom + halation + chromatic aberration + vignette + grain + tone map
 *
 * HALATION is the detail that matters most. On film, bright highlights scatter in the emulsion
 * and bleed WARM — it is why a beauty campaign glows pink-gold around the edge of a lit cheek and
 * a rendered image does not. The composite tints the bloom towards rose before adding it.
 */
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
  WebGLRenderer,
  LinearFilter,
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
  uniform float uBloom_;      // strength
  uniform float uVignette;
  uniform float uGrain;
  uniform float uAberration;
  uniform float uExposure;
  uniform float uTime;
  uniform vec2  uResolution;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  /* ACES, the filmic curve. It is what keeps a bright highlight from going flat white and a
     saturated rose from going orange as it clips. */
  vec3 aces(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    vec2 off = (uv - 0.5);
    float r2 = dot(off, off);

    /* Chromatic aberration, radial and only at the edges — the way a fast lens behaves wide open.
       Pulling only the red and blue channels keeps luminance detail intact. */
    vec2 ca = off * r2 * uAberration;
    vec3 c;
    c.r = texture2D(uScene, uv + ca).r;
    c.g = texture2D(uScene, uv).g;
    c.b = texture2D(uScene, uv - ca).b;

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
       digital noise across the highlights, which is the opposite of the intent. */
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float g = (hash(uv * uResolution + fract(uTime) * 91.7) - 0.5);
    c += g * uGrain * (1.25 - l);

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

export interface PostChain {
  scene: WebGLRenderTarget;
  setSize(width: number, height: number, pixelRatio: number): void;
  render(renderer: WebGLRenderer, time: number, grade: { bloom: number; vignette: number; exposure: number }): void;
  dispose(): void;
}

/**
 * "quality" 1 is the full chain. 0 drops the two blur passes and the quarter-res target — the
 * composite still runs, so the grade, vignette, grain and tone map survive on a phone that cannot
 * afford the bloom.
 */
export function makePost(width: number, height: number, pixelRatio: number, quality: 0 | 1): PostChain {
  const w = Math.max(2, Math.round(width * pixelRatio));
  const h = Math.max(2, Math.round(height * pixelRatio));
  const bw = Math.max(2, Math.round(w / 4));
  const bh = Math.max(2, Math.round(h / 4));

  const sceneTarget = target(w, h);
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
      uBloom_: { value: 0.6 },
      uVignette: { value: 0.8 },
      uGrain: { value: 0.026 },
      uAberration: { value: 0.0042 },
      uExposure: { value: 1 },
      uTime: { value: 0 },
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
      compositeMaterial.uniforms.uTime!.value = time;

      renderer.setRenderTarget(null);
      renderer.render(composite.scene, composite.camera);
    },

    dispose() {
      sceneTarget.dispose();
      brightTarget.dispose();
      blurTarget.dispose();
      brightMaterial.dispose();
      blurMaterial.dispose();
      compositeMaterial.dispose();
    },
  };
}
