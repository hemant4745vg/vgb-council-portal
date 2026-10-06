import * as THREE from "three";

export type BuildingVariant =
  | "academic"
  | "hostel"
  | "administration"
  | "service";

export type BuildingOptions = {
  width?: number;
  depth?: number;
  floors?: number;
  floorHeight?: number;
  variant?: BuildingVariant;
  name?: string;

  brickColor?: number;
  brickRoughness?: number;

  trimColor?: number;
  roofColor?: number;
  roofRoughness?: number;

  windowColor?: number;
  frameColor?: number;

  entrance?: boolean;
  veranda?: boolean;
  balconies?: boolean;
};

type ResolvedBuildingOptions = {
  width: number;
  depth: number;
  floors: number;
  floorHeight: number;
  variant: BuildingVariant;
  name: string;

  brickColor: number;
  brickRoughness: number;

  trimColor: number;
  roofColor: number;
  roofRoughness: number;

  windowColor: number;
  frameColor: number;

  entrance: boolean;
  veranda: boolean;
  balconies: boolean;
};

type BuildingMaterials = {
  brick: THREE.MeshStandardMaterial;
  brickDark: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  roofDark: THREE.MeshStandardMaterial;
  window: THREE.MeshStandardMaterial;
  frame: THREE.MeshStandardMaterial;
  door: THREE.MeshStandardMaterial;
  concrete: THREE.MeshStandardMaterial;
  railing: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
};

const DEFAULTS: ResolvedBuildingOptions = {
  width: 18,
  depth: 12,
  floors: 2,
  floorHeight: 3.2,
  variant: "academic",
  name: "VIDYAGYAN",

  brickColor: 0x8c4937,
  brickRoughness: 0.88,

  trimColor: 0xe4d7b5,

  roofColor: 0xb98b4d,
  roofRoughness: 0.82,

  windowColor: 0x263b3d,
  frameColor: 0xe7dcc1,

  entrance: true,
  veranda: true,
  balconies: false,
};

function createMaterial(
  color: number,
  roughness = 0.8,
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

function makeMaterials(
  options: ResolvedBuildingOptions,
): BuildingMaterials {
  return {
    brick: createMaterial(
      options.brickColor,
      options.brickRoughness,
    ),

    brickDark: createMaterial(
      darkenColor(
        options.brickColor,
        0.18,
      ),
      Math.min(
        1,
        options.brickRoughness + 0.04,
      ),
    ),

    trim: createMaterial(
      options.trimColor,
      0.78,
    ),

    roof: createMaterial(
      options.roofColor,
      options.roofRoughness,
    ),

    roofDark: createMaterial(
      darkenColor(
        options.roofColor,
        0.16,
      ),
      Math.min(
        1,
        options.roofRoughness + 0.05,
      ),
    ),

    window: createMaterial(
      options.windowColor,
      0.22,
      0.08,
    ),

    frame: createMaterial(
      options.frameColor,
      0.72,
    ),

    door: createMaterial(
      0x4b3327,
      0.72,
    ),

    concrete: createMaterial(
      0xb9ad91,
      0.92,
    ),

    railing: createMaterial(
      0x51483a,
      0.62,
      0.12,
    ),

    metal: createMaterial(
      0xb59c61,
      0.34,
      0.55,
    ),
  };
}

function createMesh(
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
) {
  const object =
    new THREE.Mesh(
      geometry,
      material,
    );

  object.castShadow = true;
  object.receiveShadow = true;

  return object;
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
  const object = createBox(
    width,
    height,
    depth,
    material,
  );

  object.position.set(
    x,
    y,
    z,
  );

  parent.add(object);

  return object;
}

function addWindow(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  materials: BuildingMaterials,
  scale = 1,
) {
  const width =
    1.15 * scale;

  const height =
    1.48 * scale;

  const frame =
    0.11 * scale;

  addBox(
    parent,
    width,
    height,
    0.09,
    x,
    y,
    z,
    materials.window,
  );

  addBox(
    parent,
    frame,
    height + frame * 2,
    0.13,
    x -
      width / 2 -
      frame / 2,
    y,
    z - 0.04,
    materials.frame,
  );

  addBox(
    parent,
    frame,
    height + frame * 2,
    0.13,
    x +
      width / 2 +
      frame / 2,
    y,
    z - 0.04,
    materials.frame,
  );

  addBox(
    parent,
    width + frame * 2,
    frame,
    0.13,
    x,
    y +
      height / 2 +
      frame / 2,
    z - 0.04,
    materials.frame,
  );

  addBox(
    parent,
    width + frame * 2,
    frame,
    0.13,
    x,
    y -
      height / 2 -
      frame / 2,
    z - 0.04,
    materials.frame,
  );

  addBox(
    parent,
    0.07 * scale,
    height,
    0.15,
    x,
    y,
    z - 0.09,
    materials.frame,
  );

  addBox(
    parent,
    width,
    0.07 * scale,
    0.15,
    x,
    y,
    z - 0.09,
    materials.frame,
  );

  addBox(
    parent,
    width + frame * 2.5,
    0.11 * scale,
    0.25,
    x,
    y -
      height / 2 -
      frame * 1.25,
    z - 0.12,
    materials.trim,
  );
}

function addDoor(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  materials: BuildingMaterials,
  width = 1.45,
  height = 2.55,
) {
  addBox(
    parent,
    width + 0.25,
    height + 0.25,
    0.18,
    x,
    y + height / 2,
    z,
    materials.trim,
  );

  addBox(
    parent,
    width,
    height,
    0.13,
    x,
    y + height / 2,
    z - 0.10,
    materials.door,
  );

  addBox(
    parent,
    0.035,
    height - 0.15,
    0.15,
    x,
    y + height / 2,
    z - 0.18,
    materials.frame,
  );

  const handleGeometry =
    new THREE.SphereGeometry(
      0.055,
      8,
      8,
    );

  const leftHandle =
    createMesh(
      handleGeometry,
      materials.metal,
    );

  leftHandle.position.set(
    x - 0.11,
    y + height / 2,
    z - 0.20,
  );

  parent.add(
    leftHandle,
  );

  const rightHandle =
    createMesh(
      handleGeometry,
      materials.metal,
    );

  rightHandle.position.set(
    x + 0.11,
    y + height / 2,
    z - 0.20,
  );

  parent.add(
    rightHandle,
  );
}

function addColumn(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  height: number,
  materials: BuildingMaterials,
) {
  const column =
    createBox(
      0.42,
      height,
      0.42,
      materials.trim,
    );

  column.position.set(
    x,
    y + height / 2,
    z,
  );

  parent.add(column);

  addBox(
    parent,
    0.58,
    0.16,
    0.58,
    x,
    y + height - 0.08,
    z,
    materials.trim,
  );

  addBox(
    parent,
    0.55,
    0.12,
    0.55,
    x,
    y + 0.06,
    z,
    materials.trim,
  );
}

function addFloorBand(
  parent: THREE.Group,
  width: number,
  depth: number,
  y: number,
  materials: BuildingMaterials,
) {
  addBox(
    parent,
    width + 0.14,
    0.17,
    depth + 0.12,
    0,
    y,
    0,
    materials.trim,
  );
}

function addFoundation(
  parent: THREE.Group,
  width: number,
  depth: number,
  materials: BuildingMaterials,
) {
  addBox(
    parent,
    width + 0.5,
    0.34,
    depth + 0.45,
    0,
    0.17,
    0,
    materials.concrete,
  );
}

function addRoof(
  parent: THREE.Group,
  width: number,
  depth: number,
  roofBase: number,
  materials: BuildingMaterials,
) {
  const halfWidth =
    width / 2 + 0.65;

  const roofAngle =
    THREE.MathUtils.degToRad(
      24,
    );

  const rise =
    halfWidth *
    Math.tan(
      roofAngle,
    );

  const slopeLength =
    halfWidth /
    Math.cos(
      roofAngle,
    );

  const roofDepth =
    depth + 1.25;

  const rightRoof =
    createBox(
      slopeLength,
      0.18,
      roofDepth,
      materials.roof,
    );

  rightRoof.position.set(
    halfWidth / 2,
    roofBase +
      rise / 2,
    0,
  );

  rightRoof.rotation.z =
    -roofAngle;

  parent.add(
    rightRoof,
  );

  const leftRoof =
    createBox(
      slopeLength,
      0.18,
      roofDepth,
      materials.roof,
    );

  leftRoof.position.set(
    -halfWidth / 2,
    roofBase +
      rise / 2,
    0,
  );

  leftRoof.rotation.z =
    roofAngle;

  parent.add(
    leftRoof,
  );

  addBox(
    parent,
    0.34,
    0.26,
    roofDepth,
    0,
    roofBase +
      rise +
      0.02,
    0,
    materials.roofDark,
  );

  addBox(
    parent,
    0.18,
    0.22,
    roofDepth,
    -halfWidth,
    roofBase +
      0.04,
    0,
    materials.roofDark,
  );

  addBox(
    parent,
    0.18,
    0.22,
    roofDepth,
    halfWidth,
    roofBase +
      0.04,
    0,
    materials.roofDark,
  );

  return roofBase + rise;
}

function addVeranda(
  parent: THREE.Group,
  width: number,
  floorHeight: number,
  floors: number,
  depth: number,
  materials: BuildingMaterials,
) {
  const verandaDepth =
    1.75;

  const verandaZ =
    -depth / 2 -
    verandaDepth / 2;

  for (
    let floor = 0;
    floor < floors;
    floor += 1
  ) {
    const floorY =
      floor *
        floorHeight +
      0.16;

    addBox(
      parent,
      width + 0.35,
      0.16,
      verandaDepth,
      0,
      floorY,
      verandaZ,
      materials.trim,
    );
  }

  const columnCount =
    Math.max(
      4,
      Math.round(
        width / 3,
      ),
    );

  for (
    let i = 0;
    i < columnCount;
    i += 1
  ) {
    const t =
      columnCount === 1
        ? 0.5
        : i /
          (columnCount - 1);

    const x =
      -width / 2 +
      t * width;

    addColumn(
      parent,
      x,
      0.25,
      verandaZ -
        verandaDepth / 2,
      floors *
        floorHeight -
        0.25,
      materials,
    );
  }

  if (floors > 1) {
    for (
      let floor = 1;
      floor < floors;
      floor += 1
    ) {
      const y =
        floor *
          floorHeight +
        0.96;

      const railingZ =
        verandaZ -
        verandaDepth / 2 -
        0.05;

      addBox(
        parent,
        width,
        0.08,
        0.08,
        0,
        y,
        railingZ,
        materials.railing,
      );

      for (
        let i = 0;
        i < columnCount;
        i += 1
      ) {
        const t =
          columnCount === 1
            ? 0.5
            : i /
              (columnCount - 1);

        const x =
          -width / 2 +
          t * width;

        addBox(
          parent,
          0.06,
          1.0,
          0.06,
          x,
          y - 0.48,
          railingZ,
          materials.railing,
        );
      }
    }
  }
}

function addFrontFacade(
  parent: THREE.Group,
  options: ResolvedBuildingOptions,
  materials: BuildingMaterials,
) {
  const {
    width,
    depth,
    floors,
    floorHeight,
  } = options;

  const frontZ =
    -depth / 2 -
    0.03;

  const windowsPerFloor =
    Math.max(
      3,
      Math.floor(
        width / 2.8,
      ),
    );

  for (
    let floor = 0;
    floor < floors;
    floor += 1
  ) {
    const y =
      floor *
        floorHeight +
      floorHeight *
        0.58;

    const sideMargin =
      1.15;

    const availableWidth =
      width -
      sideMargin * 2;

    if (
      options.entrance
    ) {
      const halfAvailable =
        (availableWidth -
          2.6) /
        2;

      const sideCount =
        Math.max(
          2,
          Math.ceil(
            windowsPerFloor /
              2,
          ),
        );

      for (
        let i = 0;
        i < sideCount;
        i += 1
      ) {
        const t =
          sideCount === 1
            ? 0.5
            : i /
              (sideCount - 1);

        const leftX =
          -1.3 -
          halfAvailable +
          t *
            halfAvailable;

        const rightX =
          1.3 +
          t *
            halfAvailable;

        addWindow(
          parent,
          leftX,
          y,
          frontZ,
          materials,
          floor === 0
            ? 0.95
            : 0.88,
        );

        addWindow(
          parent,
          rightX,
          y,
          frontZ,
          materials,
          floor === 0
            ? 0.95
            : 0.88,
        );
      }
    } else {
      const count =
        Math.max(
          3,
          windowsPerFloor,
        );

      for (
        let i = 0;
        i < count;
        i += 1
      ) {
        const t =
          count === 1
            ? 0.5
            : i /
              (count - 1);

        const x =
          -width / 2 +
          sideMargin +
          t *
            availableWidth;

        addWindow(
          parent,
          x,
          y,
          frontZ,
          materials,
          floor === 0
            ? 0.95
            : 0.88,
        );
      }
    }
  }

  if (
    options.entrance
  ) {
    addDoor(
      parent,
      0,
      0,
      frontZ - 0.13,
      materials,
      1.55,
      2.6,
    );

    addBox(
      parent,
      2.8,
      0.16,
      1.25,
      0,
      2.9,
      frontZ - 0.62,
      materials.roof,
    );

    addColumn(
      parent,
      -1.15,
      2.55,
      frontZ - 1.0,
      0.55,
      materials,
    );

    addColumn(
      parent,
      1.15,
      2.55,
      frontZ - 1.0,
      0.55,
      materials,
    );
  }
}

function addSideWindows(
  parent: THREE.Group,
  options: ResolvedBuildingOptions,
  materials: BuildingMaterials,
) {
  const {
    width,
    depth,
    floors,
    floorHeight,
  } = options;

  const sideX =
    width / 2 +
    0.04;

  const windowsPerSide =
    Math.max(
      2,
      Math.floor(
        depth / 3,
      ),
    );

  for (
    let floor = 0;
    floor < floors;
    floor += 1
  ) {
    const y =
      floor *
        floorHeight +
      floorHeight *
        0.58;

    for (
      let i = 0;
      i < windowsPerSide;
      i += 1
    ) {
      const t =
        windowsPerSide === 1
          ? 0.5
          : i /
            (windowsPerSide - 1);

      const z =
        -depth / 2 +
        1.35 +
        t *
          (depth - 2.7);

      const rightWindow =
        new THREE.Group();

      rightWindow.rotation.y =
        Math.PI / 2;

      rightWindow.position.set(
        sideX,
        y,
        z,
      );

      addWindow(
        rightWindow,
        0,
        0,
        0,
        materials,
        floor === 0
          ? 0.92
          : 0.84,
      );

      parent.add(
        rightWindow,
      );

      const leftWindow =
        new THREE.Group();

      leftWindow.rotation.y =
        -Math.PI / 2;

      leftWindow.position.set(
        -sideX,
        y,
        z,
      );

      addWindow(
        leftWindow,
        0,
        0,
        0,
        materials,
        floor === 0
          ? 0.92
          : 0.84,
      );

      parent.add(
        leftWindow,
      );
    }
  }
}

function addBuildingSign(
  parent: THREE.Group,
  width: number,
  depth: number,
  floorHeight: number,
  floors: number,
  materials: BuildingMaterials,
) {
  const signWidth =
    Math.min(
      width * 0.46,
      5.2,
    );

  const signHeight =
    0.55;

  const signZ =
    -depth / 2 -
    0.13;

  const signY =
    floors *
      floorHeight -
    0.72;

  addBox(
    parent,
    signWidth,
    signHeight,
    0.10,
    0,
    signY,
    signZ,
    materials.trim,
  );

  addBox(
    parent,
    signWidth - 0.18,
    signHeight - 0.18,
    0.08,
    0,
    signY,
    signZ - 0.06,
    materials.brickDark,
  );
}

function addEntranceSteps(
  parent: THREE.Group,
  depth: number,
  materials: BuildingMaterials,
) {
  const frontZ =
    -depth / 2;

  for (
    let i = 0;
    i < 3;
    i += 1
  ) {
    addBox(
      parent,
      2.55 - i * 0.18,
      0.16,
      0.52,
      0,
      0.08 + i * 0.16,
      frontZ -
        0.45 -
        i * 0.24,
      materials.concrete,
    );
  }
}

function addBalconies(
  parent: THREE.Group,
  options: ResolvedBuildingOptions,
  materials: BuildingMaterials,
) {
  if (
    !options.balconies ||
    options.floors < 2
  ) {
    return;
  }

  const {
    width,
    depth,
    floorHeight,
  } = options;

  const balconyWidth =
    Math.min(
      4.8,
      width * 0.27,
    );

  const balconyZ =
    -depth / 2 -
    0.95;

  const balconyPositions = [
    -width * 0.27,
    width * 0.27,
  ];

  for (const x of balconyPositions) {
    const y =
      floorHeight +
      0.18;

    addBox(
      parent,
      balconyWidth,
      0.16,
      1.6,
      x,
      y,
      balconyZ,
      materials.concrete,
    );

    const railingZ =
      balconyZ -
      0.75;

    addBox(
      parent,
      balconyWidth,
      0.08,
      0.08,
      x,
      y + 0.95,
      railingZ,
      materials.railing,
    );

    const postCount: number = 4;

for (
  let i = 0;
  i < postCount;
  i += 1
) {
  const t =
    postCount === 1
      ? 0.5
      : i /
        (postCount - 1);

  addBox(
    parent,
    0.06,
    0.9,
    0.06,
    x -
      balconyWidth / 2 +
      t * balconyWidth,
    y + 0.46,
    railingZ,
    materials.railing,
  );
}
function addAdministrationFeatures(
  parent: THREE.Group,
  options: ResolvedBuildingOptions,
  materials: BuildingMaterials,
) {
  const canopyWidth =
    Math.min(
      options.width * 0.42,
      5.2,
    );

  addBox(
    parent,
    canopyWidth,
    0.2,
    2.2,
    0,
    3.05,
    -options.depth / 2 -
      1.05,
    materials.roof,
  );
}

function addServiceDetails(
  parent: THREE.Group,
  options: ResolvedBuildingOptions,
  materials: BuildingMaterials,
) {
  addBox(
    parent,
    options.width + 0.18,
    0.22,
    options.depth + 0.18,
    0,
    options.floors *
      options.floorHeight +
      0.11,
    0,
    materials.trim,
  );
}

export function createBuilding(
  input: BuildingOptions = {},
) {
  const options: ResolvedBuildingOptions = {
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

  const {
    width,
    depth,
    floors,
    floorHeight,
    variant,
  } = options;

  const totalHeight =
    floors *
    floorHeight;

  addBox(
    group,
    width,
    totalHeight,
    depth,
    0,
    totalHeight / 2,
    0,
    materials.brick,
  );

  addFoundation(
    group,
    width,
    depth,
    materials,
  );

  for (
    let floor = 1;
    floor < floors;
    floor += 1
  ) {
    addFloorBand(
      group,
      width,
      depth,
      floor *
        floorHeight,
      materials,
    );
  }

  const roofTop =
    addRoof(
      group,
      width,
      depth,
      totalHeight,
      materials,
    );

  addFrontFacade(
    group,
    options,
    materials,
  );

  addSideWindows(
    group,
    options,
    materials,
  );

  if (
    options.veranda
  ) {
    addVeranda(
      group,
      width,
      floorHeight,
      floors,
      depth,
      materials,
    );
  }

  if (
    options.entrance
  ) {
    addEntranceSteps(
      group,
      depth,
      materials,
    );
  }

  addBalconies(
    group,
    options,
    materials,
  );

  addBuildingSign(
    group,
    width,
    depth,
    floorHeight,
    floors,
    materials,
  );

  if (
    variant ===
    "administration"
  ) {
    addAdministrationFeatures(
      group,
      options,
      materials,
    );
  }

  if (
    variant ===
    "service"
  ) {
    addServiceDetails(
      group,
      options,
      materials,
    );

    group.scale.set(
      0.86,
      0.86,
      0.86,
    );
  }

  group.userData = {
    type: "campus-building",
    variant,
    width,
    depth,
    floors,
    floorHeight,
    roofHeight: roofTop,
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

export function createAcademicBlock(
  overrides: Partial<BuildingOptions> = {},
) {
  return createBuilding({
    width: 19,
    depth: 12,
    floors: 2,
    floorHeight: 3.25,
    variant: "academic",
    name: "ACADEMIC BLOCK",
    entrance: true,
    veranda: true,
    balconies: false,
    ...overrides,
  });
}

export function createHostelBlock(
  overrides: Partial<BuildingOptions> = {},
) {
  return createBuilding({
    width: 17,
    depth: 13,
    floors: 3,
    floorHeight: 3.0,
    variant: "hostel",
    name: "HOSTEL BLOCK",
    entrance: true,
    veranda: true,
    balconies: true,
    ...overrides,
  });
}

export function createAdministrationBlock(
  overrides: Partial<BuildingOptions> = {},
) {
  return createBuilding({
    width: 16,
    depth: 11,
    floors: 2,
    floorHeight: 3.25,
    variant: "administration",
    name: "ADMINISTRATION",
    entrance: true,
    veranda: true,
    balconies: false,
    ...overrides,
  });
}

export function createServiceBlock(
  overrides: Partial<BuildingOptions> = {},
) {
  return createBuilding({
    width: 11,
    depth: 8,
    floors: 1,
    floorHeight: 2.8,
    variant: "service",
    name: "CAMPUS SERVICES",
    entrance: true,
    veranda: false,
    balconies: false,
    ...overrides,
  });
}
