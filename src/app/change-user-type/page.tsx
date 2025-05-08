'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import ChangeUserType from '@/components/profile/ChangeUserType';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AuthRequired from '@/components/auth/AuthRequired';

export default function ChangeUserTypePage() {
    const { user } = useAuth();
    const router = useRouter();

    const handleSuccess = () => {
        // پس از تغییر موفقیت‌آمیز، کاربر به صفحه پروفایل هدایت می‌شود
        router.push('/profile');
    };

    return (
        <AuthRequired>
            <Container maxWidth="md" sx={{ py: 5 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: 'bold' }}
                    >
                        مدیریت نوع کاربری
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        align="center"
                    >
                        نوع کاربری فعلی شما: {user?.user_type === 'JS' ? 'کارجو' : 'کارفرما'}
                    </Typography>
                </Box>

                <ChangeUserType onSuccess={handleSuccess} />
            </Container>
        </AuthRequired>
    );
} 