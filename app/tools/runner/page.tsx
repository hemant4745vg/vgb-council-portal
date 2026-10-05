"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Lane = -1 | 0 | 1;
type Phase = "ready" | "running" | "paused" | "gameover";
type ObstacleKind = "block" | "wall" | "bar" | "gap";
type PickupKind = "coin" | "magnet" | "shield" | "multiplier" | "boost";

type Obstacle = {
  id: number;
  lane: Lane;
  z: number;
  kind: ObstacleKind;
  width: number;
};

type Pickup = {
  id: number;
  lane: Lane;
  z: number;
  kind: PickupKind;
  collected?: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  kind: "coin" | "impact" | "speed" | "milestone";
};

type FloatText = {
  text: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  size: number;
};

type Game = {
  phase: Phase;
  lane: number;
  laneTarget: Lane;
  jumpY: number;
  jumpV: number;
  slide: number;
  speed: number;
  distance: number;
  score: number;
  runCoins: number;
  multiplier: number;
  combo: number;
  comboTimer: number;
  spawnTimer: number;
  pickupTimer: number;
  nextId: number;
  nextMilestone: number;
  obstacles: Obstacle[];
  pickups: Pickup[];
  particles: Particle[];
  floatTexts: FloatText[];
  shield: number;
  magnet: number;
  boost: number;
  multiplierTime: number;
  shake: number;
  flash: number;
  lastAction: number;
  lastFrame: number;
};

const BEST_KEY = "vgb-runner-best-v2";
const BANK_KEY = "vgb-runner-bank-v2";

const ROAD_TOP = 0.19;
const ROAD_BOTTOM = 0.92;
const PLAYER_Z = 0.92;
const HORIZON_Z = 0;
const START_SPEED = 235;
const MAX_SPEED = 610;
const LANE_COUNT = 3;
const LANE_CENTER = 0.68;
const LANE_DIVIDER = 0.34;
const JUMP_VELOCITY = 760;
const GRAVITY = 1850;
const SLIDE_DURATION = 0.72;

const initialGame = (): Game => ({
  phase: "ready",
  lane: 0,
  laneTarget: 0,
  jumpY: 0,
  jumpV: 0,
  slide: 0,
  speed: START_SPEED,
  distance: 0,
  score: 0,
  runCoins: 0,
  multiplier: 1,
  combo: 0,
  comboTimer: 0,
  spawnTimer: 0.85,
  pickupTimer: 0.65,
  nextId: 1,
  nextMilestone: 250,
  obstacles: [],
  pickups: [],
  particles: [],
  floatTexts: [],
  shield: 0,
  magnet: 0,
  boost: 0,
  multiplierTime: 0,
  shake: 0,
  flash: 0,
  lastAction: 0,
  lastFrame: 0,
});

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function laneX(lane: number, roadHalf: number) {
  return lane * roadHalf * LANE_CENTER;
}

function formatNumber(value: number) {
  return Math.floor(value).toLocaleString("en-IN");
}

function loadNumber(key: string) {
  if (typeof window === "undefined") return 0;
  const value = Number(window.localStorage.getItem(key) || 0);
  return Number.isFinite(value) ? value : 0;
}

function obstacleHeight(kind: ObstacleKind) {
  if (kind === "bar") return 0.44;
  if (kind === "gap") return 0;
  return 0.9;
}

function obstacleRequiresJump(kind: ObstacleKind) {
  return kind === "block";
}

function obstacleRequiresSlide(kind: ObstacleKind) {
  return kind === "bar";
}

function obstacleBlocksLane(kind: ObstacleKind) {
  return kind === "wall" || kind === "gap";
}

function createParticles(
  g: Game,
  x: number,
  y: number,
  kind: Particle["kind"],
  count: number
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = kind === "speed" ? 90 + Math.random() * 180 : 45 + Math.random() * 150;
    const life = 0.35 + Math.random() * 0.5;
    g.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (kind === "coin" ? 30 : 0),
      life,
      maxLife: life,
      size: 2 + Math.random() * 4,
      kind,
    });
  }
}

function addFloat(g: Game, text: string, x: number, y: number, size = 18) {
  g.floatTexts.push({
    text,
    x,
    y,
    life: 0.85,
    maxLife: 0.85,
    size,
  });
}

function randomLane(): Lane {
  const n = Math.floor(Math.random() * 3);
  return n === 0 ? -1 : n === 1 ? 0 : 1;
}

function pickOtherLane(exclude: Lane): Lane {
  const options = ([-1, 0, 1] as Lane[]).filter((l) => l !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}

function spawnPattern(g: Game) {
  const id = g.nextId++;
  const z = 0;
  const difficulty = clamp(g.distance / 2500, 0, 1);
  const roll = Math.random();

  // Every pattern leaves a guaranteed route.
  if (roll < 0.34) {
    g.obstacles.push({
      id,
      lane: randomLane(),
      z,
      kind: Math.random() < 0.7 ? "block" : "bar",
      width: 0.72,
    });
  } else if (roll < 0.55) {
    const blocked = randomLane();
    g.obstacles.push({
      id,
      lane: blocked,
      z,
      kind: "wall",
      width: 0.78,
    });
    if (difficulty > 0.45 && Math.random() < 0.35) {
      const second = pickOtherLane(blocked);
      g.obstacles.push({
        id: g.nextId++,
        lane: second,
        z: z + 105,
        kind: "block",
        width: 0.7,
      });
    }
  } else if (roll < 0.72) {
    const safe = randomLane();
    ([-1, 0, 1] as Lane[]).filter((l) => l !== safe).forEach((lane) => {
      g.obstacles.push({
        id: g.nextId++,
        lane,
        z,
        kind: "wall",
        width: 0.78,
      });
    });
  } else if (roll < 0.86) {
    g.obstacles.push({
      id,
      lane: randomLane(),
      z,
      kind: "gap",
      width: 0.82,
    });
  } else {
    const lane = randomLane();
    g.obstacles.push({
      id,
      lane,
      z,
      kind: "bar",
      width: 0.72,
    });
    if (difficulty > 0.6) {
      const second = pickOtherLane(lane);
      g.obstacles.push({
        id: g.nextId++,
        lane: second,
        z: z + 150,
        kind: "block",
        width: 0.7,
      });
    }
  }

  const gap = clamp(1.08 - g.speed / 1100, 0.52, 0.96);
  g.spawnTimer = gap + Math.random() * 0.32;
}

function spawnPickup(g: Game) {
  const lane = randomLane();
  const kindRoll = Math.random();
  let kind: PickupKind = "coin";

  if (kindRoll < 0.68) kind = "coin";
  else if (kindRoll < 0.78) kind = "magnet";
  else if (kindRoll < 0.88) kind = "shield";
  else if (kindRoll < 0.96) kind = "multiplier";
  else kind = "boost";

  g.pickups.push({
    id: g.nextId++,
    lane,
    z: 40,
    kind,
  });

  g.pickupTimer = kind === "coin" ? 0.22 + Math.random() * 0.28 : 3.2 + Math.random() * 2.5;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export default function RunnerPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game>(initialGame());
  const rafRef = useRef<number | null>(null);
  const hudTimerRef = useRef<number | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const soundRef = useRef(true);

  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [runCoins, setRunCoins] = useState(0);
  const [bank, setBank] = useState(0);
  const [best, setBest] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [combo, setCombo] = useState(0);
  const [power, setPower] = useState({ shield: 0, magnet: 0, multiplier: 0, boost: 0 });
  const [sound, setSound] = useState(true);

  useEffect(() => {
    setBest(loadNumber(BEST_KEY));
    setBank(loadNumber(BANK_KEY));
  }, []);

  const beep = useCallback((frequency: number, duration = 0.06, type: OscillatorType = "sine") => {
    if (!soundRef.current || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioRef.current ?? new AudioCtx();
      audioRef.current = ctx;
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio is enhancement only.
    }
  }, []);

  const syncHud = useCallback(() => {
    const g = gameRef.current;
    setPhase(g.phase);
    setScore(Math.floor(g.score));
    setDistance(Math.floor(g.distance));
    setRunCoins(g.runCoins);
    setMultiplier(g.multiplier);
    setCombo(g.combo);
    setPower({
      shield: g.shield,
      magnet: g.magnet,
      multiplier: g.multiplierTime,
      boost: g.boost,
    });
  }, []);

  const startRun = useCallback(() => {
    const g = initialGame();
    g.phase = "running";
    g.lastFrame = performance.now();
    gameRef.current = g;
    setPhase("running");
    setScore(0);
    setDistance(0);
    setRunCoins(0);
    setMultiplier(1);
    setCombo(0);
    beep(440, 0.08);
    window.setTimeout(() => beep(660, 0.1), 90);
  }, [beep]);

  const finishRun = useCallback(() => {
    const g = gameRef.current;
    if (g.phase === "gameover") return;

    g.phase = "gameover";
    const oldBest = loadNumber(BEST_KEY);
    const newBest = Math.max(oldBest, Math.floor(g.score));
    const oldBank = loadNumber(BANK_KEY);
    const newBank = oldBank + g.runCoins;

    window.localStorage.setItem(BEST_KEY, String(newBest));
    window.localStorage.setItem(BANK_KEY, String(newBank));

    setBest(newBest);
    setBank(newBank);
    setPhase("gameover");
    syncHud();
    beep(150, 0.18, "sawtooth");
  }, [beep, syncHud]);

  const moveLane = useCallback((direction: -1 | 1) => {
    const g = gameRef.current;
    if (g.phase !== "running") return;
    g.laneTarget = clamp(g.laneTarget + direction, -1, 1) as Lane;
    g.lastAction = performance.now();
    beep(260 + (g.laneTarget + 1) * 90, 0.035);
  }, [beep]);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (g.phase !== "running" || g.jumpY > 1 || g.slide > 0) return;
    g.jumpV = JUMP_VELOCITY;
    g.jumpY = 0.001;
    g.lastAction = performance.now();
    beep(520, 0.08);
  }, [beep]);

  const slide = useCallback(() => {
    const g = gameRef.current;
    if (g.phase !== "running" || g.jumpY > 2) return;
    g.slide = SLIDE_DURATION;
    g.lastAction = performance.now();
    beep(180, 0.07, "triangle");
  }, [beep]);

  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (g.phase === "running") {
      g.phase = "paused";
      syncHud();
      return;
    }
    if (g.phase === "paused") {
      g.phase = "running";
      g.lastFrame = performance.now();
      syncHud();
    }
  }, [syncHud]);

  const project = useCallback((z: number, width: number, height: number) => {
    const t = clamp((z - HORIZON_Z) / PLAYER_Z, 0, 1);
    const eased = Math.pow(t, 1.55);
    const horizonY = height * ROAD_TOP;
    const bottomY = height * ROAD_BOTTOM;
    const y = lerp(horizonY, bottomY, eased);
    const half = lerp(width * 0.075, width * 0.47, eased);
    const scale = lerp(0.15, 1.05, eased);
    return { y, half, scale, t: eased };
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, now: number) => {
    const g = gameRef.current;
    const dt = g.lastFrame ? Math.min((now - g.lastFrame) / 1000, 0.033) : 0.016;
    g.lastFrame = now;

    if (g.phase === "running") {
      const speedBoost = g.boost > 0 ? 1.28 : 1;
      const targetSpeed = Math.min(MAX_SPEED, START_SPEED + g.distance * 0.055);
      g.speed = lerp(g.speed, targetSpeed * speedBoost, 1 - Math.pow(0.0001, dt));

      const laneEase = 1 - Math.pow(0.00002, dt);
      g.lane = lerp(g.lane, g.laneTarget, laneEase);

      if (g.jumpY > 0 || g.jumpV > 0) {
        g.jumpV -= GRAVITY * dt;
        g.jumpY += g.jumpV * dt;
        if (g.jumpY <= 0) {
          g.jumpY = 0;
          g.jumpV = 0;
          createParticles(g, width / 2 + laneX(g.lane, width * 0.47), height * ROAD_BOTTOM - 10, "impact", 7);
        }
      }

      if (g.slide > 0) g.slide = Math.max(0, g.slide - dt);
      if (g.shield > 0) g.shield = Math.max(0, g.shield - dt);
      if (g.magnet > 0) g.magnet = Math.max(0, g.magnet - dt);
      if (g.boost > 0) g.boost = Math.max(0, g.boost - dt);
      if (g.multiplierTime > 0) g.multiplierTime = Math.max(0, g.multiplierTime - dt);

      if (g.comboTimer > 0) {
        g.comboTimer -= dt;
        if (g.comboTimer <= 0) g.combo = 0;
      }

      const actualMultiplier = g.multiplierTime > 0 ? Math.min(5, 1 + Math.floor(g.combo / 5)) : 1;
      g.multiplier = actualMultiplier;

      g.distance += g.speed * dt * 0.055;
      g.score += g.speed * dt * 0.22 * g.multiplier;

      g.spawnTimer -= dt;
      if (g.spawnTimer <= 0) spawnPattern(g);

      g.pickupTimer -= dt;
      if (g.pickupTimer <= 0) spawnPickup(g);

      for (const obstacle of g.obstacles) obstacle.z += g.speed * dt;
      for (const pickup of g.pickups) pickup.z += g.speed * dt;

      const playerHalf = width * 0.47;
      const playerX = width / 2 + laneX(g.lane, playerHalf);
      const playerGround = project(PLAYER_Z, width, height).y - g.jumpY * 1.15;

      for (const obstacle of g.obstacles) {
        if (obstacle.z < 86 || obstacle.z > 120) continue;

        const laneDistance = Math.abs(g.lane - obstacle.lane);
        if (laneDistance > 0.38) continue;

        const jumpClear = g.jumpY > (obstacle.kind === "block" ? 0.58 : 0.88);
        const slideClear = g.slide > 0 && obstacleRequiresSlide(obstacle.kind);
        const safe = obstacle.kind === "gap" ? g.jumpY > 0.48 : jumpClear || slideClear;

        if (!safe) {
          if (g.shield > 0) {
            g.shield = 0;
            obstacle.z = 180;
            g.shake = 13;
            g.flash = 0.22;
            g.combo = 0;
            createParticles(g, playerX, playerGround, "impact", 22);
            addFloat(g, "SHIELD SAVE", playerX, playerGround - 80, 17);
            beep(120, 0.14, "square");
          } else {
            g.shake = 18;
            g.flash = 0.32;
            createParticles(g, playerX, playerGround, "impact", 34);
            finishRun();
            break;
          }
        }
      }

      for (const pickup of g.pickups) {
        if (pickup.collected || pickup.z < 88 || pickup.z > 118) continue;

        const dx = Math.abs(g.lane - pickup.lane);
        const magnetCatch = g.magnet > 0 && pickup.z > 55 && dx < 1.25;
        if (dx < 0.42 || magnetCatch) {
          pickup.collected = true;

          if (pickup.kind === "coin") {
            g.runCoins += 1;
            g.score += 25 * g.multiplier;
            g.combo += 1;
            g.comboTimer = 2.2;
            addFloat(g, "+25", playerX, playerGround - 65, 15);
            createParticles(g, playerX, playerGround - 45, "coin", 7);
            beep(740, 0.045);
          } else if (pickup.kind === "shield") {
            g.shield = 12;
            addFloat(g, "SHIELD", playerX, playerGround - 65);
            createParticles(g, playerX, playerGround - 45, "coin", 12);
            beep(480, 0.09);
          } else if (pickup.kind === "magnet") {
            g.magnet = 9;
            addFloat(g, "MAGNET", playerX, playerGround - 65);
            beep(620, 0.09);
          } else if (pickup.kind === "multiplier") {
            g.multiplierTime = 12;
            g.combo = Math.max(g.combo, 5);
            g.comboTimer = 3;
            addFloat(g, "2× SCORE", playerX, playerGround - 65);
            beep(820, 0.11);
          } else {
            g.boost = 5;
            addFloat(g, "BOOST", playerX, playerGround - 65);
            createParticles(g, playerX, playerGround - 45, "speed", 15);
            beep(950, 0.1);
          }
        }
      }

      for (const obstacle of g.obstacles) {
        if (obstacle.z > 125 && obstacle.z < 150) {
          const near = Math.abs(g.lane - obstacle.lane);
          if (near < 0.62 && near > 0.38) {
            g.score += 40 * g.multiplier;
            g.combo += 1;
            g.comboTimer = 2.2;
            addFloat(g, "NEAR MISS", playerX, playerGround - 105, 14);
          } else if (near >= 0.62) {
            g.combo += 1;
            g.comboTimer = 2.2;
          }
        }
      }

      if (g.combo >= 5 && g.combo % 5 === 0 && performance.now() - g.lastAction < 80) {
        addFloat(g, `${g.combo} COMBO`, playerX, playerGround - 125, 20);
        g.score += 100 * g.multiplier;
      }

      if (g.distance >= g.nextMilestone) {
        g.score += 300 * g.multiplier;
        addFloat(g, `${g.nextMilestone}m`, width / 2, height * 0.34, 27);
        createParticles(g, width / 2, height * 0.34, "milestone", 22);
        g.flash = 0.18;
        g.nextMilestone += 250;
        beep(560, 0.08);
        window.setTimeout(() => beep(840, 0.11), 85);
      }
    }

    // Background
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#071329");
    sky.addColorStop(0.55, "#0b2850");
    sky.addColorStop(1, "#07101f");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Horizon glow
    const glow = ctx.createRadialGradient(width / 2, height * 0.23, 5, width / 2, height * 0.23, width * 0.48);
    glow.addColorStop(0, "rgba(68,170,255,0.24)");
    glow.addColorStop(1, "rgba(68,170,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height * 0.6);

    // Moon/sun
    ctx.fillStyle = "rgba(135,210,255,0.85)";
    ctx.beginPath();
    ctx.arc(width * 0.79, height * 0.16, Math.min(width, height) * 0.035, 0, Math.PI * 2);
    ctx.fill();

    // Distant hills
    ctx.fillStyle = "#091a31";
    ctx.beginPath();
    ctx.moveTo(0, height * 0.39);
    for (let x = 0; x <= width; x += width / 8) {
      const y = height * (0.31 + ((x / width) * 17 % 3) * 0.025);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height * 0.56);
    ctx.lineTo(0, height * 0.56);
    ctx.closePath();
    ctx.fill();

    // Road
    const topY = height * ROAD_TOP;
    const bottomY = height * ROAD_BOTTOM;
    const topHalf = width * 0.075;
    const bottomHalf = width * 0.47;

    ctx.fillStyle = "#101a29";
    ctx.beginPath();
    ctx.moveTo(width / 2 - topHalf, topY);
    ctx.lineTo(width / 2 + topHalf, topY);
    ctx.lineTo(width / 2 + bottomHalf, bottomY);
    ctx.lineTo(width / 2 - bottomHalf, bottomY);
    ctx.closePath();
    ctx.fill();

    // Road edges
    ctx.strokeStyle = "rgba(100,210,255,0.42)";
    ctx.lineWidth = Math.max(2, width * 0.004);
    ctx.beginPath();
    ctx.moveTo(width / 2 - topHalf, topY);
    ctx.lineTo(width / 2 - bottomHalf, bottomY);
    ctx.moveTo(width / 2 + topHalf, topY);
    ctx.lineTo(width / 2 + bottomHalf, bottomY);
    ctx.stroke();

    // Lane dividers, correctly aligned with lane centers.
    ctx.strokeStyle = "rgba(135,205,255,0.18)";
    ctx.lineWidth = 1;
    for (const divider of [-1, 1]) {
      const topX = width / 2 + divider * topHalf * (LANE_DIVIDER / LANE_CENTER);
      const bottomX = width / 2 + divider * bottomHalf * (LANE_DIVIDER / LANE_CENTER);
      ctx.beginPath();
      ctx.moveTo(topX, topY);
      ctx.lineTo(bottomX, bottomY);
      ctx.stroke();
    }

    // Moving road markers
    const markerOffset = (g.distance * 0.55) % 1;
    for (let i = 0; i < 13; i++) {
      const t = (i / 13 + markerOffset / 13) % 1;
      const eased = Math.pow(t, 1.7);
      const y = lerp(topY + 8, bottomY - 8, eased);
      const half = lerp(topHalf, bottomHalf, eased);
      const markerW = Math.max(2, eased * 10);
      ctx.fillStyle = "rgba(150,215,255,0.12)";
      ctx.fillRect(width / 2 - half - markerW * 1.5, y, markerW, Math.max(2, eased * 7));
      ctx.fillRect(width / 2 + half + markerW * 0.5, y, markerW, Math.max(2, eased * 7));
    }

    // Obstacles
    const visible = [...g.obstacles].sort((a, b) => b.z - a.z);
    for (const obstacle of visible) {
      if (obstacle.z < 0 || obstacle.z > 900) continue;
      const p = project(obstacle.z, width, height);
      const x = width / 2 + laneX(obstacle.lane, p.half);
      const laneWidth = (p.half * 2) / 3;
      const ow = laneWidth * obstacle.width;
      const h = obstacle.kind === "bar" ? p.scale * 46 : p.scale * 72;

      if (obstacle.kind === "gap") {
        ctx.fillStyle = "rgba(0,0,0,0.9)";
        roundRect(ctx, x - ow / 2, p.y - 5, ow, 10 + p.scale * 10, 4);
        ctx.fill();
        ctx.strokeStyle = "rgba(71,190,255,0.4)";
        ctx.stroke();
        continue;
      }

      ctx.save();
      if (obstacle.kind === "bar") {
        ctx.fillStyle = "#e9b44c";
        roundRect(ctx, x - ow / 2, p.y - h, ow, h * 0.35, 5);
        ctx.fill();
        ctx.fillStyle = "#6d4720";
        ctx.fillRect(x - ow / 2 + ow * 0.08, p.y - h * 0.7, Math.max(3, ow * 0.08), h * 0.7);
        ctx.fillRect(x + ow / 2 - Math.max(3, ow * 0.16), p.y - h * 0.7, Math.max(3, ow * 0.08), h * 0.7);
      } else {
        const wall = obstacle.kind === "wall";
        ctx.fillStyle = wall ? "#a63d4a" : "#e15a38";
        roundRect(ctx, x - ow / 2, p.y - h, ow, h, 7);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        ctx.fillRect(x - ow * 0.35, p.y - h * 0.78, ow * 0.7, Math.max(2, h * 0.08));
        ctx.fillStyle = wall ? "rgba(255,130,130,0.24)" : "rgba(255,210,130,0.22)";
        ctx.fillRect(x - ow * 0.35, p.y - h * 0.56, ow * 0.7, Math.max(2, h * 0.05));
      }
      ctx.restore();
    }

    // Pickups
    for (const pickup of g.pickups) {
      if (pickup.collected || pickup.z < 0 || pickup.z > 800) continue;
      const p = project(pickup.z, width, height);
      const x = width / 2 + laneX(pickup.lane, p.half);
      const r = Math.max(4, 11 * p.scale);
      const bob = Math.sin(now / 160 + pickup.id) * r * 0.35;

      ctx.save();
      ctx.translate(x, p.y - r * 1.8 + bob);
      ctx.rotate(now / 500 + pickup.id);
      if (pickup.kind === "coin") {
        ctx.fillStyle = "#ffd45c";
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#8f6510";
        ctx.font = `bold ${Math.max(7, r)}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("V", 0, 1);
      } else {
        const labels: Record<Exclude<PickupKind, "coin">, string> = {
          shield: "S",
          magnet: "M",
          multiplier: "2",
          boost: "⚡",
        };
        ctx.fillStyle =
          pickup.kind === "shield"
            ? "#65e6ff"
            : pickup.kind === "magnet"
              ? "#c48cff"
              : pickup.kind === "multiplier"
                ? "#ffcc66"
                : "#7dff9b";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = r * 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#08121f";
        ctx.font = `900 ${Math.max(7, r * 0.85)}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(labels[pickup.kind], 0, 1);
      }
      ctx.restore();
    }

    // Player
    const playerP = project(PLAYER_Z, width, height);
    const px = width / 2 + laneX(g.lane, playerP.half);
    const py = playerP.y - g.jumpY * 1.15;
    const slideScale = g.slide > 0 ? 0.62 : 1;
    const bodyH = 64 * slideScale;
    const bodyW = 30;

    ctx.save();
    if (g.shake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * g.shake,
        (Math.random() - 0.5) * g.shake
      );
      g.shake = Math.max(0, g.shake - 0.8);
    }

    if (g.boost > 0) {
      ctx.fillStyle = "rgba(120,255,170,0.18)";
      ctx.beginPath();
      ctx.ellipse(px, py + 5, bodyW * 1.7, bodyH * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (g.shield > 0) {
      ctx.strokeStyle = "rgba(90,225,255,0.9)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#55ddff";
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(px, py - bodyH * 0.42, 31, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.34)";
    ctx.beginPath();
    ctx.ellipse(px, playerP.y + 4, 22 + g.jumpY * 0.06, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Character
    ctx.fillStyle = "#65c9ff";
    roundRect(ctx, px - bodyW / 2, py - bodyH, bodyW, bodyH, 10);
    ctx.fill();
    ctx.fillStyle = "#e8f5ff";
    ctx.beginPath();
    ctx.arc(px, py - bodyH - 8, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0a1b30";
    ctx.beginPath();
    ctx.arc(px - 4, py - bodyH - 9, 2, 0, Math.PI * 2);
    ctx.arc(px + 4, py - bodyH - 9, 2, 0, Math.PI * 2);
    ctx.fill();

    // Running legs
    if (g.slide <= 0) {
      const stride = Math.sin(now / 85) * 7;
      ctx.strokeStyle = "#b9e8ff";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(px - 6, py - 2);
      ctx.lineTo(px - 10 + stride, py + 15);
      ctx.moveTo(px + 6, py - 2);
      ctx.lineTo(px + 10 - stride, py + 15);
      ctx.stroke();
    }

    ctx.restore();

    // Particles
    for (const particle of g.particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 80 * dt;
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle =
        particle.kind === "coin"
          ? "#ffd45c"
          : particle.kind === "milestone"
            ? "#7fe9ff"
            : "#9bdcff";
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    g.particles = g.particles.filter((p) => p.life > 0);

    // Floating feedback
    for (const item of g.floatTexts) {
      item.life -= dt;
      item.y -= 28 * dt;
      const alpha = clamp(item.life / item.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#e8f8ff";
      ctx.font = `900 ${item.size}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.shadowColor = "#48c8ff";
      ctx.shadowBlur = 10;
      ctx.fillText(item.text, item.x, item.y);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    g.floatTexts = g.floatTexts.filter((p) => p.life > 0);

    // Speed lines at higher speed
    if (g.phase === "running" && g.speed > 400) {
      ctx.strokeStyle = `rgba(145,220,255,${clamp((g.speed - 400) / 1200, 0.05, 0.2)})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const x = (i * width * 0.13 + (g.distance * 11) % width) % width;
        const y = height * (0.25 + ((i * 0.071) % 0.6));
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 12, y + 26);
        ctx.stroke();
      }
    }

    // Vignette
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.25,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.72
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.44)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    if (g.flash > 0) {
      ctx.fillStyle = `rgba(130,225,255,${g.flash})`;
      ctx.fillRect(0, 0, width, height);
      g.flash = Math.max(0, g.flash - dt);
    }
  }, [finishRun, project]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const frame = (now: number) => {
      const rect = canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height, now);
      rafRef.current = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(frame);

    hudTimerRef.current = window.setInterval(syncHud, 100);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hudTimerRef.current) window.clearInterval(hudTimerRef.current);
    };
  }, [draw, syncHud]);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (["arrowleft", "arrowright", "arrowup", "arrowdown", " ", "a", "d", "w", "s", "p", "escape"].includes(key)) {
        event.preventDefault();
      }

      if (key === "arrowleft" || key === "a") moveLane(-1);
      else if (key === "arrowright" || key === "d") moveLane(1);
      else if (key === "arrowup" || key === "w" || key === " ") jump();
      else if (key === "arrowdown" || key === "s") slide();
      else if (key === "p" || key === "escape") togglePause();
    };

    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, moveLane, slide, togglePause]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    swipeStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (Math.max(ax, ay) < 24) {
      jump();
      return;
    }

    if (ax > ay) moveLane(dx > 0 ? 1 : -1);
    else if (dy < 0) jump();
    else slide();
  };

  const actionButton = (label: string, action: () => void, extra = "") => (
    <button
      type="button"
      className={`runnerAction ${extra}`}
      onPointerDown={(event) => {
        event.preventDefault();
        action();
      }}
      aria-label={label}
    >
      {label}
    </button>
  );

  return (
    <main className="runnerPage">
      <style jsx>{`
        .runnerPage {
          min-height: 100dvh;
          background:
            radial-gradient(circle at 50% 0%, rgba(35, 129, 210, .13), transparent 34rem),
            #050a12;
          color: #edf8ff;
          padding: 22px clamp(12px, 3vw, 34px) 30px;
          box-sizing: border-box;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .runnerShell {
          width: min(1180px, 100%);
          margin: 0 auto;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brandMark {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: linear-gradient(145deg, #5fd7ff, #2364ff);
          color: #04101d;
          font-weight: 950;
          box-shadow: 0 12px 35px rgba(50, 170, 255, .2);
        }
        .eyebrow {
          font-size: 11px;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: #6f91ad;
          font-weight: 800;
        }
        h1 {
          margin: 1px 0 0;
          font-size: clamp(22px, 3vw, 30px);
          line-height: 1;
          letter-spacing: -.035em;
        }
        .topActions {
          display: flex;
          gap: 8px;
        }
        .iconButton {
          border: 1px solid rgba(157, 213, 244, .12);
          background: rgba(12, 24, 39, .82);
          color: #dff5ff;
          border-radius: 11px;
          min-width: 42px;
          height: 42px;
          cursor: pointer;
        }
        .iconButton:hover {
          background: rgba(24, 45, 68, .92);
        }
        .gameCard {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(122, 202, 255, .14);
          border-radius: 25px;
          background: #07101c;
          box-shadow: 0 30px 90px rgba(0, 0, 0, .38);
        }
        .hud {
          position: absolute;
          z-index: 4;
          inset: 14px 14px auto;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          pointer-events: none;
        }
        .hudItem {
          padding: 9px 11px;
          border: 1px solid rgba(171, 222, 250, .1);
          background: rgba(4, 12, 22, .64);
          backdrop-filter: blur(12px);
          border-radius: 12px;
        }
        .hudLabel {
          color: #7894aa;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .hudValue {
          margin-top: 2px;
          font-size: 17px;
          font-weight: 900;
          font-variant-numeric: tabular-nums;
        }
        .canvasWrap {
          position: relative;
          height: min(76dvh, 760px);
          min-height: 520px;
          touch-action: none;
          user-select: none;
        }
        canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
        .powerBar {
          position: absolute;
          z-index: 4;
          left: 16px;
          bottom: 16px;
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          pointer-events: none;
        }
        .power {
          padding: 7px 9px;
          border-radius: 9px;
          border: 1px solid rgba(180, 230, 255, .13);
          background: rgba(4, 12, 22, .72);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .04em;
        }
        .overlay {
          position: absolute;
          z-index: 8;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 24px;
          background: linear-gradient(180deg, rgba(2, 7, 13, .24), rgba(2, 7, 13, .72));
        }
        .panel {
          width: min(460px, 100%);
          text-align: center;
          padding: 28px;
          border: 1px solid rgba(144, 220, 255, .16);
          border-radius: 22px;
          background: rgba(5, 15, 27, .86);
          backdrop-filter: blur(18px);
          box-shadow: 0 30px 80px rgba(0,0,0,.4);
        }
        .panelKicker {
          color: #68d5ff;
          font-size: 11px;
          letter-spacing: .18em;
          font-weight: 900;
          text-transform: uppercase;
        }
        .panel h2 {
          margin: 8px 0 8px;
          font-size: clamp(32px, 7vw, 54px);
          letter-spacing: -.055em;
        }
        .panel p {
          color: #91a9bb;
          margin: 0 auto 20px;
          max-width: 350px;
          line-height: 1.55;
        }
        .primary {
          width: 100%;
          border: 0;
          border-radius: 13px;
          padding: 13px 16px;
          background: linear-gradient(135deg, #64ddff, #3777ff);
          color: #04101c;
          font-weight: 950;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 14px 35px rgba(50, 160, 255, .22);
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
          margin: 0 0 16px;
        }
        .stat {
          border-radius: 11px;
          background: rgba(255,255,255,.045);
          padding: 10px 6px;
        }
        .stat small {
          display: block;
          color: #718ca1;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: .1em;
        }
        .stat strong {
          display: block;
          margin-top: 3px;
          font-size: 17px;
        }
        .touchControls {
          position: absolute;
          z-index: 7;
          right: 14px;
          bottom: 14px;
          display: grid;
          grid-template-columns: repeat(3, 48px);
          grid-template-rows: repeat(2, 48px);
          gap: 6px;
        }
        .runnerAction {
          border: 1px solid rgba(180, 230, 255, .15);
          background: rgba(5, 15, 27, .68);
          backdrop-filter: blur(10px);
          color: #dff7ff;
          border-radius: 13px;
          font-weight: 950;
          cursor: pointer;
          touch-action: manipulation;
        }
        .runnerAction:active {
          transform: scale(.94);
          background: rgba(60, 140, 200, .55);
        }
        .left { grid-column: 1; grid-row: 2; }
        .jump { grid-column: 2; grid-row: 1; }
        .right { grid-column: 3; grid-row: 2; }
        .slide { grid-column: 2; grid-row: 2; }
        .instructions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px 16px;
          margin-top: 13px;
          color: #6d879b;
          font-size: 11px;
        }
        .instructions b {
          color: #a6bfd0;
        }
        @media (max-width: 680px) {
          .runnerPage {
            padding: 10px 8px 18px;
          }
          .topbar {
            margin-bottom: 9px;
          }
          .brandMark {
            width: 36px;
            height: 36px;
            border-radius: 10px;
          }
          h1 {
            font-size: 21px;
          }
          .canvasWrap {
            height: calc(100dvh - 145px);
            min-height: 470px;
          }
          .hud {
            inset: 9px 9px auto;
            grid-template-columns: repeat(2, 1fr);
          }
          .hudItem {
            padding: 7px 9px;
          }
          .touchControls {
            right: 10px;
            bottom: 10px;
          }
          .instructions {
            display: none;
          }
          .panel {
            padding: 22px 18px;
          }
        }
        @media (min-width: 681px) {
          .touchControls {
            opacity: .7;
          }
        }
      `}</style>

      <div className="runnerShell">
        <header className="topbar">
          <div className="brand">
            <div className="brandMark">V</div>
            <div>
              <div className="eyebrow">VGB Arcade</div>
              <h1>Runner</h1>
            </div>
          </div>
          <div className="topActions">
            <button
              type="button"
              className="iconButton"
              onClick={() => {
                setSound((value) => !value);
                soundRef.current = !soundRef.current;
              }}
              aria-label={sound ? "Mute game sound" : "Enable game sound"}
              title={sound ? "Mute sound" : "Enable sound"}
            >
              {sound ? "🔊" : "🔇"}
            </button>
            <button
              type="button"
              className="iconButton"
              onClick={togglePause}
              aria-label={phase === "paused" ? "Resume game" : "Pause game"}
              title={phase === "paused" ? "Resume" : "Pause"}
            >
              {phase === "paused" ? "▶" : "Ⅱ"}
            </button>
          </div>
        </header>

        <section className="gameCard" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <div className="hud">
            <div className="hudItem">
              <div className="hudLabel">Score</div>
              <div className="hudValue">{formatNumber(score)}</div>
            </div>
            <div className="hudItem">
              <div className="hudLabel">Distance</div>
              <div className="hudValue">{distance}m</div>
            </div>
            <div className="hudItem">
              <div className="hudLabel">Coins</div>
              <div className="hudValue">{runCoins}</div>
            </div>
            <div className="hudItem">
              <div className="hudLabel">Multiplier</div>
              <div className="hudValue">
                ×{multiplier}
                {combo >= 5 ? ` · ${combo}` : ""}
              </div>
            </div>
          </div>

          <div className="canvasWrap">
            <canvas ref={canvasRef} />

            <div className="powerBar">
              {power.shield > 0 && <div className="power">🛡 {power.shield.toFixed(1)}s</div>}
              {power.magnet > 0 && <div className="power">🧲 {power.magnet.toFixed(1)}s</div>}
              {power.multiplier > 0 && <div className="power">2× {power.multiplier.toFixed(1)}s</div>}
              {power.boost > 0 && <div className="power">⚡ {power.boost.toFixed(1)}s</div>}
            </div>

            <div className="touchControls" onPointerDown={(event) => event.stopPropagation()} onPointerUp={(event) => event.stopPropagation()}>
              {actionButton("←", () => moveLane(-1), "left")}
              {actionButton("↑", jump, "jump")}
              {actionButton("→", () => moveLane(1), "right")}
              {actionButton("↓", slide, "slide")}
            </div>

            {phase === "ready" && (
              <div className="overlay">
                <div className="panel">
                  <div className="panelKicker">Endless campus run</div>
                  <h2>Run.</h2>
                  <p>
                    Three lanes. One runner. Jump barriers, slide under bars,
                    change lanes around walls, and keep the distance climbing.
                  </p>
                  <div className="stats">
                    <div className="stat"><small>Best</small><strong>{formatNumber(best)}</strong></div>
                    <div className="stat"><small>Bank</small><strong>{formatNumber(bank)}</strong></div>
                    <div className="stat"><small>Controls</small><strong>⌨ + Touch</strong></div>
                  </div>
                  <button type="button" className="primary" onClick={startRun}>
                    START RUN
                  </button>
                </div>
              </div>
            )}

            {phase === "paused" && (
              <div className="overlay">
                <div className="panel">
                  <div className="panelKicker">Run paused</div>
                  <h2>Hold.</h2>
                  <p>Your run is frozen. Nothing is moving while humanity briefly remembers the concept of stopping.</p>
                  <button type="button" className="primary" onClick={togglePause}>
                    RESUME
                  </button>
                </div>
              </div>
            )}

            {phase === "gameover" && (
              <div className="overlay">
                <div className="panel">
                  <div className="panelKicker">Run complete</div>
                  <h2>{score >= best ? "New best." : "Run over."}</h2>
                  <p>You made it {distance} metres. The road remains undefeated.</p>
                  <div className="stats">
                    <div className="stat"><small>Score</small><strong>{formatNumber(score)}</strong></div>
                    <div className="stat"><small>Distance</small><strong>{distance}m</strong></div>
                    <div className="stat"><small>Coins</small><strong>+{runCoins}</strong></div>
                  </div>
                  <button type="button" className="primary" onClick={startRun}>
                    RUN AGAIN
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="instructions">
          <span><b>← → / A D</b> change lane</span>
          <span><b>↑ / W / Space</b> jump</span>
          <span><b>↓ / S</b> slide</span>
          <span><b>Swipe</b> on touch</span>
        </div>
      </div>
    </main>
  );
}
