/**
 * KEYRUSH — Security Hardening, Privacy Controls & Account Lifecycle Automated Test Suite
 * Validates defensive controls: XSS mitigation, prototype pollution prevention,
 * schema validation, avatar file checks, account deletion state machine, and secret scanning.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import {
  escapeHtml,
  sanitizeObject,
  validateProfileSchema,
  validateSettingsSchema,
  validateAvatarFile,
  ActionThrottler
} from '../src/utils/security.js';

import { auditLogger } from '../src/utils/securityAuditLogger.js';
import { AccountLifecycleManager, DeletionState } from '../src/utils/accountLifecycle.js';

test('1. XSS Input Sanitization: escapeHtml neutralizes script tags, attributes, and special characters', () => {
  assert.equal(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#47;script&gt;');
  assert.equal(escapeHtml('Pilot" onerror="alert(1)'), 'Pilot&quot; onerror&#61;&quot;alert(1)');
  assert.equal(escapeHtml("Apex' or '1'='1"), 'Apex&#39; or &#39;1&#39;&#61;&#39;1');
  assert.equal(escapeHtml('`test`'), '&#96;test&#96;');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(12345), '12345');
});

test('2. Prototype Pollution Defense: sanitizeObject strips __proto__, constructor, and prototype', () => {
  const maliciousPayload = JSON.parse(`{
    "username": "Hacker",
    "__proto__": { "polluted": true },
    "constructor": { "prototype": { "admin": true } }
  }`);

  const clean = sanitizeObject(maliciousPayload, ['username']);
  assert.equal(clean.username, 'Hacker');
  assert.equal(clean.__proto__.polluted, undefined);
  assert.equal(({}).polluted, undefined);
  assert.equal(clean.constructor.prototype?.admin, undefined);
  assert.equal(({}).admin, undefined);
});

test('3. Mass Assignment Prevention & Profile Validation', () => {
  const untrustedInput = {
    username: '   ValidPilot   ',
    callsign: 'PILOT#@!_99',
    bio: 'Pushing speed to the redline.',
    country: 'india',
    visibility: 'invalid_mode',
    isAdmin: true, // Forbidden field
    role: 'Apex Pilot',
    avatar: 'javascript:alert(1)' // Dangerous avatar
  };

  const { valid, sanitized, errors } = validateProfileSchema(untrustedInput);

  assert.equal(sanitized.username, 'ValidPilot');
  assert.equal(sanitized.callsign, 'PILOT_99');
  assert.equal(sanitized.country, 'IND');
  assert.equal(sanitized.visibility, 'public'); // Default fallback
  assert.equal(sanitized.isAdmin, undefined); // Stripped mass assignment
  assert.equal(sanitized.avatar, '/images/ui/avatar-kartik.png'); // Reset to safe fallback
  assert.ok(errors.length > 0);
});

test('4. Settings Validation: Clamps volumes and constrains options to safe bounds', () => {
  const unconstrainedSettings = {
    masterVolume: 2.5, // Exceeds 1.0
    sfxVolume: -0.5,   // Below 0.0
    theme: 'evil-theme', // Unrecognized
    targetWpm: 9999,     // Exceeds realistic bounds
    reducedMotion: true
  };

  const { valid, sanitized } = validateSettingsSchema(unconstrainedSettings);
  assert.ok(valid);
  assert.equal(sanitized.masterVolume, 1.0);
  assert.equal(sanitized.sfxVolume, 0.0);
  assert.equal(sanitized.theme, 'cyber-dark');
  assert.equal(sanitized.targetWpm, 200);
  assert.equal(sanitized.reducedMotion, true);
});

test('5. Safe Avatar File Validation: Rejects oversized and invalid MIME types', async () => {
  const oversizedFile = { size: 3 * 1024 * 1024, type: 'image/png' };
  const res1 = await validateAvatarFile(oversizedFile);
  assert.equal(res1.safe, false);
  assert.match(res1.error, /2MB limit/);

  const maliciousMimeFile = { size: 50 * 1024, type: 'text/html' };
  const res2 = await validateAvatarFile(maliciousMimeFile);
  assert.equal(res2.safe, false);
  assert.match(res2.error, /Unsupported file type/);

  const validPng = { size: 250 * 1024, type: 'image/png' };
  const res3 = await validateAvatarFile(validPng);
  assert.equal(res3.safe, true);
});

test('6. Action Rate-Limiter: ActionThrottler enforces cooldown between rapid calls', () => {
  const throttler = new ActionThrottler(50);
  assert.equal(throttler.canExecute(), true);
  assert.equal(throttler.canExecute(), false); // Immediately called again
});

test('7. Account Deletion Lifecycle: State machine transitions, challenge verification & purge', async () => {
  const manager = new AccountLifecycleManager();
  assert.equal(manager.state, DeletionState.IDLE);

  // 1. Initiate deletion
  const req = manager.initiateDeletion('Kartik');
  assert.equal(manager.state, DeletionState.PENDING_CONFIRMATION);
  assert.equal(req.requiredPhrase, 'DELETE KARTIK');

  // 2. Reject incorrect phrase
  const failRes = await manager.executePermanentDeletion('DELETE WRONG_USER');
  assert.equal(failRes.success, false);
  assert.equal(manager.state, DeletionState.PENDING_CONFIRMATION);

  // 3. Cancel deletion
  const cancelled = manager.cancelDeletion();
  assert.equal(cancelled, true);
  assert.equal(manager.state, DeletionState.IDLE);

  // 4. Re-initiate and execute with correct phrase
  manager.initiateDeletion('Kartik');
  const successRes = await manager.executePermanentDeletion('DELETE KARTIK');
  assert.equal(successRes.success, true);
  assert.equal(manager.state, DeletionState.COMPLETED);
});

test('8. Security Audit Logger: Automated redaction and ring-buffer bounded retention', () => {
  auditLogger.clearLogs();
  auditLogger.log('AUTH_TEST', {
    user: 'Kartik',
    password: 'SuperSecretPassword123!',
    token: 'jwt_secret_token_abc'
  });

  const logs = auditLogger.getRecentLogs(1);
  assert.equal(logs.length, 1);
  assert.equal(logs[0].details.user, 'Kartik');
  assert.equal(logs[0].details.password, '[REDACTED]');
  assert.equal(logs[0].details.token, '[REDACTED]');
});

test('9. Secret Scanner: Zero exposed private keys, database passwords or API keys in source files', () => {
  const srcDir = join(process.cwd(), 'src');
  const secretPatterns = [
    /-----BEGIN (?:RSA )?PRIVATE KEY-----/,
    /sk_live_[0-9a-zA-Z]{24}/,
    /AKIA[0-9A-Z]{16}/,
    /AIza[0-9A-Za-z\\-_]{35}/,
    /ghp_[0-9a-zA-Z]{36}/
  ];

  function scanDir(dir) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.endsWith('.js') || entry.endsWith('.json') || entry.endsWith('.html')) {
        const content = readFileSync(fullPath, 'utf8');
        for (const pattern of secretPatterns) {
          assert.equal(
            pattern.test(content),
            false,
            `Secret exposure pattern detected in ${fullPath}`
          );
        }
      }
    }
  }

  scanDir(srcDir);
});
