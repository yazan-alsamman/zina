/**
 * COSMETIC SCENE — one WebGL context for every floating product on a page.
 *
 * Browsers cap WebGL contexts (and each one costs memory), so the page never gets one canvas per
 * product. A single transparent, fixed, pointer-events:none canvas covers the viewport, and every
 * frame each VISIBLE slot is drawn into its own scissored viewport with its own camera. A slot is
 * just a DOM element — `<div data-cosmetic="serum">` — so layout, responsiveness and art
 * direction stay in CSS, where the rest of the design system lives.
 *
 * Motion language: slow float, gentle yaw, restrained cursor response, scroll parallax. Nothing
 * spins, bounces or accelerates. Under prefers-reduced-motion, products hold a still pose and the
 * scene only redraws when scrolling moves a slot.
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
import { buildCosmetic, COSMETIC_KINDS, type CosmeticKind, type CosmeticTint } from "./models";

interface Slot {
  element: HTMLElement;
  scene: Scene;
  camera: PerspectiveCamera;
  pivot: Group;
  shadow: Mesh;
  phase: number;
  depth: number;
  baseYaw: number;
  baseTilt: number;
  visible: boolean;
  key: DirectionalLight;
}

const TINTS: CosmeticTint[] = ["blush", "rose", "nude", "champagne", "wine"];

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

export function startScene(elements: HTMLElement[]): void {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const small = window.matchMedia("(max-width: 767px)").matches;

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
  renderer.toneMappingExposure = 0.92;
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
    const requested = element.dataset.cosmetic as CosmeticKind;
    const kind = COSMETIC_KINDS.includes(requested) ? requested : "serum";
    const tint = (TINTS.includes(element.dataset.tint as CosmeticTint) ? element.dataset.tint : "blush") as CosmeticTint;

    const scene = new Scene();
    scene.environment = environment;
    scene.environmentIntensity = 0.8;

    // A warm key light for glossy highlights and a cool-pink rim to separate glass from the page.
    const key = new DirectionalLight("#fff1ea", 1.6);
    key.position.set(2.5, 3, 4);
    const rim = new DirectionalLight("#ffc7d3", 1.1);
    rim.position.set(-3, 1.5, -2.5);
    scene.add(key, rim);

    const pivot = new Group();
    const product = buildCosmetic(kind, tint);
    pivot.add(product);
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
    camera.position.set(0, 0.3, 4.4);
    camera.lookAt(0, -0.05, 0);

    slots.push({
      element,
      scene,
      camera,
      pivot,
      shadow,
      key,
      phase: index * 1.7 + Math.random() * 0.6,
      depth: Number(element.dataset.depth ?? "0.5"),
      baseYaw: Number(element.dataset.yaw ?? "-0.45"),
      baseTilt: Number(element.dataset.tilt ?? "0"),
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
    { rootMargin: "120px 0px" }
  );
  slots.forEach((slot) => observer.observe(slot.element));

  /* ------------------------------------------------------------------ sizing */

  let width = 0;
  let height = 0;
  function resize(): void {
    width = document.documentElement.clientWidth;
    height = window.innerHeight;
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

  function frame(now: number): void {
    frameRequested = false;
    if (document.hidden) return;

    const still = reducedMotion.matches;
    const time = still ? 0 : (now - start) / 1000;

    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;

    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);

    let drew = false;
    for (const slot of slots) {
      if (!slot.visible) continue;
      const rect = slot.element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;
      if (rect.bottom < 0 || rect.top > height || rect.right < 0 || rect.left > width) continue;

      const t = time + slot.phase;
      const px = still ? 0 : pointer.x;
      const py = still ? 0 : pointer.y;
      // Scroll parallax: products nearer the viewer (higher depth) drift further.
      const centre = (rect.top + rect.height / 2) / height - 0.5;
      const parallax = still ? 0 : -centre * 0.28 * slot.depth;

      const float = Math.sin(t * 0.55) * 0.055;
      slot.pivot.position.y = float + parallax;
      slot.pivot.position.x = px * 0.05 * slot.depth;
      slot.pivot.rotation.y = slot.baseYaw + Math.sin(t * 0.21) * 0.38 + px * 0.32;
      slot.pivot.rotation.x = Math.sin(t * 0.33) * 0.045 + py * 0.14;
      slot.pivot.rotation.z = slot.baseTilt + Math.sin(t * 0.27) * 0.035;
      slot.pivot.scale.setScalar(1 + Math.sin(t * 0.4) * 0.012);

      // The key light follows the cursor slightly, so reflections slide across glass and metal.
      slot.key.position.set(2.5 + px * 1.6, 3 - py * 1.2, 4);

      const lift = float + parallax;
      slot.shadow.position.y = -1.08 + Math.min(lift, 0) * 0.3;
      (slot.shadow.material as MeshBasicMaterial).opacity = 0.5 - lift * 1.2;
      slot.shadow.scale.set(1 - lift * 0.8, 0.45 - lift * 0.3, 1);

      const aspect = rect.width / rect.height;
      slot.camera.aspect = aspect;
      // Keep the product's full height in frame on tall slots and its width on wide ones.
      slot.camera.position.z = aspect < 1 ? 4.4 / Math.max(aspect, 0.55) : 4.4;
      slot.camera.updateProjectionMatrix();

      const x = rect.left;
      const y = height - rect.bottom;
      renderer.setViewport(x, y, rect.width, rect.height);
      renderer.setScissor(x, y, rect.width, rect.height);
      renderer.render(slot.scene, slot.camera);
      drew = true;
    }

    if (!running && drew) {
      running = true;
      root.classList.add("cosmetics-live");
    }

    // Keep animating while anything is on screen; reduced motion redraws only on scroll/resize.
    if (drew && !still) requestFrame();
  }

  requestFrame();
}
