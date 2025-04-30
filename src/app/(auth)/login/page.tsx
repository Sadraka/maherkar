'use client';

import { Container } from '@mui/material';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <LoginForm />
        </Container>
    );
} 