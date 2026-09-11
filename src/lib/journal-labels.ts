/**
 * JOURNAL CATEGORY LABELS.
 *
 * The category KEYS come from the content (`article.category`) and are never hardcoded in a
 * template. This module maps a key to its localised display label, and nothing else.
 *
 * A key with no label falls back to the key itself rather than throwing: a new editorial format
 * added to the content should appear in the interface immediately, in a plain form, rather than
 * breaking the build. `tests/journal.test.mjs` asserts every key currently in the content has a
 * real label in both locales, so the fallback is a safety net rather than an excuse.
 */

import type { Locale } from "../../content/schema/types.ts";
import { t, type UiKey } from "./ui-strings.ts";

const LABEL_KEY: Record<string, UiKey> = {
  "testing-notes": "categoryTestingNotes",
  guides: "categoryGuides",
  comparisons: "categoryComparisons",
  essays: "categoryEssays",
};

export function categoryLabel(locale: Locale, key: string): string {
  const uiKey = LABEL_KEY[key];
  return uiKey ? t(locale, uiKey) : key;
}

export const hasCategoryLabel = (key: string): boolean => key in LABEL_KEY;
