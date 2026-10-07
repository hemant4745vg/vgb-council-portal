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

/*
 * --------------------------------------------------------------------------
 * RUNNER CORRIDOR
 * --------------------------------------------------------------------------
 *
 * The road has three playable lanes. Campus architecture must never visually
 * occupy this corridor.
 *
 * The protection is intentionally slightly wider than the mathematical road
 * so roofs, verandas, columns and decorative projections cannot visually
 * crowd the runner even when they technically sit outside the road.
 */

const ROAD_CLEAR_HALF = 7.5;

/*
 * Additional visual breathing room around the playable road.
 *
 * ROAD_CLEAR_HALF = 7.5
 * RUNNER_CORRIDOR_MARGIN = 1.5
 *
 * Therefore static campus objects are kept outside approximately:
 *
 *       -9.0                 +9.0
 *         │                   │
 *         ├──── RUNNER ──────┤
 */
const RUNNER_CORRIDOR_MARGIN = 1.5;

const RUNNER_CORRIDOR_HALF =
  ROAD_CLEAR_HALF +
  RUNNER_CORRIDOR_MARGIN;

/*
 * Minimum distance at which the centre of a normal campus-side object
 * is allowed to sit.
 */
const CAMPUS_SIDE_MIN =
  RUNNER_CORRIDOR_HALF + 2.5;

const CAMPUS_SIDE_MAX = 31;

const ZONE_FRONT = 24;
const ZONE_MIDDLE = 68;
const ZONE_REAR = 112;

/* -------------------------------------------------------------------------- */
/* OBJECT PLACEMENT / RUNNER CLEARANCE                                        */
/* -------------------------------------------------------------------------- */

/**
 * Returns a safe campus-side X position.
 *
 * The value is clamped away from the playable runner corridor while keeping
 * the existing campus layout philosophy intact.
 */
function campusSide(
  side: -1 | 1,
  offset: number,
) {
  const distance = THREE.MathUtils.clamp(
    offset,
    CAMPUS_SIDE_MIN,
    CAMPUS_SIDE_MAX,
  );

  return side * distance;
}

/**
 * Calculates the world-space X bounds of an object after it has been placed.
 *
 * This is deliberately based on the actual rendered geometry. A walkway may
 * have an 18-unit nominal width but a roof, veranda or fascia can project
 * beyond that. Box3 catches the real result.
 */
function getWorldBounds(
  object: THREE.Object3D,
) {
  object.updateMatrixWorld(true);

  return new THREE.Box3().setFromObject(
    object,
  );
}

/**
 * Keeps a campus object completely outside the runner's visual corridor.
 *
 * This is the important safeguard for the 3D scene.
 *
 * If an object crosses the corridor:
 *
 *   - objects on the left are pushed left
 *   - objects on the right are pushed right
 *   - objects exactly on the centre are assigned to the left side
 *
 * The object itself is moved as a whole, preserving its geometry and
 * orientation.
 */
function protectRunnerCorridor(
  object: THREE.Object3D,
) {
  const bounds =
    getWorldBounds(object);

  const minX =
    bounds.min.x;

  const maxX =
    bounds.max.x;

  /*
   * Completely clear already.
   */
  if (
    maxX <=
      -RUNNER_CORRIDOR_HALF ||
    minX >=
      RUNNER_CORRIDOR_HALF
  ) {
    return;
  }

  /*
   * Choose the side based on the object's current centre.
   *
   * A central object is intentionally sent to the left rather than allowing
   * it to remain across the lanes.
   */
  const centerX =
    (minX + maxX) / 2;

  if (centerX <= 0) {
    /*
     * Push the object's rightmost point beyond the left clearance boundary.
     */
    const requiredMaxX =
      -RUNNER_CORRIDOR_HALF;

    const deltaX =
      requiredMaxX -
      maxX;

    object.position.x +=
      deltaX;
  } else {
    /*
     * Push the object's leftmost point beyond the right clearance boundary.
     */
    const requiredMinX =
      RUNNER_CORRIDOR_HALF;

    const deltaX =
      requiredMinX -
      minX;

    object.position.x +=
      deltaX;
  }

  /*
   * Recalculate once after correction.
   *
   * This catches small floating-point or nested-transform discrepancies.
   */
  object.updateMatrixWorld(true);

  const corrected =
    getWorldBounds(object);

  /*
   * Extremely wide geometry can theoretically still cross the corridor after
   * the first correction. Apply one final deterministic correction.
   */
  if (
    corrected.min.x <
    -RUNNER_CORRIDOR_HALF
    &&
    corrected.max.x >
    RUNNER_CORRIDOR_HALF
  ) {
    /*
     * A single object wider than the entire protected corridor cannot be
     * placed safely merely by translating it. Move it toward the side that
     * corresponds to its original centre.
     */
    const correctedCenter =
      (corrected.min.x +
        corrected.max.x) /
      2;

    if (correctedCenter <= 0) {
      object.position.x +=
        -RUNNER_CORRIDOR_HALF -
        corrected.max.x;
    } else {
      object.position.x +=
        RUNNER_CORRIDOR_HALF -
        corrected.min.x;
    }
  }
}

/**
 * Adds an object to the campus world and immediately applies the runner
 * corridor protection.
 *
 * This is the central enforcement point for:
 *   - buildings
 *   - walkways
 *   - roofs
 *   - verandas
 *   - columns
 *   - signs
 *   - lamps
 *   - benches
 *   - planters
 *   - banners
 *   - flags
 *   - future campus details
 */
function addObject(
  parent: THREE.Group,
  object: THREE.Object3D,
  x: number,
  z: number,
  y = 0,
  rotationY = 0,
) {
  object.position.set(
    x,
    y,
    z,
  );

  object.rotation.y =
    rotationY;

  parent.add(object);

  protectRunnerCorridor(
    object,
  );

  return object;
}

function setShadowFlags(
  root: THREE.Object3D,
) {
  root.traverse((child) => {
    const mesh =
      child as THREE.Mesh;

    if (!mesh.isMesh) {
      return;
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
}

function createDetail(
  kind: CampusDetailKind,
  options: Record<
    string,
    unknown
  > = {},
) {
  return createCampusDetail({
    kind,
    ...options,
    width:
      typeof options.width ===
      "number"
        ? options.width
        : 1,
    height:
      typeof options.height ===
      "number"
        ? options.height
        : 1,
    depth:
      typeof options.depth ===
      "number"
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

/*
 * Deterministic variation without introducing another
 * random-number dependency into the renderer.
 */
function variant(seed: number) {
  return Math.abs(
    Math.floor(seed),
  ) % 3;
}

/* -------------------------------------------------------------------------- */
/* QUADRANGLE                                                                  */
/* -------------------------------------------------------------------------- */

function createQuadrangleZone(
  parent: THREE.Group,
  seed: number,
) {
  const v = variant(seed);

  const frontLeft =
    createAcademicBlock({
      width:
        v === 0 ? 19 : 21,
      depth: 13,
      floors: 2,
      floorHeight: 3.25,
      veranda: true,
    });

  const frontRight =
    createAcademicBlock({
      width:
        v === 2 ? 19 : 20,
      depth: 12,
      floors: 2,
      floorHeight: 3.2,
      veranda: true,
    });

  addBuilding(
    parent,
    frontLeft,
    campusSide(-1, 19),
    ZONE_FRONT,
  );

  addBuilding(
    parent,
    frontRight,
    campusSide(1, 19),
    ZONE_FRONT + 4,
    Math.PI,
  );

  /*
   * This walkway used to be centred directly on the road.
   * It is still created at the same logical position, but addWalkway()
   * now moves the actual geometry outside the protected runner corridor.
   */
  const frontWalkway =
    createWalkway({
      style: "covered" as WalkwayStyle,
      width: 18,
    });

  addWalkway(
    parent,
    frontWalkway,
    0,
    ZONE_FRONT - 8,
  );

  const administration =
    createAdministrationBlock({
      width:
        v === 1 ? 19 : 17,
      depth: 12,
      floors: 2,
      floorHeight: 3.25,
    });

  addBuilding(
    parent,
    administration,
    campusSide(
      v === 1 ? 1 : -1,
      24,
    ),
    ZONE_MIDDLE,
  );

  const middleAcademic =
    createAcademicBlock({
      width: 16,
      depth: 11,
      floors: 2,
      floorHeight: 3.15,
      veranda: true,
    });

  addBuilding(
    parent,
    middleAcademic,
    campusSide(
      v === 1 ? -1 : 1,
      22,
    ),
    ZONE_MIDDLE + 5,
    Math.PI,
  );

  const middleWalkway =
    createWalkway({
      style: "covered" as WalkwayStyle,
      width: 20,
    });

  addWalkway(
    parent,
    middleWalkway,
    0,
    ZONE_MIDDLE - 8,
  );

  const rearService =
    createServiceBlock({
      width: 11,
      depth: 8,
      floors: 1,
      floorHeight: 2.8,
    });

  addBuilding(
    parent,
    rearService,
    campusSide(-1, 25),
    ZONE_REAR,
  );

  const rearAcademic =
    createAcademicBlock({
      width: 15,
      depth: 10,
      floors: 2,
      floorHeight: 3.15,
      veranda: true,
    });

  addBuilding(
    parent,
    rearAcademic,
    campusSide(1, 23),
    ZONE_REAR + 3,
    Math.PI,
  );

  const rearConnector =
    createWalkway({
      style: "connector" as WalkwayStyle,
      width: 17,
    });

  addWalkway(
    parent,
    rearConnector,
    0,
    ZONE_REAR - 8,
  );

  addQuadrangleDetails(
    parent,
    seed,
  );
}

function addQuadrangleDetails(
  parent: THREE.Group,
  seed: number,
) {
  const sign =
    createDetail("sign", {
      width: 4.5,
      height: 1.2,
      depth: 0.16,
    });

  addObject(
    parent,
    sign,
    0,
    12,
    1.65,
  );

  const notice =
    createDetail(
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
    -6.2,
    19,
    1.15,
  );

  const benchLeft =
    createDetail("bench", {
      width: 2.2,
      height: 0.9,
      depth: 0.65,
    });

  const benchRight =
    createDetail("bench", {
      width: 2.2,
      height: 0.9,
      depth: 0.65,
    });

  addObject(
    parent,
    benchLeft,
    -6,
    38,
  );

  addObject(
    parent,
    benchRight,
    7,
    40,
  );

  const planterLeft =
    createDetail("planter", {
      width: 1.5,
      height: 0.65,
      depth: 1.1,
    });

  const planterRight =
    createDetail("planter", {
      width: 1.5,
      height: 0.65,
      depth: 1.1,
    });

  addObject(
    parent,
    planterLeft,
    -5.5,
    55,
  );

  addObject(
    parent,
    planterRight,
    5.5,
    56,
  );

  for (
    let i = 0;
    i < 4;
    i += 1
  ) {
    const lamp =
      createDetail("light", {
        width: 0.3,
        height: 3.2,
        depth: 0.3,
      });

    const side =
      i % 2 === 0
        ? -1
        : 1;

    addObject(
      parent,
      lamp,
      side *
        (6.5 +
          (i % 2) *
            0.8),
      26 + i * 24,
    );
  }

  if (seed % 2 === 0) {
    const banner =
      createDetail("banner", {
        width: 1.1,
        height: 2.5,
        depth: 0.08,
      });

    addObject(
      parent,
      banner,
      -7.4,
      73,
      1.5,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* WALKWAY ENVIRONMENT                                                        */
/* -------------------------------------------------------------------------- */

function createWalkwayZone(
  parent: THREE.Group,
  seed: number,
) {
  const v = variant(seed);

  const leftAcademic =
    createAcademicBlock({
      width:
        v === 0 ? 19 : 17,
      depth: 12,
      floors: 2,
      floorHeight: 3.2,
      veranda: true,
    });

  const rightAcademic =
    createAcademicBlock({
      width:
        v === 2 ? 20 : 18,
      depth: 13,
      floors: 2,
      floorHeight: 3.25,
      veranda: true,
    });

  addBuilding(
    parent,
    leftAcademic,
    campusSide(-1, 21),
    31,
  );

  addBuilding(
    parent,
    rightAcademic,
    campusSide(1, 21),
    77,
    Math.PI,
  );

  const walkwayA =
    createWalkway({
      style: "covered" as WalkwayStyle,
      width: 24,
    });

  const walkwayB =
    createWalkway({
      style: "covered" as WalkwayStyle,
      width: 24,
    });

  addWalkway(
    parent,
    walkwayA,
    -9,
    22,
  );

  addWalkway(
    parent,
    walkwayB,
    9,
    68,
    Math.PI,
  );

  const centralConnector =
    createWalkway({
      style: "connector" as WalkwayStyle,
      width: 18,
    });

  addWalkway(
    parent,
    centralConnector,
    0,
    106,
  );

  const sign =
    createDetail("sign", {
      width: 4.4,
      height: 1.2,
      depth: 0.16,
    });

  addObject(
    parent,
    sign,
    0,
    14,
    1.65,
  );
}

/* -------------------------------------------------------------------------- */
/* GARDEN ENVIRONMENT                                                         */
/* -------------------------------------------------------------------------- */

function createGardenZone(
  parent: THREE.Group,
  seed: number,
) {
  const left =
    createAcademicBlock({
      width: 17,
      depth: 11,
      floors: 2,
      floorHeight: 3.2,
      veranda: true,
    });

  const right =
    createServiceBlock({
      width: 11,
      depth: 8,
      floors: 1,
      floorHeight: 2.8,
    });

  addBuilding(
    parent,
    left,
    campusSide(-1, 23),
    64,
  );

  addBuilding(
    parent,
    right,
    campusSide(1, 25),
    96,
  );

  const walkway =
    createWalkway({
      style: "open" as WalkwayStyle,
      width: 24,
    });

  addWalkway(
    parent,
    walkway,
    0,
    47,
  );

  const connector =
    createWalkway({
      style: "courtyard" as WalkwayStyle,
      width: 28,
    });

  addWalkway(
    parent,
    connector,
    0,
    101,
  );

  const benchA =
    createDetail("bench", {
      width: 2.3,
      height: 0.9,
      depth: 0.7,
    });

  const benchB =
    createDetail("bench", {
      width: 2.3,
      height: 0.9,
      depth: 0.7,
    });

  addObject(
    parent,
    benchA,
    -6,
    32,
  );

  addObject(
    parent,
    benchB,
    6,
    83,
  );

  const planter =
    createDetail("planter", {
      width: 1.6,
      height: 0.7,
      depth: 1.2,
    });

  addObject(
    parent,
    planter,
    0,
    26,
  );

  if (seed % 2 === 0) {
    const secondPlanter =
      createDetail(
        "planter",
        {
          width: 1.6,
          height: 0.7,
          depth: 1.2,
        },
      );

    addObject(
      parent,
      secondPlanter,
      0,
      112,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* SPORTS ENVIRONMENT                                                         */
/* -------------------------------------------------------------------------- */

function createSportsZone(
  parent: THREE.Group,
  seed: number,
) {
  const service =
    createServiceBlock({
      width: 12,
      depth: 8,
      floors: 1,
      floorHeight: 2.8,
    });

  addBuilding(
    parent,
    service,
    campusSide(-1, 24),
    54,
  );

  const secondary =
    createServiceBlock({
      width: 10,
      depth: 8,
      floors: 1,
      floorHeight: 2.8,
    });

  addBuilding(
    parent,
    secondary,
    campusSide(1, 26),
    101,
    Math.PI,
  );

  const connector =
    createWalkway({
      style: "connector" as WalkwayStyle,
      width: 22,
    });

  addWalkway(
    parent,
    connector,
    -10,
    47,
  );

  const sign =
    createDetail("sign", {
      width: 4,
      height: 1.1,
      depth: 0.16,
    });

  addObject(
    parent,
    sign,
    -24,
    45,
    1.55,
  );

  for (
    let i = 0;
    i < 4;
    i += 1
  ) {
    const bollard =
      createDetail(
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
      i % 2 === 0
        ? -5.8
        : 5.8,
      24 + i * 25,
    );
  }

  if (seed % 3 === 0) {
    const banner =
      createDetail("banner", {
        width: 1.1,
        height: 2.5,
        depth: 0.08,
      });

    addObject(
      parent,
      banner,
      7.2,
      73,
      1.5,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* HOSTEL ENVIRONMENT                                                         */
/* -------------------------------------------------------------------------- */

function createHostelZone(
  parent: THREE.Group,
  seed: number,
) {
  const left =
    createHostelBlock({
      width: 18,
      depth: 14,
      floors: 3,
      floorHeight: 3,
      veranda: true,
      balconies: true,
    });

  const right =
    createHostelBlock({
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
    campusSide(-1, 21),
    42,
  );

  addBuilding(
    parent,
    right,
    campusSide(1, 21),
    86,
    Math.PI,
  );

  const courtyard =
    createWalkway({
      style: "courtyard" as WalkwayStyle,
      width: 30,
    });

  addWalkway(
    parent,
    courtyard,
    0,
    30,
  );

  const connector =
    createWalkway({
      style: "covered" as WalkwayStyle,
      width: 22,
    });

  addWalkway(
    parent,
    connector,
    0,
    93,
  );

  const benchLeft =
    createDetail("bench", {
      width: 2.2,
      height: 0.9,
      depth: 0.65,
    });

  const benchRight =
    createDetail("bench", {
      width: 2.2,
      height: 0.9,
      depth: 0.65,
    });

  addObject(
    parent,
    benchLeft,
    -7,
    23,
  );

  addObject(
    parent,
    benchRight,
    7,
    105,
  );

  const hostelSign =
    createDetail("sign", {
      width: 4.2,
      height: 1.2,
      depth: 0.16,
    });

  addObject(
    parent,
    hostelSign,
    0,
    17,
    1.65,
  );

  if (seed % 2 === 1) {
    const planter =
      createDetail(
        "planter",
        {
          width: 1.6,
          height: 0.7,
          depth: 1.2,
        },
      );

    addObject(
      parent,
      planter,
      0,
      118,
    );
  }
}

/* -------------------------------------------------------------------------- */
/* GATE ENVIRONMENT                                                           */
/* -------------------------------------------------------------------------- */

function createGateZone(
  parent: THREE.Group,
  seed: number,
) {
  const left =
    createServiceBlock({
      width: 10,
      depth: 8,
      floors: 1,
      floorHeight: 2.8,
    });

  const right =
    createServiceBlock({
      width: 10,
      depth: 8,
      floors: 1,
      floorHeight: 2.8,
    });

  addBuilding(
    parent,
    left,
    campusSide(-1, 25),
    83,
  );

  addBuilding(
    parent,
    right,
    campusSide(1, 25),
    83,
  );

  const central =
    createWalkway({
      style: "connector" as WalkwayStyle,
      width: 25,
    });

  addWalkway(
    parent,
    central,
    0,
    64,
  );

  const sign =
    createDetail("sign", {
      width: 6,
      height: 1.5,
      depth: 0.18,
    });

  addObject(
    parent,
    sign,
    0,
    43,
    2,
  );

  const flagLeft =
    createDetail("flag", {
      width: 0.3,
      height: 4.5,
      depth: 0.3,
    });

  const flagRight =
    createDetail("flag", {
      width: 0.3,
      height: 4.5,
      depth: 0.3,
    });

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

  if (seed % 2 === 0) {
    const banner =
      createDetail("banner", {
        width: 1.1,
        height: 2.5,
        depth: 0.08,
      });

    addObject(
      parent,
      banner,
      -8,
      98,
      1.5,
    );
  }
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

  if (
    environment === "garden"
  ) {
    theme = "garden";
  }

  if (
    environment === "sports"
  ) {
    theme = "sports";
  }

  if (
    environment === "hostels"
  ) {
    theme = "hostel";
  }

  if (
    environment === "gate"
  ) {
    theme = "gate";
  }

  const landscape =
    createLandscape({
      width: 92,
      depth,
      theme,
      seed,
      treeDensity:
        environment === "garden"
          ? 0.9
          : environment ===
              "gate"
            ? 0.45
            : environment ===
                "hostels"
              ? 0.58
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
  seed: number,
) {
  switch (environment) {
    case "quadrangle":
      createQuadrangleZone(
        parent,
        seed,
      );
      break;

    case "walkway":
      createWalkwayZone(
        parent,
        seed,
      );
      break;

    case "garden":
      createGardenZone(
        parent,
        seed,
      );
      break;

    case "sports":
      createSportsZone(
        parent,
        seed,
      );
      break;

    case "hostels":
      createHostelZone(
        parent,
        seed,
      );
      break;

    case "gate":
      createGateZone(
        parent,
        seed,
      );
      break;

    default:
      createQuadrangleZone(
        parent,
        seed,
      );
      break;
  }
}

/* -------------------------------------------------------------------------- */
/* PUBLIC FACTORY                                                             */
/* -------------------------------------------------------------------------- */

export function createCampusWorld(
  options: CampusWorldOptions = {},
) {
  const environment =
    options.environment ??
    "quadrangle";

  const seed =
    options.seed ?? 2026;

  const depth =
    options.visibleDepth ??
    DEFAULT_DEPTH;

  const root =
    new THREE.Group();

  root.name =
    `VGB Campus World • ${environment}`;

  root.userData = {
    type: "campus-world",
    environment,
    seed,
    depth,
  };

  createEnvironmentLandscape(
    root,
    environment,
    seed,
    depth,
  );

  buildEnvironment(
    root,
    environment,
    seed,
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

/* -------------------------------------------------------------------------- */
/* DISPOSAL                                                                   */
/* -------------------------------------------------------------------------- */

export function disposeCampusWorld(
  root: THREE.Object3D,
) {
  root.traverse((child) => {
    const mesh =
      child as THREE.Mesh;

    if (!mesh.isMesh) {
      return;
    }

    mesh.geometry.dispose();

    if (
      Array.isArray(
        mesh.material,
      )
    ) {
      for (
        const material of
          mesh.material
      ) {
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
