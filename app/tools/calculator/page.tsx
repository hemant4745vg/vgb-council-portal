"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "katex/dist/katex.min.css";
import katex from "katex";
import { all, create, MathJsInstance } from "mathjs";

const math: MathJsInstance = create(all, {});
const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#ea580c", "#0891b2"];

type Expr = { id: number; raw: string; visible: boolean; color: string };
type Viewport = { xMin: number; xMax: number; yMin: number; yMax: number };

function Latex({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    try {
      katex.render(value || "\\,", ref.current, {
        throwOnError: false,
        trust: false,
      });
    } catch {
      ref.current.textContent = value;
    }
  }, [value]);

  return <span ref={ref} className={className} />;
}

function toLatex(raw: string) {
  if (!raw.trim()) return "";

  try {
    return math.parse(raw).toTex({ parenthesis: "keep" });
  } catch {
    return raw.replaceAll("*", "\\cdot ");
  }
}

function valueAt(raw: string, x: number) {
  const source = raw.trim().replace(/^y\s*=\s*/i, "");

  if (!source) return NaN;

  try {
    const value = math.evaluate(source, { x });

    return typeof value === "number" && Number.isFinite(value)
      ? value
      : NaN;
  } catch {
    return NaN;
  }
}

function fmt(n: number) {
  if (!Number.isFinite(n)) return "undefined";

  if (Math.abs(n) < 1e-12) n = 0;

  const r = Math.round(n);

  return Math.abs(n - r) < 1e-12
    ? String(r)
    : Number(n.toPrecision(10)).toString();
}

function Graph({
  expressions,
  viewport,
  setViewport,
}: {
  expressions: Expr[];
  viewport: Viewport;
  setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
}) {
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);

  const W = 800;
  const H = 520;
  const P = 42;

  const mapX = (x: number) =>
    P +
    ((x - viewport.xMin) / (viewport.xMax - viewport.xMin)) *
      (W - 2 * P);

  const mapY = (y: number) =>
    H -
    P -
    ((y - viewport.yMin) / (viewport.yMax - viewport.yMin)) *
      (H - 2 * P);

  const ticks = (min: number, max: number) => {
    const rough = (max - min) / 10;

    const power = Math.pow(
      10,
      Math.floor(Math.log10(Math.max(rough, 1e-12)))
    );

    const step =
      [1, 2, 5, 10].find((v) => rough <= v * power)! * power;

    const out: number[] = [];

    for (
      let v = Math.ceil(min / step) * step;
      v <= max + step * 0.1;
      v += step
    ) {
      out.push(Number(v.toFixed(10)));
    }

    return out;
  };

  const xTicks = ticks(viewport.xMin, viewport.xMax);
  const yTicks = ticks(viewport.yMin, viewport.yMax);

  function pathFor(expr: Expr) {
    const pieces: string[] = [];
    let drawing = false;

    for (let i = 0; i <= 900; i++) {
      const x =
        viewport.xMin +
        (i / 900) * (viewport.xMax - viewport.xMin);

      const y = valueAt(expr.raw, x);

      if (!Number.isFinite(y)) {
        drawing = false;
        continue;
      }

      const sx = mapX(x);
      const sy = mapY(y);

      if (sy < -1500 || sy > H + 1500) {
        drawing = false;
        continue;
      }

      if (!drawing) {
        pieces.push(`M ${sx.toFixed(2)} ${sy.toFixed(2)}`);
        drawing = true;
      } else {
        pieces.push(`L ${sx.toFixed(2)} ${sy.toFixed(2)}`);
      }
    }

    return pieces.join(" ");
  }

  const zoom = (factor: number) => {
    const cx = (viewport.xMin + viewport.xMax) / 2;
    const cy = (viewport.yMin + viewport.yMax) / 2;

    const hx =
      ((viewport.xMax - viewport.xMin) * factor) / 2;

    const hy =
      ((viewport.yMax - viewport.yMin) * factor) / 2;

    setViewport({
      xMin: cx - hx,
      xMax: cx + hx,
      yMin: cy - hy,
      yMax: cy + hy,
    });
  };

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full touch-none select-none"
        aria-label="Interactive graph"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);

          setDrag({
            x: e.clientX,
            y: e.clientY,
          });
        }}
        onPointerMove={(e) => {
          if (!drag) return;

          const dx = e.clientX - drag.x;
          const dy = e.clientY - drag.y;

          const sx =
            (viewport.xMax - viewport.xMin) / (W - 2 * P);

          const sy =
            (viewport.yMax - viewport.yMin) / (H - 2 * P);

          setViewport((v) => ({
            xMin: v.xMin - dx * sx,
            xMax: v.xMax - dx * sx,
            yMin: v.yMin + dy * sy,
            yMax: v.yMax + dy * sy,
          }));

          setDrag({
            x: e.clientX,
            y: e.clientY,
          });
        }}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
        onWheel={(e) => {
          e.preventDefault();
          zoom(e.deltaY > 0 ? 1.12 : 0.89);
        }}
      >
        <rect width={W} height={H} fill="#fff" />

        {xTicks.map((x) => (
          <g key={`x${x}`}>
            <line
              x1={mapX(x)}
              x2={mapX(x)}
              y1={P}
              y2={H - P}
              stroke="#e2e8f0"
            />

            {Math.abs(x) > 1e-12 && (
              <text
                x={mapX(x)}
                y={H - 18}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {fmt(x)}
              </text>
            )}
          </g>
        ))}

        {yTicks.map((y) => (
          <g key={`y${y}`}>
            <line
              x1={P}
              x2={W - P}
              y1={mapY(y)}
              y2={mapY(y)}
              stroke="#e2e8f0"
            />

            {Math.abs(y) > 1e-12 && (
              <text
                x="22"
                y={mapY(y) + 4}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {fmt(y)}
              </text>
            )}
          </g>
        ))}

        {viewport.xMin <= 0 && viewport.xMax >= 0 && (
          <line
            x1={mapX(0)}
            x2={mapX(0)}
            y1={P}
            y2={H - P}
            stroke="#334155"
            strokeWidth="1.5"
          />
        )}

        {viewport.yMin <= 0 && viewport.yMax >= 0 && (
          <line
            x1={P}
            x2={W - P}
            y1={mapY(0)}
            y2={mapY(0)}
            stroke="#334155"
            strokeWidth="1.5"
          />
        )}

        {expressions
          .filter((e) => e.visible && e.raw.trim())
          .map((e) => (
            <path
              key={e.id}
              d={pathFor(e)}
              fill="none"
              stroke={e.color}
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          ))}
      </svg>

      <div className="absolute right-3 top-3 flex gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm">
        <button
          type="button"
          onClick={() => zoom(0.8)}
          className="h-9 w-9 rounded-lg text-lg hover:bg-slate-100"
        >
          +
        </button>

        <button
          type="button"
          onClick={() => zoom(1.25)}
          className="h-9 w-9 rounded-lg text-lg hover:bg-slate-100"
        >
          −
        </button>

        <button
          type="button"
          onClick={() =>
            setViewport({
              xMin: -10,
              xMax: 10,
              yMin: -10,
              yMax: 10,
            })
          }
          className="rounded-lg px-2 text-xs font-semibold hover:bg-slate-100"
        >
          Reset
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] text-slate-500 shadow-sm">
        Drag to pan · scroll to zoom
      </div>
    </div>
  );
}

const basic = [
  ["7", "8", "9", "÷"],
  ["4", "5", "6", "×"],
  ["1", "2", "3", "−"],
  ["0", ".", "(", ")"],
];

const scientific = [
  ["sin", "cos", "tan", "π"],
  ["asin", "acos", "atan", "e"],
  ["log", "ln", "√", "x²"],
  ["xʸ", "n!", "abs", "1/x"],
];

export default function CalculatorPage() {
  const [mode, setMode] =
    useState<"Graph" | "Calculate" | "Table">("Graph");

  const [expressions, setExpressions] = useState<Expr[]>([
    {
      id: 1,
      raw: "x^2",
      visible: true,
      color: COLORS[0],
    },
  ]);

  const [activeId, setActiveId] = useState(1);

  const [viewport, setViewport] = useState<Viewport>({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
  });

  const [scientificOn, setScientificOn] = useState(false);

  const [calc, setCalc] = useState("");
  const [answer, setAnswer] = useState("");

  const [start, setStart] = useState(-5);
  const [step, setStep] = useState(1);

  const active =
    expressions.find((e) => e.id === activeId) ??
    expressions[0];

  const update = (raw: string) =>
    setExpressions((items) =>
      items.map((e) =>
        e.id === activeId
          ? {
              ...e,
              raw,
            }
          : e
      )
    );

  const add = () => {
    const id = Date.now();

    setExpressions((items) => [
      ...items,
      {
        id,
        raw: "",
        visible: true,
        color: COLORS[items.length % COLORS.length],
      },
    ]);

    setActiveId(id);
  };

  const calculate = () => {
    try {
      const v = math.evaluate(calc, {
        ans: Number(answer) || 0,
      });

      setAnswer(
        typeof v === "number"
          ? fmt(v)
          : String(v)
      );
    } catch {
      setAnswer("Check expression");
    }
  };

  const press = (key: string) => {
    const target =
      mode === "Graph"
        ? active.raw
        : calc;

    const put = (v: string) =>
      mode === "Graph"
        ? update(target + v)
        : setCalc(target + v);

    if (key === "÷") return put("/");
    if (key === "×") return put("*");
    if (key === "−") return put("-");
    if (key === "π") return put("pi");
    if (key === "√") return put("sqrt(");

    if (key === "x²") {
      return mode === "Graph"
        ? update(`(${target})^2`)
        : setCalc(`(${target})^2`);
    }

    if (key === "xʸ") return put("^");
    if (key === "n!") return put("!");

    if (key === "1/x") {
      return mode === "Graph"
        ? update(`1/(${target})`)
        : setCalc(`1/(${target})`);
    }

    if (key === "AC") {
      if (mode === "Graph") {
        update("");
      } else {
        setCalc("");
        setAnswer("");
      }

      return;
    }

    if (
      [
        "sin",
        "cos",
        "tan",
        "asin",
        "acos",
        "atan",
        "log",
        "ln",
        "abs",
      ].includes(key)
    ) {
      return put(`${key}(`);
    }

    return put(key);
  };

  const rows = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const x = start + i * step;

        return {
          x,
          y: valueAt(active.raw, x),
        };
      }),
    [active.raw, start, step]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (/^[0-9.+\-*/^()]$/.test(e.key)) {
        if (mode === "Graph") {
          update(active.raw + e.key);
        } else {
          setCalc((s) => s + e.key);
        }
      }

      if (
        e.key === "Enter" &&
        mode === "Calculate"
      ) {
        calculate();
      }

      if (e.key === "Backspace") {
        if (mode === "Graph") {
          update(active.raw.slice(0, -1));
        } else {
          setCalc((s) => s.slice(0, -1));
        }
      }

      if (e.key === "Escape") {
        if (mode === "Graph") {
          update("");
        } else {
          setCalc("");
          setAnswer("");
        }
      }
    };

    window.addEventListener("keydown", onKey);

    return () =>
      window.removeEventListener("keydown", onKey);
  });

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-5 lg:px-7">
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">
              VGB Tools · Mathematics
            </div>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Calculator
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              ["Graph", "Calculate", "Table"] as const
            ).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  mode === m
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {m}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                setScientificOn((v) => !v)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {scientificOn
                ? "Scientific on"
                : "Scientific"}
            </button>
          </div>
        </header>

        <div className="grid gap-3 lg:grid-cols-[340px_minmax(0,1fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">
                  Expressions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  One expression per line. Graph them together.
                </p>
              </div>

              <button
                type="button"
                onClick={add}
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-200"
              >
                + Add
              </button>
            </div>

            <div className="max-h-[540px] space-y-2 overflow-auto p-3">
              {expressions.map((e, i) => (
                <div
                  key={e.id}
                  className={`rounded-xl border p-2.5 ${
                    activeId === e.id
                      ? "border-slate-400 bg-slate-50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpressions((xs) =>
                          xs.map((x) =>
                            x.id === e.id
                              ? {
                                  ...x,
                                  visible: !x.visible,
                                }
                              : x
                          )
                        )
                      }
                      className="h-3 w-3 rounded-full border-2"
                      style={{
                        borderColor: e.color,
                        background: e.visible
                          ? e.color
                          : "transparent",
                      }}
                      aria-label="Toggle graph"
                    />

                    <span className="text-[11px] font-semibold text-slate-400">
                      {i + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setExpressions((xs) =>
                          xs.length === 1
                            ? [{ ...e, raw: "" }]
                            : xs.filter(
                                (x) => x.id !== e.id
                              )
                        )
                      }
                      className="ml-auto text-xs text-slate-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>

                  <input
                    value={e.raw}
                    onFocus={() =>
                      setActiveId(e.id)
                    }
                    onChange={(ev) =>
                      update(ev.target.value)
                    }
                    placeholder="x^2 - 4x + 3"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
                  />

                  <div className="mt-2 min-h-7 overflow-x-auto px-1">
                    {e.raw ? (
                      <Latex
                        value={toLatex(e.raw)}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">
                        Mathematical preview
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="min-w-0">
            {mode === "Graph" && (
              <Graph
                expressions={expressions}
                viewport={viewport}
                setViewport={setViewport}
              />
            )}

            {mode === "Table" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Value table
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Evaluate the selected expression at regular x-values.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <label className="text-xs text-slate-500">
                      Start
                      <input
                        type="number"
                        value={start}
                        onChange={(e) =>
                          setStart(
                            Number(e.target.value)
                          )
                        }
                        className="mt-1 block w-20 rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-900"
                      />
                    </label>

                    <label className="text-xs text-slate-500">
                      Step
                      <input
                        type="number"
                        value={step}
                        onChange={(e) =>
                          setStep(
                            Number(e.target.value) || 1
                          )
                        }
                        className="mt-1 block w-20 rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-900"
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">
                          x
                        </th>

                        <th className="px-4 py-3">
                          f(x)
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((r) => (
                        <tr
                          key={r.x}
                          className="border-t border-slate-100"
                        >
                          <td className="px-4 py-3 font-mono">
                            {fmt(r.x)}
                          </td>

                          <td className="px-4 py-3 font-mono">
                            {Number.isFinite(r.y)
                              ? fmt(r.y)
                              : "undefined"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {mode === "Calculate" && (
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="rounded-2xl bg-slate-950 p-5 text-right text-white">
                    <div className="min-h-10 overflow-x-auto text-sm text-slate-400">
                      {calc ? (
                        <Latex
                          value={toLatex(calc)}
                        />
                      ) : (
                        "\\,"
                      )}
                    </div>

                    <div className="mt-3 min-h-12 text-3xl font-semibold">
                      {answer || "0"}
                    </div>
                  </div>

                  {scientificOn && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {scientific
                        .flat()
                        .map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() =>
                              press(k)
                            }
                            className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold hover:bg-slate-100"
                          >
                            {k}
                          </button>
                        ))}
                    </div>
                  )}

                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {basic.flat().map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => press(k)}
                        className="min-h-14 rounded-xl border border-slate-200 bg-white text-lg font-semibold hover:bg-slate-50"
                      >
                        {k}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => press("AC")}
                      className="min-h-14 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold"
                    >
                      AC
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onClick={() =>
  onClick={() =>
  update(active.raw.slice(0, -1))
}
                      className="min-h-14 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold"
                    >
                      DEL
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        mode === "Graph"
                          ? update(
                              `-(${active.raw})`
                            )
                          : setCalc(
                              (s) => `-(${s})`
                            )
                      }
                      className="min-h-14 rounded-xl border border-slate-200 bg-slate-100 text-lg font-semibold"
                    >
                      ±
                    </button>

                    <button
                      type="button"
                      onClick={calculate}
                      className="min-h-14 rounded-xl bg-slate-950 text-lg font-semibold text-white hover:bg-slate-800"
                    >
                      =
                    </button>
                  </div>
                </div>

                <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-semibold">
                    Math input
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Expressions render as mathematics instead of plain programmer text.
                  </p>

                  <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-3">
                    <Latex
                      value={
                        "\\frac{1}{2}+\\frac{3}{4}=\\frac{5}{4}"
                      }
                    />
                  </div>

                  <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3">
                    <Latex
                      value={"\\sqrt{x^2+1}"}
                    />
                  </div>

                  <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3">
                    <Latex
                      value={
                        "\\sin(30^\\circ)=\\frac{1}{2}"
                      }
                    />
                  </div>
                </aside>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
