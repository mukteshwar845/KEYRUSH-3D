/**
 * KeyRush Supercar Garage & Customization Studio (Screen 08)
 * Redesigned to match the reference specifications:
 * - Left Stage: Hero Spotlight with 3D/Studio car presentation, specs, Drive Now CTA, carousel arrows
 * - Bottom: "MY COLLECTION" shelf with category tabs (All Cars, Supercar, Hypercar, Muscle, etc.)
 * - Right: "CUSTOMIZE YOUR RIDE" panel with Color/Design/Wheels/Effects tabs, 14 swatches, live stats & tier card
 */

import { Garage3D } from '../graphics/garage3D.js';
import { VEHICLE_CATALOG } from '../graphics/carModels.js';
import { storage } from '../db/storage.js';
import { soundEffects } from '../audio/soundEffects.js';

export const COLOR_PALETTE = [
  { hex: '#00D9FF', name: 'Neon Blue' },
  { hex: '#147BFF', name: 'Cobalt Blue' },
  { hex: '#EC4899', name: 'Electric Pink' },
  { hex: '#EF4444', name: 'Crimson Red' },
  { hex: '#F97316', name: 'Sunset Orange' },
  { hex: '#EAB308', name: 'Cyber Yellow' },
  { hex: '#22C55E', name: 'Acid Green' },
  { hex: '#38BDF8', name: 'Sky Blue' },
  { hex: '#A855F7', name: 'Neon Violet' },
  { hex: '#DB2777', name: 'Orchid Magenta' },
  { hex: '#FB923C', name: 'Coral Rose' },
  { hex: '#262E3D', name: 'Stealth Charcoal' },
  { hex: '#8A99AD', name: 'Titanium Slate' },
  { hex: '#F8FAFC', name: 'Glacier White' }
];

export class GarageView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.garage3D = null;
    this.garageData = null;
    this.selectedCarIndex = 0;
    this.selectedCarId = 'talon';
    this.activeCategory = 'all';
    this.activeCustomizerTab = 'color';
    this.currentPaint = '#00D9FF';
    this.currentUnderglow = '#A855F7';
    this.is3DMode = false;
  }

  async render() {
    this.garageData = (await storage.getGarage()) || {};
    const equippedCarId = this.garageData?.activeVehicleId || 'talon';

    // Ensure all vehicles have unlocked state checked (Apex Talon unlocked by default)
    const unlockedSet = new Set(this.garageData?.unlockedVehicles || ['talon']);

    // Set selected index to equipped car or default 0
    const initialIndex = VEHICLE_CATALOG.findIndex(
      (c) => c.id === (this.selectedCarId || equippedCarId)
    );
    this.selectedCarIndex = initialIndex >= 0 ? initialIndex : 0;
    const activeCar = VEHICLE_CATALOG[this.selectedCarIndex] || VEHICLE_CATALOG[0];
    this.selectedCarId = activeCar.id;

    this.currentPaint = this.garageData?.paintColor || '#00D9FF';
    this.currentUnderglow = this.garageData?.underglowColor || '#A855F7';

    this.container.innerHTML = `
      <div class="garage-viewport-root">
        <div class="garage-two-col-layout">
          
          <!-- LEFT / CENTER COLUMN: HERO SPOTLIGHT + MY COLLECTION -->
          <div class="garage-center-column">
            
            <!-- 1. HERO SPOTLIGHT STAGE -->
            <section class="garage-hero-stage" id="garage-hero-stage">
              <!-- Stage Header Overlay -->
              <div class="stage-header-overlay">
                <span class="stage-kicker">GARAGE</span>
                <span class="stage-sub-kicker">Your Ride. Your Style. Your Rules.</span>
                
                <div class="stage-car-title-row">
                  <h1 class="stage-car-name" id="stage-car-name">${activeCar.name.toUpperCase()}</h1>
                  <span class="stage-rarity-pill ${activeCar.rarity.toLowerCase()}" id="stage-rarity-pill">${activeCar.rarity.toUpperCase()}</span>
                </div>
                
                <p class="stage-tagline" id="stage-tagline">${activeCar.tagline || activeCar.description}</p>
                
                <!-- Quick Specs Row -->
                <div class="stage-quick-specs" id="stage-quick-specs">
                  <div class="quick-spec-item">
                    <span class="spec-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B8EA8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="2" y="6" width="20" height="8" rx="2"></rect>
                        <circle cx="6" cy="17" r="2"></circle>
                        <circle cx="18" cy="17" r="2"></circle>
                        <path d="M6 6V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2"></path>
                      </svg>
                    </span>
                    <div class="spec-text">
                      <span class="spec-label">Speed</span>
                      <strong class="spec-val" id="spec-speed-val">${activeCar.baseTopSpeed}</strong>
                    </div>
                  </div>
                  <div class="quick-spec-item">
                    <span class="spec-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B8EA8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                    </span>
                    <div class="spec-text">
                      <span class="spec-label">Acceleration</span>
                      <strong class="spec-val" id="spec-accel-val">${activeCar.acceleration}</strong>
                    </div>
                  </div>
                  <div class="quick-spec-item">
                    <span class="spec-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B8EA8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="m4.93 4.93 4.24 4.24"></path>
                        <path d="m14.83 9.17 4.24-4.24"></path>
                        <path d="m14.83 14.83 4.24 4.24"></path>
                        <path d="m9.17 14.83-4.24 4.24"></path>
                        <circle cx="12" cy="12" r="2"></circle>
                      </svg>
                    </span>
                    <div class="spec-text">
                      <span class="spec-label">Handling</span>
                      <strong class="spec-val" id="spec-handling-val">${activeCar.handling}</strong>
                    </div>
                  </div>
                </div>

                <!-- Action CTA Group -->
                <div class="stage-actions-group">
                  <button class="stage-btn-primary glow-purple" id="btn-stage-drive">
                    <span>+ Drive Now →</span>
                  </button>
                  <button class="stage-btn-secondary" id="btn-stage-details">
                    <span>+ View Details</span>
                  </button>
                  <button class="stage-btn-toggle-3d" id="btn-toggle-3d" title="Toggle Interactive 3D Turntable">
                    <span>${this.is3DMode ? '📸 Studio View' : '🔄 3D Orbit'}</span>
                  </button>
                </div>
              </div>

              <!-- Main Stage Visual (Studio Backdrop / Realistic Render + Optional 3D Canvas) -->
              <div class="stage-visual-container">
                <img 
                  src="${activeCar.image || '/images/cars/garage-hero-car.jpg'}" 
                  alt="${activeCar.name}" 
                  class="stage-hero-car-img ${this.is3DMode ? 'hidden' : ''}" 
                  id="stage-hero-car-img"
                />
                
                <!-- 3D Orbit Canvas Container -->
                <div id="garage-3d-canvas" class="stage-3d-canvas-wrap ${this.is3DMode ? 'active' : 'hidden'}"></div>
              </div>

              <!-- Navigation Carousel Arrows -->
              <button class="stage-nav-arrow arrow-prev" id="stage-prev-car" aria-label="Previous Car">‹</button>
              <button class="stage-nav-arrow arrow-next" id="stage-next-car" aria-label="Next Car">›</button>

              <!-- Pagination Indicators -->
              <div class="stage-pagination-dots" id="stage-pagination-dots">
                ${VEHICLE_CATALOG.map(
                  (_, idx) => `
                  <span class="stage-dash-dot ${idx === this.selectedCarIndex ? 'active' : ''}" data-index="${idx}"></span>
                `
                ).join('')}
              </div>
            </section>

            <!-- 2. MY COLLECTION HORIZONTAL SHELF -->
            <section class="garage-collection-section">
              <div class="collection-section-header">
                <div class="collection-title-wrap">
                  <h2 class="collection-heading">MY COLLECTION</h2>
                  <span class="collection-counter-badge" id="collection-counter">
                    8 / 25 UNLOCKED
                  </span>
                </div>

                <!-- Category Filter Tabs -->
                <div class="collection-category-tabs">
                  <button class="cat-tab-btn active" data-cat="all">All Cars</button>
                  <button class="cat-tab-btn" data-cat="supercar">Supercar</button>
                  <button class="cat-tab-btn" data-cat="hypercar">Hypercar</button>
                  <button class="cat-tab-btn" data-cat="muscle">Muscle</button>
                  <button class="cat-tab-btn" data-cat="sports">Sports</button>
                  <button class="cat-tab-btn" data-cat="electric">Electric</button>
                </div>
              </div>

              <!-- Cars Cards Carousel Container with Vertical Stack Controls -->
              <div class="collection-shelf-row">
                <div class="collection-cards-track" id="collection-cards-track">
                  ${this.renderCollectionCards(unlockedSet, equippedCarId)}
                </div>

                <!-- Shelf Vertical Scroll Controls -->
                <div class="shelf-stacked-controls">
                  <button class="shelf-circle-btn" id="shelf-scroll-left" aria-label="Scroll Left">‹</button>
                  <button class="shelf-circle-btn" id="shelf-scroll-right" aria-label="Scroll Right">›</button>
                </div>
              </div>
            </section>
          </div>

          <!-- RIGHT COLUMN: CUSTOMIZE YOUR RIDE PANEL -->
          <aside class="garage-inspector-column">
            <div class="customizer-card-box">
              <h3 class="customizer-title">CUSTOMIZE YOUR RIDE</h3>

              <!-- Top Customizer Tabs (Color, Design, Wheels, Effects) -->
              <div class="customizer-tabs-nav">
                <button class="cust-tab-btn active" data-tab="color">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: -1px;">
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
                  </svg>
                  Color
                </button>
                <button class="cust-tab-btn" data-tab="design">Design</button>
                <button class="cust-tab-btn" data-tab="wheels">Wheels</button>
                <button class="cust-tab-btn" data-tab="effects">Effects</button>
              </div>

              <!-- TAB CONTENT: COLOR SWATCHES -->
              <div class="customizer-tab-content" id="tab-content-color">
                <div class="swatches-grid-container" id="garage-swatches-grid">
                  ${COLOR_PALETTE.map((c) => {
                    const isSelected = this.currentPaint.toLowerCase() === c.hex.toLowerCase();
                    return `
                      <button 
                        class="garage-color-swatch ${isSelected ? 'selected' : ''}" 
                        style="background: ${c.hex};" 
                        data-hex="${c.hex}" 
                        data-name="${c.name}"
                        title="${c.name}"
                      >
                        ${isSelected ? '<span class="swatch-check">✓</span>' : ''}
                      </button>
                    `;
                  }).join('')}
                </div>

                <!-- Selected Color Feedback Pill -->
                <div class="selected-color-bar" id="selected-color-bar">
                  <div class="selected-color-left">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                    </svg>
                    <span class="selected-color-name" id="selected-color-name">${this.getColorName(this.currentPaint)}</span>
                  </div>
                  <span class="applied-badge">✓ Applied</span>
                </div>
              </div>

              <!-- CAR STATS SECTION -->
              <div class="customizer-stats-section">
                <h4 class="stats-section-title">CAR STATS</h4>
                
                <div class="stat-progress-item">
                  <div class="stat-meta-row">
                    <span class="stat-meta-label">Speed</span>
                    <span class="stat-meta-val font-mono" id="stat-val-speed">${activeCar.speedVal || 320}</span>
                  </div>
                  <div class="stat-bar-track">
                    <div class="stat-bar-fill fill-blue" id="stat-bar-speed" style="width: ${Math.min(100, (activeCar.speedVal / 380) * 100)}%;"></div>
                  </div>
                </div>

                <div class="stat-progress-item">
                  <div class="stat-meta-row">
                    <span class="stat-meta-label">Acceleration</span>
                    <span class="stat-meta-val font-mono" id="stat-val-accel">${activeCar.accelVal || 95}</span>
                  </div>
                  <div class="stat-bar-track">
                    <div class="stat-bar-fill fill-cyan" id="stat-bar-accel" style="width: ${activeCar.accelVal || 95}%;"></div>
                  </div>
                </div>

                <div class="stat-progress-item">
                  <div class="stat-meta-row">
                    <span class="stat-meta-label">Handling</span>
                    <span class="stat-meta-val font-mono" id="stat-val-handling">${activeCar.handlingVal || 98}</span>
                  </div>
                  <div class="stat-bar-track">
                    <div class="stat-bar-fill fill-cyan" id="stat-bar-handling" style="width: ${activeCar.handlingVal || 98}%;"></div>
                  </div>
                </div>

                <div class="stat-progress-item">
                  <div class="stat-meta-row">
                    <span class="stat-meta-label">Nitro</span>
                    <span class="stat-meta-val font-mono" id="stat-val-nitro">${activeCar.nitroVal || 85}</span>
                  </div>
                  <div class="stat-bar-track">
                    <div class="stat-bar-fill fill-purple" id="stat-bar-nitro" style="width: ${activeCar.nitroVal || 85}%;"></div>
                  </div>
                </div>
              </div>

              <!-- TIER BADGE INFO CARD -->
              <div class="customizer-tier-card" id="customizer-tier-card">
                <div class="tier-icon-box">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#A855F7" stroke="#C084FC" stroke-width="1.5"/>
                    <path d="M2 17L12 22L22 17" stroke="#A855F7" stroke-width="1.5"/>
                    <path d="M2 12L12 17L22 12" stroke="#A855F7" stroke-width="1.5"/>
                  </svg>
                </div>
                <div class="tier-text-wrap">
                  <strong class="tier-card-title" id="tier-card-title">${activeCar.rarity}</strong>
                  <span class="tier-card-desc">Highest performance tier</span>
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    `;

    setTimeout(() => {
      this.bindEvents();
    }, 40);
  }

  renderCollectionCards(unlockedSet, equippedCarId) {
    const filteredCars =
      this.activeCategory === 'all'
        ? VEHICLE_CATALOG
        : VEHICLE_CATALOG.filter(
            (c) => (c.category || '').toLowerCase() === this.activeCategory.toLowerCase()
          );

    return filteredCars
      .map((car, idx) => {
        const isSelected = this.selectedCarId === car.id;
        const isEquipped = equippedCarId === car.id;
        const isUnlocked = unlockedSet.has(car.id) || isEquipped || car.unlocked;

        return `
        <div 
          class="collection-car-card ${isSelected ? 'active-spotlight' : ''} ${!isUnlocked ? 'is-locked' : ''}" 
          data-car-id="${car.id}"
          data-index="${idx}"
        >
          <div class="card-top-meta">
            <span class="card-rarity-badge ${car.rarity.toLowerCase()}">${car.rarity.toUpperCase()}</span>
            ${isSelected ? '<span class="card-star-icon">★</span>' : ''}
          </div>

          <div class="card-image-box">
            <img src="${car.image || '/images/cars/garage-hero-car.jpg'}" alt="${car.name}" class="card-car-thumb" />
          </div>

          <div class="card-body-info">
            <h4 class="card-car-name">${car.name}</h4>
            <span class="card-car-sub">Performance ⚡</span>
          </div>

          <div class="card-action-slot">
            ${
              isEquipped
                ? `<button class="card-state-btn btn-selected" data-action="equip">✓ Selected</button>`
                : isUnlocked
                  ? `<button class="card-state-btn btn-equip" data-action="equip">Equip</button>`
                  : `<button class="card-state-btn btn-locked" data-action="unlock">🔒 Unlock</button>`
            }
          </div>
        </div>
      `;
      })
      .join('');
  }

  getColorName(hex) {
    const match = COLOR_PALETTE.find((c) => c.hex.toLowerCase() === hex.toLowerCase());
    return match ? match.name : 'Custom Finish';
  }

  updateSpotlight(carIndex) {
    if (carIndex < 0 || carIndex >= VEHICLE_CATALOG.length) return;
    this.selectedCarIndex = carIndex;
    const car = VEHICLE_CATALOG[carIndex];
    this.selectedCarId = car.id;

    // 1. Stage Info
    const nameEl = document.getElementById('stage-car-name');
    const rarityEl = document.getElementById('stage-rarity-pill');
    const taglineEl = document.getElementById('stage-tagline');
    const speedEl = document.getElementById('spec-speed-val');
    const accelEl = document.getElementById('spec-accel-val');
    const handlingEl = document.getElementById('spec-handling-val');
    const imgEl = document.getElementById('stage-hero-car-img');

    if (nameEl) nameEl.textContent = car.name.toUpperCase();
    if (rarityEl) {
      rarityEl.textContent = car.rarity.toUpperCase();
      rarityEl.className = `stage-rarity-pill ${car.rarity.toLowerCase()}`;
    }
    if (taglineEl) taglineEl.textContent = car.tagline || car.description;
    if (speedEl) speedEl.textContent = car.baseTopSpeed;
    if (accelEl) accelEl.textContent = car.acceleration;
    if (handlingEl) handlingEl.textContent = car.handling;
    if (imgEl && car.image) {
      imgEl.src = car.image;
      imgEl.alt = car.name;
    }

    // 2. Pagination dots
    document.querySelectorAll('.stage-dash-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === carIndex);
    });

    // 3. Right Panel Stats Bars
    const statSpeedVal = document.getElementById('stat-val-speed');
    const statAccelVal = document.getElementById('stat-val-accel');
    const statHandlingVal = document.getElementById('stat-val-handling');
    const statNitroVal = document.getElementById('stat-val-nitro');

    const barSpeed = document.getElementById('stat-bar-speed');
    const barAccel = document.getElementById('stat-bar-accel');
    const barHandling = document.getElementById('stat-bar-handling');
    const barNitro = document.getElementById('stat-bar-nitro');

    if (statSpeedVal) statSpeedVal.textContent = car.speedVal || 320;
    if (statAccelVal) statAccelVal.textContent = car.accelVal || 95;
    if (statHandlingVal) statHandlingVal.textContent = car.handlingVal || 98;
    if (statNitroVal) statNitroVal.textContent = car.nitroVal || 85;

    if (barSpeed) barSpeed.style.width = `${Math.min(100, (car.speedVal / 380) * 100)}%`;
    if (barAccel) barAccel.style.width = `${car.accelVal || 95}%`;
    if (barHandling) barHandling.style.width = `${car.handlingVal || 98}%`;
    if (barNitro) barNitro.style.width = `${car.nitroVal || 85}%`;

    // 4. Tier card title
    const tierTitle = document.getElementById('tier-card-title');
    if (tierTitle) tierTitle.textContent = car.rarity;

    // 5. Update collection card active state
    document.querySelectorAll('.collection-car-card').forEach((c) => {
      c.classList.toggle('active-spotlight', c.getAttribute('data-car-id') === car.id);
    });

    // If 3D is active, reload mesh
    if (this.is3DMode && this.garage3D) {
      this.garage3D.loadCar(car.id, this.currentPaint, this.currentUnderglow);
    }
  }

  async equipCar(carId) {
    this.garageData.activeVehicleId = carId;
    await storage.saveGarage(this.garageData);
    soundEffects.playVictoryFanfare();

    // Update collection cards visually
    const unlockedSet = new Set(
      this.garageData?.unlockedVehicles || ['talon', 'vortex', 'chronos']
    );
    const track = document.getElementById('collection-cards-track');
    if (track) {
      track.innerHTML = this.renderCollectionCards(unlockedSet, carId);
      this.bindCardEvents();
    }

    // Update user's active vehicle in header
    this.app.updateHeader();
  }

  bindEvents() {
    // Stage previous / next arrows
    document.getElementById('stage-prev-car')?.addEventListener('click', () => {
      soundEffects.playUiClick();
      const prevIdx = (this.selectedCarIndex - 1 + VEHICLE_CATALOG.length) % VEHICLE_CATALOG.length;
      this.updateSpotlight(prevIdx);
    });

    document.getElementById('stage-next-car')?.addEventListener('click', () => {
      soundEffects.playUiClick();
      const nextIdx = (this.selectedCarIndex + 1) % VEHICLE_CATALOG.length;
      this.updateSpotlight(nextIdx);
    });

    // Pagination dots
    document.querySelectorAll('.stage-dash-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        soundEffects.playUiClick();
        this.updateSpotlight(idx);
      });
    });

    // Drive Now Button -> launches 3D race with selected vehicle
    document.getElementById('btn-stage-drive')?.addEventListener('click', async () => {
      soundEffects.playNitroBoost();
      await this.equipCar(this.selectedCarId);
      this.app.showScreen('race');
    });

    // View Details Button -> highlights stats and plays acoustic click
    document.getElementById('btn-stage-details')?.addEventListener('click', () => {
      soundEffects.playUiClick();
      const car = VEHICLE_CATALOG[this.selectedCarIndex];
      alert(
        `🏎️ ${car.name.toUpperCase()} TECHNICAL TELEMETRY:\n\n• Tier: ${car.tier}\n• Top Speed: ${car.baseTopSpeed}\n• 0-100 km/h: ${car.acceleration}\n• Cornering Aero Grip: ${car.handling}\n• Nitro Boost: ${car.nitroVal}%\n• Category: ${car.category}\n\n${car.description}`
      );
    });

    // Toggle 3D Mode vs Studio View
    document.getElementById('btn-toggle-3d')?.addEventListener('click', () => {
      soundEffects.playUiClick();
      this.is3DMode = !this.is3DMode;
      const img = document.getElementById('stage-hero-car-img');
      const canvasWrap = document.getElementById('garage-3d-canvas');
      const toggleBtn = document.getElementById('btn-toggle-3d');

      if (this.is3DMode) {
        if (img) img.classList.add('hidden');
        if (canvasWrap) {
          canvasWrap.classList.remove('hidden');
          canvasWrap.classList.add('active');
        }
        if (toggleBtn) toggleBtn.innerHTML = '<span>📸 Studio View</span>';
        if (!this.garage3D && canvasWrap) {
          this.garage3D = new Garage3D(canvasWrap);
        }
        if (this.garage3D) {
          this.garage3D.loadCar(this.selectedCarId, this.currentPaint, this.currentUnderglow);
        }
      } else {
        if (img) img.classList.remove('hidden');
        if (canvasWrap) {
          canvasWrap.classList.add('hidden');
          canvasWrap.classList.remove('active');
        }
        if (toggleBtn) toggleBtn.innerHTML = '<span>🔄 3D Orbit</span>';
      }
    });

    // Category filter tabs
    document.querySelectorAll('.cat-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundEffects.playUiClick();
        document.querySelectorAll('.cat-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        this.activeCategory = btn.getAttribute('data-cat') || 'all';
        const unlockedSet = new Set(
          this.garageData?.unlockedVehicles || ['talon', 'vortex', 'chronos']
        );
        const equippedCarId = this.garageData?.activeVehicleId || 'talon';

        const track = document.getElementById('collection-cards-track');
        if (track) {
          track.innerHTML = this.renderCollectionCards(unlockedSet, equippedCarId);
          this.bindCardEvents();
        }
      });
    });

    // Shelf horizontal scroll buttons
    const track = document.getElementById('collection-cards-track');
    document.getElementById('shelf-scroll-left')?.addEventListener('click', () => {
      soundEffects.playUiClick();
      track?.scrollBy({ left: -260, behavior: 'smooth' });
    });
    document.getElementById('shelf-scroll-right')?.addEventListener('click', () => {
      soundEffects.playUiClick();
      track?.scrollBy({ left: 260, behavior: 'smooth' });
    });

    // Customizer tabs (Color, Design, Wheels, Effects)
    document.querySelectorAll('.cust-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        soundEffects.playUiClick();
        document.querySelectorAll('.cust-tab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCustomizerTab = btn.getAttribute('data-tab');
      });
    });

    // Color Swatches
    document.querySelectorAll('.garage-color-swatch').forEach((swatch) => {
      swatch.addEventListener('click', async () => {
        const hex = swatch.getAttribute('data-hex');
        const name = swatch.getAttribute('data-name');
        soundEffects.playUiClick();

        this.currentPaint = hex;
        this.garageData.paintColor = hex;
        await storage.saveGarage(this.garageData);

        // Update active swatch
        document.querySelectorAll('.garage-color-swatch').forEach((s) => {
          s.classList.remove('selected');
          s.innerHTML = '';
        });
        swatch.classList.add('selected');
        swatch.innerHTML = '<span class="swatch-check">✓</span>';

        // Update feedback bar
        const dot = document.getElementById('selected-color-dot');
        const nameEl = document.getElementById('selected-color-name');
        if (dot) dot.style.background = hex;
        if (nameEl) nameEl.textContent = name;

        // If 3D mesh is active, apply real-time paint
        if (this.garage3D) {
          this.garage3D.updatePaint(hex);
        }
      });
    });

    this.bindCardEvents();
  }

  bindCardEvents() {
    // Collection card click -> updates spotlight
    document.querySelectorAll('.collection-car-card').forEach((card) => {
      card.addEventListener('click', async (e) => {
        const carId = card.getAttribute('data-car-id');
        const carIndex = VEHICLE_CATALOG.findIndex((c) => c.id === carId);

        // Check if user clicked action button
        const actionBtn = e.target.closest('.card-state-btn');
        if (actionBtn) {
          const action = actionBtn.getAttribute('data-action');
          if (action === 'equip') {
            await this.equipCar(carId);
          } else if (action === 'unlock') {
            const car = VEHICLE_CATALOG.find((c) => c.id === carId);
            soundEffects.playUiClick();
            const shouldUnlock = confirm(
              `🔒 ${car.name} Unlock Requirement:\n\n${car.unlockCondition}\n\nWould you like to unlock this vehicle now for your collection?`
            );
            if (shouldUnlock) {
              const currentUnlocked = this.garageData?.unlockedVehicles || ['talon', 'vortex'];
              if (!currentUnlocked.includes(carId)) {
                currentUnlocked.push(carId);
                this.garageData.unlockedVehicles = currentUnlocked;
                await storage.saveGarage(this.garageData);
                soundEffects.playVictoryFanfare();
                await this.equipCar(carId);
              }
            }
          }
        } else {
          soundEffects.playUiClick();
        }

        if (carIndex >= 0) {
          this.updateSpotlight(carIndex);
        }
      });
    });
  }

  dispose() {
    if (this.garage3D) {
      this.garage3D.dispose();
      this.garage3D = null;
    }
  }
}
