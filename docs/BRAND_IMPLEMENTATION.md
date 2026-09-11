# Brand Implementation

**The brand entity surface: the per-locale gate, the relationship rule, and the facet transition.**

| | |
|---|---|
| **Status** | Implemented (Phase 7) |
| **Routes** | 9 — 2 indexes + 7 entity pages |
| **Gate** | `brands.json → indexGate`, per locale, unchanged from Phase 1 |
| **Relationship labels rendered** | **0** — none is CONFIRMED |
| **Structured data** | `BreadcrumbList` only |

---

## 1. What a brand page is

An **editorial entity page**. It answers one question:

> what documented records involve this entity, and on what terms?

It is not an advertisement, a storefront, a sponsorship page or a company profile. The clearest way
to hold that line is negative — here is what the template deliberately does not render:

founding year · headquarters · ownership · company history · awards · certifications · revenue ·
ethics claims · sustainability claims · clinical or dermatological claims · "official partner"
language · logos · product shots · buy links · ratings

`foundedYear` and `originCountry` **are on the record** and are still not rendered. They are
invented mock values about a fictional company, they are corporate-profile furniture rather than
editorial evidence, and rendering them would make this a company profile — the exact thing it must
not be. A test asserts their absence.

---

## 2. The gate — route existence, per locale

The rule is the content's own, from `brands.json → indexGate`:

> `(reviews >= 2) OR (reviews >= 1 AND work >= 1)`, **AND** an original description of ≥ 120
> characters, **AND** a logo asset. Evaluated per locale, because review coverage differs by
> language.

**No new threshold was invented.** `brandPassesGate()` has implemented this since Phase 4;
Phase 7 added `brandEntityExists()`, which composes it with template existence so the page and the
links pointing at it read one source.

### What the gate produces

| Brand | en | ar |
|---|---|---|
| `maison-eclat` | page | page |
| `lune-skin` | page | page |
| `atelier-noor` | page | page |
| `veloura-beauty` | **page** | **gated** |
| `terra-sana` | gated | gated |

**7 entity pages.** The `veloura-beauty` asymmetry is the most important property here: the same
company earns a page in English and not in Arabic, because it has two English reviews and one
Arabic one. Same record, different evidence, different answer. A single global gate would either
publish a thin Arabic page or suppress a substantial English one.

A gated brand's reviews remain fully reachable through `/reviews/` and the brand facet. **Gating
the entity page never hides evidence** — it withholds a thin page about the company.

---

## 3. Indexability is separate from existence

`brandIsIndexable()` is a different function from `brandEntityExists()`, and both compose with the
build-level gate:

```
robotsContent(IS_INDEXABLE_BUILD && brandIsIndexable(brand, locale), seo.noindex)
```

`indexPolicy: "force-noindex"` on a record suppresses indexation without removing the page. Every
brand page in this build is `noindex, follow`, because the source is mock.

---

## 4. The facet transition (Phase 5 → 7)

Phase 5 built brand **facets** (`/reviews/brand/{slug}/`) and deferred the entity. `brandDestination()`
was written then with both conditions already in place:

```ts
const gatePasses = brandPassesGate(brand, locale);
const brandPageExists = gatePasses && isImplemented("brand");
```

**Phase 7 changed no logic in that helper.** Registering `brand` in `IMPLEMENTED_ROUTES` flipped
the second condition, and every brand link across the site moved to the entity page in one step.

| Branch | Condition | Destination |
|---|---|---|
| A | gate passes **and** template exists | `/{locale}/brands/{slug}/` |
| B | either fails | `/{locale}/reviews/brand/{slug}/` |
| C | no records in this locale | `undefined` — nothing renders |

There is **exactly one destination per brand per locale**, asserted by a test that checks the two
branches are mutually exclusive and that the chosen one matches `brandEntityExists()`. Verified in
the build: the English Maison Eclat review links to `/en/brands/maison-eclat/`; the Arabic Veloura
review still links to `/ar/reviews/brand/veloura-beauty/`.

---

## 5. The relationship gate — the trust-critical rule

`content/schema/types.ts` states it:

> "status must be CONFIRMED before any relationship label renders."

Every brand carries `relationship.status: "MOCK"`. Therefore **no relationship label renders
anywhere in this build** — not "Campaign", not "Editorial", not "Product Testing", and above all
not a softened synonym like "partner" or "collaborator".

`relationshipLabel()` is the only way to read the type, and it requires **both** `status` and
`_verification` to be CONFIRMED. It returns `undefined` for every brand today.

### Why this is the most dangerous field on the site

Describing an unverified commercial relationship asserts a business arrangement with a company, on
that company's behalf, in public. Softening it is worse than stating it: "partner" implies a
relationship without saying which, and cannot be checked.

### The absence is stated, not left silent

A brand page with no relationship line reads as independence. Every page therefore renders:

> **How these products were obtained**
> 1 Paid partnership
> *No commercial relationship with this company has been confirmed in writing, so none is described
> here. The disclosure on each record above states how that specific product was obtained.*

---

## 6. Disclosure — what the page *can* say

The commercial relationship is unverified. **How each product was obtained is not** — it is
recorded and verified per review. So the page states a tally, taken verbatim from each review's own
`disclosureLabel`:

| Brand (en) | Tally |
|---|---|
| `maison-eclat` | 1 × Paid partnership |
| `veloura-beauty` | 2 × Bought independently |
| `lune-skin` | 1 × Gifted, unpaid |
| `atelier-noor` | 1 × Gifted, unpaid |

Labels are **never merged, softened or re-bucketed**. "Paid partnership" and "Gifted, unpaid" are
different facts; a combined "Partnership" count would erase the difference. A test asserts every
rendered label exists verbatim on a review and that the tally loses no record.

---

## 7. Claim vs observation

The brand's `positioning` and `description` are **original writing by the publication** — the
content model says so explicitly ("Original writing. Never the brand's own copy"). They are set as
editorial prose, not as a quoted claim.

**No brand marketing claim appears on this page at all.** The `CLAIM` device belongs on a review,
where an observation sits directly beneath it to answer it. A claim with no observation next to it
is an advertisement, so this page carries neither — asserted by a test that no `claim` device
markup exists on any brand page.

The page also repeats **no review fact of its own**: no verdict, observation, condition or plate.
Title, date and disclosure are read from the review record at render time, so there is exactly one
source of truth and the brand page cannot drift from the archive.

---

## 8. Relationships

| Edge | Source | Filter |
|---|---|---|
| Brand → Reviews | `review.entity.brandId` | renderable + locale |
| Brand → Journal | `article.related.brandIds` | renderable + locale |
| Brand → Work | `work.brandId` | renderable + locale + template exists |

Every link is a canonical id resolved to a route at build time. **Zero dead links**, asserted
across all 85 pages.

---

## 9. SEO

- Unique title and description per page, per locale — asserted
- Self-canonical
- **hreflang follows the GATE, not the record.** `veloura-beauty` in English emits no `ar`
  alternate, because no Arabic page exists. Pointing hreflang at a suppressed page would advertise
  a 404 as a translation.
- The language **switcher** still offers Arabic on that page, landing on `/ar/brands/` with
  `data-switcher-state="section-fallback"`. A switcher link is navigation the reader chose; an
  alternate is a claim to a search engine. Only the second would be false.

### Structured data: `BreadcrumbList` only

| Refused | Reason |
|---|---|
| `Organization` | Every field that would populate it (legal name, founding date, address, logo, sameAs) is invented mock data or absent. An Organization built from invented data asserts a company exists. |
| `Brand` | Needs a verified identity to attach to. |
| `Product`, `offers` | Not a storefront. |
| `aggregateRating`, `reviewRating` | Nothing is scored. |
| `sameAs` | No profile is verified. |

---

## 10. Design

The **index treatment**, a third time: hairline, type, and nothing else. `BrandEntry.astro` shares
its vocabulary with `ReviewEntry` and `JournalEntry` so the archive, the journal and the brand
index read as one publication rather than three products. No Card, radius 0, no shadow.

**The logo is deliberately absent from the index.** Every logo path in the corpus points at an
asset that does not exist, and a row of brand logos is the visual grammar of a sponsor page.

The relationship band uses the same surface treatment as the review's disclosure band and the
Method's boundary: all three are statements about the limits of what this site can assert.

---

## 11. Known limits

- `terra-sana` has no page in either locale; `veloura-beauty` none in Arabic. Correct, per the gate.
- Brand **relationship types are all unconfirmed**, so the relationship band is currently identical
  in structure on every page.
- Brands are **not in the primary navigation** — a Phase 1 IA decision, unchanged: brands are
  reachable from every review and from the reviews index, and two of five do not qualify in at
  least one locale.
- Arabic brand copy is **unreviewed by a native reader** (standing item H-1).
