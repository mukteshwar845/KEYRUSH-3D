/**
 * KeyRush 3D Vehicle Garage & Customization Studio (Screen 08)
 * 3D turntable showroom, car collection selector, paint swatches,
 * neon underglow customization, and unlock criteria inspector.
 */

import { Garage3D } from '../graphics/garage3D.js';
import { VEHICLE_CATALOG } from '../graphics/carModels.js';
import { storage } from '../db/storage.js';
import { soundEffects } from '../audio/soundEffects.js';

export class GarageView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.garage3D = null;
    this.garageData = null;
    this.selectedCarId = 'talon';
    this.currentPaint = '#00e5ff';
    this.currentUnderglow = '#a855f7';
  }

  async render() {
    this.garageData = await storage.getGarage();
    this.selectedCarId = this.garageData?.activeVehicleId || 'talon';
    this.currentPaint = this.garageData?.paintColor || '#00e5ff';
    this.currentUnderglow = this.garageData?.underglowColor || '#a855f7';

    const unlockedSet = new Set(this.garageData?.unlockedVehicles || ['talon', 'vortex']);

    this.container.innerHTML = `
      <div class="garage-screen-wrapper">
        <div class="garage-layout-main">
          <!-- 3D SHOWROOM CANVAS -->
          <div class="garage-viewport-panel card-dark">
            <div id="garage-3d-canvas" class="garage-3d-scene"></div>

            <div class="garage-overlay-hud">
              <div class="vehicle-title-card" id="car-info-card">
                <!-- Dynamically updated -->
              </div>

              <div class="turntable-hint">
                <span>🖱️ Click & Drag to Orbit 3D Vehicle</span>
              </div>
            </div>
          </div>

          <!-- VEHICLE CUSTOMIZATION RACK -->
          <div class="garage-customizer-panel card-dark">
            <h3 class="panel-title">VEHICLE LIVERY & UNDERGLOW</h3>

            <!-- Paint Color Selector -->
            <div class="customizer-group">
              <label class="custom-label">AERODYNAMIC PAINT FINISH</label>
              <div class="color-swatches" id="paint-swatches">
                <button class="color-swatch ${this.currentPaint === '#00e5ff' ? 'active' : ''}" style="background: #00e5ff" data-color="#00e5ff" title="Electric Cobalt"></button>
                <button class="color-swatch ${this.currentPaint === '#a855f7' ? 'active' : ''}" style="background: #a855f7" data-color="#a855f7" title="Neon Violet"></button>
                <button class="color-swatch ${this.currentPaint === '#ff3366' ? 'active' : ''}" style="background: #ff3366" data-color="#ff3366" title="Crimson Apex"></button>
                <button class="color-swatch ${this.currentPaint === '#00f59b' ? 'active' : ''}" style="background: #00f59b" data-color="#00f59b" title="Matrix Emerald"></button>
                <button class="color-swatch ${this.currentPaint === '#ffb800' ? 'active' : ''}" style="background: #ffb800" data-color="#ffb800" title="Solar Gold"></button>
                <button class="color-swatch ${this.currentPaint === '#ffffff' ? 'active' : ''}" style="background: #ffffff" data-color="#ffffff" title="Stealth White"></button>
              </div>
            </div>

            <!-- Neon Underglow Selector -->
            <div class="customizer-group">
              <label class="custom-label">NEON GROUND EFFECT UNDERGLOW</label>
              <div class="color-swatches" id="underglow-swatches">
                <button class="color-swatch ${this.currentUnderglow === '#00e5ff' ? 'active' : ''}" style="background: #00e5ff" data-underglow="#00e5ff" title="Cyan Glow"></button>
                <button class="color-swatch ${this.currentUnderglow === '#a855f7' ? 'active' : ''}" style="background: #a855f7" data-underglow="#a855f7" title="Purple Pulse"></button>
                <button class="color-swatch ${this.currentUnderglow === '#ff3366' ? 'active' : ''}" style="background: #ff3366" data-underglow="#ff3366" title="Red Alert"></button>
                <button class="color-swatch ${this.currentUnderglow === '#00f59b' ? 'active' : ''}" style="background: #00f59b" data-underglow="#00f59b" title="Acid Green"></button>
                <button class="color-swatch ${this.currentUnderglow === '#ffb800' ? 'active' : ''}" style="background: #ffb800" data-underglow="#ffb800" title="Amber Flare"></button>
              </div>
            </div>

            <!-- Vehicle Action CTA -->
            <div class="garage-action-area" id="garage-action-area">
              <!-- Dynamically populated button -->
            </div>
          </div>
        </div>

        <!-- HORIZONTAL CAR COLLECTION CAROUSEL -->
        <div class="garage-roster-shelf card-dark">
          <div class="shelf-header">
            <h4>VEHICLE COLLECTION</h4>
            <span class="collection-stat">${unlockedSet.size} / ${VEHICLE_CATALOG.length} UNLOCKED</span>
          </div>

          <div class="shelf-cars-row">
            ${VEHICLE_CATALOG.map(car => {
              const isUnlocked = unlockedSet.has(car.id);
              const isEquipped = (this.selectedCarId === car.id);
              return `
                <div class="shelf-car-card ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}" data-car-id="${car.id}">
                  <div class="shelf-car-badge ${car.rarity.toLowerCase()}">${car.rarity}</div>
                  <div class="shelf-car-icon">🏎️</div>
                  <h5 class="shelf-car-name">${car.name}</h5>
                  <span class="shelf-car-tier">${car.tier}</span>
                  <div class="shelf-car-status">
                    ${isEquipped ? '<span class="status-equipped">ACTIVE</span>' : (isUnlocked ? '<span class="status-owned">OWNED</span>' : '<span class="status-locked">🔒 LOCKED</span>')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      this.initGarage3D();
      this.updateVehicleCard();
      this.bindEvents();
    }, 50);
  }

  initGarage3D() {
    const box = document.getElementById('garage-3d-canvas');
    if (!box) return;

    this.garage3D = new Garage3D(box);
    this.garage3D.loadCar(this.selectedCarId, this.currentPaint, this.currentUnderglow);
  }

  updateVehicleCard() {
    const card = document.getElementById('car-info-card');
    const actions = document.getElementById('garage-action-area');
    if (!card || !actions) return;

    const car = VEHICLE_CATALOG.find(c => c.id === this.selectedCarId) || VEHICLE_CATALOG[0];
    const unlockedSet = new Set(this.garageData?.unlockedVehicles || ['talon', 'vortex']);
    const isUnlocked = unlockedSet.has(car.id);
    const isEquipped = (this.garageData?.activeVehicleId === car.id);

    card.innerHTML = `
      <span class="car-rarity-pill ${car.rarity.toLowerCase()}">${car.rarity.toUpperCase()} • ${car.tier.toUpperCase()}</span>
      <h2 class="car-name-title">${car.name}</h2>
      <p class="car-bio">${car.description}</p>
      <div class="car-specs-strip">
        <span>Base Speed: <strong>${car.baseTopSpeed}</strong></span>
        <span>Acceleration: <strong>${car.acceleration}</strong></span>
        <span>Aero Grip: <strong>${car.handling}</strong></span>
      </div>
    `;

    if (isEquipped) {
      actions.innerHTML = `
        <button class="btn btn-primary btn-large btn-full glow-primary" disabled>
          ✓ CURRENTLY EQUIPPED
        </button>
      `;
    } else if (isUnlocked) {
      actions.innerHTML = `
        <button class="btn btn-primary btn-large btn-full glow-primary" id="btn-equip-car">
          EQUIP ${car.name.toUpperCase()} FOR RACING
        </button>
      `;
    } else {
      actions.innerHTML = `
        <div class="locked-requirement-box">
          <span class="lock-icon">🔒</span>
          <div>
            <strong>UNLOCK CONDITION:</strong>
            <p>${car.unlockCondition}</p>
          </div>
        </div>
        <button class="btn btn-outline btn-large btn-full" disabled>
          LOCKED VEHICLE
        </button>
      `;
    }

    document.getElementById('btn-equip-car')?.addEventListener('click', async () => {
      this.garageData.activeVehicleId = this.selectedCarId;
      await storage.saveGarage(this.garageData);
      soundEffects.playVictoryFanfare();
      this.render();
    });
  }

  bindEvents() {
    // Select car from shelf
    this.container.querySelectorAll('.shelf-car-card').forEach(card => {
      card.addEventListener('click', () => {
        const carId = card.getAttribute('data-car-id');
        this.selectedCarId = carId;
        soundEffects.playUiClick();

        if (this.garage3D) {
          this.garage3D.loadCar(carId, this.currentPaint, this.currentUnderglow);
        }

        this.container.querySelectorAll('.shelf-car-card').forEach(c => {
          c.classList.toggle('equipped', c.getAttribute('data-car-id') === carId);
        });

        this.updateVehicleCard();
      });
    });

    // Paint swatches
    this.container.querySelectorAll('[data-color]').forEach(swatch => {
      swatch.addEventListener('click', async () => {
        const color = swatch.getAttribute('data-color');
        this.currentPaint = color;
        this.garageData.paintColor = color;
        await storage.saveGarage(this.garageData);

        if (this.garage3D) this.garage3D.updatePaint(color);
        soundEffects.playUiClick();

        this.container.querySelectorAll('[data-color]').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
      });
    });

    // Underglow swatches
    this.container.querySelectorAll('[data-underglow]').forEach(swatch => {
      swatch.addEventListener('click', async () => {
        const color = swatch.getAttribute('data-underglow');
        this.currentUnderglow = color;
        this.garageData.underglowColor = color;
        await storage.saveGarage(this.garageData);

        if (this.garage3D) this.garage3D.updateUnderglow(color);
        soundEffects.playUiClick();

        this.container.querySelectorAll('[data-underglow]').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
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
