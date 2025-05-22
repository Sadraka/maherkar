'use client';

import RegisterForm from '@/components/auth/RegisterForm';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // اگر کاربر قبلاً احراز هویت شده باشد، به صفحه اصلی هدایت شود
    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, loading, router]);

    // کامپوننت‌های استایل و منطق به RegisterForm منتقل شده‌اند
    return <RegisterForm />;
} 