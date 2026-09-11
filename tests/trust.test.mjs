/**
 * TRUST SURFACE TESTS — Contact, About, Editorial Standards and the legal foundation.
 *
 * These four surfaces share one failure mode: each is a PROMISE, and a plausible-looking wrong
 * value is worse than a stated gap.
 *
 *   a contact address promises  "mail sent here reaches a person"
 *   a credential promises       "this person is qualified in this way"
 *   a standard promises         "this is how we actually behave"
 *   a jurisdiction promises     "these are the laws that apply to you"
 *
 * So most of what follows asserts absences, and asserts that each absence is STATED rather than
 * silent — because an omitted contact section reads as an oversight, and an omitted relationship
 * statement reads as independence.
 */

import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  USES_TRACKING,
  contactChannels,
  editorialStandards,
  hasAnyContactChannel,
  hasContactChannel,
  jurisdictionIsKnown,
  legalIdentity,
  management,
  officialInstagram,
  standardsAreApproved,
  telHref,
  verifiedPhone,
} from "../src/lib/trust.ts";
import { eligibleSocialProfiles, person, site, verified } from "../src/lib/content.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const pages = [];
function collect(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collect(full);
    else if (entry === "index.html") {
      pages.push({
        route: full.replace(dist, "").replace(/\\/g, "/").replace("/index.html", "/"),
        html: readFileSync(full, "utf8"),
      });
    }
  }
}

before(() => {
  assert.ok(existsSync(dist), "dist/ not found — run `npx astro build` first");
  collect(dist);
});

const at = (route) => pages.find((p) => p.route === route);
const surfaces = (segment) => pages.filter((p) => new RegExp(`^/(en|ar)/${segment}/$`).test(p.route));
const stripTags = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/* ================================================================= contact */

describe("contact publishes exactly the channels the project owner confirmed, nothing else", () => {
  test("general email and phone are CONFIRMED (Phase 9); collaboration/press/management remain unconfirmed", () => {
    assert.deepEqual(contactChannels(), [{ key: "general", address: "contact@zinaalmokri.com" }]);
    assert.equal(hasContactChannel(), true);
    assert.equal(verifiedPhone(), "0989 000 009");
    assert.equal(management(), undefined, "management/agency representation was never supplied");
  });

  test("telHref() normalises the phone to digits only — the display text is never altered", () => {
    assert.equal(telHref(verifiedPhone()), "tel:0989000009");
  });

  test("officialInstagram() returns exactly the supplied URL and handle, verbatim", () => {
    assert.deepEqual(officialInstagram(), {
      handle: "zina.almokri",
      url: "https://www.instagram.com/zina.almokri?stkn=MTI4aHRmMGZ0bDdibw==",
    });
  });

  test("the confirmed general address appears on the contact pages; collaboration/press do not", () => {
    for (const page of surfaces("contact")) {
      assert.ok(page.html.includes('mailto:contact@zinaalmokri.com'), `${page.route}: missing the confirmed address`);
      for (const unconfirmed of ["collaborations@zinaalmokri", "press@zinaalmokri"]) {
        assert.ok(!page.html.includes(unconfirmed), `${page.route}: published an unconfirmed address`);
      }
    }
  });

  test("no OTHER guessable address is anywhere in the build", () => {
    // The confirmed address is real; every OTHER plausible guess remains exactly as dangerous as
    // before — it may belong to nobody, or to someone else.
    for (const page of pages) {
      for (const guess of ["hello@zinaalmokri", "info@zinaalmokri", "team@zinaalmokri",
        "support@zinaalmokri", "collaborations@zinaalmokri", "press@zinaalmokri"]) {
        assert.ok(!page.html.includes(guess), `${page.route}: contains unconfirmed guess "${guess}"`);
      }
    }
  });

  test("THERE IS NO FORM — no form, no inputs, no submit control", () => {
    // Scoped to <main>, because the shared site header carries one legitimate input: a CSS-only
    // checkbox that drives the mobile menu with no JavaScript. That is a navigation control on
    // every page, not a contact field, so the page's OWN content is what this asserts.
    for (const page of surfaces("contact")) {
      const main = page.html.match(/<main[\s\S]*?<\/main>/);
      assert.ok(main, `${page.route}: no main landmark`);
      for (const element of ["<form", "<input", "<textarea", "<select", "<button"]) {
        assert.ok(!main[0].includes(element), `${page.route}: rendered ${element} in the page body`);
      }
    }
  });

  test("the ONLY input in the entire build is the CSS-only menu toggle", () => {
    // Stated positively so a real form cannot appear anywhere without this failing.
    for (const page of pages) {
      const inputs = [...page.html.matchAll(/<input[^>]*>/g)].map((m) => m[0]);
      for (const input of inputs) {
        assert.ok(
          /id="menu-toggle"/.test(input) && /type="checkbox"/.test(input),
          `${page.route}: an unexpected input exists — ${input}`
        );
      }
      assert.ok(inputs.length <= 1, `${page.route}: more than one input`);
      assert.ok(!/<form/.test(page.html), `${page.route}: a form exists`);
    }
  });

  test("no fake endpoint or success state exists anywhere in the build", () => {
    // A success STATE is a confirmation addressed to the reader after an action. The contact page
    // legitimately contains the words "a message sent to it would simply disappear" — that is the
    // explanation of why no address is published, which is the opposite of a fake confirmation.
    for (const page of pages) {
      assert.ok(!/action="/.test(page.html), `${page.route}: a form action exists`);
      assert.ok(!/role="status"|aria-live=/.test(page.html), `${page.route}: a live status region`);
      const text = stripTags(page.html).toLowerCase();
      for (const phrase of ["your message has been sent", "thanks for getting in touch",
        "we'll be in touch", "submission received", "message received", "we have received your"]) {
        assert.ok(!text.includes(phrase), `${page.route}: fake success state "${phrase}"`);
      }
    }
  });

  test("the channels are rendered, not the absence band — the gate flipped honestly", () => {
    // Phase 7's "unavailable" band existed for exactly this scenario's opposite: it must now be
    // GONE, because a channel is genuinely confirmed. If it ever reappears, contactChannels()
    // and/or verifiedPhone()/officialInstagram() silently stopped returning confirmed data.
    for (const page of surfaces("contact")) {
      assert.ok(/class="channels"/.test(page.html), `${page.route}: the channels section is missing`);
      assert.ok(
        !/class="unavailable"/.test(page.html),
        `${page.route}: still shows the "no channel published" band despite confirmed contacts`
      );
    }
  });

  test("the page still offers real destinations rather than a dead end", () => {
    for (const page of surfaces("contact")) {
      const locale = page.route.slice(1, 3);
      assert.ok(page.html.includes(`href="/${locale}/editorial-standards/"`), page.route);
      assert.ok(page.html.includes(`href="/${locale}/method/"`), page.route);
    }
  });
});

/* ================================================================= about */

describe("about asserts no credential", () => {
  test("only the NAME is confirmed on the person record", () => {
    const record = person();
    assert.equal(record.name._verification, "CONFIRMED");
    assert.equal(record._verification, "MOCK");
    assert.equal(verified(record.location), null, "an unverified location became readable");
  });

  test("the unverified location is never rendered", () => {
    for (const page of pages) {
      for (const fragment of ["Dubai", "United Arab Emirates", "UAE"]) {
        assert.ok(!stripTags(page.html).includes(fragment), `${page.route}: rendered "${fragment}"`);
      }
    }
  });

  test("no credential, qualification or experience claim", () => {
    const forbidden = ["dermatologist", "certified", "licensed", "qualified in", "degree",
      "diploma", "accredited", "years of experience", "board-certified", "cosmetic chemist",
      "award-winning", "expert in"];
    for (const page of surfaces("about")) {
      const text = stripTags(page.html).toLowerCase();
      for (const claim of forbidden) {
        assert.ok(!text.includes(claim), `${page.route}: claims "${claim}"`);
      }
    }
  });

  test("no audience metric of any kind", () => {
    // Word boundaries matter here: "views" is a substring of "Reviews", which is the site's own
    // navigation label and appears on every page. A bare substring scan flags the nav forever.
    for (const page of surfaces("about")) {
      const text = stripTags(page.html).toLowerCase();
      for (const metric of ["followers", "subscribers", "million", "audience of", "views",
        "impressions", "reach of", "engagement"]) {
        assert.ok(
          !new RegExp(`\\b${metric.replace(/ /g, "\\s+")}\\b`).test(text),
          `${page.route}: claims "${metric}"`
        );
      }
    }
  });

  test("exactly Instagram is linked (Phase 9, confirmed) — every other platform stays absent", () => {
    const eligible = eligibleSocialProfiles();
    assert.equal(eligible.length, 1);
    assert.equal(eligible[0].platform, "Instagram");
    for (const page of pages) {
      for (const host of ["tiktok.com", "youtube.com", "snapchat.com",
        "pinterest.com", "twitter.com", "x.com", "facebook.com"]) {
        assert.ok(!page.html.includes(host), `${page.route}: linked unconfirmed platform ${host}`);
      }
    }
    // Instagram DOES now appear — in the shared footer's social row on every page, and on the
    // Contact page's own channel list. Verified as the exact confirmed URL, never a variant.
    const confirmedUrl = "https://www.instagram.com/zina.almokri?stkn=MTI4aHRmMGZ0bDdibw==";
    const anyPage = pages.find((p) => p.html.includes("instagram.com"));
    assert.ok(anyPage, "Instagram never appears anywhere in the build");
    for (const page of pages) {
      for (const m of page.html.matchAll(/href="(https:\/\/www\.instagram\.com\/[^"]*)"/g)) {
        assert.equal(m[1], confirmedUrl, `${page.route}: an Instagram link does not match the confirmed URL`);
      }
    }
  });

  test("the mock biography is labelled as placeholder text", () => {
    for (const page of surfaces("about")) {
      assert.ok(/class="mock-notice"/.test(page.html), `${page.route}: unlabelled mock biography`);
    }
  });

  test("Person JSON-LD carries no credential or address; sameAs is exactly the confirmed profile", () => {
    for (const page of surfaces("about")) {
      const blocks = [...page.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map((m) => JSON.parse(m[1]));
      const personBlock = blocks.find((b) => b["@type"] === "Person");
      assert.ok(personBlock, `${page.route}: no Person schema`);

      assert.deepEqual(personBlock.sameAs, eligibleSocialProfiles().map((p) => p.url));
      // About never opts personSchema() into contact fields — that is Contact's job alone.
      assert.ok(!("email" in personBlock), `${page.route}: About emits email — that belongs to Contact`);
      assert.ok(!("telephone" in personBlock), `${page.route}: About emits telephone — that belongs to Contact`);

      const json = JSON.stringify(personBlock);
      for (const forbidden of ["hasCredential", "alumniOf", "award", "address",
        "homeLocation", "worksFor", "interactionStatistic"]) {
        assert.ok(!json.includes(forbidden), `${page.route}: Person carries ${forbidden}`);
      }
    }
  });

  test("about does not restate the Method — it links to it", () => {
    for (const page of surfaces("about")) {
      const locale = page.route.slice(1, 3);
      assert.ok(page.html.includes(`href="/${locale}/method/"`), `${page.route}: no link to Method`);
      // The six stage keys belong to the Method page alone.
      for (const stage of ["baseline", "wear-window", "conditions", "revisit"]) {
        assert.ok(!page.html.includes(`id="${stage}"`), `${page.route}: duplicated a method stage`);
      }
    }
  });
});

/* ================================================================= editorial standards */

describe("editorial standards is distinct from the Method and claims no institution", () => {
  test("both surfaces exist, in both locales, at different routes", () => {
    assert.equal(surfaces("editorial-standards").length, 2);
    assert.equal(surfaces("method").length, 2);
  });

  test("the standards page states the distinction explicitly", () => {
    for (const page of surfaces("editorial-standards")) {
      assert.ok(/class="distinction"/.test(page.html), `${page.route}: no stated distinction`);
      const locale = page.route.slice(1, 3);
      assert.ok(page.html.includes(`href="/${locale}/method/"`), `${page.route}: no link to Method`);
    }
  });

  test("the standards come from the record, all five, in both locales", () => {
    for (const locale of ["en", "ar"]) {
      const standards = editorialStandards(locale);
      assert.equal(standards.length, 5, `${locale}: expected five standards`);
      for (const standard of standards) {
        assert.ok(standard.statement.length > 40, `${locale}/${standard.key}: statement too short`);
      }
    }
  });

  test("each rendered statement is verbatim from site.json", () => {
    for (const page of surfaces("editorial-standards")) {
      const locale = page.route.slice(1, 3);
      const text = stripTags(page.html);
      for (const standard of editorialStandards(locale)) {
        assert.ok(
          text.includes(stripTags(standard.statement)),
          `${page.route}: "${standard.key}" was reworded rather than rendered`
        );
      }
    }
  });

  test("the unapproved status is stated, because the record is MOCK", () => {
    assert.equal(standardsAreApproved(), false);
    for (const page of surfaces("editorial-standards")) {
      assert.ok(/class="mock-notice"/.test(page.html), `${page.route}: presents drafts as adopted`);
    }
  });

  test("no institutional or regulatory claim", () => {
    const forbidden = ["peer review", "peer-reviewed", "laboratory", "lab-tested", "clinically proven",
      "regulatory", "accredited", "compliant with", "iso ", "editorial board", "ombudsman",
      "independently verified", "scientifically validated"];
    for (const page of surfaces("editorial-standards")) {
      const text = stripTags(page.html).toLowerCase();
      for (const claim of forbidden) {
        // The page may DENY these; it may not assert them. Denials live in the limits list.
        const limits = page.html.match(/<section class="limits"[\s\S]*?<\/section>/);
        const outsideLimits = stripTags(page.html.replace(limits ? limits[0] : "", "")).toLowerCase();
        assert.ok(!outsideLimits.includes(claim), `${page.route}: asserts "${claim}"`);
      }
    }
  });

  test("the page states its limits at the same weight as its commitments", () => {
    for (const page of surfaces("editorial-standards")) {
      assert.ok(/class="limits"/.test(page.html), `${page.route}: no limits section`);
      assert.ok(!/<details/.test(page.html), `${page.route}: hid its limits in a disclosure widget`);
    }
  });

  test("no Organization or publishingPrinciples schema", () => {
    for (const page of surfaces("editorial-standards")) {
      const blocks = [...page.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map((m) => JSON.parse(m[1]));
      assert.deepEqual(blocks.map((b) => b["@type"]), ["BreadcrumbList"]);
      const json = JSON.stringify(blocks);
      for (const forbidden of ["Organization", "NewsMediaOrganization", "publishingPrinciples",
        "ethicsPolicy", "correctionsPolicy"]) {
        assert.ok(!json.includes(forbidden), `${page.route}: emitted ${forbidden}`);
      }
    }
  });
});

/* ================================================================= legal */

describe("the legal foundation invents nothing", () => {
  test("jurisdiction is CONFIRMED (Phase 9: Syria); legal entity remains unknown", () => {
    assert.equal(jurisdictionIsKnown(), true);
    const identity = legalIdentity();
    assert.equal(identity.jurisdiction, "Syria");
    assert.equal(identity.entityName, undefined, "no legal entity was ever supplied — must stay absent");
    assert.equal(identity.copyrightHolder, "Zina Almokri");
  });

  test("the confirmed jurisdiction renders on both legal pages, in both locales", () => {
    for (const page of [...surfaces("privacy"), ...surfaces("terms")]) {
      assert.ok(stripTags(page.html).includes("Syria"), `${page.route}: jurisdiction not rendered`);
    }
  });

  test("no legal ENTITY is named, even though the jurisdiction now is", () => {
    // The two facts are independent. Confirming Syria as the jurisdiction must never be read as
    // confirming a registered company, address or registration number — none of that was supplied.
    for (const page of [...surfaces("privacy"), ...surfaces("terms")]) {
      assert.ok(
        /class="identity-note"/.test(page.html),
        `${page.route}: no longer states that the legal entity is unknown`
      );
    }
  });

  test("both legal routes exist in both locales", () => {
    assert.equal(surfaces("privacy").length, 2);
    assert.equal(surfaces("terms").length, 2);
  });

  test("no jurisdiction, regime or governing law is named", () => {
    const forbidden = ["gdpr", "ccpa", "pdpl", "lgpd", "pipeda", "european union", "eu law",
      "california", "governed by the laws", "courts of", "data protection act",
      "registered office", "company number", "vat ", "llc", "ltd", "fz-llc"];
    for (const page of [...surfaces("privacy"), ...surfaces("terms")]) {
      const text = stripTags(page.html).toLowerCase();
      for (const claim of forbidden) {
        assert.ok(!text.includes(claim), `${page.route}: names "${claim}"`);
      }
    }
  });

  test("no compliance claim of any kind", () => {
    for (const page of [...surfaces("privacy"), ...surfaces("terms")]) {
      const text = stripTags(page.html).toLowerCase();
      for (const claim of ["we comply", "compliant", "in accordance with", "as required by law",
        "your legal rights are", "data protection officer"]) {
        assert.ok(!text.includes(claim), `${page.route}: claims "${claim}"`);
      }
    }
  });

  test("the blocked state is explicit and names what is missing", () => {
    for (const page of [...surfaces("privacy"), ...surfaces("terms")]) {
      assert.ok(/class="pending"/.test(page.html), `${page.route}: does not state it is inoperative`);
      assert.ok(/class="missing/.test(page.html), `${page.route}: does not name what is missing`);
    }
  });

  test("no cookie banner, and no cookie policy, because there are no cookies", () => {
    assert.equal(USES_TRACKING, false);
    for (const page of pages) {
      const text = stripTags(page.html).toLowerCase();
      for (const phrase of ["accept cookies", "we use cookies", "cookie preferences",
        "manage consent", "this site uses cookies"]) {
        assert.ok(!text.includes(phrase), `${page.route}: cookie UI for cookies that do not exist`);
      }
    }
  });

  test("the factual claims about the build are actually TRUE of the build", () => {
    // These are the only assertions the legal pages make, so they are verified against dist/
    // rather than taken on trust.
    for (const page of pages) {
      assert.ok(
        !/<script(?![^>]*type="application\/ld\+json")/.test(page.html),
        `${page.route}: ships client JavaScript, contradicting the privacy page`
      );
      // A REQUEST, not a reference. `<link rel="canonical">` and `rel="alternate"` carry absolute
      // URLs built from SITE_URL and fetch nothing; a stylesheet, script, image or frame does.
      const fetching = [
        ...page.html.matchAll(/<link[^>]+rel="(stylesheet|preload|preconnect|dns-prefetch)"[^>]*>/g),
        ...page.html.matchAll(/<(script|img|iframe|source|video|audio)[^>]+src="[^"]*"[^>]*>/g),
      ].map((m) => m[0]);
      for (const element of fetching) {
        assert.ok(
          !/https?:\/\//.test(element),
          `${page.route}: fetches a third-party resource, contradicting the privacy page — ${element}`
        );
      }
      // "collects nothing a reader types": no form, and the single checkbox in the header is a
      // CSS-only menu toggle whose state never leaves the browser.
      assert.ok(!/<form|<textarea|<select/.test(page.html), `${page.route}: collects input`);
      for (const input of [...page.html.matchAll(/<input[^>]*>/g)].map((m) => m[0])) {
        assert.ok(/id="menu-toggle"/.test(input), `${page.route}: collects typed input — ${input}`);
      }
    }
  });

  test("the copyright holder is published because it is a fact the project already asserts", () => {
    for (const page of [...surfaces("privacy"), ...surfaces("terms")]) {
      assert.ok(stripTags(page.html).includes("Zina Almokri"), page.route);
    }
  });

  test("Phase 10: the contact-channels-are-external fact renders, gated on a confirmed channel existing", () => {
    // hasAnyContactChannel() is true in THIS build (email/phone/Instagram all confirmed Phase 9),
    // so the fact must render — and it must not silently resolve the retention/controller blockers.
    assert.equal(hasAnyContactChannel(), true);
    for (const page of [...surfaces("privacy"), ...surfaces("terms")]) {
      const text = stripTags(page.html);
      assert.ok(
        text.includes("passes through, is logged by, or is stored by this site") ||
          text.includes("لا يمر أي شيء يُرسَل عبرها بهذا الموقع"),
        `${page.route}: missing the Phase 10 contact-externality fact`
      );
    }
  });

  test("Phase 10: the new fact does not shrink the still-open blocked items", () => {
    // Privacy's controller/retention/rights and Terms' governing-law/entity/liability blockers
    // must remain named exactly as before — the new fact describes the SITE, not a resolution of
    // what happens to a message once it reaches Zina off-site.
    const stillBlocked = {
      privacy: ["Required from the owner", "data controller", "Retention periods", "data-subject rights"],
      terms: ["Required from the owner", "governing law", "legal entity publishing", "limitation of liability"],
    };
    for (const [segment, phrases] of Object.entries(stillBlocked)) {
      for (const page of surfaces(segment).filter((p) => p.route.startsWith("/en/"))) {
        const text = stripTags(page.html);
        for (const phrase of phrases) {
          assert.ok(text.includes(phrase), `${page.route}: no longer names "${phrase}" as missing`);
        }
      }
    }
  });
});

/* ================================================================= shared */

describe("every Phase 7 surface obeys the locale contract", () => {
  const all = ["about", "contact", "editorial-standards", "privacy", "terms", "brands", "work"];

  test("each exists in both locales, since each has content in both", () => {
    for (const segment of all) {
      assert.equal(surfaces(segment).length, 2, `${segment}: expected en and ar`);
    }
  });

  test("each declares lang and dir correctly", () => {
    for (const segment of all) {
      for (const page of surfaces(segment)) {
        const locale = page.route.slice(1, 3);
        const dir = locale === "ar" ? "rtl" : "ltr";
        assert.ok(new RegExp(`<html[^>]+lang="${locale}"`).test(page.html), page.route);
        assert.ok(new RegExp(`<html[^>]+dir="${dir}"`).test(page.html), page.route);
      }
    }
  });

  test("each emits reciprocal hreflang", () => {
    for (const segment of all.filter((x) => x !== "brands" && x !== "work")) {
      for (const page of surfaces(segment)) {
        assert.ok(/<link rel="alternate" hreflang="en"/.test(page.html), page.route);
        assert.ok(/<link rel="alternate" hreflang="ar"/.test(page.html), page.route);
        assert.ok(/<link rel="alternate" hreflang="x-default"/.test(page.html), page.route);
      }
    }
  });

  test("each has exactly one h1 and a named main landmark", () => {
    for (const segment of all) {
      for (const page of surfaces(segment)) {
        assert.equal((page.html.match(/<h1\b/g) ?? []).length, 1, page.route);
        assert.ok(/<main id="main"/.test(page.html), page.route);
      }
    }
  });
});
