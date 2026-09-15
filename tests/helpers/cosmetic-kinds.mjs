/**
 * The catalogue's kind list, read from the SOURCE OF TRUTH rather than copied.
 *
 * tests/phase12.test.mjs checks the built HTML against the packages that actually exist. A copied
 * list would drift the moment a package is added, and would then assert nothing. Importing
 * models.ts directly would build Three.js geometry (and need a canvas) for a check that only
 * needs names, so the union type is read out of the source instead.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const source = readFileSync(join(root, "src", "scripts", "cosmetics", "models.ts"), "utf8");

const union = source.slice(source.indexOf("export type CosmeticKind ="));
const body = union.slice(0, union.indexOf(";"));

export const COSMETIC_KINDS = [...body.matchAll(/\|\s*"([a-z]+)"/g)].map((m) => m[1]);

if (COSMETIC_KINDS.length < 9) {
  throw new Error("could not read the cosmetic catalogue from models.ts — has the union moved?");
}
