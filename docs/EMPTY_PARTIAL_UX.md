# Empty and Partial State UX

**Status:** Phase 3 decision. Extends `docs/EMPTY_STATES.md` (Phase 2 — principles and twelve
states) into a **per-template state matrix**.

**These are not edge cases.** At launch the site will have six reviews, no verified relationships, no
press, no photography and incomplete translations. **The partial state is the normal state for the
first year**, and it must look intentional rather than unfinished.

---

## 1. The six principles

1. **Absence is silent.** A section with nothing to show is **removed**, not rendered empty. No "no
   items yet", no dashed boxes, no ghost cards.
2. **Never an illustration.** No empty-state graphics, no mascots, no icons. Empty states are
   typographic, like everything else.
3. **Never apologise.** "We're still building this" undermines a premium property.
4. **Never fabricate to fill.** No placeholder brands, no invented statistics, no lorem.
5. **Redirect rather than dead-end.** Where something is missing, offer the nearest real thing.
6. **The layout must not depend on the content being there.** A grid designed for three must look
   composed with one — which is achieved by **not using a grid for one**.

---

## 2. The five state types

Every template is specified against all five.

| State | Meaning |
|---|---|
| **FULL** | All content present |
| **PARTIAL** | Some optional content absent. **The expected launch state** |
| **EMPTY** | A collection has no members in this locale |
| **GATED** | Content exists but has not earned a page (brand gate, category gate) or has not been verified (relationship, results figure, testimonial) |
| **MISSING TRANSLATION** | The record exists in the other locale only |

---

## 3. Layout by count

Sections choose a layout from their item count rather than scaling one grid.

| Count | Treatment |
|---|---|
| **0** | **Section removed** |
| **1** | **Full-width editorial. More space, not less** |
| **2** | Side by side, or alternating full-width |
| **3** | Three-up grid |
| **4–6** | Grid, possibly two rows |
| **7+** | Grid plus pagination or a "view all" link |

**A one-item grid is the most common way a young site looks unfinished**, and this rule removes it.

**Locale filtering happens before the count is taken.** A related block with two items where one is
English-only renders as a one-item block in Arabic — full-width, composed — not as a two-up grid
with a hole.

---

## 4. State matrix by template

### T-01 Review detail

| Element | FULL | PARTIAL | EMPTY | GATED | MISSING TRANSLATION |
|---|---|---|---|---|---|
| Disclosure band | 6 states | — | **Impossible** — every review has one | `unknown-pending-verification` renders with the warning treatment and **cannot publish** | — |
| Hero | Image + caption | Missing image → **aspect-ratio box, flat `ground.raised`, caption retained** | No photography → neutral tone field at the correct ratio | — | — |
| Summary strip | 4 values | `shadeUsed: null` → **cell removed**, strip becomes 3 | — | — | — |
| Conditions well | All rows | — | **Impossible** — required non-empty | — | — |
| Method stages | 6 marked | 4 applied → **2 shown hollow**, visibly not claimed | — | — | — |
| Observations | 3–6+ | — | **Impossible** — minimum 3 enforced | — | — |
| Plates | 2–4 | 1 → full-bleed single | **Section removed**; `evidenceNotes` prose retained | — | — |
| Strengths / limitations | Both | — | **Impossible** — both required | — | — |
| Suitability | Both lists | — | **Impossible** — both required | — | — |
| Verdict | Present | — | **Impossible** | — | — |
| Update log | Dated entries | — | **Section removed. No "never updated" line** | — | — |
| Product claims | Present | — | Claim block removed, specs remain | — | — |
| Brand link | Linked | — | — | **Plain text, or a link to `/reviews/?brand={slug}`. Never a link to a missing page** | — |
| Comparison | Named + linked | — | Block removed; `comparison` stage shows a **hollow** square | — | — |
| Related work | 1 project | — | Section removed | — | Locale-filtered |
| Related reviews | 2 | 1 → full-width | Group removed | — | Filtered, then counted |
| **The page itself** | — | — | — | — | **No route. 404 in the other locale.** Switcher → `/{loc}/reviews/` + explanation line |

### T-02 Homepage

| Section | FULL (State A) | PARTIAL / EMPTY (State B) |
|---|---|---|
| 1 Opening | Statement + portrait | **Statement widens to cols 1–9, no portrait, no tone field.** LCP becomes the statement text |
| 2 Featured review | Image + content | **Content full width**, 4 conditions instead of 3. Plate placeholder only where its caption carries information |
| 3 Method | Six stages | Unchanged — typographic already |
| 4 Recent reviews | 3 with images | **Text-led entries: disclosure, brand, title, subtitle, hairline.** Never three grey rectangles |
| 5 Selected work | 2 alternating | **1 full-width, text-led** |
| 6 Journal | 2 text-led | Unchanged, or 1 full-width |
| 7 Close | Present | Unchanged |
| No featured review | — | Falls back to the most recent, **record density intact** |
| No reviews at all | — | **The site should not launch.** The homepage has no proof block |

**States are chosen per section, not per page.** The likely launch state is A for sections 1–2 and B
for 4–5.

### T-03 Method

| Element | Behaviour |
|---|---|
| Method missing in a locale | **Build fails.** Required in both |
| Fewer than 3 stages | Validator fails |
| A stage missing `doesNotProve` | Validator fails |
| A stage with no reviews yet | Its "reviews that used this stage" block is **removed**. **The stage still exists** — a protocol is not defined by what has been published |
| Fewer than 2 representative reviews | Layout by count |
| `whatThisCannotTell` under 3 | Validator fails |

### T-04 Review index

| State | Behaviour |
|---|---|
| FULL | Facets + listing |
| PARTIAL | Fewer reviews than facet values — **facet values with zero matches in this locale are not rendered as chips** |
| **Filter matches nothing** | Chips stay visible with the active one marked. One line at `body.md` secondary: *"No reviews in this category yet."* Then the three most recent reviews under a `Recent reviews` label. **No illustration, no "clear filters" button** — deselecting the chip is already visible |
| EMPTY (locale has none) | **Route not generated. Reviews removed from navigation.** A section that does not exist is better than an empty one |
| MISSING TRANSLATION | Lists only records with content in this locale — five, not six with one broken |

### T-05 / T-06 Journal

| State | Behaviour |
|---|---|
| Category with <3 articles | **GATED** — the label renders as text, not a link. Nothing signals a pending page |
| Article with <4 sections | No table of contents |
| Article with no hero | Text-led entry, no tone field |
| Article with no cited review | Should not publish — the review link is mandatory |
| Arabic-original with no English sibling | **Correct, not a gap.** Appears in `/ar/journal/` only |

### T-07 / T-08 Work

| State | Behaviour |
|---|---|
| 0 projects | Route not generated; Work removed from navigation |
| 1 project | **Index and detail effectively merge** — full-width case-study treatment |
| 2–3 projects | Alternating full-width, **not a grid** |
| **No results figures** | **The whole results section is removed.** No "results pending", no zeroes, no estimates. Deliverables and the brief carry the argument — often *more* persuasive to audience B |
| A figure without a named source | **Build failure** |
| No related independent review | Block removed |
| English-only project | No Arabic route; **and this is what gates the Arabic Veloura brand page** |

### T-09 / T-10 Brands

| State | Behaviour |
|---|---|
| **GATED brand** | **No page exists.** Not listed on the index, absent from sitemap and hreflang, brand name is plain text or a filtered-index link. **No "coming soon", no disabled link, no tooltip.** The reader never learns a page was withheld |
| **Brand with one review** | **The commonest partial state.** Single-column editorial, review at full width with **more** space, related case study given equal prominence. **Never a three-up grid missing two cells. No "1 review" count** |
| Relationship not `CONFIRMED` | **Relationship block absent entirely.** The brand still appears as one whose products were reviewed |
| Brand index with <3 brands | Full-width entries rather than a grid |

### T-11 About

| State | Behaviour |
|---|---|
| No portrait | Typographic page, bio at `body.lg`, **no tone field** |
| `location` unverified | **Does not render.** It is `MOCK` today |
| No verified social profiles | The social row does not exist |

### T-12 Contact

| State | Behaviour |
|---|---|
| No verified email | The form is the only channel, and the page does not mention a missing one |
| Submit error | Plain message plus the form, values preserved |
| Success | **A page, not a toast** — linkable and announced |

### T-15 404

Always the same: a plain statement, three recent reviews **in this locale**, a link to the index.
**No apology, no illustration, no large "404", and no offer of the other language's version.**

---

## 5. Cross-cutting states

### Missing image

| | |
|---|---|
| Space | Reserved by the aspect-ratio box — **no layout shift** |
| Fill | Flat `ground.raised`. **No icon, no "image unavailable", no broken-image glyph** |
| Caption | **Still rendered.** On an evidence plate the caption carries the information |
| Alt | Still present for assistive technology |

*"An evidence plate whose caption reads 'Hour six, product lifting around the nose' is still doing
most of its job without the photograph."*

### No photography at all — the current state

- Neutral tone fields at the correct aspect ratio, **only where a caption or plate treatment carries
  information without the image**.
- Elsewhere, **the image is not rendered and the layout re-composes** (homepage State B).
- Plate numbers, captions and hairlines retained, so the composition is real.
- **No stock imagery of a person, ever** — an honest gap rather than a borrowed face.
- Internal previews may use stock still life; production builds may not.

### Unverified content

| Gate | Behaviour |
|---|---|
| `disclosure: unknown-pending-verification` | Warning treatment; **cannot reach published** |
| `testimonial.approvalOnFile: false` | **Renders nothing, in any status** |
| `brand.relationship.status != CONFIRMED` | No relationship label renders |
| `work.results.figures[].source` absent | Figure omitted; if all are, the section is removed |
| `socialProfile.sameAsEligible: false` | Not rendered — no greyed icon, no placeholder handle |
| `VerifiableValue` unverified | **Renders as nothing. Never falls back to a guess** |

These are **render-time gates, not just publish-time gates**. A published review whose disclosure is
later downgraded stops showing the old badge and starts showing the pending state.

### Draft / preview content

Renders normally under a site-wide `noindex`, with **no visual difference**. A preview should show
what the page will look like, not a decorated draft.

### Mock content

Never reaches production; `tools/check-mock-guard.mjs` fails the build. **No visual treatment is
specified for mock content, deliberately** — a "mock" badge would imply mock content can ship, and
it cannot.

---

## 6. Where an empty state must never appear

The data layer guarantees these exist, so the design does not need to design around their absence:

- The disclosure band — every review has one.
- Strengths and limitations — both required non-empty.
- Suitability, both arrays.
- Observations — minimum three.
- Testing conditions — required, non-empty.
- The Method page in either locale — build fails otherwise.
- Every stage's `doesNotProve`.
- `whatThisCannotTell` — minimum three entries.
- Alt text on any image — required by `ImageAsset`.

**These are the elements that carry the site's credibility.** Their non-emptiness is enforced in the
content model, which is a stronger guarantee than any design rule.

---

## 7. The launch-state audit

What the site actually looks like today, if it shipped with the current corpus. Stated plainly so
nobody is surprised.

| Surface | State |
|---|---|
| Reviews | **PARTIAL** — 5 per locale. Index is a single page; no category routes |
| Journal | **PARTIAL** — 5 per locale, one Arabic-original. No category routes |
| Work | **PARTIAL** — 4 en / 3 ar |
| Brands | **GATED** — 4 pages in English, 3 in Arabic. Terra Sana has none |
| Method | **FULL** — but a **PROJECT MOCK METHOD**, not a verified one |
| About | **PARTIAL** — no portrait, no verified location |
| Homepage | **STATE B** — no photography exists |
| Social | **EMPTY** — no profile is `sameAsEligible`; the footer row does not exist |
| Press | **ABSENT** — route deferred, no verified mentions |
| Testimonials | **ABSENT** — none has `approvalOnFile` |
| Contact | **PARTIAL** — form only, no verified email |
| Search | **NOT BUILT** |

**Eleven of twelve surfaces are partial, gated or absent.** That is why the partial states are
designed first-class rather than as an afterthought — and it is the strongest argument for
commissioning photography and verifying content in parallel with Phase 4.
