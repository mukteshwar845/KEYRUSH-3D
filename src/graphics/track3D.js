/**
 * KeyRush 3D Track & Racing World Engine (Three.js) — Rebuilt
 * - Proper infinite scrolling track with looping tile segments
 * - Chase camera locked behind car with velocity-based lean
 * - Accurate car movement: car stays in center, world moves around it
 * - Neon guard rails as thin glowing strips, not solid walls
 * - Opponent car clearly visible in adjacent lane
 * - Nitro exhaust particle trail behind car
 * - Dynamic speed lines that sweep past the sides at high WPM
 */

import * as THREE from 'three';
import { createCarMesh } from './carModels.js';

// Number of road tile segments in the infinite loop pool
const TILE_COUNT = 14;
const TILE_LENGTH = 40; // each tile is 40 units long
const TRACK_TOTAL = TILE_COUNT * TILE_LENGTH; // 560 units of visible buffer

export class Track3D {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animId = null;

    // Racing entities
    this.playerCar = null;
    this.opponentCars = new Map(); // id -> { mesh, visualZ, laneX, speed }
    this.trackWidth = 20;

    // World scroll position (the world moves backwards as player types)
    this.worldZ = 0;            // accumulates forward travel in world units
    this.playerSpeed = 0;       // units/sec based on WPM
    this.wpmRatio = 0;
    this.playerProgress = 0;    // 0..1 progress toward finish

    // Tile pool for infinite road
    this.tiles = [];            // Array of { group, baseZ }
    this.railSegments = [];     // Neon rail segments
    this.dashSegments = [];     // Road dash markings

    // Particle systems
    this.nitroParticles = null;
    this.nitroPositions = null;
    this.nitroVelocities = null;
    this.particleCount = 80;

    // Speed lines
    this.speedLines = null;
    this.speedLinePositions = null;
    this.speedLineCount = 60;

    // Camera
    this.cameraOffset = new THREE.Vector3(0, 3.8, -9.0);
    this.smoothedCamPos = new THREE.Vector3();
    this.smoothedLookAt = new THREE.Vector3();
    this.isFirstFrame = true;

    this.clock = null;
    this.lastDelta = 0;

    this.init();
  }

  // ------------------------------------------------------------------ INIT
  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || 460;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07090f);
    this.scene.fog = new THREE.Fog(0x07090f, 80, 260);

    // Camera
    this.camera = new THREE.PerspectiveCamera(68, width / height, 0.1, 800);
    this.camera.position.set(0, 3.8, -9);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.buildRoadTilePool();
    this.buildNeonRails();
    this.buildCityScenery();
    this.buildSpeedLines();
    this.buildNitroParticles();
    this.buildFinishGate();

    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    this.animate();
  }

  // ------------------------------------------------------------------ LIGHTING
  setupLighting() {
    // Soft ambient fill
    const ambient = new THREE.AmbientLight(0x182040, 2.0);
    this.scene.add(ambient);

    // Main overhead directional (simulates stadium floodlights)
    const dirLight = new THREE.DirectionalLight(0x9ab8ff, 3.0);
    dirLight.position.set(5, 30, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.camera.left = -30;
    dirLight.shadow.camera.right = 30;
    dirLight.shadow.camera.top = 30;
    dirLight.shadow.camera.bottom = -30;
    this.scene.add(dirLight);
    this.dirLight = dirLight;

    // Neon side fills (follow camera)
    const leftNeon = new THREE.PointLight(0x00e5ff, 4.0, 35);
    leftNeon.position.set(-14, 3, 0);
    this.scene.add(leftNeon);
    this.leftNeon = leftNeon;

    const rightNeon = new THREE.PointLight(0xa855f7, 4.0, 35);
    rightNeon.position.set(14, 3, 0);
    this.scene.add(rightNeon);
    this.rightNeon = rightNeon;

    // Headlight point light (under car, moves with car)
    const headLight = new THREE.PointLight(0x00f5ff, 2.5, 20);
    headLight.position.set(0, 0.8, 5);
    this.scene.add(headLight);
    this.headLight = headLight;
  }

  // ------------------------------------------------------------------ INFINITE ROAD TILES
  buildRoadTilePool() {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x0a0c12,
      roughness: 0.85,
      metalness: 0.12
    });
    const dashMat = new THREE.MeshBasicMaterial({
      color: 0x00c8e0,
      transparent: true,
      opacity: 0.75
    });

    for (let i = 0; i < TILE_COUNT; i++) {
      const group = new THREE.Group();
      const baseZ = i * TILE_LENGTH;

      // Road slab
      const roadGeo = new THREE.PlaneGeometry(this.trackWidth, TILE_LENGTH);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.receiveShadow = true;
      group.add(road);

      // Lane dashes (two lines at x = ±4)
      const dashLen = 6;
      const dashGap = 8;
      const dashCount = Math.floor(TILE_LENGTH / (dashLen + dashGap));
      const dashGeo = new THREE.PlaneGeometry(0.28, dashLen);
      for (let d = 0; d < dashCount; d++) {
        const dz = -TILE_LENGTH / 2 + d * (dashLen + dashGap) + dashLen / 2 + 1;
        [-3.8, 3.8].forEach(dx => {
          const dash = new THREE.Mesh(dashGeo, dashMat);
          dash.rotation.x = -Math.PI / 2;
          dash.position.set(dx, 0.015, dz);
          group.add(dash);
        });
      }

      group.position.z = baseZ;
      this.scene.add(group);
      this.tiles.push({ group, baseZ });
    }
  }

  // ------------------------------------------------------------------ NEON RAILS (thin glowing strips)
  buildNeonRails() {
    // Rails are thin BoxGeometry strips, not full-height walls
    const cyanMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const purpleMat = new THREE.MeshBasicMaterial({ color: 0xb44fff });

    const railLen = TILE_COUNT * TILE_LENGTH;
    const hw = this.trackWidth / 2;

    // Ground-level gutter strip
    [{ x: -(hw + 0.22), mat: cyanMat }, { x: (hw + 0.22), mat: purpleMat }].forEach(({ x, mat }) => {
      // Lower strip (on road surface level)
      const loGeo = new THREE.BoxGeometry(0.18, 0.14, railLen);
      const lo = new THREE.Mesh(loGeo, mat);
      lo.position.set(x, 0.08, railLen / 2);
      this.scene.add(lo);

      // Raised barrier top strip
      const hiGeo = new THREE.BoxGeometry(0.12, 0.08, railLen);
      const hi = new THREE.Mesh(hiGeo, mat);
      hi.position.set(x, 0.9, railLen / 2);
      this.scene.add(hi);

      // Barrier body (dark concrete)
      const barrierGeo = new THREE.BoxGeometry(0.35, 0.75, railLen);
      const barrierMat = new THREE.MeshStandardMaterial({ color: 0x181c28, roughness: 0.9 });
      const barrier = new THREE.Mesh(barrierGeo, barrierMat);
      barrier.position.set(x, 0.38, railLen / 2);
      barrier.receiveShadow = true;
      this.scene.add(barrier);
    });
  }

  // ------------------------------------------------------------------ CITY SCENERY
  buildCityScenery() {
    const hw = this.trackWidth / 2;

    for (let i = 0; i < 60; i++) {
      const h = 35 + Math.random() * 90;
      const w = 12 + Math.random() * 20;
      const d = 12 + Math.random() * 20;
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (hw + 28 + Math.random() * 70);
      const z = 30 + Math.random() * TILE_COUNT * TILE_LENGTH;

      const buildingMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.62, 0.25, 0.06 + Math.random() * 0.04),
        roughness: 0.6,
        metalness: 0.7
      });

      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, buildingMat);
      mesh.position.set(x, h / 2, z);
      this.scene.add(mesh);

      // Neon vertical strip
      if (Math.random() > 0.35) {
        const stripColor = Math.random() > 0.5 ? 0x00e5ff : 0xa855f7;
        const stripGeo = new THREE.BoxGeometry(0.35, h * 0.65, 0.35);
        const stripMat = new THREE.MeshBasicMaterial({ color: stripColor });
        const strip = new THREE.Mesh(stripGeo, stripMat);
        strip.position.set(x - side * w * 0.46, h * 0.42, z);
        this.scene.add(strip);
      }
    }
  }

  // ------------------------------------------------------------------ FINISH GATE
  buildFinishGate() {
    const finishZ = 950; // Very far ahead, shown at end of race
    const group = new THREE.Group();
    group.position.set(0, 0, finishZ);
    group.name = 'finishGate';

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1a2035, metalness: 0.9 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const pGeo = new THREE.BoxGeometry(1.2, 14, 1.2);
    const lp = new THREE.Mesh(pGeo, pillarMat);
    lp.position.set(-this.trackWidth / 2 - 1, 7, 0);
    group.add(lp);

    const rp = new THREE.Mesh(pGeo, pillarMat);
    rp.position.set(this.trackWidth / 2 + 1, 7, 0);
    group.add(rp);

    const beamGeo = new THREE.BoxGeometry(this.trackWidth + 4, 1.4, 1.2);
    const beam = new THREE.Mesh(beamGeo, pillarMat);
    beam.position.set(0, 14, 0);
    group.add(beam);

    const neonBeam = new THREE.Mesh(
      new THREE.BoxGeometry(this.trackWidth + 4, 0.22, 0.1),
      glowMat
    );
    neonBeam.position.set(0, 13.2, 0);
    group.add(neonBeam);

    this.scene.add(group);
    this.finishGate = group;
  }

  // ------------------------------------------------------------------ SPEED LINES
  buildSpeedLines() {
    const n = this.speedLineCount;
    const pos = new Float32Array(n * 6);

    for (let i = 0; i < n; i++) {
      // Lines on sides of the track, at various heights
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (6 + Math.random() * 14);
      const y = 0.3 + Math.random() * 4;
      const z = (Math.random() - 0.5) * 30;
      const lineLen = 4 + Math.random() * 8;

      pos[i * 6 + 0] = x;
      pos[i * 6 + 1] = y;
      pos[i * 6 + 2] = z;
      pos[i * 6 + 3] = x;
      pos[i * 6 + 4] = y;
      pos[i * 6 + 5] = z + lineLen;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.speedLinePositions = pos;

    const mat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0
    });
    this.speedLines = new THREE.LineSegments(geo, mat);
    this.scene.add(this.speedLines);
  }

  // ------------------------------------------------------------------ NITRO PARTICLES
  buildNitroParticles() {
    const n = this.particleCount;
    const pos = new Float32Array(n * 3);
    const vel = [];

    for (let i = 0; i < n; i++) {
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0.3;
      pos[i * 3 + 2] = 0;
      vel.push({ x: 0, y: 0, z: 0, life: 0, maxLife: 0 });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.nitroPositions = pos;
    this.nitroVelocities = vel;

    const mat = new THREE.PointsMaterial({
      color: 0x00f5ff,
      size: 0.3,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.nitroParticles = new THREE.Points(geo, mat);
    this.nitroParticles.visible = false;
    this.scene.add(this.nitroParticles);
  }

  // ------------------------------------------------------------------ PUBLIC API: ADD CARS

  setPlayerCar(carId, paintColor, underglowColor) {
    if (this.playerCar) {
      this.scene.remove(this.playerCar);
    }
    this.playerCar = createCarMesh(carId, { paintColor, underglowColor });
    // Player car is fixed in center of screen — world scrolls around it
    this.playerCar.position.set(-2.5, 0, 0); // slight left of center, lane 1
    this.playerCar.rotation.y = Math.PI; // face forward (negative Z = forward in Three.js with camera behind)
    this.scene.add(this.playerCar);
  }

  setOpponents(opponents) {
    this.opponentCars.forEach(op => {
      this.scene.remove(op.mesh);
    });
    this.opponentCars.clear();

    const laneXPositions = [2.5, -6.0, 6.0, -2.5];

    opponents.forEach((opp, idx) => {
      const mesh = createCarMesh(opp.carModel || 'vortex', {
        paintColor: opp.color || '#ffb800',
        underglowColor: opp.color || '#ffb800'
      });

      const laneX = laneXPositions[idx % laneXPositions.length];
      // Opponent starts slightly ahead
      mesh.position.set(laneX, 0, 10);
      mesh.rotation.y = Math.PI; // Face forward
      this.scene.add(mesh);

      this.opponentCars.set(opp.id, {
        mesh,
        visualZ: 10,       // Z position relative to player
        targetVisualZ: 10,
        laneX,
        wpm: 0,
        progress: 0
      });
    });
  }

  // ------------------------------------------------------------------ PUBLIC API: UPDATE PROGRESS

  /**
   * Called every typing event with player's current progress (0..1) and WPM.
   * Instead of moving the car forward, we scroll the world backward.
   */
  updatePlayerProgress(progress, wpm, isBoosting = false) {
    this.playerProgress = progress;
    this.wpmRatio = Math.min(1.5, wpm / 80);
    this.playerSpeed = wpm * 2.8; // Scale WPM to visual speed units

    // Show/hide nitro
    if (this.nitroParticles) {
      const fast = wpm >= 65 || isBoosting;
      this.nitroParticles.visible = fast;
    }

    // Speed lines opacity
    if (this.speedLines) {
      const targetOpacity = Math.max(0, Math.min(0.9, (wpm - 45) / 40));
      this.speedLines.material.opacity = targetOpacity;
    }
  }

  updateOpponentProgress(oppId, progress, wpm) {
    const opp = this.opponentCars.get(oppId);
    if (!opp) return;
    opp.progress = progress;
    opp.wpm = wpm;

    // Target visual offset relative to player
    const relProgress = progress - this.playerProgress;
    // 1 unit of progress difference = ~60 world units visual gap
    opp.targetVisualZ = relProgress * 60;
  }

  // ------------------------------------------------------------------ ANIMATION LOOP
  animate() {
    this.animId = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.1); // cap delta

    // ---- Scroll world tiles backward
    const moveSpeed = this.playerSpeed * delta;
    this.worldZ += moveSpeed;

    // Update road tiles (infinite loop)
    this.tiles.forEach(tile => {
      // Tile visual Z = its baseZ - worldZ (world flows backward)
      tile.group.position.z = tile.baseZ - this.worldZ;

      // If tile has scrolled past camera (-TILE_LENGTH behind car), recycle it
      if (tile.group.position.z < -TILE_LENGTH * 2) {
        // Move it far ahead
        tile.baseZ += TILE_COUNT * TILE_LENGTH;
        tile.group.position.z = tile.baseZ - this.worldZ;
      }
    });

    // ---- Chase Camera
    if (this.playerCar) {
      const carPos = this.playerCar.position;

      // Camera target: behind and above player car
      // Player car is at a fixed position, camera tracks it with slight lag
      const lean = this.wpmRatio > 0.9 ? (Math.random() - 0.5) * 0.04 : 0;
      const desiredCam = new THREE.Vector3(
        carPos.x * 0.6,
        carPos.y + this.cameraOffset.y,
        carPos.z + this.cameraOffset.z
      );
      desiredCam.x += lean;
      desiredCam.y += Math.abs(lean) * 0.5;

      const targetFov = 68 + this.wpmRatio * 14;
      this.camera.fov += (targetFov - this.camera.fov) * 0.07;
      this.camera.updateProjectionMatrix();

      if (this.isFirstFrame) {
        this.smoothedCamPos.copy(desiredCam);
        this.isFirstFrame = false;
      } else {
        this.smoothedCamPos.lerp(desiredCam, 0.12);
      }
      this.camera.position.copy(this.smoothedCamPos);

      const lookTarget = new THREE.Vector3(carPos.x * 0.7, carPos.y + 1.2, carPos.z + 18);
      this.smoothedLookAt.lerp(lookTarget, 0.15);
      this.camera.lookAt(this.smoothedLookAt);

      // Body tilt at speed (subtle chassis pitch)
      if (this.playerCar) {
        const targetPitch = -this.wpmRatio * 0.04;
        this.playerCar.rotation.x += (targetPitch - this.playerCar.rotation.x) * 0.1;
      }

      // Neon lights follow camera
      if (this.leftNeon) this.leftNeon.position.z = this.camera.position.z + 5;
      if (this.rightNeon) this.rightNeon.position.z = this.camera.position.z + 5;
      if (this.headLight) {
        this.headLight.position.set(carPos.x, 0.8, carPos.z + 5);
      }
    }

    // ---- Wheel spin (rolling)
    const spinAmount = this.playerSpeed * delta * 0.35;
    if (this.playerCar && this.playerCar.userData.spinWheels) {
      this.playerCar.userData.spinWheels(spinAmount);
    }

    // ---- Opponent car smooth positioning
    this.opponentCars.forEach(opp => {
      // Smooth visual Z update
      opp.visualZ += (opp.targetVisualZ - opp.visualZ) * 0.08;
      if (opp.mesh && this.playerCar) {
        opp.mesh.position.z = this.playerCar.position.z + opp.visualZ;
      }
      if (opp.mesh && opp.mesh.userData.spinWheels) {
        opp.mesh.userData.spinWheels(opp.wpm * 0.035 * delta);
      }
    });

    // ---- Nitro particles
    if (this.nitroParticles && this.nitroParticles.visible && this.playerCar) {
      const carPos = this.playerCar.position;
      const pos = this.nitroPositions;
      const vel = this.nitroVelocities;

      for (let i = 0; i < this.particleCount; i++) {
        vel[i].life -= delta;
        if (vel[i].life <= 0) {
          // Respawn at dual exhaust ports
          const side = (i % 2 === 0) ? -0.32 : 0.32;
          pos[i * 3] = carPos.x + side;
          pos[i * 3 + 1] = carPos.y + 0.22;
          pos[i * 3 + 2] = carPos.z - 2.2; // behind car
          vel[i].x = (Math.random() - 0.5) * 0.6;
          vel[i].y = Math.random() * 0.4;
          vel[i].z = -(Math.random() * 4 + 2); // shoots backward
          vel[i].maxLife = 0.4 + Math.random() * 0.3;
          vel[i].life = vel[i].maxLife;
        } else {
          pos[i * 3] += vel[i].x * delta;
          pos[i * 3 + 1] += vel[i].y * delta;
          pos[i * 3 + 2] += vel[i].z * delta;
        }
      }
      this.nitroParticles.geometry.attributes.position.needsUpdate = true;
    }

    // ---- Speed lines: sweep forward past camera
    if (this.speedLines && this.speedLines.material.opacity > 0.05 && this.camera) {
      const pos = this.speedLinePositions;
      const n = this.speedLineCount;
      const camZ = this.camera.position.z;
      const sweepSpeed = this.playerSpeed * 0.6 * delta;

      for (let i = 0; i < n; i++) {
        // Move line segments backward (past camera)
        pos[i * 6 + 2] -= sweepSpeed;
        pos[i * 6 + 5] -= sweepSpeed;

        // Recycle when behind camera
        if (pos[i * 6 + 5] < camZ - 8) {
          const side = i % 2 === 0 ? -1 : 1;
          const x = side * (6 + Math.random() * 14);
          const y = 0.3 + Math.random() * 4;
          const startZ = camZ + 35 + Math.random() * 20;
          const lineLen = 4 + Math.random() * 8;
          pos[i * 6 + 0] = x;
          pos[i * 6 + 1] = y;
          pos[i * 6 + 2] = startZ;
          pos[i * 6 + 3] = x;
          pos[i * 6 + 4] = y;
          pos[i * 6 + 5] = startZ + lineLen;
        }
      }
      this.speedLines.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  // ------------------------------------------------------------------ RESIZE
  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // ------------------------------------------------------------------ DISPOSE
  dispose() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('resize', this.onResize);
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
