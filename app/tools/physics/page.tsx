 "use client";

import { useEffect, useMemo, useState } from "react";

/*
  VGB Physics Tools
  CBSE Physics 042 · Classes XI–XII · 2026–27

  Drop this file into:
    app/physics/page.tsx

  This first build intentionally uses only React + Tailwind + SVG.
  No extra chart/simulation dependency is required.
*/

type ClassKey = "XI" | "XII" | "Lab";
type Tool = {
  id: string;
  title: string;
  chapter: string;
  description: string;
  tag?: string;
};

const XI_TOOLS: Tool[] = [
  { id: "units", title: "Units & Measurements", chapter: "Ch. 1", description: "SI units, significant figures, uncertainty and dimensional analysis.", tag: "Measurement" },
  { id: "kinematics", title: "Motion Graph Lab", chapter: "Ch. 2", description: "Explore x–t, v–t and a–t graphs for one-dimensional motion.", tag: "Graph" },
  { id: "vectors", title: "Vector Explorer", chapter: "Ch. 3", description: "Add, subtract and resolve vectors into rectangular components.", tag: "Vectors" },
  { id: "projectile", title: "Projectile Motion", chapter: "Ch. 3", description: "Change launch speed and angle and inspect the complete trajectory.", tag: "Simulation" },
  { id: "forces", title: "Force & FBD Lab", chapter: "Ch. 4", description: "Build free-body diagrams and study friction, net force and acceleration.", tag: "Dynamics" },
  { id: "energy", title: "Work–Energy Lab", chapter: "Ch. 5", description: "Connect force, work, kinetic energy and power.", tag: "Energy" },
  { id: "rotation", title: "Rotation Lab", chapter: "Ch. 6", description: "Explore torque, angular motion and moment of inertia.", tag: "Rotation" },
  { id: "gravity", title: "Gravitation Lab", chapter: "Ch. 7", description: "Explore g, orbital velocity, escape velocity and satellite energy.", tag: "Gravity" },
  { id: "thermo", title: "Thermodynamic Processes", chapter: "Ch. 11", description: "Explore P–V diagrams, work and the first law.", tag: "Thermodynamics" },
  { id: "shm", title: "SHM & Wave Lab", chapter: "Ch. 13–14", description: "Visualise simple harmonic motion, travelling waves and standing waves.", tag: "Waves" },
];

const XII_TOOLS: Tool[] = [
  { id: "electric", title: "Electric Field Explorer", chapter: "Ch. 1", description: "Place charges and inspect the resulting electric field.", tag: "Electrostatics" },
  { id: "capacitor", title: "Capacitor Lab", chapter: "Ch. 2", description: "Change geometry and dielectric and inspect capacitance and stored energy.", tag: "Electrostatics" },
  { id: "circuit", title: "Circuit Builder", chapter: "Ch. 3", description: "Study Ohm's law, series/parallel resistance and electrical power.", tag: "Current" },
  { id: "magnetism", title: "Magnetic Field Explorer", chapter: "Ch. 4–5", description: "Explore fields of wires, loops and magnetic dipoles.", tag: "Magnetism" },
  { id: "emi", title: "EMI & AC Lab", chapter: "Ch. 6–7", description: "Visualise induction, sinusoidal AC and resonance.", tag: "EMI / AC" },
  { id: "ray", title: "Ray Optics Lab", chapter: "Ch. 9", description: "Move objects and inspect image formation with mirrors and lenses.", tag: "Optics" },
  { id: "waveoptics", title: "Wave Optics Lab", chapter: "Ch. 10", description: "Explore Young's double-slit interference and diffraction.", tag: "Optics" },
  { id: "photoelectric", title: "Photoelectric Effect", chapter: "Ch. 11", description: "Investigate threshold frequency, stopping potential and intensity.", tag: "Modern Physics" },
  { id: "bohr", title: "Bohr Model Explorer", chapter: "Ch. 12", description: "Inspect hydrogen energy levels and spectral transitions.", tag: "Atoms" },
  { id: "semiconductor", title: "Semiconductor Lab", chapter: "Ch. 14", description: "Explore diode I–V behaviour and rectification.", tag: "Electronics" },
];

const PRACTICALS = [
  ["XI", "Vernier Callipers", "Measure diameter, internal diameter and depth."],
  ["XI", "Screw Gauge", "Measure wire diameter and sheet thickness."],
  ["XI", "Simple Pendulum", "Plot L–T data and determine effective length."],
  ["XI", "Limiting Friction", "Find coefficient of friction from force and normal reaction."],
  ["XI", "Projectile Range", "Study range variation with angle of projection."],
  ["XI", "Young's Modulus", "Determine elasticity from load and extension."],
  ["XI", "Helical Spring", "Find spring constant from load–extension graph."],
  ["XI", "Surface Tension", "Determine surface tension by capillary rise."],
  ["XI", "Viscosity", "Determine viscosity from terminal velocity."],
  ["XI", "Sonometer", "Study frequency, length and tension relationships."],
  ["XII", "Resistivity", "Plot potential difference versus current."],
  ["XII", "Metre Bridge", "Determine resistance and verify combinations."],
  ["XII", "Galvanometer", "Determine resistance and figure of merit."],
  ["XII", "Lens Focal Length", "Use u–v or 1/u–1/v graphs."],
  ["XII", "Prism", "Plot incidence versus deviation and find minimum deviation."],
  ["XII", "p–n Junction", "Plot I–V characteristics in forward and reverse bias."],
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function fmt(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "—";
  return Number(n.toFixed(digits)).toString();
}

function SectionButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-slate-950 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="font-mono font-semibold text-slate-950">
          {fmt(value)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-slate-900"
      />
    </label>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-950">
        {value} <span className="text-xs font-medium text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

function Graph({
  points,
  xMin,
  xMax,
  yMin,
  yMax,
  xLabel,
  yLabel,
  marker,
  markerLabel,
  hoverLabel,
  annotations = [],
}: {
  points: { x: number; y: number }[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xLabel: string;
  yLabel: string;
  marker?: { x: number; y: number };
  markerLabel?: string;
  hoverLabel?: (x: number, y: number) => string;
  annotations?: { x: number; y: number; label: string }[];
}) {
  const W = 760, H = 390;
  const pad = { l: 64, r: 24, t: 28, b: 52 };
  const safeX = xMax === xMin ? xMax + 1 : xMax;
  const safeY = yMax === yMin ? yMax + 1 : yMax;
  const sx = (x: number) => pad.l + ((x - xMin) / (safeX - xMin)) * (W - pad.l - pad.r);
  const sy = (y: number) => H - pad.b - ((y - yMin) / (safeY - yMin)) * (H - pad.t - pad.b);
  const path = points.map((p, i) => `${i ? "L" : "M"} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(" ");
  const xTicks = 8;
  const yTicks = 6;
  const [hover, setHover] = useState<{ x: number; y: number; px: number; py: number } | null>(null);

  const nearest = (value: number, axis: "x" | "y") => {
    if (!points.length) return 0;
    let best = points[0];
    let distance = Infinity;
    for (const p of points) {
      const d = Math.abs((axis === "x" ? p.x : p.y) - value);
      if (d < distance) { distance = d; best = p; }
    }
    return best;
  };

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = ((e.clientX - rect.left) / rect.width) * W;
    const valueX = xMin + ((localX - pad.l) / (W - pad.l - pad.r)) * (safeX - xMin);
    const p = nearest(clamp(valueX, xMin, safeX), "x");
    setHover({ x: p.x, y: p.y, px: sx(p.x), py: sy(p.y) });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <rect width={W} height={H} fill="white" />
        {Array.from({ length: xTicks + 1 }).map((_, i) => {
          const x = xMin + (i / xTicks) * (safeX - xMin);
          return (
            <g key={`x-${i}`}>
              <line x1={sx(x)} x2={sx(x)} y1={pad.t} y2={H - pad.b} stroke="#e2e8f0" />
              <text x={sx(x)} y={H - 28} textAnchor="middle" fontSize="11" fill="#64748b">{fmt(x, 1)}</text>
            </g>
          );
        })}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const y = yMin + (i / yTicks) * (safeY - yMin);
          return (
            <g key={`y-${i}`}>
              <line x1={pad.l} x2={W - pad.r} y1={sy(y)} y2={sy(y)} stroke="#e2e8f0" />
              <text x={pad.l - 10} y={sy(y) + 4} textAnchor="end" fontSize="11" fill="#64748b">{fmt(y, 1)}</text>
            </g>
          );
        })}
        {yMin < 0 && yMax > 0 && <line x1={pad.l} x2={W - pad.r} y1={sy(0)} y2={sy(0)} stroke="#334155" strokeWidth="1.5" />}
        {xMin < 0 && xMax > 0 && <line x1={sx(0)} x2={sx(0)} y1={pad.t} y2={H - pad.b} stroke="#334155" strokeWidth="1.5" />}

        <path d={path} fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {annotations.map((a) => (
          <g key={`${a.label}-${a.x}-${a.y}`}>
            <circle cx={sx(a.x)} cy={sy(a.y)} r="5" fill="white" stroke="#0f172a" strokeWidth="2.5" />
            <text x={sx(a.x) + 8} y={sy(a.y) - 8} fontSize="11" fontWeight="700" fill="#334155">{a.label}</text>
          </g>
        ))}

        {marker && (
          <g>
            <line x1={sx(marker.x)} x2={sx(marker.x)} y1={sy(marker.y)} y2={H - pad.b} stroke="#94a3b8" strokeDasharray="4 4" />
            <line x1={pad.l} x2={sx(marker.x)} y1={sy(marker.y)} y2={sy(marker.y)} stroke="#94a3b8" strokeDasharray="4 4" />
            <circle cx={sx(marker.x)} cy={sy(marker.y)} r="7" fill="white" stroke="#0f172a" strokeWidth="3" />
            {markerLabel && (
              <g>
                <rect x={clamp(sx(marker.x) + 10, 8, W - 148)} y={clamp(sy(marker.y) - 34, 8, H - 42)} width="138" height="26" rx="7" fill="#0f172a" />
                <text x={clamp(sx(marker.x) + 20, 18, W - 138)} y={clamp(sy(marker.y) - 17, 25, H - 25)} fontSize="11" fill="white">{markerLabel}</text>
              </g>
            )}
          </g>
        )}

        {hover && (
          <g pointerEvents="none">
            <line x1={hover.px} x2={hover.px} y1={pad.t} y2={H - pad.b} stroke="#64748b" strokeDasharray="3 4" />
            <circle cx={hover.px} cy={hover.py} r="5" fill="white" stroke="#0f172a" strokeWidth="2.5" />
            <rect x={clamp(hover.px + 10, 8, W - 190)} y={clamp(hover.py - 34, 8, H - 42)} width="180" height="26" rx="7" fill="#0f172a" />
            <text x={clamp(hover.px + 20, 18, W - 180)} y={clamp(hover.py - 17, 25, H - 25)} fontSize="11" fill="white">
              {hoverLabel ? hoverLabel(hover.x, hover.y) : `x=${fmt(hover.x)} · y=${fmt(hover.y)}`}
            </text>
          </g>
        )}

        <text x={W / 2} y={H - 7} textAnchor="middle" fontSize="12" fontWeight="600" fill="#334155">{xLabel}</text>
        <text x="15" y={H / 2} textAnchor="middle" transform={`rotate(-90 15 ${H / 2})`} fontSize="12" fontWeight="600" fill="#334155">{yLabel}</text>
      </svg>
    </div>
  );
}

function UnitsTool() {
  const [length, setLength] = useState(2.5);
  const [uncertainty, setUncertainty] = useState(0.03);
  const [value, setValue] = useState("0.004560");

  const sig = useMemo(() => {
    const s = value.trim().replace(/^[-+]/, "").replace(/^0+/, "");
    const decimal = s.includes(".");
    const cleaned = s.replace(".", "");
    const significant = cleaned.replace(/^0+/, "").length;
    return decimal ? significant : significant;
  }, [value]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Significant figures</div>
            <div className="mt-3 flex gap-2">
              <input value={value} onChange={(e) => setValue(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-slate-500" />
              <div className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">{sig} SF</div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Useful for the measurement and reporting conventions in Chapter 1.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Uncertainty</div>
            <Slider label="Measured length" value={length} min={0.1} max={10} step={0.1} unit="m" onChange={setLength} />
            <div className="mt-4">
              <Slider label="Absolute uncertainty" value={uncertainty} min={0.001} max={0.2} step={0.001} unit="m" onChange={setUncertainty} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Stat label="Relative" value={fmt(uncertainty / length, 4)} />
              <Stat label="Percentage" value={fmt((uncertainty / length) * 100, 2)} unit="%" />
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Dimensional analysis</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              ["Velocity", "[L T⁻¹]"],
              ["Acceleration", "[L T⁻²]"],
              ["Force", "[M L T⁻²]"],
            ].map(([a, b]) => <div key={a} className="rounded-xl bg-white/10 p-3"><div className="text-xs text-slate-300">{a}</div><div className="mt-1 font-mono text-sm">{b}</div></div>)}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold">SI reference</div>
        <div className="mt-4 space-y-2 text-sm">
          {[
            ["Length", "metre", "m"],
            ["Mass", "kilogram", "kg"],
            ["Time", "second", "s"],
            ["Current", "ampere", "A"],
            ["Temperature", "kelvin", "K"],
            ["Amount", "mole", "mol"],
            ["Luminous intensity", "candela", "cd"],
          ].map(([a,b,c]) => <div key={a} className="flex justify-between border-b border-slate-100 pb-2"><span>{a}</span><span className="font-mono text-slate-500">{b} ({c})</span></div>)}
        </div>
      </div>
    </div>
  );
}

function KinematicsTool() {
  const [u, setU] = useState(5);
  const [a, setA] = useState(2);
  const [tMax, setTMax] = useState(10);
  const [time, setTime] = useState(5.5);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState<"x" | "v" | "a">("x");

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + Math.max(0.03, tMax / 180);
        if (next >= tMax) {
          setPlaying(false);
          return tMax;
        }
        return next;
      });
    }, 30);
    return () => window.clearInterval(id);
  }, [playing, tMax]);

  const points = Array.from({ length: 181 }, (_, i) => {
    const t = (i / 180) * tMax;
    return { t, x: u * t + 0.5 * a * t * t, v: u + a * t, a };
  });

  const selectedX = u * time + 0.5 * a * time * time;
  const selectedV = u + a * time;
  const selectedA = a;

  const allX = points.map((p) => p.x);
  const allV = points.map((p) => p.v);
  const allA = points.map((p) => p.a);
  const selected =
    view === "x"
      ? { points: points.map((p) => ({ x: p.t, y: p.x })), y: selectedX, label: "Position x (m)", yMin: Math.min(0, ...allX), yMax: Math.max(10, ...allX) }
      : view === "v"
        ? { points: points.map((p) => ({ x: p.t, y: p.v })), y: selectedV, label: "Velocity v (m/s)", yMin: Math.min(0, ...allV), yMax: Math.max(10, ...allV) }
        : { points: points.map((p) => ({ x: p.t, y: p.a })), y: selectedA, label: "Acceleration a (m/s²)", yMin: Math.min(-10, ...allA), yMax: Math.max(10, ...allA) };

  const reset = () => {
    setTime(0);
    setPlaying(false);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-slate-500">Controls</div>
            <div className="space-y-5">
              <Slider label="Initial velocity u" value={u} min={-20} max={20} step={0.5} unit="m/s" onChange={setU} />
              <Slider label="Acceleration a" value={a} min={-10} max={10} step={0.5} unit="m/s²" onChange={setA} />
              <Slider label="Time range" value={tMax} min={4} max={20} step={1} unit="s" onChange={(n) => { setTMax(n); setTime((t) => Math.min(t, n)); }} />
              <Slider label="Inspect time" value={time} min={0} max={tMax} step={Math.max(0.01, tMax / 200)} unit="s" onChange={setTime} />
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
              >
                {playing ? "Pause" : "Play motion"}
              </button>
              <button onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
            <div className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">At t = {fmt(time, 2)} s</div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/10 p-3"><div className="text-[10px] text-slate-400">x</div><div className="mt-1 font-mono text-sm">{fmt(selectedX)} m</div></div>
              <div className="rounded-xl bg-white/10 p-3"><div className="text-[10px] text-slate-400">v</div><div className="mt-1 font-mono text-sm">{fmt(selectedV)} m/s</div></div>
              <div className="rounded-xl bg-white/10 p-3"><div className="text-[10px] text-slate-400">a</div><div className="mt-1 font-mono text-sm">{fmt(selectedA)} m/s²</div></div>
              <div className="rounded-xl bg-white/10 p-3"><div className="text-[10px] text-slate-400">Δx from start</div><div className="mt-1 font-mono text-sm">{fmt(selectedX)} m</div></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["x", "v", "a"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${view === key ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"}`}
              >
                {key === "x" ? "Position–time" : key === "v" ? "Velocity–time" : "Acceleration–time"}
              </button>
            ))}
          </div>

          <Graph
            points={selected.points}
            xMin={0}
            xMax={tMax}
            yMin={selected.yMin}
            yMax={selected.yMax}
            xLabel="Time t (s)"
            yLabel={selected.label}
            marker={{ x: time, y: selected.y }}
            markerLabel={`t=${fmt(time, 1)} s`}
            hoverLabel={(x, y) => `t = ${fmt(x, 2)} s · ${fmt(y)} `}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-slate-500">Motion snapshot</div>
            <div className="relative h-20 overflow-hidden rounded-xl bg-slate-50">
              <div className="absolute bottom-5 left-5 right-5 h-px bg-slate-300" />
              <div
                className="absolute bottom-[18px] h-5 w-5 -translate-x-1/2 rounded-full border-2 border-slate-950 bg-white transition-[left] duration-75"
                style={{ left: `${5 + (clamp(time / tMax, 0, 1) * 90)}%` }}
              />
              <div className="absolute bottom-1 left-5 text-[10px] text-slate-400">t = 0</div>
              <div className="absolute bottom-1 right-5 text-[10px] text-slate-400">t = {fmt(tMax, 1)} s</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Initial velocity" value={fmt(u)} unit="m/s" />
        <Stat label="Acceleration" value={fmt(a)} unit="m/s²" />
        <Stat label="Position at t" value={fmt(selectedX)} unit="m" />
        <Stat label="Velocity at t" value={fmt(selectedV)} unit="m/s" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold">What to notice</div>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3">
          <div><span className="font-semibold text-slate-950">x–t:</span> its slope at a point gives instantaneous velocity.</div>
          <div><span className="font-semibold text-slate-950">v–t:</span> its slope gives acceleration and its area gives displacement.</div>
          <div><span className="font-semibold text-slate-950">a–t:</span> its area gives change in velocity.</div>
        </div>
      </div>
    </div>
  );
}

function VectorTool() {
  const [aMag, setAMag] = useState(8);
  const [aAng, setAAng] = useState(30);
  const [bMag, setBMag] = useState(6);
  const [bAng, setBAng] = useState(130);
  const ar = aAng * Math.PI / 180, br = bAng * Math.PI / 180;
  const ax = aMag*Math.cos(ar), ay = aMag*Math.sin(ar);
  const bx = bMag*Math.cos(br), by = bMag*Math.sin(br);
  const rx = ax+bx, ry = ay+by;
  const r = Math.hypot(rx,ry), theta = Math.atan2(ry,rx)*180/Math.PI;
  const scale = 11;
  const W=560,H=380,cx=280,cy=190,px=(x:number)=>cx+x*(220/scale),py=(y:number)=>cy-y*(150/scale);

  const Arrow = ({x,y,label}:{x:number,y:number,label:string}) => (
    <g>
      <line x1={cx} y1={cy} x2={px(x)} y2={py(y)} stroke="#0f172a" strokeWidth="4" />
      <circle cx={px(x)} cy={py(y)} r="5" fill="white" stroke="#0f172a" strokeWidth="3" />
      <text x={px(x)+8} y={py(y)-8} fontSize="13" fontWeight="700" fill="#0f172a">{label}</text>
    </g>
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <div className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Vector A</div>
        <Slider label="Magnitude" value={aMag} min={0} max={10} step={0.5} unit="" onChange={setAMag} />
        <Slider label="Direction" value={aAng} min={0} max={360} step={1} unit="°" onChange={setAAng} />
        <div className="pt-2 text-xs font-bold uppercase tracking-[.14em] text-slate-500">Vector B</div>
        <Slider label="Magnitude" value={bMag} min={0} max={10} step={0.5} unit="" onChange={setBMag} />
        <Slider label="Direction" value={bAng} min={0} max={360} step={1} unit="°" onChange={setBAng} />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <line x1="40" x2="520" y1={cy} y2={cy} stroke="#cbd5e1" />
          <line x1={cx} x2={cx} y1="25" y2="355" stroke="#cbd5e1" />
          <Arrow x={ax} y={ay} label="A" />
          <Arrow x={bx} y={by} label="B" />
          <Arrow x={rx} y={ry} label="A + B" />
          <circle cx={cx} cy={cy} r="4" fill="#0f172a" />
          <text x="500" y={cy-8} fontSize="11" fill="#64748b">x</text>
          <text x={cx+8} y="35" fontSize="11" fill="#64748b">y</text>
        </svg>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Ax" value={fmt(ax)} />
          <Stat label="Ay" value={fmt(ay)} />
          <Stat label="Resultant" value={fmt(r)} />
          <Stat label="Direction" value={fmt(theta)} unit="°" />
        </div>
      </div>
    </div>
  );
}

function ProjectileTool() {
  const [u, setU] = useState(20);
  const [angle, setAngle] = useState(45);
  const [g, setG] = useState(9.8);
  const [height0, setHeight0] = useState(0);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  const rad = angle * Math.PI / 180;
  const vy0 = u * Math.sin(rad);
  const vx0 = u * Math.cos(rad);
  const discriminant = vy0 * vy0 + 2 * g * height0;
  const T = (vy0 + Math.sqrt(Math.max(0, discriminant))) / g;
  const R = vx0 * T;
  const H = height0 + (vy0 * vy0) / (2 * g);
  const tPeak = vy0 / g;
  const xPeak = vx0 * tPeak;
  const tInspect = clamp(time, 0, T);
  const xInspect = vx0 * tInspect;
  const yInspect = Math.max(0, height0 + vy0 * tInspect - 0.5 * g * tInspect * tInspect);
  const vyInspect = vy0 - g * tInspect;
  const speedInspect = Math.hypot(vx0, vyInspect);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + Math.max(0.02, T / 180);
        if (next >= T) {
          setPlaying(false);
          return T;
        }
        return next;
      });
    }, 30);
    return () => window.clearInterval(id);
  }, [playing, T]);

  const points = Array.from({ length: 181 }, (_, i) => {
    const t = (i / 180) * T;
    return { x: vx0 * t, y: Math.max(0, height0 + vy0 * t - 0.5 * g * t * t) };
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-slate-500">Launch controls</div>
            <div className="space-y-5">
              <Slider label="Initial speed u" value={u} min={1} max={50} step={1} unit="m/s" onChange={(n) => { setU(n); setTime(0); }} />
              <Slider label="Launch angle θ" value={angle} min={5} max={85} step={1} unit="°" onChange={(n) => { setAngle(n); setTime(0); }} />
              <Slider label="Initial height" value={height0} min={0} max={20} step={1} unit="m" onChange={(n) => { setHeight0(n); setTime(0); }} />
              <Slider label="Gravity g" value={g} min={1} max={12} step={0.1} unit="m/s²" onChange={(n) => { setG(n); setTime(0); }} />
              <Slider label="Inspect time" value={tInspect} min={0} max={Math.max(T, 0.01)} step={Math.max(0.01, T / 200)} unit="s" onChange={setTime} />
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setPlaying((p) => !p)} className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
                {playing ? "Pause" : "Animate throw"}
              </button>
              <button onClick={() => { setPlaying(false); setTime(0); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
            <div className="font-semibold text-slate-950">Model assumptions</div>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Air resistance is ignored.</li>
              <li>Horizontal acceleration is zero.</li>
              <li>Vertical acceleration is −g.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <Graph
            points={points}
            xMin={0}
            xMax={Math.max(R, 1)}
            yMin={0}
            yMax={Math.max(H * 1.15, 1)}
            xLabel="Horizontal distance x (m)"
            yLabel="Height y (m)"
            marker={{ x: xInspect, y: yInspect }}
            markerLabel={`t=${fmt(tInspect, 1)} s`}
            hoverLabel={(x, y) => `x=${fmt(x, 1)} m · y=${fmt(y, 1)} m`}
            annotations={[
              { x: xPeak, y: H, label: "Hmax" },
              { x: R, y: 0, label: "Range" },
            ]}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-slate-500">Projectile snapshot</div>
            <div className="relative h-24 overflow-hidden rounded-xl bg-slate-50">
              <div className="absolute bottom-5 left-4 right-4 h-px bg-slate-300" />
              <div
                className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-950 bg-white transition-[left,top] duration-75"
                style={{
                  left: `${5 + clamp((xInspect / Math.max(R, 0.001)) * 90, 0, 90)}%`,
                  bottom: `${18 + clamp((yInspect / Math.max(H, 0.001)) * 55, 0, 55)}px`,
                }}
              />
              <div className="absolute bottom-1 left-4 text-[10px] text-slate-400">launch</div>
              <div className="absolute bottom-1 right-4 text-[10px] text-slate-400">landing</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Range" value={fmt(R)} unit="m" />
        <Stat label="Maximum height" value={fmt(H)} unit="m" />
        <Stat label="Time of flight" value={fmt(T)} unit="s" />
        <Stat label="Peak time" value={fmt(tPeak)} unit="s" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Horizontal velocity" value={fmt(vx0)} unit="m/s" />
        <Stat label="Vertical velocity now" value={fmt(vyInspect)} unit="m/s" />
        <Stat label="Speed now" value={fmt(speedInspect)} unit="m/s" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold">Key observations</div>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3">
          <div><span className="font-semibold text-slate-950">Horizontal:</span> velocity stays constant when air resistance is ignored.</div>
          <div><span className="font-semibold text-slate-950">Vertical:</span> velocity decreases by g each second until the highest point.</div>
          <div><span className="font-semibold text-slate-950">Trajectory:</span> the path is parabolic because x is linear in time while y is quadratic.</div>
        </div>
      </div>
    </div>
  );
}

function ForceTool() {
  const [m, setM] = useState(5);
  const [F, setF] = useState(20);
  const [mu, setMu] = useState(0.2);
  const [g, setG] = useState(9.8);
  const N=m*g, friction=mu*N, net=Math.max(0,F-friction), a=net/m;
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <Slider label="Mass" value={m} min={1} max={20} step={0.5} unit="kg" onChange={setM} />
        <Slider label="Applied force" value={F} min={0} max={100} step={1} unit="N" onChange={setF} />
        <Slider label="Coefficient of friction" value={mu} min={0} max={1} step={0.01} onChange={setMu} />
        <Slider label="Gravity" value={g} min={8} max={10} step={0.1} unit="m/s²" onChange={setG} />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="relative mx-auto mt-8 h-48 max-w-xl">
          <div className="absolute bottom-7 left-[35%] h-20 w-32 rounded-xl border-2 border-slate-800 bg-slate-50 text-center pt-7 text-sm font-bold">{fmt(m)} kg</div>
          <div className="absolute bottom-2 left-[18%] right-[18%] border-b-4 border-slate-800" />
          <div className="absolute bottom-[67px] left-[55%] h-0 w-[30%] border-t-4 border-slate-900" />
          <div className="absolute bottom-[73px] left-[76%] text-xs font-semibold">F = {fmt(F)} N →</div>
          <div className="absolute bottom-[75px] left-[20%] h-0 w-[14%] border-t-4 border-slate-500" />
          <div className="absolute bottom-[81px] left-[4%] text-xs font-semibold text-slate-500">← f = {fmt(friction)} N</div>
          <div className="absolute bottom-[87px] left-[42%] h-[70px] border-l-4 border-slate-700" />
          <div className="absolute left-[43%] top-0 text-xs font-semibold">N = {fmt(N)} N ↑</div>
          <div className="absolute left-[43%] bottom-[0] text-xs font-semibold">W = {fmt(N)} N ↓</div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Normal" value={fmt(N)} unit="N" />
          <Stat label="Friction" value={fmt(friction)} unit="N" />
          <Stat label="Acceleration" value={fmt(a)} unit="m/s²" />
        </div>
      </div>
    </div>
  );
}

function EnergyTool() {
  const [F, setF] = useState(10);
  const [d, setD] = useState(8);
  const [angle, setAngle] = useState(0);
  const [mass, setMass] = useState(2);
  const work=F*d*Math.cos(angle*Math.PI/180);
  const v=Math.sqrt(Math.max(0,2*work/mass));
  const points=Array.from({length:81},(_,i)=>{const x=i*d/80;return{x,y:F*x*Math.cos(angle*Math.PI/180)}});
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
          <Slider label="Force" value={F} min={0} max={50} step={1} unit="N" onChange={setF} />
          <Slider label="Displacement" value={d} min={0.5} max={20} step={0.5} unit="m" onChange={setD} />
          <Slider label="Angle" value={angle} min={0} max={180} step={1} unit="°" onChange={setAngle} />
          <Slider label="Mass" value={mass} min={0.5} max={10} step={0.5} unit="kg" onChange={setMass} />
        </div>
        <Graph points={points} xMin={0} xMax={d} yMin={0} yMax={Math.max(10,work*1.1)} xLabel="Displacement x (m)" yLabel="Work W (J)" marker={{x:d,y:Math.max(0,work)}} markerLabel={`W=${fmt(work)} J`} />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Work" value={fmt(work)} unit="J" />
        <Stat label="Kinetic energy gained" value={fmt(Math.max(0,work))} unit="J" />
        <Stat label="Final speed from rest" value={fmt(v)} unit="m/s" />
      </div>
    </div>
  );
}

function RotationTool() {
  const [mass,setMass]=useState(2),[radius,setRadius]=useState(1),[torque,setTorque]=useState(4);
  const I=0.5*mass*radius*radius, alpha=torque/I;
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <Slider label="Mass" value={mass} min={0.5} max={10} step={0.5} unit="kg" onChange={setMass} />
        <Slider label="Radius" value={radius} min={0.2} max={3} step={0.1} unit="m" onChange={setRadius} />
        <Slider label="Torque" value={torque} min={0} max={20} step={0.5} unit="N·m" onChange={setTorque} />
        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          Disc model: I = ½MR²<br />τ = Iα<br />L = Iω
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex min-h-[250px] items-center justify-center">
          <div className="relative h-48 w-48 rounded-full border-8 border-slate-800 bg-slate-100">
            <div className="absolute left-1/2 top-1/2 h-1 w-[45%] origin-left -translate-y-1/2 rotate-12 bg-slate-900" />
            <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Moment of inertia" value={fmt(I)} unit="kg·m²" />
          <Stat label="Angular acceleration" value={fmt(alpha)} unit="rad/s²" />
          <Stat label="Torque" value={fmt(torque)} unit="N·m" />
        </div>
      </div>
    </div>
  );
}

function GravityTool() {
  const [M,setM]=useState(5.97),[r,setR]=useState(6.4),[h,setH]=useState(400);
  const G=6.674e-11;
  const earthMass=M*1e24, R=r*1e6, radius=R+h*1000;
  const g=G*earthMass/(radius*radius);
  const vorb=Math.sqrt(G*earthMass/radius);
  const vesc=Math.sqrt(2*G*earthMass/radius);
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <Slider label="Planet mass" value={M} min={0.5} max={10} step={0.1} unit="×10²⁴ kg" onChange={setM} />
        <Slider label="Planet radius" value={r} min={2} max={12} step={0.1} unit="×10⁶ m" onChange={setR} />
        <Slider label="Altitude" value={h} min={0} max={5000} step={50} unit="km" onChange={setH} />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mx-auto flex h-56 max-w-lg items-center justify-center">
          <div className="relative h-40 w-40 rounded-full border-4 border-slate-800 bg-slate-100">
            <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-slate-700" />
            <div className="absolute left-1/2 top-[-45px] h-4 w-4 -translate-x-1/2 rounded-full bg-slate-950" />
            <div className="absolute left-1/2 top-[-55px] -translate-x-1/2 whitespace-nowrap text-xs font-semibold">satellite</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="g at altitude" value={fmt(g,3)} unit="m/s²" />
          <Stat label="Orbital speed" value={fmt(vorb/1000,2)} unit="km/s" />
          <Stat label="Escape speed" value={fmt(vesc/1000,2)} unit="km/s" />
        </div>
      </div>
    </div>
  );
}

function ThermoTool() {
  const [V,setV]=useState(2),[P,setP]=useState(100),[gamma,setGamma]=useState(1.4);
  const points=Array.from({length:81},(_,i)=>{const v=V*0.35+(i/80)*V*1.65; return{x:v,y:P*(V/v)**gamma}});
  const work=points.reduce((sum,p,i)=>i?sum+(p.y+points[i-1].y)/2*(p.x-points[i-1].x):0,0);
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
          <Slider label="Reference volume" value={V} min={1} max={10} step={0.5} unit="m³" onChange={setV} />
          <Slider label="Reference pressure" value={P} min={20} max={300} step={5} unit="kPa" onChange={setP} />
          <Slider label="γ" value={gamma} min={1.1} max={1.67} step={0.01} onChange={setGamma} />
          <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            Illustrative adiabatic curve: PVᵞ = constant.<br />
            Area under the P–V curve represents work.
          </div>
        </div>
        <Graph points={points.map(p=>({x:p.x,y:p.y/10}))} xMin={V*.35} xMax={V*2} yMin={0} yMax={Math.max(P/10*1.1,10)} xLabel="Volume V (m³)" yLabel="Pressure P (×10 kPa)" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="γ" value={fmt(gamma,2)} />
        <Stat label="Approx. work over curve" value={fmt(work)} unit="kPa·m³" />
      </div>
    </div>
  );
}

function ShmTool() {
  const [A,setA]=useState(2),[T,setT]=useState(4);
  const omega=2*Math.PI/T;
  const points=Array.from({length:161},(_,i)=>{const t=i*T/2*(i/160); return{x:t,y:A*Math.cos(omega*t)}});
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
          <Slider label="Amplitude" value={A} min={0.5} max={5} step={0.1} unit="m" onChange={setA} />
          <Slider label="Time period" value={T} min={1} max={10} step={0.5} unit="s" onChange={setT} />
          <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            x = A cos(ωt)<br />
            ω = 2π/T<br />
            v = −Aω sin(ωt)
          </div>
        </div>
        <Graph points={points} xMin={0} xMax={T*2} yMin={-A*1.15} yMax={A*1.15} xLabel="Time t (s)" yLabel="Displacement x (m)" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Amplitude" value={fmt(A)} unit="m" />
        <Stat label="Frequency" value={fmt(1/T,3)} unit="Hz" />
        <Stat label="Angular frequency" value={fmt(omega,3)} unit="rad/s" />
      </div>
    </div>
  );
}

function ElectricTool() {
  const [q,setQ]=useState(2),[distance,setDistance]=useState(2);
  const k=8.988e9;
  const E=k*(q*1e-6)/(distance*distance);
  const W=560,H=360,cx=280,cy=180;
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <Slider label="Charge" value={q} min={-10} max={10} step={0.5} unit="μC" onChange={setQ} />
        <Slider label="Test-point distance" value={distance} min={0.5} max={8} step={0.1} unit="m" onChange={setDistance} />
        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          E = kq/r² for a point charge.<br />
          Field direction depends on the sign of q.
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          <circle cx={cx} cy={cy} r="22" fill={q>=0?"#0f172a":"#f8fafc"} stroke="#0f172a" strokeWidth="3"/>
          <text x={cx} y={cy+6} textAnchor="middle" fontSize="16" fontWeight="700" fill={q>=0?"white":"#0f172a"}>{q>=0?"+":"−"}</text>
          {Array.from({length:12}).map((_,i)=>{
            const a=i*Math.PI/6, x2=cx+210*Math.cos(a), y2=cy+140*Math.sin(a);
            return <line key={i} x1={cx+30*Math.cos(a)} y1={cy+30*Math.sin(a)} x2={x2} y2={y2} stroke="#475569" strokeWidth="2" markerEnd="url(#arrow)"/>;
          })}
          <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#475569"/></marker></defs>
        </svg>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Electric field" value={fmt(Math.abs(E)/1e3,2)} unit="kN/C" />
          <Stat label="Distance" value={fmt(distance)} unit="m" />
        </div>
      </div>
    </div>
  );
}

function CapacitorTool() {
  const [A,setA]=useState(0.02),[d,setD]=useState(0.002),[er,setEr]=useState(1),[V,setV]=useState(12);
  const eps=8.854e-12,C=eps*er*A/d,Q=C*V,U=.5*C*V*V;
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <Slider label="Plate area" value={A} min={0.005} max={0.1} step={0.005} unit="m²" onChange={setA} />
        <Slider label="Plate separation" value={d} min={0.0005} max={0.01} step={0.0005} unit="m" onChange={setD} />
        <Slider label="Relative permittivity" value={er} min={1} max={10} step={0.5} unit="" onChange={setEr} />
        <Slider label="Potential difference" value={V} min={1} max={50} step={1} unit="V" onChange={setV} />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mx-auto my-8 max-w-lg space-y-3">
          <div className="h-5 rounded border-2 border-slate-800 bg-slate-100" />
          <div className="flex items-center justify-center text-xs text-slate-500">d = {fmt(d*1000,1)} mm</div>
          <div className="h-5 rounded border-2 border-slate-800 bg-slate-100" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Capacitance" value={fmt(C*1e9,2)} unit="nF" />
          <Stat label="Charge" value={fmt(Q*1e9,2)} unit="nC" />
          <Stat label="Energy" value={fmt(U*1e6,3)} unit="μJ" />
        </div>
      </div>
    </div>
  );
}

function CircuitTool() {
  const [r1,setR1]=useState(4),[r2,setR2]=useState(6),[V,setV]=useState(12);
  const R=r1+r2,I=V/R,P=V*I;
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <Slider label="R₁" value={r1} min={1} max={20} step={1} unit="Ω" onChange={setR1} />
        <Slider label="R₂" value={r2} min={1} max={20} step={1} unit="Ω" onChange={setR2} />
        <Slider label="Battery" value={V} min={1} max={24} step={1} unit="V" onChange={setV} />
        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          Series mode: R = R₁ + R₂<br />Ohm's law: V = IR<br />Power: P = VI
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mx-auto flex max-w-xl items-center justify-center gap-3 py-12">
          <div className="rounded-lg border-2 border-slate-800 px-3 py-5 text-xs font-bold">+ | | −</div>
          <div className="h-px w-12 bg-slate-800" />
          <div className="rounded-lg border-2 border-slate-800 px-5 py-4 text-sm">R₁ = {r1} Ω</div>
          <div className="h-px w-12 bg-slate-800" />
          <div className="rounded-lg border-2 border-slate-800 px-5 py-4 text-sm">R₂ = {r2} Ω</div>
          <div className="h-px w-12 bg-slate-800" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Equivalent R" value={fmt(R)} unit="Ω" />
          <Stat label="Current" value={fmt(I,3)} unit="A" />
          <Stat label="Power" value={fmt(P,2)} unit="W" />
        </div>
      </div>
    </div>
  );
}

function RayTool() {
  const [f,setF]=useState(15),[u,setU]=useState(-30);
  const v=1/(1/f+1/u);
  const m=v/u;
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <Slider label="Focal length" value={f} min={5} max={40} step={1} unit="cm" onChange={setF} />
        <Slider label="Object distance" value={Math.abs(u)} min={8} max={80} step={1} unit="cm" onChange={(n)=>setU(-n)} />
        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          Thin-lens convention used here:<br />
          1/f = 1/v − 1/u
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="relative my-10 h-36 border-b-2 border-slate-700">
          <div className="absolute bottom-0 left-1/2 h-28 w-4 -translate-x-1/2 rounded-full border-2 border-slate-700 bg-slate-100" />
          <div className="absolute bottom-0 left-[18%] h-20 border-l-2 border-slate-800" />
          <div className="absolute bottom-20 left-[18%] text-xs font-semibold">object</div>
          <div className="absolute bottom-0 left-[82%] h-20 border-l-2 border-dashed border-slate-500" />
          <div className="absolute bottom-20 left-[76%] text-xs font-semibold text-slate-500">image</div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Image distance" value={fmt(v)} unit="cm" />
          <Stat label="Magnification" value={fmt(m,3)} />
          <Stat label="Image type" value={v>0?"Real":"Virtual"} />
        </div>
      </div>
    </div>
  );
}

function PhotoelectricTool() {
  const [freq,setFreq]=useState(8),[work,setWork]=useState(2);
  const h=4.136e-15, photon=h*freq*1e14, kinetic=Math.max(0,photon-work), stopping=kinetic;
  const points=Array.from({length:81},(_,i)=>{const f=i*0.2;return{x:f,y:Math.max(0,h*f*1e14-work)}});
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
          <Slider label="Frequency" value={freq} min={1} max={15} step={0.1} unit="×10¹⁴ Hz" onChange={setFreq} />
          <Slider label="Work function" value={work} min={0.5} max={5} step={0.1} unit="eV" onChange={setWork} />
          <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            hf = φ + Kmax<br />
            eV₀ = Kmax<br />
            Below threshold frequency, no photoemission occurs.
          </div>
        </div>
        <Graph points={points} xMin={0} xMax={16} yMin={0} yMax={Math.max(5,...points.map(p=>p.y))} xLabel="Frequency (×10¹⁴ Hz)" yLabel="Kmax (eV)" marker={{x:freq,y:kinetic}} markerLabel={`Kmax=${fmt(kinetic)} eV`} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Photon energy" value={fmt(photon,2)} unit="eV" />
        <Stat label="Kmax" value={fmt(kinetic,2)} unit="eV" />
        <Stat label="Stopping potential" value={fmt(stopping,2)} unit="V" />
      </div>
    </div>
  );
}

function BohrTool() {
  const [n,setN]=useState(3);
  const energy=-13.6/(n*n);
  const radius=0.529*n*n;
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <Slider label="Orbit n" value={n} min={1} max={7} step={1} onChange={setN} />
        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          Hydrogen model:<br />
          Eₙ = −13.6/n² eV<br />
          rₙ = n²a₀
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex min-h-[250px] items-center justify-center">
          <div className="relative h-56 w-56 rounded-full border border-slate-200">
            {Array.from({length:n}).map((_,i)=>{
              const size=45+i*35;
              return <div key={i} className="absolute left-1/2 top-1/2 rounded-full border border-slate-300" style={{width:size,height:size,transform:"translate(-50%,-50%)"}} />;
            })}
            <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900 text-center text-[9px] leading-8 text-white">p⁺</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Energy" value={fmt(energy,3)} unit="eV" />
          <Stat label="Radius" value={fmt(radius,3)} unit="Å" />
        </div>
      </div>
    </div>
  );
}

function SemiconductorTool() {
  const [bias,setBias]=useState(0.55);
  const current=bias>0.65 ? Math.exp((bias-0.65)*10)-1 : bias>0 ? bias*0.02 : -0.002*Math.abs(bias);
  const points=Array.from({length:101},(_,i)=>{const v=-2+i*0.03; const I=v>0.65?Math.exp((v-.65)*5)-1:v>0?v*.05:-.002*Math.abs(v); return{x:v,y:Math.max(-.01,Math.min(2,I))}});
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
          <Slider label="Bias voltage" value={bias} min={-2} max={1.2} step={0.01} unit="V" onChange={setBias} />
          <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            Illustrative p–n junction characteristic. Forward bias produces a rapidly increasing current after the knee region.
          </div>
        </div>
        <Graph points={points} xMin={-2} xMax={1.1} yMin={-.01} yMax={2} xLabel="Voltage V (V)" yLabel="Current I (a.u.)" marker={{x:bias,y:Math.max(-.01,Math.min(2,current))}} markerLabel={`V=${fmt(bias,2)} V`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Bias" value={fmt(bias,2)} unit="V" />
        <Stat label="Illustrative current" value={fmt(current,3)} unit="a.u." />
      </div>
    </div>
  );
}

function EMIACCTool() {
  const [freq,setFreq]=useState(50),[peak,setPeak]=useState(230);
  const t=Array.from({length:161},(_,i)=>i/(160*freq));
  const points=t.map(x=>({x:x*1000,y:peak*Math.sin(2*Math.PI*freq*x)}));
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
          <Slider label="Frequency" value={freq} min={10} max={100} step={1} unit="Hz" onChange={setFreq} />
          <Slider label="Peak voltage" value={peak} min={10} max={400} step={5} unit="V" onChange={setPeak} />
          <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            V(t) = V₀ sin(ωt)<br />
            Vᵣₘₛ = V₀/√2
          </div>
        </div>
        <Graph points={points} xMin={0} xMax={1000/freq} yMin={-peak*1.1} yMax={peak*1.1} xLabel="Time (ms)" yLabel="Voltage (V)" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Peak" value={fmt(peak)} unit="V" />
        <Stat label="RMS" value={fmt(peak/Math.sqrt(2),2)} unit="V" />
        <Stat label="Period" value={fmt(1000/freq,2)} unit="ms" />
      </div>
    </div>
  );
}

function WaveOpticsTool() {
  const [lambda,setLambda]=useState(600),[slit,setSlit]=useState(0.5),[D,setD]=useState(2);
  const beta=lambda*1e-9*D/(slit*1e-3);
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <Slider label="Wavelength" value={lambda} min={400} max={700} step={10} unit="nm" onChange={setLambda} />
        <Slider label="Slit separation" value={slit} min={0.1} max={2} step={0.05} unit="mm" onChange={setSlit} />
        <Slider label="Screen distance" value={D} min={0.5} max={5} step={0.1} unit="m" onChange={setD} />
        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          Fringe width β = λD/d
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
          <div className="flex gap-5">
            <div className="h-28 w-2 bg-slate-900" />
            <div className="h-28 w-2 bg-slate-900" />
          </div>
          <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
            {Array.from({length:31}).map((_,i)=><div key={i} className="h-full" style={{width: i===15?"18px":"5px",marginLeft:"5px",opacity:i===15?1:0.35}} />)}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Fringe width" value={fmt(beta*1000,3)} unit="mm" />
          <Stat label="Wavelength" value={fmt(lambda)} unit="nm" />
          <Stat label="Screen distance" value={fmt(D)} unit="m" />
        </div>
      </div>
    </div>
  );
}

function MagneticTool() {
  const [I,setI]=useState(5),[r,setR]=useState(0.1);
  const mu=4*Math.PI*1e-7;
  const B=mu*I/(2*Math.PI*r);
  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
        <Slider label="Current" value={I} min={0.5} max={20} step={0.5} unit="A" onChange={setI} />
        <Slider label="Distance" value={r} min={0.02} max={0.5} step={0.01} unit="m" onChange={setR} />
        <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          For a long straight wire:<br />
          B = μ₀I/(2πr)
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mx-auto flex h-56 max-w-lg items-center justify-center">
          <div className="relative h-40 w-40 rounded-full border-4 border-dashed border-slate-400">
            <div className="absolute left-1/2 top-1/2 h-32 w-4 -translate-x-1/2 -translate-y-1/2 rounded bg-slate-900" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">I</div>
          </div>
        </div>
        <Stat label="Magnetic field" value={fmt(B*1e6,2)} unit="μT" />
      </div>
    </div>
  );
}

function ToolView({ id }: { id: string }) {
  switch (id) {
    case "units": return <UnitsTool />;
    case "kinematics": return <KinematicsTool />;
    case "vectors": return <VectorTool />;
    case "projectile": return <ProjectileTool />;
    case "forces": return <ForceTool />;
    case "energy": return <EnergyTool />;
    case "rotation": return <RotationTool />;
    case "gravity": return <GravityTool />;
    case "thermo": return <ThermoTool />;
    case "shm": return <ShmTool />;
    case "electric": return <ElectricTool />;
    case "capacitor": return <CapacitorTool />;
    case "circuit": return <CircuitTool />;
    case "magnetism": return <MagneticTool />;
    case "emi": return <EMIACCTool />;
    case "ray": return <RayTool />;
    case "waveoptics": return <WaveOpticsTool />;
    case "photoelectric": return <PhotoelectricTool />;
    case "bohr": return <BohrTool />;
    case "semiconductor": return <SemiconductorTool />;
    default: return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Select a Physics tool.</div>;
  }
}

function FormulaHub() {
  const groups = [
    ["Kinematics", ["v = u + at", "s = ut + ½at²", "v² = u² + 2as"]],
    ["Dynamics", ["F = ma", "p = mv", "J = Δp"]],
    ["Energy", ["W = Fs cosθ", "K = ½mv²", "P = W/t"]],
    ["Rotation", ["τ = Iα", "L = Iω", "Kᵣ = ½Iω²"]],
    ["Gravitation", ["F = GMm/r²", "vₒ = √(GM/r)", "vₑ = √(2GM/r)"]],
    ["Electrostatics", ["F = kq₁q₂/r²", "E = kq/r²", "C = Q/V"]],
    ["Current", ["V = IR", "P = VI", "R = ρL/A"]],
    ["Optics", ["1/f = 1/v − 1/u", "m = v/u", "β = λD/d"]],
  ];
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{groups.map(([title, formulas]) => <div key={title as string} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-sm font-semibold">{title}</div><div className="mt-3 space-y-2">{(formulas as string[]).map(f=><div key={f} className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm">{f}</div>)}</div></div>)}</div>;
}

function PracticalHub() {
  const [filter,setFilter]=useState<"All"|"XI"|"XII">("All");
  const list=PRACTICALS.filter(p=>filter==="All"||p[0]===filter);
  return <div className="space-y-5">
    <div className="flex gap-2">{(["All","XI","XII"] as const).map(x=><SectionButton key={x} active={filter===x} onClick={()=>setFilter(x)}>{x==="All"?"All Practicals":`Class ${x}`}</SectionButton>)}</div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{list.map(([c,t,d])=><div key={`${c}-${t}`} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-500">Class {c}</div><div className="mt-2 text-sm font-semibold">{t}</div><p className="mt-2 text-xs leading-5 text-slate-500">{d}</p><button className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Open practical</button></div>)}</div>
  </div>;
}

export default function PhysicsToolsPage() {
  const [section,setSection]=useState<ClassKey>("XI");
  const [selected,setSelected]=useState("kinematics");

  const tools=section==="XI"?XI_TOOLS:section==="XII"?XII_TOOLS:[];
  const current=tools.find(t=>t.id===selected) ?? tools[0];

  const chooseSection=(s:ClassKey)=>{
    setSection(s);
    if(s==="XI") setSelected(XI_TOOLS[1].id);
    if(s==="XII") setSelected(XII_TOOLS[0].id);
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">VGB Tools · Physics · Code 042</div>
          <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Physics Tools</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Interactive CBSE Physics workspace for Classes XI–XII. Explore equations, graphs, vectors, simulations and practical measurements rather than merely staring at another formula sheet.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SectionButton active={section==="XI"} onClick={()=>chooseSection("XI")}>Class XI</SectionButton>
              <SectionButton active={section==="XII"} onClick={()=>chooseSection("XII")}>Class XII</SectionButton>
              <SectionButton active={section==="Lab"} onClick={()=>chooseSection("Lab")}>Practical Lab</SectionButton>
            </div>
          </div>
        </header>

        {section==="Lab" ? (
          <>
            <section className="mb-6 rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white">
              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">CBSE Practical Hub</div>
              <h2 className="mt-2 text-2xl font-semibold">Experiment → Data → Graph → Inference</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">The practical workspace follows the 2026–27 Physics syllabus and is designed around the actual skills assessed in experiments, activities and viva.</p>
            </section>
            <PracticalHub />
          </>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="px-2 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">
                  {section==="XI"?"Class XI · 10 tools":"Class XII · 10 tools"}
                </div>
                <div className="space-y-1">
                  {tools.map(tool=>(
                    <button key={tool.id} onClick={()=>setSelected(tool.id)} className={`w-full rounded-xl px-3 py-3 text-left transition ${selected===tool.id?"bg-slate-950 text-white":"hover:bg-slate-50"}`}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{tool.title}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${selected===tool.id?"text-slate-300":"text-slate-400"}`}>{tool.chapter}</span>
                      </div>
                      <div className={`mt-1 text-[11px] leading-4 ${selected===tool.id?"text-slate-300":"text-slate-500"}`}>{tool.description}</div>
                    </button>
                  ))}
                </div>
              </aside>

              <section>
                <div className="mb-4 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">{current?.chapter} · {current?.tag}</div>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">{current?.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{current?.description}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
                    <div className="font-semibold text-slate-900">CBSE 2026–27</div>
                    <div>Physics · 042</div>
                  </div>
                </div>
                <ToolView id={selected} />
              </section>
            </div>

            <section className="mt-8">
              <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Reference</div>
                  <h2 className="mt-1 text-xl font-semibold">Formula Explorer</h2>
                </div>
                <p className="text-xs text-slate-500">Core relations aligned to the syllabus. Detailed derivations can be added chapter-by-chapter.</p>
              </div>
              <FormulaHub />
            </section>
          </>
        )}

        <footer className="mt-10 border-t border-slate-200 py-6 text-xs text-slate-400">
          VGB Physics Tools · CBSE Physics 042 · 2026–27 · Interactive educational workspace
        </footer>
      </div>
    </main>
  );
}
