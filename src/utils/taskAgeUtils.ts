import { Task } from '../types';

export interface TaskAgeInfo {
  daysInCurrentStatus: number;
  shouldShowWarning: boolean;
  shouldShowUrgent: boolean;
  isSnoozed: boolean;
  backgroundColor: string;
  borderColor: string;
}

export const calculateTaskAge = (task: Task): TaskAgeInfo => {
  const now = new Date();
  
  // Check if task is snoozed
  const isSnoozed = !!(task.snoozeUntil && now < new Date(task.snoozeUntil));
  
  // Use lastStatusChange if available, otherwise fall back to createdAt
  const statusChangeDate = task.lastStatusChange ? new Date(task.lastStatusChange) : new Date(task.createdAt);
  const daysInCurrentStatus = Math.floor((now.getTime() - statusChangeDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine warning levels (only if not snoozed)
  const shouldShowWarning = !isSnoozed && daysInCurrentStatus >= 1;
  const shouldShowUrgent = !isSnoozed && daysInCurrentStatus >= 3;
  
  // Calculate background and border colors
  let backgroundColor = '#fff'; // Default white
  let borderColor = '#e0e0e0'; // Default light gray border
  
  if (isSnoozed) {
    backgroundColor = '#f8f9fa'; // Light gray when snoozed
    borderColor = '#bdbdbd';
  } else if (shouldShowUrgent) {
    backgroundColor = '#ffebee'; // Light red background
    borderColor = '#f44336'; // Red border
  } else if (shouldShowWarning) {
    backgroundColor = '#fff3e0'; // Light orange background
    borderColor = '#ff9800'; // Orange border
  }
  
  return {
    daysInCurrentStatus,
    shouldShowWarning,
    shouldShowUrgent,
    isSnoozed,
    backgroundColor,
    borderColor
  };
};

export const getAgeDisplayText = (task: Task): string => {
  const ageInfo = calculateTaskAge(task);
  
  if (ageInfo.isSnoozed) {
    return 'Snoozed';
  }
  
  if (ageInfo.daysInCurrentStatus === 0) {
    return 'Today';
  } else if (ageInfo.daysInCurrentStatus === 1) {
    return '1 day';
  } else {
    return `${ageInfo.daysInCurrentStatus} days`;
  }
};

export const getAgeTooltip = (task: Task): string => {
  const ageInfo = calculateTaskAge(task);
  
  if (ageInfo.isSnoozed) {
    return `Snoozed until ${new Date(task.snoozeUntil!).toLocaleDateString()}`;
  }
  
  const statusChangeDate = task.lastStatusChange ? new Date(task.lastStatusChange) : new Date(task.createdAt);
  return `In current status since ${statusChangeDate.toLocaleDateString()} (${ageInfo.daysInCurrentStatus} days ago)`;
}; 