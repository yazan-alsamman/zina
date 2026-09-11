# Content Model

**Status:** Phase 0 proposal. Not frozen. Field names may change in Phase 1.
**Implementation:** `content/schema/types.ts` (portable TypeScript, zero dependencies)
**Mock instance:** `content/mock/*.json`
**Validator:** `node tools/validate-content.mjs`

---

## 1. Design principles

Four rules shaped every entity below.

**Content never lives in components.** A component receives a `Review` and renders it. It does
not know what a review says. This is what makes the mock-to-real migration a data swap rather
than a rewrite.

**Provenance is a field, not a convention.** Every record carries `_verification`
(`CONFIRMED` / `NEEDS_VERIFICATION` / `MOCK`). A renderer can therefore refuse to display an
unverified value, and a build can refuse to ship one. `docs/CONTENT_VERIFICATION_MATRIX.md`
becomes machine-readable rather than a document someone remembers to read.

**Claims are structurally separated from observations.** `Product.brandClaims` holds marketing
language. `Review.observations` holds what Zina saw. `Review.verdict` holds opinion. Nothing in
the model lets a template blur them, because they are different fields of different types on
different entities. This is the single most important decision in the model: it is what makes
the site credible, and it is also precisely what Google's reviews system rewards.

**Relationships are ids, never embedded copies.** A review references a product id; it does not
contain a product. The internal-link graph is therefore derivable, and the validator can prove
there are no orphans and no dangling references before a page is ever built.

---

## 2. Entities

### 2.1 Person

One record. Drives `/about`, the homepage, every byline, and `Person` structured data.

| Field | Type | Notes |
|---|---|---|
| `name` | `{latin, arabic, display}` | The only `CONFIRMED` content in the project |
| `professionalTitle` | LocalisedText | Positioning line, en + ar |
| `tagline` | LocalisedText | Short brand statement |
| `location` | VerifiableValue&lt;string&gt; | Nullable. Affects dialect targeting and climate claims |
| `bios.homepageIntro` | LocalisedText | ~20 words |
| `bios.short` | LocalisedText | ~35 words, cards and meta |
| `bios.long` | LocalisedText | ~200 words, `/about` |
| `bios.editorialByline` | LocalisedText | ~40 words, appended to every article |
| `bios.collaboration` | LocalisedText | ~90 words, `/contact` and press kit |
| `expertise[]` | label + detail | Specific competencies, not adjectives |
| `philosophy` | statement + principles[] | Editorial position |
| `testingProtocol` | named stages[] | See below |
| `images` | Record&lt;string, ImageAsset&gt; | Portrait, editorial, working, OG |

**Five bios, not one.** A bio that works on a homepage does not work as a byline or in a press
kit. Storing one and truncating it produces the generic voice that makes creator sites feel
templated.

**`testingProtocol` is the most valuable field in the model.** A named, published, repeatable
method is what separates a review site from an opinion blog. It supplies the `/journal/how-i-test-beauty-products`
pillar page, a proof module on every review, and the strongest available E-E-A-T signal.

### 2.2 SocialProfile

| Field | Notes |
|---|---|
| `sameAsEligible` | **Hard gate.** `false` until the client confirms the account is official. Only `true` profiles may enter schema.org `sameAs`. The validator fails the build if any mock profile sets it `true`. |
| `followers.asOf` | **Required.** A follower count without a date is not a fact; it is a number that was once true. |
| `role` | What the channel is actually for. Prevents the undifferentiated icon row. |

### 2.3 Brand

| Field | Notes |
|---|---|
| `relationship.type` | Product Testing / Campaign / Editorial / UGC / Beauty Feature |
| `relationship.status` | Must be `CONFIRMED` before any relationship label renders |
| `productIds`, `reviewIds`, `workIds` | Outbound graph edges |
| `identity.accentColor` | Lets a brand page take on a restrained brand tint without bespoke CSS |

A brand whose `relationship.status` is not `CONFIRMED` can still appear on the site as a brand
whose products were reviewed. It cannot appear as a client, partner, sponsor or collaborator.
The model enforces the distinction the master spec asks for in section 7.

### 2.4 Product

Separate from Review on purpose. One product can accumulate several reviews over time (original,
reformulation, long-term revisit), and a product may be tested but not yet written up
(`testingStatus: "Tested"`, `reviewStatus: "Draft"`), which is a genuinely useful state for a
"currently testing" module.

`brandClaims[]` holds only quoted marketing language. `_brandClaimsNote` on each record reminds
the implementer that these must render visually distinct from observations.

### 2.5 Review

The core entity. Structure mirrors the master spec section 6 and Google's reviews guidance.

```
disclosure      type, label, statement, position: "above-content"   (always above)
testing         wearWindow, timesTested, shadeUsed, applicationMethod,
                conditions[], comparedAgainstProductIds[], baselinePhotographed
observations[]  at ("Hour 6") + aspect + note        <- what was seen
results         synthesis of observations             <- still reporting
pros[] cons[]
suitability     suitsWell[] / mayNotSuit[]            <- both required
verdict         summary, rating, wouldRepurchase, bestFor   <- the only opinion field
dates           testedFrom, testedTo, publishedAt, updatedAt
updateLog[]     date + note, for every revision
related         reviewIds, journalIds, workIds
```

Validator-enforced rules:

- at least 3 observations
- both `pros` and `cons` non-empty
- both `suitsWell` and `mayNotSuit` non-empty (a review that cannot name who a product does not
  suit has not finished testing it)
- `disclosure.position` is `above-content` and cannot be configured downward
- `updatedAt >= publishedAt >= testedTo`
- no medical or clinical language
- no absolute suitability claim ("suits everyone", "for all skin types")
- no self-referential related links

**Open question for Phase 1:** whether to publish numeric ratings at all. `verdict.rating` is
nullable. Numbers make comparison and card design easy and flatten a nuanced verdict; they also
create structured-data obligations. Decide once, before 40 reviews exist.

### 2.6 Work

`results.figures[]` requires a named `source` per figure, and an empty `figures` array is a valid,
complete state. Real clients frequently supply no numbers, and the template must look intentional
when that happens rather than looking broken. The validator rejects any figure without a source.

### 2.7 JournalArticle

`type` is `Pillar` or `Supporting`, which makes the topic-cluster architecture in
`docs/SEO_MASTER_STRATEGY.md` section 2 a property of the data rather than a diagram in a
document. Supporting articles link up to a pillar; pillars link down.

### 2.8 PressItem and Testimonial

The two highest-risk collections. `Testimonial.approvalOnFile` is a hard gate: no quotation
renders without a signed approval. Mock testimonial attribution is the literal string
`MOCK NAME` rather than an invented human name, because an invented name attached to a plausible
role at a plausible company is exactly the failure this layer exists to prevent.

---

## 3. Content type coverage against the brief

| Required by brief | Entity | Status |
|---|---|---|
| Person / profile | `Person` | Modelled, 1 mock record |
| Product | `Product` | Modelled, 6 mock records across 6 categories |
| Review | `Review` | Modelled, 6 mock records |
| Brand | `Brand` | Modelled, 5 mock records |
| Work / collaboration | `Work` | Modelled, 4 mock records |
| Journal | `JournalArticle` | Modelled, 6 mock records (2 pillar, 4 supporting) |
| Social profiles | `SocialProfile` | Modelled, 5 mock records |
| Statistics | `SocialProfile.followers` | Modelled with mandatory `asOf` |
| Press / awards | `PressItem` | Modelled, 4 mock records |
| Testimonials | `Testimonial` | Modelled, 3 mock records, approval-gated |
| Contact | `site.contact` | Modelled, with nullable phone and agency |
| Images | `ImageAsset` / `MediaAsset` | Modelled with required alt, width, height |
| SEO metadata | `SeoFields` | Modelled per record |
| Site config, nav, legal, i18n | `site` | Modelled |

---

## 4. What is deliberately not modelled yet

- **Comments or ratings from readers.** Would change the structured-data picture significantly
  and has moderation cost. Out of scope until the client asks.
- **Newsletter subscribers.** Listed as a secondary conversion in the master spec but with no
  platform decided. Adding a field now would prejudge that.
- **Shoppable / affiliate links.** Requires a disclosure model of its own and an FTC-style
  compliance position. Must be a deliberate client decision, not a schema default.
- **Video as a first-class entity.** Currently `MediaAsset` on a review. If Zina publishes
  standalone video, it needs its own entity with `VideoObject` schema.
