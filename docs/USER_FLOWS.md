# User Flows

**Status:** Phase 3 decision. Extends `docs/USER_JOURNEYS.md` (Phase 1, four journeys) into eight
UX flows with entry, decision points, failure modes and the specific UX mechanism that carries each
step.

**The distinction from Phase 1.** Journeys describe *who* and *why*. Flows describe *what the
interface does at each step* — which component carries the transition, what the user sees, what
happens when the expected thing is missing, and what the flow costs if it breaks.

**Notation**

```
▸ page          a route
  ├ component   the UX mechanism that carries the step
  └▶ exit       where the user goes next, and from which component
✗ failure       what breaks the flow at this point
```

---

## 0. The one rule that governs every flow

**Every page must exit somewhere specific, and the exit must be visible without scrolling to the
footer.** A page whose only exit is the header is a dead end with navigation attached.

This is inherited from `docs/USER_JOURNEYS.md` ("anti-journey: land on homepage, find nothing to
do") and is checked per template in `docs/UX_ARCHITECTURE.md` §8.

---

## FLOW A — Discover → Review

**The homepage-entry flow.** Lowest volume of the content flows, highest brand impact. Audience A
and C.

```
▸ /{loc}/
  ├ Opening statement          the thesis, not the name
  └▶ scroll (no CTA needed — the visible sliver of section 2 is the affordance)

▸ /{loc}/ §2 Featured review
  ├ Disclosure label + 3 conditions in mono + 1 observation line
  ├ This is the only record-density block above section 3
  └▶ "Read the review" text link → review

▸ /{loc}/reviews/{slug}/
  ├ Disclosure band (above hero, first paint)
  ├ Testing summary strip → the two-second scan
  ├ Conditions well → the differentiator
  ├ Observation sequence → the evidence
  ├ Verdict
  ├ Method stages applied  ─────────────▶ TRUST MOMENT
  └▶ three exits, in priority order:
       1. Method stage marker → /{loc}/method/#{stage}
       2. Related reviews (2)  → another review
       3. Product details → brand

▸ /{loc}/method/
  ├ Six stages, each with doesNotProve at equal weight
  ├ Boundary statement, above the stages
  └▶ Representative reviews (2–4) → back into the corpus

▸ /{loc}/reviews/{slug}/   (second review)
  └▶ Product context → brand, if the gate passes in this locale

▸ /{loc}/brands/{slug}/
  └▶ its other reviews, its work
```

| | |
|---|---|
| **Entry** | Homepage — direct, social bio link, or a name search |
| **Decision point** | Section 2. If the featured review's conditions do not register as *unusual*, the visitor leaves at the homepage |
| **Trust moment** | The Method, reached from a review — never reached cold from navigation |
| **Success** | Two or more reviews in the session, or a Method entrance |
| **UX mechanism that carries it** | The featured-review block's record density. It is the homepage's only proof, and it is why it sits on screen two |
| ✗ **Failure** | A homepage that reads as a portfolio. If section 2 begins below 1.5 viewport heights at 375px, this flow does not start — see `docs/HOMEPAGE_WIREFRAMES.md` §6 |
| **Missing-content behaviour** | No featured review → section 2 falls back to the most recent review, keeping the record density. If there are no reviews at all, the homepage has no proof block and the site should not launch |

---

## FLOW B — Search → Review

**The highest-volume flow and the one the site is built for.** Audience A. Entry is a product-name
query, and the visitor has no idea who Zina is.

```
GOOGLE  "sitara concealer review" / "تجربة كونسيلر ستارة"
   │
   └▶ ▸ /{loc}/reviews/atelier-noor-sitara-luminous-concealer/
        ├ ABOVE FOLD, in DOM order:
        │    breadcrumb · product identity · title · subtitle
        │    DISCLOSURE BAND ← before the hero, before anything persuasive
        │    hero
        ├ FIRST SCROLL:
        │    testing summary strip (4 values, two-second scan)
        │    introduction
        ├ SECOND SCROLL:
        │    conditions well  ─────────▶ THE DIFFERENTIATOR LANDS HERE
        │    method stages applied
        │    observation sequence
        └▶ exits:
             1. /{loc}/method/            ← TRUST MOMENT
             2. related review            ← session depth
             3. brand or product context
```

| | |
|---|---|
| **Entry** | A review page, cold, from an external referrer |
| **Decision point** | The conditions well. It is the first thing on the page no competitor has, and it arrives on the second scroll |
| **What the visitor must learn in 15 seconds** | (a) this is a review of the exact product they searched, (b) it was actually tested, (c) whether money was involved |
| **UX mechanism** | Disclosure band above the hero answers (c) before the image can flatter; the summary strip answers (b) in two seconds; the title answers (a) |
| **Success** | A Method entrance, or a second review |
| ✗ **Failure** | The page reads as an opinion post. Phase 1: *"if a reader cannot see what was measured within one screen, the journey ends at the first page"* |
| **Performance dependency** | This flow is entered cold on a throttled mobile connection. LCP < 2.0s and a disclosure band present at first paint are flow requirements, not engineering preferences |
| **Missing-content behaviour** | No evidence plates → plates section removed, observation sequence carries the page. No comparison → hollow mineral square on the `comparison` stage, which is *more* credible than hiding it |

---

## FLOW C — Method-first visitor

**The sceptic.** Arrives from an informational query or from the primary navigation, and is asking
whether structured testing is real or a marketing frame.

```
GOOGLE  "how are beauty products tested" / "كيف تختبر منتجات التجميل"
   or   ▸ /{loc}/ → nav "Method"
   │
   └▶ ▸ /{loc}/method/
        ├ Name + tagline
        ├ Introduction — why a fixed method exists
        ├ ⚠ BOUNDARY STATEMENT — above the stages, not below them
        │    "structured personal testing, not clinical testing"
        ├ Six stages, in order. For each:
        │    purpose · observes[] · evidence[] · doesNotProve
        │    doesNotProve is at the SAME visual weight as purpose
        ├ What this cannot tell you (5 entries)
        └▶ exits:
             1. Representative reviews (2–4) — "the stage, applied"
             2. /{loc}/editorial-standards/
             3. Individual stage → the reviews that used it

▸ /{loc}/reviews/{slug}/
   ├ arrives already trusting the frame
   └ reads the evidence and the verdict as the payoff of the stages
```

| | |
|---|---|
| **Entry** | `/method/` — the only Tier 1 page that is also a traffic page |
| **Decision point** | The `doesNotProve` fields. A sceptic converts on the *limits*, not on the claims |
| **UX mechanism** | Equal visual weight between `purpose` and `doesNotProve`. The moment `doesNotProve` becomes small print, this flow inverts and the page reads as marketing that anticipated the objection |
| **Success** | A review entrance from a stage |
| ✗ **Failure** | The Method reads as a credential. No seal, no badge, no "validated" — `docs/METHOD_UX.md` §7 |
| **Mock-method constraint** | This flow is the one where a PROJECT MOCK METHOD would do the most damage if presented as a VERIFIED ZINA METHOD. See `docs/METHOD_UX.md` §2 |

---

## FLOW D — Product-first / brand-first visitor

**Arrives knowing the house, not the product.** Audience A, and the flow most affected by the brand
index gate.

```
GOOGLE  "atelier noor review" / "مراجعة أتيليه نور"
   │
   ├─ gate PASSES in this locale ──▶ ▸ /{loc}/brands/atelier-noor/
   │                                   ├ identity · positioning · description
   │                                   ├ relationship — ONLY if CONFIRMED, else absent entirely
   │                                   ├ reviews of this brand (locale-filtered)
   │                                   ├ products tested (inline, no route)
   │                                   ├ related work, with disclosure
   │                                   └▶ a review
   │
   └─ gate FAILS in this locale ───▶ the brand page does not exist.
                                      The query lands on a review instead, and the brand name on
                                      that review is plain text or links to
                                      /{loc}/reviews/?brand={slug}
                                      ✓ The visitor never learns a page was withheld

▸ /{loc}/reviews/{slug}/
  └▶ /{loc}/method/ → the flow becomes FLOW B
```

| | |
|---|---|
| **Entry** | Brand page (gate passing) or a review (gate failing) |
| **Decision point** | Whether the brand page aggregates something a single review cannot. If it is a description plus one link, it should not exist — which is what the gate enforces |
| **UX mechanism** | The **Language / Availability–aware brand link**: every brand link is a function of the gate evaluated at build time in the current locale. No template may assume the page exists |
| ✗ **Failure** | R-14 — a template links to a gated brand page. The most likely broken internal link in the architecture |
| **Partial state** | Brand with one review → single-column editorial treatment, *more* space not less, with the related case study given equal prominence. Never a three-up grid missing two cells |
| **Product note** | Products have **no route**. A product-name query lands on its review. This is deliberate — see `docs/PRODUCT_ENTITY_STRATEGY.md` |

---

## FLOW E — Journal-first visitor

**The most defensible acquisition flow and the one that scales.** Entry is a problem, not a product.

```
GOOGLE  "why does my foundation break down" / "ليش يطلع الميكب من وجهي"
   │
   └▶ ▸ /{loc}/journal/how-to-evaluate-foundation-performance/
        ├ category + type label (Pillar / Supporting)
        ├ title · byline · dates · reading time
        ├ hero
        ├ opening paragraph
        ├ table of contents — only when 4+ sections
        ├ body sections
        │    └ CONTEXTUAL LINK, inside the prose, at the sentence that makes the claim:
        │         "…most bases end the day one step shinier"  → the review that photographed it
        ├ method stage link (related.methodStageKeys)
        └▶ exits:
             1. the review that evidences the claim  ← the valuable one
             2. related articles (2)
             3. /{loc}/method/#{stage}

▸ /{loc}/reviews/{slug}/     → flow becomes FLOW B from the second screen onward
   └▶ /{loc}/method/
```

| | |
|---|---|
| **Entry** | A journal article |
| **Decision point** | The contextual in-prose link. A related-articles block at the foot of the page does not carry this flow — the reader must be handed the evidence at the moment the claim is made |
| **UX mechanism** | In-prose review links are **not** decorated as cards or buttons. They are text links with the clay underline, and the anchor text names the finding, not the product |
| **Success** | Journal → review click. Phase 1 names this as a leading indicator |
| ✗ **Failure** | An article that asserts without citing. It then competes with every other beauty blog on the same query and has nothing they do not |
| **Arabic note** | The highest-value Arabic articles will have **no English counterpart** (`mufradat-darajat-albashara`). This flow is where Arabic content independence pays off |

---

## FLOW F — Arabic visitor

**Not a translated version of another flow.** Arabic is an authoring language, and this flow exists
to make its differences explicit.

```
ENTRY   Arabic search · Instagram/TikTok bio · direct
   │
   ├─ lands on /  ──▶ 302 by Accept-Language → /ar/    (never 301, never IP-based)
   └─ lands on /ar/... directly

▸ /ar/  (dir=rtl, lang=ar)
  ├ Whole grid mirrored via logical properties — index right, air left
  ├ Type at ×1.12 size, ×1.18 leading. The Arabic page is LONGER. This is correct
  ├ Header laid out to the wider measured label set (see PHASE_3_BILINGUAL_TYPE_PROOF §4)
  ├ Switcher reads  English / العربية  — each in its own script, never a flag
  └▶ ▸ /ar/reviews/

▸ /ar/reviews/
  ├ Lists ONLY records with Arabic content — five, not six with one broken
  ├ Facets are crawlable RTL URLs
  └▶ ▸ /ar/reviews/{slug}/

▸ /ar/reviews/{slug}/
  ├ Margin index on the RIGHT
  ├ Observation rule, claim indent, plate caption rule all inline-start
  ├ Latin identifiers bidi-isolated:  <bdi lang="en">22W Amber Warm</bdi>
  ├ Numeric runs isolated separately:  <bdi dir="ltr">34–38</bdi> °م
  │    ⚠ NOT <bdi>34–38 °م</bdi> — measured defect, see the type proof §5
  ├ Conditions well: label column at inline start, numerals form an aligned column
  └▶ ▸ /ar/method/  → ▸ /ar/journal/  (Arabic-original content included)
```

| | |
|---|---|
| **Entry** | Any Arabic route |
| **Decision point** | Whether the page reads as Arabic or as a rendering of English. Criterion 10, **UNVERIFIED** |
| **UX mechanism** | Logical properties throughout; per-locale authored slugs; Arabic-original journal content with no English sibling |
| ✗ **Failure** | Arabic treated as secondary — `docs/DESIGN_ANTI_PATTERNS.md` §22, *"the failure this project is most exposed to, because it is invisible to a non-Arabic-reading team"* |
| **Tab order** | Follows visual order in RTL. An RTL page that tabs left-to-right is a defect, not a preference |
| **Screen reader** | `lang` on every Latin run so `Voile Lumière` is announced in French/English phonetics, not spelled out in Arabic |

---

## FLOW G — English visitor

Structurally identical to Flow F, mirrored, with three real differences rather than cosmetic ones.

```
▸ /en/  ─▶ /en/reviews/ ─▶ /en/reviews/{slug}/ ─▶ /en/method/ ─▶ /en/journal/
```

| Difference from Flow F | Why |
|---|---|
| **`/en/work/` is the deeper section** | Phase 1: brand and agency correspondence in the region is often conducted in English. Work is 4 projects in English, 3 in Arabic |
| **`x-default` points here** | A crawler that ignores the root 302 has a defined entry |
| **Type at base scale, no size factor** | ×1.12 and ×1.18 apply at the Arabic locale root only |
| **Metadata may use tracked uppercase** | A Latin-only device. Arabic reaches the same volume by other means |

Everything else — section order, component behaviour, exits, empty states — is identical. **The
English flow is not the reference implementation that Arabic derives from.** Both derive from the
same UX architecture.

---

## FLOW H — Missing translation

**The flow most sites get wrong**, and the one Phase 1 constrained hardest.

**The rule that cannot be violated:** missing translation means **no route, no hreflang, no stub, no
machine translation**.

### H-1 — The switcher, from a page with no counterpart

```
▸ /en/reviews/veloura-velvet-hour-lip-cream/       (English-only in the mock set)
  ├ Language switcher shows:  العربية
  ├ It is NOT disabled, NOT hidden, NOT a dead link
  └▶ click
       │
       ▸ /ar/reviews/                                ← the SECTION INDEX, not a 404
         ├ At the top of the index, above the listing, one line of real content:
         │    "هذه المراجعة غير متوفرة بالعربية. هذه هي المراجعات المتوفرة."
         ├ The line is content in both locales, not a template literal
         ├ It is NOT an error state, NOT a banner, NOT dismissible
         └ The listing below is a normal, complete index
```

**UX detail that matters:** the explanation sits **above the listing and inside the page flow**, at
`body.sm` in `text.secondary`, with a hairline beneath. It is not a toast, not an alert, not
coloured as a warning. Nothing has gone wrong — a page simply does not exist in that language.

### H-2 — Direct entry to a URL that does not exist in that locale

```
▸ /ar/reviews/veloura-velvet-hour-lip-cream/   →  404
  ▸ /ar/404/    (noindex)
    ├ Plain statement, no apology, no illustration
    ├ Three most recent Arabic reviews
    └▶ /ar/reviews/
```

The 404 is **not** told that an English version exists. Offering "read it in English instead" would
be a machine-translation gesture wearing a link, and it undermines the principle that a locale is an
authoring language.

> **Considered and rejected.** Linking the 404 to the English counterpart. Rejected because it
> reintroduces exactly the "the real site is English, Arabic is a subset" framing the architecture
> refuses, and because a reader who wanted English would already be there. Recorded as **D3-6**.

### H-3 — Related content across a language boundary

```
Review in /ar/  with related.reviewIds → [ ar-existing, en-only ]
  └ The related block renders ONE item, not two with one broken
    └ Layout is chosen by COUNT (docs/EMPTY_PARTIAL_UX.md §3):
        1 item → full-width editorial treatment, not a 3-up grid with 2 empty cells
```

A related link **never crosses languages silently**. If filtering leaves fewer than two items, the
block shows what exists at the layout that count deserves.

### H-4 — Index pages

`/ar/reviews/` lists five reviews. `/en/reviews/` lists five. The corpus is six. Neither index
mentions the other's extra item, and neither shows a gap.

### H-5 — What the user is never shown

| Never | Because |
|---|---|
| A stub page | It would be indexed as thin content and would claim an equivalence that does not exist |
| "Translation coming soon" | A promise the publishing schedule cannot keep, and an admission of incompleteness on a premium property |
| A machine translation, even behind a banner | Explicitly forbidden by Phase 1 |
| A disabled or greyed-out switcher | The switcher always goes somewhere real |
| A modal asking which language they prefer | Language is negotiated once at `/`, then by cookie |

---

## Cross-flow observations

### Every flow passes through the Method

Flows A, B, C, D, E, F and G all reach `/method/`, and it is the trust moment in every one. This is
why it holds a primary navigation slot and why every review links to it. **If one page must be
excellent, it is this one** — unchanged from Phase 1, and now also true of the UX.

### The disclosure band is load-bearing in three flows

In Flow B it answers "is this an advert" before the hero renders. In Flow D it is what makes a brand
page credible. In Flow A it is what makes the homepage's proof block a proof rather than a promo.
It must be present at **first paint** in all three — which is why it carries no animation and no
disclosure state is ever collapsed behind a toggle.

### Flow B and Flow E converge; Flow C inverts

B and E both end at a review then the Method. C runs the other way — Method, then review — and is
the only flow where the evidence is read as *confirmation* rather than as *discovery*. The review
page must work in both readings, which is why its section order is fixed and never re-ordered by
entry point.

### The flows that do not exist, deliberately

| Not built | Why |
|---|---|
| Product page → review | Products have no route (`docs/PRODUCT_ENTITY_STRATEGY.md`) |
| Category landing → review | `/reviews/{category}/` is gated at 5 reviews per category per locale; none qualifies |
| Journal category → article | Gated at 3 articles per category per locale; none qualifies |
| Search → result → review | Search is not built in v1. Architecture in `docs/SEARCH_UX.md`, activation at ~200 reviews |
| Newsletter signup | Not modelled (Phase 1 Q-7). No entity, no consent surface |
| Press page → review | Route deferred; `press.json` is the highest-risk file in the project |

Each is a route that exists in the architecture and is switched off by a data threshold. None
requires an IA change to activate.

---

## Instrumentation

Per `docs/ANALYTICS_AND_MEASUREMENT.md`, measure the flow, not the pageview.

| Flow | Leading indicator | Diagnostic if low |
|---|---|---|
| A | Homepage → featured review click rate | Section 2 is too far down, or the conditions are not legible as unusual |
| **B** | **Review → Method click rate** | **The single most diagnostic number on the site.** Low means the positioning is not landing, or the stage markers are not visible enough |
| C | Method → review click rate | The representative reviews are too far below the stages |
| D | Brand → review click rate; gated-brand link errors (should be zero) | A non-zero error count is R-14 occurring |
| E | Journal → review click rate | Contextual links are missing from prose |
| F/G | Switcher use; 404 rate on locale-suffixed URLs | A high switcher-to-index rate means translation coverage is the bottleneck |
| H | `/ar/reviews/` entrances carrying the fallback message | Tells you which content to translate next — a genuinely useful signal, not an error metric |
