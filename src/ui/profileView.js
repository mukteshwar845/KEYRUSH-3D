/**
 * KeyRush Pilot Profile View
 * Comprehensive, production-ready competitive gaming profile.
 * Displays player identity, verified telemetry statistics, racing identity,
 * session history, achievements, and provides full avatar customization and profile editing.
 */

import { storage } from '../db/storage.js';
import { soundEffects } from '../audio/soundEffects.js';
import { VEHICLE_CATALOG } from '../graphics/carModels.js';

// Predefined built-in cyberpunk pilot avatars
export const BUILTIN_AVATARS = [
  {
    id: 'pilot-kartik',
    label: 'Kartik (Default)',
    url: '/images/ui/avatar-kartik.png'
  },
  {
    id: 'pilot-combat',
    label: 'Combat Helm Pilot',
    url: '/images/ui/pilot-avatar.png'
  },
  {
    id: 'pilot-neon-viper',
    label: 'Neon Viper',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><defs><linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2300D9FF'/><stop offset='100%' stop-color='%23147BFF'/></linearGradient></defs><rect width='100' height='100' rx='20' fill='%230B1017'/><circle cx='50' cy='50' r='38' fill='none' stroke='%2300D9FF' stroke-width='2' stroke-dasharray='4 2'/><path d='M30 40 L50 22 L70 40 L62 76 L50 68 L38 76 Z' fill='url(%23g1)' opacity='0.9'/><path d='M42 46 L50 40 L58 46 L50 62 Z' fill='%23FFFFFF'/><circle cx='50' cy='50' r='4' fill='%2300D9FF'/></svg>"
  },
  {
    id: 'pilot-valkyrie',
    label: 'Cyber Valkyrie',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><defs><linearGradient id='g2' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23A855F7'/><stop offset='100%' stop-color='%23EC4899'/></linearGradient></defs><rect width='100' height='100' rx='20' fill='%23120C1C'/><circle cx='50' cy='50' r='38' fill='none' stroke='%23A855F7' stroke-width='2'/><path d='M25 45 C25 28, 75 28, 75 45 C75 68, 50 82, 50 82 C50 82, 25 68, 25 45 Z' fill='url(%23g2)' opacity='0.85'/><path d='M36 48 L50 36 L64 48 L50 56 Z' fill='%23FFFFFF'/><circle cx='50' cy='46' r='3' fill='%23A855F7'/></svg>"
  },
  {
    id: 'pilot-android',
    label: 'Quantum Droid',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><defs><linearGradient id='g3' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%2310B981'/><stop offset='100%' stop-color='%06B6D4'/></linearGradient></defs><rect width='100' height='100' rx='20' fill='%23081512'/><circle cx='50' cy='50' r='38' fill='none' stroke='%2310B981' stroke-width='2'/><rect x='32' y='32' width='36' height='32' rx='8' fill='url(%23g3)'/><circle cx='42' cy='46' r='4' fill='%23FFFFFF'/><circle cx='58' cy='46' r='4' fill='%23FFFFFF'/><rect x='44' y='54' width='12' height='3' rx='1.5' fill='%230B1017'/><line x1='50' y1='22' x2='50' y2='32' stroke='%2310B981' stroke-width='3'/><circle cx='50' cy='20' r='3' fill='%2310B981'/></svg>"
  },
  {
    id: 'pilot-apex-champion',
    label: 'Apex Gold Legend',
    url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><defs><linearGradient id='g4' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23F59E0B'/><stop offset='100%' stop-color='%23D97706'/></linearGradient></defs><rect width='100' height='100' rx='20' fill='%231C1405'/><circle cx='50' cy='50' r='38' fill='none' stroke='%23F59E0B' stroke-width='2'/><path d='M28 68 L34 34 L50 48 L66 34 L72 68 Z' fill='url(%23g4)'/><circle cx='34' cy='32' r='3' fill='%23FBBF24'/><circle cx='50' cy='44' r='3' fill='%23FBBF24'/><circle cx='66' cy='32' r='3' fill='%23FBBF24'/><path d='M42 60 L50 55 L58 60 L50 64 Z' fill='%23FFFFFF'/></svg>"
  }
];

// Helper to render avatar HTML correctly whether it's an image, data URL, or emoji
export function renderAvatarMarkup(avatarSource, altText = 'Pilot', className = 'profile-avatar-img') {
  if (!avatarSource) {
    return `<img src="/images/ui/avatar-kartik.png" alt="${altText}" class="${className}" />`;
  }
  if (avatarSource.startsWith('data:') || avatarSource.startsWith('/') || avatarSource.startsWith('http')) {
    return `<img src="${avatarSource}" alt="${altText}" class="${className}" onerror="this.onerror=null; this.src='/images/ui/avatar-kartik.png';" />`;
  }
  // Emoji string fallback
  return `<span class="${className} avatar-emoji-badge">${avatarSource}</span>`;
}

export class ProfileView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.profile = null;
    this.sessions = [];
    this.garage = null;
    this.isEditing = false;
    this.pendingAvatar = null;
    this.editErrors = {};
  }

  async render() {
    this.profile = await storage.getProfile();
    this.sessions = await storage.getSessions(50);
    this.garage = await storage.getGarage();

    // Calculate real stats from verified storage data
    const stats = this.calculateVerifiedStats(this.profile, this.sessions);
    const achievements = this.calculateAchievements(stats, this.profile, this.sessions);
    const vehicleInfo = this.getEquippedVehicleInfo(this.garage);

    this.container.innerHTML = `
      <div class="dash-page-container profile-container" id="profile-page-root">
        <!-- 1. HERO IDENTITY CARD -->
        <section class="profile-hero-card" aria-label="Pilot Identity">
          <div class="profile-hero-backdrop"></div>
          <div class="profile-hero-body">
            <!-- Left: Avatar with Status & Quick Edit Action -->
            <div class="profile-avatar-wrapper">
              <div class="profile-avatar-ring tier-${(this.profile?.leagueTier || 'silver').toLowerCase()}">
                ${renderAvatarMarkup(this.profile?.avatar, this.profile?.username, 'profile-hero-avatar-img')}
              </div>
              <button class="profile-avatar-edit-badge" id="btn-avatar-quick-edit" title="Change Avatar" aria-label="Change Avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </button>
              <div class="profile-status-indicator ${this.profile?.visibility === 'private' ? 'status-private' : 'status-online'}" 
                   title="${this.profile?.visibility === 'private' ? 'Private Profile Mode' : 'Pilot Operational'}">
                <span class="status-dot"></span>
                <span class="status-text">${this.profile?.visibility === 'private' ? 'PRIVATE' : 'ONLINE'}</span>
              </div>
            </div>

            <!-- Middle: Pilot Details -->
            <div class="profile-details">
              <div class="profile-header-row">
                <div class="profile-name-group">
                  <h1 class="profile-display-name">${this.escapeHtml(this.profile?.username || 'Kartik')}</h1>
                  <span class="profile-callsign font-mono">${this.escapeHtml(this.profile?.callsign || 'KARTIK-01')}</span>
                  <span class="profile-league-badge tier-${(this.profile?.leagueTier || 'silver').toLowerCase()}">
                    🏆 ${this.profile?.league || 'Silver II'}
                  </span>
                </div>
              </div>

              <p class="profile-bio-text">${this.escapeHtml(this.profile?.bio || 'Pushing keystrokes past the redline. Cyberpunk speed enthusiast and competitive touch-typist.')}</p>

              <div class="profile-meta-tags">
                <span class="meta-tag">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  Joined ${this.formatDate(this.profile?.joinedDate || '2025-01-15')}
                </span>
                <span class="meta-tag">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  Region: ${this.escapeHtml(this.profile?.country || 'IND')}
                </span>
                <span class="meta-tag">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l8 4v6c0 5.25-3.5 10-8 11-4.5-1-8-5.75-8-11V6l8-4z"></path></svg>
                  Level ${this.profile?.level || 6} (${this.profile?.xp || 2480} XP)
                </span>
                <span class="meta-tag visibility-tag ${this.profile?.visibility === 'private' ? 'tag-private' : 'tag-public'}">
                  ${this.profile?.visibility === 'private' ? '🔒 Private Profile' : '🌐 Public Pilot'}
                </span>
              </div>
            </div>

            <!-- Right: Actions -->
            <div class="profile-hero-actions">
              <button class="btn btn-primary glow-primary btn-edit-profile" id="btn-open-edit-profile">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Profile
              </button>
              <button class="btn btn-secondary" id="btn-export-career-json" title="Download your complete career telemetry JSON">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export JSON
              </button>
            </div>
          </div>
        </section>

        <!-- 2. VERIFIED GAMING STATISTICS GRID -->
        <section class="profile-section" aria-label="Competitive Statistics">
          <div class="section-title-bar">
            <div>
              <h2 class="profile-section-heading">TELEMETRY & GAMING STATISTICS</h2>
              <p class="profile-section-sub">Verified metrics calculated from active race telemetry and IndexedDB sessions.</p>
            </div>
            <span class="stat-source-badge font-mono">
              <span class="pulse-dot-green"></span>
              ${this.sessions.length} Recorded Races
            </span>
          </div>

          <div class="profile-stats-grid">
            <!-- Stat 1: Total Races -->
            <div class="profile-stat-card">
              <div class="stat-card-header">
                <span class="stat-label">RACES COMPLETED</span>
                <span class="stat-icon">🏁</span>
              </div>
              <div class="stat-number font-mono">${stats.totalRaces}</div>
              <div class="stat-footer text-muted">${stats.totalRaces === 0 ? 'No races yet' : `${stats.totalWins} victories earned`}</div>
            </div>

            <!-- Stat 2: Total Wins -->
            <div class="profile-stat-card">
              <div class="stat-card-header">
                <span class="stat-label">TOTAL VICTORIES</span>
                <span class="stat-icon">🏆</span>
              </div>
              <div class="stat-number font-mono highlight-gold">${stats.totalWins}</div>
              <div class="stat-footer text-muted">Win rate: <strong class="highlight-cyan font-mono">${stats.winRate}%</strong></div>
            </div>

            <!-- Stat 3: Best WPM -->
            <div class="profile-stat-card">
              <div class="stat-card-header">
                <span class="stat-label">RECORD SPEED</span>
                <span class="stat-icon">⚡</span>
              </div>
              <div class="stat-number font-mono highlight-cyan">${stats.bestWpm} <span class="stat-unit">WPM</span></div>
              <div class="stat-footer text-muted">All-time peak acceleration</div>
            </div>

            <!-- Stat 4: Average WPM -->
            <div class="profile-stat-card">
              <div class="stat-card-header">
                <span class="stat-label">AVERAGE SPEED</span>
                <span class="stat-icon">🏎️</span>
              </div>
              <div class="stat-number font-mono">${stats.averageWpm} <span class="stat-unit">WPM</span></div>
              <div class="stat-footer text-muted">Career pacing benchmark</div>
            </div>

            <!-- Stat 5: Accuracy -->
            <div class="profile-stat-card">
              <div class="stat-card-header">
                <span class="stat-label">TYPING ACCURACY</span>
                <span class="stat-icon">🎯</span>
              </div>
              <div class="stat-number font-mono highlight-green">${stats.accuracy}%</div>
              <div class="stat-footer text-muted">Total errors: <strong class="text-negative font-mono">${stats.totalErrors}</strong></div>
            </div>

            <!-- Stat 6: Active Streak -->
            <div class="profile-stat-card">
              <div class="stat-card-header">
                <span class="stat-label">DAILY STREAK</span>
                <span class="stat-icon">🔥</span>
              </div>
              <div class="stat-number font-mono text-orange">${stats.currentStreak} <span class="stat-unit">DAYS</span></div>
              <div class="stat-footer text-muted">Best streak: <strong class="font-mono">${stats.longestStreak} days</strong></div>
            </div>

            <!-- Stat 7: Total Play Time -->
            <div class="profile-stat-card">
              <div class="stat-card-header">
                <span class="stat-label">CIRCUIT TIME</span>
                <span class="stat-icon">⏱️</span>
              </div>
              <div class="stat-number font-mono">${stats.playtimeFormatted}</div>
              <div class="stat-footer text-muted">Total touch-typing duration</div>
            </div>

            <!-- Stat 8: Recent Trend -->
            <div class="profile-stat-card">
              <div class="stat-card-header">
                <span class="stat-label">RECENT TREND</span>
                <span class="stat-icon">📈</span>
              </div>
              <div class="stat-number font-mono ${stats.trendPositive ? 'highlight-green' : 'text-muted'}">
                ${stats.trendLabel}
              </div>
              <div class="stat-footer text-muted">${stats.trendDescription}</div>
            </div>
          </div>
        </section>

        <!-- 3. SPLIT SECTION: RACING IDENTITY & ACHIEVEMENTS -->
        <div class="profile-two-col-layout">
          <!-- A. RACING IDENTITY -->
          <section class="profile-section" aria-label="Racing Identity">
            <h2 class="profile-section-heading">RACING IDENTITY & GARAGE</h2>
            <div class="racing-identity-card card-dark">
              <div class="ri-car-header">
                <div>
                  <span class="ri-car-tier font-mono">${vehicleInfo.tier}</span>
                  <h3 class="ri-car-name">${vehicleInfo.name}</h3>
                  <p class="ri-car-desc">${vehicleInfo.desc}</p>
                </div>
                <div class="ri-swatches">
                  <div class="ri-swatch-item" title="Livery Paint Color">
                    <span class="swatch-circle" style="background-color: ${vehicleInfo.paint};"></span>
                    <small>Paint</small>
                  </div>
                  <div class="ri-swatch-item" title="Neon Underglow Color">
                    <span class="swatch-circle" style="background-color: ${vehicleInfo.underglow}; box-shadow: 0 0 8px ${vehicleInfo.underglow};"></span>
                    <small>Glow</small>
                  </div>
                </div>
              </div>

              <div class="ri-specs-grid">
                <div class="ri-spec">
                  <span class="ri-spec-label">TOP SPEED</span>
                  <div class="ri-progress-bg"><div class="ri-progress-bar" style="width: ${vehicleInfo.topSpeedPct}%;"></div></div>
                </div>
                <div class="ri-spec">
                  <span class="ri-spec-label">ACCELERATION</span>
                  <div class="ri-progress-bg"><div class="ri-progress-bar" style="width: ${vehicleInfo.accelPct}%;"></div></div>
                </div>
                <div class="ri-spec">
                  <span class="ri-spec-label">HANDLING</span>
                  <div class="ri-progress-bg"><div class="ri-progress-bar" style="width: ${vehicleInfo.handlingPct}%;"></div></div>
                </div>
              </div>

              <div class="ri-footer">
                <div class="ri-stat-item">
                  <span class="ri-f-label">UNLOCKED VEHICLES</span>
                  <strong class="font-mono">${vehicleInfo.unlockedCount} / ${vehicleInfo.totalCount} Supercars</strong>
                </div>
                <div class="ri-stat-item">
                  <span class="ri-f-label">PREFERRED CIRCUIT</span>
                  <strong>${stats.favoriteCircuit}</strong>
                </div>
                <button class="btn btn-outline btn-small" data-nav="garage">
                  Open Garage →
                </button>
              </div>
            </div>
          </section>

          <!-- B. CAREER ACHIEVEMENTS -->
          <section class="profile-section" aria-label="Career Milestones">
            <h2 class="profile-section-heading">CAREER MILESTONES & BADGES</h2>
            <div class="achievements-list card-dark">
              ${achievements.map(ach => `
                <div class="achievement-row ${ach.unlocked ? 'unlocked' : 'locked'}">
                  <div class="ach-icon-box ${ach.unlocked ? 'ach-glow' : ''}">
                    ${ach.icon}
                  </div>
                  <div class="ach-info">
                    <div class="ach-title-row">
                      <h4 class="ach-title">${ach.title}</h4>
                      <span class="ach-badge ${ach.unlocked ? 'badge-unlocked' : 'badge-locked'} font-mono">
                        ${ach.unlocked ? 'UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                    <p class="ach-desc">${ach.desc}</p>
                    <div class="ach-progress-wrap">
                      <div class="ach-progress-bar" style="width: ${ach.percent}%;"></div>
                    </div>
                    <span class="ach-progress-text font-mono">${ach.progressText}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>
        </div>

        <!-- 4. RECENT RACE ACTIVITY -->
        <section class="profile-section" aria-label="Recent Race Activity">
          <div class="section-title-bar">
            <div>
              <h2 class="profile-section-heading">RECENT RACE SESSIONS</h2>
              <p class="profile-section-sub">Detailed logs from your most recent high-speed typing competitions.</p>
            </div>
            ${this.sessions.length > 0 ? `
              <button class="btn btn-outline btn-small" data-nav="analytics">
                View Full Analytics →
              </button>
            ` : ''}
          </div>

          ${this.renderRecentSessions(this.sessions)}
        </section>

        <!-- 5. ACCOUNT SETTINGS & PRIVACY CONTROLS -->
        <section class="profile-section" aria-label="Account Settings and Privacy">
          <h2 class="profile-section-heading">ACCOUNT PREFERENCES & PRIVACY</h2>
          <div class="profile-settings-card card-dark">
            <div class="settings-row">
              <div class="setting-meta">
                <strong>Public Esports Profile</strong>
                <span>Allow your callsign, WPM, and league rank to be visible on public leaderboards</span>
              </div>
              <label class="switch-control">
                <input type="checkbox" id="pref-toggle-public" ${this.profile?.visibility !== 'private' ? 'checked' : ''} />
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="settings-row">
              <div class="setting-meta">
                <strong>Display Race Telemetry</strong>
                <span>Share your live WPM speedometer and accuracy data during multiplayer races</span>
              </div>
              <label class="switch-control">
                <input type="checkbox" id="pref-toggle-stats" ${this.profile?.showStats !== false ? 'checked' : ''} />
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="settings-row">
              <div class="setting-meta">
                <strong>Show Session History</strong>
                <span>Allow viewing of previous race timestamps and per-circuit results</span>
              </div>
              <label class="switch-control">
                <input type="checkbox" id="pref-toggle-history" ${this.profile?.showHistory !== false ? 'checked' : ''} />
                <span class="switch-slider"></span>
              </label>
            </div>

            <div class="danger-zone-divider"></div>

            <div class="danger-zone">
              <div class="danger-info">
                <strong class="text-negative">Danger Zone: Reset Career Telemetry</strong>
                <span>Clear all race history, WPM records, streaks, and reset statistics. This cannot be undone.</span>
              </div>
              <button class="btn btn-outline btn-danger" id="btn-trigger-reset-stats">
                Reset Career Data
              </button>
            </div>
          </div>
        </section>

        <!-- 6. EDIT PROFILE MODAL / DRAWER -->
        <div class="profile-modal-overlay ${this.isEditing ? 'active' : ''}" id="edit-profile-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="profile-modal-dialog">
            <div class="modal-header">
              <h3 id="modal-title" class="modal-title">EDIT PILOT PROFILE</h3>
              <button class="modal-close-btn" id="btn-modal-close" aria-label="Close Edit Profile">×</button>
            </div>

            <form id="edit-profile-form" class="modal-form" novalidate>
              <!-- Avatar Picker Section -->
              <div class="form-group avatar-custom-picker">
                <label class="form-label">PILOT AVATAR</label>
                <div class="avatar-edit-preview-row">
                  <div class="avatar-preview-box">
                    ${renderAvatarMarkup(this.pendingAvatar || this.profile?.avatar, 'Preview', 'avatar-preview-img')}
                  </div>
                  <div class="avatar-upload-actions">
                    <label class="btn btn-outline btn-small avatar-upload-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      Upload Custom Image
                      <input type="file" id="avatar-file-input" accept="image/png, image/jpeg, image/webp" style="display:none;" />
                    </label>
                    <button type="button" class="btn btn-text btn-small" id="btn-reset-default-avatar">
                      ↺ Reset to Default
                    </button>
                    <small class="text-muted text-helper">PNG, JPG, or WEBP (Scaled & cropped to 256x256 offline)</small>
                  </div>
                </div>

                <!-- Built-in Avatars Palette -->
                <div class="builtin-avatars-label">Or choose an official cyber avatar:</div>
                <div class="builtin-avatars-grid">
                  ${BUILTIN_AVATARS.map(item => `
                    <button type="button" 
                            class="builtin-avatar-option ${(this.pendingAvatar || this.profile?.avatar) === item.url ? 'selected' : ''}" 
                            data-avatar-url="${item.url}" 
                            title="${item.label}">
                      <img src="${item.url}" alt="${item.label}" class="builtin-avatar-thumb" />
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Display Name -->
              <div class="form-group">
                <label for="edit-display-name" class="form-label">
                  DISPLAY NAME <span class="text-required">*</span>
                </label>
                <input 
                  type="text" 
                  id="edit-display-name" 
                  class="custom-input ${this.editErrors.username ? 'input-error' : ''}" 
                  value="${this.escapeHtml(this.profile?.username || '')}" 
                  maxlength="24" 
                  placeholder="Enter pilot name..." 
                  required 
                />
                <span class="field-error-msg" id="error-username">${this.editErrors.username || ''}</span>
              </div>

              <!-- Callsign / Tag -->
              <div class="form-group">
                <label for="edit-callsign" class="form-label">
                  PILOT CALLSIGN / TAG <span class="text-required">*</span>
                </label>
                <input 
                  type="text" 
                  id="edit-callsign" 
                  class="custom-input font-mono ${this.editErrors.callsign ? 'input-error' : ''}" 
                  value="${this.escapeHtml(this.profile?.callsign || '')}" 
                  maxlength="16" 
                  placeholder="e.g. KARTIK-01" 
                  required 
                />
                <span class="field-error-msg" id="error-callsign">${this.editErrors.callsign || ''}</span>
                <small class="text-muted">Unique competitive esports handle (Letters, numbers, and hyphens).</small>
              </div>

              <!-- Short Bio -->
              <div class="form-group">
                <label for="edit-bio" class="form-label">SHORT BIOGRAPHY</label>
                <textarea 
                  id="edit-bio" 
                  class="custom-textarea ${this.editErrors.bio ? 'input-error' : ''}" 
                  maxlength="160" 
                  rows="3" 
                  placeholder="Describe your typing prowess and racing mindset..."
                >${this.escapeHtml(this.profile?.bio || '')}</textarea>
                <div class="textarea-counter">
                  <span class="field-error-msg" id="error-bio">${this.editErrors.bio || ''}</span>
                  <span class="char-count font-mono" id="bio-char-count">${(this.profile?.bio || '').length}/160</span>
                </div>
              </div>

              <!-- Region / Country -->
              <div class="form-group">
                <label for="edit-country" class="form-label">COUNTRY / REGION</label>
                <select id="edit-country" class="custom-select">
                  <option value="IND" ${this.profile?.country === 'IND' ? 'selected' : ''}>🇮🇳 IND — India</option>
                  <option value="USA" ${this.profile?.country === 'USA' ? 'selected' : ''}>🇺🇸 USA — United States</option>
                  <option value="JPN" ${this.profile?.country === 'JPN' ? 'selected' : ''}>🇯🇵 JPN — Japan</option>
                  <option value="SWE" ${this.profile?.country === 'SWE' ? 'selected' : ''}>🇸🇪 SWE — Sweden</option>
                  <option value="DEU" ${this.profile?.country === 'DEU' ? 'selected' : ''}>🇩🇪 DEU — Germany</option>
                  <option value="GBR" ${this.profile?.country === 'GBR' ? 'selected' : ''}>🇬🇧 GBR — United Kingdom</option>
                  <option value="CAN" ${this.profile?.country === 'CAN' ? 'selected' : ''}>🇨🇦 CAN — Canada</option>
                  <option value="FRA" ${this.profile?.country === 'FRA' ? 'selected' : ''}>🇫🇷 FRA — France</option>
                  <option value="KOR" ${this.profile?.country === 'KOR' ? 'selected' : ''}>🇰🇷 KOR — South Korea</option>
                  <option value="GLOBAL" ${this.profile?.country === 'GLOBAL' ? 'selected' : ''}>🌐 GLOBAL — International</option>
                </select>
              </div>

              <!-- Profile Visibility -->
              <div class="form-group">
                <label class="form-label">PROFILE VISIBILITY</label>
                <div class="radio-group-cards">
                  <label class="radio-card ${this.profile?.visibility !== 'private' ? 'selected' : ''}">
                    <input type="radio" name="profile-visibility" value="public" ${this.profile?.visibility !== 'private' ? 'checked' : ''} />
                    <div class="rc-content">
                      <strong>🌐 Public Profile</strong>
                      <span>Visible on leaderboards and race lobbies</span>
                    </div>
                  </label>
                  <label class="radio-card ${this.profile?.visibility === 'private' ? 'selected' : ''}">
                    <input type="radio" name="profile-visibility" value="private" ${this.profile?.visibility === 'private' ? 'checked' : ''} />
                    <div class="rc-content">
                      <strong>🔒 Private Profile</strong>
                      <span>Hidden from public telemetry rankings</span>
                    </div>
                  </label>
                </div>
              </div>

              <div class="modal-form-actions">
                <button type="button" class="btn btn-secondary" id="btn-modal-cancel">Cancel</button>
                <button type="submit" class="btn btn-primary glow-primary" id="btn-modal-save">
                  💾 Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 7. RESET CONFIRMATION DIALOG -->
        <div class="profile-modal-overlay" id="reset-confirm-modal" role="dialog" aria-modal="true">
          <div class="profile-modal-dialog modal-small">
            <div class="modal-header">
              <h3 class="modal-title text-negative">⚠️ RESET CAREER TELEMETRY</h3>
              <button class="modal-close-btn" id="btn-reset-modal-close">×</button>
            </div>
            <div class="modal-body-pad">
              <p>Are you sure you want to erase all race history, high scores, accuracy statistics, and streaks?</p>
              <p class="text-muted">Your unlocked garage supercars and preferences will remain untouched.</p>
              <div class="form-group">
                <label class="form-label">Type <strong>RESET</strong> to confirm:</label>
                <input type="text" id="input-confirm-reset" class="custom-input font-mono" placeholder="RESET" />
              </div>
            </div>
            <div class="modal-form-actions">
              <button type="button" class="btn btn-secondary" id="btn-reset-cancel">Cancel</button>
              <button type="button" class="btn btn-danger" id="btn-confirm-reset" disabled>
                Confirm Erase
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  calculateVerifiedStats(profile, sessions) {
    const sessionCount = sessions.length;
    const sessionWins = sessions.filter(s => s.won).length;

    const totalRaces = Math.max(profile?.racesPlayed || 0, sessionCount);
    const totalWins = Math.max(profile?.racesWon || 0, sessionWins);
    const winRate = totalRaces > 0 ? Math.round((totalWins / totalRaces) * 100) : 0;

    let bestWpm = profile?.bestWpm || 0;
    if (sessionCount > 0) {
      bestWpm = Math.max(bestWpm, ...sessions.map(s => s.wpm || 0));
    }

    let averageWpm = profile?.averageWpm || 0;
    let accuracy = profile?.accuracy || 96.0;
    let totalErrors = 0;

    if (sessionCount > 0) {
      const sumWpm = sessions.reduce((acc, s) => acc + (s.wpm || 0), 0);
      averageWpm = Math.round(sumWpm / sessionCount);

      const sumAcc = sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0);
      accuracy = Number((sumAcc / sessionCount).toFixed(1));

      totalErrors = sessions.reduce((acc, s) => acc + (s.errorCount || 0), 0);
    }

    const currentStreak = profile?.currentStreak || 0;
    const longestStreak = Math.max(profile?.longestStreak || 0, currentStreak);

    // Total play time formatting
    const totalSecs = profile?.totalPracticeTimeSec || (sessions.reduce((acc, s) => acc + (s.duration || 30), 0));
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const playtimeFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Calculate recent trend (last 3 races vs previous)
    let trendLabel = 'Stable';
    let trendPositive = true;
    let trendDescription = 'Consistent baseline speed';

    if (sessions.length >= 3) {
      const recent3 = sessions.slice(0, 3);
      const recentAvg = recent3.reduce((acc, s) => acc + (s.wpm || 0), 0) / 3;
      const diff = Math.round(recentAvg - averageWpm);
      if (diff > 0) {
        trendLabel = `▲ +${diff} WPM`;
        trendPositive = true;
        trendDescription = 'Accelerating speed in recent circuits';
      } else if (diff < 0) {
        trendLabel = `▼ ${diff} WPM`;
        trendPositive = false;
        trendDescription = 'Focus on pacing and rhythm';
      } else {
        trendLabel = '═ Steady';
        trendPositive = true;
        trendDescription = 'Consistent baseline speed';
      }
    } else if (sessions.length === 0) {
      trendLabel = '--';
      trendPositive = true;
      trendDescription = 'Awaiting race session telemetry';
    }

    // Favorite Circuit Calculation
    let favoriteCircuit = 'Neo-Tokyo Expressway';
    if (sessions.length > 0) {
      const circuitCounts = {};
      sessions.forEach(s => {
        const mode = s.mode || 'AI Racing';
        circuitCounts[mode] = (circuitCounts[mode] || 0) + 1;
      });
      let maxCount = 0;
      for (const [mode, cnt] of Object.entries(circuitCounts)) {
        if (cnt > maxCount) {
          maxCount = cnt;
          favoriteCircuit = `${mode} Circuit`;
        }
      }
    }

    return {
      totalRaces,
      totalWins,
      winRate,
      bestWpm,
      averageWpm,
      accuracy,
      totalErrors,
      currentStreak,
      longestStreak,
      playtimeFormatted,
      trendLabel,
      trendPositive,
      trendDescription,
      favoriteCircuit
    };
  }

  calculateAchievements(stats, profile, sessions) {
    const list = [
      {
        id: 'ach-speed-demon',
        title: 'Speed Demon',
        desc: 'Reach 80+ WPM in any competitive race',
        icon: '⚡',
        unlocked: stats.bestWpm >= 80,
        percent: Math.min(100, Math.round((stats.bestWpm / 80) * 100)),
        progressText: `${Math.min(stats.bestWpm, 80)} / 80 WPM`
      },
      {
        id: 'ach-supersonic',
        title: 'Supersonic Pilot',
        desc: 'Break the sound barrier with 100+ WPM',
        icon: '🚀',
        unlocked: stats.bestWpm >= 100,
        percent: Math.min(100, Math.round((stats.bestWpm / 100) * 100)),
        progressText: `${Math.min(stats.bestWpm, 100)} / 100 WPM`
      },
      {
        id: 'ach-precision-pilot',
        title: 'Precision Master',
        desc: 'Maintain ≥ 96% overall typing accuracy',
        icon: '🎯',
        unlocked: stats.accuracy >= 96.0,
        percent: Math.min(100, Math.round((stats.accuracy / 96.0) * 100)),
        progressText: `${stats.accuracy}% / 96.0% Target`
      },
      {
        id: 'ach-flawless',
        title: 'Flawless Lap',
        desc: 'Finish a race session with 100% accuracy',
        icon: '👑',
        unlocked: sessions.some(s => s.accuracy >= 100),
        percent: sessions.some(s => s.accuracy >= 100) ? 100 : 0,
        progressText: sessions.some(s => s.accuracy >= 100) ? '100% Achieved' : 'Pending 100% Race'
      },
      {
        id: 'ach-podium',
        title: 'Podium Dominator',
        desc: 'Win 10 or more competitive races',
        icon: '🏆',
        unlocked: stats.totalWins >= 10,
        percent: Math.min(100, Math.round((stats.totalWins / 10) * 100)),
        progressText: `${Math.min(stats.totalWins, 10)} / 10 Wins`
      },
      {
        id: 'ach-veteran',
        title: 'Track Veteran',
        desc: 'Complete 25 total race circuits',
        icon: '🏁',
        unlocked: stats.totalRaces >= 25,
        percent: Math.min(100, Math.round((stats.totalRaces / 25) * 100)),
        progressText: `${Math.min(stats.totalRaces, 25)} / 25 Races`
      },
      {
        id: 'ach-streak',
        title: 'Streak Sentinel',
        desc: 'Maintain a 7-day daily practice streak',
        icon: '🔥',
        unlocked: stats.currentStreak >= 7,
        percent: Math.min(100, Math.round((stats.currentStreak / 7) * 100)),
        progressText: `${Math.min(stats.currentStreak, 7)} / 7 Days`
      }
    ];

    return list;
  }

  getEquippedVehicleInfo(garage) {
    const activeId = garage?.activeVehicleId || 'talon';
    const catalogItem = VEHICLE_CATALOG[activeId] || VEHICLE_CATALOG.talon;

    return {
      id: activeId,
      name: catalogItem?.name || 'TALON GT-R',
      tier: 'CLASS-A INTERCEPTOR',
      desc: 'High-downforce carbon chassis tuned for precision cornering and rapid acceleration.',
      topSpeedPct: Math.round(((catalogItem?.topSpeed || 135) / 160) * 100),
      accelPct: Math.round(((catalogItem?.acceleration || 88) / 100) * 100),
      handlingPct: Math.round(((catalogItem?.handling || 85) / 100) * 100),
      paint: garage?.paintColor || '#00e5ff',
      underglow: garage?.underglowColor || '#a855f7',
      unlockedCount: garage?.unlockedVehicles?.length || 2,
      totalCount: Object.keys(VEHICLE_CATALOG).length
    };
  }

  renderRecentSessions(sessions) {
    if (!sessions || sessions.length === 0) {
      return `
        <div class="empty-state-box card-dark">
          <div class="empty-icon">🏎️</div>
          <h3 class="empty-title">NO RACE TELEMETRY RECORDED YET</h3>
          <p class="empty-desc">Take the steering wheel in AI Racing or Solo Practice to log your high-speed session telemetry.</p>
          <button class="btn btn-primary glow-primary" data-nav="race-modes">
            Launch First Race →
          </button>
        </div>
      `;
    }

    const recentList = sessions.slice(0, 8);

    return `
      <div class="table-responsive card-dark">
        <table class="profile-sessions-table">
          <thead>
            <tr>
              <th>DATE & TIME</th>
              <th>CIRCUIT / MODE</th>
              <th>RESULT</th>
              <th class="text-right">SPEED</th>
              <th class="text-right">ACCURACY</th>
              <th class="text-right">ERRORS</th>
              <th class="text-right">DURATION</th>
            </tr>
          </thead>
          <tbody>
            ${recentList.map(s => `
              <tr>
                <td class="font-mono text-muted">${this.formatTimestamp(s.timestamp)}</td>
                <td>
                  <span class="mode-tag">${this.escapeHtml(s.mode || 'AI Racing')}</span>
                  <small class="diff-tag">${this.escapeHtml(s.difficulty || 'AMATEUR')}</small>
                </td>
                <td>
                  ${s.won 
                    ? `<span class="result-badge badge-win">🥇 1st Place</span>` 
                    : `<span class="result-badge badge-finish">🏁 Finished</span>`
                  }
                </td>
                <td class="text-right font-mono highlight-cyan">
                  <strong>${s.wpm || 0}</strong> <small>WPM</small>
                </td>
                <td class="text-right font-mono highlight-green">
                  ${(s.accuracy || 100).toFixed(1)}%
                </td>
                <td class="text-right font-mono text-muted">
                  ${s.errorCount || 0}
                </td>
                <td class="text-right font-mono text-muted">
                  ${s.duration || 30}s
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  bindEvents() {
    // 1. Open Edit Profile Modal
    const openBtn = document.getElementById('btn-open-edit-profile');
    const avatarQuickEdit = document.getElementById('btn-avatar-quick-edit');
    openBtn?.addEventListener('click', () => this.openEditModal());
    avatarQuickEdit?.addEventListener('click', () => this.openEditModal());

    // 2. Close Modal Buttons
    const closeBtn = document.getElementById('btn-modal-close');
    const cancelBtn = document.getElementById('btn-modal-cancel');
    closeBtn?.addEventListener('click', () => this.closeEditModal());
    cancelBtn?.addEventListener('click', () => this.closeEditModal());

    // Close on backdrop click
    const editModal = document.getElementById('edit-profile-modal');
    editModal?.addEventListener('click', (e) => {
      if (e.target === editModal) {
        this.closeEditModal();
      }
    });

    // 3. Edit Form Submission
    const editForm = document.getElementById('edit-profile-form');
    editForm?.addEventListener('submit', (e) => this.handleSaveProfile(e));

    // 4. Character counter for Bio
    const bioInput = document.getElementById('edit-bio');
    const charCount = document.getElementById('bio-char-count');
    bioInput?.addEventListener('input', () => {
      if (charCount) {
        charCount.textContent = `${bioInput.value.length}/160`;
      }
    });

    // 5. Preset Avatar Pickers
    const builtinBtns = document.querySelectorAll('.builtin-avatar-option');
    builtinBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        soundEffects.playUiClick();
        const url = btn.getAttribute('data-avatar-url');
        this.pendingAvatar = url;
        builtinBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.updatePreviewAvatar(url);
      });
    });

    // 6. Custom Image Upload with Safe Canvas Compression
    const fileInput = document.getElementById('avatar-file-input');
    fileInput?.addEventListener('change', (e) => this.handleAvatarFileUpload(e));

    // 7. Reset to Default Avatar
    const resetAvatarBtn = document.getElementById('btn-reset-default-avatar');
    resetAvatarBtn?.addEventListener('click', () => {
      soundEffects.playUiClick();
      this.pendingAvatar = '/images/ui/avatar-kartik.png';
      builtinBtns.forEach(b => b.classList.remove('selected'));
      const defaultBtn = document.querySelector('[data-avatar-url="/images/ui/avatar-kartik.png"]');
      if (defaultBtn) defaultBtn.classList.add('selected');
      this.updatePreviewAvatar(this.pendingAvatar);
    });

    // 8. Export Career JSON
    const exportBtn = document.getElementById('btn-export-career-json');
    exportBtn?.addEventListener('click', async () => {
      soundEffects.playUiClick();
      await this.exportCareerData();
    });

    // 9. Privacy Toggles (Live Persistence)
    const togglePublic = document.getElementById('pref-toggle-public');
    togglePublic?.addEventListener('change', async () => {
      const isPublic = togglePublic.checked;
      this.profile.visibility = isPublic ? 'public' : 'private';
      await storage.saveProfile(this.profile);
      soundEffects.playUiClick();
      this.showToast(isPublic ? '🌐 Profile is now public' : '🔒 Profile set to private');
      // Update badge in hero
      const visTag = document.querySelector('.visibility-tag');
      if (visTag) {
        visTag.className = `meta-tag visibility-tag ${isPublic ? 'tag-public' : 'tag-private'}`;
        visTag.textContent = isPublic ? '🌐 Public Pilot' : '🔒 Private Profile';
      }
    });

    const toggleStats = document.getElementById('pref-toggle-stats');
    toggleStats?.addEventListener('change', async () => {
      this.profile.showStats = toggleStats.checked;
      await storage.saveProfile(this.profile);
      soundEffects.playUiClick();
      this.showToast('Telemetry preference updated');
    });

    const toggleHistory = document.getElementById('pref-toggle-history');
    toggleHistory?.addEventListener('change', async () => {
      this.profile.showHistory = toggleHistory.checked;
      await storage.saveProfile(this.profile);
      soundEffects.playUiClick();
      this.showToast('History preference updated');
    });

    // 10. Reset Career Telemetry Dialog
    const triggerResetBtn = document.getElementById('btn-trigger-reset-stats');
    const resetModal = document.getElementById('reset-confirm-modal');
    const resetCloseBtn = document.getElementById('btn-reset-modal-close');
    const resetCancelBtn = document.getElementById('btn-reset-cancel');
    const confirmInput = document.getElementById('input-confirm-reset');
    const confirmResetBtn = document.getElementById('btn-confirm-reset');

    triggerResetBtn?.addEventListener('click', () => {
      soundEffects.playUiClick();
      if (resetModal) resetModal.classList.add('active');
      if (confirmInput) {
        confirmInput.value = '';
        confirmInput.focus();
      }
      if (confirmResetBtn) confirmResetBtn.disabled = true;
    });

    const closeResetModal = () => {
      if (resetModal) resetModal.classList.remove('active');
    };

    resetCloseBtn?.addEventListener('click', closeResetModal);
    resetCancelBtn?.addEventListener('click', closeResetModal);

    confirmInput?.addEventListener('input', () => {
      if (confirmResetBtn) {
        confirmResetBtn.disabled = confirmInput.value.trim().toUpperCase() !== 'RESET';
      }
    });

    confirmResetBtn?.addEventListener('click', async () => {
      if (confirmInput.value.trim().toUpperCase() === 'RESET') {
        confirmResetBtn.disabled = true;
        confirmResetBtn.textContent = 'Erasing...';
        await storage.resetCareerTelemetry();
        soundEffects.playVictoryFanfare();
        closeResetModal();
        this.showToast('Career telemetry reset successfully');
        await this.render();
        this.app.updateHeader();
      }
    });

    // 11. Radio Cards for Visibility in Modal
    const radioCards = document.querySelectorAll('.radio-card');
    radioCards.forEach(card => {
      card.addEventListener('click', () => {
        radioCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });
  }

  openEditModal() {
    soundEffects.playUiClick();
    this.isEditing = true;
    this.pendingAvatar = this.profile?.avatar || '/images/ui/avatar-kartik.png';
    this.editErrors = {};

    const modal = document.getElementById('edit-profile-modal');
    if (modal) {
      modal.classList.add('active');
      const nameInput = document.getElementById('edit-display-name');
      nameInput?.focus();
    }
  }

  closeEditModal() {
    soundEffects.playUiClick();
    this.isEditing = false;
    this.pendingAvatar = null;
    this.editErrors = {};

    const modal = document.getElementById('edit-profile-modal');
    if (modal) modal.classList.remove('active');
  }

  updatePreviewAvatar(url) {
    const previewContainer = document.querySelector('.avatar-preview-box');
    if (previewContainer) {
      previewContainer.innerHTML = renderAvatarMarkup(url, 'Preview', 'avatar-preview-img');
    }
  }

  handleAvatarFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    // Limit upload file size to 8MB max before processing
    if (file.size > 8 * 1024 * 1024) {
      alert('Selected image exceeds 8MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const img = new Image();
      img.onload = () => {
        // Safe offscreen canvas downscaling to 256x256 WebP to avoid IndexedDB / storage bloating
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Draw with cover crop
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 256, 256);

        // Convert to compressed WebP data URL (or PNG if webp unsupported)
        let compressedDataUrl = canvas.toDataURL('image/webp', 0.88);
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/png');
        }

        this.pendingAvatar = compressedDataUrl;
        this.updatePreviewAvatar(compressedDataUrl);

        // Clear selection on preset buttons
        document.querySelectorAll('.builtin-avatar-option').forEach(b => b.classList.remove('selected'));
        soundEffects.playUiClick();
      };
      img.onerror = () => {
        alert('Could not parse image. Please try a different file.');
      };
      img.src = loadEvent.target.result;
    };
    reader.readAsDataURL(file);
  }

  async handleSaveProfile(e) {
    e.preventDefault();
    const saveBtn = document.getElementById('btn-modal-save');

    // Retrieve input values
    const nameInput = document.getElementById('edit-display-name');
    const callsignInput = document.getElementById('edit-callsign');
    const bioInput = document.getElementById('edit-bio');
    const countryInput = document.getElementById('edit-country');
    const visibilityRadio = document.querySelector('input[name="profile-visibility"]:checked');

    const username = (nameInput?.value || '').trim();
    const callsign = (callsignInput?.value || '').trim().toUpperCase();
    const bio = (bioInput?.value || '').trim();
    const country = countryInput?.value || 'IND';
    const visibility = visibilityRadio?.value || 'public';

    // Validation
    this.editErrors = {};

    if (!username || username.length < 2) {
      this.editErrors.username = 'Display name must be at least 2 characters.';
    } else if (username.length > 24) {
      this.editErrors.username = 'Display name cannot exceed 24 characters.';
    }

    if (!callsign || callsign.length < 3) {
      this.editErrors.callsign = 'Callsign must be at least 3 characters.';
    } else if (callsign.length > 16) {
      this.editErrors.callsign = 'Callsign cannot exceed 16 characters.';
    } else if (!/^[A-Z0-9_\-]+$/.test(callsign)) {
      this.editErrors.callsign = 'Callsign may only contain letters, numbers, and hyphens.';
    }

    if (bio.length > 160) {
      this.editErrors.bio = 'Bio cannot exceed 160 characters.';
    }

    // Render errors if invalid
    const errUsername = document.getElementById('error-username');
    const errCallsign = document.getElementById('error-callsign');
    const errBio = document.getElementById('error-bio');

    if (errUsername) errUsername.textContent = this.editErrors.username || '';
    if (errCallsign) errCallsign.textContent = this.editErrors.callsign || '';
    if (errBio) errBio.textContent = this.editErrors.bio || '';

    if (nameInput) nameInput.classList.toggle('input-error', Boolean(this.editErrors.username));
    if (callsignInput) callsignInput.classList.toggle('input-error', Boolean(this.editErrors.callsign));
    if (bioInput) bioInput.classList.toggle('input-error', Boolean(this.editErrors.bio));

    if (Object.keys(this.editErrors).length > 0) {
      soundEffects.playErrorBuzzer?.() || soundEffects.playUiClick();
      return;
    }

    // Disable button during persistence
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
    }

    try {
      // Update profile object
      this.profile = {
        ...this.profile,
        username,
        callsign,
        bio,
        country,
        visibility,
        avatar: this.pendingAvatar || this.profile?.avatar || '/images/ui/avatar-kartik.png'
      };

      await storage.saveProfile(this.profile);
      soundEffects.playVictoryFanfare();

      // Update persistent shell header user chip
      await this.app.updateHeader();

      this.closeEditModal();
      this.showToast('✅ Profile updated and persisted successfully');

      // Re-render view with updated values
      await this.render();
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Failed to save changes. Please try again.');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Save Changes';
      }
    }
  }

  async exportCareerData() {
    try {
      const fullJson = await storage.exportFullData();
      const blob = new Blob([fullJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KEYRUSH_${(this.profile?.username || 'pilot').toLowerCase()}_career_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast('Career data exported successfully');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export career telemetry data.');
    }
  }

  showToast(message) {
    const existing = document.getElementById('profile-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'profile-toast';
    toast.className = 'profile-toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('visible');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  formatDate(dateString) {
    if (!dateString) return 'Jan 2025';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  }

  formatTimestamp(ts) {
    if (!ts) return '--';
    try {
      const d = new Date(ts);
      const now = new Date();
      const diffHours = Math.floor((now - d) / (1000 * 60 * 60));
      if (diffHours < 24) {
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '--';
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  dispose() {
    const toast = document.getElementById('profile-toast');
    if (toast) toast.remove();
  }
}
