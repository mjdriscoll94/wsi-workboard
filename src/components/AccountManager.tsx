import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AccountCircle as AccountIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { GmailService } from '../services/gmailService';

interface AccountManagerProps {
  open: boolean;
  onClose: () => void;
  currentAccount: string | null;
  onAccountSwitch: (email: string) => void;
}

const AccountManager: React.FC<AccountManagerProps> = ({
  open,
  onClose,
  currentAccount,
  onAccountSwitch
}) => {
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadConnectedAccounts();
    }
  }, [open]);

  const loadConnectedAccounts = () => {
    const accounts = GmailService.getConnectedAccounts();
    setConnectedAccounts(accounts);
  };

  const handleAddAccount = async () => {
    setLoading(true);
    try {
      const newAccount = await GmailService.addAccount();
      if (newAccount) {
        setConnectedAccounts(prev => [...prev, newAccount]);
      }
    } catch (error) {
      console.error('Error adding account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async (email: string) => {
    try {
      const success = await GmailService.switchAccount(email);
      if (success) {
        onAccountSwitch(email);
        onClose();
      }
    } catch (error) {
      console.error('Error switching account:', error);
    }
  };

  const handleRemoveAccount = async (email: string) => {
    // In a real implementation, you'd want to revoke tokens
    setConnectedAccounts(prev => prev.filter(account => account !== email));
    if (currentAccount === email) {
      const remaining = connectedAccounts.filter(account => account !== email);
      if (remaining.length > 0) {
        onAccountSwitch(remaining[0]);
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccountIcon sx={{ mr: 1 }} />
          Manage Gmail Accounts
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You can connect multiple Gmail accounts and switch between them.
        </Typography>

        {connectedAccounts.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No Gmail accounts connected. Click "Add Account" to get started.
          </Alert>
        ) : (
          <List>
            {connectedAccounts.map((email) => (
              <ListItem
                key={email}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  mb: 1,
                  bgcolor: currentAccount === email ? '#e3f2fd' : 'transparent'
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {email}
                      {currentAccount === email && (
                        <Chip 
                          label="Active" 
                          size="small" 
                          color="primary"
                          icon={<CheckCircleIcon />}
                        />
                      )}
                    </Box>
                  }
                  secondary={`Gmail account ${currentAccount === email ? '(currently active)' : ''}`}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {currentAccount !== email && (
                      <Button
                        size="small"
                        onClick={() => handleSwitchAccount(email)}
                        variant="outlined"
                      >
                        Switch
                      </Button>
                    )}
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveAccount(email)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddAccount}
            disabled={loading}
            fullWidth
          >
            {loading ? 'Adding Account...' : 'Add Another Gmail Account'}
          </Button>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Each Gmail account requires separate authorization. 
            Google will ask you to sign in and grant permissions for each account.
          </Typography>
        </Alert>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountManager;