# Bilingual Type Test

**Status:** Phase 2 evaluation document. Specification, not implementation.

A typography evaluation using representative mock copy drawn from `content/mock/`. The purpose is
to find the places where the bilingual system breaks **before** any component is built, because
every failure below is expensive to fix later and invisible until real Arabic content is on the
page.

> **Limitation, stated up front.** This document specifies the test and its expected outcomes. It
> cannot render the actual typefaces — Zarid is commercially licensed and nothing has been
> installed. **A visual proof must be produced in Phase 3 with the licensed fonts in place**, and
> until then the recommendation in `docs/TYPOGRAPHY_SYSTEM.md` is a well-reasoned specification
> rather than a verified result. This is open question Q-1.

---

## 1. Test specimens

All copy is mock content from the Phase 1 dataset.

### English

**Long editorial headline** *(`display.lg`, Zarid Serif)*
> Maison Eclat Voile Lumiere Skin Tint

**Review subtitle** *(`display.sm`, Zarid Serif)*
> Eight hours in 38 degree heat, tested four times

**Paragraph** *(`body.md`, Zarid Text)*
> Maison Eclat paid for the launch campaign this product appeared in, and I tested it four separate
> times before writing anything down. Those two facts sit next to each other at the top of this page
> on purpose.

**Small metadata** *(`label.sm`, Plex Sans, tracked uppercase)*
> FOUNDATION · TESTED JUNE 2026 · PAID PARTNERSHIP

**Record line** *(`record.md`, Plex Mono)*
> Hour 6 · Wear · 34–38 °C · 58–71 %

**Product name in running text**
> …the Voile Lumière Skin Tint in 22W Amber Warm…

### Arabic

**Long editorial headline** *(`display.lg` × 1.12, Zarid Serif Arabic)*
> ميزون إيكلا فوال لوميير سكِن تنت

**Review subtitle** *(`display.sm` × 1.12)*
> ثماني ساعات في حرارة 38 درجة، أربع مرات

**Paragraph** *(`body.md` × 1.12, Zarid Text Arabic)*
> دفعت ميزون إيكلا مقابل حملة الإطلاق التي ظهر فيها هذا المنتج، واختبرته أربع مرات منفصلة قبل أن أكتب
> أي شيء. الحقيقتان موضوعتان جنبا إلى جنب في أعلى هذه الصفحة عن قصد.

**Small metadata** *(`label.sm` × 1.12, Plex Sans Arabic, **not tracked**)*
> كريم أساس · اختُبر في يونيو 2026 · شراكة مدفوعة

**Record line** — mixed by construction
> الساعة 6 · الثبات · 34–38 °م · 58–71 ٪

**Latin product name embedded in Arabic** — the critical case
> …استخدمت Voile Lumière Skin Tint بالدرجة 22W Amber Warm طوال ثماني ساعات…

---

## 2. What each specimen is testing

| Specimen | Tests |
|---|---|
| Long headline, both scripts | Whether Arabic at ×1.12 reads at the same optical volume as Latin. Whether the Arabic headline wraps sensibly at the same column width |
| Subtitle | Numerals inside Arabic display type. `38` must not look pasted in |
| Paragraph | Leading adequacy for diacritics and descenders. Whether ×1.18 leading is enough or too much |
| Metadata | **The hardest case.** Latin uses tracked uppercase; Arabic can use neither. Do the two land at the same volume? |
| Record line | Mono numerals beside Arabic labels, inside one line, in RTL |
| Embedded product name | Bidirectional isolation. The failure that will appear on almost every Arabic review page |

---

## 3. RTL and LTR structural tests

| Test | Requirement | Failure to watch for |
|---|---|---|
| Page direction | `dir="rtl"` `lang="ar"` on `<html>` | Mixed direction inside a single block |
| Layout mirroring | Achieved with CSS **logical properties** only | A second stylesheet, or hard-coded `left`/`right` |
| Margin index | Left in LTR, **right in RTL** | Index staying left in Arabic, which breaks the reading path |
| Hairline rule insets | Inset from the *inline start* | Rules inset from the wrong side in Arabic |
| Breadcrumb separators | Chevrons **mirror**; the middle dot does not | Un-mirrored arrows pointing the wrong way |
| Evidence plate numbering | Reads start-to-end in both directions | Plate numbers reading backwards |
| Table column order | Label column at inline start | Conditions table reversed but numerals still LTR internally |
| Tab order | Follows visual order in both directions | Focus jumping across the page in RTL |

---

## 4. Mixed-script lines: the rules

The single most common bilingual defect. Arabic is RTL, Latin runs LTR, numerals run LTR — and a
line containing all three needs explicit help.

**Rule 1 — isolate every Latin run inside Arabic.**
Wrap Latin product names, brand names and shade codes in `<bdi>` (or `unicode-bidi: isolate`).
Without it, a Latin product name at the end of an Arabic sentence renders in the wrong position and
neighbouring punctuation migrates.

> **Fails:** …استخدمت Voile Lumière Skin Tint. → the full stop can jump to the wrong end
> **Works:** …استخدمت `<bdi>`Voile Lumière Skin Tint`</bdi>`.

**Rule 2 — never letter-space Arabic.** Not in labels, not in display, not in navigation. Tracking
is a Latin-only token.

**Rule 3 — punctuation follows the script of the surrounding run.** Arabic comma `،` and Arabic
question mark `؟` in Arabic prose; Latin punctuation inside an isolated Latin run.

**Rule 4 — numerals are Western (0–9) and tabular** in both locales. Percent, degree and range
signs sit with the numeral inside the isolate so they do not migrate.

**Rule 5 — dates are formatted per locale**, not translated. `June 2026` / `يونيو 2026`, with the
numeral isolated.

**Rule 6 — the shade code is a Latin identifier.** `22W Amber Warm` stays Latin in both locales,
isolated, because that is the string a reader will look for on a product.

---

## 5. The metadata problem, and its resolution

The hardest single problem in the system, and worth stating as its own decision.

**English metadata** wants the editorial default: uppercase, tracked, small, muted.
`FOUNDATION · TESTED JUNE 2026 · PAID PARTNERSHIP`

**Arabic cannot do either half of that** — no case, and tracking is forbidden.

**Rejected solutions:**

| Approach | Why rejected |
|---|---|
| Set Arabic metadata in Latin caps | Absurd, and unreadable |
| Drop tracking and caps in both scripts | Loses a genuinely good editorial device in English for parity's sake |
| Use a different, louder Arabic treatment | Arabic metadata then outweighs English metadata on equivalent pages |
| Use an image | Inaccessible, unindexable |

**Adopted solution — equivalent volume by different means:**

| | Latin | Arabic |
|---|---|---|
| Case | Uppercase | n/a |
| Tracking | +0.08em | **0, always** |
| Size | `label.sm` 12px | `label.sm` × 1.12 = 14px |
| Weight | 500 | **400** — one step lighter, because Arabic at 14px already carries more visual mass |
| Colour | `text.muted` | `text.muted` |
| Separator | ` · ` | ` · ` |

The two are specified to land at the same *perceived volume*, not to use the same *mechanism*.
**This must be checked side by side with the real fonts** — it is the specimen most likely to need
adjustment, and the factor most likely to change is the Arabic weight.

---

## 6. Numerals, dates and units

| Element | English | Arabic | Note |
|---|---|---|---|
| Numerals | 0–9 tabular | 0–9 tabular | Eastern Arabic-Indic not used, pending U-04 |
| Hour marker | `Hour 6` | `الساعة 6` | Numeral isolated; Arabic word in Plex Sans Arabic |
| Temperature | `34–38 °C` | `34–38 °م` | Whole run isolated, en-dash not hyphen |
| Percentage | `58–71 %` | `58–71 ٪` | Arabic percent sign `٪` in Arabic prose |
| Date | `June 2026` | `يونيو 2026` | Formatted per locale |
| Shade code | `22W Amber Warm` | `22W Amber Warm` | Latin identifier, isolated, unchanged |
| Plate number | `Plate 03` | `لوحة 03` | Zero-padded for column alignment |
| Duration | `8 hours` | `8 ساعات` | |

---

## 7. Navigation

| Item | English | Arabic | Watch |
|---|---|---|---|
| Reviews | Reviews | المراجعات | Arabic items are wider — the header must not wrap at 1024px |
| Method | Method | الطريقة | |
| Journal | Journal | المجلة | |
| Work | Work | الأعمال | |
| About | About | عن زينا | |
| CTA | Collaborate | تعاون | Button min-width must accommodate both |
| Switcher | `English` | `العربية` | **Each label in its own script**, never a flag |

**Layout risk:** the Arabic navigation set is materially wider than the English set at equal size,
and Arabic is additionally set at ×1.12. The header must be laid out to the **Arabic** width and
allowed to be comfortable in English, not the reverse. Designing the header in English first and
discovering the Arabic overflow at implementation is the predictable failure.

---

## 8. Pass criteria for the Phase 3 visual proof

The proof passes when all of the following hold, checked side by side at 1440px, 768px and 375px,
in both directions:

1. Arabic and English headlines at the same scale step read at the same optical volume.
2. Arabic paragraphs have visibly adequate room for diacritics without looking airy.
3. Metadata lines land at the same volume in both scripts (§5).
4. No Latin run inside Arabic is mispositioned, and no punctuation migrates.
5. The margin index sits on the correct side in each direction.
6. Numerals align in columns in the conditions table in both locales.
7. No Arabic text is letter-spaced anywhere.
8. The header does not wrap or overflow in Arabic at 1024px.
9. Nothing in either script falls below the size floors in `docs/TYPOGRAPHY_SYSTEM.md` §5.
10. The Arabic review page does not look like a translation of the English one — it should look
    like it was set in Arabic.

Criterion 10 is subjective and is the one that matters. It should be judged by a native Arabic
reader, not by the design team.
