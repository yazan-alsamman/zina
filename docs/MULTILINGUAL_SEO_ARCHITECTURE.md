# Multilingual SEO Architecture

**Status:** Phase 1 decision. Arabic and English are both first-class. Neither is a translation of
the other.

---

## 1. The governing principle

> **A locale is an authoring language, not a rendering option.**

Every consequence in this document follows from that. A record exists in a locale because someone
wrote it in that locale. If nobody wrote it, the page does not exist — it is not machine
translated, not stubbed, and not filled with the other language's text.

This is enforced in the data: `locales` is a partial map, and an absent key is the representation
of "no version exists". There is no `pending` state that a build could accidentally render.

`translationStatus` distinguishes:

- **`original`** — authored first in this locale.
- **`adapted`** — independently written from the same brief and the same testing data. Not a
  translation; the Arabic Voile Lumiere review is written for an Arabic reader, from the same four
  wear tests.

Every record must have exactly one `original` locale. Validator-enforced.

---

## 2. URL and root behaviour

```
/                    302 -> /en/ or /ar/ by Accept-Language, cookie override once chosen
/en/...              English
/ar/...              Arabic
```

**The root is never indexed and never 301s.**

A 301 from `/` would permanently cache one locale in shared proxies and would tell Google that `/`
*is* that locale, which prevents discovery of the other. A 302 keeps `/` a neutral negotiator.
`x-default` points at `/en/`, so a crawler that ignores the redirect still has a defined entry.

Once a user chooses a language, a cookie fixes the preference and the switcher is always visible.
Language should never be inferred from IP address — an Arabic speaker in London and an English
speaker in Dubai are both common, and IP-based forcing is the single most-hated pattern in
multilingual sites.

---

## 3. hreflang

Emitted on every page, in the HTML head, **only for locales that actually exist for that record**.

Full pair, where both exist:

```html
<link rel="alternate" hreflang="en"        href="https://…/en/reviews/atelier-noor-sitara-luminous-concealer/">
<link rel="alternate" hreflang="ar"        href="https://…/ar/reviews/atelier-noor-sitara-luminous-concealer/">
<link rel="alternate" hreflang="x-default" href="https://…/en/reviews/atelier-noor-sitara-luminous-concealer/">
```

Single-locale record — the English-only Velvet Hour review:

```html
<link rel="alternate" hreflang="en"        href="https://…/en/reviews/veloura-velvet-hour-lip-cream/">
<link rel="alternate" hreflang="x-default" href="https://…/en/reviews/veloura-velvet-hour-lip-cream/">
```

No `hreflang="ar"` is emitted, because no Arabic page exists. Pointing it at `/ar/reviews/` would
be a false claim: hreflang asserts *equivalence*, and an index is not an equivalent of an article.

**Rules:**

1. Self-referencing hreflang on every page.
2. Reciprocal or nothing. A one-directional hreflang is ignored, and generating it from a
   partial-map data structure means it cannot be one-directional by construction.
3. `x-default` always points at the English version where one exists, otherwise at the only
   version that does.
4. Generated from the `locales` keys, never hand-maintained.
5. Language codes only — `en`, `ar` — no region subtags, because the audience geography is unknown
   (U-04). Adding `ar-AE` later without evidence would narrow reach for no gain.

---

## 4. Canonicals versus hreflang

The most common and most damaging multilingual SEO error:

> **Locale variants never canonicalise to each other.**

`/ar/reviews/x/` self-canonicalises. It does **not** canonicalise to `/en/reviews/x/`. Doing so
would tell Google the Arabic page is a duplicate and remove it from the index, deleting half the
site's reach.

Canonical says "this is the definitive URL for this content in this language."
Hreflang says "here is the same content in another language."

---

## 5. Metadata and content localisation

Everything a user or a crawler reads is per-locale:

| Element | Localised | Source |
|---|---|---|
| `<title>`, meta description | Yes | `locales[loc].seo` |
| `<html lang>` and `dir` | Yes | `en`/`ltr`, `ar`/`rtl` |
| Open Graph, `og:locale` | Yes | `locales[loc].seo` + locale config |
| Headings, body, alt text | Yes | `locales[loc]` |
| Navigation labels | Yes | `site.navigation[].label` |
| Slug | Yes | `locales[loc].slug` |
| Structured data text values | Yes | `locales[loc]` |
| Dates and numbers | Formatted per locale | Runtime |
| Brand and product names | **No** — Latin in both | Shared record |
| Method stage keys, category keys | **No** — internal | Shared record |

**Focus keywords are researched per locale, never translated.** `docs/SEO_KEYWORD_MAP.md` section 8
establishes why: Gulf, Levantine and North African users search differently, Arabic queries are
longer and more conversational, and product names stay in Latin script inside Arabic queries. A
translated keyword list is a list of terms nobody types.

---

## 6. Missing translations

The behaviour that most multilingual sites get wrong.

| Surface | Behaviour when a counterpart does not exist |
|---|---|
| **Route** | Not generated. `/ar/reviews/veloura-velvet-hour-lip-cream/` returns 404 |
| **hreflang** | No alternate emitted for the missing locale |
| **Sitemap** | Absent from that locale's sitemap |
| **Index pages** | `/ar/reviews/` lists only records with Arabic content — five, not six |
| **Related-content blocks** | Filtered to the current locale. A related link never crosses languages silently |
| **Language switcher** | **Never links to a 404.** Falls back to the section index in the other locale, with a visible explanation |
| **Machine translation** | Never. Not as a stub, not as a fallback, not behind a banner |

### The language switcher contract

Three states:

1. **Counterpart exists** — links directly to it. Standard case.
2. **No counterpart** — links to the section index in the target locale
   (`/ar/reviews/`), with a short line: *"This review is not available in Arabic. Here are the
   reviews that are."* The user is never dead-ended and never misled.
3. **Nothing in that section in the target locale** — links to the target locale home.

The fallback message is a real string in both locales and is part of the content model, not a
hard-coded template literal.

---

## 7. RTL

Arabic is right-to-left, and this is a layout concern, not a stylesheet flip.

- `dir="rtl"` on `<html>` for Arabic, `lang="ar"`.
- Use CSS **logical properties** throughout — `margin-inline-start`, `padding-inline-end`,
  `border-inline-start` — so the layout mirrors without a second stylesheet. This is a Phase 4
  design-system rule and a Phase 5 implementation rule, and retrofitting it is expensive.
- Latin strings inside Arabic text (brand names, product names, shade codes like `22W`) need
  bidirectional isolation. Without it, a product name at the end of an Arabic sentence renders in
  the wrong position. Use `<bdi>` or `unicode-bidi: isolate`. This will appear on almost every
  Arabic review page.
- Numerals: Western digits (`0-9`) are standard in Gulf Arabic web content. Do not convert to
  Eastern Arabic numerals without evidence that the audience prefers them.
- Directional icons — arrows, chevrons, back buttons — must mirror. Non-directional icons must not.
- The mock press record includes an Arabic outlet name inside an otherwise Latin list, specifically
  to force this handling early.

**Typography is the highest-risk unresolved item.** Pairing an Arabic face with a Latin face at
display size, matching optical weight and vertical rhythm across two scripts, is a Phase 2 problem
that cannot be solved by choosing a Latin font first and finding an Arabic companion afterwards.
Both must be chosen together.

---

## 8. Sitemaps

```
/sitemap.xml          index
  /sitemap-en.xml     English URLs only
  /sitemap-ar.xml     Arabic URLs only
```

Each URL entry carries `xhtml:link` alternates matching the hreflang set exactly. Sitemap and
head-level hreflang must agree; a mismatch is a reliable way to have both ignored.

Only existing, indexable, publishable-status URLs appear. Gated brand pages, gated category pages,
filter URLs, `404` and preview builds are all excluded by construction.

---

## 9. Content strategy consequences

The most important architectural point in this document is not technical.

**The highest-value Arabic content will be the content that has no English equivalent.**
`mufradat-darajat-albashara` — why Arabic shade vocabulary does not map onto English shade
vocabulary — could not be translated into English, because the subject is the gap between the two
systems. An English version would be a different article.

Translating the English site into Arabic produces a weaker Arabic site than authoring for Arabic
directly. The architecture supports the better strategy: independent authoring per locale, with
adaptation where the underlying testing data is shared, and full independence where the subject is
language-specific.

Current coverage is deliberately uneven so that every one of these states is exercised before any
UI is built:

| Collection | en | ar | Both | en-only | ar-original |
|---|---|---|---|---|---|
| Reviews | 5 | 5 | 4 | 1 | 1 |
| Journal | 5 | 5 | 4 | 1 | 1 |
| Work | 4 | 3 | 3 | 1 | 0 |
| Brands | 5 | 5 | 5 | 0 | 0 |
| Method, Person | 1 | 1 | 1 | 0 | 0 |

Method and Person are required in both locales and the validator fails the build otherwise. A
bilingual site whose core differentiator exists in only one language is not a bilingual site.
