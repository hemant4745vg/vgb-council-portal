export const WORLD_W = 1680;
export const WORLD_H = 1040;
export const HIDE_SECONDS = 10;
export const SEEK_SECONDS = 30;

export type Rect = { x: number; y: number; w: number; h: number; name: string };

export const BUILDINGS: Rect[] = [
  { x: 70, y: 70, w: 300, h: 190, name: "Library" },
  { x: 560, y: 60, w: 240, h: 150, name: "Labs" },
  { x: 1280, y: 70, w: 320, h: 210, name: "Hostel" },
  { x: 80, y: 760, w: 340, h: 190, name: "Hall" },
  { x: 700, y: 800, w: 260, h: 150, name: "Canteen" },
  { x: 1240, y: 740, w: 350, h: 200, name: "Admin" },
  { x: 700, y: 420, w: 220, h: 160, name: "Quad block" },
];

export const COVERS: { x: number; y: number }[] = [
  { x: 400, y: 180 },
  { x: 420, y: 300 },
  { x: 820, y: 250 },
  { x: 1200, y: 200 },
  { x: 1180, y: 340 },
  { x: 250, y: 520 },
  { x: 480, y: 640 },
  { x: 960, y: 360 },
  { x: 980, y: 640 },
  { x: 560, y: 860 },
  { x: 1100, y: 880 },
  { x: 1480, y: 560 },
  { x: 180, y: 680 },
  { x: 1320, y: 560 },
];

export const PATROL: { x: number; y: number }[] = [
  { x: 280, y: 480 },
  { x: 520, y: 300 },
  { x: 1000, y: 260 },
  { x: 1400, y: 420 },
  { x: 1320, y: 640 },
  { x: 900, y: 700 },
  { x: 480, y: 720 },
  { x: 240, y: 620 },
];

export function pointInRect(x: number, y: number, r: Rect, pad = 0) {
  return x > r.x - pad && x < r.x + r.w + pad && y > r.y - pad && y < r.y + r.h + pad;
}

export function lineBlocked(x1: number, y1: number, x2: number, y2: number) {
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(1, Math.ceil(dist / 10));
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    if (BUILDINGS.some((b) => pointInRect(x, y, b))) return true;
  }
  return false;
}

export function resolveCircle(x: number, y: number, radius: number) {
  let px = x;
  let py = y;
  for (const b of BUILDINGS) {
    const cx = Math.min(Math.max(px, b.x), b.x + b.w);
    const cy = Math.min(Math.max(py, b.y), b.y + b.h);
    let dx = px - cx;
    let dy = py - cy;
    let d2 = dx * dx + dy * dy;
    if (d2 >= radius * radius) continue;
    if (d2 < 0.0001) {
      const left = px - b.x;
      const right = b.x + b.w - px;
      const top = py - b.y;
      const bottom = b.y + b.h - py;
      const min = Math.min(left, right, top, bottom);
      if (min === left) dx = -1;
      else if (min === right) dx = 1;
      else if (min === top) dy = -1;
      else dy = 1;
      d2 = 1;
    }
    const d = Math.sqrt(d2);
    px += (dx / d) * (radius - d + 0.2);
    py += (dy / d) * (radius - d + 0.2);
  }
  px = Math.min(WORLD_W - radius, Math.max(radius, px));
  py = Math.min(WORLD_H - radius, Math.max(radius, py));
  return { x: px, y: py };
}
