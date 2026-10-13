/**
 * KeyRush Offline-First Settings & Accessibility (Screen 12)
 * Full control over appearance themes, Web Audio synthesis switches,
 * typing error penalties, IndexedDB backup & restore, and push notifications.
 */

import { storage } from '../db/storage.js';
import { soundEffects } from '../audio/soundEffects.js';
import { musicManager } from '../audio/musicManager.js';
import { NotificationManager } from '../utils/notifications.js';
import { accountLifecycle } from '../utils/accountLifecycle.js';

export class SettingsView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async render() {
    const settings = await storage.getSettings();
    const profile = await storage.getProfile();
    const notifPermission = NotificationManager.getPermissionState();

    this.container.innerHTML = `
      <div class="dash-page-container">
        <!-- Section Header -->
        <header class="dash-section-hero">
          <div class="section-hero-content">
            <h1 class="dash-page-title">Settings & Preferences</h1>
            <p class="dash-page-desc">
              Configure audio synthesis, tactile keyboard tones, typing penalties, and manage your local offline storage.
            </p>
          </div>
        </header>

        <div class="settings-grid">
          <!-- 1. APPEARANCE & ACCESSIBILITY -->
          <div class="settings-card">
            <h3 class="panel-title">Appearance & Accessibility</h3>

            <div class="setting-item">
              <div class="s-info">
                <strong>Color Theme</strong>
                <span>Select visual styling interface</span>
              </div>
              <select id="setting-theme" class="custom-select">
                <option value="cyber-dark" ${settings?.theme === 'cyber-dark' ? 'selected' : ''}>Cyberpunk Dark (Default)</option>
                <option value="oled-black" ${settings?.theme === 'oled-black' ? 'selected' : ''}>OLED True Black</option>
                <option value="cyber-light" ${settings?.theme === 'cyber-light' ? 'selected' : ''}>High Contrast Light</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Reduced Motion</strong>
                <span>Disable screen shake and intense speed lines for accessibility</span>
              </div>
              <input type="checkbox" id="setting-reduced-motion" ${settings?.reducedMotion ? 'checked' : ''} class="custom-toggle">
            </div>
          </div>

          <!-- 2. GAMEPLAY & ERROR PENALTIES -->
          <div class="settings-card">
            <h3 class="panel-title">Gameplay & Penalties</h3>

            <div class="setting-item">
              <div class="s-info">
                <strong>Typing Error Penalty</strong>
                <span>Impact of mistyped letters on car deceleration</span>
              </div>
              <select id="setting-error-penalty" class="custom-select">
                <option value="forgiving" ${settings?.errorPenalty === 'forgiving' ? 'selected' : ''}>Forgiving (-10% deceleration)</option>
                <option value="standard" ${settings?.errorPenalty === 'standard' ? 'selected' : ''}>Standard (-20% deceleration)</option>
                <option value="hardcore" ${settings?.errorPenalty === 'hardcore' ? 'selected' : ''}>Hardcore Esports (-40% engine misfire)</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Target Speed Goal</strong>
                <span>Desired benchmark WPM</span>
              </div>
              <input type="number" id="setting-target-wpm" value="${settings?.targetWpm || 80}" min="30" max="180" class="custom-input narrow font-mono">
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Daily Practice Goal</strong>
                <span>Minutes of typing practice per day</span>
              </div>
              <input type="number" id="setting-daily-goal" value="${settings?.dailyGoalMinutes || 15}" min="5" max="120" class="custom-input narrow font-mono">
            </div>
          </div>

          <!-- 3. AUDIO & MUSIC SYSTEM -->
          <div class="settings-card">
            <h3 class="panel-title">Audio & Sound Effects</h3>

            <div class="setting-item">
              <div class="s-info">
                <strong>Background Music</strong>
                <span>Atmospheric cyberpunk soundtrack across menus, garage, academy and landing</span>
              </div>
              <div class="setting-toggle-wrapper">
                <input type="checkbox" id="setting-music-enabled" ${!settings?.musicMuted ? 'checked' : ''} class="custom-toggle">
                <span class="setting-toggle-badge ${!settings?.musicMuted ? 'badge-active' : 'badge-muted'}" id="setting-music-badge">
                  ${!settings?.musicMuted ? '🔊 Active' : '🔇 Muted'}
                </span>
              </div>
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Master Volume</strong>
                <span>Overall game volume level</span>
              </div>
              <div class="slider-with-label">
                <input type="range" id="setting-master-vol" min="0" max="1" step="0.05" value="${settings?.masterVolume ?? 0.8}" class="custom-slider">
                <span class="vol-label-val font-mono" id="master-vol-val">${Math.round((settings?.masterVolume ?? 0.8) * 100)}%</span>
              </div>
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Interior Ambient Music</strong>
                <span>Menu, dashboard, garage, and academy soundtrack (interior_music.mp3)</span>
              </div>
              <div class="slider-with-label">
                <input type="range" id="setting-interior-vol" min="0" max="1" step="0.01" value="${settings?.interiorVolume ?? 0.55}" class="custom-slider">
                <span class="vol-label-val font-mono" id="interior-vol-val">${Math.round((settings?.interiorVolume ?? 0.55) * 100)}%</span>
              </div>
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Racing Gameplay Music</strong>
                <span>Active race soundtrack (racing_music.mp3)</span>
              </div>
              <div class="slider-with-label">
                <input type="range" id="setting-racing-vol" min="0" max="1" step="0.01" value="${settings?.racingVolume ?? 0.65}" class="custom-slider">
                <span class="vol-label-val font-mono" id="racing-vol-val">${Math.round((settings?.racingVolume ?? 0.65) * 100)}%</span>
              </div>
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Sound Effects Volume</strong>
                <span>Countdown beeps, nitro turbo, mechanical switches, and victory fanfare</span>
              </div>
              <div class="slider-with-label">
                <input type="range" id="setting-sfx-vol" min="0" max="1" step="0.05" value="${settings?.sfxVolume ?? 0.6}" class="custom-slider">
                <span class="vol-label-val font-mono" id="sfx-vol-val">${Math.round((settings?.sfxVolume ?? 0.6) * 100)}%</span>
              </div>
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Mechanical Switch Click Tone</strong>
                <span>Tactile acoustic feedback on every keypress</span>
              </div>
              <select id="setting-click-sound" class="custom-select">
                <option value="cherry-blue" ${settings?.keyboardClickSound === 'cherry-blue' ? 'selected' : ''}>Cherry MX Blue (Crisp Click)</option>
                <option value="mx-red" ${settings?.keyboardClickSound === 'mx-red' ? 'selected' : ''}>Cherry MX Red (Linear Thud)</option>
                <option value="cyber-blip" ${settings?.keyboardClickSound === 'cyber-blip' ? 'selected' : ''}>Cyberpunk Digital Blip</option>
                <option value="off" ${settings?.keyboardClickSound === 'off' ? 'selected' : ''}>Muted / Off</option>
              </select>
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Dynamic Engine Audio</strong>
                <span>Engine roar pitch correlates directly with typing speed</span>
              </div>
              <input type="checkbox" id="setting-engine-audio" ${settings?.engineAudio ? 'checked' : ''} class="custom-toggle">
            </div>

            <div class="audio-preview-strip">
              <button class="btn btn-small btn-secondary" id="btn-preview-interior" type="button">
                🎵 Preview Interior
              </button>
              <button class="btn btn-small btn-secondary" id="btn-preview-racing" type="button">
                🏎️ Preview Racing
              </button>
              <button class="btn btn-small btn-outline" id="btn-preview-sfx" type="button">
                ⚡ Test Nitro SFX
              </button>
            </div>

            <div class="audio-reset-box">
              <button class="btn btn-outline btn-small" id="btn-reset-audio-mix" type="button" title="Reset all audio volumes to professional studio-balanced mix">
                ↺ Restore Recommended Audio Mix
              </button>
              <span class="audio-reset-hint">Master: 70% | Interior: 15% | Racing: 22% | SFX: 35%</span>
            </div>
          </div>

          <!-- 4. PILOT PROFILE & IDENTITY -->
          <div class="settings-card">
            <h3 class="panel-title">Pilot Identity</h3>

            <div class="setting-item">
              <div class="s-info">
                <strong>Callsign / Username</strong>
                <span>Displayed on leaderboards and multiplayer</span>
              </div>
              <input type="text" id="setting-username" value="${profile?.username || 'Kartik'}" maxlength="24" class="custom-input">
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Pilot Avatar & Esports Identity</strong>
                <span>Manage custom avatar uploads, bio, region, telemetry, and privacy controls</span>
              </div>
              <button class="btn btn-outline btn-small" data-nav="profile" type="button">
                Open Full Pilot Profile →
              </button>
            </div>
          </div>

          <!-- 5. NOTIFICATIONS & DAILY REMINDERS -->
          <div class="settings-card">
            <h3 class="panel-title">Notifications & Reminders</h3>

            <div class="setting-item">
              <div class="s-info">
                <strong>Daily Practice Reminder</strong>
                <span>Notification reminder when pending daily goals</span>
              </div>
              <input type="checkbox" id="setting-notifs-enabled" ${settings?.notificationsEnabled ? 'checked' : ''} class="custom-toggle">
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Browser Permission Status</strong>
                <span class="font-mono text-positive">${notifPermission.toUpperCase()}</span>
              </div>
              <button class="btn btn-outline btn-small" id="btn-request-notif">
                Request Permission / Send Test
              </button>
            </div>
          </div>

          <!-- 6. OFFLINE DATA PERSISTENCE & BACKUP -->
          <div class="settings-card">
            <h3 class="panel-title">Data & Storage Management</h3>

            <p class="data-explainer">
              All telemetry, unlocked supercars, and session histories are stored inside IndexedDB in your browser.
              No account creation or cloud server is required.
            </p>

            <div class="data-actions-row">
              <button class="btn btn-secondary" id="btn-export-backup">
                📦 Backup All Data (JSON)
              </button>

              <label class="btn btn-outline custom-file-upload">
                📥 Restore Backup
                <input type="file" id="file-import-backup" accept=".json" style="display: none;">
              </label>

              <button class="btn btn-outline text-negative" id="btn-reset-db">
                ⚠️ Reset All Data
              </button>
            </div>
          </div>

          <!-- 7. PRIVACY & DATA PROTECTION CONTROLS -->
          <div class="settings-card">
            <h3 class="panel-title">Privacy Controls</h3>

            <div class="setting-item">
              <div class="s-info">
                <strong>Public Esports Profile</strong>
                <span>Allow your callsign and league tier to appear on rankings</span>
              </div>
              <input type="checkbox" id="setting-privacy-public" ${profile?.visibility !== 'private' ? 'checked' : ''} class="custom-toggle">
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Share Race Telemetry</strong>
                <span>Broadcast live WPM and speedometer during multiplayer matches</span>
              </div>
              <input type="checkbox" id="setting-privacy-telemetry" ${profile?.showStats !== false ? 'checked' : ''} class="custom-toggle">
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Show Session History</strong>
                <span>Allow viewing of previous race timestamps and circuits</span>
              </div>
              <input type="checkbox" id="setting-privacy-history" ${profile?.showHistory !== false ? 'checked' : ''} class="custom-toggle">
            </div>

            <div class="setting-item">
              <div class="s-info">
                <strong>Optional Telemetry Analytics</strong>
                <span>Allow anonymous local performance error collection to improve the 3D racing engine</span>
              </div>
              <input type="checkbox" id="setting-privacy-analytics" ${profile?.analyticsConsent ? 'checked' : ''} class="custom-toggle">
            </div>

            <div class="legal-links-strip">
              <div class="legal-strip-title">LEGAL POLICIES & COMPLIANCE:</div>
              <div class="legal-strip-buttons">
                <button class="btn btn-outline btn-small" data-nav="legal" data-legal-tab="privacy" type="button">🛡️ Privacy Policy</button>
                <button class="btn btn-outline btn-small" data-nav="legal" data-legal-tab="terms" type="button">📜 Terms of Service</button>
                <button class="btn btn-outline btn-small" data-nav="legal" data-legal-tab="cookies" type="button">🍪 Cookie Notice</button>
                <button class="btn btn-outline btn-small" data-nav="legal" data-legal-tab="security" type="button">🔒 Security Disclosure</button>
                <button class="btn btn-outline btn-small" data-nav="legal" data-legal-tab="accessibility" type="button">♿ Accessibility</button>
              </div>
            </div>
          </div>

          <!-- 8. DANGER ZONE: ACCOUNT DELETION -->
          <div class="settings-card card-danger-zone">
            <h3 class="panel-title text-negative">Account Lifecycle & Reset</h3>

            <div class="danger-zone-content">
              <p class="text-negative-desc">
                Permanently delete your player profile, supercar customizations, unlocked liveries, practice streaks, session logs, and purge all Service Worker caches. This action cannot be undone.
              </p>
              <button class="btn btn-outline btn-danger" id="btn-trigger-delete-account" type="button">
                🗑️ Permanently Delete Account & Data
              </button>
            </div>
          </div>
        </div>

        <div class="settings-footer-actions">
          <button class="btn btn-primary btn-large glow-primary" id="btn-save-settings">
            💾 SAVE SETTINGS
          </button>
        </div>

        <!-- ACCOUNT DELETION CONFIRMATION MODAL -->
        <div class="profile-modal-overlay" id="delete-account-modal" role="dialog" aria-modal="true" aria-labelledby="del-modal-title">
          <div class="profile-modal-dialog modal-danger-dialog">
            <div class="modal-header">
              <h3 id="del-modal-title" class="modal-title text-negative">PERMANENT ACCOUNT DELETION</h3>
              <button class="modal-close-btn" id="btn-del-modal-close" aria-label="Close">×</button>
            </div>

            <div class="modal-danger-body">
              <div class="danger-warning-banner">
                <span class="warning-icon">⚠️</span>
                <div>
                  <strong>Irreversible Data Erasure</strong>
                  <p>In compliance with DPDPA 2023 and GDPR, executing this request will immediately and permanently erase:</p>
                </div>
              </div>

              <ul class="deletion-purge-list">
                <li>IndexedDB Profile & Pilot Callsign</li>
                <li>All recorded race session telemetry & WPM charts</li>
                <li>Garage vehicle unlocks, custom liveries & neon underglow</li>
                <li>Daily mission progress and streak calendar</li>
                <li>Service Worker offline asset caches (keyrush-v3)</li>
                <li>Browser session & local storage flags</li>
              </ul>

              <div class="deletion-challenge-box">
                <label for="input-del-challenge" class="challenge-label">
                  To confirm, type <strong class="highlight-cyan font-mono" id="del-challenge-phrase">DELETE ${profile?.username?.toUpperCase() || 'KARTIK'}</strong> below:
                </label>
                <input type="text" id="input-del-challenge" class="custom-input font-mono" placeholder="Type confirmation phrase exactly" autocomplete="off" />
              </div>

              <div class="deletion-status-message hidden" id="del-status-message"></div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" id="btn-cancel-delete">Cancel</button>
              <button type="button" class="btn btn-danger" id="btn-confirm-delete" disabled>
                Permanently Delete Everything
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(settings, profile);
  }

  bindEvents(settings, profile) {
    // Live Volume Sliders & Background Music Toggle
    const masterSlider = document.getElementById('setting-master-vol');
    const interiorSlider = document.getElementById('setting-interior-vol');
    const racingSlider = document.getElementById('setting-racing-vol');
    const sfxSlider = document.getElementById('setting-sfx-vol');
    const musicToggle = document.getElementById('setting-music-enabled');
    const musicBadge = document.getElementById('setting-music-badge');

    const handleLiveAudioUpdate = () => {
      const masterVolume = parseFloat(masterSlider?.value ?? 0.8);
      const interiorVolume = parseFloat(interiorSlider?.value ?? 0.55);
      const racingVolume = parseFloat(racingSlider?.value ?? 0.65);
      const sfxVolume = parseFloat(sfxSlider?.value ?? 0.6);
      const isMusicEnabled = Boolean(musicToggle?.checked);
      const musicMuted = !isMusicEnabled;

      if (musicBadge) {
        musicBadge.textContent = isMusicEnabled ? '🔊 Active' : '🔇 Muted';
        musicBadge.className = `setting-toggle-badge ${isMusicEnabled ? 'badge-active' : 'badge-muted'}`;
      }

      const masterLabel = document.getElementById('master-vol-val');
      const interiorLabel = document.getElementById('interior-vol-val');
      const racingLabel = document.getElementById('racing-vol-val');
      const sfxLabel = document.getElementById('sfx-vol-val');

      if (masterLabel) masterLabel.textContent = `${Math.round(masterVolume * 100)}%`;
      if (interiorLabel) interiorLabel.textContent = `${Math.round(interiorVolume * 100)}%`;
      if (racingLabel) racingLabel.textContent = `${Math.round(racingVolume * 100)}%`;
      if (sfxLabel) sfxLabel.textContent = `${Math.round(sfxVolume * 100)}%`;

      const audioConfig = {
        masterVolume,
        interiorVolume,
        racingVolume,
        sfxVolume,
        musicMuted,
        soundMuted: musicMuted
      };

      musicManager.applySettings(audioConfig);
      soundEffects.updateSettings(audioConfig);
    };

    masterSlider?.addEventListener('input', handleLiveAudioUpdate);
    interiorSlider?.addEventListener('input', handleLiveAudioUpdate);
    racingSlider?.addEventListener('input', handleLiveAudioUpdate);
    sfxSlider?.addEventListener('input', handleLiveAudioUpdate);
    musicToggle?.addEventListener('change', handleLiveAudioUpdate);

    // Audio Preview buttons
    document.getElementById('btn-preview-interior')?.addEventListener('click', () => {
      musicManager.playInterior(1500, true);
    });

    document.getElementById('btn-preview-racing')?.addEventListener('click', () => {
      musicManager.playRacing(1200);
    });

    document.getElementById('btn-preview-sfx')?.addEventListener('click', () => {
      soundEffects.playNitroBoost();
    });

    // Restore Recommended Audio Mix
    document.getElementById('btn-reset-audio-mix')?.addEventListener('click', async () => {
      const defs = await musicManager.restoreRecommendedDefaults(true);

      if (masterSlider) masterSlider.value = defs.masterVolume.toString();
      if (interiorSlider) interiorSlider.value = defs.interiorVolume.toString();
      if (racingSlider) racingSlider.value = defs.racingVolume.toString();
      if (sfxSlider) sfxSlider.value = defs.sfxVolume.toString();
      if (musicToggle) musicToggle.checked = !defs.musicMuted;
      if (musicBadge) {
        musicBadge.textContent = !defs.musicMuted ? '🔊 Active' : '🔇 Muted';
        musicBadge.className = `setting-toggle-badge ${!defs.musicMuted ? 'badge-active' : 'badge-muted'}`;
      }

      const masterLabel = document.getElementById('master-vol-val');
      const interiorLabel = document.getElementById('interior-vol-val');
      const racingLabel = document.getElementById('racing-vol-val');
      const sfxLabel = document.getElementById('sfx-vol-val');

      if (masterLabel) masterLabel.textContent = `${Math.round(defs.masterVolume * 100)}%`;
      if (interiorLabel) interiorLabel.textContent = `${Math.round(defs.interiorVolume * 100)}%`;
      if (racingLabel) racingLabel.textContent = `${Math.round(defs.racingVolume * 100)}%`;
      if (sfxLabel) sfxLabel.textContent = `${Math.round(defs.sfxVolume * 100)}%`;

      soundEffects.playUiClick();
    });

    // Save button
    document.getElementById('btn-save-settings')?.addEventListener('click', async () => {
      const theme = document.getElementById('setting-theme')?.value || 'cyber-dark';
      const reducedMotion = document.getElementById('setting-reduced-motion')?.checked || false;
      const errorPenalty = document.getElementById('setting-error-penalty')?.value || 'standard';
      const targetWpm = parseInt(document.getElementById('setting-target-wpm')?.value, 10) || 80;
      const dailyGoal = parseInt(document.getElementById('setting-daily-goal')?.value, 10) || 15;
      const keyboardClickSound =
        document.getElementById('setting-click-sound')?.value || 'cherry-blue';
      const engineAudio = document.getElementById('setting-engine-audio')?.checked ?? true;
      const sfxVolume = parseFloat(document.getElementById('setting-sfx-vol')?.value) || 0.6;
      const masterVolume = parseFloat(document.getElementById('setting-master-vol')?.value) || 0.8;
      const interiorVolume =
        parseFloat(document.getElementById('setting-interior-vol')?.value) || 0.55;
      const racingVolume = parseFloat(document.getElementById('setting-racing-vol')?.value) || 0.65;
      const isMusicEnabled = Boolean(document.getElementById('setting-music-enabled')?.checked);
      const musicMuted = !isMusicEnabled;
      const notifs = document.getElementById('setting-notifs-enabled')?.checked ?? true;

      const newSettings = {
        ...settings,
        theme,
        reducedMotion,
        errorPenalty,
        targetWpm,
        dailyGoalMinutes: dailyGoal,
        keyboardClickSound,
        engineAudio,
        sfxVolume,
        masterVolume,
        interiorVolume,
        racingVolume,
        musicMuted,
        notificationsEnabled: notifs
      };

      await storage.saveSettings(newSettings);
      musicManager.applySettings(newSettings);
      soundEffects.updateSettings(newSettings);

      // Update Profile username if changed
      const newUsername = document.getElementById('setting-username')?.value.trim();
      if (newUsername && newUsername.length >= 2) {
        profile.username = newUsername;
        await storage.saveProfile(profile);
      }

      // Apply theme
      document.body.className = `theme-${theme}`;

      soundEffects.playVictoryFanfare();
      alert('Settings saved successfully!');
      this.app.updateHeader();
    });

    // Test notification
    document.getElementById('btn-request-notif')?.addEventListener('click', async () => {
      const res = await NotificationManager.requestPermission();
      if (res === 'granted') {
        NotificationManager.sendLocalNotification('🏎️ KEYRUSH Ready!', {
          body: 'Your notification system is tuned and ready for daily practice reminders.'
        });
        alert('Test notification triggered!');
      } else {
        alert(`Notification permission status: ${res}`);
      }
    });

    // Backup export
    document.getElementById('btn-export-backup')?.addEventListener('click', async () => {
      const full = await storage.exportFullData();
      const blob = new Blob([full], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `KeyRush_FullBackup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    });

    // Restore import
    document.getElementById('file-import-backup')?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const json = evt.target.result;
        const success = await storage.importFullData(json);
        if (success) {
          alert('Backup restored successfully! Reloading...');
          window.location.reload();
        } else {
          alert('Failed to parse backup JSON.');
        }
      };
      reader.readAsText(file);
    });

    // Reset database
    document.getElementById('btn-reset-db')?.addEventListener('click', async () => {
      if (
        confirm(
          'Are you sure you want to clear all local data? This will reset your vehicles, streaks, and sessions to defaults.'
        )
      ) {
        await storage.clearAllData();
        alert('Data reset to defaults.');
        window.location.reload();
      }
    });

    // Privacy toggles live sync
    const togglePublic = document.getElementById('setting-privacy-public');
    togglePublic?.addEventListener('change', async () => {
      profile.visibility = togglePublic.checked ? 'public' : 'private';
      await storage.saveProfile(profile);
      soundEffects.playUiClick();
    });

    const toggleTelemetry = document.getElementById('setting-privacy-telemetry');
    toggleTelemetry?.addEventListener('change', async () => {
      profile.showStats = toggleTelemetry.checked;
      await storage.saveProfile(profile);
      soundEffects.playUiClick();
    });

    const toggleHistory = document.getElementById('setting-privacy-history');
    toggleHistory?.addEventListener('change', async () => {
      profile.showHistory = toggleHistory.checked;
      await storage.saveProfile(profile);
      soundEffects.playUiClick();
    });

    const toggleAnalytics = document.getElementById('setting-privacy-analytics');
    toggleAnalytics?.addEventListener('change', async () => {
      profile.analyticsConsent = toggleAnalytics.checked;
      settings.analyticsConsent = toggleAnalytics.checked;
      await storage.saveProfile(profile);
      await storage.saveSettings(settings);
      soundEffects.playUiClick();
    });

    // Legal tabs delegation
    this.container.querySelectorAll('[data-legal-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = btn.getAttribute('data-legal-tab');
        soundEffects.playUiClick();
        this.app.showScreen('legal', { tab });
      });
    });

    // Account Deletion Workflow Modal Handlers
    const triggerDelBtn = document.getElementById('btn-trigger-delete-account');
    const delModal = document.getElementById('delete-account-modal');
    const closeDelBtn = document.getElementById('btn-del-modal-close');
    const cancelDelBtn = document.getElementById('btn-cancel-delete');
    const confirmDelBtn = document.getElementById('btn-confirm-delete');
    const challengeInput = document.getElementById('input-del-challenge');
    const statusMsg = document.getElementById('del-status-message');

    let currentReq = null;

    triggerDelBtn?.addEventListener('click', () => {
      soundEffects.playUiClick();
      currentReq = accountLifecycle.initiateDeletion(profile?.username || 'KARTIK');
      if (delModal) delModal.classList.add('active');
      if (challengeInput) {
        challengeInput.value = '';
        challengeInput.focus();
      }
      if (confirmDelBtn) confirmDelBtn.disabled = true;
      if (statusMsg) statusMsg.classList.add('hidden');
    });

    const closeDeleteModal = () => {
      accountLifecycle.cancelDeletion();
      if (delModal) delModal.classList.remove('active');
    };

    closeDelBtn?.addEventListener('click', closeDeleteModal);
    cancelDelBtn?.addEventListener('click', closeDeleteModal);

    challengeInput?.addEventListener('input', () => {
      if (confirmDelBtn && currentReq) {
        confirmDelBtn.disabled = challengeInput.value.trim() !== currentReq.requiredPhrase;
      }
    });

    confirmDelBtn?.addEventListener('click', async () => {
      if (!currentReq) return;
      confirmDelBtn.disabled = true;
      if (statusMsg) {
        statusMsg.classList.remove('hidden');
        statusMsg.className = 'deletion-status-message status-processing';
        statusMsg.textContent = 'Erasing database, unlinking caches, and wiping storage...';
      }

      const res = await accountLifecycle.executePermanentDeletion(challengeInput.value.trim());
      if (res.success) {
        if (statusMsg) {
          statusMsg.className = 'deletion-status-message status-success';
          statusMsg.textContent = 'Account and all data successfully erased. Redirecting...';
        }
        setTimeout(() => {
          closeDeleteModal();
          sessionStorage.removeItem('keyrush_entered');
          window.location.hash = '#landing';
          window.location.reload();
        }, 1200);
      } else {
        if (statusMsg) {
          statusMsg.className = 'deletion-status-message status-error';
          statusMsg.textContent = `Deletion failed: ${res.error}`;
        }
        confirmDelBtn.disabled = false;
      }
    });
  }

  dispose() {}
}
