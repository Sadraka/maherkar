'use client';

import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { apiPut } from '@/lib/axios';

interface ApplicationActionsProps {
  applicationId: string | number;
  onStatusUpdate?: (newStatus: string) => void;
}

/**
 * کامپوننت دکمه‌های عملیات درخواست کاریابی (تایید/رد)
 */
export default function ApplicationActions({ applicationId, onStatusUpdate }: ApplicationActionsProps) {
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | null;
    title: string;
    message: string;
  }>({
    open: false,
    action: null,
    title: '',
    message: ''
  });

  const handleActionClick = (action: 'approve' | 'reject') => {
    const config = action === 'approve' 
      ? {
          title: 'تایید درخواست',
          message: 'آیا از تایید این درخواست اطمینان دارید؟'
        }
      : {
          title: 'رد درخواست',
          message: 'آیا از رد این درخواست اطمینان دارید؟'
        };

    setConfirmDialog({
      open: true,
      action,
      ...config
    });
  };

  const handleConfirm = async () => {
    if (!confirmDialog.action) return;

    try {
      setLoading(true);
      const status = confirmDialog.action === 'approve' ? 'approved' : 'rejected';
      
      // در اینجا باید API call برای به‌روزرسانی وضعیت انجام شود
      // await apiPut(`/ads/applications/${applicationId}/`, { status });
      
      onStatusUpdate?.(status);
      
      setConfirmDialog({
        open: false,
        action: null,
        title: '',
        message: ''
      });
    } catch (error) {
      console.error('خطا در به‌روزرسانی وضعیت:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmDialog({
      open: false,
      action: null,
      title: '',
      message: ''
    });
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          variant="contained"
          disabled={loading}
          onClick={() => handleActionClick('approve')}
          sx={{
            bgcolor: '#4caf50',
            '&:hover': { bgcolor: '#45a049' },
            '&:disabled': { bgcolor: '#cccccc' },
            flex: 1,
            py: { xs: 1.2, sm: 1.5 },
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          تأیید درخواست
        </Button>
        <Button
          variant="outlined"
          disabled={loading}
          onClick={() => handleActionClick('reject')}
          sx={{
            color: '#f44336',
            borderColor: '#f44336',
            '&:hover': { 
              bgcolor: 'rgba(244, 67, 54, 0.05)',
              borderColor: '#d32f2f'
            },
            '&:disabled': { 
              color: '#cccccc',
              borderColor: '#cccccc'
            },
            flex: 1,
            py: { xs: 1.2, sm: 1.5 },
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          رد درخواست
        </Button>
      </Box>

      {/* دیالوگ تایید */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancel}
        dir="rtl"
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: { xs: '90%', sm: '400px' }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold',
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ 
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}>
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleCancel}
            sx={{ 
              color: '#666',
              fontSize: { xs: '0.85rem', sm: '0.9rem' }
            }}
          >
            انصراف
          </Button>
          <Button 
            onClick={handleConfirm}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: confirmDialog.action === 'approve' ? '#4caf50' : '#f44336',
              '&:hover': { 
                bgcolor: confirmDialog.action === 'approve' ? '#45a049' : '#d32f2f'
              },
              fontSize: { xs: '0.85rem', sm: '0.9rem' }
            }}
          >
            {loading ? 'در حال پردازش...' : 'تایید'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}