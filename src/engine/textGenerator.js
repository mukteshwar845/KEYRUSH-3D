/**
 * KeyRush Text Passage & Drill Generator
 * Provides categorized text passages for Rookie, Amateur, Pro, Elite,
 * Touch-Typing Academy lessons, and Diagnostic Assessments.
 */

export const PASSAGE_DATABASE = {
  ROOKIE: [
    'all fall dad glass flask half salad ask dash jack lake glad fall hall jazz sad flash glad',
    'the cat ran fast down the dark road to see the old red car on the hill with joy and fun',
    'keep your hands calm on the home row keys and let your fingers find each letter smoothly',
    'simple words build quick habits for every racer who wants to become the fastest driver here',
    'a quick start makes a great lap time so look ahead and feel the rhythm of your typing speed'
  ],
  AMATEUR: [
    'Speed and precision define true champions on the circuit. Keep your focus sharp and your hands steady.',
    'Every keystroke accelerates your engine forward. Maintain an even cadence to avoid sudden engine stalls.',
    'The secret to fast typing is relaxing your shoulders, staying on the home row, and breathing with each sentence.',
    'Driving at eighty miles an hour requires absolute anticipation. You must read two words ahead of what you type.',
    'Consistent daily practice creates muscle memory faster than any single marathon session on the keyboard.'
  ],
  PRO: [
    'In competitive motorsports, victory belongs not merely to the boldest driver, but to the one whose telemetry shows flawless execution across every single sector of the course.',
    'High-speed aerodynamic efficiency demands zero wasted movement; similarly, elite touch-typists minimize finger travel distance across the keyboard layout to achieve triple-digit WPM.',
    'Under intense championship pressure, maintaining 99% typing accuracy yields a significantly higher average velocity than reckless bursts punctuated by repeated backspace stalls.',
    'The twin-turbocharged engine roars as you approach turn four at 185 mph, your fingers dancing seamlessly across the mechanical switches without a fraction of hesitation.',
    'Telemetry analysis confirms that smooth throttle modulation through corner apexes directly parallels consistent inter-keystroke timing in professional typing tournaments.'
  ],
  ELITE: [
    'async function raceLoop(delta: number, wpm: number): Promise<TelemetryReport> { const throttle = Math.min(1.0, wpm / 120.0); return await telemetry.sync({ throttle, latencyMs: 14.2 }); }',
    'const apexVector = new Vector3(Math.cos(theta) * radius, 0.0, Math.sin(theta) * radius); const driftCoefficient = (slipAngle > 0.15) ? 0.82 : 1.0; vehicle.applyForce(apexVector.multiplyScalar(driftCoefficient));',
    "The hypercar's carbon-ceramic braking threshold (deceleration > 2.4g) requires millisecond precision: [P1 = 0x7F, P2 = 0x3C, status: 'NOMINAL', boost_psi: 28.6, rpm: 9200];",
    'Touch-typing at 140+ WPM with nested brackets { [ (x, y) => x !== null && y.length > 0 ] } separates amateur keystrokes from Grand Prix esports dominance.',
    'export type ChampionshipLeaderboard = Record<string, { rank: number; bestWpm: number; accuracy: number; trophies: string[] }>; const topTen = Object.values(board).sort((a,b) => b.bestWpm - a.bestWpm);'
  ],
  DIAGNOSTIC: [
    'Welcome to the KeyRush diagnostic assessment. Type naturally without rushing or pausing. This test evaluates your raw speed, inter-key timing consistency, and error distribution across home-row and peripheral keys to calibrate your optimal racing championship league tier.'
  ],
  ACADEMY: {
    'home-row-1': {
      title: 'Home Row Foundation',
      fingerFocus: 'Index, Middle, Ring & Pinky',
      text: 'asdf jkl; asdf jkl; fdsa ;lkj asdf jkl; a s d f j k l ; dad sad lad fall flask salad flash'
    },
    'home-row-2': {
      title: 'Reaching G & H',
      fingerFocus: 'Index Keys (F & J reaches)',
      text: 'fghj jhg f gh j hg f fg jh half glad flag dash flash gash jag hag shad flask glass hall fall'
    },
    'top-row-1': {
      title: 'Top Row Mastery (Q W E R T Y U I O P)',
      fingerFocus: 'Upward Reach Transitions',
      text: 'quiet power write tree route quote tower equip trip priority queue report update pure route wire'
    },
    'bottom-row-1': {
      title: 'Bottom Row Agility (Z X C V B N M)',
      fingerFocus: 'Downward Reach Transitions',
      text: 'brave dynamic machine carbon cabin victory zenith matrix zinc nexus vanish classic bronze cabin'
    },
    'numbers-symbols': {
      title: 'Numbers & Punctuation Sprint',
      fingerFocus: 'Top Row Number Reach',
      text: 'lap 1: 42.8s; lap 2: 41.5s; top speed: 198 mph! boost = 100% (nitro #7) & rank = 1st place.'
    },
    'code-syntax': {
      title: 'Esports Developer Syntax',
      fingerFocus: 'Brackets, Semicolons & Symbols',
      text: 'for (let i = 0; i < laps.length; i++) { if (laps[i].wpm >= 90) racers.push({ id: i, status: "Apex" }); }'
    }
  }
};

export function getRandomPassage(difficulty = 'AMATEUR') {
  const list = PASSAGE_DATABASE[difficulty] || PASSAGE_DATABASE.AMATEUR;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

export function getDiagnosticPassage() {
  return PASSAGE_DATABASE.DIAGNOSTIC[0];
}

export function getAcademyLesson(lessonId) {
  return PASSAGE_DATABASE.ACADEMY[lessonId] || PASSAGE_DATABASE.ACADEMY['home-row-1'];
}
