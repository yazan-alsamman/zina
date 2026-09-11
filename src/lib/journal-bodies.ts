/**
 * JOURNAL BODIES — the MDX prose layer, and the ONLY bundler-coupled module in src/lib.
 *
 * ============================================================================
 * WHY THIS IS A SEPARATE MODULE
 * ============================================================================
 * `import.meta.glob` is a Vite COMPILE-TIME transform. It is not a function, and it does not exist
 * in plain Node — a module containing it cannot be imported by `node --test`.
 *
 * Every other module in `src/lib` is deliberately runnable under Node's native type-stripping, so
 * the tests exercise THE SAME `.ts` FILES the bundler compiles rather than a parallel reimplement-
 * ation of the rules. Leaving the glob inside `journal.ts` silently forfeited that for the whole
 * journal layer: routing, taxonomy, gates and the link graph all became untestable because of one
 * line that had nothing to do with any of them.
 *
 * So the bundler dependency lives here, alone, and `journal.ts` stays pure. The rule this encodes:
 *
 *   a build-tool-specific API may not sit in a module that also holds testable domain logic.
 *
 * ============================================================================
 * THE BINDING
 * ============================================================================
 * Bodies are keyed by `{recordId}.{locale}.mdx`. There is NO frontmatter, so there is no second
 * entity schema and nothing to drift: the JSON record owns every field, the MDX file owns only
 * the prose. `tools/check-journal-bodies.mjs` enforces that correspondence in both directions.
 *
 * Build-time only. Nothing here reaches the client.
 */

import type { MDXInstance } from "astro";
import type { Locale } from "../../content/schema/types.ts";

/**
 * Astro's own MDX instance type. Using it rather than a hand-rolled shape keeps `Content` typed
 * as a real component factory, so the template can render it without a cast.
 */
export type JournalBody = MDXInstance<Record<string, unknown>>;

const bodyModules = import.meta.glob<JournalBody>("../../content/mock/journal-bodies/*.mdx", {
  eager: true,
});

const bodyKey = (id: string, locale: Locale) => `${id}.${locale}`;

const bodyIndex = new Map<string, JournalBody>(
  Object.entries(bodyModules).map(([filePath, mod]) => {
    const file = filePath.split("/").pop() ?? "";
    return [file.replace(/\.mdx$/, ""), mod];
  })
);

/** The rendered body for a record in a locale, or undefined if none exists. */
export const journalBody = (id: string, locale: Locale): JournalBody | undefined =>
  bodyIndex.get(bodyKey(id, locale));

export const hasJournalBody = (id: string, locale: Locale): boolean =>
  bodyIndex.has(bodyKey(id, locale));

/** Every body file present, as `{id}.{locale}` keys. Used by the correspondence validator. */
export const journalBodyKeys = (): string[] => [...bodyIndex.keys()].sort();

/**
 * Headings from the rendered body, for a table of contents.
 *
 * A TOC IS NOT AUTOMATIC. `docs/JOURNAL_ARCHITECTURE.md` gates it at 4+ sections, and the caller
 * decides — an article with three headings does not need navigation, it needs to be read.
 */
export const journalHeadings = (id: string, locale: Locale) => {
  const mod = journalBody(id, locale);
  return typeof mod?.getHeadings === "function" ? mod.getHeadings() : [];
};
