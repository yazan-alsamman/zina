# Editorial Standards Implementation

**How the publication represents evidence — and why this is a different page from the Method.**

| | |
|---|---|
| **Status** | Implemented (Phase 7) |
| **Routes** | 2 — `/{locale}/editorial-standards/` |
| **Standards published** | 5, verbatim from `site.json` |
| **Approved by their subject** | **No** — stated on the page |
| **Structured data** | `BreadcrumbList` only |

---

## 1. The distinction from the Method

These are adjacent surfaces answering different questions, and merging them would lose both.

| | Method | Editorial Standards |
|---|---|---|
| **Route** | `/{locale}/method/` | `/{locale}/editorial-standards/` |
| **Answers** | How is a product observed and tested? | How does this publication handle evidence, disclosure, corrections and claims? |
| **Audience moment** | Evaluating a single review | Deciding whether to trust the publication |
| **Unit** | The six stages of a testing record | The behaviour of the publication as a whole |

**The distinction is stated on the page itself, first**, in a band above everything else:

> The Method explains how a product is observed and tested. This page explains how the publication
> represents that evidence: what is disclosed, how errors are corrected, and what the observations
> do not prove. If you came here to read how testing works, the Method is the page you want.

A reader who wants "how do you test?" should leave immediately rather than read this page and find
it answers a different question. Each page links to the other; neither restates the other's
content.

---

## 2. The five standards come from the record

Every statement is read verbatim from `site.json → editorialStandards`. **Nothing is composed in
the template** — a standards page that invents its own standards is the exact failure it exists to
prevent. A test asserts each rendered statement appears verbatim in the record.

| Order | Key | Subject |
|---|---|---|
| 1 | `disclosurePolicy` | Commercial status above the content; paid placements never come with agreed verdicts |
| 2 | `correctionsPolicy` | Errors corrected in place, with the change and date recorded |
| 3 | `ratingsPolicy` | No numeric scores — a number hides the reason, and the reason is the product |
| 4 | `aiPolicy` | Written from first-hand testing; observations, photographs and verdicts are not generated |
| 5 | `medicalBoundary` | Nothing here is medical, clinical or dermatological advice |

**Disclosure is first** — it is the one a reader most needs before reading a review, and the one
this publication will most often be judged on. The order is a named constant (`STANDARD_ORDER`),
not authoring order.

---

## 3. The standards are proposed, not adopted

The record carries `_verification: "MOCK"` with its own note:

> "Proposed standards, not Zina's stated positions. Each must be approved before publication."

`standardsAreApproved()` returns `false`, and the page renders a notice **above the statements**:

> These standards are proposed, not adopted. They were drafted during development and have not been
> reviewed or approved by Zina Almokri. They describe intended practice and should not yet be
> relied on as a published commitment.

This is the one place where rendering unverified content is right rather than wrong: the statements
are *about the publication's intended behaviour*, they are checkable against the site itself, and a
standards page with no standards would be pointless. What matters is that their status is stated
where it cannot be missed.

---

## 4. What this publication does not do

A dedicated section, at **the same visual weight as the standards themselves**. The Method page
makes the same move with `doesNotProve`, for the same reason: a sceptic is persuaded by someone
volunteering their limits, not by a longer list of commitments.

- No laboratory testing is performed, and no independent laboratory verifies any result published here.
- Nothing published here is peer reviewed, scientifically validated, or reviewed by any external body.
- No medical or dermatological professional reviews this content, and none of it is clinical advice.
- Every observation is one person's experience of one unit of a product, in the conditions recorded
  with it. It is not a claim about how the product behaves for anyone else.

The last one is the most important and the least common. A single-unit, single-person observation
is the actual epistemic status of everything on this site.

**The limits are never hidden in a `<details>`** — asserted by test.

---

## 5. Claims this page must never make

Asserted absent **outside the limits section** (the page may deny them there; it may not assert
them anywhere):

peer review · laboratory · lab-tested · clinically proven · regulatory · accredited · "compliant
with" · ISO · editorial board · ombudsman · independently verified · scientifically validated

The page makes the publication more trustworthy **without pretending to be a regulated
institution**. There is no editorial board, no named editor other than Zina, no ombudsman and no
external review, and the page claims none.

---

## 6. Only processes that actually exist

Each of the five standards describes something the implementation can actually do today:

| Standard | Backed by |
|---|---|
| Disclosure | The disclosure band renders above the content on every review — verified in the build |
| Corrections | `dates.updatedAt` and the update log exist on the review schema |
| Ratings | No rating schema or scored markup exists anywhere — asserted site-wide |
| Authorship | No generated content; MDX bodies are migrated, hand-marked prose |
| Medical boundary | `EditorialNote kind="boundary"` makes it structural on the routine article |

No process is promised that the site cannot perform.

---

## 7. Structured data

`BreadcrumbList` only.

| Refused | Reason |
|---|---|
| `Organization` + `publishingPrinciples` | The property asserts a publisher entity exists and has adopted them |
| `NewsMediaOrganization` | Asserts an institution |
| `ethicsPolicy`, `correctionsPolicy` markup | Same — these are organisation properties |

Marking up unapproved drafts as an organisation's adopted policies would be a stronger claim than
anything on the visible page.

---

## 8. Onward links

| Link | Why |
|---|---|
| Reviews | "Every record carries its disclosure above the content" — see it applied |
| Method | "The six stages a record is built from" |

Both invite verification rather than asking for trust.

---

## 9. Known limits

| Limit | Status |
|---|---|
| The standards are unapproved drafts | **Owner must review and approve each** |
| No corrections have occurred yet | The policy is stated; the log is empty |
| Arabic copy | Unreviewed by a native reader (H-1) |
| The Method it distinguishes itself from | **PROJECT MOCK METHOD** — also unconfirmed |
