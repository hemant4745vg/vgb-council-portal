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
  brickLight: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  trimDark: THREE.MeshStandardMaterial;

  roof: THREE.MeshStandardMaterial;
  roofDark: THREE.MeshStandardMaterial;

  window: THREE.MeshStandardMaterial;
  windowDark: THREE.MeshStandardMaterial;
  frame: THREE.MeshStandardMaterial;

  door: THREE.MeshStandardMaterial;
  concrete: THREE.MeshStandardMaterial;
  concreteDark: THREE.MeshStandardMaterial;

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

function lightenColor(
  color: number,
  amount: number,
) {
  const c = new THREE.Color(color);

  c.lerp(
    new THREE.Color(0xffffff),
    THREE.MathUtils.clamp(amount, 0, 1),
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

    brickLight: createMaterial(
      lightenColor(
        options.brickColor,
        0.08,
      ),
      Math.max(
        0.72,
        options.brickRoughness - 0.03,
      ),
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
      0.82,
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
      0.2,
      0.08,
    ),

    windowDark: createMaterial(
      darkenColor(
        options.windowColor,
        0.28,
      ),
      0.28,
      0.06,
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

    concreteDark: createMaterial(
      0x8e836d,
      0.94,
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

function addCylinder(
  parent: THREE.Group,
  radius: number,
  height: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
  radialSegments = 8,
) {
  const object = createMesh(
    new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      radialSegments,
    ),
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

/**
 * Adds a projecting/recessed façade bay.
 *
 * This is deliberately shallow. The goal is to break the silhouette
 * without turning every building into an over-designed palace.
 */
function addFacadeBay(
  parent: THREE.Group,
  x: number,
  width: number,
  height: number,
  depth: number,
  y: number,
  z: number,
  materials: BuildingMaterials,
) {
  addBox(
    parent,
    width,
    height,
    depth,
    x,
    y,
    z,
    materials.brickLight,
  );

  addBox(
    parent,
    width + 0.12,
    0.12,
    depth + 0.06,
    x,
    y - height / 2 + 0.06,
    z,
    materials.trimDark,
  );

  addBox(
    parent,
    width + 0.12,
    0.12,
    depth + 0.06,
    x,
    y + height / 2 - 0.06,
    z,
    materials.trim,
  );
}

/**
 * Recessed window assembly.
 *
 * The dark backing sits slightly inside the façade while the frame,
 * sill and lintel project outward. This creates actual depth when
 * viewed from the runner camera.
 */
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
    0.105 * scale;

  const recessDepth =
    0.16 * scale;

  const projection =
    0.055 * scale;

  // Deep dark recess.
  addBox(
    parent,
    width + frame * 2.25,
    height + frame * 2.25,
    recessDepth,
    x,
    y,
    z + 0.045,
    materials.windowDark,
  );

  // Glass plane.
  addBox(
    parent,
    width,
    height,
    0.045,
    x,
    y,
    z - 0.045,
    materials.window,
  );

  // Outer frame.
  addBox(
    parent,
    frame,
    height + frame * 2,
    0.16,
    x -
      width / 2 -
      frame / 2,
    y,
    z - projection,
    materials.frame,
  );

  addBox(
    parent,
    frame,
    height + frame * 2,
    0.16,
    x +
      width / 2 +
      frame / 2,
    y,
    z - projection,
    materials.frame,
  );

  addBox(
    parent,
    width + frame * 2,
    frame,
    0.16,
    x,
    y +
      height / 2 +
      frame / 2,
    z - projection,
    materials.frame,
  );

  addBox(
    parent,
    width + frame * 2,
    frame,
    0.16,
    x,
    y -
      height / 2 -
      frame / 2,
    z - projection,
    materials.frame,
  );

  // Vertical mullion.
  addBox(
    parent,
    0.065 * scale,
    height,
    0.19,
    x,
    y,
    z - 0.11,
    materials.frame,
  );

  // Horizontal mullion.
  addBox(
    parent,
    width,
    0.065 * scale,
    0.19,
    x,
    y,
    z - 0.11,
    materials.frame,
  );

  // Projecting sill.
  addBox(
    parent,
    width + frame * 2.5,
    0.105 * scale,
    0.27,
    x,
    y -
      height / 2 -
      frame * 1.35,
    z - 0.15,
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
  // Deep entrance recess.
  addBox(
    parent,
    width + 0.46,
    height + 0.42,
    0.28,
    x,
    y + height / 2,
    z + 0.04,
    materials.brickDark,
  );

  // Cream entrance surround.
  addBox(
    parent,
    width + 0.32,
    0.16,
    0.36,
    x,
    y + height + 0.08,
    z - 0.16,
    materials.trim,
  );

  addBox(
    parent,
    0.16,
    height + 0.2,
    0.36,
    x -
      width / 2 -
      0.08,
    y +
      height / 2,
    z - 0.16,
    materials.trim,
  );

  addBox(
    parent,
    0.16,
    height + 0.2,
    0.36,
    x +
      width / 2 +
      0.08,
    y +
      height / 2,
    z - 0.16,
    materials.trim,
  );

  // Door.
  addBox(
    parent,
    width,
    height,
    0.15,
    x,
    y + height / 2,
    z - 0.23,
    materials.door,
  );

  // Central split.
  addBox(
    parent,
    0.035,
    height - 0.12,
    0.17,
    x,
    y + height / 2,
    z - 0.31,
    materials.frame,
  );

  // Small glazed transom.
  addBox(
    parent,
    width - 0.16,
    0.38,
    0.05,
    x,
    y + height - 0.25,
    z - 0.33,
    materials.windowDark,
  );

  // Handles.
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
    z - 0.34,
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
    z - 0.34,
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
    0.62,
    0.16,
    0.62,
    x,
    y + height - 0.08,
    z,
    materials.trim,
  );

  addBox(
    parent,
    0.56,
    0.12,
    0.56,
    x,
    y + 0.06,
    z,
    materials.trimDark,
  );
}

function addFloorBand(
  parent: THREE.Group,
  width: number,
  depth: number,
  y: number,
  materials: BuildingMaterials,
) {
  // Main cream horizontal belt.
  addBox(
    parent,
    width + 0.2,
    0.17,
    depth + 0.16,
    0,
    y,
    0,
    materials.trim,
  );

  // Slightly darker underside gives the floor plate depth.
  addBox(
    parent,
    width + 0.26,
    0.07,
    depth + 0.19,
    0,
    y - 0.105,
    0,
    materials.trimDark,
  );
}

function addFoundation(
  parent: THREE.Group,
  width: number,
  depth: number,
  materials: BuildingMaterials,
) {
  // Main plinth.
  addBox(
    parent,
    width + 0.72,
    0.34,
    depth + 0.65,
    0,
    0.17,
    0,
    materials.concrete,
  );

  // Darker lower shadow band.
  addBox(
    parent,
    width + 0.82,
    0.13,
    depth + 0.75,
    0,
    0.065,
    0,
    materials.concreteDark,
  );

  // Slightly raised upper slab.
  addBox(
    parent,
    width + 0.46,
    0.13,
    depth + 0.42,
    0,
    0.38,
    0,
    materials.trimDark,
  );
}

/**
 * Creates a two-plane pitched roof with a visible ridge,
 * projecting eaves and darker fascia.
 */
function addRoof(
  parent: THREE.Group,
  width: number,
  depth: number,
  roofBase: number,
  materials: BuildingMaterials,
) {
  const halfWidth =
    width / 2 + 0.8;

  const roofAngle =
    THREE.MathUtils.degToRad(
      23,
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
    depth + 1.45;

  const roofThickness =
    0.2;

  const rightRoof =
    createBox(
      slopeLength,
      roofThickness,
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
      roofThickness,
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

  // Ridge.
  addBox(
    parent,
    0.38,
    0.28,
    roofDepth,
    0,
    roofBase +
      rise +
      0.02,
    0,
    materials.roofDark,
  );

  // Eave fascia.
  addBox(
    parent,
    0.18,
    0.24,
    roofDepth,
    -halfWidth,
    roofBase +
      0.03,
    0,
    materials.roofDark,
  );

  addBox(
    parent,
    0.18,
    0.24,
    roofDepth,
    halfWidth,
    roofBase +
      0.03,
    0,
    materials.roofDark,
  );

  // Front and rear fascia boards.
  addBox(
    parent,
    width + 1.6,
    0.2,
    0.18,
    0,
    roofBase +
      0.08,
    -roofDepth / 2,
    materials.roofDark,
  );

  addBox(
    parent,
    width + 1.6,
    0.2,
    0.18,
    0,
    roofBase +
      0.08,
    roofDepth / 2,
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
    1.9;

  const verandaZ =
    -depth / 2 -
    verandaDepth / 2;

  // Veranda floor plates.
  for (
    let floor = 0;
    floor < floors;
    floor += 1
  ) {
    const floorY =
      floor *
        floorHeight +
      0.42;

    addBox(
      parent,
      width + 0.5,
      0.16,
      verandaDepth,
      0,
      floorY,
      verandaZ,
      materials.trim,
    );

    addBox(
      parent,
      width + 0.58,
      0.07,
      verandaDepth + 0.08,
      0,
      floorY - 0.115,
      verandaZ,
      materials.trimDark,
    );
  }

  const columnCount =
    Math.max(
      5,
      Math.round(
        width / 3,
      ) + 1,
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
      0.42,
      verandaZ -
        verandaDepth / 2,
      floors *
        floorHeight -
        0.42,
      materials,
    );
  }

  // Upper veranda railings.
  if (floors > 1) {
    for (
      let floor = 1;
      floor < floors;
      floor += 1
    ) {
      const y =
        floor *
          floorHeight +
        1.18;

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
          0.055,
          1.0,
          0.055,
          x,
          y - 0.48,
          railingZ,
          materials.railing,
        );
      }

      // Lower rail.
      addBox(
        parent,
        width,
        0.06,
        0.06,
        0,
        y - 0.96,
        railingZ,
        materials.railing,
      );
    }
  }

  // Veranda roof / projecting canopy.
  addBox(
    parent,
    width + 0.8,
    0.18,
    verandaDepth + 0.25,
    0,
    floors *
      floorHeight +
      0.14,
    verandaZ,
    materials.roof,
  );
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
    variant,
  } = options;

  const frontZ =
    -depth / 2 -
    0.075;

  const windowsPerFloor =
    Math.max(
      4,
      Math.floor(
        width / 2.8,
      ),
    );

  /*
   * Vertical façade piers create the repeated institutional rhythm
   * visible on long academic buildings.
   */
  const pierCount =
    Math.max(
      4,
      Math.floor(
        width / 4,
      ),
    );

  for (
    let i = 0;
    i <= pierCount;
    i += 1
  ) {
    const x =
      -width / 2 +
      (width * i) /
        pierCount;

    addBox(
      parent,
      0.18,
      floors *
        floorHeight -
        0.35,
      0.22,
      x,
      floors *
          floorHeight /
          2 +
        0.15,
      frontZ - 0.08,
      materials.trimDark,
    );
  }

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
      1.35;

    const availableWidth =
      width -
      sideMargin * 2;

    /*
     * Administration buildings receive a stronger central entrance
     * composition. Academic buildings keep a balanced classroom rhythm.
     */
    const entranceGap =
      options.entrance
        ? variant ===
          "administration"
          ? 3.7
          : 3.0
        : 0;

    if (
      options.entrance
    ) {
      const sideWidth =
        Math.max(
          1,
          (availableWidth -
            entranceGap) /
            2,
        );

      const leftCount =
        Math.max(
          2,
          Math.ceil(
            windowsPerFloor /
              2,
          ),
        );

      const rightCount =
        leftCount;

      for (
        let i = 0;
        i < leftCount;
        i += 1
      ) {
        const t =
          leftCount === 1
            ? 0.5
            : i /
              (leftCount - 1);

        const x =
          -entranceGap / 2 -
          sideWidth +
          t * sideWidth;

        addWindow(
          parent,
          x,
          y,
          frontZ,
          materials,
          floor === 0
            ? 0.95
            : 0.9,
        );
      }

      for (
        let i = 0;
        i < rightCount;
        i += 1
      ) {
        const t =
          rightCount === 1
            ? 0.5
            : i /
              (rightCount - 1);

        const x =
          entranceGap / 2 +
          t * sideWidth;

        addWindow(
          parent,
          x,
          y,
          frontZ,
          materials,
          floor === 0
            ? 0.95
            : 0.9,
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
            : 0.9,
        );
      }
    }
  }

  if (
    options.entrance
  ) {
    const entranceWidth =
      variant ===
      "administration"
        ? 1.8
        : 1.55;

    addDoor(
      parent,
      0,
      0,
      frontZ - 0.13,
      materials,
      entranceWidth,
      2.6,
    );

    // Entrance canopy.
    addBox(
      parent,
      variant ===
        "administration"
        ? 3.8
        : 3.0,
      0.18,
      1.45,
      0,
      2.98,
      frontZ - 0.7,
      materials.roof,
    );

    // Canopy underside.
    addBox(
      parent,
      variant ===
        "administration"
        ? 3.5
        : 2.7,
      0.08,
      1.25,
      0,
      2.87,
      frontZ - 0.7,
      materials.roofDark,
    );

    // Entrance supports.
    addColumn(
      parent,
      -1.25,
      2.5,
      frontZ - 1.05,
      0.5,
      materials,
    );

    addColumn(
      parent,
      1.25,
      2.5,
      frontZ - 1.05,
      0.5,
      materials,
    );
  }

  /*
   * A small central vertical cream panel gives the administration
   * block a stronger civic/institutional façade.
   */
  if (
    variant ===
    "administration"
  ) {
    addFacadeBay(
      parent,
      0,
      3.2,
      floors *
        floorHeight -
        0.65,
      0.12,
      floors *
          floorHeight /
          2 +
        0.22,
      frontZ - 0.08,
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
    variant,
  } = options;

  const sideX =
    width / 2 +
    0.08;

  const windowsPerSide =
    Math.max(
      2,
      Math.floor(
        depth / 2.8,
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
        1.4 +
        t *
          (depth - 2.8);

      const scale =
        variant === "hostel"
          ? floor === 0
            ? 0.92
            : 0.86
          : floor === 0
            ? 0.92
            : 0.84;

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
        scale,
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
        scale,
      );

      parent.add(
        leftWindow,
      );
    }
  }
}

function addRearWindows(
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

  const rearZ =
    depth / 2 +
    0.08;

  const count =
    Math.max(
      3,
      Math.floor(
        width / 3.1,
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
        1.25 +
        t *
          (width - 2.5);

      const windowGroup =
        new THREE.Group();

      windowGroup.rotation.y =
        Math.PI;

      windowGroup.position.set(
        x,
        y,
        rearZ,
      );

      addWindow(
        windowGroup,
        0,
        0,
        0,
        materials,
        floor === 0
          ? 0.88
          : 0.82,
      );

      parent.add(
        windowGroup,
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
      width * 0.44,
      5.2,
    );

  const signHeight =
    0.56;

  const signZ =
    -depth / 2 -
    0.27;

  const signY =
    floors *
      floorHeight -
    0.76;

  // Sign mounting plate.
  addBox(
    parent,
    signWidth + 0.12,
    signHeight + 0.12,
    0.12,
    0,
    signY,
    signZ + 0.02,
    materials.trim,
  );

  // Dark inset.
  addBox(
    parent,
    signWidth,
    signHeight,
    0.09,
    0,
    signY,
    signZ - 0.065,
    materials.brickDark,
  );

  // Small upper accent.
  addBox(
    parent,
    signWidth * 0.72,
    0.055,
    0.12,
    0,
    signY +
      signHeight / 2 -
      0.06,
    signZ - 0.13,
    materials.roof,
  );
}

function addEntranceSteps(
  parent: THREE.Group,
  depth: number,
  materials: BuildingMaterials,
) {
  const frontZ =
    -depth / 2;

  const stepCount =
    3;

  for (
    let i = 0;
    i < stepCount;
    i += 1
  ) {
    const width =
      2.7 -
      i * 0.16;

    addBox(
      parent,
      width,
      0.16,
      0.56,
      0,
      0.08 +
        i * 0.16,
      frontZ -
        0.46 -
        i * 0.26,
      materials.concrete,
    );
  }

  // Entrance apron.
  addBox(
    parent,
    3.0,
    0.08,
    1.25,
    0,
    0.43,
    frontZ -
      0.18,
    materials.concreteDark,
  );
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
    floors,
    floorHeight,
  } = options;

  const balconyWidth =
    Math.min(
      4.5,
      width * 0.26,
    );

  const balconyZ =
    -depth / 2 -
    1.0;

  const balconyPositions =
    floors >= 3
      ? [
          -width * 0.28,
          0,
          width * 0.28,
        ]
      : [
          -width * 0.27,
          width * 0.27,
        ];

  /*
   * Hostel balconies are repeated vertically. This is important for
   * making a hostel look like a hostel rather than an academic block
   * with a different label.
   */
  for (
    let floor = 1;
    floor < floors;
    floor += 1
  ) {
    const y =
      floor *
        floorHeight +
      0.2;

    for (
      const x of balconyPositions
    ) {
      addBox(
        parent,
        balconyWidth,
        0.16,
        1.72,
        x,
        y,
        balconyZ,
        materials.concrete,
      );

      addBox(
        parent,
        balconyWidth + 0.08,
        0.07,
        1.78,
        x,
        y - 0.115,
        balconyZ,
        materials.concreteDark,
      );

      const railingZ =
        balconyZ -
        0.78;

      addBox(
        parent,
        balconyWidth,
        0.08,
        0.08,
        x,
        y + 0.94,
        railingZ,
        materials.railing,
      );

      const postCount =
        5;

      for (
        let i = 0;
        i < postCount;
        i += 1
      ) {
        const t =
          i /
          (postCount - 1);

        addBox(
          parent,
          0.06,
          0.92,
          0.06,
          x -
            balconyWidth / 2 +
            t *
              balconyWidth,
          y + 0.47,
          railingZ,
          materials.railing,
        );
      }
    }
  }
}

function addAdministrationFeatures(
  parent: THREE.Group,
  options: ResolvedBuildingOptions,
  materials: BuildingMaterials,
) {
  const canopyWidth =
    Math.min(
      options.width * 0.46,
      5.6,
    );

  const canopyZ =
    -options.depth / 2 -
    1.15;

  // Formal entrance canopy.
  addBox(
    parent,
    canopyWidth,
    0.2,
    2.35,
    0,
    3.12,
    canopyZ,
    materials.roof,
  );

  addBox(
    parent,
    canopyWidth + 0.16,
    0.08,
    2.45,
    0,
    3.0,
    canopyZ,
    materials.roofDark,
  );

  // Four formal supports.
  const supportOffset =
    canopyWidth / 2 -
    0.18;

  for (
    const x of [
      -supportOffset,
      supportOffset,
    ]
  ) {
    addColumn(
      parent,
      x,
      0.42,
      canopyZ -
        0.95,
      2.55,
      materials,
    );
  }

  // Civic-style entrance apron.
  addBox(
    parent,
    canopyWidth + 0.55,
    0.1,
    2.9,
    0,
    0.45,
    canopyZ -
      0.55,
    materials.concrete,
  );
}

function addServiceDetails(
  parent: THREE.Group,
  options: ResolvedBuildingOptions,
  materials: BuildingMaterials,
) {
  const roofBase =
    options.floors *
    options.floorHeight;

  // Simple parapet.
  addBox(
    parent,
    options.width + 0.25,
    0.22,
    options.depth + 0.25,
    0,
    roofBase +
      0.11,
    0,
    materials.trim,
  );

  // Small service canopy.
  addBox(
    parent,
    options.width * 0.46,
    0.16,
    1.35,
    0,
    2.92,
    -options.depth / 2 -
      0.65,
    materials.roof,
  );

  // Utility ventilation units.
  const ventX =
    options.width * 0.29;

  for (
    const x of [
      -ventX,
      ventX,
    ]
  ) {
    addBox(
      parent,
      0.75,
      0.55,
      0.42,
      x,
      roofBase +
        0.42,
      0.15,
      materials.concreteDark,
    );

    addBox(
      parent,
      0.5,
      0.08,
      0.46,
      x,
      roofBase +
        0.72,
      0.15,
      materials.metal,
    );
  }
}

/**
 * Adds a few subtle vertical corner pilasters.
 * These help the building silhouette read at distance.
 */
function addCornerPilasters(
  parent: THREE.Group,
  width: number,
  depth: number,
  floors: number,
  floorHeight: number,
  materials: BuildingMaterials,
) {
  const height =
    floors *
    floorHeight -
    0.32;

  const y =
    height / 2 +
    0.16;

  const x =
    width / 2 +
    0.08;

  const z =
    depth / 2 +
    0.08;

  const positions = [
    [-x, -z],
    [x, -z],
    [-x, z],
    [x, z],
  ];

  for (
    const [px, pz] of positions
  ) {
    addBox(
      parent,
      0.24,
      height,
      0.24,
      px,
      y,
      pz,
      materials.trimDark,
    );
  }
}

/**
 * Adds a restrained roof-edge parapet behind the pitched roof.
 * This is especially useful from the elevated runner camera.
 */
function addRoofBaseTrim(
  parent: THREE.Group,
  width: number,
  depth: number,
  roofBase: number,
  materials: BuildingMaterials,
) {
  addBox(
    parent,
    width + 0.28,
    0.18,
    0.22,
    0,
    roofBase -
      0.08,
    -depth / 2,
    materials.trimDark,
  );

  addBox(
    parent,
    width + 0.28,
    0.18,
    0.22,
    0,
    roofBase -
      0.08,
    depth / 2,
    materials.trimDark,
  );
}

/**
 * Small ground-level architectural details stop the building from
 * visually floating above the landscape.
 */
function addGroundApron(
  parent: THREE.Group,
  width: number,
  depth: number,
  materials: BuildingMaterials,
) {
  addBox(
    parent,
    width + 2.0,
    0.06,
    1.6,
    0,
    0.43,
    -depth / 2 -
      0.55,
    materials.concrete,
  );

  addBox(
    parent,
    1.15,
    0.07,
    depth + 0.8,
    -width / 2 -
      0.52,
    0.44,
    0,
    materials.concreteDark,
  );

  addBox(
    parent,
    1.15,
    0.07,
    depth + 0.8,
    width / 2 +
      0.52,
    0.44,
    0,
    materials.concreteDark,
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

  /*
   * Main structural mass.
   *
   * The base remains simple and performant. Architectural complexity
   * is layered onto it rather than replacing it with hundreds of
   * expensive individual structural meshes.
   */
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

  // Floor articulation.
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

  addRoofBaseTrim(
    group,
    width,
    depth,
    totalHeight,
    materials,
  );

  const roofTop =
    addRoof(
      group,
      width,
      depth,
      totalHeight,
      materials,
    );

  // Primary façades.
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

  addRearWindows(
    group,
    options,
    materials,
  );

  addCornerPilasters(
    group,
    width,
    depth,
    floors,
    floorHeight,
    materials,
  );

  // Covered circulation.
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

  // Formal entrance sequence.
  if (
    options.entrance
  ) {
    addEntranceSteps(
      group,
      depth,
      materials,
    );
  }

  // Building-specific architectural language.
  if (
    variant ===
    "hostel"
  ) {
    addBalconies(
      group,
      options,
      materials,
    );
  }

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
  }

  // Identity plate.
  addBuildingSign(
    group,
    width,
    depth,
    floorHeight,
    floors,
    materials,
  );

  // Ground connection.
  addGroundApron(
    group,
    width,
    depth,
    materials,
  );

  /*
   * Service buildings are intentionally smaller and less imposing.
   * Keep this at the group level so the public dimensions remain
   * meaningful in CampusWorld.
   */
  if (
    variant ===
    "service"
  ) {
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
