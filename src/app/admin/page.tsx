'use client';

import { useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const { user, isAuthenticated, loading, fetchUserData } = useAuthStore();
  
  // دریافت اطلاعات کاربر در صورت نیاز
  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchUserData();
    }
  }, [isAuthenticated, user, fetchUserData]);
  
  // نمایش loading در حین بارگذاری
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  // اگر کاربر لاگین نکرده، صفحه 404 نمایش دهیم
  if (!isAuthenticated) {
    notFound();
    return null;
  }
  
  // اگر اطلاعات کاربر هنوز بارگذاری نشده، loading نمایش دهیم
  if (!user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  // بررسی نوع کاربر
  const isAdmin = user.user_type === 'AD';
  
  // اگر کاربر ادمین نیست، صفحه 404 نمایش دهیم
  if (!isAdmin) {
    notFound();
    return null;
  }
  
  // اگر کاربر ادمین است، داشبورد را نمایش دهیم
  return <AdminDashboard />;
}