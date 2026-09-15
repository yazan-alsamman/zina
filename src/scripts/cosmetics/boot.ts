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
 *   - the reader has asked for reduced motion AND the layer is the film
 *
 * The film is the one layer that is refused outright under reduced motion. The ambient layer can
 * hold a still pose; a scroll-driven camera cannot be made still without ceasing to be the thing
 * it is, and the film page's storyboard is already a complete, readable page without it.
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
  if (film && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const load = () => {
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    if (film) {
      /*
       * The film needs its photographs DECODED, not merely fetched: it builds its textures from
       * the storyboard's own <img> elements, so a half-decoded image would upload as blank.
       *
       * They ship `loading="lazy"` — the page must not download five full-bleed photographs to
       * reach first paint, and one eager image per page is an invariant the suite asserts. The
       * film opts them in HERE instead, which is after `load` and after idle: by this point the
       * page has painted, the reader is looking at the title card, and nothing is competing.
       */
      const images = Array.from(film.querySelectorAll("img"));
      for (const image of images) image.loading = "eager";
      const decoded = Promise.all(
        images.map((image) => (image.decode ? image.decode().catch(() => undefined) : Promise.resolve()))
      );
      Promise.all([import("../cinema/stage"), fontsReady, decoded])
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
