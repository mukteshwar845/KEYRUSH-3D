/**
 * KeyRush IndexedDB Storage Layer
 * Offline-first persistent storage for player profiles, race sessions,
 * vehicle unlocks, daily streaks, missions, and configuration.
 */

const DB_NAME = 'keyrush_database';
const DB_VERSION = 1;

class KeyRushStorage {
  constructor() {
    this.db = null;
    this.ready = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        // Profiles store
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }

        // Sessions store (all completed races & practices)
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          sessionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          sessionsStore.createIndex('mode', 'mode', { unique: false });
          sessionsStore.createIndex('difficulty', 'difficulty', { unique: false });
        }

        // Garage store (owned vehicles, colors, customization)
        if (!db.objectStoreNames.contains('garage')) {
          db.createObjectStore('garage', { keyPath: 'id' });
        }

        // Missions & Streaks store
        if (!db.objectStoreNames.contains('missions')) {
          db.createObjectStore('missions', { keyPath: 'id' });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }

        // Leaderboard store (local + synced)
        if (!db.objectStoreNames.contains('leaderboard')) {
          const lbStore = db.createObjectStore('leaderboard', { keyPath: 'id', autoIncrement: true });
          lbStore.createIndex('wpm', 'wpm', { unique: false });
        }
      };

      request.onsuccess = async (e) => {
        this.db = e.target.result;
        resolve(this);
        try {
          await this.seedDefaults();
        } catch (err) {
          console.warn('Seed error:', err);
        }
      };

      request.onerror = (e) => {
        console.error('IndexedDB error:', e);
        reject(e);
      };
    });
  }

  async seedDefaults() {
    const profile = await this.getProfile();
    if (!profile) {
      await this.saveProfile({
        id: 'user_profile',
        username: 'Kartik',
        role: 'Racer',
        avatar: '/images/ui/avatar-kartik.png',
        league: 'Silver II',
        leagueTier: 'Silver',
        xp: 2480,
        level: 6,
        totalPracticeTimeSec: 6 * 3600 + 42 * 60,
        racesWon: 14,
        racesPlayed: 18,
        bestWpm: 112,
        averageWpm: 78,
        accuracy: 96.0,
        currentStreak: 7,
        longestStreak: 7,
        lastActiveDate: new Date().toISOString().split('T')[0],
        weakKeys: { 'p': 5, 'q': 4, 'z': 3, 'x': 2 }
      });
    }

    const garage = await this.getGarage();
    if (!garage) {
      await this.saveGarage({
        id: 'user_garage',
        activeVehicleId: 'talon',
        paintColor: '#00e5ff',
        underglowColor: '#a855f7',
        trailEffect: 'neon-plasma',
        unlockedVehicles: ['talon', 'vortex'],
        unlockedPaints: ['#00e5ff', '#a855f7', '#00f59b', '#ff3366', '#ffffff']
      });
    }

    const settings = await this.getSettings();
    if (!settings) {
      await this.saveSettings({
        id: 'user_settings',
        theme: 'cyber-dark',
        soundEffects: true,
        engineAudio: true,
        sfxVolume: 0.60,
        engineVolume: 0.50,
        masterVolume: 0.80,
        interiorVolume: 0.55,
        racingVolume: 0.65,
        musicMuted: false,
        keyboardClickSound: 'cherry-blue', // cherry-blue, mx-red, cyber-blip, off
        errorPenalty: 'standard', // forgiving, standard, hardcore
        reducedMotion: false,
        targetWpm: 80,
        targetAccuracy: 98,
        dailyGoalMinutes: 15,
        notificationsEnabled: true
      });
    }

    const missions = await this.getMissions();
    if (!missions) {
      const today = new Date().toISOString().split('T')[0];
      await this.saveMissions({
        id: 'daily_missions',
        date: today,
        streakDays: 4,
        calendarDays: [true, true, true, true, false, false, false],
        list: [
          { id: 'm1', title: 'Speed Demon', desc: 'Reach 70 WPM in any race', target: 1, current: 1, rewardXp: 150, completed: true, claimed: false },
          { id: 'm2', title: 'Precision Master', desc: 'Finish a race with ≥ 96% accuracy', target: 1, current: 0, rewardXp: 200, completed: false, claimed: false },
          { id: 'm3', title: 'Endurance Sprint', desc: 'Complete 3 races today', target: 3, current: 2, rewardXp: 250, completed: false, claimed: false },
          { id: 'm4', title: 'Touch-Typing Drill', desc: 'Finish 1 Academy lesson', target: 1, current: 0, rewardXp: 180, completed: false, claimed: false },
          { id: 'm5', title: 'AI Challenger', desc: 'Defeat an Advanced AI opponent', target: 1, current: 0, rewardXp: 300, completed: false, claimed: false }
        ]
      });
    }

    // Seed realistic sample sessions if empty
    const sessions = await this.getSessions();
    if (sessions.length === 0) {
      const sampleSessions = [
        { timestamp: Date.now() - 86400000 * 6, mode: 'AI Racing', difficulty: 'ROOKIE', wpm: 58, accuracy: 94.2, errorCount: 6, duration: 42, won: true, opponentWpm: 48, cpm: 290, consistency: 88, keyErrors: { 'c': 2, 'v': 2, 'b': 2 } },
        { timestamp: Date.now() - 86400000 * 5, mode: 'Solo Practice', difficulty: 'AMATEUR', wpm: 62, accuracy: 95.8, errorCount: 4, duration: 45, won: true, opponentWpm: 0, cpm: 310, consistency: 91, keyErrors: { 'r': 2, 't': 1, 'p': 1 } },
        { timestamp: Date.now() - 86400000 * 4, mode: 'AI Racing', difficulty: 'AMATEUR', wpm: 66, accuracy: 96.1, errorCount: 3, duration: 41, won: true, opponentWpm: 60, cpm: 330, consistency: 93, keyErrors: { 'p': 2, 'q': 1 } },
        { timestamp: Date.now() - 86400000 * 3, mode: 'Online Multiplayer', difficulty: 'PRO', wpm: 71, accuracy: 97.4, errorCount: 2, duration: 38, won: true, opponentWpm: 68, cpm: 355, consistency: 94, keyErrors: { 'z': 1, 'x': 1 } },
        { timestamp: Date.now() - 86400000 * 2, mode: 'AI Racing', difficulty: 'PRO', wpm: 74, accuracy: 95.9, errorCount: 4, duration: 39, won: true, opponentWpm: 72, cpm: 370, consistency: 90, keyErrors: { 'b': 2, 'm': 2 } },
        { timestamp: Date.now() - 86400000 * 1, mode: 'Solo Practice', difficulty: 'PRO', wpm: 79, accuracy: 98.2, errorCount: 1, duration: 36, won: true, opponentWpm: 0, cpm: 395, consistency: 96, keyErrors: { 'p': 1 } },
        { timestamp: Date.now() - 3600000 * 3, mode: 'AI Racing', difficulty: 'PRO', wpm: 84, accuracy: 97.8, errorCount: 2, duration: 34, won: true, opponentWpm: 78, cpm: 420, consistency: 95, keyErrors: { 'q': 1, 'x': 1 } }
      ];
      for (const s of sampleSessions) {
        await this.addSession(s);
      }
    }
  }

  // Profile operations
  async getProfile() {
    await this.ready;
    return new Promise((resolve) => {
      const tx = this.db.transaction('profile', 'readonly');
      const req = tx.objectStore('profile').get('user_profile');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async saveProfile(profile) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('profile', 'readwrite');
      const req = tx.objectStore('profile').put(profile);
      req.onsuccess = () => resolve(profile);
      req.onerror = (e) => reject(e);
    });
  }

  // Sessions operations
  async addSession(session) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('sessions', 'readwrite');
      const req = tx.objectStore('sessions').add(session);
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e);
    });
  }

  async getSessions(limit = 100) {
    await this.ready;
    return new Promise((resolve) => {
      const tx = this.db.transaction('sessions', 'readonly');
      const store = tx.objectStore('sessions');
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result || [];
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results.slice(0, limit));
      };
      req.onerror = () => resolve([]);
    });
  }

  // Garage operations
  async getGarage() {
    await this.ready;
    return new Promise((resolve) => {
      const tx = this.db.transaction('garage', 'readonly');
      const req = tx.objectStore('garage').get('user_garage');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async saveGarage(garage) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('garage', 'readwrite');
      const req = tx.objectStore('garage').put(garage);
      req.onsuccess = () => resolve(garage);
      req.onerror = (e) => reject(e);
    });
  }

  // Missions operations
  async getMissions() {
    await this.ready;
    return new Promise((resolve) => {
      const tx = this.db.transaction('missions', 'readonly');
      const req = tx.objectStore('missions').get('daily_missions');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async saveMissions(missions) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('missions', 'readwrite');
      const req = tx.objectStore('missions').put(missions);
      req.onsuccess = () => resolve(missions);
      req.onerror = (e) => reject(e);
    });
  }

  // Settings operations
  async getSettings() {
    await this.ready;
    return new Promise((resolve) => {
      const tx = this.db.transaction('settings', 'readonly');
      const req = tx.objectStore('settings').get('user_settings');
      req.onsuccess = () => {
        const res = req.result;
        if (res) {
          if (res.masterVolume === undefined) res.masterVolume = 0.80;
          if (res.interiorVolume === undefined) res.interiorVolume = 0.55;
          if (res.racingVolume === undefined) res.racingVolume = 0.65;
          if (res.sfxVolume === undefined) res.sfxVolume = 0.60;
          if (res.engineVolume === undefined) res.engineVolume = 0.50;
          if (res.musicMuted === undefined) res.musicMuted = false;
        }
        resolve(res || null);
      };
      req.onerror = () => resolve(null);
    });
  }

  async saveSettings(settings) {
    await this.ready;
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('settings', 'readwrite');
      const req = tx.objectStore('settings').put(settings);
      req.onsuccess = () => resolve(settings);
      req.onerror = (e) => reject(e);
    });
  }

  // Export & Import full database
  async exportFullData() {
    const profile = await this.getProfile();
    const garage = await this.getGarage();
    const settings = await this.getSettings();
    const missions = await this.getMissions();
    const sessions = await this.getSessions(1000);

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      app: 'KEYRUSH',
      version: '1.0.0',
      profile,
      garage,
      settings,
      missions,
      sessions
    }, null, 2);
  }

  async importFullData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) await this.saveProfile(data.profile);
      if (data.garage) await this.saveGarage(data.garage);
      if (data.settings) await this.saveSettings(data.settings);
      if (data.missions) await this.saveMissions(data.missions);
      if (Array.isArray(data.sessions)) {
        for (const s of data.sessions) {
          delete s.id;
          await this.addSession(s);
        }
      }
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  }

  async clearAllData() {
    await this.ready;
    return new Promise((resolve) => {
      const stores = ['profile', 'sessions', 'garage', 'missions', 'settings', 'leaderboard'];
      const tx = this.db.transaction(stores, 'readwrite');
      stores.forEach(s => tx.objectStore(s).clear());
      tx.oncomplete = async () => {
        await this.seedDefaults();
        resolve(true);
      };
    });
  }
}

export const storage = new KeyRushStorage();
