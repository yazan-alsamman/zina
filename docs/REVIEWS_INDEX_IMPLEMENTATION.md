# Reviews Index Implementation

**Status:** Phase 5. Routes: `/en/reviews/`, `/ar/reviews/`, plus the facet families.

---

## 1. What it is

**An editorial index of testing records.** Not a blog archive, not a product grid.

The difference is carried by what each row shows, in this order:

| Field | Why it is there |
|---|---|
| **Disclosure label — FIRST** | A review's commercial status is part of its identity even in a listing. This is why no disclosure filter is needed: the answer is already on every row |
| Brand · category | What was tested, and from whom |
| Title | The product |
| **Subtitle** | **The test.** *"Eight hours in 38 degree heat, tested four times"* — this is what makes the archive an index of records rather than a grid |
| Conditions (≤2) | Record density, from what the review actually published. Never padded |
| Tested / updated dates | A record's age is part of the record |

A product grid shows price and rating. This shows **what was done and who paid for it.**

### What it never shows

No score, star, rank, "best" label, award, popularity, engagement or social proof. The archive
must not imply that reviews are scientifically equivalent measurements. `tests/surfaces.test.mjs`
asserts the absence of each, with word-boundary matching so that "Reviews" is not mistaken for
"views".

---

## 2. The six things the page must communicate

Per the Phase 5 brief §8, and how each is delivered:

| # | Requirement | Mechanism |
|---|---|---|
| 1 | What the archive is | One intro paragraph, no marketing |
| 2 | What evidence each record holds | The conditions row on every entry |
| 3 | How records can be discovered | **Crawlable facet routes**, zero JavaScript |
| 4 | What is available in this locale | Locale-filtered, and the count is stated plainly |
| 5 | What the Method means | A contextual link in the intro prose |
| 6 | How to move onward | index → review → Method |

---

## 3. Locale filtering

**Locale is an authoring contract.** `reviewsIn(locale)` returns only records with content in that
locale. There is no fallback to the other language, no machine translation, no placeholder.

| | en | ar |
|---|---|---|
| Records listed | **5** | **5** |
| Not listed | `terra-sana-verdure-cloud-balm` (Arabic-original) | `veloura-velvet-hour-lip-cream` (English-only) |

Verified in `tests/surfaces.test.mjs`: the English index does not contain the Arabic-original
slug, and vice versa.

**The switcher** falls back to the other locale's index, and to the locale home if that section is
empty — the same three-state contract as every other surface.

---

## 4. Layout by count, not a scaled grid

The most recent record is rendered `featured`: **more space, not a different component.** The
title steps up one size and the subtitle widens. Everything else is identical.

This is the Phase 3 "layout by count" rule implemented literally: a one-item state is a
composition, not a grid with two empty cells.

---

## 5. Facet navigation

Real links to real routes. `FacetNav` is a `<nav>` of `<a>` elements with `aria-current` on the
active one — **not** a listbox, not chips backed by a control. That is the honest semantic:
these are navigation, and adding ARIA to describe form-control behaviour that does not exist
would be worse than nothing.

The count beside each facet is **how many records exist in this locale**. It is not social proof
and not a ranking — it is the one number an archive can state without implying anything.

Full architecture: `docs/FACET_URL_ARCHITECTURE.md`.

---

## 6. Accessibility

| | |
|---|---|
| Headings | One `h1`; entries render at `h2` because they sit directly under it. The level is a **prop**, because it is a property of the document outline rather than of the component — the homepage passes `3` since its entries sit under a section `h2` |
| Links | One focusable link per entry, wrapping disclosure, identity, title and subtitle, so the accessible name is complete and the focus ring surrounds the whole block |
| Facets | `<nav aria-label>` with `aria-current="page"`; active state is border **plus a filled mineral marker**, never colour alone |
| Targets | 44px minimum on every facet link |
| Conditions | A `<dl>`, because they are labelled values |

An `h1 → h3` skip on the facet pages was found by `tests/global.test.mjs` and fixed by making the
heading level a prop rather than hard-coding `h3`.

---

## 7. Performance

| | en | ar |
|---|---|---|
| HTML | 20.5 KB | 21.9 KB |
| **JavaScript** | **0 bytes** | **0 bytes** |
| Images | none — no photography exists | none |

Discovery works with scripting disabled, which is both the R-15 requirement and the condition of
the mobile audience.

---

## 8. Verified in the browser

Five widths × two locales × three routes (index, category facet, brand facet) — **30 checks, all
clean**: no horizontal overflow, no clipped text, no reversed numeric ranges, no Arabic
letter-spacing, no type-size floor violations, exactly one `h1`, no heading skips, skip link
first in tab order.
