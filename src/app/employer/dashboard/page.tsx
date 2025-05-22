"use client";

import React, { useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import EmployerDashboard from '@/components/employer/dashboard/EmployerDashboard';
import EmployerAuthRequired from '@/components/auth/EmployerAuthRequired';
import { useAuth } from '@/store/authStore';
import authService from '@/lib/authService';

export default function EmployerDashboardPage() {
  const { isAuthenticated, user } = useAuth();

  // اجرای تمدید توکن در لود صفحه اگر لازم باشد
  useEffect(() => {
    if (isAuthenticated) {
      const checkAndRefreshToken = async () => {
        try {
          await authService.validateAndRefreshTokenIfNeeded();
        } catch (error) {
          console.error('خطا در بررسی یا تمدید توکن:', error);
        }
      };
      
      checkAndRefreshToken();
    }
  }, [isAuthenticated]);

  return (
    <EmployerAuthRequired>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <EmployerDashboard />
      </Container>
    </EmployerAuthRequired>
  );
} 