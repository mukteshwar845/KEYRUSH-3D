# KEYRUSH — Secret Management & Credential Policy

**Document Version:** 1.0.0  

---

## 1. Core Rule: Zero Frontend Secrets

Browser-delivered bundles, JavaScript modules, HTML files, and static assets are considered **100% public**. Obfuscation, minification, or encoding does not provide security against inspection.

- **Never embed private credentials in client code:** No database passwords, private encryption keys, OAuth client secrets, or privileged service tokens may be included in the repository or compiled into the `dist/` directory.
- **No privileged `VITE_*` variables:** Any environment variable prefixed with `VITE_` is automatically inlined into the client bundle by Vite. Only genuinely public configuration (e.g. public API URL) may use this prefix.

---

## 2. Environment & Repository Hygiene

- **`.gitignore` Enforcement:** The project `.gitignore` strictly excludes:
  ```gitignore
  .env
  .env.*
  !.env.example
  *.pem
  *.key
  *.cert
  *.crt
  *.credentials
  secrets/
  ```
- **Secret Scanning in CI/CD:** Developers must ensure that all pull requests and commits are scanned via tools such as `gitleaks` or `trufflehog` before merging to `main`.
- **Exclusion of Production Source Maps:** `vite.config.js` explicitly sets `sourcemap: false` for production builds to prevent exposing internal file systems and source commentary.

---

## 3. Incident Response for Accidental Credential Exposure

If a private credential or API key is ever accidentally committed:
1. **Immediate Revocation:** Immediately revoke the credential at the provider portal (do not merely delete the commit or rename the variable).
2. **Key Rotation:** Generate a new key and update the deployment vault.
3. **Git History Scrubbing:** Rewrite Git history using `git-filter-repo` or BFG Repo-Cleaner if the commit was pushed.
4. **Audit Logs Review:** Review access logs for the exposed service during the exposure window to identify unauthorized usage.
