# KEYRUSH — Personal Data Inventory & Storage Flow

**Document Version:** 1.0.0  

---

## 1. Complete Data Mapping

| Data Category | Specific Fields | Processing Purpose | Storage Layer | Encryption / Protection | Retention | Deletion Method |
|---|---|---|---|---|---|---|
| **Pilot Identity** | `username`, `callsign`, `role`, `bio`, `tagline`, `country`, `avatar` | Display player identity in UI, leaderboard, and garage | IndexedDB: `profile` | Browser sandbox isolation; schema validation | User lifetime on device | Account Deletion / Edit Profile |
| **Career Telemetry** | `wpm`, `accuracy`, `cpm`, `consistency`, `racesWon`, `racesPlayed`, `weakKeys` | Measure typing speed, calculate rank, drive vehicle velocity | IndexedDB: `profile` & `sessions` | Browser sandbox isolation; input sanitization | 1,000 recent sessions | Account Deletion / Reset Career Telemetry |
| **Garage Assets** | `activeVehicleId`, `paintColor`, `underglowColor`, `unlockedVehicles` | Render 3D car models, custom shaders, and underglow | IndexedDB: `garage` | Browser sandbox isolation | User lifetime on device | Account Deletion |
| **Missions & Streaks** | `date`, `streakDays`, `calendarDays`, `list` | Gamification progression and XP calculation | IndexedDB: `missions` | Browser sandbox isolation | 7-day rolling rotation | Account Deletion |
| **System Settings** | `theme`, `audioVolumes`, `clickSound`, `errorPenalty`, `reducedMotion` | Maintain user sound, visual, and accessibility preferences | IndexedDB: `settings` | Browser sandbox isolation | User lifetime on device | Account Deletion / Reset Settings |
| **Privacy Preferences**| `visibility`, `showStats`, `showHistory`, `analyticsConsent` | Enforce user privacy choices on public displays | IndexedDB: `profile` | Schema validated | User lifetime on device | Account Deletion / Live Toggle |
| **PWA Cache** | `index.html`, 3D meshes, audio MP3s, SVG icons | Enable 100% offline gameplay | Cache API: `keyrush-v3` | Origin-isolated cache | Until cache update | Account Deletion / Cache Eviction |
| **Session Flag** | `keyrush_entered` | Gate initial landing walkthrough | `sessionStorage` | Ephemeral memory | Session close | Tab close / Account Deletion |

---

## 2. Cross-Border Data Transfers & Sharing
- **Zero Third-Party Data Sharing:** KEYRUSH transmits no telemetry or personal identifiers to third parties.
- **Client-Side Execution:** All calculations, Web Audio synthesis, and 3D WebGL rendering occur entirely within the client machine.
