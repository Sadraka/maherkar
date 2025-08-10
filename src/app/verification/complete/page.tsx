'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import EmployerVerificationForm from '@/components/employer/verification/EmployerVerificationForm';

/**
 * صفحه تکمیل اطلاعات تایید هویت کارفرما
 */
export default function VerificationCompletePage() {
  console.log('VerificationCompletePage rendering...');
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      // حداقل padding در موبایل برای قرارگیری خیلی بالاتر
      px: { xs: 0, sm: 2, md: 3 },
      py: { xs: 0, sm: 2, md: 3 }
    }}>
      <EmployerVerificationForm />
    </Box>
  );
}
