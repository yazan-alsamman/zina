# SEO Entity Strategy

**Status:** Phase 0. Implementation in Phase 8.
**Hard rule:** every URL in this document is a mock placeholder. None may be emitted.

---

## 1. The entity problem

Search engines do not rank a person; they resolve an entity and then rank documents about it.
For a creator whose name exists in two scripts and whose presence is currently spread across
platforms she does not own, the job is to make one machine-readable answer to "who is Zina
Almokri" and then say it identically everywhere.

Three failure modes to design against:

1. **Name ambiguity.** `Zina Almokri`, `Zina Al-Mokri`, `Zina Almokry`, `زينا المقري`. If the site
   is inconsistent, the entity fragments.
2. **No authoritative home.** Without an owned site, the strongest signal is whichever social
   platform ranks best. That is the situation this project exists to change.
3. **Unverified `sameAs`.** Linking to an account that is not hers, or a fan account, corrupts the
   entity and is very hard to unwind.

---

## 2. Canonical identity

| Attribute | Value | Verification |
|---|---|---|
| Canonical Latin name | `Zina Almokri` | **CONFIRMED** (client brief) |
| Canonical Arabic name | `زينا المقري` | **CONFIRMED** (client brief) |
| Display name | `Zina Almokri` | CONFIRMED |
| Known variants to normalise | `Zina Al-Mokri`, `Zina Almokry`, `زينة المقري` | NEEDS VERIFICATION — confirm which, if any, she actually uses |
| Professional identity | Beauty Creator & Product Testing Specialist | **MOCK** |
| Official website | unknown | **NEEDS VERIFICATION — blocking, U-01** |
| Official social profiles | unknown | **NEEDS VERIFICATION — blocking, U-02** |
| Location | unknown | NEEDS VERIFICATION |
| Author identity | Same Person entity, used as `author` on every Review and Article | Design decision |

**The single most important consistency rule:** the name string, the professional title, and the
bio must be byte-identical on the website, in every social profile, and in every third-party
byline. Search engines corroborate entities across sources; a paraphrased bio on one platform is
a weaker match than a duplicated one. This is the one place where duplicate content is correct.

---

## 3. Structured data plan

| Type | Where | Notes |
|---|---|---|
| `WebSite` | Site-wide | With `inLanguage`; `SearchAction` only if on-site search actually exists |
| `Person` | `/about` (canonical), referenced site-wide by `@id` | The entity anchor |
| `WebPage` | Every page | `BreadcrumbList` attached |
| `BreadcrumbList` | All nested routes | Reviews, brands, work, journal |
| `Article` | `/journal/[slug]` | `author` → Person `@id`, plus `datePublished` and `dateModified` |
| `Review` | `/reviews/[slug]` | `itemReviewed` → `Product`, `author` → Person. See section 5 |
| `Product` | Nested inside `Review` only | **Never standalone.** See section 5 |
| `Organization` | Only if a legal entity is confirmed | Currently unknown; do not emit |
| `ImageObject` | Hero and key media | Supports image search, which is a real opportunity here |
| `VideoObject` | Only if video is hosted on-site | Not currently planned |

**Use one `@id` graph, not scattered blocks.** A single `Person` node referenced by `@id` from
every Review and Article is far stronger than repeating an inline author object per page, and it
is what makes the corroboration work.

---

## 4. `sameAs` requirements

`sameAs` is the mechanism that binds the site to the social presence. It is also the fastest way
to corrupt the entity.

**Gate:** the `SocialProfile.sameAsEligible` field is `false` for every mock profile, and
`tools/validate-content.mjs` fails the build if any mock profile sets it `true`. A profile becomes
eligible only when the client confirms in writing that the account is official and controlled by
Zina.

Required before any `sameAs` ships:

1. Client confirms each account is official, in writing.
2. Each account's bio links back to the website. `sameAs` is a claim; the reciprocal link is the
   corroboration. One-directional `sameAs` is materially weaker.
3. Each account's display name matches the canonical name exactly.
4. Non-official accounts (fan pages, old accounts, dormant accounts) are explicitly excluded.

Mock placeholders currently in `content/mock/social-profiles.json`, none of which may be emitted:

```
https://www.instagram.com/zina.almokri.mock
https://www.tiktok.com/@zina.almokri.mock
https://www.youtube.com/@zinaalmokri.mock
https://www.snapchat.com/add/zina.almokri.mock
https://www.pinterest.com/zina.almokri.mock
```

Snapchat is included deliberately: it is disproportionately significant in Gulf beauty audiences
and is routinely omitted from Western-defaulted social lists. Whether Zina maintains it is
unverified.

---

## 5. Review and Product schema: the constraints that actually bite

Verified against Google Search Central documentation. These are stricter than they first appear.

**What is permitted.** Zina reviewing a third party's product is a legitimate third-party review.
The restriction that blocks self-serving reviews applies to an entity controlling reviews *about
itself* — a business publishing reviews of that business. It does not apply here.

**What is required on `Review`:** `author` (Person or Organization, max 100 characters),
`itemReviewed`, and `reviewRating` with `ratingValue`. `datePublished`, `bestRating` and
`worstRating` are recommended. `bestRating` and `worstRating` default to 5 and 1.

**Six rules to enforce in implementation:**

1. **`reviewRating` is required for a review snippet.** If Phase 1 decides against publishing
   numeric ratings, the site forfeits star snippets. That is a legitimate editorial choice, but it
   must be made knowingly. `Review.verdict.rating` is nullable in the model for exactly this
   reason.
2. **Never emit standalone `Product` schema.** Zina does not sell these products. Product markup
   belongs nested inside `Review` as `itemReviewed`, never as a page-level product entity, and
   never with `offers`.
3. **Never emit `AggregateRating` across her own reviews.** Aggregating her own scores into a
   brand or category rating is misleading structured data under the guidelines.
4. **Never aggregate ratings from other sites.** Explicitly prohibited.
5. **Everything marked up must be visible on the page.** The rating, the author, the date and the
   review body must all be readable by a user, not hidden behind a tab or a collapsed section.
6. **Disclosure is a guidelines matter, not only an ethics matter.** The guidelines ban reviews
   with undisclosed incentivisation — money, discounts, or free product. The disclosure model in
   `docs/CONTENT_MODEL.md` (above-content, four disclosure types, never configurable downward)
   satisfies this by construction.

---

## 6. Profile consistency checklist

Run before launch, then quarterly.

- [ ] Name string identical across site and every social profile
- [ ] Professional title identical
- [ ] Short bio identical, not paraphrased
- [ ] Same portrait used as profile image across platforms
- [ ] Every official profile links back to the website
- [ ] `sameAs` contains only confirmed official profiles
- [ ] `Person.@id` is stable and referenced, not duplicated
- [ ] Arabic name present in `Person.name` or `alternateName`
- [ ] No variant spellings in body copy
- [ ] Search Console verified on the canonical host
- [ ] Structured data passes the Rich Results Test for Person, Review, Article, BreadcrumbList
- [ ] No `Product` schema emitted outside a `Review`
- [ ] No `AggregateRating` anywhere

---

## 7. Bilingual entity handling

If D-04 goes bilingual:

- One `Person` entity, not two. Arabic and English pages reference the same `@id`.
- `name` in the page's primary language; the other script in `alternateName`.
- `hreflang` reciprocal pairs on every route, plus `x-default`.
- Locale-specific `inLanguage` on `WebPage` and `Article`.
- Bios translated by a human. A machine-translated bio weakens exactly the consistency signal
  section 2 depends on.

---

## 8. What must not be done

- Do not emit any mock URL, in `sameAs` or anywhere else.
- Do not claim awards, press or partnerships in structured data before verification. The mock
  press record is a *shortlisting*, not a win, and must never be upgraded in copy or in markup.
- Do not mark up a follower count as a fact. It is a number with a date, or it is not published.
- Do not create an `Organization` entity for a legal entity that has not been confirmed to exist.
