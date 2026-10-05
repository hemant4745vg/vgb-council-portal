"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Lane = -1 | 0 | 1;
type Phase = "menu" | "playing" | "paused" | "gameover";
type Environment = "quadrangle" | "walkway" | "garden" | "sports" | "hostels" | "gate";
type ObstacleKind = "block" | "bar" | "wall" | "gap";
type PickupKind = "coin" | "magnet" | "shield" | "multiplier" | "boost";

type Obstacle = {
  id: number;
  lane: Lane;
  z: number;
  kind: ObstacleKind;
  resolved: boolean;
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
  kind: "dust" | "spark";
};

type Game = {
  phase: Phase;
  last: number;
  elapsed: number;
  distance: number;
  score: number;
  runCoins: number;
  bankCoins: number;
  best: number;
  speed: number;
  targetSpeed: number;
  lane: number;
  targetLane: Lane;
  jumpY: number;
  jumpV: number;
  sliding: boolean;
  slideUntil: number;
  shield: boolean;
  magnetUntil: number;
  multiplierUntil: number;
  boostUntil: number;
  multiplier: number;
  combo: number;
  comboUntil: number;
  spawnTimer: number;
  pickupTimer: number;
  nextId: number;
  patternIndex: number;
  environment: Environment;
  landmark: string;
  landmarkTimer: number;
  milestone: number;
  shake: number;
  flash: number;
  obstacles: Obstacle[];
  pickups: Pickup[];
  particles: Particle[];
};

const BEST_KEY = "vgb-runner-best-v3";
const BANK_KEY = "vgb-runner-bank-v3";

const PLAYER_Z = 115;
const SPAWN_Z = 920;
const COLLISION_FRONT = 82;
const COLLISION_BACK = 126;
const START_SPEED = 235;
const MAX_SPEED = 610;
const LANE_CENTER = 2 / 3;
const LANE_DIVIDER = 1 / 3;
const LANES: Lane[] = [-1, 0, 1];

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 2.1);

function readStorage(key: string, fallback = 0) {
  if (typeof window === "undefined") return fallback;
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
}

function writeStorage(key: string, value: number) {
  if (typeof window !== "undefined") localStorage.setItem(key, String(Math.max(0, Math.floor(value))));
}

function laneX(lane: number, roadHalf: number) {
  return lane * roadHalf * LANE_CENTER;
}

function freshGame(best: number, bankCoins: number): Game {
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
    spawnTimer: 0.9,
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

function resetRun(g: Game) {
  const best = g.best;
  const bankCoins = g.bankCoins;
  Object.assign(g, freshGame(best, bankCoins));
  g.phase = "playing";
  g.last = performance.now();
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function addBurst(g: Game, x: number, y: number, kind: "dust" | "spark", count: number) {
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

function obstaclePattern(difficulty: number, index: number): Array<{ lane: Lane; kind: ObstacleKind }> {
  const safe = (index % 3) as 0 | 1 | 2;
  const patterns: Array<Array<{ lane: Lane; kind: ObstacleKind }>> = [
    [{ lane: -1, kind: "block" }, { lane: 1, kind: "block" }],
    [{ lane: 0, kind: "block" }],
    [{ lane: -1, kind: "bar" }, { lane: 1, kind: "bar" }],
    [{ lane: safe === 0 ? 1 : -1, kind: "wall" }],
    [{ lane: -1, kind: "gap" }, { lane: 1, kind: "gap" }],
    [{ lane: -1, kind: "block" }, { lane: 0, kind: "bar" }],
    [{ lane: 0, kind: "gap" }, { lane: 1, kind: "block" }],
  ];

  if (difficulty > 0.48 && index % 5 === 0) {
    return [{ lane: -1, kind: "block" }, { lane: 1, kind: "block" }];
  }
  return patterns[index % patterns.length];
}

function spawnObstacleSet(g: Game) {
  const difficulty = clamp(g.elapsed / 100, 0, 1);
  const pattern = obstaclePattern(difficulty, g.patternIndex++);
  const z = SPAWN_Z + 20;

  for (const item of pattern) {
    g.obstacles.push({ id: g.nextId++, lane: item.lane, z, kind: item.kind, resolved: false });
  }

  const interval = lerp(1.08, 0.62, difficulty);
  g.spawnTimer = interval + Math.random() * 0.18;
}

function spawnPickupSet(g: Game) {
  const lane = LANES[Math.floor(Math.random() * LANES.length)];
  const roll = Math.random();
  const power: PickupKind = roll < 0.78 ? "coin" : roll < 0.84 ? "magnet" : roll < 0.91 ? "shield" : roll < 0.96 ? "multiplier" : "boost";

  if (power === "coin") {
    const count = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i += 1) {
      g.pickups.push({ id: g.nextId++, lane, z: SPAWN_Z + 80 + i * 48, kind: "coin", collected: false, phase: Math.random() * Math.PI * 2 });
    }
  } else {
    g.pickups.push({ id: g.nextId++, lane, z: SPAWN_Z + 160, kind: power, collected: false, phase: Math.random() * Math.PI * 2 });
  }

  g.pickupTimer = 1.25 + Math.random() * 1.35;
}

function project(z: number, width: number, height: number) {
  const t = clamp(1 - z / SPAWN_Z, 0, 1);
  const eased = easeOut(t);
  const horizonY = height * 0.30;
  const bottomY = height * 0.93;
  const half = lerp(width * 0.055, width * 0.47, eased);
  const y = lerp(horizonY, bottomY, eased);
  const scale = lerp(0.14, 1.13, Math.pow(eased, 1.05));
  return { t: eased, y, half, scale };
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.fillStyle = "#70442f";
  ctx.fillRect(x - 3 * scale, y - 25 * scale, 6 * scale, 28 * scale);
  ctx.fillStyle = "#2e6d3b";
  ctx.beginPath();
  ctx.arc(x, y - 38 * scale, 15 * scale, 0, Math.PI * 2);
  ctx.arc(x - 10 * scale, y - 31 * scale, 11 * scale, 0, Math.PI * 2);
  ctx.arc(x + 10 * scale, y - 31 * scale, 11 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawBuilding(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, scale: number, label?: string) {
  const bw = w * scale;
  const bh = h * scale;
  const left = x - bw / 2;
  const top = y - bh;

  ctx.fillStyle = "rgba(22,18,15,.22)";
  ctx.fillRect(left + 8 * scale, y - 2 * scale, bw, 6 * scale);

  ctx.fillStyle = "#a94f37";
  ctx.fillRect(left, top, bw, bh);
  ctx.fillStyle = "#823c2d";
  ctx.fillRect(left, top, Math.max(4, 8 * scale), bh);

  ctx.fillStyle = "#d8a64f";
  ctx.beginPath();
  ctx.moveTo(left - 3 * scale, top);
  ctx.lineTo(x, top - 10 * scale);
  ctx.lineTo(left + bw + 3 * scale, top);
  ctx.closePath();
  ctx.fill();

  const cols = Math.max(2, Math.floor(bw / Math.max(18, 34 * scale)));
  const rows = Math.max(2, Math.floor(bh / Math.max(22, 38 * scale)));
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const wx = left + 12 * scale + c * ((bw - 24 * scale) / Math.max(1, cols - 1));
      const wy = top + 14 * scale + r * ((bh - 28 * scale) / Math.max(1, rows - 1));
      ctx.fillStyle = "#263943";
      ctx.fillRect(wx - 4 * scale, wy - 7 * scale, 8 * scale, 13 * scale);
    }
  }

  if (label && scale > 0.42) {
    ctx.fillStyle = "rgba(28,25,20,.72)";
    ctx.font = `800 ${Math.max(7, 9 * scale)}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(label, x, top - 13 * scale);
  }
}

function drawWalkway(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, scale: number) {
  const w = width * scale;
  const roofY = y - 62 * scale;
  ctx.fillStyle = "#9a6549";
  ctx.fillRect(x - w / 2, roofY, w, 8 * scale);
  const count = Math.max(3, Math.floor(w / Math.max(22, 42 * scale)));
  for (let i = 0; i <= count; i += 1) {
    const px = x - w / 2 + (w / count) * i;
    ctx.fillStyle = "#8b4b37";
    ctx.fillRect(px - 3 * scale, roofY + 7 * scale, 6 * scale, 64 * scale);
  }
  ctx.fillStyle = "rgba(244,220,178,.72)";
  ctx.fillRect(x - w / 2, roofY + 2 * scale, w, 3 * scale);
}

function drawGate(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  const w = 150 * scale;
  const h = 86 * scale;
  ctx.fillStyle = "#153e71";
  ctx.fillRect(x - w / 2, y - h, w, h);
  ctx.fillStyle = "#f1f1e9";
  ctx.fillRect(x - w / 2 + 7 * scale, y - h + 7 * scale, w - 14 * scale, 17 * scale);
  ctx.fillStyle = "#d6423e";
  ctx.beginPath();
  ctx.moveTo(x, y - h + 34 * scale);
  ctx.lineTo(x + 21 * scale, y - h + 55 * scale);
  ctx.lineTo(x, y - h + 76 * scale);
  ctx.lineTo(x - 21 * scale, y - h + 55 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#173d68";
  ctx.font = `900 ${Math.max(7, 11 * scale)}px system-ui`;
  ctx.textAlign = "center";
  ctx.fillText("VIDYAGYAN", x, y - h + 19 * scale);
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, groundY: number, scale: number, jumpY: number, sliding: boolean, laneLean: number) {
  const lift = jumpY * 0.23;
  ctx.save();
  ctx.translate(x, groundY - lift);
  ctx.rotate(laneLean);

  ctx.fillStyle = `rgba(0,0,0,${clamp(0.28 - jumpY * 0.003, 0.08, 0.28)})`;
  ctx.beginPath();
  ctx.ellipse(0, 9 * scale + lift * 0.35, Math.max(8, 28 * scale - jumpY * 0.15), 7 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  if (sliding) {
    ctx.fillStyle = "#244f88";
    drawRoundedRect(ctx, -25 * scale, -23 * scale, 48 * scale, 23 * scale, 8 * scale);
    ctx.fill();
    ctx.fillStyle = "#e7b18b";
    ctx.beginPath(); ctx.arc(23 * scale, -18 * scale, 9 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#17263b";
    ctx.fillRect(-27 * scale, 0, 18 * scale, 6 * scale);
    ctx.fillRect(9 * scale, 0, 20 * scale, 6 * scale);
  } else {
    ctx.fillStyle = "#2e5a99";
    drawRoundedRect(ctx, -14 * scale, -48 * scale, 28 * scale, 42 * scale, 8 * scale); ctx.fill();
    ctx.fillStyle = "#e7b18b";
    ctx.beginPath(); ctx.arc(0, -59 * scale, 12 * scale, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#20262c";
    ctx.beginPath(); ctx.arc(0, -64 * scale, 12 * scale, Math.PI, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#e7b18b"; ctx.lineWidth = 5 * scale;
    ctx.beginPath(); ctx.moveTo(-11 * scale, -39 * scale); ctx.lineTo(-21 * scale, -17 * scale); ctx.moveTo(11 * scale, -39 * scale); ctx.lineTo(21 * scale, -17 * scale); ctx.stroke();
    ctx.strokeStyle = "#203e6a"; ctx.lineWidth = 7 * scale;
    ctx.beginPath(); ctx.moveTo(-7 * scale, -6 * scale); ctx.lineTo(-12 * scale, 16 * scale); ctx.moveTo(7 * scale, -6 * scale); ctx.lineTo(13 * scale, 16 * scale); ctx.stroke();
  }

  ctx.restore();
}

function drawPickup(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, kind: PickupKind, phase: number, time: number) {
  const r = Math.max(4, 10 * scale);
  const bob = Math.sin(time * 0.006 + phase) * 4 * scale;
  ctx.save();
  ctx.translate(x, y - 26 * scale + bob);
  if (kind === "coin") {
    ctx.rotate(time * 0.004);
    ctx.fillStyle = "#f3bd3e";
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#fff1a4"; ctx.lineWidth = Math.max(1, 1.5 * scale); ctx.stroke();
  } else {
    const fill = kind === "shield" ? "#42d8ff" : kind === "magnet" ? "#9d78ff" : kind === "boost" ? "#ff8c3b" : "#61e6a8";
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#081624";
    ctx.font = `900 ${Math.max(7, 10 * scale)}px system-ui`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(kind === "shield" ? "S" : kind === "magnet" ? "M" : kind === "boost" ? "⚡" : "×", 0, 1);
  }
  ctx.restore();
}

export default function RunnerPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const rafRef = useRef<number | null>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const lastHudRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("menu");
  const [sound, setSound] = useState(true);
  const [hud, setHud] = useState({ score: 0, distance: 0, coins: 0, bank: 0, best: 0, multiplier: 1, power: "", combo: 0, landmark: "ACADEMIC QUADRANGLE" });

  const syncHud = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    const power = g.boostUntil > g.elapsed ? "BOOST" : g.magnetUntil > g.elapsed ? "MAGNET" : g.shield ? "SHIELD" : "";
    setHud({
      score: Math.floor(g.score),
      distance: Math.floor(g.distance),
      coins: g.runCoins,
      bank: g.bankCoins,
      best: g.best,
      multiplier: g.multiplier,
      power,
      combo: g.combo,
      landmark: g.landmark,
    });
  }, []);

  const beep = useCallback((frequency: number, duration = 0.06, type: OscillatorType = "sine") => {
    if (!sound || typeof window === "undefined") return;
    try {
      const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return;
      const audio = audioRef.current ?? new AudioCtor();
      audioRef.current = audio;
      if (audio.state === "suspended") void audio.resume();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.07, audio.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(); oscillator.stop(audio.currentTime + duration + 0.01);
    } catch { /* audio is optional */ }
  }, [sound]);

  const start = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    resetRun(g);
    setPhase("playing");
    syncHud();
    beep(520, 0.08, "square");
  }, [beep, syncHud]);

  const move = useCallback((direction: -1 | 1) => {
    const g = gameRef.current;
    if (!g || g.phase !== "playing") return;
    g.targetLane = clamp(g.targetLane + direction, -1, 1) as Lane;
    beep(180, 0.035, "triangle");
  }, [beep]);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.phase !== "playing" || g.jumpY > 0.01 || g.sliding) return;
    g.jumpV = 780;
    g.jumpY = 1;
    addBurst(g, 0, 0, "dust", 7);
    beep(420, 0.06, "square");
  }, [beep]);

  const slide = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.phase !== "playing" || g.jumpY > 0.02) return;
    g.sliding = true;
    g.slideUntil = g.elapsed + 0.62;
    beep(145, 0.05, "sawtooth");
  }, [beep]);

  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (!g || (g.phase !== "playing" && g.phase !== "paused")) return;
    if (g.phase === "playing") {
      g.phase = "paused";
      setPhase("paused");
    } else {
      g.phase = "playing";
      g.last = performance.now();
      setPhase("playing");
    }
  }, []);

  const finish = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.phase !== "playing") return;
    g.phase = "gameover";
    g.best = Math.max(g.best, Math.floor(g.score));
    g.bankCoins += g.runCoins;
    writeStorage(BEST_KEY, g.best);
    writeStorage(BANK_KEY, g.bankCoins);
    g.shake = 16;
    g.flash = 0.22;
    addBurst(g, 0, 0, "spark", 28);
    setPhase("gameover");
    syncHud();
    beep(90, 0.22, "sawtooth");
  }, [beep, syncHud]);

  const collect = useCallback((p: Pickup, g: Game) => {
    p.collected = true;
    if (p.kind === "coin") {
      g.runCoins += 1;
      g.score += 30 * g.multiplier;
      g.combo += 1;
      g.comboUntil = g.elapsed + 1.6;
      beep(720, 0.045, "sine");
    } else if (p.kind === "magnet") {
      g.magnetUntil = g.elapsed + 7;
      g.score += 100;
      beep(560, 0.08, "triangle");
    } else if (p.kind === "shield") {
      g.shield = true;
      g.score += 125;
      beep(480, 0.1, "sine");
    } else if (p.kind === "multiplier") {
      g.multiplier = Math.min(5, g.multiplier + 1);
      g.multiplierUntil = g.elapsed + 9;
      g.score += 175;
      beep(880, 0.1, "square");
    } else {
      g.boostUntil = g.elapsed + 4;
      g.score += 150;
      beep(980, 0.1, "sawtooth");
    }
    addBurst(g, 0, 0, "spark", p.kind === "coin" ? 5 : 14);
  }, [beep]);

  useEffect(() => {
    const best = readStorage(BEST_KEY);
    const bank = readStorage(BANK_KEY);
    const g = freshGame(best, bank);
    gameRef.current = g;
    setHud((old) => ({ ...old, best, bank }));

    return () => {
      if (audioRef.current) void audioRef.current.close();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", " "].includes(key)) event.preventDefault();
      if (key === "arrowleft" || key === "a") move(-1);
      else if (key === "arrowright" || key === "d") move(1);
      else if (key === "arrowup" || key === "w" || key === " ") jump();
      else if (key === "arrowdown" || key === "s") slide();
      else if (key === "p" || key === "escape") togglePause();
      else if (key === "enter" && (phase === "menu" || phase === "gameover")) start();
    };
    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, move, phase, slide, start, togglePause]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let mounted = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, Math.floor(rect.width));
      height = Math.max(500, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const draw = (g: Game, now: number) => {
      const cx = width / 2;
      const horizon = height * 0.29;
      const roadHalfTop = width * 0.075;
      const roadHalfBottom = Math.min(width * 0.47, 390);
      const time = now * 0.001;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      if (g.shake > 0) {
        const amount = g.shake * 0.42;
        ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
      }

      const sky = ctx.createLinearGradient(0, 0, 0, height);
      const night = g.environment === "gate" || g.environment === "hostels";
      sky.addColorStop(0, night ? "#13213a" : "#8dc3df");
      sky.addColorStop(0.46, night ? "#355274" : "#d8e5d0");
      sky.addColorStop(1, night ? "#18261e" : "#80965e");
      ctx.fillStyle = sky;
      ctx.fillRect(-20, -20, width + 40, height + 40);

      // Distant campus silhouette.
      for (let i = 0; i < 8; i += 1) {
        const bx = (i / 8) * width;
        const bh = 22 + (i % 3) * 13;
        ctx.fillStyle = night ? "rgba(24,36,49,.72)" : "rgba(105,91,73,.28)";
        ctx.fillRect(bx, horizon - bh, width / 8 + 8, bh);
      }

      const roadTopY = horizon;
      const roadBottomY = height * 0.96;
      ctx.beginPath();
      ctx.moveTo(cx - roadHalfTop, roadTopY);
      ctx.lineTo(cx + roadHalfTop, roadTopY);
      ctx.lineTo(cx + roadHalfBottom, roadBottomY);
      ctx.lineTo(cx - roadHalfBottom, roadBottomY);
      ctx.closePath();
      ctx.fillStyle = "#c6b28d";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - roadHalfTop * 0.78, roadTopY);
      ctx.lineTo(cx + roadHalfTop * 0.78, roadTopY);
      ctx.lineTo(cx + roadHalfBottom * 0.82, roadBottomY);
      ctx.lineTo(cx - roadHalfBottom * 0.82, roadBottomY);
      ctx.closePath();
      ctx.fillStyle = "#a86e50";
      ctx.fill();

      const scroll = (g.distance * 1.6) % 80;
      for (const divider of [-1, 1]) {
        ctx.strokeStyle = "rgba(84,58,44,.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + divider * roadHalfTop * LANE_DIVIDER, roadTopY);
        ctx.lineTo(cx + divider * roadHalfBottom * LANE_DIVIDER, roadBottomY);
        ctx.stroke();
      }

      for (let i = -1; i < 18; i += 1) {
        const z = i * 65 + scroll + 20;
        const p = project(z, width, height);
        if (p.t <= 0) continue;
        for (const side of [-1, 1]) {
          const x = cx + side * (p.half + 18 * p.scale);
          ctx.fillStyle = night ? "rgba(225,198,120,.75)" : "rgba(88,72,56,.42)";
          ctx.fillRect(x - 2 * p.scale, p.y, 4 * p.scale, 10 * p.scale);
        }
      }

      // Campus scenery, intentionally based on the uploaded brick architecture, covered walkways, lawns and entrance gate.
      const scenery = [
        { z: 22, side: -1, label: "ACADEMIC BLOCK" },
        { z: 48, side: 1, label: "" },
        { z: 78, side: -1, label: "" },
        { z: 112, side: 1, label: "" },
        { z: 152, side: -1, label: "" },
        { z: 198, side: 1, label: "" },
      ];
      for (const item of scenery) {
        const p = project(item.z, width, height);
        const x = cx + item.side * (p.half + 42 * p.scale);
        drawBuilding(ctx, x, p.y + 4 * p.scale, 105 + (item.z % 3) * 20, 78 + (item.z % 2) * 35, p.scale, item.label || undefined);
        if (item.z === 48 || item.z === 152) drawWalkway(ctx, x + item.side * 60 * p.scale, p.y + 4 * p.scale, 170, p.scale);
        drawTree(ctx, cx + item.side * (p.half + 12 * p.scale), p.y + 8 * p.scale, Math.max(0.16, p.scale * 0.8));
      }

      if (g.environment === "garden") {
        for (let i = 0; i < 6; i += 1) {
          const p = project(35 + i * 32, width, height);
          const side = i % 2 ? 1 : -1;
          ctx.fillStyle = "#547c3f";
          ctx.fillRect(cx + side * (p.half + 16 * p.scale) - 10 * p.scale, p.y, 20 * p.scale, 6 * p.scale);
        }
      }

      if (g.environment === "gate") {
        const gp = project(330, width, height);
        drawGate(ctx, cx, gp.y, gp.scale * 0.85);
      }

      const sortedObstacles = [...g.obstacles].sort((a, b) => b.z - a.z);
      for (const obstacle of sortedObstacles) {
        if (obstacle.z < 0 || obstacle.z > SPAWN_Z + 20) continue;
        const p = project(obstacle.z, width, height);
        const x = cx + laneX(obstacle.lane, p.half);
        const laneWidth = (p.half * 2) / 3;
        const w = laneWidth * 0.68;
        const h = Math.max(10, 38 * p.scale);

        ctx.save();
        ctx.translate(x, p.y);
        if (obstacle.kind === "gap") {
          ctx.fillStyle = "#322b28";
          ctx.fillRect(-w * 0.62, -3 * p.scale, w * 1.24, 7 * p.scale);
          ctx.strokeStyle = "#e18c43";
          ctx.lineWidth = Math.max(1, 2 * p.scale);
          ctx.strokeRect(-w * 0.62, -4 * p.scale, w * 1.24, 9 * p.scale);
        } else if (obstacle.kind === "bar") {
          ctx.fillStyle = "#6b3d2c";
          ctx.fillRect(-w * 0.58, -h * 1.65, Math.max(4, 6 * p.scale), h * 1.65);
          ctx.fillRect(w * 0.52, -h * 1.65, Math.max(4, 6 * p.scale), h * 1.65);
          ctx.fillStyle = "#d07d32";
          drawRoundedRect(ctx, -w * 0.68, -h * 1.55, w * 1.36, h * 0.26, 5 * p.scale); ctx.fill();
        } else {
          const wall = obstacle.kind === "wall";
          ctx.fillStyle = wall ? "#7c382e" : "#a44b35";
          drawRoundedRect(ctx, -w / 2, -h * (wall ? 1.8 : 1), w, h * (wall ? 1.8 : 1), 6 * p.scale); ctx.fill();
          ctx.fillStyle = "#dca54d";
          ctx.fillRect(-w * 0.36, -h * (wall ? 1.52 : 0.82), w * 0.72, Math.max(2, h * 0.11));
          if (wall) {
            ctx.fillStyle = "rgba(255,255,255,.16)";
            ctx.fillRect(-w * 0.33, -h * 1.25, w * 0.66, Math.max(2, h * 0.08));
          }
        }
        ctx.restore();
      }

      for (const pickup of g.pickups) {
        if (pickup.collected || pickup.z < 0 || pickup.z > SPAWN_Z + 200) continue;
        const p = project(pickup.z, width, height);
        const x = cx + laneX(pickup.lane, p.half);
        drawPickup(ctx, x, p.y, p.scale, pickup.kind, pickup.phase, now);
      }

      const player = project(PLAYER_Z, width, height);
      const playerX = cx + laneX(g.lane, player.half);
      drawPlayer(ctx, playerX, player.y, clamp(player.scale, 0.82, 1.04), g.jumpY, g.sliding, (g.targetLane - g.lane) * -0.12);

      for (const particle of g.particles) {
        ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
        ctx.fillStyle = particle.kind === "spark" ? "#ffd05a" : "#d8c6a7";
        ctx.beginPath(); ctx.arc(cx + particle.x, player.y - particle.y, particle.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (g.speed > 420) {
        ctx.strokeStyle = `rgba(255,255,255,${clamp((g.speed - 420) / 1200, 0.03, 0.14)})`;
        for (let i = 0; i < 13; i += 1) {
          const x = (i * 97 + now * 0.22) % width;
          const y = horizon + ((i * 71 + now * 0.14) % Math.max(1, height - horizon));
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 14 + g.speed * 0.02); ctx.stroke();
        }
      }

      const vignette = ctx.createRadialGradient(cx, height * 0.55, height * 0.12, cx, height * 0.55, height * 0.78);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(15,25,20,.55)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      if (g.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${g.flash})`;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();
    };

    const tick = (now: number) => {
      if (!mounted) return;
      const g = gameRef.current;
      if (!g) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = clamp((now - (g.last || now)) / 1000, 0, 0.034);
      if (g.phase === "playing") {
        g.last = now;
        g.elapsed += dt;

        const baseSpeed = Math.min(MAX_SPEED, START_SPEED + g.elapsed * 4.4);
        g.targetSpeed = g.boostUntil > g.elapsed ? baseSpeed * 1.45 : baseSpeed;
        g.speed = lerp(g.speed, g.targetSpeed, 1 - Math.pow(0.001, dt));
        g.distance += g.speed * dt * 0.022;
        g.score += g.speed * dt * 0.15 * g.multiplier;

        g.lane = lerp(g.lane, g.targetLane, 1 - Math.pow(0.0004, dt));
        if (Math.abs(g.lane - g.targetLane) < 0.012) g.lane = g.targetLane;

        if (g.jumpY > 0 || g.jumpV > 0) {
          g.jumpV -= 1800 * dt;
          g.jumpY += g.jumpV * dt;
          if (g.jumpY <= 0) { g.jumpY = 0; g.jumpV = 0; }
        }
        if (g.sliding && g.elapsed >= g.slideUntil) g.sliding = false;
        if (g.combo > 0 && g.elapsed > g.comboUntil) g.combo = 0;
        if (g.multiplier > 1 && g.elapsed >= g.multiplierUntil) g.multiplier = 1;

        g.spawnTimer -= dt;
        if (g.spawnTimer <= 0) spawnObstacleSet(g);
        g.pickupTimer -= dt;
        if (g.pickupTimer <= 0) spawnPickupSet(g);

        for (const obstacle of g.obstacles) {
          obstacle.z -= g.speed * dt;
          if (obstacle.resolved || obstacle.z < COLLISION_FRONT) continue;
          if (obstacle.z <= COLLISION_BACK) {
            obstacle.resolved = true;
            const sameLane = Math.abs(g.lane - obstacle.lane) < 0.42;
            if (!sameLane) {
              g.combo += 1;
              g.comboUntil = g.elapsed + 1.6;
              g.score += 35 * g.multiplier;
              continue;
            }

            const jumpClear = obstacle.kind === "gap" ? g.jumpY > 35 : g.jumpY > (obstacle.kind === "wall" ? 115 : 58);
            const slideClear = obstacle.kind === "bar" && g.sliding;
            if (jumpClear || slideClear) {
              g.combo += 1;
              g.comboUntil = g.elapsed + 1.6;
              g.score += 55 * g.multiplier;
              addBurst(g, 0, 0, "spark", 5);
              continue;
            }

            if (g.shield) {
              g.shield = false;
              g.shake = 12;
              g.flash = 0.18;
              addBurst(g, 0, 0, "spark", 22);
              beep(170, 0.13, "square");
            } else {
              finish();
              break;
            }
          }
        }

        for (const pickup of g.pickups) {
          pickup.z -= g.speed * dt;
          if (pickup.collected) continue;

          const laneDelta = Math.abs(g.lane - pickup.lane);
          if (g.magnetUntil > g.elapsed && pickup.kind === "coin" && pickup.z < PLAYER_Z + 190 && laneDelta < 1.15) {
            pickup.z -= 620 * dt;
          }
          if (pickup.z <= PLAYER_Z + 22 && pickup.z >= PLAYER_Z - 38 && laneDelta < 0.45) collect(pickup, g);
        }

        g.obstacles = g.obstacles.filter((o) => o.z > -120);
        g.pickups = g.pickups.filter((p) => p.z > -100 && !p.collected);

        for (const particle of g.particles) {
          particle.life -= dt;
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.vy -= 190 * dt;
        }
        g.particles = g.particles.filter((p) => p.life > 0);

        g.shake = Math.max(0, g.shake - 28 * dt);
        g.flash = Math.max(0, g.flash - 1.9 * dt);

        if (g.distance >= g.milestone) {
          g.score += 300 * g.multiplier;
          g.milestone += 250;
          g.flash = 0.11;
          addBurst(g, 0, 20, "spark", 14);
          beep(880, 0.08, "square");
        }

        const band = Math.floor(g.distance / 700);
        const landmarks: Array<{ env: Environment; name: string }> = [
          { env: "quadrangle", name: "ACADEMIC QUADRANGLE" },
          { env: "walkway", name: "COVERED WALKWAY" },
          { env: "garden", name: "CENTRAL GARDEN" },
          { env: "sports", name: "SPORTS GROUNDS" },
          { env: "hostels", name: "HOSTEL DISTRICT" },
          { env: "gate", name: "MAIN CAMPUS GATE" },
        ];
        const next = landmarks[band % landmarks.length];
        if (next.name !== g.landmark) {
          g.landmark = next.name;
          g.environment = next.env;
          g.landmarkTimer = 2.0;
          beep(640, 0.07, "triangle");
        }
        g.landmarkTimer = Math.max(0, g.landmarkTimer - dt);

        if (now - lastHudRef.current > 90) {
          lastHudRef.current = now;
          syncHud();
        }
      } else if (g.phase === "paused") {
        g.last = now;
      }

      draw(g, now);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [collect, draw, finish, syncHud]);

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    touchRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const pointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const startPoint = touchRef.current;
    touchRef.current = null;
    if (!startPoint) return;
    const dx = event.clientX - startPoint.x;
    const dy = event.clientY - startPoint.y;
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

  const bank = hud.bank;
  const activePower = useMemo(() => hud.power ? hud.power : hud.multiplier > 1 ? `×${hud.multiplier}` : "", [hud.multiplier, hud.power]);

  return (
    <main className="runner-page">
      <section className="runner-frame">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">VGB</div>
            <div><strong>RUNNER</strong><span>VIDYAGYAN CAMPUS</span></div>
          </div>
          <div className="top-actions">
            <div className="top-stat"><span>BEST</span><b>{hud.best.toLocaleString()}</b></div>
            <div className="top-stat"><span>BANK</span><b>◆ {bank}</b></div>
            <button className="icon-btn" onClick={() => setSound((value) => !value)} aria-label={sound ? "Mute sound" : "Enable sound"}>{sound ? "🔊" : "🔇"}</button>
            <button className="icon-btn" onClick={togglePause} disabled={phase === "menu" || phase === "gameover"} aria-label={phase === "paused" ? "Resume game" : "Pause game"}>{phase === "paused" ? "▶" : "Ⅱ"}</button>
          </div>
        </header>

        <div className="game-wrap">
          <canvas ref={canvasRef} onPointerDown={pointerDown} onPointerUp={pointerUp} aria-label="VGB Runner game canvas" />

          <div className="hud" aria-live="polite">
            <div className="metric"><small>SCORE</small><strong>{hud.score.toLocaleString()}</strong></div>
            <div className="metric center"><small>DISTANCE</small><strong>{hud.distance}m</strong></div>
            <div className="metric right"><small>TOKENS</small><strong>◆ {hud.coins}</strong></div>
            {(activePower || hud.combo >= 2) && (
              <div className="status-row">
                {activePower && <span className="power-pill">{activePower}</span>}
                {hud.combo >= 2 && <span className="combo-pill">COMBO ×{hud.combo}</span>}
              </div>
            )}
          </div>

          {hud.landmark && phase === "playing" && hud.landmark !== "ACADEMIC QUADRANGLE" && (
            <div className="landmark-chip">{hud.landmark}</div>
          )}

          <div className="mobile-controls">
            <button onPointerDown={() => move(-1)} aria-label="Move left">‹</button>
            <button onPointerDown={jump} aria-label="Jump">↑</button>
            <button onPointerDown={slide} aria-label="Slide">↓</button>
            <button onPointerDown={() => move(1)} aria-label="Move right">›</button>
          </div>

          {phase === "menu" && (
            <div className="overlay">
              <div className="hero-card">
                <div className="eyebrow">VGB ARCADE · ENDLESS RUN</div>
                <h1>RUN THE<br /><em>CAMPUS.</em></h1>
                <p>Three lanes. Brick academic blocks. Covered walkways. Gardens. The main gate. And, naturally, obstacles placed with questionable administrative judgment.</p>
                <button className="primary" onClick={start}>START RUN <span>→</span></button>
                <div className="controls"><span>← →</span> LANES <span>↑ / SPACE</span> JUMP <span>↓</span> SLIDE</div>
                <div className="touch-note">Swipe on the track · tap to jump</div>
              </div>
            </div>
          )}

          {phase === "paused" && (
            <div className="overlay compact-overlay">
              <div className="pause-card">
                <div className="eyebrow">RUN PAUSED</div>
                <h2>TRACK FROZEN.</h2>
                <p>Nothing moves until you resume. Humanity survives another pause menu.</p>
                <button className="primary" onClick={togglePause}>RESUME <span>▶</span></button>
              </div>
            </div>
          )}

          {phase === "gameover" && (
            <div className="overlay">
              <div className="result-card">
                <div className="eyebrow">RUN COMPLETE</div>
                <h2>RUN<br /><em>ENDED.</em></h2>
                <div className="result-grid">
                  <div><span>SCORE</span><b>{hud.score.toLocaleString()}</b></div>
                  <div><span>DISTANCE</span><b>{hud.distance}m</b></div>
                  <div><span>TOKENS</span><b>◆ {hud.coins}</b></div>
                  <div><span>BEST</span><b>{hud.best.toLocaleString()}</b></div>
                </div>
                <button className="primary" onClick={start}>RUN AGAIN <span>↻</span></button>
              </div>
            </div>
          )}
        </div>

        <footer>
          <span>VGB RUNNER · CAMPUS EDITION</span>
          <span>KEYBOARD · SWIPE · TOUCH</span>
        </footer>
      </section>

      <style jsx>{`
        .runner-page{min-height:100dvh;background:radial-gradient(circle at 50% -15%,#254f55 0,#0b1713 43%,#050a08 100%);color:#f4f8f1;padding:20px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .runner-frame{width:min(1280px,100%);margin:auto;border:1px solid rgba(226,210,165,.16);border-radius:24px;overflow:hidden;background:#0a120e;box-shadow:0 30px 90px rgba(0,0,0,.45)}
        .topbar{height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:rgba(11,24,17,.96);border-bottom:1px solid rgba(232,214,169,.1)}
        .brand{display:flex;align-items:center;gap:11px}.brand-mark{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#d5413d;color:white;font-size:11px;font-weight:950;letter-spacing:.04em;box-shadow:0 8px 24px rgba(213,65,61,.22)}.brand strong,.brand span{display:block}.brand strong{font-size:14px;letter-spacing:.14em}.brand span{font-size:8px;color:#d8bd75;letter-spacing:.18em;margin-top:3px}
        .top-actions{display:flex;align-items:center;gap:14px}.top-stat{display:flex;flex-direction:column;align-items:flex-end;line-height:1.05}.top-stat span{font-size:8px;color:#809184;letter-spacing:.18em}.top-stat b{font-size:12px;margin-top:4px}.icon-btn{width:34px;height:34px;border-radius:10px;border:1px solid rgba(231,214,171,.14);background:#142119;color:#f3f5ed;cursor:pointer}.icon-btn:disabled{opacity:.3;cursor:default}
        .game-wrap{position:relative;height:min(78vh,790px);min-height:560px;background:#829766;touch-action:none;user-select:none}.game-wrap canvas{display:block;width:100%;height:100%;touch-action:none}
        .hud{position:absolute;top:16px;left:20px;right:20px;display:grid;grid-template-columns:1fr 1fr 1fr;pointer-events:none;text-shadow:0 2px 10px rgba(0,0,0,.55)}.metric{display:flex;flex-direction:column}.metric.center{align-items:center}.metric.right{align-items:flex-end}.metric small{font-size:8px;font-weight:800;letter-spacing:.2em;color:#e2eadb}.metric strong{font-size:19px;letter-spacing:.01em}.status-row{position:absolute;top:49px;left:50%;transform:translateX(-50%);display:flex;gap:7px}.power-pill,.combo-pill{padding:6px 10px;border-radius:999px;font-size:9px;font-weight:900;letter-spacing:.1em;white-space:nowrap}.power-pill{background:#f0d06d;color:#34270b}.combo-pill{background:#173f2d;color:#d8f2d8;border:1px solid rgba(210,239,206,.2)}.landmark-chip{position:absolute;top:21%;left:50%;transform:translateX(-50%);padding:8px 13px;border-radius:999px;background:rgba(17,33,23,.72);border:1px solid rgba(255,245,210,.2);backdrop-filter:blur(9px);font-size:8px;letter-spacing:.16em;pointer-events:none}
        .overlay{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(90deg,rgba(5,14,9,.73),rgba(5,14,9,.18),rgba(5,14,9,.64));backdrop-filter:blur(2px)}.compact-overlay{background:rgba(5,14,9,.52)}.hero-card,.result-card,.pause-card{width:min(510px,calc(100% - 36px));padding:36px;border-radius:23px;border:1px solid rgba(242,225,183,.17);background:linear-gradient(145deg,rgba(17,38,25,.95),rgba(7,20,13,.91));box-shadow:0 25px 70px rgba(0,0,0,.4)}.pause-card{text-align:center;width:min(390px,calc(100% - 36px))}.eyebrow{font-size:9px;font-weight:900;letter-spacing:.22em;color:#e1c568}.hero-card h1,.result-card h2{font-size:clamp(44px,7vw,76px);line-height:.86;letter-spacing:-.055em;margin:17px 0}.hero-card h1 em,.result-card h2 em{font-style:normal;color:#d7b653}.hero-card p,.pause-card p{color:#b6c3b6;line-height:1.6;font-size:13px;max-width:420px}.primary{border:0;border-radius:13px;padding:14px 17px;background:#d5413d;color:white;font-weight:950;letter-spacing:.08em;cursor:pointer;box-shadow:0 12px 30px rgba(213,65,61,.22);transition:transform .15s ease,filter .15s ease}.primary:hover{transform:translateY(-2px);filter:brightness(1.07)}.primary span{margin-left:18px}.controls{display:flex;gap:9px;align-items:center;margin-top:18px;font-size:8px;color:#809285;letter-spacing:.1em}.controls span{color:#eef4eb;border:1px solid rgba(225,221,194,.14);background:#142219;padding:4px 7px;border-radius:6px}.touch-note{display:none;margin-top:10px;font-size:9px;color:#718174}.result-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:20px 0}.result-grid div{padding:13px;border-radius:12px;background:rgba(230,218,177,.05);border:1px solid rgba(230,218,177,.08)}.result-grid span{display:block;font-size:8px;color:#89978c;letter-spacing:.16em}.result-grid b{display:block;margin-top:5px;font-size:17px}
        .mobile-controls{display:none;position:absolute;left:13px;right:13px;bottom:13px;justify-content:space-between;pointer-events:none}.mobile-controls button{pointer-events:auto;width:54px;height:46px;border-radius:14px;border:1px solid rgba(238,228,190,.18);background:rgba(10,28,17,.68);color:#f3f3e9;font-size:22px;backdrop-filter:blur(9px);touch-action:manipulation}
        footer{height:38px;padding:0 18px;display:flex;align-items:center;justify-content:space-between;color:#607166;font-size:8px;letter-spacing:.14em;background:#08100b;border-top:1px solid rgba(230,214,174,.08)}
        @media(max-width:700px){.runner-page{padding:0}.runner-frame{border-radius:0;border-left:0;border-right:0;min-height:100dvh}.topbar{height:60px;padding:0 13px}.top-actions{gap:8px}.top-stat:first-child{display:none}.game-wrap{height:calc(100dvh - 98px);min-height:0}.hud{top:12px;left:13px;right:13px}.metric strong{font-size:15px}.hero-card,.result-card,.pause-card{padding:26px}.hero-card h1,.result-card h2{font-size:47px}.controls{display:none}.touch-note{display:block}.mobile-controls{display:flex}footer{height:38px;font-size:7px}}
      `}</style>
    </main>
  );
}
