'use client';

import React, { useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

interface EmployerAuthRequiredProps {
    children: ReactNode;
    redirectTo?: string;
}

// تابع تبدیل کننده نوع کاربر از فرمت بک‌اند به فرمت فرانت‌اند
const mapUserType = (userType: string | undefined): string => {
    // اگر نوع کاربر 'EM' باشد، آن را به 'employer' تبدیل می‌کند
    if (userType === 'EM') return 'employer';
    // در غیر این صورت مقدار اصلی را برمی‌گرداند
    return userType || '';
};

/**
 * کامپوننت محافظ برای صفحات مخصوص کارفرمایان
 * این کامپوننت علاوه بر بررسی احراز هویت، نوع کاربر را نیز بررسی می‌کند
 */
export default function EmployerAuthRequired({ children, redirectTo = '/login' }: EmployerAuthRequiredProps) {
    const { isAuthenticated, loading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // اگر کاربر احراز هویت نشده است
        if (!loading && !isAuthenticated) {
            router.push(redirectTo);
            return;
        }

        // اگر کاربر احراز هویت شده اما نوع کاربری آن کارفرما نیست
        const userType = mapUserType(user?.user_type);
        if (!loading && isAuthenticated && user && userType !== 'employer' && userType !== 'admin') {
            console.log('دسترسی رد شد: کاربر با نوع', user.user_type, 'در بک‌اند به', userType, 'در فرانت‌اند نگاشت شد. مجاز به ورود به پنل کارفرما نیست.');
            router.push('/');
        }
    }, [isAuthenticated, loading, router, redirectTo, user]);

    // نمایش لودینگ در حین بررسی وضعیت
    if (loading) {
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
    const userType = mapUserType(user?.user_type);
    if (!loading && isAuthenticated && user && (userType === 'employer' || userType === 'admin')) {
        return <>{children}</>;
    }

    // در حالت پیش‌فرض، صفحه خالی نمایش داده می‌شود (کاربر به صفحه دیگری هدایت می‌شود)
    return null;
} 