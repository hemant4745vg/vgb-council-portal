"use client";

import { useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };
type Curve = {
  id: string;
  label: string;
  color: string;
  fn: (x: number) => number;
  dashed?: boolean;
};

type Preset = {
  id: string;
  title: string;
  className: "XI" | "XII" | "Statistics";
  unit: string;
  description: string;
  xLabel: string;
  yLabel: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  curves: (controls: Record<string, number>) => Curve[];
  controls: { key: string; label: string; min: number; max: number; step: number; value: number }[];
  interpretation: string[];
};

const curveColors = ["#2563eb", "#dc2626", "#16a34a", "#9333ea"];

const presets: Preset[] = [
  {
    id: "demand-supply",
    title: "Demand, Supply & Market Equilibrium",
    className: "XI",
    unit: "Price Determination",
    description: "Move demand and supply to see equilibrium price and quantity change.",
    xLabel: "Quantity",
    yLabel: "Price",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "dShift", label: "Demand shift", min: -25, max: 25, step: 1, value: 0 },
      { key: "sShift", label: "Supply shift", min: -25, max: 25, step: 1, value: 0 },
    ],
    curves: c => [
      { id: "d", label: "Demand", color: curveColors[0], fn: x => 90 - 0.75 * x + c.dShift },
      { id: "s", label: "Supply", color: curveColors[1], fn: x => 10 + 0.65 * x + c.sShift },
    ],
    interpretation: [
      "A rightward demand shift raises equilibrium price and quantity in this model.",
      "A rightward supply shift lowers equilibrium price and raises equilibrium quantity.",
      "The intersection of demand and supply gives market equilibrium.",
    ],
  },
  {
    id: "price-ceiling",
    title: "Price Ceiling",
    className: "XI",
    unit: "Government Intervention",
    description: "Set a maximum legal price and observe the resulting shortage.",
    xLabel: "Quantity",
    yLabel: "Price",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [{ key: "ceiling", label: "Maximum price", min: 10, max: 80, step: 1, value: 45 }],
    curves: c => [
      { id: "d", label: "Demand", color: curveColors[0], fn: x => 90 - 0.75 * x },
      { id: "s", label: "Supply", color: curveColors[1], fn: x => 10 + 0.65 * x },
      { id: "ceiling", label: "Price ceiling", color: curveColors[2], fn: () => c.ceiling, dashed: true },
    ],
    interpretation: [
      "A binding price ceiling is below the equilibrium price.",
      "At the controlled price, quantity demanded exceeds quantity supplied.",
      "The horizontal gap between Qd and Qs represents the shortage.",
    ],
  },
  {
    id: "price-floor",
    title: "Price Floor",
    className: "XI",
    unit: "Government Intervention",
    description: "Set a minimum legal price and observe the resulting surplus.",
    xLabel: "Quantity",
    yLabel: "Price",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [{ key: "floor", label: "Minimum price", min: 20, max: 90, step: 1, value: 65 }],
    curves: c => [
      { id: "d", label: "Demand", color: curveColors[0], fn: x => 90 - 0.75 * x },
      { id: "s", label: "Supply", color: curveColors[1], fn: x => 10 + 0.65 * x },
      { id: "floor", label: "Price floor", color: curveColors[2], fn: () => c.floor, dashed: true },
    ],
    interpretation: [
      "A binding price floor is above the equilibrium price.",
      "At the controlled price, quantity supplied exceeds quantity demanded.",
      "The horizontal gap between Qs and Qd represents the surplus.",
    ],
  },
  {
    id: "ppc",
    title: "Production Possibility Curve",
    className: "XI",
    unit: "Introduction to Microeconomics",
    description: "Explore scarcity, efficiency, opportunity cost and unattainable combinations.",
    xLabel: "Good X", yLabel: "Good Y",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [{ key: "curvature", label: "Curvature", min: 0.55, max: 1.8, step: 0.05, value: 1 }],
    curves: c => [
      { id: "ppc", label: "PPC", color: curveColors[0], fn: x => 100 * Math.pow(Math.max(0, 1 - x / 100), c.curvature) },
    ],
    interpretation: [
      "Points on the PPC represent efficient combinations in this simple model.",
      "Points inside are attainable but inefficient; points outside are unattainable with current resources and technology.",
      "The slope represents the opportunity cost of producing more of the horizontal-axis good.",
    ],
  },
  {
    id: "budget-line",
    title: "Budget Line",
    className: "XI",
    unit: "Consumer Equilibrium",
    description: "Change income and the relative price of X to see the budget constraint move.",
    xLabel: "Good X", yLabel: "Good Y",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "income", label: "Income", min: 60, max: 160, step: 1, value: 100 },
      { key: "px", label: "Price of X", min: 0.6, max: 2, step: 0.05, value: 1 },
      { key: "py", label: "Price of Y", min: 0.6, max: 2, step: 0.05, value: 1 },
    ],
    curves: c => [
      { id: "budget", label: "Budget line", color: curveColors[0], fn: x => (c.income - c.px * x) / c.py },
    ],
    interpretation: [
      "Income changes shift the budget line parallel to itself.",
      "Changing the price of X rotates the budget line around the Y-intercept.",
      "The slope reflects the relative prices of the two goods.",
    ],
  },
  {
    id: "indifference",
    title: "Indifference Curve",
    className: "XI",
    unit: "Consumer Equilibrium",
    description: "Explore a family of indifference curves and diminishing marginal rate of substitution.",
    xLabel: "Good X", yLabel: "Good Y",
    xMin: 1, xMax: 100, yMin: 1, yMax: 100,
    controls: [{ key: "utility", label: "Utility level", min: 10, max: 80, step: 1, value: 35 }],
    curves: c => [
      { id: "ic", label: "Indifference curve", color: curveColors[2], fn: x => Math.pow(c.utility / Math.pow(x, 0.5), 2) },
    ],
    interpretation: [
      "Each point on an indifference curve represents the same utility level in this model.",
      "The downward slope reflects a trade-off between the two goods.",
      "The curve is convex to the origin under standard preferences.",
    ],
  },
  {
    id: "consumer-equilibrium",
    title: "Consumer Equilibrium",
    className: "XI",
    unit: "Consumer Equilibrium",
    description: "See the tangency between a budget line and an indifference curve.",
    xLabel: "Good X", yLabel: "Good Y",
    xMin: 1, xMax: 100, yMin: 1, yMax: 100,
    controls: [
      { key: "income", label: "Income", min: 70, max: 150, step: 1, value: 100 },
      { key: "px", label: "Price of X", min: 0.8, max: 1.6, step: 0.05, value: 1 },
      { key: "py", label: "Price of Y", min: 0.8, max: 1.6, step: 0.05, value: 1 },
    ],
    curves: c => [
      { id: "budget", label: "Budget line", color: curveColors[0], fn: x => (c.income - c.px * x) / c.py },
      { id: "ic", label: "Indifference curve", color: curveColors[2], fn: x => Math.max(1, 55 / Math.sqrt(Math.max(x, 1))) ** 2 },
    ],
    interpretation: [
      "Consumer equilibrium is represented here by the tangency condition between the budget line and an indifference curve.",
      "At an interior tangency, MRS is equal to the price ratio.",
    ],
  },
  {
    id: "tp-ap-mp",
    title: "TP, AP & MP",
    className: "XI",
    unit: "Producer Behaviour",
    description: "Visualise the relationship between total, average and marginal product.",
    xLabel: "Variable input", yLabel: "Product",
    xMin: 0, xMax: 12, yMin: 0, yMax: 100,
    controls: [{ key: "productivity", label: "Productivity", min: 0.7, max: 1.5, step: 0.05, value: 1 }],
    curves: c => [
      { id: "tp", label: "TP", color: curveColors[0], fn: x => c.productivity * (24 * x - 1.6 * x * x) },
      { id: "ap", label: "AP", color: curveColors[1], fn: x => x <= 0 ? 0 : c.productivity * (24 - 1.6 * x) },
      { id: "mp", label: "MP", color: curveColors[2], fn: x => c.productivity * (24 - 3.2 * x) },
    ],
    interpretation: [
      "MP is the change in total product caused by one more unit of the variable input.",
      "When MP exceeds AP, AP rises; when MP is below AP, AP falls.",
      "MP intersects AP at AP's maximum in the standard textbook relationship.",
    ],
  },
  {
    id: "cost-curves",
    title: "Cost Curves",
    className: "XI",
    unit: "Producer Behaviour",
    description: "Compare AFC, AVC, AC and MC as output changes.",
    xLabel: "Output", yLabel: "Cost",
    xMin: 1, xMax: 100, yMin: 0, yMax: 100,
    controls: [{ key: "fixed", label: "Fixed cost", min: 10, max: 50, step: 1, value: 25 }],
    curves: c => [
      { id: "afc", label: "AFC", color: curveColors[0], fn: x => c.fixed / x * 100 },
      { id: "avc", label: "AVC", color: curveColors[1], fn: x => 18 + 0.008 * (x - 45) ** 2 },
      { id: "ac", label: "AC", color: curveColors[2], fn: x => c.fixed / x * 100 + 18 + 0.008 * (x - 45) ** 2 },
      { id: "mc", label: "MC", color: curveColors[3], fn: x => 12 + 0.018 * (x - 30) ** 2 },
    ],
    interpretation: [
      "AFC falls continuously as fixed cost is spread over more units.",
      "AC = AFC + AVC.",
      "MC intersects AVC and AC at their respective minimum points in the standard model.",
    ],
  },
  {
    id: "revenue",
    title: "TR, AR & MR under Perfect Competition",
    className: "XI",
    unit: "Producer Behaviour",
    description: "See why AR and MR coincide with price for a perfectly competitive firm.",
    xLabel: "Output", yLabel: "Revenue",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [{ key: "price", label: "Price", min: 20, max: 80, step: 1, value: 50 }],
    curves: c => [
      { id: "tr", label: "TR", color: curveColors[0], fn: x => Math.min(100, c.price * x / 80) },
      { id: "ar", label: "AR", color: curveColors[1], fn: () => c.price },
      { id: "mr", label: "MR", color: curveColors[2], fn: () => c.price },
    ],
    interpretation: [
      "Under perfect competition, price is constant for the individual firm.",
      "Therefore AR = MR = Price.",
      "TR rises linearly with output when price is constant.",
    ],
  },
  {
    id: "consumption-saving",
    title: "Consumption & Saving Functions",
    className: "XII",
    unit: "Determination of Income and Employment",
    description: "Explore consumption, autonomous consumption and saving as income changes.",
    xLabel: "Income", yLabel: "Consumption / Saving",
    xMin: 0, xMax: 100, yMin: -40, yMax: 100,
    controls: [
      { key: "autonomous", label: "Autonomous consumption", min: 5, max: 30, step: 1, value: 15 },
      { key: "mpc", label: "MPC", min: 0.5, max: 0.9, step: 0.01, value: 0.75 },
    ],
    curves: c => [
      { id: "c", label: "Consumption", color: curveColors[0], fn: x => c.autonomous + c.mpc * x },
      { id: "s", label: "Saving", color: curveColors[1], fn: x => x - (c.autonomous + c.mpc * x) },
      { id: "45", label: "45° line", color: "#64748b", fn: x => x, dashed: true },
    ],
    interpretation: [
      "Consumption = autonomous consumption + MPC × income.",
      "Saving is income minus consumption.",
      "The 45° line helps identify the income level at which consumption equals income.",
    ],
  },
  {
    id: "income-equilibrium",
    title: "Equilibrium Income & Aggregate Demand",
    className: "XII",
    unit: "Determination of Income and Employment",
    description: "Change autonomous expenditure and MPC to see the equilibrium income move.",
    xLabel: "Income", yLabel: "Aggregate expenditure",
    xMin: 0, xMax: 120, yMin: 0, yMax: 120,
    controls: [
      { key: "autonomous", label: "Autonomous expenditure", min: 10, max: 50, step: 1, value: 25 },
      { key: "mpc", label: "MPC", min: 0.5, max: 0.9, step: 0.01, value: 0.75 },
    ],
    curves: c => [
      { id: "ad", label: "AD / AE", color: curveColors[0], fn: x => c.autonomous + c.mpc * x },
      { id: "45", label: "45° line", color: "#64748b", fn: x => x, dashed: true },
    ],
    interpretation: [
      "Equilibrium income occurs where planned aggregate expenditure equals output.",
      "A higher autonomous expenditure shifts the AD line upward and increases equilibrium income in this model.",
      "The multiplier is related to the slope of the expenditure function through MPC.",
    ],
  },
  {
    id: "multiplier",
    title: "Investment Multiplier",
    className: "XII",
    unit: "Determination of Income and Employment",
    description: "Compare an initial investment change with the resulting change in equilibrium income.",
    xLabel: "MPC", yLabel: "Multiplier",
    xMin: 0.4, xMax: 0.95, yMin: 0, yMax: 25,
    controls: [{ key: "investment", label: "Investment change", min: 5, max: 30, step: 1, value: 10 }],
    curves: c => [
      { id: "k", label: "Multiplier", color: curveColors[0], fn: x => 1 / (1 - x) },
    ],
    interpretation: [
      "In the simple model, k = 1 / (1 − MPC).",
      "A higher MPC produces a larger multiplier.",
      "The final income change is k × the initial autonomous investment change.",
    ],
  },
  {
    id: "money-demand",
    title: "Money Demand & Money Supply",
    className: "XII",
    unit: "Money and Banking",
    description: "Explore a downward-sloping money-demand curve and a fixed nominal money supply.",
    xLabel: "Quantity of Money", yLabel: "Interest rate",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [{ key: "supply", label: "Money supply", min: 25, max: 85, step: 1, value: 55 }],
    curves: c => [
      { id: "md", label: "Money demand", color: curveColors[0], fn: x => 92 - 0.85 * x },
      { id: "ms", label: "Money supply", color: curveColors[1], fn: () => c.supply, dashed: true },
    ],
    interpretation: [
      "In the standard liquidity-preference diagram, money demand falls as the interest rate rises.",
      "A fixed nominal money supply is represented by a vertical line when money quantity is on the horizontal axis.",
      "The intersection determines the equilibrium interest rate.",
    ],
  },
  {
    id: "forex",
    title: "Foreign Exchange Demand & Supply",
    className: "XII",
    unit: "Balance of Payments",
    description: "Explore exchange-rate determination using demand and supply of foreign currency.",
    xLabel: "Quantity of Foreign Exchange", yLabel: "Exchange rate",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "dShift", label: "Demand shift", min: -20, max: 20, step: 1, value: 0 },
      { key: "sShift", label: "Supply shift", min: -20, max: 20, step: 1, value: 0 },
    ],
    curves: c => [
      { id: "d", label: "Demand for FX", color: curveColors[0], fn: x => 88 - 0.7 * x + c.dShift },
      { id: "s", label: "Supply of FX", color: curveColors[1], fn: x => 12 + 0.65 * x + c.sShift },
    ],
    interpretation: [
      "The exchange rate is determined by demand and supply in a flexible-rate model.",
      "An increase in demand for foreign currency shifts the demand curve rightward.",
      "An increase in supply of foreign currency shifts the supply curve rightward.",
    ],
  },
];

function niceStep(range: number) {
  const raw = range / 8;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  const base = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return base * p;
}

function ticks(min: number, max: number) {
  const step = niceStep(max - min);
  const result: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 0.001; v += step) {
    result.push(Number(v.toFixed(8)));
  }
  return result;
}

function fmt(n: number) {
  if (!Number.isFinite(n)) return "";
  if (Math.abs(n) < 1e-9) return "0";
  return Number(n.toPrecision(5)).toString();
}

function sampleCurve(curve: Curve, p: Preset, W: number, H: number, P: number) {
  const pts: Point[] = [];
  for (let i = 0; i <= 700; i++) {
    const x = p.xMin + (i / 700) * (p.xMax - p.xMin);
    const y = curve.fn(x);
    if (!Number.isFinite(y) || y < p.yMin - (p.yMax - p.yMin) || y > p.yMax + (p.yMax - p.yMin)) {
      pts.push({ x: NaN, y: NaN });
    } else pts.push({ x, y });
  }
  return pts;
}

function intersections(curves: Curve[], p: Preset): Point[] {
  const out: Point[] = [];
  for (let a = 0; a < curves.length; a++) {
    for (let b = a + 1; b < curves.length; b++) {
      let prevX = p.xMin;
      let prevD = curves[a].fn(prevX) - curves[b].fn(prevX);
      for (let i = 1; i <= 500; i++) {
        const x = p.xMin + (i / 500) * (p.xMax - p.xMin);
        const d = curves[a].fn(x) - curves[b].fn(x);
        if (Number.isFinite(prevD) && Number.isFinite(d) && prevD * d <= 0) {
          const t = Math.abs(prevD) / (Math.abs(prevD) + Math.abs(d) || 1);
          const ix = prevX + (x - prevX) * t;
          const y = curves[a].fn(ix);
          if (Number.isFinite(y) && y >= p.yMin && y <= p.yMax) {
            if (!out.some(q => Math.abs(q.x - ix) < (p.xMax - p.xMin) / 80 && Math.abs(q.y - y) < (p.yMax - p.yMin) / 80)) {
              out.push({ x: ix, y });
            }
          }
        }
        prevX = x;
        prevD = d;
      }
    }
  }
  return out.slice(0, 8);
}

function EconomicsGraph({
  preset,
  controls,
  setControls,
}: {
  preset: Preset;
  controls: Record<string, number>;
  setControls: (v: Record<string, number>) => void;
}) {
  const [hover, setHover] = useState<{ x: number; y: number; label: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);

  const W = 900, H = 560, P = 62;
  const xRange = (preset.xMax - preset.xMin) / zoom;
  const yRange = (preset.yMax - preset.yMin) / zoom;
  const xMid = (preset.xMin + preset.xMax) / 2 + pan.x;
  const yMid = (preset.yMin + preset.yMax) / 2 + pan.y;
  const view = {
    xMin: xMid - xRange / 2,
    xMax: xMid + xRange / 2,
    yMin: yMid - yRange / 2,
    yMax: yMid + yRange / 2,
  };

  const mapX = (x: number) => P + ((x - view.xMin) / (view.xMax - view.xMin)) * (W - 2 * P);
  const mapY = (y: number) => H - P - ((y - view.yMin) / (view.yMax - view.yMin)) * (H - 2 * P);
  const unmapX = (sx: number) => view.xMin + ((sx - P) / (W - 2 * P)) * (view.xMax - view.xMin);
  const unmapY = (sy: number) => view.yMax - ((sy - P) / (H - 2 * P)) * (view.yMax - view.yMin);

  const curves = useMemo(() => preset.curves(controls), [preset, controls]);
  const xs = ticks(view.xMin, view.xMax);
  const ys = ticks(view.yMin, view.yMax);
  const points = useMemo(() => intersections(curves, preset), [curves, preset]);

  const pathFor = (curve: Curve) => {
    const sampled = sampleCurve(curve, { ...preset, xMin: view.xMin, xMax: view.xMax, yMin: view.yMin, yMax: view.yMax }, W, H, P);
    const d: string[] = [];
    let drawing = false;
    sampled.forEach(pt => {
      if (!Number.isFinite(pt.x)) { drawing = false; return; }
      const sx = mapX(pt.x), sy = mapY(pt.y);
      if (!Number.isFinite(sy) || sy < -1000 || sy > H + 1000) { drawing = false; return; }
      if (!drawing) { d.push(`M ${sx.toFixed(2)} ${sy.toFixed(2)}`); drawing = true; }
      else d.push(`L ${sx.toFixed(2)} ${sy.toFixed(2)}`);
    });
    return d.join(" ");
  };

  const reset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none select-none"
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY }; }}
          onPointerMove={e => {
            if (!drag.current) return;
            const dx = e.clientX - drag.current.x;
            const dy = e.clientY - drag.current.y;
            const unitX = (view.xMax - view.xMin) / (W - 2 * P);
            const unitY = (view.yMax - view.yMin) / (H - 2 * P);
            setPan(v => ({ x: v.x - dx * unitX, y: v.y + dy * unitY }));
            drag.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}
          onWheel={e => { e.preventDefault(); setZoom(z => Math.max(0.5, Math.min(4, z * (e.deltaY < 0 ? 1.12 : 0.89)))); }}
        >
          <rect width={W} height={H} fill="white" />
          {xs.map(x => (
            <g key={`x-${x}`}>
              <line x1={mapX(x)} x2={mapX(x)} y1={P} y2={H-P} stroke="#e2e8f0" />
              <text x={mapX(x)} y={H-P+20} textAnchor="middle" fontSize="12" fill="#64748b">{fmt(x)}</text>
            </g>
          ))}
          {ys.map(y => (
            <g key={`y-${y}`}>
              <line x1={P} x2={W-P} y1={mapY(y)} y2={mapY(y)} stroke="#e2e8f0" />
              <text x={P-12} y={mapY(y)+4} textAnchor="end" fontSize="12" fill="#64748b">{fmt(y)}</text>
            </g>
          ))}

          {view.xMin <= 0 && view.xMax >= 0 && <line x1={mapX(0)} x2={mapX(0)} y1={P} y2={H-P} stroke="#334155" strokeWidth="2" />}
          {view.yMin <= 0 && view.yMax >= 0 && <line x1={P} x2={W-P} y1={mapY(0)} y2={mapY(0)} stroke="#334155" strokeWidth="2" />}

          <text x={W/2} y={H-12} textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155">{preset.xLabel}</text>
          <text x={18} y={H/2} textAnchor="middle" fontSize="14" fontWeight="600" fill="#334155" transform={`rotate(-90 18 ${H/2})`}>{preset.yLabel}</text>

          {curves.map(curve => (
            <path
              key={curve.id}
              d={pathFor(curve)}
              fill="none"
              stroke={curve.color}
              strokeWidth="3"
              strokeDasharray={curve.dashed ? "9 7" : undefined}
              strokeLinecap="round"
            />
          ))}

          {points.map((pt, i) => (
            <g key={`p-${i}`}>
              <line x1={mapX(pt.x)} x2={mapX(pt.x)} y1={mapY(pt.y)} y2={mapY(0)} stroke="#94a3b8" strokeDasharray="4 4" />
              <line x1={mapX(pt.x)} x2={mapX(0)} y1={mapY(pt.y)} y2={mapY(pt.y)} stroke="#94a3b8" strokeDasharray="4 4" />
              <circle
                cx={mapX(pt.x)} cy={mapY(pt.y)} r="6" fill="#0f172a" stroke="white" strokeWidth="2"
                onPointerEnter={() => setHover({ x: pt.x, y: pt.y, label: "Intersection / equilibrium" })}
                onPointerLeave={() => setHover(null)}
              />
            </g>
          ))}

          <rect
            x={P} y={P} width={W-2*P} height={H-2*P}
            fill="transparent"
            onPointerMove={e => {
              const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
              const sx = (e.clientX - rect.left) * W / rect.width;
              const sy = (e.clientY - rect.top) * H / rect.height;
              const x = unmapX(sx), y = unmapY(sy);
              let nearest: {curve: Curve; y: number; d: number} | null = null;
              curves.forEach(curve => {
                const cy = curve.fn(x);
                const d = Math.abs(mapY(cy) - sy);
                if (Number.isFinite(cy) && (!nearest || d < nearest.d)) nearest = { curve, y: cy, d };
              });
              if (nearest && nearest.d < 18) setHover({ x, y: nearest.y, label: nearest.curve.label });
              else setHover(null);
            }}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        <div className="absolute left-3 top-3 flex gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm">
          <button className="h-9 w-9 rounded-lg hover:bg-slate-100" onClick={() => setZoom(z => Math.min(4, z*1.15))}>+</button>
          <button className="h-9 w-9 rounded-lg hover:bg-slate-100" onClick={() => setZoom(z => Math.max(.5, z*.87))}>−</button>
          <button className="rounded-lg px-3 text-xs font-semibold hover:bg-slate-100" onClick={reset}>Reset</button>
        </div>

        {hover && (
          <div className="pointer-events-none absolute right-3 top-3 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg">
            <div className="font-semibold text-slate-900">{hover.label}</div>
            <div className="mt-1 font-mono text-slate-600">Q = {fmt(hover.x)} · P = {fmt(hover.y)}</div>
          </div>
        )}

        <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] text-slate-500 shadow-sm">
          Drag to pan · scroll to zoom · hover intersections
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold">Controls</h3>
        <div className="mt-4 space-y-4">
          {preset.controls.map(control => (
            <label key={control.key} className="block">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>{control.label}</span>
                <span className="font-mono text-slate-900">{fmt(controls[control.key])}</span>
              </div>
              <input
                className="mt-2 w-full accent-slate-900"
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={controls[control.key]}
                onChange={e => setControls({ ...controls, [control.key]: Number(e.target.value) })}
              />
            </label>
          ))}
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Curves</h4>
          <div className="mt-3 space-y-2">
            {curves.map(curve => (
              <div key={curve.id} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-7 rounded-full" style={{ background: curve.color }} />
                <span>{curve.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">What to observe</h4>
          <ul className="mt-2 space-y-2 text-sm leading-5 text-slate-600">
            {preset.interpretation.map(item => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function StatChart() {
  const [kind, setKind] = useState<"bar"|"pie"|"histogram"|"scatter"|"ogive">("bar");
  const data = [18, 24, 31, 27, 39, 46, 52, 49, 61, 68];
  const W = 900, H = 460, P = 60;
  const max = Math.max(...data);
  const bins = data.map((v,i) => ({ x: i+1, y: v }));
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {(["bar","histogram","ogive","scatter","pie"] as const).map(k => (
          <button key={k} onClick={() => setKind(k)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${kind===k ? "bg-slate-950 text-white":"bg-slate-100 text-slate-700"}`}>{k}</button>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full bg-white">
          {Array.from({length:6},(_,i)=> {
            const y=i*max/5;
            const sy=H-P-(y/max)*(H-2*P);
            return <g key={i}><line x1={P} x2={W-P} y1={sy} y2={sy} stroke="#e2e8f0"/><text x={P-10} y={sy+4} textAnchor="end" fontSize="11" fill="#64748b">{Math.round(y)}</text></g>;
          })}
          {kind === "bar" && bins.map(d => {
            const bw=(W-2*P)/data.length*.7, x=P+(d.x-.5)*(W-2*P)/data.length-bw/2, h=d.y/max*(H-2*P);
            return <g key={d.x}><rect x={x} y={H-P-h} width={bw} height={h} fill="#2563eb"/><text x={x+bw/2} y={H-P+18} textAnchor="middle" fontSize="11" fill="#64748b">{d.x}</text></g>
          })}
          {kind === "histogram" && bins.map(d => {
            const bw=(W-2*P)/data.length, x=P+(d.x-1)*bw, h=d.y/max*(H-2*P);
            return <rect key={d.x} x={x} y={H-P-h} width={bw} height={h} fill="#16a34a" stroke="white"/>
          })}
          {kind === "scatter" && bins.map(d => <circle key={d.x} cx={P+(d.x-1)*(W-2*P)/(data.length-1)} cy={H-P-d.y/max*(H-2*P)} r="6" fill="#9333ea"/>)}
          {kind === "ogive" && <polyline fill="none" stroke="#dc2626" strokeWidth="3" points={bins.map(d=>`${P+(d.x-1)*(W-2*P)/(data.length-1)},${H-P-d.y/max*(H-2*P)}`).join(" ")}/>}
          {kind === "pie" && (() => {
            const total=data.reduce((a,b)=>a+b,0); let a=-Math.PI/2; const cx=W/2,cy=H/2,r=150;
            return data.slice(0,5).map((v,i)=>{const b=a+v/total*Math.PI*2; const x1=cx+r*Math.cos(a),y1=cy+r*Math.sin(a),x2=cx+r*Math.cos(b),y2=cy+r*Math.sin(b); const large=b-a>Math.PI; const path=`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large?1:0} 1 ${x2} ${y2} Z`; a=b; return <path key={i} d={path} fill={curveColors[i%curveColors.length]}/>});
          })()}
        </svg>
      </div>
      <p className="mt-3 text-xs text-slate-500">Illustrative dataset for exploring presentation forms. Replace with student data in the production data-input version.</p>
    </div>
  );
}

export default function EconomicsGraphLabPage() {
  const [section, setSection] = useState<"XI"|"XII"|"Statistics">("XI");
  const [selected, setSelected] = useState("demand-supply");
  const preset = presets.find(p => p.id === selected) ?? presets[0];
  const [controlValues, setControlValues] = useState<Record<string, number>>(
    Object.fromEntries(preset.controls.map(c => [c.key, c.value]))
  );

  const choose = (id: string) => {
    const p = presets.find(x => x.id === id);
    if (!p) return;
    setSelected(id);
    setControlValues(Object.fromEntries(p.controls.map(c => [c.key, c.value])));
  };

  const list = presets.filter(p => p.className === section);

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">VGB Tools · Economics</div>
          <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Economics Graph Lab</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Interactive CBSE Class XI–XII economics graphs. Shift curves, change assumptions, inspect intersections and practise the diagrams you actually have to draw in an exam.
              </p>
            </div>
            <div className="flex gap-2">
              {(["XI","XII","Statistics"] as const).map(s => (
                <button key={s} onClick={() => { setSection(s); const p=presets.find(x=>x.className===s); if(p) choose(p.id); }} className={`rounded-xl px-4 py-2 text-sm font-semibold ${section===s ? "bg-slate-950 text-white":"border border-slate-200 bg-white text-slate-700"}`}>{s === "Statistics" ? "Statistics" : `Class ${s}`}</button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">{section === "Statistics" ? "Statistics for Economics" : `Class ${section} · Graphs`}</div>
            <div className="mt-2 space-y-1">
              {list.map(p => (
                <button key={p.id} onClick={() => choose(p.id)} className={`w-full rounded-xl px-3 py-3 text-left text-sm ${selected===p.id ? "bg-slate-950 text-white":"hover:bg-slate-50 text-slate-700"}`}>
                  <div className="font-semibold">{p.title}</div>
                  <div className={`mt-1 text-xs ${selected===p.id ? "text-slate-300":"text-slate-400"}`}>{p.unit}</div>
                </button>
              ))}
              {section==="Statistics" && <button onClick={()=>setSelected("stats")} className={`w-full rounded-xl px-3 py-3 text-left text-sm ${selected==="stats" ? "bg-slate-950 text-white":"hover:bg-slate-50 text-slate-700"}`}><div className="font-semibold">Data Presentation Lab</div><div className="mt-1 text-xs text-slate-400">Bar · Histogram · Ogive · Scatter · Pie</div></button>}
            </div>
          </nav>

          <section className="min-w-0">
            {section==="Statistics" && selected==="stats" ? (
              <>
                <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-semibold">Data Presentation Lab</h2>
                  <p className="mt-1 text-sm text-slate-600">Explore common Class XI presentation formats before the live-data input layer is connected.</p>
                </div>
                <StatChart />
              </>
            ) : (
              <>
                <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{preset.unit}</div>
                      <h2 className="mt-1 text-xl font-semibold">{preset.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{preset.description}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">Interactive · Exam-oriented</div>
                  </div>
                </div>
                <EconomicsGraph preset={preset} controls={controlValues} setControls={setControlValues} />
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
