"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Lane = -1 | 0 | 1;
type Phase = "menu" | "playing" | "paused" | "gameover";
type ObstacleKind = "block" | "bar" | "wall" | "gap";
type PickupKind = "coin" | "magnet" | "shield" | "multiplier" | "boost";

type Obstacle = {
  id: number;
  lane: Lane;
  z: number;
  kind: ObstacleKind;
  width: number;
  height: number;
  passed: boolean;
};

type Pickup = {
  id: number;
  lane: Lane;
  z: number;
  kind: PickupKind;
  collected: boolean;
  phase: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
};

type Game = {
  phase: Phase;
  last: number;
  elapsed: number;
  distance: number;
  score: number;
  coins: number;
  multiplier: number;
  speed: number;
  targetSpeed: number;
  lane: number;
  targetLane: number;
  jumpY: number;
  jumpV: number;
  sliding: boolean;
  slideUntil: number;
  shield: number;
  magnetUntil: number;
  boostUntil: number;
  combo: number;
  comboUntil: number;
  spawnTimer: number;
  pickupTimer: number;
  nextId: number;
  obstacles: Obstacle[];
  pickups: Pickup[];
  particles: Particle[];
  shake: number;
  flash: number;
  milestone: number;
  best: number;
};

const BEST_KEY = "vgb-runner-best-v2";
const COINS_KEY = "vgb-runner-coins-v2";
const WORLD_DEPTH = 1000;
const PLAYER_Z = 115;
const START_SPEED = 235;
const MAX_SPEED = 590;
const LANES: Lane[] = [-1, 0, 1];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const laneIndex = (lane: number) => lane + 1;

function laneX(lane: number, roadHalf: number) {
  return lane * roadHalf * 0.34;
}

function freshGame(best: number): Game {
  return {
    phase: "menu",
    last: 0,
    elapsed: 0,
    distance: 0,
    score: 0,
    coins: 0,
    multiplier: 1,
    speed: START_SPEED,
    targetSpeed: START_SPEED,
    lane: 0,
    targetLane: 0,
    jumpY: 0,
    jumpV: 0,
    sliding: false,
    slideUntil: 0,
    shield: 0,
    magnetUntil: 0,
    boostUntil: 0,
    combo: 0,
    comboUntil: 0,
    spawnTimer: 0.7,
    pickupTimer: 0.8,
    nextId: 1,
    obstacles: [],
    pickups: [],
    particles: [],
    shake: 0,
    flash: 0,
    milestone: 250,
    best,
  };
}

function spawnObstacle(g: Game) {
  const difficulty = clamp(g.elapsed / 85, 0, 1);
  const patterns = [
    [-1], [0], [1],
    [-1, 0], [0, 1], [-1, 1],
    difficulty > 0.18 ? [-1, 0, 1] : [-1],
  ] as Lane[][];
  const lanes = patterns[Math.floor(Math.random() * patterns.length)];
  const kinds: ObstacleKind[] = ["block", "block", "bar", "wall", "gap"];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  lanes.forEach((lane) => {
    g.obstacles.push({
      id: g.nextId++,
      lane,
      z: WORLD_DEPTH + Math.random() * 70,
      kind,
      width: kind === "wall" ? 0.42 : 0.34,
      height: kind === "bar" ? 0.23 : kind === "gap" ? 0.08 : 0.48,
      passed: false,
    });
  });
}

function spawnPickup(g: Game) {
  const roll = Math.random();
  const kind: PickupKind = roll < 0.72 ? "coin" : roll < 0.82 ? "magnet" : roll < 0.91 ? "shield" : roll < 0.97 ? "multiplier" : "boost";
  const lane = LANES[Math.floor(Math.random() * LANES.length)];
  const count = kind === "coin" ? 3 + Math.floor(Math.random() * 4) : 1;
  for (let i = 0; i < count; i++) {
    g.pickups.push({
      id: g.nextId++,
      lane: (kind === "coin" && i > 0 ? lane : lane) as Lane,
      z: WORLD_DEPTH + 90 + i * 54,
      kind,
      collected: false,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function burst(g: Game, x: number, y: number, amount = 10) {
  for (let i = 0; i < amount; i++) {
    const maxLife = 0.35 + Math.random() * 0.45;
    g.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 180,
      vy: (Math.random() - 0.65) * 170,
      life: maxLife,
      maxLife,
      size: 2 + Math.random() * 4,
    });
  }
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export default function RunnerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const rafRef = useRef<number | null>(null);
  const hudClockRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [phase, setPhase] = useState<Phase>("menu");
  const [hud, setHud] = useState({ score: 0, distance: 0, coins: 0, multiplier: 1, best: 0, shield: 0, power: "" });
  const [sound, setSound] = useState(true);

  const readBest = useCallback(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem(BEST_KEY) || 0);
  }, []);

  useEffect(() => {
    const best = readBest();
    gameRef.current = freshGame(best);
    setHud((h) => ({ ...h, best }));
  }, [readBest]);

  const updateHud = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    const power = g.boostUntil > g.elapsed ? "BOOST" : g.magnetUntil > g.elapsed ? "MAGNET" : g.shield > 0 ? "SHIELD" : "";
    setHud({
      score: Math.floor(g.score),
      distance: Math.floor(g.distance),
      coins: g.coins,
      multiplier: g.multiplier,
      best: g.best,
      shield: g.shield,
      power,
    });
  }, []);

  const setGamePhase = useCallback((next: Phase) => {
    const g = gameRef.current;
    if (!g) return;
    g.phase = next;
    setPhase(next);
    updateHud();
  }, [updateHud]);

  const reset = useCallback(() => {
    const best = readBest();
    gameRef.current = freshGame(best);
    setPhase("menu");
    updateHud();
  }, [readBest, updateHud]);

  const start = useCallback(() => {
    const g = gameRef.current || freshGame(readBest());
    g.phase = "playing";
    g.last = performance.now();
    g.elapsed = 0;
    g.distance = 0;
    g.score = 0;
    g.coins = 0;
    g.multiplier = 1;
    g.speed = START_SPEED;
    g.targetSpeed = START_SPEED;
    g.lane = 0;
    g.targetLane = 0;
    g.jumpY = 0;
    g.jumpV = 0;
    g.sliding = false;
    g.slideUntil = 0;
    g.shield = 0;
    g.magnetUntil = 0;
    g.boostUntil = 0;
    g.combo = 0;
    g.comboUntil = 0;
    g.spawnTimer = 0.65;
    g.pickupTimer = 0.8;
    g.obstacles = [];
    g.pickups = [];
    g.particles = [];
    g.shake = 0;
    g.flash = 0;
    g.milestone = 250;
    gameRef.current = g;
    setPhase("playing");
    updateHud();
  }, [readBest, updateHud]);

  const move = useCallback((direction: -1 | 1) => {
    const g = gameRef.current;
    if (!g || g.phase !== "playing") return;
    g.targetLane = clamp(g.targetLane + direction, -1, 1);
  }, []);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.phase !== "playing") return;
    if (g.jumpY <= 0.01 && !g.sliding) {
      g.jumpV = 575;
      g.jumpY = 1;
    }
  }, []);

  const slide = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.phase !== "playing") return;
    if (g.jumpY <= 0.01) {
      g.sliding = true;
      g.slideUntil = g.elapsed + 0.62;
    }
  }, []);

  const pause = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    if (g.phase === "playing") {
      g.phase = "paused";
      setPhase("paused");
    } else if (g.phase === "paused") {
      g.phase = "playing";
      g.last = performance.now();
      setPhase("playing");
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(e.key.toLowerCase())) e.preventDefault();
      if (k === "arrowleft" || k === "a") move(-1);
      else if (k === "arrowright" || k === "d") move(1);
      else if (k === "arrowup" || k === "w" || k === " ") jump();
      else if (k === "arrowdown" || k === "s") slide();
      else if (k === "p" || k === "escape") pause();
      else if (k === "enter" && (phase === "menu" || phase === "gameover")) start();
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, move, pause, phase, slide, start]);

  const fail = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    g.phase = "gameover";
    g.shake = 14;
    g.flash = 0.22;
    const score = Math.floor(g.score);
    const best = Math.max(g.best, score);
    g.best = best;
    localStorage.setItem(BEST_KEY, String(best));
    const banked = Number(localStorage.getItem(COINS_KEY) || 0) + g.coins;
    localStorage.setItem(COINS_KEY, String(banked));
    burst(g, 0, 0, 26);
    setPhase("gameover");
    updateHud();
  }, [updateHud]);

  const collect = useCallback((p: Pickup, g: Game) => {
    p.collected = true;
    if (p.kind === "coin") {
      g.coins += 1;
      g.score += 25 * g.multiplier;
      g.combo += 1;
      g.comboUntil = g.elapsed + 1.7;
    } else if (p.kind === "magnet") {
      g.magnetUntil = g.elapsed + 7;
      g.score += 100;
    } else if (p.kind === "shield") {
      g.shield = 1;
      g.score += 120;
    } else if (p.kind === "multiplier") {
      g.multiplier = clamp(g.multiplier + 1, 1, 5);
      g.score += 175;
    } else if (p.kind === "boost") {
      g.boostUntil = g.elapsed + 4;
      g.score += 150;
    }
    burst(g, 0, 0, p.kind === "coin" ? 5 : 14);
    g.flash = 0.08;
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, g: Game, now: number) => {
    const dpr = window.devicePixelRatio || 1;
    const horizon = h * 0.39;
    const roadBottom = Math.min(w * 0.72, 780);
    const roadTop = Math.max(w * 0.075, 86);
    const cx = w / 2;
    const roadHalfBottom = roadBottom / 2;
    const roadHalfTop = roadTop / 2;
    const tNow = now * 0.001;

    ctx.save();
    if (g.shake > 0) {
      const s = g.shake * (0.35 + 0.65 * Math.random());
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#07152d");
    sky.addColorStop(0.48, "#12345f");
    sky.addColorStop(1, "#07101e");
    ctx.fillStyle = sky;
    ctx.fillRect(-20, -20, w + 40, h + 40);

    const glow = ctx.createRadialGradient(cx, horizon * 0.55, 8, cx, horizon * 0.55, w * 0.52);
    glow.addColorStop(0, "rgba(65,180,255,.25)");
    glow.addColorStop(1, "rgba(65,180,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Parallax skyline / hills.
    for (let layer = 0; layer < 3; layer++) {
      const base = horizon + 35 + layer * 32;
      ctx.beginPath();
      ctx.moveTo(0, base + 80);
      for (let x = 0; x <= w + 40; x += 42) {
        const n = Math.sin(x * 0.013 + layer * 1.7) * (18 + layer * 9) + Math.sin(x * 0.031) * 9;
        ctx.lineTo(x, base + n);
      }
      ctx.lineTo(w, base + 100);
      ctx.lineTo(0, base + 100);
      ctx.closePath();
      ctx.fillStyle = `rgba(5,14,30,${0.5 + layer * 0.12})`;
      ctx.fill();
    }

    // Road shoulders.
    ctx.beginPath();
    ctx.moveTo(cx - roadHalfTop, horizon);
    ctx.lineTo(cx + roadHalfTop, horizon);
    ctx.lineTo(cx + roadHalfBottom, h + 20);
    ctx.lineTo(cx - roadHalfBottom, h + 20);
    ctx.closePath();
    const road = ctx.createLinearGradient(0, horizon, 0, h);
    road.addColorStop(0, "#16263d");
    road.addColorStop(1, "#08111e");
    ctx.fillStyle = road;
    ctx.fill();

    ctx.strokeStyle = "rgba(74,198,255,.35)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - roadHalfTop, horizon);
    ctx.lineTo(cx - roadHalfBottom, h);
    ctx.moveTo(cx + roadHalfTop, horizon);
    ctx.lineTo(cx + roadHalfBottom, h);
    ctx.stroke();

    // Lane separators with moving perspective dashes.
    const scroll = (g.distance * 0.7) % 80;
    for (const lane of [-0.5, 0.5]) {
      for (let i = -1; i < 17; i++) {
        const z = i * 80 + scroll + 20;
        const p = clamp(1 - z / WORLD_DEPTH, 0, 1);
        const y = lerp(horizon, h + 50, Math.pow(p, 1.35));
        const half = lerp(roadHalfTop, roadHalfBottom, p);
        const x = cx + lane * half * 0.68;
        const len = lerp(4, 42, p);
        ctx.strokeStyle = `rgba(148,219,255,${0.15 + p * 0.38})`;
        ctx.lineWidth = lerp(1, 4, p);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + len);
        ctx.stroke();
      }
    }

    // Side markers.
    for (let i = 0; i < 13; i++) {
      const z = (i * 90 + scroll * 1.5) % (WORLD_DEPTH + 100);
      const p = clamp(1 - z / WORLD_DEPTH, 0, 1);
      const y = lerp(horizon, h, Math.pow(p, 1.35));
      const half = lerp(roadHalfTop, roadHalfBottom, p);
      const size = lerp(3, 12, p);
      ctx.fillStyle = `rgba(69,190,255,${0.18 + p * 0.55})`;
      ctx.fillRect(cx - half - size * 2, y, size, size);
      ctx.fillRect(cx + half + size, y, size, size);
    }

    const project = (z: number) => {
      const p = clamp(1 - z / WORLD_DEPTH, 0, 1);
      const y = lerp(horizon, h * 0.98, Math.pow(p, 1.28));
      const half = lerp(roadHalfTop, roadHalfBottom, p);
      const scale = lerp(0.16, 1.28, Math.pow(p, 1.08));
      return { p, y, half, scale };
    };

    const sortedObstacles = [...g.obstacles].sort((a, b) => b.z - a.z);
    for (const o of sortedObstacles) {
      if (o.z < -50 || o.z > WORLD_DEPTH + 120) continue;
      const q = project(o.z);
      const x = cx + laneX(o.lane, q.half);
      const ow = o.width * q.half * 1.65;
      const oh = Math.max(10, o.height * 110 * q.scale);
      const baseY = q.y;
      ctx.save();
      ctx.translate(x, baseY);
      ctx.shadowBlur = 18 * q.p;
      ctx.shadowColor = "rgba(255,77,107,.55)";
      if (o.kind === "gap") {
        ctx.fillStyle = "#020711";
        ctx.fillRect(-ow * 0.9, -4, ow * 1.8, 8);
        ctx.strokeStyle = "rgba(255,130,75,.7)";
        ctx.lineWidth = Math.max(1, 3 * q.scale);
        ctx.strokeRect(-ow * 0.9, -5, ow * 1.8, 10);
      } else if (o.kind === "bar") {
        ctx.fillStyle = "#e7495e";
        roundedRect(ctx, -ow, -oh * 0.85, ow * 2, oh * 0.72, 7 * q.scale);
        ctx.fill();
        ctx.fillStyle = "#ffb14a";
        ctx.fillRect(-ow * 0.78, -oh * 0.72, ow * 1.56, Math.max(2, oh * 0.11));
      } else {
        ctx.fillStyle = o.kind === "wall" ? "#c92e56" : "#ef475f";
        roundedRect(ctx, -ow, -oh, ow * 2, oh, 9 * q.scale);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.2)";
        ctx.fillRect(-ow * 0.72, -oh * 0.75, ow * 1.44, Math.max(2, oh * 0.12));
        ctx.strokeStyle = "rgba(255,196,87,.72)";
        ctx.lineWidth = Math.max(1, 2 * q.scale);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Pickups.
    for (const p of g.pickups) {
      if (p.collected || p.z < -40 || p.z > WORLD_DEPTH + 160) continue;
      const q = project(p.z);
      const x = cx + laneX(p.lane, q.half);
      const bob = Math.sin(tNow * 5 + p.phase) * (2 + q.p * 7);
      const r = Math.max(4, 10 * q.scale);
      ctx.save();
      ctx.translate(x, q.y - 38 * q.scale + bob);
      ctx.shadowBlur = 20 * q.scale;
      ctx.shadowColor = p.kind === "coin" ? "#ffd34d" : p.kind === "shield" ? "#55e5ff" : p.kind === "magnet" ? "#9f7cff" : p.kind === "boost" ? "#ff8a3d" : "#69ffb5";
      if (p.kind === "coin") {
        ctx.fillStyle = "#ffd34d";
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = Math.max(1, q.scale * 2); ctx.stroke();
      } else {
        ctx.fillStyle = p.kind === "shield" ? "#55e5ff" : p.kind === "magnet" ? "#9f7cff" : p.kind === "boost" ? "#ff8a3d" : "#69ffb5";
        ctx.beginPath(); ctx.arc(0, 0, r * 1.12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#061322";
        ctx.font = `900 ${Math.max(7, 10 * q.scale)}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.kind === "shield" ? "S" : p.kind === "magnet" ? "M" : p.kind === "boost" ? "B" : "×", 0, 0.5);
      }
      ctx.restore();
    }

    // Player shadow.
    const playerGround = h * 0.84;
    const playerX = cx + laneX(g.lane, roadHalfBottom);
    const jumpPx = g.jumpY * 0.19;
    ctx.fillStyle = `rgba(0,0,0,${0.28 - Math.min(0.18, g.jumpY * 0.03)})`;
    ctx.beginPath();
    ctx.ellipse(playerX, playerGround + 18, 34 - Math.min(18, g.jumpY * 2), 9 - Math.min(5, g.jumpY * 0.5), 0, 0, Math.PI * 2);
    ctx.fill();

    // Player.
    ctx.save();
    ctx.translate(playerX, playerGround - jumpPx);
    const lean = (g.targetLane - g.lane) * -0.13;
    ctx.rotate(lean);
    const sliding = g.sliding;
    const bodyW = sliding ? 52 : 35;
    const bodyH = sliding ? 28 : 60;
    ctx.shadowBlur = 22;
    ctx.shadowColor = "rgba(61,207,255,.75)";
    ctx.fillStyle = "#39c8ff";
    roundedRect(ctx, -bodyW / 2, -bodyH, bodyW, bodyH, 12);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#0b213d";
    ctx.beginPath(); ctx.arc(sliding ? 19 : 0, -bodyH - 11, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f3f8ff";
    ctx.beginPath(); ctx.arc(sliding ? 22 : 4, -bodyH - 12, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#8af0ff";
    ctx.fillRect(-bodyW * 0.35, -bodyH * 0.64, bodyW * 0.7, 5);
    ctx.fillStyle = "#162f50";
    if (!sliding) {
      ctx.fillRect(-16, -2, 11, 25);
      ctx.fillRect(5, -2, 11, 25);
    } else {
      ctx.fillRect(-24, 1, 18, 9);
      ctx.fillRect(8, 1, 18, 9);
    }
    if (g.shield > 0) {
      ctx.strokeStyle = "rgba(83,230,255,.85)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -bodyH * 0.48, 47, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgba(83,230,255,.18)";
      ctx.lineWidth = 8;
      ctx.stroke();
    }
    ctx.restore();

    // Particles.
    for (const p of g.particles) {
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = "#7ce7ff";
      ctx.beginPath(); ctx.arc(cx + p.x, playerGround - p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Speed streaks at higher speeds.
    if (g.speed > 380 && g.phase === "playing") {
      ctx.strokeStyle = `rgba(140,225,255,${clamp((g.speed - 380) / 850, 0.04, 0.22)})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        const x = (Math.sin(i * 17.3 + g.elapsed * 2) * 0.5 + 0.5) * w;
        const y = horizon + ((i * 71 + g.elapsed * 150) % (h - horizon));
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 18 + g.speed * 0.035); ctx.stroke();
      }
    }

    // Vignette.
    const vignette = ctx.createRadialGradient(cx, h * 0.55, h * 0.15, cx, h * 0.55, h * 0.78);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,.52)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    if (g.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${g.flash})`;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();

    // Keep canvas physically crisp.
    void dpr;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let mounted = true;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, Math.floor(rect.width));
      height = Math.max(520, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const tick = (now: number) => {
      if (!mounted) return;
      const g = gameRef.current;
      if (!g) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (g.phase === "playing") {
        const dt = clamp((now - (g.last || now)) / 1000, 0, 0.035);
        g.last = now;
        g.elapsed += dt;

        const base = Math.min(MAX_SPEED, START_SPEED + g.elapsed * 4.7);
        g.targetSpeed = g.boostUntil > g.elapsed ? Math.min(MAX_SPEED + 80, base * 1.42) : base;
        g.speed = lerp(g.speed, g.targetSpeed, 1 - Math.pow(0.001, dt));
        g.distance += g.speed * dt * 0.022;
        g.score += g.speed * dt * 0.14 * g.multiplier;

        g.lane = lerp(g.lane, g.targetLane, 1 - Math.pow(0.0007, dt));
        if (Math.abs(g.lane - g.targetLane) < 0.015) g.lane = g.targetLane;

        if (g.jumpY > 0 || g.jumpV > 0) {
          g.jumpV -= 1380 * dt;
          g.jumpY += g.jumpV * dt;
          if (g.jumpY <= 0) { g.jumpY = 0; g.jumpV = 0; }
        }
        if (g.sliding && g.elapsed >= g.slideUntil) g.sliding = false;
        if (g.combo > 0 && g.elapsed > g.comboUntil) g.combo = 0;

        g.spawnTimer -= dt;
        if (g.spawnTimer <= 0) {
          spawnObstacle(g);
          const difficulty = clamp(g.elapsed / 90, 0, 1);
          g.spawnTimer = lerp(1.12, 0.56, difficulty) + Math.random() * 0.26;
        }
        g.pickupTimer -= dt;
        if (g.pickupTimer <= 0) {
          spawnPickup(g);
          g.pickupTimer = 1.1 + Math.random() * 1.5;
        }

        for (const o of g.obstacles) {
          o.z -= g.speed * dt;
          if (!o.passed && o.z < PLAYER_Z - 35) {
            o.passed = true;
            const laneDelta = Math.abs(g.lane - o.lane);
            if (laneDelta > 0.58) {
              g.score += 20 * g.multiplier;
              g.combo += 1;
              g.comboUntil = g.elapsed + 1.7;
            }
          }
        }

        for (const p of g.pickups) {
          p.z -= g.speed * dt;
          if (p.collected) continue;
          const laneDelta = Math.abs(g.lane - p.lane);
          const magnet = g.magnetUntil > g.elapsed;
          if (magnet && p.kind === "coin" && p.z < PLAYER_Z + 170 && laneDelta < 1.05) p.z -= 520 * dt;
          if (p.z < PLAYER_Z + 32 && p.z > PLAYER_Z - 45 && laneDelta < 0.44) collect(p, g);
        }

        // Collision envelope. Jump clears blocks/gaps; slide clears overhead bars.
        for (const o of g.obstacles) {
          if (o.z < PLAYER_Z - 34 || o.z > PLAYER_Z + 32) continue;
          if (Math.abs(g.lane - o.lane) > 0.46) continue;
          const highEnough = g.jumpY > (o.kind === "wall" ? 78 : 48);
          const lowEnough = g.sliding && o.kind === "bar";
          if (highEnough || lowEnough) continue;
          if (o.kind === "gap" && g.jumpY > 30) continue;

          if (g.shield > 0) {
            g.shield = 0;
            o.z = -100;
            g.shake = 10;
            g.flash = 0.18;
            burst(g, 0, 0, 20);
          } else {
            fail();
          }
          break;
        }

        g.obstacles = g.obstacles.filter((o) => o.z > -120);
        g.pickups = g.pickups.filter((p) => p.z > -100 && !p.collected);

        for (const p of g.particles) {
          p.life -= dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy -= 220 * dt;
        }
        g.particles = g.particles.filter((p) => p.life > 0);

        g.shake = Math.max(0, g.shake - 24 * dt);
        g.flash = Math.max(0, g.flash - dt * 1.8);

        if (g.distance >= g.milestone) {
          g.score += 300 * g.multiplier;
          g.milestone += 250;
          g.flash = 0.13;
          burst(g, 0, 20, 18);
        }

        if (hudClockRef.current === null || now - hudClockRef.current > 100) {
          hudClockRef.current = now;
          updateHud();
        }
      } else if (g.phase === "paused") {
        g.last = now;
      }

      draw(ctx, width, height, g, now);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [collect, draw, fail, updateHud]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = touchStartRef.current;
    touchStartRef.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (Math.max(ax, ay) < 28) {
      if (phase === "menu" || phase === "gameover") start();
      else if (phase === "playing") jump();
      return;
    }
    if (ax > ay) move(dx > 0 ? 1 : -1);
    else if (dy < 0) jump();
    else slide();
  };

  const displayCoins = typeof window === "undefined" ? 0 : Number(localStorage.getItem(COINS_KEY) || 0);

  return (
    <main className="runner-shell">
      <section className="runner-frame">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">VGB</div>
            <div><strong>RUNNER</strong><span>ARCADE</span></div>
          </div>
          <div className="top-stats">
            <div><span>BEST</span><b>{hud.best.toLocaleString()}</b></div>
            <div><span>BANK</span><b>🪙 {displayCoins}</b></div>
            <button className="icon-btn" onClick={() => setSound((v) => !v)} aria-label="Toggle sound">{sound ? "🔊" : "🔇"}</button>
            <button className="icon-btn" onClick={pause} disabled={phase === "menu" || phase === "gameover"}>{phase === "paused" ? "▶" : "Ⅱ"}</button>
          </div>
        </header>

        <div className="game-wrap">
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            aria-label="VGB Runner game canvas"
          />

          <div className="hud">
            <div className="metric"><small>SCORE</small><strong>{hud.score.toLocaleString()}</strong></div>
            <div className="metric center"><small>DISTANCE</small><strong>{hud.distance}m</strong></div>
            <div className="metric right"><small>COINS</small><strong>🪙 {hud.coins}</strong></div>
            {hud.multiplier > 1 && <div className="multiplier">×{hud.multiplier}</div>}
            {hud.power && <div className="power-pill">{hud.power}</div>}
          </div>

          <div className="mobile-controls" aria-hidden="true">
            <button onPointerDown={() => move(-1)}>‹</button>
            <button onPointerDown={jump}>↑</button>
            <button onPointerDown={slide}>↓</button>
            <button onPointerDown={() => move(1)}>›</button>
          </div>

          {phase === "menu" && (
            <div className="overlay">
              <div className="hero-card">
                <div className="eyebrow">VGB ARCADE · ENDLESS RUN</div>
                <h1>RUN.<br /><em>DODGE.</em><br />DOMINATE.</h1>
                <p>Three lanes. One runner. An increasingly unreasonable number of obstacles.</p>
                <button className="primary" onClick={start}>START RUN <span>→</span></button>
                <div className="controls"><span>← →</span> LANES <span>↑</span> JUMP <span>↓</span> SLIDE</div>
                <div className="touch-note">Swipe on the track · Tap to jump</div>
              </div>
            </div>
          )}

          {phase === "paused" && (
            <div className="overlay compact">
              <div className="pause-card"><div className="eyebrow">RUN PAUSED</div><h2>Catch your breath.</h2><p>The track, irritatingly, will still be there.</p><button className="primary" onClick={pause}>RESUME <span>▶</span></button></div>
            </div>
          )}

          {phase === "gameover" && (
            <div className="overlay">
              <div className="result-card">
                <div className="eyebrow">RUN COMPLETE</div>
                <h2>YOU GOT<br /><em>SMACKED.</em></h2>
                <div className="result-grid">
                  <div><span>SCORE</span><b>{hud.score.toLocaleString()}</b></div>
                  <div><span>DISTANCE</span><b>{hud.distance}m</b></div>
                  <div><span>COINS</span><b>🪙 {hud.coins}</b></div>
                  <div><span>BEST</span><b>{hud.best.toLocaleString()}</b></div>
                </div>
                <button className="primary" onClick={start}>RUN AGAIN <span>↻</span></button>
              </div>
            </div>
          )}
        </div>

        <footer>
          <span>VGB RUNNER · LOCAL SCORE</span>
          <span>KEYBOARD + SWIPE + TOUCH</span>
        </footer>
      </section>

      <style jsx>{`
        .runner-shell{min-height:100vh;background:radial-gradient(circle at 50% -20%,#183c6d 0,#07111f 46%,#040914 100%);color:#eef7ff;padding:24px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .runner-frame{width:min(1240px,100%);margin:auto;border:1px solid rgba(116,205,255,.16);border-radius:26px;overflow:hidden;background:#07101c;box-shadow:0 30px 90px rgba(0,0,0,.45)}
        .topbar{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;background:rgba(5,14,27,.94);border-bottom:1px solid rgba(130,211,255,.1)}
        .brand{display:flex;align-items:center;gap:11px;letter-spacing:.08em}.brand-mark{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:linear-gradient(145deg,#35c9ff,#3978ff);font-size:12px;font-weight:950;color:#031021;box-shadow:0 8px 25px rgba(48,180,255,.28)}
        .brand strong,.brand span{display:block}.brand strong{font-size:14px;letter-spacing:.14em}.brand span{font-size:9px;color:#68d8ff;letter-spacing:.22em;margin-top:2px}
        .top-stats{display:flex;align-items:center;gap:18px}.top-stats>div{display:flex;flex-direction:column;align-items:flex-end;line-height:1.05}.top-stats span{font-size:8px;color:#7290ad;letter-spacing:.18em}.top-stats b{font-size:13px;margin-top:5px}.icon-btn{border:1px solid rgba(120,205,255,.15);background:#0b1a2d;color:#d9f4ff;width:34px;height:34px;border-radius:10px;cursor:pointer}.icon-btn:disabled{opacity:.35;cursor:default}
        .game-wrap{position:relative;height:min(76vh,760px);min-height:560px;background:#06101d;touch-action:none;user-select:none}.game-wrap canvas{width:100%;height:100%;display:block;touch-action:none}
        .hud{position:absolute;top:18px;left:22px;right:22px;display:grid;grid-template-columns:1fr 1fr 1fr;pointer-events:none}.metric{display:flex;flex-direction:column}.metric.center{align-items:center}.metric.right{align-items:flex-end}.metric small{font-size:8px;font-weight:800;letter-spacing:.2em;color:#79a0bd}.metric strong{font-size:19px;letter-spacing:.02em;text-shadow:0 3px 15px rgba(0,0,0,.5)}.multiplier,.power-pill{position:absolute;top:52px;border-radius:999px;padding:7px 11px;font-size:11px;font-weight:900;letter-spacing:.08em}.multiplier{left:0;background:#62f2b0;color:#04251a}.power-pill{right:0;background:#55dfff;color:#031722}
        .overlay{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(90deg,rgba(2,8,18,.72),rgba(2,8,18,.22),rgba(2,8,18,.7));backdrop-filter:blur(2px)}.hero-card,.result-card,.pause-card{width:min(500px,calc(100% - 36px));text-align:left;padding:38px;border:1px solid rgba(137,218,255,.18);background:linear-gradient(145deg,rgba(8,24,42,.94),rgba(5,13,26,.88));box-shadow:0 25px 70px rgba(0,0,0,.45);border-radius:24px}.eyebrow{font-size:9px;font-weight:900;letter-spacing:.24em;color:#65d9ff}.hero-card h1,.result-card h2{font-size:clamp(43px,7vw,76px);line-height:.86;letter-spacing:-.055em;margin:17px 0}.hero-card h1 em,.result-card h2 em{font-style:normal;color:#54d9ff}.hero-card p,.pause-card p{color:#9ab2c9;line-height:1.6;font-size:13px;max-width:390px}.primary{border:0;border-radius:13px;padding:14px 17px;background:linear-gradient(135deg,#42d7ff,#4678ff);color:#021321;font-weight:950;letter-spacing:.08em;cursor:pointer;box-shadow:0 12px 30px rgba(52,171,255,.26);transition:transform .16s ease,filter .16s ease}.primary:hover{transform:translateY(-2px);filter:brightness(1.08)}.primary span{margin-left:18px;font-size:17px}.controls{display:flex;gap:10px;align-items:center;margin-top:18px;font-size:8px;color:#718ca7;letter-spacing:.1em}.controls span{color:#dff7ff;border:1px solid rgba(150,220,255,.15);background:#0b1a2d;padding:4px 7px;border-radius:6px}.touch-note{display:none;margin-top:10px;font-size:9px;color:#59738e}.compact{background:rgba(2,8,18,.5)}.pause-card{text-align:center;width:min(400px,calc(100% - 36px))}.pause-card h2{font-size:34px;letter-spacing:-.04em;margin:12px 0 4px}.result-card{width:min(520px,calc(100% - 36px))}.result-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:20px 0}.result-grid div{padding:13px;border-radius:12px;background:rgba(130,205,255,.055);border:1px solid rgba(130,205,255,.08)}.result-grid span{display:block;font-size:8px;color:#6e8ba5;letter-spacing:.16em}.result-grid b{display:block;margin-top:5px;font-size:17px}
        .mobile-controls{display:none;position:absolute;left:14px;right:14px;bottom:15px;justify-content:space-between;pointer-events:none}.mobile-controls button{pointer-events:auto;width:54px;height:46px;border-radius:14px;border:1px solid rgba(135,218,255,.18);background:rgba(6,20,35,.76);color:#dff8ff;font-size:22px;backdrop-filter:blur(8px)}
        footer{height:38px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;color:#536c83;font-size:8px;letter-spacing:.14em;background:#050d18;border-top:1px solid rgba(130,211,255,.08)}
        @media(max-width:700px){.runner-shell{padding:0}.runner-frame{border-radius:0;border-left:0;border-right:0;min-height:100vh}.topbar{height:62px;padding:0 14px}.top-stats{gap:9px}.top-stats>div:first-child{display:none}.game-wrap{height:calc(100vh - 100px);min-height:560px}.hud{top:13px;left:14px;right:14px}.metric strong{font-size:15px}.hero-card,.result-card,.pause-card{padding:27px}.hero-card h1,.result-card h2{font-size:47px}.controls{display:none}.touch-note{display:block}.mobile-controls{display:flex}footer{height:38px;font-size:7px}}
      `}</style>
    </main>
  );
}
