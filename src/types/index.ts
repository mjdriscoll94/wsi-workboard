export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  label: string;
  category: 'WINDSOR' | 'CUSTOMER' | 'VENDOR' | 'SHIPPER' | 'UNASSIGNED';
  notes?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  source: 'gmail' | 'manual';
  gmailId?: string;
  fromEmail?: string;
  emailSubject?: string;
  emailSnippet?: string;
  // Gmail account this task was synced from (if source === 'gmail')
  accountEmail?: string;
  // Status change tracking for age-based color coding
  lastStatusChange?: Date;
  snoozeUntil?: Date;
}

export interface TaskSection {
  id: string;
  title: string;
  label: string;
  tasks: Task[];
}

export interface GmailConfig {
  accountId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  labels: string[];
}

export interface Priority {
  level: 'low' | 'medium' | 'high' | 'urgent';
  color: string;
  order: number;
}

export const PRIORITIES: Priority[] = [
  { level: 'urgent', color: '#f44336', order: 4 },
  { level: 'high', color: '#ff9800', order: 3 },
  { level: 'medium', color: '#2196f3', order: 2 },
  { level: 'low', color: '#4caf50', order: 1 }
];

export const CATEGORIES = [
  'WINDSOR',
  'CUSTOMER', 
  'VENDOR',
  'SHIPPER',
  'UNASSIGNED'
] as const;

export interface CreateTaskDialogData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  label: string;
  category: 'WINDSOR' | 'CUSTOMER' | 'VENDOR' | 'SHIPPER' | 'UNASSIGNED';
  notes: string;
}

export interface SyncStatus {
  lastSyncTime: Date | null;
  lastEmailTime: Date | null;
  syncInProgress: boolean;
  totalTasksImported: number;
  selectedLabels: string[];
}

export interface BlockedEmail {
  id: string;
  emailAddress: string;
  reason?: string;
  blockedAt: Date;
  blockedBy: string; // User ID who blocked it
}