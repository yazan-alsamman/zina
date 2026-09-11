# Legal Architecture

**Structure and honest placeholders. No jurisdiction is invented, and nothing here is legal
advice.**

| | |
|---|---|
| **Status** | Architecture implemented; content **BLOCKED** (Phase 7) |
| **Routes** | 4 — `/{locale}/privacy/`, `/{locale}/terms/` |
| **Blocking unknown** | **U-03 — jurisdiction unresolved** |
| **Cookie banner** | **None**, because there are no cookies |
| **Structured data** | `BreadcrumbList` only |

---

## 1. What is blocked, and why

```
site.json → legal
  entityName    null   NEEDS_VERIFICATION
  jurisdiction  null   NEEDS_VERIFICATION   ← U-03
  copyrightHolder "Zina Almokri"            ← a plain string, publishable
```

Without a jurisdiction this project cannot know:

- which privacy regime applies
- what consent behaviour is required
- what retention periods are lawful
- what a terms document must contain
- which law governs a dispute, and in which forum

**Every one of those follows from the jurisdiction.** Guessing would publish a legal position
nobody chose. `jurisdictionIsKnown()` returns `false`, and it is the gate on both documents.

---

## 2. What these pages do instead

They exist, they are reachable, and they state **precisely what is missing and who must supply
it** — placed first, above everything else, because a reader must not read a paragraph and believe
it binds.

> **This document is not yet operative**
>
> The jurisdiction this site is published under has not been established, and the applicable
> privacy regime, consent requirements and governing law all follow from it. Rather than
> approximate a legal position nobody has chosen, this page records what is missing. Nothing here
> is legal advice, and nothing here claims compliance with any particular regime.

### Required from the owner

**Privacy**
- The jurisdiction and the privacy regime that applies to it
- The named data controller, and a contact route for data requests
- Retention periods, and the list of any processors used
- The data-subject rights that apply, and how a reader exercises them

**Terms**
- The governing law and the forum for any dispute
- The legal entity publishing this site, and its registered details
- The limitation of liability appropriate to that entity and jurisdiction

---

## 3. What is never invented

Asserted absent from all four pages by test:

GDPR · CCPA · PDPL · LGPD · PIPEDA · "European Union" · "EU law" · California · "governed by the
laws" · "courts of" · "Data Protection Act" · registered office · company number · VAT · LLC · Ltd
· FZ-LLC · "we comply" · "compliant" · "in accordance with" · "as required by law" · "your legal
rights are" · "data protection officer"

No legal entity name, no address, no company number, no DPO, no processor list, no retention
schedule, and **no compliance claim of any kind**.

---

## 4. What *can* be said honestly

Statements about **what the software does**, which are observations about the build rather than
legal positions — and which the test suite verifies against `dist/` rather than taking on trust:

| Statement | Verified by |
|---|---|
| No analytics, tracking or third-party scripts | No `<script>` outside JSON-LD on any of 85 pages |
| No cookies, therefore no consent request | `USES_TRACKING === false`; no cookie UI anywhere |
| No client-side JavaScript at all | 0 `.js` files emitted |
| No accounts, logins, comments or forms | No `<form>`; the single `<input>` is the CSS menu toggle |
| Fonts self-hosted from this domain | No fetching element carries an `https://` URL |

That last check is deliberately precise: `<link rel="canonical">` and `rel="alternate"` carry
absolute URLs built from `SITE_URL` and **fetch nothing**. The test inspects stylesheets, preloads,
scripts, images and frames — the elements that actually make a request.

`copyrightHolder: "Zina Almokri"` is published because it names the author of the work, which the
project already asserts everywhere.

---

## 5. Why there is no cookie banner

The site sets **no cookie at all**, ships zero client JavaScript, and loads no analytics, tag
manager, embed or third-party resource.

A consent banner would therefore ask permission for something that does not happen. That is worse
than useless: it trains readers to dismiss consent UI, and it implies tracking that is not
occurring.

> **Legal architecture must reflect the implementation, not the other way round.**

`USES_TRACKING` in `src/lib/trust.ts` is the single switch both legal pages read. If tracking is
ever added, that constant flips and the pages change with it — and a test asserts the build
actually matches the constant, so the two cannot drift.

Adding a cookie policy merely *because* legal pages were being added would have inverted the
dependency: describing a cookie system in order to have something to describe.

---

## 6. Route choice

`site.json → routes` declares `privacy` and `terms`. Both are implemented. **No `/cookies/` route
was created**, for the reason in §5 — the architecture declares no such route, and there is nothing
true to put on it.

Disclosure is covered on **Editorial Standards**, not as a separate legal page: it is an editorial
commitment about how reviews are labelled, not a legal notice.

Both pages are footer destinations, never primary navigation.

---

## 7. Structured data

`BreadcrumbList` only. No `Organization`, no legal entity markup, no `WebSite` publisher — the
entity those would describe does not exist yet.

---

## 8. Implementation

`src/components/trust/LegalDocument.astro` is the shared shell; `privacy` and `terms` supply their
own title, intro and list of blocked items. Sharing the shell keeps the blocked-state treatment
identical on both, so neither can drift into looking more operative than the other.

---

## 9. Known limits and required decisions

| # | Item | Owner action |
|---|---|---|
| **U-03** | Jurisdiction | **Blocking.** Determines everything else in this document |
| L-1 | Legal entity | Name, form and registered details, or a decision to publish personally |
| L-2 | Data controller | Required once any channel collects data |
| L-3 | Real legal text | **Must be written or reviewed by a qualified professional.** Nothing here substitutes for that |
| L-4 | Contact route for data requests | Depends on the unresolved contact channel |

**These pages are architecture. They are not legal advice, and they must not ship as final legal
text.**
