"use client";

import { useMemo, useState } from "react";

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
      const avc = (x: number) => c.scale * (8 - 0.28 * x + 0.0035 * x * x);
      const mc = (x: number) => c.scale * (8 - 0.56 * x + 0.0105 * x * x);
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
      const d0 = (x: number) => 90 - 0.72 * x;
      const d1 = (x: number) => 90 - 0.72 * x + shift;
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
      const s0 = (x: number) => 8 + 0.72 * x;
      const s1 = (x: number) => s0(x) + shift;
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
      if (e === 1) return [{ id: "d", label: "E < 1 · Relatively inelastic", color: curveColors[0], fn: (x) => 100 - 1.45 * x }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
      if (e === 2) return [{ id: "d", label: "E = 1 · Unitary elastic", color: curveColors[0], fn: (x) => 2500 / Math.max(x, 1) }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
      if (e === 3) return [{ id: "d", label: "E > 1 · Relatively elastic", color: curveColors[0], fn: (x) => 90 - 0.42 * x }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
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
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "slope", label: "Demand responsiveness", min: 0.55, max: 1.0, step: 0.01, value: 0.75 },
      { key: "price", label: "Selected price", min: 5, max: 90, step: 1, value: 35 },
    ],
    curves: (c) => {
      const demandQ = (p: number) => Math.max(0, (95 - p) / c.slope);
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
      if (e === 1) return [{ id: "s", label: "E < 1 · Relatively inelastic", color: curveColors[0], fn: (x) => 5 + 1.45 * x }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
      if (e === 2) return [{ id: "s", label: "E = 1 · Unitary elastic", color: curveColors[0], fn: (x) => 0.75 * x }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
      if (e === 3) return [{ id: "s", label: "E > 1 · Relatively elastic", color: curveColors[0], fn: (x) => 8 + 0.42 * x }, { id: "p", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true }];
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
    description: "Compare several indifference curves and see how higher curves represent higher levels of satisfaction.",
    xLabel: "Good X (units)",
    yLabel: "Good Y (units)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
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
    description: "Show the competitive firm's horizontal AR/MR/P line together with AC and MC, including the equilibrium output and profit/loss reading.",
    xLabel: "Output (units)",
    yLabel: "Cost / Revenue (₹)",
    xMin: 1, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "price", label: "Market price", min: 10, max: 80, step: 1, value: 50 },
      { key: "fixed", label: "Fixed cost", min: 20, max: 60, step: 1, value: 40 },
      { key: "scale", label: "Variable-cost scale", min: 0.7, max: 1.3, step: 0.01, value: 1 },
    ],
    curves: (c) => {
      const avc = (x: number) => c.scale * (8 - 0.28 * x + 0.0035 * x * x);
      const mc = (x: number) => c.scale * (8 - 0.56 * x + 0.0105 * x * x);
      const ac = (x: number) => c.fixed / x + avc(x);
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
    description: "Move aggregate demand relative to the full-employment output to visualise inflationary and deflationary gaps.",
    xLabel: "Real income / output",
    yLabel: "Aggregate demand / expenditure",
    xMin: 0, xMax: 120, yMin: 0, yMax: 120,
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
    description: "Compare market-determined exchange rates with an administratively maintained rate and a managed intervention band.",
    xLabel: "Quantity of foreign exchange",
    yLabel: "Exchange rate",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
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
    description: "Visualise the real and monetary flows between households and firms in the basic two-sector model.",
    xLabel: "",
    yLabel: "",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
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
      { id: "d", label: "D", color: curveColors[0], fn: (x) => 90 - 0.75 * x },
      { id: "s", label: "S", color: curveColors[1], fn: (x) => 10 + 0.65 * x },
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
      { id: "d", label: "D", color: curveColors[0], fn: (x) => 90 - 0.75 * x },
      { id: "s", label: "S", color: curveColors[1], fn: (x) => 10 + 0.65 * x },
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
    curves: (c) => [{ id: "ppc", label: "PPC", color: curveColors[0], fn: (x) => 100 * Math.pow(Math.max(0, 1 - x / 100), c.curvature) }],
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
    description: "Change income and relative prices to see the budget constraint move.",
    xLabel: "Good X (units)",
    yLabel: "Good Y (units)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "income", label: "Income", min: 60, max: 160, step: 1, value: 100 },
      { key: "px", label: "Price of X", min: 0.6, max: 2, step: 0.05, value: 1 },
      { key: "py", label: "Price of Y", min: 0.6, max: 2, step: 0.05, value: 1 },
    ],
    curves: (c) => [
      { id: "budget", label: "Budget line", color: curveColors[0], fn: (x) => (c.income - c.px * x) / c.py },
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
    xLabel: "Good X (units)",
    yLabel: "Good Y (units)",
    xMin: 1, xMax: 100, yMin: 1, yMax: 100,
    controls: [
      { key: "utility", label: "Utility level", min: 10, max: 80, step: 1, value: 35 },
    ],
    curves: (c) => [
      { id: "ic", label: "Indifference curve", color: curveColors[2], fn: (x) => Math.pow(c.utility / Math.pow(x, 0.5), 2) },
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
      const xStar = c.income / (2 * c.px);
      const yStar = c.income / (2 * c.py);
      const utility = Math.sqrt(Math.max(0.1, xStar * yStar));
      return [
        { id: "budget", label: "Budget line", color: curveColors[0], fn: (x) => (c.income - c.px * x) / c.py },
        { id: "ic", label: "IC at equilibrium", color: curveColors[2], fn: (x) => (utility * utility) / Math.max(x, 0.5) },
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
    description: "Use the competitive-firm revenue identities TR = P × Q and AR = MR = P on a common revenue scale.",
    xLabel: "Output (units)",
    yLabel: "Revenue / Price (₹)",
    xMin: 0, xMax: 10, yMin: 0, yMax: 800,
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
    description: "Explore consumption, autonomous consumption and saving as income changes.",
    xLabel: "Income (₹)",
    yLabel: "Consumption / Saving (₹)",
    xMin: 0, xMax: 100, yMin: -40, yMax: 100,
    controls: [
      { key: "autonomous", label: "Autonomous consumption", min: 5, max: 30, step: 1, value: 15 },
      { key: "mpc", label: "MPC", min: 0.5, max: 0.9, step: 0.01, value: 0.75 },
    ],
    curves: (c) => [
      { id: "c", label: "Consumption", color: curveColors[0], fn: (x) => c.autonomous + c.mpc * x },
      { id: "s", label: "Saving", color: curveColors[1], fn: (x) => x - (c.autonomous + c.mpc * x) },
      { id: "45", label: "45° line", color: "#64748b", fn: (x) => x, dashed: true },
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
    description: "Change autonomous expenditure and MPC to see equilibrium income move.",
    xLabel: "Income / Output (₹)",
    yLabel: "Aggregate Expenditure (₹)",
    xMin: 0, xMax: 120, yMin: 0, yMax: 120,
    controls: [
      { key: "autonomous", label: "Autonomous expenditure", min: 10, max: 50, step: 1, value: 25 },
      { key: "mpc", label: "MPC", min: 0.5, max: 0.9, step: 0.01, value: 0.75 },
    ],
    curves: (c) => [
      { id: "ad", label: "AD / AE", color: curveColors[0], fn: (x) => c.autonomous + c.mpc * x },
      { id: "45", label: "45° line", color: "#64748b", fn: (x) => x, dashed: true },
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
    description: "See how MPC determines the investment multiplier and how an initial investment change affects income.",
    xLabel: "MPC",
    yLabel: "Multiplier (k)",
    xMin: 0.4, xMax: 0.95, yMin: 0, yMax: 25,
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
    description: "Use the liquidity-preference framework with quantity of money on the horizontal axis and a fixed money supply as a vertical line.",
    xLabel: "Quantity of Money (₹ crore)",
    yLabel: "Rate of Interest (%)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
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
    description: "Explore exchange-rate determination using demand and supply of foreign currency.",
    xLabel: "Quantity of Foreign Exchange (units)",
    yLabel: "Exchange Rate (₹ per unit of foreign currency)",
    xMin: 0, xMax: 100, yMin: 0, yMax: 100,
    controls: [
      { key: "dShift", label: "Demand shift", min: -20, max: 20, step: 1, value: 0 },
      { key: "sShift", label: "Supply shift", min: -20, max: 20, step: 1, value: 0 },
    ],
    curves: (c) => [
      { id: "d", label: "Demand for FX", color: curveColors[0], fn: (x) => 88 - 0.7 * x + c.dShift },
      { id: "s", label: "Supply of FX", color: curveColors[1], fn: (x) => 12 + 0.65 * x + c.sShift },
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

function sampleCurve(curve: Curve, p: Pick<Preset, "xMin" | "xMax" | "yMin" | "yMax">): Point[] {
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

function intersections(curves: Curve[], bounds: Pick<Preset, "xMin" | "xMax" | "yMin" | "yMax">): Point[] {
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
/* Economics graph annotations                                                */
/* -------------------------------------------------------------------------- */

function graphAnnotations(preset: Preset, controls: Record<string, number>, curves: Curve[], view: { xMin: number; xMax: number; yMin: number; yMax: number }): Annotation[] {
  const a: Annotation[] = [];
  const dEqQ = (dShift = 0, sShift = 0) => (80 + dShift - sShift) / 1.4;
  const dEqP = (dShift = 0, sShift = 0) => 90 - 0.75 * dEqQ(dShift, sShift) + dShift;

  if (preset.id === "demand-supply") {
    const q0 = dEqQ(), p0 = dEqP();
    const q1 = dEqQ(controls.dShift, controls.sShift), p1 = dEqP(controls.dShift, controls.sShift);
    a.push({ id: "eq-guide-x", x1: q1, y1: 0, x2: q1, y2: p1, text: "Qe₁", tone: "guide" });
    a.push({ id: "eq-guide-y", x1: 0, y1: p1, x2: q1, y2: p1, text: "Pe₁", tone: "guide" });
    a.push({ id: "eq", x1: q1, y1: p1, x2: q1, y2: p1, text: "E₁: New equilibrium", tone: "label" });
    if (controls.dShift > 0) a.push({ id: "d-shift-arrow", x1: 28, y1: 90 - 0.75 * 28, x2: 40, y2: 90 - 0.75 * 40 + controls.dShift, text: "Increase in demand", tone: "arrow" });
    if (controls.dShift < 0) a.push({ id: "d-shift-arrow", x1: 40, y1: 90 - 0.75 * 40 + controls.dShift, x2: 28, y2: 90 - 0.75 * 28, text: "Decrease in demand", tone: "arrow" });
    if (controls.sShift < 0) a.push({ id: "s-shift-arrow", x1: 28, y1: 10 + 0.65 * 28 + controls.sShift, x2: 40, y2: 10 + 0.65 * 40 + controls.sShift, text: "Increase in supply", tone: "arrow" });
    if (controls.sShift > 0) a.push({ id: "s-shift-arrow", x1: 40, y1: 10 + 0.65 * 40 + controls.sShift, x2: 28, y2: 10 + 0.65 * 28, text: "Decrease in supply", tone: "arrow" });
    if (Math.abs(q1 - q0) > 0.25 || Math.abs(p1 - p0) > 0.25) {
      a.push({ id: "old-eq", x1: q0, y1: p0, x2: q0, y2: p0, text: "E₀", tone: "label" });
      a.push({ id: "eq-arrow", x1: q0, y1: p0, x2: q1, y2: p1, text: "Equilibrium shifts", tone: "arrow" });
    }
  }

  if (preset.id === "demand-movement-shift") {
    const determinantSum = controls.income + controls.substitutes - controls.complements + controls.tastes + controls.expectations + controls.buyers;
    const shift = determinantSum * 5;
    const refPrice = 60;
    const qA = Math.max(0, (90 - refPrice) / 0.72), qB = Math.max(0, (90 - controls.price) / 0.72);
    const qC = Math.max(0, (90 + shift - controls.price) / 0.72);
    if (Math.abs(shift) < 0.01) {
      a.push({ id: "A", x1: qA, y1: refPrice, x2: qA, y2: refPrice, text: "A", tone: "label" });
      a.push({ id: "B", x1: qB, y1: controls.price, x2: qB, y2: controls.price, text: "B", tone: "label" });
      a.push({ id: "movement", x1: qA, y1: refPrice, x2: qB, y2: controls.price, text: "Movement along D₀", tone: "arrow" });
      a.push({ id: "qA", x1: qA, y1: 0, x2: qA, y2: refPrice, text: "Q₁", tone: "guide" });
      a.push({ id: "qB", x1: qB, y1: 0, x2: qB, y2: controls.price, text: "Q₂", tone: "guide" });
    } else {
      const q0 = Math.max(0, (90 - controls.price) / 0.72);
      a.push({ id: "A", x1: q0, y1: controls.price, x2: q0, y2: controls.price, text: "A on D₀", tone: "label" });
      a.push({ id: "B", x1: qC, y1: controls.price, x2: qC, y2: controls.price, text: "B on D₁/D₂", tone: "label" });
      a.push({ id: "shift", x1: q0, y1: controls.price + 5, x2: qC, y2: controls.price + 5, text: shift > 0 ? "Increase in demand →" : "← Decrease in demand", tone: "arrow" });
      a.push({ id: "q0", x1: q0, y1: 0, x2: q0, y2: controls.price, text: "Q₁", tone: "guide" });
      a.push({ id: "qc", x1: qC, y1: 0, x2: qC, y2: controls.price, text: "Q₂", tone: "guide" });
    }
  }

  if (preset.id === "supply-movement-shift") {
    const determinantSum = controls.input + controls.related - controls.technology + controls.tax - controls.subsidy + controls.expectations - controls.firms;
    const shift = determinantSum * 5;
    const refPrice = 40;
    const qA = Math.max(0, (refPrice - 8) / 0.72), qB = Math.max(0, (controls.price - 8) / 0.72);
    const qC = Math.max(0, (controls.price - 8 - shift) / 0.72);
    if (Math.abs(shift) < 0.01) {
      a.push({ id: "A", x1: qA, y1: refPrice, x2: qA, y2: refPrice, text: "A", tone: "label" });
      a.push({ id: "B", x1: qB, y1: controls.price, x2: qB, y2: controls.price, text: "B", tone: "label" });
      a.push({ id: "movement", x1: qA, y1: refPrice, x2: qB, y2: controls.price, text: "Movement along S₀", tone: "arrow" });
      a.push({ id: "qA", x1: qA, y1: 0, x2: qA, y2: refPrice, text: "Q₁", tone: "guide" });
      a.push({ id: "qB", x1: qB, y1: 0, x2: qB, y2: controls.price, text: "Q₂", tone: "guide" });
    } else {
      const q0 = Math.max(0, (controls.price - 8) / 0.72);
      a.push({ id: "A", x1: q0, y1: controls.price, x2: q0, y2: controls.price, text: "A on S₀", tone: "label" });
      a.push({ id: "B", x1: qC, y1: controls.price, x2: qC, y2: controls.price, text: "B on S₁/S₂", tone: "label" });
      a.push({ id: "shift", x1: q0, y1: controls.price + 5, x2: qC, y2: controls.price + 5, text: shift < 0 ? "Increase in supply →" : "← Decrease in supply", tone: "arrow" });
      a.push({ id: "q0", x1: q0, y1: 0, x2: q0, y2: controls.price, text: "Q₁", tone: "guide" });
      a.push({ id: "qc", x1: qC, y1: 0, x2: qC, y2: controls.price, text: "Q₂", tone: "guide" });
    }
  }

  if (preset.id === "price-ceiling") {
    const qe = dEqQ(), pe = dEqP(), qd = Math.max(0, (90 - controls.ceiling) / 0.75), qs = Math.max(0, (controls.ceiling - 10) / 0.65);
    const binding = controls.ceiling < pe;
    a.push({ id: "eq", x1: qe, y1: pe, x2: qe, y2: pe, text: "E: Pe = " + fmt(pe) + ", Qe = " + fmt(qe), tone: "label" });
    a.push({ id: "ceiling-guide", x1: 0, y1: controls.ceiling, x2: Math.max(qd, qs), y2: controls.ceiling, text: binding ? "Binding price ceiling" : "Non-binding price ceiling", tone: "label" });
    if (binding) {
      a.push({ id: "qd", x1: qd, y1: 0, x2: qd, y2: controls.ceiling, text: "Qd = " + fmt(qd), tone: "guide" });
      a.push({ id: "qs", x1: qs, y1: 0, x2: qs, y2: controls.ceiling, text: "Qs = " + fmt(qs), tone: "guide" });
      a.push({ id: "shortage", x1: qs, y1: controls.ceiling - 4, x2: qd, y2: controls.ceiling - 4, text: "Shortage = " + fmt(qd - qs) + " units", tone: "arrow" });
    }
  }

  if (preset.id === "price-floor") {
    const qe = dEqQ(), pe = dEqP(), qd = Math.max(0, (90 - controls.floor) / 0.75), qs = Math.max(0, (controls.floor - 10) / 0.65);
    const binding = controls.floor > pe;
    a.push({ id: "eq", x1: qe, y1: pe, x2: qe, y2: pe, text: "E: Pe = " + fmt(pe) + ", Qe = " + fmt(qe), tone: "label" });
    a.push({ id: "floor-guide", x1: 0, y1: controls.floor, x2: Math.max(qd, qs), y2: controls.floor, text: binding ? "Binding price floor" : "Non-binding price floor", tone: "label" });
    if (binding) {
      a.push({ id: "qd", x1: qd, y1: 0, x2: qd, y2: controls.floor, text: "Qd = " + fmt(qd), tone: "guide" });
      a.push({ id: "qs", x1: qs, y1: 0, x2: qs, y2: controls.floor, text: "Qs = " + fmt(qs), tone: "guide" });
      a.push({ id: "surplus", x1: qd, y1: controls.floor + 4, x2: qs, y2: controls.floor + 4, text: "Surplus = " + fmt(qs - qd) + " units", tone: "arrow" });
    }
  }

  if (preset.id === "consumer-equilibrium") {
    const xStar = controls.income / (2 * controls.px), yStar = controls.income / (2 * controls.py);
    const xIntercept = controls.income / controls.px, yIntercept = controls.income / controls.py;
    a.push({ id: "xint", x1: xIntercept, y1: 0, x2: xIntercept, y2: 0, text: "X-intercept = I / Px", tone: "label" });
    a.push({ id: "yint", x1: 0, y1: yIntercept, x2: 0, y2: yIntercept, text: "Y-intercept = I / Py", tone: "label" });
    a.push({ id: "ce", x1: xStar, y1: yStar, x2: xStar + 10, y2: yStar + 10, text: "E: Consumer equilibrium", tone: "label" });
    a.push({ id: "tangent", x1: xStar - 12, y1: yStar + (controls.px / controls.py) * 12, x2: xStar + 12, y2: yStar - (controls.px / controls.py) * 12, text: "Tangency: MRS = Px / Py", tone: "guide" });
  }

  if (preset.id === "ppc") {
    a.push({ id: "xIntercept", x1: 100, y1: 0, x2: 100, y2: 0, text: "X-intercept: maximum Good X", tone: "label" });
    a.push({ id: "yIntercept", x1: 0, y1: 100, x2: 0, y2: 100, text: "Y-intercept: maximum Good Y", tone: "label" });
    a.push({ id: "inside", x1: 35, y1: 30, x2: 48, y2: 30, text: "B: attainable but inefficient", tone: "label" });
    a.push({ id: "outside", x1: 70, y1: 75, x2: 82, y2: 75, text: "C: unattainable", tone: "label" });
    a.push({ id: "efficient", x1: 52, y1: 48, x2: 64, y2: 42, text: "A: efficient combination", tone: "label" });
    a.push({ id: "opp", x1: 50, y1: 0, x2: 58, y2: 0, text: "Opportunity cost of more Good X", tone: "arrow" });
  }

  if (preset.id === "tp-ap-mp") {
    const tp = (x: number) => controls.productivity * (10 * x + 4 * x * x - 0.35 * x * x * x);
    const xTP = (8 + Math.sqrt(64 + 42)) / 2.1;
    a.push({ id: "tpmax", x1: xTP, y1: 0, x2: xTP, y2: tp(xTP), text: "TP maximum: MP = 0", tone: "guide" });
    const apx = 4 / 0.7;
    a.push({ id: "apmax", x1: apx, y1: 0, x2: apx, y2: tp(apx) / apx, text: "AP maximum: MP = AP", tone: "guide" });
    a.push({ id: "negative", x1: 10.5, y1: 10, x2: 9.5, y2: 2, text: "MP < 0 after TP maximum", tone: "arrow" });
  }

  if (preset.id === "producer-equilibrium" || preset.id === "perfect-competition-firm") {
    const price = controls.price;
    const scale = controls.scale ?? 1;
    const mc = (x: number) => scale * (8 - 0.56 * x + 0.0105 * x * x);
    const roots = [];
    for (let i = 1; i < 100; i += 0.25) {
      const a1 = mc(i) - price, b1 = mc(i + 0.25) - price;
      if (a1 * b1 <= 0) roots.push(i + 0.25 * Math.abs(a1) / (Math.abs(a1) + Math.abs(b1) || 1));
    }
    const q = roots.find((x) => x > 25) ?? roots[0] ?? 50;
    a.push({ id: "pe", x1: q, y1: price, x2: q, y2: 0, text: "Equilibrium output Q* = " + fmt(q), tone: "guide" });
    a.push({ id: "mceq", x1: q - 12, y1: price + 10, x2: q, y2: price, text: "MR = MC", tone: "arrow" });
  }

  if (preset.id === "money-demand") {
    const q = controls.supply, r = 92 - 0.85 * q + controls.demandShift;
    a.push({ id: "moneyeq", x1: q, y1: r, x2: q, y2: 0, text: "Money-market equilibrium: i = " + fmt(r) + "%", tone: "guide" });
  }

  if (preset.id === "income-equilibrium") {
    const q = controls.autonomous / (1 - controls.mpc);
    a.push({ id: "incomeeq", x1: q, y1: q, x2: q, y2: 0, text: "Equilibrium income Y* = " + fmt(q), tone: "guide" });
  }

  return a;
}

/* -------------------------------------------------------------------------- */
/* Custom Diagrams                                                            */
/* -------------------------------------------------------------------------- */

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
  const W = 900, H = 600, P = 70;
  const innerW = W - 2 * P, panelH = 210;
  const x = (q: number) => P + (q / 10) * innerW;
  const y = (u: number, top: number) => top + panelH - (Math.max(0, Math.min(150, u)) / 150) * panelH;
  const initial = controls.initial ?? 30, decline = controls.decline ?? 1.8;
  const mu = (q: number) => initial - decline * q;
  const tu = (q: number) => initial * q - 0.5 * decline * q * q;
  const path = (fn: (q: number) => number, top: number) => {
    let d = '';
    for (let i = 0; i <= 220; i++) {
      const q = i / 22;
      const px = x(q), py = y(fn(q), top);
      d += (i ? ' L ' : 'M ') + px.toFixed(2) + ' ' + py.toFixed(2);
    }
    return d;
  };
  const qMax = Math.min(10, initial / decline);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Marginal utility and total utility">
        <defs>
          <marker id="econ-arrow-mu" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#334155" />
          </marker>
        </defs>
        <line x1={P} x2={W - P} y1={60} y2={60} stroke="#334155" strokeWidth="2" markerEnd="url(#econ-arrow-mu)" />
        <text x={W / 2} y={42} textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">Marginal Utility (MU) · Units consumed</text>
        <line x1={P} x2={W - P} y1={60 + panelH} y2={60 + panelH} stroke="#334155" strokeWidth="2" markerEnd="url(#econ-arrow-mu)" />
        <text x={W / 2} y={60 + panelH + 28} textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">Total Utility (TU) · Units consumed</text>
        <line x1={P} x2={P} y1={60} y2={60 + 2 * panelH + 45} stroke="#334155" strokeWidth="2" markerEnd="url(#econ-arrow-mu)" />
        <text x={20} y={300} transform="rotate(-90 20 300)" textAnchor="middle" fontSize="15" fontWeight="700" fill="#334155">Utility (utils)</text>
        {[0, 2, 4, 6, 8, 10].map((q) => (
          <g key={q}>
            <text x={x(q)} y={54} textAnchor="middle" fontSize="11" fill="#64748b">{q}</text>
            <text x={x(q)} y={60 + panelH - 6} textAnchor="middle" fontSize="11" fill="#64748b">{q}</text>
          </g>
        ))}
        {[0, 30, 60, 90, 120, 150].map((u) => (
          <text key={u} x={P - 10} y={y(u, 60) + 4} textAnchor="end" fontSize="11" fill="#64748b">{u}</text>
        ))}
        <path d={path(mu, 60)} fill="none" stroke="#2563eb" strokeWidth="4" />
        <path d={path(tu, 60 + panelH)} fill="none" stroke="#dc2626" strokeWidth="4" />
        <line x1={x(qMax)} x2={x(qMax)} y1={60} y2={60 + 2 * panelH} stroke="#94a3b8" strokeDasharray="5 5" />
        <text x={x(qMax) + 8} y={94} fontSize="12" fontWeight="700" fill="#2563eb">MU = 0</text>
        <text x={x(qMax) + 8} y={60 + panelH + 40} fontSize="12" fontWeight="700" fill="#dc2626">TU maximum</text>
        <text x={P + 10} y={y(mu(2), 60) - 12} fontSize="13" fontWeight="700" fill="#2563eb">MU curve</text>
        <text x={P + 10} y={y(tu(2), 60 + panelH) - 12} fontSize="13" fontWeight="700" fill="#dc2626">TU curve</text>
      </svg>
    </div>
  );
}

function ProductionSystemDiagram({ controls }: { controls: Record<string, number> }) {
  const W = 900, H = 720, P = 72, plotW = W - 2 * P;
  const productivity = controls.productivity ?? 1;
  const x = (q: number) => P + (q / 12) * plotW;
  const tp = (q: number) => productivity * (10 * q + 4 * q * q - 0.35 * q * q * q);
  const ap = (q: number) => (q <= 0 ? 0 : tp(q) / q);
  const mp = (q: number) => productivity * (10 + 8 * q - 1.05 * q * q);
  const yTop = (v: number) => 55 + 245 - (Math.max(0, Math.min(170, v)) / 170) * 245;
  const yBot = (v: number) => 410 + 245 - (Math.max(0, Math.min(35, v)) / 35) * 245;
  const path = (fn: (q: number) => number, yf: (v: number) => number) => {
    let d = '';
    for (let i = 0; i <= 240; i++) {
      const q = i / 20;
      const px = x(q), py = yf(fn(q));
      d += (i ? ' L ' : 'M ') + px.toFixed(2) + ' ' + py.toFixed(2);
    }
    return d;
  };
  const qTP = (8 + Math.sqrt(106)) / 2.1;
  const qAP = 4 / 0.7;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="TP, AP and MP production relationship">
        <defs>
          <marker id="production-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
          </marker>
        </defs>
        <text x={W / 2} y="27" textAnchor="middle" fontSize="17" fontWeight="800" fill="#0f172a">Total Product (TP)</text>
        <line x1={P} x2={W - P} y1="300" y2="300" stroke="#334155" strokeWidth="2" markerEnd="url(#production-arrow)" />
        <line x1={P} x2={P} y1="55" y2="300" stroke="#334155" strokeWidth="2" markerEnd="url(#production-arrow)" />
        <text x={W / 2} y="322" textAnchor="middle" fontSize="13" fontWeight="700">Variable input (units)</text>
        <text x="18" y="177" transform="rotate(-90 18 177)" textAnchor="middle" fontSize="13" fontWeight="700">Total product (units)</text>
        <path d={path(tp, yTop)} fill="none" stroke={curveColors[0]} strokeWidth="4" />
        <line x1={x(qTP)} x2={x(qTP)} y1={yTop(tp(qTP))} y2="300" stroke="#94a3b8" strokeDasharray="5 5" />
        <circle cx={x(qTP)} cy={yTop(tp(qTP))} r="6" fill="#0f172a" />
        <text x={x(qTP) + 9} y={yTop(tp(qTP)) - 12} fontSize="12" fontWeight="700" fill="#0f172a">TP maximum</text>
        <text x={x(qTP) + 9} y={yTop(tp(qTP)) + 5} fontSize="11" fill="#475569">MP = 0</text>
        <text x={x(7.4)} y={yTop(tp(7.4)) - 10} fontSize="13" fontWeight="700" fill={curveColors[0]}>TP</text>
        <text x={x(9.3)} y={yTop(tp(9.3)) + 28} fontSize="12" fill="#475569">TP falls when MP becomes negative</text>

        <text x={W / 2} y="382" textAnchor="middle" fontSize="17" fontWeight="800" fill="#0f172a">Average Product (AP) and Marginal Product (MP)</text>
        <line x1={P} x2={W - P} y1="655" y2="655" stroke="#334155" strokeWidth="2" markerEnd="url(#production-arrow)" />
        <line x1={P} x2={P} y1="410" y2="655" stroke="#334155" strokeWidth="2" markerEnd="url(#production-arrow)" />
        <text x={W / 2} y="677" textAnchor="middle" fontSize="13" fontWeight="700">Variable input (units)</text>
        <text x="18" y="532" transform="rotate(-90 18 532)" textAnchor="middle" fontSize="13" fontWeight="700">Product per unit of input</text>
        <path d={path(ap, yBot)} fill="none" stroke={curveColors[1]} strokeWidth="4" />
        <path d={path(mp, yBot)} fill="none" stroke={curveColors[2]} strokeWidth="4" />
        <line x1={x(qAP)} x2={x(qAP)} y1={yBot(ap(qAP))} y2="655" stroke="#94a3b8" strokeDasharray="5 5" />
        <circle cx={x(qAP)} cy={yBot(ap(qAP))} r="6" fill="#0f172a" />
        <text x={x(qAP) + 9} y={yBot(ap(qAP)) - 13} fontSize="12" fontWeight="700" fill="#0f172a">AP maximum</text>
        <text x={x(qAP) + 9} y={yBot(ap(qAP)) + 4} fontSize="11" fill="#475569">MP = AP</text>
        <text x={x(qAP / 2)} y="430" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">Stage I · Increasing returns</text>
        <text x={x((qAP + qTP) / 2)} y="430" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">Stage II · Diminishing returns</text>
        <text x={x((qTP + 12) / 2)} y="430" textAnchor="middle" fontSize="12" fontWeight="700" fill="#475569">Stage III · Negative returns</text>
        <text x={x(8.2)} y={yBot(ap(8.2)) - 10} fontSize="13" fontWeight="700" fill={curveColors[1]}>AP</text>
        <text x={x(8.2)} y={yBot(mp(8.2)) + 18} fontSize="13" fontWeight="700" fill={curveColors[2]}>MP</text>
      </svg>
    </div>
  );
}

function CostSystemDiagram({ controls }: { controls: Record<string, number> }) {
  const W = 900, H = 760, P = 72, plotW = W - 2 * P;
  const fixed = controls.fixed ?? 40, scale = controls.scale ?? 1;
  const x = (q: number) => P + (q / 80) * plotW;
  const tvc = (q: number) => scale * (0.8 * q - 0.025 * q * q + 0.0005 * q * q * q);
  const tc = (q: number) => fixed + tvc(q);
  const avc = (q: number) => scale * (0.8 - 0.025 * q + 0.0005 * q * q);
  const afc = (q: number) => (q < 5 ? 6 : fixed / q);
  const ac = (q: number) => avc(q) + afc(q);
  const mc = (q: number) => scale * (0.8 - 0.05 * q + 0.0015 * q * q);
  const yTop = (v: number) => 55 + 245 - (Math.max(0, Math.min(130, v)) / 130) * 245;
  const yBot = (v: number) => 405 + 285 - (Math.max(0, Math.min(6, v)) / 6) * 285;
  const path = (fn: (q: number) => number, yf: (v: number) => number) => {
    let d = '';
    for (let i = 0; i <= 240; i++) {
      const q = i / 3;
      const px = x(q), py = yf(fn(q));
      d += (i ? ' L ' : 'M ') + px.toFixed(2) + ' ' + py.toFixed(2);
    }
    return d;
  };
  const qAVC = 25;
  const qAC = 44.87;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Short-run total and per-unit cost relationships">
        <defs>
          <marker id="cost-system-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#475569" />
          </marker>
        </defs>
        {/* Top Panel: Total Costs */}
        <text x={W / 2} y="27" textAnchor="middle" fontSize="17" fontWeight="800" fill="#0f172a">
          Total Costs (TC, TVC, TFC)
        </text>
        <line x1={P} x2={W - P} y1="300" y2="300" stroke="#334155" strokeWidth="2" markerEnd="url(#cost-system-arrow)" />
        <line x1={P} x2={P} y1="55" y2="300" stroke="#334155" strokeWidth="2" markerEnd="url(#cost-system-arrow)" />
        <text x={W / 2} y="322" textAnchor="middle" fontSize="13" fontWeight="700">
          Output (units)
        </text>
        <text x="18" y="177" transform="rotate(-90 18 177)" textAnchor="middle" fontSize="13" fontWeight="700">
          Total Cost (₹)
        </text>

        {/* TFC line */}
        <line x1={P} x2={W - P} y1={yTop(fixed)} y2={yTop(fixed)} stroke={curveColors[2]} strokeWidth="3" strokeDasharray="6 4" />
        <text x={W - P - 10} y={yTop(fixed) - 8} fontSize="13" fontWeight="700" fill={curveColors[2]} textAnchor="end">
          TFC
        </text>

        {/* TVC path */}
        <path d={path(tvc, yTop)} fill="none" stroke={curveColors[1]} strokeWidth="4" />
        <text x={x(70)} y={yTop(tvc(70)) - 10} fontSize="13" fontWeight="700" fill={curveColors[1]}>
          TVC
        </text>

        {/* TC path */}
        <path d={path(tc, yTop)} fill="none" stroke={curveColors[0]} strokeWidth="4" />
        <text x={x(68)} y={yTop(tc(68)) - 10} fontSize="13" fontWeight="700" fill={curveColors[0]}>
          TC
        </text>

        {/* Bottom Panel: Per-Unit Costs */}
        <text x={W / 2} y="382" textAnchor="middle" fontSize="17" fontWeight="800" fill="#0f172a">
          Per-Unit Costs (AC, AVC, AFC, MC)
        </text>
        <line x1={P} x2={W - P} y1="690" y2="690" stroke="#334155" strokeWidth="2" markerEnd="url(#cost-system-arrow)" />
        <line x1={P} x2={P} y1={405} y2="690" stroke="#334155" strokeWidth="2" markerEnd="url(#cost-system-arrow)" />
        <text x={W / 2} y="712" textAnchor="middle" fontSize="13" fontWeight="700">
          Output (units)
        </text>
        <text x="18" y="547" transform="rotate(-90 18 547)" textAnchor="middle" fontSize="13" fontWeight="700">
          Cost per unit (₹)
        </text>

        {/* Curves */}
        <path d={path(afc, yBot)} fill="none" stroke={curveColors[3]} strokeWidth="3" strokeDasharray="5 5" />
        <path d={path(avc, yBot)} fill="none" stroke={curveColors[1]} strokeWidth="4" />
        <path d={path(ac, yBot)} fill="none" stroke={curveColors[0]} strokeWidth="4" />
        <path d={path(mc, yBot)} fill="none" stroke={curveColors[4]} strokeWidth="4" />

        {/* Min AVC indicator */}
        <circle cx={x(qAVC)} cy={yBot(avc(qAVC))} r="5" fill="#0f172a" />
        <line x1={x(qAVC)} x2={x(qAVC)} y1={yBot(avc(qAVC))} y2="690" stroke="#94a3b8" strokeDasharray="4 4" />
        <text x={x(qAVC)} y={yBot(avc(qAVC)) - 12} fontSize="11" fontWeight="700" textAnchor="middle" fill="#0f172a">
          Min AVC (MC = AVC)
        </text>

        {/* Min AC indicator */}
        <circle cx={x(qAC)} cy={yBot(ac(qAC))} r="5" fill="#0f172a" />
        <line x1={x(qAC)} x2={x(qAC)} y1={yBot(ac(qAC))} y2="690" stroke="#94a3b8" strokeDasharray="4 4" />
        <text x={x(qAC)} y={yBot(ac(qAC)) - 12} fontSize="11" fontWeight="700" textAnchor="middle" fill="#0f172a">
          Min AC (MC = AC)
        </text>

        {/* Labels */}
        <text x={x(72)} y={yBot(afc(72)) + 18} fontSize="13" fontWeight="700" fill={curveColors[3]}>
          AFC
        </text>
        <text x={x(72)} y={yBot(avc(72)) - 8} fontSize="13" fontWeight="700" fill={curveColors[1]}>
          AVC
        </text>
        <text x={x(72)} y={yBot(ac(72)) - 10} fontSize="13" fontWeight="700" fill={curveColors[0]}>
          AC
        </text>
        <text x={x(55)} y={yBot(mc(55)) - 10} fontSize="13" fontWeight="700" fill={curveColors[4]}>
          MC
        </text>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Standard Graph Renderer                                                    */
/* -------------------------------------------------------------------------- */

function StandardGraph({ preset, controls }: { preset: Preset; controls: Record<string, number> }) {
  const view = { xMin: preset.xMin, xMax: preset.xMax, yMin: preset.yMin, yMax: preset.yMax };
  const curves = preset.curves(controls);
  const points = intersections(curves, view);
  const annos = graphAnnotations(preset, controls, curves, view);

  const W = 800, H = 500, P = 60;
  const toSvgX = (x: number) => P + ((x - view.xMin) / (view.xMax - view.xMin)) * (W - 2 * P);
  const toSvgY = (y: number) => H - P - ((y - view.yMin) / (view.yMax - view.yMin)) * (H - 2 * P);

  const xTicks = ticks(view.xMin, view.xMax);
  const yTicks = ticks(view.yMin, view.yMax);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={preset.title}>
        <defs>
          <marker id="econ-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#475569" />
          </marker>
        </defs>

        {/* Grid lines */}
        {xTicks.map((xt) => (
          <line key={`gx-${xt}`} x1={toSvgX(xt)} x2={toSvgX(xt)} y1={toSvgY(view.yMin)} y2={toSvgY(view.yMax)} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {yTicks.map((yt) => (
          <line key={`gy-${yt}`} x1={toSvgX(view.xMin)} x2={toSvgX(view.xMax)} y1={toSvgY(yt)} y2={toSvgY(yt)} stroke="#f1f5f9" strokeWidth="1" />
        ))}

        {/* Axes */}
        <line x1={P} x2={W - P + 15} y1={H - P} y2={H - P} stroke="#334155" strokeWidth="2" markerEnd="url(#econ-arrow)" />
        <line x1={P} x2={P} y1={H - P} y2={P - 15} stroke="#334155" strokeWidth="2" markerEnd="url(#econ-arrow)" />

        {/* Axis Labels */}
        <text x={W - P + 15} y={H - P + 35} textAnchor="end" fontSize="13" fontWeight="600" fill="#334155">
          {preset.xLabel}
        </text>
        <text x={P - 10} y={P - 25} textAnchor="start" fontSize="13" fontWeight="600" fill="#334155">
          {preset.yLabel}
        </text>

        {/* Ticks */}
        {xTicks.map((xt) => (
          <g key={`tx-${xt}`}>
            <line x1={toSvgX(xt)} x2={toSvgX(xt)} y1={H - P} y2={H - P + 5} stroke="#475569" />
            <text x={toSvgX(xt)} y={H - P + 20} textAnchor="middle" fontSize="11" fill="#64748b">
              {fmt(xt)}
            </text>
          </g>
        ))}
        {yTicks.map((yt) => (
          <g key={`ty-${yt}`}>
            <line x1={P - 5} x2={P} y1={toSvgY(yt)} y2={toSvgY(yt)} stroke="#475569" />
            <text x={P - 10} y={toSvgY(yt) + 4} textAnchor="end" fontSize="11" fill="#64748b">
              {fmt(yt)}
            </text>
          </g>
        ))}

        {/* Curves */}
        {curves.map((curve) => {
          const sampled = sampleCurve(curve, view);
          let pathStr = '';
          sampled.forEach((pt, idx) => {
            if (Number.isNaN(pt.x) || Number.isNaN(pt.y)) return;
            const sx = toSvgX(pt.x);
            const sy = toSvgY(pt.y);
            pathStr += pathStr === '' || sampled[idx - 1]?.x === undefined || Number.isNaN(sampled[idx - 1].x)
              ? `M ${sx.toFixed(2)} ${sy.toFixed(2)}`
              : ` L ${sx.toFixed(2)} ${sy.toFixed(2)}`;
          });

          return (
            <g key={curve.id}>
              <path
                d={pathStr}
                fill="none"
                stroke={curve.color}
                strokeWidth="3.5"
                strokeDasharray={curve.dashed ? "6 4" : undefined}
              />
              {/* Curve Label at last valid point */}
              {(() => {
                const lastPt = [...sampled].reverse().find((p) => !Number.isNaN(p.x) && !Number.isNaN(p.y));
                if (!lastPt) return null;
                return (
                  <text
                    x={Math.min(W - P - 10, toSvgX(lastPt.x) + 8)}
                    y={Math.max(P + 15, Math.min(H - P - 10, toSvgY(lastPt.y)))}
                    fill={curve.color}
                    fontSize="13"
                    fontWeight="700"
                  >
                    {curve.label}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* Annotations */}
        {annos.map((ann) => {
          const sx1 = toSvgX(ann.x1), sy1 = toSvgY(ann.y1);
          const sx2 = ann.x2 !== undefined ? toSvgX(ann.x2) : sx1;
          const sy2 = ann.y2 !== undefined ? toSvgY(ann.y2) : sy1;

          if (ann.tone === "guide") {
            return (
              <g key={ann.id}>
                <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x={sx1 + 4} y={sy1 - 4} fontSize="11" fontWeight="600" fill="#475569">
                  {ann.text}
                </text>
              </g>
            );
          }

          if (ann.tone === "arrow") {
            return (
              <g key={ann.id}>
                <line x1={sx1} y1={sy1} x2={sx2} y2={sy2} stroke="#0f172a" strokeWidth="2" markerEnd="url(#econ-arrow)" />
                <text x={(sx1 + sx2) / 2} y={(sy1 + sy2) / 2 - 8} fontSize="12" fontWeight="700" fill="#0f172a" textAnchor="middle">
                  {ann.text}
                </text>
              </g>
            );
          }

          return (
            <text key={ann.id} x={sx1 + 6} y={sy1 - 6} fontSize="12" fontWeight="700" fill="#0f172a">
              {ann.text}
            </text>
          );
        })}

        {/* Intersections */}
        {points.map((pt, i) => (
          <g key={`pt-${i}`}>
            <circle cx={toSvgX(pt.x)} cy={toSvgY(pt.y)} r="5" fill="#0f172a" stroke="white" strokeWidth="2" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Interactive Economics Explorer Component                              */
/* -------------------------------------------------------------------------- */

export default function EconGraphs() {
  const [selectedId, setSelectedId] = useState<string>("demand-supply");
  const [classFilter, setClassFilter] = useState<"ALL" | "XI" | "XII">("ALL");

  const currentPreset = presets.find((p) => p.id === selectedId) || presets[0];

  const [controlsState, setControlsState] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {};
    presets.forEach((p) => {
      initial[p.id] = {};
      p.controls.forEach((c) => {
        initial[p.id][c.key] = c.value;
      });
    });
    return initial;
  });

  const activeControls = useMemo(() => {
    return controlsState[currentPreset.id] || {};
  }, [controlsState, currentPreset.id]);

  const handleControlChange = (key: string, val: number) => {
    setControlsState((prev) => ({
      ...prev,
      [currentPreset.id]: {
        ...prev[currentPreset.id],
        [key]: val,
      },
    }));
  };

  const handleResetControls = () => {
    setControlsState((prev) => {
      const resetPresetControls: Record<string, number> = {};
      currentPreset.controls.forEach((c) => {
        resetPresetControls[c.key] = c.value;
      });
      return {
        ...prev,
        [currentPreset.id]: resetPresetControls,
      };
    });
  };

  const filteredPresets = presets.filter((p) => classFilter === "ALL" || p.className === classFilter);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Interactive Economics Graph Explorer
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Visualise Microeconomics (Class XI) and Macroeconomics (Class XII) concepts dynamically.
          </p>
        </div>
        {/* Class Filter Tabs */}
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          {(["ALL", "XI", "XII"] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setClassFilter(cls)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                classFilter === cls ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cls === "ALL" ? "All Topics" : `Class ${cls}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar - Topic Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Select Economic Concept ({filteredPresets.length})
            </h2>
            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredPresets.map((p) => {
                const isSelected = p.id === currentPreset.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      isSelected
                        ? "bg-blue-50 text-blue-900 border-2 border-blue-600 shadow-sm"
                        : "hover:bg-slate-50 border border-transparent text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                        Class {p.className}
                      </span>
                      <span className="text-[11px] text-slate-400">{p.unit}</span>
                    </div>
                    <div className="mt-1 text-sm font-bold">{p.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls Panel */}
          {currentPreset.controls.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Interactive Controls</h3>
                <button
                  onClick={handleResetControls}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Reset
                </button>
              </div>
              <div className="space-y-4">
                {currentPreset.controls.map((ctrl) => {
                  const val = activeControls[ctrl.key] ?? ctrl.value;
                  return (
                    <div key={ctrl.key} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-slate-700">
                        <span>{ctrl.label}</span>
                        <span className="font-mono font-bold text-blue-600">
                          {controlDisplayValue(ctrl, val)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={ctrl.min}
                        max={ctrl.max}
                        step={ctrl.step}
                        value={val}
                        onChange={(e) => handleControlChange(ctrl.key, parseFloat(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                Class {currentPreset.className} · {currentPreset.unit}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{currentPreset.title}</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{currentPreset.description}</p>
          </div>

          {/* Graph / Diagram Display */}
          {currentPreset.diagram === "circular-flow" ? (
            <CircularFlowDiagram />
          ) : currentPreset.diagram === "mu-tu" ? (
            <MarginalUtilityDiagram controls={activeControls} />
          ) : currentPreset.diagram === "production-system" ? (
            <ProductionSystemDiagram controls={activeControls} />
          ) : currentPreset.diagram === "cost-system" ? (
            <CostSystemDiagram controls={activeControls} />
          ) : (
            <StandardGraph preset={currentPreset} controls={activeControls} />
          )}

          {/* Economic Interpretation Card */}
          {currentPreset.interpretation.length > 0 && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span> Key Economic Insights
              </h3>
              <ul className="space-y-2">
                {currentPreset.interpretation.map((text, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
