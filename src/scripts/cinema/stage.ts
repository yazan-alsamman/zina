/**
 * THE STAGE — one WebGL context, one scroll, one continuous take.
 *
 * ============================================================================
 * WHAT THIS IS
 * ============================================================================
 * The film page's DOM is a STORYBOARD: seven stacked sections, each with one of Zina's
 * photographs and one line of type. That storyboard is the real page — it is what a reader gets
 * with no JavaScript, no WebGL or Save-Data on, and it is complete and readable on its own.
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
 *    camera never teleports, so the piece reads as one take. Each transition has its OWN curve —
 *    a push onto a face and a crane out to a wide are not the same move (see motion.ts).
 *  - SCRUBBED, NOT TRIGGERED. Scroll drives a target; the loop eases towards it at a rate defined
 *    in SECONDS rather than in frames, so the edit is identical at 30, 60 and 120 Hz.
 *  - A REAL LENS. Focus is a distance in world units and the post chain defocuses by scene depth,
 *    so the film can rack focus from the product to her without moving the camera.
 *  - LIGHT IS DIRECTED. Every beat carries its own lighting state, and the studio the materials
 *    reflect TURNS across the film, which is what sweeps the highlight along the glass.
 *  - THE PRODUCT IS REAL 3D, with real refraction and a contact shadow. It is an ORIGINAL package
 *    from the site's own catalogue, never a depiction of a product Zina reviewed.
 *  - NOTHING IS FETCHED. The textures are made from the storyboard's already-loaded <img>
 *    elements, so the film costs no image request beyond the page a reader already has.
 *
 * ============================================================================
 * REDUCED MOTION GETS A CUT, NOT A REFUSAL
 * ============================================================================
 * This module used to be skipped entirely when a reader asked for reduced motion. That was
 * defensible — the storyboard is a complete page — but it is not the best available answer, and
 * it treated an accessibility preference as a binary kill switch rather than as what it is: a
 * request to remove the motion that triggers nausea, which is a much smaller set than "all
 * motion". The reduced cut below keeps every photograph, every caption, the whole lighting arc and
 * the night-to-morning transformation, and removes the camera travel, the parallax, the rotation
 * and the drift. See `REDUCED` for the reasoning on each.
 */
import {
  ACESFilmicToneMapping,
  CatmullRomCurve3,
  Color,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import type { CosmeticKind, CosmeticTint } from "../cosmetics/models";
import { makeDust, makeHaze, makeMotes, makeShafts } from "./atmosphere";
import { bakeStudio, makeRig } from "./lighting";
import { clamp01, clamp, FILM_HALF_LIFE, lerp, makeGovernor, makeTransport, MAX_STEP } from "./motion";
import { makePortrait, type PortraitPlane } from "./portrait";
import { makePost } from "./post";
import { mountProduct } from "./product";
import { mountProps, type FaceZone } from "./props";
import { captionOpacity, forPortraitViewport, SCENES, smoothstep, span, type Scene as Beat } from "./timeline";

/** Night, and morning. Everything between is an interpolation of these two. */
const HAZE_NIGHT = { top: new Color("#29231d"), bottom: new Color("#0a0806"), glow: new Color("#817262") };
/* Morning, held back from white. At #eaeaea the backdrop went to near-paper behind a lit face and
   the last three beats read as blown rather than as bright; both values are still palette colours
   (nude and sand), so the film ends warm rather than washed. */
const HAZE_DAY = { top: new Color("#d9d2ca"), bottom: new Color("#ccc0b3"), glow: new Color("#c5b4a3") };

/**
 * THE REDUCED CUT.
 *
 * One fixed camera, for the whole film. It is a composed wide that holds both subjects — close
 * enough that she is not a detail, far enough that the object is never cropped — and it NEVER
 * MOVES. Not slowly, not a little: a slow camera move is worse for a vestibular reader than a fast
 * one, because it is sustained.
 *
 * What still happens, because none of it implies self-motion: the photographs cross-dissolve, the
 * light travels through its whole arc, the world turns from night to morning, the product lights
 * and gains its shadow, and the captions fade. The story is entirely intact. It is the same film,
 * shot from one locked-off position — which is a real and respectable way to shoot a film.
 */
const REDUCED = {
  at: new Vector3(0.1, 0.0, 6.1),
  to: new Vector3(0.0, -0.04, -0.9),
  fov: 34,
  focus: 7.0,
  /* Stopped right down. Depth of field is not vestibular, but a shallow frame in a locked-off shot
     puts the only visible change in the film into a blur ramp, and that reads as an eye problem. */
  aperture: 0.12,
  /* One fixed density for the whole cut, so the set is present but never grows or recedes. */
  props: 0.45,
};

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
  /*
   * NOTHING IS ALLOCATED BEFORE THIS.
   *
   * The guard used to sit after the renderer, the baked studio, the light rig and both particle
   * systems had been built — so a storyboard that somehow shipped without photographs left a live
   * WebGL context, a PMREM texture and two geometry buffers on the GPU with no way to reach them
   * again. It costs nothing to ask first.
   */
  if (mounts.frames.length === 0) return;

  const root = document.documentElement;
  const small = window.matchMedia("(max-width: 767px)").matches;
  const portraitViewport = window.innerHeight > window.innerWidth;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = motionQuery.matches;

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

  /*
   * REFRACTION IS A DESKTOP LUXURY.
   *
   * Real transmission costs an extra render of the scene into a target every frame. With one small
   * object in one viewport that is affordable on a laptop and it is not on a phone, where the
   * two-shell glass it replaces is a perfectly respectable bottle. Reduced motion gets it too —
   * refraction is a material property, not a movement.
   */
  const refraction = !small;

  const basePixelRatio = Math.min(window.devicePixelRatio || 1, small ? 1.4 : 1.75);
  const governor = makeGovernor();
  let pixelRatio = basePixelRatio;

  renderer.setPixelRatio(pixelRatio);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.setClearColor(0x000000, 1);
  mounts.stage.appendChild(canvas);

  /* ---------------------------------------------------------------- the world */

  const scene = new Scene();
  /*
   * NEAR 0.5, FAR 40 — and both numbers are load-bearing now.
   *
   * They used to be 0.1 and 120, which is the shape of a default rather than a decision. A depth
   * buffer spends almost all of its precision between the near plane and a small multiple of it,
   * so a near plane twelve hundred times closer than the far one leaves the range the film
   * actually occupies — two to seventeen units — quantised into almost nothing. That did not
   * matter while nothing read the depth buffer. The defocus reads it, and at the old numbers it
   * banded into visible shells.
   *
   * Nothing is ever closer to the lens than about 1.2 units (the dust fades out below that and the
   * nearest plane is further still), and the furthest thing in the film is the backdrop at a
   * little under 17. The new planes clear both with room to spare.
   */
  const camera = new PerspectiveCamera(30, 1, 0.5, 40);

  /*
   * A PURPOSE-BUILT STUDIO, not the stock RoomEnvironment.
   *
   * What a polished bottle looks like is almost entirely a function of what it reflects, and the
   * stock room is a neutral grey box — which put a flat grey wash into every reflective surface in
   * a film whose identity has no grey in it. `bakeStudio` is a beauty set: a tall key panel, a
   * hard edge strip, a broad overhead and a warm bounce card, in a dark warm room. See lighting.ts.
   */
  const environment = bakeStudio(renderer);
  scene.environment = environment;
  scene.environmentIntensity = 0.5;

  const rig = makeRig();
  scene.add(rig.group);

  const haze = makeHaze();
  scene.add(haze.mesh);

  const shafts = makeShafts();
  for (const shaft of shafts) scene.add(shaft.mesh);

  const dust = makeDust(small ? 260 : 700);
  scene.add(dust.points);

  const motes = makeMotes(small ? 90 : 240);
  scene.add(motes.points);

  /* ---------------------------------------------------------------- the portraits */

  const planeGeometry = new PlaneGeometry(1, 1, 1, 1);
  const portraits: PortraitPlane[] = mounts.frames.map((image) => {
    const plane = makePortrait(image, planeGeometry);
    plane.mesh.visible = false;
    scene.add(plane.mesh);
    return plane;
  });

  /* ---------------------------------------------------------------- the product */

  const product = mountProduct({ kind: mounts.kind, tint: mounts.tint, refraction });
  scene.add(product.group);

  /* ---------------------------------------------------------------- the set */

  /*
   * The beauty props. Built from the same catalogue as the hero product, lit by the same baked
   * studio, defocused by the same depth buffer — no new light, material, texture or pass. They are
   * placed in CAMERA SPACE rather than on world orbits, which is what keeps their framing and
   * their apparent size constant while the camera travels. See props.ts.
   */
  const props = mountProps({ small });
  scene.add(props.group);

  /* ---------------------------------------------------------------- the camera path */

  const beats: Beat[] = portraitViewport ? SCENES.map(forPortraitViewport) : SCENES;
  const eye = new CatmullRomCurve3(beats.map((b) => new Vector3(...b.shot.at)), false, "catmullrom", 0.4);
  const look = new CatmullRomCurve3(beats.map((b) => new Vector3(...b.shot.to)), false, "catmullrom", 0.4);
  const eyeAt = new Vector3();
  const lookAt = new Vector3();

  /* ---------------------------------------------------------------- post */

  /* The bloom chain is dropped on a phone; the composite — grade, vignette, grain, tone map —
     always runs. The defocus rides with the bloom, because both are the same affordability
     question and answering it twice would mean two code paths where one will do. */
  const post = makePost(1, 1, pixelRatio, small ? 0 : 1);
  post.setClip(camera.near, camera.far);

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
    renderer.setPixelRatio(pixelRatio);
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

  /**
   * THE TRANSPORT. Where the scroll says we are, where the camera actually is, and how hard the
   * reader is currently scrolling — all frame-rate independent. See motion.ts.
   *
   * The reduced cut gives it a half-life of zero, which makes it snap. There is no camera to lag
   * behind the scroll in that cut, so a chase would only delay the cross-dissolves.
   */
  const transport = makeTransport();
  /* Zero means "do not chase": in the reduced cut there is no camera travelling behind the scroll,
     so a chase would only delay the cross-dissolves without moving anything. */
  transport.setHalfLife(reduced ? 0 : FILM_HALF_LIFE);

  let frameRequested = false;
  let running = false;
  let onScreen = true;
  let last = performance.now();
  const started = last;

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
    transport.seek(travel <= 0 ? 0 : clamp01(-rect.top / travel));
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

  const grade = { bloom: 0.6, vignette: 1, exposure: 1, focus: 6, aperture: 0, velocity: 0 };

  /* Where her face is this frame, in world units, and how strongly the plane that supplied it is
     present. The props keep out of it — see props.ts. */
  const faceZone: FaceZone = { x: 0, y: 0, z: -1, radius: 1 };
  let faceWeight = 0;

  function frame(now: number): void {
    frameRequested = false;
    const dt = clamp((now - last) / 1000, 0, MAX_STEP);
    last = now;
    if (document.hidden || width < 2 || height < 2) return;

    /*
     * TIME STOPS IN THE REDUCED CUT.
     *
     * Every idle animation in the film — the dust drift, the rising powder, the turning shafts,
     * the product's breathing rotation, the crawling grain — is a function of this one number.
     * Freezing it is therefore the whole of "stop the ambient motion", in one line, with no risk
     * of missing one.
     */
    const time = reduced ? 0 : (now - started) / 1000;

    transport.advance(dt);

    const p = transport.position;
    /* `t` is camera time and runs through this beat's own curve; `light` is light time and runs
       through the neutral one. See span() in timeline.ts for why they are not the same number. */
    const { from, to, t, light, index } = span(beats, p);
    const velocity = reduced ? 0 : transport.velocity;

    /* ---- camera */
    if (reduced) {
      camera.position.copy(REDUCED.at);
      camera.up.set(0, 1, 0);
      camera.lookAt(REDUCED.to);
      camera.fov = REDUCED.fov;
    } else {
      eye.getPointAt(clamp01(p), eyeAt);
      look.getPointAt(clamp01(p), lookAt);
      camera.position.copy(eyeAt);
      /*
       * ROLL, APPLIED THROUGH THE UP VECTOR.
       *
       * `lookAt` resolves orientation against `camera.up`, so tilting up before the look is the
       * cheapest correct way to roll a camera — it survives the look-at, where a rotation applied
       * afterwards would be overwritten by the next frame's. The angle is hundredths of a radian
       * and changes across the film; it is never seen, only felt.
       */
      const roll = lerp(from.shot.roll, to.shot.roll, t);
      camera.up.set(Math.sin(roll), Math.cos(roll), 0);
      camera.lookAt(lookAt);
      camera.fov = lerp(from.shot.fov, to.shot.fov, t);
    }
    camera.updateProjectionMatrix();

    /* ---- grade and lens */
    const exposure = lerp(from.grade.exposure, to.grade.exposure, light);
    const lift = lerp(from.grade.lift, to.grade.lift, light);
    grade.bloom = lerp(from.grade.bloom, to.grade.bloom, light);
    grade.vignette = lerp(from.grade.vignette, to.grade.vignette, light);
    grade.exposure = 1;
    grade.velocity = Math.abs(velocity);
    grade.focus = reduced ? REDUCED.focus : lerp(from.lens.focus, to.lens.focus, t);
    grade.aperture = reduced ? REDUCED.aperture : lerp(from.lens.aperture, to.lens.aperture, t);
    const tint = [0, 1, 2].map((i) => lerp(from.grade.tint[i]!, to.grade.tint[i]!, light));

    /* ---- the world turns from night to morning */
    const dawn = clamp01((p - 0.6) / 0.4);
    haze.material.uniforms.uTop!.value.lerpColors(HAZE_NIGHT.top, HAZE_DAY.top, dawn);
    haze.material.uniforms.uBottom!.value.lerpColors(HAZE_NIGHT.bottom, HAZE_DAY.bottom, dawn);
    haze.material.uniforms.uGlow!.value.lerpColors(HAZE_NIGHT.glow, HAZE_DAY.glow, dawn * 0.8);
    haze.material.uniforms.uGlowAt!.value = 0.5 + Math.sin(p * 3.1) * 0.12;

    /* ---- the lighting, which is directed per beat rather than derived from a ramp */
    rig.apply(from.light, to.light, light, dawn);
    scene.environmentIntensity = lerp(from.light.environment, to.light.environment, light);
    /*
     * THE SWEEP. Turning the baked studio travels every specular highlight in the film across
     * every polished surface at once — the reflection of a real panel moving through a real room,
     * which is a thing no amount of sliding a gradient over a material can imitate.
     */
    scene.environmentRotation.y = rig.sweepAt(from.light, to.light, light);

    /* ---- atmosphere */
    dust.material.uniforms.uTime!.value = time;
    dust.material.uniforms.uDensity!.value = lerp(from.air, to.air, light);
    dust.material.uniforms.uSize!.value = small ? 0.8 : 1;
    motes.material.uniforms.uTime!.value = time;
    motes.material.uniforms.uDensity!.value = lerp(from.motes, to.motes, light);
    motes.material.uniforms.uSize!.value = small ? 0.75 : 1;
    motes.points.visible = motes.material.uniforms.uDensity!.value > 0.01;
    for (const shaft of shafts) {
      if (!reduced) shaft.mesh.rotation.z += shaft.drift * 0.016;
      shaft.material.opacity = shaft.base * lerp(1, 0.18, dawn) * (0.45 + grade.bloom * 0.55);
    }

    /* ---- the photographs */
    faceWeight = 0;
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

      /*
       * A SHORT DISSOLVE, HELD BETWEEN LONG CLEAN FRAMES.
       *
       * Every photograph in this film is the same face at a similar scale, and a cross-fade run
       * across the whole span between two beats therefore spends most of that span showing two
       * sets of eyes at half opacity each — a double exposure, not a dissolve. It was visible for
       * roughly an eighth of the film.
       *
       * The honest fix is not a cleverer blend, it is a SHORTER one. A dissolve is compressed into
       * the middle third of each transition: either side of it exactly one photograph is on screen
       * at full strength, so the beats hold longer and cleaner and the doubling is reduced to a
       * brief pass rather than a sustained state. This is how the cut would be timed on a bench.
       *
       * (A hard wipe was tried first and was worse. The reveal front is ordered by the image's own
       * luminance, so wiping one photograph over another composites her face inside her own face,
       * with visible seams. That front exists to bring her out of DARKNESS, which is what beat zero
       * uses it for, and it is not a transition between two lit frames.)
       */
      const cut = smoothstep(0.34, 0.66, t);
      const reveal = isFrom && isTo ? 1 : isTo ? cut : 1 - cut;
      /*
       * The opening is the one place the reveal is not a cross-dissolve but the depth-ordered
       * emergence the shader was written for — she arrives out of the dark, nearest first.
       *
       * IT STARTS ABOVE ZERO, and that floor is the difference between an opening shot and an
       * empty one. At a literal zero the first screenful of the film was a brown void with two
       * light shafts and a line of type on it: nothing to look at, and no reason to believe
       * anything was coming. A sixth of the reveal shows only the nearest, brightest part of her
       * through the depth-ordered front — which is a silhouette in the dark, which is what the
       * beat was always described as.
       */
      const opening = index === 0 ? 0.3 + 0.7 * Math.pow(t, 0.75) : 1;

      const u = plane.material.uniforms;
      u.uReveal!.value = isFrom && isTo ? opening : reveal;
      u.uExposure!.value = exposure;
      u.uLift!.value = lift;
      u.uTint!.value.set(tint[0]!, tint[1]!, tint[2]!);
      u.uSaturation!.value = lerp(0.72, 1.04, clamp01((p - 0.15) / 0.7));
      u.uTime!.value = time;
      u.uGrain!.value = lerp(0.03, 0.01, dawn);
      u.uFeather!.value = lerp(0.52, 0.3, dawn);
      u.uVelocity!.value = velocity;
      /*
       * THE DISSOLVE IS TORN DURING A CUT AND CLEAN DURING A HOLD.
       *
       * A noise-shaped front is what stops a cross-dissolve reading as a wipe — but it is only
       * wanted while something is actually dissolving. Left on during a held shot it would put a
       * permanent soft mottle along the edge of the photograph, which is a texture, not an effect.
       */
      /*
       * THE DISSOLVE IS TORN DURING A CUT AND CLEAN DURING A HOLD.
       *
       * A noise-shaped front is what stops a cross-dissolve reading as a wipe — but it is only
       * wanted while something is actually dissolving. Left on during a held shot it would put a
       * permanent soft mottle along the edge of the photograph, which is a texture, not an effect.
       */
      u.uDissolve!.value = isFrom && isTo ? 0 : 0.46;
      /* Depth of field opens up at the beauty moment and closes again for the final wide. The
         SCENE's defocus now handles depth between objects; this is depth WITHIN one photograph,
         which no depth buffer can supply because the plane is flat. */
      u.uFocus!.value = index === 2 ? 0.9 : lerp(0.55, 0.15, clamp01((p - 0.1) / 0.6));
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

      /*
       * CROP TO THE FACE, NOT TO THE MIDDLE OF THE PICTURE.
       *
       * These photographs are 3:4 portraits with her head in the upper third. A plane scaled to
       * COVER a wide frame overflows vertically by a long way, and because it was centred on its
       * own midpoint the frame showed that midpoint — her collarbone. The film shipped with her
       * eyes cropped off the top in every beat, and the closest shot in the piece contained a
       * shoulder and a hand and no face at all.
       *
       * Shifting the plane by the distance between its centre and its focal point puts the face
       * where the middle used to be. The clamp is what keeps it honest: the plane may never move
       * so far that the frame runs off the edge of the photograph and shows the void behind it.
       */
      const overflowY = Math.max(0, (scale - visibleHeight) / 2);
      plane.mesh.position.y += clamp((plane.focusY - 0.5) * scale, -overflowY, overflowY);

      /*
       * WHERE HER FACE IS, for the props' exclusion zone.
       *
       * Taken from whichever plane is currently dominant. The plane has just been shifted so that
       * the photograph's own focal point sits at the centre of frame, so after that shift the
       * plane's centre IS the face. Its radius is about a third of the photograph's width, which
       * is roughly what a head occupies in a 3:4 portrait.
       */
      if (reveal >= faceWeight) {
        faceWeight = reveal;
        faceZone.x = plane.mesh.position.x;
        faceZone.y = plane.mesh.position.y;
        faceZone.z = plane.mesh.position.z;
        faceZone.radius = scale * plane.aspect * 0.34;
      }
      plane.mesh.lookAt(camera.position.x * 0.12, camera.position.y * 0.12, camera.position.z);
      /* PARALLAX IS TIER-ONE MOTION. It is the single most vestibular thing in the film — depth
         implied by differential movement is exactly the cue that triggers self-motion — so the
         reduced cut passes a strength of zero and the shader's displacement term vanishes. */
      plane.track(camera.position, reduced ? 0 : small ? 0.5 : 1);
    }

    /* ---- the product */
    /*
     * Position, scale and spin are composition and ride the camera's curve. The REVEAL is a
     * lighting event and rides light time — which is what makes the anticipation hold read as the
     * light finding the object rather than as a third of a beat where the page stopped.
     *
     * IN THE REDUCED CUT THE OBJECT IS STAGED ONCE AND NEVER RE-STAGED. Holding the camera still
     * and then growing the product from a quarter of its size to full across the scroll would put
     * the one thing back that a locked-off shot exists to remove: an object changing size in a
     * fixed frame is an object moving towards the viewer, which is exactly the depth cue that
     * triggers self-motion. Only its lighting still runs, and light is not motion.
     */
    if (reduced) {
      const fixed = beats[beats.length - 1]!.product;
      product.apply(
        { ...fixed, reveal: from.product.reveal },
        { ...fixed, reveal: to.product.reveal },
        t,
        light,
        time,
        0
      );
    } else {
      product.apply(from.product, to.product, t, light, time, p);
    }

    /*
     * ---- the set
     *
     * Density rides LIGHT time, with the grade and the air, because how dressed the world is is a
     * property of the world rather than of where the lens happens to be. `time` is the prop clock
     * and is already frozen under reduced motion, which stops every drift, bob and tumble at once
     * without this call needing to know that. The lens's live focus distance is passed because
     * every prop's depth is measured against it.
     */
    /*
     * IN THE REDUCED CUT THE SET IS DRESSED ONCE AND NEVER RE-DRESSED.
     *
     * The props' presence is a SCALE, and the two foreground shapes are large — up to two thirds of
     * the frame's height. Growing one of those from nothing to full size in a locked-off frame is
     * exactly the depth cue the locked-off camera exists to remove, so this cut holds them at a
     * single value and lets only the light move. It matches what the product staging already does.
     */
    props.apply(
      reduced ? REDUCED.props : lerp(from.props, to.props, light),
      time,
      camera,
      grade.focus,
      faceZone
    );

    /*
     * KEEP THE OBJECT INSIDE A NARROW FRAME — phone staging only.
     *
     * `forPortraitViewport` squeezes the whole composition toward the centre line by one factor,
     * which correctly preserves every element's position RELATIVE to the others. What it cannot
     * know is how wide the frame actually is, because that depends on the lens and the viewport at
     * the moment of rendering — and on a 390-wide phone the frame at the product's distance is
     * about a third of the width it is on a laptop.
     *
     * The result was visible and ugly: at the transformation beat the bottle was cut in half by
     * the right edge of the screen. This resolves the object's own width against the lens the same
     * way `portraitCover` resolves a photograph's, and slides it in only as far as it must go.
     *
     * DESKTOP IS DELIBERATELY EXEMPT. Several beats stage the product at or just past the frame
     * edge on purpose — the beauty moment shows a sliver of it and nothing more, because that shot
     * has one subject. Clamping there would drag a second subject into frame and rewrite a
     * composition that was verified as correct.
     */
    if (portraitViewport && product.group.visible) {
      const pz = product.group.position.z;
      const depth = Math.max(Math.abs(camera.position.z - pz), 0.4);
      const visibleH = 2 * depth * Math.tan((camera.fov * Math.PI) / 360);
      const visibleW = visibleH * camera.aspect;

      /* Where the middle of the frame actually is at the object's depth. The camera is not looking
         straight down its own z axis, so its x is not the centre of the picture. */
      const dirX = lookAt.x - camera.position.x;
      const dirZ = lookAt.z - camera.position.z;
      const centreX =
        Math.abs(dirZ) > 1e-4
          ? camera.position.x + dirX * ((pz - camera.position.z) / dirZ)
          : camera.position.x;

      /* A margin, so the object is never touching the edge it was just rescued from. */
      const limit = Math.max(0, visibleW / 2 - product.radius * product.group.scale.x - visibleW * 0.04);
      product.group.position.x = centreX + clamp(product.group.position.x - centreX, -limit, limit);
    }

    /* ---- the captions, which are the storyboard's own DOM */
    for (let i = 0; i < mounts.scenes.length; i++) {
      const copy = mounts.scenes[i]!.querySelector<HTMLElement>(".film-copy");
      if (!copy) continue;
      const o = captionOpacity(beats, i, p) * presence;
      copy.style.opacity = String(o);
      /*
       * TYPE THAT SITS IN THE FRAME RATHER THAN ON IT.
       *
       * A caption rises a little as it arrives and settles as it takes hold — and, off the
       * reduced cut, it also scales by a fraction of a percent, which is what a title does when it
       * is composited into a shot with a moving camera rather than laid over one. Both are removed
       * under reduced motion, where the type simply fades.
       */
      if (reduced) {
        copy.style.transform = "none";
      } else {
        const rise = (1 - o) * 14;
        const settle = 0.985 + o * 0.015;
        copy.style.transform = `translate3d(0, ${rise}px, 0) scale(${settle})`;
      }
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

    /*
     * THE GOVERNOR. If the machine is persistently missing frames, render fewer pixels.
     *
     * Measured rather than guessed from a user-agent string, because whether a device can afford
     * this is not a property of the device: the same laptop is fast on mains and throttled on
     * battery, and fast until a video call starts.
     */
    if (!reduced && governor.sample(dt)) {
      pixelRatio = basePixelRatio * governor.scale;
      resize();
    }

    /*
     * THE LOOP ONLY PERSISTS WHILE SOMETHING IS MOVING.
     *
     * In the full cut something always is — dust and shafts drift — so this keeps ticking while
     * the film is on screen. In the REDUCED cut nothing drifts at all, so once the camera has
     * caught the scroll the film is a still image and the loop stops dead until the next scroll
     * event. An idle reader on a reduced-motion machine costs zero frames a second, which is the
     * behaviour that preference is asking for in the first place.
     */
    if (!reduced || transport.position !== transport.target) request();
  }

  /* ---------------------------------------------------------------- wiring */

  /* The film only runs while it is on screen. Scrolled past, the loop simply stops re-requesting
     itself and the GPU goes quiet — there is no timer to clear and no state to unwind. */
  const visible = new IntersectionObserver(
    (entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting);
      if (onScreen) {
        /* The clock has been running while the loop was not. Without this the first frame back
           integrates the entire time spent off screen, and MAX_STEP is the only thing standing
           between that and a jump cut — better to simply not create the debt. */
        last = performance.now();
        request();
      }
    },
    { rootMargin: "20% 0px" }
  );
  visible.observe(mounts.track);

  /*
   * THE PREFERENCE CAN CHANGE WITHOUT A RELOAD.
   *
   * A reader toggling reduce-motion in their OS while the page is open gets no navigation event,
   * so a film that read the query once would keep moving for someone who has just asked it to
   * stop. Reacting live is the whole reason this is a listener and not a constant.
   */
  motionQuery.addEventListener("change", (event) => {
    reduced = event.matches;
    transport.setHalfLife(reduced ? 0 : FILM_HALF_LIFE);
    if (reduced) {
      /* Arrive immediately rather than dollying to the locked-off composition: a reader who has
         just asked for less motion should not be given one last camera move on the way out. */
      transport.snap();
      camera.up.set(0, 1, 0);
    }
    request();
  });

  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    /* Coming back from a hidden tab, the clock is stale by however long the tab was away. */
    last = performance.now();
    request();
  });

  resize();
  readScroll();
  /* The first frame is a composition, not a move: the film should open on its opening shot rather
     than dollying to it from wherever the transport happened to start. */
  transport.snap();
  request();
}
