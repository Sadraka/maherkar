'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useAuth, useAuthStore, useAuthActions } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import authService from '@/lib/authService';
import cookieService, { COOKIE_NAMES } from '@/lib/cookieService';

interface EmployerAuthRequiredProps {
    children: ReactNode;
    redirectTo?: string;
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
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    // وضعیت اولیه توکن را بررسی می‌کنیم تا از ریدایرکت نادرست جلوگیری شود
    const [hasInitialToken] = useState(() => {
        // در سمت کلاینت بررسی می‌کنیم که آیا توکن وجود دارد یا خیر
        if (typeof window !== 'undefined') {
            return !!cookieService.getCookie(COOKIE_NAMES.ACCESS_TOKEN);
        }
        return false;
    });

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

    useEffect(() => {
        // فقط زمانی که بررسی اولیه احراز هویت تمام شده باشد، تصمیم‌گیری می‌کنیم
        if (!isCheckingAuth) {
            // اگر کاربر احراز هویت نشده است و در ابتدا هم توکنی نداشته
            if (!loading && !isAuthenticated && !hasInitialToken) {
                router.push(redirectTo);
                return;
            }

            // اگر کاربر احراز هویت شده اما نوع کاربری آن کارفرما نیست
            if (!loading && isAuthenticated && user && user.user_type !== 'employer' && user.user_type !== 'admin') {
                console.log('دسترسی رد شد: کاربر با نوع', user.user_type, 'مجاز به ورود به پنل کارفرما نیست.');
                router.push('/');
            }
        }
    }, [isAuthenticated, loading, router, redirectTo, user, isCheckingAuth, hasInitialToken]);

    // نمایش لودینگ در حین بررسی وضعیت
    if (loading || isCheckingAuth) {
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
                <Typography>در حال بررسی وضعیت دسترسی...</Typography>
            </Box>
        );
    }

    // اگر کاربر احراز هویت شده و نوع کاربری آن کارفرما است
    if (!loading && isAuthenticated && user && (user.user_type === 'employer' || user.user_type === 'admin')) {
        return <>{children}</>;
    }

    // در حالت پیش‌فرض، صفحه خالی نمایش داده می‌شود (کاربر به صفحه دیگری هدایت می‌شود)
    return null;
} 