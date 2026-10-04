export type Point = { x: number; y: number; label?: string };
export type Curve = {
  id: string;
  label: string;
  color: string;
  fn: (x: number) => number;
  dashed?: boolean;
  vertical?: boolean;
  xValue?: number;
};

export type Annotation = {
  id: string;
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
  text: string;
  tone?: "label" | "arrow" | "guide";
};

export type Preset = {
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

export const curveColors = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
];

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export function controlDisplayValue(control: Preset["controls"][number], value: number): string {
  if (control.key === "degree") {
    return ["0", "< 1", "1", "> 1", "∞"][Math.round(value)] ?? fmt(value);
  }
  return fmt(value);
}

export const presets: Preset[] = [
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
    curves: (c) => {
      const d0 = (x: number) => 90 - 0.75 * x;
      const s0 = (x: number) => 10 + 0.65 * x;
      const d1 = (x: number) => d0(x) + c.dShift;
      const s1 = (x: number) => s0(x) + c.sShift;
      const changed = Math.abs(c.dShift) > 0.01 || Math.abs(c.sShift) > 0.01;
      if (!changed) {
        return [
          { id: "d", label: "D", color: curveColors[0], fn: d0 },
          { id: "s", label: "S", color: curveColors[1], fn: s0 },
        ];
      }
      return [
        { id: "d0", label: "D₀", color: "#93c5fd", fn: d0, dashed: true },
        { id: "d1", label: c.dShift > 0 ? "D₁ (increase)" : "D₁ (decrease)", color: curveColors[0], fn: d1 },
        { id: "s0", label: "S₀", color: "#fca5a5", fn: s0, dashed: true },
        { id: "s1", label: c.sShift < 0 ? "S₁ (increase)" : "S₁ (decrease)", color: curveColors[1], fn: s1 },
      ];
    },
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
      const curves: Curve[] = [{ id: "d0", label: "D₀", color: curveColors[0], fn: d0 }];
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
      const selected = { id: "selected-price", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true };
      if (e === 0) {
        return [{ id: "d", label: "D · E = 0 · Perfectly inelastic", color: curveColors[0], fn: () => 50, vertical: true, xValue: 50 }, selected];
      }
      if (e === 1) {
        // P = K / Q^n, with n > 1 giving E = 1/n < 1.
        return [{ id: "d", label: "D · E < 1 · Relatively inelastic", color: curveColors[0], fn: (x) => 100 / Math.pow(Math.max(x, 1), 1.8) }, selected];
      }
      if (e === 2) {
        // P = K / Q gives unit elasticity.
        return [{ id: "d", label: "D · E = 1 · Unitary elastic", color: curveColors[0], fn: (x) => 2500 / Math.max(x, 1) }, selected];
      }
      if (e === 3) {
        // P = K / Q^n, with 0 < n < 1 giving E = 1/n > 1.
        return [{ id: "d", label: "D · E > 1 · Relatively elastic", color: curveColors[0], fn: (x) => 100 / Math.pow(Math.max(x, 1), 0.45) }, selected];
      }
      return [{ id: "d", label: "D · E = ∞ · Perfectly elastic", color: curveColors[0], fn: () => p }];
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
      const selected = { id: "selected-price", label: "Selected price", color: curveColors[2], fn: () => p, dashed: true };
      if (e === 0) {
        return [{ id: "s", label: "S · E = 0 · Perfectly inelastic", color: curveColors[0], fn: () => 50, vertical: true, xValue: 50 }, selected];
      }
      if (e === 1) {
        // P = KQ^n, with n > 1 giving E = 1/n < 1.
        return [{ id: "s", label: "S · E < 1 · Relatively inelastic", color: curveColors[0], fn: (x) => 0.65 * Math.pow(Math.max(x, 0), 1.8) }, selected];
      }
      if (e === 2) {
        // P = KQ gives unit elasticity.
        return [{ id: "s", label: "S · E = 1 · Unitary elastic", color: curveColors[0], fn: (x) => 0.75 * x }, selected];
      }
      if (e === 3) {
        // P = KQ^n, with 0 < n < 1 giving E = 1/n > 1.
        return [{ id: "s", label: "S · E > 1 · Relatively elastic", color: curveColors[0], fn: (x) => 8 + 4.2 * Math.pow(Math.max(x, 0), 0.45) }, selected];
      }
      return [{ id: "s", label: "S · E = ∞ · Perfectly elastic", color: curveColors[0], fn: () => p }];
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
    xMin: 0, xMax: 20, yMin: 0, yMax: 300,
    controls: [
      { key: "initial", label: "Initial MU (utils)", min: 40, max: 80, step: 1, value: 60 },
      { key: "decline", label: "Decline in MU", min: 3, max: 5, step: 0.1, value: 4 },
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
    xLabel: "Real income / output (₹)",
    yLabel: "Aggregate demand / expenditure (₹)",
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
    xLabel: "Quantity of foreign exchange (units)",
    yLabel: "Exchange rate (₹ per unit of foreign currency)",
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
    xLabel: "Flow categories",
    yLabel: "Flow direction",
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
    xLabel: "Quantity of Good X (units)",
    yLabel: "Quantity of Good Y (units)",
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
        max: 35,
        step: 1,
        value: 25,
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
    xMin: 0, xMax: 340, yMin: 0, yMax: 340,
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
    xLabel: "Income / output (₹)",
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
    xLabel: "Marginal propensity to consume (MPC)",
    yLabel: "Investment multiplier (k)",
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

