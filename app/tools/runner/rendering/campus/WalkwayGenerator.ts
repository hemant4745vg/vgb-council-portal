import * as THREE from "three";

export type WalkwayStyle =
  | "covered"
  | "open"
  | "courtyard"
  | "connector";

export type WalkwayOptions = {
  width?: number;
  length?: number;
  height?: number;
  style?: WalkwayStyle;
  name?: string;

  wallColor?: number;
  trimColor?: number;
  roofColor?: number;
  floorColor?: number;

  columnSpacing?: number;
  columns?: boolean;
  roof?: boolean;
  railings?: boolean;
};

type ResolvedWalkwayOptions = {
  width: number;
  length: number;
  height: number;
  style: WalkwayStyle;
  name: string;

  wallColor: number;
  trimColor: number;
  roofColor: number;
  floorColor: number;

  columnSpacing: number;
  columns: boolean;
  roof: boolean;
  railings: boolean;
};

type WalkwayMaterials = {
  wall: THREE.MeshStandardMaterial;
  wallDark: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  trimDark: THREE.MeshStandardMaterial;

  roof: THREE.MeshStandardMaterial;
  roofDark: THREE.MeshStandardMaterial;

  floor: THREE.MeshStandardMaterial;
  floorDark: THREE.MeshStandardMaterial;

  concrete: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  planter: THREE.MeshStandardMaterial;
};

const DEFAULTS: ResolvedWalkwayOptions = {
  width: 3.4,
  length: 18,
  height: 3.2,

  style: "covered",
  name: "COVERED WALKWAY",

  wallColor: 0x8c4937,
  trimColor: 0xe4d7b5,
  roofColor: 0xb98b4d,
  floorColor: 0xb7a88d,

  columnSpacing: 3.2,
  columns: true,
  roof: true,
  railings: false,
};

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

function darkenColor(
  color: number,
  amount: number,
) {
  const c = new THREE.Color(color);

  c.multiplyScalar(
    Math.max(
      0,
      1 - amount,
    ),
  );

  return c.getHex();
}

function lightenColor(
  color: number,
  amount: number,
) {
  const c = new THREE.Color(color);

  c.lerp(
    new THREE.Color(0xffffff),
    THREE.MathUtils.clamp(
      amount,
      0,
      1,
    ),
  );

  return c.getHex();
}

function makeMaterials(
  options: ResolvedWalkwayOptions,
): WalkwayMaterials {
  return {
    wall: createMaterial(
      options.wallColor,
      0.88,
    ),

    wallDark: createMaterial(
      darkenColor(
        options.wallColor,
        0.18,
      ),
      0.92,
    ),

    trim: createMaterial(
      options.trimColor,
      0.78,
    ),

    trimDark: createMaterial(
      darkenColor(
        options.trimColor,
        0.12,
      ),
      0.84,
    ),

    roof: createMaterial(
      options.roofColor,
      0.82,
    ),

    roofDark: createMaterial(
      darkenColor(
        options.roofColor,
        0.17,
      ),
      0.9,
    ),

    floor: createMaterial(
      options.floorColor,
      0.93,
    ),

    floorDark: createMaterial(
      darkenColor(
        options.floorColor,
        0.18,
      ),
      0.96,
    ),

    concrete: createMaterial(
      0xb8ad96,
      0.94,
    ),

    metal: createMaterial(
      0x554c3d,
      0.62,
      0.16,
    ),

    glass: createMaterial(
      0x2d4648,
      0.28,
      0.08,
    ),

    planter: createMaterial(
      0x766653,
      0.9,
    ),
  };
}

function createMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
) {
  const mesh =
    new THREE.Mesh(
      geometry,
      material,
    );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function createBox(
  width: number,
  height: number,
  depth: number,
  material: THREE.Material,
) {
  return createMesh(
    new THREE.BoxGeometry(
      width,
      height,
      depth,
    ),
    material,
  );
}

function addBox(
  parent: THREE.Group,
  width: number,
  height: number,
  depth: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
) {
  const mesh = createBox(
    width,
    height,
    depth,
    material,
  );

  mesh.position.set(
    x,
    y,
    z,
  );

  parent.add(mesh);

  return mesh;
}

function addColumn(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  height: number,
  materials: WalkwayMaterials,
  scale = 1,
) {
  const width =
    0.38 * scale;

  const depth =
    0.38 * scale;

  addBox(
    parent,
    width,
    height,
    depth,
    x,
    y + height / 2,
    z,
    materials.trim,
  );

  // Capital.
  addBox(
    parent,
    width + 0.16 * scale,
    0.14 * scale,
    depth + 0.16 * scale,
    x,
    y + height - 0.07 * scale,
    z,
    materials.trim,
  );

  // Base.
  addBox(
    parent,
    width + 0.12 * scale,
    0.11 * scale,
    depth + 0.12 * scale,
    x,
    y + 0.055 * scale,
    z,
    materials.trimDark,
  );
}

function addFloor(
  parent: THREE.Group,
  width: number,
  length: number,
  materials: WalkwayMaterials,
) {
  // Raised walkway slab.
  addBox(
    parent,
    width,
    0.18,
    length,
    0,
    0.42,
    0,
    materials.floor,
  );

  // Darker underside.
  addBox(
    parent,
    width + 0.12,
    0.08,
    length + 0.1,
    0,
    0.31,
    0,
    materials.floorDark,
  );

  // Outer edge strips.
  addBox(
    parent,
    0.12,
    0.12,
    length,
    -width / 2 +
      0.08,
    0.52,
    0,
    materials.trimDark,
  );

  addBox(
    parent,
    0.12,
    0.12,
    length,
    width / 2 -
      0.08,
    0.52,
    0,
    materials.trimDark,
  );
}

function addRoof(
  parent: THREE.Group,
  width: number,
  length: number,
  roofY: number,
  materials: WalkwayMaterials,
) {
  const roofWidth =
    width + 0.7;

  const roofDepth =
    length + 0.65;

  /*
   * The roof is deliberately a shallow pitched canopy rather than
   * a completely flat rectangle. At runner speed this creates a
   * readable warm roof silhouette without making the corridor look
   * like a separate building.
   */
  const halfWidth =
    roofWidth / 2;

  const angle =
    THREE.MathUtils.degToRad(
      8,
    );

  const rise =
    halfWidth *
    Math.tan(angle);

  const slopeLength =
    halfWidth /
    Math.cos(angle);

  const thickness =
    0.18;

  const left =
    createBox(
      slopeLength,
      thickness,
      roofDepth,
      materials.roof,
    );

  left.position.set(
    -halfWidth / 2,
    roofY +
      rise / 2,
    0,
  );

  left.rotation.z =
    angle;

  parent.add(left);

  const right =
    createBox(
      slopeLength,
      thickness,
      roofDepth,
      materials.roof,
    );

  right.position.set(
    halfWidth / 2,
    roofY +
      rise / 2,
    0,
  );

  right.rotation.z =
    -angle;

  parent.add(right);

  // Central ridge.
  addBox(
    parent,
    0.18,
    0.18,
    roofDepth,
    0,
    roofY +
      rise +
      0.02,
    0,
    materials.roofDark,
  );

  // Front fascia.
  addBox(
    parent,
    roofWidth,
    0.18,
    0.16,
    0,
    roofY +
      0.04,
    -roofDepth / 2,
    materials.roofDark,
  );

  // Rear fascia.
  addBox(
    parent,
    roofWidth,
    0.18,
    0.16,
    0,
    roofY +
      0.04,
    roofDepth / 2,
    materials.roofDark,
  );

  // Side eave trims.
  addBox(
    parent,
    0.16,
    0.18,
    roofDepth,
    -halfWidth,
    roofY +
      0.02,
    0,
    materials.roofDark,
  );

  addBox(
    parent,
    0.16,
    0.18,
    roofDepth,
    halfWidth,
    roofY +
      0.02,
    0,
    materials.roofDark,
  );

  return roofY + rise;
}

function addRoofSupports(
  parent: THREE.Group,
  width: number,
  length: number,
  roofY: number,
  materials: WalkwayMaterials,
) {
  /*
   * Small diagonal-looking support blocks under the roof.
   * These are intentionally represented as simple geometry for
   * performance rather than expensive custom beams.
   */
  const count =
    Math.max(
      2,
      Math.floor(
        length / 3.5,
      ),
    );

  for (
    let i = 0;
    i <= count;
    i += 1
  ) {
    const t =
      count === 0
        ? 0.5
        : i / count;

    const z =
      -length / 2 +
      t * length;

    for (
      const x of [
        -width / 2,
        width / 2,
      ]
    ) {
      addBox(
        parent,
        0.12,
        0.52,
        0.12,
        x,
        roofY -
          0.25,
        z,
        materials.trimDark,
      );
    }
  }
}

function addBayDivider(
  parent: THREE.Group,
  width: number,
  z: number,
  height: number,
  materials: WalkwayMaterials,
) {
  const wallWidth =
    0.13;

  // Rear structural divider.
  addBox(
    parent,
    wallWidth,
    height,
    0.16,
    -width / 2 +
      0.08,
    height / 2 +
      0.42,
    z,
    materials.trimDark,
  );

  addBox(
    parent,
    wallWidth,
    height,
    0.16,
    width / 2 -
      0.08,
    height / 2 +
      0.42,
    z,
    materials.trimDark,
  );
}

function addWallWindow(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  rotationY: number,
  materials: WalkwayMaterials,
  width = 1.35,
  height = 1.65,
) {
  const group =
    new THREE.Group();

  group.rotation.y =
    rotationY;

  group.position.set(
    x,
    y,
    z,
  );

  addBox(
    group,
    width + 0.18,
    height + 0.18,
    0.12,
    0,
    0,
    0,
    materials.trim,
  );

  addBox(
    group,
    width,
    height,
    0.07,
    0,
    0,
    -0.09,
    materials.glass,
  );

  addBox(
    group,
    0.08,
    height,
    0.14,
    0,
    0,
    -0.14,
    materials.trimDark,
  );

  addBox(
    group,
    width,
    0.08,
    0.14,
    0,
    0,
    -0.14,
    materials.trimDark,
  );

  parent.add(group);

  return group;
}

function addRearWall(
  parent: THREE.Group,
  width: number,
  length: number,
  height: number,
  materials: WalkwayMaterials,
) {
  /*
   * Covered corridors are attached to buildings in the VGB-style
   * layout. A shallow rear wall prevents the corridor from reading
   * as an isolated bus shelter.
   */
  const wallZ =
    length / 2 -
    0.08;

  addBox(
    parent,
    width,
    height,
    0.18,
    0,
    height / 2 +
      0.42,
    wallZ,
    materials.wall,
  );

  // Cream wall base.
  addBox(
    parent,
    width + 0.05,
    0.18,
    0.22,
    0,
    0.55,
    wallZ -
      0.04,
    materials.trimDark,
  );

  // Upper trim.
  addBox(
    parent,
    width + 0.05,
    0.16,
    0.22,
    0,
    height +
      0.34,
    wallZ -
      0.04,
    materials.trim,
  );

  const windowCount =
    Math.max(
      2,
      Math.floor(
        length / 4,
      ),
    );

  /*
   * Windows are distributed along the corridor's rear-facing plane.
   * Because the corridor is built along Z, the windows sit on the
   * long rear wall and face toward the runner.
   */
  for (
    let i = 0;
    i < windowCount;
    i += 1
  ) {
    const t =
      windowCount === 1
        ? 0.5
        : i /
          (windowCount - 1);

    const x =
      -width / 2 +
      1.0 +
      t *
        Math.max(
          0.1,
          width - 2.0,
        );

    addWallWindow(
      parent,
      x,
      Math.min(
        height -
          0.65,
        1.9,
      ),
      wallZ -
        0.12,
      Math.PI,
      materials,
      1.15,
      1.4,
    );
  }
}

function addCoveredCorridor(
  parent: THREE.Group,
  options: ResolvedWalkwayOptions,
  materials: WalkwayMaterials,
) {
  const {
    width,
    length,
    height,
    columnSpacing,
  } = options;

  addFloor(
    parent,
    width,
    length,
    materials,
  );

  if (
    options.columns
  ) {
    const bayCount =
      Math.max(
        1,
        Math.round(
          length /
            columnSpacing,
        ),
      );

    const spacing =
      length /
      bayCount;

    /*
     * Columns on the open/front edge.
     *
     * The rear edge is intentionally kept visually lighter because
     * this corridor is meant to merge into the building façade.
     */
    for (
      let i = 0;
      i <= bayCount;
      i += 1
    ) {
      const z =
        -length / 2 +
        i * spacing;

      addColumn(
        parent,
        -width / 2,
        0.5,
        z,
        height -
          0.42,
        materials,
      );
    }

    // Rear architectural posts.
    for (
      let i = 0;
      i <= bayCount;
      i += 1
    ) {
      const z =
        -length / 2 +
        i * spacing;

      addColumn(
        parent,
        width / 2,
        0.5,
        z,
        height -
          0.42,
        materials,
        0.82,
      );
    }

    // Horizontal top beam.
    addBox(
      parent,
      width,
      0.22,
      0.24,
      0,
      height +
        0.32,
      0,
      materials.trimDark,
    );
  }

  if (
    options.roof
  ) {
    addRoof(
      parent,
      width,
      length,
      height +
        0.28,
      materials,
    );

    addRoofSupports(
      parent,
      width,
      length,
      height +
        0.28,
      materials,
    );
  }

  addRearWall(
    parent,
    width,
    length,
    height -
      0.25,
    materials,
  );

  // Bay articulation on the outer side.
  const bayCount =
    Math.max(
      1,
      Math.round(
        length /
          columnSpacing,
      ),
    );

  for (
    let i = 1;
    i < bayCount;
    i += 1
  ) {
    const z =
      -length / 2 +
      (length * i) /
        bayCount;

    addBayDivider(
      parent,
      width,
      z,
      height -
        0.45,
      materials,
    );
  }

  if (
    options.railings
  ) {
    addRailings(
      parent,
      width,
      length,
      materials,
    );
  }
}

function addRailings(
  parent: THREE.Group,
  width: number,
  length: number,
  materials: WalkwayMaterials,
) {
  const railZ =
    -width / 2 +
    0.14;

  const railHeight =
    0.88;

  addBox(
    parent,
    0.07,
    0.07,
    length,
    railZ,
    1.3,
    0,
    materials.metal,
  );

  addBox(
    parent,
    0.07,
    0.07,
    length,
    railZ,
    0.58,
    0,
    materials.metal,
  );

  const count =
    Math.max(
      3,
      Math.floor(
        length / 2.8,
      ),
    );

  for (
    let i = 0;
    i <= count;
    i += 1
  ) {
    const z =
      -length / 2 +
      (length * i) /
        count;

    addBox(
      parent,
      0.07,
      railHeight,
      0.07,
      railZ,
      0.88,
      z,
      materials.metal,
    );
  }
}

function addOpenWalkway(
  parent: THREE.Group,
  options: ResolvedWalkwayOptions,
  materials: WalkwayMaterials,
) {
  const {
    width,
    length,
  } = options;

  addFloor(
    parent,
    width,
    length,
    materials,
  );

  /*
   * Open walkways are intentionally wider and lighter. They provide
   * transition space between buildings and landscaped areas.
   */
  addBox(
    parent,
    width - 0.3,
    0.05,
    length - 0.2,
    0,
    0.53,
    0,
    materials.trim,
  );

  // Low edge kerbs.
  addBox(
    parent,
    0.16,
    0.18,
    length,
    -width / 2 -
      0.03,
    0.52,
    0,
    materials.concrete,
  );

  addBox(
    parent,
    0.16,
    0.18,
    length,
    width / 2 +
      0.03,
    0.52,
    0,
    materials.concrete,
  );

  // Occasional slim shade supports, without a full roof.
  const count =
    Math.max(
      2,
      Math.floor(
        length /
          Math.max(
            4,
            options.columnSpacing *
              1.5,
          ),
      ),
    );

  for (
    let i = 0;
    i <= count;
    i += 1
  ) {
    const z =
      -length / 2 +
      (length * i) /
        count;

    addColumn(
      parent,
      -width / 2 +
        0.08,
      0.53,
      z,
      1.8,
      materials,
      0.7,
    );
  }
}

function addCourtyardWalkway(
  parent: THREE.Group,
  options: ResolvedWalkwayOptions,
  materials: WalkwayMaterials,
) {
  const width =
    Math.max(
      options.width,
      4.4,
    );

  const length =
    options.length;

  addFloor(
    parent,
    width,
    length,
    materials,
  );

  /*
   * Courtyard walkways use a more ceremonial border pattern.
   */
  addBox(
    parent,
    width -
      0.42,
    0.07,
    length -
      0.3,
    0,
    0.55,
    0,
    materials.trim,
  );

  // Low cream parapets.
  addBox(
    parent,
    0.22,
    0.72,
    length,
    -width / 2 +
      0.11,
    0.82,
    0,
    materials.trim,
  );

  addBox(
    parent,
    0.22,
    0.72,
    length,
    width / 2 -
      0.11,
    0.82,
    0,
    materials.trim,
  );

  // Open upper rhythm.
  const bayCount =
    Math.max(
      2,
      Math.floor(
        length / 3.8,
      ),
    );

  for (
    let i = 0;
    i <= bayCount;
    i += 1
  ) {
    const z =
      -length / 2 +
      (length * i) /
        bayCount;

    addColumn(
      parent,
      -width / 2 +
        0.12,
      0.53,
      z,
      2.25,
      materials,
      0.82,
    );

    addColumn(
      parent,
      width / 2 -
        0.12,
      0.53,
      z,
      2.25,
      materials,
      0.82,
    );
  }

  /*
   * A light pergola-style roof makes the courtyard variant distinct
   * without visually competing with the main covered corridor.
   */
  addBox(
    parent,
    width + 0.2,
    0.14,
    length,
    0,
    2.82,
    0,
    materials.roof,
  );

  addBox(
    parent,
    width + 0.3,
    0.1,
    length + 0.15,
    0,
    2.72,
    0,
    materials.roofDark,
  );
}

function addConnectorWalkway(
  parent: THREE.Group,
  options: ResolvedWalkwayOptions,
  materials: WalkwayMaterials,
) {
  const width =
    Math.max(
      2.5,
      options.width * 0.82,
    );

  const length =
    options.length;

  addFloor(
    parent,
    width,
    length,
    materials,
  );

  /*
   * Connector corridors are intentionally compact. They should read
   * as practical links between larger architectural masses.
   */
  addBox(
    parent,
    0.18,
    1.9,
    length,
    -width / 2 +
      0.12,
    1.45,
    0,
    materials.wall,
  );

  addBox(
    parent,
    0.18,
    1.9,
    length,
    width / 2 -
      0.12,
    1.45,
    0,
    materials.wall,
  );

  const bayCount =
    Math.max(
      2,
      Math.floor(
        length /
          Math.max(
            3,
            options.columnSpacing,
          ),
      ),
    );

  for (
    let i = 0;
    i <= bayCount;
    i += 1
  ) {
    const z =
      -length / 2 +
      (length * i) /
        bayCount;

    addBox(
      parent,
      0.25,
      2.25,
      0.22,
      -width / 2,
      1.58,
      z,
      materials.trim,
    );

    addBox(
      parent,
      0.25,
      2.25,
      0.22,
      width / 2,
      1.58,
      z,
      materials.trim,
    );
  }

  if (
    options.roof
  ) {
    addBox(
      parent,
      width + 0.45,
      0.18,
      length + 0.5,
      0,
      2.78,
      0,
      materials.roof,
    );

    addBox(
      parent,
      width + 0.55,
      0.09,
      length + 0.6,
      0,
      2.67,
      0,
      materials.roofDark,
    );
  }
}

function addWalkwayDetails(
  parent: THREE.Group,
  options: ResolvedWalkwayOptions,
  materials: WalkwayMaterials,
) {
  /*
   * Small planters are deliberately sparse. They provide scale and
   * campus identity without turning every corridor into a garden shop.
   */
  if (
    options.style ===
      "covered" ||
    options.style ===
      "courtyard"
  ) {
    const positions = [
      -options.length * 0.36,
      options.length * 0.36,
    ];

    for (
      const z of positions
    ) {
      addBox(
        parent,
        0.72,
        0.42,
        0.72,
        -options.width / 2 -
          0.5,
        0.65,
        z,
        materials.planter,
      );

      addBox(
        parent,
        0.54,
        0.22,
        0.54,
        -options.width / 2 -
          0.5,
        0.96,
        z,
        materials.trimDark,
      );
    }
  }
}

export function createWalkway(
  input: WalkwayOptions = {},
) {
  const options: ResolvedWalkwayOptions = {
    ...DEFAULTS,
    ...input,
    name:
      input.name ??
      DEFAULTS.name,
  };

  const group =
    new THREE.Group();

  group.name =
    options.name;

  const materials =
    makeMaterials(
      options,
    );

  switch (
    options.style
  ) {
    case "open":
      addOpenWalkway(
        group,
        options,
        materials,
      );
      break;

    case "courtyard":
      addCourtyardWalkway(
        group,
        options,
        materials,
      );
      break;

    case "connector":
      addConnectorWalkway(
        group,
        options,
        materials,
      );
      break;

    case "covered":
    default:
      addCoveredCorridor(
        group,
        options,
        materials,
      );
      break;
  }

  addWalkwayDetails(
    group,
    options,
    materials,
  );

  group.userData = {
    type: "campus-walkway",
    style: options.style,
    width: options.width,
    length: options.length,
    height: options.height,
    columnSpacing:
      options.columnSpacing,
  };

  group.traverse(
    (object) => {
      if (
        object instanceof
        THREE.Mesh
      ) {
        object.castShadow =
          true;

        object.receiveShadow =
          true;
      }
    },
  );

  return group;
}

export function createCoveredWalkway(
  overrides: Partial<WalkwayOptions> = {},
) {
  return createWalkway({
    width: 3.5,
    length: 20,
    height: 3.2,
    style: "covered",
    name: "COVERED WALKWAY",
    columns: true,
    roof: true,
    railings: false,
    ...overrides,
  });
}

export function createCourtyardWalkway(
  overrides: Partial<WalkwayOptions> = {},
) {
  return createWalkway({
    width: 4.6,
    length: 18,
    height: 3.0,
    style: "courtyard",
    name: "COURTYARD WALKWAY",
    columns: true,
    roof: true,
    railings: false,
    ...overrides,
  });
}

export function createConnectorWalkway(
  overrides: Partial<WalkwayOptions> = {},
) {
  return createWalkway({
    width: 2.8,
    length: 14,
    height: 2.8,
    style: "connector",
    name: "CAMPUS CONNECTOR",
    columns: true,
    roof: true,
    railings: false,
    ...overrides,
  });
}
