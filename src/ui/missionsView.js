/**
 * KeyRush Daily Streaks, Missions & Rewards (Screen 11)
 * Streak calendar, flame animation, claimable daily mission XP,
 * and milestone progression rewards.
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
    const profile = await storage.getProfile();
    const missions = await storage.getMissions();

    const streak = profile?.currentStreak || 4;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const calendarDays = missions?.calendarDays || [true, true, true, true, false, false, false];

    this.container.innerHTML = `
      <div class="dash-page-container">
        <!-- Section Hero Banner -->
        <div class="dash-section-hero card-dark">
          <div class="section-hero-content">
            <span class="section-tag-pill">HABIT & TOURNAMENTS</span>
            <h1 class="dash-page-title">DAILY MISSIONS & TOURNAMENT CIRCUIT</h1>
            <p class="dash-page-desc">
              Consistent daily practice builds lightning-fast muscle memory. Complete daily objectives to earn XP, level up, and unlock cosmetic hypercars.
            </p>
          </div>
          <div class="section-hero-stats">
            <div class="stat-pill-item">
              <span class="stat-pill-label">DAILY STREAK</span>
              <span class="stat-pill-val highlight-cyan font-mono">${streak} DAYS</span>
            </div>
            <div class="stat-pill-item">
              <span class="stat-pill-label">AVAILABLE MISSIONS</span>
              <span class="stat-pill-val text-gold font-mono">3 DIRECTIVES</span>
            </div>
          </div>
        </div>

        <!-- STREAK BANNER WITH FLAME -->
        <div class="streak-hero-card card-dark">
          <div class="streak-left">
            <div class="flame-glow-circle">🔥</div>
            <div class="streak-info">
              <span class="streak-tag">ACTIVE DAILY STREAK</span>
              <h2 class="streak-number">${streak} <span class="streak-days-text">DAYS IN A ROW</span></h2>
              <p class="streak-sub">Practice at least 5 minutes every calendar day to keep your streak multiplier active.</p>
            </div>
          </div>

          <!-- 7-Day Calendar Tracker -->
          <div class="streak-week-calendar">
            <span class="calendar-label">THIS WEEK'S CIRCUIT:</span>
            <div class="calendar-days-row">
              ${days.map((d, i) => `
                <div class="cal-day ${calendarDays[i] ? 'active-day' : ''}">
                  <span class="cal-name">${d}</span>
                  <div class="cal-check">${calendarDays[i] ? '✓' : '○'}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- STREAK MILESTONES RACK -->
        <div class="milestones-rack card-dark">
          <div class="milestone-header">
            <h4>STREAK MILESTONES</h4>
            <span>Exclusive cosmetics awarded at milestone laps</span>
          </div>

          <div class="milestone-steps-grid">
            <div class="ms-step ${streak >= 3 ? 'reached' : ''}">
              <div class="ms-badge">3 DAYS</div>
              <strong>Bronze Nitro</strong>
              <span>+300 XP</span>
            </div>
            <div class="ms-step ${streak >= 7 ? 'reached' : 'current-target'}">
              <div class="ms-badge">7 DAYS</div>
              <strong>Nebula ZX Hypercar</strong>
              <span>Legendary Unlock</span>
            </div>
            <div class="ms-step ${streak >= 14 ? 'reached' : ''}">
              <div class="ms-badge">14 DAYS</div>
              <strong>Neon Underglow Pack</strong>
              <span>5 Custom Colors</span>
            </div>
            <div class="ms-step ${streak >= 30 ? 'reached' : ''}">
              <div class="ms-badge">30 DAYS</div>
              <strong>Apex Grand Master</strong>
              <span>Exclusive Title & +2,500 XP</span>
            </div>
            <div class="ms-step ${streak >= 100 ? 'reached' : ''}">
              <div class="ms-badge">100 DAYS</div>
              <strong>Centurion Plasma Livery</strong>
              <span>Mythic Decal</span>
            </div>
          </div>
        </div>

        <!-- DAILY MISSIONS LIST -->
        <div class="daily-missions-section card-dark">
          <div class="missions-section-header">
            <div>
              <h3>TODAY'S MISSIONS</h3>
              <span>Refreshes daily at 00:00 local time</span>
            </div>
            <button class="btn btn-primary" data-nav="race">Race Now →</button>
          </div>

          <div class="missions-list">
            ${(missions?.list || []).map(m => `
              <div class="mission-item-card ${m.completed ? 'completed' : ''}">
                <div class="m-status-icon">${m.completed ? '✓' : '🎯'}</div>
                <div class="m-details">
                  <div class="m-title-row">
                    <strong>${m.title}</strong>
                    <span class="m-reward-pill">+${m.rewardXp} XP</span>
                  </div>
                  <p class="m-desc">${m.desc}</p>
                  <div class="m-progress-bar-wrap">
                    <div class="m-progress-bar" style="width: ${Math.min(100, (m.current / m.target) * 100)}%"></div>
                  </div>
                </div>

                <div class="m-action">
                  ${m.completed && !m.claimed ? `
                    <button class="btn btn-primary btn-claim" data-mission-id="${m.id}">CLAIM XP</button>
                  ` : m.completed && m.claimed ? `
                    <span class="claimed-tag">CLAIMED</span>
                  ` : `
                    <button class="btn btn-outline" data-nav="race">IN PROGRESS</button>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents(missions, profile);
  }

  bindEvents(missions, profile) {
    this.container.querySelectorAll('.btn-claim').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-mission-id');
        const mission = missions.list.find(m => m.id === id);
        if (mission && !mission.claimed) {
          mission.claimed = true;
          profile.xp = (profile.xp || 0) + mission.rewardXp;
          profile.level = Math.floor(profile.xp / 500) + 1;

          await storage.saveMissions(missions);
          await storage.saveProfile(profile);

          soundEffects.playVictoryFanfare();
          confetti({ particleCount: 70, spread: 60 });
          this.render();
        }
      });
    });
  }

  dispose() {}
}
