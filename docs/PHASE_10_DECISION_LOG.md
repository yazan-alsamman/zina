# Phase 10 Decision Log

**Every decision made while auditing Phase 9's remaining blockers for legitimate resolution, in the
order they were made, with the reasoning that governed each one.**

Phase 10's brief asked this project to "systematically resolve the remaining blockers only where
authoritative information can actually be established," explicitly forbidding invention of missing
facts. This log records, blocker by blocker, why each one could not legitimately be resolved from
what was actually supplied — and the one place where a genuine, non-fabricated improvement was
found.

---

## D1. No new authoritative facts accompanied the Phase 10 request

**Decision:** Treat the Phase 10 brief as an audit-and-resolve instruction, not a new set of facts,
and verify this by re-reading it in full before writing any code.

**Why:** Phase 9's brief supplied specific, sourced values (a domain, an email, a phone number, an
Instagram URL, a jurisdiction, a testing methodology) each traceable to a sentence in that brief.
The Phase 10 brief supplies rules, scope boundaries and a checklist, but — deliberately, per its own
rule A ("If a fact is unavailable, preserve the existing absence/blocker mechanism") — no new legal
entity name, controller identity, retention period, rights procedure, governing-law clause, or
liability term. Proceeding as though facts existed because a brief asked for them would be exactly
the fabrication the brief forbids. This distinction is the single fact this entire log follows from.

---

## D2. Legal entity — stays blocked

**Decision:** Do not name any entity, registration form, or registered address.

**Why:** No entity name, registration number, or address was supplied at any point across Phase 9 or
Phase 10. Inventing a plausible one (e.g., defaulting to "Zina Almokri, sole proprietor") would be a
business-structure claim nobody made — sole-proprietor status, and its legal consequences, differ by
jurisdiction and is exactly the kind of professional legal judgment `docs/LEGAL_ARCHITECTURE.md` §8
has always deferred to a qualified professional.

---

## D3. Data controller — stays blocked

**Decision:** Do not name a controller, even by inference from the confirmed jurisdiction or the
confirmed copyright holder.

**Why:** "Data controller" is a term of art in most privacy regimes, and asserting who holds that
role is a legal conclusion, not a fact this project can observe from its own source code the way it
observes "ships zero client JavaScript." `copyrightHolder: "Zina Almokri"` is publishable because it
names the author of creative work — a fact this project already asserts everywhere. It does not by
itself establish who is legally the controller of any personal data a visitor might send, which
depends on business structure, jurisdiction-specific regime, and possibly a written designation that
does not exist. Confusing the two would be exactly the "convert UNKNOWN into VERIFIED merely to look
complete" failure mode rule A warns against.

---

## D4. Data retention — stays blocked (for the part that requires a decision); the part that is
already knowable was already stated

**Decision:** Do not state a retention period or processor list. Do add one narrowly-scoped fact
about what the SITE itself does (see D8) — kept clearly separate from the blocker.

**Why:** "How long messages are kept, and by whom" is a business practice only Zina can state. It
was not supplied. The one thing this project genuinely knows — that its own infrastructure never
receives, logs, or stores anything sent through its contact links, because it has none — was already
partially implied by the pre-existing "no accounts, no forms" fact, but was not stated for the
specific, newly-real case of the contact links themselves (see D8 for why this was added and why it
does not resolve this blocker).

---

## D5. Data-subject rights — stays blocked

**Decision:** State no rights procedure, not even a minimal one ("reply to the same address to
request removal").

**Why:** This was the most tempting item to partially resolve, because a minimal rights statement
*sounds* achievable without inventing anything. It was rejected on inspection: a data-subject-rights
statement is a **policy commitment** — it tells a reader what they are entitled to and how to invoke
it, which obligates Zina to actually honour whatever is stated. Writing one on her behalf, however
minimal, would be making a promise she has not agreed to keep. That is categorically different from
the architecture facts (no cookies, no tracking) this project verifies against its own build; there
is no way to verify a promise about future human behaviour. Left blocked, per rule A's explicit
instruction not to invent "data-subject rights beyond what can legitimately be stated."

---

## D6. Governing law — stays blocked

**Decision:** Do not name a governing law or forum, even though the jurisdiction (Syria) is known.

**Why:** `docs/LEGAL_ARCHITECTURE.md` has stated since Phase 7, and Phase 9's decision log (D7)
restated explicitly, that knowing WHERE a site is based does not by itself determine WHAT law governs
a dispute — that is a drafting choice, commonly made deliberately different from the operating
jurisdiction, and requires an actual decision (often made with counsel) about venue and choice of
law. Nothing in Phase 10's brief supplied that decision.

---

## D7. Liability limitation — stays blocked

**Decision:** Do not state any liability limitation, disclaimer strength, or damages cap.

**Why:** A liability limitation clause's specific wording and scope depends on the entity that would
be bound by it (D2) and the jurisdiction's enforceability rules for such clauses — neither of which
is resolved. Writing a generic one ("to the maximum extent permitted by law...") would imply a
decision about risk tolerance nobody made, and boilerplate legal text is explicitly what
`docs/LEGAL_ARCHITECTURE.md` §3 has forbidden inventing since Phase 7 ("Do not copy generic legal
boilerplate merely to make missing information disappear" — Phase 10's own rule C).

---

## D8. The one genuine addition: contact links carry nothing through this site

**Decision:** Add a new fact to the "what this site actually does" section of both legal pages,
gated on at least one confirmed contact channel existing: the email/phone/Instagram links open the
reader's own mail, phone or Instagram app directly, and nothing sent through them passes through, is
logged by, or is stored by this site.

**Why this is legitimate, not a loophole:** It is verifiable directly against the build the same way
the pre-existing "no cookies," "no tracking," "no client JavaScript" facts already are —
`src/pages/[locale]/contact/index.astro` has no `<form>`, ships no JavaScript, and posts to no
endpoint; the links are plain `mailto:`, `tel:`, and an external Instagram URL. It required zero new
information from anyone, because it is a statement about code that already exists and was already
read in full during the Phase 9 audit. It became worth stating only because Phase 9 gave the site
its first real, working contact channels — before that, there was no channel for a reader to wonder
about.

**Why it was gated on `hasAnyContactChannel()` rather than stated unconditionally:** If every
confirmed channel were ever un-confirmed again, the sentence "the email, phone and Instagram links on
this site..." would describe links that no longer render — exactly the class of drift the
`_verification` gate pattern throughout this project exists to prevent. Gating it on the same
condition that gates the links themselves keeps the two facts unable to disagree.

**Why `hasAnyContactChannel()` was extracted as a new shared function instead of duplicating the
check:** The Contact page already computed the same condition locally
(`channels.length > 0 || Boolean(phone) || Boolean(instagram)`). Two independent copies of the same
condition are a latent bug: if a future channel type were added and only one copy were updated, the
Contact page and the legal pages could silently disagree about whether a channel exists. Extracting
it once removes that risk. This was a small, low-risk refactor of already-tested code, not a new
abstraction built ahead of need — it was needed by this exact change.

---

## D9. VPS deployment — stays out of scope

**Decision:** Make no deployment-related change.

**Why:** Phase 10's brief permitted bringing deployment into scope only "if deployment is explicitly
brought into Phase 10 scope and the repository contains sufficient verified deployment
configuration." Neither condition was met: no deployment requirements were supplied, and the
repository still contains no deployment configuration file of any kind (re-verified: no
`.htaccess`, `nginx.conf`, `vercel.json`, `netlify.toml`, or `Dockerfile`).

---

## D10. `CONTENT_SOURCE` stays `"mock"`; `guard:mock` must keep failing

**Decision:** Make no change to `CONTENT_SOURCE`, `IS_INDEXABLE_BUILD`, or any gate in
`tools/check-mock-guard.mjs` / `tools/validate-content.mjs`.

**Why:** Nothing in Phase 10 supplied verified replacement content for the mock editorial corpus
(reviews, journal articles, brand records, biography). The legal-page addition in D8 is a fact about
architecture, not editorial content, and does not touch the mock/verified boundary. `guard:mock`
correctly continues to fail the build — re-verified after this phase's change (95 flagged locations,
all `__MOCK_DATA__` markers or `*.example.com` placeholder hosts, none of them new).

---

## D11. Git discipline

**Decision:** One commit for the implementation change plus its tests, a second for documentation —
following the same two-commit pattern Phase 9 used — on `main`, no rewriting of history, no force
push.

**Why:** Consistent with the project's established practice (Phases 7–9) and with Phase 10's own
rule I. The change set this phase is small (one new fact, one shared helper, two test additions), so
splitting further would not add clarity; splitting into "code" and "docs" mirrors exactly how the
previous two phases were committed and keeps the pattern predictable for whoever reads this history
next.

---

## Chronology (for reference)

1. Re-verified the repository baseline against `docs/reports/PHASE_9_REPORT.md` before any change:
   branch, remote, commit hashes, route count (85), test count (445), `astro check` (0 errors),
   `CONTENT_SOURCE` (`"mock"`), `guard:mock` (correctly failing), no old-domain leaks.
2. Read `docs/reports/PHASE_9_REPORT.md`, `docs/PHASE_9_DECISION_LOG.md`,
   `docs/DOMAIN_CONFIGURATION.md`, and the current `LegalDocument.astro`, `trust.ts`,
   `content.ts`, `privacy/index.astro`, `terms/index.astro`, `contact/index.astro` to confirm the
   code matches what the documentation claims (it did, exactly).
3. Audited each of the six named blockers individually (D2–D7) against the Phase 10 brief for any
   new fact that would legitimately resolve it. Found none.
4. Identified the one legitimate, non-fabricated clarity improvement available (D8): a fact about
   what the site's own infrastructure does with the contact links Phase 9 added.
5. Implemented `hasAnyContactChannel()` in `src/lib/trust.ts`, refactored the Contact page to use
   it, added the gated fact to `LegalDocument.astro`, and added the new UI strings in both locales.
6. Ran `astro check`, `npm run build`, and the full test suite — added two new tests to
   `tests/trust.test.mjs` asserting the fact renders correctly and that the six blocked-item lists
   are unchanged.
7. Ran `npm run validate:content`, `npm run validate:journal`, `npm run validate:contrast`, and
   `guard:mock` — all behaved exactly as expected (guard:mock still correctly fails).
8. Ran a dead-link and old-domain-leak audit against the fresh build: zero of each.
9. Verified the change live in a browser, both locales, on Privacy and Terms.
10. Updated `docs/LEGAL_ARCHITECTURE.md` and `docs/CONTACT_IMPLEMENTATION.md` with Phase 10
    sections; wrote this log and `docs/reports/PHASE_10_REPORT.md`.
