# SEO / UX Integration

**Status:** Phase 3 decision. **This is UX architecture, not SEO implementation.** Structured data,
sitemaps and metadata are implemented in Phase 8.

**The governing rule: every link must make sense to a human reader first.** No link exists on this
site for a crawler. Where a link serves both, that is stated; where a link would serve only search,
it is not built.

---

## 1. What UX owes the SEO architecture

| Phase 1 SEO requirement | The UX mechanism that delivers it |
|---|---|
| Method accumulates authority from every review | **Method stage markers** on every review — the most-repeated internal link on the site |
| Reviews are reachable without the sitemap | **Facets as crawlable server-rendered URLs**, not client state |
| Journal articles support their claims | **Contextual in-prose links** to the review that evidences each claim |
| Brand pages aggregate rather than duplicate | The **index gate**, and brand links that are a function of it |
| Products do not cannibalise their own reviews | **No product route.** Product data renders inside the review |
| Locale variants are not duplicates | **Independent authoring**, per-locale slugs, no stub routes |
| Important content is indexable | **Nothing meaningful is behind an interaction** — no accordions, no tabs, no tooltips, no lightboxes |
| Breadcrumbs generate `BreadcrumbList` | Breadcrumbs **mirror the URL path exactly** |
| No fabricated rich results | **No rating field exists**; the validator fails the build on one |

---

## 2. Breadcrumb hierarchy

```
/{loc}/                        (no breadcrumb — it is the root)
/{loc}/about/                  Home / About
/{loc}/method/                 Home / Method
/{loc}/reviews/                Home / Reviews
/{loc}/reviews/{slug}/         Home / Reviews / {title}
/{loc}/brands/                 Home / Brands
/{loc}/brands/{slug}/          Home / Brands / {name}
/{loc}/work/                   Home / Work
/{loc}/work/{slug}/            Home / Work / {title}
/{loc}/journal/                Home / Journal
/{loc}/journal/{slug}/         Home / Journal / {title}
/{loc}/editorial-standards/    Home / Editorial standards
/{loc}/contact/                Home / Collaborate
```

**The rule that constrains the UX: a breadcrumb must never name a page that does not exist.**

- A review's breadcrumb is `Home / Reviews / {title}`, **not** `Home / Reviews / Foundation /
  {title}`, until category routes are built.
- An article's breadcrumb does not include its journal category until that category passes its
  3-article gate.
- Both are checked at build time from the same gate data the router uses.

**Derived from the route path**, so `BreadcrumbList` markup needs no separate hierarchy definition
and cannot drift from the URL.

---

## 3. Internal-link placement

Two kinds, both required.

### Contextual — inside prose

The strongest signal and the least automatable. **Rule: when an article states a finding that a
review demonstrates, the finding links to the review in the sentence**, not only in a block at the
bottom.

| From | To | Placement |
|---|---|---|
| Journal article | The review that evidences a claim | **In the sentence making the claim** |
| Review introduction | `/method/` | Where the testing approach is first referenced |
| Review conclusion | The comparison product's review | Where the comparison is discussed |
| Method stage | The reviews that used it | After the stage's `doesNotProve` |
| About | `/method/` | Where her approach is described |

**Anchor text names the finding, not the product.** *"most bases end the day one step shinier"* is a
better anchor than *"Voile Lumiere Skin Tint review"* — it is what a human would click, and it tells
a crawler what the target is about more honestly than a repeated product name would.

### Modular — generated from relationship arrays

Guarantee a floor of connectivity; carry less weight than contextual links.

| From | To | Count | Source |
|---|---|---|---|
| **Review** | **Method** | 1 | `testing.methodStageKeys` — **mandatory** |
| Review | Brand | 1 | `entity.brandId` — **if the gate passes in this locale** |
| Review | Related reviews | 2 | `related.reviewIds` |
| Review | Related journal | 2 | `related.journalIds` |
| Review | Related work | 0–1 | `related.workIds` |
| **Journal** | Reviews it evidences | 1–3 | `related.reviewIds` — **mandatory** |
| Journal | Method stage anchor | 1 | `related.methodStageKeys` |
| Journal | Sibling / pillar articles | 2 | `related.journalIds` |
| **Brand** | Its reviews | all in locale | `reviewIds` |
| Brand | Its work | all in locale | `workIds` |
| **Work** | The independent review of the same brand | 0–n | `relatedReviewIds` — **mandatory where one exists** |
| Work | Contact | 1 | — |
| **Method** | Representative reviews | 2–4 | featured |
| **About** | Method | 1 | `methodId` — **mandatory** |

**A page with only modular links is connected but not explained; a page with only contextual links
is fragile, because prose changes.** Both are needed.

---

## 4. The three highest-value links

1. **Every review → Method.** The most-repeated internal link on the site. It is what turns a
   scattered set of reviews into a body of work with a named approach, and it is the mechanism by
   which the Method page accumulates authority. **UX carrier:** the stage markers, which a human
   reads as *"which parts of the protocol did this test run"* — a link that would exist even if
   search engines did not.

2. **Journal article → the review that evidences it.** Converts an informational visitor into a
   reader of high-intent content and gives the article's claims a citation. **UX carrier:** the
   contextual in-prose link.

3. **Work case study → the independent review of the same brand.** Rare, deliberate, and the
   decision moment for audience B. **UX carrier:** a named block, not a related-content cell, because
   its meaning is *"here is the review of this brand that I did not get paid for."*

---

## 5. Related-content placement

| Rule | Reason |
|---|---|
| **After 128px** — the largest gap on the page | The reader must know the article has ended and navigation has begun |
| **Locale-filtered first, then laid out by count** | A related link never crosses languages silently, and a filtered-out item never leaves a hole |
| Grouped by relationship type, labelled | *Related reviews · From the journal · Related work* — a reader should know why each is there |
| **Never a carousel** | Hides items behind interaction; needs JS to read; the hidden items are invisible to a crawler that does not execute the script |
| Selection: curated now, generated later | Past ~50 reviews, generate by category → brand → recency **with a manual override**. Fully manual stops scaling; fully automatic loses the contextual link |

---

## 6. Orphan analysis

**Definition:** an indexable page reachable only from the sitemap.

### Structural guarantees

| Requirement | How it is guaranteed in the UX |
|---|---|
| A parent | Every route pattern has a parent index in `site.json` |
| A breadcrumb | Derived from the route path |
| An archive or hub listing it | Reviews → `/reviews/` · articles → `/journal/` · work → `/work/` · brands → `/brands/` |
| Inbound contextual links | Relationship arrays, validated |
| Navigation reachability | Every section index is in primary navigation or the footer |

### Current state, per locale

`tools/validate-content.mjs` computes whether each review is referenced by any journal article,
brand, work project or other review. **The current mock graph has zero orphans in either locale.**

| Route | Inbound UX surfaces | Orphan risk |
|---|---|---|
| `/{loc}/` | Wordmark on every page | None |
| `/{loc}/about/` | Nav, footer, homepage, every byline | None |
| `/{loc}/method/` | Nav, footer, **every review**, every article, about, homepage ×2 | **None — the most-linked page** |
| `/{loc}/reviews/` | Nav, footer, homepage, Method, 404 | None |
| `/{loc}/reviews/{slug}/` | Index, homepage, brands, articles, Method, related blocks, work | None |
| `/{loc}/journal/` | Nav, footer, homepage | None |
| `/{loc}/journal/{slug}/` | Index, homepage, review related blocks | None |
| `/{loc}/work/` | Nav, footer, homepage | None |
| `/{loc}/work/{slug}/` | Index, homepage, brand pages, review related blocks | None |
| `/{loc}/brands/` | **Footer only** — not in primary nav | **Low.** Footer is site-wide, and it is why the Standards/Content groups exist |
| `/{loc}/brands/{slug}/` | Reviews (gate permitting), brand index, work | None where the gate passes |
| `/{loc}/editorial-standards/` | Footer, Method, About | None |
| `/{loc}/contact/` | Header CTA, footer, homepage, every work page | None |
| `/{loc}/privacy/`, `/terms/` | **Footer only** | **Documented exception** — universal convention |
| `/{loc}/404/` | Not linked | **Documented exception** — `noindex`, reached only by error, and it links *out* |

**Three documented exceptions, none of which is indexable-and-orphaned.**

### The gated-link rule

**The most likely source of a broken internal link in this architecture is a template linking to a
gated brand page.** Every brand link is a function of the gate, evaluated at build time in the
current locale. When the gate fails, the brand name renders as text or as a link to the filtered
review index. **No template may assume a brand page exists.** (R-14.)

---

## 7. Entity relationship links

| Relationship | UX surface | Direction |
|---|---|---|
| **Review → Method** | Stage markers | Mandatory, every review |
| **Method → Review** | "Reviews that used this stage" + representative reviews | Both directions closed |
| **Review → Product** | Identity block, details block, claims block | Product has no route — it renders inline |
| **Product → Review** | n/a | A product-name query lands on the review |
| **Review → Brand** | Identity block | **Gate-dependent** |
| **Brand → Review** | "Reviews of this brand", locale-filtered | The reason the brand page exists |
| **Brand → Work** | "Related work", with disclosure | |
| **Work → Review** | The independent review of the same brand | The credibility cross-link |
| **Journal → Review** | Contextual + modular | The acquisition mechanism |
| **Journal → Method stage** | Stage anchor link | Keeps the journal tied to the Method |
| **Journal → Journal** | Pillar / supporting siblings | Cluster structure is data (`type`), not a diagram |

---

## 8. Indexable UX — what must not be hidden

**Important content is present in the structural UX, not behind interaction.**

| Content | Must be | Never |
|---|---|---|
| Observations | Static, in the DOM, in order | In an accordion or tabs |
| Conditions | A real `<table>` | A JS-rendered grid |
| Disclosure statement | Present at first paint, full text | Truncated, collapsed, or script-revealed |
| `doesNotProve` | In the flow at equal weight | In a `<details>` |
| Strengths and limitations | Both fully rendered | One collapsed |
| Plate captions | Real text beneath the image | A hover tooltip |
| Related content | Server-rendered links | A carousel |
| Facet results | Server-rendered at a real URL | Client-only state |
| Journal body | Server-rendered | Lazy-loaded on scroll |
| Search results *(deferred)* | Server-rendered at `?q=` | A client-only overlay |

**Every one of these is also an accessibility requirement.** That is not a coincidence: content that
a crawler cannot reach is usually content a screen reader cannot reach either.

---

## 9. Locale and hreflang, expressed in UX

| Rule | UX consequence |
|---|---|
| A route exists in a locale only if content exists there | `/ar/reviews/` lists **five**, not six with one broken |
| No hreflang alternate for a missing locale | The switcher falls back to the section index with a **visible explanation** (CMP-09) |
| **Locale variants never canonicalise to each other** | They are alternates, not duplicates. Cross-locale canonicalisation would deindex one language |
| `/` is a **302**, never a 301, never indexed | A 301 would cache one locale in shared proxies and prevent discovery of the other |
| Path segments stay English in both locales | Navigational furniture, not content. Localising them costs a permanent mapping layer |
| Slugs are authored per locale | So an Arabic-original article can have an honest Arabic-derived slug |
| Brand and product names stay Latin in both | Gulf users code-switch and keep them Latin inside Arabic queries |
| **Never a machine translation**, not even behind a banner | No stub route, no "translation coming soon" |

---

## 10. Structured data the UX must support

Implemented in Phase 8; the UX obligation is stated here because **everything marked up must be
visible on the page**.

| Type | Where | UX requirement |
|---|---|---|
| `Review` | Review pages | Author, date, product identity and verdict all **visible** |
| `Product` as `itemReviewed` | Nested inside `Review` only | Product facts visible in the details block. **Never standalone, never `offers`, never `AggregateRating`** |
| **No `reviewRating`** | — | **Removing numeric scores forfeits star snippets. That is a deliberate, documented trade.** The UX must not reintroduce a score to recover it |
| `Person` | `/about/` | Name, title, bio visible. `sameAs` only from **verified** profiles |
| `BreadcrumbList` | Every page but home | Derived from the visible breadcrumb |
| `Article` | Journal | Byline, dates, headline visible |

**The one rule:** if it is in the markup, a human can see it on the page. Nothing is marked up that
is hidden, collapsed, or rendered only for crawlers.

---

## 11. Links that were NOT added

The brief asks that no link exist purely for SEO. These were considered and rejected:

| Rejected | Why |
|---|---|
| A tag cloud or keyword footer | Links no human would click |
| "Related searches" blocks | Fabricated demand signals |
| Cross-locale "read this in English" links on Arabic pages | Reintroduces the "Arabic is a subset" framing |
| A link from every review to every other review | Dilutes the two curated related links that carry meaning |
| Category links in breadcrumbs before category routes exist | A breadcrumb must never name a page that does not exist |
| A sitemap page for humans | The footer and section indexes already do this; an HTML sitemap on a 21-record site is link plumbing |
| Product pages to capture `[product]` queries | They would cannibalise the review built to win that exact query |
| A brand page for every brand | The gate exists precisely to prevent thin aggregation pages |
| Author archive pages | `authorId` is modelled but a single-author archive duplicates `/about/` |

---

## 12. Measurement

Do not measure rankings first. In order:

1. **Indexed quality pages per locale** — the precondition for everything.
2. **Branded impressions in both scripts** — is the entity resolving?
3. **Non-branded impressions on review pages** — is the acquisition engine working?
4. **`/method/` entrances** — is the differentiator being found?
5. **Review → review depth** — is the internal-link graph doing its job?
6. **`/work/` → `/contact/` rate** — is the commercial path working?

**The single most diagnostic number remains the review → Method click rate.** If it is low, either
the positioning is not landing or the stage markers are not visible enough — and both are fixable in
the UX.

**Expect 6–12 months before organic acquisition is meaningful (R-06).** Saying so now is part of the
architecture, because a correct build judged against a wrong timeline gets called a failure.
