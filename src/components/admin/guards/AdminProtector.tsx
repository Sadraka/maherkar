'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/store/authStore';

interface AdminProtectorProps {
  children: React.ReactNode;
}

const AdminProtector: React.FC<AdminProtectorProps> = ({ children }) => {
  const { user, isAuthenticated, loading, fetchUserData } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // بررسی دسترسی در سطح کامپوننت
  useEffect(() => {
    const checkAccess = async () => {
      try {
        console.log('🔍 AdminProtector: Checking access');
        
        // اگر اطلاعات کاربر موجود نیست، آن را دریافت کنیم
        if (!user && isAuthenticated) {
          console.log('🔍 AdminProtector: No user data, fetching...');
          await fetchUserData();
          return;
        }
        
        // بررسی نوع کاربر
        const isAdmin = user && user.user_type === 'AD';
        console.log('🔍 AdminProtector: User type check', { 
          userType: user?.user_type,
          isAdmin 
        });
        
        // اگر کاربر ادمین نیست، به صفحه 404 هدایت کنیم
        if (user && !isAdmin) {
          console.log('🔍 AdminProtector: Not admin, showing 404');
          notFound();
        }
      } catch (error) {
        console.error('🔍 AdminProtector: Error checking access', error);
        // در صورت خطا هم صفحه 404 نمایش داده شود
        notFound();
      } finally {
        setIsChecking(false);
      }
    };

    // اجرای بررسی دسترسی
    checkAccess();
  }, [user, isAuthenticated, fetchUserData]);

  // نمایش loading در حین بررسی
  if (loading || isChecking) {
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

  // اگر دسترسی دارد، محتوا را نمایش بده
  return <>{children}</>;
};

export default AdminProtector; 
