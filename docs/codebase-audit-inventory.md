# KEYRUSH — Codebase Audit & Asset Inventory

**Date:** 2026-10-11  
**Project:** KEYRUSH (mukteshwar845/KEYRUSH-3D)  
**Bundler:** Vite 8.3.0  
**Framework:** Vanilla JavaScript (ES Modules) + HTML5 + CSS3 + Three.js + Chart.js  

---

## 1. Project Directory Overview

### Root Directory
- `index.html`: Main HTML entry point for Vite. Required.
- `package.json` & `package-lock.json`: Dependencies and build scripts (`dev`, `build`, `preview`).
- `vite.config.js`: Vite server and build configuration. Required.
- `README.md`: Project documentation. Required.
- `.gitignore`: Git exclusion rules. Required.
- **15 Design Reference Screenshots at Root** (Total ~5.6 MB):
  - `academy_screen.png` (340 KB)
  - `ai_screen.png` (454 KB)
  - `analytics_screen.png` (361 KB)
  - `audio_settings_screen.png` (331 KB)
  - `diagnostic_screen.png` (485 KB)
  - `garage_screen.png` (233 KB)
  - `landing_page.png` (852 KB)
  - `leaderboard_screen.png` (349 KB)
  - `missions_screen.png` (447 KB)
  - `multiplayer_screen.png` (351 KB)
  - `race_gameplay.png` (248 KB)
  - `race_gameplay_audio.png` (173 KB)
  - `race_pause_overlay.png` (236 KB)
  - `race_results.png` (398 KB)
  - `settings_screen.png` (427 KB)
  *Audit Result:* 0 references in runtime code. These are visual milestone reference screenshots that should be moved from the project root to `docs/design-references/screens/`.

---

## 2. Public Directory Audit (`public/`)

### Static Configuration & Icons
- `favicon.svg`: Browser favicon. Required.
- `icons.svg`: SVG icon sprite. Required.
- `logo-icon.svg`: Brand logo icon (PWA manifest icon, navbar brand). Required.
- `manifest.webmanifest`: PWA manifest. Required.
- `sw.js`: Service worker for offline-first caching and resilience. Required.

### Public Audio (`public/audio/`)
- `interior_music.mp3` (1.58 MB, MD5: `c708903b`): Required runtime soundtrack for menus, garage, academy. Loaded via `Audio('/audio/interior_music.mp3')`.
- `racing_music.mp3` (1.98 MB, MD5: `51a34f0c`): Required runtime soundtrack for active racing. Loaded via `Audio('/audio/racing_music.mp3')`.
- `musicManager.js` (19.7 KB): Stale copy of JavaScript source code inside public directory. **Unused / Obsolete.**
- `soundEffects.js` (11.8 KB): Stale copy of JavaScript source code inside public directory. **Unused / Obsolete.**

### Public Images (`public/images/`) — 29 Files Audit

| File Name | Size | MD5 Hash | Runtime Ref Count | Source Locations | Action |
|---|---|---|---|---|---|
| `avatar_kartik.png` | 1.59 KB | `ada086eb` | 3 | `storage.js`, `dashboardView.js`, `navigation.js` | Move to `public/images/ui/avatar-kartik.png` |
| `dashboard_hero_car.png` | 89.8 KB | `d347f07d` | 1 | `dashboardView.js` | Move to `public/images/heroes/dashboard-hero-car.png` |
| `garage_chronos.jpg` | 132 KB | `b5246a8f` | 1 | `carModels.js` | Move to `public/images/cars/garage-chronos.jpg` |
| `garage_gold.jpg` | 133 KB | `b2f0fdf1` | 1 | `carModels.js` | Move to `public/images/cars/garage-gold.jpg` |
| `garage_hero_car.jpg` | 838 KB | `e1ca6e99` | 2 | `carModels.js`, `garageView.js` | Move to `public/images/cars/garage-hero-car.jpg` |
| `garage_nebula.jpg` | 673 KB | `a50f9010` | 1 | `carModels.js` | Move to `public/images/cars/garage-nebula.jpg` |
| `garage_shadow.jpg` | 88.7 KB | `98939bac` | 1 | `carModels.js` | Move to `public/images/cars/garage-shadow.jpg` |
| `garage_vortex.jpg` | 696 KB | `505d6b59` | 1 | `carModels.js` | Move to `public/images/cars/garage-vortex.jpg` |
| `landing_banner_car.jpg` | 4.12 KB | `7819fb48` | 1 | `landingView.js` | Move to `public/images/cars/landing-banner-car.jpg` |
| `landing_hero_car.jpg` | 142 KB | `63661283` | 1 | `landingView.js` | Move to `public/images/heroes/landing-hero-car.jpg` |
| `landing_mode_ai.jpg` | 9.07 KB | `da90c1e9` | 1 | `landingView.js` | Move to `public/images/game-modes/landing-mode-ai.jpg` |
| `landing_mode_local.jpg` | 9.55 KB | `25bfaca5` | 1 | `landingView.js` | Move to `public/images/game-modes/landing-mode-local.jpg` |
| `landing_mode_online.jpg` | 10.2 KB | `cd74e437` | 1 | `landingView.js` | Move to `public/images/game-modes/landing-mode-online.jpg` |
| `landing_mode_ranked.jpg` | 9.74 KB | `7ae07111` | 1 | `landingView.js` | Move to `public/images/game-modes/landing-mode-ranked.jpg` |
| `landing_mode_solo.jpg` | 9.07 KB | `d34c28ec` | 1 | `landingView.js` | Move to `public/images/game-modes/landing-mode-solo.jpg` |
| `landing_reference.jpg` | 305 KB | `18587b45` | 1 | `landingView.js` | Move to `public/images/branding/landing-reference.jpg` |
| `mode_ai.png` | 12.4 KB | `c67acdbc` | 1 | `dashboardView.js` | Move to `public/images/game-modes/mode-ai.png` |
| `mode_local.png` | 12.2 KB | `93b37ba6` | 1 | `dashboardView.js` | Move to `public/images/game-modes/mode-local.png` |
| `mode_online.png` | 13.4 KB | `e734f657` | 1 | `dashboardView.js` | Move to `public/images/game-modes/mode-online.png` |
| `mode_ranked.png` | 13.5 KB | `967a27c7` | 1 | `dashboardView.js` | Move to `public/images/game-modes/mode-ranked.png` |
| `mode_solo.png` | 13.3 KB | `fce8afc8` | 1 | `dashboardView.js` | Move to `public/images/game-modes/mode-solo.png` |
| `sidebar_unlock_cars.png` | 11.9 KB | `0166fe42` | 1 | `navigation.js` | Move to `public/images/ui/sidebar-unlock-cars.png` |
| `vehicle_neon_blade.png` | 21.4 KB | `e073c008` | 1 | `dashboardView.js` | Move to `public/images/ui/vehicle-neon-blade.png` |
| `huayran_car.png` | 1.04 MB | `e35497bb` | 0 | None (Triplicate of `sp40_car_clean.png`) | Deduplicate; keep 1 canonical copy in `docs/design-references/archive/` |
| `sp40_car_clean.png` | 1.04 MB | `e35497bb` | 0 | None (Triplicate of `huayran_car.png`) | Deduplicate |
| `sp40_hypercar_raw.png` | 1.04 MB | `e35497bb` | 0 | None (Triplicate of `huayran_car.png`) | Deduplicate |
| `huayran_hero.png` | 698 KB | `35664902` | 0 | None (Duplicate of `sp40_landing.png`) | Deduplicate; keep 1 canonical copy in `docs/design-references/archive/` |
| `sp40_landing.png` | 698 KB | `35664902` | 0 | None (Duplicate of `huayran_hero.png`) | Deduplicate |
| `streak_flame.png` | 3.18 KB | `0f092cb9` | 0 | None (UI uses emoji flame 🔥) | Archive to `docs/design-references/archive/` |

---

## 3. Source Directory Audit (`src/`)

### Audio (`src/audio/`)
- `musicManager.js`: Core runtime soundtrack engine. Required.
- `soundEffects.js`: Procedural Web Audio API sound effects generator. Required.
- `interior_music.mp3` (1.58 MB): Exact duplicate of `public/audio/interior_music.mp3`. **Redundant in src/**.
- `racing_music.mp3` (1.98 MB): Exact duplicate of `public/audio/racing_music.mp3`. **Redundant in src/**.

### Assets (`src/assets/`)
- `hero.png` (13 KB): Unreferenced starter asset. **Unused.**
- `javascript.svg` (863 B): Unreferenced starter asset. **Unused.**
- `vite.svg` (8.7 KB): Only pinged via `fetch('/vite.svg')` in `navigation.js`. Can use `/logo-icon.svg` instead. **Unused.**

### Other Root Files in `src/`
- `counter.js` (247 B): Vite template counter. **Unreferenced / Unused.**
- `main.js`: Main application orchestrator and screen router. Required.
- `style.css`: Comprehensive esports theme stylesheet. Required.
