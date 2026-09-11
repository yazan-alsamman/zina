# Phase 7 — Decision Log

**Trust & Entity Surfaces: Brands, Work, Contact, About, Editorial Standards, Legal.**

Every decision that constrains future work, with the alternative that was rejected and why.
Decisions are numbered `D7-n`.

---

## D7-1 — No relationship label renders until it is CONFIRMED

**Decision.** `relationshipLabel()` requires `relationship.status === "CONFIRMED"` **and**
`_verification === "CONFIRMED"`. It returns `undefined` for every brand in the corpus, so no
relationship type renders anywhere.

**Rejected.** Rendering the type with a qualifier ("Campaign — unverified"), or softening it to a
neutral word like "partner" or "collaborator".

**Why.** Describing an unverified commercial relationship asserts a business arrangement with a
company, in public, on that company's behalf. Softening is *worse* than the raw type: "partner"
implies a relationship without saying which, and cannot be checked. A qualifier does not help
either — readers retain the noun, not the caveat.

**Consequence.** The relationship band is structurally identical on all seven brand pages today.
That is correct, not a design failure.

---

## D7-2 — The absence of a relationship is STATED, never left silent

**Decision.** Every brand page renders an explicit sentence saying no relationship has been
confirmed.

**Rejected.** Omitting the section when there is nothing to show.

**Why.** A brand page with no relationship line reads as independence — which is itself an
unverified claim, and a flattering one. The same logic governs Contact (D7-6) and the legal pages
(D7-9): an omission is read as a fact, so each absence is stated.

---

## D7-3 — The brand gate is per locale, and it is Phase 1's gate

**Decision.** `brands.json → indexGate`, unchanged. Evaluated per locale.

**Why per locale.** `veloura-beauty` has two English reviews and one Arabic one. A single global
gate would either publish a thin Arabic page or suppress a substantial English one. Same record,
different evidence, different answer.

**Rejected.** Inventing a Phase 7 threshold. The content already declares the rule, and a second
threshold would be a second source of truth.

**Consequence.** 7 entity pages from 5 brands. `terra-sana` has none; `veloura-beauty` has English
only. Their reviews remain fully reachable through the facets — **gating the entity page never
hides evidence.**

---

## D7-4 — `brandDestination()` was not modified

**Decision.** The Phase 5 helper already read `gatePasses && isImplemented("brand")`. Phase 7
registered the route; the helper flipped on its own.

**Why this matters.** It is evidence the Phase 5 abstraction was correct rather than convenient.
The rule never changed — *link to the entity when the gate passes and the template exists,
otherwise the facet* — only the second condition's value did.

**Tests were inverted rather than deleted.** Phase 5 asserted the helper must NEVER point at
`/brands/{slug}/`; that assertion is now false. It was replaced with both branches asserted
explicitly, plus a test that the two are mutually exclusive, so neither can regress.

---

## D7-5 — Corporate-profile facts are withheld even though they are on the record

**Decision.** `foundedYear` and `originCountry` are not rendered.

**Why.** They are invented mock values about fictional companies, they are corporate-profile
furniture rather than editorial evidence, and rendering them would make the page a company profile
— the exact thing a brand entity page must not be.

**The general rule this establishes:** *a field being present on the record is not a reason to
render it.* The question is whether the surface's purpose requires it.

---

## D7-6 — No contact form, and no contact address

**Decision.** The contact page carries no `<form>`, no inputs, no submit control, no fake success
state — and no email address.

**Rejected.**

| Option | Why still wrong |
|---|---|
| A disabled form | Advertises a channel and invites a retry |
| A "coming soon" form | A form that does not work, with an excuse |
| `mailto:` with the obvious address | Requires an address, and none is verified |

**Why.** A form without a destination looks functional, accepts a message someone took time to
write, and silently discards it. The reader believes they made contact. `hello@zinaalmokri.com` is
the natural guess and the dangerous one: unverified, it may belong to nobody — or to somebody else,
in which case this site directs strangers' mail to them.

**When a real endpoint exists**, that is the first genuinely justified place in this project to
introduce client JavaScript, and only if progressive enhancement cannot carry it.

---

## D7-7 — The Results Figure gate is two-part

**Decision.** A figure publishes only when `_verification === "CONFIRMED"` **and** `source` names a
written origin, inside a results set whose own `status` is CONFIRMED.

**Why two parts.** A verification flag is something anyone can set. A figure claiming to be
confirmed that cannot say where it came from is *asserted*, not verified. The `SOURCE_SENTINELS`
list catches the specific failure of writing the status where the provenance belongs.

**Why the set-level guard.** The set is the unit someone signs off. A confirmed row inside an
unsigned set is not signed.

**Why it matters more than any other gate.** "1.2M views" is a claim about a third party's
commercial outcome, attributed to Zina, published under her name. Numbers read as authoritative
even when the surrounding sentence hedges.

---

## D7-8 — `blocked` and `absent` render identically: nothing

**Decision.** No placeholder, no empty chart, no "results pending", no greyed-out number. The
template has no `else` branch.

**Why.** An outline where a number would go still tells the reader a number exists, and invites
them to imagine it. A withheld figure must leave no trace.

**Corollary.** The work index renders no figure at all, even where the gate would allow one: an
index row has no space for provenance, and a number without its source is not honest.

---

## D7-9 — The `allowed` branch is tested with synthetic fixtures, never with content

**Decision.** `tests/work.test.mjs` constructs confirmed figures in-file, passes them to the pure
gate functions, and a dedicated test proves the distinctive sentinel value never reached `dist/`.

**Why.** The corpus can only ever show the gate refusing, and a gate never observed to open is
half-verified — the same argument that made the Phase 6 TOC threshold a named predicate.

**The division this establishes:**

> A **test** may construct a confirmed figure to prove the gate opens.
> **Production content** may not invent one to make the page look richer.

---

## D7-10 — No jurisdiction is inferred (U-03)

**Decision.** `privacy` and `terms` exist as routes and state what is missing. Neither names a
jurisdiction, legal entity, regime, governing law, controller, DPO, processor or retention period,
and neither claims compliance with anything.

**Rejected.** Writing plausible generic privacy text. Defaulting to GDPR because it is the
strictest.

**Why.** The applicable regime, the consent behaviour and the governing law all follow from the
jurisdiction. Publishing a position nobody chose is worse than a stated gap, because a reader may
rely on it.

---

## D7-11 — No cookie banner, because there are no cookies

**Decision.** No consent UI, no cookie policy, no `/cookies/` route.

**Why.** The site sets no cookie, ships zero client JavaScript, and makes no third-party request. A
banner would ask permission for something that does not happen: it trains readers to dismiss
consent UI and implies tracking that is not occurring.

**The rule:** *legal architecture reflects the implementation, not the other way round.* Adding a
cookie policy merely because legal pages were being added would have inverted that.

`USES_TRACKING` is the single constant both pages read, and a test asserts the build matches it.

---

## D7-12 — Editorial Standards is a separate page from the Method

**Decision.** Two routes, cross-linked, neither restating the other. The distinction is stated on
the standards page itself, above everything else.

**Why.** They answer different questions for different moments: the Method for a reader evaluating
one review, the Standards for a reader deciding whether to trust the publication. Merging them
would bury each in the other.

---

## D7-13 — The unapproved standards are published, with their status stated

**Decision.** All five render; a notice above them says they are proposed and unapproved.

**Why this is the one place rendering unverified content is right.** The statements are about the
publication's intended behaviour, they are checkable against the site itself, and a standards page
with no standards would be pointless. What matters is that the status cannot be missed.

**Contrast with D7-1 and D7-6**, where unverified content is withheld entirely: those assert facts
about third parties (a company's commercial relationship) or promise a capability (a working
inbox). A stated intention is a different kind of claim from a stated fact.

---

## D7-14 — The limits section carries the same weight as the commitments

**Decision.** "What this publication does not do" is set at the same size and colour as the
standards, and is never inside a `<details>`.

**Why.** The Method page makes the same move with `doesNotProve`. A sceptic is persuaded by someone
volunteering their limits, not by a longer list of commitments. If this section ever acquires a
smaller size token or a disclosure wrapper, the page's argument has been inverted.

---

## D7-15 — About links to Method and Standards instead of credentials

**Decision.** The page's two outbound links are the Method and the Editorial Standards. No social
profile, no press, no follower count, no credential.

**Why.** Authority here comes from the method being visible and the limits being stated, both of
which a reader can check. A credential asks for trust; a linked protocol invites verification.

**The unverified location is withheld** even though it is on the record — a wrong city would
quietly justify climate-based testing claims nobody made.

---

## D7-16 — `countedNoun()` fixes English pluralisation and deliberately does not touch Arabic

**Decision.** A locale-aware counted-noun helper. English selects singular/plural; Arabic returns
the existing specification wording unchanged.

**Trigger.** "1 records" was rendering on the Phase 5 brand facets, and the new Phase 7 indexes
inherited the same string. Three Phase 6 journal archives had "1 articles".

**Why not a generic pluraliser.** English has two forms; **Arabic has six**, selected by the number
in a way that also changes the noun's case and whether it is singular, dual or plural (1; 2 dual;
3–10 plural; 11–99 singular accusative; 100+ singular genitive; 0 its own construction). Choosing
between them is an editorial judgement about natural phrasing, not a lookup table, and no native
Arabic reader has reviewed this project (H-1).

**So:** English corrected, because the bug is real and the rule unambiguous. Arabic unchanged,
because inventing five forms would be authoring unreviewed Arabic grammar. The function is the
single place those forms attach when a reviewer is available.

---

## D7-17 — Brands stay out of the primary navigation

**Decision.** Primary: Reviews, Method, Journal, Work, About, + the Collaborate CTA. Brands,
Editorial Standards, Privacy and Terms are footer destinations.

**Why.** This is Phase 1's IA decision, unchanged and now re-verifiable: brands are reachable from
every review and from the reviews index, and two of five do not qualify for a page in at least one
locale. Promoting a partial set to primary navigation would overstate it.

---

## D7-18 — "Collaborate" is reused rather than adding "Contact"

**Decision.** The contact page's own label is `collaborate` — the word `site.json` already uses for
this destination — while the route stays `/{locale}/contact/`, the canonical shape declared in
`site.json → routes`.

**Why.** One destination, one name. Adding a second word for the same page would put two
vocabularies in the interface.

---

## D7-19 — Repository safety became an executable test

**Decision.** `tests/repository.test.mjs` asserts the git root is the project, that no path escapes
it, that no credential-shaped file is tracked, that build output is untracked, and that the remote
is a real URL with no embedded credential.

**Why.** R-07 blocked Phases 3–6 and was resolved externally by the owner. A repository root is
exactly the kind of thing verified once, assumed forever, and catastrophic when the assumption
breaks. The tests assert **properties, never machine-specific paths**, so they hold on any clone.

---

## Decisions requiring the owner

| # | Decision | Why it needs a person |
|---|---|---|
| **H-1** | Arabic editorial quality | Measured correct (direction, isolation, factors, landmarks). **Never reviewed by a native Arabic reader.** Now also gates Arabic pluralisation (D7-16). |
| **H-2** | Screen-reader behaviour | **UNVERIFIED — HUMAN REVIEW REQUIRED.** |
| **H-3** | Production origin (U-01) | `SITE_URL` is `https://example.invalid`. Blocking for launch. |
| **H-4** | Jurisdiction (U-03) | Blocking for all legal content. |
| **H-5** | A verified contact channel | Blocking — the site currently offers no way to reach its author. |
| **H-6** | Brand relationship verification | Written confirmation per brand, before any label renders. |
| **H-7** | Editorial standards approval | Each of the five must be reviewed and adopted. |
| **H-8** | Real biography, portrait and location | The entire About page is placeholder copy. |
| **H-9** | Whether any result figure can be sourced | Otherwise Work permanently shows no results, which is an acceptable end state. |
| **H-10** | The Method | Still **PROJECT MOCK METHOD**. Must be confirmed or replaced. |
