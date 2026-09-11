# MDX Architecture

**How article prose is authored, bound, compiled, rendered and validated — and why MDX carries no
schema.**

| | |
|---|---|
| **Status** | Implemented (Phase 6) |
| **Integration** | `@astrojs/mdx@4.3.14` |
| **Body files** | 10, in `content/mock/journal-bodies/` |
| **Frontmatter** | **None. Deliberately.** |
| **Content Collections** | **Not used.** Phase 4 decision, reaffirmed |
| **Client JavaScript** | 0 bytes |

---

## 1. The one-sentence rule

> **MDX is a rendering mechanism for prose. It is not an entity schema.**

Everything in this document follows from that sentence. The JSON record owns every *fact* about an
article — id, slug, locale, status, category, dates, relationships, disclosure. The MDX file owns
only the *words*. Neither can express what the other expresses, so neither can contradict the
other.

---

## 2. Why not Astro Content Collections

Content Collections are the obvious answer and the wrong one here. The decision was taken in
Phase 4 and is unchanged.

A collection defines a **Zod schema per collection** and makes the frontmatter the source of truth
for entity fields. This project already has a source of truth: `content/schema/types.ts` and the
JSON records validated by `tools/validate-content.mjs`. Adopting collections would mean:

| Consequence | Why it is unacceptable |
|---|---|
| **Two schemas for one entity** | An article's `status` would live in Zod frontmatter; a review's in `types.ts`. The lifecycle rules (`PUBLISHABLE_STATES`, the render gates) would have to be implemented twice and kept in agreement by memory. |
| **Locale handling forks** | The locale-as-authoring-contract rule (missing translation ⇒ no route) is enforced in `src/lib/content.ts` against `record.locales`. Collections would express the same relationship as a filename convention and a second set of queries. |
| **The relationship graph splits** | `articleReviews`, `articleSiblings`, `articlesCitingReview` all traverse canonical ids. Half the graph living in frontmatter would make the traversal cross two stores. |
| **Migration cost is paid twice** | `docs/REAL_CONTENT_MIGRATION.md` describes replacing the mock layer. Two stores means two migrations. |

The cost of *not* using collections is that we write our own glob and our own validator. That cost
is about 60 lines of `src/lib/journal-bodies.ts` and one tool. It is a good trade.

---

## 3. The binding: filename, not frontmatter

```
content/mock/journal-bodies/{recordId}.{locale}.mdx
```

```
mock-journal-how-to-evaluate-foundation-performance.en.mdx
mock-journal-how-to-evaluate-foundation-performance.ar.mdx
mock-journal-arabic-shade-vocabulary.ar.mdx          ← Arabic-only. No .en sibling.
mock-journal-understanding-finish-and-texture.en.mdx ← English-only. No .ar sibling.
```

The filename is the entire join key. A body carries **no `---` fence at all**, so there is nothing
in the file that can drift from the record.

**The locale is part of the key, not a field inside the file.** This is what makes the
missing-translation rule work at the body layer: an Arabic body either exists or it does not, and
there is no third state in which a file exists but claims to be untranslated.

### A convention nothing checks is not a contract

`tools/check-journal-bodies.mjs` enforces the binding in **both directions**:

1. every renderable article + locale has exactly one body
2. every body maps to a renderable article + locale (no orphans)

Plus five more checks — see §7.

---

## 4. Loading: `import.meta.glob`, and why it lives alone

```ts
// src/lib/journal-bodies.ts
const bodyModules = import.meta.glob<JournalBody>("../../content/mock/journal-bodies/*.mdx", {
  eager: true,
});
```

Eager, build-time, statically analysable. Nothing reaches the client.

### The module split (Phase 6 defect, fixed)

`import.meta.glob` is a **Vite compile-time transform, not a function**. It does not exist under
plain Node. While it sat inside `src/lib/journal.ts`, that module could not be imported by
`node --test`:

```
TypeError: (intermediate value).glob is not a function
    at src/lib/journal.ts:101:33
```

Every other module in `src/lib` is deliberately runnable under Node's native type-stripping, so
tests exercise **the same `.ts` files the bundler compiles** rather than a parallel
reimplementation of the rules. One line of build-tool API had silently forfeited that for the
entire journal layer — routing, taxonomy, gates and the link graph all became untestable for a
reason unrelated to any of them.

**The rule this now encodes:**

> A build-tool-specific API may not sit in a module that also holds testable domain logic.

| Module | Contains | Node-testable |
|---|---|---|
| `src/lib/journal.ts` | taxonomy, gates, relationships, reserved segments | **Yes** |
| `src/lib/journal-bodies.ts` | `import.meta.glob`, body index, headings | No — and holds nothing else |

---

## 5. Rendering

```astro
---
const body = journalBody(record.id, locale);
const Body = body?.Content;
---
{Body && (
  <Prose>
    <Body components={{ EditorialNote, ReviewReference }} />
  </Prose>
)}
```

Three things worth naming:

**`MDXInstance` from `astro`, not a hand-rolled shape.** Typing the module as
`MDXInstance<Record<string, unknown>>` keeps `Content` a real component factory, so the template
renders it without a cast. An earlier attempt typed `Body` as `never`.

**Components are passed directly, not wrapped in arrow functions.** Wrapping each entry
(`{ EditorialNote: (props) => <EditorialNote {...props} /> }`) is a React idiom that breaks Astro
component resolution.

**The locale is declared in the body, per usage.** `<ReviewReference locale="ar" …/>`. It is not
inherited implicitly, because implicit inheritance is exactly the mechanism that produces a
cross-locale link nobody notices. The validator asserts every `locale=` attribute matches the
filename locale.

---

## 6. Components available to a body

Only two. Both are named for **editorial meaning**, not for layout.

| Component | What it means | Why it is not a markdown primitive |
|---|---|---|
| `EditorialNote` | An aside that carries an editorial boundary or a caveat. `kind="boundary"` is the medical/scope limit Phase 1 requires. | A blockquote would style it; only a component can make the boundary *structural*, so it cannot be deleted by editing prose. |
| `ReviewReference` | An in-prose citation of a testing record. | Resolves the route from a canonical id (no URLs in prose), is locale-safe, refuses unpublished targets, and carries the record's **disclosure** into the citation. See `docs/JOURNAL_LINKING.md`. |

`Figure` was specified in the brief and **not built** — no body contains an image, so building it
would have been a component with no caller and no rendered output to verify. It is listed as
deferred in the Phase 6 report.

**Explicitly refused:** `BlogCard`, `ArticleCard`, `ContentCard`, `InfoCard`. The index treatment
is image, hairline, type. There is no Card anywhere in this codebase and the test suite asserts it.

### The allowlist is enforced

`ALLOWED_COMPONENTS = { EditorialNote, ReviewReference }`. A body using anything else fails the
build-time validator, because MDX's failure mode for an unregistered component is to render its
name as literal text — a silent defect that ships.

---

## 7. The validation layer

`tools/check-journal-bodies.mjs` — `npm run validate:journal`, wired into `npm run verify`.

| # | Check | Failure it prevents |
|---|---|---|
| 1 | **Correspondence**, both directions | An article with no prose; a body for a deleted record |
| 2 | **No frontmatter** | A body silently becoming a second schema |
| 3 | **No absolute origins** | A hardcoded domain escaping `src/config/site.ts` |
| 4 | **Locale honesty** | `locale="en"` inside an `.ar.mdx` file |
| 5 | **Reference safety** | A citation of a nonexistent or unrenderable record |
| 6 | **Internal link safety** | A raw `](/…)` link that is cross-locale, slashless, or unrouted |
| 7 | **Component allowlist** | A component name rendering as literal text |

Checks 5 and 6 are the ones that justify the tool's existence: a prose file can name a route, and
prose is not type-checked.

### Current state

```
records x locales expected   10
body files found             10
PASS  every body maps to a record, carries no schema, and cites only what exists
```

---

## 8. Seeding

`scripts/seed-journal-mdx.mjs` performed a **one-way format migration** from the Phase 1 JSON
section outlines:

- `sections[].heading` → `## heading`
- `sections[].summary` → a paragraph
- no frontmatter emitted

It is **idempotent** — it skips files that exist, and requires `--force` to overwrite. It is a
migration tool, not a generator: it will not be run again, and running it cannot silently discard
hand-edited prose.

**Four bodies were hand-edited afterwards**, each carrying a provenance comment stating exactly
what changed:

> `HAND-EDITED after seeding: … NO PROSE WAS ADDED OR CHANGED — existing text was marked up,
> nothing was written.`

That claim is literally true: the edits wrapped existing sentences in `EditorialNote`, or appended
a self-labelling `ReviewReference` (the citation component carries its own "Documented in" /
"موثق في" label precisely so that citing a record requires no hand-written lead-in prose). **No
sentence in this project was authored by the build.**

The provenance comments are MDX comments and never reach the reader — asserted in
`tests/longform.test.mjs`.

---

## 9. Compilation settings

```ts
mdx({ syntaxHighlight: false, gfm: true })
```

| Setting | Reason |
|---|---|
| `syntaxHighlight: false` | This is a beauty publication. A highlighter would ship a grammar bundle and a theme for content that contains no code. |
| `gfm: true` | Tables and strikethrough are ordinary editorial needs. |

No remark/rehype plugins are configured. Heading ids come from Astro's own `getHeadings()`, which
is also what feeds the gated table of contents.

---

## 10. What the build proves

| Property | Evidence |
|---|---|
| Bodies rendered as real HTML | `<h2>`/`<p>` present in every `.prose`; no raw `##` in text |
| No component leakage | No occurrence of `EditorialNote` / `ReviewReference` / `Figure` / `Prose` as text |
| No expression leakage | No `{…}`, no `[object Object]`, no `undefined`, no `---` fence |
| No authoring metadata shipped | No seed or hand-edit comment in any page |
| Zero client JS | 0 `.js` files emitted across 57 routes |

All asserted in `tests/longform.test.mjs` (28 tests).

---

## 11. Known limits

- **`Figure` unbuilt** — no body contains an image (see §6).
- **No table or figure exists in any body**, so the long-form table-overflow and caption-wrapping
  behaviours are **implemented but unexercised by content**. Recorded honestly in the Phase 6
  report rather than claimed as verified.
- **The prose styling is scoped to one component.** `Prose.astro` is the only place bare elements
  are styled by tag. If a second such place is ever added, editorial typography will leak into
  every surface.
