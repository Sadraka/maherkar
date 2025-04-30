'use client';

import { Container } from '@mui/material';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <ForgotPasswordForm />
        </Container>
    );
} 