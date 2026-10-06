"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BEST_KEY,
  BANK_KEY,
  COLLISION_FRONT,
  MAGNET_DURATION,
  MULTIPLIER_DURATION,
  SHIELD_DURATION,
  SPEED_BOOST_DURATION,
  START_SPEED,
  MAX_SPEED,
  SPEED_ACCELERATION,
  clamp,
  readStorage,
  writeStorage,
} from "./game/constants";
import { spawnObstacleSet, spawnPickupSet } from "./game/patterns";
import type {
  Game,
  Lane,
  Obstacle,
  Pickup,
  Phase,
} from "./game/types";
import { RunnerScene } from "./rendering/RunnerScene";

const MAX_FRAME_DT = 0.034;

/*
 * Collision geometry is expressed in the same world units
 * as RunnerScene.
 *
 * Player:
 *   feet at y = 0
 *   standing height ≈ 1.8
 *   jump apex ≈ 1.4
 *
 * Obstacles:
 *   block height ≈ 1.15
 *   moving block height ≈ 1.15
 *   wall height ≈ 2.35
 *   bar occupies the upper body space
 *   gap occupies the ground
 */
const PLAYER_HALF_WIDTH = 0.43;

const OBSTACLE_HALF_WIDTH = {
  block: 1.23,
  moving: 1.23,
  bar: 1.23,
  wall: 1.41,
  gap: 1.32,
} as const;

const OBSTACLE_DEPTH = {
  block: 1.0,
  moving: 1.0,
  bar: 0.68,
  wall: 0.9,
  gap: 2.5,
} as const;

const OBSTACLE_HEIGHT = {
  block: 1.15,
  moving: 1.15,
  bar: 2.13,
  wall: 2.35,
  gap: 0.2,
} as const;

/*
 * The 3D camera determines which world-X direction appears
 * on the user's screen.
 *
 * In the current RunnerScene, screen-left corresponds to
 * the positive lane value and screen-right corresponds to
 * the negative lane value.
 *
 * Keep this mapping explicit. Do not replace it with
 * anonymous -1 / +1 calls again.
 */
const SCREEN_LEFT_DELTA = 1;
const SCREEN_RIGHT_DELTA = -1;

const LANDMARKS = [
  {
    env: "quadrangle" as const,
    name: "ACADEMIC QUADRANGLE",
  },
  {
    env: "walkway" as const,
    name: "COVERED WALKWAY",
  },
  {
    env: "garden" as const,
    name: "CENTRAL GARDEN",
  },
  {
    env: "sports" as const,
    name: "SPORTS GROUNDS",
  },
  {
    env: "hostels" as const,
    name: "HOSTEL DISTRICT",
  },
  {
    env: "gate" as const,
    name: "MAIN CAMPUS GATE",
  },
];

function freshGame(
  best: number,
  bankCoins: number,
): Game {
  return {
    phase: "menu",
    last: 0,
    elapsed: 0,
    distance: 0,
    score: 0,
    runCoins: 0,
    bankCoins,
    best,

    speed: START_SPEED,
    targetSpeed: START_SPEED,

    player: {
      lane: 0,
      targetLane: 0,
      y: 0,
      verticalVelocity: 0,
      jumping: false,
      sliding: false,
      slideUntil: 0,
      shield: false,
      magnetUntil: 0,
      multiplierUntil: 0,
      boostUntil: 0,
    },

    multiplier: 1,
    combo: 0,
    comboUntil: 0,

    spawnTimer: 0.75,
    pickupTimer: 0.9,

    nextId: 1,
    patternIndex: 0,

    environment: {
      current: "quadrangle",
      landmark: "ACADEMIC QUADRANGLE",
      landmarkTimer: 0,
      transition: 0,
      distanceInEnvironment: 0,
    },

    camera: {
      shake: 0,
      currentFov: 62,
      targetFov: 62,
      lookAhead: 12,
      offsetX: 0,
      offsetY: 0,
    },

    milestone: 250,
    flash: 0,

    obstacles: [],
    pickups: [],
    particles: [],
  };
}

function resetRun(g: Game) {
  const best = g.best;
  const bankCoins = g.bankCoins;

  Object.assign(
    g,
    freshGame(best, bankCoins),
  );

  g.phase = "playing";
  g.last = performance.now();
}

function powerLabel(g: Game) {
  if (g.player.boostUntil > g.elapsed) {
    return "BOOST";
  }

  if (g.player.magnetUntil > g.elapsed) {
    return "MAGNET";
  }

  if (g.player.shield) {
    return "SHIELD";
  }

  if (g.multiplier > 1) {
    return `×${g.multiplier}`;
  }

  return "";
}

/*
 * Returns the horizontal half-width of the obstacle
 * in world units.
 */
function obstacleHalfWidth(
  obstacle: Obstacle,
) {
  return (
    OBSTACLE_HALF_WIDTH[obstacle.kind] ??
    1.15
  );
}

/*
 * Returns the approximate Z half-depth of the obstacle.
 */
function obstacleHalfDepth(
  obstacle: Obstacle,
) {
  return (
    OBSTACLE_DEPTH[obstacle.kind] ??
    0.8
  );
}

/*
 * Returns the physical obstacle height.
 */
function obstacleHeight(
  obstacle: Obstacle,
) {
  return (
    OBSTACLE_HEIGHT[obstacle.kind] ??
    1.15
  );
}

/*
 * Horizontal collision is based on actual lane positions,
 * rather than comparing lane integers with an arbitrary
 * threshold.
 *
 * The player's current lane is deliberately used here,
 * because RunnerScene smoothly animates the player's
 * world-X position toward targetLane.
 */
function horizontalOverlap(
  g: Game,
  obstacle: Obstacle,
) {
  const playerX = laneWorldX(g.player.lane);
  const obstacleX = laneWorldX(obstacle.lane);

  const horizontalDistance =
    Math.abs(playerX - obstacleX);

  return (
    horizontalDistance <=
    PLAYER_HALF_WIDTH +
      obstacleHalfWidth(obstacle)
  );
}

/*
 * Keep the lane-to-world conversion local to this page.
 *
 * The visual renderer uses the same laneX() function.
 */
function laneWorldX(lane: number) {
  /*
   * RunnerScene currently uses laneX(lane), where
   * each lane is one LANE_WIDTH apart.
   *
   * Importing laneX here would be correct too, but using
   * the player's logical lane relationship keeps collision
   * independent from renderer implementation details.
   */
  const LANE_WIDTH = 3;

  return lane * LANE_WIDTH;
}

/*
 * Determines whether the player's vertical body can
 * physically pass the obstacle.
 */
function obstacleCanBeCleared(
  obstacle: Obstacle,
  player: Game["player"],
) {
  /*
   * A low horizontal bar is a slide obstacle.
   *
   * Jumping into it should NOT count as clearing it.
   */
  if (obstacle.kind === "bar") {
    return player.sliding;
  }

  /*
   * A wall occupies the full running height.
   * It must be avoided by changing lanes.
   */
  if (obstacle.kind === "wall") {
    return false;
  }

  /*
   * A gap is a ground hazard.
   * Being sufficiently airborne clears it.
   */
  if (obstacle.kind === "gap") {
    return player.y >= 0.65;
  }

  /*
   * Normal blocks are jumpable.
   *
   * We compare the player's feet height against the
   * actual obstacle height instead of the old 2D
   * thresholds such as 58 / 115.
   */
  const requiredJumpHeight =
    obstacleHeight(obstacle) + 0.08;

  return player.y >= requiredJumpHeight;
}

/*
 * Checks whether the obstacle is physically overlapping
 * the player's Z position.
 *
 * The player's collision plane is centered around z = 0.
 */
function depthOverlap(
  obstacle: Obstacle,
) {
  const depth =
    obstacleHalfDepth(obstacle);

  return (
    obstacle.z <= depth &&
    obstacle.z >= -depth - 0.65
  );
}

/*
 * Adds score and combo only once for a successfully
 * passed obstacle.
 */
function resolveSuccessfulObstacle(
  g: Game,
) {
  g.combo += 1;
  g.comboUntil =
    g.elapsed + 1.7;

  g.score +=
    60 * g.multiplier;
}

/*
 * Collision system.
 *
 * Important changes:
 *
 * 1. No old 2D jump thresholds.
 * 2. No arbitrary lane integer comparison.
 * 3. Obstacles are only resolved when their physical
 *    collision volume reaches the player.
 * 4. A jump actually clears a jumpable obstacle.
 * 5. A slide actually clears a bar.
 * 6. A wall cannot be jumped.
 * 7. A gap requires the player to be airborne.
 * 8. Shield consumes itself only on a real collision.
 */
function collisionCheck(
  g: Game,
  finish: () => void,
  beep: (
    frequency: number,
    duration?: number,
  ) => void,
) {
  for (const obstacle of g.obstacles) {
    if (obstacle.resolved) {
      continue;
    }

    if (!depthOverlap(obstacle)) {
      continue;
    }

    if (!horizontalOverlap(g, obstacle)) {
      /*
       * The player has passed through the obstacle's
       * collision zone in another lane.
       *
       * Do not resolve it yet until it is safely behind
       * the player.
       */
      if (obstacle.z < -2.2) {
        obstacle.resolved = true;
        resolveSuccessfulObstacle(g);
      }

      continue;
    }

    if (
      obstacleCanBeCleared(
        obstacle,
        g.player,
      )
    ) {
      obstacle.resolved = true;
      resolveSuccessfulObstacle(g);
      continue;
    }

    /*
     * Actual collision.
     */
    obstacle.resolved = true;

    if (g.player.shield) {
      g.player.shield = false;
      g.camera.shake = 0.18;
      g.flash = 0.18;

      beep(170, 0.12);
      continue;
    }

    finish();
    return;
  }
}

function applyPickup(
  g: Game,
  pickup: Pickup,
  beep: (
    frequency: number,
    duration?: number,
  ) => void,
) {
  if (pickup.collected) {
    return;
  }

  pickup.collected = true;

  switch (pickup.kind) {
    case "coin":
      g.runCoins += 1;
      g.score +=
        30 * g.multiplier;

      g.combo += 1;
      g.comboUntil =
        g.elapsed + 1.7;

      beep(720, 0.045);
      break;

    case "magnet":
      g.player.magnetUntil =
        g.elapsed + MAGNET_DURATION;

      g.score +=
        100 * g.multiplier;

      beep(560, 0.08);
      break;

    case "shield":
      g.player.shield = true;

      g.score +=
        125 * g.multiplier;

      beep(480, 0.09);
      break;

    case "multiplier":
      g.multiplier =
        Math.min(
          5,
          g.multiplier + 1,
        );

      g.player.multiplierUntil =
        g.elapsed +
        MULTIPLIER_DURATION;

      g.score +=
        175 * g.multiplier;

      beep(880, 0.1);
      break;

    case "boost":
      g.player.boostUntil =
        g.elapsed +
        SPEED_BOOST_DURATION;

      g.score +=
        150 * g.multiplier;

      beep(980, 0.1);
      break;
  }
}

export default function RunnerPage() {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null,
    );

  const gameRef =
    useRef<Game | null>(null);

  const sceneRef =
    useRef<RunnerScene | null>(null);

  const rafRef =
    useRef<number | null>(null);

  const touchRef =
    useRef<{
      x: number;
      y: number;
    } | null>(null);

  const audioRef =
    useRef<AudioContext | null>(null);

  const lastHudRef =
    useRef(0);

  const [phase, setPhase] =
    useState<Phase>("menu");

  const [sound, setSound] =
    useState(true);

  const [hud, setHud] =
    useState({
      score: 0,
      distance: 0,
      coins: 0,
      bank: 0,
      best: 0,
      multiplier: 1,
      power: "",
      speed: START_SPEED,
      landmark:
        "ACADEMIC QUADRANGLE",
      combo: 0,
    });

  const beep = useCallback(
    (
      frequency: number,
      duration = 0.06,
    ) => {
      if (
        !sound ||
        typeof window === "undefined"
      ) {
        return;
      }

      try {
        const AudioCtor =
          window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;

        if (!AudioCtor) {
          return;
        }

        const audio =
          audioRef.current ??
          new AudioCtor();

        audioRef.current = audio;

        if (
          audio.state ===
          "suspended"
        ) {
          void audio.resume();
        }

        const oscillator =
          audio.createOscillator();

        const gain =
          audio.createGain();

        oscillator.type =
          "triangle";

        oscillator.frequency.value =
          frequency;

        gain.gain.setValueAtTime(
          0.0001,
          audio.currentTime,
        );

        gain.gain.exponentialRampToValueAtTime(
          0.055,
          audio.currentTime + 0.008,
        );

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          audio.currentTime +
            duration,
        );

        oscillator.connect(gain);
        gain.connect(
          audio.destination,
        );

        oscillator.start();

        oscillator.stop(
          audio.currentTime +
            duration +
            0.01,
        );
      } catch {
        /*
         * Audio remains optional.
         */
      }
    },
    [sound],
  );

  const syncHud = useCallback(
    () => {
      const g =
        gameRef.current;

      if (!g) {
        return;
      }

      setHud({
        score: Math.floor(
          g.score,
        ),
        distance: Math.floor(
          g.distance,
        ),
        coins: g.runCoins,
        bank: g.bankCoins,
        best: g.best,
        multiplier:
          g.multiplier,
        power:
          powerLabel(g),
        speed: Math.round(
          g.speed,
        ),
        landmark:
          g.environment.landmark,
        combo: g.combo,
      });

      setPhase(g.phase);
    },
    [],
  );

  const start = useCallback(
    () => {
      const g =
        gameRef.current;

      if (!g) {
        return;
      }

      resetRun(g);

      setPhase("playing");
      syncHud();

      beep(520, 0.08);
    },
    [beep, syncHud],
  );

  /*
   * IMPORTANT:
   *
   * This function works in SCREEN directions, not
   * anonymous mathematical directions.
   *
   * Because the current 3D camera presents positive-X
   * as the visual left side of the track:
   *
   *   LEFT  -> +1
   *   RIGHT -> -1
   */
  const move = useCallback(
    (
      direction:
        | "left"
        | "right",
    ) => {
      const g =
        gameRef.current;

      if (
        !g ||
        g.phase !== "playing"
      ) {
        return;
      }

      const delta =
        direction === "left"
          ? SCREEN_LEFT_DELTA
          : SCREEN_RIGHT_DELTA;

      const nextLane =
        clamp(
          g.player.targetLane +
            delta,
          -1,
          1,
        ) as Lane;

      /*
       * Ignore movement attempts at
       * the edge of the track.
       */
      if (
        nextLane ===
        g.player.targetLane
      ) {
        return;
      }

      g.player.targetLane =
        nextLane;

      beep(
        direction === "left"
          ? 180
          : 220,
        0.035,
      );
    },
    [beep],
  );

  const jump = useCallback(
    () => {
      const g =
        gameRef.current;

      if (
        !g ||
        g.phase !== "playing"
      ) {
        return;
      }

      if (
        g.player.jumping ||
        g.player.sliding
      ) {
        return;
      }

      g.player.jumping = true;
      g.player.verticalVelocity =
        7.2;
      g.player.y = 0.05;

      beep(430, 0.06);
    },
    [beep],
  );

  const slide = useCallback(
    () => {
      const g =
        gameRef.current;

      if (
        !g ||
        g.phase !== "playing"
      ) {
        return;
      }

      if (g.player.jumping) {
        return;
      }

      g.player.sliding = true;
      g.player.slideUntil =
        g.elapsed + 0.72;

      beep(145, 0.055);
    },
    [beep],
  );

  const togglePause =
    useCallback(() => {
      const g =
        gameRef.current;

      if (
        !g ||
        (
          g.phase !== "playing" &&
          g.phase !== "paused"
        )
      ) {
        return;
      }

      if (
        g.phase === "playing"
      ) {
        g.phase = "paused";
        setPhase("paused");
      } else {
        g.phase = "playing";
        g.last =
          performance.now();

        setPhase("playing");
      }
    }, []);

  useEffect(() => {
    const best =
      readStorage(BEST_KEY);

    const bank =
      readStorage(BANK_KEY);

    const game =
      freshGame(
        best,
        bank,
      );

    gameRef.current =
      game;

    syncHud();

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const scene =
      new RunnerScene(
        canvas,
      );

    sceneRef.current =
      scene;

    const resize = () => {
      const rect =
        canvas.getBoundingClientRect();

      scene.resize(
        Math.max(
          320,
          rect.width,
        ),
        Math.max(
          500,
          rect.height,
        ),
      );
    };

    const observer =
      new ResizeObserver(
        resize,
      );

    observer.observe(canvas);

    resize();

    const finish = () => {
      const g =
        gameRef.current;

      if (
        !g ||
        g.phase !== "playing"
      ) {
        return;
      }

      g.phase =
        "gameover";

      g.best =
        Math.max(
          g.best,
          Math.floor(
            g.score,
          ),
        );

      g.bankCoins +=
        g.runCoins;

      writeStorage(
        BEST_KEY,
        g.best,
      );

      writeStorage(
        BANK_KEY,
        g.bankCoins,
      );

      g.camera.shake =
        0.45;

      g.flash =
        0.22;

      setPhase(
        "gameover",
      );

      syncHud();

      beep(95, 0.22);
    };

    const tick = (
      now: number,
    ) => {
      const g =
        gameRef.current;

      if (!g) {
        rafRef.current =
          requestAnimationFrame(
            tick,
          );

        return;
      }

      const dt = clamp(
        (
          now -
          (g.last || now)
        ) / 1000,
        0,
        MAX_FRAME_DT,
      );

      if (
        g.phase ===
        "playing"
      ) {
        g.last = now;
        g.elapsed += dt;

        const baseSpeed =
          Math.min(
            MAX_SPEED,
            START_SPEED +
              g.elapsed *
                SPEED_ACCELERATION,
          );

        g.targetSpeed =
          g.player.boostUntil >
          g.elapsed
            ? Math.min(
                MAX_SPEED *
                  1.18,
                baseSpeed *
                  1.42,
              )
            : baseSpeed;

        g.speed +=
          (
            g.targetSpeed -
            g.speed
          ) *
          (
            1 -
            Math.pow(
              0.001,
              dt,
            )
          );

        g.distance +=
          g.speed * dt;

        g.score +=
          g.speed *
          dt *
          0.055 *
          g.multiplier;

        /*
         * Logical lane movement.
         *
         * RunnerScene independently interpolates the
         * visual player toward the same target lane.
         */
        g.player.lane +=
          (
            g.player.targetLane -
            g.player.lane
          ) *
          (
            1 -
            Math.pow(
              0.00008,
              dt,
            )
          );

        if (
          Math.abs(
            g.player.lane -
              g.player.targetLane,
          ) < 0.012
        ) {
          g.player.lane =
            g.player.targetLane;
        }

        /*
         * Jump physics.
         */
        if (
          g.player.jumping ||
          g.player.y > 0
        ) {
          g.player.verticalVelocity -=
            18.5 * dt;

          g.player.y +=
            g.player.verticalVelocity *
            dt;

          if (
            g.player.y <= 0
          ) {
            g.player.y = 0;
            g.player.verticalVelocity =
              0;
            g.player.jumping =
              false;
          }
        }

        /*
         * Slide expiry.
         */
        if (
          g.player.sliding &&
          g.elapsed >=
            g.player.slideUntil
        ) {
          g.player.sliding =
            false;
        }

        /*
         * Multiplier expiry.
         */
        if (
          g.multiplier > 1 &&
          g.elapsed >=
            g.player.multiplierUntil
        ) {
          g.multiplier = 1;
        }

        /*
         * Combo expiry.
         */
        if (
          g.combo > 0 &&
          g.elapsed >=
            g.comboUntil
        ) {
          g.combo = 0;
        }

        /*
         * Spawn obstacles.
         */
        g.spawnTimer -= dt;

        if (
          g.spawnTimer <= 0
        ) {
          spawnObstacleSet(g);
        }

        /*
         * Spawn pickups.
         */
        g.pickupTimer -= dt;

        if (
          g.pickupTimer <= 0
        ) {
          spawnPickupSet(g);
        }

        /*
         * Move obstacles through the world.
         */
        for (
          const obstacle of
            g.obstacles
        ) {
          obstacle.z -=
            g.speed * dt;
        }

        /*
         * Move pickups.
         */
        for (
          const pickup of
            g.pickups
        ) {
          pickup.z -=
            g.speed * dt;

          /*
           * Magnet now moves the pickup toward the
           * player's actual logical lane.
           */
          if (
            !pickup.collected &&
            g.player.magnetUntil >
              g.elapsed &&
            pickup.kind ===
              "coin" &&
            pickup.z < 28 &&
            pickup.z > -45
          ) {
            const laneDelta =
              g.player.lane -
              pickup.lane;

            if (
              Math.abs(
                laneDelta,
              ) > 0.02
            ) {
              const direction =
                laneDelta > 0
                  ? 1
                  : -1;

              const next =
                clamp(
                  pickup.lane +
                    direction *
                      0.12,
                  -1,
                  1,
                );

              pickup.lane =
                next as Lane;
            }
          }
        }

        /*
         * Pickup collision.
         */
        for (
          const pickup of
            g.pickups
        ) {
          if (
            pickup.collected
          ) {
            continue;
          }

          const laneDelta =
            Math.abs(
              g.player.lane -
                pickup.lane,
            );

          if (
            pickup.z <= 2.5 &&
            pickup.z >= -2.5 &&
            laneDelta < 0.46
          ) {
            applyPickup(
              g,
              pickup,
              beep,
            );
          }
        }

        /*
         * Obstacle collision.
         */
        collisionCheck(
          g,
          finish,
          beep,
        );

        /*
         * Remove old objects.
         *
         * Resolved obstacles are kept briefly by the
         * renderer but no longer participate in gameplay.
         */
        g.obstacles =
          g.obstacles.filter(
            (obstacle) =>
              obstacle.z > -32 &&
              !obstacle.resolved,
          );

        g.pickups =
          g.pickups.filter(
            (pickup) =>
              pickup.z > -32 &&
              !pickup.collected,
          );

        /*
         * Environment progression.
         */
        g.environment.distanceInEnvironment +=
          g.speed * dt;

        if (
          g.environment
            .distanceInEnvironment >=
          700
        ) {
          g.environment
            .distanceInEnvironment = 0;

          const currentIndex =
            LANDMARKS.findIndex(
              (item) =>
                item.env ===
                g.environment
                  .current,
            );

          const next =
            LANDMARKS[
              (
                currentIndex +
                1
              ) %
                LANDMARKS.length
            ];

          g.environment.current =
            next.env;

          g.environment.landmark =
            next.name;

          g.environment.landmarkTimer =
            2.2;

          g.environment.transition =
            1;

          beep(640, 0.075);
        }

        g.environment.landmarkTimer =
          Math.max(
            0,
            g.environment
              .landmarkTimer -
              dt,
          );

        g.environment.transition =
          Math.max(
            0,
            g.environment
              .transition -
              dt * 0.55,
          );

        /*
         * Distance milestones.
         */
        if (
          g.distance >=
          g.milestone
        ) {
          g.score +=
            300 *
            g.multiplier;

          g.milestone +=
            250;

          g.flash =
            0.1;

          beep(880, 0.08);
        }

        g.flash =
          Math.max(
            0,
            g.flash -
              dt * 1.8,
          );

        g.camera.shake =
          Math.max(
            0,
            g.camera.shake -
              dt * 1.8,
          );

        g.camera.targetFov =
          clamp(
            62 +
              (
                g.speed -
                START_SPEED
              ) *
                0.23,
            62,
            76,
          );
      } else if (
        g.phase === "paused"
      ) {
        g.last = now;
      } else {
        g.last = now;
      }

      /*
       * RunnerScene performs its own visual update.
       */
      scene.update(
        g,
        dt,
        now,
      );

      if (
        now -
          lastHudRef.current >
        90
      ) {
        lastHudRef.current =
          now;

        syncHud();
      }

      rafRef.current =
        requestAnimationFrame(
          tick,
        );
    };

    rafRef.current =
      requestAnimationFrame(
        tick,
      );

    return () => {
      observer.disconnect();

      if (
        rafRef.current
      ) {
        cancelAnimationFrame(
          rafRef.current,
        );
      }

      scene.dispose();

      sceneRef.current =
        null;

      if (
        audioRef.current
      ) {
        void audioRef.current.close();
        audioRef.current =
          null;
      }
    };
  }, [
    beep,
    syncHud,
  ]);

  /*
   * Keyboard controls.
   *
   * Explicit screen directions.
   */
  useEffect(() => {
    const onKey = (
      event: KeyboardEvent,
    ) => {
      const key =
        event.key.toLowerCase();

      if (
        [
          "arrowleft",
          "arrowright",
          "arrowup",
          "arrowdown",
          " ",
        ].includes(key)
      ) {
        event.preventDefault();
      }

      if (
        key ===
          "arrowleft" ||
        key === "a"
      ) {
        move("left");
      } else if (
        key ===
          "arrowright" ||
        key === "d"
      ) {
        move("right");
      } else if (
        key === "arrowup" ||
        key === "w" ||
        key === " "
      ) {
        if (
          phase === "menu" ||
          phase === "gameover"
        ) {
          start();
        } else {
          jump();
        }
      } else if (
        key ===
          "arrowdown" ||
        key === "s"
      ) {
        slide();
      } else if (
        key === "p" ||
        key === "escape"
      ) {
        togglePause();
      } else if (
        key === "enter" &&
        (
          phase === "menu" ||
          phase === "gameover"
        )
      ) {
        start();
      }
    };

    window.addEventListener(
      "keydown",
      onKey,
      {
        passive: false,
      },
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKey,
      );
  }, [
    jump,
    move,
    phase,
    slide,
    start,
    togglePause,
  ]);

  const pointerDown = (
    event: React.PointerEvent<HTMLCanvasElement>,
  ) => {
    touchRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    event.currentTarget.setPointerCapture?.(
      event.pointerId,
    );
  };

  const pointerUp = (
    event: React.PointerEvent<HTMLCanvasElement>,
  ) => {
    const startPoint =
      touchRef.current;

    touchRef.current =
      null;

    if (!startPoint) {
      return;
    }

    const dx =
      event.clientX -
      startPoint.x;

    const dy =
      event.clientY -
      startPoint.y;

    const ax =
      Math.abs(dx);

    const ay =
      Math.abs(dy);

    /*
     * Tap.
     */
    if (
      Math.max(ax, ay) <
      28
    ) {
      if (
        phase === "menu" ||
        phase === "gameover"
      ) {
        start();
      } else if (
        phase === "playing"
      ) {
        jump();
      }

      return;
    }

    /*
     * Horizontal swipe.
     *
     * Finger moving LEFT  -> screen-left
     * Finger moving RIGHT -> screen-right
     */
    if (ax > ay) {
      move(
        dx < 0
          ? "left"
          : "right",
      );
    } else if (
      dy < 0
    ) {
      jump();
    } else {
      slide();
    }
  };

  return (
    <main className="runner-page">
      <section className="runner-frame">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">
              VGB
            </div>

            <div>
              <strong>
                RUNNER 3D
              </strong>

              <span>
                VIDYAGYAN CAMPUS
              </span>
            </div>
          </div>

          <div className="top-actions">
            <div className="top-stat">
              <span>
                BEST
              </span>

              <b>
                {hud.best.toLocaleString()}
              </b>
            </div>

            <div className="top-stat">
              <span>
                BANK
              </span>

              <b>
                ◆ {hud.bank}
              </b>
            </div>

            <button
              className="icon-btn"
              onClick={() =>
                setSound(
                  (value) =>
                    !value,
                )
              }
              aria-label={
                sound
                  ? "Mute sound"
                  : "Enable sound"
              }
            >
              {sound
                ? "🔊"
                : "🔇"}
            </button>

            <button
              className="icon-btn"
              onClick={
                togglePause
              }
              disabled={
                phase ===
                  "menu" ||
                phase ===
                  "gameover"
              }
              aria-label={
                phase ===
                "paused"
                  ? "Resume game"
                  : "Pause game"
              }
            >
              {phase ===
              "paused"
                ? "▶"
                : "Ⅱ"}
            </button>
          </div>
        </header>

        <div className="game-wrap">
          <canvas
            ref={canvasRef}
            onPointerDown={
              pointerDown
            }
            onPointerUp={
              pointerUp
            }
            aria-label="VGB Runner 3D game canvas"
          />

          <div
            className="hud"
            aria-live="polite"
          >
            <div className="metric">
              <small>
                SCORE
              </small>

              <strong>
                {hud.score.toLocaleString()}
              </strong>
            </div>

            <div className="metric center">
              <small>
                DISTANCE
              </small>

              <strong>
                {hud.distance}m
              </strong>
            </div>

            <div className="metric">
              <small>
                TOKENS
              </small>

              <strong>
                ◆ {hud.coins}
              </strong>
            </div>

            <div className="metric right">
              <small>
                SPEED
              </small>

              <strong>
                {hud.speed}
              </strong>
            </div>
          </div>

          {(
            hud.power ||
            hud.combo >= 2
          ) && (
            <div className="status-row">
              {hud.power && (
                <span className="power-pill">
                  {hud.power}
                </span>
              )}

              {hud.combo >= 2 && (
                <span className="combo-pill">
                  COMBO ×
                  {hud.combo}
                </span>
              )}
            </div>
          )}

          {phase === "playing" &&
            hud.landmark !==
              "ACADEMIC QUADRANGLE" && (
              <div className="landmark-chip">
                {hud.landmark}
              </div>
            )}

          <div className="mobile-controls">
            <button
              onPointerDown={() =>
                move("left")
              }
              aria-label="Move left"
            >
              ‹
            </button>

            <button
              onPointerDown={
                jump
              }
              aria-label="Jump"
            >
              ↑
            </button>

            <button
              onPointerDown={
                slide
              }
              aria-label="Slide"
            >
              ↓
            </button>

            <button
              onPointerDown={() =>
                move("right")
              }
              aria-label="Move right"
            >
              ›
            </button>
          </div>

          {phase === "menu" && (
            <div className="overlay">
              <div className="hero-card">
                <div className="eyebrow">
                  VGB ARCADE · 3D ENDLESS RUN
                </div>

                <h1>
                  RUN THE
                  <br />
                  <em>
                    CAMPUS.
                  </em>
                </h1>

                <p>
                  A real-time 3D
                  endless runner
                  through the
                  VidyaGyan campus.
                  Three lanes,
                  authored obstacle
                  patterns,
                  power-ups and a
                  world that keeps
                  moving.
                </p>

                <button
                  className="primary"
                  onClick={start}
                >
                  START RUN{" "}
                  <span>
                    →
                  </span>
                </button>

                <div className="controls">
                  <span>
                    ← →
                  </span>{" "}
                  LANES

                  <span>
                    ↑ / SPACE
                  </span>{" "}
                  JUMP

                  <span>
                    ↓
                  </span>{" "}
                  SLIDE
                </div>

                <div className="touch-note">
                  Swipe on the track
                  · tap to jump
                </div>
              </div>
            </div>
          )}

          {phase === "paused" && (
            <div className="overlay compact-overlay">
              <div className="pause-card">
                <div className="eyebrow">
                  RUN PAUSED
                </div>

                <h2>
                  TRACK FROZEN.
                </h2>

                <p>
                  The simulation
                  is paused. No
                  imaginary campus
                  administrator is
                  moving the
                  obstacles while
                  you are away.
                </p>

                <button
                  className="primary"
                  onClick={
                    togglePause
                  }
                >
                  RESUME{" "}
                  <span>
                    ▶
                  </span>
                </button>
              </div>
            </div>
          )}

          {phase ===
            "gameover" && (
            <div className="overlay">
              <div className="result-card">
                <div className="eyebrow">
                  RUN COMPLETE
                </div>

                <h2>
                  RUN
                  <br />
                  <em>
                    ENDED.
                  </em>
                </h2>

                <div className="result-grid">
                  <div>
                    <span>
                      SCORE
                    </span>

                    <b>
                      {hud.score.toLocaleString()}
                    </b>
                  </div>

                  <div>
                    <span>
                      DISTANCE
                    </span>

                    <b>
                      {hud.distance}m
                    </b>
                  </div>

                  <div>
                    <span>
                      TOKENS
                    </span>

                    <b>
                      ◆ {hud.coins}
                    </b>
                  </div>

                  <div>
                    <span>
                      BEST
                    </span>

                    <b>
                      {hud.best.toLocaleString()}
                    </b>
                  </div>
                </div>

                <button
                  className="primary"
                  onClick={start}
                >
                  RUN AGAIN{" "}
                  <span>
                    ↻
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        <footer>
          <span>
            VGB RUNNER · CAMPUS 3D
          </span>

          <span>
            THREE LANES · REAL-TIME 3D · PROCEDURAL TRACK
          </span>
        </footer>
      </section>

      <style jsx>{`
        .runner-page {
          min-height: 100dvh;
          padding: 18px;
          background:
            radial-gradient(
              circle at 50% -12%,
              #31585b 0,
              #09130f 50%,
              #040806 100%
            );
          color: #f7f4ea;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .runner-frame {
          width: min(1400px, 100%);
          margin: auto;
          overflow: hidden;
          border: 1px solid
            rgba(231, 208, 161, 0.16);
          border-radius: 24px;
          background: #08100c;
          box-shadow:
            0 30px 100px
              rgba(0, 0, 0, 0.48);
        }

        .topbar {
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.07);
          background: rgba(
            7,
            17,
            12,
            0.96
          );
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .brand-mark {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: #b84b35;
          color: #fff;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 0.08em;
        }

        .brand strong,
        .brand span {
          display: block;
        }

        .brand strong {
          font-size: 14px;
          letter-spacing: 0.14em;
        }

        .brand span {
          margin-top: 3px;
          color: #d7bd76;
          font-size: 8px;
          letter-spacing: 0.18em;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .top-stat {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          line-height: 1.05;
        }

        .top-stat span {
          color: #809184;
          font-size: 8px;
          letter-spacing: 0.18em;
        }

        .top-stat b {
          margin-top: 4px;
          font-size: 12px;
        }

        .icon-btn {
          width: 35px;
          height: 35px;
          border: 1px solid
            rgba(231, 214, 171, 0.14);
          border-radius: 10px;
          background: #142119;
          color: #f3f5ed;
          cursor: pointer;
        }

        .icon-btn:disabled {
          opacity: 0.3;
          cursor: default;
        }

        .game-wrap {
          position: relative;
          height: min(78vh, 820px);
          min-height: 560px;
          overflow: hidden;
          background: #78935c;
          touch-action: none;
          user-select: none;
        }

        .game-wrap canvas {
          display: block;
          width: 100%;
          height: 100%;
          cursor: grab;
          touch-action: none;
        }

        .hud {
          position: absolute;
          top: 16px;
          left: 20px;
          right: 20px;
          display: grid;
          grid-template-columns:
            1fr 1fr 1fr 1fr;
          pointer-events: none;
          text-shadow:
            0 2px 12px
              rgba(0, 0, 0, 0.55);
        }

        .metric {
          display: flex;
          flex-direction: column;
        }

        .metric.center {
          align-items: center;
        }

        .metric.right {
          align-items: flex-end;
        }

        .metric small {
          color: rgba(
            255,
            255,
            255,
            0.72
          );
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.2em;
        }

        .metric strong {
          font-size: 20px;
          letter-spacing: 0.01em;
        }

        .status-row {
          position: absolute;
          top: 64px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 7px;
          pointer-events: none;
        }

        .power-pill,
        .combo-pill {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.1em;
          white-space: nowrap;
        }

        .power-pill {
          background: #f0d06d;
          color: #34270b;
        }

        .combo-pill {
          border: 1px solid
            rgba(210, 239, 206, 0.2);
          background: #173f2d;
          color: #d8f2d8;
        }

        .landmark-chip {
          position: absolute;
          top: 18%;
          left: 50%;
          transform: translateX(-50%);
          padding: 8px 13px;
          border: 1px solid
            rgba(255, 245, 210, 0.2);
          border-radius: 999px;
          background: rgba(
            17,
            33,
            23,
            0.68
          );
          backdrop-filter: blur(9px);
          color: #f2ecd9;
          font-size: 8px;
          letter-spacing: 0.16em;
          pointer-events: none;
        }

        .overlay {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 24px;
          background:
            linear-gradient(
              90deg,
              rgba(5, 14, 9, 0.7),
              rgba(5, 14, 9, 0.18),
              rgba(5, 14, 9, 0.6)
            );
          backdrop-filter: blur(2px);
        }

        .compact-overlay {
          background: rgba(
            5,
            14,
            9,
            0.52
          );
        }

        .hero-card,
        .result-card,
        .pause-card {
          width: min(
            560px,
            calc(100% - 36px)
          );
          padding: 38px;
          border: 1px solid
            rgba(242, 225, 183, 0.17);
          border-radius: 23px;
          background:
            linear-gradient(
              145deg,
              rgba(17, 38, 25, 0.95),
              rgba(7, 20, 13, 0.92)
            );
          box-shadow:
            0 25px 70px
              rgba(0, 0, 0, 0.4);
        }

        .pause-card {
          width: min(
            400px,
            calc(100% - 36px)
          );
          text-align: center;
        }

        .eyebrow {
          color: #e1c568;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.22em;
        }

        .hero-card h1,
        .result-card h2 {
          margin: 17px 0;
          font-size: clamp(
            46px,
            7vw,
            78px
          );
          line-height: 0.86;
          letter-spacing: -0.055em;
        }

        .result-card h2 {
          font-size: 58px;
        }

        .pause-card h2 {
          margin: 15px 0;
          font-size: 42px;
          letter-spacing: -0.04em;
        }

        .hero-card h1 em,
        .result-card h2 em {
          color: #d7b653;
          font-style: normal;
        }

        .hero-card p,
        .pause-card p {
          max-width: 470px;
          color: #b6c3b6;
          font-size: 13px;
          line-height: 1.6;
        }

        .primary {
          margin-top: 8px;
          border: 0;
          border-radius: 13px;
          padding: 14px 17px;
          background: #d5413d;
          color: #fff;
          font-weight: 950;
          letter-spacing: 0.08em;
          cursor: pointer;
          box-shadow:
            0 12px 30px
              rgba(213, 65, 61, 0.22);
          transition:
            transform 0.15s ease,
            filter 0.15s ease;
        }

        .primary:hover {
          transform:
            translateY(-2px);
          filter: brightness(1.07);
        }

        .primary span {
          margin-left: 18px;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 18px;
          color: #809285;
          font-size: 8px;
          letter-spacing: 0.1em;
        }

        .controls span {
          padding: 4px 7px;
          border: 1px solid
            rgba(225, 221, 194, 0.14);
          border-radius: 6px;
          background: #142219;
          color: #eef4eb;
        }

        .touch-note {
          display: none;
          margin-top: 10px;
          color: #718174;
          font-size: 9px;
        }

        .result-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 8px;
          margin: 20px 0;
        }

        .result-grid div {
          padding: 13px;
          border: 1px solid
            rgba(230, 218, 177, 0.08);
          border-radius: 12px;
          background:
            rgba(
              230,
              218,
              177,
              0.05
            );
        }

        .result-grid span {
          display: block;
          color: #89978c;
          font-size: 8px;
          letter-spacing: 0.16em;
        }

        .result-grid b {
          display: block;
          margin-top: 5px;
          font-size: 17px;
        }

        .mobile-controls {
          display: none;
          position: absolute;
          left: 13px;
          right: 13px;
          bottom: 13px;
          justify-content: space-between;
          pointer-events: none;
        }

        .mobile-controls button {
          width: 54px;
          height: 46px;
          border: 1px solid
            rgba(238, 228, 190, 0.18);
          border-radius: 14px;
          background:
            rgba(
              10,
              28,
              17,
              0.68
            );
          color: #f3f3e9;
          font-size: 22px;
          backdrop-filter: blur(9px);
          pointer-events: auto;
          touch-action: manipulation;
        }

        footer {
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          border-top: 1px solid
            rgba(230, 214, 174, 0.08);
          background: #08100b;
          color: #607166;
          font-size: 8px;
          letter-spacing: 0.14em;
        }

        @media (max-width: 700px) {
          .runner-page {
            padding: 0;
          }

          .runner-frame {
            min-height: 100dvh;
            border-right: 0;
            border-left: 0;
            border-radius: 0;
          }

          .topbar {
            height: 60px;
            padding: 0 13px;
          }

          .top-actions {
            gap: 8px;
          }

          .top-stat:first-child {
            display: none;
          }

          .game-wrap {
            height: calc(
              100dvh - 102px
            );
            min-height: 0;
          }

          .hud {
            top: 12px;
            left: 13px;
            right: 13px;
          }

          .metric strong {
            font-size: 15px;
          }

          .status-row {
            top: 57px;
          }

          .hero-card,
          .result-card,
          .pause-card {
            padding: 27px;
          }

          .hero-card h1,
          .result-card h2 {
            font-size: 50px;
          }

          .controls {
            display: none;
          }

          .touch-note {
            display: block;
          }

          .mobile-controls {
            display: flex;
          }

          footer {
            height: 42px;
            padding: 0 12px;
            font-size: 7px;
          }

          footer span:last-child {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
