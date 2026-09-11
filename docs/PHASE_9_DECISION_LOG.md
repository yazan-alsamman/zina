# Phase 9 Decision Log

**Every decision made while integrating verified production facts into the mock-safety
architecture, in the order they were made, with the reasoning that governed each one.**

This log exists because the brief asked for one explicitly: a record future phases can read to
understand *why* the boundary sits where it does, not just where it sits. It complements, rather
than repeats, the per-surface `docs/*_IMPLEMENTATION.md` "Phase 9 update" sections — those explain
what changed on each page; this explains the calls made along the way.

---

## D1. `SITE_URL` changes; `site.json.domain` does not

**Decision:** Update `src/config/site.ts → SITE_URL` to `https://zinaalmokri.com`. Leave
`content/mock/site.json → domain` exactly as its Phase 0 invented placeholder value.

**Why:** `SITE_URL` was purpose-built across Phases 4–8 as the single source every absolute URL in
the build reads from. `site.json.domain` has never been read by any code path. Updating it would
create a second URL fact with no consumer — pure risk (a future author might start reading it,
assuming it's live) for zero benefit. Existing tests already assert the invented domain never
leaks into output; changing the field would require rewriting those tests' premise for nothing.

**Alternative rejected:** Updating both "for consistency." Rejected — consistency between an
authoritative constant and a field nothing reads is not a real property; it's cosmetic, and the
brief explicitly warns against cosmetic completeness.

---

## D2. Contact channels: publish exactly three, not "email" generically

**Decision:** Flip `generalEmail`, `phone`, and the Instagram record to CONFIRMED. Leave
`collaborationEmail`, `pressEmail`, and `management.represented` exactly as MOCK/unconfirmed.

**Why:** The project owner supplied three specific values, not a blanket "contact info is now
available" instruction. Flipping the collaboration/press addresses would have meant inventing them
— the exact failure mode `docs/CONTACT_IMPLEMENTATION.md` §2 was written to prevent in Phase 7, and
still just as wrong in Phase 9. `contactChannels()` was never touched; the correct new output falls
straight out of it returning the one now-verified channel.

---

## D3. Phone number: rendered verbatim, `tel:` href normalized

**Decision:** Display `0989 000 009` exactly as supplied. Use a stripped-to-digits `tel:` URI for
the href only.

**Why:** The brief permitted exactly one class of change to a supplied value: "a technically
equivalent normalized representation" where format requires it. A `tel:` URI containing literal
spaces does not dial correctly on most platforms — this is a technical constraint of the `tel:`
scheme, not an aesthetic choice, so it qualifies. The **visible text** — the thing a reader actually
reads and could compare against something Zina posts elsewhere — was never altered.

**Guardrail:** `telHref()` lives in `src/lib/trust.ts` as a pure, narrowly-scoped function
(`phone.replace(/[^\d+]/g, "")`) so the normalization is auditable in one place rather than
repeated inline.

---

## D4. Instagram: the whole record flips, not just the URL

**Decision:** In `content/mock/social-profiles.json`, change the Instagram entry's `_mock`,
`status`, `_verification`, `handle`, `url`, and `sameAsEligible` together. Leave `followers`
untouched (still MOCK, still flagged "INVENTED NUMBER").

**Why:** A social profile record is a single claim ("this account belongs to Zina") with several
facets. The owner confirmed the account itself, not a follower count — nobody supplied one, and
`followers` is never rendered anywhere in the build, so there was nothing to reconcile it against.
Flipping the URL alone while leaving `_mock: true` and `status: "mock"` on the same record would
have been internally contradictory — a record simultaneously marked "do not treat as real" and
linked as a real identity claim via `rel="me"`.

---

## D5. `validate-content.mjs`: a narrow, provenance-gated exception, not a relaxed rule

**Decision:** Add `isConfirmed(node)` — requires `_verification === "CONFIRMED"` AND a non-empty
`_source` string — and use it to exempt exactly three checks (URL-placeholder scanning, the
`_mock`/`status` record check, the `sameAsEligible` blanket rule) for nodes that pass it. Leave the
id-prefix check (`mock-` stays required on every id, always) and the brand-relationship check
completely unconditional.

**Why — the actual tension:** Flipping the Instagram record to real broke the validator's blanket
per-item rule that every mock-collection item must carry `_mock: true`, a `mock-` id, and only
placeholder-safelisted URLs. That rule exists specifically to make an accidental leak of real data
into the mock corpus impossible to miss. Weakening it broadly would have defeated its purpose;
leaving it as-is would have made a genuinely owner-confirmed fact permanently unrepresentable.

**Why this resolution doesn't create a loophole:** The exemption requires *two* independent,
hard-to-fake signals together — an explicit verification tier AND a named source — not just the
absence of `_mock: true`. Verified empirically with a scratch-directory test: a record with
`_verification: "CONFIRMED"` but no `_source` still fails (2 errors); only adding `_source` makes
it pass. An accidental edit that flips `_mock` to `false` without also supplying both fields is
still caught.

**Why the id-prefix and brand-relationship checks stayed unconditional:** Neither one is about
"is this fact real" — the id is a stable identifier unrelated to verification state (Phase 7 set
this precedent when `person.name` went CONFIRMED without an id change), and no brand relationship
was confirmed by the owner, so there was nothing to exempt there regardless.

**This was the highest-risk change of the phase** and is documented in three places: inline in
`tools/validate-content.mjs`, in `docs/reports/PHASE_9_REPORT.md`, and here.

---

## D6. `personSchema()`: contact fields are opt-in, per caller

**Decision:** Add an optional third parameter `{ email?, telephone? }` to `personSchema()`,
defaulting to emitting neither. Only the Contact page passes it.

**Why:** `src/lib/seo.ts`'s existing rule 4 — "everything marked up is visible on the page" — predates
this phase and governs the answer directly. Email and phone are visible text only on Contact. Making
them opt-in per-call-site (rather than, say, a global site-wide contact object automatically merged
into every `Person` schema) keeps every other page's structured data matching what that page
actually shows, with no risk of a future page accidentally inheriting fields it doesn't render.

**Why `sameAs` needed no equivalent gate:** A link to an external profile is honest structured data
regardless of whether the URL string also appears as on-page text — unlike a phone number, nobody
reads a JSON-LD URL as a claim that it's printed verbatim on the page. `eligibleSocialProfiles()`
already existed and simply had nothing to return before this phase.

---

## D7. Jurisdiction: a three-state gate, not a forced binary choice

**Decision:** Restructure `LegalDocument.astro`'s gate from `!jurisdictionIsKnown()` to
`blockedItems.length === 0`, with two distinct rendered messages for "fully unknown" vs.
"jurisdiction known, other items still missing."

**Why:** The old binary gate was correct when there was exactly one fact to know. Confirming
jurisdiction while leaving entity/controller/retention/rights/governing-law/liability unresolved
produced a state the binary model literally cannot express — collapsing it to either "still fully
blocked" (dishonest: Syria *is* known) or "fully operative" (false: five more facts are still
missing) would both have been worse than adding the third state.

**Rejected alternative:** Flip the pages to "operative" once jurisdiction is known, with inline
caveats about what's still missing. Rejected — the brief's governing rule ("an unverified value
renders as an absence") applies to the *page's overall claim of completeness*, not just to
individual field values; a legal page reading as operative while missing an entity and governing
law would overstate its own completeness.

---

## D8. Method: two sections, not a rewrite

**Decision:** Add `actualProcess` as new, separate, CONFIRMED content, rendered above the existing
six-stage system. Leave the six-stage system's own verification, wording, and structure entirely
untouched.

**Why:** The six-stage framework contains granular mechanics (timed check-ins, a logged
temperature/humidity record, formal before/after comparison) that go beyond what the owner
described. The owner's description was a five-step personal-experience sequence: product arrives →
Zina tests on camera → posts to Instagram → observes for several days → publishes evaluation.
Presenting the six-stage system as "now confirmed" would have attributed invented granular detail
to the owner's account. Presenting the real process as *replacing* the six-stage system would have
discarded a working piece of Phase 5 architecture the brief said not to touch without cause. Keeping
both, clearly separated and labelled for what each is, was the only option that added the real fact
without also making an unsupported claim about the six-stage system's status.

**Ordering decision:** The real, confirmed process renders first (nearer the top), with the
proposal-status six-stage system below it — the more true statement takes the more prominent
position, and a reader meets the boundary-respecting real account before the more elaborate
unconfirmed framework.

---

## D9. `MethodLocale.actualProcess`: additive schema change

**Decision:** Add `actualProcess` as a new required field on the existing `MethodLocale` interface,
rather than introducing a parallel content type or a new collection.

**Why:** It is one more fact attached to the same locale record the six-stage system already lives
on — no new route, no new collection, matching the brief's "do not increase route count unless
required" instruction. Required (not optional) because the brief requires it in both locales; the
validator enforces both locales carry it, consistent with the project's existing bilingual-parity
rule for the rest of the Method record.

---

## D10. What was deliberately left exactly as before

Recorded here because an absence of change is itself a decision, and the brief asked that
uncertainty not be hidden:

| Item | State | Why untouched |
|---|---|---|
| `legal.entityName` | `NEEDS_VERIFICATION` | No entity was supplied; inventing one is explicitly forbidden |
| `collaborationEmail`, `pressEmail` | MOCK | Not among the three supplied channels |
| `management.represented` | `NEEDS_VERIFICATION` | Not addressed by the brief at all |
| Instagram `followers` count | MOCK, "INVENTED NUMBER" | No real count supplied; never rendered |
| Six-stage Method mechanics | MOCK | See D8 |
| `person.bios`, `location`, images | MOCK | No biography, location or photography was supplied |
| `IS_INDEXABLE_BUILD` | `false` | Driven by `CONTENT_SOURCE`, untouched; see `docs/DOMAIN_CONFIGURATION.md` §5 |
| `site.json.domain` | MOCK placeholder | See D1 |
| Terms' blocked items (governing law, entity, liability) | Unresolved | None follows from jurisdiction alone |

---

## Chronology (for reference)

1. Full audit of Phases 1–8 architecture (content schemas, gates, validators, tests) before any
   edit — per the brief's explicit instruction.
2. `SITE_URL` resolved (D1).
3. Contact data flipped: email, phone, Instagram (D2–D4).
4. `trust.ts` accessors added: `verifiedPhone`, `telHref`, `officialInstagram`.
5. `validate-content.mjs` collision discovered on first post-change validator run; resolved via D5,
   verified with a scratch-directory positive/negative test before being treated as settled.
6. `personSchema()` extended (D6); Contact page wired to it.
7. Jurisdiction resolved; `LegalDocument.astro` gate restructured (D7).
8. Method's real process added (D8–D9).
9. 14 tests found regressed by the content/behavior changes above, fixed one file at a time by
   asserting the new correct state precisely — never by weakening an assertion's power.
10. `tests/phase9.test.mjs` written: 24 tests mapped to the brief's 22-item checklist.
11. Full suite reached 445/445 passing.
12. Documentation updated across all four affected `docs/*_IMPLEMENTATION.md` files, plus this log
    and the two other new Phase 9 documents.
