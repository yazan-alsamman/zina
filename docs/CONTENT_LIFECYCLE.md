# Content Lifecycle

**Status:** Phase 1 decision.

The lifecycle exists to make one outcome structurally impossible: fabricated or unverified content
reaching a reader. Everything else it does is secondary.

---

## 1. States

| State | Built? | Indexable? | Meaning |
|---|---|---|---|
| `mock` | **Never in production** | No | Fictional placeholder. Terminal — see section 3 |
| `draft` | No | No | Being written |
| `review` | Preview only | No | Ready for editorial review |
| `needs-verification` | Preview only | No | Written, but contains a fact not yet confirmed |
| `approved` | Preview only | No | Editorially approved, awaiting publication |
| `published` | **Yes** | **Yes** | Live |
| `archived` | **Yes** | Yes, with notice | Superseded or discontinued, kept for its inbound links |

```
publishableStates = ["published", "archived"]
```

Everything else produces no production route. Not a `noindex` page — **no page at all**. A page
that exists but is hidden is a page that can leak; a page that was never generated cannot.

---

## 2. Transitions

```
        draft ──> review ──> approved ──> published ──> archived
                    │            ▲            │             │
                    ▼            │            │             │
           needs-verification ───┘            └──> back to review (correction)
                                                     (updateLog entry required)

   mock ──> (deleted, replaced by a real record)      terminal, never promoted
```

| Transition | Gate |
|---|---|
| `draft → review` | All required fields present; validator passes |
| `review → needs-verification` | Any fact lacking a source: a statistic, a relationship, a press mention, a disclosure |
| `needs-verification → approved` | Every `_verification` on the record is `CONFIRMED`, or the unverified field is removed |
| `approved → published` | Disclosure is not `unknown-pending-verification`; media resolve; SEO fields present |
| `published → review` | A correction. Requires an `updateLog` entry with a date |
| `published → archived` | Product discontinued or content superseded. URL retained |
| `mock → anything` | **Forbidden.** Mock records are deleted and replaced, never promoted |

---

## 3. Why `mock` is terminal

The tempting shortcut is to edit a mock record in place — swap the fake bio for the real one, flip
`status` to `published`, done. That is exactly how a fabricated field survives: the reviewer sees a
plausible record and checks the fields that changed, not the fields that did not.

So `mock` cannot be promoted. Real content is authored in `content/real/` as new records, and the
mock layer is deleted wholesale. `mock-` id prefixes make any survivor obvious, and
`tools/check-mock-guard.mjs` makes it a build failure rather than a review finding.

---

## 4. Interaction with `_verification`

Two orthogonal axes:

- **`status`** — where the content is in the editorial process.
- **`_verification`** — whether the *facts in it* are confirmed.

| | `MOCK` | `NEEDS_VERIFICATION` | `CONFIRMED` |
|---|---|---|---|
| `mock` | The only valid mock combination | — | Name field only |
| `draft` / `review` | — | Normal | Normal |
| `needs-verification` | — | **The defining combination** | — |
| `approved` / `published` | **Impossible** | **Impossible** | Required |

**A record cannot be `published` while any `_verification` on it is `MOCK` or
`NEEDS_VERIFICATION`.** A field whose value is unconfirmed renders as nothing — it never falls back
to a placeholder.

---

## 5. Field-level gates that override status

Four gates block publication regardless of `status`, because each guards a specific fabrication
risk:

| Gate | Field | Rule |
|---|---|---|
| Disclosure | `disclosure.primary` | `unknown-pending-verification` can never be `published` |
| Testimonial | `approvalOnFile` | `false` renders nothing, in any status |
| Brand relationship | `relationship.status` | Not `CONFIRMED` means no relationship label renders |
| Results figure | `results.figures[].source` | No named written source means the figure is omitted |

These are render-time gates, not just publish-time gates. A `published` review whose disclosure is
later downgraded stops showing a disclosure badge and starts showing a pending state, rather than
silently continuing to show the old one.

---

## 6. Environment behaviour

| Environment | Builds | Indexable | Guard |
|---|---|---|---|
| Local dev | All states, including `mock` | n/a | Validator on demand |
| Preview / branch | `review`, `needs-verification`, `approved`, `published`, `archived` | **`noindex` site-wide** | Guard advisory |
| Production | `published`, `archived` only | Yes | **Guard blocking** |

**Every preview deployment is `noindex` site-wide, without exception.** An indexed preview
containing mock press mentions or an unverified brand relationship is a real problem and an easy one
to cause.

---

## 7. Automated enforcement

| Gate | When | Tool | Blocking |
|---|---|---|---|
| Schema, references, editorial rules | Pre-commit, CI | `tools/validate-content.mjs` | Yes |
| Mock-status check | Pre-commit, CI | validator (`status` must be `mock` in the mock layer) | Yes |
| No numeric ratings | CI | validator | Yes |
| Mock traces in build output | Build | `tools/check-mock-guard.mjs` | Yes in production, advisory on preview |
| Unpublishable status in output | Build | guard signature `"status": "mock"` | Yes |
| Human sign-off | Pre-launch | `docs/LAUNCH_CHECKLIST.md` | Yes |

`tools/check-mock-guard.mjs` scans for seven signatures: the file marker, the record marker, the
`mock-` id prefix, `"status": "mock"`, placeholder media paths, `.mock` handles and reserved
example domains, plus the literal `MOCK NAME`. Any one fails the build.

Verified in both directions during Phase 0 and re-verified in Phase 1.

---

## 8. Archiving

Reviews are evergreen and are corrected in place — that is what `updateLog` is for. Archiving is
for the narrow case where a product is discontinued and the page has no residual value.

An `archived` review:

- keeps its URL and its inbound links,
- stays indexable, with a visible dated notice,
- keeps its `updateLog`,
- is de-emphasised in indexes and excluded from related-content selection,
- is **never deleted**, because deleting a URL destroys accumulated authority for no benefit.

If a review is genuinely replaced by a full retest published as a new page, the old URL 301s to the
new one and the new page states what it replaced.

---

## 9. Migration mapping

When `content/real/` is created, the mock layer maps as follows:

| Mock record | Initial real status | Then |
|---|---|---|
| Person, Site | `needs-verification` | Confirm name, domain, contact, then `approved` |
| Method | `draft` | Zina's own method replaces the invented one, or she adopts it. Editorial decision, not a data task |
| Reviews | `needs-verification` | Disclosure must be actively confirmed per review before publication |
| Brands | `needs-verification` | `relationship.status` requires written evidence |
| Work | `needs-verification` | Results figures need named written sources or are dropped |
| Journal | `draft` | Authored fresh |
| Testimonials | Not migrated | Signed approval or the collection is deleted |
| Press | Not migrated | Verified live URLs or the collection and route are deleted |

Full procedure: `docs/REAL_CONTENT_MIGRATION.md`.
