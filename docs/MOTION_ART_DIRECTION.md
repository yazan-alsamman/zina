# Motion Art Direction

**Status:** Phase 2 decision.

**Motion philosophy: the page is a document that settles, not an experience that performs.**

The test for every animation: *does removing this make the page harder to understand?* If not, it
is decoration and should be cut. By that test, most of what a "premium" site would animate is cut
here.

---

## 1. The motion budget

The entire site uses **five** motion patterns. Not five per page — five in total.

| # | Pattern | Where | Duration |
|---|---|---|---|
| 1 | **Settle** — fade + 12px rise, once | Page titles, verdict | 400ms |
| 2 | **Sequence** — settle with stagger | Observations, method stages, conditions | 300ms, 60–80ms apart |
| 3 | **Decode** — fade on image load | All lazy images | 200ms |
| 4 | **Attend** — colour/underline shift | Links, buttons, cards | 150ms |
| 5 | **Reveal** — menu, language switcher | Mobile menu | 250ms |

Anything not on this list needs a documented reason to exist.

---

## 2. Timing and easing

```
motion.duration.instant    100ms   focus rings, state flips
motion.duration.quick      150ms   hover, links
motion.duration.base       250ms   menu, disclosure
motion.duration.settle     400ms   content entrance
motion.duration.slow       600ms   reserved; currently unused

motion.easing.standard     cubic-bezier(0.2, 0, 0, 1)      decelerate — things arriving
motion.easing.exit         cubic-bezier(0.4, 0, 1, 1)      accelerate — things leaving
motion.easing.attend       cubic-bezier(0.4, 0, 0.2, 1)    symmetric — hover
```

**No spring, no bounce, no overshoot, no elastic.** Overshoot reads as playful; the register is
considered. Everything decelerates into place as though it has weight.

**No duration above 600ms.** A 900ms reveal feels luxurious once and slow every time after.

---

## 3. Entrance

**Content is present in the HTML and visible without JavaScript.** Entrance animation is an
enhancement applied to already-rendered content, never a mechanism that reveals it.

| Element | Behaviour |
|---|---|
| Page title | Settle, 400ms, on load. Once |
| Hero image | **None.** It is the LCP element |
| Disclosure band | **None.** Must be present at first paint |
| Observations | Sequence on scroll into view, 80ms stagger, once |
| Method stages | Sequence, 60ms stagger, once |
| Conditions rows | Sequence, 60ms stagger, once |
| Verdict | Settle, 400ms, on scroll into view |
| Everything else | None |

**"Once" is a rule.** Elements do not re-animate when scrolled back into view. Re-triggering
animation on a reading page is actively annoying and signals decoration.

**Nothing above the fold animates in.** No preloader, no curtain, no staged reveal. The first paint
is the finished page.

---

## 4. Scroll

| Behaviour | Decision |
|---|---|
| Scroll-triggered entrance | **Yes**, once, via `IntersectionObserver`, 15% threshold |
| Parallax | **No.** Not on heroes, not on plates, not anywhere |
| Scroll-hijacking | **No.** Never |
| Snap points | **No** |
| Scroll-linked scale or rotation | **No** |
| Sticky header | Reveal on scroll up, hide on scroll down, 250ms. Never permanently sticky |
| Sticky margin index | **No.** It scrolls with content — it is marginalia, not a control |
| Progress indicator | **No.** The scrollbar already does this |
| Smooth scroll on anchors | Yes, respecting `prefers-reduced-motion` |

**Why no parallax.** It is the default "premium" gesture and it is wrong here on three counts: it
implies depth in a design that is deliberately flat; it costs continuous compositing on scroll,
which is an INP and battery cost on the mid-range Android devices that dominate audience A; and on a
reading page it makes text and image drift apart, which is disorienting rather than luxurious.

---

## 5. Image motion

| Context | Behaviour |
|---|---|
| Hero | None. Static, eager, preloaded |
| Evidence plates | Decode fade, 200ms. **Never** scale, pan, parallax or reveal |
| Review cards, hover | Scale 1.0 → 1.02, 400ms, `standard` easing. Image only — the container does not move |
| Work project, hover | Same |
| Homepage portrait | None |

**Evidence images never move.** A record that animates is a record you cannot trust. This is the
same principle as not grading them: the more the presentation manipulates an evidence image, the
less it functions as evidence.

The 1.02 hover scale is the only transform in the system. It is small enough to read as a shift in
attention rather than as an effect, and it happens inside a fixed-size overflow-hidden frame so no
layout moves.

---

## 6. Evidence motion

The observation sequence is the only place motion carries meaning.

Observations settle in order, 80ms apart, as the sequence scrolls into view. This mirrors what the
content is: things that happened in order. The mineral rule beside them draws down by scaling from
the inline start over 300ms as the sequence enters.

**Constraints:**

- Once only.
- The rule draw is the single most decorative thing on the site and is the first candidate for
  removal if the motion budget is exceeded.
- Fully disabled under reduced motion, with **no substitute** — the sequence simply appears.
- The stagger must never exceed 80ms × visible items. With 6 observations that is 480ms; with 20 it
  would be unacceptable, so the stagger caps after 8 items and the remainder appear together.

**Nothing counts up.** No animated numbers, no counting timers, no progress fills. A number that
animates from 0 to 38 is a data-visualisation gesture in a system that refuses data visualisation.

---

## 7. Navigation

| Element | Behaviour |
|---|---|
| Header on scroll | Hide on down, reveal on up, 250ms, `exit`/`standard` |
| Nav link hover | Underline draws from inline start, 150ms |
| Active nav item | No animation. Static weight and rule |
| Mobile menu open | Overlay fades 250ms; items settle with 40ms stagger |
| Mobile menu close | Fade out 150ms, no stagger — leaving is faster than arriving |
| Language switcher | Colour shift only, 150ms. **No transition on the language change itself** |

**The language switcher must not animate the page transition.** A locale change is a navigation to a
different document; dressing it as a transformation implies the two are the same content in two
skins, which is precisely the framing `docs/MULTILINGUAL_SEO_ARCHITECTURE.md` rejects.

---

## 8. Page transitions

**Recommendation: none in v1.**

Astro supports view transitions cheaply, and a cross-fade would be tasteful. It is still deferred:

- The primary journey is search → review → related review. Each is a fresh entry from an external
  referrer, where a transition never fires.
- Transitions require client-side routing, which complicates the "works without JavaScript"
  guarantee that the evidence layer depends on.
- The benefit is felt by returning browsers; the cost is paid by every first-time visitor.

**Revisit in Phase 6** with measurement. If adopted: cross-fade only, ≤200ms, no shared-element
morphing, and disabled under reduced motion.

---

## 9. Micro-interactions

| Element | Behaviour |
|---|---|
| Text link | Underline present by default; colour shifts to `clay.hover`, 150ms. **Underline is never removed on hover** |
| Button | Background `clay` → `clay.hover`, 150ms. No lift, no shadow, no scale |
| Focus ring | **Appears instantly, 100ms.** Never eased in — a focus indicator that fades is a focus indicator you lose |
| Filter chip | Border and text colour, 150ms |
| Form input | Border `line.strong` → `clay` on focus, 150ms |
| Form error | Appears instantly, no animation |
| Disclosure band | **No interaction.** Not expandable, not dismissible |

**No hover lift, no shadow bloom, no scale on buttons.** Those are software gestures. A link in a
publication changes colour.

---

## 10. Reduced motion

`prefers-reduced-motion: reduce` is honoured at the **token level**, so it cannot be forgotten
per-component.

```
When reduce is set:
  motion.duration.*  →  0ms  (except focus, which stays instant)
  all transforms     →  removed
  all staggers       →  removed
  scroll-triggered entrance → content simply present
  smooth anchor scroll → instant jump
  hover image scale  → removed
  rule draw          → removed
  sticky header      → RETAINED (position, not animation)
```

**Nothing is lost.** No information, no affordance and no wayfinding depends on motion — which is
why the reduced-motion experience is not a degraded version of the site but simply a stiller one.

**Also honoured:** `prefers-reduced-data` drops the paper grain and any non-essential decode fade.

---

## 11. Performance

| Rule | Reason |
|---|---|
| Animate `opacity` and `transform` only | Compositor-only. No layout, no paint |
| Never animate `width`, `height`, `top`, `left`, `margin` | Layout thrash, CLS risk |
| No `backdrop-filter` | Expensive paint on mid-range Android |
| No continuous scroll-linked animation | The main INP risk in "premium" designs |
| `IntersectionObserver`, never scroll listeners | Off the main thread |
| Unobserve after firing | "Once" is also a performance rule |
| `will-change` sparingly and removed after | Layer explosion otherwise |
| No animation library | Five patterns need CSS transitions and ~2KB of observer code |

**Motion JavaScript budget: 3KB gzipped**, within the 40KB review-page budget. If a proposed
animation needs a library, the animation is wrong.

**CLS:** no entrance animation may change layout. Settle animates `opacity` and `translateY` on
elements that already occupy their final space.

---

## 12. What motion must never do

- Gate content. No preloader, no curtain, no "reveal on scroll" that leaves content invisible with
  JavaScript disabled.
- Delay the LCP element.
- Re-trigger on scroll back.
- Hijack the scroll.
- Move an evidence image.
- Animate a number.
- Bounce, spring or overshoot.
- Run continuously, anywhere.
- Be the reason a component needs JavaScript.
- Communicate information that is not also communicated statically.
