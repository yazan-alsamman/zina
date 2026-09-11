# Homepage Implementation

**Status:** Phase 5. Routes: `/en/`, `/ar/`. **Built last, deliberately.**

---

## 1. Why it was built last

The homepage introduces an editorial system that **already exists** rather than promising one.

Every link on it goes to a route implemented in Phase 4 or Phase 5. Every section is populated
from real records. Nothing is reserved, teased, or coming soon. Had it been built first it would
have been a decorative landing page describing a site that did not yet work — and the decoration
would then have driven the architecture instead of the other way round.

---

## 2. The first viewport

Per the Phase 5 brief §17, in order:

| # | Requirement | Mechanism |
|---|---|---|
| 1 | Who Zina is | The name, **small**, beneath the claim |
| 2 | What she does | **The claim, as the `h1`** — `bios.homepageIntro` |
| 3 | What makes the work distinctive | The Method line: *"Six stages, the same six every time."* |
| 4 | What a reader can explore | The proof block begins within one screen |
| 5 | Why the Method matters | The boundary statement, carried with the method |

**The claim is the headline; the name is small.** A homepage whose largest element is the person's
name is a business card. The `h1` is the claim, and `tests/surfaces.test.mjs` asserts it is longer
than 40 characters — a crude but effective guard against someone making the name the `h1` later.

---

## 3. State A / State B — the photography dependency, severed

Phase 3 named the homepage's dependency on photography that does not exist as its central
weakness. The resolution is not a placeholder: it is that **the argument of the page is carried by
type and record, and photography only ever carried its atmosphere.**

| | State A | State B |
|---|---|---|
| Condition | A portrait asset resolves | It does not |
| Composition | Asymmetric — statement cols 1–7, portrait 8–12 | **Statement widens to a longer measure and takes the space** |
| LCP | The portrait | The statement text |
| Placeholder | n/a | **None. No tone field, no grey rectangle, no "coming soon", no stock photograph** |

**The state is detected, not configured.** A `/mock-media/` path is a path to a file that was
never created, so it is treated as absent — the same rule the `Frame` component applies. There is
no flag for someone to set wrongly.

**The site is in State B today**, and it is *composed* for it rather than degraded into it. State
B is a title page, which is a real editorial form; State A with a grey rectangle where a face
should be is not.

Worth stating: **in State B the proof block sits higher on the page.** Photography adds warmth and
costs vertical space. It is not a straight upgrade.

`tests/surfaces.test.mjs` asserts, on both locales: no `opening--portrait`, no
`frame--placeholder`, no `<img>`, no `role="img"`, no `/mock-media/` reference — checking
**markup**, not CSS, because Astro bundles a component's styles whenever a page imports it even if
it never renders.

---

## 4. Proof hierarchy

```
1  THE CLAIM         h1, display.xl, 22ch measure
                     name (small) · professional title · the Method line

2  THE PROOF         the most recent record
                     disclosure label · title · subtitle
                     3 conditions in mono          <- the ONLY record density on the page
                     1 observation, mineral rule
                     read the review ->

3  THE METHOD        inset well
                     six numbered stage names, linked to their anchors
                     the boundary statement, carried with the method
                     the tagline, linked

4  THE CORPUS        three recent records, index treatment
                     all testing records (5) ->
```

**One evidence moment.** Sections 2 and 3 carry record density; nothing else does. A second
evidence block would make the homepage a dashboard, which is R-17. Asserted in tests: exactly one
`conditions` block, at most one `observation`.

**Nothing is padded.** Conditions are sliced to at most three *from what the featured review
actually published*; if it published two, two render.

---

## 5. What is not on the page

**No Journal, Work, Brands, Contact or About sections** — those templates are not built, so they
are not presented. Not as teasers, not as empty blocks, not as "coming soon".

A homepage that advertises pages that do not exist is a homepage that lies about the site.
`tests/surfaces.test.mjs` scans for *coming soon*, *under construction*, *stay tuned*,
*launching*, *sign up*, *newsletter* — all absent.

**No fabricated proof of any kind**: no follower count, no "as seen in", no award, no testimonial,
no "trusted by", no star. In markup: no `Organization`, no `AggregateRating`, no `sameAs`.

---

## 6. JSON-LD

`Person` only, and even that is minimal: name, job title, short bio.

**No `sameAs`** (no profile is verified), **no address** (`location` is `MOCK`), no award, no
credential, no `Organization`. The homepage must not manufacture professional credentials.

---

## 7. Internal links

```
homepage -> /method/            twice: the Method line, and the well's tagline
         -> /method/#{stage}    six stage anchors
         -> /reviews/{slug}/    the featured record, and three recent records
         -> /reviews/           all testing records
```

Every one resolves to a page that exists. `tests/global.test.mjs` asserts no page in the build
links to anything unemitted.

---

## 8. Performance

| | en | ar |
|---|---|---|
| HTML | **17.2 KB** | 19.0 KB |
| **JavaScript** | **0 bytes** | **0 bytes** |
| Images | **none** | **none** |
| Fonts | 79.2 KB | 151.9 KB |

The lightest page on the site, because State B has no images at all.

---

## 9. Verified in the browser

Five widths × two locales — **10 checks, all clean.** No horizontal overflow, no clipped text, no
reversed numeric ranges, no Arabic letter-spacing, no type-size floor violations, exactly one
`h1`, no heading skips, skip link first in tab order.
