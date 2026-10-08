"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createCampusScene } from "./game/geometry";
import { hiderSpot, seekerStep } from "./game/computer";
import { BOUNDS, PROPS, insideProp } from "./game/props";
import { createRoom, joinRoom, pushPhase, pushPosition, subscribeRoom } from "./game/room";
import { CATCH_DISTANCE, HIDE_TIME, SEEK_TIME, caught, inCone, nextPhase, type Phase, type Role } from "./game/rules";

type Mode = "menu" | "play";

export default function HideAndSeekPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const roleRef = useRef<Role>("hide");
  const onlineRef = useRef<{ id: string; userId: string } | null>(null);
  const [mode, setMode] = useState<Mode>("menu");
  const [role, setRole] = useState<Role>("hide");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const [hud, setHud] = useState({ phase: "hide" as Phase, time: HIDE_TIME, hidden: false, found: 0 });

  useEffect(() => {
    if (mode !== "play") return;
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08120d);
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 300);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xbad7ff, 0x29452d, 1.6));
    createCampusScene(scene);
    const player = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 0.8, 4, 8), new THREE.MeshStandardMaterial({ color: roleRef.current === "hide" ? 0x2f79c9 : 0xb91c1c }));
    player.position.set(roleRef.current === "hide" ? 24 : 40, 0.9, roleRef.current === "hide" ? -70 : -60);
    scene.add(player);
    const others = PROPS.slice(0, 2).map((prop, index) => {
      const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.7, 4, 8), new THREE.MeshStandardMaterial({ color: index ? 0xf59e0b : 0x16a34a }));
      mesh.position.set(prop.x, 0.85, prop.z);
      scene.add(mesh);
      return mesh;
    });
    const seeker = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 0.8, 4, 8), new THREE.MeshStandardMaterial({ color: 0xb91c1c }));
    seeker.position.set(40, 0.9, -60);
    seeker.visible = roleRef.current === "hide";
    scene.add(seeker);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3.2, 8, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfca5a5, transparent: true, opacity: 0.28, side: THREE.DoubleSide }));
    cone.rotation.x = Math.PI / 2;
    scene.add(cone);
    PROPS.forEach((prop) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, 1.2), new THREE.MeshStandardMaterial({ color: 0xd6c4a4 }));
      mesh.position.set(prop.x, 0.5, prop.z);
      scene.add(mesh);
    });
    let phase: Phase = "hide";
    let timeLeft = HIDE_TIME;
    let hidden = false;
    let found = 0;
    let yaw = Math.PI;
    const foundIds = new Set<number>();
    const remote = { x: 30, z: -70, hidden: false };
    const stopRoom = onlineRef.current ? subscribeRoom(onlineRef.current.id, (players) => {
      const other = players.find((item) => item.user_id !== onlineRef.current?.userId);
      if (!other) return;
      remote.x = other.x;
      remote.z = other.z;
      remote.hidden = other.hidden;
      const mesh = roleRef.current === "hide" ? seeker : others[0];
      mesh.position.set(other.x, 0.9, other.z);
      mesh.visible = !other.hidden;
    }, (next, time) => { phase = next; timeLeft = time; }) : null;
    const clock = new THREE.Clock();
    let tick = 0;
    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (phase === "hide" || phase === "seek") {
        timeLeft = Math.max(0, timeLeft - dt);
        const forward = Number(Boolean(keysRef.current.w)) - Number(Boolean(keysRef.current.s));
        const strafe = Number(Boolean(keysRef.current.d)) - Number(Boolean(keysRef.current.a));
        if (forward || strafe) {
          hidden = false;
          player.visible = true;
          player.position.x += (-Math.sin(yaw) * forward + Math.cos(yaw) * strafe) * 3.4 * dt;
          player.position.z += (-Math.cos(yaw) * forward - Math.sin(yaw) * strafe) * 3.4 * dt;
          player.position.x = THREE.MathUtils.clamp(player.position.x, BOUNDS.minX, BOUNDS.maxX);
          player.position.z = THREE.MathUtils.clamp(player.position.z, BOUNDS.minZ, BOUNDS.maxZ);
        } else if (roleRef.current === "hide" && insideProp(player.position.x, player.position.z)) {
          hidden = true;
          player.visible = false;
        }
        if (!onlineRef.current && roleRef.current === "hide") {
          const step = seekerStep(seeker.position, player.position, dt);
          seeker.position.set(step.x, 0.9, step.z);
          seeker.rotation.y = step.facing;
          cone.position.set(seeker.position.x, 0.2, seeker.position.z);
          cone.rotation.y = -step.facing;
          const seen = inCone(seeker.position.x, seeker.position.z, step.facing, player.position.x, player.position.z);
          phase = nextPhase(phase, timeLeft, caught({ hidden, inView: seen, distance: seeker.position.distanceTo(player.position) }));
          if (phase === "seek" && timeLeft === HIDE_TIME) timeLeft = SEEK_TIME;
        }
        if (!onlineRef.current && roleRef.current === "seek") {
          others.forEach((mesh, index) => {
            if (foundIds.has(index)) return;
            const spot = hiderSpot(index, clock.elapsedTime);
            mesh.position.set(spot.x, 0.85, spot.z);
            mesh.visible = !spot.hidden;
            const sees = inCone(player.position.x, player.position.z, yaw, mesh.position.x, mesh.position.z);
            if (caught({ hidden: spot.hidden, inView: sees, distance: player.position.distanceTo(mesh.position) })) foundIds.add(index);
          });
          found = foundIds.size;
          cone.position.set(player.position.x, 0.2, player.position.z);
          cone.rotation.y = -yaw;
          if (foundIds.size === others.length) phase = "escaped";
          phase = nextPhase(phase, timeLeft, false);
        }
        if (phase === "hide" && timeLeft <= 0) { phase = "seek"; timeLeft = SEEK_TIME; }
        if (onlineRef.current && tick > 0.4) {
          pushPosition(onlineRef.current.id, onlineRef.current.userId, { x: player.position.x, z: player.position.z, hidden, role: roleRef.current });
          pushPhase(onlineRef.current.id, phase, timeLeft);
          const distance = Math.hypot(player.position.x - remote.x, player.position.z - remote.z);
          const sees = inCone(roleRef.current === "seek" ? player.position.x : remote.x, roleRef.current === "seek" ? player.position.z : remote.z, yaw, roleRef.current === "seek" ? remote.x : player.position.x, roleRef.current === "seek" ? remote.z : player.position.z);
          if (caught({ hidden: roleRef.current === "hide" ? hidden : remote.hidden, inView: sees, distance })) phase = "caught";
        }
      }
      tick += dt;
      if (tick > 0.2) { tick = 0; setHud({ phase, time: Math.ceil(timeLeft), hidden, found }); }
      camera.position.lerp(new THREE.Vector3(player.position.x, 11, player.position.z + 12), 0.08);
      camera.lookAt(player.position);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    let frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); stopRoom?.(); renderer.dispose(); renderer.domElement.remove(); };
  }, [mode]);

  const hold = (name: string, pressed: boolean) => { keysRef.current[name] = pressed; };
  const startComputer = (next: Role) => { roleRef.current = next; onlineRef.current = null; setRole(next); setMode("play"); };
  const startOnline = async (next: Role, joining: boolean) => {
    try {
      roleRef.current = next;
      const room = joining ? await joinRoom(code, next) : await createRoom(next);
      onlineRef.current = room;
      setNotice(joining ? `Joined ${room.code}` : `Room ${room.code}`);
      setMode("play");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Room unavailable. Apply supabase/hide_rounds.sql first.");
    }
  };

  return (
    <main className="relative h-[calc(100vh-0px)] min-h-[620px] overflow-hidden bg-[#07100b] text-white">
      <div ref={mountRef} className="absolute inset-0" />
      {mode === "menu" && (
        <div className="absolute inset-0 grid place-items-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-slate-950">
            <h1 className="text-2xl font-semibold">Hide or seek</h1>
            <p className="mt-2 text-sm text-slate-600">One role each round. The computer can take the other role, or a second signed-in account can join a code.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => startComputer("hide")} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Hide from computer</button>
              <button onClick={() => startComputer("seek")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Seek the computer</button>
            </div>
            <div className="mt-4 flex gap-2">
              <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Room code" className="w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <button onClick={() => startOnline("hide", false)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">Host hide</button>
              <button onClick={() => startOnline("seek", true)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">Join seek</button>
            </div>
            {notice && <p className="mt-3 text-sm text-slate-600">{notice}</p>}
          </div>
        </div>
      )}
      {mode === "play" && (
        <div className="pointer-events-none absolute left-5 top-5 rounded-2xl bg-black/45 px-4 py-3">
          <div className="text-xs uppercase tracking-[0.16em] text-white/50">{role} · {hud.phase}</div>
          <div className="text-xl font-semibold">{hud.time}s</div>
          <div className="text-sm text-white/70">{hud.hidden ? "Hidden" : "Visible"} · found {hud.found}</div>
        </div>
      )}
      {(hud.phase === "caught" || hud.phase === "escaped") && (
        <button onClick={() => setMode("menu")} className="absolute bottom-24 left-5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950">Back to roles</button>
      )}
      <div className="absolute bottom-5 left-5 grid grid-cols-3 gap-2">
        {[["w", "↑"], ["a", "←"], ["s", "↓"], ["d", "→"]].map(([key, label]) => (
          <button key={key} className="rounded-2xl bg-black/50 px-4 py-3" onPointerDown={() => hold(key, true)} onPointerUp={() => hold(key, false)} onPointerLeave={() => hold(key, false)}>{label}</button>
        ))}
      </div>
    </main>
  );
}
