# KEYRUSH — Data Retention & Deletion Policy

**Effective Date:** October 12, 2026  
**Document Version:** 1.0.0  

---

## 1. Data Retention Principles

In accordance with data minimization best practices and the Digital Personal Data Protection Act (DPDPA 2023):
- KEYRUSH retains personal data only as long as necessary to fulfill the local gaming simulation purposes.
- Because KEYRUSH utilizes an offline-first architecture, all personal telemetry, profile details, and customization choices reside locally within your browser sandbox.

---

## 2. Retention Schedules by Category

| Category | Storage Medium | Retention Period | Deletion Trigger |
|---|---|---|---|
| **Pilot Profile** | IndexedDB (`profile`) | Indefinite on device | User manual edit, reset, or Account Deletion |
| **Race Telemetry Sessions** | IndexedDB (`sessions`) | Up to 1,000 recent sessions | User Career Reset or Account Deletion |
| **Garage Unlocks & Liveries** | IndexedDB (`garage`) | Indefinite on device | User Account Deletion |
| **Daily Missions & Streaks** | IndexedDB (`missions`) | 7-day rolling window | Automatic daily rotation or Account Deletion |
| **Audio & Visual Settings** | IndexedDB (`settings`) | Indefinite on device | User Account Deletion or browser data wipe |
| **PWA Cache Storage** | Cache API (`keyrush-v3`) | Until Service Worker update | App update or User Account Deletion |
| **Session Flag** | `sessionStorage` | Active browser tab lifetime | Tab close or User Account Deletion |

---

## 3. Account Deletion Execution

When a player executes **Settings → Account → Delete Account**:
1. **Verification Challenge:** The user must enter their confirmation phrase (`DELETE <CALLSIGN>`).
2. **Atomic Storage Purge:** All IndexedDB object stores are wiped completely via `indexedDB.deleteDatabase()` / store clearing.
3. **Cache Storage Eviction:** All Service Worker caches are iterated and unlinked.
4. **Session Eviction:** `sessionStorage` and `localStorage` are cleared.
5. **No Residual Personal Data:** No backup copy of personal data is retained by KEYRUSH.
