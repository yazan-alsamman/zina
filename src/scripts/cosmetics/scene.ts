/**
 * COSMETIC SCENE — one WebGL context for every floating product on a page.
 *
 * Browsers cap WebGL contexts (and each one costs memory), so the page never gets one canvas per
 * product. A single transparent, fixed, pointer-events:none canvas covers the viewport, and every
 * frame each CHOSEN slot is drawn into its own scissored viewport with its own camera. A slot is
 * just a DOM element — `<div data-cosmetic="serum">` — so layout, responsiveness and art
 * direction stay in CSS, where the rest of the design system lives.
 *
 * ============================================================================
 * PHASE 12 — CHOREOGRAPHY
 * ============================================================================
 * Phase 11 gave every slot the same behaviour: float, yaw, a little parallax. Phase 12 turns the
 * layer into a directed system with four ideas:
 *
 *  1. DEPTH LAYERS (`data-layer`). back / mid / fore. A layer sets how far the camera sits, how
 *     strongly the product answers the cursor and the scroll, and how present its shadow is.
 *     Background objects are small, slow and quiet; the foreground object is the one you look at.
 *
 *  2. A VISIBILITY BUDGET. However many slots a page declares, only the few most prominent are
 *     rendered each frame — 2 on phones, 3 on tablets, 5 on laptops, 6 on large desktops. This is
 *     what keeps a 24-object catalogue from becoming clutter: the system is large, the FRAME is
 *     not. Prominence is the slot's own art-direction priority plus how near the viewport centre
 *     it currently sits, so the composition hands off from one product to the next as you scroll.
 *
 *  3. SCROLL CHOREOGRAPHY. Each slot has its own normalised progress through the viewport, and
 *     that progress drives approach (the camera closes in), rotation (`data-spin`), drift and the
 *     key light's azimuth. A presence envelope scales each product up as it enters and lets it
 *     recede as it leaves, so nothing ever pops at the scissor edge.
 *
 *  4. TRAVEL RAILS (`data-path`). A slot may be a tall invisible RAIL rather than a fixed box.
 *     The product is then drawn into a small box that moves along a path inside that rail as the
 *     page scrolls — a product genuinely crossing a section, around and behind the editorial
 *     content. This is the "product journey"; it is used on a handful of sections, never all.
 *
 * Motion language is unchanged: slow float, gentle yaw, restrained cursor response. Nothing spins,
 * bounces or accelerates. Under prefers-reduced-motion, products hold a still pose at the middle
 * of their path and the scene only redraws when scrolling moves a slot.
 */
import {
  ACESFilmicToneMapping,
  CanvasTexture,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { budgetFor } from "./budget";
import { buildCosmetic, COSMETIC_FRAMING, COSMETIC_KINDS, type CosmeticKind, type CosmeticTint } from "./models";

/* ------------------------------------------------------------------ depth layers */

/**
 * The three depth levels. `distance` is a camera multiplier (further = the product reads smaller
 * and flatter), `response` scales cursor and scroll answer, `shadow` the contact shadow's weight.
 * A background bottle should feel like atmosphere; a foreground one like a product still life.
 */
const LAYERS = {
  back: { distance: 1.3, response: 0.35, shadow: 0.3, spin: 0.55, bias: -1.1 },
  mid: { distance: 1.12, response: 0.7, shadow: 0.62, spin: 0.85, bias: 0 },
  /* The foreground sits at the neutral distance — the closest the camera is allowed to be. Depth
     between the layers is therefore expressed by pushing the others BACK, never by pushing this
     one in, which is also how a real set is lit and staged. */
  fore: { distance: 1.0, response: 1, shadow: 1, spin: 1.15, bias: 1.3 },
} as const;

type LayerName = keyof typeof LAYERS;

interface Slot {
  element: HTMLElement;
  scene: Scene;
  camera: PerspectiveCamera;
  pivot: Group;
  shadow: Mesh;
  key: DirectionalLight;
  layer: (typeof LAYERS)[LayerName];
  /** Framing factor from the model catalogue times the layer distance. */
  reach: number;
  phase: number;
  depth: number;
  baseYaw: number;
  baseTilt: number;
  /** Radians of extra yaw travelled across the slot's scroll range. */
  spin: number;
  /** How much the camera closes in across the scroll range, 0–1. */
  approach: number;
  /** Art-direction weight in the visibility budget. */
  priority: number;
  /** Travel rail path in rail-normalised coordinates, or null for a fixed box. */
  path: { x: number; y: number }[] | null;
  /** The travelling box's size as a fraction of the rail's width. */
  size: number;
  visible: boolean;
}

const TINTS: CosmeticTint[] = ["blush", "rose", "nude", "champagne", "wine"];
/**
 * The neutral camera distance, in the units `normalise()` produces (every model is scaled to a
 * unit bounding SPHERE, so at 26° of field of view this frames any product with a small margin).
 * Nothing may ever move the camera CLOSER than this: a few per cent inside it and a tall bottle
 * is sliced off by its own scissor rectangle. Approach therefore starts further out and returns
 * here, rather than starting here and pushing in.
 */
const BASE_DISTANCE = 4.55;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

function shadowTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(94,31,51,0.55)");
  gradient.addColorStop(0.5, "rgba(94,31,51,0.18)");
  gradient.addColorStop(1, "rgba(94,31,51,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new CanvasTexture(canvas);
}

/** `data-path="0,0 0.7,0.5 0.1,1"` — points the travelling box moves between inside its rail. */
function parsePath(value: string | undefined): { x: number; y: number }[] | null {
  if (!value) return null;
  const points = value
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const parts = pair.split(",");
      const x = Number(parts[0]);
      const y = Number(parts[1]);
      return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 };
    });
  return points.length >= 2 ? points : null;
}

/** Position along a polyline path at t ∈ [0,1], with eased segments so corners are not sharp. */
function samplePath(path: { x: number; y: number }[], t: number): { x: number; y: number } {
  const span = path.length - 1;
  const scaled = clamp(t, 0, 1) * span;
  const index = Math.min(Math.floor(scaled), span - 1);
  const local = smoothstep(0, 1, scaled - index);
  const a = path[index]!;
  const b = path[index + 1]!;
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local };
}

export function startScene(elements: HTMLElement[]): void {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const small = window.matchMedia("(max-width: 767px)").matches;

  const styles = getComputedStyle(root);
  const readBreakpoint = (name: string, fallback: number) => {
    const parsed = Number.parseFloat(styles.getPropertyValue(name));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };
  const breakpoints = {
    md: readBreakpoint("--bp-md", 768),
    lg: readBreakpoint("--bp-lg", 1024),
    xl: readBreakpoint("--bp-xl", 1600),
  };

  const canvas = document.createElement("canvas");
  canvas.className = "cosmetic-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("role", "presentation");

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch {
    return; // No WebGL: the CSS glow fallback simply stays.
  }
  document.body.appendChild(canvas);

  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
  renderer.autoClear = false;

  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  pmrem.dispose();

  const shadowMap = shadowTexture();
  const slots: Slot[] = [];

  // Frame-loop state is declared before anything (resize, observers) can request a frame.
  let frameRequested = false;
  let running = false;
  const start = performance.now();

  elements.forEach((element, index) => {
    const data = element.dataset;
    const requested = data.cosmetic as CosmeticKind;
    const kind = COSMETIC_KINDS.includes(requested) ? requested : "serum";
    const tint = (TINTS.includes(data.tint as CosmeticTint) ? data.tint : "blush") as CosmeticTint;
    const layerName = (data.layer && data.layer in LAYERS ? data.layer : "mid") as LayerName;
    const layer = LAYERS[layerName];

    const onWine = data.light === "wine";
    const scene = new Scene();
    scene.environment = environment;
    /* On the wine ground there is no bright page for glass to reflect, so the studio environment
       has to supply what the room would: without this, a clear bottle on wine is a dark smear. */
    scene.environmentIntensity = onWine ? 1.35 : 1.0;

    /* STUDIO LIGHTING — one direction for the whole site, so products and photographs agree:
       a large warm softbox above and to the right, a soft ivory fill low on the left, and a pink
       rim behind that separates glass from the page. On the wine ground the rim carries more of
       the work, because there is no bright page left to silhouette against. */
    const key = new DirectionalLight("#fff1ea", onWine ? 1.75 : 1.6);
    key.position.set(2.5, 3, 4);
    const fill = new DirectionalLight("#fdeee6", onWine ? 0.3 : 0.45);
    fill.position.set(-2.6, -0.6, 2.2);
    const rim = new DirectionalLight(onWine ? "#ffd4de" : "#ffc7d3", onWine ? 1.9 : 1.1);
    rim.position.set(-3, 1.5, -2.5);
    scene.add(key, fill, rim);

    const pivot = new Group();
    pivot.add(buildCosmetic(kind, tint));
    scene.add(pivot);

    const shadow = new Mesh(
      new PlaneGeometry(1.5, 1.5),
      new MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, opacity: 0.55 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.08;
    shadow.scale.set(1, 0.45, 1);
    scene.add(shadow);

    const camera = new PerspectiveCamera(26, 1, 0.1, 50);
    camera.position.set(0, 0.3, BASE_DISTANCE);
    camera.lookAt(0, -0.05, 0);

    const number = (name: string, fallback: number) => {
      const parsed = Number(data[name]);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    slots.push({
      element,
      scene,
      camera,
      pivot,
      shadow,
      key,
      layer,
      // Framing and layer distance only ever push the camera BACK (both are >= 1); see above.
      reach: Math.max(COSMETIC_FRAMING[kind] ?? 1, 1) * layer.distance,
      phase: index * 1.7 + Math.random() * 0.6,
      depth: number("depth", 0.5),
      baseYaw: number("yaw", -0.45),
      baseTilt: number("tilt", 0),
      spin: number("spin", 0.5) * layer.spin,
      approach: clamp(number("approach", 0.35), 0, 1),
      priority: number("priority", 0) + layer.bias,
      path: parsePath(data.path),
      size: clamp(number("size", 1), 0.05, 1),
      visible: false,
    });
  });

  /* ------------------------------------------------------------------ visibility */

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const slot = slots.find((s) => s.element === entry.target);
        if (slot) slot.visible = entry.isIntersecting;
      }
      requestFrame();
    },
    { rootMargin: "140px 0px" }
  );
  slots.forEach((slot) => observer.observe(slot.element));

  /* ------------------------------------------------------------------ sizing */

  let width = 0;
  let height = 0;
  let budget = 0;
  function resize(): void {
    width = document.documentElement.clientWidth;
    height = window.innerHeight;
    budget = budgetFor(width, breakpoints);
    renderer.setSize(width, height, false);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    requestFrame();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* ------------------------------------------------------------------ pointer */

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  if (finePointer) {
    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.tx = (event.clientX / Math.max(width, 1)) * 2 - 1;
        pointer.ty = (event.clientY / Math.max(height, 1)) * 2 - 1;
        if (reducedMotion.matches) return;
        requestFrame();
      },
      { passive: true }
    );
  }

  /* ------------------------------------------------------------------ loop */

  function requestFrame(): void {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(frame);
  }

  window.addEventListener("scroll", requestFrame, { passive: true });
  document.addEventListener("visibilitychange", requestFrame);
  reducedMotion.addEventListener?.("change", requestFrame);

  /** One slot's geometry for this frame: where it is drawn and how far through its range it is. */
  interface Take {
    slot: Slot;
    x: number;
    y: number;
    w: number;
    h: number;
    /** 0 as the slot enters from the bottom, 1 as it leaves at the top. */
    progress: number;
    score: number;
  }

  const takes: Take[] = [];

  function frame(now: number): void {
    frameRequested = false;
    if (document.hidden) return;

    const still = reducedMotion.matches;
    const time = still ? 0 : (now - start) / 1000;

    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;

    /* MEASURE — every layout read happens here, before any write. Only slots the observer has
       reported as on screen are measured, so this is a handful of rects, never the whole page. */
    takes.length = 0;
    for (const slot of slots) {
      if (!slot.visible) continue;
      const rect = slot.element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue; // display:none at this breakpoint
      if (rect.bottom < 0 || rect.top > height || rect.right < 0 || rect.left > width) continue;

      // Progress is measured from the element's own passage across the viewport, so a tall rail
      // and a small fixed slot both run 0 → 1 exactly once.
      const travelled = height - rect.top;
      const span = height + rect.height;
      const progress = clamp(travelled / span, 0, 1);

      let x = rect.left;
      let y = height - rect.bottom;
      let w = rect.width;
      let h = rect.height;

      if (slot.path) {
        // A travel rail: the product occupies a small box that moves inside the rail.
        const size = rect.width * slot.size;
        const point = samplePath(slot.path, still ? 0.5 : progress);
        w = size;
        h = size;
        x = rect.left + point.x * (rect.width - size);
        y = height - rect.bottom + (1 - point.y) * (rect.height - size);
      }

      if (x + w < 0 || x > width || y + h < 0 || y > height) continue;

      // Prominence peaks when the slot sits at the middle of its range — the moment it is meant
      // to be looked at. Adding the art-direction priority lets a hero product hold the frame.
      const prominence = 1 - Math.abs(progress - 0.5) * 2;
      takes.push({ slot, x, y, w, h, progress, score: slot.priority + prominence * 2 });
    }

    // THE BUDGET. Everything beyond it is simply not drawn this frame.
    if (takes.length > budget) {
      takes.sort((a, b) => b.score - a.score);
      takes.length = budget;
    }

    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);

    for (const take of takes) {
      const slot = take.slot;
      const t = time + slot.phase;
      const response = slot.layer.response * slot.depth * 2;
      const px = still ? 0 : pointer.x;
      const py = still ? 0 : pointer.y;
      const p = still ? 0.5 : take.progress;
      const eased = smoothstep(0, 1, p);

      // Enter and leave: nothing ever appears or vanishes at full size.
      const presence = still ? 1 : smoothstep(0, 0.16, p) * (1 - smoothstep(0.84, 1, p) * 0.75);

      const float = still ? 0 : Math.sin(t * 0.55) * 0.055;
      const lift = float + (still ? 0 : (0.5 - p) * 0.3 * slot.layer.response);

      slot.pivot.position.y = lift;
      slot.pivot.position.x = px * 0.05 * response;
      // The scroll range turns the product: it arrives at one angle and leaves at another.
      slot.pivot.rotation.y = slot.baseYaw + slot.spin * (eased - 0.5) + (still ? 0 : Math.sin(t * 0.21) * 0.16) + px * 0.28 * slot.layer.response;
      slot.pivot.rotation.x = (still ? 0 : Math.sin(t * 0.33) * 0.045) + py * 0.12 * slot.layer.response;
      slot.pivot.rotation.z = slot.baseTilt + (still ? 0 : Math.sin(t * 0.27) * 0.035);
      slot.pivot.scale.setScalar(presence * (1 + (still ? 0 : Math.sin(t * 0.4) * 0.012)));

      // The key light swings with the cursor AND with the scroll, so highlights slide across
      // glass and metal as a product travels rather than sitting frozen on one facet.
      slot.key.position.set(2.5 + px * 1.6 - (eased - 0.5) * 1.8, 3 - py * 1.2, 4);

      const shadowMaterial = slot.shadow.material as MeshBasicMaterial;
      slot.shadow.position.y = -1.08 + Math.min(lift, 0) * 0.3;
      shadowMaterial.opacity = (0.5 - lift * 1.2) * slot.layer.shadow * presence;
      slot.shadow.scale.set(1 - lift * 0.8, 0.45 - lift * 0.3, 1);

      const aspect = take.w / take.h;
      /* APPROACH. The product is furthest away as it enters and leaves, and settles at the
         neutral distance when it reaches the middle of its range — so it reads as coming towards
         the reader without the camera ever crossing the line where the model would be clipped. */
      const centred = still ? 1 : 1 - Math.abs(p - 0.5) * 2;
      const reach = BASE_DISTANCE * slot.reach * (1 + slot.approach * 0.26 * (1 - centred));
      slot.camera.aspect = aspect;
      // Keep the product's full height in frame on tall slots and its width on wide ones.
      slot.camera.position.z = aspect < 1 ? reach / Math.max(aspect, 0.55) : reach;
      slot.camera.updateProjectionMatrix();

      renderer.setViewport(take.x, take.y, take.w, take.h);
      renderer.setScissor(take.x, take.y, take.w, take.h);
      renderer.render(slot.scene, slot.camera);
    }

    if (!running && takes.length > 0) {
      running = true;
      root.classList.add("cosmetics-live");
    }

    // Keep animating while anything is on screen; reduced motion redraws only on scroll/resize.
    if (takes.length > 0 && !still) requestFrame();
  }

  requestFrame();
}
