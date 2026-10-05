import { clamp, LANES, SPAWN_Z } from "./constants";
import type { Game, Lane, ObstacleKind, PickupKind } from "./types";

export type PatternItem = { lane: Lane; kind: ObstacleKind };

const EASY: PatternItem[][] = [
  [{ lane: 0, kind: "block" }],
  [{ lane: -1, kind: "block" }],
  [{ lane: 1, kind: "block" }],
  [{ lane: 0, kind: "bar" }],
  [{ lane: 0, kind: "gap" }],
  [{ lane: -1, kind: "block" }, { lane: 1, kind: "block" }],
];

const MEDIUM: PatternItem[][] = [
  [{ lane: -1, kind: "block" }, { lane: 0, kind: "bar" }],
  [{ lane: 0, kind: "gap" }, { lane: 1, kind: "block" }],
  [{ lane: -1, kind: "bar" }, { lane: 1, kind: "bar" }],
  [{ lane: -1, kind: "block" }, { lane: 0, kind: "block" }],
  [{ lane: 0, kind: "block" }, { lane: 1, kind: "block" }],
];

const HARD: PatternItem[][] = [
  [{ lane: -1, kind: "block" }, { lane: 0, kind: "bar" }, { lane: 1, kind: "block" }],
  [{ lane: -1, kind: "gap" }, { lane: 1, kind: "block" }],
  [{ lane: -1, kind: "block" }, { lane: 1, kind: "gap" }],
  [{ lane: 0, kind: "wall" }],
  [{ lane: -1, kind: "block" }, { lane: 0, kind: "gap" }, { lane: 1, kind: "block" }],
];

export function difficultyFor(g: Game) {
  return clamp(g.distance / 3500, 0, 1);
}

export function obstaclePattern(g: Game): PatternItem[] {
  const d = difficultyFor(g);
  const pool = d < 0.28 ? EASY : d < 0.62 ? MEDIUM : HARD;
  return pool[g.patternIndex % pool.length];
}

export function spawnObstacleSet(g: Game) {
  const pattern = obstaclePattern(g);
  const z = SPAWN_Z;

  for (const item of pattern) {
    g.obstacles.push({
      id: g.nextId++,
      lane: item.lane,
      z,
      kind: item.kind,
      resolved: false,
    });
  }

  const d = difficultyFor(g);
  const interval = 1.28 - d * 0.48;
  g.spawnTimer = interval + Math.random() * 0.12;
  g.patternIndex += 1;
}

export function spawnPickupSet(g: Game) {
  const lane = LANES[Math.floor(Math.random() * LANES.length)];
  const roll = Math.random();
  const power: PickupKind =
    roll < 0.78 ? "coin" :
    roll < 0.84 ? "magnet" :
    roll < 0.91 ? "shield" :
    roll < 0.96 ? "multiplier" : "boost";

  if (power === "coin") {
    const count = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i += 1) {
      g.pickups.push({
        id: g.nextId++,
        lane,
        z: SPAWN_Z - 30 - i * 52,
        kind: "coin",
        collected: false,
        phase: Math.random() * Math.PI * 2,
      });
    }
  } else {
    g.pickups.push({
      id: g.nextId++,
      lane,
      z: SPAWN_Z - 90,
      kind: power,
      collected: false,
      phase: Math.random() * Math.PI * 2,
    });
  }

  g.pickupTimer = 1.4 + Math.random() * 1.15;
}
