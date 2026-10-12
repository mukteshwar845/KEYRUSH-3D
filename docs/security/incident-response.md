# KEYRUSH — Incident Response & Breach Notification Plan

**Document Version:** 1.0.0  
**Jurisdiction Alignment:** Information Technology Act 2000, CERT-In Cyber Security Directions (2022), DPDPA 2023.  

---

## 1. Incident Classification Framework

| Severity | Definition | Examples | SLA for Initial Response |
|---|---|---|---|
| **P1 - Critical** | Severe compromise of player data, credential leakage, active exploitation | Exposed database secret, malicious payload injection in build bundle | < 1 hour |
| **P2 - High** | Security control failure without confirmed data exfiltration | Content Security Policy bypass, unhandled Prototype Pollution flaw | < 4 hours |
| **P3 - Medium** | Defensive gap or input validation anomaly | Flawed avatar size check, excessive log verbosity | < 24 hours |
| **P4 - Low** | Informational security hardening recommendation | Minor documentation inaccuracy, non-exploitable edge case | < 72 hours |

---

## 2. Six-Phase Response Workflow

```
[ 1. Detection & Triage ] ──> [ 2. Containment ] ──> [ 3. Eradication ]
                                                            │
[ 6. Post-Mortem ] <─── [ 5. Recovery & Verification ] <────┘
         │
[ 4. Regulatory & Player Notification ]
```

### Phase 1: Detection & Triage
- Receive report via GitHub Security Advisory or anomalous audit log pattern.
- Verify severity and replicate in isolated development environment.

### Phase 2: Containment
- Isolate affected components. If a third-party token is compromised, revoke the credential immediately at the source provider.
- Deploy hotfix or disable affected endpoint.

### Phase 3: Eradication
- Identify the root cause in source code or dependency.
- Remove malicious artifacts, patch vulnerable packages, and verify git commit integrity.

### Phase 4: Regulatory & Player Notification (CERT-In / DPDPA)
- **CERT-In Reporting (India):** Under the Indian Computer Emergency Response Team directions, eligible cybersecurity incidents (such as unauthorized access or data breaches) must be reported to CERT-In within 6 hours of notice.
- **Player Notification:** Where personal data is impacted, notify affected players clearly with nature of breach, mitigation steps taken, and recommendations.

### Phase 5: Recovery & Verification
- Deploy verified patch to production.
- Run complete automated test suite (`npm test`) and security scans.
- Confirm system stability and monitor security audit logs.

### Phase 6: Post-Mortem & Documentation
- Document root cause, timeline of events, time to remediate, and preventive actions in `docs/security/incident-history.md`.
