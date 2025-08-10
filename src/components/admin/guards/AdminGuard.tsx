'use client';

import { notFound } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  
  // اگر کاربر لاگین نکرده یا اطلاعات کاربر هنوز بارگذاری نشده، صفحه 404 نمایش دهیم
  if (!isAuthenticated || !user) {
    notFound();
    return null;
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

export default AdminGuard;