/**
 * KEYRUSH — Missions & Tournament Circuit View
 * Studio-grade, editorial progression layout:
 * - Uncluttered canvas typography with whitespace-driven visual hierarchy
 * - Compact streak telemetry and 7-day habit timeline
 * - Clean directive list with subtle row dividers and genuine action buttons
 * - High-impact esports tournament event card
 */

import { storage } from '../db/storage.js';
import { soundEffects } from '../audio/soundEffects.js';
import confetti from 'canvas-confetti';

export class MissionsView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async render() {
    const profile = (await storage.getProfile()) || {};
    const missions = (await storage.getMissions()) || {};

    const streak = profile?.currentStreak || 4;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const calendarDays = missions?.calendarDays || [true, true, true, true, false, false, false];
    const availableCount = (missions?.list || []).filter((m) => !m.claimed).length;

    this.container.innerHTML = `
      <div class="dash-page-container missions-page-container">
        <!-- 1. EDITORIAL SECTION HEADER (NO BULKY WRAPPER) -->
        <header class="missions-page-header">
          <div class="missions-header-main">
            <h1 class="missions-page-title">Missions & Events</h1>
            <p class="missions-page-desc">
              Daily touch-typing objectives, habit streak milestones, and competitive championship circuits.
            </p>
          </div>

          <!-- Compact Inline Telemetry Status -->
          <div class="missions-header-stats">
            <div class="inline-stat-chip">
              <span class="chip-icon">🔥</span>
              <div class="chip-text">
                <span class="chip-label">Daily Streak</span>
                <strong class="chip-val font-mono">${streak} Days</strong>
              </div>
            </div>

            <div class="inline-stat-chip">
              <span class="chip-icon">🎯</span>
              <div class="chip-text">
                <span class="chip-label">Active Directives</span>
                <strong class="chip-val font-mono">${availableCount} Today</strong>
              </div>
            </div>

            <div class="inline-stat-chip">
              <span class="chip-icon">⚡</span>
              <div class="chip-text">
                <span class="chip-label">Pilot Progress</span>
                <strong class="chip-val font-mono">Lvl ${profile.level || 6} • ${(profile.xp || 2480).toLocaleString()} XP</strong>
              </div>
            </div>
          </div>
        </header>

        <!-- 2. STREAK CIRCUIT & MILESTONES (CLEAN COMPOSITION) -->
        <section class="missions-streak-section" aria-label="Daily Practice Calendar">
          <div class="streak-strip-card">
            <div class="streak-strip-left">
              <span class="streak-flame-icon">🔥</span>
              <div class="streak-strip-info">
                <h2 class="streak-strip-heading">${streak} Consecutive Days</h2>
                <p class="streak-strip-sub">Practice 5 minutes daily to retain your maximum XP multiplier.</p>
              </div>
            </div>

            <!-- 7-Day Week Row -->
            <div class="streak-strip-calendar">
              <div class="calendar-days-strip">
                ${days
                  .map(
                    (d, i) => `
                  <div class="cal-day-cell ${calendarDays[i] ? 'is-complete' : i === streak ? 'is-today' : ''}">
                    <span class="cal-day-name">${d}</span>
                    <span class="cal-day-mark">${calendarDays[i] ? '✓' : '—'}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          </div>

          <!-- Milestones Track -->
          <div class="milestones-track-wrap">
            <div class="milestones-track-header">
              <span class="track-title">Streak Milestone Progression</span>
              <span class="track-sub">Unlock exclusive cosmetic liveries & title ranks</span>
            </div>

            <div class="milestones-pills-row">
              <div class="milestone-pill ${streak >= 3 ? 'achieved' : ''}">
                <span class="ms-days font-mono">3 Days</span>
                <strong class="ms-name">Bronze Nitro</strong>
                <span class="ms-reward">+300 XP</span>
              </div>

              <div class="milestone-pill ${streak >= 7 ? 'achieved' : 'active-target'}">
                <span class="ms-days font-mono">7 Days</span>
                <strong class="ms-name">Nebula ZX</strong>
                <span class="ms-reward">Hypercar</span>
              </div>

              <div class="milestone-pill ${streak >= 14 ? 'achieved' : ''}">
                <span class="ms-days font-mono">14 Days</span>
                <strong class="ms-name">Neon Pack</strong>
                <span class="ms-reward">5 Underglows</span>
              </div>

              <div class="milestone-pill ${streak >= 30 ? 'achieved' : ''}">
                <span class="ms-days font-mono">30 Days</span>
                <strong class="ms-name">Apex Master</strong>
                <span class="ms-reward">+2,500 XP</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. DAILY DIRECTIVES (CLEAN EDITORIAL LIST) -->
        <section class="missions-directives-section" aria-label="Daily Objectives">
          <div class="section-title-bar">
            <div>
              <h2 class="section-heading">Today's Directives</h2>
              <span class="section-subtext">Resets automatically at midnight local time</span>
            </div>
            <button class="btn btn-secondary btn-small" data-nav="race">
              Race Grid Now →
            </button>
          </div>

          <div class="directives-list-wrap">
            ${(missions?.list || [])
              .map((m) => {
                const isClaimed = m.completed && m.claimed;
                const isReady = m.completed && !m.claimed;
                const pct = Math.min(100, Math.round((m.current / m.target) * 100));

                return `
                <div class="directive-row ${isReady ? 'is-ready' : ''} ${isClaimed ? 'is-claimed' : ''}">
                  <div class="directive-status-indicator">
                    ${isClaimed ? '✓' : isReady ? '★' : '○'}
                  </div>

                  <div class="directive-details">
                    <div class="directive-title-row">
                      <strong class="directive-title">${m.title}</strong>
                      <span class="directive-reward-tag font-mono">+${m.rewardXp} XP</span>
                    </div>
                    <p class="directive-desc">${m.desc}</p>
                    
                    <div class="directive-progress-line">
                      <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${pct}%"></div>
                      </div>
                      <span class="progress-text font-mono">${m.current}/${m.target}</span>
                    </div>
                  </div>

                  <div class="directive-action-col">
                    ${
                      isReady
                        ? `
                      <button class="btn btn-primary btn-claim glow-primary" data-mission-id="${m.id}">
                        Claim +${m.rewardXp} XP
                      </button>
                    `
                        : isClaimed
                          ? `
                      <span class="claimed-badge font-mono">Claimed</span>
                    `
                          : `
                      <button class="btn btn-outline btn-small" data-nav="race">
                        Start →
                      </button>
                    `
                    }
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>
        </section>

        <!-- 4. TOURNAMENT CHAMPIONSHIP CIRCUIT -->
        <section class="missions-tournament-section" aria-label="Upcoming Championships">
          <div class="section-title-bar">
            <div>
              <h2 class="section-heading">Competitive Championships</h2>
              <span class="section-subtext">Scheduled ranked events with global leaderboard rewards</span>
            </div>
          </div>

          <div class="tournament-card">
            <div class="tournament-content">
              <span class="tourney-tag font-mono">WEEKLY GRAND PRIX</span>
              <h3 class="tourney-title">Neo Tokyo Midnight Circuit</h3>
              <p class="tourney-desc">
                High-speed asphalt circuit under rain-slick neon overpasses. Compete against verified pilot ghosts to set the weekly benchmark.
              </p>

              <div class="tourney-meta-grid">
                <div class="tourney-meta-item">
                  <span class="meta-label">Schedule</span>
                  <strong class="meta-val">Active (3 Days Left)</strong>
                </div>
                <div class="tourney-meta-item">
                  <span class="meta-label">Qualification</span>
                  <strong class="meta-val">Min. 60 WPM • Silver Tier</strong>
                </div>
                <div class="tourney-meta-item">
                  <span class="meta-label">Grand Prize</span>
                  <strong class="meta-val highlight-cyan">+1,500 XP & "Apex Ronin" Decal</strong>
                </div>
              </div>

              <div class="tourney-actions">
                <button class="btn btn-primary" data-nav="race">
                  Enter Championship Grid →
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;

    this.bindEvents(missions, profile);
  }

  bindEvents(missions, profile) {
    this.container.querySelectorAll('.btn-claim').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-mission-id');
        const mission = missions?.list?.find((m) => m.id === id);
        if (mission && !mission.claimed) {
          mission.claimed = true;
          profile.xp = (profile.xp || 0) + mission.rewardXp;
          soundEffects.playVictoryFanfare();

          // Celebration confetti
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 }
            });
          } catch (err) {
            // Ignore if confetti not supported
          }

          await storage.saveMissions(missions);
          await storage.saveProfile(profile);

          // Update header stats and re-render
          if (this.app?.updateHeader) {
            await this.app.updateHeader();
          }
          await this.render();
        }
      });
    });

    this.container.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-nav');
        if (target) {
          soundEffects.playUiClick();
          this.app.showScreen(target);
        }
      });
    });
  }

  dispose() {}
}
