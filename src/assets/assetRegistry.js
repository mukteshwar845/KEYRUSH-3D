/**
 * KEYRUSH — Centralized Asset Registry
 * Normalizes all public static asset paths into an organized, type-safe, immutable registry.
 */
export const ASSETS = Object.freeze({
  avatars: {
    default: '/images/ui/avatar-kartik.png'
  },
  branding: {
    logoIcon: '/logo-icon.svg',
    favicon: '/favicon.svg',
    trailerPoster: '/images/heroes/landing-hero-car.jpg'
  },
  heroes: {
    dashboard: '/images/heroes/dashboard-hero-car.png',
    landing: '/images/heroes/landing-hero-car.jpg'
  },
  gameModes: {
    solo: '/images/game-modes/mode-solo.png',
    ai: '/images/game-modes/mode-ai.png',
    local: '/images/game-modes/mode-local.png',
    online: '/images/game-modes/mode-online.png',
    ranked: '/images/game-modes/mode-ranked.png'
  },
  cars: {
    hero: '/images/cars/garage-hero-car.jpg',
    vortex: '/images/cars/garage-vortex.jpg',
    nebula: '/images/cars/garage-nebula.jpg',
    chronos: '/images/cars/garage-chronos.jpg',
    gold: '/images/cars/garage-gold.jpg',
    shadow: '/images/cars/garage-shadow.jpg'
  },
  ui: {
    sidebarUnlockCars: '/images/ui/sidebar-unlock-cars.png',
    vehicleNeonBlade: '/images/ui/vehicle-neon-blade.png',
    pilotAvatar: '/images/ui/pilot-avatar.png'
  },
  thumbs: {
    nitroPhantom: '/images/cars/thumb-nitro-phantom.png',
    neuralAdaptive: '/images/cars/thumb-neural-adaptive.png',
    streetCruiser: '/images/cars/thumb-street-cruiser.png',
    viperDrift: '/images/cars/thumb-viper-drift.png',
    you: '/images/cars/thumb-you.png',
    talonGt: '/images/cars/thumb-talon-gt.png'
  },
  audio: {
    interior: '/audio/interior_music.mp3',
    racing: '/audio/racing_music.mp3'
  }
});
