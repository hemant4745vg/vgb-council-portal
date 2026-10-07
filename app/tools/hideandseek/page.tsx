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

export default function HideAndSeekPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [sprinting, setSprinting] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;

    /* ---------------------------------------------------------
       SCENE
    --------------------------------------------------------- */

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111c);
    scene.fog = new THREE.Fog(0x07111c, 35, 120);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      300
    );

    camera.position.set(0, 5, 9);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    /* ---------------------------------------------------------
       LIGHTING
    --------------------------------------------------------- */

    const hemisphere = new THREE.HemisphereLight(
      0xbddcff,
      0x172018,
      2.1
    );

    scene.add(hemisphere);

    const sun = new THREE.DirectionalLight(0xffffff, 3);
    sun.position.set(-30, 45, 20);
    sun.castShadow = true;

    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -70;
    sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 70;
    sun.shadow.camera.bottom = -70;

    scene.add(sun);

    /* ---------------------------------------------------------
       MATERIALS
    --------------------------------------------------------- */

    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x355d42,
      roughness: 0.95,
    });

    const pathMaterial = new THREE.MeshStandardMaterial({
      color: 0x8c8b83,
      roughness: 0.9,
    });

    const buildingMaterial = new THREE.MeshStandardMaterial({
      color: 0xd5d0c4,
      roughness: 0.8,
    });

    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x343b43,
      roughness: 0.75,
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x174b68,
      roughness: 0.7,
    });

    const treeTrunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x59402c,
    });

    const treeLeafMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f653c,
      roughness: 0.9,
    });

    /* ---------------------------------------------------------
       GROUND
    --------------------------------------------------------- */

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(180, 180),
      groundMaterial
    );

    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    /* ---------------------------------------------------------
       PATHS
    --------------------------------------------------------- */

    function createPath(
      width: number,
      depth: number,
      x: number,
      z: number,
      rotation = 0
    ) {
      const path = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.04, depth),
        pathMaterial
      );

      path.position.set(x, 0.02, z);
      path.rotation.y = rotation;
      path.receiveShadow = true;

      scene.add(path);
    }

    createPath(8, 90, 0, 0);
    createPath(75, 7, 0, 0);
    createPath(6, 45, -30, -20, Math.PI / 2);
    createPath(6, 45, 30, 20, Math.PI / 2);

    /* ---------------------------------------------------------
       BUILDINGS
    --------------------------------------------------------- */

    function createBuilding(
      x: number,
      z: number,
      width: number,
      depth: number,
      height: number,
      labelAccent = false
    ) {
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        buildingMaterial
      );

      building.position.set(x, height / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;

      scene.add(building);

      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.6, 0.6, depth + 0.6),
        roofMaterial
      );

      roof.position.set(x, height + 0.3, z);
      roof.castShadow = true;
      scene.add(roof);

      if (labelAccent) {
        const accent = new THREE.Mesh(
          new THREE.BoxGeometry(width * 0.75, 0.45, 0.2),
          accentMaterial
        );

        accent.position.set(x, height * 0.58, z - depth / 2 - 0.12);
        scene.add(accent);
      }
    }

    createBuilding(-24, -28, 25, 18, 8, true);
    createBuilding(24, -28, 25, 18, 8, true);

    createBuilding(-34, 25, 20, 30, 7);
    createBuilding(34, 25, 20, 30, 7);

    createBuilding(0, 42, 32, 14, 9, true);

    /* ---------------------------------------------------------
       TREES
    --------------------------------------------------------- */

    function createTree(x: number, z: number, scale = 1) {
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.35 * scale,
          0.5 * scale,
          3 * scale,
          8
        ),
        treeTrunkMaterial
      );

      trunk.position.set(x, 1.5 * scale, z);
      trunk.castShadow = true;
      scene.add(trunk);

      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(2.4 * scale, 12, 10),
        treeLeafMaterial
      );

      crown.position.set(x, 4 * scale, z);
      crown.castShadow = true;
      scene.add(crown);
    }

    [
      [-46, -12, 1],
      [-43, 2, 0.9],
      [-48, 18, 1.1],
      [46, -8, 1],
      [44, 8, 0.9],
      [47, 28, 1.15],
      [-12, 17, 0.8],
      [13, 17, 0.9],
      [-12, 48, 1],
      [15, 48, 0.9],
    ].forEach(([x, z, scale]) => createTree(x, z, scale));

    /* ---------------------------------------------------------
       PLAYER
    --------------------------------------------------------- */

    const player = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.45, 1.15, 5, 10),
      new THREE.MeshStandardMaterial({
        color: 0x2b78a8,
        roughness: 0.65,
      })
    );

    body.position.y = 1.25;
    body.castShadow = true;

    player.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 16, 12),
      new THREE.MeshStandardMaterial({
        color: 0xf0c7a5,
        roughness: 0.8,
      })
    );

    head.position.y = 2.15;
    head.castShadow = true;

    player.add(head);

    player.position.set(0, 0, 12);

    scene.add(player);

    /* ---------------------------------------------------------
       INPUT
    --------------------------------------------------------- */

    const keys: Keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
    };

    const keyMap: Record<string, keyof Keys> = {
      KeyW: "forward",
      ArrowUp: "forward",
      KeyS: "backward",
      ArrowDown: "backward",
      KeyA: "left",
      ArrowLeft: "left",
      KeyD: "right",
      ArrowRight: "right",
      ShiftLeft: "sprint",
      ShiftRight: "sprint",
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = keyMap[event.code];

      if (key) {
        keys[key] = true;

        if (key === "sprint") {
          setSprinting(true);
        }

        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = keyMap[event.code];

      if (key) {
        keys[key] = false;

        if (key === "sprint") {
          setSprinting(false);
        }

        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    /* ---------------------------------------------------------
       CAMERA
    --------------------------------------------------------- */

    let cameraYaw = 0;
    let cameraPitch = 0.18;

    let dragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      previousMouseX = event.clientX;
      previousMouseY = event.clientY;
    };

    const onPointerUp = () => {
      dragging = false;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;

      const deltaX = event.clientX - previousMouseX;
      const deltaY = event.clientY - previousMouseY;

      previousMouseX = event.clientX;
      previousMouseY = event.clientY;

      cameraYaw -= deltaX * 0.004;
      cameraPitch -= deltaY * 0.003;

      cameraPitch = THREE.MathUtils.clamp(
        cameraPitch,
        -0.25,
        0.75
      );
    };

    renderer.domElement.addEventListener(
      "pointerdown",
      onPointerDown
    );

    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);

    /* ---------------------------------------------------------
       RESIZE
    --------------------------------------------------------- */

    const handleResize = () => {
      if (!container) return;

      camera.aspect =
        container.clientWidth / container.clientHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        container.clientWidth,
        container.clientHeight
      );
    };

    window.addEventListener("resize", handleResize);

    /* ---------------------------------------------------------
       GAME LOOP
    --------------------------------------------------------- */

    const clock = new THREE.Clock();

    const velocity = new THREE.Vector3();

    const cameraTarget = new THREE.Vector3();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);

      const direction = new THREE.Vector3();

      if (keys.forward) direction.z -= 1;
      if (keys.backward) direction.z += 1;
      if (keys.left) direction.x -= 1;
      if (keys.right) direction.x += 1;

      if (direction.lengthSq() > 0) {
        direction.normalize();

        direction.applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          cameraYaw
        );
      }

      const speed = keys.sprint ? 9 : 5;

      const targetVelocity = direction.multiplyScalar(speed);

      velocity.lerp(
        targetVelocity,
        1 - Math.pow(0.001, delta)
      );

      player.position.x += velocity.x * delta;
      player.position.z += velocity.z * delta;

      /*
       * Prototype world boundary.
       * Proper building collision comes in the next movement
       * iteration once the campus geometry is finalized.
       */
      player.position.x = THREE.MathUtils.clamp(
        player.position.x,
        -72,
        72
      );

      player.position.z = THREE.MathUtils.clamp(
        player.position.z,
        -72,
        72
      );

      if (velocity.lengthSq() > 0.05) {
        const targetRotation = Math.atan2(
          velocity.x,
          velocity.z
        );

        player.rotation.y = THREE.MathUtils.lerp(
          player.rotation.y,
          targetRotation,
          1 - Math.pow(0.001, delta * 0.8)
        );
      }

      /* Camera follows behind player */

      const cameraDistance = 8.5;

      const cameraOffset = new THREE.Vector3(
        Math.sin(cameraYaw) * cameraDistance,
        4.5 + cameraPitch * 3,
        Math.cos(cameraYaw) * cameraDistance
      );

      cameraTarget.copy(player.position);
      cameraTarget.y += 1.25;

      camera.position.lerp(
        cameraTarget.clone().add(cameraOffset),
        1 - Math.pow(0.001, delta * 4)
      );

      camera.lookAt(cameraTarget);

      renderer.render(scene, camera);

      requestAnimationFrame(animate);
    };

    animate();

    /* ---------------------------------------------------------
       CLEANUP
    --------------------------------------------------------- */

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("resize", handleResize);

      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);

      renderer.domElement.removeEventListener(
        "pointerdown",
        onPointerDown
      );

      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();

          if (Array.isArray(object.material)) {
            object.material.forEach((material) =>
              material.dispose()
            );
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <main className="relative h-[calc(100vh-64px)] min-h-[620px] w-full overflow-hidden bg-[#07111c] text-white">
      <div
        ref={mountRef}
        className="absolute inset-0"
      />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-5 top-5 rounded-2xl border border-white/10 bg-black/35 px-5 py-4 backdrop-blur-md">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
            VGB Hide & Seek
          </div>

          <div className="mt-1 text-lg font-semibold">
            Movement Prototype
          </div>

          <div className="mt-3 flex gap-3 text-xs text-white/55">
            <span>WASD Move</span>
            <span>•</span>
            <span>Shift Sprint</span>
            <span>•</span>
            <span>Drag Look</span>
          </div>
        </div>

        <div className="absolute right-5 top-5 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-right backdrop-blur-md">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Status
          </div>

          <div className="mt-1 text-sm font-medium">
            {sprinting ? "Sprinting" : "Exploring"}
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-5 py-2 text-xs text-white/50 backdrop-blur-md">
          Prototype Environment
        </div>
      </div>

      {/* Mobile movement controls */}
      <div className="pointer-events-none absolute bottom-6 left-6 flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-black/20 backdrop-blur-sm md:hidden">
        <div className="h-14 w-14 rounded-full border border-white/15 bg-white/10" />
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black/20 text-[10px] uppercase tracking-wider text-white/50 backdrop-blur-sm md:hidden">
        Look
      </div>
    </main>
  );
}
