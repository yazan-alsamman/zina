# Component Inventory

**Status:** Phase 3 decision. Component boundaries, not component code.

**Built from the five signature devices and the actual content model** — not from a generic UI kit.
There is no `Button`, `Card`, `Modal` or `Badge` entry in this inventory as a top-level component,
because none of those is a thing this product has. Controls are specified where they are used.

**Every component maps to a content entity or to a named UX requirement.** Verified by
`tools/check-ux-coverage.mjs`.

---

## 0. The card rule

**A card is a last resort.** Editorial layouts are built from type, rules and space.

A **card** — a bounded surface containing grouped content — is permitted only when all three hold:

1. The items are genuinely peer objects in a set.
2. Each is individually actionable as a whole.
3. Rules and space cannot express the grouping.

By that test the entire site uses a contained surface in **three** places, and each is recorded here
with its justification, per the brief's requirement:

| # | Where | WHY it is contained | WHY NOT editorial structure |
|---|---|---|---|
| **C-1** | **Suitability block** (suits well / may not suit) | The two lists *belong to each other* — the pairing is the meaning. A reader must see them as one assessment with two halves | Rules alone would read as two unrelated lists. The surface is what says "these are the same judgement, seen from two sides" |
| **C-2** | **Related content block** at the foot of a page | Peer objects, individually actionable, and the block must separate cleanly from the article | A hairline alone does not create enough distance after 128px of space; the reader needs to know the article has ended and navigation has begun |
| **C-3** | **Mobile menu panel** | It is an overlay surface, not a card. It must occlude the page beneath it | There is no editorial equivalent of an overlay |

**Everywhere else uses the INDEX TREATMENT:**

```
CARD  (rejected)                    INDEX TREATMENT  (used)

┌──────────────────┐                ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │                ────────────────      hairline
│  Foundation      │                GIFTED
│  Voile Lumière   │                Foundation · Maison Eclat
│  [ Read → ]      │                Voile Lumière Skin Tint
└──────────────────┘                Eight hours in 38° heat
                                    (the whole block is the link)
```

Image, hairline, type. No container, no border, no padding box, no shadow, no hover lift. Applies to:
review listings, journal listings, work listings, brand listings, homepage sections 4–6, related
content items, search results if search ever ships.

**Radius is 0 everywhere except 2px on controls. There is no third radius value.**

---

## 1. Inventory map

| Tier | Components |
|---|---|
| **0 — Signature devices** | Margin Index · Plate · Three Voices (Claim / Observation / Verdict) · Disclosure Band · Conditions Well |
| **1 — Global structure** | Global Header · Primary Navigation · Locale Switcher · Language Availability Indicator · Breadcrumb · Footer · Skip Link |
| **2 — Content entities** | Review Metadata · Testing Summary Strip · Method Stage · Method Boundary · Method Stage Markers · Review Navigation · Product Context · Brand Context · Related Content · Journal Entry · Work Project · Person Block · Index Entry |
| **3 — Interaction & state** | Facet Group · Contact Form · Empty State · Partial State · Update Log · Search Result *(deferred)* |

**24 components ship in v1. One (Search Result) is specified and deferred.**

---

# TIER 0 — SIGNATURE DEVICES

## CMP-01 · Margin Index

*The device a reader will remember. Marginalia, not a sidebar.*

| | |
|---|---|
| **Purpose** | Register where you are in a test — hour markers, stage names, plate numbers — beside the body rather than inside it |
| **Content model** | `review.observations[].at` + `.aspect`; `method.stages[].name`; `media.evidence[]` plate numbers |
| **Required** | `at` (the marker) |
| **Optional** | `aspect`, stage name, plate number |
| **States** | Column (≥1024) · Inline (<1024) · Empty (never — if there are no observations the review cannot publish) |
| **Desktop** | 160px column at the inline start, 32px gap, `record.sm` 13px Plex Mono in `accent.mineral`. A 6px filled mineral square marks each entry on the rule |
| **Mobile** | **Collapses to an inline marker row above each entry. Never hidden** — hour markers are part of the record, and hiding them removes evidence from the majority of readers |
| **RTL** | Moves to the **right**. The rule and markers follow inline-start via logical properties |
| **Accessibility** | `<aside>` on desktop, and it **keeps its role when it moves inline**. Marker text is real content, not a CSS pseudo-element, so it is announced. Not focusable — it is not a control |
| **Performance** | Zero JS. Pure layout |
| **Allowed variants** | Observation index · Method stage index · Plate index |
| **Forbidden variants** | Sticky · a table of contents · a progress indicator · a scrollspy · numbered navigation · anything that makes it a control rather than marginalia |

---

## CMP-02 · Plate

*Evidence photography numbered and captioned, referenced from the prose by number.*

| | |
|---|---|
| **Purpose** | Turn a gallery into a record. A plate is numbered **because it is referred to** |
| **Content model** | `EvidenceAsset` = `MediaAsset` + **`stageKey` (required)** + `observationIndex` (optional) |
| **Required** | `src`, `alt`, `width`, `height`, `stageKey`, plate number (derived from order) |
| **Optional** | `caption`, `observationIndex` |
| **States** | Single (full-bleed 3:2) · Pair (1:1, edge to edge, 2px gap) · Missing image (tone field, **caption retained**) · No plates (component absent) |
| **Desktop** | Image flush to the grid, **no frame, no border, no radius**. `Plate 03` in mono mineral above the caption; caption in `body.sm` secondary; hairline beneath the caption at full image width — the art-book treatment, where the rule closes the caption rather than boxing the image |
| **Mobile** | Single column always; pairs stack. **Ratio never changes** — comparability is the function |
| **RTL** | Caption inline-start; `لوحة 03` zero-padded with the numeral isolated `dir="ltr"` |
| **Accessibility** | `<figure>` + `<figcaption>`. **`alt` describes what the frame shows** — *"Hour six, product lifting around the nose"*, never *"review photo"*. Alt and caption must not duplicate: the caption is public annotation, the alt is description. A blind reader should be able to follow the observation sequence from alt and caption alone |
| **Performance** | Lazy, below the fold by construction. Decode fade 200ms, nothing else. May carry a slightly larger file than other images because fidelity is the function |
| **Allowed variants** | Single · Comparison pair |
| **Forbidden variants** | **Before/after slider** (hides half the evidence and is unusable by keyboard) · lightbox in v1 · carousel · zoom · parallax · any motion on the image · a grid of thumbnails |

---

## CMP-03 · Three Voices

*Claim, Observation, Verdict — distinguishable **without reading them**.*

| | |
|---|---|
| **Purpose** | Make the three kinds of statement on a review page distinguishable **without reading them** — so a reader can tell at a glance that "up to 12 hours of comfortable wear" is something the brand said and "product began to lift around the nose at hour six" is something Zina saw |

Three sub-components that must be specified together, because their distinction is relational.

| Axis | **CLAIM** | **OBSERVATION** | **VERDICT** |
|---|---|---|---|
| Content model | `product.brandClaims[]` | `review.observations[]` | `review.verdict` |
| Whose voice | The brand's | Recorded at the time | Opinion, owned |
| Typeface | Zarid Text 400 | Zarid Text + Plex Mono | Zarid **Serif** |
| Size | 16px | 18px + 15px mono | 40px |
| Colour | muted `#9A9184` | ivory + mineral | ivory |
| Surface | raised | base | raised, full-bleed |
| **Rule** | **dotted** hairline | **solid** mineral | **solid 2px clay** |
| Indent | 24px in | flush to column | full-bleed |
| Marker | none | mineral square | clay rule above |
| Label | `CLAIMED BY THE BRAND` | aspect label | `THE VERDICT` |
| Volume | quietest | primary | loudest |

| | |
|---|---|
| **Required** | All three carry a **visible text label**. The label is the primary carrier of meaning; typeface, rule style and volume reinforce it |
| **States** | Claim: present / absent (no claims → block removed). Observation: 3+ always. Verdict: always |
| **Desktop / Mobile** | Volume relationships hold at every width. On mobile the verdict floors at 28px and remains the largest thing in its region |
| **RTL** | Rules and indents at inline start. Claim label `تدّعي العلامة`, **never tracked** |
| **Accessibility** | **Three axes vary together — typeface, rule style, volume — so the distinction survives greyscale, colour-vision deficiency and `forced-colors`.** Colour is the fastest cue and never the only one. Claim is a `<blockquote>` with visible attribution; observations are an ordered list; verdict is an `h2` plus prose |
| **Performance** | Zero JS. Zero images. **The most distinctive part of the design is also the cheapest** |
| **Allowed variants** | Claim inline in prose (still dotted, still attributed) · Observation with or without an evidence plate reference |
| **Forbidden variants** | Any treatment that makes a claim look endorsed · a quotation-mark glyph as decoration · an info icon · a coloured badge · coloured pass/fail markers on observations · **a score, star, number or badge on the verdict** · observations inside an accordion or tabs |

---

## CMP-04 · Disclosure Band

*The most important element on a review page.*

| | |
|---|---|
| **Purpose** | State the commercial relationship before the reader sees anything persuasive |
| **Content model** | `review.disclosure.primary` (6 values) + `additional[]` (3 modifiers) + localised `disclosureLabel` + **`disclosureStatement`** |
| **Required** | Label **and** statement. *A badge says "gifted"; a statement says what that means for the reader* |
| **Optional** | `additional[]` modifiers — rendered as a **second line**, never as a second badge |
| **States** | 6, with prominence scaling with commercial entanglement: `independently-purchased` and `editorial` (hairline, muted) · `gifted` (mineral) · `sponsored` (clay, +8px padding) · `paid-collaboration` (**2px clay**, +16px) · `unknown-pending-verification` (warning; **cannot reach published**) |
| **Desktop** | Full-bleed, `ground.raised`, paper grain 3%, 40px padding, top rule 1px→2px by severity. **Above the hero** |
| **Mobile** | Full-bleed, 20px padding. **Statement always fully visible at every width down to 320** — never truncated, never "read more", never collapsed |
| **RTL** | Rule and label at inline start |
| **Accessibility** | `<section>` with an accessible name. **Present at first paint — never revealed by script.** Six states distinguished by an explicit **text label**, never by rule colour alone. Not a heading, not interactive |
| **Performance** | Must not be render-blocked or animated. No motion of any kind |
| **Allowed variants** | Review · Work case study (where it describes **terms** rather than payment) |
| **Forbidden variants** | A pill · a badge · a chip · a tooltip · a footnote · a footer position · anything collapsible · anything dismissible · a lighter weight than body text |

---

## CMP-05 · Conditions Well

*The most record-like element on the site, and the most direct expression of the differentiator.*

| | |
|---|---|
| **Purpose** | Publish the environment a test happened in, so a long-wear claim can be checked |
| **Content model** | `review.locales[].conditions[]` — `{label, value}[]`, required non-empty |
| **Required** | At least one row. Validator-enforced |
| **Optional** | — |
| **States** | Two-column (≥768) · Label/value rows (<768) · Never empty |
| **Desktop** | `ground.inset`, hairline row rules, **no outer border, no cell borders, no zebra striping**. Label column Plex Sans muted at inline start; value column Plex Mono, tabular, to inline end so numerals form a column |
| **Mobile** | Label/value rows. **Prose values wrap; only the numeric run is `nowrap`** — measured fix, `docs/PHASE_3_BILINGUAL_TYPE_PROOF.md` §6. Without it the English table overflows at 320px |
| **RTL** | Label column at inline start; numerals stay LTR **inside a `dir="ltr"` isolate that wraps the numerals only** — an Arabic unit (`°م`, `٪`) sits outside the isolate. Wrapping the whole run in a bare `<bdi>` reverses the range (measured) |
| **Accessibility** | A real `<table>` with `<th scope="row">`, not a grid of divs. Named — "Testing conditions" |
| **Performance** | Zero JS. Rows may fade in with a 60ms stagger, once |
| **Allowed variants** | Review conditions · Method `conditions` stage illustration |
| **Forbidden variants** | A data grid with borders and zebra striping · sortable columns · a filterable table · **thermometer or droplet icons beside values** (the conditions table is a printed table, not a weather widget) · a chart of any kind · collapsible rows |

---

# TIER 1 — GLOBAL STRUCTURE

## CMP-06 · Global Header

| | |
|---|---|
| **Purpose** | Persistent wayfinding and locale control |
| **Content model** | `site.navigation.primary[]` · `site.navigation.cta` · `site.i18n.locales[]` |
| **Required** | Wordmark, primary nav, CTA, locale switcher |
| **States** | Desktop full · Condensed (<1024) · Menu open · Scrolled-up (visible) · Scrolled-down (hidden) |
| **Desktop** | Wordmark inline-start; 5 items, CTA and switcher inline-end. **Intrinsic requirement measured: 753px English, 686px Arabic** (fallback tier) — which is why the full header does not exist below 1024 |
| **Mobile** | Wordmark, Collaborate affordance, menu trigger. Switcher lives **inside** the menu — it is used once per visit at most |
| **RTL** | Whole header mirrors via logical properties. **Height is reserved for the Arabic line box (88px vs 82px) in both locales**, so the header does not change height when the language changes |
| **Accessibility** | `<header>` landmark; `<nav aria-label="Primary">`; `aria-current="page"`; trigger is a real `<button>` with `aria-expanded`/`aria-controls`; focus returns to the trigger on close; sticky header must not obscure a focused element |
| **Performance** | Reveal-on-scroll-up via a passive listener or observer. **The menu works without JavaScript** — a `details`/`summary` or checkbox-driven disclosure enhanced by an island, not created by one |
| **Allowed variants** | Full · Condensed |
| **Forbidden variants** | Mega-menu · dropdowns (every primary item is a real page; a dropdown would imply a hierarchy the IA does not have) · permanently sticky · a search field in v1 · a follower count · a "book a call" widget |

---

## CMP-07 · Primary Navigation

| | |
|---|---|
| **Purpose** | Five destinations, content first, commerce last |
| **Content model** | `Reviews · Method · Journal · Work · About` + Collaborate CTA |
| **States** | Default · Current section · Focus · Hover · **Item removed** (when a section has no content in this locale) |
| **Desktop** | Horizontal, `ui.sm`, `text.secondary`; current item indicated by **weight change and a rule beneath**, not by colour alone |
| **Mobile** | Full-screen overlay; items in the **lower two-thirds**, within thumb reach; ≥44px targets, primary items comfortably larger |
| **RTL** | Flows right to left; tab order follows visual order |
| **Accessibility** | Focus trapped while the overlay is open; `Escape` closes; body scroll locked and position restored; opens and closes without layout shift |
| **Performance** | ≤15KB total header JS |
| **Allowed variants** | Header · Overlay · Footer (different grouping) |
| **Forbidden variants** | A sixth primary item · Brands promoted to primary (2 of 5 brands fail the gate) · icons instead of words · a hamburger on desktop |

---

## CMP-08 · Locale Switcher

*The one navigation element with real logic behind it.*

| | |
|---|---|
| **Purpose** | Move between authoring languages without ever dead-ending |
| **Content model** | `site.i18n.locales[].labelNative` + the current record's `locales` keys |
| **Required** | Both labels, each **in its own script** — `English / العربية` |
| **States** | **(1)** Counterpart exists → link directly to it · **(2)** No counterpart → link to the **section index** in the target locale, with a visible explanation (see CMP-09) · **(3)** Nothing in that section in the target locale → link to the target-locale home |
| **Desktop** | In the header, inline-end |
| **Mobile** | Inside the menu overlay |
| **RTL** | Mirrors |
| **Accessibility** | Links carry **`hreflang` and `lang`**, so a screen reader announces "العربية" in Arabic rather than mispronouncing it in English |
| **Performance** | A plain link. **No page-transition animation on a language change** — a locale change is navigation to a different document, and dressing it as a transformation implies the two are one content in two skins |
| **Allowed variants** | Header · Menu · Footer |
| **Forbidden variants** | **A flag** (flags are countries; Arabic is spoken across dozens) · a dropdown for two options · a disabled state · auto-switching by IP · a modal asking the user to choose |

---

## CMP-09 · Language Availability Indicator

*The UX that makes "no route, no stub, no machine translation" survivable.*

| | |
|---|---|
| **Purpose** | Explain, once and quietly, why the switcher landed the reader on an index instead of an article |
| **Content model** | A real localised string in both locales — **not a template literal** |
| **Required** | The explanation sentence |
| **States** | Present (arrived via a switcher fallback) · Absent (normal index visit) |
| **Desktop / Mobile** | Sits **above the listing and inside the page flow**, at `body.sm` in `text.secondary`, with a hairline beneath. *"This review is not available in Arabic. Here are the reviews that are."* |
| **RTL** | Mirrors |
| **Accessibility** | Plain text in the document flow. **Not an alert, not a live region, not a toast** — nothing has gone wrong |
| **Performance** | Zero cost |
| **Allowed variants** | Reviews index · Journal index · Work index |
| **Forbidden variants** | A banner · a warning colour · a dismissible notice · a modal · **"translation coming soon"** · an offer to read the other language's version · a machine-translation link |

---

## CMP-10 · Breadcrumb

| | |
|---|---|
| **Purpose** | Position in the hierarchy, and the second exit upward |
| **Content model** | Derived from the route path — so `BreadcrumbList` markup needs no separate hierarchy definition |
| **Required** | Home + section + current |
| **States** | Full · Truncated middle (mobile) |
| **Desktop** | `ui.sm` muted, ` / ` separated |
| **Mobile** | Middle segment truncates. **Never wraps to two lines** |
| **RTL** | Mirrors. **Chevron separators mirror; a middle-dot separator does not** |
| **Accessibility** | `<nav aria-label="Breadcrumb">` + ordered list; the current page is the last item and is **not a link** |
| **Performance** | Zero cost |
| **Allowed variants** | One, everywhere except home |
| **Forbidden variants** | **Naming a page that does not exist** — no category segment until category routes are built, and no journal category until it passes its gate |

---

## CMP-11 · Footer

| | |
|---|---|
| **Purpose** | Site-wide reachability and the trust surface |
| **Content model** | `site.navigation.footer[]` (Content · Professional · **Standards**) + `person.bios.homepageIntro` + verified social profiles |
| **Required** | Three groups, wordmark, copyright, switcher |
| **Optional** | Social row — renders **only** profiles with `sameAsEligible: true` |
| **States** | With social · **Without social (current state — none is verified)** |
| **Desktop** | Three columns |
| **Mobile** | Stacked |
| **RTL** | Mirrors |
| **Accessibility** | `<footer>` landmark; `<nav>` with an accessible name distinct from the primary nav |
| **Performance** | Zero JS |
| **Allowed variants** | One |
| **Forbidden variants** | A greyed-out social icon · a placeholder handle · a follower count · a newsletter form (not modelled) · social platform logos in the body of the site |

**"How I test" rather than "Method" in the footer**: the footer is where a hesitant reader looks, and
the plainer phrasing converts better than the label.

---

## CMP-12 · Skip Link

| | |
|---|---|
| **Purpose** | Let a keyboard user reach the content without traversing the header |
| **Required** | One, to `<main>` |
| **States** | Hidden · **Visible on focus** |
| **Desktop / Mobile** | Top inline-start, `z.skipLink` — always on top |
| **RTL** | Inline-start |
| **Accessibility** | **First in tab order.** Focus target must be programmatically focusable |
| **Performance** | Zero cost. Two elements and no JavaScript |
| **Forbidden variants** | Permanently invisible · a `display: none` implementation · placed after the nav |

---

# TIER 2 — CONTENT ENTITY COMPONENTS

## CMP-13 · Review Metadata

| | |
|---|---|
| **Purpose** | Identify the subject and its provenance |
| **Content model** | `entity.{category, productType}` + product name + brand + `dates.{publishedAt, updatedAt}` |
| **Required** | Category, product type, brand, published date |
| **Optional** | Updated date (shown when it differs) |
| **States** | Brand linked (gate passes) · **Brand plain text or filtered-index link (gate fails)** |
| **Desktop** | One line, ` · ` separated, `label.sm` tracked uppercase (Latin) |
| **Mobile** | Wraps to two lines |
| **RTL** | Not tracked, one weight lighter, size ×1.12. Brand and product names Latin and `<bdi>`-isolated |
| **Accessibility** | Not a heading. `<time datetime>` on dates. Latin runs carry `lang` |
| **Performance** | Zero cost |
| **Allowed variants** | Review header · Index entry · Related item |
| **Forbidden variants** | Pills · chips · coloured category tags · **a link to a gated brand page** |

---

## CMP-14 · Testing Summary Strip

| | |
|---|---|
| **Purpose** | Prove in two seconds that this is a record |
| **Content model** | `testing.{wearWindow, timesTested, shadeUsed, baselinePhotographed}` |
| **Required** | Wear window, times tested |
| **Optional** | Shade (`null` → **cell removed**, strip becomes three values), baseline |
| **States** | 4 values · 3 values · 2 values. **Never a value rendered as "unknown"** |
| **Desktop** | Four across, hairline above and below, record density |
| **Mobile** | 2×2, then stacked below 375 |
| **RTL** | Labels in Plex Sans Arabic; numerals mono, isolated `dir="ltr"` |
| **Accessibility** | A `<dl>` — four labelled values are not tabular data |
| **Performance** | Zero cost |
| **Forbidden variants** | KPI tiles · stat cards · icons beside values · animated counters · a fifth "score" value |

---

## CMP-15 · Method Stage

| | |
|---|---|
| **Purpose** | Describe one stage and, at equal weight, its limit |
| **Content model** | `method.stages[]` — `key`, `name`, `purpose`, `observes[]`, `evidence[]`, **`doesNotProve`** |
| **Required** | **All six fields.** `doesNotProve` is a required field, not an optional caveat |
| **States** | Full (on `/method/`) · Marker only (on a review) · With or without example reviews |
| **Desktop** | Number in the margin index; five blocks in fixed order; `purpose` and `doesNotProve` **identical in family, size, colour and column width** |
| **Mobile** | Number as an inline marker row; blocks stack; equal weight preserved |
| **RTL** | Names localised, keys internal; numerals isolated |
| **Accessibility** | `h2` name, `h3` sub-blocks; the stage sequence is an **ordered list**; numbers are real text, not CSS counters |
| **Performance** | Zero JS |
| **Allowed variants** | Full stage · Stage marker · Homepage one-liner |
| **Forbidden variants** | **`doesNotProve` smaller, lighter, or inside `<details>`** · an icon per stage · a circular or infographic sequence · a seal or badge · a completion percentage · the words *clinical / validated / certified / proven / scientific* |

---

## CMP-16 · Method Boundary

| | |
|---|---|
| **Purpose** | Deny clinical authority, before the reader invests in the stages |
| **Content model** | `method.boundaryStatement` (must contain an explicit denial of clinical testing — validator-enforced) + `whatThisCannotTell[]` (minimum 3) |
| **Required** | Both |
| **States** | Full (Method page) · One sentence (homepage Method well) |
| **Desktop** | `ground.raised` with paper grain — **the same surface treatment as the disclosure band**, deliberately: both are statements about the limits of authority. Placed **above** the stages |
| **Mobile** | Full-bleed, 20px padding, **never truncated** |
| **RTL** | The most important Arabic passage after the disclosure statements; flagged for native-reader review |
| **Accessibility** | A `<section>` with an accessible name. **Never a `<details>`** — the limits must not be collapsible |
| **Performance** | Zero cost |
| **Forbidden variants** | Positioned below the stages · in a footer · as small print · behind a toggle · as a legal-looking box |

---

## CMP-17 · Method Stage Markers *(review page)*

| | |
|---|---|
| **Purpose** | Show which stages this test ran — **including the ones it did not** |
| **Content model** | `method.stageOrder` × `review.testing.methodStageKeys` |
| **Required** | All stages in `stageOrder`, each marked applied or not |
| **States** | Applied (**filled** mineral square) · Not applied (**hollow** square, `text.muted`) |
| **Desktop** | One or two rows; each links to `/method/#{stage}`. **The most-repeated internal link on the site** |
| **Mobile** | Vertical list |
| **RTL** | Mirrors |
| **Accessibility** | The distinction is **shape, not colour**. Each item's accessible name states the status in words — *"Comparison: not applied in this test"* |
| **Performance** | Zero cost. Markers may fade in with a 60ms stagger, once |
| **Forbidden variants** | Hiding unapplied stages · a progress bar · "4 of 6" as a fraction · a completion ring · ticks and crosses |

---

## CMP-18 · Review Navigation

| | |
|---|---|
| **Purpose** | Move between reviews without returning to the index |
| **Content model** | `related.reviewIds` (curated) with a recency fallback |
| **Required** | 2 related reviews |
| **States** | Two · One (locale filtering removed one) · Zero (block removed) |
| **Desktop** | Part of the Related Content block, three-up |
| **Mobile** | Stacked or edge-scroll |
| **RTL** | Mirrors; edge-scroll starts at the right |
| **Accessibility** | Each item one link with a complete accessible name |
| **Performance** | Zero JS |
| **Allowed variants** | Related reviews · Comparison product's review · Next/previous in a series |
| **Forbidden variants** | A sticky next/previous bar · infinite scroll · a carousel with dots · **a related link that crosses locales silently** |

---

## CMP-19 · Product Context

| | |
|---|---|
| **Purpose** | Carry product facts and the brand's own language, structurally separated from observations |
| **Content model** | `product` — `name`, `shadeCount`, `sizeMl`, `priceTier`, `officialUrl`, and **`brandClaims[]`** |
| **Required** | Name, category, product type |
| **Optional** | Everything else — each renders only if present |
| **States** | Full spec · Partial spec · No claims (claim block removed) · No official URL (no link, **no placeholder**) |
| **Desktop** | Specs in record density; claims in the CLAIM voice with the dotted rule. **Placed after the verdict** — the brand's language is the last thing on the page |
| **Mobile** | Specs become label/value rows |
| **RTL** | Product name Latin and isolated; claim label never tracked |
| **Accessibility** | Claims as `<blockquote>` with visible attribution. External link carries an accessible name saying it leaves the site |
| **Performance** | Zero cost |
| **Notes** | **Products have no route.** `routingPolicy.hasStandaloneRoute: false`. Promotion trigger and URL shape are defined but no product qualifies |
| **Forbidden variants** | A product page · `Product` schema at page level · `offers` · `AggregateRating` · a price with a currency implying she sells it · a buy button · an affiliate widget |

---

## CMP-20 · Brand Context

| | |
|---|---|
| **Purpose** | Name the house, and link to it **only where a page legitimately exists** |
| **Content model** | `brand` — `name`, `logo`, `positioning`, `description`, `relationship{type,status}`, `indexGate` |
| **Required** | Name |
| **Optional** | Logo, relationship — **relationship renders only on `_verification: CONFIRMED`** |
| **States** | **Linked** (gate passes in this locale) · **Plain text or filtered-index link** (gate fails) · Relationship shown · Relationship absent |
| **Desktop** | Inline on a review; a full block on the brand page with a restrained accent tint — **never a brand takeover** |
| **Mobile** | Stacked |
| **RTL** | Brand names stay Latin, isolated. Gating is evaluated **per locale** — Veloura and Terra Sana are gated in Arabic |
| **Accessibility** | Logo `alt` is the brand name |
| **Performance** | Logo lazy |
| **Forbidden variants** | **A link to a gated brand page** (R-14, the most likely broken link in the architecture) · a logo wall · a partnership badge on an unconfirmed relationship · the brand's palette applied to the page |

---

## CMP-21 · Related Content

| | |
|---|---|
| **Purpose** | The exits. Article ends, navigation begins |
| **Content model** | `related.{reviewIds, journalIds, workIds}` + brand, all **locale-filtered before layout** |
| **Required** | At least one group with at least one item, or the whole block is removed |
| **States** | 3 groups · 2 · 1 · 0 (block removed). Within a group: **layout by count** |
| **Desktop** | `ground.raised`, hairline top, three-up, **128px above — the largest gap on the page** |
| **Mobile** | Stacked, or horizontal edge-scroll with visible overflow |
| **RTL** | Mirrors; edge-scroll starts at the right |
| **Accessibility** | `<ul>`; each item one link; focus ring surrounds the whole block, not the image |
| **Performance** | Images lazy with `content-visibility: auto` |
| **Allowed variants** | Review · Journal · Work · Brand |
| **Forbidden variants** | A carousel with dots · auto-advance · an empty cell where locale filtering removed an item · "you might also like" phrasing · a recommendation engine |

---

## CMP-22 · Journal Entry

| | |
|---|---|
| **Purpose** | Represent an article in a listing |
| **Content model** | `journalArticle` — `category`, `type` (Pillar/Supporting), `title`, `subtitle`, `excerpt`, `readingTimeMinutes`, `dates` |
| **Required** | Category, title, excerpt |
| **Optional** | Hero image, reading time |
| **States** | Pillar (wider treatment) · Supporting · With image · Text-only |
| **Desktop** | Index treatment. Category as a **text label**, not a pill |
| **Mobile** | Stacked |
| **RTL** | Mirrors; may be an Arabic-original with no English sibling — **correct, not a gap** |
| **Accessibility** | One link per entry; `<time datetime>` |
| **Performance** | Image lazy or absent |
| **Forbidden variants** | Category pills · author avatars (single-author site) · comment counts · share counts · a "trending" marker |

---

## CMP-23 · Work Project

| | |
|---|---|
| **Purpose** | Represent a commissioned project, with its terms |
| **Content model** | `work` — `client`, `campaign`, `year`, `title`, `summary`, `deliverables[]`, `role`, `disclosure`, `results.figures[]`, `relatedReviewIds` |
| **Required** | Client, title, summary, disclosure, deliverables |
| **Optional** | **Results figures — and their absence is a valid, complete state** |
| **States** | With verified results · **Without results (section removed entirely)** · With related independent review · Without |
| **Desktop** | Alternating full-width; deliverables in record density |
| **Mobile** | Stacked; deliverables as label/value rows |
| **RTL** | Client names Latin, isolated. English-only projects produce no Arabic route |
| **Accessibility** | Deliverables as a list or a semantic table |
| **Performance** | Hero eager, gallery lazy |
| **Forbidden variants** | **A results figure without a named written source** (build failure) · rounded or estimated figures · a logo wall · a testimonial without `approvalOnFile` · presenting a paid campaign as a review |

---

## CMP-24 · Person Block

| | |
|---|---|
| **Purpose** | Carry identity at the right length for the surface |
| **Content model** | `person` — **five bios**: `homepageIntro`, `short`, `long`, `editorialByline`, `collaboration` |
| **Required** | The bio appropriate to the surface |
| **States** | Homepage intro (~20 words) · Card summary (~35) · Page bio (~200) · Byline (~40) · Collaboration pitch (~90) |
| **Desktop / Mobile** | Per surface |
| **RTL** | All five exist in both locales |
| **Accessibility** | On `/about/` the name is the `h1`; on the homepage the **statement** is the `h1` and the name is not a heading |
| **Performance** | Text only |
| **Forbidden variants** | **Truncating one bio to serve another surface** — that is what produces the generic voice that makes creator sites feel templated · a follower count anywhere · an "as seen in" strip · award badges · `location` rendered while `_verification` is `MOCK` |

---

## CMP-25 · Index Entry

*The generic listing item — and the reason this inventory has no `Card`.*

| | |
|---|---|
| **Purpose** | Represent any entity in any listing |
| **Content model** | Any of review / journal / work / brand |
| **Required** | A title and a link target |
| **Optional** | Image, disclosure marker, metadata line, excerpt |
| **States** | With image · Text-only (State B) · Featured (wider) |
| **Desktop** | **Image, hairline, type.** No container, no border, no padding box, no shadow, no hover lift. The whole block is the link |
| **Mobile** | Full-width image, large tap area |
| **RTL** | Mirrors |
| **Accessibility** | One focusable link with a complete accessible name; the ring surrounds the whole block |
| **Performance** | Image lazy; hover scales the **image** 1.02 inside a clipped frame so no layout moves |
| **Allowed variants** | Review · Journal · Work · Brand · Featured · Text-only |
| **Forbidden variants** | **A card** · a border · a radius above 0 · a shadow · a hover lift · a "read more" button (the block is already the link) · an excerpt on every variant regardless of need |

---

# TIER 3 — INTERACTION AND STATE

## CMP-26 · Facet Group

| | |
|---|---|
| **Purpose** | Filter the review index via crawlable URLs |
| **Content model** | `entity.category` · `entity.brandId` · `disclosure.primary` |
| **Required** | An "All" state per axis |
| **States** | Inactive · Active · Focus · **No results** |
| **Desktop** | Chips: 2px radius, 1px `line.strong` border, transparent fill. Active = clay border and text **plus a filled mineral square**. 44px tall |
| **Mobile** | Horizontal edge-scroll with visible overflow, starting at the inline start |
| **RTL** | Scrolls from the right |
| **Accessibility** | A group of **links** in a `<nav aria-label="Filter reviews">` with `aria-current` on the active one — not a listbox, not a combobox. Arrow-key navigable within the group |
| **Performance** | ≤10KB. **Works entirely without JS as links**; the client layer only avoids a full navigation |
| **Forbidden variants** | Client-only state (R-15) · a dropdown · count badges · a close × · multi-facet URLs presented as indexable · a "clear filters" button (deselecting is already visible) |

---

## CMP-27 · Contact Form

| | |
|---|---|
| **Purpose** | The primary conversion |
| **Content model** | Name · email · inquiry type · message |
| **Required** | All four |
| **States** | Empty · Filled · Invalid · Submitting · Success · Server error |
| **Desktop** | ~640px single column. Underline-only inputs — 1px `line.strong` bottom border, no box. **Labels always visible above the field** |
| **Mobile** | Full width, 44px targets, correct `inputmode` and `autocomplete` |
| **RTL** | Labels localised; `dir="ltr"` on the email field itself, not on its label |
| **Accessibility** | Every field programmatically labelled; errors as **icon plus text** plus a border change; `aria-describedby`; an error summary at the top on submit with focus moved to it; success is **a page, not a toast**, so it is linkable and announced |
| **Performance** | ≤15KB. **Works without JavaScript** — native POST with server-side validation |
| **Forbidden variants** | Placeholder-as-label · a multi-step wizard · a chat widget · a captcha that blocks keyboard users · inline validation firing before the user has finished typing |

---

## CMP-28 · Empty State

| | |
|---|---|
| **Purpose** | Handle genuine absence without looking unfinished |
| **Content model** | None — an empty state has no content by definition |
| **Required** | Nothing, in most cases |
| **States** | **Silent** (section removed — the default) · **Stated** (one line, only where the reader asked a question, e.g. a filter that matched nothing) |
| **Desktop / Mobile** | One line at `body.md` in `text.secondary`, plus the nearest real alternative |
| **RTL** | Localised real content |
| **Accessibility** | Plain text in the flow. Not a live region unless it results from a user action in the same page |
| **Performance** | Zero cost |
| **Forbidden variants** | **An illustration** · a mascot · an icon · a dashed placeholder box · a ghost card · *"we're still building this"* · *"no items yet"* where absence could simply be silent · a fabricated item to fill a grid |

**Principle: absence is silent.** A section with nothing to show is removed, not rendered empty.

---

## CMP-29 · Partial State

*The normal state for the first year.*

| | |
|---|---|
| **Purpose** | Make a small corpus look curated rather than incomplete |
| **Content model** | Whatever exists, after locale filtering |
| **Required** | **Layout chosen by count, never a grid scaled down** |
| **States** | 1 (full-width editorial, **more** space not less) · 2 (side by side or alternating) · 3 (three-up) · 4–6 (grid) · 7+ (grid + pagination) |
| **Desktop / Mobile** | Per count |
| **RTL** | Identical |
| **Accessibility** | No difference from the full state |
| **Performance** | Fewer items, less weight |
| **Forbidden variants** | **A one-item grid** — the most common way a young site looks unfinished · empty cells · "more coming soon" · a count that draws attention to the smallness ("1 review") |

---

## CMP-30 · Update Log

| | |
|---|---|
| **Purpose** | A dated correction is a trust signal |
| **Content model** | `review.updateLog[]` — `{date, note}` |
| **Required** | Date and note, when present |
| **States** | Present · **Absent (section removed — no "never updated" line)** |
| **Desktop** | Date in mono mineral, note in `body.sm` secondary, hairline above |
| **Mobile** | Stacked |
| **RTL** | Dates formatted per locale; numerals isolated |
| **Accessibility** | `<time datetime>` per entry |
| **Performance** | Zero cost. Static text, no JavaScript |
| **Forbidden variants** | **Behind a toggle** · in a footer · as a tooltip · as a "v2" version badge |

---

## CMP-31 · Search Result *(specified, deferred)*

| | |
|---|---|
| **Purpose** | Represent a match across entity types |
| **Content model** | Any indexed entity + matched-term context |
| **Required** | Entity type label, title, link |
| **States** | Match · No results · Locale-filtered |
| **Desktop / Mobile** | **The index treatment, with an entity-type label** — a search result is a listing item, not a new component family |
| **RTL** | Mirrors |
| **Accessibility** | Results as a list with a count announced in a polite live region |
| **Performance** | Not built in v1. Activation at ~200 reviews |
| **Forbidden variants** | A generic SaaS search UI · faceted search chrome · highlighted-snippet cards · an omnibox in the header in v1 |

Full architecture: `docs/SEARCH_UX.md`.

---

## 2. Controls, specified where they live

There is no `Button` component, because there are three button uses on the entire site and each is
defined at its use site.

| Control | Where | Rule |
|---|---|---|
| **Primary button** | Contact submit · homepage close CTA | Clay fill, `text.onAccent`, 2px radius. **One per page maximum** |
| **Secondary button** | Form cancel, filter reset | 1px `line.strong` border, transparent fill |
| **Text link** | **Everything else, including "read the review"** | Clay, **underline always present**, never removed on hover |
| **Filter chip** | Reviews index only | CMP-26 |

**The default is a text link.** A reading page should not be punctuated with buttons; a link inside
prose is the correct editorial gesture. Buttons appear at conversion points only. Button width
accommodates the longer of the two locale labels.

---

## 3. Component-to-entity coverage

| Content entity | Components that render it |
|---|---|
| `Person` | CMP-24, CMP-11 |
| `Method` | CMP-15, CMP-16, CMP-17 |
| `MethodStage` | CMP-15, CMP-17, CMP-01 |
| `Review` | CMP-01…05, CMP-13, CMP-14, CMP-17, CMP-18, CMP-25, CMP-30 |
| `ReviewObservation` | CMP-03, CMP-01 |
| `ReviewDisclosure` | CMP-04 |
| `Product` | CMP-19, CMP-03 (claims) |
| `Brand` | CMP-20, CMP-25 |
| `Work` | CMP-23, CMP-25, CMP-04 |
| `JournalArticle` | CMP-22, CMP-25 |
| `JournalCategory` | CMP-22 (label), deferred route |
| `SocialProfile` | CMP-11, gated |
| `Testimonial` | **None — hard render gate, none has `approvalOnFile`** |
| `PressItem` | **None — route deferred, highest-risk file** |
| `SiteConfig` | CMP-06, CMP-07, CMP-08, CMP-11 |
| Editorial standards / About / Contact / Legal | CMP-24, CMP-27, plus prose templates |

**Two entities are modelled and deliberately have no component.** That is correct: `Testimonial` and
`PressItem` cannot render until each record is individually verified, and building a component for
them now would create pressure to use it.

---

## 4. What this inventory refuses

| Refused | Why |
|---|---|
| A generic `Card` | §0. The index treatment replaces it everywhere but three documented cases |
| A generic `Badge` | Labels are type. Disclosure is a band with a statement, not a badge |
| A `Modal` | Nothing on this site needs to interrupt. Editorial standards is a page, not a modal |
| A `Tooltip` | **Evidence must be visible.** Hidden content cannot be marked up, indexed, or read aloud reliably |
| An `Accordion` | The observations are the article. The Method's limits are not collapsible |
| A `Tabs` component | Would hide half of a comparison |
| A `Carousel` | Hides items behind interaction and needs JS to read |
| A `Chart` / `Meter` / `ProgressRing` / `Gauge` | **There are no scores.** Visualising a measurement that does not exist is a fabrication with a chart on it |
| A `Rating` / `Stars` | Removed by Phase 1 decision; the validator fails the build on `rating`, `score` or `stars` |
| An icon library | Nine icons ship inline, under 2KB |
| A `Skeleton` loader | Content is server-rendered; there is nothing to skeleton |
| A `Toast` | Success states are pages |
| A `Breadcrumb` that includes a page that does not exist | CMP-10 |
