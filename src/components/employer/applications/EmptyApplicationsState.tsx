'use client';

import React from 'react';
import { Paper, Typography, Button } from '@mui/material';
import Link from 'next/link';
import WorkIcon from '@mui/icons-material/Work';
import { EMPLOYER_THEME } from '@/constants/colors';

/**
 * کامپوننت نمایش حالت خالی بودن درخواست‌های کاریابی
 */
export default function EmptyApplicationsState() {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 8, 
        textAlign: 'center',
        borderRadius: 3,
        boxShadow: '0 3px 10px rgba(66, 133, 244, 0.05)',
        border: '1px solid #e3f2fd'
      }}
    >
      <WorkIcon sx={{ fontSize: '4rem', color: '#e0e0e0', mb: 2 }} />
      <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
        هنوز درخواست کاریابی دریافت نکرده‌اید
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        برای دریافت درخواست‌های کاریابی، ابتدا آگهی شغلی ثبت کنید
      </Typography>
      <Button
        variant="contained"
        sx={{ 
          bgcolor: EMPLOYER_THEME.primary,
          '&:hover': { bgcolor: EMPLOYER_THEME.dark }
        }}
        component={Link}
        href="/employer/jobs/create"
      >
        ثبت آگهی جدید
      </Button>
    </Paper>
  );
}