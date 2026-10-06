import * as THREE from "three";

export type CampusDetailKind =
  | "sign"
  | "noticeboard"
  | "banner"
  | "bollard"
  | "planter"
  | "drain"
  | "bench"
  | "flag"
  | "light";

export type CampusDetailOptions = {
  kind?: CampusDetailKind;
  width?: number;
  height?: number;
  depth?: number;
  text?: string;
  color?: number;
  accentColor?: number;
};

const COLORS = {
  brick: 0x8c4937,
  cream: 0xe4d7b5,
  dark: 0x263b3d,
  metal: 0x39434a,
  wood: 0x76543d,
  concrete: 0xb8b29f,
  green: 0x315b32,
  paper: 0xf0e7d0,
  red: 0x9f3f35,
  yellow: 0xd3ad55,
  white: 0xf3eee2,
};

function material(
  color: number,
  roughness = 0.82,
  metalness = 0,
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
  });
}

function addBox(
  parent: THREE.Group,
  size: THREE.Vector3Tuple,
  position: THREE.Vector3Tuple,
  mat: THREE.Material,
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    mat,
  );

  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  parent.add(mesh);

  return mesh;
}

function addCylinder(
  parent: THREE.Group,
  radius: number,
  height: number,
  position: THREE.Vector3Tuple,
  mat: THREE.Material,
  segments = 10,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      segments,
    ),
    mat,
  );

  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  parent.add(mesh);

  return mesh;
}

function mark(
  object: THREE.Object3D,
  type: string,
) {
  object.userData.type = type;

  object.traverse((child) => {
    child.userData.type = type;

    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return object;
}

function createSign(
  options: CampusDetailOptions,
) {
  const {
    width = 2.4,
    height = 1.4,
    text = "VIDYAGYAN",
    color = COLORS.brick,
    accentColor = COLORS.cream,
  } = options;

  const root = new THREE.Group();

  const post = material(COLORS.metal, 0.62, 0.3);
  const board = material(color);
  const trim = material(accentColor);

  addCylinder(
    root,
    0.06,
    1.9,
    [-width * 0.32, 0.95, 0],
    post,
    8,
  );

  addCylinder(
    root,
    0.06,
    1.9,
    [width * 0.32, 0.95, 0],
    post,
    8,
  );

  addBox(
    root,
    [width, height, 0.12],
    [0, 1.7, 0],
    board,
  );

  addBox(
    root,
    [width + 0.08, 0.08, 0.16],
    [0, 1.7 + height / 2, 0],
    trim,
  );

  addBox(
    root,
    [width + 0.08, 0.08, 0.16],
    [0, 1.7 - height / 2, 0],
    trim,
  );

  /*
   * Simple geometric "lettering" rather than a font texture.
   * This keeps the generator self-contained and avoids loading
   * font assets into the runner.
   */
  const letterMat = material(
    COLORS.white,
    0.75,
  );

  const characters = Math.min(
    text.length,
    12,
  );

  const spacing =
    (width * 0.72) /
    Math.max(characters, 1);

  for (let i = 0; i < characters; i++) {
    const bar = addBox(
      root,
      [
        Math.max(0.025, spacing * 0.28),
        0.055,
        0.025,
      ],
      [
        (i - (characters - 1) / 2) *
          spacing,
        1.7,
        -0.075,
      ],
      letterMat,
    );

    bar.userData.characterIndex = i;
  }

  return mark(root, "campus-sign");
}

function createNoticeBoard(
  options: CampusDetailOptions,
) {
  const {
    width = 2.2,
    height = 1.6,
  } = options;

  const root = new THREE.Group();

  const frame = material(
    COLORS.wood,
    0.85,
  );

  const paper = material(
    COLORS.paper,
    0.92,
  );

  const metal = material(
    COLORS.metal,
    0.65,
    0.25,
  );

  addCylinder(
    root,
    0.055,
    1.7,
    [-width * 0.34, 0.85, 0],
    metal,
    8,
  );

  addCylinder(
    root,
    0.055,
    1.7,
    [width * 0.34, 0.85, 0],
    metal,
    8,
  );

  addBox(
    root,
    [width, height, 0.12],
    [0, 1.45, 0],
    frame,
  );

  addBox(
    root,
    [
      width - 0.22,
      height - 0.22,
      0.035,
    ],
    [0, 1.45, -0.08],
    paper,
  );

  for (let row = 0; row < 3; row++) {
    addBox(
      root,
      [width * 0.48, 0.045, 0.025],
      [
        0,
        1.8 - row * 0.27,
        -0.105,
      ],
      material(
        row === 1
          ? COLORS.red
          : COLORS.dark,
        0.9,
      ),
    );
  }

  return mark(
    root,
    "campus-noticeboard",
  );
}

function createBanner(
  options: CampusDetailOptions,
) {
  const {
    width = 4.8,
    height = 0.9,
    color = COLORS.red,
    accentColor = COLORS.cream,
  } = options;

  const root = new THREE.Group();

  const bannerMat = material(color);
  const accentMat = material(
    accentColor,
  );

  addBox(
    root,
    [width, height, 0.08],
    [0, 0, 0],
    bannerMat,
  );

  addBox(
    root,
    [width * 0.75, 0.08, 0.025],
    [0, 0, -0.055],
    accentMat,
  );

  /*
   * Slight segmented folds keep the banner from reading
   * as a perfectly flat developer-created rectangle.
   */
  for (let i = 0; i < 5; i++) {
    const fold = addBox(
      root,
      [
        width / 5,
        0.035,
        0.025,
      ],
      [
        -width / 2 +
          width / 10 +
          i * (width / 5),
        -height * 0.34,
        -0.055,
      ],
      accentMat,
    );

    fold.rotation.z =
      i % 2 === 0
        ? 0.035
        : -0.035;
  }

  return mark(
    root,
    "campus-banner",
  );
}

function createBollard(
  options: CampusDetailOptions,
) {
  const {
    height = 0.85,
    color = COLORS.concrete,
    accentColor = COLORS.brick,
  } = options;

  const root = new THREE.Group();

  const body = material(color);
  const accent = material(
    accentColor,
  );

  addCylinder(
    root,
    0.14,
    height,
    [0, height / 2, 0],
    body,
    10,
  );

  addCylinder(
    root,
    0.145,
    0.12,
    [0, height * 0.72, 0],
    accent,
    10,
  );

  addCylinder(
    root,
    0.19,
    0.1,
    [0, 0.05, 0],
    body,
    10,
  );

  return mark(
    root,
    "campus-bollard",
  );
}

function createPlanter(
  options: CampusDetailOptions,
) {
  const {
    width = 1.2,
    height = 0.65,
    depth = 0.8,
  } = options;

  const root = new THREE.Group();

  const planterMat = material(
    COLORS.brick,
  );

  const soilMat = material(
    0x5c4635,
  );

  const foliageMat = material(
    COLORS.green,
  );

  addBox(
    root,
    [width, height, depth],
    [0, height / 2, 0],
    planterMat,
  );

  addBox(
    root,
    [
      width * 0.76,
      0.08,
      depth * 0.72,
    ],
    [0, height + 0.04, 0],
    soilMat,
  );

  for (let i = 0; i < 5; i++) {
    const plant = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.16 + i * 0.015,
        7,
        6,
      ),
      foliageMat,
    );

    plant.position.set(
      (i - 2) *
        width *
        0.16,
      height + 0.23 +
        (i % 2) * 0.08,
      (i % 2 === 0 ? -1 : 1) *
        depth *
        0.13,
    );

    plant.scale.y = 1.35;

    plant.castShadow = true;
    plant.receiveShadow = true;

    root.add(plant);
  }

  return mark(
    root,
    "campus-planter",
  );
}

function createDrain(
  options: CampusDetailOptions,
) {
  const {
    width = 2.4,
    depth = 0.28,
  } = options;

  const root = new THREE.Group();

  const concrete = material(
    COLORS.concrete,
  );

  const dark = material(
    COLORS.dark,
    0.65,
    0.25,
  );

  addBox(
    root,
    [width, 0.08, depth],
    [0, 0.04, 0],
    concrete,
  );

  const grateWidth = 0.06;

  for (
    let x = -width / 2 + 0.18;
    x <= width / 2 - 0.18;
    x += 0.25
  ) {
    addBox(
      root,
      [
        grateWidth,
        0.035,
        depth * 0.72,
      ],
      [x, 0.09, 0],
      dark,
    );
  }

  return mark(
    root,
    "campus-drain",
  );
}

function createBench(
  options: CampusDetailOptions,
) {
  const {
    width = 1.9,
  } = options;

  const root = new THREE.Group();

  const wood = material(
    COLORS.wood,
  );

  const metal = material(
    COLORS.metal,
    0.65,
    0.3,
  );

  addBox(
    root,
    [width, 0.14, 0.45],
    [0, 0.72, 0],
    wood,
  );

  addBox(
    root,
    [width, 0.65, 0.12],
    [0, 1.08, -0.16],
    wood,
  );

  for (const x of [
    -width * 0.32,
    width * 0.32,
  ]) {
    addBox(
      root,
      [0.12, 0.7, 0.34],
      [x, 0.35, 0],
      metal,
    );
  }

  return mark(
    root,
    "campus-bench-detail",
  );
}

function createFlag(
  options: CampusDetailOptions,
) {
  const {
    height = 5,
    color = COLORS.red,
    accentColor = COLORS.white,
  } = options;

  const root = new THREE.Group();

  const poleMat = material(
    COLORS.metal,
    0.45,
    0.55,
  );

  const flagMat = material(
    color,
    0.72,
  );

  addCylinder(
    root,
    0.035,
    height,
    [0, height / 2, 0],
    poleMat,
    10,
  );

  addBox(
    root,
    [1.65, 0.9, 0.035],
    [0.8, height - 0.7, 0],
    flagMat,
  );

  addBox(
    root,
    [0.9, 0.07, 0.045],
    [0.8, height - 0.7, -0.035],
    material(
      accentColor,
      0.72,
    ),
  );

  return mark(
    root,
    "campus-flag",
  );
}

function createLight(
  options: CampusDetailOptions,
) {
  const {
    height = 3.2,
  } = options;

  const root = new THREE.Group();

  const metal = material(
    COLORS.metal,
    0.58,
    0.3,
  );

  const glowMat = material(
    COLORS.yellow,
    0.3,
  );

  addCylinder(
    root,
    0.055,
    height,
    [0, height / 2, 0],
    metal,
    8,
  );

  addBox(
    root,
    [0.5, 0.08, 0.16],
    [0, height - 0.08, 0],
    metal,
  );

  addCylinder(
    root,
    0.12,
    0.1,
    [0.2, height - 0.13, 0],
    glowMat,
    12,
  );

  const point = new THREE.PointLight(
    COLORS.yellow,
    0.65,
    7,
    2,
  );

  point.position.set(
    0.2,
    height - 0.1,
    0,
  );

  root.add(point);

  return mark(
    root,
    "campus-light",
  );
}

export function createCampusDetail(
  options: CampusDetailOptions = {},
) {
  const kind =
    options.kind ?? "sign";

  switch (kind) {
    case "noticeboard":
      return createNoticeBoard(
        options,
      );

    case "banner":
      return createBanner(options);

    case "bollard":
      return createBollard(options);

    case "planter":
      return createPlanter(options);

    case "drain":
      return createDrain(options);

    case "bench":
      return createBench(options);

    case "flag":
      return createFlag(options);

    case "light":
      return createLight(options);

    case "sign":
    default:
      return createSign(options);
  }
}

export function createCampusSign(
  text = "VIDYAGYAN",
  options: Omit<
    CampusDetailOptions,
    "kind" | "text"
  > = {},
) {
  return createCampusDetail({
    ...options,
    kind: "sign",
    text,
  });
}

export function createNoticeBoard(
  options: Omit<
    CampusDetailOptions,
    "kind"
  > = {},
) {
  return createCampusDetail({
    ...options,
    kind: "noticeboard",
  });
}

export function createCampusBanner(
  options: Omit<
    CampusDetailOptions,
    "kind"
  > = {},
) {
  return createCampusDetail({
    ...options,
    kind: "banner",
  });
}

export function createCampusPlanter(
  options: Omit<
    CampusDetailOptions,
    "kind"
  > = {},
) {
  return createCampusDetail({
    ...options,
    kind: "planter",
  });
}

export function createCampusBollard(
  options: Omit<
    CampusDetailOptions,
    "kind"
  > = {},
) {
  return createCampusDetail({
    ...options,
    kind: "bollard",
  });
}

export function createCampusFlag(
  options: Omit<
    CampusDetailOptions,
    "kind"
  > = {},
) {
  return createCampusDetail({
    ...options,
    kind: "flag",
  });
}
