import { SyncStatus } from '../types';

const SYNC_STATUS_KEY = 'gmail_sync_status';
const DEFAULT_LABELS = ['INBOX', 'IMPORTANT', 'STARRED'];

export class SyncService {
  // Per-account keys
  private static ACCOUNT_STATUS_KEY_PREFIX = 'gmail_sync_status_';

  static getAccountSyncStatus(email: string): SyncStatus {
    try {
      const stored = localStorage.getItem(this.ACCOUNT_STATUS_KEY_PREFIX + email);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastSyncTime: parsed.lastSyncTime ? new Date(parsed.lastSyncTime) : null,
          lastEmailTime: parsed.lastEmailTime ? new Date(parsed.lastEmailTime) : null,
        } as SyncStatus;
      }
    } catch {}
    return {
      lastSyncTime: null,
      lastEmailTime: null,
      syncInProgress: false,
      totalTasksImported: 0,
      selectedLabels: DEFAULT_LABELS
    };
  }

  static saveAccountSyncStatus(email: string, status: SyncStatus): void {
    try {
      localStorage.setItem(this.ACCOUNT_STATUS_KEY_PREFIX + email, JSON.stringify(status));
    } catch {}
  }
  // Get sync status from localStorage
  static getSyncStatus(): SyncStatus {
    try {
      const stored = localStorage.getItem(SYNC_STATUS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastSyncTime: parsed.lastSyncTime ? new Date(parsed.lastSyncTime) : null,
          lastEmailTime: parsed.lastEmailTime ? new Date(parsed.lastEmailTime) : null,
        };
      }
    } catch (error) {
      console.error('Error reading sync status:', error);
    }

    return {
      lastSyncTime: null,
      lastEmailTime: null,
      syncInProgress: false,
      totalTasksImported: 0,
      selectedLabels: DEFAULT_LABELS
    };
  }

  // Save sync status to localStorage
  static saveSyncStatus(status: SyncStatus): void {
    try {
      localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('Error saving sync status:', error);
    }
  }

  // Update sync progress
  static updateSyncProgress(inProgress: boolean): void {
    const status = this.getSyncStatus();
    status.syncInProgress = inProgress;
    if (inProgress) {
      status.lastSyncTime = new Date();
    }
    this.saveSyncStatus(status);
  }

  // Record successful import
  static recordImport(emailDate: Date, tasksImported: number): void {
    const status = this.getSyncStatus();
    status.lastEmailTime = emailDate;
    status.totalTasksImported += tasksImported;
    status.syncInProgress = false;
    this.saveSyncStatus(status);
  }

  // Update selected labels
  static updateSelectedLabels(labels: string[]): void {
    const status = this.getSyncStatus();
    status.selectedLabels = labels;
    this.saveSyncStatus(status);
  }

  // Set custom sync date for testing
  static setCustomSyncFromDate(date: Date): void {
    const status = this.getSyncStatus();
    // Set the last email time to the custom date to force sync from that date
    status.lastEmailTime = date;
    status.lastSyncTime = null; // Clear last sync to force a fresh sync
    this.saveSyncStatus(status);
    console.log('Custom sync date set to:', date.toISOString());
  }

  // Check if sync is needed (has it been a while?)
  static shouldSuggestSync(): boolean {
    const status = this.getSyncStatus();
    if (!status.lastSyncTime) return true;

    const hoursSinceLastSync = (Date.now() - status.lastSyncTime.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastSync > 4; // Suggest sync if more than 4 hours
  }

  // Get time since last sync for display
  static getTimeSinceLastSync(): string {
    const status = this.getSyncStatus();
    if (!status.lastSyncTime) return 'Never';

    const diffMs = Date.now() - status.lastSyncTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  // Clear sync data (for testing or reset)
  static clearSyncData(): void {
    localStorage.removeItem(SYNC_STATUS_KEY);
  }
}