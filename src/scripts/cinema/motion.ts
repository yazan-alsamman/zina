/**
 * MOTION — the physics of the transport, and the vocabulary of a cut.
 *
 * ============================================================================
 * WHY THIS IS ITS OWN MODULE
 * ============================================================================
 * Nothing here imports Three. It is arithmetic: how a chased value catches its target, how fast
 * the reader is scrolling, and what shape a transition between two shots has. That makes it the
 * one part of the film that can be run and asserted in Node (tests/cinema.test.mjs), which matters
 * because these are exactly the functions whose defects are invisible in a screenshot — a camera
 * eased at the wrong rate looks fine in a still and wrong in the hand.
 *
 * ============================================================================
 * THE BUG THIS MODULE EXISTS TO FIX
 * ============================================================================
 * The film used to ease with `current += (target - current) * 0.085` once per animation frame.
 * That is a FRAME-RATE DEPENDENT filter. On the 60 Hz panel it was tuned on it settles in about a
 * fifth of a second; on a 120 Hz laptop it settles in half that, and on a machine dropping to
 * 30 Hz it settles in twice that. The film was therefore literally a different edit on different
 * hardware — tighter and snappier on better screens, which is the opposite of what a director
 * wants, because the whole point of a scrub is that it feels the same in every hand.
 *
 * `damp()` below is the frame-rate independent form. It is expressed as a HALF-LIFE in seconds:
 * the time in which half the remaining distance is covered, whatever the frame rate. The film's
 * half-life is tuned to match the old 60 Hz feel exactly (see FILM_HALF_LIFE), so the change is a
 * correctness fix and not a re-timing.
 */

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));
export const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Frame-rate independent exponential damping.
 *
 * After `halfLife` seconds, half the distance between `current` and `target` is gone — whether
 * that took one frame at 8 fps or fifteen at 120 fps. This is the only correct way to write
 * "ease towards" in a loop whose step is not fixed.
 *
 * A non-positive half-life means "snap": used by the reduced-motion cut, where the camera does
 * not chase at all.
 */
export function damp(current: number, target: number, halfLife: number, dt: number): number {
  if (halfLife <= 0) return target;
  /* 2^(-dt/halfLife) is the fraction of the gap that SURVIVES this step. At dt = halfLife it is
     exactly one half. Written with Math.pow rather than an approximation because dt is small and
     an exponential's cost here is thoroughly irrelevant next to a draw call. */
  return target + (current - target) * Math.pow(2, -dt / halfLife);
}

/**
 * The film's camera half-life, in seconds.
 *
 * Derived from the filter it replaces rather than re-tuned by eye, so the piece is timed as it was
 * directed: a per-frame survival of 0.915 at 60 Hz reaches half in log(0.5)/log(0.915) = 7.81
 * frames, which is 0.130 seconds. Slower than this and the camera feels detached from the hand;
 * faster and the scrub stops reading as film transport and starts reading as a slider.
 */
export const FILM_HALF_LIFE = 0.13;

/**
 * The largest step the loop will integrate, in seconds.
 *
 * A backgrounded tab, a garbage collection pause or a scrubbed-past breakpoint can hand the loop a
 * delta of several seconds. Integrated honestly that is a jump cut — every damped value arrives at
 * its target instantly and the film snaps. Clamping to roughly three frames at 60 Hz means the
 * worst case is that the camera lags for a moment, which reads as a slow catch-up and not as a
 * break in the take.
 */
export const MAX_STEP = 0.05;

/* ------------------------------------------------------------------ the transport */

/**
 * THE TRANSPORT — where the film is, where the scroll says it should be, and how fast the reader
 * is moving between the two.
 *
 * Scroll is the only input the film has, and a raw scroll position is a hostile signal: it
 * arrives in bursts, it can jump a whole page on a trackpad flick or a Home keypress, and it is
 * sampled at whatever rate the browser feels like. The transport turns it into the three numbers
 * the renderer actually wants.
 */
export interface Transport {
  /** Where the camera is: the eased, smooth position the whole film is a function of. 0-1. */
  readonly position: number;
  /** Where the scroll says we should be. 0-1. */
  readonly target: number;
  /**
   * SIGNED, SMOOTHED SPEED, in units of progress per second, clamped to [-1, 1].
   *
   * This is what lets the film respond to HOW the reader is scrolling and not only to where they
   * are: the lens breathes a little on a fast move, the grain lifts, the air streaks. It is
   * clamped and heavily smoothed on purpose — see `VELOCITY_CEILING`.
   */
  readonly velocity: number;
  /** Speed regardless of direction, 0-1. The convenience the renderer actually reads. */
  readonly speed: number;
  /** Point the transport at a new scroll position. Does not move the camera; `advance` does. */
  seek(target: number): void;
  /** Integrate one frame. `dt` is in seconds and is clamped internally. */
  advance(dt: number): void;
  /** Drop the camera onto the target with no chase. The reduced-motion cut and the first frame. */
  snap(): void;
  /**
   * Re-tune the chase, in seconds. Zero means "do not chase at all".
   *
   * This exists because a reader can toggle reduce-motion in their OS while the page is open, with
   * no navigation and no reload. A transport whose half-life was fixed at construction would keep
   * easing a camera for someone who has just asked it to stop moving — the preference would appear
   * to work (the parallax and the drift stop immediately) while the one genuinely vestibular part
   * of the transport quietly carried on.
   */
  setHalfLife(seconds: number): void;
}

/**
 * How fast a scroll has to be before the velocity signal is saturated.
 *
 * Progress units per second. A comfortable read moves at well under 0.1; a determined flick can
 * cross the entire film in under a second. Saturating at a quarter of the film per second means
 * ordinary reading produces a velocity near zero — the effects it drives stay invisible, which is
 * the point — while a flick pins it at 1 and goes no further.
 *
 * THE CLAMP IS THE WHOLE SAFETY ARGUMENT. Every velocity-driven effect in the film is written
 * against a number that cannot exceed 1, so no amount of scrolling violence can drive a uniform
 * somewhere nauseating. The brief's "must remain controlled even when the user scrolls rapidly"
 * is enforced here, once, rather than at each of the dozen places that read it.
 */
export const VELOCITY_CEILING = 0.25;

/**
 * The velocity signal's own half-life.
 *
 * Deliberately much longer than the camera's. Velocity drives things that would strobe if they
 * tracked the raw signal — a trackpad delivers scroll in lumpy bursts, and an effect wired
 * straight to it flickers on every burst. Smoothing it over a third of a second turns "the reader
 * is scrolling hard right now" into "the reader has been scrolling hard", which is the thing
 * actually worth responding to.
 */
export const VELOCITY_HALF_LIFE = 0.32;

export function makeTransport(initialHalfLife = FILM_HALF_LIFE): Transport {
  let position = 0;
  let target = 0;
  let velocity = 0;
  let halfLife = initialHalfLife;

  return {
    get position() {
      return position;
    },
    get target() {
      return target;
    },
    get velocity() {
      return velocity;
    },
    get speed() {
      return Math.abs(velocity);
    },

    seek(next) {
      target = clamp01(next);
    },

    advance(dt) {
      const step = clamp(dt, 0, MAX_STEP);
      if (step <= 0) return;

      const before = position;
      position = damp(position, target, halfLife, step);

      /*
       * WITH NO CHASE THERE IS NO VELOCITY.
       *
       * Velocity is measured from the CAMERA's movement, never from the scroll's. The scroll can
       * teleport — a Home keypress, an anchor jump, a restored scroll position — and measuring
       * that produces a single enormous spike that every effect downstream would flinch at. The
       * damped camera is continuous by construction, so its speed always describes something a
       * viewer can actually see happening.
       *
       * At a half-life of zero the camera IS the scroll, so the only thing left to measure is the
       * teleport this whole approach exists to refuse. The reduced cut runs at zero, and it is the
       * one cut that must never have a velocity-driven effect in it — so the honest answer, and
       * the one that keeps the invariant true at the source rather than at each of its readers, is
       * that an undamped transport has no velocity at all.
       */
      if (halfLife <= 0) {
        velocity = 0;
        return;
      }

      const measured = (position - before) / step / VELOCITY_CEILING;
      velocity = damp(velocity, clamp(measured, -1, 1), VELOCITY_HALF_LIFE, step);
      /* Park it at exactly zero once it is negligible, so a resting film is bit-for-bit still and
         the loop's "is anything moving" check can be trusted. */
      if (Math.abs(velocity) < 0.0008) velocity = 0;
    },

    snap() {
      position = target;
      velocity = 0;
    },

    setHalfLife(seconds) {
      halfLife = Math.max(0, seconds);
    },
  };
}

/* ------------------------------------------------------------------ the shape of a cut */

/**
 * EASINGS — the shape of a move between two shots.
 *
 * The film used to run every transition through one symmetric smoothstep. That is a competent
 * default and it is why the old cut read as even-handed to the point of being characterless:
 * a push-in onto a face and a slow pull-back to a wide have opposite dynamics in a real edit, and
 * giving them the same curve is the animation equivalent of reading every line at one volume.
 *
 * Each curve below is named for what it is FOR, not for its polynomial, because the timeline is
 * meant to be read as a shooting script.
 */
export type Ease = (t: number) => number;

/** The old default. Symmetric, unremarkable, correct when a move should not draw attention. */
export const smooth: Ease = (t) => t * t * (3 - 2 * t);

/**
 * A DOLLY. Gentle at both ends, never quite still in the middle — the signature of a camera on
 * rails pushed by a human being rather than driven to a mark.
 */
export const dolly: Ease = (t) => 0.5 - Math.cos(Math.PI * clamp01(t)) / 2;

/**
 * A PUSH. Slow to leave, then committed. Used when the camera decides to go somewhere: the
 * acceleration is what tells a viewer the move is intentional rather than drifting.
 */
export const push: Ease = (t) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/**
 * A SETTLE. Covers most of the distance early, then eases into rest for a long time.
 *
 * This is the reveal curve. A hero shot wants the camera to ARRIVE and then hold, so that the
 * subject has the frame to itself while the reader is still scrolling — the stillness at the end
 * of the move is what makes a beat feel like a held shot rather than a waypoint.
 */
export const settle: Ease = (t) => {
  const x = clamp01(t);
  return x >= 1 ? 1 : 1 - Math.pow(2, -9 * x);
};

/**
 * A LIFT. A long, heavy hold at both ends with the whole move in the middle.
 *
 * For the largest travels in the film, where a linear share of the distance per unit of scroll
 * would read as the camera being dragged. Holding, moving decisively, and holding again is how a
 * crane move is actually operated.
 */
export const lift: Ease = (t) => {
  const x = clamp01(t);
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
};

/**
 * ANTICIPATION. Holds almost completely still for the first third, then moves.
 *
 * The product reveal's curve, and the reason the object earns its entrance: a beat's worth of
 * scroll in which the light changes and nothing else does. Anticipation is a thing you build by
 * withholding movement, and there is no way to withhold movement inside a symmetric curve.
 */
export const anticipate: Ease = (t) => {
  const x = clamp01(t);
  if (x <= 0.34) return smooth(x / 0.34) * 0.06;
  return 0.06 + 0.94 * push((x - 0.34) / 0.66);
};

export const EASINGS = { smooth, dolly, push, settle, lift, anticipate } as const;
export type EaseName = keyof typeof EASINGS;

/* ------------------------------------------------------------------ the performance governor */

/**
 * THE GOVERNOR — adaptive resolution, decided by the machine rather than by a user-agent string.
 *
 * Whether a device can afford full-resolution post is not knowable in advance. A three-year-old
 * phone and a current one report the same things; a laptop can be fast on mains and throttled on
 * battery; a desktop can be fast until a video call starts. So the film measures instead: it
 * watches its own frame times and, if it is persistently missing, lowers the one setting that
 * buys the most back per unit of quality lost — the resolution it renders at.
 *
 * IT ONLY EVER GOES DOWN. A governor that also raised the resolution would hunt: drop, recover,
 * raise, drop again, and the resulting resize churn is both visible and, because every render
 * target is reallocated, worse than simply staying low. One or two irreversible steps down is the
 * whole mechanism.
 */
export interface Governor {
  /** The pixel-ratio multiplier to render at, 1 down to MIN_SCALE. */
  readonly scale: number;
  /**
   * Record one frame's duration in seconds. Returns true when the scale CHANGED and the caller
   * therefore needs to resize its targets — which is the only frame on which that is worth doing.
   */
  sample(dt: number): boolean;
}

/** Below this the picture costs more than it is worth; the film would rather drop frames. */
export const MIN_SCALE = 0.62;

/**
 * A frame slower than this is "missed". 22 ms is a little over 60 Hz's 16.7 ms budget, chosen so
 * that an occasional long frame — a texture upload, a GC pause — does not count against a machine
 * that is otherwise comfortable.
 */
const MISS_MS = 0.022;

/** How many misses in the window before the film steps down. */
const PATIENCE = 24;

export function makeGovernor(): Governor {
  let scale = 1;
  let misses = 0;
  let samples = 0;

  return {
    get scale() {
      return scale;
    },
    sample(dt) {
      /* A frame longer than a third of a second is not a slow machine, it is a tab that was
         backgrounded or a main thread that was blocked by something outside the film. Counting it
         would step the resolution down for a reason that has nothing to do with rendering. */
      if (dt > 0.3) return false;
      samples++;
      if (dt > MISS_MS) misses++;

      /* Judged over a window rather than a streak: a streak of 24 is defeated by one fast frame,
         and the machines this is for alternate rather than fail consistently. */
      if (samples < 90) return false;
      const bad = misses >= PATIENCE;
      samples = 0;
      misses = 0;
      if (!bad || scale <= MIN_SCALE) return false;

      scale = Math.max(MIN_SCALE, scale - 0.18);
      return true;
    },
  };
}
