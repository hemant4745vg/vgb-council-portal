import * as THREE from "three";
import { MapBuilding, MapZone, VGB_MAP, buildingBounds } from "./map";

export type CampusCollision = {
  box: THREE.Box3;
  id: string;
};

const BRICK = 0xc15a3c;
const CREAM = 0xf1e6d0;
const BAND = 0x2f628f;
const GLASS = 0x1b2830;
const ROOF = 0xe6bc52;
const LAWN = 0x4f8a46;
const ROAD = 0x8d908c;
const WALK = 0xd7c7aa;

function makeSky() {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Mesh();
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "#16325c");
  gradient.addColorStop(0.42, "#c96a62");
  gradient.addColorStop(0.62, "#f0a36a");
  gradient.addColorStop(0.82, "#f6d7b0");
  gradient.addColorStop(1, "#f3e2c4");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 4, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(420, 20, 14),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, depthWrite: false })
  );
  sky.name = "sky";
  return sky;
}

function makeGround(size: number) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshStandardMaterial({ color: LAWN, roughness: 1 })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

function makeZone(zone: MapZone) {
  const group = new THREE.Group();
  if (zone.type === "road") {
    const asphalt = new THREE.Mesh(
      new THREE.BoxGeometry(zone.width, 0.08, zone.depth),
      new THREE.MeshStandardMaterial({ color: ROAD, roughness: 0.92 })
    );
    asphalt.position.y = 0.04;
    asphalt.receiveShadow = true;
    group.add(asphalt);
    const edge = zone.width > zone.depth;
    const curb = new THREE.Mesh(
      new THREE.BoxGeometry(edge ? zone.width : 0.35, 0.1, edge ? 0.35 : zone.depth),
      new THREE.MeshStandardMaterial({ color: 0xcbb892, roughness: 0.85 })
    );
    curb.position.set(edge ? 0 : zone.depth > 0 ? zone.width / 2 - 0.2 : 0, 0.06, edge ? zone.depth / 2 - 0.15 : 0);
    group.add(curb);
    const curb2 = curb.clone();
    curb2.position.set(edge ? 0 : -zone.width / 2 + 0.2, 0.06, edge ? -zone.depth / 2 + 0.15 : 0);
    group.add(curb2);
  } else {
    const lawn = new THREE.Mesh(
      new THREE.BoxGeometry(zone.width, 0.05, zone.depth),
      new THREE.MeshStandardMaterial({ color: zone.color ?? 0x5a9450, roughness: 1 })
    );
    lawn.position.y = 0.025;
    lawn.receiveShadow = true;
    group.add(lawn);
  }
  group.position.set(zone.x, 0, zone.z);
  return group;
}

function makeBuilding(building: MapBuilding) {
  const group = new THREE.Group();
  const brick = new THREE.MeshStandardMaterial({ color: BRICK, roughness: 0.8 });
  const cream = new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.72 });
  const blue = new THREE.MeshStandardMaterial({ color: BAND, roughness: 0.5 });
  const glass = new THREE.MeshStandardMaterial({ color: GLASS, roughness: 0.22, metalness: 0.35 });
  const roof = new THREE.MeshStandardMaterial({ color: ROOF, roughness: 0.55 });
  const h = building.height;
  const w = building.width;
  const d = building.depth;

  const body = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, h, d * 0.92), brick);
  body.position.y = h / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const capGeo = new THREE.CylinderGeometry(d * 0.46, d * 0.46, h, 18);
  for (const side of [-1, 1]) {
    const cap = new THREE.Mesh(capGeo, brick);
    cap.position.set(side * w * 0.32, h / 2, 0);
    cap.castShadow = true;
    group.add(cap);
  }

  for (const face of [-1, 1]) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(w * 0.16, h * 0.78, 0.16), cream);
    panel.position.set(0, h * 0.46, face * (d * 0.47));
    group.add(panel);
    const panel2 = panel.clone();
    panel2.position.x = w * 0.22;
    group.add(panel2);
    const panel3 = panel.clone();
    panel3.position.x = -w * 0.22;
    group.add(panel3);
  }

  const mid = new THREE.Mesh(new THREE.BoxGeometry(w * 0.78, 0.26, d + 0.35), blue);
  mid.position.y = h * 0.58;
  group.add(mid);
  const crown = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, 0.22, d + 0.55), blue);
  crown.position.y = h + 0.02;
  group.add(crown);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.42, 0.16, d * 0.5), roof);
  cap.position.y = h + 0.18;
  group.add(cap);

  const cols = Math.max(4, Math.round(w / 3.4));
  const rows = h > 7 ? 3 : 2;
  for (const face of [-1, 1]) {
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.9, 0.06), glass);
        const x = cols === 1 ? 0 : -w * 0.28 + (col / (cols - 1)) * w * 0.56;
        const y = h * 0.24 + row * (h * 0.24);
        win.position.set(x, y, face * (d * 0.48));
        group.add(win);
      }
    }
  }

  const hedge = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.7, 0.7, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x3f7a3a, roughness: 1 })
  );
  hedge.position.set(0, 0.35, d * 0.62);
  group.add(hedge);

  group.position.set(building.x, 0, building.z);
  group.rotation.y = building.rotation ?? 0;
  group.userData.mapBuildingId = building.id;
  return group;
}

function makeTree(x: number, z: number, scale = 1) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.3 * scale, 2.4 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x6d4a32, roughness: 1 })
  );
  trunk.position.y = 1.2 * scale;
  trunk.castShadow = true;
  group.add(trunk);
  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(1.55 * scale, 12, 9),
    new THREE.MeshStandardMaterial({ color: 0x2f7a3c, roughness: 1 })
  );
  crown.position.y = 3.05 * scale;
  crown.castShadow = true;
  group.add(crown);
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(1.05 * scale, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0x3d8c48, roughness: 1 })
  );
  top.position.y = 4.15 * scale;
  group.add(top);
  group.position.set(x, 0, z);
  return group;
}

function makeLight(x: number, z: number) {
  const group = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 5.2, 6),
    new THREE.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.4, metalness: 0.3 })
  );
  pole.position.y = 2.6;
  group.add(pole);
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.08, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xd8dde2, metalness: 0.3 })
  );
  arm.position.set(0.5, 5.1, 0);
  group.add(arm);
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.12, 0.28),
    new THREE.MeshStandardMaterial({ color: 0xfff1c8, emissive: 0xffd27a, emissiveIntensity: 0.35 })
  );
  head.position.set(1.05, 5.05, 0);
  group.add(head);
  group.position.set(x, 0, z);
  return group;
}

export function createCampusScene(scene: THREE.Scene) {
  const root = new THREE.Group();
  root.name = "VGBCampus";
  root.add(makeSky());
  root.add(makeGround(VGB_MAP.worldSize));

  for (const zone of VGB_MAP.zones) root.add(makeZone(zone));

  const collision: CampusCollision[] = [];
  for (const building of VGB_MAP.buildings) {
    root.add(makeBuilding(building));
    collision.push({ id: building.id, box: buildingBounds(building) });
  }

  const treePositions: Array<[number, number, number]> = [
    [-82, -82, 1.15], [-55, -88, 1.25], [-23, -88, 1], [55, -84, 1.1], [78, -73, 1.05],
    [86, -43, 1.2], [-84, -28, 0.95], [-82, 38, 1.15], [-49, 77, 1.2], [-27, 88, 1],
    [23, 86, 1.15], [55, 79, 1.05], [83, 66, 1.1], [87, 24, 0.95], [50, 28, 1],
    [15, 25, 0.9], [-5, 29, 1], [-62, 22, 1.1], [32, 37, 1.05], [-67, 63, 0.95],
  ];
  for (const [x, z, scale] of treePositions) {
    root.add(makeTree(x, z, scale));
    collision.push({
      id: `tree-${x}-${z}`,
      box: new THREE.Box3(
        new THREE.Vector3(x - 0.7 * scale, 0, z - 0.7 * scale),
        new THREE.Vector3(x + 0.7 * scale, 5 * scale, z + 0.7 * scale)
      ),
    });
  }

  for (const light of [
    [-60, -38], [-20, -38], [20, -38], [60, -38],
    [-60, 4], [-20, 4], [20, 4], [60, 4],
    [-60, 61], [-20, 61], [20, 61], [60, 61],
    [-74, -20], [-74, 30], [72, -10], [72, 40],
  ] as Array<[number, number]>) {
    root.add(makeLight(light[0], light[1]));
  }

  const walls = [
    { x: -3, z: -55, w: 33, d: 0.55, h: 1.05 },
    { x: -3, z: -37, w: 33, d: 0.55, h: 1.05 },
    { x: -22, z: -46, w: 0.55, d: 18, h: 1.05 },
    { x: 16, z: -46, w: 0.55, d: 18, h: 1.05 },
  ];
  for (const wall of walls) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(wall.w, wall.h, wall.d),
      new THREE.MeshStandardMaterial({ color: 0xb85a3c, roughness: 0.9 })
    );
    mesh.position.set(wall.x, wall.h / 2, wall.z);
    mesh.castShadow = true;
    root.add(mesh);
    collision.push({
      id: `wall-${wall.x}-${wall.z}`,
      box: new THREE.Box3(
        new THREE.Vector3(wall.x - wall.w / 2, 0, wall.z - wall.d / 2),
        new THREE.Vector3(wall.x + wall.w / 2, wall.h, wall.z + wall.d / 2)
      ),
    });
  }

  scene.add(root);
  return { root, collision };
}
