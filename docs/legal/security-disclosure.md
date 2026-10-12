# KEYRUSH — Vulnerability Disclosure & Responsible Security Policy

**Effective Date:** October 12, 2026  
**Document Version:** 1.0.0  

---

## 1. Commitment to Security

The KEYRUSH engineering team takes application security seriously. We welcome responsible security reports from researchers, developers, and players to help protect our community and enhance system defenses.

---

## 2. In-Scope Targets

- Web Application frontend assets and build configurations.
- Client-side storage and data integrity layers (`src/db/storage.js`, `src/utils/security.js`).
- Service Worker caching mechanisms (`public/sw.js`).
- Dependency integrity and supply chain components (`package.json`).

### Out of Scope
- Denial-of-Service attacks against client browsers or hosting networks.
- Social engineering, spam, or phishing against developers.
- Issues related to out-of-date browser engines or unsupported legacy operating systems.

---

## 3. How to Report a Vulnerability

If you discover a security vulnerability:
1. **Submit via GitHub Private Vulnerability Reporting:**  
   Navigate to the repository: [https://github.com/mukteshwar845/KEYRUSH-3D/security/advisories/new](https://github.com/mukteshwar845/KEYRUSH-3D/security/advisories/new)
2. **Include Key Details:**
   - Detailed description and reproduction steps.
   - Proof of concept (PoC) code or screen capture.
   - Realistic impact assessment and recommended remediation.
3. **Coordinated Disclosure:**
   Please allow reasonable time (up to 30 days) for the engineering team to review, validate, and release a patch before disclosing details publicly.

---

## 4. Safe Harbor

If you conduct vulnerability research in good faith and adhere to these guidelines:
- We will not pursue legal action against you.
- We will work cooperatively with you to validate and remediate the issue promptly.
