'use client'

import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthStore } from '@/store/authStore'

interface ContentWrapperProps {
  children: React.ReactNode
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');
  const isVerificationPage = pathname?.includes('/verification/complete');
  
  const { user, isAuthenticated } = useAuth();
  const loading = useAuthStore((state) => state.loading);

  const [promoBarHeight, setPromoBarHeight] = useState(0);

  // اندازه‌گیری ارتفاع PromoBar
  useEffect(() => {
    const promoBarElement = document.querySelector('[data-testid="promo-bar"]') as HTMLElement;
    if (promoBarElement) {
      const height = promoBarElement.offsetHeight;
      setPromoBarHeight(height);
    } else {
      // اگر PromoBar وجود نداره، ارتفاع رو صفر کن
      setPromoBarHeight(0);
    }

    // Observer برای تشخیص تغییرات در DOM
    const observer = new MutationObserver(() => {
      const promoBar = document.querySelector('[data-testid="promo-bar"]') as HTMLElement;
      if (promoBar) {
        setPromoBarHeight(promoBar.offsetHeight);
      } else {
        setPromoBarHeight(0);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [isAuthenticated, user?.user_type]);

  // محاسبه ارتفاع مناسب برای padding-top
  const calculateTopPadding = () => {
    // اگر در صفحه لاگین یا تایید هستیم، پدینگ نداشته باشیم
    if (isAuthPage || isVerificationPage) return 0;

    // اگر هنوز در حال بارگذاری هستیم، فقط هدر رو در نظر بگیریم
    if (loading) return '64px'; // ارتفاع هدر

    // محاسبه بر اساس وضعیت کاربر
    const shouldShowPromoBar = () => {
      // اگر کاربر لاگین نکرده، پرومو بار نمایش داده می‌شه
      if (!isAuthenticated) return true;
      
      // اگر کاربر لاگین کرده، فقط کارفرماها پرومو بار رو می‌بینن
      return user?.user_type === 'EM';
    };

    const hasPromoBar = shouldShowPromoBar();
    
    // اگر پرومو بار هست: 64px (هدر) + ارتفاع واقعی پرومو بار
    // اگر پرومو بار نیست: 64px (فقط هدر)
    const headerHeight = 64; // ارتفاع استاندارد AppBar
    return hasPromoBar ? `${headerHeight + promoBarHeight}px` : `${headerHeight}px`;
  };

  return (
    <Box sx={{ 
      pt: calculateTopPadding(),
      position: 'relative',
      transition: 'padding-top 0.3s ease' // انیمیشن روان برای تغییر padding
    }}>
      {children}
    </Box>
  );
}