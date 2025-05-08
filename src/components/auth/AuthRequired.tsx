'use client';

import React, { useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AuthRequiredProps {
    children: ReactNode;
    redirectTo?: string;
}

export default function AuthRequired({ children, redirectTo = '/login' }: AuthRequiredProps) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // اگر بارگذاری تمام شده و کاربر احراز هویت نشده است
        if (!loading && !isAuthenticated) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, loading, router, redirectTo]);

    // نمایش لودینگ در حین بررسی وضعیت احراز هویت
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
                <Typography>در حال بررسی وضعیت ورود...</Typography>
            </Box>
        );
    }

    // اگر بارگذاری تمام شده و کاربر احراز هویت شده است
    if (!loading && isAuthenticated) {
        return <>{children}</>;
    }

    // در حالت پیش‌فرض، صفحه خالی نمایش داده می‌شود
    // (این کد معمولاً اجرا نمی‌شود، زیرا در صورت عدم احراز هویت، کاربر به صفحه ورود هدایت می‌شود)
    return null;
} 