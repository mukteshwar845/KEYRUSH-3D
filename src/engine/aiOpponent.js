/**
 * KeyRush Offline AI Opponent Simulation Engine — Multi-Racer Grid
 * Simulates realistic human typing behaviors, varying cadence, natural error corrections,
 * multi-car grid management (3-5 opponents), lane assignments, and adaptive difficulty scaling.
 */

export const AI_PRESETS = {
  beginner: {
    id: 'rookie_bolt',
    name: 'Rookie Bolt',
    avatar: '🤖',
    color: '#00e5ff',
    carModel: 'talon',
    targetWpm: 42,
    wpmVariance: 5,
    accuracy: 92,
    errorRecoveryDelayMs: 400,
    style: 'Cautious and steady home-row driver'
  },
  intermediate: {
    id: 'street_cruiser',
    name: 'Street Cruiser',
    avatar: '⚡',
    color: '#ffb800',
    carModel: 'vortex',
    targetWpm: 62,
    wpmVariance: 6,
    accuracy: 95,
    errorRecoveryDelayMs: 250,
    style: 'Balanced street racer with consistent cadence'
  },
  advanced: {
    id: 'nitro_phantom',
    name: 'Nitro Phantom',
    avatar: '🔥',
    color: '#a855f7',
    carModel: 'phantom',
    targetWpm: 78,
    wpmVariance: 7,
    accuracy: 97,
    errorRecoveryDelayMs: 160,
    style: 'Aggressive tournament contender with high burst speed'
  },
  expert: {
    id: 'cyber_apex',
    name: 'Cyber Apex',
    avatar: '👑',
    color: '#ff3366',
    carModel: 'nebula',
    targetWpm: 96,
    wpmVariance: 8,
    accuracy: 98.5,
    errorRecoveryDelayMs: 90,
    style: 'Grand Prix esports champion with laser precision'
  },
  adaptive: {
    id: 'neural_adaptive',
    name: 'Neural Adaptive',
    avatar: '🧠',
    color: '#00f59b',
    carModel: 'chronos',
    targetWpm: 70, // dynamically set
    wpmVariance: 4,
    accuracy: 96,
    errorRecoveryDelayMs: 200,
    style: 'Self-tuning algorithm matching your personal speed profile'
  },
  // Additional grid contenders
  drift_king: {
    id: 'drift_king',
    name: 'Viper Drift',
    avatar: '🐍',
    color: '#ff0077',
    carModel: 'vortex',
    targetWpm: 56,
    wpmVariance: 6,
    accuracy: 94,
    errorRecoveryDelayMs: 280,
    style: 'High-risk lane drifting specialist'
  },
  ghost_rider: {
    id: 'ghost_rider',
    name: 'Ghost Sector',
    avatar: '👻',
    color: '#38bdf8',
    carModel: 'phantom',
    targetWpm: 84,
    wpmVariance: 6,
    accuracy: 97.5,
    errorRecoveryDelayMs: 140,
    style: 'Quiet, consistent metronomic rhythm'
  },
  titan_overdrive: {
    id: 'titan_overdrive',
    name: 'Titan Overdrive',
    avatar: '🛡️',
    color: '#f97316',
    carModel: 'nebula',
    targetWpm: 90,
    wpmVariance: 7,
    accuracy: 98,
    errorRecoveryDelayMs: 110,
    style: 'Heavy cadence with unrelenting forward surge'
  }
};

export class AiOpponent {
  constructor(tier = 'intermediate', playerAvgWpm = 65, customConfig = {}) {
    this.tier = tier;
    const base = AI_PRESETS[tier] || AI_PRESETS.intermediate;
    this.config = { ...base, ...customConfig };

    if (tier === 'adaptive') {
      this.config.targetWpm = Math.max(35, Math.min(125, playerAvgWpm + 3));
    }

    this.id = this.config.id;
    this.progress = 0;
    this.currentWpm = 0;
    this.totalChars = 0;
    this.typedChars = 0;
    this.errors = 0;
    this.isRunning = false;
    this.isFinished = false;
    this.timerId = null;
    this.startTime = null;
    this.finishTimeSec = null;
  }

  start(totalChars, onUpdate, onFinish) {
    this.totalChars = totalChars;
    this.typedChars = 0;
    this.progress = 0;
    this.errors = 0;
    this.isRunning = true;
    this.isFinished = false;
    this.startTime = performance.now();

    this.scheduleNextChar(onUpdate, onFinish);
  }

  scheduleNextChar(onUpdate, onFinish) {
    if (!this.isRunning || this.isFinished) return;

    // Target CPM -> characters per minute = WPM * 5
    const targetCpm = Math.max(100, this.config.targetWpm * 5);
    const baseDelayMs = 60000 / targetCpm;

    // Realistic human cadence jitter (+/- micro variations)
    const jitter = (Math.random() * 2 - 1) * (this.config.wpmVariance * 3.5);
    let delay = Math.max(35, baseDelayMs + jitter);

    // Simulate occasional error based on accuracy rating
    const makeError = (Math.random() * 100) > this.config.accuracy;
    if (makeError) {
      this.errors++;
      delay += this.config.errorRecoveryDelayMs;
    }

    this.timerId = setTimeout(() => {
      if (!this.isRunning || this.isFinished) return;

      this.typedChars++;
      this.progress = Math.min(1.0, this.typedChars / this.totalChars);

      const elapsedMin = Math.max(0.01, (performance.now() - this.startTime) / 60000);
      this.currentWpm = Math.round((this.typedChars / 5) / elapsedMin);

      if (onUpdate) {
        onUpdate({
          id: this.config.id,
          name: this.config.name,
          avatar: this.config.avatar,
          color: this.config.color,
          carModel: this.config.carModel,
          progress: this.progress,
          wpm: this.currentWpm,
          accuracy: this.config.accuracy,
          errors: this.errors
        });
      }

      if (this.typedChars >= this.totalChars) {
        this.isFinished = true;
        this.isRunning = false;
        this.finishTimeSec = (performance.now() - this.startTime) / 1000;
        if (onFinish) {
          onFinish({
            id: this.config.id,
            name: this.config.name,
            wpm: this.currentWpm,
            accuracy: this.config.accuracy,
            timeSec: this.finishTimeSec
          });
        }
      } else {
        this.scheduleNextChar(onUpdate, onFinish);
      }
    }, delay);
  }

  stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

/**
 * AiOpponentGrid
 * Coordinates a full 3 to 5 car competitor lineup with unique lanes, starting grid offsets,
 * real-time positions, gap calculations, and overtake events.
 */
export class AiOpponentGrid {
  constructor(difficulty = 'AMATEUR', playerAvgWpm = 65, count = 4) {
    this.difficulty = difficulty.toUpperCase();
    this.playerAvgWpm = playerAvgWpm;
    this.count = Math.max(2, Math.min(5, count));
    this.opponents = [];
    this.lastStandings = [];

    this.initGrid();
  }

  initGrid() {
    // Select roster keys matching the difficulty curve
    let selectedKeys = [];
    if (this.difficulty === 'NOVICE' || this.difficulty === 'ROOKIE') {
      selectedKeys = ['beginner', 'drift_king', 'intermediate', 'adaptive'];
    } else if (this.difficulty === 'PRO' || this.difficulty === 'EXPERT' || this.difficulty === 'CHAMPION') {
      selectedKeys = ['advanced', 'ghost_rider', 'titan_overdrive', 'expert'];
    } else {
      // AMATEUR / STANDARD: balanced competitive spread
      selectedKeys = ['intermediate', 'drift_king', 'advanced', 'adaptive'];
    }

    // Available highway lanes: lateral offsets X (road width is ~24)
    // Lanes at: -6.5, -2.2, 2.2, 6.5
    const lanes = [-6.5, 2.5, 6.5, -2.5];

    // Starting grid staggered visual offsets (behind/beside player on start line)
    // Negative Z means behind player, positive means ahead
    const startZOffsets = [6.0, -8.0, 14.0, -16.0];

    this.opponents = selectedKeys.slice(0, this.count).map((key, idx) => {
      const preset = AI_PRESETS[key] || AI_PRESETS.intermediate;
      const ai = new AiOpponent(key, this.playerAvgWpm, {
        laneX: lanes[idx % lanes.length],
        startZ: startZOffsets[idx % startZOffsets.length]
      });

      return {
        ai,
        id: ai.config.id,
        name: ai.config.name,
        avatar: ai.config.avatar,
        color: ai.config.color,
        carModel: ai.config.carModel,
        laneX: lanes[idx % lanes.length],
        startZ: startZOffsets[idx % startZOffsets.length],
        progress: 0,
        wpm: 0,
        accuracy: ai.config.accuracy,
        isFinished: false,
        finishTimeSec: null
      };
    });
  }

  start(totalChars, onGridUpdate, onGridFinish) {
    let finishedCount = 0;

    this.opponents.forEach(entry => {
      entry.ai.start(
        totalChars,
        (stats) => {
          entry.progress = stats.progress;
          entry.wpm = stats.wpm;
          entry.accuracy = stats.accuracy;
          if (onGridUpdate) onGridUpdate(this.getOpponentsData());
        },
        (finalStats) => {
          entry.isFinished = true;
          entry.finishTimeSec = finalStats.timeSec;
          finishedCount++;
          if (finishedCount === this.opponents.length && onGridFinish) {
            onGridFinish(this.getOpponentsData());
          }
        }
      );
    });
  }

  stop() {
    this.opponents.forEach(entry => entry.ai.stop());
  }

  getOpponentsData() {
    return this.opponents.map(o => ({
      id: o.id,
      name: o.name,
      avatar: o.avatar,
      color: o.color,
      carModel: o.carModel,
      laneX: o.laneX,
      startZ: o.startZ,
      progress: o.progress,
      wpm: o.wpm,
      accuracy: o.accuracy,
      isFinished: o.isFinished,
      finishTimeSec: o.finishTimeSec
    }));
  }

  /**
   * Calculate full race standings (P1 to P5) comparing player + all AI competitors
   */
  calculateStandings(playerStats) {
    const list = [
      {
        id: 'player',
        name: playerStats.name || 'Pilot (You)',
        avatar: playerStats.avatar || '🏎️',
        carModel: playerStats.carId || 'talon',
        color: '#00e5ff',
        isPlayer: true,
        progress: playerStats.progress || 0,
        wpm: playerStats.wpm || 0,
        accuracy: playerStats.accuracy || 100,
        isFinished: playerStats.isFinished || false
      },
      ...this.opponents.map(o => ({
        id: o.id,
        name: o.name,
        avatar: o.avatar,
        carModel: o.carModel,
        color: o.color,
        isPlayer: false,
        progress: o.progress,
        wpm: o.wpm,
        accuracy: o.accuracy,
        isFinished: o.isFinished
      }))
    ];

    // Sort descending by progress (further down the track = higher rank)
    list.sort((a, b) => {
      if (b.progress !== a.progress) {
        return b.progress - a.progress;
      }
      return b.wpm - a.wpm;
    });

    // Assign positions 1..N and compute gap to player
    const playerIndex = list.findIndex(r => r.isPlayer);
    const leader = list[0];

    const ranked = list.map((racer, idx) => {
      const rank = idx + 1;
      let gapText = '';
      if (idx === 0) {
        gapText = 'LEADER';
      } else if (racer.isPlayer) {
        const progDiff = (leader.progress - racer.progress) * 100;
        gapText = progDiff > 0 ? `-${progDiff.toFixed(1)}%` : 'TIED';
      } else {
        const progDiff = (racer.progress - list[playerIndex].progress) * 100;
        if (progDiff > 0) {
          gapText = `+${progDiff.toFixed(1)}% ahead`;
        } else if (progDiff < 0) {
          gapText = `${progDiff.toFixed(1)}% behind`;
        } else {
          gapText = 'TIED';
        }
      }

      return {
        ...racer,
        rank,
        gapText
      };
    });

    return {
      standings: ranked,
      playerPosition: playerIndex + 1,
      totalRacers: list.length,
      playerAhead: playerIndex === 0
    };
  }
}
