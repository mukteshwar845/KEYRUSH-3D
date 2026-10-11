/**
 * KEYRUSH — Next-Gen 3D Esports Motorsport Typing Simulator
 * High-Impact Modern Landing Page Showcase
 * Features:
 * - Floating glassmorphic navigation header with quick links & instant game launch
 * - Cyberpunk hero section with live telemetry chips, glowing hypercar centerpiece & instant CTAs
 * - Interactive "Type-To-Accelerate" live speed playground demo right on the landing page
 * - 5-Supercar interactive showroom with live stat meters & garage links
 * - 5 Game Modes arena cards (Solo, AI, Local, Online, Ranked)
 * - Ranked Leagues ladder (Bronze to Apex Legend) & global leaderboard preview
 * - Technology & engineering pillars (Three.js 3D, Offline-First, Audio Synthesis, Telemetry)
 * - High-energy CTA finale & responsive esports footer
 */

import { soundEffects } from '../audio/soundEffects.js';
import { musicManager } from '../audio/musicManager.js';
import { VEHICLE_CATALOG } from '../graphics/carModels.js';

export class LandingView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.profile = null;
    this.activeCarIndex = 0;
    
    // Interactive Mini-Demo Sprint State
    this.demoText = 'type with lightning cadence to engage turbo nitro and cross the finish line';
    this.typedChars = 0;
    this.demoStartTime = null;
    this.demoWpm = 0;
    this.demoCompleted = false;
    this.onKeyDownDemo = null;
  }

  render(profile) {
    this.profile = profile || {};
    // Ensure calm interior music plays on landing showcase
    musicManager.playInterior(1500, true);

    const cars = VEHICLE_CATALOG || [
      { id: 'talon', name: 'Apex Talon', tier: 'Tier 1 Starter', rarity: 'Common', baseTopSpeed: '160 KM/H', acceleration: '4.2s (0-100)', handling: 'Aero Grip A+', description: 'Agile cyber-coupe engineered for crisp responsiveness and novice racers.' },
      { id: 'vortex', name: 'Vortex R34', tier: 'Tier 2 Street', rarity: 'Rare', baseTopSpeed: '210 KM/H', acceleration: '3.4s (0-100)', handling: 'Drift Spec S', description: 'Twin-turbo grand tourer built for high-cadence cornering and drift recovery.' },
      { id: 'phantom', name: 'Phantom GT', tier: 'Tier 3 Pro', rarity: 'Epic', baseTopSpeed: '260 KM/H', acceleration: '2.8s (0-100)', handling: 'Downforce SS', description: 'Track-focused aerodynamic missile engineered with active ground effects.' },
      { id: 'nebula', name: 'Nebula ZX', tier: 'Tier 4 Elite', rarity: 'Legendary', baseTopSpeed: '320 KM/H', acceleration: '2.2s (0-100)', handling: 'Active Vector SSS', description: 'Quad-motor electric prototype delivering instant acceleration and raw speed.' },
      { id: 'chronos', name: 'Chronos V12', tier: 'Tier 5 Apex', rarity: 'Mythic', baseTopSpeed: '380 KM/H', acceleration: '1.8s (0-100)', handling: 'Apex Ground Effect', description: 'The undisputed championship hypercar reserved exclusively for Apex Legends.' }
    ];

    this.container.innerHTML = `
      <div class="landing-universe" id="landing-root">
        <!-- 1. FLOATING MODERN GLASS NAVBAR -->
        <header class="landing-navbar">
          <div class="nav-brand" role="button" tabindex="0" data-nav="landing">
            <div class="nav-brand-bolt">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="url(#brandGrad)" stroke="#00D9FF" stroke-width="1.2" stroke-linejoin="round"/>
                <defs>
                  <linearGradient id="brandGrad" x1="3" y1="2" x2="21" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#00D9FF"/>
                    <stop offset="0.5" stop-color="#147BFF"/>
                    <stop offset="1" stop-color="#8B35FF"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="nav-brand-text">
              <span class="nav-logo-name">KEYRUSH</span>
              <span class="nav-logo-sub">Type. Race. Dominate.</span>
            </div>
          </div>

          <nav class="nav-links">
            <a href="#section-hero" class="nav-link active">Overview</a>
            <a href="#section-demo" class="nav-link">Live Sprint Demo</a>
            <a href="#section-supercars" class="nav-link">Supercars</a>
            <a href="#section-modes" class="nav-link">Game Modes</a>
            <a href="#section-leagues" class="nav-link">Ranked Leagues</a>
            <a href="#section-features" class="nav-link">Engineering</a>
          </nav>

          <div class="nav-actions">
            <button class="nav-audio-btn" id="landing-audio-toggle" title="Atmospheric Background Music: Click to Toggle">
              <span class="audio-btn-icon">🔊</span>
              <span class="audio-btn-text" id="landing-audio-text">MUSIC ON</span>
            </button>
            <div class="nav-offline-pill" title="100% Offline-First Architecture">
              <span class="nav-pulse-dot"></span>
              <span>Offline Ready</span>
            </div>
            <button class="btn btn-secondary nav-btn-dash" data-nav="dashboard" title="Go to Pilot Dashboard">
              <span>Dashboard</span>
              <span class="btn-arrow-right">↗</span>
            </button>
            <button class="btn btn-primary glow-primary nav-btn-play" data-nav="race-modes" title="Launch Game Arena">
              <span class="btn-play-triangle">▶</span>
              <span>PLAY NOW</span>
            </button>
          </div>
        </header>

        <!-- 2. HIGH-OCTANE HERO SECTION -->
        <section class="landing-hero-section" id="section-hero">
          <div class="hero-backdrop-glow"></div>
          <div class="hero-grid-canvas"></div>

          <div class="hero-container">
            <div class="hero-content">
              <div class="hero-badge-pill">
                <span class="badge-bolt">⚡</span>
                <span>NEXT-GEN 3D ESPORTS MOTORSPORT SIMULATOR</span>
                <span class="badge-v">v2.4</span>
              </div>

              <h1 class="hero-headline">
                TYPE AT LIGHTSPEED.<br>
                <span class="headline-gradient">DOMINATE THE GRID.</span>
              </h1>

              <p class="hero-subhead">
                Turn your typing cadence into pure mechanical horsepower. Accelerate 3D hypercars through 
                neon-drenched megacities, overtake competitive AI grids in real time, and climb worldwide 
                ranked esports leagues with verified local telemetry.
              </p>

              <div class="hero-cta-cluster">
                <button class="hero-btn-launch glow-primary" data-nav="race" id="hero-btn-start-race">
                  <span class="btn-play-triangle">▶</span>
                  <span>START 3D RACE NOW</span>
                  <span class="btn-arrow-right">→</span>
                </button>
                <button class="hero-btn-dashboard" data-nav="dashboard" id="hero-btn-go-dash">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  <span>Open Pilot Dashboard</span>
                </button>
                <a href="#section-demo" class="hero-btn-demo">
                  <span>Try 10s Live Sprint</span>
                  <span class="arrow-down">↓</span>
                </a>
              </div>

              <!-- Hero Telemetry Matrix -->
              <div class="hero-telemetry-strip">
                <div class="hero-stat-box">
                  <span class="h-stat-label">MAX WPM BENCHMARK</span>
                  <span class="h-stat-val font-mono highlight-cyan">154+ <small>WPM</small></span>
                  <span class="h-stat-sub">Cadence Overtake</span>
                </div>
                <div class="hero-stat-box">
                  <span class="h-stat-label">HYPERCAR COLLECTION</span>
                  <span class="h-stat-val font-mono text-gold">5 <small>SUPERCARS</small></span>
                  <span class="h-stat-sub">3D Turntable Studio</span>
                </div>
                <div class="hero-stat-box">
                  <span class="h-stat-label">LOCAL LATENCY</span>
                  <span class="h-stat-val font-mono text-positive">0<small>ms</small></span>
                  <span class="h-stat-sub">100% Offline-First</span>
                </div>
                <div class="hero-stat-box">
                  <span class="h-stat-label">COMPETITIVE TIERS</span>
                  <span class="h-stat-val font-mono highlight-purple">6 <small>LEAGUES</small></span>
                  <span class="h-stat-sub">Bronze to Apex Legend</span>
                </div>
              </div>
            </div>

            <!-- Hero Visual Car Stage with Floating HUD Chips -->
            <div class="hero-visual-stage">
              <div class="hero-car-halo"></div>
              
              <img 
                src="/images/sp40_car_clean.png" 
                alt="KEYRUSH Concept Hypercar" 
                class="hero-supercar-img" 
                id="hero-car-img"
              />

              <!-- Floating Live HUD Card 1: Velocity -->
              <div class="floating-hud-card hud-top-left">
                <div class="hud-card-icon">⚡</div>
                <div class="hud-card-info">
                  <span class="hud-card-lbl">LIVE TELEMETRY</span>
                  <strong class="hud-card-val font-mono">112 WPM • 284 KM/H</strong>
                </div>
              </div>

              <!-- Floating Live HUD Card 2: Position -->
              <div class="floating-hud-card hud-bottom-right">
                <div class="hud-card-icon">🏆</div>
                <div class="hud-card-info">
                  <span class="hud-card-lbl">GRID STANDINGS</span>
                  <strong class="hud-card-val font-mono text-gold">P1 LEADER (OVERTAKE)</strong>
                </div>
              </div>

              <!-- Floating Live HUD Card 3: Nitro -->
              <div class="floating-hud-card hud-bottom-left">
                <div class="hud-card-icon">🔥</div>
                <div class="hud-card-info">
                  <span class="hud-card-lbl">NITRO BOOST</span>
                  <strong class="hud-card-val font-mono text-positive">100% ARMED • CADENCE BOOST</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. INTERACTIVE "TYPE-TO-ACCELERATE" SPRINT PLAYGROUND -->
        <section class="landing-section demo-section" id="section-demo">
          <div class="section-container">
            <div class="section-title-wrap text-center">
              <span class="section-tag-pill">LIVE PLAYGROUND DEMO</span>
              <h2 class="section-headline">TEST DRIVE THE KEYRUSH ENGINE</h2>
              <p class="section-desc">
                Type the passage below directly to generate horsepower. Watch your speedometer climb, 
                rev the synthetic engine, and propel the hypercar across the finish line.
              </p>
            </div>

            <div class="sprint-playground-card card-dark">
              <!-- Top Telemetry Meters -->
              <div class="playground-telemetry-bar">
                <div class="play-meter-item">
                  <span class="meter-label">CURRENT SPEED</span>
                  <div class="meter-val-row">
                    <span class="meter-number font-mono" id="demo-wpm-val">0</span>
                    <span class="meter-unit">WPM</span>
                  </div>
                </div>

                <div class="play-meter-item">
                  <span class="meter-label">VELOCITY (KM/H)</span>
                  <div class="meter-val-row">
                    <span class="meter-number font-mono text-gold" id="demo-kmh-val">0</span>
                    <span class="meter-unit">KM/H</span>
                  </div>
                </div>

                <div class="play-meter-item">
                  <span class="meter-label">ACCURACY</span>
                  <div class="meter-val-row">
                    <span class="meter-number font-mono text-positive" id="demo-acc-val">100</span>
                    <span class="meter-unit">%</span>
                  </div>
                </div>

                <div class="play-meter-item">
                  <span class="meter-label">ENGINE STATUS</span>
                  <span class="engine-state-pill" id="demo-engine-state">READY ON GRID</span>
                </div>
              </div>

              <!-- Mini Visual Track Runway -->
              <div class="mini-track-runway">
                <div class="runway-road">
                  <div class="runway-lanes"></div>
                  <!-- Player Car on Runway -->
                  <div class="runway-car" id="demo-runway-car" style="left: 2%">
                    <span class="runway-car-sprite">🏎️</span>
                    <span class="runway-car-tail"></span>
                  </div>
                  <div class="runway-finish-line">🏁</div>
                </div>
              </div>

              <!-- Interactive Prompt Box -->
              <div class="sprint-prompt-display" id="demo-prompt-box">
                <!-- Dynamically populated character spans -->
              </div>

              <!-- Hidden/Active input trigger -->
              <div class="sprint-input-wrap">
                <input 
                  type="text" 
                  id="demo-typing-input" 
                  class="sprint-real-input" 
                  placeholder="Click here or start typing to accelerate..." 
                  autocomplete="off" 
                  autocorrect="off" 
                  autocapitalize="off" 
                  spellcheck="false"
                />
                <button class="btn btn-outline btn-reset-demo" id="demo-reset-btn" title="Reset Sprint">
                  🔄 Reset Sprint
                </button>
              </div>

              <!-- Completion Banner (hidden by default) -->
              <div class="sprint-win-toast hidden" id="demo-win-toast">
                <div class="toast-left">
                  <span class="toast-trophy">🏆</span>
                  <div>
                    <h4 class="toast-title">FINISH LINE CROSSED!</h4>
                    <p class="toast-desc" id="demo-win-stats">Sprint completed at 85 WPM with 100% precision.</p>
                  </div>
                </div>
                <button class="btn btn-primary glow-primary" data-nav="race">
                  LAUNCH FULL 5-CAR 3D RACE →
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. 3D SUPERCARS SHOWROOM CAROUSEL -->
        <section class="landing-section supercars-section" id="section-supercars">
          <div class="section-container">
            <div class="section-title-wrap">
              <span class="section-tag-pill">3D MOTORSPORT FLEET</span>
              <h2 class="section-headline">FIVE PRECISION HYPERCARS</h2>
              <p class="section-desc">
                From nimble starter coupes to 380 KM/H mythic hypercars. Every vehicle features 
                unique acceleration curves, handling physics, and fully customizable liveries in the 3D Garage.
              </p>
            </div>

            <div class="supercars-stage-card card-dark">
              <!-- Left Car Switcher Column -->
              <div class="car-selector-col">
                <span class="selector-lbl">CHOOSE SUPERCAR</span>
                <div class="car-nav-list" id="showroom-car-list">
                  ${cars.map((car, idx) => `
                    <button class="car-nav-item ${idx === 0 ? 'active' : ''}" data-car-idx="${idx}">
                      <div class="car-nav-icon">🏎️</div>
                      <div class="car-nav-meta">
                        <span class="car-nav-name">${car.name}</span>
                        <span class="car-nav-tier">${car.tier}</span>
                      </div>
                      <span class="car-nav-arrow">›</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Center Showcase Presentation -->
              <div class="car-display-center">
                <div class="showroom-car-preview" id="showroom-car-preview">
                  <div class="showroom-underglow" id="showroom-glow"></div>
                  <img 
                    src="/images/sp40_car_clean.png" 
                    alt="Supercar Display" 
                    class="showroom-car-img" 
                    id="showroom-car-img" 
                  />
                </div>

                <div class="showroom-car-details" id="showroom-details">
                  <div class="details-header">
                    <div>
                      <span class="car-rarity-pill common" id="show-car-rarity">COMMON • TIER 1</span>
                      <h3 class="show-car-title" id="show-car-title">Apex Talon</h3>
                    </div>
                    <button class="btn btn-primary glow-primary" data-nav="garage">
                      CUSTOMIZE IN 3D GARAGE →
                    </button>
                  </div>

                  <p class="show-car-desc" id="show-car-desc">
                    Agile cyber-coupe engineered for crisp responsiveness and novice racers.
                  </p>

                  <div class="show-specs-grid">
                    <div class="spec-meter-box">
                      <span class="spec-lbl">TOP SPEED</span>
                      <strong class="spec-val font-mono" id="show-car-speed">160 KM/H</strong>
                      <div class="spec-bar"><div class="spec-fill" id="show-bar-speed" style="width: 45%"></div></div>
                    </div>

                    <div class="spec-meter-box">
                      <span class="spec-lbl">ACCELERATION</span>
                      <strong class="spec-val font-mono" id="show-car-accel">4.2s (0-100)</strong>
                      <div class="spec-bar"><div class="spec-fill" id="show-bar-accel" style="width: 60%"></div></div>
                    </div>

                    <div class="spec-meter-box">
                      <span class="spec-lbl">AERO GRIP</span>
                      <strong class="spec-val font-mono" id="show-car-handling">Aero Grip A+</strong>
                      <div class="spec-bar"><div class="spec-fill" id="show-bar-handling" style="width: 75%"></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 5. FIVE GAME MODES ARENA -->
        <section class="landing-section modes-section" id="section-modes">
          <div class="section-container">
            <div class="section-title-wrap text-center">
              <span class="section-tag-pill">MULTIPLE COMPETITIVE FORMATS</span>
              <h2 class="section-headline">RACE YOUR WAY</h2>
              <p class="section-desc">
                Whether mastering ergonomic finger posture solo or battling real racers across global lobbies, 
                KEYRUSH offers competitive arenas for every typing discipline.
              </p>
            </div>

            <div class="landing-modes-grid">
              <!-- Mode 1: Solo Practice -->
              <div class="landing-mode-card card-dark" data-nav="diagnostic">
                <div class="mode-top-row">
                  <span class="mode-badge purple">TRAINING</span>
                  <span class="mode-icon">🎯</span>
                </div>
                <h3 class="mode-card-title">Solo Practice</h3>
                <p class="mode-card-desc">
                  Train at your own pace without pressure. Zero in on finger agility, accuracy pacing, and personalized weak key drills.
                </p>
                <div class="mode-highlights">
                  <span>✓ 45s Diagnostic benchmark</span>
                  <span>✓ Detailed accuracy scorecard</span>
                </div>
                <button class="mode-action-link" data-nav="diagnostic">
                  Start Solo Practice →
                </button>
              </div>

              <!-- Mode 2: Race Against AI -->
              <div class="landing-mode-card card-dark active-featured" data-nav="race">
                <div class="mode-top-row">
                  <span class="mode-badge cyan">RECOMMENDED</span>
                  <span class="mode-icon">🤖</span>
                </div>
                <h3 class="mode-card-title">Race Against AI</h3>
                <p class="mode-card-desc">
                  Populated 5-car grid with autonomous AI opponents simulating human cadence variations, slipstream drafting, and overtakes.
                </p>
                <div class="mode-highlights">
                  <span>✓ 4 Simultaneous AI rivals</span>
                  <span>✓ 5 Difficulty tiers (Amateur to Apex)</span>
                </div>
                <button class="mode-action-link" data-nav="race">
                  Enter AI Race Grid →
                </button>
              </div>

              <!-- Mode 3: Local Multiplayer -->
              <div class="landing-mode-card card-dark" data-nav="race-modes">
                <div class="mode-top-row">
                  <span class="mode-badge green">OFFLINE CO-OP</span>
                  <span class="mode-icon">👥</span>
                </div>
                <h3 class="mode-card-title">Local Multiplayer</h3>
                <p class="mode-card-desc">
                  Challenge friends on the same device. Pass-and-play ghost racers with side-by-side telemetry and speed curves.
                </p>
                <div class="mode-highlights">
                  <span>✓ 100% Offline availability</span>
                  <span>✓ Instant rematch system</span>
                </div>
                <button class="mode-action-link" data-nav="race-modes">
                  Launch Local Race →
                </button>
              </div>

              <!-- Mode 4: Online Multiplayer -->
              <div class="landing-mode-card card-dark" data-nav="race-modes">
                <div class="mode-top-row">
                  <span class="mode-badge gold">ESPORTS LOBBY</span>
                  <span class="mode-icon">🌐</span>
                </div>
                <h3 class="mode-card-title">Online Multiplayer</h3>
                <p class="mode-card-desc">
                  Battle racers worldwide in synchronized race lobbies with live netcode telemetry, ping monitoring, and podium results.
                </p>
                <div class="mode-highlights">
                  <span>✓ Real-time spectator radar</span>
                  <span>✓ Worldwide matchmaking</span>
                </div>
                <button class="mode-action-link" data-nav="race-modes">
                  Join Online Lobby →
                </button>
              </div>

              <!-- Mode 5: Ranked Championship -->
              <div class="landing-mode-card card-dark" data-nav="leaderboard">
                <div class="mode-top-row">
                  <span class="mode-badge red">COMPETITIVE</span>
                  <span class="mode-icon">🏆</span>
                </div>
                <h3 class="mode-card-title">Ranked Championship</h3>
                <p class="mode-card-desc">
                  Compete in high-stakes ranked cups. Ascend league tiers from Bronze to Apex Legend to unlock legendary hypercars.
                </p>
                <div class="mode-highlights">
                  <span>✓ Global ranked standings</span>
                  <span>✓ Exclusive cosmetic liveries</span>
                </div>
                <button class="mode-action-link" data-nav="leaderboard">
                  View Ranked Tiers →
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 6. RANKED ESPORTS LEAGUES LADDER -->
        <section class="landing-section leagues-section" id="section-leagues">
          <div class="section-container">
            <div class="section-title-wrap">
              <span class="section-tag-pill">COMPETITIVE TIERS</span>
              <h2 class="section-headline">ASCEND THE ESPORTS LADDER</h2>
              <p class="section-desc">
                Every typed character is verified by local telemetry. Push your raw speed and consistency 
                to advance from the rookie paddock to the highest tier of motorsport typing.
              </p>
            </div>

            <div class="leagues-ladder-row">
              <div class="league-tier-card bronze">
                <span class="tier-icon">🥉</span>
                <span class="tier-title">BRONZE</span>
                <span class="tier-range font-mono">0 - 45 WPM</span>
                <p class="tier-desc">Mastering home-row keys & ergonomics.</p>
              </div>

              <div class="league-tier-card silver">
                <span class="tier-icon">🥈</span>
                <span class="tier-title">SILVER</span>
                <span class="tier-range font-mono">46 - 70 WPM</span>
                <p class="tier-desc">Developing continuous cadence & flow.</p>
              </div>

              <div class="league-tier-card gold">
                <span class="tier-icon">🥇</span>
                <span class="tier-title">GOLD</span>
                <span class="tier-range font-mono">71 - 90 WPM</span>
                <p class="tier-desc">High-speed precision with punctuation.</p>
              </div>

              <div class="league-tier-card platinum">
                <span class="tier-icon">💎</span>
                <span class="tier-title">PLATINUM</span>
                <span class="tier-range font-mono">91 - 110 WPM</span>
                <p class="tier-desc">Competitive esports tournament speed.</p>
              </div>

              <div class="league-tier-card diamond">
                <span class="tier-icon">✨</span>
                <span class="tier-title">DIAMOND</span>
                <span class="tier-range font-mono">111 - 130 WPM</span>
                <p class="tier-desc">Elite typing velocity under pressure.</p>
              </div>

              <div class="league-tier-card apex">
                <span class="tier-icon">👑</span>
                <span class="tier-title">APEX LEGEND</span>
                <span class="tier-range font-mono">131+ WPM</span>
                <p class="tier-desc">The absolute pinnacle of motorsport typing.</p>
              </div>
            </div>

            <!-- Global Leaderboard Teaser -->
            <div class="leaderboard-teaser-box card-dark">
              <div class="teaser-header">
                <div>
                  <span class="teaser-sub">GLOBAL TOP RACERS SNAPSHOT</span>
                  <h4 class="teaser-title">WORLD CHAMPIONSHIP STANDINGS</h4>
                </div>
                <button class="btn btn-outline" data-nav="leaderboard">
                  View Full Standings →
                </button>
              </div>

              <div class="teaser-table">
                <div class="teaser-row rank-1">
                  <span class="t-rank">👑 P1</span>
                  <span class="t-pilot">QuantumRacer (SE)</span>
                  <span class="t-car">CHRONOS V12</span>
                  <span class="t-wpm font-mono highlight-cyan">154 WPM</span>
                  <span class="t-acc font-mono">99.4%</span>
                </div>
                <div class="teaser-row rank-2">
                  <span class="t-rank">🥈 P2</span>
                  <span class="t-pilot">NeonSpectre (JP)</span>
                  <span class="t-car">NEBULA ZX</span>
                  <span class="t-wpm font-mono highlight-cyan">148 WPM</span>
                  <span class="t-acc font-mono">99.1%</span>
                </div>
                <div class="teaser-row rank-3">
                  <span class="t-rank">🥉 P3</span>
                  <span class="t-pilot">Veloce_God (US)</span>
                  <span class="t-car">PHANTOM GT</span>
                  <span class="t-wpm font-mono highlight-cyan">139 WPM</span>
                  <span class="t-acc font-mono">98.8%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 7. CORE ENGINEERING & FEATURES -->
        <section class="landing-section features-section" id="section-features">
          <div class="section-container">
            <div class="section-title-wrap text-center">
              <span class="section-tag-pill">ENGINEERED FOR MOTORSPORT PERFECTION</span>
              <h2 class="section-headline">STATE-OF-THE-ART SIMULATOR ARCHITECTURE</h2>
              <p class="section-desc">
                Built from the ground up for zero-latency competition, maximum visual immersion, 
                and comprehensive biomechanical typing improvement.
              </p>
            </div>

            <div class="features-cards-grid">
              <div class="feature-card card-dark">
                <div class="feat-card-icon">🏎️</div>
                <h4 class="feat-card-title">Three.js 3D Kinetic Engine</h4>
                <p class="feat-card-desc">
                  Procedural cyberpunk megacities, dynamic chase cameras, wet asphalt reflections, and tunnel archways designed for high frame rate rendering.
                </p>
              </div>

              <div class="feature-card card-dark">
                <div class="feat-card-icon">⚡</div>
                <h4 class="feat-card-title">Typing Cadence Acceleration</h4>
                <p class="feat-card-desc">
                  Typing speed directly modulates synthetic horsepower, gear shifts (1st through 6th), and exhaust flames. Mistypes trigger engine deceleration.
                </p>
              </div>

              <div class="feature-card card-dark">
                <div class="feat-card-icon">📶</div>
                <h4 class="feat-card-title">100% Offline-First (IndexedDB)</h4>
                <p class="feat-card-desc">
                  Complete offline autonomy. All session telemetry, garage customizations, academy drills, and streak milestones persist locally with zero server dependency.
                </p>
              </div>

              <div class="feature-card card-dark">
                <div class="feat-card-icon">🎓</div>
                <h4 class="feat-card-title">Ergonomic Touch Academy</h4>
                <p class="feat-card-desc">
                  Master the 10-finger home-row discipline. Color-coded finger zones and tactile bump guides eliminate sight-typing and skyrocket cadence.
                </p>
              </div>

              <div class="feature-card card-dark">
                <div class="feat-card-icon">📊</div>
                <h4 class="feat-card-title">Data Science Telemetry</h4>
                <p class="feat-card-desc">
                  Deep analytics with WPM progression charts, cadence stability scatter plots, keystroke error heatmaps, and downloadable verified pilot cards.
                </p>
              </div>

              <div class="feature-card card-dark">
                <div class="feat-card-icon">🔊</div>
                <h4 class="feat-card-title">Web Audio Synthesizer</h4>
                <p class="feat-card-desc">
                  Custom oscillator sound engine synthesizing mechanical switch click clacks, accelerating engine throttles, nitro burns, and ambient interior soundscapes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- 8. HIGH-ENERGY FINALE CTA -->
        <section class="landing-finale-cta">
          <div class="finale-glow-ring"></div>
          <div class="finale-card card-dark">
            <span class="section-tag-pill">THE STARTING GRID AWAITS</span>
            <h2 class="finale-headline">READY TO CLAIM POLE POSITION?</h2>
            <p class="finale-subhead">
              No installs, no accounts required. Launch directly into the 3D cockpit or open your 
              pilot dashboard to start your motorsport typing journey.
            </p>
            <div class="finale-btn-group">
              <button class="btn btn-primary btn-large glow-primary" data-nav="race">
                <span class="btn-play-triangle">▶</span>
                <span>ENTER 3D RACE COCKPIT</span>
                <span class="btn-arrow-right">→</span>
              </button>
              <button class="btn btn-secondary btn-large" data-nav="dashboard">
                <span>OPEN PILOT DASHBOARD ↗</span>
              </button>
            </div>
          </div>
        </section>

        <!-- 9. RESPONSIVE MODERN FOOTER -->
        <footer class="landing-footer">
          <div class="footer-inner">
            <div class="footer-col-brand">
              <div class="f-brand-logo">
                <span class="f-logo-bolt">⚡</span>
                <span class="f-logo-title">KEYRUSH</span>
              </div>
              <p class="f-brand-tagline">
                Next-Gen 3D Esports Motorsport Typing Simulator.<br>
                Type. Race. Dominate.
              </p>
              <div class="f-badges-row">
                <span class="f-badge">🌐 Works 100% Offline</span>
                <span class="f-badge">📱 Installable PWA</span>
                <span class="f-badge">💻 60 FPS Three.js</span>
              </div>
            </div>

            <div class="footer-col-nav">
              <span class="f-nav-title">GAME NAVIGATION</span>
              <a href="#section-hero" class="f-link">Showcase Overview</a>
              <button class="f-link-btn" data-nav="dashboard">Pilot Dashboard</button>
              <button class="f-link-btn" data-nav="race-modes">Race Modes Hub</button>
              <button class="f-link-btn" data-nav="garage">Supercar Garage</button>
              <button class="f-link-btn" data-nav="leaderboard">Global Leaderboard</button>
            </div>

            <div class="footer-col-nav">
              <span class="f-nav-title">TRAINING & LABS</span>
              <button class="f-link-btn" data-nav="diagnostic">45s Practice Benchmark</button>
              <button class="f-link-btn" data-nav="academy">Touch-Typing Academy</button>
              <button class="f-link-btn" data-nav="analytics">Telemetry Analytics</button>
              <button class="f-link-btn" data-nav="missions">Daily Directives</button>
              <button class="f-link-btn" data-nav="settings">Audio & System Settings</button>
            </div>

            <div class="footer-col-shortcuts">
              <span class="f-nav-title">KEYBOARD CONTROLS</span>
              <div class="f-shortcut-item">
                <kbd>Ctrl + K</kbd>
                <span>Command Search Palette</span>
              </div>
              <div class="f-shortcut-item">
                <kbd>ESC</kbd>
                <span>Pause Race & Cockpit HUD</span>
              </div>
              <div class="f-shortcut-item">
                <kbd>Space</kbd>
                <span>Smooth Passage Advance</span>
              </div>
            </div>
          </div>

          <div class="footer-bottom-bar">
            <span>© 2026 KEYRUSH Motorsport Esports. All rights reserved. Zero external tracking.</span>
            <span class="f-crown">👑 Level Up Your Typing Speed</span>
          </div>
        </footer>
      </div>
    `;

    this.initDemoPrompt();
    this.bindEvents();
  }

  initDemoPrompt() {
    const box = document.getElementById('demo-prompt-box');
    if (!box) return;

    box.innerHTML = this.demoText.split('').map((ch, idx) => {
      const displayChar = ch === ' ' ? '&nbsp;' : ch;
      return `<span class="demo-char ${idx === 0 ? 'current' : ''}" data-idx="${idx}">${displayChar}</span>`;
    }).join('');
  }

  bindEvents() {
    // 1. Navigation items delegation
    this.container.querySelectorAll('[data-nav]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetScreen = btn.getAttribute('data-nav');
        soundEffects.playKeyClick(true);
        if (targetScreen === 'race') {
          soundEffects.playNitroBoost();
        }
        this.app.showScreen(targetScreen);
      });
    });

    // Audio quick toggle in landing navbar
    const audioBtn = document.getElementById('landing-audio-toggle');
    const updateAudioBtnUI = (isMuted) => {
      const text = document.getElementById('landing-audio-text');
      const icon = audioBtn?.querySelector('.audio-btn-icon');
      if (!audioBtn || !text) return;
      if (!isMuted) {
        audioBtn.classList.remove('muted');
        text.textContent = 'MUSIC ON';
        if (icon) icon.textContent = '🔊';
      } else {
        audioBtn.classList.add('muted');
        text.textContent = 'MUTED';
        if (icon) icon.textContent = '🔇';
      }
    };

    audioBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      soundEffects.playUiClick();
      const isMuted = await musicManager.toggleMute(true);
      updateAudioBtnUI(isMuted);
    });

    window.addEventListener('keyrush:audio-toggle', (e) => {
      updateAudioBtnUI(e.detail.muted);
    });
    updateAudioBtnUI(musicManager.muted);

    // 2. Smooth anchor scrolling for navigation links
    this.container.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.container.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
          }
        }
      });
    });

    // 3. Interactive Showroom Car Selection
    const carListBtns = this.container.querySelectorAll('.car-nav-item');
    const cars = VEHICLE_CATALOG || [];

    carListBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-car-idx'));
        this.activeCarIndex = idx;
        soundEffects.playKeyClick(true);

        carListBtns.forEach(b => b.classList.toggle('active', b === btn));
        const car = cars[idx];
        if (!car) return;

        // Update presentation elements
        const titleEl = document.getElementById('show-car-title');
        const rarityEl = document.getElementById('show-car-rarity');
        const descEl = document.getElementById('show-car-desc');
        const speedEl = document.getElementById('show-car-speed');
        const accelEl = document.getElementById('show-car-accel');
        const handlingEl = document.getElementById('show-car-handling');
        const barSpeed = document.getElementById('show-bar-speed');
        const barAccel = document.getElementById('show-bar-accel');
        const barHandling = document.getElementById('show-bar-handling');
        const glowEl = document.getElementById('showroom-glow');

        if (titleEl) titleEl.textContent = car.name;
        if (rarityEl) {
          rarityEl.className = `car-rarity-pill ${car.rarity.toLowerCase()}`;
          rarityEl.textContent = `${car.rarity.toUpperCase()} • ${car.tier.toUpperCase()}`;
        }
        if (descEl) descEl.textContent = car.description;
        if (speedEl) speedEl.textContent = car.baseTopSpeed;
        if (accelEl) accelEl.textContent = car.acceleration;
        if (handlingEl) handlingEl.textContent = car.handling;

        const speedPerc = [45, 60, 75, 88, 98][idx] || 50;
        const accelPerc = [55, 65, 80, 92, 99][idx] || 60;
        const gripPerc = [65, 70, 85, 94, 99][idx] || 70;
        const glowColors = ['#00D9FF', '#8B35FF', '#FF3500', '#10B981', '#FFB800'];

        if (barSpeed) barSpeed.style.width = `${speedPerc}%`;
        if (barAccel) barAccel.style.width = `${accelPerc}%`;
        if (barHandling) barHandling.style.width = `${gripPerc}%`;
        if (glowEl) glowEl.style.background = glowColors[idx] || '#00D9FF';
      });
    });

    // 4. Interactive Live Sprint Demo Logic
    const demoInput = document.getElementById('demo-typing-input');
    const demoResetBtn = document.getElementById('demo-reset-btn');

    if (demoInput) {
      demoInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const lastChar = val.slice(-1);
        e.target.value = ''; // clear for next character

        if (this.demoCompleted || !lastChar) return;

        if (!this.demoStartTime) {
          this.demoStartTime = performance.now();
          const stateEl = document.getElementById('demo-engine-state');
          if (stateEl) {
            stateEl.textContent = 'ACCELERATING';
            stateEl.className = 'engine-state-pill accelerating';
          }
        }

        const expectedChar = this.demoText[this.typedChars];
        const charSpans = this.container.querySelectorAll('.demo-char');

        if (lastChar === expectedChar) {
          soundEffects.playKeyClick(true);
          if (charSpans[this.typedChars]) {
            charSpans[this.typedChars].className = 'demo-char correct';
          }
          this.typedChars++;

          if (charSpans[this.typedChars]) {
            charSpans[this.typedChars].className = 'demo-char current';
          }

          // Calculate WPM and Runway progress
          const elapsedMin = (performance.now() - this.demoStartTime) / 60000;
          this.demoWpm = Math.max(15, Math.round((this.typedChars / 5) / (elapsedMin || 0.01)));
          const kmh = Math.round(this.demoWpm * 2.6);

          const wpmEl = document.getElementById('demo-wpm-val');
          const kmhEl = document.getElementById('demo-kmh-val');
          if (wpmEl) wpmEl.textContent = this.demoWpm;
          if (kmhEl) kmhEl.textContent = kmh;

          // Move runway car forward
          const progressPerc = Math.min(94, (this.typedChars / this.demoText.length) * 92 + 2);
          const runwayCar = document.getElementById('demo-runway-car');
          if (runwayCar) runwayCar.style.left = `${progressPerc}%`;

          // Check completion
          if (this.typedChars >= this.demoText.length) {
            this.demoCompleted = true;
            soundEffects.playVictoryFanfare();
            const winToast = document.getElementById('demo-win-toast');
            const winStats = document.getElementById('demo-win-stats');
            const stateEl = document.getElementById('demo-engine-state');
            if (winToast) winToast.classList.remove('hidden');
            if (winStats) winStats.textContent = `Sprint completed at ${this.demoWpm} WPM with 100% precision. You qualify for Tier 3 PRO Circuit!`;
            if (stateEl) {
              stateEl.textContent = 'POLE POSITION';
              stateEl.className = 'engine-state-pill pole';
            }
          }
        } else {
          // Error feedback
          soundEffects.playKeyClick(false);
          if (charSpans[this.typedChars]) {
            charSpans[this.typedChars].classList.add('error');
            setTimeout(() => charSpans[this.typedChars]?.classList.remove('error'), 300);
          }
        }
      });
    }

    // Reset Demo Button
    demoResetBtn?.addEventListener('click', () => {
      this.typedChars = 0;
      this.demoStartTime = null;
      this.demoWpm = 0;
      this.demoCompleted = false;

      const wpmEl = document.getElementById('demo-wpm-val');
      const kmhEl = document.getElementById('demo-kmh-val');
      const winToast = document.getElementById('demo-win-toast');
      const runwayCar = document.getElementById('demo-runway-car');
      const stateEl = document.getElementById('demo-engine-state');

      if (wpmEl) wpmEl.textContent = '0';
      if (kmhEl) kmhEl.textContent = '0';
      if (winToast) winToast.classList.add('hidden');
      if (runwayCar) runwayCar.style.left = '2%';
      if (stateEl) {
        stateEl.textContent = 'READY ON GRID';
        stateEl.className = 'engine-state-pill';
      }

      this.initDemoPrompt();
      if (demoInput) demoInput.focus();
    });

    // 5. Hero 3D Car subtle parallax tilt on mouse move
    const heroStage = document.querySelector('.hero-visual-stage');
    const heroImg = document.getElementById('hero-car-img');

    if (heroStage && heroImg) {
      heroStage.addEventListener('mousemove', (e) => {
        const rect = heroStage.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        heroImg.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) scale(1.02)`;
      });

      heroStage.addEventListener('mouseleave', () => {
        heroImg.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
      });
    }
  }

  dispose() {
    // cleanup
  }
}
