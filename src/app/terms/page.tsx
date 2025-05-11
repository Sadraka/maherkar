'use client';

import React from 'react';
import { Container } from '@mui/material';
import TermsContent from '@/components/terms/TermsContent';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
    return (
        <>
            <Container maxWidth="md" sx={{ py: 5 }}>
                <TermsContent />
            </Container>
            <Footer />
        </>
    );
} 