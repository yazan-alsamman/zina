# Navigation Architecture

**Status:** Phase 1 decision. Structure and behaviour only. No visual design.
**Source of truth:** `navigation` in `content/mock/site.json`.

---

## 1. Primary navigation

```
Zina Almokri        Reviews   Method   Journal   Work   About        [Collaborate]  [EN / ع]
```

Five items, one CTA, one language switcher.

| Item | Route | Why it is here |
|---|---|---|
| **Reviews** | `/{loc}/reviews/` | The library. The reason the site is a destination |
| **Method** | `/{loc}/method/` | The differentiator. Promoted from a journal article in Phase 1 |
| **Journal** | `/{loc}/journal/` | The scalable content engine |
| **Work** | `/{loc}/work/` | The commercial argument |
| **About** | `/{loc}/about/` | The person |
| **Collaborate** (CTA) | `/{loc}/contact/` | The primary conversion, visually distinct |

Order is deliberate: **content first, commerce last.** A visitor from a product search meets
Reviews and Method before Work. A visitor from a brand introduction reaches Work in one click
regardless. Leading with Work would tell every organic visitor that the site is a media kit.

---

## 2. Two decisions worth stating

### Method is in primary navigation

It was a journal article in Phase 0. Promoting it is the single clearest structural expression of
the positioning: a site whose differentiator is a testing method should not bury that method inside
a category. It is also the only Tier 1 page that is simultaneously a trust artefact for brands, a
conversion moment for readers, and a plausible ranking page for a real informational query.

### Brands is not in primary navigation

Phase 0 proposed six primary items including Brands. Removed, for three reasons:

1. **Two of five mock brands fail the index gate** in at least one locale. Promoting a section to
   primary navigation advertises whichever part of it is emptiest.
2. **Brands is a secondary browsing axis.** Readers arrive by product, not by house. Brand pages
   serve people who already know the brand — and those people arrive from a review, where the
   brand is linked.
3. **Six items plus a CTA plus a language switcher is too many** for a header that must also work
   in RTL and on a 360px screen.

Brands remains fully reachable: from every review, from the reviews index filter, and from the
footer. Revisit when most brands pass the gate, at roughly 50 reviews.

---

## 3. The language switcher

The one navigation element with real logic behind it. Full rules in
`docs/MULTILINGUAL_SEO_ARCHITECTURE.md` section 6.

| State | Behaviour |
|---|---|
| Counterpart exists | Link directly to it |
| No counterpart | Link to the **section index** in the target locale, with a visible one-line explanation |
| Nothing in that section in the target locale | Link to the target locale home |

**It never links to a 404 and never silently drops the user on an unrelated page.** The explanation
string is real content in both locales, not a hard-coded template literal.

Presentation: `EN / ع` — each language labelled in its own script (`labelNative` in the locale
config), never a flag. Flags represent countries, not languages, and Arabic is spoken across
dozens of them.

Choice is persisted in a cookie. Language is **never** inferred from IP address.

---

## 4. Desktop behaviour

- Header is present on every page. Sticky-on-scroll-up is acceptable; permanently sticky wastes
  vertical space on a reading site.
- No dropdown menus. Every primary item is a real page; a dropdown would imply a hierarchy the IA
  does not have.
- Current section indicated by state, not by colour alone.
- The CTA is visually distinct but subordinate to the wordmark.
- In RTL the whole header mirrors: wordmark right, navigation flowing right to left, switcher left.
  Achieved with logical properties, not a second stylesheet.

---

## 5. Mobile behaviour

Mobile is the primary surface for audience A, and the brief requires it be designed for touch and
one-handed use rather than compressed from desktop.

**Closed state:** wordmark, a Collaborate affordance, and the menu trigger. The language switcher
lives inside the menu, not in the bar — it is used once per visit at most.

**Open state:** full-screen overlay, not a slide-down strip.

```
  ┌────────────────────────────┐
  │  Zina Almokri        [×]   │
  ├────────────────────────────┤
  │  Reviews                   │
  │  Method                    │
  │  Journal                   │   ← large touch targets,
  │  Work                      │     thumb-reachable, ordered
  │  About                     │     as in the header
  ├────────────────────────────┤
  │  [ Collaborate ]           │
  ├────────────────────────────┤
  │  English   /   العربية      │
  ├────────────────────────────┤
  │  Editorial standards       │   ← condensed footer links
  └────────────────────────────┘
```

Requirements:

- Minimum 44px touch targets; primary items comfortably larger.
- Items in the lower two-thirds of the screen, within thumb reach. A menu that requires a second
  hand has failed.
- Body scroll locked while open; scroll position restored on close.
- Focus trapped while open; `Escape` closes; focus returns to the trigger.
- Opens and closes without layout shift.
- **Works without JavaScript**: the menu is a details/summary or checkbox-driven disclosure
  enhanced by an Astro island, not created by one. A navigation that depends on JS is a navigation
  that fails on a slow connection, which is the exact condition of the mobile audience.

---

## 6. Footer

Three groups, per locale.

| Group | Links |
|---|---|
| **Content** | All reviews, How I test, Journal, Brands |
| **Professional** | Selected work, Collaborate |
| **Standards** | Editorial standards, Privacy, Terms |

Plus: wordmark, one-line bio (`bios.homepageIntro`), social links (`rel="me"` once verified),
copyright, language switcher.

The **Standards** group exists to be found, not hidden. Its presence in a persistent footer is
itself a trust signal, and it guarantees `/editorial-standards/`, `/brands/` and the legal pages
are never orphans.

"How I test" rather than "Method" in the footer: the footer is where a hesitant reader looks, and
the plainer phrasing converts better than the label.

---

## 7. Secondary navigation

| Surface | Mechanism |
|---|---|
| Reviews index | Category, brand and disclosure facets as **crawlable URLs**, not client-only state |
| Journal index | Category labels; category routes activate at 3 articles per locale |
| Review page | Breadcrumb up, related content across, Method link out |
| Brand page | Its reviews and work |
| Method page | In-page anchors to the six stages; no sub-routes |
| 404 | Recent reviews and a route into `/reviews/` |

The facet decision is architectural, not cosmetic: filters implemented as JavaScript state leave
the review corpus reachable only through the sitemap. See `docs/SEO_URL_ARCHITECTURE.md` section 5.

---

## 8. Accessibility

Specified now because retrofitting navigation accessibility is expensive.

- `<nav>` landmarks with distinct accessible names — primary, footer.
- Skip link to main content, first in tab order.
- Current page marked with `aria-current="page"`.
- Visible focus designed, not the browser default suppressed.
- Menu trigger is a real `<button>` with `aria-expanded` and `aria-controls`.
- Language switcher links carry `hreflang` and `lang` so a screen reader announces "العربية" in
  Arabic rather than mispronouncing it in English.
- Logical tab order in both directions; RTL must not scramble it.
- `prefers-reduced-motion` respected by the menu transition.

---

## 9. Scaling

| Corpus | Navigation |
|---|---|
| Today | Five items. Brands in footer only |
| ~50 reviews | Brands may earn a primary slot. Reviews may need a category-aware secondary bar |
| ~200 | On-site search becomes worthwhile — the first genuinely new navigation element |
| ~500 | Reviews index becomes a category landing surface rather than a flat list |

The header does not grow past six items at any scale. New navigation goes into secondary surfaces
or into search, never into the primary bar.
