#!/usr/bin/env node
/**
 * JOURNAL BODY MIGRATION — JSON outline -> MDX.
 *
 * Phase 1 decision D-8: "journal bodies should be MDX, not JSON outlines. Editorial prose needs
 * inline images, pull quotes and the ability to embed a review card mid-paragraph. Reviews stay
 * structured JSON because their value is being the same shape every time."
 *
 * ============================================================================
 * THIS SCRIPT INVENTS NOTHING
 * ============================================================================
 * It is a ONE-WAY FORMAT MIGRATION of words that already exist in the canonical record:
 *
 *     locales[loc].sections[].heading   ->  ## heading
 *     locales[loc].sections[].summary   ->  a paragraph
 *
 * `content/mock/journal.json` says so itself: "Bodies are abbreviated to section-level outlines
 * with representative opening prose." The migration preserves that abbreviation honestly rather
 * than expanding it into prose nobody wrote. The articles are SHORT because the mock content is
 * short, and that is the truthful state.
 *
 * `openingParagraph` is NOT copied into the body: it is the article's deck and the template
 * renders it above the body, exactly as it did when bodies were JSON.
 *
 * ============================================================================
 * WHAT IS THE SOURCE OF TRUTH AFTER THIS RUNS
 * ============================================================================
 *   ENTITY   content/mock/journal.json   — id, category, type, dates, relationships, SEO,
 *                                          lifecycle, provenance. UNCHANGED. Still canonical.
 *   BODY     content/mock/journal-bodies/{id}.{locale}.mdx
 *
 * There is NO frontmatter. Binding is by filename, so there is no second schema and nothing to
 * drift. `tools/check-journal-bodies.mjs` asserts the correspondence is exactly 1:1 in both
 * directions and fails the build otherwise.
 *
 * This script is idempotent and SKIPS any file that already exists, so hand-editing a body — to
 * mark a boundary section, or to place an inline reference where the prose genuinely calls for
 * one — is never overwritten by a re-run.
 *
 *   node scripts/seed-journal-mdx.mjs           seed missing bodies
 *   node scripts/seed-journal-mdx.mjs --force   overwrite (discards hand edits)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "content", "mock", "journal-bodies");
const force = process.argv.includes("--force");

const journal = JSON.parse(readFileSync(join(root, "content", "mock", "journal.json"), "utf8"));
mkdirSync(outDir, { recursive: true });

let written = 0;
let skipped = 0;

for (const record of journal.items ?? []) {
  for (const [locale, block] of Object.entries(record.locales ?? {})) {
    const file = join(outDir, `${record.id}.${locale}.mdx`);

    if (existsSync(file) && !force) {
      skipped++;
      continue;
    }

    const lines = [
      `{/*`,
      `  BODY ONLY. The entity lives in content/mock/journal.json — this file carries no`,
      `  frontmatter and no metadata, so there is no second schema to drift.`,
      ``,
      `  Seeded by scripts/seed-journal-mdx.mjs from locales.${locale}.sections[]. Every word below`,
      `  already existed in the canonical record; nothing was authored here.`,
      ``,
      `  Record: ${record.id}`,
      `  Locale: ${locale}`,
      `*/}`,
      ``,
    ];

    for (const section of block.sections ?? []) {
      lines.push(`## ${section.heading}`, "");
      if (section.summary) lines.push(section.summary, "");
      if (section.body) lines.push(section.body, "");
    }

    writeFileSync(file, lines.join("\n"), "utf8");
    written++;
  }
}

console.log("journal body migration");
console.log("=".repeat(58));
console.log(`  written ${written}`);
console.log(`  skipped ${skipped} (already present — hand edits preserved)`);
console.log(`  output  content/mock/journal-bodies/`);
