/**
 * KeyRush 3D Track & Racing World Engine (Three.js) — AAA Production Implementation
 * - Premium Stylized-Realistic Urban Night Expressway
 * - Continuous wet asphalt highway with aggregate texture, tire tracks, and specular sheen
 * - Armco metal guardrails on concrete barriers with cat-eye retro-reflectors
 * - Highway streetlamps with warm sodium road light pools on wet asphalt
 * - Overhead green directional sign gantries ("Downtown 2 km", "Riverside 5 km") with floodlights
 * - Varied skyscraper architecture with office window grids, spires, flashing red aviation beacons,
 *   and rooftop architectural neon signs ("FASTER SMARTER STRONGER")
 * - Supercar chase camera positioning with unobstructed framing of player vehicle & road
 * - Multi-opponent grid with hovering HUD nameplates and live telemetry
 */

import * as THREE from 'three';
import { createCarMesh, createOpponentNameplate, getNightEnvironmentTexture } from './carModels.js';

// Number of road tiles in the infinite loop pool
const TILE_COUNT = 16;
const TILE_LENGTH = 45; // 45 units each
const TOTAL_WORLD_BUFFER = TILE_COUNT * TILE_LENGTH; // 720 units buffer

export class Track3D {
  constructor(canvasContainer, options = {}) {
    this.container = canvasContainer;
    this.options = options;
    this.circuit = options.circuit || 'Neo-Metropolis GP';
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animId = null;
    this.isPaused = false;
    this.isFinished = false;

    // Racing Entities
    this.playerCar = null;
    this.opponentCars = new Map(); // id -> { mesh, nameplate, visualZ, targetVisualZ, laneX, currentX, wpm, progress }
    this.trackWidth = 26; // 4 highway lanes
    // 4 Distinct lanes: Outer-Left (9.75), Center-Left (3.25), Center-Right (-3.25), Outer-Right (-9.75)
    this.lanes = [9.75, 3.25, -3.25, -9.75];
    this.currentLaneIndex = 1; // Default to Center-Left lane (3.25)
    this.targetPlayerX = this.lanes[this.currentLaneIndex];

    // World Motion
    this.simulation = null;
    this.onTelemetryTick = null;
    this.worldZ = 0;
    this.playerSpeed = 0; // units/sec based on WPM
    this.targetSpeed = 0;
    this.wpmRatio = 0;
    this.playerProgress = 0;
    this.isBraking = false;
    this.isCountdown = false;
    this.lastKeystrokeTime = performance.now();

    // Scenery & Tile Pools
    this.tiles = [];
    this.beaconLights = [];

    // Particle Systems & VFX
    this.nitroParticles = null;
    this.nitroPositions = null;
    this.nitroVelocities = null;
    this.speedLines = null;
    this.speedLinePositions = null;
    this.speedLineCount = 60;
    this.rainParticles = null;
    this.rainPositions = null;

    // Grounded Player Vehicle & Chase Camera Telemetry
    // Player car is anchored at Z = 2.0. Camera is positioned to frame the supercar
    // in the lower-middle third, grounded firmly on wet asphalt above the HUD teleprompter.
    this.playerBaseZ = 2.0;
    this.cameraOffset = new THREE.Vector3(0, 2.2, -6.6);
    this.smoothedCamPos = new THREE.Vector3(this.targetPlayerX, 2.2, -4.6);
    this.smoothedLookAt = new THREE.Vector3(this.targetPlayerX, 1.25, 45);
    this.camShake = 0;
    this.isFirstFrame = true;
    this.countdownElapsed = 0;

    this.lastFrameTime = performance.now();
    this.elapsedTime = 0;

    this.onVisibilityChange = this.handleVisibilityChange.bind(this);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.init();
  }

  // ------------------------------------------------------------------ INITIALIZATION
  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    const isSunset = (this.circuit === 'Sunset Horizon Expressway' || this.circuit.includes('Sunset'));
    const isRain = (this.circuit === 'Tokyo Neon Rain Circuit' || this.circuit.includes('Rain'));

    let bgColor = 0x050811;
    let fogDensity = 0.0034;

    if (isSunset) {
      bgColor = 0x160c20;
      fogDensity = 0.0032;
    } else if (isRain) {
      bgColor = 0x03060c;
      fogDensity = 0.0048;
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(bgColor);
    this.scene.fog = new THREE.FogExp2(bgColor, fogDensity);

    // Camera (natural FOV 62 for believable perspective and depth)
    this.camera = new THREE.PerspectiveCamera(62, width / height, 0.2, 950);
    this.camera.position.set(this.targetPlayerX, 3.2, -5.6);

    // WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = isSunset ? 1.35 : (isRain ? 1.2 : 1.25);
    this.renderer.domElement.className = 'track-3d-webgl-canvas';
    this.container.appendChild(this.renderer.domElement);

    // Procedural Textures & Materials
    this.buildProceduralTextures();

    // Lighting & Environment
    this.setupLighting();
    this.buildSkylineDome();

    // Infinite Highway & City Environment
    this.buildRoadTilePool();
    this.buildSpeedLines();
    this.buildNitroParticles();
    if (isRain) {
      this.buildRainParticles();
    }
    this.buildFinishGate();

    // Listeners
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    this.lastFrameTime = performance.now();
    this.animate = this.animate.bind(this);
    this.animate();
  }

  handleVisibilityChange() {
    this.lastFrameTime = performance.now();
  }

  // ------------------------------------------------------------------ PROCEDURAL TEXTURES
  buildProceduralTextures() {
    if (typeof document === 'undefined') return;

    // 1. Wet Asphalt Road Texture (Granular stone tarmac + longitudinal wheel wear + specular sheen)
    const roadCanvas = document.createElement('canvas');
    roadCanvas.width = 1024;
    roadCanvas.height = 1024;
    const rCtx = roadCanvas.getContext('2d');

    // Deep charcoal asphalt base
    rCtx.fillStyle = '#0a0d14';
    rCtx.fillRect(0, 0, 1024, 1024);

    // Micro asphalt stone noise
    const imgData = rCtx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 26;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise + 1));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + 4));
    }
    rCtx.putImageData(imgData, 0, 0);

    // Longitudinal wheel track shading (subtle darker parallel grooves)
    rCtx.fillStyle = 'rgba(4, 6, 10, 0.45)';
    [120, 240, 380, 500, 640, 760, 890].forEach(tx => {
      rCtx.fillRect(tx - 35, 0, 70, 1024);
    });

    // Wet reflective sheen patches
    const grad = rCtx.createRadialGradient(512, 512, 60, 512, 512, 480);
    grad.addColorStop(0, 'rgba(40, 75, 120, 0.12)');
    grad.addColorStop(0.6, 'rgba(15, 30, 55, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    rCtx.fillStyle = grad;
    rCtx.fillRect(0, 0, 1024, 1024);

    this.roadTexture = new THREE.CanvasTexture(roadCanvas);
    this.roadTexture.wrapS = THREE.RepeatWrapping;
    this.roadTexture.wrapT = THREE.RepeatWrapping;
    this.roadTexture.repeat.set(2, 6);

    // 2. High-Quality Skyscraper Window Grid Textures (Architectural Office Facades)
    this.windowTextures = [];
    const themes = [
      { warm: '#ffd285', cool: '#c8e2ff', accent: '#38bdf8' },
      { warm: '#f6ad55', cool: '#b0d6f5', accent: '#60a5fa' },
      { warm: '#ffcc77', cool: '#d0e6ff', accent: '#00e5ff' }
    ];

    themes.forEach(th => {
      const winCanvas = document.createElement('canvas');
      winCanvas.width = 512;
      winCanvas.height = 1024;
      const wCtx = winCanvas.getContext('2d');

      wCtx.fillStyle = '#060810';
      wCtx.fillRect(0, 0, 512, 1024);

      const cols = 22;
      const rows = 46;
      const cellW = 512 / cols;
      const cellH = 1024 / rows;

      // Dark structural spandrel bands every 4 floors
      for (let r = 0; r < rows; r++) {
        const isSpandrel = (r % 6 === 0);
        for (let c = 0; c < cols; c++) {
          if (isSpandrel) {
            wCtx.fillStyle = '#0e1524';
            wCtx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
            continue;
          }

          const isLit = Math.random() > 0.46;
          if (isLit) {
            const rand = Math.random();
            if (rand < 0.62) {
              wCtx.fillStyle = th.cool;
            } else if (rand < 0.88) {
              wCtx.fillStyle = th.warm;
            } else {
              wCtx.fillStyle = th.accent;
            }
            wCtx.fillRect(c * cellW + 2, r * cellH + 2, cellW - 4, cellH - 4);
          } else {
            // Unlit dark window
            wCtx.fillStyle = 'rgba(12, 18, 30, 0.85)';
            wCtx.fillRect(c * cellW + 2, r * cellH + 2, cellW - 4, cellH - 4);
          }
        }
      }

      const tex = new THREE.CanvasTexture(winCanvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      this.windowTextures.push(tex);
    });

    // 3. Soft Radial Taillight Ground Reflection Texture
    const tailCanvas = document.createElement('canvas');
    tailCanvas.width = 256;
    tailCanvas.height = 256;
    const tCtx = tailCanvas.getContext('2d');
    const tGrad = tCtx.createRadialGradient(128, 128, 12, 128, 128, 120);
    tGrad.addColorStop(0, 'rgba(255, 20, 60, 0.65)');
    tGrad.addColorStop(0.4, 'rgba(255, 10, 40, 0.22)');
    tGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    tCtx.fillStyle = tGrad;
    tCtx.fillRect(0, 0, 256, 256);
    this.taillightReflectionTexture = new THREE.CanvasTexture(tailCanvas);

    // 4. Soft Radial Warm Sodium Streetlamp Road Pool Texture
    const lampCanvas = document.createElement('canvas');
    lampCanvas.width = 256;
    lampCanvas.height = 256;
    const lCtx = lampCanvas.getContext('2d');
    const lGrad = lCtx.createRadialGradient(128, 128, 15, 128, 128, 120);
    lGrad.addColorStop(0, 'rgba(255, 175, 60, 0.50)');
    lGrad.addColorStop(0.45, 'rgba(255, 135, 30, 0.18)');
    lGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    lCtx.fillStyle = lGrad;
    lCtx.fillRect(0, 0, 256, 256);
    this.streetlampPoolTexture = new THREE.CanvasTexture(lampCanvas);

    // 3. Overhead Highway Directional Sign Canvas Texture ("Downtown 2 km", "Riverside 5 km")
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024;
    signCanvas.height = 340;
    const sCtx = signCanvas.getContext('2d');

    // Highway Sign Base (Dark Forest Green with double border)
    sCtx.fillStyle = '#0d542b'; // Authentic expressway green
    sCtx.fillRect(0, 0, 1024, 340);

    sCtx.strokeStyle = '#f8fafc';
    sCtx.lineWidth = 10;
    sCtx.strokeRect(12, 12, 1000, 316);

    sCtx.lineWidth = 3;
    sCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    sCtx.strokeRect(26, 26, 972, 288);

    // Left Panel: ↑ Downtown  2 km
    sCtx.fillStyle = '#f8fafc';
    sCtx.font = 'bold 84px sans-serif';
    sCtx.textAlign = 'left';
    sCtx.fillText('↑', 60, 140);
    sCtx.font = 'bold 54px sans-serif';
    sCtx.fillText('Downtown', 160, 135);
    sCtx.font = 'bold 44px monospace';
    sCtx.fillStyle = '#a7f3d0';
    sCtx.fillText('2 km', 165, 215);

    // Vertical Divider
    sCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    sCtx.lineWidth = 4;
    sCtx.beginPath();
    sCtx.moveTo(520, 35);
    sCtx.lineTo(520, 305);
    sCtx.stroke();

    // Right Panel: ↗ Riverside  5 km
    sCtx.fillStyle = '#f8fafc';
    sCtx.font = 'bold 54px sans-serif';
    sCtx.fillText('Riverside', 570, 135);
    sCtx.font = 'bold 84px sans-serif';
    sCtx.fillText('↗', 890, 140);
    sCtx.font = 'bold 44px monospace';
    sCtx.fillStyle = '#a7f3d0';
    sCtx.fillText('5 km', 575, 215);

    // Lane Guidance Indicator bottom strip
    sCtx.fillStyle = '#063a1e';
    sCtx.fillRect(28, 250, 968, 62);
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 26px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('EXPRESSWAY METROPOLIS • LANES 1-4 OPEN', 512, 290);

    this.gantrySignTexture = new THREE.CanvasTexture(signCanvas);

    // 4. Rooftop Architectural Sign Texture ("FASTER SMARTER STRONGER")
    const quoteCanvas = document.createElement('canvas');
    quoteCanvas.width = 512;
    quoteCanvas.height = 256;
    const qCtx = quoteCanvas.getContext('2d');
    qCtx.fillStyle = '#070b14';
    qCtx.fillRect(0, 0, 512, 256);
    qCtx.strokeStyle = '#00e5ff';
    qCtx.lineWidth = 6;
    qCtx.strokeRect(8, 8, 496, 240);

    qCtx.fillStyle = '#ffffff';
    qCtx.font = '900 48px sans-serif';
    qCtx.textAlign = 'center';
    qCtx.fillText('FASTER', 256, 75);
    qCtx.fillStyle = '#00e5ff';
    qCtx.fillText('SMARTER', 256, 140);
    qCtx.fillStyle = '#a855f7';
    qCtx.fillText('STRONGER', 256, 205);

    this.rooftopSignTexture = new THREE.CanvasTexture(quoteCanvas);
  }

  // ------------------------------------------------------------------ WORLD LIGHTING
  setupLighting() {
    const isSunset = (this.circuit === 'Sunset Horizon Expressway' || this.circuit.includes('Sunset'));
    const isRain = (this.circuit === 'Tokyo Neon Rain Circuit' || this.circuit.includes('Rain'));

    // 1. Balanced Nocturnal Ambient Fill (Keeps cars and road readable without wash-out)
    const ambCol = isSunset ? 0x2e1a38 : (isRain ? 0x141e2e : 0x162238);
    const ambient = new THREE.AmbientLight(ambCol, isSunset ? 2.2 : 2.0);
    this.scene.add(ambient);

    // 2. Directional Moonlight (Elevated cool-blue directional light casting soft shadows)
    const moonCol = isSunset ? 0xffb86c : (isRain ? 0x7eb0db : 0x89b4e8);
    const moonLight = new THREE.DirectionalLight(moonCol, isSunset ? 3.0 : 2.6);
    moonLight.position.set(20, 55, 30);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    moonLight.shadow.camera.near = 1;
    moonLight.shadow.camera.far = 200;
    moonLight.shadow.camera.left = -26;
    moonLight.shadow.camera.right = 26;
    moonLight.shadow.camera.top = 35;
    moonLight.shadow.camera.bottom = -35;
    moonLight.shadow.bias = -0.001;
    this.scene.add(moonLight);
    this.moonLight = moonLight;

    // 3. Player Forward Projector Headlights (Projects crisp beam along the highway)
    this.carHeadlight = new THREE.SpotLight(0xf2f7ff, 6.0, 55, Math.PI / 4.5, 0.45, 1.2);
    this.carHeadlight.position.set(this.targetPlayerX, 1.1, this.playerBaseZ + 2);
    this.carHeadlightTarget = new THREE.Object3D();
    this.carHeadlightTarget.position.set(this.targetPlayerX, 0.1, this.playerBaseZ + 36);
    this.scene.add(this.carHeadlightTarget);
    this.carHeadlight.target = this.carHeadlightTarget;
    this.scene.add(this.carHeadlight);

    // 4. Subtle Soft Red Taillight Wet-Road Glow (Behind Player Supercar)
    const redGlowGeo = new THREE.PlaneGeometry(4.2, 5.5);
    const redGlowMat = new THREE.MeshBasicMaterial({
      map: this.taillightReflectionTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.taillightGlow = new THREE.Mesh(redGlowGeo, redGlowMat);
    this.taillightGlow.rotation.x = -Math.PI / 2;
    this.taillightGlow.position.set(this.targetPlayerX, 0.02, this.playerBaseZ - 2.8);
    this.scene.add(this.taillightGlow);
  }

  // ------------------------------------------------------------------ DISTANT SKYLINE DOME
  buildSkylineDome() {
    if (typeof document === 'undefined') return;

    const domeGeo = new THREE.CylinderGeometry(440, 440, 240, 36, 1, true);
    domeGeo.rotateY(Math.PI);

    const domeCanvas = document.createElement('canvas');
    domeCanvas.width = 1024;
    domeCanvas.height = 512;
    const dCtx = domeCanvas.getContext('2d');

    // Deep nocturnal gradient with warm horizon skyline glow
    const grad = dCtx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#02040a');
    grad.addColorStop(0.42, '#060d1a');
    grad.addColorStop(0.72, '#0c1a32');
    grad.addColorStop(0.90, '#1c2844');
    grad.addColorStop(1, '#080d18');
    dCtx.fillStyle = grad;
    dCtx.fillRect(0, 0, 1024, 512);

    // Distant skyscraper silhouettes with illuminated windows & spires
    dCtx.fillStyle = '#060a14';
    for (let x = 0; x < 1024; x += 16 + Math.random() * 26) {
      const bH = 90 + Math.random() * 190;
      const bW = 16 + Math.random() * 24;
      dCtx.fillRect(x, 512 - bH, bW, bH);

      // Distant pinnacle beacon
      if (Math.random() > 0.35) {
        dCtx.fillStyle = Math.random() > 0.6 ? '#ff2255' : '#70b5ff';
        dCtx.fillRect(x + bW / 2 - 1, 512 - bH - 6, 2, 6);
        dCtx.fillStyle = '#060a14';
      }
    }

    const domeTex = new THREE.CanvasTexture(domeCanvas);
    domeTex.wrapS = THREE.RepeatWrapping;
    domeTex.repeat.set(2, 1);

    const domeMat = new THREE.MeshBasicMaterial({
      map: domeTex,
      side: THREE.BackSide,
      fog: false
    });

    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.position.set(0, 85, 0);
    this.scene.add(domeMesh);
    this.skylineDome = domeMesh;
  }

  // ------------------------------------------------------------------ ROAD TILE POOL & SCENERY
  buildRoadTilePool() {
    const isRain = (this.circuit === 'Tokyo Neon Rain Circuit' || this.circuit.includes('Rain'));

    // PBR Wet Asphalt Roadbed Material with Sky Reflection
    const envMap = getNightEnvironmentTexture();
    const roadMat = new THREE.MeshStandardMaterial({
      map: this.roadTexture,
      roughness: isRain ? 0.16 : 0.22,
      metalness: isRain ? 0.72 : 0.60,
      envMap: envMap,
      envMapIntensity: 2.4
    });

    // Materials
    const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.95 });
    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf0f6ff, transparent: true, opacity: 0.92 });
    const barrierMetalMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.22,
      envMap: envMap,
      envMapIntensity: 1.6
    });
    const barrierBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const catEyeYellowMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const catEyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const hw = this.trackWidth / 2; // 13.0 units

    for (let i = 0; i < TILE_COUNT; i++) {
      const group = new THREE.Group();
      const baseZ = i * TILE_LENGTH;

      // 1. Asphalt Roadbed (Covers track width plus shoulders)
      const roadGeo = new THREE.PlaneGeometry(this.trackWidth + 3.0, TILE_LENGTH);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.receiveShadow = true;
      group.add(road);

      // 2. Continuous Highway Edge Markings
      // Inner/Left: Solid Yellow Line
      const yLineGeo = new THREE.PlaneGeometry(0.32, TILE_LENGTH);
      const yLine = new THREE.Mesh(yLineGeo, yellowLineMat);
      yLine.rotation.x = -Math.PI / 2;
      yLine.position.set(hw - 0.3, 0.02, 0);
      group.add(yLine);

      // Outer/Right: Solid White Line
      const wLineGeo = new THREE.PlaneGeometry(0.32, TILE_LENGTH);
      const wLine = new THREE.Mesh(wLineGeo, whiteLineMat);
      wLine.rotation.x = -Math.PI / 2;
      wLine.position.set(-hw + 0.3, 0.02, 0);
      group.add(wLine);

      // 3. 3 Dashed Lane Lines for 4 Lanes (at X = -6.5, 0, +6.5)
      const dashLength = 6.0;
      const dashGap = 9.0;
      const dashCount = Math.floor(TILE_LENGTH / (dashLength + dashGap));
      const dashGeo = new THREE.PlaneGeometry(0.28, dashLength);

      for (let d = 0; d < dashCount; d++) {
        const dz = -TILE_LENGTH / 2 + d * (dashLength + dashGap) + dashLength / 2 + 1;
        [-6.5, 0, 6.5].forEach(x => {
          const dash = new THREE.Mesh(dashGeo, whiteLineMat);
          dash.rotation.x = -Math.PI / 2;
          dash.position.set(x, 0.025, dz);
          group.add(dash);
        });
      }

      // 4. Armco Metal Crash Barriers with Concrete Base & Cat-Eye Reflectors
      [-hw - 0.4, hw + 0.4].forEach((bx, sideIdx) => {
        // Concrete Jersey barrier foundation
        const baseGeo = new THREE.BoxGeometry(0.5, 0.45, TILE_LENGTH);
        const baseMesh = new THREE.Mesh(baseGeo, barrierBaseMat);
        baseMesh.position.set(bx, 0.22, 0);
        baseMesh.receiveShadow = true;
        group.add(baseMesh);

        // Corrugated W-beam metal guardrail profile
        const railGeo = new THREE.BoxGeometry(0.18, 0.45, TILE_LENGTH);
        const rail = new THREE.Mesh(railGeo, barrierMetalMat);
        rail.position.set(bx, 0.65, 0);
        rail.castShadow = true;
        rail.receiveShadow = true;
        group.add(rail);

        // Steel barrier support posts every 5m
        for (let pz = -TILE_LENGTH / 2 + 2.5; pz < TILE_LENGTH / 2; pz += 5.0) {
          const postGeo = new THREE.BoxGeometry(0.14, 0.85, 0.14);
          const post = new THREE.Mesh(postGeo, barrierMetalMat);
          post.position.set(bx + (sideIdx === 0 ? -0.15 : 0.15), 0.42, pz);
          group.add(post);

          // Cat-eye reflector stud
          const studGeo = new THREE.BoxGeometry(0.12, 0.08, 0.15);
          const stud = new THREE.Mesh(studGeo, sideIdx === 0 ? catEyeYellowMat : catEyeWhiteMat);
          stud.position.set(bx, 0.65, pz);
          group.add(stud);
        }
      });

      // 5. Curved Highway Streetlamps & Warm Sodium Light Pools
      [-hw - 1.8, hw + 1.8].forEach((lx, sideIdx) => {
        const lampGroup = new THREE.Group();
        lampGroup.position.set(lx, 0, 0);

        // Tapered highway luminaire pole
        const poleGeo = new THREE.CylinderGeometry(0.10, 0.16, 8.2, 8);
        const pole = new THREE.Mesh(poleGeo, barrierMetalMat);
        pole.position.set(0, 4.1, 0);
        lampGroup.add(pole);

        // Curving overhanging arm
        const armGeo = new THREE.BoxGeometry(sideIdx === 0 ? 3.2 : -3.2, 0.12, 0.18);
        const arm = new THREE.Mesh(armGeo, barrierMetalMat);
        arm.position.set(sideIdx === 0 ? 1.6 : -1.6, 8.1, 0);
        lampGroup.add(arm);

        // Luminaire housing
        const headGeo = new THREE.BoxGeometry(0.7, 0.16, 0.9);
        const head = new THREE.Mesh(headGeo, barrierMetalMat);
        head.position.set(sideIdx === 0 ? 3.0 : -3.0, 8.0, 0);
        lampGroup.add(head);

        // Warm sodium light lens
        const lensGeo = new THREE.BoxGeometry(0.55, 0.05, 0.75);
        const lens = new THREE.Mesh(lensGeo, new THREE.MeshBasicMaterial({ color: 0xffcc77 }));
        lens.position.set(sideIdx === 0 ? 3.0 : -3.0, 7.9, 0);
        lampGroup.add(lens);

        // Projected warm sodium light pool on wet asphalt
        const poolGeo = new THREE.PlaneGeometry(9.2, 8.2);
        const poolMat = new THREE.MeshBasicMaterial({
          map: this.streetlampPoolTexture,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const pool = new THREE.Mesh(poolGeo, poolMat);
        pool.rotation.x = -Math.PI / 2;
        pool.position.set(sideIdx === 0 ? 5.2 : -5.2, 0.03, 0);
        lampGroup.add(pool);

        group.add(lampGroup);
      });

      // 6. Varied Architectural Skyscrapers with Illuminated Windows & Spires
      this.buildTileCityScenery(group, i, hw);

      // 7. Overhead Green Highway Directional Sign Gantries (Every 4th tile)
      if (i % 4 === 1) {
        this.buildOverheadGantry(group);
      }

      group.position.z = baseZ;
      this.scene.add(group);
      this.tiles.push({ group, baseZ });
    }
  }

  buildTileCityScenery(tileGroup, tileIdx, hw) {
    if (!this.windowTextures || this.windowTextures.length === 0) return;

    [-1, 1].forEach(side => {
      for (let b = 0; b < 2; b++) {
        // High variation in skyscraper dimensions & realistic highway setbacks
        const height = 55 + Math.random() * 115;
        const width = 16 + Math.random() * 14;
        const depth = 18 + Math.random() * 18;

        const posX = side * (hw + 22 + b * 28 + Math.random() * 6);
        const posZ = -TILE_LENGTH / 2 + (b + 0.5) * (TILE_LENGTH / 2);

        const texIdx = Math.floor(Math.random() * this.windowTextures.length);
        const winTex = this.windowTextures[texIdx];

        const bldgGeo = new THREE.BoxGeometry(width, height, depth);
        const bldgMat = new THREE.MeshStandardMaterial({
          map: winTex,
          emissiveMap: winTex,
          emissive: 0x90b8e8,
          emissiveIntensity: 0.38,
          metalness: 0.85,
          roughness: 0.25,
          color: 0x999999
        });

        const bldg = new THREE.Mesh(bldgGeo, bldgMat);
        bldg.position.set(posX, height / 2, posZ);
        bldg.castShadow = true;
        bldg.receiveShadow = true;
        tileGroup.add(bldg);

        // Architectural stepped crown for tall towers
        if (height > 65) {
          const crownHeight = 6.0;
          const crownGeo = new THREE.BoxGeometry(width * 0.72, crownHeight, depth * 0.72);
          const crownMat = new THREE.MeshStandardMaterial({ color: 0x182438, metalness: 0.8, roughness: 0.3 });
          const crown = new THREE.Mesh(crownGeo, crownMat);
          crown.position.set(posX, height + crownHeight / 2, posZ);
          tileGroup.add(crown);

          // Slender antenna spire with red flashing beacon
          const spireHeight = 16.0;
          const spireGeo = new THREE.CylinderGeometry(0.12, 0.28, spireHeight, 6);
          const spire = new THREE.Mesh(spireGeo, new THREE.MeshStandardMaterial({ color: 0x64748b }));
          spire.position.set(posX, height + crownHeight + spireHeight / 2, posZ);
          tileGroup.add(spire);

          const beaconGeo = new THREE.SphereGeometry(0.42, 8, 8);
          const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff1644 });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.set(posX, height + crownHeight + spireHeight, posZ);
          tileGroup.add(beacon);
          this.beaconLights.push(beacon);
        }

        // Rooftop Sign "FASTER SMARTER STRONGER" on prominent towers
        if (tileIdx % 3 === 0 && b === 0 && this.rooftopSignTexture) {
          const signGeo = new THREE.PlaneGeometry(16, 8);
          const signMat = new THREE.MeshBasicMaterial({
            map: this.rooftopSignTexture,
            side: THREE.DoubleSide
          });
          const sign = new THREE.Mesh(signGeo, signMat);
          sign.position.set(posX, height + 4.5, posZ);
          sign.rotation.y = side === -1 ? Math.PI / 7 : -Math.PI / 7;
          tileGroup.add(sign);
        }
      }
    });
  }

  // ------------------------------------------------------------------ OVERHEAD HIGHWAY SIGN GANTRY
  buildOverheadGantry(tileGroup) {
    const gantry = new THREE.Group();
    const gH = 10.2;
    const gW = this.trackWidth + 6.5;
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.3 });

    // Side support posts beyond guardrails
    [-gW / 2, gW / 2].forEach(px => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.9, gH, 0.9), steelMat);
      p.position.set(px, gH / 2, 0);
      gantry.add(p);
    });

    // Overhead truss beam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(gW + 0.8, 1.3, 1.1), steelMat);
    beam.position.set(0, gH, 0);
    gantry.add(beam);

    // Highway Directional Sign ("Downtown 2 km / Riverside 5 km")
    if (this.gantrySignTexture) {
      const signBoardGeo = new THREE.PlaneGeometry(18.5, 5.8);
      const signBoardMat = new THREE.MeshBasicMaterial({
        map: this.gantrySignTexture,
        side: THREE.DoubleSide
      });
      const signBoard = new THREE.Mesh(signBoardGeo, signBoardMat);
      signBoard.rotation.y = Math.PI;
      signBoard.position.set(0, gH - 0.2, -0.65);
      gantry.add(signBoard);

      // Downward sign floodlights facing front of sign
      [-5.5, 0, 5.5].forEach(fx => {
        const fixtureGeo = new THREE.BoxGeometry(0.8, 0.2, 0.5);
        const fixture = new THREE.Mesh(fixtureGeo, steelMat);
        fixture.position.set(fx, gH + 0.7, -0.9);
        gantry.add(fixture);

        const lensGeo = new THREE.BoxGeometry(0.6, 0.06, 0.4);
        const lens = new THREE.Mesh(lensGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        lens.position.set(fx, gH + 0.65, -0.9);
        gantry.add(lens);
      });
    }

    tileGroup.add(gantry);
  }

  // ------------------------------------------------------------------ FINISH LINE GATE
  buildFinishGate() {
    const group = new THREE.Group();
    group.position.set(0, 0, 99999); // Off-screen initially
    group.name = 'finishGate';

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    [-this.trackWidth / 2 - 2, this.trackWidth / 2 + 2].forEach(x => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(1.6, 16, 1.6), steelMat);
      col.position.set(x, 8, 0);
      group.add(col);
    });

    const arch = new THREE.Mesh(new THREE.BoxGeometry(this.trackWidth + 8, 2.5, 2.0), steelMat);
    arch.position.set(0, 15, 0);
    group.add(arch);

    const banner = new THREE.Mesh(new THREE.BoxGeometry(this.trackWidth + 6, 1.2, 0.2), glowMat);
    banner.position.set(0, 14.8, 1.05);
    group.add(banner);

    const finishLineGeo = new THREE.PlaneGeometry(this.trackWidth, 4.0);
    const finishLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
    const finishLine = new THREE.Mesh(finishLineGeo, finishLineMat);
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.set(0, 0.04, 0);
    group.add(finishLine);

    this.scene.add(group);
    this.finishGate = group;
  }

  // ------------------------------------------------------------------ SPEED LINES & PARTICLES
  buildSpeedLines() {
    const n = this.speedLineCount;
    const pos = new Float32Array(n * 6);

    for (let i = 0; i < n; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (5 + Math.random() * 15);
      const y = 0.4 + Math.random() * 4.5;
      const z = (Math.random() - 0.5) * 40;
      const len = 6 + Math.random() * 12;

      pos[i * 6 + 0] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;
      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = z + len;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.speedLinePositions = pos;

    const mat = new THREE.LineBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });

    this.speedLines = new THREE.LineSegments(geo, mat);
    this.scene.add(this.speedLines);
  }

  buildNitroParticles() {
    const count = 90;
    const pos = new Float32Array(count * 3);
    const vel = [];

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = 0;
      pos[i * 3 + 1] = 0.3;
      pos[i * 3 + 2] = 0;
      vel.push({ x: 0, y: 0, z: 0, life: 0, maxLife: 0.3 });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.nitroPositions = pos;
    this.nitroVelocities = vel;

    const mat = new THREE.PointsMaterial({
      color: 0x00f5ff,
      size: 0.38,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.nitroParticles = new THREE.Points(geo, mat);
    this.nitroParticles.visible = false;
    this.scene.add(this.nitroParticles);
  }

  buildRainParticles() {
    const count = 220;
    const pos = new Float32Array(count * 6);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 50;
      const y = Math.random() * 25;
      const z = (Math.random() - 0.5) * 70;
      const len = 1.2 + Math.random() * 2.5;

      pos[i * 6 + 0] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;
      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y - len;
      pos[i * 6 + 5] = z - 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.rainPositions = pos;

    const mat = new THREE.LineBasicMaterial({
      color: 0x70bbff,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    this.rainParticles = new THREE.LineSegments(geo, mat);
    this.scene.add(this.rainParticles);
  }

  // ------------------------------------------------------------------ PUBLIC API: CARS & OPPONENTS

  setPlayerCar(carId, paintColor, underglowColor) {
    if (this.playerCar) {
      this.scene.remove(this.playerCar);
    }
    this.playerCar = createCarMesh(carId, { paintColor, underglowColor });
    // Face forward along +Z (rotation.y = 0)
    this.playerCar.position.set(this.targetPlayerX, 0, this.playerBaseZ);
    this.playerCar.rotation.y = 0;
    this.scene.add(this.playerCar);
  }

  setSimulation(simulation, onTelemetryTick) {
    this.simulation = simulation;
    this.onTelemetryTick = onTelemetryTick;
  }

  steerLane(direction) {
    if (this.simulation) {
      return this.simulation.steerLane(direction);
    }
    // Fallback if simulation not attached
    this.currentLaneIndex = Math.max(0, Math.min(this.lanes.length - 1, this.currentLaneIndex + direction));
    this.targetPlayerX = this.lanes[this.currentLaneIndex];
    return true;
  }

  setOpponents(opponentsList) {
    this.opponentCars.forEach(op => {
      this.scene.remove(op.mesh);
    });
    this.opponentCars.clear();

    // Distribute opponents across lanes
    const laneDistribution = [this.lanes[0], this.lanes[2], this.lanes[3], this.lanes[1]];

    opponentsList.forEach((opp, idx) => {
      const mesh = createCarMesh(opp.carModel || 'vortex', {
        paintColor: opp.color || '#ffb800',
        underglowColor: opp.color || '#ffb800'
      });

      const laneX = opp.laneX !== undefined ? opp.laneX : laneDistribution[idx % laneDistribution.length];
      const startZ = opp.startZ !== undefined ? opp.startZ : (this.playerBaseZ + 7.0 - idx * 7.5);

      mesh.position.set(laneX, 0, startZ);
      mesh.rotation.y = 0; // Face forward along +Z

      // World-space hovering nameplate sprite floating gracefully above opponent car
      const nameplate = createOpponentNameplate(opp.name || `Racer ${idx + 1}`, idx + 1, true);
      nameplate.position.set(0, 2.15, 0);
      mesh.add(nameplate);

      this.scene.add(mesh);

      this.opponentCars.set(opp.id, {
        id: opp.id,
        name: opp.name || `Racer ${idx + 1}`,
        mesh,
        nameplate,
        laneX,
        currentX: laneX,
        startZ,
        visualZ: startZ,
        targetVisualZ: startZ,
        wpm: 0,
        progress: 0,
        color: opp.color || '#ffb800'
      });
    });
  }

  updatePlayerProgress(progress, wpm, isBoosting = false) {
    this.playerProgress = progress;
    this.wpmRatio = Math.min(1.6, wpm / 80);
    this.targetSpeed = wpm * 3.1;
    this.lastKeystrokeTime = performance.now();

    // Nitro flame & particle trigger
    const fast = wpm >= 65 || isBoosting;
    if (this.nitroParticles) {
      this.nitroParticles.visible = fast;
    }
    if (this.playerCar && this.playerCar.userData.setNitro) {
      this.playerCar.userData.setNitro(fast);
    }

    // Speed lines opacity
    if (this.speedLines) {
      const targetOpacity = Math.max(0, Math.min(0.85, (wpm - 45) / 45));
      this.speedLines.material.opacity = targetOpacity;
    }

    // Position finish line gate when nearing completion (75% to 100%)
    if (this.finishGate) {
      if (progress >= 0.75) {
        const remainingRatio = Math.max(0, (1.0 - progress) / 0.25);
        const distToPlayer = remainingRatio * 140;
        this.finishGate.position.set(0, 0, this.playerBaseZ + distToPlayer);
      } else {
        this.finishGate.position.set(0, 0, 99999);
      }
    }
  }

  updateOpponentProgress(oppId, progress, wpm) {
    const opp = this.opponentCars.get(oppId);
    if (!opp) return;

    opp.progress = progress;
    opp.wpm = wpm;

    // Smooth starting grid fade-out into actual progress delta
    const relProgress = progress - this.playerProgress;
    const startGridFactor = Math.max(0, 1.0 - this.playerProgress * 3.5);
    opp.targetVisualZ = (opp.startZ * startGridFactor) + (relProgress * 95);

    if (opp.mesh && opp.mesh.userData.setNitro) {
      opp.mesh.userData.setNitro(wpm >= 70);
    }
  }

  triggerBrakeFeedback() {
    this.isBraking = true;
    this.camShake = 0.14;

    if (this.playerCar && this.playerCar.userData.setBrake) {
      this.playerCar.userData.setBrake(true);
    }

    if (this.taillightGlow) {
      this.taillightGlow.material.opacity = 0.75;
    }

    setTimeout(() => {
      this.isBraking = false;
      if (this.playerCar && this.playerCar.userData.setBrake) {
        this.playerCar.userData.setBrake(false);
      }
      if (this.taillightGlow) {
        this.taillightGlow.material.opacity = 0.28;
      }
    }, 420);
  }

  triggerNitroSurge() {
    this.camShake = 0.08;
    if (this.playerCar && this.playerCar.userData.setNitro) {
      this.playerCar.userData.setNitro(true);
    }
    if (this.nitroParticles) {
      this.nitroParticles.visible = true;
    }
  }

  setCountdownState(isActive) {
    this.isCountdown = isActive;
    if (isActive) {
      this.countdownElapsed = 0;
    }
  }

  setPaused(isPaused) {
    this.isPaused = isPaused;
    if (this.simulation) {
      if (isPaused) {
        this.simulation.pause();
      } else {
        this.simulation.resume();
      }
    }
  }

  setFinished(isFinished) {
    this.isFinished = isFinished;
  }

  // ------------------------------------------------------------------ ANIMATION LOOP
  animate() {
    this.animId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min((now - (this.lastFrameTime || now)) / 1000, 0.1);
    this.lastFrameTime = now;

    if (this.isPaused) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    this.elapsedTime += delta;

    if (this.simulation && this.simulation.state === 'racing') {
      this.simulation.update(delta);
      const telemetry = this.simulation.getTelemetry();

      this.playerSpeed = telemetry.player.speedMps;
      this.targetPlayerX = telemetry.player.laneX;
      this.wpmRatio = Math.min(1.6, telemetry.player.speedMps / 48.0);

      // Finish line gate tracking in 3D world
      if (this.finishGate) {
        const distToFinish = telemetry.totalDistance - telemetry.player.distance;
        if (distToFinish < 250) {
          this.finishGate.position.set(0, 0, this.playerBaseZ + distToFinish);
          this.finishGate.visible = true;
        } else {
          this.finishGate.visible = false;
        }
      }

      if (this.onTelemetryTick) {
        this.onTelemetryTick(telemetry);
      }
    } else if (!this.simulation) {
      // Fallback speed deceleration if user stops typing for > 1.2s during a race
      if (!this.isCountdown && !this.isFinished) {
        const timeSinceKeystroke = performance.now() - this.lastKeystrokeTime;
        if (timeSinceKeystroke > 1200) {
          this.targetSpeed = Math.max(0, this.targetSpeed * 0.95);
        }
      }

      // Smooth speed acceleration lerp
      this.playerSpeed = THREE.MathUtils.lerp(this.playerSpeed, this.targetSpeed, delta * 4.5);
    }

    // Scroll infinite world backward along -Z based on authoritative longitudinal speed
    const moveStep = this.playerSpeed * delta;
    this.worldZ += moveStep;

    // Recycle infinite road tiles
    this.tiles.forEach(tile => {
      tile.group.position.z = tile.baseZ - this.worldZ;

      // When tile passes camera behind player, wrap it far ahead
      if (tile.group.position.z < -TILE_LENGTH * 2.2) {
        tile.baseZ += TOTAL_WORLD_BUFFER;
        tile.group.position.z = tile.baseZ - this.worldZ;
      }
    });

    // Slowly rotate skyline dome for celestial atmosphere
    if (this.skylineDome) {
      this.skylineDome.position.z = this.camera ? this.camera.position.z : 0;
      this.skylineDome.rotation.y += delta * 0.003;
    }

    // Flash red aviation beacons on spires
    if (this.beaconLights.length > 0) {
      const beaconFlash = (Math.sin(this.elapsedTime * 4.0) > 0.2);
      this.beaconLights.forEach(b => {
        b.visible = beaconFlash;
      });
    }

    // ---- PLAYER MOVEMENT & CONTROLS ----
    if (this.playerCar) {
      if (this.simulation) {
        this.playerCar.position.x = this.targetPlayerX;
        this.playerCar.position.z = this.playerBaseZ;

        const steerDiff = this.simulation.player.steerAngle;
        if (this.playerCar.userData.steerWheels) {
          this.playerCar.userData.steerWheels(steerDiff);
        }

        const roll = steerDiff * 0.12;
        const pitch = this.isBraking ? 0.07 : (-this.wpmRatio * 0.035);
        if (this.playerCar.userData.setTilt) {
          this.playerCar.userData.setTilt(pitch, roll);
        }
      } else {
        // Smooth lateral lane change lerp
        this.playerCar.position.x = THREE.MathUtils.lerp(this.playerCar.position.x, this.targetPlayerX, delta * 7.5);
        this.playerCar.position.z = this.playerBaseZ;

        const steerDiff = this.targetPlayerX - this.playerCar.position.x;
        if (this.playerCar.userData.steerWheels) {
          this.playerCar.userData.steerWheels(steerDiff * 0.18);
        }

        const roll = steerDiff * 0.05;
        const pitch = this.isBraking ? 0.07 : (-this.wpmRatio * 0.035);
        if (this.playerCar.userData.setTilt) {
          this.playerCar.userData.setTilt(pitch, roll);
        }
      }

      const carPos = this.playerCar.position;

      // Update Taillight Ground Glow Position
      if (this.taillightGlow) {
        this.taillightGlow.position.set(carPos.x, 0.02, carPos.z - 2.8);
      }

      // Update Projector Headlights
      if (this.carHeadlight) {
        this.carHeadlight.position.set(carPos.x, 1.1, carPos.z + 2);
        this.carHeadlightTarget.position.set(carPos.x, 0.1, carPos.z + 36);
      }

      // ---- BELIEVABLE CHASE CAMERA ----
      if (this.isCountdown) {
        this.countdownElapsed += delta;
        const panAngle = Math.sin(this.countdownElapsed * 1.5) * 1.2;
        this.camera.position.set(carPos.x + panAngle * 2.2, 2.8, carPos.z - 6.2);
        this.camera.lookAt(carPos.x, 1.3, carPos.z + 8.0);
      } else {
        const fovBoost = this.wpmRatio * 8; // Restrained natural FOV widening
        const targetFov = 62 + fovBoost;
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, delta * 3.5);
        this.camera.updateProjectionMatrix();

        const pushBack = -this.wpmRatio * 0.6;
        const desiredCam = new THREE.Vector3(
          carPos.x * 0.68,
          carPos.y + this.cameraOffset.y - (this.wpmRatio * 0.15),
          carPos.z + this.cameraOffset.z + pushBack
        );

        if (this.camShake > 0.001) {
          desiredCam.x += (Math.random() - 0.5) * this.camShake;
          desiredCam.y += (Math.random() - 0.5) * this.camShake;
          this.camShake = THREE.MathUtils.lerp(this.camShake, 0, delta * 8.0);
        }

        if (this.isFirstFrame) {
          this.smoothedCamPos.copy(desiredCam);
          this.isFirstFrame = false;
        } else {
          this.smoothedCamPos.lerp(desiredCam, delta * 8.0);
        }
        this.camera.position.copy(this.smoothedCamPos);

        const lookTarget = new THREE.Vector3(
          carPos.x * 0.70,
          carPos.y + 1.35,
          carPos.z + 42
        );
        this.smoothedLookAt.lerp(lookTarget, delta * 9.0);
        this.camera.lookAt(this.smoothedLookAt);
      }
    }

    // ---- WHEEL ROLLING ANIMATION ----
    // Spins strictly corresponding to actual travel speed
    const wheelSpinSpeed = (this.playerSpeed * 0.45) * delta;
    if (this.playerCar && this.playerCar.userData.spinWheels) {
      this.playerCar.userData.spinWheels(wheelSpinSpeed);
    }

    // ---- MULTI-OPPONENT UPDATE LOOP ----
    if (this.simulation) {
      const pDist = this.simulation.player.distance;
      this.opponentCars.forEach((opp) => {
        const simOpp = this.simulation.opponents.find(o => o.id === opp.id);
        if (simOpp && opp.mesh) {
          const relativeZ = this.playerBaseZ + (simOpp.distance - pDist);
          opp.mesh.position.set(simOpp.laneX, 0, relativeZ);

          // Visibility clipping
          opp.mesh.visible = (relativeZ > -45 && relativeZ < 350);

          if (opp.mesh.userData.spinWheels) {
            opp.mesh.userData.spinWheels((simOpp.speedMps * 0.45) * delta);
          }
          if (opp.mesh.userData.steerWheels) {
            opp.mesh.userData.steerWheels(simOpp.steerAngle);
          }
          if (opp.mesh.userData.setNitro) {
            opp.mesh.userData.setNitro(simOpp.speedMps > 48.0);
          }
        }
      });
    } else {
      this.opponentCars.forEach((opp) => {
        opp.visualZ = THREE.MathUtils.lerp(opp.visualZ, opp.targetVisualZ, delta * 4.0);

        // Subtle human-like lane wander
        const wander = Math.sin(this.elapsedTime * 0.7 + opp.laneX) * 0.35;
        opp.currentX = opp.laneX + wander;

        if (opp.mesh && this.playerCar) {
          opp.mesh.position.set(
            opp.currentX,
            0,
            this.playerCar.position.z + opp.visualZ
          );

          if (opp.mesh.userData.spinWheels) {
            opp.mesh.userData.spinWheels((opp.wpm * 0.038 + 1.0) * delta);
          }

          if (opp.mesh.userData.steerWheels) {
            opp.mesh.userData.steerWheels(wander * 0.4);
          }
        }
      });
    }

    // ---- NITRO EXHAUST PARTICLES ----
    if (this.nitroParticles && this.nitroParticles.visible && this.playerCar) {
      const carPos = this.playerCar.position;
      const pos = this.nitroPositions;
      const vel = this.nitroVelocities;

      for (let i = 0; i < this.nitroVelocities.length; i++) {
        vel[i].life -= delta;
        if (vel[i].life <= 0) {
          const side = (i % 2 === 0) ? -0.32 : 0.32;
          pos[i * 3 + 0] = carPos.x + side;
          pos[i * 3 + 1] = carPos.y + 0.22;
          pos[i * 3 + 2] = carPos.z - 2.2;
          vel[i].x = (Math.random() - 0.5) * 0.6;
          vel[i].y = Math.random() * 0.4;
          vel[i].z = -(Math.random() * 6 + 3);
          vel[i].maxLife = 0.32 + Math.random() * 0.2;
          vel[i].life = vel[i].maxLife;
        } else {
          pos[i * 3 + 0] += vel[i].x * delta;
          pos[i * 3 + 1] += vel[i].y * delta;
          pos[i * 3 + 2] += vel[i].z * delta;
        }
      }
      this.nitroParticles.geometry.attributes.position.needsUpdate = true;
    }

    // ---- WARP SPEED LINES ----
    if (this.speedLines && this.speedLines.material.opacity > 0.02 && this.camera) {
      const pos = this.speedLinePositions;
      const camZ = this.camera.position.z;
      const sweepSpeed = this.playerSpeed * 0.75 * delta;

      for (let i = 0; i < this.speedLineCount; i++) {
        pos[i * 6 + 2] -= sweepSpeed;
        pos[i * 6 + 5] -= sweepSpeed;

        if (pos[i * 6 + 5] < camZ - 10) {
          const side = i % 2 === 0 ? -1 : 1;
          const x = side * (5 + Math.random() * 15);
          const y = 0.4 + Math.random() * 4.5;
          const startZ = camZ + 45 + Math.random() * 25;
          const len = 6 + Math.random() * 12;

          pos[i * 6 + 0] = x;
          pos[i * 6 + 1] = y;
          pos[i * 6 + 2] = startZ;
          pos[i * 6 + 3] = x;
          pos[i * 6 + 4] = y;
          pos[i * 6 + 5] = startZ + len;
        }
      }
      this.speedLines.geometry.attributes.position.needsUpdate = true;
    }

    // ---- RAIN PARTICLES ----
    if (this.rainParticles && this.camera) {
      const pos = this.rainPositions;
      const camPos = this.camera.position;
      const fallSpeed = 32 * delta;

      for (let i = 0; i < pos.length / 6; i++) {
        pos[i * 6 + 1] -= fallSpeed;
        pos[i * 6 + 4] -= fallSpeed;

        if (pos[i * 6 + 4] < 0) {
          const rx = camPos.x + (Math.random() - 0.5) * 45;
          const ry = 22 + Math.random() * 8;
          const rz = camPos.z + (Math.random() - 0.5) * 60;
          const len = 1.4 + Math.random() * 2.5;

          pos[i * 6 + 0] = rx;
          pos[i * 6 + 1] = ry;
          pos[i * 6 + 2] = rz;
          pos[i * 6 + 3] = rx;
          pos[i * 6 + 4] = ry - len;
          pos[i * 6 + 5] = rz - 0.4;
        }
      }
      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  // ------------------------------------------------------------------ RESIZE & CLEANUP
  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);

    // Dispose scene objects and textures
    if (this.scene) {
      this.scene.traverse((obj) => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }

    if (this.roadTexture) this.roadTexture.dispose();
    if (this.gantrySignTexture) this.gantrySignTexture.dispose();
    if (this.rooftopSignTexture) this.rooftopSignTexture.dispose();
    if (this.windowTextures) this.windowTextures.forEach(t => t.dispose());

    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
