"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import * as THREE from "three";
import { createCampusScene, CampusCollision } from "./game/geometry";

type Role = "hider" | "seeker";
type Difficulty = "easy" | "normal" | "hard";
type Phase = "playing" | "hider-won" | "seekers-won" | "caught";
type Agent = { id: number; mesh: THREE.Group; role: Role; alive: boolean; speed: number; waypoint: number; lastSeen: THREE.Vector3 | null; think: number; hiddenSpot: number };
type Hud = { remaining: number; phase: Phase; caught: number; total: number; nearby: boolean; sprint: boolean; message: string; finalPhase: boolean };

const ROUND_SECONDS = 180;
const PLAYER_RADIUS = 0.62;
const PLAYER_HEIGHT = 1.8;
const WALK_SPEED = 5.2;
const SPRINT_SPEED = 8.3;
const LIMIT_X = 91;
const LIMIT_Z = 99;
const WAYPOINTS: [number, number][] = [
  [-66, -48], [-28, -48], [16, -48], [57, -38], [63, 2], [39, 43], [2, 64], [-39, 43], [-61, 15], [-68, -18],
  [-2, -5], [30, -2], [31, 29], [-8, 29], [-24, 64], [21, 76], [68, 48], [70, -15], [40, -75], [-4, -78]
];

function makeCharacter(color: number, isSeeker: boolean) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.48, 0.92, 5, 9),
    new THREE.MeshStandardMaterial({ color, roughness: 0.72 })
  );
  body.position.y = 0.9;
  body.castShadow = true;
  group.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.31, 14, 10),
    new THREE.MeshStandardMaterial({ color: 0xe9bd99, roughness: 0.9 })
  );
  head.position.y = 1.72;
  head.castShadow = true;
  group.add(head);
  const marker = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.42, 8),
    new THREE.MeshStandardMaterial({ color: isSeeker ? 0xffc04d : 0xeaf4ff, emissive: isSeeker ? 0x442000 : 0x17283b })
  );
  marker.rotation.x = Math.PI / 2;
  marker.position.set(0, 1.12, -0.5);
  group.add(marker);
  if (isSeeker) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.07, 6, 16), new THREE.MeshStandardMaterial({ color: 0xffb52e }));
    band.rotation.x = Math.PI / 2;
    band.position.y = 1.25;
    group.add(band);
  }
  return group;
}

function distance2D(a: THREE.Vector3, b: THREE.Vector3) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export default function HideAndSeekPage() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<"computer" | "multiplayer">("computer");
  const [role, setRole] = useState<Role>("hider");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [started, setStarted] = useState(false);
  const [runId, setRunId] = useState(0);
  const [hud, setHud] = useState<Hud>({ remaining: ROUND_SECONDS, phase: "playing", caught: 0, total: 3, nearby: false, sprint: false, message: "Find cover and stay alert.", finalPhase: false });
  const [mobile, setMobile] = useState(false);

  const begin = useCallback(() => {
    setHud({ remaining: ROUND_SECONDS, phase: "playing", caught: 0, total: 3, nearby: false, sprint: false, message: role === "hider" ? "Break line of sight and survive." : "Find the hiders and tag them.", finalPhase: false });
    setRunId((v) => v + 1);
    setStarted(true);
  }, [role]);

  useEffect(() => {
    if (!started) return;
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101c17);
    scene.fog = new THREE.Fog(0x101c17, 105, 225);
    const camera = new THREE.PerspectiveCamera(62, mount.clientWidth / Math.max(1, mount.clientHeight), 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.outline = "none";
    renderer.domElement.tabIndex = 0;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xc5dcff, 0x2a472c, 1.45));
    const sun = new THREE.DirectionalLight(0xffedca, 2.0);
    sun.position.set(-42, 78, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    sun.shadow.camera.left = -110; sun.shadow.camera.right = 110; sun.shadow.camera.top = 110; sun.shadow.camera.bottom = -110;
    scene.add(sun);
    const campus = createCampusScene(scene);

    const player = makeCharacter(role === "hider" ? 0x2f83d5 : 0xd85a46, role === "seeker");
    player.position.set(role === "hider" ? -4 : -64, 0, role === "hider" ? 76 : -46);
    scene.add(player);

    const agentColors = role === "hider" ? [0xe15a4f, 0xe6a93b, 0x9d78e7] : [0x4ba7d9, 0x58bd86, 0xe1a4d0];
    const startPositions: [number, number][] = role === "hider" ? [[-61, -48], [55, -38], [42, 43]] : [[-23, 64], [29, 31], [65, -18]];
    const agents: Agent[] = startPositions.map(([x, z], i) => {
      const agentRole: Role = role === "hider" ? "seeker" : "hider";
      const mesh = makeCharacter(agentColors[i], agentRole === "seeker");
      mesh.position.set(x, 0, z);
      scene.add(mesh);
      return { id: i, mesh, role: agentRole, alive: true, speed: (difficulty === "easy" ? 2.45 : difficulty === "hard" ? 4.1 : 3.2) + i * 0.12, waypoint: (i * 4 + 2) % WAYPOINTS.length, lastSeen: null, think: 0, hiddenSpot: (i * 5 + 3) % WAYPOINTS.length };
    });

    const keys: Record<string, boolean> = {};
    const touchKeys: Record<string, boolean> = {};
    let yaw = Math.PI;
    let pitch = 0.34;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let elapsed = 0;
    let hudElapsed = 0;
    let phase: Phase = "playing";
    let caughtCount = 0;
    let message = role === "hider" ? "Break line of sight and survive." : "Find the hiders and tag them.";
    let lastClueAt = -100;
    const clock = new THREE.Clock();
    const playerForward = new THREE.Vector3();
    const desiredCamera = new THREE.Vector3();
    const playerBox = new THREE.Box3();
    const raycaster = new THREE.Raycaster();
    const rayDirection = new THREE.Vector3();

    const blocked = (x: number, z: number, radius = PLAYER_RADIUS) => {
      playerBox.min.set(x - radius, 0, z - radius);
      playerBox.max.set(x + radius, PLAYER_HEIGHT, z + radius);
      return campus.collision.some((item: CampusCollision) => {
        const b = item.box;
        return playerBox.max.x > b.min.x && playerBox.min.x < b.max.x && playerBox.max.z > b.min.z && playerBox.min.z < b.max.z && playerBox.min.y < b.max.y && playerBox.max.y > b.min.y;
      });
    };
    const moveActor = (actor: THREE.Group, dx: number, dz: number, radius = PLAYER_RADIUS) => {
      const nx = THREE.MathUtils.clamp(actor.position.x + dx, -LIMIT_X, LIMIT_X);
      const nz = THREE.MathUtils.clamp(actor.position.z + dz, -LIMIT_Z, LIMIT_Z);
      if (!blocked(nx, actor.position.z, radius)) actor.position.x = nx;
      if (!blocked(actor.position.x, nz, radius)) actor.position.z = nz;
    };
    const hasLineOfSight = (from: THREE.Vector3, to: THREE.Vector3) => {
      rayDirection.set(to.x - from.x, 0, to.z - from.z);
      const dist = rayDirection.length();
      if (dist < 0.01) return true;
      rayDirection.normalize();
      const origin = new THREE.Vector3(from.x, 1.25, from.z);
      raycaster.set(origin, rayDirection);
      raycaster.far = dist;
      for (const item of campus.collision) {
        const hit = raycaster.ray.intersectBox(item.box, new THREE.Vector3());
        if (hit && origin.distanceTo(hit) < dist - 0.6) return false;
      }
      return true;
    };
    const canSee = (seeker: THREE.Group, hider: THREE.Group, range: number) => {
      const d = distance2D(seeker.position, hider.position);
      if (d > range || !hasLineOfSight(seeker.position, hider.position)) return false;
      const forward = new THREE.Vector3(Math.sin(seeker.rotation.y), 0, Math.cos(seeker.rotation.y));
      const toward = new THREE.Vector3(hider.position.x - seeker.position.x, 0, hider.position.z - seeker.position.z).normalize();
      return forward.dot(toward) > (d < 5 ? -0.15 : 0.25);
    };
    const setKey = (event: KeyboardEvent, value: boolean) => {
      const code = event.code;
      const map: Record<string, string> = { KeyW: "w", KeyA: "a", KeyS: "s", KeyD: "d", ArrowUp: "w", ArrowLeft: "a", ArrowDown: "s", ArrowRight: "d", ShiftLeft: "shift", ShiftRight: "shift", Space: "jump" };
      const key = map[code];
      if (key) keys[key] = value;
      if (key && ["w", "a", "s", "d", "shift", "jump"].includes(key)) event.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => { setKey(e, true); };
    const onKeyUp = (e: KeyboardEvent) => { setKey(e, false); };
    const clearKeys = () => { Object.keys(keys).forEach((k) => (keys[k] = false)); Object.keys(touchKeys).forEach((k) => (touchKeys[k] = false)); };
    const onBlur = () => clearKeys();
    const onPointerDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; lastY = e.clientY; renderer.domElement.focus(); try { renderer.domElement.setPointerCapture(e.pointerId); } catch {} };
    const onPointerMove = (e: PointerEvent) => { if (!dragging) return; yaw -= (e.clientX - lastX) * 0.0055; pitch = THREE.MathUtils.clamp(pitch - (e.clientY - lastY) * 0.0038, 0.12, 0.82); lastX = e.clientX; lastY = e.clientY; };
    const onPointerUp = () => { dragging = false; };
    const onResize = () => { if (!mount) return; camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight); camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", onResize);

    const setTouch = (key: string, down: boolean) => { touchKeys[key] = down; };
    (window as any).__vgbSetTouchKey = setTouch;

    const endRound = (next: Phase, text: string) => { if (phase !== "playing") return; phase = next; message = text; clearKeys(); };
    const chooseWaypoint = (actor: Agent) => {
      const candidates = WAYPOINTS.map((p, idx) => ({ idx, d: Math.hypot(p[0] - actor.mesh.position.x, p[1] - actor.mesh.position.z) }))
        .filter((p) => p.idx !== actor.waypoint).sort((a, b) => a.d - b.d);
      actor.waypoint = candidates[Math.floor(Math.random() * Math.min(4, candidates.length))]?.idx ?? 0;
    };
    const stepAgent = (agent: Agent, dt: number, finalPhase: boolean) => {
      if (!agent.alive || phase !== "playing") return;
      const actor = agent.mesh;
      if (agent.role === "seeker") {
        const d = distance2D(actor.position, player.position);
        const sees = canSee(actor, player, finalPhase ? 34 : 23);
        if (sees) agent.lastSeen = player.position.clone();
        const chase = sees || (agent.lastSeen && distance2D(actor.position, agent.lastSeen) < (finalPhase ? 18 : 8));
        let dest: THREE.Vector3;
        if (chase) dest = sees ? player.position : agent.lastSeen!;
        else {
          const wp = WAYPOINTS[agent.waypoint];
          dest = new THREE.Vector3(wp[0], 0, wp[1]);
          if (distance2D(actor.position, dest) < 3) chooseWaypoint(agent);
        }
        const dx = dest.x - actor.position.x; const dz = dest.z - actor.position.z; const len = Math.hypot(dx, dz);
        if (len > 0.1) { moveActor(actor, dx / len * agent.speed * (finalPhase ? 1.12 : 1) * dt, dz / len * agent.speed * (finalPhase ? 1.12 : 1) * dt, 0.55); actor.rotation.y = Math.atan2(dx, dz); }
        if (d < 1.8 && hasLineOfSight(actor.position, player.position)) {
          if (role === "hider") endRound("caught", "You were tagged! The seekers found you.");
          else { /* AI seekers only exist when the human is a hider. */ }
        }
      } else {
        // AI hiders either stay concealed when safe or choose a new route when a seeker gets close.
        const threat = distance2D(actor.position, player.position);
        const playerIsSeeker = role === "seeker";
        const seesThreat = playerIsSeeker && threat < (finalPhase ? 31 : 21) && hasLineOfSight(actor.position, player.position);
        if (seesThreat) agent.lastSeen = player.position.clone();
        if (seesThreat || (agent.lastSeen && distance2D(actor.position, agent.lastSeen) < 12)) {
          const from = agent.lastSeen ?? player.position;
          const away = new THREE.Vector3(actor.position.x - from.x, 0, actor.position.z - from.z);
          if (away.lengthSq() < 0.1) away.set(Math.random() - 0.5, 0, Math.random() - 0.5);
          away.normalize();
          const speed = agent.speed * (seesThreat ? 1.18 : 0.9);
          moveActor(actor, away.x * speed * dt, away.z * speed * dt, 0.5);
          actor.rotation.y = Math.atan2(away.x, away.z);
        } else {
          agent.think -= dt;
          if (agent.think <= 0 || distance2D(actor.position, new THREE.Vector3(...[WAYPOINTS[agent.hiddenSpot][0], 0, WAYPOINTS[agent.hiddenSpot][1]])) < 3) {
            agent.think = difficulty === "hard" ? 2.8 : 4.5;
            agent.hiddenSpot = (agent.hiddenSpot + 1 + Math.floor(Math.random() * 4)) % WAYPOINTS.length;
          }
          const wp = WAYPOINTS[agent.hiddenSpot]; const dx = wp[0] - actor.position.x; const dz = wp[1] - actor.position.z; const len = Math.hypot(dx, dz);
          if (len > 0.5) { moveActor(actor, dx / len * agent.speed * 0.65 * dt, dz / len * agent.speed * 0.65 * dt, 0.5); actor.rotation.y = Math.atan2(dx, dz); }
        }
        // Tagging: seeker must be close and have clear line of sight.
        if (playerIsSeeker && distance2D(player.position, actor.position) < 1.9 && hasLineOfSight(player.position, actor.position)) {
          agent.alive = false; scene.remove(actor); caughtCount += 1; message = `Hider ${caughtCount} tagged!`;
          if (agents.filter((a) => a.role === "hider" && a.alive).length === 0) endRound("seekers-won", "Every hider has been tagged. Seekers win!");
        }
      }
    };

    let frame = 0;
    const animate = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.045);
      if (phase === "playing") {
        elapsed += dt;
        const countdown = Math.max(0, 3 - elapsed);
        const activeElapsed = Math.max(0, elapsed - 3);
        const remaining = Math.max(0, Math.ceil(ROUND_SECONDS - activeElapsed));
        const live = countdown <= 0;
        const finalPhase = live && remaining <= 30;
        const forward = live ? Number(keys.w || touchKeys.w) - Number(keys.s || touchKeys.s) : 0;
        const strafe = live ? Number(keys.d || touchKeys.d) - Number(keys.a || touchKeys.a) : 0;
        const move = new THREE.Vector3(strafe, 0, forward);
        const sprint = Boolean(keys.shift || touchKeys.shift);
        if (live && move.lengthSq() > 0) {
          move.normalize();
          const forwardDir = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
          const rightDir = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
          const worldMove = new THREE.Vector3().addScaledVector(forwardDir, move.z).addScaledVector(rightDir, move.x);
          const speed = sprint ? SPRINT_SPEED : WALK_SPEED;
          moveActor(player, worldMove.x * speed * dt, worldMove.z * speed * dt);
          player.rotation.y = Math.atan2(worldMove.x, worldMove.z);
        }
        const humanTarget = new THREE.Vector3(player.position.x, player.position.y + 1.2, player.position.z);
        desiredCamera.set(player.position.x + Math.sin(yaw) * Math.cos(pitch) * 8.1, player.position.y + 1.2 + Math.sin(pitch) * 8.1, player.position.z + Math.cos(yaw) * Math.cos(pitch) * 8.1);
        camera.position.lerp(desiredCamera, 1 - Math.pow(0.001, dt));
        camera.lookAt(humanTarget);
        if (live) agents.forEach((a) => stepAgent(a, dt, finalPhase));
        if (live && remaining <= 0 && phase === "playing") endRound("hider-won", "Time is up! The hiders survive.");
        if (!live) message = `Round begins in ${Math.ceil(countdown)}…`;
        const nearest = agents.filter((a) => a.alive).reduce((best, a) => Math.min(best, distance2D(a.mesh.position, player.position)), Infinity);
        const nearby = live && role === "hider" && nearest < (finalPhase ? 24 : 14);
        if (live && finalPhase && elapsed - lastClueAt > 8 && role === "hider") { lastClueAt = elapsed; message = "FINAL PHASE: seekers are closing in."; }
        hudElapsed += dt;
        if (hudElapsed > 0.16) {
          hudElapsed = 0;
          setHud({ remaining, phase, caught: caughtCount, total: agents.length, nearby, sprint, message, finalPhase });
        }
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      delete (window as any).__vgbSetTouchKey;
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) { obj.geometry.dispose(); const material = obj.material; if (Array.isArray(material)) material.forEach((m) => m.dispose()); else material.dispose(); }
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [started, role, difficulty, runId]);

  const formatTime = (n: number) => `${Math.floor(n / 60).toString().padStart(2, "0")}:${(n % 60).toString().padStart(2, "0")}`;
  const touch = (key: string, down: boolean) => { const fn = (window as any).__vgbSetTouchKey; if (fn) fn(key, down); };
  const primary = "#eaf2ed";
  const muted = "#9eaea5";
  const panel: CSSProperties = { background: "rgba(12,24,19,.88)", border: "1px solid rgba(218,238,223,.14)", borderRadius: 18, backdropFilter: "blur(18px)" };
  const button: CSSProperties = { border: "1px solid rgba(232,246,236,.18)", borderRadius: 12, padding: "11px 15px", fontWeight: 700, cursor: "pointer", color: primary, background: "rgba(255,255,255,.055)" };

  return (
    <main style={{ minHeight: "100dvh", background: "#07110d", color: primary, padding: "clamp(12px, 2.5vw, 28px)", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
          <div><div style={{ color: "#9ed7ac", fontSize: 11, letterSpacing: 2.4, fontWeight: 900 }}>VGB · CAMPUS GAMES</div><h1 style={{ margin: "5px 0 0", fontSize: "clamp(26px, 4vw, 38px)", letterSpacing: -1.2 }}>Hide <span style={{ color: "#8bc89b" }}>&</span> Seek</h1></div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span style={{ color: muted, fontSize: 12 }}>THIRD-PERSON · CAMPUS MAP</span>{started && <button style={button} onClick={() => { setStarted(false); setHud((h) => ({ ...h, phase: "playing" })); }}>Exit match</button>}</div>
        </header>

        {!started ? (
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap: 18 }}>
            <div style={{ ...panel, minHeight: 430, overflow: "hidden", position: "relative", padding: "clamp(22px, 4vw, 42px)", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "radial-gradient(ellipse at 70% 30%, rgba(74,128,81,.3), transparent 45%), linear-gradient(140deg,#172b20,#0c1712 68%)" }}>
              <div style={{ maxWidth: 550 }}><div style={{ display: "inline-flex", borderRadius: 99, padding: "7px 10px", background: "rgba(135,200,151,.12)", color: "#a9e2b4", fontSize: 11, fontWeight: 800, letterSpacing: 1.4 }}>THE CAMPUS IS YOUR ARENA</div><h2 style={{ fontSize: "clamp(34px, 5vw, 58px)", lineHeight: 1.02, letterSpacing: -2, margin: "22px 0 14px" }}>Stay unseen.<br /><span style={{ color: "#9bd7a7" }}>Or find everyone.</span></h2><p style={{ color: "#b5c6bb", lineHeight: 1.7, maxWidth: 490, margin: 0 }}>Use campus paths, courtyards and cover. Choose your side, outsmart the opposition, and survive the final pursuit.</p></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 38 }}>{[{ big: "03:00", small: "ROUND LENGTH" }, { big: "2", small: "ROLES" }, { big: "VGB", small: "CAMPUS MAP" }].map((item) => <div key={item.small} style={{ borderTop: "1px solid rgba(230,246,235,.2)", paddingTop: 13 }}><div style={{ fontSize: 23, fontWeight: 900 }}>{item.big}</div><div style={{ color: muted, fontSize: 10, letterSpacing: 1.1, marginTop: 3 }}>{item.small}</div></div>)}</div>
              <div aria-hidden="true" style={{ position: "absolute", right: -20, bottom: 90, opacity: .15, fontSize: 170, fontWeight: 900, lineHeight: 1, pointerEvents: "none" }}>V</div>
            </div>
            <div style={{ ...panel, padding: 22, display: "flex", flexDirection: "column", gap: 20 }}>
              <div><div style={{ color: muted, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, marginBottom: 10 }}>01 / PLAY MODE</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><button onClick={() => setMode("computer")} style={{ ...button, background: mode === "computer" ? "#c6ebce" : button.background, color: mode === "computer" ? "#102018" : primary, borderColor: mode === "computer" ? "#c6ebce" : undefined }}>Vs Computer</button><button onClick={() => setMode("multiplayer")} style={{ ...button, background: mode === "multiplayer" ? "#c6ebce" : button.background, color: mode === "multiplayer" ? "#102018" : primary, borderColor: mode === "multiplayer" ? "#c6ebce" : undefined }}>Portal Match</button></div>{mode === "multiplayer" && <p style={{ color: "#f2c875", fontSize: 12, lineHeight: 1.5, margin: "10px 0 0" }}>Private rooms are the next milestone. This build implements the computer mode; multiplayer is not yet connected to room records.</p>}</div>
              <div><div style={{ color: muted, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, marginBottom: 10 }}>02 / CHOOSE YOUR ROLE</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><button onClick={() => setRole("hider")} style={{ ...button, textAlign: "left", background: role === "hider" ? "rgba(80,154,213,.2)" : button.background, borderColor: role === "hider" ? "#579bd2" : undefined }}><span style={{ display: "block", fontSize: 22, marginBottom: 6 }}>◈</span><span>Hide</span><span style={{ display: "block", fontSize: 11, color: muted, fontWeight: 500, marginTop: 4 }}>Stay alive for 3 minutes</span></button><button onClick={() => setRole("seeker")} style={{ ...button, textAlign: "left", background: role === "seeker" ? "rgba(224,113,76,.2)" : button.background, borderColor: role === "seeker" ? "#dc795b" : undefined }}><span style={{ display: "block", fontSize: 22, marginBottom: 6 }}>⌖</span><span>Seek</span><span style={{ display: "block", fontSize: 11, color: muted, fontWeight: 500, marginTop: 4 }}>Tag every hider</span></button></div></div>
              <div><div style={{ color: muted, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, marginBottom: 10 }}>03 / DIFFICULTY</div><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>{(["easy", "normal", "hard"] as Difficulty[]).map((d) => <button key={d} onClick={() => setDifficulty(d)} style={{ ...button, padding: "9px 5px", textTransform: "capitalize", fontSize: 12, background: difficulty === d ? "rgba(155,215,167,.17)" : button.background, borderColor: difficulty === d ? "#80ba8b" : undefined }}>{d}</button>)}</div></div>
              <button onClick={begin} disabled={mode === "multiplayer"} style={{ ...button, marginTop: "auto", padding: 15, background: mode === "multiplayer" ? "rgba(255,255,255,.07)" : "#c6ebce", color: mode === "multiplayer" ? muted : "#0c1c12", borderColor: mode === "multiplayer" ? "rgba(232,246,236,.12)" : "#c6ebce", fontSize: 15, cursor: mode === "multiplayer" ? "not-allowed" : "pointer", opacity: mode === "multiplayer" ? 0.75 : 1 }}>{mode === "multiplayer" ? "Multiplayer · Next phase" : <>Start game <span style={{ marginLeft: 8 }}>→</span></>}</button>
              <div style={{ color: muted, fontSize: 11, lineHeight: 1.5 }}>Prototype build · Solo AI mode is playable. Multiplayer and account-linked rooms are planned for the next phase.</div>
            </div>
          </section>
        ) : (
          <section style={{ position: "relative", overflow: "hidden", borderRadius: 18, border: "1px solid rgba(218,238,223,.16)", background: "#101c17" }}>
            <div ref={mountRef} style={{ height: "min(72vh, 760px)", minHeight: 430, touchAction: "none" }} />
            <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, pointerEvents: "none", flexWrap: "wrap" }}>
              <div style={{ ...panel, padding: "11px 14px", minWidth: 125 }}><div style={{ fontSize: 10, color: muted, letterSpacing: 1.2, fontWeight: 900 }}>YOUR ROLE</div><div style={{ fontSize: 21, fontWeight: 900, color: role === "hider" ? "#88c8f5" : "#ff9e7f", marginTop: 3 }}>{role === "hider" ? "HIDER" : "SEEKER"}</div></div>
              <div style={{ ...panel, padding: "11px 16px", textAlign: "center", minWidth: 110 }}><div style={{ fontSize: 10, color: muted, letterSpacing: 1.2, fontWeight: 900 }}>{hud.finalPhase ? "FINAL PHASE" : "TIME LEFT"}</div><div style={{ fontSize: 27, fontVariantNumeric: "tabular-nums", fontWeight: 900, color: hud.remaining <= 30 ? "#ffbf6d" : primary, marginTop: 1 }}>{formatTime(hud.remaining)}</div></div>
              <div style={{ ...panel, padding: "11px 14px", textAlign: "right" }}><div style={{ fontSize: 10, color: muted, letterSpacing: 1.2, fontWeight: 900 }}>OPPOSITION</div><div style={{ fontSize: 19, fontWeight: 850, marginTop: 3 }}>{role === "hider" ? `${agentsLabel(hud.total - hud.caught)} seekers` : `${hud.caught}/${hud.total} tagged`}</div></div>
            </div>
            <div style={{ position: "absolute", left: 14, bottom: 14, maxWidth: "min(440px, calc(100% - 28px))", ...panel, padding: "10px 13px", pointerEvents: "none" }}><div style={{ fontSize: 12, fontWeight: 750 }}>{hud.nearby ? "⚠ A seeker is nearby" : hud.message}</div><div style={{ color: muted, fontSize: 10, marginTop: 4 }}>WASD / arrows to move · Shift to sprint · Drag mouse to look</div></div>
            {mobile && <div style={{ position: "absolute", left: 14, bottom: 80, display: "grid", gridTemplateColumns: "repeat(3,44px)", gap: 5 }}><span /><button style={button} onPointerDown={() => touch("w", true)} onPointerUp={() => touch("w", false)} onPointerLeave={() => touch("w", false)}>↑</button><span /><button style={button} onPointerDown={() => touch("a", true)} onPointerUp={() => touch("a", false)} onPointerLeave={() => touch("a", false)}>←</button><button style={button} onPointerDown={() => touch("s", true)} onPointerUp={() => touch("s", false)} onPointerLeave={() => touch("s", false)}>↓</button><button style={button} onPointerDown={() => touch("d", true)} onPointerUp={() => touch("d", false)} onPointerLeave={() => touch("d", false)}>→</button><button style={{ ...button, gridColumn: "span 3" }} onPointerDown={() => touch("shift", true)} onPointerUp={() => touch("shift", false)} onPointerLeave={() => touch("shift", false)}>Sprint</button></div>}
            <button onClick={() => setMobile((v) => !v)} style={{ ...button, position: "absolute", right: 14, bottom: 14, background: "rgba(12,24,19,.88)" }}>{mobile ? "Hide touch controls" : "Touch controls"}</button>
            {hud.phase !== "playing" && <div style={{ position: "absolute", inset: 0, background: "rgba(4,10,7,.72)", backdropFilter: "blur(7px)", display: "grid", placeItems: "center", padding: 20 }}><div style={{ ...panel, width: "min(440px,100%)", padding: 28, textAlign: "center" }}><div style={{ color: "#9ed7ac", letterSpacing: 2, fontSize: 10, fontWeight: 900 }}>ROUND COMPLETE</div><h2 style={{ fontSize: 34, margin: "12px 0" }}>{hud.phase === "seekers-won" ? "Seekers win" : hud.phase === "caught" ? "You were found" : "Hiders survive"}</h2><p style={{ color: muted, lineHeight: 1.6 }}>{hud.message}</p><div style={{ display: "flex", gap: 9, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}><button style={{ ...button, background: "#c6ebce", color: "#0c1c12" }} onClick={begin}>Play again</button><button style={button} onClick={() => setStarted(false)}>Change role</button></div></div></div>}
          </section>
        )}
        <footer style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, color: "#71877a", fontSize: 11, marginTop: 14 }}><span>VGB Hide & Seek · Gameplay prototype</span><span>Campus geometry is an approximate playable blockout.</span></footer>
      </div>
    </main>
  );
}

function agentsLabel(count: number) { return Math.max(0, count); }
