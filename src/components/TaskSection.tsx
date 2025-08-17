import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Badge
} from '@mui/material';
import { TaskSection as TaskSectionType, Task } from '../types';
import TaskCard from './TaskCard';

interface TaskSectionProps {
  section: TaskSectionType;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  availableLabels?: string[];
}

const TaskSection: React.FC<TaskSectionProps> = ({
  section,
  onTaskUpdate,
  onTaskDelete,
  availableLabels = []
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: ['FOLLOW UP', 'SCHEDULE CALL'].includes(section.title)
          ? '400px' // Double height for top sections
          : 'calc(100vh - 200px)', // Full height for other containers
        width: '100%',
        minWidth: 0,
        bgcolor: '#fafafa',
        border: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#333',
            fontSize: '1.1rem'
          }}
        >
          {section.title}
        </Typography>
        <Badge
          badgeContent={section.tasks.length}
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: '#1976d2',
              color: 'white'
            }
          }}
        />
      </Box>

          <Box
            sx={{
              bgcolor: 'transparent',
              borderRadius: 1,
              p: 1,
              flex: 1,
              overflowY: 'auto', // Always scrollable when content exceeds height
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#666',
                },
              },
            }}
          >
            {/* Empty State Message */}
            {section.tasks.length === 0 && (
                              <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: ['FOLLOW UP', 'SCHEDULE CALL'].includes(section.title) ? 60 : 200,
                    textAlign: 'center',
                    p: 3
                  }}
                >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    opacity: 0.7
                  }}
                >
                  {section.title === 'FOLLOW UP' 
                    ? 'No items to follow up on currently.'
                    : section.title === 'SCHEDULE CALL'
                    ? 'No calls to schedule currently.'
                    : section.title === 'INBOX'
                    ? 'No new emails.'
                    : section.title === 'ORDER'
                    ? 'No orders to process.'
                    : section.title === 'SHIPPING'
                    ? 'No shipping tasks.'
                    : section.title === 'AR'
                    ? 'No accounts receivable items.'
                    : section.title === 'AP'
                    ? 'No accounts payable items.'
                    : section.title === 'PROD INFO'
                    ? 'No product information tasks.'
                    : section.title === 'BIDDING'
                    ? 'No bidding activities.'
                    : section.title === 'ONE OFF'
                    ? 'No one-off tasks.'
                    : `No items in ${section.title}.`
                  }
                </Typography>
              </Box>
            )}

            {/* All Tasks */}
            {section.title === 'FOLLOW UP' || section.title === 'SCHEDULE CALL' ? (
              /* 3-column layout for FOLLOW UP and SCHEDULE CALL */
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 2,
                width: '100%'
              }}>
                {section.tasks.map((task, index) => {
                  console.log(`Rendering task in ${section.title}:`, { taskId: task.id, index, hasId: !!task.id });
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onUpdate={onTaskUpdate}
                      onDelete={onTaskDelete}
                      isCompleted={task.completed}
                      availableLabels={availableLabels}
                    />
                  );
                })}
              </Box>
            ) : (
              /* Single column layout for all other sections */
              section.tasks.map((task, index) => {
                console.log(`Rendering task in ${section.title}:`, { taskId: task.id, index, hasId: !!task.id });
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onUpdate={onTaskUpdate}
                    onDelete={onTaskDelete}
                    isCompleted={task.completed}
                    availableLabels={availableLabels}
                  />
                );
              })
            )}
          </Box>
    </Paper>
  );
};

export default TaskSection;