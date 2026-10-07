import * as THREE from "three";

export type MapBuilding = {
  id: string;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  rotation?: number;
  color?: number;
  collision?: boolean;
};

export type MapZone = {
  id: string;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  type: "road" | "green" | "courtyard" | "open" | "campus";
  color?: number;
};

export type MapLandmark = {
  id: string;
  name: string;
  x: number;
  z: number;
  kind: "cafeteria" | "academic" | "hostel" | "facility" | "gate" | "ground";
};

export const VGB_MAP = {
  worldSize: 220,
  playableMinX: -92,
  playableMaxX: 92,
  playableMinZ: -100,
  playableMaxZ: 100,

  // Coordinates are normalized from the supplied campus reference.
  // They are intentionally approximate at this stage.
  buildings: [
    // North / upper campus
    { id: "north-academic-a", name: "North Academic", x: -38, z: -66, width: 28, depth: 20, height: 8, rotation: -0.28, color: 0xd9c8a7 },
    { id: "north-academic-b", name: "North Academic", x: -7, z: -61, width: 22, depth: 19, height: 7, rotation: -0.28, color: 0xd5c19e },
    { id: "cafeteria", name: "Cafeteria", x: 28, z: -71, width: 25, depth: 18, height: 7, rotation: -0.28, color: 0xd6bd95 },
    { id: "north-facility-a", name: "North Facility", x: 54, z: -48, width: 18, depth: 13, height: 6, rotation: -0.28, color: 0xcab48e },
    { id: "north-facility-b", name: "North Facility", x: 65, z: -31, width: 15, depth: 12, height: 6, rotation: -0.28, color: 0xc7af89 },

    // Central / middle campus
    { id: "central-west", name: "Central Block", x: -45, z: -20, width: 27, depth: 18, height: 7, rotation: -0.28, color: 0xd3c19f },
    { id: "central-east", name: "Central Block", x: 4, z: -22, width: 30, depth: 18, height: 7, rotation: -0.28, color: 0xd2bd98 },
    { id: "middle-west", name: "Middle Block", x: -45, z: 7, width: 22, depth: 16, height: 6, rotation: -0.28, color: 0xcdb890 },
    { id: "middle-east", name: "Middle Block", x: 10, z: 10, width: 27, depth: 16, height: 7, rotation: -0.28, color: 0xd0bb96 },

    // South campus
    { id: "south-west", name: "South Block", x: -39, z: 42, width: 28, depth: 18, height: 7, rotation: -0.28, color: 0xcdb58b },
    { id: "south-centre", name: "South Block", x: 1, z: 48, width: 30, depth: 18, height: 7, rotation: -0.28, color: 0xd0b991 },
    { id: "south-east", name: "South Facility", x: 40, z: 57, width: 25, depth: 16, height: 6, rotation: -0.28, color: 0xc5ad85 },
  ] satisfies MapBuilding[],

  zones: [
    { id: "north-green", name: "North Green", x: -62, z: -84, width: 72, depth: 25, type: "green", color: 0x6e9d67 },
    { id: "north-court", name: "North Court", x: 3, z: -46, width: 30, depth: 17, type: "courtyard", color: 0x8aaa65 },
    { id: "central-green-west", name: "Central Green", x: -68, z: -3, width: 26, depth: 35, type: "green", color: 0x64955d },
    { id: "central-green-east", name: "Central Green", x: 39, z: -4, width: 34, depth: 37, type: "green", color: 0x6b9b60 },
    { id: "south-green", name: "South Green", x: 62, z: 41, width: 34, depth: 53, type: "green", color: 0x6b995d },
    { id: "south-open", name: "South Open Area", x: -4, z: 76, width: 75, depth: 27, type: "open", color: 0x739f62 },

    // Major road bands, intentionally broad during blockout.
    { id: "road-north", name: "North Road", x: 0, z: -34, width: 172, depth: 7, type: "road", color: 0x6f7071 },
    { id: "road-central", name: "Central Spine", x: 0, z: 0, width: 180, depth: 8, type: "road", color: 0x68696a },
    { id: "road-south", name: "South Road", x: 0, z: 65, width: 174, depth: 8, type: "road", color: 0x68696a },
    { id: "road-west", name: "West Connector", x: -78, z: 25, width: 8, depth: 112, type: "road", color: 0x666768 },
    { id: "road-east", name: "East Connector", x: 76, z: 28, width: 8, depth: 116, type: "road", color: 0x666768 },
  ] satisfies MapZone[],

  landmarks: [
    { id: "lm-cafeteria", name: "Cafeteria", x: 28, z: -71, kind: "cafeteria" },
    { id: "lm-academic", name: "Academic Zone", x: -10, z: -62, kind: "academic" },
    { id: "lm-hostels", name: "Residential Zone", x: 42, z: 48, kind: "hostel" },
    { id: "lm-facility", name: "Central Facilities", x: 4, z: -22, kind: "facility" },
    { id: "lm-ground", name: "Open Ground", x: -4, z: 76, kind: "ground" },
  ] satisfies MapLandmark[],
} as const;

export function buildingBounds(b: MapBuilding) {
  const halfW = b.width / 2;
  const halfD = b.depth / 2;
  const min = new THREE.Vector3(b.x - halfW, 0, b.z - halfD);
  const max = new THREE.Vector3(b.x + halfW, b.height, b.z + halfD);
  return new THREE.Box3(min, max);
}
