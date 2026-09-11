/**
 * ROBOTS.TXT — minimal, explicit, and constant regardless of build state.
 *
 * ============================================================================
 * WHY THIS FILE DOES NOT CHANGE BETWEEN A MOCK AND A REAL BUILD
 * ============================================================================
 * Every other indexability decision on this site is made with `<meta name="robots">`, per page,
 * composed with `IS_INDEXABLE_BUILD` (src/lib/routing.ts `robotsContent()`). That mechanism
 * already makes every page `noindex` while the source is mock — robots.txt does not need to
 * duplicate it, and duplicating it would create a second, competing place the same decision is
 * made.
 *
 * robots.txt answers a different question: not "should this be INDEXED" but "may this be
 * CRAWLED". There is nothing on this site a crawler should be blocked from fetching — no admin
 * surface, no search results, no API, no account area (there are no accounts — Phase 7). Blocking
 * crawl access to the gated facet pages would be actively counterproductive: a crawler that
 * cannot FETCH a page cannot see its `noindex` meta tag or its canonical link either, which is
 * the well-documented "indexed, though blocked by robots.txt" failure mode. So this file allows
 * everything, and lets the per-page meta tag do the actual work — matching the brief's own
 * instruction: "Do not disallow legitimate public routes merely as a shortcut."
 *
 * ============================================================================
 * THE SITEMAP REFERENCE
 * ============================================================================
 * Built from `absoluteUrl()`, the same single canonical origin every other absolute URL on this
 * site already uses (src/config/site.ts). This is not inventing a new fact — U-01 remains
 * unresolved and `SITE_URL` remains the reserved `.invalid` placeholder until a real domain is
 * supplied, exactly as it does in every canonical tag, every hreflang alternate and every
 * JSON-LD block already shipping. robots.txt referencing the sitemap through the same constant is
 * consistency, not a new invention.
 */

import { absoluteUrl, machinePath } from "./routing.ts";

export function robotsTxtContent(): string {
  const sitemap = absoluteUrl(machinePath.sitemapIndex());
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${sitemap}`,
    "",
  ].join("\n");
}
