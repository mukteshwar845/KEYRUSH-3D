/**
 * KEYRUSH — TYPE. RACE. DOMINATE.
 * Main Application Orchestrator & Screen Router
 */

import './style.css';
import { storage } from './db/index.js';
import { soundEffects, musicManager } from './audio/index.js';
import {
  NavigationManager,
  LandingView,
  DashboardView,
  RaceModesView,
  RaceView,
  DiagnosticView,
  MultiplayerView,
  AiSelectView,
  AcademyView,
  GarageView,
  LeaderboardView,
  AnalyticsView,
  MissionsView,
  SettingsView,
  ProfileView,
  LegalView
} from './ui/index.js';

class KeyRushApp {
  constructor() {
    this.navManager = null;
    this.currentViewInstance = null;
    this.currentScreen = 'dashboard';
    this.profile = null;
    this.settings = null;
  }

  async init() {
    // 1. Initialize offline IndexedDB storage
    await storage.ready;
    this.profile = await storage.getProfile();
    this.settings = await storage.getSettings();

    // 2. Configure audio settings
    if (this.settings) {
      soundEffects.updateSettings(this.settings);
      musicManager.applySettings(this.settings);
      document.body.className = `theme-${this.settings.theme || 'cyber-dark'}`;
    }

    // 3. Setup Navigation Controller
    this.navManager = new NavigationManager(this);

    // 4. Render Layout Shell (Persistent Master Navigation)
    this.renderShell();
    this.navManager.bindEvents();

    // 5. Initial View Route — Stop direct access to main page; must enter via Get Started button
    const validScreens = [
      'landing',
      'dashboard',
      'race',
      'race-modes',
      'diagnostic',
      'academy',
      'garage',
      'leaderboard',
      'analytics',
      'missions',
      'settings',
      'profile',
      'legal'
    ];
    const initialHash = window.location.hash.replace('#', '').trim();
    const hasEntered = sessionStorage.getItem('keyrush_entered') === 'true';

    if (!hasEntered) {
      // Force Landing overview page on initial load or direct URL access
      this.showScreen('landing');
    } else if (initialHash && validScreens.includes(initialHash)) {
      this.showScreen(initialHash);
    } else {
      this.showScreen('dashboard');
    }

    // Support browser back/forward buttons with route guard
    window.addEventListener('hashchange', () => {
      const targetHash = window.location.hash.replace('#', '').trim();
      const sessionEntered = sessionStorage.getItem('keyrush_entered') === 'true';
      if (!sessionEntered && targetHash !== 'landing') {
        this.showScreen('landing');
        return;
      }
      if (
        targetHash &&
        (validScreens.includes(targetHash) || targetHash.startsWith('legal')) &&
        targetHash !== this.currentScreen
      ) {
        this.showScreen(targetHash);
      }
    });

    // Account deletion listener: returns user to fresh landing state
    window.addEventListener('keyrush:account-deleted', () => {
      this.profile = null;
      this.settings = null;
      this.showScreen('landing');
    });

    // 6. Register PWA Service Worker if supported
    this.registerServiceWorker();
  }

  renderShell() {
    const appEl = document.getElementById('app');
    if (!appEl) return;
    appEl.innerHTML = this.navManager.renderShell(this.profile);
  }

  async updateHeader() {
    this.profile = await storage.getProfile();
    const userChip = document.getElementById('dash-user-chip');
    if (userChip && this.profile) {
      const nameEl = userChip.querySelector('.dash-user-name');
      if (nameEl) nameEl.textContent = this.profile.username || 'Kartik';

      const roleEl = userChip.querySelector('.dash-user-role');
      if (roleEl) roleEl.textContent = this.profile.callsign || this.profile.role || 'Apex Pilot';

      const avatarEl = userChip.querySelector('.dash-user-avatar');
      if (avatarEl) {
        const src = this.profile.avatar || '/images/ui/avatar-kartik.png';
        if (src.startsWith('data:') || src.startsWith('/') || src.startsWith('http')) {
          avatarEl.src = src;
        }
      }
    }
  }

  async showScreen(screenId, params = null) {
    // RouteGuard: stop direct access to main dashboard or inner pages
    const sessionEntered = sessionStorage.getItem('keyrush_entered') === 'true';
    if (!sessionEntered && screenId !== 'landing') {
      screenId = 'landing';
    }

    // Dispose previous active screen
    if (this.currentViewInstance && this.currentViewInstance.dispose) {
      this.currentViewInstance.dispose();
      this.currentViewInstance = null;
    }

    this.currentScreen = screenId;
    if (window.location.hash !== `#${screenId}`) {
      history.replaceState(null, '', `#${screenId}`);
    }
    const mainEl = document.getElementById('main-content');
    if (!mainEl) return;

    // Refresh profile in case stats changed
    this.profile = await storage.getProfile();

    // Highlight current active tab in left sidebar and handle race mode full-width
    if (this.navManager) {
      this.navManager.setActiveScreen(screenId);
    }

    const mainArea = document.getElementById('dash-main-area');
    if (mainArea) {
      mainArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Music Management:
    if (screenId !== 'race') {
      musicManager.playInterior();
    }

    switch (screenId) {
      case 'dashboard':
        this.currentViewInstance = new DashboardView(mainEl, this);
        await this.currentViewInstance.render(this.profile);
        break;

      case 'race-modes':
        this.currentViewInstance = new RaceModesView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'race':
        this.currentViewInstance = new RaceView(mainEl, this);
        await this.currentViewInstance.setup(
          params || { mode: 'AI Racing', difficulty: 'AMATEUR' }
        );
        break;

      case 'diagnostic':
        this.currentViewInstance = new DiagnosticView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'academy':
        this.currentViewInstance = new AcademyView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'garage':
        this.currentViewInstance = new GarageView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'leaderboard':
        this.currentViewInstance = new LeaderboardView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'analytics':
        this.currentViewInstance = new AnalyticsView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'missions':
        this.currentViewInstance = new MissionsView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'settings':
        this.currentViewInstance = new SettingsView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'profile':
        this.currentViewInstance = new ProfileView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'multiplayer':
        this.currentViewInstance = new MultiplayerView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'ai-select':
        this.currentViewInstance = new AiSelectView(mainEl, this);
        await this.currentViewInstance.render();
        break;

      case 'landing':
        this.currentViewInstance = new LandingView(mainEl, this);
        this.currentViewInstance.render(this.profile);
        break;

      case 'legal':
      default:
        if (screenId.startsWith('legal')) {
          const tab = params?.tab || (screenId.includes('-') ? screenId.split('-')[1] : 'privacy');
          this.currentViewInstance = new LegalView(mainEl, this);
          await this.currentViewInstance.render(tab);
        } else {
          this.currentViewInstance = new DashboardView(mainEl, this);
          await this.currentViewInstance.render(this.profile);
        }
        break;
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('KeyRush ServiceWorker registered successfully:', reg.scope);
          })
          .catch((err) => {
            console.log('KeyRush ServiceWorker registration skipped/failed:', err);
          });
      });
    }
  }
}

// Start application
const app = new KeyRushApp();
window.keyRushApp = app;
window.musicManager = musicManager;
window.soundEffects = soundEffects;

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}
