export const PROPS = [
  { name: "Desk", x: 22, z: -74 },
  { name: "Bush", x: 34, z: -82 },
  { name: "Counter", x: 30, z: -64 },
];

export const BOUNDS = { minX: 8, maxX: 48, minZ: -92, maxZ: -52 };

export function insideProp(x: number, z: number) {
  return PROPS.find((prop) => Math.hypot(x - prop.x, z - prop.z) < 1.3) ?? null;
}
