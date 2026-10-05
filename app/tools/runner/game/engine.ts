import {
  COLLISION_FRONT, MAX_SPEED, START_SPEED, clamp, lerp,
} from "./constants";
import type { Game, Obstacle, Pickup } from "./types";

export function freshGame(best: number, bankCoins: number): Game {
  return {
    phase: "menu",
    last: 0,
    elapsed: 0,
    distance: 0,
    score: 0,
    runCoins: 0,
    bankCoins,
    best,
    speed: START_SPEED,
    targetSpeed: START_SPEED,
    lane: 0,
    targetLane: 0,
    jumpY: 0,
    jumpV: 0,
    sliding: false,
    slideUntil: 0,
    shield: false,
    magnetUntil: 0,
    multiplierUntil: 0,
    boostUntil: 0,
    multiplier: 1,
    combo: 0,
    comboUntil: 0,
    spawnTimer: 0.85,
    pickupTimer: 1.0,
    nextId: 1,
    patternIndex: 0,
    environment: "quadrangle",
    landmark: "ACADEMIC QUADRANGLE",
    landmarkTimer: 0,
    milestone: 250,
    shake: 0,
    flash: 0,
    obstacles: [],
    pickups: [],
    particles: [],
  };
}

export function resetRun(g: Game) {
  const best = g.best;
  const bank = g.bankCoins;
  Object.assign(g, freshGame(best, bank));
  g.phase = "playing";
  g.last = performance.now();
}

export function moveLane(g: Game, direction: -1 | 1) {
  g.targetLane = clamp(g.targetLane + direction, -1, 1) as -1 | 0 | 1;
}

export function startJump(g: Game) {
  if (g.phase !== "playing" || g.jumpY > 0.01 || g.sliding) return false;
  g.jumpV = 790;
  g.jumpY = 1;
  return true;
}

export function startSlide(g: Game) {
  if (g.phase !== "playing" || g.jumpY > 0.02) return false;
  g.sliding = true;
  g.slideUntil = g.elapsed + 0.66;
  return true;
}

export function resolveObstacle(g: Game, obstacle: Obstacle, finish: () => void) {
  if (obstacle.resolved) return;
  obstacle.resolved = true;

  const sameLane = Math.abs(g.lane - obstacle.lane) < 0.40;
  if (!sameLane) {
    g.combo += 1;
    g.comboUntil = g.elapsed + 1.65;
    g.score += 35 * g.multiplier;
    return;
  }

  const jumpClear =
    obstacle.kind === "gap"
      ? g.jumpY > 34
      : g.jumpY > (obstacle.kind === "wall" ? 112 : 58);

  const slideClear = obstacle.kind === "bar" && g.sliding;

  if (jumpClear || slideClear) {
    g.combo += 1;
    g.comboUntil = g.elapsed + 1.65;
    g.score += 55 * g.multiplier;
    return;
  }

  if (g.shield) {
    g.shield = false;
    g.shake = 12;
    g.flash = 0.18;
    return;
  }

  finish();
}

export function collectPickup(g: Game, pickup: Pickup) {
  if (pickup.collected) return;
  pickup.collected = true;

  switch (pickup.kind) {
    case "coin":
      g.runCoins += 1;
      g.score += 30 * g.multiplier;
      g.combo += 1;
      g.comboUntil = g.elapsed + 1.65;
      break;
    case "magnet":
      g.magnetUntil = g.elapsed + 7;
      g.score += 100;
      break;
    case "shield":
      g.shield = true;
      g.score += 125;
      break;
    case "multiplier":
      g.multiplier = Math.min(5, g.multiplier + 1);
      g.multiplierUntil = g.elapsed + 9;
      g.score += 175;
      break;
    case "boost":
      g.boostUntil = g.elapsed + 4;
      g.score += 150;
      break;
  }
}

export function updateGame(
  g: Game,
  dt: number,
  now: number,
  spawnObstacles: () => void,
  spawnPickups: () => void,
  finish: () => void,
) {
  if (g.phase !== "playing") {
    if (g.phase === "paused") g.last = now;
    return;
  }

  g.last = now;
  g.elapsed += dt;

  const baseSpeed = Math.min(MAX_SPEED, START_SPEED + g.elapsed * 4.4);
  g.targetSpeed = g.boostUntil > g.elapsed ? baseSpeed * 1.45 : baseSpeed;
  g.speed = lerp(g.speed, g.targetSpeed, 1 - Math.pow(0.001, dt));
  g.distance += g.speed * dt * 0.022;
  g.score += g.speed * dt * 0.15 * g.multiplier;

  g.lane = lerp(g.lane, g.targetLane, 1 - Math.pow(0.00035, dt));
  if (Math.abs(g.lane - g.targetLane) < 0.01) g.lane = g.targetLane;

  if (g.jumpY > 0 || g.jumpV > 0) {
    g.jumpV -= 1800 * dt;
    g.jumpY += g.jumpV * dt;
    if (g.jumpY <= 0) {
      g.jumpY = 0;
      g.jumpV = 0;
    }
  }

  if (g.sliding && g.elapsed >= g.slideUntil) g.sliding = false;
  if (g.combo > 0 && g.elapsed > g.comboUntil) g.combo = 0;
  if (g.multiplier > 1 && g.elapsed >= g.multiplierUntil) g.multiplier = 1;

  g.spawnTimer -= dt;
  if (g.spawnTimer <= 0) spawnObstacles();

  g.pickupTimer -= dt;
  if (g.pickupTimer <= 0) spawnPickups();

  for (const obstacle of g.obstacles) {
    obstacle.z -= g.speed * dt;
    if (!obstacle.resolved && obstacle.z <= COLLISION_FRONT) {
      resolveObstacle(g, obstacle, finish);

if (g.phase !== "playing") {
  break;
    }
  }

  for (const pickup of g.pickups) {
    pickup.z -= g.speed * dt;
    if (pickup.collected) continue;

    const laneDelta = Math.abs(g.lane - pickup.lane);
    if (
      g.magnetUntil > g.elapsed &&
      pickup.kind === "coin" &&
      pickup.z < 190 &&
      pickup.z > -120 &&
      laneDelta < 1.15
    ) {
      pickup.z -= 620 * dt;
    }

    if (pickup.z <= 24 && pickup.z >= -34 && laneDelta < 0.45) {
      collectPickup(g, pickup);
    }
  }

  g.obstacles = g.obstacles.filter((o) => o.z > -120);
  g.pickups = g.pickups.filter((p) => p.z > -100 && !p.collected);

  for (const p of g.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy -= 190 * dt;
  }
  g.particles = g.particles.filter((p) => p.life > 0);

  g.shake = Math.max(0, g.shake - 28 * dt);
  g.flash = Math.max(0, g.flash - 1.9 * dt);

  if (g.distance >= g.milestone) {
    g.score += 300 * g.multiplier;
    g.milestone += 250;
    g.flash = 0.11;
  }

  const band = Math.floor(g.distance / 700);
  const landmarks = [
    ["quadrangle", "ACADEMIC QUADRANGLE"],
    ["walkway", "COVERED WALKWAY"],
    ["garden", "CENTRAL GARDEN"],
    ["sports", "SPORTS GROUNDS"],
    ["hostels", "HOSTEL DISTRICT"],
    ["gate", "MAIN CAMPUS GATE"],
  ] as const;
  const next = landmarks[band % landmarks.length];
  if (next[1] !== g.landmark) {
    g.environment = next[0];
    g.landmark = next[1];
    g.landmarkTimer = 2;
  }
  g.landmarkTimer = Math.max(0, g.landmarkTimer - dt);
}

export function addBurst(
  g: Game,
  x: number,
  y: number,
  kind: "dust" | "spark",
  count: number,
) {
  for (let i = 0; i < count; i += 1) {
    const maxLife = 0.25 + Math.random() * 0.45;
    g.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * (kind === "spark" ? 220 : 120),
      vy: (Math.random() - 0.65) * (kind === "spark" ? 180 : 70),
      life: maxLife,
      maxLife,
      size: 1.5 + Math.random() * 3.5,
      kind,
    });
  }
}
