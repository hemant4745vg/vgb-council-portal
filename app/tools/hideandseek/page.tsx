"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createCampusScene, CampusCollision } from "./game/geometry";

const WALK = 3.4;
const SPRINT = 5.2;
const HIDE_TIME = 8;
const SEEK_TIME = 30;
const CATCH = 1.5;
const BOUNDS = { minX: 8, maxX: 48, minZ: -92, maxZ: -52 };
const PROPS = [
  { name: "Desk", x: 22, z: -74 },
  { name: "Bush", x: 34, z: -82 },
  { name: "Counter", x: 30, z: -64 },
];

type Phase = "hide" | "seek" | "caught" | "escaped" | "coins";
type Keys = Record<string, boolean>;

function inCone(origin: THREE.Vector3, facing: number, target: THREE.Vector3) {
  const offset = target.clone().sub(origin);
  offset.y = 0;
  const distance = offset.length();
  if (distance > 8) return false;
  const angle = Math.atan2(offset.x, offset.z);
  let delta = Math.abs(angle - facing);
  if (delta > Math.PI) delta = Math.PI * 2 - delta;
  return delta < 0.5;
}

function blocked(origin: THREE.Vector3, target: THREE.Vector3, boxes: CampusCollision[]) {
  const dir = target.clone().sub(origin);
  const distance = dir.length();
  if (distance < 0.2) return false;
  dir.normalize();
  return boxes.some((item) => {
    const box = item.box;
    return origin.x > box.min.x && origin.x < box.max.x ? false : target.distanceTo(new THREE.Vector3(item.box.min.x, 0, item.box.min.z)) < 0 && false;
  }) || boxes.some((item) => {
    const center = new THREE.Vector3((item.box.min.x + item.box.max.x) / 2, 1, (item.box.min.z + item.box.max.z) / 2);
    const toCenter = center.clone().sub(origin);
    const along = toCenter.dot(dir);
    if (along < 0.4 || along > distance) return false;
    const closest = origin.clone().addScaledVector(dir, along);
    return closest.distanceTo(center) < Math.min(item.box.max.x - item.box.min.x, item.box.max.z - item.box.min.z) / 2;
  });
}

export default function HideAndSeekPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef<Keys>({});
  const restartRef = useRef<() => void>(() => {});
  const roundRef = useRef(0);
  const [hud, setHud] = useState({ phase: "hide" as Phase, time: HIDE_TIME, hidden: false, coins: 0, round: 1 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08120d);
    scene.fog = new THREE.Fog(0x08120d, 40, 110);
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 300);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xbad7ff, 0x29452d, 1.6));
    const campus = createCampusScene(scene);

    const player = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 0.8, 4, 8), new THREE.MeshStandardMaterial({ color: 0x2f79c9 }));
    player.position.set(24, 0.9, -70);
    scene.add(player);
    const others = [0, 1].map((index) => {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.7, 4, 8), new THREE.MeshStandardMaterial({ color: index ? 0xf59e0b : 0x16a34a }));
      mesh.position.set(26 + index * 4, 0.85, -78);
      scene.add(mesh);
      return mesh;
    });
    const seeker = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 0.8, 4, 8), new THREE.MeshStandardMaterial({ color: 0xb91c1c }));
    seeker.position.set(40, 0.9, -60);
    scene.add(seeker);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3.2, 8, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfca5a5, transparent: true, opacity: 0.28, side: THREE.DoubleSide }));
    cone.rotation.x = Math.PI / 2;
    scene.add(cone);
    PROPS.forEach((prop) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, 1.2), new THREE.MeshStandardMaterial({ color: 0xd6c4a4 }));
      mesh.position.set(prop.x, 0.5, prop.z);
      scene.add(mesh);
    });
    const coins = Array.from({ length: 6 }, (_, index) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 12), new THREE.MeshStandardMaterial({ color: 0xfbbf24 }));
      mesh.position.set(16 + index * 4, 0.4, -68 - (index % 2) * 8);
      mesh.visible = false;
      scene.add(mesh);
      return mesh;
    });

    let phase: Phase = "hide";
    let timeLeft = HIDE_TIME;
    let hidden = false;
    let collected = 0;
    let yaw = Math.PI;
    const keys = keysRef.current;
    const clamp = (object: THREE.Object3D) => {
      object.position.x = THREE.MathUtils.clamp(object.position.x, BOUNDS.minX, BOUNDS.maxX);
      object.position.z = THREE.MathUtils.clamp(object.position.z, BOUNDS.minZ, BOUNDS.maxZ);
    };
    const hideSpot = () => PROPS.find((prop) => Math.hypot(player.position.x - prop.x, player.position.z - prop.z) < 1.3);
    restartRef.current = () => {
      roundRef.current += 1;
      const coinRound = roundRef.current % 5 === 0;
      phase = coinRound ? "coins" : "hide";
      timeLeft = coinRound ? 20 : HIDE_TIME;
      hidden = false;
      collected = 0;
      player.position.set(24, 0.9, -70);
      player.visible = true;
      seeker.position.set(40, 0.9, -60);
      seeker.visible = !coinRound;
      cone.visible = !coinRound;
      coins.forEach((coin) => { coin.visible = coinRound; coin.userData.taken = false; });
      setHud({ phase, time: timeLeft, hidden, coins: 0, round: roundRef.current });
    };

    const onKey = (event: KeyboardEvent, pressed: boolean) => {
      const map: Record<string, string> = { KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", ArrowUp: "w", ArrowDown: "s", ArrowLeft: "a", ArrowRight: "d", ShiftLeft: "shift", ShiftRight: "shift" };
      if (map[event.code]) keys[map[event.code]] = pressed;
    };
    window.addEventListener("keydown", (event) => onKey(event, true));
    window.addEventListener("keyup", (event) => onKey(event, false));
    const clock = new THREE.Clock();
    let tick = 0;
    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (phase === "hide" || phase === "seek" || phase === "coins") {
        timeLeft = Math.max(0, timeLeft - dt);
        const forward = Number(Boolean(keys.w)) - Number(Boolean(keys.s));
        const strafe = Number(Boolean(keys.d)) - Number(Boolean(keys.a));
        const moving = forward !== 0 || strafe !== 0;
        if (moving) {
          hidden = false;
          player.visible = true;
          const speed = keys.shift ? SPRINT : WALK;
          player.position.x += (-Math.sin(yaw) * forward + Math.cos(yaw) * strafe) * speed * dt;
          player.position.z += (-Math.cos(yaw) * forward - Math.sin(yaw) * strafe) * speed * dt;
          clamp(player);
        } else if (hideSpot()) {
          hidden = true;
          player.visible = false;
        }
        others.forEach((other, index) => {
          other.position.x += Math.sin(clock.elapsedTime + index) * dt;
          other.position.z += Math.cos(clock.elapsedTime * 0.7 + index) * dt;
          clamp(other);
          if (keys.shift && player.position.distanceTo(other.position) < 1.6) {
            other.position.add(new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).multiplyScalar(2.2));
            clamp(other);
          }
        });
        if (phase === "hide" && timeLeft <= 0) {
          phase = "seek";
          timeLeft = SEEK_TIME;
        }
        if (phase === "seek") {
          const target = [player, ...others].filter((mesh) => mesh.visible).sort((a, b) => seeker.position.distanceTo(a.position) - seeker.position.distanceTo(b.position))[0] ?? player;
          const offset = target.position.clone().sub(seeker.position);
          offset.y = 0;
          if (offset.length() > 0.4) {
            offset.normalize();
            seeker.position.addScaledVector(offset, 2.6 * dt);
            seeker.rotation.y = Math.atan2(offset.x, offset.z);
            clamp(seeker);
          }
          cone.position.set(seeker.position.x, 0.2, seeker.position.z);
          cone.rotation.y = -seeker.rotation.y;
          const seen = !hidden && inCone(seeker.position, seeker.rotation.y, player.position) && !blocked(seeker.position, player.position, campus.collision);
          if (seen || seeker.position.distanceTo(player.position) < CATCH) phase = "caught";
          if (timeLeft <= 0 && phase === "seek") phase = "escaped";
        }
        if (phase === "coins") {
          seeker.visible = false;
          cone.visible = false;
          coins.forEach((coin) => {
            if (!coin.userData.taken && player.position.distanceTo(coin.position) < 1.1) {
              coin.userData.taken = true;
              coin.visible = false;
              collected += 1;
            }
          });
          if (timeLeft <= 0) phase = "escaped";
        }
      }
      tick += dt;
      if (tick > 0.2) {
        tick = 0;
        setHud({ phase, time: Math.ceil(timeLeft), hidden, coins: collected, round: roundRef.current || 1 });
      }
      camera.position.lerp(new THREE.Vector3(player.position.x, 11, player.position.z + 12), 0.08);
      camera.lookAt(player.position);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    let frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const hold = (name: string, pressed: boolean) => { keysRef.current[name] = pressed; };
  const ended = hud.phase === "caught" || hud.phase === "escaped";
  return (
    <main className="relative h-[calc(100vh-0px)] min-h-[620px] overflow-hidden bg-[#07100b] text-white">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-5 top-5 rounded-2xl border border-white/10 bg-black/45 px-4 py-3">
        <div className="text-xs uppercase tracking-[0.18em] text-white/50">Round {hud.round}</div>
        <div className="text-xl font-semibold">{hud.phase === "coins" ? "Coin run" : hud.phase === "hide" ? "Hide" : hud.phase === "seek" ? "Seeker is out" : hud.phase === "caught" ? "Caught" : "Clear"}</div>
        <div className="text-sm text-white/70">{hud.time}s · {hud.hidden ? "Hidden" : "Visible"} · {hud.coins} coins</div>
      </div>
      {ended && (
        <div className="absolute inset-0 grid place-items-center bg-black/45">
          <div className="rounded-3xl bg-white px-6 py-5 text-slate-950">
            <h2 className="text-2xl font-semibold">{hud.phase === "caught" ? "The cone caught you." : `Round clear. ${hud.coins} coins.`}</h2>
            <button onClick={() => restartRef.current()} className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Next round</button>
          </div>
        </div>
      )}
      <div className="absolute bottom-5 left-5 grid grid-cols-3 gap-2">
        {[["w", "↑"], ["a", "←"], ["s", "↓"], ["d", "→"], ["shift", "Push"]].map(([key, label]) => (
          <button key={key} className="rounded-2xl bg-black/50 px-4 py-3" onPointerDown={() => hold(key, true)} onPointerUp={() => hold(key, false)} onPointerLeave={() => hold(key, false)}>{label}</button>
        ))}
      </div>
    </main>
  );
}
