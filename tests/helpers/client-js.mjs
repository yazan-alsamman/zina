/**
 * CLIENT JAVASCRIPT — the Phase 11 invariant that replaces "zero client JavaScript".
 *
 * Phase 11 introduced exactly one client script: the decorative 3D cosmetics loader
 * (src/components/beauty/CosmeticScene.astro → src/scripts/cosmetics/boot.ts), which lazily
 * imports Three.js. What must STILL be true, and is asserted everywhere the old rule was:
 *
 *   1. at most ONE non-JSON-LD script per page
 *   2. it is an external, same-origin ES module under /_astro/ — never inline, never third-party
 *   3. no shipped JavaScript chunk can read, store or transmit anything: no fetch, XHR, beacon,
 *      WebSocket, cookie or storage access, and no absolute URL other than XML namespace URIs
 *
 * Every page remains complete static HTML; nothing a reader needs is rendered by script.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const LOADER = /^<script type="module" src="\/_astro\/[A-Za-z0-9._-]+\.js"><\/script>$/;

/** Every script element on a page that is not JSON-LD structured data. */
export function clientScripts(html) {
  return [...html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g)].map((m) => m[0]);
}

/** Assert a page ships nothing but the one same-origin module loader. */
export function assertOnlyCosmeticsLoader(assert, html, where) {
  const scripts = clientScripts(html);
  assert.ok(scripts.length <= 1, `${where} ships ${scripts.length} client scripts`);
  for (const script of scripts) {
    assert.match(script, LOADER, `${where}: a script is inline, third-party or not a module: ${script.slice(0, 120)}`);
  }
}

/** The JavaScript chunks in dist/_astro, read as text. */
export function shippedChunks(dist) {
  const dir = join(dist, "_astro");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".js"))
    .map((file) => ({ file, text: readFileSync(join(dir, file), "utf8") }));
}

const FORBIDDEN_APIS = [
  /\bfetch\(/,
  /XMLHttpRequest/,
  /sendBeacon/,
  /WebSocket/,
  /EventSource/,
  /document\.cookie/,
  /localStorage/,
  /sessionStorage/,
  /indexedDB/,
];

/** Assert no shipped chunk can transmit or persist anything about a reader. */
export function assertChunksCollectNothing(assert, dist) {
  for (const { file, text } of shippedChunks(dist)) {
    for (const api of FORBIDDEN_APIS) {
      assert.ok(!api.test(text), `${file} uses ${api}`);
    }
    for (const m of text.matchAll(/https?:\/\/[a-z0-9.-]+[^"'\s)\\]*/gi)) {
      const url = m[0];
      if (/^http:\/\/www\.w3\.org\//.test(url)) continue; // XML namespace URI, never fetched
      // Three.js cites graphics papers inside GLSL shader comments ("// https://jcgt.org/…").
      // A comment inside a shader string cannot issue a request.
      const line = text.slice(Math.max(0, m.index - 160), m.index).split(/\\n|\n/).pop() ?? "";
      assert.ok(/\/\/[^"'`]*$/.test(line), `${file} references an external URL outside a shader comment: ${url}`);
    }
  }
}
