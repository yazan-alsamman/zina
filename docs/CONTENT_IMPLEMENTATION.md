# Content Implementation

**Status:** Phase 4.

How the Phase 1 content architecture became running code, and how the mock/verified boundary is
enforced by the pipeline rather than by anyone remembering it.

---

## 1. The schema was not rewritten

`content/schema/types.ts` — 493 lines, framework-agnostic, written in Phase 1 and enforced by
`tools/validate-content.mjs` — **is the schema**. `src/lib/content.ts` re-exports it.

**Why this matters.** The idiomatic Astro 5 approach is `src/content/` collections with zod
schemas and a `file()` loader. It was rejected (decision D4-2) because it would create a second
definition of `Review` alongside the first, validated by a second validator alongside the existing
one. Two schemas drift. The drift would be silent, and the copy owned by the newest code would win
by accident.

**The one addition:** `src/types/site.ts` narrows five fields the Phase 1 schema deliberately left
as `unknown` (`navigation`, `seoDefaults`, `contact`, `legal`, `editorialStandards`). Those shapes
were still being decided in Phase 1, and a wrong type is worse than no type. They are narrowed in
exactly one place — `navigation()` and `seoDefaults()` in `content.ts` — so there is a single cast
to audit rather than one per template, and `tests/content.test.mjs` asserts the data matches.

---

## 2. Lifecycle

All seven states are preserved. None was flattened.

```
draft --> review --> approved --> published --> archived
            |                          ^
   needs-verification ------------------

mock --> TERMINAL. Never promoted. Deleted and replaced.
```

| State | Built in production | Built in preview | Indexable |
|---|---|---|---|
| `mock` | **Never** | Yes, while the source is the mock layer | No |
| `draft` | No | **No** | No |
| `review` | No | Yes | No |
| `needs-verification` | No | Yes | No |
| `approved` | No | Yes | No |
| `published` | **Yes** | Yes | **Yes** |
| `archived` | **Yes** | Yes | Yes, with a dated notice |

**Enforced in `src/lib/content.ts`, not in templates.** `available()` filters by renderability and
locale before any record reaches a page, so a template cannot accidentally render a draft — a
draft never arrives.

A preview build is **`noindex` site-wide, without exception**, and renders with **no visual
difference** from production. A preview should show what the page will look like, not a decorated
draft.

---

## 3. DEVELOPMENT MOCK versus VERIFIED CONTENT

**The distinction the whole pipeline is built around.**

| | DEVELOPMENT MOCK | VERIFIED CONTENT |
|---|---|---|
| Location | `content/mock/` | `content/real/` (does not exist yet) |
| `status` | `mock` | `draft` → … → `published` |
| `_verification` | `MOCK` | `CONFIRMED` |
| Ids | `mock-` prefix | no prefix |
| Reaches production | **Never — build failure** | Yes, when published |
| Switch | `CONTENT_SOURCE` in `src/lib/content.ts` | one constant |

### Four independent mechanisms stop mock content shipping

1. **`mock` is not a publishable state.** `PUBLISHABLE_STATES` is `["published", "archived"]`.
2. **`mock` is terminal.** Real content is authored as new records; the mock layer is deleted
   wholesale. Editing a mock record in place and flipping its status is precisely how a fabricated
   field survives review, so the lifecycle forbids the promotion rather than discouraging it.
3. **Markers survive rendering.** Nothing in the access layer strips `_mock`, `status` or
   `_verification`.
4. **Every page carries a machine-detectable marker.** `BaseLayout` emits the literal
   `__MOCK_DATA__` inside an HTML comment while the source is the mock layer.

Mechanism 4 was added because mechanisms 1–3 were **not sufficient**. Before it, the guard caught
the mock build only because the mock brands happen to use `example.com` URLs — an incidental
property of the content, not a property of the build. The day someone gave a mock brand a
realistic URL, a mock build would have passed the guard silently.

**Verified in both directions:**

| Run | Result |
|---|---|
| `node tools/check-mock-guard.mjs dist` | **BLOCKED**, 22 traces, exit 1 — correct |
| Same page with the mock marker and example URLs removed | **CLEAN**, exit 0 — correct |

The second run proves the guard detects the **content source**, not the templates.

### The visual treatment of mock content

**There is none, deliberately.** No badge, no ribbon, no watermark. A "mock" badge would imply
that mock content can ship as long as it is labelled, and it cannot. The marker is an HTML
comment, and `tests/output.test.mjs` asserts it stays one.

---

## 4. The hard render gates

These override lifecycle status entirely, because each guards a specific fabrication risk. They
are **render-time**, not publish-time: a published review whose disclosure is later downgraded
stops showing the old badge immediately.

| Gate | Field | Rule | State today |
|---|---|---|---|
| Disclosure | `disclosure.primary` | `unknown-pending-verification` can never publish | All six states present in the corpus |
| Testimonial | `approvalOnFile` | `false` renders nothing, in any status | **None qualifies. No component exists** |
| Brand relationship | `relationship._verification` | Not `CONFIRMED` → no relationship label | All `MOCK` — nothing renders |
| Results figure | `results.figures[].source` | No named written source → figure omitted | Not on the review page |
| Social `sameAs` | `sameAsEligible` | `false` → not rendered | **All five false. The footer social row does not exist** |
| `VerifiableValue<T>` | `_verification` | Renders as nothing, never a guess | `person.location` is `MOCK` → absent from the page **and from the schema** |

Every one is covered by `tests/content.test.mjs`.

---

## 5. Locale

**A record exists in a locale because someone authored it there.** `locales` is a partial map and
an absent key is the representation of "no version exists" — never "translate later".

```ts
existsInLocale(record, "ar")   // Boolean(record.locales.ar)
localesOf(record)              // ["en"] | ["ar"] | ["en", "ar"]
available(records, locale)     // renderable AND present in this locale
```

Current coverage, deliberately uneven so every state is exercised:

| Collection | en | ar | Total | Note |
|---|---|---|---|---|
| Reviews | 5 | 5 | 6 | 1 English-only, 1 Arabic-original |
| Journal | 5 | 5 | 6 | 1 Arabic-original with no English equivalent |
| Work | 4 | 3 | 4 | The English-only case study is what gates the Arabic Veloura brand page |
| Brands | 5 | 5 | 5 | Gating differs by locale |
| Method, Person | 1 | 1 | 1 | Required in both — the validator fails otherwise |

---

## 6. The gates that decide whether a page exists

### Brand index gate — computed per locale

```
(reviews >= 2) OR (reviews >= 1 AND work >= 1)
AND description length >= 120
AND a logo exists
```

Implemented as `brandPassesGate(brand, locale)`. `indexPolicy` may override with `force-index` /
`force-noindex`.

| Brand | en | ar |
|---|---|---|
| Maison Eclat | passes | passes |
| Veloura Beauty | passes | **gated** — 1 review, 0 localised work |
| Lune Skin | passes | passes |
| Atelier Noor | passes | passes |
| Terra Sana | **gated** | **gated** |

**THE SINGLE IMPLEMENTATION RULE, and the mitigation for risk R-14:** every brand link is a
function of this gate, evaluated at build time in the current locale. No template assumes a brand
page exists. When the gate fails, the brand name links to `/{loc}/reviews/?brand={slug}` instead —
and **nothing signals that a page was withheld**.

`tests/output.test.mjs` asserts no page in `dist/` links to a gated brand page, in either locale.

### Journal category gate

3+ published articles per locale. **None qualifies** — the category label renders as text, not a
link, and nothing signals a pending page.

---

## 7. Related content

**Locale filtering happens before the count is taken.** A related link never crosses languages
silently, and a filtered-out item never leaves a hole: the group renders at the layout its
remaining count deserves, and a group with nothing in it is removed entirely.

```ts
relatedReviews(review, locale)   // resolved → renderable → present in THIS locale
```

Asserted for every review in both locales by `tests/content.test.mjs`.

---

## 8. Migration to verified content

When `content/real/` is created:

1. Author real records as **new files**. Do not edit the mock layer.
2. Point `CONTENT_SOURCE` at the new directory — one constant.
3. Delete `content/mock/` wholesale.
4. `npm run guard:mock` flips from BLOCKED to CLEAN — **and that flip is the release gate**.

Per-collection expectations are unchanged from `docs/CONTENT_LIFECYCLE.md` §9. Two need naming
again:

- **Disclosure must be actively confirmed per review** before publication.
  `unknown-pending-verification` is the import default precisely because fabrication risk is
  highest at migration.
- **The Method is a PROJECT MOCK METHOD** until Zina confirms or replaces it
  (`docs/METHOD_UX.md` §2). No copy in the implementation describes it as official, proprietary,
  clinical, validated, certified or proven, and the guard keeps `mock-method-six-stage` out of any
  shippable build.
