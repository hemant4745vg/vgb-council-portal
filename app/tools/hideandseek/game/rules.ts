export const HIDE_TIME = 8;
export const SEEK_TIME = 30;
export const CATCH_DISTANCE = 1.5;
export const CONE_DISTANCE = 8;
export const CONE_ANGLE = 0.5;

export type Phase = "hide" | "seek" | "caught" | "escaped" | "coins";
export type Role = "hide" | "seek";

export function angleDelta(a: number, b: number) {
  let delta = Math.abs(a - b);
  if (delta > Math.PI) delta = Math.PI * 2 - delta;
  return delta;
}

export function inCone(originX: number, originZ: number, facing: number, targetX: number, targetZ: number) {
  const dx = targetX - originX;
  const dz = targetZ - originZ;
  const distance = Math.hypot(dx, dz);
  if (distance > CONE_DISTANCE) return false;
  return angleDelta(Math.atan2(dx, dz), facing) < CONE_ANGLE;
}

export function caught(args: { hidden: boolean; inView: boolean; distance: number }) {
  return !args.hidden && (args.inView || args.distance < CATCH_DISTANCE);
}

export function nextPhase(phase: Phase, timeLeft: number, wasCaught: boolean): Phase {
  if (wasCaught) return "caught";
  if (phase === "hide" && timeLeft <= 0) return "seek";
  if ((phase === "seek" || phase === "coins") && timeLeft <= 0) return "escaped";
  return phase;
}
