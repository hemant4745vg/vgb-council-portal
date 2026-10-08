import type { Lane } from "./types";

/* -------------------------------------------------------------------------- */
/* Storage                                                                    */
/* -------------------------------------------------------------------------- */

export const BEST_KEY = "vgb-runner-best-v6";
export const BANK_KEY = "vgb-runner-bank-v6";

/* -------------------------------------------------------------------------- */
/* World / Track                                                              */
/* -------------------------------------------------------------------------- */

export const PLAYER_Z = 0;

/**
 * Obstacles and collectibles are spawned this far ahead of the player.
 * The actual Three.js world uses normal 3D coordinates, so this is a
 * gameplay distance rather than a 2D projection depth.
 */
export const SPAWN_Z = 120;

/**
 * Distance at which an obstacle is considered to have reached the player.
 */
export const COLLISION_FRONT = 2.2;

/* -------------------------------------------------------------------------- */
/* Player                                                                      */
/* -------------------------------------------------------------------------- */

export const PLAYER_HEIGHT = 1.8;
export const PLAYER_RADIUS = 0.42;

export const JUMP_HEIGHT = 2.4;
export const JUMP_DURATION = 0.78;

export const SLIDE_DURATION = 0.72;

/* -------------------------------------------------------------------------- */
/* Track                                                                       */
/* -------------------------------------------------------------------------- */

export const ROAD_WIDTH = 9;
export const ROAD_HALF = ROAD_WIDTH / 2;

export const LANE_WIDTH = ROAD_WIDTH / 3;

export const LANE_CENTER = 2 / 3;
export const LANE_DIVIDER = 1 / 3;

export const LANES: Lane[] = [-1, 0, 1];

export function laneX(lane: number) {
  return lane * LANE_WIDTH;
}

/* -------------------------------------------------------------------------- */
/* Speed                                                                       */
/* -------------------------------------------------------------------------- */

export const START_SPEED = 14;
export const MAX_SPEED = 42;

export const SPEED_ACCELERATION = 0.85;

/* -------------------------------------------------------------------------- */
/* Gameplay                                                                    */
/* -------------------------------------------------------------------------- */

export const COIN_VALUE = 1;

export const SCORE_PER_DISTANCE = 1;

export const MULTIPLIER_DURATION = 8;
export const SHIELD_DURATION = 8;
export const MAGNET_DURATION = 8;
export const SPEED_BOOST_DURATION = 4;

/* -------------------------------------------------------------------------- */
/* Camera                                                                      */
/* -------------------------------------------------------------------------- */

export const CAMERA_HEIGHT = 4.2;
export const CAMERA_DISTANCE = 8.5;

export const CAMERA_LOOK_AHEAD = 12;

export const CAMERA_FOV = 62;
export const CAMERA_FOV_MIN = 58;
export const CAMERA_FOV_MAX = 72;

/* -------------------------------------------------------------------------- */
/* Rendering                                                                   */
/* -------------------------------------------------------------------------- */

export const WORLD_FOG_NEAR = 55;
export const WORLD_FOG_FAR = 150;

export const SHADOW_MAP_SIZE = 1024;

/* -------------------------------------------------------------------------- */
/* Utility                                                                     */
/* -------------------------------------------------------------------------- */

export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export const lerp = (a: number, b: number, t: number) =>
  a + (b - a) * t;

export const easeOut = (t: number) =>
  1 - Math.pow(1 - clamp(t, 0, 1), 2.15);

export const easeInOut = (t: number) => {
  const x = clamp(t, 0, 1);
  return x < 0.5
    ? 2 * x * x
    : 1 - Math.pow(-2 * x + 2, 2) / 2;
};

/* -------------------------------------------------------------------------- */
/* Local storage                                                               */
/* -------------------------------------------------------------------------- */

export function readStorage(key: string, fallback = 0) {
  if (typeof window === "undefined") return fallback;

  const value = Number(localStorage.getItem(key));

  return Number.isFinite(value) ? value : fallback;
}

export function writeStorage(key: string, value: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      key,
      String(Math.max(0, Math.floor(value))),
    );
  }
}
