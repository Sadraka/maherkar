'use client';

import React from 'react';
import { Container } from '@mui/material';
import ExperiencesForm from '@/components/jobseeker/resume/ExperiencesForm';

/**
 * صفحه تجربیات کاری کارجو
 */
export default function ExperiencesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <ExperiencesForm />
    </Container>
  );
}
