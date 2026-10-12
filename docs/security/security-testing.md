# KEYRUSH — Security Testing Guide & Verification Checklist

**Document Version:** 1.0.0  
**Framework Alignment:** OWASP Web Security Testing Guide (WSTG), OWASP ASVS v4.0  

---

## 1. Automated Security Test Suite

Automated security checks are maintained in `tests/securityHardening.test.js` and executed via:
```bash
npm test
```

### Covered Security Test Suites:
1. **XSS Input Sanitization:** Verifies `escapeHtml` neutralizes `<script>`, `<img>` onerror, and attribute breakout attacks.
2. **Prototype Pollution Defense:** Verifies `sanitizeObject` strips `__proto__`, `constructor`, and `prototype` keys from untrusted inputs.
3. **Mass Assignment Prevention:** Verifies unexpected fields cannot be injected into player profiles or settings.
4. **Avatar File Upload Safety:** Verifies `validateAvatarFile` rejects files >2MB and non-image MIME types.
5. **Account Deletion Verification:** Verifies multi-state deletion lifecycle (`PENDING_CONFIRMATION` -> `PROCESSING` -> `COMPLETED`) and full data erasure.
6. **Rate Limiting / Throttling:** Verifies `ActionThrottler` enforces operational cooldowns.
7. **Zero Embedded Secrets Check:** Automated AST/regex scanner asserting that no API keys, private keys, or passwords exist in source files or bundle configurations.
8. **CSP & Security Headers Configuration:** Asserts that Content-Security-Policy and defensive headers are defined in `index.html` and `vite.config.js`.

---

## 2. Manual Verification Checklist Before Each Release

- [ ] Execute `npm audit` to verify zero known dependency vulnerabilities.
- [ ] Run `npm run build` and verify production bundle compiles without warnings.
- [ ] Verify `dist/` contains zero `.map` sourcemap files (`sourcemap: false`).
- [ ] Inspect browser DevTools Console for zero CSP violations or mixed content warnings.
- [ ] Test Account Deletion flow in Settings and verify IndexedDB and Service Worker caches are completely purged.
- [ ] Validate privacy toggles (Public/Private profile) persist correctly across page reloads.
