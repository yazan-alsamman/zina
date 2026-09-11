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
