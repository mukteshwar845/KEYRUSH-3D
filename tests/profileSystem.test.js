import test from 'node:test';
import assert from 'node:assert/strict';

import { 
  renderAvatarMarkup, 
  ProfileView, 
  BUILTIN_AVATARS 
} from '../src/ui/profileView.js';

test('1. Avatar markup renderer handles images, data URLs, emojis, and fallbacks', () => {
  // Empty or undefined fallback
  const emptyMarkup = renderAvatarMarkup(null);
  assert.ok(emptyMarkup.includes('/images/ui/avatar-kartik.png'));

  // Standard image path
  const imgMarkup = renderAvatarMarkup('/images/ui/pilot-avatar.png', 'Combat Pilot', 'test-class');
  assert.ok(imgMarkup.includes('src="/images/ui/pilot-avatar.png"'));
  assert.ok(imgMarkup.includes('class="test-class"'));

  // Data URL (e.g., custom upload or SVG)
  const dataUrl = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
  const dataMarkup = renderAvatarMarkup(dataUrl, 'Custom Pilot');
  assert.ok(dataMarkup.includes(`src="${dataUrl}"`));

  // Emoji string fallback
  const emojiMarkup = renderAvatarMarkup('🏎️', 'Racer');
  assert.ok(emojiMarkup.includes('avatar-emoji-badge'));
  assert.ok(emojiMarkup.includes('🏎️'));
});

test('2. Verified gaming statistics: calculated accurately from sessions and profile', () => {
  const dummyApp = {};
  const dummyContainer = {};
  const view = new ProfileView(dummyContainer, dummyApp);

  const mockProfile = {
    racesPlayed: 10,
    racesWon: 8,
    bestWpm: 110,
    averageWpm: 75,
    accuracy: 96.5,
    currentStreak: 5,
    longestStreak: 9,
    totalPracticeTimeSec: 3600 + 1800 // 1h 30m
  };

  const mockSessions = [
    { timestamp: Date.now() - 300000, mode: 'AI Racing', wpm: 90, accuracy: 98.0, errorCount: 1, duration: 40, won: true },
    { timestamp: Date.now() - 600000, mode: 'AI Racing', wpm: 80, accuracy: 96.0, errorCount: 2, duration: 42, won: true },
    { timestamp: Date.now() - 900000, mode: 'Solo Practice', wpm: 70, accuracy: 94.0, errorCount: 3, duration: 45, won: false }
  ];

  const stats = view.calculateVerifiedStats(mockProfile, mockSessions);

  assert.equal(stats.totalRaces, 10);
  assert.equal(stats.totalWins, 8);
  assert.equal(stats.winRate, 80); // (8 / 10) * 100 = 80%
  assert.equal(stats.bestWpm, 110);
  assert.equal(stats.averageWpm, 80); // (90 + 80 + 70) / 3 = 80
  assert.equal(stats.accuracy, 96.0); // (98 + 96 + 94) / 3 = 96.0
  assert.equal(stats.totalErrors, 6); // 1 + 2 + 3 = 6
  assert.equal(stats.currentStreak, 5);
  assert.equal(stats.longestStreak, 9);
  assert.equal(stats.playtimeFormatted, '1h 30m');
  assert.equal(stats.favoriteCircuit, 'AI Racing Circuit');
  assert.ok(stats.trendLabel.includes('+') || stats.trendPositive);
});

test('3. Empty state handling: clean zeroed statistics when no races exist', () => {
  const dummyApp = {};
  const dummyContainer = {};
  const view = new ProfileView(dummyContainer, dummyApp);

  const freshProfile = {
    racesPlayed: 0,
    racesWon: 0,
    bestWpm: 0,
    averageWpm: 0,
    accuracy: 100,
    currentStreak: 0,
    longestStreak: 0,
    totalPracticeTimeSec: 0
  };

  const emptySessions = [];
  const stats = view.calculateVerifiedStats(freshProfile, emptySessions);

  assert.equal(stats.totalRaces, 0);
  assert.equal(stats.totalWins, 0);
  assert.equal(stats.winRate, 0);
  assert.equal(stats.bestWpm, 0);
  assert.equal(stats.totalErrors, 0);
  assert.equal(stats.trendLabel, '--');
});

test('4. Achievements unlocks correctly correlate with telemetry records', () => {
  const dummyApp = {};
  const dummyContainer = {};
  const view = new ProfileView(dummyContainer, dummyApp);

  const stats = {
    bestWpm: 105,
    accuracy: 97.2,
    totalWins: 12,
    totalRaces: 28,
    currentStreak: 7
  };

  const sessionsWithFlawless = [
    { wpm: 85, accuracy: 100, won: true }
  ];

  const achs = view.calculateAchievements(stats, {}, sessionsWithFlawless);

  const speedDemon = achs.find(a => a.id === 'ach-speed-demon');
  assert.ok(speedDemon);
  assert.equal(speedDemon.unlocked, true); // bestWpm >= 80

  const supersonic = achs.find(a => a.id === 'ach-supersonic');
  assert.ok(supersonic);
  assert.equal(supersonic.unlocked, true); // bestWpm >= 100

  const precisionMaster = achs.find(a => a.id === 'ach-precision-pilot');
  assert.ok(precisionMaster);
  assert.equal(precisionMaster.unlocked, true); // accuracy >= 96%

  const flawless = achs.find(a => a.id === 'ach-flawless');
  assert.ok(flawless);
  assert.equal(flawless.unlocked, true); // has session with 100% accuracy

  const podium = achs.find(a => a.id === 'ach-podium');
  assert.ok(podium);
  assert.equal(podium.unlocked, true); // totalWins >= 10

  const veteran = achs.find(a => a.id === 'ach-veteran');
  assert.ok(veteran);
  assert.equal(veteran.unlocked, true); // totalRaces >= 25

  const streak = achs.find(a => a.id === 'ach-streak');
  assert.ok(streak);
  assert.equal(streak.unlocked, true); // currentStreak >= 7

  // Locked check for a novice
  const noviceStats = {
    bestWpm: 45,
    accuracy: 92,
    totalWins: 1,
    totalRaces: 3,
    currentStreak: 1
  };
  const noviceAchs = view.calculateAchievements(noviceStats, {}, []);
  const noviceSpeed = noviceAchs.find(a => a.id === 'ach-speed-demon');
  assert.equal(noviceSpeed.unlocked, false);
});

test('5. Equipped vehicle identity: specs and customizations derived accurately', () => {
  const dummyApp = {};
  const dummyContainer = {};
  const view = new ProfileView(dummyContainer, dummyApp);

  const garage = {
    activeVehicleId: 'talon',
    paintColor: '#00D9FF',
    underglowColor: '#A855F7',
    unlockedVehicles: ['talon', 'vortex', 'shadow']
  };

  const vehicleInfo = view.getEquippedVehicleInfo(garage);
  assert.equal(vehicleInfo.id, 'talon');
  assert.equal(vehicleInfo.name, 'TALON GT-R');
  assert.equal(vehicleInfo.paint, '#00D9FF');
  assert.equal(vehicleInfo.underglow, '#A855F7');
  assert.equal(vehicleInfo.unlockedCount, 3);
  assert.ok(vehicleInfo.topSpeedPct > 0);
  assert.ok(vehicleInfo.accelPct > 0);
});

test('6. Built-in avatar catalog includes official cyberpunk presets', () => {
  assert.ok(BUILTIN_AVATARS.length >= 6);
  const kartik = BUILTIN_AVATARS.find(a => a.id === 'pilot-kartik');
  assert.ok(kartik);
  assert.equal(kartik.url, '/images/ui/avatar-kartik.png');

  const combat = BUILTIN_AVATARS.find(a => a.id === 'pilot-combat');
  assert.ok(combat);
  assert.equal(combat.url, '/images/ui/pilot-avatar.png');

  const viper = BUILTIN_AVATARS.find(a => a.id === 'pilot-neon-viper');
  assert.ok(viper);
  assert.ok(viper.url.startsWith('data:image/svg+xml'));
});

test('7. HTML escaping prevents XSS injection in user profile fields', () => {
  const dummyApp = {};
  const dummyContainer = {};
  const view = new ProfileView(dummyContainer, dummyApp);

  const dangerousString = '<script>alert("hack")</script>&"\'';
  const escaped = view.escapeHtml(dangerousString);

  assert.ok(!escaped.includes('<script>'));
  assert.ok(escaped.includes('&lt;script&gt;'));
  assert.ok(escaped.includes('&quot;'));
  assert.ok(escaped.includes('&#039;'));
});

test('8. Storage persistence: updates profile fields and normalizes defaults', async () => {
  const { storage } = await import('../src/db/storage.js');
  await storage.ready;

  const initial = await storage.getProfile();
  assert.ok(initial);
  assert.ok(initial.callsign);
  assert.ok(initial.role);
  assert.ok(initial.visibility);

  // Update profile with custom fields
  const updated = {
    ...initial,
    username: 'ApexPilot',
    callsign: 'APEX-99',
    bio: 'Pushing boundaries in the digital expressway.',
    country: 'JPN',
    visibility: 'private',
    avatar: 'data:image/webp;base64,mockCustomAvatarData'
  };

  await storage.saveProfile(updated);

  const retrieved = await storage.getProfile();
  assert.equal(retrieved.username, 'ApexPilot');
  assert.equal(retrieved.callsign, 'APEX-99');
  assert.equal(retrieved.bio, 'Pushing boundaries in the digital expressway.');
  assert.equal(retrieved.country, 'JPN');
  assert.equal(retrieved.visibility, 'private');
  assert.equal(retrieved.avatar, 'data:image/webp;base64,mockCustomAvatarData');
});

test('9. Career telemetry reset: clears session logs and zeroes performance stats', async () => {
  const { storage } = await import('../src/db/storage.js');
  await storage.ready;

  // Add a test session
  await storage.addSession({
    timestamp: Date.now(),
    mode: 'AI Racing',
    wpm: 88,
    accuracy: 97.5,
    won: true,
    errorCount: 2,
    duration: 35
  });

  const sessionsBefore = await storage.getSessions();
  assert.ok(sessionsBefore.length > 0);

  // Trigger reset
  await storage.resetCareerTelemetry();

  const sessionsAfter = await storage.getSessions();
  assert.equal(sessionsAfter.length, 0);

  const profileAfter = await storage.getProfile();
  assert.equal(profileAfter.racesPlayed, 0);
  assert.equal(profileAfter.racesWon, 0);
  assert.equal(profileAfter.averageWpm, 0);
  assert.equal(profileAfter.bestWpm, 0);
  assert.equal(profileAfter.currentStreak, 0);
});

test('10. Career data export: produces valid JSON with profile, garage, settings, and sessions', async () => {
  const { storage } = await import('../src/db/storage.js');
  await storage.ready;

  const exportStr = await storage.exportFullData();
  const parsed = JSON.parse(exportStr);

  assert.equal(parsed.app, 'KEYRUSH');
  assert.ok(parsed.version);
  assert.ok(parsed.exportDate);
  assert.ok(parsed.profile);
  assert.ok(parsed.garage);
  assert.ok(parsed.settings);
  assert.ok(Array.isArray(parsed.sessions));
});

