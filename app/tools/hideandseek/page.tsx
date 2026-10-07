"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createCampusScene, CampusCollision } from "./game/geometry";

const PLAYER_RADIUS = 0.65;
const PLAYER_HEIGHT = 1.8;
const WALK_SPEED = 5.2;
const SPRINT_SPEED = 8.8;
const WORLD_LIMIT_X = 91;
const WORLD_LIMIT_Z = 99;

type Keys = Record<string, boolean>;

export default function HideAndSeekPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08120d);
    scene.fog = new THREE.Fog(0x08120d, 95, 220);

    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / Math.max(1, mount.clientHeight),
      0.1,
      500
    );
    camera.position.set(0, 5, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xbad7ff, 0x29452d, 1.5);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff0d0, 2.1);
    sun.position.set(-45, 80, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -110;
    sun.shadow.camera.right = 110;
    sun.shadow.camera.top = 110;
    sun.shadow.camera.bottom = -110;
    scene.add(sun);

    const campus = createCampusScene(scene);

    const player = new THREE.Group();
    player.position.set(-4, 0, 76);

    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 6, 10),
      new THREE.MeshStandardMaterial({ color: 0x2f79c9, roughness: 0.65 })
    );
    body.position.y = PLAYER_HEIGHT / 2;
    body.castShadow = true;
    player.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xe7b892, roughness: 0.9 })
    );
    head.position.y = PLAYER_HEIGHT + 0.25;
    head.castShadow = true;
    player.add(head);

    const facing = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x223344 })
    );
    facing.rotation.x = Math.PI / 2;
    facing.position.set(0, 1.1, -0.45);
    player.add(facing);

    scene.add(player);

    const keys: Keys = {};
    let dragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let yaw = Math.PI;
    let pitch = 0.38;

    const cameraTarget = new THREE.Vector3();
    const desiredCamera = new THREE.Vector3();
    const moveVector = new THREE.Vector3();

    const isBlocked = (x: number, z: number) => {
      const playerBox = new THREE.Box3(
        new THREE.Vector3(x - PLAYER_RADIUS, 0, z - PLAYER_RADIUS),
        new THREE.Vector3(x + PLAYER_RADIUS, PLAYER_HEIGHT, z + PLAYER_RADIUS)
      );

      return campus.collision.some((item: CampusCollision) => {
        const expanded = item.box.clone();
        expanded.min.x -= PLAYER_RADIUS;
        expanded.max.x += PLAYER_RADIUS;
        expanded.min.z -= PLAYER_RADIUS;
        expanded.max.z += PLAYER_RADIUS;
        return playerBox.intersectsBox(expanded);
      });
    };

    const resolveMove = (dx: number, dz: number) => {
      const nextX = THREE.MathUtils.clamp(
        player.position.x + dx,
        -WORLD_LIMIT_X,
        WORLD_LIMIT_X
      );
      const nextZ = THREE.MathUtils.clamp(
        player.position.z + dz,
        -WORLD_LIMIT_Z,
        WORLD_LIMIT_Z
      );

      if (!isBlocked(nextX, player.position.z)) {
        player.position.x = nextX;
      }

      if (!isBlocked(player.position.x, nextZ)) {
        player.position.z = nextZ;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      keys[event.key.toLowerCase()] = true;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keys[event.key.toLowerCase()] = false;
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;

      const dx = event.clientX - lastPointerX;
      const dy = event.clientY - lastPointerY;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;

      yaw -= dx * 0.006;
      pitch = THREE.MathUtils.clamp(pitch - dy * 0.004, 0.15, 0.85);
    };

    const onPointerUp = () => {
      dragging = false;
    };

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);

      const forward = Number(keys["w"] || keys["arrowup"]) - Number(keys["s"] || keys["arrowdown"]);
      const strafe = Number(keys["d"] || keys["arrowright"]) - Number(keys["a"] || keys["arrowleft"]);

      moveVector.set(strafe, 0, forward);

      if (moveVector.lengthSq() > 0) {
        moveVector.normalize();

        const forwardDir = new THREE.Vector3(
          -Math.sin(yaw),
          0,
          -Math.cos(yaw)
        );
        const rightDir = new THREE.Vector3(
          Math.cos(yaw),
          0,
          -Math.sin(yaw)
        );

        const worldMove = new THREE.Vector3()
          .addScaledVector(forwardDir, moveVector.z)
          .addScaledVector(rightDir, moveVector.x);

        const speed = keys["shift"] ? SPRINT_SPEED : WALK_SPEED;
        resolveMove(worldMove.x * speed * dt, worldMove.z * speed * dt);

        player.rotation.y = Math.atan2(worldMove.x, worldMove.z);
      }

      cameraTarget.set(
        player.position.x,
        player.position.y + 1.25,
        player.position.z
      );

      const cameraDistance = 8.2;
      desiredCamera.set(
        player.position.x + Math.sin(yaw) * Math.cos(pitch) * cameraDistance,
        player.position.y + 1.25 + Math.sin(pitch) * cameraDistance,
        player.position.z + Math.cos(yaw) * Math.cos(pitch) * cameraDistance
      );

      camera.position.lerp(desiredCamera, 1 - Math.pow(0.001, dt));
      camera.lookAt(cameraTarget);

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    let frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("resize", onResize);

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <main className="relative h-[calc(100vh-0px)] min-h-[620px] overflow-hidden bg-[#07100b] text-white">
      <div ref={mountRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5">
        <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 shadow-xl backdrop-blur-md">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
            VidyaGyan
          </div>
          <div className="mt-1 text-xl font-semibold tracking-tight">
            Hide &amp; Seek
          </div>
          <div className="mt-1 text-xs text-white/55">
            V0.3A • Campus Blockout
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-right shadow-xl backdrop-blur-md">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">
            Prototype
          </div>
          <div className="mt-1 text-sm font-medium text-emerald-300">
            CAMPUS MAP ACTIVE
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 max-w-sm rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-xs text-white/70 shadow-xl backdrop-blur-md">
        <div className="font-semibold text-white">Movement</div>
        <div className="mt-1">WASD / Arrow Keys · Shift to sprint</div>
        <div>Drag mouse to orbit camera</div>
      </div>

      <div className="pointer-events-none absolute bottom-5 right-5 hidden rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-right text-xs text-white/55 shadow-xl backdrop-blur-md md:block">
        <div className="font-medium text-white/80">Map status</div>
        <div className="mt-1">Real campus topology · stylized geometry</div>
        <div>Gameplay mechanics: next phase</div>
      </div>
    </main>
  );
}
