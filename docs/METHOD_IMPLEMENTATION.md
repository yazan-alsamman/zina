# Method Implementation

**Status:** Phase 5. Routes: `/en/method/`, `/ar/method/`.

The trust moment in every user flow, and the destination of the most-repeated internal link on
the site.

---

## 1. PROJECT MOCK METHOD — the constraint that governs the page

The six stages were drafted in Phase 0. **They have not been confirmed as Zina Almokri's
practice.**

The page must never read as a verified, proprietary, clinical, medical, laboratory, certified,
accredited or proven methodology. Five mechanisms enforce that, and only the first is copy:

| # | Mechanism | Where |
|---|---|---|
| 1 | An explicit notice, in both locales, **above the stages** | `projectMockMethodNotice` in `ui-strings.ts` |
| 2 | The record's own `boundaryStatement`, rendered before the stages | content model |
| 3 | `_verification: "MOCK"` — cannot reach a publishable state | `content.ts` lifecycle |
| 4 | `__MOCK_DATA__` marker on every page → **build failure** | `check-mock-guard.mjs` |
| 5 | A test asserting the page makes no clinical claim | `tests/surfaces.test.mjs` |

The English notice:

> **PROJECT MOCK METHOD.** This six-stage protocol was drafted for this project and has not been
> confirmed as Zina Almokri's practice. It is not a verified methodology, and nothing here is
> clinical, medical or laboratory testing.

Test 5 scans the rendered text for `clinically proven`, `clinically validated`, `medically
validated`, `scientifically validated`, `lab-tested`, `laboratory tested`, `certified`,
`accredited`, `proprietary`, `dermatologist approved` — in both locales. All absent.

**The notice is placed before the stages, not after.** A reader should meet the limit before they
invest in the protocol, not discover it in a footnote afterwards.

---

## 2. The page's argument

A sceptic is not persuaded by a process diagram. They are persuaded by someone volunteering what
their process **cannot** establish.

So `doesNotProve` renders at **identical visual weight** to `purpose`: same family, same size,
same colour, same measure. The only difference is a hairline above it and a label.

**This is enforced by construction, not by discipline.** Both use the same `.stage-purpose` class.
There is deliberately no second class that could be given a smaller size, and
`tests/surfaces.test.mjs` asserts that all six `doesNotProve` blocks use it. If one ever acquires
a quieter class or a `<details>` wrapper, the test fails and the page's argument has been
inverted.

---

## 3. Structure

```
h1   name                        The Six-Stage Test / الاختبار في ست مراحل
     tagline
     introduction

h2   WHAT THIS IS                the boundary block — clay rule, paper grain
       boundaryStatement           same surface treatment as the review disclosure band,
       PROJECT MOCK METHOD notice  deliberately: both are statements about limits of authority

h2   THE SIX STAGES              an ORDERED list — the order is meaning
  01 h3 Baseline
       purpose
       h4 What is observed  ·  h4 What is recorded     two columns at 768+
       ─────────────────────────────────────────
       h4 WHAT THIS STAGE DOES NOT PROVE               identical weight to purpose
       h4 Reviews that used this stage                 derived from the content model
  02 … 06

h2   WHAT THIS CANNOT TELL YOU   inset well, five entries

     editorial byline
     → all testing records
```

All six stages render in the canonical `stageOrder` from the record, not in authoring order.
Each carries `id={stage.key}` with `scroll-margin-top`, so `/method/#conditions` from any review
lands correctly beneath the header.

---

## 4. Method → Review, derived not invented

The relationship already exists in the content model: `review.testing.methodStageKeys`. Each stage
lists the reviews **in this locale** that ran it.

A stage nobody has used yet renders no block at all — the protocol is not defined by what has been
published.

**No relationship was fabricated.** The finer link the Phase 5 brief mentions — stage → *specific
evidence within* a review — is supported by the model (`EvidenceAsset.stageKey`) but is not
rendered here, because the Method page linking into a specific plate of a specific review would
be a claim about representativeness that nothing in the data supports. Recorded as a limitation
rather than invented.

---

## 5. What the design refuses

Not: scientific instrumentation, a medical dashboard, lab software, a SaaS process diagram, a
startup infographic, a funnel, a numbered marketing sequence.

Concretely absent, and asserted in tests: `<progress>`, `<meter>`, `role="progressbar"`,
`IntersectionObserver`, animated counters, gauges, scroll animation.

What it is instead: an **ordered list with a strong reading rhythm**, the stage number set in the
margin index at 1024+ exactly as on the review page, mineral square markers on the observation and
evidence lists, and hairlines doing the separating.

---

## 6. JSON-LD entity safety

**BreadcrumbList only.**

| Refused | Why |
|---|---|
| `HowTo` | Asserts a repeatable procedure a reader can follow to obtain a result — precisely the claim an unverified method must not make |
| `MedicalEntity`, `MedicalProcedure` | Zina is not a clinician and this is not a medical procedure |
| `Organization` | There is no verified organisation |
| `Course` | It is not instruction |
| Any credential on `Person` | None is verified |

Asserted in `tests/surfaces.test.mjs`.

---

## 7. Bilingual

Required in **both** locales — the validator fails the build otherwise, because a bilingual site
whose core differentiator exists in one language is not bilingual.

| | |
|---|---|
| Stage numbers | `<bdi dir="ltr">01</bdi>` — isolated numerals, correct in RTL |
| Stage keys | English and internal, so `#conditions` anchors are stable across locales |
| Stage names | Localised — `الأساس المرجعي`, `التطبيق`, `مدة الثبات` … |
| Margin index | Right in Arabic, from logical properties alone |
| Boundary statement | The most important Arabic passage on the site after the disclosure statements. **Flagged for native review** (Q3-2) |

---

## 8. Performance and verification

| | en | ar |
|---|---|---|
| HTML | 24.3 KB | 27.6 KB |
| **JavaScript** | **0 bytes** | **0 bytes** |

Browser verification: five widths × two locales — **10 checks, all clean**. No overflow, no
clipping, no reversed ranges, no Arabic tracking, no floor violations, one `h1`, no heading skips.
