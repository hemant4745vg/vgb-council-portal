import { BUILDINGS, WORLD_H, WORLD_W } from "./world";
import type { Actor, Sim } from "./sim";

const GROUND = "#1c2822";
const LAWN = "#24352c";
const PATH = "#3c342c";
const STONE = "#e7e0d2";
const ROOF = "#8d5a45";
const WINDOW = "#2c3d4a";
const HIDER = "#7ec8b3";
const SEEKER = "#d4654a";
const YOU = "#e4b15a";
const INK = "#101612";

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  sim: Sim,
  camera: { x: number; y: number },
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2 - camera.x, height / 2 - camera.y);

  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);

  ctx.fillStyle = LAWN;
  ctx.fillRect(40, 40, WORLD_W - 80, WORLD_H - 80);

  ctx.fillStyle = PATH;
  ctx.fillRect(WORLD_W / 2 - 70, 40, 140, WORLD_H - 80);
  ctx.fillRect(40, WORLD_H / 2 - 50, WORLD_W - 80, 100);

  for (const b of BUILDINGS) {
    ctx.fillStyle = STONE;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.fillStyle = ROOF;
    ctx.fillRect(b.x, b.y, b.w, 16);
    ctx.fillStyle = WINDOW;
    for (let x = b.x + 18; x < b.x + b.w - 16; x += 28) {
      for (let y = b.y + 36; y < b.y + b.h - 16; y += 28) {
        ctx.fillRect(x, y, 12, 16);
      }
    }
  }

  for (const a of sim.actors) {
    if (a.role === "seeker" && sim.phase === "seek") drawCone(ctx, a);
  }
  for (const a of sim.actors) drawActor(ctx, a);
  ctx.restore();
}

function drawCone(ctx: CanvasRenderingContext2D, a: Actor) {
  const lx = -Math.sin(a.facing);
  const ly = -Math.cos(a.facing);
  const rx = -ly;
  const ry = lx;
  const reach = 150;
  const spread = 0.7;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(a.x + (lx + rx * spread) * reach, a.y + (ly + ry * spread) * reach);
  ctx.lineTo(a.x + (lx - rx * spread) * reach, a.y + (ly - ry * spread) * reach);
  ctx.closePath();
  ctx.fillStyle = "rgba(212, 101, 74, 0.16)";
  ctx.fill();
}

function drawActor(ctx: CanvasRenderingContext2D, a: Actor) {
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, 10, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.rotate(a.facing);
  ctx.fillStyle = a.human ? YOU : a.role === "hider" ? HIDER : SEEKER;
  ctx.beginPath();
  ctx.roundRect(-9, -12, 18, 22, 7);
  ctx.fill();
  ctx.fillStyle = "#f3efe4";
  ctx.beginPath();
  ctx.arc(0, -16, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = INK;
  ctx.font = "600 12px Outfit, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(a.name, a.x, a.y - 30);

  if (a.caged) {
    ctx.strokeStyle = "#e4b15a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(a.x, a.y, 22, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 6; i += 1) {
      const ang = (i / 6) * Math.PI;
      ctx.beginPath();
      ctx.moveTo(a.x + Math.cos(ang) * 22, a.y + Math.sin(ang) * 22);
      ctx.lineTo(a.x - Math.cos(ang) * 22, a.y - Math.sin(ang) * 22);
      ctx.stroke();
    }
  }
}

export function drawMap(ctx: CanvasRenderingContext2D, sim: Sim, size: number) {
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#101612";
  ctx.fillRect(0, 0, size, size);
  const sx = size / WORLD_W;
  const sy = size / WORLD_H;
  ctx.fillStyle = "#24352c";
  ctx.fillRect(2, 2, size - 4, size - 4);
  ctx.fillStyle = "#8d5a45";
  for (const b of BUILDINGS) {
    ctx.fillRect(b.x * sx, b.y * sy, b.w * sx, b.h * sy);
  }
  for (const a of sim.actors) {
    ctx.beginPath();
    ctx.fillStyle = a.caged ? "#e4b15a" : a.human ? YOU : a.role === "hider" ? HIDER : SEEKER;
    ctx.arc(a.x * sx, a.y * sy, a.human ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f3efe4";
    ctx.font = "600 9px Outfit, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(a.name, a.x * sx + 5, a.y * sy - 4);
  }
}
