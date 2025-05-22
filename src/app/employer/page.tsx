"use client";

import React from 'react';
import { redirect } from 'next/navigation';
import EmployerAuthRequired from '@/components/auth/EmployerAuthRequired';
import { useAuth } from '@/store/authStore';

export default function EmployerPage() {
  const { isAuthenticated, user } = useAuth();

  // هدایت به صفحه داشبورد کارفرما اگر کاربر احراز هویت شده باشد
  if (isAuthenticated && user && (user.user_type === 'employer' || user.user_type === 'admin')) {
    redirect('/employer/dashboard');
  }

  // در صورت عدم احراز هویت یا نوع کاربری نامناسب، محافظ EmployerAuthRequired کاربر را به صفحه مناسب هدایت می‌کند
  return (
    <EmployerAuthRequired>
      <div>در حال انتقال به داشبورد کارفرما...</div>
    </EmployerAuthRequired>
  );
} 