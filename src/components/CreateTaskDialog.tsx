import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Autocomplete,
  Chip
} from '@mui/material';
import { CreateTaskDialogData, PRIORITIES, CATEGORIES } from '../types';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: CreateTaskDialogData) => void;
  availableLabels: string[];
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({
  open,
  onClose,
  onSubmit,
  availableLabels
}) => {
  const [formData, setFormData] = useState<CreateTaskDialogData>({
    title: '',
    description: '',
    priority: 'medium',
    label: '',
    category: 'UNASSIGNED',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<CreateTaskDialogData>>({});

  const handleInputChange = (field: keyof CreateTaskDialogData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handlePriorityChange = (event: any) => {
    setFormData(prev => ({
      ...prev,
      priority: event.target.value as 'low' | 'medium' | 'high' | 'urgent'
    }));
  };

  const handleCategoryChange = (event: any) => {
    setFormData(prev => ({
      ...prev,
      category: event.target.value as 'WINDSOR' | 'CUSTOMER' | 'VENDOR' | 'SHIPPER' | 'UNASSIGNED'
    }));
  };

  const handleLabelChange = (event: any, newValue: string | null) => {
    setFormData(prev => ({
      ...prev,
      label: newValue || ''
    }));
    
    if (errors.label) {
      setErrors(prev => ({
        ...prev,
        label: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateTaskDialogData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        label: formData.label.trim(),
        notes: formData.notes.trim()
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      label: '',
      category: 'UNASSIGNED',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  const selectedPriority = PRIORITIES.find(p => p.level === formData.priority);

  // Category color mapping
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'WINDSOR': return '#f44336'; // Red
      case 'CUSTOMER': return '#2196f3'; // Blue
      case 'VENDOR': return '#ff9800'; // Orange
      case 'SHIPPER': return '#795548'; // Brown
      case 'UNASSIGNED': return '#9e9e9e'; // Grey
      default: return '#9e9e9e';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div">
          Create New Task
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the details for your new task
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={handleInputChange('title')}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            required
            autoFocus
            placeholder="Enter task title..."
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={handleInputChange('description')}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            required
            multiline
            rows={3}
            placeholder="Describe what needs to be done..."
          />

          <FormControl fullWidth required>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              onChange={handlePriorityChange}
              label="Priority"
            >
              {PRIORITIES.map((priority) => (
                <MenuItem key={priority.level} value={priority.level}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: priority.color,
                        borderRadius: '50%',
                        mr: 1
                      }}
                    />
                    <span style={{ textTransform: 'uppercase' }}>
                      {priority.level.charAt(0)}
                    </span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={handleCategoryChange}
              label="Category"
            >
              {CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: getCategoryColor(category),
                        borderRadius: '50%',
                        mr: 1
                      }}
                    />
                    <span style={{ textTransform: 'capitalize' }}>
                      {category.toLowerCase()}
                    </span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            value={formData.label}
            onChange={handleLabelChange}
            options={availableLabels}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label="Label/Section"
                error={!!errors.label}
                helperText={errors.label || 'Select existing or create new label'}
                required
                placeholder="e.g., INBOX, ORDER, SHIPPING, AR, AP..."
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  size="small"
                  {...getTagProps({ index })}
                  key={index}
                />
              ))
            }
          />

          <TextField
            label="Notes (Optional)"
            value={formData.notes}
            onChange={handleInputChange('notes')}
            fullWidth
            multiline
            rows={2}
            placeholder="Additional notes or details..."
          />

          {selectedPriority && (
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Preview:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={formData.priority.charAt(0).toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: selectedPriority.color,
                    color: 'white',
                    fontWeight: 600
                  }}
                />
                <Chip
                  label={formData.category}
                  size="small"
                  sx={{ 
                    bgcolor: getCategoryColor(formData.category),
                    color: 'white',
                    fontWeight: 600,
                    border: 'none'
                  }}
                />
                {formData.label && (
                  <Chip
                    label={formData.label}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              {formData.title && (
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                  {formData.title}
                </Typography>
              )}
              {formData.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {formData.description.substring(0, 100)}
                  {formData.description.length > 100 && '...'}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={handleClose}
          color="inherit"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.title.trim() || !formData.description.trim() || !formData.label.trim()}
        >
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskDialog;