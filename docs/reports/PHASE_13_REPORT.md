# Phase 13 Report — Final Production Audit & Launch Hardening

Prior records: `docs/PHASE_11_VISUAL_REDESIGN.md` (identity), `docs/PHASE_12_EXPERIENCE.md`
(choreography, rhythm), `docs/reports/PHASE_12_REPORT.md`.

---

## 1. Executive summary

Phase 13 did not redesign anything. It audited the **emitted production build** — all 85 routes, in
a real browser, in both locales — and fixed what that found.

The headline: **a build with 478 passing tests was shipping a site with no favicon, a 404 on every
page load, six meta descriptions shared across twenty-seven routes, a homepage description
truncated in every search result, a travelling 3D product covering a caption, and tap targets below
the accessibility minimum on four route types.** None of it was visible to the test suite, because
the suite had never looked at those things.

Twelve defects were found and eleven fixed. The twelfth is content, not code.

**Status: TECHNICALLY READY / CONTENT-GATED.** The only launch blocker is the mock content layer,
which the release guard correctly refuses to let through. No other blocker was found.

## 2. Production audit result

A browser was pointed at every emitted route and asked what actually happened.

| Sweep | Coverage | Result |
|---|---|---|
| Production audit | 85 routes × 2 viewports (1440×900, 390×844) | **Clean.** No console errors, no failed requests, no external requests, no overflow, no heading jumps, no missing alt, no image without intrinsic size, valid JSON-LD everywhere, unique titles and descriptions |
| Responsive sweep | 17 viewports × 27 routes = **459 combinations** | **Clean.** No horizontal overflow, no clipped text, no tap target under 24px |
| Choreography audit | 9 surfaces × 2 viewports, both locales | **Clean.** No product overlaps a heading, a paragraph or a call to action at any scroll position |
| 3D contact sheet | all 24 packages rendered through the production chunk | 5 material/geometry defects found and fixed |
| Fallback modes | reduced motion, Save-Data, no WebGL, no JavaScript | All correct |

Viewports covered: 360×800, 375×812, 390×844, 393×873, 414×896, 430×932, 480×1040, 768×1024,
820×1180, 834×1194, 1024×768, 1280×720, 1366×768, 1440×900, 1600×900, 1920×1080, 2560×1440.

## 3. Visual audit

Reviewed as a creative director, at every viewport class, against the questions in the brief.

**The site does look expensive**, and the things that make it so are the ones Phase 11 and 12 built:
the hero still life, the discovery ledger's restraint, the full-bleed beauty band, the wine verdict
card, the arch, the chapter marks, the grain. Nothing here reads as a template or as a generic
AI landing page: there is no stock hero, no icon grid, no glassmorphism panel, no meaningless
oversized text, no floating blob.

**One section did not belong: the 404.** It was the only page on the site rendered on flat ivory
with no tonal ground, no light and no atmosphere — every other surface opens on an art-directed
`PageHero`. An error page that visibly drops out of the design system tells a visitor the *site* is
broken rather than that a *link* is. It now opens on the same champagne ground as every other inner
page, with one quiet vial. Its documented tone rules are untouched: no illustration, no humour, no
large "404", and not one word of its copy changed. Its onward list was also indented to the centre
of the page while the heading above it started at the page edge — two left margins on one screen;
the measure now constrains the content rather than the container.

Everything else was left alone deliberately (§46). The homepage, review, about, method, journal,
contact, work and brand surfaces were inspected and needed nothing.

## 4. 3D audit

All 24 packages were rendered through the **real production scene chunk** into a contact sheet and
read side by side. Six genuine defects:

| Package | Defect | Fix |
|---|---|---|
| compact, palette | The mirror was a near-white perfect mirror (roughness 0.03). A perfect mirror shows you the room, and the studio environment is neutral — so every open compact and palette rendered a flat **grey** rectangle, the one cold element in an entirely warm identity | Warmed the albedo (a metal tints its own reflection) and added roughness: a soft blush sheen instead of a grey pane |
| jar, powder | Lids sat high and far back, reading as a separate disc hovering above an unrelated pot | Brought in and down so the lid's silhouette **overlaps** the body — at 150px wide, that overlap is the only thing that says the lid belongs to the jar |
| compact | Lid laid almost flat on its back; base and lid read as two unrelated discs with the hinge invisible | Past upright, like a laptop screen, so the lower edge stays against the base |
| polish | A four-radial-segment cylinder — flat facets and hard normals rendered as crumpled foil, and the walls were so thin the bottle read as opaque | Rebuilt on the same bevelled slab the perfume and foundation use, kept square in plan so the faceted character survives |
| highlighter | 0.3 deep under a 0.68 dome on a 1.5 radius — flat enough to read as a bun, with three proud rings reading as stripes | Deeper case, taller dome, narrower radius, two finer rings nearer the crown |
| oil | A 1.78-tall cap on a 0.24 radius over a 1.5 body — a matchstick in a macaron | Shorter and broader: the wand cap of a face-oil bottle |
| toner | The fill nearly filled a near-cubic bottle, so it read as a solid pink block in a box rather than as liquid behind glass | Fill pulled inside on every axis and made barely opaque |

The silhouette test earned its place during this work: narrowing the compact's lid angle made its
outline collide with the beauty sponge's, and the test failed — which was a fair description of how
it then looked. The angle was chosen again with that constraint.

No floating caps remain, no disconnected parts, no impossible geometry, no invisible transparent
object, no clipping, no object entering the camera. Packaging remains original and generically
lettered; a test enumerates the permitted strings.

## 5. Responsive audit

459 viewport × route combinations, clean. Specific checks the brief calls out:

- **1366×768** — the entire hero fits above the fold: eyebrow, headline, intro, both calls to
  action, attribution, portrait, three products, records card and the scroll cue. Verified visually.
- **2560×1440** — capped grid, generous margin, no stretch, no isolated object.
- **Tablet (768–1024)** — found a real structural error here (see §12).
- **Arabic RTL** — mirrored compositions correct at every width, arrows reversed, the vertical spine
  label lying flat and untracked as designed, no letter-spacing, no italic synthesis.

## 6. Accessibility audit

| Check | Result |
|---|---|
| Keyboard | 14 consecutive tab stops, every one on screen with a visible focus ring, in document order, starting with the skip link |
| Tap targets | **4 route types were below the 24×24 CSS-pixel minimum (WCAG 2.5.8)** — 20–23px. Fixed (see §12) |
| Reduced motion | 0 running animations, marquee stopped, products hold a still pose, **0 elements left invisible** |
| Scroll reveals | Walking the whole page and returning leaves nothing at opacity < 0.05 |
| Contrast | 37/37 pairs pass, including two AAA pairs |
| Landmarks / headings | One `<main>`, one `h1`, no skipped level, every nav named — on all 85 routes |
| Decorative 3D | Every slot `aria-hidden`; the shared canvas `aria-hidden` + `role="presentation"` |
| Alt text | No image without alt; no image without intrinsic width and height |
| `validate:ux` | 30/30 a11y coverage, 0 anti-patterns |

## 7. SEO audit

Two real defects, both fixed (§12). After the fix, across all 85 routes:

- Every title unique, none over 60 characters.
- Every description unique, none over 160 characters, none thin in English.
- Canonical, hreflang, OpenGraph and Twitter tags present and same-origin on every route.
- Every JSON-LD block parses. Person schema only — no Organization, no award, no rating, no
  aggregateRating, no offers, no invented credential. `sameAs` carries exactly the one confirmed
  profile.
- Sitemap, robots, RSS unchanged.
- Social preview verified visually: 1200×630, Zina under the arch, name in Cormorant, safe margins,
  no clipping, correct metadata reference, file emitted (57,878 bytes).

No SEO content was invented and nothing was keyword-stuffed. The facet descriptions now name their
own facet — a fact the page's title and `<h1>` already carried.

## 8. Performance audit

| | Phase 12 | Phase 13 |
|---|---|---|
| Initial load (homepage) | 11 requests / 243 KB | **11 requests / 243 KB** |
| Loader script | 996 B gz | **995 B gz** |
| 3D scene chunk | 150,859 B gz | **150,812 B gz** (47 B smaller) |
| Largest page stylesheet | 8,166 B gz | 8,116 B gz |
| Cumulative Layout Shift | 0 | **0** |
| DOMContentLoaded / load | 655 / 801 ms | 677 / 818 ms |
| Site mark (new) | — | 6 KB for all three formats, cached once |

The 3D chunk did not grow despite seven model rebuilds. Exactly one image per page is eager and
high-priority — the LCP portrait — verified across all 85 routes. Largest single image is 118 KB
WebP, served through `sizes` so only the needed width downloads. Fonts remain per-locale.

**Unavoidable cost, documented:** the Three.js chunk is ~151 KB gzipped. It loads only after
`load` + idle, only when the page has product slots, only when WebGL is available and Save-Data is
off. It never blocks first paint and never reaches a reader who cannot or does not want to use it.

## 9. Security / quality audit

- No secrets, API keys, tokens, passwords, credentials, debug endpoints or localhost URLs in the
  build.
- No `innerHTML`, `outerHTML`, `document.write` or `eval` anywhere in source.
- All 39 `set:html` call sites audited: 37 are the bidi isolation helpers, which **escape `&` and
  `<` before building markup**; one is the JSON-LD serialiser, which escapes `<` and `>` to
  `<`/`>` (the correct `</script>` breakout defence); two are static HTML comments.
- No third-party script, analytics, tracking pixel, external font or external image request. The
  only absolute URLs in the HTML are the site's own origin, schema.org (a vocabulary), the one
  confirmed Instagram profile, and the mock brands' `example.com` URLs — which are mock content,
  correctly `nofollow`, and gated by the release guard.
- **Console: clean.** The one remaining `console.log` in the build is inside Three.js's own internal
  warning helper, not project code, and fires only on a library warning.

## 10. Test audit

All 478 inherited tests were reviewed and categorised. Two problems found:

1. **`tests/global.test.mjs` — "every nav landmark is uniquely named" passed for the wrong reason.**
   It tested `/<nav(?![^>]*aria-label)/`, and `aria-label` is a *prefix* of `aria-labelledby` — so
   the journal's table of contents passed by accident, and so would `aria-labelfoo`. Its uniqueness
   check collected `aria-label` values only, so a nav named by `aria-labelledby` was invisible to
   it: two navs could share a computed name and the test would say nothing. **Strengthened**: both
   mechanisms are now recognised explicitly, and `aria-labelledby` is resolved to the text of the
   element it points at, so uniqueness is checked against the name a screen reader announces.

2. **Whole categories were unmeasured.** Nothing asserted that a page had a favicon, that
   descriptions were unique or the right length, that JSON-LD parsed, or that a travel rail was
   gated to a width where its layout exists. Those gaps are why a green suite shipped six real
   defects. Twelve tests added (§11).

No test was weakened. The suite went from 478 to **490**.

## 11. New tests

`tests/phase13.test.mjs` — every one guards a defect this audit actually found:

- every page declares icons, and every declared icon file was emitted
- `/favicon.ico` exists and is a structurally valid ICO (magic bytes checked)
- the mark's colours come from the token palette, not from an arbitrary hex
- no two routes share a meta description
- no two routes share a title
- no description exceeds 160 characters
- no English description is under 50 (deliberately English-only: the same sentence in Arabic
  occupies far fewer code points, so a character floor applied to both scripts measures the script,
  not the sentence)
- every structured-data block is valid JSON
- every travel rail is gated to the breakpoint at which its layout exists
- the rail's corridor keeps the product inside the page
- the `.link-list` primitive exists and clears 24px
- the four surfaces the audit caught still use it

**These were mutation-tested.** Reintroducing the long homepage description and one duplicate facet
string produced three failures; restoring the fixes returned the suite to green. They bite.

## 12. Bugs discovered

| # | Severity | Bug |
|---|---|---|
| 1 | High | **No favicon on any of 85 routes**, and `/favicon.ico` returned 404 on every page load — a console error site-wide and a blank glyph in the tab strip |
| 2 | High | **Six meta descriptions shared across 27 routes** — every category facet, brand facet and journal format said the same thing |
| 3 | Medium | **Homepage description 199 chars (en) / 165 (ar)** — truncated in every search result, on the most important page |
| 4 | Medium | **A travelling 3D product covered up to 68% of the story caption** mid-scroll on the homepage, both locales |
| 5 | Medium | **The homepage travel rail was switched on at 768**, but the two-column layout it needs only begins at 1024 — between those widths the corridor ran down the prose and covered a heading |
| 6 | Medium | **Tap targets of 20–23px** on the journal table of contents, work related links, brand related links, the work page's client link and the 404 onward list |
| 7 | Medium | Mirror material rendered **neutral grey** on every open compact and palette |
| 8 | Low | Five model defects: detached lids (jar, powder, compact), faceted-glass polish reading as crumpled foil, flat striped highlighter, matchstick-capped oil, toner fill reading as a solid block |
| 9 | Low | **The 404 was the only page not art-directed** — flat ivory, no tonal ground, no light |
| 10 | Low | The 404's onward list was centred while its heading was at the page edge |
| 11 | Low | The travelling product sat half-cropped by the viewport edge at its furthest position |
| 12 | Low | A nav-landmark test that passed by accident rather than by understanding |

## 13. Bugs fixed

**All twelve.** Each fix is documented in the source at the point of change, with the reason.

Two were fixed structurally rather than locally, on purpose:

- **Tap targets** became one `.link-list` primitive in `global.css` rather than a ninth copy of the
  same three declarations. Phase 12 fixed this defect on four surfaces by copying a rule into four
  component stylesheets; Phase 13's wider sweep promptly found four more. Copying it a fifth time
  would have guaranteed a ninth.
- **The story caption moved** rather than the travel path being re-tuned. Two attempts at tuning the
  path made the collision worse, because the caption was sitting in the corridor. Decoration yields
  to content: from 1024 the caption moves to the image's lower-right, and the corridor is clear.

## 14. Known limitations

Stated plainly; none of these is solved.

1. **Real evidence photography does not exist.** The review plates remain honest reserved frames —
   a hairline inset, corner registration ticks, and a label naming the gap in both languages. Their
   alt text already describes what each frame will show. When real frames arrive, `src` starts
   resolving and the placeholder branch in `Frame.astro` stops running: a change to one file.
2. **Mock content.** Every record on the site is fictional placeholder content. The release guard
   blocks deployment. See `docs/REAL_CONTENT_MIGRATION.md`.
3. **CSS scroll-driven animation** runs in Chromium and Safari 26+. Elsewhere content shows
   statically, which is the correct degradation — verified: nothing is left invisible.
4. **Arabic interface strings need native review** (open question Q3-2). Phase 13 added three
   templates: `categoryMetaDescription`, `brandMetaDescription`, `formatMetaDescription`. Phase 12's
   seven additions are also still pending review.
5. **The 24px tap-target guarantee across every surface is verified by the browser sweep, not by the
   node suite.** A layout property cannot honestly be asserted from HTML alone, and a site-wide
   structural rule would produce false failures on the nine list shapes that are already compliant
   through their own styling. The node tests guard the primitive and the four repaired surfaces; the
   459-combination sweep covers the rest.
6. **LCP was not captured** by the measurement harness (the entry did not buffer). CLS of 0 and the
   LCP image's eager/high-priority/intrinsic-size attributes are offered as evidence instead.
7. **Browser testing was Chromium-only.** Safari and Firefox were not available in this environment.
   The degradation paths they exercise (no scroll-driven animation) were verified by disabling the
   feature, not by running those browsers.

## 15. Mock guard status

**Still failing, by design. Untouched.**

`git diff` on `tools/check-mock-guard.mjs` and on `content/` is empty. The guard was not bypassed,
weakened, or worked around, and no content gate was modified. `npm run guard:mock` reports:

> This build contains fabricated content and must not be deployed.

## 16. Final build result

`npm run build` — **85 pages, exit 0.** No errors. The only warning is Vite's standard chunk-size
notice for the intentionally large, intentionally lazy Three.js chunk.

`npx astro check` — **0 errors, 0 warnings, 0 hints.**

`validate:content` PASS · `validate:journal` PASS · `validate:contrast` PASS (37/37) ·
`validate:ux` PASS (30/30 a11y coverage, 0 anti-patterns).

## 17. Final test result

```
tests 490   suites 113   pass 490   fail 0   skipped 0   todo 0
```

## 18. Final page count

**85 pages** — unchanged. No route was added, removed or renamed.

## 19. Remaining launch blockers

**One, and it is content, not code:**

> The mock content layer must be replaced with verified client content. The release guard enforces
> this and must stay enforcing it.

Nothing else blocks. Specifically *not* blocking, but worth the client knowing before launch:
evidence photography will need to be supplied for the reserved review plates to fill, and the
Arabic interface strings should be read by a native speaker.

**Status: TECHNICALLY READY / CONTENT-GATED.**

## 20. Recommended next phase

**Phase 14 — Real Content Migration.** It is the only thing standing between this build and a
launch, and every other workstream is downstream of it:

1. Replace `content/mock/*` with verified records; the guard turns green on its own.
2. Supply evidence photography; the plates fill with no code change beyond `Frame.astro`.
3. Native Arabic review of the interface strings added in Phases 11–13.
4. Re-run this phase's audit harnesses against the real content — real titles and descriptions are
   longer than mock ones, and the uniqueness and length tests added here will be doing real work for
   the first time.
5. Confirm the production domain's DNS, TLS and redirect behaviour, then a Lighthouse run on real
   hardware to capture the LCP figure this environment could not.
