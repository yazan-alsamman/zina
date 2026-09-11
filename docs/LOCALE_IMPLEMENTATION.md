# Locale Implementation

**Status:** Phase 4.

Arabic and English as two first-class layouts, not one layout mirrored.

---

## 1. Routing

```
/{locale}/reviews/{slug}/     src/pages/[locale]/reviews/[slug].astro
/{locale}/404/                src/pages/[locale]/404.astro
```

`getStaticPaths` derives routes from **actual locale content**:

```ts
const all = [...reviewsIn("en"), ...reviewsIn("ar")];
const unique = Array.from(new Map(all.map((r) => [r.id, r])).values());
return localeSlugPaths(unique);   // renderable AND present in that locale AND has a slug
```

**Six review records produce TEN routes, not twelve.**

| Record | `/en/` | `/ar/` |
|---|---|---|
| Voile Lumiere Skin Tint | yes | yes |
| Nuit Barrier Serum | yes | yes |
| Cils Infini Mascara | yes | yes |
| Sitara Luminous Concealer | yes | yes |
| **Velvet Hour Lip Cream** | yes | **NO ROUTE** — English-only |
| **Verdure Cloud Balm** | **NO ROUTE** — Arabic-original | yes |

This is the missing-translation rule proving itself in the build log. Asserted three ways: in
`tests/content.test.mjs` (route generation), in `tests/output.test.mjs` (the directories do not
exist in `dist/`), and by the build output itself.

---

## 2. Missing translations — no route, no hreflang, no stub, no machine translation

| Surface | Behaviour | Verified |
|---|---|---|
| Route | Not generated. 404 in the other locale | `tests/output.test.mjs` |
| hreflang | **No alternate emitted** for the missing locale | `tests/content.test.mjs` + output |
| Index pages | Locale-filtered (`/ar/reviews/` would list five, not six) | `reviews(locale)` |
| Related content | Filtered to the current locale before the count is taken | `tests/content.test.mjs` |
| Language switcher | Falls back to the **section index** with a visible explanation | `switcherTarget()` |
| Machine translation | **Never.** Not as a stub, not as a fallback, not behind a banner | No code path exists |

There is no `pending` state a build could accidentally render, because absence is represented by
an absent key rather than a flag.

---

## 3. The language switcher

The one navigation element with real logic behind it. Three states, and **it never links to a
404**.

| State | Condition | Target |
|---|---|---|
| `counterpart` | The other locale has this record | That record |
| `section-fallback` | It does not, but the section has content there | `/{loc}/reviews/` + a visible explanation |
| `home-fallback` | The section is empty in that locale | `/{loc}/` |

Presentation: `English / العربية`, **each label in its own script**, never a flag — flags represent
countries, and Arabic is spoken across dozens of them.

Both links carry **`lang` and `hreflang`**, so a screen reader announces "العربية" in Arabic rather
than mispronouncing it in English. The Arabic label also carries `dir="rtl"`.

**No transition animates a locale change.** A locale change is navigation to a different document;
dressing it as a transformation implies the two are one content in two skins, which is the framing
the multilingual architecture rejects.

---

## 4. Document direction

```html
<html lang="en" dir="ltr">
<html lang="ar" dir="rtl">
```

`locale` is a **required prop** on `BaseLayout` rather than something inferred, so `lang` and
`dir` cannot be forgotten — they are the two attributes that most often go missing on bilingual
sites. Asserted on every page in `tests/output.test.mjs`.

---

## 5. RTL is CSS logic, not a mirrored stylesheet

**There is no second stylesheet for Arabic, and no `[dir="rtl"]` override block anywhere in the
codebase.** The entire Arabic layout comes from two things:

1. `dir="rtl"` on `<html>`
2. Two custom properties re-declared at the locale root

```css
[lang="ar"] {
  --type-family-display: "Noto Naskh Arabic", …;
  --type-family-ui: "IBM Plex Sans Arabic", …;
  --type-arabic-size-factor: 1.12;
  --type-arabic-leading-factor: 1.18;
  --type-tracking-label: 0;      /* letter-spacing severs Arabic letterforms */
  --type-tracking-display: 0;
}
```

Everything else is logical properties: `margin-inline`, `padding-inline-start`,
`border-inline-start`, `inset-inline`, `text-align: start|end`.

**Measured result:** the margin index sits on the inline-start side in **both** directions at 1024
and 1440 — left in LTR, right in RTL — with no direction-specific rule anywhere.

### The script-adaptation factors

Applied **at the locale root only**, never per component. Getting these wrong is the single most
common reason Arabic pages feel cramped beside their English counterparts.

| Token | Value | Effect |
|---|---|---|
| `--type-arabic-size-factor` | 1.12 | Every size step scales |
| `--type-arabic-leading-factor` | 1.18 | Every line-height scales |
| `--type-tracking-label` / `-display` | **0** | Not overridable. Measured: 0 violations at all five widths |

**Arabic pages are visibly longer. That is correct, not a bug.**

---

## 6. The root route

`/` is a **302 by `Accept-Language`**, never a 301 — a 301 would cache one locale in shared proxies
and prevent discovery of the other. It is never indexed, and `x-default` points at `/en/`.

**A static build cannot perform a 302.** This is host configuration, and it is deliberately not
faked with a meta-refresh or a JavaScript redirect — both would be indexed, both would be slower,
and a JS redirect breaks with scripting unavailable.

Sample configuration for the eventual host:

```
# Netlify _redirects
/   /en/   302   Language=en
/   /ar/   302   Language=ar
/   /en/   302

# Cloudflare / nginx equivalent: negotiate on Accept-Language, 302, Vary: Accept-Language
```

Language is **never inferred from IP address**, and the user's choice is persisted in a cookie
once made. That cookie is a Phase 5 concern; nothing in Phase 4 sets one.

---

## 7. Bidirectional text — the Phase 3 correction, implemented

`src/lib/bidi.ts`. **This is the mandatory correction and the most valuable code in the phase.**

### The defect

```
<bdi>34–38 °م</bdi>            renders as   °م | 38 | 34     ← THE RANGE REVERSES
<bdi dir="ltr">34–38</bdi> °م  renders as   °م | 34 | 38     ← correct
```

`<bdi>` resolves direction **automatically from the first strong character**. In `34–38 °م` the
digits are directionally weak, so the first strong character is the Arabic **م**, the isolate
resolves RTL, and the two numerals swap. Wrapping the whole run in a bare `<bdi>` is worse than
not isolating it at all.

It would have appeared in every conditions well, every observation timestamp and every record line
on every Arabic review page — silently, and invisibly to a non-Arabic-reading team.

### The implemented rule

| Input | Output | Why |
|---|---|---|
| `34–38 °م` | `<bdi dir="ltr">34–38</bdi> °م` | Arabic unit stays **outside**, in the Arabic run |
| `58–71 ٪` | `<bdi dir="ltr">58–71</bdi> ٪` | Same |
| `34–38 °C` | `<bdi dir="ltr">34–38 °C</bdi>` | A Latin unit is directionally safe **inside** |
| `4` | `<bdi dir="ltr">4</bdi>` | Explicit direction, always |
| `34 to 38 degrees Celsius` | unchanged | **Prose is left alone entirely** |
| `من 34 إلى 38 درجة مئوية` | unchanged | Same |

The prose case matters: isolating a fragment of a sentence is worse than leaving it to the
browser's implicit algorithm, which handles digits inside prose correctly. **The isolate is a
guarantee for record values, not a blanket applied to every string.**

### Identifier isolation — script is detected, never assumed

An earlier revision defaulted to `lang="en"` and produced `<bdi lang="en">ميزون إيكلا</bdi>` on
Arabic pages: Arabic text labelled as English, which is exactly the mispronunciation the attribute
exists to prevent. Found by inspecting the built HTML.

```ts
isolateIdentifier("Voile Lumiere Skin Tint", "ar")  →  <bdi lang="en">…</bdi>
isolateIdentifier("ميزون إيكلا", "ar")               →  ميزون إيكلا      (same script: no markup)
isolateIdentifier("زينا المقري", "en")               →  <bdi lang="ar">…</bdi>
```

Same-script identifiers emit **no isolate at all** — it is redundant markup, and the browser needs
no help.

### Record markers

`الساعة 6` splits into an Arabic word set in the Arabic UI face and a numeral set in mono, inside
an isolate — because there is no Arabic monospace tradition, and forcing one would read as a
technical artefact rather than as a record.

**Enforcement:** `tests/bidi.test.mjs` covers all of it, and `tests/output.test.mjs` asserts that
**no bare `<bdi>` appears anywhere in `dist/`** and that no Arabic text is ever labelled English.

---

## 8. Font loading is locale-split

An English page never downloads an Arabic subset, and vice versa. Details in
`docs/PERFORMANCE_IMPLEMENTATION.md` §2; asserted in `tests/output.test.mjs`.

| Locale | Payload | Budget |
|---|---|---|
| en | **79.2 KB** | 180 KB |
| ar | **151.9 KB** | 180 KB |

---

## 9. Interface strings

`src/lib/ui-strings.ts`. Chrome, not content — the words the interface says about itself, as
distinct from the words Zina wrote.

Typed so a missing key is a **compile error**, not a runtime blank: `ar` is declared as
`satisfies Record<keyof typeof en, string>`, so adding an English string without its Arabic
counterpart fails the type check.

**Provenance is documented in the file.** Strings taken from the Phase 2/3 specifications or from
`site.json` are marked as verified (`الحكم`, `تدّعي العلامة`, `لوحة`, `الساعة`, the navigation set).
The remaining Arabic section headings were composed for this implementation and are marked
**NEEDS NATIVE REVIEW** — open question Q3-2, with Q3-6 asking specifically whether `الساعة 6` is
the natural idiom for a timed observation.

**No string in the file makes a claim.** None describes the testing as clinical, validated,
certified, proven or scientific, in either language.

---

## 10. Verified at five widths in both directions

Measured in Chrome against the built output. Full table in `docs/reports/PHASE_4_REPORT.md` §12.

| Check | en | ar |
|---|---|---|
| Horizontal overflow at 320/375/768/1024/1440 | none | none |
| Arabic letter-spacing violations | n/a | **0** |
| Type-size floor violations | 0 | 0 |
| Margin index side | inline-start | **inline-start (right)** |
| Conditions numerals aligned | yes | yes |
| Disclosure statement clipped | no | no |
| Header height | 88px | 88px |

The header height is identical in both locales by design: it is reserved for the Arabic line box
(measured at 88px in Phase 3 against 82px for English), so the header does not change height when
the language changes.
