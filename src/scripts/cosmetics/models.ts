/**
 * COSMETIC MODELS — original, procedurally built packaging for the Phase 11/12 3D system.
 *
 * Phase 12 grew the catalogue from nine packages to twenty-four. Every addition is a genuinely
 * DIFFERENT SILHOUETTE, not a recolour: an ampoule is not a vial, a swan-neck pump is not a
 * foundation cap, a domed highlighter is not an open compact. Proportions come from the real
 * category (a 2 ml ampoule, a 150 ml cleanser, a 15 mm nail-polish neck); the forms are ours.
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
  ExtrudeGeometry,
  FrontSide,
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
  bristle,
  brushedMetal,
  ceramic,
  flocked,
  glass,
  gloss,
  labelTexture,
  lacquer,
  liquid,
  loosePowder,
  matte,
  metal,
  mirror,
  palette,
  pearl,
  pressedPowder,
  satin,
  satinGlass,
} from "./materials";

export type CosmeticKind =
  /* Phase 11 */
  | "serum"
  | "jar"
  | "lipstick"
  | "perfume"
  | "compact"
  | "foundation"
  | "mascara"
  | "gloss"
  | "tube"
  /* Phase 12 */
  | "ampoule"
  | "vial"
  | "mist"
  | "pump"
  | "toner"
  | "oil"
  | "palette"
  | "brush"
  | "sponge"
  | "polish"
  | "balm"
  | "highlighter"
  | "cleanser"
  | "powder"
  | "lipcase";

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

/**
 * A wrap-around printed band on a cylindrical body, facing the camera.
 *
 * FRONT FACES ONLY. This was DoubleSide, which meant that once a package turned past ninety
 * degrees the label was drawn again from behind — and a label seen from behind is MIRRORED TYPE.
 * On the film page, where one product turns slowly through half a rotation in close-up, "SÉRUM"
 * spent part of the shot reading backwards. Printing is opaque: from the back of a bottle you see
 * the bottle, not the label reversed.
 */
function band(radius: number, y: number, height: number, arc: number, texture: ReturnType<typeof labelTexture>): Mesh {
  const geometry = new CylinderGeometry(radius, radius, height, 64, 1, true, -arc / 2, arc);
  geometry.translate(0, y, 0);
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: FrontSide });
  return mesh(geometry, material, 4);
}

/** A flat printed label for slab-shaped bottles. Front faces only, for the same reason as `band`. */
function plate(width: number, height: number, z: number, y: number, texture: ReturnType<typeof labelTexture>): Mesh {
  const geometry = new BoxGeometry(width, height, 0.001);
  geometry.translate(0, y, z);
  const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: FrontSide });
  return mesh(geometry, material, 4);
}

/* The five tints keep their KEYS (the pages and tests address them by name) and take their values
   from the site palette: light grey, beige lifted, warm beige, beige, mocha. */
const tintColors: Record<CosmeticTint, { body: string; liquid: string; ink: string }> = {
  blush: { body: "#e1ddda", liquid: "#ccc0b3", ink: palette.wine },
  rose: { body: "#d9d2ca", liquid: "#b8a48f", ink: palette.wine },
  nude: { body: "#ccc0b3", liquid: "#9d8b79", ink: palette.wine },
  champagne: { body: "#c5b4a3", liquid: "#b8a48f", ink: palette.wine },
  wine: { body: palette.wine, liquid: "#625549", ink: "#ffffff" },
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
  group.add(glassShell(lathe(body), "#ffffff"));

  const fill = [v(0, 0.2), v(0.8, 0.2), v(0.84, 0.3), v(0.84, 1.62), v(0, 1.62)];
  group.add(mesh(lathe(fill), liquid(c.liquid, 0.84), 2));

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
  /* PHASE 13: the lid used to sit high and far back (0.55, 2.55, -0.9), which at the sizes the
     site actually renders read as a separate disc hovering above an unrelated pot. Brought in
     and down so its silhouette OVERLAPS the jar — that overlap is the only thing that says
     "this lid belongs to this jar" once the object is 150px wide. */
  lid.position.set(0.78, 1.92, -0.5);
  lid.rotation.set(-0.62, 0, 0.42);
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
  const bulletColor = tint === "nude" ? "#9d8b79" : tint === "blush" ? "#817262" : "#4a3f35";

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

  group.add(glassShell(slab(2.2, 2.3, 1.1, 0.34, 0.16), "#f6f4f2"));
  // The fill stops well inside the shell on every axis: a bottle is read from its glass walls
  // and its shoulder highlight, and a fill that reaches the walls erases both.
  group.add(mesh(slab(1.62, 1.3, 0.6, 0.2, 0.08), liquid(c.liquid, 0.86), 2));

  group.add(mesh(lathe(roundedCylinderProfile(0.34, 2.62, 3.0, 0.04)), metal(palette.champagne, 0.18)));
  const stopper = new SphereGeometry(0.72, 64, 48);
  stopper.scale(1, 0.92, 1);
  stopper.translate(0, 3.62, 0);
  group.add(mesh(stopper, pearl("#e1ddda")));

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
  const shell = tint === "wine" ? palette.wine : "#c5b4a3";

  group.add(mesh(lathe(roundedCylinderProfile(1.6, 0, 0.42, 0.12)), gloss(shell, 0.2)));
  const rim = new TorusGeometry(1.52, 0.03, 10, 96);
  rim.rotateX(Math.PI / 2);
  rim.translate(0, 0.42, 0);
  group.add(mesh(rim, metal(palette.roseGold, 0.2)));

  const pan = new CylinderGeometry(1.32, 1.32, 0.1, 96);
  pan.translate(0, 0.4, 0);
  group.add(mesh(pan, pressedPowder(tint === "nude" ? "#ccc0b3" : "#d9d2ca")));

  const lid = new Group();
  // The lid group's origin is the hinge; its geometry sits 1.6 forward so it closes over the base.
  const lidShell = lathe(roundedCylinderProfile(1.6, 0, 0.26, 0.1));
  lidShell.translate(0, 0, 1.6);
  lid.add(mesh(lidShell, gloss(shell, 0.2)));
  const glassDisc = new CylinderGeometry(1.36, 1.36, 0.02, 96);
  glassDisc.translate(0, -0.005, 1.6);
  lid.add(mesh(glassDisc, mirror()));
  lid.position.set(0, 0.42, -1.6);
  /* Was -1.95 rad — so far back that base and lid read as two unrelated discs with a gap, and the
     hinge was invisible. Past upright rather than short of it, like a laptop screen: the lid still
     leans back, but its lower edge stays against the base so the two read as one hinged object.
     (Short of upright, at -1.32, the whole thing became a tall rounded mass that the silhouette
     test could no longer tell apart from the beauty sponge — which is a fair description of how it
     looked.) */
  lid.rotation.x = -1.78;
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

  group.add(glassShell(slab(1.7, 2.5, 0.95, 0.26, 0.12), "#f6f4f2", true));
  group.add(mesh(slab(1.3, 1.62, 0.56, 0.18, 0.06), liquid(c.liquid, 0.9), 2));

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
  group.add(glassShell(lathe(roundedCylinderProfile(0.34, 0, 2.3, 0.14)), "#ffffff"));
  group.add(mesh(lathe(roundedCylinderProfile(0.28, 0.1, 2.2, 0.1)), liquid(c.liquid, 0.88), 2));
  const stem = new CylinderGeometry(0.05, 0.05, 2.0, 16);
  stem.translate(0, 1.3, 0);
  group.add(mesh(stem, gloss("#4a3f35", 0.3), 2));
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


/* ------------------------------------------------------------------ Phase 12 models
 *
 * Each of the following is a distinct silhouette. Where two categories share a family (a vial and
 * an ampoule are both small glass), they differ the way the real objects differ: the ampoule is
 * sealed and drawn to a snapped point, the vial is squat and screw-capped.
 */

/** 2 ml sealed ampoule: bulbous base, long drawn neck, snapped tip, one rose-gold index ring. */
function ampoule(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  const body = smooth(
    [v(0, 0), v(0.34, 0.02), v(0.42, 0.28), v(0.42, 1.25), v(0.3, 1.55), v(0.14, 1.9), v(0.12, 2.5), v(0.16, 2.72), v(0.1, 2.9), v(0, 2.94)],
    46
  );
  group.add(glassShell(lathe(body), "#f6f4f2"));

  const fill = [v(0, 0.08), v(0.34, 0.1), v(0.36, 0.3), v(0.36, 1.2), v(0.2, 1.62), v(0, 1.72)];
  group.add(mesh(lathe(smooth(fill, 24)), liquid(c.liquid, 0.9), 2));

  // The break ring an ampoule is snapped at — the one detail that makes the category legible.
  const ring = new TorusGeometry(0.125, 0.018, 10, 48);
  ring.rotateX(Math.PI / 2);
  ring.translate(0, 2.42, 0);
  group.add(mesh(ring, metal(palette.roseGold, 0.2)));
  return group;
}

/** 5 ml sample vial: squat clear glass, wide shoulder, low champagne screw cap. */
function vial(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  const body = [v(0, 0), v(0.52, 0), v(0.56, 0.06), v(0.56, 0.92), v(0.5, 1.02), v(0.34, 1.08), v(0.34, 1.24), v(0, 1.24)];
  group.add(glassShell(lathe(body), "#ffffff"));
  group.add(mesh(lathe([v(0, 0.1), v(0.48, 0.1), v(0.48, 0.74), v(0, 0.74)]), liquid(c.liquid, 0.9), 2));
  group.add(mesh(lathe(roundedCylinderProfile(0.4, 1.2, 1.64, 0.05)), metal(palette.champagne, 0.22)));
  return group;
}

/** 100 ml facial mist: tall slim satin-glass column, stepped collar, flat-top fine-mist actuator. */
function mist(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  const body = roundedCylinderProfile(0.62, 0, 3.3, 0.1);
  const shell = satinGlass("#f6f4f2");
  group.add(mesh(lathe(body), shell.back, 1), mesh(lathe(body), shell.front, 3));
  group.add(mesh(lathe(roundedCylinderProfile(0.5, 0.12, 2.3, 0.06)), liquid(c.liquid, 0.55), 2));

  const dip = new CylinderGeometry(0.035, 0.035, 3.1, 12);
  dip.translate(0, 1.5, 0);
  group.add(mesh(dip, gloss("#e1ddda", 0.4), 2));

  group.add(mesh(lathe(roundedCylinderProfile(0.46, 3.3, 3.62, 0.04)), brushedMetal(palette.champagne)));
  group.add(mesh(lathe(roundedCylinderProfile(0.3, 3.62, 4.26, 0.05)), metal(palette.champagne, 0.16)));
  // The actuator crown and its side nozzle.
  const crown = new CylinderGeometry(0.34, 0.3, 0.16, 48);
  crown.translate(0, 4.34, 0);
  group.add(mesh(crown, gloss(palette.wine, 0.2)));
  const nozzle = new CylinderGeometry(0.05, 0.05, 0.2, 16);
  nozzle.rotateZ(Math.PI / 2);
  nozzle.translate(0.32, 4.3, 0);
  group.add(mesh(nozzle, metal(palette.roseGold, 0.2)));

  const label = labelTexture([{ text: "BRUME", size: 50, tracking: 1 }, { text: "100 ml", size: 24, font: "ui" }], { color: c.ink });
  group.add(band(0.626, 1.5, 0.78, 1.7, label));
  return group;
}

/** 200 ml skincare pump: glazed ceramic column, brushed collar, swan-neck lotion pump. */
function pump(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  const body = [v(0, 0), v(0.92, 0), v(0.98, 0.08), v(0.98, 2.5), v(0.9, 2.72), v(0.62, 2.86), v(0.6, 3.0), v(0, 3.0)];
  group.add(mesh(lathe(smooth(body, 40)), ceramic(tint === "wine" ? palette.burgundy : palette.porcelain)));
  group.add(mesh(lathe(roundedCylinderProfile(0.62, 3.0, 3.3, 0.05)), brushedMetal(palette.champagne)));

  const stem = new CylinderGeometry(0.19, 0.19, 0.95, 28);
  stem.translate(0, 3.74, 0);
  group.add(mesh(stem, metal(palette.roseGold, 0.18)));

  // The swan neck: a quarter turn of tube ending in a downward spout.
  const neck: Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const a = t * Math.PI * 0.62;
    neck.push(new Vector3(Math.sin(a) * 0.62, 4.2 + Math.cos(a) * 0.18 - 0.18 + t * 0.12, 0));
  }
  neck.push(new Vector3(0.68, 3.98, 0));
  group.add(mesh(new TubeGeometry(new CatmullRomCurve3(neck), 60, 0.16, 18, false), metal(palette.roseGold, 0.2)));

  const label = labelTexture([{ text: "LAIT", size: 56, tracking: 1 }, { text: "200 ml", size: 26, font: "ui" }], { color: c.ink });
  group.add(band(0.985, 1.3, 0.85, 1.5, label));
  return group;
}

/**
 * 200 ml toner: a broad, square-shouldered frosted bottle under a wide flat ceramic disc.
 *
 * Deliberately squatter and wider than `pump`: the two were built at the same slenderness and
 * read as one bottle in two finishes, which is the failure mode the catalogue exists to avoid.
 */
function toner(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  group.add(glassShell(slab(1.95, 2.45, 1.95, 0.18, 0.09), "#f6f4f2", true));
  /* The fill leaves a clear margin on every side and is barely opaque. On a near-cubic bottle a
     fill that reaches the walls stops reading as liquid and starts reading as a solid block
     someone put in a box — the widest bottle in the set is where that goes wrong first. */
  group.add(mesh(slab(1.4, 1.42, 1.4, 0.2, 0.05), liquid(c.liquid, 0.42), 2));
  group.add(mesh(lathe(roundedCylinderProfile(0.6, 2.52, 2.68, 0.04)), brushedMetal(palette.champagne)));
  group.add(mesh(lathe(roundedCylinderProfile(1.06, 2.68, 3.12, 0.1)), ceramic(palette.clay)));

  const label = labelTexture([{ text: "TONIQUE", size: 44, tracking: 1 }, { text: "200 ml", size: 24, font: "ui" }], { color: c.ink });
  group.add(plate(1.3, 0.66, 0.99, 1.3, label));
  return group;
}

/** 30 ml face oil: a squat wide glass disc under a long slender wand cap. */
function faceOil(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  const body = smooth([v(0, 0), v(0.9, 0.04), v(1.0, 0.35), v(0.98, 0.9), v(0.72, 1.18), v(0.34, 1.3), v(0.32, 1.5), v(0, 1.5)], 44);
  group.add(glassShell(lathe(body), "#f6f4f2"));
  group.add(mesh(lathe(smooth([v(0, 0.08), v(0.86, 0.12), v(0.92, 0.4), v(0.88, 0.86), v(0.6, 1.06), v(0, 1.1)], 28)), liquid(c.liquid, 0.94), 2));
  // PHASE 13: the cap was 1.78 tall on a 0.24 radius over a 1.5-tall body — a matchstick in a
  // macaron. Shorter and broader reads as the wand cap of a face-oil bottle.
  group.add(mesh(lathe(roundedCylinderProfile(0.38, 1.5, 1.7, 0.03)), metal(palette.roseGold, 0.18)));
  group.add(mesh(lathe(roundedCylinderProfile(0.32, 1.7, 2.92, 0.08)), lacquer(palette.wine)));

  const label = labelTexture([{ text: "HUILE", size: 54, tracking: 1 }, { text: "30 ml", size: 24, font: "ui" }], { color: c.ink });
  group.add(band(1.003, 0.6, 0.5, 1.6, label));
  return group;
}

/** Eyeshadow palette, open: a flat rectangular case, six pressed pans, a mirrored lid tilted back. */
function eyePalette(tint: CosmeticTint): Group {
  const group = new Group();
  const shellColor = tint === "wine" ? palette.wine : tint === "champagne" ? palette.champagne : "#c5b4a3";

  const base = new ExtrudeGeometry(roundedRect(3.2, 2.2, 0.16), {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 4,
    curveSegments: 10,
  });
  base.rotateX(-Math.PI / 2);
  base.translate(0, 0.39, 0);
  group.add(mesh(base, matte(shellColor)));

  const pans = ["#e1ddda", "#d9d2ca", "#c5b4a3", "#ccc0b3", "#9d8b79", "#625549"];
  pans.forEach((color, index) => {
    const pan = new ExtrudeGeometry(roundedRect(0.86, 0.82, 0.06), { depth: 0.06, bevelEnabled: false, curveSegments: 8 });
    pan.rotateX(-Math.PI / 2);
    pan.translate(-1.02 + (index % 3) * 1.02, 0.42, -0.52 + Math.floor(index / 3) * 1.04);
    group.add(mesh(pan, pressedPowder(color)));
  });

  // The lid pivots at the back edge; its geometry sits forward of the hinge so it closes flush.
  const lid = new Group();
  const lidShell = new ExtrudeGeometry(roundedRect(3.2, 2.2, 0.16), { depth: 0.16, bevelEnabled: false, curveSegments: 10 });
  lidShell.rotateX(-Math.PI / 2);
  lidShell.translate(0, 0, 1.1);
  lid.add(mesh(lidShell, matte(shellColor)));
  const pane = new ExtrudeGeometry(roundedRect(2.92, 1.94, 0.1), { depth: 0.02, bevelEnabled: false, curveSegments: 8 });
  pane.rotateX(-Math.PI / 2);
  pane.translate(0, -0.01, 1.1);
  lid.add(mesh(pane, mirror()));
  lid.position.set(0, 0.4, -1.1);
  lid.rotation.x = -2.0;
  group.add(lid);

  const hinge = new CylinderGeometry(0.06, 0.06, 2.9, 20);
  hinge.rotateZ(Math.PI / 2);
  hinge.translate(0, 0.4, -1.1);
  group.add(mesh(hinge, brushedMetal(palette.champagne)));
  return group;
}

/** Makeup brush: a long lacquered handle, a brushed ferrule with a crimp, a tapered bristle dome. */
function brush(tint: CosmeticTint): Group {
  const group = new Group();
  const handle = tint === "champagne" ? palette.champagne : tint === "nude" ? "#817262" : palette.wine;

  const shaft = smooth([v(0, 0), v(0.1, 0.04), v(0.16, 0.5), v(0.185, 1.9), v(0.17, 3.0), v(0.15, 3.4), v(0, 3.42)], 36);
  group.add(mesh(lathe(shaft), lacquer(handle)));

  group.add(mesh(lathe(roundedCylinderProfile(0.2, 3.4, 4.35, 0.03)), brushedMetal(palette.roseGold)));
  const crimp = new TorusGeometry(0.201, 0.016, 8, 48);
  crimp.rotateX(Math.PI / 2);
  crimp.translate(0, 3.62, 0);
  group.add(mesh(crimp, brushedMetal(palette.roseGold)));

  // The head: a flattened dome tapering to a soft point, the way a powder brush sits.
  const head = smooth([v(0, 4.3), v(0.22, 4.34), v(0.3, 4.7), v(0.29, 5.25), v(0.2, 5.6), v(0.08, 5.74), v(0, 5.76)], 36);
  const headGeometry = lathe(head);
  headGeometry.scale(1.35, 1, 0.7);
  group.add(mesh(headGeometry, bristle("#e1ddda")));
  return group;
}

/** Beauty sponge: a teardrop egg with one flat cut face, in flocked foam. */
function sponge(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  const profile = smooth([v(0, 0), v(0.62, 0.06), v(0.82, 0.5), v(0.84, 1.0), v(0.66, 1.5), v(0.36, 1.86), v(0.12, 2.0), v(0, 2.02)], 44);
  const geometry = lathe(profile);
  // The flat cut: every vertex past the cut plane is pushed back onto it.
  const position = geometry.attributes.position!;
  for (let i = 0; i < position.count; i++) {
    if (position.getZ(i) > 0.42) position.setZ(i, 0.42);
  }
  geometry.computeVertexNormals();
  group.add(mesh(geometry, flocked(c.body)));
  return group;
}

/** Nail polish: a faceted square glass body under a tall slim cap, with lacquer pooled inside. */
function polish(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  /*
   * PHASE 13. This was a four-radial-segment CylinderGeometry — a square prism whose flat facets
   * and hard normals rendered as crumpled foil rather than as faceted glass, and whose walls were
   * so thin the bottle read as opaque. It is now the same bevelled slab the perfume and foundation
   * bottles use, kept square in plan (a small corner radius) so the faceted character survives
   * while the bevels give the glass an edge to catch the light on.
   */
  group.add(glassShell(slab(1.3, 1.45, 1.3, 0.12, 0.09), "#ffffff"));
  group.add(mesh(slab(1.0, 0.92, 1.0, 0.09, 0.05), liquid(c.liquid, 0.95), 2));

  group.add(mesh(lathe(roundedCylinderProfile(0.3, 1.45, 1.66, 0.03)), metal(palette.champagne, 0.2)));
  group.add(mesh(lathe(roundedCylinderProfile(0.26, 1.66, 3.3, 0.05)), gloss(tint === "wine" ? palette.wine : c.ink, 0.14)));
  return group;
}

/** Balm pot: a small squat glazed-ceramic jar, closed, with a domed lid and a fine seam. */
function balm(tint: CosmeticTint): Group {
  const group = new Group();
  const shell = tint === "wine" ? palette.burgundy : tint === "rose" ? palette.rose : palette.porcelain;

  group.add(mesh(lathe(roundedCylinderProfile(1.05, 0, 0.72, 0.16)), ceramic(shell)));
  const seam = new TorusGeometry(1.052, 0.014, 8, 72);
  seam.rotateX(Math.PI / 2);
  seam.translate(0, 0.72, 0);
  group.add(mesh(seam, brushedMetal(palette.champagne)));

  const dome = smooth([v(0, 1.26), v(0.42, 1.24), v(0.78, 1.12), v(1.0, 0.9), v(1.06, 0.78), v(1.06, 0.72), v(0, 0.72)], 40);
  group.add(mesh(lathe(dome), ceramic(shell)));

  const knob = new SphereGeometry(0.13, 32, 24);
  knob.translate(0, 1.3, 0);
  group.add(mesh(knob, metal(palette.roseGold, 0.18)));
  return group;
}

/** Highlighter compact, CLOSED: a domed lacquered disc with concentric engraved rims. */
function highlighter(tint: CosmeticTint): Group {
  const group = new Group();
  const shell = tint === "wine" ? palette.wine : tint === "champagne" ? palette.champagne : "#c5b4a3";

  /*
   * PHASE 13. The shell was 0.3 deep under a 0.68-tall dome on a 1.5 radius — so flat that it
   * rendered as a bun, and three proud rings across that flatness read as stripes rather than as
   * engraving. The case is now deeper and the dome taller (a closed compact is a puck, not a
   * disc), and there are two finer rings sitting nearer the crown where an engraved mark goes.
   */
  group.add(mesh(lathe(roundedCylinderProfile(1.15, 0, 0.66, 0.12)), gloss(shell, 0.18)));

  const dome = smooth([v(0, 1.56), v(0.42, 1.5), v(0.8, 1.3), v(1.06, 1.0), v(1.15, 0.76), v(1.15, 0.66), v(0, 0.66)], 44);
  group.add(mesh(lathe(dome), gloss(shell, 0.14)));

  for (let i = 0; i < 2; i++) {
    const radius = 0.3 + i * 0.26;
    const ring = new TorusGeometry(radius, 0.008, 8, 96);
    ring.rotateX(Math.PI / 2);
    // Each ring sits on the dome's surface, which falls away towards the rim.
    ring.translate(0, 1.54 - Math.pow(radius / 1.15, 2) * 0.78, 0);
    group.add(mesh(ring, metal(palette.roseGold, 0.2)));
  }
  return group;
}

/** 150 ml cleanser: a tall soft-touch matte bottle with a shoulder taper and a disc-top cap. */
function cleanser(tint: CosmeticTint): Group {
  const c = tintColors[tint];
  const group = new Group();

  const body = smooth([v(0, 0), v(0.78, 0.02), v(0.86, 0.22), v(0.86, 2.6), v(0.74, 3.0), v(0.48, 3.22), v(0.46, 3.36), v(0, 3.36)], 44);
  group.add(mesh(lathe(body), matte(tint === "wine" ? palette.burgundy : c.body)));
  group.add(mesh(lathe(roundedCylinderProfile(0.54, 3.36, 3.92, 0.1)), gloss(palette.wine, 0.2)));

  // The disc top: a shallow inset lid with a thumb notch.
  const disc = new CylinderGeometry(0.44, 0.44, 0.1, 48);
  disc.translate(0, 3.9, 0);
  group.add(mesh(disc, gloss(palette.wine, 0.14)));
  const notch = new SphereGeometry(0.14, 24, 16);
  notch.scale(1, 0.4, 1);
  notch.translate(0.24, 3.94, 0);
  group.add(mesh(notch, metal(palette.champagne, 0.24)));

  const label = labelTexture([{ text: "NETTOYANT", size: 40, tracking: 1 }, { text: "150 ml", size: 24, font: "ui" }], { color: c.ink });
  group.add(band(0.865, 1.5, 0.85, 1.6, label));
  return group;
}

/** Loose-powder jar: a wide low satin-glass bowl, a perforated sifter, a veil of suspended pigment. */
function loosePowderJar(tint: CosmeticTint): Group {
  const group = new Group();
  const powderColor = tint === "nude" ? "#ccc0b3" : tint === "champagne" ? "#c5b4a3" : "#e1ddda";

  const body = [v(0, 0), v(1.3, 0), v(1.38, 0.1), v(1.38, 0.92), v(1.3, 1.02), v(1.16, 1.04), v(1.16, 1.18), v(0, 1.18)];
  const shell = satinGlass("#f6f4f2");
  group.add(mesh(lathe(body), shell.back, 1), mesh(lathe(body), shell.front, 3));

  const veil = lathe([v(0, 0.1), v(1.2, 0.1), v(1.22, 0.62), v(0, 0.66)]);
  group.add(mesh(veil, loosePowder(powderColor), 2));

  const sifter = new CylinderGeometry(1.15, 1.15, 0.05, 72);
  sifter.translate(0, 1.0, 0);
  group.add(mesh(sifter, ceramic("#ffffff")));
  for (let ring = 1; ring <= 2; ring++) {
    const holes = ring * 8;
    for (let i = 0; i < holes; i++) {
      const angle = (i / holes) * Math.PI * 2;
      const radius = ring * 0.38;
      const hole = new CylinderGeometry(0.045, 0.045, 0.055, 10);
      hole.translate(Math.cos(angle) * radius, 1.002, Math.sin(angle) * radius);
      group.add(mesh(hole, gloss("#9d8b79", 0.5)));
    }
  }

  // The lid, lifted and tilted — the jar reads as in use, matching the open cream jar.
  const lid = new Group();
  lid.add(mesh(lathe(roundedCylinderProfile(1.44, 0, 0.5, 0.12)), brushedMetal(palette.champagne)));
  lid.position.set(-0.68, 1.5, -0.38);
  lid.rotation.set(0.55, 0, -0.4);
  group.add(lid);
  return group;
}

/** Closed lipstick case: a seamless two-part capsule with a fine index ring. A quiet silhouette. */
function lipcase(tint: CosmeticTint): Group {
  const group = new Group();
  const shell = tint === "champagne" ? palette.champagne : palette.roseGold;

  group.add(mesh(lathe(roundedCylinderProfile(0.46, 0, 1.5, 0.08)), metal(shell, 0.2)));
  const seam = new TorusGeometry(0.462, 0.012, 8, 64);
  seam.rotateX(Math.PI / 2);
  seam.translate(0, 1.5, 0);
  group.add(mesh(seam, metal(palette.wine, 0.3)));
  group.add(mesh(lathe(roundedCylinderProfile(0.46, 1.5, 3.3, 0.1)), metal(shell, 0.2)));

  // One engraved band near the crown — the only ornament.
  const engrave = new TorusGeometry(0.455, 0.01, 8, 64);
  engrave.rotateX(Math.PI / 2);
  engrave.translate(0, 3.0, 0);
  group.add(mesh(engrave, gloss(tint === "wine" ? palette.wine : palette.burgundy, 0.2)));
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
  ampoule,
  vial,
  mist,
  pump,
  toner,
  oil: faceOil,
  palette: eyePalette,
  brush,
  sponge,
  polish,
  balm,
  highlighter,
  cleanser,
  powder: loosePowderJar,
  lipcase,
};

/**
 * FRAMING — how tightly the camera sits on each package.
 *
 * `normalise()` fits every model to the same unit bounding SPHERE, so at the scene's neutral
 * camera distance EVERY product exactly fills its slot with a small margin. A factor here pushes
 * the camera BACK, giving a package more air around it — which the wide open forms want, because
 * an open palette filling its box edge to edge reads as cropped rather than as staged.
 *
 * Factors below 1 are deliberately absent and are clamped away in scene.ts. Pulling the camera
 * inside the neutral distance slices tall packages off at their own scissor rectangle; depth is
 * expressed by moving the OTHER layers back instead.
 */
export const COSMETIC_FRAMING: Partial<Record<CosmeticKind, number>> = {
  palette: 1.16,
  compact: 1.12,
  highlighter: 1.08,
  jar: 1.1,
  powder: 1.14,
  balm: 1.06,
  sponge: 1.05,
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
