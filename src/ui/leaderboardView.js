/**
 * KeyRush Global Leaderboard & Ranked Leagues (Screen 09)
 * Competitive standings, league tiers, friends rankings,
 * and detailed player profile card with shareable graphics.
 */

import { storage } from '../db/storage.js';
import { downloadPerformanceCard } from '../utils/shareCard.js';

export const LEADERBOARD_SEED = [
  { rank: 1, name: 'QuantumRacer', avatar: '👑', league: 'Apex Legend', wpm: 154, accuracy: 99.4, car: 'CHRONOS V12', country: 'SE' },
  { rank: 2, name: 'NeonSpectre', avatar: '⚡', league: 'Apex Legend', wpm: 148, accuracy: 99.1, car: 'NEBULA ZX', country: 'JP' },
  { rank: 3, name: 'Veloce_God', avatar: '🔥', league: 'Diamond I', wpm: 139, accuracy: 98.8, car: 'PHANTOM GT', country: 'US' },
  { rank: 4, name: 'HyperCadence', avatar: '🏎️', league: 'Diamond II', wpm: 126, accuracy: 98.2, car: 'VORTEX R34', country: 'DE' },
  { rank: 5, name: 'MatrixPilot', avatar: '🤖', league: 'Diamond III', wpm: 118, accuracy: 97.9, car: 'PHANTOM GT', country: 'KR' },
  { rank: 6, name: 'TurboFingers', avatar: '💨', league: 'Platinum I', wpm: 110, accuracy: 97.5, car: 'TALON', country: 'UK' },
  { rank: 7, name: 'AeroShift', avatar: '🎯', league: 'Platinum II', wpm: 104, accuracy: 97.0, car: 'VORTEX R34', country: 'FR' },
  { rank: 8, name: 'ApexPhantom', avatar: '🏁', league: 'Platinum III', wpm: 96, accuracy: 96.8, car: 'PHANTOM GT', country: 'CA' },
  { rank: 9, name: 'CyberRacer (You)', avatar: '🏎️', league: 'Silver II', wpm: 84, accuracy: 96.4, car: 'TALON', country: 'INT', isUser: true },
  { rank: 10, name: 'CircuitRookie', avatar: '🌱', league: 'Silver III', wpm: 68, accuracy: 94.2, car: 'TALON', country: 'AU' }
];

export class LeaderboardView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.activeTab = 'global';
  }

  async render() {
    const profile = await storage.getProfile();
    const garage = await storage.getGarage();

    this.container.innerHTML = `
      <div class="dash-page-container">
        <!-- Section Hero Banner -->
        <div class="dash-section-hero card-dark">
          <div class="section-hero-content">
            <span class="section-tag-pill">GLOBAL ESPORTS STANDINGS</span>
            <h1 class="dash-page-title">RANKED CHAMPIONSHIP LEAGUES</h1>
            <p class="dash-page-desc">
              Verified typing telemetry across worldwide circuits. Compete to ascend the ranked tiers from Bronze to Apex Legend.
            </p>
          </div>
          <div class="section-hero-stats">
            <div class="stat-pill-item">
              <span class="stat-pill-label">YOUR RANK</span>
              <span class="stat-pill-val highlight-cyan font-mono">#4 GLOBAL</span>
            </div>
            <div class="stat-pill-item">
              <span class="stat-pill-label">ACTIVE TIER</span>
              <span class="stat-pill-val text-gold font-mono">SILVER II</span>
            </div>
          </div>
        </div>

        <!-- LEAGUE TIERS STRIP -->
        <div class="league-tiers-rack card-dark">
          <div class="tier-badge-cell bronze">
            <span class="badge-icon">🥉</span>
            <span class="badge-name">BRONZE</span>
            <small>0 - 45 WPM</small>
          </div>
          <div class="tier-badge-cell silver active-tier">
            <span class="badge-icon">🥈</span>
            <span class="badge-name">SILVER</span>
            <small>46 - 70 WPM</small>
          </div>
          <div class="tier-badge-cell gold">
            <span class="badge-icon">🥇</span>
            <span class="badge-name">GOLD</span>
            <small>71 - 90 WPM</small>
          </div>
          <div class="tier-badge-cell platinum">
            <span class="badge-icon">💎</span>
            <span class="badge-name">PLATINUM</span>
            <small>91 - 110 WPM</small>
          </div>
          <div class="tier-badge-cell diamond">
            <span class="badge-icon">✨</span>
            <span class="badge-name">DIAMOND</span>
            <small>111 - 130 WPM</small>
          </div>
          <div class="tier-badge-cell apex">
            <span class="badge-icon">👑</span>
            <span class="badge-name">APEX LEGEND</span>
            <small>131+ WPM</small>
          </div>
        </div>

        <!-- MAIN LAYOUT: TABLE & PROFILE PREVIEW -->
        <div class="leaderboard-grid-layout">
          <div class="leaderboard-table-col card-dark">
            <div class="table-header-controls">
              <div class="tab-toggles">
                <button class="tab-btn active" id="tab-global">Global Grand Prix</button>
                <button class="tab-btn" id="tab-friends">Friends Roster</button>
              </div>

              <div class="filter-dropdown-group">
                <select class="custom-select" id="lb-time-filter">
                  <option value="all">All-Time Circuit</option>
                  <option value="week">This Week</option>
                  <option value="today">Today</option>
                </select>
              </div>
            </div>

            <div class="table-container">
              <table class="leaderboard-table">
                <thead>
                  <tr>
                    <th>RANK</th>
                    <th>PILOT</th>
                    <th>LEAGUE TIER</th>
                    <th>TOP SPEED</th>
                    <th>ACCURACY</th>
                    <th>VEHICLE</th>
                  </tr>
                </thead>
                <tbody>
                  ${LEADERBOARD_SEED.map(entry => `
                    <tr class="${entry.isUser ? 'user-row' : ''}">
                      <td class="rank-cell">
                        ${entry.rank === 1 ? '<span class="crown">👑 1</span>' :
                          entry.rank === 2 ? '<span class="silver-medal">🥈 2</span>' :
                          entry.rank === 3 ? '<span class="bronze-medal">🥉 3</span>' : `#${entry.rank}`}
                      </td>
                      <td class="pilot-cell">
                        <span class="pilot-icon">${entry.avatar}</span>
                        <strong>${entry.name}</strong>
                      </td>
                      <td><span class="league-pill ${entry.league.toLowerCase().replace(' ', '-')}">${entry.league}</span></td>
                      <td class="font-mono highlight-cyan"><strong>${entry.wpm}</strong> WPM</td>
                      <td class="font-mono text-positive">${entry.accuracy}%</td>
                      <td class="font-mono text-dim">${entry.car}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- USER PROFILE CARD SIDEBAR -->
          <div class="player-profile-sidebar card-dark">
            <div class="profile-card-header">
              <div class="p-avatar-large">${profile?.avatar || '🏎️'}</div>
              <div class="p-header-meta">
                <h2>${profile?.username || 'CyberRacer'}</h2>
                <span class="league-pill silver">SILVER II LEAGUE</span>
              </div>
            </div>

            <div class="profile-stats-grid">
              <div class="p-stat">
                <span class="ps-label">RANKED SPEED</span>
                <span class="ps-val highlight-cyan font-mono">${profile?.bestWpm || 84} WPM</span>
              </div>
              <div class="p-stat">
                <span class="ps-label">ACCURACY</span>
                <span class="ps-val text-positive font-mono">${profile?.accuracy || 96.4}%</span>
              </div>
              <div class="p-stat">
                <span class="ps-label">RACES WON</span>
                <span class="ps-val font-mono">${profile?.racesWon || 14} / ${profile?.racesPlayed || 18}</span>
              </div>
              <div class="p-stat">
                <span class="ps-label">PILOT LEVEL</span>
                <span class="ps-val text-gold font-mono">LVL ${profile?.level || 4}</span>
              </div>
            </div>

            <div class="profile-car-preview">
              <span class="pc-label">PRIMARY CIRCUIT VEHICLE</span>
              <div class="pc-car-name">🏎️ ${(garage?.activeVehicleId || 'talon').toUpperCase()}</div>
            </div>

            <div class="profile-card-actions">
              <button class="btn btn-primary btn-full glow-primary" id="btn-export-profile-card">
                📸 DOWNLOAD PERFORMANCE CARD
              </button>
              <button class="btn btn-outline btn-full" data-nav="settings">
                Edit Pilot Profile & Avatar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(profile, garage);
  }

  bindEvents(profile, garage) {
    document.getElementById('btn-export-profile-card')?.addEventListener('click', () => {
      downloadPerformanceCard({
        username: profile?.username || 'CyberRacer',
        wpm: profile?.bestWpm || 84,
        accuracy: profile?.accuracy || 96.4,
        consistency: 94,
        rank: profile?.league || 'Silver II',
        carName: (garage?.activeVehicleId || 'Apex Talon').toUpperCase(),
        mode: 'Ranked League Standings'
      });
    });
  }

  dispose() {}
}
