export type Lane = -1 | 0 | 1;
export type Phase = "menu" | "playing" | "paused" | "gameover";
export type Environment = "quadrangle" | "walkway" | "garden" | "sports" | "hostels" | "gate";
export type ObstacleKind = "block" | "bar" | "wall" | "gap";
export type PickupKind = "coin" | "magnet" | "shield" | "multiplier" | "boost";

export type Obstacle = {
  id: number;
  lane: Lane;
  z: number;
  kind: ObstacleKind;
  resolved: boolean;
};

export type Pickup = {
  id: number;
  lane: Lane;
  z: number;
  kind: PickupKind;
  collected: boolean;
  phase: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  kind: "dust" | "spark";
};

export type Game = {
  phase: Phase;
  last: number;
  elapsed: number;
  distance: number;
  score: number;
  runCoins: number;
  bankCoins: number;
  best: number;
  speed: number;
  targetSpeed: number;
  lane: number;
  targetLane: Lane;
  jumpY: number;
  jumpV: number;
  sliding: boolean;
  slideUntil: number;
  shield: boolean;
  magnetUntil: number;
  multiplierUntil: number;
  boostUntil: number;
  multiplier: number;
  combo: number;
  comboUntil: number;
  spawnTimer: number;
  pickupTimer: number;
  nextId: number;
  patternIndex: number;
  environment: Environment;
  landmark: string;
  landmarkTimer: number;
  milestone: number;
  shake: number;
  flash: number;
  obstacles: Obstacle[];
  pickups: Pickup[];
  particles: Particle[];
};

export type HudState = {
  score: number;
  distance: number;
  coins: number;
  bank: number;
  best: number;
  multiplier: number;
  power: string;
  combo: number;
  landmark: string;
};
