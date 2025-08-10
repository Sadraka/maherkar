'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import AuthRequired from '@/components/auth/AuthRequired';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import EmployerVerificationPending from '@/components/employer/verification/EmployerVerificationPending';

/**
 * صفحه انتظار تایید ادمین
 */
export default function EmployerVerificationPendingPage() {
  return (
    <ThemeRegistry>
      <AuthRequired>
        <Box
          sx={{
            minHeight: '100vh',
            bgcolor: 'grey.50',
            py: 4
          }}
          dir="rtl"
        >
          <Container maxWidth="lg">
            <EmployerVerificationPending />
          </Container>
        </Box>
      </AuthRequired>
    </ThemeRegistry>
  );
}
