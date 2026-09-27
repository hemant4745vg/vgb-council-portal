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
  diagram?: "circular-flow";
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
    id: "producer-equilibrium",
    title: "Producer Equilibrium · MR = MC",
    className: "XI",
    unit: "Producer Behaviour",
    description:
      "For a competitive firm, change market price and identify the profit-maximising output where the rising MC curve equals MR = AR = P.",
    xLabel: "Output",
    yLabel: "Cost / Revenue",
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
    description:
      "Use price to move along the same demand curve, or change non-price determinants to shift the entire demand curve.",
    xLabel: "Quantity demanded",
    yLabel: "Price",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "price", label: "Price (movement along D)", min: 15, max: 75, step: 1, value: 50 },
      { key: "income", label: "Income", min: -15, max: 15, step: 1, value: 0 },
      { key: "substitutes", label: "Price of substitutes", min: -15, max: 15, step: 1, value: 0 },
      { key: "complements", label: "Price of complements", min: -15, max: 15, step: 1, value: 0 },
      { key: "tastes", label: "Tastes / preferences", min: -15, max: 15, step: 1, value: 0 },
      { key: "expectations", label: "Expectations", min: -15, max: 15, step: 1, value: 0 },
      { key: "buyers", label: "Number of buyers", min: -15, max: 15, step: 1, value: 0 },
    ],
    curves: (c) => {
      const shift = (c.income + c.substitutes - c.complements + c.tastes + c.expectations + c.buyers) / 6;
      return [
        { id: "d0", label: "D₀", color: curveColors[0], fn: (x) => 90 - 0.72 * x },
        { id: "d", label: "D₁ / D₂", color: curveColors[1], fn: (x) => 90 - 0.72 * x + shift, dashed: Math.abs(shift) < 0.01 },
        { id: "price", label: "Price", color: curveColors[2], fn: () => c.price, dashed: true },
      ];
    },
    interpretation: [
      "A change in price causes movement along the same demand curve and changes quantity demanded.",
      "Income, prices of related goods, tastes/preferences, expectations and number of buyers are non-price determinants that shift demand.",
      "A rightward shift means an increase in demand; a leftward shift means a decrease in demand.",
    ],
  },

  {
    id: "supply-movement-shift",
    title: "Movement Along Supply vs Shift in Supply",
    className: "XI",
    unit: "Supply",
    description:
      "Use price to move along the same supply curve, or change non-price determinants to shift the entire supply curve.",
    xLabel: "Quantity supplied",
    yLabel: "Price",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "price", label: "Price (movement along S)", min: 20, max: 80, step: 1, value: 50 },
      { key: "input", label: "Input prices", min: -15, max: 15, step: 1, value: 0 },
      { key: "related", label: "Prices of related goods (net effect)", min: -15, max: 15, step: 1, value: 0 },
      { key: "technology", label: "Technology", min: -15, max: 15, step: 1, value: 0 },
      { key: "tax", label: "Taxes", min: -15, max: 15, step: 1, value: 0 },
      { key: "subsidy", label: "Subsidies", min: -15, max: 15, step: 1, value: 0 },
      { key: "expectations", label: "Expectations", min: -15, max: 15, step: 1, value: 0 },
      { key: "firms", label: "Number of firms", min: -15, max: 15, step: 1, value: 0 },
    ],
    curves: (c) => {
      const shift = (c.input + c.related - c.technology + c.tax - c.subsidy + c.expectations - c.firms) / 7;
      return [
        { id: "s0", label: "S₀", color: curveColors[0], fn: (x) => 8 + 0.72 * x },
        { id: "s", label: "S₁ / S₂", color: curveColors[1], fn: (x) => 8 + 0.72 * x + shift, dashed: Math.abs(shift) < 0.01 },
        { id: "price", label: "Price", color: curveColors[2], fn: () => c.price, dashed: true },
      ];
    },
    interpretation: [
      "A change in price causes movement along the same supply curve and changes quantity supplied.",
      "Input prices, related-good prices, technology, taxes, subsidies, expectations and number of firms are non-price determinants that shift supply.",
      "A rightward shift means an increase in supply; a leftward shift means a decrease in supply.",
    ],
  },

  {
    id: "price-elasticity-demand",
    title: "Price Elasticity of Demand",
    className: "XI",
    unit: "Elasticity of Demand",
    description:
      "Select the degree of price elasticity and then change price to observe the resulting quantity demanded.",
    xLabel: "Quantity demanded",
    yLabel: "Price",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "degree", label: "Degree of elasticity", min: 1, max: 5, step: 1, value: 3 },
      { key: "price", label: "Price", min: 10, max: 90, step: 1, value: 50 },
    ],
    curves: (c) => {
      const degree = Math.round(c.degree);
      if (degree === 1) return [{ id: "d", label: "Perfectly inelastic demand", color: curveColors[0], fn: () => 50, vertical: true, xValue: 50 }, { id: "p", label: "Price", color: curveColors[2], fn: () => c.price, dashed: true }];
      if (degree === 2) return [{ id: "d", label: "Relatively inelastic demand", color: curveColors[0], fn: (x) => 8 + 1.65 * x }, { id: "p", label: "Price", color: curveColors[2], fn: () => c.price, dashed: true }];
      if (degree === 3) return [{ id: "d", label: "Unitary elastic demand", color: curveColors[0], fn: (x) => x <= 0 ? 100 : 10000 / Math.max(x, 1) }, { id: "p", label: "Price", color: curveColors[2], fn: () => c.price, dashed: true }];
      if (degree === 4) return [{ id: "d", label: "Relatively elastic demand", color: curveColors[0], fn: (x) => 92 - 0.55 * x }, { id: "p", label: "Price", color: curveColors[2], fn: () => c.price, dashed: true }];
      return [{ id: "d", label: "Perfectly elastic demand", color: curveColors[0], fn: () => 50 }, { id: "p", label: "Price", color: curveColors[2], fn: () => c.price, dashed: true }];
    },
    interpretation: [
      "Perfectly inelastic demand is vertical: quantity demanded does not respond to price.",
      "Relatively inelastic demand shows a smaller percentage response of quantity demanded than the percentage change in price.",
      "Unitary elasticity means the percentage change in quantity demanded equals the percentage change in price.",
      "Relatively elastic demand shows a larger percentage response of quantity demanded than the percentage change in price.",
      "Perfectly elastic demand is horizontal: an infinitesimal price change produces an extremely large change in quantity demanded.",
    ],
  },

  {
    id: "total-expenditure",
    title: "Total Expenditure Method of PED",
    className: "XI",
    unit: "Elasticity of Demand",
    description:
      "Change price and observe how total expenditure changes along the demand relationship. The turning point represents unitary elasticity in this linear model.",
    xLabel: "Price",
    yLabel: "Total expenditure",
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
    description:
      "Select the degree of price elasticity of supply and change price to observe the response of quantity supplied.",
    xLabel: "Quantity supplied",
    yLabel: "Price",
    xMin: 0,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "degree", label: "Degree of elasticity", min: 1, max: 5, step: 1, value: 3 },
      { key: "price", label: "Price", min: 10, max: 90, step: 1, value: 50 },
    ],
    curves: (c) => {
      const degree = Math.round(c.degree);
      if (degree === 1) return [{ id: "s", label: "Perfectly inelastic supply", color: curveColors[0], fn: () => 50, vertical: true, xValue: 50 }, { id: "p", label: "Price", color: curveColors[2], fn: () => c.price, dashed: true }];
      if (degree === 2) return [{ id: "s", label: "Relatively inelastic supply", color: curveColors[0], fn: (x) => 8 + 1.65 * x }, { id: "p", label: "Price", color: curveColors[2], fn: () => c.price, dashed: true }];
      if (degree === 3) return [{ id: "s", label: "Unitary elastic supply", color: curveColors[0], fn: (x) => x <= 0 ? 0 : 0.01 * x * x }, { id: "p", label: "Price", color: curveColors[2], fn: () => c.price, dashed: true }];
      if (degree === 4) return [{ id: "s", label: "Relatively elastic supply", color: curveColors[0], fn: (x) => 0.25 * x + 8 }, { id: "p", label: "Price", color: curveColors[2], fn: () => c.price, dashed: true }];
      return [{ id: "s", label: "Perfectly elastic supply", color: curveColors[0], fn: () => 50 }, { id: "p", label: "Price", color: curveColors[2], fn: () => c.price, dashed: true }];
    },
    interpretation: [
      "Perfectly inelastic supply is vertical: quantity supplied does not respond to price.",
      "Relatively inelastic supply shows a smaller percentage response of quantity supplied than the percentage change in price.",
      "Unitary elasticity means the percentage change in quantity supplied equals the percentage change in price.",
      "Relatively elastic supply shows a larger percentage response of quantity supplied than the percentage change in price.",
      "Perfectly elastic supply is horizontal at the relevant price.",
    ],
  },

  {
    id: "marginal-utility",
    title: "Marginal Utility & Consumer Equilibrium",
    className: "XI",
    unit: "Consumer Behaviour",
    description:
      "Observe diminishing marginal utility and the point at which MU becomes zero, then connect it to consumer equilibrium.",
    xLabel: "Units consumed",
    yLabel: "Utility",
    xMin: 0,
    xMax: 20,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "initial", label: "Initial MU", min: 35, max: 85, step: 1, value: 70 },
      { key: "decline", label: "Rate of decline", min: 1, max: 5, step: 0.1, value: 3 },
    ],
    curves: (c) => [
      { id: "tu", label: "Total utility", color: curveColors[0], fn: (x) => Math.min(100, c.initial * x - c.decline * x * x) },
      { id: "mu", label: "Marginal utility", color: curveColors[1], fn: (x) => Math.max(0, c.initial - 2 * c.decline * x) },
      { id: "zero", label: "MU = 0", color: "#64748b", fn: () => 0, dashed: true },
    ],
    interpretation: [
      "Marginal utility is the additional utility obtained from one more unit of consumption.",
      "Under diminishing MU, marginal utility falls as consumption increases.",
      "For a single good, utility is maximised when MU reaches zero. For many goods, the consumer-equilibrium condition also uses MU per unit of price.",
    ],
  },

  {
    id: "indifference-map",
    title: "Indifference Map",
    className: "XI",
    unit: "Consumer Behaviour",
    description:
      "Compare several indifference curves and see how higher curves represent higher levels of satisfaction.",
    xLabel: "Good X",
    yLabel: "Good Y",
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
    xLabel: "Output",
    yLabel: "Cost / Revenue",
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
      "Visualise the curriculum relationship between total product, average product and marginal product in the short run.",
    xLabel: "Variable input",
    yLabel: "Product",
    xMin: 0,
    xMax: 12,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "productivity", label: "Productivity scale", min: 0.8, max: 1.2, step: 0.05, value: 1 },
    ],
    curves: (c) => {
      const tp = (x) => c.productivity * 0.4 * (18 * x + 2.4 * x * x - 0.2 * x * x * x);
      const ap = (x) => x <= 0 ? 0 : tp(x) / x;
      const mp = (x) => c.productivity * 0.4 * (18 + 4.8 * x - 0.6 * x * x);
      return [
        { id: "tp", label: "TP", color: curveColors[0], fn: tp },
        { id: "ap", label: "AP", color: curveColors[1], fn: ap },
        { id: "mp", label: "MP", color: curveColors[2], fn: mp },
      ];
    },
    interpretation: [
      "AP = TP / units of the variable input.",
      "MP is the change in TP caused by an additional unit of the variable input, so MP is the slope of TP.",
      "MP intersects AP at AP's maximum. TP reaches its maximum where MP = 0.",
    ],
  },

  {
    id: "cost-curves",
    title: "Short-Run Cost Curves & Relationships",
    className: "XI",
    unit: "Producer Behaviour",
    description:
      "A curriculum-based short-run cost system: AFC, AVC, AC and MC are generated from consistent cost relationships.",
    xLabel: "Output",
    yLabel: "Cost",
    xMin: 1,
    xMax: 100,
    yMin: 0,
    yMax: 100,
    controls: [
      { key: "fixed", label: "Total fixed cost", min: 20, max: 60, step: 1, value: 40 },
      { key: "scale", label: "Variable-cost scale", min: 0.7, max: 1.3, step: 0.01, value: 1 },
    ],
    curves: (c) => {
      const avc = (x) => c.scale * (8 - 0.28 * x + 0.0035 * x * x);
      const mc = (x) => c.scale * (8 - 0.56 * x + 0.0105 * x * x);
      const afc = (x) => c.fixed / x;
      const ac = (x) => afc(x) + avc(x);
      return [
        { id: "afc", label: "AFC", color: curveColors[0], fn: afc },
        { id: "avc", label: "AVC", color: curveColors[1], fn: avc },
        { id: "ac", label: "AC", color: curveColors[2], fn: ac },
        { id: "mc", label: "MC", color: curveColors[3], fn: mc },
      ];
    },
    interpretation: [
      "AFC = TFC / Q, so AFC falls continuously as fixed cost is spread over more output.",
      "AC = AFC + AVC, so AC lies above AVC and the gap between them equals AFC.",
      "MC is the change in total cost or total variable cost from an additional unit of output.",
      "MC cuts AVC at AVC's minimum and AC at AC's minimum in the standard short-run relationship.",
    ],
  },

  {
    id: "revenue",
    title: "TR, AR & MR under Perfect Competition",
    className: "XI",
    unit: "Producer Behaviour",
    description:
      "Use the competitive-firm revenue identities TR = P × Q and AR = MR = P on a common revenue scale.",
    xLabel: "Output",
    yLabel: "Revenue / Price",
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
    xLabel: "Quantity of Money",
    yLabel: "Interest rate",
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
  const midX = (view.xMin + view.xMax) / 2;
  const midY = (view.yMin + view.yMax) / 2;
  if (preset.id === "demand-movement-shift") {
    const price = controls.price;
    const shift = (controls.income + controls.substitutes - controls.complements + controls.tastes + controls.expectations + controls.buyers) / 6;
    const q0 = Math.max(0, (90 - price) / 0.72);
    const q1 = Math.max(0, (90 + shift - price) / 0.72);
    a.push({id:"move",x1:q0,y1:price,x2:Math.max(0,q0-14),y2:price,text:"Movement along D",tone:"arrow"});
    if (Math.abs(shift)>0.5) a.push({id:"shift",x1:55,y1:90-0.72*55,x2:55,y2:90-0.72*55+shift,text:shift>0?"Increase in demand":"Decrease in demand",tone:"arrow"});
    if (Math.abs(q1-q0)>1) a.push({id:"gap",x1:q0,y1:price,x2:q1,y2:price,text:"Change in quantity demanded",tone:"guide"});
  }
  if (preset.id === "supply-movement-shift") {
    const price = controls.price;
    const shift = (controls.input + controls.related - controls.technology + controls.tax - controls.subsidy + controls.expectations - controls.firms) / 7;
    const q0 = Math.max(0, (price-8)/0.72);
    const q1 = Math.max(0, (price-8-shift)/0.72);
    a.push({id:"move",x1:q0,y1:price,x2:Math.min(100,q0+14),y2:price,text:"Movement along S",tone:"arrow"});
    if (Math.abs(shift)>0.5) a.push({id:"shift",x1:55,y1:8+0.72*55,x2:55,y2:8+0.72*55+shift,text:shift<0?"Increase in supply":"Decrease in supply",tone:"arrow"});
    if (Math.abs(q1-q0)>1) a.push({id:"gap",x1:q0,y1:price,x2:q1,y2:price,text:"Change in quantity supplied",tone:"guide"});
  }
  if (preset.id === "price-ceiling") a.push({id:"binding",x1:18,y1:controls.ceiling,x2:35,y2:controls.ceiling,text:"Binding ceiling if below equilibrium",tone:"label"});
  if (preset.id === "price-floor") a.push({id:"binding",x1:18,y1:controls.floor,x2:35,y2:controls.floor,text:"Binding floor if above equilibrium",tone:"label"});
  if (preset.id === "producer-equilibrium" || preset.id === "perfect-competition-firm") a.push({id:"eq",x1:30,y1:controls.price,x2:42,y2:controls.price,text:"Equilibrium: MR = MC",tone:"arrow"});
  if (preset.id === "cost-curves") {
    a.push({id:"mcavc",x1:35,y1:10,x2:48,y2:10,text:"MC cuts AVC at AVC minimum",tone:"label"});
    a.push({id:"mcac",x1:65,y1:35,x2:80,y2:35,text:"MC cuts AC at AC minimum",tone:"label"});
  }
  if (preset.id === "tp-ap-mp") {
    a.push({id:"mp0",x1:10.78,y1:0,x2:10.78,y2:24,text:"TP maximum: MP = 0",tone:"label"});
    a.push({id:"apmp",x1:6,y1:20,x2:7.5,y2:28,text:"MP = AP at AP maximum",tone:"label"});
  }
  if (preset.id === "demand-supply" || preset.id === "forex") a.push({id:"eq",x1:midX-15,y1:midY+15,x2:midX,y2:midY,text:"Market equilibrium",tone:"arrow"});
  if (preset.id === "total-expenditure") {
    const unitPrice = 47.5;
    a.push({id:"unit",x1:unitPrice,y1:5,x2:unitPrice,y2:60,text:"Unit elastic point",tone:"guide"});
    a.push({id:"elastic",x1:18,y1:45,x2:30,y2:58,text:"Elastic region",tone:"label"});
    a.push({id:"inelastic",x1:68,y1:48,x2:82,y2:58,text:"Inelastic region",tone:"label"});
  }
  if (preset.id === "money-demand") a.push({id:"ms",x1:controls.supply,y1:25,x2:controls.supply,y2:55,text:"Fixed money supply",tone:"label"});
  if (preset.id === "excess-deficient-demand") a.push({id:"fe",x1:controls.fullEmployment,y1:15,x2:controls.fullEmployment,y2:45,text:"Full-employment output",tone:"label"});
  if (preset.id === "multiplier") a.push({id:"k",x1:0.75,y1:4,x2:0.82,y2:5.5,text:"Higher MPC → higher k",tone:"arrow"});
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
    () => intersections(curves, view),
    [curves, view.xMin, view.xMax, view.yMin, view.yMax]
  );

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
