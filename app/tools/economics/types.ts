export type PresetCategory =
  | 'Micro: Consumer Behaviour'
  | 'Micro: Demand & Elasticity'
  | 'Micro: Production & Costs'
  | 'Micro: Market Equilibrium'
  | 'Macro: National Income & Multiplier'
  | 'Macro: Foreign Exchange';

export type Point = { x: number; y: number };

export type CurveType = 'explicit' | 'parametric' | 'vertical' | 'horizontal';

export interface CurveSpec {
  id: string;
  name: string;
  color: string;
  dash?: string;
  type?: CurveType;
  equation?: (x: number, params: Record<string, number>) => number;
  parametric?: (t: number, params: Record<string, number>) => Point;
  constantValue?: number | ((params: Record<string, number>) => number);
}

export interface DiscreteOption {
  value: number;
  label: string;
}

export interface SliderControl {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
  discreteValues?: DiscreteOption[];
}

export interface ShadedRegion {
  id: string;
  label?: string;
  color: string;
  getPoints: (params: Record<string, number>, xDomain: [number, number], yDomain: [number, number]) => Point[];
}

export interface Annotation {
  x: number;
  y: number;
  text: string;
  color?: string;
  panel?: 'top' | 'bottom' | 'single';
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
  syncXValue?: (params: Record<string, number>) => number | null;
  syncXLabel?: string;
  controls: SliderControl[];
  curves: CurveSpec[];
  shadedRegions?: ShadedRegion[];
  takeaways: (params: Record<string, number>) => string[];
  annotations?: (params: Record<string, number>) => Annotation[];
}
