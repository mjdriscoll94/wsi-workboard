import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  Chip,
  Divider,
  LinearProgress,
  TextField,
  Switch
} from '@mui/material';
import {
  Sync as SyncIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { GmailService, GmailLabel } from '../services/gmailService';
import { SyncService } from '../services/syncService';

interface GmailSyncDialogProps {
  open: boolean;
  onClose: () => void;
  onStartSync: (selectedLabels: string[], customSyncDate?: Date) => void;
}

const GmailSyncDialog: React.FC<GmailSyncDialogProps> = ({
  open,
  onClose,
  onStartSync
}) => {
  const [availableLabels, setAvailableLabels] = useState<GmailLabel[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [accountSyncStatus, setAccountSyncStatus] = useState(SyncService.getSyncStatus());
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customSyncDate, setCustomSyncDate] = useState(() => {
    // Default to 7 days ago for testing
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return sevenDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD format
  });

  useEffect(() => {
    const init = async () => {
      if (open) {
        await loadLabels();
        // Always fetch live active account email from Gmail profile to avoid stale cache
        const email = await GmailService.getActiveAccountEmail();
        setActiveEmail(email);
        if (email) {
          setAccountSyncStatus(SyncService.getAccountSyncStatus(email));
        } else {
          setAccountSyncStatus(SyncService.getSyncStatus());
        }
      }
    };
    init();
  }, [open]);

  const loadLabels = async () => {
    try {
      setLoading(true);
      const labels = await GmailService.getLabels();
      
      // Filter to show user-created labels and important system labels
      const filteredLabels = labels.filter(label => 
        label.type === 'user' || 
        ['INBOX', 'IMPORTANT', 'STARRED', 'UNREAD'].includes(label.id)
      );
      
      setAvailableLabels(filteredLabels);
      
      // Load previously selected labels or use defaults
      const currentStatus = SyncService.getSyncStatus();
      setSelectedLabels(currentStatus.selectedLabels);
    } catch (error) {
      console.error('Error loading Gmail labels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLabelToggle = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleStartSync = () => {
    // Save selected labels
    SyncService.updateSelectedLabels(selectedLabels);
    
    // Prepare custom sync date if enabled
    const syncDate = useCustomDate ? new Date(customSyncDate) : undefined;
    
    console.log('GmailSyncDialog - useCustomDate:', useCustomDate);
    console.log('GmailSyncDialog - customSyncDate string:', customSyncDate);
    console.log('GmailSyncDialog - syncDate object:', syncDate);
    
    // If using custom date, update the sync service to override the last sync time
    if (useCustomDate && syncDate) {
      SyncService.setCustomSyncFromDate(syncDate);
    }
    
    // Start sync with selected labels and optional custom date
    onStartSync(selectedLabels, syncDate);
    onClose();
  };

  const getMessageCount = (label: GmailLabel) => {
    if (label.messagesTotal > 0) {
      return `${label.messagesTotal} total, ${label.messagesUnread} unread`;
    }
    return 'No messages';
  };

  const isSystemLabel = (labelId: string) => {
    return ['INBOX', 'IMPORTANT', 'STARRED', 'UNREAD'].includes(labelId);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SyncIcon sx={{ mr: 1, color: 'primary.main' }} />
          Sync New Tasks from Gmail
        </Box>
        <Typography variant="body2" color="text.secondary">
          Import emails as tasks from selected Gmail labels
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {/* Sync Status */}
        <Box sx={{ mb: 3 }}>
          <Alert 
            severity={accountSyncStatus.lastSyncTime ? "info" : "warning"}
            icon={<ScheduleIcon />}
          >
            <Typography variant="body2">
              <strong>Active account:</strong> {activeEmail || 'Unknown'} • <strong>Last sync:</strong> {activeEmail ? SyncService.getTimeSinceLastAccountSync(activeEmail) : 'Never'}
              {accountSyncStatus.totalTasksImported > 0 && (
                <span> • {accountSyncStatus.totalTasksImported} tasks imported total</span>
              )}
            </Typography>
          </Alert>
        </Box>

        {/* Custom Sync Date */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={useCustomDate}
                onChange={(e) => setUseCustomDate(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1">Use custom sync date (for testing)</Typography>
                <Typography variant="body2" color="text.secondary">
                  Override the last sync date to import emails from a specific date
                </Typography>
              </Box>
            }
          />
          
          {useCustomDate && (
            <Box sx={{ mt: 2, ml: 2 }}>
              <TextField
                type="date"
                label="Sync from date"
                value={customSyncDate}
                onChange={(e) => setCustomSyncDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                helperText="Only emails newer than this date will be imported"
                size="small"
                sx={{ minWidth: 200 }}
              />
            </Box>
          )}
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Label Selection */}
        <FormControl component="fieldset" variant="standard" fullWidth>
          <FormLabel component="legend" sx={{ mb: 2 }}>
            <Typography variant="h6">Select Labels to Sync</Typography>
            <Typography variant="body2" color="text.secondary">
              Choose which Gmail labels to monitor for new emails
            </Typography>
          </FormLabel>

          {loading ? (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Loading Gmail labels...
              </Typography>
            </Box>
          ) : (
            <FormGroup>
              {/* System Labels */}
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
                Gmail System Labels
              </Typography>
              {availableLabels
                .filter(label => isSystemLabel(label.id))
                .map((label) => (
                  <FormControlLabel
                    key={label.id}
                    control={
                      <Checkbox
                        checked={selectedLabels.includes(label.id)}
                        onChange={() => handleLabelToggle(label.id)}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1">{label.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getMessageCount(label)}
                          </Typography>
                        </Box>
                        <Chip 
                          label="System" 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      </Box>
                    }
                  />
                ))}

              {/* Custom Labels */}
              {availableLabels.some(label => !isSystemLabel(label.id)) && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'secondary.main' }}>
                    Your Custom Labels
                  </Typography>
                  {availableLabels
                    .filter(label => !isSystemLabel(label.id))
                    .map((label) => (
                      <FormControlLabel
                        key={label.id}
                        control={
                          <Checkbox
                            checked={selectedLabels.includes(label.id)}
                            onChange={() => handleLabelToggle(label.id)}
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1">{label.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {getMessageCount(label)}
                              </Typography>
                            </Box>
                            <Chip 
                              label="Custom" 
                              size="small" 
                              variant="outlined"
                              color="secondary"
                            />
                          </Box>
                        }
                      />
                    ))}
                </>
              )}
            </FormGroup>
          )}
        </FormControl>

        {/* Sync Info */}
        <Box sx={{ mt: 3 }}>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Smart Sync:</strong> Only emails newer than your last sync will be imported.
              {accountSyncStatus.lastEmailTime && (
                <span> Looking for emails after {new Date(accountSyncStatus.lastEmailTime).toLocaleDateString()}.</span>
              )}
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleStartSync}
          variant="contained"
          startIcon={<EmailIcon />}
          disabled={selectedLabels.length === 0 || loading}
        >
          Sync {selectedLabels.length > 0 ? `${selectedLabels.length} Label${selectedLabels.length > 1 ? 's' : ''}` : 'Labels'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GmailSyncDialog;