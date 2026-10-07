import * as THREE from "three";
import { MapBuilding, MapZone, VGB_MAP, buildingBounds } from "./map";

export type CampusCollision = {
  box: THREE.Box3;
  id: string;
};

function makeGround(size: number) {
  const geometry = new THREE.PlaneGeometry(size, size);
  const material = new THREE.MeshStandardMaterial({ color: 0x3f6f45, roughness: 1 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

function makeZone(zone: MapZone) {
  const geometry = new THREE.BoxGeometry(zone.width, 0.06, zone.depth);
  const material = new THREE.MeshStandardMaterial({
    color: zone.color ?? 0x6f8d61,
    roughness: 0.95,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(zone.x, 0.03, zone.z);
  mesh.receiveShadow = true;
  return mesh;
}

function makeBuilding(building: MapBuilding) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(building.width, building.height, building.depth),
    new THREE.MeshStandardMaterial({
      color: building.color ?? 0xd2bd98,
      roughness: 0.88,
    })
  );
  body.position.y = building.height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // A restrained roof cap gives the blockout some dimensional readability.
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(building.width * 0.92, 0.45, building.depth * 0.92),
    new THREE.MeshStandardMaterial({ color: 0x7a6853, roughness: 0.9 })
  );
  roof.position.y = building.height + 0.22;
  roof.castShadow = true;
  group.add(roof);

  group.position.set(building.x, 0, building.z);
  group.rotation.y = building.rotation ?? 0;
  group.userData.mapBuildingId = building.id;

  return group;
}

function makeTree(x: number, z: number, scale = 1) {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * scale, 0.32 * scale, 2.3 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x76533b, roughness: 1 })
  );
  trunk.position.y = 1.15 * scale;
  trunk.castShadow = true;
  group.add(trunk);

  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(1.7 * scale, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0x356a3c, roughness: 1 })
  );
  crown.position.y = 3.0 * scale;
  crown.castShadow = true;
  group.add(crown);

  group.position.set(x, 0, z);
  return group;
}

export function createCampusScene(scene: THREE.Scene) {
  const root = new THREE.Group();
  root.name = "VGBCampus";

  root.add(makeGround(VGB_MAP.worldSize));

  for (const zone of VGB_MAP.zones) {
    root.add(makeZone(zone));
  }

  const collision: CampusCollision[] = [];

  for (const building of VGB_MAP.buildings) {
    root.add(makeBuilding(building));
    collision.push({
      id: building.id,
      box: buildingBounds(building),
    });
  }

  const treePositions: Array<[number, number, number]> = [
    [-82, -82, 1.1], [-70, -69, 0.9], [-55, -88, 1.2], [-23, -88, 0.95],
    [55, -84, 1.1], [78, -73, 1.0], [86, -43, 1.2], [-84, -28, 0.9],
    [-73, -3, 1.0], [-82, 38, 1.15], [-67, 63, 0.9], [-49, 77, 1.2],
    [-27, 88, 0.95], [23, 86, 1.15], [55, 79, 1.0], [83, 66, 1.1],
    [87, 24, 0.9], [69, 8, 1.15], [50, 28, 0.95], [32, 37, 1.1],
    [15, 25, 0.85], [-5, 29, 1.0], [-62, 22, 1.1], [-63, -20, 0.9],
  ];

  for (const [x, z, scale] of treePositions) {
    root.add(makeTree(x, z, scale));
    collision.push({
      id: `tree-${x}-${z}`,
      box: new THREE.Box3(
        new THREE.Vector3(x - 0.8 * scale, 0, z - 0.8 * scale),
        new THREE.Vector3(x + 0.8 * scale, 5.0 * scale, z + 0.8 * scale)
      ),
    });
  }

  // Low walls/fences around selected courtyards.
  const walls = [
    { x: -3, z: -55, w: 33, d: 0.8, h: 1.1 },
    { x: -3, z: -37, w: 33, d: 0.8, h: 1.1 },
    { x: -22, z: -46, w: 0.8, d: 18, h: 1.1 },
    { x: 16, z: -46, w: 0.8, d: 18, h: 1.1 },
  ];

  for (const wall of walls) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(wall.w, wall.h, wall.d),
      new THREE.MeshStandardMaterial({ color: 0xa49a86, roughness: 0.95 })
    );
    mesh.position.set(wall.x, wall.h / 2, wall.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
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
