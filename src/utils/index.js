/**
 * KEYRUSH — Utilities Module Index
 * Security sanitization, account lifecycle management, toast notifications, telemetry cards, and audit logging.
 */

export { AccountLifecycleManager, DeletionState } from './accountLifecycle.js';
export { NotificationManager } from './notifications.js';
export {
  escapeHtml,
  sanitizeObject,
  validateProfileSchema,
  validateSettingsSchema,
  validateAvatarFile,
  ActionThrottler
} from './security.js';
export { auditLogger } from './securityAuditLogger.js';
export { downloadPerformanceCard } from './shareCard.js';
