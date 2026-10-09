# KEYRUSH 3D 🏎️⚡
### Esports Motorsport Typing Simulator

> **Type. Race. Dominate.**
> High-octane 3D competitive typing simulator powered by Three.js, Web Audio synthesis, and an offline-first telemetry engine.

[![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js%20r170-00e5ff.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%205-646cff.svg)](https://vitejs.dev/)
[![Offline First](https://img.shields.io/badge/Storage-IndexedDB%20PWA-00ff66.svg)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![Audio](https://img.shields.io/badge/Audio-Dual--Track%20Mixer-a855f7.svg)](#audio-architecture)

---

## 🌟 Overview

**KEYRUSH 3D** merges precision touch-typing mastery with 3D arcade motorsport dynamics. Your typing speed (WPM) directly drives your vehicle's engine throttle, tachometer RPM, and track acceleration against adaptive AI opponents and ranked rivals.

---

## 🚀 Key Features

### 🏎️ 3D Motorsport Engine (Three.js)
- **Procedural 3D Race Tracks**: Curvature banking, dynamic camera chase rigs, motion speedlines, and neon sci-fi track barriers.
- **Multiple Vehicle Classes**:
  - **Apex GT**: High-speed aerodynamic supercar.
  - **Viper GTS**: Raw muscle acceleration with aggressive handling.
  - **Phantom EV**: Silent electric hypercar with dual-motor torque.
  - **Talon FX**: Lightweight cornering specialist.
- **Dynamic 3D Wheels & Suspension**: Real-time wheel rotation, steering camber, suspension damping, and underglow ground illumination.
- **3D Vehicle Garage**: Interactive 360° vehicle preview, custom paint finishes (Cyber Cyan, Neon Purple, Hyper Gold, Racing Red), and underglow neon tuning.

### 🎵 Professional Dual-Soundtrack & Dynamic Audio Engine
- **Centralized Studio Soundstaging**:
  - **Interior Ambient Music** (`interior_music.mp3`): Subtle 10.5% effective volume for menus, garage, and academy.
  - **Racing Gameplay Music** (`racing_music.mp3`): Energetic 15.4% effective volume during active races.
- **Dynamic Audio Ducking**: Music ducks by 30–50% during countdown beeps, nitro bursts, and victory fanfare.
- **Equal-Power Crossfading**: Seamless transitions between game scenes without abrupt audio cuts or volume spikes.
- **Procedural Web Audio Engine**: Dual-oscillator engine rumble with RPM overtone filters correlated directly to real-time typing speed.
- **Mechanical Switch Audio**: Customizable switch acoustic profiles (Cherry MX Blue, Cherry MX Red, Cyber Blip).
- **Comprehensive Audio Settings**: Independent Master, Interior, Racing, and SFX sliders with one-click **"Restore Recommended Audio Mix"**.

### ⌨️ Esports Typing Analytics & Mechanics
- **Real-Time Telemetry HUD**: Instantaneous WPM, CPM, raw speed, accuracy percentage, typing streak, and latency indicator.
- **Analog & Digital Dashboard**: Speedometer needle and 20-segment throttle tachometer cluster.
- **Error Penalty Modes**: Forgiving (-10%), Standard (-20%), and Hardcore Esports (-40% engine misfire).
- **Adaptive AI Competitor**: Dynamic AI that scales difficulty from Rookie to Legend based on your benchmark speed.
- **Touch-Typing Academy**: Guided finger agility drills, home-row exercises, and weak-key remediation.
- **Ranked Global Leagues**: Competitive ladder from Bronze to Grandmaster with seasonal XP and level progression.

### 📱 Offline-First & Progressive Web App (PWA)
- Fully playable offline without cloud dependencies.
- Local IndexedDB database caching user profile, race sessions, weak keys, and unlocked vehicles.
- Exportable telemetry cards and JSON backup/restore.

---

## 🛠️ Tech Stack

- **Runtime / Framework**: Modern Vanilla JavaScript (ES6+ Modules)
- **3D Graphics**: [Three.js r170](https://threejs.org/)
- **Audio Synthesizer**: Web Audio API + HTML5 Audio Pipeline
- **Bundler / Dev Server**: [Vite 5](https://vitejs.dev/)
- **Database**: IndexedDB (Native Browser Storage)
- **Visual FX**: Canvas Confetti, CSS Grid & Flexbox Glassmorphism

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/mukteshwar845/KEYRUSH-3D.git

# Navigate into the project directory
cd KEYRUSH-3D

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🎮 How to Play

1. **Launch Race**: Select **Solo Practice**, **AI Racing**, or **Multiplayer** from the dashboard.
2. **Countdown**: Watch the start lights (3, 2, 1, GO!). The audio ducks smoothly to accentuate countdown beeps.
3. **Type to Accelerate**: Focus on the teleprompter passage. Every keystroke propels your car forward and revs the procedural engine audio.
4. **Nitro Boost**: Maintain 70+ WPM to ignite nitro boost speed trails.
5. **Analyze Results**: Review your WPM, accuracy, consistency rating, and weak-key breakdown.

---

## 📄 License

MIT License © 2026 KEYRUSH Team.
