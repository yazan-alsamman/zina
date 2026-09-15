/**
 * COSMETIC MATERIALS — physically based finishes for the Phase 11/12 3D system.
 *
 * Phase 12 extends the library with the finishes the wider packaging catalogue needs: ceramic,
 * brushed metal, satin (acid-etched) glass, translucent loose powder, flocked foam and a soft
 * lacquered wood. Everything is still cached and shared — a finish is built once per colour and
 * reused by every model and every slot on the page.
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

/**
 * The product palette, re-toned to the five-colour identity in src/styles/tokens.css.
 *
 * These are RENDERED PRODUCTS, not photographs, so their colour is part of the brand system
 * rather than part of the imagery the redesign leaves alone. The KEYS are unchanged — they are
 * an API the models, the tint map and the page slots all address — while the values now walk the
 * same ladder as the page: white, light grey, warm beige, mocha, black.
 *
 * Nothing here is a hue the stylesheet does not have.
 */
export const palette = {
  blush: "#eaeaea", // light grey
  petal: "#ded8d3",
  rose: "#c5b4a3", // beige lifted towards white
  deepRose: "#b8a48f", // warm beige — the accent cap
  burgundy: "#817262", // mocha 50% + beige 50%
  wine: "#4a3f35", // mocha — the darkest lacquer
  nude: "#d9d2ca",
  foundation: "#ccc0b3",
  cream: "#f6f4f2", // porcelain
  champagne: "#b8a48f", // the metal IS the warm beige
  roseGold: "#c5b4a3",
  pearl: "#ffffff",
  porcelain: "#f6f4f2",
  clay: "#e1ddda", // linen
  ash: "#d9d2ca",
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

/**
 * Mirror — the inside of a compact or palette lid.
 *
 * PHASE 13. This was a near-white perfect mirror (roughness 0.03, colour #fbf4f1), and a perfect
 * mirror shows you the room: the studio environment is neutral, so every open compact and every
 * eyeshadow palette on the site rendered a flat GREY rectangle — the one cold element in an
 * entirely warm identity, and the first thing the eye caught on the contact sheet.
 *
 * A metal's albedo tints its reflection, so warming the colour warms everything it mirrors, and
 * a little roughness turns a hard grey pane into the soft blush sheen a mirror actually has when
 * it is lying in a warm still life.
 */
export function mirror(): MeshPhysicalMaterial {
  return cached("mirror", () =>
    new MeshPhysicalMaterial({ color: "#d9d2ca", metalness: 0.95, roughness: 0.11, envMapIntensity: 1.15 })
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
      sheenColor: new Color("#f6f4f2"),
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
export function glass(tint = "#ffffff", frosted = false): { back: MeshPhysicalMaterial; front: MeshPhysicalMaterial } {
  const base = {
    color: tint,
    metalness: 0,
    roughness: frosted ? 0.38 : 0.03,
    clearcoat: frosted ? 0.4 : 1,
    clearcoatRoughness: frosted ? 0.3 : 0.02,
    ior: 1.5,
    transparent: true,
    depthWrite: false,
    /* Clear glass reads through its REFLECTIONS, not its body: thin shells, strong environment.
     * Phase 12 raised the clear pair from 0.05/0.10 to 0.12/0.20. At the lower figures a clear
     * bottle standing on an IVORY page had no visible walls at all — a dropper read as a floating
     * label under a floating cap, because the only things with any opacity were the liquid and
     * the printed band. Glass on a pale ground needs enough body to hold its own silhouette. */
    envMapIntensity: frosted ? 1.05 : 1.6,
  };
  /* Phase 12: the frosted pair was opaque enough (0.3 / 0.4) that a large frosted bottle read as
     a milky brick with a hard-edged block of liquid inside it. Acid-etched glass is a VEIL: it
     scatters, it does not hide. Lower opacity plus a higher environment intensity puts the
     highlight back on the shoulders, which is where the eye reads a bottle's form. */
  return {
    back: cached(`glass-back:${tint}:${frosted}`, () =>
      new MeshPhysicalMaterial({ ...base, side: BackSide, opacity: frosted ? 0.18 : 0.12 })
    ),
    front: cached(`glass-front:${tint}:${frosted}`, () =>
      new MeshPhysicalMaterial({ ...base, side: FrontSide, opacity: frosted ? 0.26 : 0.2 })
    ),
  };
}

/** A tinted liquid seen through glass. Slightly translucent so the back shell still reads. */
export function liquid(color: string, opacity = 0.9): MeshPhysicalMaterial {
  return cached(`liquid:${color}:${opacity}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 0.1,
      clearcoat: 0.75,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity,
      depthWrite: false,
      /* Liquid seen through glass carries a highlight of its own — without it the fill reads as
         a solid block of colour sitting inside a bottle rather than as something poured. */
      envMapIntensity: 1.15,
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
      sheenColor: new Color("#f6f4f2"),
    });
  });
}

/**
 * CERAMIC — glazed stoneware for balm pots, toner bottles and pump bodies. Denser and less
 * plasticky than `gloss`: a shallow clearcoat over a slightly rough body, so the highlight is a
 * broad sheen rather than a hard specular dot.
 */
export function ceramic(color: string = palette.porcelain): MeshPhysicalMaterial {
  return cached(`ceramic:${color}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 0.45,
      clearcoat: 0.55,
      clearcoatRoughness: 0.35,
      sheen: 0.25,
      sheenRoughness: 0.6,
      sheenColor: new Color("#f6f4f2"),
      envMapIntensity: 0.95,
    })
  );
}

/**
 * BRUSHED METAL — ferrules, palette hinges, sifter rims. Same metalness as `metal` but a much
 * rougher body and no clearcoat, so it scatters the studio softbox into a long soft streak
 * instead of mirroring it.
 */
export function brushedMetal(color: string = palette.champagne): MeshPhysicalMaterial {
  return cached(`brushed:${color}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 1,
      roughness: 0.52,
      clearcoat: 0,
      envMapIntensity: 1.05,
    })
  );
}

/**
 * SATIN GLASS — acid-etched, between clear and fully frosted. Used where a bottle should read as
 * glass but its contents must not: mist bottles, ampoules, powder jars.
 */
export function satinGlass(tint = "#f6f4f2"): { back: MeshPhysicalMaterial; front: MeshPhysicalMaterial } {
  const base = {
    color: tint,
    metalness: 0,
    roughness: 0.22,
    clearcoat: 0.75,
    clearcoatRoughness: 0.18,
    ior: 1.5,
    transparent: true,
    depthWrite: false,
    envMapIntensity: 1.1,
  };
  return {
    back: cached(`satinglass-back:${tint}`, () =>
      new MeshPhysicalMaterial({ ...base, side: BackSide, opacity: 0.16 })
    ),
    front: cached(`satinglass-front:${tint}`, () =>
      new MeshPhysicalMaterial({ ...base, side: FrontSide, opacity: 0.26 })
    ),
  };
}

/**
 * TRANSLUCENT LOOSE POWDER — the veil inside a sifter jar. Barely-there, unlit-looking, with a
 * strong sheen so it reads as suspended pigment rather than a solid.
 */
export function loosePowder(color: string): MeshPhysicalMaterial {
  return cached(`loose:${color}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 1,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      sheen: 1,
      sheenRoughness: 1,
      sheenColor: new Color("#ffffff"),
      envMapIntensity: 0.5,
    })
  );
}

/** FLOCKED FOAM — a beauty sponge. Almost no specular, a velvet rim from sheen alone. */
export function flocked(color: string): MeshPhysicalMaterial {
  return cached(`flocked:${color}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 0.98,
      sheen: 0.95,
      sheenRoughness: 0.75,
      sheenColor: new Color("#e1ddda"),
      envMapIntensity: 0.55,
    })
  );
}

/** LACQUERED WOOD — brush handles. A warm body under a satin varnish, never a plastic shine. */
export function lacquer(color: string): MeshPhysicalMaterial {
  return cached(`lacquer:${color}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 0.34,
      clearcoat: 0.7,
      clearcoatRoughness: 0.22,
      envMapIntensity: 1,
    })
  );
}

/** BRISTLE — a brush head. Soft, directional, slightly translucent at the tip. */
export function bristle(color: string): MeshPhysicalMaterial {
  return cached(`bristle:${color}`, () =>
    new MeshPhysicalMaterial({
      color,
      metalness: 0,
      roughness: 0.85,
      sheen: 0.85,
      sheenRoughness: 0.4,
      sheenColor: new Color("#f6f4f2"),
      envMapIntensity: 0.7,
    })
  );
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
