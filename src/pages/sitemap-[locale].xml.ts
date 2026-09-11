/**
 * LOCALE SITEMAP — /sitemap-en.xml, /sitemap-ar.xml
 *
 * Every `<url>` entry comes from `discoverableUrlsFor()` (src/lib/sitemap.ts), which calls the
 * SAME gate functions each page template calls for its own `<meta name="robots">` and `<head>`
 * hreflang set. The XML itself is built by `renderLocaleSitemapXml()`, also in that file, so both
 * the URL SET and its RENDERING are directly testable with no build step. This file is only the
 * Response wrapper. See src/lib/sitemap.ts's header for the full reasoning, and
 * docs/MULTILINGUAL_SEO_ARCHITECTURE.md section 8 for the two-file-per-locale shape this
 * implements.
 *
 * `tests/sitemap.test.mjs` cross-validates this file's actual built output against every listed
 * page's own rendered canonical + hreflang, so drift between this file and the pages it lists is
 * asserted impossible rather than merely hoped for.
 *
 * The `__MOCK_DATA__` marker is deliberately NOT added here. Unlike the RSS feed, this file
 * carries no article content while the source is mock — `discoverableUrlsFor()` returns an empty
 * array whenever `IS_INDEXABLE_BUILD` is false, so there is nothing mock to mark. See
 * src/lib/sitemap.ts for why an empty sitemap is the correct, honest output in that state.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import type { Locale } from "../../content/schema/types";
import { discoverableUrlsFor, renderLocaleSitemapXml } from "../lib/sitemap";

export const getStaticPaths = (() => [
  { params: { locale: "en" } },
  { params: { locale: "ar" } },
]) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const locale = params.locale as Locale;
  return new Response(renderLocaleSitemapXml(discoverableUrlsFor(locale)), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
