/**
 * BIDIRECTIONAL TEXT — the Phase 3 correction, implemented.
 *
 * ============================================================================
 * THE DEFECT THIS MODULE EXISTS TO PREVENT
 * ============================================================================
 *
 * Phase 2 (docs/BILINGUAL_TYPE_TEST.md section 4, Rule 4) instructed:
 *
 *     "Percent, degree and range signs sit with the numeral inside the isolate
 *      so they do not migrate."
 *
 * Phase 3 MEASURED that rule and found it produces the exact defect it was written to prevent.
 * Verified by Range.getBoundingClientRect() token ordering, not by eye
 * (docs/PHASE_3_BILINGUAL_TYPE_PROOF.md section 5):
 *
 *     <bdi>34–38 °م</bdi>            renders visually as   °م | 38 | 34     ← THE RANGE REVERSES
 *     <bdi dir="ltr">34–38</bdi> °م  renders visually as   °م | 34 | 38     ← correct
 *
 * WHY: <bdi> resolves its direction AUTOMATICALLY from the first strong character in the run.
 * In "34–38 °م" the digits are directionally weak, so the first strong character is the Arabic
 * م, the isolate resolves RTL, and the two numerals swap.
 *
 * Wrapping the whole run in a bare <bdi> is WORSE than not isolating it at all.
 *
 * It would have appeared in every conditions well, every observation timestamp and every record
 * line on every Arabic review page — silently, and invisibly to a non-Arabic-reading team.
 *
 * ============================================================================
 * THE CORRECTED RULE (decision D3-1, mandatory)
 * ============================================================================
 *
 *   Isolate the NUMERIC RUN ONLY, with an explicit direction.
 *   A Latin unit (°C, %, ml) MAY sit inside the isolate — it is neutral-to-Latin.
 *   An ARABIC unit (°م, ٪, ساعات) MUST sit OUTSIDE it, in the Arabic run where it belongs.
 *   Never wrap a mixed numeral-plus-Arabic-unit run in a bare <bdi>.
 *
 * Rule 1 is CONFIRMED UNCHANGED: <bdi lang="en"> around Latin product names, brand names and
 * shade codes is correct. Note the browser's implicit algorithm already handles the common
 * mid-sentence case — the isolate is a GUARANTEE for boundary cases, and it also carries the
 * `lang` attribute a screen reader needs to pronounce the run correctly.
 */

/** Characters that are "strong RTL" — their presence in a run flips a bare <bdi> to RTL. */
const STRONG_RTL = /[֐-׿؀-ۿ܀-ݏݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/** A run made only of digits, separators, spaces and Latin-neutral unit characters. */
const NUMERIC_RUN = /^[\d\s.,:\-–—/×+()°%'"]*$/;

/**
 * Unit tokens that may legitimately follow a numeric run. Short, and either script.
 * A value whose remainder is NOT one of these is PROSE and is left entirely alone.
 */
const UNIT = /^(°[CFcf]|°م|%|٪|ml|mL|kg|g|mm|cm|px|hrs?|hours?|mins?|minutes?|ساعات|ساعة|دقيقة|درجة)$/u;

/**
 * Split a value into the leading numeric run and whatever follows it.
 *
 * "34-38 °م"  -> { numeric: "34-38",    rest: "°م" }   Arabic unit stays OUTSIDE
 * "34-38 °C"        -> { numeric: "34-38 °C", rest: "" }          Latin unit may sit inside
 * "8 hours"               -> { numeric: "8",        rest: "hours" }
 * "34 to 38 degrees"      -> { numeric: "",         rest: "34 to 38 degrees" }  PROSE, untouched
 * "Photographed"          -> { numeric: "",         rest: "Photographed" }
 */
export function splitNumericRun(value: string): { numeric: string; rest: string } {
  const trimmed = value.trim();
  if (!trimmed) return { numeric: "", rest: "" };

  const match = trimmed.match(/^([\d]+(?:[\s.,:\-–—/×+]*[\d]+)*)\s*(.*)$/u);
  if (!match || !match[1]) return { numeric: "", rest: trimmed };

  let numeric = match[1];
  let rest = (match[2] ?? "").trim();

  // A remainder that is not a unit means this value is PROSE that happens to begin with a
  // numeral. Isolating part of a sentence would be worse than leaving it to the browser's
  // implicit algorithm, which handles digits inside prose correctly. The isolate is a
  // GUARANTEE for record values, not a blanket applied to every string.
  if (rest && !UNIT.test(rest)) {
    return { numeric: "", rest: trimmed };
  }

  // A Latin-script unit is directionally safe inside the isolate and reads better there.
  // An Arabic-script unit must stay outside it, in the Arabic run where it belongs.
  if (rest && !STRONG_RTL.test(rest)) {
    numeric = `${numeric} ${rest}`;
    rest = "";
  }

  return { numeric, rest };
}

/** Does this string contain any strong right-to-left character? */
export const hasRtl = (value: string): boolean => STRONG_RTL.test(value);

/** Is this string purely a numeric run (no strong directional characters at all)? */
export const isNumericRun = (value: string): boolean =>
  value.trim().length > 0 && NUMERIC_RUN.test(value.trim()) && /\d/.test(value);

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Render a record value (a temperature, a percentage, a duration, a count) safely in either
 * script. THE ONLY SUPPORTED WAY to output a value that may contain numerals.
 *
 *   isolateValue("34 to 38 degrees Celsius")  → plain text, no isolate needed
 *   isolateValue("34–38 °م")                  → <bdi dir="ltr">34–38</bdi> °م
 *   isolateValue("58–71 ٪")                   → <bdi dir="ltr">58–71</bdi> ٪
 *   isolateValue("4")                         → <bdi dir="ltr">4</bdi>
 *
 * Returns an HTML string, so callers use set:html. The input is escaped.
 */
export function isolateValue(value: string): string {
  const raw = value.trim();
  if (!raw) return "";

  const { numeric, rest } = splitNumericRun(raw);

  // No leading numeral: nothing to isolate. Prose is left alone entirely.
  if (!numeric) return escapeHtml(raw);

  const isolated = `<bdi dir="ltr">${escapeHtml(numeric)}</bdi>`;
  return rest ? `${isolated} ${escapeHtml(rest)}` : isolated;
}

/**
 * Isolate an identifier whose script DIFFERS from the surrounding page — a product name, a
 * brand name, a shade code.
 *
 * The script is DETECTED, not assumed. An earlier revision defaulted to lang="en" and produced
 * `<bdi lang="en">ميزون إيكلا</bdi>` on Arabic pages — Arabic text labelled as English,
 * which is precisely the mispronunciation the attribute exists to prevent.
 *
 * When the identifier is in the SAME script as the page, no isolate is emitted: it is redundant
 * markup, and the browser needs no help. Isolation is for the mixed case only.
 *
 * Phase 2 Rule 1, confirmed unchanged by the Phase 3 proof.
 */
export function isolateIdentifier(value: string, pageLocale: "en" | "ar" = "en"): string {
  const raw = value.trim();
  if (!raw) return "";

  const script: "en" | "ar" = hasRtl(raw) ? "ar" : "en";
  if (script === pageLocale) return escapeHtml(raw);

  return `<bdi lang="${script}">${escapeHtml(raw)}</bdi>`;
}

/**
 * A record marker such as "Hour 6" / "الساعة 6".
 *
 * The Arabic word is set in the Arabic UI face (there is no Arabic monospace tradition) and the
 * numeral in mono, inside an isolate. This is the fiddliest detail in the type system and the
 * reason `.record .word` exists in global.css.
 */
export function recordMarker(value: string): string {
  const raw = value.trim();
  if (!raw) return "";

  // Leading word(s) then a numeral: "الساعة 6", "Hour 6", "Week 2", "Coat 3"
  const match = raw.match(/^(.*?)(\d[\d\s.,:\-–—/]*)(.*)$/u);
  if (!match) return escapeHtml(raw);

  const [, before = "", digits = "", after = ""] = match;
  const parts: string[] = [];

  if (before.trim()) parts.push(`<span class="word">${escapeHtml(before.trim())}</span>`);
  parts.push(`<bdi dir="ltr">${escapeHtml(digits.trim())}</bdi>`);
  if (after.trim()) parts.push(`<span class="word">${escapeHtml(after.trim())}</span>`);

  return parts.join(" ");
}
