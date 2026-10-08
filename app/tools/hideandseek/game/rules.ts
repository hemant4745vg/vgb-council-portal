export const HIDE_TIME = 8;
export const SEEK_TIME = 30;
export const CATCH_DISTANCE = 1.5;
export const CONE_DISTANCE = 8;
export const CONE_ANGLE = 0.5;

export type Phase = "hide" | "seek" | "caught" | "escaped" | "found" | "missed";
export type Role = "hide" | "seek";

export function angleDelta(a: number, b: number) {
  let delta = Math.abs(a - b);
  if (delta > Math.PI) delta = Math.PI * 2 - delta;
  return delta;
}

export function inCone(originX: number, originZ: number, facing: number, targetX: number, targetZ: number) {
  const dx = targetX - originX;
  const dz = targetZ - originZ;
  if (Math.hypot(dx, dz) > CONE_DISTANCE) return false;
  return angleDelta(Math.atan2(dx, dz), facing) < CONE_ANGLE;
}

export function lineBlocked(originX: number, originZ: number, targetX: number, targetZ: number, boxes: { minX: number; maxX: number; minZ: number; maxZ: number }[]) {
  const dx = targetX - originX;
  const dz = targetZ - originZ;
  const distance = Math.hypot(dx, dz) || 1;
  const stepX = dx / distance;
  const stepZ = dz / distance;
  for (let travelled = 0.6; travelled < distance - 0.4; travelled += 0.6) {
    const x = originX + stepX * travelled;
    const z = originZ + stepZ * travelled;
    if (boxes.some((box) => x > box.minX && x < box.maxX && z > box.minZ && z < box.maxZ)) return true;
  }
  return false;
}

export function seen(args: { hidden: boolean; inView: boolean; blocked: boolean }) {
  return !args.hidden && args.inView && !args.blocked;
}

export function advance(phase: Phase, timeLeft: number): { phase: Phase; timeLeft: number } {
  if (phase === "hide" && timeLeft <= 0) return { phase: "seek", timeLeft: SEEK_TIME };
  if (phase === "seek" && timeLeft <= 0) return { phase: "missed", timeLeft: 0 };
  return { phase, timeLeft };
}
