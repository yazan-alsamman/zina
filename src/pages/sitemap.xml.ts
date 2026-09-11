/**
 * SITEMAP INDEX — /sitemap.xml
 *
 * Points at the two locale sitemaps, per docs/MULTILINGUAL_SEO_ARCHITECTURE.md section 8:
 *
 *     /sitemap.xml          index
 *       /sitemap-en.xml     English URLs only
 *       /sitemap-ar.xml     Arabic URLs only
 *
 * This file is deliberately NOT locale-prefixed — a sitemap index is a single technical document
 * for crawlers, not a page a reader visits, so it carries no `<html lang>` and needs no locale
 * variant of its own.
 *
 * The actual XML is built by `renderSitemapIndexXml()` in src/lib/sitemap.ts, so it is directly
 * testable with no build step. This file is only the Response wrapper.
 *
 * `output: "static"` (astro.config.ts) prerenders this at build time automatically. No
 * `prerender` export is needed in static mode; it is only required in "server"/hybrid output.
 */
import type { APIRoute } from "astro";
import { renderSitemapIndexXml } from "../lib/sitemap";

export const GET: APIRoute = () =>
  new Response(renderSitemapIndexXml(), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
