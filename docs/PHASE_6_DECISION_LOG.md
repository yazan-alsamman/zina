# Phase 6 — Decision Log

**Editorial Publishing System: Journal, MDX, long-form reading and editorial linking.**

Every decision that constrains future work, with the alternative that was rejected and why.
Decisions are numbered `D6-n`.

---

## D6-1 — MDX carries prose only; no frontmatter, no second schema

**Decision.** Article bodies are `.mdx` files with **no YAML frontmatter**. The JSON record owns
every entity field; the MDX file owns only the words.

**Rejected.** Frontmatter carrying `title`, `date`, `category`, etc.

**Why.** Two places to state one fact is two places for one fact to be wrong. With no frontmatter
there is nothing in the body that *can* drift from the record. Enforced by validator check 2.

**Consequence.** A body cannot be understood in isolation — it needs its record. Accepted: that is
what a canonical id is for.

---

## D6-2 — No Astro Content Collections

**Decision.** Reaffirmed from Phase 4. Bodies are loaded with `import.meta.glob`, not
`getCollection()`.

**Rejected.** The idiomatic Astro approach.

**Why.** Collections make Zod frontmatter the source of truth for entity fields. This project
already has one — `content/schema/types.ts` plus `tools/validate-content.mjs`. Adopting
collections would fork the schema, the lifecycle rules, the locale contract and the relationship
graph, and would make `docs/REAL_CONTENT_MIGRATION.md` a two-store migration.

**Cost accepted.** ~60 lines of glob and one validator, written by us.

---

## D6-3 — Bodies bind to records by filename

**Decision.** `{recordId}.{locale}.mdx`. The filename is the entire join key.

**Why.** It is the only join that cannot disagree with itself, and it puts the locale *in the key*,
so the missing-translation rule holds at the body layer: a body exists or it does not, with no
third state.

**Enforced.** `tools/check-journal-bodies.mjs` verifies correspondence in **both** directions —
missing bodies *and* orphans.

---

## D6-4 — `import.meta.glob` moved to its own module

**Decision.** The MDX loader lives in `src/lib/journal-bodies.ts`. `src/lib/journal.ts` is pure.

**Trigger.** A real defect. `import.meta.glob` is a Vite *compile-time transform*, not a function,
and does not exist under Node:

```
TypeError: (intermediate value).glob is not a function
```

Its presence made the entire journal layer — routing, taxonomy, gates, link graph — unimportable by
`node --test`, for a reason unrelated to any of it. The project's testing contract is that tests
exercise **the same `.ts` modules the bundler compiles**; one line had silently voided that.

**Rule established.**

> A build-tool-specific API may not sit in a module that also holds testable domain logic.

---

## D6-5 — Journal taxonomy is editorial FORMAT, never product category

**Decision.** `testing-notes`, `guides`, `comparisons`, `essays`. Reviews keep product categories.
The two sets share no value.

**Rejected.** Organising the journal by `foundation` / `concealer` / `lip` to match review facets.

**Why.** Running one taxonomy twice over one subject creates two competing URL sets for the same
queries, splits internal-link equity, and forces a reader to guess whether "foundation" means
articles or reviews.

**Enforced.** A test asserts the two key sets are disjoint. This is the journal decision most
likely to be reversed by someone optimising a keyword in isolation, so it is asserted rather than
documented.

---

## D6-6 — Category keys are derived from content, labels are mapped

**Decision.** `journalCategories()` derives keys from the articles. `journal-labels.ts` maps a key
to a UI string per locale and **falls back to the key** rather than inventing one.

**Why.** A new format appears the moment an article declares it — no template edit. But a label is
copy, and copy is authored, not generated. A missing label degrades visibly instead of producing a
plausible-looking machine translation.

**Enforced.** A test asserts every live key has a real label in both locales.

---

## D6-7 — The TOC gate is a named predicate, not a `>= 4` in the template

**Decision.** `TOC_SECTION_GATE = 4` and `earnsTableOfContents()` live in `src/lib/journal.ts`.

**Trigger.** A test asserting "the gate excludes something" failed: **every** article in the corpus
has 4–6 sections, so build output can only ever show the gate saying *yes*.

**Why it matters.** A rule never observed to refuse is not a verified rule. Extracting the
predicate lets the refusal path be tested at 0, 1, 3, 4 and 9 sections regardless of what content
happens to exist.

**Rejected.** Weakening the test to "a TOC appears somewhere." That would have asserted less in
order to pass, which is backwards.

---

## D6-8 — A table of contents is never automatic

**Decision.** Below four sections, no TOC.

**Why.** A TOC on a three-section article is furniture: it repeats the article's own headings above
the article, pushes the opening line down, and hands the reader a decision where they should simply
be reading.

---

## D6-9 — Custom MDX components are named for editorial meaning

**Decision.** Exactly two: `EditorialNote`, `ReviewReference`.

**Explicitly refused.** `BlogCard`, `ArticleCard`, `ContentCard`, `InfoCard`. There is no Card
anywhere in this codebase and a test asserts it.

**Why these two exist at all.** Each does something markdown cannot:

- `EditorialNote kind="boundary"` makes the medical/scope boundary **structural**, so it cannot be
  removed by editing prose. Phase 1 requires the boundary; a heading someone can delete is not a
  requirement, it is a suggestion.
- `ReviewReference` resolves a route from a canonical id, is locale-safe, refuses unpublished
  targets, and carries the record's **disclosure** into the citation.

**Enforced.** An allowlist in the validator. MDX's failure mode for an unregistered component is to
render its name as literal text — a silent defect that ships.

---

## D6-10 — `Figure` was specified and deliberately not built

**Decision.** Not implemented.

**Why.** No body contains an image. Building it would produce a component with no caller and no
rendered output to verify — an untested abstraction justified by a spec rather than by content.

**Recorded as deferred, not as done.**

---

## D6-11 — The citation carries the disclosure

**Decision.** `ReviewReference` renders the cited record's disclosure label inline, before the
click.

**Why.** This is what makes it a citation of *evidence* rather than a link. A reader following a
finding to the record that demonstrates it deserves to know the commercial status of that record
before they arrive. It is the review page's disclosure band, applied at sentence level.

---

## D6-12 — An unknown citation id breaks the build

**Decision.** `ReviewReference` throws at build time on an unresolvable id.

**Why.** A typo in prose must not ship as a silent nothing. Prose is not type-checked, so the
component is the only place this can be caught.

**Distinguished from:** a citation whose target does not exist *in this locale*. That is not an
error — it renders as plain text, because the reference is still editorially meaningful and a
cross-locale link would violate the locale contract.

---

## D6-13 — Citation is the floor; curation cannot subtract

**Decision.** A review page surfaces the **union** of articles citing it and articles curated for
it, citations first. `journalForReview()`.

**Trigger.** A real defect found by comparing the two stored relationships:
`article.related.reviewIds` (a citation) and `review.related.journalIds` (a curation) disagreed in
four places. In one — the Arabic Voile Lumiere record — an article cited the record and the record
linked back to nothing. The evidence graph had a hole in exactly the direction this phase exists to
build.

**Rejected.** Editing the mock content to make the two fields agree. That would have hidden a
structural problem behind data that happens to line up.

**Rule.** Curation may add to what a review surfaces; it can never subtract a real citation.

---

## D6-14 — No prose was authored by the build

**Decision.** `scripts/seed-journal-mdx.mjs` performed a one-way format migration of Phase 1's JSON
section outlines into MDX. Four bodies were then hand-edited, each carrying a provenance comment
stating: *"NO PROSE WAS ADDED OR CHANGED — existing text was marked up, nothing was written."*

**Why it is literally true.** The edits wrapped existing sentences in `EditorialNote` or appended a
`ReviewReference`. The citation component carries its own "Documented in" / "موثق في" label
*precisely so that* citing a record requires no hand-written lead-in.

**Consequence.** The content remains **MOCK**. The six-stage Method remains **PROJECT MOCK
METHOD**. Nothing about Zina, her protocols, brand relationships or results was invented.

**Seeder is idempotent** — skips existing files, requires `--force` to overwrite. It is a migration
tool, not a generator, and cannot silently discard hand-edited prose.

---

## D6-15 — Emphasis is weight, never italic

**Decision.** `font-style: italic` appears **zero times** in the shipped CSS. `<em>` renders as
weight and colour in both scripts.

**Why.** Arabic has no italic form; a synthesised oblique is a rendering defect, not emphasis.
Using one mechanism for both scripts means the Arabic case is the designed case, not a fallback.

---

## D6-16 — `Prose.astro` is the only tag-scoped typography in the codebase

**Decision.** Bare elements (`p`, `h2`, `blockquote`, `table`, …) are styled by tag in exactly one
scoped component.

**Why.** Editorial typography must not leak into every surface. A test asserts no bare element
selector exists globally in the shipped CSS.

---

## D6-17 — The gated-facet canonical rule is expressed once, for all sections

**Decision.** When journal archives were added, `tests/output.test.mjs` was generalised rather than
given a second hardcoded branch:

> a gated facet canonicalises to its section index and must not claim indexability

**Why.** Journal archives and review facets are the same rule. Two copies of one rule diverge.

---

## D6-18 — Stale Phase 5 assertions were updated, not deleted

**Decision.** Two Phase 5 tests hardcoded `/journal/` as *unimplemented*. They were updated to
assert the new reality **and given positive assertions** (journal index, article and archive routes
are emitted in both locales) so the check retains its force.

**Why.** Deleting a failing assertion reduces coverage. The correct response to "this rule changed"
is to state the new rule, not to stop checking.

---

## Decisions requiring human approval

| # | Decision | Why it needs a person |
|---|---|---|
| **H-1** | Arabic editorial copy quality | Measured correct (direction, isolation, factors). **Not reviewed by a native Arabic reader.** |
| **H-2** | Screen-reader behaviour | **UNVERIFIED — HUMAN REVIEW REQUIRED.** A structural audit is not a screen-reader pass. |
| **H-3** | The format taxonomy's four values | An editorial judgment about what the publication publishes, not a technical one. |
| **H-4** | Whether curation may include non-citing articles under "From the Journal" | Implemented as permitted (D6-13). An editor may prefer citations only. |
| **H-5** | Production origin (U-01) | `SITE_URL` is still `https://example.invalid`. **Blocking for launch.** |
