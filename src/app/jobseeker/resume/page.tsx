'use client';

import React from 'react';
import { Container } from '@mui/material';
import PersonalInfoForm from '@/components/jobseeker/resume/PersonalInfoForm';

/**
 * صفحه اطلاعات شخصی کارجو
 */
export default function PersonalInfoPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <PersonalInfoForm />
    </Container>
  );
}
