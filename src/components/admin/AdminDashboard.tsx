'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  useTheme
} from '@mui/material';

// Import admin components
import { 
  AdminStats, 
} from './components';
import { 
  UsersManagement,
  CompaniesManagement,
  JobsManagement,
  ApplicationsManagement,
  PaymentsManagement,
  SubscriptionsManagement,
  SubscriptionPlansManagement,
  IndustriesManagement,
  EmployerVerificationManagement
} from './management';

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const theme = useTheme();

  const sections = useMemo(() => ({
    dashboard: { component: <AdminStats />, title: 'داشبورد' },
    users: { component: <UsersManagement />, title: 'مدیریت کاربران' },
    companies: { component: <CompaniesManagement />, title: 'مدیریت شرکت‌ها' },
    'employer-verification': { component: <EmployerVerificationManagement />, title: 'تایید کارفرمایان' },
    industries: { component: <IndustriesManagement />, title: 'مدیریت گروه‌های کاری' },
    jobs: { component: <JobsManagement />, title: 'مدیریت آگهی‌ها' },
    applications: { component: <ApplicationsManagement />, title: 'مدیریت درخواست‌ها' },
    payments: { component: <PaymentsManagement />, title: 'مدیریت پرداخت‌ها' },
    subscriptions: { component: <SubscriptionsManagement />, title: 'مدیریت اشتراک‌ها' },
    'subscription-plans': { component: <SubscriptionPlansManagement />, title: 'مدیریت طرح‌های اشتراک' },
  }), []);

  // پردازش hash برای نمایش بخش مناسب
  useEffect(() => {
    const handleHashChange = () => {
      // بررسی وجود window
      if (typeof window === 'undefined') return;
      
      // حذف # از ابتدای hash
      const hash = window.location.hash.replace('#', '');
      
      // جدا کردن بخش اصلی از پارامترهای جستجو
      const basePath = hash.split('?')[0];
      
      // اگر hash وجود دارد و بخش مربوطه در sections موجود است
      if (basePath && sections[basePath as keyof typeof sections]) {
        setActiveSection(basePath);
      } else if (!hash) {
        // اگر hash وجود ندارد، نمایش داشبورد
        setActiveSection('dashboard');
      }
    };

    // اجرای اولیه برای تنظیم بخش فعال بر اساس hash اولیه
    // فقط در client-side اجرا شود
    if (typeof window !== 'undefined') {
      handleHashChange();

      // اضافه کردن event listener برای تغییرات hash
      window.addEventListener('hashchange', handleHashChange);
      
      // پاکسازی event listener
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    }
  }, [sections]);

  // انتخاب بخش فعال یا بازگشت به داشبورد در صورت نامعتبر بودن
  const currentSection = sections[activeSection as keyof typeof sections] || sections.dashboard;

  return (
    <Box sx={{ p: 3 }}>
      {/* محتوای بخش فعال - تنظیم LTR برای محتوای داینامیک */}
      <Box sx={{ 
        direction: 'ltr',
        '& .MuiTable-root': {
          direction: 'ltr'
        },
        '& .MuiTableCell-root': {
          textAlign: 'left'
        }
      }}>
        {currentSection.component}
      </Box>
    </Box>
  );
};

export default AdminDashboard;