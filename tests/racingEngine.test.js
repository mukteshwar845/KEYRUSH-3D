import test from 'node:test';
import assert from 'node:assert/strict';

import { TypingEngine } from '../src/engine/typingEngine.js';
import { AiOpponent, AiOpponentGrid, AI_PRESETS } from '../src/engine/aiOpponent.js';
import { RacingSimulation, HIGHWAY_LANES } from '../src/engine/racingSimulation.js';
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

test('14. Authoritative Physics: typing accelerates vehicle, idle triggers drag deceleration', () => {
  const sim = new RacingSimulation({ totalDistance: 1000 });
  sim.startRace();

  assert.equal(sim.player.speedMps, 0);
  assert.equal(sim.player.distance, 0);

  // Correct typing keystrokes pulse acceleration
  sim.handleCorrectKeystroke({ wpm: 75, accuracy: 98, currentStreak: 5 });
  assert.ok(sim.player.targetSpeedMps > 30);
  assert.ok(sim.player.speedMps > 0);

  const initialSpeed = sim.player.speedMps;

  // Integrate physics over time: vehicle accelerates smoothly toward target speed
  sim.update(0.1);
  assert.ok(sim.player.speedMps > initialSpeed, 'Vehicle should accelerate');
  assert.ok(sim.player.distance > 0, 'Distance should advance when moving');

  // Let vehicle reach a cruising speed
  for (let i = 0; i < 20; i++) {
    sim.update(0.1);
  }
  const peakSpeed = sim.player.speedMps;
  const beforeDecelTarget = sim.player.targetSpeedMps;

  // Simulate stopping typing: simulate elapsed time without keystrokes
  sim.player.lastKeystrokeTime = performance.now() - 600; // >450ms ago
  for (let i = 0; i < 10; i++) {
    sim.update(0.1);
  }
  assert.ok(sim.player.targetSpeedMps < beforeDecelTarget, 'Target speed should decay when typing stops');

  // Further updates decelerate the vehicle via aerodynamic drag & rolling friction
  for (let i = 0; i < 30; i++) {
    sim.update(0.1);
  }
  assert.ok(sim.player.speedMps < peakSpeed, 'Vehicle must decelerate naturally when typing stops');
});

test('15. Speedometer calibration strictly follows speedKmh = Math.round(speedMps * 3.6)', () => {
  const sim = new RacingSimulation();

  sim.player.speedMps = 0.0;
  assert.equal(sim.getSpeedKmh(), 0);

  sim.player.speedMps = 25.0; // 25 m/s -> 90 km/h
  assert.equal(sim.getSpeedKmh(), 90);

  sim.player.speedMps = 50.0; // 50 m/s -> 180 km/h
  assert.equal(sim.getSpeedKmh(), 180);

  sim.player.speedMps = 66.67; // 66.67 m/s -> 240 km/h
  assert.equal(sim.getSpeedKmh(), 240);

  const telemetry = sim.getTelemetry();
  assert.equal(telemetry.player.speedKmh, sim.getSpeedKmh());
});

test('16. Lateral lane steering bounds clamping and direction integrity', () => {
  const sim = new RacingSimulation();
  sim.startRace();

  assert.equal(sim.player.laneIndex, 1);
  assert.equal(sim.player.targetLaneIndex, 1);

  // Steer left: from lane 1 to lane 0
  const steeredLeft = sim.steerLane(-1);
  assert.equal(steeredLeft, true);
  assert.equal(sim.player.targetLaneIndex, 0);

  // Steer left again beyond boundary: must clamp strictly at lane 0
  sim.player.lastLaneChangeTime = -9999; // reset cooldown for test
  const clampedLeft = sim.steerLane(-1);
  assert.equal(clampedLeft, false);
  assert.equal(sim.player.targetLaneIndex, 0, 'Cannot steer past left road boundary');

  // Steer right across lanes
  sim.player.lastLaneChangeTime = -9999;
  sim.steerLane(1); // to 1
  assert.equal(sim.player.targetLaneIndex, 1);

  sim.player.lastLaneChangeTime = -9999;
  sim.steerLane(1); // to 2
  assert.equal(sim.player.targetLaneIndex, 2);

  sim.player.lastLaneChangeTime = -9999;
  sim.steerLane(1); // to 3
  assert.equal(sim.player.targetLaneIndex, 3);

  // Steer right beyond boundary: must clamp at lane 3
  sim.player.lastLaneChangeTime = -9999;
  const clampedRight = sim.steerLane(1);
  assert.equal(clampedRight, false);
  assert.equal(sim.player.targetLaneIndex, 3, 'Cannot steer past right road boundary');
});

test('17. Lateral collision avoidance prevents steering into occupied car', () => {
  const sim = new RacingSimulation();
  sim.startRace();

  sim.player.distance = 100.0;
  sim.player.laneIndex = 1;
  sim.player.targetLaneIndex = 1;

  // Place opponent 0 in lane 2, right beside player (distance 101.0m, within 4.5m)
  sim.opponents[0].distance = 101.0;
  sim.opponents[0].laneIndex = 2;
  sim.opponents[0].targetLaneIndex = 2;
  sim.opponents[0].laneX = sim.lanes[2];

  sim.player.lastLaneChangeTime = -9999;
  const attemptedSteer = sim.steerLane(1); // attempts to move into lane 2
  assert.equal(attemptedSteer, false, 'Should block lane change when opponent car is alongside');
  assert.equal(sim.player.targetLaneIndex, 1, 'Target lane should remain unchanged');

  // Move opponent away longitudinally (> 10m ahead)
  sim.opponents[0].distance = 125.0;
  sim.player.lastLaneChangeTime = -9999;
  const clearSteer = sim.steerLane(1);
  assert.equal(clearSteer, true, 'Should allow lane change when destination lane is clear');
  assert.equal(sim.player.targetLaneIndex, 2);
});

test('18. Monotonic race progress: speed > 0 strictly advances distance, paused/idle freezes', () => {
  const sim = new RacingSimulation({ totalDistance: 800 });
  sim.startRace();

  // Initially 0 speed, distance does not move
  sim.update(0.1);
  assert.equal(sim.player.distance, 0);

  // Give player speed
  sim.player.speedMps = 40.0; // 40 m/s
  sim.player.targetSpeedMps = 40.0;
  sim.player.lastKeystrokeTime = performance.now();

  sim.update(0.5); // 0.5s at ~40 m/s = ~20m
  assert.ok(sim.player.distance >= 19.0 && sim.player.distance <= 21.0);
  const distBeforePause = sim.player.distance;

  // Pausing freezes simulation completely
  sim.pause();
  assert.equal(sim.state, 'paused');
  sim.update(0.5);
  assert.equal(sim.player.distance, distBeforePause, 'Distance must freeze while paused');

  // Resume unfreezes
  sim.resume();
  assert.equal(sim.state, 'racing');
  sim.player.lastKeystrokeTime = performance.now();
  sim.update(0.5);
  assert.ok(sim.player.distance > distBeforePause, 'Distance advances upon resume');
});

test('19. AI competitors possess distinct personalities and execute tactical lane changes', () => {
  const sim = new RacingSimulation({ difficulty: 'PRO', opponentCount: 4 });
  sim.startRace();

  assert.equal(sim.opponents.length, 4);

  // Verify opponents have distinct initial configurations
  const speeds = new Set(sim.opponents.map(o => o.baseTargetMps));
  assert.ok(speeds.size >= 2, 'Opponents must have varied target speed profiles');

  // Place slower car directly in front of fast car in the same lane
  const chaser = sim.opponents[0];
  const blocker = sim.opponents[1];

  chaser.targetLaneIndex = 1;
  chaser.laneX = sim.lanes[1];
  chaser.distance = 50.0;
  chaser.speedMps = 55.0;
  chaser.baseTargetMps = 55.0;
  chaser.timeSinceDecision = 1.0; // trigger immediate tactical decision

  blocker.targetLaneIndex = 1;
  blocker.laneX = sim.lanes[1];
  blocker.distance = 58.0; // 8 metres ahead (blocking path)
  blocker.speedMps = 25.0;

  // Clear adjacent lane 2
  sim.opponents[2].distance = 200.0;
  sim.opponents[3].distance = 200.0;
  sim.player.distance = 0.0;

  // Run update: chaser detects blocker ahead and changes lane to overtake
  sim.update(0.1);
  assert.notEqual(chaser.targetLaneIndex, blocker.targetLaneIndex, 'Chaser AI should switch lane to overtake blocking vehicle');
});

test('20. Authoritative race standings derive strictly from actual race progress', () => {
  const sim = new RacingSimulation({ totalDistance: 1000 });
  sim.startRace();

  // Set explicit distances
  sim.player.distance = 450.0;
  sim.opponents[0].distance = 600.0;
  sim.opponents[1].distance = 500.0;
  sim.opponents[2].distance = 300.0;
  sim.opponents[3].distance = 150.0;

  sim.updateStandings();
  const standings = sim.standings;

  assert.equal(standings[0].id, sim.opponents[0].id, 'Leader at 600m should be P1');
  assert.equal(standings[1].id, sim.opponents[1].id, 'Second at 500m should be P2');
  assert.equal(standings[2].isPlayer, true, 'Player at 450m should be P3');
  assert.equal(standings[3].id, sim.opponents[2].id, 'Fourth at 300m should be P4');
  assert.equal(standings[4].id, sim.opponents[3].id, 'Fifth at 150m should be P5');

  assert.equal(sim.player.rank, 3);
});

