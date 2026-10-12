/**
 * KeyRush 3D Track & Racing World Engine (Three.js) — AAA Production Implementation
 * - Visually rich futuristic circuits (Neo-Metropolis GP, Cyber Highway 2099, Sunset Horizon Expressway, Tokyo Neon Rain Circuit)
 * - Layered night/sunset skyline, atmospheric volumetric fog, wet-asphalt road with racing lines & kerbs
 * - Animated holographic advertising screens, overhead highway gantries, and neon tunnel arches
 * - Metallic crash barriers with reflective cat-eye studs and trackside streetlamps with light pools
 * - Multi-opponent grid support (3-5 simultaneous competitors) with independent movement, lanes & visual telemetry
 * - High-performance infinite scrolling tile architecture (never runs out of scenery)
 * - Dynamic chase camera with acceleration-responsive FOV, speed lines, camera shake, and countdown cinematic
 * - Direct physical connection to player typing (nitro exhaust flames, wheel rotation, steering, brake flare)
 * - Finish line gate approach and victory crossing
 */

import * as THREE from 'three';
import { createCarMesh } from './carModels.js';

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
    this.opponentCars = new Map(); // id -> { mesh, visualZ, targetVisualZ, laneX, currentX, wpm, progress }
    this.trackWidth = 26; // 4 highway lanes
    // 4 Distinct lanes: Outer-Left (-9.75), Center-Left (-3.25), Center-Right (3.25), Outer-Right (9.75)
    this.lanes = [-9.75, -3.25, 3.25, 9.75];
    this.currentLaneIndex = 1; // Default to Center-Left lane (-3.25)
    this.targetPlayerX = this.lanes[this.currentLaneIndex];

    // World Motion
    this.worldZ = 0;
    this.playerSpeed = 0;       // units/sec based on WPM
    this.targetSpeed = 0;
    this.wpmRatio = 0;
    this.playerProgress = 0;
    this.isBraking = false;
    this.isCountdown = false;
    this.lastKeystrokeTime = performance.now();

    // Scenery & Tile Pools
    this.tiles = [];
    this.streetlights = [];
    this.billboardCanvases = [];
    this.tunnelArches = [];

    // Particle Systems & VFX
    this.nitroParticles = null;
    this.nitroPositions = null;
    this.nitroVelocities = null;
    this.speedLines = null;
    this.speedLinePositions = null;
    this.speedLineCount = 75;
    this.rainParticles = null;
    this.rainPositions = null;

    // Camera Telemetry - elevated for unobstructed view above HUD teleprompter
    this.cameraOffset = new THREE.Vector3(0, 4.4, -9.8);
    this.smoothedCamPos = new THREE.Vector3(0, 4.4, -9.8);
    this.smoothedLookAt = new THREE.Vector3(0, 0.9, 24);
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

    // 1. Environment & Atmospheric Theme
    const isSunset = (this.circuit === 'Sunset Horizon Expressway' || this.circuit.includes('Sunset'));
    const isRain = (this.circuit === 'Tokyo Neon Rain Circuit' || this.circuit.includes('Rain'));
    const isCyberHighway = (this.circuit === 'Cyber Highway 2099');

    let bgColor = 0x060810;
    let fogDensity = 0.0038;

    if (isSunset) {
      bgColor = 0x1a0d24;
      fogDensity = 0.0035;
    } else if (isRain) {
      bgColor = 0x04060e;
      fogDensity = 0.0052;
    } else if (isCyberHighway) {
      bgColor = 0x030714;
      fogDensity = 0.0044;
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(bgColor);
    this.scene.fog = new THREE.FogExp2(bgColor, fogDensity);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.2, 950);
    this.camera.position.set(this.targetPlayerX, 4.4, -9.8);

    // 3. WebGL Renderer
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
    this.renderer.toneMappingExposure = isSunset ? 1.45 : (isRain ? 1.25 : 1.35);
    this.renderer.domElement.className = 'track-3d-webgl-canvas';
    this.container.appendChild(this.renderer.domElement);

    // 4. Procedural Textures & Materials
    this.buildProceduralTextures();

    // 5. World Lighting & Sky
    this.setupLighting();
    this.buildSkylineDome();

    // 6. Infinite Track & Cyber City Scenery
    this.buildRoadTilePool();
    this.buildSpeedLines();
    this.buildNitroParticles();
    if (isRain) {
      this.buildRainParticles();
    }
    this.buildFinishGate();

    // 7. Event Listeners & Animation Loop
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
    // 1. Asphalt Road Texture (Granular stone grain + wet specular shine + lane seams)
    const roadCanvas = document.createElement('canvas');
    roadCanvas.width = 512;
    roadCanvas.height = 512;
    const rCtx = roadCanvas.getContext('2d');

    // Dark charcoal base
    rCtx.fillStyle = '#0a0d14';
    rCtx.fillRect(0, 0, 512, 512);

    // Micro asphalt grain noise
    const imgData = rCtx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 22;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise + 4));
    }
    rCtx.putImageData(imgData, 0, 0);

    // Wet reflective sheen patches
    const grad = rCtx.createRadialGradient(256, 256, 40, 256, 256, 240);
    grad.addColorStop(0, 'rgba(0, 229, 255, 0.06)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    rCtx.fillStyle = grad;
    rCtx.fillRect(0, 0, 512, 512);

    this.roadTexture = new THREE.CanvasTexture(roadCanvas);
    this.roadTexture.wrapS = THREE.RepeatWrapping;
    this.roadTexture.wrapT = THREE.RepeatWrapping;
    this.roadTexture.repeat.set(2, 6);

    // 2. Skyscraper Window Grid Textures
    this.windowTextures = [];
    const colorThemes = ['#00e5ff', '#ffb800', '#a855f7', '#00f59b', '#38bdf8'];

    colorThemes.forEach(accent => {
      const winCanvas = document.createElement('canvas');
      winCanvas.width = 256;
      winCanvas.height = 512;
      const wCtx = winCanvas.getContext('2d');

      wCtx.fillStyle = '#070910';
      wCtx.fillRect(0, 0, 256, 512);

      const cols = 12;
      const rows = 28;
      const cellW = 256 / cols;
      const cellH = 512 / rows;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const isLit = Math.random() > 0.45;
          if (isLit) {
            const isAccent = Math.random() > 0.65;
            wCtx.fillStyle = isAccent ? accent : 'rgba(180, 215, 255, 0.75)';
            wCtx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
          } else {
            wCtx.fillStyle = 'rgba(15, 22, 38, 0.8)';
            wCtx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
          }
        }
      }

      const tex = new THREE.CanvasTexture(winCanvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      this.windowTextures.push(tex);
    });

    // 3. Cyberpunk Animated Billboards
    this.billboardTextures = [];
    const ads = [
      { text: 'KEYRUSH GP', sub: 'NEO-TOKYO CIRCUIT', col: '#00e5ff' },
      { text: 'CYBERTECH', sub: 'QUANTUM SUSPENSION', col: '#a855f7' },
      { text: 'NITRO V12', sub: 'HYPER ACCELERATION', col: '#ff0055' },
      { text: 'APEX RACING', sub: 'CHAMPIONSHIP SERIES', col: '#ffb800' }
    ];

    ads.forEach(ad => {
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 512;
      bCanvas.height = 256;
      const bCtx = bCanvas.getContext('2d');

      bCtx.fillStyle = '#060a14';
      bCtx.fillRect(0, 0, 512, 256);

      bCtx.strokeStyle = ad.col;
      bCtx.lineWidth = 10;
      bCtx.strokeRect(8, 8, 496, 240);

      bCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < 256; y += 8) {
        bCtx.fillRect(0, y, 512, 4);
      }

      bCtx.fillStyle = '#ffffff';
      bCtx.font = 'bold 54px sans-serif';
      bCtx.textAlign = 'center';
      bCtx.fillText(ad.text, 256, 120);

      bCtx.fillStyle = ad.col;
      bCtx.font = 'bold 26px sans-serif';
      bCtx.letterSpacing = '6px';
      bCtx.fillText(ad.sub, 256, 175);

      const bTex = new THREE.CanvasTexture(bCanvas);
      this.billboardTextures.push(bTex);
    });
  }

  // ------------------------------------------------------------------ WORLD LIGHTING
  setupLighting() {
    const isSunset = (this.circuit === 'Sunset Horizon Expressway' || this.circuit.includes('Sunset'));
    const isRain = (this.circuit === 'Tokyo Neon Rain Circuit' || this.circuit.includes('Rain'));

    // 1. Ambient Fill
    const ambCol = isSunset ? 0x2e1a38 : (isRain ? 0x121a2c : 0x182442);
    const ambient = new THREE.AmbientLight(ambCol, isSunset ? 2.8 : 2.4);
    this.scene.add(ambient);

    // 2. Stadium Overhead Floodlight
    const dirCol = isSunset ? 0xffb86c : (isRain ? 0x7ab5e6 : 0x8fc8ff);
    const mainDirLight = new THREE.DirectionalLight(dirCol, isSunset ? 3.8 : 3.2);
    mainDirLight.position.set(isSunset ? -20 : 10, 40, isSunset ? -10 : 20);
    mainDirLight.castShadow = true;
    mainDirLight.shadow.mapSize.width = 1024;
    mainDirLight.shadow.mapSize.height = 1024;
    mainDirLight.shadow.camera.near = 1;
    mainDirLight.shadow.camera.far = 180;
    mainDirLight.shadow.camera.left = -25;
    mainDirLight.shadow.camera.right = 25;
    mainDirLight.shadow.camera.top = 25;
    mainDirLight.shadow.camera.bottom = -25;
    this.scene.add(mainDirLight);
    this.mainDirLight = mainDirLight;

    // 3. Side Neon Fills (Follow Chase Camera)
    const side1Col = isSunset ? 0xff9033 : (isRain ? 0xff2a85 : 0x00e5ff);
    const side2Col = isSunset ? 0xaa44ff : (isRain ? 0x00e5ff : 0xa855f7);

    this.cyanNeonLight = new THREE.PointLight(side1Col, 4.5, 45);
    this.cyanNeonLight.position.set(-16, 4, 0);
    this.scene.add(this.cyanNeonLight);

    this.violetNeonLight = new THREE.PointLight(side2Col, 4.5, 45);
    this.violetNeonLight.position.set(16, 4, 0);
    this.scene.add(this.violetNeonLight);

    // 4. Player Vehicle Forward Projector Headlight (points forward toward +Z)
    this.carHeadlight = new THREE.SpotLight(0x00f5ff, 5.0, 45, Math.PI / 4, 0.4);
    this.carHeadlight.position.set(this.targetPlayerX, 1.2, 2);
    this.carHeadlightTarget = new THREE.Object3D();
    this.carHeadlightTarget.position.set(this.targetPlayerX, 0, 28);
    this.scene.add(this.carHeadlightTarget);
    this.carHeadlight.target = this.carHeadlightTarget;
    this.scene.add(this.carHeadlight);
  }

  // ------------------------------------------------------------------ DISTANT SKYLINE DOME
  buildSkylineDome() {
    const isSunset = (this.circuit === 'Sunset Horizon Expressway' || this.circuit.includes('Sunset'));
    const isRain = (this.circuit === 'Tokyo Neon Rain Circuit' || this.circuit.includes('Rain'));

    const domeGeo = new THREE.CylinderGeometry(420, 420, 220, 32, 1, true);
    domeGeo.rotateY(Math.PI);

    const domeCanvas = document.createElement('canvas');
    domeCanvas.width = 1024;
    domeCanvas.height = 512;
    const dCtx = domeCanvas.getContext('2d');

    const grad = dCtx.createLinearGradient(0, 0, 0, 512);
    if (isSunset) {
      grad.addColorStop(0, '#0c0714');
      grad.addColorStop(0.4, '#2d1138');
      grad.addColorStop(0.75, '#6e274a');
      grad.addColorStop(0.92, '#ff6e3b');
      grad.addColorStop(1, '#1b0818');
    } else if (isRain) {
      grad.addColorStop(0, '#020308');
      grad.addColorStop(0.5, '#070b18');
      grad.addColorStop(0.85, '#0f1424');
      grad.addColorStop(1, '#04060c');
    } else {
      grad.addColorStop(0, '#04060c');
      grad.addColorStop(0.5, '#0b1326');
      grad.addColorStop(0.85, '#181b38');
      grad.addColorStop(1, '#05070e');
    }
    dCtx.fillStyle = grad;
    dCtx.fillRect(0, 0, 1024, 512);

    // Distant skyscraper silhouettes
    dCtx.fillStyle = '#060812';
    for (let x = 0; x < 1024; x += 18 + Math.random() * 24) {
      const bH = 80 + Math.random() * 160;
      const bW = 16 + Math.random() * 26;
      dCtx.fillRect(x, 512 - bH, bW, bH);

      if (Math.random() > 0.4) {
        dCtx.fillStyle = Math.random() > 0.5 ? '#ff2255' : (isSunset ? '#ffb800' : '#00e5ff');
        dCtx.fillRect(x + bW / 2, 512 - bH, 2, 2);
        dCtx.fillStyle = '#060812';
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
    domeMesh.position.set(0, 80, 0);
    this.scene.add(domeMesh);
    this.skylineDome = domeMesh;
  }

  // ------------------------------------------------------------------ ROAD TILE POOL & SCENERY
  buildRoadTilePool() {
    const isSunset = (this.circuit === 'Sunset Horizon Expressway' || this.circuit.includes('Sunset'));
    const isRain = (this.circuit === 'Tokyo Neon Rain Circuit' || this.circuit.includes('Rain'));

    const roadMat = new THREE.MeshStandardMaterial({
      map: this.roadTexture,
      roughness: isRain ? 0.15 : 0.35,
      metalness: isRain ? 0.65 : 0.45,
      bumpScale: 0.05
    });

    const curbRedMat = new THREE.MeshStandardMaterial({ color: 0xee2233, roughness: 0.4 });
    const curbWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x181e2c, metalness: 0.9, roughness: 0.3 });
    const cyanRailMat = new THREE.MeshBasicMaterial({ color: isSunset ? 0xff9033 : 0x00e5ff });
    const violetRailMat = new THREE.MeshBasicMaterial({ color: isSunset ? 0xaa44ff : 0xb044ff });
    const whiteDashMat = new THREE.MeshBasicMaterial({ color: 0xe0f7ff, transparent: true, opacity: 0.85 });
    const arrowMat = new THREE.MeshBasicMaterial({ color: isSunset ? 0xffaa00 : 0x00e5ff, transparent: true, opacity: 0.7 });

    const hw = this.trackWidth / 2; // 13 units

    for (let i = 0; i < TILE_COUNT; i++) {
      const group = new THREE.Group();
      const baseZ = i * TILE_LENGTH;

      // 1. Asphalt Road Bed
      const roadGeo = new THREE.PlaneGeometry(this.trackWidth, TILE_LENGTH);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.receiveShadow = true;
      group.add(road);

      // 2. Lane Dividers (4 lanes -> 3 dividers at X = -6.5, 0, +6.5)
      const dashLength = 6.0;
      const dashGap = 9.0;
      const dashCount = Math.floor(TILE_LENGTH / (dashLength + dashGap));
      const dashGeo = new THREE.PlaneGeometry(0.35, dashLength);

      for (let d = 0; d < dashCount; d++) {
        const dz = -TILE_LENGTH / 2 + d * (dashLength + dashGap) + dashLength / 2 + 1;
        [-6.5, 0, 6.5].forEach(x => {
          const dash = new THREE.Mesh(dashGeo, whiteDashMat);
          dash.rotation.x = -Math.PI / 2;
          dash.position.set(x, 0.02, dz);
          group.add(dash);
        });
      }

      // 3. Glowing Flat Racing Chevron Decals
      if (i % 2 === 0) {
        const chevronGroup = new THREE.Group();
        chevronGroup.position.set(0, 0.025, 0);

        const arm1 = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 2.4), arrowMat);
        arm1.rotation.x = -Math.PI / 2;
        arm1.rotation.z = Math.PI / 3.5;
        arm1.position.set(-0.85, 0, 0);
        chevronGroup.add(arm1);

        const arm2 = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 2.4), arrowMat);
        arm2.rotation.x = -Math.PI / 2;
        arm2.rotation.z = -Math.PI / 3.5;
        arm2.position.set(0.85, 0, 0);
        chevronGroup.add(arm2);

        group.add(chevronGroup);
      }

      // 4. Red & White Apex Racing Curbs
      const curbLen = 3.0;
      const numCurbs = Math.floor(TILE_LENGTH / curbLen);
      const curbGeo = new THREE.BoxGeometry(0.8, 0.12, curbLen);

      for (let c = 0; c < numCurbs; c++) {
        const cz = -TILE_LENGTH / 2 + c * curbLen + curbLen / 2;
        const isRed = c % 2 === 0;
        const curMat = isRed ? curbRedMat : curbWhiteMat;

        [-hw + 0.4, hw - 0.4].forEach(x => {
          const curb = new THREE.Mesh(curbGeo, curMat);
          curb.position.set(x, 0.06, cz);
          group.add(curb);
        });
      }

      // 5. Crash Barriers with Continuous Glowing Neon Rail
      [-hw - 0.2, hw + 0.2].forEach((x, sideIdx) => {
        const barGeo = new THREE.BoxGeometry(0.4, 0.9, TILE_LENGTH);
        const barrier = new THREE.Mesh(barGeo, barrierMat);
        barrier.position.set(x, 0.45, 0);
        barrier.receiveShadow = true;
        group.add(barrier);

        const railGeo = new THREE.BoxGeometry(0.12, 0.10, TILE_LENGTH);
        const railMat = sideIdx === 0 ? cyanRailMat : violetRailMat;
        const rail = new THREE.Mesh(railGeo, railMat);
        rail.position.set(x, 0.92, 0);
        group.add(rail);

        const studGeo = new THREE.BoxGeometry(0.18, 0.12, 0.18);
        for (let s = -TILE_LENGTH / 2 + 5; s < TILE_LENGTH / 2; s += 10) {
          const stud = new THREE.Mesh(studGeo, sideIdx === 0 ? cyanRailMat : violetRailMat);
          stud.position.set(x, 0.6, s);
          group.add(stud);
        }
      });

      // 6. Trackside Streetlamps (every tile)
      [-hw - 1.2, hw + 1.2].forEach((lx, sideIdx) => {
        const lampGroup = new THREE.Group();
        lampGroup.position.set(lx, 0, 0);

        const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.5, 8);
        const pole = new THREE.Mesh(poleGeo, barrierMat);
        pole.position.set(0, 3.75, 0);
        lampGroup.add(pole);

        const armGeo = new THREE.BoxGeometry(sideIdx === 0 ? 2.8 : -2.8, 0.12, 0.2);
        const arm = new THREE.Mesh(armGeo, barrierMat);
        arm.position.set(sideIdx === 0 ? 1.4 : -1.4, 7.4, 0);
        lampGroup.add(arm);

        const headGeo = new THREE.BoxGeometry(0.6, 0.16, 0.9);
        const head = new THREE.Mesh(headGeo, barrierMat);
        head.position.set(sideIdx === 0 ? 2.6 : -2.6, 7.3, 0);
        lampGroup.add(head);

        const lensGeo = new THREE.BoxGeometry(0.5, 0.05, 0.8);
        const lens = new THREE.Mesh(lensGeo, new THREE.MeshBasicMaterial({ color: isSunset ? 0xffcc77 : 0x88f5ff }));
        lens.position.set(sideIdx === 0 ? 2.6 : -2.6, 7.2, 0);
        lampGroup.add(lens);

        const poolGeo = new THREE.PlaneGeometry(6, 6);
        const poolMat = new THREE.MeshBasicMaterial({
          color: isSunset ? 0xffaa33 : 0x00e5ff,
          transparent: true,
          opacity: 0.12,
          blending: THREE.AdditiveBlending
        });
        const pool = new THREE.Mesh(poolGeo, poolMat);
        pool.rotation.x = -Math.PI / 2;
        pool.position.set(sideIdx === 0 ? 4.0 : -4.0, 0.03, 0);
        lampGroup.add(pool);

        group.add(lampGroup);
      });

      // 7. Trackside Cyber Skyscrapers
      this.buildTileCityScenery(group, i, hw);

      // 8. Overhead Highway Gantries (Every 4th tile)
      if (i % 4 === 1) {
        this.buildOverheadGantry(group);
      }

      // 9. Neon High-Speed Tunnel Rings (Every 5th tile)
      if (i % 5 === 2) {
        this.buildTunnelArch(group);
      }

      group.position.z = baseZ;
      this.scene.add(group);
      this.tiles.push({ group, baseZ });
    }
  }

  buildTileCityScenery(tileGroup, tileIdx, hw) {
    const isSunset = (this.circuit === 'Sunset Horizon Expressway' || this.circuit.includes('Sunset'));

    [-1, 1].forEach(side => {
      for (let b = 0; b < 2; b++) {
        const height = 45 + Math.random() * 85;
        const width = 18 + Math.random() * 16;
        const depth = 18 + Math.random() * 20;

        const posX = side * (hw + 18 + b * 26 + Math.random() * 10);
        const posZ = -TILE_LENGTH / 2 + (b + 0.5) * (TILE_LENGTH / 2);

        const texIdx = Math.floor(Math.random() * this.windowTextures.length);
        const winTex = this.windowTextures[texIdx];

        const bldgGeo = new THREE.BoxGeometry(width, height, depth);
        const bldgMat = new THREE.MeshStandardMaterial({
          map: winTex,
          emissiveMap: winTex,
          emissive: isSunset ? 0x9070aa : 0x90c0ff,
          emissiveIntensity: 0.85,
          metalness: 0.8,
          roughness: 0.3,
          color: 0xcccccc
        });

        const bldg = new THREE.Mesh(bldgGeo, bldgMat);
        bldg.position.set(posX, height / 2, posZ);
        bldg.castShadow = true;
        bldg.receiveShadow = true;
        tileGroup.add(bldg);

        if (height > 70) {
          const crownGeo = new THREE.BoxGeometry(width * 0.7, 5, depth * 0.7);
          const crownMat = new THREE.MeshBasicMaterial({ color: side === -1 ? (isSunset ? 0xff9033 : 0x00e5ff) : 0xa855f7 });
          const crown = new THREE.Mesh(crownGeo, crownMat);
          crown.position.set(posX, height + 2.5, posZ);
          tileGroup.add(crown);
        }

        const antGeo = new THREE.CylinderGeometry(0.14, 0.28, 14, 6);
        const ant = new THREE.Mesh(antGeo, new THREE.MeshStandardMaterial({ color: 0x555555 }));
        ant.position.set(posX, height + 7, posZ);
        tileGroup.add(ant);

        const beaconGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const beacon = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: 0xff0044 }));
        beacon.position.set(posX, height + 12, posZ);
        tileGroup.add(beacon);

        const stripGeo = new THREE.BoxGeometry(0.3, height * 0.85, 0.3);
        const stripMat = new THREE.MeshBasicMaterial({ color: side === -1 ? 0x00e5ff : 0xa855f7 });
        const strip = new THREE.Mesh(stripGeo, stripMat);
        strip.position.set(posX - side * (width * 0.48), height * 0.5, posZ + depth * 0.48);
        tileGroup.add(strip);
      }
    });

    if (tileIdx % 3 === 0) {
      const side = tileIdx % 2 === 0 ? -1 : 1;
      const bSideX = side * (hw + 5.5);
      const bHeight = 11.0;

      const trussGeo = new THREE.CylinderGeometry(0.2, 0.2, bHeight, 8);
      const truss = new THREE.Mesh(trussGeo, new THREE.MeshStandardMaterial({ color: 0x222633 }));
      truss.position.set(bSideX, bHeight / 2, 0);
      tileGroup.add(truss);

      const adIdx = tileIdx % this.billboardTextures.length;
      const screenGeo = new THREE.PlaneGeometry(12, 6);
      const screenMat = new THREE.MeshBasicMaterial({
        map: this.billboardTextures[adIdx],
        side: THREE.DoubleSide
      });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(bSideX + (side === -1 ? 3.0 : -3.0), bHeight, 0);
      screen.rotation.y = side === -1 ? Math.PI / 6 : -Math.PI / 6;
      tileGroup.add(screen);
    }
  }

  buildOverheadGantry(tileGroup) {
    const gantry = new THREE.Group();
    const gH = 9.5;
    const gW = this.trackWidth + 6;
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x202638, metalness: 0.9, roughness: 0.3 });

    [-gW / 2, gW / 2].forEach(px => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(1.0, gH, 1.0), steelMat);
      p.position.set(px, gH / 2, 0);
      gantry.add(p);
    });

    const beam = new THREE.Mesh(new THREE.BoxGeometry(gW + 1.2, 1.4, 1.2), steelMat);
    beam.position.set(0, gH, 0);
    gantry.add(beam);

    const dispGeo = new THREE.PlaneGeometry(16, 1.1);
    const dispMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
    const disp = new THREE.Mesh(dispGeo, dispMat);
    disp.position.set(0, gH, 0.62);
    gantry.add(disp);

    tileGroup.add(gantry);
  }

  buildTunnelArch(tileGroup) {
    const hexRadius = this.trackWidth * 0.58;
    const archMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

    for (let ring = 0; ring < 3; ring++) {
      const zOffset = -12 + ring * 12;
      const ringGroup = new THREE.Group();
      ringGroup.position.set(0, 5.0, zOffset);

      const topBeam = new THREE.Mesh(new THREE.BoxGeometry(this.trackWidth + 4, 0.4, 0.4), archMat);
      topBeam.position.set(0, 5.8, 0);
      ringGroup.add(topBeam);

      [-hexRadius, hexRadius].forEach((x, s) => {
        const sidePost = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7.5, 0.4), archMat);
        sidePost.position.set(x, 2.0, 0);
        sidePost.rotation.z = s === 0 ? -0.2 : 0.2;
        ringGroup.add(sidePost);
      });

      tileGroup.add(ringGroup);
    }
  }

  // ------------------------------------------------------------------ FINISH LINE GATE
  buildFinishGate() {
    const group = new THREE.Group();
    group.position.set(0, 0, 99999); // Off-screen initially
    group.name = 'finishGate';

    const steelMat = new THREE.MeshStandardMaterial({ color: 0x1a2236, metalness: 0.9 });
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
      const y = 0.4 + Math.random() * 5;
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
    this.playerCar.position.set(this.targetPlayerX, 0, 0);
    this.playerCar.rotation.y = 0;
    this.scene.add(this.playerCar);
  }

  steerLane(direction) {
    // direction: -1 (left), +1 (right)
    this.currentLaneIndex = Math.max(0, Math.min(this.lanes.length - 1, this.currentLaneIndex + direction));
    this.targetPlayerX = this.lanes[this.currentLaneIndex];
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
      const startZ = opp.startZ !== undefined ? opp.startZ : (6.0 - idx * 8.0);

      mesh.position.set(laneX, 0, startZ);
      mesh.rotation.y = 0; // Face forward along +Z
      this.scene.add(mesh);

      this.opponentCars.set(opp.id, {
        id: opp.id,
        name: opp.name || `Racer ${idx + 1}`,
        mesh,
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
        this.finishGate.position.set(0, 0, (this.playerCar ? this.playerCar.position.z : 0) + distToPlayer);
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
    this.camShake = 0.16;

    if (this.playerCar && this.playerCar.userData.setBrake) {
      this.playerCar.userData.setBrake(true);
    }

    setTimeout(() => {
      this.isBraking = false;
      if (this.playerCar && this.playerCar.userData.setBrake) {
        this.playerCar.userData.setBrake(false);
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

    // Smooth speed deceleration if user stops typing for > 1.2s during a race
    if (!this.isCountdown && !this.isFinished) {
      const timeSinceKeystroke = performance.now() - this.lastKeystrokeTime;
      if (timeSinceKeystroke > 1200) {
        this.targetSpeed = Math.max(8, this.targetSpeed * 0.95);
      }
    }

    // Smooth speed acceleration lerp
    this.playerSpeed = THREE.MathUtils.lerp(this.playerSpeed, this.targetSpeed, delta * 4.5);

    // Scroll infinite world backward along -Z
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

    // Slowly rotate skyline dome for celestial movement
    if (this.skylineDome) {
      this.skylineDome.position.z = this.camera ? this.camera.position.z : 0;
      this.skylineDome.rotation.y += delta * 0.005;
    }

    // ---- PLAYER MOVEMENT & CONTROLS ----
    if (this.playerCar) {
      // Smooth lateral lane change lerp
      this.playerCar.position.x = THREE.MathUtils.lerp(this.playerCar.position.x, this.targetPlayerX, delta * 7.5);

      const steerDiff = this.targetPlayerX - this.playerCar.position.x;
      if (this.playerCar.userData.steerWheels) {
        this.playerCar.userData.steerWheels(steerDiff * 0.18);
      }

      // Roll into turns, pitch on acceleration / braking
      const roll = -steerDiff * 0.06;
      const pitch = this.isBraking ? 0.08 : (-this.wpmRatio * 0.04);
      if (this.playerCar.userData.setTilt) {
        this.playerCar.userData.setTilt(pitch, roll);
      }

      const carPos = this.playerCar.position;

      // ---- CHASE CAMERA & CINEMATIC MOTIONS ----
      if (this.isCountdown) {
        this.countdownElapsed += delta;
        const panAngle = Math.sin(this.countdownElapsed * 1.5) * 1.4;
        this.camera.position.set(carPos.x + panAngle * 2.4, 2.7, carPos.z - 6.2);
        this.camera.lookAt(carPos.x, 1.2, carPos.z + 5.5);
      } else {
        const fovBoost = this.wpmRatio * 15;
        const targetFov = 65 + fovBoost;
        this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, delta * 3.5);
        this.camera.updateProjectionMatrix();

        const pushBack = -this.wpmRatio * 0.8;
        const desiredCam = new THREE.Vector3(
          carPos.x * 0.72,
          carPos.y + this.cameraOffset.y - (this.wpmRatio * 0.2),
          carPos.z + this.cameraOffset.z + pushBack
        );

        if (this.camShake > 0.001) {
          desiredCam.x += (Math.random() - 0.5) * this.camShake;
          desiredCam.y += (Math.random() - 0.5) * this.camShake;
          this.camShake = THREE.MathUtils.lerp(this.camShake, 0, delta * 8.0);
        } else if (this.wpmRatio > 0.95) {
          const microShake = (this.wpmRatio - 0.95) * 0.04;
          desiredCam.x += (Math.random() - 0.5) * microShake;
          desiredCam.y += (Math.random() - 0.5) * microShake;
        }

        if (this.isFirstFrame) {
          this.smoothedCamPos.copy(desiredCam);
          this.isFirstFrame = false;
        } else {
          this.smoothedCamPos.lerp(desiredCam, delta * 8.0);
        }
        this.camera.position.copy(this.smoothedCamPos);

        const lookTarget = new THREE.Vector3(
          carPos.x * 0.75,
          carPos.y + 0.9,
          carPos.z + 24
        );
        this.smoothedLookAt.lerp(lookTarget, delta * 9.0);
        this.camera.lookAt(this.smoothedLookAt);

        // Projector headlight follows car
        if (this.carHeadlight) {
          this.carHeadlight.position.set(carPos.x, 1.2, carPos.z + 2);
          this.carHeadlightTarget.position.set(carPos.x, 0, carPos.z + 28);
        }

        // Neon side fill lights track with car
        if (this.cyanNeonLight) this.cyanNeonLight.position.z = carPos.z + 4;
        if (this.violetNeonLight) this.violetNeonLight.position.z = carPos.z + 4;
      }
    }

    // ---- WHEEL ROLLING ANIMATION ----
    const wheelSpinSpeed = (this.playerSpeed + 2.0) * delta * 0.45;
    if (this.playerCar && this.playerCar.userData.spinWheels) {
      this.playerCar.userData.spinWheels(wheelSpinSpeed);
    }

    // ---- MULTI-OPPONENT UPDATE LOOP ----
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
          vel[i].x = (Math.random() - 0.5) * 0.8;
          vel[i].y = Math.random() * 0.5;
          vel[i].z = -(Math.random() * 6 + 3);
          vel[i].maxLife = 0.35 + Math.random() * 0.25;
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
          const y = 0.4 + Math.random() * 5;
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
    if (this.windowTextures) this.windowTextures.forEach(t => t.dispose());
    if (this.billboardTextures) this.billboardTextures.forEach(t => t.dispose());

    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
