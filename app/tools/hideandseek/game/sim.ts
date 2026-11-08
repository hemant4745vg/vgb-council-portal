import {
  COVERS,
  HIDE_SECONDS,
  PATROL,
  SEEK_SECONDS,
  lineBlocked,
  resolveCircle,
} from "./world";

export type Role = "hider" | "seeker";
export type Phase = "menu" | "hide" | "seek" | "over";

export type Actor = {
  id: string;
  name: string;
  role: Role;
  human: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: number;
  caged: boolean;
  thought: string;
  tx: number;
  ty: number;
  think: number;
  memory: number;
  lx: number;
  ly: number;
  wp: number;
  cover: number;
};

export type Sim = {
  phase: Phase;
  role: Role;
  time: number;
  result: string;
  actors: Actor[];
};

const RADIUS = 16;
const VIEW = 230;
const CONE = 0.62;
const WALK = 168;
const SPRINT = 236;
const AI_HIDE = 156;
const AI_SEEK = 176;

const HIDERS = [
  { id: "h1", name: "You", x: 250, y: 300 },
  { id: "h2", name: "Mira", x: 860, y: 280 },
  { id: "h3", name: "Dev", x: 1360, y: 320 },
];

const SEEKERS = [
  { id: "s1", name: "You", x: 320, y: 900 },
  { id: "s2", name: "Arun", x: 1360, y: 900 },
];

function actor(partial: {
  id: string;
  name: string;
  role: Role;
  human: boolean;
  x: number;
  y: number;
  cover: number;
  wp: number;
}): Actor {
  return {
    ...partial,
    vx: 0,
    vy: 0,
    facing: partial.role === "seeker" ? Math.PI : 0,
    caged: false,
    thought: partial.role === "hider" ? "Finding cover" : "Waiting at the gate",
    tx: partial.x,
    ty: partial.y,
    think: 0,
    memory: 0,
    lx: partial.x,
    ly: partial.y,
    wp: partial.wp,
    cover: partial.cover,
  };
}

export function createSim(role: Role = "hider"): Sim {
  const humanHides = role === "hider";
  const hiders = HIDERS.map((h, i) =>
    actor({
      id: h.id,
      name: humanHides && i === 0 ? "You" : i === 0 ? "Leela" : h.name,
      role: "hider",
      human: humanHides && i === 0,
      x: h.x,
      y: h.y,
      cover: i * 3,
      wp: i,
    }),
  );
  const seekers = SEEKERS.map((s, i) =>
    actor({
      id: s.id,
      name: !humanHides && i === 0 ? "You" : i === 0 ? "Rafi" : s.name,
      role: "seeker",
      human: !humanHides && i === 0,
      x: s.x,
      y: s.y,
      cover: 0,
      wp: i * 3,
    }),
  );
  return { phase: "menu", role, time: HIDE_SECONDS, result: "", actors: [...hiders, ...seekers] };
}

export function playerOf(sim: Sim) {
  return sim.actors.find((a) => a.human) ?? sim.actors[0];
}

function canSee(from: Actor, to: Actor) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  if (dist > VIEW || dist < 1) return dist < 1;
  const lx = -Math.sin(from.facing);
  const ly = -Math.cos(from.facing);
  if ((dx * lx + dy * ly) / dist < Math.cos(CONE)) return false;
  return !lineBlocked(from.x, from.y, to.x, to.y);
}

function nearestCover(x: number, y: number, avoidX: number, avoidY: number) {
  let best = 0;
  let score = -Infinity;
  COVERS.forEach((c, i) => {
    const fromThreat = Math.hypot(c.x - avoidX, c.y - avoidY);
    const travel = Math.hypot(c.x - x, c.y - y);
    const value = fromThreat - travel * 0.35;
    if (value > score) {
      score = value;
      best = i;
    }
  });
  return best;
}

function thinkSeeker(sim: Sim, a: Actor) {
  const prey = sim.actors.filter((h) => h.role === "hider" && !h.caged);
  const seen = prey.find((h) => canSee(a, h));
  if (seen) {
    a.lx = seen.x;
    a.ly = seen.y;
    a.memory = 3.2;
    a.tx = seen.x;
    a.ty = seen.y;
    a.thought = `I see ${seen.name}`;
    return;
  }
  if (a.memory > 0) {
    const arrived = Math.hypot(a.x - a.lx, a.y - a.ly) < 22;
    if (!arrived) {
      a.tx = a.lx;
      a.ty = a.ly;
      a.thought = "Checking the last place";
      return;
    }
    const spot = COVERS[(a.wp + a.cover + 2) % COVERS.length];
    a.tx = spot.x;
    a.ty = spot.y;
    a.thought = "Searching this corner";
    if (Math.hypot(a.x - spot.x, a.y - spot.y) < 20) a.memory = 0;
    return;
  }
  const wp = PATROL[a.wp % PATROL.length];
  a.tx = wp.x;
  a.ty = wp.y;
  a.thought = "Sweeping the quad";
  if (Math.hypot(a.x - wp.x, a.y - wp.y) < 24) a.wp = (a.wp + 1) % PATROL.length;
}

function thinkHider(sim: Sim, a: Actor) {
  if (a.caged) {
    a.thought = "Caged. Waiting for a teammate";
    return;
  }
  const seekers = sim.actors.filter((s) => s.role === "seeker");
  const threat = seekers.reduce(
    (best, s) => {
      const d = Math.hypot(s.x - a.x, s.y - a.y);
      return d < best.d ? { d, s, seen: canSee(s, a) } : best;
    },
    { d: Infinity, s: seekers[0], seen: false },
  );
  const cagedMate = sim.actors.find((h) => h.role === "hider" && h.caged && h.id !== a.id);
  if (cagedMate && sim.phase === "seek") {
    const danger = seekers.some((s) => Math.hypot(s.x - cagedMate.x, s.y - cagedMate.y) < 120);
    if (!danger && threat.d > 90) {
      a.tx = cagedMate.x;
      a.ty = cagedMate.y;
      a.thought = `Freeing ${cagedMate.name}`;
      return;
    }
  }
  if (threat.seen || threat.d < 110) {
    const cover = nearestCover(a.x, a.y, threat.s.x, threat.s.y);
    a.cover = cover;
    a.tx = COVERS[cover].x;
    a.ty = COVERS[cover].y;
    a.thought = threat.seen ? "They see me. Breaking cover" : "A seeker is close";
    return;
  }
  const spot = COVERS[a.cover % COVERS.length];
  a.tx = spot.x;
  a.ty = spot.y;
  a.thought = Math.hypot(a.x - spot.x, a.y - spot.y) < 16 ? "Staying quiet" : "Taking cover";
}

function moveToward(a: Actor, speed: number, dt: number) {
  const dx = a.tx - a.x;
  const dy = a.ty - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 10) {
    a.vx = 0;
    a.vy = 0;
    return;
  }
  a.vx = (dx / dist) * speed;
  a.vy = (dy / dist) * speed;
  a.x += a.vx * dt;
  a.y += a.vy * dt;
  a.facing = Math.atan2(-a.vx, -a.vy);
}

function slide(a: Actor) {
  const next = resolveCircle(a.x, a.y, RADIUS);
  a.x = next.x;
  a.y = next.y;
}

export function step(sim: Sim, dt: number, keys: Set<string>) {
  if (sim.phase === "menu" || sim.phase === "over") return;

  if (sim.phase === "hide") {
    sim.time -= dt;
    if (sim.time <= 0) {
      sim.phase = "seek";
      sim.time = SEEK_SECONDS;
    }
  } else {
    sim.time -= dt;
    if (sim.time <= 0) {
      sim.time = 0;
      sim.phase = "over";
      sim.result = "Hiders hold the quad";
    }
  }

  const seeking = sim.phase === "seek";

  for (const a of sim.actors) {
    if (a.memory > 0 && !a.human) a.memory -= dt;
    a.think -= dt;
    if (!a.human && a.think <= 0) {
      a.think = 0.22;
      if (a.role === "seeker") {
        if (seeking) thinkSeeker(sim, a);
      } else thinkHider(sim, a);
    }
  }

  for (const a of sim.actors) {
    const locked = a.caged || (a.role === "seeker" && !seeking);
    if (locked) {
      a.vx = 0;
      a.vy = 0;
      continue;
    }
    if (a.human) {
      let ix = 0;
      let iy = 0;
      if (keys.has("KeyW") || keys.has("ArrowUp")) iy -= 1;
      if (keys.has("KeyS") || keys.has("ArrowDown")) iy += 1;
      if (keys.has("KeyA") || keys.has("ArrowLeft")) ix -= 1;
      if (keys.has("KeyD") || keys.has("ArrowRight")) ix += 1;
      const len = Math.hypot(ix, iy);
      const speed = keys.has("ShiftLeft") || keys.has("ShiftRight") ? SPRINT : WALK;
      if (len > 0) {
        a.vx = (ix / len) * speed;
        a.vy = (iy / len) * speed;
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.facing = Math.atan2(-a.vx, -a.vy);
      } else {
        a.vx = 0;
        a.vy = 0;
      }
    } else if (a.role === "seeker") {
      moveToward(a, AI_SEEK, dt);
    } else {
      const hold = a.thought === "Staying quiet";
      if (!hold) moveToward(a, AI_HIDE, dt);
      else {
        a.vx = 0;
        a.vy = 0;
      }
    }
    slide(a);
  }

  if (!seeking) return;

  for (const seeker of sim.actors.filter((a) => a.role === "seeker")) {
    for (const hider of sim.actors.filter((a) => a.role === "hider" && !a.caged)) {
      if (Math.hypot(seeker.x - hider.x, seeker.y - hider.y) < RADIUS * 2 + 6) {
        hider.caged = true;
        hider.vx = 0;
        hider.vy = 0;
        hider.thought = "Caged. Waiting for a teammate";
      }
    }
  }

  for (const mate of sim.actors.filter((a) => a.role === "hider" && !a.caged)) {
    for (const trapped of sim.actors.filter((a) => a.role === "hider" && a.caged)) {
      if (Math.hypot(mate.x - trapped.x, mate.y - trapped.y) < RADIUS * 2 + 10) {
        trapped.caged = false;
        trapped.thought = "Free. Getting out of sight";
        trapped.cover = nearestCover(trapped.x, trapped.y, mate.x, mate.y);
      }
    }
  }

  const free = sim.actors.some((a) => a.role === "hider" && !a.caged);
  if (!free && sim.phase === "seek") {
    sim.phase = "over";
    sim.result = "Seekers caged the quad";
  }
}
