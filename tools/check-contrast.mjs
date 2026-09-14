#!/usr/bin/env node
/**
 * WCAG contrast verification for the Phase 11 "Blush Atelier" colour specification
 * (src/styles/tokens.css). The Phase 2 warm-ink palette it originally verified was retired in Phase 11.
 *
 * This is a SPECIFICATION CHECK, not an implementation. It exists so that
 * docs/COLOR_SYSTEM.md can state measured contrast ratios instead of assumed ones,
 * per the Phase 2 brief ("Do not assume contrast is acceptable").
 *
 * Zero dependencies.
 *
 * Usage:  node tools/check-contrast.mjs
 * Exit:   0 = every required pair passes, 1 = at least one required pair fails
 *
 * Thresholds (WCAG 2.1):
 *   AA  normal text   4.5:1
 *   AA  large text    3.0:1   (>=24px, or >=18.66px bold)
 *   AA  non-text      3.0:1   (UI components, focus indicators, meaningful graphics)
 *   AAA normal text   7.0:1
 */

/* ------------------------------------------------------------------ palette */

const C = {
  // PHASE 11 — "Blush Atelier". Layered light grounds; plum near-black text, never #000.
  "ground.base": "#FBF6F2",      // ivory — the page
  "ground.raised": "#F6E7E3",    // blush — disclosure band, raised surfaces
  "ground.inset": "#F0DAD6",     // powder — conditions well, evidence strip
  "ground.champagne": "#F3E9DE", // champagne sections
  "ground.nude": "#EBD9CF",
  "ground.card": "#FFFAF7",      // review cards, captions
  "ground.wine": "#2E1119",      // footer, closing statement, fullscreen menu

  // Text on light grounds
  "text.primary": "#2B1A1F",
  "text.secondary": "#5A444B",
  "text.muted": "#75595F",
  "text.onAccent": "#FFF8F5",

  // Lines
  "line.hairline": "#EAD7D3",    // decorative only
  "line.strong": "#8C6B71",      // meaningful boundaries, >= 3:1 on ivory, blush and card

  // Accents
  "accent.clay": "#9C3556",      // deep rose — links, CTAs, verdict rule
  "accent.clay.hover": "#7A2342",// burgundy
  "accent.mineral": "#74405F",   // muted plum — the observed voice

  // Status
  "status.success": "#3D6A4C",
  "status.warning": "#86570F",
  "status.error": "#A1303A",

  // Evidence semantics
  "evidence.claim": "#75595F",
  "evidence.observation": "#74405F",
  "evidence.verdict": "#2B1A1F",

  // The wine surface re-maps text tokens (src/styles/global.css .tone-wine)
  "wine.text.primary": "#FBF1EE",
  "wine.text.secondary": "#ECC9C9",
  "wine.text.muted": "#CFAAB1",
  "wine.accent": "#F3B8C6",
  "wine.line.strong": "#A9828B",
};

/* Pairs to verify: [foreground, background, minimum ratio, label, required?] */
const PAIRS = [
  // Body and editorial text
  ["text.primary", "ground.base", 4.5, "Body text on ivory", true],
  ["text.primary", "ground.raised", 4.5, "Body text on blush", true],
  ["text.primary", "ground.inset", 4.5, "Body text on powder", true],
  ["text.primary", "ground.champagne", 4.5, "Body text on champagne", true],
  ["text.secondary", "ground.base", 4.5, "Secondary text on ivory", true],
  ["text.secondary", "ground.raised", 4.5, "Secondary text on blush", true],
  ["text.secondary", "ground.inset", 4.5, "Secondary text on powder", true],
  ["text.muted", "ground.base", 4.5, "Muted text on ivory (metadata)", true],
  ["text.muted", "ground.raised", 4.5, "Muted text on blush", true],
  ["text.muted", "ground.inset", 4.5, "Muted text on powder", true],
  ["text.muted", "ground.nude", 4.5, "Muted text on nude", true],
  ["text.muted", "ground.card", 4.5, "Muted text on card", true],

  // Accents as text
  ["accent.clay", "ground.base", 4.5, "Deep rose link on ivory", true],
  ["accent.clay", "ground.raised", 4.5, "Deep rose link on blush", true],
  ["accent.clay", "ground.inset", 4.5, "Deep rose label on powder", true],
  ["accent.clay.hover", "ground.base", 4.5, "Burgundy hover on ivory", true],
  ["accent.mineral", "ground.base", 4.5, "Plum observation on ivory", true],
  ["accent.mineral", "ground.raised", 4.5, "Plum observation on blush", true],

  // Accent as a surface with light text on it (buttons)
  ["text.onAccent", "accent.clay", 4.5, "Ivory text on deep rose button", true],
  ["text.onAccent", "accent.clay.hover", 4.5, "Ivory text on burgundy hover", true],

  // Evidence semantics
  ["evidence.claim", "ground.raised", 4.5, "Claim text (deliberately recessed)", true],
  ["evidence.observation", "ground.base", 4.5, "Observation text", true],
  ["evidence.verdict", "ground.raised", 4.5, "Verdict text", true],

  // Status
  ["status.success", "ground.base", 4.5, "Success text", true],
  ["status.warning", "ground.base", 4.5, "Warning text (disclosure pending)", true],
  ["status.warning", "ground.raised", 4.5, "Warning text on blush", true],
  ["status.error", "ground.base", 4.5, "Error text", true],

  // The wine surface
  ["wine.text.primary", "ground.wine", 4.5, "Ivory text on wine", true],
  ["wine.text.secondary", "ground.wine", 4.5, "Blush text on wine", true],
  ["wine.text.muted", "ground.wine", 4.5, "Muted text on wine", true],
  ["wine.accent", "ground.wine", 4.5, "Rose accent on wine", true],
  ["wine.line.strong", "ground.wine", 3.0, "Meaningful border on wine (non-text)", true],

  // Non-text: UI components, borders that carry meaning, focus rings
  ["line.strong", "ground.base", 3.0, "Meaningful border on ivory (non-text)", true],
  ["line.strong", "ground.raised", 3.0, "Meaningful border on blush (non-text)", true],
  ["accent.clay", "ground.base", 3.0, "Focus ring on ivory (non-text)", true],
  ["accent.clay", "ground.raised", 3.0, "Focus ring on blush (non-text)", true],
  ["accent.mineral", "ground.base", 3.0, "Observation rule on ivory (non-text)", true],

  // Decorative only: hairline rules carry no meaning, so no minimum applies.
  ["line.hairline", "ground.base", 0, "Hairline rule (decorative, no minimum)", false],

  // AAA aspiration for long-form reading
  ["text.primary", "ground.base", 7.0, "AAA: long-form reading on ivory", false],
  ["text.secondary", "ground.base", 7.0, "AAA: secondary long-form", false],
];

/* --------------------------------------------------------------- maths */

const srgb = (v) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

const luminance = (hex) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
};

const contrast = (a, b) => {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

/* --------------------------------------------------------------- report */

const failures = [];
const notes = [];

console.log("\nWCAG contrast verification  —  Zina Almokri Phase 11 palette");
console.log("=".repeat(94));
console.log(
  "PAIR".padEnd(46) + "FG".padEnd(10) + "BG".padEnd(10) + "RATIO".padEnd(9) + "MIN".padEnd(7) + "RESULT"
);
console.log("-".repeat(94));

for (const [fgKey, bgKey, min, label, required] of PAIRS) {
  const fg = C[fgKey];
  const bg = C[bgKey];
  if (!fg || !bg) {
    failures.push(`unknown token in pair: ${fgKey} / ${bgKey}`);
    continue;
  }
  const ratio = contrast(fg, bg);
  const pass = ratio >= min;
  const mark = min === 0 ? "n/a" : pass ? "PASS" : required ? "FAIL" : "below";
  if (!pass && required && min > 0) failures.push(`${label}: ${ratio.toFixed(2)}:1 < ${min}:1`);
  if (!pass && !required && min > 0) notes.push(`${label}: ${ratio.toFixed(2)}:1 (aspiration ${min}:1)`);
  console.log(
    label.slice(0, 45).padEnd(46) +
      fg.padEnd(10) +
      bg.padEnd(10) +
      `${ratio.toFixed(2)}:1`.padEnd(9) +
      (min === 0 ? "—" : `${min}:1`).padEnd(7) +
      mark
  );
}

console.log("-".repeat(94));

// Highest usable ratio for reference
const maxRatio = contrast(C["text.primary"], C["ground.inset"]);
console.log(`\nmaximum ratio in system: ${maxRatio.toFixed(2)}:1  (text.primary on ground.inset)`);
console.log(
  `pure black on white would be 21.00:1 — deliberately NOT used: text is plum near-black on warm ivory`
);

if (notes.length) {
  console.log(`\nAAA aspirations not met (acceptable, AA is the requirement):`);
  notes.forEach((n) => console.log(`  ~ ${n}`));
}

if (failures.length) {
  console.log(`\nFAILURES (${failures.length})`);
  failures.forEach((f) => console.log(`  x ${f}`));
  console.log("\nFAIL\n");
  process.exit(1);
}

console.log(`\nPASS  all ${PAIRS.filter((p) => p[4]).length} required pairs meet their threshold\n`);
