# Competitive and Positioning Research

**Status:** Phase 0. Partial. Read section 0 before using anything below.

---

## 0. Scope and honesty statement

Web search was available and was used. It was used for **five queries** covering the beauty
website landscape, Google's current treatment of review content, Arabic search behaviour in Gulf
markets, and framework selection. Findings from those searches are marked **[researched]** and
carry sources at the end of this document.

What was **not** done, and must not be represented as done:

- No competitor site was crawled, audited, or measured.
- No traffic, ranking, backlink or keyword data was obtained for any competitor.
- No Arabic-language beauty creator site was examined. Search results were US-region, which is a
  material limitation for a project whose primary audience is likely Arabic-speaking.
- No named individual creator was assessed. The mainstream beauty publications named in section 2
  come from search results as category examples, not from analysis.

Conclusions marked **[reasoned]** are analysis from the material available and from the category,
not measurement. Section 6 is the research plan for what remains.

---

## 1. Landscape structure [reasoned]

A beauty creator's owned website almost always falls into one of four types.

**Type A — The link-in-bio page.** One screen, social icons, a contact email. Costs nothing,
communicates nothing, ranks for nothing. This is what most creator sites are.

**Type B — The media-kit site.** Built for brands: audience statistics, past campaigns, rate
context, contact form. Converts reasonably well for the small number of people who reach it, and
is invisible to search because it contains no content anyone is looking for.

**Type C — The blog.** Reverse-chronological posts, usually neglected within eighteen months. Has
SEO potential that is rarely realised because the publishing cadence collapses.

**Type D — The owned editorial property.** A structured, browsable body of work with its own
information architecture, its own method, and its own reason to be visited by someone who has
never heard of the creator.

**The brief asks for Type D**, which is uncommon precisely because it requires the creator to
have a repeatable editorial method rather than a personality. Zina does: she tests products and
documents results. That is the rarest precondition and it is already satisfied.

The strategic risk in the brief is building a beautiful Type B and calling it Type D. The
distinguishing test is simple: **does the site have content a stranger would search for?**
Reviews and journal articles pass. Bios and campaign galleries do not.

---

## 2. What the category looks like [researched]

Search results characterise the established beauty editorial space as publications like Byrdie,
Allure, Into The Gloss, The Beauty Look Book, Makeup and Beauty Blog and British Beauty Blogger,
and describe the differentiator among individual beauty creators as "honest reviews, useful
routines, clear product details, and a consistent point of view."

Two observations follow.

**Zina is not competing with those publications and should not try to.** A publication wins on
breadth and speed. An individual wins on depth, repeatability and a named face attached to a
named method. The right comparison set is not Allure; it is the small number of individual
creators who publish structured, methodical testing.

**"Consistent point of view" is the recurring differentiator in every source consulted.** It is
also the thing the content model encodes structurally rather than aspirationally, via the
six-stage protocol and the claims/observations/verdict separation.

## 3. Visual and structural conventions [researched]

- As of 2026, roughly **three in four beauty websites use a pale foundation**, with dark themes
  reserved for editorial or moody positioning. Photography-led heroes on white are the default,
  letting skin tones and product texture carry the visual weight.
- High-end creator sites use **large typography, generous white space, and alternating two-column
  text/image layouts**, producing an effect closer to a design publication than a website.
- Common structural sections in the category: Services, Pricing, About, Team, Portfolio,
  Testimonials, Products, Contact — a **services-business** structure, not an editorial one.

**Implication [reasoned].** Two of these are useful and one is a trap.

The white-dominant convention means a **dark, editorial art direction is a genuine
differentiator** rather than a risk-for-its-own-sake — the sources describe dark specifically as
the editorial choice, which is the positioning here. This is the strongest single input into
`docs/DESIGN_DIRECTION_PROPOSAL.md`.

The typography and white-space convention should be adopted; it is convention because it works,
and beauty imagery genuinely needs room.

The section list is the trap. Services/Pricing/Testimonials is salon-and-freelancer structure.
Importing it would produce exactly the Type B site described above, wearing editorial clothes.
The IA in `docs/SITEMAP_PROPOSAL.md` deliberately leads with Reviews rather than Services, and
gates Testimonials behind signed approval.

## 4. What makes a review site authoritative [researched]

This is the best-evidenced section here, because Google has said it directly.

- The core signal is **whether a real person with real experience wrote the review**. Google
  favours reviews demonstrating first-hand experience: original photographs, measurable
  observations, and real testing over restated specifications.
- The **Experience** component of E-E-A-T is the differentiator, rewarding content showing real
  first-hand involvement.
- Google's review system now covers **any type of review**, not only product reviews.
- The stated requirements are: demonstrate first-hand experience, show genuine expertise,
  **acknowledge product limitations honestly**, and write for readers rather than search engines.
- Helpful content is an **evolving part of the core ranking system**, not a one-off update.

**Implication [reasoned].** Every one of those five points is a content-model decision, and each
is already made:

| Google signal | Where it lives in the architecture |
|---|---|
| Original photography | `heroMedia` + `images.gallery` required with alt, width, height |
| Measurable observations | `observations[]` with `at` + `aspect` + `note` |
| Real testing over specifications | `testing.conditions[]`, `wearWindow`, `timesTested`, `baselinePhotographed` |
| Acknowledge limitations honestly | `cons[]` and `suitability.mayNotSuit[]` both required by the validator |
| Not written for search engines | Claims held in `brandClaims`, structurally separated from findings |

This is the central strategic finding of Phase 0: **the editorial integrity requirements and the
SEO requirements are the same requirements.** There is no tension to manage between them, which
means the site does not need an SEO layer bolted onto an editorial layer.

## 5. Trust signals worth building [reasoned]

Ranked by how rare they are in the category:

1. **A named, published testing method.** Very rare. Highest differentiation available.
2. **Disclosure above the content rather than beneath it.** Rare, cheap, immediately legible.
3. **Dated update logs on evergreen reviews.** Rare. Also a genuine freshness signal.
4. **Published testing conditions.** Almost absent in the category, and the foundation of the
   climate-specific seam in `docs/SEO_KEYWORD_MAP.md` section 3.
5. **A public editorial standards page.** Common in publications, rare for individuals.
6. **Explicitly stating what a test cannot show.** Counter-intuitive and disproportionately
   credibility-building. Two of the six mock reviews do this deliberately.
7. **Showing paid work and independent reviews of the same brand, cross-linked.** Unusual, and it
   converts a potential credibility problem into a demonstration of the disclosure policy working.

---

## 6. Research plan for what is missing

Phase 1 or a dedicated research task should:

1. **Identify 5 to 8 actual comparison sites**, split between Arabic-language beauty creators
   and international individual review creators. This requires region-aware search that was not
   available here.
2. **Audit each** against: IA depth, review template structure, disclosure placement, method
   documentation, internal linking, structured data (view source), image strategy, mobile
   performance, contact/conversion path.
3. **Check SERP composition** for 10 representative queries from `docs/SEO_KEYWORD_MAP.md`. If a
   query returns only retailers and marketplaces, it cannot be won with editorial content and
   should be demoted in the map.
4. **Examine 3 Arabic-language beauty properties specifically** for RTL editorial layout, bilingual
   handling, dialect usage in headings, and typographic pairing of Arabic and Latin.
5. **Run Lighthouse against 3 comparison sites** to set a realistic performance bar rather than
   an abstract one.
6. **Record findings back into this document**, replacing section 1 and section 5 with measured
   observation.

Until step 6 is done, no claim in this document should be described to a client as competitive
research. It is a positioning hypothesis supported by category-level evidence.

---

## Sources

- [Amsive: Google's newest reviews update elevates real-life experience](https://www.amsive.com/insights/seo/googles-newest-reviews-update-elevates-real-life-experience/)
- [Hobo: The Google helpful content update and its relevance in 2026](https://www.hobo-web.co.uk/the-google-helpful-content-update-and-its-relevance-in-2026/)
- [WiserReview: Google product reviews update, full history](https://wiserreview.com/blog/google-product-reviews-update/)
- [SiteBuilderReport: Beauty websites, 40+ inspiring examples](https://www.sitebuilderreport.com/inspiration/beauty-websites)
- [SoftGlowStyle: 20 popular beauty blogs](https://softglowstyle.com/20-popular-beauty-blogs-you-should-follow/)
- [Unil: Personal website examples for inspiration](https://unil.ink/blog/personal-website-examples-for-inspiration)
- [Google Search Central: Review snippet structured data](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
