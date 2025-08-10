'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * کامپوننت مدیریت وضعیت احراز هویت
 * این کامپوننت در هنگام لود اولیه برنامه، وضعیت احراز هویت را بررسی می‌کند
 * و اطلاعات کاربر را از API دریافت می‌کند.
 * 
 * مزیت استفاده از این کامپوننت:
 * 1. مدیریت متمرکز احراز هویت
 * 2. جلوگیری از فراخوانی‌های مکرر API
 * 3. کاهش اثر waterfall در فراخوانی‌های API
 */
export default function AuthInitializer() {
    const fetchUserData = useAuthStore(state => state.fetchUserData);

    useEffect(() => {
        // بررسی آیا اولین بار لود صفحه است
        const isFirstLoad = sessionStorage.getItem('auth_initialized') !== 'true';
        
        console.log('[AuthInitializer] راه‌اندازی کامپوننت، وضعیت اولین لود:', isFirstLoad);
        
        // در هنگام لود اولیه برنامه، وضعیت احراز هویت را بررسی می‌کنیم
        if (isFirstLoad) {
            sessionStorage.setItem('auth_initialized', 'true');
            console.log('[AuthInitializer] دریافت اطلاعات کاربر در لود اولیه');
            
            // اطلاعات کاربر را از API دریافت می‌کنیم، نه از کوکی
            fetchUserData();
        }

        // تنظیم یک interval برای به‌روزرسانی دوره‌ای اطلاعات کاربر
        // این کار از منقضی شدن توکن جلوگیری می‌کند
        const tokenRefreshInterval = setInterval(() => {
            console.log('[AuthInitializer] بررسی دوره‌ای وضعیت توکن و دریافت اطلاعات کاربر');
            fetchUserData();
        }, 15 * 60 * 1000); // هر ۱۵ دقیقه
        
        // تعریف یک event listener برای رویدادهای storage
        // این برای همگام‌سازی بین تب‌های مرورگر مفید است
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'auth_logout') {
                console.log('[AuthInitializer] رویداد خروج از سیستم شناسایی شد');
                fetchUserData();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            clearInterval(tokenRefreshInterval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [fetchUserData]);

    // این کامپوننت هیچ UI خاصی ندارد و فقط برای مدیریت وضعیت احراز هویت استفاده می‌شود
    return null;
} 
