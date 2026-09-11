// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { SITE_URL } from "./src/config/site.ts";

/**
 * Zina Almokri — Astro configuration.
 *
 * `site` is imported from the single canonical origin source (src/config/site.ts) rather than
 * declared here, so `Astro.site` and the SITE_URL constant used by the lib layer can never
 * disagree. Phase 5 brief section 5.
 *
 * Decisions in docs/PHASE_4_DECISION_LOG.md and docs/PHASE_5_DECISION_LOG.md:
 *  - Static output. Every page in this architecture is a document.
 *  - trailingSlash "always", matching content/mock/site.json and the router.
 *  - ONE integration: @astrojs/mdx, for journal bodies (Phase 1 decision D-8). It compiles to
 *    static HTML at build time and ships NO client runtime — the zero-JavaScript baseline is
 *    unchanged, and tests/global.test.mjs asserts it. Sitemap generation is still Phase 8.
 */
export default defineConfig({
  site: SITE_URL,
  integrations: [
    mdx({
      // Journal bodies are prose. No syntax highlighting is needed and shipping a highlighter
      // would add weight for a feature the content never uses.
      syntaxHighlight: false,
      // GitHub-flavoured Markdown gives tables and strikethrough from native syntax, so a table
      // does not need to become a custom component.
      gfm: true,
    }),
  ],
  output: "static",
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "auto" },
  compressHTML: true,
  devToolbar: { enabled: false },
  markdown: { syntaxHighlight: false },
});
