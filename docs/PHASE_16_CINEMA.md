# Phase 16 — The Film, Directed

Phase 14 built the film: seven beats, one continuous camera, Zina's photographs as lit planes, one
original 3D package, a compact post chain. Phase 16 does not rebuild it. It takes the same piece and
makes it a **directed** one — a real lens, a lighting plan, a product that earns its entrance, and a
transport that behaves the same in every hand.

Nothing outside `src/scripts/cinema/` and one guard in `boot.ts` changed. No new dependency. Still
one script per page.

---

## 1. What was actually wrong with it

The honest starting point, because "make it more cinematic" is not a defect list. Reading the Phase
14 implementation against what it was trying to be, five things were genuinely holding it back:

| | Defect | Why it mattered |
|---|---|---|
| 1 | **The easing was frame-rate dependent.** `current += gap * 0.085` once per animation frame. | The film was a *different edit on different hardware* — settling in 0.13 s at 60 Hz, 0.065 s at 120 Hz, 0.26 s at 30 Hz. The one thing a scrub must do is feel the same in every hand. |
| 2 | **Every transition used the same symmetric smoothstep.** | A push onto a face and a crane out to a wide have opposite dynamics in a real edit. Giving them one curve is reading every line at the same volume, and it is why the old cut read as even-handed to the point of characterless. |
| 3 | **There was no depth of field between objects.** The only defocus lived *inside* the photograph shader. | The product was pin-sharp in every frame it appeared in, including the ones where the camera is focused on her face two units behind it. A scene where everything at every distance is equally sharp is the readable signature of a render. |
| 4 | **Lighting was derived from two ramps in the render loop**, not directed. | There was no way to say "this beat is lit softer than the ones either side" without changing a ramp every other beat also read. |
| 5 | **Reduced motion refused the film outright.** | Defensible — the storyboard is a complete page — but it treated an accessibility preference as a kill switch rather than as what it is: a request to remove *vestibular* motion, which is a much smaller set than "all motion". |

Everything below follows from that list.

---

## 2. Skills: discovered, evaluated, installed, used

Discovery ran through the Skills CLI (`npx skills find …`) across three.js, WebGL, GLSL, GSAP,
ScrollTrigger, scroll animation, cinematic, motion design, creative frontend, performance and
reduced-motion accessibility. The local plugin marketplace was checked first and carries nothing in
this domain.

**Installed and read** (`.agents/skills/`, gitignored — vendored reference material, not source):
`threejs-shaders`, `threejs-materials`, `threejs-lighting`, `threejs-postprocessing`,
`threejs-animation`, `shader-glsl`, `accessible-animation`.

**Deliberately not installed**, because installing them would have been the opposite of following
them: the GSAP/ScrollTrigger family (58 K installs, and excellent) and the React Three Fiber family.
This project has no React and no GSAP, and its hardest budget rule is one small script per page.
Adding an animation library to a film that already scrubs a timeline off one scroll value would have
bought nothing and cost a dependency.

Three of the installed skills changed the implementation materially rather than decoratively:

- **`accessible-animation`** is the reason §7 exists at all. Its core argument — tier motion, do not
  nuke it; removing *all* animation is a common over-correction — is a direct challenge to what this
  film was doing, and it was right.
- **`threejs-lighting`** pointed at `RectAreaLight` for softbox lighting. Following it led to
  *rejecting* it and finding something better (§5).
- **`shader-glsl`** supplied the value-noise/fbm formulation behind the torn dissolve front (§6) and
  the constant-loop-bound and branch-avoidance rules the defocus is written to.

---

## 3. Scroll physics: one number, measured in seconds

`src/scripts/cinema/motion.ts` is new and imports no Three.js, which is the point — it is the part
of the film that can be run and asserted in Node.

**`damp(current, target, halfLife, dt)`** replaces the per-frame filter. A half-life is a duration:
half the remaining distance is covered in that many *seconds*, whatever the frame rate.
`FILM_HALF_LIFE` is 0.13 s, derived from the old filter's 60 Hz behaviour rather than re-tuned by
eye — so this is a correctness fix, not a re-timing, and `tests/cinema.test.mjs` asserts that the two
still settle to within 1 % over a second.

**The transport** turns a hostile input into three usable numbers:

- `position` — the eased place the whole film is a function of.
- `target` — where the scroll says we are.
- `velocity` — signed, smoothed over 0.32 s, and **clamped to ±1** at a ceiling of a quarter of the
  film per second.

Velocity is measured from the **camera's** movement, never the scroll's. A scroll can teleport — a
Home keypress, an anchor jump, a restored scroll position — and measuring that produces one enormous
spike that every downstream effect flinches at. The damped camera is continuous by construction. The
clamp is where the brief's *"must remain controlled even when the user scrolls rapidly"* is enforced:
once, at the source, rather than at each of the dozen places that read it.

`MAX_STEP` caps an integration step at 0.05 s, so a backgrounded tab handing the loop a ten-second
delta produces a slow catch-up rather than a jump cut.

**Six named curves**, each for a kind of move, and each beat names the one used to travel *into* it:

| Curve | Used for | Shape |
|---|---|---|
| `push` | the reveal | slow to leave, then committed — the acceleration says the move is a decision |
| `anticipate` | **the product hero** | holds ~still for the first third, then commits |
| `dolly` | the two-shot, the closing frame | gentle at both ends, never quite still in the middle |
| `settle` | the beauty moment | arrives early, then *holds* — a held close-up is the only kind worth having |
| `lift` | the transformation | heavy hold at both ends, the whole travel in the middle: a crane move |
| `smooth` | the default | the old symmetric ramp, kept for moves that should not draw attention |

`anticipate` is the one that earns its keep. Anticipation is built by *withholding* movement, and
there is no way to withhold movement inside a symmetric curve.

### Two clocks

`span()` returns two progress values, and the difference between them is the point.

- **`t` is camera time.** It runs through the destination beat's own curve, and it drives everything
  that is *composition*: camera position, lens, roll, focus, where the photograph sits and how much
  of the frame it covers, where the product stands and how far it has turned.
- **`light` is light time.** It runs through the neutral curve, always, and it drives everything that
  is *illumination*: the whole light rig, the environment sweep and intensity, the grade, the colour
  cast, the air, the powder, and the product's reveal.

They are separate because on a real set they are separate — a gaffer's cue and a dolly grip's push
are timed independently, and the moments where they disagree are most of what makes a sequence feel
directed rather than keyframed.

It is also the only reason the product reveal works. The first implementation of this phase had
lighting share the camera's curve, which meant the `anticipate` hold was a third of a beat in which
*nothing at all* changed. That does not read as anticipation; it reads as a stuck page. With its own
clock the hold becomes a third of a beat in which the light finds the object and the camera has not
moved yet — which is the shot that was wanted. The entrance is bought by withholding the *camera*,
not by withholding everything. Two tests pin it.

---

## 4. A real lens

`Lens { focus, aperture }` per beat. **Focus is a distance in world units**, not a scroll-space
number, because that is what a focus pull actually is: the plane of sharpness moving through the
scene while the camera may or may not be moving at all.

The scene render target now carries a **24-bit depth texture**, and the composite reads it:

- Depth is linearised back to a world distance.
- Circle of confusion is **angular** — `aperture * |dist − focus| / dist` — because a subject half a
  unit behind the focal plane at two units away is far softer than one half a unit behind it at ten.
  An absolute difference gets that backwards in exactly the wide shots where the frame has the most
  depth in it.
- The blur is a **twelve-tap golden-angle spiral**, not a gaussian. Out-of-focus highlights on a real
  lens are *discs*, and the round bokeh behind a lit bottle is most of why a shallow frame looks
  photographed. Each tap is weighted by its own defocus, so a sharp foreground cannot smear a halo
  into a soft background — the classic gather-DOF artefact, which is worse than no defocus at all.

**The camera's clipping planes became load-bearing.** They were `0.1 / 120`, which is the shape of a
default rather than a decision. A depth buffer spends almost all its precision near the near plane, so
a near plane 1,200× closer than the far one left the range the film actually occupies — 2 to 17 units
— quantised into almost nothing. That did not matter while nothing read depth. They are now `0.5 / 40`,
which clears the nearest visible thing (~1.2 units) and the backdrop (~17) with room to spare.

Also new: **camera roll**, applied through the up vector before the look-at (a rotation applied
afterwards would be overwritten next frame). Hundredths of a radian, changing across the film. It is
never seen, only felt — a camera perfectly level in every frame of a long move reads as what it is,
a motion-control rig.

---

## 5. Lighting: why there is no `RectAreaLight`

A softbox is the visual signature of beauty work — a large source close to the subject, laying a long
soft specular *stripe* down the shoulder of a bottle. `RectAreaLight` is the light that models one.

It was measured and rejected. It requires `RectAreaLightUniformsLib`, which carries the
linearly-transformed-cosine tables: **315 KB of float literals**, against an entire film chunk of
under 16 KB gzipped.

**What it does instead is better anyway.** A polished bottle does not look expensive because of what
lights it — it looks expensive because of what it *reflects*. The stripe down the glass on a real set
is an *image of the softbox*, mirrored in the shoulder. So the softboxes live in the environment:
`makeStudio()` builds a beauty set — a tall narrow key panel, a hard edge strip, a broad overhead, a
warm bounce card, a rear separation panel, in a dark warm room — and PMREM bakes it into the
image-based lighting every material reflects. Real area-light look, zero runtime cost, zero bundle cost.

The stock `RoomEnvironment` is gone with it. It is a neutral grey box, and it was putting a flat grey
wash into every reflective surface in a film whose identity contains no grey. Dropping it made
`models.js` *smaller*.

And it buys the thing a `RectAreaLight` could not have given at any price: because the panels are an
environment, **`scene.environmentRotation` swings them**. The `sweep` value on each beat turns the
whole studio, travelling every specular highlight across every polished surface at once — a real
reflection of a real panel moving, not a gradient slid over a material, which is what that effect
usually is and always looks like. It runs monotonically across the whole film: one continuous
lighting move, like the camera. The closing frame's highlight sits on the opposite shoulder from the
opening's.

Three directional lights remain for diffuse shaping (key, rim, fill, plus the softbox's wrap), and
they change *colour* as well as level — cool plum at night, warm at morning.

---

## 6. The product earns its entrance

`src/scripts/cinema/product.ts` is new. Every material it touches is **cloned first**: `models.ts`
caches and shares its materials across the whole catalogue and across every other page's ambient
layer, so mutating one in place would reach out of this page and change eighty-six others.

**Real refraction.** The catalogue's glass is a two-shell transparency trick, which is the right call
for the ambient layer (many small viewports, and a transmission target per viewport would multiply
GPU cost). The film has one object in one viewport, so it can afford `transmission: 1` with
`thickness`, `ior: 1.5` and a trace of warm attenuation — the liquid actually bends. The back shell is
hidden, because real transmission renders the far wall itself and a second shell becomes a doubled
surface with a false seam down the silhouette. Desktop only.

**A plinth, not a floor.** A full ground plane would give the film a room, and every wide shot would
become a photograph of a table. A small polished disc that fades to nothing within a couple of the
object's own widths reads instead as the surface it happens to be standing on, and stops existing when
the camera is not looking at it. It is dark and highly reflective, so almost everything visible in it
is the studio's panels stretched across it.

**A contact shadow**, as a gradient rather than a shadow map. An object with no contact shadow floats,
and a floating bottle is the single most reliable tell that a render is a render. A shadow map here
would need its own pass and would give a *hard* shadow from a source that is supposed to be a
metre-wide diffusion panel; what an object under a big soft source actually has is a small dense core.

**The staged reveal** — `reveal` 0→1, in four overlapping windows, and *none of them is opacity*. The
object is in the frame from the first scroll; it is simply not lit, and every stage is a stage of it
being found by light:

1. **The edge** (0 → 0.35) — the environment registers in its surfaces: one bright line down a
   shoulder and nothing else.
2. **The body** (0.25 → 0.75) — diffuse surfaces come up out of black, held deliberately *behind* the
   edge so the eye finds the highlight first and the object second. Albedo is multiplied down, not
   faded: an unlit object is dark, not transparent, and fading it would show the haze through the
   middle of a solid bottle.
3. **The weight** (0.45 → 0.85) — the contact shadow arrives and it stops floating.
4. **The surface** (0.6 → 1) — the plinth resolves, and with it the reflection.

A narrow additive bar travels across the plinth through the middle of the reveal and is gone by the
end — the streak the panel throws across the surface, which is what makes the sweep read as light
moving through a room. An event that is still there afterwards was never an event.

**The photograph shader** gained a torn dissolve front: the depth-ordered reveal is displaced by two
octaves of value noise fixed in the plane's own uv. A purely depth-ordered front sweeps as a smooth
contour, and a smooth contour crossing a face reads as a *wipe* — a transition effect sitting on top
of a photograph. It is switched off during held shots, where it would be a permanent soft mottle
rather than an effect. There is also a sub-half-percent depth-weighted shear on scroll speed: a real
camera whipped through a move drags its subject a little against its background, and the eye reads
that lag as weight.

---

## 7. Reduced motion gets a cut, not a refusal

The film used to be skipped outright. It now ships a **reduced cut**, selected at start-up and
switched to *live* if the preference changes — a reader toggling the OS setting gets no navigation
event, so a film that read the query once would keep moving for someone who has just asked it to stop.

| Removed (Tier 1 — vestibular) | Kept (Tier 2/3 — no self-motion implied) |
|---|---|
| All camera travel — one locked-off composed wide, for the whole film | Every photograph, cross-dissolving |
| Parallax against the photographs' depth | Every caption, fading |
| Product rotation and idle drift | The entire lighting arc, and the sweep |
| Dust drift, rising powder, turning shafts | Night into morning, the whole grade |
| Crawling grain, the velocity shear, caption rise and scale | The product's staged reveal and contact shadow |

The camera does not move *slowly* — it does not move. A slow sustained move is worse for a vestibular
reader than a fast one. The story is entirely intact: it is the same film shot from one locked-off
position, which is a real and respectable way to shoot a film.

Two implementation details matter more than they look:

- **Time stops.** Every idle animation is a function of one `time` value; freezing it is the whole of
  "stop the ambient motion", in one line, with no risk of missing one.
- **The loop stops.** Nothing drifts in the reduced cut, so once the transport has caught the scroll
  the film is a still image and the render loop stops dead until the next scroll event. An idle reader
  on a reduced-motion machine costs *zero* frames per second — which is what that preference is asking
  for in the first place.

A bug found while writing this: the transport's half-life was fixed at construction, so a live toggle
would have stopped the parallax and the drift while the camera quietly kept easing. `setHalfLife` and
a test now cover it. A second, related one: an undamped transport was still reporting velocity
measured off the scroll's own teleport — the exact signal the module documents that it refuses to
measure. It now reports zero, enforced at the source.

---

## 8. Performance

**An adaptive governor**, measured rather than guessed from a user-agent string — because whether a
device can afford this is not a property of the device. The same laptop is fast on mains and throttled
on battery, and fast until a video call starts. It watches frame times over a 90-frame window and, if
24 of them missed 22 ms, steps the render scale down by 0.18, to a floor of 0.62.

**It only ever goes down.** A governor that also raised the resolution would hunt — drop, recover,
raise, drop — and every change reallocates every render target, which is both visible and worse than
simply staying low. Frames longer than 0.3 s are discarded rather than counted: that is a blocked main
thread, which says nothing about rendering cost.

Mobile keeps its existing budget and gains one more: no refraction, 90 motes against 240, and the
defocus rides with the bloom that phones already do not get.

### Weight

| Chunk (gzipped) | Phase 14 | Phase 16 | |
|---|---|---|---|
| loader (every page) | 1,305 B | 1,267 B | −38 B |
| `models.js` (shared) | 148,612 B | 147,920 B | **−692 B** — `RoomEnvironment` dropped |
| `stage.js` (the film) | 9,705 B | 15,947 B | +6,242 B |

Net **+5.5 KB gzipped** on the film page. No new dependency. Still one same-origin module
script per page.

---

## 9. Verification

```
tests 538   suites 121   pass 538   fail 0      (was 493 / 114)
astro check 0 errors, 0 warnings, 0 hints
build       87 pages, exit 0
validate:content / :journal / :contrast   PASS
guard:mock  still fails by design, untouched
```

`tests/cinema.test.mjs` is new — 45 tests over the film's arithmetic, which is the part a screenshot
cannot reach. It asserts, among other things: that the same wall-clock time produces the same camera
position at 30, 60 and 144 Hz (and that the filter it replaced genuinely does not); that no scroll,
however violent, can drive velocity outside its clamp; that every transition curve starts at rest,
arrives, never reverses and never leaves the unit range; that `anticipate` actually withholds its move
and `settle` actually settles; that the governor degrades and never hunts; that the shooting script's
beats are ordered, its exposure and sweep monotonic, its product completing exactly one turn; that the
phone re-staging uses exactly *one* horizontal factor (the defect that once put the camera where the
product used to be); that light time stays on the neutral curve and runs measurably ahead of the
camera through the anticipation hold, so that beat cannot quietly go dead again; and that the
render-order contract `product.ts` reads out of `models.ts` still holds, so the film cannot silently
stop upgrading its glass.

---

## 10. What the visual pass found

The render was inspected beat by beat in Chrome. Phase 14's record said it plainly — almost every
defect that matters in this film is invisible to the suite and obvious in a screenshot — and that
held again. **Ten defects were found by looking, and not one of them had failed a test.**

The first one stopped the film existing at all.

| # | Defect | Cause | Fix |
|---|---|---|---|
| 1 | **The film never started.** The page stayed a storyboard; no canvas was ever created, and the console was completely clean. | `boot.ts` awaited `Promise.all` of `img.decode()` for all five photographs. In Chrome every one of those promises **never settles** — the images report `complete === true` and `naturalWidth === 1920`, and `decode()` stays pending forever. Nothing threw, so the `.catch` never fired. | Wait on `complete && naturalWidth > 0`, fall back to the `load` event, and cap the whole wait at 3 s. **The film must never be gated on a promise that can hang.** |
| 2 | **Her face was cropped off the top of the frame in every single beat.** In the closest shot there was no face at all — a shoulder and a hand. | A 3:4 portrait scaled to *cover* a wide frame overflows vertically by a long way, and the plane was centred on its own midpoint. The midpoint of these photographs is her collarbone. | The site already records a focal point per photograph (`photography.ts`, published as `object-position`). The plane reads it and shifts by the distance between its centre and that point, clamped so the frame can never run off the edge of the photograph. |
| 3 | **A pale smudge floated in mid-air beside her face.** | The light-sweep bar was gated on the product's reveal but not on the plinth's presence, so it drew during beats where the surface it lies on does not exist yet. | Gated on `surface`; opacity 0.5 to 0.34. |
| 4 | **The bottle was hollow** — no liquid, no pipette, no SERUM label, rendering as solid black. | `depthWrite = true` on the transmissive shell made the glass depth-occlude its own contents: everything behind the front surface failed the depth test. | `depthWrite = false`. |
| 5 | **Then the bottle had no silhouette** — a cream fill and a cap floating with no vessel around them. | A fully transmissive shell in a dark warm void transmits the dark. The back shell had been hidden on the theory that real transmission renders the far wall itself. | Back shell restored — it is what gives clear glass an edge in a dark room. Transmission 1 to 0.92, `envMapIntensity` 2.2. |
| 6 | **During the hint beat the package read as two disconnected shapes**, a cap and a base ring a body's width apart. | Dimming albedo and environment does nothing to a transmissive surface: it shows what is *behind* it. The missing part was not a lit surface, so tuning the lit surfaces could never reach it. | **Transmission became part of the reveal**: `lerp(0.3, 0.92, body)` — nearly opaque while waiting in the dark, clear by the packshot. Reveal floors raised (0.08 to 0.3, 0.06 to 0.25); beat 1 reveal 0.22 to 0.45. |
| 7 | **The opening was an empty brown frame** with two light shafts and a line of type. | The opening reveal started at a literal zero and the beat's exposure was 0.18. A photograph at a sixth of a stop behind a part-open reveal has nothing left to show. | Reveal floor 0.3; opening exposure 0.18 to 0.36, still well over a stop under the beat that follows. |
| 8 | **The last three beats were blown out**, backgrounds going to near-paper. | Exposure ran to 1.42 with bloom 0.95 over an already bright photograph, against an `#eaeaea` morning backdrop. | Late exposures pulled to 1.05 / 1.12 / 1.16, bloom to 0.78 / 0.6 / 0.52 — still strictly increasing, which the suite asserts. Morning backdrop held back to nude and sand. |
| 9 | **The light shafts were the subject** of the opening frame — two pale diagonal bars across an empty backdrop. | Base opacities of 0.5 / 0.34 / 0.22 predated the grade changes. | 0.3 / 0.2 / 0.14. |
| 10 | **The title card clipped through the header** on a short viewport. | Every breakpoint on this site is a *width*. A landscape phone is not a narrow desktop, it is a **short** one, and six lines of display type anchored to the bottom grow upward off the screen. | A `max-height: 680px` guard steps the film's display type down to `--type-display-sm`. |

Defects 1 and 2 are the difference between a film and no film, and neither could have been caught
by anything except opening the page.

### Also verified in the browser

- **Scrubbing** — forward, backward and jumped at random across nine positions including both ends.
  Every frame reported finite, in-range state: no overshoot, no broken beat pair, no NaN.
- **The film hands the screen back** — at the coda, maximum caption opacity is 0.003.
- **Reduced motion** — the camera is genuinely locked off. Framing at p = 0.08, 0.52 and 1.0 is
  identical; only the photograph, the light, the grade and the product's reveal move. The product
  is now staged *once* in this cut as well, because an object growing in a fixed frame is an object
  moving toward the viewer, which is the depth cue a locked-off shot exists to remove.
- **Console** — clean. Zero messages on a fresh load through a full scrub.
- **Network** — 15 resources, one origin, **zero external requests**.
- **Performance** — a fully rendered frame (scene, transmission pass, bright pass, two blurs, and
  the composite with its twelve defocus taps) costs **4.6 ms** at 1536x729. About a quarter of a
  60 Hz budget, with the governor still in reserve.

---

## 11. The mobile pass

Phase 16's first visual pass could not reach the phone rendering branch: Chrome will not make a
window narrower than about 500 CSS pixels, and the tab's viewport would not follow the window below
roughly 1500. The way through was an `<iframe>` — **an iframe has its own viewport**, so the film
inside one genuinely reports `innerWidth: 390`, `matchMedia("(max-width: 767px)")` matches, and the
`small` / `portraitViewport` branch actually runs. Same-origin, so the harness could drive the
film's own scroll and read its state directly. The harness lived in `dist/` for the pass and is
gone.

### Viewports genuinely rendered and inspected

| Viewport | Branch | Result |
|---|---|---|
| 390 x 844 | small, portrait | all 7 beats |
| 393 x 852 | small, portrait | 4 beats, no overflow, no caption outside the frame |
| 430 x 932 | small, portrait | 4 beats, no overflow, no caption outside the frame |
| 375 x 667 | small, portrait | beats 0 and 2, captions inside, no overflow |
| 844 x 390 | landscape, short | 5 beats — the `max-height` guard visibly engaged |
| 932 x 430 | landscape, short | 5 beats |
| 1440 x 900 | desktop | regression check, 4 beats + flicks |

### What it found

**One real defect, and it was a clipping defect.** At the transformation beat the bottle was cut in
half by the right edge of a 390-wide screen. At the beauty beat it was outside the frame entirely.

`forPortraitViewport` squeezes the whole composition toward the centre line by one factor, which
correctly preserves every element's position *relative to the others* — that part was right, and the
photographs were already framed correctly on the face at every phone size, because `portraitCover`
and the focal-point shift are both resolved against the lens each frame.

What no re-staging factor can know is **how wide the frame actually is**, because that depends on
the lens and the viewport at the moment of rendering. On a phone the frame at the product's distance
is about a third of its laptop width, so an object staged near the edge of a wide composition simply
falls off a narrow one.

The fix follows the pattern this codebase already uses for photographs: resolve the object's own
width against the lens every frame and slide it in only as far as it must go. **Desktop is
deliberately exempt** — several beats stage the product at or just past the frame edge on purpose,
and the beauty moment shows a sliver of it and nothing more because that shot has one subject.
Clamping there would have dragged a second subject into a composition already verified as correct.

After the fix the beauty beat shows a small sliver at the corner, which is what desktop shows, and
the transformation beat holds the whole bottle.

### Also verified at phone size

- **Touch-style scrolling** — slow, medium, fast, reverse and a deliberate thrash, 70 samples in
  total. Every one reported finite, in-range progress: no jump, no overshoot, no NaN, and product
  and lighting stayed synchronised. The film settled cleanly on a coherent frame each time.
- **Reduced motion at 390 x 844** — camera genuinely locked off: the product sits at identical
  position and size at p = 0.17, 0.68 and 1.0 while the photographs cross-dissolve, the captions
  change and the world goes from dark to bright. The clamp applies in this cut too, so the object is
  fully in frame rather than clipped.
- **No horizontal overflow** at any viewport tested.
- **Console clean, zero external requests** (17 resources, one origin).
- **Mobile degradation actually activates**: canvas 487 x 1055 at 390 wide confirms the phone pixel
  ratio cap; `small` gates the bloom, the defocus, refraction and the reduced particle counts.

### Desktop regression

Re-checked at 1440 x 900 after the fix: beats 2, 4, 5 and 6 unchanged, forward and backward flicks
valid across 28 samples, and the QA scaffolding confirmed absent in the shipping build
(`typeof window.__film === "undefined"`).

---

## 12. The creative-director pass

A final review of the finished piece, watched end to end at a fine scrub rather than beat by beat —
because the beats were already known to be good and the question was what happens *between* them.

**One change was made.** Everything else was deliberately left alone.

### The defect: a doubled face

Sampling the film between beats rather than on them exposed something every previous pass had
missed, because every previous pass had looked at the beats. At the midpoints of the later
transitions the frame showed **two faces** — two sets of eyes, two mouths, visibly misregistered.

The cause is that the cross-fade ran across the *whole* span between two beats: the outgoing frame
at `1 - t`, the incoming at `t`. Halfway through, that is two photographs at half opacity each. With
seven beats of the same person at a similar scale, a half-and-half blend is not a dissolve, it is a
double exposure, and it was on screen for roughly an eighth of the film.

### The fix that did not work, and why it is worth recording

The first attempt was a hard wipe: hold the outgoing frame fully present and let the incoming one
wipe in over it along the shader's noise-torn front, so every pixel shows one photograph or the
other. It was **worse**, and instructively so.

That front is ordered by the image's own luminance. It exists to bring her out of DARKNESS, nearest
and brightest first, which is exactly right for beat zero. Wiping it over *another lit photograph*
composites her face inside her own face, with hard seams where the front crosses. A mechanism built
for emergence is not a mechanism for transition. It was reverted.

### The fix that worked

A shorter dissolve, not a cleverer one:

```
const cut = smoothstep(0.34, 0.66, t);
```

The dissolve is compressed into the middle third of each transition. Either side of it exactly one
photograph is on screen at full strength. The window in which both frames sit between a quarter and
three-quarters opacity narrows from about half of every transition to about a seventh — **roughly
three and a half times shorter** — and the beats hold longer and cleaner as a direct consequence.

Verified: p = 0.72, 0.80, 0.88 and 0.92 all render a single clean frame where several of them
previously doubled. The literal midpoint still blends, which is what the midpoint of a dissolve is
in any film; the difference is that it is now a pass rather than a state.

### What was deliberately left alone

Each of these was examined and judged better as it is:

- **The title card crossing her face as she emerges** (around p = 0.06). Real, but it happens while
  the type is already under a fifth opacity and falling. Re-timing it would cost the h1 its
  legibility at p = 0, where the frame is nearly empty and the type reads perfectly.
- **The gaps where no caption is on screen at all** (around p = 0.26 and p = 0.44). These are not
  omissions. They are the only moments of visual silence in the piece, and the longest one falls on
  the packshot — the hero frame gets the frame to itself, which is correct.
- **The product as a corner sliver at the beauty beat.** That shot has one subject. The phone clamp
  brings it just into frame and no further, matching desktop, and that is as far as it should go.
- **The plinth's faint elliptical edge.** Fixing it properly means a planar reflection, which means
  rendering the product twice with flipped winding, which fights the front-side-only label rule
  Phase 14 established for good reasons.
- **The unbalanced right third in some mid-transition frames** (around p = 0.60). Transitional, brief
  at reading speed, and correcting it would mean re-staging compositions already verified on two
  form factors.
- **Camera roll, easing curves, lighting sweep, particle densities, post chain.** All reviewed
  against the brief's list of failure modes — mechanical motion, repetitive easing, excessive roll,
  unnecessary lighting changes — and none of them exhibits one. They were not touched.

### On originality

The brief's test is whether the piece would still look like a generic Three.js demo with the
branding removed. It would not, and the reasons are structural rather than decorative: the camera
runs a shooting script with a named curve per move; the lighting is a beauty studio baked into the
environment and swept across the film in one continuous direction; the subject is real editorial
photography given depth rather than a stock model; the object is the site's own procedural
packaging; and the narrative is Zina's actual six-stage testing method, with every line of type a
record that already exists in `content/`. None of that is transferable to another brand without
rebuilding it.

---

## 13. Limitations

1. **No real handset.** Every phone viewport above is a true CSS viewport with the mobile branch
   genuinely running, but it is desktop Chrome rendering it. Real-device GPU cost, touch inertia and
   browser chrome insets (`100svh` against a collapsing address bar) have not been measured on
   hardware.
2. **Temporary QA scaffolding was used and removed twice.** A browser will not run
   `requestAnimationFrame` in a background tab, so a deterministic render hook was needed for the
   desktop pass and a reduced-motion toggle for the mobile pass. Both are gone from the shipping
   build and their absence is asserted in the browser, not just assumed.
3. **Gather defocus bleeds at silhouettes.** Tap-weighting suppresses the worst of it, but a
   foreground edge against a strongly defocused background can still show a thin dark fringe. A
   proper scatter-based DOF needs a separate pass and is not worth it at this quality bar.
4. **The plinth is reflective, not a mirror.** It shows the studio, not the bottle standing on it. A
   true planar reflection means rendering the product twice with flipped winding, which would fight
   the front-side-only label rule that Phase 14 established for good reasons.
5. **Browser testing was Chromium-only.** `environmentRotation`, `DepthTexture` at
   `UnsignedIntType` and `transmission` all behave correctly there; Safari and Firefox were
   not available in this environment.
6. **Arabic interface strings still need native review** (Q3-2), unchanged — Phase 16 added none.
