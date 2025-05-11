'use client';

import { Container } from '@mui/material';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    // اگر کاربر قبلاً احراز هویت شده باشد، به صفحه اصلی هدایت شود
    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, loading, router]);

    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <LoginForm />
        </Container>
    );
} 