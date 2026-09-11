/**
 * LOCALE FORMATTING — dates and counts.
 *
 * Dates are FORMATTED PER LOCALE, never translated (docs/BILINGUAL_TYPE_TEST.md section 6).
 * `June 2026` / `يونيو 2026`, with the numeral isolated by the caller through isolateValue().
 *
 * Western digits in BOTH locales: they are standard in Gulf Arabic web content and are what the
 * audience expects. Eastern Arabic-Indic numerals are NOT used pending evidence of audience
 * preference (unknown U-04). `numberingSystem: "latn"` states that explicitly rather than
 * relying on the runtime default, which varies by ICU build.
 */

import type { Locale } from "../../content/schema/types.ts";

const LOCALE_TAG: Record<Locale, string> = { en: "en-GB", ar: "ar" };

/**
 * The same locale tag used for date/number formatting, exposed for anything else that needs a
 * real RFC-tag rather than a second, competing mapping — the RSS feed's `<language>` element,
 * for instance. One mapping, reused, never redeclared.
 */
export const localeTag = (locale: Locale): string => LOCALE_TAG[locale];

const monthYear = (locale: Locale) =>
  new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    year: "numeric",
    month: "long",
    numberingSystem: "latn",
  });

/** "June 2026" / "يونيو 2026". Returns the raw string unchanged if it is not a valid date. */
export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return monthYear(locale).format(date);
}

/** Cardinal numbers, Western digits in both locales. */
export function formatCount(value: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_TAG[locale], { numberingSystem: "latn" }).format(value);
}

/**
 * COUNTED NOUNS — "1 record" / "2 records", per locale.
 *
 * ============================================================================
 * WHY THIS IS NOT A GENERIC PLURALISER
 * ============================================================================
 * Phase 7 found "1 records" rendering on the Phase 5 brand facets, and the new brands index
 * inherited the same string. The naive fix is an `n === 1 ? singular : plural` helper applied to
 * both languages. That would be wrong for Arabic, and wrong in a way an English speaker cannot
 * see.
 *
 * English has two forms. ARABIC HAS SIX, selected by the number in a way that also changes the
 * noun's case and whether it is singular, dual or plural:
 *
 *   1        singular            سجل واحد
 *   2        DUAL, a distinct grammatical number English does not have
 *   3–10     plural
 *   11–99    singular accusative
 *   100+     singular genitive
 *   0        its own construction
 *
 * Choosing between those is an editorial judgement about natural phrasing, not a lookup table, and
 * no native Arabic reader has reviewed this project's copy (standing item H-1).
 *
 * So: ENGLISH is corrected here, because the bug is real and the rule is unambiguous. ARABIC keeps
 * the existing counted-noun form unchanged — it is the form already reviewed into the Phase 2/3
 * specification, and inventing five more would be authoring unreviewed Arabic grammar.
 *
 * When a native reader is available, this function is the single place the Arabic forms attach.
 */
export function countedNoun(
  value: number,
  locale: Locale,
  forms: { one: string; other: string }
): string {
  if (locale === "ar") {
    // Unchanged pending native review. `other` carries the existing specification wording.
    return forms.other;
  }
  return value === 1 ? forms.one : forms.other;
}
