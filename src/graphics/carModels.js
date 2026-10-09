/**
 * KeyRush 3D Procedural Vehicle Mesh Factory (Three.js)
 * Generates futuristic aerodynamic sports cars, hypercars, and tuner vehicles
 * with dynamic materials, paint finishes, illuminated LEDs, and underglow.
 */

import * as THREE from 'three';

export const VEHICLE_CATALOG = [
  {
    id: 'talon',
    name: 'Apex Talon',
    tier: 'Starter',
    rarity: 'Common',
    baseTopSpeed: '160 km/h',
    acceleration: '4.2s',
    handling: 'A+',
    unlockCondition: 'Default Starter Vehicle',
    description: 'Agile cyber-coupe engineered for crisp responsiveness and novice racers.',
    unlocked: true
  },
  {
    id: 'vortex',
    name: 'Vortex R34',
    tier: 'Street',
    rarity: 'Rare',
    baseTopSpeed: '185 km/h',
    acceleration: '3.6s',
    handling: 'S',
    unlockCondition: 'Win 3 AI Races or reach 60 WPM',
    description: 'Widebody tuner with reinforced downforce and twin-turbo induction.',
    unlocked: true
  },
  {
    id: 'phantom',
    name: 'Phantom GT',
    tier: 'Performance',
    rarity: 'Epic',
    baseTopSpeed: '210 km/h',
    acceleration: '2.9s',
    handling: 'S+',
    unlockCondition: 'Reach 80 WPM in any race',
    description: 'Mid-engine exotic sculpted for sustained high-speed highway sprints.',
    unlocked: false
  },
  {
    id: 'nebula',
    name: 'Nebula ZX',
    tier: 'Hypercar',
    rarity: 'Legendary',
    baseTopSpeed: '240 km/h',
    acceleration: '2.3s',
    handling: 'Apex',
    unlockCondition: 'Complete a 7-day daily practice streak',
    description: 'Carbon-monocoque endurance prototype with active ground-effect tunnels.',
    unlocked: false
  },
  {
    id: 'chronos',
    name: 'Chronos V12',
    tier: 'Legendary',
    rarity: 'Mythic',
    baseTopSpeed: '275 km/h',
    acceleration: '1.9s',
    handling: 'Transcend',
    unlockCondition: 'Reach 100 WPM with ≥ 98% Accuracy',
    description: 'Experimental hyper-craft with magnetic aero surfaces and plasma drive.',
    unlocked: false
  }
];

export function createCarMesh(carId = 'talon', options = {}) {
  const group = new THREE.Group();
  group.name = `car_${carId}`;

  const paintColor = options.paintColor || '#00e5ff';
  const underglowColor = options.underglowColor || '#00e5ff';

  // Body Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(paintColor),
    metalness: 0.85,
    roughness: 0.22,
    envMapIntensity: 1.5
  });

  const darkTrimMaterial = new THREE.MeshStandardMaterial({
    color: 0x11131a,
    metalness: 0.9,
    roughness: 0.4
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x050a14,
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.6,
    transparent: true,
    opacity: 0.85
  });

  const headlightMaterial = new THREE.MeshBasicMaterial({
    color: 0x00f5ff
  });

  const taillightMaterial = new THREE.MeshBasicMaterial({
    color: 0xff1144
  });

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1c24,
    roughness: 0.95,
    metalness: 0.0
  });

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(paintColor),
    metalness: 0.9,
    roughness: 0.2
  });

  // Base chassis dimensions
  let length = 4.0;
  let width = 1.8;
  let height = 0.9;

  if (carId === 'phantom' || carId === 'nebula') {
    length = 4.3;
    width = 2.0;
    height = 0.8;
  } else if (carId === 'chronos') {
    length = 4.5;
    width = 2.1;
    height = 0.75;
  }

  // --- MAIN LOWER CHASSIS (sits just above ground) ---
  // Car sits on ground: wheels touch y=0, chassis base at wheelRadius (0.32)
  const chassisY = 0.32;

  const bodyGeo = new THREE.BoxGeometry(width, height * 0.45, length);
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMaterial);
  bodyMesh.position.y = chassisY + height * 0.22;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Front hood slope
  const hoodGeo = new THREE.BoxGeometry(width * 0.90, height * 0.22, length * 0.38);
  const hoodMesh = new THREE.Mesh(hoodGeo, bodyMaterial);
  hoodMesh.position.set(0, chassisY + height * 0.38, length * 0.28);
  hoodMesh.rotation.x = -0.10;
  hoodMesh.castShadow = true;
  group.add(hoodMesh);

  // --- CABIN / COCKPIT CANOPY ---
  const cabinLength = length * 0.42;
  const cabinWidth = width * 0.74;
  const cabinHeight = height * 0.55;
  const cabinGeo = new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength);
  const cabinMesh = new THREE.Mesh(cabinGeo, glassMaterial);
  cabinMesh.position.set(0, chassisY + height * 0.45 + cabinHeight * 0.5, -length * 0.03);
  cabinMesh.castShadow = true;
  group.add(cabinMesh);

  // Roof plate
  const roofGeo = new THREE.BoxGeometry(cabinWidth * 0.9, 0.06, cabinLength * 0.75);
  const roofMesh = new THREE.Mesh(roofGeo, bodyMaterial);
  roofMesh.position.set(0, chassisY + height * 0.45 + cabinHeight, -length * 0.03);
  group.add(roofMesh);

  // --- FRONT SPLITTER & GRILLE ---
  const splitterGeo = new THREE.BoxGeometry(width * 1.04, 0.08, length * 0.12);
  const splitter = new THREE.Mesh(splitterGeo, darkTrimMaterial);
  splitter.position.set(0, chassisY, length * 0.47);
  group.add(splitter);

  // --- REAR DIFFUSER & SPOILER ---
  const diffuserGeo = new THREE.BoxGeometry(width * 0.96, 0.14, 0.2);
  const diffuser = new THREE.Mesh(diffuserGeo, darkTrimMaterial);
  diffuser.position.set(0, chassisY + 0.06, -length * 0.5);
  group.add(diffuser);

  // Rear Wing / Spoiler
  const wingWidth = width * 1.05;
  const wingGeo = new THREE.BoxGeometry(wingWidth, 0.06, 0.42);
  const wingMesh = new THREE.Mesh(wingGeo, darkTrimMaterial);
  wingMesh.position.set(0, chassisY + height * 0.75, -length * 0.44);
  group.add(wingMesh);

  // Wing uprights
  const uprightGeo = new THREE.BoxGeometry(0.05, 0.30, 0.22);
  const leftUpright = new THREE.Mesh(uprightGeo, darkTrimMaterial);
  leftUpright.position.set(-wingWidth * 0.35, chassisY + height * 0.58, -length * 0.44);
  const rightUpright = new THREE.Mesh(uprightGeo, darkTrimMaterial);
  rightUpright.position.set(wingWidth * 0.35, chassisY + height * 0.58, -length * 0.44);
  group.add(leftUpright);
  group.add(rightUpright);

  // --- HEADLIGHTS & TAILLIGHTS ---
  const headlightGeo = new THREE.BoxGeometry(0.32, 0.07, 0.08);
  const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMaterial);
  leftHeadlight.position.set(-width * 0.34, chassisY + height * 0.22, length * 0.50);
  const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMaterial);
  rightHeadlight.position.set(width * 0.34, chassisY + height * 0.22, length * 0.50);
  group.add(leftHeadlight);
  group.add(rightHeadlight);

  // Taillight bar
  const taillightGeo = new THREE.BoxGeometry(width * 0.82, 0.07, 0.05);
  const taillightMesh = new THREE.Mesh(taillightGeo, taillightMaterial);
  taillightMesh.position.set(0, chassisY + height * 0.28, -length * 0.505);
  group.add(taillightMesh);

  // --- DUAL EXHAUST PORTS ---
  const exhaustGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.18, 10);
  const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.9, roughness: 0.2 });
  const leftExhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
  leftExhaust.rotation.x = Math.PI / 2;
  leftExhaust.position.set(-0.32, chassisY + 0.08, -length * 0.51);
  const rightExhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
  rightExhaust.rotation.x = Math.PI / 2;
  rightExhaust.position.set(0.32, chassisY + 0.08, -length * 0.51);
  group.add(leftExhaust);
  group.add(rightExhaust);

  // --- 4 WHEELS WITH PROPER GEOMETRY ---
  // Wheels: CylinderGeometry with axis along X. Pivot is the wheel center.
  const wheelRadius = 0.32;
  const wheelThickness = 0.22;

  // Wheel positions: x = ±(halfWidth + wheelThickness/2), y = wheelRadius (on ground), z = front/rear
  const wheelPositions = [
    { x: -(width * 0.5 + wheelThickness * 0.4), y: wheelRadius, z: length * 0.27, isFront: true },   // Front Left
    { x:  (width * 0.5 + wheelThickness * 0.4), y: wheelRadius, z: length * 0.27, isFront: true },   // Front Right
    { x: -(width * 0.5 + wheelThickness * 0.4), y: wheelRadius, z: -length * 0.26, isFront: false }, // Rear Left
    { x:  (width * 0.5 + wheelThickness * 0.4), y: wheelRadius, z: -length * 0.26, isFront: false }  // Rear Right
  ];

  const wheels = [];
  wheelPositions.forEach((pos) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(pos.x, pos.y, pos.z);

    // Tire - cylinder with axis on X
    const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelThickness, 20);
    tireGeo.rotateZ(Math.PI / 2); // Now cylinder axis is along X
    const tire = new THREE.Mesh(tireGeo, tireMaterial);
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Rim hub (smaller, same axis)
    const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.62, wheelRadius * 0.62, wheelThickness + 0.01, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, rimMaterial);
    wheelGroup.add(rim);

    // Hub center cap
    const capGeo = new THREE.CylinderGeometry(wheelRadius * 0.15, wheelRadius * 0.15, wheelThickness + 0.04, 8);
    capGeo.rotateZ(Math.PI / 2);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1.0, roughness: 0.1 });
    const cap = new THREE.Mesh(capGeo, capMat);
    wheelGroup.add(cap);

    // Tread grooves (dark band around tire)
    const treadGeo = new THREE.TorusGeometry(wheelRadius, 0.03, 6, 20);
    treadGeo.rotateY(Math.PI / 2);
    const treadMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a });
    const tread = new THREE.Mesh(treadGeo, treadMat);
    wheelGroup.add(tread);

    group.add(wheelGroup);
    wheels.push(wheelGroup);
  });

  // --- NEON UNDERGLOW (subtle, low opacity) ---
  const underglowPlaneGeo = new THREE.PlaneGeometry(width * 1.0, length * 0.88);
  const underglowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(underglowColor),
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide
  });
  const underglowMesh = new THREE.Mesh(underglowPlaneGeo, underglowMat);
  underglowMesh.rotation.x = Math.PI / 2;
  underglowMesh.position.y = 0.02;
  group.add(underglowMesh);

  // Store references for runtime updates
  group.userData = {
    carId,
    bodyMaterial,
    underglowMat,
    rimMaterial,
    wheels,
    leftExhaust,
    rightExhaust,
    updatePaint: (newColor) => {
      bodyMaterial.color.set(newColor);
      rimMaterial.color.set(newColor);
    },
    updateUnderglow: (newColor) => {
      underglowMat.color.set(newColor);
    },
    // Spin wheels around X axis (since tires are cylinder rotated Z=90deg, the rolling axis is now Y in local space)
    // Actually after rotateZ(PI/2), the cylinder runs along X. To roll the wheel forward/backward we rotate around X.
    spinWheels: (speed) => {
      wheels.forEach(w => {
        w.rotation.x += speed;
      });
    }
  };

  return group;
}
