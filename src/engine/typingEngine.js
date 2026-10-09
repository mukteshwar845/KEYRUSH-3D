/**
 * KeyRush Real-time Typing Engine
 * High-precision WPM, Accuracy, CPM, Consistency, and Keystroke Telemetry
 */

export class TypingEngine {
  constructor(options = {}) {
    this.targetText = '';
    this.currentIndex = 0;
    this.startTime = null;
    this.endTime = null;
    this.isStarted = false;
    this.isFinished = false;

    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.errorCount = 0;
    this.unfixedErrors = 0;

    this.errorPenaltyMode = options.errorPenaltyMode || 'standard'; // 'forgiving', 'standard', 'hardcore'
    this.keyErrors = {}; // counts per key
    this.keystrokeTimestamps = []; // for consistency calculations
    this.currentStreak = 0;
    this.maxStreak = 0;

    // Callbacks
    this.onCharTyped = options.onCharTyped || (() => {});
    this.onMistake = options.onMistake || (() => {});
    this.onProgress = options.onProgress || (() => {});
    this.onFinish = options.onFinish || (() => {});

    // Speed smoothing
    this.instantWpm = 0;
    this.smoothWpm = 0;
    this.lastCharTime = null;
    this.penaltyMultiplier = 1.0;
  }

  loadText(text) {
    this.targetText = text.trim();
    this.currentIndex = 0;
    this.startTime = null;
    this.endTime = null;
    this.isStarted = false;
    this.isFinished = false;
    this.totalKeystrokes = 0;
    this.correctKeystrokes = 0;
    this.errorCount = 0;
    this.keyErrors = {};
    this.keystrokeTimestamps = [];
    this.currentStreak = 0;
    this.maxStreak = 0;
    this.instantWpm = 0;
    this.smoothWpm = 0;
    this._smoothWpm = 0;
    this.lastCharTime = null;
    this.penaltyMultiplier = 1.0;
  }

  handleKey(key) {
    if (this.isFinished || !this.targetText) return null;

    const now = performance.now();

    // Start on first keypress
    if (!this.isStarted) {
      this.isStarted = true;
      this.startTime = now;
      this.lastCharTime = now;
    }

    const expectedChar = this.targetText[this.currentIndex];

    // Ignore non-printable keys like Shift, Control, Alt
    if (key.length > 1 && key !== 'Backspace') {
      return null;
    }

    if (key === 'Backspace') {
      if (this.currentIndex > 0) {
        // Backspace allowed in certain penalty modes
        this.currentIndex--;
        this.onProgress(this.getProgress(), this.getStats());
      }
      return { type: 'backspace', currentIndex: this.currentIndex };
    }

    this.totalKeystrokes++;
    this.keystrokeTimestamps.push(now);

    const isMatch = (key === expectedChar);

    if (isMatch) {
      this.correctKeystrokes++;
      this.currentStreak++;
      if (this.currentStreak > this.maxStreak) {
        this.maxStreak = this.currentStreak;
      }

      // Restore penalty multiplier smoothly
      this.penaltyMultiplier = Math.min(1.0, this.penaltyMultiplier + 0.05);

      // Instant interval
      if (this.lastCharTime) {
        const intervalSec = (now - this.lastCharTime) / 1000;
        if (intervalSec > 0.01) {
          const rawCharWpm = (1 / 5) / (intervalSec / 60);
          this.instantWpm = Math.min(220, rawCharWpm);
        }
      }
      this.lastCharTime = now;
      this.currentIndex++;

      const stats = this.getStats();
      this.onCharTyped(key, true, stats);
      this.onProgress(this.getProgress(), stats);

      // Check if finished
      if (this.currentIndex >= this.targetText.length) {
        this.finish();
      }

      return { type: 'correct', char: key, index: this.currentIndex - 1, stats };
    } else {
      // Mistake made
      this.errorCount++;
      this.currentStreak = 0;

      // Track weak key
      const expectedLower = expectedChar.toLowerCase();
      this.keyErrors[expectedLower] = (this.keyErrors[expectedLower] || 0) + 1;

      // Apply error penalty
      let penaltyDrop = 0.20; // standard
      if (this.errorPenaltyMode === 'forgiving') penaltyDrop = 0.10;
      if (this.errorPenaltyMode === 'hardcore') penaltyDrop = 0.40;
      this.penaltyMultiplier = Math.max(0.2, this.penaltyMultiplier - penaltyDrop);

      const stats = this.getStats();
      this.onMistake(expectedChar, key, stats);

      return { type: 'incorrect', expected: expectedChar, actual: key, index: this.currentIndex, stats };
    }
  }

  finish() {
    if (this.isFinished) return;
    this.isFinished = true;
    this.endTime = performance.now();
    const finalStats = this.getStats();
    this.onFinish(finalStats);
  }

  getProgress() {
    if (!this.targetText.length) return 0;
    return Math.min(1.0, this.currentIndex / this.targetText.length);
  }

  getElapsedSeconds() {
    if (!this.startTime) return 0;
    const end = this.endTime || performance.now();
    return Math.max(0.1, (end - this.startTime) / 1000);
  }

  getStats() {
    const elapsedSec = this.getElapsedSeconds();
    const elapsedMin = elapsedSec / 60;

    // Standard formula: (characters / 5) / minutes
    // Use a minimum of 2 seconds to avoid huge WPM spikes on first keystrokes
    const safeElapsedMin = Math.max(elapsedMin, 2 / 60);
    const rawWpm = (this.totalKeystrokes / 5) / safeElapsedMin;
    const netWpm = (this.correctKeystrokes / 5) / safeElapsedMin;

    // Effective racing WPM with penalty multiplier
    const effectiveWpm = Math.max(0, Math.min(300, netWpm * this.penaltyMultiplier));

    // Apply exponential moving average for smooth display
    if (!this._smoothWpm) this._smoothWpm = 0;
    const alpha = elapsedSec < 3 ? 0.3 : 0.15; // faster initial smoothing, then slower
    this._smoothWpm = this._smoothWpm * (1 - alpha) + effectiveWpm * alpha;

    const accuracy = this.totalKeystrokes > 0
      ? (this.correctKeystrokes / this.totalKeystrokes) * 100
      : 100;

    const cpm = Math.round((this.correctKeystrokes / safeElapsedMin));

    // Calculate consistency based on standard deviation of keystroke intervals
    let consistency = 95;
    if (this.keystrokeTimestamps.length > 5) {
      const intervals = [];
      for (let i = 1; i < this.keystrokeTimestamps.length; i++) {
        intervals.push(this.keystrokeTimestamps[i] - this.keystrokeTimestamps[i - 1]);
      }
      const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
      const stdDev = Math.sqrt(variance);
      const cv = mean > 0 ? (stdDev / mean) : 0; // coefficient of variation
      consistency = Math.max(50, Math.min(99, Math.round(100 - (cv * 40))));
    }

    return {
      wpm: Math.round(this._smoothWpm),
      rawWpm: Math.round(rawWpm),
      netWpm: Math.round(netWpm),
      accuracy: Math.round(accuracy * 10) / 10,
      cpm,
      errorCount: this.errorCount,
      totalKeystrokes: this.totalKeystrokes,
      correctKeystrokes: this.correctKeystrokes,
      elapsedSeconds: Math.round(elapsedSec * 10) / 10,
      progress: this.getProgress(),
      currentStreak: this.currentStreak,
      maxStreak: this.maxStreak,
      consistency,
      penaltyMultiplier: this.penaltyMultiplier,
      keyErrors: { ...this.keyErrors }
    };
  }
}
