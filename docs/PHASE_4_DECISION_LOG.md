# Phase 4 Decision Log

**Status:** Phase 4 record. Every implementation decision, every contradiction found in an earlier
phase, and every bug the verification passes caught.

**The rule:** where implementation contradicts Phase 2 or Phase 3, the contradiction is documented
and resolved explicitly. Nothing is silently worked around.

---

## 1. Contradictions found while implementing

Three. **All three were found by tooling rather than by reading** — one by a dead API, one by a
budget check, one by a browser measurement.

---

### C4-1 · `Astro.resolve()` does not exist — the font strategy had to change

| | |
|---|---|
| **Where** | Phase 3 assumed bundler-managed, locale-conditional stylesheet loading |
| **What happened** | `Astro.resolve()` was removed in Astro 3. The build failed at the first page |
| **The deeper problem** | Even had it worked, a static import graph attaches **both** locales' fonts to **every** page, because the locale is a runtime value. Locale splitting — the decision that halves the payload — was not achievable through imports at all |
| **Resolution — D4-1** | Fonts are generated as **real assets** by `scripts/build-fonts.mjs` and referenced by a plain `<link>` chosen per locale. This gives true locale splitting, explicit preload control, stable cacheable URLs, and a payload measurable with `ls -l` |
| **Consequence** | A build step exists that did not exist in the plan. It is 150 lines, has no dependencies, and enforces the 180 KB budget by failing |

---

### C4-2 · The Arabic font payload exceeded its budget

| | |
|---|---|
| **Where** | Phase 2 specifies three weights (400/500/600) and a 180 KB per-locale budget |
| **What happened** | Shipping all declared weights measured **207.2 KB for Arabic** — over budget, on the locale most likely to be read on a mid-range Android. The script exited non-zero |
| **The contradiction** | "Three weights, nothing below 400" reads as an instruction to ship three weights. But **nothing in the design uses 600**: display type is set at 400 throughout, and the only 500 is the Latin label tier and the active nav item |
| **Resolution — D4-3** | **A face ships only when something uses it.** The 600 faces were dropped: en 99.2 → **79.2 KB**, ar 207.2 → **151.9 KB**. Both within budget |
| **Note** | "No weights below 400" is a **floor**, not an instruction to use the ceiling. The type system already implied this; the budget check is what surfaced it |
| **If Zarid is licensed** | Re-run the audit. Zarid's proportions differ and the answer may change |

---

### C4-3 · The full-bleed recipe overflows every page

| | |
|---|---|
| **Where** | Phase 2 and 3 specify four full-bleed breaks per review page (hero, disclosure, plates, verdict) |
| **What happened** | The conventional `width: 100vw; margin-inline-start: 50%; transform: translateX(-50%)` recipe **overflowed the document by ~15px at every width, in both directions** — six offending elements per page, and the page scrolled horizontally. Found by browser measurement, not by eye |
| **Why** | `100vw` includes the scrollbar gutter; the document's content box does not |
| **Resolution — D4-4** | **Delete the breakout.** These elements are already direct children of `<article>` inside `<main>`, which spans the body's content box — the full width *minus* the scrollbar. `width: 100%` is correct and the breakout was never needed |
| **Bonus** | It removed the one direction-aware rule in the codebase (an RTL `translateX` override). There is now **no `[dir="rtl"]` block anywhere** |
| **Guard** | `tests/output.test.mjs` asserts no page scrolls horizontally |

---

## 2. Implementation decisions

| # | Decision | Rationale | Reversal cost |
|---|---|---|---|
| **D4-1** | **Fonts as generated assets**, not bundler imports | C4-1. True locale splitting, explicit preload, enforceable budget | Low |
| **D4-2** | **Do not use Astro content collections.** Keep the Phase 1 schema | `src/content/` + zod would create a **second definition** of every entity alongside `content/schema/types.ts`, validated by a second validator. Two schemas drift, silently, and the newest code wins by accident | Medium — it is the idiomatic Astro path, and a future team may expect it |
| **D4-3** | **A face ships only when used** | C4-2 | Trivial |
| **D4-4** | **`.full-bleed` is `width: 100%`**, not a viewport breakout | C4-3 | Trivial |
| **D4-5** | **Paper grain generated in CSS**, not a 4 KB tiling asset | Two `repeating-linear-gradient`s at ~1.5% cost **0 bytes** and one fewer request, for an effect nobody can see at 3%. Phase 2 budgeted ≤4 KB and called it the first thing to cut | Trivial |
| **D4-6** | **`theme-color` is `#12100D`**, not `site.json`'s `#0E0E0F` | `site.json` was written in Phase 1, before Phase 2 chose and **measured** the palette. The measured token wins. `site.json` was not edited — it is Phase 1 data, and the divergence is recorded here instead | Trivial |
| **D4-7** | **No scroll-triggered entrance animation** | Phase 3 specified `sequence` for observations, conditions and stages via `IntersectionObserver` (3 KB). Implementing it would put **JavaScript on a page whose entire value is being readable without it**, to fade in content that is already there. The two animations that survive are CSS: the menu reveal and the image decode fade | Low — the tokens exist |
| **D4-8** | **Honour the user's text-spacing override even though it damages Arabic** | WCAG 1.4.12 requires no loss of content. Content is not lost, only beauty. No `!important` defence | Should not be reversed |
| **D4-9** | **`site` is `https://example.invalid`** | U-01. A deliberately invalid TLD, so a placeholder canonical can never be mistaken for a real domain | Trivial — one line |
| **D4-10** | **Explicit `.ts` extensions in the `lib/` layer** | Lets the SAME modules the bundler compiles be imported by `node --test` with native type stripping. No test-only build step, no compiled duplicate to drift | Trivial |
| **D4-11** | **Build only the review page and the 404** | The brief's instruction. Links to unbuilt routes are structurally correct and currently 404 — honest, and listed in `NOT_YET_IMPLEMENTED` | n/a |
| **D4-12** | **No `astro:assets` image pipeline** | There are zero images to optimise. Adding `sharp` for nothing is cost without benefit. Swapping `<img>` for `<Image>` is a change to one file | Trivial |

---

## 3. Bugs found and fixed during verification

Each was found by a tool, not by reading the code.

| # | Bug | Found by | Fix |
|---|---|---|---|
| **B4-1** | `<bdi lang="en">ميزون إيكلا</bdi>` — **Arabic text labelled as English** on Arabic pages, which is exactly the mispronunciation the attribute prevents | Inspecting the built HTML | `isolateIdentifier()` now **detects** script instead of assuming, and emits no isolate at all when the identifier matches the page script |
| **B4-2** | `isolateValue()` split prose that merely began with a numeral: `"34 to 38 degrees Celsius"` isolated just the `34` | Inspecting the built HTML | A remainder that is not a **unit** means the value is prose, and prose is left entirely alone. The isolate is a guarantee for record values, not a blanket |
| **B4-3** | Horizontal overflow at every width, both locales | Browser measurement | C4-3 / D4-4 |
| **B4-4** | Arabic font payload 15% over budget | The font script's own budget check | C4-2 / D4-3 |
| **B4-5** | The mock guard passed only because mock brands happen to use `example.com` URLs — **a property of the content, not of the build** | Reading the guard output critically | `BaseLayout` now emits the literal `__MOCK_DATA__` in an HTML comment on every page while the source is the mock layer. The guarantee is now content-independent |
| **B4-6** | A stray `data-astro-cid-*` on `<html>` | A failing test assertion | Moved the layout's single CSS rule into `global.css`; the layout now has no `<style>` block |
| **B4-7** | Heading read "Strengths / Limitations" with `h3` children of the same names | Reading the measured heading outline | Renamed to "Assessment" / "التقييم" |

**Three of my own test assertions were also wrong** and were corrected rather than the code:
an exact-string match on `<html>`, an arithmetic identity that could never fail, and a review
chosen for a "not all stages applied" test that in fact applies all six.

---

## 4. Decisions requiring approval

| # | Decision | Why it needs a human |
|---|---|---|
| **D4-2** | Not using Astro content collections | It is the idiomatic path. A future engineer will ask why, and the answer must be a decision rather than an omission |
| **D4-7** | No scroll-triggered animation | Phase 3 specified it. The page is stiller than designed. Reinstating it costs ~3 KB of JS on a zero-JS page |
| **D4-9** | Placeholder domain | **U-01 blocks correct canonical and hreflang URLs.** Nothing else in the SEO foundation can be finished without it |
| Arabic UI strings | ~40 interface strings were composed for this implementation | **Q3-2 / Q3-6.** They are ordinary chrome, not claims, but no native reader has seen them |

---

## 5. Carried forward unchanged

Confirmed in implementation, not re-litigated:

- Disclosure above the hero, never truncated, prominence scaling with money.
- Limitations at identical weight to strengths — same family, size, colour, column width.
- No numeric rating, in content, in markup or in schema.
- The three voices, distinguishable by six signals of which colour is the sixth.
- The margin index collapses inline below 1024 and is never hidden.
- Evidence plates never re-crop.
- Missing translation → no route, no hreflang, no stub, no machine translation.
- Radius 0 (2px on controls), no shadows, no gradients beyond the paper grain.
- Arabic as an authoring language, with tracking fixed at 0.
- Brand links are a function of the per-locale gate.
- The Method is a **PROJECT MOCK METHOD**.

---

## 6. Open questions carried into Phase 5

| # | Question | Status |
|---|---|---|
| **U-01** | The production domain | **Blocking** correct canonicals and hreflang since Phase 0 |
| **Q3-1** | Can Zarid be licensed? | Unanswered. The fallback tier is implemented and legal |
| **Q3-2 / Q3-6** | Native Arabic review of the interface strings | Unanswered |
| **Q3-3** | Does Zina already have a testing method? | **Unanswered since Phase 0.** The Method is the spine of four architectures now |
| **U-02** | Verified social URLs | The footer social row does not exist without them |
| **U-03** | Legal jurisdiction | Blocks the privacy page and the analytics decision |
| **New** | Does the client want scroll-triggered entrance animation back? | D4-7 |
| **New** | Repository boundary | **R-07, still open.** See the report §2 |
