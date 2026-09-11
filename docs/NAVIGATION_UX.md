# Navigation UX

**Status:** Phase 3 decision. Extends `docs/NAVIGATION_ARCHITECTURE.md` (Phase 1 — structure) into
behaviour, states and per-locale specifics.

**The register:** navigation should feel like an editorial publication, not an ecommerce catalog.
Five destinations, one conversion, one language control. Nothing else.

---

## 1. Primary navigation

```
Zina Almokri        Reviews   Method   Journal   Work   About        [Collaborate]   English / العربية
زينا المقري          المراجعات   الطريقة   المجلة   الأعمال   عن زينا        [تعاون]        English / العربية
```

| Item | Route | Why it is here |
|---|---|---|
| **Reviews** | `/{loc}/reviews/` | The library. The reason the site is a destination |
| **Method** | `/{loc}/method/` | **The differentiator.** The trust moment in every flow |
| **Journal** | `/{loc}/journal/` | The scalable content engine |
| **Work** | `/{loc}/work/` | The commercial argument |
| **About** | `/{loc}/about/` | The person |
| **Collaborate** (CTA) | `/{loc}/contact/` | The primary conversion, visually distinct |

**Order is deliberate: content first, commerce last.** A visitor from a product search meets Reviews
and Method before Work. A visitor from a brand introduction reaches Work in one click regardless.
Leading with Work would tell every organic visitor that the site is a media kit.

### Two exclusions, confirmed in Phase 3

| Excluded | Confirmed because |
|---|---|
| **Brands** | Two of five brands fail the index gate in at least one locale. Promoting a section advertises whichever part of it is emptiest. It stays reachable from every review, the reviews-index facet, and the footer. Revisit at ~50 reviews |
| **A mega-menu** | There is no hierarchy to expose. Every primary item is a real page with a real index beneath it; a dropdown would imply a structure the IA does not have, and it would need JavaScript, a hover intent model and an RTL mirror for no gain |

**The header does not grow past six items at any scale.** New navigation goes into secondary
surfaces or into search, never into the primary bar.

---

## 2. Desktop navigation (≥1024)

| Property | Behaviour |
|---|---|
| Presence | On every page |
| Sticky | **Reveal on scroll up, hide on scroll down**, 250ms. Never permanently sticky — that wastes vertical space on a reading site |
| Current section | Indicated by **weight change and a rule beneath**, plus `aria-current="page"`. Never by colour alone |
| Hover | Underline draws from the inline start, 150ms |
| CTA | Visually distinct but **subordinate to the wordmark** |
| Dropdowns | **None** |
| Width | Laid out to the **wider of the two measured label sets** (measured: English 753px, Arabic 686px on the fallback tier) |
| Height | **Reserved for the Arabic line box in both locales** (88px), so the header does not change height when the language changes |
| Focus | Must not be obscured by the sticky header — `scroll-margin-top` on anchor targets |

**The header does not exist below 1024**, because it needs ~849px including tablet margins and does
not look composed at that width. This is the measured basis for the 1024 threshold
(`docs/RESPONSIVE_UX_SPEC.md` §1).

---

## 3. Mobile navigation (<1024)

Mobile is the primary surface for audience A. It is **designed for touch and one-handed use**, not
compressed from desktop.

### Closed state

```
┌────────────────────────────┐
│  Zina Almokri         [☰]  │
└────────────────────────────┘
```

Wordmark, a Collaborate affordance, and the menu trigger. **The language switcher is not in the bar**
— it is used once per visit at most, and it costs width that the wordmark and trigger need.

### Open state — full-screen overlay, not a slide-down strip

```
┌────────────────────────────┐
│  Zina Almokri         [×]  │
├────────────────────────────┤
│                            │
│                            │  ← upper third deliberately empty:
│                            │    items sit in thumb reach
├────────────────────────────┤
│  Reviews                   │
│  Method                    │   large touch targets,
│  Journal                   │   ordered as in the header
│  Work                      │
│  About                     │
├────────────────────────────┤
│  [ Collaborate ]           │
├────────────────────────────┤
│  English   /   العربية      │
├────────────────────────────┤
│  Editorial standards       │   condensed footer links
└────────────────────────────┘
```

| Requirement | |
|---|---|
| Touch targets | ≥44px; primary items comfortably larger |
| Position | Items in the **lower two-thirds**. A menu that requires a second hand has failed |
| Scroll | Body scroll locked while open; **position restored on close** |
| Focus | Trapped while open; `Escape` closes; **focus returns to the trigger** |
| Layout shift | Opens and closes without any |
| Motion | Overlay fades 250ms; items settle with a 40ms stagger. Closing is faster: 150ms, **no stagger** — leaving is faster than arriving |
| Surface | Opaque `ground.overlay`. **No blur, no translucency** — a contrast ratio over a shifting backdrop cannot be measured |
| **Works without JavaScript** | The menu is a `details`/`summary` or checkbox-driven disclosure **enhanced** by an island, not created by one. A navigation that depends on JS fails on a slow connection, which is the exact condition of the mobile audience |

---

## 4. Locale switching

The one navigation element with real logic behind it.

| State | Behaviour |
|---|---|
| **1 — Counterpart exists** | Link directly to it |
| **2 — No counterpart** | Link to the **section index** in the target locale, plus a visible one-line explanation on arrival (CMP-09) |
| **3 — Nothing in that section in the target locale** | Link to the target-locale home |

**It never links to a 404 and never silently drops the user on an unrelated page.**

| Property | |
|---|---|
| Presentation | `English / العربية` — **each label in its own script**, never a flag. Flags represent countries; Arabic is spoken across dozens of them |
| Persistence | Choice stored in a cookie. **Language is never inferred from IP address** |
| Root behaviour | `/` issues a **302** by `Accept-Language`, never a 301 — a 301 would cache one locale in shared proxies and prevent discovery of the other |
| Accessibility | Links carry **`hreflang` and `lang`**, so "العربية" is announced in Arabic |
| Motion | Colour shift only, 150ms. **No transition on the language change itself** — a locale change is navigation to a different document |
| Position | Header (desktop) · inside the menu (mobile) · footer (both) |

---

## 5. Arabic navigation

Not a mirrored English navigation — the same navigation, authored in Arabic.

| Aspect | Behaviour |
|---|---|
| Direction | Whole header mirrors via logical properties. Wordmark right, items flowing right to left, switcher left |
| Labels | `المراجعات · الطريقة · المجلة · الأعمال · عن زينا`, CTA `تعاون` |
| **Width** | **Measured 686px** on the fallback tier — narrower than English. Re-measure on Zarid |
| **Height** | **Measured 88px vs 82px — Arabic binds vertically.** Header height is reserved for the Arabic line box in both locales |
| Tracking | **Zero.** Never applied to Arabic labels |
| Size | ×1.12; labels reach the same volume through size and weight, never through case or tracking |
| Tab order | Follows visual order, right to left |
| Overlay | Items at the inline start; close control at the inline end |
| Switcher | Shows `English` in Latin and `العربية` in Arabic, both with `lang` |

**Both locales are laid out from the same rules.** English is not the reference implementation.

---

## 6. Secondary navigation

| Surface | Mechanism | Notes |
|---|---|---|
| **Reviews index** | Category, brand and disclosure facets as **crawlable server-rendered URLs** | The single architectural decision on that page. JS-only filters leave the corpus reachable only from the sitemap (R-15) |
| **Journal index** | Category **labels**; category routes activate at 3 articles per locale | None qualifies today, so labels are text, not links |
| **Review page** | Breadcrumb up · related content across · **Method stage markers out** | The stage markers are the most-repeated internal link on the site |
| **Method page** | In-page anchors to the six stages; **no sub-routes** | Six thin pages would be worse than six anchors |
| **Brand page** | Its reviews and its work | |
| **Work case study** | The independent review of the same brand | The credibility cross-link |
| **Journal article** | Contextual in-prose links to the reviews it cites | Stronger than any related block |
| **404** | Recent reviews and a route into `/reviews/` | |
| **Footer** | Three groups, site-wide | Guarantees `/editorial-standards/`, `/brands/` and the legal pages are never orphans |

---

## 7. Review next/previous navigation

**Not built as a linear next/previous control.**

| Considered | Verdict |
|---|---|
| Sticky next/previous bar | **Rejected.** It is a control on a reading page, it occupies the space the margin index needs on mobile, and "next" implies a sequence reviews do not have |
| Next/previous by publication date | **Rejected.** Chronology is not a meaningful relationship between two product reviews |
| **Related reviews chosen by relationship** | **Adopted.** `related.reviewIds`, curated, falling back to same category → same brand → recency past ~50 reviews |

A reader who wants the corpus in order has `/reviews/`. A reader at the foot of a review wants
*another review like this one*, and that is what the related block provides.

---

## 8. Breadcrumbs

Mirror the URL path exactly, so `BreadcrumbList` is derived from the route rather than maintained
separately.

```
/{loc}/reviews/{slug}/     Home / Reviews / {title}
/{loc}/journal/{slug}/     Home / Journal / {title}
/{loc}/work/{slug}/        Home / Work / {title}
/{loc}/brands/{slug}/      Home / Brands / {name}
/{loc}/method/             Home / Method
```

**A breadcrumb must never name a page that does not exist.** Review breadcrumbs do not include the
product category until category routes are built, and article breadcrumbs do not include the journal
category until that category passes its gate. Checked at build time from the same gate data the
router uses.

---

## 9. Navigation states

| State | Desktop | Mobile |
|---|---|---|
| Default | All items at `text.secondary` | In overlay |
| **Current section** | Weight change + rule beneath + `aria-current="page"` | Same, in overlay |
| Hover | Underline draws from inline start, 150ms | n/a |
| Focus | 2px clay ring, 2px offset, instant | Same |
| Scrolled down | Header hidden | Header hidden |
| Scrolled up | Header revealed, 250ms | Revealed |
| Menu open | n/a | Overlay, focus trapped, scroll locked |
| **Section empty in this locale** | **Item removed** — not disabled, not greyed | Same |

The last row matters: if a locale has no work projects, `Work` is **removed** from that locale's
navigation. A section that does not exist is better than an empty one, and a disabled nav item
advertises a gap.

---

## 10. Footer navigation

| Group | Links |
|---|---|
| **Content** | All reviews · **How I test** · Journal · Brands |
| **Professional** | Selected work · Collaborate |
| **Standards** | Editorial standards · Privacy · Terms |

**"How I test" rather than "Method"** — the footer is where a hesitant reader looks, and the plainer
phrasing converts better than the label.

**The Standards group exists to be found, not hidden.** Its presence in a persistent footer is itself
a trust signal, and it guarantees three pages are never orphans.

Plus: wordmark, one-line bio, **verified** social links (`rel="me"`; none qualifies today, so the row
does not exist), copyright, language switcher.

---

## 11. Scaling

| Corpus | Navigation |
|---|---|
| **Today** | Five items. Brands in the footer only |
| ~50 reviews | Brands may earn a primary slot. Reviews may need a category-aware secondary bar |
| ~200 | **On-site search becomes worthwhile** — the first genuinely new navigation element (`docs/SEARCH_UX.md`) |
| ~500 | The reviews index becomes a category landing surface rather than a flat list |

---

## 12. What navigation must never become

- A mega-menu.
- Six or more primary items.
- A header with a search field before search exists.
- A flag as a language control.
- A disabled or greyed-out navigation item.
- A sticky next/previous reading bar.
- A menu that requires JavaScript to open.
- A menu that requires a second hand.
- A dropdown implying a hierarchy the IA does not have.
- A header laid out to one language and checked in the other.
- A breadcrumb naming a page that does not exist.
- A "Shop" or "Products" item — there is nothing to sell, and products have no route.
