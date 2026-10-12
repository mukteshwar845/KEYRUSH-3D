# KEYRUSH — Threat Model & STRIDE Analysis

**Document Version:** 1.0.0  
**Methodology:** Microsoft STRIDE Threat Modeling Framework  
**Application Architecture:** Offline-First PWA (HTML5, CSS3, WebGL Three.js, IndexedDB, Web Audio)  

---

## 1. System Architecture & Trust Boundaries

```
[ Web Browser User Context ]
         │
         ├───> [ DOM HUD & Typing Engine ] (Untrusted Keystrokes & Passages)
         │           │
         │           ├───> [ Three.js WebGL Engine ] (Hardware Canvas Acceleration)
         │           └───> [ Web Audio Synthesizer ] (Local Audio Nodes)
         │
         ├───> [ Security & Sanitization Layer ] (Trust Boundary: src/utils/security.js)
         │           │
         │           ├───> [ IndexedDB: keyrush_database ] (Local Persistent Store)
         │           ├───> [ CacheStorage: keyrush-v3 ] (Service Worker Asset Cache)
         │           └───> [ Audit Logger: Ring Buffer ] (Security Events)
         │
         └───> [ External Font CDN: Google Fonts ] (Read-only WOFF2 Typography)
```

---

## 2. STRIDE Threat Assessment

### A. Spoofing (Identity Spoofing)
- **Threat:** Malicious player forges a pilot callsign or claims another player's identity on local/exported leaderboards.
- **Current Mitigation:** In local mode, each device maintains its own sandbox. For future multiplayer server integration, server-signed JWT tokens and cryptographically verified pilot IDs are required.

### B. Tampering (Data Manipulation)
- **Threat 1:** Modifying typing speed timestamps (`performance.now`) or physics speed variables in console to register 300+ WPM benchmarks.
- **Mitigation:** Physical speed calculation algorithms bound maximum realistic human typing acceleration. Passages require per-character verification.
- **Threat 2:** Injecting prototype pollution or malicious scripts via modified JSON backup file.
- **Mitigation:** Strict schema enforcement via `sanitizeObject()`, explicitly stripping `__proto__`, `constructor`, and `prototype`.

### C. Repudiation
- **Threat:** User claims an account reset or deletion was performed without their consent.
- **Mitigation:** Account deletion requires typing an explicit challenge string (`DELETE <CALLSIGN>`). Every lifecycle transition is recorded in the immutable audit logger ring buffer.

### D. Information Disclosure
- **Threat 1:** Keystrokes or private text leaking across network boundaries.
- **Mitigation:** Zero external telemetry transmission. Game operates completely offline.
- **Threat 2:** Embedded API keys or secrets in client bundle.
- **Mitigation:** Zero private keys embedded in source or `vite.config.js`. Production sourcemaps disabled (`sourcemap: false`).

### E. Denial of Service (DoS)
- **Threat:** Rapid spamming of data export, DB clear, or massive avatar file uploads causing browser memory crashes.
- **Mitigation:** `ActionThrottler` enforces cooldown windows. Avatar upload is hard-limited to 2MB and constrained to safe raster formats.

### F. Elevation of Privilege
- **Threat:** Client-side mass assignment adding unauthorized administrative or tournament flags.
- **Mitigation:** Strict field allowlist in `validateProfileSchema()` strips any unapproved attributes prior to storage insertion.
