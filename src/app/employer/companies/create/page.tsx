'use client';

import React from 'react';
import { Container } from '@mui/material';
import CreateCompanyForm from '@/components/employer/companies/CreateCompanyForm';

/**
 * صفحه ثبت شرکت جدید برای کارفرمایان
 */
export default function CreateCompanyPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <CreateCompanyForm />
    </Container>
  );
} 