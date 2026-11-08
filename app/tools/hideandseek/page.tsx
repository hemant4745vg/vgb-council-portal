"use client";

import { useEffect, useRef, useState } from "react";
import { drawMap, drawWorld } from "./game/draw";
import { createSim, playerOf, step, type Role, type Sim } from "./game/sim";
import { HIDE_SECONDS, SEEK_SECONDS } from "./game/world";

type Hud = {
  phase: Sim["phase"];
  time: number;
  role: Role;
  result: string;
  caged: boolean;
  thoughts: { name: string; thought: string; role: Role }[];
};

function snapshot(sim: Sim): Hud {
  const you = playerOf(sim);
  return {
    phase: sim.phase,
    time: Math.max(0, sim.time),
    role: sim.role,
    result: sim.result,
    caged: you.caged,
    thoughts: sim.actors
      .filter((a) => !a.human)
      .map((a) => ({ name: a.name, thought: a.thought, role: a.role })),
  };
}

export default function HideAndSeekPage() {
  const worldRef = useRef<HTMLCanvasElement | null>(null);
  const mapRef = useRef<HTMLCanvasElement | null>(null);
  const simRef = useRef<Sim>(createSim("hider"));
  const keysRef = useRef(new Set<string>());
  const [role, setRole] = useState<Role>("hider");
  const [hud, setHud] = useState<Hud>(snapshot(simRef.current));

  useEffect(() => {
    const real = keysRef.current;
    const onDown = (event: KeyboardEvent) => {
      real.add(event.code);
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
        event.preventDefault();
      }
    };
    const onUp = (event: KeyboardEvent) => real.delete(event.code);
    const clear = () => real.clear();
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clear);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let hudClock = 0;
    const camera = { x: 840, y: 520 };
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const sim = simRef.current;
      step(sim, dt, keysRef.current);
      const you = playerOf(sim);
      camera.x += (you.x - camera.x) * Math.min(1, dt * 4);
      camera.y += (you.y - camera.y) * Math.min(1, dt * 4);
      const world = worldRef.current;
      const map = mapRef.current;
      if (world) {
        const rect = world.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = Math.max(1, Math.floor(rect.width * dpr));
        const h = Math.max(1, Math.floor(rect.height * dpr));
        if (world.width !== w || world.height !== h) {
          world.width = w;
          world.height = h;
        }
        const ctx = world.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawWorld(ctx, sim, camera, rect.width, rect.height);
        }
      }
      if (map && sim.phase !== "menu") {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const css = map.getBoundingClientRect().width || 144;
        const size = Math.floor(css * dpr);
        if (map.width !== size) {
          map.width = size;
          map.height = size;
        }
        const ctx = map.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          drawMap(ctx, sim, css);
        }
      }
      hudClock += dt;
      if (hudClock > 0.12) {
        hudClock = 0;
        setHud(snapshot(sim));
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  const start = () => {
    const sim = createSim(role);
    sim.phase = "hide";
    sim.time = HIDE_SECONDS;
    simRef.current = sim;
    setHud(snapshot(sim));
  };

  const clock =
    hud.phase === "hide" ? "Hide" : hud.phase === "seek" ? "Seek" : hud.phase === "over" ? "Round" : "Ready";

  return (
    <main className="relative h-[calc(100dvh-4.5rem)] overflow-hidden bg-[#101612] text-[#f3efe4]">
      <canvas ref={worldRef} className="absolute inset-0 h-full w-full" />

      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="rounded-2xl border border-[#314036] bg-[#17211c]/90 px-4 py-3 backdrop-blur-md">
          <p className="text-xs font-medium uppercase tracking-widest text-[#b7c2b4]">{clock}</p>
          <p className="font-serif text-4xl leading-none text-[#e4b15a]">
            {hud.phase === "menu" ? "10" : hud.time.toFixed(1)}
          </p>
          <p className="mt-1 text-sm text-[#b7c2b4]">
            {hud.phase === "seek" ? `${SEEK_SECONDS}s to find` : `${HIDE_SECONDS}s to cover`}
          </p>
        </div>
        {hud.phase !== "menu" && (
          <div className="hidden max-w-sm rounded-2xl border border-[#314036] bg-[#17211c]/90 p-4 backdrop-blur-md sm:block">
            <p className="text-xs font-medium uppercase tracking-widest text-[#b7c2b4]">Minds</p>
            <ul className="mt-2 space-y-1.5">
              {hud.thoughts.map((item) => (
                <li key={item.name} className="text-sm leading-snug">
                  <span className={item.role === "seeker" ? "text-[#d4654a]" : "text-[#7ec8b3]"}>{item.name}</span>
                  <span className="text-[#b7c2b4]"> · {item.thought}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {hud.caged && hud.phase === "seek" && (
        <div className="pointer-events-none absolute left-1/2 top-28 -translate-x-1/2 rounded-full border border-[#e4b15a] bg-[#17211c] px-4 py-2 text-sm text-[#e4b15a]">
          Caged. A free hider has to reach you.
        </div>
      )}

      <canvas
        ref={mapRef}
        aria-label="Minimap of every player"
        className={`absolute bottom-4 right-4 h-36 w-36 rounded-2xl border border-[#314036] shadow-lg sm:bottom-6 sm:right-6 sm:h-44 sm:w-44 ${hud.phase === "menu" ? "hidden" : ""}`}
      />

      {hud.phase !== "menu" && hud.phase !== "over" && (
        <div className="absolute bottom-4 left-4 z-10 grid grid-cols-3 gap-2 sm:hidden">
          <span />
          <Touch label="W" code="KeyW" keys={keysRef} />
          <span />
          <Touch label="A" code="KeyA" keys={keysRef} />
          <Touch label="S" code="KeyS" keys={keysRef} />
          <Touch label="D" code="KeyD" keys={keysRef} />
        </div>
      )}

      {hud.phase === "menu" && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-[#101612]/70 p-4">
          <section className="w-full max-w-md rounded-3xl border border-[#314036] bg-[#17211c] p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-widest text-[#e4b15a]">Quadrangle</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight text-[#f3efe4]">Hide, or seek.</h1>
            <p className="mt-3 text-sm leading-6 text-[#b7c2b4]">
              Ten seconds to take cover. Thirty to search. A touch cages a hider in place until another hider reaches them.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <RoleButton active={role === "hider"} onClick={() => setRole("hider")} title="Hide" detail="Three hiders" />
              <RoleButton active={role === "seeker"} onClick={() => setRole("seeker")} title="Seek" detail="Two seekers" />
            </div>
            <button
              type="button"
              onClick={start}
              className="mt-4 w-full rounded-2xl bg-[#e4b15a] px-4 py-3 text-sm font-semibold text-[#101612]"
            >
              Start
            </button>
          </section>
        </div>
      )}

      {hud.phase === "over" && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-[#101612]/70 p-4">
          <section className="w-full max-w-md rounded-3xl border border-[#314036] bg-[#17211c] p-6 text-center sm:p-8">
            <p className="text-xs font-medium uppercase tracking-widest text-[#b7c2b4]">Round over</p>
            <h2 className="mt-2 font-serif text-4xl text-[#f3efe4]">{hud.result}</h2>
            <button
              type="button"
              onClick={start}
              className="mt-6 rounded-2xl bg-[#e4b15a] px-5 py-3 text-sm font-semibold text-[#101612]"
            >
              Start
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

function RoleButton({
  active,
  onClick,
  title,
  detail,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-3 text-left ${active ? "border-[#e4b15a] bg-[#101612]" : "border-[#314036] bg-[#101612]/40"}`}
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className="block text-xs text-[#b7c2b4]">{detail}</span>
    </button>
  );
}

function Touch({ label, code, keys }: { label: string; code: string; keys: { current: Set<string> | null } }) {
  const hold = (down: boolean) => {
    const set = keys.current;
    if (!set) return;
    if (down) set.add(code);
    else set.delete(code);
  };
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#314036] bg-[#17211c]/90 text-xs font-semibold text-[#f3efe4]"
      onPointerDown={(event) => {
        event.preventDefault();
        hold(true);
      }}
      onPointerUp={() => hold(false)}
      onPointerLeave={() => hold(false)}
      onPointerCancel={() => hold(false)}
    >
      {label}
    </button>
  );
}
