import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

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

export type TreeVariant = "round" | "narrow" | "cluster";

export type LandscapeOptions = {
  width?: number;
  depth?: number;

  /*
   * New API
   */
  style?: LandscapeStyle;

  /*
   * Legacy CampusWorld API.
   * Keep this indefinitely so existing callers remain compatible.
   */
  theme?: LandscapeTheme;

  seed?: number;

  /*
   * New explicit count.
   */
  treeCount?: number;

  /*
   * Legacy density control.
   */
  treeDensity?: number;

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

/* -------------------------------------------------------------------------- */
/* Defaults                                                                   */
/* -------------------------------------------------------------------------- */

const DEFAULTS: Required<
  Omit<LandscapeOptions, "style" | "theme" | "name">
> & {
  style: LandscapeStyle;
} = {
  width: 92,
  depth: 120,

  style: "campus",

  seed: 173,

  treeCount: 8,
  treeDensity: 1,

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

/* -------------------------------------------------------------------------- */
/* Utility                                                                    */
/* -------------------------------------------------------------------------- */

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function seededRandom(seed: number) {
  let state = Math.floor(seed) || 1;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
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
    new THREE.BoxGeometry(width, height, depth),
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

function addObject(
  parent: THREE.Group,
  object: THREE.Object3D,
  x: number,
  y: number,
  z: number,
) {
  object.position.set(x, y, z);
  parent.add(object);
  return object;
}

/* -------------------------------------------------------------------------- */
/* Materials                                                                  */
/* -------------------------------------------------------------------------- */

function createMaterials(options: ResolvedLandscapeOptions) {
  return {
    grass: createMaterial(options.grassColor),
    path: createMaterial(options.pathColor),
    kerb: createMaterial(options.kerbColor),
    hedge: createMaterial(options.hedgeColor),
    flower: createMaterial(options.flowerColor, 0.75),
    trunk: createMaterial(options.trunkColor),
    foliage: createMaterial(options.foliageColor),
    metal: createMaterial(
      options.metalColor,
      0.45,
      0.25,
    ),
    wood: createMaterial(options.woodColor),
  };
}

/* -------------------------------------------------------------------------- */
/* Ground                                                                     */
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

  const horizontal = createPath(
    width,
    pathWidth,
    material,
  );

  const vertical = createPath(
    pathWidth,
    depth,
    material,
  );

  group.add(horizontal);
  group.add(vertical);

  return group;
}

function createRadialPath(
  radius: number,
  pathWidth: number,
  material: THREE.Material,
) {
  const group = new THREE.Group();

  const segments = 8;

  for (let i = 0; i < segments; i += 1) {
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
) {
  const group = new THREE.Group();

  const hedge = createBox(
    length,
    height,
    thickness,
    material,
  );

  hedge.position.y = height / 2;
  group.add(hedge);

  /*
   * Subtle segmentation prevents the hedge from looking like one giant
   * rectangular programming mistake.
   */
  const segments = Math.max(
    2,
    Math.floor(length / 3),
  );

  const segmentWidth = length / segments;

  for (let i = 1; i < segments; i += 1) {
    const divider = createBox(
      0.06,
      height * 0.9,
      thickness + 0.02,
      material,
    );

    divider.position.set(
      -length / 2 + i * segmentWidth,
      height / 2,
      0,
    );

    divider.castShadow = false;
    group.add(divider);
  }

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
  const random = seededRandom(seed);

  const count = Math.max(
    8,
    Math.floor((width * depth) / 3.5),
  );

  for (let i = 0; i < count; i += 1) {
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

  return group;
}

/* -------------------------------------------------------------------------- */
/* Trees                                                                      */
/* -------------------------------------------------------------------------- */

function createTree(
  variant: TreeVariant,
  scale: number,
  materials: ReturnType<typeof createMaterials>,
  seed: number,
) {
  const group = new THREE.Group();
  const random = seededRandom(seed);

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

    for (let i = 0; i < clusters; i += 1) {
      const radius =
        (0.85 + random() * 0.35) * scale;

      const foliage = createCylinder(
        radius * 0.72,
        radius,
        radius * 1.15,
        materials.foliage,
        8,
      );

      foliage.position.set(
        (random() - 0.5) * 1.2 * scale,
        (2.1 + random() * 1.1) * scale,
        (random() - 0.5) * 1.2 * scale,
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

    const foliage = createCylinder(
      radius * scale * 0.78,
      radius * scale,
      radius * scale * 1.35,
      materials.foliage,
      9,
    );

    foliage.position.y =
      (trunkHeight + 0.65) * scale;

    if (variant === "narrow") {
      foliage.scale.x = 0.72;
      foliage.scale.z = 0.72;
    }

    group.add(foliage);

    /*
     * Small upper crown for less artificial silhouettes.
     */
    const upper = createCylinder(
      radius * scale * 0.52,
      radius * scale * 0.7,
      radius * scale * 0.8,
      materials.foliage,
      9,
    );

    upper.position.y =
      (trunkHeight + 1.35) * scale;

    group.add(upper);
  }

  group.userData.type = "campus-tree";
  group.userData.variant = variant;

  return group;
}

function scatterTrees(
  parent: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: ReturnType<typeof createMaterials>,
  bounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  },
  seedOffset = 0,
) {
  const random = seededRandom(
    options.seed + seedOffset,
  );

  const count = Math.max(
    0,
    Math.round(options.treeCount),
  );

  for (let i = 0; i < count; i += 1) {
    const variantRoll = random();

    const variant: TreeVariant =
      variantRoll < 0.58
        ? "round"
        : variantRoll < 0.82
          ? "narrow"
          : "cluster";

    const scale =
      options.treeScale *
      (0.88 + random() * 0.28);

    const tree = createTree(
      variant,
      scale,
      materials,
      options.seed + seedOffset + i * 31,
    );

    const x =
      bounds.minX +
      random() *
        (bounds.maxX - bounds.minX);

    const z =
      bounds.minZ +
      random() *
        (bounds.maxZ - bounds.minZ);

    tree.position.set(x, 0, z);

    parent.add(tree);
  }
}

/* -------------------------------------------------------------------------- */
/* Benches                                                                    */
/* -------------------------------------------------------------------------- */

function createBench(
  materials: ReturnType<typeof createMaterials>,
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

  for (const x of [-0.82, 0.82]) {
    for (const z of [-0.15, 0.15]) {
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

  group.userData.type = "campus-bench";

  return group;
}

/* -------------------------------------------------------------------------- */
/* Lamps                                                                      */
/* -------------------------------------------------------------------------- */

function createLamp(
  materials: ReturnType<typeof createMaterials>,
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

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.1,
      8,
      8,
    ),
    new THREE.MeshStandardMaterial({
      color: 0xffe9ae,
      emissive: 0xffd77b,
      emissiveIntensity: 1.3,
      roughness: 0.45,
    }),
  );

  glow.position.y = 2.88;
  group.add(glow);

  group.userData.type = "campus-lamp";

  return group;
}

/* -------------------------------------------------------------------------- */
/* Option resolution                                                          */
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
  /*
   * Important:
   *
   * CampusWorld historically passed `theme`.
   * Newer code can pass `style`.
   *
   * `style` wins when both are present.
   */
  const sourceStyle =
    options.style ??
    options.theme ??
    DEFAULTS.style;

  const treeDensity = Math.max(
    0,
    options.treeDensity ??
      DEFAULTS.treeDensity,
  );

  const requestedTreeCount =
    options.treeCount ??
    DEFAULTS.treeCount;

  const resolvedTreeCount = Math.max(
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

    style: sourceStyle,

    seed:
      options.seed ??
      DEFAULTS.seed,

    treeDensity,

    treeCount: resolvedTreeCount,

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
/* Quadrangle                                                                 */
/* -------------------------------------------------------------------------- */

function createQuadrangleLandscapeInternal(
  options: ResolvedLandscapeOptions,
) {
  const group = new THREE.Group();
  const materials = createMaterials(options);

  const width = options.width;
  const depth = options.depth;

  group.add(
    createGrass(
      width,
      depth,
      materials.grass,
    ),
  );

  if (options.includePaths) {
    group.add(
      createCrossPath(
        width * 0.82,
        depth * 0.82,
        options.pathWidth,
        materials.path,
      ),
    );
  }

  if (options.includeHedges) {
    const hedgeOffset =
      Math.min(width, depth) * 0.34;

    const top = createHedgeRow(
      width * 0.55,
      options.hedgeHeight,
      options.hedgeThickness,
      materials.hedge,
    );

    top.position.set(
      0,
      0,
      -hedgeOffset,
    );

    group.add(top);

    const bottom = top.clone();

    bottom.position.z = hedgeOffset;

    group.add(bottom);
  }

  if (options.includeFlowers) {
    const bed = createFlowerBed(
      width * 0.28,
      depth * 0.08,
      materials.flower,
      options.seed + 10,
    );

    bed.position.set(
      -width * 0.25,
      0,
      -depth * 0.28,
    );

    group.add(bed);
  }

  scatterTrees(
    group,
    options,
    materials,
    {
      minX: -width * 0.44,
      maxX: width * 0.44,
      minZ: -depth * 0.44,
      maxZ: depth * 0.44,
    },
    100,
  );

  if (options.includeBenches) {
    const bench = createBench(materials);

    bench.position.set(
      width * 0.18,
      0,
      depth * 0.22,
    );

    bench.rotation.y = Math.PI;

    group.add(bench);
  }

  if (options.includeLamps) {
    for (const [x, z] of [
      [-width * 0.3, -depth * 0.28],
      [width * 0.3, depth * 0.28],
    ]) {
      const lamp = createLamp(materials);

      lamp.position.set(
        x,
        0,
        z,
      );

      group.add(lamp);
    }
  }

  return group;
}

/* -------------------------------------------------------------------------- */
/* Walkway                                                                    */
/* -------------------------------------------------------------------------- */

function createWalkwayLandscapeInternal(
  options: ResolvedLandscapeOptions,
) {
  const group = new THREE.Group();
  const materials = createMaterials(options);

  const width = options.width;
  const depth = options.depth;

  group.add(
    createGrass(
      width,
      depth,
      materials.grass,
    ),
  );

  if (options.includePaths) {
    group.add(
      createPath(
        options.pathWidth * 1.25,
        depth * 0.82,
        materials.path,
      ),
    );
  }

  if (options.includeHedges) {
    for (const side of [-1, 1]) {
      const hedge = createHedgeRow(
        depth * 0.62,
        options.hedgeHeight,
        options.hedgeThickness,
        materials.hedge,
      );

      hedge.rotation.y = Math.PI / 2;

      hedge.position.set(
        side * width * 0.32,
        0,
        0,
      );

      group.add(hedge);
    }
  }

  scatterTrees(
    group,
    options,
    materials,
    {
      minX: -width * 0.46,
      maxX: width * 0.46,
      minZ: -depth * 0.44,
      maxZ: depth * 0.44,
    },
    200,
  );

  if (options.includeLamps) {
    const lampCount = Math.max(
      2,
      Math.floor(depth / 25),
    );

    for (
      let i = 0;
      i < lampCount;
      i += 1
    ) {
      const lamp = createLamp(materials);

      lamp.position.set(
        width * 0.19,
        0,
        -depth * 0.36 +
          i *
            (depth * 0.72) /
              Math.max(1, lampCount - 1),
      );

      group.add(lamp);
    }
  }

  return group;
}

/* -------------------------------------------------------------------------- */
/* Garden                                                                     */
/* -------------------------------------------------------------------------- */

function createGardenLandscapeInternal(
  options: ResolvedLandscapeOptions,
) {
  const group = new THREE.Group();
  const materials = createMaterials(options);

  const width = options.width;
  const depth = options.depth;

  group.add(
    createGrass(
      width,
      depth,
      materials.grass,
    ),
  );

  if (options.includePaths) {
    group.add(
      createRadialPath(
        Math.min(width, depth) * 0.34,
        options.pathWidth,
        materials.path,
      ),
    );
  }

  if (options.includeFlowers) {
    const beds = [
      [-0.28, -0.24],
      [0.28, -0.24],
      [-0.28, 0.24],
      [0.28, 0.24],
    ];

    beds.forEach(([x, z], index) => {
      const bed = createFlowerBed(
        width * 0.22,
        depth * 0.13,
        materials.flower,
        options.seed +
          300 +
          index * 17,
      );

      bed.position.set(
        x * width,
        0,
        z * depth,
      );

      group.add(bed);
    });
  }

  if (options.includeHedges) {
    const radius =
      Math.min(width, depth) * 0.38;

    for (let i = 0; i < 4; i += 1) {
      const hedge = createHedgeRow(
        radius * 0.7,
        options.hedgeHeight,
        options.hedgeThickness,
        materials.hedge,
      );

      hedge.rotation.y =
        (i / 4) * Math.PI;

      hedge.position.y = 0;

      group.add(hedge);
    }
  }

  scatterTrees(
    group,
    {
      ...options,
      treeCount: Math.round(
        options.treeCount * 1.35,
      ),
    },
    materials,
    {
      minX: -width * 0.45,
      maxX: width * 0.45,
      minZ: -depth * 0.45,
      maxZ: depth * 0.45,
    },
    300,
  );

  if (options.includeBenches) {
    for (const [x, z] of [
      [-0.32, 0],
      [0.32, 0],
    ]) {
      const bench = createBench(materials);

      bench.position.set(
        x * width,
        0,
        z * depth,
      );

      bench.rotation.y =
        x < 0
          ? Math.PI / 2
          : -Math.PI / 2;

      group.add(bench);
    }
  }

  return group;
}

/* -------------------------------------------------------------------------- */
/* Sports                                                                     */
/* -------------------------------------------------------------------------- */

function createSportsLandscapeInternal(
  options: ResolvedLandscapeOptions,
) {
  const group = new THREE.Group();
  const materials = createMaterials(options);

  const width = options.width;
  const depth = options.depth;

  group.add(
    createGrass(
      width,
      depth,
      materials.grass,
    ),
  );

  if (options.includePaths) {
    const path = createPath(
      options.pathWidth,
      depth * 0.86,
      materials.path,
    );

    path.position.x =
      width * 0.34;

    group.add(path);
  }

  /*
   * Perimeter hedges make this read as a campus sports zone
   * rather than an inexplicable green rectangle.
   */
  if (options.includeHedges) {
    const hedgeWidth =
      options.hedgeThickness;

    const top = createHedgeRow(
      width * 0.72,
      options.hedgeHeight,
      hedgeWidth,
      materials.hedge,
    );

    top.position.z =
      -depth * 0.38;

    group.add(top);

    const bottom = top.clone();

    bottom.position.z =
      depth * 0.38;

    group.add(bottom);
  }

  scatterTrees(
    group,
    options,
    materials,
    {
      minX: -width * 0.45,
      maxX: width * 0.45,
      minZ: -depth * 0.45,
      maxZ: depth * 0.45,
    },
    400,
  );

  if (options.includeLamps) {
    for (const x of [
      -width * 0.4,
      width * 0.4,
    ]) {
      const lamp = createLamp(materials);

      lamp.position.set(
        x,
        0,
        0,
      );

      group.add(lamp);
    }
  }

  return group;
}

/* -------------------------------------------------------------------------- */
/* Hostels                                                                    */
/* -------------------------------------------------------------------------- */

function createHostelLandscapeInternal(
  options: ResolvedLandscapeOptions,
) {
  const group = new THREE.Group();
  const materials = createMaterials(options);

  const width = options.width;
  const depth = options.depth;

  group.add(
    createGrass(
      width,
      depth,
      materials.grass,
    ),
  );

  if (options.includePaths) {
    group.add(
      createCrossPath(
        width * 0.86,
        depth * 0.82,
        options.pathWidth,
        materials.path,
      ),
    );
  }

  if (options.includeHedges) {
    for (const side of [-1, 1]) {
      const hedge = createHedgeRow(
        width * 0.5,
        options.hedgeHeight,
        options.hedgeThickness,
        materials.hedge,
      );

      hedge.position.set(
        side * width * 0.24,
        0,
        -depth * 0.25,
      );

      group.add(hedge);
    }
  }

  scatterTrees(
    group,
    {
      ...options,
      treeCount: Math.round(
        options.treeCount * 1.15,
      ),
    },
    materials,
    {
      minX: -width * 0.45,
      maxX: width * 0.45,
      minZ: -depth * 0.44,
      maxZ: depth * 0.44,
    },
    500,
  );

  if (options.includeBenches) {
    const bench = createBench(materials);

    bench.position.set(
      0,
      0,
      depth * 0.28,
    );

    group.add(bench);
  }

  if (options.includeLamps) {
    for (const x of [
      -width * 0.31,
      width * 0.31,
    ]) {
      const lamp = createLamp(materials);

      lamp.position.set(
        x,
        0,
        depth * 0.15,
      );

      group.add(lamp);
    }
  }

  return group;
}

/* -------------------------------------------------------------------------- */
/* Gate                                                                      */
/* -------------------------------------------------------------------------- */

function createGateLandscapeInternal(
  options: ResolvedLandscapeOptions,
) {
  const group = new THREE.Group();
  const materials = createMaterials(options);

  const width = options.width;
  const depth = options.depth;

  group.add(
    createGrass(
      width,
      depth,
      materials.grass,
    ),
  );

  if (options.includePaths) {
    group.add(
      createPath(
        options.pathWidth * 1.5,
        depth * 0.9,
        materials.path,
      ),
    );
  }

  if (options.includeHedges) {
    for (const side of [-1, 1]) {
      const hedge = createHedgeRow(
        depth * 0.55,
        options.hedgeHeight,
        options.hedgeThickness,
        materials.hedge,
      );

      hedge.rotation.y = Math.PI / 2;

      hedge.position.x =
        side * width * 0.35;

      group.add(hedge);
    }
  }

  /*
   * More open frontage around the gate.
   */
  scatterTrees(
    group,
    {
      ...options,
      treeCount: Math.round(
        options.treeCount * 0.8,
      ),
    },
    materials,
    {
      minX: -width * 0.44,
      maxX: width * 0.44,
      minZ: -depth * 0.42,
      maxZ: depth * 0.42,
    },
    600,
  );

  if (options.includeLamps) {
    for (const x of [
      -width * 0.28,
      width * 0.28,
    ]) {
      const lamp = createLamp(materials);

      lamp.position.set(
        x,
        0,
        -depth * 0.22,
      );

      group.add(lamp);
    }
  }

  return group;
}

/* -------------------------------------------------------------------------- */
/* Main factory                                                               */
/* -------------------------------------------------------------------------- */

export function createLandscape(
  input: LandscapeOptions = {},
) {
  const options = mergeOptions(input);

  const normalizedStyle =
    normalizeLandscapeStyle(
      options.style,
    );

  let group: THREE.Group;

  switch (normalizedStyle) {
    case "walkway":
      group =
        createWalkwayLandscapeInternal(
          options,
        );
      break;

    case "garden":
      group =
        createGardenLandscapeInternal(
          options,
        );
      break;

    case "sports":
      group =
        createSportsLandscapeInternal(
          options,
        );
      break;

    case "hostels":
      group =
        createHostelLandscapeInternal(
          options,
        );
      break;

    case "gate":
      group =
        createGateLandscapeInternal(
          options,
        );
      break;

    case "quadrangle":
    default:
      group =
        createQuadrangleLandscapeInternal(
          options,
        );
      break;
  }

  /*
   * Preserve useful metadata for CampusWorld and debugging.
   */
  group.userData.type =
    "campus-landscape";

  group.userData.style =
    normalizedStyle;

  group.userData.sourceStyle =
    options.style;

  group.userData.theme =
    options.style;

  group.userData.seed =
    options.seed;

  group.userData.treeDensity =
    options.treeDensity;

  group.userData.treeCount =
    options.treeCount;

  group.userData.width =
    options.width;

  group.userData.depth =
    options.depth;

  if (options.name) {
    group.name = options.name;
  }

  return group;
}

/* -------------------------------------------------------------------------- */
/* Public compatibility factories                                             */
/* -------------------------------------------------------------------------- */

export function createCampusLandscape(
  options: LandscapeOptions = {},
) {
  return createLandscape({
    ...options,
    style:
      options.style ??
      "campus",
  });
}

export function createQuadrangleLandscape(
  options: LandscapeOptions = {},
) {
  return createLandscape({
    ...options,
    style:
      options.style ??
      "quadrangle",
  });
}

export function createWalkwayLandscape(
  options: LandscapeOptions = {},
) {
  return createLandscape({
    ...options,
    style:
      options.style ??
      "walkway",
  });
}

export function createGardenLandscape(
  options: LandscapeOptions = {},
) {
  return createLandscape({
    ...options,
    style:
      options.style ??
      "garden",
  });
}

export function createSportsLandscape(
  options: LandscapeOptions = {},
) {
  return createLandscape({
    ...options,
    style:
      options.style ??
      "sports",
  });
}

export function createHostelLandscape(
  options: LandscapeOptions = {},
) {
  return createLandscape({
    ...options,
    style:
      options.style ??
      "hostels",
  });
}

export function createGateLandscape(
  options: LandscapeOptions = {},
) {
  return createLandscape({
    ...options,
    style:
      options.style ??
      "gate",
  });
}
