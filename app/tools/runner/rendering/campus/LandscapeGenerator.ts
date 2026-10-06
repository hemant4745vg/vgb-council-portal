import * as THREE from "three";

export type LandscapeStyle =
  | "quadrangle"
  | "walkway"
  | "garden"
  | "sports"
  | "hostels"
  | "gate";

export type TreeVariant =
  | "round"
  | "narrow"
  | "cluster";

export type LandscapeOptions = {
  width?: number;
  depth?: number;
  style?: LandscapeStyle;

  grassColor?: number;
  pathColor?: number;
  kerbColor?: number;
  hedgeColor?: number;
  flowerColor?: number;
  flowerSecondaryColor?: number;
  treeLeafColor?: number;
  treeLeafSecondaryColor?: number;
  treeTrunkColor?: number;
  metalColor?: number;
  woodColor?: number;

  includePaths?: boolean;
  includeHedges?: boolean;
  includeFlowers?: boolean;
  includeTrees?: boolean;
  includeBenches?: boolean;
  includeLamps?: boolean;

  treeCount?: number;
  seed?: number;
};

type ResolvedLandscapeOptions =
  Required<LandscapeOptions>;

type MaterialSet = {
  grass: THREE.MeshStandardMaterial;
  path: THREE.MeshStandardMaterial;
  kerb: THREE.MeshStandardMaterial;
  hedge: THREE.MeshStandardMaterial;
  flower: THREE.MeshStandardMaterial;
  flowerSecondary: THREE.MeshStandardMaterial;
  treeLeaf: THREE.MeshStandardMaterial;
  treeLeafSecondary: THREE.MeshStandardMaterial;
  treeTrunk: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  wood: THREE.MeshStandardMaterial;
};

const DEFAULTS: ResolvedLandscapeOptions = {
  width: 32,
  depth: 64,
  style: "quadrangle",

  grassColor: 0x4f7f45,
  pathColor: 0xc6b79a,
  kerbColor: 0xb8ad97,
  hedgeColor: 0x315d32,
  flowerColor: 0xd75d65,
  flowerSecondaryColor: 0xf0c85a,
  treeLeafColor: 0x3e7040,
  treeLeafSecondaryColor: 0x5b8b4b,
  treeTrunkColor: 0x68452e,
  metalColor: 0x39434a,
  woodColor: 0x765239,

  includePaths: true,
  includeHedges: true,
  includeFlowers: true,
  includeTrees: true,
  includeBenches: true,
  includeLamps: false,

  treeCount: 8,
  seed: 17,
};

function mergeOptions(
  options: LandscapeOptions = {},
): ResolvedLandscapeOptions {
  return {
    ...DEFAULTS,
    ...options,
  };
}

function createMaterials(
  options: ResolvedLandscapeOptions,
): MaterialSet {
  return {
    grass: new THREE.MeshStandardMaterial({
      color: options.grassColor,
      roughness: 1,
    }),

    path: new THREE.MeshStandardMaterial({
      color: options.pathColor,
      roughness: 0.92,
    }),

    kerb: new THREE.MeshStandardMaterial({
      color: options.kerbColor,
      roughness: 0.86,
    }),

    hedge: new THREE.MeshStandardMaterial({
      color: options.hedgeColor,
      roughness: 1,
    }),

    flower: new THREE.MeshStandardMaterial({
      color: options.flowerColor,
      roughness: 0.82,
    }),

    flowerSecondary: new THREE.MeshStandardMaterial({
      color: options.flowerSecondaryColor,
      roughness: 0.82,
    }),

    treeLeaf: new THREE.MeshStandardMaterial({
      color: options.treeLeafColor,
      roughness: 1,
    }),

    treeLeafSecondary: new THREE.MeshStandardMaterial({
      color: options.treeLeafSecondaryColor,
      roughness: 1,
    }),

    treeTrunk: new THREE.MeshStandardMaterial({
      color: options.treeTrunkColor,
      roughness: 1,
    }),

    metal: new THREE.MeshStandardMaterial({
      color: options.metalColor,
      metalness: 0.5,
      roughness: 0.58,
    }),

    wood: new THREE.MeshStandardMaterial({
      color: options.woodColor,
      roughness: 0.9,
    }),
  };
}

function seededRandom(seed: number) {
  let value = Math.floor(seed) || 1;

  return () => {
    value = (
      value * 1664525 +
      1013904223
    ) >>> 0;

    return value / 4294967296;
  };
}

function createBox(
  width: number,
  height: number,
  depth: number,
  material: THREE.Material,
) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(
      width,
      height,
      depth,
    ),
    material,
  );
}

function createGrass(
  width: number,
  depth: number,
  materials: MaterialSet,
) {
  const grass = createBox(
    width,
    0.16,
    depth,
    materials.grass,
  );

  grass.position.y = -0.08;
  grass.receiveShadow = true;

  grass.userData = {
    type: "grass",
  };

  return grass;
}

function createPath(
  width: number,
  depth: number,
  materials: MaterialSet,
) {
  const group = new THREE.Group();

  const surface = createBox(
    width,
    0.08,
    depth,
    materials.path,
  );

  surface.position.y = 0.01;
  surface.receiveShadow = true;

  group.add(surface);

  const kerbThickness = 0.08;
  const kerbHeight = 0.12;

  for (const side of [-1, 1]) {
    const kerb = createBox(
      kerbThickness,
      kerbHeight,
      depth,
      materials.kerb,
    );

    kerb.position.set(
      side * (width / 2),
      kerbHeight / 2,
      0,
    );

    group.add(kerb);
  }

  group.userData = {
    type: "path",
    width,
    depth,
  };

  return group;
}

function createCrossPath(
  width: number,
  depth: number,
  materials: MaterialSet,
) {
  const group = new THREE.Group();

  group.add(
    createPath(
      width,
      depth,
      materials,
    ),
  );

  const horizontal = createPath(
    depth,
    width,
    materials,
  );

  group.add(horizontal);

  group.userData = {
    type: "cross-path",
  };

  return group;
}

function createRadialPath(
  radius: number,
  pathWidth: number,
  segments: number,
  materials: MaterialSet,
) {
  const group = new THREE.Group();

  for (let i = 0; i < segments; i += 1) {
    const angle =
      (Math.PI * 2 * i) / segments;

    const path = createPath(
      pathWidth,
      radius * 2,
      materials,
    );

    path.rotation.y = angle;
    group.add(path);
  }

  const centre = new THREE.Mesh(
    new THREE.CylinderGeometry(
      radius * 0.18,
      radius * 0.18,
      0.06,
      24,
    ),
    materials.path,
  );

  centre.position.y = 0.03;
  group.add(centre);

  group.userData = {
    type: "radial-path",
    radius,
  };

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

  const count = Math.max(
    3,
    Math.ceil(length / 1.2),
  );

  const spacing =
    count > 1
      ? length / (count - 1)
      : length;

  for (let i = 0; i < count; i += 1) {
    const hedge = rounded
      ? new THREE.Mesh(
          new THREE.SphereGeometry(
            Math.max(
              0.34,
              Math.min(
                height,
                depth,
              ) * 0.58,
            ),
            10,
            8,
          ),
          materials.hedge,
        )
      : createBox(
          Math.max(
            0.72,
            spacing * 0.92,
          ),
          height,
          depth,
          materials.hedge,
        );

    hedge.position.x =
      -length / 2 +
      i * spacing;

    if (rounded) {
      hedge.scale.y = 0.78;
      hedge.position.y =
        height * 0.48;
    } else {
      hedge.position.y =
        height / 2;
    }

    hedge.castShadow = true;
    hedge.receiveShadow = true;

    group.add(hedge);
  }

  group.userData = {
    type: "hedge-row",
    length,
    height,
    depth,
  };

  return group;
}

function createFlowerBed(
  width: number,
  depth: number,
  materials: MaterialSet,
) {
  const group = new THREE.Group();

  const soil = createBox(
    width,
    0.07,
    depth,
    materials.kerb,
  );

  soil.position.y = 0.035;
  group.add(soil);

  const flowerCount = Math.max(
    8,
    Math.floor(
      width * depth * 0.22,
    ),
  );

  const random = seededRandom(
    Math.round(
      width * 31 +
      depth * 17,
    ),
  );

  for (
    let i = 0;
    i < flowerCount;
    i += 1
  ) {
    const stem = createBox(
      0.035,
      0.24,
      0.035,
      materials.treeTrunk,
    );

    const x =
      (random() - 0.5) *
      Math.max(0.1, width * 0.88);

    const z =
      (random() - 0.5) *
      Math.max(0.1, depth * 0.82);

    stem.position.set(
      x,
      0.16,
      z,
    );

    group.add(stem);

    const flower = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.085,
        7,
        5,
      ),
      random() > 0.5
        ? materials.flower
        : materials.flowerSecondary,
    );

    flower.position.set(
      x,
      0.32,
      z,
    );

    flower.scale.y = 0.72;
    group.add(flower);
  }

  group.userData = {
    type: "flower-bed",
    width,
    depth,
  };

  return group;
}

function createTree(
  variant: TreeVariant,
  materials: MaterialSet,
  seed: number,
) {
  const random = seededRandom(seed);
  const group = new THREE.Group();

  const trunkHeight =
    variant === "narrow"
      ? 2.3
      : variant === "cluster"
        ? 1.8
        : 2;

  const trunkRadius =
    variant === "narrow"
      ? 0.15
      : 0.18;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(
      trunkRadius,
      trunkRadius * 1.22,
      trunkHeight,
      8,
    ),
    materials.treeTrunk,
  );

  trunk.position.y =
    trunkHeight / 2;

  trunk.castShadow = true;
  group.add(trunk);

  if (variant === "narrow") {
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(
        1.05,
        2.7,
        9,
      ),
      materials.treeLeaf,
    );

    crown.position.y =
      trunkHeight + 1.15;

    crown.castShadow = true;
    group.add(crown);
  } else if (variant === "cluster") {
    for (let i = 0; i < 5; i += 1) {
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(
          0.75 +
            random() * 0.3,
          10,
          8,
        ),
        i % 2 === 0
          ? materials.treeLeaf
          : materials.treeLeafSecondary,
      );

      crown.position.set(
        (random() - 0.5) * 1.25,
        trunkHeight +
          0.75 +
          random() * 0.9,
        (random() - 0.5) * 1.25,
      );

      crown.scale.y =
        0.9 + random() * 0.25;

      crown.castShadow = true;
      group.add(crown);
    }
  } else {
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(
        1.25,
        12,
        9,
      ),
      materials.treeLeaf,
    );

    crown.position.y =
      trunkHeight + 1;

    crown.scale.y = 0.88;
    crown.castShadow = true;
    group.add(crown);

    const secondary = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.72,
        10,
        8,
      ),
      materials.treeLeafSecondary,
    );

    secondary.position.set(
      0.45,
      trunkHeight + 1.55,
      0.15,
    );

    secondary.scale.y = 0.82;
    secondary.castShadow = true;
    group.add(secondary);
  }

  group.userData = {
    type: "tree",
    variant,
  };

  return group;
}

function scatterTrees(
  group: THREE.Group,
  options: ResolvedLandscapeOptions,
  materials: MaterialSet,
) {
  if (
    !options.includeTrees ||
    options.treeCount <= 0
  ) {
    return;
  }

  const random = seededRandom(
    options.seed,
  );

  const count = Math.max(
    0,
    Math.floor(options.treeCount),
  );

  for (
    let i = 0;
    i < count;
    i += 1
  ) {
    const roll = random();

    const variant: TreeVariant =
      roll < 0.2
        ? "narrow"
        : roll < 0.42
          ? "cluster"
          : "round";

    const tree = createTree(
      variant,
      materials,
      options.seed + i * 97,
    );

    const edgeBias =
      random() > 0.48;

    let x: number;
    let z: number;

    if (edgeBias) {
      const side =
        random() > 0.5
          ? 1
          : -1;

      x =
        side *
        (
          options.width * 0.38 +
          random() *
            options.width * 0.12
        );

      z =
        (random() - 0.5) *
        options.depth *
        0.82;
    } else {
      x =
        (random() - 0.5) *
        options.width *
        0.82;

      z =
        (random() - 0.5) *
        options.depth *
        0.82;
    }

    tree.position.set(
      x,
      0,
      z,
    );

    const scale =
      0.82 +
      random() * 0.38;

    tree.scale.setScalar(scale);

    group.add(tree);
  }
}

function createBench(
  materials: MaterialSet,
) {
  const group = new THREE.Group();

  const seat = createBox(
    1.8,
    0.14,
    0.46,
    materials.wood,
  );

  seat.position.y = 0.72;
  seat.castShadow = true;
  group.add(seat);

  const back = createBox(
    1.8,
    0.55,
    0.12,
    materials.wood,
  );

  back.position.set(
    0,
    1.02,
    -0.18,
  );

  back.castShadow = true;
  group.add(back);

  for (const x of [-0.62, 0.62]) {
    const leg = createBox(
      0.1,
      0.7,
      0.1,
      materials.metal,
    );

    leg.position.set(
      x,
      0.36,
      0,
    );

    group.add(leg);
  }

  group.userData = {
    type: "bench",
  };

  return group;
}

function createLamp(
  materials: MaterialSet,
) {
  const group = new THREE.Group();

  const pole = createBox(
    0.08,
    2.8,
    0.08,
    materials.metal,
  );

  pole.position.y = 1.4;
  group.add(pole);

  const arm = createBox(
    0.55,
    0.07,
    0.07,
    materials.metal,
  );

  arm.position.set(
    0.22,
    2.72,
    0,
  );

  group.add(arm);

  const light = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.16,
      10,
      8,
    ),
    new THREE.MeshStandardMaterial({
      color: 0xffe4a8,
      emissive: 0xffc86a,
      emissiveIntensity: 1.5,
      roughness: 0.4,
    }),
  );

  light.position.set(
    0.48,
    2.66,
    0,
  );

  group.add(light);

  group.userData = {
    type: "lamp",
  };

  return group;
}

/* -------------------------------------------------------------------------- */
/* Internal environment builders                                              */
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
    const hedgeZ =
      options.depth * 0.5 - 4;

    for (const z of [
      -hedgeZ,
      hedgeZ,
    ]) {
      const hedge =
        createHedgeRow(
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
      const hedge =
        createHedgeRow(
          options.depth * 0.38,
          0.68,
          0.72,
          materials,
          false,
        );

      hedge.rotation.y =
        Math.PI / 2;

      hedge.position.x = x;
      group.add(hedge);
    }
  }

  if (options.includeFlowers) {
    const bed =
      createFlowerBed(
        options.width * 0.18,
        options.depth * 0.08,
        materials,
      );

    bed.position.set(
      0,
      0,
      options.depth * 0.25,
    );

    group.add(bed);
  }

  scatterTrees(
    group,
    options,
    materials,
  );

  if (options.includeBenches) {
    for (const x of [
      -options.width * 0.22,
      options.width * 0.22,
    ]) {
      const bench =
        createBench(materials);

      bench.position.set(
        x,
        0,
        options.depth * 0.12,
      );

      bench.rotation.y =
        x < 0
          ? -Math.PI / 2
          : Math.PI / 2;

      group.add(bench);
    }
  }
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

  if (options.includeFlowers) {
    const plantingStripWidth =
      Math.max(
        1.2,
        options.width * 0.18,
      );

    for (const side of [-1, 1]) {
      const strip =
        createFlowerBed(
          plantingStripWidth,
          options.depth * 0.82,
          materials,
        );

      strip.position.x =
        side *
        options.width *
        0.32;

      group.add(strip);
    }
  }

  if (options.includeHedges) {
    for (const side of [-1, 1]) {
      const hedge =
        createHedgeRow(
          options.depth * 0.72,
          0.56,
          0.58,
          materials,
          true,
        );

      hedge.rotation.y =
        Math.PI / 2;

      hedge.position.x =
        side *
        options.width *
        0.43;

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
          options.treeCount * 0.7,
        ),
      ),
    },
    materials,
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

  if (options.includeFlowers) {
    const flowerBed =
      createFlowerBed(
        options.width * 0.22,
        options.depth * 0.13,
        materials,
      );

    flowerBed.position.y = 0.02;
    group.add(flowerBed);
  }

  if (options.includeHedges) {
    const hedge =
      createHedgeRow(
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
      const bench =
        createBench(materials);

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

function createSportsLandscapeInternal(
  group: THREE.Group,
  options: ResolvedLandscapeOptions,
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
    const path =
      createPath(
        1.9,
        options.depth * 0.86,
        materials,
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
        Math.floor(
          options.treeCount * 0.45,
        ),
      ),
    },
    materials,
  );

  if (options.includeLamps) {
    for (const z of [
      -options.depth * 0.3,
      0,
      options.depth * 0.3,
    ]) {
      const lamp =
        createLamp(materials);

      lamp.position.set(
        options.width * 0.28,
        0,
        z,
      );

      group.add(lamp);
    }
  }
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
      const hedge =
        createHedgeRow(
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
    const bench =
      createBench(materials);

    bench.position.set(
      0,
      0,
      options.depth * 0.18,
    );

    group.add(bench);
  }

  if (options.includeLamps) {
    for (const z of [
      -options.depth * 0.25,
      options.depth * 0.25,
    ]) {
      for (const side of [-1, 1]) {
        const lamp =
          createLamp(materials);

        lamp.position.set(
          side *
            options.width *
            0.28,
          0,
          z,
        );

        group.add(lamp);
      }
    }
  }
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
      materials,
    ),
  );

  if (options.includePaths) {
    const centralPath =
      createPath(
        4.2,
        options.depth * 0.9,
        materials,
      );

    group.add(centralPath);
  }

  if (options.includeHedges) {
    for (const side of [-1, 1]) {
      const hedge =
        createHedgeRow(
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
      Math.floor(
        options.treeCount * 0.8,
      ),
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
        const lamp =
          createLamp(materials);

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

/* -------------------------------------------------------------------------- */
/* Public factory                                                              */
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
    width: resolved.width,
    depth: resolved.depth,
  };

  return group;
}

/* -------------------------------------------------------------------------- */
/* Public style-specific wrappers                                              */
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
