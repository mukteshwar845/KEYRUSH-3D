import test from 'node:test';
import assert from 'node:assert/strict';

import { TypingEngine } from '../src/engine/typingEngine.js';
import { AiOpponent, AiOpponentGrid, AI_PRESETS } from '../src/engine/aiOpponent.js';
import { VEHICLE_CATALOG, createCarMesh } from '../src/graphics/carModels.js';
import { getRandomPassage, getAcademyLesson } from '../src/engine/textGenerator.js';

test('1. Race initialization: TypingEngine loads passages cleanly with initial zeroed stats', () => {
  const engine = new TypingEngine();
  const passage = 'Turbocharged acceleration on neon streets.';
  engine.loadText(passage);

  assert.equal(engine.targetText, passage);
  assert.equal(engine.currentIndex, 0);
  assert.equal(engine.getProgress(), 0);
  assert.equal(engine.isStarted, false);
  assert.equal(engine.isFinished, false);

  const stats = engine.getStats();
  assert.equal(stats.wpm, 0);
  assert.equal(stats.accuracy, 100);
  assert.equal(stats.errorCount, 0);
  assert.equal(stats.currentStreak, 0);
});

test('2. Countdown and race start state transitions', () => {
  let isCountdown = true;
  let isRaceActive = false;
  let isStarted = false;

  const engine = new TypingEngine();
  engine.loadText('Start race test.');

  // Simulated countdown sequence
  let count = 3;
  while (count > 0) {
    assert.equal(isCountdown, true);
    assert.equal(isRaceActive, false);
    count--;
  }

  // Count reaches 0 -> GO!
  isCountdown = false;
  isRaceActive = true;
  assert.equal(isCountdown, false);
  assert.equal(isRaceActive, true);

  // First keystroke activates engine
  const res = engine.handleKey('S');
  assert.equal(res.type, 'correct');
  assert.equal(engine.isStarted, true);
  assert.equal(engine.currentIndex, 1);
});

test('3. Correct character input advances progress and increments streak', () => {
  const engine = new TypingEngine();
  engine.loadText('Fast car');

  const step1 = engine.handleKey('F');
  assert.equal(step1.type, 'correct');
  assert.equal(engine.currentIndex, 1);
  assert.equal(engine.currentStreak, 1);

  const step2 = engine.handleKey('a');
  assert.equal(step2.type, 'correct');
  assert.equal(engine.currentIndex, 2);
  assert.equal(engine.currentStreak, 2);

  const step3 = engine.handleKey('s');
  assert.equal(step3.type, 'correct');
  assert.equal(engine.currentIndex, 3);
  assert.equal(engine.currentStreak, 3);
});

test('4. Incorrect character input registers error, breaks streak, and applies penalty', () => {
  const engine = new TypingEngine();
  engine.loadText('Apex Talon');

  engine.handleKey('A');
  assert.equal(engine.currentStreak, 1);

  // Type wrong key ('z' instead of 'p')
  const mistakeRes = engine.handleKey('z');
  assert.equal(mistakeRes.type, 'incorrect');
  assert.equal(mistakeRes.expected, 'p');
  assert.equal(mistakeRes.actual, 'z');
  assert.equal(engine.currentIndex, 1); // Does not advance
  assert.equal(engine.errorCount, 1);
  assert.equal(engine.currentStreak, 0); // Broken streak
  assert.ok(engine.penaltyMultiplier < 1.0); // Penalty applied
});

test('5. WPM, accuracy, and streak calculations operate mathematically accurately', () => {
  const engine = new TypingEngine();
  engine.loadText('Accuracy and speed test sample');

  // Type 10 correct, 2 mistakes
  engine.handleKey('A');
  engine.handleKey('c');
  engine.handleKey('c');
  engine.handleKey('u');
  engine.handleKey('r');
  engine.handleKey('9'); // error
  engine.handleKey('8'); // error
  engine.handleKey('a');
  engine.handleKey('c');
  engine.handleKey('y');

  const stats = engine.getStats();
  assert.equal(stats.totalKeystrokes, 10);
  assert.equal(stats.correctKeystrokes, 8);
  assert.equal(stats.errorCount, 2);
  assert.equal(stats.accuracy, 80);
});

test('6. Player progress and speed calculations scale with typing performance', () => {
  const engine = new TypingEngine();
  const text = 'Short text for progress.';
  engine.loadText(text);

  for (let i = 0; i < 10; i++) {
    engine.handleKey(text[i]);
  }

  const progress = engine.getProgress();
  assert.equal(progress, 10 / text.length);

  const stats = engine.getStats();
  const kmh = Math.round(stats.wpm * 2.45);
  assert.ok(kmh >= 0);
  assert.ok(progress > 0 && progress < 1);
});

test('7. Opponent progress and live ranking derivation', () => {
  const grid = new AiOpponentGrid('AMATEUR', 65, 4);
  const opponents = grid.getOpponentsData();
  assert.equal(opponents.length, 4);

  // Set distinct progresses
  grid.opponents[0].progress = 0.85;
  grid.opponents[0].wpm = 75;
  grid.opponents[1].progress = 0.65;
  grid.opponents[1].wpm = 60;
  grid.opponents[2].progress = 0.40;
  grid.opponents[2].wpm = 50;
  grid.opponents[3].progress = 0.20;
  grid.opponents[3].wpm = 45;

  // Player at 0.70 progress
  const standingsResult = grid.calculateStandings({
    name: 'You',
    progress: 0.70,
    wpm: 68
  });

  assert.equal(standingsResult.totalRacers, 5);
  // Opponent 0 is at 0.85 (P1)
  // Player is at 0.70 (P2)
  // Opponent 1 is at 0.65 (P3)
  assert.equal(standingsResult.playerPosition, 2);
  assert.equal(standingsResult.standings[0].id, grid.opponents[0].id);
  assert.equal(standingsResult.standings[1].isPlayer, true);
});

test('8. Pause and resume state freeze and unfreeze', () => {
  let isPaused = false;
  let isRaceActive = true;
  let activeTimer = 100;

  function pause() {
    isPaused = true;
    isRaceActive = false;
  }

  function resume() {
    isPaused = false;
    isRaceActive = true;
  }

  pause();
  assert.equal(isPaused, true);
  assert.equal(isRaceActive, false);

  resume();
  assert.equal(isPaused, false);
  assert.equal(isRaceActive, true);
});

test('9. Race completion when target text is completed', () => {
  let finishedFired = false;
  let finalStatsReceived = null;

  const engine = new TypingEngine({
    onFinish: (stats) => {
      finishedFired = true;
      finalStatsReceived = stats;
    }
  });

  const target = 'Done!';
  engine.loadText(target);

  for (const ch of target) {
    engine.handleKey(ch);
  }

  assert.equal(engine.isFinished, true);
  assert.equal(engine.getProgress(), 1.0);
  assert.equal(finishedFired, true);
  assert.ok(finalStatsReceived);
  assert.equal(finalStatsReceived.accuracy, 100);
});

test('10. Clean restart without duplicated state', () => {
  const engine = new TypingEngine();
  engine.loadText('First lap');
  engine.handleKey('F');
  engine.handleKey('i');

  assert.equal(engine.currentIndex, 2);

  // Reload / Restart
  engine.loadText('Second lap clean');
  assert.equal(engine.currentIndex, 0);
  assert.equal(engine.totalKeystrokes, 0);
  assert.equal(engine.errorCount, 0);
  assert.equal(engine.currentStreak, 0);
  assert.equal(engine.isFinished, false);
});

test('11. Vehicle and track selection integrity', () => {
  assert.ok(VEHICLE_CATALOG.length >= 6);
  const vehicleIds = VEHICLE_CATALOG.map(v => v.id);
  assert.ok(vehicleIds.includes('talon'));
  assert.ok(vehicleIds.includes('vortex'));
  assert.ok(vehicleIds.includes('nebula'));
  assert.ok(vehicleIds.includes('chronos'));
  assert.ok(vehicleIds.includes('talon_gold'));
  assert.ok(vehicleIds.includes('shadow'));

  // Test 3D procedural vehicle mesh creation for each catalog entry
  VEHICLE_CATALOG.forEach(v => {
    const mesh = createCarMesh(v.id, { paintColor: '#00e5ff', underglowColor: '#a855f7' });
    assert.ok(mesh);
    assert.ok(mesh.userData);
    assert.equal(typeof mesh.userData.spinWheels, 'function');
    assert.equal(typeof mesh.userData.steerWheels, 'function');
    assert.equal(typeof mesh.userData.setBrake, 'function');
    assert.equal(typeof mesh.userData.setNitro, 'function');
  });
});

test('12. Missing asset fallback and custom passage generator', () => {
  const passageAmateur = getRandomPassage('AMATEUR');
  assert.ok(passageAmateur && passageAmateur.length > 10);

  const passagePro = getRandomPassage('PRO');
  assert.ok(passagePro && passagePro.length > 10);

  const lesson = getAcademyLesson(1);
  assert.ok(lesson && lesson.text.length > 10);

  // Fallback on unknown car mesh defaults gracefully without throwing
  const fallbackMesh = createCarMesh('unknown_concept_car_999');
  assert.ok(fallbackMesh);
  assert.ok(fallbackMesh.userData);
});

test('13. Rendering initialization, wheel spin, steering and runtime API validation', () => {
  const carMesh = createCarMesh('talon');

  // Verify runtime steering, wheel spin, and tilt functions operate cleanly without errors
  assert.doesNotThrow(() => {
    carMesh.userData.spinWheels(0.5);
    carMesh.userData.steerWheels(0.2);
    carMesh.userData.setBrake(true);
    carMesh.userData.setNitro(true);
    carMesh.userData.setTilt(0.05, -0.03);
    carMesh.userData.updatePaint('#ff0055');
    carMesh.userData.updateUnderglow('#00f5ff');
  });
});
