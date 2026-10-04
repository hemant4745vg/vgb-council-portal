"use client";

import { useMemo, useState } from "react";

function Shell({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Num({ label, value, set, step = 1 }: { label: string; value: number; set: (n: number) => void; step?: number }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input type="number" step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
    </label>
  );
}

function fact(n: number) {
  if (!Number.isInteger(n) || n < 0 || n > 12) return NaN;
  let out = 1;
  for (let i = 2; i <= n; i += 1) out *= i;
  return out;
}

export function ArgandLab() {
  const [real, setReal] = useState(3);
  const [imag, setImag] = useState(4);
  const modulus = Math.sqrt(real * real + imag * imag);
  const argument = Math.atan2(imag, real);
  const s = 22;
  const cx = 180;
  const cy = 140;
  return (
    <Shell title="Argand plane" note="The point is a + bi. The gold segment is the modulus.">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="space-y-3">
          <Num label="Real part a" value={real} set={setReal} />
          <Num label="Imaginary part b" value={imag} set={setImag} />
          <p className="text-sm leading-6 text-slate-600">z = {real} + {imag}i. |z| = {modulus.toFixed(2)}. Argument = {(argument * 180 / Math.PI).toFixed(1)}°. Conjugate = {real} − {imag}i.</p>
        </div>
        <svg viewBox="0 0 360 280" className="h-72 w-full rounded-2xl bg-slate-50">
          {[-6, -3, 0, 3, 6].map((tick) => <g key={tick}><line x1={cx + tick * s} x2={cx + tick * s} y1={cy - 4} y2={cy + 4} stroke="#94a3b8" /><line y1={cy - tick * s} y2={cy - tick * s} x1={cx - 4} x2={cx + 4} stroke="#94a3b8" /></g>)}
          <line x1="24" x2="336" y1={cy} y2={cy} stroke="#334155" />
          <line x1={cx} x2={cx} y1="20" y2="260" stroke="#334155" />
          <circle cx={cx} cy={cy} r={modulus * s} fill="none" stroke="#fbbf24" strokeDasharray="4 4" />
          <line x1={cx} y1={cy} x2={cx + real * s} y2={cy - imag * s} stroke="#d97706" strokeWidth="3" />
          <circle cx={cx + real * s} cy={cy - imag * s} r="6" fill="#2563eb" />
          <circle cx={cx + real * s} cy={cy + imag * s} r="5" fill="#94a3b8" />
          <text x={cx + real * s + 8} y={cy - imag * s - 8} fontSize="12" fill="#1d4ed8">z</text>
        </svg>
      </div>
    </Shell>
  );
}

export function InequalityLab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(-6);
  const [sign, setSign] = useState<"<" | ">" | "≤" | "≥">("<");
  const bound = a === 0 ? NaN : -b / a;
  const left = Number.isFinite(bound) && (sign === "<" || sign === "≤") ? a > 0 : sign === ">" || sign === "≥";
  const closed = sign === "≤" || sign === "≥";
  return (
    <Shell title="Linear inequality" note="One variable. The ray is the solution set.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Num label="Coefficient of x" value={a} set={setA} />
        <Num label="Constant" value={b} set={setB} />
        <label className="text-sm font-medium">Relation
          <select value={sign} onChange={(e) => setSign(e.target.value as typeof sign)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">{["<", ">", "≤", "≥"].map((item) => <option key={item}>{item}</option>)}</select>
        </label>
      </div>
      <p className="mt-3 text-sm text-slate-600">{a}x + {b} {sign} 0. Boundary x = {Number.isFinite(bound) ? bound.toFixed(2) : "undefined"}.</p>
      <svg viewBox="0 0 640 90" className="mt-3 h-24 w-full">
        <line x1="30" x2="610" y1="45" y2="45" stroke="#334155" strokeWidth="2" />
        {[-6, -3, 0, 3, 6].map((tick) => <text key={tick} x={320 + tick * 40} y="72" textAnchor="middle" fontSize="12" fill="#64748b">{tick}</text>)}
        {Number.isFinite(bound) && <line x1={left ? 30 : 320 + bound * 40} x2={left ? 320 + bound * 40 : 610} y1="45" y2="45" stroke="#2563eb" strokeWidth="6" />}
        {Number.isFinite(bound) && <circle cx={320 + bound * 40} cy="45" r="6" fill={closed ? "#2563eb" : "white"} stroke="#2563eb" strokeWidth="2" />}
      </svg>
    </Shell>
  );
}

export function CountingLab() {
  const [n, setN] = useState(8);
  const [r, setR] = useState(3);
  const ok = Number.isInteger(n) && Number.isInteger(r) && n >= r && r >= 0 && n <= 12;
  const p = ok ? fact(n) / fact(n - r) : NaN;
  const c = ok ? fact(n) / (fact(r) * fact(n - r)) : NaN;
  return (
    <Shell title="Permutations and combinations" note="Order matters for nPr. It does not matter for nCr.">
      <div className="grid gap-3 sm:grid-cols-2"><Num label="n" value={n} set={setN} /><Num label="r" value={r} set={setR} /></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">nPr</p><p className="mt-1 text-3xl font-semibold">{Number.isFinite(p) ? p : "—"}</p><p className="mt-2 text-sm text-slate-500">{n}! / ({n} − {r})!</p></div>
        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">nCr</p><p className="mt-1 text-3xl font-semibold">{Number.isFinite(c) ? c : "—"}</p><p className="mt-2 text-sm text-slate-500">{n}! / ({r}! ({n} − {r})!)</p></div>
      </div>
    </Shell>
  );
}

export function BinomialLab() {
  const [n, setN] = useState(5);
  const terms = useMemo(() => {
    if (!Number.isInteger(n) || n < 0 || n > 8) return [];
    return Array.from({ length: n + 1 }, (_, k) => ({ k, coeff: fact(n) / (fact(k) * fact(n - k)) }));
  }, [n]);
  return (
    <Shell title="Binomial expansion" note="(a + b)^n for a positive integer n, up to 8.">
      <Num label="Index n" value={n} set={setN} />
      <div className="mt-4 overflow-auto">
        <table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th>k</th><th>C(n, k)</th><th>Term</th></tr></thead><tbody>{terms.map((term) => <tr key={term.k} className="border-t border-slate-100"><td>{term.k}</td><td>{term.coeff}</td><td>{term.coeff} a^{n - term.k} b^{term.k}</td></tr>)}</tbody></table>
      </div>
    </Shell>
  );
}

export function SequenceLab() {
  const [a, setA] = useState(2);
  const [d, setD] = useState(3);
  const [r, setR] = useState(2);
  const [n, setN] = useState(6);
  const ap = Array.from({ length: Math.min(n, 8) }, (_, i) => a + i * d);
  const gp = Array.from({ length: Math.min(n, 8) }, (_, i) => a * r ** i);
  const apSum = (n / 2) * (2 * a + (n - 1) * d);
  const gpSum = r === 1 ? a * n : a * (r ** n - 1) / (r - 1);
  return (
    <Shell title="Sequences" note="The common difference and the common ratio are separate.">
      <div className="grid gap-3 sm:grid-cols-4"><Num label="First term" value={a} set={setA} /><Num label="AP difference" value={d} set={setD} /><Num label="GP ratio" value={r} set={setR} /><Num label="n" value={n} set={setN} /></div>
      <p className="mt-4 text-sm text-slate-600">AP: {ap.join(", ")}. Sum {apSum}.</p>
      <p className="mt-1 text-sm text-slate-600">GP: {gp.join(", ")}. Sum {Number.isFinite(gpSum) ? gpSum : "undefined"}.</p>
    </Shell>
  );
}

export function TrigGraphLab() {
  const [amp, setAmp] = useState(1);
  const [freq, setFreq] = useState(1);
  const [phase, setPhase] = useState(0);
  const path = (fn: (x: number) => number, color: string) => {
    const parts: string[] = [];
    for (let i = 0; i <= 120; i += 1) {
      const x = -Math.PI * 2 + (i * Math.PI * 4) / 120;
      const y = fn(x);
      if (!Number.isFinite(y) || Math.abs(y) > 3) { parts.push("M"); continue; }
      const px = 40 + ((x + Math.PI * 2) / (Math.PI * 4)) * 360;
      const py = 120 - y * 32;
      parts.push(`${parts[parts.length - 1] === "M" || i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return <path d={parts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" />;
  };
  return (
    <Shell title="Trigonometric graphs" note="Blue sine, red cosine, green tangent. Tangent breaks at its asymptotes.">
      <div className="grid gap-3 sm:grid-cols-3"><Num label="Amplitude" value={amp} set={setAmp} step={0.1} /><Num label="Frequency" value={freq} set={setFreq} step={0.1} /><Num label="Phase in radians" value={phase} set={setPhase} step={0.1} /></div>
      <svg viewBox="0 0 440 240" className="mt-4 h-60 w-full rounded-2xl bg-slate-50">
        <line x1="40" x2="400" y1="120" y2="120" stroke="#334155" />
        <line x1="40" x2="40" y1="20" y2="220" stroke="#334155" />
        {path((x) => amp * Math.sin(freq * x + phase), "#2563eb")}
        {path((x) => amp * Math.cos(freq * x + phase), "#dc2626")}
        {path((x) => amp * Math.tan(freq * x + phase), "#16a34a")}
      </svg>
      <p className="mt-2 text-sm text-slate-500">Period of sine and cosine is {(2 * Math.PI / Math.abs(freq || 1)).toFixed(2)} radians.</p>
    </Shell>
  );
}

export function Distance3DLab() {
  const [ax, setAx] = useState(1);
  const [ay, setAy] = useState(2);
  const [az, setAz] = useState(2);
  const [bx, setBx] = useState(4);
  const [by, setBy] = useState(6);
  const [bz, setBz] = useState(-2);
  const dx = bx - ax;
  const dy = by - ay;
  const dz = bz - az;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return (
    <Shell title="Distance in three dimensions" note="Only the two points and the distance. No plane equation.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Num label="x1" value={ax} set={setAx} /><Num label="y1" value={ay} set={setAy} /><Num label="z1" value={az} set={setAz} />
        <Num label="x2" value={bx} set={setBx} /><Num label="y2" value={by} set={setBy} /><Num label="z2" value={bz} set={setBz} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">√[({bx} − {ax})² + ({by} − {ay})² + ({bz} − {az})²] = √[{dx * dx} + {dy * dy} + {dz * dz}] = {distance.toFixed(2)}.</p>
    </Shell>
  );
}

export function MatrixLab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [c, setC] = useState(5);
  const [d, setD] = useState(3);
  const det = a * d - b * c;
  return (
    <Shell title="2×2 matrix" note="Determinant, transpose and inverse when the determinant is not zero.">
      <div className="grid gap-3 sm:grid-cols-4"><Num label="a" value={a} set={setA} /><Num label="b" value={b} set={setB} /><Num label="c" value={c} set={setC} /><Num label="d" value={d} set={setD} /></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-4">Matrix [[{a}, {b}], [{c}, {d}]]</div>
        <div className="rounded-2xl bg-slate-50 p-4">Transpose [[{a}, {c}], [{b}, {d}]]. Det {det}.</div>
        <div className="rounded-2xl bg-slate-50 p-4">{det === 0 ? "Singular. No inverse." : `Inverse (1/${det}) [[${d}, ${-b}], [${-c}, ${a}]].`}</div>
      </div>
    </Shell>
  );
}

export function InverseTrigLab() {
  const [value, setValue] = useState(0.5);
  const safe = Math.max(-1, Math.min(1, value));
  const path = Array.from({ length: 81 }, (_, i) => {
    const x = -1 + i / 40;
    const y = Math.asin(x);
    return `${i ? "L" : "M"} ${(40 + ((x + 1) / 2) * 320).toFixed(1)} ${(120 - y * 50).toFixed(1)}`;
  }).join(" ");
  return (
    <Shell title="Inverse trigonometric values" note="The curve is the principal branch of arcsin, from −π/2 to π/2.">
      <Num label="Input" value={value} set={setValue} step={0.1} />
      <svg viewBox="0 0 400 220" className="mt-4 h-56 w-full rounded-2xl bg-slate-50">
        <line x1="40" x2="360" y1="120" y2="120" stroke="#334155" />
        <line x1="200" x2="200" y1="20" y2="200" stroke="#334155" />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="3" />
        <circle cx={40 + ((safe + 1) / 2) * 320} cy={120 - Math.asin(safe) * 50} r="5" fill="#d97706" />
      </svg>
      <p className="mt-2 text-sm text-slate-600">arcsin {Math.asin(safe).toFixed(3)}. arccos {Math.acos(safe).toFixed(3)}. arctan {Math.atan(value).toFixed(3)} radians.</p>
    </Shell>
  );
}

export function IntegralLab() {
  const [power, setPower] = useState(2);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(2);
  const area = power === -1 ? NaN : (to ** (power + 1) - from ** (power + 1)) / (power + 1);
  const path = Array.from({ length: 60 }, (_, i) => {
    const x = from + ((to - from) * i) / 59;
    const y = x ** power;
    return `${i ? "L" : "M"} ${(40 + (i / 59) * 320).toFixed(1)} ${(160 - Math.max(-40, Math.min(120, y)) * 0.8).toFixed(1)}`;
  }).join(" ");
  return (
    <Shell title="Area under one curve" note="The curve is y = x^n. The area is the definite integral between the two limits.">
      <div className="grid gap-3 sm:grid-cols-3"><Num label="Power n" value={power} set={setPower} /><Num label="Lower limit" value={from} set={setFrom} /><Num label="Upper limit" value={to} set={setTo} /></div>
      <svg viewBox="0 0 400 200" className="mt-4 h-52 w-full rounded-2xl bg-slate-50"><path d={`${path} L 360 160 L 40 160 Z`} fill="rgba(37,99,235,.15)" /><path d={path} fill="none" stroke="#2563eb" strokeWidth="3" /></svg>
      <p className="mt-2 text-sm text-slate-600">Antiderivative x^{power + 1}/{power + 1}. Area {Number.isFinite(area) ? area.toFixed(3) : "undefined for this power"}.</p>
    </Shell>
  );
}

export function VectorLab() {
  const [ax, setAx] = useState(3);
  const [ay, setAy] = useState(2);
  const [bx, setBx] = useState(1);
  const [by, setBy] = useState(3);
  const mag = Math.sqrt(ax * ax + ay * ay);
  const dot = ax * bx + ay * by;
  const s = 28;
  return (
    <Shell title="Vectors in the plane" note="Blue is a, red is b, gold is a + b. Direction cosines use the 2D vector.">
      <div className="grid gap-3 sm:grid-cols-4"><Num label="a1" value={ax} set={setAx} /><Num label="a2" value={ay} set={setAy} /><Num label="b1" value={bx} set={setBx} /><Num label="b2" value={by} set={setBy} /></div>
      <svg viewBox="0 0 360 240" className="mt-4 h-56 w-full rounded-2xl bg-slate-50">
        <line x1="40" x2="330" y1="190" y2="190" stroke="#334155" /><line x1="40" x2="40" y1="20" y2="190" stroke="#334155" />
        <line x1="40" y1="190" x2={40 + ax * s} y2={190 - ay * s} stroke="#2563eb" strokeWidth="3" />
        <line x1="40" y1="190" x2={40 + bx * s} y2={190 - by * s} stroke="#dc2626" strokeWidth="3" />
        <line x1="40" y1="190" x2={40 + (ax + bx) * s} y2={190 - (ay + by) * s} stroke="#d97706" strokeWidth="3" />
      </svg>
      <p className="mt-2 text-sm text-slate-600">|a| = {mag.toFixed(2)}. Direction cosines {(ax / mag).toFixed(2)}, {(ay / mag).toFixed(2)}. a · b = {dot}.</p>
    </Shell>
  );
}

export function LinearProgrammingLab() {
  const [limit, setLimit] = useState(5);
  const [c1, setC1] = useState(3);
  const [c2, setC2] = useState(2);
  const corners = [[0, 0], [0, limit], [limit, 0]].filter(([x, y]) => x + y <= limit);
  const ranked = corners.map(([x, y]) => ({ x, y, value: c1 * x + c2 * y })).sort((p, q) => q.value - p.value);
  return (
    <Shell title="Linear programming" note="Constraints x ≥ 0, y ≥ 0 and x + y ≤ the limit. The best corner is marked.">
      <div className="grid gap-3 sm:grid-cols-3"><Num label="x + y limit" value={limit} set={setLimit} /><Num label="Objective x coefficient" value={c1} set={setC1} /><Num label="Objective y coefficient" value={c2} set={setC2} /></div>
      <svg viewBox="0 0 320 240" className="mt-4 h-56 w-full rounded-2xl bg-slate-50">
        <polygon points={`40,200 40,${200 - limit * 24} ${40 + limit * 24},200`} fill="rgba(37,99,235,.18)" stroke="#2563eb" />
        <circle cx={40 + ranked[0].x * 24} cy={200 - ranked[0].y * 24} r="6" fill="#d97706" />
      </svg>
      <p className="mt-2 text-sm text-slate-600">Corners {ranked.map((point) => `(${point.x}, ${point.y}) = ${point.value}`).join("; ")}. Best is ({ranked[0].x}, {ranked[0].y}).</p>
    </Shell>
  );
}

export function BayesLab() {
  const [prior, setPrior] = useState(0.3);
  const [hit, setHit] = useState(0.9);
  const [miss, setMiss] = useState(0.2);
  const evidence = hit * prior + miss * (1 - prior);
  const posterior = evidence === 0 ? NaN : (hit * prior) / evidence;
  return (
    <Shell title="Bayes table" note="P(A|B) = P(B|A) P(A) / P(B).">
      <div className="grid gap-3 sm:grid-cols-3"><Num label="P(A)" value={prior} set={setPrior} step={0.05} /><Num label="P(B|A)" value={hit} set={setHit} step={0.05} /><Num label="P(B|not A)" value={miss} set={setMiss} step={0.05} /></div>
      <table className="mt-4 w-full text-sm"><tbody>
        <tr className="border-t border-slate-100"><td>P(A and B)</td><td>{(hit * prior).toFixed(3)}</td></tr>
        <tr className="border-t border-slate-100"><td>P(not A and B)</td><td>{(miss * (1 - prior)).toFixed(3)}</td></tr>
        <tr className="border-t border-slate-100"><td>P(B)</td><td>{evidence.toFixed(3)}</td></tr>
        <tr className="border-t border-slate-100"><td>P(A|B)</td><td>{Number.isFinite(posterior) ? posterior.toFixed(3) : "—"}</td></tr>
      </tbody></table>
    </Shell>
  );
}
