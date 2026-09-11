# UX Architecture

**Status:** Phase 3 decision. The page-level architecture for every template in the site.

The review page and the homepage have their own documents
(`docs/REVIEW_WIREFRAMES.md`, `docs/HOMEPAGE_WIREFRAMES.md`); the Method has
`docs/METHOD_UX.md`. This document holds **every other template**, plus the rules that apply across
all of them.

---

## 1. The template set

Fifteen templates cover every route in `content/mock/site.json`.

| # | Template | Route | Doc | Built in v1 |
|---|---|---|---|---|
| T-01 | **Review detail** | `/{loc}/reviews/{slug}/` | `REVIEW_WIREFRAMES.md` | Yes |
| T-02 | **Home** | `/{loc}/` | `HOMEPAGE_WIREFRAMES.md` | Yes |
| T-03 | **Method** | `/{loc}/method/` | `METHOD_UX.md` | Yes |
| T-04 | **Review index** | `/{loc}/reviews/` | §3 here | Yes |
| T-05 | **Journal index** | `/{loc}/journal/` | §4 here | Yes |
| T-06 | **Journal article** | `/{loc}/journal/{slug}/` | §5 here | Yes |
| T-07 | **Work index** | `/{loc}/work/` | §6 here | Yes |
| T-08 | **Work case study** | `/{loc}/work/{slug}/` | §7 here | Yes |
| T-09 | **Brand index** | `/{loc}/brands/` | §8 here | Yes |
| T-10 | **Brand detail** | `/{loc}/brands/{slug}/` | §9 here | Yes, **gated** |
| T-11 | **About** | `/{loc}/about/` | §10 here | Yes |
| T-12 | **Contact** | `/{loc}/contact/` | §11 here | Yes |
| T-13 | **Editorial standards** | `/{loc}/editorial-standards/` | §12 here | Yes |
| T-14 | **Legal** | `/{loc}/privacy/`, `/{loc}/terms/` | §13 here | Yes |
| T-15 | **404** | `/{loc}/404/` | §14 here | Yes |
| — | Review category | `/{loc}/reviews/{category}/` | Deferred, gated at 5 | No |
| — | Journal category | `/{loc}/journal/{category}/` | §4.4 here, gated at 3 | Route defined, none qualifies |
| — | Product hub | `/{loc}/brands/{b}/{p}/` | Deferred | No |
| — | Press | `/{loc}/press/` | Deferred | No |
| — | Search | `/{loc}/search/` | `SEARCH_UX.md` | No |

**No template exists that does not correspond to a route, and no route exists without a template.**
Verified by `tools/check-ux-coverage.mjs`.

---

## 2. Rules that apply to every template

### 2.1 The page skeleton

```
[SKIP LINK]         first in tab order, visible on focus
[GLOBAL HEADER]     header landmark
  [BREADCRUMB]      except home
  <main>            one per page, the skip target
    …template…
  </main>
[FOOTER]            footer landmark
```

### 2.2 The exit rule

**Every template must offer at least one specific, contextual exit above the footer.** A page whose
only exits are the header and footer is a dead end with navigation attached.

Checked per template in §15.

### 2.3 Density

`docs/ART_DIRECTION.md` §7 assigns each surface a dominant density. Phase 3 restates it as a UX
constraint:

| Density | Governs | Templates where it dominates |
|---|---|---|
| **Editorial** | Reading | Home, journal article, about, brand, contact, legal |
| **Record** | Scanning and evidence | Review detail, Method |
| **Mixed, rationed** | | Review index (disclosure markers only), work case study (deliverables and terms only) |

**A page that is all record density is a dashboard. A page that is all editorial density has no
proof.** The evidence language is rationed: full on reviews, partial on Method and work, one moment
on the homepage, absent elsewhere.

### 2.4 Layout by count, not by grid

Every listing surface chooses its layout from its item count (`docs/EMPTY_PARTIAL_UX.md` §3):
0 → section removed · 1 → full-width editorial · 2 → side by side · 3 → three-up · 4–6 → grid ·
7+ → grid plus pagination.

**A one-item grid is the most common way a young site looks unfinished.**

### 2.5 Locale filtering happens before layout

Every listing filters to the current locale **first**, then chooses its layout from what remains.
A listing never renders a slot for an item that does not exist in this language.

### 2.6 Nothing required to read the page depends on JavaScript

Content is server-rendered. Interaction is enhancement. The evidence layer contains no interactive
elements at all.

---

## 3. T-04 · Review index

**The library. The reason the site is a destination.**

```
[BREADCRUMB]  Home / Reviews
[TITLE]       Reviews                                   h1
[INTRO]       One paragraph. What these are and how they are made.
              Includes ONE contextual link to /method/.

[FACETS]      ─────────────────────────────────────────────────────
              CATEGORY   All · Foundation · Concealer · Mascara · Lip · Serum
              BRAND      All · Maison Eclat · Veloura · Lune Skin · Atelier Noor · Terra Sana
              DISCLOSURE All · Independent · Gifted · Sponsored · Paid
              ─────────────────────────────────────────────────────
              ↑ REAL LINKS to crawlable server-rendered URLs.
                Not client-only state. Not a dropdown.

[LISTING]     index treatment — image, hairline, type. Not cards.
              ┌──────────┐  GIFTED                    ← disclosure marker FIRST
              │   4:5    │  Atelier Noor · Concealer
              └──────────┘  Sitara Luminous Concealer
              ───────────   Six wear tests, shade 14
                            Tested June 2026
```

| | |
|---|---|
| **Purpose** | Browse the corpus; make the disclosure status of every review visible at listing level |
| **Information priority** | Above fold: title, intro, facets, first two reviews · First scroll: the listing · End: pagination or nothing |
| **Reading order** | Breadcrumb → h1 → intro → facets → listing |
| **Facets** | **The single architectural decision on this page.** Each facet state is a real URL returning server-rendered HTML — shareable, crawlable, back-button-correct. A JS-only filter leaves the corpus reachable only through the sitemap (R-15) |
| **Facet UX** | Chips: 2px radius, 1px `line.strong` border, transparent fill. Active state = clay border and text **plus a filled mineral square**. Arrow-key navigable within the group. 44px tall. **No count badges, no close ×** |
| **Sort** | Not offered in v1. Reverse chronological is the only order, and sort must never be the only way to reach an item |
| **Desktop** | Three-up listing; facets on one row |
| **Tablet** | Two-up; facets wrap to two rows |
| **Mobile** | Stacked, full-width images; facets in a horizontal edge-scroll row **with visible overflow**, starting at the inline start |
| **Arabic** | Facet row scrolls from the right; brand names Latin and isolated; category names localised |
| **Accessibility** | Facets are a group of links with `aria-current` on the active one, in a `<nav aria-label="Filter reviews">`. Not a listbox, not a combobox — they are navigation. Each listing item is one link with a complete accessible name including its disclosure state |
| **Empty/partial** | Filter matches nothing → chips stay visible with the active one marked, one line at `body.md` secondary — *"No reviews in this category yet."* — then the three most recent reviews under a `Recent reviews` label. **No illustration, no "clear filters" button** (deselecting the chip is already visible). Locale has none → route not generated and Reviews removed from navigation |
| **Exit** | A review · `/method/` from the intro · a facet |
| **Budget** | JS ≤20KB (the only genuinely interactive component on the site); works entirely without JS as links |

### 3.1 Facet indexability

| URL | Indexable |
|---|---|
| `/{loc}/reviews/` | Yes, self-canonical |
| `/{loc}/reviews/?category=foundation` | `noindex, follow`, canonical → `/{loc}/reviews/` |
| `/{loc}/reviews/?brand=…`, `?disclosure=…` | Same |
| Any two facets combined | Same. **Never indexable** — the classic crawl-budget sink |
| `/{loc}/reviews/{category}/` | Indexable **when** the category holds 5+ reviews in this locale. **None does today** |

---

## 4. T-05 · Journal index

```
[BREADCRUMB]  Home / Journal
[TITLE]       Journal
[INTRO]       What the journal is: writing about testing, not about products.

[FEATURED]    One article, full-width index treatment
[LISTING]     Reverse chronological, category as a TEXT LABEL (not a pill)
              Pillars visually distinguished from supporting pieces
```

| | |
|---|---|
| **Purpose** | Topical authority above product level; the entry point for problem-shaped queries |
| **Categories** | **Editorial formats, never product categories** — `testing-notes`, `guides`, `comparisons`, `essays`. Rendered as labels on entries |
| **Pillar vs supporting** | Pillars get the wider treatment. The distinction is **layout weight**, not a badge |
| **Desktop** | Featured full-width, then two-up |
| **Tablet** | Two-up |
| **Mobile** | Stacked |
| **Arabic** | Includes Arabic-original articles with no English sibling. **This is the section where locale independence is most visible** |
| **Accessibility** | Category labels are text, not pills; `<ul>` for the listing |
| **Empty/partial** | Category routes are **gated at 3 articles per locale and none qualifies** — so categories are labels, not links, today. When a category activates, the label becomes a link with no other change |
| **Exit** | An article · a category (when activated) |

### 4.1 Journal category page (gated, not built)

When a category reaches 3 articles in a locale, `/{loc}/journal/{category}/` generates with: breadcrumb `Home / Journal / {category}`, an `h1` naming the format, one paragraph of original writing about what that format does, and the listing. **A category page that is only a listing does not justify a URL** — the paragraph is a requirement, not a nicety.

---

## 5. T-06 · Journal article

```
[BREADCRUMB]  Home / Journal / {title}
[CATEGORY + TYPE]   GUIDES · PILLAR
[TITLE / SUBTITLE]
[BYLINE + DATES + READING TIME]
[HERO]        LCP
[OPENING PARAGRAPH]     body.lg
[TABLE OF CONTENTS]     only when 4+ sections
[BODY SECTIONS]
   └ CONTEXTUAL REVIEW LINKS, inline, at the sentence making the claim
[METHOD STAGE LINK]
[REFERENCED REVIEWS]    index treatment
[RELATED ARTICLES]      2
[CTA]                   to /reviews/ or /method/
```

| | |
|---|---|
| **Purpose** | Answer a problem, and route to the review that evidences the answer |
| **Information priority** | Above fold: category, title, subtitle, byline · First scroll: hero, opening paragraph · Deep: the sections and their citations · End: referenced reviews |
| **The load-bearing element** | **The contextual in-prose link.** A related block at the foot does not carry Flow E — the reader must be handed the evidence at the moment the claim is made |
| **Evidence language** | **Rationed to one moment**: a single plate or a single quoted observation, only where the article cites a specific review. No conditions well, no observation sequence |
| **Table of contents** | Static list of anchors, only at 4+ sections. Not sticky, not floating, not collapsible |
| **Medical boundary** | Any article touching routines or skin carries an explicit boundary section — *"When to stop and see a professional"*. An editorial standard and a YMYL control |
| **Desktop** | Text column 620px, hero full-bleed |
| **Tablet/Mobile** | Single column; ToC becomes a plain list above the first section |
| **Arabic** | ×1.12 / ×1.18. Latin product names isolated |
| **Accessibility** | `h1` title, `h2` per section, ToC as a `<nav>` with an accessible name, `scroll-margin-top` on anchors, `<time datetime>` on dates |
| **Empty/partial** | Fewer than 4 sections → no ToC. No referenced reviews → the block is removed, but an article with **no** review citation should not publish (`docs/INTERNAL_LINKING_STRATEGY.md` §2 marks it mandatory) |
| **Exit** | The cited review (contextual) · Method stage · related articles |

---

## 6. T-07 · Work index

```
[BREADCRUMB]  Home / Work
[POSITIONING]   person.bios.collaboration — what she does and the terms
[CAPABILITY]    Derived from `category` across projects: launches, editorial
                series, social campaigns, beauty campaigns. TEXT, not icons.
[FEATURED]      featured: true, locale-filtered
[ALL PROJECTS]  Reverse chronological
[WHAT SHE DOES NOT DO]   pre-approved verdicts, undisclosed placements
[CTA]           /contact/?inquiryType=collaboration
```

| | |
|---|---|
| **Purpose** | The commercial argument. Audience B and C |
| **Information priority** | Above fold: positioning + first project · First scroll: the projects · End: the terms and the CTA |
| **"What she does not do"** | Optional in Phase 1, **recommended in Phase 3**: it filters bad enquiries before they arrive and is the clearest expression of the editorial position on a page a brand actually reads |
| **Desktop** | Alternating full-width projects, not a grid |
| **Tablet/Mobile** | Stacked |
| **Arabic** | 3 projects in Arabic vs 4 in English — the index simply lists three |
| **Accessibility** | Capability summary is a list, not a row of icons |
| **Empty/partial** | 0 projects → route not generated, Work removed from navigation · 1 → index and detail effectively merge, full-width treatment · 2–3 → alternating full-width, **not a grid** |
| **Exit** | A case study · `/contact/` |
| **Note** | Work is the one section where **more is not better**. Plan to curate, not archive |

---

## 7. T-08 · Work case study

```
[BREADCRUMB]  Home / Work / {title}
[CLIENT · CAMPAIGN · YEAR]
[TITLE + SUMMARY]
[HERO]                          LCP
[DISCLOSURE BAND]               same discipline as reviews — stated, not buried
[THE BRIEF AND THE APPROACH]    where the thinking shows
[ROLE]
[DELIVERABLES]                  RECORD DENSITY — the section a producer reads
[MEDIA GALLERY]
[RESULTS]                       CONDITIONAL — see below
[RELATED INDEPENDENT REVIEW]    ← THE CREDIBILITY CROSS-LINK
[BRAND]                         if the gate passes in this locale
[CTA]                           /contact/
```

| | |
|---|---|
| **Purpose** | Evidence of capability, cross-linked to evidence of credibility |
| **The decision moment** | **The cross-link to the independent review of the same brand.** Phase 1 Journey B identifies this as where audience B decides. It shows the disclosure policy working rather than describing it |
| **Disclosure here** | Work is paid by definition, so the disclosure is about **terms**: whether findings were guaranteed publishable, whether verdicts were pre-agreed, whether the brand had approval. *"Two of five episodes contradicted a brand claim, both published unchanged"* is the portfolio's strongest asset |
| **Results** | **A figure renders only when `source` names a written client-supplied origin AND `_verification` is `CONFIRMED`.** Otherwise the **whole section is removed** — no "results pending", no zeroes, no estimates |
| **Record density** | Deliverables and licence terms only. No observations, no conditions well, no plates |
| **Desktop** | Text column with a full-bleed hero and gallery |
| **Tablet/Mobile** | Single column; deliverables become label/value rows |
| **Arabic** | Mirrors; client names Latin and isolated |
| **Accessibility** | Deliverables as a list or a table with real semantics; disclosure band as on the review page |
| **Empty/partial** | **No results figures is a valid, complete state** and one mock project has a deliberately empty array. The section is absent, and deliverables and the brief carry the argument — often *more* persuasive to audience B than a view count. No related review → the block is removed |
| **Exit** | The independent review · brand · `/contact/` |

---

## 8. T-09 · Brand index

| | |
|---|---|
| **Purpose** | Entry for brand-led browsing |
| **Content** | Only brands that **pass the gate in this locale**. It is not a directory of every brand ever mentioned |
| **Listing** | Name, positioning line, review count, index treatment. **No logo wall** — logos appear on the brand's own page, not as a strip |
| **Desktop/Tablet/Mobile** | Layout by count. Today: 3–4 per locale → a grid is legitimate; below 3 → full-width entries |
| **Arabic** | Lists the brands passing the Arabic gate — 3, not 4 |
| **Accessibility** | Listing is a `<ul>`; each item one link |
| **Empty/partial** | A gated brand is **not listed, not greyed out, not marked "coming soon"**. The reader never learns a page was withheld |
| **Exit** | A brand page |
| **Navigation** | **Not in primary navigation.** Reachable from every review, the reviews-index filter, and the footer |

---

## 9. T-10 · Brand detail (gated)

```
[BREADCRUMB]  Home / Brands / {name}
[IDENTITY]    name · logo · restrained accent tint — NOT a takeover
[POSITIONING] one line
[DESCRIPTION] original writing, never the brand's copy
[RELATIONSHIP]  ONLY if relationship.status is CONFIRMED — else absent entirely
[REVIEWS OF THIS BRAND]   locale-filtered — the reason the page exists
[PRODUCTS TESTED]         inline; products have no route
[RELATED WORK]            with disclosure
[OFFICIAL LINK]           rel="nofollow" (+ sponsored where paid)
[CTA]                     to /reviews/, not to the brand
```

| | |
|---|---|
| **Purpose** | Answer *"has she tested anything from this house, and what did she conclude across all of it"* — a question a single review cannot answer |
| **Gate** | `(reviews ≥ 2) OR (reviews ≥ 1 AND work ≥ 1)`, AND description ≥120 chars, AND a logo exists — **per locale** |
| **Brand tint** | `identity.accentColor` is used at most as a hairline or a small mark. **The page never adopts the brand's palette** — this is Zina's site, and a brand takeover would blur exactly the independence the site argues for |
| **Relationship block** | Renders **only** on `CONFIRMED`. In the mock set every value is `MOCK`, and a mock relationship marked `CONFIRMED` **fails the build** |
| **Desktop/Tablet/Mobile** | Layout by count of reviews |
| **Arabic** | Veloura and Terra Sana are gated in Arabic — those pages **do not exist** in `/ar/` |
| **Accessibility** | Logo `alt` is the brand name. External link marked with the diagonal-arrow icon and an accessible name saying it opens the brand's site |
| **Empty/partial** | **One review is the commonest partial state**: single-column editorial, the review at full width with **more** space not less, and the related case study given equal prominence beneath. **Never a three-up grid missing two cells.** No "1 review" count |
| **Exit** | A review · a case study |

---

## 10. T-11 · About

```
[BREADCRUMB]  Home / About
[PORTRAIT]    full editorial scale — the most human page
[NAME + TITLE]
[LONG BIO]    person.bios.long, ~200 words, editorial density
[EXPERTISE]   5 entries, label + detail. NOT a skills bar, NOT percentages
[PHILOSOPHY]  statement + 7 principles
[METHOD LINK] mandatory, from person.methodId
[EDITORIAL STANDARDS LINK]
[WORK LINK]  [CONTACT LINK]
```

| | |
|---|---|
| **Purpose** | The `Person` entity anchor, and the trust page for audiences B and C |
| **Information priority** | Above fold: portrait, name, title, first lines of the bio · First scroll: the bio · Deep: expertise and philosophy · End: the four links out |
| **Expertise** | Label and detail as type. **No skill bars, no percentages, no meters** — dashboard language, and a "92% shade matching" figure would be fabricated |
| **Evidence language** | **None.** This is a reading surface |
| **Desktop** | Portrait at full editorial scale beside or above the bio |
| **Mobile** | Portrait 4:5 full-bleed, bio below |
| **Arabic** | Both locales required |
| **Accessibility** | `h1` is the name here — on this page the person *is* the subject. Portrait has descriptive `alt` |
| **Empty/partial** | **State B (no photography)**: the page runs typographically with the bio at `body.lg` and no tone field. `location` renders only if `_verification` is `CONFIRMED` — it is `MOCK` today, so it does not render at all |
| **Exit** | Method (mandatory) · editorial standards · work · contact |

---

## 11. T-12 · Contact

| | |
|---|---|
| **Purpose** | The primary conversion |
| **Content** | `person.bios.collaboration` · inquiry-type selector · form · direct email if verified · response expectation |
| **Inquiry type** | Routes the enquiry: collaboration · press · general. Preselectable by query parameter from `/work/` |
| **Form UX** | Labels **always visible above the field** — never placeholder-as-label. Underline-only inputs, no boxes. One primary button. Errors as **icon plus text** beneath the field, plus a border change |
| **Desktop** | Single column, ~640px. A form should feel calm |
| **Mobile** | Full width, 44px targets, correct `inputmode` and `autocomplete` |
| **Arabic** | Field labels localised; the form is LTR-safe for email input inside an RTL page (`dir="ltr"` on the email field, not on its label) |
| **Accessibility** | Every field programmatically labelled; errors associated with `aria-describedby`; error summary at the top of the form on submit, focus moved to it; no error announced before the user has finished typing |
| **Empty/partial** | Direct email renders only if verified (U-02 blocks it today). Success state is a page, not a toast, so it is linkable and announced |
| **Exit** | Success state → `/reviews/` |
| **Budget** | JS ≤15KB. **The form must work without JavaScript** — a native POST with server-side validation, enhanced by client-side validation |

---

## 12. T-13 · Editorial standards

| | |
|---|---|
| **Purpose** | The E-E-A-T and trust artefact. **A real indexable page, never a modal** |
| **Content** | Disclosure policy · corrections policy · medical boundary · AI policy · **ratings policy** (why there are no scores) · gifting and payment policy |
| **Why it matters** | It is what a brand's legal team reads, and what a sceptical reader checks. Its presence in a persistent footer is itself a trust signal |
| **Density** | Editorial. Long-form prose, `h2` per policy |
| **Accessibility** | Plain document structure. No accordions — the policies are the content |
| **Empty/partial** | None; static content required in both locales |
| **Exit** | `/method/` · `/contact/` |

---

## 13. T-14 · Legal (privacy, terms)

| | |
|---|---|
| **Purpose** | Legal requirement. Footer-linked, indexable, priority 0.2 |
| **Content** | Standard long-form. Privacy content depends on the analytics decision and the jurisdiction (U-03) |
| **Density** | Editorial, quietest on the site |
| **Accessibility** | `h2` per clause; no collapsed sections |
| **Empty/partial** | Blocked on U-03 — must not ship with placeholder legal text |
| **Exit** | Footer only. **The documented exception to the exit rule** — a legal page's job is to be read, not to route |

---

## 14. T-15 · 404

| | |
|---|---|
| **Purpose** | Recover a dead link into a live one. A review site accumulates dead links from social posts and reformulated products |
| **Content** | One plain line. Three most recent reviews **in this locale**. A link to `/{loc}/reviews/` |
| **Tone** | **No apology, no illustration, no humour, no large "404".** State the fact |
| **Indexing** | `noindex` |
| **Arabic** | Recent Arabic reviews. **It does not offer the English version of the missing page** — see `docs/USER_FLOWS.md` H-2 and decision D3-6 |
| **Accessibility** | `h1` states what happened; the recovery links are the main content, not an afterthought |
| **Exit** | Recent reviews · reviews index |

---

## 15. Exit matrix

Every template, and the specific contextual exit it offers above the footer.

| Template | Primary exit | Secondary | Tertiary |
|---|---|---|---|
| Home | Featured review | Method | Recent reviews / work / journal / contact |
| Review detail | **Method** (stage markers) | Related reviews (2) | Brand, related work, journal |
| Method | Representative reviews | Editorial standards | — |
| Review index | A review | A facet | Method (from the intro) |
| Journal index | An article | A category (when activated) | — |
| Journal article | **The cited review, in prose** | Method stage | Related articles |
| Work index | A case study | Contact | — |
| Work case study | **The independent review** | Contact | Brand |
| Brand index | A brand | — | — |
| Brand detail | A review | A case study | Reviews index |
| About | **Method** | Editorial standards | Work, contact |
| Contact | Success → reviews | — | — |
| Editorial standards | Method | Contact | — |
| Legal | *Footer only — documented exception* | — | — |
| 404 | Recent reviews | Reviews index | — |

**Every route in the site has at least one inbound contextual link and at least one outbound
contextual exit.** Orphan analysis: `docs/SEO_UX_INTEGRATION.md` §6.

---

## 16. Information priority, all templates

What must be understood by each zone, per template. The objective is that a user understands the
site **without reading everything**.

| Template | Above the fold | First scroll | Second scroll | Deep reading | End of page |
|---|---|---|---|---|---|
| **Review** | Product, test, **disclosure** | It was really tested (summary strip) | **Conditions published** | Observations, plates, assessment | Verdict, claims, exits |
| **Home** | The claim, who she is, **why different** | The proof block | The six stages | The corpus | One CTA |
| **Method** | What it is called and what it is | **The boundary statement** | Stages 1–2 with their limits | Stages 3–6 | What it cannot tell you; the reviews |
| **Review index** | This is a library, and it is filterable | The corpus | More of it | — | — |
| **Journal index** | What the journal is | Featured piece | The listing | — | — |
| **Journal article** | The question being answered | The opening argument | The first section and its citation | The argument | The reviews that evidence it |
| **Work index** | What she does and on what terms | Capability | Featured projects | All projects | What she does not do; contact |
| **Work case study** | Client, campaign, **disclosure/terms** | The brief | Role and deliverables | Gallery, results if verified | **The independent review** |
| **Brand index** | Which houses are covered | The list | — | — | — |
| **Brand detail** | Which brand, and Zina's own description | The reviews | Products, work | — | Reviews index |
| **About** | Who she is | The bio | Expertise | Philosophy | Method, standards, contact |
| **Contact** | How to reach her and for what | The form | — | — | — |
| **Editorial standards** | That standards exist and are specific | Disclosure policy | Corrections, medical | AI, ratings | Method |
| **404** | That the page is gone, and what is here instead | Recent reviews | — | — | — |

---

## 17. Cross-template consistency rules

| Rule | Applies to |
|---|---|
| Disclosure is above the content and never collapsed | Review detail, work case study |
| Limitations at identical weight to strengths | Review detail |
| `doesNotProve` at identical weight to purpose | Method |
| Results render only when verified | Work case study |
| Relationship labels render only when `CONFIRMED` | Brand detail, work case study |
| Brand links are a function of the per-locale gate | **Every template that names a brand** |
| Related content is locale-filtered, then laid out by count | Every template with a related block |
| Breadcrumbs mirror the URL and never name a page that does not exist | Every template except home |
| One `h1` per page; heading level follows structure, never visual size | Every template |
| Section order is fixed and never re-ordered by breakpoint | Every template |
| Record density appears only where the evidence ration allows | Every template |
