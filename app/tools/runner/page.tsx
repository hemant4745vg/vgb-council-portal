"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Lane = -1 | 0 | 1;
type Phase = "menu" | "running" | "paused" | "gameover";
type PowerKind = "magnet" | "shield" | "multiplier" | "sprint";
type ObstacleKind = "barrier" | "low" | "gap" | "cart";

type Obstacle = {
  id: number;
  lane: Lane;
  z: number;
  kind: ObstacleKind;
  checked: boolean;
};

type Pickup = {
  id: number;
  lane: Lane;
  z: number;
  kind: "token" | PowerKind;
  collected: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  type: "dust" | "spark";
};

type GameState = {
  phase: Phase;
  lane: Lane;
  targetLane: Lane;
  jumpY: number;
  jumpV: number;
  slide: number;
  speed: number;
  distance: number;
  score: number;
  tokens: number;
  combo: number;
  best: number;
  bank: number;
  spawnClock: number;
  nextId: number;
  environment: number;
  landmark: string;
  landmarkFlash: number;
  magnet: number;
  shield: number;
  multiplier: number;
  sprint: number;
  invulnerable: number;
  flash: number;
  cameraShake: number;
  lastTime: number;
  particles: Particle[];
  obstacles: Obstacle[];
  pickups: Pickup[];
};

const WORLD_PLAYER_Z = 115;
const HORIZON_Z = 0;
const LANE_CENTER = 2 / 3;
const LANE_DIVIDER = 1 / 3;
const GRAVITY = 34;
const JUMP_VELOCITY = 14.5;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function laneX(lane: Lane, roadHalf: number) {
  return lane * roadHalf * LANE_CENTER;
}

function project(z: number, width: number, height: number) {
  const t = clamp(z / WORLD_PLAYER_Z, 0, 1);
  const eased = Math.pow(t, 1.58);
  const horizonY = height * 0.2;
  const bottomY = height * 0.91;
  const y = lerp(horizonY, bottomY, eased);
  const half = lerp(width * 0.055, width * 0.47, eased);
  const scale = lerp(0.12, 1.08, eased);
  return { y, half, scale, t: eased };
}

function loadNumber(key: string, fallback: number) {
  if (typeof window === "undefined") return fallback;
  const n = Number(localStorage.getItem(key));
  return Number.isFinite(n) ? n : fallback;
}

function makeInitialState(): GameState {
  return {
    phase: "menu",
    lane: 0,
    targetLane: 0,
    jumpY: 0,
    jumpV: 0,
    slide: 0,
    speed: 31,
    distance: 0,
    score: 0,
    tokens: 0,
    combo: 0,
    best: loadNumber("vgb-runner-v2-best", 0),
    bank: loadNumber("vgb-runner-v2-bank", 0),
    spawnClock: 0,
    nextId: 1,
    environment: 0,
    landmark: "ACADEMIC QUADRANGLE",
    landmarkFlash: 0,
    magnet: 0,
    shield: 0,
    multiplier: 1,
    sprint: 0,
    invulnerable: 0,
    flash: 0,
    cameraShake: 0,
    lastTime: 0,
    particles: [],
    obstacles: [],
    pickups: [],
  };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
) {
  const trunk = 12 * scale;
  ctx.fillStyle = "#7b4a2e";
  ctx.fillRect(x - trunk / 2, y - 26 * scale, trunk, 30 * scale);

  ctx.fillStyle = "#2e6b39";
  ctx.beginPath();
  ctx.arc(x, y - 44 * scale, 20 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3e7d43";
  ctx.beginPath();
  ctx.arc(x - 13 * scale, y - 38 * scale, 14 * scale, 0, Math.PI * 2);
  ctx.arc(x + 13 * scale, y - 38 * scale, 14 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  width: number,
  height: number,
  scale: number,
  label?: string,
) {
  const w = width * scale;
  const h = height * scale;
  const left = x - w / 2;
  const top = groundY - h;

  ctx.fillStyle = "rgba(30,25,20,.16)";
  ctx.fillRect(left + 10 * scale, groundY - 4 * scale, w, 7 * scale);

  ctx.fillStyle = "#a54e35";
  ctx.fillRect(left, top, w, h);

  ctx.fillStyle = "#7f3829";
  ctx.fillRect(left, top, 10 * scale, h);

  ctx.fillStyle = "#d5a24e";
  ctx.beginPath();
  ctx.moveTo(left - 5 * scale, top);
  ctx.lineTo(x, top - 12 * scale);
  ctx.lineTo(left + w + 5 * scale, top);
  ctx.closePath();
  ctx.fill();

  const columns = Math.max(2, Math.floor(w / (38 * scale)));
  const rows = Math.max(2, Math.floor(h / (42 * scale)));
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const wx = left + 18 * scale + col * ((w - 30 * scale) / columns);
      const wy = top + 18 * scale + row * ((h - 30 * scale) / rows);
      ctx.fillStyle = "#263a43";
      ctx.fillRect(wx, wy, 11 * scale, 18 * scale);
      ctx.fillStyle = "rgba(245,232,195,.5)";
      ctx.fillRect(wx + 2 * scale, wy + 2 * scale, 7 * scale, 2 * scale);
    }
  }

  if (label && scale > 0.35) {
    ctx.fillStyle = "rgba(20,24,24,.68)";
    ctx.font = `${Math.max(8, 11 * scale)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(label, x, top - 17 * scale);
  }
}

function drawWalkway(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  width: number,
  scale: number,
) {
  const w = width * scale;
  const roofY = groundY - 82 * scale;

  ctx.fillStyle = "#8d5a43";
  ctx.fillRect(x - w / 2, roofY, w, 10 * scale);

  const count = Math.max(3, Math.floor(w / (45 * scale)));
  for (let i = 0; i <= count; i += 1) {
    const px = x - w / 2 + (w / count) * i;
    ctx.fillStyle = "#8d4a35";
    ctx.fillRect(px - 4 * scale, roofY + 8 * scale, 8 * scale, 76 * scale);
  }

  ctx.fillStyle = "rgba(244,224,183,.7)";
  ctx.fillRect(x - w / 2, roofY + 3 * scale, w, 4 * scale);
}

function drawGate(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  scale: number,
) {
  const w = 155 * scale;
  const h = 90 * scale;
  ctx.fillStyle = "#153f72";
  ctx.fillRect(x - w / 2, groundY - h, w, h);
  ctx.fillStyle = "#e9edf2";
  ctx.fillRect(x - w / 2 + 8 * scale, groundY - h + 8 * scale, w - 16 * scale, 17 * scale);

  ctx.fillStyle = "#d33b36";
  ctx.beginPath();
  ctx.moveTo(x, groundY - h + 35 * scale);
  ctx.lineTo(x + 22 * scale, groundY - h + 57 * scale);
  ctx.lineTo(x, groundY - h + 79 * scale);
  ctx.lineTo(x - 22 * scale, groundY - h + 57 * scale);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = `${Math.max(8, 12 * scale)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText("VIDYAGYAN", x, groundY - h + 20 * scale);
}

function drawToken(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(performance.now() / 500);
  ctx.fillStyle = "#f2bf42";
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff0a8";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPower(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  kind: PowerKind,
) {
  const symbols: Record<PowerKind, string> = {
    magnet: "M",
    shield: "S",
    multiplier: "×2",
    sprint: "⚡",
  };
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#174f86";
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = Math.max(1, size * 0.09);
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.font = `700 ${Math.max(7, size * 0.65)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(symbols[kind], 0, 1);
  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  jumpY: number,
  sliding: boolean,
) {
  ctx.save();
  ctx.translate(x, y - jumpY * 1.25);
  const bob = Math.sin(performance.now() / 85) * 2.2 * scale;

  ctx.fillStyle = "rgba(0,0,0,.2)";
  ctx.beginPath();
  ctx.ellipse(0, 5 * scale, 23 * scale, 8 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  if (sliding) {
    ctx.rotate(-0.12);
    ctx.fillStyle = "#254f8a";
    ctx.fillRect(-23 * scale, -18 * scale, 42 * scale, 22 * scale);
    ctx.fillStyle = "#e6b38a";
    ctx.beginPath();
    ctx.arc(22 * scale, -13 * scale, 9 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#222";
    ctx.fillRect(-25 * scale, 4 * scale, 18 * scale, 5 * scale);
    ctx.fillRect(10 * scale, 3 * scale, 19 * scale, 5 * scale);
    ctx.restore();
    return;
  }

  ctx.fillStyle = "#263f77";
  ctx.fillRect(-14 * scale, -39 * scale + bob, 28 * scale, 39 * scale);

  ctx.fillStyle = "#e6b38a";
  ctx.beginPath();
  ctx.arc(0, -49 * scale + bob, 12 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1e1e1e";
  ctx.beginPath();
  ctx.arc(0, -54 * scale + bob, 12 * scale, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#e6b38a";
  ctx.lineWidth = 6 * scale;
  ctx.beginPath();
  ctx.moveTo(-12 * scale, -31 * scale + bob);
  ctx.lineTo(-22 * scale, -12 * scale + bob);
  ctx.moveTo(12 * scale, -31 * scale + bob);
  ctx.lineTo(22 * scale, -12 * scale + bob);
  ctx.stroke();

  ctx.strokeStyle = "#263f77";
  ctx.lineWidth = 7 * scale;
  ctx.beginPath();
  ctx.moveTo(-7 * scale, 0 + bob);
  ctx.lineTo(-12 * scale, 18 * scale);
  ctx.moveTo(7 * scale, 0 + bob);
  ctx.lineTo(14 * scale, 18 * scale);
  ctx.stroke();

  ctx.fillStyle = "#202020";
  ctx.fillRect(-18 * scale, 16 * scale, 13 * scale, 5 * scale);
  ctx.fillRect(8 * scale, 16 * scale, 14 * scale, 5 * scale);
  ctx.restore();
}

function pattern(index: number): Array<{ lane: Lane; kind: ObstacleKind }> {
  const patterns = [
    [{ lane: -1 as Lane, kind: "barrier" as ObstacleKind }, { lane: 1 as Lane, kind: "barrier" as ObstacleKind }],
    [{ lane: 0 as Lane, kind: "low" as ObstacleKind }],
    [{ lane: -1 as Lane, kind: "cart" as ObstacleKind }, { lane: 0 as Lane, kind: "cart" as ObstacleKind }],
    [{ lane: 1 as Lane, kind: "gap" as ObstacleKind }],
    [{ lane: -1 as Lane, kind: "barrier" as ObstacleKind }, { lane: 0 as Lane, kind: "barrier" as ObstacleKind }],
    [{ lane: 0 as Lane, kind: "barrier" as ObstacleKind }, { lane: 1 as Lane, kind: "barrier" as ObstacleKind }],
  ];
  return patterns[index % patterns.length];
}

export default function RunnerPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<GameState>(makeInitialState());
  const rafRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<Phase>("menu");
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [tokens, setTokens] = useState(0);
  const [best, setBest] = useState(stateRef.current.best);
  const [landmark, setLandmark] = useState(stateRef.current.landmark);

  const sync = useCallback(() => {
    const g = stateRef.current;
    setPhase(g.phase);
    setScore(Math.floor(g.score));
    setDistance(Math.floor(g.distance));
    setTokens(g.tokens);
    setBest(Math.max(g.best, Math.floor(g.score)));
    setLandmark(g.landmark);
  }, []);

  const persist = useCallback(() => {
    const g = stateRef.current;
    localStorage.setItem("vgb-runner-v2-best", String(g.best));
    localStorage.setItem("vgb-runner-v2-bank", String(g.bank));
  }, []);

  const spawnPattern = useCallback(() => {
    const g = stateRef.current;
    const index = Math.floor(g.distance / 140) % 6;
    const items = pattern(index);
    const base = 4;
    for (const item of items) {
      g.obstacles.push({
        id: g.nextId++,
        lane: item.lane,
        z: base,
        kind: item.kind,
        checked: false,
      });
    }

    const safeLane: Lane = index % 3 === 0 ? 0 : index % 3 === 1 ? -1 : 1;
    for (let i = 0; i < 4; i += 1) {
      g.pickups.push({
        id: g.nextId++,
        lane: i % 2 === 0 ? safeLane : (((safeLane + 1) % 3) - 1) as Lane,
        z: 12 + i * 10,
        kind: "token",
        collected: false,
      });
    }

    if (Math.floor(g.distance / 500) % 3 === 1 && g.distance > 350) {
      g.pickups.push({
        id: g.nextId++,
        lane: safeLane,
        z: 45,
        kind: (["magnet", "shield", "multiplier", "sprint"][
          Math.floor(g.distance / 500) % 4
        ] as PowerKind),
        collected: false,
      });
    }
  }, []);

  const start = useCallback(() => {
    const old = stateRef.current;
    stateRef.current = {
      ...makeInitialState(),
      phase: "running",
      best: old.best,
      bank: old.bank,
      lastTime: performance.now(),
    };
    sync();
  }, [sync]);

  const finish = useCallback(() => {
    const g = stateRef.current;
    g.phase = "gameover";
    g.best = Math.max(g.best, Math.floor(g.score));
    g.bank += g.tokens;
    g.flash = 1;
    persist();
    sync();
  }, [persist, sync]);

  const move = useCallback((dir: -1 | 1) => {
    const g = stateRef.current;
    if (g.phase !== "running") return;
    g.targetLane = clamp(g.targetLane + dir, -1, 1) as Lane;
  }, []);

  const jump = useCallback(() => {
    const g = stateRef.current;
    if (g.phase !== "running") return;
    if (g.jumpY <= 0.01 && g.slide <= 0) {
      g.jumpV = JUMP_VELOCITY;
      g.lastTime = performance.now();
    }
  }, []);

  const slide = useCallback(() => {
    const g = stateRef.current;
    if (g.phase !== "running") return;
    if (g.jumpY <= 0.04) g.slide = 0.55;
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") move(-1);
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") move(1);
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w" || event.code === "Space") jump();
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") slide();
      if (event.key.toLowerCase() === "p") {
        const g = stateRef.current;
        if (g.phase === "running") g.phase = "paused";
        else if (g.phase === "paused") {
          g.phase = "running";
          g.lastTime = performance.now();
        }
        sync();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, move, slide, sync]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = shell.getBoundingClientRect();
      width = Math.max(320, rect.width);
      height = Math.max(520, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(shell);

    const draw = () => {
      const g = stateRef.current;
      ctx.clearRect(0, 0, width, height);

      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.62);
      sky.addColorStop(0, g.environment >= 2 ? "#101a2c" : "#79b9df");
      sky.addColorStop(1, g.environment >= 2 ? "#30466a" : "#d9e6d4");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = g.environment >= 2 ? "rgba(245,220,146,.25)" : "rgba(255,240,190,.65)";
      ctx.beginPath();
      ctx.arc(width * 0.78, height * 0.16, Math.max(18, width * 0.045), 0, Math.PI * 2);
      ctx.fill();

      const p0 = project(0, width, height);
      const pFar = project(25, width, height);
      const pNear = project(WORLD_PLAYER_Z, width, height);

      ctx.fillStyle = "#78915f";
      ctx.fillRect(0, p0.y, width, height - p0.y);

      ctx.fillStyle = "#d7c7a6";
      ctx.beginPath();
      ctx.moveTo(width / 2 - p0.half, p0.y);
      ctx.lineTo(width / 2 + p0.half, p0.y);
      ctx.lineTo(width / 2 + pNear.half, pNear.y);
      ctx.lineTo(width / 2 - pNear.half, pNear.y);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#b37d57";
      ctx.beginPath();
      ctx.moveTo(width / 2 - p0.half * 0.78, p0.y);
      ctx.lineTo(width / 2 + p0.half * 0.78, p0.y);
      ctx.lineTo(width / 2 + pNear.half * 0.82, pNear.y);
      ctx.lineTo(width / 2 - pNear.half * 0.82, pNear.y);
      ctx.closePath();
      ctx.fill();

      for (const divider of [-1, 1]) {
        ctx.strokeStyle = "rgba(91,62,46,.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width / 2 + divider * p0.half * LANE_DIVIDER, p0.y);
        ctx.lineTo(width / 2 + divider * pNear.half * LANE_DIVIDER, pNear.y);
        ctx.stroke();
      }

      const sceneryZ = [7, 18, 31, 48, 70, 94];
      sceneryZ.forEach((z, i) => {
        const p = project(z, width, height);
        const side = i % 2 === 0 ? -1 : 1;
        const buildingX = width / 2 + side * (p.half + 30 * p.scale);
        const ground = p.y + 3 * p.scale;
        drawBuilding(
          ctx,
          buildingX,
          ground,
          120 + (i % 3) * 35,
          95 + (i % 2) * 30,
          p.scale,
          i === 3 ? "ACADEMIC BLOCK" : undefined,
        );

        if (i === 1 || i === 4) {
          drawWalkway(ctx, buildingX + side * 80 * p.scale, ground, 190, p.scale);
        }

        const treeX = width / 2 + side * (p.half + 12 * p.scale);
        drawTree(ctx, treeX, ground + 7 * p.scale, Math.max(0.18, p.scale));
      });

      const gateZ = 68 + ((Math.floor(g.distance / 900) % 2) * 12);
      const gateP = project(gateZ, width, height);
      drawGate(ctx, width / 2, gateP.y, gateP.scale * 0.82);

      const now = performance.now();
      for (let i = 0; i < 10; i += 1) {
        const z = ((i * 13 + now * 0.004) % 105) + 5;
        const p = project(z, width, height);
        const side = i % 2 === 0 ? -1 : 1;
        drawTree(
          ctx,
          width / 2 + side * (p.half + 28 * p.scale),
          p.y,
          Math.max(0.16, p.scale * 0.7),
        );
      }

      const obstacles = [...g.obstacles].sort((a, b) => b.z - a.z);
      for (const obstacle of obstacles) {
        if (obstacle.z < 0 || obstacle.z > WORLD_PLAYER_Z + 60) continue;
        const p = project(obstacle.z, width, height);
        const x = width / 2 + laneX(obstacle.lane, p.half);
        const laneWidth = (p.half * 2) / 3;
        const ow = laneWidth * 0.68;
        const oh = Math.max(13, 22 * p.scale);

        if (obstacle.kind === "gap") {
          ctx.fillStyle = "#554a45";
          ctx.fillRect(x - ow / 2, p.y - 4 * p.scale, ow, 7 * p.scale);
          ctx.fillStyle = "#252225";
          ctx.fillRect(x - ow / 2, p.y - 1 * p.scale, ow, 4 * p.scale);
        } else if (obstacle.kind === "low") {
          ctx.fillStyle = "#d78d35";
          ctx.fillRect(x - ow / 2, p.y - oh * 0.9, ow, oh * 0.9);
          ctx.fillStyle = "#fff0c2";
          ctx.fillRect(x - ow / 2, p.y - oh * 0.9, ow, oh * 0.22);
        } else if (obstacle.kind === "cart") {
          ctx.fillStyle = "#51606a";
          drawRoundedRect(ctx, x - ow / 2, p.y - oh * 1.05, ow, oh, 5 * p.scale);
          ctx.fill();
          ctx.fillStyle = "#1f252a";
          ctx.beginPath();
          ctx.arc(x - ow * 0.27, p.y + 1 * p.scale, 4 * p.scale, 0, Math.PI * 2);
          ctx.arc(x + ow * 0.27, p.y + 1 * p.scale, 4 * p.scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "#b44b38";
          ctx.fillRect(x - ow / 2, p.y - oh, ow, oh);
          ctx.fillStyle = "#f4c75e";
          ctx.fillRect(x - ow / 2, p.y - oh, ow, Math.max(3, oh * 0.18));
        }
      }

      for (const pickup of g.pickups) {
        if (pickup.collected || pickup.z < 0 || pickup.z > WORLD_PLAYER_Z + 45) continue;
        const p = project(pickup.z, width, height);
        const x = width / 2 + laneX(pickup.lane, p.half);
        const y = p.y - 28 * p.scale;
        if (pickup.kind === "token") drawToken(ctx, x, y, Math.max(5, 12 * p.scale));
        else drawPower(ctx, x, y, Math.max(7, 15 * p.scale), pickup.kind);
      }

      const playerP = project(WORLD_PLAYER_Z, width, height);
      const playerX = width / 2 + laneX(g.lane, playerP.half);
      drawPlayer(ctx, playerX, playerP.y, clamp(playerP.scale, 0.75, 1.08), g.jumpY, g.slide > 0);

      for (const particle of g.particles) {
        ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
        ctx.fillStyle = particle.type === "spark" ? "#f7c95c" : "#d7c8ad";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (g.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${g.flash * 0.24})`;
        ctx.fillRect(0, 0, width, height);
      }

      if (g.cameraShake > 0) {
        // Camera shake is represented through a subtle screen vignette rather than
        // transforming the entire canvas, keeping text and touch controls stable.
        const vignette = ctx.createRadialGradient(
          width / 2,
          height * 0.6,
          width * 0.15,
          width / 2,
          height * 0.6,
          width * 0.8,
        );
        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(1, `rgba(40,20,10,${g.cameraShake * 0.18})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    const tick = (time: number) => {
      const g = stateRef.current;
      if (g.phase === "running") {
        const dt = Math.min(0.033, Math.max(0, (time - g.lastTime) / 1000));
        g.lastTime = time;

        g.speed = Math.min(59, 31 + g.distance * 0.0035 + (g.sprint > 0 ? 11 : 0));
        g.distance += g.speed * dt;
        g.score += g.speed * dt * 4.2 * g.multiplier;

        const laneDiff = g.targetLane - g.lane;
        g.lane = Math.abs(laneDiff) < 0.035
          ? g.targetLane
          : (g.lane + laneDiff * Math.min(1, dt * 15)) as Lane;

        if (g.jumpY > 0 || g.jumpV > 0) {
          g.jumpY += g.jumpV * dt;
          g.jumpV -= GRAVITY * dt;
          if (g.jumpY <= 0) {
            g.jumpY = 0;
            g.jumpV = 0;
          }
        }

        g.slide = Math.max(0, g.slide - dt);
        g.magnet = Math.max(0, g.magnet - dt);
        g.shield = Math.max(0, g.shield - dt);
        g.multiplier = g.multiplier > 1 ? Math.max(1, g.multiplier - dt * 0.12) : 1;
        g.sprint = Math.max(0, g.sprint - dt);
        g.invulnerable = Math.max(0, g.invulnerable - dt);
        g.flash = Math.max(0, g.flash - dt * 2.2);
        g.cameraShake = Math.max(0, g.cameraShake - dt * 2.8);
        g.landmarkFlash = Math.max(0, g.landmarkFlash - dt);

        g.spawnClock += dt;
        if (g.spawnClock > 1.05) {
          g.spawnClock = 0;
          spawnPattern();
        }

        for (const obstacle of g.obstacles) {
          obstacle.z += g.speed * dt;

          if (obstacle.z > 85 && obstacle.z < 120 && !obstacle.checked) {
            obstacle.checked = true;
            const laneHit = Math.abs(obstacle.lane - g.lane) < 0.35;
            const jumping = g.jumpY > (obstacle.kind === "gap" ? 0.75 : 2.2);
            const sliding = g.slide > 0.08 && obstacle.kind === "low";

            if (laneHit && !jumping && !sliding && g.invulnerable <= 0) {
              if (g.shield > 0) {
                g.shield = 0;
                g.invulnerable = 1.1;
                g.cameraShake = 1;
                g.flash = 1;
                g.combo = 0;
              } else {
                finish();
                break;
              }
            } else if (!laneHit || jumping || sliding) {
              g.combo += 1;
              g.score += 45 * Math.max(1, g.combo / 4);
            }
          }
        }

        for (const pickup of g.pickups) {
          pickup.z += g.speed * dt;
          if (pickup.collected || pickup.z < 84 || pickup.z > 120) continue;

          const laneDelta = Math.abs(pickup.lane - g.lane);
          const attracted = g.magnet > 0 && pickup.kind === "token" && laneDelta < 1.4;
          const shouldCollect = laneDelta < 0.36 || attracted;

          if (shouldCollect) {
            pickup.collected = true;
            if (pickup.kind === "token") {
              g.tokens += 1;
              g.score += 100 * g.multiplier;
              g.combo += 1;
            } else if (pickup.kind === "magnet") {
              g.magnet = 7;
            } else if (pickup.kind === "shield") {
              g.shield = 1;
            } else if (pickup.kind === "multiplier") {
              g.multiplier = 2;
            } else if (pickup.kind === "sprint") {
              g.sprint = 5;
            }

            for (let i = 0; i < 7; i += 1) {
              g.particles.push({
                x: width / 2 + laneX(pickup.lane, project(pickup.z, width, height).half),
                y: project(pickup.z, width, height).y - 30,
                vx: (Math.random() - 0.5) * 90,
                vy: -Math.random() * 90,
                life: 0.45,
                maxLife: 0.45,
                size: 2 + Math.random() * 3,
                type: "spark",
              });
            }
          }
        }

        g.obstacles = g.obstacles.filter((o) => o.z < WORLD_PLAYER_Z + 65);
        g.pickups = g.pickups.filter((p) => p.z < WORLD_PLAYER_Z + 45 && !p.collected);

        for (const particle of g.particles) {
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.vy += 120 * dt;
          particle.life -= dt;
        }
        g.particles = g.particles.filter((p) => p.life > 0);

        const distanceBand = Math.floor(g.distance / 900);
        const names = [
          "ACADEMIC QUADRANGLE",
          "COVERED WALKWAY",
          "CENTRAL GARDEN",
          "SPORTS GROUNDS",
          "HOSTEL DISTRICT",
          "MAIN CAMPUS GATE",
        ];
        const nextLandmark = names[distanceBand % names.length];
        if (nextLandmark !== g.landmark) {
          g.landmark = nextLandmark;
          g.landmarkFlash = 1.7;
        }

        if (Math.floor(g.distance / 900) % 6 >= 4) g.environment = 2;
        else if (Math.floor(g.distance / 900) % 6 >= 2) g.environment = 1;
        else g.environment = 0;
      }

      draw();
      sync();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [finish, spawnPattern, sync]);

  const togglePause = () => {
    const g = stateRef.current;
    if (g.phase === "running") {
      g.phase = "paused";
    } else if (g.phase === "paused") {
      g.phase = "running";
      g.lastTime = performance.now();
    }
    sync();
  };

  return (
    <main className="runner-page">
      <div className="runner-shell" ref={shellRef}>
        <canvas ref={canvasRef} aria-label="VGB Runner game canvas" />

        <div className="runner-topbar">
          <div className="brand">
            <span className="brand-mark">V</span>
            <span>
              <strong>VGB RUNNER</strong>
              <small>{landmark}</small>
            </span>
          </div>

          {phase !== "menu" && (
            <div className="stats">
              <span>SCORE <b>{score.toLocaleString()}</b></span>
              <span>DIST <b>{distance.toLocaleString()}m</b></span>
              <span>◆ <b>{tokens}</b></span>
            </div>
          )}

          {phase === "running" && (
            <button className="pause" onClick={togglePause} aria-label="Pause game">
              II
            </button>
          )}
        </div>

        {phase === "running" && (
          <div className="status-strip">
            <span>BEST {Math.max(best, score).toLocaleString()}</span>
            <span>{stateRef.current.multiplier > 1 ? "×2 ACTIVE" : "RUNNING"}</span>
          </div>
        )}

        {phase === "menu" && (
          <section className="overlay menu">
            <div className="card">
              <div className="eyebrow">VIDYAGYAN CAMPUS</div>
              <h1>VGB <span>RUNNER</span></h1>
              <p>
                Run through the campus, master the lanes, collect VGB Tokens,
                and survive the route.
              </p>

              <div className="controls-grid">
                <div><b>← →</b><span>Switch lanes</span></div>
                <div><b>↑ / SPACE</b><span>Jump</span></div>
                <div><b>↓</b><span>Slide</span></div>
                <div><b>P</b><span>Pause</span></div>
              </div>

              <button className="primary" onClick={start}>START RUN</button>
              <div className="record">BEST RUN · {best.toLocaleString()} POINTS</div>
            </div>
          </section>
        )}

        {phase === "paused" && (
          <section className="overlay">
            <div className="card compact">
              <div className="eyebrow">RUN PAUSED</div>
              <h2>Take five.</h2>
              <button className="primary" onClick={togglePause}>RESUME</button>
            </div>
          </section>
        )}

        {phase === "gameover" && (
          <section className="overlay">
            <div className="card">
              <div className="eyebrow">RUN COMPLETE</div>
              <h2>{score.toLocaleString()}</h2>
              <p className="big-distance">{distance.toLocaleString()} metres</p>

              <div className="result-grid">
                <div><span>BEST</span><b>{Math.max(best, score).toLocaleString()}</b></div>
                <div><span>TOKENS</span><b>{tokens}</b></div>
              </div>

              <button className="primary" onClick={start}>RUN AGAIN</button>
            </div>
          </section>
        )}

        {stateRef.current.landmarkFlash > 0 && phase === "running" && (
          <div className="landmark-banner">{landmark}</div>
        )}

        <div className="touch-controls">
          <button onPointerDown={() => move(-1)} aria-label="Move left">←</button>
          <button onPointerDown={jump} aria-label="Jump">↑</button>
          <button onPointerDown={slide} aria-label="Slide">↓</button>
          <button onPointerDown={() => move(1)} aria-label="Move right">→</button>
        </div>
      </div>

      <style jsx>{`
        .runner-page {
          min-height: calc(100dvh - 0px);
          background:
            radial-gradient(circle at 20% 0%, rgba(27, 78, 52, .18), transparent 34%),
            #07110d;
          padding: 16px;
          color: #fff;
          display: grid;
          place-items: center;
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        }

        .runner-shell {
          width: min(1180px, 100%);
          height: min(820px, calc(100dvh - 32px));
          min-height: 560px;
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          background: #15251b;
          box-shadow: 0 28px 80px rgba(0,0,0,.38);
          touch-action: none;
        }

        canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .runner-topbar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          background: linear-gradient(rgba(7,17,13,.72), transparent);
          pointer-events: none;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-shadow: 0 2px 10px rgba(0,0,0,.35);
        }

        .brand-mark {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          background: #d83d39;
          font-weight: 900;
        }

        .brand strong, .brand small {
          display: block;
        }

        .brand strong {
          font-size: 13px;
          letter-spacing: .13em;
        }

        .brand small {
          margin-top: 2px;
          font-size: 9px;
          letter-spacing: .1em;
          opacity: .72;
        }

        .stats {
          display: flex;
          gap: 18px;
          padding: 9px 13px;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 14px;
          background: rgba(7,17,13,.34);
          backdrop-filter: blur(10px);
          font-size: 10px;
          letter-spacing: .08em;
        }

        .stats b {
          margin-left: 4px;
          font-size: 12px;
        }

        .pause {
          pointer-events: auto;
          border: 1px solid rgba(255,255,255,.25);
          border-radius: 12px;
          width: 38px;
          height: 38px;
          background: rgba(7,17,13,.35);
          color: white;
          font-weight: 900;
          cursor: pointer;
        }

        .status-strip {
          position: absolute;
          top: 76px;
          left: 20px;
          right: 20px;
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          letter-spacing: .12em;
          opacity: .78;
          pointer-events: none;
        }

        .overlay {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          background: linear-gradient(rgba(3,12,8,.08), rgba(3,12,8,.44));
        }

        .card {
          width: min(510px, calc(100% - 36px));
          padding: 32px;
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 24px;
          background: rgba(9,24,16,.78);
          backdrop-filter: blur(18px);
          box-shadow: 0 24px 70px rgba(0,0,0,.32);
          text-align: center;
        }

        .card.compact {
          width: min(380px, calc(100% - 36px));
        }

        .eyebrow {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .18em;
          opacity: .65;
        }

        h1 {
          margin: 10px 0 10px;
          font-size: clamp(42px, 8vw, 76px);
          line-height: .9;
          letter-spacing: -.06em;
        }

        h1 span {
          display: block;
          color: #efb947;
        }

        h2 {
          margin: 8px 0;
          font-size: clamp(42px, 8vw, 70px);
          letter-spacing: -.05em;
        }

        .card p {
          margin: 0 auto 24px;
          max-width: 430px;
          line-height: 1.6;
          color: rgba(255,255,255,.76);
        }

        .big-distance {
          margin-bottom: 22px !important;
        }

        .controls-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin: 20px 0;
        }

        .controls-grid div {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(255,255,255,.06);
          font-size: 10px;
          color: rgba(255,255,255,.65);
        }

        .controls-grid b {
          color: white;
          font-size: 10px;
        }

        .primary {
          width: 100%;
          border: 0;
          border-radius: 14px;
          padding: 15px 20px;
          background: #d83d39;
          color: white;
          font-weight: 900;
          letter-spacing: .12em;
          cursor: pointer;
          box-shadow: 0 10px 28px rgba(216,61,57,.28);
        }

        .record {
          margin-top: 14px;
          font-size: 9px;
          letter-spacing: .12em;
          opacity: .5;
        }

        .result-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 20px 0;
        }

        .result-grid div {
          padding: 13px;
          border-radius: 13px;
          background: rgba(255,255,255,.06);
        }

        .result-grid span, .result-grid b {
          display: block;
        }

        .result-grid span {
          font-size: 9px;
          opacity: .5;
          letter-spacing: .12em;
        }

        .result-grid b {
          margin-top: 4px;
          font-size: 20px;
        }

        .landmark-banner {
          position: absolute;
          left: 50%;
          top: 19%;
          transform: translateX(-50%);
          padding: 9px 14px;
          border-radius: 999px;
          background: rgba(10,25,17,.7);
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(10px);
          font-size: 10px;
          letter-spacing: .17em;
          pointer-events: none;
          animation: rise 1.7s ease forwards;
        }

        .touch-controls {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          display: grid;
          grid-template-columns: repeat(4, 54px);
          gap: 8px;
        }

        .touch-controls button {
          height: 46px;
          border: 1px solid rgba(255,255,255,.2);
          border-radius: 14px;
          background: rgba(8,21,14,.42);
          color: white;
          font-size: 19px;
          backdrop-filter: blur(10px);
          touch-action: manipulation;
        }

        @keyframes rise {
          0% { opacity: 0; transform: translate(-50%, 10px) scale(.96); }
          16%, 75% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -10px) scale(1.02); }
        }

        @media (max-width: 680px) {
          .runner-page { padding: 0; }
          .runner-shell {
            height: 100dvh;
            min-height: 0;
            border-radius: 0;
          }
          .stats {
            gap: 9px;
            padding: 8px 9px;
          }
          .stats span:nth-child(2) {
            display: none;
          }
          .card {
            padding: 24px;
          }
          .touch-controls {
            bottom: 12px;
            grid-template-columns: repeat(4, minmax(46px, 54px));
          }
        }
      `}</style>
    </main>
  );
}
