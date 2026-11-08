"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import * as THREE from "three";
import { createCampusScene, CampusCollision } from "./game/geometry";

type Role = "hider" | "seeker";
type Difficulty = "easy" | "normal" | "hard";
type Phase = "playing" | "hider-won" | "seekers-won" | "caught";
type Agent = { id: number; mesh: THREE.Group; role: Role; alive: boolean; caged: boolean; speed: number; waypoint: number; lastSeen: THREE.Vector3 | null; think: number; hiddenSpot: number; name: string; thought: string };
type Hud = { remaining: number; phase: Phase; stage: "countdown" | "hiding" | "seeking" | "ended"; caught: number; total: number; nearby: boolean; sprint: boolean; message: string; finalPhase: boolean; caged: boolean; thoughts: { name: string; thought: string; role: Role }[] };

const HIDE_SECONDS = 10;
const SEEK_SECONDS = 90;
const ROUND_SECONDS = HIDE_SECONDS + SEEK_SECONDS;
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
  const mapRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const [mode, setMode] = useState<"computer" | "multiplayer">("computer");
  const [role, setRole] = useState<Role>("hider");
  const [seekerCount, setSeekerCount] = useState(2);
  const [hiderCount, setHiderCount] = useState(3);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [started, setStarted] = useState(false);
  const [runId, setRunId] = useState(0);
  const [hud, setHud] = useState<Hud>({ remaining: HIDE_SECONDS, phase: "playing", stage: "countdown", caught: 0, total: 3, nearby: false, sprint: false, message: "Find cover and stay alert.", finalPhase: false, caged: false, thoughts: [] });
  const [mobile, setMobile] = useState(false);
  const hold = (key: string, down: boolean) => { keysRef.current[key] = down; };

  const begin = useCallback(() => {
    setHud({ remaining: HIDE_SECONDS, phase: "playing", stage: "countdown", caught: 0, total: hiderCount, nearby: false, sprint: false, message: role === "hider" ? "You have 10 seconds to find cover." : "Seekers wait until the hide ends.", finalPhase: false, caged: false, thoughts: [] });
    setRunId((v) => v + 1);
    setStarted(true);
  }, [role, hiderCount]);

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
    // Focus the game surface when a round starts so the first WASD press is captured.
    canvasRef.current = renderer.domElement;
    renderer.domElement.focus({ preventScroll: true });
    requestAnimationFrame(() => renderer.domElement.focus({ preventScroll: true }));

    scene.add(new THREE.HemisphereLight(0xc5dcff, 0x2a472c, 1.45));
    const sun = new THREE.DirectionalLight(0xffedca, 2.0);
    sun.position.set(-42, 78, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1536, 1536);
    sun.shadow.camera.left = -110; sun.shadow.camera.right = 110; sun.shadow.camera.top = 110; sun.shadow.camera.bottom = -110;
    scene.add(sun);
    const campus = createCampusScene(scene);


    const makeCage = () => {
      const group = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color: 0xe4b15a, metalness: 0.35, roughness: 0.45 });
      for (let i = 0; i < 6; i += 1) {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.05, 6), mat);
        const ang = (i / 6) * Math.PI * 2;
        bar.position.set(Math.cos(ang) * 0.72, 1.05, Math.sin(ang) * 0.72);
        group.add(bar);
      }
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.045, 6, 18), mat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 2.05;
      group.add(ring);
      group.visible = false;
      group.name = "cage";
      return group;
    };
    const setCage = (mesh: THREE.Group, on: boolean) => {
      const cage = mesh.getObjectByName("cage");
      if (cage) cage.visible = on;
    };
    const freeCount = () => (role === "hider" && !playerCaged ? 1 : 0) + agents.filter((a) => a.role === "hider" && !a.caged).length;
    const cageActor = (mesh: THREE.Group, agent?: Agent) => {
      if (agent) agent.caged = true;
      setCage(mesh, true);
      caughtCount = agents.filter((a) => a.caged).length + (playerCaged ? 1 : 0);
      if (freeCount() === 0) endRound("seekers-won", "Every hider is caged. Seekers win.");
    };
    const freeActor = (agent: Agent) => {
      agent.caged = false;
      setCage(agent.mesh, false);
      message = `${agent.name} is free.`;
    };

    const player = makeCharacter(role === "hider" ? 0x2f83d5 : 0xd85a46, role === "seeker");
    player.position.set(role === "hider" ? 18 : -70, 0, role === "hider" ? 78 : -78);
    scene.add(player);

    const hiderNames = ["Mira", "Dev", "Leela", "Kabir", "Nia"];
    const seekerNames = ["Rafi", "Arun"];
    const hiderStarts: [number, number][] = [[-23, 64], [29, 31], [65, -18], [-40, 20], [10, -30]];
    const seekerStarts: [number, number][] = [[-61, -48], [55, -38]];
    const hiderColors = [0x4ba7d9, 0x58bd86, 0xe1a4d0, 0x7ec8b3, 0x88c8f5];
    const seekerColors = [0xe15a4f, 0xe6a93b];
    const aiHiders = Math.max(0, hiderCount - (role === "hider" ? 1 : 0));
    const aiSeekers = Math.max(0, seekerCount - (role === "seeker" ? 1 : 0));
    const roster: { role: Role; name: string; color: number; at: [number, number] }[] = [
      ...Array.from({ length: aiHiders }, (_, i) => ({ role: "hider" as Role, name: hiderNames[i], color: hiderColors[i], at: hiderStarts[i] })),
      ...Array.from({ length: aiSeekers }, (_, i) => ({ role: "seeker" as Role, name: seekerNames[i], color: seekerColors[i], at: seekerStarts[i] })),
    ];
    const agents: Agent[] = roster.map((item, i) => {
      const mesh = makeCharacter(item.color, item.role === "seeker");
      mesh.position.set(item.at[0], 0, item.at[1]);
      mesh.add(makeCage());
      scene.add(mesh);
      return { id: i, mesh, role: item.role, alive: true, caged: false, speed: (difficulty === "easy" ? 2.45 : difficulty === "hard" ? 4.1 : 3.2) + i * 0.12, waypoint: (i * 4 + 2) % WAYPOINTS.length, lastSeen: null, think: 0, hiddenSpot: (i * 5 + 3) % WAYPOINTS.length, name: item.name, thought: item.role === "hider" ? "Taking cover" : "Waiting at the gate" };
    });
    player.add(makeCage());

    const keys = keysRef.current;
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
    let playerCaged = false;
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
      const code = (event.code || "").toLowerCase();
      const named = (event.key || "").toLowerCase();
      let key = "";
      if (code === "keyw" || named === "w" || code === "arrowup") key = "w";
      else if (code === "keya" || named === "a" || code === "arrowleft") key = "a";
      else if (code === "keys" || named === "s" || code === "arrowdown") key = "s";
      else if (code === "keyd" || named === "d" || code === "arrowright") key = "d";
      else if (code.includes("shift") || named === "shift") key = "shift";
      if (!key) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      keysRef.current[key] = value;
      event.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => setKey(e, true);
    const onKeyUp = (e: KeyboardEvent) => setKey(e, false);
    const clearKeys = () => { Object.keys(keysRef.current).forEach((k) => (keysRef.current[k] = false)); Object.keys(touchKeys).forEach((k) => (touchKeys[k] = false)); };
    const onPointerDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; lastY = e.clientY; renderer.domElement.focus(); try { renderer.domElement.setPointerCapture(e.pointerId); } catch {} };
    const onPointerMove = (e: PointerEvent) => { if (!dragging) return; yaw -= (e.clientX - lastX) * 0.0055; pitch = THREE.MathUtils.clamp(pitch - (e.clientY - lastY) * 0.0038, 0.12, 0.82); lastX = e.clientX; lastY = e.clientY; };
    const onPointerUp = () => { dragging = false; };
    const onResize = () => { if (!mount) return; camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight); camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); };
    // Listen at document level: the canvas, page, or a recently clicked control may own focus.
    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });
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
    const freeHiders = () => {
      const list: { name: string; mesh: THREE.Group; agent?: Agent }[] = [];
      if (role === "hider" && !playerCaged) list.push({ name: "You", mesh: player });
      for (const h of agents) if (h.role === "hider" && !h.caged) list.push({ name: h.name, mesh: h.mesh, agent: h });
      return list;
    };
    const seekers = () => {
      const list: THREE.Group[] = [];
      if (role === "seeker") list.push(player);
      for (const s of agents) if (s.role === "seeker") list.push(s.mesh);
      return list;
    };
    const lineClear = (x1: number, z1: number, x2: number, z2: number) => {
      const dist = Math.hypot(x2 - x1, z2 - z1);
      const steps = Math.max(1, Math.ceil(dist / 1.6));
      for (let i = 1; i <= steps; i += 1) {
        const t = i / steps;
        if (blocked(x1 + (x2 - x1) * t, z1 + (z2 - z1) * t, 0.7)) return false;
      }
      return true;
    };
    const NAV: [number, number][] = [
      ...WAYPOINTS,
      [-78, -70], [-40, -82], [0, -82], [40, -82], [78, -70],
      [-78, -34], [-40, -34], [0, -34], [40, -34], [78, -34],
      [-78, 0], [-22, 0], [22, 0], [78, 0],
      [-78, 28], [-22, 28], [22, 28], [78, 28],
      [-78, 65], [-40, 65], [0, 72], [40, 65], [78, 65],
      [-78, 88], [0, 90], [78, 88],
    ];
    const links: number[][] = NAV.map(() => []);
    for (let i = 0; i < NAV.length; i += 1) {
      for (let j = i + 1; j < NAV.length; j += 1) {
        if (Math.hypot(NAV[i][0] - NAV[j][0], NAV[i][1] - NAV[j][1]) > 42) continue;
        if (lineClear(NAV[i][0], NAV[i][1], NAV[j][0], NAV[j][1])) {
          links[i].push(j);
          links[j].push(i);
        }
      }
    }
    const nearestNode = (x: number, z: number) => {
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < NAV.length; i += 1) {
        const d = Math.hypot(NAV[i][0] - x, NAV[i][1] - z);
        if (d < bestD) { bestD = d; best = i; }
      }
      return best;
    };
    const nextStep = (x: number, z: number, tx: number, tz: number): [number, number] => {
      if (lineClear(x, z, tx, tz)) return [tx, tz];
      const start = nearestNode(x, z);
      const goal = nearestNode(tx, tz);
      if (start === goal) return [tx, tz];
      const open = [start];
      const came = new Map<number, number>();
      const score = new Map<number, number>([[start, 0]]);
      const seen = new Set<number>();
      while (open.length) {
        open.sort((a, b) => (score.get(a) ?? 0) - (score.get(b) ?? 0));
        const cur = open.shift()!;
        if (cur === goal) break;
        if (seen.has(cur)) continue;
        seen.add(cur);
        for (const next of links[cur]) {
          const cost = (score.get(cur) ?? 0) + Math.hypot(NAV[next][0] - NAV[cur][0], NAV[next][1] - NAV[cur][1]);
          if (cost < (score.get(next) ?? Infinity)) {
            score.set(next, cost);
            came.set(next, cur);
            open.push(next);
          }
        }
      }
      let node = goal;
      let prev = came.get(node);
      if (prev === undefined) return [NAV[goal][0], NAV[goal][1]];
      while (prev !== undefined && prev !== start) { node = prev; prev = came.get(node); }
      return [NAV[node][0], NAV[node][1]];
    };
    const walk = (actor: THREE.Group, dest: THREE.Vector3, speed: number, dt: number) => {
      const step = nextStep(actor.position.x, actor.position.z, dest.x, dest.z);
      let dx = step[0] - actor.position.x;
      let dz = step[1] - actor.position.z;
      let len = Math.hypot(dx, dz);
      if (len < 0.25) return false;
      const before = actor.position.clone();
      moveActor(actor, (dx / len) * speed * dt, (dz / len) * speed * dt, 0.55);
      if (actor.position.distanceTo(before) < speed * dt * 0.2) {
        const side = actor.userData.side === -1 ? -1 : 1;
        moveActor(actor, (-dz / len) * side * speed * dt, (dx / len) * side * speed * dt, 0.55);
        if (actor.position.distanceTo(before) < 0.04) actor.userData.side = -side;
      }
      actor.rotation.y = Math.atan2(dx, dz);
      return !lineClear(actor.position.x, actor.position.z, dest.x, dest.z);
    };
    const stepAgent = (agent: Agent, dt: number, finalPhase: boolean, seeking: boolean) => {
      if (!agent.alive || phase !== "playing" || agent.caged) {
        if (agent.caged) agent.thought = "Caged. Waiting for a teammate";
        return;
      }
      const actor = agent.mesh;
      if (agent.role === "seeker") {
        if (!seeking) { agent.thought = "Waiting at the gate"; return; }
        const prey = freeHiders().sort((a, b) => distance2D(actor.position, a.mesh.position) - distance2D(actor.position, b.mesh.position));
        const seen = prey.find((h) => canSee(actor, h.mesh, finalPhase ? 22 : 16));
        let dest: THREE.Vector3;
        if (seen) {
          agent.lastSeen = seen.mesh.position.clone();
          agent.think = 4;
          dest = seen.mesh.position;
          agent.thought = `I see ${seen.name}`;
        } else if (agent.lastSeen && agent.think > 0) {
          agent.think -= dt;
          dest = agent.lastSeen;
          agent.thought = "Checking the last place";
          if (distance2D(actor.position, agent.lastSeen) < 2.2) {
            const near = WAYPOINTS.map((p, idx) => ({ idx, d: Math.hypot(p[0] - agent.lastSeen!.x, p[1] - agent.lastSeen!.z) })).sort((a, b) => a.d - b.d);
            agent.waypoint = near[1 + (agent.id % 3)]?.idx ?? agent.waypoint;
            agent.lastSeen = null;
          }
        } else {
          const wp = WAYPOINTS[agent.waypoint];
          dest = new THREE.Vector3(wp[0], 0, wp[1]);
          agent.thought = "Sweeping the quad";
          if (distance2D(actor.position, dest) < 3) chooseWaypoint(agent);
        }
        const around = walk(actor, dest, agent.speed * (finalPhase ? 1.08 : 1), dt);
        if (around) agent.thought = seen ? `Going around to reach ${seen.name}` : "Going around the building";
        for (const hider of prey) {
          if (distance2D(actor.position, hider.mesh.position) < 1.8 && hasLineOfSight(actor.position, hider.mesh.position)) {
            if (hider.agent) { cageActor(hider.mesh, hider.agent); message = `${hider.name} is caged.`; }
            else if (!playerCaged) { cageActor(player); playerCaged = true; message = "You are caged. A hider has to reach you."; }
          }
        }
        return;
      }
      const cover = new THREE.Vector3(WAYPOINTS[agent.hiddenSpot][0], 0, WAYPOINTS[agent.hiddenSpot][1]);
      if (!seeking) {
        agent.thought = "Taking cover";
        walk(actor, cover, agent.speed * 0.85, dt);
        return;
      }
      const threat = seekers()
        .map((s) => ({ s, d: distance2D(actor.position, s.position), seen: canSee(s, actor, finalPhase ? 22 : 16) }))
        .sort((a, b) => a.d - b.d)[0];
      if (threat && (threat.seen || threat.d < 8)) {
        const away = new THREE.Vector3(actor.position.x - threat.s.position.x, 0, actor.position.z - threat.s.position.z);
        if (away.lengthSq() < 0.1) away.set(Math.random() - 0.5, 0, Math.random() - 0.5);
        away.normalize();
        agent.thought = "Breaking line of sight";
        walk(actor, actor.position.clone().addScaledVector(away, 8), agent.speed * 1.15, dt);
        return;
      }
      const mate = agents.find((a) => a.role === "hider" && a.caged && a.id !== agent.id);
      const playerNeedsHelp = role === "hider" && playerCaged;
      const rescue = mate ? mate.mesh.position : playerNeedsHelp ? player.position : null;
      const rescueName = mate ? mate.name : playerNeedsHelp ? "You" : "";
      const rescueSafe = rescue ? seekers().every((s) => distance2D(s.position, rescue) > 10) : false;
      if (rescue && rescueSafe) {
        agent.thought = `Going to free ${rescueName}`;
        walk(actor, rescue, agent.speed * 0.9, dt);
        if (mate && distance2D(actor.position, mate.mesh.position) < 2.1) freeActor(mate);
        return;
      }
      agent.thought = "Staying quiet";
      walk(actor, cover, agent.speed * 0.55, dt);
    };

    let frame = 0;
    const animate = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.045);
      if (phase === "playing") {
        elapsed += dt;
        const countdown = 0;
        const activeElapsed = elapsed;
        const live = countdown <= 0;
        const hiding = live && activeElapsed < HIDE_SECONDS;
        const seeking = live && activeElapsed >= HIDE_SECONDS;
        // The timer resets from 10s hide to 90s seek.
        const remaining = !live
          ? HIDE_SECONDS
          : hiding
            ? Math.max(0, Math.ceil(HIDE_SECONDS - activeElapsed))
            : Math.max(0, Math.ceil(SEEK_SECONDS - (activeElapsed - HIDE_SECONDS)));
        const finalPhase = seeking && remaining <= 5;
        const canPlayerMove = !playerCaged && (role === "hider" || seeking);
        const held = keysRef.current;
        const forward = (held.w ? 1 : 0) - (held.s ? 1 : 0);
        const strafe = (held.d ? 1 : 0) - (held.a ? 1 : 0);
        const sprint = Boolean(held.shift);
        if (canPlayerMove && (forward !== 0 || strafe !== 0)) {
          const len = Math.hypot(forward, strafe) || 1;
          const speed = (sprint ? SPRINT_SPEED : WALK_SPEED) * dt;
          const dx = ((-Math.sin(yaw) * forward + Math.cos(yaw) * strafe) / len) * speed;
          const dz = ((-Math.cos(yaw) * forward - Math.sin(yaw) * strafe) / len) * speed;
          const nx = THREE.MathUtils.clamp(player.position.x + dx, -LIMIT_X, LIMIT_X);
          const nz = THREE.MathUtils.clamp(player.position.z + dz, -LIMIT_Z, LIMIT_Z);
          if (!blocked(nx, player.position.z)) player.position.x = nx;
          if (!blocked(player.position.x, nz)) player.position.z = nz;
          player.rotation.y = Math.atan2(dx, dz);
        }
        const humanTarget = new THREE.Vector3(player.position.x, player.position.y + 1.2, player.position.z);
        desiredCamera.set(player.position.x + Math.sin(yaw) * Math.cos(pitch) * 8.1, player.position.y + 1.2 + Math.sin(pitch) * 8.1, player.position.z + Math.cos(yaw) * Math.cos(pitch) * 8.1);
        camera.position.lerp(desiredCamera, 1 - Math.pow(0.001, dt));
        camera.lookAt(humanTarget);

        if (seeking && role === "hider" && !playerCaged) {
          for (const trapped of agents.filter((a) => a.role === "hider" && a.caged)) {
            if (distance2D(player.position, trapped.mesh.position) < 2.1) freeActor(trapped);
          }
        }
        if (seeking && playerCaged) {
          const rescuer = agents.find((a) => a.role === "hider" && !a.caged && distance2D(a.mesh.position, player.position) < 2.1);
          if (rescuer) { playerCaged = false; setCage(player, false); message = "A teammate freed you."; }
        }
        if (live) agents.forEach((a) => stepAgent(a, dt, finalPhase, seeking));
        if (seeking && remaining <= 0 && phase === "playing") endRound("hider-won", "Time is up! Any hider still free wins.");
        if (!live) message = `Round begins in ${Math.ceil(countdown)}…`;
        else if (hiding) message = role === "hider" ? "Hide now. You can move." : "Seekers wait. Your keys unlock when SEEK starts.";
        else if (seeking && message.startsWith("HIDE PHASE:")) {
          message = role === "seeker" ? "SEEK PHASE: find the hiders and tag them." : "SEEK PHASE: break line of sight and survive.";
        }
        const nearest = agents.filter((a) => a.alive).reduce((best, a) => Math.min(best, distance2D(a.mesh.position, player.position)), Infinity);
        const nearby = seeking && role === "hider" && nearest < (finalPhase ? 24 : 14);
        if (live && finalPhase && elapsed - lastClueAt > 8 && role === "hider") { lastClueAt = elapsed; message = "FINAL PHASE: seekers are closing in."; }
        hudElapsed += dt;
        if (hudElapsed > 0.16) {
          hudElapsed = 0;
          setHud({
            remaining,
            phase,
            stage: phase !== "playing" ? "ended" : !live ? "countdown" : hiding ? "hiding" : "seeking",
            caught: caughtCount,
            total: agents.filter((a) => a.role === "hider").length + (role === "hider" ? 1 : 0),
            nearby,
            sprint,
            message,
            finalPhase,
            caged: playerCaged,
            thoughts: agents.map((a) => ({ name: a.name, thought: a.thought, role: a.role })),
          });
        }
      }

      const map = mapRef.current;
      if (map) {
        const size = 168;
        if (map.width !== size) { map.width = size; map.height = size; }
        const ctx = map.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, size, size);
          ctx.fillStyle = "#101612";
          ctx.fillRect(0, 0, size, size);
          const sx = (x: number) => ((x + LIMIT_X) / (LIMIT_X * 2)) * size;
          const sy = (z: number) => ((z + LIMIT_Z) / (LIMIT_Z * 2)) * size;
          const dots = [{ name: "You", x: player.position.x, z: player.position.z, color: "#e4b15a", caged: playerCaged }, ...agents.map((a) => ({ name: a.name, x: a.mesh.position.x, z: a.mesh.position.z, color: a.caged ? "#e4b15a" : a.role === "hider" ? "#7ec8b3" : "#d4654a", caged: a.caged }))];
          for (const dot of dots) {
            ctx.beginPath();
            ctx.fillStyle = dot.color;
            ctx.arc(sx(dot.x), sy(dot.z), dot.name === "You" ? 4 : 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#f3efe4";
            ctx.font = "600 9px sans-serif";
            ctx.fillText(dot.name, sx(dot.x) + 5, sy(dot.z) - 4);
          }
        }
      }
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      delete (window as any).__vgbSetTouchKey;
      canvasRef.current = null;
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) { obj.geometry.dispose(); const material = obj.material; if (Array.isArray(material)) material.forEach((m) => m.dispose()); else material.dispose(); }
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [started, role, difficulty, runId, seekerCount, hiderCount]);

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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 38 }}>{[{ big: "10s", small: "TO HIDE" }, { big: "1.5m", small: "TO SEEK" }, { big: "CAGE", small: "UNTIL FREED" }].map((item) => <div key={item.small} style={{ borderTop: "1px solid rgba(230,246,235,.2)", paddingTop: 13 }}><div style={{ fontSize: 23, fontWeight: 900 }}>{item.big}</div><div style={{ color: muted, fontSize: 10, letterSpacing: 1.1, marginTop: 3 }}>{item.small}</div></div>)}</div>
              <div aria-hidden="true" style={{ position: "absolute", right: -20, bottom: 90, opacity: .15, fontSize: 170, fontWeight: 900, lineHeight: 1, pointerEvents: "none" }}>V</div>
            </div>
            <div style={{ ...panel, padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <div style={{ color: muted, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, marginBottom: 10 }}>01 / YOUR SIDE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button onClick={() => setRole("hider")} style={{ ...button, textAlign: "left", background: role === "hider" ? "rgba(80,154,213,.2)" : button.background, borderColor: role === "hider" ? "#579bd2" : undefined }}><span style={{ display: "block", fontSize: 15 }}>Hide</span><span style={{ display: "block", fontSize: 11, color: muted, fontWeight: 500, marginTop: 4 }}>Move from the first second</span></button>
                  <button onClick={() => setRole("seeker")} style={{ ...button, textAlign: "left", background: role === "seeker" ? "rgba(224,113,76,.2)" : button.background, borderColor: role === "seeker" ? "#dc795b" : undefined }}><span style={{ display: "block", fontSize: 15 }}>Seek</span><span style={{ display: "block", fontSize: 11, color: muted, fontWeight: 500, marginTop: 4 }}>Keys unlock after 10s</span></button>
                </div>
              </div>
              <div>
                <div style={{ color: muted, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, marginBottom: 10 }}>02 / SEEKERS · MAX 2</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{[1, 2].map((n) => <button key={n} onClick={() => setSeekerCount(n)} style={{ ...button, background: seekerCount === n ? "#c6ebce" : button.background, color: seekerCount === n ? "#102018" : primary }}>{n} seeker{n > 1 ? "s" : ""}</button>)}</div>
              </div>
              <div>
                <div style={{ color: muted, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, marginBottom: 10 }}>03 / HIDERS · MAX 5</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setHiderCount(n)} style={{ ...button, padding: "9px 4px", background: hiderCount === n ? "#c6ebce" : button.background, color: hiderCount === n ? "#102018" : primary }}>{n}</button>)}</div>
              </div>
              <div>
                <div style={{ color: muted, fontSize: 11, fontWeight: 800, letterSpacing: 1.4, marginBottom: 10 }}>04 / COMPUTER</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>{(["easy", "normal", "hard"] as Difficulty[]).map((d) => <button key={d} onClick={() => setDifficulty(d)} style={{ ...button, padding: "9px 5px", textTransform: "capitalize", fontSize: 12, background: difficulty === d ? "rgba(155,215,167,.17)" : button.background, borderColor: difficulty === d ? "#80ba8b" : undefined }}>{d}</button>)}</div>
              </div>
              <button onClick={begin} style={{ ...button, marginTop: "auto", padding: 15, background: "#c6ebce", color: "#0c1c12", borderColor: "#c6ebce", fontSize: 15 }}>Start game <span style={{ marginLeft: 8 }}>→</span></button>
              <div style={{ color: muted, fontSize: 11, lineHeight: 1.5 }}>Hiders can move for the whole 10 seconds. Seekers unlock when that clock ends, then have 1.5 minutes. A touch cages a hider until another hider reaches them.</div>
            </div>
          </section>
        ) : (
          <section onPointerDown={() => canvasRef.current?.focus({ preventScroll: true })} style={{ position: "relative", overflow: "hidden", borderRadius: 18, border: "1px solid rgba(218,238,223,.16)", background: "#101c17" }}>
            <div ref={mountRef} style={{ height: "min(72vh, 760px)", minHeight: 430, touchAction: "none" }} />
            <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, pointerEvents: "none", flexWrap: "wrap" }}>
              <div style={{ ...panel, padding: "11px 14px", minWidth: 125 }}><div style={{ fontSize: 10, color: muted, letterSpacing: 1.2, fontWeight: 900 }}>YOUR ROLE</div><div style={{ fontSize: 21, fontWeight: 900, color: role === "hider" ? "#88c8f5" : "#ff9e7f", marginTop: 3 }}>{role === "hider" ? "HIDER" : "SEEKER"}</div></div>
              <div style={{ ...panel, padding: "11px 16px", textAlign: "center", minWidth: 110 }}><div style={{ fontSize: 10, color: muted, letterSpacing: 1.2, fontWeight: 900 }}>{hud.stage === "hiding" ? "HIDE" : hud.stage === "seeking" ? "SEEK" : "ROUND"}</div><div style={{ fontSize: 27, fontVariantNumeric: "tabular-nums", fontWeight: 900, color: "#e4b15a", marginTop: 1 }}>{hud.remaining}</div></div>
              <div style={{ ...panel, padding: "11px 14px", textAlign: "right" }}><div style={{ fontSize: 10, color: muted, letterSpacing: 1.2, fontWeight: 900 }}>CAGED</div><div style={{ fontSize: 19, fontWeight: 850, marginTop: 3 }}>{hud.caught}/{hud.total}</div></div>
            </div>
            <div style={{ position: "absolute", left: 180, bottom: 14, maxWidth: "min(360px, calc(100% - 380px))", ...panel, padding: "10px 13px", pointerEvents: "none" }}><div style={{ fontSize: 12, fontWeight: 750 }}>{hud.nearby ? "A seeker is nearby" : hud.message}</div><div style={{ color: muted, fontSize: 10, marginTop: 4 }}>{role === "hider" ? "Move during the 10 seconds. That is your hide time." : "You move when the clock flips to SEEK."}</div></div>
            <div style={{ position: "absolute", left: 14, bottom: 14, zIndex: 5, display: "grid", gridTemplateColumns: "repeat(3,52px)", gap: 6 }}>
              <span />
              <button style={button} onPointerDown={(e) => { e.stopPropagation(); hold("w", true); }} onPointerUp={() => hold("w", false)} onPointerLeave={() => hold("w", false)}>W</button>
              <span />
              <button style={button} onPointerDown={(e) => { e.stopPropagation(); hold("a", true); }} onPointerUp={() => hold("a", false)} onPointerLeave={() => hold("a", false)}>A</button>
              <button style={button} onPointerDown={(e) => { e.stopPropagation(); hold("s", true); }} onPointerUp={() => hold("s", false)} onPointerLeave={() => hold("s", false)}>S</button>
              <button style={button} onPointerDown={(e) => { e.stopPropagation(); hold("d", true); }} onPointerUp={() => hold("d", false)} onPointerLeave={() => hold("d", false)}>D</button>
            </div>
            {hud.thoughts.length > 0 && <div style={{ ...panel, position: "absolute", top: 92, right: 14, width: 230, padding: "10px 12px", pointerEvents: "none" }}><div style={{ fontSize: 10, color: muted, letterSpacing: 1.2, fontWeight: 900, marginBottom: 6 }}>MINDS</div>{hud.thoughts.map((item) => <div key={item.name} style={{ fontSize: 12, lineHeight: 1.45 }}><span style={{ color: item.role === "seeker" ? "#ff9e7f" : "#88c8f5" }}>{item.name}</span><span style={{ color: muted }}> · {item.thought}</span></div>)}</div>}
            {hud.caged && hud.stage === "seeking" && <div style={{ position: "absolute", left: "50%", top: 18, transform: "translateX(-50%)", ...panel, color: "#e4b15a", padding: "8px 14px", fontSize: 13 }}>Caged. A free hider has to reach you.</div>}
            <canvas ref={mapRef} aria-label="Minimap of every player" style={{ position: "absolute", right: 14, bottom: 14, width: 168, height: 168, borderRadius: 16, border: "1px solid rgba(218,238,223,.18)", background: "#101612" }} />
{hud.phase !== "playing" && <div style={{ position: "absolute", inset: 0, background: "rgba(4,10,7,.72)", backdropFilter: "blur(7px)", display: "grid", placeItems: "center", padding: 20 }}><div style={{ ...panel, width: "min(440px,100%)", padding: 28, textAlign: "center" }}><div style={{ color: "#9ed7ac", letterSpacing: 2, fontSize: 10, fontWeight: 900 }}>ROUND COMPLETE</div><h2 style={{ fontSize: 34, margin: "12px 0" }}>{hud.phase === "seekers-won" ? "Seekers win" : hud.phase === "caught" ? "You were found" : "Hiders survive"}</h2><p style={{ color: muted, lineHeight: 1.6 }}>{hud.message}</p><div style={{ display: "flex", gap: 9, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}><button style={{ ...button, background: "#c6ebce", color: "#0c1c12" }} onClick={begin}>Play again</button><button style={button} onClick={() => setStarted(false)}>Change role</button></div></div></div>}
          </section>
        )}
        <footer style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, color: "#71877a", fontSize: 11, marginTop: 14 }}><span>VGB Hide & Seek · 10s hide + 1.5 min seek · max 2 seekers, 5 hiders</span><span>Campus geometry is an approximate playable blockout.</span></footer>
      </div>
    </main>
  );
}

function agentsLabel(count: number) { return Math.max(0, count); }
