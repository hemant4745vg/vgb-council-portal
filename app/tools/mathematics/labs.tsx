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

function det3(m: number[][]) {
  const [a, b, c] = m[0];
  const [d, e, f] = m[1];
  const [g, h, i] = m[2];
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

export function ArgandLab() {
  const [real, setReal] = useState(3);
  const [imag, setImag] = useState(4);
  const [real2, setReal2] = useState(1);
  const [imag2, setImag2] = useState(-2);
  const modulus = Math.hypot(real, imag);
  const argument = Math.atan2(imag, real);
  const s = 22;
  const cx = 190;
  const cy = 150;
  return (
    <Shell title="Argand plane" note="Move two complex numbers. Gold is the first, blue is the second, and the open point is their sum.">
      <div className="grid gap-3 sm:grid-cols-4">
        <Num label="a" value={real} set={setReal} />
        <Num label="b" value={imag} set={setImag} />
        <Num label="c" value={real2} set={setReal2} />
        <Num label="d" value={imag2} set={setImag2} />
      </div>
      <svg viewBox="0 0 380 300" className="mt-4 h-72 w-full rounded-2xl bg-slate-50">
        <line x1="20" x2="360" y1={cy} y2={cy} stroke="#334155" />
        <line x1={cx} x2={cx} y1="16" y2="284" stroke="#334155" />
        <circle cx={cx} cy={cy} r={modulus * s} fill="none" stroke="#fbbf24" strokeDasharray="4 4" />
        <line x1={cx} y1={cy} x2={cx + real * s} y2={cy - imag * s} stroke="#d97706" strokeWidth="3" />
        <line x1={cx + real * s} y1={cy - imag * s} x2={cx + (real + real2) * s} y2={cy - (imag + imag2) * s} stroke="#2563eb" strokeWidth="3" />
        <circle cx={cx + real * s} cy={cy - imag * s} r="5" fill="#d97706" />
        <circle cx={cx + real2 * s} cy={cy - imag2 * s} r="5" fill="#2563eb" />
        <circle cx={cx + (real + real2) * s} cy={cy - (imag + imag2) * s} r="6" fill="white" stroke="#0f172a" strokeWidth="2" />
      </svg>
      <p className="mt-2 text-sm text-slate-600">|z| = {modulus.toFixed(2)}. Argument {(argument * 180 / Math.PI).toFixed(1)}°. Sum = {real + real2} + {imag + imag2}i.</p>
    </Shell>
  );
}

export function InequalityLab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(-6);
  const [sign, setSign] = useState<"<" | ">" | "≤" | "≥">("<");
  const [test, setTest] = useState(1);
  const bound = a === 0 ? NaN : -b / a;
  const holds = a * test + b < 0 ? sign === "<" || sign === "≤" : a * test + b > 0 ? sign === ">" || sign === "≥" : sign === "≤" || sign === "≥";
  const left = Number.isFinite(bound) && ((sign === "<" || sign === "≤") ? a > 0 : a < 0);
  const closed = sign === "≤" || sign === "≥";
  return (
    <Shell title="Linear inequality" note="Drag the test value and see whether it sits in the solution ray.">
      <div className="grid gap-3 sm:grid-cols-4">
        <Num label="Coefficient of x" value={a} set={setA} />
        <Num label="Constant" value={b} set={setB} />
        <label className="text-sm font-medium">Relation
          <select value={sign} onChange={(e) => setSign(e.target.value as typeof sign)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">{["<", ">", "≤", "≥"].map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <Num label="Test value" value={test} set={setTest} />
      </div>
      <svg viewBox="0 0 640 100" className="mt-4 h-28 w-full">
        <line x1="30" x2="610" y1="48" y2="48" stroke="#334155" strokeWidth="2" />
        {[-6, -3, 0, 3, 6].map((tick) => <text key={tick} x={320 + tick * 40} y="78" textAnchor="middle" fontSize="12" fill="#64748b">{tick}</text>)}
        {Number.isFinite(bound) && <line x1={left ? 30 : 320 + bound * 40} x2={left ? 320 + bound * 40 : 610} y1="48" y2="48" stroke="#2563eb" strokeWidth="6" />}
        {Number.isFinite(bound) && <circle cx={320 + bound * 40} cy="48" r="6" fill={closed ? "#2563eb" : "white"} stroke="#2563eb" strokeWidth="2" />}
        <circle cx={320 + test * 40} cy="48" r="5" fill={holds ? "#16a34a" : "#dc2626"} />
      </svg>
      <p className="text-sm text-slate-600">Boundary x = {Number.isFinite(bound) ? bound.toFixed(2) : "undefined"}. The test point {holds ? "satisfies" : "does not satisfy"} the inequality.</p>
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
    <Shell title="Permutations and combinations" note="Use nPr when the order of the chosen objects matters. Use nCr when it does not.">
      <div className="grid gap-3 sm:grid-cols-2"><Num label="n" value={n} set={setN} /><Num label="r" value={r} set={setR} /></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Arrangements nPr</p><p className="mt-1 text-3xl font-semibold">{Number.isFinite(p) ? p : "—"}</p><p className="mt-2 text-sm text-slate-500">{n}! / ({n} − {r})!</p></div>
        <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Selections nCr</p><p className="mt-1 text-3xl font-semibold">{Number.isFinite(c) ? c : "—"}</p><p className="mt-2 text-sm text-slate-500">{n}! / ({r}! ({n} − {r})!)</p></div>
      </div>
    </Shell>
  );
}

export function BinomialLab() {
  const [n, setN] = useState(4);
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const terms = useMemo(() => {
    if (!Number.isInteger(n) || n < 0 || n > 8) return [];
    return Array.from({ length: n + 1 }, (_, k) => {
      const coeff = fact(n) / (fact(k) * fact(n - k));
      return { k, coeff, value: coeff * a ** (n - k) * b ** k };
    });
  }, [n, a, b]);
  const total = terms.reduce((sum, term) => sum + term.value, 0);
  return (
    <Shell title="Binomial expansion" note="Enter a and b. The last column is the value of that term.">
      <div className="grid gap-3 sm:grid-cols-3"><Num label="Index n" value={n} set={setN} /><Num label="a" value={a} set={setA} /><Num label="b" value={b} set={setB} /></div>
      <div className="mt-4 overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left text-slate-500"><th>k</th><th>Coefficient</th><th>Term</th><th>Value</th></tr></thead><tbody>{terms.map((term) => <tr key={term.k} className="border-t border-slate-100"><td>{term.k}</td><td>{term.coeff}</td><td>{term.coeff} ({a})^{n - term.k} ({b})^{term.k}</td><td>{term.value}</td></tr>)}</tbody></table></div>
      <p className="mt-2 text-sm text-slate-600">({a} + {b})^{n} = {terms.length ? total : "—"}. Check: direct value {(a + b) ** n}.</p>
    </Shell>
  );
}

export function SequenceLab() {
  const [a, setA] = useState(2);
  const [d, setD] = useState(3);
  const [r, setR] = useState(2);
  const [n, setN] = useState(6);
  const count = Math.max(1, Math.min(8, Math.floor(n)));
  const ap = Array.from({ length: count }, (_, i) => a + i * d);
  const gp = Array.from({ length: count }, (_, i) => a * r ** i);
  const max = Math.max(...ap, ...gp, 1);
  return (
    <Shell title="Sequences" note="Bars compare the first terms of the AP and the GP.">
      <div className="grid gap-3 sm:grid-cols-4"><Num label="First term" value={a} set={setA} /><Num label="AP difference" value={d} set={setD} /><Num label="GP ratio" value={r} set={setR} /><Num label="n" value={n} set={setN} /></div>
      <svg viewBox="0 0 520 180" className="mt-4 h-44 w-full rounded-2xl bg-slate-50">
        {ap.map((value, i) => <rect key={`a${i}`} x={30 + i * 60} y={150 - (value / max) * 110} width="22" height={(value / max) * 110} fill="#2563eb" />)}
        {gp.map((value, i) => <rect key={`g${i}`} x={54 + i * 60} y={150 - (Math.max(value, 0) / max) * 110} width="22" height={(Math.max(value, 0) / max) * 110} fill="#dc2626" />)}
      </svg>
      <p className="mt-2 text-sm text-slate-600">Blue AP: {ap.join(", ")}. Red GP: {gp.join(", ")}.</p>
    </Shell>
  );
}

export function TrigGraphLab() {
  const [amp, setAmp] = useState(1);
  const [freq, setFreq] = useState(1);
  const [phase, setPhase] = useState(0);
  const [probe, setProbe] = useState(0);
  const path = (fn: (x: number) => number, color: string) => {
    const parts: string[] = [];
    for (let i = 0; i <= 140; i += 1) {
      const x = -Math.PI * 2 + (i * Math.PI * 4) / 140;
      const y = fn(x);
      const broken = !Number.isFinite(y) || Math.abs(y) > 3;
      const px = 40 + (i / 140) * 420;
      const py = 120 - y * 30;
      parts.push(broken ? "M" : `${parts[parts.length - 1] === "M" || i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return <path d={parts.join(" ")} fill="none" stroke={color} strokeWidth="2.5" />;
  };
  return (
    <Shell title="Trigonometric graphs" note="Move the probe. Blue sine, red cosine, green tangent.">
      <div className="grid gap-3 sm:grid-cols-4"><Num label="Amplitude" value={amp} set={setAmp} step={0.1} /><Num label="Frequency" value={freq} set={setFreq} step={0.1} /><Num label="Phase" value={phase} set={setPhase} step={0.1} /><Num label="Probe x" value={probe} set={setProbe} step={0.1} /></div>
      <svg viewBox="0 0 500 240" className="mt-4 h-60 w-full rounded-2xl bg-slate-50">
        <line x1="40" x2="460" y1="120" y2="120" stroke="#334155" /><line x1="40" x2="40" y1="20" y2="220" stroke="#334155" />
        {path((x) => amp * Math.sin(freq * x + phase), "#2563eb")}
        {path((x) => amp * Math.cos(freq * x + phase), "#dc2626")}
        {path((x) => amp * Math.tan(freq * x + phase), "#16a34a")}
        <line x1={40 + ((probe + Math.PI * 2) / (Math.PI * 4)) * 420} x2={40 + ((probe + Math.PI * 2) / (Math.PI * 4)) * 420} y1="20" y2="220" stroke="#0f172a" strokeDasharray="4 3" />
      </svg>
      <p className="mt-2 text-sm text-slate-600">At x = {probe}: sin { (amp * Math.sin(freq * probe + phase)).toFixed(2) }, cos { (amp * Math.cos(freq * probe + phase)).toFixed(2) }. Period {(2 * Math.PI / Math.abs(freq || 1)).toFixed(2)}.</p>
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
  const project = (x: number, y: number, z: number) => [70 + x * 36 - z * 22, 190 - y * 28 - z * 14];
  const a = project(ax, ay, az);
  const b = project(bx, by, bz);
  const distance = Math.hypot(bx - ax, by - ay, bz - az);
  return (
    <Shell title="Distance in three dimensions" note="The sketch is a projection. The value uses the full distance formula.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Num label="x1" value={ax} set={setAx} /><Num label="y1" value={ay} set={setAy} /><Num label="z1" value={az} set={setAz} />
        <Num label="x2" value={bx} set={setBx} /><Num label="y2" value={by} set={setBy} /><Num label="z2" value={bz} set={setBz} />
      </div>
      <svg viewBox="0 0 360 240" className="mt-4 h-56 w-full rounded-2xl bg-slate-50">
        <line x1="70" x2="250" y1="190" y2="190" stroke="#94a3b8" />
        <line x1="70" x2="70" y1="190" y2="40" stroke="#94a3b8" />
        <line x1="70" x2="20" y1="190" y2="230" stroke="#94a3b8" />
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#d97706" strokeWidth="3" />
        <circle cx={a[0]} cy={a[1]} r="5" fill="#2563eb" /><circle cx={b[0]} cy={b[1]} r="5" fill="#dc2626" />
      </svg>
      <p className="mt-2 text-sm text-slate-600">Distance {distance.toFixed(2)}.</p>
    </Shell>
  );
}

export function MatrixLab() {
  const [left, setLeft] = useState([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
  const [right, setRight] = useState([[2, 1, 0], [0, 1, 1], [1, 0, 1]]);
  const setCell = (side: "left" | "right", row: number, col: number, value: number) => {
    const source = side === "left" ? left : right;
    const next = source.map((line) => [...line]);
    next[row][col] = value;
    if (side === "left") setLeft(next);
    else setRight(next);
  };
  const product = left.map((row) => right[0].map((_, col) => row.reduce((sum, value, k) => sum + value * right[k][col], 0)));
  const det = det3(left);
  const inverse = det === 0 ? null : left.map((_, row) => left[0].map((_, col) => {
    const minor = left.filter((_, r) => r !== row).map((line) => line.filter((_, c) => c !== col));
    const minorDet = minor[0][0] * minor[1][1] - minor[0][1] * minor[1][0];
    return ((row + col) % 2 === 0 ? 1 : -1) * minorDet / det;
  }));
  // The cofactor above is C_row,col. Inverse needs the transpose.
  const shown = inverse ? inverse[0].map((_, col) => inverse.map((row) => row[col])) : null;
  return (
    <Shell title="Matrices" note="Edit both 3×3 matrices. The product, determinant and inverse use every cell.">
      <div className="grid gap-4 lg:grid-cols-2">
        {[["A", left, "left"], ["B", right, "right"]].map(([label, grid, side]) => (
          <div key={String(label)}>
            <p className="mb-2 text-sm font-semibold">{label}</p>
            <div className="grid grid-cols-3 gap-2">
              {(grid as number[][]).map((row, r) => row.map((value, c) => (
                <input key={`${label}-${r}-${c}`} type="number" value={value} onChange={(e) => setCell(side as "left" | "right", r, c, Number(e.target.value))} className="rounded-lg border border-slate-200 px-2 py-1 text-sm" />
              )))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-600">det(A) = {det}. First row of AB: {product[0].join(", ")}.</p>
      <p className="mt-1 text-sm text-slate-600">{shown ? `Inverse first row: ${shown[0].map((value) => value.toFixed(2)).join(", ")}` : "A is singular, so it has no inverse."}</p>
    </Shell>
  );
}

export function InverseTrigLab() {
  const [value, setValue] = useState(0.5);
  const safe = Math.max(-1, Math.min(1, value));
  const curve = (fn: (x: number) => number, color: string) => {
    const parts = Array.from({ length: 80 }, (_, i) => {
      const x = -1 + i / 39.5;
      const y = fn(x);
      return `${i ? "L" : "M"} ${(30 + ((x + 1) / 2) * 300).toFixed(1)} ${(90 - y * 36).toFixed(1)}`;
    }).join(" ");
    return <path d={parts} fill="none" stroke={color} strokeWidth="2.5" />;
  };
  return (
    <Shell title="Inverse trigonometric branches" note="Blue arcsin, red arccos, green arctan. The probe uses the same input.">
      <Num label="Input" value={value} set={setValue} step={0.05} />
      <svg viewBox="0 0 360 180" className="mt-4 h-52 w-full rounded-2xl bg-slate-50">
        <line x1="30" x2="330" y1="90" y2="90" stroke="#334155" /><line x1="180" x2="180" y1="16" y2="164" stroke="#334155" />
        {curve(Math.asin, "#2563eb")}
        {curve(Math.acos, "#dc2626")}
        {curve(Math.atan, "#16a34a")}
        <circle cx={30 + ((safe + 1) / 2) * 300} cy={90 - Math.asin(safe) * 36} r="4" fill="#d97706" />
      </svg>
      <p className="mt-2 text-sm text-slate-600">arcsin {Math.asin(safe).toFixed(3)}, arccos {Math.acos(safe).toFixed(3)}, arctan {Math.atan(value).toFixed(3)} radians.</p>
    </Shell>
  );
}

export function IntegralLab() {
  const [power, setPower] = useState(2);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(2);
  const area = power === -1 ? NaN : (to ** (power + 1) - from ** (power + 1)) / (power + 1);
  const path = Array.from({ length: 70 }, (_, i) => {
    const x = from + ((to - from) * i) / 69;
    const y = x ** power;
    return `${i ? "L" : "M"} ${(40 + (i / 69) * 320).toFixed(1)} ${(150 - Math.max(-30, Math.min(100, y)) * 0.9).toFixed(1)}`;
  }).join(" ");
  return (
    <Shell title="Area under one curve" note="Move the limits. The shaded region is the definite integral of x^n.">
      <div className="grid gap-3 sm:grid-cols-3"><Num label="Power n" value={power} set={setPower} /><Num label="Lower limit" value={from} set={setFrom} step={0.5} /><Num label="Upper limit" value={to} set={setTo} step={0.5} /></div>
      <svg viewBox="0 0 400 190" className="mt-4 h-52 w-full rounded-2xl bg-slate-50"><path d={`${path} L 360 150 L 40 150 Z`} fill="rgba(37,99,235,.16)" /><path d={path} fill="none" stroke="#2563eb" strokeWidth="3" /></svg>
      <p className="mt-2 text-sm text-slate-600">Antiderivative x^{power + 1}/{power + 1}. Area {Number.isFinite(area) ? area.toFixed(3) : "undefined"}.</p>
    </Shell>
  );
}

export function VectorLab() {
  const [ax, setAx] = useState(3);
  const [ay, setAy] = useState(2);
  const [az, setAz] = useState(1);
  const [bx, setBx] = useState(1);
  const [by, setBy] = useState(3);
  const [bz, setBz] = useState(2);
  const mag = Math.hypot(ax, ay, az);
  const dot = ax * bx + ay * by + az * bz;
  const s = 26;
  return (
    <Shell title="Vectors" note="The drawing uses the first two components. Magnitude, direction cosines and the dot product use all three.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Num label="a1" value={ax} set={setAx} /><Num label="a2" value={ay} set={setAy} /><Num label="a3" value={az} set={setAz} />
        <Num label="b1" value={bx} set={setBx} /><Num label="b2" value={by} set={setBy} /><Num label="b3" value={bz} set={setBz} />
      </div>
      <svg viewBox="0 0 360 220" className="mt-4 h-52 w-full rounded-2xl bg-slate-50">
        <line x1="40" x2="330" y1="180" y2="180" stroke="#334155" /><line x1="40" x2="40" y1="20" y2="180" stroke="#334155" />
        <line x1="40" y1="180" x2={40 + ax * s} y2={180 - ay * s} stroke="#2563eb" strokeWidth="3" />
        <line x1="40" y1="180" x2={40 + bx * s} y2={180 - by * s} stroke="#dc2626" strokeWidth="3" />
        <line x1="40" y1="180" x2={40 + (ax + bx) * s} y2={180 - (ay + by) * s} stroke="#d97706" strokeWidth="3" />
      </svg>
      <p className="mt-2 text-sm text-slate-600">|a| = {mag.toFixed(2)}. Direction cosines {(ax / mag).toFixed(2)}, {(ay / mag).toFixed(2)}, {(az / mag).toFixed(2)}. a · b = {dot}.</p>
    </Shell>
  );
}

export function LinearProgrammingLab() {
  const [rows, setRows] = useState([[1, 1, 6], [1, 2, 8], [2, 1, 8]]);
  const [ox, setOx] = useState(3);
  const [oy, setOy] = useState(2);
  const setRow = (index: number, col: number, value: number) => {
    const next = rows.map((row) => [...row]);
    next[index][col] = value;
    setRows(next);
  };
  const lines = [...rows.map(([a, b, c]) => ({ a, b, c })), { a: 1, b: 0, c: 12 }, { a: 0, b: 1, c: 12 }];
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
      const d = lines[i].a * lines[j].b - lines[j].a * lines[i].b;
      if (Math.abs(d) < 1e-6) continue;
      const x = (lines[i].c * lines[j].b - lines[j].c * lines[i].b) / d;
      const y = (lines[i].a * lines[j].c - lines[j].a * lines[i].c) / d;
      const feasible = x >= -0.01 && y >= -0.01 && rows.every(([a, b, c]) => a * x + b * y <= c + 0.05);
      if (feasible) points.push({ x, y });
    }
  }
  const unique = points.filter((point, index) => points.findIndex((other) => Math.abs(other.x - point.x) < 0.05 && Math.abs(other.y - point.y) < 0.05) === index);
  const ranked = unique.map((point) => ({ ...point, value: ox * point.x + oy * point.y })).sort((p, q) => q.value - p.value);
  const poly = [...unique].sort((p, q) => Math.atan2(p.y - 3, p.x - 3) - Math.atan2(q.y - 3, q.x - 3));
  return (
    <Shell title="Linear programming" note="Three constraints of the form ax + by ≤ c, with x ≥ 0 and y ≥ 0. The gold point is the best corner.">
      <div className="grid gap-3 sm:grid-cols-4">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-3 gap-2">
            {row.map((value, col) => <input key={col} type="number" value={value} onChange={(e) => setRow(index, col, Number(e.target.value))} className="rounded-lg border border-slate-200 px-2 py-1 text-sm" />)}
          </div>
        ))}
        <Num label="Objective x" value={ox} set={setOx} />
        <Num label="Objective y" value={oy} set={setOy} />
      </div>
      <svg viewBox="0 0 320 240" className="mt-4 h-56 w-full rounded-2xl bg-slate-50">
        <polygon points={poly.map((point) => `${40 + point.x * 22},${200 - point.y * 16}`).join(" ")} fill="rgba(37,99,235,.18)" stroke="#2563eb" />
        {ranked[0] && <circle cx={40 + ranked[0].x * 22} cy={200 - ranked[0].y * 16} r="6" fill="#d97706" />}
      </svg>
      <p className="mt-2 text-sm text-slate-600">{ranked.map((point) => `(${point.x.toFixed(1)}, ${point.y.toFixed(1)}) = ${point.value.toFixed(1)}`).join("; ") || "No feasible corner."}</p>
    </Shell>
  );
}

export function BayesLab() {
  const [prior, setPrior] = useState(0.3);
  const [hit, setHit] = useState(0.9);
  const [miss, setMiss] = useState(0.2);
  const evidence = hit * prior + miss * (1 - prior);
  const posterior = evidence === 0 ? NaN : (hit * prior) / evidence;
  const width = Math.max(0, Math.min(100, posterior * 100));
  return (
    <Shell title="Bayes table" note="The bar is P(A|B). Move the three inputs and the bar follows the formula.">
      <div className="grid gap-3 sm:grid-cols-3"><Num label="P(A)" value={prior} set={setPrior} step={0.05} /><Num label="P(B|A)" value={hit} set={setHit} step={0.05} /><Num label="P(B|not A)" value={miss} set={setMiss} step={0.05} /></div>
      <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-slate-900" style={{ width: `${width}%` }} /></div>
      <table className="mt-4 w-full text-sm"><tbody>
        <tr className="border-t border-slate-100"><td>P(A and B)</td><td>{(hit * prior).toFixed(3)}</td></tr>
        <tr className="border-t border-slate-100"><td>P(not A and B)</td><td>{(miss * (1 - prior)).toFixed(3)}</td></tr>
        <tr className="border-t border-slate-100"><td>P(B)</td><td>{evidence.toFixed(3)}</td></tr>
        <tr className="border-t border-slate-100"><td>P(A|B)</td><td>{Number.isFinite(posterior) ? posterior.toFixed(3) : "—"}</td></tr>
      </tbody></table>
    </Shell>
  );
}
