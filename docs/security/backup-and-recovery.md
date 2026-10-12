# KEYRUSH — Backup, Disaster Recovery & Data Portability

**Document Version:** 1.0.0  

---

## 1. Client-Side Disaster Recovery Model

Because KEYRUSH operates with an offline-first architecture storing data in IndexedDB (`keyrush_database`), standard server-side automated database backups do not capture user-isolated browser records.

To empower players with complete data ownership and disaster recovery resilience:
1. **JSON Data Portability Standard:** KEYRUSH implements a full JSON backup format accessible from **Settings → Offline Data & Backup → Backup All Data (JSON)** or **Profile → Export Career Data**.
2. **Atomic Schema Export:** The exported JSON document contains:
   - Metadata (`exportDate`, `app`, `version`)
   - `profile`: User identity, stats, streak, weak keys, privacy preferences
   - `garage`: Unlocked vehicles, custom paint hex codes, underglow
   - `settings`: Audio volumes, mechanical switches, error penalties
   - `missions`: Daily mission list and streak tracking
   - `sessions`: Up to 1,000 recorded race sessions and telemetry logs
3. **Restoration Protocol:** Players can restore their career state onto any device or browser by uploading their JSON backup in **Settings → Restore Backup**. The ingestion layer automatically validates and sanitizes all fields before writing to IndexedDB.

---

## 2. Browser Storage Resilience & Caveats

- **Private / Incognito Browsing:** Browsers clear IndexedDB and Service Worker caches immediately upon window closure. Players are notified not to expect long-term persistence in private browsing mode.
- **Low-Disk Eviction:** Modern browsers (Chrome, Safari, Firefox) may evict IndexedDB data if device disk space falls below critical thresholds. Users are encouraged to export backups periodically.
