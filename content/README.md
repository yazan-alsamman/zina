# Content Layer

This directory is the **single source of truth for all site content**. No biography, statistic,
product, brand, review, or social URL may be hard-coded inside a component. Components receive
content; they never contain it.

## Structure

```
content/
├── mock/            ← FICTIONAL placeholder content (Phase 0). Replaced 1:1 with real content later.
├── real/            ← (does not exist yet) Real, client-verified content. Created in the migration phase.
└── schema/          ← Portable type definitions + field documentation. Framework-agnostic.
```

## The mock contract

Everything in `content/mock/` is **invented**. It is not a claim about Zina Almokri, and it is not
a claim about any real company. It exists only to exercise the UI, the routing, the SEO layer, and
the internal-link graph before real content is available.

Four mechanisms make mock data impossible to ship by accident:

| Mechanism | Where | Purpose |
|---|---|---|
| `"__MOCK_DATA__": true` | Top of every mock JSON file | File-level marker |
| `"_mock": true` | Every record | Record-level marker |
| `mock-` id prefix | Every `id` field | Grep-detectable in build output |
| `.mock` / `example.com` URLs | Every URL field | Never resolves to a real property |

Run `node tools/check-mock-guard.mjs <dir>` to fail a build that contains any of the above.
See `docs/REAL_CONTENT_MIGRATION.md` for the replacement procedure.

## Validating

```
node tools/validate-content.mjs      # schema + referential integrity + mock-marker completeness
```

## Field verification status

Every record carries `_verification`, one of:

- `CONFIRMED` — verified against the client brief (`docs/CONTENT_VERIFICATION_MATRIX.md`)
- `NEEDS_VERIFICATION` — real field, real value not yet supplied
- `MOCK` — fictional placeholder

Only two facts are currently `CONFIRMED`: the name *Zina Almokri / زينا المقري*, and that she
tests beauty products on her own skin and publishes evaluations. Everything else is `MOCK`.
