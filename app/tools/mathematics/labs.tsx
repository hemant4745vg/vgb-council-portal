"use client";

import { useMemo, useState } from "react";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, value, set }: { label: string; value: number; set: (n: number) => void }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input type="number" value={value} onChange={(e) => set(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
    </label>
  );
}

function fact(n: number) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  let out = 1;
  for (let i = 2; i <= n; i += 1) out *= i;
  return out;
}

export function ArgandLab() {
  const [real, setReal] = useState(3);
  const [imag, setImag] = useState(4);
  const modulus = Math.sqrt(real * real + imag * imag);
  const argument = Math.atan2(imag, real);
  const scale = 18;
  return (
    <Card title="Argand plane">
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div className="space-y-3">
          <Field label="Real part" value={real} set={setReal} />
          <Field label="Imaginary part" value={imag} set={setImag} />
          <p className="text-sm text-slate-600">Modulus {modulus.toFixed(2)}. Argument {(argument * 180 / Math.PI).toFixed(1)}°.</p>
        </div>
        <svg viewBox="0 0 360 280" className="h-72 w-full rounded-xl bg-slate-50">
          <line x1="20" x2="340" y1="140" y2="140" stroke="#334155" />
          <line x1="180" x2="180" y1="20" y2="260" stroke="#334155" />
          <circle cx={180 + real * scale} cy={140 - imag * scale} r="6" fill="#2563eb" />
          <line x1="180" y1="140" x2={180 + real * scale} y2={140 - imag * scale} stroke="#f59e0b" strokeWidth="2" />
        </svg>
      </div>
    </Card>
  );
}

export function InequalityLab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(6);
  const [sign, setSign] = useState<"<" | ">" | "≤" | "≥">("<");
  const bound = a === 0 ? NaN : -b / a;
  const points = [-8, -4, 0, 4, 8];
  return (
    <Card title="Linear inequality on a number line">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Coefficient of x" value={a} set={setA} />
        <Field label="Constant" value={b} set={setB} />
        <label className="text-sm font-medium">Sign
          <select value={sign} onChange={(e) => setSign(e.target.value as typeof sign)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
            {["<", ">", "≤", "≥"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-3 text-sm text-slate-600">{a}x + {b} {sign} 0. Boundary {Number.isFinite(bound) ? bound.toFixed(2) : "undefined"}.</p>
      <div className="mt-4 flex items-center gap-2">
        {points.map((point) => <span key={point} className="rounded-full bg-slate-100 px-3 py-1 text-xs">{point}</span>)}
      </div>
    </Card>
  );
}

export function CountingLab() {
  const [n, setN] = useState(5);
  const [r, setR] = useState(2);
  const ok = Number.isInteger(n) && Number.isInteger(r) && n >= r && r >= 0;
  return (
    <Card title="Permutations and combinations">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="n" value={n} set={setN} />
        <Field label="r" value={r} set={setR} />
      </div>
      <p className="mt-3 text-sm text-slate-600">{ok ? `nPr = ${fact(n) / fact(n - r)}. nCr = ${fact(n) / (fact(r) * fact(n - r))}.` : "Use integers with n at least r."}</p>
    </Card>
  );
}

export function BinomialLab() {
  const [n, setN] = useState(4);
  const terms = useMemo(() => {
    if (!Number.isInteger(n) || n < 0 || n > 8) return [];
    return Array.from({ length: n + 1 }, (_, k) => `${fact(n) / (fact(k) * fact(n - k))} a^${n - k} b^${k}`);
  }, [n]);
  return (
    <Card title="Binomial expansion">
      <Field label="Positive integer index" value={n} set={setN} />
      <p className="mt-3 text-sm text-slate-600">{terms.length ? terms.join(" + ") : "Use an integer from 0 to 8."}</p>
    </Card>
  );
}

export function SequenceLab() {
  const [a, setA] = useState(2);
  const [step, setStep] = useState(3);
  const [n, setN] = useState(5);
  const ap = a + (n - 1) * step;
  const apSum = (n / 2) * (2 * a + (n - 1) * step);
  const gp = a * Math.pow(step, n - 1);
  const gpSum = step === 1 ? a * n : a * (Math.pow(step, n) - 1) / (step - 1);
  return (
    <Card title="Arithmetic and geometric progressions">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="First term" value={a} set={setA} />
        <Field label="Common difference or ratio" value={step} set={setStep} />
        <Field label="n" value={n} set={setN} />
      </div>
      <p className="mt-3 text-sm text-slate-600">AP term {ap}. AP sum {apSum}. GP term {gp}. GP sum {gpSum}.</p>
    </Card>
  );
}

export function TrigGraphLab() {
  const [amp, setAmp] = useState(1);
  const [freq, setFreq] = useState(1);
  const [phase, setPhase] = useState(0);
  const path = (fn: (x: number) => number) => Array.from({ length: 81 }, (_, i) => {
    const x = -Math.PI * 2 + (i * Math.PI * 4) / 80;
    const y = fn(x);
    return `${i ? "L" : "M"} ${(40 + ((x + Math.PI * 2) / (Math.PI * 4)) * 320).toFixed(1)} ${(110 - y * 28).toFixed(1)}`;
  }).join(" ");
  return (
    <Card title="Sine, cosine and tangent graphs">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Amplitude" value={amp} set={setAmp} />
        <Field label="Frequency" value={freq} set={setFreq} />
        <Field label="Phase" value={phase} set={setPhase} />
      </div>
      <svg viewBox="0 0 400 220" className="mt-4 h-56 w-full rounded-xl bg-slate-50">
        <path d={path((x) => amp * Math.sin(freq * x + phase))} fill="none" stroke="#2563eb" strokeWidth="2" />
        <path d={path((x) => amp * Math.cos(freq * x + phase))} fill="none" stroke="#dc2626" strokeWidth="2" />
        <path d={path((x) => Math.max(-3, Math.min(3, amp * Math.tan(freq * x + phase))))} fill="none" stroke="#16a34a" strokeWidth="2" />
      </svg>
      <p className="mt-2 text-xs text-slate-500">Blue sine, red cosine, green tangent, clipped to the panel.</p>
    </Card>
  );
}

export function Distance3DLab() {
  const [ax, setAx] = useState(1);
  const [ay, setAy] = useState(2);
  const [az, setAz] = useState(2);
  const [bx, setBx] = useState(4);
  const [by, setBy] = useState(6);
  const [bz, setBz] = useState(2);
  const distance = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2 + (bz - az) ** 2);
  return (
    <Card title="Distance in three dimensions">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="x1" value={ax} set={setAx} /><Field label="y1" value={ay} set={setAy} /><Field label="z1" value={az} set={setAz} />
        <Field label="x2" value={bx} set={setBx} /><Field label="y2" value={by} set={setBy} /><Field label="z2" value={bz} set={setBz} />
      </div>
      <p className="mt-3 text-sm text-slate-600">Distance {distance.toFixed(2)}.</p>
    </Card>
  );
}

export function MatrixLab() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(2);
  const [c, setC] = useState(3);
  const [d, setD] = useState(4);
  const det = a * d - b * c;
  return (
    <Card title="2×2 matrix, determinant and inverse">
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="a" value={a} set={setA} /><Field label="b" value={b} set={setB} />
        <Field label="c" value={c} set={setC} /><Field label="d" value={d} set={setD} />
      </div>
      <p className="mt-3 text-sm text-slate-600">Determinant {det}. {det === 0 ? "No inverse." : `Inverse is (1/${det}) times [[${d}, ${-b}], [${-c}, ${a}]].`}</p>
    </Card>
  );
}

export function InverseTrigLab() {
  const [value, setValue] = useState(0.5);
  const safe = Math.max(-1, Math.min(1, value));
  return (
    <Card title="Inverse trigonometric principal values">
      <Field label="Input from −1 to 1" value={value} set={setValue} />
      <p className="mt-3 text-sm text-slate-600">arcsin {Math.asin(safe).toFixed(3)} rad. arccos {Math.acos(safe).toFixed(3)} rad. arctan of the same input {Math.atan(value).toFixed(3)} rad.</p>
    </Card>
  );
}

export function IntegralLab() {
  const [power, setPower] = useState(2);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(2);
  const antiderivative = power === -1 ? "ln|x|" : `x^${power + 1}/${power + 1}`;
  const area = power === -1 ? Math.log(Math.abs(to)) - Math.log(Math.abs(from)) : (to ** (power + 1) - from ** (power + 1)) / (power + 1);
  return (
    <Card title="Integral and area under one curve">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Power in x^n" value={power} set={setPower} />
        <Field label="From" value={from} set={setFrom} />
        <Field label="To" value={to} set={setTo} />
      </div>
      <p className="mt-3 text-sm text-slate-600">An antiderivative of x^{power} is {antiderivative}. Area from {from} to {to}: {Number.isFinite(area) ? area.toFixed(3) : "undefined"}.</p>
    </Card>
  );
}

export function VectorLab() {
  const [ax, setAx] = useState(1);
  const [ay, setAy] = useState(2);
  const [az, setAz] = useState(2);
  const [bx, setBx] = useState(2);
  const [by, setBy] = useState(-1);
  const [bz, setBz] = useState(2);
  const mag = Math.sqrt(ax * ax + ay * ay + az * az);
  const dot = ax * bx + ay * by + az * bz;
  return (
    <Card title="Vectors">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="a1" value={ax} set={setAx} /><Field label="a2" value={ay} set={setAy} /><Field label="a3" value={az} set={setAz} />
        <Field label="b1" value={bx} set={setBx} /><Field label="b2" value={by} set={setBy} /><Field label="b3" value={bz} set={setBz} />
      </div>
      <p className="mt-3 text-sm text-slate-600">Magnitude of a is {mag.toFixed(2)}. Direction cosines {(ax / mag).toFixed(2)}, {(ay / mag).toFixed(2)}, {(az / mag).toFixed(2)}. Dot product {dot}.</p>
    </Card>
  );
}

export function LinearProgrammingLab() {
  const [c1, setC1] = useState(2);
  const [c2, setC2] = useState(3);
  const corners = [[0, 0], [0, 4], [3, 2], [5, 0]];
  const best = corners.map(([x, y]) => ({ x, y, value: c1 * x + c2 * y })).sort((p, q) => q.value - p.value)[0];
  return (
    <Card title="Linear programming, two variables">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Coefficient of x" value={c1} set={setC1} />
        <Field label="Coefficient of y" value={c2} set={setC2} />
      </div>
      <p className="mt-3 text-sm text-slate-600">Sample constraints x ≥ 0, y ≥ 0, x + y ≤ 5, x + 2y ≤ 8. Best corner of this region is ({best.x}, {best.y}) with value {best.value}.</p>
    </Card>
  );
}

export function BayesLab() {
  const [prior, setPrior] = useState(0.4);
  const [hit, setHit] = useState(0.8);
  const [miss, setMiss] = useState(0.3);
  const evidence = hit * prior + miss * (1 - prior);
  const posterior = evidence === 0 ? NaN : (hit * prior) / evidence;
  return (
    <Card title="Conditional probability and Bayes">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="P(A)" value={prior} set={setPrior} />
        <Field label="P(B|A)" value={hit} set={setHit} />
        <Field label="P(B|A')" value={miss} set={setMiss} />
      </div>
      <p className="mt-3 text-sm text-slate-600">P(B) = {evidence.toFixed(3)}. P(A|B) = {Number.isFinite(posterior) ? posterior.toFixed(3) : "undefined"}.</p>
    </Card>
  );
}
