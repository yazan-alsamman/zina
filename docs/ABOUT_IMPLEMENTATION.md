# About Implementation

**The person surface — where the only confirmed fact is the name.**

| | |
|---|---|
| **Status** | Implemented (Phase 7) |
| **Routes** | 2 — `/en/about/`, `/ar/about/` |
| **Confirmed facts rendered** | 1 — the name |
| **Credentials rendered** | **0** |
| **Social profiles linked** | **0** |

---

## 1. What the record actually contains

`person.json` is explicit in its own notice:

> "Bios, location and expertise below are INVENTED placeholders and are NOT verified facts about
> Zina Almokri. **Only the name is CONFIRMED.**"

| Field | Verification | Rendered |
|---|---|---|
| `name.display` | **CONFIRMED** | Yes |
| `bios.*` | MOCK | Yes, under a visible notice |
| `expertise[]` | MOCK | Yes, as practices — never as credentials |
| `philosophy` | MOCK | Yes |
| `location` | MOCK | **No** |
| `images.*` | MOCK, no asset on disk | **No** |

---

## 2. The location is on the record and is not rendered

`location: "Dubai, United Arab Emirates"` is `MOCK`, and the record's own note explains why it
matters:

> "Location materially affects Arabic dialect targeting, hreflang region and any climate-based
> testing claim. Must be confirmed before copy references it."

A wrong city would quietly justify claims about testing in heat and humidity that nobody made.
`verified()` returns `null` for it, and a test asserts that "Dubai", "United Arab Emirates" and
"UAE" appear nowhere in the build.

---

## 3. No credential, anywhere

Deliberately absent, and absent from the record too:

degrees · licences · certifications · dermatologist or medical status · years of experience ·
awards · press · publications · follower counts · client lists · brand partnerships · "as seen in"
· testimonials

Tests assert each of these against the rendered page. Nothing here is hedged — the words simply do
not appear.

### `expertise` is rendered as practice, not qualification

The record's `expertise[]` is a list of `{ label, detail }` — things the work involves. It renders
under the heading **"What the work involves"**, as a description list. It is never rendered as a
skill bar, a percentage, a years count or a credential, and the record contains no such field.

---

## 4. No social profile is linked

Every entry in `social-profiles.json` carries `sameAsEligible: false`, and each URL is a `.mock`
handle. `eligibleSocialProfiles()` returns `[]`.

A test asserts that **no page in the build** contains `instagram.com`, `tiktok.com`, `youtube.com`,
`snapchat.com`, `pinterest.com`, `twitter.com`, `x.com` or `facebook.com`.

Linking an unverified profile is an identity claim: it asserts that a particular account is hers.
If wrong, the site directs her audience to someone else.

---

## 5. The mock biography is labelled

The bios render — an About page with no biography would be pointless — beneath a visible notice:

> The biography on this page is placeholder text written for development. It has not been supplied
> or approved by Zina Almokri, and nothing in it should be read as a statement about her.

Gated on `IS_MOCK_SOURCE`, so it disappears automatically when real content replaces the mock
layer.

---

## 6. Where the authority claim actually lives

Not in credentials, not in follower counts, not in press. The page's two outbound links are:

| Link | What it offers a sceptic |
|---|---|
| **Method** | The testing protocol every record follows |
| **Editorial Standards** | How evidence, disclosure and corrections are handled |

Both are real pages a reader can check. That is the whole argument of the page: authority comes
from the method being visible and the limits being stated.

**About does not restate the Method.** A test asserts the six stage keys (`baseline`,
`wear-window`, `conditions`, `revisit`, …) appear as ids on the Method page alone. The Method
remains the single source of truth for the six-stage protocol, which remains **PROJECT MOCK
METHOD** and is nowhere described as Zina's established real-world methodology.

---

## 7. Design — the Testing Room, lightly

The evidence devices (Plate, Conditions Well, Disclosure Band, Three Voices, Margin Index) belong
to *evidence*. This page is a person talking, so it uses none of them.

What it does use: the same type scale, the same hairlines, the same warm-ink ground — and a
narrower column (`max-inline-size: 52rem`) with more air than the review surfaces. Recognisably the
same publication, deliberately quieter.

Not a resume, not a LinkedIn clone, not a media kit, not a credential wall.

---

## 8. Structured data

`BreadcrumbList` + **`Person`** — and this is the canonical definition of the Person entity that
every other page references by `@id`.

`personSchema()` already refuses `sameAs` (no profile is eligible) and the unverified location. The
About page adds nothing to it.

Asserted absent from the Person block: `sameAs`, `hasCredential`, `alumniOf`, `award`, `address`,
`homeLocation`, `worksFor`, `interactionStatistic`.

What it does carry: `name`, `jobTitle`, `description`, `@id`. All from the record.

---

## 9. Known limits

| Limit | Status |
|---|---|
| The entire biography is placeholder text | **Owner must supply real copy** |
| No portrait or photography | Every image path is a placeholder with no asset |
| Location unknown | MOCK; blocks dialect targeting and any climate claim |
| No verified social account | All `sameAsEligible: false` |
| Arabic copy | Unreviewed by a native reader (H-1) |
| The six-stage Method | **PROJECT MOCK METHOD** — not Zina's confirmed practice |
