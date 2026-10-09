/**
 * KeyRush Offline AI Opponent Simulation Engine
 * Simulates realistic human typing behaviors, varying cadence, natural error corrections,
 * and adaptive difficulty scaling based on player history.
 */

export const AI_PRESETS = {
  beginner: {
    id: 'rookie_bot',
    name: 'Rookie Bolt',
    avatar: '🤖',
    color: '#00e5ff',
    carModel: 'talon',
    targetWpm: 40,
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
    targetWpm: 60,
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
    targetWpm: 80,
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
    targetWpm: 105,
    wpmVariance: 8,
    accuracy: 99,
    errorRecoveryDelayMs: 90,
    style: 'Grand Prix esports champion with laser precision'
  },
  adaptive: {
    id: 'neural_adaptive',
    name: 'Neural Adaptive AI',
    avatar: '🧠',
    color: '#00f59b',
    carModel: 'chronos',
    targetWpm: 70, // dynamically set
    wpmVariance: 4,
    accuracy: 96,
    errorRecoveryDelayMs: 200,
    style: 'Self-tuning algorithm matching your personal speed profile'
  }
};

export class AiOpponent {
  constructor(tier = 'intermediate', playerAvgWpm = 65) {
    this.tier = tier;
    this.config = { ...(AI_PRESETS[tier] || AI_PRESETS.intermediate) };

    if (tier === 'adaptive') {
      // Set target slightly above player's average for an engaging, competitive challenge
      this.config.targetWpm = Math.max(35, Math.min(125, playerAvgWpm + 3));
    }

    this.progress = 0;
    this.currentWpm = 0;
    this.totalChars = 0;
    this.typedChars = 0;
    this.errors = 0;
    this.isRunning = false;
    this.isFinished = false;
    this.timerId = null;
    this.startTime = null;
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

    // Calculate current character delay in milliseconds
    // Target WPM -> characters per minute = WPM * 5 -> chars per sec = (WPM * 5) / 60
    const targetCpm = this.config.targetWpm * 5;
    const baseDelayMs = (60000 / targetCpm);

    // Realistic human variance (+/- micro jitter)
    const jitter = (Math.random() * 2 - 1) * (this.config.wpmVariance * 3.5);
    let delay = Math.max(30, baseDelayMs + jitter);

    // Simulate occasional error
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
        if (onFinish) {
          onFinish({
            id: this.config.id,
            name: this.config.name,
            wpm: this.currentWpm,
            accuracy: this.config.accuracy,
            timeSec: (performance.now() - this.startTime) / 1000
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
