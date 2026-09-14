/**
 * COSMETIC MATERIALS — physically based finishes for the Phase 11 3D system.
 *
 * Every finish is a MeshPhysicalMaterial lit by a PMREM studio environment (see scene.ts), so the
 * realism comes from reflections and fresnel rather than from textures. Glass deliberately avoids
 * the transmission pass: the scene renders many small viewports per frame, and a transmission
 * render target per viewport would multiply GPU cost for a barely visible gain. Instead glass is a
 * two-shell transparent build (back faces, contents, front faces) with clearcoat highlights.
 */
import {
  BackSide,
  CanvasTexture,
  Color,
  FrontSide,
  MeshPhysicalMaterial,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";

export const palette = {
  blush: "#f1cfcc",
  petal: "#e8b4b8",
  rose: "#d48c9a",
  deepRose: "#a8375c",
  burgundy: "#6e1d36",
  wine: "#3a1422",
  nude: "#e3bfa6",
  foundation: "#d6a283",
  cream: "#f7ede6",
  champagne: "#dcc09a",
  roseGold: "#e2b09c",
  pearl: "#f6e6e2",
};

const cache = new Map<string, MeshPhysicalMaterial>();

function cached(key: string, make: () => MeshPhysicalMaterial): MeshPhysicalMaterial {
  let material = cache.get(key);
  if (!material) {
    material = make();
    cache.set(key, material);
  }
  return material;
}

/** Polished rose-gold or champagne metal — collars, lids, lipstick cases. */
export function metal(color: string = palette.roseGold, roughness = 0.24): MeshPhysicalMaterial {
  return cached(`metal:${color}:${roughness}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 1,
      roughness,
      clearcoat: 0.35,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.25,
    })
  );
}

/** Mirror — the inside of a compact lid. */
export function mirror(): MeshPhysicalMaterial {
  return cached("mirror", () =>
    new MeshPhysicalMaterial({ color: "#fbf4f1", metalness: 1, roughness: 0.03, envMapIntensity: 1.4 })
  );
}

/** Lacquered plastic — caps, dropper bulbs, compact shells. */
export function gloss(color: string, roughness = 0.22): MeshPhysicalMaterial {
  return cached(`gloss:${color}:${roughness}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      envMapIntensity: 1.1,
    })
  );
}

/** Soft-touch matte packaging with a faint velvet sheen. */
export function matte(color: string): MeshPhysicalMaterial {
  return cached(`matte:${color}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 0.62,
      sheen: 0.6,
      sheenRoughness: 0.5,
      sheenColor: new Color("#ffe3e3"),
      envMapIntensity: 0.9,
    })
  );
}

/** Pearlescent finish — a thin-film shimmer that shifts with the viewing angle. */
export function pearl(color: string = palette.pearl): MeshPhysicalMaterial {
  return cached(`pearl:${color}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 0.1,
      roughness: 0.28,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      iridescence: 0.75,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [180, 520],
      envMapIntensity: 1.15,
    })
  );
}

/**
 * Glass as a PAIR of materials: render the back shell first, then the contents, then the front
 * shell. `frosted` raises roughness and opacity for acid-etched jars and foundation bottles.
 */
export function glass(tint = "#fff4f2", frosted = false): { back: MeshPhysicalMaterial; front: MeshPhysicalMaterial } {
  const base = {
    color: tint,
    metalness: 0,
    roughness: frosted ? 0.38 : 0.03,
    clearcoat: frosted ? 0.4 : 1,
    clearcoatRoughness: frosted ? 0.3 : 0.02,
    ior: 1.5,
    transparent: true,
    depthWrite: false,
    // Clear glass reads through its REFLECTIONS, not its body: thin shells, strong environment.
    envMapIntensity: frosted ? 0.7 : 1.5,
  };
  return {
    back: cached(`glass-back:${tint}:${frosted}`, () =>
      new MeshPhysicalMaterial({ ...base, side: BackSide, opacity: frosted ? 0.3 : 0.05 })
    ),
    front: cached(`glass-front:${tint}:${frosted}`, () =>
      new MeshPhysicalMaterial({ ...base, side: FrontSide, opacity: frosted ? 0.4 : 0.1 })
    ),
  };
}

/** A tinted liquid seen through glass. Slightly translucent so the back shell still reads. */
export function liquid(color: string, opacity = 0.9): MeshPhysicalMaterial {
  return cached(`liquid:${color}:${opacity}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 0.12,
      clearcoat: 0.6,
      transparent: true,
      opacity,
      depthWrite: false,
      envMapIntensity: 0.8,
    })
  );
}

/** Lipstick bullet / cream — satin, dense, slightly waxy. */
export function satin(color: string): MeshPhysicalMaterial {
  return cached(`satin:${color}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 0.38,
      clearcoat: 0.45,
      clearcoatRoughness: 0.3,
      sheen: 0.3,
      sheenColor: new Color("#ffffff"),
    })
  );
}

/**
 * Pressed powder with an embossed petal pattern, drawn procedurally into a bump map. No image
 * asset is downloaded, and the pattern is original.
 */
export function pressedPowder(color: string): MeshPhysicalMaterial {
  return cached(`powder:${color}`, () => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);
    ctx.translate(size / 2, size / 2);
    for (let ring = 0; ring < 3; ring++) {
      const petals = 8 + ring * 4;
      const radius = 30 + ring * 32;
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2 + ring * 0.2;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(radius, 0, 14 + ring * 3, 6 + ring, 0, 0, Math.PI * 2);
        ctx.fillStyle = ring % 2 ? "#9a9a9a" : "#b4b4b4";
        ctx.fill();
        ctx.restore();
      }
    }
    const bump = new CanvasTexture(canvas);
    bump.wrapS = bump.wrapT = RepeatWrapping;
    return new MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 0.92,
      bumpMap: bump,
      bumpScale: 2.2,
      sheen: 0.8,
      sheenRoughness: 0.8,
      sheenColor: new Color("#fff1ee"),
    });
  });
}

/**
 * A printed label. Text is GENERIC PRODUCT-CATEGORY TYPOGRAPHY ONLY — "SÉRUM", "30 ml" — never a
 * real brand name, logo or trade dress, and never a fictional brand that could read as a product
 * line Zina sells.
 */
export function labelTexture(
  lines: { text: string; size: number; font?: "display" | "ui"; tracking?: number }[],
  options: { color: string; width?: number; height?: number; rule?: boolean }
): CanvasTexture {
  const width = options.width ?? 512;
  const height = options.height ?? 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = options.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const total = lines.reduce((sum, line) => sum + line.size * 1.35, 0);
  let y = height / 2 - total / 2;
  for (const line of lines) {
    const family =
      line.font === "ui" ? '"Jost", "Helvetica Neue", sans-serif' : '"Cormorant Garamond", Georgia, serif';
    ctx.font = `500 ${line.size}px ${family}`;
    const tracked = line.tracking ? line.text.split("").join(String.fromCharCode(8202)) : line.text;
    y += (line.size * 1.35) / 2;
    ctx.fillText(tracked, width / 2, y);
    y += (line.size * 1.35) / 2;
  }
  if (options.rule) {
    ctx.fillRect(width * 0.42, height * 0.5 + 2, width * 0.16, 2);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
