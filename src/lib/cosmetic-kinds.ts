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
  concealer: { kind: "gloss", tint: "nude" },
  serum: { kind: "serum", tint: "rose" },
  moisturizer: { kind: "jar", tint: "blush" },
  moisturiser: { kind: "jar", tint: "blush" },
  lip: { kind: "lipstick", tint: "rose" },
  mascara: { kind: "mascara", tint: "blush" },
  powder: { kind: "compact", tint: "blush" },
  fragrance: { kind: "perfume", tint: "rose" },
};

export function cosmeticForCategory(category: string | undefined): { kind: CosmeticKind; tint: CosmeticTint } {
  return byCategory[(category ?? "").trim().toLowerCase()] ?? { kind: "serum", tint: "blush" };
}
