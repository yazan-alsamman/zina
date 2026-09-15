/**
 * THE STAGE — one WebGL context, one scroll, one continuous take.
 *
 * ============================================================================
 * WHAT THIS IS
 * ============================================================================
 * The film page's DOM is a STORYBOARD: seven stacked sections, each with one of Zina's
 * photographs and one line of type. That storyboard is the real page — it is what a reader gets
 * with no JavaScript, no WebGL, Save-Data on, or reduced motion requested, and it is complete and
 * readable on its own.
 *
 * When the conditions allow, this module lifts that same content into a film. The photographs
 * become lit planes in a 3D scene; the captions stay the same DOM nodes and simply move to a
 * fixed overlay; the scroll stops being navigation and becomes a transport. Nothing is
 * duplicated, so there is one copy of every sentence for a search engine and a screen reader.
 *
 * ============================================================================
 * WHY IT LOOKS THE WAY IT DOES
 * ============================================================================
 *  - ONE CONTINUOUS CAMERA. The seven scenes are keyframes on a Catmull-Rom curve, not cuts. The
 *    camera never teleports, so the piece reads as one take.
 *  - SCRUBBED, NOT TRIGGERED. Scroll drives a target; the render loop eases towards it. Fast
 *    scrolling cannot break it into a different state, and slow scrolling is frame-accurate.
 *  - THE PRODUCT IS REAL 3D. The cosmetic is built from the site's own procedural catalogue and
 *    lit by the same PMREM studio environment as everywhere else, so glass, metal and lacquer
 *    behave. It is an ORIGINAL package, never a depiction of a product Zina reviewed.
 *  - NOTHING IS FETCHED. The textures are made from the storyboard's already-loaded <img>
 *    elements, so the film costs no image request beyond the page a reader already has.
 */
import {
  ACESFilmicToneMapping,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildCosmetic, type CosmeticKind, type CosmeticTint } from "../cosmetics/models";
import { makeDust, makeHaze, makeShafts } from "./atmosphere";
import { makePortrait, type PortraitPlane } from "./portrait";
import { makePost } from "./post";
import { captionOpacity, clamp01, forPortraitViewport, lerp, SCENES, span, type Scene as Beat } from "./timeline";

/** Night, and morning. Everything between is an interpolation of these two. */
const HAZE_NIGHT = { top: new Color("#1d0c15"), bottom: new Color("#070305"), glow: new Color("#5e2138") };
const HAZE_DAY = { top: new Color("#f6e7e3"), bottom: new Color("#e3cac4"), glow: new Color("#ffd9cf") };

export interface CinemaMounts {
  /** The element the canvas is pinned inside. */
  stage: HTMLElement;
  /** The tall element whose scroll length is the film's running time. */
  track: HTMLElement;
  /** One per beat, in order. Each one's `.film-copy` becomes a caption in the overlay. */
  scenes: HTMLElement[];
  /** The photographs, in document order. `Scene.portrait` in timeline.ts is an index into this. */
  frames: HTMLImageElement[];
  kind: CosmeticKind;
  tint: CosmeticTint;
}

export function startCinema(mounts: CinemaMounts): void {
  const root = document.documentElement;
  const small = window.matchMedia("(max-width: 767px)").matches;
  const portraitViewport = window.innerHeight > window.innerWidth;

  const canvas = document.createElement("canvas");
  canvas.className = "film-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("role", "presentation");

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  } catch {
    return; // The storyboard stays. It was never a fallback; it is the page.
  }

  const pixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.4 : 1.75);
  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor(0x000000, 1);
  mounts.stage.appendChild(canvas);

  /* ---------------------------------------------------------------- the world */

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 120);

  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environment = environment;
  scene.environmentIntensity = 0.5;

  /* A three-point rig that travels with the story. The key swings from behind the subject at the
     opening (rim only — she is a silhouette) round to the front by the beauty moment. */
  const key = new DirectionalLight("#fff0e6", 1.2);
  const fill = new DirectionalLight("#ffd9d2", 0.25);
  const rim = new DirectionalLight("#ffc2cf", 2.2);
  fill.position.set(-3, -0.6, 2);
  scene.add(key, fill, rim);

  const haze = makeHaze();
  scene.add(haze.mesh);

  const shafts = makeShafts();
  for (const shaft of shafts) scene.add(shaft.mesh);

  const dust = makeDust(small ? 260 : 700);
  scene.add(dust.points);

  /* ---------------------------------------------------------------- the portraits */

  const planeGeometry = new PlaneGeometry(1, 1, 1, 1);
  const portraits: PortraitPlane[] = mounts.frames.map((image) => {
    const plane = makePortrait(image, planeGeometry);
    plane.mesh.visible = false;
    scene.add(plane.mesh);
    return plane;
  });
  if (portraits.length === 0) return;

  /* ---------------------------------------------------------------- the product */

  const product = new Group();
  product.add(buildCosmetic(mounts.kind, mounts.tint));
  scene.add(product);

  /* ---------------------------------------------------------------- the camera path */

  const beats: Beat[] = portraitViewport ? SCENES.map(forPortraitViewport) : SCENES;
  const eye = new CatmullRomCurve3(beats.map((b) => new Vector3(...b.shot.at)), false, "catmullrom", 0.4);
  const look = new CatmullRomCurve3(beats.map((b) => new Vector3(...b.shot.to)), false, "catmullrom", 0.4);
  const eyeAt = new Vector3();
  const lookAt = new Vector3();

  /* ---------------------------------------------------------------- post */

  let post = makePost(1, 1, pixelRatio, small ? 0 : 1);

  /* ---------------------------------------------------------------- sizing */

  let width = 0;
  let height = 0;

  /*
   * SIZED FROM THE VIEWPORT, NOT FROM THE STAGE.
   *
   * The stage is a sticky box that is zero-tall until `cinema-live` is on the root, and that class
   * is only added once a frame has actually rendered. Measuring the stage therefore deadlocked:
   * the canvas could never be sized, so the drawing buffer stayed at its 300x150 default and was
   * stretched across the screen — which looked exactly like a soft, featureless fog, because it
   * was a 300x150 image of the scene blown up fifteen times.
   *
   * The stage IS the viewport whenever it is visible at all, so the viewport is the honest
   * measurement and it is available before the first frame.
   */
  function resize(): void {
    width = Math.max(2, window.innerWidth);
    height = Math.max(2, window.innerHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    post.setSize(width, height, pixelRatio);
    /* Sized to just cover the widest shot. At 34x20 the camera only ever saw the middle of the
       gradient, so the gradient never read — every frame got the centre colour, flat. */
    haze.mesh.scale.set(Math.max(17, camera.aspect * 13), 12, 1);
    request();
  }

  /* ---------------------------------------------------------------- scroll */

  /** Where the scroll says we are. */
  let target = 0;
  /** Where the camera actually is — eased, so a violent scroll still produces a smooth take. */
  let current = 0;
  let frameRequested = false;
  let running = false;
  let onScreen = true;
  const started = performance.now();

  /**
   * How much of the frame the film currently owns, 0-1.
   *
   * The canvas and the captions are both FIXED while the film is live, which means that without
   * this they would still be there after the track has scrolled away — the last caption sat
   * pinned over the coda's prose, and the last frame of the film hung in a band above it. The
   * film has to hand the screen back.
   */
  let presence = 1;

  function readScroll(): void {
    const rect = mounts.track.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    target = travel <= 0 ? 0 : clamp01(-rect.top / travel);
    /* Steep, and finished EARLY. A linear fade against the track's remaining height still left the
       last caption at four-tenths opacity over the coda's opening paragraph — a ghost line of
       display type through body copy. Presence is gone once less than a fifth of a screen of film
       remains, which is before the coda has anything on it to collide with. */
    const remaining = rect.bottom / Math.max(window.innerHeight, 1);
    const leaving = clamp01((remaining - 0.2) / 0.5);
    const arriving = clamp01((window.innerHeight - rect.top) / Math.max(window.innerHeight * 0.4, 1));
    presence = Math.min(leaving, arriving);
    request();
  }

  function request(): void {
    if (frameRequested || !onScreen) return;
    frameRequested = true;
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------- the take */

  const grade = { bloom: 0.6, vignette: 1, exposure: 1 };

  function frame(now: number): void {
    frameRequested = false;
    if (document.hidden || width < 2 || height < 2) return;

    const time = (now - started) / 1000;

    /* The easing that makes scrubbing feel like film transport rather than like a slider. The
       camera is always chasing the scroll, never snapped to it. */
    const delta = target - current;
    current += delta * 0.085;
    if (Math.abs(delta) < 0.00015) current = target;

    const p = current;
    const { from, to, t, index } = span(beats, p);

    /* ---- camera: one continuous curve, one continuous look-at */
    eye.getPointAt(clamp01(p), eyeAt);
    look.getPointAt(clamp01(p), lookAt);
    camera.position.copy(eyeAt);
    camera.lookAt(lookAt);
    camera.fov = lerp(from.shot.fov, to.shot.fov, t);
    camera.updateProjectionMatrix();

    /* ---- grade */
    const exposure = lerp(from.grade.exposure, to.grade.exposure, t);
    const lift = lerp(from.grade.lift, to.grade.lift, t);
    grade.bloom = lerp(from.grade.bloom, to.grade.bloom, t);
    grade.vignette = lerp(from.grade.vignette, to.grade.vignette, t);
    grade.exposure = 1;
    const tint = [0, 1, 2].map((i) => lerp(from.grade.tint[i]!, to.grade.tint[i]!, t));

    /* ---- the world turns from night to morning */
    const dawn = clamp01((p - 0.6) / 0.4);
    haze.material.uniforms.uTop!.value.lerpColors(HAZE_NIGHT.top, HAZE_DAY.top, dawn);
    haze.material.uniforms.uBottom!.value.lerpColors(HAZE_NIGHT.bottom, HAZE_DAY.bottom, dawn);
    haze.material.uniforms.uGlow!.value.lerpColors(HAZE_NIGHT.glow, HAZE_DAY.glow, dawn * 0.8);
    haze.material.uniforms.uGlowAt!.value = 0.5 + Math.sin(p * 3.1) * 0.12;

    /* ---- lights follow the story: rim at the opening, key by the beauty moment */
    const front = clamp01((p - 0.1) / 0.6);
    key.position.set(lerp(-2.4, 2.6, front), lerp(1.6, 2.2, front), lerp(-2.2, 3.4, front));
    key.intensity = lerp(0.35, 2.4, front);
    rim.position.set(lerp(2.8, -3.2, front), lerp(1.2, 0.6, front), lerp(-3.4, -2.6, front));
    rim.intensity = lerp(2.6, 0.9, front);
    fill.intensity = lerp(0.12, 0.6, dawn);
    scene.environmentIntensity = lerp(0.35, 1.05, front);

    /* ---- atmosphere */
    dust.material.uniforms.uTime!.value = time;
    dust.material.uniforms.uDensity!.value = lerp(from.air, to.air, t);
    dust.material.uniforms.uSize!.value = small ? 0.8 : 1;
    for (const shaft of shafts) {
      shaft.mesh.rotation.z += shaft.drift * 0.016;
      shaft.material.opacity = shaft.base * lerp(1, 0.18, dawn) * (0.45 + grade.bloom * 0.55);
    }

    /* ---- the photographs */
    const activeFrom = from.portrait;
    const activeTo = to.portrait;
    for (let i = 0; i < portraits.length; i++) {
      const plane = portraits[i]!;
      // Two planes can be live at once, cross-dissolving through the cut between two beats.
      const isFrom = activeFrom === i;
      const isTo = activeTo === i;
      if ((!isFrom && !isTo) || !plane.ready) {
        plane.mesh.visible = false;
        continue;
      }
      plane.mesh.visible = true;

      const reveal = isFrom && isTo ? 1 : isTo ? t : 1 - t;
      /* The opening is the one place the reveal is not a cross-dissolve but the depth-ordered
         emergence the shader was written for — she arrives out of the dark, nearest first. */
      const opening = index === 0 ? Math.pow(t, 0.75) : 1;

      const u = plane.material.uniforms;
      u.uReveal!.value = isFrom && isTo ? opening : reveal;
      u.uExposure!.value = exposure;
      u.uLift!.value = lift;
      u.uTint!.value.set(tint[0]!, tint[1]!, tint[2]!);
      u.uSaturation!.value = lerp(0.72, 1.04, clamp01((p - 0.15) / 0.7));
      u.uTime!.value = time;
      u.uGrain!.value = lerp(0.03, 0.01, dawn);
      u.uFeather!.value = lerp(0.52, 0.3, dawn);
      /* Depth of field opens up at the beauty moment and closes again for the final wide. */
      u.uFocus!.value = index === 2 ? 0.9 : lerp(0.55, 0.15, front);
      /* During the product hero she is behind the plane of focus, so the whole plane softens —
         she is the background of that shot, and a sharp face behind a product is two subjects. */
      u.uSoften!.value = index === 2 ? 0.55 * (isFrom ? 1 - t * 0.35 : t) : 0;

      const pos = isTo && !isFrom ? to.portraitAt : from.portraitAt;
      const posTo = isTo ? to.portraitAt : from.portraitAt;
      plane.mesh.position.set(
        lerp(pos[0], posTo[0], t),
        lerp(pos[1], posTo[1], t),
        lerp(pos[2], posTo[2], t)
      );
      /*
       * COVER, resolved against the lens. The plane's world size is derived from how much of the
       * frame it is meant to fill at its own distance, so the same beat reads the same way on a
       * cinema monitor and on a phone held upright — where a fixed world size left a third of the
       * frame as bare backdrop, because a 3:4 photograph is narrower than a 16:10 screen.
       */
      const distance = Math.max(Math.abs(camera.position.z - plane.mesh.position.z), 0.4);
      const visibleHeight = 2 * distance * Math.tan((camera.fov * Math.PI) / 360);
      const visibleWidth = visibleHeight * camera.aspect;
      const cover = Math.max(visibleWidth / plane.aspect, visibleHeight);
      const scale = cover * lerp(from.portraitCover, to.portraitCover, t);
      plane.mesh.scale.set(scale * plane.aspect, scale, 1);
      plane.mesh.lookAt(camera.position.x * 0.12, camera.position.y * 0.12, camera.position.z);
      plane.track(camera.position, small ? 0.5 : 1);
    }

    /* ---- the product */
    product.position.set(
      lerp(from.productAt[0], to.productAt[0], t),
      lerp(from.productAt[1], to.productAt[1], t),
      lerp(from.productAt[2], to.productAt[2], t)
    );
    const productScale = lerp(from.productScale, to.productScale, t);
    product.scale.setScalar(productScale);
    /* The orbit. Almost all of the rotation is spent in scene 2, where the object has the frame;
       elsewhere it turns slowly enough that you notice it only if you look. */
    product.rotation.y = lerp(from.productSpin, to.productSpin, t) + Math.sin(time * 0.12) * 0.05;
    product.rotation.x = Math.sin(time * 0.17) * 0.03;
    product.rotation.z = Math.sin(p * 2.4) * 0.06;
    product.visible = productScale > 0.02;

    /* ---- the captions, which are the storyboard's own DOM */
    for (let i = 0; i < mounts.scenes.length; i++) {
      const copy = mounts.scenes[i]!.querySelector<HTMLElement>(".film-copy");
      if (!copy) continue;
      const o = captionOpacity(beats, i, p) * presence;
      copy.style.opacity = String(o);
      // A caption drifts with the camera rather than sitting still on the glass.
      copy.style.transform = `translate3d(0, ${(1 - o) * 14}px, 0)`;
      copy.style.visibility = o < 0.02 ? "hidden" : "visible";
    }

    /* ---- render */
    canvas.style.opacity = String(presence);

    renderer.setRenderTarget(post.scene);
    renderer.clear();
    renderer.render(scene, camera);
    post.render(renderer, time, grade);

    if (!running) {
      running = true;
      root.classList.add("cinema-live");
    }

    /* The loop only persists while something is still moving: an idle reader at rest costs one
       frame, not sixty a second. Dust and shafts drift, so it keeps ticking while on screen. */
    request();
  }

  /* ---------------------------------------------------------------- wiring */

  /* The film only runs while it is on screen. Scrolled past, the loop simply stops re-requesting
     itself and the GPU goes quiet — there is no timer to clear and no state to unwind. */
  const visible = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      if (onScreen) request();
    },
    { rootMargin: "20% 0px" }
  );
  visible.observe(mounts.track);

  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", request);

  resize();
  readScroll();
  request();
}
