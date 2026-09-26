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
  className: "XI" | "XII";
  unit: string;
  description: string;
  xLabel: string;
  yLabel: string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  curves: (controls: Record<string, number>) => Curve[];
  controls: {
    key: string;
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
  }[];
  interpretation: string[];
};

const curveColors = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
];

const presets: Preset[] = [
  {
    id: "demand-supply",
    title: "Demand, Supply & Market Equilibrium",
    className: "XI",
    unit: "Price Determination",
    description:
      "Move demand and supply to see equilibrium price and quantity change.",
    xLabel: "Quantity",
    yLabel: "Price",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      {
        key: "dShift",
        label: "Demand shift",
        min: -25,
        max: 25,
        step: 1,
        value: 0,
      },
      {
        key: "sShift",
        label: "Supply shift",
        min: -25,
        max: 25,
        step: 1,
        value: 0,
      },
    ],
    curves: (c) => [
      {
        id: "d",
        label: "Demand",
        color: curveColors[0],
        fn: (x) => 90 - 0.75 * x + c.dShift,
      },
      {
        id: "s",
        label: "Supply",
        color: curveColors[1],
        fn: (x) => 10 + 0.65 * x + c.sShift,
      },
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
    description:
      "Set a maximum legal price and observe the resulting shortage.",
    xLabel: "Quantity",
    yLabel: "Price",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      {
        key: "ceiling",
        label: "Maximum price",
        min: 10,
        max: 80,
        step: 1,
        value: 45,
      },
    ],
    curves: (c) => [
      {
        id: "d",
        label: "Demand",
        color: curveColors[0],
        fn: (x) => 90 - 0.75 * x,
      },
      {
        id: "s",
        label: "Supply",
        color: curveColors[1],
        fn: (x) => 10 + 0.65 * x,
      },
      {
        id: "ceiling",
        label: "Price ceiling",
        color: curveColors[2],
        fn: () => c.ceiling,
        dashed: true,
      },
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
    description:
      "Set a minimum legal price and observe the resulting surplus.",
    xLabel: "Quantity",
    yLabel: "Price",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      {
        key: "floor",
        label: "Minimum price",
        min: 20,
        max: 90,
        step: 1,
        value: 65,
      },
    ],
    curves: (c) => [
      {
        id: "d",
        label: "Demand",
        color: curveColors[0],
        fn: (x) => 90 - 0.75 * x,
      },
      {
        id: "s",
        label: "Supply",
        color: curveColors[1],
        fn: (x) => 10 + 0.65 * x,
      },
      {
        id: "floor",
        label: "Price floor",
        color: curveColors[2],
        fn: () => c.floor,
        dashed: true,
      },
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
    description:
      "Explore scarcity, efficiency, opportunity cost and unattainable combinations.",
    xLabel: "Good X",
    yLabel: "Good Y",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      {
        key: "curvature",
        label: "Curvature",
        min: 0.55,
        max: 1.8,
        step: 0.05,
        value: 1,
      },
    ],
    curves: (c) => [
      {
        id: "ppc",
        label: "PPC",
        color: curveColors[0],
        fn: (x) =>
          100 * Math.pow(Math.max(0, 1 - x / 100), c.curvature),
      },
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
    description:
      "Change income and relative prices to see the budget constraint move.",
    xLabel: "Good X",
    yLabel: "Good Y",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      {
        key: "income",
        label: "Income",
        min: 60,
        max: 160,
        step: 1,
        value: 100,
      },
      {
        key: "px",
        label: "Price of X",
        min: 0.6,
        max: 2,
        step: 0.05,
        value: 1,
      },
      {
        key: "py",
        label: "Price of Y",
        min: 0.6,
        max: 2,
        step: 0.05,
        value: 1,
      },
    ],
    curves: (c) => [
      {
        id: "budget",
        label: "Budget line",
        color: curveColors[0],
        fn: (x) => (c.income - c.px * x) / c.py,
      },
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
    description:
      "Explore a family of indifference curves and diminishing marginal rate of substitution.",
    xLabel: "Good X",
    yLabel: "Good Y",
    xMin: 1,
    xMax: 100,
    yMin: 1,
    yMax: 100,
    controls: [
      {
        key: "utility",
        label: "Utility level",
        min: 10,
        max: 80,
        step: 1,
        value: 35,
      },
    ],
    curves: (c) => [
      {
        id: "ic",
        label: "Indifference curve",
        color: curveColors[2],
        fn: (x) => Math.pow(c.utility / Math.pow(x, 0.5), 2),
      },
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
    description:
      "See the relationship between a budget line and an indifference curve.",
    xLabel: "Good X",
    yLabel: "Good Y",
    xMin: 1,
    xMax: 100,
    yMin: 1,
    yMax: 100,
    controls: [
      {
        key: "income",
        label: "Income",
        min: 70,
        max: 150,
        step: 1,
        value: 100,
      },
      {
        key: "px",
        label: "Price of X",
        min: 0.8,
        max: 1.6,
        step: 0.05,
        value: 1,
      },
      {
        key: "py",
        label: "Price of Y",
        min: 0.8,
        max: 1.6,
        step: 0.05,
        value: 1,
      },
    ],
    curves: (c) => [
      {
        id: "budget",
        label: "Budget line",
        color: curveColors[0],
        fn: (x) => (c.income - c.px * x) / c.py,
      },
      {
        id: "ic",
        label: "Indifference curve",
        color: curveColors[2],
        fn: (x) =>
          Math.max(1, 55 / Math.sqrt(Math.max(x, 1))) ** 2,
      },
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
    description:
      "Visualise the relationship between total, average and marginal product.",
    xLabel: "Variable input",
    yLabel: "Product",
    xMin: 0,
    xMax: 12,
    yMin: 0,
    yMax: 100,
    controls: [
      {
        key: "productivity",
        label: "Productivity",
        min: 0.7,
        max: 1.5,
        step: 0.05,
        value: 1,
      },
    ],
    curves: (c) => [
      {
        id: "tp",
        label: "TP",
        color: curveColors[0],
        fn: (x) => c.productivity * (24 * x - 1.6 * x * x),
      },
      {
        id: "ap",
        label: "AP",
        color: curveColors[1],
        fn: (x) =>
          x <= 0 ? 0 : c.productivity * (24 - 1.6 * x),
      },
      {
        id: "mp",
        label: "MP",
        color: curveColors[2],
        fn: (x) => c.productivity * (24 - 3.2 * x),
      },
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
    description:
      "Compare AFC, AVC, AC and MC as output changes.",
    xLabel: "Output",
    yLabel: "Cost",
    xMin: 1,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      {
        key: "fixed",
        label: "Fixed cost",
        min: 10,
        max: 50,
        step: 1,
        value: 25,
      },
    ],
    curves: (c) => [
      {
        id: "afc",
        label: "AFC",
        color: curveColors[0],
        fn: (x) => (c.fixed / x) * 100,
      },
      {
        id: "avc",
        label: "AVC",
        color: curveColors[1],
        fn: (x) => 18 + 0.008 * (x - 45) ** 2,
      },
      {
        id: "ac",
        label: "AC",
        color: curveColors[2],
        fn: (x) =>
          (c.fixed / x) * 100 +
          18 +
          0.008 * (x - 45) ** 2,
      },
      {
        id: "mc",
        label: "MC",
        color: curveColors[3],
        fn: (x) => 12 + 0.018 * (x - 30) ** 2,
      },
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
    description:
      "See why AR and MR coincide with price for a perfectly competitive firm.",
    xLabel: "Output",
    yLabel: "Revenue",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      {
        key: "price",
        label: "Price",
        min: 20,
        max: 80,
        step: 1,
        value: 50,
      },
    ],
    curves: (c) => [
      {
        id: "tr",
        label: "TR",
        color: curveColors[0],
        fn: (x) => Math.min(100, (c.price * x) / 80),
      },
      {
        id: "ar",
        label: "AR",
        color: curveColors[1],
        fn: () => c.price,
      },
      {
        id: "mr",
        label: "MR",
        color: curveColors[2],
        fn: () => c.price,
      },
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
    description:
      "Explore consumption, autonomous consumption and saving as income changes.",
    xLabel: "Income",
    yLabel: "Consumption / Saving",
    xMin: 0,
    xMax: 100,
    yMin: -40,
    yMax: 100,
    controls: [
      {
        key: "autonomous",
        label: "Autonomous consumption",
        min: 5,
        max: 30,
        step: 1,
        value: 15,
      },
      {
        key: "mpc",
        label: "MPC",
        min: 0.5,
        max: 0.9,
        step: 0.01,
        value: 0.75,
      },
    ],
    curves: (c) => [
      {
        id: "c",
        label: "Consumption",
        color: curveColors[0],
        fn: (x) => c.autonomous + c.mpc * x,
      },
      {
        id: "s",
        label: "Saving",
        color: curveColors[1],
        fn: (x) =>
          x - (c.autonomous + c.mpc * x),
      },
      {
        id: "45",
        label: "45° line",
        color: "#64748b",
        fn: (x) => x,
        dashed: true,
      },
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
    description:
      "Change autonomous expenditure and MPC to see equilibrium income move.",
    xLabel: "Income",
    yLabel: "Aggregate expenditure",
    xMin: 0,
    xMax: 120,
    yMin: 0,
    yMax: 120,
    controls: [
      {
        key: "autonomous",
        label: "Autonomous expenditure",
        min: 10,
        max: 50,
        step: 1,
        value: 25,
      },
      {
        key: "mpc",
        label: "MPC",
        min: 0.5,
        max: 0.9,
        step: 0.01,
        value: 0.75,
      },
    ],
    curves: (c) => [
      {
        id: "ad",
        label: "AD / AE",
        color: curveColors[0],
        fn: (x) => c.autonomous + c.mpc * x,
      },
      {
        id: "45",
        label: "45° line",
        color: "#64748b",
        fn: (x) => x,
        dashed: true,
      },
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
    description:
      "Explore the relationship between MPC and the investment multiplier.",
    xLabel: "MPC",
    yLabel: "Multiplier",
    xMin: 0.4,
    xMax: 0.95,
    yMin: 0,
    yMax: 25,
    controls: [
      {
        key: "investment",
        label: "Investment change",
        min: 5,
        max: 30,
        step: 1,
        value: 10,
      },
    ],
    curves: (c) => [
      {
        id: "k",
        label: "Multiplier",
        color: curveColors[0],
        fn: (x) => 1 / (1 - x),
      },
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
    description:
      "Explore equilibrium in a standard liquidity-preference diagram.",
    xLabel: "Quantity of Money",
    yLabel: "Interest rate",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      {
        key: "supply",
        label: "Money supply",
        min: 25,
        max: 85,
        step: 1,
        value: 55,
      },
    ],
    curves: (c) => [
      {
        id: "md",
        label: "Money demand",
        color: curveColors[0],
        fn: (x) => 92 - 0.85 * x,
      },
      {
        id: "ms",
        label: "Money supply",
        color: curveColors[1],
        fn: () => c.supply,
        dashed: true,
      },
    ],
    interpretation: [
      "Money demand is downward sloping with respect to the interest rate.",
      "With interest rate on the vertical axis and quantity of money on the horizontal axis, a fixed money supply is shown as a vertical line.",
      "The intersection determines the equilibrium combination.",
    ],
  },

  {
    id: "forex",
    title: "Foreign Exchange Demand & Supply",
    className: "XII",
    unit: "Balance of Payments",
    description:
      "Explore exchange-rate determination using demand and supply of foreign currency.",
    xLabel: "Quantity of Foreign Exchange",
    yLabel: "Exchange rate",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      {
        key: "dShift",
        label: "Demand shift",
        min: -20,
        max: 20,
        step: 1,
        value: 0,
      },
      {
        key: "sShift",
        label: "Supply shift",
        min: -20,
        max: 20,
        step: 1,
        value: 0,
      },
    ],
    curves: (c) => [
      {
        id: "d",
        label: "Demand for FX",
        color: curveColors[0],
        fn: (x) => 88 - 0.7 * x + c.dShift,
      },
      {
        id: "s",
        label: "Supply of FX",
        color: curveColors[1],
        fn: (x) => 12 + 0.65 * x + c.sShift,
      },
    ],
    interpretation: [
      "The exchange rate is determined by demand and supply in a flexible-rate model.",
      "An increase in demand for foreign currency shifts the demand curve rightward.",
      "An increase in supply of foreign currency shifts the supply curve rightward.",
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Generic economics graph helpers                                            */
/* -------------------------------------------------------------------------- */

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
  p: Preset
): Point[] {
  const pts: Point[] = [];

  for (let i = 0; i <= 700; i++) {
    const x =
      p.xMin +
      (i / 700) *
        (p.xMax - p.xMin);

    const y = curve.fn(x);

    if (
      !Number.isFinite(y) ||
      y <
        p.yMin -
          (p.yMax - p.yMin) ||
      y >
        p.yMax +
          (p.yMax - p.yMin)
    ) {
      pts.push({ x: NaN, y: NaN });
    } else {
      pts.push({ x, y });
    }
  }

  return pts;
}

function intersections(
  curves: Curve[],
  p: Preset
): Point[] {
  const out: Point[] = [];

  for (let a = 0; a < curves.length; a++) {
    for (let b = a + 1; b < curves.length; b++) {
      let prevX = p.xMin;
      let prevD =
        curves[a].fn(prevX) -
        curves[b].fn(prevX);

      for (let i = 1; i <= 500; i++) {
        const x =
          p.xMin +
          (i / 500) *
            (p.xMax - p.xMin);

        const d =
          curves[a].fn(x) -
          curves[b].fn(x);

        if (
          Number.isFinite(prevD) &&
          Number.isFinite(d) &&
          prevD * d <= 0
        ) {
          const t =
            Math.abs(prevD) /
            (Math.abs(prevD) +
              Math.abs(d) ||
              1);

          const ix =
            prevX +
            (x - prevX) * t;

          const y = curves[a].fn(ix);

          if (
            Number.isFinite(y) &&
            y >= p.yMin &&
            y <= p.yMax
          ) {
            if (
              !out.some(
                (q) =>
                  Math.abs(q.x - ix) <
                    (p.xMax -
                      p.xMin) /
                      80 &&
                  Math.abs(q.y - y) <
                    (p.yMax -
                      p.yMin) /
                      80
              )
            ) {
              out.push({
                x: ix,
                y,
              });
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

/* -------------------------------------------------------------------------- */
/* Economics graph                                                            */
/* -------------------------------------------------------------------------- */

function EconomicsGraph({
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
    () => preset.curves(controls),
    [preset, controls]
  );

  const xs = ticks(
    view.xMin,
    view.xMax
  );

  const ys = ticks(
    view.yMin,
    view.yMax
  );

  const points = useMemo(
    () => intersections(curves, preset),
    [curves, preset]
  );

  const pathFor = (curve: Curve) => {
    const sampled = sampleCurve(
      curve,
      {
        ...preset,
        xMin: view.xMin,
        xMax: view.xMax,
        yMin: view.yMin,
        yMax: view.yMax,
      }
    );

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
            if (!drag.current) return;

            const dx =
              e.clientX - drag.current.x;

            const dy =
              e.clientY - drag.current.y;

            const unitX =
              (view.xMax - view.xMin) /
              (W - 2 * P);

            const unitY =
              (view.yMax - view.yMin) /
              (H - 2 * P);

            setPan((v) => ({
              x: v.x - dx * unitX,
              y: v.y + dy * unitY,
            }));

            drag.current = {
              x: e.clientX,
              y: e.clientY,
            };
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
          <rect
            width={W}
            height={H}
            fill="white"
          />

          {xs.map((x) => (
            <g key={`x-${x}`}>
              <line
                x1={mapX(x)}
                x2={mapX(x)}
                y1={P}
                y2={H - P}
                stroke="#e2e8f0"
              />

              <text
                x={mapX(x)}
                y={H - P + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#64748b"
              >
                {fmt(x)}
              </text>
            </g>
          ))}

          {ys.map((y) => (
            <g key={`y-${y}`}>
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

          {view.xMin <= 0 &&
            view.xMax >= 0 && (
              <line
                x1={mapX(0)}
                x2={mapX(0)}
                y1={P}
                y2={H - P}
                stroke="#334155"
                strokeWidth="2"
              />
            )}

          {view.yMin <= 0 &&
            view.yMax >= 0 && (
              <line
                x1={P}
                x2={W - P}
                y1={mapY(0)}
                y2={mapY(0)}
                stroke="#334155"
                strokeWidth="2"
              />
            )}

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
                r="6"
                fill="#0f172a"
                stroke="white"
                strokeWidth="2"
                onPointerEnter={() =>
                  setHover({
                    x: pt.x,
                    y: pt.y,
                    label:
                      "Intersection / equilibrium",
                  })
                }
                onPointerLeave={() =>
                  setHover(null)
                }
              />
            </g>
          ))}

          <rect
            x={P}
            y={P}
            width={W - 2 * P}
            height={H - 2 * P}
            fill="transparent"
            onPointerMove={(e) => {
              const rect =
                e.currentTarget.ownerSVGElement!.getBoundingClientRect();

              const sx =
                ((e.clientX - rect.left) *
                  W) /
                rect.width;

              const sy =
                ((e.clientY - rect.top) *
                  H) /
                rect.height;

              const x = unmapX(sx);

              const y = unmapY(sy);

              let nearest: {
                curve: Curve;
                y: number;
                d: number;
              } | null = null;

              curves.forEach((curve) => {
                const cy = curve.fn(x);

                const d = Math.abs(
                  mapY(cy) - sy
                );

                if (
                  Number.isFinite(cy) &&
                  (!nearest ||
                    d < nearest.d)
                ) {
                  nearest = {
                    curve,
                    y: cy,
                    d,
                  };
                }
              });

              if (
                nearest &&
                nearest.d < 18
              ) {
                setHover({
                  x,
                  y: nearest.y,
                  label: nearest.curve.label,
                });
              } else {
                setHover(null);
              }
            }}
            onPointerLeave={() =>
              setHover(null)
            }
          />
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
                    {fmt(
                      controls[
                        control.key
                      ]
                    )}
                  </span>
                </div>

                <input
                  className="mt-2 w-full accent-slate-900"
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={
                    controls[
                      control.key
                    ]
                  }
                  onChange={(e) =>
                    setControls({
                      ...controls,
                      [control.key]:
                        Number(
                          e.target.value
                        ),
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
  | "scatter";

type FrequencyRow = {
  lower: number;
  upper: number;
  frequency: number;
};

type PairedPoint = {
  x: number;
  y: number;
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

function mode(values: number[]) {
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
        : Math.max(...multiple.flatMap(group => group.values)) * 1.2;
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
  const rawModes = mode(rawData);

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

function StatisticsLab() {
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
  const rawModes = mode(rawData);
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
      title: "Correlation",
      items: [
        ["scatter", "Scatter plot"],
      ] as [
        StatMode,
        string
      ][],
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
            mode === "pie") && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Category data
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Use this for discrete categories, not continuous class intervals.
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
                                freq
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

            <StatGraph
              mode={mode}
              rawData={rawData}
              categories={
                categories
              }
              multiple={multiple}
              frequencyRows={
                frequencyRows
              }
              paired={paired}
              showMean={
                showMean
              }
              showMedian={
                showMedian
              }
              showMode={
                showMode
              }
            />
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

export default function EconomicsGraphLabPage() {
  const [
    section,
    setSection,
  ] = useState<
    "XI" | "XII" | "Statistics"
  >("XI");

  const [
    selected,
    setSelected,
  ] = useState(
    "demand-supply"
  );

  const preset =
    presets.find(
      (p) => p.id === selected
    ) ?? presets[0];

  const [
    controlValues,
    setControlValues,
  ] = useState<
    Record<string, number>
  >(
    Object.fromEntries(
      preset.controls.map(
        (c) => [
          c.key,
          c.value,
        ]
      )
    )
  );

  const choose = (id: string) => {
    const p = presets.find(
      (x) => x.id === id
    );

    if (!p) return;

    setSelected(id);

    setControlValues(
      Object.fromEntries(
        p.controls.map(
          (c) => [
            c.key,
            c.value,
          ]
        )
      )
    );
  };

  const list = presets.filter(
    (p) =>
      p.className === section
  );

  const switchSection = (
    s: "XI" | "XII" | "Statistics"
  ) => {
    setSection(s);

    if (s !== "Statistics") {
      const p = presets.find(
        (x) =>
          x.className === s
      );

      if (p) choose(p.id);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">
            VGB Tools · Economics
          </div>

          <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Economics Graph Lab
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Interactive CBSE Class XI–XII economics graphs and a full Statistics workspace. Shift curves, change assumptions, enter your own data, inspect intersections and practise the diagrams you actually have to draw in an exam.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  "XI",
                  "XII",
                  "Statistics",
                ] as const
              ).map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    switchSection(
                      s
                    )
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    section === s
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {s ===
                  "Statistics"
                    ? "Statistics"
                    : `Class ${s}`}
                </button>
              ))}
            </div>
          </div>
        </header>

        {section ===
        "Statistics" ? (
          <StatisticsLab />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                Class {section} · Graphs
              </div>

              <div className="mt-2 space-y-1">
                {list.map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      choose(
                        p.id
                      )
                    }
                    className={`w-full rounded-xl px-3 py-3 text-left text-sm ${
                      selected ===
                      p.id
                        ? "bg-slate-950 text-white"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-semibold">
                      {p.title}
                    </div>

                    <div
                      className={`mt-1 text-xs ${
                        selected ===
                        p.id
                          ? "text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      {p.unit}
                    </div>
                  </button>
                ))}
              </div>
            </nav>

            <section className="min-w-0">
              <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {preset.unit}
                    </div>

                    <h2 className="mt-1 text-xl font-semibold">
                      {preset.title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {
                        preset.description
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                    Interactive · Exam-oriented
                  </div>
                </div>
              </div>

              <EconomicsGraph
                preset={preset}
                controls={
                  controlValues
                }
                setControls={
                  setControlValues
                }
              />
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
