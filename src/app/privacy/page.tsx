'use client';

import React from 'react';
import { Container } from '@mui/material';
import PrivacyContent from '@/components/privacy/PrivacyContent';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
    return (
        <>
            <Container maxWidth="md" sx={{ py: 5 }}>
                <PrivacyContent />
            </Container>
            <Footer />
        </>
    );
} 