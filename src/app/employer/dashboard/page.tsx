"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import EmployerDashboard from '@/components/employer/dashboard/EmployerDashboard';
import EmployerLayout from '@/components/employer/layout/EmployerLayout';
import { Container, CircularProgress, Box, Alert } from '@mui/material';
import authService from '@/lib/authService';

export default function EmployerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const router = useRouter();

  useEffect(() => {
    const checkUserAccess = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!isAuthenticated) {
          // کاربر وارد نشده است، هدایت به صفحه ورود
          router.push('/login');
          return;
        }
        
        // بررسی اعتبار توکن و دریافت اطلاعات کاربر در صورت نیاز
        await authService.validateAndRefreshTokenIfNeeded();
        
        // بررسی نوع کاربر
        if (user && user.user_type !== 'employer' && user.user_type !== 'EM') {
          // کاربر کارفرما نیست، هدایت به صفحه اصلی
          router.push('/');
          return;
        }
        
        setLoading(false);
      } catch (error) {
        console.error('خطا در بررسی دسترسی کاربر:', error);
        setError('خطا در دسترسی به صفحه داشبورد. لطفاً مجدداً وارد حساب کاربری خود شوید.');
        setLoading(false);
      }
    };
    
    checkUserAccess();
  }, [isAuthenticated, user, router]);
  
  if (loading) {
    return (
      <EmployerLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </EmployerLayout>
    );
  }
  
  if (error) {
    return (
      <EmployerLayout>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </EmployerLayout>
    );
  }
  
  return (
    <EmployerLayout>
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <EmployerDashboard />
      </Container>
    </EmployerLayout>
  );
} 