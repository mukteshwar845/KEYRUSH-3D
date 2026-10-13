/**
 * KEYRUSH — Legal Documentation & Policy Center View
 * Provides an accessible, in-game interactive viewer for Privacy Policy,
 * Terms of Service, Cookie Notice, Community Guidelines, and Security Disclosures.
 */

import { soundEffects } from '../audio/soundEffects.js';

export const LEGAL_TABS = [
  { id: 'privacy', label: 'Privacy Policy', icon: '🛡️' },
  { id: 'terms', label: 'Terms of Service', icon: '📜' },
  { id: 'cookies', label: 'Cookies & Storage', icon: '🍪' },
  { id: 'community', label: 'Community Guidelines', icon: '🤝' },
  { id: 'security', label: 'Security & Disclosure', icon: '🔒' },
  { id: 'retention', label: 'Data Retention', icon: '🗄️' },
  { id: 'accessibility', label: 'Accessibility Statement', icon: '♿' },
  { id: 'third-party', label: 'Third-Party Services', icon: '🌐' }
];

export class LegalView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.activeTab = 'privacy';
  }

  async render(initialTab = 'privacy') {
    if (LEGAL_TABS.some((t) => t.id === initialTab)) {
      this.activeTab = initialTab;
    }

    this.container.innerHTML = `
      <div class="dash-page-container legal-center-page">
        <!-- Section Header -->
        <header class="dash-section-hero">
          <div class="section-hero-content">
            <h1 class="dash-page-title">Legal & Privacy Documentation</h1>
            <p class="dash-page-desc">
              Transparent terms, data protection disclosures, community standards, and responsible security policies for KEYRUSH.
            </p>
          </div>
        </header>

        <div class="legal-layout-container">
          <!-- Legal Left Navigation Sidebar -->
          <nav class="legal-tabs-nav" aria-label="Legal Documents Menu">
            <div class="legal-nav-header">
              <span class="legal-nav-title">Policies</span>
            </div>
            <ul class="legal-tabs-list">
              ${LEGAL_TABS.map(
                (tab) => `
                <li>
                  <button class="legal-tab-btn ${this.activeTab === tab.id ? 'active' : ''}" data-legal-tab="${tab.id}">
                    <span class="tab-icon">${tab.icon}</span>
                    <span class="tab-label">${tab.label}</span>
                  </button>
                </li>
              `
              ).join('')}
            </ul>

            <div class="legal-sidebar-actions">
              <button class="btn btn-outline btn-small" data-nav="settings" style="width:100%;">
                ← Back to Settings
              </button>
            </div>
          </nav>

          <!-- Legal Document Display Canvas -->
          <main class="legal-content-canvas" id="legal-content-canvas">
            ${this.renderTabContent(this.activeTab)}
          </main>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll('[data-legal-tab]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = btn.getAttribute('data-legal-tab');
        soundEffects.playUiClick();
        this.activeTab = tabId;

        // Update active class
        this.container
          .querySelectorAll('.legal-tab-btn')
          .forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Swap document content
        const canvas = document.getElementById('legal-content-canvas');
        if (canvas) {
          canvas.innerHTML = this.renderTabContent(tabId);
          canvas.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });

    this.container.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-nav');
        soundEffects.playUiClick();
        this.app.showScreen(target);
      });
    });
  }

  renderTabContent(tabId) {
    switch (tabId) {
      case 'privacy':
        return `
          <article class="legal-article">
            <header class="legal-article-header">
              <span class="legal-badge">VERSION 1.0.0 • EFFECTIVE OCT 2026</span>
              <h2>KEYRUSH Privacy Policy</h2>
              <p class="legal-summary">How KEYRUSH collects, processes, and protects your data under our offline-first architecture.</p>
            </header>

            <div class="legal-body">
              <h3>1. Offline-First Data Architecture</h3>
              <p>KEYRUSH operates as an offline-first motorsport typing simulator. All pilot identity information, typing speed records (WPM, accuracy, consistency), supercar garage customizations, and unlocked achievements are stored exclusively inside your device's browser sandbox via <strong>IndexedDB (keyrush_database)</strong>.</p>

              <h3>2. Data We Process Locally</h3>
              <ul>
                <li><strong>Pilot Identity:</strong> Callsign, username, avatar image, player bio, and regional country tag.</li>
                <li><strong>Career Telemetry:</strong> WPM history, mistyped keystrokes, practice session durations, and race win/loss ratios.</li>
                <li><strong>Customization:</strong> Vehicle model selections, custom paint colors, neon underglow hex values, and particle trail styles.</li>
                <li><strong>Preferences:</strong> Sound synthesis volume levels, mechanical switch tone choices, and visual themes.</li>
              </ul>

              <h3>3. What We Do NOT Collect</h3>
              <p>We do not collect or transmit real-world passwords, credit card numbers, device biometrics, or raw keystrokes typed outside of the simulator's typing exercises. We do not sell player data to third parties.</p>

              <h3>4. Third-Party Integrations</h3>
              <p>The only external network requests made by KEYRUSH are to the <strong>Google Fonts CDN</strong> (<code>fonts.googleapis.com</code>) to download typography assets. We embed zero third-party advertising trackers, data brokers, or analytics pixels.</p>

              <h3>5. Your Rights & Data Portability</h3>
              <p>You can export a full JSON backup of all your data at any time via <strong>Settings → Offline Data & Backup</strong>, or permanently wipe all records via <strong>Settings → Account → Delete Account</strong>.</p>
            </div>
          </article>
        `;

      case 'terms':
        return `
          <article class="legal-article">
            <header class="legal-article-header">
              <span class="legal-badge">VERSION 1.0.0 • EFFECTIVE OCT 2026</span>
              <h2>Terms of Service</h2>
              <p class="legal-summary">Rules of engagement, licensing, and esports fair play guidelines.</p>
            </header>

            <div class="legal-body">
              <h3>1. License Grant</h3>
              <p>KEYRUSH grants players a personal, revocable, non-exclusive license to play the racing simulator for entertainment and touch-typing improvement.</p>

              <h3>2. Anti-Botting & Fair Play Rules</h3>
              <p>All race records and typing benchmarks must reflect human input. The use of automated keystroke injection scripts, macros, virtual key synthesizers, or memory tampering to manipulate speedometers or leaderboard ranks is strictly prohibited.</p>

              <h3>3. Intellectual Property</h3>
              <p>The 3D procedural track geometries, vehicle shaders, sound synthesis algorithms, and visual interfaces are protected intellectual property. Open-source libraries (Three.js, Chart.js) remain under their respective MIT licenses.</p>

              <h3>4. Disclaimer of Warranty</h3>
              <p>The simulator is provided on an "AS IS" basis. Players are advised to export periodic JSON backups to guard against accidental browser cache clearing.</p>
            </div>
          </article>
        `;

      case 'cookies':
        return `
          <article class="legal-article">
            <header class="legal-article-header">
              <span class="legal-badge">VERSION 1.0.0 • EFFECTIVE OCT 2026</span>
              <h2>Cookies & Browser Storage Notice</h2>
              <p class="legal-summary">Detailed explanation of IndexedDB, SessionStorage, and CacheStorage usage.</p>
            </header>

            <div class="legal-body">
              <h3>Zero Tracking Cookies</h3>
              <p>KEYRUSH uses <strong>0 tracking cookies</strong> and sets no advertising identifiers on your device.</p>

              <h3>Storage Technologies</h3>
              <div class="legal-table-wrap">
                <table class="legal-table">
                  <thead>
                    <tr><th>Storage</th><th>Key</th><th>Function</th><th>Duration</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>IndexedDB</td><td>keyrush_database</td><td>Stores profile, garage, telemetry, settings</td><td>Persistent on device</td></tr>
                    <tr><td>Session Storage</td><td>keyrush_entered</td><td>Tracks landing page completion</td><td>Current tab only</td></tr>
                    <tr><td>Cache Storage</td><td>keyrush-v3</td><td>Service Worker offline asset caching</td><td>Until app update or deletion</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        `;

      case 'community':
        return `
          <article class="legal-article">
            <header class="legal-article-header">
              <span class="legal-badge">VERSION 1.0.0 • EFFECTIVE OCT 2026</span>
              <h2>Community Guidelines & Esports Code</h2>
              <p class="legal-summary">Standards for sportsmanship, callsigns, and multiplayer behavior.</p>
            </header>

            <div class="legal-body">
              <h3>1. Respect & Sportsmanship</h3>
              <p>KEYRUSH is a community of typing enthusiasts and gamers. Harassment, hate speech, slurs, or offensive callsigns targeting race, religion, gender, or sexual orientation will result in removal from public rankings.</p>

              <h3>2. Prohibited Exploits</h3>
              <p>Do not share automated typing exploits or exploit bugs in physics calculations. Report any vulnerabilities responsibly to help keep the competition fair.</p>
            </div>
          </article>
        `;

      case 'security':
        return `
          <article class="legal-article">
            <header class="legal-article-header">
              <span class="legal-badge">VERSION 1.0.0 • EFFECTIVE OCT 2026</span>
              <h2>Security & Vulnerability Disclosure</h2>
              <p class="legal-summary">Guidelines for security researchers reporting potential vulnerabilities.</p>
            </header>

            <div class="legal-body">
              <h3>Responsible Disclosure Program</h3>
              <p>If you discover a security vulnerability in KEYRUSH, please report it via GitHub Private Vulnerability Reporting:</p>
              <p><a href="https://github.com/mukteshwar845/KEYRUSH-3D/security/advisories/new" target="_blank" rel="noopener" class="highlight-cyan font-mono">Submit Security Advisory →</a></p>

              <h3>Safe Harbor</h3>
              <p>Researchers conducting good-faith security research who comply with our disclosure policy will receive full safe harbor protection.</p>
            </div>
          </article>
        `;

      case 'retention':
        return `
          <article class="legal-article">
            <header class="legal-article-header">
              <span class="legal-badge">VERSION 1.0.0 • EFFECTIVE OCT 2026</span>
              <h2>Data Retention & Deletion Policy</h2>
              <p class="legal-summary">Schedules for data preservation and atomic user erasure procedures.</p>
            </header>

            <div class="legal-body">
              <h3>Retention Schedules</h3>
              <p>Personal data is retained only as long as you maintain the local application on your browser. Telemetry sessions are capped at 1,000 recent records. All data can be purged in seconds via <strong>Settings → Account → Delete Account</strong>.</p>
            </div>
          </article>
        `;

      case 'accessibility':
        return `
          <article class="legal-article">
            <header class="legal-article-header">
              <span class="legal-badge">VERSION 1.0.0 • EFFECTIVE OCT 2026</span>
              <h2>Accessibility Statement</h2>
              <p class="legal-summary">WCAG 2.1 AA conformance, reduced motion support, and assistive features.</p>
            </header>

            <div class="legal-body">
              <h3>Implemented Accessibility Controls</h3>
              <ul>
                <li><strong>Reduced Motion Mode:</strong> Disables screen shaking and intensive speed lines.</li>
                <li><strong>Acoustic Switch Tones:</strong> Provides audible mechanical click feedback on keypresses.</li>
                <li><strong>Keyboard Navigation:</strong> Full keyboard access with Tab navigation, Escape dialog dismissal, and Ctrl+K search palette.</li>
                <li><strong>High Contrast Styling:</strong> High-contrast borders and text compliant with WCAG AA ratios.</li>
              </ul>
            </div>
          </article>
        `;

      case 'third-party':
        return `
          <article class="legal-article">
            <header class="legal-article-header">
              <span class="legal-badge">VERSION 1.0.0 • EFFECTIVE OCT 2026</span>
              <h2>Third-Party Services Notice</h2>
              <p class="legal-summary">Complete inventory of verified network endpoints and open-source packages.</p>
            </header>

            <div class="legal-body">
              <h3>Verified Network Endpoints</h3>
              <p><strong>Google Fonts:</strong> <code>fonts.googleapis.com</code> & <code>fonts.gstatic.com</code></p>
              <p>No other external endpoints receive network traffic from KEYRUSH.</p>

              <h3>Bundled Open-Source Libraries</h3>
              <p>Three.js (WebGL rendering), Chart.js (telemetry graphing), canvas-confetti (celebrations).</p>
            </div>
          </article>
        `;

      default:
        return `<p>Select a policy document from the sidebar to view details.</p>`;
    }
  }

  dispose() {
    // Cleanup if needed
  }
}
