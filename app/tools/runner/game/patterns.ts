import {
  LANES,
  SPAWN_Z,
  clamp,
} from "./constants";

import type {
  Game,
  Lane,
  ObstacleKind,
  PickupKind,
  TrackPattern,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Pattern library                                                             */
/* -------------------------------------------------------------------------- */

const PATTERNS: TrackPattern[] = [
  {
    name: "single-left",
    length: 18,
    obstacles: [
      {
        lane: -1,
        kind: "block",
        z: SPAWN_Z,
      },
    ],
    pickups: [
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 8,
      },
      {
        lane: 1,
        kind: "coin",
        z: SPAWN_Z - 16,
      },
    ],
  },

  {
    name: "single-center",
    length: 18,
    obstacles: [
      {
        lane: 0,
        kind: "block",
        z: SPAWN_Z,
      },
    ],
    pickups: [
      {
        lane: -1,
        kind: "coin",
        z: SPAWN_Z - 8,
      },
      {
        lane: 1,
        kind: "coin",
        z: SPAWN_Z - 16,
      },
    ],
  },

  {
    name: "single-right",
    length: 18,
    obstacles: [
      {
        lane: 1,
        kind: "block",
        z: SPAWN_Z,
      },
    ],
    pickups: [
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 8,
      },
      {
        lane: -1,
        kind: "coin",
        z: SPAWN_Z - 16,
      },
    ],
  },

  {
    name: "jump-bar",
    length: 20,
    obstacles: [
      {
        lane: 0,
        kind: "bar",
        z: SPAWN_Z,
      },
    ],
    pickups: [
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 5,
      },
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 11,
      },
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 17,
      },
    ],
  },

  {
    name: "gap-center",
    length: 20,
    obstacles: [
      {
        lane: 0,
        kind: "gap",
        z: SPAWN_Z,
      },
    ],
    pickups: [
      {
        lane: -1,
        kind: "coin",
        z: SPAWN_Z - 6,
      },
      {
        lane: 1,
        kind: "coin",
        z: SPAWN_Z - 12,
      },
    ],
  },

  {
    name: "split-left-right",
    length: 22,
    obstacles: [
      {
        lane: -1,
        kind: "block",
        z: SPAWN_Z,
      },
      {
        lane: 1,
        kind: "block",
        z: SPAWN_Z,
      },
    ],
    pickups: [
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 5,
      },
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 11,
      },
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 17,
      },
    ],
  },

  {
    name: "double-block-left",
    length: 24,
    obstacles: [
      {
        lane: -1,
        kind: "block",
        z: SPAWN_Z,
      },
      {
        lane: 0,
        kind: "block",
        z: SPAWN_Z - 14,
      },
    ],
    pickups: [
      {
        lane: 1,
        kind: "coin",
        z: SPAWN_Z - 4,
      },
      {
        lane: 1,
        kind: "coin",
        z: SPAWN_Z - 10,
      },
      {
        lane: 1,
        kind: "coin",
        z: SPAWN_Z - 18,
      },
    ],
  },

  {
    name: "double-block-right",
    length: 24,
    obstacles: [
      {
        lane: 1,
        kind: "block",
        z: SPAWN_Z,
      },
      {
        lane: 0,
        kind: "block",
        z: SPAWN_Z - 14,
      },
    ],
    pickups: [
      {
        lane: -1,
        kind: "coin",
        z: SPAWN_Z - 4,
      },
      {
        lane: -1,
        kind: "coin",
        z: SPAWN_Z - 10,
      },
      {
        lane: -1,
        kind: "coin",
        z: SPAWN_Z - 18,
      },
    ],
  },

  {
    name: "wall-center",
    length: 24,
    obstacles: [
      {
        lane: 0,
        kind: "wall",
        z: SPAWN_Z,
      },
    ],
    pickups: [
      {
        lane: -1,
        kind: "coin",
        z: SPAWN_Z - 6,
      },
      {
        lane: 1,
        kind: "coin",
        z: SPAWN_Z - 12,
      },
    ],
  },

  {
    name: "jump-and-lane",
    length: 28,
    obstacles: [
      {
        lane: 0,
        kind: "bar",
        z: SPAWN_Z,
      },
      {
        lane: 1,
        kind: "block",
        z: SPAWN_Z - 18,
      },
    ],
    pickups: [
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 4,
      },
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 10,
      },
      {
        lane: -1,
        kind: "coin",
        z: SPAWN_Z - 19,
      },
      {
        lane: -1,
        kind: "coin",
        z: SPAWN_Z - 25,
      },
    ],
  },

  {
    name: "alternating",
    length: 30,
    obstacles: [
      {
        lane: -1,
        kind: "block",
        z: SPAWN_Z,
      },
      {
        lane: 1,
        kind: "block",
        z: SPAWN_Z - 18,
      },
    ],
    pickups: [
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 5,
      },
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 11,
      },
      {
        lane: 0,
        kind: "coin",
        z: SPAWN_Z - 17,
      },
      {
        lane: -1,
        kind: "coin",
        z: SPAWN_Z - 24,
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Difficulty                                                                  */
/* -------------------------------------------------------------------------- */

export function difficultyFor(game: Game) {
  return clamp(game.distance / 3500, 0, 1);
}

function allowedPatternCount(difficulty: number) {
  if (difficulty < 0.2) return 5;
  if (difficulty < 0.45) return 8;
  if (difficulty < 0.7) return 10;

  return PATTERNS.length;
}

/* -------------------------------------------------------------------------- */
/* Pattern selection                                                           */
/* -------------------------------------------------------------------------- */

export function getPattern(game: Game): TrackPattern {
  const difficulty = difficultyFor(game);

  const count = allowedPatternCount(difficulty);

  const index =
    game.patternIndex % count;

  return PATTERNS[index];
}

/* -------------------------------------------------------------------------- */
/* Obstacle spawning                                                           */
/* -------------------------------------------------------------------------- */

export function spawnObstacleSet(game: Game) {
  const pattern = getPattern(game);

  for (const placement of pattern.obstacles) {
    game.obstacles.push({
      id: game.nextId++,

      lane: placement.lane,

      z: placement.z,

      kind: placement.kind,

      resolved: false,

      moving: placement.moving,

      movementPhase: placement.movementPhase,

      movementAmplitude:
        placement.movementAmplitude,

      movementSpeed:
        placement.movementSpeed,
    });
  }

  const difficulty =
    difficultyFor(game);

  /*
   * The interval becomes shorter as the run
   * progresses, but never becomes absurdly dense.
   */
  const baseInterval =
    2.0 - difficulty * 0.65;

  game.spawnTimer =
    Math.max(
      1.25,
      baseInterval +
        Math.random() * 0.2,
    );

  game.patternIndex += 1;
}

/* -------------------------------------------------------------------------- */
/* Pickup spawning                                                             */
/* -------------------------------------------------------------------------- */

function randomLane(): Lane {
  return LANES[
    Math.floor(
      Math.random() * LANES.length,
    )
  ];
}

function randomPowerup(): PickupKind {
  const roll = Math.random();

  if (roll < 0.76) return "coin";
  if (roll < 0.83) return "magnet";
  if (roll < 0.90) return "shield";
  if (roll < 0.96) return "multiplier";

  return "boost";
}

export function spawnPickupSet(game: Game) {
  const lane = randomLane();

  const kind = randomPowerup();

  if (kind === "coin") {
    const count =
      4 +
      Math.floor(
        Math.random() * 4,
      );

    for (
      let i = 0;
      i < count;
      i += 1
    ) {
      game.pickups.push({
        id: game.nextId++,

        lane,

        z:
          SPAWN_Z -
          8 -
          i * 7,

        kind: "coin",

        collected: false,

        phase:
          Math.random() *
          Math.PI *
          2,
      });
    }
  } else {
    game.pickups.push({
      id: game.nextId++,

      lane,

      z: SPAWN_Z - 18,

      kind,

      collected: false,

      phase:
        Math.random() *
        Math.PI *
        2,
    });
  }

  game.pickupTimer =
    2.0 +
    Math.random() * 1.2;
}

/* -------------------------------------------------------------------------- */
/* Utility                                                                     */
/* -------------------------------------------------------------------------- */

export function isLaneBlocked(
  game: Game,
  lane: Lane,
  minZ = 0,
  maxZ = SPAWN_Z,
) {
  return game.obstacles.some(
    (obstacle) =>
      !obstacle.resolved &&
      obstacle.lane === lane &&
      obstacle.z >= minZ &&
      obstacle.z <= maxZ,
  );
}
