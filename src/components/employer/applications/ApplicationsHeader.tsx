'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { EMPLOYER_THEME } from '@/constants/colors';

interface ApplicationsHeaderProps {
  applicationsCount: number;
}

/**
 * کامپوننت هدر صفحه لیست درخواست‌های کاریابی
 */
export default function ApplicationsHeader({ applicationsCount }: ApplicationsHeaderProps) {
  // تابع کمکی برای تبدیل اعداد انگلیسی به فارسی
  const toPersianDigits = (value: number | string): string =>
    value.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

  return (
    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ 
        color: EMPLOYER_THEME.primary,
        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.4rem' },
        mb: 1
      }}>
        درخواست‌های کاریابی
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{
        fontSize: { xs: '0.9rem', sm: '1rem' }
      }}>
        {applicationsCount > 0 
          ? `${toPersianDigits(applicationsCount)} درخواست کاریابی دریافت شده`
          : 'مدیریت درخواست‌های کاریابی'
        }
      </Typography>
    </Box>
  );
}