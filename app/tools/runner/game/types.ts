export type Lane = -1 | 0 | 1;

export type Phase =
  | "menu"
  | "playing"
  | "paused"
  | "gameover";

export type Environment =
  | "quadrangle"
  | "walkway"
  | "garden"
  | "sports"
  | "hostels"
  | "gate";

export type ObstacleKind =
  | "block"
  | "bar"
  | "wall"
  | "gap"
  | "moving";

export type PickupKind =
  | "coin"
  | "magnet"
  | "shield"
  | "multiplier"
  | "boost";

/* -------------------------------------------------------------------------- */
/* Player                                                                     */
/* -------------------------------------------------------------------------- */

export type PlayerState = {
  lane: number;
  targetLane: Lane;

  y: number;
  verticalVelocity: number;

  jumping: boolean;
  sliding: boolean;
  slideUntil: number;

  shield: boolean;

  magnetUntil: number;
  multiplierUntil: number;
  boostUntil: number;
};

/* -------------------------------------------------------------------------- */
/* Obstacles                                                                  */
/* -------------------------------------------------------------------------- */

export type Obstacle = {
  id: number;

  lane: Lane;

  /**
   * Distance in front of the player.
   * 0 = player position.
   * Positive = ahead of player.
   * Negative = already passed.
   */
  z: number;

  kind: ObstacleKind;

  resolved: boolean;

  /**
   * Optional movement parameters for animated obstacles.
   */
  moving?: boolean;
  movementPhase?: number;
  movementAmplitude?: number;
  movementSpeed?: number;
};

/* -------------------------------------------------------------------------- */
/* Pickups                                                                    */
/* -------------------------------------------------------------------------- */

export type Pickup = {
  id: number;

  lane: Lane;

  /**
   * Distance in front of the player.
   */
  z: number;

  kind: PickupKind;

  collected: boolean;

  /**
   * Used for animation phase, bobbing and rotation.
   */
  phase: number;
};

/* -------------------------------------------------------------------------- */
/* Particles                                                                  */
/* -------------------------------------------------------------------------- */

export type ParticleKind =
  | "dust"
  | "spark"
  | "coin"
  | "impact"
  | "trail";

export type Particle = {
  id: number;

  x: number;
  y: number;
  z: number;

  vx: number;
  vy: number;
  vz: number;

  life: number;
  maxLife: number;

  size: number;

  kind: ParticleKind;
};

/* -------------------------------------------------------------------------- */
/* Camera                                                                    */
/* -------------------------------------------------------------------------- */

export type CameraState = {
  shake: number;

  currentFov: number;
  targetFov: number;

  lookAhead: number;

  offsetX: number;
  offsetY: number;
};

/* -------------------------------------------------------------------------- */
/* Environment                                                                */
/* -------------------------------------------------------------------------- */

export type EnvironmentState = {
  current: Environment;

  landmark: string;

  landmarkTimer: number;

  /**
   * Used for smooth transitions between campus areas.
   */
  transition: number;

  distanceInEnvironment: number;
};

/* -------------------------------------------------------------------------- */
/* Game                                                                       */
/* -------------------------------------------------------------------------- */

export type Game = {
  phase: Phase;

  last: number;

  elapsed: number;

  distance: number;

  score: number;

  runCoins: number;

  bankCoins: number;

  best: number;

  /* ------------------------------------------------------------------------ */
  /* Speed                                                                    */
  /* ------------------------------------------------------------------------ */

  speed: number;

  targetSpeed: number;

  /* ------------------------------------------------------------------------ */
  /* Player                                                                   */
  /* ------------------------------------------------------------------------ */

  player: PlayerState;

  /* ------------------------------------------------------------------------ */
  /* Gameplay                                                                  */
  /* ------------------------------------------------------------------------ */

  multiplier: number;

  combo: number;

  comboUntil: number;

  /* ------------------------------------------------------------------------ */
  /* Spawning                                                                 */
  /* ------------------------------------------------------------------------ */

  spawnTimer: number;

  pickupTimer: number;

  nextId: number;

  patternIndex: number;

  /* ------------------------------------------------------------------------ */
  /* World                                                                     */
  /* ------------------------------------------------------------------------ */

  environment: EnvironmentState;

  camera: CameraState;

  /* ------------------------------------------------------------------------ */
  /* Progression                                                               */
  /* ------------------------------------------------------------------------ */

  milestone: number;

  /* ------------------------------------------------------------------------ */
  /* Effects                                                                    */
  /* ------------------------------------------------------------------------ */

  flash: number;

  obstacles: Obstacle[];

  pickups: Pickup[];

  particles: Particle[];
};

/* -------------------------------------------------------------------------- */
/* HUD                                                                        */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Track patterns                                                             */
/* -------------------------------------------------------------------------- */

export type ObstaclePlacement = {
  lane: Lane;

  kind: ObstacleKind;

  z: number;

  moving?: boolean;

  movementPhase?: number;

  movementAmplitude?: number;

  movementSpeed?: number;
};

export type PickupPlacement = {
  lane: Lane;

  kind: PickupKind;

  z: number;
};

export type TrackPattern = {
  name: string;

  length: number;

  obstacles: ObstaclePlacement[];

  pickups: PickupPlacement[];
};
