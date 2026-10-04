"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "katex/dist/katex.min.css";
import katex from "katex";
import { all, create, MathJsInstance } from "mathjs";

const math: MathJsInstance = create(all, {});

const COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#0891b2",
];

const STORAGE_KEY = "vgb-mathematics-workspace-v1";

type Expr = {
  id: number;
  raw: string;
  visible: boolean;
  color: string;
};

type Viewport = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

type Workspace = {
  expressions: Expr[];
  activeId: number;
  viewport: Viewport;
  scientificOn: boolean;
  mode: "Graph" | "Calculate" | "Table";
  calc: string;
  answer: string;
  start: number;
  step: number;
};

type HistoryState = {
  expressions: Expr[];
  activeId: number;
  viewport: Viewport;
  calc: string;
  answer: string;
};

const DEFAULT_VIEWPORT: Viewport = {
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
};

const DEFAULT_EXPRESSIONS: Expr[] = [
  {
    id: 1,
    raw: "x^2",
    visible: true,
    color: COLORS[0],
  },
];

function cloneExpressions(expressions: Expr[]) {
  return expressions.map((expression) => ({ ...expression }));
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

type Section =
  | "overview"
  | "graph"
  | "trig"
  | "algebra"
  | "geometry"
  | "probability"
  | "statistics"
  | "calculus"
  | "conics"
  | "practice"
  | "reference";

type ClassLevel = "XI" | "XII";

function Latex({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
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
    return math.parse(raw).toTex({
      parenthesis: "keep",
    });
  } catch {
    return raw.replaceAll("*", "\\cdot ");
  }
}

function normalizeExpression(raw: string) {
  let source = raw
    .trim()
    .replace(/^y\s*=\s*/i, "")
    .replace(/^f\s*\(\s*x\s*\)\s*=\s*/i, "");

  if (!source) return "";

  /*
   * Handle expressions such as:
   *   sin x
   *   cos x
   *   tan x
   *   sqrt x
   *   log x
   */
  source = source
    .replace(/\b(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|sqrt|abs|ln)\s*([+-]?\d+(?:\.\d+)?)\s*x\b/gi, "$1($2x)")
    .replace(/\b(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|sqrt|abs|ln)\s+([+-]?(?:\d+(?:\.\d+)?|x))\b/gi, "$1($2)")
    .replace(/\blog\b/gi, "ln");

  /*
   * Handle implicit multiplication:
   *   2x
   *   3x
   *   xsin(x)
   *   2sin(x)
   */
  source = source
    .replace(/(\d|x|\))\s*(?=x\b)/gi, "$1*")
    .replace(
      /(\d|x|\))\s*(?=(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|sqrt|abs|log|ln)\s*\()/gi,
      "$1*"
    );

  return source;
}

function valueAt(raw: string, x: number) {
  const source = normalizeExpression(raw);

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

function makeId() {
  return Date.now() + Math.floor(Math.random() * 1000);
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
  const [drag, setDrag] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [hoveredIntersection, setHoveredIntersection] =
    useState<{
      x: number;
      y: number;
      a: number;
      b: number;
    } | null>(null);

  const W = 800;
  const H = 520;
  const P = 42;

  const mapX = (x: number) =>
    P +
    ((x - viewport.xMin) /
      (viewport.xMax - viewport.xMin)) *
      (W - 2 * P);

  const mapY = (y: number) =>
    H -
    P -
    ((y - viewport.yMin) /
      (viewport.yMax - viewport.yMin)) *
      (H - 2 * P);

  /*
   * Generate reasonably human-friendly axis ticks.
   */
  const ticks = (min: number, max: number) => {
    const rough = (max - min) / 10;

    const power = Math.pow(
      10,
      Math.floor(Math.log10(Math.max(rough, 1e-12)))
    );

    const step =
      [1, 2, 5, 10].find(
        (v) => rough <= v * power
      )! * power;

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

  const xTicks = ticks(
    viewport.xMin,
    viewport.xMax
  );

  const yTicks = ticks(
    viewport.yMin,
    viewport.yMax
  );

  /*
   * Put labels on the actual mathematical axes whenever
   * those axes are visible.
   */
  const xAxisY =
    viewport.yMin <= 0 &&
    viewport.yMax >= 0
      ? mapY(0)
      : H - P;

  const yAxisX =
    viewport.xMin <= 0 &&
    viewport.xMax >= 0
      ? mapX(0)
      : P;

  function pathFor(expr: Expr) {
    const pieces: string[] = [];
    let drawing = false;

    for (let i = 0; i <= 900; i++) {
      const x =
        viewport.xMin +
        (i / 900) *
          (viewport.xMax - viewport.xMin);

      const y = valueAt(expr.raw, x);

      /*
       * Break the path around undefined values.
       *
       * This matters for functions such as tan(x),
       * 1/x, log(x), etc.
       */
      if (!Number.isFinite(y)) {
        drawing = false;
        continue;
      }

      const sx = mapX(x);
      const sy = mapY(y);

      /*
       * Avoid drawing enormous vertical jumps when
       * a function approaches a discontinuity.
       */
      if (sy < -1500 || sy > H + 1500) {
        drawing = false;
        continue;
      }

      if (!drawing) {
        pieces.push(
          `M ${sx.toFixed(2)} ${sy.toFixed(2)}`
        );
        drawing = true;
      } else {
        pieces.push(
          `L ${sx.toFixed(2)} ${sy.toFixed(2)}`
        );
      }
    }

    return pieces.join(" ");
  }

  /*
   * Detect intersections between visible curves.
   *
   * For two functions:
   *
   *     f(x) = g(x)
   *
   * we search for sign changes in:
   *
   *     f(x) - g(x)
   *
   * and refine each candidate using bisection.
   */
  const intersections = useMemo(() => {
    const visible = expressions.filter(
      (e) => e.visible && e.raw.trim()
    );

    const results: {
      x: number;
      y: number;
      a: number;
      b: number;
    }[] = [];

    const sampleCount = 700;

    const minX = viewport.xMin;
    const maxX = viewport.xMax;

    const dx =
      (maxX - minX) / sampleCount;

    const refine = (
      rawA: string,
      rawB: string,
      left: number,
      right: number
    ) => {
      let lo = left;
      let hi = right;

      let flo =
        valueAt(rawA, lo) -
        valueAt(rawB, lo);

      for (let i = 0; i < 28; i++) {
        const mid = (lo + hi) / 2;

        const fm =
          valueAt(rawA, mid) -
          valueAt(rawB, mid);

        if (!Number.isFinite(fm)) {
          return NaN;
        }

        if (Math.abs(fm) < 1e-8) {
          return mid;
        }

        if (
          flo === 0 ||
          flo * fm <= 0
        ) {
          hi = mid;
        } else {
          lo = mid;
          flo = fm;
        }
      }

      return (lo + hi) / 2;
    };

    for (
      let i = 0;
      i < visible.length;
      i++
    ) {
      for (
        let j = i + 1;
        j < visible.length;
        j++
      ) {
        const a = visible[i];
        const b = visible[j];

        let previousX = minX;

        let previousDiff =
          valueAt(a.raw, previousX) -
          valueAt(b.raw, previousX);

        for (
          let s = 1;
          s <= sampleCount;
          s++
        ) {
          const currentX =
            minX + s * dx;

          const currentDiff =
            valueAt(a.raw, currentX) -
            valueAt(b.raw, currentX);

          if (
            Number.isFinite(
              previousDiff
            ) &&
            Number.isFinite(
              currentDiff
            ) &&
            (
              Math.abs(
                previousDiff
              ) < 1e-7 ||
              previousDiff *
                currentDiff <
                0
            )
          ) {
            const root = refine(
              a.raw,
              b.raw,
              previousX,
              currentX
            );

            if (Number.isFinite(root)) {
              const y = valueAt(
                a.raw,
                root
              );

              if (
                Number.isFinite(y) &&
                root >= minX &&
                root <= maxX &&
                y >= viewport.yMin &&
                y <= viewport.yMax
              ) {
                /*
                 * Remove duplicate roots that can occur
                 * when the zero is sampled on neighboring
                 * intervals.
                 */
                const duplicate =
                  results.some(
                    (point) =>
                      Math.abs(
                        point.x - root
                      ) <
                        Math.max(
                          dx * 1.5,
                          1e-6
                        ) &&
                      Math.abs(
                        point.y - y
                      ) <
                        Math.max(
                          (
                            viewport.yMax -
                            viewport.yMin
                          ) / 500,
                          1e-6
                        )
                  );

                if (!duplicate) {
                  results.push({
                    x: root,
                    y,
                    a: a.id,
                    b: b.id,
                  });
                }
              }
            }
          }

          previousX = currentX;
          previousDiff = currentDiff;
        }
      }
    }

    /*
     * Prevent pathological cases from producing hundreds
     * of interactive SVG elements.
     */
    return results.slice(0, 100);
  }, [
    expressions,
    viewport.xMin,
    viewport.xMax,
    viewport.yMin,
    viewport.yMax,
  ]);

  const zoom = (factor: number) => {
    const cx =
      (viewport.xMin +
        viewport.xMax) /
      2;

    const cy =
      (viewport.yMin +
        viewport.yMax) /
      2;

    const hx =
      ((viewport.xMax -
        viewport.xMin) *
        factor) /
      2;

    const hy =
      ((viewport.yMax -
        viewport.yMin) *
        factor) /
      2;

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
          e.currentTarget.setPointerCapture(
            e.pointerId
          );

          setDrag({
            x: e.clientX,
            y: e.clientY,
          });
        }}
        onPointerMove={(e) => {
          if (!drag) return;

          const dx =
            e.clientX - drag.x;

          const dy =
            e.clientY - drag.y;

          const sx =
            (viewport.xMax -
              viewport.xMin) /
            (W - 2 * P);

          const sy =
            (viewport.yMax -
              viewport.yMin) /
            (H - 2 * P);

          setViewport((v) => ({
            xMin:
              v.xMin - dx * sx,
            xMax:
              v.xMax - dx * sx,
            yMin:
              v.yMin + dy * sy,
            yMax:
              v.yMax + dy * sy,
          }));

          setDrag({
            x: e.clientX,
            y: e.clientY,
          });
        }}
        onPointerUp={() =>
          setDrag(null)
        }
        onPointerCancel={() =>
          setDrag(null)
        }
        onPointerLeave={() => {
          setDrag(null);
          setHoveredIntersection(
            null
          );
        }}
        onWheel={(e) => {
          e.preventDefault();

          zoom(
            e.deltaY > 0
              ? 1.12
              : 0.89
          );
        }}
      >
        <rect
          width={W}
          height={H}
          fill="#fff"
        />

        {/* Vertical grid + x-axis labels */}
        {xTicks.map((x) => (
          <g key={`x${x}`}>
            <line
              x1={mapX(x)}
              x2={mapX(x)}
              y1={P}
              y2={H - P}
              stroke="#e2e8f0"
            />

            {Math.abs(x) >
              1e-12 && (
              <text
                x={mapX(x)}
                y={Math.min(
                  H - 6,
                  Math.max(
                    14,
                    xAxisY + 16
                  )
                )}
                textAnchor="middle"
                fontSize="11"
                fill="#475569"
                pointerEvents="none"
              >
                {fmt(x)}
              </text>
            )}
          </g>
        ))}

        {/* Horizontal grid + y-axis labels */}
        {yTicks.map((y) => (
          <g key={`y${y}`}>
            <line
              x1={P}
              x2={W - P}
              y1={mapY(y)}
              y2={mapY(y)}
              stroke="#e2e8f0"
            />

            {Math.abs(y) >
              1e-12 && (
              <text
                x={Math.min(
                  W - 8,
                  Math.max(
                    12,
                    yAxisX - 10
                  )
                )}
                y={mapY(y) + 4}
                textAnchor="end"
                fontSize="11"
                fill="#475569"
                pointerEvents="none"
              >
                {fmt(y)}
              </text>
            )}
          </g>
        ))}

        {/* y-axis */}
        {viewport.xMin <= 0 &&
          viewport.xMax >= 0 && (
            <line
              x1={mapX(0)}
              x2={mapX(0)}
              y1={P}
              y2={H - P}
              stroke="#334155"
              strokeWidth="1.5"
              pointerEvents="none"
            />
          )}

        {/* x-axis */}
        {viewport.yMin <= 0 &&
          viewport.yMax >= 0 && (
            <line
              x1={P}
              x2={W - P}
              y1={mapY(0)}
              y2={mapY(0)}
              stroke="#334155"
              strokeWidth="1.5"
              pointerEvents="none"
            />
          )}

        {/* Function curves */}
        {expressions
          .filter(
            (e) =>
              e.visible &&
              e.raw.trim()
          )
          .map((e) => (
            <path
              key={e.id}
              d={pathFor(e)}
              fill="none"
              stroke={e.color}
              strokeWidth="2.6"
              strokeLinecap="round"
              pointerEvents="none"
            />
          ))}

        {/* Important curve intersections */}
        {intersections.map(
          (point, index) => {
            const sx = mapX(
              point.x
            );

            const sy = mapY(
              point.y
            );

            const hovered =
              hoveredIntersection?.x ===
                point.x &&
              hoveredIntersection?.y ===
                point.y;

            return (
              <g
                key={`${point.a}-${point.b}-${index}`}
                onPointerEnter={(e) => {
                  e.stopPropagation();

                  setHoveredIntersection(
                    point
                  );
                }}
                onPointerLeave={() =>
                  setHoveredIntersection(
                    null
                  )
                }
                style={{
                  cursor: "pointer",
                }}
              >
                {hovered && (
                  <>
                    {/* Vertical guide */}
                    <line
                      x1={sx}
                      x2={sx}
                      y1={P}
                      y2={H - P}
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      pointerEvents="none"
                    />

                    {/* Horizontal guide */}
                    <line
                      x1={P}
                      x2={W - P}
                      y1={sy}
                      y2={sy}
                      stroke="#94a3b8"
                      strokeDasharray="5 5"
                      pointerEvents="none"
                    />

                    <circle
                      cx={sx}
                      cy={sy}
                      r="9"
                      fill="white"
                      stroke="#0f172a"
                      strokeWidth="2"
                      pointerEvents="none"
                    />
                  </>
                )}

                <circle
                  cx={sx}
                  cy={sy}
                  r={
                    hovered
                      ? 10
                      : 5
                  }
                  fill="white"
                  stroke="#0f172a"
                  strokeWidth={
                    hovered
                      ? 2.5
                      : 2
                  }
                />

                {hovered && (
                  <g pointerEvents="none">
                    <rect
                      x={Math.min(
                        W - 154,
                        Math.max(
                          8,
                          sx + 12
                        )
                      )}
                      y={Math.max(
                        8,
                        sy - 42
                      )}
                      width="146"
                      height="34"
                      rx="8"
                      fill="#0f172a"
                    />

                    <text
                      x={Math.min(
                        W - 81,
                        Math.max(
                          81,
                          sx + 85
                        )
                      )}
                      y={Math.max(
                        29,
                        sy - 20
                      )}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="600"
                      fill="white"
                    >
                      ({fmt(point.x)},{" "}
                      {fmt(point.y)})
                    </text>
                  </g>
                )}
              </g>
            );
          })}
      </svg>

      <div className="absolute right-3 top-3 flex gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-sm">
        <button
          type="button"
          onClick={() =>
            zoom(0.8)
          }
          className="h-9 w-9 rounded-lg text-lg hover:bg-slate-100"
          aria-label="Zoom in"
        >
          +
        </button>

        <button
          type="button"
          onClick={() =>
            zoom(1.25)
          }
          className="h-9 w-9 rounded-lg text-lg hover:bg-slate-100"
          aria-label="Zoom out"
        >
          −
        </button>

        <button
          type="button"
          onClick={() =>
            setViewport(
              DEFAULT_VIEWPORT
            )
          }
          className="rounded-lg px-3 text-xs font-semibold hover:bg-slate-100"
        >
          Reset
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-[11px] text-slate-500 shadow-sm">
        Drag to pan · scroll to zoom · hover intersections
      </div>
    </div>
  );
}
/* =========================================================
   UNIT CIRCLE
========================================================= */

function TrigonometryLab() {
  const [angle, setAngle] =
    useState(45);

  const radians =
    (angle * Math.PI) / 180;

  const x = Math.cos(radians);
  const y = Math.sin(radians);

  const size = 400;
  const center = size / 2;
  const radius = 135;

  const px =
    center + radius * x;

  const py =
    center - radius * y;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Unit Circle Explorer
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Drag the angle slider and watch
            the trigonometric values change.
          </p>
        </div>

        <div className="flex justify-center overflow-auto">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[440px]"
          >
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="2"
            />

            <line
              x1={45}
              x2={355}
              y1={center}
              y2={center}
              stroke="#64748b"
            />

            <line
              x1={center}
              x2={center}
              y1={45}
              y2={355}
              stroke="#64748b"
            />

            <line
              x1={center}
              x2={px}
              y1={center}
              y2={py}
              stroke="#2563eb"
              strokeWidth="3"
            />

            <line
              x1={px}
              x2={px}
              y1={center}
              y2={py}
              stroke="#16a34a"
              strokeDasharray="5 5"
            />

            <circle
              cx={px}
              cy={py}
              r={7}
              fill="#2563eb"
            />

            <text
              x={center + 145}
              y={center - 8}
              fontSize="13"
              fill="#334155"
            >
              x
            </text>

            <text
              x={center + 8}
              y={55}
              fontSize="13"
              fill="#334155"
            >
              y
            </text>

            <text
              x={center + 10}
              y={center - 12}
              fontSize="12"
              fill="#64748b"
            >
              θ
            </text>

            <text
              x={px + 10}
              y={py - 10}
              fontSize="12"
              fontWeight="700"
              fill="#2563eb"
            >
              ({fmt(x)}, {fmt(y)})
            </text>
          </svg>
        </div>

        <div className="mt-5">
          <input
            type="range"
            min="-360"
            max="360"
            step="1"
            value={angle}
            onChange={(e) =>
              setAngle(
                Number(e.target.value)
              )
            }
            className="w-full"
          />

          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>-360°</span>
            <span>0°</span>
            <span>360°</span>
          </div>
        </div>
      </section>

          </div>
  );
}

/* =========================================================
   ALGEBRA LAB
========================================================= */

function AlgebraLab() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(-5);
  const [c, setC] = useState(6);

  const discriminant =
    b * b - 4 * a * c;
  const linear = a === 0;
  const roots = linear
    ? b !== 0
      ? [-c / b]
      : []
    : discriminant >= 0
      ? [
          (-b + Math.sqrt(discriminant)) / (2 * a),
          (-b - Math.sqrt(discriminant)) / (2 * a),
        ]
      : [];
  const complexReal = linear ? NaN : -b / (2 * a);
  const complexImag = linear
    ? NaN
    : Math.sqrt(Math.abs(discriminant)) / Math.abs(2 * a);

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">
          Quadratic Explorer
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Explore how coefficients change
          the roots and discriminant.
        </p>

        <div className="mt-6 space-y-4">
          {(
            [
              ["a", a, setA],
              ["b", b, setB],
              ["c", c, setC],
            ] as [
              string,
              number,
              React.Dispatch<React.SetStateAction<number>>
            ][]
          ).map(([label, value, setter]) => (
            <label
              key={String(label)}
              className="block"
            >
              <div className="mb-1 text-sm font-medium">
                {label}
              </div>

              <input
                type="number"
                value={Number(value)}
                onChange={(e) =>
                  (setter as React.Dispatch<
                    React.SetStateAction<number>
                  >)(
                    Number(e.target.value)
                  )
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-500"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-4">
          <Latex
            value={`${a}x^2${b >= 0 ? "+" : ""}${b}x${c >= 0 ? "+" : ""}${c}=0`}
          />
        </div>
      </section>

      <section className="grid gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-[.15em] text-slate-500">
            Discriminant
          </div>

          <div className="mt-2 text-3xl font-semibold">
            {fmt(discriminant)}
          </div>

          <div className="mt-2">
            {linear && b !== 0 && (
              <span className="text-sm text-blue-700">
                Linear equation, one real root
              </span>
            )}
            {linear && b === 0 && (
              <span className="text-sm text-amber-700">
                {c === 0 ? "True for every x" : "No solution"}
              </span>
            )}
            {!linear && discriminant > 0 && (
              <span className="text-sm text-green-700">
                Two distinct real roots
              </span>
            )}
            {!linear && discriminant === 0 && (
              <span className="text-sm text-blue-700">
                One repeated real root
              </span>
            )}
            {!linear && discriminant < 0 && (
              <span className="text-sm text-purple-700">
                Complex conjugate roots
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">
            Roots
          </h3>

          {linear || discriminant >= 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {roots.map((root, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <div className="text-xs text-slate-500">
                    Root {i + 1}
                  </div>

                  <div className="mt-1 font-mono text-xl font-semibold">
                    {fmt(root)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <Latex
                value={`x=${fmt(
                  complexReal
                )}\\pm ${fmt(
                  complexImag
                )}i`}
              />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">
            Formula
          </h3>

          <div className="mt-4">
            <Latex
              value={
                "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   COORDINATE GEOMETRY
========================================================= */

function GeometryLab() {
  const [x1, setX1] = useState(1);
  const [y1, setY1] = useState(2);
  const [x2, setX2] = useState(5);
  const [y2, setY2] = useState(6);

  const dx = x2 - x1;
  const dy = y2 - y1;

  const distance = Math.sqrt(
    dx * dx + dy * dy
  );

  const slope =
    dx === 0 ? undefined : dy / dx;

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">
          Straight Line Explorer
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Define two points and inspect the
          geometry automatically.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {(
            [
              ["x₁", x1, setX1],
              ["y₁", y1, setY1],
              ["x₂", x2, setX2],
              ["y₂", y2, setY2],
            ] as [
              string,
              number,
              React.Dispatch<React.SetStateAction<number>>
            ][]
          ).map(([label, value, setter]) => (
            <label
              key={String(label)}
              className="text-xs text-slate-500"
            >
              {label}

              <input
                type="number"
                value={Number(value)}
                onChange={(e) =>
                  (setter as React.Dispatch<
                    React.SetStateAction<number>
                  >)(
                    Number(e.target.value)
                  )
                }
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold">
          Results
        </h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">
              Slope
            </div>

            <div className="mt-1 font-mono text-xl font-semibold">
              {slope === undefined
                ? "undefined"
                : fmt(slope)}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">
              Distance
            </div>

            <div className="mt-1 font-mono text-xl font-semibold">
              {fmt(distance)}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Distance formula
          </div>

          <div className="mt-3">
            <Latex
              value={`d=\\sqrt{(${x2}-${x1})^2+(${y2}-${y1})^2}`}
            />
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Point-slope form
          </div>

          <div className="mt-3">
            {slope === undefined ? (
              <Latex
                value={`x=${x1}`}
              />
            ) : (
              <Latex
                value={`y-${y1}=${fmt(
                  slope
                )}(x-${x1})`}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   PROBABILITY
========================================================= */

function ProbabilityLab() {
  const [heads, setHeads] =
    useState(0);

  const [tails, setTails] =
    useState(0);

  const total =
    heads + tails;

  const probability =
    total === 0
      ? 0
      : heads / total;

  const toss = () => {
    if (Math.random() < 0.5) {
      setHeads((v) => v + 1);
    } else {
      setTails((v) => v + 1);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">
          Probability Experiment
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Compare experimental probability
          with the theoretical value.
        </p>

        <button
          type="button"
          onClick={toss}
          className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Toss Coin
        </button>

        <button
          type="button"
          onClick={() => {
            setHeads(0);
            setTails(0);
          }}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
        >
          Reset
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">
              Heads
            </div>

            <div className="mt-1 text-2xl font-semibold">
              {heads}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">
              Tails
            </div>

            <div className="mt-1 text-2xl font-semibold">
              {tails}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">
              Trials
            </div>

            <div className="mt-1 text-2xl font-semibold">
              {total}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 p-5">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Experimental probability of heads
          </div>

          <div className="mt-2 text-3xl font-semibold">
            {total === 0 ? "—" : `${(probability * 100).toFixed(2)}%`}
          </div>
          <p className="mt-2 text-sm text-slate-500">Theoretical probability of heads for a fair coin: 50%.</p>
          <div className="relative mt-4 h-5 overflow-hidden rounded-full bg-slate-100">
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-emerald-500" />
            <div
              className="h-full rounded-full bg-slate-900 transition-all"
              style={{ width: `${Math.min(probability * 100, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">The green mark is the theoretical 50%.</p>
        </div>

        <div className="mt-5">
          <Latex
            value={
              "P(H)=\\frac{\\text{number of heads}}{\\text{total trials}}"
            }
          />
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   STATISTICS
========================================================= */

function StatisticsLab() {
  const [input, setInput] =
    useState(
      "12, 15, 15, 18, 21, 24"
    );

  const values = useMemo(() => {
    return input
      .split(/[,\s]+/)
      .map(Number)
      .filter(Number.isFinite);
  }, [input]);

  const mean =
    values.length === 0
      ? NaN
      : values.reduce(
          (a, b) => a + b,
          0
        ) / values.length;

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const median =
    sorted.length === 0
      ? NaN
      : sorted.length % 2
      ? sorted[
          Math.floor(sorted.length / 2)
        ]
      : (sorted[
          sorted.length / 2 - 1
        ] +
          sorted[
            sorted.length / 2
          ]) /
        2;

  const variance =
    values.length === 0
      ? 0
      : values.reduce(
          (sum, value) =>
            sum +
            Math.pow(
              value - mean,
              2
            ),
          0
        ) / values.length;

  const standardDeviation =
    Math.sqrt(variance);

  const range =
    values.length === 0
      ? 0
      : Math.max(...values) -
        Math.min(...values);

  return (
    <div className="grid gap-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">
          Statistics Lab
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Enter an ungrouped dataset and
          inspect its measures of dispersion.
        </p>

        <textarea
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          className="mt-5 min-h-28 w-full rounded-xl border border-slate-200 p-3 font-mono text-sm outline-none focus:border-slate-500"
          placeholder="12, 15, 18, 21..."
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Count", values.length],
          ["Mean", mean],
          ["Median", median],
          ["Range", range],
          ["SD", standardDeviation],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {label}
            </div>

            <div className="mt-2 text-2xl font-semibold">
              {fmt(Number(value))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold">
          Variance
        </h3>

        <div className="mt-4">
          <Latex
            value={`\\sigma^2=${fmt(
              variance
            )}`}
          />
        </div>

        <div className="mt-4">
          <Latex
            value={`\\sigma=\\sqrt{${fmt(
              variance
            )}}=${fmt(
              standardDeviation
            )}`}
          />
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   PRACTICE
========================================================= */

const practiceQuestions = [
  {
    topic: "Sets",
    question:
      "If A = {1, 2, 3} and B = {3, 4, 5}, find A ∩ B.",
    answer: "{3}",
  },
  {
    topic: "Functions",
    question:
      "For f(x) = 2x + 3, find f(4).",
    answer: "11",
  },
  {
    topic: "Trigonometry",
    question:
      "Find sin²x + cos²x.",
    answer: "1",
  },
  {
    topic: "Quadratic Equations",
    question:
      "Find the discriminant of x² - 5x + 6 = 0.",
    answer: "1",
  },
  {
    topic: "P&C",
    question:
      "Find 5C2.",
    answer: "10",
  },
  {
    topic: "Sequence & Series",
    question:
      "Find the 5th term of the AP 2, 5, 8, ...",
    answer: "14",
  },
  {
    topic: "Matrices",
    question:
      "Find the determinant of the 2×2 identity matrix.",
    answer: "1",
  },
  {
    topic: "Derivatives",
    question:
      "Find dy/dx for y = x² at x = 3.",
    answer: "6",
  },
  {
    topic: "Probability",
    question:
      "If P(A) = 0.2, find P(A').",
    answer: "0.8",
  },
  {
    topic: "Vectors",
    question: "Find the magnitude of the vector 3i + 4j.",
    answer: "5",
  },
  {
    topic: "Integrals",
    question: "Find the integral of 2x, without the constant.",
    answer: "x^2",
  },
];

function answersMatch(given: string, expected: string) {
  const normalise = (value: string) =>
    value.toLowerCase().replace(/\s+/g, "").replace(/[{}]/g, "");
  return normalise(given) === normalise(expected);
}

function PracticeLab() {
  const [index, setIndex] =
    useState(0);

  const [answer, setAnswer] =
    useState("");

  const [checked, setChecked] =
    useState(false);

  const question =
    practiceQuestions[index];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[.15em] text-slate-500">
            Class XI–XII · Practice
          </div>

          <h2 className="mt-1 text-xl font-semibold">
            Mathematical Practice
          </h2>
        </div>

        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
          {question.topic}
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-slate-50 p-6">
        <div className="text-xs uppercase tracking-wide text-slate-500">
          Question
        </div>

        <p className="mt-3 text-lg font-medium leading-8">
          {question.question}
        </p>
      </div>

      <input
        value={answer}
        onChange={(e) =>
          setAnswer(e.target.value)
        }
        placeholder="Enter your answer"
        className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-500"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            setChecked(true)
          }
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
        >
          Check answer
        </button>

        <button
          type="button"
          onClick={() => {
            setIndex(
              (index + 1) %
                practiceQuestions.length
            );
            setAnswer("");
            setChecked(false);
          }}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold"
        >
          Next
        </button>
      </div>

      {checked && (
        <div
          className={`mt-5 rounded-xl p-4 text-sm ${
            answersMatch(answer, question.answer)
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {answersMatch(answer, question.answer)
            ? "Correct."
            : `Not quite. The expected answer is ${question.answer}.`}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   CALCULUS LAB
========================================================= */

function CalculusLab() {
  type Mode = "limits" | "derivative" | "applications";

  const [mode, setMode] = useState<Mode>("limits");
  const [expression, setExpression] = useState("x^2");
  const [point, setPoint] = useState(2);
  const [delta, setDelta] = useState(0.5);
  const [window, setWindow] = useState(4);

  const derivative = useMemo(() => {
    try {
      return math.derivative(expression, "x").toString();
    } catch {
      return "";
    }
  }, [expression]);

  const valueAtSafe = (x: number) =>
    valueAt(expression, x);

  const derivativeAt = (x: number) => {
    if (!derivative) return NaN;

    try {
      const value = math.evaluate(derivative, { x });
      return typeof value === "number" && Number.isFinite(value)
        ? value
        : NaN;
    } catch {
      return NaN;
    }
  };

  const leftLimit = valueAtSafe(point - delta);
  const rightLimit = valueAtSafe(point + delta);
  const closerLeft = valueAtSafe(point - delta / 10);
  const closerRight = valueAtSafe(point + delta / 10);
  const functionValue = valueAtSafe(point);
  const slope = derivativeAt(point);

  const samples = useMemo(() => {
    const result: {
      x: number;
      y: number;
      dy: number;
    }[] = [];

    const span = Math.max(1, window);
    for (let i = 0; i <= 220; i++) {
      const x = point - span + (i / 220) * 2 * span;
      const y = valueAtSafe(x);
      const dy = derivativeAt(x);
      if (Number.isFinite(y) && Number.isFinite(dy)) {
        result.push({ x, y, dy });
      }
    }
    return result;
  }, [expression, point, window, derivative]);

  const stationaryPoints = useMemo(() => {
    const found: number[] = [];
    for (let i = 1; i < samples.length - 1; i++) {
      const a = samples[i - 1].dy;
      const b = samples[i].dy;
      if (Math.abs(b) < 0.08 || a * b < 0) {
        const x = samples[i].x;
        if (!found.some((v) => Math.abs(v - x) < 0.18)) {
          found.push(x);
        }
      }
    }
    return found.slice(0, 8);
  }, [samples]);

  const presets = [
    ["x²", "x^2"],
    ["x³ − 3x", "x^3-3*x"],
    ["sin x", "sin(x)"],
    ["eˣ", "exp(x)"],
  ];

  const graphW = 760;
  const graphH = 390;
  const pad = 44;
  const xMin = point - window;
  const xMax = point + window;

  const yValues = samples.map((s) => s.y);
  const rawMin = yValues.length ? Math.min(...yValues) : -5;
  const rawMax = yValues.length ? Math.max(...yValues) : 5;
  const yPad = Math.max((rawMax - rawMin) * 0.16, 1);
  const yMin = Math.min(-1, rawMin - yPad);
  const yMax = Math.max(1, rawMax + yPad);

  const sx = (x: number) =>
    pad + ((x - xMin) / (xMax - xMin)) * (graphW - 2 * pad);

  const sy = (y: number) =>
    graphH - pad - ((y - yMin) / (yMax - yMin)) * (graphH - 2 * pad);

  const path = samples
    .map((s, i) => `${i === 0 ? "M" : "L"} ${sx(s.x).toFixed(2)} ${sy(s.y).toFixed(2)}`)
    .join(" ");

  const tangentPath = (() => {
    if (!Number.isFinite(functionValue) || !Number.isFinite(slope)) return "";
    const xa = point - window * 0.65;
    const xb = point + window * 0.65;
    const ya = functionValue + slope * (xa - point);
    const yb = functionValue + slope * (xb - point);
    return `M ${sx(xa).toFixed(2)} ${sy(ya).toFixed(2)} L ${sx(xb).toFixed(2)} ${sy(yb).toFixed(2)}`;
  })();

  const reset = () => {
    setExpression("x^2");
    setPoint(2);
    setDelta(0.5);
    setWindow(4);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">
              Calculus Laboratory
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              From limits to derivatives
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Change the function and point, then watch the numerical and geometric meaning of calculus update together.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
            {([
              ["limits", "Limits"],
              ["derivative", "Derivative"],
              ["applications", "Applications"],
            ] as [Mode, string][]).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  mode === id ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[310px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Function controls</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Use x^2, sin(x) or sin 2x, exp(x) and sqrt(x). log is treated as the natural logarithm.
          </p>

          <label className="mt-5 block">
            <div className="mb-1 text-sm font-medium">f(x)</div>
            <input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-slate-500"
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            {presets.map(([label, value]) => (
              <button
                key={value}
                type="button"
                onClick={() => setExpression(value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-50"
              >
                {label}
              </button>
            ))}
          </div>

          <label className="mt-5 block">
            <div className="mb-1 flex justify-between text-sm font-medium">
              <span>Point a</span>
              <span className="font-mono text-slate-500">{fmt(point)}</span>
            </div>
            <input
              type="range"
              min="-8"
              max="8"
              step="0.1"
              value={point}
              onChange={(e) => setPoint(Number(e.target.value))}
              className="w-full"
            />
          </label>

          {mode === "limits" && (
            <label className="mt-5 block">
              <div className="mb-1 flex justify-between text-sm font-medium">
                <span>Approach distance</span>
                <span className="font-mono text-slate-500">{fmt(delta)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={delta}
                onChange={(e) => setDelta(Number(e.target.value))}
                className="w-full"
              />
            </label>
          )}

          {(mode === "derivative" || mode === "applications") && (
            <label className="mt-5 block">
              <div className="mb-1 flex justify-between text-sm font-medium">
                <span>Graph window</span>
                <span className="font-mono text-slate-500">±{fmt(window)}</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                step="0.5"
                value={window}
                onChange={(e) => setWindow(Number(e.target.value))}
                className="w-full"
              />
            </label>
          )}

          <button
            type="button"
            onClick={reset}
            className="mt-6 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Reset example
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">
                {mode === "limits" ? "Approaching a point" : mode === "derivative" ? "Function and tangent" : "Behaviour from the derivative"}
              </div>
              <div className="mt-1 font-mono text-sm text-slate-700">
                f(x) = {expression || "…"}
              </div>
            </div>
            {derivative && (
              <div className="hidden rounded-xl bg-slate-50 px-3 py-2 text-right sm:block">
                <div className="text-[10px] uppercase tracking-wide text-slate-500">f′(x)</div>
                <div className="mt-1 font-mono text-sm font-semibold">{derivative}</div>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <svg viewBox={`0 0 ${graphW} ${graphH}`} className="h-auto w-full">
              <rect width={graphW} height={graphH} fill="white" />

              {[-2, -1, 0, 1, 2].map((v) => {
                const y = sy(v);
                if (y < pad || y > graphH - pad) return null;
                return <line key={`gy-${v}`} x1={pad} x2={graphW - pad} y1={y} y2={y} stroke="#e2e8f0" />;
              })}

              {[-1, 0, 1].map((v) => {
                const x = sx(point + v * Math.max(1, window / 3));
                if (x < pad || x > graphW - pad) return null;
                return <line key={`gx-${v}`} x1={x} x2={x} y1={pad} y2={graphH - pad} stroke="#e2e8f0" />;
              })}

              {yMin <= 0 && yMax >= 0 && (
                <line x1={pad} x2={graphW - pad} y1={sy(0)} y2={sy(0)} stroke="#475569" strokeWidth="1.5" />
              )}
              {xMin <= 0 && xMax >= 0 && (
                <line x1={sx(0)} x2={sx(0)} y1={pad} y2={graphH - pad} stroke="#475569" strokeWidth="1.5" />
              )}

              <path d={path} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

              {mode === "derivative" && tangentPath && (
                <path d={tangentPath} fill="none" stroke="#dc2626" strokeWidth="2.2" strokeDasharray="7 5" />
              )}

              {mode === "applications" && stationaryPoints.map((x) => {
                const y = valueAtSafe(x);
                return Number.isFinite(y) ? (
                  <g key={x.toFixed(3)}>
                    <circle cx={sx(x)} cy={sy(y)} r="5" fill="#dc2626" />
                    <text x={sx(x) + 8} y={sy(y) - 8} fontSize="11" fill="#334155">{fmt(x)}</text>
                  </g>
                ) : null;
              })}

              {mode === "limits" && Number.isFinite(functionValue) && (
                <>
                  <line x1={sx(point)} x2={sx(point)} y1={pad} y2={graphH - pad} stroke="#94a3b8" strokeDasharray="5 5" />
                  <circle cx={sx(point)} cy={sy(functionValue)} r="6" fill="white" stroke="#2563eb" strokeWidth="3" />
                  <circle cx={sx(point - delta)} cy={sy(leftLimit)} r="4" fill="#16a34a" />
                  <circle cx={sx(point + delta)} cy={sy(rightLimit)} r="4" fill="#16a34a" />
                </>
              )}

              {mode === "derivative" && Number.isFinite(functionValue) && (
                <>
                  <line x1={sx(point)} x2={sx(point)} y1={pad} y2={graphH - pad} stroke="#94a3b8" strokeDasharray="5 5" />
                  <circle cx={sx(point)} cy={sy(functionValue)} r="6" fill="#dc2626" />
                </>
              )}

              <text x={graphW - 20} y={sy(0) - 8} fontSize="12" fontWeight="700" fill="#475569">x</text>
              <text x={sx(0) + 8} y={pad + 8} fontSize="12" fontWeight="700" fill="#475569">y</text>
            </svg>
          </div>

          {mode === "limits" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label={`f(${fmt(point - delta)})`} value={fmt(leftLimit)} />
              <Metric label={`f(${fmt(point + delta)})`} value={fmt(rightLimit)} />
              <Metric label={`f(${fmt(point)})`} value={fmt(functionValue)} />
            </div>
          )}

          {mode === "derivative" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Metric label="Function value" value={fmt(functionValue)} />
              <Metric label="Derivative at a" value={fmt(slope)} />
              <Metric label="Tangent" value={Number.isFinite(slope) && Number.isFinite(functionValue) ? `y = ${fmt(slope)}(x − ${fmt(point)}) + ${fmt(functionValue)}` : "undefined"} />
            </div>
          )}

          {mode === "applications" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Metric label="Derivative" value={derivative || "undefined"} />
              <Metric label="Stationary points detected" value={String(stationaryPoints.length)} />
            </div>
          )}
        </section>
      </div>

      {mode === "limits" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Limit intuition</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Move the approach distance toward zero. The left-hand and right-hand values should move toward the same number when the limit exists. The value of f(a) can be different, or even undefined, without changing the limiting behaviour.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Metric label={`Left: x → ${fmt(point)}⁻`} value={fmt(closerLeft)} />
            <Metric label={`Right: x → ${fmt(point)}⁺`} value={fmt(closerRight)} />
            <Metric label="Difference" value={fmt(Math.abs(closerLeft - closerRight))} />
          </div>
        </section>
      )}

      {mode === "derivative" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Derivative intuition</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            The derivative is the limiting slope of secant lines. Here the red tangent is drawn at x = a, while the blue curve is the original function.
          </p>
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <Latex value={`f'(x)=${toLatex(derivative || "undefined")}`} />
          </div>
        </section>
      )}

      {mode === "applications" && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold">Applications of derivatives</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Stationary points occur where f′(x) = 0 or where the derivative changes sign. The explorer marks likely stationary points on the curve so the connection between derivative behaviour and the original function is visible.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {stationaryPoints.length ? stationaryPoints.map((x) => (
              <span key={x.toFixed(3)} className="rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm">
                x ≈ {fmt(x)}
              </span>
            )) : (
              <span className="text-sm text-slate-500">No stationary point detected in the current window.</span>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 break-words font-mono text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

/* =========================================================
   REFERENCE
========================================================= */

const referenceGroups = [
  {
    title: "Sets",
    formulas: [
      "\\(A\\cup B\\)",
      "\\(A\\cap B\\)",
      "\\(A-B\\)",
      "\\(A'=U-A\\)",
    ],
  },
  {
    title: "Trigonometry",
    formulas: [
      "\\(\\sin^2x+\\cos^2x=1\\)",
      "\\(\\sin(x+y)=\\sin x\\cos y+\\cos x\\sin y\\)",
      "\\(\\cos(x+y)=\\cos x\\cos y-\\sin x\\sin y\\)",
    ],
  },
  {
    title: "Quadratic Equations",
    formulas: [
      "\\(x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}\\)",
      "\\(D=b^2-4ac\\)",
    ],
  },
  {
    title: "Permutations & Combinations",
    formulas: [
      "\\({}^nP_r=\\frac{n!}{(n-r)!}\\)",
      "\\({}^nC_r=\\frac{n!}{r!(n-r)!}\\)",
    ],
  },
  {
    title: "AP & GP",
    formulas: [
      "\\(a_n=a+(n-1)d\\)",
      "\\(S_n=\\frac n2[2a+(n-1)d]\\)",
      "\\(a_n=ar^{n-1}\\)",
      "\\(S_\\infty=\\frac a{1-r},\\ |r|<1\\)",
    ],
  },
  {
    title: "Coordinate Geometry",
    formulas: [
      "\\(m=\\frac{y_2-y_1}{x_2-x_1}\\)",
      "\\(d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}\\)",
    ],
  },
  {
    title: "Statistics",
    formulas: [
      "\\(\\sigma^2=\\frac{\\sum(x_i-\\bar{x})^2}{n}\\)",
      "\\(\\sigma=\\sqrt{\\sigma^2}\\)",
    ],
  },
  {
    title: "Probability",
    formulas: [
      "\\(P(A')=1-P(A)\\)",
      "\\(P(A\\cup B)=P(A)+P(B)-P(A\\cap B)\\)",
    ],
  },
  {
    title: "Matrices & Determinants",
    formulas: [
      "\\((AB)_{ij}=\\sum_k a_{ik}b_{kj}\\)",
      "\\(\\det\\begin{pmatrix}a&b\\c&d\\end{pmatrix}=ad-bc\\)",
    ],
  },
  {
    title: "Calculus",
    formulas: [
      "\\(\\frac{d}{dx}x^n=nx^{n-1}\\)",
      "\\(\\int x^n\\,dx=\\frac{x^{n+1}}{n+1}+C,\\ n\\neq-1\\)",
      "\\(\\frac{d}{dx}\\ln x=\\frac1x\\)",
    ],
  },
  {
    title: "Vectors",
    formulas: [
      "\\(|\\vec a|=\\sqrt{a_1^2+a_2^2+a_3^2}\\)",
      "\\(\\vec a\\cdot\\vec b=|\\vec a||\\vec b|\\cos\\theta\\)",
    ],
  },
];

function ConicSectionsLab() {
  type ConicType =
    | "circle"
    | "parabola"
    | "ellipse"
    | "hyperbola";

  type Orientation = "vertical" | "horizontal";

  type Point = {
    id: string;
    label: string;
    x: number;
    y: number;
    detail: string;
  };

  const [type, setType] =
    useState<ConicType>("circle");
  const [orientation, setOrientation] =
    useState<Orientation>("vertical");
  const [h, setH] = useState(0);
  const [k, setK] = useState(0);
  const [radius, setRadius] = useState(3);
  const [a, setA] = useState(5);
  const [b, setB] = useState(3);
  const [parameter, setParameter] = useState(1);
  const [hovered, setHovered] =
    useState<string | null>(null);

  const W = 760;
  const H = 540;
  const P = 52;
  const xMin = -10;
  const xMax = 10;
  const yMin = -7;
  const yMax = 7;

  const mapX = (x: number) =>
    P +
    ((x - xMin) / (xMax - xMin)) *
      (W - 2 * P);

  const mapY = (y: number) =>
    H -
    P -
    ((y - yMin) / (yMax - yMin)) *
      (H - 2 * P);

  const safeRadius = Math.max(0.5, radius);
  const safeA = Math.max(0.5, a);
  const safeB = Math.max(0.5, b);
  const safeP = Math.max(0.2, parameter);

  const geometry = useMemo(() => {
    const points: Point[] = [];
    let equation = "";
    let eccentricity = "";
    let focusText = "";
    let directrixText = "";
    let curvePath = "";
    let asymptotePaths: string[] = [];
    let vertexText = "";

    if (type === "circle") {
      equation = `(x-${fmt(h)})^2+(y-${fmt(k)})^2=${fmt(
        safeRadius * safeRadius
      )}`;
      points.push(
        {
          id: "centre",
          label: "Centre",
          x: h,
          y: k,
          detail: `(${fmt(h)}, ${fmt(k)})`,
        },
        {
          id: "right",
          label: "Right endpoint",
          x: h + safeRadius,
          y: k,
          detail: `(${fmt(h + safeRadius)}, ${fmt(k)})`,
        },
        {
          id: "top",
          label: "Top endpoint",
          x: h,
          y: k + safeRadius,
          detail: `(${fmt(h)}, ${fmt(k + safeRadius)})`,
        }
      );

      const r = safeRadius;
      const parts: string[] = [];
      for (let i = 0; i <= 180; i++) {
        const t = (i / 180) * Math.PI * 2;
        const x = h + r * Math.cos(t);
        const y = k + r * Math.sin(t);
        parts.push(
          `${i === 0 ? "M" : "L"} ${mapX(x).toFixed(
            2
          )} ${mapY(y).toFixed(2)}`
        );
      }
      curvePath = parts.join(" ");
      eccentricity = "e = 0";
      focusText = "The focus coincides with the centre.";
      directrixText = "No directrix.";
      vertexText = `Radius = ${fmt(r)}`;
    }

    if (type === "parabola") {
      const p = safeP;
      if (orientation === "vertical") {
        const sign = p >= 0 ? 1 : -1;
        equation = `(x-${fmt(h)})^2=${fmt(
          4 * p
        )}(y-${fmt(k)})`;
        const focusX = h;
        const focusY = k + p;
        const directrix = k - p;
        points.push(
          {
            id: "vertex",
            label: "Vertex",
            x: h,
            y: k,
            detail: `(${fmt(h)}, ${fmt(k)})`,
          },
          {
            id: "focus",
            label: "Focus",
            x: focusX,
            y: focusY,
            detail: `(${fmt(focusX)}, ${fmt(focusY)})`,
          }
        );
        focusText = `Focus = (${fmt(
          focusX
        )}, ${fmt(focusY)})`;
        directrixText = `Directrix: y = ${fmt(
          directrix
        )}`;
        vertexText = `Vertex = (${fmt(h)}, ${fmt(
          k
        )}) · opens ${sign > 0 ? "up" : "down"}`;

        const span = 7;
        const parts: string[] = [];
        for (let i = 0; i <= 220; i++) {
          const x =
            h - span +
            (i / 220) * 2 * span;
          const y =
            k +
            ((x - h) * (x - h)) /
              (4 * p);
          if (y >= yMin - 2 && y <= yMax + 2) {
            parts.push(
              `${parts.length === 0 ? "M" : "L"} ${mapX(
                x
              ).toFixed(2)} ${mapY(y).toFixed(2)}`
            );
          }
        }
        curvePath = parts.join(" ");
      } else {
        equation = `(y-${fmt(k)})^2=${fmt(
          4 * p
        )}(x-${fmt(h)})`;
        const focusX = h + p;
        const focusY = k;
        const directrix = h - p;
        points.push(
          {
            id: "vertex",
            label: "Vertex",
            x: h,
            y: k,
            detail: `(${fmt(h)}, ${fmt(k)})`,
          },
          {
            id: "focus",
            label: "Focus",
            x: focusX,
            y: focusY,
            detail: `(${fmt(focusX)}, ${fmt(focusY)})`,
          }
        );
        focusText = `Focus = (${fmt(
          focusX
        )}, ${fmt(focusY)})`;
        directrixText = `Directrix: x = ${fmt(
          directrix
        )}`;
        vertexText = `Vertex = (${fmt(h)}, ${fmt(
          k
        )}) · opens ${p > 0 ? "right" : "left"}`;

        const span = 7;
        const parts: string[] = [];
        for (let i = 0; i <= 220; i++) {
          const y =
            k - span +
            (i / 220) * 2 * span;
          const x =
            h +
            ((y - k) * (y - k)) /
              (4 * p);
          if (x >= xMin - 2 && x <= xMax + 2) {
            parts.push(
              `${parts.length === 0 ? "M" : "L"} ${mapX(
                x
              ).toFixed(2)} ${mapY(x === x ? y : y).toFixed(
                2
              )}`
            );
          }
        }
        curvePath = parts.join(" ");
      }
      eccentricity = "e = 1";
    }

    if (type === "ellipse") {
      const aa = safeA;
      const bb = safeB;
      const c = Math.sqrt(
        Math.max(0, aa * aa - bb * bb)
      );
      equation = `(x-${fmt(h)})^2/${fmt(
        aa * aa
      )}+(y-${fmt(k)})^2/${fmt(
        bb * bb
      )}=1`;

      points.push(
        {
          id: "centre",
          label: "Centre",
          x: h,
          y: k,
          detail: `(${fmt(h)}, ${fmt(k)})`,
        },
        {
          id: "vertex-major",
          label: "Major vertex",
          x: h + aa,
          y: k,
          detail: `(${fmt(h + aa)}, ${fmt(k)})`,
        },
        {
          id: "focus",
          label: c < 1e-10 ? "Focus / centre" : "Focus",
          x: h + c,
          y: k,
          detail: `(${fmt(h + c)}, ${fmt(k)})`,
        }
      );
      focusText =
        c < 1e-10
          ? "The two foci coincide with the centre."
          : `Foci: (${fmt(
              h - c
            )}, ${fmt(k)}) and (${fmt(
              h + c
            )}, ${fmt(k)})`;
      eccentricity = `e = ${fmt(c / aa)}`;
      directrixText =
        c < 1e-10
          ? "No finite directrices: this is a circle."
          : `Directrices: x = ${fmt(
              h - (aa * aa) / c
            )} and x = ${fmt(
              h + (aa * aa) / c
            )}`;

      const parts: string[] = [];
      for (let i = 0; i <= 220; i++) {
        const t = (i / 220) * Math.PI * 2;
        const x = h + aa * Math.cos(t);
        const y = k + bb * Math.sin(t);
        parts.push(
          `${i === 0 ? "M" : "L"} ${mapX(x).toFixed(
            2
          )} ${mapY(y).toFixed(2)}`
        );
      }
      curvePath = parts.join(" ");
      vertexText = `Semi-major axis a = ${fmt(
        aa
      )} · semi-minor axis b = ${fmt(bb)}`;
    }

    if (type === "hyperbola") {
      const aa = safeA;
      const bb = safeB;
      const c = Math.sqrt(
        aa * aa + bb * bb
      );

      if (orientation === "horizontal") {
        equation = `(x-${fmt(h)})^2/${fmt(
          aa * aa
        )}-(y-${fmt(k)})^2/${fmt(
          bb * bb
        )}=1`;
        points.push(
          {
            id: "centre",
            label: "Centre",
            x: h,
            y: k,
            detail: `(${fmt(h)}, ${fmt(k)})`,
          },
          {
            id: "vertex",
            label: "Vertex",
            x: h + aa,
            y: k,
            detail: `(${fmt(h + aa)}, ${fmt(k)})`,
          },
          {
            id: "focus",
            label: "Focus",
            x: h + c,
            y: k,
            detail: `(${fmt(h + c)}, ${fmt(k)})`,
          }
        );
        focusText = `Foci: (${fmt(
          h - c
        )}, ${fmt(k)}) and (${fmt(
          h + c
        )}, ${fmt(k)})`;
        directrixText = `Directrices: x = ${fmt(
          h - (aa * aa) / c
        )} and x = ${fmt(
          h + (aa * aa) / c
        )}`;
        eccentricity = `e = ${fmt(c / aa)}`;
        vertexText = `Vertices: (${fmt(
          h - aa
        )}, ${fmt(k)}) and (${fmt(
          h + aa
        )}, ${fmt(k)})`;

        const parts: string[] = [];
        for (const branch of [-1, 1]) {
          for (let i = 0; i <= 140; i++) {
            const y =
              k -
              6 +
              (i / 140) * 12;
            const inside =
              1 +
              ((y - k) * (y - k)) /
                (bb * bb);
            const x =
              h +
              branch *
                aa *
                Math.sqrt(inside);
            if (
              Number.isFinite(x) &&
              x >= xMin - 1 &&
              x <= xMax + 1
            ) {
              parts.push(
                `${i === 0 ? "M" : "L"} ${mapX(
                  x
                ).toFixed(2)} ${mapY(y).toFixed(
                  2
                )}`
              );
            }
          }
        }
        curvePath = parts.join(" ");
        asymptotePaths = [
          `M ${mapX(xMin)} ${mapY(
            k + (bb / aa) * (xMin - h)
          )} L ${mapX(xMax)} ${mapY(
            k + (bb / aa) * (xMax - h)
          )}`,
          `M ${mapX(xMin)} ${mapY(
            k - (bb / aa) * (xMin - h)
          )} L ${mapX(xMax)} ${mapY(
            k - (bb / aa) * (xMax - h)
          )}`,
        ];
      } else {
        equation = `(y-${fmt(k)})^2/${fmt(
          aa * aa
        )}-(x-${fmt(h)})^2/${fmt(
          bb * bb
        )}=1`;
        points.push(
          {
            id: "centre",
            label: "Centre",
            x: h,
            y: k,
            detail: `(${fmt(h)}, ${fmt(k)})`,
          },
          {
            id: "vertex",
            label: "Vertex",
            x: h,
            y: k + aa,
            detail: `(${fmt(h)}, ${fmt(k + aa)})`,
          },
          {
            id: "focus",
            label: "Focus",
            x: h,
            y: k + c,
            detail: `(${fmt(h)}, ${fmt(k + c)})`,
          }
        );
        focusText = `Foci: (${fmt(
          h
        )}, ${fmt(k - c)}) and (${fmt(
          h
        )}, ${fmt(k + c)})`;
        directrixText = `Directrices: y = ${fmt(
          k - (aa * aa) / c
        )} and y = ${fmt(
          k + (aa * aa) / c
        )}`;
        eccentricity = `e = ${fmt(c / aa)}`;
        vertexText = `Vertices: (${fmt(
          h
        )}, ${fmt(k - aa)}) and (${fmt(
          h
        )}, ${fmt(k + aa)})`;

        const parts: string[] = [];
        for (const branch of [-1, 1]) {
          for (let i = 0; i <= 140; i++) {
            const x =
              h -
              6 +
              (i / 140) * 12;
            const inside =
              1 +
              ((x - h) * (x - h)) /
                (bb * bb);
            const y =
              k +
              branch *
                aa *
                Math.sqrt(inside);
            if (
              Number.isFinite(y) &&
              y >= yMin - 1 &&
              y <= yMax + 1
            ) {
              parts.push(
                `${i === 0 ? "M" : "L"} ${mapX(
                  x
                ).toFixed(2)} ${mapY(y).toFixed(
                  2
                )}`
              );
            }
          }
        }
        curvePath = parts.join(" ");
        asymptotePaths = [
          `M ${mapX(
            h - 6
          )} ${mapY(
            k + (aa / bb) * (h - 6 - h)
          )} L ${mapX(
            h + 6
          )} ${mapY(
            k + (aa / bb) * (h + 6 - h)
          )}`,
          `M ${mapX(
            h - 6
          )} ${mapY(
            k - (aa / bb) * (h - 6 - h)
          )} L ${mapX(
            h + 6
          )} ${mapY(
            k - (aa / bb) * (h + 6 - h)
          )}`,
        ];
      }
    }

    return {
      equation,
      eccentricity,
      focusText,
      directrixText,
      curvePath,
      asymptotePaths,
      points,
      vertexText,
    };
  }, [
    type,
    orientation,
    h,
    k,
    safeRadius,
    safeA,
    safeB,
    safeP,
  ]);

  const xTicks = Array.from(
    { length: 11 },
    (_, i) => -10 + i * 2
  );
  const yTicks = Array.from(
    { length: 8 },
    (_, i) => -6 + i * 2
  );

  const currentPoint =
    geometry.points.find(
      (point) => point.id === hovered
    ) ?? null;

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">
            Conic Sections Explorer
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Change the geometric parameters and inspect the
            curve, foci, directrices and key points.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {(
            [
              ["circle", "Circle"],
              ["parabola", "Parabola"],
              ["ellipse", "Ellipse"],
              ["hyperbola", "Hyperbola"],
            ] as [ConicType, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                type === value
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {(type === "parabola" ||
          type === "hyperbola") && (
          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Orientation
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["vertical", "Vertical"],
                  ["horizontal", "Horizontal"],
                ] as [Orientation, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setOrientation(value)
                  }
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    orientation === value
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          {(
            [
              ["h", h, setH],
              ["k", k, setK],
            ] as [
              string,
              number,
              React.Dispatch<React.SetStateAction<number>>
            ][]
          ).map(([label, value, setter]) => (
              <label
                key={String(label)}
                className="text-xs text-slate-500"
              >
                Centre {label}
                <input
                  type="number"
                  value={Number(value)}
                  onChange={(e) =>
                    (
                      setter as React.Dispatch<
                        React.SetStateAction<number>
                      >
                    )(
                      Number(e.target.value)
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
              </label>
            )
          )}
        </div>

        {type === "circle" && (
          <NumberSlider
            label="Radius"
            value={safeRadius}
            min={0.5}
            max={8}
            step={0.5}
            onChange={setRadius}
          />
        )}

        {type === "ellipse" && (
          <div className="mt-4 space-y-3">
            <NumberSlider
              label="Semi-major axis a"
              value={safeA}
              min={1}
              max={8}
              step={0.5}
              onChange={setA}
            />
            <NumberSlider
              label="Semi-minor axis b"
              value={Math.min(safeB, safeA)}
              min={0.5}
              max={8}
              step={0.5}
              onChange={(value) =>
                setB(Math.min(value, safeA))
              }
            />
          </div>
        )}

        {type === "hyperbola" && (
          <div className="mt-4 space-y-3">
            <NumberSlider
              label="Semi-transverse axis a"
              value={safeA}
              min={1}
              max={6}
              step={0.5}
              onChange={setA}
            />
            <NumberSlider
              label="Semi-conjugate axis b"
              value={safeB}
              min={0.5}
              max={6}
              step={0.5}
              onChange={setB}
            />
          </div>
        )}

        {type === "parabola" && (
          <NumberSlider
            label="Parameter p"
            value={safeP}
            min={-5}
            max={5}
            step={0.5}
            onChange={setParameter}
          />
        )}

        <button
          type="button"
          onClick={() => {
            setH(0);
            setK(0);
            setRadius(3);
            setA(5);
            setB(3);
            setParameter(1);
            setOrientation("vertical");
            setType("circle");
            setHovered(null);
          }}
          className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
        >
          Reset explorer
        </button>
      </section>

      <section className="grid gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.15em] text-slate-500">
                Equation
              </div>
              <div className="mt-2 text-lg">
                <Latex
                  value={toLatex(
                    geometry.equation
                  )}
                />
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
              {geometry.eccentricity}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full touch-none"
              onMouseLeave={() =>
                setHovered(null)
              }
            >
              <rect
                width={W}
                height={H}
                fill="white"
              />

              {xTicks.map((x) => (
                <g key={`x-${x}`}>
                  <line
                    x1={mapX(x)}
                    x2={mapX(x)}
                    y1={P}
                    y2={H - P}
                    stroke="#e2e8f0"
                  />
                  {x !== 0 && (
                    <text
                      x={mapX(x)}
                      y={
                        mapY(0) < H - P
                          ? mapY(0) + 18
                          : H - P + 18
                      }
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748b"
                    >
                      {x}
                    </text>
                  )}
                </g>
              ))}

              {yTicks.map((y) => (
                <g key={`y-${y}`}>
                  <line
                    x1={P}
                    x2={W - P}
                    y1={mapY(y)}
                    y2={mapY(y)}
                    stroke="#e2e8f0"
                  />
                  {y !== 0 && (
                    <text
                      x={
                        mapX(0) > P
                          ? mapX(0) - 9
                          : P - 9
                      }
                      y={mapY(y) + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#64748b"
                    >
                      {y}
                    </text>
                  )}
                </g>
              ))}

              {xMin <= 0 &&
                xMax >= 0 && (
                  <line
                    x1={mapX(0)}
                    x2={mapX(0)}
                    y1={P}
                    y2={H - P}
                    stroke="#334155"
                    strokeWidth="1.7"
                  />
                )}

              {yMin <= 0 &&
                yMax >= 0 && (
                  <line
                    x1={P}
                    x2={W - P}
                    y1={mapY(0)}
                    y2={mapY(0)}
                    stroke="#334155"
                    strokeWidth="1.7"
                  />
                )}

              {geometry.asymptotePaths.map(
                (path, index) => (
                  <path
                    key={`asymptote-${index}`}
                    d={path}
                    fill="none"
                    stroke="#94a3b8"
                    strokeDasharray="7 6"
                    strokeWidth="1.5"
                  />
                )
              )}

              {type === "parabola" &&
                orientation === "vertical" && (
                  <line
                    x1={mapX(h)}
                    x2={mapX(h)}
                    y1={P}
                    y2={H - P}
                    stroke="#cbd5e1"
                    strokeDasharray="5 5"
                  />
                )}

              {type === "parabola" &&
                orientation === "horizontal" && (
                  <line
                    x1={P}
                    x2={W - P}
                    y1={mapY(k)}
                    y2={mapY(k)}
                    stroke="#cbd5e1"
                    strokeDasharray="5 5"
                  />
                )}

              <path
                d={geometry.curvePath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {geometry.points.map(
                (point) => (
                  <g
                    key={point.id}
                    onMouseEnter={() =>
                      setHovered(point.id)
                    }
                    className="cursor-pointer"
                  >
                    <circle
                      cx={mapX(point.x)}
                      cy={mapY(point.y)}
                      r={
                        hovered === point.id
                          ? 8
                          : 5
                      }
                      fill={
                        hovered === point.id
                          ? "#0f172a"
                          : "#dc2626"
                      }
                    />
                    <text
                      x={mapX(point.x) + 9}
                      y={mapY(point.y) - 9}
                      fontSize="11"
                      fontWeight="700"
                      fill="#334155"
                    >
                      {point.label}
                    </text>
                  </g>
                )
              )}

              {currentPoint && (
                <g pointerEvents="none">
                  <rect
                    x={Math.min(
                      mapX(currentPoint.x) + 12,
                      W - 190
                    )}
                    y={Math.max(
                      mapY(currentPoint.y) - 55,
                      10
                    )}
                    width="178"
                    height="46"
                    rx="10"
                    fill="white"
                    stroke="#cbd5e1"
                  />
                  <text
                    x={Math.min(
                      mapX(currentPoint.x) + 22,
                      W - 180
                    )}
                    y={Math.max(
                      mapY(currentPoint.y) - 36,
                      29
                    )}
                    fontSize="11"
                    fontWeight="700"
                    fill="#0f172a"
                  >
                    {currentPoint.label}
                  </text>
                  <text
                    x={Math.min(
                      mapX(currentPoint.x) + 22,
                      W - 180
                    )}
                    y={Math.max(
                      mapY(currentPoint.y) - 19,
                      46
                    )}
                    fontSize="10"
                    fill="#64748b"
                  >
                    {currentPoint.detail}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[.15em] text-slate-500">
              Key geometry
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              {geometry.vertexText}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[.15em] text-slate-500">
              Focus
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              {geometry.focusText}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[.15em] text-slate-500">
              Directrix / asymptotes
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              {geometry.directrixText}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function NumberSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-slate-500">
          {fmt(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) =>
          onChange(Number(e.target.value))
        }
        className="w-full"
      />
    </div>
  );
}

function ReferenceLab() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {referenceGroups.map(
        (group) => (
          <section
            key={group.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="font-semibold">
              {group.title}
            </h3>

            <div className="mt-4 space-y-3">
              {group.formulas.map(
                (formula) => (
                  <div
                    key={formula}
                    className="rounded-xl bg-slate-50 p-3"
                  >
                    <Latex
                      value={formula
                        .replace(
                          /^\\\(/,
                          ""
                        )
                        .replace(
                          /\\\)$/,
                          ""
                        )}
                    />
                  </div>
                )
              )}
            </div>
          </section>
        )
      )}
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

const tools: {
  id: Section;
  icon: string;
  title: string;
  description: string;
  classes: string;
}[] = [
  {
    id: "graph",
    icon: "📈",
    title: "Graphing Lab",
    description:
      "Plot functions, compare curves, inspect coordinates and explore transformations.",
    classes: "XI · XII",
  },
  {
    id: "trig",
    icon: "📐",
    title: "Trigonometry",
    description:
      "Explore the unit circle, degree and radian measure, and sine and cosine values.",
    classes: "XI",
  },
  {
    id: "algebra",
    icon: "🔢",
    title: "Algebra Lab",
    description:
      "Explore quadratic equations, discriminants and complex roots.",
    classes: "XI",
  },
  {
    id: "geometry",
    icon: "📍",
    title: "Coordinate Geometry",
    description:
      "Work with slopes, distances, equations of lines and coordinates.",
    classes: "XI · XII",
  },
  {
    id: "probability",
    icon: "🎲",
    title: "Probability Lab",
    description:
      "Run experiments and compare theoretical and experimental probability.",
    classes: "XI · XII",
  },
  {
    id: "statistics",
    icon: "📊",
    title: "Statistics Lab",
    description:
      "Analyse datasets using mean, median, variance and standard deviation.",
    classes: "XI",
  },
  {
    id: "calculus",
    icon: "∂",
    title: "Calculus Lab",
    description:
      "Explore limits, derivatives, tangent slopes and applications of derivatives visually.",
    classes: "XI · XII",
  },
  {
    id: "conics",
    icon: "◯",
    title: "Conic Explorer",
    description:
      "Explore circles, parabolas, ellipses and hyperbolas with their key geometric elements.",
    classes: "XI",
  },
  {
    id: "practice",
    icon: "🧠",
    title: "Practice",
    description:
      "Solve syllabus-aligned questions and check your reasoning.",
    classes: "XI · XII",
  },
  {
    id: "reference",
    icon: "📚",
    title: "Formula Book",
    description:
      "A compact mathematical reference organized by syllabus topic.",
    classes: "XI · XII",
  },
];

function Overview({
  classLevel,
  setClassLevel,
  open,
}: {
  classLevel: ClassLevel;
  setClassLevel: (
    value: ClassLevel
  ) => void;
  open: (section: Section) => void;
}) {
  const visible = tools.filter((tool) => tool.classes.includes(classLevel));

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.2em] text-slate-400">
              VGB Tools · Mathematics
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">
              Mathematics 041
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Graphs and calculators for Class XI and XII. Open a tool, change a value, and read the result.
            </p>
          </div>

          <div className="flex rounded-xl bg-white/10 p-1">
            {(["XI", "XII"] as ClassLevel[]).map(
              (level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setClassLevel(level)
                  }
                  className={`rounded-lg px-5 py-2 text-sm font-semibold ${
                    classLevel === level
                      ? "bg-white text-slate-950"
                      : "text-white"
                  }`}
                >
                  Class {level}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Mathematical Laboratory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tools first. Formula memorisation can
              wait its turn.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {visible.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() =>
                open(tool.id)
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">
                  {tool.icon}
                </span>

                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {tool.classes}
                </span>
              </div>

              <h3 className="mt-5 font-semibold">
                {tool.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {tool.description}
              </p>

              <div className="mt-4 text-xs font-semibold text-slate-700">
                Open tool →
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              Class {classLevel} syllabus
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              CBSE Mathematics 041 · 2026–27. This is the syllabus map; only the topics with labs are interactive.
            </p>
          </div>

          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {syllabus.length} major topics
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {syllabus.map(
            (topic, index) => (
              <div
                key={topic}
                className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-500">
                  {index + 1}
                </span>

                <span className="text-sm">
                  {topic}
                </span>
              </div>
            )
          )}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          [
            "55%",
            "Remember + Understand",
            "Build conceptual fluency.",
          ],
          [
            "25%",
            "Apply",
            "Use mathematical ideas in new situations.",
          ],
          [
            "20%",
            "Analyse + Evaluate + Create",
            "Reason, connect and construct.",
          ],
        ].map(
          ([percentage, title, description]) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="text-2xl font-semibold">
                {percentage}
              </div>

              <div className="mt-2 font-semibold">
                {title}
              </div>

              <div className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </div>
            </div>
          )
        )}
      </section>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MathematicsPage() {
  const [section, setSection] =
    useState<Section>("overview");

  const [classLevel, setClassLevel] =
    useState<ClassLevel>("XI");

  const renderSection = () => {
    switch (section) {
      case "graph":
        return <GraphingLab />;

      case "trig":
        return <TrigonometryLab />;

      case "algebra":
        return <AlgebraLab />;

      case "geometry":
        return <GeometryLab />;

      case "probability":
        return <ProbabilityLab />;

      case "statistics":
        return <StatisticsLab />;

      case "calculus":
        return <CalculusLab />;

      case "conics":
        return <ConicSectionsLab />;

      case "practice":
        return <PracticeLab />;

      case "reference":
        return <ReferenceLab />;

      default:
        return (
          <Overview
            classLevel={classLevel}
            setClassLevel={
              setClassLevel
            }
            open={setSection}
          />
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1550px] px-3 py-4 sm:px-5 lg:px-7">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() =>
              setSection("overview")
            }
            className="text-left"
          >
            <div className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">
              VGB Tools · Mathematics
            </div>

            <div className="mt-1 text-xl font-semibold tracking-tight">
              Mathematics 041
            </div>
          </button>

          <div className="flex flex-wrap gap-2">
            {[{ id: "overview", title: "Home" }, ...tools].map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setSection(tool.id as Section)}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${section === tool.id ? "bg-slate-950 text-white" : "border border-slate-200 bg-white"}`}
              >
                {tool.title === "Formula Book" ? "Formulas" : tool.title.replace(" Lab", "")}
              </button>
            ))}
          </div>
        </header>

        {section !== "overview" && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={() =>
                setSection("overview")
              }
              className="text-slate-500 hover:text-slate-950"
            >
              Mathematics
            </button>

            <span className="text-slate-300">
              /
            </span>

            <span className="font-medium">
              {
                tools.find(
                  (tool) =>
                    tool.id ===
                    section
                )?.title
              }
            </span>
          </div>
        )}

        {renderSection()}
      </div>
    </main>
  );
}


function GraphingLab() {
  const [mode, setMode] =
    useState<
      "Graph" | "Calculate" | "Table"
    >("Graph");

  const [expressions, setExpressions] =
    useState<Expr[]>(
      cloneExpressions(
        DEFAULT_EXPRESSIONS
      )
    );

  const [activeId, setActiveId] =
    useState(1);

  const [viewport, setViewport] =
    useState<Viewport>(
      DEFAULT_VIEWPORT
    );

  const [scientificOn, setScientificOn] =
    useState(false);

  const [calc, setCalc] =
    useState("");

  const [answer, setAnswer] =
    useState("");

  const [start, setStart] =
    useState(-5);

  const [step, setStep] =
    useState(1);

  const [hydrated, setHydrated] =
    useState(false);

  const [undoStack, setUndoStack] =
    useState<HistoryState[]>([]);

  const [redoStack, setRedoStack] =
    useState<HistoryState[]>([]);

  const active =
    expressions.find(
      (e) => e.id === activeId
    ) ??
    expressions[0];

  const historySnapshot =
    useCallback(
      (): HistoryState => ({
        expressions:
          cloneExpressions(
            expressions
          ),
        activeId,
        viewport: {
          ...viewport,
        },
        calc,
        answer,
      }),
      [
        expressions,
        activeId,
        viewport,
        calc,
        answer,
      ]
    );

  const restore =
    useCallback(
      (state: HistoryState) => {
        setExpressions(
          cloneExpressions(
            state.expressions
          )
        );

        setActiveId(
          state.activeId
        );

        setViewport({
          ...state.viewport,
        });

        setCalc(state.calc);
        setAnswer(state.answer);
      },
      []
    );

  const commit = useCallback(
    (mutator: () => void) => {
      setUndoStack(
        (stack) => [
          ...stack.slice(-49),
          historySnapshot(),
        ]
      );

      setRedoStack([]);

      mutator();
    },
    [historySnapshot]
  );

  const updateActive =
    useCallback(
      (raw: string) => {
        commit(() => {
          setExpressions(
            (items) =>
              items.map((e) =>
                e.id === activeId
                  ? {
                      ...e,
                      raw,
                    }
                  : e
              )
          );
        });
      },
      [activeId, commit]
    );

  const addExpression =
    useCallback(() => {
      const id = makeId();

      commit(() => {
        setExpressions(
          (items) => [
            ...items,
            {
              id,
              raw: "",
              visible: true,
              color:
                COLORS[
                  items.length %
                    COLORS.length
                ],
            },
          ]
        );

        setActiveId(id);
      });
    }, [commit]);

  const duplicateExpression =
    useCallback(
      (expression: Expr) => {
        const id = makeId();

        commit(() => {
          setExpressions(
            (items) => {
              const index =
                items.findIndex(
                  (item) =>
                    item.id ===
                    expression.id
                );

              const copy = {
                ...expression,
                id,
                color:
                  COLORS[
                    (index + 1) %
                      COLORS.length
                  ],
              };

              return [
                ...items.slice(
                  0,
                  index + 1
                ),
                copy,
                ...items.slice(
                  index + 1
                ),
              ];
            }
          );

          setActiveId(id);
        });
      },
      [commit]
    );

  const deleteExpression =
    useCallback(
      (id: number) => {
        commit(() => {
          setExpressions(
            (items) => {
              if (
                items.length === 1
              ) {
                return [
                  {
                    ...items[0],
                    raw: "",
                  },
                ];
              }

              const index =
                items.findIndex(
                  (item) =>
                    item.id === id
                );

              const next =
                items.filter(
                  (item) =>
                    item.id !== id
                );

              if (
                id === activeId &&
                next.length
              ) {
                setActiveId(
                  next[
                    Math.max(
                      0,
                      index - 1
                    )
                  ].id
                );
              }

              return next;
            }
          );
        });
      },
      [activeId, commit]
    );

  const toggleVisibility =
    useCallback(
      (id: number) => {
        commit(() => {
          setExpressions(
            (items) =>
              items.map((e) =>
                e.id === id
                  ? {
                      ...e,
                      visible:
                        !e.visible,
                    }
                  : e
              )
          );
        });
      },
      [commit]
    );

  const moveExpression =
    useCallback(
      (
        fromId: number,
        toId: number
      ) => {
        if (
          fromId === toId
        ) {
          return;
        }

        commit(() => {
          setExpressions(
            (items) => {
              const from =
                items.findIndex(
                  (e) =>
                    e.id === fromId
                );

              const to =
                items.findIndex(
                  (e) =>
                    e.id === toId
                );

              if (
                from < 0 ||
                to < 0
              ) {
                return items;
              }

              const next = [
                ...items,
              ];

              const [
                moved,
              ] = next.splice(
                from,
                1
              );

              next.splice(
                to,
                0,
                moved
              );

              return next;
            }
          );
        });
      },
      [commit]
    );

  const undo =
    useCallback(() => {
      setUndoStack(
        (stack) => {
          if (!stack.length) {
            return stack;
          }

          const previous =
            stack[
              stack.length - 1
            ];

          setRedoStack(
            (redo) => [
              ...redo,
              historySnapshot(),
            ]
          );

          restore(previous);

          return stack.slice(
            0,
            -1
          );
        }
      );
    }, [
      historySnapshot,
      restore,
    ]);

  const redo =
    useCallback(() => {
      setRedoStack(
        (stack) => {
          if (!stack.length) {
            return stack;
          }

          const next =
            stack[
              stack.length - 1
            ];

          setUndoStack(
            (undoItems) => [
              ...undoItems,
              historySnapshot(),
            ]
          );

          restore(next);

          return stack.slice(
            0,
            -1
          );
        }
      );
    }, [
      historySnapshot,
      restore,
    ]);

  /*
   * Load the previous calculator workspace.
   */
  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (saved) {
        const parsed =
          JSON.parse(
            saved
          ) as Workspace;

        if (
          parsed &&
          Array.isArray(
            parsed.expressions
          )
        ) {
          setExpressions(
            parsed.expressions
          );

          setActiveId(
            parsed.activeId
          );

          setViewport(
            parsed.viewport ??
              DEFAULT_VIEWPORT
          );

          setScientificOn(
            Boolean(
              parsed.scientificOn
            )
          );

          setMode(
            parsed.mode ??
              "Graph"
          );

          setCalc(
            parsed.calc ?? ""
          );

          setAnswer(
            parsed.answer ?? ""
          );

          setStart(
            typeof parsed.start ===
              "number"
              ? parsed.start
              : -5
          );

          setStep(
            typeof parsed.step ===
              "number"
              ? parsed.step
              : 1
          );
        }
      }
    } catch {
      /*
       * Corrupt local storage should never
       * prevent the calculator from loading.
       */
    }

    setHydrated(true);
  }, []);

  /*
   * Persist workspace after hydration.
   */
  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const workspace: Workspace = {
      expressions:
        cloneExpressions(
          expressions
        ),
      activeId,
      viewport,
      scientificOn,
      mode,
      calc,
      answer,
      start,
      step,
    };

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          workspace
        )
      );
    } catch {
      /*
       * Storage can be unavailable in
       * restricted browser contexts.
       */
    }
  }, [
    hydrated,
    expressions,
    activeId,
    viewport,
    scientificOn,
    mode,
    calc,
    answer,
    start,
    step,
  ]);

  const calculate =
    useCallback(() => {
      if (!calc.trim()) {
        return;
      }

      try {
        const normalized =
          normalizeExpression(
            calc
          );

        const result =
          math.evaluate(
            normalized
          );

        if (
          typeof result ===
            "number" &&
          Number.isFinite(result)
        ) {
          setAnswer(
            fmt(result)
          );
        } else {
          setAnswer(
            String(result)
          );
        }
      } catch {
        setAnswer(
          "Invalid expression"
        );
      }
    }, [calc]);

  const press =
    useCallback(
      (key: string) => {
        if (key === "AC") {
          setCalc("");
          setAnswer("");
          return;
        }

        if (key === "DEL") {
          setCalc(
            (value) =>
              value.slice(
                0,
                -1
              )
          );
          return;
        }

        if (key === "±") {
          setCalc(
            (value) =>
              value.startsWith(
                "-"
              )
                ? value.slice(1)
                : `-(${value})`
          );
          return;
        }

        const replacements: Record<
          string,
          string
        > = {
          "÷": "/",
          "×": "*",
          "−": "-",
          "π": "pi",
          "x²": "^2",
          "xʸ": "^",
          "n!": "!",
          "√": "sqrt(",
          "1/x": "1/(",
          sin: "sin(",
          cos: "cos(",
          tan: "tan(",
          asin: "asin(",
          acos: "acos(",
          atan: "atan(",
          log: "log(",
          ln: "ln(",
          abs: "abs(",
        };

        setCalc(
          (value) =>
            value +
            (replacements[
              key
            ] ?? key)
        );
      },
      []
    );

  /*
   * Table data for the selected expression.
   */
  const rows = useMemo(() => {
    if (!active) {
      return [];
    }

    return Array.from(
      {
        length: 21,
      },
      (_, i) => {
        const x =
          start + i * step;

        return {
          x,
          y: valueAt(
            active.raw,
            x
          ),
        };
      }
    );
  }, [
    active,
    start,
    step,
  ]);

  /*
   * Keyboard support:
   *
   * Ctrl/Cmd + Z      Undo
   * Ctrl/Cmd + Shift + Z  Redo
   * Enter             Calculate
   * Escape            Clear active expression
   */
  useEffect(() => {
    const onKey = (
      e: KeyboardEvent
    ) => {
      if (
        e.ctrlKey ||
        e.metaKey
      ) {
        if (
          e.key.toLowerCase() ===
          "z"
        ) {
          e.preventDefault();

          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }

          return;
        }
      }

      const target =
        e.target as HTMLElement | null;

      const isTyping =
        target?.tagName ===
          "INPUT" ||
        target?.tagName ===
          "TEXTAREA";

      if (isTyping) {
        if (
          e.key === "Enter" &&
          mode ===
            "Calculate"
        ) {
          calculate();
        }

        return;
      }

      if (
        mode === "Graph" &&
        active
      ) {
        if (
          /^[0-9.+\-*/^()]$/.test(
            e.key
          )
        ) {
          updateActive(
            active.raw +
              e.key
          );
          return;
        }

        if (
          e.key ===
          "Backspace"
        ) {
          updateActive(
            active.raw.slice(
              0,
              -1
            )
          );
          return;
        }

        if (
          e.key ===
          "Escape"
        ) {
          updateActive("");
        }
      }
    };

    window.addEventListener(
      "keydown",
      onKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKey
      );
  }, [
    active,
    calculate,
    mode,
    redo,
    undo,
    updateActive,
  ]);

  return (
    <div className="w-full text-slate-950">
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-5 lg:px-7">
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">
              Mathematics 041 · Interactive Lab
            </div>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Graphing Lab
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                "Graph",
                "Calculate",
                "Table",
              ] as const
            ).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() =>
                  setMode(m)
                }
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
                setScientificOn(
                  (v) => !v
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {scientificOn
                ? "Scientific on"
                : "Scientific"}
            </button>

            <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                type="button"
                onClick={undo}
                disabled={
                  !undoStack.length
                }
                className="px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Undo"
                title="Undo (Ctrl/Cmd + Z)"
              >
                ↶
              </button>

              <button
                type="button"
                onClick={redo}
                disabled={
                  !redoStack.length
                }
                className="border-l border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Redo"
                title="Redo (Ctrl/Cmd + Shift + Z)"
              >
                ↷
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-3 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">
                  Expressions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Add, reorder, hide, and edit mathematical expressions.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  addExpression
                }
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold hover:bg-slate-200"
              >
                + Add
              </button>
            </div>

            <div className="max-h-[600px] space-y-2 overflow-auto p-3">
              {expressions.map(
                (e, i) => (
                  <ExpressionRow
                    key={e.id}
                    expression={e}
                    index={i}
                    active={
                      activeId ===
                      e.id
                    }
                    onActivate={() =>
                      setActiveId(
                        e.id
                      )
                    }
                    onChange={
                      updateActive
                    }
                    onToggle={() =>
                      toggleVisibility(
                        e.id
                      )
                    }
                    onDelete={() =>
                      deleteExpression(
                        e.id
                      )
                    }
                    onDuplicate={() =>
                      duplicateExpression(
                        e
                      )
                    }
                    onMove={
                      moveExpression
                    }
                  />
                )
              )}
            </div>
          </section>

          <section className="min-w-0">
            {mode ===
              "Graph" && (
              <Graph
                expressions={
                  expressions
                }
                viewport={
                  viewport
                }
                setViewport={
                  setViewport
                }
              />
            )}

            {mode ===
              "Table" && (
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
                        value={
                          start
                        }
                        onChange={(
                          e
                        ) =>
                          setStart(
                            Number(
                              e.target
                                .value
                            )
                          )
                        }
                        className="mt-1 block w-20 rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-900"
                      />
                    </label>

                    <label className="text-xs text-slate-500">
                      Step
                      <input
                        type="number"
                        value={
                          step
                        }
                        onChange={(
                          e
                        ) =>
                          setStep(
                            Number(
                              e.target
                                .value
                            ) || 1
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
                      {rows.map(
                        (r) => (
                          <tr
                            key={
                              r.x
                            }
                            className="border-t border-slate-100"
                          >
                            <td className="px-4 py-3 font-mono">
                              {fmt(
                                r.x
                              )}
                            </td>

                            <td className="px-4 py-3 font-mono">
                              {Number.isFinite(
                                r.y
                              )
                                ? fmt(
                                    r.y
                                  )
                                : "undefined"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {mode ===
              "Calculate" && (
              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="rounded-2xl bg-slate-950 p-5 text-right text-white">
                    <div className="min-h-10 overflow-x-auto text-sm text-slate-400">
                      {calc ? (
                        <Latex
                          value={toLatex(
                            calc
                          )}
                        />
                      ) : (
                        "\\,"
                      )}
                    </div>

                    <div className="mt-3 min-h-12 text-3xl font-semibold">
                      {answer ||
                        "0"}
                    </div>
                  </div>

                  {scientificOn && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {scientific
                        .flat()
                        .map(
                          (k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() =>
                                press(
                                  k
                                )
                              }
                              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold hover:bg-slate-100"
                            >
                              {k}
                            </button>
                          )
                        )}
                    </div>
                  )}

                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {basic
                      .flat()
                      .map(
                        (k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() =>
                              press(
                                k
                              )
                            }
                            className="min-h-14 rounded-xl border border-slate-200 bg-white text-lg font-semibold hover:bg-slate-50"
                          >
                            {k}
                          </button>
                        )
                      )}

                    <button
                      type="button"
                      onClick={() =>
                        press(
                          "AC"
                        )
                      }
                      className="min-h-14 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold"
                    >
                      AC
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        press(
                          "DEL"
                        )
                      }
                      className="min-h-14 rounded-xl border border-slate-200 bg-slate-100 text-sm font-bold"
                    >
                      DEL
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        press(
                          "±"
                        )
                      }
                      className="min-h-14 rounded-xl border border-slate-200 bg-slate-100 text-lg font-semibold"
                    >
                      ±
                    </button>

                    <button
                      type="button"
                      onClick={
                        calculate
                      }
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
                    Mathematical notation is rendered while the calculator keeps a machine-readable expression underneath.
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
                      value={
                        "\\sqrt{x^2+1}"
                      }
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
    </div>
  );
}


function ExpressionRow({
  expression,
  index,
  active,
  onActivate,
  onChange,
  onToggle,
  onDelete,
  onDuplicate,
  onMove,
}: {
  expression: Expr;
  index: number;
  active: boolean;
  onActivate: () => void;
  onChange: (raw: string) => void;
  onToggle: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (
    fromId: number,
    toId: number
  ) => void;
}) {
  const [dragging, setDragging] =
    useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        setDragging(true);

        e.dataTransfer.effectAllowed =
          "move";

        e.dataTransfer.setData(
          "text/plain",
          String(
            expression.id
          )
        );
      }}
      onDragEnd={() =>
        setDragging(false)
      }
      onDragOver={(e) =>
        e.preventDefault()
      }
      onDrop={(e) => {
        e.preventDefault();

        const fromId = Number(
          e.dataTransfer.getData(
            "text/plain"
          )
        );

        onMove(
          fromId,
          expression.id
        );
      }}
      onClick={onActivate}
      className={`rounded-xl border p-2.5 transition ${
        active
          ? "border-slate-400 bg-slate-50"
          : "border-slate-200 bg-white"
      } ${
        dragging
          ? "opacity-45"
          : ""
      }`}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="h-3 w-3 shrink-0 rounded-full border-2"
          style={{
            borderColor:
              expression.color,
            background:
              expression.visible
                ? expression.color
                : "transparent",
          }}
          aria-label={
            expression.visible
              ? "Hide expression"
              : "Show expression"
          }
          title={
            expression.visible
              ? "Hide expression"
              : "Show expression"
          }
        />

        <span
          className="cursor-grab select-none text-slate-300"
          title="Drag to reorder"
          aria-label="Drag to reorder"
        >
          ⋮⋮
        </span>

        <span className="text-[11px] font-semibold text-slate-400">
          {index + 1}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="rounded-md px-1.5 py-1 text-[11px] text-slate-400 hover:bg-white hover:text-slate-700"
            title="Duplicate expression"
          >
            Copy
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-md px-1.5 py-1 text-[11px] text-slate-400 hover:bg-white hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <input
        value={
          expression.raw
        }
        onFocus={onActivate}
        onClick={(e) =>
          e.stopPropagation()
        }
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder="x^2 - 4x + 3"
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
        aria-label={`Expression ${
          index + 1
        }`}
      />

      <div className="mt-2 min-h-7 overflow-x-auto px-1">
        {expression.raw ? (
          <Latex
            value={toLatex(
              expression.raw
            )}
          />
        ) : (
          <span className="text-xs text-slate-400">
            Mathematical preview
          </span>
        )}
      </div>
    </div>
  );
}
