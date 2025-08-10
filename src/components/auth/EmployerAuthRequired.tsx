'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useAuth, useAuthStore, useAuthActions } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress, Typography, Backdrop, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import authService from '@/lib/authService';
import cookieService, { COOKIE_NAMES } from '@/lib/cookieService';
import { apiGet } from '@/lib/axios';
import EmployerVerificationModal from '@/components/employer/verification/EmployerVerificationModal';

interface EmployerAuthRequiredProps {
    children: ReactNode;
    redirectTo?: string;
}

// تعریف interface برای وضعیت تایید کارفرما
interface EmployerVerificationStatus {
    verification_status: 'P' | 'A' | 'R'; // PENDING, APPROVED, REJECTED
    has_complete_documents: boolean;
    verification_date?: string;
    admin_notes?: string;
}

/**
 * کامپوننت محافظ برای صفحات مخصوص کارفرمایان
 * این کامپوننت علاوه بر بررسی احراز هویت، نوع کاربر را نیز بررسی می‌کند
 */
export default function EmployerAuthRequired({ children, redirectTo = '/login' }: EmployerAuthRequiredProps) {
    const { isAuthenticated, user } = useAuth();
    const loading = useAuthStore((state) => state.loading);
    const { refreshUserData } = useAuthActions();
    const router = useRouter();
    const pathname = usePathname();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState<EmployerVerificationStatus | null>(null);
    const [isCheckingVerification, setIsCheckingVerification] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    
    // وضعیت اولیه توکن را بررسی می‌کنیم تا از ریدایرکت نادرست جلوگیری شود
    const [hasInitialToken] = useState(() => {
        // در سمت کلاینت بررسی می‌کنیم که آیا توکن وجود دارد یا خیر
        if (typeof window !== 'undefined') {
            return !!cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
        }
        return false;
    });

    // تابع بررسی وضعیت تایید کارفرما
    const checkEmployerVerification = async () => {
        if (!user || user.user_type !== 'EM') return;
        
        setIsCheckingVerification(true);
        try {
            const response = await apiGet('/profiles/employers/');
            const profileData = response.data as any; // Type assertion for API response
            
            setVerificationStatus({
                verification_status: profileData.verification_status,
                has_complete_documents: profileData.has_complete_documents,
                verification_date: profileData.verification_date,
                admin_notes: profileData.admin_notes
            });
        } catch (error) {
            console.error('خطا در دریافت وضعیت تایید کارفرما:', error);
        } finally {
            setIsCheckingVerification(false);
        }
    };

    useEffect(() => {
        // تابع بررسی وضعیت احراز هویت
        const checkAuth = async () => {
            setIsCheckingAuth(true);
            
            // بررسی وجود توکن در کوکی
            const hasToken = !!authService.getAccessToken();
            
            if (hasToken) {
                // اگر توکن وجود داشته باشد، اطلاعات کاربر را به‌روزرسانی می‌کنیم
                try {
                    await refreshUserData();
                } catch (error) {
                    console.error("خطا در بررسی وضعیت احراز هویت:", error);
                }
            }
            
            setIsCheckingAuth(false);
        };
        
        // فراخوانی تابع بررسی وضعیت احراز هویت
        checkAuth();
    }, [refreshUserData]);

    // بررسی وضعیت تایید کارفرما پس از احراز هویت
    useEffect(() => {
        if (!loading && isAuthenticated && user && user.user_type === 'EM') {
            checkEmployerVerification();
        }
    }, [loading, isAuthenticated, user]);

    // تابع مدیریت بستن Modal
    const handleCloseModal = () => {
        setShowVerificationModal(false);
    };

    // تابع مدیریت موفقیت تایید
    const handleVerificationSuccess = () => {
        setShowVerificationModal(false);
        // بروزرسانی وضعیت تایید
        checkEmployerVerification();
    };

    // هنگام نمایش مودال احراز هویت در پنل کارفرما، هدر و پروموبار را فقط در موبایل مخفی کن
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    useEffect(() => {
      if (typeof window === 'undefined') return;
      const headerEl = document.querySelector('[data-testid="main-header"]') as HTMLElement | null;
      const promoEl = document.querySelector('[data-testid="promo-bar"]') as HTMLElement | null;
      const spacerEl = promoEl?.previousElementSibling as HTMLElement | null; // باکس فاصله بالای promo bar

      if (showVerificationModal) {
        // در هر دو حالت: هدر نمایش داده شود، فقط پروموبار بسته شود و فاصله‌اش صفر گردد
        if (headerEl) headerEl.style.display = '';
        if (promoEl) promoEl.style.display = 'none';
        if (spacerEl) spacerEl.style.height = '0px';
        try { window.dispatchEvent(new CustomEvent('promoBarClosed')); } catch { /* ignore */ }
      } else {
        // بازگردانی حالت عادی
        if (headerEl) headerEl.style.display = '';
        if (promoEl) promoEl.style.display = '';
        if (spacerEl) spacerEl.style.height = '';
        try { window.dispatchEvent(new CustomEvent('promoBarLoaded')); } catch { /* ignore */ }
      }

      return () => {
        if (headerEl) headerEl.style.display = '';
        if (promoEl) promoEl.style.display = '';
        if (spacerEl) spacerEl.style.height = '';
      };
    }, [showVerificationModal]);

    useEffect(() => {
        // فقط زمانی که بررسی اولیه احراز هویت تمام شده باشد، تصمیم‌گیری می‌کنیم
        if (!isCheckingAuth) {
            // اگر کاربر احراز هویت نشده است و در ابتدا هم توکنی نداشته
            if (!loading && !isAuthenticated && !hasInitialToken) {
                router.push(redirectTo);
                return;
            }

            // اگر کاربر احراز هویت شده اما نوع کاربری آن کارفرما نیست
            if (!loading && isAuthenticated && user && user.user_type !== 'EM' ) {
                console.log('دسترسی رد شد: کاربر با نوع', user.user_type, 'مجاز به ورود به پنل کارفرما نیست.');
                router.push('/');
                return;
            }

            // اگر کاربر کارفرما است اما وضعیت تایید مشخص نیست، منتظر بمان
            if (!loading && isAuthenticated && user && user.user_type === 'EM' && verificationStatus === null && !isCheckingVerification) {
                return;
            }

            // اگر کاربر کارفرما است و وضعیت تایید مشخص شده
            if (!loading && isAuthenticated && user && user.user_type === 'EM' && verificationStatus) {
                // هر وضعیت به جز APPROVED → فقط داشبورد با مودال
                if (verificationStatus.verification_status !== 'A') {
                    setShowVerificationModal(true);
                    if (pathname !== '/employer/dashboard') {
                        router.replace('/employer/dashboard');
                    }
                    return;
                }
            }
        }
    }, [isAuthenticated, loading, router, redirectTo, user, isCheckingAuth, hasInitialToken, verificationStatus, isCheckingVerification, pathname]);

    // نمایش لودینگ در حین بررسی وضعیت
    if (loading || isCheckingAuth || isCheckingVerification) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '50vh',
                    gap: 2
                }}
            >
                <CircularProgress size={40} />
                <Typography>
                    {loading || isCheckingAuth ? 'در حال بررسی وضعیت دسترسی...' : 'در حال بررسی وضعیت تایید...'}
                </Typography>
            </Box>
        );
    }

    // اگر کاربر احراز هویت شده، کارفرما است و تایید شده
    if (!loading && isAuthenticated && user && user.user_type === 'EM' && 
        verificationStatus && verificationStatus.verification_status === 'A') {
        return <>{children}</>;
    }

    // اگر کاربر کارفرما است اما تایید نشده، نمایش children با Modal
    if (!loading && isAuthenticated && user && user.user_type === 'EM' && showVerificationModal) {
        return (
            <>
                {/* نمایش محتوای اصلی با حالت مات و غیرفعال (بدون Backdrop سراسری) */}
                <Box 
                    sx={{ 
                        filter: 'blur(2px)', 
                        pointerEvents: 'none',
                        opacity: 0.85,
                        position: 'relative'
                    }}
                >
                    {children}
                    {/* لایه تیره کم‌رنگ روی محتوای داخلی */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(0,0,0,0.35)',
                        zIndex: 1,
                        pointerEvents: 'none'
                      }}
                    />
                </Box>

                {/* Modal تایید هویت */}
                <EmployerVerificationModal
                    open={showVerificationModal}
                    onClose={handleCloseModal}
                    onSuccess={handleVerificationSuccess}
                />
            </>
        );
    }

    // در حالت پیش‌فرض، صفحه خالی نمایش داده می‌شود (کاربر به صفحه مناسب هدایت می‌شود)
    return null;
} 