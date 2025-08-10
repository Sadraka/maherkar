import React from 'react';
import {
  IconButton,
  Box,
  Tooltip
} from '@mui/material';
import {
  Visibility,
  CheckCircle,
  Cancel,
  Delete
} from '@mui/icons-material';
import { ADMIN_THEME } from '@/constants/colors';

interface ActionButtonsProps {
  onView: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete: () => void;
  status?: string;
  size?: 'small' | 'medium' | 'large';
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onView,
  onApprove,
  onReject,
  onDelete,
  status,
  size = 'small'
}) => {
  return (
    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', alignItems: 'center' }}>
      <Tooltip title="مشاهده جزئیات" arrow placement="top">
        <IconButton
          size={size}
          onClick={onView}
          sx={{
            color: ADMIN_THEME.primary,
            bgcolor: `${ADMIN_THEME.primary}08`,
            '&:hover': {
              bgcolor: `${ADMIN_THEME.primary}15`,
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>
      
      {status === 'R' && onApprove && (
        <Tooltip title="تایید آگهی" arrow placement="top">
          <IconButton
            size={size}
            onClick={onApprove}
            sx={{
              color: '#10B981',
              bgcolor: '#ECFDF5',
              '&:hover': {
                bgcolor: '#D1FAE5',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CheckCircle fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      
      {status === 'A' && onReject && (
        <Tooltip title="رد آگهی" arrow placement="top">
          <IconButton
            size={size}
            onClick={onReject}
            sx={{
              color: '#F59E0B',
              bgcolor: '#FFFBEB',
              '&:hover': {
                bgcolor: '#FEF3C7',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Cancel fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      
      {status === 'P' && onApprove && (
        <Tooltip title="تایید آگهی" arrow placement="top">
          <IconButton
            size={size}
            onClick={onApprove}
            sx={{
              color: '#10B981',
              bgcolor: '#ECFDF5',
              '&:hover': {
                bgcolor: '#D1FAE5',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CheckCircle fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      
      {status === 'P' && onReject && (
        <Tooltip title="رد آگهی" arrow placement="top">
          <IconButton
            size={size}
            onClick={onReject}
            sx={{
              color: '#F59E0B',
              bgcolor: '#FFFBEB',
              '&:hover': {
                bgcolor: '#FEF3C7',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Cancel fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      
      <Tooltip title="حذف آگهی" arrow placement="top">
        <IconButton
          size={size}
          onClick={onDelete}
          sx={{
            color: '#EF4444',
            bgcolor: '#FEF2F2',
            '&:hover': {
              bgcolor: '#FEE2E2',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default React.memo(ActionButtons); 