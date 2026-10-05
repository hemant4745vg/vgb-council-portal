"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Lane = -1 | 0 | 1;
type ObstacleKind = "block" | "bar" | "wall";
type PickupKind = "coin" | "magnet" | "shield" | "multiplier";

type Obstacle = {
  lane: Lane;
  z: number;
  kind: ObstacleKind;
  height: number;
};

type Pickup = {
  lane: Lane;
  z: number;
  kind: PickupKind;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  glyph: string;
};

type GameState = {
  running: boolean;
  paused: boolean;
  over: boolean;
  score: number;
  distance: number;
  coins: number;
  multiplier: number;
  speed: number;
  lane: Lane;
  targetLane: Lane;
  y: number;
  vy: number;
  sliding: number;
  shield: number;
  magnet: number;
  boost: number;
  obstacles: Obstacle[];
  pickups: Pickup[];
  particles: Particle[];
  spawnTimer: number;
  pickupTimer: number;
  flash: number;
  shake: number;
};

const STORAGE_KEY = "vgb-runner-best-v1";
const COINS_KEY = "vgb-runner-coins-v1";

const INITIAL: GameState = {
  running: false,
  paused: false,
  over: false,
  score: 0,
  distance: 0,
  coins: 0,
  multiplier: 1,
  speed: 0.32,
  lane: 0,
  targetLane: 0,
  y: 0,
  vy: 0,
  sliding: 0,
  shield: 0,
  magnet: 0,
  boost: 0,
  obstacles: [],
  pickups: [],
  particles: [],
  spawnTimer: 0.7,
  pickupTimer: 1.4,
  flash: 0,
  shake: 0,
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function laneX(lane: number, width: number) {
  return width / 2 + lane * Math.min(width * 0.115, 92);
}

function formatScore(n: number) {
  return Math.floor(n).toLocaleString("en-IN");
}

function createObstacle(): Obstacle {
  const r = Math.random();
  const kind: ObstacleKind = r < 0.58 ? "block" : r < 0.82 ? "bar" : "wall";
  return {
    lane: (Math.floor(Math.random() * 3) - 1) as Lane,
    z: 1.12,
    kind,
    height: kind === "bar" ? 0.34 : kind === "wall" ? 0.8 : 0.55,
  };
}

function createPickup(): Pickup {
  const r = Math.random();
  const kind: PickupKind =
    r < 0.72 ? "coin" : r < 0.82 ? "magnet" : r < 0.92 ? "shield" : "multiplier";

  return {
    lane: (Math.floor(Math.random() * 3) - 1) as Lane,
    z: 1.1,
    kind,
  };
}

export default function RunnerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState>({ ...INITIAL });
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const [best, setBest] = useState(0);
  const [bankedCoins, setBankedCoins] = useState(0);
  const [, render] = useState(0);

  useEffect(() => {
    try {
      setBest(Number(localStorage.getItem(STORAGE_KEY) || 0));
      setBankedCoins(Number(localStorage.getItem(COINS_KEY) || 0));
    } catch {}
  }, []);

  const saveBest = useCallback((score: number) => {
    setBest((old) => {
      const next = Math.max(old, Math.floor(score));
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const saveCoins = useCallback((coins: number) => {
    setBankedCoins((old) => {
      const next = old + coins;
      try {
        localStorage.setItem(COINS_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const resetGame = useCallback(() => {
    gameRef.current = {
      ...INITIAL,
      running: true,
      spawnTimer: 0.65,
      pickupTimer: 0.9,
    };
    lastRef.current = performance.now();
    render((x) => x + 1);
  }, []);

  const startGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const endGame = useCallback(() => {
    const g = gameRef.current;
    if (g.over) return;
    g.over = true;
    g.running = false;
    g.flash = 0.35;
    g.shake = 0.35;
    saveBest(g.score);
    saveCoins(g.coins);
    render((x) => x + 1);
  }, [saveBest, saveCoins]);

  const move = useCallback((direction: -1 | 1) => {
    const g = gameRef.current;
    if (!g.running || g.paused || g.over) return;
    g.targetLane = clamp(g.targetLane + direction, -1, 1) as Lane;
  }, []);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g.running || g.paused || g.over) return;
    if (g.y <= 0.001) {
      g.vy = 1.15;
      g.y = 0.01;
    }
  }, []);

  const slide = useCallback(() => {
    const g = gameRef.current;
    if (!g.running || g.paused || g.over) return;
    g.sliding = 0.55;
  }, []);

  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (!g.running || g.over) return;
    g.paused = !g.paused;
    lastRef.current = performance.now();
    render((x) => x + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") move(-1);
      else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") move(1);
      else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w" || e.key === " ") jump();
      else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") slide();
      else if (e.key.toLowerCase() === "p" || e.key === "Escape") togglePause();
    };

    window.addEventListener("keydown", onKey, { passive: false });
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, move, slide, togglePause]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const drawRounded = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
      fill: string,
      stroke?: string
    ) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fillStyle = fill;
      ctx.fill();
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.stroke();
      }
    };

    const addParticle = (
      g: GameState,
      x: number,
      y: number,
      glyph: string,
      count = 3
    ) => {
      for (let i = 0; i < count; i++) {
        const life = 0.35 + Math.random() * 0.45;
        g.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 120,
          vy: -20 - Math.random() * 90,
          life,
          maxLife: life,
          size: 6 + Math.random() * 7,
          glyph,
        });
      }
    };

    const update = (dt: number) => {
      const g = gameRef.current;
      if (!g.running || g.paused || g.over) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      g.distance += g.speed * dt * 260;
      g.speed = Math.min(0.72, 0.32 + g.distance / 22000);
      if (g.boost > 0) g.boost -= dt;
      if (g.magnet > 0) g.magnet -= dt;
      if (g.shield > 0) g.shield -= dt;
      if (g.sliding > 0) g.sliding -= dt;
      g.flash = Math.max(0, g.flash - dt);
      g.shake = Math.max(0, g.shake - dt);

      g.lane += (g.targetLane - g.lane) * Math.min(1, dt * 14);
      g.y += g.vy * dt;
      g.vy -= 2.9 * dt;
      if (g.y <= 0) {
        g.y = 0;
        g.vy = 0;
      }

      const actualSpeed = g.speed * (g.boost > 0 ? 1.55 : 1);
      const worldDelta = actualSpeed * dt;

      g.spawnTimer -= dt;
      if (g.spawnTimer <= 0) {
        g.obstacles.push(createObstacle());

        // Occasionally add a second obstacle, but always leave at least one lane open.
        if (Math.random() < Math.min(0.3, g.distance / 18000)) {
          const second = createObstacle();
          if (second.lane !== g.obstacles[g.obstacles.length - 1].lane) {
            g.obstacles.push(second);
          }
        }

        g.spawnTimer = Math.max(0.42, 0.92 - g.distance / 24000) + Math.random() * 0.42;
      }

      g.pickupTimer -= dt;
      if (g.pickupTimer <= 0) {
        g.pickups.push(createPickup());
        g.pickupTimer = 0.8 + Math.random() * 0.85;
      }

      for (const o of g.obstacles) o.z -= worldDelta;
      for (const p of g.pickups) p.z -= worldDelta;

      const playerLane = Math.round(g.lane) as Lane;

      for (const o of g.obstacles) {
        if (o.z > 0.035 && o.z < 0.11 && o.lane === playerLane) {
          const safeJump = g.y > (o.kind === "bar" ? 0.32 : 0.55);
          const safeSlide = o.kind === "bar" && g.sliding > 0;
          if (!safeJump && !safeSlide) {
            if (g.shield > 0) {
              g.shield = 0;
              o.z = -1;
              g.flash = 0.18;
              g.shake = 0.15;
              addParticle(g, laneX(playerLane, width), height * 0.68, "✦", 10);
            } else {
              endGame();
              return;
            }
          }
        }
      }

      for (const p of g.pickups) {
        if (p.z > 0.02 && p.z < 0.14) {
          const sameLane = p.lane === playerLane;
          const px = laneX(p.lane, width);
          const playerX = laneX(g.lane, width);
          const magnetPull = g.magnet > 0 && Math.abs(px - playerX) < 120;

          if (sameLane || magnetPull) {
            p.z = -1;
            if (p.kind === "coin") {
              g.coins += 1;
              g.score += 100 * g.multiplier;
              addParticle(g, playerX, height * 0.68 - g.y * 100, "✦", 4);
            } else if (p.kind === "magnet") {
              g.magnet = 7;
              g.score += 250;
              addParticle(g, playerX, height * 0.68, "◆", 8);
            } else if (p.kind === "shield") {
              g.shield = 8;
              g.score += 250;
              addParticle(g, playerX, height * 0.68, "◇", 8);
            } else {
              g.multiplier = Math.min(5, g.multiplier + 1);
              g.score += 500;
              addParticle(g, playerX, height * 0.68, "×", 8);
            }
          }
        }
      }

      g.obstacles = g.obstacles.filter((o) => o.z > -0.15);
      g.pickups = g.pickups.filter((p) => p.z > -0.15);

      g.score += actualSpeed * dt * 80 * g.multiplier;

      for (const p of g.particles) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 150 * dt;
      }
      g.particles = g.particles.filter((p) => p.life > 0);

      if (Math.random() < dt * 9) {
        addParticle(
          g,
          laneX(g.lane, width) + (Math.random() - 0.5) * 24,
          height * 0.78,
          "·",
          1
        );
      }
    };

    const projectZ = (z: number, height: number) => {
      const t = clamp(1 - z, 0, 1);
      const eased = Math.pow(t, 1.7);
      return {
        y: height * 0.22 + eased * height * 0.58,
        scale: 0.12 + eased * 1.15,
      };
    };

    const draw = () => {
      const g = gameRef.current;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      ctx.clearRect(0, 0, width, height);

      // Sky.
      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#071b35");
      sky.addColorStop(0.52, "#123f65");
      sky.addColorStop(1, "#08151f");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Distant glow.
      const glow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.3,
        10,
        width * 0.5,
        height * 0.3,
        width * 0.55
      );
      glow.addColorStop(0, "rgba(82,210,255,0.22)");
      glow.addColorStop(1, "rgba(82,210,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Distant city/campus silhouettes.
      const horizon = height * 0.42;
      ctx.fillStyle = "rgba(3,13,25,0.75)";
      for (let i = 0; i < 18; i++) {
        const bw = 25 + ((i * 17) % 45);
        const bh = 30 + ((i * 31) % 90);
        const bx = (i / 18) * width;
        ctx.fillRect(bx, horizon - bh, bw, bh);
      }

      // Track.
      const vanishingX = width / 2;
      const vanishingY = height * 0.4;
      const bottomY = height * 0.98;
      ctx.beginPath();
      ctx.moveTo(vanishingX - width * 0.045, vanishingY);
      ctx.lineTo(vanishingX + width * 0.045, vanishingY);
      ctx.lineTo(width * 0.93, bottomY);
      ctx.lineTo(width * 0.07, bottomY);
      ctx.closePath();
      const road = ctx.createLinearGradient(0, vanishingY, 0, bottomY);
      road.addColorStop(0, "#1d2935");
      road.addColorStop(1, "#101820");
      ctx.fillStyle = road;
      ctx.fill();

      // Lane separators.
      for (const lane of [-0.5, 0.5]) {
        ctx.beginPath();
        ctx.moveTo(vanishingX + lane * width * 0.045, vanishingY);
        ctx.lineTo(width / 2 + lane * width * 0.415, bottomY);
        ctx.strokeStyle = "rgba(164,220,236,0.24)";
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 18]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Road glow lines.
      for (let i = 0; i < 8; i++) {
        const z = ((i / 8) + (g.distance / 450)) % 1;
        const py = vanishingY + Math.pow(z, 1.7) * (bottomY - vanishingY);
        const half = 10 + z * width * 0.36;
        ctx.strokeStyle = `rgba(88,210,255,${0.06 + z * 0.1})`;
        ctx.lineWidth = 1 + z * 2;
        ctx.beginPath();
        ctx.moveTo(width / 2 - half, py);
        ctx.lineTo(width / 2 + half, py);
        ctx.stroke();
      }

      // Objects sorted back to front.
      const objects = [
        ...g.obstacles.map((o) => ({ type: "obstacle" as const, item: o })),
        ...g.pickups.map((p) => ({ type: "pickup" as const, item: p })),
      ].sort((a, b) => b.item.z - a.item.z);

      for (const obj of objects) {
        if (obj.item.z < 0 || obj.item.z > 1.2) continue;
        const { y, scale } = projectZ(obj.item.z, height);
        const x = laneX(obj.item.lane, width);
        const s = scale;

        if (obj.type === "pickup") {
          const p = obj.item;
          const glyph =
            p.kind === "coin" ? "◆" : p.kind === "magnet" ? "M" : p.kind === "shield" ? "◇" : "×";
          const size = 17 * s + 8;
          ctx.save();
          ctx.shadowBlur = 16;
          ctx.shadowColor =
            p.kind === "coin"
              ? "#ffd34e"
              : p.kind === "magnet"
              ? "#72e5ff"
              : p.kind === "shield"
              ? "#a6ffb2"
              : "#ff9cf2";
          ctx.fillStyle = "#ffffff";
          ctx.font = `900 ${size}px system-ui`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(glyph, x, y - 24 * s);
          ctx.restore();
        } else {
          const o = obj.item;
          const w = 58 * s + 12;
          const h = (o.kind === "bar" ? 34 : o.kind === "wall" ? 62 : 48) * s + 8;
          const ox = x - w / 2;
          const oy = y - h;

          const fill =
            o.kind === "bar"
              ? "rgba(255,167,69,0.96)"
              : o.kind === "wall"
              ? "rgba(255,79,106,0.96)"
              : "rgba(239,247,255,0.94)";

          drawRounded(ox, oy, w, h, 8 * s + 2, fill);
          ctx.strokeStyle = "rgba(255,255,255,0.4)";
          ctx.lineWidth = Math.max(1, s * 2);
          ctx.strokeRect(ox, oy, w, h);

          if (o.kind === "bar") {
            ctx.fillStyle = "rgba(20,35,50,0.85)";
            ctx.fillRect(ox + w * 0.12, oy + h * 0.35, w * 0.76, h * 0.3);
          }
        }
      }

      // Player shadow.
      const playerX = laneX(g.lane, width);
      const playerBaseY = height * 0.78;
      ctx.save();
      ctx.globalAlpha = Math.max(0.15, 0.42 - g.y * 0.15);
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(playerX, playerBaseY + 10, 30 - g.y * 6, 9 - g.y * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Player.
      const py = playerBaseY - g.y * 120;
      const sliding = g.sliding > 0;
      const pw = sliding ? 72 : 42;
      const ph = sliding ? 30 : 72;

      ctx.save();
      if (g.shield > 0) {
        ctx.beginPath();
        ctx.arc(playerX, py - ph * 0.48, 46, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(111,235,255,0.16)";
        ctx.fill();
        ctx.strokeStyle = "rgba(130,242,255,0.9)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      drawRounded(
        playerX - pw / 2,
        py - ph,
        pw,
        ph,
        12,
        "#f5f8ff",
        "rgba(92,222,255,0.9)"
      );

      // Head / visor.
      ctx.fillStyle = "#0a2740";
      ctx.beginPath();
      ctx.arc(playerX, py - ph + 17, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7fe8ff";
      ctx.fillRect(playerX - 8, py - ph + 13, 16, 5);

      // Shoes.
      ctx.fillStyle = "#5ce0ff";
      ctx.fillRect(playerX - pw * 0.42, py - 7, 13, 7);
      ctx.fillRect(playerX + pw * 0.13, py - 7, 13, 7);
      ctx.restore();

      // Particles.
      for (const p of g.particles) {
        ctx.save();
        ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
        ctx.fillStyle = "#a8efff";
        ctx.font = `900 ${p.size}px system-ui`;
        ctx.textAlign = "center";
        ctx.fillText(p.glyph, p.x, p.y);
        ctx.restore();
      }

      // Vignette.
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.2,
        width / 2,
        height / 2,
        height * 0.75
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.38)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      if (g.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${g.flash})`;
        ctx.fillRect(0, 0, width, height);
      }
    };

    const frame = (time: number) => {
      const dt = Math.min(0.035, Math.max(0, (time - lastRef.current) / 1000));
      lastRef.current = time;
      update(dt);
      draw();
      render((x) => x + 1);
      rafRef.current = requestAnimationFrame(frame);
    };

    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [endGame]);

  const g = gameRef.current;
  const status = !g.running && !g.over ? "ready" : g.over ? "over" : g.paused ? "paused" : "running";

  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        padding: "18px",
        background:
          "radial-gradient(circle at top, rgba(49,104,151,.16), transparent 35%), #070d14",
        color: "#eef7ff",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "#6fe4ff",
              }}
            >
              VGB Arcade
            </div>
            <h1 style={{ margin: "3px 0 0", fontSize: "clamp(28px, 5vw, 48px)", lineHeight: 1 }}>
              Runner
            </h1>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={pillStyle}>
              BEST&nbsp; {formatScore(best)}
            </div>
            <div style={pillStyle}>COINS&nbsp; {bankedCoins}</div>
            <button onClick={togglePause} style={smallButtonStyle} disabled={!g.running || g.over}>
              {g.paused ? "Resume" : "Pause"}
            </button>
          </div>
        </header>

        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 24,
            border: "1px solid rgba(136,220,255,.2)",
            boxShadow: "0 22px 70px rgba(0,0,0,.4)",
            background: "#08121c",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "min(72vh, 700px)",
              minHeight: 520,
              display: "block",
              touchAction: "none",
            }}
          />

          {status === "running" && (
            <div
              style={{
                position: "absolute",
                inset: "14px 16px auto",
                display: "flex",
                justifyContent: "space-between",
                pointerEvents: "none",
                fontWeight: 800,
              }}
            >
              <div>
                <div style={hudLabel}>SCORE</div>
                <div style={hudValue}>{formatScore(g.score)}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={hudLabel}>DISTANCE</div>
                <div style={hudValue}>{(g.distance / 1000).toFixed(2)} KM</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={hudLabel}>×{g.multiplier}</div>
                <div style={hudValue}>🪙 {g.coins}</div>
              </div>
            </div>
          )}

          {status === "ready" && (
            <Overlay>
              <div style={eyebrow}>ENDLESS ARCADE</div>
              <h2 style={overlayTitle}>Run. Dodge. Repeat.</h2>
              <p style={overlayText}>
                Three lanes. Increasing speed. A frankly unreasonable number of obstacles.
              </p>
              <button onClick={startGame} style={primaryButtonStyle}>
                START RUN
              </button>
              <div style={controlsText}>← → / A D to move · ↑ / W / Space to jump · ↓ / S to slide</div>
            </Overlay>
          )}

          {status === "paused" && (
            <Overlay>
              <div style={eyebrow}>PAUSED</div>
              <h2 style={overlayTitle}>Take five.</h2>
              <p style={overlayText}>The obstacles have generously agreed to wait.</p>
              <button onClick={togglePause} style={primaryButtonStyle}>
                RESUME
              </button>
            </Overlay>
          )}

          {status === "over" && (
            <Overlay>
              <div style={eyebrow}>RUN COMPLETE</div>
              <h2 style={overlayTitle}>{formatScore(g.score)}</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                  gap: 8,
                  width: "min(460px, 100%)",
                  margin: "6px 0 18px",
                }}
              >
                <Stat label="DISTANCE" value={`${(g.distance / 1000).toFixed(2)} km`} />
                <Stat label="COINS" value={String(g.coins)} />
                <Stat label="BEST" value={formatScore(Math.max(best, g.score))} />
              </div>
              <button onClick={startGame} style={primaryButtonStyle}>
                RUN AGAIN
              </button>
            </Overlay>
          )}
        </section>

        <footer
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            color: "rgba(226,241,250,.55)",
            fontSize: 12,
            padding: "0 4px",
          }}
        >
          <span>VGB Runner · local high score</span>
          <span>Keyboard + touch friendly</span>
        </footer>
      </div>
    </main>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 24,
        background: "linear-gradient(rgba(3,11,18,.3), rgba(3,11,18,.78))",
        backdropFilter: "blur(5px)",
      }}
    >
      <div style={{ maxWidth: 620, width: "100%" }}>{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "12px 8px",
        borderRadius: 14,
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".12em", opacity: 0.55 }}>
        {label}
      </div>
      <div style={{ fontSize: 17, fontWeight: 900, marginTop: 3 }}>{value}</div>
    </div>
  );
}

const pillStyle: React.CSSProperties = {
  border: "1px solid rgba(140,220,255,.15)",
  background: "rgba(255,255,255,.045)",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: ".04em",
};

const smallButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(140,220,255,.2)",
  background: "rgba(100,190,225,.1)",
  color: "#eafaff",
  borderRadius: 999,
  padding: "8px 13px",
  fontWeight: 800,
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "1px solid rgba(159,238,255,.55)",
  background: "linear-gradient(135deg, #57dcff, #3d9cff)",
  color: "#04101a",
  borderRadius: 14,
  padding: "13px 24px",
  fontSize: 14,
  fontWeight: 950,
  letterSpacing: ".08em",
  cursor: "pointer",
  boxShadow: "0 12px 35px rgba(53,177,255,.28)",
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: ".2em",
  color: "#73e5ff",
  marginBottom: 8,
};

const overlayTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(38px, 7vw, 68px)",
  lineHeight: 0.95,
  letterSpacing: "-.045em",
};

const overlayText: React.CSSProperties = {
  margin: "14px auto 20px",
  maxWidth: 500,
  color: "rgba(238,247,255,.7)",
  lineHeight: 1.55,
};

const controlsText: React.CSSProperties = {
  marginTop: 16,
  color: "rgba(238,247,255,.52)",
  fontSize: 11,
  lineHeight: 1.5,
};

const hudLabel: React.CSSProperties = {
  fontSize: 9,
  letterSpacing: ".14em",
  opacity: 0.5,
};

const hudValue: React.CSSProperties = {
  fontSize: 17,
  marginTop: 2,
  textShadow: "0 2px 12px rgba(0,0,0,.5)",
};
