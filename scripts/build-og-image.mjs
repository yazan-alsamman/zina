#!/usr/bin/env node
/**
 * SOCIAL PREVIEW IMAGE — Phase 11.
 *
 * Until Phase 11 no photography existed, so the site declared no og:image and fell back to the
 * small `summary` Twitter card. The project owner has now supplied portraits, so this script
 * composes ONE 1200×630 preview from the hero portrait: a blush ground, the portrait under an
 * arch on the right, and the name set on the left.
 *
 * The output is a committed asset (public/og/zina-almokri.jpg), so the build stays deterministic
 * and needs no image service at runtime.
 *
 *   node scripts/build-og-image.mjs
 */
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "src", "assets", "photography", "zina-portrait-glow.jpg");
const outDir = join(root, "public", "og");
const out = join(outDir, "zina-almokri.jpg");

const W = 1200;
const H = 630;
const PORTRAIT_W = 430;
const PORTRAIT_H = 560;
const PORTRAIT_X = W - PORTRAIT_W - 90;
const PORTRAIT_Y = H - PORTRAIT_H;

mkdirSync(outDir, { recursive: true });

const ground = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f8f0ea"/><stop offset="1" stop-color="#f0dad6"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.78" cy="0.35" r="0.55">
      <stop offset="0" stop-color="#ebc9c8" stop-opacity="0.9"/><stop offset="1" stop-color="#ebc9c8" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="${PORTRAIT_X - 34}" y="${PORTRAIT_Y - 34}" width="${PORTRAIT_W + 68}" height="${PORTRAIT_H + 120}"
        rx="${(PORTRAIT_W + 68) / 2}" fill="none" stroke="#c9a27e" stroke-opacity="0.6"/>
</svg>`);

// The arch mask: a rectangle whose top corners are fully rounded.
const arch = Buffer.from(`
<svg width="${PORTRAIT_W}" height="${PORTRAIT_H}" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 ${PORTRAIT_W / 2} A ${PORTRAIT_W / 2} ${PORTRAIT_W / 2} 0 0 1 ${PORTRAIT_W} ${PORTRAIT_W / 2} V ${PORTRAIT_H} H 0 Z" fill="#fff"/>
</svg>`);

const portrait = await sharp(source)
  .resize(PORTRAIT_W, PORTRAIT_H, { fit: "cover", position: "north" })
  .composite([{ input: arch, blend: "dest-in" }])
  .png()
  .toBuffer();

const type = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- Existing content only: the confirmed name and the professional title from person.json. -->
  <text x="90" y="250" font-family="Cormorant Garamond, Georgia, 'Times New Roman', serif" font-size="84" fill="#2b1a1f">Zina</text>
  <text x="90" y="340" font-family="Cormorant Garamond, Georgia, 'Times New Roman', serif" font-size="84" fill="#2b1a1f">Almokri</text>
  <rect x="92" y="382" width="64" height="2" fill="#9c3556"/>
  <text x="90" y="432" font-family="Helvetica, Arial, sans-serif" font-size="21" letter-spacing="4" fill="#9c3556">BEAUTY CREATOR AND</text>
  <text x="90" y="466" font-family="Helvetica, Arial, sans-serif" font-size="21" letter-spacing="4" fill="#9c3556">PRODUCT TESTING SPECIALIST</text>
</svg>`);

await sharp(ground)
  .composite([
    { input: portrait, left: PORTRAIT_X, top: PORTRAIT_Y },
    { input: type, left: 0, top: 0 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(out);

console.log(`og image written: ${out}`);
