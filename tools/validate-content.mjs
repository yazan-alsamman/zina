#!/usr/bin/env node
/**
 * Content layer validator (Phase 1 schema, bilingual).
 *
 * Zero dependencies. Checks:
 *
 *   1. Structure        every collection file parses and uses the standard envelope
 *   2. Locales          every record has at least one locale; each locale block is complete
 *   3. Referential      every id reference resolves, in the right collection
 *   4. Editorial rules  disclosure position, pros/cons, suitability pairs, date order,
 *                       medical language, absolute claims, NO NUMERIC RATINGS
 *   5. Routing          slug collisions against reserved category segments, slug shape
 *   6. Gates            brand index gate and journal category gate, computed per locale
 *   7. Graph            orphan detection per locale
 *   8. Mock hygiene     markers present, no URL that could reach a real property
 *
 * Usage:  node tools/validate-content.mjs [contentDir]
 * Exit:   0 = pass, 1 = failures found
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, resolve, basename } from "node:path";

const contentDir = resolve(process.argv[2] ?? "content/mock");
const LOCALES = ["en", "ar"];

const errors = [];
const warnings = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

/* ------------------------------------------------------------------ load */

const files = readdirSync(contentDir).filter((f) => f.endsWith(".json")).sort();
const collections = {};

for (const file of files) {
  const where = `content/mock/${file}`;
  let data;
  try {
    data = JSON.parse(readFileSync(join(contentDir, file), "utf8"));
  } catch (e) {
    fail(where, `invalid JSON: ${e.message}`);
    continue;
  }
  if (data.__MOCK_DATA__ !== true) fail(where, "missing file-level marker __MOCK_DATA__: true");
  if (typeof data.collection !== "string") fail(where, "missing collection name");
  if (typeof data.schemaVersion !== "string") fail(where, "missing schemaVersion");
  if (typeof data.notice !== "string" || data.notice.length < 40)
    fail(where, "missing or too-short notice (must state the content is fictional)");
  if (!Array.isArray(data.items)) {
    fail(where, "missing items array");
    continue;
  }
  collections[data.collection] = { file, where, items: data.items, raw: data };
}

const has = (name) => collections[name]?.items ?? [];
const raw = (name) => collections[name]?.raw ?? {};

/* --------------------------------------------------------------- indexes */

const byId = new Map();
for (const [name, c] of Object.entries(collections)) {
  for (const item of c.items) {
    if (typeof item.id !== "string") {
      fail(c.where, "a record has no id");
      continue;
    }
    if (byId.has(item.id)) fail(c.where, `duplicate id across content layer: ${item.id}`);
    byId.set(item.id, { collection: name, item });
  }
}

const ref = (where, id, expected) => {
  if (id === null || id === undefined) return;
  const hit = byId.get(id);
  if (!hit) return fail(where, `dangling reference: ${id}`);
  if (expected && hit.collection !== expected)
    fail(where, `reference ${id} resolves to "${hit.collection}", expected "${expected}"`);
};
const refs = (where, ids, expected) => {
  if (!Array.isArray(ids)) return fail(where, "expected an array of id references");
  ids.forEach((id) => ref(where, id, expected));
};

/**
 * Locales present on a record, validated.
 * `requireSlug` is false for collections with no route of their own (products),
 * where a per-locale slug would be meaningless until the entity is promoted.
 */
const localesOf = (where, item, { requireSlug = true } = {}) => {
  if (!item.locales || typeof item.locales !== "object") {
    fail(where, "missing locales object");
    return [];
  }
  const keys = Object.keys(item.locales);
  if (!keys.length) fail(where, "locales object is empty; a record must exist in at least one locale");
  for (const k of keys) {
    if (!LOCALES.includes(k)) fail(where, `unknown locale "${k}" (expected one of ${LOCALES.join(", ")})`);
    const L = item.locales[k];
    if (requireSlug && !L.slug) fail(where, `[${k}] missing slug`);
    else if (L.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(L.slug))
      fail(where, `[${k}] slug "${L.slug}" is not lowercase-hyphen Latin; see docs/SEO_URL_ARCHITECTURE.md`);
    if (!["original", "adapted"].includes(L.translationStatus))
      fail(where, `[${k}] translationStatus must be "original" or "adapted" (got ${L.translationStatus})`);
  }
  if (!keys.some((k) => item.locales[k].translationStatus === "original"))
    fail(where, "no locale is marked as the original; every record must have one authored source language");
  return keys;
};

/* ---------------------------------------------------------- mock hygiene */

const SAFE_HOST = /^https:\/\/[a-z0-9.-]*(example\.com|\.mock)(\/|$)/i;
const SAFE_SOCIAL = /\.mock\/?$|\.mock[/?]|@[a-z0-9.]*\.mock/i;

const urlFieldsOf = (obj, path = "") => {
  const out = [];
  if (obj === null || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    const p = path ? `${path}.${k}` : k;
    if (typeof v === "string" && /^https?:\/\//i.test(v)) out.push([p, v]);
    else if (typeof v === "object") out.push(...urlFieldsOf(v, p));
  }
  return out;
};

for (const [name, c] of Object.entries(collections)) {
  for (const item of c.items) {
    const where = `${name} [${item.id}]`;
    if (item._mock !== true) fail(where, "missing record-level marker _mock: true");
    if (item.status !== "mock")
      fail(where, `status must be "mock" while in the mock content layer (got ${item.status})`);
    if (!item.id?.startsWith("mock-")) fail(where, `id must start with "mock-" while in mock mode`);
    if (!["CONFIRMED", "NEEDS_VERIFICATION", "MOCK"].includes(item._verification))
      fail(where, `_verification must be CONFIRMED, NEEDS_VERIFICATION or MOCK (got ${item._verification})`);
    for (const [path, url] of urlFieldsOf(item)) {
      if (SAFE_HOST.test(url) || SAFE_SOCIAL.test(url)) continue;
      fail(where, `URL at ${path} is not a recognised placeholder and may point at a real property: ${url}`);
    }
  }
}

/* ------------------------------------------------- Phase 1 decision gates */

// Numeric ratings were removed by explicit decision. Guard against reintroduction.
for (const item of has("reviews")) {
  const where = `reviews [${item.id}]`;
  const blob = JSON.stringify(item, (k, v) => (k.startsWith("_") ? undefined : v));
  if (/"rating"|"ratingValue"|"score"|"stars"|"outOf5"/i.test(blob))
    fail(where, "numeric rating field present. Phase 1 decision: this site publishes no numeric scores");
}

/* ------------------------------------------------------- required fields */

const require_ = (where, obj, fields) => {
  for (const f of fields) {
    const v = f.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
    if (v === undefined || v === null || v === "") fail(where, `missing required field: ${f}`);
  }
};

/* --------------------------------------------------------------- method */

const method = has("method")[0];
let stageKeys = [];
if (!method) fail("method", "no method record found; the Method pillar is required");
else {
  const where = `method [${method.id}]`;
  stageKeys = method.stageOrder ?? [];
  if (stageKeys.length < 3) fail(where, "stageOrder must list at least 3 stages");
  for (const loc of localesOf(where, method)) {
    const L = method.locales[loc];
    require_(`${where} [${loc}]`, L, ["name", "introduction", "boundaryStatement", "seo.title", "seo.description"]);
    const keys = (L.stages ?? []).map((s) => s.key);
    if (JSON.stringify(keys) !== JSON.stringify(stageKeys))
      fail(`${where} [${loc}]`, `stage keys ${JSON.stringify(keys)} do not match stageOrder ${JSON.stringify(stageKeys)}`);
    for (const s of L.stages ?? []) {
      require_(`${where} [${loc}] stage:${s.key}`, s, ["name", "purpose", "doesNotProve"]);
      if (!Array.isArray(s.observes) || !s.observes.length)
        fail(`${where} [${loc}] stage:${s.key}`, "observes must be a non-empty array");
      if (!Array.isArray(s.evidence) || !s.evidence.length)
        fail(`${where} [${loc}] stage:${s.key}`, "evidence must be a non-empty array");
    }
    if (!Array.isArray(L.whatThisCannotTell) || L.whatThisCannotTell.length < 3)
      fail(`${where} [${loc}]`, "whatThisCannotTell must list at least 3 limits; it is the boundary against implied clinical authority");
    if (!/not clinical|ليس اختبارا سريريا/i.test(L.boundaryStatement))
      fail(`${where} [${loc}]`, "boundaryStatement must explicitly deny clinical testing");
  }
  if (!LOCALES.every((l) => method.locales?.[l]))
    fail(where, "the Method pillar must exist in every locale; it is the site's core differentiator");
}

/* --------------------------------------------------------------- person */

for (const item of has("person")) {
  const where = `person [${item.id}]`;
  require_(where, item, ["name.latin", "name.arabic", "methodId"]);
  ref(where, item.methodId, "method");
  for (const loc of localesOf(where, item)) {
    const L = item.locales[loc];
    require_(`${where} [${loc}]`, L, [
      "professionalTitle", "bios.short", "bios.long", "bios.editorialByline",
      "bios.collaboration", "philosophy.statement", "seo.title", "seo.description",
    ]);
  }
}

/* ------------------------------------------------------- socialProfiles */

for (const item of has("socialProfiles")) {
  const where = `socialProfiles [${item.id}]`;
  require_(where, item, ["platform", "handle", "url", "followers.asOf", "followers.value"]);
  if (item.sameAsEligible !== false)
    fail(where, "sameAsEligible must be false for every mock profile: a mock URL must never reach schema.org sameAs");
}

/* --------------------------------------------------------------- brands */

const gate = raw("brands").indexGate ?? {};
const brandGateResults = [];

for (const item of has("brands")) {
  const where = `brands [${item.id}]`;
  require_(where, item, ["slug", "officialUrl", "relationship.type", "logo.src"]);
  refs(where, item.productIds, "products");
  refs(where, item.reviewIds, "reviews");
  refs(where, item.workIds, "work");
  if (item.relationship?.status === "CONFIRMED")
    fail(where, "a mock brand relationship must never be marked CONFIRMED");
  if (!["auto", "force-index", "force-noindex"].includes(item.indexPolicy))
    fail(where, `indexPolicy must be auto, force-index or force-noindex (got ${item.indexPolicy})`);

  for (const loc of localesOf(where, item)) {
    const L = item.locales[loc];
    require_(`${where} [${loc}]`, L, ["name", "category", "positioning", "description", "seo.title", "seo.description"]);

    const reviewsInLocale = item.reviewIds.filter((rid) => byId.get(rid)?.item?.locales?.[loc]).length;
    const workInLocale = item.workIds.filter((wid) => byId.get(wid)?.item?.locales?.[loc]).length;
    const meetsContent =
      (L.description ?? "").length >= (gate.minDescriptionChars ?? 120) && Boolean(item.logo?.src);
    const meetsVolume =
      reviewsInLocale >= (gate.minReviews ?? 2) ||
      (reviewsInLocale >= (gate.minReviewsWithWork ?? 1) && workInLocale >= 1);
    const indexable =
      item.indexPolicy === "force-index" ? true
      : item.indexPolicy === "force-noindex" ? false
      : meetsContent && meetsVolume;
    brandGateResults.push({ brand: item.locales[loc].name, id: item.id, loc, reviewsInLocale, workInLocale, indexable });
  }
}

/* ------------------------------------------------------------- products */

for (const item of has("products")) {
  const where = `products [${item.id}]`;
  require_(where, item, ["name", "slug", "brandId", "category", "officialUrl", "images.hero.src"]);
  ref(where, item.brandId, "brands");
  ref(where, item.reviewId, "reviews");
  if (!item.images?.hero?.alt) fail(where, "hero image needs alt text");
  const locs = localesOf(where, item, { requireSlug: false });
  for (const loc of locs) {
    const L = item.locales[loc];
    require_(`${where} [${loc}]`, L, ["productType", "description"]);
    if (!Array.isArray(L.brandClaims)) fail(`${where} [${loc}]`, "brandClaims must be an array, even if empty");
  }
  // A product must carry content in every locale where its review exists.
  const reviewLocs = Object.keys(byId.get(item.reviewId)?.item?.locales ?? {});
  for (const rl of reviewLocs)
    if (!locs.includes(rl))
      fail(where, `review exists in "${rl}" but product has no ${rl} content to render inside it`);
}

/* -------------------------------------------------------------- reviews */

const MEDICAL = /\b(cure[sd]?|heals?|treats?|clinically proven|dermatologist[- ]proven|eliminates? acne|medical(ly)? proven)\b/i;
const ABSOLUTE = /\b(suits? everyone|for all skin types|works for everybody|best for everyone)\b/i;
const DISCLOSURE_TYPES = ["gifted", "sponsored", "paid-collaboration", "editorial", "independently-purchased", "unknown-pending-verification"];

for (const item of has("reviews")) {
  const where = `reviews [${item.id}]`;
  require_(where, item, [
    "entity.productId", "entity.brandId", "entity.category",
    "disclosure.primary", "disclosure.position",
    "testing.wearWindow", "testing.timesTested",
    "dates.testedFrom", "dates.publishedAt", "dates.updatedAt",
    "media.hero.src", "media.hero.alt",
  ]);
  ref(where, item.entity?.productId, "products");
  ref(where, item.entity?.brandId, "brands");
  refs(where, item.related?.reviewIds ?? [], "reviews");
  refs(where, item.related?.journalIds ?? [], "journal");
  refs(where, item.related?.workIds ?? [], "work");
  refs(where, item.testing?.comparedAgainstProductIds ?? [], "products");

  if (!DISCLOSURE_TYPES.includes(item.disclosure?.primary))
    fail(where, `disclosure.primary must be one of ${DISCLOSURE_TYPES.join(", ")}`);
  if (item.disclosure?.position !== "above-content")
    fail(where, "disclosure.position must be above-content");
  if (item.disclosure?.primary === "unknown-pending-verification" && item.status === "published")
    fail(where, "a review with an unverified disclosure must never reach published status");

  for (const k of item.testing?.methodStageKeys ?? [])
    if (!stageKeys.includes(k)) fail(where, `unknown method stage key: ${k}`);
  if (!(item.testing?.methodStageKeys ?? []).length)
    fail(where, "a review must declare which method stages were applied; this drives the Method internal link");

  if (item.related?.reviewIds?.includes(item.id)) fail(where, "a review must not list itself as related");
  if (new Date(item.dates.updatedAt) < new Date(item.dates.publishedAt))
    fail(where, "updatedAt is earlier than publishedAt");
  if (new Date(item.dates.publishedAt) < new Date(item.dates.testedTo ?? item.dates.testedFrom))
    fail(where, "published before testing finished");

  for (const loc of localesOf(where, item)) {
    const L = item.locales[loc];
    const w = `${where} [${loc}]`;
    require_(w, L, [
      "title", "subtitle", "excerpt", "introduction", "conclusion",
      "disclosureLabel", "disclosureStatement",
      "testingContext", "applicationContext", "verdict.summary", "verdict.bestFor",
      "evidenceNotes", "seo.title", "seo.description", "seo.canonicalPath",
    ]);
    if ((L.observations ?? []).length < 3) fail(w, "a review needs at least 3 observations to be useful");
    if (!(L.conditions ?? []).length) fail(w, "testing conditions must be published, not implied");
    if (!L.strengths?.length || !L.limitations?.length) fail(w, "a review must carry both strengths and limitations");
    if (!L.suitability?.suitsWell?.length || !L.suitability?.mayNotSuit?.length)
      fail(w, "suitability must name who a product does not suit, not only who it does");

    const prose = JSON.stringify(L, (k, v) => (k.startsWith("_") ? undefined : v));
    if (MEDICAL.test(prose)) fail(w, "contains language that reads as a medical or clinical claim");
    if (ABSOLUTE.test(prose)) fail(w, "contains an absolute suitability claim");

    if (L.seo.canonicalPath !== `/${loc}/reviews/${L.slug}/`)
      fail(w, `canonicalPath "${L.seo.canonicalPath}" does not match /${loc}/reviews/${L.slug}/`);
    if (L.seo.title.length > 60) warn(w, `SEO title is ${L.seo.title.length} chars and may truncate`);
    if (L.seo.description.length > 165) warn(w, `meta description is ${L.seo.description.length} chars and will truncate`);
  }
}

/* -------------------------------------------------------------- journal */

const journalCategories = (raw("journal").categories ?? []).map((c) => c.key);
const journalCatCount = {};

for (const item of has("journal")) {
  const where = `journal [${item.id}]`;
  require_(where, item, ["category", "type", "authorId", "dates.publishedAt", "heroImage.src", "heroImage.alt"]);
  ref(where, item.authorId, "person");
  refs(where, item.related?.reviewIds ?? [], "reviews");
  refs(where, item.related?.journalIds ?? [], "journal");
  refs(where, item.related?.brandIds ?? [], "brands");
  if (!journalCategories.includes(item.category))
    fail(where, `unknown journal category "${item.category}" (declared: ${journalCategories.join(", ")})`);
  if (!["Pillar", "Supporting"].includes(item.type)) fail(where, "type must be Pillar or Supporting");
  for (const k of item.related?.methodStageKeys ?? [])
    if (!stageKeys.includes(k)) fail(where, `unknown method stage key: ${k}`);
  if (item.related?.journalIds?.includes(item.id)) fail(where, "an article must not list itself as related");

  for (const loc of localesOf(where, item)) {
    const L = item.locales[loc];
    const w = `${where} [${loc}]`;
    require_(w, L, ["title", "subtitle", "excerpt", "openingParagraph", "seo.title", "seo.description", "seo.canonicalPath"]);
    if ((L.sections ?? []).length < 4) warn(w, "fewer than 4 sections; thin for a guide or pillar page");
    if (L.seo.canonicalPath !== `/${loc}/journal/${L.slug}/`)
      fail(w, `canonicalPath "${L.seo.canonicalPath}" does not match /${loc}/journal/${L.slug}/`);
    journalCatCount[`${item.category}|${loc}`] = (journalCatCount[`${item.category}|${loc}`] ?? 0) + 1;
  }
}

/* ----------------------------------------------------------------- work */

for (const item of has("work")) {
  const where = `work [${item.id}]`;
  require_(where, item, ["brandId", "category", "year", "media.hero.src"]);
  ref(where, item.brandId, "brands");
  refs(where, item.relatedReviewIds ?? [], "reviews");
  for (const fig of item.results?.figures ?? []) {
    if (!fig.source) fail(where, `results figure "${fig.label}" has no named source`);
    if (fig._verification === "CONFIRMED") fail(where, "a mock results figure must never be CONFIRMED");
  }
  for (const loc of localesOf(where, item)) {
    const L = item.locales[loc];
    const w = `${where} [${loc}]`;
    require_(w, L, ["title", "client", "campaign", "summary", "description", "role", "disclosure", "seo.title", "seo.description"]);
    if (!Array.isArray(L.deliverables) || !L.deliverables.length) fail(w, "work needs deliverables");
  }
}

/* ---------------------------------------------------- press, testimonials */

for (const item of has("testimonials")) {
  const where = `testimonials [${item.id}]`;
  if (item.approvalOnFile !== false) fail(where, "a mock testimonial must have approvalOnFile: false");
  ref(where, item.brandId, "brands");
  ref(where, item.workId, "work");
}
for (const item of has("press")) {
  require_(`press [${item.id}]`, item, ["type", "outlet", "headline", "url", "date"]);
}

/* --------------------------------------------------- routing / collisions */

const reserved = raw("site").items?.[0]?.reservedSlugs ?? {};
for (const loc of LOCALES) {
  for (const item of has("reviews")) {
    const s = item.locales?.[loc]?.slug;
    if (s && (reserved.reviews ?? []).includes(s))
      fail(`reviews [${item.id}] [${loc}]`, `slug "${s}" collides with a reserved review category segment`);
  }
  for (const item of has("journal")) {
    const s = item.locales?.[loc]?.slug;
    if (s && (reserved.journal ?? []).includes(s))
      fail(`journal [${item.id}] [${loc}]`, `slug "${s}" collides with a reserved journal category segment`);
  }
  // Slug uniqueness within a collection and locale.
  for (const coll of ["reviews", "journal", "work", "brands"]) {
    const seen = new Map();
    for (const item of has(coll)) {
      const s = item.locales?.[loc]?.slug;
      if (!s) continue;
      if (seen.has(s)) fail(`${coll} [${loc}]`, `duplicate slug "${s}" on ${seen.get(s)} and ${item.id}`);
      seen.set(s, item.id);
    }
  }
}

/* --------------------------------------------------------- orphan checks */

for (const loc of LOCALES) {
  const linked = new Set([
    ...has("journal").flatMap((j) => (j.locales?.[loc] ? j.related?.reviewIds ?? [] : [])),
    ...has("brands").flatMap((b) => b.reviewIds ?? []),
    ...has("work").flatMap((w) => (w.locales?.[loc] ? w.relatedReviewIds ?? [] : [])),
    ...has("reviews").flatMap((r) => (r.locales?.[loc] ? r.related?.reviewIds ?? [] : [])),
  ]);
  for (const r of has("reviews")) {
    if (!r.locales?.[loc]) continue;
    if (!linked.has(r.id)) warn(`reviews [${r.id}] [${loc}]`, "orphan: not linked from any other content in this locale");
  }
}

/* ----------------------------------------------------------------- report */

const counts = Object.entries(collections).map(([n, c]) => `${n}=${c.items.length}`).join("  ");
const localeCount = (coll, loc) => has(coll).filter((i) => i.locales?.[loc]).length;

console.log(`\ncontent validator (Phase 1 schema)  ${basename(contentDir)}\n${"=".repeat(66)}`);
console.log(`files      ${files.length}`);
console.log(`records    ${byId.size}   (${counts})`);

console.log(`\nlocale coverage`);
for (const coll of ["person", "method", "brands", "products", "reviews", "work", "journal"]) {
  if (!collections[coll]) continue;
  console.log(`  ${coll.padEnd(10)} en=${localeCount(coll, "en")}  ar=${localeCount(coll, "ar")}  of ${has(coll).length}`);
}

console.log(`\nbrand index gate (per locale)`);
for (const g of brandGateResults) {
  console.log(
    `  ${g.loc}  ${String(g.brand).padEnd(18)} reviews=${g.reviewsInLocale} work=${g.workInLocale}  ` +
      `${g.indexable ? "INDEXABLE" : "GATED (no page generated)"}`
  );
}

console.log(`\njournal category gate (min 3 per locale)`);
for (const loc of LOCALES) {
  for (const cat of journalCategories) {
    const n = journalCatCount[`${cat}|${loc}`] ?? 0;
    console.log(`  ${loc}  ${cat.padEnd(14)} ${n}  ${n >= 3 ? "INDEXABLE" : "GATED"}`);
  }
}

if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length})`);
  warnings.forEach((w) => console.log(`  ~ ${w}`));
}
if (errors.length) {
  console.log(`\nERRORS (${errors.length})`);
  errors.forEach((e) => console.log(`  x ${e}`));
  console.log("\nFAIL\n");
  process.exit(1);
}
console.log(`\nPASS  no errors${warnings.length ? `, ${warnings.length} warning(s)` : ""}\n`);
