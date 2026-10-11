/**
 * KEYRUSH — High-Octane 2D/Canvas VFX Engine for Photorealistic Racing Arena
 * Renders dynamic road speed streaks, animated twin cyan nitro exhaust flames,
 * atmospheric wet asphalt specular glow, and keystroke reactive camera shake.
 */

export class RaceVfxEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animId = null;
    this.speedKmh = 0;
    this.targetSpeedKmh = 0;
    this.wpm = 0;
    this.isBraking = false;
    this.brakeShake = 0;
    this.flameIntensity = 1.0;
    this.particles = [];
    this.speedLines = [];
    this.lastTime = performance.now();

    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);

    window.addEventListener('resize', this.resize);
    this.resize();
    this.initSpeedLines();
    this.start();
  }

  resize() {
    if (!this.canvas) return;
    this.width = this.canvas.clientWidth || window.innerWidth;
    this.height = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  initSpeedLines() {
    this.speedLines = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      this.speedLines.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        len: 20 + Math.random() * 80,
        speed: 15 + Math.random() * 25,
        alpha: 0.1 + Math.random() * 0.4,
        color: Math.random() > 0.5 ? '#00e5ff' : '#a855f7'
      });
    }
  }

  updateSpeed(wpm, kmh) {
    this.wpm = wpm;
    this.targetSpeedKmh = kmh;
    this.flameIntensity = Math.min(2.2, 0.8 + (wpm / 60));
  }

  triggerBrakeFeedback() {
    this.isBraking = true;
    this.brakeShake = 12;
    setTimeout(() => {
      this.isBraking = false;
    }, 280);
  }

  triggerNitroSurge() {
    this.flameIntensity = 2.5;
    // Spawn intense burst particles
    this.spawnExhaustParticles(35, true);
  }

  spawnExhaustParticles(count = 3, isBurst = false) {
    // Twin exhaust locations on the player car (centered horizontally, ~78% down screen)
    const centerX = this.width * 0.50;
    const exhaustY = this.height * 0.725;
    const offsets = [-34, -20, 20, 34]; // Dual twin pipes

    for (let i = 0; i < count; i++) {
      const offsetX = offsets[Math.floor(Math.random() * offsets.length)] + (Math.random() * 6 - 3);
      this.particles.push({
        x: centerX + offsetX,
        y: exhaustY + (Math.random() * 6),
        vx: (Math.random() - 0.5) * 1.5,
        vy: 4 + Math.random() * (isBurst ? 18 : 10),
        size: isBurst ? (4 + Math.random() * 8) : (2 + Math.random() * 5),
        alpha: 0.9,
        life: 1.0,
        decay: isBurst ? 0.05 : 0.08,
        color: Math.random() > 0.25 ? '#00e5ff' : '#38bdf8'
      });
    }
  }

  start() {
    if (this.animId) return;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this.resize);
  }

  loop() {
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    // Smooth speed interpolation
    this.speedKmh += (this.targetSpeedKmh - this.speedKmh) * 0.12;

    this.render(dt);
    this.animId = requestAnimationFrame(this.loop);
  }

  render(dt) {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    // Apply subtle screen shake on error
    if (this.brakeShake > 0) {
      ctx.save();
      const shakeX = (Math.random() - 0.5) * this.brakeShake;
      const shakeY = (Math.random() - 0.5) * this.brakeShake;
      ctx.translate(shakeX, shakeY);
      this.brakeShake *= 0.88;
      if (this.brakeShake < 0.2) this.brakeShake = 0;
    }

    // 1. Road Speed Streaks (active when moving)
    const speedRatio = Math.min(1.5, this.speedKmh / 160);
    if (speedRatio > 0.1) {
      ctx.lineWidth = 1.8;
      for (let line of this.speedLines) {
        line.y += line.speed * speedRatio * (1 + dt * 10);
        if (line.y > this.height) {
          line.y = -line.len;
          line.x = Math.random() * this.width;
        }

        ctx.strokeStyle = line.color;
        ctx.globalAlpha = line.alpha * Math.min(1.0, speedRatio);
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x, line.y + line.len * speedRatio);
        ctx.stroke();
      }
    }

    // 2. Twin Cyan Nitro Exhaust Flames
    const centerX = this.width * 0.50;
    const exhaustY = this.height * 0.725;
    const baseFlameLen = 22 * this.flameIntensity;

    if (this.speedKmh > 15 || this.wpm > 10) {
      // Spawn ongoing particles
      this.spawnExhaustParticles(Math.floor(2 + this.flameIntensity * 2));

      // Draw primary dual exhaust flame tongues
      const ports = [
        { x: centerX - 27, w: 14 },
        { x: centerX + 27, w: 14 }
      ];

      for (let port of ports) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // Outer cyan bloom
        const glowGrad = ctx.createRadialGradient(
          port.x, exhaustY + 12, 2,
          port.x, exhaustY + 12, 35 * this.flameIntensity
        );
        glowGrad.addColorStop(0, 'rgba(0, 229, 255, 0.75)');
        glowGrad.addColorStop(0.5, 'rgba(0, 145, 255, 0.35)');
        glowGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(port.x, exhaustY + 14, 38 * this.flameIntensity, 0, Math.PI * 2);
        ctx.fill();

        // Inner electric core flame cone
        const flameGrad = ctx.createLinearGradient(port.x, exhaustY, port.x, exhaustY + baseFlameLen);
        flameGrad.addColorStop(0, '#ffffff');
        flameGrad.addColorStop(0.3, '#00e5ff');
        flameGrad.addColorStop(0.8, 'rgba(0, 145, 255, 0.8)');
        flameGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(port.x - port.w * 0.5, exhaustY);
        ctx.lineTo(port.x + port.w * 0.5, exhaustY);
        // Turbulent tip
        const jitterX = (Math.random() - 0.5) * 4;
        ctx.lineTo(port.x + jitterX, exhaustY + baseFlameLen + (Math.random() * 8));
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Wet Road Specular Reflection of Nitro Flames
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const wetRoadGrad = ctx.createRadialGradient(
        centerX, exhaustY + 50, 5,
        centerX, exhaustY + 50, 90 * this.flameIntensity
      );
      wetRoadGrad.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
      wetRoadGrad.addColorStop(0.6, 'rgba(0, 120, 255, 0.18)');
      wetRoadGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = wetRoadGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, exhaustY + 52, 95 * this.flameIntensity, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Render and update exhaust sparks / smoke particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = p.alpha * p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Red brake flare flash if braking
    if (this.isBraking) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 22, 68, 0.18)';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }

    if (this.brakeShake > 0) {
      ctx.restore();
    }
  }
}
