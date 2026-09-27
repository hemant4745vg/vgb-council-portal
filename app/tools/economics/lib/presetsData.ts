import { Preset } from '../types';

export const PRESETS: Preset[] = [
  // 1. Demand, Supply & Market Equilibrium
  {
    id: 'market-equilibrium',
    title: 'Demand, Supply & Market Equilibrium',
    category: 'Micro: Market Equilibrium',
    description: 'Observe dynamic market adjustments as demand or supply determinants shift equilibrium price (P) and quantity (Q).',
    xAxisLabel: 'Quantity of Commodity X (units)',
    yAxisLabel: 'Price of Commodity X (₹)',
    xDomain: [0, 100],
    yDomain: [0, 100],
    controls: [
      { id: 'demandShift', label: 'Demand Shift (Income/Tastes)', min: -30, max: 30, step: 5, defaultValue: 0 },
      { id: 'supplyShift', label: 'Supply Shift (Input Costs/Tech)', min: -30, max: 30, step: 5, defaultValue: 0 },
    ],
    curves: [
      { id: 'initialD', name: 'Original Demand (D1)', color: '#94a3b8', dash: '4,4', equation: (q) => 90 - 0.8 * q },
      { id: 'initialS', name: 'Original Supply (S1)', color: '#94a3b8', dash: '4,4', equation: (q) => 10 + 0.8 * q },
      { id: 'currentD', name: 'Active Demand (D2)', color: '#2563eb', equation: (q, p) => 90 + p.demandShift - 0.8 * q },
      { id: 'currentS', name: 'Active Supply (S2)', color: '#16a34a', equation: (q, p) => 10 - p.supplyShift + 0.8 * q }
    ],
    takeaways: (p) => [
      'Initial Market Equilibrium is established at E1 = (50 units, ₹50).',
      p.demandShift > 0 ? 'Increase in Demand shifts D rightward -> Higher Equilibrium Price and Quantity.' : p.demandShift < 0 ? 'Decrease in Demand shifts D leftward -> Lower Equilibrium Price and Quantity.' : 'Demand curve is at baseline position.',
      p.supplyShift > 0 ? 'Increase in Supply shifts S rightward -> Lower Equilibrium Price and Higher Quantity.' : p.supplyShift < 0 ? 'Decrease in Supply shifts S leftward -> Higher Equilibrium Price and Lower Quantity.' : 'Supply curve is at baseline position.'
    ]
  },

  // 2. 5 Degrees of Price Elasticity of Demand (Ed)
  {
    id: 'price-elasticity-demand',
    title: '5 Degrees of Price Elasticity of Demand (Ed)',
    category: 'Micro: Demand & Elasticity',
    description: 'Explore all 5 textbook degrees of Price Elasticity: Perfectly Inelastic, Inelastic, Unitary, Elastic, and Perfectly Elastic.',
    xAxisLabel: 'Quantity Demanded (units)',
    yAxisLabel: 'Price of Commodity X (₹)',
    xDomain: [0, 100],
    yDomain: [0, 100],
    controls: [
      {
        id: 'elasticityMode',
        label: 'Degree of Elasticity (Ed)',
        min: 0, max: 4, step: 1, defaultValue: 2,
        discreteValues: [
          { value: 0, label: 'Ed = 0 (Perfectly Inelastic)' },
          { value: 1, label: 'Ed < 1 (Relatively Inelastic)' },
          { value: 2, label: 'Ed = 1 (Unitary Elastic)' },
          { value: 3, label: 'Ed > 1 (Relatively Elastic)' },
          { value: 4, label: 'Ed = ∞ (Perfectly Elastic)' }
        ]
      }
    ],
    curves: [
      {
        id: 'pedCurve',
        name: 'Demand Curve (D)',
        color: '#dc2626',
        type: 'explicit',
        equation: (q, p) => {
          const m = p.elasticityMode;
          if (m === 1) return 140 - 1.8 * q;
          if (m === 2) return 2500 / Math.max(q, 1); // Rectangular Hyperbola
          if (m === 3) return 75 - 0.5 * q;
          return NaN;
        }
      }
    ],
    takeaways: (p) => {
      const m = p.elasticityMode;
      if (m === 0) return ['Ed = 0: Perfectly Inelastic Demand.', 'Quantity demanded is completely unresponsive to price changes (Vertical line). Examples: Life-saving drugs, salt.'];
      if (m === 1) return ['Ed < 1: Relatively Inelastic Demand.', '% change in quantity demanded is LESS than % change in price (Steep slope). Examples: Basic necessities.'];
      if (m === 2) return ['Ed = 1: Unitary Elastic Demand.', '% change in quantity demanded EQUALS % change in price (Rectangular Hyperbola). Total expenditure remains constant.'];
      if (m === 3) return ['Ed > 1: Relatively Elastic Demand.', '% change in quantity demanded is GREATER than % change in price (Flatter slope). Examples: Luxuries, substitutes.'];
      return ['Ed = ∞: Perfectly Elastic Demand.', 'Consumers buy infinite quantity at P = ₹50, but zero quantity at any higher price (Horizontal line).'];
    }
  },

  // 3. Total Utility & Marginal Utility (Dual Panel)
  {
    id: 'tu-mu-relationship',
    title: 'Total Utility (TU) & Marginal Utility (MU)',
    category: 'Micro: Consumer Behaviour',
    description: 'Class 11 Textbook Dual-Plot: Top chart shows Total Utility (TU); Bottom chart shows Marginal Utility (MU).',
    xAxisLabel: 'Units Consumed (Q)',
    yAxisLabel: 'Utility (utils)',
    xDomain: [0, 10],
    yDomain: [-10, 40],
    dualPanel: true,
    topYLabel: 'Total Utility (TU)',
    bottomYLabel: 'Marginal Utility (MU)',
    syncXValue: (p) => p.satietyPoint ?? 6,
    syncXLabel: 'Satiety Point (MU = 0, TU Max)',
    controls: [
      { id: 'satietyPoint', label: 'Point of Satiety (Q*)', min: 4, max: 8, step: 1, defaultValue: 6, unit: ' units' }
    ],
    curves: [
      {
        id: 'tuCurve',
        name: 'Total Utility (TU)',
        color: '#2563eb',
        equation: (q, p) => {
          const qS = p.satietyPoint;
          const a = 36 / (qS * qS);
          return Math.max(-10, 2 * a * qS * q - a * q * q);
        }
      },
      {
        id: 'muCurve',
        name: 'Marginal Utility (MU)',
        color: '#dc2626',
        equation: (q, p) => {
          const qS = p.satietyPoint;
          const a = 36 / (qS * qS);
          return 2 * a * qS - 2 * a * q;
        }
      }
    ],
    takeaways: (p) => [
      `1. When MU is positive, TU increases at a diminishing rate (Units 0 to ${p.satietyPoint - 1}).`,
      `2. Point of Satiety: At Q = ${p.satietyPoint} units, TU reaches its maximum peak and MU = 0.`,
      `3. When MU becomes negative (Q > ${p.satietyPoint}), Total Utility begins to fall.`
    ]
  },

  // 4. Law of Variable Proportions (TP, AP, MP Dual Panel)
  {
    id: 'law-variable-proportions',
    title: 'Short-Run Production: TP, AP & MP',
    category: 'Micro: Production & Costs',
    description: 'Class 11 Production Theory: Stacked graph depicting Phase I (Increasing Returns), Phase II (Diminishing Returns), and Phase III (Negative Returns).',
    xAxisLabel: 'Variable Input (Labor - L)',
    yAxisLabel: 'Product Units',
    xDomain: [0, 12],
    yDomain: [-10, 70],
    dualPanel: true,
    topYLabel: 'Total Product (TP)',
    bottomYLabel: 'AP & MP Output',
    syncXValue: () => 8,
    syncXLabel: 'Phase II End (MP = 0, TP Max)',
    controls: [
      { id: 'techLevel', label: 'Technology / Efficiency Factor', min: 0.8, max: 1.4, step: 0.1, defaultValue: 1.0 }
    ],
    curves: [
      {
        id: 'tpCurve',
        name: 'Total Product (TP)',
        color: '#2563eb',
        equation: (L, p) => p.techLevel * (6 * L * L - 0.5 * L * L * L)
      },
      {
        id: 'apCurve',
        name: 'Average Product (AP = TP/L)',
        color: '#16a34a',
        equation: (L, p) => (L <= 0.1 ? 0 : p.techLevel * (6 * L - 0.5 * L * L))
      },
      {
        id: 'mpCurve',
        name: 'Marginal Product (MP = dTP/dL)',
        color: '#dc2626',
        equation: (L, p) => p.techLevel * (12 * L - 1.5 * L * L)
      }
    ],
    takeaways: () => [
      'Phase I (Increasing Returns): TP rises at an increasing rate; MP rises to its peak.',
      'Phase II (Diminishing Returns): MP falls but remains positive; AP reaches max where MP = AP (L = 4). TP reaches max where MP = 0 (L = 8).',
      'Phase III (Negative Returns): MP becomes negative; TP begins to decline (L > 8).'
    ]
  },

  // 5. Short-Run Unit Cost Curves
  {
    id: 'short-run-cost-curves',
    title: 'Short-Run Unit Costs (SAC, AVC, AFC, SMC)',
    category: 'Micro: Production & Costs',
    description: 'Explore relationships between Average Cost, Average Variable Cost, Average Fixed Cost, and Marginal Cost.',
    xAxisLabel: 'Output Quantity (Q in units)',
    yAxisLabel: 'Cost per Unit (₹)',
    xDomain: [0, 20],
    yDomain: [0, 50],
    controls: [
      { id: 'tfc', label: 'Total Fixed Cost (TFC)', min: 50, max: 150, step: 10, defaultValue: 100, unit: '₹' }
    ],
    curves: [
      { id: 'afc', name: 'AFC (TFC / Q)', color: '#94a3b8', dash: '4,4', equation: (q, p) => p.tfc / Math.max(q, 0.5) },
      { id: 'avc', name: 'AVC (TVC / Q)', color: '#16a34a', equation: (q) => 25 - 2.5 * q + 0.15 * q * q },
      { id: 'ac', name: 'AC / SAC (AFC + AVC)', color: '#2563eb', equation: (q, p) => (p.tfc / Math.max(q, 0.5)) + (25 - 2.5 * q + 0.15 * q * q) },
      { id: 'mc', name: 'SMC (dTC / dQ)', color: '#dc2626', equation: (q) => 25 - 5.0 * q + 0.45 * q * q }
    ],
    takeaways: () => [
      '1. Short-run Marginal Cost (SMC) intersects both AVC and SAC at their lowest minimum points.',
      '2. Vertical distance between SAC and AVC equals Average Fixed Cost (AFC), which narrows as output increases.',
      '3. AFC is a rectangular hyperbola: it approaches both axes asymptotically but never touches them.'
    ]
  },

  // 6. Price Ceiling & Shortage Shading
  {
    id: 'price-ceiling',
    title: 'Price Ceiling (Maximum Price Control)',
    category: 'Micro: Market Equilibrium',
    description: 'Government imposes a legal maximum price BELOW market equilibrium (e.g., essential medicines, rent control).',
    xAxisLabel: 'Quantity of Essential Good (units)',
    yAxisLabel: 'Price per Unit (₹)',
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
    shadedRegions: [
      {
        id: 'shortageArea',
        label: 'Shortage / Excess Demand',
        color: 'rgba(220, 38, 38, 0.15)',
        getPoints: (p) => {
          const pc = p.pCeiling;
          const qs = Math.max(0, (pc - 10) / 0.8);
          const qd = Math.max(0, (90 - pc) / 0.8);
          return [{ x: qs, y: 0 }, { x: qs, y: pc }, { x: qd, y: pc }, { x: qd, y: 0 }];
        }
      }
    ],
    takeaways: (p) => {
      const pc = p.pCeiling;
      const qSupplied = Math.max(0, (pc - 10) / 0.8);
      const qDemanded = Math.max(0, (90 - pc) / 0.8);
      const shortage = Math.max(0, qDemanded - qSupplied);
      return [
        `Uncontrolled Market Equilibrium Price is ₹50. Price Ceiling is fixed at ₹${pc}.`,
        `At Pc = ₹${pc}: Quantity Demanded (Qd) = ${qDemanded.toFixed(1)} units; Quantity Supplied (Qs) = ${qSupplied.toFixed(1)} units.`,
        `RESULT: EXCESS DEMAND / SHORTAGE of ${shortage.toFixed(1)} units. Leads to black marketing, queueing, and rationing.`
      ];
    }
  },

  // 7. Keynesian 45° Cross (Class 12 Macro)
  {
    id: 'keynesian-cross',
    title: 'Keynesian 45° Income-Output Equilibrium',
    category: 'Macro: National Income & Multiplier',
    description: 'Class 12 Macroeconomics: Determination of equilibrium national income where Aggregate Demand (AD = C + I) equals Aggregate Supply (AS = Y).',
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
      const autoExp = p.autonomousC + p.investment;
      const eqIncome = autoExp / (1 - p.mpc);
      const k = 1 / (1 - p.mpc);
      return [
        `Equilibrium National Income (Y*) = ₹${eqIncome.toFixed(0)} Cr.`,
        `Investment Multiplier (K) = 1 / (1 - MPC) = ${k.toFixed(2)}.`,
        `A ₹25 Cr increase in Autonomous Investment generates a ₹${(25 * k).toFixed(0)} Cr increase in Equilibrium Income.`
      ];
    }
  }
];
