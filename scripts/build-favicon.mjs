#!/usr/bin/env node
/**
 * THE SITE MARK — Phase 13.
 *
 * ============================================================================
 * WHY THIS EXISTS
 * ============================================================================
 * Through Phase 12 the site shipped no favicon at all. Every page therefore had no `rel="icon"`,
 * and every browser silently requested `/favicon.ico` and got a 404 — a console error on every
 * page load, and a blank page-shaped glyph in the tab strip, on a site whose entire premise is
 * that it looks expensive. The Phase 13 audit found it on all 85 routes.
 *
 * ============================================================================
 * THE MARK
 * ============================================================================
 * It is the ARCH — the signature mask of the Phase 11 "Blush Atelier" identity, the shape every
 * portrait on the site is cut to. Not a letterform: a Cormorant "Z" turns to mush at 16px, and a
 * wordless mark is what a maison uses. Reversed out in ivory on a deep-rose tile, because the tab
 * strip's own background is the browser's, not ours: a filled tile is legible on a light theme and
 * a dark one alike, and deep rose on ivory is a contrast pair already verified in
 * tools/check-contrast.mjs (6.40:1).
 *
 * The geometry and the two colours are the only things declared; every output is derived, so the
 * mark cannot drift between formats.
 *
 * ============================================================================
 * OUTPUTS (committed assets, so the build stays deterministic and needs no image service)
 * ============================================================================
 *   public/favicon.svg         the primary — scalable, what modern browsers use
 *   public/favicon.ico         32x32, for the automatic /favicon.ico request
 *   public/apple-touch-icon.png  180x180, for an iOS home-screen bookmark
 *
 *   node scripts/build-favicon.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

/* The two brand values, matching --color-mocha-brown and --color-white in src/styles/tokens.css.
   The mark is the arch in white on a mocha tile — the palette at its two extremes. */
const MOCHA = "#4a3f35";
const WHITE = "#ffffff";

/**
 * The arch, drawn in a 64-unit box: a rectangle whose top is a full semicircle.
 *
 * The horizontal and vertical insets differ on purpose. The arch is taller than it is wide (the
 * portrait proportion it masks), so centring it needs its own vertical figure — sharing one inset
 * left it sitting low in the tile, which at 16px reads as a misaligned mark rather than a mark.
 */
function markSvg(size) {
  const S = 64;
  const inset = 15; // horizontal
  const w = S - inset * 2;
  const r = w / 2;
  const height = Math.round(w * 1.24); // the arch's own proportion
  const top = (S - height) / 2;
  const bottom = top + height;
  // Tile corner radius scales with the icon so it matches the identity's soft geometry.
  const tile = 12;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${S} ${S}">
  <rect width="${S}" height="${S}" rx="${tile}" fill="${MOCHA}"/>
  <path d="M${inset} ${top + r} a${r} ${r} 0 0 1 ${w} 0 V${bottom} H${inset} Z" fill="${WHITE}"/>
</svg>`;
}

/** Wrap a PNG buffer in an ICO container. One image, PNG-compressed — read by every modern browser. */
function ico(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 means 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette colours
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12); // offset to the image data
  return Buffer.concat([header, entry, png]);
}

const svg = markSvg(64);
writeFileSync(join(publicDir, "favicon.svg"), svg + "\n");

const png32 = await sharp(Buffer.from(markSvg(32))).resize(32, 32).png().toBuffer();
writeFileSync(join(publicDir, "favicon.ico"), ico(png32, 32));

const png180 = await sharp(Buffer.from(markSvg(180))).resize(180, 180).png().toBuffer();
writeFileSync(join(publicDir, "apple-touch-icon.png"), png180);

console.log(`favicon.svg          ${svg.length} B`);
console.log(`favicon.ico          ${ico(png32, 32).length} B`);
console.log(`apple-touch-icon.png ${png180.length} B`);
