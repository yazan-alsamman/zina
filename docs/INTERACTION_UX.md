# Interaction UX

**Status:** Phase 3 decision. Applies the Phase 2 motion vocabulary
(`docs/MOTION_ART_DIRECTION.md`) to every interaction in the system.

**The vocabulary is closed: settle · sequence · decode · attend · reveal.** No new pattern is
introduced in Phase 3. Anything not on that list needs a documented reason to exist, and nothing in
this phase produced one.

**The governing rule: no interaction may be required to understand content.**

---

## 1. The five patterns

| # | Pattern | What it does | Duration | Where |
|---|---|---|---|---|
| 1 | **Settle** | Fade + 12px rise, once | 400ms | Page titles, verdict |
| 2 | **Sequence** | Settle with a stagger | 300ms, 60–80ms apart | Observations, method stages, conditions rows |
| 3 | **Decode** | Fade on image load | 200ms | All lazy images |
| 4 | **Attend** | Colour / underline shift | 150ms | Links, buttons, chips, index entries |
| 5 | **Reveal** | Surface appears | 250ms | Mobile menu |

**Easing:** `standard` `cubic-bezier(0.2,0,0,1)` for things arriving · `exit`
`cubic-bezier(0.4,0,1,1)` for things leaving · `attend` `cubic-bezier(0.4,0,0.2,1)` for hover.

**No spring, no bounce, no overshoot, no elastic. Nothing above 600ms.** Everything decelerates into
place as though it has weight.

---

## 2. Every interaction in the system

Each row: **trigger · purpose · motion · duration · reduced-motion alternative.**

### Reading surfaces

| Interaction | Trigger | Purpose | Motion | Duration | Reduced motion |
|---|---|---|---|---|---|
| Page title entrance | Page load | Signal the document has settled | **Settle**, 12px rise | 400ms, once | **Present immediately.** Nothing lost |
| Observation sequence | Scroll into view, 15% threshold | Mirror what the content *is* — things that happened in order | **Sequence**, 8px rise, 80ms stagger, capped at 8 items | 300ms each | Present immediately |
| Observation rule draw | Sequence enters | The mineral rule scales from the inline start | 300ms | 300ms | **Removed.** The rule is simply drawn |
| Method stage entrance | Scroll into view | Same | **Sequence**, 60ms stagger | 300ms | Present |
| Conditions rows | Scroll into view | Same | **Sequence**, 60ms stagger | 300ms | Present |
| Verdict entrance | Scroll into view | Mark the conclusion arriving | **Settle** | 400ms, once | Present |
| Lazy image load | Decode | Avoid a hard pop | **Decode**, opacity only | 200ms | **Retained** — it is a load artefact, not motion |
| Evidence plate | — | — | **Decode only. Never scale, pan, parallax or reveal** | 200ms | Retained |
| Hero image | — | It is the LCP | **None** | — | — |
| Disclosure band | — | Must be readable at first paint | **None** | — | — |

**"Once" is a rule.** Elements do not re-animate when scrolled back into view. Re-triggering on a
reading page is actively annoying and signals decoration.

**Nothing above the fold animates in.** No preloader, no curtain, no staged reveal. The first paint
is the finished page.

### Links and controls

| Interaction | Trigger | Purpose | Motion | Duration | Reduced motion |
|---|---|---|---|---|---|
| Text link hover | Pointer | Affordance | **Attend** — colour to `clay.hover`. **The underline is present by default and is never removed** | 150ms | Colour changes instantly |
| Nav link hover | Pointer | Affordance | Underline draws from the inline start | 150ms | Underline appears instantly |
| Primary button hover | Pointer | Affordance | Background `clay` → `clay.hover`. **No lift, no shadow, no scale** | 150ms | Instant |
| Filter chip hover / active | Pointer / navigation | State | Border and text colour | 150ms | Instant |
| Form input focus | Focus | State | Border `line.strong` → `clay` | 150ms | Instant |
| **Focus ring** | `:focus-visible` | **Wayfinding** | **Appears instantly. Never eased in** | **100ms** | **Unchanged — focus stays instant** |
| Form error | Validation | Correction | **None. Appears instantly** | — | — |
| Index entry hover | Pointer | Attention shift | **Image** scales 1.0 → 1.02 inside a clipped frame. The container does not move | 400ms | **Removed** |
| Disclosure band | — | — | **No interaction at all.** Not expandable, not dismissible | — | — |

### Navigation

| Interaction | Trigger | Purpose | Motion | Duration | Reduced motion |
|---|---|---|---|---|---|
| Header hide | Scroll down | Reclaim reading space | Translate out, `exit` easing | 250ms | **Position retained, animation removed** |
| Header reveal | Scroll up | Return the controls | Translate in, `standard` | 250ms | Instant |
| Mobile menu open | Tap the trigger | Reveal navigation | **Reveal** — overlay fades; items settle with a 40ms stagger | 250ms | Overlay simply present |
| Mobile menu close | Tap ×, `Escape`, or a link | — | Fade out, **no stagger — leaving is faster than arriving** | 150ms | Instant |
| Locale switch | Tap | Change document | **None.** Colour shift on hover only | 150ms | Instant |
| Anchor jump (Method stages) | Click | Move to a stage | Smooth scroll | Browser default | **Instant jump** |
| Facet selection | Click | Filter | **Full navigation, or a client-side swap with no transition** | — | — |

**The locale switch must not animate the page transition.** A locale change is navigation to a
different document; dressing it as a transformation implies the two are the same content in two
skins, which is precisely the framing the multilingual architecture rejects.

---

## 3. Interactions that were considered and rejected

| Proposed | Why it was rejected |
|---|---|
| Lightbox on evidence plates | The plate is already at full editorial scale and the caption carries the information. A lightbox adds JS, a focus trap and a keyboard contract to a static record |
| Before/after slider on comparison plates | **Hides half the evidence at any moment** and is unusable by keyboard. Side-by-side plates show both frames at once |
| Sticky margin index | It is **marginalia, not a control**. Making it sticky turns a record into a navigation rail |
| Sticky next/previous review bar | A control on a reading page, and "next" implies a sequence reviews do not have |
| Reading-progress indicator | The scrollbar already does this |
| Collapsible observations | **The observations are the article** |
| Collapsible `doesNotProve` | The limits are the argument |
| Expandable disclosure statement | The one thing that must never be truncated |
| Tabs on strengths / limitations | Would hide half of a balanced assessment, and code limitations as secondary |
| Type-ahead search | Search is not in v1; and when it ships, results are a URL |
| Page transitions (Astro view transitions) | **Deferred.** The primary journey is search → review → related review, each a fresh entry from an external referrer where a transition never fires. Revisit in Phase 6 with measurement: cross-fade only, ≤200ms, no shared-element morphing |
| Animated counters | **Nothing counts up.** A number animating from 0 to 38 is a data-visualisation gesture in a system that refuses data visualisation |
| Hover-reveal captions on images | Evidence must be visible; hover is not available on touch |
| Parallax on the hero | Implies depth in a deliberately flat design, and costs continuous compositing on the target device class |

---

## 4. Interaction inventory by component

| Component | Interactive? | If yes |
|---|---|---|
| Margin index | **No** | Static marginalia |
| Plate | **No** | No lightbox, no zoom, no slider |
| Claim | **No** | Static quotation |
| Observation | **No** | Static ordered list |
| Verdict | **No** | Static |
| Disclosure band | **No** | Deliberately inert |
| Conditions well | **No** | Not sortable, not filterable, not collapsible |
| Summary strip | No | |
| Method stage | Links only | To its anchor |
| Method boundary | **No** | Never collapsible |
| Stage markers | Links only | |
| Index entry | One link | Image scale on hover |
| Related content | Links only | |
| Breadcrumb | Links only | |
| Global header | Trigger + links | Menu toggle, reveal on scroll |
| Locale switcher | Links only | |
| Facet group | Links | Arrow-key navigable |
| Contact form | **Yes** | The only substantial form |
| Footer | Links only | |

**Sixteen of nineteen components are non-interactive.** The densest, most valuable content on the
site — the whole evidence layer — requires no interaction and no JavaScript to read.

---

## 5. Reduced motion

`prefers-reduced-motion: reduce` is honoured at the **token level**, so it cannot be forgotten per
component.

```
motion.duration.*          → 0ms   (focus stays instant at 100ms)
all transforms             → removed
all staggers               → 0
scroll-triggered entrance  → content simply present
smooth anchor scroll       → instant jump
hover image scale          → removed
observation rule draw      → removed
sticky header              → RETAINED (position, not animation)
```

**Nothing is lost.** No information, affordance or wayfinding depends on movement, which is why the
reduced-motion experience is not a degraded version of the site but simply a stiller one.

`prefers-reduced-data` additionally drops the paper grain and non-essential decode fades.

---

## 6. Performance constraints on interaction

| Rule | Reason |
|---|---|
| Animate **`opacity` and `transform` only** | Compositor-only. No layout, no paint |
| **Never** animate `width`, `height`, `top`, `left`, `margin` | Layout thrash and CLS risk |
| `IntersectionObserver`, never scroll listeners | Off the main thread |
| **Unobserve after firing** | "Once" is also a performance rule |
| No `backdrop-filter` | Expensive paint on mid-range Android |
| No continuous scroll-linked animation | The main INP risk in "premium" designs |
| `will-change` sparingly, removed after | Layer explosion otherwise |
| **No animation library** | Five patterns need CSS transitions and ~2KB of observer code |
| Settle animates elements **already occupying their final space** | So no entrance animation can move layout — CLS budget 0.05 |

**Motion JavaScript budget: 3KB gzipped**, within the review page's 10KB total. **If a proposed
animation needs a library, the animation is wrong.**

### Interactions that could affect Core Web Vitals

| Interaction | Metric | Mitigation |
|---|---|---|
| Hero image | **LCP** | Eager, preloaded, `fetchpriority="high"`, **no animation, no scrim, no text over it** |
| Font loading | **CLS** | Metric-matched fallbacks via `size-adjust` / `ascent-override`. **The single largest CLS risk in the system** |
| Lazy image decode fade | CLS | Aspect-ratio boxes reserve space before load |
| Scroll-triggered sequences | INP | Observer-based, unobserved after firing, `opacity`/`transform` only |
| Mobile menu open | INP | CSS-driven; the island only manages focus and scroll lock |
| Facet selection | INP | Full navigation by default; the client layer is an enhancement |
| Header reveal on scroll | INP | Passive listener or observer; transform only |
| **Paper grain** | Total weight | One asset ≤4KB on two elements. **The first thing to cut** if the budget is exceeded — never implemented as a full-page overlay |

---

## 7. What interaction must never do

- Gate content. No preloader, no curtain, no "reveal on scroll" leaving content invisible without JS.
- Delay the LCP element.
- Re-trigger on scroll back.
- Hijack the scroll, snap between sections, or apply custom scroll physics.
- **Move an evidence image.** A record that animates is a record you cannot trust.
- Animate a number.
- Bounce, spring or overshoot.
- Run continuously, anywhere.
- Be the reason a component needs JavaScript.
- Communicate information that is not also communicated statically.
- Reveal a disclosure, an observation, a limitation or a `doesNotProve` behind an interaction.
