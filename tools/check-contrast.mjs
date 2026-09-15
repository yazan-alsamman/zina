#!/usr/bin/env node
/**
 * WCAG contrast verification for the "Quiet Luxury" colour specification
 * (src/styles/tokens.css). The Phase 11 "Blush Atelier" palette it previously verified was
 * retired in Phase 15, as the Phase 2 warm-ink palette had been before it.
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
  // ---- THE FIVE. The identity. Nothing outside these is invented.
  white: "#FFFFFF",
  "light.grey": "#EAEAEA",
  "warm.beige": "#B8A48F",
  "mocha.brown": "#4A3F35",
  black: "#000000",

  // ---- Grounds, lightest to darkest. Each derived value is a mix of two of the five.
  "ground.base": "#FFFFFF",       // white — the page
  "ground.card": "#FFFFFF",       // review cards, captions
  "ground.champagne": "#F6F4F2",  // porcelain: white 88% + beige 12%
  "ground.raised": "#EAEAEA",     // light grey — alternating sections, disclosure band
  "ground.inset": "#E1DDDA",      // linen: light grey 82% + beige 18%
  "ground.nude": "#D9D2CA",       // light grey 65% + beige 35%
  "ground.accent": "#B8A48F",     // warm beige — the accent band, BLACK type only
  "ground.wine": "#4A3F35",       // mocha — footer, closing statement, fullscreen menu

  // ---- Text on light grounds
  "text.primary": "#4A3F35",      // mocha
  "text.secondary": "#5B4E43",    // umber: mocha 85% + beige 15%
  "text.muted": "#625549",        // bark:  mocha 78% + beige 22%
  "text.strong": "#000000",       // the loudest editorial register
  "text.onAccent": "#FFFFFF",

  // ---- Lines
  "line.hairline": "#EAEAEA",     // decorative only
  "line.strong": "#817262",       // taupe: mocha 50% + beige 50% — meaningful boundaries

  // ---- Accents
  "accent.clay": "#4A3F35",       // mocha — links, CTAs, verdict rule
  "accent.clay.hover": "#000000", // the link hover TEXT
  "accent.mineral": "#5B4E43",    // umber — the observed voice

  // ---- CTA surfaces
  "cta.fill": "#4A3F35",
  "cta.fillHover": "#B8A48F",
  "cta.fgHover": "#000000",

  // ---- Status: deep, almost-neutral tints of the mocha family
  "status.success": "#3F4A38",
  "status.warning": "#6B5326",
  "status.error": "#6B3A32",

  // ---- Evidence semantics
  "evidence.claim": "#625549",
  "evidence.observation": "#5B4E43",
  "evidence.verdict": "#000000",

  // ---- The mocha surface re-maps text tokens (src/styles/global.css .tone-wine)
  "wine.text.primary": "#FFFFFF",
  "wine.text.secondary": "#EAEAEA",
  "wine.text.muted": "#C5B4A3",   // beige lifted 18% towards white
  "wine.accent": "#C5B4A3",
  "wine.line.strong": "#9D8B79",  // beige 75% + mocha 25%

  // ---- The warm beige surface re-maps them too (.tone-accent)
  "accentband.text": "#000000",
  "accentband.muted": "#4A3F35",
};

/* Pairs to verify: [foreground, background, minimum ratio, label, required?] */
const PAIRS = [
  // Body and editorial text across the whole ground ladder
  ["text.primary", "ground.base", 4.5, "Body text on white", true],
  ["text.primary", "ground.champagne", 4.5, "Body text on porcelain", true],
  ["text.primary", "ground.raised", 4.5, "Body text on light grey", true],
  ["text.primary", "ground.inset", 4.5, "Body text on linen", true],
  ["text.primary", "ground.nude", 4.5, "Body text on nude", true],
  ["text.secondary", "ground.base", 4.5, "Secondary text on white", true],
  ["text.secondary", "ground.raised", 4.5, "Secondary text on light grey", true],
  ["text.secondary", "ground.inset", 4.5, "Secondary text on linen", true],
  ["text.secondary", "ground.nude", 4.5, "Secondary text on nude", true],
  ["text.muted", "ground.base", 4.5, "Muted text on white (metadata)", true],
  ["text.muted", "ground.champagne", 4.5, "Muted text on porcelain", true],
  ["text.muted", "ground.raised", 4.5, "Muted text on light grey", true],
  ["text.muted", "ground.inset", 4.5, "Muted text on linen", true],
  ["text.muted", "ground.nude", 4.5, "Muted text on nude", true],
  ["text.muted", "ground.card", 4.5, "Muted text on card", true],
  ["text.strong", "ground.base", 4.5, "Strong editorial text on white", true],

  // Accents as text
  ["accent.clay", "ground.base", 4.5, "Mocha link on white", true],
  ["accent.clay", "ground.raised", 4.5, "Mocha link on light grey", true],
  ["accent.clay", "ground.inset", 4.5, "Mocha label on linen", true],
  ["accent.clay.hover", "ground.base", 4.5, "Black link hover on white", true],
  ["accent.mineral", "ground.base", 4.5, "Umber observation on white", true],
  ["accent.mineral", "ground.raised", 4.5, "Umber observation on light grey", true],

  // THE ACCENT RULE. Warm beige is a SURFACE on light grounds, never a foreground: these two
  // pairs are recorded as FAILING ON PURPOSE, and are the reason the system never sets type,
  // a link or a focus ring in #B8A48F on a light page.
  ["warm.beige", "ground.base", 4.5, "Warm beige AS TEXT on white — forbidden", false],
  ["warm.beige", "ground.base", 3.0, "Warm beige AS A FOCUS RING on white — forbidden", false],

  // Accent as a surface with type on it (buttons, the accent band)
  ["text.onAccent", "cta.fill", 4.5, "White text on the mocha CTA", true],
  ["cta.fgHover", "cta.fillHover", 4.5, "Black text on the warm beige CTA hover", true],
  ["accentband.text", "ground.accent", 4.5, "Black text on the warm beige band", true],
  ["accentband.muted", "ground.accent", 3.0, "Mocha large type on warm beige (non-text/large)", true],

  // Evidence semantics
  ["evidence.claim", "ground.raised", 4.5, "Claim text (deliberately recessed)", true],
  ["evidence.observation", "ground.base", 4.5, "Observation text", true],
  ["evidence.verdict", "ground.raised", 4.5, "Verdict text", true],

  // Status
  ["status.success", "ground.base", 4.5, "Success text", true],
  ["status.warning", "ground.base", 4.5, "Warning text (disclosure pending)", true],
  ["status.warning", "ground.raised", 4.5, "Warning text on light grey", true],
  ["status.error", "ground.base", 4.5, "Error text", true],

  // The mocha surface
  ["wine.text.primary", "ground.wine", 4.5, "White text on mocha", true],
  ["wine.text.secondary", "ground.wine", 4.5, "Light grey text on mocha", true],
  ["wine.text.muted", "ground.wine", 4.5, "Lifted beige text on mocha", true],
  ["wine.accent", "ground.wine", 4.5, "Beige accent on mocha", true],
  ["wine.line.strong", "ground.wine", 3.0, "Meaningful border on mocha (non-text)", true],

  // Non-text: UI components, borders that carry meaning, focus rings
  ["line.strong", "ground.base", 3.0, "Meaningful border on white (non-text)", true],
  ["line.strong", "ground.raised", 3.0, "Meaningful border on light grey (non-text)", true],
  ["line.strong", "ground.inset", 3.0, "Meaningful border on linen (non-text)", true],
  ["line.strong", "ground.nude", 3.0, "Meaningful border on nude (non-text)", true],
  ["accent.clay", "ground.base", 3.0, "Focus ring on white (non-text)", true],
  ["accent.clay", "ground.raised", 3.0, "Focus ring on light grey (non-text)", true],
  ["accent.clay", "ground.nude", 3.0, "Focus ring on nude (non-text)", true],
  ["accent.mineral", "ground.base", 3.0, "Observation rule on white (non-text)", true],

  // Decorative only: hairline rules carry no meaning, so no minimum applies.
  ["line.hairline", "ground.base", 0, "Hairline rule (decorative, no minimum)", false],

  // AAA aspiration for long-form reading
  ["text.primary", "ground.base", 7.0, "AAA: long-form reading on white", false],
  ["text.secondary", "ground.base", 7.0, "AAA: secondary long-form", false],
  ["text.muted", "ground.base", 7.0, "AAA: metadata on white", false],
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
/* Pairs recorded as failing ON PURPOSE: the measurements that justify a rule of the system. */
const forbiddenNotes = [];

console.log("\nWCAG contrast verification  —  Zina Almokri Quiet Luxury palette");
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
  if (!pass && !required && min > 0) (/forbidden/.test(label) ? forbiddenNotes : notes).push(`${label}: ${ratio.toFixed(2)}:1 (threshold ${min}:1)`);
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
console.log(
  `
the reading ladder on white:  primary ${contrast(C["text.primary"], C["ground.base"]).toFixed(2)}:1   ` +
  `secondary ${contrast(C["text.secondary"], C["ground.base"]).toFixed(2)}:1   ` +
  `muted ${contrast(C["text.muted"], C["ground.base"]).toFixed(2)}:1   ` +
  `strong ${contrast(C["text.strong"], C["ground.base"]).toFixed(2)}:1`
);
console.log(
  `
Black on white IS in this system at 21.00:1, but it is reserved for the loudest editorial
` +
  `register: verdicts, icons, fine rules. Body text is mocha brown, so the page reads warm
` +
  `rather than stark, and the whole reading ladder still clears AAA.`
);

if (forbiddenNotes.length) {
  console.log(`
Measured and FORBIDDEN. This is why warm beige is a surface and never a foreground`);
  console.log(`on a light ground; these numbers are the rule, not a regression:`);
  forbiddenNotes.forEach((n) => console.log(`  x ${n}`));
}

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
