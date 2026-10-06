import * as THREE from "three";

export type WalkwayStyle =
  | "covered"
  | "open"
  | "courtyard"
  | "connector";

export type WalkwayOptions = {
  length?: number;
  width?: number;
  height?: number;
  style?: WalkwayStyle;
  columns?: number;
  roofColor?: number;
  columnColor?: number;
  floorColor?: number;
  wallColor?: number;
};

const DEFAULTS = {
  roof: 0xb98b4d,
  column: 0x8c4937,
  floor: 0xc9b98f,
  wall: 0xe4d7b5,
  window: 0x263b3d,
  metal: 0x39434a,
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

function createColumn(
  parent: THREE.Group,
  x: number,
  z: number,
  height: number,
  mat: THREE.Material,
) {
  addBox(
    parent,
    [0.42, height, 0.42],
    [x, height / 2, z],
    mat,
  );

  addBox(
    parent,
    [0.58, 0.16, 0.58],
    [x, height - 0.08, z],
    mat,
  );

  addBox(
    parent,
    [0.58, 0.14, 0.58],
    [x, 0.07, z],
    mat,
  );
}

function createRoof(
  parent: THREE.Group,
  length: number,
  width: number,
  height: number,
  mat: THREE.Material,
) {
  const roof = new THREE.Group();

  const slab = addBox(
    roof,
    [
      length + 0.7,
      0.18,
      width + 0.7,
    ],
    [0, height, 0],
    mat,
  );

  slab.castShadow = true;

  /*
   * Small projecting fascia gives the roof a deeper
   * architectural silhouette instead of looking like
   * a floating rectangular slab.
   */
  addBox(
    roof,
    [length + 1.0, 0.28, 0.18],
    [0, height - 0.12, width / 2 + 0.32],
    mat,
  );

  addBox(
    roof,
    [length + 1.0, 0.28, 0.18],
    [0, height - 0.12, -width / 2 - 0.32],
    mat,
  );

  parent.add(roof);

  return roof;
}

function createFloor(
  parent: THREE.Group,
  length: number,
  width: number,
  mat: THREE.Material,
) {
  addBox(
    parent,
    [length, 0.12, width],
    [0, 0.06, 0],
    mat,
  );
}

function createWallBand(
  parent: THREE.Group,
  length: number,
  height: number,
  z: number,
  mat: THREE.Material,
) {
  addBox(
    parent,
    [length, 0.18, 0.18],
    [0, height, z],
    mat,
  );
}

function createRail(
  parent: THREE.Group,
  length: number,
  height: number,
  z: number,
  mat: THREE.Material,
) {
  addBox(
    parent,
    [length, 0.08, 0.08],
    [0, height, z],
    mat,
  );

  const spacing = 1.6;

  for (
    let x = -length / 2;
    x <= length / 2;
    x += spacing
  ) {
    addBox(
      parent,
      [0.06, height, 0.06],
      [x, height / 2, z],
      mat,
    );
  }
}

function createWindowModule(
  parent: THREE.Group,
  x: number,
  y: number,
  z: number,
  rotationY: number,
) {
  const frame = material(
    DEFAULTS.wall,
  );

  const glass = material(
    DEFAULTS.window,
    0.3,
    0.15,
  );

  const window = new THREE.Group();

  addBox(
    window,
    [0.92, 1.15, 0.08],
    [0, 0, 0],
    frame,
  );

  addBox(
    window,
    [0.72, 0.9, 0.04],
    [0, 0, -0.045],
    glass,
  );

  addBox(
    window,
    [0.06, 0.9, 0.06],
    [0, 0, -0.075],
    frame,
  );

  addBox(
    window,
    [0.72, 0.06, 0.06],
    [0, 0, -0.075],
    frame,
  );

  window.position.set(x, y, z);
  window.rotation.y = rotationY;

  parent.add(window);
}

function addCoveredSide(
  parent: THREE.Group,
  length: number,
  width: number,
  height: number,
  columns: number,
  side: number,
  columnMat: THREE.Material,
) {
  const z = side * (width / 2 - 0.25);

  for (let i = 0; i < columns; i++) {
    const t =
      columns <= 1
        ? 0.5
        : i / (columns - 1);

    const x =
      -length / 2 +
      t * length;

    createColumn(
      parent,
      x,
      z,
      height,
      columnMat,
    );
  }
}

function addWarmWall(
  parent: THREE.Group,
  length: number,
  height: number,
  z: number,
  wallMat: THREE.Material,
) {
  addBox(
    parent,
    [length, height, 0.14],
    [0, height / 2, z],
    wallMat,
  );

  createWallBand(
    parent,
    length,
    height - 0.18,
    z - 0.08,
    wallMat,
  );
}

export function createWalkway(
  options: WalkwayOptions = {},
) {
  const {
    length = 18,
    width = 3.6,
    height = 3.2,
    style = "covered",
    columns = 6,
    roofColor = DEFAULTS.roof,
    columnColor = DEFAULTS.column,
    floorColor = DEFAULTS.floor,
    wallColor = DEFAULTS.wall,
  } = options;

  const root = new THREE.Group();

  root.name = `Walkway:${style}`;

  root.userData.type =
    "campus-walkway";

  root.userData.style = style;

  const roofMat = material(
    roofColor,
    0.78,
  );

  const columnMat = material(
    columnColor,
    0.9,
  );

  const floorMat = material(
    floorColor,
    0.9,
  );

  const wallMat = material(
    wallColor,
    0.88,
  );

  const metalMat = material(
    DEFAULTS.metal,
    0.6,
    0.3,
  );

  createFloor(
    root,
    length,
    width,
    floorMat,
  );

  if (style === "open") {
    addCoveredSide(
      root,
      length,
      width,
      height,
      columns,
      -1,
      columnMat,
    );

    createRoof(
      root,
      length,
      width,
      height,
      roofMat,
    );
  }

  if (style === "covered") {
    addCoveredSide(
      root,
      length,
      width,
      height,
      columns,
      -1,
      columnMat,
    );

    addWarmWall(
      root,
      length,
      height,
      width / 2 - 0.05,
      wallMat,
    );

    for (let i = 0; i < 5; i++) {
      const x =
        -length / 2 +
        1.8 +
        i *
          ((length - 3.6) / 4);

      createWindowModule(
        root,
        x,
        height * 0.58,
        width / 2 - 0.14,
        0,
      );
    }

    createRoof(
      root,
      length,
      width,
      height,
      roofMat,
    );
  }

  if (style === "courtyard") {
    addCoveredSide(
      root,
      length,
      width,
      height,
      columns,
      -1,
      columnMat,
    );

    addCoveredSide(
      root,
      length,
      width,
      height,
      columns,
      1,
      columnMat,
    );

    createRoof(
      root,
      length,
      width,
      height,
      roofMat,
    );

    createRail(
      root,
      length,
      1.05,
      0,
      metalMat,
    );
  }

  if (style === "connector") {
    addCoveredSide(
      root,
      length,
      width,
      height,
      columns,
      -1,
      columnMat,
    );

    addCoveredSide(
      root,
      length,
      width,
      height,
      columns,
      1,
      columnMat,
    );

    createRoof(
      root,
      length,
      width,
      height,
      roofMat,
    );

    addBox(
      root,
      [length, 0.1, 0.12],
      [0, height - 0.32, 0],
      wallMat,
    );
  }

  return mark(
    root,
    "campus-walkway",
  );
}

export function createCoveredWalkway(
  options: Omit<
    WalkwayOptions,
    "style"
  > = {},
) {
  return createWalkway({
    ...options,
    style: "covered",
  });
}

export function createCourtyardWalkway(
  options: Omit<
    WalkwayOptions,
    "style"
  > = {},
) {
  return createWalkway({
    ...options,
    style: "courtyard",
  });
}

export function createConnectorWalkway(
  options: Omit<
    WalkwayOptions,
    "style"
  > = {},
) {
  return createWalkway({
    ...options,
    style: "connector",
  });
}
