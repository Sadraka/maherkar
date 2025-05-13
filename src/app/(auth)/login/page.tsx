'use client';

import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // اگر کاربر قبلاً احراز هویت شده باشد، به صفحه اصلی هدایت شود
    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, loading, router]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: isMobile ? '100vh' : 'auto',
                p: 0,
                backgroundColor: isMobile ? theme.palette.background.default : 'transparent'
            }}
        >
            <Container 
                maxWidth="sm" 
                sx={{ 
                    py: isMobile ? 0 : 8,
                    px: isMobile ? 0 : 2,
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: isMobile ? 1 : 0
                }}
                disableGutters={isMobile}
            >
            <LoginForm />
        </Container>
        </Box>
    );
} 