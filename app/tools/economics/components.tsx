"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  controlDisplayValue,
  curveColors,
  presets,
  type Annotation,
  type Curve,
  type Point,
  type Preset,
} from "./data";

function niceStep(range: number) {
  const raw = range / 8;
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1e-12))));
  const n = raw / p;
  const base =
    n <= 1 ? 1 :
    n <= 2 ? 2 :
    n <= 5 ? 5 : 10;

  return base * p;
}

function ticks(min: number, max: number) {
  const step = niceStep(max - min);
  const result: number[] = [];

  for (
    let v = Math.ceil(min / step) * step;
    v <= max + step * 0.001;
    v += step
  ) {
    result.push(Number(v.toFixed(8)));
  }

  return result;
}

function fmt(n: number) {
  if (!Number.isFinite(n)) return "";
  if (Math.abs(n) < 1e-9) return "0";
  return Number(n.toPrecision(5)).toString();
}

function sampleCurve(
  curve: Curve,
  p: Pick<Preset, "xMin" | "xMax" | "yMin" | "yMax">
): Point[] {
  if (curve.vertical) {
    const x = curve.xValue ?? p.xMin;
    return [
      { x, y: p.yMin },
      { x, y: p.yMax },
    ];
  }

  const pts: Point[] = [];
  let previousY: number | null = null;
  const ySpan = Math.max(p.yMax - p.yMin, 1e-9);

  for (let i = 0; i <= 900; i++) {
    const x = p.xMin + (i / 900) * (p.xMax - p.xMin);
    const y = curve.fn(x);
    const finite = Number.isFinite(y);
    const outside = finite && (y < p.yMin - ySpan * 0.05 || y > p.yMax + ySpan * 0.05);
    const jump = finite && previousY !== null && Math.abs(y - previousY) > ySpan * 0.35;

    if (!finite || outside || jump) {
      pts.push({ x: NaN, y: NaN });
      previousY = null;
    } else {
      pts.push({ x, y });
      previousY = y;
    }
  }

  return pts;
}

function intersections(
  curves: Curve[],
  bounds: Pick<Preset, "xMin" | "xMax" | "yMin" | "yMax">
): Point[] {
  const out: Point[] = [];
  const steps = 900;
  const xSpan = bounds.xMax - bounds.xMin;

  for (let a = 0; a < curves.length; a++) {
    for (let b = a + 1; b < curves.length; b++) {
      const ca = curves[a];
      const cb = curves[b];

      if (ca.vertical && cb.vertical) continue;

      if (ca.vertical || cb.vertical) {
        const vertical = ca.vertical ? ca : cb;
        const other = ca.vertical ? cb : ca;
        const x = vertical.xValue ?? bounds.xMin;
        const y = other.fn(x);
        if (Number.isFinite(y) && y >= bounds.yMin && y <= bounds.yMax) {
          if (!out.some((q) => Math.abs(q.x - x) < xSpan / 120 && Math.abs(q.y - y) < (bounds.yMax - bounds.yMin) / 120)) {
            out.push({ x, y });
          }
        }
        continue;
      }

      let prevX = bounds.xMin;
      let prevA = ca.fn(prevX);
      let prevB = cb.fn(prevX);
      let prevD = prevA - prevB;

      for (let i = 1; i <= steps; i++) {
        const x = bounds.xMin + (i / steps) * xSpan;
        const aY = ca.fn(x);
        const bY = cb.fn(x);
        const d = aY - bY;

        if (Number.isFinite(prevD) && Number.isFinite(d) && Number.isFinite(prevA) && Number.isFinite(prevB) && prevD * d <= 0) {
          const denominator = Math.abs(prevD) + Math.abs(d);
          const t = denominator > 0 ? Math.abs(prevD) / denominator : 0;
          const ix = prevX + (x - prevX) * t;
          const y = ca.fn(ix);

          if (Number.isFinite(y) && y >= bounds.yMin && y <= bounds.yMax && !out.some((q) => Math.abs(q.x - ix) < xSpan / 120 && Math.abs(q.y - y) < (bounds.yMax - bounds.yMin) / 120)) {
            out.push({ x: ix, y });
          }
        }

        prevX = x;
        prevA = aY;
        prevB = bY;
        prevD = d;
      }
    }
  }

  return out.slice(0, 12);
}

/* -------------------------------------------------------------------------- */
/* Economics graph                                                            */
/* -------------------------------------------------------------------------- */

function dEqQForPoints(dShift = 0, sShift = 0) {
  return (80 + dShift - sShift) / 1.4;
}

function dEqPForPoints(dShift = 0, sShift = 0) {
  const q = dEqQForPoints(dShift, sShift);
  return 90 - 0.75 * q + dShift;
}

function graphAnnotations(preset: Preset, controls: Record<string, number>, curves: Curve[], view: {xMin:number;xMax:number;yMin:number;yMax:number}): Annotation[] {
  const a: Annotation[] = [];
  const dEqQ = (dShift=0,sShift=0) => (80+dShift-sShift)/1.4;
  const dEqP = (dShift=0,sShift=0) => 90-0.75*dEqQ(dShift,sShift)+dShift;

  if (preset.id === "demand-supply") {
    const q0 = dEqQ();
    const p0 = dEqP();
    const q1 = dEqQ(controls.dShift, controls.sShift);
    const p1 = dEqP(controls.dShift, controls.sShift);
    const changed = Math.abs(q1 - q0) > 0.05 || Math.abs(p1 - p0) > 0.05;

    a.push({ id: "eq-guide-x", x1: q1, y1: 0, x2: q1, y2: p1, text: "Qe₁ = " + fmt(q1), tone: "guide" });
    a.push({ id: "eq-guide-y", x1: 0, y1: p1, x2: q1, y2: p1, text: "Pe₁ = ₹" + fmt(p1), tone: "guide" });
    a.push({ id: "eq0-label", x1: q0, y1: p0, x2: q0, y2: p0, text: "E₀", tone: "label" });
    a.push({ id: "eq1-label", x1: q1, y1: p1, x2: q1, y2: p1, text: changed ? "E₁" : "E", tone: "label" });

    if (changed) {
      const dx = q1 - q0;
      const dy = p1 - p0;
      const length = Math.hypot(dx, dy) || 1;
      const ux = dx / length;
      const uy = dy / length;
      const inset = Math.min(10, length * 0.18);
      a.push({
        id: "eq-arrow",
        x1: q0 + ux * inset,
        y1: p0 + uy * inset,
        x2: q1 - ux * inset,
        y2: p1 - uy * inset,
        text: "Equilibrium shifts",
        tone: "arrow",
      });
    }

    // Curve shifts are shown at a common quantity so the viewer sees the
    // whole curve moving, not an invented movement along the curve.
    const xShift = 30;
    const d0y = 90 - 0.75 * xShift;
    const s0y = 10 + 0.65 * xShift;
    if (Math.abs(controls.dShift) > 0.01) {
      a.push({
        id: "d-shift-arrow",
        x1: xShift,
        y1: d0y,
        x2: xShift,
        y2: d0y + controls.dShift,
        text: controls.dShift > 0 ? "Increase in demand" : "Decrease in demand",
        tone: "arrow",
      });
    }
    if (Math.abs(controls.sShift) > 0.01) {
      a.push({
        id: "s-shift-arrow",
        x1: xShift + 20,
        y1: s0y,
        x2: xShift + 20,
        y2: s0y + controls.sShift,
        text: controls.sShift < 0 ? "Increase in supply" : "Decrease in supply",
        tone: "arrow",
      });
    }
  }

  if (preset.id === "demand-movement-shift") {
    const determinantSum=controls.income+controls.substitutes-controls.complements+controls.tastes+controls.expectations+controls.buyers;
    const shift=determinantSum*5;
    const d0=(x:number)=>90-0.72*x;
    const d1=(x:number)=>d0(x)+shift;
    const refPrice=60;
    const qA=Math.max(0,(90-refPrice)/0.72), qB=Math.max(0,(90-controls.price)/0.72);
    const qC=Math.max(0,(90+shift-controls.price)/0.72);
    if(Math.abs(shift)<0.01){
      a.push({id:"A",x1:qA,y1:refPrice,x2:qA,y2:refPrice,text:"A",tone:"label"});
      a.push({id:"B",x1:qB,y1:controls.price,x2:qB,y2:controls.price,text:"B",tone:"label"});
      a.push({id:"movement",x1:qA,y1:refPrice,x2:qB,y2:controls.price,text:"Movement along D₀",tone:"arrow"});
      a.push({id:"qA",x1:qA,y1:0,x2:qA,y2:refPrice,text:"Q₁",tone:"guide"});
      a.push({id:"qB",x1:qB,y1:0,x2:qB,y2:controls.price,text:"Q₂",tone:"guide"});
    } else {
      const q0=Math.max(0,(90-controls.price)/0.72);
      a.push({id:"A",x1:q0,y1:controls.price,x2:q0,y2:controls.price,text:"A on D₀",tone:"label"});
      a.push({id:"B",x1:qC,y1:controls.price,x2:qC,y2:controls.price,text:"B on D₁/D₂",tone:"label"});
      a.push({id:"shift",x1:q0,y1:controls.price+5,x2:qC,y2:controls.price+5,text:shift>0?"Increase in demand →":"← Decrease in demand",tone:"arrow"});
      a.push({id:"q0",x1:q0,y1:0,x2:q0,y2:controls.price,text:"Q₁",tone:"guide"});
      a.push({id:"qc",x1:qC,y1:0,x2:qC,y2:controls.price,text:"Q₂",tone:"guide"});
    }
  }

  if (preset.id === "supply-movement-shift") {
    const determinantSum=controls.input+controls.related-controls.technology+controls.tax-controls.subsidy+controls.expectations-controls.firms;
    const shift=determinantSum*5;
    const refPrice=40;
    const qA=Math.max(0,(refPrice-8)/0.72), qB=Math.max(0,(controls.price-8)/0.72);
    const qC=Math.max(0,(controls.price-8-shift)/0.72);
    if(Math.abs(shift)<0.01){
      a.push({id:"A",x1:qA,y1:refPrice,x2:qA,y2:refPrice,text:"A",tone:"label"});
      a.push({id:"B",x1:qB,y1:controls.price,x2:qB,y2:controls.price,text:"B",tone:"label"});
      a.push({id:"movement",x1:qA,y1:refPrice,x2:qB,y2:controls.price,text:"Movement along S₀",tone:"arrow"});
      a.push({id:"qA",x1:qA,y1:0,x2:qA,y2:refPrice,text:"Q₁",tone:"guide"});
      a.push({id:"qB",x1:qB,y1:0,x2:qB,y2:controls.price,text:"Q₂",tone:"guide"});
    } else {
      const q0=Math.max(0,(controls.price-8)/0.72);
      a.push({id:"A",x1:q0,y1:controls.price,x2:q0,y2:controls.price,text:"A on S₀",tone:"label"});
      a.push({id:"B",x1:qC,y1:controls.price,x2:qC,y2:controls.price,text:"B on S₁/S₂",tone:"label"});
      a.push({id:"shift",x1:q0,y1:controls.price+5,x2:qC,y2:controls.price+5,text:shift<0?"Increase in supply →":"← Decrease in supply",tone:"arrow"});
      a.push({id:"q0",x1:q0,y1:0,x2:q0,y2:controls.price,text:"Q₁",tone:"guide"});
      a.push({id:"qc",x1:qC,y1:0,x2:qC,y2:controls.price,text:"Q₂",tone:"guide"});
    }
  }

  if (preset.id === "price-ceiling") {
    const qe=dEqQ(), pe=dEqP(), qd=Math.max(0,(90-controls.ceiling)/0.75), qs=Math.max(0,(controls.ceiling-10)/0.65);
    const binding=controls.ceiling<pe;
    a.push({id:"eq",x1:qe,y1:pe,x2:qe,y2:pe,text:"E: Pe = " + fmt(pe) + ", Qe = " + fmt(qe),tone:"label"});
    a.push({id:"ceiling-guide",x1:0,y1:controls.ceiling,x2:Math.max(qd,qs),y2:controls.ceiling,text:binding?"Binding price ceiling":"Non-binding price ceiling",tone:"label"});
    if(binding){
      a.push({id:"qd",x1:qd,y1:0,x2:qd,y2:controls.ceiling,text:"Qd = " + fmt(qd),tone:"guide"});
      a.push({id:"qs",x1:qs,y1:0,x2:qs,y2:controls.ceiling,text:"Qs = " + fmt(qs),tone:"guide"});
      a.push({id:"shortage",x1:qs,y1:controls.ceiling-4,x2:qd,y2:controls.ceiling-4,text:"Shortage = " + fmt(qd-qs) + " units",tone:"arrow"});
    }
  }

  if (preset.id === "price-floor") {
    const qe=dEqQ(), pe=dEqP(), qd=Math.max(0,(90-controls.floor)/0.75), qs=Math.max(0,(controls.floor-10)/0.65);
    const binding=controls.floor>pe;
    a.push({id:"eq",x1:qe,y1:pe,x2:qe,y2:pe,text:"E: Pe = " + fmt(pe) + ", Qe = " + fmt(qe),tone:"label"});
    a.push({id:"floor-guide",x1:0,y1:controls.floor,x2:Math.max(qd,qs),y2:controls.floor,text:binding?"Binding price floor":"Non-binding price floor",tone:"label"});
    if(binding){
      a.push({id:"qd",x1:qd,y1:0,x2:qd,y2:controls.floor,text:"Qd = " + fmt(qd),tone:"guide"});
      a.push({id:"qs",x1:qs,y1:0,x2:qs,y2:controls.floor,text:"Qs = " + fmt(qs),tone:"guide"});
      a.push({id:"surplus",x1:qd,y1:controls.floor+4,x2:qs,y2:controls.floor+4,text:"Surplus = " + fmt(qs-qd) + " units",tone:"arrow"});
    }
  }

  if (preset.id === "consumer-equilibrium") {
    const xStar=controls.income/(2*controls.px), yStar=controls.income/(2*controls.py);
    const xIntercept=controls.income/controls.px, yIntercept=controls.income/controls.py;
    a.push({id:"xint",x1:xIntercept,y1:0,x2:xIntercept,y2:0,text:"X-intercept = I / Px",tone:"label"});
    a.push({id:"yint",x1:0,y1:yIntercept,x2:0,y2:yIntercept,text:"Y-intercept = I / Py",tone:"label"});
    a.push({id:"ce",x1:xStar,y1:yStar,x2:xStar+10,y2:yStar+10,text:"E: Consumer equilibrium",tone:"label"});
    a.push({id:"tangent",x1:xStar-12,y1:yStar+(controls.px/controls.py)*12,x2:xStar+12,y2:yStar-(controls.px/controls.py)*12,text:"Tangency: MRS = Px / Py",tone:"guide"});
  }

  if (preset.id === "ppc") {
    a.push({id:"xIntercept",x1:100,y1:0,x2:100,y2:0,text:"X-intercept: maximum Good X",tone:"label"});
    a.push({id:"yIntercept",x1:0,y1:100,x2:0,y2:100,text:"Y-intercept: maximum Good Y",tone:"label"});
    a.push({id:"inside",x1:35,y1:30,x2:48,y2:30,text:"B: attainable but inefficient",tone:"label"});
    a.push({id:"outside",x1:70,y1:75,x2:82,y2:75,text:"C: unattainable",tone:"label"});
    a.push({id:"efficient",x1:52,y1:48,x2:64,y2:42,text:"A: efficient combination",tone:"label"});
    a.push({id:"opp",x1:50,y1:0,x2:58,y2:0,text:"Opportunity cost of more Good X",tone:"arrow"});
  }

  if (preset.id === "tp-ap-mp") {
    const tp=(x)=>controls.productivity*(10*x+4*x*x-0.35*x*x*x);
    const mp=(x)=>controls.productivity*(10+8*x-1.05*x*x);
    const xTP=(8+Math.sqrt(64+42))/2.1;
    a.push({id:"tpmax",x1:xTP,y1:0,x2:xTP,y2:tp(xTP),text:"TP maximum: MP = 0",tone:"guide"});
    const apx=4/0.7;
    a.push({id:"apmax",x1:apx,y1:0,x2:apx,y2:tp(apx)/apx,text:"AP maximum: MP = AP",tone:"guide"});
    a.push({id:"negative",x1:10.5,y1:10,x2:9.5,y2:2,text:"MP < 0 after TP maximum",tone:"arrow"});
  }

  if (preset.id === "producer-equilibrium" || preset.id === "perfect-competition-firm") {
    const price=controls.price;
    const scale=controls.scale ?? 1;
    const mc=(x)=>scale*(8-0.56*x+0.0105*x*x);
    const roots=[]; for(let i=1;i<100;i+=0.25){const a1=mc(i)-price,b1=mc(i+0.25)-price;if(a1*b1<=0) roots.push(i+0.25*Math.abs(a1)/(Math.abs(a1)+Math.abs(b1)||1));}
    const q=roots.find(x=>x>25) ?? roots[0] ?? 50;
    a.push({id:"pe",x1:q,y1:price,x2:q,y2:0,text:"Equilibrium output Q* = " + fmt(q),tone:"guide"});
    a.push({id:"mceq",x1:q-12,y1:price+10,x2:q,y2:price,text:"MR = MC",tone:"arrow"});
  }

  if (preset.id === "money-demand") {
    const q=controls.supply, r=92-0.85*q+controls.demandShift;
    a.push({id:"moneyeq",x1:q,y1:r,x2:q,y2:0,text:"Money-market equilibrium: i = " + fmt(r) + "%",tone:"guide"});
  }

  if (preset.id === "income-equilibrium") {
    const q=controls.autonomous/(1-controls.mpc);
    a.push({id:"incomeeq",x1:q,y1:q,x2:q,y2:0,text:"Equilibrium income Y* = " + fmt(q),tone:"guide"});
  }

  return a;
}
export function CircularFlowDiagram() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <svg viewBox="0 0 900 560" className="h-auto w-full" role="img" aria-label="Two-sector circular flow of income">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#334155" />
          </marker>
        </defs>
        <rect width="900" height="560" fill="white" />
        <rect x="85" y="205" width="250" height="120" rx="22" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="565" y="205" width="250" height="120" rx="22" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        <text x="210" y="260" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0f172a">Households</text>
        <text x="690" y="260" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0f172a">Firms</text>
        <text x="210" y="289" textAnchor="middle" fontSize="14" fill="#64748b">Consumers & factor owners</text>
        <text x="690" y="289" textAnchor="middle" fontSize="14" fill="#64748b">Producers</text>
        <path d="M335 225 C420 150 480 150 565 225" fill="none" stroke="#2563eb" strokeWidth="4" markerEnd="url(#arrowhead)" />
        <text x="450" y="145" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1d4ed8">Factors of production</text>
        <text x="450" y="166" textAnchor="middle" fontSize="13" fill="#64748b">Real flow →</text>
        <path d="M565 305 C480 380 420 380 335 305" fill="none" stroke="#2563eb" strokeWidth="4" markerEnd="url(#arrowhead)" />
        <text x="450" y="421" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1d4ed8">Goods & services</text>
        <text x="450" y="442" textAnchor="middle" fontSize="13" fill="#64748b">Real flow ←</text>
        <path d="M565 245 C480 170 420 170 335 245" fill="none" stroke="#16a34a" strokeWidth="4" strokeDasharray="10 7" markerEnd="url(#arrowhead)" />
        <text x="450" y="190" textAnchor="middle" fontSize="15" fontWeight="600" fill="#15803d">Factor payments</text>
        <path d="M335 285 C420 360 480 360 565 285" fill="none" stroke="#16a34a" strokeWidth="4" strokeDasharray="10 7" markerEnd="url(#arrowhead)" />
        <text x="450" y="350" textAnchor="middle" fontSize="15" fontWeight="600" fill="#15803d">Consumption expenditure</text>
        <rect x="325" y="25" width="250" height="58" rx="16" fill="#eff6ff" stroke="#bfdbfe" />
        <text x="450" y="50" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e40af">REAL FLOW</text>
        <text x="450" y="69" textAnchor="middle" fontSize="12" fill="#475569">Factors ↔ goods and services</text>
        <rect x="325" y="477" width="250" height="58" rx="16" fill="#f0fdf4" stroke="#bbf7d0" />
        <text x="450" y="502" textAnchor="middle" fontSize="13" fontWeight="700" fill="#166534">MONEY FLOW</text>
        <text x="450" y="521" textAnchor="middle" fontSize="12" fill="#475569">Income ↔ consumption expenditure</text>
      </svg>
      <div className="grid gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700">Real flow</div>
          <div className="mt-1 text-sm text-slate-600">Factors move from households to firms; goods and services move from firms to households.</div>
        </div>
        <div className="rounded-xl bg-white p-3">
          <div className="text-xs font-bold uppercase tracking-wider text-green-700">Money flow</div>
          <div className="mt-1 text-sm text-slate-600">Factor payments move to households; consumption expenditure moves to firms.</div>
        </div>
      </div>
    </div>
  );
}

function MarginalUtilityDiagram({ controls }: { controls: Record<string, number> }) {
  // Textbook presentation: TU and MU are shown in two separate, vertically
  // aligned graphs. Each graph has its own Y-axis, while both use the same
  // quantity scale on the X-axis. MU = 0 occurs exactly where TU is maximum.
  const W = 920;
  const H = 720;
  const L = 92;
  const R = 54;
  const plotW = W - L - R;

  const initial = Math.max(40, Math.min(80, controls.initial ?? 60));
  const decline = Math.max(3, Math.min(5, controls.decline ?? 4));

  // MU(q) declines linearly. TU is the accumulated MU, so its slope is MU.
  // q = initial / decline is therefore the exact point where MU = 0 and TU
  // reaches its maximum.
  const qZero = initial / decline;
  const qEnd = Math.max(8, Math.ceil(qZero * 2) + 1);

  const mu = (q: number) => initial - decline * q;
  const tu = (q: number) => initial * q - 0.5 * decline * q * q;

  const tuMax = tu(qZero);
  const muMin = mu(qEnd);

  const niceStep = (range: number, target = 5) => {
    const raw = range / target;
    const power = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))));
    const normalized = raw / power;
    const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return step * power;
  };

  const tuStep = niceStep(tuMax, 5);
  const muAbs = Math.max(Math.abs(muMin), initial);
  const muStep = niceStep(muAbs * 2, 5);
  const tuYMax = Math.ceil((tuMax * 1.12) / tuStep) * tuStep;
  const muYMax = Math.ceil(initial / muStep) * muStep;
  const muYMin = Math.floor(muMin / muStep) * muStep;

  const top = {
    y0: 72,
    y1: 330,
  };
  const bottom = {
    y0: 402,
    y1: 660,
  };

  const x = (q: number) => L + (q / qEnd) * plotW;
  const yTU = (u: number) =>
    top.y1 - (Math.min(tuYMax, u) / tuYMax) * (top.y1 - top.y0);
  const yMU = (u: number) =>
    bottom.y1 - ((u - muYMin) / (muYMax - muYMin)) * (bottom.y1 - bottom.y0);

  const makePath = (
    fn: (q: number) => number,
    yMap: (v: number) => number,
  ) => {
    const steps = 260;
    const parts: string[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const q = (qEnd * i) / steps;
      const px = x(q);
      const py = yMap(fn(q));
      parts.push(`${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`);
    }
    return parts.join(" ");
  };

  const quantityTicks = Array.from({ length: qEnd + 1 }, (_, i) => i);
  const tuTicks = Array.from(
    { length: Math.floor(tuYMax / tuStep) + 1 },
    (_, i) => i * tuStep,
  );
  const muTicks: number[] = [];
  for (let v = muYMin; v <= muYMax + muStep / 2; v += muStep) {
    muTicks.push(Number(v.toFixed(6)));
  }

  const markerId = "mu-tu-textbook-arrow";
  const zeroX = x(qZero);
  const zeroY = yMU(0);
  const maxTUX = zeroX;
  const maxTUY = yTU(tuMax);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Textbook-style separate total utility and marginal utility graphs"
      >
        <defs>
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#334155" />
          </marker>
        </defs>

        <text
          x={W / 2}
          y="30"
          textAnchor="middle"
          fontSize="18"
          fontWeight="800"
          fill="#0f172a"
        >
          Marginal Utility (MU) and Total Utility (TU)
        </text>

        {/* ===================== TU GRAPH ===================== */}
        <text
          x={W / 2}
          y="55"
          textAnchor="middle"
          fontSize="15"
          fontWeight="800"
          fill="#dc2626"
        >
          Total Utility (TU)
        </text>

        <line
          x1={L}
          x2={W - R}
          y1={top.y1}
          y2={top.y1}
          stroke="#334155"
          strokeWidth="2"
          markerEnd={`url(#${markerId})`}
        />
        <line
          x1={L}
          x2={L}
          y1={top.y1}
          y2={top.y0 - 8}
          stroke="#334155"
          strokeWidth="2"
          markerEnd={`url(#${markerId})`}
        />

        {tuTicks.map((v) => (
          <g key={`tu-y-${v}`}>
            <line
              x1={L - 5}
              x2={L + 5}
              y1={yTU(v)}
              y2={yTU(v)}
              stroke="#334155"
            />
            <text
              x={L - 12}
              y={yTU(v) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#475569"
            >
              {Number.isInteger(v) ? v : v.toFixed(1)}
            </text>
          </g>
        ))}

        <text
          x="24"
          y={(top.y0 + top.y1) / 2}
          transform={`rotate(-90 24 ${(top.y0 + top.y1) / 2})`}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#0f172a"
        >
          Total Utility (utils)
        </text>

        {quantityTicks.map((q) => (
          <g key={`tu-x-${q}`}>
            <line
              x1={x(q)}
              x2={x(q)}
              y1={top.y1 - 5}
              y2={top.y1 + 5}
              stroke="#334155"
            />
            <text
              x={x(q)}
              y={top.y1 + 21}
              textAnchor="middle"
              fontSize="10"
              fill="#475569"
            >
              {q}
            </text>
          </g>
        ))}

        <text
          x={W / 2}
          y={top.y1 + 42}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#dc2626"
        >
          Units of commodity consumed
        </text>

        <path
          d={makePath(tu, yTU)}
          fill="none"
          stroke="#ef4444"
          strokeWidth="3.5"
        />

        {quantityTicks
          .filter((q) => q > 0)
          .map((q) => (
            <circle
              key={`tu-point-${q}`}
              cx={x(q)}
              cy={yTU(tu(q))}
              r="4"
              fill="#111827"
            />
          ))}

        <text
          x={x(Math.min(qEnd - 1, qZero + 0.8))}
          y={yTU(tu(Math.min(qEnd - 1, qZero + 0.8))) + 28}
          fontSize="13"
          fontWeight="700"
          fill="#dc2626"
        >
          TU
        </text>

        {/* ===================== LINKING LINE ===================== */}
        <line
          x1={maxTUX}
          x2={maxTUX}
          y1={maxTUY}
          y2={zeroY}
          stroke="#111827"
          strokeWidth="2"
          strokeDasharray="7 5"
        />
        <circle cx={maxTUX} cy={maxTUY} r="5" fill="#111827" />
        <text
          x={maxTUX + 10}
          y={maxTUY - 12}
          fontSize="12"
          fontWeight="700"
          fill="#111827"
        >
          Maximum TU
        </text>

        {/* ===================== MU GRAPH ===================== */}
        <text
          x={W / 2}
          y="388"
          textAnchor="middle"
          fontSize="15"
          fontWeight="800"
          fill="#2563eb"
        >
          Marginal Utility (MU)
        </text>

        <line
          x1={L}
          x2={W - R}
          y1={zeroY}
          y2={zeroY}
          stroke="#334155"
          strokeWidth="2"
          markerEnd={`url(#${markerId})`}
        />
        <line
          x1={L}
          x2={L}
          y1={bottom.y1}
          y2={bottom.y0 - 8}
          stroke="#334155"
          strokeWidth="2"
          markerEnd={`url(#${markerId})`}
        />

        {muTicks.map((v) => (
          <g key={`mu-y-${v}`}>
            <line
              x1={L - 5}
              x2={L + 5}
              y1={yMU(v)}
              y2={yMU(v)}
              stroke="#334155"
            />
            <text
              x={L - 12}
              y={yMU(v) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#475569"
            >
              {Number.isInteger(v) ? v : v.toFixed(1)}
            </text>
          </g>
        ))}

        <text
          x="24"
          y={(bottom.y0 + bottom.y1) / 2}
          transform={`rotate(-90 24 ${(bottom.y0 + bottom.y1) / 2})`}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#0f172a"
        >
          Marginal Utility (utils)
        </text>

        {quantityTicks.map((q) => (
          <g key={`mu-x-${q}`}>
            <line
              x1={x(q)}
              x2={x(q)}
              y1={zeroY - 5}
              y2={zeroY + 5}
              stroke="#334155"
            />
            <text
              x={x(q)}
              y={zeroY + 21}
              textAnchor="middle"
              fontSize="10"
              fill="#475569"
            >
              {q}
            </text>
          </g>
        ))}

        <text
          x={W / 2}
          y={bottom.y1 + 28}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#2563eb"
        >
          Units of commodity consumed
        </text>

        <path
          d={makePath(mu, yMU)}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3.5"
        />

        {quantityTicks
          .filter((q) => q > 0)
          .map((q) => (
            <circle
              key={`mu-point-${q}`}
              cx={x(q - 0.5)}
              cy={yMU(tu(q) - tu(q - 1))}
              r="4"
              fill="#111827"
            />
          ))}

        <circle cx={zeroX} cy={zeroY} r="5" fill="#111827" />
        <text
          x={zeroX + 10}
          y={zeroY - 10}
          fontSize="12"
          fontWeight="700"
          fill="#111827"
        >
          Zero MU
        </text>
        <text
          x={zeroX + 10}
          y={zeroY + 25}
          fontSize="11"
          fill="#475569"
        >
          MU = 0 at Q = {qZero.toFixed(1)}
        </text>

        <text
          x={x(Math.min(qEnd - 0.5, qZero + 1.2))}
          y={yMU(mu(Math.min(qEnd - 0.5, qZero + 1.2))) - 12}
          fontSize="13"
          fontWeight="700"
          fill="#2563eb"
        >
          MU Curve
        </text>
        <text
          x={x(Math.min(qEnd - 0.5, qZero + 0.9))}
          y={yMU(mu(Math.min(qEnd - 0.5, qZero + 0.9))) + 24}
          fontSize="11"
          fill="#475569"
        >
          Negative MU
        </text>

        <text
          x={W - R - 4}
          y={zeroY - 10}
          textAnchor="end"
          fontSize="11"
          fill="#475569"
        >
          MU falls as consumption rises
        </text>
      </svg>
    </div>
  );
}

function ProductionSystemDiagram({ controls }: { controls: Record<string, number> }) {
  const W=920,H=760,P=78,plotW=W-2*P;
  const productivity=controls.productivity ?? 1;
  const tp=(q:number)=>productivity*(10*q+4*q*q-0.35*q*q*q);
  const ap=(q:number)=>q<=0?0:tp(q)/q;
  const mp=(q:number)=>productivity*(10+8*q-1.05*q*q);
  const qAP=4/0.7;
  const qTP=(8+Math.sqrt(106))/2.1;
  const x=(q:number)=>P+(q/12)*plotW;
  const yTP=(v:number)=>70+245-(Math.max(0,Math.min(110,v))/110)*245;
  const yP=(v:number)=>430+250-((Math.max(-15,Math.min(35,v))+15)/50)*250;
  const path=(fn:(q:number)=>number,yf:(v:number)=>number)=>{let d='';for(let i=0;i<=300;i++){const q=i/25;const v=fn(q);d+=(i?' L ':'M ')+x(q).toFixed(2)+' '+yf(v).toFixed(2);}return d;};
  return <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Textbook production function showing TP, AP and MP relationships">
      <defs><marker id="production-v8-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#475569"/></marker></defs>
      <text x={W/2} y="32" textAnchor="middle" fontSize="18" fontWeight="800">Total Product (TP)</text>
      <line x1={P} x2={W-P} y1="315" y2="315" stroke="#334155" strokeWidth="2" markerEnd="url(#production-v8-arrow)"/>
      <line x1={P} x2={P} y1="70" y2="315" stroke="#334155" strokeWidth="2" markerEnd="url(#production-v8-arrow)"/>
      <text x={W/2} y="338" textAnchor="middle" fontSize="13" fontWeight="700">Variable input (units)</text>
      <text x="22" y="192" transform="rotate(-90 22 192)" textAnchor="middle" fontSize="13" fontWeight="700">Total product (units)</text>
      <path d={path(tp,yTP)} fill="none" stroke="#2563eb" strokeWidth="4"/>
      <line x1={x(qTP)} x2={x(qTP)} y1={yTP(tp(qTP))} y2="315" stroke="#64748b" strokeDasharray="6 5"/>
      <circle cx={x(qTP)} cy={yTP(tp(qTP))} r="6" fill="#0f172a"/>
      <text x={x(qTP)+9} y={yTP(tp(qTP))-12} fontSize="12" fontWeight="700">TP maximum</text>
      <text x={x(qTP)+9} y={yTP(tp(qTP))+7} fontSize="11" fill="#475569">MP = 0</text>
      <text x={x(2.5)} y={yTP(tp(2.5))-12} fontSize="13" fontWeight="700" fill="#2563eb">TP</text>
      <text x={x(9.2)} y={yTP(tp(9.2))+25} fontSize="11" fill="#475569">TP falls when MP is negative</text>

      <text x={W/2} y="390" textAnchor="middle" fontSize="18" fontWeight="800">Average Product (AP) and Marginal Product (MP)</text>
      <line x1={P} x2={W-P} y1={yP(0)} y2={yP(0)} stroke="#334155" strokeWidth="2" markerEnd="url(#production-v8-arrow)"/>
      <line x1={P} x2={P} y1="430" y2="680" stroke="#334155" strokeWidth="2" markerEnd="url(#production-v8-arrow)"/>
      <text x={W/2} y="708" textAnchor="middle" fontSize="13" fontWeight="700">Variable input (units)</text>
      <text x="22" y="555" transform="rotate(-90 22 555)" textAnchor="middle" fontSize="13" fontWeight="700">Product per unit of variable input</text>
      {[0,5,10,15,20,25,30].map(v=><text key={v} x={P-10} y={yP(v)+4} textAnchor="end" fontSize="11" fill="#475569">{v}</text>)}
      <text x={P-10} y={yP(-15)+4} textAnchor="end" fontSize="11" fill="#475569">−15</text>
      <path d={path(ap,yP)} fill="none" stroke="#16a34a" strokeWidth="4"/>
      <path d={path(mp,yP)} fill="none" stroke="#dc2626" strokeWidth="4"/>
      <line x1={x(qAP)} x2={x(qAP)} y1={yP(ap(qAP))} y2={yP(0)} stroke="#64748b" strokeDasharray="6 5"/>
      <line x1={x(qTP)} x2={x(qTP)} y1={yP(mp(qTP))} y2={yP(0)} stroke="#64748b" strokeDasharray="6 5"/>
      <circle cx={x(qAP)} cy={yP(ap(qAP))} r="6" fill="#0f172a"/>
      <circle cx={x(qTP)} cy={yP(0)} r="6" fill="#0f172a"/>
      <text x={x(qAP)+8} y={yP(ap(qAP))-12} fontSize="12" fontWeight="700">AP maximum: MP = AP</text>
      <text x={x(qTP)+8} y={yP(0)-10} fontSize="12" fontWeight="700">MP = 0</text>
      <text x={x(8.6)} y={yP(ap(8.6))-10} fontSize="13" fontWeight="700" fill="#16a34a">AP</text>
      <text x={x(8.6)} y={yP(mp(8.6))+18} fontSize="13" fontWeight="700" fill="#dc2626">MP</text>
      <text x={x(qAP/2)} y="452" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">Stage I: Increasing returns</text>
      <text x={(x(qAP)+x(qTP))/2} y="452" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">Stage II: Diminishing returns</text>
      <text x={(x(qTP)+x(12))/2} y="452" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">Stage III: Negative returns</text>
    </svg>
  </div>;
}

function CostSystemDiagram({ controls }: { controls: Record<string, number> }) {
  const W = 920, H = 790, P = 82, plotW = W - 2 * P;
  const fixed = controls.fixed ?? 40;
  const scale = controls.scale ?? 1;
  const rawTVC = (q: number) => 1.8 * q - 0.08 * q * q + 0.002 * q * q * q;
  const tvc = (q: number) => scale * rawTVC(q);
  const tc = (q: number) => fixed + tvc(q);
  const afc = (q: number) => q <= 0 ? 0 : fixed / q;
  const avc = (q: number) => scale * (1.8 - 0.08 * q + 0.002 * q * q);
  const ac = (q: number) => afc(q) + avc(q);
  const mc = (q: number) => scale * (1.8 - 0.16 * q + 0.006 * q * q);
  const x = (q: number) => P + (q / 60) * plotW;
  const yTotal = (v: number) => 65 + 255 - (Math.max(0, Math.min(320, v)) / 320) * 255;
  const yUnit = (v: number) => 445 + 260 - (Math.max(0, Math.min(15, v)) / 15) * 260;
  const path = (fn: (q: number) => number, yf: (v: number) => number, start = 0.01) => {
    let d = "";
    for (let i = 0; i <= 360; i++) {
      const q = start + (i / 360) * (60 - start);
      d += (i ? " L " : "M ") + x(q).toFixed(2) + " " + yf(fn(q)).toFixed(2);
    }
    return d;
  };
  const avcMinQ = 20;
  let lo = 2, hi = 60;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const derivativeAC = -fixed / (mid * mid) + scale * (-0.08 + 0.004 * mid);
    if (derivativeAC < 0) lo = mid; else hi = mid;
  }
  const acMinQ = (lo + hi) / 2;
  const acMin = ac(acMinQ);
  const yTicksTotal = [0, 80, 160, 240, 320];
  const yTicksUnit = [0, 3, 6, 9, 12, 15];
  const qTicks = [0, 10, 20, 30, 40, 50, 60];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <svg viewBox={"0 0 " + W + " " + H} className="h-auto w-full" role="img" aria-label="Short-run total and per-unit cost relationships">
        <defs><marker id="cost-v10-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#334155" /></marker></defs>
        <text x={W / 2} y="30" textAnchor="middle" fontSize="18" fontWeight="800">Total Cost Relationships</text>
        <line x1={P} x2={W - P} y1="320" y2="320" stroke="#334155" strokeWidth="2" markerEnd="url(#cost-v10-arrow)" />
        <line x1={P} x2={P} y1="65" y2="320" stroke="#334155" strokeWidth="2" markerEnd="url(#cost-v10-arrow)" />
        {yTicksTotal.map(v => <text key={v} x={P - 10} y={yTotal(v) + 4} textAnchor="end" fontSize="11" fill="#475569">{v}</text>)}
        {qTicks.map(q => <text key={q} x={x(q)} y="338" textAnchor="middle" fontSize="11" fill="#475569">{q}</text>)}
        <text x={W / 2} y="360" textAnchor="middle" fontSize="13" fontWeight="700">Output (units)</text>
        <text x="25" y="195" transform="rotate(-90 25 195)" textAnchor="middle" fontSize="13" fontWeight="700">Total cost (₹)</text>
        <path d={path(() => fixed, yTotal)} fill="none" stroke="#16a34a" strokeWidth="4" />
        <path d={path(tvc, yTotal)} fill="none" stroke="#2563eb" strokeWidth="4" />
        <path d={path(tc, yTotal)} fill="none" stroke="#dc2626" strokeWidth="4" />
        <circle cx={x(0.01)} cy={yTotal(0)} r="4" fill="#2563eb" />
        <circle cx={x(0.01)} cy={yTotal(fixed)} r="4" fill="#dc2626" />
        <text x={x(1)} y={yTotal(0) - 12} fontSize="11" fill="#2563eb">TVC starts at origin</text>
        <text x={x(1)} y={yTotal(fixed) - 12} fontSize="11" fill="#dc2626">TC starts at TFC</text>
        <text x={x(44)} y={yTotal(fixed) - 12} fontSize="12" fontWeight="700" fill="#16a34a">TFC = fixed cost</text>
        <text x={x(49)} y={yTotal(tvc(49)) + 18} fontSize="12" fontWeight="700" fill="#2563eb">TVC</text>
        <text x={x(39)} y={yTotal(tc(39)) - 12} fontSize="12" fontWeight="700" fill="#dc2626">TC = TFC + TVC</text>
        <line x1={x(36)} x2={x(36)} y1={yTotal(fixed)} y2={yTotal(tvc(36))} stroke="#64748b" strokeDasharray="6 5" />
        <text x={x(36) + 8} y={(yTotal(fixed) + yTotal(tvc(36))) / 2 + 4} fontSize="11" fill="#475569">Vertical gap = TFC</text>
        <text x={W / 2} y="402" textAnchor="middle" fontSize="18" fontWeight="800">Per-Unit Cost Relationships</text>
        <line x1={P} x2={W - P} y1={yUnit(0)} y2={yUnit(0)} stroke="#334155" strokeWidth="2" markerEnd="url(#cost-v10-arrow)" />
        <line x1={P} x2={P} y1="445" y2={yUnit(0)} stroke="#334155" strokeWidth="2" markerEnd="url(#cost-v10-arrow)" />
        {yTicksUnit.map(v => <text key={v} x={P - 10} y={yUnit(v) + 4} textAnchor="end" fontSize="11" fill="#475569">{v}</text>)}
        {qTicks.map(q => <text key={q} x={x(q)} y={yUnit(0) + 22} textAnchor="middle" fontSize="11" fill="#475569">{q}</text>)}
        <text x={W / 2} y="748" textAnchor="middle" fontSize="13" fontWeight="700">Output (units)</text>
        <text x="25" y="575" transform="rotate(-90 25 575)" textAnchor="middle" fontSize="13" fontWeight="700">Cost per unit (₹)</text>
        <path d={path(afc, yUnit, 2)} fill="none" stroke="#2563eb" strokeWidth="4" />
        <path d={path(avc, yUnit, 2)} fill="none" stroke="#16a34a" strokeWidth="4" />
        <path d={path(ac, yUnit, 2)} fill="none" stroke="#dc2626" strokeWidth="4" />
        <path d={path(mc, yUnit, 2)} fill="none" stroke="#9333ea" strokeWidth="4" />
        <line x1={x(avcMinQ)} x2={x(avcMinQ)} y1={yUnit(avc(avcMinQ))} y2={yUnit(0)} stroke="#64748b" strokeDasharray="6 5" />
        <line x1={x(acMinQ)} x2={x(acMinQ)} y1={yUnit(acMin)} y2={yUnit(0)} stroke="#64748b" strokeDasharray="6 5" />
        <circle cx={x(avcMinQ)} cy={yUnit(avc(avcMinQ))} r="6" fill="#0f172a" />
        <circle cx={x(acMinQ)} cy={yUnit(acMin)} r="6" fill="#0f172a" />
        <text x={x(9)} y={yUnit(afc(9)) - 12} fontSize="12" fontWeight="700" fill="#2563eb">AFC</text>
        <text x={x(49)} y={yUnit(avc(49)) - 10} fontSize="12" fontWeight="700" fill="#16a34a">AVC</text>
        <text x={x(47)} y={yUnit(ac(47)) - 12} fontSize="12" fontWeight="700" fill="#dc2626">AC = AFC + AVC</text>
        <text x={x(48)} y={yUnit(mc(48)) - 10} fontSize="12" fontWeight="700" fill="#9333ea">MC</text>
        <text x={x(avcMinQ) + 8} y={yUnit(avc(avcMinQ)) - 12} fontSize="11" fill="#475569">MC = AVC at AVC minimum</text>
        <text x={x(acMinQ) + 8} y={yUnit(acMin) + 20} fontSize="11" fill="#475569">MC = AC at AC minimum</text>
        <text x={x(11)} y={yUnit(ac(11)) + 28} fontSize="11" fill="#475569">AC − AVC = AFC</text>
      </svg>
    </div>
  );
}


function RevenueDiagram({ controls }: { controls: Record<string, number> }) {
  const price = Math.max(20, Math.min(80, controls.price ?? 50));
  const W = 920;
  const H = 640;
  const P = 64;
  const qMax = 10;
  const x = (q: number) => P + (q / qMax) * (W - 2 * P);
  const yTr = (v: number) => 300 - (v / (price * qMax)) * 220;
  const yPrice = (v: number) => 590 - (v / 100) * 220;
  const trPath = Array.from({ length: 11 }, (_, q) => `${q ? "L" : "M"} ${x(q).toFixed(1)} ${yTr(price * q).toFixed(1)}`).join(" ");
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Total revenue and average revenue panels">
        <text x={W / 2} y="28" textAnchor="middle" fontSize="18" fontWeight="800">Total revenue</text>
        <line x1={P} x2={W - P} y1="300" y2="300" stroke="#334155" strokeWidth="2" />
        <line x1={P} x2={P} y1="70" y2="300" stroke="#334155" strokeWidth="2" />
        <path d={trPath} fill="none" stroke="#2563eb" strokeWidth="4" />
        <text x={x(7)} y={yTr(price * 7) - 12} fontSize="13" fontWeight="700" fill="#2563eb">TR = P × Q</text>
        <text x={W / 2} y="332" textAnchor="middle" fontSize="13" fontWeight="700">Output (units)</text>
        <text x="22" y="185" transform="rotate(-90 22 185)" textAnchor="middle" fontSize="13" fontWeight="700">Total revenue (₹)</text>
        <text x={W / 2} y="378" textAnchor="middle" fontSize="18" fontWeight="800">Average and marginal revenue</text>
        <line x1={P} x2={W - P} y1="590" y2="590" stroke="#334155" strokeWidth="2" />
        <line x1={P} x2={P} y1="400" y2="590" stroke="#334155" strokeWidth="2" />
        <line x1={P} x2={W - P} y1={yPrice(price)} y2={yPrice(price)} stroke="#dc2626" strokeWidth="4" />
        <line x1={P} x2={W - P} y1={yPrice(price)} y2={yPrice(price)} stroke="#16a34a" strokeWidth="2" strokeDasharray="7 5" />
        <text x={x(6.5)} y={yPrice(price) - 12} fontSize="13" fontWeight="700" fill="#dc2626">AR = MR = P = {price}</text>
        <text x={W / 2} y="624" textAnchor="middle" fontSize="13" fontWeight="700">Output (units)</text>
        <text x="22" y="500" transform="rotate(-90 22 500)" textAnchor="middle" fontSize="13" fontWeight="700">Price (₹)</text>
      </svg>
    </div>
  );
}

export function EconomicsGraph({
  preset,
  controls,
  setControls,
}: {
  preset: Preset;
  controls: Record<string, number>;
  setControls: (
    v: Record<string, number>
  ) => void;
}) {
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);

  // Preset selection and control-state updates are separate React state updates.
  // Merge the preset defaults here so the newly selected graph can never render
  // against the previous graph's control object for one frame.
  const effectiveControls = useMemo(
    () =>
      Object.fromEntries(
        preset.controls.map((control) => [
          control.key,
          Number.isFinite(controls[control.key])
            ? controls[control.key]
            : control.value,
        ])
      ),
    [preset, controls]
  );

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHover(null);
  }, [preset.id]);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({
    x: 0,
    y: 0,
  });

  const drag = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const W = 900;
  const H = 560;
  const P = 62;

  const xRange =
    (preset.xMax - preset.xMin) /
    zoom;

  const yRange =
    (preset.yMax - preset.yMin) /
    zoom;

  const xMid =
    (preset.xMin + preset.xMax) / 2 +
    pan.x;

  const yMid =
    (preset.yMin + preset.yMax) / 2 +
    pan.y;

  const view = {
    xMin: xMid - xRange / 2,
    xMax: xMid + xRange / 2,
    yMin: yMid - yRange / 2,
    yMax: yMid + yRange / 2,
  };

  const mapX = (x: number) =>
    P +
    ((x - view.xMin) /
      (view.xMax - view.xMin)) *
      (W - 2 * P);

  const mapY = (y: number) =>
    H -
    P -
    ((y - view.yMin) /
      (view.yMax - view.yMin)) *
      (H - 2 * P);

  const unmapX = (sx: number) =>
    view.xMin +
    ((sx - P) /
      (W - 2 * P)) *
      (view.xMax - view.xMin);

  const unmapY = (sy: number) =>
    view.yMax -
    ((sy - P) /
      (H - 2 * P)) *
      (view.yMax - view.yMin);

  const curves = useMemo(
    () => preset.curves(effectiveControls),
    [preset, effectiveControls]
  );

  const xs = ticks(
    view.xMin,
    view.xMax
  );

  const ys = ticks(
    view.yMin,
    view.yMax
  );

  const customDiagram =
    preset.diagram === "circular-flow"
      ? <CircularFlowDiagram />
      : preset.diagram === "mu-tu"
        ? <MarginalUtilityDiagram controls={effectiveControls} />
        : preset.diagram === "cost-system"
          ? <CostSystemDiagram controls={effectiveControls} />
          : preset.diagram === "production-system"
            ? <ProductionSystemDiagram controls={effectiveControls} />
            : preset.diagram === "revenue"
              ? <RevenueDiagram controls={effectiveControls} />
            : null;

  const points = useMemo(() => {
    if (preset.id === "demand-supply") {
      const q0 = dEqQForPoints();
      const p0 = dEqPForPoints();
      const q1 = dEqQForPoints(effectiveControls.dShift ?? 0, effectiveControls.sShift ?? 0);
      const p1 = dEqPForPoints(effectiveControls.dShift ?? 0, effectiveControls.sShift ?? 0);
      const changed = Math.abs(q1 - q0) > 0.05 || Math.abs(p1 - p0) > 0.05;
      return changed
        ? [{ x: q0, y: p0, label: "E₀" }, { x: q1, y: p1, label: "E₁" }]
        : [{ x: q0, y: p0, label: "E" }];
    }
    const marked = new Set(["money-demand", "forex", "income-equilibrium"]);
    return marked.has(preset.id) ? intersections(curves.filter((c) => !c.dashed), view).slice(0, 1) : [];
  }, [preset.id, curves, effectiveControls, view.xMin, view.xMax, view.yMin, view.yMax]);

  const pathFor = (curve: Curve) => {
    const sampled = sampleCurve(curve, view);

    const d: string[] = [];
    let drawing = false;

    sampled.forEach((pt) => {
      if (!Number.isFinite(pt.x)) {
        drawing = false;
        return;
      }

      const sx = mapX(pt.x);
      const sy = mapY(pt.y);

      if (
        !Number.isFinite(sy) ||
        sy < -1000 ||
        sy > H + 1000
      ) {
        drawing = false;
        return;
      }

      if (!drawing) {
        d.push(
          `M ${sx.toFixed(2)} ${sy.toFixed(2)}`
        );
        drawing = true;
      } else {
        d.push(
          `L ${sx.toFixed(2)} ${sy.toFixed(2)}`
        );
      }
    });

    return d.join(" ");
  };

  const reset = () => {
    setZoom(1);
    setPan({
      x: 0,
      y: 0,
    });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {customDiagram ? (
          customDiagram
        ) : (
          <>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-none select-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(
              e.pointerId
            );

            drag.current = {
              x: e.clientX,
              y: e.clientY,
            };
          }}
          onPointerMove={(e) => {
            if (drag.current) {
              const dx = e.clientX - drag.current.x;
              const dy = e.clientY - drag.current.y;
              const unitX = (view.xMax - view.xMin) / (W - 2 * P);
              const unitY = (view.yMax - view.yMin) / (H - 2 * P);

              setPan((v) => ({
                x: v.x - dx * unitX,
                y: v.y + dy * unitY,
              }));

              drag.current = { x: e.clientX, y: e.clientY };
              return;
            }

            if ((e.target as Element).getAttribute?.("data-intersection") === "true") return;

            const rect = e.currentTarget.getBoundingClientRect();
            const sx = ((e.clientX - rect.left) * W) / rect.width;
            const sy = ((e.clientY - rect.top) * H) / rect.height;
            const x = unmapX(sx);

            let nearest: { curve: Curve; y: number; d: number } | null = null;
            curves.forEach((curve) => {
              if (curve.vertical) return;
              const cy = curve.fn(x);
              if (!Number.isFinite(cy)) return;
              const d = Math.abs(mapY(cy) - sy);
              if (!nearest || d < nearest.d) nearest = { curve, y: cy, d };
            });

            if (nearest && nearest.d < 18) {
              setHover({ x, y: nearest.y, label: nearest.curve.label });
            } else {
              setHover(null);
            }
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onWheel={(e) => {
            e.preventDefault();

            setZoom((z) =>
              Math.max(
                0.5,
                Math.min(
                  4,
                  z *
                    (e.deltaY < 0
                      ? 1.12
                      : 0.89)
                )
              )
            );
          }}
        >
          <defs>
            <marker id="econ-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
            </marker>
          </defs>
          <rect
            width={W}
            height={H}
            fill="white"
          />

          {(() => {
            const axisX = view.xMin <= 0 && view.xMax >= 0 ? mapX(0) : P;
            const axisY = view.yMin <= 0 && view.yMax >= 0 ? mapY(0) : H - P;

            return (
              <>
                {xs.map((x) => (
                  <g key={`x-${x}`}>
                    <line x1={mapX(x)} x2={mapX(x)} y1={P} y2={H - P} stroke="#e2e8f0" />
                    <line x1={mapX(x)} x2={mapX(x)} y1={axisY - 4} y2={axisY + 4} stroke="#334155" strokeWidth="1.5" />
                    <text x={mapX(x)} y={Math.min(H - 28, Math.max(P + 16, axisY + 20))} textAnchor="middle" fontSize="12" fill="#475569">{fmt(x)}</text>
                  </g>
                ))}

                {ys.map((y) => (
                  <g key={`y-${y}`}>
                    <line x1={P} x2={W - P} y1={mapY(y)} y2={mapY(y)} stroke="#e2e8f0" />
                    <line x1={axisX - 4} x2={axisX + 4} y1={mapY(y)} y2={mapY(y)} stroke="#334155" strokeWidth="1.5" />
                    <text x={Math.max(28, Math.min(W - 8, axisX - 10))} y={mapY(y) + 4} textAnchor="end" fontSize="12" fill="#475569">{fmt(y)}</text>
                  </g>
                ))}

                {view.xMin <= 0 && view.xMax >= 0 && (
                  <line x1={axisX} x2={axisX} y1={P} y2={H - P} stroke="#334155" strokeWidth="2" />
                )}
                {view.yMin <= 0 && view.yMax >= 0 && (
                  <line x1={P} x2={W - P} y1={axisY} y2={axisY} stroke="#334155" strokeWidth="2" markerEnd="url(#econ-arrow)" />
                )}
                {view.xMin <= 0 && view.xMax >= 0 && (
                  <line x1={axisX} x2={axisX} y1={H - P} y2={P} stroke="#334155" strokeWidth="2" markerEnd="url(#econ-arrow)" />
                )}
              </>
            );
          })()}

          <text
            x={W / 2}
            y={H - 12}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="#334155"
          >
            {preset.xLabel}
          </text>

          <text
            x={18}
            y={H / 2}
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="#334155"
            transform={`rotate(-90 18 ${
              H / 2
            })`}
          >
            {preset.yLabel}
          </text>


          {graphAnnotations(preset, effectiveControls, curves, view).map((ann) => {
            const sx1 = mapX(ann.x1);
            const sy1 = mapY(ann.y1);
            const sx2 = mapX(ann.x2 ?? ann.x1);
            const sy2 = mapY(ann.y2 ?? ann.y1);
            return (
              <g key={ann.id} pointerEvents="none">
                {(ann.tone === "arrow" || ann.tone === "guide") && (
                  <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke="#64748b" strokeWidth="2" strokeDasharray={ann.tone === "guide" ? "5 5" : undefined} markerEnd={ann.tone === "arrow" ? "url(#econ-arrow)" : undefined} />
                )}
                <text x={(sx1+sx2)/2} y={(sy1+sy2)/2-8} textAnchor="middle" fontSize="11" fontWeight="600" fill="#475569" paintOrder="stroke" stroke="white" strokeWidth="4">{ann.text}</text>
              </g>
            );
          })}

          {curves.map((curve) => (
            <path
              key={curve.id}
              d={pathFor(curve)}
              fill="none"
              stroke={curve.color}
              strokeWidth="3"
              strokeDasharray={
                curve.dashed
                  ? "9 7"
                  : undefined
              }
              strokeLinecap="round"
            />
          ))}


          {curves.map((curve) => {
            const sample = sampleCurve(curve, view).filter((pt) => Number.isFinite(pt.x) && Number.isFinite(pt.y));
            if (!sample.length) return null;
            const pt = sample[Math.floor(sample.length * 0.72)];
            return (
              <text key={`label-${curve.id}`} x={mapX(pt.x)+7} y={mapY(pt.y)-7} fontSize="12" fontWeight="700" fill={curve.color} paintOrder="stroke" stroke="white" strokeWidth="4">{curve.label}</text>
            );
          })}

          {points.map((pt, i) => (
            <g key={`p-${i}`}>
              <line
                x1={mapX(pt.x)}
                x2={mapX(pt.x)}
                y1={mapY(pt.y)}
                y2={mapY(0)}
                stroke="#94a3b8"
                strokeDasharray="4 4"
              />

              <line
                x1={mapX(pt.x)}
                x2={mapX(0)}
                y1={mapY(pt.y)}
                y2={mapY(pt.y)}
                stroke="#94a3b8"
                strokeDasharray="4 4"
              />

              <circle
                cx={mapX(pt.x)}
                cy={mapY(pt.y)}
                r="12"
                fill="transparent"
                stroke="transparent"
                data-intersection="true"
                pointerEvents="all"
                onPointerEnter={() =>
                  setHover({
                    x: pt.x,
                    y: pt.y,
                    label: pt.label ?? "Intersection / equilibrium",
                  })
                }
                onPointerLeave={() => setHover(null)}
              />

              <circle
                cx={mapX(pt.x)}
                cy={mapY(pt.y)}
                r="6"
                data-intersection="true"
                fill="#0f172a"
                stroke="white"
                strokeWidth="2"
                onPointerEnter={() =>
                  setHover({
                    x: pt.x,
                    y: pt.y,
                    label:
                      pt.label ?? "Intersection / equilibrium",
                  })
                }
                onPointerLeave={() =>
                  setHover(null)
                }
              />
            </g>
          ))}

        </svg>

        <div className="absolute left-3 top-3 flex gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm">
          <button
            className="h-9 w-9 rounded-lg hover:bg-slate-100"
            onClick={() =>
              setZoom((z) =>
                Math.min(4, z * 1.15)
              )
            }
          >
            +
          </button>

          <button
            className="h-9 w-9 rounded-lg hover:bg-slate-100"
            onClick={() =>
              setZoom((z) =>
                Math.max(0.5, z * 0.87)
              )
            }
          >
            −
          </button>

          <button
            className="rounded-lg px-3 text-xs font-semibold hover:bg-slate-100"
            onClick={reset}
          >
            Reset
          </button>
        </div>

        {hover && (
          <div className="pointer-events-none absolute right-3 top-3 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg">
            <div className="font-semibold text-slate-900">
              {hover.label}
            </div>

            <div className="mt-1 font-mono text-slate-600">
              X = {fmt(hover.x)} · Y ={" "}
              {fmt(hover.y)}
            </div>
          </div>
        )}

        <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] text-slate-500 shadow-sm">
          Drag to pan · scroll to zoom · hover curves and intersections
        </div>
          </>
        )}
      </div>

      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="font-semibold">
          Controls
        </h3>

        <div className="mt-4 space-y-4">
          {preset.controls.map(
            (control) => (
              <label
                key={control.key}
                className="block"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>
                    {control.label}
                  </span>

                  <span className="font-mono text-slate-900">
                    {controlDisplayValue(control, effectiveControls[control.key])}
                  </span>
                </div>

                <input
                  className="mt-2 w-full accent-slate-900"
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={effectiveControls[control.key]}
                  onChange={(e) =>
                    setControls({
                      ...controls,
                      [control.key]:
                        Number(e.target.value),
                    })
                  }
                />
              </label>
            )
          )}
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Curves
          </h4>

          <div className="mt-3 space-y-2">
            {curves.map((curve) => (
              <div
                key={curve.id}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className="h-2.5 w-7 rounded-full"
                  style={{
                    background:
                      curve.color,
                  }}
                />

                <span>
                  {curve.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            What to observe
          </h4>

          <ul className="mt-2 space-y-2 text-sm leading-5 text-slate-600">
            {preset.interpretation.map(
              (item) => (
                <li key={item}>
                  • {item}
                </li>
              )
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                 */
/* -------------------------------------------------------------------------- */

type StatMode =
  | "bar"
  | "multiple-bar"
  | "component-bar"
  | "percentage-bar"
  | "pie"
  | "histogram"
  | "frequency-polygon"
  | "frequency-curve"
  | "less-ogive"
  | "more-ogive"
  | "both-ogive"
  | "scatter"
  | "time-series"
  | "spearman"
  | "spearman-repeated"
  | "index-numbers";

type FrequencyRow = {
  lower: number;
  upper: number;
  frequency: number;
};

type PairedPoint = {
  x: number;
  y: number;
};

type IndexRow = {
  label: string;
  base: number;
  current: number;
};

const defaultRawData = [
  12, 15, 17, 18, 18, 20, 21, 22, 22, 23,
  24, 24, 25, 26, 27, 27, 28, 29, 30, 31,
  31, 32, 34, 35, 36, 37, 38, 40, 42, 45,
];

const defaultCategories = [
  { label: "A", value: 24 },
  { label: "B", value: 31 },
  { label: "C", value: 18 },
  { label: "D", value: 27 },
  { label: "E", value: 36 },
];

const defaultMultiple = [
  { label: "2024", a: 20, b: 30, c: 25 },
  { label: "2025", a: 28, b: 35, c: 32 },
  { label: "2026", a: 34, b: 42, c: 38 },
];

const defaultIndexRows: IndexRow[] = [
  { label: "Food", base: 100, current: 125 },
  { label: "Clothing", base: 80, current: 92 },
  { label: "Fuel", base: 60, current: 78 },
  { label: "Housing", base: 120, current: 138 },
  { label: "Other", base: 90, current: 99 },
];

const defaultFrequency: FrequencyRow[] = [
  { lower: 0, upper: 10, frequency: 4 },
  { lower: 10, upper: 20, frequency: 7 },
  { lower: 20, upper: 30, frequency: 11 },
  { lower: 30, upper: 40, frequency: 9 },
  { lower: 40, upper: 50, frequency: 6 },
  { lower: 50, upper: 60, frequency: 3 },
];

function parseNumbers(text: string) {
  return text
    .split(/[\s,;]+/)
    .map(Number)
    .filter(Number.isFinite);
}

function sum(values: number[]) {
  return values.reduce(
    (a, b) => a + b,
    0
  );
}

function mean(values: number[]) {
  if (!values.length) return 0;
  return sum(values) / values.length;
}

function median(values: number[]) {
  if (!values.length) return 0;

  const a = [...values].sort(
    (x, y) => x - y
  );

  const n = a.length;
  const mid = Math.floor(n / 2);

  return n % 2
    ? a[mid]
    : (a[mid - 1] + a[mid]) / 2;
}

function statisticalModes(values: number[]) {
  if (!values.length) return [];

  const freq = new Map<
    number,
    number
  >();

  values.forEach((v) =>
    freq.set(
      v,
      (freq.get(v) ?? 0) + 1
    )
  );

  const max = Math.max(
    ...Array.from(freq.values())
  );

  if (max <= 1) return [];

  return Array.from(freq.entries())
    .filter(([, f]) => f === max)
    .map(([v]) => v)
    .sort((a, b) => a - b);
}

function quantile(
  values: number[],
  q: number
) {
  if (!values.length) return 0;

  const a = [...values].sort(
    (x, y) => x - y
  );

  const pos =
    (a.length - 1) * q;

  const base = Math.floor(pos);
  const rest = pos - base;

  if (a[base + 1] !== undefined) {
    return (
      a[base] +
      rest *
        (a[base + 1] - a[base])
    );
  }

  return a[base];
}

function variance(values: number[]) {
  if (!values.length) return 0;

  const m = mean(values);

  return (
    sum(
      values.map(
        (v) => (v - m) ** 2
      )
    ) / values.length
  );
}

function standardDeviation(
  values: number[]
) {
  return Math.sqrt(variance(values));
}

function pearsonCorrelation(
  points: PairedPoint[]
) {
  if (points.length < 2) return 0;

  const xs = points.map(
    (p) => p.x
  );

  const ys = points.map(
    (p) => p.y
  );

  const mx = mean(xs);
  const my = mean(ys);

  const numerator = sum(
    points.map(
      (p) =>
        (p.x - mx) *
        (p.y - my)
    )
  );

  const dx = Math.sqrt(
    sum(
      xs.map(
        (x) =>
          (x - mx) ** 2
      )
    )
  );

  const dy = Math.sqrt(
    sum(
      ys.map(
        (y) =>
          (y - my) ** 2
      )
    )
  );

  if (!dx || !dy) return 0;

  return numerator / (dx * dy);
}

function rankValues(values: number[]) {
  const sorted = values.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  const ranks = new Array<number>(values.length).fill(0);
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1].value === sorted[i].value) j += 1;
    const averageRank = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k += 1) ranks[sorted[k].index] = averageRank;
    i = j + 1;
  }
  return ranks;
}

function tieCorrection(values: number[]) {
  const counts = new Map<number, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return Array.from(counts.values()).filter((count) => count > 1).reduce((total, count) => total + count ** 3 - count, 0);
}

function spearmanCorrelation(points: PairedPoint[], repeatedRanks = false) {
  if (points.length < 2) return 0;
  const rx = rankValues(points.map((p) => p.x));
  const ry = rankValues(points.map((p) => p.y));
  const n = points.length;
  const d2 = sum(rx.map((rank, i) => (rank - ry[i]) ** 2));
  if (!repeatedRanks) return 1 - (6 * d2) / (n * (n ** 2 - 1));
  const rankTerm = (n ** 3 - n) / 12;
  const tx = rankTerm - tieCorrection(points.map((p) => p.x)) / 12;
  const ty = rankTerm - tieCorrection(points.map((p) => p.y)) / 12;
  if (tx <= 0 || ty <= 0) return 0;
  return (tx + ty - d2) / (2 * Math.sqrt(tx * ty));
}

function simpleAggregativeIndex(rows: IndexRow[]) {
  const valid = rows.filter((row) => Number.isFinite(row.base) && Number.isFinite(row.current) && row.base > 0);
  if (!valid.length) return 0;
  const baseTotal = sum(valid.map((row) => row.base));
  const currentTotal = sum(valid.map((row) => row.current));
  return baseTotal === 0 ? 0 : (currentTotal / baseTotal) * 100;
}

function priceRelative(row: IndexRow) {
  return row.base > 0 ? (row.current / row.base) * 100 : 0;
}

function regressionLine(
  points: PairedPoint[]
) {
  if (points.length < 2) {
    return {
      slope: 0,
      intercept: 0,
    };
  }

  const xs = points.map(
    (p) => p.x
  );

  const ys = points.map(
    (p) => p.y
  );

  const mx = mean(xs);
  const my = mean(ys);

  const numerator = sum(
    points.map(
      (p) =>
        (p.x - mx) *
        (p.y - my)
    )
  );

  const denominator = sum(
    xs.map(
      (x) =>
        (x - mx) ** 2
    )
  );

  const slope =
    denominator === 0
      ? 0
      : numerator / denominator;

  return {
    slope,
    intercept:
      my - slope * mx,
  };
}

function frequencyStats(
  rows: FrequencyRow[]
) {
  const clean = rows.filter(
    (r) =>
      Number.isFinite(r.lower) &&
      Number.isFinite(r.upper) &&
      Number.isFinite(r.frequency) &&
      r.upper > r.lower &&
      r.frequency >= 0
  );

  const total = sum(
    clean.map((r) => r.frequency)
  );

  const weighted = sum(
    clean.map(
      (r) =>
        ((r.lower + r.upper) /
          2) *
        r.frequency
    )
  );

  const groupedMean =
    total === 0
      ? 0
      : weighted / total;

  const sorted = [...clean].sort(
    (a, b) => a.lower - b.lower
  );

  let cumulative = 0;

  const cumulativeRows =
    sorted.map((r) => {
      cumulative += r.frequency;

      return {
        ...r,
        midpoint:
          (r.lower + r.upper) / 2,
        cumulative,
        density:
          r.frequency /
          Math.max(
            r.upper - r.lower,
            1e-9
          ),
      };
    });

  return {
    rows: cumulativeRows,
    total,
    mean: groupedMean,
  };
}

/* -------------------------------------------------------------------------- */
/* Statistics graph canvas                                                    */
/* -------------------------------------------------------------------------- */

function StatGraph({
  mode,
  rawData,
  categories,
  multiple,
  frequencyRows,
  paired,
  showMean,
  showMedian,
  showMode,
}: {
  mode: StatMode;
  rawData: number[];
  categories: {
    label: string;
    value: number;
  }[];
  multiple: {
    label: string;
    a: number;
    b: number;
    c: number;
  }[];
  frequencyRows: FrequencyRow[];
  paired: PairedPoint[];
  showMean: boolean;
  showMedian: boolean;
  showMode: boolean;
}) {
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);

  const W = 960;
  const H = 540;
  const P = 72;

  const freq = useMemo(
    () => frequencyStats(frequencyRows),
    [frequencyRows]
  );

  const sortedRaw = useMemo(
    () =>
      [...rawData].sort(
        (a, b) => a - b
      ),
    [rawData]
  );

  const rawMax = Math.max(
    1,
    ...rawData
  );

  const categoryMax = Math.max(
    1,
    ...categories.map(
      (d) => d.value
    )
  );

  const multiMax = Math.max(
    1,
    ...multiple.flatMap((d) => [
      d.a,
      d.b,
      d.c,
    ])
  );

  const freqMax = Math.max(
    1,
    ...freq.rows.map(
      (r) => r.frequency
    )
  );

  const densityMax = Math.max(
    1,
    ...freq.rows.map(
      (r) => r.density
    )
  );

  const pairXMax = Math.max(
    1,
    ...paired.map((p) => p.x)
  );

  const pairYMax = Math.max(
    1,
    ...paired.map((p) => p.y)
  );

  let xMin = 0;
  let xMax = 10;
  let yMin = 0;
  let yMax = 10;

  if (
    mode === "bar" ||
    mode === "pie"
  ) {
    xMax =
      Math.max(
        categories.length,
        1
      ) + 1;

    yMax = categoryMax * 1.15;
  }

  if (
    mode === "multiple-bar" ||
    mode === "component-bar" ||
    mode === "percentage-bar"
  ) {
    xMax =
      Math.max(
        multiple.length,
        1
      ) + 1;

    yMax =
      mode === "percentage-bar"
        ? 100
        : Math.max(
  ...multiple.flatMap(group => [group.a, group.b, group.c])
) * 1.2;
  }

  if (
    mode === "histogram" ||
    mode === "frequency-polygon" ||
    mode === "frequency-curve"
  ) {
    xMin =
      freq.rows.length
        ? freq.rows[0].lower
        : 0;

    xMax =
      freq.rows.length
        ? freq.rows[
            freq.rows.length - 1
          ].upper
        : 10;

    yMax =
      mode === "histogram"
        ? densityMax * 1.2
        : freqMax * 1.2;
  }

  if (
    mode === "less-ogive" ||
    mode === "more-ogive" ||
    mode === "both-ogive"
  ) {
    xMin =
      freq.rows.length
        ? freq.rows[0].lower
        : 0;

    xMax =
      freq.rows.length
        ? freq.rows[
            freq.rows.length - 1
          ].upper
        : 10;

    yMax = Math.max(
      1,
      freq.total * 1.1
    );
  }

  if (mode === "scatter") {
    xMax = pairXMax * 1.1;
    yMax = pairYMax * 1.1;
  }

  if (mode === "time-series") {
    xMax = Math.max(categories.length, 1) + 1;
    yMax = categoryMax * 1.15;
  }

  const mapX = (x: number) =>
    P +
    ((x - xMin) /
      Math.max(xMax - xMin, 1e-9)) *
      (W - 2 * P);

  const mapY = (y: number) =>
    H -
    P -
    ((y - yMin) /
      Math.max(yMax - yMin, 1e-9)) *
      (H - 2 * P);

  const graphTicks = (
    min: number,
    max: number,
    count = 6
  ) => {
    const step =
      niceStep(
        (max - min) /
          Math.max(count - 1, 1)
      );

    const result: number[] = [];

    for (
      let v =
        Math.ceil(min / step) *
        step;
      v <= max + step * 0.01;
      v += step
    ) {
      result.push(
        Number(v.toFixed(6))
      );
    }

    return result;
  };

  const xs = graphTicks(
    xMin,
    xMax
  );

  const ys = graphTicks(
    yMin,
    yMax
  );

  const rawMean = mean(rawData);
  const rawMedian = median(rawData);
  const rawModes = statisticalModes(rawData);

  const drawLine = (
    points: Point[]
  ) => (
    <polyline
      fill="none"
      stroke="#2563eb"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      points={points
        .filter(
          (p) =>
            Number.isFinite(
              p.x
            ) &&
            Number.isFinite(
              p.y
            )
        )
        .map(
          (p) =>
            `${mapX(p.x)},${mapY(
              p.y
            )}`
        )
        .join(" ")}
    />
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none"
        onPointerMove={(e) => {
          const rect =
            e.currentTarget.getBoundingClientRect();

          const sx =
            ((e.clientX - rect.left) *
              W) /
            rect.width;

          const sy =
            ((e.clientY - rect.top) *
              H) /
            rect.height;

          const x =
            xMin +
            ((sx - P) /
              (W - 2 * P)) *
              (xMax - xMin);

          const y =
            yMax -
            ((sy - P) /
              (H - 2 * P)) *
              (yMax - yMin);

          let nearest:
            | {
                x: number;
                y: number;
                label: string;
                distance: number;
              }
            | null = null;

          if (
            mode === "scatter"
          ) {
            paired.forEach((p, i) => {
              const px = mapX(p.x);
              const py = mapY(p.y);
              const d = Math.hypot(
                px - sx,
                py - sy
              );

              if (
                !nearest ||
                d < nearest.distance
              ) {
                nearest = {
                  x: p.x,
                  y: p.y,
                  label: `Observation ${
                    i + 1
                  }`,
                  distance: d,
                };
              }
            });
          }

          if (
            mode === "bar" ||
            mode === "pie"
          ) {
            categories.forEach(
              (d, i) => {
                const px = mapX(
                  i + 1
                );
                const py = mapY(
                  d.value
                );

                const distance =
                  Math.hypot(
                    px - sx,
                    py - sy
                  );

                if (
                  !nearest ||
                  distance <
                    nearest.distance
                ) {
                  nearest = {
                    x: i + 1,
                    y: d.value,
                    label: d.label,
                    distance,
                  };
                }
              }
            );
          }

          if (
            nearest &&
            nearest.distance <
              28
          ) {
            setHover({
              x: nearest.x,
              y: nearest.y,
              label:
                nearest.label,
            });
          } else {
            setHover(null);
          }
        }}
        onPointerLeave={() =>
          setHover(null)
        }
      >
        <rect
          width={W}
          height={H}
          fill="white"
        />

        {xs.map((x) => (
          <g key={`sx-${x}`}>
            <line
              x1={mapX(x)}
              x2={mapX(x)}
              y1={P}
              y2={H - P}
              stroke="#e2e8f0"
            />

            <text
              x={mapX(x)}
              y={H - P + 22}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              {fmt(x)}
            </text>
          </g>
        ))}

        {ys.map((y) => (
          <g key={`sy-${y}`}>
            <line
              x1={P}
              x2={W - P}
              y1={mapY(y)}
              y2={mapY(y)}
              stroke="#e2e8f0"
            />

            <text
              x={P - 12}
              y={mapY(y) + 4}
              textAnchor="end"
              fontSize="12"
              fill="#64748b"
            >
              {fmt(y)}
            </text>
          </g>
        ))}

        <line
          x1={P}
          x2={P}
          y1={P}
          y2={H - P}
          stroke="#334155"
          strokeWidth="2"
        />

        <line
          x1={P}
          x2={W - P}
          y1={H - P}
          y2={H - P}
          stroke="#334155"
          strokeWidth="2"
        />

        {/* BAR GRAPH */}
        {mode === "bar" &&
          categories.map((d, i) => {
            const slot =
              (W - 2 * P) /
              categories.length;

            const width =
              slot * 0.62;

            const x =
              P +
              i * slot +
              (slot - width) /
                2;

            const h =
              mapY(0) -
              mapY(d.value);

            return (
              <g key={d.label}>
                <rect
                  x={x}
                  y={mapY(d.value)}
                  width={width}
                  height={h}
                  rx="4"
                  fill="#2563eb"
                  opacity="0.9"
                  onPointerEnter={() =>
                    setHover({
                      x: i + 1,
                      y: d.value,
                      label: d.label,
                    })
                  }
                  onPointerLeave={() =>
                    setHover(null)
                  }
                />

                <text
                  x={x + width / 2}
                  y={H - P + 22}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#475569"
                >
                  {d.label}
                </text>

                <text
                  x={x + width / 2}
                  y={mapY(d.value) - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#334155"
                >
                  {fmt(d.value)}
                </text>
              </g>
            );
          })}

        {/* MULTIPLE BAR */}
        {mode ===
          "multiple-bar" &&
          multiple.map((d, i) => {
            const slot =
              (W - 2 * P) /
              multiple.length;

            const groupWidth =
              slot * 0.72;

            const bw =
              groupWidth / 3.3;

            const start =
              P +
              i * slot +
              (slot -
                groupWidth) /
                2;

            const values = [
              d.a,
              d.b,
              d.c,
            ];

            return (
              <g key={d.label}>
                {values.map(
                  (v, j) => {
                    const x =
                      start +
                      j * bw;

                    return (
                      <rect
                        key={j}
                        x={x}
                        y={mapY(v)}
                        width={
                          bw - 3
                        }
                        height={
                          mapY(0) -
                          mapY(v)
                        }
                        fill={
                          curveColors[
                            j
                          ]
                        }
                        opacity="0.9"
                      />
                    );
                  }
                )}

                <text
                  x={
                    start +
                    groupWidth / 2
                  }
                  y={
                    H - P + 22
                  }
                  textAnchor="middle"
                  fontSize="12"
                  fill="#475569"
                >
                  {d.label}
                </text>
              </g>
            );
          })}

        {/* COMPONENT BAR */}
        {mode ===
          "component-bar" &&
          multiple.map((d, i) => {
            const total =
              d.a + d.b + d.c;

            const slot =
              (W - 2 * P) /
              multiple.length;

            const width =
              slot * 0.6;

            const x =
              P +
              i * slot +
              (slot - width) /
                2;

            const values = [
              d.a,
              d.b,
              d.c,
            ];

            let accumulated = 0;

            return (
              <g key={d.label}>
                {values.map(
                  (v, j) => {
                    const y1 =
                      accumulated;

                    accumulated += v;

                    return (
                      <rect
                        key={j}
                        x={x}
                        y={mapY(
                          accumulated
                        )}
                        width={width}
                        height={
                          mapY(y1) -
                          mapY(
                            accumulated
                          )
                        }
                        fill={
                          curveColors[
                            j
                          ]
                        }
                      />
                    );
                  }
                )}

                <text
                  x={x + width / 2}
                  y={
                    H - P + 22
                  }
                  textAnchor="middle"
                  fontSize="12"
                  fill="#475569"
                >
                  {d.label}
                </text>

                <text
                  x={x + width / 2}
                  y={
                    mapY(total) -
                    7
                  }
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#334155"
                >
                  {fmt(total)}
                </text>
              </g>
            );
          })}

        {/* PERCENTAGE BAR */}
        {mode ===
          "percentage-bar" &&
          multiple.map((d, i) => {
            const values = [
              d.a,
              d.b,
              d.c,
            ];

            const total =
              sum(values);

            const slot =
              (W - 2 * P) /
              multiple.length;

            const width =
              slot * 0.6;

            const x =
              P +
              i * slot +
              (slot - width) /
                2;

            let accumulated = 0;

            return (
              <g key={d.label}>
                {values.map(
                  (v, j) => {
                    const start =
                      accumulated;

                    accumulated +=
                      (v / total) *
                      100;

                    return (
                      <rect
                        key={j}
                        x={x}
                        y={mapY(
                          accumulated
                        )}
                        width={width}
                        height={
                          mapY(start) -
                          mapY(
                            accumulated
                          )
                        }
                        fill={
                          curveColors[
                            j
                          ]
                        }
                      />
                    );
                  }
                )}

                <text
                  x={x + width / 2}
                  y={
                    H - P + 22
                  }
                  textAnchor="middle"
                  fontSize="12"
                  fill="#475569"
                >
                  {d.label}
                </text>
              </g>
            );
          })}

        {/* TIME SERIES */}
        {mode === "time-series" &&
          (() => {
            const points = categories.map((d, i) => ({
              x: i + 1,
              y: d.value,
              label: d.label,
            }));

            return (
              <g>
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points.map((p) => String(mapX(p.x)) + "," + String(mapY(p.y))).join(" ")}
                />
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={mapX(p.x)}
                    cy={mapY(p.y)}
                    r="6"
                    fill="#2563eb"
                    stroke="white"
                    strokeWidth="2"
                    onPointerEnter={() =>
                      setHover({
                        x: p.x,
                        y: p.y,
                        label: p.label,
                      })
                    }
                    onPointerLeave={() => setHover(null)}
                  />
                ))}
              </g>
            );
          })()}

        {/* HISTOGRAM */}
        {mode === "histogram" &&
          freq.rows.map((r, i) => {
            const x1 = mapX(
              r.lower
            );

            const x2 = mapX(
              r.upper
            );

            const y = mapY(
              r.density
            );

            return (
              <rect
                key={i}
                x={x1}
                y={y}
                width={Math.max(
                  1,
                  x2 - x1
                )}
                height={
                  mapY(0) - y
                }
                fill="#16a34a"
                fillOpacity="0.72"
                stroke="#14532d"
                strokeWidth="1"
              />
            );
          })}

        {/* FREQUENCY POLYGON */}
        {mode ===
          "frequency-polygon" &&
          drawLine(
            freq.rows.map(
              (r) => ({
                x: r.midpoint,
                y: r.frequency,
              })
            )
          )}

        {/* FREQUENCY CURVE */}
        {mode ===
          "frequency-curve" &&
          drawLine(
            freq.rows.map(
              (r) => ({
                x: r.midpoint,
                y: r.frequency,
              })
            )
          )}

        {/* OGIVES */}
        {(mode === "less-ogive" ||
          mode === "both-ogive") &&
          drawLine(
            freq.rows.map(
              (r) => ({
                x: r.upper,
                y: r.cumulative,
              })
            )
          )}

        {(mode === "more-ogive" ||
          mode === "both-ogive") &&
          (() => {
            let cumulative = 0;

            const points =
              freq.rows.map(
                (r) => ({
                  x: r.lower,
                  y:
                    freq.total -
                    cumulative,
                })
              );

            return drawLine(
              points
            );
          })()}

        {/* PIE */}
        {mode === "pie" &&
          (() => {
            const total =
              sum(
                categories.map(
                  (d) => d.value
                )
              );

            if (!total) return null;

            const cx = W / 2;
            const cy = H / 2;
            const r = 165;

            let start =
              -Math.PI / 2;

            return (
              <g>
                {categories.map(
                  (d, i) => {
                    const angle =
                      (d.value /
                        total) *
                      Math.PI *
                      2;

                    const end =
                      start + angle;

                    const x1 =
                      cx +
                      r *
                        Math.cos(
                          start
                        );

                    const y1 =
                      cy +
                      r *
                        Math.sin(
                          start
                        );

                    const x2 =
                      cx +
                      r *
                        Math.cos(
                          end
                        );

                    const y2 =
                      cy +
                      r *
                        Math.sin(
                          end
                        );

                    const large =
                      angle >
                      Math.PI
                        ? 1
                        : 0;

                    const path = `
                      M ${cx} ${cy}
                      L ${x1} ${y1}
                      A ${r} ${r} 0 ${large} 1 ${x2} ${y2}
                      Z
                    `;

                    const result = (
                      <path
                        key={
                          d.label
                        }
                        d={path}
                        fill={
                          curveColors[
                            i %
                              curveColors.length
                          ]
                        }
                        stroke="white"
                        strokeWidth="3"
                        onPointerEnter={() =>
                          setHover({
                            x:
                              i +
                              1,
                            y:
                              d.value,
                            label:
                              `${d.label} · ${(
                                (d.value /
                                  total) *
                                100
                              ).toFixed(
                                1
                              )}%`,
                          })
                        }
                        onPointerLeave={() =>
                          setHover(
                            null
                          )
                        }
                      />
                    );

                    start = end;

                    return result;
                  }
                )}
              </g>
            );
          })()}

        {/* SCATTER */}
        {mode === "scatter" &&
          paired.map((p, i) => (
            <circle
              key={i}
              cx={mapX(p.x)}
              cy={mapY(p.y)}
              r="6"
              fill="#9333ea"
              stroke="white"
              strokeWidth="2"
              onPointerEnter={() =>
                setHover({
                  x: p.x,
                  y: p.y,
                  label: `Observation ${
                    i + 1
                  }`,
                })
              }
              onPointerLeave={() =>
                setHover(null)
              }
            />
          ))}

        {mode === "scatter" &&
          paired.length >= 2 &&
          (() => {
            const reg =
              regressionLine(
                paired
              );

            return (
              <line
                x1={mapX(xMin)}
                y1={mapY(
                  reg.intercept +
                    reg.slope *
                      xMin
                )}
                x2={mapX(xMax)}
                y2={mapY(
                  reg.intercept +
                    reg.slope *
                      xMax
                )}
                stroke="#dc2626"
                strokeWidth="3"
                strokeDasharray="9 7"
              />
            );
          })()}

        {/* Central tendency guides */}
        {(showMean ||
          showMedian ||
          showMode) &&
          mode !== "pie" &&
          mode !== "scatter" && (
            <g>
              {showMean &&
                rawData.length >
                  0 && (
                  <line
                    x1={mapX(
                      rawMean
                    )}
                    x2={mapX(
                      rawMean
                    )}
                    y1={P}
                    y2={H - P}
                    stroke="#dc2626"
                    strokeWidth="2"
                    strokeDasharray="6 5"
                  />
                )}

              {showMedian &&
                rawData.length >
                  0 && (
                  <line
                    x1={mapX(
                      rawMedian
                    )}
                    x2={mapX(
                      rawMedian
                    )}
                    y1={P}
                    y2={H - P}
                    stroke="#16a34a"
                    strokeWidth="2"
                    strokeDasharray="6 5"
                  />
                )}

              {showMode &&
                rawModes.map(
                  (m) => (
                    <line
                      key={m}
                      x1={mapX(m)}
                      x2={mapX(m)}
                      y1={P}
                      y2={H - P}
                      stroke="#9333ea"
                      strokeWidth="2"
                      strokeDasharray="6 5"
                    />
                  )
                )}
            </g>
          )}

        <text
          x={W / 2}
          y={H - 18}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#334155"
        >
          {mode === "scatter"
            ? "Variable X"
            : mode === "time-series"
            ? "Time period"
            : mode.includes(
                "ogive"
              )
            ? "Class boundary"
            : mode.includes(
                "histogram"
              )
            ? "Class interval"
            : "Category / Value"}
        </text>

        <text
          x={20}
          y={H / 2}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#334155"
          transform={`rotate(-90 20 ${
            H / 2
          })`}
        >
          {mode === "scatter"
            ? "Variable Y"
            : mode === "time-series"
            ? "Value"
            : mode === "histogram"
            ? "Frequency density"
            : mode.includes(
                "ogive"
              )
            ? "Cumulative frequency"
            : "Frequency / Value"}
        </text>
      </svg>

      {hover && (
        <div className="pointer-events-none absolute right-4 top-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg">
          <div className="font-semibold text-slate-900">
            {hover.label}
          </div>

          <div className="mt-1 font-mono text-slate-600">
            x = {fmt(hover.x)} · y ={" "}
            {fmt(hover.y)}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Statistics control panel                                                   */
/* -------------------------------------------------------------------------- */

export function StatisticsLab() {
  const [mode, setMode] =
    useState<StatMode>("bar");

  const [rawText, setRawText] =
    useState(
      defaultRawData.join(", ")
    );

  const [categories, setCategories] =
    useState(defaultCategories);

  const [multiple, setMultiple] =
    useState(defaultMultiple);

  const [frequencyRows, setFrequencyRows] =
    useState(defaultFrequency);

  const [pairedText, setPairedText] =
    useState(
      [
        "10,18",
        "15,21",
        "20,24",
        "25,31",
        "30,35",
        "35,39",
        "40,46",
        "45,51",
      ].join("\n")
    );

  const [indexRows, setIndexRows] =
    useState<IndexRow[]>(defaultIndexRows);

  const [showMean, setShowMean] =
    useState(false);

  const [showMedian, setShowMedian] =
    useState(false);

  const [showMode, setShowMode] =
    useState(false);

  const rawData = useMemo(
    () => parseNumbers(rawText),
    [rawText]
  );

  const paired =
    useMemo<PairedPoint[]>(
      () =>
        pairedText
          .split("\n")
          .map((line) => {
            const values =
              line
                .split(
                  /[\s,;]+/
                )
                .map(Number)
                .filter(
                  Number.isFinite
                );

            return {
              x: values[0],
              y: values[1],
            };
          })
          .filter(
            (p) =>
              Number.isFinite(
                p.x
              ) &&
              Number.isFinite(
                p.y
              )
          ),
      [pairedText]
    );

  const rawMean = mean(rawData);
  const rawMedian = median(
    rawData
  );
  const rawModes = statisticalModes(rawData);
  const q1 = quantile(
    rawData,
    0.25
  );
  const q3 = quantile(
    rawData,
    0.75
  );
  const range =
    rawData.length
      ? Math.max(
          ...rawData
        ) -
        Math.min(
          ...rawData
        )
      : 0;

  const qd =
    (q3 - q1) / 2;

  const md =
    rawData.length
      ? mean(
          rawData.map(
            (v) =>
              Math.abs(
                v - rawMean
              )
          )
        )
      : 0;

  const sd =
    standardDeviation(
      rawData
    );

  const cv =
    rawMean === 0
      ? 0
      : (sd / rawMean) *
        100;

  const correlation =
    pearsonCorrelation(
      paired
    );

  const spearman = spearmanCorrelation(paired, false);
  const spearmanRepeated = spearmanCorrelation(paired, true);
  const indexValue = simpleAggregativeIndex(indexRows);
  const indexChangeFromBase = indexValue - 100;

  const grouped =
    frequencyStats(
      frequencyRows
    );

  const statCards = [
    {
      label: "N",
      value: rawData.length,
    },
    {
      label: "Mean",
      value: fmt(rawMean),
    },
    {
      label: "Median",
      value: fmt(
        rawMedian
      ),
    },
    {
      label: "Mode",
      value:
        rawModes.length
          ? rawModes
              .map(fmt)
              .join(", ")
          : "No mode",
    },
    {
      label: "Range",
      value: fmt(range),
    },
    {
      label: "Q.D.",
      value: fmt(qd),
    },
    {
      label: "S.D.",
      value: fmt(sd),
    },
    {
      label: "C.V.",
      value: `${fmt(cv)}%`,
    },
  ];

  const graphGroups = [
    {
      title: "Data Presentation",
      items: [
        ["bar", "Bar diagram"],
        [
          "multiple-bar",
          "Multiple bar",
        ],
        [
          "component-bar",
          "Component bar",
        ],
        [
          "percentage-bar",
          "Percentage bar",
        ],
        ["pie", "Pie diagram"],
      ] as [
        StatMode,
        string
      ][],
    },
    {
      title: "Frequency Distribution",
      items: [
        ["histogram", "Histogram"],
        [
          "frequency-polygon",
          "Frequency polygon",
        ],
        [
          "frequency-curve",
          "Frequency curve",
        ],
      ] as [
        StatMode,
        string
      ][],
    },
    {
      title: "Cumulative Frequency",
      items: [
        [
          "less-ogive",
          "Less-than ogive",
        ],
        [
          "more-ogive",
          "More-than ogive",
        ],
        [
          "both-ogive",
          "Combined ogives",
        ],
      ] as [
        StatMode,
        string
      ][],
    },
    {
      title: "Time Series & Correlation",
      items: [
        ["time-series", "Time-series graph"],
        ["scatter", "Scatter plot"],
      ] as [
        StatMode,
        string
      ][],
    },
    {
      title: "Correlation & Index Numbers",
      items: [
        ["spearman", "Spearman rank - no ties"],
        ["spearman-repeated", "Spearman rank - repeated ranks"],
        ["index-numbers", "Index numbers"],
      ] as [StatMode, string][],
    },
  ];

  const resetDataset = () => {
    setRawText(
      defaultRawData.join(", ")
    );

    setCategories(
      defaultCategories
    );

    setMultiple(
      defaultMultiple
    );

    setFrequencyRows(
      defaultFrequency
    );

    setPairedText(
      [
        "10,18",
        "15,21",
        "20,24",
        "25,31",
        "30,35",
        "35,39",
        "40,46",
        "45,51",
      ].join("\n")
    );
    setIndexRows(defaultIndexRows);
  };

  return (
    <div className="space-y-5">
      {/* DATA INPUT */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              01 · Data
            </div>

            <h2 className="mt-1 text-xl font-semibold">
              Statistics Data Workspace
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Enter your own data once and use it across the statistical tools. The graph is now actually doing statistics instead of merely looking statistical.
            </p>
          </div>

          <button
            onClick={resetDataset}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
          >
            Reset sample data
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Raw observations
            </label>

            <textarea
              value={rawText}
              onChange={(e) =>
                setRawText(
                  e.target.value
                )
              }
              className="mt-2 h-28 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm outline-none focus:border-slate-400"
              placeholder="12, 15, 18, 20, 20, 24..."
            />

            <p className="mt-1 text-[11px] text-slate-400">
              Separate values with commas, spaces, semicolons or line breaks.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Paired observations for correlation
            </label>

            <textarea
              value={pairedText}
              onChange={(e) =>
                setPairedText(
                  e.target.value
                )
              }
              className="mt-2 h-28 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm outline-none focus:border-slate-400"
              placeholder={"10,18\n15,21\n20,25"}
            />

            <p className="mt-1 text-[11px] text-slate-400">
              One X,Y pair per line.
            </p>
          </div>
        </div>
      </div>

      {/* QUICK STATISTICS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {card.label}
            </div>

            <div className="mt-1 truncate text-lg font-semibold text-slate-900">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* GRAPH NAVIGATION */}
      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          {graphGroups.map(
            (group) => (
              <div
                key={group.title}
                className="mb-5 last:mb-0"
              >
                <div className="px-2 py-2 text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">
                  {group.title}
                </div>

                <div className="space-y-1">
                  {group.items.map(
                    ([id, label]) => (
                      <button
                        key={id}
                        onClick={() =>
                          setMode(id)
                        }
                        className={`w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold ${
                          mode === id
                            ? "bg-slate-950 text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          )}
        </aside>

        <section className="min-w-0">
          {/* BAR DATA */}
          {(mode === "bar" ||
            mode === "pie" ||
            mode === "time-series") && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Category data
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {mode === "time-series"
                      ? "Enter periods in chronological order. The line joins observations to show movement over time."
                      : "Use this for discrete categories, not continuous class intervals."}
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                      <th className="px-2 py-2">
                        Category
                      </th>
                      <th className="px-2 py-2">
                        Value
                      </th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {categories.map(
                      (row, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-50"
                        >
                          <td className="px-2 py-2">
                            <input
                              value={
                                row.label
                              }
                              onChange={(
                                e
                              ) => {
                                const next =
                                  [
                                    ...categories,
                                  ];

                                next[i] =
                                  {
                                    ...next[
                                      i
                                    ],
                                    label:
                                      e
                                        .target
                                        .value,
                                  };

                                setCategories(
                                  next
                                );
                              }}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
                            />
                          </td>

                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={
                                row.value
                              }
                              onChange={(
                                e
                              ) => {
                                const next =
                                  [
                                    ...categories,
                                  ];

                                next[i] =
                                  {
                                    ...next[
                                      i
                                    ],
                                    value:
                                      Number(
                                        e
                                          .target
                                          .value
                                      ),
                                  };

                                setCategories(
                                  next
                                );
                              }}
                              className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
                            />
                          </td>

                          <td className="px-2 py-2 text-right">
                            <button
                              onClick={() =>
                                setCategories(
                                  categories.filter(
                                    (
                                      _,
                                      j
                                    ) =>
                                      j !==
                                      i
                                  )
                                )
                              }
                              className="text-xs font-semibold text-red-500"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() =>
                  setCategories([
                    ...categories,
                    {
                      label: `New ${
                        categories.length +
                        1
                      }`,
                      value: 10,
                    },
                  ])
                }
                className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold hover:bg-slate-200"
              >
                + Add category
              </button>
            </div>
          )}

          {/* MULTIPLE DATA */}
          {(mode ===
            "multiple-bar" ||
            mode ===
              "component-bar" ||
            mode ===
              "percentage-bar") && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold">
                Multiple-series data
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                A, B and C represent three related series.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                      <th className="px-2 py-2">
                        Group
                      </th>
                      <th className="px-2 py-2">
                        A
                      </th>
                      <th className="px-2 py-2">
                        B
                      </th>
                      <th className="px-2 py-2">
                        C
                      </th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {multiple.map(
                      (row, i) => (
                        <tr
                          key={i}
                          className="border-b border-slate-50"
                        >
                          {(
                            [
                              "label",
                              "a",
                              "b",
                              "c",
                            ] as const
                          ).map(
                            (key) => (
                              <td
                                key={key}
                                className="px-2 py-2"
                              >
                                <input
                                  type={
                                    key ===
                                    "label"
                                      ? "text"
                                      : "number"
                                  }
                                  value={
                                    row[
                                      key
                                    ]
                                  }
                                  onChange={(
                                    e
                                  ) => {
                                    const next =
                                      [
                                        ...multiple,
                                      ];

                                    next[i] =
                                      {
                                        ...next[
                                          i
                                        ],
                                        [key]:
                                          key ===
                                          "label"
                                            ? e
                                                .target
                                                .value
                                            : Number(
                                                e
                                                  .target
                                                  .value
                                              ),
                                      };

                                    setMultiple(
                                      next
                                    );
                                  }}
                                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
                                />
                              </td>
                            )
                          )}

                          <td className="px-2 py-2 text-right">
                            <button
                              onClick={() =>
                                setMultiple(
                                  multiple.filter(
                                    (
                                      _,
                                      j
                                    ) =>
                                      j !==
                                      i
                                  )
                                )
                              }
                              className="text-xs font-semibold text-red-500"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() =>
                  setMultiple([
                    ...multiple,
                    {
                      label: `New ${
                        multiple.length +
                        1
                      }`,
                      a: 10,
                      b: 15,
                      c: 12,
                    },
                  ])
                }
                className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold hover:bg-slate-200"
              >
                + Add group
              </button>
            </div>
          )}

          {/* FREQUENCY TABLE */}
          {(mode ===
            "histogram" ||
            mode ===
              "frequency-polygon" ||
            mode ===
              "frequency-curve" ||
            mode ===
              "less-ogive" ||
            mode ===
              "more-ogive" ||
            mode ===
              "both-ogive") && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">
                    Frequency distribution
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Histogram height uses frequency density, so unequal class widths are handled correctly.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                  Total frequency:{" "}
                  {
                    grouped.total
                  }
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                      <th className="px-2 py-2">
                        Lower
                      </th>
                      <th className="px-2 py-2">
                        Upper
                      </th>
                      <th className="px-2 py-2">
                        Frequency
                      </th>
                      <th className="px-2 py-2">
                        Midpoint
                      </th>
                      <th className="px-2 py-2">
                        Density
                      </th>
                      <th className="px-2 py-2">
                        C.F.
                      </th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {frequencyRows.map(
                      (row, i) => {
                        const width =
                          row.upper -
                          row.lower;

                        return (
                          <tr
                            key={i}
                            className="border-b border-slate-50"
                          >
                            {(
                              [
                                "lower",
                                "upper",
                                "frequency",
                              ] as const
                            ).map(
                              (key) => (
                                <td
                                  key={
                                    key
                                  }
                                  className="px-2 py-2"
                                >
                                  <input
                                    type="number"
                                    value={
                                      row[
                                        key
                                      ]
                                    }
                                    onChange={(
                                      e
                                    ) => {
                                      const next =
                                        [
                                          ...frequencyRows,
                                        ];

                                      next[
                                        i
                                      ] =
                                        {
                                          ...next[
                                            i
                                          ],
                                          [key]:
                                            Number(
                                              e
                                                .target
                                                .value
                                            ),
                                        };

                                      setFrequencyRows(
                                        next
                                      );
                                    }}
                                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5"
                                  />
                                </td>
                              )
                            )}

                            <td className="px-2 py-2 font-mono text-xs text-slate-500">
                              {fmt(
                                (row.lower +
                                  row.upper) /
                                  2
                              )}
                            </td>

                            <td className="px-2 py-2 font-mono text-xs text-slate-500">
                              {fmt(
                                width >
                                  0
                                  ? row.frequency /
                                      width
                                  : 0
                              )}
                            </td>

                            <td className="px-2 py-2 font-mono text-xs text-slate-500">
                              {fmt(
                                grouped
                                  .rows[
                                    i
                                  ]
                                  ?.cumulative ??
                                  0
                              )}
                            </td>

                            <td className="px-2 py-2 text-right">
                              <button
                                onClick={() =>
                                  setFrequencyRows(
                                    frequencyRows.filter(
                                      (
                                        _,
                                        j
                                      ) =>
                                        j !==
                                        i
                                    )
                                  )
                                }
                                className="text-xs font-semibold text-red-500"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() =>
                  setFrequencyRows([
                    ...frequencyRows,
                    {
                      lower:
                        frequencyRows.length
                          ? frequencyRows[
                              frequencyRows.length -
                                1
                            ].upper
                          : 0,
                      upper:
                        frequencyRows.length
                          ? frequencyRows[
                              frequencyRows.length -
                                1
                            ].upper +
                            10
                          : 10,
                      frequency: 5,
                    },
                  ])
                }
                className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold hover:bg-slate-200"
              >
                + Add class
              </button>
            </div>
          )}

          {/* GRAPH */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Interactive graph
                </div>

                <h3 className="mt-1 text-lg font-semibold">
                  {graphGroups
                    .flatMap(
                      (g) => g.items
                    )
                    .find(
                      ([id]) =>
                        id === mode
                    )?.[1] ??
                    "Statistics graph"}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700">
                  <input
                    type="checkbox"
                    checked={
                      showMean
                    }
                    onChange={(e) =>
                      setShowMean(
                        e.target
                          .checked
                      )
                    }
                  />
                  Mean
                </label>

                <label className="flex items-center gap-2 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-700">
                  <input
                    type="checkbox"
                    checked={
                      showMedian
                    }
                    onChange={(e) =>
                      setShowMedian(
                        e.target
                          .checked
                      )
                    }
                  />
                  Median
                </label>

                <label className="flex items-center gap-2 rounded-lg bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-purple-700">
                  <input
                    type="checkbox"
                    checked={
                      showMode
                    }
                    onChange={(e) =>
                      setShowMode(
                        e.target
                          .checked
                      )
                    }
                  />
                  Mode
                </label>
              </div>
            </div>

            {mode === "spearman" || mode === "spearman-repeated" || mode === "index-numbers" ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                {mode === "index-numbers" ? (
                  <div className="space-y-5">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Index numbers</div>
                      <h3 className="mt-1 text-lg font-semibold">Simple Aggregative Method</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">Enter base-period and current-period prices. Index = ΣP₁ / ΣP₀ × 100.</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[620px] text-sm">
                        <thead><tr className="border-b border-slate-100 text-left text-xs text-slate-400"><th className="px-2 py-2">Item</th><th className="px-2 py-2">Base P₀</th><th className="px-2 py-2">Current P₁</th><th className="px-2 py-2">Price relative</th><th /></tr></thead>
                        <tbody>
                          {indexRows.map((row, i) => (
                            <tr key={i} className="border-b border-slate-50">
                              <td className="px-2 py-2"><input value={row.label} onChange={(e) => { const next=[...indexRows]; next[i]={...next[i],label:e.target.value}; setIndexRows(next); }} className="w-full rounded-lg border border-slate-200 px-2 py-1.5" /></td>
                              <td className="px-2 py-2"><input type="number" min="0" value={row.base} onChange={(e) => { const next=[...indexRows]; next[i]={...next[i],base:Number(e.target.value)}; setIndexRows(next); }} className="w-full rounded-lg border border-slate-200 px-2 py-1.5" /></td>
                              <td className="px-2 py-2"><input type="number" min="0" value={row.current} onChange={(e) => { const next=[...indexRows]; next[i]={...next[i],current:Number(e.target.value)}; setIndexRows(next); }} className="w-full rounded-lg border border-slate-200 px-2 py-1.5" /></td>
                              <td className="px-2 py-2 font-mono">{fmt(priceRelative(row))}</td>
                              <td className="px-2 py-2 text-right"><button onClick={() => setIndexRows(indexRows.filter((_,j)=>j!==i))} className="text-xs font-semibold text-red-500">Remove</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button onClick={() => setIndexRows([...indexRows,{label:"Item "+(indexRows.length+1),base:100,current:110}])} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold hover:bg-slate-200">+ Add item</button>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[["ΣP₀",sum(indexRows.map(r=>r.base))],["ΣP₁",sum(indexRows.map(r=>r.current))],["Index",indexValue]].map(([label,value])=><div key={String(label)} className="rounded-xl bg-slate-50 p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 text-xl font-semibold">{fmt(Number(value))}</div></div>)}
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600"><strong className="text-slate-900">Base = 100:</strong> the sample index is {fmt(indexValue)}, so the index has changed by {fmt(indexChangeFromBase)} points from the base index.</div>
                    <div className="grid gap-3 md:grid-cols-3">
                      {[['WPI','Wholesale Price Index','Wholesale-level price index.'],['CPI','Consumer Price Index','Consumer-oriented price index.'],['IIP','Index of Industrial Production','Industrial production index.']].map(([abbr,title,body])=><div key={abbr} className="rounded-xl border border-slate-200 p-4"><div className="text-xs font-bold uppercase tracking-wider text-slate-400">{abbr}</div><div className="mt-1 font-semibold">{title}</div><div className="mt-1 text-xs leading-5 text-slate-500">{body}</div></div>)}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div><div className="text-xs font-bold uppercase tracking-wider text-slate-400">Correlation</div><h3 className="mt-1 text-lg font-semibold">Spearman rank correlation</h3><p className="mt-1 text-sm leading-6 text-slate-500">Ranks are calculated automatically from the paired observations above.</p></div>
                    <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">No repeated ranks</div><div className="mt-1 font-mono text-2xl font-semibold">{spearman.toFixed(4)}</div></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Repeated ranks</div><div className="mt-1 font-mono text-2xl font-semibold">{spearmanRepeated.toFixed(4)}</div></div></div>
                    <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm"><thead><tr className="border-b border-slate-100 text-left text-xs text-slate-400"><th className="px-2 py-2">X</th><th className="px-2 py-2">Y</th><th className="px-2 py-2">Rank X</th><th className="px-2 py-2">Rank Y</th><th className="px-2 py-2">d</th><th className="px-2 py-2">d²</th></tr></thead><tbody>{(() => { const rx=rankValues(paired.map(p=>p.x)); const ry=rankValues(paired.map(p=>p.y)); return paired.map((p,i)=>{const d=rx[i]-ry[i]; return <tr key={i} className="border-b border-slate-50"><td className="px-2 py-2 font-mono">{fmt(p.x)}</td><td className="px-2 py-2 font-mono">{fmt(p.y)}</td><td className="px-2 py-2 font-mono">{fmt(rx[i])}</td><td className="px-2 py-2 font-mono">{fmt(ry[i])}</td><td className="px-2 py-2 font-mono">{fmt(d)}</td><td className="px-2 py-2 font-mono">{fmt(d*d)}</td></tr>})})()}</tbody></table></div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600"><div className="font-semibold text-slate-900">Formula</div><div className="mt-1 font-mono">ρ = 1 − 6Σd² / [n(n² − 1)]</div>{mode === "spearman-repeated" && <div className="mt-2">Repeated ranks use average ranks and the tie correction.</div>}</div>
                  </div>
                )}
              </div>
            ) : (
              <StatGraph mode={mode} rawData={rawData} categories={categories} multiple={multiple} frequencyRows={frequencyRows} paired={paired} showMean={showMean} showMedian={showMedian} showMode={showMode} />
            )}
          </div>

          {/* NUMERICAL ANALYSIS */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Central tendency
              </div>

              <h3 className="mt-1 font-semibold">
                Mean · Median · Mode
              </h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between rounded-xl bg-slate-50 px-3 py-3">
                  <span>
                    Arithmetic Mean
                  </span>
                  <strong>
                    {fmt(
                      rawMean
                    )}
                  </strong>
                </div>

                <div className="flex justify-between rounded-xl bg-slate-50 px-3 py-3">
                  <span>
                    Median
                  </span>
                  <strong>
                    {fmt(
                      rawMedian
                    )}
                  </strong>
                </div>

                <div className="flex justify-between rounded-xl bg-slate-50 px-3 py-3">
                  <span>
                    Mode
                  </span>
                  <strong>
                    {rawModes.length
                      ? rawModes
                          .map(
                            fmt
                          )
                          .join(
                            ", "
                          )
                      : "No mode"}
                  </strong>
                </div>

                <div className="rounded-xl bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500">
                  For grouped data, the workspace also calculates the grouped arithmetic mean from class midpoints and frequencies.
                  Grouped mean:{" "}
                  <strong className="text-slate-800">
                    {fmt(
                      grouped.mean
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dispersion
              </div>

              <h3 className="mt-1 font-semibold">
                Spread of the distribution
              </h3>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {[
                  [
                    "Q1",
                    q1,
                  ],
                  [
                    "Q3",
                    q3,
                  ],
                  [
                    "Range",
                    range,
                  ],
                  [
                    "Quartile Deviation",
                    qd,
                  ],
                  [
                    "Mean Deviation",
                    md,
                  ],
                  [
                    "Variance",
                    variance(
                      rawData
                    ),
                  ],
                  [
                    "Standard Deviation",
                    sd,
                  ],
                  [
                    "Coefficient of Variation",
                    `${fmt(
                      cv
                    )}%`,
                  ],
                ].map(
                  ([label, value]) => (
                    <div
                      key={String(
                        label
                      )}
                      className="rounded-xl bg-slate-50 px-3 py-3"
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {label}
                      </div>

                      <div className="mt-1 font-mono text-sm font-semibold text-slate-800">
                        {typeof value ===
                        "number"
                          ? fmt(
                              value
                            )
                          : value}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* CORRELATION ANALYSIS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Correlation
            </div>

            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">
                  Pearson's correlation coefficient
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  r = {correlation.toFixed(4)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs">
                <div className="font-semibold text-slate-700">
                  Interpretation
                </div>

                <div className="mt-1 text-slate-500">
                  {Math.abs(
                    correlation
                  ) < 0.2
                    ? "Very weak / negligible linear relationship"
                    : Math.abs(
                        correlation
                      ) < 0.4
                    ? "Weak linear relationship"
                    : Math.abs(
                        correlation
                      ) < 0.7
                    ? "Moderate linear relationship"
                    : Math.abs(
                        correlation
                      ) < 0.9
                    ? "Strong linear relationship"
                    : "Very strong linear relationship"}
                </div>
              </div>
            </div>
          </div>

          {/* EXAM NOTES */}
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Exam construction logic
            </div>

            <h3 className="mt-1 text-lg font-semibold">
              Which graph should you use?
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                [
                  "Bar diagram",
                  "Discrete categories or qualitative data.",
                ],
                [
                  "Histogram",
                  "Continuous grouped frequency distribution.",
                ],
                [
                  "Frequency polygon",
                  "Show the shape of a frequency distribution and compare distributions.",
                ],
                [
                  "Ogive",
                  "Cumulative frequency and locating median / quartiles graphically.",
                ],
                [
                  "Pie diagram",
                  "Show parts of a whole as percentages or proportions.",
                ],
                [
                  "Scatter plot",
                  "Study the relationship between two quantitative variables.",
                ],
                [
                  "Multiple bar",
                  "Compare several related series across categories.",
                ],
                [
                  "Component / percentage bar",
                  "Show composition, either absolute or percentage-based.",
                ],
              ].map(
                ([title, text]) => (
                  <div
                    key={title}
                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="text-sm font-semibold">
                      {title}
                    </div>

                    <div className="mt-1 text-xs leading-5 text-slate-400">
                      {text}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

