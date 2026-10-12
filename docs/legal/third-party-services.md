# KEYRUSH — Third-Party Services & Dependency Inventory

**Effective Date:** October 12, 2026  
**Document Version:** 1.0.0  

---

## 1. Network Integrations

KEYRUSH maintains a strict zero-tracker policy. The verified external network services are limited to:

| Service / Domain | Purpose | Data Transmitted | Privacy Policy |
|---|---|---|---|
| **Google Fonts CDN** (`fonts.googleapis.com`, `fonts.gstatic.com`) | Delivers web typography (Chakra Petch, Rajdhani, Orbitron, Inter, JetBrains Mono) | IP address, User-Agent during HTTP GET request for CSS/WOFF2 font files | [Google Privacy Policy](https://policies.google.com/privacy) |

KEYRUSH does **NOT** transmit data to:
- Google Analytics / Google Tag Manager
- Facebook Pixel / Meta Advertising
- AdMob / DoubleClick
- Sentry / Datadog (Client telemetry is retained locally in memory/IndexedDB)

---

## 2. Bundled Open-Source Libraries (Client Build)

All JavaScript packages used by KEYRUSH are bundled directly into the client production bundle at build time and do not execute external tracking calls:

| Package | Version | Purpose | License |
|---|---|---|---|
| **three** | ^0.186.1 | WebGL 3D graphics, procedural track rendering, car geometries, and lighting | MIT |
| **chart.js** | ^4.5.1 | Client-side telemetry rendering for WPM progression curves | MIT |
| **canvas-confetti** | ^1.9.4 | Victory celebration visual particles | MIT |
| **vite** | ^8.3.0 | Modern build tool & ES module bundler | MIT |
