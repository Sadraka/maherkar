'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * کامپوننت AuthInitializer
 * 
 * این کامپوننت مسئولیت بررسی وضعیت احراز هویت کاربر در زمان بارگذاری اولیه برنامه را بر عهده دارد.
 * با قرار دادن این کامپوننت در layout اصلی، می‌توانیم از فراخوانی‌های متعدد و تکراری fetchUserData
 * در کامپوننت‌های مختلف جلوگیری کنیم و حلقه‌های بی‌نهایت را کاهش دهیم.
 */
export default function AuthInitializer() {
  // استفاده مستقیم از توابع store به جای hook های جداگانه
  const fetchUserData = useAuthStore((state) => state.fetchUserData);

  useEffect(() => {
    // آیا این اولین بار است که صفحه بارگذاری می‌شود؟
    const isFirstLoad = !(window as any)._authInitialized;
    
    if (isFirstLoad) {
      // فقط یک بار در زمان بارگذاری اولیه، وضعیت احراز هویت را بررسی می‌کنیم
      const initAuth = async () => {
        try {
          console.log('[AuthInitializer] شروع بارگذاری اطلاعات کاربر...');
          
          // ثبت زمان فراخوانی برای جلوگیری از حلقه‌های بی‌نهایت
          (window as any)._lastUserDataFetch = Date.now();
          
          await fetchUserData();
          console.log('[AuthInitializer] اطلاعات کاربر با موفقیت بارگذاری شد');
        } catch (error) {
          console.error('[AuthInitializer] خطا در بارگذاری اطلاعات کاربر:', error);
        } finally {
          // علامت‌گذاری که مقداردهی اولیه انجام شده است
          (window as any)._authInitialized = true;
        }
      };
      
      // اجرای با تأخیر برای اطمینان از اینکه DOM کاملاً آماده است
      setTimeout(initAuth, 100);
    }
  }, [fetchUserData]);

  // این کامپوننت هیچ چیزی رندر نمی‌کند
  return null;
} 