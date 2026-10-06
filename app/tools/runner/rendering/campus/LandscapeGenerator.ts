import * as THREE from "three";

export type LandscapeStyle =
  | "quadrangle"
  | "walkway"
  | "garden"
  | "sports"
  | "hostels"
  | "gate";

export type LandscapeOptions = {
  style?: LandscapeStyle;
  width?: number;
  depth?: number;
  grassColor?: number;
  pathColor?: number;
  kerbColor?: number;
  hedgeColor?: number;
  flowerColor?: number;
  treeCount?: number;
  includeBenches?: boolean;
  includeLamps?: boolean;
  includeHedges?: boolean;
  includePaths?: boolean;
  seed?: number;
};

type MaterialSet = {
  grass: THREE.MeshStandardMaterial;
  grassLight: THREE.MeshStandardMaterial;
  path: THREE.MeshStandardMaterial;
  pathEdge: THREE.MeshStandardMaterial;
  hedge: THREE.MeshStandardMaterial;
  hedgeDark: THREE.MeshStandardMaterial;
  flower: THREE.MeshStandardMaterial;
  trunk: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  foliageDark: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
};

const DEFAULTS: Required<LandscapeOptions> = {
  style: "quadrangle",
  width: 28,
  depth: 70,
  grassColor: 0x6d9654,
  pathColor: 0xb98755,
  kerbColor: 0xd9c59c,
  hedgeColor: 0x42683d,
  flowerColor: 0xc96b4c,
  treeCount: 8,
  includeBenches: true,
  includeLamps: false,
  includeHedges: true,
  includePaths: true,
  seed: 17,
};

function mergeOptions(options: LandscapeOptions = {}): Required<LandscapeOptions> {
  return {
    ...DEFAULTS,
    ...options,
  };
}

function box(
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

function cylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  material: THREE.Material,
  radialSegments = 8,
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

function sphere(
  radius: number,
  material: THREE.Material,
  widthSegments = 10,
  heightSegments = 7,
) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(
      radius,
      widthSegments,
      heightSegments,
    ),
    material,
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function createMaterials(options: Required<LandscapeOptions>): MaterialSet {
  return {
    grass: new THREE.MeshStandardMaterial({
      color: options.grassColor,
      roughness: 0.96,
    }),

    grassLight: new THREE.MeshStandardMaterial({
      color: new THREE.Color(options.grassColor).offsetHSL(
        0,
        -0.03,
        0.06,
      ),
      roughness: 0.98,
    }),

    path: new THREE.MeshStandardMaterial({
      color: options.pathColor,
      roughness: 0.88,
    }),

    pathEdge: new THREE.MeshStandardMaterial({
      color: options.kerbColor,
      roughness: 0.9,
    }),

    hedge: new THREE.MeshStandardMaterial({
      color: options.hedgeColor,
      roughness: 0.95,
    }),

    hedgeDark: new THREE.MeshStandardMaterial({
      color: new THREE.Color(options.hedgeColor).offsetHSL(
        0,
        0,
        -0.08,
      ),
      roughness: 0.98,
    }),

    flower: new THREE.MeshStandardMaterial({
      color: options.flowerColor,
      roughness: 0.8,
    }),

    trunk: new THREE.MeshStandardMaterial({
      color: 0x65452f,
      roughness: 1,
    }),

    foliage: new THREE.MeshStandardMaterial({
      color: 0x547c43,
      roughness: 0.96,
    }),

    foliageDark: new THREE.MeshStandardMaterial({
      color: 0x3e6338,
      roughness: 0.98,
    }),

    metal: new THREE.MeshStandardMaterial({
      color: 0x45443e,
      metalness: 0.5,
      roughness: 0.6,
    }),

    wood: new THREE.MeshStandardMaterial({
      color: 0x6f4c35,
      roughness: 0.86,
    }),
  };
}

function createGrass(
  width: number,
  depth: number,
  materials: MaterialSet,
) {
  const group = new THREE.Group();
  group.name = "LandscapeGrass";

  const base = box(width, 0.16, depth, materials.grass);
  base.position.y = -0.08;
  group.add(base);

  /*
   * Slightly smaller inset areas break up the perfectly uniform
   * computer-generated lawn without turning it into visual noise.
   */
  const inset = box(
    Math.max(2, width - 1.2),
    0.025,
    Math.max(2, depth - 1.2),
    materials.grassLight,
  );

  inset.position.y = 0.01;
  group.add(inset);

  return group;
}

function createPath(
  width: number,
  depth: number,
  materials: MaterialSet,
) {
  const group = new THREE.Group();
  group.name = "LandscapePath";

  const surface = box(
    Math.max(1.8, width),
    0.07,
    depth,
    materials.path,
  );

  surface.position.y = 0.035;
  group.add(surface);

  const leftKerb = box(
    0.14,
    0.11,
    depth,
    materials.pathEdge,
  );

  leftKerb.position.set(
    -width / 2 - 0.07,
    0.055,
    0,
  );

  group.add(leftKerb);

  const rightKerb = leftKerb.clone();
  rightKerb.position.x = width / 2 + 0.07;
  group.add(rightKerb);

  return group;
}

function createCrossPath(
  width: number,
  depth: number,
  materials: MaterialSet,
) {
  const group = new THREE.Group();
  group.name = "LandscapeCrossPath";

  const horizontal = createPath(
    depth,
    width,
    materials,
  );

  horizontal.rotation.y = Math.PI / 2;
  group.add(horizontal);

  const vertical = createPath(
    width,
    depth,
    materials,
  );

  group.add(vertical);

  return group;
}

function createRadialPath(
  radius: number,
  width: number,
  count: number,
  materials: MaterialSet,
) {
  const group = new THREE.Group();
  group.name = "LandscapeRadialPaths";

  for (let i = 0; i < count; i += 1) {
    const path = box(
      width,
      0.07,
      radius,
      materials.path,
    );

    path.position.y = 0.035;
    path.position.z = -radius / 2;
    path.rotation.y =
      (Math.PI * 2 * i) / count;

    group.add(path);
  }

  return group;
}

function createHedge(
  width: number,
  height: number,
  depth: number,
  materials: MaterialSet,
) {
  const group = new THREE.Group();
  group.name = "LandscapeHedge";

  const body = box(
    width,
    height,
    depth,
    materials.hedge,
  );

  body.position.y = height / 2;
  group.add(body);

  const cap = box(
    Math.max(0.2, width * 0.92),
    Math.max(0.08, height * 0.18),
    Math.max(0.2, depth * 0.92),
    materials.hedgeDark,
  );

  cap.position.y = height + 0.015;
  group.add(cap);

  return group;
}

function createHedgeRow(
  length: number,
  height: number,
  depth: number,
  materials: MaterialSet,
  rounded = false,
) {
  const group = new THREE.Group();
  group.name = "LandscapeHedgeRow";

  if (!rounded) {
    group.add(
      createHedge(
        length,
        height,
        depth,
        materials,
      ),
    );

    return group;
  }

  const count = Math.max(
    3,
    Math.floor(length / 1.25),
  );

  for (let i = 0; i < count; i += 1) {
    const t =
      count === 1 ? 0.5 : i / (count - 1);

    const x =
      THREE.MathUtils.lerp(
        -length / 2,
        length / 2,
        t,
      );

    const scale =
      0.72 +
      Math.sin(t * Math.PI) * 0.28;

    const hedge = createHedge(
      1.35,
      height * scale,
      depth,
      materials,
    );

    hedge.position.x = x;
    group.add(hedge);
  }

  return group;
}

function createFlowerBed(
  width: number,
  depth: number,
  materials: MaterialSet,
) {
  const group = new THREE.Group();
  group.name = "LandscapeFlowerBed";

  const soil = box(
    width,
    0.09,
    depth,
    new THREE.MeshStandardMaterial({
      color: 0x5e4631,
      roughness: 1,
    }),
  );

  soil.position.y = 0.045;
  group.add(soil);

  const flowerCount = Math.max(
    8,
    Math.floor((width * depth) / 1.8),
  );

  for (let i = 0; i < flowerCount; i += 1) {
    const x =
      (Math.random() - 0.5) *
      Math.max(0.4, width - 0.35);

    const z =
      (Math.random() - 0.5) *
      Math.max(0.4, depth - 0.35);

    const flower = sphere(
      0.055 + Math.random() * 0.035,
      materials.flower,
      6,
      5,
    );

    flower.position.set(
      x,
      0.13 + Math.random() * 0.06,
      z,
    );

    group.add(flower);
  }

  return group;
}

function createTree(
  height: number,
  radius: number,
  materials: MaterialSet,
  variant: "round" | "narrow" | "cluster" = "round",
) {
  const group = new THREE.Group();
  group.name = "LandscapeTree";

  const trunkHeight =
    variant === "narrow"
      ? height * 0.58
      : height * 0.48;

  const trunk = cylinder(
    radius * 0.17,
    radius * 0.24,
    trunkHeight,
    materials.trunk,
    7,
  );

  trunk.position.y = trunkHeight / 2;
  group.add(trunk);

  if (variant === "narrow") {
    const crown = sphere(
      radius * 0.82,
      materials.foliage,
      10,
      8,
    );

    crown.scale.y = 1.35;
    crown.position.y =
      trunkHeight + radius * 0.7;

    group.add(crown);
  } else if (variant === "cluster") {
    const offsets = [
      [-0.42, 0.1, 0],
      [0.38, 0.14, 0.04],
      [0, 0.4, 0],
      [0, 0.1, -0.42],
      [0.08, 0.18, 0.4],
    ];

    offsets.forEach(([x, y, z], index) => {
      const crown = sphere(
        radius *
          (0.56 +
            (index % 2) * 0.08),
        index % 2 === 0
          ? materials.foliage
          : materials.foliageDark,
        9,
        7,
      );

      crown.position.set(
        x * radius,
        trunkHeight + radius * y + radius * 0.55,
        z * radius,
      );

      group.add(crown);
    });
  } else {
    const crown = sphere(
      radius,
      materials.foliage,
      11,
      8,
    );

    crown.position.y =
      trunkHeight + radius * 0.75;

    group.add(crown);

    const secondary = sphere(
      radius * 0.68,
      materials.foliageDark,
      9,
      7,
    );

    secondary.position.set(
      radius * 0.48,
      trunkHeight + radius * 0.48,
      radius * 0.1,
    );

    group.add(secondary);
  }

  return group;
}

function createBench(materials: MaterialSet) {
  const group = new THREE.Group();
  group.name = "LandscapeBench";

  const seat = box(
    1.65,
    0.12,
    0.42,
    materials.wood,
  );

  seat.position.y = 0.72;
  group.add(seat);

  const back = box(
    1.65,
    0.48,
    0.1,
    materials.wood,
  );

  back.position.set(
    0,
    1.03,
    0.2,
  );

  group.add(back);

  for (const x of [-0.58, 0.58]) {
    const leg = box(
      0.09,
      0.72,
      0.09,
      materials.metal,
    );

    leg.position.set(
      x,
      0.36,
      0,
    );

    group.add(leg);
  }

  return group;
}

function createLamp(materials: MaterialSet) {
  const group = new THREE.Group();
  group.name = "LandscapeLamp";

  const pole = cylinder(
    0.035,
    0.055,
    2.8,
    materials.metal,
    8,
  );

  pole.position.y = 1.4;
  group.add(pole);

  const head = sphere(
    0.13,
    new THREE.MeshStandardMaterial({
      color: 0xffdf9b,
      emissive: 0x5f4524,
      emissiveIntensity: 0.8,
      roughness: 0.45,
    }),
    8,
    6,
  );

  head.position.y = 2.85;
  group.add(head);

  return group;
}

function seededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;

    let t = value;
    t =
      Math.imul(
        t ^ (t >>> 15),
        t | 1,
      );

    t ^=
      t +
      Math.imul(
        t ^ (t >>> 7),
        t | 61,
      );

    return (
      ((t ^ (t >>> 14)) >>> 0) /
      4294967296
    );
  };
}

function scatterTrees(
  group: THREE.Group,
  options: Required<LandscapeOptions>,
  materials: MaterialSet,
) {
  const random = seededRandom(options.seed);

  const count =
    options.style === "sports"
      ? Math.max(3, Math.floor(options.treeCount * 0.55))
      : options.treeCount;

  for (let i = 0; i < count; i += 1) {
    const side =
      random() < 0.5 ? -1 : 1;

    const x =
      side *
      (options.width * 0.35 +
        random() * options.width * 0.34);

    const z =
      (random() - 0.5) *
      options.depth *
      0.86;

    const variantRoll = random();

    const variant =
      variantRoll < 0.2
        ? "narrow"
        : variantRoll < 0.42
          ? "cluster"
          : "round";

    const height =
      variant === "narrow"
        ? 5.8 + random() * 1.7
        : 4.2 + random() * 2.4;

    const radius =
      variant === "narrow"
        ? 0.85 + random() * 0.25
        : 1.15 + random() * 0.55;

    const tree = createTree(
      height,
      radius,
      materials,
      variant,
    );

    tree.position.set(
      x,
      0,
      z,
    );

    tree.rotation.y =
      random() * Math.PI * 2;

    group.add(tree);
  }
}

function createQuadrangleLandscape(
  group: THREE.Group,
  options: Required<LandscapeOptions>,
  materials: MaterialSet,
) {
  group.add(
    createGrass(
      options.width,
      options.depth,
      materials,
    ),
  );

  if (options.includePaths) {
    group.add(
      createCrossPath(
        2.5,
        options.depth * 0.88,
        materials,
      ),
    );
  }

  if (options.includeHedges) {
    const hedgeY =
      options.depth * 0.5 - 4;

    for (const z of [-hedgeY, hedgeY]) {
      const hedge = createHedgeRow(
        options.width * 0.64,
        0.7,
        0.75,
        materials,
        false,
      );

      hedge.position.z = z;
      group.add(hedge);
    }

    for (const x of [
      -options.width * 0.38,
      options.width * 0.38,
    ]) {
      const hedge = createHedgeRow(
        options.depth * 0.38,
        0.68,
        0.72,
        materials,
        false,
      );

      hedge.rotation.y = Math.PI / 2;
      hedge.position.x = x;
      group.add(hedge);
    }
  }

  scatterTrees(
    group,
    options,
    materials,
  );
}

function createWalkwayLandscape(
  group: THREE.Group,
  options: Required<LandscapeOptions>,
  materials: MaterialSet,
) {
  group.add(
    createGrass(
      options.width,
      options.depth,
      materials,
    ),
  );

  if (options.includePaths) {
    group.add(
      createPath(
        2.7,
        options.depth * 0.92,
        materials,
      ),
    );
  }

  const plantingStripWidth =
    Math.max(1.2, options.width * 0.18);

  for (const side of [-1, 1]) {
    const strip = createFlowerBed(
      plantingStripWidth,
      options.depth * 0.82,
      materials,
    );

    strip.position.x =
      side *
      (options.width * 0.32);

    group.add(strip);
  }

  const treeOptions = {
    ...options,
    treeCount: Math.max(
      4,
      Math.floor(options.treeCount * 0.7),
    ),
  };

  scatterTrees(
    group,
    treeOptions,
    materials,
  );
}

function createGardenLandscape(
  group: THREE.Group,
  options: Required<LandscapeOptions>,
  materials: MaterialSet,
) {
  group.add(
    createGrass(
      options.width,
      options.depth,
      materials,
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
        4,
        materials,
      ),
    );
  }

  const flowerBed = createFlowerBed(
    options.width * 0.22,
    options.depth * 0.13,
    materials,
  );

  flowerBed.position.y = 0.02;
  group.add(flowerBed);

  if (options.includeHedges) {
    const hedge = createHedgeRow(
      options.width * 0.6,
      0.62,
      0.7,
      materials,
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
  );

  if (options.includeBenches) {
    for (const x of [
      -options.width * 0.27,
      options.width * 0.27,
    ]) {
      const bench = createBench(
        materials,
      );

      bench.position.set(
        x,
        0,
        options.depth * 0.04,
      );

      bench.rotation.y =
        x < 0
          ? -Math.PI / 2
          : Math.PI / 2;

      group.add(bench);
    }
  }
}

function createSportsLandscape(
  group: THREE.Group,
  options: Required<LandscapeOptions>,
  materials: MaterialSet,
) {
  group.add(
    createGrass(
      options.width,
      options.depth,
      materials,
    ),
  );

  if (options.includePaths) {
    const path = createPath(
      1.9,
      options.depth * 0.86,
      materials,
    );

    path.position.x =
      options.width * 0.39;

    group.add(path);
  }

  if (options.includeHedges) {
    const hedge = createHedgeRow(
      options.width * 0.76,
      0.52,
      0.6,
      materials,
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
        Math.floor(options.treeCount * 0.45),
      ),
    },
    materials,
  );
}

function createHostelLandscape(
  group: THREE.Group,
  options: Required<LandscapeOptions>,
  materials: MaterialSet,
) {
  group.add(
    createGrass(
      options.width,
      options.depth,
      materials,
    ),
  );

  if (options.includePaths) {
    group.add(
      createCrossPath(
        2.2,
        options.depth * 0.86,
        materials,
      ),
    );
  }

  if (options.includeHedges) {
    for (const x of [
      -options.width * 0.36,
      options.width * 0.36,
    ]) {
      const hedge = createHedgeRow(
        options.depth * 0.46,
        0.62,
        0.68,
        materials,
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
  );

  if (options.includeBenches) {
    const bench = createBench(
      materials,
    );

    bench.position.set(
      0,
      0,
      options.depth * 0.18,
    );

    group.add(bench);
  }
}

function createGateLandscape(
  group: THREE.Group,
  options: Required<LandscapeOptions>,
  materials: MaterialSet,
) {
  group.add(
    createGrass(
      options.width,
      options.depth,
      materials,
    ),
  );

  if (options.includePaths) {
    const centralPath = createPath(
      4.2,
      options.depth * 0.9,
      materials,
    );

    group.add(centralPath);
  }

  if (options.includeHedges) {
    for (const side of [-1, 1]) {
      const hedge = createHedgeRow(
        options.depth * 0.55,
        0.82,
        0.85,
        materials,
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
      Math.floor(options.treeCount * 0.8),
    ),
  };

  scatterTrees(
    group,
    avenueOptions,
    materials,
  );

  if (options.includeLamps) {
    for (const z of [
      -options.depth * 0.28,
      0,
      options.depth * 0.28,
    ]) {
      for (const side of [-1, 1]) {
        const lamp = createLamp(
          materials,
        );

        lamp.position.set(
          side *
            options.width *
            0.24,
          0,
          z,
        );

        group.add(lamp);
      }
    }
  }
}

export function createLandscape(
  options: LandscapeOptions = {},
) {
  const resolved =
    mergeOptions(options);

  const materials =
    createMaterials(resolved);

  const group =
    new THREE.Group();

  group.name = `CampusLandscape:${resolved.style}`;

  switch (resolved.style) {
    case "walkway":
      createWalkwayLandscape(
        group,
        resolved,
        materials,
      );
      break;

    case "garden":
      createGardenLandscape(
        group,
        resolved,
        materials,
      );
      break;

    case "sports":
      createSportsLandscape(
        group,
        resolved,
        materials,
      );
      break;

    case "hostels":
      createHostelLandscape(
        group,
        resolved,
        materials,
      );
      break;

    case "gate":
      createGateLandscape(
        group,
        resolved,
        materials,
      );
      break;

    case "quadrangle":
    default:
      createQuadrangleLandscape(
        group,
        resolved,
        materials,
      );
      break;
  }

  group.userData = {
    type: "landscape",
    style: resolved.style,
    width: resolved.width,
    depth: resolved.depth,
  };

  return group;
}

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

export default createLandscape;
