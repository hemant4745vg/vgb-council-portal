import type { Lane } from "./types";

export const BEST_KEY = "vgb-runner-best-v5";
export const BANK_KEY = "vgb-runner-bank-v5";

export const PLAYER_Z = 0;
export const SPAWN_Z = 980;
export const COLLISION_FRONT = 38;
export const WARNING_Z = 220;
export const RUNNER_LINE_Z = 105;

export const START_SPEED = 235;
export const MAX_SPEED = 610;

export const LANE_CENTER = 2 / 3;
export const LANE_DIVIDER = 1 / 3;
export const LANES: Lane[] = [-1, 0, 1];

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 2.15);

export function laneX(lane: number, roadHalf: number) {
  return lane * roadHalf * LANE_CENTER;
}

export function readStorage(key: string, fallback = 0) {
  if (typeof window === "undefined") return fallback;
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
}

export function writeStorage(key: string, value: number) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, String(Math.max(0, Math.floor(value))));
  }
}
