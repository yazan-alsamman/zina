#!/usr/bin/env node
/**
 * Production mock guard.
 *
 * Scans a directory for any trace of the mock content layer and exits non-zero if it finds one.
 * Intended to run against the build output as the last step before deploy, and in CI on every
 * pull request that touches content.
 *
 *   node tools/check-mock-guard.mjs dist
 *   node tools/check-mock-guard.mjs .next/server
 *
 * The point is that shipping fabricated content should be a build failure, not a code review
 * that someone was having a bad day during.
 *
 * Exit: 0 = clean, 1 = mock traces found, 2 = bad usage
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve, relative, extname } from "node:path";

const target = process.argv[2];
if (!target) {
  console.error("usage: node tools/check-mock-guard.mjs <dir-to-scan>");
  process.exit(2);
}
const root = resolve(target);
if (!existsSync(root)) {
  console.error(`mock guard: path does not exist: ${root}`);
  process.exit(2);
}

/** Each signature is a way mock content could reach a user. */
const SIGNATURES = [
  { id: "file-marker",   re: /__MOCK_DATA__/,                       why: "mock collection envelope" },
  { id: "record-marker", re: /"_mock"\s*:\s*true/,                  why: "mock record marker" },
  { id: "status-mock",   re: /"status"\s*:\s*"mock"/,               why: "unpublishable lifecycle state" },
  { id: "id-prefix",     re: /\bmock-(person|brand|product|review|work|journal|press|social|testimonial|site)-/, why: "mock record id" },
  { id: "media-path",    re: /\/mock-media\//,                      why: "placeholder media path" },
  { id: "mock-handle",   re: /[a-z0-9.@-]+\.mock\b/i,               why: "placeholder social handle" },
  { id: "example-host",  re: /https?:\/\/[a-z0-9.-]*example\.com/i, why: "reserved example domain" },
  { id: "verification",  re: /"_verification"\s*:\s*"MOCK"/,        why: "unverified content marker" },
  { id: "todo-verify",   re: /TODO:\s*VERIFY|CONTENT PLACEHOLDER/,  why: "unresolved placeholder" },
  { id: "mock-name",     re: /MOCK NAME/,                           why: "placeholder attribution" },
];

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", ".astro", "coverage", "tools", "docs"]);
const SCAN_EXT = new Set([".html", ".js", ".mjs", ".cjs", ".json", ".css", ".txt", ".xml", ".md", ".rss", ".webmanifest", ""]);

const hits = [];
let filesScanned = 0;

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) walk(p);
      continue;
    }
    if (!SCAN_EXT.has(extname(entry).toLowerCase())) continue;
    if (st.size > 8 * 1024 * 1024) continue;

    filesScanned++;
    let text;
    try {
      text = readFileSync(p, "utf8");
    } catch {
      continue;
    }
    for (const sig of SIGNATURES) {
      const m = text.match(sig.re);
      if (!m) continue;
      const line = text.slice(0, m.index).split("\n").length;
      hits.push({ file: relative(root, p), line, sig: sig.id, why: sig.why, sample: m[0].slice(0, 60) });
    }
  }
};

walk(root);

console.log(`\nmock guard  ${root}\n${"-".repeat(60)}`);
console.log(`files scanned  ${filesScanned}`);

if (!hits.length) {
  console.log(`\nCLEAN  no mock content found\n`);
  process.exit(0);
}

console.log(`\nBLOCKED  ${hits.length} mock trace(s) found\n`);
for (const h of hits) {
  console.log(`  x ${h.file}:${h.line}`);
  console.log(`      ${h.sig} (${h.why})  ->  ${h.sample}`);
}
console.log(`
This build contains fabricated content and must not be deployed.
Replace the mock content layer with verified client content before release.
See docs/REAL_CONTENT_MIGRATION.md
`);
process.exit(1);
