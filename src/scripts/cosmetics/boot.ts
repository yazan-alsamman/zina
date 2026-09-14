/**
 * COSMETICS BOOT — the only client JavaScript that runs on page load (~1 KB).
 *
 * It decides whether the 3D scene is worth loading at all, and if so loads Three.js LAZILY, after
 * the page has finished loading and the browser is idle, so the 3D layer can never compete with
 * the portrait or the headline for the first paint.
 *
 * The scene is skipped entirely when:
 *   - the page has no product slots
 *   - WebGL is unavailable
 *   - the reader has asked the browser to save data
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
  const slots = Array.from(document.querySelectorAll<HTMLElement>("[data-cosmetic]"));
  if (slots.length === 0) return;
  if ((navigator as NavigatorConnection).connection?.saveData) return;
  if (!supportsWebGL()) return;

  const load = () => {
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
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
