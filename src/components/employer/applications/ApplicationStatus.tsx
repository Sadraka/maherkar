'use client';

import React from 'react';
import { Paper, Box, Typography, Chip } from '@mui/material';
import { EMPLOYER_THEME } from '@/constants/colors';

interface ApplicationStatusProps {
  status?: string;
  createdAt: string;
}

/**
 * کامپوننت نمایش وضعیت درخواست کاریابی
 */
export default function ApplicationStatus({ status = 'جدید', createdAt }: ApplicationStatusProps) {
  // تعیین رنگ و متن بر اساس وضعیت
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'تایید':
        return {
          label: 'تایید شده',
          bgcolor: '#e8f5e8',
          color: '#2e7d32'
        };
      case 'rejected':
      case 'رد':
        return {
          label: 'رد شده',
          bgcolor: '#ffebee',
          color: '#c62828'
        };
      case 'pending':
      case 'در انتظار':
        return {
          label: 'در انتظار بررسی',
          bgcolor: '#fff3e0',
          color: '#ef6c00'
        };
      default:
        return {
          label: 'درخواست جدید',
          bgcolor: '#e8f5e8',
          color: '#2e7d32'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <Paper elevation={0} sx={{ 
      p: { xs: 3, sm: 4 }, 
      borderRadius: 3,
      boxShadow: '0 3px 10px rgba(66, 133, 244, 0.05)',
      border: '1px solid #e3f2fd'
    }}>
      <Typography variant="h6" fontWeight="bold" sx={{ 
        mb: 3, 
        color: EMPLOYER_THEME.primary,
        fontSize: { xs: '1.1rem', sm: '1.25rem' }
      }}>
        وضعیت درخواست
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Chip 
          label={statusConfig.label}
          sx={{ 
            bgcolor: statusConfig.bgcolor,
            color: statusConfig.color,
            fontWeight: 'bold',
            fontSize: { xs: '0.8rem', sm: '0.9rem' }
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{
          fontSize: { xs: '0.8rem', sm: '0.85rem' }
        }}>
          تاریخ درخواست: {new Date(createdAt).toLocaleDateString('fa-IR')}
        </Typography>
      </Box>
    </Paper>
  );
}