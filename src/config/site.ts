/**
 * SITE ORIGIN — THE SINGLE CANONICAL CONFIGURATION SOURCE.
 *
 * Everything that needs an absolute URL derives from here and from nowhere else:
 *   canonical · hreflang · x-default · Open Graph url · Twitter url · JSON-LD @id and url
 *   fields · the sitemap origin · the robots origin · the RSS feed origin
 *
 * `astro.config.ts` imports this so that `Astro.site` and this constant can never disagree.
 * No template contains a domain literal; `tests/global.test.mjs` asserts that.
 *
 * ============================================================================
 * U-01 RESOLVED — PHASE 9
 * ============================================================================
 * The production domain was purchased through Hostinger and supplied by the project owner as an
 * authoritative fact: `https://zinaalmokri.com`. Eventual deployment is a Hostinger VPS; that is
 * an infrastructure/DNS/TLS concern out of scope for this file and for this phase — this constant
 * changes what URLs the BUILD generates, not where the build is served from.
 *
 * `example.invalid` served its purpose exactly as designed: every canonical, hreflang, sitemap,
 * robots and RSS URL in Phases 4–8 carried it, so changing this one line is the entire migration.
 * Nothing else needed to move — which is the property the placeholder was chosen to prove.
 *
 * ============================================================================
 * WHAT THIS CHANGE DOES NOT DO
 * ============================================================================
 * Resolving the DOMAIN is independent of resolving whether the CONTENT is real. The sitemap and
 * RSS feed remain empty, and every page remains `noindex`, because `IS_INDEXABLE_BUILD`
 * (src/lib/content.ts) is driven by `CONTENT_SOURCE === "mock"`, not by whether a domain exists.
 * A real domain publishing a mock corpus is exactly the situation the mock guard exists to catch
 * — it still fails this build, correctly, until `CONTENT_SOURCE` itself changes. That is a
 * separate, later decision, not implied by knowing where the site will eventually live.
 */
export const SITE_URL = "https://zinaalmokri.com";

/** True while the origin is still the reserved placeholder. False since Phase 9 (U-01 resolved). */
export const SITE_URL_IS_PLACEHOLDER = SITE_URL.endsWith(".invalid");
