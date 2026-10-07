import * as THREE from "three";

export type LandscapeStyle =
  | "campus"
  | "quadrangle"
  | "walkway"
  | "garden"
  | "sports"
  | "hostel"
  | "hostels"
  | "gate";

export type LandscapeTheme = LandscapeStyle;

export type TreeVariant =
  | "round"
  | "narrow"
  | "cluster";

export type LandscapeOptions = {
  width?: number;
  depth?: number;

  style?: LandscapeStyle;
  theme?: LandscapeTheme;
  seed?: number;

  treeCount?: number;
  treeDensity?: number;
  hedgeDensity?: number;
  lampDensity?: number;
  benchDensity?: number;

  grassColor?: number;
  pathColor?: number;
  kerbColor?: number;
  hedgeColor?: number;
  flowerColor?: number;
  trunkColor?: number;
  foliageColor?: number;
  metalColor?: number;
  woodColor?: number;

  pathWidth?: number;
  pathInset?: number;

  hedgeHeight?: number;
  hedgeThickness?: number;

  treeScale?: number;
  treeSpacing?: number;

  includePaths?: boolean;
  includeHedges?: boolean;
  includeFlowers?: boolean;
  includeBenches?: boolean;
  includeLamps?: boolean;

  name?: string;
};

type ResolvedLandscapeOptions = {
  width: number;
  depth: number;

  style: LandscapeStyle;
  seed: number;

  treeDensity: number;
  treeCount: number;
  hedgeDensity: number;
  lampDensity: number;
  benchDensity: number;

  grassColor: number;
  pathColor: number;
  kerbColor: number;
  hedgeColor: number;
  flowerColor: number;
  trunkColor: number;
  foliageColor: number;
  metalColor: number;
  woodColor: number;

  pathWidth: number;
  pathInset: number;

  hedgeHeight: number;
  hedgeThickness: number;

  treeScale: number;
  treeSpacing: number;

  includePaths: boolean;
  includeHedges: boolean;
  includeFlowers: boolean;
  includeBenches: boolean;
  includeLamps: boolean;

  name?: string;
};

type MaterialSet = {
  grass: THREE.MeshStandardMaterial;
  path: THREE.MeshStandardMaterial;
  kerb: THREE.MeshStandardMaterial;
  hedge: THREE.MeshStandardMaterial;
  flower: THREE.MeshStandardMaterial;
  trunk: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
};

const DEFAULTS = {
  width: 92,
  depth: 120,

  style: "campus" as LandscapeStyle,
  seed: 173,

  treeCount: 8,
  treeDensity: 1,
  hedgeDensity: 1,
  lampDensity: 0.65,
  benchDensity: 0.45,

  grassColor: 0x527d43,
  pathColor: 0xb9a77b,
  kerbColor: 0xd7cfb8,
  hedgeColor: 0x315d35,
  flowerColor: 0xc65b4b,
  trunkColor: 0x6a4930,
  foliageColor: 0x3e713e,
  metalColor: 0x3e4541,
  woodColor: 0x76533a,

  pathWidth: 4.5,
  pathInset: 5,

  hedgeHeight: 0.85,
  hedgeThickness: 0.7,

  treeScale: 1,
  treeSpacing: 9,

  includePaths: true,
  includeHedges: true,
  includeFlowers: true,
  includeBenches: true,
  includeLamps: true,
};

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.max(
    min,
    Math.min(max, value),
  );
}

function seededRandom(seed: number) {
  let state = Math.floor(seed) || 1;

  return () => {
    state =
      (state * 1664525 + 1013904223) >>> 0;

    return state / 4294967296;
  };
}

function createMaterial(
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

function createBox(
  width: number,
  height: number,
  depth: number,
  material: THREE.Material,
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      height,
      depth,
    ),
    material,
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function createCylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  material: THREE.Material,
  radialSegments = 10,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      height,
      radialSegments,
    ),
    material,
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function createMaterials(
  options: ResolvedLandscapeOptions,
): MaterialSet {
  return {
    grass: createMaterial(
      options.grassColor,
    ),

    path: createMaterial(
      options.pathColor,
    ),

    kerb: createMaterial(
      options.kerbColor,
    ),

    hedge: createMaterial(
      options.hedgeColor,
    ),

    flower: createMaterial(
      options.flowerColor,
      0.75,
    ),

    trunk: createMaterial(
      options.trunkColor,
    ),

    foliage: createMaterial(
      options.foliageColor,
    ),

    metal: createMaterial(
      options.metalColor,
      0.45,
      0.25,
    ),

    wood: createMaterial(
      options.woodColor,
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Ground and paths                                                           */
/* -------------------------------------------------------------------------- */

function createGrass(
  width: number,
  depth: number,
  material: THREE.Material,
) {
  const mesh = createBox(
    width,
    0.18,
    depth,
    material,
  );

  mesh.position.y = -0.09;
  mesh.receiveShadow = true;

  return mesh;
}

function createPath(
  width: number,
  depth: number,
  material: THREE.Material,
) {
  const group = new THREE.Group();

  const path = createBox(
    width,
    0.08,
    depth,
    material,
  );

  path.position.y = 0.02;
  path.castShadow = false;
  path.receiveShadow = true;

  group.add(path);

  return group;
}

function createCrossPath(
  width: number,
  depth: number,
  pathWidth: number,
  material: THREE.Material,
) {
  const group = new THREE.Group();

  group.add(
    createPath(
      width,
      pathWidth,
      material,
    ),
  );

  group.add(
    createPath(
      pathWidth,
      depth,
      material,
    ),
  );

  return group;
}

function createRadialPath(
  radius: number,
  pathWidth: number,
  material: THREE.Material,
) {
  const group = new THREE.Group();

  const segments = 8;

  for (
    let i = 0;
    i < segments;
    i += 1
  ) {
    const path = createBox(
      radius,
      0.07,
      pathWidth,
      material,
    );

    path.position.y = 0.025;
    path.rotation.y =
      (i / segments) * Math.PI;

    group.add(path);
  }

  return group;
}

/* -------------------------------------------------------------------------- */
/* Hedges                                                                     */
/* -------------------------------------------------------------------------- */

function createHedgeRow(
  length: number,
  height: number,
  thickness: number,
  material: THREE.Material,
  rounded = false,
) {
  const group = new THREE.Group();

  const hedge = createBox(
    length,
    height,
    thickness,
    material,
  );

  hedge.position.y = height / 2;

  if (rounded) {
    hedge.geometry.computeBoundingBox();
  }

  group.add(hedge);

  const segments = Math.max(
    2,
    Math.floor(length / 3),
  );

  const segmentWidth =
    length / segments;

  for (
    let i = 1;
    i < segments;
    i += 1
  ) {
    const divider = createBox(
      0.06,
      height * 0.9,
      thickness + 0.02,
      material,
    );

    divider.position.set(
      -length / 2 +
        i * segmentWidth,
      height / 2,
      0,
    );

    divider.castShadow = false;

    group.add(divider);
  }

  group.userData.type =
    "campus-hedge";

  return group;
}

/* -------------------------------------------------------------------------- */
/* Flowers                                                                    */
/* -------------------------------------------------------------------------- */

function createFlowerBed(
  width: number,
  depth: number,
  material: THREE.Material,
  seed: number,
) {
  const group = new THREE.Group();

  const random =
    seededRandom(seed);

  const count = Math.max(
    8,
    Math.floor(
      (width * depth) / 3.5,
    ),
  );

  for (
    let i = 0;
    i < count;
    i += 1
  ) {
    const stem = createCylinder(
      0.018,
      0.018,
      0.22,
      material,
      5,
    );

    stem.position.set(
      (random() - 0.5) * width,
      0.11,
      (random() - 0.5) * depth,
    );

    stem.castShadow = false;

    group.add(stem);
  }

  group.userData.type =
    "campus-flower-bed";

  return group;
}

/* -------------------------------------------------------------------------- */
/* Trees                                                                      */
/* -------------------------------------------------------------------------- */

function createTree(
  variant: TreeVariant,
  scale: number,
  materials: MaterialSet,
  seed: number,
) {
  const group = new THREE.Group();

  const random =
    seededRandom(seed);

  const trunkHeight =
    variant === "narrow"
      ? 2.7
      : variant === "cluster"
        ? 2.2
        : 2.4;

  const trunk = createCylinder(
    0.13 * scale,
    0.2 * scale,
    trunkHeight * scale,
    materials.trunk,
    8,
  );

  trunk.position.y =
    (trunkHeight * scale) / 2;

  group.add(trunk);

  if (variant === "cluster") {
    const clusters = 5;

    for (
      let i = 0;
      i < clusters;
      i += 1
    ) {
      const radius =
        (0.85 + random() * 0.35) *
        scale;

      const foliage =
        createCylinder(
          radius * 0.72,
          radius,
          radius * 1.15,
          materials.foliage,
          8,
        );

      foliage.position.set(
        (random() - 0.5) *
          1.2 *
          scale,
        (2.1 + random() * 1.1) *
          scale,
        (random() - 0.5) *
          1.2 *
          scale,
      );

      foliage.rotation.z =
        (random() - 0.5) * 0.15;

      group.add(foliage);
    }
  } else {
    const radius =
      variant === "narrow"
        ? 0.95
        : 1.2;

    const foliage =
      createCylinder(
        radius *
          scale *
          0.78,
        radius * scale,
        radius *
          scale *
          1.35,
        materials.foliage,
        9,
      );

    foliage.position.y =
      (trunkHeight + 0.65) *
      scale;

    if (variant === "narrow") {
      foliage.scale.x = 0.72;
      foliage.scale.z = 0.72;
    }

    group.add(foliage);

    const upper =
      createCylinder(
        radius *
          scale *
          0.52,
        radius *
          scale *
          0.7,
        radius *
          scale *
          0.8,
        materials.foliage,
        9,
      );

    upper.position.y =
      (trunkHeight + 1.35) *
      scale;

    group.add(upper);
  }

  group.userData.type =
    "campus-tree";

  group.userData.variant =
    variant;

  return group;
}

function scatterTrees(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: MaterialSet,
  bounds?: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  },
  seedOffset = 0,
) {
  const random =
    seededRandom(
      options.seed + seedOffset,
    );

  const count = Math.max(
    0,
    Math.round(options.treeCount),
  );

  const resolvedBounds =
    bounds ?? {
      minX: -options.width * 0.44,
      maxX: options.width * 0.44,
      minZ: -options.depth * 0.44,
      maxZ: options.depth * 0.44,
    };

  for (
    let i = 0;
    i < count;
    i += 1
  ) {
    const roll = random();

    const variant: TreeVariant =
      roll < 0.58
        ? "round"
        : roll < 0.82
          ? "narrow"
          : "cluster";

    const scale =
      options.treeScale *
      (0.88 + random() * 0.28);

    const tree = createTree(
      variant,
      scale,
      materials,
      options.seed +
        seedOffset +
        i * 31,
    );

    tree.position.set(
      resolvedBounds.minX +
        random() *
          (resolvedBounds.maxX -
            resolvedBounds.minX),
      0,
      resolvedBounds.minZ +
        random() *
          (resolvedBounds.maxZ -
            resolvedBounds.minZ),
    );

    parent.add(tree);
  }
}

/* -------------------------------------------------------------------------- */
/* Benches                                                                    */
/* -------------------------------------------------------------------------- */

function createBench(
  materials: MaterialSet,
) {
  const group = new THREE.Group();

  const seat = createBox(
    2.2,
    0.18,
    0.48,
    materials.wood,
  );

  seat.position.y = 0.9;

  group.add(seat);

  const back = createBox(
    2.2,
    0.65,
    0.14,
    materials.wood,
  );

  back.position.set(
    0,
    1.25,
    -0.18,
  );

  group.add(back);

  for (
    const x of [-0.82, 0.82]
  ) {
    for (
      const z of [-0.15, 0.15]
    ) {
      const leg = createBox(
        0.12,
        0.9,
        0.12,
        materials.metal,
      );

      leg.position.set(
        x,
        0.45,
        z,
      );

      group.add(leg);
    }
  }

  group.userData.type =
    "campus-bench";

  return group;
}

function scatterBenches(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: MaterialSet,
  positions: Array<{
    x: number;
    z: number;
    rotation?: number;
  }>,
) {
  if (
    !options.includeBenches ||
    options.benchDensity <= 0 ||
    positions.length === 0
  ) {
    return;
  }

  const density = clamp(
    options.benchDensity,
    0,
    1.5,
  );

  const count = Math.min(
    positions.length,
    Math.max(
      1,
      Math.round(
        positions.length *
          density,
      ),
    ),
  );

  for (
    let i = 0;
    i < count;
    i += 1
  ) {
    const index =
      count === positions.length
        ? i
        : Math.round(
            (i *
              (positions.length -
                1)) /
              Math.max(
                1,
                count - 1,
              ),
          );

    const source =
      positions[index];

    const bench =
      createBench(materials);

    bench.position.set(
      source.x,
      0,
      source.z,
    );

    if (
      source.rotation !==
      undefined
    ) {
      bench.rotation.y =
        source.rotation;
    }

    parent.add(bench);
  }
}

/* -------------------------------------------------------------------------- */
/* Lamps                                                                      */
/* -------------------------------------------------------------------------- */

function createLamp(
  materials: MaterialSet,
) {
  const group = new THREE.Group();

  const pole = createCylinder(
    0.045,
    0.075,
    2.8,
    materials.metal,
    8,
  );

  pole.position.y = 1.4;

  group.add(pole);

  const cap = createCylinder(
    0.18,
    0.22,
    0.18,
    materials.metal,
    8,
  );

  cap.position.y = 2.85;

  group.add(cap);

  const glowMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xffe9ae,
      emissive: 0xffd77b,
      emissiveIntensity: 1.3,
      roughness: 0.45,
    });

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.1,
      8,
      8,
    ),
    glowMaterial,
  );

  glow.position.y = 2.88;

  group.add(glow);

  group.userData.type =
    "campus-lamp";

  return group;
}

function scatterLamps(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: MaterialSet,
  positions: Array<{
    x: number;
    z: number;
  }>,
) {
  if (
    !options.includeLamps ||
    options.lampDensity <= 0 ||
    positions.length === 0
  ) {
    return;
  }

  const density = clamp(
    options.lampDensity,
    0,
    1.5,
  );

  const count = Math.min(
    positions.length,
    Math.max(
      1,
      Math.round(
        positions.length *
          density,
      ),
    ),
  );

  for (
    let i = 0;
    i < count;
    i += 1
  ) {
    const index =
      count === positions.length
        ? i
        : Math.round(
            (i *
              (positions.length -
                1)) /
              Math.max(
                1,
                count - 1,
              ),
          );

    const source =
      positions[index];

    const lamp =
      createLamp(materials);

    lamp.position.set(
      source.x,
      0,
      source.z,
    );

    parent.add(lamp);
  }
}

/* -------------------------------------------------------------------------- */
/* Option compatibility                                                       */
/* -------------------------------------------------------------------------- */

function normalizeLandscapeStyle(
  style: LandscapeStyle,
): Exclude<
  LandscapeStyle,
  "campus" | "hostel"
> {
  switch (style) {
    case "campus":
      return "quadrangle";

    case "hostel":
      return "hostels";

    default:
      return style;
  }
}

function mergeOptions(
  options: LandscapeOptions = {},
): ResolvedLandscapeOptions {
  const sourceStyle =
    options.style ??
    options.theme ??
    DEFAULTS.style;

  const treeDensity =
    Math.max(
      0,
      options.treeDensity ??
        DEFAULTS.treeDensity,
    );

  const hedgeDensity =
    Math.max(
      0,
      options.hedgeDensity ??
        DEFAULTS.hedgeDensity,
    );

  const lampDensity =
    Math.max(
      0,
      options.lampDensity ??
        DEFAULTS.lampDensity,
    );

  const benchDensity =
    Math.max(
      0,
      options.benchDensity ??
        DEFAULTS.benchDensity,
    );

  const requestedTreeCount =
    options.treeCount ??
    DEFAULTS.treeCount;

  const resolvedTreeCount =
    Math.max(
      0,
      Math.round(
        requestedTreeCount *
          treeDensity,
      ),
    );

  return {
    width:
      options.width ??
      DEFAULTS.width,

    depth:
      options.depth ??
      DEFAULTS.depth,

    style:
      normalizeLandscapeStyle(
        sourceStyle,
      ),

    seed:
      options.seed ??
      DEFAULTS.seed,

    treeDensity,

    treeCount:
      resolvedTreeCount,

    hedgeDensity,

    lampDensity,

    benchDensity,

    grassColor:
      options.grassColor ??
      DEFAULTS.grassColor,

    pathColor:
      options.pathColor ??
      DEFAULTS.pathColor,

    kerbColor:
      options.kerbColor ??
      DEFAULTS.kerbColor,

    hedgeColor:
      options.hedgeColor ??
      DEFAULTS.hedgeColor,

    flowerColor:
      options.flowerColor ??
      DEFAULTS.flowerColor,

    trunkColor:
      options.trunkColor ??
      DEFAULTS.trunkColor,

    foliageColor:
      options.foliageColor ??
      DEFAULTS.foliageColor,

    metalColor:
      options.metalColor ??
      DEFAULTS.metalColor,

    woodColor:
      options.woodColor ??
      DEFAULTS.woodColor,

    pathWidth:
      options.pathWidth ??
      DEFAULTS.pathWidth,

    pathInset:
      options.pathInset ??
      DEFAULTS.pathInset,

    hedgeHeight:
      options.hedgeHeight ??
      DEFAULTS.hedgeHeight,

    hedgeThickness:
      options.hedgeThickness ??
      DEFAULTS.hedgeThickness,

    treeScale:
      options.treeScale ??
      DEFAULTS.treeScale,

    treeSpacing:
      options.treeSpacing ??
      DEFAULTS.treeSpacing,

    includePaths:
      options.includePaths ??
      DEFAULTS.includePaths,

    includeHedges:
      options.includeHedges ??
      DEFAULTS.includeHedges,

    includeFlowers:
      options.includeFlowers ??
      DEFAULTS.includeFlowers,

    includeBenches:
      options.includeBenches ??
      DEFAULTS.includeBenches,

    includeLamps:
      options.includeLamps ??
      DEFAULTS.includeLamps,

    name: options.name,
  };
}

/* -------------------------------------------------------------------------- */
/* Environment builders                                                       */
/* -------------------------------------------------------------------------- */

function createQuadrangleLandscapeInternal(
  group: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: MaterialSet,
) {
  group.add(
    createGrass(
      options.width,
      options.depth,
      materials.grass,
    ),
  );

  if (options.includePaths) {
    group.add(
      createCrossPath(
        options.width,
        options.depth *
          0.88,
        Math.min(
          options.pathWidth,
          2.5,
        ),
        materials.path,
      ),
    );
  }

  if (options.includeHedges) {
    const hedgeZ =
      options.depth * 0.5 - 4;

    for (
      const z of [
        -hedgeZ,
        hedgeZ,
      ]
    ) {
      const hedge =
        createHedgeRow(
          options.width * 0.64,
          0.7,
          0.75,
          materials.hedge,
        );

      hedge.position.z = z;

      group.add(hedge);
    }

    for (
      const x of [
        -options.width * 0.38,
        options.width * 0.38,
      ]
    ) {
      const hedge =
        createHedgeRow(
          options.depth * 0.38,
          0.68,
          0.72,
          materials.hedge,
        );

      hedge.rotation.y =
        Math.PI / 2;

      hedge.position.x = x;

      group.add(hedge);
    }
  }

  scatterTrees(
    group,
    {
      ...options,
      treeCount: Math.max(
        5,
        options.treeCount,
      ),
    },
    materials,
    {
      minX:
        -options.width * 0.44,
      maxX:
        options.width * 0.44,
      minZ:
        -options.depth * 0.42,
      maxZ:
        options.depth * 0.42,
    },
  );

  if (options.includeFlowers) {
    const flowerBed =
      createFlowerBed(
        options.width * 0.18,
        options.depth * 0.12,
        materials.flower,
        options.seed + 17,
      );

    flowerBed.position.set(
      0,
      0.02,
      options.depth * 0.08,
    );

    group.add(flowerBed);
  }

  scatterBenches(
    group,
    options,
    materials,
    [
      {
        x:
          -options.width * 0.24,
        z:
          -options.depth * 0.12,
        rotation:
          Math.PI / 2,
      },
      {
        x:
          options.width * 0.24,
        z:
          -options.depth * 0.12,
        rotation:
          -Math.PI / 2,
      },
      {
        x:
          -options.width * 0.24,
        z:
          options.depth * 0.12,
        rotation:
          Math.PI / 2,
      },
      {
        x:
          options.width * 0.24,
        z:
          options.depth * 0.12,
        rotation:
          -Math.PI / 2,
      },
    ],
  );

  scatterLamps(
    group,
    options,
    materials,
    [
      {
        x:
          -options.width * 0.28,
        z:
          -options.depth * 0.32,
      },
      {
        x:
          options.width * 0.28,
        z:
          -options.depth * 0.32,
      },
      {
        x:
          -options.width * 0.28,
        z:
          options.depth * 0.32,
      },
      {
        x:
          options.width * 0.28,
        z:
          options.depth * 0.32,
      },
    ],
  );
}

function createWalkwayLandscapeInternal(
  group: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: MaterialSet,
) {
  group.add(
    createGrass(
      options.width,
      options.depth,
      materials.grass,
    ),
  );

  if (options.includePaths) {
    group.add(
      createPath(
        Math.min(
          2.7,
          options.pathWidth,
        ),
        options.depth * 0.92,
        materials.path,
      ),
    );
  }

  const plantingStripWidth =
    Math.max(
      1.2,
      options.width * 0.18,
    );

  if (options.includeFlowers) {
    for (
      const side of [-1, 1]
    ) {
      const strip =
        createFlowerBed(
          plantingStripWidth,
          options.depth * 0.82,
          materials.flower,
          options.seed +
            100 +
            side,
        );

      strip.position.x =
        side *
        options.width *
        0.32;

      strip.position.y =
        0.02;

      group.add(strip);
    }
  }

  if (options.includeHedges) {
    for (
      const side of [-1, 1]
    ) {
      const hedge =
        createHedgeRow(
          options.depth * 0.82,
          options.hedgeHeight *
            0.72,
          options.hedgeThickness,
          materials.hedge,
          true,
        );

      hedge.rotation.y =
        Math.PI / 2;

      hedge.position.x =
        side *
        options.width *
        0.44;

      group.add(hedge);
    }
  }

  scatterTrees(
    group,
    {
      ...options,
      treeCount: Math.max(
        4,
        Math.floor(
          options.treeCount *
            0.7,
        ),
      ),
    },
    materials,
    {
      minX:
        -options.width * 0.46,
      maxX:
        options.width * 0.46,
      minZ:
        -options.depth * 0.42,
      maxZ:
        options.depth * 0.42,
    },
    200,
  );

  scatterBenches(
    group,
    options,
    materials,
    [
      {
        x:
          -options.width * 0.28,
        z:
          -options.depth * 0.2,
        rotation:
          Math.PI / 2,
      },
      {
        x:
          options.width * 0.28,
        z:
          -options.depth * 0.2,
        rotation:
          -Math.PI / 2,
      },
      {
        x:
          -options.width * 0.28,
        z:
          options.depth * 0.2,
        rotation:
          Math.PI / 2,
      },
      {
        x:
          options.width * 0.28,
        z:
          options.depth * 0.2,
        rotation:
          -Math.PI / 2,
      },
    ],
  );

  scatterLamps(
    group,
    options,
    materials,
    [
      {
        x:
          -options.width * 0.39,
        z:
          -options.depth * 0.3,
      },
      {
        x:
          options.width * 0.39,
        z:
          -options.depth * 0.3,
      },
      {
        x:
          -options.width * 0.39,
        z:
          0,
      },
      {
        x:
          options.width * 0.39,
        z:
          0,
      },
      {
        x:
          -options.width * 0.39,
        z:
          options.depth * 0.3,
      },
      {
        x:
          options.width * 0.39,
        z:
          options.depth * 0.3,
      },
    ],
  );
}

function createGardenLandscapeInternal(
  group: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: MaterialSet,
) {
  group.add(
    createGrass(
      options.width,
      options.depth,
      materials.grass,
    ),
  );

  if (options.includePaths) {
    group.add(
      createRadialPath(
        Math.min(
          options.width,
          options.depth,
        ) * 0.44,
        1.8,
        materials.path,
      ),
    );
  }

  if (options.includeFlowers) {
    const flowerBed =
      createFlowerBed(
        options.width * 0.22,
        options.depth * 0.13,
        materials.flower,
        options.seed + 300,
      );

    flowerBed.position.y =
      0.02;

    group.add(flowerBed);
  }

  if (options.includeHedges) {
    const hedge =
      createHedgeRow(
        options.width * 0.6,
        options.hedgeHeight *
          0.73,
        options.hedgeThickness,
        materials.hedge,
        true,
      );

    hedge.position.z =
      options.depth * 0.28;

    group.add(hedge);
  }

  scatterTrees(
    group,
    {
      ...options,
      treeCount: Math.max(
        options.treeCount,
        10,
      ),
    },
    materials,
    {
      minX:
        -options.width * 0.45,
      maxX:
        options.width * 0.45,
      minZ:
        -options.depth * 0.4,
      maxZ:
        options.depth * 0.4,
    },
    300,
  );

  scatterBenches(
    group,
    options,
    materials,
    [
      {
        x:
          -options.width * 0.27,
        z:
          options.depth * 0.04,
        rotation:
          -Math.PI / 2,
      },
      {
        x:
          options.width * 0.27,
        z:
          options.depth * 0.04,
        rotation:
          Math.PI / 2,
      },
      {
        x:
          -options.width * 0.18,
        z:
          -options.depth * 0.22,
        rotation:
          -Math.PI / 2,
      },
      {
        x:
          options.width * 0.18,
        z:
          -options.depth * 0.22,
        rotation:
          Math.PI / 2,
      },
    ],
  );

  scatterLamps(
    group,
    options,
    materials,
    [
      {
        x:
          -options.width * 0.3,
        z:
          -options.depth * 0.25,
      },
      {
        x:
          options.width * 0.3,
        z:
          -options.depth * 0.25,
      },
      {
        x:
          -options.width * 0.3,
        z:
          options.depth * 0.25,
      },
      {
        x:
          options.width * 0.3,
        z:
          options.depth * 0.25,
      },
    ],
  );
}

function createSportsLandscapeInternal(
  group: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: MaterialSet,
) {
  group.add(
    createGrass(
      options.width,
      options.depth,
      materials.grass,
    ),
  );

  if (options.includePaths) {
    const path =
      createPath(
        1.9,
        options.depth * 0.86,
        materials.path,
      );

    path.position.x =
      options.width * 0.39;

    group.add(path);
  }

  if (options.includeHedges) {
    const hedge =
      createHedgeRow(
        options.width * 0.76,
        0.52,
        0.6,
        materials.hedge,
        false,
      );

    hedge.position.z =
      -options.depth * 0.39;

    group.add(hedge);
  }

  scatterTrees(
    group,
    {
      ...options,
      treeCount: Math.max(
        3,
        Math.floor(
          options.treeCount *
            0.45,
        ),
      ),
    },
    materials,
    {
      minX:
        -options.width * 0.45,
      maxX:
        options.width * 0.45,
      minZ:
        -options.depth * 0.42,
      maxZ:
        options.depth * 0.42,
    },
    400,
  );

  scatterBenches(
    group,
    options,
    materials,
    [
      {
        x:
          -options.width * 0.28,
        z:
          options.depth * 0.32,
        rotation:
          Math.PI / 2,
      },
      {
        x:
          options.width * 0.28,
        z:
          options.depth * 0.32,
        rotation:
          -Math.PI / 2,
      },
    ],
  );
}

function createHostelLandscapeInternal(
  group: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: MaterialSet,
) {
  group.add(
    createGrass(
      options.width,
      options.depth,
      materials.grass,
    ),
  );

  if (options.includePaths) {
    group.add(
      createCrossPath(
        2.2,
        options.depth * 0.86,
        Math.min(
          2.2,
          options.pathWidth,
        ),
        materials.path,
      ),
    );
  }

  if (options.includeHedges) {
    for (
      const x of [
        -options.width * 0.36,
        options.width * 0.36,
      ]
    ) {
      const hedge =
        createHedgeRow(
          options.depth * 0.46,
          0.62,
          0.68,
          materials.hedge,
          true,
        );

      hedge.rotation.y =
        Math.PI / 2;

      hedge.position.x = x;

      group.add(hedge);
    }
  }

  scatterTrees(
    group,
    {
      ...options,
      treeCount: Math.max(
        options.treeCount,
        9,
      ),
    },
    materials,
    {
      minX:
        -options.width * 0.44,
      maxX:
        options.width * 0.44,
      minZ:
        -options.depth * 0.4,
      maxZ:
        options.depth * 0.4,
    },
    500,
  );

  scatterBenches(
    group,
    options,
    materials,
    [
      {
        x: 0,
        z:
          options.depth * 0.18,
        rotation: 0,
      },
      {
        x:
          -options.width * 0.27,
        z:
          -options.depth * 0.2,
        rotation:
          Math.PI / 2,
      },
      {
        x:
          options.width * 0.27,
        z:
          -options.depth * 0.2,
        rotation:
          -Math.PI / 2,
      },
    ],
  );

  scatterLamps(
    group,
    options,
    materials,
    [
      {
        x:
          -options.width * 0.3,
        z:
          -options.depth * 0.3,
      },
      {
        x:
          options.width * 0.3,
        z:
          -options.depth * 0.3,
      },
      {
        x:
          -options.width * 0.3,
        z:
          0,
      },
      {
        x:
          options.width * 0.3,
        z:
          0,
      },
      {
        x:
          -options.width * 0.3,
        z:
          options.depth * 0.3,
      },
      {
        x:
          options.width * 0.3,
        z:
          options.depth * 0.3,
      },
    ],
  );
}

function createGateLandscapeInternal(
  group: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: MaterialSet,
) {
  group.add(
    createGrass(
      options.width,
      options.depth,
      materials.grass,
    ),
  );

  if (options.includePaths) {
    group.add(
      createPath(
        4.2,
        options.depth * 0.9,
        materials.path,
      ),
    );
  }

  if (options.includeHedges) {
    for (
      const side of [-1, 1]
    ) {
      const hedge =
        createHedgeRow(
          options.depth * 0.55,
          0.82,
          0.85,
          materials.hedge,
          false,
        );

      hedge.rotation.y =
        Math.PI / 2;

      hedge.position.x =
        side *
        options.width *
        0.32;

      group.add(hedge);
    }
  }

  const avenueOptions = {
    ...options,
    treeCount: Math.max(
      6,
      Math.floor(
        options.treeCount *
          0.8,
      ),
    ),
  };

  scatterTrees(
    group,
    avenueOptions,
    materials,
    {
      minX:
        -options.width * 0.38,
      maxX:
        options.width * 0.38,
      minZ:
        -options.depth * 0.38,
      maxZ:
        options.depth * 0.38,
    },
    600,
  );

  scatterLamps(
    group,
    options,
    materials,
    [
      {
        x:
          -options.width * 0.24,
        z:
          -options.depth * 0.28,
      },
      {
        x:
          options.width * 0.24,
        z:
          -options.depth * 0.28,
      },
      {
        x:
          -options.width * 0.24,
        z: 0,
      },
      {
        x:
          options.width * 0.24,
        z: 0,
      },
      {
        x:
          -options.width * 0.24,
        z:
          options.depth * 0.28,
      },
      {
        x:
          options.width * 0.24,
        z:
          options.depth * 0.28,
      },
    ],
  );

  scatterBenches(
    group,
    options,
    materials,
    [
      {
        x:
          -options.width * 0.2,
        z:
          options.depth * 0.2,
        rotation:
          Math.PI / 2,
      },
      {
        x:
          options.width * 0.2,
        z:
          options.depth * 0.2,
        rotation:
          -Math.PI / 2,
      },
    ],
  );
}

/* -------------------------------------------------------------------------- */
/* Public factory                                                             */
/* -------------------------------------------------------------------------- */

export function createLandscape(
  options: LandscapeOptions = {},
) {
  const resolved =
    mergeOptions(options);

  const materials =
    createMaterials(resolved);

  const group =
    new THREE.Group();

  group.name =
    `CampusLandscape:${resolved.style}`;

  switch (resolved.style) {
    case "walkway":
      createWalkwayLandscapeInternal(
        group,
        resolved,
        materials,
      );
      break;

    case "garden":
      createGardenLandscapeInternal(
        group,
        resolved,
        materials,
      );
      break;

    case "sports":
      createSportsLandscapeInternal(
        group,
        resolved,
        materials,
      );
      break;

    case "hostels":
      createHostelLandscapeInternal(
        group,
        resolved,
        materials,
      );
      break;

    case "gate":
      createGateLandscapeInternal(
        group,
        resolved,
        materials,
      );
      break;

    case "quadrangle":
    default:
      createQuadrangleLandscapeInternal(
        group,
        resolved,
        materials,
      );
      break;
  }

  group.userData = {
    type: "landscape",
    style: resolved.style,
    theme: options.theme,
    sourceStyle:
      options.style ??
      options.theme ??
      DEFAULTS.style,
    seed: resolved.seed,

    width: resolved.width,
    depth: resolved.depth,

    treeDensity:
      resolved.treeDensity,
    treeCount:
      resolved.treeCount,
    hedgeDensity:
      resolved.hedgeDensity,
    lampDensity:
      resolved.lampDensity,
    benchDensity:
      resolved.benchDensity,
  };

  return group;
}

/* -------------------------------------------------------------------------- */
/* Public compatibility factories                                             */
/* -------------------------------------------------------------------------- */

export function createCampusLandscape(
  options: LandscapeOptions = {},
) {
  return createLandscape(
    options,
  );
}

export function createQuadrangleLandscape(
  options: Omit<
    LandscapeOptions,
    "style"
  > = {},
) {
  return createLandscape({
    ...options,
    style: "quadrangle",
  });
}

export function createWalkwayLandscape(
  options: Omit<
    LandscapeOptions,
    "style"
  > = {},
) {
  return createLandscape({
    ...options,
    style: "walkway",
  });
}

export function createGardenLandscape(
  options: Omit<
    LandscapeOptions,
    "style"
  > = {},
) {
  return createLandscape({
    ...options,
    style: "garden",
  });
}

export function createSportsLandscape(
  options: Omit<
    LandscapeOptions,
    "style"
  > = {},
) {
  return createLandscape({
    ...options,
    style: "sports",
  });
}

export function createHostelLandscape(
  options: Omit<
    LandscapeOptions,
    "style"
  > = {},
) {
  return createLandscape({
    ...options,
    style: "hostels",
  });
}

export function createGateLandscape(
  options: Omit<
    LandscapeOptions,
    "style"
  > = {},
) {
  return createLandscape({
    ...options,
    style: "gate",
  });
}
