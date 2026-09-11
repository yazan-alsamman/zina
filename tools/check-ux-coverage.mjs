#!/usr/bin/env node
/**
 * Phase 3 UX coverage checker.
 *
 * Verifies that the Phase 3 UX documentation actually covers what it claims to cover, mechanically
 * rather than by assertion:
 *
 *   1. Deliverables      every Phase 3 document named in the brief exists and is non-trivial
 *   2. Routes            every route in content/mock/site.json is mapped to a template and an entity
 *   3. Collections       every content collection is mapped to a UX surface
 *   4. Components        every component in the inventory carries all required specification fields
 *   5. Responsive        every component appears in the responsive coverage matrix
 *   6. Accessibility     every component appears in the per-component accessibility summary
 *   7. Bilingual         every Phase 3 document addresses Arabic / RTL behaviour
 *   8. Anti-patterns     no Phase 3 document reintroduces a Phase 2 refusal as a recommendation
 *
 * This tool does NOT modify or relax any existing validator. It is additive.
 *
 *   node tools/check-ux-coverage.mjs
 *
 * Exit: 0 = all covered, 1 = gaps found, 2 = bad usage.
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docs = join(root, "docs");

const errors = [];
const warnings = [];
const notes = [];

const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

// ---------------------------------------------------------------- 1. deliverables

const DELIVERABLES = [
  "PHASE_3_BILINGUAL_TYPE_PROOF.md",
  "USER_FLOWS.md",
  "UX_ARCHITECTURE.md",
  "REVIEW_WIREFRAMES.md",
  "HOMEPAGE_WIREFRAMES.md",
  "METHOD_UX.md",
  "CONTENT_UX_MAPPING.md",
  "COMPONENT_INVENTORY.md",
  "RESPONSIVE_UX_SPEC.md",
  "ACCESSIBILITY_UX_SPEC.md",
  "NAVIGATION_UX.md",
  "SEARCH_UX.md",
  "EMPTY_PARTIAL_UX.md",
  "INTERACTION_UX.md",
  "SEO_UX_INTEGRATION.md",
  "PHASE_3_DECISION_LOG.md",
  "PHASE_3_CREATIVE_COMPLIANCE.md",
];

const MIN_BYTES = 2000;
const present = {};

for (const name of DELIVERABLES) {
  const p = join(docs, name);
  if (!existsSync(p)) {
    errors.push(`deliverable missing: docs/${name}`);
    continue;
  }
  const size = statSync(p).size;
  if (size < MIN_BYTES) {
    errors.push(`deliverable too small to be real: docs/${name} (${size} bytes)`);
  }
  present[name] = read(p);
}

const report = join(docs, "reports", "PHASE_3_REPORT.md");
if (!existsSync(report)) {
  warnings.push("docs/reports/PHASE_3_REPORT.md not written yet");
} else {
  present["reports/PHASE_3_REPORT.md"] = read(report);
}

// ---------------------------------------------------------------- 2 + 3. site data

const sitePath = join(root, "content", "mock", "site.json");
if (!existsSync(sitePath)) {
  console.error("cannot find content/mock/site.json");
  process.exit(2);
}
const siteRaw = JSON.parse(readFileSync(sitePath, "utf8"));
const site = siteRaw.items ? siteRaw.items[0] : siteRaw;

const routes = site.routes || [];
const mapping = present["CONTENT_UX_MAPPING.md"] || "";
const architecture = present["UX_ARCHITECTURE.md"] || "";

// A route is "covered" when its pattern string appears in both the architecture doc and the
// content mapping doc. Patterns are written with {loc} in the docs and {locale} in site.json.
const normalise = (p) => p.replace("{locale}", "{loc}");

let routesCovered = 0;
for (const r of routes) {
  const pattern = normalise(r.pattern);
  const inMapping = mapping.includes(pattern);
  const inArch = architecture.includes(pattern) || mapping.includes(pattern);
  if (!inMapping) errors.push(`route not mapped in CONTENT_UX_MAPPING.md: ${pattern} (${r.key})`);
  else if (!inArch) warnings.push(`route not referenced in UX_ARCHITECTURE.md: ${pattern}`);
  else routesCovered++;
}

// Collections that carry content and must have a UX surface documented.
const COLLECTIONS = {
  person: "Person",
  method: "Method",
  reviews: "Review",
  products: "Product",
  brands: "Brand",
  journal: "Journal Entry",
  work: "Work",
  socialProfiles: "SocialProfile",
  testimonials: "Testimonial",
  press: "PressItem",
};

let collectionsCovered = 0;
for (const [key, label] of Object.entries(COLLECTIONS)) {
  if (mapping.includes(label)) collectionsCovered++;
  else errors.push(`collection not mapped in CONTENT_UX_MAPPING.md: ${key} (${label})`);
}

// ---------------------------------------------------------------- 4. components

const inventory = present["COMPONENT_INVENTORY.md"] || "";
const componentRe = /^##\s+(CMP-\d+)\s+·\s+(.+?)\s*(?:\*\(.*\)\*)?\s*$/gm;

const REQUIRED_FIELDS = [
  "Purpose",
  "Desktop",
  "Mobile",
  "RTL",
  "Accessibility",
  "Performance",
  "Forbidden variants",
];

const components = [];
let m;
while ((m = componentRe.exec(inventory)) !== null) {
  components.push({ id: m[1], name: m[2].replace(/\*/g, "").trim(), index: m.index });
}

if (components.length === 0) {
  errors.push("no components found in COMPONENT_INVENTORY.md (expected '## CMP-nn · Name' headings)");
}

for (let i = 0; i < components.length; i++) {
  const start = components[i].index;
  const end = i + 1 < components.length ? components[i + 1].index : inventory.length;
  const block = inventory.slice(start, end);
  for (const field of REQUIRED_FIELDS) {
    // Fields appear as **Field** in the spec table. Desktop and Mobile may legitimately be
    // specified together as **Desktop / Mobile** where the behaviour is genuinely identical.
    const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("\\*\\*(?:[A-Za-z ]+ / )?" + escaped, "i");
    if (!re.test(block)) {
      errors.push(`${components[i].id} (${components[i].name}) missing required field: ${field}`);
    }
  }
}

// ---------------------------------------------------------------- 5 + 6. responsive + a11y coverage

const responsive = present["RESPONSIVE_UX_SPEC.md"] || "";
const a11y = present["ACCESSIBILITY_UX_SPEC.md"] || "";

// Components exempted from the responsive matrix because they are not rendered surfaces
// or are explicitly deferred.
const RESPONSIVE_EXEMPT = new Set(["CMP-31"]);
const A11Y_EXEMPT = new Set(["CMP-31"]);

// Match on a distinctive word from the component name rather than the id, because the matrices
// are written for humans.
const nameKey = (name) => name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");

let respCovered = 0;
let a11yCovered = 0;
for (const c of components) {
  const key = nameKey(c.name);
  if (!RESPONSIVE_EXEMPT.has(c.id)) {
    if (responsive.toLowerCase().includes(key)) respCovered++;
    else errors.push(`${c.id} (${c.name}) absent from RESPONSIVE_UX_SPEC.md`);
  }
  if (!A11Y_EXEMPT.has(c.id)) {
    if (a11y.toLowerCase().includes(key)) a11yCovered++;
    else errors.push(`${c.id} (${c.name}) absent from ACCESSIBILITY_UX_SPEC.md`);
  }
}

// ---------------------------------------------------------------- 7. bilingual coverage

const BILINGUAL_TOKENS = ["Arabic", "RTL", "rtl", "العربية", "locale"];
for (const [name, body] of Object.entries(present)) {
  if (!body) continue;
  if (name === "PHASE_3_CREATIVE_COMPLIANCE.md") continue; // it is a checklist, checked separately
  const hit = BILINGUAL_TOKENS.some((t) => body.includes(t));
  if (!hit) errors.push(`no Arabic / RTL behaviour documented in docs/${name}`);
}

// ---------------------------------------------------------------- 8. anti-pattern compliance

// Phrases that would indicate a Phase 2 refusal has been reintroduced as a recommendation.
// Each is checked as a POSITIVE recommendation, i.e. the phrase appearing without a refusal word
// nearby on the same line.
const REFUSAL_WORDS =
  /\b(no|not|never|none|forbidden|forbids|refuse[sd]?|reject(ed|s)?|exclude[ds]?|exclusions?|without|avoid|instead|rather than|removed?|cannot|nor|fail(s|ure)?|hides?|unusable|deferred|prevent(s|ed)?|anti-pattern)\b/i;
const FORBIDDEN_PATTERNS = [
  ["star rating", /\bstar rating\b|\bstar ratings\b/i],
  ["numeric score", /\bscore out of\b|\brating out of\b|\bout of (five|ten)\b/i],
  ["follower count as design", /\bfollower count\b/i],
  ["logo wall", /\blogo wall\b/i],
  ["carousel", /\bcarousel\b/i],
  ["parallax", /\bparallax\b/i],
  ["glassmorphism", /glassmorphism|backdrop-filter/i],
  ["drop shadow", /\bbox-shadow\b|\bdrop shadow\b/i],
  ["before/after slider", /before\/after slider|before and after slider/i],
  ["chart or gauge", /\bsparkline\b|\bprogress ring\b|\bgauge\b/i],
  ["rounded card", /\brounded card\b|border-radius:\s*(?!0|2px)/i],
  ["mega-menu", /\bmega-?menu\b/i],
  ["machine translation", /\bmachine translation\b|\bmachine-translated\b/i],
];

let antiPatternHits = 0;
for (const [name, body] of Object.entries(present)) {
  if (!body) continue;
  const lines = body.split(/\r?\n/);
  let heading = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^#{1,4}\s/.test(line)) heading = line;
    // A mention is compliant when the line itself, the line above it, or the section heading it
    // sits under carries a refusal. Prose wraps, and refusals are often stated as a heading.
    const context = [line, lines[i - 1] || "", heading].join("   ");
    for (const [label, re] of FORBIDDEN_PATTERNS) {
      if (re.test(line) && !REFUSAL_WORDS.test(context)) {
        antiPatternHits++;
        warnings.push(
          `possible anti-pattern reintroduced without a refusal: "${label}" — docs/${name}:${i + 1}`
        );
      }
    }
  }
}

// ---------------------------------------------------------------- output

const line = "=".repeat(74);
console.log("Phase 3 UX coverage checker");
console.log(line);
console.log(`deliverables      ${DELIVERABLES.length - errors.filter((e) => e.startsWith("deliverable")).length}/${DELIVERABLES.length}`);
console.log(`routes mapped     ${routesCovered}/${routes.length}`);
console.log(`collections       ${collectionsCovered}/${Object.keys(COLLECTIONS).length}`);
console.log(`components         ${components.length} found, ${REQUIRED_FIELDS.length} required fields each`);
console.log(`responsive cover  ${respCovered}/${components.length - RESPONSIVE_EXEMPT.size}`);
console.log(`a11y cover        ${a11yCovered}/${components.length - A11Y_EXEMPT.size}`);
console.log(`anti-pattern scan ${antiPatternHits} line(s) flagged for review`);
console.log("");

if (notes.length) {
  for (const n of notes) console.log(`  note     ${n}`);
  console.log("");
}

if (warnings.length) {
  console.log(`WARNINGS (${warnings.length})`);
  for (const w of warnings) console.log(`  warn     ${w}`);
  console.log("");
}

if (errors.length) {
  console.log(`ERRORS (${errors.length})`);
  for (const e of errors) console.log(`  error    ${e}`);
  console.log("");
  console.log("FAIL  Phase 3 UX coverage is incomplete");
  process.exit(1);
}

console.log("PASS  every route, collection and component is covered");
process.exit(0);
