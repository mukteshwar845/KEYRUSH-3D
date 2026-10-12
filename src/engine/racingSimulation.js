/**
 * KEYRUSH Authoritative Racing Simulation Engine
 * Single Source of Truth for Vehicle Physics, Delta-Time Integration,
 * Lane Navigation, Competitive Multi-Car AI Racing, and Monotonic Progress.
 */

import { AI_PRESETS } from './aiOpponent.js';

export const HIGHWAY_LANES = [-9.75, -3.25, 3.25, 9.75]; // 4 Highway Lanes (Outer-L, Center-L, Center-R, Outer-R)
export const ROAD_HALF_WIDTH = 13.0; // Total road width is 26 units

export class RacingSimulation {
  constructor(options = {}) {
    this.totalDistance = options.totalDistance || 1000.0; // Metres
    this.lanes = [...(options.lanes || HIGHWAY_LANES)];
    this.difficulty = (options.difficulty || 'AMATEUR').toUpperCase();
    this.playerAvgWpm = options.playerAvgWpm || 65;
    this.opponentCount = Math.max(2, Math.min(5, options.opponentCount || 4));

    // Simulation state: 'ready' | 'countdown' | 'racing' | 'paused' | 'finished'
    this.state = 'ready';
    this.elapsedTime = 0;

    // Player Vehicle Authoritative Physics State
    this.player = {
      id: 'player',
      name: options.playerName || 'Pilot (You)',
      avatar: options.playerAvatar || '🏎️',
      carModel: options.playerCarModel || 'talon',
      color: options.playerColor || '#00e5ff',
      isPlayer: true,

      // Longitudinal Physics
      distance: 0.0,          // Monotonic race distance in metres
      speedMps: 0.0,          // Actual longitudinal speed in m/s
      targetSpeedMps: 0.0,    // Target speed in m/s driven by typing cadence
      maxSpeedMps: 76.0,      // Max top speed (~274 km/h)
      accelRate: 14.5,        // Acceleration response in m/s^2
      dragCoeff: 0.0075,      // Aerodynamic drag
      rollingFriction: 2.2,   // Rolling friction in m/s^2

      // Lateral Lane State
      laneIndex: 1,           // Default to Center-Left lane (-3.25)
      targetLaneIndex: 1,
      laneX: this.lanes[1],
      targetLaneX: this.lanes[1],
      steerAngle: 0.0,
      lastLaneChangeTime: -9999,

      // Typing Cadence Telemetry
      wpm: 0,
      accuracy: 100,
      streak: 0,
      errorCount: 0,
      lastKeystrokeTime: 0,
      isBraking: false,
      isFinished: false,
      finishTime: null,
      rank: this.opponentCount + 1,
      gapText: 'START'
    };

    // AI Competitors
    this.opponents = [];
    this.initOpponents();

    // Standings Cache
    this.standings = [];
    this.updateStandings();
  }

  initOpponents() {
    let rosterKeys = [];
    if (this.difficulty === 'NOVICE' || this.difficulty === 'ROOKIE') {
      rosterKeys = ['beginner', 'drift_king', 'intermediate', 'adaptive'];
    } else if (this.difficulty === 'PRO' || this.difficulty === 'EXPERT' || this.difficulty === 'CHAMPION') {
      rosterKeys = ['advanced', 'ghost_rider', 'titan_overdrive', 'expert'];
    } else {
      rosterKeys = ['intermediate', 'drift_king', 'advanced', 'adaptive'];
    }

    // Default lane spread and staggered grid offsets (metres relative to player)
    const initialLanes = [0, 2, 3, 1]; // lane indices
    const gridStartZ = [6.0, -8.0, 12.0, -14.0];

    this.opponents = rosterKeys.slice(0, this.opponentCount).map((key, idx) => {
      const preset = AI_PRESETS[key] || AI_PRESETS.intermediate;
      const laneIdx = initialLanes[idx % initialLanes.length];
      const startDist = gridStartZ[idx % gridStartZ.length];

      // Convert target WPM to baseline m/s (e.g. 60 WPM -> ~39 m/s = 140 km/h)
      let baseWpm = preset.targetWpm;
      if (key === 'adaptive') {
        baseWpm = Math.max(38, Math.min(115, this.playerAvgWpm + (Math.random() * 4 - 2)));
      }
      const baseTargetMps = (baseWpm / 1.75) + 5.0;

      return {
        id: preset.id || `ai_${idx + 1}`,
        name: preset.name,
        avatar: preset.avatar,
        carModel: preset.carModel || 'vortex',
        color: preset.color || '#ffb800',
        isPlayer: false,

        // Longitudinal Physics
        distance: startDist,
        speedMps: 0.0,
        baseTargetMps,
        targetSpeedMps: baseTargetMps,
        maxSpeedMps: baseTargetMps * 1.25,
        accelRate: 10.5 + (idx % 3) * 2.0, // varied acceleration capabilities
        speedVariance: (preset.wpmVariance || 5) * 0.45,
        cadencePhase: Math.random() * Math.PI * 2,
        cadenceFreq: 0.35 + Math.random() * 0.3,

        // Lateral Lane State
        laneIndex: laneIdx,
        targetLaneIndex: laneIdx,
        laneX: this.lanes[laneIdx],
        targetLaneX: this.lanes[laneIdx],
        steerAngle: 0.0,
        wanderPhase: Math.random() * Math.PI * 2,

        // Tactical AI Navigation
        reactionTimer: 0.4 + Math.random() * 0.6,
        timeSinceDecision: Math.random() * 0.5,

        // Telemetry
        wpm: Math.round(baseWpm),
        accuracy: preset.accuracy || 95,
        isFinished: false,
        finishTime: null,
        rank: idx + 1,
        gapText: 'TIED'
      };
    });
  }

  startCountdown() {
    this.state = 'countdown';
  }

  startRace() {
    this.state = 'racing';
    this.player.lastKeystrokeTime = performance.now();
  }

  pause() {
    if (this.state === 'racing') {
      this.state = 'paused';
    }
  }

  resume() {
    if (this.state === 'paused') {
      this.state = 'racing';
      this.player.lastKeystrokeTime = performance.now();
    }
  }

  reset() {
    this.state = 'ready';
    this.elapsedTime = 0;

    // Reset Player
    this.player.distance = 0.0;
    this.player.speedMps = 0.0;
    this.player.targetSpeedMps = 0.0;
    this.player.laneIndex = 1;
    this.player.targetLaneIndex = 1;
    this.player.laneX = this.lanes[1];
    this.player.targetLaneX = this.lanes[1];
    this.player.steerAngle = 0.0;
    this.player.lastLaneChangeTime = -9999;
    this.player.wpm = 0;
    this.player.accuracy = 100;
    this.player.streak = 0;
    this.player.errorCount = 0;
    this.player.isBraking = false;
    this.player.isFinished = false;
    this.player.finishTime = null;

    // Reinitialize opponents
    this.initOpponents();
    this.updateStandings();
  }

  /**
   * Called when player types a correct character
   */
  handleCorrectKeystroke(stats) {
    if (this.state !== 'racing') return;

    const now = performance.now();
    this.player.lastKeystrokeTime = now;
    this.player.wpm = stats.wpm || this.player.wpm;
    this.player.accuracy = stats.accuracy || this.player.accuracy;
    this.player.streak = stats.currentStreak || 0;
    this.player.isBraking = false;

    // Calculate target speed from typing performance and streak
    // Example: 40 WPM -> ~28 m/s (~100 km/h)
    //          70 WPM -> ~45 m/s (~162 km/h)
    //          100 WPM -> ~62 m/s (~223 km/h)
    const streakBonus = Math.min(6.0, this.player.streak * 0.25);
    const calculatedTarget = Math.max(12.0, (this.player.wpm / 1.75) + 5.0 + streakBonus);
    this.player.targetSpeedMps = Math.min(this.player.maxSpeedMps, calculatedTarget);

    // Immediate acceleration impulse from crisp keystroke
    const impulse = Math.min(1.8, 0.9 + (this.player.streak > 10 ? 0.6 : 0.2));
    this.player.speedMps = Math.min(this.player.targetSpeedMps, this.player.speedMps + impulse);
  }

  /**
   * Called when player makes a typing error
   */
  handleMistake(stats) {
    if (this.state !== 'racing') return;

    this.player.errorCount = stats.errorCount || (this.player.errorCount + 1);
    this.player.accuracy = stats.accuracy || this.player.accuracy;
    this.player.streak = 0;
    this.player.isBraking = true;

    // Apply speed penalty: 14% reduction + drop target speed
    this.player.speedMps = Math.max(0, this.player.speedMps * 0.86);
    this.player.targetSpeedMps = Math.max(0, this.player.targetSpeedMps * 0.80);

    setTimeout(() => {
      this.player.isBraking = false;
    }, 380);
  }

  /**
   * Lateral Lane Controls: -1 for left lane, +1 for right lane
   */
  steerLane(direction) {
    if (this.state !== 'racing') return false;

    const now = performance.now();
    // Cooldown check (180ms) to prevent auto-repeat runaway
    if (now - this.player.lastLaneChangeTime < 180) {
      return false;
    }

    const nextLane = this.player.targetLaneIndex + direction;
    // Strict clamp to road lane bounds [0, 3]
    if (nextLane < 0 || nextLane >= this.lanes.length) {
      return false;
    }

    // Collision Check: Check if an opponent car currently occupies destination lane
    const isOccupied = this.opponents.some(opp => {
      if (opp.targetLaneIndex === nextLane || Math.abs(opp.laneX - this.lanes[nextLane]) < 2.0) {
        // Longitudinal proximity check: within 4.5 metres
        const distDiff = Math.abs(opp.distance - this.player.distance);
        return distDiff < 4.5;
      }
      return false;
    });

    if (isOccupied) {
      // Destination lane blocked by competitor; prevent overlapping
      return false;
    }

    this.player.targetLaneIndex = nextLane;
    this.player.targetLaneX = this.lanes[nextLane];
    this.player.lastLaneChangeTime = now;
    return true;
  }

  /**
   * Main authoratative physics update loop executed per frame with delta-time
   */
  update(delta) {
    if (this.state !== 'racing') return;

    this.elapsedTime += delta;
    const now = performance.now();

    // 1. UPDATE PLAYER PHYSICS
    // Natural aerodynamic drag & coasting if user pauses typing > 450ms
    const timeSinceType = now - this.player.lastKeystrokeTime;
    if (timeSinceType > 450) {
      // Target speed decays toward 0
      this.player.targetSpeedMps = Math.max(0, this.player.targetSpeedMps - (16.0 * delta));
    }

    // Vehicle inertia integration
    if (this.player.speedMps < this.player.targetSpeedMps) {
      this.player.speedMps = Math.min(
        this.player.targetSpeedMps,
        this.player.speedMps + (this.player.accelRate * delta)
      );
    } else if (this.player.speedMps > this.player.targetSpeedMps) {
      // Natural deceleration from aerodynamic drag + friction
      const drag = (this.player.rollingFriction + (this.player.dragCoeff * this.player.speedMps * this.player.speedMps)) * delta;
      this.player.speedMps = Math.max(this.player.targetSpeedMps, this.player.speedMps - drag);
    }

    // Integrate forward longitudinal movement
    this.player.distance += this.player.speedMps * delta;

    // Smooth lateral lane interpolation
    const prevLaneX = this.player.laneX;
    this.player.laneX = this.lerp(this.player.laneX, this.player.targetLaneX, Math.min(1.0, delta * 8.5));
    this.player.steerAngle = (this.player.targetLaneX - this.player.laneX) * 0.18;

    // Check Player finish condition
    if (this.player.distance >= this.totalDistance && !this.player.isFinished) {
      this.player.isFinished = true;
      this.player.finishTime = this.elapsedTime;
    }

    // 2. UPDATE AI COMPETITORS
    this.opponents.forEach(opp => {
      if (opp.isFinished) return;

      opp.timeSinceDecision += delta;

      // Realistic speed modulation (sinusoidal human-like cadence drift)
      const cadenceDrift = Math.sin(this.elapsedTime * opp.cadenceFreq + opp.cadencePhase) * opp.speedVariance;
      let desiredSpeed = Math.min(opp.maxSpeedMps, Math.max(15.0, opp.baseTargetMps + cadenceDrift));

      // AI Radar & Traffic Avoidance: look for vehicles ahead in current lane
      if (opp.timeSinceDecision >= opp.reactionTimer) {
        opp.timeSinceDecision = 0;
        opp.reactionTimer = 0.5 + Math.random() * 0.5;

        const vehicleAhead = this.findVehicleAheadInLane(opp.targetLaneIndex, opp.distance);
        if (vehicleAhead && (vehicleAhead.distance - opp.distance) < 14.0) {
          // Path blocked! Look to adjacent lanes for safe overtaking maneuver
          const laneOptions = [];
          if (opp.targetLaneIndex > 0) laneOptions.push(opp.targetLaneIndex - 1);
          if (opp.targetLaneIndex < this.lanes.length - 1) laneOptions.push(opp.targetLaneIndex + 1);

          // Find clear adjacent lane
          let safeLane = null;
          for (const candLane of laneOptions) {
            if (this.isLaneClear(candLane, opp.distance, 12.0, 6.0)) {
              safeLane = candLane;
              break;
            }
          }

          if (safeLane !== null) {
            // Perform safe lane change overtake!
            opp.targetLaneIndex = safeLane;
            opp.targetLaneX = this.lanes[safeLane];
          } else {
            // Both lanes blocked, lift throttle and follow leader
            desiredSpeed = Math.min(desiredSpeed, vehicleAhead.speedMps * 0.94);
          }
        }
      }

      opp.targetSpeedMps = desiredSpeed;

      // Inertia acceleration/braking
      if (opp.speedMps < opp.targetSpeedMps) {
        opp.speedMps = Math.min(opp.targetSpeedMps, opp.speedMps + (opp.accelRate * delta));
      } else {
        opp.speedMps = Math.max(opp.targetSpeedMps, opp.speedMps - (4.5 * delta));
      }

      // Integrate forward longitudinal movement
      opp.distance += opp.speedMps * delta;

      // Smooth lateral movement with human-like subtle wander
      const wander = Math.sin(this.elapsedTime * 0.8 + opp.wanderPhase) * 0.28;
      opp.laneX = this.lerp(opp.laneX, opp.targetLaneX + wander, Math.min(1.0, delta * 4.5));
      opp.steerAngle = (opp.targetLaneX - opp.laneX) * 0.16;

      // Simulated WPM display based on actual speed
      opp.wpm = Math.round((opp.speedMps * 3.6) / 2.35);

      // Check finish condition
      if (opp.distance >= this.totalDistance) {
        opp.isFinished = true;
        opp.finishTime = this.elapsedTime;
      }
    });

    // 3. UPDATE AUTHORITATIVE STANDINGS
    this.updateStandings();

    // Check if entire grid or player has completed race
    if (this.player.isFinished && this.opponents.every(o => o.isFinished)) {
      this.state = 'finished';
    }
  }

  findVehicleAheadInLane(laneIndex, myDistance) {
    let closest = null;
    let closestGap = Infinity;

    // Check player
    if (this.player.targetLaneIndex === laneIndex && this.player.distance > myDistance) {
      const gap = this.player.distance - myDistance;
      closest = this.player;
      closestGap = gap;
    }

    // Check other AI racers
    this.opponents.forEach(other => {
      if (other.targetLaneIndex === laneIndex && other.distance > myDistance) {
        const gap = other.distance - myDistance;
        if (gap < closestGap) {
          closest = other;
          closestGap = gap;
        }
      }
    });

    return closest;
  }

  isLaneClear(laneIndex, myDistance, checkAheadDist = 12.0, checkBehindDist = 6.0) {
    // Check player
    if (this.player.targetLaneIndex === laneIndex || Math.abs(this.player.laneX - this.lanes[laneIndex]) < 2.0) {
      const diff = this.player.distance - myDistance;
      if (diff >= -checkBehindDist && diff <= checkAheadDist) return false;
    }

    // Check other opponents
    for (const other of this.opponents) {
      if (other.targetLaneIndex === laneIndex || Math.abs(other.laneX - this.lanes[laneIndex]) < 2.0) {
        const diff = other.distance - myDistance;
        if (diff >= -checkBehindDist && diff <= checkAheadDist) return false;
      }
    }

    return true;
  }

  updateStandings() {
    const allRacers = [this.player, ...this.opponents];

    // Sort descending by race distance (or finish time if finished)
    allRacers.sort((a, b) => {
      if (a.isFinished && b.isFinished) {
        return a.finishTime - b.finishTime;
      }
      if (a.isFinished && !b.isFinished) return -1;
      if (!a.isFinished && b.isFinished) return 1;

      // Active racing: greater distance = higher rank
      if (b.distance !== a.distance) {
        return b.distance - a.distance;
      }
      return b.speedMps - a.speedMps;
    });

    const leader = allRacers[0];
    const playerEntry = this.player;

    this.standings = allRacers.map((racer, idx) => {
      const rank = idx + 1;
      racer.rank = rank;

      let gapText = '';
      if (idx === 0) {
        gapText = 'LEADER';
      } else {
        const distDiff = Math.max(0, leader.distance - racer.distance);
        if (distDiff <= 0.4) {
          gapText = 'TIED';
        } else if (leader.speedMps > 6.0) {
          const timeDelta = distDiff / Math.max(12.0, leader.speedMps);
          if (timeDelta < 25.0) {
            gapText = `+${timeDelta.toFixed(1)}s`;
          } else {
            gapText = `+${Math.round(distDiff)}m`;
          }
        } else {
          gapText = `+${distDiff.toFixed(1)}m`;
        }
      }
      racer.gapText = gapText;

      return {
        id: racer.id,
        name: racer.name,
        avatar: racer.avatar,
        carModel: racer.carModel,
        color: racer.color,
        isPlayer: racer.isPlayer,
        distance: racer.distance,
        progress: Math.min(1.0, racer.distance / this.totalDistance),
        speedMps: racer.speedMps,
        speedKmh: Math.round(racer.speedMps * 3.6),
        wpm: racer.wpm,
        accuracy: racer.accuracy,
        rank,
        gapText,
        isFinished: racer.isFinished
      };
    });
  }

  getSpeedKmh() {
    return Math.round(this.player.speedMps * 3.6);
  }

  getTelemetry() {
    return {
      state: this.state,
      elapsedTime: this.elapsedTime,
      totalDistance: this.totalDistance,
      totalRacers: this.opponents.length + 1,
      player: {
        ...this.player,
        speedKmh: Math.round(this.player.speedMps * 3.6),
        progress: Math.min(1.0, this.player.distance / this.totalDistance)
      },
      opponents: this.opponents.map(o => ({
        ...o,
        speedKmh: Math.round(o.speedMps * 3.6),
        progress: Math.min(1.0, o.distance / this.totalDistance)
      })),
      standings: this.standings
    };
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }
}
