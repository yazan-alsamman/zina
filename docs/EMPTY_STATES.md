# Empty and Partial States

**Status:** Phase 2 decision.

These are not edge cases. At launch the site will have few reviews, unverified relationships, no
press and incomplete translations — so the **partial state is the normal state for the first year**,
and it must look intentional rather than unfinished.

---

## 1. Principles

1. **Absence is silent.** A section with nothing to show is **removed**, not rendered empty with a
   placeholder. No "no items yet", no dashed boxes, no ghost cards.
2. **Never an illustration.** No empty-state graphics, no mascots, no icons. Empty states are
   typographic, like everything else.
3. **Never apologise.** "We're still building this" undermines a premium property. State the fact or
   say nothing.
4. **Never fabricate to fill.** No placeholder brands, no invented statistics, no lorem.
5. **Redirect rather than dead-end.** Where something is missing, offer the nearest real thing.
6. **The layout must not depend on the content being there.** A grid designed for three items must
   look composed with one.

---

## 2. States

### Empty reviews index

**When:** a locale has no published reviews, or a filter matches nothing.

| | |
|---|---|
| No reviews at all | The route is not generated, and Reviews is removed from navigation. A section that does not exist is better than an empty one |
| Filter matches nothing | Filter chips stay visible with the active one marked. One line at `body.md` `text.secondary`: *"No reviews in this category yet."* Below it, the three most recent reviews under a `label.sm` heading — **Recent reviews** |
| Locale has none | Language switcher falls back to the other locale's index with its explanation line |

No illustration, no "clear filters" button — deselecting the chip is already visible.

### Brand with one review

**When:** a brand passes the index gate via the review-plus-work clause, so its page has a single
review.

The commonest partial state on the site. The page must not look like a three-column grid missing two
items.

| | |
|---|---|
| Layout | Single-column editorial, **not** a grid with one cell |
| Review | Full-width index treatment — large image, hairline, title. It gets *more* space, not less |
| Compensation | The related work case study is given equal prominence beneath |
| Absent | No "1 review" count, no empty grid cells, no "more coming" |

A brand page with one review and one case study, both at full width, reads as *curated*. The same
content in a three-up grid reads as *incomplete*. The layout is chosen by count, not scaled.

### Gated brand

**When:** a brand fails its per-locale index gate. Two of five mock brands do, one in a single
locale.

**No page exists.** Therefore:

| Surface | Behaviour |
|---|---|
| Review page brand name | Plain text, or a link to `/reviews/?brand={slug}` — **never** a link to a missing page |
| `/brands/` index | Not listed |
| Sitemap, hreflang | Absent |
| Anywhere | No "coming soon", no disabled link, no tooltip explaining the absence |

The reader never learns a page was withheld. Nothing signals a gap.

### Empty work section

| | |
|---|---|
| No projects at all | Route not generated; Work removed from navigation |
| One project | Full-width case study treatment; index and detail effectively merge |
| Two or three | Alternating full-width layout, not a grid |

### Work project with no results figures

**When:** the client supplied no performance numbers. **Expected to be common** — one mock project
has a deliberately empty `figures` array.

| | |
|---|---|
| Results section | **Removed entirely.** No "results pending", no zeroes, no estimates |
| Compensation | Deliverables and role are given more space, and the brief-and-approach section carries the argument |
| Rule | A figure renders only with a named written source and `_verification: CONFIRMED` |

A case study arguing from the work rather than from a number is often *more* persuasive to audience
B. The absence must never look like an omission — which means the section is not there at all,
rather than there and empty.

### Review with no comparison product

**When:** `comparedAgainstProductIds` is empty. Two of six mock reviews.

Comparison block removed. The method-stages block shows `comparison` as a **hollow** mineral square
— present in the protocol, visibly not applied. That is honest and costs nothing, and it is more
credible than hiding the difference.

### Review with no evidence plates

Plates section removed. `evidenceNotes` prose remains if present. The observation sequence carries
the page, which it can — it is the core of the design.

### Review with no update log

Section removed. No "never updated" line.

### Missing translation

**When:** a record exists in one locale only. One review, one journal article and one work project
in the mock set.

| Surface | Behaviour |
|---|---|
| Route | Not generated. 404 in the other locale |
| Index pages | Locale-filtered — `/ar/reviews/` lists five, not six with one broken |
| hreflang | No alternate emitted |
| **Language switcher** | Links to the **section index** in the target locale, with a visible line: *"This review is not available in Arabic. Here are the reviews that are."* |
| Related content | Filtered to the current locale. A related link never crosses languages silently |

The switcher message is real content in both locales, not a template literal. **Never** a machine
translation, never a stub, never a dead link.

### Missing image

**When:** an asset fails to load, or does not exist yet.

| | |
|---|---|
| Space | Reserved by the aspect-ratio box — **no layout shift** |
| Fill | Flat `ground.raised`. No icon, no "image unavailable", no broken-image glyph |
| Caption | Still rendered. On an evidence plate the caption carries the information |
| Alt | Still present for assistive technology |

An evidence plate whose caption reads "Hour six, product lifting around the nose" is still doing
most of its job without the photograph.

### No photography at all (the current state)

Until real photography exists:

- Neutral tone fields at the correct aspect ratio, on `ground.raised`.
- Plate numbers, captions and hairlines **retained**, so the composition is real.
- **No stock imagery of a person, ever** — an honest gap rather than a borrowed face.
- Internal previews may use stock still life; production builds may not.

### Unavailable social profile

**When:** `sameAsEligible: false` — currently every profile.

Not rendered. No greyed-out icon, no placeholder handle, no follower count. The footer shows only
verified links; if none are verified, the social row does not exist.

### Draft, review or needs-verification content

Not built in production at all (`docs/CONTENT_LIFECYCLE.md`). On preview builds it renders normally
under a site-wide `noindex`, with **no visual difference** — a preview should show what the page
will look like, not a decorated draft.

### Mock content

Never reaches production; `tools/check-mock-guard.mjs` fails the build. **No visual treatment is
specified for mock content, deliberately** — a "mock" badge would imply mock content can ship, and
it cannot.

---

## 3. Layout by count

Sections choose a layout from their item count rather than scaling one grid:

| Count | Treatment |
|---|---|
| 0 | Section removed |
| 1 | Full-width editorial. More space, not less |
| 2 | Side by side, or alternating full-width |
| 3 | Three-up grid |
| 4–6 | Grid, possibly two rows |
| 7+ | Grid plus pagination or a "view all" link |

**A one-item grid is the most common way a young site looks unfinished**, and this rule removes it.

---

## 4. Where an empty state must never appear

- The disclosure band. Every review has a disclosure; `unknown-pending-verification` is a *state*,
  not an absence, and renders with the warning treatment.
- Strengths or limitations. The validator requires both to be non-empty; a review missing either
  cannot publish.
- Suitability. Both `suitsWell` and `mayNotSuit` are required.
- Observations. Minimum three, enforced.
- Testing conditions. Required, non-empty.
- The Method page in either locale. Required in both; the build fails otherwise.

These are the elements that carry the site's credibility, and the content model already makes them
impossible to omit. The design does not need an empty state for them because the data layer
guarantees there will never be one.
