'use client';

import React from 'react';
import { Container } from '@mui/material';
import SkillsForm from '@/components/jobseeker/resume/SkillsForm';

/**
 * صفحه مهارت‌های کارجو
 */
export default function SkillsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <SkillsForm />
    </Container>
  );
}
