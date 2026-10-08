import { PROPS } from "./props";

export function seekerStep(seeker: { x: number; z: number }, target: { x: number; z: number }, dt: number) {
  const dx = target.x - seeker.x;
  const dz = target.z - seeker.z;
  const distance = Math.hypot(dx, dz) || 1;
  return { x: seeker.x + (dx / distance) * 2.6 * dt, z: seeker.z + (dz / distance) * 2.6 * dt, facing: Math.atan2(dx, dz) };
}

export function hiderSpot(index: number, elapsed: number) {
  const spot = PROPS[index % PROPS.length];
  const wandering = Math.sin(elapsed + index) > 0.65;
  return wandering ? { x: spot.x + 2, z: spot.z + 1, hidden: false } : { x: spot.x, z: spot.z, hidden: true };
}
