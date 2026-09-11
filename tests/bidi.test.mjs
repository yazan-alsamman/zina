/**
 * BIDI TESTS — the Phase 3 correction, locked in.
 *
 * These are the highest-value tests in the suite. The defect they guard against is invisible to
 * anyone who does not read Arabic, would appear on every Arabic review page, and was found in
 * Phase 3 only by measuring token positions in a real browser.
 *
 * A regression here is a FACTUAL ERROR in a published record — a temperature range that reads
 * 38–34 instead of 34–38 — not a cosmetic one.
 *
 * Run: node --test tests/
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  isolateValue,
  isolateIdentifier,
  recordMarker,
  splitNumericRun,
  hasRtl,
} from "../src/lib/bidi.ts";

describe("isolateValue — the mandatory Phase 3 correction (D3-1)", () => {
  test("an Arabic unit stays OUTSIDE the isolate", () => {
    // The defect: <bdi>34–38 °م</bdi> resolves RTL from the Arabic م and reverses the range.
    const out = isolateValue("34–38 °م");
    assert.equal(out, '<bdi dir="ltr">34–38</bdi> °م');
    assert.ok(!/<bdi>[^<]*°م/.test(out), "must never emit a bare <bdi> containing an Arabic unit");
  });

  test("the Arabic percent sign stays outside the isolate", () => {
    assert.equal(isolateValue("58–71 ٪"), '<bdi dir="ltr">58–71</bdi> ٪');
  });

  test("a Latin unit may sit INSIDE the isolate — it is directionally safe", () => {
    assert.equal(isolateValue("34–38 °C"), '<bdi dir="ltr">34–38 °C</bdi>');
    assert.equal(isolateValue("30 ml"), '<bdi dir="ltr">30 ml</bdi>');
  });

  test("a bare numeral is isolated with an explicit direction", () => {
    assert.equal(isolateValue("4"), '<bdi dir="ltr">4</bdi>');
    assert.equal(isolateValue("2026-08-21"), '<bdi dir="ltr">2026-08-21</bdi>');
  });

  test("every isolate carries dir=ltr — never a bare <bdi>", () => {
    for (const value of ["34–38 °م", "58–71 ٪", "8 hours", "4", "03"]) {
      const out = isolateValue(value);
      if (out.includes("<bdi")) {
        assert.ok(out.includes('<bdi dir="ltr">'), `bare <bdi> emitted for "${value}": ${out}`);
      }
    }
  });

  test("PROSE that merely begins with a numeral is left entirely alone", () => {
    // Isolating a fragment of a sentence is worse than leaving it to the browser's implicit
    // algorithm, which handles digits inside prose correctly.
    assert.equal(isolateValue("34 to 38 degrees Celsius"), "34 to 38 degrees Celsius");
    assert.equal(isolateValue("من 34 إلى 38 درجة مئوية"), "من 34 إلى 38 درجة مئوية");
  });

  test("text with no numerals is returned unchanged", () => {
    assert.equal(isolateValue("Photographed"), "Photographed");
    assert.equal(isolateValue("مصوَّرة"), "مصوَّرة");
  });

  test("HTML in a value is escaped", () => {
    assert.ok(!isolateValue('<script>alert("x")</script>').includes("<script>"));
  });

  test("empty input is safe", () => {
    assert.equal(isolateValue(""), "");
    assert.equal(isolateValue("   "), "");
  });
});

describe("splitNumericRun", () => {
  test("splits an Arabic unit off the numeric run", () => {
    assert.deepEqual(splitNumericRun("34–38 °م"), { numeric: "34–38", rest: "°م" });
  });

  test("keeps a Latin unit with the numeric run", () => {
    assert.deepEqual(splitNumericRun("34–38 °C"), { numeric: "34–38 °C", rest: "" });
  });

  test("classifies prose as prose", () => {
    assert.deepEqual(splitNumericRun("40 minutes walking outdoors"), {
      numeric: "",
      rest: "40 minutes walking outdoors",
    });
  });
});

describe("isolateIdentifier — script is DETECTED, never assumed", () => {
  test("a Latin name inside an Arabic page is isolated and labelled en", () => {
    assert.equal(
      isolateIdentifier("Voile Lumiere Skin Tint", "ar"),
      '<bdi lang="en">Voile Lumiere Skin Tint</bdi>'
    );
  });

  test("an ARABIC name inside an Arabic page is NOT labelled English", () => {
    // The bug this guards: <bdi lang="en">ميزون إيكلا</bdi> — Arabic text marked as English,
    // which is exactly the mispronunciation the attribute exists to prevent.
    const out = isolateIdentifier("ميزون إيكلا", "ar");
    assert.ok(!out.includes('lang="en"'), `Arabic text was labelled English: ${out}`);
    assert.equal(out, "ميزون إيكلا");
  });

  test("an Arabic name inside an English page is isolated and labelled ar", () => {
    assert.equal(isolateIdentifier("زينا المقري", "en"), '<bdi lang="ar">زينا المقري</bdi>');
  });

  test("same-script identifiers emit no redundant markup", () => {
    assert.equal(isolateIdentifier("Maison Eclat", "en"), "Maison Eclat");
  });

  test("a shade code is a Latin identifier in both locales", () => {
    assert.equal(isolateIdentifier("22W Amber Warm", "ar"), '<bdi lang="en">22W Amber Warm</bdi>');
    assert.equal(isolateIdentifier("22W Amber Warm", "en"), "22W Amber Warm");
  });
});

describe("recordMarker — the Arabic word is not set in mono", () => {
  test("splits an Arabic hour marker into word + isolated numeral", () => {
    const out = recordMarker("الساعة 6");
    assert.ok(out.includes('<span class="word">الساعة</span>'), out);
    assert.ok(out.includes('<bdi dir="ltr">6</bdi>'), out);
  });

  test("splits an English hour marker the same way", () => {
    const out = recordMarker("Hour 6");
    assert.ok(out.includes('<span class="word">Hour</span>'), out);
    assert.ok(out.includes('<bdi dir="ltr">6</bdi>'), out);
  });

  test("a marker with no numeral is returned as text", () => {
    assert.equal(recordMarker("Shade range"), "Shade range");
  });
});

describe("hasRtl", () => {
  test("detects Arabic", () => {
    assert.equal(hasRtl("الساعة"), true);
    assert.equal(hasRtl("Hour"), false);
    assert.equal(hasRtl("34–38"), false);
  });
});
