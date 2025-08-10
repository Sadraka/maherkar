import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import {
  Warning,
  Delete,
  Edit,
  Close
} from '@mui/icons-material';
import { ADMIN_THEME } from '@/constants/colors';

interface WarningModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: {
    id: string;
    full_name: string;
    user_type: string;
    profile_picture?: string;
  } | null;
  action: 'delete' | 'edit';
  currentUserId: string;
}

const WarningModal: React.FC<WarningModalProps> = ({
  open,
  onClose,
  onConfirm,
  user,
  action,
  currentUserId
}) => {
  if (!user) return null;

  const isSelfAction = user.id === currentUserId || user.full_name === currentUserId;
  const isAdmin = user.user_type === 'AD';

  const getWarningContent = () => {
    if (isSelfAction) {
      return {
        title: action === 'delete' ? 'حذف حساب کاربری' : 'ویرایش حساب کاربری',
        message: action === 'delete' 
          ? 'شما نمی‌توانید حساب کاربری خودتان را حذف کنید.'
          : 'شما نمی‌توانید نوع کاربر یا وضعیت حساب خودتان را تغییر دهید.',
        icon: <Warning sx={{ fontSize: 40, color: '#F59E0B' }} />,
        confirmText: 'متوجه شدم',
        confirmColor: 'primary' as const
      };
    }

    // شخصی‌سازی بر اساس نوع
    if (user.user_type === 'IN' && action === 'delete') {
      return {
        title: 'حذف گروه کاری',
        message: `آیا مطمئن هستید که می‌خواهید گروه کاری "${user.full_name}" را حذف کنید؟`,
        icon: <Delete sx={{ fontSize: 40, color: '#EF4444' }} />,
        confirmText: 'بله، حذف کن',
        confirmColor: 'error' as const
      };
    }

    if (user.user_type === 'CA' && action === 'delete') {
      return {
        title: 'حذف دسته‌بندی',
        message: `آیا مطمئن هستید که می‌خواهید دسته‌بندی "${user.full_name}" را حذف کنید؟`,
        icon: <Delete sx={{ fontSize: 40, color: '#EF4444' }} />,
        confirmText: 'بله، حذف کن',
        confirmColor: 'error' as const
      };
    }

    if (user.user_type === 'EM' && action === 'delete') {
      return {
        title: 'حذف شرکت',
        message: `آیا مطمئن هستید که می‌خواهید شرکت "${user.full_name}" را حذف کنید؟`,
        icon: <Delete sx={{ fontSize: 40, color: '#EF4444' }} />,
        confirmText: 'بله، حذف کن',
        confirmColor: 'error' as const
      };
    }

    if (user.user_type === 'JOB' && action === 'delete') {
      return {
        title: 'حذف آگهی شغلی',
        message: `آیا مطمئن هستید که می‌خواهید آگهی "${user.full_name}" را حذف کنید؟`,
        icon: <Delete sx={{ fontSize: 40, color: '#EF4444' }} />,
        confirmText: 'بله، حذف کن',
        confirmColor: 'error' as const
      };
    }

    if (isAdmin && action === 'delete') {
      return {
        title: 'حذف کاربر مدیریت',
        message: `آیا مطمئن هستید که می‌خواهید کاربر "${user.full_name}" را حذف کنید؟`,
        icon: <Delete sx={{ fontSize: 40, color: '#EF4444' }} />,
        confirmText: 'بله، حذف کن',
        confirmColor: 'error' as const
      };
    }

    if (action === 'delete') {
      return {
        title: 'حذف کاربر',
        message: `آیا مطمئن هستید که می‌خواهید کاربر "${user.full_name}" را حذف کنید？`,
        icon: <Delete sx={{ fontSize: 40, color: '#EF4444' }} />,
        confirmText: 'بله، حذف کن',
        confirmColor: 'error' as const
      };
    }

    return {
      title: 'ویرایش موفق',
      message: `اطلاعات کاربر "${user.full_name}" با موفقیت به‌روزرسانی شد.`,
      icon: <Edit sx={{ fontSize: 40, color: '#10B981' }} />,
      confirmText: 'باشه',
      confirmColor: 'primary' as const
    };
  };

  const warningContent = getWarningContent();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'white',
          border: `1px solid ${ADMIN_THEME.bgLight}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle sx={{
        bgcolor: ADMIN_THEME.bgLight,
        borderBottom: `1px solid ${ADMIN_THEME.bgLight}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: ADMIN_THEME.primary }}>
          {warningContent.title}
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: ADMIN_THEME.primary,
            '&:hover': { bgcolor: ADMIN_THEME.bgVeryLight }
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          {/* Icon */}
          <Box sx={{ mb: 3 }}>
            {warningContent.icon}
          </Box>

          {/* Message */}
          <Typography variant="body1" sx={{
            color: ADMIN_THEME.dark,
            lineHeight: 1.6,
            mb: 2
          }}>
            {warningContent.message}
          </Typography>

          {/* User Name */}
          <Typography variant="h6" sx={{
            color: ADMIN_THEME.primary,
            fontWeight: 600,
            mb: 2
          }}>
            {user.full_name}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{
        bgcolor: ADMIN_THEME.bgLight,
        borderTop: `1px solid ${ADMIN_THEME.bgLight}`,
        p: 2,
        gap: 1
      }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: ADMIN_THEME.primary,
            color: ADMIN_THEME.primary,
            '&:hover': {
              borderColor: ADMIN_THEME.dark,
              bgcolor: ADMIN_THEME.bgLight
            }
          }}
        >
          انصراف
        </Button>
        
        {!isSelfAction && (
          <Button
            onClick={onConfirm}
            variant="contained"
            color={warningContent.confirmColor}
            sx={{
              bgcolor: warningContent.confirmColor === 'error' ? '#EF4444' : ADMIN_THEME.primary,
              '&:hover': {
                bgcolor: warningContent.confirmColor === 'error' ? '#DC2626' : ADMIN_THEME.dark
              }
            }}
          >
            {warningContent.confirmText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WarningModal; 