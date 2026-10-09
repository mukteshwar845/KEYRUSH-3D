/**
 * KeyRush Performance Analytics & Key Error Heatmap (Screen 10)
 * Deep telemetry charts, interactive QWERTY error heatmap,
 * session history log, and CSV/JSON export tools.
 */

import { storage } from '../db/storage.js';
import Chart from 'chart.js/auto';
import { downloadPerformanceCard } from '../utils/shareCard.js';

export class AnalyticsView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.wpmTrendChart = null;
    this.scatterChart = null;
    this.durationChart = null;
  }

  async render() {
    const sessions = await storage.getSessions(100);
    const profile = await storage.getProfile();
    const garage = await storage.getGarage();

    // Aggregated weak keys
    const weakKeysMap = profile?.weakKeys || {};

    this.container.innerHTML = `
      <div class="analytics-screen-wrapper">
        <div class="screen-header flex-between">
          <div>
            <span class="section-tag">TELEMETRY & DATA SCIENCE</span>
            <h1 class="screen-title">PERFORMANCE ANALYTICS</h1>
            <p class="screen-subtitle">
              Comprehensive telemetry derived from local session logs. Zero external tracking.
            </p>
          </div>

          <div class="export-actions-group">
            <button class="btn btn-outline" id="btn-export-csv">
              📥 Export CSV
            </button>
            <button class="btn btn-outline" id="btn-export-json">
              📥 Export JSON
            </button>
            <button class="btn btn-primary glow-primary" id="btn-export-share-card">
              📸 Share Card
            </button>
          </div>
        </div>

        <!-- 8 CORE METRIC CARDS -->
        <div class="analytics-metrics-strip">
          <div class="metric-card card-dark">
            <span class="m-title">AVERAGE WPM</span>
            <span class="m-val highlight-cyan font-mono">${profile?.averageWpm || 68}</span>
            <span class="m-sub">Rolling overall</span>
          </div>
          <div class="metric-card card-dark">
            <span class="m-title">PEAK SPEED</span>
            <span class="m-val highlight-cyan font-mono">${profile?.bestWpm || 84}</span>
            <span class="m-sub">Personal best</span>
          </div>
          <div class="metric-card card-dark">
            <span class="m-title">ACCURACY</span>
            <span class="m-val text-positive font-mono">${profile?.accuracy || 96.4}%</span>
            <span class="m-sub">Average precision</span>
          </div>
          <div class="metric-card card-dark">
            <span class="m-title">CORRECT CPM</span>
            <span class="m-val font-mono">${Math.round((profile?.averageWpm || 68) * 5)}</span>
            <span class="m-sub">Chars per minute</span>
          </div>
          <div class="metric-card card-dark">
            <span class="m-title">CONSISTENCY</span>
            <span class="m-val text-gold font-mono">94%</span>
            <span class="m-sub">Cadence stability</span>
          </div>
          <div class="metric-card card-dark">
            <span class="m-title">PRACTICE TIME</span>
            <span class="m-val font-mono">${Math.round((profile?.totalPracticeTimeSec || 2540) / 60)}m</span>
            <span class="m-sub">Total on track</span>
          </div>
          <div class="metric-card card-dark">
            <span class="m-title">RACES WON</span>
            <span class="m-val font-mono">${profile?.racesWon || 14}</span>
            <span class="m-sub">${profile?.racesPlayed || 18} total races</span>
          </div>
          <div class="metric-card card-dark">
            <span class="m-title">MAX STREAK</span>
            <span class="m-val text-gold font-mono">${profile?.longestStreak || 7}d</span>
            <span class="m-sub">Active: ${profile?.currentStreak || 4}d</span>
          </div>
        </div>

        <!-- CHARTS SECTION -->
        <div class="analytics-charts-grid">
          <!-- 1. WPM SPEED & ACCURACY TREND -->
          <div class="chart-box card-dark">
            <div class="chart-header">
              <h3>SPEED VS TIME PROGRESSION</h3>
              <span class="chart-tag">WPM Over Recent Laps</span>
            </div>
            <div class="canvas-wrapper">
              <canvas id="analytics-wpm-chart"></canvas>
            </div>
          </div>

          <!-- 2. WPM VS ACCURACY SCATTER CORRELATION -->
          <div class="chart-box card-dark">
            <div class="chart-header">
              <h3>WPM VS ACCURACY SCATTER</h3>
              <span class="chart-tag">Precision Under Velocity</span>
            </div>
            <div class="canvas-wrapper">
              <canvas id="analytics-scatter-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- KEY ERROR HEATMAP SECTION (INTERACTIVE VIRTUAL KEYBOARD) -->
        <div class="heatmap-panel card-dark">
          <div class="heatmap-header">
            <div>
              <h3>KEYSTROKE ERROR HEATMAP</h3>
              <p>Visual diagnostic highlighting keys with higher misfire frequency. Warmer colors indicate keys that need focus.</p>
            </div>
            <div class="heatmap-legend">
              <span class="legend-box low">Low Errors (0-1)</span>
              <span class="legend-box mid">Medium (2-3)</span>
              <span class="legend-box high">High Frequency (4+)</span>
            </div>
          </div>

          <div class="heatmap-keyboard" id="heatmap-keyboard-ui">
            <!-- Dynamic Heatmap Keyboard -->
          </div>
        </div>

        <!-- SESSION HISTORY TABLE -->
        <div class="session-history-panel card-dark">
          <div class="panel-header-simple">
            <h3>RECORDED SESSION TELEMETRY</h3>
            <span class="session-count">${sessions.length} sessions logged</span>
          </div>

          <div class="table-container">
            <table class="session-table">
              <thead>
                <tr>
                  <th>DATE & TIME</th>
                  <th>MODE</th>
                  <th>CIRCUIT</th>
                  <th>SPEED (WPM)</th>
                  <th>ACCURACY</th>
                  <th>ERRORS</th>
                  <th>DURATION</th>
                  <th>RESULT</th>
                </tr>
              </thead>
              <tbody>
                ${sessions.map(s => `
                  <tr>
                    <td>${new Date(s.timestamp).toLocaleDateString()} ${new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td><span class="mode-tag">${s.mode}</span></td>
                    <td>${s.difficulty || 'AMATEUR'}</td>
                    <td class="font-mono highlight-cyan"><strong>${s.wpm}</strong> WPM</td>
                    <td class="font-mono text-positive">${s.accuracy}%</td>
                    <td class="font-mono text-negative">${s.errorCount || 0}</td>
                    <td class="font-mono">${s.duration || 35}s</td>
                    <td><span class="result-badge ${s.won ? 'won' : 'loss'}">${s.won ? '1ST PLACE' : 'FINISH'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.initAnalyticsCharts(sessions);
      this.renderHeatmapKeyboard(weakKeysMap);
      this.bindEvents(sessions, profile, garage);
    }, 50);
  }

  initAnalyticsCharts(sessions) {
    const wpmCanvas = document.getElementById('analytics-wpm-chart');
    const scatterCanvas = document.getElementById('analytics-scatter-chart');
    if (!wpmCanvas || !scatterCanvas) return;

    if (this.wpmTrendChart) this.wpmTrendChart.destroy();
    if (this.scatterChart) this.scatterChart.destroy();

    const sorted = [...sessions].reverse();
    const labels = sorted.map((_, i) => `Lap ${i + 1}`);
    const wpmData = sorted.map(s => s.wpm);
    const scatterData = sorted.map(s => ({ x: s.wpm, y: s.accuracy }));

    // WPM Line Chart
    this.wpmTrendChart = new Chart(wpmCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'WPM',
          data: wpmData,
          borderColor: '#00e5ff',
          backgroundColor: 'rgba(0, 229, 255, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 3,
          pointBackgroundColor: '#00e5ff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
        }
      }
    });

    // Scatter Chart (WPM vs Accuracy)
    this.scatterChart = new Chart(scatterCanvas, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Session',
          data: scatterData,
          backgroundColor: '#a855f7',
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            title: { display: true, text: 'WPM', color: '#64748b' },
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#64748b' }
          },
          y: {
            title: { display: true, text: 'Accuracy %', color: '#64748b' },
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#64748b' },
            min: 85,
            max: 100
          }
        }
      }
    });
  }

  renderHeatmapKeyboard(weakKeys) {
    const kb = document.getElementById('heatmap-keyboard-ui');
    if (!kb) return;

    const rows = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];

    let html = '';
    rows.forEach(r => {
      html += '<div class="heatmap-row">';
      r.forEach(k => {
        const errorCount = weakKeys[k] || 0;
        let heatClass = 'heat-low';
        if (errorCount >= 4) heatClass = 'heat-high';
        else if (errorCount >= 2) heatClass = 'heat-mid';

        html += `
          <button class="heat-key ${heatClass}" data-key="${k}">
            <span class="key-letter">${k.toUpperCase()}</span>
            <span class="key-err-count">${errorCount} err</span>
          </button>
        `;
      });
      html += '</div>';
    });

    kb.innerHTML = html;
  }

  bindEvents(sessions, profile, garage) {
    // Export CSV
    document.getElementById('btn-export-csv')?.addEventListener('click', () => {
      const headers = ['Timestamp', 'Date', 'Mode', 'Difficulty', 'WPM', 'Accuracy', 'Errors', 'DurationSeconds', 'Won'];
      const rows = sessions.map(s => [
        s.timestamp,
        new Date(s.timestamp).toISOString(),
        `"${s.mode}"`,
        s.difficulty,
        s.wpm,
        s.accuracy,
        s.errorCount || 0,
        s.duration || 0,
        s.won ? 'YES' : 'NO'
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KeyRush_Telemetry_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    });

    // Export JSON
    document.getElementById('btn-export-json')?.addEventListener('click', async () => {
      const fullData = await storage.exportFullData();
      const blob = new Blob([fullData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KeyRush_FullBackup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    });

    // Share Card
    document.getElementById('btn-export-share-card')?.addEventListener('click', () => {
      downloadPerformanceCard({
        username: profile?.username || 'CyberRacer',
        wpm: profile?.bestWpm || 84,
        accuracy: profile?.accuracy || 96.4,
        consistency: 94,
        rank: profile?.league || 'Silver II',
        carName: (garage?.activeVehicleId || 'TALON').toUpperCase(),
        mode: 'Lifetime Performance Analytics'
      });
    });
  }

  dispose() {
    if (this.wpmTrendChart) {
      this.wpmTrendChart.destroy();
      this.wpmTrendChart = null;
    }
    if (this.scatterChart) {
      this.scatterChart.destroy();
      this.scatterChart = null;
    }
  }
}
