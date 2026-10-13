/**
 * KEYRUSH — Security Hardening & Input Sanitization Layer
 * Provides robust defensive controls against XSS, Prototype Pollution,
 * Mass Assignment, Malicious File Uploads, and Operation Spam.
 */

/**
 * Escapes characters with special HTML meaning to prevent Cross-Site Scripting (XSS).
 * @param {any} val - Untrusted input
 * @returns {string} Sanitized HTML-safe string
 */
export function escapeHtml(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  const match = /[&<>"'`=/]/.exec(str);
  if (!match) return str;

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/=/g, '&#61;')
    .replace(/\//g, '&#47;');
}

/**
 * Deeply sanitizes an object against Prototype Pollution and Mass Assignment.
 * Explicitly strips forbidden keys (__proto__, constructor, prototype)
 * and limits fields to an optional allowedKeys whitelist.
 * @param {object} obj - Untrusted object
 * @param {string[]|null} allowedKeys - Optional list of permitted keys
 * @returns {object} Safe cloned object
 */
export function sanitizeObject(obj, allowedKeys = null) {
  if (typeof obj !== 'object' || obj === null) return {};

  const clean = Object.create(null);
  const forbidden = new Set(['__proto__', 'constructor', 'prototype']);

  for (const key of Object.keys(obj)) {
    if (forbidden.has(key)) continue;
    if (allowedKeys && !allowedKeys.includes(key)) continue;

    const val = obj[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      clean[key] = sanitizeObject(val);
    } else if (Array.isArray(val)) {
      clean[key] = val.map((item) =>
        typeof item === 'object' && item !== null ? sanitizeObject(item) : item
      );
    } else {
      clean[key] = val;
    }
  }

  return { ...clean };
}

/**
 * Validates and normalizes Pilot Profile data.
 * Protects against buffer overflows, invalid avatar formats, and unexpected fields.
 * @param {object} input - User submitted profile
 * @returns {{ valid: boolean, sanitized: object, errors: string[] }}
 */
export function validateProfileSchema(input) {
  const errors = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, sanitized: {}, errors: ['Profile payload must be an object'] };
  }

  const allowedKeys = [
    'id',
    'username',
    'callsign',
    'role',
    'avatar',
    'league',
    'leagueTier',
    'bio',
    'tagline',
    'country',
    'joinedDate',
    'visibility',
    'showStats',
    'showHistory',
    'xp',
    'level',
    'totalPracticeTimeSec',
    'racesWon',
    'racesPlayed',
    'bestWpm',
    'averageWpm',
    'accuracy',
    'currentStreak',
    'longestStreak',
    'lastActiveDate',
    'weakKeys',
    'analyticsConsent'
  ];

  const raw = sanitizeObject(input, allowedKeys);

  // 1. Username
  let username = String(raw.username || 'Kartik').trim();
  if (username.length < 2 || username.length > 32) {
    errors.push('Username must be between 2 and 32 characters');
    username = username.slice(0, 32) || 'Pilot';
  }
  // Disallow control characters and dangerous scripts in username
  username = username.replace(/[\x00-\x1F\x7F<>]/g, '');

  // 2. Callsign
  let callsign = String(raw.callsign || `${username.toUpperCase().slice(0, 8)}-01`).trim();
  callsign = callsign.replace(/[^A-Za-z0-9\-_]/g, '').slice(0, 16);

  // 3. Bio & Tagline
  let bio = String(raw.bio || '')
    .trim()
    .slice(0, 250);
  let tagline = String(raw.tagline || '')
    .trim()
    .slice(0, 80);

  // 4. Country Code (ISO alpha-3)
  let country = String(raw.country || 'IND')
    .trim()
    .toUpperCase()
    .slice(0, 3);
  if (!/^[A-Z]{2,3}$/.test(country)) country = 'IND';

  // 5. Visibility & Privacy
  const visibility = ['public', 'private'].includes(raw.visibility) ? raw.visibility : 'public';
  const showStats = raw.showStats !== false;
  const showHistory = raw.showHistory !== false;
  const analyticsConsent = raw.analyticsConsent === true;

  // 6. Avatar URL or Data URI check
  let avatar = String(raw.avatar || '/images/ui/avatar-kartik.png').trim();
  const isValidAvatar =
    avatar.startsWith('/') ||
    avatar.startsWith('data:image/png;base64,') ||
    avatar.startsWith('data:image/jpeg;base64,') ||
    avatar.startsWith('data:image/webp;base64,') ||
    /^https?:\/\/[a-zA-Z0-9.\-_/]+$/i.test(avatar);

  if (!isValidAvatar) {
    errors.push('Invalid avatar format. Only safe local paths and data URIs are permitted.');
    avatar = '/images/ui/avatar-kartik.png';
  }

  const sanitized = {
    ...raw,
    id: 'user_profile',
    username,
    callsign,
    bio,
    tagline,
    country,
    visibility,
    showStats,
    showHistory,
    analyticsConsent,
    avatar
  };

  return {
    valid: errors.length === 0,
    sanitized,
    errors
  };
}

/**
 * Validates and constrains user settings.
 * @param {object} input - Settings input
 * @returns {{ valid: boolean, sanitized: object }}
 */
export function validateSettingsSchema(input) {
  if (!input || typeof input !== 'object') {
    return { valid: false, sanitized: {} };
  }

  const allowedKeys = [
    'id',
    'theme',
    'soundEffects',
    'engineAudio',
    'sfxVolume',
    'engineVolume',
    'masterVolume',
    'interiorVolume',
    'racingVolume',
    'musicMuted',
    'keyboardClickSound',
    'errorPenalty',
    'reducedMotion',
    'targetWpm',
    'targetAccuracy',
    'dailyGoalMinutes',
    'notificationsEnabled',
    'analyticsConsent'
  ];

  const raw = sanitizeObject(input, allowedKeys);

  const clamp = (val, min, max, fallback) => {
    const num = Number(val);
    if (isNaN(num)) return fallback;
    return Math.max(min, Math.min(max, num));
  };

  const allowedThemes = ['cyber-dark', 'oled-black', 'cyber-light'];
  const theme = allowedThemes.includes(raw.theme) ? raw.theme : 'cyber-dark';

  const allowedPenalties = ['forgiving', 'standard', 'hardcore'];
  const errorPenalty = allowedPenalties.includes(raw.errorPenalty) ? raw.errorPenalty : 'standard';

  const allowedClicks = ['cherry-blue', 'mx-red', 'cyber-blip', 'off'];
  const keyboardClickSound = allowedClicks.includes(raw.keyboardClickSound)
    ? raw.keyboardClickSound
    : 'cherry-blue';

  const sanitized = {
    id: 'user_settings',
    theme,
    soundEffects: Boolean(raw.soundEffects ?? true),
    engineAudio: Boolean(raw.engineAudio ?? true),
    sfxVolume: clamp(raw.sfxVolume, 0, 1, 0.6),
    engineVolume: clamp(raw.engineVolume, 0, 1, 0.5),
    masterVolume: clamp(raw.masterVolume, 0, 1, 0.8),
    interiorVolume: clamp(raw.interiorVolume, 0, 1, 0.55),
    racingVolume: clamp(raw.racingVolume, 0, 1, 0.65),
    musicMuted: Boolean(raw.musicMuted ?? false),
    keyboardClickSound,
    errorPenalty,
    reducedMotion: Boolean(raw.reducedMotion ?? false),
    targetWpm: Math.round(clamp(raw.targetWpm, 20, 200, 80)),
    targetAccuracy: Math.round(clamp(raw.targetAccuracy, 50, 100, 98)),
    dailyGoalMinutes: Math.round(clamp(raw.dailyGoalMinutes, 5, 120, 15)),
    notificationsEnabled: Boolean(raw.notificationsEnabled ?? true),
    analyticsConsent: Boolean(raw.analyticsConsent ?? false)
  };

  return { valid: true, sanitized };
}

/**
 * Validates uploaded image files for avatar safety.
 * Enforces MIME type whitelists and file size constraints (max 2MB).
 * @param {File} file
 * @returns {Promise<{ safe: boolean, error?: string }>}
 */
export async function validateAvatarFile(file) {
  if (!file) return { safe: false, error: 'No file provided' };

  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  if (file.size > MAX_SIZE) {
    return { safe: false, error: 'File exceeds 2MB limit' };
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { safe: false, error: 'Unsupported file type. Use PNG, JPG, or WEBP.' };
  }

  return { safe: true };
}

/**
 * Rate-limits repetitive operations (e.g. export, reset, rapid clicking).
 */
export class ActionThrottler {
  constructor(cooldownMs = 1000) {
    this.cooldownMs = cooldownMs;
    this.lastActionTime = 0;
  }

  canExecute() {
    const now = Date.now();
    if (now - this.lastActionTime >= this.cooldownMs) {
      this.lastActionTime = now;
      return true;
    }
    return false;
  }
}
