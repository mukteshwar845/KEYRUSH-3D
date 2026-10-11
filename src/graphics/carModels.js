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
    image: '/images/garage_hero_car.jpg',
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
    image: '/images/garage_vortex.jpg',
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
    image: '/images/garage_nebula.jpg',
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
    image: '/images/garage_chronos.jpg',
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
    image: '/images/garage_gold.jpg',
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
    image: '/images/garage_shadow.jpg',
    unlockCondition: 'Achieve 98% Accuracy on 5 Tests',
    description: 'Supercharged widebody muscle missile built for brute-force acceleration and aggressive slipstreams.',
    unlocked: false
  }
];

export function createCarMesh(carId = 'talon', options = {}) {
  const group = new THREE.Group();
  group.name = `car_${carId}`;

  const paintColor = options.paintColor || '#00e5ff';
  const underglowColor = options.underglowColor || '#00e5ff';

  // --- Premium Automotive Materials ---
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(paintColor),
    metalness: 0.88,
    roughness: 0.18,
    envMapIntensity: 2.0
  });

  const secondaryBodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(paintColor).multiplyScalar(0.7),
    metalness: 0.9,
    roughness: 0.25
  });

  const carbonTrimMaterial = new THREE.MeshStandardMaterial({
    color: 0x12141a,
    metalness: 0.85,
    roughness: 0.35
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xdde5ee,
    metalness: 0.95,
    roughness: 0.08
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x07111e,
    metalness: 0.4,
    roughness: 0.05,
    transmission: 0.75,
    transparent: true,
    opacity: 0.88,
    reflectivity: 0.9
  });

  const headlightMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f5ff
  });

  const headlightGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x88faff,
    transparent: true,
    opacity: 0.8
  });

  const taillightMaterial = new THREE.MeshBasicMaterial({
    color: 0xff1644
  });

  const brakeLightActiveMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0033
  });

  const caliperMaterial = new THREE.MeshStandardMaterial({
    color: 0xff2244,
    metalness: 0.8,
    roughness: 0.2
  });

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x161820,
    roughness: 0.92,
    metalness: 0.05
  });

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0x242836,
    metalness: 0.95,
    roughness: 0.15
  });

  // Base dimensions tuned by car model
  let length = 4.3;
  let width = 2.0;
  let height = 0.95;
  let wheelRadius = 0.34;
  let wheelThickness = 0.24;

  if (carId === 'vortex') {
    length = 4.4;
    width = 2.15;
    height = 0.92;
  } else if (carId === 'phantom') {
    length = 4.5;
    width = 2.2;
    height = 0.86;
  } else if (carId === 'nebula') {
    length = 4.6;
    width = 2.25;
    height = 0.82;
  } else if (carId === 'chronos') {
    length = 4.75;
    width = 2.3;
    height = 0.78;
  }

  const chassisY = wheelRadius * 0.95; // base chassis height above ground

  // Root chassis container that can tilt on pitch/roll without affecting ground-effect underglow
  const chassisGroup = new THREE.Group();
  group.add(chassisGroup);

  // --- 1. AERODYNAMIC MAIN BODY TUB ---
  // Lower center tub
  const tubGeo = new THREE.BoxGeometry(width * 0.82, height * 0.38, length * 0.92);
  const tubMesh = new THREE.Mesh(tubGeo, bodyMaterial);
  tubMesh.position.set(0, chassisY + height * 0.20, 0);
  tubMesh.castShadow = true;
  tubMesh.receiveShadow = true;
  chassisGroup.add(tubMesh);

  // Sculpted hood with downward aerodynamic slant
  const hoodLength = length * 0.38;
  const hoodGeo = new THREE.BoxGeometry(width * 0.78, height * 0.18, hoodLength);
  const hoodMesh = new THREE.Mesh(hoodGeo, bodyMaterial);
  hoodMesh.position.set(0, chassisY + height * 0.30, hoodLength * 0.58);
  hoodMesh.rotation.x = -0.14;
  hoodMesh.castShadow = true;
  chassisGroup.add(hoodMesh);

  // Hood central power bulge / air extractor vents
  const ventGeo = new THREE.BoxGeometry(width * 0.38, 0.05, hoodLength * 0.55);
  const ventMesh = new THREE.Mesh(ventGeo, carbonTrimMaterial);
  ventMesh.position.set(0, chassisY + height * 0.39, hoodLength * 0.52);
  ventMesh.rotation.x = -0.14;
  chassisGroup.add(ventMesh);

  // Widebody side wheel arches / pontoons
  const fenderW = (width - width * 0.82) * 0.5 + 0.08;
  [-1, 1].forEach(side => {
    // Front fender
    const fFenderGeo = new THREE.BoxGeometry(fenderW, height * 0.42, length * 0.32);
    const fFender = new THREE.Mesh(fFenderGeo, bodyMaterial);
    fFender.position.set(side * (width * 0.41 + fenderW * 0.4), chassisY + height * 0.22, length * 0.26);
    fFender.castShadow = true;
    chassisGroup.add(fFender);

    // Rear fender (wider aggressive stance)
    const rFenderGeo = new THREE.BoxGeometry(fenderW * 1.15, height * 0.46, length * 0.36);
    const rFender = new THREE.Mesh(rFenderGeo, bodyMaterial);
    rFender.position.set(side * (width * 0.41 + fenderW * 0.5), chassisY + height * 0.24, -length * 0.25);
    rFender.castShadow = true;
    chassisGroup.add(rFender);

    // Side aero skirts / intake channel
    const skirtGeo = new THREE.BoxGeometry(0.12, 0.08, length * 0.52);
    const skirt = new THREE.Mesh(skirtGeo, carbonTrimMaterial);
    skirt.position.set(side * (width * 0.47), chassisY + 0.06, 0);
    chassisGroup.add(skirt);

    // Side air intake scoop for mid-engine cooling
    const scoopGeo = new THREE.BoxGeometry(0.14, height * 0.24, length * 0.22);
    const scoop = new THREE.Mesh(scoopGeo, carbonTrimMaterial);
    scoop.position.set(side * (width * 0.42), chassisY + height * 0.24, -length * 0.08);
    scoop.rotation.y = side * 0.15;
    chassisGroup.add(scoop);

    // Cyber aerodynamic wing mirrors with LED strip
    const mirrorStem = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.06), carbonTrimMaterial);
    mirrorStem.position.set(side * (width * 0.40), chassisY + height * 0.46, length * 0.12);
    chassisGroup.add(mirrorStem);

    const mirrorHead = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.12), bodyMaterial);
    mirrorHead.position.set(side * (width * 0.49), chassisY + height * 0.47, length * 0.12);
    chassisGroup.add(mirrorHead);

    const mirrorLed = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.10), headlightMaterial);
    mirrorLed.position.set(side * (width * 0.55), chassisY + height * 0.47, length * 0.12);
    chassisGroup.add(mirrorLed);
  });

  // --- 2. COCKPIT CANOPY & ROOF ---
  const canopyLen = length * 0.42;
  const canopyWid = width * 0.68;
  const canopyH = height * 0.52;

  // Glass teardrop cockpit
  const canopyGeo = new THREE.BoxGeometry(canopyWid, canopyH, canopyLen);
  const canopyMesh = new THREE.Mesh(canopyGeo, glassMaterial);
  canopyMesh.position.set(0, chassisY + height * 0.38 + canopyH * 0.48, -length * 0.02);
  canopyMesh.castShadow = true;
  chassisGroup.add(canopyMesh);

  // Carbon roof cap / roof scoop
  const roofGeo = new THREE.BoxGeometry(canopyWid * 0.82, 0.05, canopyLen * 0.72);
  const roofMesh = new THREE.Mesh(roofGeo, secondaryBodyMat);
  roofMesh.position.set(0, chassisY + height * 0.38 + canopyH * 0.97, -length * 0.02);
  chassisGroup.add(roofMesh);

  // Roof center aero fin / snorkel
  const roofFinGeo = new THREE.BoxGeometry(0.06, 0.14, canopyLen * 0.6);
  const roofFin = new THREE.Mesh(roofFinGeo, carbonTrimMaterial);
  roofFin.position.set(0, chassisY + height * 0.38 + canopyH * 1.05, -length * 0.04);
  chassisGroup.add(roofFin);

  // Internal racing roll-cage silhouette
  const cageGeo = new THREE.BoxGeometry(canopyWid * 0.88, canopyH * 0.7, canopyLen * 0.8);
  const cageWire = new THREE.WireframeGeometry(cageGeo);
  const cageLine = new THREE.LineSegments(cageWire, new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.3 }));
  cageLine.position.copy(canopyMesh.position);
  chassisGroup.add(cageLine);

  // --- 3. FRONT SPLITTER & CARBON FASCIA ---
  const splitterW = width * 1.02;
  const splitterL = length * 0.18;
  const splitterGeo = new THREE.BoxGeometry(splitterW, 0.06, splitterL);
  const splitter = new THREE.Mesh(splitterGeo, carbonTrimMaterial);
  splitter.position.set(0, chassisY + 0.04, length * 0.47);
  chassisGroup.add(splitter);

  // Front canard winglets
  [-1, 1].forEach(side => {
    const canardGeo = new THREE.BoxGeometry(0.18, 0.03, 0.18);
    const canard = new THREE.Mesh(canardGeo, carbonTrimMaterial);
    canard.position.set(side * (splitterW * 0.48), chassisY + 0.14, length * 0.44);
    canard.rotation.z = side * 0.25;
    canard.rotation.x = -0.15;
    chassisGroup.add(canard);
  });

  // Front intake grille mesh
  const grilleGeo = new THREE.BoxGeometry(width * 0.58, height * 0.18, 0.08);
  const grilleMesh = new THREE.Mesh(grilleGeo, new THREE.MeshBasicMaterial({ color: 0x05070a }));
  grilleMesh.position.set(0, chassisY + height * 0.16, length * 0.48);
  chassisGroup.add(grilleMesh);

  // --- 4. REAR DIFFUSER & ACTIVE GT WING ---
  // Rear aero diffuser tunnels
  const diffuserGeo = new THREE.BoxGeometry(width * 0.92, 0.16, 0.35);
  const diffuser = new THREE.Mesh(diffuserGeo, carbonTrimMaterial);
  diffuser.position.set(0, chassisY + 0.09, -length * 0.48);
  chassisGroup.add(diffuser);

  // Diffuser vertical fins
  [-0.6, -0.2, 0.2, 0.6].forEach(xOff => {
    const finGeo = new THREE.BoxGeometry(0.03, 0.18, 0.32);
    const fin = new THREE.Mesh(finGeo, carbonTrimMaterial);
    fin.position.set(xOff * width * 0.45, chassisY + 0.09, -length * 0.48);
    chassisGroup.add(fin);
  });

  // GT Wing spoiler blade
  const wingW = width * 1.08;
  const wingGeo = new THREE.BoxGeometry(wingW, 0.05, 0.46);
  const wingMesh = new THREE.Mesh(wingGeo, carbonTrimMaterial);
  wingMesh.position.set(0, chassisY + height * 0.78, -length * 0.43);
  wingMesh.rotation.x = -0.06;
  wingMesh.castShadow = true;
  chassisGroup.add(wingMesh);

  // GT Wing endplates
  [-1, 1].forEach(side => {
    const endplateGeo = new THREE.BoxGeometry(0.04, 0.24, 0.50);
    const endplate = new THREE.Mesh(endplateGeo, secondaryBodyMat);
    endplate.position.set(side * (wingW * 0.5), chassisY + height * 0.78, -length * 0.43);
    chassisGroup.add(endplate);
  });

  // Swan-neck wing stanchions / uprights
  const uprightGeo = new THREE.BoxGeometry(0.04, 0.34, 0.16);
  [-0.32, 0.32].forEach(x => {
    const upright = new THREE.Mesh(uprightGeo, carbonTrimMaterial);
    upright.position.set(x * width, chassisY + height * 0.62, -length * 0.42);
    upright.rotation.x = -0.15;
    chassisGroup.add(upright);
  });

  // --- 5. HIGH-INTENSITY LASER HEADLIGHTS & FULL-WIDTH OLED TAILLIGHTS ---
  // Angled laser front headlights
  const headlightMeshes = [];
  [-1, 1].forEach(side => {
    const hlGeo = new THREE.BoxGeometry(0.34, 0.06, 0.12);
    const hlMesh = new THREE.Mesh(hlGeo, headlightMaterial);
    hlMesh.position.set(side * (width * 0.32), chassisY + height * 0.24, length * 0.49);
    hlMesh.rotation.y = -side * 0.18;
    chassisGroup.add(hlMesh);
    headlightMeshes.push(hlMesh);

    // Headlight inner projector bulb
    const bulbGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const bulb = new THREE.Mesh(bulbGeo, headlightGlowMaterial);
    bulb.position.set(side * (width * 0.33), chassisY + height * 0.24, length * 0.50);
    chassisGroup.add(bulb);
  });

  // Full-width continuous rear OLED lightbar
  const taillightGeo = new THREE.BoxGeometry(width * 0.88, 0.06, 0.06);
  const taillightMesh = new THREE.Mesh(taillightGeo, taillightMaterial);
  taillightMesh.position.set(0, chassisY + height * 0.32, -length * 0.495);
  chassisGroup.add(taillightMesh);

  // Active brake light element (flashes brightly on error / braking)
  const brakeLightGeo = new THREE.BoxGeometry(width * 0.45, 0.08, 0.065);
  const brakeLightMesh = new THREE.Mesh(brakeLightGeo, brakeLightActiveMaterial);
  brakeLightMesh.position.set(0, chassisY + height * 0.38, -length * 0.496);
  brakeLightMesh.visible = false;
  chassisGroup.add(brakeLightMesh);

  // --- 6. DUAL EXHAUSTS WITH NITRO BOOST FLAME EFFECT ---
  const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.20, 16);
  exhaustGeo.rotateX(Math.PI / 2);
  const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x333742, metalness: 0.95, roughness: 0.2 });

  const exhaustFlames = [];
  [-0.32, 0.32].forEach(x => {
    const tip = new THREE.Mesh(exhaustGeo, exhaustMat);
    tip.position.set(x, chassisY + 0.12, -length * 0.50);
    chassisGroup.add(tip);

    // Inner glowing burner
    const burner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff })
    );
    burner.rotation.x = Math.PI / 2;
    burner.position.set(x, chassisY + 0.12, -length * 0.51);
    chassisGroup.add(burner);

    // Nitro exhaust cone (active during boost)
    const flameGeo = new THREE.ConeGeometry(0.12, 0.85, 12);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(x, chassisY + 0.12, -length * 0.51 - 0.42);
    flame.visible = false;
    chassisGroup.add(flame);
    exhaustFlames.push(flame);
  });

  // --- 7. FOUR DETAILED WHEELS (TIRE + ALLOY MULTI-SPOKE RIM + BRAKE CALIPER) ---
  const wheelPositions = [
    { x: -(width * 0.48), y: wheelRadius, z: length * 0.27, isFront: true, isLeft: true },
    { x:  (width * 0.48), y: wheelRadius, z: length * 0.27, isFront: true, isLeft: false },
    { x: -(width * 0.48), y: wheelRadius, z: -length * 0.26, isFront: false, isLeft: true },
    { x:  (width * 0.48), y: wheelRadius, z: -length * 0.26, isFront: false, isLeft: false }
  ];

  const wheelSpinPivots = [];
  const frontSteerGroups = [];

  wheelPositions.forEach((pos) => {
    // Steer group: handles Y-rotation steering for front wheels
    const steerGroup = new THREE.Group();
    steerGroup.position.set(pos.x, pos.y, pos.z);
    group.add(steerGroup);
    if (pos.isFront) {
      frontSteerGroups.push(steerGroup);
    }

    // Spin pivot: rotates around X-axis for rolling forward
    const spinPivot = new THREE.Group();
    steerGroup.add(spinPivot);
    wheelSpinPivots.push(spinPivot);

    // 1. Rubber Tire
    const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 24);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, tireMaterial);
    tire.castShadow = true;
    spinPivot.add(tire);

    // Tire tread ring grooves
    [-0.06, 0.06].forEach(offset => {
      const treadGeo = new THREE.TorusGeometry(wheelRadius * 0.98, 0.015, 6, 24);
      treadGeo.rotateY(Math.PI / 2);
      const tread = new THREE.Mesh(treadGeo, new THREE.MeshBasicMaterial({ color: 0x08090c }));
      tread.position.x = offset;
      spinPivot.add(tread);
    });

    // 2. Alloy Rim Outer Barrel
    const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.68, wheelRadius * 0.68, wheelThickness + 0.01, 16);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, rimMaterial);
    spinPivot.add(rim);

    // 3. Multi-Spoke Rims (6 aerodynamic twin-spokes)
    const spokeCount = 6;
    for (let s = 0; s < spokeCount; s++) {
      const angle = (s / spokeCount) * Math.PI * 2;
      const spokeGeo = new THREE.BoxGeometry(0.03, wheelRadius * 0.62, 0.04);
      const spoke = new THREE.Mesh(spokeGeo, chromeMaterial);
      const outwardX = pos.isLeft ? -wheelThickness * 0.46 : wheelThickness * 0.46;
      spoke.position.set(outwardX, Math.cos(angle) * wheelRadius * 0.32, Math.sin(angle) * wheelRadius * 0.32);
      spoke.rotation.x = angle;
      spinPivot.add(spoke);
    }

    // 4. Center Hub Cap with Neon Accent
    const hubCap = new THREE.Mesh(
      new THREE.CylinderGeometry(wheelRadius * 0.16, wheelRadius * 0.16, wheelThickness + 0.04, 12),
      secondaryBodyMat
    );
    hubCap.rotation.z = Math.PI / 2;
    spinPivot.add(hubCap);

    // 5. Brake Rotor Disc & Caliper (Caliper stays fixed on steerGroup so it doesn't spin wildly)
    const rotorGeo = new THREE.CylinderGeometry(wheelRadius * 0.52, wheelRadius * 0.52, 0.02, 16);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotor = new THREE.Mesh(rotorGeo, chromeMaterial);
    spinPivot.add(rotor);

    const caliperGeo = new THREE.BoxGeometry(0.06, wheelRadius * 0.28, wheelRadius * 0.24);
    const caliper = new THREE.Mesh(caliperGeo, caliperMaterial);
    caliper.position.set(pos.isLeft ? -0.04 : 0.04, wheelRadius * 0.32, 0);
    steerGroup.add(caliper);
  });

  // --- 8. REALISTIC NEON GROUND UNDERGLOW (Projects onto road) ---
  const underglowPlaneGeo = new THREE.PlaneGeometry(width * 1.15, length * 1.05);
  const underglowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(underglowColor),
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide
  });
  const underglowMesh = new THREE.Mesh(underglowPlaneGeo, underglowMat);
  underglowMesh.rotation.x = Math.PI / 2;
  underglowMesh.position.y = 0.03; // slightly above road surface
  group.add(underglowMesh);

  // Underglow center light (casts real lighting on nearby road tiles)
  const underglowLight = new THREE.PointLight(new THREE.Color(underglowColor), 1.6, 6.0);
  underglowLight.position.set(0, 0.25, 0);
  group.add(underglowLight);

  // --- USER DATA & RUNTIME API ---
  group.userData = {
    carId,
    bodyMaterial,
    secondaryBodyMat,
    rimMaterial,
    underglowMat,
    underglowLight,
    brakeLightMesh,
    exhaustFlames,
    chassisGroup,
    wheelSpinPivots,
    frontSteerGroups,

    updatePaint: (newColor) => {
      const col = new THREE.Color(newColor);
      bodyMaterial.color.copy(col);
      secondaryBodyMat.color.copy(col).multiplyScalar(0.7);
    },

    updateUnderglow: (newColor) => {
      const col = new THREE.Color(newColor);
      underglowMat.color.copy(col);
      underglowLight.color.copy(col);
    },

    spinWheels: (amount) => {
      wheelSpinPivots.forEach(pivot => {
        pivot.rotation.x += amount;
      });
    },

    steerWheels: (angle) => {
      frontSteerGroups.forEach(group => {
        group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, angle, 0.2);
      });
    },

    setBrake: (active) => {
      if (brakeLightMesh) {
        brakeLightMesh.visible = active;
      }
      taillightMaterial.color.set(active ? 0xff0022 : 0xff1644);
    },

    setNitro: (active) => {
      exhaustFlames.forEach(flame => {
        flame.visible = active;
        if (active) {
          // Dynamic flicker scale
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
