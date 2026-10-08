"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createCampusScene } from "./game/geometry";
import { hiderSpot, seekerStep } from "./game/computer";
import { BOUNDS, PROPS, insideProp } from "./game/props";
import { createRoom, joinRoom, pushPhase, pushPosition, subscribeRoom } from "./game/room";
import { CATCH_DISTANCE, HIDE_TIME, advance, inCone, lineBlocked, seen, type Phase, type Role } from "./game/rules";

export default function HideAndSeekPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const roleRef = useRef<Role>("hide");
  const onlineRef = useRef<{ id: string; userId: string } | null>(null);
  const [mode, setMode] = useState<"menu" | "play">("menu");
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
    const campus = createCampusScene(scene);
    const boxes = campus.collision.map((item) => ({ minX: item.box.min.x, maxX: item.box.max.x, minZ: item.box.min.z, maxZ: item.box.max.z }));
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
    seeker.visible = roleRef.current === "hide" && !onlineRef.current;
    scene.add(seeker);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3.2, 8, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfca5a5, transparent: true, opacity: 0.28, side: THREE.DoubleSide }));
    cone.rotation.x = Math.PI / 2;
    scene.add(cone);
    PROPS.forEach((prop) => scene.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, 1.2), new THREE.MeshStandardMaterial({ color: 0xd6c4a4 })), { position: new THREE.Vector3(prop.x, 0.5, prop.z) })));

    let phase: Phase = "hide";
    let timeLeft = HIDE_TIME;
    let hidden = false;
    let found = 0;
    let yaw = Math.PI;
    let pushClock = 0;
    const lastSeen = { x: 24, z: -70, known: false };
    const remote = { x: 30, z: -70, hidden: false, role: "hide" as Role };
    const foundIds = new Set<number>();
    const stopRoom = onlineRef.current ? subscribeRoom(onlineRef.current.id, (players) => {
      const other = players.find((item) => item.user_id !== onlineRef.current?.userId);
      if (!other) return;
      remote.x = other.x; remote.z = other.z; remote.hidden = other.hidden; remote.role = other.role;
    }, (next, time) => { if (roleRef.current === "hide") { phase = next; timeLeft = time; } }) : null;

    const clock = new THREE.Clock();
    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (phase === "hide" || phase === "seek") {
        timeLeft -= dt;
        if (keysRef.current.a) yaw += 1.6 * dt;
        if (keysRef.current.d) yaw -= 1.6 * dt;
        const forward = Number(Boolean(keysRef.current.w)) - Number(Boolean(keysRef.current.s));
        if (forward) {
          hidden = false;
          player.visible = true;
          player.position.x += -Math.sin(yaw) * forward * 3.4 * dt;
          player.position.z += -Math.cos(yaw) * forward * 3.4 * dt;
          player.position.x = THREE.MathUtils.clamp(player.position.x, BOUNDS.minX, BOUNDS.maxX);
          player.position.z = THREE.MathUtils.clamp(player.position.z, BOUNDS.minZ, BOUNDS.maxZ);
        } else if (roleRef.current === "hide" && insideProp(player.position.x, player.position.z)) {
          hidden = true;
          player.visible = false;
        }
        player.rotation.y = yaw;
        const next = advance(phase, timeLeft);
        phase = next.phase;
        timeLeft = next.timeLeft;

        if (!onlineRef.current && roleRef.current === "hide" && phase === "seek") {
          const view = inCone(seeker.position.x, seeker.position.z, seeker.rotation.y, player.position.x, player.position.z);
          const blocked = lineBlocked(seeker.position.x, seeker.position.z, player.position.x, player.position.z, boxes);
          if (seen({ hidden, inView: view, blocked })) { lastSeen.x = player.position.x; lastSeen.z = player.position.z; lastSeen.known = true; }
          const goal = lastSeen.known ? lastSeen : { x: 28, z: -70 };
          const step = seekerStep(seeker.position, goal, dt);
          seeker.position.set(step.x, 0.9, step.z);
          seeker.rotation.y = step.facing;
          if (seen({ hidden, inView: view, blocked }) && seeker.position.distanceTo(player.position) < CATCH_DISTANCE) phase = "caught";
          if (phase === "missed") phase = "escaped";
        }
        if (!onlineRef.current && roleRef.current === "seek" && phase === "seek") {
          others.forEach((mesh, index) => {
            if (foundIds.has(index)) return;
            const spot = hiderSpot(index, clock.elapsedTime);
            mesh.position.set(spot.x, 0.85, spot.z);
            mesh.visible = !spot.hidden;
            const view = inCone(player.position.x, player.position.z, yaw, mesh.position.x, mesh.position.z);
            const blocked = lineBlocked(player.position.x, player.position.z, mesh.position.x, mesh.position.z, boxes);
            if (seen({ hidden: spot.hidden, inView: view, blocked }) && player.position.distanceTo(mesh.position) < CATCH_DISTANCE) foundIds.add(index);
          });
          found = foundIds.size;
          if (foundIds.size === others.length) phase = "found";
        }
        const coneOwner = roleRef.current === "seek" ? player : seeker;
        cone.position.set(coneOwner.position.x, 0.2, coneOwner.position.z);
        cone.rotation.y = -coneOwner.rotation.y;
        cone.visible = phase === "seek";
        pushClock += dt;
        if (onlineRef.current && pushClock > 0.3) {
          pushClock = 0;
          pushPosition(onlineRef.current.id, onlineRef.current.userId, { x: player.position.x, z: player.position.z, hidden, role: roleRef.current });
          if (roleRef.current === "seek") {
            const view = inCone(player.position.x, player.position.z, yaw, remote.x, remote.z);
            const blocked = lineBlocked(player.position.x, player.position.z, remote.x, remote.z, boxes);
            if (phase === "seek" && seen({ hidden: remote.hidden, inView: view, blocked }) && Math.hypot(player.position.x - remote.x, player.position.z - remote.z) < CATCH_DISTANCE) phase = "caught";
            pushPhase(onlineRef.current.id, phase, timeLeft);
          }
        }
      }
      setHud((current) => current.phase === phase && current.time === Math.ceil(timeLeft) ? current : { phase, time: Math.ceil(timeLeft), hidden, found });
      camera.position.lerp(new THREE.Vector3(player.position.x + Math.sin(yaw) * 8, 8, player.position.z + Math.cos(yaw) * 8), 0.08);
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
      setNotice(error instanceof Error ? error.message : "Room unavailable.");
    }
  };
  const ended = ["caught", "escaped", "found", "missed"].includes(hud.phase);

  return (
    <main className="relative min-h-[620px] h-screen overflow-hidden bg-[#07100b] text-white">
      <div ref={mountRef} className="absolute inset-0" />
      {mode === "menu" && (
        <div className="absolute inset-0 grid place-items-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-slate-950">
            <h1 className="text-2xl font-semibold">Hide or seek</h1>
            <p className="mt-2 text-sm text-slate-600">Pick one role. The computer takes the other, or a second signed-in account joins the opposite role.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => startComputer("hide")} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Hide from computer</button>
              <button onClick={() => startComputer("seek")} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Seek the computer</button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Room code" className="w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <button onClick={() => startOnline(role, false)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">Host {role}</button>
              <button onClick={() => startOnline(role === "hide" ? "seek" : "hide", true)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">Join opposite</button>
              <button onClick={() => setRole(role === "hide" ? "seek" : "hide")} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">Role: {role}</button>
            </div>
            {notice && <p className="mt-3 text-sm text-slate-600">{notice}</p>}
          </div>
        </div>
      )}
      {mode === "play" && <div className="pointer-events-none absolute left-5 top-5 rounded-2xl bg-black/45 px-4 py-3"><div className="text-xs uppercase tracking-[0.16em] text-white/50">{role} · {hud.phase}</div><div className="text-xl font-semibold">{hud.time}s</div><div className="text-sm text-white/70">{hud.hidden ? "Hidden" : "Visible"} · found {hud.found}</div></div>}
      {ended && <button onClick={() => setMode("menu")} className="absolute bottom-24 left-5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950">Back to roles</button>}
      <div className="absolute bottom-5 left-5 grid grid-cols-3 gap-2">
        {[["a", "Left"], ["w", "Forward"], ["d", "Right"], ["s", "Back"]].map(([key, label]) => <button key={key} className="rounded-2xl bg-black/50 px-4 py-3" onPointerDown={() => hold(key, true)} onPointerUp={() => hold(key, false)} onPointerLeave={() => hold(key, false)}>{label}</button>)}
      </div>
    </main>
  );
}
