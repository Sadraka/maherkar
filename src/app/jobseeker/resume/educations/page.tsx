'use client';

import React from 'react';
import { Container } from '@mui/material';
import EducationForm from '@/components/jobseeker/resume/EducationForm';

/**
 * صفحه تحصیلات کارجو
 */
export default function EducationsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <EducationForm />
    </Container>
  );
}
