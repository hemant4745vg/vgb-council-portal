"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createCampusScene, CampusCollision } from "./game/geometry";

const PLAYER_RADIUS = 0.65;
const PLAYER_HEIGHT = 1.8;
const WALK_SPEED = 5.2;
const SPRINT_SPEED = 8.8;
const WORLD_LIMIT_X = 91;
const WORLD_LIMIT_Z = 99;
const HIDE_TIME = 20;
const SEEK_TIME = 45;
const CATCH_DISTANCE = 1.7;

const HIDES = [
  { name: "Cafeteria", x: 28, z: -78 },
  { name: "Academic block", x: -16, z: -68 },
  { name: "South green", x: -8, z: 84 },
];

const PATROL = [
  new THREE.Vector3(0, 0, -34),
  new THREE.Vector3(62, 0, -34),
  new THREE.Vector3(-62, 0, -34),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(70, 0, 28),
  new THREE.Vector3(-70, 0, 25),
  new THREE.Vector3(0, 0, 65),
  new THREE.Vector3(-4, 0, 78),
];

type Keys = Record<string, boolean>;
type Phase = "hide" | "seek" | "caught" | "escaped";

function rayHitsBox(origin: THREE.Vector3, dir: THREE.Vector3, box: THREE.Box3, maxDistance: number) {
  let tMin = 0;
  let tMax = maxDistance;
  for (const axis of ["x", "y", "z"] as const) {
    const o = origin[axis];
    const d = dir[axis];
    const min = box.min[axis];
    const max = box.max[axis];
    if (Math.abs(d) < 1e-6) {
      if (o < min || o > max) return false;
      continue;
    }
    let t1 = (min - o) / d;
    let t2 = (max - o) / d;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  return tMax > 0.4;
}

export default function HideAndSeekPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef<Keys>({});
  const restartRef = useRef<() => void>(() => {});
  const [hud, setHud] = useState({ phase: "hide" as Phase, time: HIDE_TIME, seen: false, place: "South green" });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08120d);
    scene.fog = new THREE.Fog(0x08120d, 95, 220);
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 500);
    camera.position.set(0, 5, 8);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xbad7ff, 0x29452d, 1.5));
    const sun = new THREE.DirectionalLight(0xfff0d0, 2.1);
    sun.position.set(-45, 80, 30);
    scene.add(sun);
    const campus = createCampusScene(scene);

    const player = new THREE.Group();
    player.position.set(-4, 0, 76);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 6, 10), new THREE.MeshStandardMaterial({ color: 0x2f79c9 }));
    body.position.y = PLAYER_HEIGHT / 2;
    player.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12), new THREE.MeshStandardMaterial({ color: 0xe7b892 }));
    head.position.y = PLAYER_HEIGHT + 0.25;
    player.add(head);
    scene.add(player);

    const seeker = new THREE.Group();
    seeker.position.set(0, 0, -34);
    const seekerBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 0.7, 6, 10), new THREE.MeshStandardMaterial({ color: 0xb91c1c }));
    seekerBody.position.y = 0.95;
    seeker.add(seekerBody);
    scene.add(seeker);

    HIDES.forEach((spot) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.8, 24), new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(spot.x, 0.08, spot.z);
      scene.add(ring);
    });

    const keys = keysRef.current;
    let gameFocused = true;
    let dragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let yaw = Math.PI;
    let pitch = 0.38;
    let phase: Phase = "hide";
    let timeLeft = HIDE_TIME;
    let seen = false;
    let patrolIndex = 0;
    let pause = 0;
    let lastKnown = seeker.position.clone();
    const cameraTarget = new THREE.Vector3();
    const desiredCamera = new THREE.Vector3();
    const moveVector = new THREE.Vector3();

    const isBlocked = (x: number, z: number) => {
      const playerBox = new THREE.Box3(new THREE.Vector3(x - PLAYER_RADIUS, 0, z - PLAYER_RADIUS), new THREE.Vector3(x + PLAYER_RADIUS, PLAYER_HEIGHT, z + PLAYER_RADIUS));
      return campus.collision.some((item: CampusCollision) => playerBox.intersectsBox(item.box));
    };
    const resolveMove = (object: THREE.Object3D, dx: number, dz: number) => {
      const nextX = THREE.MathUtils.clamp(object.position.x + dx, -WORLD_LIMIT_X, WORLD_LIMIT_X);
      const nextZ = THREE.MathUtils.clamp(object.position.z + dz, -WORLD_LIMIT_Z, WORLD_LIMIT_Z);
      if (!isBlocked(nextX, object.position.z)) object.position.x = nextX;
      if (!isBlocked(object.position.x, nextZ)) object.position.z = nextZ;
    };
    const canSee = () => {
      const origin = seeker.position.clone().setY(1.5);
      const target = player.position.clone().setY(1.2);
      const dir = target.sub(origin);
      const distance = dir.length();
      if (distance < 0.2) return true;
      dir.normalize();
      return !campus.collision.some((item) => rayHitsBox(origin, dir, item.box, distance));
    };
    const nearestHide = () => HIDES.reduce((best, spot) => {
      const distance = Math.hypot(player.position.x - spot.x, player.position.z - spot.z);
      return distance < best.distance ? { name: spot.name, distance } : best;
    }, { name: HIDES[0].name, distance: Infinity }).name;

    restartRef.current = () => {
      phase = "hide";
      timeLeft = HIDE_TIME;
      seen = false;
      player.position.set(-4, 0, 76);
      seeker.position.set(0, 0, -34);
      lastKnown.copy(seeker.position);
      setHud({ phase, time: timeLeft, seen, place: nearestHide() });
    };

    const setKey = (event: KeyboardEvent, pressed: boolean) => {
      const map: Record<string, string> = { KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", ArrowUp: "arrowup", ArrowDown: "arrowdown", ArrowLeft: "arrowleft", ArrowRight: "arrowright", ShiftLeft: "shift", ShiftRight: "shift" };
      if (map[event.code]) keys[map[event.code]] = pressed;
    };
    const onKeyDown = (event: KeyboardEvent) => { gameFocused = true; setKey(event, true); };
    const onKeyUp = (event: KeyboardEvent) => setKey(event, false);
    const onPointerDown = (event: PointerEvent) => { gameFocused = true; dragging = true; lastPointerX = event.clientX; lastPointerY = event.clientY; };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      yaw -= (event.clientX - lastPointerX) * 0.006;
      pitch = THREE.MathUtils.clamp(pitch - (event.clientY - lastPointerY) * 0.004, 0.15, 0.85);
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
    };
    const onResize = () => {
      camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight);
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", () => { dragging = false; });
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let hudTick = 0;
    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (phase === "hide" || phase === "seek") {
        timeLeft = Math.max(0, timeLeft - dt);
        const forward = Number(Boolean(keys.w || keys.arrowup)) - Number(Boolean(keys.s || keys.arrowdown));
        const strafe = Number(Boolean(keys.d || keys.arrowright)) - Number(Boolean(keys.a || keys.arrowleft));
        moveVector.set(strafe, 0, forward);
        if (moveVector.lengthSq() > 0) {
          moveVector.normalize();
          const forwardDir = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
          const rightDir = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
          const worldMove = new THREE.Vector3().addScaledVector(forwardDir, moveVector.z).addScaledVector(rightDir, moveVector.x);
          const speed = keys.shift ? SPRINT_SPEED : WALK_SPEED;
          resolveMove(player, worldMove.x * speed * dt, worldMove.z * speed * dt);
          player.rotation.y = Math.atan2(worldMove.x, worldMove.z);
        }
        if (phase === "hide" && timeLeft <= 0) {
          phase = "seek";
          timeLeft = SEEK_TIME;
        }
        if (phase === "seek") {
          seen = canSee();
          if (seen) lastKnown.copy(player.position);
          const goal = seen || lastKnown.distanceTo(seeker.position) > 1.2 ? lastKnown : PATROL[patrolIndex];
          if (pause > 0) pause -= dt;
          else {
            const offset = goal.clone().sub(seeker.position);
            offset.y = 0;
            if (offset.length() < 1.1) {
              patrolIndex = (patrolIndex + 1) % PATROL.length;
              pause = 0.45;
            } else {
              offset.normalize();
              const speed = seen ? 7.4 : 4.2;
              resolveMove(seeker, offset.x * speed * dt, offset.z * speed * dt);
              seeker.rotation.y = Math.atan2(offset.x, offset.z);
            }
          }
          if (seeker.position.distanceTo(player.position) < CATCH_DISTANCE) phase = "caught";
          if (timeLeft <= 0 && phase === "seek") phase = "escaped";
        }
      }
      hudTick += dt;
      if (hudTick > 0.2) {
        hudTick = 0;
        setHud({ phase, time: Math.ceil(timeLeft), seen, place: nearestHide() });
      }
      cameraTarget.set(player.position.x, 1.25, player.position.z);
      desiredCamera.set(player.position.x + Math.sin(yaw) * Math.cos(pitch) * 8.2, 1.25 + Math.sin(pitch) * 8.2, player.position.z + Math.cos(yaw) * Math.cos(pitch) * 8.2);
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
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const hold = (name: string, pressed: boolean) => { keysRef.current[name] = pressed; };
  const ended = hud.phase === "caught" || hud.phase === "escaped";

  return (
    <main className="relative h-[calc(100vh-0px)] min-h-[620px] overflow-hidden bg-[#07100b] text-white">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5">
        <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 shadow-xl backdrop-blur-md">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">VidyaGyan</div>
          <div className="mt-1 text-xl font-semibold">Hide & Seek</div>
          <div className="mt-1 text-xs text-white/55">{hud.phase === "hide" ? "Hide before the seeker starts" : hud.phase === "seek" ? "Stay out of sight" : hud.phase === "caught" ? "Caught" : "Escaped"}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-right shadow-xl backdrop-blur-md">
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">{hud.phase}</div>
          <div className="mt-1 text-2xl font-semibold text-emerald-300">{hud.time}s</div>
          <div className="mt-1 text-xs text-white/60">{hud.seen ? "Seeker can see you" : `Nearest cover: ${hud.place}`}</div>
        </div>
      </div>
      {ended && (
        <div className="absolute inset-0 grid place-items-center bg-black/45">
          <div className="rounded-3xl bg-white px-6 py-5 text-slate-950">
            <h2 className="text-2xl font-semibold">{hud.phase === "caught" ? "The seeker caught you." : "You lasted the round."}</h2>
            <button onClick={() => restartRef.current()} className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Play again</button>
          </div>
        </div>
      )}
      <div className="absolute bottom-5 left-5 grid grid-cols-3 gap-2 md:hidden">
        {[["w", "↑"], ["a", "←"], ["s", "↓"], ["d", "→"]].map(([key, label]) => (
          <button key={key} className="rounded-2xl bg-black/50 px-4 py-3 text-lg" onPointerDown={() => hold(key, true)} onPointerUp={() => hold(key, false)} onPointerLeave={() => hold(key, false)}>{label}</button>
        ))}
      </div>
    </main>
  );
}
