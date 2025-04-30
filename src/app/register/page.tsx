'use client';

import { Container } from '@mui/material';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
    return (
        <Container maxWidth="sm" sx={{ py: 8 }}>
            <RegisterForm />
        </Container>
    );
} 