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
  curves,
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
  cursorX,
}: {
  points?: { x: number; y: number }[];
  curves?: {
    id: string;
    label: string;
    points: { x: number; y: number }[];
    dash?: string;
  }[];
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
  cursorX?: number;
}) {
  const W = 760;
  const H = 390;
  const pad = { l: 58, r: 24, t: 30, b: 48 };

  const safeXMin = Number.isFinite(xMin) ? xMin : 0;
  const safeXMax =
    Number.isFinite(xMax) && xMax !== safeXMin ? xMax : safeXMin + 1;
  const safeYMin = Number.isFinite(yMin) ? yMin : 0;
  const safeYMax =
    Number.isFinite(yMax) && yMax !== safeYMin ? yMax : safeYMin + 1;

  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const sx = (x: number) =>
    pad.l + ((x - safeXMin) / (safeXMax - safeXMin)) * plotW;

  const sy = (y: number) =>
    H - pad.b - ((y - safeYMin) / (safeYMax - safeYMin)) * plotH;

  const makeTicks = (min: number, max: number, count: number) => {
    const span = Math.abs(max - min);
    if (!Number.isFinite(span) || span <= 0) return [min];

    const rawStep = span / count;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const normalized = rawStep / magnitude;
    const nice =
      normalized >= 5 ? 5 : normalized >= 2 ? 2 : normalized >= 1 ? 1 : 0.5;
    const step = nice * magnitude;
    const first = Math.ceil(min / step - 1e-10) * step;
    const ticks: number[] = [];

    for (
      let value = first;
      value <= max + step * 0.001;
      value += step
    ) {
      ticks.push(Number(value.toPrecision(12)));
      if (ticks.length > 20) break;
    }

    return ticks.length ? ticks : [min, max];
  };

  const xTicks = makeTicks(safeXMin, safeXMax, 8);
  const yTicks = makeTicks(safeYMin, safeYMax, 6);

  const xZeroVisible = safeXMin <= 0 && safeXMax >= 0;
  const yZeroVisible = safeYMin <= 0 && safeYMax >= 0;

  const axisX = yZeroVisible ? sy(0) : H - pad.b;
  const axisY = xZeroVisible ? sx(0) : pad.l;

  const allCurves = [
    ...(points ? [{ id: "main", label: yLabel, points }] : []),
    ...(curves ?? []),
  ];

  const finiteCurves = allCurves.map((curve) => ({
    ...curve,
    points: curve.points.filter(
      (p) => Number.isFinite(p.x) && Number.isFinite(p.y)
    ),
  }));

  const [hover, setHover] = useState<{
    x: number;
    y: number;
    px: number;
    py: number;
    label: string;
  } | null>(null);

  const [hoveredAnnotation, setHoveredAnnotation] = useState<
    { x: number; y: number; label: string } | null
  >(null);

  const buildPath = (curvePoints: { x: number; y: number }[]) =>
    curvePoints
      .map((p, i) => {
        const previous = curvePoints[i - 1];
        const isBreak =
          !previous ||
          Math.abs(sx(p.x) - sx(previous.x)) > plotW * 0.18 ||
          Math.abs(sy(p.y) - sy(previous.y)) > plotH * 0.9;

        return `${isBreak ? "M" : "L"} ${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`;
      })
      .join(" ");

  const nearest = (valueX: number) => {
    let best:
      | { x: number; y: number; label: string }
      | null = null;
    let bestDistance = Infinity;

    for (const curve of finiteCurves) {
      for (const point of curve.points) {
        const distance = Math.abs(point.x - valueX);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = { ...point, label: curve.label };
        }
      }
    }

    return best;
  };

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const localX = (e.clientX - rect.left) * scaleX;
    const localY = (e.clientY - rect.top) * scaleY;

    if (
      localX < pad.l ||
      localX > W - pad.r ||
      localY < pad.t ||
      localY > H - pad.b
    ) {
      setHover(null);
      setHoveredAnnotation(null);
      return;
    }

    const valueX =
      safeXMin + ((localX - pad.l) / plotW) * (safeXMax - safeXMin);

    const point = nearest(clamp(valueX, safeXMin, safeXMax));

    if (point) {
      setHover({
        x: point.x,
        y: point.y,
        px: sx(point.x),
        py: sy(point.y),
        label: point.label,
      });
    }

    let closestAnnotation: {
      x: number;
      y: number;
      label: string;
    } | null = null;
    let closestDistance = 16;

    for (const annotation of annotations) {
      if (
        !Number.isFinite(annotation.x) ||
        !Number.isFinite(annotation.y)
      ) {
        continue;
      }

      const dx = sx(annotation.x) - localX;
      const dy = sy(annotation.y) - localY;
      const distance = Math.hypot(dx, dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestAnnotation = annotation;
      }
    }

    setHoveredAnnotation(closestAnnotation);
  };

  const labelBox = (
    px: number,
    py: number,
    width: number,
    height: number
  ) => ({
    x: clamp(px + 10, 8, W - width - 8),
    y: clamp(py - height - 10, 8, H - height - 8),
  });

  const cursorVisible =
    Number.isFinite(cursorX) &&
    (cursorX as number) >= safeXMin &&
    (cursorX as number) <= safeXMax;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${yLabel} against ${xLabel}`}
        onMouseMove={onMove}
        onMouseLeave={() => {
          setHover(null);
          setHoveredAnnotation(null);
        }}
      >
        <rect width={W} height={H} fill="white" />

        {xTicks.map((x, i) => {
          const px = sx(x);
          const isAxis = xZeroVisible && Math.abs(x) < 1e-10;
          return (
            <g key={`x-${i}-${x}`}>
              {!isAxis && (
                <line
                  x1={px}
                  x2={px}
                  y1={pad.t}
                  y2={H - pad.b}
                  stroke="#e2e8f0"
                />
              )}
              <line
                x1={px}
                x2={px}
                y1={axisX - 4}
                y2={axisX + 4}
                stroke="#475569"
                strokeWidth="1.25"
              />
              <text
                x={px}
                y={clamp(axisX + 17, pad.t + 12, H - 22)}
                textAnchor="middle"
                fontSize="11"
                fill="#475569"
              >
                {fmt(x, Math.abs(x) >= 100 ? 0 : 2)}
              </text>
            </g>
          );
        })}

        {yTicks.map((y, i) => {
          const py = sy(y);
          const isAxis = yZeroVisible && Math.abs(y) < 1e-10;
          return (
            <g key={`y-${i}-${y}`}>
              {!isAxis && (
                <line
                  x1={pad.l}
                  x2={W - pad.r}
                  y1={py}
                  y2={py}
                  stroke="#e2e8f0"
                />
              )}
              <line
                x1={axisY - 4}
                x2={axisY + 4}
                y1={py}
                y2={py}
                stroke="#475569"
                strokeWidth="1.25"
              />
              <text
                x={clamp(axisY - 9, 24, W - 24)}
                y={py + 4}
                textAnchor="end"
                fontSize="11"
                fill="#475569"
              >
                {fmt(y, Math.abs(y) >= 100 ? 0 : 2)}
              </text>
            </g>
          );
        })}

        <line
          x1={pad.l}
          x2={W - pad.r}
          y1={axisX}
          y2={axisX}
          stroke="#334155"
          strokeWidth="1.7"
        />
        <line
          x1={axisY}
          x2={axisY}
          y1={pad.t}
          y2={H - pad.b}
          stroke="#334155"
          strokeWidth="1.7"
        />

        <text
          x={W - pad.r - 3}
          y={axisX - 8}
          textAnchor="end"
          fontSize="11"
          fontWeight="700"
          fill="#334155"
        >
          x
        </text>
        <text
          x={axisY + 8}
          y={pad.t + 10}
          fontSize="11"
          fontWeight="700"
          fill="#334155"
        >
          y
        </text>

        {finiteCurves.map((curve, index) => {
          const path = buildPath(curve.points);
          return path ? (
            <path
              key={curve.id}
              d={path}
              fill="none"
              stroke="#0f172a"
              strokeWidth={index === 0 ? 3 : 2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={curve.dash}
              opacity={index === 0 ? 1 : 0.72}
            />
          ) : null;
        })}

        {finiteCurves.length > 1 && (
          <g transform={`translate(${pad.l + 8}, ${pad.t + 2})`}>
            {finiteCurves.map((curve, i) => (
              <g key={`legend-${curve.id}`} transform={`translate(${i * 125}, 0)`}>
                <line
                  x1="0"
                  x2="20"
                  y1="6"
                  y2="6"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  strokeDasharray={curve.dash}
                />
                <text x="26" y="10" fontSize="10" fill="#475569">
                  {curve.label}
                </text>
              </g>
            ))}
          </g>
        )}

        {annotations.map((annotation) => {
          const px = sx(annotation.x);
          const py = sy(annotation.y);
          if (
            px < pad.l - 8 ||
            px > W - pad.r + 8 ||
            py < pad.t - 8 ||
            py > H - pad.b + 8
          ) {
            return null;
          }

          const active =
            hoveredAnnotation?.x === annotation.x &&
            hoveredAnnotation?.y === annotation.y &&
            hoveredAnnotation?.label === annotation.label;

          return (
            <g key={`${annotation.label}-${annotation.x}-${annotation.y}`}>
              {active && (
                <circle
                  cx={px}
                  cy={py}
                  r="12"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                />
              )}
              <circle
                cx={px}
                cy={py}
                r={active ? 6.5 : 5}
                fill="white"
                stroke="#0f172a"
                strokeWidth={active ? 3 : 2.5}
              />
              <text
                x={px + 9}
                y={py - 9}
                fontSize="11"
                fontWeight="700"
                fill="#334155"
              >
                {annotation.label}
              </text>
            </g>
          );
        })}

        {cursorVisible && (
          <line
            x1={sx(cursorX as number)}
            x2={sx(cursorX as number)}
            y1={pad.t}
            y2={H - pad.b}
            stroke="#64748b"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
        )}

        {marker &&
          Number.isFinite(marker.x) &&
          Number.isFinite(marker.y) && (
            <g>
              <line
                x1={sx(marker.x)}
                x2={sx(marker.x)}
                y1={sy(marker.y)}
                y2={axisX}
                stroke="#94a3b8"
                strokeDasharray="4 4"
              />
              <line
                x1={axisY}
                x2={sx(marker.x)}
                y1={sy(marker.y)}
                y2={sy(marker.y)}
                stroke="#94a3b8"
                strokeDasharray="4 4"
              />
              <circle
                cx={sx(marker.x)}
                cy={sy(marker.y)}
                r="7"
                fill="white"
                stroke="#0f172a"
                strokeWidth="3"
              />
              {markerLabel &&
                (() => {
                  const box = labelBox(sx(marker.x), sy(marker.y), 170, 26);
                  return (
                    <g>
                      <rect
                        x={box.x}
                        y={box.y}
                        width="170"
                        height="26"
                        rx="7"
                        fill="#0f172a"
                      />
                      <text
                        x={box.x + 10}
                        y={box.y + 17}
                        fontSize="11"
                        fill="white"
                      >
                        {markerLabel}
                      </text>
                    </g>
                  );
                })()}
            </g>
          )}

        {hover && (
          <g pointerEvents="none">
            <line
              x1={hover.px}
              x2={hover.px}
              y1={pad.t}
              y2={H - pad.b}
              stroke="#64748b"
              strokeDasharray="3 4"
            />
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={hover.py}
              y2={hover.py}
              stroke="#cbd5e1"
              strokeDasharray="3 4"
            />
            <circle
              cx={hover.px}
              cy={hover.py}
              r="5"
              fill="white"
              stroke="#0f172a"
              strokeWidth="2.5"
            />

            {(() => {
              const box = labelBox(hover.px, hover.py, 210, 42);
              return (
                <g>
                  <rect
                    x={box.x}
                    y={box.y}
                    width="210"
                    height="42"
                    rx="7"
                    fill="#0f172a"
                  />
                  <text
                    x={box.x + 10}
                    y={box.y + 16}
                    fontSize="10"
                    fontWeight="700"
                    fill="#cbd5e1"
                  >
                    {hover.label}
                  </text>
                  <text
                    x={box.x + 10}
                    y={box.y + 31}
                    fontSize="11"
                    fill="white"
                  >
                    {hoverLabel
                      ? hoverLabel(hover.x, hover.y)
                      : `x=${fmt(hover.x)} · y=${fmt(hover.y)}`}
                  </text>
                </g>
              );
            })()}
          </g>
        )}

        <text
          x={W / 2}
          y={H - 7}
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill="#334155"
        >
          {xLabel}
        </text>
        <text
          x="15"
          y={H / 2}
          textAnchor="middle"
          transform={`rotate(-90 15 ${H / 2})`}
          fontSize="12"
          fontWeight="600"
          fill="#334155"
        >
          {yLabel}
        </text>
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
  const [showPosition, setShowPosition] = useState(true);
  const [showVelocity, setShowVelocity] = useState(true);
  const [showAcceleration, setShowAcceleration] = useState(true);

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

  const points = useMemo(
    () =>
      Array.from({ length: 241 }, (_, i) => {
        const t = (i / 240) * tMax;
        return {
          t,
          x: u * t + 0.5 * a * t * t,
          v: u + a * t,
          a,
        };
      }),
    [u, a, tMax]
  );

  const selectedX = u * time + 0.5 * a * time * time;
  const selectedV = u + a * time;
  const selectedA = a;

  const allX = points.map((p) => p.x);
  const allV = points.map((p) => p.v);

  const range = (values: number[], minimumSpan: number) => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(max - min, minimumSpan);
    const pad = span * 0.12;
    return {
      min: min - pad,
      max: max + pad,
    };
  };

  const xRange = range(allX, 10);
  const vRange = range(allV, 10);
  const aRange = range([a], 10);

  const positionPoints = points.map((p) => ({ x: p.t, y: p.x }));
  const velocityPoints = points.map((p) => ({ x: p.t, y: p.v }));
  const accelerationPoints = points.map((p) => ({ x: p.t, y: p.a }));

  const reset = () => {
    setTime(0);
    setPlaying(false);
  };

  const jumpTo = (next: number) => {
    setTime(clamp(next, 0, tMax));
  };

  const activeGraphCount =
    Number(showPosition) + Number(showVelocity) + Number(showAcceleration);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-slate-500">
              Motion controls
            </div>

            <div className="space-y-5">
              <Slider
                label="Initial velocity u"
                value={u}
                min={-20}
                max={20}
                step={0.5}
                unit="m/s"
                onChange={setU}
              />
              <Slider
                label="Acceleration a"
                value={a}
                min={-10}
                max={10}
                step={0.5}
                unit="m/s²"
                onChange={setA}
              />
              <Slider
                label="Time range"
                value={tMax}
                min={4}
                max={20}
                step={1}
                unit="s"
                onChange={(n) => {
                  setTMax(n);
                  setTime((t) => Math.min(t, n));
                }}
              />
              <Slider
                label="Inspect time"
                value={time}
                min={0}
                max={tMax}
                step={Math.max(0.01, tMax / 240)}
                unit="s"
                onChange={setTime}
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white"
              >
                {playing ? "Pause" : "Play motion"}
              </button>
              <button
                onClick={reset}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Reset
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[0, tMax / 2, tMax].map((t) => (
                <button
                  key={t}
                  onClick={() => jumpTo(t)}
                  className="rounded-lg border border-slate-200 px-2 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  t = {fmt(t, 1)} s
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
            <div className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">
              Synchronized state · t = {fmt(time, 2)} s
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-[10px] text-slate-400">Position</div>
                <div className="mt-1 font-mono text-sm">{fmt(selectedX)} m</div>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-[10px] text-slate-400">Velocity</div>
                <div className="mt-1 font-mono text-sm">{fmt(selectedV)} m/s</div>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-[10px] text-slate-400">Acceleration</div>
                <div className="mt-1 font-mono text-sm">{fmt(selectedA)} m/s²</div>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-[10px] text-slate-400">Displacement</div>
                <div className="mt-1 font-mono text-sm">{fmt(selectedX)} m</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">
              Graphs
            </div>
            <div className="mt-3 space-y-2">
              {[
                { label: "Position–time", enabled: showPosition, set: setShowPosition },
                { label: "Velocity–time", enabled: showVelocity, set: setShowVelocity },
                { label: "Acceleration–time", enabled: showAcceleration, set: setShowAcceleration },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => item.set((v) => !v)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold ${
                    item.enabled
                      ? "border-slate-300 bg-slate-50 text-slate-950"
                      : "border-slate-200 text-slate-400"
                  }`}
                >
                  <span>{item.label}</span>
                  <span>{item.enabled ? "Shown" : "Hidden"}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-slate-950">
                  Synchronized motion graphs
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  The vertical cursor represents the same instant on every graph.
                </div>
              </div>
              <div className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-600">
                t = {fmt(time, 2)} s
              </div>
            </div>
          </div>

          {activeGraphCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              Turn on at least one graph.
            </div>
          ) : (
            <>
              {showPosition && (
                <div>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <div className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
                      Position x(t)
                    </div>
                    <div className="font-mono text-xs text-slate-500">
                      x = {fmt(selectedX)} m
                    </div>
                  </div>
                  <Graph
                    points={positionPoints}
                    xMin={0}
                    xMax={tMax}
                    yMin={xRange.min}
                    yMax={xRange.max}
                    xLabel="Time t (s)"
                    yLabel="Position x (m)"
                    marker={{ x: time, y: selectedX }}
                    markerLabel={`t=${fmt(time, 2)} s · x=${fmt(selectedX)} m`}
                    cursorX={time}
                    hoverLabel={(x, y) =>
                      `t = ${fmt(x, 2)} s · x = ${fmt(y)} m`
                    }
                    annotations={[
                      { x: 0, y: u * 0, label: "Start" },
                    ]}
                  />
                </div>
              )}

              {showVelocity && (
                <div>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <div className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
                      Velocity v(t)
                    </div>
                    <div className="font-mono text-xs text-slate-500">
                      v = {fmt(selectedV)} m/s
                    </div>
                  </div>
                  <Graph
                    points={velocityPoints}
                    xMin={0}
                    xMax={tMax}
                    yMin={vRange.min}
                    yMax={vRange.max}
                    xLabel="Time t (s)"
                    yLabel="Velocity v (m/s)"
                    marker={{ x: time, y: selectedV }}
                    markerLabel={`t=${fmt(time, 2)} s · v=${fmt(selectedV)} m/s`}
                    cursorX={time}
                    hoverLabel={(x, y) =>
                      `t = ${fmt(x, 2)} s · v = ${fmt(y)} m/s`
                    }
                    annotations={[
                      { x: 0, y: u, label: "u" },
                    ]}
                  />
                </div>
              )}

              {showAcceleration && (
                <div>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <div className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">
                      Acceleration a(t)
                    </div>
                    <div className="font-mono text-xs text-slate-500">
                      a = {fmt(selectedA)} m/s²
                    </div>
                  </div>
                  <Graph
                    points={accelerationPoints}
                    xMin={0}
                    xMax={tMax}
                    yMin={aRange.min}
                    yMax={aRange.max}
                    xLabel="Time t (s)"
                    yLabel="Acceleration a (m/s²)"
                    marker={{ x: time, y: selectedA }}
                    markerLabel={`t=${fmt(time, 2)} s · a=${fmt(selectedA)} m/s²`}
                    cursorX={time}
                    hoverLabel={(x, y) =>
                      `t = ${fmt(x, 2)} s · a = ${fmt(y)} m/s²`
                    }
                    annotations={[
                      { x: 0, y: a, label: "a" },
                    ]}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Initial velocity" value={fmt(u)} unit="m/s" />
        <Stat label="Acceleration" value={fmt(a)} unit="m/s²" />
        <Stat label="Position at t" value={fmt(selectedX)} unit="m" />
        <Stat label="Velocity at t" value={fmt(selectedV)} unit="m/s" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold">Motion snapshot</div>
        <div className="relative mt-4 h-20 overflow-hidden rounded-xl bg-slate-50">
          <div className="absolute bottom-5 left-5 right-5 h-px bg-slate-300" />
          <div
            className="absolute bottom-[18px] h-5 w-5 -translate-x-1/2 rounded-full border-2 border-slate-950 bg-white"
            style={{ left: `${5 + clamp(time / tMax, 0, 1) * 90}%` }}
          />
          <div className="absolute bottom-1 left-5 text-[10px] text-slate-400">
            t = 0
          </div>
          <div className="absolute bottom-1 right-5 text-[10px] text-slate-400">
            t = {fmt(tMax, 1)} s
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold">What to notice</div>
        <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3">
          <div>
            <span className="font-semibold text-slate-950">x–t:</span> the slope
            at an instant represents instantaneous velocity.
          </div>
          <div>
            <span className="font-semibold text-slate-950">v–t:</span> the
            slope represents acceleration, while signed area represents
            displacement.
          </div>
          <div>
            <span className="font-semibold text-slate-950">a–t:</span> signed
            area represents the change in velocity.
          </div>
        </div>
      </div>
    </div>
  );
}


function LabCard({
  title,
  eyebrow,
  children,
  className = "",
}: {
  title?: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
      {eyebrow && <div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">{eyebrow}</div>}
      {title && <div className={`${eyebrow ? "mt-1" : ""} text-sm font-semibold text-slate-950`}>{title}</div>}
      {children}
    </div>
  );
}

function ToggleButton({
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
      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
        active
          ? "border-slate-900 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function PhysicsEquation({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-950 px-4 py-3 font-mono text-sm text-white">
      {children}
    </div>
  );
}

function rangeWithPad(values: number[], minimumSpan = 1, padFraction = 0.12) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return { min: -1, max: 1 };
  const lo = Math.min(...finite);
  const hi = Math.max(...finite);
  const span = Math.max(hi - lo, minimumSpan);
  const pad = span * padFraction;
  return { min: lo - pad, max: hi + pad };
}

function VectorTool() {
  const [aMag, setAMag] = useState(8);
  const [aAng, setAAng] = useState(30);
  const [bMag, setBMag] = useState(6);
  const [bAng, setBAng] = useState(130);
  const [mode, setMode] = useState<"sum" | "components">("sum");

  const ar = (aAng * Math.PI) / 180;
  const br = (bAng * Math.PI) / 180;
  const ax = aMag * Math.cos(ar), ay = aMag * Math.sin(ar);
  const bx = bMag * Math.cos(br), by = bMag * Math.sin(br);
  const rx = ax + bx, ry = ay + by;
  const r = Math.hypot(rx, ry);
  const theta = Math.atan2(ry, rx) * 180 / Math.PI;
  const dot = ax * bx + ay * by;
  const angleBetween = Math.acos(clamp(dot / Math.max(aMag * bMag, 1e-9), -1, 1)) * 180 / Math.PI;

  const W = 640, H = 420, cx = 320, cy = 210, scale = 15;
  const px = (x: number) => cx + x * (230 / scale);
  const py = (y: number) => cy - y * (170 / scale);

  const Arrow = ({ x, y, label, dashed = false }: { x: number; y: number; label: string; dashed?: boolean }) => (
    <g>
      <line
        x1={cx} y1={cy} x2={px(x)} y2={py(y)}
        stroke="#0f172a" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={dashed ? "7 6" : undefined}
        markerEnd="url(#vector-arrow)"
      />
      <circle cx={px(x)} cy={py(y)} r="5" fill="white" stroke="#0f172a" strokeWidth="2" />
      <text x={px(x) + 8} y={py(y) - 8} fontSize="13" fontWeight="700" fill="#0f172a">{label}</text>
    </g>
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <LabCard eyebrow="Vector controls">
          <div className="mt-4 space-y-5">
            <div className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Vector A</div>
            <Slider label="Magnitude" value={aMag} min={0} max={15} step={0.5} unit="" onChange={setAMag} />
            <Slider label="Direction" value={aAng} min={0} max={360} step={1} unit="°" onChange={setAAng} />
            <div className="pt-1 text-xs font-bold uppercase tracking-[.14em] text-slate-500">Vector B</div>
            <Slider label="Magnitude" value={bMag} min={0} max={15} step={0.5} unit="" onChange={setBMag} />
            <Slider label="Direction" value={bAng} min={0} max={360} step={1} unit="°" onChange={setBAng} />
            <div className="flex gap-2">
              <ToggleButton active={mode === "sum"} onClick={() => setMode("sum")}>Resultant</ToggleButton>
              <ToggleButton active={mode === "components"} onClick={() => setMode("components")}>Components</ToggleButton>
            </div>
          </div>
        </LabCard>

        <LabCard title="Vector diagram" eyebrow="Interactive components">
          <div className="mt-3 overflow-hidden rounded-xl bg-slate-50">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              <defs>
                <marker id="vector-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
                  <path d="M0,0 L0,7 L8,3.5 z" fill="#0f172a" />
                </marker>
              </defs>
              <line x1="40" x2="600" y1={cy} y2={cy} stroke="#cbd5e1" />
              <line x1={cx} x2={cx} y1="25" y2="395" stroke="#cbd5e1" />
              {[-10, -5, 5, 10].map(v => (
                <g key={`x-${v}`}><line x1={px(v)} x2={px(v)} y1={cy - 4} y2={cy + 4} stroke="#94a3b8" /><text x={px(v)} y={cy + 20} textAnchor="middle" fontSize="10" fill="#64748b">{v}</text></g>
              ))}
              {[-10, -5, 5, 10].map(v => (
                <g key={`y-${v}`}><line x1={cx - 4} x2={cx + 4} y1={py(v)} y2={py(v)} stroke="#94a3b8" /><text x={cx - 9} y={py(v) + 4} textAnchor="end" fontSize="10" fill="#64748b">{v}</text></g>
              ))}
              <Arrow x={ax} y={ay} label="A" />
              <Arrow x={bx} y={by} label="B" />
              {mode === "sum" && <Arrow x={rx} y={ry} label="R = A + B" />}
              {mode === "components" && (
                <>
                  <Arrow x={ax} y={0} label="Ax" dashed />
                  <Arrow x={0} y={ay} label="Ay" dashed />
                  <Arrow x={bx} y={0} label="Bx" dashed />
                  <Arrow x={0} y={by} label="By" dashed />
                </>
              )}
              <circle cx={cx} cy={cy} r="4" fill="#0f172a" />
              <text x="590" y={cy - 8} fontSize="11" fill="#64748b">x</text>
              <text x={cx + 8} y="35" fontSize="11" fill="#64748b">y</text>
            </svg>
          </div>
        </LabCard>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Ax" value={fmt(ax)} />
        <Stat label="Ay" value={fmt(ay)} />
        <Stat label="Bx" value={fmt(bx)} />
        <Stat label="By" value={fmt(by)} />
        <Stat label="Resultant" value={fmt(r)} unit={`at ${fmt(theta)}°`} />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <LabCard title="Vector relations">
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span>A · B</span><span className="font-mono text-slate-950">{fmt(dot)}</span></div>
            <div className="flex justify-between"><span>Angle between A and B</span><span className="font-mono text-slate-950">{fmt(angleBetween)}°</span></div>
            <div className="flex justify-between"><span>|A + B|</span><span className="font-mono text-slate-950">{fmt(r)}</span></div>
          </div>
        </LabCard>
        <LabCard title="What to notice">
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The resultant is the diagonal obtained by adding components. Changing either magnitude or direction changes the component balance before it changes the final magnitude.
          </p>
        </LabCard>
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
  const [compare, setCompare] = useState(false);

  const rad = angle * Math.PI / 180;
  const vx0 = u * Math.cos(rad);
  const vy0 = u * Math.sin(rad);
  const discriminant = vy0 * vy0 + 2 * g * height0;
  const T = Math.max(0.01, (vy0 + Math.sqrt(Math.max(0, discriminant))) / g);
  const R = vx0 * T;
  const H = height0 + (vy0 * vy0) / (2 * g);
  const tPeak = clamp(vy0 / g, 0, T);
  const xPeak = vx0 * tPeak;
  const t = clamp(time, 0, T);
  const x = vx0 * t;
  const y = Math.max(0, height0 + vy0 * t - 0.5 * g * t * t);
  const vy = vy0 - g * t;
  const speed = Math.hypot(vx0, vy);
  const flightAtZero = height0 === 0 && Math.abs(t - T) < 1e-5;

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setTime(current => {
        const next = current + Math.max(0.015, T / 220);
        if (next >= T) {
          setPlaying(false);
          return T;
        }
        return next;
      });
    }, 30);
    return () => window.clearInterval(id);
  }, [playing, T]);

  const samples = useMemo(() => Array.from({ length: 241 }, (_, i) => {
    const tt = (i / 240) * T;
    return {
      t: tt,
      x: vx0 * tt,
      y: Math.max(0, height0 + vy0 * tt - 0.5 * g * tt * tt),
      vx: vx0,
      vy: vy0 - g * tt,
    };
  }), [T, vx0, vy0, height0, g]);

  const yRange = rangeWithPad(samples.map(p => p.y).concat([0]), Math.max(2, H * 0.15));
  const vRange = rangeWithPad(samples.map(p => p.vy), 4);
  const xRange = { min: -Math.max(1, R * 0.05), max: Math.max(2, R * 1.05) };

  const trajectory = samples.map(p => ({ x: p.x, y: p.y }));
  const xPoints = samples.map(p => ({ x: p.t, y: p.x }));
  const yPoints = samples.map(p => ({ x: p.t, y: p.y }));
  const vxPoints = samples.map(p => ({ x: p.t, y: p.vx }));
  const vyPoints = samples.map(p => ({ x: p.t, y: p.vy }));

  const compareCurves = [30, 45, 60].map(aDeg => {
    const rr = aDeg * Math.PI / 180;
    const vxx = u * Math.cos(rr);
    const vyy = u * Math.sin(rr);
    return {
      id: `${aDeg}`,
      label: `${aDeg}°`,
      points: samples.map((_, i) => {
        const tt = (i / 240) * ((vyy + Math.sqrt(vyy * vyy + 2 * g * height0)) / g);
        return { x: vxx * tt, y: Math.max(0, height0 + vyy * tt - 0.5 * g * tt * tt) };
      }),
    };
  });

  const reset = () => {
    setTime(0);
    setPlaying(false);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <LabCard eyebrow="Projectile controls">
          <div className="mt-4 space-y-5">
            <Slider label="Initial speed u" value={u} min={1} max={50} step={1} unit="m/s" onChange={setU} />
            <Slider label="Launch angle θ" value={angle} min={0} max={89} step={1} unit="°" onChange={setAngle} />
            <Slider label="Initial height h₀" value={height0} min={0} max={30} step={1} unit="m" onChange={setHeight0} />
            <Slider label="Gravity g" value={g} min={1} max={15} step={0.1} unit="m/s²" onChange={setG} />
            <Slider label="Inspect time" value={t} min={0} max={T} step={Math.max(0.01, T / 240)} unit="s" onChange={setTime} />
            <div className="flex gap-2">
              <button onClick={() => setPlaying(p => !p)} className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white">{playing ? "Pause" : "Play"}</button>
              <button onClick={reset} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Reset</button>
            </div>
            <ToggleButton active={compare} onClick={() => setCompare(p => !p)}>Compare 30° / 45° / 60°</ToggleButton>
          </div>
        </LabCard>

        <div className="space-y-4">
          <LabCard title="Trajectory" eyebrow="Synchronized projectile view">
            <div className="mt-3">
              <Graph
                points={trajectory}
                curves={compare ? compareCurves : undefined}
                xMin={xRange.min}
                xMax={xRange.max}
                yMin={Math.min(-1, yRange.min)}
                yMax={Math.max(2, yRange.max)}
                xLabel="Horizontal position x (m)"
                yLabel="Height y (m)"
                marker={{ x, y }}
                markerLabel={`t=${fmt(t,2)} s · x=${fmt(x)} m · y=${fmt(y)} m`}
                annotations={[
                  { x: 0, y: height0, label: "Launch" },
                  { x: xPeak, y: H, label: "Maximum height" },
                  { x: R, y: 0, label: "Landing" },
                ]}
              />
            </div>
          </LabCard>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Range" value={fmt(R)} unit="m" />
            <Stat label="Maximum height" value={fmt(H)} unit="m" />
            <Stat label="Time of flight" value={fmt(T)} unit="s" />
            <Stat label="Speed now" value={fmt(speed)} unit="m/s" />
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <LabCard title="Position and velocity" eyebrow={`Common time cursor · t = ${fmt(t,2)} s`}>
          <div className="mt-4 space-y-5">
            <Graph points={xPoints} xMin={0} xMax={T} yMin={rangeWithPad(xPoints.map(p=>p.y),2).min} yMax={rangeWithPad(xPoints.map(p=>p.y),2).max} xLabel="Time t (s)" yLabel="x (m)" marker={{x:t,y:x}} cursorX={t} />
            <Graph points={yPoints} xMin={0} xMax={T} yMin={rangeWithPad(yPoints.map(p=>p.y),2).min} yMax={rangeWithPad(yPoints.map(p=>p.y),2).max} xLabel="Time t (s)" yLabel="y (m)" marker={{x:t,y:y}} cursorX={t} />
          </div>
        </LabCard>

        <LabCard title="Velocity components" eyebrow="Horizontal component is constant">
          <div className="mt-4 space-y-5">
            <Graph points={vxPoints} xMin={0} xMax={T} yMin={rangeWithPad(vxPoints.map(p=>p.y),2).min} yMax={rangeWithPad(vxPoints.map(p=>p.y),2).max} xLabel="Time t (s)" yLabel="vₓ (m/s)" marker={{x:t,y:vx0}} cursorX={t} />
            <Graph points={vyPoints} xMin={0} xMax={T} yMin={vRange.min} yMax={vRange.max} xLabel="Time t (s)" yLabel="vᵧ (m/s)" marker={{x:t,y:vy}} cursorX={t} annotations={[{x:tPeak,y:0,label:"Apex: vy = 0"}]} />
          </div>
        </LabCard>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="vₓ now" value={fmt(vx0)} unit="m/s" />
        <Stat label="vᵧ now" value={fmt(vy)} unit="m/s" />
        <Stat label="Position x" value={fmt(x)} unit="m" />
        <Stat label="Position y" value={fmt(y)} unit="m" />
        <Stat label="Apex time" value={fmt(tPeak)} unit="s" />
      </div>

      <LabCard title="Projectile equations">
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <PhysicsEquation>x = u cosθ · t</PhysicsEquation>
          <PhysicsEquation>y = h₀ + u sinθ · t − ½gt²</PhysicsEquation>
          <PhysicsEquation>vₓ = u cosθ</PhysicsEquation>
          <PhysicsEquation>vᵧ = u sinθ − gt</PhysicsEquation>
        </div>
        {flightAtZero && <p className="mt-3 text-xs text-slate-500">At landing, y = 0 and the vertical component generally points downward.</p>}
      </LabCard>
    </div>
  );
}

function ForceTool() {
  const [mass, setMass] = useState(5);
  const [applied, setApplied] = useState(25);
  const [angle, setAngle] = useState(0);
  const [muS, setMuS] = useState(0.5);
  const [muK, setMuK] = useState(0.35);
  const g = 9.8;
  const theta = angle * Math.PI / 180;
  const normal = Math.max(0, mass * g - applied * Math.sin(theta));
  const maxStatic = muS * normal;
  const horizontal = applied * Math.cos(theta);
  const moving = horizontal > maxStatic + 1e-9;
  const friction = moving ? muK * normal : Math.min(horizontal, maxStatic);
  const net = horizontal - friction;
  const acceleration = net / mass;
  const staticBoundary = Array.from({length:121},(_,i)=>({x:i*maxStatic/120,y:0}));
  const forcePoints = Array.from({length:161},(_,i)=>{
    const F=(i/160)*Math.max(maxStatic*1.6,20);
    const N=Math.max(0,mass*g);
    const f=F<=muS*N?F:muK*N;
    return {x:F,y:Math.max(0,(F-f)/mass)};
  });

  const W=600,H=260;
  const scaleX=clamp(180/Math.max(horizontal,1),4,18);
  const forceArrow=(x2:number,y2:number,label:string,kind:string)=>(
    <g key={label}>
      <line x1="300" y1="135" x2={x2} y2={y2} stroke="#0f172a" strokeWidth="5" markerEnd="url(#force-arrow)"/>
      <text x={(300+x2)/2} y={(135+y2)/2-8} fontSize="12" fontWeight="700" fill="#0f172a">{label}</text>
    </g>
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <LabCard eyebrow="Dynamics controls">
          <div className="mt-4 space-y-5">
            <Slider label="Mass" value={mass} min={0.5} max={20} step={0.5} unit="kg" onChange={setMass}/>
            <Slider label="Applied force" value={applied} min={0} max={100} step={1} unit="N" onChange={setApplied}/>
            <Slider label="Force angle" value={angle} min={-30} max={30} step={1} unit="°" onChange={setAngle}/>
            <Slider label="Static friction μs" value={muS} min={0} max={1} step={0.05} onChange={setMuS}/>
            <Slider label="Kinetic friction μk" value={muK} min={0} max={1} step={0.05} onChange={setMuK}/>
          </div>
        </LabCard>
        <LabCard title="Free-body diagram" eyebrow={moving ? "Object is moving" : "Object remains static"}>
          <div className="mt-3 rounded-xl bg-slate-50">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
              <defs><marker id="force-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto"><path d="M0,0 L0,7 L8,3.5 z" fill="#0f172a"/></marker></defs>
              <rect x="255" y="105" width="90" height="60" rx="8" fill="white" stroke="#0f172a" strokeWidth="3"/>
              {forceArrow(300 + clamp(horizontal*scaleX,0,230),135,"F", "applied")}
              {forceArrow(300,35,"N","normal")}
              {forceArrow(300,225,"mg","weight")}
              {forceArrow(300-clamp(friction*scaleX,0,220),135,"f","friction")}
              <line x1="100" x2="500" y1="165" y2="165" stroke="#cbd5e1" strokeWidth="2"/>
              <text x="300" y="190" textAnchor="middle" fontSize="11" fill="#64748b">horizontal surface</text>
            </svg>
          </div>
        </LabCard>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Normal" value={fmt(normal)} unit="N"/>
        <Stat label="Max static friction" value={fmt(maxStatic)} unit="N"/>
        <Stat label="Friction now" value={fmt(friction)} unit="N"/>
        <Stat label="Net force" value={fmt(net)} unit="N"/>
        <Stat label="Acceleration" value={fmt(acceleration)} unit="m/s²"/>
      </div>
      <LabCard title="Force → acceleration characteristic" eyebrow="Static friction threshold then kinetic friction">
        <div className="mt-3">
          <Graph
            points={forcePoints}
            xMin={0}
            xMax={Math.max(maxStatic*1.6,20)}
            yMin={-0.2}
            yMax={Math.max(2, Math.max(...forcePoints.map(p=>p.y))*1.12)}
            xLabel="Applied horizontal force (N)"
            yLabel="Acceleration (m/s²)"
            marker={{x:horizontal,y:Math.max(0,acceleration)}}
            annotations={[{x:maxStatic,y:0,label:"Maximum static friction"}]}
          />
        </div>
      </LabCard>
      <div className="grid gap-5 md:grid-cols-2">
        <LabCard title="Model">
          <div className="space-y-2 text-sm text-slate-600">
            <PhysicsEquation>ΣF = ma</PhysicsEquation>
            <PhysicsEquation>fₛ ≤ μₛN ; fₖ = μₖN</PhysicsEquation>
          </div>
        </LabCard>
        <LabCard title="Interpretation">
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Before the limiting static friction is exceeded, the block can remain at rest. Once motion begins, the friction model switches to kinetic friction.
          </p>
        </LabCard>
      </div>
    </div>
  );
}

function EnergyTool() {
  const [mode, setMode] = useState<"work"|"energy"|"power">("work");
  const [force,setForce]=useState(10),[distance,setDistance]=useState(8),[angle,setAngle]=useState(0);
  const [mass,setMass]=useState(2),[mu,setMu]=useState(0),[height,setHeight]=useState(10),[time,setTime]=useState(4),[powerWork,setPowerWork]=useState(120),[playing,setPlaying]=useState(false);
  const g=9.8, theta=angle*Math.PI/180;
  const normal=Math.max(0,mass*g-force*Math.sin(theta));
  const friction=mu*normal;
  const appliedWork=force*distance*Math.cos(theta);
  const frictionWork=-friction*distance;
  const netWork=appliedWork+frictionWork;
  const initialK=0;
  const finalK=Math.max(0,initialK+netWork);
  const finalSpeed=Math.sqrt(2*finalK/mass);
  const maxT=Math.max(1,Math.sqrt(2*height/g));
  const t=clamp(time,0,maxT);

  useEffect(()=>{if(!playing)return;const id=window.setInterval(()=>setTime(v=>{const n=v+maxT/180;if(n>=maxT){setPlaying(false);return maxT;}return n;}),30);return()=>window.clearInterval(id)},[playing,maxT]);

  const workPoints=Array.from({length:161},(_,i)=>{const x=i/160*distance;return{x,y:force*x*Math.cos(theta)-friction*x}});
  const fallingHeight=Math.max(0,height-0.5*g*t*t);
  const U=mass*g*fallingHeight;
  const total=mass*g*height;
  const K=Math.max(0,total-U);
  const energyPoints=Array.from({length:161},(_,i)=>{const tt=i/160*maxT;const hh=Math.max(0,height-.5*g*tt*tt);const uu=mass*g*hh;return{x:tt,y:uu}});
  const kineticPoints=Array.from({length:161},(_,i)=>{const tt=i/160*maxT;const hh=Math.max(0,height-.5*g*tt*tt);return{x:tt,y:Math.max(0,total-mass*g*hh)}});
  const totalPoints=Array.from({length:161},(_,i)=>({x:i/160*maxT,y:total}));
  const power= time>0?powerWork/time:0;
  const powerPoints=Array.from({length:161},(_,i)=>({x:i/160*Math.max(8,time||8),y:i===0?0:power}));

  return <div className="space-y-5">
    <div className="flex flex-wrap gap-2">
      <SectionButton active={mode==="work"} onClick={()=>setMode("work")}>Force → Work</SectionButton>
      <SectionButton active={mode==="energy"} onClick={()=>setMode("energy")}>Energy Conservation</SectionButton>
      <SectionButton active={mode==="power"} onClick={()=>setMode("power")}>Power</SectionButton>
    </div>

    {mode==="work" && <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <LabCard eyebrow="Work controls"><div className="mt-4 space-y-5">
          <Slider label="Applied force" value={force} min={0} max={100} step={1} unit="N" onChange={setForce}/>
          <Slider label="Displacement" value={distance} min={1} max={30} step={0.5} unit="m" onChange={setDistance}/>
          <Slider label="Force angle" value={angle} min={-90} max={90} step={1} unit="°" onChange={setAngle}/>
          <Slider label="Friction coefficient" value={mu} min={0} max={1} step={0.05} onChange={setMu}/>
          <Slider label="Mass" value={mass} min={0.5} max={20} step={0.5} unit="kg" onChange={setMass}/>
        </div></LabCard>
        <LabCard title="Work–displacement graph" eyebrow="Signed area interpretation">
          <Graph points={workPoints} xMin={0} xMax={distance} yMin={Math.min(0,...workPoints.map(p=>p.y))*1.12} yMax={Math.max(1,...workPoints.map(p=>p.y))*1.12} xLabel="Displacement x (m)" yLabel="Work W (J)" marker={{x:distance,y:netWork}} annotations={[{x:distance,y:netWork,label:"Net work"}]}/>
        </LabCard>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Applied work" value={fmt(appliedWork)} unit="J"/><Stat label="Friction work" value={fmt(frictionWork)} unit="J"/><Stat label="Net work" value={fmt(netWork)} unit="J"/><Stat label="Final speed from rest" value={fmt(finalSpeed)} unit="m/s"/></div>
      <LabCard title="Energy theorem"><PhysicsEquation>Wₙₑₜ = ΔK = ½mv² − ½mu²</PhysicsEquation></LabCard>
    </div>}

    {mode==="energy" && <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <LabCard eyebrow="Falling-body model"><div className="mt-4 space-y-5">
          <Slider label="Mass" value={mass} min={0.5} max={20} step={0.5} unit="kg" onChange={setMass}/>
          <Slider label="Initial height" value={height} min={1} max={30} step={1} unit="m" onChange={setHeight}/>
          <Slider label="Inspect time" value={t} min={0} max={maxT} step={Math.max(.01,maxT/200)} unit="s" onChange={setTime}/>
          <div className="flex gap-2"><button onClick={()=>setPlaying(p=>!p)} className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white">{playing?"Pause":"Animate"}</button><button onClick={()=>{setTime(0);setPlaying(false)}} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Reset</button></div>
        </div></LabCard>
        <LabCard title="Mechanical energy vs time" eyebrow={`t = ${fmt(t,2)} s`}>
          <Graph curves={[{id:"U",label:"Potential energy U",points:energyPoints},{id:"K",label:"Kinetic energy K",points:kineticPoints,dash:"7 5"},{id:"E",label:"Total mechanical energy",points:totalPoints,dash:"3 4"}]} xMin={0} xMax={maxT} yMin={0} yMax={total*1.12} xLabel="Time t (s)" yLabel="Energy (J)" marker={{x:t,y:U}} cursorX={t}/>
        </LabCard>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Potential U" value={fmt(U)} unit="J"/><Stat label="Kinetic K" value={fmt(K)} unit="J"/><Stat label="Total E" value={fmt(total)} unit="J"/><Stat label="Speed" value={fmt(Math.sqrt(2*K/mass))} unit="m/s"/></div>
    </div>}

    {mode==="power" && <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <LabCard eyebrow="Power controls"><div className="mt-4 space-y-5"><Slider label="Work" value={powerWork} min={-500} max={500} step={1} unit="J" onChange={setPowerWork}/><Slider label="Elapsed time" value={time} min={0.1} max={10} step={0.1} unit="s" onChange={setTime}/></div></LabCard>
        <LabCard title="Average power" eyebrow="P = W / t"><Graph points={powerPoints} xMin={0} xMax={Math.max(8,time||8)} yMin={Math.min(0,power)*1.15} yMax={Math.max(1,power)*1.15} xLabel="Time t (s)" yLabel="Average power (W)" marker={{x:time,y:power}}/></LabCard>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3"><Stat label="Work" value={fmt(netWork)} unit="J"/><Stat label="Time" value={fmt(time)} unit="s"/><Stat label="Average power" value={fmt(power)} unit="W"/></div>
    </div>}
  </div>;
}

function RotationTool() {
  const [I,setI]=useState(2),[tau,setTau]=useState(8),[omega0,setOmega0]=useState(0),[duration,setDuration]=useState(6);
  const alpha=tau/I;
  const points=Array.from({length:181},(_,i)=>{const t=i/180*duration;return{x:t,y:omega0+alpha*t}});
  const thetaPoints=Array.from({length:181},(_,i)=>{const t=i/180*duration;return{x:t,y:omega0*t+.5*alpha*t*t}});
  const kineticPoints=Array.from({length:181},(_,i)=>{const t=i/180*duration;const w=omega0+alpha*t;return{x:t,y:.5*I*w*w}});
  const angle=omega0*duration+.5*alpha*duration*duration;
  const finalOmega=omega0+alpha*duration;
  const turns=angle/(2*Math.PI);
  const r=70, cx=180, cy=150, rotation=finalOmega*duration;
  return <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <LabCard eyebrow="Rotational dynamics"><div className="mt-4 space-y-5"><Slider label="Moment of inertia I" value={I} min={0.2} max={10} step={0.2} unit="kg·m²" onChange={setI}/><Slider label="Torque τ" value={tau} min={-20} max={20} step={0.5} unit="N·m" onChange={setTau}/><Slider label="Initial angular speed" value={omega0} min={0} max={20} step={0.5} unit="rad/s" onChange={setOmega0}/><Slider label="Duration" value={duration} min={1} max={15} step={1} unit="s" onChange={setDuration}/></div></LabCard>
      <LabCard title="Rotating-body view" eyebrow="τ = Iα">
        <svg viewBox="0 0 360 300" className="mx-auto w-full max-w-md">
          <circle cx={cx} cy={cy} r={r} fill="#f8fafc" stroke="#0f172a" strokeWidth="3"/>
          {Array.from({length:8},(_,i)=>{const a=rotation+i*Math.PI/4;return <line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#94a3b8" strokeWidth="2"/>})}
          <circle cx={cx} cy={cy} r="5" fill="#0f172a"/>
          <text x="180" y="275" textAnchor="middle" fontSize="12" fill="#64748b">Final rotation ≈ {fmt(turns,2)} revolutions</text>
        </svg>
      </LabCard>
    </div>
    <div className="grid gap-5 xl:grid-cols-3"><Graph points={thetaPoints} xMin={0} xMax={duration} yMin={Math.min(0,...thetaPoints.map(p=>p.y))*1.1} yMax={Math.max(1,...thetaPoints.map(p=>p.y))*1.1} xLabel="Time (s)" yLabel="Angular displacement θ (rad)"/><Graph points={points} xMin={0} xMax={duration} yMin={Math.min(0,...points.map(p=>p.y))*1.1} yMax={Math.max(1,...points.map(p=>p.y))*1.1} xLabel="Time (s)" yLabel="Angular velocity ω (rad/s)"/><Graph points={kineticPoints} xMin={0} xMax={duration} yMin={0} yMax={Math.max(1,...kineticPoints.map(p=>p.y))*1.1} xLabel="Time (s)" yLabel="Rotational K (J)"/></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Angular acceleration" value={fmt(alpha)} unit="rad/s²"/><Stat label="Final ω" value={fmt(finalOmega)} unit="rad/s"/><Stat label="Angular displacement" value={fmt(angle)} unit="rad"/><Stat label="Revolutions" value={fmt(turns)} unit="rev"/></div>
  </div>;
}

function GravityTool() {
  const [M,setM]=useState(5.972e24),[rKm,setRKm]=useState(7000);
  const G=6.6743e-11, r=rKm*1000;
  const g=G*M/(r*r), orbital=Math.sqrt(G*M/r), escape=Math.sqrt(2*G*M/r), potential=-G*M/r;
  const radii=Array.from({length:161},(_,i)=>Math.max(1000,(rKm*.25)+(i/160)*rKm*2)*1000);
  const gPoints=radii.map(rr=>({x:rr/1000,y:G*M/(rr*rr)}));
  const vPoints=radii.map(rr=>({x:rr/1000,y:Math.sqrt(G*M/rr)}));
  return <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <LabCard eyebrow="Central-body model"><div className="mt-4 space-y-5"><Slider label="Mass" value={M/1e24} min={0.1} max={10} step={0.1} unit="×10²⁴ kg" onChange={v=>setM(v*1e24)}/><Slider label="Orbital radius" value={rKm} min={1000} max={50000} step={100} unit="km" onChange={setRKm}/></div></LabCard>
      <LabCard title="Gravity and orbital speed" eyebrow="Inverse-square behaviour"><div className="mt-3 grid gap-4 md:grid-cols-2"><Graph points={gPoints} xMin={Math.min(...radii)/1000} xMax={Math.max(...radii)/1000} yMin={0} yMax={Math.max(...gPoints.map(p=>p.y))*1.08} xLabel="Radius (km)" yLabel="g (m/s²)" marker={{x:rKm,y:g}}/><Graph points={vPoints} xMin={Math.min(...radii)/1000} xMax={Math.max(...radii)/1000} yMin={0} yMax={Math.max(...vPoints.map(p=>p.y))*1.08} xLabel="Radius (km)" yLabel="Orbital speed (m/s)" marker={{x:rKm,y:orbital}}/></div></LabCard>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="g at r" value={fmt(g)} unit="m/s²"/><Stat label="Circular orbital speed" value={fmt(orbital/1000)} unit="km/s"/><Stat label="Escape speed" value={fmt(escape/1000)} unit="km/s"/><Stat label="Potential per kg" value={fmt(potential/1e6)} unit="MJ/kg"/></div>
    <LabCard title="Satellite relation"><PhysicsEquation>vₒ = √(GM/r) &nbsp;&nbsp;&nbsp; vₑ = √(2GM/r)</PhysicsEquation><p className="mt-3 text-sm leading-6 text-slate-600">The escape speed is √2 times the circular orbital speed at the same radius for the ideal two-body model.</p></LabCard>
  </div>;
}

function ThermoTool() {
  const [process,setProcess]=useState<"isothermal"|"adiabatic"|"isobaric"|"isochoric">("isothermal");
  const [P1,setP1]=useState(2),[V1,setV1]=useState(2),[gamma,setGamma]=useState(1.4);
  const V2=process==="isochoric"?V1:Math.max(.5,V1*2);
  const P2=process==="isobaric"?P1:process==="isochoric"?P1*1.5:process==="isothermal"?P1*V1/V2:P1*Math.pow(V1/V2,gamma);
  const points=Array.from({length:161},(_,i)=>{const V=V1+(V2-V1)*i/160;let P=P1;if(process==="isothermal")P=P1*V1/V;else if(process==="adiabatic")P=P1*Math.pow(V1/V,gamma);else if(process==="isobaric")P=P1;else P=P1+(P2-P1)*(i/160);return{x:V,y:P}});
  const work=process==="isochoric"?0:process==="isothermal"?P1*V1*Math.log(V2/V1):process==="adiabatic"?(P2*V2-P1*V1)/(1-gamma):P1*(V2-V1);
  const yRange=rangeWithPad(points.map(p=>p.y),.5);
  return <div className="space-y-5">
    <div className="flex flex-wrap gap-2">{(["isothermal","adiabatic","isobaric","isochoric"] as const).map(x=><SectionButton key={x} active={process===x} onClick={()=>setProcess(x)}>{x[0].toUpperCase()+x.slice(1)}</SectionButton>)}</div>
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <LabCard eyebrow="P–V process"><div className="mt-4 space-y-5"><Slider label="Initial pressure" value={P1} min={0.5} max={10} step={0.1} unit="bar" onChange={setP1}/><Slider label="Initial volume" value={V1} min={0.5} max={10} step={0.1} unit="L" onChange={setV1}/><Slider label="Adiabatic γ" value={gamma} min={1.1} max={1.67} step={0.01} onChange={setGamma}/></div></LabCard>
      <LabCard title={`${process[0].toUpperCase()+process.slice(1)} P–V diagram`} eyebrow="Area under a P–V path represents work">
        <Graph points={points} xMin={Math.min(V1,V2)*.9} xMax={Math.max(V1,V2)*1.1} yMin={Math.max(0,yRange.min)} yMax={yRange.max} xLabel="Volume (L)" yLabel="Pressure (bar)" marker={{x:V2,y:P2}} annotations={[{x:V1,y:P1,label:"Initial state"},{x:V2,y:P2,label:"Final state"}]}/>
      </LabCard>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="P₁" value={fmt(P1)} unit="bar"/><Stat label="P₂" value={fmt(P2)} unit="bar"/><Stat label="V₂" value={fmt(V2)} unit="L"/><Stat label="Work" value={fmt(work*100)} unit="J (approx.)"/></div>
    <LabCard title="First-law context"><PhysicsEquation>ΔQ = ΔU + W</PhysicsEquation><p className="mt-3 text-sm leading-6 text-slate-600">The graph handles the mechanical P–V work term. Heat and internal-energy changes require a specified thermodynamic system and process assumptions.</p></LabCard>
  </div>;
}

function ShmTool() {
  const [A,setA]=useState(2),[T,setT]=useState(4),[phase,setPhase]=useState(0),[time,setTime]=useState(0),[playing,setPlaying]=useState(false);
  const omega=2*Math.PI/T;
  const maxT=2*T;
  const samples=useMemo(()=>Array.from({length:241},(_,i)=>{
    const t=i/240*maxT;
    const wt=omega*t+phase*Math.PI/180;
    return{x:t,pos:A*Math.cos(wt),v:-A*omega*Math.sin(wt),acc:-A*omega*omega*Math.cos(wt)};
  }),[A,T,phase,omega,maxT]);
  const t=clamp(time,0,maxT);
  const wt=omega*t+phase*Math.PI/180;
  const pos=A*Math.cos(wt),v=-A*omega*Math.sin(wt),acc=-A*omega*omega*Math.cos(wt);
  useEffect(()=>{if(!playing)return;const id=window.setInterval(()=>setTime(x=>{const n=x+maxT/240;if(n>=maxT){setPlaying(false);return maxT}return n}),30);return()=>window.clearInterval(id)},[playing,maxT]);
  const graph=(key:"pos"|"v"|"acc")=>samples.map(p=>({x:p.x,y:p[key]}));
  const yr=(key:"pos"|"v"|"acc")=>rangeWithPad(samples.map(p=>p[key]),1);
  return <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <LabCard eyebrow="SHM controls">
        <div className="mt-4 space-y-5">
          <Slider label="Amplitude A" value={A} min={0.5} max={5} step={0.1} unit="m" onChange={setA}/>
          <Slider label="Time period T" value={T} min={1} max={10} step={0.5} unit="s" onChange={v=>{setT(v);setTime(x=>Math.min(x,2*v))}}/>
          <Slider label="Phase" value={phase} min={0} max={360} step={5} unit="°" onChange={setPhase}/>
          <Slider label="Inspect time" value={t} min={0} max={maxT} step={Math.max(.01,maxT/240)} unit="s" onChange={setTime}/>
          <button onClick={()=>setPlaying(p=>!p)} className="w-full rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white">{playing?"Pause":"Animate"}</button>
        </div>
      </LabCard>
      <div className="space-y-4">
        <LabCard title="Displacement x(t)" eyebrow={`Shared cursor · t = ${fmt(t,2)} s`}>
          <Graph points={graph("pos")} xMin={0} xMax={maxT} yMin={yr("pos").min} yMax={yr("pos").max} xLabel="Time t (s)" yLabel="Displacement x (m)" marker={{x:t,y:pos}} cursorX={t} annotations={[{x:t,y:pos,label:"Current x"}]}/>
        </LabCard>
        <LabCard title="Velocity v(t)">
          <Graph points={graph("v")} xMin={0} xMax={maxT} yMin={yr("v").min} yMax={yr("v").max} xLabel="Time t (s)" yLabel="Velocity v (m/s)" marker={{x:t,y:v}} cursorX={t}/>
        </LabCard>
        <LabCard title="Acceleration a(t)">
          <Graph points={graph("acc")} xMin={0} xMax={maxT} yMin={yr("acc").min} yMax={yr("acc").max} xLabel="Time t (s)" yLabel="Acceleration a (m/s²)" marker={{x:t,y:acc}} cursorX={t}/>
        </LabCard>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <Stat label="x(t)" value={fmt(pos)} unit="m"/><Stat label="v(t)" value={fmt(v)} unit="m/s"/><Stat label="a(t)" value={fmt(acc)} unit="m/s²"/><Stat label="Frequency" value={fmt(1/T,3)} unit="Hz"/><Stat label="ω" value={fmt(omega,3)} unit="rad/s"/>
    </div>
    <LabCard title="SHM relation">
      <PhysicsEquation>x = A cos(ωt + φ)</PhysicsEquation>
      <p className="mt-3 text-sm text-slate-600">The sampling spans exactly two complete periods, and the same time cursor is applied to displacement, velocity and acceleration.</p>
    </LabCard>
  </div>;
}

function ElectricTool() {
  const [q,setQ]=useState(2),[distance,setDistance]=useState(2);
  const k=8.988e9;
  const E=k*(q*1e-6)/(distance*distance);
  const W=620,H=380,cx=310,cy=190;
  const sign=q>=0?1:-1;
  const arrows=Array.from({length:16},(_,i)=>{
    const a=i*Math.PI/8;
    const r1=35,r2=145;
    const x1=cx+r1*Math.cos(a),y1=cy+r1*Math.sin(a);
    const x2=cx+r2*Math.cos(a),y2=cy+r2*Math.sin(a);
    const dir=sign;
    return <line key={i} x1={dir>0?x1:x2} y1={dir>0?y1:y2} x2={dir>0?x2:x1} y2={dir>0?y2:y1} stroke="#475569" strokeWidth="2" markerEnd="url(#field-arrow)"/>;
  });
  const fieldPoints=Array.from({length:160},(_,i)=>{const r=.5+i/159*8;return{x:r,y:Math.abs(k*q*1e-6/(r*r))/1000}});
  return <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <LabCard eyebrow="Point-charge explorer"><div className="mt-4 space-y-5"><Slider label="Charge q" value={q} min={-10} max={10} step={0.5} unit="μC" onChange={setQ}/><Slider label="Test-point distance r" value={distance} min={0.5} max={8} step={0.1} unit="m" onChange={setDistance}/></div></LabCard>
      <LabCard title="Electric-field direction" eyebrow="Field lines reverse when charge changes sign">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-slate-50">
          <defs><marker id="field-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#475569"/></marker></defs>
          {arrows}
          <circle cx={cx} cy={cy} r="24" fill={q>=0?"#0f172a":"white"} stroke="#0f172a" strokeWidth="3"/>
          <text x={cx} y={cy+7} textAnchor="middle" fontSize="18" fontWeight="700" fill={q>=0?"white":"#0f172a"}>{q>=0?"+":"−"}</text>
          <circle cx={cx+distance*55} cy={cy} r="7" fill="white" stroke="#0f172a" strokeWidth="3"/>
          <text x={cx+distance*55} y={cy-13} textAnchor="middle" fontSize="10" fill="#64748b">test point</text>
        </svg>
      </LabCard>
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <LabCard title="Field magnitude vs distance"><Graph points={fieldPoints} xMin={0.5} xMax={8.5} yMin={0} yMax={Math.max(...fieldPoints.map(p=>p.y))*1.1} xLabel="Distance r (m)" yLabel="|E| (kN/C)" marker={{x:distance,y:Math.abs(E)/1000}}/></LabCard>
      <LabCard title="At the selected point"><div className="mt-3 grid grid-cols-2 gap-3"><Stat label="E magnitude" value={fmt(Math.abs(E)/1000)} unit="kN/C"/><Stat label="Direction" value={q>=0?"Away":"Toward"}/></div><p className="mt-3 text-sm leading-6 text-slate-600">For a positive source charge, the electric field points outward. For a negative source charge, it points inward.</p></LabCard>
    </div>
  </div>;
}

function CapacitorTool() {
  const [A,setA]=useState(.02),[d,setD]=useState(.002),[er,setEr]=useState(1),[V,setV]=useState(12);
  const eps=8.854e-12,C=eps*er*A/d,Q=C*V,U=.5*C*V*V,E=V/d;
  const fieldLines=Array.from({length:12},(_,i)=>i);
  return <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <LabCard eyebrow="Parallel-plate capacitor"><div className="mt-4 space-y-5"><Slider label="Plate area" value={A} min={.005} max={.1} step={.005} unit="m²" onChange={setA}/><Slider label="Plate separation" value={d} min={.0005} max={.01} step={.0005} unit="m" onChange={setD}/><Slider label="Relative permittivity εᵣ" value={er} min={1} max={10} step={.5} onChange={setEr}/><Slider label="Potential difference V" value={V} min={1} max={50} step={1} unit="V" onChange={setV}/></div></LabCard>
      <LabCard title="Field inside the capacitor" eyebrow="Geometry responds to the controls">
        <svg viewBox="0 0 620 300" className="w-full rounded-xl bg-slate-50">
          <rect x="90" y="55" width="22" height="190" rx="4" fill="#0f172a"/><rect x="508" y="55" width="22" height="190" rx="4" fill="#0f172a"/>
          <text x="101" y="40" textAnchor="middle" fontSize="12" fontWeight="700">+</text><text x="519" y="40" textAnchor="middle" fontSize="12" fontWeight="700">−</text>
          {fieldLines.map(i=>{const y=70+i*15;return <line key={i} x1="125" x2="495" y1={y} y2={y} stroke="#64748b" strokeWidth="2" markerEnd="url(#cap-arrow)"/>})}
          <defs><marker id="cap-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#64748b"/></marker></defs>
          <text x="310" y="275" textAnchor="middle" fontSize="11" fill="#64748b">d = {fmt(d*1000,2)} mm · E = {fmt(E)} V/m · εᵣ = {fmt(er,1)}</text>
        </svg>
      </LabCard>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Capacitance" value={fmt(C*1e9,3)} unit="nF"/><Stat label="Charge" value={fmt(Q*1e6,3)} unit="μC"/><Stat label="Stored energy" value={fmt(U*1000,3)} unit="mJ"/><Stat label="Field" value={fmt(E)} unit="V/m"/></div>
    <LabCard title="Relationships"><div className="grid gap-3 md:grid-cols-3"><PhysicsEquation>C = εA/d</PhysicsEquation><PhysicsEquation>Q = CV</PhysicsEquation><PhysicsEquation>U = ½CV²</PhysicsEquation></div></LabCard>
  </div>;
}

function CircuitTool() {
  const [mode,setMode]=useState<"series"|"parallel">("series");
  const [V,setV]=useState(12),[R1,setR1]=useState(4),[R2,setR2]=useState(6),[R3,setR3]=useState(10);
  const Req=mode==="series"?R1+R2+R3:1/(1/R1+1/R2+1/R3);
  const I=V/Req;
  const currents=mode==="series"?[I,I,I]:[V/R1,V/R2,V/R3];
  const volts=mode==="series"?[I*R1,I*R2,I*R3]:[V,V,V];
  return <div className="space-y-5">
    <div className="flex gap-2"><SectionButton active={mode==="series"} onClick={()=>setMode("series")}>Series</SectionButton><SectionButton active={mode==="parallel"} onClick={()=>setMode("parallel")}>Parallel</SectionButton></div>
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <LabCard eyebrow="Circuit controls"><div className="mt-4 space-y-5"><Slider label="Supply voltage" value={V} min={1} max={30} step={1} unit="V" onChange={setV}/><Slider label="R₁" value={R1} min={1} max={50} step={1} unit="Ω" onChange={setR1}/><Slider label="R₂" value={R2} min={1} max={50} step={1} unit="Ω" onChange={setR2}/><Slider label="R₃" value={R3} min={1} max={50} step={1} unit="Ω" onChange={setR3}/></div></LabCard>
      <LabCard title={`${mode[0].toUpperCase()+mode.slice(1)} circuit`} eyebrow="Calculated circuit state">
        <svg viewBox="0 0 760 250" className="w-full rounded-xl bg-slate-50">
          <rect x="45" y="85" width="55" height="80" rx="8" fill="white" stroke="#0f172a" strokeWidth="3"/><text x="72" y="120" textAnchor="middle" fontSize="12" fontWeight="700">+ {V} V</text><text x="72" y="140" textAnchor="middle" fontSize="10">battery</text>
          {mode==="series"?<><line x1="100" x2="180" y1="125" y2="125" stroke="#0f172a" strokeWidth="3"/>{[R1,R2,R3].map((r,i)=>{const x=180+i*150;return <g key={i}><rect x={x} y="105" width="90" height="40" rx="5" fill="white" stroke="#0f172a" strokeWidth="2"/><text x={x+45} y="130" textAnchor="middle" fontSize="12">R{i+1}={r}Ω</text>{i<2&&<line x1={x+90} x2={x+150} y1="125" y2="125" stroke="#0f172a" strokeWidth="3"/>}</g>})}<line x1="630" x2="700" y1="125" y2="125" stroke="#0f172a" strokeWidth="3"/><line x1="700" x2="700" y1="125" y2="205" stroke="#0f172a" strokeWidth="3"/><line x1="700" x2="72" y1="205" y2="205" stroke="#0f172a" strokeWidth="3"/><line x1="72" x2="72" y1="205" y2="165" stroke="#0f172a" strokeWidth="3"/></>:<><line x1="100" x2="170" y1="125" y2="125" stroke="#0f172a" strokeWidth="3"/>{[R1,R2,R3].map((r,i)=>{const y=55+i*70;return <g key={i}><line x1="170" x2="260" y1="125" y2={y+20} stroke="#0f172a" strokeWidth="3"/><rect x="260" y={y} width="100" height="40" rx="5" fill="white" stroke="#0f172a" strokeWidth="2"/><text x="310" y={y+25} textAnchor="middle" fontSize="12">R{i+1}={r}Ω</text><line x1="360" x2="620" y1={y+20} y2={y+20} stroke="#0f172a" strokeWidth="3"/></g>})}<line x1="620" x2="620" y1="75" y2="215" stroke="#0f172a" strokeWidth="3"/><line x1="620" x2="72" y1="215" y2="215" stroke="#0f172a" strokeWidth="3"/><line x1="72" x2="72" y1="215" y2="165" stroke="#0f172a" strokeWidth="3"/></>}
          <text x="380" y="30" textAnchor="middle" fontSize="12" fill="#64748b">I = {fmt(I,3)} A through the equivalent circuit</text>
        </svg>
      </LabCard>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Equivalent R" value={fmt(Req,3)} unit="Ω"/><Stat label="Supply current" value={fmt(I,3)} unit="A"/><Stat label="R₁ voltage" value={fmt(volts[0],3)} unit="V"/><Stat label="R₁ current" value={fmt(currents[0],3)} unit="A"/></div>
    <LabCard title="Power in each resistor"><div className="grid grid-cols-3 gap-3">{[0,1,2].map(i=><Stat key={i} label={`R${i+1} power`} value={fmt(volts[i]*currents[i],3)} unit="W"/>)}</div></LabCard>
  </div>;
}

function RayTool() {
  const [f,setF]=useState(10),[u,setU]=useState(-25),[h,setH]=useState(6),[lens,setLens]=useState<"convex"|"concave">("convex");
  const signedF=lens==="convex"?f:-f;
  const v=1/(1/signedF-1/u);
  const m=v/u;
  const hi=m*h;
  const real=v>0;
  const W=760,H=360,axis=230,origin=380,scale=7;
  const objX=origin+u*scale;
  const imgX=origin+v*scale;
  const objY=axis-h*scale;
  const imgY=axis-hi*scale;
  const F1=origin-signedF*scale,F2=origin+signedF*scale;
  const rayEnd=()=>({x:Math.min(735,Math.max(25,real?imgX:origin+180)),y:real?imgY:axis-hi*scale});
  return <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <LabCard eyebrow="Lens model"><div className="mt-4 space-y-5"><div className="flex gap-2"><SectionButton active={lens==="convex"} onClick={()=>setLens("convex")}>Convex</SectionButton><SectionButton active={lens==="concave"} onClick={()=>setLens("concave")}>Concave</SectionButton></div><Slider label="Focal length" value={f} min={5} max={30} step={1} unit="cm" onChange={setF}/><Slider label="Object distance |u|" value={Math.abs(u)} min={5} max={60} step={1} unit="cm" onChange={v=>setU(-v)}/><Slider label="Object height" value={h} min={2} max={12} step={1} unit="cm" onChange={setH}/></div></LabCard>
      <LabCard title="Dynamic ray diagram" eyebrow="Thin-lens equation">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-slate-50">
          <line x1="20" x2="740" y1={axis} y2={axis} stroke="#94a3b8" strokeWidth="2"/>
          <line x1={origin} x2={origin} y1="60" y2="315" stroke="#0f172a" strokeWidth="5"/>
          <path d={`M${origin-6},${axis-110} Q${origin},${axis-125} ${origin+6},${axis-110}`} fill="none" stroke="#0f172a" strokeWidth="2"/>
          <line x1={F1} x2={F1} y1={axis-10} y2={axis+10} stroke="#0f172a" strokeWidth="2"/><line x1={F2} x2={F2} y1={axis-10} y2={axis+10} stroke="#0f172a" strokeWidth="2"/>
          <text x={F1} y={axis+28} textAnchor="middle" fontSize="11">F</text><text x={F2} y={axis+28} textAnchor="middle" fontSize="11">F′</text>
          <line x1={objX} x2={objX} y1={axis} y2={objY} stroke="#0f172a" strokeWidth="4"/><polygon points={`${objX-6},${objY+10} ${objX+6},${objY+10} ${objX},${objY}`} fill="#0f172a"/>
          <line x1={imgX} x2={imgX} y1={axis} y2={imgY} stroke="#475569" strokeWidth="4" strokeDasharray={real?"":"7 6"}/><polygon points={`${imgX-6},${imgY-10} ${imgX+6},${imgY-10} ${imgX},${imgY}`} fill="#475569"/>
          <line x1={objX} y1={objY} x2={origin} y2={objY} stroke="#64748b" strokeWidth="2"/>
          <line x1={origin} y1={objY} x2={real?imgX:rayEnd().x} y2={real?imgY:rayEnd().y} stroke="#0f172a" strokeWidth="2"/>
          <line x1={objX} y1={objY} x2={imgX} y2={axis} stroke="#64748b" strokeWidth="2"/>
          <text x={objX} y={axis+30} textAnchor="middle" fontSize="10">Object</text><text x={imgX} y={axis+30} textAnchor="middle" fontSize="10">Image</text>
        </svg>
      </LabCard>
    </div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5"><Stat label="Image distance v" value={fmt(v)} unit="cm"/><Stat label="Magnification" value={fmt(m)}/><Stat label="Image height" value={fmt(hi)} unit="cm"/><Stat label="Nature" value={real?"Real":"Virtual"}/><Stat label="Orientation" value={m<0?"Inverted":"Erect"}/></div>
    <LabCard title="Lens relation"><PhysicsEquation>1/f = 1/v − 1/u &nbsp;&nbsp; m = v/u</PhysicsEquation></LabCard>
  </div>;
}

function PhotoelectricTool() {
  const [f0,setF0]=useState(5e14),[frequency,setFrequency]=useState(8e14),[intensity,setIntensity]=useState(60);
  const h=6.626e-34,e=1.602e-19;
  const K=Math.max(0,h*(frequency-f0));
  const stopping=K/e;
  const points=Array.from({length:161},(_,i)=>{const f=f0*.5+i/160*f0*1.8;return{x:f/1e14,y:Math.max(0,h*(f-f0)/e)}});
  const currentPoints=Array.from({length:161},(_,i)=>{const V=-5+i/160*10;return{x:V,y:clamp(intensity*(1-Math.max(0,-V)/Math.max(stopping,1e-6)),0,intensity)}});
  return <div className="space-y-5">
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]"><LabCard eyebrow="Photoelectric controls"><div className="mt-4 space-y-5"><Slider label="Threshold frequency" value={f0/1e14} min={1} max={10} step={.1} unit="×10¹⁴ Hz" onChange={v=>setF0(v*1e14)}/><Slider label="Light frequency" value={frequency/1e14} min={1} max={15} step={.1} unit="×10¹⁴ Hz" onChange={v=>setFrequency(v*1e14)}/><Slider label="Relative intensity" value={intensity} min={10} max={100} step={5} unit="%" onChange={setIntensity}/></div></LabCard><LabCard title="Maximum kinetic energy vs frequency"><Graph points={points} xMin={.5*f0/1e14} xMax={2.3*f0/1e14} yMin={0} yMax={Math.max(1,...points.map(p=>p.y))*1.1} xLabel="Frequency (×10¹⁴ Hz)" yLabel="Kmax (eV)" marker={{x:frequency/1e14,y:K/e}} annotations={[{x:f0/1e14,y:0,label:"Threshold frequency"}]}/></LabCard></div>
    <div className="grid gap-5 lg:grid-cols-2"><LabCard title="Stopping potential"><div className="mt-3"><Graph points={currentPoints} xMin={-5} xMax={5} yMin={0} yMax={Math.max(10,intensity*1.1)} xLabel="Applied voltage (V)" yLabel="Relative photocurrent" marker={{x:-stopping,y:0}}/></div></LabCard><LabCard title="Selected photon"><div className="grid grid-cols-2 gap-3"><Stat label="Photon frequency" value={fmt(frequency/1e14,2)} unit="×10¹⁴ Hz"/><Stat label="Kmax" value={fmt(K/e,3)} unit="eV"/><Stat label="Stopping potential" value={fmt(stopping,3)} unit="V"/><Stat label="Emission" value={frequency>=f0?"Yes":"No"}/></div><p className="mt-3 text-sm leading-6 text-slate-600">Changing intensity changes the available current in this simplified model, while frequency determines photon energy and maximum electron kinetic energy.</p></LabCard></div>
  </div>;
}

function BohrTool() {
  const [n,setN]=useState(3),[target,setTarget]=useState(2);
  const Ei=(level:number)=>-13.6/(level*level);
  const delta=Math.abs(Ei(n)-Ei(target));
  const lambda=delta>0?1239.84/delta:Infinity;
  const W=620,H=360,cx=200,cy=180;
  return <div className="space-y-5"><div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]"><LabCard eyebrow="Hydrogen atom"><div className="mt-4 space-y-5"><Slider label="Initial level n" value={n} min={2} max={6} step={1} onChange={setN}/><Slider label="Final level" value={target} min={1} max={5} step={1} onChange={setTarget}/></div></LabCard><LabCard title="Energy levels and transition" eyebrow={n>target?"Emission":"Absorption"}><svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-slate-50"><text x="420" y="28" textAnchor="middle" fontSize="12" fontWeight="700">Hydrogen energy levels</text>{[1,2,3,4,5,6].map(level=>{const y=55+(level-1)*43;return <g key={level}><line x1="350" x2="560" y1={y} y2={y} stroke="#0f172a" strokeWidth="2"/><text x="330" y={y+4} textAnchor="end" fontSize="11">n={level}</text><text x="570" y={y+4} fontSize="10">{fmt(Ei(level),2)} eV</text></g>})}<circle cx={cx} cy={cy} r={20} fill="#0f172a"/>{[1,2,3,4,5,6].map(level=><circle key={level} cx={cx} cy={cy} r={25+level*17} fill="none" stroke={level===n||level===target?"#0f172a":"#cbd5e1"} strokeWidth={level===n||level===target?3:1.5}/>) }<circle cx={cx} cy={55+(n-1)*43} r="6" fill="#0f172a"/><circle cx={cx} cy={55+(target-1)*43} r="6" fill="#64748b"/><path d={`M${cx+210},${55+(n-1)*43} C${cx+250},${55+(n-1)*43} ${cx+250},${55+(target-1)*43} ${cx+210},${55+(target-1)*43}`} fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="6 5"/></svg></LabCard></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="E initial" value={fmt(Ei(n),3)} unit="eV"/><Stat label="E final" value={fmt(Ei(target),3)} unit="eV"/><Stat label="Photon energy" value={fmt(delta,3)} unit="eV"/><Stat label="Wavelength" value={fmt(lambda,2)} unit="nm"/></div><LabCard title="Bohr relations"><PhysicsEquation>Eₙ = −13.6/n² eV &nbsp;&nbsp; ΔE = hf = hc/λ</PhysicsEquation></LabCard></div>;
}

function SemiconductorTool() {
  const [Is,setIs]=useState(0.001),[n,setN]=useState(2),[V,setV]=useState(.7),[T,setT]=useState(300);
  const e=1.602e-19,k=1.381e-23;
  const current=(voltage:number)=>Is*(Math.exp(clamp(voltage, -1, 1.2)*e/(n*k*T))-1);
  const points=Array.from({length:181},(_,i)=>{const v=-.5+i/180*1.7;return{x:v,y:clamp(current(v)*1000,-10,100)}});
  const I=current(V);
  return <div className="space-y-5"><div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]"><LabCard eyebrow="Diode model"><div className="mt-4 space-y-5"><Slider label="Saturation current Is" value={Is*1000} min={.001} max={5} step={.001} unit="mA" onChange={v=>setIs(v/1000)}/><Slider label="Ideality factor n" value={n} min={1} max={2} step={.1} onChange={setN}/><Slider label="Bias voltage" value={V} min={-.5} max={1.2} step={.01} unit="V" onChange={setV}/><Slider label="Temperature" value={T} min={250} max={400} step={5} unit="K" onChange={setT}/></div></LabCard><LabCard title="Diode I–V characteristic" eyebrow="Shockley model"><Graph points={points} xMin={-.5} xMax={1.2} yMin={-10} yMax={100} xLabel="Bias voltage (V)" yLabel="Current (mA)" marker={{x:V,y:clamp(I*1000,-10,100)}}/></LabCard></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="Bias" value={fmt(V,3)} unit="V"/><Stat label="Current" value={fmt(I*1000,3)} unit="mA"/><Stat label="Power" value={fmt(V*I*1000,3)} unit="mW"/><Stat label="Temperature" value={fmt(T)} unit="K"/></div><LabCard title="Model"><PhysicsEquation>I = Iₛ [exp(qV/nkT) − 1]</PhysicsEquation><p className="mt-3 text-xs text-slate-500">This is an idealized diode model. Real device curves depend on device construction and measurement conditions.</p></LabCard></div>;
}

function EMIACCTool() {
  const [V0,setV0]=useState(230),[f,setF]=useState(50),[phase,setPhase]=useState(0),[R,setR]=useState(100);
  const omega=2*Math.PI*f,phi=phase*Math.PI/180;
  const period=1/f;
  const points=Array.from({length:241},(_,i)=>{const t=i/240*3*period;return{x:t*1000,v:V0*Math.sin(omega*t+phi),i:(V0/R)*Math.sin(omega*t+phi)}});
  const t=period*.25, v=V0*Math.sin(omega*t+phi),cur=v/R;
  return <div className="space-y-5"><div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]"><LabCard eyebrow="AC controls"><div className="mt-4 space-y-5"><Slider label="Peak voltage" value={V0} min={10} max={400} step={5} unit="V" onChange={setV0}/><Slider label="Frequency" value={f} min={1} max={100} step={1} unit="Hz" onChange={setF}/><Slider label="Phase" value={phase} min={-180} max={180} step={5} unit="°" onChange={setPhase}/><Slider label="Resistance" value={R} min={10} max={500} step={10} unit="Ω" onChange={setR}/></div></LabCard><LabCard title="Voltage and current" eyebrow="Ohmic load"><Graph curves={[{id:"V",label:"Voltage",points:points.map(p=>({x:p.x,y:p.v}))},{id:"I",label:"Current × R",points:points.map(p=>({x:p.x,y:p.i*R})),dash:"7 5"}]} xMin={0} xMax={3*period*1000} yMin={-V0*1.15} yMax={V0*1.15} xLabel="Time (ms)" yLabel="Amplitude (V-equivalent)"/></LabCard></div><div className="grid grid-cols-2 gap-3 md:grid-cols-5"><Stat label="Peak V" value={fmt(V0)} unit="V"/><Stat label="RMS V" value={fmt(V0/Math.sqrt(2))} unit="V"/><Stat label="Frequency" value={fmt(f)} unit="Hz"/><Stat label="Period" value={fmt(period*1000,3)} unit="ms"/><Stat label="RMS I" value={fmt(V0/(Math.sqrt(2)*R),3)} unit="A"/></div></div>;
}

function WaveOpticsTool() {
  const [lambda,setLambda]=useState(600),[d,setD]=useState(.5),[D,setDscreen]=useState(2);
  const beta=lambda*1e-9*D/(d*1e-3);
  const xs=Array.from({length:241},(_,i)=>-6+i/240*12);
  const pattern=xs.map(x=>{const y=x*beta;return{x,y:Math.pow(Math.cos(Math.PI*x),2)}});
  return <div className="space-y-5"><div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]"><LabCard eyebrow="Young's double slit"><div className="mt-4 space-y-5"><Slider label="Wavelength λ" value={lambda} min={350} max={750} step={10} unit="nm" onChange={setLambda}/><Slider label="Slit separation d" value={d} min={.1} max={2} step={.05} unit="mm" onChange={setD}/><Slider label="Screen distance D" value={D} min={.5} max={5} step={.1} unit="m" onChange={setDscreen}/></div></LabCard><LabCard title="Interference intensity" eyebrow="Bright and dark fringes"><Graph points={pattern} xMin={-6} xMax={6} yMin={0} yMax={1.05} xLabel="Position / fringe spacing β" yLabel="Relative intensity"/></LabCard></div><div className="grid grid-cols-2 gap-3 md:grid-cols-3"><Stat label="Fringe width β" value={fmt(beta*1000,3)} unit="mm"/><Stat label="Wavelength" value={fmt(lambda)} unit="nm"/><Stat label="Slit separation" value={fmt(d,2)} unit="mm"/></div><LabCard title="Double-slit relation"><PhysicsEquation>β = λD/d</PhysicsEquation><p className="mt-3 text-sm text-slate-600">The pattern is plotted in units of fringe spacing so changing λ, D or d changes the physical fringe width.</p></LabCard></div>;
}

function MagneticTool() {
  const [I,setI]=useState(5),[r,setR]=useState(.2),[charge,setCharge]=useState(1),[speed,setSpeed]=useState(2e6);
  const mu0=4*Math.PI*1e-7;
  const B=mu0*I/(2*Math.PI*r);
  const force=charge*1.602e-19*speed*B;
  const radius=charge*1.602e-19>0?charge*1.602e-19*speed/(Math.max(Math.abs(charge*1.602e-19)*B,1e-30)):Infinity;
  const W=620,H=360,cx=310,cy=180;
  return <div className="space-y-5"><div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]"><LabCard eyebrow="Magnetic-field explorer"><div className="mt-4 space-y-5"><Slider label="Wire current I" value={I} min={.1} max={20} step={.1} unit="A" onChange={setI}/><Slider label="Distance r" value={r} min={.02} max={1} step={.01} unit="m" onChange={setR}/><Slider label="Particle speed" value={speed/1e6} min={.1} max={10} step={.1} unit="×10⁶ m/s" onChange={v=>setSpeed(v*1e6)}/></div></LabCard><LabCard title="Field around a straight current-carrying wire" eyebrow="Right-hand rule"><svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl bg-slate-50">{Array.from({length:6},(_,i)=>{const rr=35+i*28;return <circle key={i} cx={cx} cy={cy} r={rr} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 6"/>})}<circle cx={cx} cy={cy} r="16" fill="#0f172a"/><text x={cx} y={cy+5} textAnchor="middle" fontSize="15" fontWeight="700" fill="white">⊙</text><text x={cx} y="330" textAnchor="middle" fontSize="11" fill="#64748b">Current out of the page → B circulates anticlockwise</text></svg></LabCard></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="B" value={fmt(B*1e6,3)} unit="μT"/><Stat label="Magnetic force" value={fmt(force,3)} unit="N"/><Stat label="Speed" value={fmt(speed/1e6,2)} unit="×10⁶ m/s"/><Stat label="Orbit radius qvB" value={fmt(radius,3)} unit="m"/></div><LabCard title="Relations"><div className="grid gap-3 md:grid-cols-2"><PhysicsEquation>B = μ₀I/(2πr)</PhysicsEquation><PhysicsEquation>F = qvB sinθ</PhysicsEquation></div></LabCard></div>;
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
