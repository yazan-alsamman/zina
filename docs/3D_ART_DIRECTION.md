# 3D and Experimental Visuals

**Status:** Phase 2 decision.

## The recommendation: **no 3D, and no WebGL, in v1.**

Not "later", not "lite", not "on desktop only". None.

This document explains why, evaluates the five places it would plausibly go, and defines the
conditions under which the decision should be revisited — so that the refusal is a reasoned position
rather than a limitation.

---

## 1. Why not

**1. It communicates nothing this site needs to say.**

The brand argument is *she keeps records*. That argument is made by published conditions, timed
observations, numbered plates and stated limits. A rotating object or a shader field does not
support it, and a site whose differentiator is rigour undermines itself with a visual effect whose
only content is technical capability.

**2. It contradicts the material language.**

`docs/MATERIAL_LANGUAGE.md` establishes ink, paper and pigment — a printed document that has been
handled. Real-time 3D belongs to glass, chrome and screen-space; it is the material vocabulary of a
product launch, not a publication.

**3. The cost lands exactly where the audience is weakest.**

Audience A arrives on mid-range Android from social. A WebGL hero costs 100–500KB of library plus
shader compilation plus continuous GPU work — against a total mobile budget of 1MB and a review-page
JavaScript budget of 40KB. It would consume the entire budget for the least necessary element, and
on the devices least able to absorb it.

**4. It endangers the LCP.**

Every plausible placement is above the fold. A canvas hero either *is* the LCP element — in which
case it is a slow one — or it delays the real one.

**5. The fallback burden exceeds the benefit.**

Every 3D element needs a static fallback for reduced motion, reduced data, no-WebGL, low-power
mode, save-data, and crawlers. Building and maintaining two versions of the most prominent element
on the site, so that the better-resourced half of the audience sees a rotating object, is a poor
trade.

**6. It is the most dated "premium" signal available.**

A WebGL hero timestamps a site as precisely as glassmorphism does. The direction is built to age;
this is the element most likely to look like a specific year.

---

## 2. Where it was considered, and rejected

| Proposal | What it would do | Verdict |
|---|---|---|
| **Homepage hero** — abstract pigment or liquid field | Atmosphere | **Rejected.** Highest cost, highest LCP risk, zero information. A still portrait says more about Zina than a shader does |
| **Cosmetic material visualisation** — rendered texture of a cream or balm | Show texture | **Rejected, and it is the worst idea in the list.** The site's entire premise is *photographed reality*. A rendered simulation of a product texture on a site about testing real products is a category error, close to fabricating evidence |
| **Abstract product environment** — product on a rendered plinth | Product presentation | **Rejected.** This is ecommerce language, and `docs/PHOTOGRAPHY_ART_DIRECTION.md` already forbids product-on-white and floating objects. Photograph it on a real surface |
| **Method visualisation** — six stages as a 3D sequence | Explain the Method | **Rejected.** The Method is six named stages with stated limits. It is a list, and a list is best set as type. A 3D diagram would also push toward the instrumental register the direction refuses |
| **Page transitions** — 3D or shader transitions | Continuity | **Rejected.** Page transitions are already deferred entirely (`docs/MOTION_ART_DIRECTION.md` §8) |

---

## 3. If it were ever built anyway

Requirements for any future proposal, so nobody has to relitigate the basics:

| Requirement | Specification |
|---|---|
| **Why it exists** | A written statement of what it communicates that type and photography cannot |
| **Placement** | Never the LCP element. Never above the fold |
| **Budget** | ≤40KB gzipped total, inside the existing page budget, not in addition to it |
| **Static fallback** | A real image that is the default, with 3D as a progressive enhancement — not a poster that gets replaced |
| **Mobile** | Static image below 1024px. No exceptions |
| **Reduced motion** | Static frame, no substitute animation |
| **Reduced data / save-data** | Static image |
| **No WebGL / context loss** | Static image, with `webglcontextlost` handled |
| **Low power / thermal** | Pause on `visibilitychange`; never render off-screen |
| **Crawlers** | Content in HTML. Nothing meaningful may exist only in a canvas |
| **Accessibility** | Decorative and `aria-hidden`, or it does not ship. Anything informational must not live in a canvas |
| **Measurement** | Before/after Lighthouse on a throttled mid-range Android, published in the phase report |

The honest test: **if the static fallback is good enough for mobile, it is good enough for
desktop** — and then the 3D is decoration by the site's own definition.

---

## 4. Where visual ambition goes instead

The budget that 3D would have consumed is spent on things that support the argument:

| Instead of | Spend on |
|---|---|
| A WebGL hero | **Genuinely excellent photography.** The single highest-leverage visual investment (R-04) |
| A rendered texture | A 100mm macro of the real texture |
| A 3D method diagram | The margin index and the observation timeline — signature devices that carry information |
| Shader transitions | Type, space and the four full-bleed breaks in the review page rhythm |
| Canvas atmosphere | The warm ground, the paper grain at 3%, the hairline system |

**The distinctiveness target is met by the evidence language, not by rendering.** Very little in the
category has a margin index, numbered plates, published conditions and a three-voice type system.
A lot of it has a shader hero.

---

## 5. Revisit conditions

Reopen this decision only if **all** of the following become true:

1. The photography library is complete and excellent, so 3D is not compensating for weak imagery.
2. Core Web Vitals are measured in the field and comfortably inside budget with headroom to spare.
3. A specific communication need exists that type and photography demonstrably cannot meet, written
   down before any prototype.
4. The static fallback is already designed and would be acceptable as the permanent solution.
5. Someone owns the maintenance of two parallel implementations.

If condition 4 is met, condition 3 is almost certainly false.

**Reasonable review point:** Phase 6, and again only after launch with field data.
