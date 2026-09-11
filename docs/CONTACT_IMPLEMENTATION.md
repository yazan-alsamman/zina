# Contact Implementation

**A contact surface with no form and no address — and why both absences are the correct
implementation rather than an incomplete one.**

| | |
|---|---|
| **Status** | Implemented (Phase 7) |
| **Routes** | 2 — `/en/contact/`, `/ar/contact/` |
| **Contact channels published** | **0** — none is CONFIRMED |
| **Forms** | **0** |
| **Client JavaScript** | 0 bytes |

---

## 1. There is no form, and that is the point

A contact form is a promise: *type here and it reaches a person.* Honouring it requires a
destination — a mail handler, an endpoint, an inbox. This project has **no backend**, by explicit
architectural decision, and none is planned for this phase.

**A form without a destination is the worst available option.** It looks functional, it accepts a
message someone took time to write, and then it silently discards it. The reader believes they have
made contact. They have not.

Every alternative dishonesty is smaller:

| Option | Why it is still wrong |
|---|---|
| A disabled form | Advertises a channel and invites a retry |
| A "coming soon" form | A form that does not work, with an excuse attached |
| A `mailto:` form | Requires an address, and no address is verified (§2) |

So the page carries **no `<form>`, no inputs, no `<textarea>`, no `<select>`, no submit control and
no fake success state**. Asserted by test, scoped to `<main>`.

### The one input in the build is not a form field

The shared site header contains exactly one `<input>`: a `type="checkbox"` with `id="menu-toggle"`
that drives the mobile menu **with no JavaScript**. It is a navigation control present on every
page, its state never leaves the browser, and it collects nothing a reader types.

A test asserts this positively: *the only input in the entire build is the CSS-only menu toggle*,
and no `<form>` exists anywhere. That is a stronger guarantee than "the contact page has no form",
because it would catch a form appearing on any page.

---

## 2. And there is no address either

All three addresses in `site.json` are MOCK:

```
generalEmail       hello@zinaalmokri.example.com          MOCK
collaborationEmail collaborations@zinaalmokri.example.com MOCK
pressEmail         press@zinaalmokri.example.com          MOCK
phone              null                                   NEEDS_VERIFICATION
management         represented: false                     NEEDS_VERIFICATION
```

`contactChannels()` returns only CONFIRMED values, so it returns `[]`, and the page renders the
**absence**.

### Why not publish the obvious guess

`hello@zinaalmokri.com` is the natural guess and the dangerous one. An unverified address may
belong to nobody — in which case mail vanishes and the reader believes they wrote to Zina — or it
may belong to **somebody else**, in which case this site directs strangers' mail to them.

Tests assert that no address of any shape (`/[\w.+-]+@[\w-]+\.[\w.]+/`), no `mailto:` link, and
none of the five guessable addresses appears anywhere in the build.

### Management is also withheld

`represented: false` is itself `NEEDS_VERIFICATION`. `management()` therefore returns `undefined`
rather than asserting "not represented" — which would be a statement about Zina's business
arrangements that nobody has confirmed.

---

## 3. The absence is stated, not silent

An omitted contact section reads as an oversight. This is a decision, so the page says so, in the
reader's own language, in the same band treatment as the review disclosure and the brand
relationship:

> **No contact channel is published yet**
>
> No email address for this site has been confirmed, so none is published here. An address that has
> not been verified could belong to nobody, and a message sent to it would simply disappear. There
> is deliberately no contact form either: a form with no destination accepts a message and discards
> it. This page will carry a real address once one is confirmed.

Never small print, never a `<details>`, never omitted.

---

## 4. The page is not a dead end

It offers two real destinations — the things a reader arriving at "contact" most often actually
wants:

| Link | Why |
|---|---|
| Editorial Standards | How disclosure, corrections and claims are handled |
| Method | How a product is tested before it is written about |

It also renders `person.bios.collaboration` — the record's own statement about what kind of work is
considered — which is editorial copy, not a channel.

---

## 5. Accessibility

No form exists, so the form-semantics requirements do not apply. What was verified:

| Property | Result |
|---|---|
| `h1` per page | 1 |
| Heading outline | `1,2,2,2,2,2` — no skips |
| Landmarks | header, nav ×3, main, section ×2, footer |
| Nav accessible names | unique, in the page's own locale |
| Links without a discernible name | 0 |
| Positive `tabindex` | 0 |
| Skip link | present, first, → `#main` |
| Overflow at 320–1440, both locales | none |

**If a real endpoint is later supplied**, §23 of the Phase 7 brief applies in full: real labels,
semantic required state, accessible error state, visible focus, appropriate `autocomplete`, no
colour-only validation, keyboard-only operation, no positive `tabindex`, and working semantics
without JavaScript. That is also the first genuinely justified place in this project to introduce
client JavaScript — and only if progressive enhancement cannot carry it.

---

## 6. SEO

`BreadcrumbList` only.

**No `ContactPage` with a `ContactPoint`.** A `ContactPoint` asserts a reachable channel, and there
is none. No `Organization`, no `email`, no `telephone`, no `sameAs`.

Reciprocal hreflang (`en`, `ar`, `x-default`), self-canonical, `noindex, follow` while the source
is mock.

---

## 7. Vocabulary note

The page's own label is **"Collaborate"** (`collaborate` / `تعاون`), the word `site.json` already
uses for this destination in navigation. Phase 7 reused it rather than introducing a second word
("Contact") for the same page — one destination, one name.

The route remains `/{locale}/contact/`, which is the canonical route shape declared in
`site.json → routes`.

---

## 8. Known limits

| Limit | Status |
|---|---|
| No verified contact channel | **Blocking for launch** — owner must supply one |
| No backend | By design this phase |
| Management representation unknown | `NEEDS_VERIFICATION` |
| Arabic copy | Unreviewed by a native reader (H-1) |
