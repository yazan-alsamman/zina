/**
 * THE VISIBILITY BUDGET — how many products may share one frame.
 *
 * This is the rule that lets the catalogue be large and the composition stay quiet. A page may
 * declare any number of slots; the scene renders only the few most prominent each frame, and
 * everything else is simply not drawn. Without it, "more packages" would mean "more clutter",
 * which is the opposite of what the 3D layer is for.
 *
 * It lives in its own module, free of any Three.js import, so it can be reasoned about and tested
 * on its own — the numbers here are an art-direction decision, not a rendering detail.
 *
 * Breakpoints are passed in by the caller, which reads them from `--bp-*` in tokens.css, so the
 * CSS that hides a slot at a width and the JavaScript that budgets one at that width cannot drift.
 */

export interface Breakpoints {
  md: number;
  lg: number;
  xl: number;
}

/**
 * Phone 2 · tablet 3 · laptop 5 · large desktop 6.
 *
 * The phone figure is the important one: at 360–430px a third product would sit on the type. The
 * desktop ceiling of six is the point past which a beauty composition stops reading as a still
 * life and starts reading as a shelf.
 */
export const VISIBILITY_BUDGET = {
  phone: 2,
  tablet: 3,
  laptop: 5,
  desktop: 6,
} as const;

export function budgetFor(width: number, breakpoints: Breakpoints): number {
  if (width < breakpoints.md) return VISIBILITY_BUDGET.phone;
  if (width < breakpoints.lg) return VISIBILITY_BUDGET.tablet;
  if (width < breakpoints.xl) return VISIBILITY_BUDGET.laptop;
  return VISIBILITY_BUDGET.desktop;
}
