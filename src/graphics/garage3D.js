/**
 * KeyRush 3D Garage Studio & Turntable (Three.js)
 * Interactive 3D showroom with reflective platform, studio spot lighting,
 * vehicle swapping, paint customizer, and smooth orbit rotation.
 */

import * as THREE from 'three';
import { createCarMesh } from './carModels.js';

export class Garage3D {
  constructor(container) {
    this.container = container;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.animId = null;
    this.turntable = null;
    this.currentCarMesh = null;
    this.autoRotate = true;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.rotationAngle = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 400;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c12);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(5.5, 3.2, 6.8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.createStudioPlatform();
    this.setupInteraction();

    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupLighting() {
    // Ambient soft blue
    const ambient = new THREE.AmbientLight(0x161e30, 2.0);
    this.scene.add(ambient);

    // Overhead central spotlight on the car
    const spotLight = new THREE.SpotLight(0xffffff, 4.0);
    spotLight.position.set(0, 8, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    this.scene.add(spotLight);

    // Cyan key light
    const cyanLight = new THREE.PointLight(0x00e5ff, 3.0, 25);
    cyanLight.position.set(-6, 3, 5);
    this.scene.add(cyanLight);

    // Violet rim light
    const violetLight = new THREE.PointLight(0xa855f7, 3.0, 25);
    violetLight.position.set(6, 4, -4);
    this.scene.add(violetLight);
  }

  createStudioPlatform() {
    // Dark reflective showroom floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x07090e,
      roughness: 0.35,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Turntable circular pedestal
    this.turntable = new THREE.Group();
    const pedestalGeo = new THREE.CylinderGeometry(3.2, 3.4, 0.2, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x141824,
      metalness: 0.9,
      roughness: 0.2
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = 0.1;
    pedestal.receiveShadow = true;
    this.turntable.add(pedestal);

    // Neon edge ring around pedestal
    const ringGeo = new THREE.TorusGeometry(3.35, 0.04, 16, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.2;
    this.turntable.add(ring);

    this.scene.add(this.turntable);
  }

  loadCar(carId, paintColor = '#00e5ff', underglowColor = '#00e5ff') {
    if (this.currentCarMesh) {
      this.turntable.remove(this.currentCarMesh);
    }

    this.currentCarMesh = createCarMesh(carId, { paintColor, underglowColor });
    this.currentCarMesh.position.set(0, 0.2, 0);
    this.turntable.add(this.currentCarMesh);
  }

  updatePaint(color) {
    if (this.currentCarMesh && this.currentCarMesh.userData.updatePaint) {
      this.currentCarMesh.userData.updatePaint(color);
    }
  }

  updateUnderglow(color) {
    if (this.currentCarMesh && this.currentCarMesh.userData.updateUnderglow) {
      this.currentCarMesh.userData.updateUnderglow(color);
    }
  }

  setupInteraction() {
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.autoRotate = false;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      this.rotationAngle += deltaX * 0.008;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      // Resume slow auto-rotation after 3 seconds of inactivity
      clearTimeout(this.resumeTimer);
      this.resumeTimer = setTimeout(() => {
        this.autoRotate = true;
      }, 3000);
    });

    // Touch support for mobile/tablets
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.autoRotate = false;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      this.rotationAngle += deltaX * 0.01;
      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
      this.autoRotate = true;
    });
  }

  animate() {
    this.animId = requestAnimationFrame(this.animate);

    if (this.autoRotate) {
      this.rotationAngle += 0.005;
    }

    if (this.turntable) {
      this.turntable.rotation.y = this.rotationAngle;
    }

    this.camera.lookAt(0, 0.8, 0);
    this.renderer.render(this.scene, this.camera);
  }

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
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
