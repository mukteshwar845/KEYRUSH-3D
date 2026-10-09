/**
 * KeyRush Dashboard Screen (Screen 02)
 * Comprehensive player hub featuring real-time statistics, Chart.js WPM & Accuracy trends,
 * daily streak goal tracker, XP progression, and game mode quick-launch tiles.
 */

import { storage } from '../db/storage.js';
import Chart from 'chart.js/auto';

export class DashboardView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.wpmChart = null;
    this.accChart = null;
    this.selectedTimeRange = '7d';
  }

  async render(profile) {
    const sessions = await storage.getSessions(50);
    const garage = await storage.getGarage();
    const missions = await storage.getMissions();

    // Calculate aggregated stats
    const totalRaces = profile?.racesPlayed || sessions.length || 1;
    const racesWon = profile?.racesWon || Math.round(totalRaces * 0.7);
    const avgWpm = profile?.averageWpm || 68;
    const bestWpm = profile?.bestWpm || 84;
    const accuracy = profile?.accuracy || 96.4;
    const errorRate = Math.max(0.5, (100 - accuracy).toFixed(1));
    const practiceMins = Math.round((profile?.totalPracticeTimeSec || 2540) / 60);

    // Calculate XP Level threshold
    const currentXp = profile?.xp || 1250;
    const xpForNextLevel = (profile?.level || 4) * 500;
    const xpPercent = Math.min(100, Math.round((currentXp % 500) / 5));

    this.container.innerHTML = `
      <div class="dashboard-wrapper">
        <!-- WELCOME BANNER & DAILY STREAK -->
        <div class="dashboard-banner">
          <div class="banner-left">
            <div class="banner-welcome-tag">PILOT TELEMETRY ACTIVE</div>
            <h1 class="banner-title">READY FOR ANOTHER LAP, <span class="highlight-cyan">${profile?.username || 'RACER'}</span>?</h1>
            <p class="banner-subtitle">
              Daily Practice Goal: <strong>${practiceMins % 15}/15 mins</strong> • Streak: <strong>${profile?.currentStreak || 4} Days Strong</strong>
            </p>
          </div>
          <div class="banner-right">
            <button class="btn btn-primary btn-large glow-primary pulse-btn" data-nav="race">
              <span class="btn-icon">⚡</span> RESUME RACING
            </button>
            <button class="btn btn-secondary" data-nav="ai-select">
              <span class="btn-icon">🤖</span> AI DUEL
            </button>
          </div>
        </div>

        <!-- 7 CORE TELEMETRY STAT CARDS -->
        <div class="stats-grid-7">
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">AVERAGE SPEED</span>
              <span class="stat-icon">⚡</span>
            </div>
            <div class="stat-value-group">
              <span class="stat-number">${avgWpm}</span>
              <span class="stat-unit">WPM</span>
            </div>
            <div class="stat-subtext text-positive">↑ +4.2% this week</div>
          </div>

          <div class="stat-card highlighted-stat">
            <div class="stat-header">
              <span class="stat-label">RECORD SPEED</span>
              <span class="stat-icon">🏆</span>
            </div>
            <div class="stat-value-group">
              <span class="stat-number highlight-cyan">${bestWpm}</span>
              <span class="stat-unit">WPM</span>
            </div>
            <div class="stat-subtext">Peak recorded pace</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">ACCURACY</span>
              <span class="stat-icon">🎯</span>
            </div>
            <div class="stat-value-group">
              <span class="stat-number text-positive">${accuracy}</span>
              <span class="stat-unit">%</span>
            </div>
            <div class="stat-subtext">Precision index</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">ERROR RATE</span>
              <span class="stat-icon">⚠️</span>
            </div>
            <div class="stat-value-group">
              <span class="stat-number text-negative">${errorRate}</span>
              <span class="stat-unit">%</span>
            </div>
            <div class="stat-subtext">Misfire frequency</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">TOTAL TIME</span>
              <span class="stat-icon">⏱️</span>
            </div>
            <div class="stat-value-group">
              <span class="stat-number">${(practiceMins / 60).toFixed(1)}</span>
              <span class="stat-unit">HOURS</span>
            </div>
            <div class="stat-subtext">${practiceMins} mins on track</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">RACES WON</span>
              <span class="stat-icon">🏁</span>
            </div>
            <div class="stat-value-group">
              <span class="stat-number">${racesWon}</span>
              <span class="stat-unit">/ ${totalRaces}</span>
            </div>
            <div class="stat-subtext text-positive">${Math.round((racesWon/totalRaces)*100)}% Win Rate</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">ACTIVE STREAK</span>
              <span class="stat-icon">🔥</span>
            </div>
            <div class="stat-value-group">
              <span class="stat-number text-gold">${profile?.currentStreak || 4}</span>
              <span class="stat-unit">DAYS</span>
            </div>
            <div class="stat-subtext">Best: ${profile?.longestStreak || 7} Days</div>
          </div>
        </div>

        <!-- PROGRESS CHARTS SECTION -->
        <div class="charts-section-layout">
          <div class="chart-panel card-dark">
            <div class="chart-panel-header">
              <div>
                <h3 class="panel-title">SPEED PROGRESSION (WPM)</h3>
                <span class="panel-subtitle">Rolling historical velocity telemetry</span>
              </div>
              <div class="chart-filter-toggles" id="time-filter-buttons">
                <button class="filter-btn active" data-range="7d">7 Days</button>
                <button class="filter-btn" data-range="30d">30 Days</button>
                <button class="filter-btn" data-range="all">All-Time</button>
              </div>
            </div>
            <div class="chart-canvas-wrap">
              <canvas id="wpm-trend-chart"></canvas>
            </div>
          </div>

          <div class="chart-panel card-dark">
            <div class="chart-panel-header">
              <div>
                <h3 class="panel-title">ACCURACY RETENTION (%)</h3>
                <span class="panel-subtitle">Clean keystroke consistency</span>
              </div>
            </div>
            <div class="chart-canvas-wrap">
              <canvas id="accuracy-trend-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- LOWER SECTION: GAME MODES & REWARD TRACKER -->
        <div class="lower-dashboard-grid">
          <!-- QUICK MODES -->
          <div class="dashboard-modes-box card-dark">
            <h3 class="panel-title">RACING CIRCUITS</h3>
            <div class="dashboard-mode-tiles">
              <button class="mode-tile" data-nav="race" data-nav-param="practice">
                <span class="tile-icon">🎯</span>
                <div class="tile-text">
                  <strong>Solo Practice</strong>
                  <span>Free warm-up & no-pressure laps</span>
                </div>
                <span class="tile-badge">Offline</span>
              </button>

              <button class="mode-tile" data-nav="ai-select">
                <span class="tile-icon">🤖</span>
                <div class="tile-text">
                  <strong>AI Opponent Duel</strong>
                  <span>Compete with 5 simulated bot tiers</span>
                </div>
                <span class="tile-badge">Adaptive</span>
              </button>

              <button class="mode-tile" data-nav="multiplayer">
                <span class="tile-icon">⚔️</span>
                <div class="tile-text">
                  <strong>Multiplayer & 2P Split</strong>
                  <span>Private rooms, local duel, online matchmaking</span>
                </div>
                <span class="tile-badge">P2P</span>
              </button>

              <button class="mode-tile" data-nav="leaderboard">
                <span class="tile-icon">👑</span>
                <div class="tile-text">
                  <strong>Ranked Championship</strong>
                  <span>Climb from Bronze to Apex Legend</span>
                </div>
                <span class="tile-badge">Ranked</span>
              </button>
            </div>
          </div>

          <!-- XP & VEHICLE UNLOCK PROGRESS -->
          <div class="progression-box card-dark">
            <h3 class="panel-title">XP & REWARDS PIPELINE</h3>

            <!-- Level Bar -->
            <div class="xp-level-container">
              <div class="xp-header-info">
                <span>Level ${profile?.level || 4} Circuit Racer</span>
                <span>${currentXp} / ${xpForNextLevel} XP</span>
              </div>
              <div class="xp-progress-bar">
                <div class="xp-progress-fill" style="width: ${xpPercent}%"></div>
              </div>
            </div>

            <!-- Next Unlock Vehicle Preview -->
            <div class="next-unlock-card">
              <div class="unlock-icon">🏎️</div>
              <div class="unlock-details">
                <span class="unlock-label">NEXT VEHICLE UNLOCK</span>
                <strong>Phantom GT (Epic Supercar)</strong>
                <span class="unlock-req">Requirement: Reach 80 WPM (Current: ${bestWpm} WPM)</span>
              </div>
              <button class="btn btn-outline btn-small" data-nav="garage">Garage</button>
            </div>

            <!-- Today's Daily Missions Snapshot -->
            <div class="daily-missions-preview">
              <div class="mission-snapshot-header">
                <span class="mini-tag">DAILY MISSIONS</span>
                <button class="link-btn" data-nav="missions">View All (${missions?.list?.filter(m => m.completed).length || 1}/${missions?.list?.length || 5}) →</button>
              </div>
              <div class="mini-mission-list">
                ${(missions?.list || []).slice(0, 2).map(m => `
                  <div class="mini-mission-row ${m.completed ? 'completed' : ''}">
                    <span class="m-status">${m.completed ? '✓' : '○'}</span>
                    <span class="m-title">${m.title}</span>
                    <span class="m-xp">+${m.rewardXp} XP</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render Charts
    setTimeout(() => {
      this.initCharts(sessions);
      this.bindChartFilters(sessions);
    }, 50);
  }

  initCharts(sessions) {
    const wpmCtx = document.getElementById('wpm-trend-chart');
    const accCtx = document.getElementById('accuracy-trend-chart');
    if (!wpmCtx || !accCtx) return;

    // Destroy existing instances if any
    if (this.wpmChart) this.wpmChart.destroy();
    if (this.accChart) this.accChart.destroy();

    // Prepare session data (chronological)
    const sorted = [...sessions].reverse();
    const labels = sorted.map((s, i) => `Lap ${i + 1}`);
    const wpmData = sorted.map(s => s.wpm);
    const accData = sorted.map(s => s.accuracy);

    // Dark cyberpunk chart styling
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(14, 18, 30, 0.95)',
          borderColor: '#00e5ff',
          borderWidth: 1,
          titleFont: { family: 'Rajdhani', size: 14 },
          bodyFont: { family: 'Rajdhani', size: 13 },
          padding: 10,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { family: 'Rajdhani' } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { family: 'Rajdhani' } }
        }
      }
    };

    // WPM Line Chart
    this.wpmChart = new Chart(wpmCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Speed (WPM)',
          data: wpmData,
          borderColor: '#00e5ff',
          backgroundColor: 'rgba(0, 229, 255, 0.1)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: '#00e5ff',
          pointBorderColor: '#ffffff',
          pointHoverRadius: 6
        }]
      },
      options: {
        ...chartOptions,
        scales: {
          ...chartOptions.scales,
          y: { ...chartOptions.scales.y, min: 30, suggestedMax: 100 }
        }
      }
    });

    // Accuracy Line Chart
    this.accChart = new Chart(accCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Accuracy (%)',
          data: accData,
          borderColor: '#00f59b',
          backgroundColor: 'rgba(0, 245, 155, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: '#00f59b',
          pointBorderColor: '#ffffff',
          pointHoverRadius: 6
        }]
      },
      options: {
        ...chartOptions,
        scales: {
          ...chartOptions.scales,
          y: { ...chartOptions.scales.y, min: 80, max: 100 }
        }
      }
    });
  }

  bindChartFilters(sessions) {
    const btnContainer = document.getElementById('time-filter-buttons');
    if (!btnContainer) return;

    btnContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-range]');
      if (!btn) return;

      btnContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const range = btn.getAttribute('data-range');
      let filtered = [...sessions].reverse();
      if (range === '7d') filtered = filtered.slice(-7);
      else if (range === '30d') filtered = filtered.slice(-30);

      if (this.wpmChart) {
        this.wpmChart.data.labels = filtered.map((_, i) => `Lap ${i + 1}`);
        this.wpmChart.data.datasets[0].data = filtered.map(s => s.wpm);
        this.wpmChart.update();
      }
    });
  }

  dispose() {
    if (this.wpmChart) {
      this.wpmChart.destroy();
      this.wpmChart = null;
    }
    if (this.accChart) {
      this.accChart.destroy();
      this.accChart = null;
    }
  }
}
