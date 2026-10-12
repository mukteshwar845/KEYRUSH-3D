# KEYRUSH — Regulatory Compliance Matrix

**Document Version:** 1.0.0  
**Jurisdictional Context:** Developed in India; accessible globally as an open web application.  
**Evaluated Frameworks:** Digital Personal Data Protection Act, 2023 (DPDPA); Information Technology Act, 2000 & CERT-In Directions; General Data Protection Regulation (GDPR principles).

---

> [!NOTE]
> **[OPERATOR_REVIEW_REQUIRED]**: This compliance matrix is an engineering compliance assessment. Formal regulatory opinions and statutory commencement timelines must be verified by qualified legal counsel in India.

---

## 1. Compliance Matrix by Statute

| Regulatory Framework | Specific Requirement | Applicability to KEYRUSH | Implemented Control | Status | Evidence / Verification |
|---|---|---|---|---|---|
| **DPDPA 2023 (India)** § 4 | Lawful Processing of Digital Personal Data | Applicable | Data processed strictly to deliver the interactive typing game requested by the user. | **Compliant** | [docs/legal/privacy-policy.md](file:///d:/GoTYpe/docs/legal/privacy-policy.md) |
| **DPDPA 2023 (India)** § 6 | Clear & Noticeable Consent / Notice | Applicable | Privacy notice provided in clear plain language; separate optional analytics toggle. | **Compliant** | In-app Privacy Notice and Settings Privacy Toggles |
| **DPDPA 2023 (India)** § 8 | Reasonable Security Safeguards | Applicable | CSP headers, HTML escaping, prototype pollution defense, safe file upload validation. | **Compliant** | [src/utils/security.js](file:///d:/GoTYpe/src/utils/security.js), `vite.config.js` |
| **DPDPA 2023 (India)** § 12 | Right to Correction and Erasure | Applicable | Complete self-service editing in Profile; complete atomic Account Deletion in Settings. | **Compliant** | [src/utils/accountLifecycle.js](file:///d:/GoTYpe/src/utils/accountLifecycle.js), `Account Deletion Workflow` |
| **DPDPA 2023 (India)** § 13 | Grievance Redressal Mechanism | Applicable | Direct link to issue tracker / security disclosure for reporting privacy grievances. | **Compliant** | [docs/legal/security-disclosure.md](file:///d:/GoTYpe/docs/legal/security-disclosure.md) |
| **IT Act 2000 (India)** § 43A | Protection of Sensitive Personal Data | Applicable | Offline-first architecture isolates all sensitive data in client sandbox. | **Compliant** | Zero server-side personal data transmission |
| **CERT-In Directions (2022)** | Mandatory 6-Hour Reporting of Cybersecurity Incidents | Applicable | Incident Response Plan defines 6-hour CERT-In notification protocol for breaches. | **Compliant** | [docs/security/incident-response.md](file:///d:/GoTYpe/docs/security/incident-response.md) |
| **GDPR (EU) Art. 15-20** | Data Subject Rights (Access, Portability, Erasure) | Applicable for EU users | Full JSON career export; full atomic account deletion. | **Compliant** | `storage.exportFullData()`, `accountLifecycle.executePermanentDeletion()` |
| **GDPR (EU) Art. 25** | Privacy by Design & Default | Applicable | No tracking cookies; private profile mode option; minimal data collection. | **Compliant** | [src/db/storage.js](file:///d:/GoTYpe/src/db/storage.js) default schemas |

---

## 2. Key Action Items for Operator
- `[OPERATOR_REVIEW_REQUIRED]`: When the Digital Personal Data Protection Rules, 2025 are formally notified with effective enforcement dates by the Government of India, verify whether registration with the Data Protection Board of India is required based on entity turnover and user volume.
- `[OPERATOR_REVIEW_REQUIRED]`: Populate official registered corporate name and Data Protection Officer email before commercial advertising.
