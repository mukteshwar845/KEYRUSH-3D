/**
 * KEYRUSH — Account Lifecycle & Permanent Deletion Manager
 * Implements compliant, multi-step account lifecycle management,
 * auditable deletion workflows, and complete local-data erasure.
 */

import { storage } from '../db/storage.js';
import { auditLogger } from './securityAuditLogger.js';

export const DeletionState = {
  IDLE: 'IDLE',
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export class AccountLifecycleManager {
  constructor() {
    this.state = DeletionState.IDLE;
    this.failureReason = null;
    this.confirmationToken = null;
  }

  /**
   * Initiates account deletion request.
   * Generates a verification challenge token and enters PENDING_CONFIRMATION.
   * @param {string} username - Current pilot username
   * @returns {{ state: string, requiredPhrase: string }}
   */
  initiateDeletion(username = 'Kartik') {
    this.state = DeletionState.PENDING_CONFIRMATION;
    this.requiredPhrase = `DELETE ${username.toUpperCase()}`;
    this.confirmationToken = `del_req_${Date.now()}`;

    auditLogger.log('ACCOUNT_DELETE_INITIATED', {
      user: username,
      state: this.state
    });

    return {
      state: this.state,
      requiredPhrase: this.requiredPhrase,
      token: this.confirmationToken
    };
  }

  /**
   * Cancels a pending deletion request.
   * @returns {boolean}
   */
  cancelDeletion() {
    if (this.state === DeletionState.PENDING_CONFIRMATION) {
      this.state = DeletionState.IDLE;
      this.confirmationToken = null;
      this.requiredPhrase = null;
      auditLogger.log('ACCOUNT_DELETE_CANCELLED', { state: this.state });
      return true;
    }
    return false;
  }

  /**
   * Executes permanent deletion once verification challenge is matched.
   * Purges IndexedDB, LocalStorage, SessionStorage, and Service Worker Caches.
   * @param {string} inputPhrase - User typed confirmation phrase
   * @returns {Promise<{ success: boolean, state: string, error?: string }>}
   */
  async executePermanentDeletion(inputPhrase) {
    if (this.state !== DeletionState.PENDING_CONFIRMATION) {
      return { success: false, state: this.state, error: 'No active deletion request pending confirmation.' };
    }

    if (String(inputPhrase || '').trim() !== this.requiredPhrase) {
      auditLogger.log('ACCOUNT_DELETE_VERIFICATION_FAILED', { state: this.state });
      return { success: false, state: this.state, error: 'Confirmation phrase does not match.' };
    }

    this.state = DeletionState.PROCESSING;
    auditLogger.log('ACCOUNT_DELETE_PROCESSING', { state: this.state });

    try {
      // 1. Wipe all local IndexedDB stores
      await storage.clearAllData();

      // 2. Clear all Service Worker browser caches
      if (typeof caches !== 'undefined') {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // 3. Clear sessionStorage and localStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }

      this.state = DeletionState.COMPLETED;
      auditLogger.log('ACCOUNT_DELETED_PERMANENTLY', {
        state: this.state,
        purgedStores: ['profile', 'sessions', 'garage', 'missions', 'settings', 'leaderboard', 'caches']
      });

      // Dispatch global event for application navigation reset
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('keyrush:account-deleted', {
          detail: { timestamp: new Date().toISOString() }
        }));
      }

      return { success: true, state: this.state };
    } catch (err) {
      this.state = DeletionState.FAILED;
      this.failureReason = err.message || 'Storage purge error';
      auditLogger.log('ACCOUNT_DELETE_ERROR', { error: this.failureReason });
      return { success: false, state: this.state, error: this.failureReason };
    }
  }
}

export const accountLifecycle = new AccountLifecycleManager();
