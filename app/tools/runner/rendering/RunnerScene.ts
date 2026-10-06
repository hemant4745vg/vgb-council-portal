import * as THREE from "three";
import {
  CAMERA_DISTANCE,
  CAMERA_FOV,
  CAMERA_FOV_MAX,
  CAMERA_FOV_MIN,
  CAMERA_HEIGHT,
  CAMERA_LOOK_AHEAD,
  LANE_WIDTH,
  PLAYER_HEIGHT,
  ROAD_WIDTH,
  SPAWN_Z,
  WORLD_FOG_FAR,
  WORLD_FOG_NEAR,
  clamp,
  laneX,
} from "../game/constants";
import type { Game, Obstacle, Pickup } from "../game/types";

type ObstacleView = {
  root: THREE.Group;
  body: THREE.Mesh;
  accent?: THREE.Mesh;
};

type PickupView = {
  root: THREE.Group;
  mesh: THREE.Mesh;
  ring?: THREE.Mesh;
};

export class RunnerScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private world = new THREE.Group();
  private road = new THREE.Group();
  private campus = new THREE.Group();
  private obstacles = new THREE.Group();
  private pickups = new THREE.Group();
  private particles = new THREE.Group();

  private player = new THREE.Group();
  private torso!: THREE.Mesh;
  private head!: THREE.Mesh;
  private leftArm!: THREE.Mesh;
  private rightArm!: THREE.Mesh;
  private leftLeg!: THREE.Mesh;
  private rightLeg!: THREE.Mesh;
  private shadow!: THREE.Mesh;

  private obstacleViews = new Map<number, ObstacleView>();
  private pickupViews = new Map<number, PickupView>();

  private roadMarkers: THREE.Mesh[] = [];
  private campusChunks: THREE.Group[] = [];

  private ambient!: THREE.HemisphereLight;
  private sun!: THREE.DirectionalLight;

  private width = 1;
  private height = 1;
  private elapsed = 0;
  private lastDistance = 0;
  private disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x9bbbd1);
    this.scene.fog = new THREE.Fog(0x9bbbd1, WORLD_FOG_NEAR, WORLD_FOG_FAR);

    this.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      1,
      0.1,
      260,
    );

    this.scene.add(this.world);
    this.world.add(this.road);
    this.world.add(this.campus);
    this.world.add(this.obstacles);
    this.world.add(this.pickups);
    this.world.add(this.particles);
    this.world.add(this.player);

    this.createLighting();
    this.createRoad();
    this.createCampus();
    this.createPlayer();

    this.resize(canvas.clientWidth || canvas.width, canvas.clientHeight || canvas.height);
  }

  private createLighting() {
    this.ambient = new THREE.HemisphereLight(0xdbeeff, 0x55604f, 2.15);
    this.scene.add(this.ambient);

    this.sun = new THREE.DirectionalLight(0xfff4dc, 3.25);
    this.sun.position.set(-18, 28, -18);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    this.sun.shadow.camera.near = 1;
    this.sun.shadow.camera.far = 100;
    this.sun.shadow.camera.left = -35;
    this.sun.shadow.camera.right = 35;
    this.sun.shadow.camera.top = 35;
    this.sun.shadow.camera.bottom = -15;
    this.scene.add(this.sun);
  }

  private createRoad() {
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x4b5052,
      roughness: 0.88,
      metalness: 0.02,
    });

    const roadMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(ROAD_WIDTH, SPAWN_Z + 35),
      roadMaterial,
    );
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, -0.035, SPAWN_Z / 2);
    roadMesh.receiveShadow = true;
    this.road.add(roadMesh);

    const shoulderMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b8171,
      roughness: 0.95,
    });

    for (const side of [-1, 1]) {
      const shoulder = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.12, SPAWN_Z + 35),
        shoulderMaterial,
      );
      shoulder.position.set(
        side * (ROAD_WIDTH / 2 + 1.4),
        -0.01,
        SPAWN_Z / 2,
      );
      shoulder.receiveShadow = true;
      this.road.add(shoulder);
    }

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: 0xf4f0d7,
    });

    for (const laneDivider of [-1, 1]) {
      for (let i = 0; i < 32; i += 1) {
        const marker = new THREE.Mesh(
          new THREE.BoxGeometry(0.075, 0.018, 3.2),
          lineMaterial,
        );
        marker.position.set(
          laneDivider * (ROAD_WIDTH / 6),
          0.025,
          5 + i * 7,
        );
        this.road.add(marker);
        this.roadMarkers.push(marker);
      }
    }

    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xd9c995,
      roughness: 0.8,
    });

    for (const side of [-1, 1]) {
      const edge = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.055, SPAWN_Z + 35),
        edgeMaterial,
      );
      edge.position.set(side * (ROAD_WIDTH / 2), 0.035, SPAWN_Z / 2);
      this.road.add(edge);
    }
  }

  private createCampus() {
    for (let i = 0; i < 14; i += 1) {
      const chunk = new THREE.Group();
      chunk.position.z = 8 + i * 13;
      this.buildCampusChunk(chunk, i);
      this.campus.add(chunk);
      this.campusChunks.push(chunk);
    }
  }

  private buildCampusChunk(chunk: THREE.Group, index: number) {
    const side = index % 2 === 0 ? -1 : 1;
    const building = this.createBuilding(index);

    building.position.set(
      side * (ROAD_WIDTH / 2 + 7.5 + (index % 3) * 1.4),
      0,
      0,
    );
    chunk.add(building);

    const opposite = this.createBuilding(index + 7);
    opposite.position.set(
      -side * (ROAD_WIDTH / 2 + 10 + ((index + 1) % 3) * 1.2),
      0,
      2.5,
    );
    opposite.scale.setScalar(0.82);
    chunk.add(opposite);

    const treeCount = 2 + (index % 3);
    for (let i = 0; i < treeCount; i += 1) {
      const tree = this.createTree();
      const treeSide = i % 2 === 0 ? -1 : 1;
      tree.position.set(
        treeSide * (ROAD_WIDTH / 2 + 3.5 + (i % 2) * 2.3),
        0,
        -4 + i * 3.2,
      );
      tree.scale.setScalar(0.82 + (i % 3) * 0.12);
      chunk.add(tree);
    }

    const path = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.035, 12),
      new THREE.MeshStandardMaterial({
        color: 0xbcae8e,
        roughness: 0.92,
      }),
    );
    path.position.set(
      side * (ROAD_WIDTH / 2 + 3.4),
      0.02,
      0,
    );
    path.receiveShadow = true;
    chunk.add(path);

    if (index % 4 === 0) {
      const arch = this.createWalkwayArch();
      arch.position.set(
        side * (ROAD_WIDTH / 2 + 4.2),
        0,
        1.5,
      );
      chunk.add(arch);
    }
  }

  private createBuilding(seed: number) {
    const group = new THREE.Group();

    const brick = new THREE.MeshStandardMaterial({
      color: seed % 3 === 0 ? 0x8f4d3d : 0xa65e48,
      roughness: 0.9,
    });

    const cream = new THREE.MeshStandardMaterial({
      color: 0xe3c98c,
      roughness: 0.8,
    });

    const width = 7.5 + (seed % 3) * 1.2;
    const depth = 8.5;
    const height = 5.5 + (seed % 2) * 1.1;

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      brick,
    );
    body.position.y = height / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.7, 0.35, depth + 0.7),
      cream,
    );
    roof.position.y = height + 0.18;
    roof.castShadow = true;
    group.add(roof);

    for (let floor = 0; floor < 2; floor += 1) {
      for (let window = 0; window < 4; window += 1) {
        const pane = new THREE.Mesh(
          new THREE.BoxGeometry(0.75, 0.9, 0.08),
          new THREE.MeshStandardMaterial({
            color: 0x283c49,
            roughness: 0.3,
            metalness: 0.15,
          }),
        );
        pane.position.set(
          -width / 2 + 1.15 + window * 1.65,
          1.55 + floor * 2.0,
          -depth / 2 - 0.045,
        );
        group.add(pane);
      }
    }

    const verandaRoof = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.35, 0.18, 2.2),
      cream,
    );
    verandaRoof.position.set(0, 2.65, depth / 2 + 1.05);
    verandaRoof.castShadow = true;
    group.add(verandaRoof);

    for (let i = 0; i < 5; i += 1) {
      const column = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 2.55, 0.22),
        cream,
      );
      column.position.set(
        -width / 2 + 0.7 + i * ((width - 1.4) / 4),
        1.27,
        depth / 2 + 1.05,
      );
      column.castShadow = true;
      group.add(column);
    }

    return group;
  }

  private createWalkwayArch() {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
      color: 0x934f3f,
      roughness: 0.9,
    });

    for (const x of [-1.35, 1.35]) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 3.4, 0.38),
        material,
      );
      pillar.position.set(x, 1.7, 0);
      pillar.castShadow = true;
      group.add(pillar);
    }

    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(3.1, 0.4, 0.4),
      material,
    );
    beam.position.y = 3.35;
    beam.castShadow = true;
    group.add(beam);

    return group;
  }

  private createTree() {
    const group = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.24, 2.1, 8),
      new THREE.MeshStandardMaterial({
        color: 0x694a32,
        roughness: 1,
      }),
    );
    trunk.position.y = 1.05;
    trunk.castShadow = true;
    group.add(trunk);

    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 12, 8),
      new THREE.MeshStandardMaterial({
        color: 0x47734c,
        roughness: 0.95,
      }),
    );
    crown.position.y = 2.55;
    crown.scale.y = 1.15;
    crown.castShadow = true;
    group.add(crown);

    const second = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 10, 7),
      new THREE.MeshStandardMaterial({
        color: 0x5c8758,
        roughness: 0.95,
      }),
    );
    second.position.set(0.48, 2.9, 0.1);
    second.castShadow = true;
    group.add(second);

    return group;
  }

  private createPlayer() {
    this.player.position.set(0, 0, 0);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x174f83,
      roughness: 0.72,
    });

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xd49a72,
      roughness: 0.85,
    });

    const shoeMaterial = new THREE.MeshStandardMaterial({
      color: 0x20262a,
      roughness: 0.7,
    });

    this.torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.82, 0.34),
      bodyMaterial,
    );
    this.torso.position.y = 1.17;
    this.torso.castShadow = true;
    this.player.add(this.torso);

    this.head = new THREE.Mesh(
      new THREE.SphereGeometry(0.29, 16, 12),
      skinMaterial,
    );
    this.head.position.y = 1.82;
    this.head.castShadow = true;
    this.player.add(this.head);

    this.leftArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.72, 0.18),
      bodyMaterial,
    );
    this.leftArm.position.set(-0.45, 1.16, 0);
    this.leftArm.castShadow = true;
    this.player.add(this.leftArm);

    this.rightArm = this.leftArm.clone();
    this.rightArm.position.x = 0.45;
    this.player.add(this.rightArm);

    const legMaterial = new THREE.MeshStandardMaterial({
      color: 0x263b55,
      roughness: 0.8,
    });

    this.leftLeg = new THREE.Mesh(
      new THREE.BoxGeometry(0.21, 0.72, 0.23),
      legMaterial,
    );
    this.leftLeg.position.set(-0.18, 0.48, 0);
    this.leftLeg.castShadow = true;
    this.player.add(this.leftLeg);

    this.rightLeg = this.leftLeg.clone();
    this.rightLeg.position.x = 0.18;
    this.player.add(this.rightLeg);

    const leftShoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.13, 0.46),
      shoeMaterial,
    );
    leftShoe.position.set(-0.18, 0.1, -0.08);
    leftShoe.castShadow = true;
    this.player.add(leftShoe);

    const rightShoe = leftShoe.clone();
    rightShoe.position.x = 0.18;
    this.player.add(rightShoe);

    this.shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.72, 24),
      new THREE.MeshBasicMaterial({
        color: 0x18231d,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
      }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.018;
    this.player.add(this.shadow);

    this.player.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
      }
    });
  }

  private createObstacleView(obstacle: Obstacle): ObstacleView {
    const root = new THREE.Group();
    const red = new THREE.MeshStandardMaterial({
      color: 0xb83e35,
      roughness: 0.72,
    });
    const yellow = new THREE.MeshStandardMaterial({
      color: 0xf2c94c,
      roughness: 0.55,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x343b3f,
      roughness: 0.82,
    });

    let body: THREE.Mesh;

    if (obstacle.kind === "bar") {
      body = new THREE.Mesh(
        new THREE.BoxGeometry(LANE_WIDTH * 0.82, 0.68, 0.65),
        red,
      );
      body.position.y = 1.45;

      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(LANE_WIDTH * 0.86, 0.14, 0.7),
        yellow,
      );
      stripe.position.y = 1.62;
      stripe.position.z = -0.03;
      root.add(stripe);
    } else if (obstacle.kind === "wall") {
      body = new THREE.Mesh(
        new THREE.BoxGeometry(LANE_WIDTH * 0.94, 2.35, 0.9),
        red,
      );
      body.position.y = 1.17;
    } else if (obstacle.kind === "gap") {
      body = new THREE.Mesh(
        new THREE.BoxGeometry(LANE_WIDTH * 0.88, 0.2, 2.5),
        dark,
      );
      body.position.y = 0.08;
    } else {
      body = new THREE.Mesh(
        new THREE.BoxGeometry(LANE_WIDTH * 0.82, 1.15, 1.0),
        obstacle.kind === "moving" ? yellow : red,
      );
      body.position.y = 0.58;
    }

    body.castShadow = true;
    body.receiveShadow = true;
    root.add(body);

    return { root, body };
  }

  private syncObstacles(game: Game) {
    const active = new Set<number>();

    for (const obstacle of game.obstacles) {
      if (obstacle.resolved || obstacle.z < -12 || obstacle.z > SPAWN_Z + 15) {
        continue;
      }

      active.add(obstacle.id);

      let view = this.obstacleViews.get(obstacle.id);
      if (!view) {
        view = this.createObstacleView(obstacle);
        this.obstacleViews.set(obstacle.id, view);
        this.obstacles.add(view.root);
      }

      const movement =
        obstacle.moving && obstacle.movementAmplitude
          ? Math.sin(
              this.elapsed * (obstacle.movementSpeed || 1.5) +
                (obstacle.movementPhase || 0),
            ) * obstacle.movementAmplitude
          : 0;

      view.root.position.set(
        laneX(obstacle.lane) + movement,
        0,
        obstacle.z,
      );

      if (obstacle.kind === "moving") {
        view.root.rotation.y =
          Math.sin(this.elapsed * 2.2 + obstacle.id) * 0.08;
      }
    }

    for (const [id, view] of this.obstacleViews) {
      if (!active.has(id)) {
        this.obstacles.remove(view.root);
        view.root.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        this.obstacleViews.delete(id);
      }
    }
  }

  private createPickupView(pickup: Pickup): PickupView {
    const root = new THREE.Group();

    const colors: Record<string, number> = {
      coin: 0xf4c542,
      magnet: 0xe05a47,
      shield: 0x67c7ff,
      multiplier: 0xb889ff,
      boost: 0x67e28a,
    };

    const material = new THREE.MeshStandardMaterial({
      color: colors[pickup.kind] ?? 0xf4c542,
      emissive: colors[pickup.kind] ?? 0xf4c542,
      emissiveIntensity: 0.28,
      metalness: 0.42,
      roughness: 0.28,
    });

    const geometry =
      pickup.kind === "coin"
        ? new THREE.TorusGeometry(0.28, 0.085, 10, 20)
        : new THREE.OctahedronGeometry(0.32, 1);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    root.add(mesh);

    let ring: THREE.Mesh | undefined;

    if (pickup.kind !== "coin") {
      ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.48, 0.025, 8, 24),
        new THREE.MeshBasicMaterial({
          color: colors[pickup.kind] ?? 0xffffff,
          transparent: true,
          opacity: 0.48,
        }),
      );
      ring.rotation.x = Math.PI / 2;
      root.add(ring);
    }

    return { root, mesh, ring };
  }

  private syncPickups(game: Game) {
    const active = new Set<number>();

    for (const pickup of game.pickups) {
      if (pickup.collected || pickup.z < -12 || pickup.z > SPAWN_Z + 15) {
        continue;
      }

      active.add(pickup.id);

      let view = this.pickupViews.get(pickup.id);
      if (!view) {
        view = this.createPickupView(pickup);
        this.pickupViews.set(pickup.id, view);
        this.pickups.add(view.root);
      }

      const bob =
        1.15 +
        Math.sin(this.elapsed * 4 + pickup.phase) * 0.14;

      view.root.position.set(
        laneX(pickup.lane),
        bob,
        pickup.z,
      );

      view.mesh.rotation.y = this.elapsed * 2.4 + pickup.phase;
      view.mesh.rotation.z =
        pickup.kind === "coin" ? Math.PI / 2 : this.elapsed * 1.4;

      if (view.ring) {
        view.ring.rotation.z = this.elapsed * 1.8;
        view.ring.scale.setScalar(
          1 + Math.sin(this.elapsed * 4 + pickup.phase) * 0.08,
        );
      }
    }

    for (const [id, view] of this.pickupViews) {
      if (!active.has(id)) {
        this.pickups.remove(view.root);
        view.root.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        this.pickupViews.delete(id);
      }
    }
  }

  private updatePlayer(game: Game, dt: number) {
    const p = game.player;

    this.player.position.x = THREE.MathUtils.damp(
      this.player.position.x,
      laneX(p.targetLane),
      14,
      dt,
    );

    this.player.position.y = p.y;

    const running = game.phase === "playing";
    const stride = running
      ? Math.sin(this.elapsed * (8.5 + game.speed * 0.12))
      : 0;

    const jumping = p.jumping;
    const sliding = p.sliding;

    if (sliding) {
      this.player.scale.set(1.15, 0.55, 1.18);
      this.player.position.y = Math.max(0.05, p.y + 0.1);
    } else {
      this.player.scale.set(1, 1, 1);
    }

    this.leftLeg.rotation.x = stride * 0.75;
    this.rightLeg.rotation.x = -stride * 0.75;
    this.leftArm.rotation.x = -stride * 0.65;
    this.rightArm.rotation.x = stride * 0.65;

    if (jumping) {
      this.torso.rotation.x = -0.08;
      this.head.rotation.x = -0.04;
    } else {
      this.torso.rotation.x = Math.sin(this.elapsed * 8) * 0.025;
      this.head.rotation.x = 0;
    }

    const shadowScale = clamp(1.05 - p.y * 0.18, 0.5, 1.05);
    this.shadow.scale.set(shadowScale, shadowScale, shadowScale);
    (this.shadow.material as THREE.MeshBasicMaterial).opacity =
      clamp(0.27 - p.y * 0.055, 0.08, 0.27);
  }

  private updateCamera(game: Game, dt: number) {
    const speedRatio = clamp(
      (game.speed - 18) / (42 - 18),
      0,
      1,
    );

    const targetFov = THREE.MathUtils.lerp(
      CAMERA_FOV_MIN,
      CAMERA_FOV_MAX,
      speedRatio,
    );

    this.camera.fov = THREE.MathUtils.damp(
      this.camera.fov,
      targetFov,
      5,
      dt,
    );
    this.camera.updateProjectionMatrix();

    const desiredX = this.player.position.x * 0.14;
    const desiredY = CAMERA_HEIGHT + game.player.y * 0.08;

    this.camera.position.x = THREE.MathUtils.damp(
      this.camera.position.x,
      desiredX,
      5.5,
      dt,
    );
    this.camera.position.y = THREE.MathUtils.damp(
      this.camera.position.y,
      desiredY,
      5.5,
      dt,
    );
    this.camera.position.z = -CAMERA_DISTANCE;

    const lookTarget = new THREE.Vector3(
      this.player.position.x * 0.24,
      1.0 + game.player.y * 0.16,
      CAMERA_LOOK_AHEAD,
    );

    this.camera.lookAt(lookTarget);

    const shake = game.camera.shake || 0;
    if (shake > 0) {
      this.camera.position.x +=
        Math.sin(this.elapsed * 48) * shake * 0.045;
      this.camera.position.y +=
        Math.cos(this.elapsed * 41) * shake * 0.035;
    }
  }

  private updateRoadMotion(game: Game) {
    const travel = game.distance - this.lastDistance;
    this.lastDistance = game.distance;

    if (!Number.isFinite(travel)) return;

    for (const marker of this.roadMarkers) {
      marker.position.z -= travel * 1.55;
      if (marker.position.z < -8) {
        marker.position.z += 224;
      }
    }

    const cycle = 182;
    for (const chunk of this.campusChunks) {
      chunk.position.z -= travel * 1.05;
      if (chunk.position.z < -18) {
        chunk.position.z += cycle;
      }
    }
  }

  update(game: Game, dt: number, timeSeconds: number) {
    if (this.disposed) return;

    this.elapsed = timeSeconds;

    this.updatePlayer(game, dt);
    this.updateCamera(game, dt);
    this.syncObstacles(game);
    this.syncPickups(game);
    this.updateRoadMotion(game);

    this.render();
  }

  render() {
    if (this.disposed) return;
    this.renderer.render(this.scene, this.camera);
  }

  resize(width: number, height: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);

    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;

    this.renderer.dispose();

    this.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.geometry.dispose();

      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material.dispose();
      }
    });

    this.obstacleViews.clear();
    this.pickupViews.clear();
  }
}
