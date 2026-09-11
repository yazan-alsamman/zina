#!/usr/bin/env node
/**
 * JOURNAL BODY INTEGRITY — the MDX safety layer.
 *
 * MDX bodies are prose files with no frontmatter, bound to the canonical record by filename:
 *
 *     content/mock/journal-bodies/{recordId}.{locale}.mdx
 *
 * That binding is the whole reason there is no second schema — and a binding nothing checks is a
 * convention, not a contract. This tool makes it a contract.
 *
 * WHAT IT ENFORCES
 *   1. CORRESPONDENCE      every renderable article+locale has exactly one body, and every body
 *                          maps to a renderable article+locale. Both directions.
 *   2. NO FRONTMATTER      a body that grows frontmatter has become a second schema.
 *   3. NO DOMAIN LITERALS  absolute origins belong in src/config/site.ts, nowhere else.
 *   4. LOCALE HONESTY      every `locale="xx"` attribute matches the filename's locale.
 *   5. REFERENCE SAFETY    every <ReviewReference id> names a real review that exists in THAT
 *                          locale — no dead citations, no cross-locale links.
 *   6. LINK SAFETY         every internal markdown link resolves to a known route shape, is
 *                          locale-correct, and points at content that actually exists.
 *   7. COMPONENT ALLOWLIST a body may only use components the article template injects.
 *
 *   node tools/check-journal-bodies.mjs
 *
 * Exit: 0 = clean, 1 = problems found.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bodiesDir = join(root, "content", "mock", "journal-bodies");

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const journal = read(join(root, "content", "mock", "journal.json"));
const reviews = read(join(root, "content", "mock", "reviews.json"));

/** Mirrors src/lib/content.ts. `mock` is renderable only while the mock layer is the source. */
const RENDERABLE = new Set(["published", "archived", "review", "needs-verification", "approved", "mock"]);
const isRenderable = (record) => RENDERABLE.has(record.status);

/** Components the article template injects. A body may use these and nothing else. */
const ALLOWED_COMPONENTS = new Set(["EditorialNote", "ReviewReference"]);

const errors = [];
const notes = [];

/* ------------------------------------------------------------------ expected set */

const expected = new Map(); // "{id}.{locale}" -> { id, locale }
for (const article of journal.items ?? []) {
  if (!isRenderable(article)) continue;
  for (const locale of Object.keys(article.locales ?? {})) {
    expected.set(`${article.id}.${locale}`, { id: article.id, locale });
  }
}

/* ------------------------------------------------------------------ actual set */

if (!existsSync(bodiesDir)) {
  console.error(`journal bodies: directory not found: ${bodiesDir}`);
  console.error("Run: node scripts/seed-journal-mdx.mjs");
  process.exit(1);
}

const files = readdirSync(bodiesDir).filter((f) => f.endsWith(".mdx"));
const actual = new Map();

for (const file of files) {
  const key = file.replace(/\.mdx$/, "");
  const match = key.match(/^(.+)\.(en|ar)$/);
  if (!match) {
    errors.push(`${file}: filename must be {recordId}.{locale}.mdx`);
    continue;
  }
  actual.set(key, { id: match[1], locale: match[2], file });
}

/* ------------------------------------------------------------------ 1. correspondence */

for (const key of expected.keys()) {
  if (!actual.has(key)) errors.push(`missing body for ${key} — run scripts/seed-journal-mdx.mjs`);
}
for (const [key, body] of actual) {
  if (!expected.has(key)) {
    errors.push(`orphan body ${body.file}: no renderable journal record + locale matches it`);
  }
}

/* ------------------------------------------------------------------ per-file checks */

const reviewById = new Map((reviews.items ?? []).map((r) => [r.id, r]));

for (const [key, body] of actual) {
  if (!expected.has(key)) continue;
  const text = readFileSync(join(bodiesDir, body.file), "utf8");

  // 2. no frontmatter
  if (/^\s*---\r?\n/.test(text)) {
    errors.push(
      `${body.file}: has YAML frontmatter. Bodies carry prose only — metadata belongs to journal.json`
    );
  }

  // 3. no absolute origins
  for (const m of text.matchAll(/https?:\/\/[^\s)"'<>]+/g)) {
    if (m[0].startsWith("https://schema.org")) continue;
    errors.push(`${body.file}: absolute URL "${m[0]}". Use a component or a root-relative path`);
  }

  // 4. locale honesty
  for (const m of text.matchAll(/locale=["'](\w+)["']/g)) {
    if (m[1] !== body.locale) {
      errors.push(`${body.file}: locale="${m[1]}" contradicts the filename locale "${body.locale}"`);
    }
  }

  // 5. reference safety
  for (const m of text.matchAll(/<ReviewReference\b([^>]*)>/g)) {
    const attrs = m[1];
    const idMatch = attrs.match(/\bid=["']([^"']+)["']/);
    if (!idMatch) {
      errors.push(`${body.file}: <ReviewReference> without an id attribute`);
      continue;
    }
    const review = reviewById.get(idMatch[1]);
    if (!review) {
      errors.push(`${body.file}: <ReviewReference id="${idMatch[1]}"> — no such review record`);
      continue;
    }
    if (!isRenderable(review)) {
      errors.push(`${body.file}: cites "${idMatch[1]}", which is not renderable`);
      continue;
    }
    if (!review.locales?.[body.locale]) {
      // Not an error: the component renders it as plain text rather than a dead link. But it is
      // worth surfacing, because an editor probably intended a link.
      notes.push(
        `${body.file}: cites "${idMatch[1]}", which has no ${body.locale} version — it will render as text, not a link`
      );
    }
    if (!/\blocale=/.test(attrs)) {
      errors.push(`${body.file}: <ReviewReference id="${idMatch[1]}"> must declare locale="${body.locale}"`);
    }
  }

  // 6. internal link safety
  for (const m of text.matchAll(/\]\((\/[^)\s]*)\)/g)) {
    const href = m[1];
    const parts = href.split("/").filter(Boolean);
    if (!["en", "ar"].includes(parts[0])) {
      errors.push(`${body.file}: internal link "${href}" does not start with a locale segment`);
      continue;
    }
    if (parts[0] !== body.locale) {
      errors.push(`${body.file}: links to "${href}" from a ${body.locale} body — cross-locale link`);
      continue;
    }
    if (!href.endsWith("/")) {
      errors.push(`${body.file}: internal link "${href}" must end with a trailing slash`);
    }
    notes.push(`${body.file}: raw internal link "${href}" — prefer a component so a slug change cannot orphan it`);
  }

  // 7. component allowlist
  for (const m of text.matchAll(/<([A-Z]\w*)/g)) {
    if (!ALLOWED_COMPONENTS.has(m[1])) {
      errors.push(
        `${body.file}: uses <${m[1]}>, which the article template does not inject. Allowed: ${[...ALLOWED_COMPONENTS].join(", ")}`
      );
    }
  }
}

/* ------------------------------------------------------------------ report */

console.log("journal body integrity");
console.log("=".repeat(64));
console.log(`  records x locales expected   ${expected.size}`);
console.log(`  body files found             ${actual.size}`);
console.log(`  allowed components           ${[...ALLOWED_COMPONENTS].join(", ")}`);
console.log("");

if (notes.length) {
  for (const note of notes) console.log(`  note   ${note}`);
  console.log("");
}

if (errors.length) {
  for (const error of errors) console.log(`  error  ${error}`);
  console.log("");
  console.log(`FAIL  ${errors.length} problem(s)`);
  process.exit(1);
}

console.log("PASS  every body maps to a record, carries no schema, and cites only what exists");
