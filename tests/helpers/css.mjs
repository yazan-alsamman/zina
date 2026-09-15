/**
 * ALL the CSS the build actually ships.
 *
 * ============================================================================
 * PHASE 12 AUDIT FINDING — why this helper exists
 * ============================================================================
 * The Phase 11 design-system tests (every radius is a token, no neutral shadow, every gradient
 * colour is in the palette) read `dist/_astro/*.css` and nothing else. But `inlineStylesheets:
 * "auto"` in astro.config.ts means Astro INLINES most component stylesheets into each page's
 * <head> — and component stylesheets are exactly where a one-off radius or a grey drop shadow
 * gets typed. Those tests were therefore passing over most of the CSS on the site: a component
 * could have introduced `border-radius: 7px` and nothing would have failed.
 *
 * This collects both halves, so the design-system rules are asserted against everything that
 * reaches a browser. It is a strictly wider net than the one it replaces.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Every external stylesheet emitted into dist/_astro. */
export function externalStylesheets(dist) {
  return readdirSync(join(dist, "_astro"))
    .filter((file) => file.endsWith(".css"))
    .map((file) => readFileSync(join(dist, "_astro", file), "utf8"));
}

/** Every <style> block Astro inlined into a page. */
export function inlineStylesheets(html) {
  return [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
}

/**
 * The complete shipped stylesheet: external files plus every page's inline blocks.
 * `pages` is a list of raw HTML strings (or objects with an `html` property).
 */
export function shippedCss(dist, pages = []) {
  const inline = pages.flatMap((page) => inlineStylesheets(typeof page === "string" ? page : page.html));
  return [...externalStylesheets(dist), ...inline].join("\n");
}
