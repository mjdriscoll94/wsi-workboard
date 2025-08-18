import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Fab,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Email as EmailIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Sync as SyncIcon,
  Block as BlockIcon
} from '@mui/icons-material';

import { Task, TaskSection } from '../types';
import { TaskService } from '../services/taskService';
import { GmailService } from '../services/gmailService';
import TaskSectionComponent from './TaskSection';
import CreateTaskDialog from './CreateTaskDialog';
import GmailSetupDialog from './GmailSetupDialog';
import GmailSyncDialog from './GmailSyncDialog';
import AccountManager from './AccountManager';
import { SyncService } from '../services/syncService';
import { useAuth } from '../contexts/AuthContext';
import BlockedEmailsDialog from './BlockedEmailsDialog';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskSections, setTaskSections] = useState<TaskSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [gmailSetupOpen, setGmailSetupOpen] = useState(false);
  const [gmailSyncOpen, setGmailSyncOpen] = useState(false);
  const [accountManagerOpen, setAccountManagerOpen] = useState(false);
  const [blockedEmailsOpen, setBlockedEmailsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { logout } = useAuth();


  // Initialize dashboard
  useEffect(() => {
    initializeDashboard();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to task updates
  useEffect(() => {
    const unsubscribe = TaskService.subscribeToTasks((updatedTasks) => {
      setTasks(updatedTasks);
      organizeTasks(updatedTasks);
    });

    return () => unsubscribe();
  }, []);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      

      
      // Check Gmail connection status
      try {
        await GmailService.initialize();
        const signedIn = GmailService.isSignedIn();
        setIsGmailConnected(signedIn);
        
        if (signedIn) {
          const email = GmailService.getUserEmail();
          setUserEmail(email);
        }
      } catch (gmailError) {
        console.warn('Gmail service initialization failed:', gmailError);
      }

      // Load existing tasks
      try {
        const existingTasks = await TaskService.getAllTasks();
        setTasks(existingTasks);
        organizeTasks(existingTasks);
      } catch (taskError) {
        console.warn('Task service initialization failed:', taskError);
        showSnackbar('Tasks will not persist - check Firebase configuration', 'warning');
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      showSnackbar('Error initializing dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const organizeTasks = (taskList: Task[]) => {
    // Filter out completed tasks (they should not be displayed)
    const activeTasks = taskList.filter(task => !task.completed && task.label !== 'DONE');
    
    // Group tasks by label
    const labelGroups = activeTasks.reduce((acc, task) => {
      if (!acc[task.label]) {
        acc[task.label] = [];
      }
      acc[task.label].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    // Create task sections
    const sections: TaskSection[] = Object.entries(labelGroups).map(([label, labelTasks]) => ({
      id: label.replace(/\s+/g, '-'),  // Keep original case for IDs
      title: label,
      label: label,
      tasks: labelTasks.sort((a, b) => {
        // Sort by priority first, then by creation date
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
    }));

    // Add default sections if they don't exist and organize in specific order
    const defaultSections = ['FOLLOW UP', 'SCHEDULE CALL', 'INBOX', 'ORDER', 'SHIPPING', 'AR', 'AP', 'PROD INFO', 'BIDDING', 'ONE OFF', 'DONE'];
    defaultSections.forEach(sectionTitle => {
      if (!sections.find(s => s.title === sectionTitle)) {
        sections.push({
          id: sectionTitle.replace(/\s+/g, '-'),  // Keep original case for IDs
          title: sectionTitle,
          label: sectionTitle,
          tasks: []
        });
      }
    });

    // Sort sections in the desired order: FOLLOW UP first, then SCHEDULE CALL, then the 8 main workflow sections, then DONE
    const sectionOrder = ['FOLLOW UP', 'SCHEDULE CALL', 'INBOX', 'ORDER', 'SHIPPING', 'AR', 'AP', 'PROD INFO', 'BIDDING', 'ONE OFF', 'DONE'];
    const orderedSections = sections.sort((a, b) => {
      const aIndex = sectionOrder.indexOf(a.title);
      const bIndex = sectionOrder.indexOf(b.title);
      
      // If section is in our predefined order, use that order
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      // If only one is in predefined order, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      // If neither is in predefined order, sort alphabetically
      return a.title.localeCompare(b.title);
    });

    console.log('Organized sections:', orderedSections.map(s => ({ title: s.title, id: s.id })));
    setTaskSections(orderedSections);
  };



  const handleCreateTask = async (taskData: any) => {
    try {
      await TaskService.createTask(taskData);
      setCreateTaskOpen(false);
      showSnackbar('Task created successfully', 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      showSnackbar('Error creating task', 'error');
    }
  };

  const handleGmailConnect = async () => {
    try {
      const success = await GmailService.signIn();
      if (success) {
        setIsGmailConnected(true);
        const email = GmailService.getUserEmail();
        setUserEmail(email);
        setGmailSetupOpen(false);
        showSnackbar('Gmail connected successfully', 'success');
      }
    } catch (error) {
      console.error('Error connecting Gmail:', error);
      
      // Check if it's a configuration error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('credentials not configured')) {
        showSnackbar('⚙️ Please set up your Google API credentials in .env.local file', 'warning');
      } else if (errorMessage.includes('API library not loaded')) {
        showSnackbar('🌐 Please check your internet connection and try again', 'warning');
      } else {
        showSnackbar('❌ Error connecting Gmail - please check your setup', 'error');
      }
    }
  };

  const handleGmailDisconnect = async () => {
    try {
      await GmailService.signOut();
      setIsGmailConnected(false);
      setUserEmail(null);
      showSnackbar('Gmail disconnected', 'success');
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      showSnackbar('Error disconnecting Gmail', 'error');
    }
  };

  const handleFirebaseLogout = async () => {
    try {
      await logout();
      showSnackbar('Logged out successfully', 'success');
    } catch (error) {
      console.error('Error logging out:', error);
      showSnackbar('Error logging out', 'error');
    }
  };

  const handleSyncGmail = async (selectedLabels?: string[], customSyncDate?: Date) => {
    if (!isGmailConnected) {
      setGmailSetupOpen(true);
      return;
    }

    // If no labels provided, open sync dialog
    if (!selectedLabels) {
      setGmailSyncOpen(true);
      return;
    }

    try {
      setSyncing(true);
      SyncService.updateSyncProgress(true);
      const syncStatus = SyncService.getSyncStatus();
      const activeEmail = await GmailService.getActiveAccountEmail();
      let accountStatus = activeEmail ? SyncService.getAccountSyncStatus(activeEmail) : null;
      if (accountStatus && activeEmail) {
        accountStatus.syncInProgress = true;
        accountStatus.lastSyncTime = new Date();
        SyncService.saveAccountSyncStatus(activeEmail, accountStatus);
      }
      
      let newMessages;
      const syncFromDate = customSyncDate || syncStatus.lastEmailTime;
      
      console.log('Dashboard sync - syncFromDate:', syncFromDate);
      console.log('Dashboard sync - customSyncDate:', customSyncDate);
      console.log('Dashboard sync - selectedLabels:', selectedLabels);
      
      if (syncFromDate) {
        // Incremental sync - only get new messages since specified date
        newMessages = await GmailService.getNewMessagesSince(
          selectedLabels,
          syncFromDate,
          500 // Increased limit for custom date syncs
        );
        console.log('Dashboard sync - newMessages count:', newMessages.length);
        const dateText = customSyncDate 
          ? `custom date (${customSyncDate.toLocaleDateString()})`
          : SyncService.getTimeSinceLastSync();
        showSnackbar(`Checking for new emails since ${dateText}...`, 'info');
      } else {
        // First sync - get recent messages from all selected labels
        const allMessages = [];
        for (const labelId of selectedLabels) {
          const messages = await GmailService.getMessagesByLabel(labelId, 20);
          allMessages.push(...messages);
        }
        newMessages = allMessages
          .filter((msg, index, self) => index === self.findIndex(m => m.id === msg.id))
          .sort((a, b) => parseInt(b.internalDate) - parseInt(a.internalDate))
          .slice(0, 50); // Limit first sync
      }

      let totalImported = 0;
      let skippedExisting = 0;
      let latestEmailTime = syncStatus.lastEmailTime;

      console.log('Dashboard sync - Processing', newMessages.length, 'messages');
      console.log('Dashboard sync - Current tasks with gmailId:', tasks.filter(t => t.gmailId).length);

      for (const message of newMessages) {
        try {
          // Check if task already exists
          const existingTask = tasks.find(t => t.gmailId === message.id);
          if (existingTask) {
            skippedExisting++;
            continue;
          }

          // Find the label name for this message
          const messageLabels = message.labelIds || [];
          const matchingLabel = selectedLabels.find(labelId => messageLabels.includes(labelId));
          const labelName = matchingLabel || 'Gmail';

          const activeEmail = await GmailService.getActiveAccountEmail();
          const taskData = await GmailService.convertMessageToTask(message, labelName, activeEmail || undefined);
          
          // Skip blocked/spam emails
          if (!taskData) {
            console.log(`Skipping blocked/spam email from: ${message.id}`);
            continue;
          }
          
          // Create task from email
          await TaskService.createTaskFromEmail(taskData);

          totalImported++;

          // Track latest email time
          const emailTime = new Date(parseInt(message.internalDate));
          if (!latestEmailTime || emailTime > latestEmailTime) {
            latestEmailTime = emailTime;
          }
        } catch (error) {
          console.error(`Error processing message ${message.id}:`, error);
        }
      }

      // Update sync status
      if (latestEmailTime) {
        SyncService.recordImport(latestEmailTime, totalImported);
        if (accountStatus && activeEmail) {
          accountStatus.lastEmailTime = latestEmailTime;
          accountStatus.totalTasksImported += totalImported;
          accountStatus.syncInProgress = false;
          accountStatus.lastSyncTime = new Date(); // Always update last sync time
          SyncService.saveAccountSyncStatus(activeEmail, accountStatus);
        }
      } else {
        SyncService.updateSyncProgress(false);
        if (accountStatus && activeEmail) {
          accountStatus.syncInProgress = false;
          accountStatus.lastSyncTime = new Date(); // Always update last sync time even if no new messages
          SyncService.saveAccountSyncStatus(activeEmail, accountStatus);
        }
      }

      console.log('Dashboard sync - Final results: imported:', totalImported, 'skipped existing:', skippedExisting);

      if (totalImported > 0) {
        showSnackbar(`✅ Imported ${totalImported} new task${totalImported > 1 ? 's' : ''} from Gmail`, 'success');
      } else {
        const message = skippedExisting > 0 
          ? `✅ Found ${skippedExisting} email${skippedExisting > 1 ? 's' : ''} but they were already imported`
          : '✅ No new emails to import - you\'re up to date!';
        showSnackbar(message, 'info');
      }
    } catch (error) {
      console.error('Error syncing Gmail:', error);
      showSnackbar('❌ Error syncing Gmail - please try again', 'error');
      SyncService.updateSyncProgress(false);
    } finally {
      setSyncing(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Don't render until tasks are loaded and have proper IDs (allow empty task collections)
  if (loading || tasks.some(t => !t.id)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Debug log for task IDs
  console.log('Available tasks:', tasks.map(t => ({ id: t.id, label: t.label, hasId: !!t.id })));
  console.log('Task sections:', taskSections.map(s => ({ id: s.id, title: s.title, taskCount: s.tasks.length })));

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar sx={{ 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Gmail Task Dashboard
          </Typography>
          
          {isGmailConnected && userEmail && (
            <Button
              color="inherit"
              startIcon={<AccountIcon />}
              onClick={() => setAccountManagerOpen(true)}
              sx={{ 
                mr: { xs: 0, sm: 1 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minWidth: { xs: 'auto', sm: 'auto' }
              }}
            >
              {userEmail}
            </Button>
          )}
          
          {isGmailConnected && (
            <Button
              color="inherit"
              startIcon={<BlockIcon />}
              onClick={() => setBlockedEmailsOpen(true)}
              sx={{ 
                mr: { xs: 0, sm: 1 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minWidth: { xs: 'auto', sm: 'auto' }
              }}
            >
              Blocked Emails
            </Button>
          )}
          
          <Button
            color="inherit"
            startIcon={syncing ? <SyncIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <EmailIcon />}
            onClick={isGmailConnected ? () => handleSyncGmail() : () => setGmailSetupOpen(true)}
            sx={{ 
              mr: { xs: 0, sm: 1 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minWidth: { xs: 'auto', sm: 'auto' },
              '@keyframes spin': {
                '0%': {
                  transform: 'rotate(0deg)',
                },
                '100%': {
                  transform: 'rotate(360deg)',
                },
              }
            }}
            disabled={syncing}
          >
            {syncing ? 'Syncing...' : (isGmailConnected ? 'Sync New Tasks' : 'Connect Gmail')}
          </Button>

          {/* Active email to the left of the sync button */}
          {isGmailConnected && userEmail && (
            <Typography variant="body2" sx={{ 
              mr: { xs: 0, sm: 2 }, 
              opacity: 0.9,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}>
              {userEmail}
            </Typography>
          )}
          
          {isGmailConnected && (
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleGmailDisconnect}
              sx={{ 
                mr: { xs: 0, sm: 1 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minWidth: { xs: 'auto', sm: 'auto' }
              }}
            >
              Disconnect
            </Button>
          )}
          
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleFirebaseLogout}
            sx={{ 
              ml: { xs: 0, sm: 'auto' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minWidth: { xs: 'auto', sm: 'auto' }
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ mt: 3, mb: 3, px: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
            {/* Top row with FOLLOW UP and SCHEDULE CALL sections */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 2, sm: 3 },
              flexDirection: { xs: 'column', sm: 'row' } // Stack vertically on mobile
            }}>
              {/* FOLLOW UP section */}
              {(() => {
                const followUpSection = taskSections.find(section => section.title === 'FOLLOW UP');
                // If FOLLOW UP section doesn't exist, create it
                if (!followUpSection) {
                  const defaultFollowUp = {
                    id: 'FOLLOW-UP',  // Must match the ID format used in organizeTasks  // Generate ID using same logic as organizeTasks
                    title: 'FOLLOW UP',
                    label: 'FOLLOW UP',
                    tasks: []
                  };
                  return (
                    <Box key="follow-up" sx={{ 
                      width: { xs: '100%', sm: '50%' },
                      minWidth: 0
                    }}>
                      <TaskSectionComponent
                        section={defaultFollowUp}
                        onTaskUpdate={(taskId: string, updates: Partial<Task>) => TaskService.updateTask(taskId, updates)}
                        onTaskDelete={(taskId: string) => TaskService.deleteTask(taskId)}
                        availableLabels={taskSections.map(s => s.label)}
                      />
                    </Box>
                  );
                }
                return (
                  <Box key={followUpSection.id} sx={{ 
                    width: { xs: '100%', sm: '50%' },
                    minWidth: 0
                  }}>
                    <TaskSectionComponent
                      section={followUpSection}
                      onTaskUpdate={(taskId: string, updates: Partial<Task>) => TaskService.updateTask(taskId, updates)}
                      onTaskDelete={(taskId: string) => TaskService.deleteTask(taskId)}
                      availableLabels={taskSections.map(s => s.label)}
                    />
                  </Box>
                );
              })()}

              {/* SCHEDULE CALL section */}
              {(() => {
                const scheduleCallSection = taskSections.find(section => section.title === 'SCHEDULE CALL');
                // If SCHEDULE CALL section doesn't exist, create it
                if (!scheduleCallSection) {
                  const defaultScheduleCall = {
                    id: 'SCHEDULE-CALL',
                    title: 'SCHEDULE CALL',
                    label: 'SCHEDULE CALL',
                    tasks: []
                  };
                  return (
                    <Box key="schedule-call" sx={{ 
                      width: { xs: '100%', sm: '50%' },
                      minWidth: 0
                    }}>
                      <TaskSectionComponent
                        section={defaultScheduleCall}
                        onTaskUpdate={(taskId: string, updates: Partial<Task>) => TaskService.updateTask(taskId, updates)}
                        onTaskDelete={(taskId: string) => TaskService.deleteTask(taskId)}
                        availableLabels={taskSections.map(s => s.label)}
                      />
                    </Box>
                  );
                }
                return (
                  <Box key={scheduleCallSection.id} sx={{ 
                    width: { xs: '100%', sm: '50%' },
                    minWidth: 0
                  }}>
                    <TaskSectionComponent
                      section={scheduleCallSection}
                      onTaskUpdate={(taskId: string, updates: Partial<Task>) => TaskService.updateTask(taskId, updates)}
                      onTaskDelete={(taskId: string) => TaskService.deleteTask(taskId)}
                      availableLabels={taskSections.map(s => s.label)}
                    />
                  </Box>
                );
              })()}
            </Box>
            
            {/* Main workflow sections - responsive grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',                    // Mobile: 1 column
                  sm: 'repeat(2, 1fr)',         // Small tablet: 2 columns
                  md: 'repeat(4, 1fr)',         // Medium tablet: 4 columns
                  lg: 'repeat(6, 1fr)',         // Large tablet: 6 columns
                  xl: 'repeat(8, 1fr)',         // Desktop: 8 columns
                },
                gap: { xs: 2, sm: 2, md: 2, lg: 2, xl: 2 },
                width: '100%'
              }}
            >
              {/* Render all 8 main workflow sections in order */}
              {['INBOX', 'ORDER', 'SHIPPING', 'AR', 'AP', 'PROD INFO', 'BIDDING', 'ONE OFF'].map((sectionTitle) => {
                const section = taskSections.find(s => s.title === sectionTitle) || {
                  id: sectionTitle.replace(/\s+/g, '-').toLowerCase(),
                  title: sectionTitle,
                  label: sectionTitle,
                  tasks: []
                };
                return (
                  <Box key={section.id} sx={{ width: '100%', minWidth: 0 }}>
                    <TaskSectionComponent
                      section={section}
                      onTaskUpdate={(taskId: string, updates: Partial<Task>) => TaskService.updateTask(taskId, updates)}
                      onTaskDelete={(taskId: string) => TaskService.deleteTask(taskId)}
                      availableLabels={taskSections.map(s => s.label)}
                    />
                  </Box>
                );
              })}
            </Box>
            
            {/* Empty state message when no tasks exist */}
            {tasks.length === 0 && (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8, 
                px: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                mt: 3
              }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No tasks yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Get started by creating your first task or connecting Gmail to import emails
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateTaskOpen(true)}
                  >
                    Create Task
                  </Button>
                  {!isGmailConnected && (
                    <Button
                      variant="outlined"
                      startIcon={<EmailIcon />}
                      onClick={() => setGmailSetupOpen(true)}
                    >
                      Connect Gmail
                    </Button>
                  )}
                </Box>
              </Box>
            )}
            
            {/* We've removed the "other sections" grid as we only want to show our main workflow sections */}
          </Box>
      </Box>

      <Fab
        color="primary"
        aria-label="add task"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setCreateTaskOpen(true)}
      >
        <AddIcon />
      </Fab>

      <CreateTaskDialog
        open={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        onSubmit={handleCreateTask}
        availableLabels={taskSections.map(s => s.label)}
      />

      <GmailSetupDialog
        open={gmailSetupOpen}
        onClose={() => setGmailSetupOpen(false)}
        onConnect={handleGmailConnect}
      />

      <GmailSyncDialog
        open={gmailSyncOpen}
        onClose={() => setGmailSyncOpen(false)}
        onStartSync={handleSyncGmail}
      />

      <AccountManager
        open={accountManagerOpen}
        onClose={() => setAccountManagerOpen(false)}
        currentAccount={userEmail}
        onAccountSwitch={(email) => {
          setUserEmail(email);
          showSnackbar(`Switched to ${email}`, 'success');
        }}
      />

      <BlockedEmailsDialog
        open={blockedEmailsOpen}
        onClose={() => setBlockedEmailsOpen(false)}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;