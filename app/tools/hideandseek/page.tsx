"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Keys = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
};

type Collider = {
  box: THREE.Box3;
  name: string;
};

const WORLD_SIZE = 180;
const WORLD_LIMIT = WORLD_SIZE / 2 - 18;

const WALK_SPEED = 5;
const SPRINT_SPEED = 9;

const PLAYER_RADIUS = 0.65;
const PLAYER_HEIGHT = 1.8;

const BUILDINGS = [
  {
    name: "Academic Block",
    x: -30,
    z: -24,
    width: 34,
    depth: 20,
    height: 7,
  },
  {
    name: "Hostel Block",
    x: 30,
    z: -28,
    width: 26,
    depth: 18,
    height: 7,
  },
  {
    name: "Library",
    x: -28,
    z: 27,
    width: 24,
    depth: 16,
    height: 6,
  },
  {
    name: "Dining Hall",
    x: 26,
    z: 25,
    width: 28,
    depth: 17,
    height: 6,
  },
  {
    name: "Activity Centre",
    x: 2,
    z: -2,
    width: 18,
    depth: 14,
    height: 5,
  },
];

function createBuilding(
  scene: THREE.Scene,
  definition: (typeof BUILDINGS)[number],
  colliders: Collider[],
) {
  const {
    name,
    x,
    z,
    width,
    depth,
    height,
  } = definition;

  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const bodyGeometry = new THREE.BoxGeometry(
    width,
    height,
    depth,
  );

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xdbe4ec,
    roughness: 0.82,
  });

  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roofGeometry = new THREE.BoxGeometry(
    width + 1.4,
    0.7,
    depth + 1.4,
  );

  const roofMaterial = new THREE.MeshStandardMaterial({
    color: 0x183b56,
    roughness: 0.75,
  });

  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = height + 0.35;
  roof.castShadow = true;
  group.add(roof);

  const accentGeometry = new THREE.BoxGeometry(
    width + 0.05,
    0.3,
    0.45,
  );

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0x256f8f,
  });

  const accent = new THREE.Mesh(accentGeometry, accentMaterial);
  accent.position.set(0, height * 0.55, depth / 2 + 0.04);
  group.add(accent);

  // Entrance
  const entranceGeometry = new THREE.BoxGeometry(
    3.2,
    3.4,
    0.2,
  );

  const entranceMaterial = new THREE.MeshStandardMaterial({
    color: 0x203040,
    roughness: 0.5,
  });

  const entrance = new THREE.Mesh(
    entranceGeometry,
    entranceMaterial,
  );

  entrance.position.set(0, 1.7, depth / 2 + 0.13);
  group.add(entrance);

  scene.add(group);

  // Collider matches the building footprint.
  const box = new THREE.Box3(
    new THREE.Vector3(
      x - width / 2,
      0,
      z - depth / 2,
    ),
    new THREE.Vector3(
      x + width / 2,
      height,
      z + depth / 2,
    ),
  );

  colliders.push({
    box,
    name,
  });
}

function createTree(
  scene: THREE.Scene,
  x: number,
  z: number,
  colliders: Collider[],
) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const trunkGeometry = new THREE.CylinderGeometry(
    0.35,
    0.45,
    3,
    8,
  );

  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x765034,
  });

  const trunk = new THREE.Mesh(
    trunkGeometry,
    trunkMaterial,
  );

  trunk.position.y = 1.5;
  trunk.castShadow = true;
  group.add(trunk);

  const crownGeometry = new THREE.SphereGeometry(
    2.2,
    12,
    10,
  );

  const crownMaterial = new THREE.MeshStandardMaterial({
    color: 0x3f7f4d,
    roughness: 0.9,
  });

  const crown = new THREE.Mesh(
    crownGeometry,
    crownMaterial,
  );

  crown.position.y = 4;
  crown.castShadow = true;
  group.add(crown);

  scene.add(group);

  const radius = 0.9;

  colliders.push({
    box: new THREE.Box3(
      new THREE.Vector3(
        x - radius,
        0,
        z - radius,
      ),
      new THREE.Vector3(
        x + radius,
        5,
        z + radius,
      ),
    ),
    name: "Tree",
  });
}

function createGround(scene: THREE.Scene) {
  const groundGeometry = new THREE.PlaneGeometry(
    WORLD_SIZE,
    WORLD_SIZE,
  );

  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x55775b,
    roughness: 1,
  });

  const ground = new THREE.Mesh(
    groundGeometry,
    groundMaterial,
  );

  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Main paths
  const pathMaterial = new THREE.MeshStandardMaterial({
    color: 0xb8b39f,
    roughness: 0.95,
  });

  const horizontalPath = new THREE.Mesh(
    new THREE.BoxGeometry(WORLD_SIZE, 0.08, 7),
    pathMaterial,
  );

  horizontalPath.position.y = 0.04;
  scene.add(horizontalPath);

  const verticalPath = new THREE.Mesh(
    new THREE.BoxGeometry(7, 0.08, WORLD_SIZE),
    pathMaterial,
  );

  verticalPath.position.y = 0.045;
  scene.add(verticalPath);

  // Courtyard
  const courtyard = new THREE.Mesh(
    new THREE.CircleGeometry(13, 40),
    new THREE.MeshStandardMaterial({
      color: 0x8c9b7d,
      roughness: 1,
    }),
  );

  courtyard.rotation.x = -Math.PI / 2;
  courtyard.position.y = 0.08;
  scene.add(courtyard);
}

function createPlayer(scene: THREE.Scene) {
  const player = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x2e78a6,
    roughness: 0.65,
  });

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.55, 0.9, 8, 16),
    bodyMaterial,
  );

  body.position.y = 1.05;
  body.castShadow = true;
  player.add(body);

  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xe1b28f,
    roughness: 0.85,
  });

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 16, 12),
    headMaterial,
  );

  head.position.y = 2;
  head.castShadow = true;
  player.add(head);

  // Small direction indicator.
  const indicator = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.18, 0.5),
    new THREE.MeshStandardMaterial({
      color: 0xf4f7fa,
    }),
  );

  indicator.position.set(0, 1.15, -0.62);
  player.add(indicator);

  player.position.set(0, 0, 12);

  scene.add(player);

  return player;
}

/**
 * Checks whether the player's horizontal footprint intersects
 * an expanded collider.
 *
 * Expanding the collider by PLAYER_RADIUS turns the player into
 * a point for collision purposes while preserving a comfortable
 * circular body radius.
 */
function collidesAt(
  x: number,
  z: number,
  colliders: Collider[],
) {
  for (const collider of colliders) {
    const expanded = collider.box.clone();

    expanded.min.x -= PLAYER_RADIUS;
    expanded.max.x += PLAYER_RADIUS;
    expanded.min.z -= PLAYER_RADIUS;
    expanded.max.z += PLAYER_RADIUS;

    if (
      x >= expanded.min.x &&
      x <= expanded.max.x &&
      z >= expanded.min.z &&
      z <= expanded.max.z
    ) {
      return collider;
    }
  }

  return null;
}

function resolveMovement(
  position: THREE.Vector3,
  delta: THREE.Vector3,
  colliders: Collider[],
) {
  let x = position.x;
  let z = position.z;

  // Resolve X independently.
  const proposedX = x + delta.x;

  if (!collidesAt(proposedX, z, colliders)) {
    x = proposedX;
  }

  // Resolve Z independently.
  const proposedZ = z + delta.z;

  if (!collidesAt(x, proposedZ, colliders)) {
    z = proposedZ;
  }

  return new THREE.Vector3(x, position.y, z);
}

export default function HideAndSeekPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [sprinting, setSprinting] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return;

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x071521);

    scene.fog = new THREE.Fog(
      0x071521,
      75,
      180,
    );

    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      400,
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2),
    );

    renderer.setSize(
      mount.clientWidth,
      mount.clientHeight,
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    mount.appendChild(renderer.domElement);

    // --------------------------------------------------
    // Lighting
    // --------------------------------------------------

    const hemisphere = new THREE.HemisphereLight(
      0xbddcff,
      0x31432f,
      1.8,
    );

    scene.add(hemisphere);

    const sun = new THREE.DirectionalLight(
      0xfff3d5,
      2.3,
    );

    sun.position.set(45, 75, 30);
    sun.castShadow = true;

    sun.shadow.mapSize.set(2048, 2048);

    sun.shadow.camera.left = -90;
    sun.shadow.camera.right = 90;
    sun.shadow.camera.top = 90;
    sun.shadow.camera.bottom = -90;

    scene.add(sun);

    // --------------------------------------------------
    // Environment
    // --------------------------------------------------

    createGround(scene);

    const colliders: Collider[] = [];

    BUILDINGS.forEach((building) => {
      createBuilding(
        scene,
        building,
        colliders,
      );
    });

    const trees = [
      [-52, -45],
      [-44, -38],
      [-55, 5],
      [-47, 42],
      [-12, 48],
      [15, 48],
      [48, 44],
      [53, 10],
      [50, -8],
      [50, -48],
      [15, -48],
      [-12, -48],
    ];

    trees.forEach(([x, z]) => {
      createTree(
        scene,
        x,
        z,
        colliders,
      );
    });

    // --------------------------------------------------
    // Player
    // --------------------------------------------------

    const player = createPlayer(scene);

    const keys: Keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
    };

    let yaw = Math.PI;
    let pitch = 0.32;

    let velocity = new THREE.Vector3();

    const targetCameraPosition = new THREE.Vector3();
    const cameraLookTarget = new THREE.Vector3();

    let pointerDown = false;
    let lastPointerX = 0;
    let lastPointerY = 0;

    let previousTime = performance.now();

    // --------------------------------------------------
    // Keyboard
    // --------------------------------------------------

    const handleKey = (
      event: KeyboardEvent,
      pressed: boolean,
    ) => {
      const key = event.key.toLowerCase();

      if (
        key === "w" ||
        key === "arrowup"
      ) {
        keys.forward = pressed;
      }

      if (
        key === "s" ||
        key === "arrowdown"
      ) {
        keys.backward = pressed;
      }

      if (
        key === "a" ||
        key === "arrowleft"
      ) {
        keys.left = pressed;
      }

      if (
        key === "d" ||
        key === "arrowright"
      ) {
        keys.right = pressed;
      }

      if (key === "shift") {
        keys.sprint = pressed;
        setSprinting(pressed);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      handleKey(event, true);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      handleKey(event, false);
    };

    window.addEventListener(
      "keydown",
      onKeyDown,
    );

    window.addEventListener(
      "keyup",
      onKeyUp,
    );

    // --------------------------------------------------
    // Mouse camera
    // --------------------------------------------------

    const onPointerDown = (
      event: PointerEvent,
    ) => {
      pointerDown = true;

      lastPointerX = event.clientX;
      lastPointerY = event.clientY;

      renderer.domElement.setPointerCapture(
        event.pointerId,
      );
    };

    const onPointerMove = (
      event: PointerEvent,
    ) => {
      if (!pointerDown) return;

      const dx =
        event.clientX - lastPointerX;

      const dy =
        event.clientY - lastPointerY;

      lastPointerX = event.clientX;
      lastPointerY = event.clientY;

      yaw -= dx * 0.004;

      pitch -= dy * 0.003;

      pitch = THREE.MathUtils.clamp(
        pitch,
        0.12,
        0.8,
      );
    };

    const onPointerUp = (
      event: PointerEvent,
    ) => {
      pointerDown = false;

      if (
        renderer.domElement.hasPointerCapture(
          event.pointerId,
        )
      ) {
        renderer.domElement.releasePointerCapture(
          event.pointerId,
        );
      }
    };

    renderer.domElement.addEventListener(
      "pointerdown",
      onPointerDown,
    );

    renderer.domElement.addEventListener(
      "pointermove",
      onPointerMove,
    );

    renderer.domElement.addEventListener(
      "pointerup",
      onPointerUp,
    );

    // --------------------------------------------------
    // Resize
    // --------------------------------------------------

    const onResize = () => {
      if (!mount) return;

      const width = mount.clientWidth;
      const height = mount.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(
        width,
        height,
      );
    };

    window.addEventListener(
      "resize",
      onResize,
    );

    // --------------------------------------------------
    // Animation
    // --------------------------------------------------

    let animationFrame = 0;

    const animate = (
      currentTime: number,
    ) => {
      animationFrame =
        requestAnimationFrame(animate);

      const delta = Math.min(
        (currentTime - previousTime) / 1000,
        0.05,
      );

      previousTime = currentTime;

      // ----------------------------------------------
      // Input direction
      // ----------------------------------------------

      const input = new THREE.Vector3();

      if (keys.forward) {
        input.z -= 1;
      }

      if (keys.backward) {
        input.z += 1;
      }

      if (keys.left) {
        input.x -= 1;
      }

      if (keys.right) {
        input.x += 1;
      }

      if (input.lengthSq() > 0) {
        input.normalize();

        // Rotate movement according to camera yaw.
        input.applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          yaw,
        );
      }

      const speed = keys.sprint
        ? SPRINT_SPEED
        : WALK_SPEED;

      const desiredVelocity =
        input.multiplyScalar(speed);

      // Smooth acceleration/deceleration.
      velocity.lerp(
        desiredVelocity,
        1 - Math.pow(0.001, delta),
      );

      const movement =
        velocity.clone().multiplyScalar(delta);

      const oldPosition =
        player.position.clone();

      const newPosition =
        resolveMovement(
          player.position,
          movement,
          colliders,
        );

      player.position.copy(newPosition);

      // Detect whether collision stopped movement.
      const movedDistance =
        oldPosition.distanceTo(
          player.position,
        );

      const intendedDistance =
        movement.length();

      const wasBlocked =
        intendedDistance > 0.001 &&
        movedDistance <
          intendedDistance * 0.35;

      setBlocked(wasBlocked);

      // World boundary.
      player.position.x =
        THREE.MathUtils.clamp(
          player.position.x,
          -WORLD_LIMIT,
          WORLD_LIMIT,
        );

      player.position.z =
        THREE.MathUtils.clamp(
          player.position.z,
          -WORLD_LIMIT,
          WORLD_LIMIT,
        );

      // Rotate player toward movement.
      if (input.lengthSq() > 0.001) {
        const targetRotation =
          Math.atan2(
            input.x,
            input.z,
          );

        player.rotation.y =
          THREE.MathUtils.lerp(
            player.rotation.y,
            targetRotation,
            1 - Math.pow(0.001, delta * 7),
          );
      }

      // ----------------------------------------------
      // Third-person camera
      // ----------------------------------------------

      const horizontalDistance = 7;
      const verticalDistance =
        3.8 + pitch * 2;

      const cameraOffset =
        new THREE.Vector3(
          Math.sin(yaw) *
            horizontalDistance,
          verticalDistance,
          Math.cos(yaw) *
            horizontalDistance,
        );

      targetCameraPosition
        .copy(player.position)
        .add(cameraOffset);

      camera.position.lerp(
        targetCameraPosition,
        1 - Math.pow(0.001, delta * 6),
      );

      cameraLookTarget
        .copy(player.position)
        .add(
          new THREE.Vector3(
            0,
            1.25,
            0,
          ),
        );

      camera.lookAt(
        cameraLookTarget,
      );

      renderer.render(
        scene,
        camera,
      );
    };

    animationFrame =
      requestAnimationFrame(animate);

    // --------------------------------------------------
    // Cleanup
    // --------------------------------------------------

    return () => {
      cancelAnimationFrame(
        animationFrame,
      );

      window.removeEventListener(
        "keydown",
        onKeyDown,
      );

      window.removeEventListener(
        "keyup",
        onKeyUp,
      );

      window.removeEventListener(
        "resize",
        onResize,
      );

      renderer.domElement.removeEventListener(
        "pointerdown",
        onPointerDown,
      );

      renderer.domElement.removeEventListener(
        "pointermove",
        onPointerMove,
      );

      renderer.domElement.removeEventListener(
        "pointerup",
        onPointerUp,
      );

      renderer.dispose();

      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh
        ) {
          object.geometry.dispose();

          if (
            Array.isArray(
              object.material,
            )
          ) {
            object.material.forEach(
              (material) =>
                material.dispose(),
            );
          } else {
            object.material.dispose();
          }
        }
      });

      if (
        mount.contains(
          renderer.domElement,
        )
      ) {
        mount.removeChild(
          renderer.domElement,
        );
      }
    };
  }, []);

  return (
    <main className="relative h-[calc(100vh-0px)] w-full overflow-hidden bg-slate-950">
      <div
        ref={mountRef}
        className="absolute inset-0"
      />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-5 top-5 rounded-2xl border border-white/10 bg-slate-950/75 px-5 py-4 shadow-xl backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            VGB Hide & Seek
          </div>

          <div className="mt-1 text-lg font-bold text-white">
            Movement Prototype
          </div>

          <div className="mt-2 text-xs leading-5 text-slate-300">
            WASD / Arrow Keys · Shift to Sprint
            <br />
            Drag to look around
          </div>
        </div>

        <div className="absolute right-5 top-5 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-right backdrop-blur-md">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Status
          </div>

          <div className="mt-1 text-sm font-semibold text-white">
            {sprinting
              ? "Sprinting"
              : "Exploring"}
          </div>
        </div>

        {blocked && (
          <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full border border-amber-300/20 bg-amber-950/75 px-4 py-2 text-xs font-medium text-amber-200 backdrop-blur-md">
            Obstacle
          </div>
        )}

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/65 px-4 py-2 text-[11px] text-slate-300 backdrop-blur-md">
          Prototype Environment
        </div>
      </div>

      {/* Mobile controls placeholder */}
      <div className="pointer-events-none absolute bottom-8 left-7 right-7 flex justify-between md:hidden">
        <div className="h-20 w-20 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm" />

        <div className="h-20 w-20 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm" />
      </div>
    </main>
  );
}
