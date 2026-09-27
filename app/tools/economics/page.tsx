"use client";

import React, { useState, useMemo } from 'react';

// --- TYPES & INTERFACES ---

export type PresetCategory = 
  | 'Micro: Consumer Behaviour'
  | 'Micro: Demand & Elasticity'
  | 'Micro: Production & Costs'
  | 'Micro: Market Equilibrium'
  | 'Macro: National Income & Multiplier'
  | 'Macro: Money & Foreign Exchange';

export interface SliderControl {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
  discreteValues?: { value: number; label: string }[];
}

export interface CurveConfig {
  id: string;
  name: string;
  color: string;
  dash?: string;
  equation: (x: number, params: Record<string, number>) => number;
}

export interface Preset {
  id: string;
  title: string;
  category: PresetCategory;
  description: string;
  xAxisLabel: string;
  yAxisLabel: string;
  xDomain: [number, number];
  yDomain: [number, number];
  dualPanel?: boolean;
  topYLabel?: string;
  bottomYLabel?: string;
  controls: SliderControl[];
  curves: CurveConfig[];
  takeaways: (params: Record<string, number>) => string[];
  annotations?: (params: Record<string, number>) => {
    x: number;
    y: number;
    text: string;
    color?: string;
    panel?: 'top' | 'bottom' | 'single';
  }[];
}

// --- MATHEMATICAL HELPER FUNCTIONS ---

function sampleCurve(
  eq: (x: number, params: Record<string, number>) => number,
  params: Record<string, number>,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  steps = 600
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const dx = (xMax - xMin) / steps;
  let prevY: number | null = null;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * dx;
    const y = eq(x, params);
    const ySpan = yMax - yMin;

    if (!Number.isFinite(y) || y < yMin - ySpan * 0.1 || y > yMax + ySpan * 0.1) {
      points.push({ x: NaN, y: NaN });
      prevY = null;
      continue;
    }

    if (prevY !== null && Math.abs(y - prevY) > ySpan * 0.4) {
      points.push({ x: NaN, y: NaN });
    }

    points.push({ x, y });
    prevY = y;
  }
  return points;
}

function findIntersection(
  eq1: (x: number, params: Record<string, number>) => number,
  eq2: (x: number, params: Record<string, number>) => number,
  params: Record<string, number>,
  xMin: number,
  xMax: number,
  steps = 600
): { x: number; y: number } | null {
  const dx = (xMax - xMin) / steps;
  let prevDiff: number | null = null;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * dx;
    const y1 = eq1(x, params);
    const y2 = eq2(x, params);
    
    if (!Number.isFinite(y1) || !Number.isFinite(y2)) continue;

    const diff = y1 - y2;
    if (prevDiff !== null && prevDiff * diff <= 0) {
      const prevX = x - dx;
      const t = Math.abs(prevDiff) / (Math.abs(prevDiff) + Math.abs(diff));
      const intersectX = prevX + t * dx;
      return { x: intersectX, y: eq1(intersectX, params) };
    }
    prevDiff = diff;
  }
  return null;
}

// --- CURRICULUM PRESETS DATA ---

const PRESETS: Preset[] = [
  // 1. Demand, Supply & Market Equilibrium
  {
    id: 'market-equilibrium',
    title: 'Demand, Supply & Market Equilibrium',
    category: 'Micro: Market Equilibrium',
    description: 'Dynamic equilibrium shifts. Observe how changes in demand or supply shift equilibrium price and quantity.',
    xAxisLabel: 'Quantity of Commodity X (in units)',
    yAxisLabel: 'Price of Commodity X (in ₹)',
    xDomain: [0, 100],
    yDomain: [0, 100],
    controls: [
      { id: 'demandShift', label: 'Demand Shift (Income/Tastes)', min: -30, max: 30, step: 5, defaultValue: 0 },
      { id: 'supplyShift', label: 'Supply Shift (Technology/Input Costs)', min: -30, max: 30, step: 5, defaultValue: 0 },
    ],
    curves: [
      { id: 'initialD', name: 'Original Demand (D1)', color: '#94a3b8', dash: '4,4', equation: (q) => 90 - 0.8 * q },
      { id: 'initialS', name: 'Original Supply (S1)', color: '#94a3b8', dash: '4,4', equation: (q) => 10 + 0.8 * q },
      { id: 'currentD', name: 'Current Demand (D2)', color: '#2563eb', equation: (q, p) => 90 + p.demandShift - 0.8 * q },
      { id: 'currentS', name: 'Current Supply (S2)', color: '#16a34a', equation: (q, p) => 10 - p.supplyShift + 0.8 * q }
    ],
    takeaways: (p) => [
      `Initial Equilibrium: E1 = (50 units, ₹50).`,
      p.demandShift > 0 ? 'Increase in demand shifts curve rightward (higher P, higher Q).' : p.demandShift < 0 ? 'Decrease in demand shifts curve leftward (lower P, lower Q).' : 'Demand is at baseline.',
      p.supplyShift > 0 ? 'Increase in supply shifts curve rightward (lower P, higher Q).' : p.supplyShift < 0 ? 'Decrease in supply shifts curve leftward (higher P, lower Q).' : 'Supply is at baseline.'
    ]
  },

  // 2. Movement along vs Shift in Demand
  {
    id: 'demand-movement-vs-shift',
    title: 'Movement Along Demand vs. Shift in Demand',
    category: 'Micro: Demand & Elasticity',
    description: 'Distinguish between changes in Quantity Demanded (due to price) and changes in Demand (due to non-price factors).',
    xAxisLabel: 'Quantity Demanded (in units)',
    yAxisLabel: 'Price of Commodity X (in ₹)',
    xDomain: [0, 100],
    yDomain: [0, 100],
    controls: [
      { id: 'price', label: 'Price (Own Price Change)', min: 20, max: 80, step: 2, defaultValue: 50, unit: '₹' },
      { id: 'incomeShift', label: 'Consumer Income (Shift Factor)', min: -20, max: 20, step: 2, defaultValue: 0 }
    ],
    curves: [
      { id: 'baseD', name: 'Base Demand (D1)', color: '#94a3b8', dash: '4,4', equation: (q) => 100 - q },
      { id: 'shiftedD', name: 'Active Demand (D2)', color: '#2563eb', equation: (q, p) => 100 + p.incomeShift - q }
    ],
    takeaways: (p) => [
      `Own Price: ₹${p.price}. Changing Price causes MOVEMENT along the active demand curve.`,
      p.incomeShift !== 0 ? `Income Shift: ${p.incomeShift > 0 ? 'Increase' : 'Decrease'} shifts the ENTIRE curve ${p.incomeShift > 0 ? 'rightward (D2)' : 'leftward (D2)'}.` : 'No shift factor active. Operating on base demand D1.'
    ]
  },

  // 3. Price Elasticity of Demand (5 Discrete States)
  {
    id: 'price-elasticity-demand',
    title: 'Price Elasticity of Demand (Ed)',
    category: 'Micro: Demand & Elasticity',
    description: 'Explore the 5 distinct degrees of Price Elasticity of Demand: Perfectly Inelastic, Inelastic, Unitary, Elastic, and Perfectly Elastic.',
    xAxisLabel: 'Quantity Demanded (in units)',
    yAxisLabel: 'Price of Commodity X (in ₹)',
    xDomain: [0, 100],
    yDomain: [0, 100],
    controls: [
      { 
        id: 'elasticityMode', 
        label: 'Degree of Elasticity (Ed)', 
        min: 0, max: 4, step: 1, defaultValue: 2,
        discreteValues: [
          { value: 0, label: 'Ed = 0 (Perfectly Inelastic)' },
          { value: 1, label: 'Ed < 1 (Inelastic)' },
          { value: 2, label: 'Ed = 1 (Unitary Elastic)' },
          { value: 3, label: 'Ed > 1 (Elastic)' },
          { value: 4, label: 'Ed = ∞ (Perfectly Elastic)' }
        ]
      }
    ],
    curves: [
      {
        id: 'pedCurve',
        name: 'Demand Curve (D)',
        color: '#dc2626',
        equation: (q, p) => {
          const mode = p.elasticityMode;
          if (mode === 0) return q === 50 ? 50 : (q > 49.5 && q < 50.5 ? 50 : NaN); // Vertical represented parametrically
          if (mode === 1) return 150 - 2 * q; // Steep
          if (mode === 2) return 2500 / Math.max(q, 1); // Rectangular Hyperbola (P * Q = 2500)
          if (mode === 3) return 75 - 0.5 * q; // Flat
          if (mode === 4) return 50; // Perfectly Horizontal
          return 100 - q;
        }
      }
    ],
    takeaways: (p) => {
      const mode = p.elasticityMode;
      if (mode === 0) return ['Ed = 0: Perfectly Inelastic Demand.', 'Quantity demanded is completely unresponsive to price changes (Vertical line). Examples: Life-saving drugs, salt.'];
      if (mode === 1) return ['Ed < 1: Relatively Inelastic Demand.', '% change in quantity demanded is LESS than % change in price (Steep curve). Examples: Necessities, electricity.'];
      if (mode === 2) return ['Ed = 1: Unitary Elastic Demand.', '% change in quantity demanded EQUALS % change in price (Rectangular Hyperbola). Total expenditure remains constant.'];
      if (mode === 3) return ['Ed > 1: Relatively Elastic Demand.', '% change in quantity demanded is GREATER than % change in price (Flatter curve). Examples: Luxury items, substitutes.'];
      return ['Ed = ∞: Perfectly Elastic Demand.', 'Consumers purchase infinite quantity at P = ₹50, zero quantity at any price above (Horizontal line).'];
    }
  },

  // 4. Price Elasticity of Supply (5 Discrete States)
  {
    id: 'price-elasticity-supply',
    title: 'Price Elasticity of Supply (Es)',
    category: 'Micro: Demand & Elasticity',
    description: 'Explore the 5 distinct degrees of Price Elasticity of Supply.',
    xAxisLabel: 'Quantity Supplied (in units)',
    yAxisLabel: 'Price of Commodity X (in ₹)',
    xDomain: [0, 100],
    yDomain: [0, 100],
    controls: [
      { 
        id: 'elasticityMode', 
        label: 'Degree of Elasticity (Es)', 
        min: 0, max: 4, step: 1, defaultValue: 2,
        discreteValues: [
          { value: 0, label: 'Es = 0 (Perfectly Inelastic)' },
          { value: 1, label: 'Es < 1 (Inelastic - Y-intercept)' },
          { value: 2, label: 'Es = 1 (Unitary - Origin Ray)' },
          { value: 3, label: 'Es > 1 (Elastic - X-intercept)' },
          { value: 4, label: 'Es = ∞ (Perfectly Elastic)' }
        ]
      }
    ],
    curves: [
      {
        id: 'pesCurve',
        name: 'Supply Curve (S)',
        color: '#16a34a',
        equation: (q, p) => {
          const mode = p.elasticityMode;
          if (mode === 0) return q === 50 ? 50 : NaN;
          if (mode === 1) return 20 + 1.2 * q; // Cuts Y-axis (Inelastic)
          if (mode === 2) return 1.0 * q; // Passes through origin (Es = 1)
          if (mode === 3) return Math.max(0, -15 + 0.7 * q); // Cuts X-axis (Elastic)
          if (mode === 4) return 50; // Horizontal
          return q;
        }
      }
    ],
    takeaways: (p) => {
      const mode = p.elasticityMode;
      if (mode === 0) return ['Es = 0: Perfectly Inelastic Supply. Output fixed regardless of price (e.g., rare antiques, land).'];
      if (mode === 1) return ['Es < 1: Inelastic Supply. Straight line cutting the positive Y-axis (%ΔQ < %ΔP).'];
      if (mode === 2) return ['Es = 1: Unitary Elastic Supply. Any straight line passing through the ORIGIN has Es = 1.'];
      if (mode === 3) return ['Es > 1: Elastic Supply. Straight line cutting the positive X-axis (%ΔQ > %ΔP).'];
      return ['Es = ∞: Perfectly Elastic Supply. Infinite supply available at P = ₹50.'];
    }
  },

  // 5. Total Utility & Marginal Utility Relationship (Stacked Dual Panel)
  {
    id: 'tu-mu-relationship',
    title: 'Relationship Between Total & Marginal Utility',
    category: 'Micro: Consumer Behaviour',
    description: 'Class 11 Textbook Dual-Plot: Top chart shows Total Utility (TU); Bottom chart shows Marginal Utility (MU).',
    xAxisLabel: 'Units of Commodity Consumed (Q)',
    yAxisLabel: 'Utility (in utils)',
    xDomain: [0, 10],
    yDomain: [-10, 40],
    dualPanel: true,
    topYLabel: 'Total Utility (TU)',
    bottomYLabel: 'Marginal Utility (MU)',
    controls: [
      { id: 'satietyPoint', label: 'Point of Satiety (Q*)', min: 4, max: 8, step: 1, defaultValue: 6, unit: ' units' }
    ],
    curves: [
      {
        id: 'tuCurve',
        name: 'Total Utility (TU)',
        color: '#2563eb',
        equation: (q, p) => {
          const qStar = p.satietyPoint;
          const a = 36 / (qStar * qStar);
          return Math.max(-10, 2 * a * qStar * q - a * q * q);
        }
      },
      {
        id: 'muCurve',
        name: 'Marginal Utility (MU)',
        color: '#dc2626',
        equation: (q, p) => {
          const qStar = p.satietyPoint;
          const a = 36 / (qStar * qStar);
          return 2 * a * qStar - 2 * a * q;
        }
      }
    ],
    takeaways: (p) => [
      `1. When MU is positive, TU increases at a diminishing rate (Q = 0 to ${p.satietyPoint - 1}).`,
      `2. Point of Satiety: At Q = ${p.satietyPoint} units, TU reaches maximum and MU = 0.`,
      `3. When MU becomes negative (Q > ${p.satietyPoint}), TU begins to fall.`
    ]
  },

  // 6. Production Possibility Curve (PPC)
  {
    id: 'ppc-curve',
    title: 'Production Possibility Curve (PPC / PPF)',
    category: 'Micro: Consumer Behaviour',
    description: 'Illustrates scarcity, choice, opportunity cost, and Marginal Rate of Transformation (MRT).',
    xAxisLabel: 'Quantity of Good X (in units)',
    yAxisLabel: 'Quantity of Good Y (in units)',
    xDomain: [0, 100],
    yDomain: [0, 100],
    controls: [
      { id: 'techX', label: 'Tech Growth in Good X', min: 0, max: 30, step: 5, defaultValue: 0 },
      { id: 'resources', label: 'Overall Resource Level', min: -20, max: 20, step: 5, defaultValue: 0 }
    ],
    curves: [
      {
        id: 'basePPC',
        name: 'Base PPC',
        color: '#94a3b8',
        dash: '4,4',
        equation: (x) => Math.sqrt(Math.max(0, 10000 - x * x)) * 0.8
      },
      {
        id: 'activePPC',
        name: 'Current PPC',
        color: '#0284c7',
        equation: (x, p) => {
          const xMax = 100 + p.techX + p.resources;
          const yMax = 80 + p.resources;
          const normX = x / Math.max(1, xMax);
          return Math.sqrt(Math.max(0, 1 - normX * normX)) * yMax;
        }
      }
    ],
    takeaways: (p) => [
      'Concave Shape: PPC is concave to origin due to increasing Marginal Rate of Transformation (MRT = ΔY / ΔX).',
      p.techX > 0 ? `Technology growth in X rotates the PPC outward along the X-axis.` : 'PPC represents maximum obtainable combinations given fixed resources.',
      p.resources !== 0 ? `Resource change (${p.resources > 0 ? 'Increase' : 'Decrease'}) shifts the entire PPC ${p.resources > 0 ? 'outward' : 'inward'}.` : 'Points inside PPC = Underutilization; Points outside = Unattainable.'
    ]
  },

  // 7. Indifference Curve Map & Consumer Equilibrium
  {
    id: 'indifference-curve-equilibrium',
    title: 'Indifference Curve & Consumer Equilibrium',
    category: 'Micro: Consumer Behaviour',
    description: 'Consumer Equilibrium occurs where Budget Line is tangent to the highest attainable Indifference Curve (MRSxy = Px/Py).',
    xAxisLabel: 'Quantity of Commodity X (units)',
    yAxisLabel: 'Quantity of Commodity Y (units)',
    xDomain: [0, 100],
    yDomain: [0, 100],
    controls: [
      { id: 'income', label: 'Consumer Income (M)', min: 40, max: 90, step: 5, defaultValue: 60, unit: '₹' },
      { id: 'priceX', label: 'Price of Good X (Px)', min: 0.5, max: 2.0, step: 0.25, defaultValue: 1.0, unit: '₹' }
    ],
    curves: [
      { id: 'ic1', name: 'IC1 (Lower Utility)', color: '#cbd5e1', dash: '3,3', equation: (x) => 1200 / (x + 10) - 5 },
      { id: 'ic2', name: 'IC2 (Optimal Utility)', color: '#a855f7', equation: (x, p) => 1800 / (x + 15) - 5 },
      { id: 'ic3', name: 'IC3 (Unattainable)', color: '#cbd5e1', dash: '3,3', equation: (x) => 2600 / (x + 20) - 5 },
      { id: 'budget', name: 'Budget Line (M = Px·X + Py·Y)', color: '#16a34a', equation: (x, p) => (p.income - p.priceX * x) / 0.8 }
    ],
    takeaways: (p) => [
      `Budget Line Slope = Px / Py = ${(p.priceX / 0.8).toFixed(2)}.`,
      'Equilibrium Condition: Slope of IC (MRSxy) EQUALS Slope of Budget Line (Px/Py).',
      'Indifference curves are convex to the origin due to diminishing Marginal Rate of Substitution (MRS).'
    ]
  },

  // 8. TP, AP & MP (Law of Variable Proportions - Stacked)
  {
    id: 'law-variable-proportions',
    title: 'Total, Average & Marginal Product (TP, AP, MP)',
    category: 'Micro: Production & Costs',
    description: 'Law of Variable Proportions in Short-Run Production. Stacked graph showing Phase I, II, and III.',
    xAxisLabel: 'Variable Input (Labor - L)',
    yAxisLabel: 'Product Output (Units)',
    xDomain: [0, 12],
    yDomain: [-10, 70],
    dualPanel: true,
    topYLabel: 'Total Product (TP)',
    bottomYLabel: 'AP & MP Output',
    controls: [
      { id: 'techLevel', label: 'Technology / Efficiency', min: 0.8, max: 1.4, step: 0.1, defaultValue: 1.0 }
    ],
    curves: [
      {
        id: 'tpCurve',
        name: 'Total Product (TP)',
        color: '#2563eb',
        equation: (L, p) => {
          const k = p.techLevel;
          return Math.max(-5, k * (6 * L * L - 0.5 * L * L * L));
        }
      },
      {
        id: 'apCurve',
        name: 'Average Product (AP = TP/L)',
        color: '#16a34a',
        equation: (L, p) => {
          if (L <= 0.2) return 0;
          const k = p.techLevel;
          return k * (6 * L - 0.5 * L * L);
        }
      },
      {
        id: 'mpCurve',
        name: 'Marginal Product (MP = dTP/dL)',
        color: '#dc2626',
        equation: (L, p) => {
          const k = p.techLevel;
          return k * (12 * L - 1.5 * L * L);
        }
      }
    ],
    takeaways: (p) => [
      'Phase I (Increasing Returns): TP increases at an increasing rate; MP rises to its peak.',
      'Phase II (Diminishing Returns): MP falls but remains positive; AP reaches max where MP = AP (L = 4). TP reaches max where MP = 0 (L = 8).',
      'Phase III (Negative Returns): MP becomes negative; TP begins to fall (L > 8).'
    ]
  },

  // 9. Short-Run Cost Curves (AC, AVC, AFC, MC)
  {
    id: 'short-run-cost-curves',
    title: 'Short-Run Unit Cost Curves (AC, AVC, AFC, MC)',
    category: 'Micro: Production & Costs',
    description: 'Comprehensive relationships: MC intersects AVC and AC at their respective minimum points. AFC is a rectangular hyperbola.',
    xAxisLabel: 'Output Quantity (Q in units)',
    yAxisLabel: 'Cost per Unit (in ₹)',
    xDomain: [0, 20],
    yDomain: [0, 50],
    controls: [
      { id: 'tfc', label: 'Total Fixed Cost (TFC)', min: 50, max: 150, step: 10, defaultValue: 100, unit: '₹' }
    ],
    curves: [
      { id: 'afc', name: 'AFC (TFC / Q)', color: '#94a3b8', dash: '4,4', equation: (q, p) => p.tfc / Math.max(q, 0.5) },
      { id: 'avc', name: 'AVC (TVC / Q)', color: '#16a34a', equation: (q) => 25 - 2.5 * q + 0.15 * q * q },
      { id: 'ac', name: 'AC / SAC (AFC + AVC)', color: '#2563eb', equation: (q, p) => (p.tfc / Math.max(q, 0.5)) + (25 - 2.5 * q + 0.15 * q * q) },
      { id: 'mc', name: 'MC (dTC / dQ)', color: '#dc2626', equation: (q) => 25 - 5.0 * q + 0.45 * q * q }
    ],
    takeaways: (p) => [
      '1. MC cuts both AVC and AC at their MINIMUM points from below.',
      '2. Vertical distance between AC and AVC equals AFC (gets narrower as Q increases).',
      '3. AFC is a rectangular hyperbola (approaches axes but never touches them).'
    ]
  },

  // 10. Price Ceiling (Government Intervention)
  {
    id: 'price-ceiling',
    title: 'Price Ceiling (Maximum Price Control)',
    category: 'Micro: Market Equilibrium',
    description: 'Government imposes a legal maximum price BELOW market equilibrium (e.g., essential drugs, rent control).',
    xAxisLabel: 'Quantity of Essential Good (in units)',
    yAxisLabel: 'Price per Unit (in ₹)',
    xDomain: [0, 100],
    yDomain: [0, 100],
    controls: [
      { id: 'pCeiling', label: 'Price Ceiling (Pc)', min: 20, max: 45, step: 5, defaultValue: 35, unit: '₹' }
    ],
    curves: [
      { id: 'demand', name: 'Demand Curve (D)', color: '#2563eb', equation: (q) => 90 - 0.8 * q },
      { id: 'supply', name: 'Supply Curve (S)', color: '#16a34a', equation: (q) => 10 + 0.8 * q },
      { id: 'pCeilingLine', name: 'Price Ceiling (Pc)', color: '#dc2626', dash: '6,6', equation: (q, p) => p.pCeiling }
    ],
    takeaways: (p) => {
      const qSupplied = Math.max(0, (p.pCeiling - 10) / 0.8);
      const qDemanded = Math.max(0, (90 - p.pCeiling) / 0.8);
      const shortage = Math.max(0, qDemanded - qSupplied);
      return [
        `Market Equilibrium Price is ₹50. Price Ceiling is set at ₹${p.pCeiling}.`,
        `At Pc = ₹${p.pCeiling}: Quantity Demanded (Qd) = ${qDemanded.toFixed(1)} units; Quantity Supplied (Qs) = ${qSupplied.toFixed(1)} units.`,
        `RESULT: EXCESS DEMAND / SHORTAGE of ${shortage.toFixed(1)} units. Leads to black marketing and rationing.`
      ];
    }
  },

  // 11. Price Floor (Government Intervention)
  {
    id: 'price-floor',
    title: 'Price Floor (Minimum Support Price - MSP)',
    category: 'Micro: Market Equilibrium',
    description: 'Government imposes a legal minimum price ABOVE market equilibrium (e.g., agricultural MSP, minimum wage).',
    xAxisLabel: 'Quantity of Agricultural Crop (in units)',
    yAxisLabel: 'Price per Unit (in ₹)',
    xDomain: [0, 100],
    yDomain: [0, 100],
    controls: [
      { id: 'pFloor', label: 'Price Floor / MSP (Pf)', min: 55, max: 80, step: 5, defaultValue: 65, unit: '₹' }
    ],
    curves: [
      { id: 'demand', name: 'Demand Curve (D)', color: '#2563eb', equation: (q) => 90 - 0.8 * q },
      { id: 'supply', name: 'Supply Curve (S)', color: '#16a34a', equation: (q) => 10 + 0.8 * q },
      { id: 'pFloorLine', name: 'Price Floor (Pf)', color: '#dc2626', dash: '6,6', equation: (q, p) => p.pFloor }
    ],
    takeaways: (p) => {
      const qDemanded = Math.max(0, (90 - p.pFloor) / 0.8);
      const qSupplied = Math.max(0, (p.pFloor - 10) / 0.8);
      const surplus = Math.max(0, qSupplied - qDemanded);
      return [
        `Market Equilibrium Price is ₹50. Minimum Support Price (MSP) set at ₹${p.pFloor}.`,
        `At Pf = ₹${p.pFloor}: Quantity Supplied (Qs) = ${qSupplied.toFixed(1)} units; Quantity Demanded (Qd) = ${qDemanded.toFixed(1)} units.`,
        `RESULT: EXCESS SUPPLY / SURPLUS of ${surplus.toFixed(1)} units. Government must procure surplus to maintain floor price.`
      ];
    }
  },

  // 12. Keynesian 45-Degree Cross (Class 12 Macro)
  {
    id: 'keynesian-cross',
    title: 'Keynesian 45° Income-Output Equilibrium',
    category: 'Macro: National Income & Multiplier',
    description: 'Macroeconomic equilibrium where Aggregate Demand (AD = C + I) equals Aggregate Supply (AS = Y).',
    xAxisLabel: 'National Income / GDP (Y in ₹ Cr)',
    yAxisLabel: 'Aggregate Demand (AD in ₹ Cr)',
    xDomain: [0, 1000],
    yDomain: [0, 1000],
    controls: [
      { id: 'autonomousC', label: 'Autonomous Consumption (C̄)', min: 50, max: 200, step: 25, defaultValue: 100, unit: ' Cr' },
      { id: 'investment', label: 'Autonomous Investment (I)', min: 50, max: 250, step: 25, defaultValue: 100, unit: ' Cr' },
      { id: 'mpc', label: 'Marginal Propensity to Consume (b)', min: 0.5, max: 0.9, step: 0.05, defaultValue: 0.6 }
    ],
    curves: [
      { id: 'asLine', name: 'AS Line (Y = AD) 45°', color: '#94a3b8', dash: '4,4', equation: (y) => y },
      { id: 'adLine', name: 'AD Line (C + I)', color: '#2563eb', equation: (y, p) => (p.autonomousC + p.investment) + p.mpc * y }
    ],
    takeaways: (p) => {
      const autoExpenditure = p.autonomousC + p.investment;
      const eqIncome = autoExpenditure / (1 - p.mpc);
      const multiplier = 1 / (1 - p.mpc);
      return [
        `Equilibrium National Income (Y*) = ₹${eqIncome.toFixed(0)} Cr.`,
        `Investment Multiplier (K) = 1 / (1 - MPC) = ${multiplier.toFixed(2)}.`,
        `An initial increase of ₹25 Cr in Autonomous Investment yields a ₹${(25 * multiplier).toFixed(0)} Cr increase in National Income.`
      ];
    }
  }
];

// --- MAIN GRAPH RENDERER COMPONENT ---

export const EconGraphsInteractive: React.FC = () => {
  const [activePresetId, setActivePresetId] = useState<string>('market-equilibrium');
  const activePreset = useMemo(() => PRESETS.find(p => p.id === activePresetId) || PRESETS[0], [activePresetId]);

  // Dynamic state for sliders
  const [sliderParams, setSliderParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    activePreset.controls.forEach(c => { initial[c.id] = c.defaultValue; });
    return initial;
  });

  // Reset sliders when preset changes
  const handleSelectPreset = (id: string) => {
    setActivePresetId(id);
    const target = PRESETS.find(p => p.id === id);
    if (target) {
      const initial: Record<string, number> = {};
      target.controls.forEach(c => { initial[c.id] = c.defaultValue; });
      setSliderParams(initial);
    }
  };

  const handleSliderChange = (id: string, value: number) => {
    setSliderParams(prev => ({ ...prev, [id]: value }));
  };

  // Plot Dimensions
  const svgWidth = 650;
  const svgHeight = activePreset.dualPanel ? 520 : 420;
  const margin = { top: 30, right: 30, bottom: 50, left: 65 };
  
  // Single or dual panel height allocation
  const topPanelHeight = activePreset.dualPanel ? 200 : svgHeight - margin.top - margin.bottom;
  const bottomPanelHeight = activePreset.dualPanel ? 200 : 0;
  const panelGap = activePreset.dualPanel ? 40 : 0;
  const innerWidth = svgWidth - margin.left - margin.right;

  // Scale mappings
  const xScale = (x: number) => {
    const [xMin, xMax] = activePreset.xDomain;
    return margin.left + ((x - xMin) / (xMax - xMin)) * innerWidth;
  };

  const yScaleTop = (y: number) => {
    const [yMin, yMax] = activePreset.yDomain;
    return margin.top + topPanelHeight - ((y - yMin) / (yMax - yMin)) * topPanelHeight;
  };

  const yScaleBottom = (y: number) => {
    if (!activePreset.dualPanel) return 0;
    const topOffset = margin.top + topPanelHeight + panelGap;
    const [yMin, yMax] = activePreset.yDomain;
    return topOffset + bottomPanelHeight - ((y - yMin) / (yMax - yMin)) * bottomPanelHeight;
  };

  // Dynamic Equilibrium Calculation (for 2-curve intersections)
  const equilibrium = useMemo(() => {
    if (activePreset.curves.length >= 2 && !activePreset.dualPanel) {
      const c1 = activePreset.curves[activePreset.curves.length - 2];
      const c2 = activePreset.curves[activePreset.curves.length - 1];
      return findIntersection(c1.equation, c2.equation, sliderParams, activePreset.xDomain[0], activePreset.xDomain[1]);
    }
    return null;
  }, [activePreset, sliderParams]);

  // Initial Baseline Equilibrium (for dynamic vector displacement)
  const baselineEquilibrium = useMemo(() => {
    if (activePreset.id === 'market-equilibrium') {
      const baselineParams = { demandShift: 0, supplyShift: 0 };
      const c1 = activePreset.curves[2];
      const c2 = activePreset.curves[3];
      return findIntersection(c1.equation, c2.equation, baselineParams, activePreset.xDomain[0], activePreset.xDomain[1]);
    }
    return null;
  }, [activePreset]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 font-sans bg-slate-50 text-slate-900 rounded-xl shadow-lg border border-slate-200">
      
      {/* HEADER & PRESET SELECTOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Interactive CBSE Economics Graph Engine</h1>
          <p className="text-sm text-slate-500">Class 11 Microeconomics & Class 12 Macroeconomics Parametric Models</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="preset-select" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Select Preset:</label>
          <select
            id="preset-select"
            value={activePresetId}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SVG GRAPH ENGINE */}
        <div className="lg:col-span-7 bg-white p-4 rounded-xl shadow-inner border border-slate-200 flex flex-col justify-center items-center">
          <svg width={svgWidth} height={svgHeight} className="overflow-visible">
            
            {/* GRID LINES & AXES (SINGLE PANEL OR TOP PANEL) */}
            <g className="grid-lines">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const xVal = activePreset.xDomain[0] + ratio * (activePreset.xDomain[1] - activePreset.xDomain[0]);
                const yVal = activePreset.yDomain[0] + ratio * (activePreset.yDomain[1] - activePreset.yDomain[0]);
                return (
                  <React.Fragment key={ratio}>
                    {/* Vertical Grid Line */}
                    <line
                      x1={xScale(xVal)} y1={margin.top}
                      x2={xScale(xVal)} y2={margin.top + topPanelHeight}
                      stroke="#f1f5f9" strokeWidth="1"
                    />
                    {/* Horizontal Grid Line */}
                    <line
                      x1={margin.left} y1={yScaleTop(yVal)}
                      x2={margin.left + innerWidth} y2={yScaleTop(yVal)}
                      stroke="#f1f5f9" strokeWidth="1"
                    />
                  </React.Fragment>
                );
              })}
            </g>

            {/* TOP PANEL BOUNDING AXES */}
            <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + topPanelHeight} stroke="#334155" strokeWidth="2" />
            <line x1={margin.left} y1={margin.top + topPanelHeight} x2={margin.left + innerWidth} y2={margin.top + topPanelHeight} stroke="#334155" strokeWidth="2" />

            {/* BOTTOM PANEL BOUNDING AXES (IF DUAL PANEL) */}
            {activePreset.dualPanel && (
              <>
                <g className="grid-lines-bottom">
                  {[0, 0.5, 1].map((ratio) => {
                    const yVal = activePreset.yDomain[0] + ratio * (activePreset.yDomain[1] - activePreset.yDomain[0]);
                    return (
                      <line
                        key={ratio}
                        x1={margin.left} y1={yScaleBottom(yVal)}
                        x2={margin.left + innerWidth} y2={yScaleBottom(yVal)}
                        stroke="#f1f5f9" strokeWidth="1"
                      />
                    );
                  })}
                </g>
                <line x1={margin.left} y1={margin.top + topPanelHeight + panelGap} x2={margin.left} y2={margin.top + topPanelHeight + panelGap + bottomPanelHeight} stroke="#334155" strokeWidth="2" />
                <line x1={margin.left} y1={margin.top + topPanelHeight + panelGap + bottomPanelHeight} x2={margin.left + innerWidth} y2={margin.top + topPanelHeight + panelGap + bottomPanelHeight} stroke="#334155" strokeWidth="2" />
                
                {/* Bottom Panel Y-Axis Label */}
                <text
                  x={margin.left - 45}
                  y={margin.top + topPanelHeight + panelGap + bottomPanelHeight / 2}
                  transform={`rotate(-90, ${margin.left - 45}, ${margin.top + topPanelHeight + panelGap + bottomPanelHeight / 2})`}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-slate-700"
                >
                  {activePreset.bottomYLabel || 'Bottom Panel Y'}
                </text>
              </>
            )}

            {/* AXIS LABELS */}
            <text
              x={margin.left + innerWidth / 2}
              y={svgHeight - 10}
              textAnchor="middle"
              className="text-xs font-semibold fill-slate-700"
            >
              {activePreset.xAxisLabel}
            </text>
            <text
              x={margin.left - 45}
              y={margin.top + topPanelHeight / 2}
              transform={`rotate(-90, ${margin.left - 45}, ${margin.top + topPanelHeight / 2})`}
              textAnchor="middle"
              className="text-xs font-semibold fill-slate-700"
            >
              {activePreset.dualPanel ? (activePreset.topYLabel || activePreset.yAxisLabel) : activePreset.yAxisLabel}
            </text>

            {/* CURVE RENDERING */}
            {activePreset.curves.map((curve) => {
              const isBottomCurve = activePreset.dualPanel && (curve.id === 'muCurve' || curve.id === 'apCurve' || curve.id === 'mpCurve');
              const yMapper = isBottomCurve ? yScaleBottom : yScaleTop;

              const sampledPoints = sampleCurve(
                curve.equation,
                sliderParams,
                activePreset.xDomain[0],
                activePreset.xDomain[1],
                activePreset.yDomain[0],
                activePreset.yDomain[1]
              );

              // Construct SVG path string
              let pathStr = '';
              sampledPoints.forEach((pt, idx) => {
                if (Number.isNaN(pt.x) || Number.isNaN(pt.y)) {
                  pathStr += '';
                } else {
                  const sx = xScale(pt.x);
                  const sy = yMapper(pt.y);
                  if (idx === 0 || pathStr === '' || pathStr.endsWith('NaN')) {
                    pathStr += `M ${sx} ${sy} `;
                  } else {
                    pathStr += `L ${sx} ${sy} `;
                  }
                }
              });

              return (
                <path
                  key={curve.id}
                  d={pathStr}
                  fill="none"
                  stroke={curve.color}
                  strokeWidth="2.5"
                  strokeDasharray={curve.dash || 'none'}
                />
              );
            })}

            {/* EQUILIBRIUM DISPLACEMENT ARROW (FOR MARKET EQUILIBRIUM SHIFTS) */}
            {activePreset.id === 'market-equilibrium' && baselineEquilibrium && equilibrium && (
              <g className="equilibrium-shift-vector">
                <line
                  x1={xScale(baselineEquilibrium.x)}
                  y1={yScaleTop(baselineEquilibrium.y)}
                  x2={xScale(equilibrium.x)}
                  y2={yScaleTop(equilibrium.y)}
                  stroke="#dc2626"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                  markerEnd="url(#arrowhead)"
                />
                {/* SVG Marker Definition for Arrow */}
                <defs>
                  <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <polygon points="0 0, 6 3, 0 6" fill="#dc2626" />
                  </marker>
                </defs>
              </g>
            )}

            {/* EQUILIBRIUM GUIDE LINES & DOTS */}
            {equilibrium && (
              <g className="equilibrium-indicator">
                <line
                  x1={xScale(equilibrium.x)} y1={margin.top + topPanelHeight}
                  x2={xScale(equilibrium.x)} y2={yScaleTop(equilibrium.y)}
                  stroke="#64748b" strokeDasharray="3,3"
                />
                <line
                  x1={margin.left} y1={yScaleTop(equilibrium.y)}
                  x2={xScale(equilibrium.x)} y2={yScaleTop(equilibrium.y)}
                  stroke="#64748b" strokeDasharray="3,3"
                />
                <circle cx={xScale(equilibrium.x)} cy={yScaleTop(equilibrium.y)} r="5" fill="#dc2626" />
                <text x={xScale(equilibrium.x) + 8} y={yScaleTop(equilibrium.y) - 8} className="text-xs font-bold fill-dc2626">
                  E ({equilibrium.x.toFixed(1)}, ₹{equilibrium.y.toFixed(1)})
                </text>
              </g>
            )}

            {/* STACKED PANEL ALIGNMENT GUIDELINE (FOR TU/MU & TP/AP/MP) */}
            {activePreset.dualPanel && (
              <g className="stacked-alignment-guideline">
                {activePreset.id === 'tu-mu-relationship' && (
                  <>
                    <line
                      x1={xScale(sliderParams.satietyPoint || 6)}
                      y1={margin.top}
                      x2={xScale(sliderParams.satietyPoint || 6)}
                      y2={margin.top + topPanelHeight + panelGap + bottomPanelHeight}
                      stroke="#dc2626"
                      strokeDasharray="4,4"
                      strokeWidth="1.5"
                    />
                    <text
                      x={xScale(sliderParams.satietyPoint || 6) + 6}
                      y={margin.top + 20}
                      className="text-xs font-bold fill-red-600"
                    >
                      Satiety Point (MU = 0, TU Max)
                    </text>
                  </>
                )}
              </g>
            )}

            {/* PRICE CEILING / FLOOR SHORTAGE & SURPLUS SHADING */}
            {activePreset.id === 'price-ceiling' && (
              <g className="ceiling-shading">
                {(() => {
                  const pc = sliderParams.pCeiling || 35;
                  const qs = Math.max(0, (pc - 10) / 0.8);
                  const qd = Math.max(0, (90 - pc) / 0.8);
                  return (
                    <>
                      <line x1={xScale(qs)} y1={yScaleTop(pc)} x2={xScale(qd)} y2={yScaleTop(pc)} stroke="#dc2626" strokeWidth="4" />
                      <text x={xScale((qs + qd) / 2)} y={yScaleTop(pc) - 8} textAnchor="middle" className="text-xs font-bold fill-red-600">
                        EXCESS DEMAND (SHORTAGE)
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {activePreset.id === 'price-floor' && (
              <g className="floor-shading">
                {(() => {
                  const pf = sliderParams.pFloor || 65;
                  const qd = Math.max(0, (90 - pf) / 0.8);
                  const qs = Math.max(0, (pf - 10) / 0.8);
                  return (
                    <>
                      <line x1={xScale(qd)} y1={yScaleTop(pf)} x2={xScale(qs)} y2={yScaleTop(pf)} stroke="#dc2626" strokeWidth="4" />
                      <text x={xScale((qd + qs) / 2)} y={yScaleTop(pf) - 8} textAnchor="middle" className="text-xs font-bold fill-red-600">
                        EXCESS SUPPLY (SURPLUS)
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

          </svg>

          {/* CURVE LEGEND */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {activePreset.curves.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                <span className="w-4 h-1 rounded" style={{ backgroundColor: c.color }}></span>
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS & PEDAGOGICAL TAKEAWAYS */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* SLIDER CONTROL PANEL */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Graph Controls & Determinants</span>
              <span className="text-xs font-normal text-slate-500">Interactive Sliders</span>
            </h2>

            <div className="space-y-5">
              {activePreset.controls.map((ctrl) => {
                const val = sliderParams[ctrl.id] ?? ctrl.defaultValue;
                return (
                  <div key={ctrl.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label htmlFor={`slider-${ctrl.id}`} className="font-semibold text-slate-700">{ctrl.label}</label>
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
                        {ctrl.discreteValues 
                          ? (ctrl.discreteValues.find(v => v.value === val)?.label || val) 
                          : `${val}${ctrl.unit || ''}`}
                      </span>
                    </div>

                    {ctrl.discreteValues ? (
                      <div className="grid grid-cols-1 gap-1">
                        {ctrl.discreteValues.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => handleSliderChange(ctrl.id, opt.value)}
                            className={`text-left text-xs px-2.5 py-1.5 rounded transition-colors ${
                              val === opt.value 
                                ? 'bg-blue-600 text-white font-semibold shadow-sm' 
                                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        id={`slider-${ctrl.id}`}
                        type="range"
                        min={ctrl.min}
                        max={ctrl.max}
                        step={ctrl.step}
                        value={val}
                        onChange={(e) => handleSliderChange(ctrl.id, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* KEY ECONOMIC TAKEAWAYS & CBSE CONCEPTS */}
          <div className="bg-blue-50/60 border border-blue-200/80 p-5 rounded-xl flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 10-2 0v1a1 1 0 102 0zM12 14a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                Core CBSE Economic Insights
              </h3>
              <ul className="space-y-2">
                {activePreset.takeaways(sliderParams).map((point, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                    <span className="font-bold text-blue-600 select-none">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-200/60 flex justify-between items-center text-[11px] text-blue-800/80">
              <span className="font-medium">Category: {activePreset.category}</span>
              <span className="font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">CBSE Curriculum Aligned</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
