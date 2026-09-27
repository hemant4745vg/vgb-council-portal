"use client";

import { useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };

type Curve = {
  id: string;
  label: string;
  color: string;
  fn: (x: number) => number;
  dashed?: boolean;
  vertical?: boolean;
  xValue?: number;
};

type Annotation = {
  id: string;
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
  text: string;
  tone?: "label" | "arrow" | "guide";
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
  diagram?: "circular-flow" | "mu-tu" | "cost-system" | "production-system";
};

const curveColors = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
];

function controlDisplayValue(control: Preset["controls"][number], value: number): string {
  if (control.key === "degree") {
    return ["0", "< 1", "1", "> 1", "∞"][Math.round(value)] ?? fmt(value);
  }
  return fmt(value);
}

const presets: Preset[] = [
  {
    id: "demand-supply",
    title: "Demand, Supply & Market Equilibrium",
    className: "XI",
    unit: "Price Determination",
    description: "Shift demand or supply and observe the automatically determined market equilibrium.",
    xLabel: "Quantity (in units)",
    yLabel: "Price (₹ per unit)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "dShift", label: "Demand shift", min: -20, max: 20, step: 1, value: 0 },
      { key: "sShift", label: "Supply shift", min: -20, max: 20, step: 1, value: 0 },
    ],
    curves: (c) => [
      { id: "d", label: "D", color: curveColors[0], fn: (x) => 90 - 0.75 * x + c.dShift },
      { id: "s", label: "S", color: curveColors[1], fn: (x) => 10 + 0.65 * x + c.sShift },
    ],
    interpretation: [
      "Equilibrium is the intersection of demand and supply, so equilibrium price and quantity are recalculated whenever either condition changes.",
      "An increase in demand shifts D rightward and, in this model, raises both equilibrium price and quantity.",
      "An increase in supply shifts S rightward and, in this model, lowers equilibrium price while raising equilibrium quantity.",
    ],
  },
  {
    id: "producer-equilibrium",
    title: "Producer Equilibrium · MR = MC",
    className: "XI",
    unit: "Producer Behaviour",
    description:
      "For a competitive firm, change market price and identify the profit-maximising output where the rising MC curve equals MR = AR = P.",
    xLabel: "Output (units)",
    yLabel: "Cost / Revenue (₹ per unit)",
    xMin: 1,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "price", label: "Market price / MR", min: 10, max: 80, step: 1, value: 45 },
      { key: "scale", label: "Variable-cost scale", min: 0.7, max: 1.3, step: 0.01, value: 1 },
    ],
    curves: (c) => {
      const avc = (x) => c.scale * (8 - 0.28 * x + 0.0035 * x * x);
      const mc = (x) => c.scale * (8 - 0.56 * x + 0.0105 * x * x);
      return [
        { id: "mc", label: "MC", color: curveColors[0], fn: mc },
        { id: "avc", label: "AVC", color: curveColors[1], fn: avc },
        { id: "mr", label: "MR = AR = P", color: curveColors[2], fn: () => c.price, dashed: true },
      ];
    },
    interpretation: [
      "Under perfect competition, MR = AR = P for the individual firm.",
      "Producer equilibrium occurs where MR = MC and the MC curve is rising through MR.",
      "The AVC curve also shows the short-run shutdown condition: price below minimum AVC means the firm does not cover variable cost.",
    ],
  },

  {
    id: "demand-movement-shift",
    title: "Movement Along Demand vs Shift in Demand",
    className: "XI",
    unit: "Demand",
    description: "Price changes quantity demanded along one demand curve. Non-price determinants shift the whole demand curve.",
    xLabel: "Quantity demanded (in units)",
    yLabel: "Price (₹ per unit)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "price", label: "Price (₹ per unit)", min: 20, max: 75, step: 1, value: 50 },
      { key: "income", label: "Income effect", min: -2, max: 2, step: 1, value: 0 },
      { key: "substitutes", label: "Price of substitutes", min: -2, max: 2, step: 1, value: 0 },
      { key: "complements", label: "Price of complements", min: -2, max: 2, step: 1, value: 0 },
      { key: "tastes", label: "Tastes / preferences", min: -2, max: 2, step: 1, value: 0 },
      { key: "expectations", label: "Expectations", min: -2, max: 2, step: 1, value: 0 },
      { key: "buyers", label: "Number of buyers", min: -2, max: 2, step: 1, value: 0 },
    ],
    curves: (c) => {
      const determinantSum = c.income + c.substitutes - c.complements + c.tastes + c.expectations + c.buyers;
      const shift = determinantSum * 5;
      const d0 = (x:number) => 90 - 0.72*x;
      const d1 = (x:number) => 90 - 0.72*x + shift;
      const curves: Curve[] = [{ id: "d0", label: "D₀", color: curveColors[0], fn: d0 }, { id: "price", label: "Selected price", color: curveColors[2], fn: () => c.price, dashed: true }];
      if (Math.abs(shift) > 0.01) curves.splice(1, 0, { id: "d1", label: shift > 0 ? "D₁ (increase)" : "D₂ (decrease)", color: curveColors[1], fn: d1 });
      return curves;
    },
    interpretation: [
      "Movement along demand: only the price of the commodity changes, so the same demand curve is used.",
      "Shift in demand: income, related-good prices, tastes/preferences, expectations and number of buyers change, so the whole demand curve moves.",
      "The determinant controls use large discrete effects so the shift is visually unmistakable rather than a microscopic displacement.",
    ],
  },
  {
    id: "supply-movement-shift",
    title: "Movement Along Supply vs Shift in Supply",
    className: "XI",
    unit: "Supply",
    description: "Price changes quantity supplied along one supply curve. Non-price determinants shift the whole supply curve.",
    xLabel: "Quantity supplied (in units)",
    yLabel: "Price (₹ per unit)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "price", label: "Price (₹ per unit)", min: 20, max: 80, step: 1, value: 50 },
      { key: "input", label: "Input prices", min: -2, max: 2, step: 1, value: 0 },
      { key: "related", label: "Prices of related goods", min: -2, max: 2, step: 1, value: 0 },
      { key: "technology", label: "Technology", min: -2, max: 2, step: 1, value: 0 },
      { key: "tax", label: "Taxes", min: -2, max: 2, step: 1, value: 0 },
      { key: "subsidy", label: "Subsidies", min: -2, max: 2, step: 1, value: 0 },
      { key: "expectations", label: "Expectations", min: -2, max: 2, step: 1, value: 0 },
      { key: "firms", label: "Number of firms", min: -2, max: 2, step: 1, value: 0 },
    ],
    curves: (c) => {
      const determinantSum = c.input + c.related - c.technology + c.tax - c.subsidy + c.expectations - c.firms;
      const shift = determinantSum * 5;
      const s0 = (x:number) => 8 + 0.72*x;
      const s1 = (x:number) => s0(x) + shift;
      const curves: Curve[] = [
        { id: "s0", label: "S₀", color: curveColors[0], fn: s0 },
        { id: "price", label: "Selected price", color: curveColors[2], fn: () => c.price, dashed: true },
      ];
      if (Math.abs(shift) > 0.01) curves.splice(1, 0, { id: "s1", label: shift < 0 ? "S₁ (increase)" : "S₂ (decrease)", color: curveColors[1], fn: s1 });
      return curves;
    },
    interpretation: [
      "Movement along supply: only the price of the commodity changes, so the same supply curve is used.",
      "Shift in supply: input prices, related-good prices, technology, taxes, subsidies, expectations and number of firms change, so the whole supply curve moves.",
      "Lower input costs, better technology, subsidies and more firms increase supply; higher input costs, taxes and fewer firms decrease supply, other things equal.",
    ],
  },
  {
    id: "price-elasticity-demand",
    title: "Price Elasticity of Demand",
    className: "XI",
    unit: "Elasticity of Demand",
    description: "Select E = 0, E < 1, E = 1, E > 1 or E = ∞. The curve changes shape accordingly; price then shows movement along that curve.",
    xLabel: "Quantity demanded (in units)",
    yLabel: "Price (₹ per unit)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "degree", label: "Elasticity (E)", min: 0, max: 4, step: 1, value: 2 },
      { key: "price", label: "Price (₹ per unit)", min: 10, max: 90, step: 1, value: 50 },
    ],
    curves: (c) => {
      const e = Math.round(c.degree);
      const p = c.price;
      if (e === 0) return [{ id: "d", label: "E = 0 · Perfectly inelastic", color: curveColors[0], fn: () => 50, vertical: true, xValue: 50 }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
      if (e === 1) return [{ id: "d", label: "E < 1 · Relatively inelastic", color: curveColors[0], fn: (x) => 100 - 1.45*x }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
      if (e === 2) return [{ id: "d", label: "E = 1 · Unitary elastic", color: curveColors[0], fn: (x) => 2500/Math.max(x, 1) }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
      if (e === 3) return [{ id: "d", label: "E > 1 · Relatively elastic", color: curveColors[0], fn: (x) => 90 - 0.42*x }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
      return [{ id: "d", label: "E = ∞ · Perfectly elastic", color: curveColors[0], fn: () => p }];
    },
    interpretation: [
      "E = 0: perfectly inelastic demand, shown by a vertical demand curve.",
      "E < 1: relatively inelastic; E = 1: unitary elastic; E > 1: relatively elastic.",
      "E = ∞: perfectly elastic demand, shown by a horizontal demand curve.",
      "The price controller changes the selected point along the chosen demand curve; it does not create extra equilibria.",
    ],
  },
  {
    id: "total-expenditure",
    title: "Total Expenditure Method of PED",
    className: "XI",
    unit: "Elasticity of Demand",
    description:
      "Change price and observe how total expenditure changes along the demand relationship. The turning point represents unitary elasticity in this linear model.",
    xLabel: "Price (₹ per unit)",
    yLabel: "Total expenditure (₹)",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "slope", label: "Demand responsiveness", min: 0.55, max: 1.0, step: 0.01, value: 0.75 },
      { key: "price", label: "Selected price", min: 5, max: 90, step: 1, value: 35 },
    ],
    curves: (c) => {
      const demandQ = (p) => Math.max(0, (95 - p) / c.slope);
      return [
        { id: "te", label: "Total expenditure (P × Q)", color: curveColors[0], fn: (p) => Math.min(100, (p * demandQ(p)) / 28) },
        { id: "selected", label: "Selected price", color: curveColors[2], fn: () => 0, dashed: true, vertical: true, xValue: c.price },
      ];
    },
    interpretation: [
      "When price falls and total expenditure rises, demand is elastic over that movement.",
      "When price falls and total expenditure falls, demand is inelastic over that movement.",
      "At the maximum of the total-expenditure curve, a small price change leaves total expenditure unchanged: demand is unit elastic in this linear model.",
    ],
  },

  {
    id: "price-elasticity-supply",
    title: "Price Elasticity of Supply",
    className: "XI",
    unit: "Elasticity of Supply",
    description: "Select E = 0, E < 1, E = 1, E > 1 or E = ∞. The supply curve changes shape accordingly; price then shows movement along that curve.",
    xLabel: "Quantity supplied (in units)",
    yLabel: "Price (₹ per unit)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "degree", label: "Elasticity (E)", min: 0, max: 4, step: 1, value: 2 },
      { key: "price", label: "Price (₹ per unit)", min: 10, max: 90, step: 1, value: 50 },
    ],
    curves: (c) => {
      const e = Math.round(c.degree);
      const p = c.price;
      if (e === 0) return [{ id: "s", label: "E = 0 · Perfectly inelastic", color: curveColors[0], fn: () => 50, vertical: true, xValue: 50 }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
      if (e === 1) return [{ id: "s", label: "E < 1 · Relatively inelastic", color: curveColors[0], fn: (x) => 5 + 1.45*x }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
      if (e === 2) return [{ id: "s", label: "E = 1 · Unitary elastic", color: curveColors[0], fn: (x) => 0.75*x }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
      if (e === 3) return [{ id: "s", label: "E > 1 · Relatively elastic", color: curveColors[0], fn: (x) => 8 + 0.42*x }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
      return [{ id: "s", label: "E = ∞ · Perfectly elastic", color: curveColors[0], fn: () => p }];
    },
    interpretation: [
      "E = 0: perfectly inelastic supply, shown by a vertical supply curve.",
      "E < 1: relatively inelastic; E = 1: unitary elastic; E > 1: relatively elastic.",
      "E = ∞: perfectly elastic supply, shown by a horizontal supply curve.",
      "The price controller changes the selected point along the chosen supply curve; it does not create extra equilibria.",
    ],
  },
  {
    id: "marginal-utility",
    title: "Marginal Utility & Total Utility",
    className: "XI",
    unit: "Consumer Behaviour",
    description: "Two aligned textbook panels show diminishing marginal utility and the corresponding total-utility relationship without treating every crossing as an equilibrium.",
    xLabel: "Units of the commodity consumed",
    yLabel: "Utility (utils)",
    xMin: 0, xMax: 10, yMin: 0, yMax: 100,
    controls: [
      { key: "initial", label: "Initial MU (utils)", min: 15, max: 35, step: 1, value: 30 },
      { key: "decline", label: "Decline in MU", min: 1, max: 3, step: 0.1, value: 1.8 },
    ],
    curves: () => [],
    interpretation: [
      "MU is the additional utility from consuming one more unit. With diminishing MU, successive units add less utility.",
      "TU rises while MU is positive, reaches its maximum when MU becomes zero, and falls when MU becomes negative.",
      "Consumer equilibrium for one good occurs where MU = 0; for multiple goods the condition also involves MU per rupee spent.",
    ],
    diagram: "mu-tu",
  },
  {
    id: "indifference-map",
    title: "Indifference Map",
    className: "XI",
    unit: "Consumer Behaviour",
    description:
      "Compare several indifference curves and see how higher curves represent higher levels of satisfaction.",
    xLabel: "Good X (units)",
    yLabel: "Good Y (units)",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "curvature", label: "Curvature", min: 0.55, max: 1.8, step: 0.05, value: 1 },
      { key: "spread", label: "Curve spacing", min: 8, max: 25, step: 1, value: 16 },
    ],
    curves: (c) => [
      { id: "ic1", label: "IC₁", color: curveColors[0], fn: (x) => 86 - 0.48 * Math.pow(Math.max(x, 0.5), c.curvature) },
      { id: "ic2", label: "IC₂", color: curveColors[1], fn: (x) => 86 + c.spread * 0.5 - 0.48 * Math.pow(Math.max(x, 0.5), c.curvature) },
      { id: "ic3", label: "IC₃", color: curveColors[2], fn: (x) => 86 + c.spread - 0.48 * Math.pow(Math.max(x, 0.5), c.curvature) },
    ],
    interpretation: [
      "An indifference curve represents combinations of two goods giving the consumer the same satisfaction.",
      "An indifference map contains multiple indifference curves, with higher curves representing higher satisfaction under the usual assumptions.",
      "Indifference curves are normally downward sloping and convex to the origin because of diminishing MRS.",
    ],
  },

  {
    id: "perfect-competition-firm",
    title: "Firm Equilibrium under Perfect Competition",
    className: "XI",
    unit: "Market Forms",
    description:
      "Show the competitive firm's horizontal AR/MR/P line together with AC and MC, including the equilibrium output and profit/loss reading.",
    xLabel: "Output (units)",
    yLabel: "Cost / Revenue (₹)",
    xMin: 1,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "price", label: "Market price", min: 10, max: 80, step: 1, value: 50 },
      { key: "fixed", label: "Fixed cost", min: 20, max: 60, step: 1, value: 40 },
      { key: "scale", label: "Variable-cost scale", min: 0.7, max: 1.3, step: 0.01, value: 1 },
    ],
    curves: (c) => {
      const avc = (x) => c.scale * (8 - 0.28 * x + 0.0035 * x * x);
      const mc = (x) => c.scale * (8 - 0.56 * x + 0.0105 * x * x);
      const ac = (x) => c.fixed / x + avc(x);
      return [
        { id: "mc", label: "MC", color: curveColors[0], fn: mc },
        { id: "ac", label: "AC", color: curveColors[1], fn: ac },
        { id: "mr", label: "AR = MR = P", color: curveColors[2], fn: () => c.price, dashed: true },
      ];
    },
    interpretation: [
      "A competitive firm is a price taker, so its AR and MR are equal to market price.",
      "The short-run equilibrium output is where MC = MR with MC rising.",
      "Compare price with AC at equilibrium output to identify profit, normal profit or loss.",
    ],
  },

  {
    id: "excess-deficient-demand",
    title: "Excess Demand & Deficient Demand",
    className: "XII",
    unit: "Determination of Income and Employment",
    description:
      "Move aggregate demand relative to the full-employment output to visualise inflationary and deflationary gaps.",
    xLabel: "Real income / output",
    yLabel: "Aggregate demand / expenditure",
    xMin: 0,
    xMax: 120,
    yMin: 0,
    yMax: 120,
    controls: [
      { key: "autonomous", label: "Autonomous expenditure", min: 10, max: 70, step: 1, value: 35 },
      { key: "mpc", label: "MPC", min: 0.5, max: 0.9, step: 0.01, value: 0.75 },
      { key: "fullEmployment", label: "Full-employment output", min: 45, max: 100, step: 1, value: 70 },
    ],
    curves: (c) => [
      { id: "ad", label: "AD / AE", color: curveColors[0], fn: (x) => c.autonomous + c.mpc * x },
      { id: "45", label: "45° line", color: "#64748b", fn: (x) => x, dashed: true },
      { id: "fe", label: "Full-employment output", color: curveColors[2], fn: () => 0, dashed: true, vertical: true, xValue: c.fullEmployment },
    ],
    interpretation: [
      "At full-employment output, excess demand is shown when planned aggregate expenditure lies above the 45° line.",
      "At full-employment output, deficient demand is shown when planned aggregate expenditure lies below the 45° line.",
      "Fiscal and monetary policy can be used to reduce an inflationary gap or close a deflationary gap, depending on the policy direction.",
    ],
  },

  {
    id: "exchange-rate-regimes",
    title: "Fixed, Flexible & Managed Exchange Rates",
    className: "XII",
    unit: "Balance of Payments",
    description:
      "Compare market-determined exchange rates with an administratively maintained rate and a managed intervention band.",
    xLabel: "Quantity of foreign exchange",
    yLabel: "Exchange rate",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "dShift", label: "Demand shift", min: -18, max: 18, step: 1, value: 0 },
      { key: "fixedRate", label: "Fixed exchange rate", min: 35, max: 75, step: 1, value: 55 },
      { key: "band", label: "Management band", min: 3, max: 15, step: 1, value: 7 },
    ],
    curves: (c) => [
      { id: "d", label: "Demand for FX", color: curveColors[0], fn: (x) => 90 - 0.72 * x + c.dShift },
      { id: "s", label: "Supply of FX", color: curveColors[1], fn: (x) => 10 + 0.68 * x },
      { id: "fixed", label: "Fixed rate", color: curveColors[2], fn: () => c.fixedRate, dashed: true },
      { id: "upper", label: "Managed band upper", color: "#9333ea", fn: () => c.fixedRate + c.band, dashed: true },
      { id: "lower", label: "Managed band lower", color: "#ea580c", fn: () => c.fixedRate - c.band, dashed: true },
    ],
    interpretation: [
      "Under a flexible exchange rate, market demand and supply determine the equilibrium exchange rate.",
      "Under a fixed rate, the monetary authority maintains a chosen exchange rate through intervention in the foreign-exchange market.",
      "Managed floating allows market forces to operate while the authority intervenes when it wants to influence excessive movements.",
    ],
  },

  {
    id: "circular-flow",
    title: "Two-Sector Circular Flow of Income",
    className: "XII",
    unit: "National Income",
    description:
      "Visualise the real and monetary flows between households and firms in the basic two-sector model.",
    xLabel: "",
    yLabel: "",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [],
    curves: () => [],
    interpretation: [
      "Households supply factors of production to firms and receive factor income in return.",
      "Firms supply goods and services to households, while households make consumption expenditure.",
      "The real flow and money flow move in opposite directions around the circular-flow system.",
    ],
    diagram: "circular-flow",
  },

  {
    id: "price-ceiling",
    title: "Price Ceiling · Government Intervention",
    className: "XI",
    unit: "Government Intervention",
    description: "Set the maximum legal price and automatically compare it with equilibrium, quantity demanded, quantity supplied and shortage.",
    xLabel: "Quantity (in units)",
    yLabel: "Price (₹ per unit)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [{ key: "ceiling", label: "Maximum legal price (₹)", min: 10, max: 80, step: 1, value: 45 }],
    curves: (c) => [
      { id: "d", label: "D", color: curveColors[0], fn: (x) => 90-0.75*x },
      { id: "s", label: "S", color: curveColors[1], fn: (x) => 10+0.65*x },
      { id: "ceiling", label: "Price ceiling", color: curveColors[2], fn: () => c.ceiling, dashed: true },
    ],
    interpretation: [
      "The equilibrium price is determined where demand equals supply.",
      "If the ceiling is below equilibrium, it is binding: Qd > Qs and the shortage equals Qd − Qs.",
      "If the ceiling is at or above equilibrium, it is non-binding and does not constrain the market equilibrium.",
    ],
  },
  {
    id: "price-floor",
    title: "Price Floor · Government Intervention",
    className: "XI",
    unit: "Government Intervention",
    description: "Set the minimum legal price and automatically compare it with equilibrium, quantity demanded, quantity supplied and surplus.",
    xLabel: "Quantity (in units)",
    yLabel: "Price (₹ per unit)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [{ key: "floor", label: "Minimum legal price (₹)", min: 20, max: 90, step: 1, value: 65 }],
    curves: (c) => [
      { id: "d", label: "D", color: curveColors[0], fn: (x) => 90-0.75*x },
      { id: "s", label: "S", color: curveColors[1], fn: (x) => 10+0.65*x },
      { id: "floor", label: "Price floor", color: curveColors[2], fn: () => c.floor, dashed: true },
    ],
    interpretation: [
      "The equilibrium price is determined where demand equals supply.",
      "If the floor is above equilibrium, it is binding: Qs > Qd and the surplus equals Qs − Qd.",
      "If the floor is at or below equilibrium, it is non-binding and does not constrain the market equilibrium.",
    ],
  },
  {
    id: "ppc",
    title: "Production Possibility Curve",
    className: "XI",
    unit: "Introduction to Microeconomics",
    description: "Complete PPC showing scarcity, efficient, inefficient and unattainable combinations and opportunity cost.",
    xLabel: "Good X (units)",
    yLabel: "Good Y (units)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [{ key: "curvature", label: "Opportunity-cost curvature", min: 0.75, max: 1.5, step: 0.05, value: 1 }],
    curves: (c) => [{ id: "ppc", label: "PPC", color: curveColors[0], fn: (x) => 100*Math.pow(Math.max(0,1-x/100),c.curvature) }],
    interpretation: [
      "Points on the PPC are efficient combinations of the two goods given current resources and technology.",
      "A point inside the PPC is attainable but inefficient; a point outside is unattainable with the current resource and technology constraint.",
      "Moving along the PPC illustrates opportunity cost because producing more of one good requires giving up some of the other good.",
    ],
  },
  {
    id: "budget-line",
    title: "Budget Line",
    className: "XI",
    unit: "Consumer Equilibrium",
    description:
      "Change income and relative prices to see the budget constraint move.",
    xLabel: "Good X (units)",
    yLabel: "Good Y (units)",
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
    xLabel: "Good X (units)",
    yLabel: "Good Y (units)",
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
    description: "A textbook indifference-curve and budget-line diagram with an automatically calculated tangency point.",
    xLabel: "Quantity of Good X (units)",
    yLabel: "Quantity of Good Y (units)",
    xMin: 0, xMax: 180, yMin: 0, yMax: 180,
    controls: [
      { key: "income", label: "Consumer income (₹)", min: 60, max: 160, step: 1, value: 100 },
      { key: "px", label: "Price of Good X (₹)", min: 0.5, max: 2, step: 0.05, value: 1 },
      { key: "py", label: "Price of Good Y (₹)", min: 0.5, max: 2, step: 0.05, value: 1 },
    ],
    curves: (c) => {
      const xStar = c.income / (2*c.px);
      const yStar = c.income / (2*c.py);
      const utility = Math.sqrt(Math.max(0.1,xStar*yStar));
      return [
        { id: "budget", label: "Budget line", color: curveColors[0], fn: (x) => (c.income-c.px*x)/c.py },
        { id: "ic", label: "IC at equilibrium", color: curveColors[2], fn: (x) => utility*utility/Math.max(x,0.5) },
      ];
    },
    interpretation: [
      "The budget line shows all affordable combinations of Good X and Good Y.",
      "The equilibrium bundle is where the highest attainable indifference curve is tangent to the budget line.",
      "At an interior optimum, MRS = Px / Py. With the Cobb-Douglas illustration used here, the optimum allocates half of income to each good.",
    ],
  },
  {
    id: "tp-ap-mp",
    title: "TP, AP & MP",
    className: "XI",
    unit: "Producer Behaviour",
    description: "A mathematically linked production system: MP is the slope of TP and AP is TP divided by the variable input.",
    xLabel: "Variable input (units)",
    yLabel: "Product / product per unit of input",
    xMin: 0, xMax: 12, yMin: 0, yMax: 100,
    controls: [
      { key: "productivity", label: "Productivity scale", min: 0.8, max: 1.2, step: 0.05, value: 1 },
    ],
    curves: () => [],
    interpretation: [
      "MP is the change in total product caused by one additional unit of variable input and equals the slope of TP.",
      "AP = TP divided by the variable input. MP intersects AP at AP's maximum.",
      "TP is maximum where MP = 0. Beyond that point MP becomes negative and TP falls.",
    ],
    diagram: "production-system",
  },
  {
    id: "cost-curves",
    title: "Short-Run Cost Curves & Relationships",
    className: "XI",
    unit: "Producer Behaviour",
    description: "Complete textbook cost system: TFC, TVC and TC above; AFC, AVC, AC and MC below, with the required relationships marked.",
    xLabel: "Output (units)",
    yLabel: "Cost (₹)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "fixed", label: "Total fixed cost (₹)", min: 20, max: 60, step: 1, value: 40 },
      { key: "scale", label: "Variable-cost scale", min: 0.7, max: 1.3, step: 0.01, value: 1 },
    ],
    curves: () => [],
    interpretation: [
      "TC = TFC + TVC. TFC is constant, TVC begins at the origin, and TC begins at the TFC intercept.",
      "AFC = TFC/Q, so AFC continuously falls. AC = AFC + AVC, so AC lies above AVC by the AFC amount.",
      "MC is the change in TC or TVC from one more unit of output. MC cuts AVC at AVC's minimum and AC at AC's minimum.",
    ],
    diagram: "cost-system",
  },
  {
    id: "revenue",
    title: "TR, AR & MR under Perfect Competition",
    className: "XI",
    unit: "Producer Behaviour",
    description:
      "Use the competitive-firm revenue identities TR = P × Q and AR = MR = P on a common revenue scale.",
    xLabel: "Output (units)",
    yLabel: "Revenue / Price (₹)",
    xMin: 0,
    xMax: 10,
    yMin: 0,
    yMax: 800,
    controls: [
      { key: "price", label: "Price", min: 20, max: 80, step: 1, value: 50 },
    ],
    curves: (c) => [
      { id: "tr", label: "TR = P × Q", color: curveColors[0], fn: (x) => c.price * x },
      { id: "ar", label: "AR = P", color: curveColors[1], fn: () => c.price },
      { id: "mr", label: "MR = P", color: curveColors[2], fn: () => c.price },
    ],
    interpretation: [
      "Under perfect competition, price is constant for the individual firm.",
      "Therefore AR = MR = P.",
      "TR = P × Q, so with constant price the TR curve is a straight line through the origin and its slope equals price.",
    ],
  },

  {
    id: "consumption-saving",
    title: "Consumption & Saving Functions",
    className: "XII",
    unit: "Determination of Income and Employment",
    description:
      "Explore consumption, autonomous consumption and saving as income changes.",
    xLabel: "Income (₹)",
    yLabel: "Consumption / Saving (₹)",
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
    xLabel: "Income / Output (₹)",
    yLabel: "Aggregate Expenditure (₹)",
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
      "See how MPC determines the investment multiplier and how an initial investment change affects income.",
    xLabel: "MPC",
    yLabel: "Multiplier (k)",
    xMin: 0.4,
    xMax: 0.95,
    yMin: 0,
    yMax: 25,
    controls: [
      { key: "investment", label: "Change in investment (ΔI)", min: 5, max: 30, step: 1, value: 10 },
    ],
    curves: (c) => [
      { id: "k", label: "k = 1 / (1 − MPC)", color: curveColors[0], fn: (x) => 1 / (1 - x) },
      { id: "selected", label: "Selected ΔY", color: curveColors[2], fn: () => Math.min(25, c.investment / (1 - 0.75)), dashed: true },
    ],
    interpretation: [
      "In the simple model, k = 1 / (1 − MPC).",
      "A higher MPC produces a larger investment multiplier.",
      "The resulting change in income is ΔY = k × ΔI.",
    ],
  },

  {
    id: "money-demand",
    title: "Money Demand & Money Supply",
    className: "XII",
    unit: "Money and Banking",
    description:
      "Use the liquidity-preference framework with quantity of money on the horizontal axis and a fixed money supply as a vertical line.",
    xLabel: "Quantity of Money (₹ crore)",
    yLabel: "Rate of Interest (%)",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "supply", label: "Money supply", min: 20, max: 85, step: 1, value: 55 },
      { key: "demandShift", label: "Money-demand shift", min: -15, max: 15, step: 1, value: 0 },
    ],
    curves: (c) => [
      { id: "md", label: "Money demand", color: curveColors[0], fn: (x) => 92 - 0.85 * x + c.demandShift },
      { id: "ms", label: "Money supply", color: curveColors[1], fn: () => 0, dashed: true, vertical: true, xValue: c.supply },
    ],
    interpretation: [
      "Money demand is downward sloping with respect to the interest rate in this framework.",
      "A fixed money supply is vertical because the quantity supplied is set independently of the interest rate.",
      "A change in money supply shifts the vertical MS line and changes the equilibrium interest rate.",
    ],
  },

  {
    id: "forex",
    title: "Foreign Exchange Demand & Supply",
    className: "XII",
    unit: "Balance of Payments",
    description:
      "Explore exchange-rate determination using demand and supply of foreign currency.",
    xLabel: "Quantity of Foreign Exchange (units)",
    yLabel: "Exchange Rate (₹ per unit of foreign currency)",
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

function graphAnnotations(preset: Preset, controls: Record<string, number>, curves: Curve[], view: {xMin:number;xMax:number;yMin:number;yMax:number}): Annotation[] {
  const a: Annotation[] = [];
  const dEqQ = (dShift=0,sShift=0) => (80+dShift-sShift)/1.4;
  const dEqP = (dShift=0,sShift=0) => 90-0.75*dEqQ(dShift,sShift)+dShift;

  if (preset.id === "demand-supply") {
    const q0=dEqQ(), p0=dEqP();
    const q1=dEqQ(controls.dShift,controls.sShift), p1=dEqP(controls.dShift,controls.sShift);
    a.push({id:"eq-guide-x",x1:q1,y1:0,x2:q1,y2:p1,text:"Qe₁",tone:"guide"});
    a.push({id:"eq-guide-y",x1:0,y1:p1,x2:q1,y2:p1,text:"Pe₁",tone:"guide"});
    a.push({id:"eq",x1:q1,y1:p1,x2:q1,y2:p1,text:"E₁: New equilibrium",tone:"label"});
    if (controls.dShift > 0) a.push({id:"d-shift-arrow",x1:28,y1:90-0.75*28,x2:40,y2:90-0.75*40+controls.dShift,text:"Increase in demand",tone:"arrow"});
    if (controls.dShift < 0) a.push({id:"d-shift-arrow",x1:40,y1:90-0.75*40+controls.dShift,x2:28,y2:90-0.75*28,text:"Decrease in demand",tone:"arrow"});
    if (controls.sShift < 0) a.push({id:"s-shift-arrow",x1:28,y1:10+0.65*28+controls.sShift,x2:40,y2:10+0.65*40+controls.sShift,text:"Increase in supply",tone:"arrow"});
    if (controls.sShift > 0) a.push({id:"s-shift-arrow",x1:40,y1:10+0.65*40+controls.sShift,x2:28,y2:10+0.65*28,text:"Decrease in supply",tone:"arrow"});
    if (Math.abs(q1-q0)>0.25 || Math.abs(p1-p0)>0.25) {
      a.push({id:"old-eq",x1:q0,y1:p0,x2:q0,y2:p0,text:"E₀",tone:"label"});
      a.push({id:"eq-arrow",x1:q0,y1:p0,x2:q1,y2:p1,text:"Equilibrium shifts",tone:"arrow"});
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
function CircularFlowDiagram() {
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
  const W=900,H=600,P=70;
  const innerW=W-2*P, panelH=210;
  const x=(q:number)=>P+(q/10)*innerW;
  const y=(u:number, top:number)=>top+panelH-(Math.max(0,Math.min(150,u))/150)*panelH;
  const initial=controls.initial, decline=controls.decline;
  const mu=(q:number)=>initial-decline*q;
  const tu=(q:number)=>initial*q-0.5*decline*q*q;
  const path=(fn:(q:number)=>number,top:number)=>{let d='';for(let i=0;i<=220;i++){const q=i/22;const px=x(q),py=y(fn(q),top);d+=(i?' L ':'M ')+px.toFixed(2)+' '+py.toFixed(2);}return d;};
  const qMax=Math.min(10,initial/decline);
  return <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Marginal utility and total utility">
      <line x1={P} x2={W-P} y1={60} y2={60} stroke="#334155" strokeWidth="2" markerEnd="url(#econ-arrow)"/>
      <text x={W/2} y={42} textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">Marginal Utility (MU) · Units consumed</text>
      <line x1={P} x2={W-P} y1={60+panelH} y2={60+panelH} stroke="#334155" strokeWidth="2" markerEnd="url(#econ-arrow)"/>
      <text x={W/2} y={60+panelH+28} textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">Total Utility (TU) · Units consumed</text>
      <line x1={P} x2={P} y1={60} y2={60+2*panelH+45} stroke="#334155" strokeWidth="2" markerEnd="url(#econ-arrow)"/>
      <text x={20} y={300} transform="rotate(-90 20 300)" textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">Utility (utils)</text>
      {[0,2,4,6,8,10].map(q=><g key={q}><text x={x(q)} y={54} textAnchor="middle" fontSize="11" fill="#64748b">{q}</text><text x={x(q)} y={60+panelH-6} textAnchor="middle" fontSize="11" fill="#64748b">{q}</text></g>)}
      {[0,30,60,90,120,150].map(u=><text key={u} x={P-10} y={y(u,60)+4} textAnchor="end" fontSize="11" fill="#64748b">{u}</text>)}
      <path d={path(mu,60)} fill="none" stroke="#2563eb" strokeWidth="4"/>
      <path d={path(tu,60+panelH)} fill="none" stroke="#dc2626" strokeWidth="4"/>
      <line x1={x(qMax)} x2={x(qMax)} y1={60} y2={60+2*panelH} stroke="#94a3b8" strokeDasharray="5 5"/>
      <text x={x(qMax)+8} y={94} fontSize="12" fontWeight="700" fill="#2563eb">MU = 0</text>
      <text x={x(qMax)+8} y={60+panelH+40} fontSize="12" fontWeight="700" fill="#dc2626">TU maximum</text>
      <text x={P+10} y={y(mu(2),60)-12} fontSize="13" fontWeight="700" fill="#2563eb">MU curve</text>
      <text x={P+10} y={y(tu(2),60+panelH)-12} fontSize="13" fontWeight="700" fill="#dc2626">TU curve</text>
    </svg>
  </div>;
}

function ProductionSystemDiagram({ controls }: { controls: Record<string, number> }) {
  const W=900,H=720,P=72, plotW=W-2*P;
  const productivity=controls.productivity ?? 1;
  const x=(q:number)=>P+(q/12)*plotW;
  const tp=(q:number)=>productivity*(10*q+4*q*q-0.35*q*q*q);
  const ap=(q:number)=>q<=0?0:tp(q)/q;
  const mp=(q:number)=>productivity*(10+8*q-1.05*q*q);
  const yTop=(v:number)=>55+245-(Math.max(0,Math.min(170,v))/170)*245;
  const yBot=(v:number)=>410+245-(Math.max(0,Math.min(35,v))/35)*245;
  const path=(fn:(q:number)=>number,yf:(v:number)=>number)=>{let d='';for(let i=0;i<=240;i++){const q=i/20;const px=x(q),py=yf(fn(q));d+=(i?' L ':'M ')+px.toFixed(2)+' '+py.toFixed(2);}return d;};
  const qTP=(8+Math.sqrt(106))/2.1;
  const qAP=4/0.7;
  return <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="TP, AP and MP production relationship">
      <defs><marker id="production-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#475569"/></marker></defs>
      <text x={W/2} y="27" textAnchor="middle" fontSize="17" fontWeight="800" fill="#0f172a">Total Product (TP)</text>
      <line x1={P} x2={W-P} y1="300" y2="300" stroke="#334155" strokeWidth="2" markerEnd="url(#production-arrow)"/>
      <line x1={P} x2={P} y1="55" y2="300" stroke="#334155" strokeWidth="2" markerEnd="url(#production-arrow)"/>
      <text x={W/2} y="322" textAnchor="middle" fontSize="13" fontWeight="700">Variable input (units)</text>
      <text x="18" y="177" transform="rotate(-90 18 177)" textAnchor="middle" fontSize="13" fontWeight="700">Total product (units)</text>
      <path d={path(tp,yTop)} fill="none" stroke={curveColors[0]} strokeWidth="4"/>
      <line x1={x(qTP)} x2={x(qTP)} y1={yTop(tp(qTP))} y2="300" stroke="#94a3b8" strokeDasharray="5 5"/>
      <circle cx={x(qTP)} cy={yTop(tp(qTP))} r="6" fill="#0f172a"/>
      <text x={x(qTP)+9} y={yTop(tp(qTP))-12} fontSize="12" fontWeight="700" fill="#0f172a">TP maximum</text>
      <text x={x(qTP)+9} y={yTop(tp(qTP))+5} fontSize="11" fill="#475569">MP = 0</text>
      <text x={x(7.4)} y={yTop(tp(7.4))-10} fontSize="13" fontWeight="700" fill={curveColors[0]}>TP</text>
      <text x={x(9.3)} y={yTop(tp(9.3))+28} fontSize="12" fill="#475569">TP falls when MP becomes negative</text>

      <text x={W/2} y="382" textAnchor="middle" fontSize="17" fontWeight="800" fill="#0f172a">Average Product (AP) and Marginal Product (MP)</text>
      <line x1={P} x2={W-P} y1="655" y2="655" stroke="#334155" strokeWidth="2" markerEnd="url(#production-arrow)"/>
      <line x1={P} x2={P} y1="410" y2="655" stroke="#334155" strokeWidth="2" markerEnd="url(#production-arrow)"/>
      <text x={W/2} y="677" textAnchor="middle" fontSize="13" fontWeight="700">Variable input (units)</text>
      <text x="18" y="532" transform="rotate(-90 18 532)" textAnchor="middle" fontSize="13" fontWeight="700">Product per unit of input</text>
      <path d={path(ap,yBot)} fill="none" stroke={curveColors[1]} strokeWidth="4"/>
      <path d={path(mp,yBot)} fill="none" stroke={curveColors[2]} strokeWidth="4"/>
      <line x1={x(qAP)} x2={x(qAP)} y1={yBot(ap(qAP))} y2="655" stroke="#94a3b8" strokeDasharray="5 5"/>
      <circle cx={x(qAP)} cy={yBot(ap(qAP))} r="6" fill="#0f172a"/>
      <text x={x(qAP)+9} y={yBot(ap(qAP))-13} fontSize="12" fontWeight="700" fill="#0f172a">AP maximum</text>
      <text x={x(qAP)+9} y={yBot(ap(qAP))+4} fontSize="11" fill="#475569">MP = AP</text>
      <text x={x(qAP/2)} y="430" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">Stage I · Increasing returns</text>
      <text x={x((qAP+qTP)/2)} y="430" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">Stage II · Diminishing returns</text>
      <text x={x((qTP+12)/2)} y="430" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">Stage III · Negative returns</text>
      <text x={x(8.2)} y={yBot(ap(8.2))-10} fontSize="13" fontWeight="700" fill={curveColors[1]}>AP</text>
      <text x={x(8.2)} y={yBot(mp(8.2))+18} fontSize="13" fontWeight="700" fill={curveColors[2]}>MP</text>
    </svg>
  </div>;
}

function CostSystemDiagram({ controls }: { controls: Record<string, number> }) {
  const W=900,H=760,P=72,plotW=W-2*P;
  const fixed=controls.fixed ?? 40, scale=controls.scale ?? 1;
  const x=(q:number)=>P+(q/80)*plotW;
  const tvc=(q:number)=>scale*(0.8*q-0.025*q*q+0.0005*q*q*q);
  const tc=(q:number)=>fixed+tvc(q);
  const avc=(q:number)=>scale*(0.8-0.025*q+0.0005*q*q);
  const afc=(q:number)=>q<5?6:fixed/q;
  const ac=(q:number)=>avc(q)+afc(q);
  const mc=(q:number)=>scale*(0.8-0.05*q+0.0015*q*q);
  const yTop=(v:number)=>55+245-(Math.max(0,Math.min(130,v))/130)*245;
  const yBot=(v:number)=>405+285-(Math.max(0,Math.min(6,v))/6)*285;
  const path=(fn:(q:number)=>number,yf:(v:number)=>number)=>{let d='';for(let i=0;i<=240;i++){const q=i/3;const px=x(q),py=yf(fn(q));d+=(i?' L ':'M ')+px.toFixed(2)+' '+py.toFixed(2);}return d;};
  const qAVC=25;
  const qAC=44.87;
  return <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Short-run total and per-unit cost relationships">
      <defs><marker id="cost-system-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#475569"/></marker></defs>
      <text x={W/2} y="27" textAnchor="middle" fontSize="17" fontWeight="800">Total Cost Curves</text>
      <line x1={P} x2={W-P} y1="300" y2="300" stroke="#334155" strokeWidth="2" markerEnd="url(#cost-system-arrow)"/>
      <line x1={P} x2={P} y1="55" y2="300" stroke="#334155" strokeWidth="2" markerEnd="url(#cost-system-arrow)"/>
      <text x={W/2} y="322" textAnchor="middle" fontSize="13" fontWeight="700">Output (units)</text>
      <text x="18" y="178" transform="rotate(-90 18 178)" textAnchor="middle" fontSize="13" fontWeight="700">Total cost (₹)</text>
      <path d={path(()=>fixed,yTop)} fill="none" stroke="#16a34a" strokeWidth="4"/>
      <path d={path(tvc,yTop)} fill="none" stroke="#2563eb" strokeWidth="4"/>
      <path d={path(tc,yTop)} fill="none" stroke="#dc2626" strokeWidth="4"/>
      <text x={x(66)} y={yTop(fixed)-9} fill="#16a34a" fontSize="12" fontWeight="700">TFC</text>
      <text x={x(58)} y={yTop(tvc(58))-9} fill="#2563eb" fontSize="12" fontWeight="700">TVC</text>
      <text x={x(50)} y={yTop(tc(50))-10} fill="#dc2626" fontSize="12" fontWeight="700">TC = TFC + TVC</text>
      <line x1={x(40)} x2={x(40)} y1={yTop(fixed)} y2={yTop(tvc(40))} stroke="#64748b" strokeDasharray="5 5"/>
      <text x={x(40)+8} y={(yTop(fixed)+yTop(tvc(40)))/2} fontSize="11" fill="#475569">Vertical distance = TFC</text>
      <text x={x(3)} y={yTop(fixed)-8} fontSize="11" fill="#475569">TFC is constant</text>
      <text x={x(3)} y={yTop(tvc(3))+22} fontSize="11" fill="#475569">TVC starts from origin</text>
      <text x={W/2} y="367" textAnchor="middle" fontSize="17" fontWeight="800">Average and Marginal Cost Curves</text>
      <line x1={P} x2={W-P} y1="690" y2="690" stroke="#334155" strokeWidth="2" markerEnd="url(#cost-system-arrow)"/>
      <line x1={P} x2={P} y1="405" y2="690" stroke="#334155" strokeWidth="2" markerEnd="url(#cost-system-arrow)"/>
      <text x={W/2} y="713" textAnchor="middle" fontSize="13" fontWeight="700">Output (units)</text>
      <text x="18" y="548" transform="rotate(-90 18 548)" textAnchor="middle" fontSize="13" fontWeight="700">Cost per unit (₹)</text>
      <path d={path(afc,yBot)} fill="none" stroke="#2563eb" strokeWidth="4"/>
      <path d={path(avc,yBot)} fill="none" stroke="#16a34a" strokeWidth="4"/>
      <path d={path(ac,yBot)} fill="none" stroke="#dc2626" strokeWidth="4"/>
      <path d={path(mc,yBot)} fill="none" stroke="#9333ea" strokeWidth="4"/>
      <line x1={x(qAVC)} x2={x(qAVC)} y1={yBot(avc(qAVC))} y2="690" stroke="#94a3b8" strokeDasharray="5 5"/>
      <line x1={x(qAC)} x2={x(qAC)} y1={yBot(ac(qAC))} y2="690" stroke="#94a3b8" strokeDasharray="5 5"/>
      <circle cx={x(qAVC)} cy={yBot(avc(qAVC))} r="6" fill="#0f172a"/>
      <circle cx={x(qAC)} cy={yBot(ac(qAC))} r="6" fill="#0f172a"/>
      <text x={x(64)} y={yBot(afc(64))-10} fill="#2563eb" fontSize="12" fontWeight="700">AFC: continuously falling</text>
      <text x={x(57)} y={yBot(avc(57))-10} fill="#16a34a" fontSize="12" fontWeight="700">AVC</text>
      <text x={x(58)} y={yBot(ac(58))-10} fill="#dc2626" fontSize="12" fontWeight="700">AC = AFC + AVC</text>
      <text x={x(68)} y={yBot(mc(68))-10} fill="#9333ea" fontSize="12" fontWeight="700">MC</text>
      <text x={x(qAVC)+8} y={yBot(avc(qAVC))+26} fontSize="11" fill="#475569">MC cuts AVC at AVC minimum</text>
      <text x={x(qAC)+8} y={yBot(ac(qAC))+26} fontSize="11" fill="#475569">MC cuts AC at AC minimum</text>
      <text x={x(10)} y={yBot(ac(10))+42} fontSize="11" fill="#475569">AC lies above AVC by AFC</text>
    </svg>
  </div>;
}

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

  if (preset.diagram === "circular-flow") {
    return <CircularFlowDiagram />;
  }
  if (preset.diagram === "mu-tu") {
    return <MarginalUtilityDiagram controls={controls} />;
  }
  if (preset.diagram === "cost-system") {
    return <CostSystemDiagram controls={controls} />;
  }
  if (preset.diagram === "production-system") {
    return <ProductionSystemDiagram controls={controls} />;
  }

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

  const points = useMemo(() => {
    const marked = new Set(["demand-supply", "money-demand", "forex", "income-equilibrium"]);
    return marked.has(preset.id) ? intersections(curves.filter((c) => !c.dashed), view).slice(0, 1) : [];
  }, [preset.id, curves, view.xMin, view.xMax, view.yMin, view.yMax]);

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


          {graphAnnotations(preset, controls, curves, view).map((ann) => {
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
                    label: "Intersection / equilibrium",
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
                      "Intersection / equilibrium",
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
                    {controlDisplayValue(control, controls[control.key])}
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
  const tieAdjustment = (tieCorrection(points.map((p) => p.x)) + tieCorrection(points.map((p) => p.y))) / 12;
  return 1 - (6 * (d2 + tieAdjustment)) / (n * (n ** 2 - 1));
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
