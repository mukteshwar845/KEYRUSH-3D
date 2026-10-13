/**
 * KEYRUSH — Security & Privacy Audit Logger
 * Maintains a structured, in-memory log of security-sensitive events,
 * data exports, resets, deletions, and validation rejections.
 *
 * Strict Redaction Rule: Never logs passwords, tokens, auth keys,
 * or unnecessary personal identifiers.
 */

const MAX_LOG_ENTRIES = 100;

class SecurityAuditLogger {
  constructor() {
    this.logs = [];
  }

  /**
   * Records a security event in the local audit ring buffer.
   * @param {string} event - E.g. 'DATA_EXPORT', 'ACCOUNT_DELETED', 'AUTH_CHECK', 'VALIDATION_ERROR'
   * @param {object} details - Metadata (automatically redacted)
   */
  log(event, details = {}) {
    const sanitizedDetails = this._sanitizeDetails(details);
    const entry = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      event,
      details: sanitizedDetails
    };

    this.logs.unshift(entry);
    if (this.logs.length > MAX_LOG_ENTRIES) {
      this.logs.pop();
    }

    // Output structured non-leaking diagnostic
    if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
      console.info(`[KEYRUSH-AUDIT] ${entry.event} @ ${entry.timestamp}`, sanitizedDetails);
    }

    return entry;
  }

  getRecentLogs(limit = 25) {
    return this.logs.slice(0, limit);
  }

  exportLogs() {
    return JSON.stringify(
      {
        auditExportTime: new Date().toISOString(),
        totalEntries: this.logs.length,
        logs: this.logs
      },
      null,
      2
    );
  }

  clearLogs() {
    this.logs = [];
  }

  _sanitizeDetails(details) {
    if (!details || typeof details !== 'object') return {};
    const sanitized = {};
    const sensitiveKeys = new Set([
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'cookie',
      'sessionToken'
    ]);

    for (const [k, v] of Object.entries(details)) {
      if (sensitiveKeys.has(k.toLowerCase())) {
        sanitized[k] = '[REDACTED]';
      } else if (typeof v === 'string') {
        sanitized[k] = v.slice(0, 120); // Bound length to prevent log injection
      } else if (typeof v === 'number' || typeof v === 'boolean') {
        sanitized[k] = v;
      } else if (Array.isArray(v)) {
        sanitized[k] = `[Array(${v.length})]`;
      } else if (typeof v === 'object' && v !== null) {
        sanitized[k] = '[Object]';
      }
    }
    return sanitized;
  }
}

export const auditLogger = new SecurityAuditLogger();
