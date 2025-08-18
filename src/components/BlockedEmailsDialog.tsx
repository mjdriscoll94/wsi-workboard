import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Alert,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { BlockedEmail } from '../types';
import { BlockedEmailService } from '../services/blockedEmailService';
import { useAuth } from '../contexts/AuthContext';

interface BlockedEmailsDialogProps {
  open: boolean;
  onClose: () => void;
}

const BlockedEmailsDialog: React.FC<BlockedEmailsDialogProps> = ({ open, onClose }) => {
  const [blockedEmails, setBlockedEmails] = useState<BlockedEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newReason, setNewReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (open) {
      loadBlockedEmails();
    }
  }, [open]);

  const loadBlockedEmails = async () => {
    try {
      setLoading(true);
      const emails = await BlockedEmailService.getBlockedEmails();
      setBlockedEmails(emails);
    } catch (error) {
      console.error('Error loading blocked emails:', error);
      setError('Failed to load blocked emails');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlockedEmail = async () => {
    if (!newEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      await BlockedEmailService.blockEmail(
        newEmail.trim(),
        newReason.trim() || 'Manually blocked',
        currentUser?.uid || 'unknown'
      );
      
      setSuccess(`Blocked ${newEmail.trim()}`);
      setNewEmail('');
      setNewReason('');
      setError('');
      
      // Reload the list
      await loadBlockedEmails();
    } catch (error) {
      console.error('Error blocking email:', error);
      setError('Failed to block email address');
    }
  };

  const handleRemoveBlockedEmail = async (emailAddress: string) => {
    try {
      await BlockedEmailService.unblockEmail(emailAddress);
      setSuccess(`Unblocked ${emailAddress}`);
      setError('');
      
      // Reload the list
      await loadBlockedEmails();
    } catch (error) {
      console.error('Error unblocking email:', error);
      setError('Failed to unblock email address');
    }
  };

  const handleClose = () => {
    setNewEmail('');
    setNewReason('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BlockIcon sx={{ color: 'error.main' }} />
          <Typography variant="h6">Blocked Email Addresses</Typography>
        </Box>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Add new blocked email */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Block New Email Address
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <TextField
              label="Email Address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="spam@example.com"
              size="small"
              sx={{ minWidth: 250 }}
            />
            <TextField
              label="Reason (optional)"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Spam, unwanted, etc."
              size="small"
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddBlockedEmail}
              disabled={!newEmail.trim()}
            >
              Block Email
            </Button>
          </Box>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Blocked emails list */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Currently Blocked ({blockedEmails.length})
          </Typography>
          
          {loading ? (
            <Typography variant="body2" color="text.secondary">
              Loading blocked emails...
            </Typography>
          ) : blockedEmails.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No email addresses are currently blocked.
            </Typography>
          ) : (
            <List>
              {blockedEmails.map((blockedEmail, index) => (
                <React.Fragment key={blockedEmail.id}>
                  <ListItem>
                    <ListItemText
                      primary={blockedEmail.emailAddress}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Reason:</strong> {blockedEmail.reason || 'No reason provided'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Blocked on {blockedEmail.blockedAt.toLocaleDateString()} at {blockedEmail.blockedAt.toLocaleTimeString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveBlockedEmail(blockedEmail.emailAddress)}
                        color="primary"
                        title="Unblock this email address"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < blockedEmails.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Info about blocked emails */}
        <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
          <Typography variant="body2" color="info.main">
            <strong>How it works:</strong> When you mark an email as spam, the sender's email address is added to this blocked list. 
            Future emails from blocked addresses will be automatically filtered out during Gmail sync and won't create new tasks.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlockedEmailsDialog; 