/**
 * CLIENT BOOT — the only client JavaScript that runs on page load (~1 KB).
 *
 * It decides whether a 3D layer is worth loading at all, and if so loads Three.js LAZILY, after
 * the page has finished loading and the browser is idle, so the 3D layer can never compete with
 * the portrait or the headline for the first paint.
 *
 * There are TWO layers it can start, and never both — one script per page is a hard invariant of
 * this site (tests/helpers/client-js.mjs), so this module is the single branch point:
 *
 *   [data-cinema]     the film page. A scroll-driven cinematic scene: one camera, one take.
 *   [data-cosmetic]   every other page. The ambient floating-product layer.
 *
 * Either is skipped entirely when:
 *   - the page declares neither
 *   - WebGL is unavailable
 *   - the reader has asked the browser to save data
 *
 * REDUCED MOTION IS NO LONGER A REFUSAL. This module used to skip the film outright when a reader
 * asked for reduced motion, on the reasoning that a scroll-driven camera cannot be made still
 * without ceasing to be the thing it is. That was true of the camera and false of the film: the
 * photographs, the captions, the lighting arc and the night-to-morning transformation are the
 * story, and none of them implies self-motion. The film now ships a REDUCED CUT — one locked-off
 * camera, no parallax, no rotation, no drift, no travel — and stage.ts both selects it at start-up
 * and switches to it live if the preference changes. See the REDUCED block in stage.ts.
 *
 * Treating an accessibility preference as a request to remove vestibular motion, rather than as a
 * switch that removes the work, is the difference between degrading gracefully and giving up.
 *
 * Nothing here reads, stores or transmits anything about the reader. Every slot is decorative
 * (aria-hidden) and every page is complete without it.
 */

type NavigatorConnection = Navigator & { connection?: { saveData?: boolean } };

function supportsWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

function boot(): void {
  const film = document.querySelector<HTMLElement>("[data-cinema]");
  const slots = film ? [] : Array.from(document.querySelectorAll<HTMLElement>("[data-cosmetic]"));
  if (!film && slots.length === 0) return;
  if ((navigator as NavigatorConnection).connection?.saveData) return;
  if (!supportsWebGL()) return;

  const load = () => {
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    if (film) {
      /*
       * The film needs its photographs LOADED before it can make textures from them.
       *
       * They ship `loading="lazy"` — the page must not download five full-bleed photographs to
       * reach first paint, and one eager image per page is an invariant the suite asserts. The
       * film opts them in HERE instead, which is after `load` and after idle: by this point the
       * page has painted, the reader is looking at the title card, and nothing is competing.
       *
       * ======================================================================
       * WHY THIS DOES NOT USE image.decode(), WHICH IS THE OBVIOUS ANSWER
       * ======================================================================
       * It used to, and it silently killed the entire film.
       *
       * Observed in Chrome 14x on this page: all five photographs report `complete === true` and
       * `naturalWidth === 1920` — they are fully loaded and painted — and `decode()` on every one
       * of them returns a promise that NEVER SETTLES. Not resolves, not rejects. Pending forever.
       * Because the boot awaited `Promise.all` of those promises, `startCinema` was never called,
       * no canvas was ever created, and the page quietly stayed a storyboard. Nothing threw, so
       * the `.catch` below never fired and the console was completely clean.
       *
       * The likely trigger is these being `<img>` inside `<picture>` with `srcset`/`sizes`, where
       * the browser re-runs candidate selection when layout settles — the same moving target that
       * portrait.ts documents and works around. The precise cause matters less than the rule:
       *
       *   THE FILM MUST NEVER BE GATED ON A PROMISE THAT CAN HANG.
       *
       * What the film actually needs is the PIXELS, and `complete && naturalWidth > 0` is exactly
       * that condition, synchronously and without a promise. Anything not yet loaded is waited for
       * through its own `load` event, and the whole wait is capped — so in the worst case the film
       * starts a moment early with a photograph or two still arriving, which it is already built
       * to handle: a portrait plane whose texture is not ready is simply not drawn (see
       * `PortraitPlane.ready` in portrait.ts), and it joins the film the frame it lands.
       */
      const images = Array.from(film.querySelectorAll("img"));
      for (const image of images) image.loading = "eager";

      const loaded = (image: HTMLImageElement) =>
        image.complete && image.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              /* An image that fails is not a reason to withhold the film from the four that did. */
              image.addEventListener("error", () => resolve(), { once: true });
            });

      /* The cap is the guarantee. Whatever the photographs do, the film starts. */
      const ready = Promise.race([
        Promise.all(images.map(loaded)),
        new Promise<void>((resolve) => setTimeout(resolve, 3000)),
      ]);

      Promise.all([import("../cinema/stage"), fontsReady, ready])
        .then(([module]) =>
          module.startCinema({
            stage: film.querySelector<HTMLElement>("[data-cinema-stage]")!,
            track: film,
            scenes: Array.from(film.querySelectorAll<HTMLElement>("[data-cinema-scene]")),
            /* Document order IS the index the timeline addresses. Only the beats that introduce a
               new photograph carry a frame, so five frames serve seven beats. */
            frames: Array.from(film.querySelectorAll<HTMLImageElement>("[data-cinema-frame] img")),
            kind: (film.dataset.cinemaProduct ?? "serum") as never,
            tint: (film.dataset.cinemaTint ?? "rose") as never,
          })
        )
        .catch(() => {
          /* A failed chunk leaves the storyboard, which is the page. */
        });
      return;
    }
    Promise.all([import("./scene"), fontsReady])
      .then(([module]) => module.startScene(slots))
      .catch(() => {
        /* A failed chunk leaves the decorative CSS fallback in place. */
      });
  };

  const idle = () => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(load, { timeout: 2000 });
    else setTimeout(load, 400); // Safari before 18 has no requestIdleCallback
  };

  if (document.readyState === "complete") idle();
  else window.addEventListener("load", idle, { once: true });
}

boot();
