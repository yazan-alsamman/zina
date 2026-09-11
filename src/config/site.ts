/**
 * SITE ORIGIN — THE SINGLE CANONICAL CONFIGURATION SOURCE.
 *
 * Everything that needs an absolute URL derives from here and from nowhere else:
 *   canonical · hreflang · x-default · Open Graph url · Twitter url · JSON-LD @id and url
 *   fields · the future sitemap origin · the future robots origin
 *
 * `astro.config.ts` imports this so that `Astro.site` and this constant can never disagree.
 * No template contains a domain literal; `tests/global.test.mjs` asserts that.
 *
 * ============================================================================
 * THE DOMAIN IS NOT KNOWN — UNKNOWN U-01, BLOCKING SINCE PHASE 0
 * ============================================================================
 * `example.invalid` is a reserved TLD that can never resolve (RFC 2606). It is chosen
 * deliberately over a plausible-looking placeholder so that:
 *
 *   - a placeholder canonical can never be mistaken for a real one in a review
 *   - a build that reached production would fail loudly rather than publish wrong URLs
 *   - nobody is tempted to "just use" it
 *
 * SEO URLS REMAIN BLOCKED FROM PRODUCTION USE UNTIL A REAL DOMAIN IS SUPPLIED.
 * When it is, change this one line. Nothing else needs to move.
 *
 * Do not invent a domain.
 */
export const SITE_URL = "https://example.invalid";

/** True while the origin is still the reserved placeholder. Surfaced in the Phase 5 report. */
export const SITE_URL_IS_PLACEHOLDER = SITE_URL.endsWith(".invalid");
