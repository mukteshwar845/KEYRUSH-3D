# KEYRUSH — Cookie & Local Storage Notice

**Effective Date:** October 12, 2026  
**Document Version:** 1.0.0  
**Project:** KEYRUSH  

---

## 1. Zero Tracking Cookie Policy

KEYRUSH does **NOT** use tracking cookies, advertising identifiers, or third-party marketing cookies. We do not set persistent HTTP tracking cookies on your device.

---

## 2. Browser Storage Technologies Used

To deliver a high-octane 3D racing simulator that operates 100% offline, KEYRUSH utilizes modern, browser-native client-side storage technologies:

| Storage Type | Key / Name | Purpose | Retention |
|---|---|---|---|
| **IndexedDB** | `keyrush_database` | Stores your pilot profile, vehicle customizations, unlocked liveries, race session telemetry, and sound preferences. | Persistent until user clears data or deletes account. |
| **Session Storage** | `keyrush_entered` | Tracks whether the user has completed the initial landing walkthrough in the current browser tab. | Destroyed when tab or browser window is closed. |
| **Cache Storage** | `keyrush-v3` | Caches static assets (3D meshes, procedural shaders, audio files, icons) for offline PWA gameplay. | Managed by Service Worker; purged on account deletion or cache update. |

---

## 3. How to Manage or Clear Your Storage

You have full control over all stored data at any time:
1. **Within the Game:**
   - Go to **Settings → Offline Data & Backup → Reset All Data** to reset career progress.
   - Go to **Settings → Account → Delete Account** to execute a total wipe of IndexedDB, session storage, and service worker caches.
2. **Via Browser Settings:**
   - In Chrome/Edge: Open Developer Tools (`F12`) → Application → Storage → Clear site data.
   - In Firefox: Settings → Privacy & Security → Cookies and Site Data → Clear Data.
   - In Safari: Preferences → Privacy → Manage Website Data → Remove.
