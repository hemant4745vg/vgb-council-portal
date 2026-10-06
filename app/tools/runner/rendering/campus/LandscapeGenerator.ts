import * as THREE from "three";

export type LandscapeTheme =
  | "campus"
  | "garden"
  | "sports"
  | "hostel"
  | "gate";

export type LandscapeOptions = {
  width?: number;
  depth?: number;
  theme?: LandscapeTheme;
  seed?: number;
  treeDensity?: number;
  hedgeDensity?: number;
  lampDensity?: number;
  benchDensity?: number;
};

type ResolvedLandscapeOptions = {
  width: number;
  depth: number;
  theme: LandscapeTheme;
  seed: number;
  treeDensity: number;
  hedgeDensity: number;
  lampDensity: number;
  benchDensity: number;
};

type LandscapeMaterials = {
  grass: THREE.MeshStandardMaterial;
  grassDark: THREE.MeshStandardMaterial;
  soil: THREE.MeshStandardMaterial;
  path: THREE.MeshStandardMaterial;
  pathEdge: THREE.MeshStandardMaterial;
  hedge: THREE.MeshStandardMaterial;
  hedgeDark: THREE.MeshStandardMaterial;
  trunk: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  foliageDark: THREE.MeshStandardMaterial;
  concrete: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  lamp: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
};

const DEFAULTS: ResolvedLandscapeOptions = {
  width: 64,
  depth: 180,
  theme: "campus",
  seed: 18473,
  treeDensity: 1,
  hedgeDensity: 1,
  lampDensity: 1,
  benchDensity: 1,
};

function material(
  color: number,
  roughness = 0.85,
  metalness = 0,
) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
  });
}

function createMaterials(): LandscapeMaterials {
  return {
    grass: material(0x557844, 0.96),
    grassDark: material(0x3f6338, 0.98),
    soil: material(0x70523a, 1),
    path: material(0xb8a989, 0.94),
    pathEdge: material(0x8d8068, 0.98),
    hedge: material(0x3f6b39, 0.94),
    hedgeDark: material(0x31552f, 0.98),
    trunk: material(0x624735, 1),
    foliage: material(0x47783d, 0.94),
    foliageDark: material(0x355f35, 0.98),
    concrete: material(0xb8ad96, 0.96),
    metal: material(0x4d5147, 0.58, 0.28),
    lamp: material(0xd5c69c, 0.44, 0.2),
    wood: material(0x6b4c34, 0.9),
  };
}

function createMesh(
  geometry: THREE.BufferGeometry,
  materialInstance: THREE.Material,
) {
  const mesh = new THREE.Mesh(
    geometry,
    materialInstance,
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function addBox(
  parent: THREE.Group,
  width: number,
  height: number,
  depth: number,
  x: number,
  y: number,
  z: number,
  materialInstance: THREE.Material,
) {
  const mesh = createMesh(
    new THREE.BoxGeometry(
      width,
      height,
      depth,
    ),
    materialInstance,
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);

  return mesh;
}

function addCylinder(
  parent: THREE.Group,
  radiusTop: number,
  radiusBottom: number,
  height: number,
  x: number,
  y: number,
  z: number,
  materialInstance: THREE.Material,
  radialSegments = 10,
) {
  const mesh = createMesh(
    new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      height,
      radialSegments,
    ),
    materialInstance,
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);

  return mesh;
}

function hashSeed(seed: number) {
  let state = Math.abs(seed) || 1;

  return () => {
    state =
      (state * 1664525 + 1013904223) >>> 0;

    return state / 4294967296;
  };
}

function addGround(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: LandscapeMaterials,
) {
  const ground = addBox(
    parent,
    options.width,
    0.28,
    options.depth,
    0,
    -0.16,
    0,
    materials.grass,
  );

  ground.name = "campus-ground";

  const borderWidth = 0.9;

  addBox(
    parent,
    borderWidth,
    0.06,
    options.depth,
    -options.width / 2 +
      borderWidth / 2,
    0.02,
    0,
    materials.grassDark,
  );

  addBox(
    parent,
    borderWidth,
    0.06,
    options.depth,
    options.width / 2 -
      borderWidth / 2,
    0.02,
    0,
    materials.grassDark,
  );
}

function addPath(
  parent: THREE.Group,
  width: number,
  depth: number,
  x: number,
  z: number,
  materialInstance: THREE.Material,
  edgeMaterial: THREE.Material,
  rotationY = 0,
) {
  const path = new THREE.Group();
  path.rotation.y = rotationY;
  path.position.set(x, 0, z);

  addBox(
    path,
    width,
    0.08,
    depth,
    0,
    0.04,
    0,
    materialInstance,
  );

  addBox(
    path,
    0.12,
    0.10,
    depth,
    -width / 2,
    0.05,
    0,
    edgeMaterial,
  );

  addBox(
    path,
    0.12,
    0.10,
    depth,
    width / 2,
    0.05,
    0,
    edgeMaterial,
  );

  parent.add(path);

  return path;
}

function addCampusPaths(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: LandscapeMaterials,
) {
  addPath(
    parent,
    5.2,
    options.depth,
    0,
    0,
    materials.path,
    materials.pathEdge,
  );

  const sideOffset =
    Math.min(
      options.width * 0.31,
      20,
    );

  addPath(
    parent,
    3.0,
    options.depth * 0.88,
    -sideOffset,
    0,
    materials.path,
    materials.pathEdge,
  );

  addPath(
    parent,
    3.0,
    options.depth * 0.88,
    sideOffset,
    0,
    materials.path,
    materials.pathEdge,
  );

  const crossDepth = 3.4;

  for (
    const z of [-45, 0, 45]
  ) {
    addPath(
      parent,
      options.width * 0.72,
      crossDepth,
      0,
      z,
      materials.path,
      materials.pathEdge,
    );
  }
}

function addLawnIslands(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: LandscapeMaterials,
) {
  const islandWidth =
    Math.max(
      5,
      options.width * 0.18,
    );

  const positions = [
    -options.width * 0.31,
    options.width * 0.31,
  ];

  for (const x of positions) {
    addBox(
      parent,
      islandWidth,
      0.08,
      options.depth * 0.9,
      x,
      0.045,
      0,
      materials.grassDark,
    );

    addBox(
      parent,
      islandWidth - 0.45,
      0.075,
      options.depth * 0.9 - 0.45,
      x,
      0.085,
      0,
      materials.grass,
    );
  }
}

function addHedgeSegment(
  parent: THREE.Group,
  x: number,
  z: number,
  width: number,
  depth: number,
  rotationY: number,
  materials: LandscapeMaterials,
) {
  const hedge = new THREE.Group();
  hedge.position.set(x, 0, z);
  hedge.rotation.y = rotationY;

  const segments =
    Math.max(
      1,
      Math.ceil(
        Math.max(width, depth) / 1.4,
      ),
    );

  const length =
    Math.max(width, depth);

  for (
    let i = 0;
    i < segments;
    i += 1
  ) {
    const t =
      segments === 1
        ? 0.5
        : i / (segments - 1);

    const offset =
      -length / 2 +
      t * length;

    if (width >= depth) {
      addBox(
        hedge,
        1.45,
        0.95,
        0.72,
        offset,
        0.475,
        0,
        i % 3 === 0
          ? materials.hedgeDark
          : materials.hedge,
      );
    } else {
      addBox(
        hedge,
        0.72,
        0.95,
        1.45,
        0,
        0.475,
        offset,
        i % 3 === 0
          ? materials.hedgeDark
          : materials.hedge,
      );
    }
  }

  parent.add(hedge);
}

function addHedges(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: LandscapeMaterials,
) {
  const density =
    Math.max(
      0,
      options.hedgeDensity,
    );

  if (density <= 0) return;

  const sideX =
    Math.min(
      options.width * 0.41,
      27,
    );

  const spacing =
    Math.max(
      16,
      27 / density,
    );

  for (
    let z = -options.depth / 2 + 10;
    z < options.depth / 2;
    z += spacing
  ) {
    addHedgeSegment(
      parent,
      -sideX,
      z,
      7.5,
      1.0,
      0,
      materials,
    );

    addHedgeSegment(
      parent,
      sideX,
      z + 8,
      7.5,
      1.0,
      0,
      materials,
    );
  }

  for (
    const z of [-47, 0, 47]
  ) {
    addHedgeSegment(
      parent,
      0,
      z,
      19,
      1,
      0,
      materials,
    );
  }
}

function addTree(
  parent: THREE.Group,
  x: number,
  z: number,
  scale: number,
  materials: LandscapeMaterials,
  seed: number,
) {
  const random = hashSeed(seed);

  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  tree.scale.setScalar(scale);

  const trunkHeight =
    2.0 +
    random() * 0.8;

  addCylinder(
    tree,
    0.18,
    0.27,
    trunkHeight,
    0,
    trunkHeight / 2,
    0,
    materials.trunk,
    9,
  );

  const canopy = new THREE.Group();
  canopy.position.y =
    trunkHeight + 0.35;

  const clusterCount = 4;

  for (
    let i = 0;
    i < clusterCount;
    i += 1
  ) {
    const angle =
      (i / clusterCount) *
      Math.PI *
      2;

    const radius =
      0.45 +
      random() * 0.18;

    const sphere = createMesh(
      new THREE.SphereGeometry(
        0.9 +
          random() * 0.22,
        10,
        8,
      ),
      i % 2 === 0
        ? materials.foliage
        : materials.foliageDark,
    );

    sphere.position.set(
      Math.cos(angle) * radius,
      (random() - 0.5) * 0.32,
      Math.sin(angle) * radius,
    );

    canopy.add(sphere);
  }

  tree.add(canopy);
  parent.add(tree);

  return tree;
}

function addTrees(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: LandscapeMaterials,
) {
  const density =
    Math.max(
      0,
      options.treeDensity,
    );

  if (density <= 0) return;

  const random = hashSeed(
    options.seed,
  );

  const count = Math.round(
    (options.depth / 13) *
      density,
  );

  const sideX =
    Math.min(
      options.width * 0.39,
      25,
    );

  for (
    let i = 0;
    i < count;
    i += 1
  ) {
    const z =
      -options.depth / 2 +
      7 +
      random() *
        (options.depth - 14);

    const side =
      i % 2 === 0
        ? -1
        : 1;

    const x =
      side *
      (sideX +
        random() * 3.5);

    const scale =
      0.78 +
      random() * 0.42;

    addTree(
      parent,
      x,
      z,
      scale,
      materials,
      options.seed + i * 97,
    );
  }

  // A small line of ornamental trees around the central campus path.
  for (
    let i = 0;
    i < 10;
    i += 1
  ) {
    const z =
      -options.depth / 2 +
      12 +
      i *
        ((options.depth - 24) / 9);

    const side =
      i % 2 === 0
        ? -1
        : 1;

    addTree(
      parent,
      side *
        Math.min(
          options.width * 0.26,
          16,
        ),
      z,
      0.68 +
        random() * 0.16,
      materials,
      options.seed +
        1000 +
        i * 43,
    );
  }
}

function addLampPost(
  parent: THREE.Group,
  x: number,
  z: number,
  rotationY: number,
  materials: LandscapeMaterials,
) {
  const lamp = new THREE.Group();
  lamp.position.set(x, 0, z);
  lamp.rotation.y = rotationY;

  addCylinder(
    lamp,
    0.055,
    0.08,
    3.2,
    0,
    1.6,
    0,
    materials.metal,
    8,
  );

  addBox(
    lamp,
    0.12,
    0.12,
    0.7,
    0,
    3.16,
    0.28,
    materials.metal,
  );

  addCylinder(
    lamp,
    0.18,
    0.12,
    0.18,
    0,
    3.12,
    0.6,
    materials.lamp,
    10,
  );

  parent.add(lamp);
}

function addLampPosts(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: LandscapeMaterials,
) {
  const density =
    Math.max(
      0,
      options.lampDensity,
    );

  if (density <= 0) return;

  const spacing =
    Math.max(
      20,
      32 / density,
    );

  const sideX =
    Math.min(
      options.width * 0.22,
      15,
    );

  let index = 0;

  for (
    let z = -options.depth / 2 + 12;
    z < options.depth / 2;
    z += spacing
  ) {
    const side =
      index % 2 === 0
        ? -1
        : 1;

    addLampPost(
      parent,
      side * sideX,
      z,
      side < 0
        ? 0
        : Math.PI,
      materials,
    );

    index += 1;
  }
}

function addBench(
  parent: THREE.Group,
  x: number,
  z: number,
  rotationY: number,
  materials: LandscapeMaterials,
) {
  const bench = new THREE.Group();
  bench.position.set(x, 0, z);
  bench.rotation.y = rotationY;

  const seatWidth = 1.9;

  addBox(
    bench,
    seatWidth,
    0.14,
    0.48,
    0,
    0.72,
    0,
    materials.wood,
  );

  addBox(
    bench,
    seatWidth,
    0.72,
    0.12,
    0,
    1.22,
    0.18,
    materials.wood,
  );

  for (
    const xOffset of [
      -0.65,
      0.65,
    ]
  ) {
    addBox(
      bench,
      0.12,
      0.68,
      0.12,
      xOffset,
      0.35,
      0,
      materials.metal,
    );
  }

  parent.add(bench);
}

function addBenches(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: LandscapeMaterials,
) {
  const density =
    Math.max(
      0,
      options.benchDensity,
    );

  if (density <= 0) return;

  const count =
    Math.max(
      2,
      Math.round(
        (options.depth / 48) *
          density,
      ),
    );

  const sideX =
    Math.min(
      options.width * 0.28,
      17,
    );

  for (
    let i = 0;
    i < count;
    i += 1
  ) {
    const z =
      -options.depth / 2 +
      24 +
      i *
        ((options.depth - 48) /
          Math.max(1, count - 1));

    const side =
      i % 2 === 0
        ? -1
        : 1;

    addBench(
      parent,
      side * sideX,
      z,
      side < 0
        ? Math.PI / 2
        : -Math.PI / 2,
      materials,
    );
  }
}

function addGardenBeds(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: LandscapeMaterials,
) {
  const random = hashSeed(
    options.seed + 7919,
  );

  const positions = [
    [-18, -28],
    [18, -28],
    [-18, 28],
    [18, 28],
  ];

  for (const [x, z] of positions) {
    addBox(
      parent,
      5.5,
      0.12,
      2.3,
      x,
      0.06,
      z,
      materials.soil,
    );

    for (
      let i = 0;
      i < 8;
      i += 1
    ) {
      const flower = createMesh(
        new THREE.SphereGeometry(
          0.11 +
            random() * 0.07,
          7,
          5,
        ),
        materials.foliage,
      );

      flower.position.set(
        x -
          2.1 +
          random() * 4.2,
        0.22,
        z -
          0.7 +
          random() * 1.4,
      );

      parent.add(flower);
    }
  }
}

function addThemeDetails(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: LandscapeMaterials,
) {
  if (
    options.theme === "garden" ||
    options.theme === "campus"
  ) {
    addGardenBeds(
      parent,
      options,
      materials,
    );
  }

  if (
    options.theme === "hostel"
  ) {
    addHedgeSegment(
      parent,
      0,
      -22,
      22,
      1,
      0,
      materials,
    );
  }

  if (
    options.theme === "gate"
  ) {
    addBox(
      parent,
      8,
      0.16,
      2.6,
      0,
      0.08,
      -options.depth / 2 + 4,
      materials.path,
    );
  }
}

export function createLandscape(
  input: LandscapeOptions = {},
) {
  const options: ResolvedLandscapeOptions = {
    ...DEFAULTS,
    ...input,
  };

  const group =
    new THREE.Group();

  group.name =
    "campus-landscape";

  const materials =
    createMaterials();

  addGround(
    group,
    options,
    materials,
  );

  addCampusPaths(
    group,
    options,
    materials,
  );

  addLawnIslands(
    group,
    options,
    materials,
  );

  addHedges(
    group,
    options,
    materials,
  );

  addTrees(
    group,
    options,
    materials,
  );

  addLampPosts(
    group,
    options,
    materials,
  );

  addBenches(
    group,
    options,
    materials,
  );

  addThemeDetails(
    group,
    options,
    materials,
  );

  group.userData = {
    type: "campus-landscape",
    theme: options.theme,
    width: options.width,
    depth: options.depth,
    seed: options.seed,
  };

  group.traverse(
    (object) => {
      if (
        object instanceof THREE.Mesh
      ) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    },
  );

  return group;
}

export function createCampusLandscape(
  overrides: Partial<LandscapeOptions> = {},
) {
  return createLandscape({
    theme: "campus",
    width: 64,
    depth: 180,
    treeDensity: 1,
    hedgeDensity: 1,
    lampDensity: 1,
    benchDensity: 1,
    ...overrides,
  });
}

export function createGardenLandscape(
  overrides: Partial<LandscapeOptions> = {},
) {
  return createLandscape({
    theme: "garden",
    width: 58,
    depth: 140,
    treeDensity: 1.2,
    hedgeDensity: 1.15,
    lampDensity: 0.8,
    benchDensity: 1.3,
    ...overrides,
  });
}

export function createHostelLandscape(
  overrides: Partial<LandscapeOptions> = {},
) {
  return createLandscape({
    theme: "hostel",
    width: 60,
    depth: 150,
    treeDensity: 0.9,
    hedgeDensity: 1.2,
    lampDensity: 1,
    benchDensity: 1,
    ...overrides,
  });
}
