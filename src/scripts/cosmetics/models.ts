/**
 * COSMETIC MODELS — original, procedurally built packaging for the Phase 11 3D system.
 *
 * Each model is modelled from real-world PROPORTIONS of its category (a 30 ml dropper bottle, a
 * 50 ml cream jar, a bullet lipstick) but every silhouette, finish and label here is original.
 * No brand's trade dress, logo or packaging artwork is reproduced.
 *
 * Geometry is lathed, extruded or deformed from primitives — no model files are downloaded, so
 * the entire 3D library ships inside one lazily loaded JavaScript chunk.
 *
 * Units are arbitrary; `normalise()` scales every model to a unit bounding sphere so the scene can
 * frame any product the same way.
 */
import {
  Box3,
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  type Material,
  type BufferGeometry,
  Shape,
  Sphere,
  SphereGeometry,
  SplineCurve,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import {
  glass,
  gloss,
  labelTexture,
  liquid,
  metal,
  mirror,
  palette,
  pearl,
  pressedPowder,
  satin,
} from "./materials";

export type CosmeticKind =
  | "serum"
  | "jar"
  | "lipstick"
  | "perfume"
  | "compact"
  | "foundation"
  | "mascara"
  | "gloss"
  | "tube";

export type CosmeticTint = "blush" | "rose" | "nude" | "champagne" | "wine";

const SEGMENTS = 72;

/* ------------------------------------------------------------------ helpers */

const v = (x: number, y: number) => new Vector2(x, y);

function lathe(points: Vector2[], segments = SEGMENTS): LatheGeometry {
  return new LatheGeometry(points, segments);
}

/** Smooth an organic profile (bulbs, domes) through a spline. */
function smooth(points: Vector2[], samples = 32): Vector2[] {
  return new SplineCurve(points).getPoints(samples);
}

/** A profile with small rounded shoulders — reads as moulded rather than CAD-sharp. */
function roundedCylinderProfile(radius: number, bottom: number, top: number, bevel: number): Vector2[] {
  const points: Vector2[] = [v(0, bottom)];
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (i / steps) * (Math.PI / 2);
    points.push(v(radius - bevel + Math.cos(a) * bevel, bottom + bevel + Math.sin(a) * bevel));
  }
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2);
    points.push(v(radius - bevel + Math.cos(a) * bevel, top - bevel + Math.sin(a) * bevel));
  }
  points.push(v(0, top));
  return points;
}

function mesh(geometry: BufferGeometry, material: Material, order = 0): Mesh {
  const m = new Mesh(geometry, material);
  m.renderOrder = order;
  return m;
}

/** Glass rendered as back shell (order 1), contents (order 2), front shell (order 3). */
function glassShell(geometry: BufferGeometry, tint: string, frosted = false): Group {
  const { back, front } = glass(tint, frosted);
  const group = new Group();
  group.add(mesh(geometry, back, 1), mesh(geometry, front, 3));
  return group;
}

function roundedRect(width: number, height: number, radius: number): Shape {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

/** A rounded glass slab standing upright, centred on x/z, base at y = 0. */
function slab(width: number, height: number, depth: number, radius: number, bevel: number): ExtrudeGeometry {
  const geometry = new ExtrudeGeometry(roundedRect(width, depth, radius), {
    depth: height,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 6,
    curveSegments: 18,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, bevel, 0);
  geometry.computeVertexNormals();
  return geometry;
}

/** A wrap-around printed band on a cylindrical body, facing the camera. */
function band(radius: number, y: number, height: number, arc: number, texture: ReturnType<typeof labelTexture>): Mesh {
  const geometry = new CylinderGeometry(radius, radius, height, 64, 1, true, -arc / 2, arc);
  geometry.translate(0, y, 0);
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: DoubleSide });
  return mesh(geometry, material, 4);
}

/** A flat printed label for slab-shaped bottles. */
function plate(width: number, height: number, z: number, y: number, texture: ReturnType<typeof labelTexture>): Mesh {
  const geometry = new BoxGeometry(width, height, 0.001);
  geometry.translate(0, y, z);
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
  return mesh(geometry, material, 4);
}

const tintColors: Record<CosmeticTint, { body: string; liquid: string; ink: string }> = {
  blush: { body: "#e7b3b8", liquid: "#e08ea1", ink: palette.burgundy },
  rose: { body: "#d992a0", liquid: "#c75676", ink: palette.wine },
  nude: { body: "#dcb49c", liquid: "#c98b67", ink: palette.wine },
  champagne: { body: "#e3c9a8", liquid: "#d9a877", ink: palette.wine },
  wine: { body: palette.burgundy, liquid: "#8d2a4a", ink: "#f7e6e2" },
};

/* ------------------------------------------------------------------ models */

/** 30 ml dropper serum: clear glass, rose liquid, rose-gold collar, lacquered bulb, pipette. */
function serum(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  const body = [
    v(0, 0), v(0.9, 0), v(0.98, 0.06), v(1.0, 0.18), v(1.0, 2.2), v(0.97, 2.4),
    v(0.8, 2.6), v(0.5, 2.72), v(0.43, 2.78), v(0.43, 2.98), v(0, 2.98),
  ];
  group.add(glassShell(lathe(body), "#fff6f4"));

  const fill = [v(0, 0.16), v(0.88, 0.16), v(0.92, 0.24), v(0.92, 1.72), v(0, 1.72)];
  group.add(mesh(lathe(fill), liquid(c.liquid, 0.92), 2));

  const pipette = new CylinderGeometry(0.075, 0.05, 2.6, 24);
  pipette.translate(0, 1.72, 0);
  group.add(mesh(pipette, glass("#ffffff").front, 2));

  group.add(mesh(lathe(roundedCylinderProfile(0.5, 2.94, 3.5, 0.06)), metal(palette.roseGold, 0.2)));

  const bulb = smooth([v(0.0, 3.46), v(0.44, 3.48), v(0.47, 3.75), v(0.41, 4.2), v(0.3, 4.6), v(0.14, 4.82), v(0.0, 4.86)], 40);
  bulb[0] = v(0, 3.46);
  group.add(mesh(lathe(bulb), gloss(tint === "wine" ? palette.wine : palette.rose, 0.3)));

  const label = labelTexture(
    [
      { text: "SÉRUM", size: 64, tracking: 1 },
      { text: "30 ml · 1.0 fl. oz", size: 26, font: "ui" },
    ],
    { color: c.ink }
  );
  group.add(band(1.012, 1.05, 0.95, 1.9, label));
  return group;
}

/** 50 ml cream jar, open, with a piped cream swirl and its lid tilted above. */
function jar(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  const body = [
    v(0, 0), v(1.45, 0), v(1.58, 0.06), v(1.64, 0.22), v(1.64, 1.12), v(1.58, 1.2),
    v(1.46, 1.22), v(1.46, 1.36), v(0, 1.36),
  ];
  group.add(mesh(lathe(body), pearl(c.body)));

  // Satin cream surface with a soft central dome.
  const surface = smooth([v(0, 1.42), v(0.6, 1.4), v(1.1, 1.36), v(1.42, 1.34)], 20);
  surface.unshift(v(0, 1.2));
  surface.push(v(1.42, 1.2));
  group.add(mesh(lathe(surface), satin(palette.cream)));

  // The swirl: a tapering spiral, like cream lifted by a spatula.
  const turns: Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const angle = t * Math.PI * 4.2;
    const radius = 0.7 * (1 - t) + 0.05;
    turns.push(new Vector3(Math.cos(angle) * radius, 1.42 + t * 0.55, Math.sin(angle) * radius));
  }
  const swirl = new TubeGeometry(new CatmullRomCurve3(turns), 160, 0.13, 20, false);
  group.add(mesh(swirl, satin(palette.cream)));

  // Lid, lifted and tilted — an open product reads as used, not as a pack shot.
  const lid = new Group();
  lid.add(mesh(lathe(roundedCylinderProfile(1.7, 0, 0.62, 0.14)), metal(palette.roseGold, 0.24)));
  const ring = new TorusGeometry(1.7, 0.035, 12, 96);
  ring.rotateX(Math.PI / 2);
  ring.translate(0, 0.18, 0);
  lid.add(mesh(ring, metal(palette.roseGold, 0.18)));
  lid.position.set(0.55, 2.55, -0.9);
  lid.rotation.set(-0.75, 0, 0.35);
  group.add(lid);

  const label = labelTexture(
    [
      { text: "CRÈME", size: 58, tracking: 1 },
      { text: "50 ml", size: 26, font: "ui" },
    ],
    { color: c.ink }
  );
  group.add(band(1.652, 0.66, 0.7, 1.4, label));
  return group;
}

/** Bullet lipstick: grooved rose-gold case, champagne sleeve, slanted satin bullet, cap beside. */
function lipstick(tint: CosmeticTint): Group {
  const group = new Group();
  const bulletColor = tint === "nude" ? "#b86a62" : tint === "blush" ? "#c9566f" : "#9b2445";

  const base: Vector2[] = [v(0, 0), v(0.46, 0), v(0.5, 0.05)];
  for (let i = 0; i < 5; i++) {
    const y = 0.12 + i * 0.3;
    base.push(v(0.5, y), v(0.485, y + 0.13), v(0.5, y + 0.26));
  }
  base.push(v(0.5, 1.62), v(0.47, 1.66), v(0, 1.66));
  group.add(mesh(lathe(base), metal(palette.roseGold, 0.22)));

  group.add(mesh(lathe(roundedCylinderProfile(0.43, 1.66, 2.22, 0.03)), metal(palette.champagne, 0.14)));

  const bullet = new CylinderGeometry(0.34, 0.34, 1.2, 64, 16);
  const position = bullet.attributes.position!;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const cut = 0.62 - (x / 0.34 + 1) * 0.3;
    if (y > cut) position.setY(i, cut);
  }
  bullet.computeVertexNormals();
  bullet.translate(0, 2.6, 0);
  group.add(mesh(bullet, satin(bulletColor)));

  const cap = new Group();
  cap.add(mesh(lathe(roundedCylinderProfile(0.52, 0, 1.9, 0.05)), metal(palette.roseGold, 0.2)));
  cap.position.set(1.5, 0.6, -0.4);
  cap.rotation.set(0.25, 0, -0.55);
  group.add(cap);
  return group;
}

/** Eau de parfum: thick rounded glass, rose liquid, champagne collar, pearl sphere stopper. */
function perfume(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  group.add(glassShell(slab(2.2, 2.3, 1.1, 0.34, 0.16), "#ffe9ec"));
  group.add(mesh(slab(1.86, 1.55, 0.78, 0.2, 0.08), liquid(c.liquid, 0.92), 2));

  group.add(mesh(lathe(roundedCylinderProfile(0.34, 2.62, 3.0, 0.04)), metal(palette.champagne, 0.18)));
  const stopper = new SphereGeometry(0.72, 64, 48);
  stopper.scale(1, 0.92, 1);
  stopper.translate(0, 3.62, 0);
  group.add(mesh(stopper, pearl("#efc6c6")));

  const label = labelTexture(
    [
      { text: "EAU DE PARFUM", size: 40, tracking: 1 },
      { text: "100 ml · 3.4 fl. oz", size: 24, font: "ui" },
    ],
    { color: palette.wine }
  );
  group.add(plate(1.5, 0.75, 0.73, 1.2, label));
  return group;
}

/** Pressed-powder compact, open: blush shell, embossed pan, mirrored lid. */
function compact(tint: CosmeticTint): Group {
  const group = new Group();
  const shell = tint === "wine" ? palette.burgundy : "#d88e9b";

  group.add(mesh(lathe(roundedCylinderProfile(1.6, 0, 0.42, 0.12)), gloss(shell, 0.2)));
  const rim = new TorusGeometry(1.52, 0.03, 10, 96);
  rim.rotateX(Math.PI / 2);
  rim.translate(0, 0.42, 0);
  group.add(mesh(rim, metal(palette.roseGold, 0.2)));

  const pan = new CylinderGeometry(1.32, 1.32, 0.1, 96);
  pan.translate(0, 0.4, 0);
  group.add(mesh(pan, pressedPowder(tint === "nude" ? "#e6b69f" : "#e7a3ac")));

  const lid = new Group();
  // The lid group's origin is the hinge; its geometry sits 1.6 forward so it closes over the base.
  const lidShell = lathe(roundedCylinderProfile(1.6, 0, 0.26, 0.1));
  lidShell.translate(0, 0, 1.6);
  lid.add(mesh(lidShell, gloss(shell, 0.2)));
  const glassDisc = new CylinderGeometry(1.36, 1.36, 0.02, 96);
  glassDisc.translate(0, -0.005, 1.6);
  lid.add(mesh(glassDisc, mirror()));
  lid.position.set(0, 0.42, -1.6);
  lid.rotation.x = -1.95;
  group.add(lid);

  const hinge = new CylinderGeometry(0.08, 0.08, 0.8, 24);
  hinge.rotateZ(Math.PI / 2);
  hinge.translate(0, 0.42, -1.6);
  group.add(mesh(hinge, metal(palette.roseGold, 0.2)));
  return group;
}

/** Foundation: frosted rounded glass, nude fluid, wine lacquered pump cap. */
function foundation(tint: CosmeticTint): Group {
  const c = tintColors[tint === "wine" ? "nude" : tint];
  const group = new Group();

  group.add(glassShell(slab(1.7, 2.5, 0.95, 0.26, 0.12), "#fbefe9", true));
  group.add(mesh(slab(1.46, 1.85, 0.72, 0.18, 0.06), liquid(c.liquid, 0.95), 2));

  group.add(mesh(lathe(roundedCylinderProfile(0.36, 2.74, 3.02, 0.03)), metal(palette.champagne, 0.2)));
  group.add(mesh(lathe(roundedCylinderProfile(0.46, 3.02, 4.15, 0.12)), gloss(palette.wine, 0.18)));

  const label = labelTexture(
    [
      { text: "FOND DE TEINT", size: 38, tracking: 1 },
      { text: "30 ml", size: 24, font: "ui" },
    ],
    { color: palette.wine }
  );
  group.add(plate(1.2, 0.6, 0.6, 1.3, label));
  return group;
}

/** Mascara: pearl tube with a rose-gold band and a long lacquered cap. */
function mascara(tint: CosmeticTint): Group {
  const group = new Group();
  group.add(mesh(lathe(roundedCylinderProfile(0.3, 0, 2.3, 0.1)), pearl(tint === "wine" ? palette.burgundy : palette.blush)));
  const ring = new CylinderGeometry(0.305, 0.305, 0.14, 64);
  ring.translate(0, 2.2, 0);
  group.add(mesh(ring, metal(palette.roseGold, 0.18)));
  group.add(mesh(lathe(roundedCylinderProfile(0.33, 2.3, 4.6, 0.14)), metal(palette.roseGold, 0.24)));

  const label = labelTexture([{ text: "MASCARA", size: 54, tracking: 1 }], { color: palette.wine, width: 512, height: 128 });
  group.add(band(0.303, 1.1, 0.34, 1.6, label));
  return group;
}

/** Lip gloss: clear tube showing tinted gloss and the applicator stem. */
function lipGloss(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();
  group.add(glassShell(lathe(roundedCylinderProfile(0.34, 0, 2.3, 0.14)), "#fff5f3"));
  group.add(mesh(lathe(roundedCylinderProfile(0.28, 0.1, 2.2, 0.1)), liquid(c.liquid, 0.88), 2));
  const stem = new CylinderGeometry(0.05, 0.05, 2.0, 16);
  stem.translate(0, 1.3, 0);
  group.add(mesh(stem, gloss("#5a2335", 0.3), 2));
  group.add(mesh(lathe(roundedCylinderProfile(0.36, 2.3, 3.9, 0.08)), metal(palette.champagne, 0.2)));
  return group;
}

/** Squeeze tube: pearl body that flattens into a crimped seal, ribbed champagne cap. */
function tube(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  const height = 3.4;
  const geometry = new CylinderGeometry(0.62, 0.62, height, 64, 48);
  // Rotate the UV seam to the back so u = 0.5 — the centre of the printed label — faces forward.
  geometry.rotateY(Math.PI);
  geometry.translate(0, height / 2, 0);
  const position = geometry.attributes.position!;
  for (let i = 0; i < position.count; i++) {
    const t = position.getY(i) / height;
    const k = Math.min(1, Math.max(0, (t - 0.25) / 0.75));
    const ease = k * k * (3 - 2 * k);
    position.setX(i, position.getX(i) * (1 + ease * 0.42));
    position.setZ(i, position.getZ(i) * (1 - ease * 0.92));
  }
  geometry.computeVertexNormals();

  const label = labelTexture(
    [
      { text: "BAUME", size: 60, tracking: 1 },
      { text: "75 ml", size: 26, font: "ui" },
    ],
    { color: c.ink }
  );
  group.add(mesh(geometry, pearl(c.body)));
  const printed = new Mesh(
    geometry,
    new MeshBasicMaterial({ map: label, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 })
  );
  // The label spans a third of the circumference, centred at u = 0.5 and v ≈ 0.42.
  label.repeat.set(3, 2.2);
  label.offset.set(0.5 - 0.5 * 3, 0.5 - 0.42 * 2.2);
  printed.renderOrder = 4;
  group.add(printed);

  const crimp = new BoxGeometry(1.8, 0.28, 0.07);
  crimp.translate(0, height + 0.1, 0);
  group.add(mesh(crimp, pearl(c.body)));

  const cap: Vector2[] = [v(0, -0.62), v(0.4, -0.62)];
  for (let i = 0; i < 8; i++) {
    const y = -0.58 + i * 0.07;
    cap.push(v(0.42, y), v(0.4, y + 0.035));
  }
  cap.push(v(0.42, 0), v(0, 0));
  group.add(mesh(lathe(cap), metal(palette.champagne, 0.28)));
  return group;
}

const builders: Record<CosmeticKind, (tint: CosmeticTint) => Group> = {
  serum,
  jar,
  lipstick,
  perfume,
  compact,
  foundation,
  mascara,
  gloss: lipGloss,
  tube,
};

/** Centre on the bounding box and scale to a unit bounding sphere. */
function normalise(object: Group): Group {
  const box = new Box3().setFromObject(object);
  const centre = box.getCenter(new Vector3());
  const radius = box.getBoundingSphere(new Sphere()).radius;
  object.position.sub(centre);
  const wrapper = new Group();
  wrapper.add(object);
  wrapper.scale.setScalar(1 / radius);
  return wrapper;
}

const prototypes = new Map<string, Group>();

/** Build (or clone from cache — geometry and materials are shared) a normalised product. */
export function buildCosmetic(kind: CosmeticKind, tint: CosmeticTint): Group {
  const key = `${kind}:${tint}`;
  let prototype = prototypes.get(key);
  if (!prototype) {
    const builder = builders[kind] ?? serum;
    prototype = normalise(builder(tint));
    prototypes.set(key, prototype);
  }
  return prototype.clone(true);
}

export const COSMETIC_KINDS = Object.keys(builders) as CosmeticKind[];
