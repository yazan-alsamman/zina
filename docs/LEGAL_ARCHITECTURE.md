# Legal Architecture

**Structure and honest placeholders. No legal entity is invented, and nothing here is legal
advice.**

| | |
|---|---|
| **Status** | Architecture implemented (Phase 7); **U-03 partially resolved Phase 9**; **audited, one fact added, Phase 10** |
| **Routes** | 4 — `/{locale}/privacy/`, `/{locale}/terms/` |
| **Jurisdiction** | **CONFIRMED — Syria** (project owner, Phase 9) |
| **Still unresolved** | Legal entity, specific privacy regime, data controller, retention, data-subject rights, governing-law clause, liability limitation — **all six remain exactly as blocked after Phase 10** as they were after Phase 9; see §11 |
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
| ~~U-03~~ | ~~Jurisdiction~~ | **Resolved Phase 9 — Syria.** See §10. |
| L-1 | Legal entity | Name, form and registered details, or a decision to publish personally |
| L-2 | Data controller | Required once any channel collects data |
| L-3 | Real legal text | **Must be written or reviewed by a qualified professional.** Nothing here substitutes for that |
| L-4 | Contact route for data requests | **Resolved Phase 9** — `contact@zinaalmokri.com` now exists (`docs/CONTACT_IMPLEMENTATION.md`) |
| L-5 | Specific privacy statute/regime | Knowing the jurisdiction is not knowing which law applies within it |
| L-6 | Governing-law clause, liability limitation | Not inferred from jurisdiction alone — no entity exists yet to attach them to |

**These pages are architecture. They are not legal advice, and they must not ship as final legal
text.**

---

## 10. Phase 9 update — jurisdiction confirmed, the gate restructured to say so precisely

The project owner supplied the primary jurisdiction: **Syria**. `site.json → legal.jurisdiction`
is now `{ "value": "Syria", "_verification": "CONFIRMED" }`. `jurisdictionIsKnown()` reads it
exactly as §6/§7 above already describe — no new code, the same `verified()` gate every other
confirmed field in this project uses.

### Global audience, explicitly not "every visitor's own jurisdiction"

The project owner was explicit: the site's audience is global, and stating Syria as the
jurisdiction is **not** a claim that every reader's own laws are the same. Both legal pages state
this directly, in the same sentence that states the jurisdiction, so the two facts cannot be read
apart from each other.

### The gate had to become finer-grained than "known / unknown"

Before Phase 9 there was exactly one fact to know: the jurisdiction. `LegalDocument.astro`'s status
band was correspondingly binary — `!jurisdictionIsKnown()` showed the "not yet operative" notice,
full stop. Confirming jurisdiction while entity/controller/retention/rights/governing-law/liability
remain unsupplied produced a THIRD state the binary gate could not express: known-but-incomplete.

The component now gates on `blockedItems.length === 0` (is there anything AT ALL still missing)
rather than on jurisdiction specifically, and renders one of two honest messages:

| State | Condition | Message |
|---|---|---|
| Fully unknown | `!jurisdictionIsKnown()` | "This document is not yet operative" (unchanged Phase 7 copy) |
| Partially resolved | `jurisdictionIsKnown() && blockedItems.length > 0` | "This document is not yet complete" — states Syria explicitly, lists only what is STILL missing |

Privacy's blocked-item list changed shape correspondingly: the old single item "the jurisdiction
and the privacy regime that applies to it" is now `legalMissingRegimeSpecifics` — "the specific
privacy statute or regulation that applies **within the stated jurisdiction**" — because half of
the original item is no longer missing. Terms' blocked items (`legalMissingGoverningLaw`,
`legalMissingEntity`, `legalMissingLiability`) are unchanged: none of them follows from jurisdiction
alone, and none was supplied.

### What is rendered now

The "Who publishes this" section (§ identity, unchanged code) now shows:

```
Copyright       Zina Almokri
Jurisdiction    Syria
```

with the pre-existing "No legal entity has been established for this site yet" note still present,
unchanged — entity remains exactly as unconfirmed as it was before Phase 9.

### Deployment dependency, explicitly out of scope here

The project owner named Hostinger (domain registrar) and a future Hostinger VPS (hosting) as
infrastructure decisions. Neither implies a jurisdiction, an entity, or a governing-law clause on
its own, and this phase makes no inference from either. Server/DNS/TLS configuration is unaffected
by this document and was not touched — the repository contains no deployment configuration file of
any kind to update (checked: no `.htaccess`, `nginx.conf`, `vercel.json`, `netlify.toml`, or
`Dockerfile` exists in this project).

---

## 11. Phase 10 update — audited for new facts, found none; one clarity addition, zero blockers resolved

Phase 10's brief named the same six items §9 already listed as unresolved (legal entity, data
controller, retention, data-subject rights, governing law, liability) and asked that each be
resolved "only where authoritative information can actually be established." **No new authoritative
fact accompanied the Phase 10 request** — unlike Phase 9, which arrived with a project owner's brief
supplying specific, sourced values. Per the same rule that has governed this file since Phase 7 (an
unverified value is an absence, and it renders as one), all six items remain **exactly as blocked**
as `docs/reports/PHASE_9_REPORT.md` left them. None was approximated, defaulted, or inferred from
the jurisdiction, the domain, or anything else now known. See `docs/PHASE_10_DECISION_LOG.md` for
the item-by-item reasoning on why each specific blocker cannot be resolved from what is currently
known, and `docs/reports/PHASE_10_REPORT.md` for the full audit.

### The one addition: what the CONTACT LINKS do, not a resolution of retention or the controller

Phase 9 gave this site its first real, confirmed contact channels (email, phone, Instagram). Before
that, "what happens to data sent through this site's contact channels" was not yet a meaningful
question — there was no channel. Now there is, and a privacy-conscious reader visiting a page with
working `mailto:`/`tel:`/Instagram links might reasonably ask whether this site's own infrastructure
sees, logs or stores what they send through them.

The honest, verifiable answer is no — those are plain outbound links with a zero-backend site behind
them (`src/pages/[locale]/contact/index.astro`: no `<form>`, no client JavaScript, nothing posted to
any endpoint this project controls). That is a **fact about the software**, of exactly the same kind
as the existing "no tracking," "no cookies," "no client JavaScript" statements in §4 — verifiable by
reading the build, not a legal conclusion. It was added as a new fact, gated on
`hasAnyContactChannel()` (`src/lib/trust.ts`) so it disappears automatically if every confirmed
channel were ever un-confirmed again, exactly like every other data-driven gate in this project.

**What this explicitly does NOT do:** it does not resolve `legalMissingController` or
`legalMissingRetention`. Those items are about what happens to a message *after* it reaches Zina,
off this site's infrastructure entirely (how long she keeps an email, who else might see it, what
rights a sender has over it) — genuine business-practice questions nobody has answered, and none of
that is inferred from the fact that the site itself does not intercept the message in transit. Both
blocked-item lists on Privacy (`legalMissingController`, `legalMissingRetention`, plus the still-open
regime-specifics and rights items) and on Terms (governing law, entity, liability) are **character-
for-character unchanged** from Phase 9 — verified by `tests/trust.test.mjs`'s Phase 10 regression
test, which asserts each blocked-item phrase is still present.

### VPS deployment: still out of scope

Phase 10's brief permitted bringing deployment into scope "unless authoritative deployment
requirements are now provided." None were. The repository still contains no deployment configuration
of any kind (re-checked: no `.htaccess`, `nginx.conf`, `vercel.json`, `netlify.toml`, or `Dockerfile`
exists), so this remains untouched, exactly as `docs/DOMAIN_CONFIGURATION.md` §6 described after
Phase 9.
