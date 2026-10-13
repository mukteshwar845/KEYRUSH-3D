/**
 * KeyRush Touch-Typing Academy & Practice Laboratory (Screen 07)
 * Interactive color-coded finger-to-key layout, home-row lessons,
 * finger agility drills, and technique coaching.
 */

import { PASSAGE_DATABASE } from '../engine/textGenerator.js';

export class AcademyView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
    this.activeLessonId = 'home-row-1';
  }

  render() {
    this.container.innerHTML = `
      <div class="dash-page-container">
        <!-- Section Hero Banner -->
        <div class="dash-section-hero card-dark">
          <div class="section-hero-content">
            <span class="section-tag-pill">TOUCH-TYPING ACADEMY</span>
            <h1 class="dash-page-title">FINGER POSTURE & AGILITY LABORATORY</h1>
            <p class="dash-page-desc">
              Master the ergonomic home-row discipline used by professional esports touch-typists. Eliminate sight-typing, minimize displacement, and maximize muscle memory.
            </p>
          </div>
          <div class="section-hero-stats">
            <div class="stat-pill-item">
              <span class="stat-pill-label">LESSON TRACK</span>
              <span class="stat-pill-val highlight-cyan font-mono">5 MODULES</span>
            </div>
            <div class="stat-pill-item">
              <span class="stat-pill-label">ERGONOMIC STANDARD</span>
              <span class="stat-pill-val text-gold font-mono">QWERTY 10-FINGER</span>
            </div>
          </div>
        </div>

        <!-- FINGER COLOR-CODE LEGEND -->
        <div class="finger-legend-strip card-dark">
          <div class="legend-title">FINGER ASSIGNMENTS:</div>
          <div class="legend-items">
            <span class="legend-chip pinky-left">Left Pinky (Q A Z 1)</span>
            <span class="legend-chip ring-left">Left Ring (W S X 2)</span>
            <span class="legend-chip mid-left">Left Middle (E D C 3)</span>
            <span class="legend-chip index-left">Left Index (R T F G V B 4 5)</span>
            <span class="legend-chip thumb">Thumbs (Space)</span>
            <span class="legend-chip index-right">Right Index (Y U H J N M 6 7)</span>
            <span class="legend-chip mid-right">Right Middle (I K , 8)</span>
            <span class="legend-chip ring-right">Right Ring (O L . 9)</span>
            <span class="legend-chip pinky-right">Right Pinky (P ; / 0 - =)</span>
          </div>
        </div>

        <!-- INTERACTIVE COLOR-CODED VIRTUAL KEYBOARD -->
        <div class="virtual-keyboard-display card-dark" id="academy-keyboard">
          <!-- Row 1: Numbers -->
          <div class="kb-row">
            <span class="kb-key f-pinky-l">~\`</span>
            <span class="kb-key f-pinky-l">1 !</span>
            <span class="kb-key f-ring-l">2 @</span>
            <span class="kb-key f-mid-l">3 #</span>
            <span class="kb-key f-idx-l">4 $</span>
            <span class="kb-key f-idx-l">5 %</span>
            <span class="kb-key f-idx-r">6 ^</span>
            <span class="kb-key f-idx-r">7 &</span>
            <span class="kb-key f-mid-r">8 *</span>
            <span class="kb-key f-ring-r">9 (</span>
            <span class="kb-key f-pinky-r">0 )</span>
            <span class="kb-key f-pinky-r">- _</span>
            <span class="kb-key f-pinky-r">= +</span>
            <span class="kb-key kb-backspace">Backspace</span>
          </div>

          <!-- Row 2: Top Row -->
          <div class="kb-row">
            <span class="kb-key kb-tab">Tab</span>
            <span class="kb-key f-pinky-l">Q</span>
            <span class="kb-key f-ring-l">W</span>
            <span class="kb-key f-mid-l">E</span>
            <span class="kb-key f-idx-l">R</span>
            <span class="kb-key f-idx-l">T</span>
            <span class="kb-key f-idx-r">Y</span>
            <span class="kb-key f-idx-r">U</span>
            <span class="kb-key f-mid-r">I</span>
            <span class="kb-key f-ring-r">O</span>
            <span class="kb-key f-pinky-r">P</span>
            <span class="kb-key f-pinky-r">[ {</span>
            <span class="kb-key f-pinky-r">] }</span>
            <span class="kb-key f-pinky-r">\\ |</span>
          </div>

          <!-- Row 3: Home Row (Highlighted) -->
          <div class="kb-row home-row-highlight">
            <span class="kb-key kb-caps">Caps</span>
            <span class="kb-key f-pinky-l home-key">A</span>
            <span class="kb-key f-ring-l home-key">S</span>
            <span class="kb-key f-mid-l home-key">D</span>
            <span class="kb-key f-idx-l home-key tactile-bump">F •</span>
            <span class="kb-key f-idx-l">G</span>
            <span class="kb-key f-idx-r">H</span>
            <span class="kb-key f-idx-r home-key tactile-bump">J •</span>
            <span class="kb-key f-mid-r home-key">K</span>
            <span class="kb-key f-ring-r home-key">L</span>
            <span class="kb-key f-pinky-r home-key">; :</span>
            <span class="kb-key f-pinky-r">' "</span>
            <span class="kb-key kb-enter">Enter</span>
          </div>

          <!-- Row 4: Bottom Row -->
          <div class="kb-row">
            <span class="kb-key kb-shift">Shift</span>
            <span class="kb-key f-pinky-l">Z</span>
            <span class="kb-key f-ring-l">X</span>
            <span class="kb-key f-mid-l">C</span>
            <span class="kb-key f-idx-l">V</span>
            <span class="kb-key f-idx-l">B</span>
            <span class="kb-key f-idx-r">N</span>
            <span class="kb-key f-idx-r">M</span>
            <span class="kb-key f-mid-r">, &lt;</span>
            <span class="kb-key f-ring-r">. &gt;</span>
            <span class="kb-key f-pinky-r">/ ?</span>
            <span class="kb-key kb-shift">Shift</span>
          </div>

          <!-- Row 5: Spacebar -->
          <div class="kb-row">
            <span class="kb-key kb-ctrl">Ctrl</span>
            <span class="kb-key kb-alt">Alt</span>
            <span class="kb-key f-thumb kb-space">Space (Resting Thumbs)</span>
            <span class="kb-key kb-alt">Alt</span>
            <span class="kb-key kb-ctrl">Ctrl</span>
          </div>
        </div>

        <!-- LESSON MODULES LIST -->
        <div class="lessons-container">
          <div class="section-header-compact">
            <h3>PRACTICE DRILLS & TRAINING MODULES</h3>
            <span>Select a drill to enter track practice</span>
          </div>

          <div class="lessons-grid">
            ${Object.entries(PASSAGE_DATABASE.ACADEMY)
              .map(
                ([id, lesson]) => `
              <div class="lesson-card card-dark" data-lesson-id="${id}">
                <div class="lesson-header">
                  <span class="lesson-tag">${lesson.fingerFocus}</span>
                  <span class="lesson-icon">🎯</span>
                </div>
                <h4>${lesson.title}</h4>
                <div class="lesson-sample font-mono">${lesson.text.slice(0, 50)}...</div>
                <button class="btn btn-primary btn-full btn-start-lesson" data-lesson-id="${id}">
                  Launch Practice Track →
                </button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll('.btn-start-lesson').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lessonId = btn.getAttribute('data-lesson-id');
        this.app.showScreen('race', {
          mode: 'Touch-Typing Drill',
          lessonId
        });
      });
    });
  }

  dispose() {}
}
