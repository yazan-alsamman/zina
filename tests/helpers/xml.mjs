/**
 * XML WELL-FORMEDNESS — a small, dependency-free validator for tests only.
 *
 * The project ships no XML/DOM parser (zero client JavaScript, minimal devDependencies — astro,
 * @astrojs/check, typescript), and every existing test already validates HTML output with plain
 * regexes against dist/, so this matches that convention rather than reaching for a new package
 * or shelling out to a language the test suite has never depended on.
 *
 * It checks the two things a hand-built XML string can actually get wrong here:
 *   1. every `<...>` construct is a well-formed tag (name + quoted attributes), tags balance as a
 *      stack, and there is exactly one root element;
 *   2. every bare `&` outside a tag is part of a real entity — the exact bug `escapeXml()` in
 *      src/lib/xml.ts exists to prevent.
 *
 * Not a full XML 1.0 validator (no DTD, no namespace-URI resolution). Sufficient for what these
 * generators can plausibly break, and honest about that scope rather than pretending otherwise.
 */

const TAG_RE = /<([^<>]+)>/g;
const VALID_TAG = /^\/?[A-Za-z_][\w.:-]*((?:\s+[A-Za-z_][\w.:-]*="[^"]*")*)\s*\/?$/;
const VALID_DECL_OR_COMMENT = /^\?xml[^?]*\?$|^!--[\s\S]*--$/;
const ENTITY_RE = /&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/g;

/**
 * Throws a descriptive error if `xml` is not well-formed by the rules above. Returns nothing on
 * success — call it for its assertion effect, the same shape as node:assert.
 */
export function assertWellFormedXml(xml, label = "xml") {
  const tags = [];
  let lastIndex = 0;
  let match;

  TAG_RE.lastIndex = 0;
  while ((match = TAG_RE.exec(xml))) {
    // Text between the previous tag and this one — check for bare, non-entity `&`.
    const textBetween = xml.slice(lastIndex, match.index);
    const bare = [...textBetween.matchAll(/&/g)].filter((m) => {
      const rest = textBetween.slice(m.index);
      ENTITY_RE.lastIndex = 0;
      const hit = ENTITY_RE.exec(rest);
      return !(hit && hit.index === 0);
    });
    if (bare.length > 0) {
      throw new Error(`${label}: unescaped "&" in text near index ${lastIndex + bare[0].index}`);
    }
    lastIndex = match.index + match[0].length;

    const inner = match[1];
    if (VALID_DECL_OR_COMMENT.test(inner)) continue;

    if (inner.startsWith("/")) {
      const name = inner.slice(1).trim();
      const top = tags.pop();
      if (top !== name) {
        throw new Error(`${label}: mismatched close tag </${name}> — expected </${top ?? "(nothing open)"}>`);
      }
      continue;
    }

    if (!VALID_TAG.test(inner)) {
      throw new Error(`${label}: malformed tag <${inner}>`);
    }

    const selfClosing = inner.trim().endsWith("/");
    if (!selfClosing) {
      const name = inner.match(/^[A-Za-z_][\w.:-]*/)[0];
      tags.push(name);
    }
  }

  if (tags.length > 0) {
    throw new Error(`${label}: unclosed tag(s): ${tags.join(", ")}`);
  }
}
