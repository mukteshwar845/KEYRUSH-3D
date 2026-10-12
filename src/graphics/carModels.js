/**
 * KeyRush 3D Procedural Vehicle Mesh Factory (Three.js) — AAA Overhaul
 * Generates high-fidelity aerodynamic sports cars, widebody tuners, and hypercars
 * with sculpted bodywork, aerodynamic splitters, GT wings, multi-spoke alloy rims,
 * brake calipers, laser headlights, full-width OLED taillights, active brake lights,
 * dynamic underglow, and dual exhaust boost flames.
 */

import * as THREE from 'three';

export const VEHICLE_CATALOG = [
  {
    id: 'talon',
    name: 'Apex Talon',
    category: 'Supercar',
    tier: 'Tier 5 Apex',
    rarity: 'Legendary',
    baseTopSpeed: '320 km/h',
    speedVal: 320,
    acceleration: '2.4s',
    accelVal: 95,
    handling: '98%',
    handlingVal: 98,
    nitroVal: 85,
    tagline: 'Precision. Power. Perfection.',
    image: '/images/cars/garage-hero-car.jpg',
    unlockCondition: 'Default Active Vehicle',
    description: 'Precision-crafted hypercar engineered for razor-sharp response, active aerodynamics, and maximum cornering velocity.',
    unlocked: true
  },
  {
    id: 'vortex',
    name: 'Vortex R34',
    category: 'Hypercar',
    tier: 'Tier 4 Elite',
    rarity: 'Epic',
    baseTopSpeed: '295 km/h',
    speedVal: 295,
    acceleration: '2.7s',
    accelVal: 91,
    handling: '94%',
    handlingVal: 94,
    nitroVal: 88,
    tagline: 'Twin-Turbo Aerodynamic Precision.',
    image: '/images/cars/garage-vortex.jpg',
    unlockCondition: 'Win 3 AI Races or reach 75 WPM',
    description: 'Widebody track prototype featuring active splitters and twin-turbo induction.',
    unlocked: false
  },
  {
    id: 'nebula',
    name: 'Nebula ZX',
    category: 'Electric',
    tier: 'Tier 4 Elite',
    rarity: 'Epic',
    baseTopSpeed: '310 km/h',
    speedVal: 310,
    acceleration: '2.2s',
    accelVal: 97,
    handling: '96%',
    handlingVal: 96,
    nitroVal: 92,
    tagline: 'Instant Torque. Quantum Ground-Effects.',
    image: '/images/cars/garage-nebula.jpg',
    unlockCondition: 'Complete a 7-day practice streak',
    description: 'All-electric hypercraft delivering instantaneous dual-motor torque and active underbody suction.',
    unlocked: false
  },
  {
    id: 'chronos',
    name: 'Chronos V12',
    category: 'Hypercar',
    tier: 'Tier 3 Pro',
    rarity: 'Rare',
    baseTopSpeed: '280 km/h',
    speedVal: 280,
    acceleration: '3.1s',
    accelVal: 88,
    handling: '91%',
    handlingVal: 91,
    nitroVal: 80,
    tagline: 'V12 Symphony & Raw Mechanical Grip.',
    image: '/images/cars/garage-chronos.jpg',
    unlockCondition: 'Reach 90 WPM with ≥ 96% Accuracy',
    description: 'Naturally aspirated V12 endurance racer with titanium chassis and carbon-ceramic downforce.',
    unlocked: false
  },
  {
    id: 'talon_gold',
    name: 'Apex Talon (Gold)',
    category: 'Supercar',
    tier: 'Tier 2 Street',
    rarity: 'Common',
    baseTopSpeed: '260 km/h',
    speedVal: 260,
    acceleration: '3.5s',
    accelVal: 82,
    handling: '88%',
    handlingVal: 88,
    nitroVal: 75,
    tagline: 'Polished 24K Carbon Monocoque.',
    image: '/images/cars/garage-gold.jpg',
    unlockCondition: 'Unlock at Player Level 5',
    description: 'Special exhibition edition with 24-karat gold leaf finish and hand-tuned aero wing.',
    unlocked: false
  },
  {
    id: 'shadow',
    name: 'Shadow Racer',
    category: 'Muscle',
    tier: 'Tier 3 Pro',
    rarity: 'Rare',
    baseTopSpeed: '275 km/h',
    speedVal: 275,
    acceleration: '3.3s',
    accelVal: 85,
    handling: '89%',
    handlingVal: 89,
    nitroVal: 82,
    tagline: 'Dark Stealth Aero & Unbridled Torque.',
    image: '/images/cars/garage-shadow.jpg',
    unlockCondition: 'Achieve 98% Accuracy on 5 Tests',
    description: 'Supercharged widebody muscle missile built for brute-force acceleration and aggressive slipstreams.',
    unlocked: false
  }
];

// --- Procedural Asset Caches (Zero-overhead memory sharing) ---
let cachedEnvTexture = null;
export function getNightEnvironmentTexture() {
  if (typeof document === 'undefined') return null;
  if (cachedEnvTexture) return cachedEnvTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Sky gradient from deep zenith indigo to horizon skyline haze
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#02050e');
  grad.addColorStop(0.35, '#071124');
  grad.addColorStop(0.48, '#14284b');
  grad.addColorStop(0.51, '#ffaa44'); // warm streetlights reflection at horizon
  grad.addColorStop(0.54, '#0f1728');
  grad.addColorStop(1, '#03050a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Urban light streaks & bokeh highlights
  for (let i = 0; i < 48; i++) {
    const x = Math.random() * 512;
    const y = 112 + Math.random() * 32;
    const r = 1.5 + Math.random() * 5.0;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = Math.random() > 0.45 ? 'rgba(255, 175, 75, 0.45)' : 'rgba(0, 217, 255, 0.45)';
    ctx.fill();
  }

  cachedEnvTexture = new THREE.CanvasTexture(canvas);
  cachedEnvTexture.mapping = THREE.EquirectangularReflectionMapping;
  return cachedEnvTexture;
}

let cachedCarbonTexture = null;
function getCarbonTexture() {
  if (typeof document === 'undefined') return null;
  if (cachedCarbonTexture) return cachedCarbonTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0f1218';
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#1e2330';
  for (let y = 0; y < 64; y += 8) {
    for (let x = 0; x < 64; x += 8) {
      if ((x / 8 + y / 8) % 2 === 0) {
        ctx.fillRect(x, y, 8, 8);
      }
    }
  }
  cachedCarbonTexture = new THREE.CanvasTexture(canvas);
  cachedCarbonTexture.wrapS = THREE.RepeatWrapping;
  cachedCarbonTexture.wrapT = THREE.RepeatWrapping;
  cachedCarbonTexture.repeat.set(8, 8);
  return cachedCarbonTexture;
}

let cachedShadowTexture = null;
function getContactShadowTexture() {
  if (typeof document === 'undefined') return null;
  if (cachedShadowTexture) return cachedShadowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 512);
  const grad = ctx.createRadialGradient(128, 256, 20, 128, 256, 120);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
  grad.addColorStop(0.45, 'rgba(0, 0, 0, 0.55)');
  grad.addColorStop(0.85, 'rgba(0, 0, 0, 0.18)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 512);
  cachedShadowTexture = new THREE.CanvasTexture(canvas);
  return cachedShadowTexture;
}

let cachedLicenseTexture = null;
function getLicensePlateTexture() {
  if (typeof document === 'undefined') return null;
  if (cachedLicenseTexture) return cachedLicenseTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 48;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#080c14';
  ctx.fillRect(0, 0, 128, 48);
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, 124, 44);
  ctx.fillStyle = '#00d9ff';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ESPORTS GT', 64, 13);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '900 22px monospace';
  ctx.letterSpacing = '2px';
  ctx.fillText('KEYRUSH', 64, 36);
  cachedLicenseTexture = new THREE.CanvasTexture(canvas);
  return cachedLicenseTexture;
}

/**
 * Creates a world-space hovering billboard nameplate for racing opponents.
 */
export function createOpponentNameplate(name = 'Racer', rank = 2, isAi = true) {
  if (typeof document === 'undefined') {
    const dummy = new THREE.Object3D();
    dummy.userData = { updateRank: () => {} };
    return dummy;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 280;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Pill Background
  ctx.fillStyle = 'rgba(7, 11, 20, 0.92)';
  ctx.beginPath();
  ctx.roundRect(4, 4, 272, 56, 16);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0, 217, 255, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rank Badge Box
  ctx.fillStyle = rank === 1 ? '#F59E0B' : (rank === 2 ? '#94A3B8' : '#147BFF');
  ctx.beginPath();
  ctx.roundRect(12, 12, 38, 40, 10);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 22px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${rank}`, 31, 32);

  // Opponent Name + (AI) tag
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 18px sans-serif';
  ctx.fillText(name, 62, 26);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 14px monospace';
  ctx.fillText(isAi ? 'SIMULATED AI' : 'PILOT', 62, 46);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    sizeAttenuation: true
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(4.2, 0.96, 1.0);
  sprite.position.set(0, 2.1, 0);
  return sprite;
}

/**
 * Procedural Supercar Factory (Three.js) — Aerodynamic Hypercar Architecture
 */
export function createCarMesh(carId = 'talon', options = {}) {
  const group = new THREE.Group();
  group.name = `car_${carId}`;

  const paintColor = options.paintColor || '#00d9ff';
  const underglowColor = options.underglowColor || '#00d9ff';
  const envMap = getNightEnvironmentTexture();
  const carbonMap = getCarbonTexture();

  // --- High-Grade PBR Automotive Materials ---
  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(paintColor),
    metalness: 0.84,
    roughness: 0.16,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    reflectivity: 0.95,
    envMap: envMap,
    envMapIntensity: 1.8
  });

  const secondaryBodyMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(paintColor).multiplyScalar(0.72),
    metalness: 0.88,
    roughness: 0.22,
    clearcoat: 0.9,
    envMap: envMap,
    envMapIntensity: 1.4
  });

  const carbonMaterial = new THREE.MeshStandardMaterial({
    color: 0x161a22,
    map: carbonMap,
    metalness: 0.85,
    roughness: 0.28,
    envMap: envMap,
    envMapIntensity: 1.0
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8e2ec,
    metalness: 0.96,
    roughness: 0.06,
    envMap: envMap,
    envMapIntensity: 2.2
  });

  const darkTitaniumMat = new THREE.MeshStandardMaterial({
    color: 0x252a36,
    metalness: 0.92,
    roughness: 0.18,
    envMap: envMap,
    envMapIntensity: 1.2
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x060912,
    metalness: 0.92,
    roughness: 0.04,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    reflectivity: 0.98,
    envMap: envMap,
    envMapIntensity: 2.8
  });

  const headlightMaterial = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  const taillightMaterial = new THREE.MeshStandardMaterial({
    color: 0xff1644,
    emissive: new THREE.Color(0xff1644),
    emissiveIntensity: 4.5,
    roughness: 0.2
  });
  const brakeLightActiveMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0022,
    emissive: new THREE.Color(0xff0022),
    emissiveIntensity: 6.0,
    roughness: 0.2
  });

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x12141a,
    roughness: 0.94,
    metalness: 0.04
  });
  const caliperMaterial = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    metalness: 0.85,
    roughness: 0.2
  });

  // Base dimensions: Low, wide, aggressive track stance
  let length = 4.65;
  let width = 2.18;
  let height = 0.84;
  let frontWheelR = 0.35;
  let rearWheelR = 0.36;
  let frontWheelW = 0.28;
  let rearWheelW = 0.36; // Wider rear wheels for traction

  if (carId === 'vortex') {
    length = 4.68;
    width = 2.22;
    height = 0.83;
  } else if (carId === 'nebula') {
    length = 4.72;
    width = 2.24;
    height = 0.80;
  } else if (carId === 'chronos') {
    length = 4.82;
    width = 2.26;
    height = 0.79;
  } else if (carId === 'shadow') {
    length = 4.65;
    width = 2.22;
    height = 0.86;
    bodyMaterial.color.set('#0d1117');
    bodyMaterial.metalness = 0.88;
    bodyMaterial.roughness = 0.32;
    headlightMaterial.color.set('#ef4444');
  } else if (carId === 'talon_gold') {
    bodyMaterial.color.set('#d4af37');
    bodyMaterial.metalness = 0.96;
    bodyMaterial.roughness = 0.12;
    secondaryBodyMat.color.set('#ffd700');
  }

  const chassisY = frontWheelR * 0.92; // Hug the ground tightly

  // Root chassis container that handles tilt/roll
  const chassisGroup = new THREE.Group();
  group.add(chassisGroup);

  // --- 1. AERODYNAMIC MAIN MONOCOQUE HULL ---
  // Carbon aerodynamic undertray floor
  const floorGeo = new THREE.BoxGeometry(width * 0.86, 0.04, length * 0.92);
  const floorMesh = new THREE.Mesh(floorGeo, carbonMaterial);
  floorMesh.position.set(0, chassisY + 0.03, 0);
  floorMesh.receiveShadow = true;
  chassisGroup.add(floorMesh);

  // Center cockpit monocoque tub (Carbon Composite Core)
  const tubGeo = new THREE.BoxGeometry(width * 0.76, height * 0.32, length * 0.72);
  const tubMesh = new THREE.Mesh(tubGeo, carbonMaterial);
  tubMesh.position.set(0, chassisY + height * 0.17, length * 0.04);
  tubMesh.castShadow = true;
  tubMesh.receiveShadow = true;
  chassisGroup.add(tubMesh);

  // Aerodynamic nose & hood with downward forward taper
  const hoodL = length * 0.36;
  const hoodGeo = new THREE.BoxGeometry(width * 0.74, height * 0.16, hoodL);
  const hoodMesh = new THREE.Mesh(hoodGeo, bodyMaterial);
  hoodMesh.position.set(0, chassisY + height * 0.24, hoodL * 0.58);
  hoodMesh.rotation.x = -0.16;
  hoodMesh.castShadow = true;
  chassisGroup.add(hoodMesh);

  // Twin hood air extractor vents (sculpted carbon vents)
  [-0.32, 0.32].forEach(side => {
    const vent = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.22, 0.04, hoodL * 0.55),
      carbonMaterial
    );
    vent.position.set(side * width * 0.45, chassisY + height * 0.32, hoodL * 0.54);
    vent.rotation.x = -0.16;
    chassisGroup.add(vent);
  });

  // Front low-slung carbon splitter with aerodynamic side canards
  const splitterW = width * 1.04;
  const splitterL = length * 0.18;
  const splitter = new THREE.Mesh(
    new THREE.BoxGeometry(splitterW, 0.05, splitterL),
    carbonMaterial
  );
  splitter.position.set(0, chassisY + 0.03, length * 0.46);
  chassisGroup.add(splitter);

  [-1, 1].forEach(side => {
    const canard = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.03, 0.16),
      carbonMaterial
    );
    canard.position.set(side * splitterW * 0.48, chassisY + 0.12, length * 0.44);
    canard.rotation.z = side * 0.25;
    canard.rotation.x = -0.14;
    chassisGroup.add(canard);
  });

  // Sculpted front bumper intake grilles
  const frontGrille = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.62, height * 0.16, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x030508 })
  );
  frontGrille.position.set(0, chassisY + height * 0.14, length * 0.47);
  chassisGroup.add(frontGrille);

  // Angled laser LED headlights
  [-1, 1].forEach(side => {
    const hl = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.05, 0.12),
      headlightMaterial
    );
    hl.position.set(side * (width * 0.33), chassisY + height * 0.22, length * 0.48);
    hl.rotation.y = -side * 0.18;
    chassisGroup.add(hl);
  });

  // --- 2. AERODYNAMIC COCKPIT GREENHOUSE & ENGINE DECK ---
  const canopyLen = length * 0.46;
  const canopyWid = width * 0.62;
  const canopyH = height * 0.44;

  // Streamlined center roof cap
  const roofCap = new THREE.Mesh(
    new THREE.BoxGeometry(canopyWid * 0.70, 0.04, canopyLen * 0.48),
    carbonMaterial
  );
  roofCap.position.set(0, chassisY + height * 0.34 + canopyH * 0.96, -length * 0.02);
  chassisGroup.add(roofCap);

  // Roof intake snorkel
  const roofScoop = new THREE.Mesh(
    new THREE.BoxGeometry(0.20, 0.08, canopyLen * 0.40),
    carbonMaterial
  );
  roofScoop.position.set(0, chassisY + height * 0.34 + canopyH * 1.04, -length * 0.06);
  chassisGroup.add(roofScoop);

  // Raked front windshield
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(canopyWid * 0.72, 0.04, canopyLen * 0.42),
    glassMaterial
  );
  windshield.position.set(0, chassisY + height * 0.34 + canopyH * 0.62, length * 0.14);
  windshield.rotation.x = -0.48;
  chassisGroup.add(windshield);

  // Fastback sloped rear glass engine deck
  const rearGlass = new THREE.Mesh(
    new THREE.BoxGeometry(canopyWid * 0.68, 0.04, canopyLen * 0.44),
    glassMaterial
  );
  rearGlass.position.set(0, chassisY + height * 0.34 + canopyH * 0.58, -length * 0.18);
  rearGlass.rotation.x = 0.42;
  chassisGroup.add(rearGlass);

  // Tapered privacy side windows
  [-1, 1].forEach(side => {
    const sideWin = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, canopyH * 0.70, canopyLen * 0.52),
      glassMaterial
    );
    sideWin.position.set(side * (canopyWid * 0.36), chassisY + height * 0.34 + canopyH * 0.48, -length * 0.02);
    sideWin.rotation.z = side * 0.18; // Taper inwards towards roof
    chassisGroup.add(sideWin);
  });

  // Carbon rear deck engine louvers (behind rear glass)
  for (let l = 0; l < 4; l++) {
    const louver = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.48, 0.02, 0.12),
      carbonMaterial
    );
    louver.position.set(0, chassisY + height * 0.36 - l * 0.03, -length * 0.26 - l * 0.08);
    louver.rotation.x = 0.28;
    chassisGroup.add(louver);
  }

  // --- 3. WIDEBODY SIDES, INTAKES & REAR HAUNCHES ---
  const fenderW = (width - width * 0.78) * 0.5 + 0.14;
  [-1, 1].forEach(side => {
    // Front flared wheel arch
    const fArch = new THREE.Mesh(
      new THREE.BoxGeometry(fenderW, height * 0.40, length * 0.30),
      bodyMaterial
    );
    fArch.position.set(side * (width * 0.40 + fenderW * 0.38), chassisY + height * 0.20, length * 0.27);
    fArch.castShadow = true;
    chassisGroup.add(fArch);

    // Muscular rear quarter haunch (wider, aggressive stance)
    const rArch = new THREE.Mesh(
      new THREE.BoxGeometry(fenderW * 1.18, height * 0.46, length * 0.36),
      bodyMaterial
    );
    rArch.position.set(side * (width * 0.40 + fenderW * 0.46), chassisY + height * 0.22, -length * 0.25);
    rArch.castShadow = true;
    chassisGroup.add(rArch);

    // Sculpted painted side door panel
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, height * 0.32, length * 0.34),
      bodyMaterial
    );
    door.position.set(side * (width * 0.40), chassisY + height * 0.18, 0.02);
    door.castShadow = true;
    chassisGroup.add(door);

    // Aerodynamic carbon side skirts with ground-effect channel
    const skirt = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.06, length * 0.56),
      carbonMaterial
    );
    skirt.position.set(side * (width * 0.48), chassisY + 0.04, 0);
    chassisGroup.add(skirt);

    // Deep mid-engine side radiator air intake
    const scoop = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, height * 0.28, length * 0.24),
      carbonMaterial
    );
    scoop.position.set(side * (width * 0.42), chassisY + height * 0.22, -length * 0.07);
    scoop.rotation.y = side * 0.16;
    chassisGroup.add(scoop);

    // Carbon wing mirror with aerodynamic stem
    const mirrorStem = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.05), carbonMaterial);
    mirrorStem.position.set(side * (width * 0.39), chassisY + height * 0.42, length * 0.12);
    chassisGroup.add(mirrorStem);

    const mirrorHead = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.12), bodyMaterial);
    mirrorHead.position.set(side * (width * 0.48), chassisY + height * 0.43, length * 0.12);
    chassisGroup.add(mirrorHead);
  });

  // --- 4. REAR FASCIA: TAILLIGHTS, WING, DIFFUSER & EXHAUSTS (Hero View) ---
  // Sculpted dark carbon rear bumper panel
  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.94, height * 0.34, 0.24),
    carbonMaterial
  );
  bumper.position.set(0, chassisY + height * 0.22, -length * 0.47);
  chassisGroup.add(bumper);

  // Hexagonal rear mesh ventilation grille insert
  const rearMesh = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.84, height * 0.18, 0.04),
    new THREE.MeshBasicMaterial({ color: 0x05070a })
  );
  rearMesh.position.set(0, chassisY + height * 0.20, -length * 0.495);
  chassisGroup.add(rearMesh);

  // A. Continuous Sleek Curved OLED Taillight Lightbar
  const taillightMesh = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.86, 0.08, 0.08),
    taillightMaterial
  );
  taillightMesh.position.set(0, chassisY + height * 0.30, -length * 0.498);
  chassisGroup.add(taillightMesh);

  // Angled outer boomerang light blades for aggressive signature
  [-1, 1].forEach(side => {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.16, 0.08),
      taillightMaterial
    );
    blade.position.set(side * (width * 0.44), chassisY + height * 0.26, -length * 0.498);
    blade.rotation.z = side * 0.28;
    chassisGroup.add(blade);
  });

  // B. Active High-Mount Center Brake Light (illuminates bright on braking/error)
  const brakeLightMesh = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.42, 0.08, 0.06),
    brakeLightActiveMaterial
  );
  brakeLightMesh.position.set(0, chassisY + height * 0.39, -length * 0.498);
  brakeLightMesh.visible = false;
  chassisGroup.add(brakeLightMesh);

  // C. Sculpted GT Rear Wing
  const wingW = width * 1.08;
  const wingMesh = new THREE.Mesh(
    new THREE.BoxGeometry(wingW, 0.05, 0.42),
    carbonMaterial
  );
  wingMesh.position.set(0, chassisY + height * 0.82, -length * 0.44);
  wingMesh.rotation.x = -0.06;
  wingMesh.castShadow = true;
  chassisGroup.add(wingMesh);

  // Wing aerodynamic contoured endplates
  [-1, 1].forEach(side => {
    const endplate = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.24, 0.46),
      secondaryBodyMat
    );
    endplate.position.set(side * (wingW * 0.5), chassisY + height * 0.82, -length * 0.44);
    chassisGroup.add(endplate);
  });

  // Swan-neck wing uprights
  [-0.32, 0.32].forEach(x => {
    const upright = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.42, 0.14),
      carbonMaterial
    );
    upright.position.set(x * width, chassisY + height * 0.62, -length * 0.43);
    upright.rotation.x = -0.18;
    chassisGroup.add(upright);
  });

  // D. Sculpted Deep Carbon Diffuser & Vertical Tunnel Strakes
  const diffuserMesh = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.94, 0.16, 0.36),
    carbonMaterial
  );
  diffuserMesh.position.set(0, chassisY + 0.08, -length * 0.48);
  chassisGroup.add(diffuserMesh);

  [-0.38, -0.14, 0.14, 0.38].forEach(xOff => {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.03, 0.18, 0.34),
      carbonMaterial
    );
    fin.position.set(xOff * width, chassisY + 0.08, -length * 0.48);
    chassisGroup.add(fin);
  });

  // E. Quad High-Performance Exhaust System with Inner Glowing Afterburners
  const exhaustFlames = [];
  const exhaustPositions = [-0.36, -0.22, 0.22, 0.36];

  exhaustPositions.forEach(x => {
    // Titanium tip barrel
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.18, 16),
      chromeMaterial
    );
    tip.rotation.x = Math.PI / 2;
    tip.position.set(x, chassisY + 0.14, -length * 0.50);
    chassisGroup.add(tip);

    // Glowing inner burner ring
    const burner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12),
      new THREE.MeshBasicMaterial({ color: 0x00d9ff })
    );
    burner.rotation.x = Math.PI / 2;
    burner.position.set(x, chassisY + 0.14, -length * 0.51);
    chassisGroup.add(burner);

    // Nitro boost flame cone
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.85, 12),
      new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      })
    );
    flame.rotation.x = -Math.PI / 2;
    flame.position.set(x, chassisY + 0.14, -length * 0.51 - 0.42);
    flame.visible = false;
    chassisGroup.add(flame);
    exhaustFlames.push(flame);
  });

  // F. Rear License Plate ("KEYRUSH")
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.48, 0.18),
    new THREE.MeshBasicMaterial({ map: getLicensePlateTexture() })
  );
  plate.rotation.y = Math.PI;
  plate.position.set(0, chassisY + 0.16, -length * 0.498);
  chassisGroup.add(plate);

  // --- 5. FOUR DETAILED CONCAVE ALLOY WHEELS ---
  const wheelConfigs = [
    { x: -(width * 0.48), y: frontWheelR, z: length * 0.27, radius: frontWheelR, thick: frontWheelW, isFront: true, isLeft: true },
    { x:  (width * 0.48), y: frontWheelR, z: length * 0.27, radius: frontWheelR, thick: frontWheelW, isFront: true, isLeft: false },
    { x: -(width * 0.49), y: rearWheelR, z: -length * 0.26, radius: rearWheelR, thick: rearWheelW, isFront: false, isLeft: true },
    { x:  (width * 0.49), y: rearWheelR, z: -length * 0.26, radius: rearWheelR, thick: rearWheelW, isFront: false, isLeft: false }
  ];

  const wheelSpinPivots = [];
  const frontSteerGroups = [];

  wheelConfigs.forEach((cfg) => {
    const steerGroup = new THREE.Group();
    steerGroup.position.set(cfg.x, cfg.y, cfg.z);
    group.add(steerGroup);

    if (cfg.isFront) {
      frontSteerGroups.push(steerGroup);
    }

    const spinPivot = new THREE.Group();
    steerGroup.add(spinPivot);
    wheelSpinPivots.push(spinPivot);

    // A. Rubber Tire (Cylinder + Bevel)
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(cfg.radius, cfg.radius, cfg.thick, 24),
      tireMaterial
    );
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    spinPivot.add(tire);

    // Tread Grooves
    [-cfg.thick * 0.24, cfg.thick * 0.24].forEach(off => {
      const tread = new THREE.Mesh(
        new THREE.TorusGeometry(cfg.radius * 0.985, 0.012, 6, 24),
        new THREE.MeshBasicMaterial({ color: 0x050608 })
      );
      tread.rotation.y = Math.PI / 2;
      tread.position.x = off;
      spinPivot.add(tread);
    });

    // B. Concave Alloy Rim Outer Barrel
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(cfg.radius * 0.68, cfg.radius * 0.68, cfg.thick + 0.01, 16),
      darkTitaniumMat
    );
    rim.rotation.z = Math.PI / 2;
    spinPivot.add(rim);

    // C. 10 Aerodynamic Spoke Blades (5 Twin-Spokes)
    for (let s = 0; s < 10; s++) {
      const angle = (s / 10) * Math.PI * 2;
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.024, cfg.radius * 0.62, 0.035),
        chromeMaterial
      );
      const outX = cfg.isLeft ? -cfg.thick * 0.46 : cfg.thick * 0.46;
      spoke.position.set(outX, Math.cos(angle) * cfg.radius * 0.32, Math.sin(angle) * cfg.radius * 0.32);
      spoke.rotation.x = angle;
      spinPivot.add(spoke);
    }

    // D. Brake Rotor Disc & Caliper
    const rotor = new THREE.Mesh(
      new THREE.CylinderGeometry(cfg.radius * 0.54, cfg.radius * 0.54, 0.015, 16),
      chromeMaterial
    );
    rotor.rotation.z = Math.PI / 2;
    spinPivot.add(rotor);

    // Caliper fixed to steer group (does not spin with wheel)
    const caliper = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, cfg.radius * 0.28, cfg.radius * 0.24),
      caliperMaterial
    );
    caliper.position.set(cfg.isLeft ? -0.04 : 0.04, cfg.radius * 0.28, 0);
    steerGroup.add(caliper);
  });

  // --- 6. ROAD GROUNDING CONTACT SHADOW ---
  const shadowMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 1.35, length * 1.15),
    new THREE.MeshBasicMaterial({
      map: getContactShadowTexture(),
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    })
  );
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.015;
  group.add(shadowMesh);

  // --- 7. RESTRAINED NEON GROUND UNDERGLOW ---
  const underglowMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 1.05, length * 0.95),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(underglowColor),
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide
    })
  );
  underglowMesh.rotation.x = Math.PI / 2;
  underglowMesh.position.y = 0.025;
  group.add(underglowMesh);

  const underglowLight = new THREE.PointLight(new THREE.Color(underglowColor), 1.0, 5.0);
  underglowLight.position.set(0, 0.2, 0);
  group.add(underglowLight);

  // --- USER DATA & RUNTIME API ---
  group.userData = {
    carId,
    bodyMaterial,
    secondaryBodyMat,
    underglowMat: underglowMesh.material,
    underglowLight,
    brakeLightMesh,
    exhaustFlames,
    chassisGroup,
    wheelSpinPivots,
    frontSteerGroups,

    updatePaint: (newColor) => {
      const col = new THREE.Color(newColor);
      bodyMaterial.color.copy(col);
      secondaryBodyMat.color.copy(col).multiplyScalar(0.72);
    },

    updateUnderglow: (newColor) => {
      const col = new THREE.Color(newColor);
      underglowMesh.material.color.copy(col);
      underglowLight.color.copy(col);
    },

    spinWheels: (amount) => {
      wheelSpinPivots.forEach(pivot => {
        pivot.rotation.x += amount;
      });
    },

    steerWheels: (angle) => {
      frontSteerGroups.forEach(g => {
        g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, angle, 0.2);
      });
    },

    setBrake: (active) => {
      if (brakeLightMesh) {
        brakeLightMesh.visible = active;
      }
      taillightMaterial.emissiveIntensity = active ? 4.5 : 3.0;
    },

    setNitro: (active) => {
      exhaustFlames.forEach(flame => {
        flame.visible = active;
        if (active) {
          const jitter = 0.85 + Math.random() * 0.35;
          flame.scale.set(jitter, jitter, 1.0 + Math.random() * 0.4);
        }
      });
    },

    setTilt: (pitch, roll) => {
      chassisGroup.rotation.x = THREE.MathUtils.lerp(chassisGroup.rotation.x, pitch, 0.15);
      chassisGroup.rotation.z = THREE.MathUtils.lerp(chassisGroup.rotation.z, roll, 0.15);
    }
  };

  return group;
}
