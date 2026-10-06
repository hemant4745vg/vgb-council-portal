import * as THREE from "three";

import {
  createAcademicBlock,
  createAdministrationBlock,
  createHostelBlock,
  createServiceBlock,
} from "./BuildingGenerator";

import {
  createLandscape,
  type LandscapeTheme,
} from "./LandscapeGenerator";

import {
  createWalkway,
  type WalkwayStyle,
} from "./WalkwayGenerator";

import {
  createCampusDetail,
  type CampusDetailKind,
} from "./CampusDetails";

export type CampusWorldEnvironment =
  | "quadrangle"
  | "walkway"
  | "garden"
  | "sports"
  | "hostels"
  | "gate";

export type CampusWorldOptions = {
  environment?: CampusWorldEnvironment;
  seed?: number;
  visibleDepth?: number;
};

const DEFAULT_DEPTH = 150;

function addObject(
  parent: THREE.Group,
  object: THREE.Object3D,
  x: number,
  z: number,
  y = 0,
  rotationY = 0,
) {
  object.position.set(x, y, z);
  object.rotation.y = rotationY;
  parent.add(object);
  return object;
}

function setShadowFlags(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;

    if (!mesh.isMesh) return;

    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
}

function createDetail(
  kind: CampusDetailKind,
  options: Record<string, unknown> = {},
) {
  return createCampusDetail({
    kind,
    ...options,
    width:
      typeof options.width === "number"
        ? options.width
        : 1,
    height:
      typeof options.height === "number"
        ? options.height
        : 1,
    depth:
      typeof options.depth === "number"
        ? options.depth
        : 1,
  });
}

function addBuilding(
  parent: THREE.Group,
  building: THREE.Object3D,
  x: number,
  z: number,
  rotationY = 0,
) {
  return addObject(
    parent,
    building,
    x,
    z,
    0,
    rotationY,
  );
}

function addWalkway(
  parent: THREE.Group,
  walkway: THREE.Object3D,
  x: number,
  z: number,
  rotationY = 0,
) {
  return addObject(
    parent,
    walkway,
    x,
    z,
    0,
    rotationY,
  );
}

/* -------------------------------------------------------------------------- */
/* ACADEMIC ZONE                                                             */
/* -------------------------------------------------------------------------- */

function createAcademicZone(parent: THREE.Group) {
  const left = createAcademicBlock({
    width: 20,
    depth: 13,
    floors: 2,
    floorHeight: 3.25,
    veranda: true,
  });

  const right = createAcademicBlock({
    width: 18,
    depth: 12,
    floors: 2,
    floorHeight: 3.25,
    veranda: true,
  });

  addBuilding(parent, left, -18, 46);
  addBuilding(
    parent,
    right,
    19,
    50,
    Math.PI,
  );

  const central = createAcademicBlock({
    width: 15,
    depth: 11,
    floors: 2,
    floorHeight: 3.2,
    veranda: true,
  });

  addBuilding(parent, central, 0, 82);

  const leftWalkway = createWalkway({
    style: "covered" as WalkwayStyle,
    width: 18,
  });

  const rightWalkway = createWalkway({
    style: "covered" as WalkwayStyle,
    width: 18,
  });

  addWalkway(
    parent,
    leftWalkway,
    -8.5,
    31,
  );

  addWalkway(
    parent,
    rightWalkway,
    8.5,
    31,
    Math.PI,
  );

  const notice = createDetail(
    "noticeboard",
    {
      width: 2.4,
      height: 1.7,
      depth: 0.16,
    },
  );

  addObject(
    parent,
    notice,
    0,
    20,
    1.15,
  );

  const bench = createDetail(
    "bench",
    {
      width: 2.2,
      height: 0.9,
      depth: 0.65,
    },
  );

  addObject(
    parent,
    bench,
    6,
    17,
  );

  const planter = createDetail(
    "planter",
    {
      width: 1.5,
      height: 0.65,
      depth: 1.1,
    },
  );

  addObject(
    parent,
    planter,
    -6,
    18,
  );
}

/* -------------------------------------------------------------------------- */
/* ADMINISTRATION ZONE                                                       */
/* -------------------------------------------------------------------------- */

function createAdministrationZone(
  parent: THREE.Group,
) {
  const building =
    createAdministrationBlock({
      width: 18,
      depth: 12,
      floors: 2,
      floorHeight: 3.25,
    });

  addBuilding(
    parent,
    building,
    -24,
    86,
  );

  const entrance = createDetail(
    "sign",
    {
      width: 4.5,
      height: 1.25,
      depth: 0.16,
    },
  );

  addObject(
    parent,
    entrance,
    -24,
    77,
    1.7,
  );

  const banner = createDetail(
    "banner",
    {
      width: 1.1,
      height: 2.5,
      depth: 0.08,
    },
  );

  addObject(
    parent,
    banner,
    -14,
    74,
    1.5,
  );

  const light = createDetail(
    "light",
    {
      width: 0.35,
      height: 3.2,
      depth: 0.35,
    },
  );

  addObject(
    parent,
    light,
    -17,
    74,
  );
}

/* -------------------------------------------------------------------------- */
/* HOSTEL ZONE                                                               */
/* -------------------------------------------------------------------------- */

function createHostelZone(
  parent: THREE.Group,
) {
  const left = createHostelBlock({
    width: 18,
    depth: 14,
    floors: 3,
    floorHeight: 3,
    veranda: true,
    balconies: true,
  });

  const right = createHostelBlock({
    width: 18,
    depth: 14,
    floors: 3,
    floorHeight: 3,
    veranda: true,
    balconies: true,
  });

  addBuilding(
    parent,
    left,
    -19,
    58,
  );

  addBuilding(
    parent,
    right,
    19,
    63,
    Math.PI,
  );

  const courtyardWalkway =
    createWalkway({
      style: "courtyard" as WalkwayStyle,
      width: 30,
    });

  addWalkway(
    parent,
    courtyardWalkway,
    0,
    37,
  );

  const benchLeft = createDetail(
    "bench",
    {
      width: 2.2,
      height: 0.9,
      depth: 0.65,
    },
  );

  const benchRight = createDetail(
    "bench",
    {
      width: 2.2,
      height: 0.9,
      depth: 0.65,
    },
  );

  addObject(
    parent,
    benchLeft,
    -8,
    28,
  );

  addObject(
    parent,
    benchRight,
    8,
    29,
  );

  const hostelSign = createDetail(
    "sign",
    {
      width: 4.2,
      height: 1.2,
      depth: 0.16,
    },
  );

  addObject(
    parent,
    hostelSign,
    0,
    25,
    1.65,
  );
}

/* -------------------------------------------------------------------------- */
/* GARDEN ZONE                                                               */
/* -------------------------------------------------------------------------- */

function createGardenZone(
  parent: THREE.Group,
) {
  const walkway = createWalkway({
    style: "open" as WalkwayStyle,
    width: 22,
  });

  addWalkway(
    parent,
    walkway,
    0,
    50,
  );

  const leftBuilding =
    createAcademicBlock({
      width: 17,
      depth: 11,
      floors: 2,
      floorHeight: 3.2,
      veranda: true,
    });

  const rightBuilding =
    createServiceBlock({
      width: 11,
      depth: 8,
      floors: 1,
      floorHeight: 2.8,
    });

  addBuilding(
    parent,
    leftBuilding,
    -22,
    72,
  );

  addBuilding(
    parent,
    rightBuilding,
    23,
    68,
  );

  const planterA = createDetail(
    "planter",
    {
      width: 1.6,
      height: 0.7,
      depth: 1.2,
    },
  );

  const planterB = createDetail(
    "planter",
    {
      width: 1.6,
      height: 0.7,
      depth: 1.2,
    },
  );

  addObject(
    parent,
    planterA,
    -7,
    28,
  );

  addObject(
    parent,
    planterB,
    7,
    28,
  );

  const bench = createDetail(
    "bench",
    {
      width: 2.3,
      height: 0.9,
      depth: 0.7,
    },
  );

  addObject(
    parent,
    bench,
    0,
    33,
  );
}

/* -------------------------------------------------------------------------- */
/* SPORTS ZONE                                                               */
/* -------------------------------------------------------------------------- */

function createSportsZone(
  parent: THREE.Group,
) {
  const service = createServiceBlock({
    width: 12,
    depth: 8,
    floors: 1,
    floorHeight: 2.8,
  });

  addBuilding(
    parent,
    service,
    -24,
    72,
  );

  const walkway = createWalkway({
    style: "connector" as WalkwayStyle,
    width: 18,
  });

  addWalkway(
    parent,
    walkway,
    -10,
    48,
  );

  const sign = createDetail(
    "sign",
    {
      width: 4,
      height: 1.1,
      depth: 0.16,
    },
  );

  addObject(
    parent,
    sign,
    -24,
    64,
    1.55,
  );

  for (const x of [-12, 0, 12]) {
    const bollard = createDetail(
      "bollard",
      {
        width: 0.32,
        height: 0.8,
        depth: 0.32,
      },
    );

    addObject(
      parent,
      bollard,
      x,
      25,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* GATE ZONE                                                                 */
/* -------------------------------------------------------------------------- */

function createGateZone(
  parent: THREE.Group,
) {
  const left = createServiceBlock({
    width: 10,
    depth: 8,
    floors: 1,
    floorHeight: 2.8,
  });

  const right = createServiceBlock({
    width: 10,
    depth: 8,
    floors: 1,
    floorHeight: 2.8,
  });

  addBuilding(
    parent,
    left,
    -25,
    72,
  );

  addBuilding(
    parent,
    right,
    25,
    72,
  );

  const centralWalkway =
    createWalkway({
      style: "connector" as WalkwayStyle,
      width: 24,
    });

  addWalkway(
    parent,
    centralWalkway,
    0,
    58,
  );

  const sign = createDetail(
    "sign",
    {
      width: 6,
      height: 1.5,
      depth: 0.18,
    },
  );

  addObject(
    parent,
    sign,
    0,
    43,
    2,
  );

  const flagLeft = createDetail(
    "flag",
    {
      width: 0.3,
      height: 4.5,
      depth: 0.3,
    },
  );

  const flagRight = createDetail(
    "flag",
    {
      width: 0.3,
      height: 4.5,
      depth: 0.3,
    },
  );

  addObject(
    parent,
    flagLeft,
    -6,
    43,
  );

  addObject(
    parent,
    flagRight,
    6,
    43,
  );
}

/* -------------------------------------------------------------------------- */
/* LANDSCAPE                                                                  */
/* -------------------------------------------------------------------------- */

function createEnvironmentLandscape(
  parent: THREE.Group,
  environment: CampusWorldEnvironment,
  seed: number,
  depth: number,
) {
  let theme: LandscapeTheme =
    "campus";

  if (environment === "garden") {
    theme = "garden";
  }

  if (environment === "sports") {
    theme = "sports";
  }

  if (environment === "hostels") {
    theme = "hostel";
  }

  if (environment === "gate") {
    theme = "gate";
  }

  const landscape = createLandscape({
    width: 92,
    depth,
    theme,
    seed,
    treeDensity:
      environment === "garden"
        ? 0.9
        : environment === "gate"
          ? 0.45
          : 0.65,
    hedgeDensity:
      environment === "garden"
        ? 0.9
        : environment === "sports"
          ? 0.35
          : 0.7,
    lampDensity:
      environment === "gate"
        ? 0.9
        : 0.55,
    benchDensity:
      environment === "garden"
        ? 0.8
        : 0.35,
  });

  parent.add(landscape);
}

/* -------------------------------------------------------------------------- */
/* ENVIRONMENT DISPATCH                                                       */
/* -------------------------------------------------------------------------- */

function buildEnvironment(
  parent: THREE.Group,
  environment: CampusWorldEnvironment,
) {
  switch (environment) {
    case "quadrangle":
      createAcademicZone(parent);
      createAdministrationZone(parent);
      break;

    case "walkway":
      createAcademicZone(parent);
      break;

    case "garden":
      createGardenZone(parent);
      break;

    case "sports":
      createSportsZone(parent);
      break;

    case "hostels":
      createHostelZone(parent);
      break;

    case "gate":
      createGateZone(parent);
      break;

    default:
      createAcademicZone(parent);
      break;
  }
}

/* -------------------------------------------------------------------------- */
/* PUBLIC API                                                                 */
/* -------------------------------------------------------------------------- */

export function createCampusWorld(
  options: CampusWorldOptions = {},
) {
  const environment =
    options.environment ?? "quadrangle";

  const seed =
    options.seed ?? 2026;

  const depth =
    options.visibleDepth ?? DEFAULT_DEPTH;

  const root = new THREE.Group();

  root.name =
    `VGB Campus World • ${environment}`;

  root.userData = {
    type: "campus-world",
    environment,
    seed,
    depth,
  };

  /*
   * Landscape is created first so every architectural element
   * shares the same world coordinate system.
   */
  createEnvironmentLandscape(
    root,
    environment,
    seed,
    depth,
  );

  buildEnvironment(
    root,
    environment,
  );

  setShadowFlags(root);

  return root;
}

export function createCampusEnvironment(
  environment: CampusWorldEnvironment,
  seed = 2026,
) {
  return createCampusWorld({
    environment,
    seed,
  });
}

export function disposeCampusWorld(
  root: THREE.Object3D,
) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;

    if (!mesh.isMesh) {
      return;
    }

    mesh.geometry.dispose();

    if (Array.isArray(mesh.material)) {
      for (const material of mesh.material) {
        material.dispose();
      }
    } else {
      mesh.material.dispose();
    }
  });

  if (root.parent) {
    root.parent.remove(root);
  }
}
