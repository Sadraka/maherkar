'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import AuthRequired from '@/components/auth/AuthRequired';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import EmployerVerificationRejected from '@/components/employer/verification/EmployerVerificationRejected';

/**
 * صفحه رد تایید کارفرما
 */
export default function EmployerVerificationRejectedPage() {
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
            <EmployerVerificationRejected />
          </Container>
        </Box>
      </AuthRequired>
    </ThemeRegistry>
  );
}
