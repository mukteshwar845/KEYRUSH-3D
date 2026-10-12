# KEYRUSH — Privacy Policy

**Effective Date:** October 12, 2026  
**Document Version:** 1.0.0  
**Project:** KEYRUSH (Esports Motorsport Touch-Typing Simulator)  
**Repository:** [mukteshwar845/KEYRUSH-3D](https://github.com/mukteshwar845/KEYRUSH-3D)  

---

> [!NOTE]  
> **[OPERATOR_REVIEW_REQUIRED]**: This privacy policy is an engineering compliance draft reflecting KEYRUSH's actual architecture. The repository operator must review and insert their official legal entity name, corporate jurisdiction, and designated Data Protection Officer (DPO) contact details prior to commercial distribution.

---

## 1. Introduction & Overview

KEYRUSH ("we", "our", or "the Game") is a high-performance 3D touch-typing racing simulator built with Three.js and modern web standards. We are committed to transparency, minimal data collection, and protecting player privacy.

KEYRUSH operates on an **Offline-First Architecture**. All gameplay records, typing speeds, vehicle customizations, and telemetry are stored locally on your device within your browser's IndexedDB storage. We do not sell your personal data or transmit your typing keystroke history to third-party ad networks.

---

## 2. Information We Collect

### A. Data Stored Locally on Your Device (IndexedDB)
When you play KEYRUSH, the following data is processed and stored strictly within your browser:
- **Pilot Identity:** Callsign/username, selected avatar (preset or locally cropped custom image), player role, bio, and country code.
- **Career Telemetry:** Words-per-minute (WPM), accuracy percentages, keystroke consistency, characters-per-minute (CPM), race wins/losses, practice time, and mistyped keys.
- **Garage Customization:** Unlocked supercar models, custom paint hex codes, neon underglow colors, and particle trails.
- **Game Settings:** Audio synthesis volume levels, mechanical switch tone preferences, error penalty difficulties, visual themes, and reduced motion toggles.
- **Privacy & Consent Preferences:** Public/private leaderboard visibility, multiplayer telemetry broadcast switch, and optional analytics preferences.

### B. Automatically Collected Technical Data
- **Service Worker Caching:** Game assets (3D models, audio, textures, and scripts) are cached locally via the browser Cache API (`keyrush-v3`) to provide 100% offline availability.
- **Web Audio Synthesis:** Keystroke acoustic tones and engine audio pitch are generated in real-time in memory and are never recorded or stored.

### C. Data We Do NOT Collect
- We do **NOT** record raw personal text or sensitive passwords typed outside the game's typing passage prompts.
- We do **NOT** collect biometric data, financial payment cards, physical addresses, or government identification numbers.
- We do **NOT** use tracking cookies or third-party marketing trackers.

---

## 3. How We Use Your Information

We process player data strictly for the following essential purposes:
1. **Core Gameplay & Progression:** To calculate real-time race velocity, measure typing speed benchmarks, and award vehicle unlocks.
2. **Local Session Persistence:** To allow you to close your browser and resume your career without losing progress.
3. **Accessibility & Customization:** To remember reduced motion, theme, and audio preferences.

---

## 4. Legal Grounds for Processing

Depending on your jurisdiction, we process data based on:
- **Contractual Necessity / Legitimate Interest:** Providing the interactive typing simulation requested by the player.
- **User Consent:** For optional telemetry sharing on public leaderboards or optional telemetry analytics.

---

## 5. Third-Party Services

KEYRUSH minimizes third-party connections. The only verified external network request is:
- **Google Fonts CDN (`fonts.googleapis.com` & `fonts.gstatic.com`):** Delivers typography (Chakra Petch, Orbitron, Rajdhani, JetBrains Mono, Inter). Your IP address is transmitted to Google's content delivery network during initial font download.

We do **not** integrate third-party advertising SDKs, data brokers, or social media tracking pixels.

---

## 6. Data Storage, Retention & Security

- **Location:** All persistent data resides locally in your browser's IndexedDB (`keyrush_database`).
- **Retention:** Data remains on your device until you manually clear browser storage, reset career telemetry, or execute account deletion.
- **Security Safeguards:** The application implements strict Content Security Policy (CSP), HTML entity encoding against Cross-Site Scripting (XSS), prototype pollution sanitizers, and avatar file validation.

---

## 7. Your Privacy Rights & Data Controls

You have complete control over your data:
1. **Access / Data Portability:** Download a complete JSON export of all your stored data via **Settings → Offline Data & Backup → Backup All Data (JSON)** or **Profile → Export Career Data**.
2. **Rectification:** Update your callsign, avatar, bio, and settings at any time in **Profile** or **Settings**.
3. **Telemetry Privacy:** Toggle leaderboard visibility and live race telemetry sharing in **Profile → Account Preferences & Privacy**.
4. **Erasure (Account Deletion):** Permanently purge all profile records, race logs, garage data, and service worker caches via **Settings → Account → Delete Account**.

---

## 8. Children's Privacy

KEYRUSH is designed as a touch-typing educational and motorsport simulation. We do not knowingly collect personal contact information from children under 13 (or under the applicable age of majority in your jurisdiction). Because data is stored locally on the device, parents can wipe all data at any time through the in-game deletion controls or browser settings.

---

## 9. Contact & Operator Information

For security disclosures, privacy inquiries, or technical feedback:
- **Project Operator:** mukteshwar845  
- **Official Repository:** [https://github.com/mukteshwar845/KEYRUSH-3D/issues](https://github.com/mukteshwar845/KEYRUSH-3D/issues)  
- **[OPERATOR_REVIEW_REQUIRED]**: Add official contact email and physical mailing address here.

---

## 10. Policy Updates

We may update this Privacy Policy to reflect application enhancements or regulatory changes. The latest version will always be accessible at `/legal/privacy` (or `#legal-privacy`) within the application.
