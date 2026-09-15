/**
 * Which ORIGINAL 3D packaging illustrates a review category.
 *
 * The object is a generic stand-in for the category ("a serum"), never a depiction of the reviewed
 * product itself — no product photography exists yet, and modelling a real product's packaging
 * would reproduce its trade dress. Unknown categories fall back to a dropper serum.
 */
import type { CosmeticKind, CosmeticTint } from "../scripts/cosmetics/models";

const byCategory: Record<string, { kind: CosmeticKind; tint: CosmeticTint }> = {
  foundation: { kind: "foundation", tint: "nude" },
  "skin tint": { kind: "foundation", tint: "nude" },
  concealer: { kind: "gloss", tint: "nude" },
  serum: { kind: "serum", tint: "rose" },
  ampoule: { kind: "ampoule", tint: "rose" },
  moisturizer: { kind: "jar", tint: "blush" },
  moisturiser: { kind: "jar", tint: "blush" },
  lip: { kind: "lipstick", tint: "rose" },
  lipstick: { kind: "lipcase", tint: "rose" },
  gloss: { kind: "gloss", tint: "rose" },
  mascara: { kind: "mascara", tint: "blush" },
  powder: { kind: "powder", tint: "blush" },
  "pressed powder": { kind: "compact", tint: "blush" },
  blush: { kind: "compact", tint: "rose" },
  highlighter: { kind: "highlighter", tint: "champagne" },
  eyeshadow: { kind: "palette", tint: "nude" },
  eye: { kind: "palette", tint: "nude" },
  brush: { kind: "brush", tint: "wine" },
  tools: { kind: "sponge", tint: "rose" },
  sponge: { kind: "sponge", tint: "rose" },
  nail: { kind: "polish", tint: "wine" },
  cleanser: { kind: "cleanser", tint: "blush" },
  toner: { kind: "toner", tint: "champagne" },
  essence: { kind: "toner", tint: "blush" },
  mist: { kind: "mist", tint: "blush" },
  oil: { kind: "oil", tint: "champagne" },
  balm: { kind: "balm", tint: "nude" },
  mask: { kind: "jar", tint: "nude" },
  lotion: { kind: "pump", tint: "blush" },
  cream: { kind: "jar", tint: "blush" },
  fragrance: { kind: "perfume", tint: "rose" },
  sample: { kind: "vial", tint: "champagne" },
};

export function cosmeticForCategory(category: string | undefined): { kind: CosmeticKind; tint: CosmeticTint } {
  return byCategory[(category ?? "").trim().toLowerCase()] ?? { kind: "serum", tint: "blush" };
}
