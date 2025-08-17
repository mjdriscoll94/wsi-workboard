import React from 'react';
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
  ListItemIcon,
  ListItemText,
  Alert,
  Paper
} from '@mui/material';
import {
  Email as EmailIcon,
  Security as SecurityIcon,
  Sync as SyncIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { SyncService } from '../services/syncService';

interface GmailSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onConnect: () => void;
}

const GmailSetupDialog: React.FC<GmailSetupDialogProps> = ({
  open,
  onClose,
  onConnect
}) => {
  const features = [
    {
      icon: <EmailIcon color="primary" />,
      title: 'Import Emails as Tasks',
      description: 'Automatically convert emails from specific Gmail labels into manageable tasks'
    },
    {
      icon: <SyncIcon color="primary" />,
      title: 'Real-time Sync',
      description: 'Keep your tasks up to date with the latest emails from your Gmail account'
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: 'Secure Connection',
      description: 'OAuth2 authentication ensures your Gmail data remains secure and private'
    }
  ];

  const setupSteps = [
    'Click "Connect Gmail" to start the authorization process',
    'Sign in to your Google account when prompted',
    'Grant permission to read your Gmail messages and labels',
    'Select which labels you want to sync as task sections',
    'Start importing emails as tasks automatically'
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div">
            Connect Gmail Account
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Transform your emails into actionable tasks
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              This integration will read your Gmail messages and labels to create tasks. 
              You can control which labels to sync and manage your privacy settings at any time.
            </Typography>
          </Alert>

          <Typography variant="h6" gutterBottom>
            What you can do:
          </Typography>
          
          <List>
            {features.map((feature, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemIcon>
                  {feature.icon}
                </ListItemIcon>
                <ListItemText
                  primary={feature.title}
                  secondary={feature.description}
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            Setup Process:
          </Typography>
          
          <List dense>
            {setupSteps.map((step, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {index + 1}.
                  </Typography>
                </ListItemIcon>
                <ListItemText
                  primary={step}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Per-account last sync display */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Last Sync Per Account
          </Typography>
          {[
            'windsor@windsorsalesinc.com',
            'invoicing@windsorsalesinc.com',
            'mackenzie.driscoll@windsorsalesinc.com'
          ].map(email => (
              <Box key={email} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                <Typography variant="body2">{email}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {SyncService.getTimeSinceLastAccountSync(email)}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Setup Required:</strong> To use Gmail integration, you need to:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ mt: 1, mb: 0 }}>
              <li>Set up Google Cloud Console project</li>
              <li>Enable Gmail API</li>
              <li>Create API key and OAuth client ID</li>
              <li>Add credentials to your .env.local file</li>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              See <strong>GOOGLE_API_SETUP.md</strong> for detailed instructions.
            </Typography>
          </Alert>
          
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Privacy Notice:</strong> This application only reads your email metadata 
              (subject, sender, labels) and email content to create tasks. No emails are stored 
              or transmitted to external servers beyond Firebase for task management.
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Maybe Later
        </Button>
        <Button 
          onClick={onConnect}
          variant="contained"
          startIcon={<EmailIcon />}
          size="large"
        >
          Connect Gmail
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GmailSetupDialog;