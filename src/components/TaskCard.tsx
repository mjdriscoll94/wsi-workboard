import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Checkbox,
  Menu,
  MenuItem,
  Tooltip,
  Collapse,
  Select,
  FormControl
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Snooze as SnoozeIcon
} from '@mui/icons-material';
import { Task, PRIORITIES } from '../types';
import { format } from 'date-fns';
import { calculateTaskAge, getAgeDisplayText, getAgeTooltip } from '../utils/taskAgeUtils';
import { BlockedEmailService } from '../services/blockedEmailService';

interface TaskCardProps {
  task: Task;
  index: number;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  isCompleted?: boolean;
  availableLabels?: string[];
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onUpdate,
  onDelete,
  isCompleted = false,
  availableLabels = []
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState(task.label);
  const menuOpen = Boolean(anchorEl);

  const priority = PRIORITIES.find(p => p.level === task.priority);
  const priorityColor = priority?.color || '#2196f3';

  // Color-code by account email (left border). Define mapping for the three addresses.
  const accountColorMap: Record<string, string> = {
    'windsor@windsorsalesinc.com': '#1976d2',
    'invoicing@windsorsalesinc.com': '#8e24aa',
    'mackenzie.driscoll@windsorsalesinc.com': '#2e7d32'
  };
  const accountEmail = task.accountEmail || '';
  const accountBorderColor = accountColorMap[accountEmail] || priorityColor;
  
  // Calculate age-based styling
  const ageInfo = calculateTaskAge(task);

  // Update tempLabel when task changes
  useEffect(() => {
    setTempLabel(task.label);
  }, [task.label]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCompletionToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    const isCompleted = event.target.checked;
    
    // If completing the task, move it to Done container
    if (isCompleted) {
      onUpdate(task.id, { completed: isCompleted, label: 'DONE' });
    } else {
      // If uncompleting, just update the completed status
      onUpdate(task.id, { completed: isCompleted });
    }
  };

  const handleMenuPriorityChange = (newPriority: 'low' | 'medium' | 'high' | 'urgent') => {
    onUpdate(task.id, { priority: newPriority });
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    handleMenuClose();
  };

  const handleExpandToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    setExpanded(!expanded);
  };

  const handleInlinePriorityChange = (newPriority: string) => {
    onUpdate(task.id, { priority: newPriority as Task['priority'] });
    setEditingPriority(false);
  };

  const handlePriorityEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingPriority(true);
  };

  const handleLabelEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingLabel(true);
  };

  const handleLabelChange = (newLabel: string) => {
    if (newLabel && newLabel !== task.label) {
      onUpdate(task.id, { label: newLabel });
    }
    setEditingLabel(false);
    setTempLabel(task.label);
  };



  const handleSnooze = (days: number) => {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + days);
    onUpdate(task.id, { snoozeUntil: snoozeDate });
    handleMenuClose();
  };

  const handleClearSnooze = () => {
    onUpdate(task.id, { snoozeUntil: undefined });
    handleMenuClose();
  };

  const handleMarkAsSpam = async () => {
    if (task.source === 'gmail' && task.fromEmail) {
      try {
        // Block the email address
        await BlockedEmailService.blockEmail(task.fromEmail, 'Marked as spam by user');
        
        // Delete the current task
        onDelete(task.id);
        
        // Show success message
        console.log(`Marked ${task.fromEmail} as spam and deleted task`);
      } catch (error) {
        console.error('Error marking email as spam:', error);
      }
    }
    handleMenuClose();
  };



  // Log task info for debugging
  console.log('TaskCard rendering:', { taskId: task.id, index, label: task.label, taskExists: !!task.id });

  return (
    <Card
      sx={{
        mb: 1.5,
        opacity: isCompleted ? 0.7 : 1,
        bgcolor: isCompleted ? '#f5f5f5' : ageInfo.backgroundColor,
        border: `2px solid ${ageInfo.borderColor}`,
        borderLeft: `6px solid ${accountBorderColor}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)'
        }
      }}
    >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <Checkbox
                checked={task.completed}
                onChange={handleCompletionToggle}
                size="small"
                sx={{
                  p: 0,
                  mr: 1,
                  color: priorityColor,
                  '&.Mui-checked': {
                    color: priorityColor
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
              
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    color: task.completed ? '#666' : '#333',
                    wordBreak: 'break-word',
                    userSelect: 'none'
                  }}
                >
                  {task.title}
                </Typography>
                

                
                {/* Only show description for manual tasks, or when expanded */}
                {(task.source !== 'gmail' || expanded) && (
                  <>
                    {/* Show sender info for Gmail tasks when expanded */}
                    {task.source === 'gmail' && task.fromEmail && expanded && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '0.8rem'
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 14, mr: 0.5 }} />
                        From: {task.fromEmail}
                      </Typography>
                    )}
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: expanded ? 'none' : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        userSelect: 'none'
                      }}
                    >
                      {task.description}
                    </Typography>
                  </>
                )}

                              {/* Show expand button for Gmail tasks or long descriptions */}
              {(task.source === 'gmail' || task.description.length > 100) && (
                <IconButton
                  size="small"
                  onClick={handleExpandToggle}
                  sx={{ p: 0, color: 'primary.main' }}
                  title={expanded ? "Collapse" : "Expand to see details"}
                >
                  {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              )}
            </Box>

            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{ ml: 1 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              {/* Inline Priority Editor */}
              {editingPriority ? (
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <Select
                    value={task.priority}
                    onChange={(e) => handleInlinePriorityChange(e.target.value)}
                    onClose={() => setEditingPriority(false)}
                    size="small"
                    open={editingPriority}
                    autoFocus
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      '& .MuiSelect-select': {
                        py: 0.5,
                        px: 1
                      }
                    }}
                  >
                    {PRIORITIES.map((p) => (
                      <MenuItem key={p.level} value={p.level} sx={{ fontSize: '0.7rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              bgcolor: p.color,
                              borderRadius: '50%',
                              mr: 1
                            }}
                          />
                          {p.level.toUpperCase()}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Tooltip title="Click to change priority">
                  <Chip
                    label={task.priority.toUpperCase()}
                    size="small"
                    onClick={handlePriorityEdit}
                    sx={{
                      bgcolor: priorityColor,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: priorityColor,
                        filter: 'brightness(1.1)'
                      }
                    }}
                  />
                </Tooltip>
              )}
              
              {/* Age Indicator */}
              {(ageInfo.shouldShowWarning || ageInfo.isSnoozed) && (
                <Tooltip title={getAgeTooltip(task)}>
                  <Chip
                    label={getAgeDisplayText(task)}
                    size="small"
                    variant="outlined"
                    icon={ageInfo.isSnoozed ? <SnoozeIcon /> : undefined}
                    sx={{
                      bgcolor: ageInfo.isSnoozed ? '#f5f5f5' : 
                               ageInfo.shouldShowUrgent ? '#ffebee' : '#fff3e0',
                      color: ageInfo.isSnoozed ? '#666' : 
                             ageInfo.shouldShowUrgent ? '#d32f2f' : '#e65100',
                      borderColor: ageInfo.borderColor,
                      fontSize: '0.7rem',
                      fontWeight: 500
                    }}
                  />
                </Tooltip>
              )}
              
              {/* Inline Label Editor */}
              {editingLabel ? (
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <Select
                    value={tempLabel}
                    onChange={(e) => handleLabelChange(e.target.value)}
                    onClose={() => setEditingLabel(false)}
                    size="small"
                    open={editingLabel}
                    autoFocus
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      '& .MuiSelect-select': {
                        py: 0.5,
                        px: 1
                      }
                    }}
                  >
                    {availableLabels
                      .filter(label => label !== 'Done') // Remove lowercase "Done"
                      .map((label) => (
                        <MenuItem key={label} value={label} sx={{ fontSize: '0.7rem' }}>
                          {label}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              ) : (
                <Tooltip title="Click to change label">
                  <Chip
                    label={task.label}
                    size="small"
                    variant="outlined"
                    onClick={handleLabelEdit}
                    sx={{ 
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  />
                </Tooltip>
              )}

              {task.source === 'gmail' && (
                <Tooltip title="From Gmail">
                  <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              )}
              
              {/* Delete Button - positioned at bottom right */}
              <Box sx={{ marginLeft: 'auto' }}>
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  sx={{ 
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'error.light',
                      color: 'white'
                    }
                  }}
                  title="Delete task"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                {/* Show email content for Gmail tasks */}
                {task.source === 'gmail' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Email Content:</strong>
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        whiteSpace: 'pre-wrap',
                        maxHeight: 200,
                        overflow: 'auto',
                        p: 1,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        fontSize: '0.8rem'
                      }}
                    >
                      {task.description}
                    </Typography>
                    {task.emailSubject && task.emailSubject !== task.title && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        <strong>Original Subject:</strong> {task.emailSubject}
                      </Typography>
                    )}
                  </Box>
                )}
                
                {/* Show notes for manual tasks */}
                {task.notes && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Notes:</strong> {task.notes}
                  </Typography>
                )}
                
                <Typography variant="caption" color="text.secondary">
                  Created: {format(new Date(task.createdAt), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Box>
            </Collapse>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuItem disabled>
                <Typography variant="subtitle2" color="text.secondary">
                  Change Priority
                </Typography>
              </MenuItem>
              {PRIORITIES.map((priorityOption) => (
                <MenuItem
                  key={priorityOption.level}
                  onClick={() => handleMenuPriorityChange(priorityOption.level)}
                  selected={task.priority === priorityOption.level}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: priorityOption.color,
                        borderRadius: '50%',
                        mr: 1
                      }}
                    />
                    {priorityOption.level.toUpperCase()}
                  </Box>
                </MenuItem>
              ))}
              
              {/* Snooze Options */}
              {(ageInfo.shouldShowWarning || ageInfo.shouldShowUrgent) && (
                <>
                  <MenuItem disabled>
                    <Typography variant="subtitle2" color="text.secondary">
                      Snooze Warning
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={() => handleSnooze(1)}>
                    <SnoozeIcon sx={{ mr: 1, fontSize: 18 }} />
                    Snooze for 1 day
                  </MenuItem>
                  <MenuItem onClick={() => handleSnooze(3)}>
                    <SnoozeIcon sx={{ mr: 1, fontSize: 18 }} />
                    Snooze for 3 days
                  </MenuItem>
                  <MenuItem onClick={() => handleSnooze(7)}>
                    <SnoozeIcon sx={{ mr: 1, fontSize: 18 }} />
                    Snooze for 1 week
                  </MenuItem>
                </>
              )}
              
              {ageInfo.isSnoozed && (
                <MenuItem onClick={handleClearSnooze}>
                  <SnoozeIcon sx={{ mr: 1, fontSize: 18 }} />
                  Clear Snooze
                </MenuItem>
              )}
              
              {/* Mark as Spam (only for Gmail tasks) */}
              {task.source === 'gmail' && task.fromEmail && (
                <MenuItem onClick={handleMarkAsSpam} sx={{ color: 'error.main' }}>
                  <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
                  Mark as Spam
                </MenuItem>
              )}
            </Menu>
          </CardContent>
        </Card>
  );
};

export default TaskCard;